import fs from 'node:fs';
import path from 'node:path';
import fg from 'fast-glob';
import matter from 'gray-matter';

// 대상 디렉토리 설정
const PROJECT_ROOT = process.cwd();
const OUTPUT_POSTS_DIR = path.join(PROJECT_ROOT, 'src', 'content', 'blog');
const OUTPUT_IMAGES_DIR = path.join(PROJECT_ROOT, 'public', 'images', 'uploads', 'velog');

// 입력 백업 디렉토리 후보군 자동 탐색
const CANDIDATE_INPUT_DIRS = [
  path.join(PROJECT_ROOT, 'velog-backup-input'),
  path.join(PROJECT_ROOT, 'velog-backup', 'backup'),
  path.join(PROJECT_ROOT, 'backup'),
];

function findInputSource() {
  for (const dir of CANDIDATE_INPUT_DIRS) {
    if (fs.existsSync(dir)) {
      const contentDir = fs.existsSync(path.join(dir, 'content'))
        ? path.join(dir, 'content')
        : fs.existsSync(path.join(dir, 'posts'))
        ? path.join(dir, 'posts')
        : dir;

      const imagesDir = path.join(dir, 'images');
      const mdFiles = fg.sync('**/*.md', { cwd: contentDir });

      if (mdFiles.length > 0) {
        return {
          rootDir: dir,
          contentDir,
          imagesDir: fs.existsSync(imagesDir) ? imagesDir : null,
          files: mdFiles,
        };
      }
    }
  }
  return null;
}

// 마크다운/HTML 문법을 제거하고 순수 텍스트 요약(140자) 추출
function extractDescription(markdownBody) {
  if (!markdownBody) return '';
  const plainText = markdownBody
    .replace(/```[\s\S]*?```/g, '') // 코드 블록 제거
    .replace(/!\[.*?\]\(.*?\)/g, '') // 이미지 제거
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // 링크 텍스트만 유지
    .replace(/<[^>]+>/g, '') // HTML 태그 제거
    .replace(/[#*`~_>\-]/g, ' ') // 마크다운 기호 제거
    .replace(/\s+/g, ' ') // 공백 정규화
    .trim();

  return plainText.length > 140 ? plainText.slice(0, 137) + '...' : plainText;
}

// 본문 내 첫 번째 이미지 URL 추출 (마크다운 또는 HTML img)
function extractFirstImage(markdownBody) {
  if (!markdownBody) return null;
  const mdImgMatch = markdownBody.match(/!\[.*?\]\((.*?)(?:\s+".*?")?\)/);
  if (mdImgMatch && mdImgMatch[1]) {
    return mdImgMatch[1].trim();
  }
  const htmlImgMatch = markdownBody.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (htmlImgMatch && htmlImgMatch[1]) {
    return htmlImgMatch[1].trim();
  }
  return null;
}

// 안전한 파일명(Slug) 생성
function sanitizeSlug(filename) {
  const base = path.basename(filename, path.extname(filename));
  const safe = base
    .replace(/[[\](){}]/g, '') // 대괄호 및 괄호 제거
    .replace(/[\\/:*?"<>|#%&*?/$!'":@+`|=]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  return safe || 'untitled';
}

async function runMigration() {
  console.log('🚀 [velog-backup] 데이터 마이그레이션을 시작합니다...\n');

  const source = findInputSource();

  if (!source) {
    console.warn('⚠️  백업 데이터 폴더를 찾을 수 없습니다.');
    console.log('   `velog-backup-input/` 또는 `velog-backup/backup/` 폴더에 백업 데이터를 넣어주세요.');
    console.log('   예시 구조:');
    console.log('   velog-backup-input/');
    console.log('     ├── content/ (마크다운 .md 파일들)');
    console.log('     └── images/  (이미지 파일들)\n');
    return;
  }

  console.log(`📁 백업 원본 감지: ${source.rootDir}`);
  console.log(`📄 발견된 마크다운 포스트: ${source.files.length}개\n`);

  // 1. 디렉토리 준비
  fs.mkdirSync(OUTPUT_POSTS_DIR, { recursive: true });
  fs.mkdirSync(OUTPUT_IMAGES_DIR, { recursive: true });

  // 2. 이미지 복사
  let copiedImagesCount = 0;
  if (source.imagesDir) {
    const imageFiles = fg.sync('**/*', { cwd: source.imagesDir, onlyFiles: true });
    console.log(`🖼️  이미지 복사 중 (${imageFiles.length}개)...`);
    for (const img of imageFiles) {
      const srcPath = path.join(source.imagesDir, img);
      const destPath = path.join(OUTPUT_IMAGES_DIR, img);
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.copyFileSync(srcPath, destPath);
      copiedImagesCount++;
    }
    console.log(`✅ ${copiedImagesCount}개 이미지 복사 완료 -> public/images/uploads/velog/\n`);
  }

  // 3. 마크다운 파일 변환 및 저장
  let convertedPostsCount = 0;
  let autoThumbnailsCount = 0;
  const usedSlugs = new Set();

  for (const relativePath of source.files) {
    const fullPath = path.join(source.contentDir, relativePath);
    const rawContent = fs.readFileSync(fullPath, 'utf8');

    // frontmatter 파싱
    let parsed;
    try {
      parsed = matter(rawContent);
    } catch (e) {
      console.error(`❌ Frontmatter 파싱 에러: ${relativePath}`, e);
      continue;
    }

    const data = { ...parsed.data };
    let body = parsed.content;

    // 본문 내 이미지 경로 치환: /images/xxx -> /programmiy.log/images/uploads/velog/xxx (이미 치환된 경우 제외)
    body = body.replace(/!\[([^\]]*)\]\((?:\.\/|\/)?(?:programmiy\.log\/)?images\/(?!uploads\/velog\/)([^)]+)\)/g, '![$1](/programmiy.log/images/uploads/velog/$2)');
    body = body.replace(/<img([^>]+)src=["'](?:\.\/|\/)?(?:programmiy\.log\/)?images\/(?!uploads\/velog\/)([^"']+)["']/gi, '<img$1src="/programmiy.log/images/uploads/velog/$2"');

    // 썸네일 경로도 동일하게 치환
    if (data.thumbnail && typeof data.thumbnail === 'string') {
      data.thumbnail = data.thumbnail.replace(/^(?:\.\/|\/)?(?:programmiy\.log\/)?images\/(?!uploads\/velog\/)/, '/programmiy.log/images/uploads/velog/');
    }

    // 썸네일 부재 시 본문 첫 이미지로 자동 설정
    if (!data.thumbnail) {
      const firstImg = extractFirstImage(body);
      if (firstImg) {
        data.thumbnail = firstImg;
        autoThumbnailsCount++;
      }
    }

    // 제목 정규화
    if (!data.title) {
      data.title = path.basename(relativePath, path.extname(relativePath));
    }

    // 설명문(description) 정규화
    if (!data.description || typeof data.description !== 'string' || data.description.trim() === '') {
      data.description = extractDescription(body);
    } else {
      data.description = data.description.replace(/\n/g, ' ').trim();
    }

    // 태그 정규화
    if (typeof data.tags === 'string') {
      data.tags = data.tags.split(',').map((t) => t.trim().replace(/^#/, '')).filter(Boolean);
    } else if (Array.isArray(data.tags)) {
      data.tags = data.tags.map((t) => String(t).trim().replace(/^#/, '')).filter(Boolean);
    } else {
      data.tags = [];
    }

    // 날짜 정규화
    if (data.date) {
      try {
        const d = new Date(data.date);
        if (!isNaN(d.getTime())) {
          data.date = d.toISOString();
        }
      } catch {}
    } else {
      data.date = new Date().toISOString();
    }

    // draft 기본값
    if (typeof data.draft !== 'boolean') {
      data.draft = false;
    }

    // 파일명 슬러그 생성 및 중복 방지
    let slug = sanitizeSlug(relativePath);
    let finalSlug = slug;
    let counter = 1;
    while (usedSlugs.has(finalSlug.toLowerCase())) {
      finalSlug = `${slug}-${counter}`;
      counter++;
    }
    usedSlugs.add(finalSlug.toLowerCase());

    const outputPath = path.join(OUTPUT_POSTS_DIR, `${finalSlug}.md`);
    const finalFileContent = matter.stringify(body, data);
    fs.writeFileSync(outputPath, finalFileContent, 'utf8');
    convertedPostsCount++;
  }

  console.log('🎉 ==========================================');
  console.log('🎉 마이그레이션이 성공적으로 완료되었습니다!');
  console.log(`📄 변환된 마크다운 포스트: ${convertedPostsCount}개 -> src/content/blog/`);
  console.log(`🖼️  복사된 이미지 파일: ${copiedImagesCount}개 -> public/images/uploads/velog/`);
  console.log(`✨ 본문 기반 자동 추출 썸네일: ${autoThumbnailsCount}개`);
  console.log('🎉 ==========================================\n');
}

runMigration().catch((err) => {
  console.error('❌ 마이그레이션 중 오류가 발생했습니다:', err);
  process.exit(1);
});

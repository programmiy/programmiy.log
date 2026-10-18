# 🚀 Velog-Style GitHub Pages Blog

> 기존 벨로그(Velog)의 UI/UX와 글/이미지 데이터를 그대로 계승하고, 브라우저 웹 글쓰기(Sveltia CMS) 환경과 GitHub Pages 자동 배포를 지원하는 정적 기술 블로그입니다.

---

## ✨ 핵심 기능

1. **벨로그 감성 UI/UX 완벽 재현**
   * 벨로그 시그니처 민트 포인트 컬러 (`#12B886`)
   * 깜빡임 없는 시스템 연동 다크/라이트 모드 지원
   * 개인 홈 레이아웃: 프로필 헤더, `[글] / [시리즈] / [소개]` 3개 탭, 좌측 태그 카운트 사이드바(모바일 가로 스크롤), 실시간 인라인 검색창
   * 상세 페이지: 책갈피 시리즈 박스, 우측 플로팅 Sticky 목차(TOC) 스크롤 스파이, Shiki 코드 하이라이트 + 언어 배지 + 원클릭 복사 버튼
   * 시리즈 모아보기 화면 (`/series`) 및 시리즈 상세 목록 (`/series/[series]`)
   * Giscus 기반 GitHub Discussions 댓글 위젯

2. **웹 에디터 환경 (Sveltia CMS 탑재)**
   * 브라우저에서 `/admin` 접속 시 터미널이나 Git 커밋 없이 바로 글 작성 가능
   * 좌우 분할 실시간 마크다운 프리뷰
   * 클립보드 이미지 붙여넣기(`Ctrl+V`) 지원
   * 출간 시 GitHub 레포지토리에 자동 커밋 및 GitHub Actions 자동 배포 연동

3. **원클릭 벨로그 데이터 마이그레이션 (`npm run migrate`)**
   * `velog-backup`으로 백업한 마크다운과 로컬 이미지를 단 한 번의 명령어로 새 블로그 규격(`src/content/blog/`, `public/images/uploads/velog/`)으로 자동 변환
   * 본문 첫 이미지 기반 썸네일 자동 추출
   * 본문 텍스트 기반 140자 설명(description) 자동 생성
   * 이미지 경로 자동 치환 (`/images/...` → `/images/uploads/velog/...`)

---

## 🛠️ 기술 스택

* **Framework:** [Astro v4](https://astro.build/) (Static Site Generation, TypeScript Strict)
* **Styling:** [Tailwind CSS v3](https://tailwindcss.com/) + `@tailwindcss/typography`
* **Fonts:** Pretendard (본문 및 UI), JetBrains Mono (코드 블록)
* **CMS:** [Sveltia CMS](https://github.com/sveltia/sveltia-cms)
* **Markdown Pipeline:** `rehype-raw` (벨로그 Raw HTML 태그 호환), `remark-gfm`, `remark-math`, `rehype-katex`, `rehype-slug`
* **Comments:** [Giscus](https://giscus.app/)
* **CI/CD:** GitHub Actions (`.github/workflows/deploy.yml`)

---

## 🚀 빠른 시작 가이드 (Quick Start)

### 1. 패키지 설치
```bash
npm install
```

### 2. 로컬 개발 서버 실행
```bash
npm run dev
# 브라우저에서 http://localhost:4321 접속
```

### 3. 벨로그 데이터 추가 백업 및 마이그레이션
```bash
# 1) velog-backup 실행 (새 글이 추가되었을 때)
cd velog-backup
node app.js -u <벨로그유저이름> -w
cd ..

# 2) 블로그에 데이터 자동 통합
npm run migrate
```

### 4. 정적 빌드 및 검증
```bash
npm run build
```

---

## ⚙️ 설정 커스터마이징

* **블로그 정보 및 프로필:** [`src/config.ts`](./src/config.ts)에서 닉네임, Bio, GitHub 주소 등을 변경할 수 있습니다.
* **Giscus 댓글 연동:** [giscus.app](https://giscus.app/)에서 레포지토리를 등록하고 발급받은 `repoId`, `categoryId`를 [`src/config.ts`](./src/config.ts)에 입력하면 댓글이 즉시 활성화됩니다.
* **웹 CMS 관리자 설정:** [`public/admin/config.yml`](./public/admin/config.yml)의 `repo: 사용자명/레포지토리명`을 본인의 GitHub 레포지토리로 지정하세요.

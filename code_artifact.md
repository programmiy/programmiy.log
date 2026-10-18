# Project Specification: Velog-Style GitHub Pages Blog (with Sveltia CMS & velog-backup Migration)

## 1. 프로젝트 개요 (Overview)
본 프로젝트는 기존 **벨로그(Velog)**에서 운영하던 개발 블로그를 **GitHub Pages**로 완벽히 이주하기 위한 정적 기술 블로그 구축 프로젝트이다.
핵심 목표는 다음 세 가지이다:
1. **벨로그 UI/UX 완벽 재현:** 개인 벨로그 홈, 태그 사이드바 필터, 시리즈 모아보기, 우측 플로팅 목차(TOC), 코드 블록 복사 버튼, 다크 모드, Giscus 댓글 연동.
2. **벨로그와 동일한 웹 글쓰기 환경(Method A):** 정적 사이트 어드민(`/admin`)에 **Sveltia CMS**를 탑재하여, 웹 브라우저에서 좌우 분할 마크다운 작성, 클립보드 이미지 붙여넣기(`Ctrl+V`), 임시저장 및 출간(Git 자동 커밋)을 수행.
3. **`velog-backup` 데이터 완벽 이주:** `velog-backup` 도구로 백업한 기존 마크다운(`.md`) 파일과 로컬 이미지 폴더를 손실 없이 새 블로그 스키마와 이미지 경로로 자동 변환·통합.

---

## 2. 기술 스택 (Tech Stack)
AI 에이전트는 아래의 기술 스택을 기준으로 프로젝트를 초기화하고 구성한다.

* **Framework:** Astro (최신 안정 버전, Static Site Generation 모드, TypeScript Strict)
  * *주의:* 기존 벨로그 마크다운의 순수 HTML 태그 호환성을 위해 `.mdx`가 아닌 표준 `.md` (Remark/Rehype 파이프라인)를 기본 포맷으로 사용한다.
* **Styling:** Tailwind CSS + `@tailwindcss/typography`
* **Font:** `Pretendard` (본문 및 UI), `JetBrains Mono` 또는 `Fira Code` (코드 블록)
* **Web Editor (Headless CMS):** **Sveltia CMS** (`/public/admin/` 경로에 정적 탑재)
* **Migration Utilities:** `gray-matter` (Frontmatter 파싱/조작), `fast-glob` (파일 탐색)
* **Comments:** **Giscus** (GitHub Discussions 기반 댓글 위젯)
* **Search:** **Pagefind** 또는 클라이언트 사이드 JSON 인덱스 검색 (제목, 요약, 태그, 본문 검색)
* **Deployment:** GitHub Actions를 통한 GitHub Pages 자동 빌드 및 배포

---

## 3. 핵심 기능 및 벨로그 UI/UX 복제 명세

### 3.1. 디자인 시스템 및 컬러 토큰
* **Primary Accent Color:** 벨로그 시그니처 민트 (`#12B886`, Hover: `#20C997`, Light Mint BG: `#E6FCF5`)
* **Light Mode:**
  * Background: `#F8F9FA` (서브 배경) / `#FFFFFF` (메인 및 카드 배경)
  * Text Primary: `#212529` / Text Secondary: `#495057` / Text Muted: `#868E96`
  * Border: `#E9ECEF`
* **Dark Mode (클래스 기반 토글 및 시스템 설정 연동):**
  * Background: `#121212` (메인 배경) / `#1E1E1E` (카드 및 엘리먼트 배경)
  * Text Primary: `#ECECEC` / Text Secondary: `#D9D9D9` / Text Muted: `#A0A0A0`
  * Border: `#2A2A2A`

### 3.2. 메인 홈 화면 (`/`) — 벨로그 개인 홈 레이아웃
1. **상단 프로필 영역 (User Header):**
   * 원형 프로필 이미지, 닉네임, 한 줄 소개(Bio), 소셜 아이콘 링크(GitHub, Email 등)
2. **네비게이션 탭:**
   * `[글]`, `[시리즈]`, `[소개]` 3개 탭으로 구성하며 활성화된 탭 하단에 민트색(`#12B886`) 인디케이터 바 표시
3. **좌측 태그 사이드바 (데스크톱) / 상단 가로 스크롤 태그 바 (모바일):**
   * `전체보기 (N)` 및 각 태그별 게시글 개수 `태그명 (N)` 목록 표시
   * 태그 클릭 시 해당 태그가 포함된 글만 즉시 필터링하거나 `/tags/[tag]` 경로로 라우팅
4. **본문 내 검색창:**
   * 포스트 목록 상단에 위치하며, 검색어 입력 시 제목·요약·태그를 기준으로 실시간 필터링
5. **게시글 리스트:**
   * 대표 썸네일 이미지(있을 경우 렌더링), 제목, 본문 요약(2~3줄 말줄임), 태그 배지 목록, 작성일 표시

### 3.3. 게시글 상세 화면 (`/posts/[slug]`)
1. **글 헤더:**
   * 대제목(`h1`), 작성일, 수정일, 태그 배지 목록
2. **시리즈 네비게이터 박스 (Series Box):**
   * 해당 글의 Frontmatter에 `series` 값이 존재할 경우 본문 상단(태그 아래)에 벨로그 스타일의 시리즈 박스 렌더링
   * 우측 상단 책갈피 아이콘, 시리즈 제목, `[목록 보기/숨기기]` 토글을 통한 시리즈 내 전체 글 순서 목록, 이전/다음 시리즈 글 이동 버튼 제공
3. **우측 플로팅 목차 (Floating Sticky TOC):**
   * 본문 우측 여백(`xl` 브레이크포인트 이상)에 `position: sticky`로 고정 (`border-left: 2px solid`)
   * 본문 내 `h1`, `h2`, `h3` 태그를 파싱하여 들여쓰기 계층 구조로 표시
   * `IntersectionObserver`를 사용해 현재 읽고 있는 섹션의 목차 항목을 민트색(`#12B886`) 및 약간 커진 스케일로 실시간 하이라이팅
4. **마크다운 본문 렌더링:**
   * **코드 블록:** Shiki 하이라이터 적용, 우측 상단에 **언어 표시 배지** 및 **[복사(Copy)] 버튼** 필수 구현
   * **인용구(`blockquote`):** 좌측 `4px solid #12B886` 테두리 및 연한 배경색(벨로그 스타일) 적용
   * **확장 문법:** GitHub Flavored Markdown(GFM) 표, 수식(KaTeX), 다이어그램(Mermaid), 본문 내 원시 HTML(`<br>`, `<p align="center">`, `<img>` 등) 허용 (`rehype-raw` 적용)
5. **글 하단 영역:**
   * 작성자 프로필 카드, `[이전 포스트]` / `[다음 포스트]` 네비게이션 카드, **Giscus 댓글창**(다크/라이트 모드 테마 실시간 동기화)

### 3.4. 시리즈 모아보기 화면 (`/series`)
* 작성된 글들의 `series` 메타데이터를 그룹핑하여 시리즈 카드 그리드 형태로 출력
* 각 시리즈 카드에는 시리즈명, 포함된 포스트 개수(`N개의 포스트`), 마지막 업데이트 날짜, 시리즈 내 첫 번째 글의 썸네일 표시
* 클릭 시 `/series/[series-slug]`로 이동하여 1편부터 순서대로 정렬된 포스트 목록 제공

---

## 4. 웹 글쓰기 시스템 명세 (Sveltia CMS 연동)

터미널이나 로컬 에디터 없이 웹 브라우저(`https://<username>.github.io/admin`)에서 벨로그처럼 글을 작성하고 출간할 수 있도록 구성한다.

### 4.1. 어드민 라우트 구성
* `public/admin/index.html`: Sveltia CMS 최신 번들 스크립트를 로드하는 엔트리 파일
  * `<script src="https://unpkg.com/@sveltia/cms/dist/sveltia-cms.js" type="module"></script>`
* `public/admin/config.yml`: 컬렉션 및 데이터 스키마 설정 파일

### 4.2. 통합 마크다운 Frontmatter 스키마 (`src/content/config.ts` & `config.yml` 공통)
`velog-backup`에서 넘어온 기존 글과 앞으로 Sveltia CMS 웹 에디터에서 새로 작성할 글 모두 아래의 단일 Frontmatter 스키마를 따른다.

```yaml
---
title: "포스트 제목"
description: "목록과 검색 엔진(SEO)에 노출될 짧은 요약글"
date: 2026-10-18T22:00:00+09:00
updatedDate: 2026-10-18T22:00:00+09:00 # 선택
thumbnail: "/images/uploads/sample.png" # 선택 (문자열 경로 또는 외부 URL 허용)
series: "시리즈 이름" # 선택 (입력 시 자동으로 시리즈로 묶임)
seriesOrder: 1 # 선택 (미입력 시 date 오름차순 자동 정렬)
tags:
  - React
  - TypeScript
draft: false # true일 경우 프로덕션 빌드에서 제외 (임시저장 기능)
velogUrl: "https://velog.io/@user/slug" # 선택 (velog-backup 원본 추적용 메타데이터)
---
```

### 4.3. Sveltia CMS `public/admin/config.yml` 필수 설정 사항
1. **Backend:** `name: github`, `repo: <사용자명>/<레포지토리명>`, `branch: main`
2. **Media Folder (웹 업로드 및 백업 이미지 통합 폴더):**
   * `media_folder: "public/images/uploads"`
   * `public_folder: "/images/uploads"`
3. **Collections (`blog`):**
   * `folder: "src/content/blog"`
   * `create: true`
   * `slug: "{{year}}-{{month}}-{{day}}-{{slug}}"`
   * Fields:
     * `title` (widget: `string`, required: `true`)
     * `description` (widget: `text`, required: `false`, default: `""`)
     * `date` (widget: `datetime`, required: `true`)
     * `thumbnail` (widget: `image`, required: `false`)
     * `series` (widget: `string`, required: `false`, hint: "같은 시리즈 이름을 입력하면 자동으로 시리즈로 묶입니다.")
     * `seriesOrder` (widget: `number`, required: `false`, value_type: `int`)
     * `tags` (widget: `list`, required: `false`, default: `[]`)
     * `draft` (widget: `boolean`, required: `false`, default: `false`)
     * `body` (widget: `markdown`, required: `true`)

---

## 5. `velog-backup` 데이터 이주(Migration) 파이프라인 명세

사용자가 `velog-backup` 패키지를 통해 추출한 백업 데이터를 손실 없이 블로그에 통합하기 위해, 전용 마이그레이션 스크립트(`scripts/migrate-velog.mjs`)와 폴더 구조를 반드시 구현한다.

### 5.1. `velog-backup` 원본 데이터 구조 이해
일반적으로 `velog-backup`을 실행하면 다음과 같은 구조의 결과물이 생성된다:
```text
velog-backup-input/          # 사용자가 백업본을 넣어둘 스테이징 폴더
├── content/ (또는 posts/)    # 백업된 .md 파일들이 위치한 폴더
│   ├── 글-제목-1.md
│   └── 글-제목-2.md
└── images/                  # -i 옵션 사용 시 다운로드된 로컬 이미지 폴더
    ├── <uuid-1>.png
    └── <post-title>/<uuid-2>.jpg
```

* **`velog-backup` 마크다운의 특징 및 주의점:**
  1. **Frontmatter 형식:** `title`, `description`, `date`(ISO 문자열), `tags`(배열)로 구성되어 있다. 간혹 `description`이 비어 있거나 줄바꿈 문자가 포함되어 있을 수 있다.
  2. **본문 내 이미지 경로:** `velog-backup`은 이미지를 다운로드하면서 본문 내 마크다운 이미지 문법을 `![](/images/파일명.png)` 또는 `![](./images/파일명.png)` 형태로 치환한다. 일부 다운로드되지 않은 이미지는 `https://velog.velcdn.com/...` 또는 `https://images.velog.io/...` 외부 URL 형태로 남아 있을 수 있다.
  3. **썸네일 부재:** `velog-backup`의 Frontmatter에는 별도의 `thumbnail` 필드가 없는 경우가 많으므로, 본문 내 첫 번째 이미지를 추출해 `thumbnail` 필드로 자동 등록해 주어야 벨로그처럼 카드 썸네일이 노출된다.
  4. **HTML 태그 혼용:** 벨로그 에디터 특성상 마크다운 내부에 `<br>`, `<br/>`, `<p align="center">`, `<img src="..." width="50%">` 등의 raw HTML이 자주 포함된다.

### 5.2. 마이그레이션 스크립트 (`scripts/migrate-velog.mjs`) 구현 요구사항
`npm run migrate` 실행 시 동작하는 Node.js 스크립트를 작성하며, 다음 6가지 처리를 수행해야 한다:

1. **입력 경로 자동 탐색:**
   * 프로젝트 루트의 `velog-backup-input/` 폴더(또는 CLI 인자로 받은 경로) 내부에서 `.md` 파일들이 있는 폴더(`content/`, `posts/`, 또는 루트)와 `images/` 폴더를 자동으로 탐색한다.
2. **이미지 파일 일괄 복사:**
   * `velog-backup-input/images/` 하위(중첩 폴더 포함)의 모든 이미지 파일을 `public/images/uploads/velog/` 경로로 구조를 유지하여 복사한다.
3. **본문 이미지 경로 자동 치환:**
   * 마크다운 본문 및 HTML `<img>` 태그 내부의 `/images/...` 또는 `./images/...` 경로를 모두 `/images/uploads/velog/...`로 일괄 치환한다.
   * 만약 `https://velog.velcdn.com/...` 등 외부 이미지 URL이 있고 `--download-remote` 플래그가 주어졌다면, 해당 이미지를 로컬(`public/images/uploads/velog/`)로 다운로드하고 경로를 치환하는 기능을 지원한다.
4. **Frontmatter 정규화 및 보강:**
   * `title`: 문자열로 강제 변환 (콜론이나 특수문자가 있어도 안전하도록 직렬화).
   * `description`: 값이 없거나 빈 문자열이면 본문 텍스트에서 마크다운/HTML 문법을 제거한 뒤 앞부분 140자를 추출하여 자동 입력.
   * `date`: 유효한 `Date` 객체 및 ISO 문자열로 변환.
   * `tags`: 배열 형태로 정규화 (문자열 하나로 들어온 경우 쉼표 기준 분리, 공백 및 `#` 기호 제거).
   * `thumbnail`: Frontmatter에 `thumbnail`이 없으면 본문 내 첫 번째 마크다운 이미지(`![alt](url)`) 또는 `<img src="url">`의 경로를 추출하여 자동 지정.
   * `draft`: 기본값 `false` 지정.
5. **파일명(Slug) 안전 변환 및 중복 방지:**
   * 파일명에 포함된 운영체제/URL 비호환 특수문자(`/`, `?`, `%`, `*`, `:`, `|`, `"`, `<`, `>`, `#`)를 제거하고 공백을 하이픈(`-`)으로 변환하여 `src/content/blog/<정제된-파일명>.md`로 저장한다.
6. **결과 리포트 출력:**
   * 총 변환된 마크다운 파일 수, 복사된 이미지 파일 수, 자동 생성된 썸네일 수를 터미널에 요약 출력한다.

---

## 6. SEO 및 마크다운 렌더링 파이프라인 요구사항

1. **Remark / Rehype 플러그인 구성 (`astro.config.mjs`):**
   * `rehype-raw`: 벨로그에서 작성했던 `<br>`, `<div align="center">`, `<img width="...">` 등 본문 내 Raw HTML 태그가 깨지지 않고 그대로 렌더링되도록 필수 설정한다.
   * `remark-gfm`, `remark-math`, `rehype-katex`: 표, 취소선, 수학 수식 렌더링 지원.
   * `rehype-slug`, `rehype-autolink-headings`: 우측 플로팅 목차(TOC)가 각 헤딩으로 정확히 스크롤 이동할 수 있도록 모든 `h1~h3` 태그에 고유 `id` 부여.
2. **검색 엔진 최적화 (SEO):**
   * `@astrojs/sitemap` 및 `@astrojs/rss`를 연동하여 빌드 시 `sitemap-index.xml`과 `rss.xml` 자동 생성.
   * `robots.txt` 생성 및 OpenGraph(`og:title`, `og:description`, `og:image`), Twitter Card 메타 태그 자동 주입 컴포넌트(`BaseHead.astro`) 구현.

---

## 7. 권장 디렉토리 구조 (Directory Structure)

```text
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Pages 자동 빌드 및 배포 액션
├── velog-backup-input/         # [Git Ignored] 사용자가 velog-backup 결과물을 넣는 폴더
│   ├── content/                # 백업된 .md 파일들
│   └── images/                 # 백업된 이미지 파일들
├── public/
│   ├── admin/
│   │   ├── index.html          # Sveltia CMS 엔트리
│   │   └── config.yml          # Sveltia CMS 스키마 및 미디어 설정
│   ├── images/
│   │   └── uploads/            # Sveltia CMS 업로드 이미지 & velog 백업 이미지 통합 저장소
│   │       └── velog/          # velog-backup에서 이주된 이미지 폴더
│   └── robots.txt
├── scripts/
│   └── migrate-velog.mjs       # velog-backup 데이터 자동 변환 및 복사 스크립트
├── src/
│   ├── config.ts               # 블로그 전역 설정 (프로필 정보, GitHub 주소, Giscus 설정값)
│   ├── components/
│   │   ├── BaseHead.astro      # SEO 메타 태그
│   │   ├── Header.astro        # 상단 블로그 바, 검색창, 다크모드 토글
│   │   ├── ProfileHeader.astro # 벨로그 스타일 상단 프로필 및 [글/시리즈/소개] 탭
│   │   ├── TagSidebar.astro    # 좌측 태그 목록 및 카운트
│   │   ├── PostCard.astro      # 게시글 카드 컴포넌트
│   │   ├── SeriesBox.astro     # 본문 상단 시리즈 네비게이터
│   │   ├── TableOfContents.astro # 우측 플로팅 TOC (IntersectionObserver)
│   │   └── Giscus.astro        # 댓글 컴포넌트 (테마 연동)
│   ├── content/
│   │   ├── config.ts           # Astro Content Collections 스키마 정의
│   │   └── blog/               # 마크다운 게시글 폴더 (.md)
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   └── PostLayout.astro    # 상세 페이지 레이아웃 (본문 + 우측 TOC + 댓글)
│   ├── pages/
│   │   ├── index.astro         # 메인 홈 (글 목록 + 태그 필터 + 인라인 검색)
│   │   ├── series/
│   │   │   ├── index.astro     # 시리즈 모아보기 그리드
│   │   │   └── [series].astro  # 특정 시리즈 상세 목록
│   │   ├── tags/
│   │   │   └── [tag].astro     # 태그별 글 목록
│   │   ├── about.astro         # 소개 탭 페이지
│   │   ├── posts/
│   │   │   └── [...slug].astro # 게시글 상세 뷰
│   │   └── rss.xml.js
│   └── styles/
│       └── global.css          # Pretendard 폰트, 벨로그 컬러 변수, 코드블록 복사 버튼 스타일
├── astro.config.mjs
├── package.json
└── tailwind.config.mjs
```

---

## 8. AI 에이전트 작업 지침 (Step-by-Step Implementation Plan)

AI는 한 번에 모든 파일을 불완전하게 생성하지 말고, 아래 단계별로 구현 및 빌드 검증을 수행한다.

* **Phase 1: 프로젝트 초기화, 마크다운 파이프라인 및 스키마 구성**
  * Astro + Tailwind CSS + Typography 플러그인 + `rehype-raw` 세팅.
  * `src/config.ts`에 사용자 프로필 및 Giscus 설정을 한곳에서 관리할 수 있는 전역 설정 파일 생성.
  * `src/content/config.ts` 작성 (`thumbnail`, `series`, `tags`, `draft` 등 옵셔널 필드 유연하게 허용) 및 샘플 마크다운 포스트 생성.
* **Phase 2: `velog-backup` 마이그레이션 스크립트 구현**
  * `scripts/migrate-velog.mjs` 작성 및 `package.json`에 `"migrate": "node scripts/migrate-velog.mjs"` 스크립트 등록.
  * `velog-backup-input/` 폴더가 비어 있어도 에러 없이 안내 메시지를 출력하도록 방어 코드 작성.
* **Phase 3: 벨로그 UI 레이아웃 및 핵심 컴포넌트 구현**
  * 다크/라이트 모드 테마 토글 및 벨로그 민트(`#12B886`) 포인트 컬러 적용.
  * 메인 페이지(프로필 헤더, 네비게이션 탭, 좌측 태그 사이드바, 실시간 검색바, 포스트 리스트) 및 시리즈 페이지(`/series`) 구현.
* **Phase 4: 포스트 상세 페이지 고도화**
  * 우측 플로팅 TOC(스크롤 스파이), 본문 상단 시리즈 네비게이터 박스, 코드 블록 복사 버튼, Giscus 댓글 연동.
* **Phase 5: Sveltia CMS (`/admin`) 및 GitHub Actions 배포 파이프라인**
  * `public/admin/index.html` 및 `public/admin/config.yml` 작성.
  * `.github/workflows/deploy.yml` 작성 및 `npm run build` 무결성 최종 검증.
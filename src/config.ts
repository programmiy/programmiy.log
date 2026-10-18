export interface SiteConfig {
  title: string;
  description: string;
  author: string;
  bio: string;
  profileImage: string;
  githubUrl: string;
  email?: string;
  siteUrl: string;
  // Giscus 댓글 설정
  giscus: {
    repo: string; // 예: "username/repo"
    repoId: string;
    category: string;
    categoryId: string;
    mapping: string;
    reactionsEnabled: string;
    emitMetadata: string;
    inputPosition: 'top' | 'bottom';
    lang: string;
  };
}

export const SITE_CONFIG: SiteConfig = {
  title: "programmiy.log",
  description: "programmiy의 기술 및 개발 블로그",
  author: "programmiy",
  bio: "바이브 코딩과 다양한 프로젝트를 시도하고 기록하는 개발 블로그입니다.",
  profileImage: "/images/profile.png", // 기본 프로필 이미지 경로 (없을 시 아바타 생성)
  githubUrl: "https://github.com/programmiy",
  email: "mailto:yyh4814@kakao.com",
  siteUrl: "https://programmiy.github.io/programmiy.log",
  giscus: {
    repo: "programmiy/programmiy.log",
    repoId: "", // giscus.app에서 발급받은 repoId
    category: "General",
    categoryId: "", // giscus.app에서 발급받은 categoryId
    mapping: "pathname",
    reactionsEnabled: "1",
    emitMetadata: "0",
    inputPosition: "bottom",
    lang: "ko",
  },
};

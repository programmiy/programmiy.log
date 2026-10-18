/**
 * Astro base URL을 고려하여 올바른 절대 경로를 생성하는 유틸리티
 */
export function getUrl(path: string = '/'): string {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (cleanPath === '/') {
    return base || '/';
  }
  return `${base}${cleanPath}`;
}

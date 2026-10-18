/**
 * Astro base URL을 고려하여 올바른 절대 경로를 생성하는 유틸리티
 */
export function getUrl(path: string = '/'): string {
  if (!path) return '';
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('data:') ||
    path.startsWith('blob:')
  ) {
    return path;
  }

  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  if (cleanPath === '/') {
    return base || '/';
  }

  if (base && (cleanPath === base || cleanPath.startsWith(`${base}/`))) {
    return cleanPath;
  }

  return `${base}${cleanPath}`;
}

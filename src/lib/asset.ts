/**
 * 拼接 public 资源 URL，自动加 Vite base 前缀。
 * - ModelScope / 本地 dev: BASE_URL=/ → /images/xxx
 * - GitHub Pages: BASE_URL=/innolumina-lux3d/ → /innolumina-lux3d/images/xxx
 */
export function assetUrl(path: string): string {
  const base = import.meta.env.BASE_URL || '/';
  const p = path.replace(/^\//, '');
  return `${base}${p}`;
}

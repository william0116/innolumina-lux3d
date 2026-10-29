// Lux3D API 工具函数
// - 本地开发：走 Vite 同源 proxy（/api/lux3d），由前端携带 Key，proxy 转发到国内网关。
// - 生产环境（GitHub Pages 纯静态）：浏览器不能直连 Aholo 网关——网关实际响应不带
//   Access-Control-Allow-Origin，会被 CORS 拦截（Failed to fetch）。因此生产走 Cloudflare
//   Worker 反向代理（VITE_LUX3D_PROXY），Key 由 Worker 在服务端注入，前端不再携带。

const API_KEY = import.meta.env.VITE_LUX3D_API_KEY || '';
const IS_DEV = import.meta.env.DEV;

// 开发环境：Vite proxy 前缀；生产：Worker 对外根（须以 /lux3d/v1 结尾）
const BASE_URL = IS_DEV
  ? '/api/lux3d'
  : (import.meta.env.VITE_LUX3D_PROXY || '').replace(/\/$/, '');

if (!IS_DEV && !BASE_URL) {
  // 生产未配置代理地址时给出明确错误，避免误把请求发到页面自身源
  console.error('[lux3d] 缺少 VITE_LUX3D_PROXY 生产代理地址');
}

/** 组装请求头：仅本地开发携带 Key；生产由 Worker 注入 Authorization */
function jsonHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (IS_DEV) headers['Authorization'] = API_KEY;
  return headers;
}

function plainHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  if (IS_DEV) headers['Authorization'] = API_KEY;
  return headers;
}

export interface Lux3DTaskResult {
  taskId: number;
  status: number; // 0=初始化, 1=运行中, 3=成功, 4=失败
  outputs?: Array<{ content: string }>;
}

/**
 * 文生3D
 */
export async function textTo3D(prompt: string, version: 'G1' | 'G1-Turbo' = 'G1-Turbo'): Promise<number> {
  const res = await fetch(`${BASE_URL}/generate/text-to-3d/task/create`, {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify({
      prompt,
      version,
      outputFormat: ['glb'],
    }),
  });
  if (!res.ok) throw new Error(`创建任务失败: ${res.statusText}`);
  const data = await res.json();
  if (data.c !== '0') throw new Error(`创建任务失败: ${data.m || '未知错误'}`);
  return data.d; // taskId 包在 d 字段里
}

/**
 * 图生3D - 通过 URL 或 base64 Data URL
 */
export async function imageTo3DByUrl(imageUrl: string, version: 'G1' | 'G1-Turbo' = 'G1-Turbo'): Promise<number> {
  const res = await fetch(`${BASE_URL}/generate/img-to-3d/task/create`, {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify({
      img: imageUrl,
      version,
      outputFormat: ['glb'],
    }),
  });
  if (!res.ok) throw new Error(`创建任务失败: ${res.statusText}`);
  const data = await res.json();
  if (data.c !== '0') throw new Error(`创建任务失败: ${data.m || '未知错误'}（图片可能太大了）`);
  return data.d;
}

/**
 * 查询任务状态
 */
export async function getTaskStatus(taskId: number): Promise<Lux3DTaskResult> {
  const res = await fetch(`${BASE_URL}/generate/task/get?taskid=${taskId}`, {
    headers: plainHeaders(),
  });
  if (!res.ok) throw new Error(`查询任务失败: ${res.statusText}`);
  const data = await res.json();
  if (data.c !== '0') throw new Error(`查询任务失败: ${data.m || '未知错误'}`);
  return data.d; // 任务数据包在 d 字段里
}

/**
 * 等待任务完成
 */
export async function waitForTask(taskId: number, onProgress?: (status: number) => void): Promise<Lux3DTaskResult> {
  while (true) {
    const result = await getTaskStatus(taskId);
    onProgress?.(result.status);
    if (result.status === 3) return result;
    if (result.status === 4) throw new Error('3D 模型生成失败');
    await new Promise(r => setTimeout(r, 3000));
  }
}

/**
 * 模型资源（GLB）地址：生产环境经 Worker 同源中转，规避 OUS/CDN 域名跨域；开发环境直连原地址。
 */
export function proxyAssetUrl(assetUrl: string): string {
  if (IS_DEV || !BASE_URL) return assetUrl;
  return `${BASE_URL}/file?url=${encodeURIComponent(assetUrl)}`;
}

/**
 * 下载模型文件：生产环境先经代理拉取为 Blob 再触发下载（跨域时 download 属性才生效）；
 * 开发环境直接打开原地址。
 */
export async function downloadAsset(assetUrl: string, fileName: string): Promise<void> {
  if (IS_DEV) {
    const a = document.createElement('a');
    a.href = assetUrl;
    a.download = fileName;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return;
  }
  const res = await fetch(proxyAssetUrl(assetUrl));
  if (!res.ok) throw new Error(`下载失败: ${res.statusText}`);
  const blob = await res.blob();
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(blobUrl);
}

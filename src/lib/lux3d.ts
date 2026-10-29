// Lux3D API 工具函数
// 开发环境通过 Vite proxy 转发；生产环境直连官方网关

const API_KEY = import.meta.env.VITE_LUX3D_API_KEY || '';
const BASE_URL = import.meta.env.DEV
  ? '/api/lux3d'
  : 'https://api.aholo.ai/global/lux3d/v1';

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
    headers: {
      'Authorization': API_KEY,
      'Content-Type': 'application/json',
    },
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
    headers: {
      'Authorization': API_KEY,
      'Content-Type': 'application/json',
    },
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
    headers: { 'Authorization': API_KEY },
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

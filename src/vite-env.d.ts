/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LUX3D_API_KEY?: string;
  // 生产环境 Cloudflare Worker 代理地址（须以 /lux3d/v1 结尾）；仅本地开发使用 VITE_LUX3D_API_KEY
  readonly VITE_LUX3D_PROXY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

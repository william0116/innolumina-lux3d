/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LUX3D_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

# InnoLumina 琉衍工坊 · AI 琉璃数字化定制平台

> 光自数字来，万象衍为琉。

**Aholo 全球 3D AI 黑客松参赛作品** —— 基于群核科技 **Aholo Lux3D** 3D 生成模型，打造从创意文字到 2D 效果图、再到 3D 数字模型的琉璃器物定制闭环，让普通人也能设计自己的琉璃作品。

**在线 Demo：** https://william0116.github.io/innolumina-lux3d/
**源码仓库：** https://github.com/william0116/innolumina-lux3d

## 项目简介

传统琉璃创作存在三大痛点：设计门槛高、打样成本贵周期长、供需信息不匹配。本平台用 AI 降低传统工艺的设计门槛：

1. **创意输入**：用文字描述琉璃构想
2. **AI 生成效果图**：自动生成多张方案供选择
3. **转 3D 模型**：基于 Lux3D 图生 3D，一键生成三维数字模型
4. **工艺校验**：自动检测网格完整性、最小壁厚、镂空结构等铸造风险
5. **下载 / 下单**：下载 GLB 模型或进入实体制造流程

## 技术栈

- **前端**：React 19 + Vite 8 + TypeScript
- **样式 / UI**：Tailwind CSS v4 + shadcn/ui
- **3D 渲染**：Three.js + GLTFLoader
- **3D 生成**：Aholo Lux3D API（极速版 G1-Turbo / 标准版 G1）
- **动画**：framer-motion

## 核心功能

- 文生创意、效果图方案选择
- Lux3D 图生 3D，支持极速版（约 20 秒）与标准版（约 3 分钟）切换
- 本地上传参考图（自动压缩至 1024px / JPEG 80%）
- Three.js 在线 3D 预览（旋转、缩放、自动旋转、淡入动画）
- GLB 模型下载
- 工艺可行性校验面板
- 作品管理、个人中心、订单、积分体系

## 本地运行

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制示例文件并填入你的 Lux3D API Key（在 [Aholo 开发者后台](https://labs.aholo.ai/api-keys) 获取）：

```bash
cp .env.example .env.local
```

```env
VITE_LUX3D_API_KEY=your_api_key_here
```

### 3. 启动开发环境

```bash
npm run dev
```

浏览器访问终端输出的本地地址（默认 `http://localhost:8001`）。

### 4. 独立部署构建（standalone）

脱离妙搭平台独立部署时，使用 standalone 模式构建（自动切换 HashRouter、摘除平台监控占位符），产物输出到 `dist/client/`：

```bash
MIAODA_BUILD_TARGET=standalone npx vite build
```

### 5. 部署 Cloudflare Worker 反向代理（生产必需）

Aholo 网关的实际 POST/GET 响应不带 `Access-Control-Allow-Origin`，纯静态站点（GitHub Pages）浏览器直连会被 CORS 拦截（`Failed to fetch`）。因此生产环境由一个 Cloudflare Worker 做中转：转发请求、在服务端注入 API Key、为响应补齐 CORS 头。

```bash
cd worker
npx wrangler login                 # 浏览器授权登录 Cloudflare
npx wrangler secret put LUX3D_API_KEY   # 写入 Lux3D Key（仅服务端持有，不进前端）
npx wrangler deploy                # 发布，得到 https://<name>.<account>.workers.dev
```

Worker 源码见 `worker/src/index.js`，上游网关在 `worker/wrangler.toml` 的 `UPSTREAM` 配置（默认国内站 `https://api.aholo3d.cn/lux3d/v1`）。

### 6. 部署到 GitHub Pages

仓库已配置 `.github/workflows/deploy.yml`：推送 `main` 分支即自动安装依赖、standalone 构建并发布到 GitHub Pages。

- 线上路径为子路径 `/innolumina-lux3d/`，CI 构建时通过 `VITE_BASE_PATH` 注入资源前缀。
- 需要在仓库 **Settings → Secrets and variables → Actions** 配置 Secret：`VITE_LUX3D_PROXY`，值为 Worker 对外地址，例如 `https://innolumina-lux3d-proxy.<account>.workers.dev/lux3d/v1`。
- **API Key 不进入前端 bundle**：本地开发由 Vite proxy 携带；生产由 Worker 在服务端注入。
- 首次发布需在 **Settings → Pages** 将 Source 设为 **GitHub Actions**。

## 环境变量

| 变量 | 作用域 | 说明 | 是否必填 |
|------|--------|------|----------|
| `VITE_LUX3D_API_KEY` | 仅本地开发 | Aholo Lux3D API Key，经 Vite proxy 转发，不进入生产包 | 本地必填 |
| `VITE_LUX3D_PROXY` | 生产构建 | Cloudflare Worker 代理地址（以 `/lux3d/v1` 结尾）；Key 由 Worker 持有 | 生产必填 |
| `LUX3D_API_KEY` | Worker 服务端 | Worker secret，服务端注入 `Authorization`，禁止写入前端或仓库 | Worker 必填 |

> 开发环境通过 Vite proxy 同源转发 `/api/lux3d` 到国内网关；生产环境浏览器只访问 Worker 代理，由 Worker 转发到 Aholo 网关并补齐 CORS 头。

## 目录结构

```
src/
├── app.tsx              # 路由配置
├── lib/
│   ├── lux3d.ts         # Lux3D API 封装（文生3D / 图生3D / 任务轮询）
│   └── app-storage.ts   # 本地存储统一封装
├── components/          # 通用 UI 与 3D 组件
└── pages/
    ├── HomePage/        # 首页
    ├── CreationPage/    # 创作页（效果图 + 转 3D）
    ├── Preview3DPage/   # 3D 预览与重新生成
    ├── SquarePage/      # 作品广场
    ├── OrderPage/       # 下单
    ├── ProfilePage/    # 个人中心
    └── ...
worker/
├── wrangler.toml        # Cloudflare Worker 配置（上游网关、名称）
└── src/index.js         # 反向代理：转发 + 注入 Key + 补齐 CORS
```

## 赛事信息

- 赛事：Aholo 全球 3D AI 黑客松（群核科技主办）
- 时间：2026.10.19 – 2026.11.19
- 团队：琉衍工坊

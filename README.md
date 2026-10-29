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

### 5. 部署到 GitHub Pages

仓库已配置 `.github/workflows/deploy.yml`：推送 `main` 分支即自动安装依赖、standalone 构建并发布到 GitHub Pages。

- 线上路径为子路径 `/innolumina-lux3d/`，CI 构建时通过 `VITE_BASE_PATH` 注入资源前缀。
- 需要在仓库 **Settings → Secrets and variables → Actions** 配置 Secret：`VITE_LUX3D_API_KEY`（构建期注入，不进入公开源码）。
- 首次发布需在 **Settings → Pages** 将 Source 设为 **GitHub Actions**。

## 环境变量

| 变量 | 说明 | 是否必填 |
|------|------|----------|
| `VITE_LUX3D_API_KEY` | Aholo Lux3D API Key | 是 |

> 开发环境通过 Vite proxy 转发 `/api/lux3d` 到官方网关；生产环境直连 `https://api.aholo.ai/global/lux3d/v1`。

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
    ├── ProfilePage/     # 个人中心
    └── ...
```

## 赛事信息

- 赛事：Aholo 全球 3D AI 黑客松（群核科技主办）
- 时间：2026.10.19 – 2026.11.19
- 团队：琉衍工坊

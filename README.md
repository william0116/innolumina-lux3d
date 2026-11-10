# InnoLumina 琉衍工坊 · AI琉璃数字化定制平台

> 光自数字来，万象衍为琉。

**Aholo 全球 3D AI 黑客松参赛作品** —— 基于群核科技 **Aholo Lux3D** 3D 生成模型，打造从创意文字到 2D 效果图、再到 3D 数字模型的琉璃器物定制闭环，让普通人也能设计自己的琉璃作品。

**在线 Demo：** https://william0116.github.io/innolumina-lux3d/
**源码仓库：** https://github.com/william0116/innolumina-lux3d

## 项目简介

传统琉璃创作存在三大痛点：设计门槛高、打样成本贵周期长、供需信息不匹配。本平台用 AI 降低传统工艺的设计门槛：

1. **创意输入**：用文字描述琉璃构想，或上传参考图
2. **AI 生成效果图**：自动生成多张方案供选择（本地 mock / 对接图生图插件）
3. **转 3D 模型**：基于 Lux3D 图生 3D，一键生成三维数字模型（极速版 ~20s / 标准版 ~3min）
4. **工艺校验**：自动检测网格完整性、最小壁厚、镂空结构等铸造风险
5. **下载/ 下单**：下载 GLB 模型或进入实体制造流程

## 技术栈

- **前端**：React19 + Vite 8 + TypeScript
- **样式 / UI**：Tailwind CSS v4 + shadcn/ui + framer-motion
- **3D 渲染**：Three.js + GLTFLoader
- **3D 生成**：Aholo Lux3D API（极速版 G1-Turbo / 标准版 G1）
- **数据存储**：localStorage（`scopedStorage`，带平台命名空间前缀）
- **路由**：React Router v7

## 核心功能

- **AI 创作工作台**：文生图/ 图生图双模式，风格预设标签，字数计数，实时扣积分
- **Lux3D 3D 生成**：图生 3D，分步进度卡片展示，10 分钟轮询超时保护
- **Three.js 3D 预览**：旋转、缩放、自动旋转、淡入动画，工艺校验报告展示
- **作品广场**：筛选、搜索、点赞、一键生产跳转下单
- **制造下单**：三种制造方式选择（下载 STL / 树脂母模 / 琉璃成品），收件信息，订单时间线
- **个人中心**：作品管理、订单管理、积分账户、充值
- **管理后台**：内容审核、用户管理、订单管理、收益统计
- **数据持久化**：充值、创作、订单跨刷新保持；多标签页积分同步

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

演示账号已预置，直接进入即可体验完整流程（无需注册）。

### 4. 独立部署构建（standalone）

脱离妙搭平台独立部署时，使用 standalone 模式构建（自动切换 HashRouter、拦截平台探测请求），产物输出到 `dist/client/`：

```bash
MIAODA_BUILD_TARGET=standalone npx vite build
```

### 5. 部署 Cloudflare Worker 反向代理（生产必需）

Aholo 网关响应不带 `Access-Control-Allow-Origin`，纯静态站点浏览器直连会被 CORS 拦截。生产环境由 Cloudflare Worker 做中转：转发请求、在服务端注入 API Key、为响应补齐 CORS 头。

```bash
cd worker
npx wrangler login                # 浏览器授权登录 Cloudflare
npx wrangler secret put LUX3D_API_KEY# 写入 Lux3D Key（仅服务端持有，不进前端）
npx wrangler deploy# 发布，得到 https://<name>.<account>.workers.dev
```

Worker 源码见 `worker/src/index.js`，上游网关在 `worker/wrangler.toml` 的 `UPSTREAM` 配置（默认国内站 `https://api.aholo3d.cn/lux3d/v1`）。

### 6. 部署到 GitHub Pages

仓库已配置 `.github/workflows/deploy.yml`：推送 `main` 分支即自动安装依赖、standalone 构建并发布到 GitHub Pages。

- 线上路径为子路径 `/innolumina-lux3d/`，CI 构建时通过 `VITE_BASE_PATH` 注入资源前缀。
- 需在仓库 **Settings → Secrets and variables → Actions** 配置 Secret：`VITE_LUX3D_PROXY`，值为 Worker 对外地址，例如 `https://innolumina-lux3d-proxy.<account>.workers.dev/lux3d/v1`。
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
├── app.tsx                # 路由配置（15个页面）
├── index.tsx# 入口，ErrorBoundary，平台探测拦截
├── lib/
│   ├── lux3d.ts             # Lux3D API（图生3D / 文生3D / 轮询，含超时保护）
│   ├── app-storage.ts       # 本地存储统一封装（seed 数据初始化，持久化）
│   ├── seed-data.ts         # 演示数据（作品、订单、积分流水、广场作品）
│   ├── square-storage.ts    # 广场作品存储
│   └── user-storage.ts      # 多用户存储（管理后台用）
├── contexts/
│   ├── AuthContext.tsx       # 登录状态、积分增减、多标签同步
│   └── OrderContext.tsx      # 订单状态流转、收益记录
├── components/
│   ├── Glass3DViewer.tsx     # Three.js 3D 预览组件
│   ├── GlassParticles.tsx    # 首页粒子背景
│   └── ui/                # shadcn/ui 组件
├── data/
│   ├── showcase.ts           # inno.Studio 实拍产品图常量、首页展示数据
│   ├── glassmorphism.ts      # 预设作品数据（MOCK_WORKS）
│   └── square.ts             # 广场作品数据类型与常量
└── pages/
    ├── HomePage/             # 首页（Hero + 能力卡 + 流程+ 作品展示）
    ├── CreationPage/         # AI 创作工作台（文生图 / 图生图）
    ├── Preview3DPage/        # 3D 预览与工艺校验
    ├── SquarePage/           # 作品广场
    ├── OrderPage/            # 制造下单
    ├── OrderDetailPage/      # 订单详情
    ├── ProfilePage/          # 个人中心（作品 / 订单 / 积分 / 收益）
    ├── RechargePage/         # 积分充值
    ├── AdminPage/            # 管理后台
    ├── CreatorApplyPage/     # 创作者入驻申请
    ├── HelpPage/             # 帮助中心
    ├── LoginPage/            # 登录
    ├── RegisterPage/         # 注册
    └── NotFoundPage/         # 404

worker/
├── wrangler.toml             # Cloudflare Worker 配置（上游网关、名称）
└── src/index.js              # 反向代理：转发 + 注入 Key + 补齐 CORS
```

## 已知限制

- 效果图生成目前为本地 mock（按关键词匹配预设图）；生产接图生图插件后替换
- 工艺校验为前端规则模拟，非真实 AI 语义分析
- 支付为演示流程，不接入真实支付网关
- `/admin` 后台无角色鉴权，演示环境任何登录用户均可进入

## 赛事信息

- 赛事：Aholo 全球 3D AI 黑客松（群核科技主办）
- 时间：2026.10.19 – 2026.11.19
- 团队：琉衍工坊

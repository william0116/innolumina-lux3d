# 项目移交说明

> 最后更新：2026-11-10

## 当前状态

Demo阶段已完成，可在本地完整运行和演示。

### 已完成

- **Bug 修复**
  - 数据持久化：种子数据重复初始化导致刷新后充值/订单丢失（`app-storage.ts`）
  - AuthContext/OrderContext 闭包问题、多标签页键名匹配
  - 创作页按钮嵌套（HTML 规范违规）
  - 下单页订单金额不一致
  - 全站产品图路径缺少前导`/`，导致二级路由下图片加载失败
  - lux3d 轮询无超时保护（已加10 分钟上限）

- **UI 优化**
  - 首页：KPI 计数动效、产品图换棚拍图、移动端补产品图、留白收紧
  - 预览页：生成分步进度卡、检测项交错动画
  - 广场：卡片入场动画、点赞弹跳、筛选过渡
  - 创作页：空状态呼吸动效、字数计数器

- **演示数据**
  - 全站产品图替换为 inno.Studio 实拍图（46处）
  - 创作页 mock 生成按色系分组，每次生成不再是同一张图

- **代码质量**
  - 修复 imagePool缩进
  - 统一主CTA 按钮样式（`glass-btn-primary`）

### 验证情况

| 测试项| 结果 |
|---|---|
| 全站 14 个路由巡检（桌面 + 390px 手机） | ✅ 通过，无控制台错误 |
| 完整用户流程（下单、充值、AI 生成） | ✅ 通过|
| 数据持久化（充值/订单刷新后保持） | ✅ 通过 |
| 退出登录 + 路由保护 | ✅ 通过 |
| 真实 Lux3D 3D 生成 | ⬜ 未测试（会消耗 API 额度） |

---

## 未完成的Demo 阶段工作

优先级从高到低：

### 1. 移动端适配确认 ✅（2026-11-10 完成）
390×844 iPhone 视口下逐页截图 + 全 12 路由横向溢出巡检：
- 首页 / 创作页 / 预览页 / 作品广场：布局正常，汉堡菜单、3 列参考图、全宽 CTA、底部固定下单按钮、横向滚动分类条均正常
- 全 12 路由 `document.scrollWidth - clientWidth = 0`，无横向溢出
- console 仅有平台探测请求噪音（dev 环境预期）
- 结论：移动端适配无需改动

### 2. 演示数据补全 ✅（2026-11-10 完成）
- 广场作品日期全部从 2024-2025 刷新到 2026-09~2026-11（近 2 个月内）
- 分类覆盖：新增 square-13「青绿琉璃山子镇纸」(decor 摆件)、square-14「雾蓝琉璃盖置小罐」(other 其他)；现每类 ≥1 件（香插 2、琉璃匣 6、灯饰 2、摆件 2、茶具 1、其他 1）
- 订单状态：原 4 单已含 completed/producing/shipped/pending，新增 ord_005 已取消（cancelled），共 5 单覆盖 5 种状态
- 积分流水：本就用相对日期（d(0)~d(20)），自动滚动到近 20 天，无需改
- 备注：种子数据靠 localStorage flag 初始化，dev 预览前需清 localStorage 才能看到新数据

### 3. admin 路由鉴权 ✅（2026-11-10 完成）
- `ProtectedRoute` 新增 `requiredRole` prop，非 admin 角色访问 `/admin` 直接重定向到 `/`
- `app.tsx` admin 路由加 `requiredRole="admin"`
- 测试用户 role 改为 `admin`（demo 时仍能进后台展示）
- 验证：admin 用户进 /admin 正常显示"管理员"角标；手动改 localStorage role=creator 后访问 /admin 被踢回首页

---

## 上线待办（按优先级）

详见 README.md 的「已知限制」和「上线待办」章节。核心三件事：

1. **后端 + 数据库**：推荐用 Supabase（免费层够早期用），替换 localStorage
2. **短信验证码**：阿里云市场 / 腾讯云，接入 `LoginPage.tsx` 和 `RegisterPage.tsx`
3. **支付**：微信支付审核周期 1–2 周，需提前申请

---

## 本地运行

```bash
npm install
cp .env.example .env.local
# 填入 VITE_LUX3D_API_KEY
npm run dev
# 访问 http://localhost:8001
```

演示账号已预置，直接进入可体验完整流程。

---

## 测试脚本

位于 `/tmp/innolumina-qa/`（本地临时目录，不在仓库里）：

|脚本 | 用途 |
|---|---|
| `crawl.cjs` | 全站 14 个路由巡检（桌面 + 手机），检查控制台错误和横向溢出 |
| `flows.cjs` | 完整用户流程测试（下单、充值、AI 生成） |
| `verify.cjs` | 数据持久化验证（充值/订单刷新后是否保持） |
| `logout.cjs` | 退出登录 + 路由保护验证 |
| `login.cjs` | 登录跳转验证 |

需要 Playwright：
```bash
# 检查是否可用
node -e "require(process.env.HOME+'/.local/lib/node_modules/@playwright/cli/node_modules/playwright')"
```

---

## 关键文件索引

| 文件 | 说明 |
|---|---|
| `src/lib/app-storage.ts` | 所有本地存储的读写入口，改数据结构从这里开始 |
| `src/lib/seed-data.ts` | 演示数据，修改初始作品/订单/积分从这里改 |
| `src/lib/lux3d.ts` | Lux3D API 封装，3D 生成相关逻辑在这里 |
| `src/contexts/AuthContext.tsx` | 登录状态、积分增减，接入真实后端从这里改 |
| `src/contexts/OrderContext.tsx` | 订单状态流转，接入真实订单系统从这里改 |
| `src/data/showcase.ts` | 产品图常量（`INNO_REAL_IMAGES`），新增图片在这里注册 |
| `worker/src/index.js` | Cloudflare Worker 代理，修改上游网关地址在这里 |

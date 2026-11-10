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

### 1. 移动端适配确认
创作页和预览页在手机端只跑了巡检，没有看实际截图。建议：
```bash
# 用Playwright 截图
node -e "
const {chromium}=require(process.env.HOME+'/.local/lib/node_modules/@playwright/cli/node_modules/playwright');
(async()=>{
  const b=await chromium.launch();
  for(const url of ['/create','/preview/work-amber']){
    const p=await b.newPage({viewport:{width:390,height:844}});
    await p.goto('http://localhost:8001'+url,{waitUntil:'networkidle'});
    await p.waitForTimeout(1500);
    await p.screenshot({path:'/tmp/mobile'+url.replace(/\//g,'-')+'.png',fullPage:true});
    await p.close();
  }
  await b.close();
})();"
```

### 2. 演示数据补全
- 广场作品 12 件，分类覆盖不均（灯饰0 件）
- 订单状态全是"生产中"，不够真实
- 积分流水时间停在 2026-10 月

相关文件：`src/lib/seed-data.ts`（种子数据）、`src/data/square.ts`（广场作品）

### 3. admin 路由鉴权
任何登录用户都能进 `/admin`，演示时若被人测试会暴露。
修改位置：`src/app.tsx` 第 46 行的`ProtectedRoute`，加角色判断：
```tsx
// 改为
<Route path="admin" element={
  <ProtectedRoute requireRole="admin"><AdminPage /></ProtectedRoute>
} />
```
需同步修改 `src/components/ProtectedRoute.tsx` 支持 `requireRole` prop。

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

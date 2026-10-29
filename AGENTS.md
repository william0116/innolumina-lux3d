# InnoLumina｜琉衍工坊 - 需求拆解文档

## 产品概述

- **产品类型**: AI琉璃数字化定制平台（Web平台/创意设计工具）
- **场景类型**: <scene_type>prototype-app</scene_type>
- **目标用户**: 设计师、独立创作者、企业礼赠定制需求方
- **核心价值**: 以AI文生创作、2D转3D建模、工艺校验引擎，将创意构想转化为琉璃三维数字资产，并撮合供应链完成实体造物，连接虚拟创意与实体造物
- **界面语言**: 中文
- **主题偏好**: 深色背景 + 琉璃通透的青绿色/琥珀色调光效（东方美学与科技感结合）
- **导航模式**: 路径导航
- **导航布局**: Topbar（消费者创意工具前台，顶部固定导航栏）

---

## 页面结构总览

| 页面名称 | 文件名 | 路由 | 页面类型 | 入口来源 |
|---------|-------|------|---------|---------|
| 首页/落地页 | `HomePage.tsx` | `/` | 一级 | 导航 |
| AI创作工作台 | `CreationPage.tsx` | `/create` | 一级 | 导航、首页「开始创作」按钮 |
| 3D预览与工艺校验 | `Preview3DPage.tsx` | `/preview/:id` | 二级 | AI创作工作台 → 点击「转3D模型」 |
| 制造下单页 | `OrderPage.tsx` | `/order/:id` | 二级 | 3D预览与工艺校验页 → 点击「进入制造下单」 |
| 个人中心/订单管理 | `ProfilePage.tsx` | `/profile` | 一级 | 导航（简化版，含积分、作品、订单） |

---

## 页面布局建议

### AI创作工作台（核心工具页）

- **布局模式**: 左右分栏 —— 左侧创意输入区，右侧生成结果区（2x2 缩略图网格 + 历史作品侧栏）
- **视觉重心**: 生成结果区（2x2 大图网格），辅以左侧输入与右侧历史，整体呈现创作工作台氛围
- **结果承载区**: 中部 2x2 效果图缩略图网格，初始态为空状态（占位提示 + 示例图）；生成中为骨架加载动画；生成后展示4张琉璃器物效果图，点击放大预览
- **源材料承载区**: 左侧 Prompt 输入框 + 风格预设标签，用户输入创意描述并可快速填入风格词

### 3D预览与工艺校验页

- **布局模式**: 左右分栏 + 底部操作条 —— 左侧3D模型预览区，右侧工艺校验报告面板
- **视觉重心**: 左侧3D模型预览区（大屏幕展示线框/实体模型）
- **结果承载区**: 右侧面板为校验结果列表（检测项 + 告警），底部操作按钮区承载下载/下单动作

### 制造下单页

- **布局模式**: 左右分栏 —— 左侧制造选项卡片 + 订单填写区，右侧订单时间线与价格明细
- **视觉重心**: 左侧制造选项卡片（三种制造方式的可视化选择）
- **结果承载区**: 右侧订单时间线展示流程进度，底部价格明细与支付按钮

---

## 插件规划

| 插件实例名称 | 基于官方插件 | 业务用途 | 输出模式 | 所属页面 |
|------------|-----------|---------|---------|---------|
| ai-glass-image-gen | `ai-text-to-image` | 根据用户输入的文字描述，生成琉璃器物效果图（4张） | unary | AI创作工作台 |
| ai-glass-2d-to-3d | `ai-image-to-image` | 将选定的2D琉璃效果图转换为3D模型（模拟2D转3D建模能力） | unary | 3D预览与工艺校验页 |

> **说明**: 工艺校验功能为前端规则模拟（壁厚、尺寸、网格等校验），不涉及AI语义判定，使用 demo-mock 数据即可。积分扣减、订单状态流转等均为本地前端逻辑。

---

## 导航配置

- **导航布局**: Topbar（顶部固定）
- **导航项**（一级页面）:

| 导航文字 | 路由 | 图标(可选) |
|---------|------|-----------|
| 首页 | `/` | Home |
| AI创作 | `/create` | Sparkles |
| 我的作品 | `/profile?tab=works` | Image |
| 订单中心 | `/profile?tab=orders` | Package |
| 关于我们 | `/about` | Info |

> **说明**: 「我的作品」和「订单中心」均指向个人中心页面，通过 tab 参数切换显示内容模块，减少页面拆分。

---

## 数据来源声明

| 数据/操作 | 来源类型 | 实现要求 | mock 兜底 |
|---|---|---|---|
| AI文生琉璃效果图 | real-plugin | capabilityClient 调 ai-glass-image-gen 实例，传入用户输入的琉璃创意描述文本，生成4张琉璃器物效果图 | 失败提示（toast "生成服务暂不可用"） |
| 2D转3D模型生成 | real-plugin | capabilityClient 调 ai-glass-2d-to-3d 实例，传入用户选定的效果图，生成3D模型渲染图（模拟3D建模输出） | 失败提示（toast "3D建模服务暂不可用"） |
| 积分账户余额 | local-persist | localStorage key=`__innolumina_credit_balance`，初始值 500 积分 | 无 |
| 积分消耗记录 | local-persist | localStorage key=`__innolumina_credit_records`，记录每次消耗/充值 | 无 |
| 我的作品（效果图+3D模型） | local-persist | localStorage key=`__innolumina_works`，存储生成的作品列表 | 初始 3 条 source='mock' 示例作品 |
| 我的订单 | local-persist | localStorage key=`__innolumina_orders`，存储下单记录与状态 | 初始 2 条 source='mock' 示例订单 |
| 工艺校验结果 | demo-mock | 前端根据作品/模型参数生成校验报告（网格、壁厚、尺寸、镂空） | ✅ 本身就是 mock 规则生成 |
| 首页案例作品展示 | demo-mock | src/data/showcase.ts const 数组 | ✅ 本身就是 mock |
| STL文件下载 | import-export | Blob + a.click 触发 STL 文本文件下载（示例文件内容） | 无 |

> 插件规划对应行 type=`real-plugin`，mock 兜底均为失败提示，不提供具体可执行 mock 值，避免旁路插件铁律。

---

## 功能列表

### 页面：首页/落地页 (`HomePage.tsx`)

- **页面目标**: 品牌展示与引流，让访客了解平台价值并进入创作流程
- **功能点**:
  - **Hero 区展示**: 大标题「光自数字来，万象衍为琉」+ 副标题品牌定位 + 「开始创作」主按钮，点击跳转至 `/create`
  - **核心能力卡片展示**: 四个能力卡片（AI文生创作、2D转3D建模、工艺校验引擎、供应链撮合生产），带图标与简介
  - **链路流程展示**: 可视化流程条（创意输入→AI生成效果图→转3D模型→工艺校验→下载/下单），体现完整业务链路
  - **作品案例展示**: 琉璃器物案例图片网格，展示平台生成效果
  - **底部 Footer**: 品牌信息、联系方式、版权声明

### 页面：AI创作工作台 (`CreationPage.tsx`)

- **页面目标**: 用户输入创意描述，生成琉璃器物效果图，选择心仪方案进入3D建模
- **功能点**:
  - **Prompt 创意输入**: 多行文本输入框，含占位提示文案（"描述你想要的琉璃器物..."），支持用户自由输入
  - **风格预设标签**: 东方美学、现代极简、自然意象、几何抽象等标签，点击将关键词填入 Prompt 输入框
  - **AI 生成效果图**: 点击「生成（消耗 XX 积分）」按钮，调用文生图插件生成4张琉璃效果图；生成中显示加载动画与进度条；生成成功后扣除对应积分并 toast 提示
  - **效果图预览与选择**: 2x2 网格展示4张生成图，点击可放大预览（Modal）；每张图下方有「转3D模型」按钮，点击跳转至 `/preview/:id` 并扣减积分
  - **历史作品列表**: 右侧展示用户历史生成的作品缩略图，点击可加载对应作品详情

### 页面：3D预览与工艺校验 (`Preview3DPage.tsx`)

- **页面目标**: 展示生成的3D模型，提供工艺校验报告，引导用户下载或下单
- **功能点**:
  - **3D 模型预览**: 主视觉区展示3D线框模型（可用渲染图 + 全息网格效果模拟），支持鼠标拖动旋转视角（CSS 3D transform 模拟交互）
  - **模型信息展示**: 显示文件名、尺寸（长×宽×高）、面数等基本参数
  - **工艺校验报告**: 右侧面板展示校验状态总览（通过/需注意/不通过），含4项检测（网格完整性、最小壁厚、尺寸范围、镂空结构），用绿/黄/红色标识风险等级；底部显示重要提示文案
  - **告警详情展示**: 点击各检测项可展开查看详细说明（如最薄位置、大件风险提示等）
  - **下载与下单操作**: 底部三个操作按钮——「下载STL模型」（触发文件下载，可能消耗积分）、「下单3D打印树脂母模」、「下单琉璃成品」，后两者跳转至 `/order/:id` 并预选对应制造方式

### 页面：制造下单页 (`OrderPage.tsx`)

- **页面目标**: 用户选择制造方式、填写订单信息、完成下单
- **功能点**:
  - **制造方式选择**: 三列卡片（下载STL模型 / 3D打印树脂母模 / 脱蜡铸造琉璃成品），卡片含图标、价格、说明、工期；点击选中，联动右侧价格明细
  - **订单信息填写**: 收件人姓名、电话、地址、数量、备注等表单字段，含基础校验
  - **价格明细与计算**: 实时显示单价、数量、小计、总价；数量变化时自动更新
  - **订单时间线展示**: 右侧展示订单流程节点（模型已上传→工艺已校验→供应商接单→生产中→待发货→完成），高亮当前节点
  - **提交下单**: 点击「确认下单」按钮，创建订单记录并跳转至个人中心订单页，toast 提示下单成功
  - **供应链说明**: 底部展示平台撮合说明文案

### 页面：个人中心/订单管理 (`ProfilePage.tsx`)

- **页面目标**: 用户管理积分、查看作品与订单状态
- **功能点**:
  - **Tab 切换**: 顶部三个 Tab——积分账户、我的作品、我的订单，通过 URL query 参数同步
  - **积分账户管理**: 显示当前积分余额、「充值」按钮（弹窗选择充值档位）、积分消耗/充值记录列表（含时间、类型、积分变化、描述）
  - **我的作品展示**: 网格布局展示用户生成的所有作品（效果图 + 3D模型标签），点击可跳转到对应预览页
  - **订单列表与进度**: 订单卡片列表，每张含订单号、商品缩略图、制造方式、价格、状态进度条（待确认→模型复核→生产中→已发货→完成），点击可查看详情

---

## 数据共享配置

| 存储键名 | 数据说明 | 使用页面 |
|---------|---------|---------|
| `__innolumina_credit_balance` | 当前积分余额，类型 `number` | AI创作工作台、个人中心、3D预览页 |
| `__innolumina_credit_records` | 积分消耗/充值记录，类型 `ICreditRecord[]` | 个人中心 |
| `__innolumina_works` | 用户作品列表（效果图+3D模型），类型 `IWork[]` | AI创作工作台、个人中心、3D预览页 |
| `__innolumina_orders` | 订单列表，类型 `IOrder[]` | 制造下单页、个人中心 |
| `__innolumina_currentWork` | 当前选中/正在操作的作品，类型 `IWork` | AI创作工作台、3D预览页、制造下单页 |

```ts
interface ICreditRecord {
  id: string;
  type: 'consume' | 'recharge';
  amount: number;
  description: string;
  createdAt: string;
}

interface IWork {
  id: string;
  prompt: string;
  style: string;
  images: string[]; // 4张效果图URL
  selectedIndex: number; // 选中的效果图索引
  model3d: {
    url: string; // 3D模型预览图URL
    fileName: string;
    dimensions: { width: number; height: number; depth: number }; // mm
    faceCount: number;
  } | null;
  inspectionReport: IInspectionReport | null;
  createdAt: string;
}

interface IInspectionReport {
  overallStatus: 'pass' | 'warning' | 'fail';
  items: {
    name: string; // 网格完整性 / 最小壁厚 / 尺寸范围 / 镂空结构
    status: 'pass' | 'warning' | 'fail';
    value: string;
    detail: string;
  }[];
}

interface IOrder {
  id: string;
  workId: string;
  workImage: string;
  productType: 'stl' | 'resin' | 'glass'; // 下载模型 / 树脂母模 / 琉璃成品
  productName: string;
  quantity: number;
  price: number;
  totalPrice: number;
  status: 'pending' | 'reviewing' | 'producing' | 'shipped' | 'completed';
  receiver: {
    name: string;
    phone: string;
    address: string;
  };
  remark: string;
  createdAt: string;
}
```

---

## 视觉风格参考

根据用户提供的 4 张参考图（DEMO设计方向参考），已确认以下视觉方向：
- 深色科技风背景（深青黑/深墨绿）
- 琉璃质感的青绿色（#00d4aa 系）与琥珀金色（#d4a017 系）作为主色与点缀色
- 全息网格/线框效果用于3D预览
- 玻璃态（Glassmorphism）卡片与面板
- 东方美学韵味的渐变与光效

> 参考图片文件路径：tmp/media/summarize-url-f479921b-*.jpg、tmp/media/summarize-url-daf2c09f-*.jpg、tmp/media/summarize-url-f9eb0c19-*.jpg、tmp/media/summarize-url-ed414fe2-*.jpg，供 design-agent 阶段参考使用。

-------

<scene_type>prototype-app</scene_type>

# UI 设计指南

## 1. 设计推导依据

- **参考意图**: Mood Reference —— 参考图提供深色背景、青绿色琉璃光感、琥珀金色点缀的东方科技氛围与整体色调倾向；布局、组件形态与信息架构按产品需求重建，不做像素级复刻。
- **核心情绪 / 应用类型**: 东方器物美学与数字精密感交融的 AI 创作 + 制造撮合平台，深色沉浸式背景下琉璃器物如被光点亮。
- **独特记忆点**: 深墨底上的"琉璃发光边缘"——所有关键卡片、按钮、选中态都以青绿/琥珀双色微光描边呼应琉璃透光与窑火金纹，而非普通科技蓝霓虹。

## 2. Art Direction

- **方向名**: 墨夜琉光
- **Design Style**: Dark Luxury + Eastern Tech Glass —— 深色基底模拟展厅夜色，主色取琉璃青绿，强调色取窑火琥珀金；卡片如悬浮琉璃片，边缘带内发光；信息排版克制有序，不堆砌装饰。
- **DNA 参数**: 圆角 `rounded-xl`（卡片）/ `rounded-lg`（按钮与输入框）；阴影以内发光 + 极淡外投影为主，不用重投影；间距 `gap-6 / p-6` 标准密度；字体方向为 display 衬线（东方雅致）+ body 无衬线（科技清晰）；装饰手法为细光边、渐变描边、网格底纹克制出现。
- **应用类型**: Workflow + Landing 混合 —— 首页走叙事沉浸，工作台/校验/下单走任务流双栏或多栏布局。

## 3. Color System

**色彩关系**: 深墨绿黑为底（夜色展厅），琉璃青绿为主色（透光与交互），琥珀金为强调色（窑火、价值、制造环节），中性色从深底衍生浅灰边与弱文字。
**配色设计理由**: primary 青绿承担品牌识别、CTA、激活态与成功语义；accent 琥珀金用于制造下单、价格、高亮节点，形成"创意→造物"的色层递进；深底让琉璃器物成为视觉主角，文字与界面退后。
**主色推导**: 从琉璃"青绿色调通透透光"语义出发，取青绿色相 180°，高饱和中明度作为主色；琥珀金取自琉璃窑火与脱蜡铸造的暖色光，色相 38°，作为第二强调色控制在 10% 以内。
**使用比例**: 65% 深中性（bg/card/border）/ 25% 青绿辅助（accent/图标/次级高亮）/ 10% 主色与琥珀金（primary/CTA/制造节点）；主按钮、tab 激活、icon、边框、链接不同时使用 primary。

| 角色 | CSS 变量 | Tailwind Class | HSL 值 | 设计说明 |
|---|---|---|---|---|
| bg | `--background` | `bg-background` | hsl(195 25% 6%) | 深墨绿黑，夜色展厅底 |
| card | `--card` | `bg-card` | hsl(195 20% 10%) | 卡片与面板，略浅于底，带极微绿调 |
| text | `--foreground` | `text-foreground` | hsl(180 15% 92%) | 近白偏青绿，高对比可读 |
| textMuted | `--muted-foreground` | `text-muted-foreground` | hsl(185 10% 60%) | 次级说明、占位符、元信息 |
| primary | `--primary` | `bg-primary` / `text-primary` | hsl(178 70% 50%) | 琉璃青绿，主交互与品牌锚点 |
| primaryForeground | `--primary-foreground` | `text-primary-foreground` | hsl(195 40% 8%) | 深底文字，压在青绿上清晰 |
| accent | `--accent` | `bg-accent` | hsl(38 80% 55%) | 琥珀金，制造/价格/关键节点强调 |
| accentForeground | `--accent-foreground` | `text-accent-foreground` | hsl(30 50% 10%) | 深棕黑，压在琥珀金上 |
| border | `--border` | `border-border` | hsl(185 15% 20%) | 青绿调深灰边，低于文字权重 |

**语义色提示**: 成功 hsl(165 60% 45%) / bg hsl(165 40% 12%) / border hsl(165 50% 30%) / text hsl(165 70% 75%)；警告 hsl(38 80% 55%) / bg hsl(38 40% 12%) / border hsl(38 60% 35%) / text hsl(38 80% 75%)；错误 hsl(8 70% 55%) / bg hsl(8 30% 12%) / border hsl(8 50% 35%) / text hsl(8 75% 78%)；三态均与 primary 同饱和度区间（±15%），避免状态色刺眼。

## 4. 字体与节奏

- **font-display**: Noto Serif SC —— 用于品牌名、Slogan、大标题，承载东方雅致与器物感。
- **font-body**: Noto Sans SC + Inter —— 正文、控件、数据信息，清晰现代，保证长文与表单可读。
- **字号**: H1 text-5xl md:text-6xl（Hero）；H2 text-2xl md:text-3xl；H3 text-xl；body text-base；muted text-sm。
- **圆角**: 中偏大 —— 卡片 `rounded-xl`，按钮与输入 `rounded-lg`，tag 与徽标 `rounded-md`；呼应琉璃曲面但不过度卡通。

## 5. 全局布局契约

- **Reference Layout Use**: 从参考图提取深色沉浸氛围、青绿+琥珀金双色系统、器物中心构图；页面结构、导航形态、组件细节按需求文档自主组织。
- **Page / Section Order**: 首页（Hero→能力→流程→作品→Footer）/ AI创作工作台（左输入右结果）/ 3D预览与工艺校验（左预览右报告）/ 制造下单（三选项卡+表单+价格）/ 个人中心（积分+作品+订单），五页通过顶部导航互通。
- **Standard Content Zone**: Landing 页 `max-w-6xl mx-auto`；工作台与工具页 `max-w-[1400px] mx-auto`，保证左侧输入 + 右侧结果/预览双栏充足。
- **Shell / Frame Alignment**: 顶部导航为全站 chrome，内容区与导航同宽对齐；工作台页左右分栏各自独立滚动，顶部工具条吸顶。
- **Padding & Rhythm**: `px-4 md:px-6 lg:px-8`；首屏 `py-20 md:py-28`，内容区块 `py-16 md:py-20`；垂直节奏 8px 倍数，section 间距 `space-y-16`。
- **Full-bleed Zones**: Hero 背景、作品展示区背景光效可全宽；内部文字、按钮、卡片始终受 Standard Content Zone 约束。
- **Local Narrowing**: 制造下单表单、登录注册弹层收窄至 `max-w-2xl`；积分记录表格使用全宽 + `overflow-x-auto`。
- **Overflow Strategy**: 订单列表、历史作品横向滚动用 `overflow-x-auto`；3D 预览区固定比例容器，内部自适应。
- **Flexibility Boundary**: 允许移动端 padding、卡片内边距、栅格列数微调；不允许切换主色、圆角系统、阴影语言与导航逻辑。

## 6. 视觉与动效

- **装饰**: 细光边描边（青绿/琥珀渐变）、低饱和网格底纹、器物边缘内发光；仅用于 Hero、卡片悬浮态、步骤节点，不铺满。
- **阴影/边界**: 轻 —— 以 `1px` 发光描边替代重投影；卡片 hover 时边缘青绿光加强 + 极微 `shadow-lg` 提升。
- **动效**: 精致克制 —— 按钮/卡片 hover 200ms 光边过渡；AI 生成加载用环形粒子光晕（琉璃窑火意象）；页面切换淡入 300ms；关键操作（积分扣减、下单确认）有金色脉冲反馈。

## 7. 组件原则

- 按钮三档：Primary（青绿实底 + 微光边）、Secondary（深底 + 青绿描边）、Ghost（透明 + hover 青绿浅底）；制造类主行动使用琥珀金实底。
- 卡片默认 `bg-card` + `border border-border`，hover 时 border 过渡为青绿发光；选中/激活态使用琥珀金细边。
- 输入框与下拉：深底 + 浅边，focus 时青绿外发光 `ring-2 ring-primary/40`，不使用默认蓝。
- 校验报告状态标签：通过=青绿、需注意=琥珀、不通过=暖红；均配图标，不以色为唯一表达。
- 加载与空状态延续琉璃光粒子与器物线稿，不回退到默认 spinner。

## 8. Image Direction

- **Image Role**: Hero 主视觉器物图 + 作品展示案例图 + 制造选项缩略图 + 背景氛围光效层。
- **Image Art Direction**: 深夜色展厅背景中，单件琉璃器物居中或偏左放置，侧上方一束冷光打亮曲面，内部透出青绿与琥珀金双色流光；材质通透有折射，底部有淡金色反光；构图简洁克制，留足文字叠放空间；背景可叠加极低透明度网格线强化数字感。
- **Image Prompt Keywords**: 琉璃器物、青绿色调、琥珀金透光、脱蜡铸造质感、深色展厅背景、侧光打亮、曲面折射、东方美学、极简构图、粒子微光、高端静物摄影、8K 写实。
- **Image Avoidance**: 电商白底图、人物手持摆拍、过度饱和彩虹色、廉价 3D 渲染感、杂乱多器物堆放在一起、无光源逻辑的平均铺光。

## 9. Anti-patterns

- **科技蓝回退**: 看到 AI 就用默认蓝色渐变；必须用琉璃青绿做主色，琥珀金做制造强调。
- **金箔堆砌**: 琥珀金铺满按钮、边框、图标、价格；金色只用于制造节点、价格、关键 CTA，权重 ≤10%。
- **霓虹过载**: 整页发光边框、粒子特效、动画同时出现；发光仅用于 hover、激活态、加载动画，默认态克制。
- **Split personality**: 首页用深色沉浸，工作台突然变白；全站统一深底 + 琉璃双色系统。
- **Mono-hue tyranny**: 主按钮、tab、icon、边框、链接全用青绿；按 65-25-10 分配深底/青绿辅助/主色与金色。
- **Status color drift**: 错误警告用刺眼正红；语义色饱和度与 primary 对齐（60-75% 区间），保持深夜气质。
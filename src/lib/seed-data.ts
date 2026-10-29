import {
  isInitialized,
  markInitialized,
  setUser,
  setOrders,
  setSquareWorks,
  setEarnings,
  setWorks,
  genOrderNo,
  genTrackingNo,
  formatDate,
  genId,
  safeSet,
} from './app-storage';
import type { IUser, IOrderDetail, ISquareWork, IEarningRecord, IExtendedCreditRecord } from '@/data/types';
import type { IWork } from '@/data/glassmorphism';
import { avatarImages } from '@lark-apaas/client-toolkit-lite';

// inno.Studio 真实产品图
const INNO_WALLEDORF = 'https://aka.doubaocdn.com/s/tURJSa69Pp';
const INNO_AMBER_BOX = 'https://aka.doubaocdn.com/s/OcXBD3ZduI';
const INNO_CELADON_BOX = 'https://aka.doubaocdn.com/s/S2UV8x8OJW';
const INNO_BEGONIA = 'https://aka.doubaocdn.com/s/vzu0aDGEEo';
const INNO_GREEN_SET = 'https://aka.doubaocdn.com/s/MuSariB5Zi';
const INNO_EXHIBITION = 'https://aka.doubaocdn.com/s/LVbPrWhVuf';
const INNO_ZHUYE = 'https://aka.doubaocdn.com/s/ebuZ2qj5Qp';
const INNO_AMBER_CHANG = 'https://aka.doubaocdn.com/s/5Vf3Ioknni';

const TEST_USER_ID = 'user_test_001';

// 测试账号
function buildTestUser(): IUser {
  return {
    id: TEST_USER_ID,
    phone: '13800138000',
    nickname: '琉衍体验官',
    avatar: avatarImages.avatarImg2,
    role: 'creator',
    points: 1250,
    token: 'test_token_' + Math.random().toString(36).slice(2, 12),
    expireAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    createdAt: '2026-08-01 10:00',
  };
}

// 预置作品
function buildSeedWorks(): IWork[] {
  const baseDate = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
  const d = (offset: number) => {
    const nd = new Date(baseDate.getTime() + offset * 24 * 60 * 60 * 1000);
    return formatDate(nd);
  };
  return [
    {
      id: 'work-amber',
      prompt: '四时物候系列琥珀色委角琉璃匣，磨砂通透质感，传统器型，浮雕花卉纹样',
      style: '东方美学',
      source: 'text',
      images: [INNO_AMBER_BOX, INNO_GREEN_SET, INNO_CELADON_BOX, INNO_BEGONIA],
      selectedIndex: 0,
      model3d: {
        url: INNO_AMBER_BOX,
        fileName: 'amber_hexagonal_box.stl',
        dimensions: { width: 80, height: 50, depth: 80 },
        faceCount: 62400,
      },
      inspectionReport: {
        overallStatus: 'pass',
        items: [
          { name: '网格完整性', status: 'pass', value: '无破面', detail: '模型拓扑结构完整，无非流形边' },
          { name: '最小壁厚', status: 'pass', value: '4.5mm', detail: '壁厚均匀，器壁转角处过渡自然' },
          { name: '尺寸范围', status: 'pass', value: '80×50mm', detail: '标准小件器物尺寸，铸造良率高' },
          { name: '镂空结构', status: 'pass', value: '无镂空', detail: '实体浮雕纹样，工艺风险低' },
        ],
      },
      createdAt: d(0),
    },
    {
      id: 'work-celadon',
      prompt: '四时物候系列淡青色八角琉璃匣，四宫格多角度，浮雕竹兰纹样，清新淡雅',
      style: '东方美学',
      source: 'text',
      images: [INNO_CELADON_BOX, INNO_GREEN_SET, INNO_BEGONIA, INNO_AMBER_BOX],
      selectedIndex: 0,
      model3d: {
        url: INNO_CELADON_BOX,
        fileName: 'celadon_octagon_box.stl',
        dimensions: { width: 70, height: 45, depth: 70 },
        faceCount: 58600,
      },
      inspectionReport: {
        overallStatus: 'pass',
        items: [
          { name: '网格完整性', status: 'pass', value: '无破面', detail: '八角形结构规整，几何面清晰' },
          { name: '最小壁厚', status: 'pass', value: '3.8mm', detail: '棱角处壁厚均匀，无锐角薄弱点' },
          { name: '尺寸范围', status: 'pass', value: '70×45mm', detail: '首饰匣尺寸，适合失蜡铸造' },
          { name: '镂空结构', status: 'pass', value: '无镂空', detail: '表面浮雕，工艺成熟' },
        ],
      },
      createdAt: d(1),
    },
    {
      id: 'work-begonia',
      prompt: '海棠形透明琉璃香插花器，海棠形轮廓，内嵌大理石纹理，黑色背景艺术感',
      style: '东方美学',
      source: 'text',
      images: [INNO_BEGONIA, INNO_AMBER_BOX, INNO_CELADON_BOX, INNO_GREEN_SET],
      selectedIndex: 0,
      model3d: {
        url: INNO_BEGONIA,
        fileName: 'begonia_incense_holder.stl',
        dimensions: { width: 100, height: 30, depth: 60 },
        faceCount: 75200,
      },
      inspectionReport: {
        overallStatus: 'pass',
        items: [
          { name: '网格完整性', status: 'pass', value: '无破面', detail: '海棠形曲面连续，拓扑结构完整' },
          { name: '最小壁厚', status: 'pass', value: '5mm', detail: '器壁厚度均匀，口沿处自然收窄' },
          { name: '尺寸范围', status: 'pass', value: '100×30mm', detail: '扁平器型，铸造排气顺畅' },
          { name: '镂空结构', status: 'pass', value: '无镂空', detail: '实心底座+开放器口，工艺简单' },
        ],
      },
      createdAt: d(2),
    },
    {
      id: 'work-zhuye',
      prompt: '竹叶八角琉璃匣，淡青色竹叶浮雕，极简留白，东方文人意趣',
      style: '自然意象',
      source: 'text',
      images: [INNO_ZHUYE, INNO_CELADON_BOX, INNO_GREEN_SET, INNO_BEGONIA],
      selectedIndex: 0,
      model3d: {
        url: INNO_ZHUYE,
        fileName: 'bamboo_octagon_box.stl',
        dimensions: { width: 72, height: 48, depth: 72 },
        faceCount: 64800,
      },
      inspectionReport: {
        overallStatus: 'pass',
        items: [
          { name: '网格完整性', status: 'pass', value: '无破面', detail: '竹叶纹理清晰，无破面' },
          { name: '最小壁厚', status: 'pass', value: '4mm', detail: '竹叶浮雕处壁厚均匀' },
          { name: '尺寸范围', status: 'pass', value: '72×48mm', detail: '标准尺寸，良率高' },
          { name: '镂空结构', status: 'warning', value: '竹叶浮雕', detail: '需注意浮雕深度均匀' },
        ],
      },
      createdAt: d(3),
    },
    {
      id: 'work-exhibition',
      prompt: '四时物候系列展览陈列，多色琉璃匣玻璃展台陈列，窗边自然光极简空间',
      style: '东方美学',
      source: 'text',
      images: [INNO_EXHIBITION, INNO_WALLEDORF, INNO_AMBER_BOX, INNO_GREEN_SET],
      selectedIndex: 0,
      model3d: null,
      inspectionReport: null,
      createdAt: d(4),
    },
    {
      id: 'work-waldorf',
      prompt: '穹宇拂光柜，藻井纹玻璃展示柜，黑色金属框架，水晶台灯，酒店级空间装置',
      style: '东方美学',
      source: 'text',
      images: [INNO_WALLEDORF, INNO_EXHIBITION, INNO_BEGONIA, INNO_GREEN_SET],
      selectedIndex: 0,
      model3d: {
        url: INNO_WALLEDORF,
        fileName: 'dome_light_cabinet.stl',
        dimensions: { width: 1200, height: 1600, depth: 400 },
        faceCount: 420000,
      },
      inspectionReport: {
        overallStatus: 'warning',
        items: [
          { name: '网格完整性', status: 'pass', value: '无破面', detail: '大尺寸展柜结构完整' },
          { name: '最小壁厚', status: 'warning', value: '6mm', detail: '玻璃面板建议钢化处理' },
          { name: '尺寸范围', status: 'warning', value: '1200×1600mm', detail: '酒店级大尺寸，需分件组装' },
          { name: '镂空结构', status: 'warning', value: '藻井纹蚀刻', detail: '传统纹样玻璃蚀刻，需高精度工艺' },
        ],
      },
      createdAt: d(5),
    },
  ];
}

// 预置广场作品
function buildSeedSquareWorks(): ISquareWork[] {
  const baseDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const d = (offset: number) => {
    const nd = new Date(baseDate.getTime() + offset * 24 * 60 * 60 * 1000);
    return formatDate(nd);
  };
  const creatorAvatar = avatarImages.avatarImg3;
  const works: Array<Omit<ISquareWork, 'id' | 'creatorId'>> = [
    {
      workId: 'work-amber',
      creatorName: '琉光匠坊',
      creatorAvatar,
      title: '四时物候 · 琥珀委角匣',
      coverImage: INNO_AMBER_BOX,
      images: [INNO_AMBER_BOX, INNO_GREEN_SET, INNO_CELADON_BOX],
      prompt: '琥珀色磨砂通透，搭配银饰项链，东方雅致与现代质感交融',
      style: '东方美学',
      auditStatus: 'approved',
      isPublic: true,
      likeCount: 328,
      viewCount: 1560,
      price: 580,
      createdAt: d(0),
      auditedAt: d(0),
    },
    {
      workId: 'work-celadon',
      creatorName: '青釉工坊',
      creatorAvatar: avatarImages.avatarImg5,
      title: '四时物候 · 淡青八角匣',
      coverImage: INNO_CELADON_BOX,
      images: [INNO_CELADON_BOX, INNO_ZHUYE, INNO_BEGONIA],
      prompt: '淡青色清新雅致，四宫格展示，搭配银饰首饰',
      style: '东方美学',
      auditStatus: 'approved',
      isPublic: true,
      likeCount: 256,
      viewCount: 1200,
      price: 520,
      createdAt: d(2),
      auditedAt: d(2),
    },
    {
      workId: 'work-begonia',
      creatorName: '琉光匠坊',
      creatorAvatar,
      title: '海棠形琉璃香插',
      coverImage: INNO_BEGONIA,
      images: [INNO_BEGONIA, INNO_AMBER_BOX],
      prompt: '透明琉璃内嵌大理石纹理，海棠轮廓，艺术花器',
      style: '东方美学',
      auditStatus: 'approved',
      isPublic: true,
      likeCount: 198,
      viewCount: 890,
      price: 380,
      createdAt: d(3),
      auditedAt: d(3),
    },
    {
      workId: 'work-green',
      creatorName: '青釉工坊',
      creatorAvatar: avatarImages.avatarImg5,
      title: '绿色琉璃匣合集',
      coverImage: INNO_GREEN_SET,
      images: [INNO_GREEN_SET, INNO_CELADON_BOX, INNO_BEGONIA, INNO_EXHIBITION],
      prompt: '椭圆匣、八角匣、长匣，浮雕花卉纹样清新自然',
      style: '自然意象',
      auditStatus: 'approved',
      isPublic: true,
      likeCount: 412,
      viewCount: 2100,
      price: 680,
      createdAt: d(5),
      auditedAt: d(5),
    },
    {
      workId: 'work-zhuye',
      creatorName: '竹影匠人',
      creatorAvatar: avatarImages.avatarImg7,
      title: '竹叶八角琉璃匣',
      coverImage: INNO_ZHUYE,
      images: [INNO_ZHUYE, INNO_CELADON_BOX],
      prompt: '淡青色竹叶浮雕，极简留白，东方文人意趣',
      style: '自然意象',
      auditStatus: 'approved',
      isPublic: true,
      likeCount: 276,
      viewCount: 1450,
      price: 480,
      createdAt: d(7),
      auditedAt: d(7),
    },
    {
      workId: 'work-exhibition',
      creatorName: '琉光匠坊',
      creatorAvatar,
      title: '四时物候展览陈列',
      coverImage: INNO_EXHIBITION,
      images: [INNO_EXHIBITION, INNO_WALLEDORF, INNO_AMBER_BOX, INNO_GREEN_SET],
      prompt: '多色琉璃匣玻璃展台陈列，窗边自然光极简空间',
      style: '东方美学',
      auditStatus: 'approved',
      isPublic: true,
      likeCount: 534,
      viewCount: 2800,
      createdAt: d(10),
      auditedAt: d(10),
    },
    {
      workId: 'work-waldorf',
      creatorName: '穹宇设计',
      creatorAvatar: avatarImages.avatarImg9,
      title: '穹宇 · 拂光柜',
      coverImage: INNO_WALLEDORF,
      images: [INNO_WALLEDORF, INNO_EXHIBITION],
      prompt: '上海前滩华尔道夫酒店入驻作品，藻井纹玻璃展柜+水晶台灯',
      style: '东方美学',
      auditStatus: 'approved',
      isPublic: true,
      likeCount: 892,
      viewCount: 4200,
      price: 12800,
      createdAt: d(15),
      auditedAt: d(15),
    },
    {
      workId: 'work-amber-chang',
      creatorName: '琉光匠坊',
      creatorAvatar,
      title: '琥珀色海棠长匣',
      coverImage: INNO_AMBER_CHANG,
      images: [INNO_AMBER_CHANG, INNO_BEGONIA],
      prompt: '琥珀色暖调，海棠形轮廓，温润如玉',
      style: '东方美学',
      auditStatus: 'approved',
      isPublic: true,
      likeCount: 186,
      viewCount: 780,
      price: 460,
      createdAt: d(18),
      auditedAt: d(18),
    },
  ];
  return works.map((w, i) => ({
    ...w,
    id: `sq_${i + 1}`,
    creatorId: TEST_USER_ID,
  }));
}

// 预置订单
function buildSeedOrders(): IOrderDetail[] {
  const now = Date.now();
  const d = (daysAgo: number, hours = 0) => {
    return formatDate(new Date(now - daysAgo * 24 * 60 * 60 * 1000 - hours * 60 * 60 * 1000));
  };

  return [
    {
      id: 'ord_001',
      orderNo: genOrderNo(),
      workId: 'work-zhuye',
      workImage: INNO_ZHUYE,
      productType: 'glass',
      productName: '脱蜡铸造琉璃成品 - 竹叶八角匣',
      quantity: 1,
      price: 580,
      totalPrice: 580,
      status: 'completed',
      receiver: { name: '张先生', phone: '13800138000', address: '上海市徐汇区漕河泾开发区宜山路701号创意园B栋506室' },
      remark: '请保证竹叶浮雕纹理清晰',
      createdAt: d(15, 4),
      paidAt: d(15, 3),
      reviewedAt: d(14, 20),
      producedAt: d(12, 8),
      shippedAt: d(5, 2),
      completedAt: d(2, 6),
      productionProgress: 100,
      trackingNo: genTrackingNo(),
      trackingCompany: '顺丰速运',
      creatorId: TEST_USER_ID,
      creatorEarning: 116,
    },
    {
      id: 'ord_002',
      orderNo: genOrderNo(),
      workId: 'work-begonia',
      workImage: INNO_BEGONIA,
      productType: 'resin',
      productName: '3D打印树脂母模 - 海棠形琉璃香插',
      quantity: 2,
      price: 98,
      totalPrice: 196,
      status: 'producing',
      receiver: { name: '李女士', phone: '139****6666', address: '北京市朝阳区望京SOHO T3座' },
      remark: '',
      createdAt: d(3, 6),
      paidAt: d(3, 5),
      reviewedAt: d(3, 2),
      productionProgress: 60,
      creatorId: TEST_USER_ID,
      creatorEarning: 29,
    },
    {
      id: 'ord_003',
      orderNo: genOrderNo(),
      workId: 'work-amber',
      workImage: INNO_AMBER_BOX,
      productType: 'glass',
      productName: '脱蜡铸造琉璃成品 - 琥珀委角匣',
      quantity: 1,
      price: 580,
      totalPrice: 580,
      status: 'shipped',
      receiver: { name: '王女士', phone: '137****2222', address: '杭州市西湖区文三路478号' },
      remark: '请精心打磨',
      createdAt: d(8, 3),
      paidAt: d(8, 2),
      reviewedAt: d(7, 20),
      producedAt: d(5, 10),
      shippedAt: d(1, 4),
      productionProgress: 100,
      trackingNo: genTrackingNo(),
      trackingCompany: '顺丰速运',
      creatorId: TEST_USER_ID,
      creatorEarning: 116,
    },
    {
      id: 'ord_004',
      orderNo: genOrderNo(),
      workId: 'work-amber-chang',
      workImage: INNO_AMBER_CHANG,
      productType: 'glass',
      productName: '脱蜡铸造琉璃成品 - 琥珀色海棠长匣',
      quantity: 1,
      price: 460,
      totalPrice: 460,
      status: 'pending',
      receiver: { name: '陈女士', phone: '136****7777', address: '广州市天河区珠江新城' },
      remark: '',
      createdAt: d(0, 2),
      productionProgress: 0,
      creatorId: TEST_USER_ID,
      creatorEarning: 92,
    },
  ];
}

// 预置收益记录
function buildSeedEarnings(): IEarningRecord[] {
  const now = Date.now();
  const d = (daysAgo: number) => formatDate(new Date(now - daysAgo * 24 * 60 * 60 * 1000));
  return [
    {
      id: 'earn_001',
      creatorId: TEST_USER_ID,
      orderId: 'ord_001',
      orderNo: 'IL_completed_001',
      workTitle: '竹叶八角匣',
      amount: 116,
      status: 'available',
      createdAt: d(15),
      settledAt: d(8),
    },
    {
      id: 'earn_002',
      creatorId: TEST_USER_ID,
      orderId: 'ord_003',
      orderNo: 'IL_shipped_003',
      workTitle: '琥珀委角匣',
      amount: 116,
      status: 'pending',
      createdAt: d(8),
    },
    {
      id: 'earn_003',
      creatorId: TEST_USER_ID,
      orderId: 'ord_002',
      orderNo: 'IL_producing_002',
      workTitle: '海棠形琉璃香插',
      amount: 29,
      status: 'pending',
      createdAt: d(3),
    },
    {
      id: 'earn_004',
      creatorId: TEST_USER_ID,
      orderId: 'ord_prev_1',
      orderNo: 'IL_prev_001',
      workTitle: '青玉茶则',
      amount: 68,
      status: 'withdrawn',
      createdAt: d(30),
      settledAt: d(23),
      withdrawnAt: d(20),
    },
    {
      id: 'earn_005',
      creatorId: TEST_USER_ID,
      orderId: 'ord_prev_2',
      orderNo: 'IL_prev_002',
      workTitle: '云纹琉璃笔架',
      amount: 52,
      status: 'available',
      createdAt: d(25),
      settledAt: d(18),
    },
    {
      id: 'earn_006',
      creatorId: TEST_USER_ID,
      orderId: 'ord_prev_3',
      orderNo: 'IL_prev_003',
      workTitle: '山水琉璃镇纸',
      amount: 84,
      status: 'withdrawn',
      createdAt: d(40),
      settledAt: d(33),
      withdrawnAt: d(30),
    },
  ];
}

// 预置积分流水
function buildSeedPointRecords(): IExtendedCreditRecord[] {
  const now = Date.now();
  const d = (daysAgo: number, hours = 0) =>
    formatDate(new Date(now - daysAgo * 24 * 60 * 60 * 1000 - hours * 60 * 60 * 1000));
  return [
    { id: 'pr_001', type: 'recharge', amount: 1000, balance: 1050, bizType: 'recharge', description: '充值 1000 积分套餐', createdAt: d(20, 4) },
    { id: 'pr_002', type: 'consume', amount: 20, balance: 1030, bizType: 'text_to_image', description: '文生琉璃图', createdAt: d(15, 10) },
    { id: 'pr_003', type: 'consume', amount: 50, balance: 980, bizType: 'to_3d', description: '2D转3D建模', createdAt: d(15, 11) },
    { id: 'pr_004', type: 'consume', amount: 20, balance: 960, bizType: 'text_to_image', description: '文生琉璃图', createdAt: d(12, 9) },
    { id: 'pr_005', type: 'consume', amount: 30, balance: 930, bizType: 'image_to_image', description: '图生琉璃图', createdAt: d(10, 14) },
    { id: 'pr_006', type: 'consume', amount: 50, balance: 880, bizType: 'to_3d', description: '2D转3D建模', createdAt: d(8, 16) },
    { id: 'pr_007', type: 'recharge', amount: 500, balance: 1380, bizType: 'recharge', description: '充值 500 积分套餐', createdAt: d(5, 2) },
    { id: 'pr_008', type: 'consume', amount: 20, balance: 1360, bizType: 'text_to_image', description: '文生琉璃图', createdAt: d(3, 10) },
    { id: 'pr_009', type: 'consume', amount: 20, balance: 1340, bizType: 'text_to_image', description: '文生琉璃图', createdAt: d(2, 15) },
    { id: 'pr_010', type: 'consume', amount: 50, balance: 1290, bizType: 'to_3d', description: '2D转3D建模', createdAt: d(1, 10) },
    { id: 'pr_011', type: 'consume', amount: 20, balance: 1270, bizType: 'text_to_image', description: '文生琉璃图', createdAt: d(0, 4) },
    { id: 'pr_012', type: 'consume', amount: 20, balance: 1250, bizType: 'text_to_image', description: '文生琉璃图', createdAt: d(0, 2) },
  ];
}

export function initializeAppData() {
  if (isInitialized()) return;

  const user = buildTestUser();
  setUser(user);
  setWorks(buildSeedWorks());
  setSquareWorks(buildSeedSquareWorks());
  setOrders(buildSeedOrders());
  setEarnings(buildSeedEarnings());

  // 积分流水
  const records = buildSeedPointRecords();
  safeSet('innolumina_point_records', records);

  // 充值记录
  const rechargeRecords = [
    {
      id: genId('rc_'),
      userId: TEST_USER_ID,
      packageId: 'pkg_1000',
      packageName: '1000 积分套餐',
      amount: 80,
      points: 1000,
      bonusPoints: 150,
      status: 'success' as const,
      paidAt: formatDate(new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)),
      createdAt: formatDate(new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)),
    },
    {
      id: genId('rc_'),
      userId: TEST_USER_ID,
      packageId: 'pkg_500',
      packageName: '500 积分套餐',
      amount: 45,
      points: 500,
      bonusPoints: 50,
      status: 'success' as const,
      paidAt: formatDate(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)),
      createdAt: formatDate(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)),
    },
  ];
  safeSet('innolumina_recharge_records', rechargeRecords);

  markInitialized();
}

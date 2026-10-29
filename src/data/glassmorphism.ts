// EXPORTS: IWork, IInspectionReport, MOCK_WORKS, ICreditRecord, IOrder
export interface IInspectionReport {
  overallStatus: 'pass' | 'warning' | 'fail'
  items: {
    name: string
    status: 'pass' | 'warning' | 'fail'
    value: string
    detail: string
  }[]
}

export interface IWork {
  id: string
  prompt: string
  style: string
  source: 'text' | 'image'
  images: string[]
  selectedIndex: number
  model3d: {
    url: string
    fileName: string
    dimensions: { width: number; height: number; depth: number }
    faceCount: number
  } | null
  inspectionReport: IInspectionReport | null
  createdAt: string
}

export interface ICreditRecord {
  id: string
  type: 'consume' | 'recharge'
  amount: number
  description: string
  createdAt: string
}

export interface IOrder {
  id: string
  workId: string
  workImage: string
  productType: 'stl' | 'resin' | 'glass'
  productName: string
  quantity: number
  price: number
  totalPrice: number
  status: 'pending' | 'reviewing' | 'producing' | 'shipped' | 'completed'
  receiver: {
    name: string
    phone: string
    address: string
  }
  remark: string
  createdAt: string
}

// inno.Studio 真实产品图（小红书官方账号）
const INNO_WALLEDORF = 'https://aka.doubaocdn.com/s/tURJSa69Pp'
const INNO_AMBER_BOX = 'https://aka.doubaocdn.com/s/OcXBD3ZduI'
const INNO_CELADON_BOX = 'https://aka.doubaocdn.com/s/S2UV8x8OJW'
const INNO_BEGONIA = 'https://aka.doubaocdn.com/s/vzu0aDGEEo'
const INNO_GREEN_SET = 'https://aka.doubaocdn.com/s/MuSariB5Zi'
const INNO_EXHIBITION = 'https://aka.doubaocdn.com/s/LVbPrWhVuf'

export const MOCK_WORKS: IWork[] = [
  {
    id: 'work-amber',
    prompt: '四时物候系列琥珀色委角琉璃匣，磨砂通透质感，传统器型，浮雕花卉纹样',
    style: '东方美学',
    source: 'image',
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
    createdAt: '2025-01-17 10:20',
  },
  {
    id: 'work-celadon',
    prompt: '四时物候系列淡青色八角琉璃匣，四宫格多角度，浮雕竹兰纹样，清新淡雅',
    style: '东方美学',
    source: 'image',
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
    createdAt: '2025-01-16 14:30',
  },
  {
    id: 'work-green',
    prompt: '四时物候系列绿色琉璃匣合集，椭圆匣、八角匣、长匣，浮雕花卉纹样清新自然',
    style: '自然意象',
    source: 'image',
    images: [INNO_GREEN_SET, INNO_CELADON_BOX, INNO_BEGONIA, INNO_EXHIBITION],
    selectedIndex: 0,
    model3d: {
      url: INNO_GREEN_SET,
      fileName: 'green_box_collection.stl',
      dimensions: { width: 120, height: 40, depth: 60 },
      faceCount: 92000,
    },
    inspectionReport: {
      overallStatus: 'warning',
      items: [
        { name: '网格完整性', status: 'pass', value: '无破面', detail: '多器型组合结构完整' },
        { name: '最小壁厚', status: 'pass', value: '4mm', detail: '浮雕处壁厚控制良好' },
        { name: '尺寸范围', status: 'pass', value: '120×40mm', detail: '长匣略超常规，整体可控' },
        { name: '镂空结构', status: 'warning', value: '花卉浮雕', detail: '表面浮雕深浅不一，需手工修模' },
      ],
    },
    createdAt: '2025-01-15 11:30',
  },
  {
    id: 'work-begonia',
    prompt: '海棠形透明琉璃香插花器，海棠形轮廓，内嵌大理石纹理，黑色背景艺术感',
    style: '东方美学',
    source: 'image',
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
    createdAt: '2025-01-14 16:00',
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
    createdAt: '2025-01-13 09:12',
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
        { name: '网格完整性', status: 'pass', value: '无破面', detail: '大尺寸展柜结构完整，玻璃面平整' },
        { name: '最小壁厚', status: 'warning', value: '6mm', detail: '玻璃面板建议钢化处理，提升安全性' },
        { name: '尺寸范围', status: 'warning', value: '1200×1600mm', detail: '酒店级大尺寸，需分件组装' },
        { name: '镂空结构', status: 'warning', value: '藻井纹蚀刻', detail: '传统纹样玻璃蚀刻，需高精度工艺' },
      ],
    },
    createdAt: '2025-01-12 08:45',
  },
]

export const MOCK_CREDIT_RECORDS: ICreditRecord[] = [
  { id: 'r1', type: 'recharge', amount: 500, description: '新手礼包赠送', createdAt: '2025-01-10 10:00' },
  { id: 'r2', type: 'consume', amount: 20, description: 'AI生成效果图 ×1次', createdAt: '2025-01-13 16:40' },
  { id: 'r3', type: 'consume', amount: 50, description: '2D转3D建模 ×1次', createdAt: '2025-01-13 16:45' },
  { id: 'r4', type: 'consume', amount: 20, description: 'AI生成效果图 ×1次', createdAt: '2025-01-14 09:08' },
  { id: 'r5', type: 'consume', amount: 20, description: 'AI生成效果图 ×1次', createdAt: '2025-01-15 14:25' },
  { id: 'r6', type: 'consume', amount: 50, description: '2D转3D建模 ×1次', createdAt: '2025-01-15 14:30' },
]

export const MOCK_ORDERS: IOrder[] = [
  {
    id: 'ORD20260915001',
    workId: 'work-zhuye',
    workImage: 'https://aka.doubaocdn.com/s/ebuZ2qj5Qp',
    productType: 'glass',
    productName: '脱蜡铸造琉璃成品 - 四时物候·竹叶八角匣',
    quantity: 1,
    price: 580,
    totalPrice: 580,
    status: 'completed',
    receiver: { name: '张先生', phone: '138****8888', address: '上海市浦东新区前滩华尔道夫' },
    remark: '请保证竹叶浮雕纹理清晰',
    createdAt: '2026-09-10 14:20',
  },
  {
    id: 'ORD20260914002',
    workId: 'work-begonia',
    workImage: 'https://aka.doubaocdn.com/s/vzu0aDGEEo',
    productType: 'resin',
    productName: '3D打印树脂母模 - 海棠形琉璃香插',
    quantity: 2,
    price: 98,
    totalPrice: 196,
    status: 'producing',
    receiver: { name: '李女士', phone: '139****6666', address: '北京市朝阳区望京SOHO' },
    remark: '',
    createdAt: '2026-09-14 10:15',
  },
  {
    id: 'ORD20260912003',
    workId: 'work-blue',
    workImage: 'https://aka.doubaocdn.com/s/7rwGii02CN',
    productType: 'stl',
    productName: 'STL模型下载 - 椭圆磨砂蓝琉璃匣',
    quantity: 1,
    price: 29,
    totalPrice: 29,
    status: 'completed',
    receiver: { name: '王先生', phone: '137****2222', address: '广州市天河区珠江新城' },
    remark: '',
    createdAt: '2026-09-12 16:40',
  },
  {
    id: 'ORD20260916004',
    workId: 'work-amber-chang',
    workImage: 'https://aka.doubaocdn.com/s/5Vf3Ioknni',
    productType: 'glass',
    productName: '脱蜡铸造琉璃成品 - 琥珀色海棠长匣',
    quantity: 1,
    price: 460,
    totalPrice: 460,
    status: 'pending',
    receiver: { name: '陈女士', phone: '136****7777', address: '杭州市西湖区文三路' },
    remark: '请精心打磨海棠轮廓',
    createdAt: '2026-09-16 09:30',
  },
]

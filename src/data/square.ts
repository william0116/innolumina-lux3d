// EXPORTS: ISquareWork, ICreator, ISquareUploadForm, MOCK_SQUARE_WORKS, MOCK_CREATORS, STYLE_TAGS, PRICE_RANGES, SORT_OPTIONS, ROYALTY_OPTIONS
import { avatarImages } from '@lark-apaas/client-toolkit-lite';
import { INNO_REAL_IMAGES } from './showcase';

export interface ICreator {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  followers: number;
}

export interface ISquareWork {
  id: string;
  title: string;
  description: string;
  images: string[];
  creator: ICreator;
  tags: string[];
  priceMin: number;
  priceMax: number;
  basePrice: number;
  royaltyRate: number; // 分成比例 0-1
  likes: number;
  favorites: number;
  sales: number;
  dimensions: string; // 建议尺寸
  material: string; // 材质
  craft: string; // 工艺说明
  createdAt: string;
  isPublic: boolean;
  status: 'published' | 'reviewing' | 'private' | 'offline';
  revenue: number; // 累计收益
  auditStatus: 'pending' | 'approved' | 'rejected';
  auditReason?: string;
  auditedAt?: string;
}

export interface ISquareUploadForm {
  images: string[];
  title: string;
  description: string;
  tags: string[];
  dimensions: string;
  material: string;
  basePrice: number;
  royaltyRate: number;
  isPublic: boolean;
}

export const STYLE_TAGS = ['东方美学', '现代极简', '自然意象', '几何抽象', '禅意留白', '复古轻奢', '童趣可爱', '赛博朋克'];

export const CATEGORY_TAGS = [
  { value: 'all', label: '全部' },
  { value: 'incense', label: '香插' },
  { value: 'liuli-box', label: '琉璃匣' },
  { value: 'lamp', label: '灯饰' },
  { value: 'decor', label: '摆件' },
  { value: 'tea', label: '茶具' },
  { value: 'other', label: '其他' },
];

export const PRICE_RANGES = [
  { value: 'all', label: '全部价格' },
  { value: '0-300', label: '¥300 以下' },
  { value: '300-600', label: '¥300-600' },
  { value: '600-1000', label: '¥600-1000' },
  { value: '1000+', label: '¥1000 以上' },
];

export const SORT_OPTIONS = [
  { value: 'hot', label: '最热门' },
  { value: 'new', label: '最新上架' },
  { value: 'price-asc', label: '价格从低到高' },
  { value: 'price-desc', label: '价格从高到低' },
];

export const ROYALTY_OPTIONS = [
  { rate: 0.10, label: '10%', desc: '低分成，更容易被下单' },
  { rate: 0.15, label: '15%', desc: '平台推荐，收益与销量平衡' },
  { rate: 0.20, label: '20%', desc: '高分成，适合稀缺作品' },
];

// 示例创作者
export const MOCK_CREATORS: ICreator[] = [
  {
    id: 'creator-1',
    name: '琉光匠坊',
    avatar: avatarImages.avatarImg1,
    bio: '专注东方琉璃器物设计，传承古法脱蜡铸造',
    followers: 2356,
  },
  {
    id: 'creator-2',
    name: '青山设计工作室',
    avatar: avatarImages.avatarImg2,
    bio: '现代极简主义器物设计，让生活有光',
    followers: 1820,
  },
  {
    id: 'creator-3',
    name: '莫小七',
    avatar: avatarImages.avatarImg3,
    bio: '独立设计师，擅长自然意象与禅意留白',
    followers: 987,
  },
  {
    id: 'creator-4',
    name: '几何研究所',
    avatar: avatarImages.avatarImg4,
    bio: '用几何语言讲述器物之美',
    followers: 1543,
  },
];

// 示例作品（使用 inno.Studio 真实产品图）
export const MOCK_SQUARE_WORKS: ISquareWork[] = [
  {
    id: 'square-1',
    title: '四时物候 · 委角匣',
    description: '琥珀色磨砂通透，传统器型搭配浮雕花卉纹样。灵感来自宋代瓷窑的窑变之美，每一件都是独一无二的光影诗篇。',
    images: [INNO_REAL_IMAGES.amberWeijiao, INNO_REAL_IMAGES.amberChang, INNO_REAL_IMAGES.greenSet],
    creator: MOCK_CREATORS[0],
    tags: ['东方美学', '复古轻奢', 'liuli-box'],
    priceMin: 399,
    priceMax: 699,
    basePrice: 399,
    royaltyRate: 0.15,
    likes: 328,
    favorites: 156,
    sales: 42,
    dimensions: '80×80×50 mm',
    material: '高硼硅琉璃',
    craft: '脱蜡铸造，手工打磨',
    createdAt: '2024-11-15',
    isPublic: true,
    status: 'published',
    auditStatus: 'approved',
    revenue: 2514,
  },
  {
    id: 'square-2',
    title: '竹叶浮雕八角匣',
    description: '淡青色竹叶浮雕，极简留白设计，尽显东方文人意趣。竹叶纹理细腻通透，光影下如微风轻拂。',
    images: [INNO_REAL_IMAGES.zhuyeBagua, INNO_REAL_IMAGES.celadonBagua, INNO_REAL_IMAGES.greenChang],
    creator: MOCK_CREATORS[0],
    tags: ['东方美学', '禅意留白', '自然意象', 'liuli-box'],
    priceMin: 499,
    priceMax: 799,
    basePrice: 499,
    royaltyRate: 0.15,
    likes: 512,
    favorites: 289,
    sales: 67,
    dimensions: '90×90×55 mm',
    material: '高硼硅琉璃',
    craft: '浮雕工艺，脱蜡铸造',
    createdAt: '2024-12-02',
    isPublic: true,
    status: 'published',
    auditStatus: 'approved',
    revenue: 5018,
  },
  {
    id: 'square-3',
    title: '海棠形琉璃香插',
    description: '透明琉璃内嵌大理石纹理，海棠轮廓优雅弧线。既是实用香器，亦是案头雅物。',
    images: [INNO_REAL_IMAGES.begoniaIncense, INNO_REAL_IMAGES.longIncense, INNO_REAL_IMAGES.amberChang],
    creator: MOCK_CREATORS[2],
    tags: ['自然意象', '禅意留白', 'incense'],
    priceMin: 199,
    priceMax: 399,
    basePrice: 199,
    royaltyRate: 0.20,
    likes: 267,
    favorites: 134,
    sales: 89,
    dimensions: '120×60×25 mm',
    material: '高硼硅琉璃',
    craft: '热弯成型，手工打磨',
    createdAt: '2024-12-10',
    isPublic: true,
    status: 'published',
    auditStatus: 'approved',
    revenue: 3558,
  },
  {
    id: 'square-4',
    title: '椭圆磨砂蓝琉璃匣',
    description: '淡蓝色磨砂通透，银饰装饰点缀，静谧如水月光。椭圆轮廓柔和优雅，适合收藏小件首饰。',
    images: [INNO_REAL_IMAGES.blueTuoyuan, INNO_REAL_IMAGES.celadonBagua, INNO_REAL_IMAGES.greenChang],
    creator: MOCK_CREATORS[1],
    tags: ['现代极简', '自然意象', 'liuli-box'],
    priceMin: 299,
    priceMax: 599,
    basePrice: 299,
    royaltyRate: 0.10,
    likes: 198,
    favorites: 87,
    sales: 34,
    dimensions: '100×60×45 mm',
    material: '磨砂高硼硅琉璃',
    craft: '磨砂处理，脱蜡铸造',
    createdAt: '2024-11-28',
    isPublic: true,
    status: 'published',
    auditStatus: 'approved',
    revenue: 1017,
  },
  {
    id: 'square-5',
    title: '穹宇 · 拂光柜',
    description: '上海前滩华尔道夫酒店入驻作品。藻井纹玻璃展柜搭配水晶台灯，东方藻井与现代极简的碰撞。',
    images: [INNO_REAL_IMAGES.waldorf, INNO_REAL_IMAGES.exhibition, INNO_REAL_IMAGES.greenSet],
    creator: MOCK_CREATORS[0],
    tags: ['东方美学', '复古轻奢', 'lamp'],
    priceMin: 8999,
    priceMax: 15999,
    basePrice: 8999,
    royaltyRate: 0.20,
    likes: 876,
    favorites: 512,
    sales: 8,
    dimensions: '1200×450×1800 mm',
    material: '艺术琉璃 + 金属框架',
    craft: '定制生产，手工组装',
    createdAt: '2024-10-20',
    isPublic: true,
    status: 'published',
    auditStatus: 'approved',
    revenue: 28797,
  },
  {
    id: 'square-6',
    title: '翠色海棠长匣',
    description: '翠绿色清新通透，海棠形轮廓曲线优美，生机盎然如春日新叶。',
    images: [INNO_REAL_IMAGES.greenChang, INNO_REAL_IMAGES.amberChang, INNO_REAL_IMAGES.greenSet],
    creator: MOCK_CREATORS[3],
    tags: ['几何抽象', '现代极简', 'liuli-box'],
    priceMin: 349,
    priceMax: 649,
    basePrice: 349,
    royaltyRate: 0.15,
    likes: 234,
    favorites: 112,
    sales: 28,
    dimensions: '150×60×40 mm',
    material: '高硼硅琉璃',
    craft: '脱蜡铸造',
    createdAt: '2024-12-18',
    isPublic: true,
    status: 'published',
    auditStatus: 'approved',
    revenue: 1466,
  },
  {
    id: 'square-7',
    title: '长形渐变蓝香插',
    description: '淡蓝色渐变琉璃，长形简约设计，线香搭配清雅静谧，为日常增添仪式感。',
    images: [INNO_REAL_IMAGES.longIncense, INNO_REAL_IMAGES.begoniaIncense, INNO_REAL_IMAGES.blueTuoyuan],
    creator: MOCK_CREATORS[2],
    tags: ['禅意留白', '现代极简', 'incense'],
    priceMin: 149,
    priceMax: 299,
    basePrice: 149,
    royaltyRate: 0.10,
    likes: 189,
    favorites: 76,
    sales: 156,
    dimensions: '180×25×15 mm',
    material: '高硼硅琉璃',
    craft: '热弯渐变工艺',
    createdAt: '2025-01-05',
    isPublic: true,
    status: 'published',
    auditStatus: 'approved',
    revenue: 2324,
  },
  {
    id: 'square-8',
    title: '四时物候展览系列',
    description: '完整系列组合，包含八角匣、长匣、椭圆匣多种器型。适合作为礼品套装或空间陈列。',
    images: [INNO_REAL_IMAGES.exhibition, INNO_REAL_IMAGES.greenSet, INNO_REAL_IMAGES.amberChang],
    creator: MOCK_CREATORS[0],
    tags: ['东方美学', '复古轻奢', 'liuli-box'],
    priceMin: 1299,
    priceMax: 2999,
    basePrice: 1299,
    royaltyRate: 0.15,
    likes: 445,
    favorites: 267,
    sales: 19,
    dimensions: '套装组合',
    material: '高硼硅琉璃',
    craft: '脱蜡铸造套装',
    createdAt: '2024-09-15',
    isPublic: true,
    status: 'published',
    auditStatus: 'approved',
    revenue: 7407,
  },
  {
    id: 'square-9',
    title: '翠色海棠长匣 · 摆件款',
    description: '翠绿通透，海棠形轮廓，可做桌面摆件或首饰收纳，春日生机盎然。',
    images: [INNO_REAL_IMAGES.greenChang, INNO_REAL_IMAGES.greenSet, INNO_REAL_IMAGES.zhuyeBagua],
    creator: MOCK_CREATORS[3],
    tags: ['几何抽象', '现代极简', 'decor'],
    priceMin: 349,
    priceMax: 649,
    basePrice: 349,
    royaltyRate: 0.15,
    likes: 234,
    favorites: 112,
    sales: 28,
    dimensions: '150×60×40 mm',
    material: '高硼硅琉璃',
    craft: '脱蜡铸造',
    createdAt: '2024-12-18',
    isPublic: true,
    status: 'published',
    auditStatus: 'approved',
    revenue: 1466,
  },
  {
    id: 'square-10',
    title: '琥珀海棠长匣 · 首饰盒',
    description: '琥珀暖色调，海棠形轮廓曲线优美，内部可分层收纳首饰，温润如玉。',
    images: [INNO_REAL_IMAGES.amberChang, INNO_REAL_IMAGES.amberWeijiao, INNO_REAL_IMAGES.celadonBagua],
    creator: MOCK_CREATORS[1],
    tags: ['复古轻奢', '东方美学', 'liuli-box'],
    priceMin: 460,
    priceMax: 760,
    basePrice: 460,
    royaltyRate: 0.10,
    likes: 378,
    favorites: 195,
    sales: 53,
    dimensions: '150×60×45 mm',
    material: '高硼硅琉璃',
    craft: '脱蜡铸造，手工打磨',
    createdAt: '2024-11-22',
    isPublic: true,
    status: 'published',
    auditStatus: 'approved',
    revenue: 2438,
  },
  {
    id: 'square-11',
    title: '青绿系琉璃茶则',
    description: '取自四时物候系列绿色系灵感，茶席良伴，光影流转间茶香四溢。',
    images: [INNO_REAL_IMAGES.greenSet, INNO_REAL_IMAGES.greenChang, INNO_REAL_IMAGES.celadonBagua],
    creator: MOCK_CREATORS[2],
    tags: ['禅意留白', '自然意象', 'tea'],
    priceMin: 168,
    priceMax: 298,
    basePrice: 168,
    royaltyRate: 0.15,
    likes: 156,
    favorites: 89,
    sales: 112,
    dimensions: '120×35×8 mm',
    material: '高硼硅琉璃',
    craft: '热弯成型',
    createdAt: '2025-01-08',
    isPublic: true,
    status: 'published',
    auditStatus: 'approved',
    revenue: 2822,
  },
  {
    id: 'square-12',
    title: '穹宇藻井纹台灯',
    description: '取自华尔道夫拂光柜同款藻井纹，小型台灯款，琉璃灯罩暖光漫射。',
    images: [INNO_REAL_IMAGES.waldorf, INNO_REAL_IMAGES.exhibition, INNO_REAL_IMAGES.celadonBagua],
    creator: MOCK_CREATORS[0],
    tags: ['东方美学', '复古轻奢', 'lamp'],
    priceMin: 1280,
    priceMax: 1980,
    basePrice: 1280,
    royaltyRate: 0.20,
    likes: 523,
    favorites: 312,
    sales: 15,
    dimensions: '200×200×350 mm',
    material: '艺术琉璃 + 铜底座',
    craft: '定制生产',
    createdAt: '2024-10-28',
    isPublic: true,
    status: 'published',
    auditStatus: 'approved',
    revenue: 5760,
  },
];

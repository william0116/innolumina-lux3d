// EXPORTS: IShowcase, MOCK_SHOWCASES, INNO_REAL_IMAGES, HERO_IMAGE_URL, HERO_PRODUCT_IMAGE
export interface IShowcase {
  id: string
  title: string
  series: 'liuli-box' | 'fragrance' | 'furniture' | 'exhibition'
  seriesLabel: string
  description: string
  imageUrl: string
}

// inno.Studio 真实产品图（小红书官方账号）— 11 张按系列分类
// 四时物候·琉璃匣系列（琥珀系为 inno.studio 真实产品图）
const INNO_AMBER_WEIJIAO = '/images/products/inno-amber-wei.jpg'    // 1. 委角匣·琥珀色（实拍）
const INNO_CELADON_BAGUA = '/images/products/celadon-bagua.jpg'    // 2. 八角匣·淡青色四宫格
const INNO_GREEN_SET = '/images/products/green-set.jpg'             // 3. 绿色系合集（小匣/茶则/杯托）
const INNO_BLUE_TUOYUAN = '/images/products/blue-tuoyuan.jpg'       // 4. 椭圆匣·淡蓝色磨砂
const INNO_ZHUYE_BAGUA = '/images/products/inno-amber-leaf.jpg'     // 5. 八角匣·竹叶浮雕（Hero 首选，实拍）
const INNO_AMBER_CHANG = '/images/products/inno-amber-long.jpg'     // 6. 长匣·琥珀色海棠形（实拍）
const INNO_GREEN_CHANG = '/images/products/green-chang.jpg'          // 7. 长匣·翠绿色海棠形
// 香器花器系列
const INNO_BEGONIA_INCENSE = '/images/products/begonia-incense.jpg' // 8. 海棠形香插·透明大理石纹
const INNO_LONG_INCENSE = '/images/products/long-incense.jpg'      // 9. 长形香插·淡蓝渐变
// 艺术家具系列
const INNO_WALDORF = '/images/products/waldorf.jpg'                 // 10. 穹宇·拂光柜（拱形透光柜）
// 展览场景
const INNO_EXHIBITION = '/images/products/inno-amber-group.jpg'     // 11. 四时物候系列陈列（实拍）

export const HERO_IMAGE_URL = INNO_WALDORF
export const HERO_PRODUCT_IMAGE = INNO_ZHUYE_BAGUA  // Hero 产品特写：竹叶浮雕八角匣

export const INNO_REAL_IMAGES = {
  // 四时物候·琉璃匣系列
  amberWeijiao: INNO_AMBER_WEIJIAO,
  celadonBagua: INNO_CELADON_BAGUA,
  greenSet: INNO_GREEN_SET,
  blueTuoyuan: INNO_BLUE_TUOYUAN,
  zhuyeBagua: INNO_ZHUYE_BAGUA,
  amberChang: INNO_AMBER_CHANG,
  greenChang: INNO_GREEN_CHANG,
  // 香器花器系列
  begoniaIncense: INNO_BEGONIA_INCENSE,
  longIncense: INNO_LONG_INCENSE,
  // 艺术家具系列
  waldorf: INNO_WALDORF,
  // 展览
  exhibition: INNO_EXHIBITION,
}

export const MOCK_SHOWCASES: IShowcase[] = [
  // 四时物候·琉璃匣系列（7 张）
  {
    id: 'show-1',
    title: '四时物候 · 委角匣',
    series: 'liuli-box',
    seriesLabel: '四时物候·琉璃匣',
    description: '琥珀色磨砂通透，搭配银饰项链，东方雅致与现代质感交融',
    imageUrl: INNO_AMBER_WEIJIAO,
  },
  {
    id: 'show-2',
    title: '四时物候 · 八角匣',
    series: 'liuli-box',
    seriesLabel: '四时物候·琉璃匣',
    description: '淡青色清新雅致，四宫格展示，搭配银饰首饰',
    imageUrl: INNO_CELADON_BAGUA,
  },
  {
    id: 'show-3',
    title: '四时物候 · 绿色系合集',
    series: 'liuli-box',
    seriesLabel: '四时物候·琉璃匣',
    description: '椭圆匣、八角匣、长匣，浮雕花卉纹样清新自然',
    imageUrl: INNO_GREEN_SET,
  },
  {
    id: 'show-4',
    title: '四时物候 · 椭圆匣',
    series: 'liuli-box',
    seriesLabel: '四时物候·琉璃匣',
    description: '淡蓝色磨砂通透，银饰装饰，静谧如水',
    imageUrl: INNO_BLUE_TUOYUAN,
  },
  {
    id: 'show-5',
    title: '四时物候 · 竹叶八角匣',
    series: 'liuli-box',
    seriesLabel: '四时物候·琉璃匣',
    description: '淡青色竹叶浮雕，极简留白，东方文人意趣',
    imageUrl: INNO_ZHUYE_BAGUA,
  },
  {
    id: 'show-6',
    title: '四时物候 · 海棠长匣（琥珀）',
    series: 'liuli-box',
    seriesLabel: '四时物候·琉璃匣',
    description: '琥珀色暖调，海棠形轮廓，温润如玉',
    imageUrl: INNO_AMBER_CHANG,
  },
  {
    id: 'show-7',
    title: '四时物候 · 海棠长匣（翠绿）',
    series: 'liuli-box',
    seriesLabel: '四时物候·琉璃匣',
    description: '翠绿色清新，海棠形轮廓，生机盎然',
    imageUrl: INNO_GREEN_CHANG,
  },
  // 香器花器系列（2 张）
  {
    id: 'show-8',
    title: '海棠形琉璃香插',
    series: 'fragrance',
    seriesLabel: '香器花器',
    description: '透明琉璃内嵌大理石纹理，海棠轮廓，艺术花器',
    imageUrl: INNO_BEGONIA_INCENSE,
  },
  {
    id: 'show-9',
    title: '长形琉璃香插',
    series: 'fragrance',
    seriesLabel: '香器花器',
    description: '淡蓝色渐变，海棠形轮廓，线香搭配清雅静谧',
    imageUrl: INNO_LONG_INCENSE,
  },
  // 艺术家具系列（1 张）
  {
    id: 'show-10',
    title: '穹宇 · 拂光柜',
    series: 'furniture',
    seriesLabel: '艺术家具',
    description: '上海前滩华尔道夫酒店入驻作品，藻井纹玻璃展柜+水晶台灯',
    imageUrl: INNO_WALDORF,
  },
  // 展览场景（1 张）
  {
    id: 'show-11',
    title: '四时物候展览现场',
    series: 'exhibition',
    seriesLabel: '空间展览',
    description: '窗边自然光极简空间，多色琉璃匣玻璃展台陈列',
    imageUrl: INNO_EXHIBITION,
  },
]

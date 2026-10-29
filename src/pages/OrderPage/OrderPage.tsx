import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Download,
  Printer,
  Flame,
  ArrowLeft,
  Check,
  Clock,
  Package,
  ShieldCheck,
  Coins,
  Info,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Image } from '@/components/ui/image';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useOrder } from '@/contexts/OrderContext';
import { getWorkById } from '@/lib/app-storage';
import { getSquareWorkById } from '@/lib/square-storage';
import type { IWork, IOrder } from '@/data/glassmorphism';
import type { ISquareWork } from '@/data/square';
import { INNO_REAL_IMAGES } from '@/data/showcase';
import { cn } from '@/lib/utils';

type ProductType = 'stl' | 'resin' | 'glass';

interface ProductOption {
  type: ProductType;
  title: string;
  subtitle: string;
  price: number;
  duration: string;
  description: string;
  icon: typeof Download;
  accent: string;
}

const PRODUCT_OPTIONS: ProductOption[] = [
  {
    type: 'stl',
    title: '下载 STL 数字模型',
    subtitle: '获取三维数字文件',
    price: 0,
    duration: '即时获取',
    description: '获取 STL 格式三维数字文件，可自行 3D 打印或用于设计修改。',
    icon: Download,
    accent: 'from-primary/20 to-primary/5',
  },
  {
    type: 'resin',
    title: '3D 打印树脂母模',
    subtitle: 'SLA 光固化打印',
    price: 680,
    duration: '3-5 个工作日',
    description: 'SLA 光固化打印，低灰分铸造树脂，可用于脱蜡铸造。表面光洁，细节还原度高。',
    icon: Printer,
    accent: 'from-teal-400/20 to-teal-400/5',
  },
  {
    type: 'glass',
    title: '脱蜡铸造琉璃成品',
    subtitle: '完整琉璃艺术品',
    price: 2180,
    duration: '15-25 个工作日',
    description: '含人工模型修复、石膏包埋、窑炉浇注、退火、打磨抛光。工艺工程师全程质控。',
    icon: Flame,
    accent: 'from-accent/20 to-accent/5',
  },
];

const TIMELINE_STEPS = [
  { key: 'pending', label: '待确认', desc: '已提交订单' },
  { key: 'reviewing', label: '模型复核', desc: '工艺工程师审核' },
  { key: 'producing', label: '生产中', desc: '工厂制作中' },
  { key: 'shipped', label: '已发货', desc: '物流配送中' },
  { key: 'completed', label: '完成', desc: '订单已完成' },
];

export default function OrderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { state: authState } = useAuth();
  const { createOrder, payOrder } = useOrder();
  const user = authState.user;
  const credit = user?.points ?? 0;
  const [work, setWork] = useState<IWork | null>(null);
  const [squareWork, setSquareWork] = useState<ISquareWork | null>(null);
  const fromSquare = searchParams.get('from') === 'square';
  const [selectedType, setSelectedType] = useState<ProductType>(
    (searchParams.get('type') as ProductType) || 'glass'
  );
  const [quantity, setQuantity] = useState(1);
  const [receiver, setReceiver] = useState({
    name: '',
    phone: '',
    address: '',
  });
  const [remark, setRemark] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [caseSeries, setCaseSeries] = useState<'all' | 'liuli-box' | 'fragrance' | 'furniture'>('all');

  const CASE_ITEMS = [
    { key: 'all', label: '全部' },
    { key: 'liuli-box', label: '琉璃匣' },
    { key: 'fragrance', label: '香器花器' },
    { key: 'furniture', label: '艺术家具' },
  ];

  const caseImages = useMemo(() => {
    const all = [
      { src: INNO_REAL_IMAGES.zhuyeBagua, title: '竹叶八角匣', desc: '四时物候·琉璃匣' },
      { src: INNO_REAL_IMAGES.amberWeijiao, title: '琥珀委角匣', desc: '四时物候·琉璃匣' },
      { src: INNO_REAL_IMAGES.greenChang, title: '翠绿海棠长匣', desc: '四时物候·琉璃匣' },
      { src: INNO_REAL_IMAGES.blueTuoyuan, title: '淡蓝椭圆匣', desc: '四时物候·琉璃匣' },
      { src: INNO_REAL_IMAGES.begoniaIncense, title: '海棠形香插', desc: '香器花器' },
      { src: INNO_REAL_IMAGES.longIncense, title: '长形香插', desc: '香器花器' },
      { src: INNO_REAL_IMAGES.waldorf, title: '穹宇·拂光柜', desc: '艺术家具·华尔道夫' },
    ];
    if (caseSeries === 'all') return all;
    const seriesMap: Record<string, string[]> = {
      'liuli-box': ['zhuyeBagua', 'amberWeijiao', 'greenChang', 'blueTuoyuan', 'celadonBagua', 'amberChang', 'greenSet'],
      'fragrance': ['begoniaIncense', 'longIncense'],
      'furniture': ['waldorf'],
    };
    const keys = seriesMap[caseSeries] || [];
    return all.filter((_, i) => {
      if (caseSeries === 'liuli-box') return i < 4;
      if (caseSeries === 'fragrance') return i === 4 || i === 5;
      if (caseSeries === 'furniture') return i === 6;
      return true;
    });
  }, [caseSeries]);

  useEffect(() => {
    if (!id) return;

    if (fromSquare) {
      const sw = getSquareWorkById(searchParams.get('workId') || id.replace('square-', ''));
      if (!sw) {
        toast.error('作品不存在');
        navigate('/square');
        return;
      }
      setSquareWork(sw);
      // 转换成 IWork 格式复用现有 UI
      const fakeWork: IWork = {
        id: sw.id,
        prompt: sw.title,
        style: sw.tags[0] || '东方美学',
        source: 'text',
        images: sw.images,
        selectedIndex: 0,
        model3d: {
          url: sw.images[0],
          fileName: `${sw.title}.stl`,
          dimensions: { width: 80, height: 50, depth: 80 },
          faceCount: 62400,
        },
        inspectionReport: null,
        createdAt: sw.createdAt,
      };
      setWork(fakeWork);
      return;
    }

    const w = getWorkById(id);
    if (!w) {
      toast.error('作品不存在');
      navigate('/create');
      return;
    }
    setWork(w);
  }, [id, navigate, fromSquare, searchParams]);

  const selectedOption = useMemo(
    () => PRODUCT_OPTIONS.find((o) => o.type === selectedType)!,
    [selectedType]
  );

  const totalPrice = useMemo(() => {
    if (selectedType === 'stl') return 0;
    const base = squareWork ? squareWork.basePrice : selectedOption.price;
    // 树脂母模是基础价的 0.6 倍
    if (selectedType === 'resin' && squareWork) {
      return Math.round(squareWork.basePrice * 0.6) * quantity;
    }
    return base * quantity;
  }, [selectedType, selectedOption.price, quantity, squareWork]);

  const handleSubmit = async () => {
    if (!work || !user) return;

    if (selectedType !== 'stl') {
      if (!receiver.name.trim() || !receiver.phone.trim() || !receiver.address.trim()) {
        toast.error('请填写完整的收件信息');
        return;
      }
    }

    setSubmitting(true);

    try {
      if (selectedType === 'stl') {
        // STL 下载：直接触发下载
        const content = `solid ${work.id}_model
facet normal 0 0 0
  outer loop
    vertex 0 0 0
    vertex 1 0 0
    vertex 0 1 0
  endloop
endfacet
endsolid ${work.id}_model`;
        const blob = new Blob([content], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${work.id}_model.stl`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('STL 模型已开始下载');
        setSubmitting(false);
        return;
      }

      // 实物订单：创建 + 自动支付
      const order = createOrder({
        workId: work.id,
        workImage: work.images[work.selectedIndex],
        productType: selectedType,
        productName: selectedOption.title,
        quantity,
        price: selectedOption.price,
        totalPrice,
        receiver: { ...receiver },
        remark,
        creatorId: squareWork?.creator?.id,
      });

      toast.success('订单已创建，正在跳转支付...');
      
      // 直接跳到订单详情页，让用户手动点支付
      setTimeout(() => {
        navigate(`/order-detail/${order.id}`);
      }, 500);
    } finally {
      // submitting 状态会在 navigate 前保留
    }
  };

  if (!work) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background page-rise-in">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {/* 顶部 */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/preview/${work.id}`)}
            className="gap-1 bg-white hover:bg-muted/30 border-border hover:border-primary/30"
          >
            <ArrowLeft className="size-4" />
            返回 3D 预览
          </Button>
          <h1 className="text-2xl font-semibold text-foreground font-['Noto_Serif_SC'] tracking-[0.08em]">制造下单</h1>
          <div className="ml-auto flex items-center gap-1.5 text-sm">
            <Coins className="size-4 text-warning" />
            <span className="tabular-nums font-medium glass-num-glow">{credit}</span>
            <span className="text-muted-foreground text-xs">积分</span>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* 左侧：制造方式 + 订单填写 */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {/* 制造方式选择 */}
            <Card className="bg-white border-border shadow-sm glass-edge-glow">
              <CardHeader>
                <CardTitle className="text-lg font-['Noto_Serif_SC'] tracking-wider font-semibold">选择制造方式</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {PRODUCT_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = selectedType === opt.type;
                    return (
                      <motion.button
                        key={opt.type}
                        whileHover={{ y: -3 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => setSelectedType(opt.type)}
                        className={cn(
                           'relative text-left p-5 rounded-xl border transition-all duration-300 overflow-hidden',
                           isSelected
                             ? 'border-primary bg-primary/5 shadow-sm'
                             : 'border-border bg-card hover:border-primary/40'
                         )}
                      >
                         {isSelected && (
                           <div className="absolute top-3 right-3 size-5 rounded-full bg-primary flex items-center justify-center">
                             <Check className="size-3 text-primary-foreground" />
                           </div>
                         )}
                         <div
                           className={cn(
                             'size-12 rounded-xl bg-gradient-to-br flex items-center justify-center mb-3 relative',
                             opt.accent
                           )}
                         >
                           <div className="absolute inset-0 rounded-xl bg-white/60 backdrop-blur-sm" />
                           <Icon className="size-6 text-primary relative" />
                         </div>
                        <h3 className="font-semibold text-foreground mb-1">
                          {opt.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mb-3">
                          {opt.subtitle}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-lg font-bold text-foreground tabular-nums glass-num-glow">
                            {opt.price === 0 ? '免费' : `¥${opt.price.toLocaleString()}`}
                            {opt.price > 0 && (
                              <span className="text-xs font-normal text-muted-foreground">
                                {' '}/件
                              </span>
                            )}
                          </p>
                           <Badge variant="outline" className="text-xs bg-white border-border">
                             <Clock className="size-3 mr-1" />
                             {opt.duration}
                           </Badge>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                 <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
                   <p className="text-sm text-foreground mb-1 font-medium">{selectedOption.title}</p>
                   <p className="text-xs text-muted-foreground leading-[1.8]">
                     {selectedOption.description}
                   </p>
                 </div>
              </CardContent>
            </Card>

            {/* 订单信息填写 */}
            {selectedType !== 'stl' && (
              <Card className="bg-white border-border shadow-sm glass-edge-glow">
                <CardHeader>
                   <CardTitle className="text-lg font-['Noto_Serif_SC'] tracking-wider font-semibold">收件信息</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground font-medium tracking-wide">收件人姓名</label>
                      <Input
                        value={receiver.name}
                        onChange={(e) =>
                          setReceiver({ ...receiver, name: e.target.value })
                        }
                        placeholder="请输入姓名"
                         className="bg-white border-border focus-visible:ring-primary/40 focus-visible:border-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground font-medium tracking-wide">联系电话</label>
                      <Input
                        value={receiver.phone}
                        onChange={(e) =>
                          setReceiver({ ...receiver, phone: e.target.value })
                        }
                        placeholder="请输入手机号"
                         className="bg-white border-border focus-visible:ring-primary/40 focus-visible:border-primary"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground font-medium tracking-wide">详细地址</label>
                    <Input
                      value={receiver.address}
                      onChange={(e) =>
                        setReceiver({ ...receiver, address: e.target.value })
                      }
                      placeholder="请输入省/市/区/详细地址"
                         className="bg-white border-border focus-visible:ring-primary/40 focus-visible:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground font-medium tracking-wide">数量</label>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                         className="size-9 bg-white border-border hover:border-primary/40"
                      >
                        -
                      </Button>
                      <span className="text-lg font-medium tabular-nums min-w-[40px] text-center glass-num-glow">
                        {quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(quantity + 1)}
                         className="size-9 bg-white border-border hover:border-primary/40"
                      >
                        +
                      </Button>
                      <span className="text-xs text-muted-foreground ml-2">
                        件（≥10 件可享批量优惠，请联系客服）
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground font-medium tracking-wide">备注</label>
                    <Textarea
                      value={remark}
                      onChange={(e) => setRemark(e.target.value)}
                      placeholder="有特殊要求可在此说明..."
                       className="min-h-[80px] bg-white border-border resize-none focus-visible:ring-primary/40 focus-visible:border-primary"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

             {/* 供应链说明 */}
             <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex gap-3 bg-white/60 backdrop-blur-sm">
               <ShieldCheck className="size-5 text-primary shrink-0 mt-0.5" />
               <div>
                 <p className="text-sm font-medium text-foreground mb-1">
                   供应链说明
                 </p>
                 <p className="text-xs text-muted-foreground leading-relaxed">
                   平台为撮合方，不自建工厂。我们精选行业内优质 3D 打印服务商与琉璃铸造工厂作为合作伙伴，
                   成品良率由合作供应链保障。所有订单经过平台工艺工程师审核后方可排产，确保出品品质。
                 </p>
               </div>
             </div>
          </div>

          {/* 右侧：订单时间线 + 价格明细 */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* 作品信息 */}
            <Card className="bg-white border-border shadow-sm glass-edge-glow">
              <CardContent className="p-4">
                <div className="flex gap-3">
                   <div className="size-20 rounded-lg overflow-hidden shrink-0 border border-border relative">
                     <Image
                       src={work.images[work.selectedIndex]}
                       alt="作品"
                       className="w-full h-full object-cover"
                     />
                   </div>
                   <div className="flex-1 min-w-0 space-y-1">
                     <p className="text-sm font-medium text-foreground line-clamp-2">
                       {work.prompt}
                     </p>
                     <Badge variant="outline" className="text-xs bg-white border-border">
                       {work.style}
                     </Badge>
                     <p className="text-xs text-muted-foreground">{work.createdAt}</p>
                     {squareWork && (
                       <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-border/40">
                         <Avatar className="size-5">
                           <AvatarImage src={squareWork.creator.avatar} />
                           <AvatarFallback className="text-[8px]">{squareWork.creator.name[0]}</AvatarFallback>
                         </Avatar>
                         <span className="text-[11px] text-muted-foreground truncate">
                           {squareWork.creator.name}
                         </span>
                         <span className="text-[10px] text-warning ml-auto">
                           分成 {Math.round(squareWork.royaltyRate * 100)}%
                         </span>
                       </div>
                     )}
                   </div>
                </div>
              </CardContent>
            </Card>

            {/* 成品案例展示 */}
            <Card className="bg-white border-border shadow-sm glass-edge-glow">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 font-['Noto_Serif_SC'] tracking-wider font-semibold">
                   <Sparkles className="size-5 text-warning" />
                  inno.Studio 成品案例
                </CardTitle>
              </CardHeader>
               <CardContent className="space-y-4">
                 <p className="text-xs text-muted-foreground leading-relaxed">
                   母品牌 inno.Studio 真实作品与酒店级落地案例，展示高端琉璃制造工艺与东方空间美学表达。
                 </p>
                 {/* 系列 Tab */}
                 <div className="flex flex-wrap gap-1.5">
                   {CASE_ITEMS.map((tab) => (
                     <button
                       key={tab.key}
                       onClick={() => setCaseSeries(tab.key as typeof caseSeries)}
                       className={cn(
                         'px-3 py-1 rounded-full text-xs font-medium transition-all duration-200',
                         caseSeries === tab.key
                           ? 'bg-primary text-primary-foreground'
                           : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                       )}
                     >
                       {tab.label}
                     </button>
                   ))}
                 </div>
                 {/* 案例网格 */}
                 <div className="grid grid-cols-2 gap-3">
                   {caseImages.map((img, idx) => (
                     <div
                       key={idx}
                       className="relative rounded-lg overflow-hidden group cursor-pointer"
                     >
                       <div className="aspect-square overflow-hidden">
                         <Image
                           src={img.src}
                           alt={img.title}
                           className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                         />
                       </div>
                       <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                       <div className="absolute bottom-2 left-2 right-2">
                         <p className="text-xs font-medium text-foreground line-clamp-1">
                           {img.title}
                         </p>
                         <p className="text-[10px] text-muted-foreground">{img.desc}</p>
                       </div>
                     </div>
                   ))}
                 </div>
               </CardContent>
            </Card>

            {/* 订单时间线 */}
            <Card className="bg-white border-border shadow-sm glass-edge-glow">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 font-['Noto_Serif_SC'] tracking-wider font-semibold">
                   <Clock className="size-5 text-primary" />
                  订单时间线
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative pl-4 space-y-5">
                  <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border" />
                  {TIMELINE_STEPS.map((step, idx) => (
                    <div key={step.key} className="relative flex gap-3">
                        <div
                          className={cn(
                            'absolute -left-[13px] size-6 rounded-full border-2 flex items-center justify-center z-10',
                            idx === 0
                              ? 'bg-primary border-primary text-primary-foreground'
                              : 'bg-white border-border text-muted-foreground'
                          )}
                        >
                        {idx === 0 ? (
                          <Check className="size-3" />
                        ) : (
                          <div className="size-1.5 rounded-full bg-muted-foreground" />
                        )}
                      </div>
                      <div className="ml-2 pb-1">
                        <p
                          className={cn(
                            'text-sm font-medium',
                            idx === 0 ? 'text-primary' : 'text-muted-foreground'
                          )}
                        >
                          {step.label}
                        </p>
                        <p className="text-xs text-muted-foreground">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 价格明细 */}
            <Card className="bg-white border-border shadow-sm glass-edge-glow">
              <CardHeader>
                <CardTitle className="text-lg font-['Noto_Serif_SC'] tracking-wider font-semibold">价格明细</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{selectedOption.title}</span>
                  <span className="text-foreground tabular-nums">
                    {selectedOption.price === 0 && !squareWork
                      ? '免费'
                      : `¥${(squareWork ? (selectedType === 'resin' ? Math.round(squareWork.basePrice * 0.6) : squareWork.basePrice) : selectedOption.price).toLocaleString()}`}
                  </span>
                </div>
                {selectedType !== 'stl' && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">数量</span>
                    <span className="text-foreground tabular-nums">× {quantity}</span>
                  </div>
                )}
                {squareWork && selectedType !== 'stl' && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Sparkles className="size-3 text-warning" />
                      创作者分成
                    </span>
                    <span className="text-warning tabular-nums font-medium">
                      ¥{Math.round(totalPrice * squareWork.royaltyRate)}
                    </span>
                  </div>
                )}
                <Separator className="bg-border" />
                <div className="flex items-center justify-between">
                  <span className="text-foreground font-medium">合计</span>
                  <span className="text-2xl font-bold text-primary tabular-nums glass-num-glow">
                    {totalPrice === 0 ? '免费' : `¥${totalPrice.toLocaleString()}`}
                  </span>
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full h-11 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg"
                >
                  {submitting ? (
                    '提交中...'
                  ) : selectedType === 'stl' ? (
                    <>
                      <Download className="size-4" />
                      立即下载
                    </>
                  ) : (
                    <>确认下单</>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
                  <Info className="size-3" />
                   {squareWork
                     ? `本订单包含创作者分成 ¥${Math.round(totalPrice * squareWork.royaltyRate)}`
                     : '实物订单独立支付，不消耗积分'}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Coins,
  ImageIcon,
  Package,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  Truck,
  Loader2,
  User,
  Box,
  Grid3X3,
  Wallet,
  Settings,
  HelpCircle,
  Palette,
  ChevronRight,
  Trash2,
  Edit,
  Eye,
  LogOut,
  MapPin,
  Phone,
  Mail,
  Sparkles,
  CreditCard,
  DollarSign,
  TrendingUp,
  Shield,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Image } from '@/components/ui/image';
import { useAuth } from '@/contexts/AuthContext';
import { useOrder } from '@/contexts/OrderContext';
import { getPointRecords, getWorks } from '@/lib/app-storage';
import { getMySquareWorks, getCreatorEarnings } from '@/lib/square-storage';
import type { IWork, IOrder } from '@/data/glassmorphism';
import type { IUser } from '@/data/types';
import type { ISquareWork } from '@/data/square';
import { MOCK_SQUARE_WORKS } from '@/data/square';
import { avatarImages } from '@lark-apaas/client-toolkit-lite';
import { cn } from '@/lib/utils';
import EmptyState from '@/components/EmptyState';

const RECHARGE_PACKS = [
  { amount: 100, bonus: 0, price: 10, label: '体验包' },
  { amount: 500, bonus: 50, price: 50, label: '基础包' },
  { amount: 1000, bonus: 200, price: 100, label: '创作包' },
  { amount: 3000, bonus: 800, price: 300, label: '专业包' },
];

const ORDER_STATUS_STEPS = [
  { key: 'pending', label: '待确认' },
  { key: 'reviewing', label: '模型复核' },
  { key: 'producing', label: '生产中' },
  { key: 'shipped', label: '已发货' },
  { key: 'completed', label: '完成' },
];

const ORDER_FILTER_TABS = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待支付' },
  { value: 'producing', label: '生产中' },
  { value: 'shipped', label: '已发货' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' },
];

const NAV_ITEMS = [
  { key: 'works', label: '我的作品', icon: Grid3X3 },
  { key: 'orders', label: '我的订单', icon: Package },
  { key: 'earnings', label: '我的收益', icon: DollarSign },
  { key: 'credit', label: '积分账户', icon: Coins },
  { key: 'settings', label: '账户设置', icon: Settings },
];

const EXTRA_NAV_ITEMS = [
  { key: 'help', label: '帮助中心', icon: HelpCircle, external: true, path: '/help' },
];

export default function ProfilePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const tab = searchParams.get('tab') || 'works';
  
  const { state: authState, logout, addPoints, updateUser } = useAuth();
  const { state: orderState, confirmReceive } = useOrder();
  const user = authState.user;
  const credit = user?.points ?? 0;

  const [records, setRecords] = useState<any[]>([]);
  const [works, setWorks] = useState<IWork[]>([]);
  const [squareWorks, setSquareWorks] = useState<ISquareWork[]>([]);
  const [earningsData, setEarningsData] = useState(getCreatorEarnings());
  const [rechargeDialogOpen, setRechargeDialogOpen] = useState(false);
  const [orderFilter, setOrderFilter] = useState('all');
  const [workAuditFilter, setWorkAuditFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');
  const [withdrawing, setWithdrawing] = useState(false);

  const refresh = () => {
    setRecords(getPointRecords());
    setWorks(getWorks());
    const myWorks = getMySquareWorks();
    // 如果用户没有上传过，用 mock 的前 8 个作为示例作品
    if (myWorks.length === 0) {
      const samples = MOCK_SQUARE_WORKS.slice(0, 8).map((w, i) => ({
        ...w,
        status: 'published' as const,
        auditStatus: (i === 2 ? 'pending' : i === 5 ? 'rejected' : 'approved') as 'pending' | 'approved' | 'rejected',
        auditReason: i === 5 ? '内容不符合社区规范，请修改后重新提交' : undefined,
      }));
      setSquareWorks(samples);
    } else {
      setSquareWorks(myWorks);
    }
    setEarningsData(getCreatorEarnings());
  };

  useEffect(() => {
    refresh();
  }, [user?.id]);

  const handleTabChange = (key: string) => {
    setSearchParams({ tab: key });
  };

  const handleRecharge = (pack: (typeof RECHARGE_PACKS)[number]) => {
    const total = pack.amount + pack.bonus;
    addPoints(total, 'recharge', `充值${pack.label}：${pack.amount}${pack.bonus > 0 ? ` + 赠送${pack.bonus}` : ''} 积分`);
    setRecords(getPointRecords());
    setRechargeDialogOpen(false);
    toast.success(`充值成功，${total} 积分已到账`);
  };

  const switchRole = (role: IUser['role']) => {
    updateUser({ role });
    toast.success(`已切换为${role === 'admin' ? '管理员' : role === 'creator' ? '创作者' : '普通用户'}视角`);
  };

  const handleWithdraw = () => {
    if (earningsData.availableRevenue <= 0) {
      toast.error('暂无可提现余额');
      return;
    }
    setWithdrawing(true);
    setTimeout(() => {
      setWithdrawing(false);
      toast.success('提现申请已提交，预计 1-3 个工作日到账');
    }, 1000);
  };

  const totalConsume = useMemo(
    () => records.filter((r) => r.type === 'consume').reduce((sum, r) => sum + r.amount, 0),
    [records]
  );
  const totalRecharge = useMemo(
    () => records.filter((r) => r.type === 'recharge').reduce((sum, r) => sum + r.amount, 0),
    [records]
  );

  const filteredOrders = useMemo(() => {
    if (orderFilter === 'all') return orderState.orders;
    return orderState.orders.filter((o) => o.status === orderFilter);
  }, [orderState.orders, orderFilter]);

  const getOrderProgress = (status: string) => {
    const idx = ORDER_STATUS_STEPS.findIndex((s) => s.key === status);
    if (idx < 0) return 0;
    return ((idx + 1) / ORDER_STATUS_STEPS.length) * 100;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
      case 'reviewing':
        return Clock;
      case 'producing':
        return Loader2;
      case 'shipped':
        return Truck;
      case 'completed':
        return CheckCircle2;
      default:
        return Clock;
    }
  };

  const getStatusLabel = (status: string) => {
    return ORDER_STATUS_STEPS.find((s) => s.key === status)?.label ?? status;
  };

  const productTypeLabel = (t: IOrder['productType']) => {
    if (t === 'stl') return 'STL 下载';
    if (t === 'resin') return '3D 打印';
    return '琉璃铸造';
  };

  const getEarningStatusColor = (s: string) => {
    if (s === 'pending') return 'text-warning bg-warning/10 border-warning/30';
    if (s === 'available') return 'text-success bg-success/10 border-success/30';
    return 'text-muted-foreground bg-muted border-border';
  };

  const getEarningStatusLabel = (s: string) => {
    if (s === 'pending') return '待结算';
    if (s === 'available') return '可提现';
    return '已提现';
  };

  return (
    <div className="min-h-screen bg-background page-rise-in">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* 头部 */}
        <div className="flex items-center gap-4 mb-8">
          <div className="relative size-14 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground text-xl font-bold shadow-sm">
            <div className="absolute inset-0 rounded-full bg-white/20 backdrop-blur-sm" />
            <User className="size-7 relative" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground font-['Noto_Serif_SC'] tracking-[0.08em]">创作者中心</h1>
            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
              管理你的作品、订单与收益
            </p>
          </div>
          <div className="ml-auto flex items-center gap-6">
            <div className="text-right">
              <p className="text-xs text-muted-foreground mb-1 tracking-wider">当前积分</p>
              <p className="text-2xl font-bold text-warning tabular-nums flex items-center gap-1 justify-end font-['Noto_Serif_SC']">
                <Coins className="size-5" />
                {credit}
              </p>
            </div>
            <Button onClick={() => navigate('/recharge')} className="gap-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg">
              <Plus className="size-4" />
              充值
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          {/* 移动端顶部导航（横向滚动） */}
          <div className="md:hidden -mx-4 px-4 overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-1.5 pb-1 shrink-0">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = tab === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => handleTabChange(item.key)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-2 rounded-full text-xs whitespace-nowrap transition-all duration-200 min-h-[40px]',
                      isActive
                        ? 'bg-primary text-primary-foreground font-medium shadow-sm'
                        : 'bg-card text-muted-foreground hover:bg-muted border border-border'
                    )}
                  >
                    <Icon className="size-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 桌面端左侧导航 */}
          <aside className="hidden md:block w-56 shrink-0">
            <Card className="bg-white border-border shadow-sm">
              <CardContent className="p-2">
                <nav className="space-y-1">
                  {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = tab === item.key;
                    return (
                      <button
                        key={item.key}
                        onClick={() => handleTabChange(item.key)}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200',
                          isActive
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                        )}
                      >
                        <Icon className="size-4 shrink-0" />
                        <span className="flex-1 text-left">{item.label}</span>
                        <ChevronRight className={cn('size-3.5 transition-opacity', isActive ? 'opacity-100' : 'opacity-0')} />
                      </button>
                    );
                    })} 
                </nav>
                 <Separator className="my-2" />
                 <nav className="space-y-1">
                   {EXTRA_NAV_ITEMS.map((item) => {
                     const Icon = item.icon;
                     return (
                       <button
                         key={item.key}
                         onClick={() => navigate(item.path!)}
                         className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                       >
                         <Icon className="size-4 shrink-0" />
                         <span className="flex-1 text-left">{item.label}</span>
                         <ChevronRight className="size-3.5 opacity-0" />
                       </button>
                     );
                   })}
                 </nav>
              </CardContent>
            </Card>

            {/* 创作者卡片 */}
            <Card className="bg-white border-border shadow-sm mt-4">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="size-12 border-2 border-[#C4A96B]/30">
                    <AvatarImage src={avatarImages.avatarImg2} alt="创作者" />
                    <AvatarFallback>创作</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">琉光匠坊</p>
                    <Badge className="bg-[#C4A96B]/10 text-[#8B7355] border-0 text-[10px]">认证创作者</Badge>
                  </div>
                </div>
                <Separator className="my-3" />
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div>
                    <p className="text-lg font-bold text-foreground tabular-nums">12</p>
                    <p className="text-[10px] text-muted-foreground">作品数</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-foreground tabular-nums">L2</p>
                    <p className="text-[10px] text-muted-foreground">创作者等级</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* 右侧内容区 */}
          <main className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {/* 我的作品 */}
              {tab === 'works' && (
                <motion.div
                  key="works"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <Card className="bg-white border-border shadow-sm glass-edge-glow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-lg font-['Noto_Serif_SC'] tracking-wider font-semibold">
                        我的作品
                        <Badge variant="outline" className="ml-2 text-xs font-normal">
                          共 {works.length} 件
                        </Badge>
                      </CardTitle>
                      <Button onClick={() => navigate('/create')} size="sm" className="gap-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg">
                        <Plus className="size-3.5" />
                        新创作
                      </Button>
                    </CardHeader>
                    <CardContent>
                      {works.length === 0 ? (
                        <EmptyState type="works" className="py-12" />
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          <AnimatePresence>
                            {works.map((work, i) => (
                              <motion.div
                                key={work.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: i * 0.05 }}
                                whileHover={{ y: -4 }}
                                className="group rounded-xl border border-border bg-white overflow-hidden hover:border-primary/50 transition-all duration-300 shadow-sm"
                              >
                                <div
                                  className="aspect-square relative overflow-hidden cursor-pointer"
                                  onClick={() => navigate(`/preview/${work.id}`)}
                                >
                                  <Image
                                    src={work.images[work.selectedIndex ?? 0]}
                                    alt={work.prompt}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                  />
                                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                  {work.model3d && (
                                    <div className="absolute top-2 left-2">
                                      <Badge className="text-[10px] bg-primary/90 text-primary-foreground border-0 gap-1">
                                        <Box className="size-3" />
                                        3D
                                      </Badge>
                                    </div>
                                  )}
                                </div>
                                <div className="p-3">
                                  <p className="text-sm text-foreground line-clamp-2 mb-3 leading-relaxed h-10">
                                    {work.prompt}
                                  </p>
                                  <div className="flex items-center gap-1.5">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="flex-1 h-7 text-[11px] gap-0.5 border-border hover:bg-primary/5 hover:border-primary/30 hover:text-primary rounded-md"
                                      onClick={() => navigate(`/preview/${work.id}`)}
                                    >
                                      <Box className="size-3" />
                                      转3D
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="flex-1 h-7 text-[11px] gap-0.5 border-border hover:bg-primary/5 hover:border-primary/30 hover:text-primary rounded-md"
                                    >
                                      <Sparkles className="size-3" />
                                      发布
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="size-7 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                    >
                                      <Trash2 className="size-3.5" />
                                    </Button>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* 发布到广场的作品 */}
                  <Card className="bg-white border-border shadow-sm glass-edge-glow">
                     <CardHeader className="flex flex-row items-center justify-between pb-2">
                       <CardTitle className="text-lg font-['Noto_Serif_SC'] tracking-wider font-semibold">
                         已发布作品
                         <Badge variant="outline" className="ml-2 text-xs font-normal">
                           共 {squareWorks.length} 件
                         </Badge>
                       </CardTitle>
                       <Button size="sm" variant="outline" onClick={() => navigate('/square')} className="gap-1 rounded-lg">
                         <Eye className="size-3.5" />
                         查看广场
                       </Button>
                     </CardHeader>
                     <CardContent className="space-y-4">
                       {/* 审核状态筛选 */}
                       <div className="flex items-center gap-1 flex-wrap">
                         {[
                           { value: 'all', label: '全部' },
                           { value: 'approved', label: '已上架' },
                           { value: 'pending', label: '审核中' },
                           { value: 'rejected', label: '未通过' },
                         ].map((opt) => (
                           <button
                             key={opt.value}
                             onClick={() => setWorkAuditFilter(opt.value as typeof workAuditFilter)}
                             className={cn(
                               'px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200',
                               workAuditFilter === opt.value
                                 ? 'bg-[#2C3E3A] text-white'
                                 : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                             )}
                           >
                             {opt.label}
                           </button>
                         ))}
                       </div>
                       {squareWorks.length === 0 ? (
                         <EmptyState
                           type="earnings"
                           actionLabel="申请创作者"
                           onAction={() => navigate('/creator/apply')}
                           title="还没有发布作品"
                           description="成为创作者即可发布作品到广场赚取收益"
                           className="py-8"
                         />
                       ) : (
                         <ProfileWorksList works={squareWorks} filter={workAuditFilter} />
                       )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* 我的订单 */}
              {tab === 'orders' && (
                <motion.div
                  key="orders"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <Card className="bg-white border-border shadow-sm glass-edge-glow">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-['Noto_Serif_SC'] tracking-wider font-semibold">
                        我的订单
                      </CardTitle>
                      {/* 状态筛选 */}
                      <div className="flex items-center gap-1 mt-3 flex-wrap">
                        {ORDER_FILTER_TABS.map((item) => (
                          <button
                            key={item.value}
                            onClick={() => setOrderFilter(item.value)}
                            className={cn(
                              'px-3 h-7 text-xs rounded-md transition-all duration-200',
                              orderFilter === item.value
                                ? 'bg-primary text-primary-foreground font-medium'
                                : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                            )}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {filteredOrders.length === 0 ? (
                        <EmptyState
                          type="orders"
                          title={orderFilter === 'all' ? '暂无订单' : '暂无该状态订单'}
                          description="去作品广场看看有没有喜欢的"
                          actionLabel="去逛逛"
                          onAction={() => navigate('/square')}
                          className="py-12"
                        />
                      ) : (
                        filteredOrders.map((order) => {
                          const StatusIcon = getStatusIcon(order.status);
                          const progress = getOrderProgress(order.status);
                          return (
                            <div
                              key={order.id}
                              className="p-4 rounded-xl border border-border bg-white hover:border-primary/30 transition-all duration-300 shadow-sm"
                            >
                              {/* 订单头 */}
                              <div className="flex items-center justify-between mb-3 pb-3 border-b border-border/60">
                                <div className="flex items-center gap-3">
                                  <span className="text-xs text-muted-foreground">订单号：{order.id}</span>
                                  <span className="text-xs text-muted-foreground">{order.createdAt}</span>
                                </div>
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    'text-xs',
                                    order.status === 'completed'
                                      ? 'border-success/40 text-success bg-success/5'
                                      : order.status === 'producing'
                                      ? 'border-primary/40 text-primary bg-primary/5'
                                      : order.status === 'pending'
                                      ? 'border-warning/40 text-warning bg-warning/5'
                                      : order.status === 'shipped'
                                      ? 'border-info/40 text-info bg-info/5'
                                      : 'border-muted-foreground/30 text-muted-foreground'
                                  )}
                                >
                                  {getStatusLabel(order.status)}
                                </Badge>
                              </div>

                              <div className="flex items-start gap-4">
                                <div className="size-20 rounded-lg overflow-hidden shrink-0 relative border border-border">
                                  <Image
                                    src={order.workImage}
                                    alt={order.productName}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-1">
                                    <h3 className="font-medium text-foreground truncate">
                                      {order.productName}
                                    </h3>
                                    <p className="text-lg font-bold text-foreground tabular-nums shrink-0 ml-4">
                                      ¥{order.totalPrice.toLocaleString()}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2 mb-3">
                                    <Badge variant="outline" className="text-xs bg-white border-border">
                                      {productTypeLabel(order.productType)}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs bg-white border-border">
                                      × {order.quantity}
                                    </Badge>
                                  </div>

                                  {/* 进度条 */}
                                  <div className="relative">
                                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                      <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 0.8, ease: 'easeOut' }}
                                        className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
                                      />
                                    </div>
                                    <div className="flex justify-between mt-2">
                                      {ORDER_STATUS_STEPS.map((step) => {
                                        const idx = ORDER_STATUS_STEPS.findIndex(
                                          (s) => s.key === order.status
                                        );
                                        const currentIdx = ORDER_STATUS_STEPS.findIndex(
                                          (s) => s.key === step.key
                                        );
                                        const isActive = currentIdx <= idx;
                                        return (
                                          <div
                                            key={step.key}
                                            className="flex flex-col items-center gap-1"
                                          >
                                            <div
                                              className={cn(
                                                'size-2.5 rounded-full',
                                                isActive ? 'bg-primary' : 'bg-border'
                                              )}
                                            />
                                            <span
                                              className={cn(
                                                'text-[10px]',
                                                isActive
                                                  ? 'text-foreground font-medium'
                                                  : 'text-muted-foreground'
                                              )}
                                            >
                                              {step.label}
                                            </span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-border">
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      className="h-8 text-xs rounded-md"
                                      onClick={() => navigate(`/order-detail/${order.id}`)}
                                    >
                                      查看详情
                                    </Button>
                                    {order.status === 'pending' && (
                                      <Button 
                                        size="sm" 
                                        className="h-8 text-xs rounded-md bg-primary hover:bg-primary/90"
                                        onClick={() => navigate(`/order-detail/${order.id}`)}
                                      >
                                        去支付
                                      </Button>
                                    )}
                                    {order.status === 'shipped' && (
                                      <Button 
                                        size="sm" 
                                        className="h-8 text-xs rounded-md bg-primary hover:bg-primary/90"
                                        onClick={() => {
                                          confirmReceive(order.id);
                                        }}
                                      >
                                        确认收货
                                      </Button>
                                    )}
                                    <StatusIcon
                                      className={cn(
                                        'size-4 ml-1',
                                        order.status === 'producing'
                                          ? 'text-primary animate-spin'
                                          : 'text-primary'
                                      )}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* 我的收益 */}
              {tab === 'earnings' && (
                <motion.div
                  key="earnings"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  {/* 数据卡片 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-white border-border shadow-sm glass-edge-glow">
                      <CardContent className="p-5">
                        <p className="text-sm text-muted-foreground mb-2 tracking-wide flex items-center gap-1.5">
                          <Clock className="size-4 text-warning" />
                          待结算收益
                        </p>
                        <p className="text-3xl font-bold text-foreground tabular-nums font-['Noto_Serif_SC']">
                          ¥{earningsData.pendingRevenue.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          订单完成后 7 天自动结算
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-white border-border shadow-sm glass-edge-glow">
                      <CardContent className="p-5 flex flex-col gap-3">
                        <div>
                          <p className="text-sm text-muted-foreground mb-2 tracking-wide flex items-center gap-1.5">
                            <Wallet className="size-4 text-success" />
                            可提现余额
                          </p>
                          <p className="text-3xl font-bold text-success tabular-nums font-['Noto_Serif_SC']">
                            ¥{earningsData.availableRevenue.toFixed(2)}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={handleWithdraw}
                          disabled={withdrawing || earningsData.availableRevenue <= 0}
                          className="bg-[#2C3E3A] hover:bg-[#2C3E3A]/90 text-white rounded-md"
                        >
                          {withdrawing ? (
                            <><Loader2 className="size-3.5 mr-1 animate-spin" />申请中</>
                          ) : (
                            <><CreditCard className="size-3.5 mr-1" />申请提现</>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                    <Card className="bg-white border-border shadow-sm glass-edge-glow">
                      <CardContent className="p-5">
                        <p className="text-sm text-muted-foreground mb-2 tracking-wide flex items-center gap-1.5">
                          <TrendingUp className="size-4 text-primary" />
                          累计收益
                        </p>
                        <p className="text-3xl font-bold text-warning tabular-nums font-['Noto_Serif_SC'] glass-num-glow">
                          ¥{earningsData.totalRevenue.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          历史累计销售分成收益
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* 收益明细 */}
                  <Card className="bg-white border-border shadow-sm glass-edge-glow">
                    <CardHeader>
                      <CardTitle className="text-lg font-['Noto_Serif_SC'] tracking-wider font-semibold">
                        收益明细
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-border bg-muted/30">
                              <th className="text-xs text-muted-foreground font-medium text-left px-5 py-3 whitespace-nowrap">订单号</th>
                              <th className="text-xs text-muted-foreground font-medium text-left px-5 py-3 whitespace-nowrap">作品</th>
                              <th className="text-xs text-muted-foreground font-medium text-left px-5 py-3 whitespace-nowrap">下单用户</th>
                              <th className="text-xs text-muted-foreground font-medium text-right px-5 py-3 whitespace-nowrap">订单金额</th>
                              <th className="text-xs text-muted-foreground font-medium text-right px-5 py-3 whitespace-nowrap">分成</th>
                              <th className="text-xs text-muted-foreground font-medium text-right px-5 py-3 whitespace-nowrap">收益</th>
                              <th className="text-xs text-muted-foreground font-medium text-center px-5 py-3 whitespace-nowrap">状态</th>
                              <th className="text-xs text-muted-foreground font-medium text-right px-5 py-3 whitespace-nowrap">时间</th>
                            </tr>
                          </thead>
                          <tbody>
                            {earningsData.records.map((r) => (
                              <tr key={r.id} className="border-b border-border/60 hover:bg-muted/20 transition-colors">
                                <td className="px-5 py-3 text-xs text-muted-foreground tabular-nums font-mono">
                                  #{r.orderId}
                                </td>
                                <td className="px-5 py-3 text-sm text-foreground font-medium">
                                  {r.workTitle}
                                </td>
                                <td className="px-5 py-3 text-xs text-muted-foreground">
                                  {r.buyerName}
                                </td>
                                <td className="px-5 py-3 text-sm text-foreground text-right tabular-nums">
                                  ¥{r.orderAmount}
                                </td>
                                <td className="px-5 py-3 text-xs text-[#8B7355] text-right">
                                  {Math.round(r.royaltyRate * 100)}%
                                </td>
                                <td className="px-5 py-3 text-sm font-semibold text-success text-right tabular-nums">
                                  +¥{r.earning.toFixed(2)}
                                </td>
                                <td className="px-5 py-3 text-center">
                                  <Badge variant="outline" className={cn('text-[10px]', getEarningStatusColor(r.status))}>
                                    {getEarningStatusLabel(r.status)}
                                  </Badge>
                                </td>
                                <td className="px-5 py-3 text-xs text-muted-foreground text-right whitespace-nowrap">
                                  {r.createdAt}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* 积分账户 */}
              {tab === 'credit' && (
                <motion.div
                  key="credit"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-white border-border shadow-sm glass-edge-glow">
                      <CardContent className="p-5">
                        <p className="text-sm text-muted-foreground mb-2 tracking-wide">当前积分</p>
                        <p className="text-3xl font-bold text-warning tabular-nums flex items-center gap-2 font-['Noto_Serif_SC']">
                          <Coins className="size-6" />
                          {credit}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          积分仅用于消耗 AI 算力服务，不可提现
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-white border-border shadow-sm glass-edge-glow">
                      <CardContent className="p-5">
                        <p className="text-sm text-muted-foreground mb-2 tracking-wide">累计充值</p>
                        <p className="text-3xl font-bold text-success tabular-nums flex items-center gap-2 font-['Noto_Serif_SC']">
                          <ArrowUpRight className="size-6" />
                          {totalRecharge}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">历史累计充值积分</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-white border-border shadow-sm glass-edge-glow">
                      <CardContent className="p-5">
                        <p className="text-sm text-muted-foreground mb-2 tracking-wide">累计消耗</p>
                        <p className="text-3xl font-bold text-warning tabular-nums flex items-center gap-2 font-['Noto_Serif_SC']">
                          <ArrowDownRight className="size-6" />
                          {totalConsume}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">历史累计消耗积分</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* 充值包 */}
                  <Card className="bg-white border-border shadow-sm glass-edge-glow">
                    <CardHeader>
                      <CardTitle className="text-lg font-['Noto_Serif_SC'] tracking-wider font-semibold">积分充值</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {RECHARGE_PACKS.map((pack) => (
                          <button
                            key={pack.amount}
                            onClick={() => handleRecharge(pack)}
                            className="p-4 rounded-xl border border-border bg-white hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 text-left group"
                          >
                            <div className="text-xl font-bold text-foreground font-['Noto_Serif_SC'] mb-1">
                              {pack.amount}
                              <span className="text-xs text-muted-foreground ml-1">积分</span>
                            </div>
                            {pack.bonus > 0 && (
                              <Badge className="text-[10px] bg-[#C4A96B]/10 text-[#8B7355] border-0 mb-2">
                                赠 {pack.bonus} 积分
                              </Badge>
                            )}
                            <div className="text-xs text-muted-foreground">{pack.label}</div>
                            <div className="text-lg font-bold text-primary mt-2">
                              ¥{pack.price}
                            </div>
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white border-border shadow-sm glass-edge-glow">
                    <CardHeader>
                      <CardTitle className="text-lg font-['Noto_Serif_SC'] tracking-wider font-semibold">积分记录</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <ScrollArea className="h-[400px]">
                        <div className="divide-y divide-border">
                          {records.length === 0 && (
                            <div className="py-8">
                              <EmptyState
                                type="credit-records"
                                title="暂无积分记录"
                                description="充值或使用积分后，记录会显示在这里"
                                actionLabel="去充值"
                                onAction={() => navigate('/recharge')}
                                className="py-0"
                              />
                            </div>
                          )}
                          {records.map((r) => (
                            <div
                              key={r.id}
                              className="flex items-center gap-4 px-5 py-3 hover:bg-muted/30 transition-colors"
                            >
                              <div
                                className={cn(
                                  'size-9 rounded-full flex items-center justify-center',
                                  r.type === 'recharge'
                                    ? 'bg-success/10 text-success'
                                    : 'bg-warning/10 text-warning'
                                )}
                              >
                                {r.type === 'recharge' ? (
                                  <ArrowUpRight className="size-4" />
                                ) : (
                                  <ArrowDownRight className="size-4" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-foreground font-medium">{r.description}</p>
                                <p className="text-xs text-muted-foreground">{r.createdAt}</p>
                              </div>
                              <p
                                className={cn(
                                  'text-base font-semibold tabular-nums',
                                  r.type === 'recharge' ? 'text-success' : 'text-warning'
                                )}
                              >
                                {r.type === 'recharge' ? '+' : '-'}{r.amount}
                              </p>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* 账户设置 */}
              {tab === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  {/* 基本信息 */}
                  <Card className="bg-white border-border shadow-sm glass-edge-glow">
                    <CardHeader>
                      <CardTitle className="text-lg font-['Noto_Serif_SC'] tracking-wider font-semibold flex items-center justify-between">
                        基本信息
                        <Button size="sm" variant="outline" className="gap-1 rounded-md">
                          <Edit className="size-3.5" />
                          编辑
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-start gap-6">
                        <div className="text-center">
                          <Avatar className="size-24 border-4 border-white shadow-md">
                            <AvatarImage src={user?.avatar || avatarImages.avatarImg2} alt="头像" />
                            <AvatarFallback className="text-2xl">{user?.nickname?.slice(0, 1) || '琉'}</AvatarFallback>
                          </Avatar>
                          <Button size="sm" variant="outline" className="mt-3 h-7 text-xs rounded-md gap-1">
                            <Edit className="size-3" />
                            更换头像
                          </Button>
                        </div>
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs text-muted-foreground">昵称</label>
                            <Input value={user?.nickname || ''} readOnly className="bg-muted/30 h-9" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs text-muted-foreground">角色</label>
                            <Input value={user?.role === 'admin' ? '管理员' : user?.role === 'creator' ? '创作者' : '普通用户'} readOnly className="bg-muted/30 h-9" />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs text-muted-foreground">手机号</label>
                            <div className="flex items-center gap-2">
                              <Input value={user?.phone ? user.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : ''} readOnly className="bg-muted/30 h-9" />
                              <Phone className="size-4 text-muted-foreground" />
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs text-muted-foreground">用户ID</label>
                            <Input value={user?.id || ''} readOnly className="bg-muted/30 h-9 font-mono text-xs" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                   </Card>

                   {/* 角色切换（测试账号专属） */}
                   {user?.phone === '13800138000' && (
                     <Card className="bg-white border-border shadow-sm glass-edge-glow">
                       <CardHeader>
                         <CardTitle className="text-lg font-['Noto_Serif_SC'] tracking-wider font-semibold">
                           角色体验
                           <Badge variant="outline" className="ml-2 text-[10px] border-[#C4A96B]/40 text-[#C4A96B] bg-[#C4A96B]/5">
                             测试账号专属
                           </Badge>
                         </CardTitle>
                       </CardHeader>
                       <CardContent>
                         <p className="text-xs text-muted-foreground mb-4">
                           您使用的是测试账号，可自由切换用户/创作者/管理员角色体验完整功能
                         </p>
                         <div className="flex items-center gap-3">
                           <Button
                             size="sm"
                             variant={user.role === 'user' ? 'default' : 'outline'}
                             className="gap-1 rounded-md"
                             onClick={() => switchRole('user')}
                           >
                             普通用户
                           </Button>
                           <Button
                             size="sm"
                             variant={user.role === 'creator' ? 'default' : 'outline'}
                             className="gap-1 rounded-md"
                             onClick={() => switchRole('creator')}
                           >
                             创作者
                           </Button>
                           <Button
                             size="sm"
                             variant={user.role === 'admin' ? 'default' : 'outline'}
                             className="gap-1 rounded-md"
                             onClick={() => switchRole('admin')}
                           >
                             <Shield className="size-3.5" />
                             管理员
                           </Button>
                           {user.role !== 'admin' && (
                             <Button
                               size="sm"
                               variant="outline"
                               className="gap-1 rounded-md ml-auto text-primary"
                               onClick={() => { switchRole('admin'); navigate('/admin'); }}
                             >
                               <Shield className="size-3.5" />
                               切换到管理员视角
                             </Button>
                           )}
                         </div>
                       </CardContent>
                     </Card>
                   )}

                   {/* 积分账户 */}
                  <Card className="bg-white border-border shadow-sm glass-edge-glow">
                    <CardHeader>
                      <CardTitle className="text-lg font-['Noto_Serif_SC'] tracking-wider font-semibold">
                        积分账户
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                        <div className="flex items-center gap-4">
                          <div className="size-12 rounded-full bg-warning/10 flex items-center justify-center">
                            <Coins className="size-6 text-warning" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">当前积分</p>
                            <p className="text-2xl font-bold text-warning tabular-nums font-['Noto_Serif_SC']">
                              {credit}
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => setRechargeDialogOpen(true)}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1 rounded-lg"
                        >
                          <Plus className="size-4" />
                          充值
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 创作者信息 */}
                  <Card className="bg-white border-border shadow-sm glass-edge-glow">
                    <CardHeader>
                      <CardTitle className="text-lg font-['Noto_Serif_SC'] tracking-wider font-semibold">
                        创作者信息
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl bg-muted/30">
                          <p className="text-xs text-muted-foreground mb-1">创作者等级</p>
                          <p className="text-xl font-bold text-foreground font-['Noto_Serif_SC']">L2 新锐匠人</p>
                          <p className="text-[11px] text-muted-foreground mt-1">距离 L3 还差 8 件作品</p>
                        </div>
                        <div className="p-4 rounded-xl bg-muted/30">
                          <p className="text-xs text-muted-foreground mb-1">入驻时间</p>
                          <p className="text-xl font-bold text-foreground font-['Noto_Serif_SC']">2026.03</p>
                          <p className="text-[11px] text-muted-foreground mt-1">已入驻 6 个月</p>
                        </div>
                        <div className="p-4 rounded-xl bg-muted/30">
                          <p className="text-xs text-muted-foreground mb-1">累计发布作品</p>
                          <p className="text-xl font-bold text-foreground font-['Noto_Serif_SC']">{squareWorks.length} 件</p>
                          <p className="text-[11px] text-muted-foreground mt-1">公开发布 {squareWorks.filter(w => w.status === 'published').length} 件</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 收货地址 */}
                  <Card className="bg-white border-border shadow-sm glass-edge-glow">
                    <CardHeader>
                      <CardTitle className="text-lg font-['Noto_Serif_SC'] tracking-wider font-semibold flex items-center justify-between">
                        收货地址管理
                        <Button size="sm" variant="outline" className="gap-1 rounded-md">
                          <Edit className="size-3.5" />
                          编辑
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="p-4 rounded-xl border border-primary/30 bg-primary/5">
                        <div className="flex items-start gap-3">
                          <MapPin className="size-5 text-primary mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-foreground">张先生</span>
                              <span className="text-sm text-muted-foreground">138****6688</span>
                              <Badge className="bg-primary text-primary-foreground border-0 text-[10px]">默认</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              上海市 徐汇区 漕河泾开发区 宜山路 701 号 创意园 B 栋 506 室
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                   {/* 退出登录 */}
                   <div className="pt-4">
                     <Button
                       variant="outline"
                       className="w-full h-11 text-destructive border-destructive/30 hover:bg-destructive/5 hover:text-destructive rounded-xl"
                       onClick={() => {
                         logout();
                         navigate('/');
                       }}
                     >
                       <LogOut className="size-4 mr-2" />
                       退出登录
                     </Button>
                   </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* 充值弹窗 */}
      {rechargeDialogOpen && (
        <div
          className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setRechargeDialogOpen(false)}
        >
          <div
            className="bg-white rounded-xl border border-border shadow-lg w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-['Noto_Serif_SC'] tracking-wider font-semibold text-foreground mb-4">
              积分充值
            </h3>
            <div className="space-y-3">
              {RECHARGE_PACKS.map((pack) => (
                <button
                  key={pack.amount}
                  onClick={() => handleRecharge(pack)}
                  className="w-full p-4 rounded-xl border border-border bg-white hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 text-left flex items-center justify-between group"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-foreground">
                        {pack.amount} 积分
                      </span>
                      <Badge variant="outline" className="text-[10px] bg-white border-border">
                        {pack.label}
                      </Badge>
                    </div>
                    {pack.bonus > 0 && (
                      <p className="text-xs text-warning mt-1">赠送 {pack.bonus} 积分</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">¥{pack.price}</p>
                    <p className="text-xs text-muted-foreground group-hover:text-primary transition-colors">
                      立即充值 →
                    </p>
                  </div>
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-center pt-4">
              积分仅用于消耗 AI 算力服务，不可提现、不可转让
            </p>
            <Button
              variant="outline"
              onClick={() => setRechargeDialogOpen(false)}
              className="w-full mt-4 rounded-lg"
            >
              关闭
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// 我的作品列表（带审核状态角标）
interface ProfileWorksListProps {
  works: ISquareWork[];
  filter: 'all' | 'approved' | 'pending' | 'rejected';
}

function ProfileWorksList({ works, filter }: ProfileWorksListProps) {
  const filtered = useMemo(() => {
    if (filter === 'all') return works;
    return works.filter((w) => w.auditStatus === filter);
  }, [works, filter]);

  if (filtered.length === 0) {
    return (
      <div className="py-10 text-center">
        <p className="text-sm text-muted-foreground">没有符合条件的作品</p>
      </div>
    );
  }

  const getAuditBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge variant="outline" className="text-[10px] border-[#4A7C59]/40 text-[#4A7C59] bg-[#4A7C59]/5">
            已上架
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="text-[10px] border-[#C49A3A]/40 text-[#C49A3A] bg-[#C49A3A]/5">
            审核中
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="text-[10px] border-[#B5483E]/40 text-[#B5483E] bg-[#B5483E]/5">
            未通过
          </Badge>
        );
      case 'offline':
        return (
          <Badge variant="outline" className="text-[10px] border-muted-foreground/40 text-muted-foreground bg-muted/50">
            已下架
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-3">
      {filtered.map((work) => (
        <div
          key={work.id}
          className="flex items-center gap-4 p-3 rounded-xl border border-border hover:border-primary/30 transition-all duration-300"
        >
          <div className="size-14 rounded-lg overflow-hidden shrink-0 border border-border relative">
            <Image src={work.images[0]} alt={work.title} className="w-full h-full object-cover" />
            {/* 审核状态角标（左上角） */}
            {work.auditStatus !== 'approved' && (
              <div
                className={cn(
                  'absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-medium text-white shadow-sm',
                  work.auditStatus === 'pending' && 'bg-[#C49A3A]',
                  work.auditStatus === 'rejected' && 'bg-[#B5483E]',
                )}
              >
                {work.auditStatus === 'pending' ? '审核中' : '未通过'}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-foreground truncate text-sm">{work.title}</h4>
              {getAuditBadge(work.auditStatus)}
            </div>
            {work.auditStatus === 'pending' && (
              <p className="text-[11px] text-[#C49A3A] mb-1">审核中，预计 1-3 个工作日完成</p>
            )}
            {work.auditStatus === 'rejected' && (
              <p className="text-[11px] text-[#B5483E] mb-1">未通过原因：{work.auditReason || '内容不符合社区规范'}</p>
            )}
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <span>已售 {work.sales} 件</span>
              <span className="text-[#8B7355] font-medium">收益 ¥{work.revenue.toFixed(2)}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {work.auditStatus === 'rejected' && (
              <Button size="sm" variant="outline" className="h-7 text-xs rounded-md">
                重新编辑
              </Button>
            )}
            <Button size="icon" variant="ghost" className="size-7 rounded-md">
              <Eye className="size-3.5" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

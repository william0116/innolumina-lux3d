import { useState, useMemo } from 'react';
import {
  Wallet,
  TrendingUp,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  Medal,
  ArrowDownUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar } from '@/components/ui/avatar';
import { avatarImages } from '@lark-apaas/client-toolkit-lite';
import { cn } from '@/lib/utils';
import { Image } from '@/components/ui/image';

// 创作者排行数据
const CREATOR_RANKINGS = [
  { rank: 1, name: '竹影工坊', avatar: avatarImages.avatarImg1, works: 24, orders: 86, revenue: 12580, share: 32.7 },
  { rank: 2, name: '琉璃诗人', avatar: avatarImages.avatarImg2, works: 18, orders: 62, revenue: 8920, share: 23.2 },
  { rank: 3, name: '器物之间', avatar: avatarImages.avatarImg3, works: 15, orders: 45, revenue: 6340, share: 16.5 },
  { rank: 4, name: '东方集', avatar: avatarImages.avatarImg4, works: 12, orders: 32, revenue: 4280, share: 11.1 },
  { rank: 5, name: '禅意工坊', avatar: avatarImages.avatarImg5, works: 10, orders: 28, revenue: 3156, share: 8.2 },
  { rank: 6, name: '青瓷记', avatar: avatarImages.avatarImg6, works: 8, orders: 18, revenue: 1890, share: 4.9 },
  { rank: 7, name: '光影琉璃', avatar: avatarImages.avatarImg7, works: 6, orders: 12, revenue: 980, share: 2.5 },
  { rank: 8, name: '小雅集', avatar: avatarImages.avatarImg8, works: 5, orders: 8, revenue: 330.5, share: 0.9 },
];

// 提现申请
interface WithdrawRequest {
  id: string;
  creatorName: string;
  amount: number;
  method: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

const INITIAL_WITHDRAWALS: WithdrawRequest[] = [
  { id: 'WD20260917001', creatorName: '竹影工坊', amount: 2000, method: '支付宝', createdAt: '2026-09-17 10:30', status: 'pending' },
  { id: 'WD20260916003', creatorName: '琉璃诗人', amount: 1500, method: '微信', createdAt: '2026-09-16 14:20', status: 'pending' },
  { id: 'WD20260915002', creatorName: '器物之间', amount: 800, method: '银行卡', createdAt: '2026-09-15 09:15', status: 'pending' },
];

// 收益明细
const EARNING_DETAILS = [
  { id: 'e-1', creator: '竹影工坊', orderNo: 'IL20260917001', workTitle: '四时物候·竹叶八角匣', orderAmount: 580, rate: 0.15, earning: 87, status: 'available', time: '2026-09-17 15:20' },
  { id: 'e-2', creator: '琉璃诗人', orderNo: 'IL20260917002', workTitle: '海棠形琉璃香插', orderAmount: 198, rate: 0.20, earning: 39.6, status: 'pending', time: '2026-09-17 14:05' },
  { id: 'e-3', creator: '器物之间', orderNo: 'IL20260916008', workTitle: '青绿系琉璃茶则', orderAmount: 168, rate: 0.15, earning: 25.2, status: 'pending', time: '2026-09-16 20:30' },
  { id: 'e-4', creator: '竹影工坊', orderNo: 'IL20260916005', workTitle: '穹宇藻井纹台灯', orderAmount: 1280, rate: 0.20, earning: 256, status: 'available', time: '2026-09-16 11:42' },
  { id: 'e-5', creator: '东方集', orderNo: 'IL20260915012', workTitle: '翠色海棠长匣', orderAmount: 349, rate: 0.15, earning: 52.35, status: 'available', time: '2026-09-15 16:18' },
  { id: 'e-6', creator: '禅意工坊', orderNo: 'IL20260915003', workTitle: '长形渐变蓝香插', orderAmount: 149, rate: 0.10, earning: 14.9, status: 'withdrawn', time: '2026-09-15 09:50' },
  { id: 'e-7', creator: '琉璃诗人', orderNo: 'IL20260914009', workTitle: '椭圆磨砂蓝琉璃匣', orderAmount: 299, rate: 0.10, earning: 29.9, status: 'withdrawn', time: '2026-09-14 14:22' },
  { id: 'e-8', creator: '青瓷记', orderNo: 'IL20260914002', workTitle: '四时物候展览系列', orderAmount: 1299, rate: 0.15, earning: 194.85, status: 'available', time: '2026-09-14 10:15' },
  { id: 'e-9', creator: '光影琉璃', orderNo: 'IL20260913006', workTitle: '琥珀海棠长匣·首饰盒', orderAmount: 460, rate: 0.10, earning: 46, status: 'withdrawn', time: '2026-09-13 18:40' },
  { id: 'e-10', creator: '小雅集', orderNo: 'IL20260912001', workTitle: '几何切割花瓶', orderAmount: 199, rate: 0.10, earning: 19.9, status: 'pending', time: '2026-09-12 13:28' },
];

const TREND_DATA_7D = [
  { day: '9/11', value: 3280 },
  { day: '9/12', value: 4520 },
  { day: '9/13', value: 3890 },
  { day: '9/14', value: 5680 },
  { day: '9/15', value: 6240 },
  { day: '9/16', value: 7850 },
  { day: '9/17', value: 4016 },
];

const TREND_DATA_30D = Array.from({ length: 30 }, (_, i) => ({
  day: `${9}/${i + 1}`,
  value: Math.round(2000 + Math.sin(i / 3) * 1500 + Math.random() * 2000),
}));

const getRankMedalColor = (rank: number) => {
  if (rank === 1) return '#C4A96B'; // 金
  if (rank === 2) return '#A8B0B8'; // 银
  if (rank === 3) return '#B87333'; // 铜
  return '#999';
};

const getEarningStatusBadge = (status: string) => {
  switch (status) {
    case 'available':
      return <Badge variant="outline" className="text-[10px] border-[#4A7C59]/40 text-[#4A7C59] bg-[#4A7C59]/5">可提现</Badge>;
    case 'pending':
      return <Badge variant="outline" className="text-[10px] border-[#C49A3A]/40 text-[#C49A3A] bg-[#C49A3A]/5">待结算</Badge>;
    case 'withdrawn':
      return <Badge variant="outline" className="text-[10px] border-muted-foreground/40 text-muted-foreground">已提现</Badge>;
    default:
      return null;
  }
};

export default function EarningsSection() {
  const [trendRange, setTrendRange] = useState<'7d' | '30d'>('7d');
  const [earningFilter, setEarningFilter] = useState<'all' | 'pending' | 'available' | 'withdrawn'>('all');
  const [withdrawals, setWithdrawals] = useState<WithdrawRequest[]>(INITIAL_WITHDRAWALS);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  const trendData = trendRange === '7d' ? TREND_DATA_7D : TREND_DATA_30D;
  const maxTrend = Math.max(...trendData.map((d) => d.value));

  const stats = useMemo(() => ({
    total: 38476.5,
    pending: 2340,
    available: 8920,
    withdrawn: 27216.5,
  }), []);

  const filteredEarnings = useMemo(() => {
    if (earningFilter === 'all') return EARNING_DETAILS;
    return EARNING_DETAILS.filter((e) => e.status === earningFilter);
  }, [earningFilter]);

  const pendingWithdrawals = withdrawals.filter((w) => w.status === 'pending');
  const historyWithdrawals = withdrawals.filter((w) => w.status !== 'pending');

  const handleApproveWithdraw = (id: string) => {
    setWithdrawals((prev) =>
      prev.map((w) => (w.id === id ? { ...w, status: 'approved' as const } : w))
    );
    toast.success('提现申请已通过，款项将在1-3个工作日内到账');
  };

  const handleRejectWithdraw = (id: string) => {
    setRejectId(id);
    setRejectReason('');
    setRejectDialogOpen(true);
  };

  const confirmReject = () => {
    if (!rejectId) return;
    setWithdrawals((prev) =>
      prev.map((w) => (w.id === rejectId ? { ...w, status: 'rejected' as const } : w))
    );
    setRejectDialogOpen(false);
    setRejectId(null);
    toast.success('已拒绝提现申请，金额退回可提现余额');
  };

  return (
    <motion.div
      key="earnings"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-foreground font-['Noto_Serif_SC'] tracking-wider mb-1">
          收益管理
        </h1>
        <p className="text-sm text-muted-foreground">平台收益统计与创作者分成管理</p>
      </div>

      {/* 顶部统计卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white border-border shadow-sm overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div
                className="size-10 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(44, 62, 58, 0.1)', color: '#2C3E3A' }}
              >
                <Wallet className="size-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground tabular-nums tracking-tight">
              ¥{stats.total.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">累计收益总额</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-border shadow-sm overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div
                className="size-10 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(196, 154, 58, 0.1)', color: '#C49A3A' }}
              >
                <Clock className="size-5" />
              </div>
            </div>
            <p className="text-2xl font-bold tabular-nums tracking-tight" style={{ color: '#C49A3A' }}>
              ¥{stats.pending.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">待结算收益</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-border shadow-sm overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div
                className="size-10 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(74, 124, 89, 0.1)', color: '#4A7C59' }}
              >
                <CheckCircle2 className="size-5" />
              </div>
            </div>
            <p className="text-2xl font-bold tabular-nums tracking-tight" style={{ color: '#4A7C59' }}>
              ¥{stats.available.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">可提现余额</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-border shadow-sm overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div
                className="size-10 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(153, 153, 153, 0.1)', color: '#999' }}
              >
                <ArrowUpRight className="size-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground tabular-nums tracking-tight">
              ¥{stats.withdrawn.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">已提现总额</p>
          </CardContent>
        </Card>
      </div>

      {/* 收益趋势图 */}
      <Card className="bg-white border-border shadow-sm">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-['Noto_Serif_SC'] tracking-wider font-semibold">
            收益趋势
          </CardTitle>
          <div className="flex items-center gap-1 bg-muted/30 rounded-md p-0.5">
            {[
              { value: '7d', label: '7天' },
              { value: '30d', label: '30天' },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTrendRange(opt.value as '7d' | '30d')}
                className={cn(
                  'px-3 py-1 rounded text-xs font-medium transition-all duration-200',
                  trendRange === opt.value
                    ? 'bg-white text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between gap-1 h-48 pt-4">
            {trendData.map((d, i) => {
              const height = (d.value / maxTrend) * 100;
              const isLast = i === trendData.length - 1;
              return (
                <div
                  key={d.day}
                  className="flex-1 flex flex-col items-center gap-2 group relative"
                >
                  <div className="w-full flex flex-col items-center justify-end flex-1">
                    <span className="text-[10px] text-muted-foreground mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      ¥{d.value.toLocaleString()}
                    </span>
                    <div
                      className="w-full rounded-t transition-all duration-300 group-hover:opacity-80"
                      style={{
                        height: `${height}%`,
                        minHeight: '4px',
                        background: isLast
                          ? 'linear-gradient(180deg, #C4A96B, #A68B4B)'
                          : 'linear-gradient(180deg, rgba(196, 169, 107, 0.6), rgba(166, 139, 75, 0.4))',
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{d.day}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 创作者收益排行 */}
      <Card className="bg-white border-border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-['Noto_Serif_SC'] tracking-wider font-semibold">
            创作者收益排行
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30">
                <tr>
                  <th className="text-xs text-muted-foreground font-medium text-left px-5 py-3 whitespace-nowrap w-16">排名</th>
                  <th className="text-xs text-muted-foreground font-medium text-left px-5 py-3 whitespace-nowrap">创作者</th>
                  <th className="text-xs text-muted-foreground font-medium text-right px-5 py-3 whitespace-nowrap">作品数</th>
                  <th className="text-xs text-muted-foreground font-medium text-right px-5 py-3 whitespace-nowrap">订单数</th>
                  <th className="text-xs text-muted-foreground font-medium text-right px-5 py-3 whitespace-nowrap">累计收益</th>
                  <th className="text-xs text-muted-foreground font-medium text-right px-5 py-3 whitespace-nowrap">占比</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {CREATOR_RANKINGS.map((c) => (
                  <tr key={c.rank} className="hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        {c.rank <= 3 ? (
                          <Medal className="size-5" style={{ color: getRankMedalColor(c.rank) }} />
                        ) : (
                          <span className="text-muted-foreground font-medium w-5 text-center text-xs">{c.rank}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="size-7">
                          <Image src={c.avatar} alt={c.name} className="w-full h-full object-cover" />
                        </Avatar>
                        <span className="text-foreground font-medium">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-foreground">{c.works}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-foreground">{c.orders}</td>
                    <td className="px-5 py-3 text-right font-medium tabular-nums" style={{ color: '#C4A96B' }}>
                      ¥{c.revenue.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-3 text-right text-muted-foreground text-xs tabular-nums">
                      {c.share.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 提现申请管理 */}
      <Card className="bg-white border-border shadow-sm">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-['Noto_Serif_SC'] tracking-wider font-semibold">
            待处理提现申请
          </CardTitle>
          <Badge variant="outline" className="text-[11px] border-[#C49A3A]/40 text-[#C49A3A] bg-[#C49A3A]/5">
            {pendingWithdrawals.length} 条待处理
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30">
                <tr>
                  <th className="text-xs text-muted-foreground font-medium text-left px-5 py-3 whitespace-nowrap">申请单号</th>
                  <th className="text-xs text-muted-foreground font-medium text-left px-5 py-3 whitespace-nowrap">创作者</th>
                  <th className="text-xs text-muted-foreground font-medium text-right px-5 py-3 whitespace-nowrap">提现金额</th>
                  <th className="text-xs text-muted-foreground font-medium text-left px-5 py-3 whitespace-nowrap">提现方式</th>
                  <th className="text-xs text-muted-foreground font-medium text-left px-5 py-3 whitespace-nowrap">申请时间</th>
                  <th className="text-xs text-muted-foreground font-medium text-left px-5 py-3 whitespace-nowrap">状态</th>
                  <th className="text-xs text-muted-foreground font-medium text-right px-5 py-3 whitespace-nowrap">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pendingWithdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-muted-foreground text-sm">
                      暂无待处理的提现申请
                    </td>
                  </tr>
                ) : (
                  pendingWithdrawals.map((w) => (
                    <tr key={w.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-3 font-mono text-xs text-foreground">{w.id}</td>
                      <td className="px-5 py-3 text-foreground">{w.creatorName}</td>
                      <td className="px-5 py-3 text-right font-medium tabular-nums" style={{ color: '#C4A96B' }}>
                        ¥{w.amount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-5 py-3 text-foreground">{w.method}</td>
                      <td className="px-5 py-3 text-xs text-muted-foreground whitespace-nowrap">{w.createdAt}</td>
                      <td className="px-5 py-3">
                        <Badge variant="outline" className="text-[10px] border-[#C49A3A]/40 text-[#C49A3A] bg-[#C49A3A]/5">
                          待审核
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <Button
                            size="sm"
                            className="h-7 text-xs rounded-md bg-[#4A7C59] hover:bg-[#3A6349] text-white gap-1"
                            onClick={() => handleApproveWithdraw(w.id)}
                          >
                            <CheckCircle2 className="size-3" />
                            通过
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-7 text-xs rounded-md gap-1"
                            onClick={() => handleRejectWithdraw(w.id)}
                          >
                            拒绝
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 已处理记录折叠 */}
      <Card className="bg-white border-border shadow-sm">
        <button
          className="w-full flex items-center justify-between px-5 py-3 text-left"
          onClick={() => setShowHistory(!showHistory)}
        >
          <span className="text-sm font-medium text-foreground">已处理提现记录</span>
          <ArrowDownUp className={cn('size-4 text-muted-foreground transition-transform', showHistory && 'rotate-180')} />
        </button>
        {showHistory && (
          <div className="border-t border-border">
            <div className="w-full overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="text-xs text-muted-foreground font-medium text-left px-5 py-2.5 whitespace-nowrap">申请单号</th>
                    <th className="text-xs text-muted-foreground font-medium text-left px-5 py-2.5 whitespace-nowrap">创作者</th>
                    <th className="text-xs text-muted-foreground font-medium text-right px-5 py-2.5 whitespace-nowrap">金额</th>
                    <th className="text-xs text-muted-foreground font-medium text-left px-5 py-2.5 whitespace-nowrap">状态</th>
                    <th className="text-xs text-muted-foreground font-medium text-left px-5 py-2.5 whitespace-nowrap">申请时间</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    { id: 'WD20260914001', creator: '竹影工坊', amount: 3000, status: 'approved', time: '2026-09-14 15:00' },
                    { id: 'WD20260913002', creator: '琉璃诗人', amount: 1200, status: 'approved', time: '2026-09-13 10:20' },
                    { id: 'WD20260912001', creator: '光影琉璃', amount: 500, status: 'rejected', time: '2026-09-12 14:30' },
                    { id: 'WD20260910003', creator: '东方集', amount: 800, status: 'approved', time: '2026-09-10 09:45' },
                    { id: 'WD20260908002', creator: '器物之间', amount: 1500, status: 'approved', time: '2026-09-08 16:12' },
                  ].map((h) => (
                    <tr key={h.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-5 py-2.5 font-mono text-xs text-foreground/80">{h.id}</td>
                      <td className="px-5 py-2.5 text-foreground/80">{h.creator}</td>
                      <td className="px-5 py-2.5 text-right tabular-nums text-foreground/80">
                        ¥{h.amount.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-5 py-2.5">
                        {h.status === 'approved' ? (
                          <Badge variant="outline" className="text-[10px] border-[#4A7C59]/40 text-[#4A7C59] bg-[#4A7C59]/5">已打款</Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] border-[#B5483E]/40 text-[#B5483E] bg-[#B5483E]/5">已拒绝</Badge>
                        )}
                      </td>
                      <td className="px-5 py-2.5 text-xs text-muted-foreground whitespace-nowrap">{h.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Card>

      {/* 收益明细 */}
      <Card className="bg-white border-border shadow-sm">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-['Noto_Serif_SC'] tracking-wider font-semibold">
            收益明细
          </CardTitle>
          <div className="flex items-center gap-1 flex-wrap">
            {[
              { value: 'all', label: '全部' },
              { value: 'pending', label: '待结算' },
              { value: 'available', label: '可提现' },
              { value: 'withdrawn', label: '已提现' },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setEarningFilter(opt.value as typeof earningFilter)}
                className={cn(
                  'px-2.5 py-1 rounded text-[11px] font-medium transition-all duration-200',
                  earningFilter === opt.value
                    ? 'bg-[#2C3E3A] text-white'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30">
                <tr>
                  <th className="text-xs text-muted-foreground font-medium text-left px-5 py-3 whitespace-nowrap">收益ID</th>
                  <th className="text-xs text-muted-foreground font-medium text-left px-5 py-3 whitespace-nowrap">创作者</th>
                  <th className="text-xs text-muted-foreground font-medium text-left px-5 py-3 whitespace-nowrap">关联订单</th>
                  <th className="text-xs text-muted-foreground font-medium text-left px-5 py-3 whitespace-nowrap">作品名称</th>
                  <th className="text-xs text-muted-foreground font-medium text-right px-5 py-3 whitespace-nowrap">订单金额</th>
                  <th className="text-xs text-muted-foreground font-medium text-right px-5 py-3 whitespace-nowrap">分成比例</th>
                  <th className="text-xs text-muted-foreground font-medium text-right px-5 py-3 whitespace-nowrap">收益金额</th>
                  <th className="text-xs text-muted-foreground font-medium text-left px-5 py-3 whitespace-nowrap">状态</th>
                  <th className="text-xs text-muted-foreground font-medium text-left px-5 py-3 whitespace-nowrap">时间</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredEarnings.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-5 py-12 text-center text-muted-foreground text-sm">
                      暂无符合条件的收益记录
                    </td>
                  </tr>
                ) : (
                  filteredEarnings.map((e) => (
                    <tr key={e.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-3 font-mono text-xs text-foreground/70">{e.id}</td>
                      <td className="px-5 py-3 text-foreground">{e.creator}</td>
                      <td className="px-5 py-3 font-mono text-xs text-foreground/70">{e.orderNo}</td>
                      <td className="px-5 py-3 text-foreground">
                        <span className="block truncate max-w-[180px]">{e.workTitle}</span>
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums text-foreground">
                        ¥{e.orderAmount.toFixed(2)}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums text-muted-foreground text-xs">
                        {(e.rate * 100).toFixed(0)}%
                      </td>
                      <td className="px-5 py-3 text-right font-medium tabular-nums" style={{ color: '#C4A96B' }}>
                        +¥{e.earning.toFixed(2)}
                      </td>
                      <td className="px-5 py-3">{getEarningStatusBadge(e.status)}</td>
                      <td className="px-5 py-3 text-xs text-muted-foreground whitespace-nowrap">{e.time}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 拒绝原因弹窗 */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="max-w-md bg-white border-border">
          <DialogHeader>
            <DialogTitle className="font-['Noto_Serif_SC'] tracking-wider font-semibold">
              拒绝提现申请
            </DialogTitle>
            <DialogDescription className="text-xs">
              拒绝后，提现金额将退回创作者可提现余额
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground font-medium">拒绝原因</Label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="请输入拒绝原因..."
                className="min-h-[80px] resize-none bg-white border-border text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)} className="rounded-lg">
              取消
            </Button>
            <Button variant="destructive" onClick={confirmReject} className="rounded-lg">
              确认拒绝
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

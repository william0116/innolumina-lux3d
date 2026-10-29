import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileCheck,
  Users,
  ShoppingCart,
  Wallet,
  Settings,
  LogOut,
  Search,
  Check,
  X,
  ChevronRight,
  Package,
  TrendingUp,
  Eye,
  UserCheck,
  Ban,
  Truck,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar } from '@/components/ui/avatar';
import { Image } from '@/components/ui/image';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import {
  getAllSquareWorks,
  saveAllSquareWorks,
  approveWork,
  rejectWork,
} from '@/lib/square-storage';
import { getUser as getUserFromStorage, getOrders, updateOrder, genTrackingNo } from '@/lib/app-storage';
import { getUsers, getAllUsers, updateUserRole, toggleUserStatus } from '@/lib/user-storage';
import type { IUser, IOrderDetail } from '@/data/types';
import type { ISquareWork } from '@/data/square';
import { MOCK_SQUARE_WORKS, MOCK_CREATORS } from '@/data/square';
import EarningsSection from './sections/EarningsSection';
import SettingsSection from './sections/SettingsSection';
import { INNO_REAL_IMAGES } from '@/data/showcase';
import { avatarImages } from '@lark-apaas/client-toolkit-lite';
import { cn } from '@/lib/utils';

type AdminTab = 'dashboard' | 'audit' | 'users' | 'orders' | 'earnings' | 'settings';

const NAV_ITEMS: { key: AdminTab; label: string; icon: typeof LayoutDashboard }[] = [
  { key: 'dashboard', label: '数据概览', icon: LayoutDashboard },
  { key: 'audit', label: '内容审核', icon: FileCheck },
  { key: 'users', label: '用户管理', icon: Users },
  { key: 'orders', label: '订单管理', icon: ShoppingCart },
  { key: 'earnings', label: '收益管理', icon: Wallet },
  { key: 'settings', label: '系统设置', icon: Settings },
];

// 预置审核数据（待审核作品）
const PENDING_WORKS: Omit<ISquareWork, 'creator'>[] = [
  {
    id: 'audit-1',
    title: '山水意境琉璃灯',
    description: '东方山水意象，层叠山峦造型',
    images: [INNO_REAL_IMAGES.zhuyeBagua],
    tags: ['东方美学', '灯饰'],
    priceMin: 299,
    priceMax: 699,
    basePrice: 299,
    royaltyRate: 0.15,
    likes: 0,
    favorites: 0,
    sales: 0,
    dimensions: '200×150×300 mm',
    material: '高硼硅琉璃',
    craft: '脱蜡铸造',
    createdAt: '2025-01-15 14:32',
    isPublic: true,
    status: 'published',
    auditStatus: 'pending',
    revenue: 0,
  },
  {
    id: 'audit-2',
    title: '云纹琉璃香插',
    description: '祥云纹样，禅意留白',
    images: [INNO_REAL_IMAGES.begoniaIncense],
    tags: ['禅意留白', '香器'],
    priceMin: 128,
    priceMax: 328,
    basePrice: 128,
    royaltyRate: 0.2,
    likes: 0,
    favorites: 0,
    sales: 0,
    dimensions: '80×80×60 mm',
    material: '高硼硅琉璃',
    craft: '脱蜡铸造',
    createdAt: '2025-01-15 13:18',
    isPublic: true,
    status: 'published',
    auditStatus: 'pending',
    revenue: 0,
  },
  {
    id: 'audit-3',
    title: '几何切割花瓶',
    description: '多面切割几何造型，现代极简',
    images: [INNO_REAL_IMAGES.blueTuoyuan],
    tags: ['几何抽象', '花器'],
    priceMin: 199,
    priceMax: 499,
    basePrice: 199,
    royaltyRate: 0.1,
    likes: 0,
    favorites: 0,
    sales: 0,
    dimensions: '120×120×250 mm',
    material: '高硼硅琉璃',
    craft: '吹制',
    createdAt: '2025-01-15 11:45',
    isPublic: true,
    status: 'published',
    auditStatus: 'pending',
    revenue: 0,
  },
  {
    id: 'audit-4',
    title: '琥珀首饰盒',
    description: '琥珀色磨砂通透，温润如玉',
    images: [INNO_REAL_IMAGES.amberWeijiao],
    tags: ['复古轻奢', '首饰盒'],
    priceMin: 358,
    priceMax: 688,
    basePrice: 358,
    royaltyRate: 0.15,
    likes: 0,
    favorites: 0,
    sales: 0,
    dimensions: '100×80×40 mm',
    material: '高硼硅琉璃',
    craft: '脱蜡铸造',
    createdAt: '2025-01-15 10:22',
    isPublic: true,
    status: 'published',
    auditStatus: 'pending',
    revenue: 0,
  },
  {
    id: 'audit-5',
    title: '翠竹茶则',
    description: '竹叶浮雕，文人意趣',
    images: [INNO_REAL_IMAGES.greenChang],
    tags: ['东方美学', '茶具'],
    priceMin: 98,
    priceMax: 258,
    basePrice: 98,
    royaltyRate: 0.15,
    likes: 0,
    favorites: 0,
    sales: 0,
    dimensions: '150×30×8 mm',
    material: '高硼硅琉璃',
    craft: '脱蜡铸造',
    createdAt: '2025-01-15 09:10',
    isPublic: true,
    status: 'published',
    auditStatus: 'pending',
    revenue: 0,
  },
  {
    id: 'audit-6',
    title: '海棠形花器',
    description: '海棠轮廓曲线，大理石纹理',
    images: [INNO_REAL_IMAGES.celadonBagua],
    tags: ['自然意象', '花器'],
    priceMin: 268,
    priceMax: 568,
    basePrice: 268,
    royaltyRate: 0.15,
    likes: 0,
    favorites: 0,
    sales: 0,
    dimensions: '180×120×100 mm',
    material: '高硼硅琉璃',
    craft: '脱蜡铸造',
    createdAt: '2025-01-14 22:30',
    isPublic: true,
    status: 'published',
    auditStatus: 'pending',
    revenue: 0,
  },
];

// 预置用户
const MOCK_USERS: IUser[] = [
  { id: 'u1', phone: '138****8000', nickname: '琉衍体验官', avatar: avatarImages.avatarImg1, role: 'creator', points: 1250, token: '', expireAt: 0, createdAt: '2024-10-15' },
  { id: 'u2', phone: '139****1234', nickname: '青山设计', avatar: avatarImages.avatarImg2, role: 'creator', points: 860, token: '', expireAt: 0, createdAt: '2024-11-02' },
  { id: 'u3', phone: '137****5678', nickname: '琉璃收藏家', avatar: avatarImages.avatarImg3, role: 'user', points: 320, token: '', expireAt: 0, createdAt: '2024-11-20' },
  { id: 'u4', phone: '136****9012', nickname: '莫小七', avatar: avatarImages.avatarImg4, role: 'creator', points: 2100, token: '', expireAt: 0, createdAt: '2024-12-01' },
  { id: 'u5', phone: '135****3456', nickname: '禅意生活', avatar: avatarImages.avatarImg5, role: 'user', points: 150, token: '', expireAt: 0, createdAt: '2024-12-10' },
  { id: 'u6', phone: '134****7890', nickname: '几何研究所', avatar: avatarImages.avatarImg6, role: 'creator', points: 580, token: '', expireAt: 0, createdAt: '2024-12-18' },
  { id: 'u7', phone: '133****2345', nickname: '东方美学馆', avatar: avatarImages.avatarImg7, role: 'user', points: 2000, token: '', expireAt: 0, createdAt: '2025-01-03' },
  { id: 'u8', phone: '132****6789', nickname: '云栖茶舍', avatar: avatarImages.avatarImg8, role: 'user', points: 430, token: '', expireAt: 0, createdAt: '2025-01-08' },
  { id: 'u9', phone: '131****0123', nickname: '雅集文房', avatar: avatarImages.avatarImg9, role: 'creator', points: 1750, token: '', expireAt: 0, createdAt: '2025-01-12' },
  { id: 'u10', phone: '130****4567', nickname: '青竹书院', avatar: avatarImages.avatarImg10, role: 'user', points: 80, token: '', expireAt: 0, createdAt: '2025-01-14' },
];

export default function AdminPage() {
  const navigate = useNavigate();
  const { state: authState, logout, updateUser } = useAuth();
  const user = authState.user;
  const auth = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('audit');
  const [auditWorks, setAuditWorks] = useState<ISquareWork[]>([]);
  const [auditFilter, setAuditFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [auditSearch, setAuditSearch] = useState('');
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectWorkId, setRejectWorkId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('内容违规');
  const [userList, setUserList] = useState<IUser[]>([]);
  const [orderList, setOrderList] = useState<IOrderDetail[]>([]);
  const [orderFilter, setOrderFilter] = useState('all');

  // 加载审核数据
  useEffect(() => {
    // 合并预置待审核作品 + 已审核的真实作品
    const existing = getAllSquareWorks();
    const pendingWithCreators: ISquareWork[] = PENDING_WORKS.map((w, i) => ({
      ...w,
      creator: MOCK_CREATORS[i % MOCK_CREATORS.length],
    }));
    const all = [...pendingWithCreators, ...existing.filter((w) => w.auditStatus !== 'pending' || !PENDING_WORKS.find((p) => p.id === w.id))];
    setAuditWorks(all);
  }, []);

  // 加载用户（优先从localStorage，无则用预置）
  useEffect(() => {
    const storedUsers = getAllUsers();
    if (storedUsers.length > 0) {
      setUserList(storedUsers);
    } else {
      setUserList(MOCK_USERS);
    }
  }, []);

  // 加载订单
  useEffect(() => {
    const orders = getOrders() as IOrderDetail[];
    setOrderList(orders.slice(0, 20));
  }, []);

  // 演示模式：首次访问后台时自动将当前用户升级为 admin，便于体验
  useEffect(() => {
    if (user && user.role !== 'admin') {
      // 检查是否已有admin用户
      const all = getAllUsers();
      const hasAdmin = all.some((u) => u.role === 'admin');
      if (!hasAdmin) {
        // 自动升级当前用户为 admin
        updateUserRole(user.id, 'admin');
        auth.updateUser({ role: 'admin' });
        toast.success('演示模式：已自动升级为管理员');
      }
    }
  }, [user?.id]);

  // 如果不是 admin，给出提示（实际应路由守卫，但这里用UI展示）
  const isAdmin = user?.role === 'admin';

  const handleApprove = (workId: string) => {
    approveWork(workId);
    setAuditWorks((prev) =>
      prev.map((w) =>
        w.id === workId
          ? { ...w, auditStatus: 'approved' as const, auditedAt: new Date().toISOString().slice(0, 16).replace('T', ' ') }
          : w
      )
    );
    toast.success('已通过审核');
  };

  const handleReject = (workId: string) => {
    setRejectWorkId(workId);
    setRejectReason('内容违规');
    setRejectDialogOpen(true);
  };

  const confirmReject = () => {
    if (!rejectWorkId) return;
    rejectWork(rejectWorkId, rejectReason);
    setAuditWorks((prev) =>
      prev.map((w) =>
        w.id === rejectWorkId
          ? { ...w, auditStatus: 'rejected' as const, auditReason: rejectReason, auditedAt: new Date().toISOString().slice(0, 16).replace('T', ' ') }
          : w
      )
    );
    setRejectDialogOpen(false);
    setRejectWorkId(null);
    toast.success('已拒绝');
  };

  // 审核筛选
  const filteredAuditWorks = useMemo(() => {
    let list = auditWorks;
    if (auditFilter !== 'all') {
      list = list.filter((w) => w.auditStatus === auditFilter);
    }
    if (auditSearch.trim()) {
      const q = auditSearch.trim().toLowerCase();
      list = list.filter(
        (w) =>
          w.title.toLowerCase().includes(q) ||
          w.creator.name.toLowerCase().includes(q)
      );
    }
    // 待审核的按时间倒序排在前
    return [...list].sort((a, b) => {
      if (a.auditStatus === 'pending' && b.auditStatus !== 'pending') return -1;
      if (a.auditStatus !== 'pending' && b.auditStatus === 'pending') return 1;
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [auditWorks, auditFilter, auditSearch]);

  // 统计数据
  const auditStats = useMemo(() => {
    const today = auditWorks; // 简化：全部当作今日演示
    return {
      pending: today.filter((w) => w.auditStatus === 'pending').length,
      approved: today.filter((w) => w.auditStatus === 'approved').length,
      rejected: today.filter((w) => w.auditStatus === 'rejected').length,
      total: today.length,
    };
  }, [auditWorks]);

  // 订单筛选
  const filteredOrders = useMemo(() => {
    if (orderFilter === 'all') return orderList;
    return orderList.filter((o) => o.status === orderFilter);
  }, [orderList, orderFilter]);

  // 启用/禁用用户（角色切换）
  const handleToggleUserRole = (userId: string) => {
    const user = userList.find((u) => u.id === userId);
    if (!user) return;
    const newRole: IUser['role'] = user.role === 'user' ? 'creator' : 'user';
    // 持久化
    updateUserRole(userId, newRole);
    setUserList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    toast.success(`已${newRole === 'creator' ? '升级为创作者' : '降为普通用户'}`);
  };

  // 发货（同步到localStorage）
  const handleShip = (orderId: string) => {
    const trackingNo = genTrackingNo();
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
    // 持久化更新
    updateOrder(orderId, {
      status: 'shipped',
      trackingNo,
      trackingCompany: '顺丰速运',
      shippedAt: now,
    });
    setOrderList((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status: 'shipped' as const, trackingNo, trackingCompany: '顺丰速运', shippedAt: now }
          : o
      )
    );
    toast.success(`已发货，物流单号：${trackingNo}`);
  };

  // 退出管理后台（切换回普通角色）
  const handleExitAdmin = () => {
    if (user) {
      updateUser({ role: 'creator' });
      navigate('/');
      toast.success('已切换回创作者视角');
    }
  };

  const getAuditBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="outline" className="text-[11px] border-[#4A7C59]/40 text-[#4A7C59] bg-[#4A7C59]/5">已通过</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-[11px] border-[#C49A3A]/40 text-[#C49A3A] bg-[#C49A3A]/5">待审核</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-[11px] border-[#B5483E]/40 text-[#B5483E] bg-[#B5483E]/5">已拒绝</Badge>;
      default:
        return null;
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center p-6">
        <Card className="max-w-md w-full bg-white border-border shadow-lg">
          <CardContent className="p-8 text-center space-y-4">
            <div className="size-16 mx-auto rounded-full bg-[#B5483E]/10 flex items-center justify-center">
              <Ban className="size-8 text-[#B5483E]" />
            </div>
            <h2 className="text-xl font-bold text-foreground font-['Noto_Serif_SC'] tracking-wider">
              无访问权限
            </h2>
            <p className="text-sm text-muted-foreground">
              管理后台仅对管理员角色开放
            </p>
            <Button
              onClick={() => navigate('/')}
              className="w-full"
              style={{ background: '#2C3E3A' }}
            >
              返回首页
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex">
      {/* 侧边栏 */}
      <aside className="w-60 shrink-0 bg-[#2C3E3A] text-[#F5F0E8] flex flex-col">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-gradient-to-br from-[#C4A96B] to-[#A68B4B] flex items-center justify-center text-[#2C3E3A] font-bold text-sm">
              琉
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-sm font-['Noto_Serif_SC'] tracking-wider">管理后台</div>
              <div className="text-[10px] text-white/50">InnoLumina Admin</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 text-left',
                  isActive
                    ? 'bg-[#C4A96B]/20 text-[#F5F0E8] font-medium'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.key === 'audit' && auditStats.pending > 0 && (
                  <span className="size-5 rounded-full bg-[#C49A3A] text-white text-[10px] flex items-center justify-center font-medium">
                    {auditStats.pending}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2">
            <Avatar className="size-8 border border-white/20">
              <Image src={user?.avatar} alt={user?.nickname} className="w-full h-full object-cover" />
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium truncate">{user?.nickname}</div>
              <div className="text-[10px] text-white/50">管理员</div>
            </div>
          </div>
          <button
            onClick={handleExitAdmin}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-white/60 hover:text-white hover:bg-white/5 transition-all"
          >
            <LogOut className="size-3.5" />
            退出管理后台
          </button>
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 min-w-0 overflow-x-hidden">
        <ScrollArea className="h-screen">
          <div className="p-6 lg:p-8">
            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div>
                    <h1 className="text-2xl font-bold text-foreground font-['Noto_Serif_SC'] tracking-wider mb-1">
                      数据概览
                    </h1>
                    <p className="text-sm text-muted-foreground">平台核心运营数据一览</p>
                  </div>

                  {/* 核心指标卡片 */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: '注册用户数', value: '1,286', icon: Users, color: '#2C3E3A', trend: '+12' },
                      { label: '今日活跃', value: '186', icon: UserCheck, color: '#4A7C59', trend: '+8%' },
                      { label: '累计订单', value: '342', icon: ShoppingCart, color: '#5B8AB8', trend: '+23' },
                      { label: '今日营收', value: '¥8,640', icon: Wallet, color: '#C4A96B', trend: '+15%' },
                    ].map((stat) => {
                      const Icon = stat.icon;
                      return (
                        <Card key={stat.label} className="bg-white border-border shadow-sm overflow-hidden">
                          <CardContent className="p-5">
                            <div className="flex items-start justify-between mb-3">
                              <div
                                className="size-10 rounded-lg flex items-center justify-center"
                                style={{ background: `${stat.color}15`, color: stat.color }}
                              >
                                <Icon className="size-5" />
                              </div>
                              <Badge variant="outline" className="text-[10px] border-success/30 text-success">
                                {stat.trend}
                              </Badge>
                            </div>
                            <p className="text-2xl font-bold text-foreground tabular-nums tracking-tight">
                              {stat.value}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  {/* 最近7天订单柱状图 */}
                  <Card className="bg-white border-border shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-['Noto_Serif_SC'] tracking-wider font-semibold">
                        最近 7 天订单趋势
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-end justify-between gap-2 h-48 pt-4">
                        {[
                          { day: '01-09', value: 28 },
                          { day: '01-10', value: 42 },
                          { day: '01-11', value: 35 },
                          { day: '01-12', value: 58 },
                          { day: '01-13', value: 46 },
                          { day: '01-14', value: 62 },
                          { day: '01-15', value: 71 },
                        ].map((d, i) => {
                          const max = 71;
                          const height = (d.value / max) * 100;
                          return (
                            <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                              <div className="w-full flex flex-col items-center justify-end flex-1">
                                <span className="text-[10px] text-muted-foreground mb-1">{d.value}</span>
                                <div
                                  className="w-full rounded-t-md transition-all duration-300"
                                  style={{
                                    height: `${height}%`,
                                    minHeight: '4px',
                                    background: i === 6
                                      ? 'linear-gradient(180deg, #C4A96B, #A68B4B)'
                                      : 'linear-gradient(180deg, #2C3E3A, #4A655C)',
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

                  {/* 最近订单 */}
                  <Card className="bg-white border-border shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-['Noto_Serif_SC'] tracking-wider font-semibold">
                        最近订单
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="w-full overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-muted/30">
                            <tr>
                              <th className="text-xs text-muted-foreground font-medium text-left px-5 py-3 whitespace-nowrap">订单号</th>
                              <th className="text-xs text-muted-foreground font-medium text-left px-5 py-3 whitespace-nowrap">用户</th>
                              <th className="text-xs text-muted-foreground font-medium text-left px-5 py-3 whitespace-nowrap">商品</th>
                              <th className="text-xs text-muted-foreground font-medium text-right px-5 py-3 whitespace-nowrap">金额</th>
                              <th className="text-xs text-muted-foreground font-medium text-left px-5 py-3 whitespace-nowrap">状态</th>
                              <th className="text-xs text-muted-foreground font-medium text-left px-5 py-3 whitespace-nowrap">下单时间</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {orderList.slice(0, 5).map((order) => (
                              <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                                <td className="px-5 py-3 font-mono text-xs text-foreground">{order.orderNo}</td>
                                <td className="px-5 py-3 text-foreground">{order.receiver?.name || '匿名用户'}</td>
                                <td className="px-5 py-3 text-foreground">{order.productName || order.productType || '琉璃定制'}</td>
                                <td className="px-5 py-3 text-right font-medium tabular-nums text-foreground">¥{order.price?.toFixed(2) || '0.00'}</td>
                                <td className="px-5 py-3">
                                  <Badge variant="outline" className="text-[10px]">{order.status}</Badge>
                                </td>
                                <td className="px-5 py-3 text-xs text-muted-foreground whitespace-nowrap">{order.createdAt}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {activeTab === 'audit' && (
                <motion.div
                  key="audit"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div>
                    <h1 className="text-2xl font-bold text-foreground font-['Noto_Serif_SC'] tracking-wider mb-1">
                      内容审核
                    </h1>
                    <p className="text-sm text-muted-foreground">审核用户提交的广场作品</p>
                  </div>

                  {/* 统计卡片 */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-white border-border shadow-sm">
                      <CardContent className="p-5">
                        <p className="text-xs text-muted-foreground mb-1">今日待审核</p>
                        <p className="text-3xl font-bold text-[#C49A3A] tabular-nums tracking-tight">
                          {auditStats.pending}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">件作品</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-white border-border shadow-sm">
                      <CardContent className="p-5">
                        <p className="text-xs text-muted-foreground mb-1">今日已通过</p>
                        <p className="text-3xl font-bold text-[#4A7C59] tabular-nums tracking-tight">
                          {auditStats.approved}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">件作品</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-white border-border shadow-sm">
                      <CardContent className="p-5">
                        <p className="text-xs text-muted-foreground mb-1">今日已拒绝</p>
                        <p className="text-3xl font-bold text-[#B5483E] tabular-nums tracking-tight">
                          {auditStats.rejected}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">件作品</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-white border-border shadow-sm">
                      <CardContent className="p-5">
                        <p className="text-xs text-muted-foreground mb-1">累计审核</p>
                        <p className="text-3xl font-bold text-[#2C3E3A] tabular-nums tracking-tight">
                          {auditStats.total}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">件作品</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* 筛选 + 搜索 */}
                  <Card className="bg-white border-border shadow-sm">
                    <CardContent className="p-4 flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
                      <div className="flex items-center gap-1 flex-wrap">
                        {[
                          { value: 'all', label: '全部' },
                          { value: 'pending', label: '待审核' },
                          { value: 'approved', label: '已通过' },
                          { value: 'rejected', label: '已拒绝' },
                        ].map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => setAuditFilter(opt.value as typeof auditFilter)}
                            className={cn(
                              'px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200',
                              auditFilter === opt.value
                                ? 'bg-[#2C3E3A] text-white'
                                : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                            )}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                      <div className="relative w-full md:w-64">
                        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="search"
                          value={auditSearch}
                          onChange={(e) => setAuditSearch(e.target.value)}
                          placeholder="搜索作品或创作者"
                          className="bg-white pl-9 h-9"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* 审核表格 */}
                  <Card className="bg-white border-border shadow-sm">
                    <CardContent className="p-0">
                      <div className="w-full overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-muted/30">
                            <tr>
                              <th className="text-xs text-muted-foreground font-medium text-left px-5 py-3 whitespace-nowrap">作品</th>
                              <th className="text-xs text-muted-foreground font-medium text-left px-5 py-3 whitespace-nowrap">标题</th>
                              <th className="text-xs text-muted-foreground font-medium text-left px-5 py-3 whitespace-nowrap">创作者</th>
                              <th className="text-xs text-muted-foreground font-medium text-left px-5 py-3 whitespace-nowrap">提交时间</th>
                              <th className="text-xs text-muted-foreground font-medium text-left px-5 py-3 whitespace-nowrap">状态</th>
                              <th className="text-xs text-muted-foreground font-medium text-right px-5 py-3 whitespace-nowrap">操作</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {filteredAuditWorks.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground text-sm">
                                  暂无符合条件的作品
                                </td>
                              </tr>
                            ) : (
                              filteredAuditWorks.map((work) => (
                                <tr key={work.id} className="hover:bg-muted/20 transition-colors">
                                  <td className="px-5 py-3">
                                    <div className="size-12 rounded-md overflow-hidden border border-border">
                                      <Image src={work.images[0]} alt={work.title} className="w-full h-full object-cover" />
                                    </div>
                                  </td>
                                  <td className="px-5 py-3">
                                    <p className="font-medium text-foreground truncate max-w-[200px]">{work.title}</p>
                                  </td>
                                  <td className="px-5 py-3">
                                    <div className="flex items-center gap-2">
                                      <Avatar className="size-6">
                                        <Image src={work.creator.avatar} alt={work.creator.name} className="w-full h-full object-cover" />
                                      </Avatar>
                                      <span className="text-foreground text-sm">{work.creator.name}</span>
                                    </div>
                                  </td>
                                  <td className="px-5 py-3 text-xs text-muted-foreground whitespace-nowrap">{work.createdAt}</td>
                                  <td className="px-5 py-3">{getAuditBadge(work.auditStatus)}</td>
                                  <td className="px-5 py-3 text-right">
                                    <div className="flex items-center gap-2 justify-end">
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="size-7 rounded-md"
                                        title="查看详情"
                                      >
                                        <Eye className="size-3.5" />
                                      </Button>
                                      {work.auditStatus === 'pending' ? (
                                        <>
                                          <Button
                                            size="sm"
                                            className="h-7 text-xs rounded-md gap-1 bg-[#4A7C59] hover:bg-[#3A6349] text-white"
                                            onClick={() => handleApprove(work.id)}
                                          >
                                            <Check className="size-3" />
                                            通过
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="destructive"
                                            className="h-7 text-xs rounded-md gap-1"
                                            onClick={() => handleReject(work.id)}
                                          >
                                            <X className="size-3" />
                                            拒绝
                                          </Button>
                                        </>
                                      ) : (
                                        <span className="text-xs text-muted-foreground">
                                          {work.auditedAt}
                                        </span>
                                      )}
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
                </motion.div>
              )}

              {activeTab === 'users' && (
                <motion.div
                  key="users"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div>
                    <h1 className="text-2xl font-bold text-foreground font-['Noto_Serif_SC'] tracking-wider mb-1">
                      用户管理
                    </h1>
                    <p className="text-sm text-muted-foreground">管理平台注册用户与角色权限</p>
                  </div>

                  <Card className="bg-white border-border shadow-sm">
                    <CardContent className="p-0">
                      <div className="w-full overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-muted/30">
                            <tr>
                              <th className="text-xs text-muted-foreground font-medium text-left px-5 py-3 whitespace-nowrap">用户</th>
                              <th className="text-xs text-muted-foreground font-medium text-left px-5 py-3 whitespace-nowrap">昵称</th>
                              <th className="text-xs text-muted-foreground font-medium text-left px-5 py-3 whitespace-nowrap">手机号</th>
                              <th className="text-xs text-muted-foreground font-medium text-left px-5 py-3 whitespace-nowrap">角色</th>
                              <th className="text-xs text-muted-foreground font-medium text-left px-5 py-3 whitespace-nowrap">注册时间</th>
                              <th className="text-xs text-muted-foreground font-medium text-right px-5 py-3 whitespace-nowrap">积分</th>
                              <th className="text-xs text-muted-foreground font-medium text-right px-5 py-3 whitespace-nowrap">操作</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {userList.map((u) => (
                              <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                                <td className="px-5 py-3">
                                  <Avatar className="size-8">
                                    <Image src={u.avatar} alt={u.nickname} className="w-full h-full object-cover" />
                                  </Avatar>
                                </td>
                                <td className="px-5 py-3 font-medium text-foreground">{u.nickname}</td>
                                <td className="px-5 py-3 text-foreground tabular-nums">{u.phone}</td>
                                <td className="px-5 py-3">
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      'text-[10px]',
                                      u.role === 'admin' && 'border-[#B5483E]/40 text-[#B5483E] bg-[#B5483E]/5',
                                      u.role === 'creator' && 'border-[#4A7C59]/40 text-[#4A7C59] bg-[#4A7C59]/5',
                                      u.role === 'user' && 'border-muted-foreground/40 text-muted-foreground',
                                    )}
                                  >
                                    {u.role === 'admin' ? '管理员' : u.role === 'creator' ? '创作者' : '普通用户'}
                                  </Badge>
                                </td>
                                <td className="px-5 py-3 text-xs text-muted-foreground whitespace-nowrap">{u.createdAt}</td>
                                <td className="px-5 py-3 text-right font-medium tabular-nums text-foreground">{u.points}</td>
                                <td className="px-5 py-3 text-right">
                                  <div className="flex items-center gap-2 justify-end">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 text-xs rounded-md"
                                      onClick={() => handleToggleUserRole(u.id)}
                                    >
                                      {u.role === 'user' ? '升为创作者' : '降为用户'}
                                    </Button>
                                  </div>
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

              {activeTab === 'orders' && (
                <motion.div
                  key="orders"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div>
                    <h1 className="text-2xl font-bold text-foreground font-['Noto_Serif_SC'] tracking-wider mb-1">
                      订单管理
                    </h1>
                    <p className="text-sm text-muted-foreground">管理平台所有订单与发货</p>
                  </div>

                  {/* 状态筛选 */}
                  <Card className="bg-white border-border shadow-sm">
                    <CardContent className="p-4 flex items-center gap-1 flex-wrap">
                      {[
                        { value: 'all', label: '全部订单' },
                        { value: 'pending', label: '待支付' },
                        { value: 'confirmed', label: '已确认' },
                        { value: 'reviewing', label: '审核中' },
                        { value: 'producing', label: '生产中' },
                        { value: 'shipped', label: '已发货' },
                        { value: 'completed', label: '已完成' },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setOrderFilter(opt.value)}
                          className={cn(
                            'px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200',
                            orderFilter === opt.value
                              ? 'bg-[#2C3E3A] text-white'
                              : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="bg-white border-border shadow-sm">
                    <CardContent className="p-0">
                      <div className="w-full overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-muted/30">
                            <tr>
                              <th className="text-xs text-muted-foreground font-medium text-left px-5 py-3 whitespace-nowrap">订单号</th>
                              <th className="text-xs text-muted-foreground font-medium text-left px-5 py-3 whitespace-nowrap">用户</th>
                              <th className="text-xs text-muted-foreground font-medium text-left px-5 py-3 whitespace-nowrap">商品</th>
                              <th className="text-xs text-muted-foreground font-medium text-right px-5 py-3 whitespace-nowrap">金额</th>
                              <th className="text-xs text-muted-foreground font-medium text-left px-5 py-3 whitespace-nowrap">状态</th>
                              <th className="text-xs text-muted-foreground font-medium text-left px-5 py-3 whitespace-nowrap">下单时间</th>
                              <th className="text-xs text-muted-foreground font-medium text-right px-5 py-3 whitespace-nowrap">操作</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {filteredOrders.length === 0 ? (
                              <tr>
                                <td colSpan={7} className="px-5 py-12 text-center text-muted-foreground text-sm">
                                  暂无订单
                                </td>
                              </tr>
                            ) : (
                              filteredOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                                  <td className="px-5 py-3 font-mono text-xs text-foreground whitespace-nowrap">{order.orderNo}</td>
                                  <td className="px-5 py-3 text-foreground">{order.receiver?.name || '匿名'}</td>
                                  <td className="px-5 py-3 text-foreground">{order.productName || order.productType || '琉璃定制'}</td>
                                  <td className="px-5 py-3 text-right font-medium tabular-nums text-foreground">¥{order.price?.toFixed(2) || '0.00'}</td>
                                  <td className="px-5 py-3">
                                    <Badge variant="outline" className="text-[10px]">
                                      {order.status}
                                    </Badge>
                                  </td>
                                  <td className="px-5 py-3 text-xs text-muted-foreground whitespace-nowrap">{order.createdAt}</td>
                                  <td className="px-5 py-3 text-right">
                                    <div className="flex items-center gap-2 justify-end">
                                      <Button size="sm" variant="outline" className="h-7 text-xs rounded-md">
                                        详情
                                      </Button>
                                      {order.status === 'producing' && (
                                        <Button
                                          size="sm"
                                          className="h-7 text-xs rounded-md bg-[#2C3E3A] hover:bg-[#1F2E2A] text-white"
                                          onClick={() => handleShip(order.id)}
                                        >
                                          <Truck className="size-3 mr-1" />
                                          发货
                                        </Button>
                                      )}
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
                </motion.div>
              )}

              {activeTab === 'earnings' && (
                <motion.div
                  key="earnings"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <EarningsSection />
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <SettingsSection />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </main>

      {/* 拒绝原因弹窗 */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="max-w-md bg-white border-border">
          <DialogHeader>
            <DialogTitle className="font-['Noto_Serif_SC'] tracking-wider font-semibold">
              拒绝作品
            </DialogTitle>
            <DialogDescription className="text-xs">
              请选择或填写拒绝原因，创作者将收到此通知
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground font-medium">拒绝原因</Label>
              <Select value={rejectReason} onValueChange={setRejectReason}>
                <SelectTrigger className="h-9 bg-white border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-border">
                  <SelectItem value="内容违规">内容违规</SelectItem>
                  <SelectItem value="质量不达标">质量不达标</SelectItem>
                  <SelectItem value="侵权嫌疑">侵权嫌疑</SelectItem>
                  <SelectItem value="其他">其他</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground font-medium">补充说明（可选）</Label>
              <Textarea
                placeholder="请输入具体说明..."
                className="min-h-[80px] resize-none bg-white border-border text-sm"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)} className="rounded-lg">
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={confirmReject}
              className="rounded-lg"
            >
              确认拒绝
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

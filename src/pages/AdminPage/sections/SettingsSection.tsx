import { useState } from 'react';
import {
  Settings,
  Globe,
  Coins,
  CreditCard,
  Percent,
  ShieldCheck,
  Bell,
  Plus,
  Edit2,
  Trash2,
  Power,
  Save,
  X,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
import { cn } from '@/lib/utils';

type SettingsTab = 'basic' | 'credit' | 'recharge' | 'royalty' | 'audit' | 'announcement';

const SUB_NAV: { key: SettingsTab; label: string; icon: typeof Globe }[] = [
  { key: 'basic', label: '平台基础设置', icon: Globe },
  { key: 'credit', label: '积分与价格', icon: Coins },
  { key: 'recharge', label: '充值套餐管理', icon: CreditCard },
  { key: 'royalty', label: '创作者分成', icon: Percent },
  { key: 'audit', label: '内容审核设置', icon: ShieldCheck },
  { key: 'announcement', label: '公告管理', icon: Bell },
];

// 充值套餐
interface RechargePackage {
  id: string;
  name: string;
  points: number;
  bonusPoints: number;
  price: number;
  status: 'active' | 'inactive';
  recommended?: boolean;
}

const INITIAL_PACKAGES: RechargePackage[] = [
  { id: 'pkg-1', name: '体验档', points: 100, bonusPoints: 0, price: 10, status: 'active' },
  { id: 'pkg-2', name: '入门档', points: 500, bonusPoints: 50, price: 45, status: 'active' },
  { id: 'pkg-3', name: '热门档', points: 1000, bonusPoints: 150, price: 80, status: 'active', recommended: true },
  { id: 'pkg-4', name: '进阶档', points: 3000, bonusPoints: 600, price: 220, status: 'active' },
  { id: 'pkg-5', name: '企业档', points: 10000, bonusPoints: 3000, price: 680, status: 'active' },
];

// 公告
interface Announcement {
  id: string;
  title: string;
  content: string;
  status: 'published' | 'draft';
  createdAt: string;
}

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  { id: 'ann-1', title: '平台上线公告', content: 'InnoLumina琉衍工坊正式上线，欢迎体验！', status: 'published', createdAt: '2026-09-01' },
  { id: 'ann-2', title: '双节活动预告', content: '中秋国庆双节活动即将开启，敬请期待', status: 'draft', createdAt: '2026-09-15' },
  { id: 'ann-3', title: '创作者招募', content: '优质创作者招募中，享20%分成', status: 'published', createdAt: '2026-09-10' },
];

// 操作日志
const OPERATION_LOGS = [
  { time: '2026-09-17 14:30', operator: 'admin', action: '通过作品"四时物候·竹叶八角匣"', ip: '192.168.1.101' },
  { time: '2026-09-17 11:20', operator: 'admin', action: '修改充值套餐"热门档"价格', ip: '192.168.1.101' },
  { time: '2026-09-16 16:45', operator: 'admin', action: '发货订单 IL20260916001234', ip: '192.168.1.101' },
  { time: '2026-09-16 10:00', operator: 'admin', action: '发布公告"双节活动预告"', ip: '192.168.1.101' },
  { time: '2026-09-15 09:30', operator: 'admin', action: '禁用用户 test_user_02', ip: '192.168.1.101' },
];

export default function SettingsSection() {
  const [activeSub, setActiveSub] = useState<SettingsTab>('basic');

  // 平台基础设置
  const [basicSettings, setBasicSettings] = useState({
    siteName: 'InnoLumina｜琉衍工坊',
    serviceEmail: 'willamhe0116@163.com',
    servicePhone: '15501013868',
    companyAddress: '上海市徐汇区古宜路 30 号',
    icp: '沪ICP备XXXXXXXX号',
  });

  // 积分与价格设置
  const [creditSettings, setCreditSettings] = useState({
    textToImage: 20,
    imageToImage: 30,
    to3d: 50,
    registerBonus: 50,
    creditValidMonths: 12,
    glassBasePrice: 299,
    printBasePrice: 49,
    stlDownloadPrice: 29,
  });

  // 充值套餐
  const [packages, setPackages] = useState<RechargePackage[]>(INITIAL_PACKAGES);
  const [pkgDialogOpen, setPkgDialogOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<RechargePackage | null>(null);
  const [pkgForm, setPkgForm] = useState({ name: '', points: 0, bonusPoints: 0, price: 0, recommended: false });

  // 创作者分成
  const [royaltySettings, setRoyaltySettings] = useState({
    baseRate: 10,
    premiumRate: 15,
    signedRate: 20,
    settleDays: 7,
    minWithdraw: 100,
    withdrawFee: 0,
  });

  // 内容审核设置
  const [auditSettings, setAuditSettings] = useState({
    autoAudit: true,
    needHumanAfterAuto: false,
    publishAudit: true,
    sensitiveFilter: true,
    imageAuditApi: 'aliyun' as 'aliyun' | 'tencent' | 'off',
  });

  // 公告管理
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [annDialogOpen, setAnnDialogOpen] = useState(false);
  const [editingAnn, setEditingAnn] = useState<Announcement | null>(null);
  const [annForm, setAnnForm] = useState({ title: '', content: '' });

  const handleSaveBasic = () => {
    toast.success('平台基础设置已保存');
  };

  const handleSaveCredit = () => {
    toast.success('积分与价格设置已保存');
  };

  const handleSaveRoyalty = () => {
    toast.success('创作者分成设置已保存');
  };

  const handleSaveAudit = () => {
    toast.success('内容审核设置已保存');
  };

  // 套餐操作
  const openAddPkg = () => {
    setEditingPkg(null);
    setPkgForm({ name: '', points: 0, bonusPoints: 0, price: 0, recommended: false });
    setPkgDialogOpen(true);
  };

  const openEditPkg = (pkg: RechargePackage) => {
    setEditingPkg(pkg);
    setPkgForm({
      name: pkg.name,
      points: pkg.points,
      bonusPoints: pkg.bonusPoints,
      price: pkg.price,
      recommended: pkg.recommended || false,
    });
    setPkgDialogOpen(true);
  };

  const savePackage = () => {
    if (!pkgForm.name || pkgForm.points <= 0 || pkgForm.price <= 0) {
      toast.error('请填写完整套餐信息');
      return;
    }
    if (editingPkg) {
      setPackages((prev) =>
        prev.map((p) =>
          p.id === editingPkg.id
            ? { ...p, ...pkgForm }
            : p
        )
      );
      toast.success('套餐已更新');
    } else {
      const newPkg: RechargePackage = {
        id: `pkg-${Date.now()}`,
        ...pkgForm,
        status: 'active',
      };
      setPackages((prev) => [...prev, newPkg]);
      toast.success('套餐已新增');
    }
    setPkgDialogOpen(false);
  };

  const togglePackageStatus = (id: string) => {
    setPackages((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' }
          : p
      )
    );
    toast.success('套餐状态已更新');
  };

  const deletePackage = (id: string) => {
    setPackages((prev) => prev.filter((p) => p.id !== id));
    toast.success('套餐已删除');
  };

  // 公告操作
  const openAddAnn = () => {
    setEditingAnn(null);
    setAnnForm({ title: '', content: '' });
    setAnnDialogOpen(true);
  };

  const openEditAnn = (ann: Announcement) => {
    setEditingAnn(ann);
    setAnnForm({ title: ann.title, content: ann.content });
    setAnnDialogOpen(true);
  };

  const saveAnnouncement = (publish: boolean) => {
    if (!annForm.title || !annForm.content) {
      toast.error('请填写标题和内容');
      return;
    }
    if (editingAnn) {
      setAnnouncements((prev) =>
        prev.map((a) =>
          a.id === editingAnn.id
            ? { ...a, title: annForm.title, content: annForm.content, status: publish ? 'published' : 'draft' }
            : a
        )
      );
      toast.success(publish ? '公告已发布' : '已保存为草稿');
    } else {
      const newAnn: Announcement = {
        id: `ann-${Date.now()}`,
        title: annForm.title,
        content: annForm.content,
        status: publish ? 'published' : 'draft',
        createdAt: new Date().toISOString().slice(0, 10),
      };
      setAnnouncements((prev) => [newAnn, ...prev]);
      toast.success(publish ? '公告已发布' : '已保存为草稿');
    }
    setAnnDialogOpen(false);
  };

  const toggleAnnouncementStatus = (id: string) => {
    setAnnouncements((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status: a.status === 'published' ? 'draft' : 'published' }
          : a
      )
    );
    toast.success('公告状态已更新');
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    toast.success('公告已删除');
  };

  return (
    <motion.div
      key="settings"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-foreground font-['Noto_Serif_SC'] tracking-wider mb-1">
          系统设置
        </h1>
        <p className="text-sm text-muted-foreground">平台参数配置与管理</p>
      </div>

      <div className="flex gap-6">
        {/* 左侧子导航 */}
        <aside className="w-52 shrink-0 hidden md:block">
          <Card className="bg-white border-border shadow-sm sticky top-4">
            <CardContent className="p-2">
              <nav className="space-y-1">
                {SUB_NAV.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSub === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => setActiveSub(item.key)}
                      className={cn(
                        'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 text-left',
                        isActive
                          ? 'bg-[#2C3E3A]/10 text-[#2C3E3A] font-medium'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                      )}
                    >
                      <Icon className="size-4 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </aside>

        {/* 右侧内容区 */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* 平台基础设置 */}
          {activeSub === 'basic' && (
            <Card className="bg-white border-border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-['Noto_Serif_SC'] tracking-wider font-semibold">
                  平台基础设置
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground font-medium">网站名称</Label>
                  <Input
                    value={basicSettings.siteName}
                    onChange={(e) => setBasicSettings({ ...basicSettings, siteName: e.target.value })}
                    className="h-10 bg-white border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground font-medium">网站 Logo</Label>
                  <div className="flex items-center gap-4">
                    <div className="size-16 rounded-lg bg-gradient-to-br from-[#C4A96B] to-[#A68B4B] flex items-center justify-center text-white font-bold text-xl font-['Noto_Serif_SC']">
                      琉
                    </div>
                    <Button variant="outline" size="sm" className="h-8 rounded-md text-xs">
                      上传 Logo
                    </Button>
                    <span className="text-xs text-muted-foreground">建议尺寸 200×200px，支持 PNG/JPG</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground font-medium">客服邮箱</Label>
                    <Input
                      value={basicSettings.serviceEmail}
                      onChange={(e) => setBasicSettings({ ...basicSettings, serviceEmail: e.target.value })}
                      className="h-10 bg-white border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground font-medium">客服电话</Label>
                    <Input
                      value={basicSettings.servicePhone}
                      onChange={(e) => setBasicSettings({ ...basicSettings, servicePhone: e.target.value })}
                      className="h-10 bg-white border-border"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground font-medium">公司地址</Label>
                  <Input
                    value={basicSettings.companyAddress}
                    onChange={(e) => setBasicSettings({ ...basicSettings, companyAddress: e.target.value })}
                    className="h-10 bg-white border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground font-medium">备案号</Label>
                  <Input
                    value={basicSettings.icp}
                    onChange={(e) => setBasicSettings({ ...basicSettings, icp: e.target.value })}
                    className="h-10 bg-white border-border"
                  />
                </div>
                <div className="pt-2">
                  <Button
                    className="rounded-lg"
                    style={{ background: '#2C3E3A' }}
                    onClick={handleSaveBasic}
                  >
                    <Save className="size-4 mr-1.5" />
                    保存设置
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 积分与价格 */}
          {activeSub === 'credit' && (
            <Card className="bg-white border-border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-['Noto_Serif_SC'] tracking-wider font-semibold">
                  积分与价格设置
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground font-medium">文生图消耗积分</Label>
                    <Input
                      type="number"
                      value={creditSettings.textToImage}
                      onChange={(e) => setCreditSettings({ ...creditSettings, textToImage: Number(e.target.value) })}
                      className="h-10 bg-white border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground font-medium">图生图消耗积分</Label>
                    <Input
                      type="number"
                      value={creditSettings.imageToImage}
                      onChange={(e) => setCreditSettings({ ...creditSettings, imageToImage: Number(e.target.value) })}
                      className="h-10 bg-white border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground font-medium">3D建模消耗积分</Label>
                    <Input
                      type="number"
                      value={creditSettings.to3d}
                      onChange={(e) => setCreditSettings({ ...creditSettings, to3d: Number(e.target.value) })}
                      className="h-10 bg-white border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground font-medium">新用户注册赠送积分</Label>
                    <Input
                      type="number"
                      value={creditSettings.registerBonus}
                      onChange={(e) => setCreditSettings({ ...creditSettings, registerBonus: Number(e.target.value) })}
                      className="h-10 bg-white border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground font-medium">积分有效期（月）</Label>
                    <Input
                      type="number"
                      value={creditSettings.creditValidMonths}
                      onChange={(e) => setCreditSettings({ ...creditSettings, creditValidMonths: Number(e.target.value) })}
                      className="h-10 bg-white border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground font-medium">琉璃铸造起价（元）</Label>
                    <Input
                      type="number"
                      value={creditSettings.glassBasePrice}
                      onChange={(e) => setCreditSettings({ ...creditSettings, glassBasePrice: Number(e.target.value) })}
                      className="h-10 bg-white border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground font-medium">3D打印起价（元）</Label>
                    <Input
                      type="number"
                      value={creditSettings.printBasePrice}
                      onChange={(e) => setCreditSettings({ ...creditSettings, printBasePrice: Number(e.target.value) })}
                      className="h-10 bg-white border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground font-medium">STL下载价格（元）</Label>
                    <Input
                      type="number"
                      value={creditSettings.stlDownloadPrice}
                      onChange={(e) => setCreditSettings({ ...creditSettings, stlDownloadPrice: Number(e.target.value) })}
                      className="h-10 bg-white border-border"
                    />
                  </div>
                </div>
                <div className="pt-2">
                  <Button
                    className="rounded-lg"
                    style={{ background: '#2C3E3A' }}
                    onClick={handleSaveCredit}
                  >
                    <Save className="size-4 mr-1.5" />
                    保存设置
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 充值套餐管理 */}
          {activeSub === 'recharge' && (
            <Card className="bg-white border-border shadow-sm">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-['Noto_Serif_SC'] tracking-wider font-semibold">
                  充值套餐管理
                </CardTitle>
                <Button
                  size="sm"
                  className="h-8 rounded-md text-xs"
                  style={{ background: '#2C3E3A' }}
                  onClick={openAddPkg}
                >
                  <Plus className="size-3.5 mr-1" />
                  新增套餐
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="w-full overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/30">
                      <tr>
                        <th className="text-xs text-muted-foreground font-medium text-left px-5 py-3 whitespace-nowrap">套餐名称</th>
                        <th className="text-xs text-muted-foreground font-medium text-right px-5 py-3 whitespace-nowrap">积分</th>
                        <th className="text-xs text-muted-foreground font-medium text-right px-5 py-3 whitespace-nowrap">赠送积分</th>
                        <th className="text-xs text-muted-foreground font-medium text-right px-5 py-3 whitespace-nowrap">价格（元）</th>
                        <th className="text-xs text-muted-foreground font-medium text-left px-5 py-3 whitespace-nowrap">状态</th>
                        <th className="text-xs text-muted-foreground font-medium text-right px-5 py-3 whitespace-nowrap">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {packages.map((pkg) => (
                        <tr key={pkg.id} className="hover:bg-muted/20 transition-colors">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground">{pkg.name}</span>
                              {pkg.recommended && (
                                <Badge className="text-[9px] h-4 px-1.5 rounded-sm" style={{ background: '#C4A96B', color: 'white' }}>
                                  推荐
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-3 text-right tabular-nums text-foreground">{pkg.points}</td>
                          <td className="px-5 py-3 text-right tabular-nums" style={{ color: '#4A7C59' }}>+{pkg.bonusPoints}</td>
                          <td className="px-5 py-3 text-right font-medium tabular-nums" style={{ color: '#C4A96B' }}>
                            ¥{pkg.price}
                          </td>
                          <td className="px-5 py-3">
                            <Badge
                              variant="outline"
                              className={cn(
                                'text-[10px]',
                                pkg.status === 'active'
                                  ? 'border-[#4A7C59]/40 text-[#4A7C59] bg-[#4A7C59]/5'
                                  : 'border-muted-foreground/40 text-muted-foreground'
                              )}
                            >
                              {pkg.status === 'active' ? '启用' : '禁用'}
                            </Badge>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <div className="flex items-center gap-1 justify-end">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="size-7 rounded-md"
                                onClick={() => openEditPkg(pkg)}
                                title="编辑"
                              >
                                <Edit2 className="size-3.5 text-muted-foreground" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="size-7 rounded-md"
                                onClick={() => togglePackageStatus(pkg.id)}
                                title={pkg.status === 'active' ? '禁用' : '启用'}
                              >
                                <Power className="size-3.5 text-muted-foreground" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="size-7 rounded-md"
                                onClick={() => deletePackage(pkg.id)}
                                title="删除"
                              >
                                <Trash2 className="size-3.5 text-[#B5483E]" />
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
          )}

          {/* 创作者分成 */}
          {activeSub === 'royalty' && (
            <Card className="bg-white border-border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-['Noto_Serif_SC'] tracking-wider font-semibold">
                  创作者分成设置
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground font-medium">基础分成比例（%）</Label>
                    <Input
                      type="number"
                      value={royaltySettings.baseRate}
                      onChange={(e) => setRoyaltySettings({ ...royaltySettings, baseRate: Number(e.target.value) })}
                      className="h-10 bg-white border-border"
                    />
                    <p className="text-[11px] text-muted-foreground">普通创作者默认分成比例</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground font-medium">优质创作者分成（%）</Label>
                    <Input
                      type="number"
                      value={royaltySettings.premiumRate}
                      onChange={(e) => setRoyaltySettings({ ...royaltySettings, premiumRate: Number(e.target.value) })}
                      className="h-10 bg-white border-border"
                    />
                    <p className="text-[11px] text-muted-foreground">月销 ≥ 20 单自动升级</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground font-medium">签约创作者分成（%）</Label>
                    <Input
                      type="number"
                      value={royaltySettings.signedRate}
                      onChange={(e) => setRoyaltySettings({ ...royaltySettings, signedRate: Number(e.target.value) })}
                      className="h-10 bg-white border-border"
                    />
                    <p className="text-[11px] text-muted-foreground">平台签约合作创作者</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground font-medium">结算周期（天）</Label>
                    <Input
                      type="number"
                      value={royaltySettings.settleDays}
                      onChange={(e) => setRoyaltySettings({ ...royaltySettings, settleDays: Number(e.target.value) })}
                      className="h-10 bg-white border-border"
                    />
                    <p className="text-[11px] text-muted-foreground">确认收货后 N 天可提现</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground font-medium">最低提现金额（元）</Label>
                    <Input
                      type="number"
                      value={royaltySettings.minWithdraw}
                      onChange={(e) => setRoyaltySettings({ ...royaltySettings, minWithdraw: Number(e.target.value) })}
                      className="h-10 bg-white border-border"
                    />
                    <p className="text-[11px] text-muted-foreground">低于此金额不可提现</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground font-medium">提现手续费（%）</Label>
                    <Input
                      type="number"
                      value={royaltySettings.withdrawFee}
                      onChange={(e) => setRoyaltySettings({ ...royaltySettings, withdrawFee: Number(e.target.value) })}
                      className="h-10 bg-white border-border"
                    />
                    <p className="text-[11px] text-muted-foreground">每笔提现扣除的手续费</p>
                  </div>
                </div>
                <div className="pt-2">
                  <Button
                    className="rounded-lg"
                    style={{ background: '#2C3E3A' }}
                    onClick={handleSaveRoyalty}
                  >
                    <Save className="size-4 mr-1.5" />
                    保存设置
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 内容审核设置 */}
          {activeSub === 'audit' && (
            <Card className="bg-white border-border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-['Noto_Serif_SC'] tracking-wider font-semibold">
                  内容审核设置
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {[
                  { key: 'autoAudit', label: 'AI生成自动机审', desc: '用户生成内容后自动进行机器审核' },
                  { key: 'needHumanAfterAuto', label: '机审通过后需人审', desc: '机审通过后仍需人工审核才能发布' },
                  { key: 'publishAudit', label: '广场作品发布审核', desc: '发布到广场的作品需审核通过才能公开' },
                  { key: 'sensitiveFilter', label: '敏感词过滤', desc: '对文本内容进行敏感词过滤' },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                    <Switch
                      checked={auditSettings[item.key as keyof typeof auditSettings] as boolean}
                      onCheckedChange={(checked) =>
                        setAuditSettings({ ...auditSettings, [item.key]: checked })
                      }
                      className="data-[state=checked]:bg-[#2C3E3A]"
                    />
                  </div>
                ))}

                <div className="space-y-2 pt-2">
                  <Label className="text-xs text-muted-foreground font-medium">图片审核 API</Label>
                  <Select
                    value={auditSettings.imageAuditApi}
                    onValueChange={(v) =>
                      setAuditSettings({ ...auditSettings, imageAuditApi: v as 'aliyun' | 'tencent' | 'off' })
                    }
                  >
                    <SelectTrigger className="h-10 bg-white border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-border">
                      <SelectItem value="aliyun">阿里云内容安全</SelectItem>
                      <SelectItem value="tencent">腾讯云内容安全</SelectItem>
                      <SelectItem value="off">关闭</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-2">
                  <Button
                    className="rounded-lg"
                    style={{ background: '#2C3E3A' }}
                    onClick={handleSaveAudit}
                  >
                    <Save className="size-4 mr-1.5" />
                    保存设置
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 公告管理 */}
          {activeSub === 'announcement' && (
            <Card className="bg-white border-border shadow-sm">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-['Noto_Serif_SC'] tracking-wider font-semibold">
                  公告管理
                </CardTitle>
                <Button
                  size="sm"
                  className="h-8 rounded-md text-xs"
                  style={{ background: '#2C3E3A' }}
                  onClick={openAddAnn}
                >
                  <Plus className="size-3.5 mr-1" />
                  发布公告
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="w-full overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/30">
                      <tr>
                        <th className="text-xs text-muted-foreground font-medium text-left px-5 py-3 whitespace-nowrap w-10">
                          <FileText className="size-4" />
                        </th>
                        <th className="text-xs text-muted-foreground font-medium text-left px-5 py-3 whitespace-nowrap">标题</th>
                        <th className="text-xs text-muted-foreground font-medium text-left px-5 py-3">内容摘要</th>
                        <th className="text-xs text-muted-foreground font-medium text-left px-5 py-3 whitespace-nowrap">发布时间</th>
                        <th className="text-xs text-muted-foreground font-medium text-left px-5 py-3 whitespace-nowrap">状态</th>
                        <th className="text-xs text-muted-foreground font-medium text-right px-5 py-3 whitespace-nowrap">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {announcements.map((ann) => (
                        <tr key={ann.id} className="hover:bg-muted/20 transition-colors">
                          <td className="px-5 py-3">
                            <FileText className="size-4 text-muted-foreground/50" />
                          </td>
                          <td className="px-5 py-3 font-medium text-foreground">{ann.title}</td>
                          <td className="px-5 py-3 text-muted-foreground text-xs">
                            <span className="block line-clamp-1">{ann.content}</span>
                          </td>
                          <td className="px-5 py-3 text-xs text-muted-foreground whitespace-nowrap">{ann.createdAt}</td>
                          <td className="px-5 py-3">
                            <Badge
                              variant="outline"
                              className={cn(
                                'text-[10px]',
                                ann.status === 'published'
                                  ? 'border-[#4A7C59]/40 text-[#4A7C59] bg-[#4A7C59]/5'
                                  : 'border-[#C49A3A]/40 text-[#C49A3A] bg-[#C49A3A]/5'
                              )}
                            >
                              {ann.status === 'published' ? '已发布' : '草稿'}
                            </Badge>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <div className="flex items-center gap-1 justify-end">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="size-7 rounded-md"
                                onClick={() => openEditAnn(ann)}
                                title="编辑"
                              >
                                <Edit2 className="size-3.5 text-muted-foreground" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="size-7 rounded-md"
                                onClick={() => toggleAnnouncementStatus(ann.id)}
                                title={ann.status === 'published' ? '下架' : '发布'}
                              >
                                {ann.status === 'published' ? (
                                  <X className="size-3.5 text-muted-foreground" />
                                ) : (
                                  <Power className="size-3.5 text-[#4A7C59]" />
                                )}
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="size-7 rounded-md"
                                onClick={() => deleteAnnouncement(ann.id)}
                                title="删除"
                              >
                                <Trash2 className="size-3.5 text-[#B5483E]" />
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
          )}

          {/* 操作日志（所有子tab底部都显示？不，仅设置页有意义） */}
          {activeSub === 'basic' && (
            <Card className="bg-white border-border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-['Noto_Serif_SC'] tracking-wider font-semibold">
                  最近操作日志
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="w-full overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/30">
                      <tr>
                        <th className="text-xs text-muted-foreground font-medium text-left px-5 py-3 whitespace-nowrap">时间</th>
                        <th className="text-xs text-muted-foreground font-medium text-left px-5 py-3 whitespace-nowrap">操作人</th>
                        <th className="text-xs text-muted-foreground font-medium text-left px-5 py-3">操作内容</th>
                        <th className="text-xs text-muted-foreground font-medium text-left px-5 py-3 whitespace-nowrap">IP 地址</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {OPERATION_LOGS.map((log, i) => (
                        <tr key={i} className="hover:bg-muted/10 transition-colors">
                          <td className="px-5 py-2.5 text-xs text-muted-foreground whitespace-nowrap">{log.time}</td>
                          <td className="px-5 py-2.5 text-foreground/80 text-xs">{log.operator}</td>
                          <td className="px-5 py-2.5 text-foreground/80 text-xs">{log.action}</td>
                          <td className="px-5 py-2.5 text-xs text-muted-foreground font-mono">{log.ip}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* 套餐编辑弹窗 */}
      <Dialog open={pkgDialogOpen} onOpenChange={setPkgDialogOpen}>
        <DialogContent className="max-w-md bg-white border-border">
          <DialogHeader>
            <DialogTitle className="font-['Noto_Serif_SC'] tracking-wider font-semibold">
              {editingPkg ? '编辑套餐' : '新增套餐'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              设置充值套餐的积分、赠送与价格
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground font-medium">套餐名称</Label>
              <Input
                value={pkgForm.name}
                onChange={(e) => setPkgForm({ ...pkgForm, name: e.target.value })}
                placeholder="如：体验档"
                className="h-9 bg-white border-border"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground font-medium">积分</Label>
                <Input
                  type="number"
                  value={pkgForm.points || ''}
                  onChange={(e) => setPkgForm({ ...pkgForm, points: Number(e.target.value) })}
                  className="h-9 bg-white border-border"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground font-medium">赠送</Label>
                <Input
                  type="number"
                  value={pkgForm.bonusPoints || ''}
                  onChange={(e) => setPkgForm({ ...pkgForm, bonusPoints: Number(e.target.value) })}
                  className="h-9 bg-white border-border"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground font-medium">价格（元）</Label>
                <Input
                  type="number"
                  value={pkgForm.price || ''}
                  onChange={(e) => setPkgForm({ ...pkgForm, price: Number(e.target.value) })}
                  className="h-9 bg-white border-border"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Switch
                checked={pkgForm.recommended}
                onCheckedChange={(c) => setPkgForm({ ...pkgForm, recommended: c })}
                className="data-[state=checked]:bg-[#C4A96B]"
              />
              <span className="text-xs text-muted-foreground">设为推荐套餐</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPkgDialogOpen(false)} className="rounded-lg">
              取消
            </Button>
            <Button className="rounded-lg" style={{ background: '#2C3E3A' }} onClick={savePackage}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 公告编辑弹窗 */}
      <Dialog open={annDialogOpen} onOpenChange={setAnnDialogOpen}>
        <DialogContent className="max-w-lg bg-white border-border">
          <DialogHeader>
            <DialogTitle className="font-['Noto_Serif_SC'] tracking-wider font-semibold">
              {editingAnn ? '编辑公告' : '发布公告'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              公告将在首页顶部轮播展示
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground font-medium">公告标题</Label>
              <Input
                value={annForm.title}
                onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })}
                placeholder="请输入公告标题"
                className="h-9 bg-white border-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground font-medium">公告内容</Label>
              <Textarea
                value={annForm.content}
                onChange={(e) => setAnnForm({ ...annForm, content: e.target.value })}
                placeholder="请输入公告内容..."
                className="min-h-[120px] resize-none bg-white border-border text-sm"
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setAnnDialogOpen(false)} className="rounded-lg sm:order-1">
              取消
            </Button>
            <div className="flex gap-2 sm:order-2">
              <Button
                variant="outline"
                className="rounded-lg"
                onClick={() => saveAnnouncement(false)}
              >
                存草稿
              </Button>
              <Button
                className="rounded-lg"
                style={{ background: '#2C3E3A' }}
                onClick={() => saveAnnouncement(true)}
              >
                立即发布
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

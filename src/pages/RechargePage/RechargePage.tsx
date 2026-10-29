import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Coins,
  Sparkles,
  Box,
  ChevronDown,
  ChevronUp,
  Check,
  CreditCard,
  Wallet,
  Info,
  ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { getPointRecords, addRechargeRecord, genId } from '@/lib/app-storage';
import { cn } from '@/lib/utils';

const RECHARGE_PACKS = [
  { id: 'p1', amount: 100, bonus: 0, price: 10, label: '体验档', tag: '' },
  { id: 'p2', amount: 500, bonus: 50, price: 45, label: '入门档', tag: '' },
  { id: 'p3', amount: 1000, bonus: 150, price: 80, label: '热门档', tag: '推荐' },
  { id: 'p4', amount: 3000, bonus: 600, price: 220, label: '进阶档', tag: '' },
  { id: 'p5', amount: 10000, bonus: 3000, price: 680, label: '企业档', tag: '企业推荐' },
];

const PAYMENT_METHODS = [
  { id: 'wechat', label: '微信支付', icon: 'wechat', color: 'text-[#07C160]' },
  { id: 'alipay', label: '支付宝', icon: 'alipay', color: 'text-[#1677FF]' },
];

const CREDIT_USAGE = [
  { title: '文生琉璃图', desc: '20 积分 / 次', icon: Sparkles },
  { title: '图生琉璃图', desc: '30 积分 / 次', icon: Sparkles },
  { title: '3D 建模 + 校验', desc: '50 积分 / 次', icon: Box },
];

export default function RechargePage() {
  const navigate = useNavigate();
  const { state: authState, addPoints } = useAuth();
  const user = authState.user;
  const credit = user?.points ?? 0;
  const [selectedPack, setSelectedPack] = useState('p3');
  const [paymentMethod, setPaymentMethod] = useState('wechat');
  const [showRecords, setShowRecords] = useState(false);
  const [records, setRecords] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const recs = getPointRecords().filter((r) => r.type === 'recharge').slice(0, 5);
    setRecords(recs);
  }, [user?.id]);

  const currentPack = RECHARGE_PACKS.find((p) => p.id === selectedPack)!;

  const handleRecharge = async () => {
    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 1200));

    const total = currentPack.amount + currentPack.bonus;
    
    // 加积分 + 写充值记录
    addPoints(total, 'recharge', `${currentPack.label}充值 ${currentPack.amount} 积分，赠送 ${currentPack.bonus} 积分`);
    addRechargeRecord({
      id: genId('RC'),
      userId: user!.id,
      packageId: currentPack.id,
      packageName: currentPack.label,
      amount: currentPack.price,
      points: total,
      bonusPoints: currentPack.bonus,
      status: 'success',
      paidAt: new Date().toLocaleString('zh-CN'),
      createdAt: new Date().toLocaleString('zh-CN'),
    });

    // 刷新 records
    const recs = getPointRecords().filter((r) => r.type === 'recharge').slice(0, 5);
    setRecords(recs);

    setIsProcessing(false);
    toast.success(`充值成功，${total} 积分已到账`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-10 md:py-14">
        {/* 返回按钮 */}
        <button
          onClick={() => navigate('/profile?tab=credit')}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors mb-6 text-sm"
        >
          <ArrowLeft className="size-4" />
          返回个人中心
        </button>

        {/* 顶部余额区 */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#2C3E3A] to-[#1a2a26] p-8 md:p-10 mb-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-[100px] -translate-y-1/3 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-warning/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4" />
          <div className="relative flex items-start justify-between">
            <div>
              <h1 className="glass-h1 text-3xl md:text-4xl text-[#F5F0E8] mb-2">积分充值</h1>
              <div className="flex items-baseline gap-2 mt-6">
                <span className="text-5xl md:text-6xl font-bold text-[#F5F0E8] glass-num tabular-nums">
                  {credit.toLocaleString()}
                </span>
                <span className="text-[#F5F0E8]/70 text-lg">积分</span>
              </div>
              <p className="text-[#F5F0E8]/60 text-sm mt-2">当前余额</p>
            </div>
            <button
              onClick={() => setShowRecords(!showRecords)}
              className="flex items-center gap-1 text-[#F5F0E8]/70 hover:text-[#F5F0E8] text-sm transition-colors"
            >
              充值记录
              {showRecords ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            </button>
          </div>
        </div>

        {/* 充值记录折叠区 */}
        <AnimatePresence>
          {showRecords && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 40 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="w-full overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/50 text-muted-foreground">
                          <th className="text-left font-medium px-6 py-3 whitespace-nowrap">订单号</th>
                          <th className="text-left font-medium px-6 py-3 whitespace-nowrap">套餐</th>
                          <th className="text-left font-medium px-6 py-3 whitespace-nowrap">金额</th>
                          <th className="text-left font-medium px-6 py-3 whitespace-nowrap">状态</th>
                          <th className="text-left font-medium px-6 py-3 whitespace-nowrap">时间</th>
                        </tr>
                      </thead>
                      <tbody>
                        {records.map((r, i) => (
                          <tr
                            key={r.id + i}
                            className="border-t border-border/50 hover:bg-muted/30 transition-colors"
                          >
                            <td className="px-6 py-3 font-mono text-xs text-muted-foreground">
                              #{r.id}
                            </td>
                            <td className="px-6 py-3">{r.description.split('充值')[0]}</td>
                            <td className="px-6 py-3 tabular-nums text-primary font-medium">
                              ¥{Math.round(r.amount * 0.08)}
                            </td>
                            <td className="px-6 py-3">
                              <Badge variant="outline" className="text-success border-success/30 bg-success/5">
                                已到账
                              </Badge>
                            </td>
                            <td className="px-6 py-3 text-muted-foreground whitespace-nowrap">
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
        </AnimatePresence>

        {/* 积分套餐区 */}
        <section className="mb-10">
          <h2 className="glass-h2 text-xl md:text-2xl mb-6">选择充值套餐</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {RECHARGE_PACKS.map((pack) => {
              const isSelected = selectedPack === pack.id;
              return (
                <motion.button
                  key={pack.id}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedPack(pack.id)}
                  className={cn(
                    'relative rounded-xl p-5 text-left transition-all duration-300 border-2',
                    isSelected
                      ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                      : 'border-border/60 bg-card hover:border-primary/30 hover:shadow-sm'
                  )}
                >
                  {pack.tag && (
                    <div
                      className={cn(
                        'absolute -top-2.5 right-3 px-2.5 py-0.5 rounded-full text-[11px] font-medium text-white',
                        pack.tag === '推荐'
                          ? 'bg-gradient-to-r from-[#C4A96B] to-[#B8956A]'
                          : 'bg-primary/80'
                      )}
                    >
                      {pack.tag}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground mb-2">{pack.label}</div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-3xl font-bold text-foreground glass-num tabular-nums">
                      {pack.amount}
                    </span>
                    <span className="text-sm text-muted-foreground">积分</span>
                  </div>
                  {pack.bonus > 0 && (
                    <div className="text-xs text-success font-medium mb-3">
                      送 {pack.bonus} 积分 · 实到 {pack.amount + pack.bonus}
                    </div>
                  )}
                  {pack.bonus === 0 && <div className="h-4 mb-3" />}
                  <div className="pt-3 border-t border-border/50">
                    <span className="text-lg font-bold text-primary tabular-nums">¥{pack.price}</span>
                  </div>
                  {isSelected && (
                    <div className="absolute top-3 right-3 size-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="size-3 text-primary-foreground" />
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* 支付方式区 */}
        <section className="mb-10">
          <h2 className="glass-h2 text-xl md:text-2xl mb-6">支付方式</h2>
          <div className="grid grid-cols-2 gap-4 max-w-md">
            {PAYMENT_METHODS.map((method) => {
              const isSelected = paymentMethod === method.id;
              return (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={cn(
                    'flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-300',
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-border/60 bg-card hover:border-primary/30'
                  )}
                >
                  <div
                    className={cn(
                      'size-10 rounded-lg flex items-center justify-center',
                      method.id === 'wechat' ? 'bg-[#07C160]/10' : 'bg-[#1677FF]/10'
                    )}
                  >
                    {method.id === 'wechat' ? (
                      <Wallet className={cn('size-5', method.color)} />
                    ) : (
                      <CreditCard className={cn('size-5', method.color)} />
                    )}
                  </div>
                  <span className="font-medium">{method.label}</span>
                  {isSelected && (
                    <div className="ml-auto size-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <Check className="size-3 text-primary-foreground" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* 支付按钮 */}
        <div className="mb-12">
          <Button
            size="lg"
            className="w-full h-14 text-base font-medium rounded-lg glass-btn-primary"
            onClick={handleRecharge}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <span className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                充值中...
              </>
            ) : (
              <>立即充值 ¥{currentPack.price}</>
            )}
          </Button>
          <p className="text-center text-xs text-muted-foreground mt-3">
            充值即表示同意
            <span className="text-primary cursor-pointer hover:underline mx-0.5">《积分服务协议》</span>
          </p>
        </div>

        {/* 积分用途说明 */}
        <section className="mb-4">
          <h2 className="glass-h2 text-xl md:text-2xl mb-6">积分可以做什么</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {CREDIT_USAGE.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.title} className="glass-edge-glow">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="size-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{item.title}</div>
                      <div className="text-sm text-muted-foreground mt-0.5">{item.desc}</div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <div className="flex items-start gap-2 mt-6 p-4 rounded-xl bg-muted/50 border border-border/50">
          <Info className="size-5 text-primary/70 shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground leading-relaxed">
            积分仅用于消耗 AI 算力服务，不可提现、不可转让。充值后积分即时到账，
            有效期为自充值之日起 12 个月。如需发票，请在个人中心 → 发票管理中申请。
          </p>
        </div>
      </div>
    </div>
  );
}

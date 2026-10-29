import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  DollarSign,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Palette,
  Eye,
  Share2,
  FileText,
  Clock,
  Wallet,
  Mail,
  Phone,
  ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Image } from '@/components/ui/image';
import { avatarImages } from '@lark-apaas/client-toolkit-lite';
import { cn } from '@/lib/utils';

const STEPS = [
  { num: 1, title: '提交申请', desc: '填写资料' },
  { num: 2, title: '平台审核', desc: '1-3个工作日' },
  { num: 3, title: '签署协议', desc: '电子协议' },
  { num: 4, title: '正式入驻', desc: '发布作品' },
];

const STYLE_TAGS = ['东方雅致', '现代简约', '自然禅意', '器物仿生', '其他'];

const BENEFITS = [
  { icon: Eye, title: '作品公开展示', desc: '入驻即可在作品广场展示作品' },
  { icon: DollarSign, title: '销售分成', desc: '每笔订单获 10%-20% 分成' },
  { icon: TrendingUp, title: '官方流量扶持', desc: '优质作品获得首页推荐' },
];

const EARNING_INFO = [
  { title: '分成比例', value: '10%-20%', desc: '基础10% / 优质15% / 签约20%' },
  { title: '结算周期', value: '7天', desc: '确认收货后7天结算' },
  { title: '最低提现', value: '¥100', desc: '支持微信 / 支付宝 / 银行卡' },
];

const TOP_CREATORS = [
  {
    name: '竹影工坊',
    style: '东方雅致',
    earnings: '¥12,580',
    avatar: avatarImages.avatarImg1,
    works: 23,
  },
  {
    name: '琉璃诗人',
    style: '自然禅意',
    earnings: '¥8,920',
    avatar: avatarImages.avatarImg2,
    works: 18,
  },
  {
    name: '器物之间',
    style: '现代简约',
    earnings: '¥6,340',
    avatar: avatarImages.avatarImg3,
    works: 15,
  },
];

export default function CreatorApplyPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    creatorType: '',
    styles: [] as string[],
    portfolio: '',
    bio: '',
  });
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleStyle = (style: string) => {
    setFormData((prev) => ({
      ...prev,
      styles: prev.styles.includes(style)
        ? prev.styles.filter((s) => s !== style)
        : [...prev.styles, style],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      toast.error('请先阅读并同意创作者入驻协议');
      return;
    }
    if (!formData.name || !formData.phone || !formData.creatorType || formData.styles.length === 0 || !formData.bio) {
      toast.error('请填写完整的必填信息');
      return;
    }
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsSubmitting(false);
    setSubmitted(true);
    toast.success('申请已提交');
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="max-w-2xl mx-auto px-4 md:px-6 py-20 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="size-20 mx-auto mb-8 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="size-10 text-success" />
            </div>
            <h1 className="glass-h1 text-3xl md:text-4xl mb-4">申请已提交</h1>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-md mx-auto mb-10">
              我们将在 1-3 个工作日内完成审核，
              结果将通过短信通知您。请留意手机短信。
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button variant="outline" onClick={() => navigate('/')} className="rounded-lg">
                返回首页
              </Button>
              <Button onClick={() => navigate('/square')} className="rounded-lg glass-btn-primary">
                逛逛作品广场
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* 顶部 Banner 区 */}
      <section className="relative w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2C3E3A] via-[#243430] to-[#1a2a26]" />
        <div className="absolute top-0 left-1/4 w-[500px] h-[400px] bg-[#C4A96B]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[350px] bg-accent/15 rounded-full blur-[100px]" />
        <div className="relative max-w-5xl mx-auto px-4 md:px-6 py-16 md:py-24">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-[#F5F0E8]/60 hover:text-[#F5F0E8] text-sm transition-colors mb-8"
          >
            <ArrowLeft className="size-4" />
            返回首页
          </button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="glass-h1 text-4xl md:text-5xl text-[#F5F0E8] mb-4">
              成为琉衍工坊创作者
            </h1>
            <p className="text-[#F5F0E8]/70 text-lg md:text-xl max-w-2xl leading-relaxed mb-10">
              让你的 AI 琉璃作品被世界看见，每一次下单都有收益
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">
              {BENEFITS.map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
                    className="flex items-center gap-3 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
                  >
                    <div className="size-10 rounded-lg bg-[#C4A96B]/20 flex items-center justify-center shrink-0">
                      <Icon className="size-5 text-[#C4A96B]" />
                    </div>
                    <div>
                      <div className="font-medium text-[#F5F0E8] text-sm">{item.title}</div>
                      <div className="text-[#F5F0E8]/60 text-xs mt-0.5">{item.desc}</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-14 md:py-16">
        {/* 入驻流程区 */}
        <section className="mb-16">
          <h2 className="glass-h2 text-2xl md:text-3xl text-center mb-10">入驻流程</h2>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 max-w-3xl mx-auto">
            {STEPS.map((step, i) => (
              <div key={step.num} className="flex md:flex-col items-center gap-3 md:gap-2 flex-1">
                <div
                  className={cn(
                    'size-12 md:size-14 rounded-full flex items-center justify-center text-lg font-bold shrink-0',
                    step.num === 1
                      ? 'bg-gradient-to-br from-[#C4A96B] to-[#B8956A] text-white shadow-lg shadow-[#C4A96B]/20'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {step.num}
                </div>
                <div className="text-center md:text-left">
                  <div
                    className={cn(
                      'font-medium',
                      step.num === 1 ? 'text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {step.title}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{step.desc}</div>
                </div>
                {i < STEPS.length - 1 && (
                  <ArrowRight className="hidden md:block size-5 text-border absolute" />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 申请表单区 */}
        <section className="mb-16">
          <h2 className="glass-h2 text-2xl md:text-3xl text-center mb-2">填写申请信息</h2>
          <p className="text-muted-foreground text-center mb-8">
            请如实填写以下信息，我们将在 1-3 个工作日内完成审核
          </p>

          <Card className="max-w-3xl mx-auto">
            <CardContent className="p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      真实姓名 <span className="text-destructive">*</span>
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="请输入真实姓名"
                      className="rounded-lg h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      手机号 <span className="text-destructive">*</span>
                    </label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="请输入手机号"
                      className="rounded-lg h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">邮箱</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="请输入邮箱（可选）"
                      className="rounded-lg h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      创作者类型 <span className="text-destructive">*</span>
                    </label>
                    <Select
                      value={formData.creatorType}
                      onValueChange={(v) => setFormData({ ...formData, creatorType: v })}
                    >
                      <SelectTrigger className="rounded-lg h-11">
                        <SelectValue placeholder="请选择创作者类型" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="personal">个人</SelectItem>
                        <SelectItem value="studio">工作室</SelectItem>
                        <SelectItem value="company">企业</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    擅长风格 <span className="text-destructive">*</span>
                    <span className="text-muted-foreground font-normal ml-2 text-xs">
                      （可多选）
                    </span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {STYLE_TAGS.map((tag) => {
                      const isActive = formData.styles.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleStyle(tag)}
                          className={cn(
                            'px-4 py-2 rounded-lg text-sm transition-all duration-200',
                            isActive
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          )}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">作品集链接</label>
                  <Input
                    value={formData.portfolio}
                    onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                    placeholder="小红书 / 站酷 / 个人网站链接（可选）"
                    className="rounded-lg h-11"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    自我介绍 <span className="text-destructive">*</span>
                  </label>
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="介绍你的创作理念、风格特点、代表作品等，100字以上"
                    className="rounded-lg min-h-[120px] resize-none"
                  />
                </div>

                <div className="flex items-start gap-2 pt-2">
                  <Checkbox
                    id="agreement"
                    checked={agreed}
                    onCheckedChange={(v) => setAgreed(v as boolean)}
                  />
                  <label
                    htmlFor="agreement"
                    className="text-sm text-muted-foreground leading-relaxed cursor-pointer"
                  >
                    我已阅读并同意
                    <span className="text-primary cursor-pointer hover:underline mx-0.5">
                      《创作者入驻协议》
                    </span>
                    和
                    <span className="text-primary cursor-pointer hover:underline mx-0.5">
                      《收益分成规则》
                    </span>
                  </label>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-12 text-base font-medium rounded-lg glass-btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      提交中...
                    </>
                  ) : (
                    '提交申请'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>

        {/* 收益说明区 */}
        <section className="mb-16">
          <h2 className="glass-h2 text-2xl md:text-3xl text-center mb-2">创作者收益说明</h2>
          <p className="text-muted-foreground text-center mb-10">
            透明的收益机制，让创作更有价值
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {EARNING_INFO.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Card className="text-center glass-edge-glow h-full">
                  <CardContent className="p-8">
                    <div className="text-4xl font-bold text-glass-gradient mb-2 tabular-nums">
                      {item.value}
                    </div>
                    <div className="font-medium text-foreground mb-1">{item.title}</div>
                    <div className="text-sm text-muted-foreground">{item.desc}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="p-6 rounded-xl bg-primary/5 border border-primary/10">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="size-5 text-primary" />
              <span className="font-medium text-foreground">收益计算示例</span>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                • 示例：作品定价 ¥580，分成比例 15%，每笔订单创作者收益{' '}
                <span className="text-primary font-medium">¥87</span>
              </p>
              <p>
                • 示例：月销 50 单，创作者月收益约{' '}
                <span className="text-primary font-medium tabular-nums">¥4,350</span>
              </p>
            </div>
          </div>
        </section>

        {/* 成功案例区 */}
        <section>
          <h2 className="glass-h2 text-2xl md:text-3xl text-center mb-2">优秀创作者</h2>
          <p className="text-muted-foreground text-center mb-10">
            看看他们如何在琉衍工坊实现创作价值
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TOP_CREATORS.map((creator, i) => (
              <motion.div
                key={creator.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Card className="glass-edge-glow h-full overflow-hidden">
                  <div className="h-32 bg-gradient-to-br from-primary/10 via-accent/10 to-warning/10 relative">
                    <div className="absolute inset-0 opacity-30">
                      <div className="absolute top-4 right-6 w-16 h-16 rounded-full bg-primary/20 blur-xl" />
                      <div className="absolute bottom-2 left-8 w-20 h-20 rounded-full bg-warning/20 blur-xl" />
                    </div>
                  </div>
                  <CardContent className="p-6 -mt-10 relative">
                    <Avatar className="size-20 border-4 border-card mb-4">
                      <AvatarImage src={creator.avatar} alt={creator.name} />
                      <AvatarFallback className="bg-primary/10 text-primary font-['Noto_Serif_SC']">
                        {creator.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="font-medium text-foreground text-lg">{creator.name}</div>
                    <div className="text-sm text-muted-foreground mb-4">{creator.style} 风格</div>
                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                      <div>
                        <div className="text-xs text-muted-foreground">累计收益</div>
                        <div className="text-lg font-bold text-[#C4A96B] tabular-nums">
                          {creator.earnings}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">作品数</div>
                        <div className="text-lg font-bold text-foreground tabular-nums">
                          {creator.works}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="rounded-lg glass-btn-primary">
              <Sparkles className="size-4 mr-2" />
              立即申请入驻
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}

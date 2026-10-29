import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ChevronDown,
  ChevronUp,
  User,
  Sparkles,
  Package,
  Palette,
  HelpCircle,
  Mail,
  Phone,
  Clock,
  Coins,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { UniversalLink } from '@lark-apaas/client-toolkit-lite';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  {
    id: 'account',
    title: '账户与积分',
    count: 5,
    icon: Coins,
    color: 'from-primary/20 to-primary/5',
    iconColor: 'text-primary',
  },
  {
    id: 'ai',
    title: 'AI生成与3D',
    count: 5,
    icon: Sparkles,
    color: 'from-accent/20 to-accent/5',
    iconColor: 'text-[#2C7A7B]',
  },
  {
    id: 'order',
    title: '订单与生产',
    count: 5,
    icon: Package,
    color: 'from-warning/20 to-warning/5',
    iconColor: 'text-[#B8956A]',
  },
  {
    id: 'creator',
    title: '创作者与收益',
    count: 5,
    icon: Palette,
    color: 'from-[#9F7AEA]/20 to-[#9F7AEA]/5',
    iconColor: 'text-[#805AD5]',
  },
  {
    id: 'other',
    title: '其他问题',
    count: 4,
    icon: HelpCircle,
    color: 'from-muted-foreground/20 to-muted-foreground/5',
    iconColor: 'text-muted-foreground',
  },
];

const FAQ_DATA = {
  account: [
    {
      q: '如何充值积分？',
      a: '进入个人中心 → 积分账户 → 点击"充值"，选择套餐后通过微信或支付宝支付，积分即时到账。',
    },
    {
      q: '积分会过期吗？',
      a: '积分自充值之日起有效期为 12 个月，到期未使用的积分将自动清零。我们会在到期前 7 天通过短信提醒您。',
    },
    {
      q: '充值后可以退款吗？',
      a: '已充值的积分不支持退款，但可以用于平台内所有 AI 生成、3D 建模服务。如遇特殊情况，请联系客服处理。',
    },
    {
      q: '积分可以转给其他用户吗？',
      a: '目前积分暂不支持转账功能，仅限本人账户使用。',
    },
    {
      q: '充值可以开发票吗？',
      a: '可以。充值完成后，在个人中心 → 发票管理中申请开具电子发票，支持增值税普通发票。',
    },
  ],
  ai: [
    {
      q: '文生图和图生图有什么区别？',
      a: '文生图是通过文字描述直接生成琉璃效果图（20 积分/次）；图生图是上传参考图，AI 保留构图并迁移琉璃风格（30 积分/次），适合有具体参考的创作。',
    },
    {
      q: '生成的图片可以商用吗？',
      a: '您在平台生成的作品版权归您所有，可用于个人和商业用途。但请勿生成涉及侵权、违法违规的内容。',
    },
    {
      q: '3D模型支持哪些格式下载？',
      a: '支持 STL（3D 打印通用）、OBJ（含材质）、GLB（Web 端预览）三种格式，满足不同生产需求。',
    },
    {
      q: '工艺校验不通过怎么办？',
      a: '工艺校验报告会标注具体问题（如壁厚不足、倒扣结构等），您可以根据建议调整设计后重新生成 3D 模型，或联系我们的设计师协助优化。',
    },
    {
      q: 'AI生成需要多长时间？',
      a: '文生图约 15-30 秒，图生图约 20-40 秒，3D 建模约 1-3 分钟。高峰期可能略有延迟，请耐心等待。',
    },
  ],
  order: [
    {
      q: '琉璃成品生产周期是多久？',
      a: '标准器型生产周期为 7-10 个工作日，复杂器型或定制需求可能需要 10-15 个工作日。我们会在订单中实时更新生产进度。',
    },
    {
      q: '3D打印和琉璃铸造有什么区别？',
      a: '3D 打印使用光敏树脂快速成型（3-5 天，价格较低），适合验证设计；琉璃铸造使用传统脱蜡铸造工艺（7-10 天，真实琉璃材质），适合最终成品。',
    },
    {
      q: '可以修改已下单的作品吗？',
      a: '订单确认后 24 小时内可联系客服修改，进入生产阶段后无法修改。建议下单前仔细确认设计。',
    },
    {
      q: '物流运费怎么算？',
      a: '订单满 ¥299 包邮，未满收取 ¥15 运费。偏远地区（新疆、西藏、青海）运费 ¥30。琉璃制品采用防震包装，保价发货。',
    },
    {
      q: '收到的琉璃有瑕疵怎么办？',
      a: '琉璃为手工制品，细微气泡和色差属正常现象。如有明显瑕疵或运输损坏，请在签收后 48 小时内联系客服，我们将免费补发或退款。',
    },
  ],
  creator: [
    {
      q: '如何成为创作者？',
      a: '在创作者入驻页提交申请，填写个人信息和创作资料，平台审核通过后即可成为创作者，发布作品到广场。',
    },
    {
      q: '分成比例如何确定？',
      a: '基础创作者 10%，月销超过 20 单升级为优质创作者 15%，与平台签约的独家创作者 20%。您也可以在发布作品时自主选择 10%-20% 的分成比例。',
    },
    {
      q: '什么时候可以提现？',
      a: '订单确认收货后 7 天，收益转为可提现余额。每月 1-5 日可申请提现，支持微信、支付宝、银行卡，最低提现金额 ¥100。',
    },
    {
      q: '作品被其他人抄袭怎么办？',
      a: '平台对原创作品进行存证保护，如发现侵权可通过举报通道投诉，我们将在 48 小时内处理，下架侵权作品并对违规账号处罚。',
    },
    {
      q: '可以同时发布多个作品吗？',
      a: '可以，创作者发布作品数量不限。但每个作品都需要通过平台内容审核后才能公开展示。',
    },
  ],
  other: [
    {
      q: '如何联系客服？',
      a: '客服邮箱 willamhe0116@163.com，客服电话 15501013868，工作时间周一至周五 10:00-18:00。',
    },
    {
      q: '支持企业批量定制吗？',
      a: '支持。企业客户可享受专属折扣、优先生产、定制包装等服务，请联系商务邮箱 willamhe0116@163.com 咨询。',
    },
    {
      q: '平台支持哪些支付方式？',
      a: '目前支持微信支付和支付宝，企业客户可申请对公转账。',
    },
    {
      q: '我的个人信息安全吗？',
      a: '我们采用银行级加密技术保护您的个人信息，严格遵守《个人信息保护法》，不会向第三方泄露您的隐私数据。',
    },
  ],
};

const HOT_TAGS = ['积分充值', 'AI生成', '3D建模', '订单生产', '创作者收益'];

export default function HelpPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredFAQs = useMemo(() => {
    if (!searchQuery.trim()) return FAQ_DATA;
    const q = searchQuery.toLowerCase();
    const result: Record<string, { q: string; a: string }[]> = {};
    Object.entries(FAQ_DATA).forEach(([cat, items]) => {
      const matched = items.filter(
        (item) => item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)
      );
      if (matched.length > 0) result[cat] = matched;
    });
    return result;
  }, [searchQuery]);

  const scrollToCategory = (catId: string) => {
    setActiveCategory(catId);
    const el = document.getElementById(`faq-${catId}`);
    if (el) {
      const headerOffset = 80;
      const y = el.getBoundingClientRect().top + window.scrollY - headerOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const hasResults = Object.keys(filteredFAQs).length > 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-10 md:py-14">
        {/* 返回按钮 */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors mb-6 text-sm"
        >
          <ArrowLeft className="size-4" />
          返回首页
        </button>

        {/* 顶部搜索区 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="glass-h1 text-3xl md:text-4xl mb-3">帮助中心</h1>
          <p className="text-muted-foreground mb-8">有什么可以帮您？输入关键词快速查找</p>

          <div className="max-w-xl mx-auto relative mb-6">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="有什么可以帮您？输入关键词搜索"
              className="h-14 pl-12 pr-4 rounded-xl bg-card border-border/60 text-base focus-visible:ring-primary"
            />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-sm text-muted-foreground mr-1">热门问题：</span>
            {HOT_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => setSearchQuery(tag)}
                className="px-3 py-1.5 rounded-full text-sm bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </motion.div>

        {/* 分类导航区 */}
        <section className="mb-14">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {CATEGORIES.map((cat, i) => {
              const Icon = cat.icon;
              return (
                <motion.button
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.05 * i }}
                  whileHover={{ y: -3 }}
                  onClick={() => scrollToCategory(cat.id)}
                  className="group p-5 rounded-xl bg-card border border-border/60 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all duration-300 text-left"
                >
                  <div
                    className={cn(
                      'size-12 rounded-xl mb-3 flex items-center justify-center bg-gradient-to-br',
                      cat.color
                    )}
                  >
                    <Icon className={cn('size-6', cat.iconColor)} />
                  </div>
                  <div className="font-medium text-foreground group-hover:text-primary transition-colors">
                    {cat.title}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{cat.count} 个问题</div>
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* FAQ 列表区 */}
        <section className="space-y-10 mb-16">
          {hasResults ? (
            Object.entries(filteredFAQs).map(([catId, items]) => {
              const cat = CATEGORIES.find((c) => c.id === catId);
              if (!cat) return null;
              return (
                <div key={catId} id={`faq-${catId}`} className="scroll-mt-24">
                  <h2 className="glass-h2 text-xl md:text-2xl mb-4 flex items-center gap-2">
                    <cat.icon className={cn('size-5', cat.iconColor)} />
                    {cat.title}
                    <span className="text-sm font-normal text-muted-foreground ml-2">
                      （{items.length} 个问题）
                    </span>
                  </h2>
                  <Card>
                    <CardContent className="p-2">
                      <Accordion type="multiple" className="w-full">
                        {items.map((item, idx) => (
                          <AccordionItem
                            key={idx}
                            value={`${catId}-${idx}`}
                            className="border-b-0 last:border-b-0"
                          >
                            <AccordionTrigger className="text-left hover:no-underline px-4 py-4 hover:bg-muted/30 rounded-lg transition-colors">
                              <span className="font-medium text-foreground text-sm md:text-base pr-4">
                                {item.q}
                              </span>
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pb-4 text-muted-foreground text-sm leading-relaxed">
                              {item.a}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                </div>
              );
            })
          ) : (
            <div className="text-center py-16">
              <HelpCircle className="size-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">没有找到相关问题，试试其他关键词</p>
            </div>
          )}
        </section>

        {/* 底部联系区 */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#2C3E3A] to-[#1a2a26] p-8 md:p-12">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-[100px] -translate-y-1/3 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-warning/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4" />
          <div className="relative text-center">
            <h2 className="glass-h2 text-2xl md:text-3xl text-[#F5F0E8] mb-3">
              没有找到答案？
            </h2>
            <p className="text-[#F5F0E8]/70 mb-8">
              联系我们的客服团队，我们将竭诚为您服务
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
              <div className="p-5 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                <Mail className="size-6 text-[#C4A96B] mx-auto mb-2" />
                <div className="text-[#F5F0E8] font-medium text-sm">客服邮箱</div>
                <div className="text-[#F5F0E8]/70 text-xs mt-1">
                  <UniversalLink to="mailto:willamhe0116@163.com" className="hover:text-[#C4A96B]">
                    willamhe0116@163.com
                  </UniversalLink>
                </div>
              </div>
              <div className="p-5 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                <Phone className="size-6 text-[#C4A96B] mx-auto mb-2" />
                <div className="text-[#F5F0E8] font-medium text-sm">客服电话</div>
                <div className="text-[#F5F0E8]/70 text-xs mt-1 tabular-nums">
                  <UniversalLink to="tel:15501013868" className="hover:text-[#C4A96B]">
                    155-0101-3868
                  </UniversalLink>
                </div>
              </div>
              <div className="p-5 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                <Clock className="size-6 text-[#C4A96B] mx-auto mb-2" />
                <div className="text-[#F5F0E8] font-medium text-sm">工作时间</div>
                <div className="text-[#F5F0E8]/70 text-xs mt-1">周一至周五 10:00-18:00</div>
              </div>
            </div>

            <UniversalLink to="mailto:willamhe0116@163.com" className="inline-flex">
              <Button
                variant="outline"
                className="rounded-lg border-[#C4A96B]/50 text-[#F5F0E8] hover:bg-[#C4A96B]/10 hover:text-[#F5F0E8] hover:border-[#C4A96B]"
              >
                <Mail className="size-4 mr-2" />
                联系客服
              </Button>
            </UniversalLink>
          </div>
        </section>
      </div>
    </div>
  );
}

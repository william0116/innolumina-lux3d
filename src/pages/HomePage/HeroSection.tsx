import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { ArrowRight, Sparkles, ShieldCheck, Cpu, Ruler, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import GlassParticles from '@/components/GlassParticles';
import MiniGlbViewer from '@/components/MiniGlbViewer';
import { HERO_PRODUCT_IMAGE } from '@/data/showcase';

/** 数字跳动计数 hook — KPI 在首屏，挂载后直接启动 */
function useCounter(target: number, duration = 1400, startDelay = 0) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let frameId: number;
    const timer = setTimeout(() => {
      let startTime: number | null = null;
      const animate = (now: number) => {
        if (!startTime) startTime = now;
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.round(eased * target));
        if (progress < 1) frameId = requestAnimationFrame(animate);
      };
      frameId = requestAnimationFrame(animate);
    }, startDelay);
    return () => { clearTimeout(timer); cancelAnimationFrame(frameId); };
  }, []);

  return count;
}

/** 文字区块交错入场 variants */
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 24},
  visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: 'easeOut' as const } },
};

export default function HeroSection() {
  const navigate = useNavigate();
  const c1 = useCounter(1, 1200, 400);
  const c2 = useCounter(33, 1400, 500);
  const c3 = useCounter(5, 1000, 600);

  return (
    <section className="relative w-full overflow-hidden">
      {/* 背景 */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/30" />
        <div className="absolute top-0 right-0 w-[600px] h-[500px] bg-accent/8 rounded-full blur-[120px] opacity-60" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[400px] bg-primary/6 rounded-full blur-[100px] opacity-70" />
        <GlassParticles />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-12 md:pt-16 pb-20 md:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* 左侧文字 — 交错入场 */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-primary text-sm mb-8 font-medium">
                <Sparkles className="size-4" />
                AI 驱动的琉璃数字化定制
              </div>
            </motion.div>

            {/* 品牌名 */}
            <motion.div variants={itemVariants} className="mb-2 text-5xl md:text-7xl font-bold text-foreground font-['Noto_Serif_SC'] tracking-[0.1em] leading-[1.15]">
              琉衍
            </motion.div>
            <motion.div variants={itemVariants} className="mb-5 text-5xl md:text-7xl font-bold text-foreground font-['Noto_Serif_SC'] tracking-[0.1em] leading-[1.15]">
              工坊
            </motion.div>
            <motion.div variants={itemVariants} className="mb-6 text-base md:text-lg text-primary/70 glass-brand-en tracking-[0.3em]">
              InnoLumina
            </motion.div>

            {/* Slogan */}
            <motion.p variants={itemVariants} className="text-lg md:text-[22px] text-foreground/80 font-['Noto_Serif_SC'] mb-2 leading-[1.8] tracking-[0.15em]">
              光自数字来，
            </motion.p>
            <motion.p variants={itemVariants} className="text-lg md:text-[22px] text-foreground/80 font-['Noto_Serif_SC'] mb-8 leading-[1.8] tracking-[0.15em]">
              万象衍为琉。
            </motion.p>

            {/* 品牌简介 */}
            <motion.p variants={itemVariants} className="glass-body mb-5 max-w-md leading-[1.9]">
              inno.Studio 旗下 AI 琉璃数字化定制平台。以 AI 文生创作、2D 转 3D 建模、工艺校验引擎，将创意构想转化为琉璃三维数字资产，连接虚拟创意与实体造物。
            </motion.p>
            <motion.div variants={itemVariants} className="mb-10 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs text-primary tracking-wider">
              <Sparkles className="size-3" />
              不止生成 3D · 让 AI 模型过得了失蜡铸造车间
            </motion.div>

            {/* 按钮组：主行动 + 文字次级 + 独立展厅卡片 */}
            <motion.div variants={itemVariants} className="mb-10">
              <div className="flex flex-wrap items-center gap-4 mb-3">
                <Button
                  size="lg"
                  onClick={() => navigate('/create')}
                  className="h-12 px-8 text-base gap-2 glass-btn-primary font-medium rounded-lg tracking-wider"
                >
                  开始创作
                  <ArrowRight className="size-4" />
                </Button>
                <button
                  onClick={() => {
                    document.getElementById('capabilities')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="h-12 px-2 text-sm text-muted-foreground hover:text-foreground hover:underline underline-offset-4 tracking-wide"
                >
                  了解平台能力 ↓
                </button>
              </div>
              <div className="text-xs text-muted-foreground tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-emerald-600" />
                免登录即点即试 · 无需注册
              </div>

              {/* 评委信任徽章带 */}
              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-muted-foreground/90">
                <span className="inline-flex items-center gap-1.5">
                  <Cpu className="size-3.5 text-primary" />
                  Aholo Lux3D 驱动
                </span>
                <span className="w-px h-3 bg-border" />
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5 text-primary" />
                  失蜡铸造工艺校验
                </span>
                <span className="w-px h-3 bg-border hidden sm:block" />
                <span className="hidden sm:inline-flex items-center gap-1.5">
                  <FileDown className="size-3.5 text-primary" />
                  GLB 可下载
                </span>
                <span className="w-px h-3 bg-border hidden md:block" />
                <span className="hidden md:inline-flex items-center gap-1.5">
                  <Ruler className="size-3.5 text-primary" />
                  单位 mm 级尺寸
                </span>
              </div>

              {/* 光影展厅独立卡片 */}
              <button
                onClick={() => navigate('/gallery')}
                className="mt-6 w-full sm:w-auto flex items-center gap-4 px-5 py-4 rounded-xl border border-accent/30 bg-gradient-to-br from-accent/10 via-background to-primary/5 hover:border-accent/60 hover:shadow-lg hover:shadow-accent/10 transition-all text-left"
              >
                <span className="text-2xl">🌅</span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-semibold text-foreground tracking-wide">走进光影展厅</span>
                  <span className="block text-xs text-muted-foreground mt-0.5">暗房 + 琉璃展柜 · 5 件真 GLB 可交互</span>
                </span>
                <ArrowRight className="size-4 text-muted-foreground" />
              </button>
            </motion.div>

            {/* 移动端产品图 —仅在lg 以下显示，插在按钮和 KPI 之间 */}
            <motion.div
              variants={itemVariants}
              className="block lg:hidden mb-8 rounded-2xl overflow-hidden shadow-xl shadow-primary/8 border border-border/60"
            >
              <Image
                src={HERO_PRODUCT_IMAGE}
                alt="四时物候·青绿八角琉璃匣"
                className="w-full aspect-video object-cover"
              />
            </motion.div>

            {/* KPI 数字计数 */}
            <motion.div variants={itemVariants} className="flex items-center gap-5 sm:gap-10 text-sm text-muted-foreground">
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-foreground tabular-nums glass-num-glow font-['Noto_Serif_SC'] tracking-wider">
                  {c1}
                </div>
                <div className="text-xs mt-1.5 tracking-widest">母品牌 inno.Studio</div>
              </div>
              <div className="w-px h-12 bg-gradient-to-b from-transparent via-border to-transparent" />
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-foreground tabular-nums glass-num-glow font-['Noto_Serif_SC'] tracking-wider">
                  {c2}
                </div>
                <div className="text-xs mt-1.5 tracking-widest">广场真实作品</div>
              </div>
              <div className="w-px h-12 bg-gradient-to-b from-transparent via-border to-transparent" />
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-foreground tabular-nums glass-num-glow font-['Noto_Serif_SC'] tracking-wider">
                  {c3}
                </div>
                <div className="text-xs mt-1.5 tracking-widest">真 GLB 可交互</div>
              </div>
            </motion.div>
          </motion.div>

          {/* 右侧产品图 —浮动 + 光晕脉冲（仅桌面显示，移动端走上方那张） */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            className="relative hidden lg:block"
          >
            {/* 光晕脉冲环 */}
            <motion.div
              className="absolute inset-0 rounded-3xl"
              animate={{ boxShadow: ['0 0 0 0px hsl(17870% 50% / 0.08)', '0 0 0 20px hsl(178 70% 50% / 0)', '0 0 0 0px hsl(178 70% 50% / 0.08)'] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* 浮动动画 */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-primary/10 border border-border/60 bg-gradient-to-br from-primary/5 via-background to-accent/10">
                <div className="aspect-square w-full">
                  <MiniGlbViewer />
                </div>
                {/* 角标提示 */}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-[10px] tracking-wider flex items-center gap-1.5 pointer-events-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  真 GLB · 可拖拽旋转
                </div>
              </div>
            </motion.div>
            {/* 外圈柔和光晕 */}
            <div className="absolute -bottom-8 -right-8 w-56 h-56 bg-accent/10 rounded-full blur-3xl -z-10" />
            <div className="absolute -top-10 -left-10 w-64 h-64 bg-primary/8 rounded-full blur-3xl -z-10" />
          </motion.div>

        </div>
      </div>
    </section>
  );
}

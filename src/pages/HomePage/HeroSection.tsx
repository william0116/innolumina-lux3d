import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import GlassParticles from '@/components/GlassParticles';
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
  const c1 = useCounter(500, 1200, 400);
  const c2 = useCounter(3000, 1400, 500);
  const c3 = useCounter(98, 1000, 600);

  return (
    <section className="relative w-full overflow-hidden">
      {/* 背景 */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/30" />
        <div className="absolute top-0 right-0 w-[600px] h-[500px] bg-accent/8 rounded-full blur-[120px] opacity-60" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[400px] bg-primary/6 rounded-full blur-[100px] opacity-70" />
        <GlassParticles />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-20 md:pt-28 pb-24 md:pb-32">
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
            <motion.div variants={itemVariants} className="mb-3 text-6xl md:text-7xl font-bold text-foreground font-['Noto_Serif_SC'] tracking-[0.1em] leading-[1.1]">
              琉衍
            </motion.div>
            <motion.div variants={itemVariants} className="mb-4 text-6xl md:text-7xl font-bold text-foreground font-['Noto_Serif_SC'] tracking-[0.1em] leading-[1.1]">
              工坊
            </motion.div>
            <motion.div variants={itemVariants} className="mb-8 text-lg text-primary/70 glass-brand-en tracking-[0.3em]">
              InnoLumina
            </motion.div>

            {/* Slogan */}
            <motion.p variants={itemVariants} className="text-xl md:text-[22px] text-foreground/80 font-['Noto_Serif_SC'] mb-3 leading-[1.8] tracking-[0.15em]">
              光自数字来，
            </motion.p>
            <motion.p variants={itemVariants} className="text-xl md:text-[22px] text-foreground/80 font-['Noto_Serif_SC'] mb-10 leading-[1.8] tracking-[0.15em]">
              万象衍为琉。
            </motion.p>

            {/* 品牌简介 */}
            <motion.p variants={itemVariants} className="glass-body mb-10 max-w-md leading-[1.9]">
              inno.Studio 旗下 AI 琉璃数字化定制平台。以 AI 文生创作、2D 转 3D 建模、工艺校验引擎，将创意构想转化为琉璃三维数字资产，连接虚拟创意与实体造物。
            </motion.p>

            {/* 按钮组 */}
            <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-4 mb-16">
              <Button
                size="lg"
                onClick={() => navigate('/create')}
                className="h-12 px-8 text-base gap-2 glass-btn-primary font-medium rounded-lg tracking-wider"
              >
                开始创作
                <ArrowRight className="size-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  document.getElementById('capabilities')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="h-12 px-8 text-base bg-white/50 hover:bg-white border-border hover:border-primary/30 rounded-lg tracking-wide"
              >
                了解平台能力
              </Button>
            </motion.div>

            {/* KPI 数字计数 */}
            <motion.div variants={itemVariants} className="flex items-center gap-5 sm:gap-10 text-sm text-muted-foreground">
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-foreground tabular-nums glass-num-glow font-['Noto_Serif_SC'] tracking-wider">
                  {c1}+
                </div>
                <div className="text-xs mt-1.5 tracking-widest">创作者入驻</div>
              </div>
              <div className="w-px h-12 bg-gradient-to-b from-transparent via-border to-transparent" />
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-foreground tabular-nums glass-num-glow font-['Noto_Serif_SC'] tracking-wider">
                  {c2.toLocaleString()}+
                </div>
                <div className="text-xs mt-1.5 tracking-widest">AI 生成作品</div>
              </div>
              <div className="w-px h-12 bg-gradient-to-b from-transparent via-border to-transparent" />
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-foreground tabular-nums glass-num-glow font-['Noto_Serif_SC'] tracking-wider">
                  {c3}%
                </div>
                <div className="text-xs mt-1.5 tracking-widest">工艺通过率</div>
              </div>
            </motion.div>
          </motion.div>

          {/* 右侧产品图 —浮动 + 光晕脉冲 */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            className="relative"
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
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-primary/10 border border-border/60">
                <Image
                  src={HERO_PRODUCT_IMAGE}
                  alt="四时物候·竹叶浮雕八角琉璃匣"
                  className="w-full aspect-square object-cover"
                />
                {/* 琉璃青光晕叠层 */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
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

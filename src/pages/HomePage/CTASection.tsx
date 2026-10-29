import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Palette } from 'lucide-react';

export default function CTASection() {
  const navigate = useNavigate();

  return (
    <section className="w-full py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden rounded-2xl bg-white border border-border shadow-lg shadow-primary/5 p-10 md:p-16 text-center"
        >
          {/* 淡光晕背景 */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-gradient-to-r from-primary/8 via-accent/8 to-primary/8 rounded-full blur-[100px] -z-10" />

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-primary text-sm mb-6 font-medium tracking-wider">
             <Sparkles className="size-4" />
             现在开始，首次创作赠送 500 积分
           </div>

           <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6 leading-[1.2] font-['Noto_Serif_SC'] tracking-[0.05em]">
            让你的创意，
            <br className="md:hidden" />
            <span className="text-glass-gradient">
              凝为手中琉璃
            </span>
          </h2>

          <p className="text-muted-foreground text-base max-w-2xl mx-auto mb-10 leading-[1.9]">
            无需建模经验，不必懂铸造工艺。描述你的想法，
            <br className="hidden md:block" />
            AI 帮你从文字走向三维，从虚拟走进现实。
          </p>

           <div className="flex flex-wrap items-center justify-center gap-4">
             <Button
               size="lg"
               onClick={() => navigate('/create')}
               className="h-12 px-8 text-base gap-2 glass-btn-primary font-medium rounded-lg"
             >
               立即开始创作
               <ArrowRight className="size-4" />
             </Button>
             <Button
               size="lg"
               variant="outline"
               onClick={() => {
                 document.getElementById('capabilities')?.scrollIntoView({ behavior: 'smooth' });
               }}
               className="h-12 px-8 text-base bg-white hover:bg-muted/30 border-border hover:border-primary/30 rounded-lg"
             >
               了解更多
             </Button>
           </div>

           <p className="text-sm text-muted-foreground mt-8">
             是设计师 / 创作者？
             <button
               onClick={() => navigate('/creator/apply')}
               className="text-primary hover:underline font-medium ml-1 inline-flex items-center gap-0.5"
             >
               申请成为创作者 <Palette className="size-3.5" />
             </button>
           </p>
        </motion.div>
      </div>
    </section>
  );
}

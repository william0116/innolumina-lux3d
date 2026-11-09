import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Lightbulb, ImageIcon, Box, ShieldCheck, Download } from 'lucide-react';

const STEPS = [
  { icon: Lightbulb, title: '创意输入', desc: '用文字描述你的琉璃构想' },
  { icon: ImageIcon, title: 'AI 生成效果图', desc: 'AI 生成多张方案供选择' },
  { icon: Box, title: '转3D 模型', desc: '一键生成三维数字模型' },
  { icon: ShieldCheck, title: '工艺校验', desc: '自动检测铸造可行性' },
  { icon: Download, title: '下载 / 下单', desc: '下载模型或下单实体制造' },
];

export default function FlowSection() {
  const lineRef = useRef<HTMLDivElement>(null);
  const lineInView = useInView(lineRef, { once: true, margin: '-80px' });

  return (
    <section className="w-full py-16 md:py-20 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-full blur-[100px]" />
      </div>
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6}}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <div className="inline-block px-4 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm mb-4 font-medium tracking-wider">
            完整链路
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-['Noto_Serif_SC'] tracking-[0.08em]">
            五步走完，从灵感到实物
          </h2>
          <p className="text-muted-foreground leading-[1.8]">
            完整的创意生产链路，每一步都有AI 与工艺专家护航
          </p>
        </motion.div>

        <div className="relative">
          {/* 连接线底层（灰色，始终存在） */}
          <div
            ref={lineRef}
            className="hidden md:block absolute top-12 left-[10%] right-[10%] h-px bg-border/40"
          />
          {/* 连接线动画层（主色，从左绘入） */}
          <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-px overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary/60 via-primary/40 to-accent/50"
              initial={{ scaleX: 0, originX: 0 }}
              animate={lineInView ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-4">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.55, delay: 0.15 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col items-center text-center relative"
                >
                  <motion.div
                    whileHover={{ scale: 1.08, transition: { duration: 0.2 } }}
                    className="size-24 rounded-full bg-white border border-border shadow-sm glass-edge-glow flex items-center justify-center mb-4 relative z-10 group cursor-default"
                  >
                    <div className="size-16 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center group-hover:from-primary/20 group-hover:to-accent/15 transition-all duration-500">
                      <motion.div
                        whileHover={{ rotate: [0, -12, 12, 0], transition: { duration: 0.4 } }}
                      >
                        <Icon className="size-7 text-primary" />
                      </motion.div>
                    </div>
                    {/* 步骤号*/}
                    <div className="absolute -top-1 -right-1 size-6 rounded-full bg-gradient-to-br from-primary to-accent/70 text-primary-foreground text-xs font-bold flex items-center justify-center shadow-md shadow-primary/10">
                      {i + 1}
                    </div>
                  </motion.div>
                  <h3 className="text-foreground font-semibold mb-1.5 font-['Noto_Serif_SC'] tracking-wide">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-[1.7]">{step.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

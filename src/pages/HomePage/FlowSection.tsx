import { motion } from 'framer-motion';
import { Lightbulb, ImageIcon, Box, ShieldCheck, Download } from 'lucide-react';

const STEPS = [
  { icon: Lightbulb, title: '创意输入', desc: '用文字描述你的琉璃构想' },
  { icon: ImageIcon, title: 'AI 生成效果图', desc: 'AI 生成多张方案供选择' },
  { icon: Box, title: '转 3D 模型', desc: '一键生成三维数字模型' },
  { icon: ShieldCheck, title: '工艺校验', desc: '自动检测铸造可行性' },
  { icon: Download, title: '下载 / 下单', desc: '下载模型或下单实体制造' },
];

export default function FlowSection() {
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
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <div className="inline-block px-4 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm mb-4 font-medium tracking-wider">
             完整链路
           </div>
           <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-['Noto_Serif_SC'] tracking-[0.08em]">
             五步走完，从灵感到实物
           </h2>
           <p className="text-muted-foreground leading-[1.8]">
            完整的创意生产链路，每一步都有 AI 与工艺专家护航
          </p>
        </motion.div>

        <div className="relative">
          {/* 连接线 - 桌面端 */}
          <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-4">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="flex flex-col items-center text-center relative"
                >
                  <div className="size-24 rounded-full bg-white border border-border shadow-sm glass-edge-glow flex items-center justify-center mb-4 relative z-10 group">
                    <div className="size-16 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center group-hover:from-primary/20 transition-all duration-500">
                      <Icon className="size-7 text-primary" />
                    </div>
                    <div className="absolute -top-1 -right-1 size-6 rounded-full bg-gradient-to-br from-primary to-accent/70 text-primary-foreground text-xs font-bold flex items-center justify-center shadow-md shadow-primary/10">
                      {i + 1}
                    </div>
                  </div>
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

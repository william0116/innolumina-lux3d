import { motion } from 'framer-motion';
import { Sparkles, Box, ShieldCheck, Factory } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CAPABILITIES = [
  {
    icon: Sparkles,
    title: 'AI 文生创作',
    desc: '输入文字描述，AI 自动生成高质量琉璃器物效果图，支持多种风格预设，激发创意灵感。',
    accent: 'from-primary/15 to-primary/5',
    iconColor: 'text-primary',
  },
  {
    icon: Box,
    title: '2D 转 3D 建模',
    desc: '选定效果图一键生成三维模型，智能还原立体结构，输出可用于生产的 STL 格式文件。',
    accent: 'from-accent/15 to-accent/5',
    iconColor: 'text-accent',
  },
  {
    icon: ShieldCheck,
    title: '工艺校验引擎',
    desc: '自动进行网格完整性、最小壁厚、尺寸范围、镂空结构检测，提前发现铸造风险。',
    accent: 'from-warning/15 to-warning/5',
    iconColor: 'text-warning',
  },
  {
    icon: Factory,
    title: '供应链撮合生产',
    desc: '对接专业 3D 打印服务商与琉璃铸造工厂，从数字模型到实体成品一站式交付。',
    accent: 'from-info/15 to-info/5',
    iconColor: 'text-info',
  },
];

export default function CapabilitiesSection() {
  return (
    <section id="capabilities" className="w-full py-20 md:py-28 relative">
      <div className="absolute inset-0 -z-10 opacity-50">
        <div className="absolute top-1/3 left-0 w-[400px] h-[300px] bg-accent/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-0 w-[500px] h-[350px] bg-primary/5 rounded-full blur-[130px]" />
      </div>
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <div className="inline-block px-4 py-1 rounded-full bg-primary/5 border border-primary/10 text-primary text-sm mb-5 font-medium tracking-wider">
             平台核心能力
           </div>
           <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-['Noto_Serif_SC'] tracking-[0.08em]">
             从创意到成品，全链路数字化
           </h2>
           <p className="text-muted-foreground leading-[1.8] max-w-xl mx-auto">
             四大核心引擎驱动，让琉璃创作不再受限于工艺门槛与设计经验
           </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {CAPABILITIES.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
              >
                <Card className="h-full bg-white glass-edge-glow overflow-hidden group relative border-border">
                  <CardHeader className="pb-3">
                    <div
                      className={`size-14 rounded-xl bg-gradient-to-br ${item.accent} flex items-center justify-center mb-4`}
                    >
                      <Icon className={`size-6 ${item.iconColor}`} />
                    </div>
                    <CardTitle className="text-lg font-['Noto_Serif_SC'] tracking-wider text-foreground font-semibold">{item.title}</CardTitle>
                   </CardHeader>
                   <CardContent>
                     <p className="text-sm text-muted-foreground leading-[1.85]">
                       {item.desc}
                     </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

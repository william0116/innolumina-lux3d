import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MOCK_SHOWCASES, type IShowcase } from '@/data/showcase';
import { Image } from '@/components/ui/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

type SeriesFilter = 'all' | 'liuli-box' | 'fragrance' | 'furniture';

const SERIES_TABS: { key: SeriesFilter; label: string }[] = [
  { key: 'all', label: '全部作品' },
  { key: 'liuli-box', label: '四时物候·琉璃匣' },
  { key: 'fragrance', label: '香器花器' },
  { key: 'furniture', label: '艺术家具' },
];

function ShowcaseCard({ item, index }: { item: IShowcase; index: number }) {
  const navigate = useNavigate();
  return (
    <motion.div
      layout
      key={item.id}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      className="group relative rounded-xl overflow-hidden bg-white border border-border shadow-sm hover:shadow-lg hover:shadow-primary/8 hover:border-primary/20 cursor-pointer transition-all duration-300"
      onClick={() => navigate('/create')}
    >
      <div className="aspect-square overflow-hidden relative">
        <Image
          src={item.imageUrl}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-108"
        />
        {/* hover渐变遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

        {/* 系列标签 */}
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="text-[10px] bg-white/90 backdrop-blur-sm text-primary border-0">
            {item.seriesLabel}
          </Badge>
        </div>

        {/* hover 时底部 CTA */}
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <div className="flex items-center gap-1.5 text-white/90 text-xs font-medium">
            <Sparkles className="size-3" />
            点击开始创作
          </div>
        </div>
      </div>

      {/* 底部琉璃青光条 */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="p-4 md:p-5">
        <h3 className="text-foreground font-semibold text-sm md:text-base mb-1.5 font-['Noto_Serif_SC'] leading-snug tracking-wide">
          {item.title}
        </h3>
        <p className="text-muted-foreground text-xs md:text-sm line-clamp-2 leading-[1.7]">
          {item.description}
        </p>
      </div>
    </motion.div>
  );
}

export default function ShowcaseSection() {
  const navigate = useNavigate();
  const [activeSeries, setActiveSeries] = useState<SeriesFilter>('all');

  const filtered = useMemo<IShowcase[]>(() => {
    if (activeSeries === 'all') return MOCK_SHOWCASES.filter((s) => s.series !== 'exhibition');
    return MOCK_SHOWCASES.filter((s) => s.series === activeSeries);
  }, [activeSeries]);

  return (
    <section id="showcase" className="w-full py-20 md:py-28 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 opacity-30">
        <div className="absolute top-0 right-1/4 w-[500px] h-[400px] bg-accent/8 rounded-full blur-[140px]" />
      </div>
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-end justify-between mb-8 flex-wrap gap-4"
        >
          <div>
            <div className="inline-block px-4 py-1 rounded-full bg-primary/5 border border-primary/10 text-primary text-sm mb-3 font-medium tracking-wider">
              作品展示
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3 font-['Noto_Serif_SC'] tracking-[0.08em]">
              inno.Studio琉璃臻品
            </h2>
            <p className="text-muted-foreground max-w-xl leading-[1.8]">
              母品牌 inno.Studio 真实作品与空间落地案例，每一件琉璃器物都凝结东方意韵与匠艺温度
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/create')}
            className="gap-2 bg-white/50 hover:bg-white border-border hover:border-primary/30rounded-lg"
          >
            开始创作
            <ArrowRight className="size-4" />
          </Button>
        </motion.div>

        {/* 系列 Tab筛选 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-wrap gap-2 mb-10"
        >
          {SERIES_TABS.map((tab) => {
            const isActive = activeSeries === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveSeries(tab.key)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                : 'bg-white text-muted-foreground border border-border hover:border-primary/30 hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </motion.div>

        {/* 作品网格 — AnimatePresence 平滑过渡 */}
        <motion.div
          layout
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((item, i) => (
              <ShowcaseCard key={item.id} item={item} index={i} />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MOCK_SHOWCASES, type IShowcase } from '@/data/showcase';
import { Image } from '@/components/ui/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

type SeriesFilter = 'all' | 'liuli-box' | 'fragrance' | 'furniture';

const SERIES_TABS: { key: SeriesFilter; label: string }[] = [
  { key: 'all', label: '全部作品' },
  { key: 'liuli-box', label: '四时物候·琉璃匣' },
  { key: 'fragrance', label: '香器花器' },
  { key: 'furniture', label: '艺术家具' },
];

export default function ShowcaseSection() {
  const navigate = useNavigate();
  const [activeSeries, setActiveSeries] = useState<SeriesFilter>('all');

  const filtered = useMemo<IShowcase[]>(() => {
    if (activeSeries === 'all') return MOCK_SHOWCASES.filter((s) => s.series !== 'exhibition');
    return MOCK_SHOWCASES.filter((s) => s.series === activeSeries);
  }, [activeSeries]);

  return (
    <section id="showcase" className="w-full py-20 md:py-28 relative">
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
                 inno.Studio 琉璃臻品
               </h2>
               <p className="text-muted-foreground max-w-xl leading-[1.8]">
                 母品牌 inno.Studio 真实作品与空间落地案例，每一件琉璃器物都凝结东方意韵与匠艺温度
               </p>
             </div>
          <Button
            variant="outline"
            onClick={() => navigate('/create')}
            className="gap-2 bg-white/50 hover:bg-white border-border hover:border-primary/30 rounded-lg"
          >
            开始创作
            <ArrowRight className="size-4" />
          </Button>
        </motion.div>

        {/* 系列 Tab 筛选 */}
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
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-white text-muted-foreground border border-border hover:border-primary/30 hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </motion.div>

        {/* 作品网格 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {filtered.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              className="group relative rounded-xl overflow-hidden bg-white border border-border shadow-sm hover:shadow-md hover:shadow-primary/5 cursor-pointer transition-shadow duration-300"
              onClick={() => navigate('/create')}
            >
              <div className="aspect-square overflow-hidden relative">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {/* 系列标签悬浮右上 */}
                <div className="absolute top-2 right-2">
                  <Badge
                    variant="secondary"
                    className="text-[10px] bg-white/90 backdrop-blur-sm text-primary border-0"
                  >
                    {item.seriesLabel}
                  </Badge>
                </div>
              </div>
              {/* 底部琉璃青条 */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="p-4 md:p-5">
                 <h3 className="text-foreground font-semibold text-sm md:text-base mb-1.5 font-['Noto_Serif_SC'] leading-snug tracking-wide">
                   {item.title}
                 </h3>
                 <p className="text-muted-foreground text-xs md:text-sm line-clamp-2 leading-[1.7]">
                   {item.description}
                 </p>
               </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

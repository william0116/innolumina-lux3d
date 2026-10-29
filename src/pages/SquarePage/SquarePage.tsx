import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  Heart,
  Bookmark,
  Upload,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Image } from '@/components/ui/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { getSquareWorks } from '@/lib/square-storage';
import { STYLE_TAGS, PRICE_RANGES, SORT_OPTIONS, CATEGORY_TAGS } from '@/data/square';
import type { ISquareWork } from '@/data/square';
import { cn } from '@/lib/utils';
import UploadWorkDialog from './UploadWorkDialog';
import EmptyState from '@/components/EmptyState';

export default function SquarePage() {
  const navigate = useNavigate();
  const [works, setWorks] = useState<ISquareWork[]>(() => getSquareWorks().filter(w => w.isPublic && w.status === 'published'));
  const [keyword, setKeyword] = useState('');
  const [activeTag, setActiveTag] = useState<string>('all');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('hot');
  const [detailWork, setDetailWork] = useState<ISquareWork | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [favorited, setFavorited] = useState<Record<string, boolean>>({});

  const filteredWorks = useMemo(() => {
    let result = [...works];

    // 关键词搜索
    if (keyword.trim()) {
      const kw = keyword.toLowerCase();
      result = result.filter(
        (w) =>
          w.title.toLowerCase().includes(kw) ||
          w.creator.name.toLowerCase().includes(kw) ||
          w.description.toLowerCase().includes(kw)
      );
    }

    // 分类筛选
    if (activeTag !== 'all') {
      result = result.filter((w) => (w as any).category === activeTag);
    }

    // 价格筛选
    if (priceRange !== 'all') {
      const [min, max] = priceRange.split('-').map((v) => (v === '+' ? Infinity : Number(v)));
      if (priceRange.endsWith('+')) {
        result = result.filter((w) => w.priceMin >= min);
      } else {
        result = result.filter((w) => w.priceMax >= min && w.priceMin <= (max ?? Infinity));
      }
    }

    // 排序
    switch (sortBy) {
      case 'hot':
        result.sort((a, b) => b.likes + b.sales * 10 - (a.likes + a.sales * 10));
        break;
      case 'new':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'price-asc':
        result.sort((a, b) => a.priceMin - b.priceMin);
        break;
      case 'price-desc':
        result.sort((a, b) => b.priceMax - a.priceMax);
        break;
    }

    return result;
  }, [works, keyword, activeTag, priceRange, sortBy]);

  const handleLike = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setLiked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setFavorited((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOrder = (e: React.MouseEvent, work: ISquareWork) => {
    e.stopPropagation();
    // 跳转到下单页，带上作品ID
    navigate(`/order/square-${work.id}?from=square&workId=${work.id}`);
  };

  const handleUploadSuccess = (work: ISquareWork) => {
    setUploadOpen(false);
    // 如果是公开发布的，加入列表
    if (work.isPublic && work.status === 'published') {
      setWorks((prev) => [work, ...prev]);
    }
  };

  return (
    <div className="min-h-screen py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* 页头 */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="size-5 text-primary" />
            <span className="text-sm text-primary tracking-widest glass-brand-en">WORKS SQUARE</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground glass-h1">作品广场</h1>
          <p className="mt-3 text-muted-foreground glass-body max-w-xl mx-auto">
            发现创作者的琉璃灵感，一键定制生产
          </p>
        </div>

        {/* 搜索框 - 居中 */}
        <div className="max-w-xl mx-auto mb-6">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索作品、标签、创作者"
              className="bg-white pl-11 h-12 rounded-xl border-border shadow-sm focus-visible:ring-primary/30 focus-visible:border-primary/40 text-base"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => setUploadOpen(true)}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 gap-1 bg-primary hover:bg-primary/90 text-primary-foreground border-0 rounded-lg"
            >
              <Upload className="size-3.5" />
              上传
            </Button>
          </div>
        </div>

        {/* 分类标签 + 排序 */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
          <div className="flex items-center gap-2 overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap scrollbar-none pb-2 md:pb-0">
            {CATEGORY_TAGS.map((tag) => (
              <Button
                key={tag.value}
                variant={activeTag === tag.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTag(tag.value)}
                className={cn(
                  'h-8 px-4 text-xs rounded-full transition-all shrink-0',
                  activeTag === tag.value
                    ? 'bg-[#2C3E3A] text-white hover:bg-[#2C3E3A]/90 border-transparent shadow-sm'
                    : 'bg-white border-border text-muted-foreground hover:border-primary/40 hover:text-primary'
                )}
              >
                {tag.label}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-2 md:justify-end">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px] h-8 bg-white border-border rounded-full text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 作品网格 */}
        {filteredWorks.length === 0 ? (
          <EmptyState
            type="search"
            onAction={() => {
              setKeyword('');
              setActiveTag('all');
              setPriceRange('all');
            }}
            actionLabel="查看全部作品"
            className="py-16 md:py-20"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5 lg:gap-6">
            {filteredWorks.map((work, i) => (
              <motion.div
                key={work.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
              >
                <Card
                  className="group cursor-pointer glass-card glass-edge-glow glass-bottom-glow overflow-hidden relative"
                  onClick={() => setDetailWork(work)}
                >
                  {/* 作品图 */}
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={work.images[0]}
                      alt={work.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* 右上角操作 */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="!size-8 rounded-full glass-card"
                        onClick={(e) => handleLike(e, work.id)}
                      >
                        <Heart
                          className={cn(
                            'size-4',
                            liked[work.id] ? 'fill-destructive text-destructive' : ''
                          )}
                        />
                      </Button>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="!size-8 rounded-full glass-card"
                        onClick={(e) => handleFavorite(e, work.id)}
                      >
                        <Bookmark
                          className={cn(
                            'size-4',
                            favorited[work.id] ? 'fill-warning text-warning' : ''
                          )}
                        />
                      </Button>
                    </div>

                    {/* 底部一键生产按钮 - hover 显示 */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <Button
                        className="w-full glass-btn-primary h-9"
                        onClick={(e) => handleOrder(e, work)}
                      >
                        一键生产
                      </Button>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    {/* 作品名称 */}
                    <h3 className="font-semibold text-foreground glass-h3 text-base mb-2 truncate">
                      {work.title}
                    </h3>

                    {/* 标签 */}
                    <div className="flex gap-1.5 mb-3 flex-wrap">
                      {work.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-[10px] h-5 px-2 border-primary/30 text-primary/80">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* 创作者信息 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <Avatar className="size-6 shrink-0">
                          <AvatarImage src={work.creator.avatar} />
                          <AvatarFallback className="text-[10px]">{work.creator.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground truncate">{work.creator.name}</span>
                      </div>

                      {/* 价格 */}
                      <div className="text-right shrink-0">
                        <span className="text-warning font-bold font-['Noto_Serif_SC'] glass-num-glow">
                          ¥{work.priceMin}
                        </span>
                        <span className="text-xs text-muted-foreground">起</span>
                      </div>
                    </div>

                    {/* 数据指标 */}
                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/30 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Heart className="size-3" />
                        {work.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <Bookmark className="size-3" />
                        {work.favorites}
                      </span>
                      <span className="ml-auto">已售 {work.sales}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* 作品详情弹窗 */}
      <Dialog open={!!detailWork} onOpenChange={(o) => !o && setDetailWork(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden glass-card">
          {detailWork && <WorkDetail work={detailWork} onOrder={handleOrder} />}
        </DialogContent>
      </Dialog>

      {/* 上传作品弹窗 */}
      <UploadWorkDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onSuccess={handleUploadSuccess}
      />
    </div>
  );
}

// 作品详情内容组件
function WorkDetail({ work, onOrder }: { work: ISquareWork; onOrder: (e: React.MouseEvent, w: ISquareWork) => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <div className="flex flex-col md:flex-row">
      {/* 左侧：图片 */}
      <div className="md:w-1/2 relative bg-card/50">
        <div className="aspect-square">
          <Image
            src={work.images[currentIndex]}
            alt={work.title}
            className="w-full h-full object-cover"
          />
        </div>
        {/* 缩略图 */}
        {work.images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {work.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={cn(
                  'size-12 rounded-md overflow-hidden border-2 transition-all',
                  i === currentIndex ? 'border-primary scale-110' : 'border-transparent opacity-70 hover:opacity-100'
                )}
              >
                <Image src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 右侧：信息 */}
      <div className="md:w-1/2 p-6 md:p-8 flex flex-col">
        <DialogHeader>
          <DialogTitle className="glass-h2 text-2xl">{work.title}</DialogTitle>
        </DialogHeader>

        {/* 创作者 */}
        <div className="flex items-center gap-3 mt-4 pb-4 border-b border-border/40">
          <Avatar className="size-10">
            <AvatarImage src={work.creator.avatar} />
            <AvatarFallback>{work.creator.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-foreground">{work.creator.name}</div>
            <div className="text-xs text-muted-foreground">{work.creator.followers} 粉丝</div>
          </div>
          <Button variant="outline" size="sm" className="h-8 rounded-full">
            + 关注
          </Button>
        </div>

        {/* 描述 */}
        <p className="text-sm text-muted-foreground leading-relaxed mt-4 glass-body">
          {work.description}
        </p>

        {/* 标签 */}
        <div className="flex gap-2 mt-4 flex-wrap">
          {work.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="border-primary/30 text-primary/80">
              {tag}
            </Badge>
          ))}
        </div>

        {/* 作品参数 */}
        <div className="mt-5 p-4 rounded-lg bg-muted/30 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">建议尺寸</span>
            <span className="text-foreground">{work.dimensions}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">材质</span>
            <span className="text-foreground">{work.material}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">工艺</span>
            <span className="text-foreground">{work.craft}</span>
          </div>
        </div>

        {/* 价格 */}
        <div className="mt-5 flex items-end justify-between">
          <div>
            <div className="text-xs text-muted-foreground mb-1">参考价格</div>
            <div className="text-2xl font-bold text-warning font-['Noto_Serif_SC'] glass-num-glow">
              ¥{work.priceMin}
              <span className="text-sm font-normal text-muted-foreground"> - ¥{work.priceMax}</span>
            </div>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            已售 {work.sales} 件
          </div>
        </div>

        <div className="flex-1" />

        {/* 按钮区 */}
        <div className="flex gap-3 mt-6 pt-4 border-t border-border/40">
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 rounded-full"
          >
            <Bookmark className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 rounded-full"
          >
            <ChevronDown className="size-4" />
          </Button>
          <Button
            className="flex-1 glass-btn-primary h-11 gap-2"
            onClick={(e) => onOrder(e, work)}
          >
            立即下单生产
            <ChevronDown className="size-4 -rotate-90" />
          </Button>
        </div>

        {/* 分成说明 */}
        <p className="text-xs text-muted-foreground mt-3 text-center">
          本作品由创作者设计，下单后创作者将获得销售分成
        </p>
      </div>
    </div>
  );
}

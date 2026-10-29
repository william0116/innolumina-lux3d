import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ImagePlus,
  X,
  Upload,
  CheckCircle2,
  Sparkles,
  Tag,
  DollarSign,
  Eye,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Image } from '@/components/ui/image';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { STYLE_TAGS, ROYALTY_OPTIONS, MOCK_CREATORS } from '@/data/square';
import type { ISquareWork } from '@/data/square';
import { addMySquareWork } from '@/lib/square-storage';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface UploadWorkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (work: ISquareWork) => void;
}

export default function UploadWorkDialog({ open, onOpenChange, onSuccess }: UploadWorkDialogProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [dimensions, setDimensions] = useState('');
  const [material, setMaterial] = useState('高硼硅琉璃');
  const [basePrice, setBasePrice] = useState(299);
  const [royaltyRate, setRoyaltyRate] = useState(0.15);
  const [isPublic, setIsPublic] = useState(true);

  const resetForm = () => {
    setImages([]);
    setTitle('');
    setDescription('');
    setSelectedTags([]);
    setDimensions('');
    setMaterial('高硼硅琉璃');
    setBasePrice(299);
    setRoyaltyRate(0.15);
    setIsPublic(true);
    setStep('form');
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(resetForm, 300);
  };

  const handleImageUpload = () => {
    // 模拟上传 - 使用 inno.Studio 真实产品图作为占位
    const placeholders = [
      'https://aka.doubaocdn.com/s/OcXBD3ZduI',
      'https://aka.doubaocdn.com/s/S2UV8x8OJW',
      'https://aka.doubaocdn.com/s/MuSariB5Zi',
      'https://aka.doubaocdn.com/s/7rwGii02CN',
    ];
    if (images.length < 6) {
      const nextImg = placeholders[images.length % placeholders.length];
      setImages([...images, nextImg]);
      toast.success('图片上传成功');
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = () => {
    if (images.length === 0) {
      toast.error('请至少上传一张作品图片');
      return;
    }
    if (!title.trim()) {
      toast.error('请填写作品名称');
      return;
    }
    if (selectedTags.length === 0) {
      toast.error('请至少选择一个风格标签');
      return;
    }

    const newWork: ISquareWork = {
      id: `my-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || '暂无描述',
      images,
      creator: MOCK_CREATORS[0], // 模拟当前用户
      tags: selectedTags,
      priceMin: basePrice,
      priceMax: Math.round(basePrice * 1.8),
      basePrice,
      royaltyRate,
      likes: 0,
      favorites: 0,
      sales: 0,
      dimensions: dimensions || '80×80×50 mm',
      material,
      craft: '脱蜡铸造，手工打磨',
      createdAt: new Date().toISOString().split('T')[0],
      isPublic,
      status: isPublic ? 'reviewing' : 'private',
      revenue: 0,
      auditStatus: isPublic ? 'pending' : 'approved',
      auditedAt: isPublic ? undefined : new Date().toISOString().slice(0, 16).replace('T', ' '),
    };

    addMySquareWork(newWork);
    setStep('success');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden glass-card max-h-[90vh]">
        <AnimatePresence mode="wait">
          {step === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <DialogHeader className="px-6 py-5 border-b border-border/40">
                <DialogTitle className="glass-h2 text-xl flex items-center gap-2">
                  <Upload className="size-5 text-primary" />
                  上传我的作品
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  分享你的琉璃设计，让更多人看见并定制生产
                </DialogDescription>
              </DialogHeader>

              <div className="px-6 py-5 space-y-6 max-h-[65vh] overflow-y-auto">
                {/* 图片上传 */}
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <ImagePlus className="size-4 text-primary" />
                    作品图片（最多 6 张）
                  </Label>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                    {images.map((img, i) => (
                      <div key={i} className="relative aspect-square rounded-lg overflow-hidden group border border-border/50">
                        <Image src={img} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => removeImage(i)}
                          className="absolute top-1 right-1 size-6 rounded-full bg-background/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="size-3" />
                        </button>
                      </div>
                    ))}
                    {images.length < 6 && (
                      <button
                        onClick={handleImageUpload}
                        className="aspect-square rounded-lg border-2 border-dashed border-border/60 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
                      >
                        <ImagePlus className="size-6" />
                        <span className="text-xs">上传图片</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* 作品名称 */}
                <div>
                  <Label htmlFor="work-title" className="mb-2 block">
                    作品名称 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="work-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="给你的作品起个名字"
                    className="bg-background/50"
                    maxLength={30}
                  />
                </div>

                {/* 作品描述 */}
                <div>
                  <Label htmlFor="work-desc" className="mb-2 block">
                    作品描述
                  </Label>
                  <Textarea
                    id="work-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="介绍一下你的创作灵感、设计理念..."
                    className="bg-background/50 min-h-[80px] resize-none"
                    maxLength={200}
                  />
                  <div className="text-xs text-muted-foreground text-right mt-1">
                    {description.length}/200
                  </div>
                </div>

                {/* 风格标签 */}
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Tag className="size-4 text-primary" />
                    风格标签 <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {STYLE_TAGS.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={cn(
                          'px-3 py-1.5 rounded-full text-xs border transition-all',
                          selectedTags.includes(tag)
                            ? 'bg-primary/15 border-primary/40 text-primary'
                            : 'bg-background/50 border-border/50 text-muted-foreground hover:border-primary/30'
                        )}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 两列：尺寸 + 材质 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="work-dim" className="mb-2 block">建议尺寸</Label>
                    <Input
                      id="work-dim"
                      value={dimensions}
                      onChange={(e) => setDimensions(e.target.value)}
                      placeholder="如：80×80×50 mm"
                      className="bg-background/50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="work-mat" className="mb-2 block">材质说明</Label>
                    <Input
                      id="work-mat"
                      value={material}
                      onChange={(e) => setMaterial(e.target.value)}
                      placeholder="高硼硅琉璃"
                      className="bg-background/50"
                    />
                  </div>
                </div>

                {/* 定价设置 */}
                <div>
                  <Label className="flex items-center gap-2 mb-3">
                    <DollarSign className="size-4 text-primary" />
                    定价设置
                  </Label>
                  <div className="p-4 rounded-lg bg-muted/30 space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-foreground">基础价格</span>
                        <span className="text-sm font-bold text-warning glass-num-glow">¥{basePrice}</span>
                      </div>
                      <input
                        type="range"
                        min={99}
                        max={2999}
                        step={10}
                        value={basePrice}
                        onChange={(e) => setBasePrice(Number(e.target.value))}
                        className="w-full accent-primary"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>¥99</span>
                        <span>¥2999</span>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-foreground mb-2">分成比例</div>
                      <div className="grid grid-cols-3 gap-2">
                        {ROYALTY_OPTIONS.map((opt) => (
                          <button
                            key={opt.rate}
                            onClick={() => setRoyaltyRate(opt.rate)}
                            className={cn(
                              'p-3 rounded-lg border text-center transition-all',
                              royaltyRate === opt.rate
                                ? 'border-primary/50 bg-primary/10'
                                : 'border-border/50 hover:border-primary/30'
                            )}
                          >
                            <div className="text-lg font-bold text-primary">{opt.label}</div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">{opt.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Sparkles className="size-3 text-warning" />
                      预计单件收益：
                      <span className="text-warning font-medium">¥{Math.round(basePrice * royaltyRate)}</span>
                    </div>
                  </div>
                </div>

                {/* 公开设置 */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    {isPublic ? (
                      <Eye className="size-5 text-primary" />
                    ) : (
                      <Lock className="size-5 text-muted-foreground" />
                    )}
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        {isPublic ? '公开作品' : '私有作品'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {isPublic ? '所有人可见可下单' : '仅自己可见'}
                      </div>
                    </div>
                  </div>
                  <Switch checked={isPublic} onCheckedChange={setIsPublic} />
                </div>
              </div>

              {/* 底部按钮 */}
              <div className="px-6 py-4 border-t border-border/40 flex gap-3">
                <Button variant="outline" onClick={handleClose} className="flex-1">
                  取消
                </Button>
                <Button onClick={handleSubmit} className="flex-1 glass-btn-primary gap-2">
                  <Upload className="size-4" />
                  提交上传
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="py-12 px-6 text-center"
            >
              <div className="size-16 mx-auto mb-5 rounded-full bg-success/15 flex items-center justify-center">
                <CheckCircle2 className="size-8 text-success" />
              </div>
              <h3 className="text-xl font-semibold text-foreground glass-h2 mb-2">
                作品已上传
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
                {isPublic
                  ? '审核通过后将在作品广场公开展示，届时其他用户可直接下单生产'
                  : '作品已保存为私有状态，仅你可见'}
              </p>
              <Badge variant="outline" className="mb-6 border-warning/40 text-warning">
                {isPublic ? '审核中 · 预计 24 小时内完成' : '私有作品'}
              </Badge>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={handleClose}>
                  关闭
                </Button>
                <Button
                  onClick={() => {
                    handleClose();
                    navigate('/profile?tab=square-works');
                  }}
                  className="glass-btn-primary"
                >
                  查看我的作品
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

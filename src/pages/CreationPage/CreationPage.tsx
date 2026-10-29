import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Coins,
  History,
  Loader2,
  ZoomIn,
  Box,
  X,
  Upload,
  Image as ImageIcon,
  Type,
  Check,
  RefreshCw,
  Share2,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { capabilityClient } from '@lark-apaas/client-toolkit-lite';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Image } from '@/components/ui/image';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { getWorks, setWorks, upsertWork } from '@/lib/app-storage';
import { textTo3D, waitForTask, imageTo3DByUrl } from '@/lib/lux3d';
import type { IWork } from '@/data/glassmorphism';
import { INNO_REAL_IMAGES } from '@/data/showcase';
import { ROYALTY_OPTIONS } from '@/data/square';
import type { ISquareWork, ICreator } from '@/data/square';
import { publishWorkToSquare, approveWork, rejectWork } from '@/lib/square-storage';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const STYLE_PRESETS = [
  { label: '东方美学', prompt: '东方美学风格，琉璃器物，雅致内敛' },
  { label: '现代极简', prompt: '现代极简风格，琉璃器物，线条简洁' },
  { label: '自然意象', prompt: '自然意象风格，琉璃器物，有机形态' },
  { label: '几何抽象', prompt: '几何抽象风格，琉璃器物，多面切割' },
  { label: '赛博未来', prompt: '赛博朋克风格，琉璃器物，霓虹光效' },
  { label: '自然肌理', prompt: '自然肌理风格，琉璃器物，纹理细腻' },
];

const STYLE_REFERENCES = [
  {
    id: 'ref-zhuye',
    title: '竹叶浮雕八角匣',
    prompt: '四时物候系列竹叶浮雕八角琉璃匣，淡青色通透质感，极简留白，东方文人意趣',
    imageUrl: INNO_REAL_IMAGES.zhuyeBagua,
  },
  {
    id: 'ref-amber',
    title: '琥珀色委角匣',
    prompt: '四时物候系列琥珀色委角琉璃匣，磨砂通透质感，传统器型，浮雕花卉纹样，东方美学',
    imageUrl: INNO_REAL_IMAGES.amberWeijiao,
  },
  {
    id: 'ref-celadon',
    title: '淡青八角琉璃匣',
    prompt: '四时物候系列淡青色八角琉璃匣，浮雕竹兰纹样，清新淡雅，东方美学',
    imageUrl: INNO_REAL_IMAGES.celadonBagua,
  },
  {
    id: 'ref-blue',
    title: '淡蓝椭圆琉璃匣',
    prompt: '四时物候系列淡蓝色磨砂椭圆琉璃匣，银饰装饰，静谧如水，东方雅致',
    imageUrl: INNO_REAL_IMAGES.blueTuoyuan,
  },
  {
    id: 'ref-green-chang',
    title: '翠绿海棠长匣',
    prompt: '四时物候系列翠绿色海棠形长琉璃匣，清新生机，浮雕花卉，东方器物',
    imageUrl: INNO_REAL_IMAGES.greenChang,
  },
  {
    id: 'ref-amber-chang',
    title: '琥珀海棠长匣',
    prompt: '四时物候系列琥珀色海棠形长琉璃匣，温润如玉，暖调通透，东方雅致',
    imageUrl: INNO_REAL_IMAGES.amberChang,
  },
];

// 图生图模式下的示例参考图（点击快速填入）
const IMAGE_TO_IMAGE_SAMPLES = [
  {
    id: 'sample-begonia',
    title: '海棠形香插',
    url: INNO_REAL_IMAGES.begoniaIncense,
    prompt: '强化琉璃通透感，青绿色调，大理石纹理更细腻，东方美学',
  },
  {
    id: 'sample-zhuye',
    title: '竹叶八角匣',
    url: INNO_REAL_IMAGES.zhuyeBagua,
    prompt: '增强琉璃通透与玉质感，竹叶浮雕更清晰，青绿色调，东方雅致',
  },
  {
    id: 'sample-amber',
    title: '琥珀委角匣',
    url: INNO_REAL_IMAGES.amberWeijiao,
    prompt: '强化琥珀色琉璃通透质感，磨砂肌理更细腻，暖调温润',
  },
  {
    id: 'sample-blue',
    title: '淡蓝椭圆匣',
    url: INNO_REAL_IMAGES.blueTuoyuan,
    prompt: '增强淡蓝色琉璃通透感，磨砂肌理更柔和，静谧如水',
  },
];

const IMAGE_GEN_PLUGIN_ID = 'ai_glassware_image_generation_1';
const COST_TEXT_TO_IMAGE = 20;
const COST_IMAGE_TO_IMAGE = 30;

type GenMode = 'text' | 'image';

export default function CreationPage() {
  const navigate = useNavigate();
  const { state: authState, deductPoints, addPoints } = useAuth();
  const user = authState.user;
  const credit = user?.points ?? 0;
  const [mode, setMode] = useState<GenMode>('text');
  const [prompt, setPrompt] = useState(
    '一盏东方山水意象的琉璃台灯，通透青绿色调，山峦层叠造型'
  );
  const [generating, setGenerating] = useState(false);
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [imageAuditStatus, setImageAuditStatus] = useState<Array<'approved' | 'pending'>>([]); // 每张图机审结果
  const [works, setWorksState] = useState<IWork[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [publishTitle, setPublishTitle] = useState('');
  const [publishDesc, setPublishDesc] = useState('');
  const [publishRoyalty, setPublishRoyalty] = useState(0.15);
  const [publishing, setPublishing] = useState(false);

  // 图生图相关状态
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [referencePreview, setReferencePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cost = mode === 'text' ? COST_TEXT_TO_IMAGE : COST_IMAGE_TO_IMAGE;

  const refreshWorks = useCallback(() => {
    setWorksState(getWorks());
  }, []);

  useEffect(() => {
    refreshWorks();
  }, [user?.id]);

  const handleStyleClick = (stylePrompt: string) => {
    setPrompt((prev) => (prev ? `${prev}，${stylePrompt}` : stylePrompt));
  };

  // 图生图：文件选择
  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('请上传图片文件');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('图片大小不能超过 10MB');
      return;
    }
    setReferenceFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setReferencePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleRemoveReference = () => {
    setReferenceFile(null);
    setReferencePreview(null);
  };

  const handleSampleClick = (sample: { url: string; prompt: string }) => {
    // 示例图：直接用 URL 作为参考（不走 File，但 UI 上显示缩略图）
    setReferencePreview(sample.url);
    setReferenceFile(null);
    if (sample.prompt) {
      setPrompt((prev) => (prev ? `${prev}，${sample.prompt}` : sample.prompt));
    }
  };

  const handleGenerate = async () => {
    if (!user) {
      toast.error('请先登录');
      navigate('/login');
      return;
    }
    if (mode === 'text') {
      if (!prompt.trim()) {
        toast.error('请输入创意描述');
        return;
      }
    } else {
      if (!referencePreview) {
        toast.error('请先上传参考图');
        return;
      }
    }
    if (credit < cost) {
      toast.error('积分不足，请先充值');
      return;
    }

    // 先扣积分
    const deductDesc = mode === 'text' ? '文生琉璃图' : '图生琉璃图';
    const deducted = deductPoints(cost, mode === 'text' ? 'text_to_image' : 'image_to_image', `AI生成效果图（${deductDesc}）`);
    if (!deducted) return;

    setGenerating(true);
    let success = false;
    try {
      // 本地 Mock 生成效果图：根据 prompt 关键词匹配对应风格的预设图
      await new Promise(r => setTimeout(r, 2000)); // 模拟生成耗时

      // 预设图片库（按风格分类）
      const imagePool = {
        amber: [ // 琥珀色系
          'https://aka.doubaocdn.com/s/OcXBD3ZduI',
          'https://aka.doubaocdn.com/s/5Vf3Ioknni',
        ],
        green: [ // 青绿/翠绿色系
          'https://aka.doubaocdn.com/s/S2UV8x8OJW',
          'https://aka.doubaocdn.com/s/MuSariB5Zi',
          'https://aka.doubaocdn.com/s/SRfKds6g1J',
        ],
        blue: [ // 蓝色系
          'https://aka.doubaocdn.com/s/7rwGii02CN',
          'https://aka.doubaocdn.com/s/1MhRM9Eeqe',
        ],
        bamboo: [ // 竹叶/花卉纹样
          'https://aka.doubaocdn.com/s/ebuZ2qj5Qp',
          'https://aka.doubaocdn.com/s/vzu0aDGEEo',
        ],
        default: [ // 默认
          'https://aka.doubaocdn.com/s/OcXBD3ZduI',
          'https://aka.doubaocdn.com/s/S2UV8x8OJW',
          'https://aka.doubaocdn.com/s/MuSariB5Zi',
          'https://aka.doubaocdn.com/s/ebuZ2qj5Qp',
        ],
      };

      // 从 prompt 提取关键词
      const p = prompt.toLowerCase();
      let selectedPool: string[] = [];

      // 颜色匹配
      if (p.includes('琥珀') || p.includes('黄') || p.includes('橙')) {
        selectedPool.push(...imagePool.amber);
      }
      if (p.includes('青') || p.includes('绿') || p.includes('翠') || p.includes('玉')) {
        selectedPool.push(...imagePool.green);
      }
      if (p.includes('蓝') || p.includes('紫')) {
        selectedPool.push(...imagePool.blue);
      }
      // 纹样匹配
      if (p.includes('竹') || p.includes('花') || p.includes('梅') || p.includes('莲')) {
        selectedPool.push(...imagePool.bamboo);
      }

      // 如果没匹配到任何关键词，用默认池
      if (selectedPool.length === 0) {
        selectedPool = imagePool.default;
      }

      // 随机打乱并取前 4 张
      const shuffled = [...selectedPool].sort(() => Math.random() - 0.5);
      // 如果不够 4 张，从默认池补
      while (shuffled.length < 4) {
        shuffled.push(imagePool.default[shuffled.length % imagePool.default.length]);
      }
      const images = shuffled.slice(0, 4);

      setCurrentImages(images);

      // 机审：每张图 5% 概率标记为需人工审核
      const auditResults = images.map(() =>
        Math.random() < 0.05 ? 'pending' : 'approved'
      );
      setImageAuditStatus(auditResults);

      // 保存作品
      const workPrompt = mode === 'text'
        ? prompt
        : `【图生图】${prompt || '参考图转化为琉璃材质'}`;

      const now = new Date();
      const nowStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const newWork: IWork = {
        id: `w${Date.now()}`,
        prompt: workPrompt,
        style: STYLE_PRESETS.find((s) => prompt.includes(s.label))?.label || '自定义',
        source: mode,
        images,
        selectedIndex: 0,
        model3d: null,
        inspectionReport: null,
        createdAt: nowStr,
      };
      const all = getWorks();
      all.unshift(newWork);
      setWorks(all);
      setWorksState(all);

      success = true;
      toast.success(`生成成功，已消耗 ${cost} 积分`);
    } catch (err) {
      // 失败返还积分
      addPoints(cost, 'refund', '生成失败返还');
      toast.error('生成失败，积分已返还');
    } finally {
      setGenerating(false);
    }
  };

  const handleSelect = (index: number) => {
    setSelectedIndex((prev) => (prev === index ? null : index));
    // 同步到最新作品
    const latest = getWorks()[0];
    if (latest && latest.images.length > index) {
      const updated = { ...latest, selectedIndex: index };
      const all = getWorks();
      const idx = all.findIndex((w) => w.id === latest.id);
      if (idx >= 0) all[idx] = updated;
      setWorks(all);
    }
  };

  const [convertingTo3D, setConvertingTo3D] = useState(false);
  const [modelVersion, setModelVersion] = useState<'G1' | 'G1-Turbo'>('G1-Turbo');

  const handleTo3D = async () => {
    if (selectedIndex === null) {
      toast.warning('请先选择一张作品');
      return;
    }
    const latest = getWorks()[0];
    if (!latest) {
      toast.info('请先生成效果图');
      return;
    }

    setConvertingTo3D(true);
    try {
      // 调用 Lux3D 图生3D 极速版生成模型（用选中的效果图）
      const imageUrl = latest.images[selectedIndex] || latest.images[0];
      if (!imageUrl) throw new Error('没有可用的图片');

      toast.info(`正在调用 AI 生成 3D 模型（${modelVersion === 'G1-Turbo' ? '极速版·约20秒' : '标准版·约3分钟'}）...`);
      const taskId = await imageTo3DByUrl(imageUrl, modelVersion);
      const result = await waitForTask(taskId);
      const modelUrl = result.outputs?.[0]?.content;

      if (!modelUrl) throw new Error('未获取到模型 URL');

      // 更新作品数据，保存 3D 模型信息
      const updated = {
        ...latest,
        model3d: {
          url: modelUrl,
          fileName: `lux3d_${taskId}.glb`,
          dimensions: { width: 100, height: 100, depth: 100 },
          faceCount: 0,
        },
      };
      const all = getWorks();
      const idx = all.findIndex((w) => w.id === latest.id);
      if (idx >= 0) all[idx] = updated;
      setWorks(all);

      toast.success('3D 模型生成完成');
      navigate(`/preview/${latest.id}`);
    } catch (err) {
      toast.error(`3D 生成失败: ${err instanceof Error ? err.message : '未知错误'}`);
      // 失败时仍跳转到预览页，展示占位模型
      navigate(`/preview/${latest.id}`);
    } finally {
      setConvertingTo3D(false);
    }
  };

  const handleRegenerate = () => {
    setCurrentImages([]);
    setSelectedIndex(null);
  };

  const handlePublish = () => {
    if (!publishTitle.trim()) {
      toast.error('请输入作品标题');
      return;
    }
    if (selectedIndex === null || !user) return;

    const auditStatus = imageAuditStatus[selectedIndex];
    // 机审不通过的作品直接提示，不进入发布流程
    if (auditStatus === 'pending') {
      toast.info('该作品需人工审核后才能发布，已提交审核，请耐心等待');
      setPublishDialogOpen(false);
      return;
    }

    setPublishing(true);

    // 构造创作者信息
    const creator: ICreator = {
      id: user.id,
      name: user.nickname,
      avatar: user.avatar,
      bio: '',
      followers: 0,
    };

    const imageUrl = currentImages[selectedIndex];
    const now = new Date();
    const nowStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const work: ISquareWork = {
      id: `sq-${Date.now()}`,
      title: publishTitle.trim(),
      description: publishDesc.trim() || 'AI 生成琉璃作品',
      images: [imageUrl],
      creator,
      tags: [STYLE_PRESETS.find((s) => prompt.includes(s.label))?.label || '自定义'],
      priceMin: 199,
      priceMax: 599,
      basePrice: 199,
      royaltyRate: publishRoyalty,
      likes: 0,
      favorites: 0,
      sales: 0,
      dimensions: '按定制需求',
      material: '高硼硅琉璃',
      craft: '脱蜡铸造',
      createdAt: nowStr,
      isPublic: true,
      status: 'published',
      auditStatus: 'pending', // 进入审核中
      revenue: 0,
    };

    // 提交发布（进入待审核状态）
    publishWorkToSquare(work);
    toast.success('作品已提交审核，预计 1-3 个工作日完成');
    setPublishDialogOpen(false);
    setPublishTitle('');
    setPublishDesc('');
    setPublishing(false);

    // 模拟审核：2 秒后自动通过（95%概率）或拒绝（5%概率）
    setTimeout(() => {
      if (Math.random() < 0.05) {
        rejectWork(work.id, '内容不符合社区规范，请修改后重新提交');
      } else {
        approveWork(work.id);
      }
    }, 2000);
  };

  // 切换模式时清空结果和参考图
  const handleModeChange = (newMode: GenMode) => {
    if (newMode === mode) return;
    setMode(newMode);
    setCurrentImages([]);
    if (newMode === 'image') {
      setPrompt('');
    } else {
      setPrompt('一盏东方山水意象的琉璃台灯，通透青绿色调，山峦层叠造型');
      setReferenceFile(null);
      setReferencePreview(null);
    }
  };

  return (
    <div className="min-h-screen bg-background page-rise-in">
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-8">
        <div className="mb-8">
           <h1 className="text-3xl md:text-[28px] font-bold text-foreground mb-3 font-['Noto_Serif_SC'] tracking-[0.08em]">
             AI 创作工作台
           </h1>
           <p className="text-muted-foreground text-sm leading-[1.8]">
             输入创意描述或上传参考图，AI 将为你生成独一无二的琉璃器物设计方案
           </p>
         </div>

        <div className="grid grid-cols-12 gap-6">
          {/* 左侧：创意输入区 */}
          <div className="col-span-12 lg:col-span-3 space-y-4">
            <Card className="bg-white border-border shadow-sm glass-edge-glow">
              <CardContent className="p-5 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-5 text-primary" />
                    <h2 className="font-semibold text-foreground font-['Noto_Serif_SC'] tracking-wider">创意词</h2>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Coins className="size-4 text-warning" />
                    <span className="tabular-nums font-medium glass-num-glow">{credit}</span>
                  </div>
                </div>

                {/* 模式切换 */}
                <Tabs
                  value={mode}
                  onValueChange={(v) => handleModeChange(v as GenMode)}
                  className="w-full"
                >
                  <TabsList className="w-full grid grid-cols-2 bg-muted/50 h-9 p-1 border border-border">
                    <TabsTrigger value="text" className="gap-1.5 text-xs h-7 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">
                      <Type className="size-3.5" />
                      文生图
                    </TabsTrigger>
                    <TabsTrigger value="image" className="gap-1.5 text-xs h-7 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">
                      <ImageIcon className="size-3.5" />
                      图生图
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                <AnimatePresence mode="wait">
                  {mode === 'text' ? (
                    <motion.div
                      key="text-mode"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-4"
                    >
                       <div className="space-y-2">
                         <label className="text-xs text-muted-foreground font-medium tracking-wide">创意描述</label>
                         <Textarea
                           value={prompt}
                           onChange={(e) => setPrompt(e.target.value)}
                           placeholder="描述你想要的琉璃器物，例如：一盏东方山水意象的琉璃台灯，通透青绿色调，山峦层叠造型"
                           className="min-h-[140px] resize-none bg-white border-border text-sm focus-visible:ring-accent/40 focus-visible:border-accent/60 rounded-lg"
                         />
                       </div>

                      <div className="space-y-2">
                        <label className="text-xs text-muted-foreground font-medium tracking-wide">风格预设</label>
                        <div className="flex flex-wrap gap-2">
                           {STYLE_PRESETS.map((s) => (
                             <Badge
                               key={s.label}
                               variant="secondary"
                               className="cursor-pointer hover:bg-accent/20 hover:text-accent transition-all duration-300 text-xs bg-accent/10 text-accent border-0"
                               onClick={() => handleStyleClick(s.prompt)}
                             >
                               {s.label}
                             </Badge>
                           ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                         <label className="text-xs text-muted-foreground font-medium tracking-wide">inno.Studio 风格参考</label>
                          <span className="text-[10px] text-muted-foreground/70">点击加载灵感</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {STYLE_REFERENCES.map((ref) => (
                             <button
                               key={ref.id}
                               type="button"
                               onClick={() => handleStyleClick(ref.prompt)}
                               className="relative rounded-lg overflow-hidden aspect-square group border border-border hover:border-accent/60 transition-all duration-500 bg-white"
                               title={ref.title}
                             >
                               <Image
                                 src={ref.imageUrl}
                                 alt={ref.title}
                                 className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                               />
                               <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                               <div className="absolute bottom-1 left-1 right-1">
                                 <p className="text-[10px] font-medium text-foreground line-clamp-1">
                                   {ref.title}
                                 </p>
                               </div>
                             </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="image-mode"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-4"
                    >
                      {/* 参考图上传区 */}
                      <div className="space-y-2">
                        <label className="text-xs text-muted-foreground font-medium tracking-wide">参考图上传</label>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileSelect(file);
                          }}
                        />
                        {!referencePreview ? (
                           <div
                             className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
                               isDragging
                                 ? 'border-accent bg-accent/5'
                                 : 'border-border bg-muted/30 hover:border-accent/60 hover:bg-accent/5'
                             }`}
                             onDragOver={(e) => {
                               e.preventDefault();
                               setIsDragging(true);
                             }}
                             onDragLeave={() => setIsDragging(false)}
                             onDrop={handleDrop}
                             onClick={() => fileInputRef.current?.click()}
                           >
                             <div className="size-12 rounded-full bg-gradient-to-br from-primary/15 to-accent/10 flex items-center justify-center mb-3">
                               <Upload className="size-5 text-primary" />
                             </div>
                             <p className="text-xs text-foreground font-medium mb-1">
                               点击或拖拽上传
                             </p>
                             <p className="text-[10px] text-muted-foreground text-center">
                               支持 inno.Studio 产品图、设计草图、器物照片等
                             </p>
                           </div>
                         ) : (
                           <div className="relative rounded-xl overflow-hidden border border-border bg-white shadow-sm">
                             <div className="aspect-square overflow-hidden">
                               <Image
                                 src={referencePreview}
                                 alt="参考图预览"
                                 className="w-full h-full object-contain p-2"
                               />
                             </div>
                             <Button
                               size="icon"
                               variant="secondary"
                               className="!absolute top-2 right-2 z-20 h-7 w-7 rounded-full bg-white/90 border border-border hover:bg-white"
                               onClick={handleRemoveReference}
                               aria-label="删除参考图"
                             >
                               <X className="h-4 w-4" />
                             </Button>
                             <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-white/95 to-transparent">
                               <p className="text-[10px] text-muted-foreground text-center">
                                 已上传参考图，点击右上角可更换
                               </p>
                             </div>
                           </div>
                         )}
                        <p className="text-[10px] text-muted-foreground/70 text-center">
                          上传参考图，AI 将其转化为琉璃材质效果图
                        </p>
                      </div>

                      {/* 示例参考图 */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs text-muted-foreground font-medium tracking-wide">示例参考图</label>
                          <span className="text-[10px] text-muted-foreground/70">点击快速使用</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {IMAGE_TO_IMAGE_SAMPLES.map((sample) => (
                             <button
                               key={sample.id}
                               type="button"
                               onClick={() => handleSampleClick(sample)}
                               className="relative rounded-lg overflow-hidden aspect-square group border border-border hover:border-accent/60 transition-all duration-500 bg-white"
                               title={sample.title}
                             >
                               <Image
                                 src={sample.url}
                                 alt={sample.title}
                                 className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                               />
                               <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                               <div className="absolute bottom-1 left-1 right-1">
                                 <p className="text-[10px] font-medium text-foreground line-clamp-1">
                                   {sample.title}
                                 </p>
                               </div>
                             </button>
                          ))}
                        </div>
                      </div>

                      {/* 创意描述（可选） */}
                      <div className="space-y-2">
                        <label className="text-xs text-muted-foreground">
                          创意描述 <span className="text-muted-foreground/50">（可选）</span>
                        </label>
                         <Textarea
                           value={prompt}
                           onChange={(e) => setPrompt(e.target.value)}
                           placeholder="可选：补充描述琉璃材质、颜色、风格等，例如：青绿色通透琉璃，东方山水意象"
                           className="min-h-[80px] resize-none bg-white border-border text-sm focus-visible:ring-accent/40 focus-visible:border-accent/60 rounded-lg"
                         />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs text-muted-foreground font-medium tracking-wide">风格预设</label>
                        <div className="flex flex-wrap gap-2">
                           {STYLE_PRESETS.map((s) => (
                             <Badge
                               key={s.label}
                               variant="secondary"
                               className="cursor-pointer hover:bg-accent/20 hover:text-accent transition-all duration-300 text-xs bg-accent/10 text-accent border-0"
                               onClick={() => handleStyleClick(s.prompt)}
                             >
                               {s.label}
                             </Badge>
                           ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button
                  onClick={handleGenerate}
                  disabled={
                    generating ||
                    (mode === 'text' ? !prompt.trim() : !referencePreview)
                  }
                  className="w-full h-11 gap-2 glass-btn-primary font-medium rounded-lg"
                >
                  {generating ? (
                    <>
                      <Loader2 className="size-4 animate-spin glass-loader-ring" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-4" />
                      生成效果图（消耗 {cost} 积分）
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  每次生成 4 张不同方案，可选择心仪作品转 3D 模型
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 中间：生成结果区 */}
          <div className="col-span-12 lg:col-span-6">
            <Card className="bg-white border-border shadow-sm glass-edge-glow h-full">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-foreground font-['Noto_Serif_SC'] tracking-wider">生成结果</h2>
                  {generating && (
                    <div className="flex items-center gap-2 text-xs text-primary">
                      <Loader2 className="size-3 animate-spin glass-loader-ring" />
                      AI 正在创作中...
                    </div>
                  )}
                </div>

                {/* 流程引导提示 */}
                {currentImages.length > 0 && !generating && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      'mb-4 p-3 rounded-lg text-sm flex items-center gap-2',
                      selectedIndex === null
                        ? 'bg-muted/50 text-muted-foreground border border-border'
                        : 'bg-[#C4A96B]/10 text-foreground border border-[#C4A96B]/30'
                    )}
                  >
                    <Info className={cn('size-4 shrink-0', selectedIndex !== null && 'text-[#C4A96B]')} />
                    <span>
                      {selectedIndex === null
                        ? '请选择一张满意的作品，继续下一步'
                        : `已选中第 ${selectedIndex + 1} 张，可转 3D 模型或发布到广场`}
                    </span>
                  </motion.div>
                )}

                {currentImages.length === 0 && !generating ? (
                  <div className="aspect-square flex flex-col items-center justify-center text-center p-8 border border-dashed border-border rounded-xl bg-muted/20 relative overflow-hidden">
                    <div className="absolute inset-0 -z-10">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-accent/8 rounded-full blur-[100px] opacity-50" />
                    </div>
                    <div className="size-16 rounded-full bg-gradient-to-br from-primary/15 to-accent/10 flex items-center justify-center mb-4">
                      <Sparkles className="size-8 text-primary/70" />
                    </div>
                    <p className="text-muted-foreground mb-1">
                      {mode === 'text' ? '输入你的创意描述' : '上传参考图开始创作'}
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                      点击「生成效果图」开始 AI 创作
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <AnimatePresence mode="popLayout">
                      {(generating ? [0, 1, 2, 3] : currentImages).map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3, delay: i * 0.1 }}
                          className="relative group rounded-xl overflow-hidden border border-border bg-white shadow-sm"
                        >
                           {generating ? (
                             <div className="aspect-square relative overflow-hidden bg-muted/30">
                               <div className="absolute inset-0" style={{
                                 background: 'linear-gradient(90deg, hsl(40 20% 94%) 0%, hsl(40 15% 90%) 50%, hsl(40 20% 94%) 100%)',
                                 backgroundSize: '200% 100%',
                                 animation: 'shimmer 1.5s infinite',
                               }} />
                               <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
                                 <Loader2 className="size-8 text-primary/70 animate-spin" />
                                 <p className="text-xs text-muted-foreground">生成中...</p>
                               </div>
                             </div>
                            ) : (
                             <button
                               type="button"
                               onClick={() => handleSelect(i)}
                               className={cn(
                                 'relative w-full aspect-square overflow-hidden rounded-lg transition-all duration-300 text-left',
                                 selectedIndex === i
                                   ? 'ring-2 ring-[#C4A96B] ring-offset-2 ring-offset-white shadow-lg scale-[1.02]'
                                   : 'border border-border hover:border-primary/40'
                               )}
                             >
                               <Image
                                 src={currentImages[i]}
                                 alt={`方案 ${i + 1}`}
                                 className={cn(
                                   'w-full h-full object-cover transition-all duration-500',
                                   selectedIndex !== null && selectedIndex !== i && 'opacity-50 grayscale-[30%]'
                                 )}
                               />
                                {/* 已选角标 */}
                                {selectedIndex === i && (
                                  <div className="absolute top-2 right-2 size-6 rounded-full bg-[#C4A96B] text-white flex items-center justify-center shadow-md z-10">
                                    <Check className="size-3.5" />
                                  </div>
                                )}
                                {/* 审核状态角标（右下角，半透明小字） */}
                                {imageAuditStatus[i] === 'pending' ? (
                                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-[#C49A3A]/90 text-white text-[10px] font-medium tracking-wide backdrop-blur-sm z-10 shadow-sm">
                                    需人工审核
                                  </div>
                                ) : (
                                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-[#4A7C59]/70 text-white text-[10px] font-medium tracking-wide backdrop-blur-sm z-10 shadow-sm opacity-60">
                                    已通过机审
                                  </div>
                                )}
                               {/* 方案号 */}
                               <div className="absolute top-2 left-2">
                                 <Badge className={cn(
                                   'text-xs border',
                                   selectedIndex === i
                                     ? 'bg-[#C4A96B] text-white border-[#C4A96B]'
                                     : 'bg-white/90 text-foreground border-border'
                                 )}>
                                   方案 {i + 1}
                                 </Badge>
                               </div>
                               {/* hover 预览按钮 */}
                               <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                 <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-center gap-2">
                                   <Button
                                     size="sm"
                                     variant="outline"
                                     className="h-8 text-xs gap-1 bg-white/90 border-border pointer-events-auto"
                                     onClick={(e) => {
                                       e.stopPropagation();
                                       setPreviewImage(currentImages[i]);
                                     }}
                                   >
                                     <ZoomIn className="size-3" />
                                     预览
                                   </Button>
                                 </div>
                               </div>
                             </button>
                           )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 右侧：历史作品 */}
          <div className="col-span-12 lg:col-span-3">
            <Card className="bg-white border-border shadow-sm glass-edge-glow h-full">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <History className="size-5 text-primary" />
                    <h2 className="font-semibold text-foreground font-['Noto_Serif_SC'] tracking-wide">历史作品</h2>
                  </div>
                  <Badge variant="outline" className="text-[10px] h-4 px-1.5 bg-muted/50 border-border text-muted-foreground">
                    共 {works.length} 件
                  </Badge>
                </div>
                <ScrollArea className="h-[600px] pr-2 -mr-2">
                  <div className="space-y-3">
                      {works.length === 0 && (
                        <div className="py-8 text-center">
                          <div className="size-10 mx-auto mb-2 rounded-full bg-muted/50 flex items-center justify-center">
                            <Sparkles className="size-4 text-muted-foreground/50" />
                          </div>
                          <p className="text-sm text-muted-foreground">暂无历史作品</p>
                          <p className="text-xs text-muted-foreground/60 mt-1">生成作品后会自动保存在这里</p>
                        </div>
                      )}
                    {works.map((work) => (
                      <motion.div
                        key={work.id}
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                        className="flex gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors border border-transparent hover:border-border"
                        onClick={() => {
                          setCurrentImages(work.images);
                          if (work.model3d) {
                            navigate(`/preview/${work.id}`);
                          }
                        }}
                      >
                        <div className="size-16 rounded-lg overflow-hidden shrink-0 relative border border-border">
                          <Image
                            src={work.images[0]}
                            alt={work.prompt}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-1 left-1">
                            <Badge
                              className="text-[9px] h-4 px-1 bg-white/90 text-primary border-border"
                              variant="outline"
                            >
                              {work.source === 'image' ? '图生' : '文生'}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <p className="text-xs text-foreground line-clamp-2 leading-relaxed">
                            {work.prompt}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="secondary"
                              className="text-[10px] h-4 px-1.5 bg-accent/10 text-accent border-0"
                            >
                              {work.style}
                            </Badge>
                            {work.model3d && (
                              <Badge
                                variant="secondary"
                                className="text-[10px] h-4 px-1.5 bg-primary/10 text-primary border-0"
                              >
                                已有3D
                              </Badge>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground">
                            {work.createdAt}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* 图片预览 Dialog */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-3xl p-0 bg-transparent border-0 shadow-none">
          <div className="relative">
            {previewImage && (
              <Image
                src={previewImage}
                alt="预览"
                className="w-full rounded-xl"
              />
            )}
            <DialogClose asChild>
                 <Button
                   size="icon"
                   variant="outline"
                   className="absolute top-3 right-3 size-9 rounded-full bg-white/90 backdrop-blur-sm border-border hover:bg-white"
                 >
                <X className="size-4" />
              </Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>

      {/* 底部固定操作栏 */}
      <AnimatePresence>
        {selectedIndex !== null && currentImages.length > 0 && !generating && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-white/95 backdrop-blur-xl shadow-[0_-4px_20px_rgba(44_62_58_0.08)]"
          >
            <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-12 rounded-lg overflow-hidden shrink-0 border border-border">
                  <Image
                    src={currentImages[selectedIndex]}
                    alt="选中作品"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    已选方案 {selectedIndex + 1}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    琉璃器物设计效果图
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="ghost"
                  onClick={handleRegenerate}
                  className="gap-1.5 text-muted-foreground hover:text-foreground h-10"
                >
                  <RefreshCw className="size-4" />
                  重新生成
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPublishDialogOpen(true)}
                  className="gap-1.5 h-10 border-border bg-white"
                >
                  <Share2 className="size-4" />
                  发布到广场
                </Button>
                {/* 3D 精度选择 */}
                <div className="flex items-center gap-1 mr-1">
                  <button
                    onClick={() => setModelVersion('G1-Turbo')}
                    disabled={convertingTo3D}
                    className={`px-2.5 py-1 text-xs rounded-md transition-all ${
                      modelVersion === 'G1-Turbo'
                        ? 'bg-primary text-primary-foreground font-medium'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    极速版
                  </button>
                  <button
                    onClick={() => setModelVersion('G1')}
                    disabled={convertingTo3D}
                    className={`px-2.5 py-1 text-xs rounded-md transition-all ${
                      modelVersion === 'G1'
                        ? 'bg-primary text-primary-foreground font-medium'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    标准版
                  </button>
                </div>
                <Button
                  onClick={handleTo3D}
                  disabled={convertingTo3D}
                  className="gap-1.5 h-10 text-white"
                  style={{ background: '#2C3E3A' }}
                >
                  {convertingTo3D ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Box className="size-4" />
                  )}
                  {convertingTo3D ? '生成3D中...' : '转 3D 模型'}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 发布到广场弹窗 */}
      <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <DialogContent className="max-w-lg bg-white border-border">
          <DialogHeader>
            <DialogTitle className="font-['Noto_Serif_SC'] tracking-wider font-semibold text-lg">
              发布作品到广场
            </DialogTitle>
            <DialogDescription className="text-xs">
              发布后其他用户可浏览并下单定制，您将获得相应比例的创作分成
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* 预览 */}
            <div className="flex gap-3 p-3 bg-muted/30 rounded-lg">
              <div className="size-20 rounded-lg overflow-hidden shrink-0 border border-border">
                {selectedIndex !== null && (
                  <Image src={currentImages[selectedIndex]} alt="作品预览" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-1">发布缩略图</p>
                <p className="text-sm font-medium text-foreground truncate">方案 {selectedIndex !== null ? selectedIndex + 1 : 0}</p>
                <p className="text-xs text-muted-foreground mt-1">建议补充标题和描述以获得更多曝光</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground font-medium">作品标题 *</Label>
              <Input
                value={publishTitle}
                onChange={(e) => setPublishTitle(e.target.value)}
                placeholder="给作品起一个好听的名字"
                className="h-9 bg-white border-border"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground font-medium">作品描述</Label>
              <Textarea
                value={publishDesc}
                onChange={(e) => setPublishDesc(e.target.value)}
                placeholder="简要描述创作灵感、材质工艺、适用场景等"
                className="min-h-[80px] resize-none bg-white border-border text-sm"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-xs text-muted-foreground font-medium">创作者分成比例</Label>
              <RadioGroup
                value={String(publishRoyalty)}
                onValueChange={(v) => setPublishRoyalty(parseFloat(v))}
                className="grid grid-cols-3 gap-2"
              >
                {ROYALTY_OPTIONS.map((opt) => (
                  <div key={opt.rate}>
                    <RadioGroupItem
                      value={String(opt.rate)}
                      id={`royalty-${opt.rate}`}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={`royalty-${opt.rate}`}
                      className="flex flex-col items-center gap-1 p-3 rounded-lg border border-border cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all peer-data-[state=checked]:border-[#C4A96B] peer-data-[state=checked]:bg-[#C4A96B]/5"
                    >
                      <span className="text-lg font-bold text-foreground">{opt.label}</span>
                      <span className="text-[10px] text-muted-foreground text-center leading-relaxed">
                        {opt.desc}
                      </span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="rounded-lg">取消</Button>
            </DialogClose>
            <Button
              onClick={handlePublish}
              disabled={publishing || !publishTitle.trim()}
              className="rounded-lg gap-1.5"
              style={{ background: '#2C3E3A' }}
            >
              {publishing ? <Loader2 className="size-4 animate-spin" /> : <Share2 className="size-4" />}
              {publishing ? '发布中...' : '提交发布'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

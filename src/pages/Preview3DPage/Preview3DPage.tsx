import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Download,
  Package,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RotateCw,
  Pause,
  Play,
  FileCode,
  Info,
  ChevronDown,
  ChevronUp,
  Loader2,
  Sparkles,
  Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Glass3DViewer from '@/components/Glass3DViewer';
import { ErrorBoundary } from 'react-error-boundary';
import { getWorkById, upsertWork } from '@/lib/app-storage';
import { getUser, updateUserPoints, addPointRecord, genId } from '@/lib/app-storage';
import { MOCK_WORKS } from '@/data/glassmorphism';
import type { IWork } from '@/data/glassmorphism';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { textTo3D, waitForTask, imageTo3DByUrl } from '@/lib/lux3d';

// 工艺校验项定义
interface InspectionItem {
  name: string;
  status: 'pass' | 'warning' | 'fail';
  value: string;
  detail: string;
}

const MODEL_INFO = {
  dimensions: '85 × 85 × 45',
  dimensionUnit: 'mm',
  faceCount: 12480,
  volume: 186.5,
  volumeUnit: 'cm³',
  weight: 447.6,
  weightUnit: 'g',
  density: '2.4 g/cm³（高硼硅琉璃）',
  castDuration: '7-10 天',
  fileName: 'octagon_bamboo_box.stl',
  fileSize: '2.4 MB',
};

function getInspectionItems(): InspectionItem[] {
  return [
    {
      name: '壁厚检测',
      status: 'pass',
      value: '最小壁厚 3.2mm',
      detail: '器壁均匀，棱角处过渡自然；最薄位置在八角棱边，仍满足铸造最小壁厚 2.5mm 要求。',
    },
    {
      name: '脱模分析',
      status: 'pass',
      value: '无倒扣结构',
      detail: '整体形态正八棱柱体，分型面位于底面，脱模方向垂直向上，无倒扣死角，模具制造简单。',
    },
    {
      name: '尺寸范围',
      status: 'pass',
      value: '最大尺寸 85mm',
      detail: '属于标准小件器物尺寸，脱蜡铸造良率高，无需分段铸造。',
    },
    {
      name: '重量预估',
      status: 'pass',
      value: '447.6 g',
      detail: '按琉璃密度 2.4g/cm³ 计算，单重约 447.6g，单炉可容纳 6-8 件，生产效率良好。',
    },
    {
      name: '网格质量',
      status: 'pass',
      value: '无非流形边',
      detail: '三角网格拓扑结构完整，零破面、零非流形边、零重复顶点，可直接用于 3D 打印与铸造。',
    },
    {
      name: '镂空占比',
      status: 'warning',
      value: '镂空占比 18%',
      detail: '竹叶浮雕纹样凹陷深度约 1.5mm，整体镂空占比约 18%，略高于建议的 15% 阈值。建议：铸造前可适当减浅浮雕深度，或在纹样背面加支撑筋以防止浇注时变形。',
    },
  ];
}

export default function Preview3DPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [work, setWork] = useState<IWork | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({ 5: true });
  const [modelColor, setModelColor] = useState('#A8D8D0');
  const [generating3D, setGenerating3D] = useState(false);
  const [modelVersion, setModelVersion] = useState<'G1' | 'G1-Turbo'>('G1-Turbo');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [generatingStage, setGeneratingStage] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);

  const inspectionItems = useMemo(() => getInspectionItems(), []);

  const overallStatus = useMemo(() => {
    if (inspectionItems.some((i) => i.status === 'fail')) return 'fail';
    if (inspectionItems.some((i) => i.status === 'warning')) return 'warning';
    return 'pass';
  }, [inspectionItems]);

  const passCount = inspectionItems.filter((i) => i.status === 'pass').length;
  const warningCount = inspectionItems.filter((i) => i.status === 'warning').length;
  const failCount = inspectionItems.filter((i) => i.status === 'fail').length;

  useEffect(() => {
    const found = getWorkById(id) || MOCK_WORKS.find((w) => w.id === id) || MOCK_WORKS[0];
    if (found) {
      setWork(found);
      // 根据风格选择模型颜色
      if (found.style.includes('琥珀')) {
        setModelColor('#D4B87A');
      } else if (found.style.includes('绿') || found.style.includes('青')) {
        setModelColor('#A8D8D0');
      } else if (found.style.includes('蓝')) {
        setModelColor('#A8C5E0');
      }
    }
  }, [id]);

  const toggleItem = (idx: number) => {
    setExpandedItems((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleDownloadGLB = async () => {
    if (!work?.model3d?.url) {
      toast.warning('请先生成 3D 模型');
      return;
    }
    try {
      toast.info('正在下载 GLB 模型...');
      // 直接下载 GLB 文件
      const a = document.createElement('a');
      a.href = work.model3d.url;
      a.download = work.model3d.fileName || 'model.glb';
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success('GLB 模型已开始下载');
    } catch (err) {
      toast.error(`下载失败: ${err instanceof Error ? err.message : '未知错误'}`);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 压缩图片到 1024px 以内，质量 80%，减小 base64 体积
    const img = new Image();
    const reader = new FileReader();
    reader.onload = () => {
      img.src = reader.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 1024;
        let { width, height } = img;
        if (width > height && width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        } else if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.8);
        setUploadedImage(compressed);
        toast.success('参考图已上传，点「生成3D模型」开始生成');
      };
    };
    reader.readAsDataURL(file);
  };

  const handleRegenerate3D = async () => {
    if (!work || generating3D) return;
    setGenerating3D(true);
    setGeneratingStage('正在分析参考图片...');
    try {
      // 优先使用用户上传的参考图，否则用作品原图
      let imageUrl: string;
      if (uploadedImage) {
        imageUrl = uploadedImage;
      } else {
        imageUrl = work.images[work.selectedIndex] || work.images[0];
      }
      if (!imageUrl) throw new Error('没有参考图');

      setGeneratingStage(`正在提交生成任务（${modelVersion === 'G1-Turbo' ? '极速版' : '标准版'}）...`);
      const taskId = await imageTo3DByUrl(imageUrl, modelVersion);

      // 分阶段轮询任务状态
      const stages = [
        '正在生成 3D 网格...',
        '正在计算材质贴图...',
        '正在优化模型细节...',
      ];
      let stageIdx = 0;
      const stageTimer = setInterval(() => {
        if (stageIdx < stages.length) {
          setGeneratingStage(stages[stageIdx]);
          stageIdx++;
        }
      }, 8000);

      const result = await waitForTask(taskId, (status) => {
        if (status === 1) setGeneratingStage(stages[Math.min(stageIdx, stages.length - 1)]);
      });

      clearInterval(stageTimer);
      setGeneratingStage('正在加载模型...');

      const modelUrl = result.outputs?.[0]?.content;
      if (!modelUrl) throw new Error('未获取到模型 URL');

      // 更新作品数据
      const updated: IWork = {
        ...work,
        model3d: {
          url: modelUrl,
          fileName: `lux3d_${taskId}.glb`,
          dimensions: { width: 100, height: 100, depth: 100 },
          faceCount: 0,
        },
      };
      setWork(updated);
      upsertWork(updated);
      toast.success('3D 模型生成完成！');
      // 显示成功提示，3 秒后自动消失
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      toast.error(`生成失败: ${err instanceof Error ? err.message : '未知错误'}`);
    } finally {
      setGenerating3D(false);
      setGeneratingStage('');
    }
  };

  const handleOrder = (type: 'resin' | 'glass') => {
    if (!work) return;
    // 积分扣减校验（新系统：从用户对象取积分）
    const cost = type === 'resin' ? 80 : 0;
    const user = getUser();
    const balance = user?.points || 0;
    if (cost > 0 && balance < cost) {
      toast.error('积分不足，请先充值');
      return;
    }
    if (cost > 0) {
      const newBalance = balance - cost;
      updateUserPoints(newBalance);
      addPointRecord({
        type: 'consume',
        amount: cost,
        description: type === 'resin' ? '3D打印树脂母模定制 ×1次' : '琉璃成品定制 ×1次',
        createdAt: new Date().toLocaleString('zh-CN'),
      });
    }
    // 确保作品已保存
    if (!work.model3d) {
      const updated: IWork = {
        ...work,
        model3d: {
          url: MODEL_INFO.fileName,
          fileName: MODEL_INFO.fileName,
          dimensions: { width: 85, height: 45, depth: 85 },
          faceCount: MODEL_INFO.faceCount,
        },
      };
      upsertWork(updated);
    }
    navigate(`/order/${work.id}?type=${type}`);
  };

  const statusIcon = (status: 'pass' | 'warning' | 'fail') => {
    if (status === 'pass') return <CheckCircle2 className="size-5 text-success" />;
    if (status === 'warning') return <AlertTriangle className="size-5 text-warning" />;
    return <XCircle className="size-5 text-destructive" />;
  };

  const statusLabel = (status: 'pass' | 'warning' | 'fail') => {
    if (status === 'pass') return '通过';
    if (status === 'warning') return '警告';
    return '不通过';
  };

  const statusBadgeClass = (status: 'pass' | 'warning' | 'fail') => {
    if (status === 'pass') return 'bg-success/10 text-success border-success/30';
    if (status === 'warning') return 'bg-warning/10 text-warning border-warning/30';
    return 'bg-destructive/10 text-destructive border-destructive/30';
  };

  const overallLabel = overallStatus === 'pass' ? '全部通过' : overallStatus === 'warning' ? '有条件通过' : '存在风险';
  const overallClass =
    overallStatus === 'pass'
      ? 'bg-success/10 text-success border-success/40'
      : overallStatus === 'warning'
        ? 'bg-warning/10 text-warning border-warning/40'
        : 'bg-destructive/10 text-destructive border-destructive/40';

  if (!work) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background page-rise-in">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-6">
        {/* 顶部导航 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="size-10 rounded-full border border-border bg-white"
            >
              <ArrowLeft className="size-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground font-['Noto_Serif_SC'] tracking-wider">
                3D 预览与工艺校验
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                实时查看琉璃三维模型，自动检测铸造工艺可行性
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRotate((v) => !v)}
              className="gap-1.5 rounded-lg bg-white"
            >
              {autoRotate ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
              {autoRotate ? '暂停旋转' : '自动旋转'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setAutoRotate(true)} className="gap-1.5 rounded-lg bg-white">
              <RotateCw className="size-3.5" />
              重置视角
            </Button>
          </div>
        </div>

        {/* 主体：左 3D + 右校验 */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* 左侧：3D 预览 */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="bg-white border-border shadow-sm overflow-hidden relative">
              <CardContent className="p-0">
                {/* 生成中遮罩 */}
                {generating3D && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                    <Loader2 className="size-10 text-white animate-spin mb-4" />
                    <p className="text-white text-sm font-medium">{generatingStage || '生成中...'}</p>
                    <p className="text-white/60 text-xs mt-2">约需 20-30 秒</p>
                  </div>
                )}
                {/* 生成成功提示 */}
                {showSuccess && (
                  <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-success/90 text-white px-4 py-2 rounded-full shadow-lg animate-in fade-in slide-in-from-top-2">
                    <CheckCircle2 className="size-4" />
                    <span className="text-sm font-medium">生成成功</span>
                  </div>
                )}
                <ErrorBoundary fallback={
                  <div className="aspect-[4/3] w-full flex items-center justify-center bg-[#F5F0E8]">
                    <div className="text-center">
                      <Info className="size-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">3D 场景加载失败</p>
                    </div>
                  </div>
                }>
                  <div className="aspect-[4/3] w-full">
                    <Glass3DViewer color={modelColor} autoRotate={autoRotate} modelUrl={work.model3d?.url} />
                  </div>
                </ErrorBoundary>
              </CardContent>
            </Card>

            {/* AI 生成 3D 模型卡片 */}
            <Card className="bg-white border-border shadow-sm overflow-hidden">
              <div className="h-1" style={{ background: 'linear-gradient(90deg, #A8D8D0, #D4B87A)' }} />
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Sparkles className="size-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">AI 生成 3D 模型</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">基于参考图，一键生成 3D 模型</p>
                  </div>
                </div>

                {/* 上传参考图 */}
                <div className="space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full gap-2 rounded-lg bg-white h-10 border-dashed"
                  >
                    <Upload className="size-4" />
                    {uploadedImage ? '重新上传参考图' : '上传本地产品照片'}
                  </Button>
                  {uploadedImage && (
                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border/50">
                      <div className="relative group">
                        <img
                          src={uploadedImage}
                          alt="参考图"
                          className="size-16 rounded-lg object-cover border border-border shadow-sm"
                        />
                        <button
                          onClick={() => setUploadedImage(null)}
                          className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                        >
                          <XCircle className="size-3" />
                        </button>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-foreground">已上传参考图</p>
                        <p className="text-xs text-muted-foreground mt-0.5">将用此图生成3D模型</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3D 精度选择 */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-muted-foreground">生成精度：</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setModelVersion('G1-Turbo')}
                      disabled={generating3D}
                      className={`px-2.5 py-1 text-xs rounded-md transition-all ${
                        modelVersion === 'G1-Turbo'
                          ? 'bg-primary text-primary-foreground font-medium'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      极速版 · 20秒
                    </button>
                    <button
                      onClick={() => setModelVersion('G1')}
                      disabled={generating3D}
                      className={`px-2.5 py-1 text-xs rounded-md transition-all ${
                        modelVersion === 'G1'
                          ? 'bg-primary text-primary-foreground font-medium'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      标准版 · 3分钟
                    </button>
                  </div>
                </div>

                <Button
                  onClick={handleRegenerate3D}
                  disabled={generating3D}
                  className="w-full gap-2 rounded-xl h-11 text-sm font-medium shadow-md hover:shadow-lg transition-all"
                  style={{ background: '#2C3E3A' }}
                >
                  {generating3D ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Sparkles className="size-4" />
                  )}
                  {generating3D ? 'AI 生成 3D 模型中...' : uploadedImage ? '用上传图生成3D模型' : '用作品原图生成3D模型'}
                </Button>
              </CardContent>
            </Card>

            {/* 模型参数 */}
            <Card className="bg-white border-border shadow-sm glass-edge-glow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-['Noto_Serif_SC'] tracking-wider font-semibold flex items-center gap-2">
                  <FileCode className="size-5 text-primary" />
                  模型信息
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">尺寸</p>
                    <p className="text-sm font-medium text-foreground tabular-nums">
                      {MODEL_INFO.dimensions} <span className="text-muted-foreground font-normal">{MODEL_INFO.dimensionUnit}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">面数</p>
                    <p className="text-sm font-medium text-foreground tabular-nums">
                      {MODEL_INFO.faceCount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">体积</p>
                    <p className="text-sm font-medium text-foreground tabular-nums">
                      {MODEL_INFO.volume} <span className="text-muted-foreground font-normal">{MODEL_INFO.volumeUnit}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">预估重量</p>
                    <p className="text-sm font-medium text-foreground tabular-nums">
                      {MODEL_INFO.weight} <span className="text-muted-foreground font-normal">{MODEL_INFO.weightUnit}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">材质密度</p>
                    <p className="text-sm font-medium text-foreground">高硼硅琉璃 2.4 g/cm³</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">预估铸造时长</p>
                    <p className="text-sm font-medium text-warning tabular-nums">{MODEL_INFO.castDuration}</p>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">文件：{MODEL_INFO.fileName}</span>
                  <span className="text-muted-foreground">{MODEL_INFO.fileSize}</span>
                </div>
              </CardContent>
            </Card>

            {/* 下载按钮 */}
            <Button
              variant="outline"
              onClick={handleDownloadGLB}
              disabled={!work?.model3d?.url}
              className="w-full gap-2 rounded-lg bg-white h-11"
            >
              <Download className="size-4" />
              {work?.model3d?.url ? '下载 GLB 模型文件' : '生成 3D 模型后可下载'}
            </Button>
          </div>

          {/* 右侧：工艺校验 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 总览卡 */}
            <Card className={cn(
              'border shadow-sm',
              overallStatus === 'pass' && 'border-success/40',
              overallStatus === 'warning' && 'border-warning/40',
              overallStatus === 'fail' && 'border-destructive/40',
            )}>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className={cn('size-12 rounded-full flex items-center justify-center', overallClass, 'border')}>
                    {statusIcon(overallStatus)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground font-['Noto_Serif_SC']">工艺校验报告</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      结论：<span className={cn('font-medium', overallStatus === 'pass' ? 'text-success' : overallStatus === 'warning' ? 'text-warning' : 'text-destructive')}>{overallLabel}</span>
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-2.5 rounded-lg bg-success/5 border border-success/20">
                    <p className="text-xl font-bold text-success tabular-nums">{passCount}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">通过</p>
                  </div>
                  <div className="text-center p-2.5 rounded-lg bg-warning/5 border border-warning/20">
                    <p className="text-xl font-bold text-warning tabular-nums">{warningCount}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">警告</p>
                  </div>
                  <div className="text-center p-2.5 rounded-lg bg-destructive/5 border border-destructive/20">
                    <p className="text-xl font-bold text-destructive tabular-nums">{failCount}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">不通过</p>
                  </div>
                </div>
                {overallStatus === 'warning' && (
                  <p className="text-xs text-warning/80 mt-3 leading-relaxed bg-warning/5 p-2.5 rounded-lg">
                    💡 建议优化镂空设计，减浅竹叶浮雕深度，可进一步提升铸造良率。
                  </p>
                )}
              </CardContent>
            </Card>

            {/* 检测项列表 */}
            <Card className="bg-white border-border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-['Noto_Serif_SC'] tracking-wider font-semibold">
                  检测项目
                </CardTitle>
                <CardDescription className="text-xs">
                  共 {inspectionItems.length} 项检测，点击展开查看详情
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {inspectionItems.map((item, idx) => (
                    <div key={item.name}>
                      <button
                        onClick={() => toggleItem(idx)}
                        className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-muted/30 transition-colors text-left"
                      >
                        {statusIcon(item.status)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground">{item.name}</span>
                            <Badge variant="outline" className={cn('text-[10px] border', statusBadgeClass(item.status))}>
                              {statusLabel(item.status)}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{item.value}</p>
                        </div>
                        {expandedItems[idx] ? (
                          <ChevronUp className="size-4 text-muted-foreground shrink-0" />
                        ) : (
                          <ChevronDown className="size-4 text-muted-foreground shrink-0" />
                        )}
                      </button>
                      <AnimatePresence>
                        {expandedItems[idx] && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-5 pb-4 pt-0">
                              <p className="text-xs text-muted-foreground leading-relaxed bg-muted/30 p-3 rounded-lg">
                                {item.detail}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 下单主按钮 */}
            <Button
              size="lg"
              className="w-full h-12 gap-2 rounded-lg text-base font-medium"
              style={{ background: '#2C3E3A' }}
              onClick={() => handleOrder('glass')}
            >
              <Package className="size-4" />
              去下单生产
            </Button>
            <p className="text-xs text-center text-muted-foreground -mt-3">
              琉璃成品 · 预估 {MODEL_INFO.castDuration} · ¥580 起
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

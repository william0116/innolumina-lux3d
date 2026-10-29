import { motion } from 'framer-motion';
import {
  Sparkles,
  Package,
  DollarSign,
  Coins,
  SearchX,
  WifiOff,
  FileWarning,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

type EmptyType =
  | 'works'
  | 'orders'
  | 'earnings'
  | 'search'
  | 'network'
  | 'generate-fail'
  | 'model-fail'
  | 'credit-records';

interface EmptyStateProps {
  type: EmptyType;
  onAction?: () => void;
  actionLabel?: string;
  title?: string;
  description?: string;
  className?: string;
}

const CONFIG: Record<EmptyType, {
  icon: typeof Sparkles;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  actionLabel: string;
  actionPath?: string;
}> = {
  works: {
    icon: Sparkles,
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    title: '还没有作品',
    description: '去创作你的第一件琉璃作品吧',
    actionLabel: '开始创作',
    actionPath: '/create',
  },
  orders: {
    icon: Package,
    iconBg: 'bg-accent/10',
    iconColor: 'text-[#B8956A]',
    title: '暂无订单',
    description: '去作品广场看看有没有喜欢的',
    actionLabel: '去逛逛',
    actionPath: '/square',
  },
  earnings: {
    icon: DollarSign,
    iconBg: 'bg-[#C4A96B]/10',
    iconColor: 'text-[#C4A96B]',
    title: '还没有收益',
    description: '发布作品到广场，每笔订单都有分成',
    actionLabel: '申请创作者',
    actionPath: '/creator/apply',
  },
  search: {
    icon: SearchX,
    iconBg: 'bg-muted',
    iconColor: 'text-muted-foreground',
    title: '没有找到相关作品',
    description: '换个关键词试试，或浏览全部作品',
    actionLabel: '查看全部作品',
  },
  network: {
    icon: WifiOff,
    iconBg: 'bg-destructive/10',
    iconColor: 'text-destructive',
    title: '网络连接失败',
    description: '请检查网络后重试',
    actionLabel: '重新加载',
  },
  'generate-fail': {
    icon: FileWarning,
    iconBg: 'bg-destructive/10',
    iconColor: 'text-destructive',
    title: '生成失败，请重试',
    description: '可能原因：积分不足 / 网络异常 / 内容违规',
    actionLabel: '重新生成',
  },
  'model-fail': {
    icon: FileWarning,
    iconBg: 'bg-destructive/10',
    iconColor: 'text-destructive',
    title: '3D 建模失败',
    description: '该图片可能不适合3D重建，建议选择主体清晰、背景简洁的图片',
    actionLabel: '重新选择图片',
  },
  'credit-records': {
    icon: Coins,
    iconBg: 'bg-warning/10',
    iconColor: 'text-warning',
    title: '暂无充值记录',
    description: '充值积分即可开始 AI 创作之旅',
    actionLabel: '去充值',
    actionPath: '/recharge',
  },
};

export default function EmptyState({
  type,
  onAction,
  actionLabel,
  title,
  description,
  className = '',
}: EmptyStateProps) {
  const navigate = useNavigate();
  const config = CONFIG[type];
  const Icon = config.icon;

  const handleAction = () => {
    if (onAction) {
      onAction();
    } else if (config.actionPath) {
      navigate(config.actionPath);
    }
  };

  const isError = type === 'network' || type === 'generate-fail' || type === 'model-fail';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`flex flex-col items-center justify-center py-12 md:py-16 text-center ${className}`}
    >
      <div
        className={`relative size-20 md:size-24 rounded-2xl ${config.iconBg} flex items-center justify-center mb-5`}
      >
        <Icon className={`size-10 md:size-12 ${config.iconColor}`} />
        {isError && (
          <div className="absolute inset-0 rounded-2xl animate-pulse opacity-30"
            style={{
              background: 'radial-gradient(circle, currentColor 0%, transparent 70%)',
            }}
          />
        )}
      </div>

      <h3 className="glass-h3 text-lg md:text-xl mb-2">
        {title || config.title}
      </h3>
      <p className="text-sm md:text-base text-muted-foreground max-w-xs mb-6 leading-relaxed">
        {description || config.description}
      </p>

      <Button
        onClick={handleAction}
        variant={isError ? 'outline' : 'default'}
        className={isError ? 'rounded-lg' : 'rounded-lg glass-btn-primary'}
      >
        <Plus className="size-4 mr-1.5" />
        {actionLabel || config.actionLabel}
      </Button>
    </motion.div>
  );
}

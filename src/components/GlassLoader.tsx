import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface GlassLoaderProps {
  text?: string;
  subText?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function GlassLoader({
  text = '正在生成琉璃作品...',
  subText,
  size = 'md',
}: GlassLoaderProps) {
  const sizeMap = {
    sm: 'size-12',
    md: 'size-20',
    lg: 'size-28',
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      {/* 琉璃环 */}
      <div className={`relative ${sizeMap[size]} mb-5`}>
        {/* 外层光晕 */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 via-accent/20 to-primary/20 blur-md"
        />
        {/* 旋转琉璃环 */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full"
          style={{
            background: 'conic-gradient(from 0deg, transparent 0%, rgba(168, 216, 208, 0.6) 25%, rgba(196, 169, 107, 0.5) 50%, transparent 75%)',
            mask: 'radial-gradient(transparent 60%, black 62%)',
            WebkitMask: 'radial-gradient(transparent 60%, black 62%)',
          }}
        />
        {/* 内圈 */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-2 rounded-full"
          style={{
            background: 'conic-gradient(from 180deg, transparent 0%, rgba(232, 200, 154, 0.5) 30%, rgba(168, 216, 208, 0.4) 60%, transparent 85%)',
            mask: 'radial-gradient(transparent 55%, black 58%)',
            WebkitMask: 'radial-gradient(transparent 55%, black 58%)',
          }}
        />
        {/* 中心图标 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles className="text-primary/70" style={{ width: size === 'sm' ? 16 : size === 'md' ? 24 : 32, height: size === 'sm' ? 16 : size === 'md' ? 24 : 32 }} />
        </div>
      </div>

      {/* 文字 */}
      <p className="text-foreground font-medium text-sm md:text-base mb-1">
        {text}
        <span className="inline-flex gap-0.5 ml-0.5">
          <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0 }}>.</motion.span>
          <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}>.</motion.span>
          <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}>.</motion.span>
        </span>
      </p>
      {subText && (
        <p className="text-muted-foreground text-xs md:text-sm">{subText}</p>
      )}
    </div>
  );
}

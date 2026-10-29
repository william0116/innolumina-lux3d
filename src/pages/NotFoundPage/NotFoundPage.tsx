import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="text-center max-w-md"
      >
        <div className="relative mb-8">
          <h1
            className="text-7xl md:text-[100px] font-bold leading-none font-['Noto_Serif_SC'] tracking-wider"
            style={{
              background: 'linear-gradient(135deg, #2C3E3A 0%, #C4A96B 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'transparent',
            }}
          >
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-40 h-40 rounded-full bg-gradient-to-br from-accent/10 to-primary/10 blur-2xl -z-10" />
          </div>
        </div>

        <h2 className="glass-h2 text-2xl md:text-3xl mb-3">页面走丢了</h2>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          您访问的页面不存在或已被移除。
          <br />
          请检查链接是否正确，或返回首页继续浏览。
        </p>

        <div className="flex items-center justify-center gap-3">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="rounded-lg"
          >
            返回上一页
          </Button>
          <Button
            onClick={() => navigate('/')}
            className="rounded-lg glass-btn-primary"
          >
            <Home className="size-4 mr-2" />
            返回首页
          </Button>
        </div>

        {/* 装饰性琉璃碎片 */}
        <div className="mt-12 flex items-center justify-center gap-2 opacity-50">
          <div className="w-2 h-2 rounded-full bg-primary/40" />
          <div className="w-1.5 h-1.5 rounded-full bg-accent/40" />
          <div className="w-1 h-1 rounded-full bg-primary/30" />
        </div>
      </motion.div>
    </div>
  );
}

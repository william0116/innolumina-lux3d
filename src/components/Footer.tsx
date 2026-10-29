import { Mail, Phone, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UniversalLink } from '@lark-apaas/client-toolkit-lite';

export default function Footer() {
  const navigate = useNavigate();
  return (
    <footer className="w-full border-t border-border bg-card/30 backdrop-blur-sm mt-20 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 opacity-40">
        <div className="absolute bottom-0 left-1/4 w-96 h-48 bg-accent/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-80 h-40 bg-warning/10 rounded-full blur-[120px]" />
      </div>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="size-9 rounded-lg bg-gradient-to-br from-primary to-accent/70 flex items-center justify-center text-primary-foreground font-bold text-base relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white/25" />
                <span className="relative font-['Noto_Serif_SC']">琉</span>
              </div>
              <div className="flex flex-col leading-tight">
                 <span className="text-foreground font-semibold text-base font-['Noto_Serif_SC'] tracking-wide">
                   琉衍工坊
                 </span>
                 <span className="text-muted-foreground text-[11px] tracking-[0.2em] glass-brand-en mt-0.5">
                   InnoLumina
                 </span>
               </div>
            </div>
            <p className="text-muted-foreground text-sm leading-[1.9] max-w-md">
              inno.Studio 旗下 AI 琉璃数字化定制平台。以 AI 文生创作、2D 转 3D 建模、工艺校验引擎，将创意构想转化为琉璃三维数字资产，连接虚拟创意与实体造物。
            </p>
            <p className="text-primary/70 text-sm mt-4 font-['Noto_Serif_SC'] tracking-[0.3em]">
              光自数字来，万象衍为琉
            </p>
          </div>

          <div>
            <h4 className="text-foreground font-medium mb-4 text-sm font-['Noto_Serif_SC'] tracking-wider">快速链接</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li onClick={() => navigate('/')} className="hover:text-primary cursor-pointer transition-colors">首页</li>
                <li onClick={() => navigate('/create')} className="hover:text-primary cursor-pointer transition-colors">AI 创作</li>
                <li onClick={() => navigate('/square')} className="hover:text-primary cursor-pointer transition-colors">作品广场</li>
                <li onClick={() => navigate('/profile?tab=works')} className="hover:text-primary cursor-pointer transition-colors">我的作品</li>
                <li onClick={() => navigate('/profile?tab=orders')} className="hover:text-primary cursor-pointer transition-colors">订单中心</li>
              </ul>
            </div>

          <div>
            <h4 className="text-foreground font-medium mb-4 text-sm font-['Noto_Serif_SC'] tracking-wider">创作者</h4>
             <ul className="space-y-2 text-sm text-muted-foreground">
               <li onClick={() => navigate('/creator/apply')} className="hover:text-primary cursor-pointer transition-colors">创作者入驻</li>
               <li onClick={() => navigate('/help')} className="hover:text-primary cursor-pointer transition-colors">帮助中心</li>
               <li className="hover:text-primary cursor-pointer transition-colors">收益分成规则</li>
             </ul>
          </div>

          <div>
            <h4 className="text-foreground font-medium mb-4 text-sm font-['Noto_Serif_SC'] tracking-wider">联系我们</h4>
             <ul className="space-y-3 text-sm text-muted-foreground">
               <li className="flex items-center gap-2">
                 <Mail className="size-4 text-primary/70 shrink-0" />
                 <UniversalLink to="mailto:willamhe0116@163.com" className="hover:text-primary transition-colors">
                   willamhe0116@163.com
                 </UniversalLink>
               </li>
               <li className="flex items-center gap-2">
                 <Phone className="size-4 text-primary/70 shrink-0" />
                 <UniversalLink to="tel:15501013868" className="hover:text-primary transition-colors tabular-nums">
                   155-0101-3868
                 </UniversalLink>
               </li>
               <li className="flex items-start gap-2">
                 <MapPin className="size-4 text-primary/70 shrink-0 mt-0.5" />
                 <span>上海市徐汇区古宜路 30 号</span>
               </li>
             </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 glass-divider flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            © 2025 InnoLumina Studio. All rights reserved. 沪 ICP 备 2025XXXXXX 号
          </p>
          <p className="text-xs text-muted-foreground">
            inno.Studio 旗下品牌
          </p>
        </div>
      </div>
    </footer>
  );
}

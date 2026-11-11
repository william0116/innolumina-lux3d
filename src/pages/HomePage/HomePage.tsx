import HeroSection from './HeroSection';
import CapabilitiesSection from './CapabilitiesSection';
import FlowSection from './FlowSection';
import ShowcaseSection from './ShowcaseSection';
import CTASection from './CTASection';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

function PartnerXhsSection() {
  return (
    <section className="py-10 px-6">
      <div className="max-w-5xl mx-auto rounded-2xl border border-primary/15 bg-gradient-to-r from-primary/5 via-background to-accent/5 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <div className="size-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-base shrink-0 shadow-md shadow-primary/20">
          <svg viewBox="0 0 24 24" className="size-6" fill="currentColor"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm5.5 11.5c-.3 1.5-1.7 2.7-3.5 2.7-1 0-1.9-.4-2.5-1l-.5 1H9l.5-2c-.8-.7-1.3-1.7-1.3-2.9 0-.3 0-.6.1-.9L7 9l2.3-.4.7-1.9c.2-.5.8-.8 1.3-.6l3.3 1.2c1.2.4 2.1 1.5 2.3 2.8l.9 3.4z"/></svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm text-muted-foreground mb-1">本平台作品来源</div>
          <div className="text-base sm:text-lg font-semibold text-foreground font-['Noto_Serif_SC']">
            inno. Studio · 琉璃设计工作室
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
            2 万粉丝 · 11.3 万获赞 · 作品已入驻上海前滩华尔道夫酒店。本广场陈列的琉璃器型均由其原创设计，授权用于本 Demo 展示。
          </div>
        </div>
        <a
          href="https://www.xiaohongshu.com/user/profile/5a7ee8b3e8ac2b403cb83539"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0"
        >
          <Button className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20">
            关注小红书
            <ExternalLink className="size-4" />
          </Button>
        </a>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="space-y-0">
        <HeroSection />
        <CapabilitiesSection />
        <FlowSection />
        <ShowcaseSection />
        <PartnerXhsSection />
        <CTASection />
      </main>
    </div>
  );
}


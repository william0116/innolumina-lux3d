import HeroSection from './HeroSection';
import CapabilitiesSection from './CapabilitiesSection';
import FlowSection from './FlowSection';
import ShowcaseSection from './ShowcaseSection';
import CTASection from './CTASection';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="space-y-0">
        <HeroSection />
        <CapabilitiesSection />
        <FlowSection />
        <ShowcaseSection />
        <CTASection />
      </main>
    </div>
  );
}

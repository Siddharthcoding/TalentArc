import Hero from '@/components/sections/Hero';
import TrustMarquee from '@/components/sections/TrustMarquee';
import FeatureMatrix from '@/components/sections/FeatureMatrix';
import TechBlueprint from '@/components/sections/TechBlueprint';
import CtaSection from '@/components/sections/CtaSection';

export default function Home() {
  return (
    <>
      <Hero />
      <TrustMarquee />
      <FeatureMatrix />
      <TechBlueprint />
      <CtaSection />
    </>
  );
}
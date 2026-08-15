import Hero from '@/components/sections/Hero';
import TrustMarquee from '@/components/sections/TrustMarquee';
import FeatureMatrix from '@/components/sections/FeatureMatrix';
import TechBlueprint from '@/components/sections/TechBlueprint';
import CtaSection from '@/components/sections/CtaSection';
import SEO from '@/components/SEO';

export default function Home() {
  return (
    <>
      <SEO
        title="Kampus Ace — KIIT Campus Placement Hub"
        description="Beat placements at Microsoft, Amazon, HighRadius & Deloitte. ATS resume checker, verified company question banks, AI-powered mock tests, and live mentor doubt sessions — built for KIIT students."
        path="/"
        keywords="KIIT placement 2025, KIIT campus placement, Kampus Ace, KIIT interview prep, KIIT ATS checker, HighRadius KIIT, Microsoft KIIT"
        noSuffix
      />
      <Hero />
      <TrustMarquee />
      <FeatureMatrix />
      <TechBlueprint />
      <CtaSection />
    </>
  );
}
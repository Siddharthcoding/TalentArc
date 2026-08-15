import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, FileCheck, Building2, Target } from 'lucide-react';
import SectionWrapper from '@/components/ui/SectionWrapper';
import Features from '@/components/sections/Features';
import TechBlueprint from '@/components/sections/TechBlueprint';
import { fadeUpVariants } from '@/hooks/useScrollReveal';

export default function FeaturesPage() {
  return (
    <div style={{ background: '#D7F27A' }} className="min-h-screen">
      <SectionWrapper className="pt-28 pb-8">
        <motion.div
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-3xl mx-auto space-y-4"
        >
          <div className="inline-flex items-center gap-1.5 bg-[#F6E9D2] text-[#0FA34E] font-mono text-xs font-bold px-3.5 py-1 rounded-full border border-[#0FA34E]/20 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CAMPUS ACE FEATURES</span>
          </div>
          <h1 className="font-display text-4xl sm:text-6xl font-extrabold text-[#0FA34E] tracking-tight">
            Comprehensive Placement Suite
          </h1>
          <p className="text-sm sm:text-base font-medium text-[#0B7C3C] max-w-2xl mx-auto">
            Everything KIIT students need to pass ATS filters, clear technical OAs, and ace dream recruiter interviews.
          </p>
        </motion.div>
      </SectionWrapper>

      <Features />
      <TechBlueprint />

      <SectionWrapper className="py-16 text-center">
        <motion.div
          variants={fadeUpVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full font-display font-extrabold text-sm sm:text-base shadow-lg transition-all transform hover:-translate-y-1"
            style={{ background: '#0FA34E', color: '#F6E9D2', border: '2px solid rgba(198, 255, 61, 0.4)' }}
          >
            <FileCheck className="w-4 h-4 text-[#C6FF3D]" />
            <span>Analyze Resume Now</span>
            <ArrowRight className="w-4 h-4 text-[#C6FF3D]" />
          </Link>
          <Link
            to="/company-bank"
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full font-display font-extrabold text-sm sm:text-base shadow-md transition-all hover:bg-[#F6E9D2]/90"
            style={{ background: '#F6E9D2', color: '#0FA34E', border: '2px solid #0FA34E' }}
          >
            <Building2 className="w-4 h-4 text-[#0FA34E]" />
            <span>Browse Recruiter Bank</span>
          </Link>
        </motion.div>
      </SectionWrapper>
    </div>
  );
}

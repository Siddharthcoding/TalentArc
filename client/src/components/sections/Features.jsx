import { motion } from 'framer-motion';
import { BarChart3, FileText, Gauge, MessageSquare, ShieldCheck, Target, Users, Sliders } from 'lucide-react';
import SectionWrapper from '@/components/ui/SectionWrapper';
import { useScrollReveal, staggerContainerVariants, fadeUpVariants } from '@/hooks/useScrollReveal';

const features = [
  {
    icon: FileText,
    title: 'Multi-Format ATS Extraction',
    description:
      'Seamlessly parse PDF and DOCX resumes with precision. Our engine preserves structure, section headers, and embedded keywords.',
  },
  {
    icon: BarChart3,
    title: '9-Layer Placement Analysis',
    description:
      'Evaluate formatting, contact info, completeness, tone, action verbs, and recruiter keyword optimization in parallel.',
  },
  {
    icon: Gauge,
    title: 'Recruiter Gauge Scoring',
    description:
      'Granular subscores across 9 weighted dimensions calibrated against campus placement cutoffs.',
  },
  {
    icon: MessageSquare,
    title: 'Instant Actionable Feedback',
    description:
      'Personalized feedback with prioritized action items so you know exactly what to fix before drive day.',
  },
];

export default function Features() {
  const { ref, controls } = useScrollReveal(0.1);

  return (
    <SectionWrapper id="features" style={{ background: '#D7F27A' }}>
      <motion.div
        ref={ref}
        variants={staggerContainerVariants}
        initial="hidden"
        animate={controls}
        className="text-center mb-16"
      >
        <motion.div variants={fadeUpVariants} className="inline-flex items-center gap-1.5 bg-[#F6E9D2] text-[#0FA34E] font-mono text-xs font-bold px-3.5 py-1 rounded-full border border-[#0FA34E]/20 shadow-sm mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>KIIT PLACEMENT CAPABILITIES</span>
        </motion.div>
        
        <motion.h2 variants={fadeUpVariants} className="font-display text-4xl sm:text-6xl font-extrabold text-[#0FA34E] tracking-tight">
          Everything You Need to Ace Placement Season
        </motion.h2>
        
        <motion.p variants={fadeUpVariants} className="mt-4 text-base font-medium text-[#0B7C3C] max-w-2xl mx-auto">
          From ATS scoring to verified company round transcripts, Kampus Ace provides full end-to-end guidance.
        </motion.p>
      </motion.div>

      <motion.div
        ref={ref}
        variants={staggerContainerVariants}
        initial="hidden"
        animate={controls}
        className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {features.map((feature) => (
          <motion.div key={feature.title} variants={fadeUpVariants}>
            <div className="bg-[#F6E9D2] p-6 rounded-3xl border-2 border-[#0FA34E]/20 shadow-md hover:shadow-xl transition-all h-full flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#0FA34E] text-[#C6FF3D] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="font-display font-extrabold text-lg text-[#0FA34E] mb-2">
                  {feature.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#0B7C3C] leading-relaxed font-medium">
                  {feature.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </SectionWrapper>
  );
}

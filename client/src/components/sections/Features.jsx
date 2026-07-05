import { motion } from 'framer-motion';
import { FileText, BarChart3, Gauge, MessageSquare } from 'lucide-react';
import GlassCard from '@/components/ui/GlassCard';
import SectionWrapper from '@/components/ui/SectionWrapper';
import { useScrollReveal, staggerContainerVariants, fadeUpVariants } from '@/hooks/useScrollReveal';

const features = [
  {
    icon: FileText,
    title: 'Multi-Format Extraction',
    description:
      'Seamlessly parse PDF and DOCX resumes with precision. Our engine preserves structure, formatting, and embedded metadata.',
  },
  {
    icon: BarChart3,
    title: 'Multi-Layer ATS Analysis',
    description:
      'Five specialized analyzers evaluate formatting, contact info, completeness, style, and keyword optimization in parallel.',
  },
  {
    icon: Gauge,
    title: 'Sub-Category Scoring',
    description:
      'Granular scores across 9 weighted dimensions — from formatting to ATS compatibility — so you know exactly where to improve.',
  },
  {
    icon: MessageSquare,
    title: 'Instant Actionable Feedback',
    description:
      'LLM-powered narrative feedback with prioritized action items. Know what you did well and exactly what to fix.',
  },
];

export default function Features() {
  const { ref, controls } = useScrollReveal(0.1);

  return (
    <SectionWrapper id="features">
      <motion.div
        ref={ref}
        variants={staggerContainerVariants}
        initial="hidden"
        animate={controls}
        className="text-center mb-16"
      >
        <motion.h2 variants={fadeUpVariants} className="text-3xl md:text-4xl font-bold tracking-tight">
          Everything You Need to{' '}
          <span className="gradient-text">Optimize Your Resume</span>
        </motion.h2>
        <motion.p variants={fadeUpVariants} className="mt-4 text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
          From parsing to scoring, TalentArc gives you comprehensive insights to beat the ATS.
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
            <GlassCard className="h-full group cursor-default">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                {feature.description}
              </p>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>
    </SectionWrapper>
  );
}

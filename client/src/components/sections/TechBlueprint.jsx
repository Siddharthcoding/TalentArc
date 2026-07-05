import { motion } from 'framer-motion';
import { Upload, Settings, Search, BarChart3, FileCheck } from 'lucide-react';
import SectionWrapper from '@/components/ui/SectionWrapper';
import { useScrollReveal, fadeUpVariants } from '@/hooks/useScrollReveal';

const steps = [
  {
    icon: Upload,
    label: 'Upload',
    description: 'Submit your resume in PDF or DOCX format through our secure upload handler.',
  },
  {
    icon: Settings,
    label: 'Parse',
    description: 'Text extraction and structured parsing into contact, education, experience, skills, and more.',
  },
  {
    icon: Search,
    label: 'Analyze',
    description: 'Five parallel analyzers evaluate formatting, completeness, style, keywords, and contact info.',
  },
  {
    icon: BarChart3,
    label: 'Score',
    description: 'Weighted scoring across 9 categories produces your overall ATS compatibility score.',
  },
  {
    icon: FileCheck,
    label: 'Report',
    description: 'LLM-enhanced narrative feedback with prioritized actions and critical flags.',
  },
];

export default function TechBlueprint() {
  const { ref, controls } = useScrollReveal(0.1);

  return (
    <SectionWrapper id="how-it-works" className="bg-zinc-50/50 dark:bg-zinc-900/30">
      <motion.div
        ref={ref}
        variants={fadeUpVariants}
        initial="hidden"
        animate={controls}
        className="text-center mb-16"
      >
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
          How the <span className="gradient-text">Pipeline</span> Works
        </h2>
        <p className="mt-4 text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
          Behind the scenes, TalentArc runs a sophisticated multi-stage processing pipeline.
        </p>
      </motion.div>

      <div className="relative" ref={ref}>
        <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-200 via-violet-200 to-purple-200 dark:from-indigo-800 dark:via-violet-800 dark:to-purple-800 -translate-y-1/2" />

        <div className="grid lg:grid-cols-5 gap-8 lg:gap-4 relative">
          {steps.map((step, index) => (
            <StepCard key={step.label} step={step} index={index} />
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}

function StepCard({ step, index }) {
  const { ref, controls } = useScrollReveal(0.2);

  return (
    <motion.div
      ref={ref}
      variants={fadeUpVariants}
      initial="hidden"
      animate={controls}
      transition={{ delay: index * 0.15 }}
      className="relative flex flex-col items-center text-center group"
    >
      <div className="relative z-10 w-16 h-16 rounded-2xl bg-white dark:bg-zinc-900 glass-card flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
        <step.icon className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-indigo-600 dark:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center">
          {index + 1}
        </div>
      </div>
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-1">{step.label}</h3>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-[220px]">{step.description}</p>
    </motion.div>
  );
}

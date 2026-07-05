import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import AnimatedButton from '@/components/ui/AnimatedButton';
import SectionWrapper from '@/components/ui/SectionWrapper';
import { useScrollReveal, fadeUpVariants } from '@/hooks/useScrollReveal';

export default function CtaSection() {
  const { ref, controls } = useScrollReveal(0.2);

  return (
    <SectionWrapper id="cta">
      <motion.div
        ref={ref}
        variants={fadeUpVariants}
        initial="hidden"
        animate={controls}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 dark:from-indigo-500 dark:via-violet-600 dark:to-purple-700 px-8 py-16 md:py-20 text-center"
      >
        <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium bg-white/10 text-white/90 border border-white/20">
              <Sparkles className="w-3.5 h-3.5" />
              Start Your Journey
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
            Ready to Supercharge Your Job Search?
          </h2>
          <p className="text-lg text-indigo-100/80 max-w-lg mx-auto mb-8">
            Join thousands of job seekers who have optimized their resumes with TalentArc.
          </p>

          <Link to="/dashboard">
            <AnimatedButton
              variant="secondary"
              icon={ArrowRight}
              className="!bg-white !text-indigo-700 hover:!bg-indigo-50 !shadow-xl !shadow-indigo-900/20"
            >
              Analyze Your Resume for Free
            </AnimatedButton>
          </Link>

          <p className="mt-4 text-sm text-indigo-200/60">No credit card required &middot; Free analysis</p>
        </div>
      </motion.div>
    </SectionWrapper>
  );
}

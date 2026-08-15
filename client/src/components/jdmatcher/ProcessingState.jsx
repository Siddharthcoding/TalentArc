import { motion } from 'framer-motion';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils/cn';

const steps = [
  { key: 'resume', label: 'Parsing resume technical competency matrix...' },
  { key: 'jd', label: 'Extracting recruiter requirements & target skills from JD...' },
  { key: 'matching', label: 'Running multi-factor semantic fit scoring engine...' },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.35, delayChildren: 0.15 },
  },
};

const stepVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const pulseRing = {
  animate: {
    scale: [1, 1.15, 1],
    opacity: [0.3, 0.7, 0.3],
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
  },
};

export default function ProcessingState({ activeStep }) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-lg mx-auto py-12 bg-[#F6E9D2] border-2 border-[#0FA34E]/30 rounded-3xl p-8 shadow-xl"
    >
      <motion.div variants={stepVariants} className="text-center mb-8">
        <div className="relative inline-flex mb-4">
          <motion.div
            variants={pulseRing}
            animate="animate"
            className="absolute inset-0 rounded-2xl bg-[#0FA34E]/20"
          />
          <div className="relative w-16 h-16 rounded-2xl bg-[#0FA34E] text-[#D7F27A] flex items-center justify-center shadow-lg">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        </div>
        <div className="inline-block bg-[#0FA34E]/10 text-[#0FA34E] font-mono text-[10px] font-black px-3 py-0.5 rounded-full uppercase border border-[#0FA34E]/20 mb-2">
          COMPUTING EVALUATION
        </div>
        <h3 className="text-2xl font-extrabold text-[#0FA34E] font-display">
          Matching Your Profile
        </h3>
        <p className="text-xs font-medium text-[#0B7C3C] mt-1">
          Evaluating technical alignment and recruiter benchmarks in real time.
        </p>
      </motion.div>

      <div className="space-y-3">
        {steps.map((step, idx) => {
          const isActive = idx === activeStep;
          const isDone = idx < activeStep;

          return (
            <motion.div
              key={step.key}
              variants={stepVariants}
              className={cn(
                'flex items-center gap-3.5 p-3.5 rounded-2xl border-2 transition-all duration-300',
                isActive
                  ? 'bg-[#DFF5E6] border-[#0FA34E] shadow-sm'
                  : isDone
                    ? 'bg-[#DFF5E6]/60 border-[#0FA34E]/30'
                    : 'bg-[#F6E9D2] border-[#0FA34E]/10 opacity-50'
              )}
            >
              <div className="relative shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-[#0FA34E]" />
                ) : (
                  <div
                    className={cn(
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                      isActive ? 'border-[#0FA34E]' : 'border-[#0FA34E]/30'
                    )}
                  >
                    {isActive && (
                      <div className="w-2 h-2 rounded-full bg-[#0FA34E] animate-pulse" />
                    )}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    'text-xs font-bold font-mono',
                    isDone
                      ? 'text-[#0FA34E]'
                      : isActive
                        ? 'text-[#0FA34E]'
                        : 'text-[#0B7C3C]/60'
                  )}
                >
                  {step.label}
                </p>
              </div>

              {isActive && (
                <Loader2 className="w-4 h-4 text-[#0FA34E] animate-spin shrink-0" />
              )}
              {isDone && (
                <span className="text-[10px] font-mono font-bold text-[#0FA34E] shrink-0 bg-[#0FA34E]/10 px-2 py-0.5 rounded-full">
                  DONE
                </span>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
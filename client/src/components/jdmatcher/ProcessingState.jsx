import { motion } from 'framer-motion';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils/cn';

const steps = [
  { key: 'resume', label: 'Analyzing resume matrix...' },
  { key: 'jd', label: 'Extracting key requirements from JD...' },
  { key: 'matching', label: 'Running semantic embedding matching engine...' },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.4, delayChildren: 0.2 },
  },
};

const stepVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const pulseRing = {
  animate: {
    scale: [1, 1.1, 1],
    opacity: [0.4, 0.8, 0.4],
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
  },
};

export default function ProcessingState({ activeStep }) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-lg mx-auto py-16"
    >
      <motion.div variants={stepVariants} className="text-center mb-12">
        <div className="relative inline-flex mb-6">
          <motion.div
            variants={pulseRing}
            animate="animate"
            className="absolute inset-0 rounded-full bg-indigo-500/20"
          />
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
          Processing Your Match
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
          Our engines are working in parallel to compute your results.
        </p>
      </motion.div>

      <div className="space-y-6">
        {steps.map((step, idx) => {
          const isActive = idx === activeStep;
          const isDone = idx < activeStep;

          return (
            <motion.div
              key={step.key}
              variants={stepVariants}
              className={cn(
                'flex items-center gap-4 p-4 rounded-xl transition-all duration-500',
                isActive
                  ? 'bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/50 dark:border-indigo-800/50'
                  : isDone
                    ? 'bg-green-50/30 dark:bg-green-950/20'
                    : 'opacity-40'
              )}
            >
              <div className="relative flex-shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                ) : (
                  <div className={cn(
                    'w-6 h-6 rounded-full border-2 flex items-center justify-center',
                    isActive
                      ? 'border-indigo-500 dark:border-indigo-400'
                      : 'border-zinc-300 dark:border-zinc-600'
                  )}>
                    {isActive && (
                      <div className="w-2 h-2 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-pulse" />
                    )}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className={cn(
                  'text-sm font-medium',
                  isDone
                    ? 'text-green-600 dark:text-green-400'
                    : isActive
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-zinc-400 dark:text-zinc-500'
                )}>
                  {step.label}
                </p>
              </div>

              {isActive && (
                <Loader2 className="w-4 h-4 text-indigo-500 dark:text-indigo-400 animate-spin flex-shrink-0" />
              )}
              {isDone && (
                <span className="text-xs font-medium text-green-600 dark:text-green-400 flex-shrink-0">
                  Done
                </span>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
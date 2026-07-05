import { motion } from 'framer-motion';
import { Loader2, CheckCircle2, FileText } from 'lucide-react';
import { cn } from '@/utils/cn';

const steps = [
  { key: 0, label: 'Extracting text...' },
  { key: 1, label: 'Running ATS checks...' },
  { key: 2, label: 'Compiling score...' },
];

export default function UploadProgress({ step, file }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.98 }}
      transition={{ type: 'spring', damping: 25, stiffness: 280 }}
      className="glass-card p-8 md:p-10 max-w-lg mx-auto"
    >
      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-zinc-100 dark:border-zinc-800/60">
        <div className="relative">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-950/60 dark:to-violet-950/60 flex items-center justify-center">
            <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -inset-1.5 rounded-xl border border-indigo-400/20 dark:border-indigo-500/20"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-zinc-900 dark:text-white">Analyzing Resume</p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate max-w-[220px]">{file?.name}</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
          <Loader2 className="w-3 h-3 animate-spin" />
          {step < 2 ? 'Processing' : 'Finalizing'}
        </div>
      </div>

      <div className="space-y-0">
        {steps.map((s, i) => {
          const isActive = step === s.key;
          const isDone = step > s.key;
          const isPending = step < s.key;

          return (
            <div key={s.key} className="relative">
              {i < steps.length - 1 && (
                <div className="absolute left-[21px] top-11 w-0.5 h-9">
                  <div className="w-full h-full bg-zinc-200 dark:bg-zinc-700/60 rounded-full overflow-hidden">
                    <motion.div
                      className="w-full bg-gradient-to-b from-indigo-500 to-violet-500"
                      initial={{ height: '0%' }}
                      animate={{ height: isDone ? '100%' : isActive ? '50%' : '0%' }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              )}

              <div className={cn(
                'flex items-start gap-4 pb-9 last:pb-0',
                isPending && 'opacity-40'
              )}>
                <div className="relative z-10 mt-0.5">
                  {isDone ? (
                    <motion.div
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                    >
                      <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-950/40 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      </div>
                    </motion.div>
                  ) : isActive ? (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-950/60 dark:to-violet-950/60 flex items-center justify-center shadow-lg shadow-indigo-500/10">
                      <Loader2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-spin" />
                    </div>
                  ) : (
                    <div className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center',
                      'bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/50 dark:border-zinc-700/50'
                    )}>
                      <div className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 pt-2">
                  <p className={cn(
                    'text-sm font-semibold transition-colors duration-300',
                    isDone && 'text-green-600 dark:text-green-400',
                    isActive && 'text-indigo-600 dark:text-indigo-400',
                    isPending && 'text-zinc-400 dark:text-zinc-500'
                  )}>
                    {s.label}
                  </p>
                  {isActive && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5"
                    >
                      {step === 0 ? 'Parsing document structure...' : step === 1 ? 'Evaluating 5 analysis layers...' : 'Calculating weighted scores...'}
                    </motion.p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800/60">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
              initial={{ width: '0%' }}
              animate={{ width: `${Math.min(100, ((step + 1) / 3) * 100)}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
          <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500 tabular-nums">
            {Math.round(((step + 1) / 3) * 100)}%
          </span>
        </div>
      </div>
    </motion.div>
  );
}

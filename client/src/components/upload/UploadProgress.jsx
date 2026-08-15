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
      className="bg-[#F6E9D2] border-2 border-[#0FA34E]/30 rounded-3xl p-8 md:p-10 max-w-lg mx-auto shadow-2xl"
    >
      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-[#0FA34E]/20">
        <div className="relative">
          <div className="w-11 h-11 rounded-xl bg-[#0FA34E] text-[#F6E9D2] flex items-center justify-center shadow">
            <FileText className="w-5 h-5" />
          </div>
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -inset-1.5 rounded-xl border border-[#0FA34E]/30"
          />
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="font-display font-extrabold text-base text-[#0FA34E]">Analyzing KIIT Resume</p>
          <p className="text-xs font-mono text-[#0B7C3C] truncate max-w-[220px]">{file?.name}</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#0FA34E] font-mono font-bold">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          {step < 2 ? 'Processing' : 'Finalizing'}
        </div>
      </div>

      <div className="space-y-0 text-left">
        {steps.map((s, i) => {
          const isActive = step === s.key;
          const isDone = step > s.key;
          const isPending = step < s.key;

          return (
            <div key={s.key} className="relative">
              {i < steps.length - 1 && (
                <div className="absolute left-[21px] top-11 w-0.5 h-9">
                  <div className="w-full h-full bg-[#0FA34E]/20 rounded-full overflow-hidden">
                    <motion.div
                      className="w-full bg-[#0FA34E]"
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
                      <div className="w-10 h-10 rounded-full bg-[#0FA34E] text-[#C6FF3D] flex items-center justify-center shadow">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    </motion.div>
                  ) : isActive ? (
                    <div className="w-10 h-10 rounded-full bg-[#0FA34E] text-[#C6FF3D] flex items-center justify-center shadow-lg">
                      <Loader2 className="w-5 h-5 text-[#C6FF3D] animate-spin" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#D7F27A] border border-[#0FA34E]/30 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#0FA34E]/40" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 pt-2">
                  <p className={cn(
                    'text-sm font-display font-extrabold transition-colors duration-300',
                    isDone && 'text-[#0FA34E]',
                    isActive && 'text-[#0FA34E]',
                    isPending && 'text-[#0B7C3C]/60'
                  )}>
                    {s.label}
                  </p>
                  {isActive && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-[#0B7C3C] mt-0.5 font-medium"
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

      <div className="mt-6 pt-5 border-t border-[#0FA34E]/20">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 rounded-full bg-[#D7F27A] overflow-hidden border border-[#0FA34E]/20">
            <motion.div
              className="h-full rounded-full bg-[#0FA34E]"
              initial={{ width: '0%' }}
              animate={{ width: `${Math.min(100, ((step + 1) / 3) * 100)}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
          <span className="text-xs font-mono font-extrabold text-[#0FA34E] tabular-nums">
            {Math.round(((step + 1) / 3) * 100)}%
          </span>
        </div>
      </div>
    </motion.div>
  );
}

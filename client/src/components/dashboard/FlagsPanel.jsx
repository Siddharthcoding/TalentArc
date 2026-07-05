import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, AlertCircle, Info, ChevronDown, CheckCircle2, Sparkles } from 'lucide-react';
import { cn } from '@/utils/cn';

const SEVERITY_CONFIG = {
  critical: {
    icon: AlertCircle,
    label: 'Critical',
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950/25',
    border: 'border-red-200 dark:border-red-900/50',
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    dot: 'bg-red-500',
    hover: 'hover:bg-red-100/50 dark:hover:bg-red-950/40',
  },
  warnings: {
    icon: AlertTriangle,
    label: 'Warnings',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/25',
    border: 'border-amber-200 dark:border-amber-900/50',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    dot: 'bg-amber-500',
    hover: 'hover:bg-amber-100/50 dark:hover:bg-amber-950/40',
  },
  suggestions: {
    icon: Info,
    label: 'Suggestions',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/25',
    border: 'border-blue-200 dark:border-blue-900/50',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    dot: 'bg-blue-500',
    hover: 'hover:bg-blue-100/50 dark:hover:bg-blue-950/40',
  },
};

function SeveritySection({ severity, flags, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  const config = SEVERITY_CONFIG[severity];
  const Icon = config.icon;

  if (!flags || flags.length === 0) return null;

  return (
    <div className={cn('rounded-xl border overflow-hidden', config.border)}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left transition-all duration-200',
          config.bg, config.hover
        )}
      >
        <div className="flex items-center gap-2.5">
          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', config.bg, 'border', config.border)}>
            <Icon className={cn('w-4 h-4', config.color)} />
          </div>
          <div>
            <span className={cn('text-sm font-semibold', config.color)}>{config.label}</span>
            <span className={cn(
              'ml-2 text-xs font-bold px-1.5 py-0.5 rounded-full',
              config.badge
            )}>
              {flags.length}
            </span>
          </div>
        </div>
        <ChevronDown className={cn(
          'w-4 h-4 text-zinc-400 transition-transform duration-200',
          open && 'rotate-180'
        )} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3.5 space-y-2.5 pt-1.5">
              {flags.map((flag, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.25 }}
                  className="flex items-start gap-2.5 text-sm group"
                >
                  <div className={cn('w-2 h-2 rounded-full mt-1.5 shrink-0', config.dot, 'shadow-sm')} />
                  <span className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {flag.layer && (
                      <span className={cn(
                        'inline-block text-[10px] font-semibold uppercase mr-1.5 px-1.5 py-0.5 rounded',
                        'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                      )}>
                        {flag.layer}
                      </span>
                    )}
                    {flag.message || flag}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FlagsPanel({ flags }) {
  if (!flags) return null;

  const { critical = [], warnings = [], suggestions = [] } = flags;
  const total = critical.length + warnings.length + suggestions.length;

  if (total === 0) {
    return (
      <div className="glass-card !p-6 text-center">
        <div className="relative w-14 h-14 mx-auto mb-3">
          <div className="w-14 h-14 rounded-full bg-green-50 dark:bg-green-950/30 flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7 text-green-500" />
          </div>
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -inset-1 rounded-full border-2 border-green-200/50 dark:border-green-800/30"
          />
        </div>
        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">No issues found</p>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">Your resume looks well-structured</p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          Flags & Issues
        </h3>
        <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
          {total} total
        </span>
      </div>
      <SeveritySection severity="critical" flags={critical} defaultOpen={true} />
      <SeveritySection severity="warnings" flags={warnings} defaultOpen={false} />
      <SeveritySection severity="suggestions" flags={suggestions} defaultOpen={false} />
    </div>
  );
}

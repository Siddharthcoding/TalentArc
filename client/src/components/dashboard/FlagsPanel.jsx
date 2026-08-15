import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, AlertCircle, Info, ChevronDown, CheckCircle2 } from 'lucide-react';
import { cn } from '@/utils/cn';

const SEVERITY_CONFIG = {
  critical: {
    icon: AlertCircle,
    label: 'Critical Issues',
    color: 'text-[#E1584A]',
    bg: 'bg-[#F6E9D2]',
    border: 'border-[#E1584A]/40',
    badge: 'bg-[#E1584A] text-white',
    dot: 'bg-[#E1584A]',
  },
  warnings: {
    icon: AlertTriangle,
    label: 'Warnings',
    color: 'text-[#E8A33D]',
    bg: 'bg-[#F6E9D2]',
    border: 'border-[#E8A33D]/40',
    badge: 'bg-[#E8A33D] text-white',
    dot: 'bg-[#E8A33D]',
  },
  suggestions: {
    icon: Info,
    label: 'Optimization Suggestions',
    color: 'text-[#0FA34E]',
    bg: 'bg-[#F6E9D2]',
    border: 'border-[#0FA34E]/40',
    badge: 'bg-[#0FA34E] text-[#F6E9D2]',
    dot: 'bg-[#0FA34E]',
  },
};

function SeveritySection({ severity, flags, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  const config = SEVERITY_CONFIG[severity];
  const Icon = config.icon;

  if (!flags || flags.length === 0) return null;

  return (
    <div className={cn('rounded-2xl border-2 overflow-hidden text-left bg-[#F6E9D2]', config.border)}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left transition-all bg-[#F6E9D2]"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#0FA34E] text-[#F6E9D2] flex items-center justify-center shadow">
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <span className="font-display font-extrabold text-sm text-[#0FA34E]">{config.label}</span>
            <span className={cn('ml-2 text-xs font-mono font-bold px-2 py-0.5 rounded-full', config.badge)}>
              {flags.length}
            </span>
          </div>
        </div>
        <ChevronDown className={cn('w-4 h-4 text-[#0FA34E] transition-transform duration-200', open && 'rotate-180')} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden border-t border-[#0FA34E]/15"
          >
            <div className="px-4 pb-3.5 space-y-2.5 pt-2.5">
              {flags.map((flag, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs font-medium text-[#0B7C3C]">
                  <div className={cn('w-2 h-2 rounded-full mt-1.5 shrink-0', config.dot)} />
                  <span className="leading-relaxed">
                    {flag.layer && (
                      <span className="font-mono text-[10px] font-bold uppercase bg-[#D7F27A] text-[#0FA34E] px-1.5 py-0.5 rounded mr-1.5 border border-[#0FA34E]/20">
                        {flag.layer}
                      </span>
                    )}
                    {flag.message || flag}
                  </span>
                </div>
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
      <div className="bg-[#F6E9D2] border-2 border-[#0FA34E]/30 rounded-3xl p-6 text-center space-y-2">
        <div className="w-12 h-12 rounded-full bg-[#0FA34E] text-[#C6FF3D] flex items-center justify-center mx-auto shadow">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <p className="font-display font-extrabold text-base text-[#0FA34E]">No Issues Found</p>
        <p className="text-xs text-[#0B7C3C] font-medium">Your resume structure satisfies all KIIT placement criteria.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5 text-left">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-mono text-xs font-bold text-[#0FA34E] uppercase tracking-wider">
          Audit Flags & Issues
        </h3>
        <span className="text-xs font-mono font-bold bg-[#C6FF3D] text-[#0FA34E] px-2.5 py-0.5 rounded-full border border-[#0FA34E]/20">
          {total} total
        </span>
      </div>
      <SeveritySection severity="critical" flags={critical} defaultOpen={true} />
      <SeveritySection severity="warnings" flags={warnings} defaultOpen={false} />
      <SeveritySection severity="suggestions" flags={suggestions} defaultOpen={false} />
    </div>
  );
}

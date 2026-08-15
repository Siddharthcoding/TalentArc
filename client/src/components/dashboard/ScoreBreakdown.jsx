import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, GraduationCap, Briefcase, FolderGit2,
  Wrench, Trophy, Hash, SpellCheck, CheckCircle2,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/utils/cn';

const CATEGORY_CONFIG = {
  formatting: { icon: FileText, label: 'Formatting', maxScore: 10 },
  education: { icon: GraduationCap, label: 'Education', maxScore: 10 },
  experience: { icon: Briefcase, label: 'Experience', maxScore: 20 },
  projects: { icon: FolderGit2, label: 'Projects', maxScore: 15 },
  skills: { icon: Wrench, label: 'Skills', maxScore: 15 },
  achievements: { icon: Trophy, label: 'Achievements', maxScore: 5 },
  keywords: { icon: Hash, label: 'Keywords', maxScore: 15 },
  grammar: { icon: SpellCheck, label: 'Grammar', maxScore: 5 },
  atsCompatibility: { icon: CheckCircle2, label: 'ATS Compatibility', maxScore: 5 },
};

function DetailTooltip({ details }) {
  if (!details || Object.keys(details).length === 0) return null;
  const entries = Object.entries(details).filter(([, v]) => v !== undefined && v !== null);
  if (entries.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="pt-2 pb-1 space-y-1 border-t border-[#0FA34E]/20 mt-2">
        {entries.map(([key, value]) => (
          <p key={key} className="text-xs text-[#0B7C3C] font-mono font-medium">
            {key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}: {String(value)}
          </p>
        ))}
      </div>
    </motion.div>
  );
}

export default function ScoreBreakdown({ categories }) {
  if (!categories) return null;

  return (
    <div className="space-y-3 text-left">
      <h3 className="font-mono text-xs font-bold text-[#0FA34E] uppercase tracking-wider">
        Scoring Category Breakdown
      </h3>
      {Object.entries(CATEGORY_CONFIG).map(([key, config], index) => {
        const cat = categories[key];
        if (!cat) return null;
        const Icon = config.icon;
        const pct = cat.percentage || 0;

        return (
          <CategoryRow
            key={key}
            icon={Icon}
            label={config.label}
            score={cat.score}
            maxScore={cat.maxScore ?? config.maxScore}
            pct={pct}
            details={cat.details}
            index={index}
          />
        );
      })}
    </div>
  );
}

function CategoryRow({ icon: Icon, label, score, maxScore, pct, details, index }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="bg-[#F6E9D2] border-2 border-[#0FA34E]/20 rounded-2xl p-4 cursor-pointer hover:border-[#0FA34E] transition-colors shadow-sm"
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-xl bg-[#0FA34E] text-[#C6FF3D] flex items-center justify-center shrink-0 shadow">
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-display font-extrabold text-sm text-[#0FA34E] truncate">{label}</span>
            <span className="font-mono text-xs font-bold text-[#0FA34E] tabular-nums shrink-0">
              {score}/{maxScore}
            </span>
          </div>
        </div>
        <ChevronDown className={cn(
          'w-4 h-4 text-[#0FA34E] transition-transform duration-200 shrink-0',
          open && 'rotate-180'
        )} />
      </div>

      <div className="relative h-2 rounded-full bg-[#D7F27A] overflow-hidden border border-[#0FA34E]/20">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-[#0FA34E]"
          initial={{ width: '0%' }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: index * 0.05 + 0.1 }}
        />
      </div>

      <AnimatePresence>
        {open && <DetailTooltip details={details} />}
      </AnimatePresence>
    </motion.div>
  );
}

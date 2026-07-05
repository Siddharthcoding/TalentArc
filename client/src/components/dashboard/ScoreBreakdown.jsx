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

function getBarColor(pct) {
  if (pct >= 70) return 'bg-green-500';
  if (pct >= 40) return 'bg-amber-500';
  return 'bg-red-500';
}

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
      <div className="pt-2 pb-1 space-y-1">
        {entries.map(([key, value]) => (
          <p key={key} className="text-xs text-zinc-400 dark:text-zinc-500">
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
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
        Category Breakdown
      </h3>
      {Object.entries(CATEGORY_CONFIG).map(([key, config], index) => {
        const cat = categories[key];
        if (!cat) return null;
        const Icon = config.icon;
        const pct = cat.percentage || 0;
        const barColor = getBarColor(pct);

        return (
          <CategoryRow
            key={key}
            icon={Icon}
            label={config.label}
            score={cat.score}
            maxScore={cat.maxScore ?? config.maxScore}
            pct={pct}
            barColor={barColor}
            details={cat.details}
            index={index}
          />
        );
      })}
    </div>
  );
}

function CategoryRow({ icon: Icon, label, score, maxScore, pct, barColor, details, index }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      className="glass-card !p-4 cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors"
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">{label}</span>
            <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 tabular-nums shrink-0">
              {score}/{maxScore}
            </span>
          </div>
        </div>
        <ChevronDown className={cn(
          'w-4 h-4 text-zinc-400 transition-transform duration-200 shrink-0',
          open && 'rotate-180'
        )} />
      </div>

      <div className="relative h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
        <motion.div
          className={cn('absolute inset-y-0 left-0 rounded-full', barColor)}
          initial={{ width: '0%' }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: index * 0.06 + 0.2 }}
        />
      </div>

      <AnimatePresence>
        {open && <DetailTooltip details={details} />}
      </AnimatePresence>
    </motion.div>
  );
}

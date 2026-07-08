import { motion } from 'framer-motion';
import {
  Wrench, Briefcase, GraduationCap, Hash, Brain, RefreshCw,
} from 'lucide-react';
import { cn } from '@/utils/cn';

const CATEGORIES = [
  { key: 'skill', icon: Wrench, label: 'Skills Score' },
  { key: 'experience', icon: Briefcase, label: 'Experience Score' },
  { key: 'education', icon: GraduationCap, label: 'Education Score' },
  { key: 'keyword', icon: Hash, label: 'Keyword Score' },
  { key: 'semantic', icon: Brain, label: 'Semantic Score' },
  { key: 'rewrite', icon: RefreshCw, label: 'Rewrite Score' },
];

function getBarColor(pct) {
  if (pct >= 70) return 'bg-green-500';
  if (pct >= 40) return 'bg-amber-500';
  return 'bg-red-500';
}

function ScoreCard({ config, scoreData, index }) {
  const Icon = config.icon;
  const pct = scoreData?.percentage || 0;
  const score = scoreData?.score || 0;
  const barColor = getBarColor(pct);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.08, duration: 0.5, ease: 'easeOut' }}
      className="glass-card !p-5"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate">
            {config.label}
          </p>
        </div>
        <span className="text-sm font-bold text-zinc-600 dark:text-zinc-400 tabular-nums shrink-0">
          {score}%
        </span>
      </div>

      <div className="relative h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
        <motion.div
          className={cn('absolute inset-y-0 left-0 rounded-full', barColor)}
          initial={{ width: '0%' }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 + index * 0.08 }}
        />
      </div>
    </motion.div>
  );
}

export default function SubScoresGrid({ breakdown }) {
  if (!breakdown) return null;

  return (
    <div>
      <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-4">
        Comparative Sub-Scores
      </h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CATEGORIES.map((config, i) => (
          <ScoreCard
            key={config.key}
            config={config}
            scoreData={breakdown[config.key]}
            index={i}
          />
        ))}
      </div>
    </div>
  );
}
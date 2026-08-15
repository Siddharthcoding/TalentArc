import { motion } from 'framer-motion';
import {
  Wrench, Briefcase, GraduationCap, Hash, Brain, RefreshCw,
} from 'lucide-react';
import { cn } from '@/utils/cn';

const CATEGORIES = [
  { key: 'skill', icon: Wrench, label: 'Technical Skills' },
  { key: 'experience', icon: Briefcase, label: 'Work Experience' },
  { key: 'education', icon: GraduationCap, label: 'Education & Degree' },
  { key: 'keyword', icon: Hash, label: 'Keyword Density' },
  { key: 'semantic', icon: Brain, label: 'Semantic Context' },
  { key: 'rewrite', icon: RefreshCw, label: 'Action Metrics' },
];

function ScoreCard({ config, scoreData, index }) {
  const Icon = config.icon;
  const pct = scoreData?.percentage || 0;
  const score = scoreData?.score || 0;

  const barColor = pct >= 70 ? 'bg-[#0FA34E]' : pct >= 45 ? 'bg-[#E8A33D]' : 'bg-[#E1584A]';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 + index * 0.06, duration: 0.4, ease: 'easeOut' }}
      className="bg-[#F6E9D2] border-2 border-[#0FA34E]/20 rounded-2xl p-4 shadow-sm text-left hover:border-[#0FA34E]/50 transition-colors"
    >
      <div className="flex items-center gap-3 mb-2.5">
        <div className="w-8 h-8 rounded-xl bg-[#0FA34E] text-[#D7F27A] flex items-center justify-center shrink-0 shadow">
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-[#0FA34E] truncate font-mono">
            {config.label}
          </p>
        </div>
        <span className="text-xs font-mono font-extrabold text-[#0FA34E] tabular-nums shrink-0">
          {score}%
        </span>
      </div>

      <div className="relative h-2 rounded-full bg-[#0FA34E]/10 overflow-hidden">
        <motion.div
          className={cn('absolute inset-y-0 left-0 rounded-full', barColor)}
          initial={{ width: '0%' }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 + index * 0.06 }}
        />
      </div>
    </motion.div>
  );
}

export default function SubScoresGrid({ breakdown }) {
  if (!breakdown) return null;

  return (
    <div className="text-left space-y-3">
      <h3 className="font-mono text-xs font-bold text-[#0FA34E] uppercase tracking-wider">
        Multi-Factor Sub-Score Breakdown
      </h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
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

import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';
import { cn } from '@/utils/cn';

function getScoreColor(pct) {
  if (pct >= 70) return '#22c55e';
  if (pct >= 40) return '#f59e0b';
  return '#ef4444';
}

function getScoreGlow(pct) {
  if (pct >= 70) return 'rgba(34,197,94,0.25)';
  if (pct >= 40) return 'rgba(245,158,11,0.25)';
  return 'rgba(239,68,68,0.25)';
}

export default function ScoreGauge({ percentage = 0, score, maxScore }) {
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.round(percentage);

  const springValue = useSpring(0, { damping: 22, stiffness: 70 });
  const displayPct = useTransform(springValue, (v) => Math.round(v));

  useEffect(() => {
    springValue.set(pct);
  }, [pct, springValue]);

  const offset = circumference - (pct / 100) * circumference;
  const color = getScoreColor(pct);
  const glow = getScoreGlow(pct);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-48 md:w-56 md:h-56">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <defs>
            <filter id="gauge-glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-zinc-100 dark:text-zinc-800/60"
          />

          <motion.circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.4, ease: [0.32, 0.72, 0, 1] }}
            filter="url(#gauge-glow)"
            style={{ filter: `drop-shadow(0 0 6px ${glow})` }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="flex items-baseline">
            <motion.span className="text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white tabular-nums">
              {displayPct}
            </motion.span>
            <span className="text-2xl md:text-3xl font-bold text-zinc-300 dark:text-zinc-600 ml-0.5">%</span>
          </div>
          <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 mt-1 uppercase tracking-[0.12em]">
            Overall Score
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-4">
        <span className="text-sm font-medium text-zinc-400 dark:text-zinc-500 tabular-nums">
          {score}<span className="text-zinc-300 dark:text-zinc-600">/{maxScore}</span>
        </span>
        <span className={cn(
          'inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border',
          pct >= 70 && 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400 border-green-200/50 dark:border-green-800/40',
          pct >= 40 && pct < 70 && 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/40',
          pct < 40 && 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border-red-200/50 dark:border-red-800/40'
        )}>
          <span className={cn(
            'w-1.5 h-1.5 rounded-full',
            pct >= 70 && 'bg-green-500',
            pct >= 40 && pct < 70 && 'bg-amber-500',
            pct < 40 && 'bg-red-500'
          )} />
          {pct >= 70 ? 'Strong' : pct >= 40 ? 'Needs Work' : 'Weak'}
        </span>
      </div>
    </div>
  );
}

import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';
import { cn } from '@/utils/cn';

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

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-48 md:w-56 md:h-56">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="#0FA34E"
            strokeWidth="8"
            opacity="0.2"
          />

          <motion.circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="#0FA34E"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.4, ease: [0.32, 0.72, 0, 1] }}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="flex items-baseline">
            <motion.span className="font-display text-5xl md:text-6xl font-black tracking-tight text-[#0FA34E] tabular-nums">
              {displayPct}
            </motion.span>
            <span className="text-2xl md:text-3xl font-bold text-[#0B7C3C] ml-0.5">%</span>
          </div>
          <span className="font-mono text-[11px] font-bold text-[#0B7C3C] mt-1 uppercase tracking-wider">
            Overall Score
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-4">
        <span className="text-sm font-mono font-bold text-[#0FA34E] tabular-nums">
          {score}<span className="text-[#0B7C3C]/70">/{maxScore}</span>
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs font-mono font-extrabold px-3 py-1 rounded-full bg-[#0FA34E] text-[#C6FF3D] shadow">
          <span className="w-2 h-2 rounded-full bg-[#C6FF3D]" />
          {pct >= 70 ? 'Placement Ready' : pct >= 40 ? 'Moderate Fit' : 'Needs Optimization'}
        </span>
      </div>
    </div>
  );
}

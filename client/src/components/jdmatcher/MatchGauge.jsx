import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';
import { cn } from '@/utils/cn';

function getLabel(pct) {
  if (pct > 75) return 'Strong Recruiter Fit ★';
  if (pct >= 50) return 'Moderate Alignment';
  return 'Keyword Gap Detected';
}

export default function MatchGauge({ matchPercentage = 0 }) {
  const pct = Math.round(matchPercentage);

  const springValue = useSpring(0, { damping: 22, stiffness: 70 });
  const displayPct = useTransform(springValue, (v) => Math.round(v));

  useEffect(() => {
    springValue.set(pct);
  }, [pct, springValue]);

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  const label = getLabel(pct);

  const strokeColor = pct >= 70 ? '#0FA34E' : pct >= 45 ? '#E8A33D' : '#E1584A';

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative w-52 h-52 md:w-60 md:h-60">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke="#0FA34E"
            strokeWidth="8"
            opacity="0.15"
          />

          <motion.circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke={strokeColor}
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
            JD Fit Index
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-4">
        <span className="inline-flex items-center gap-1.5 text-xs font-mono font-extrabold px-3.5 py-1 rounded-full bg-[#0FA34E] text-[#C6FF3D] shadow">
          <span className="w-2 h-2 rounded-full bg-[#C6FF3D]" />
          {label}
        </span>
      </div>
    </div>
  );
}
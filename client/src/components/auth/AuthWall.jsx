import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, CheckCircle2, BarChart3, Lightbulb, BookOpen, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import GoogleButton from './GoogleButton';

const REPORT_LABELS = {
  ats: {
    title: 'ATS Score Analysis',
    bullets: [
      { icon: BarChart3, text: 'Full 100-point breakdown across 5 analysis layers' },
      { icon: Lightbulb, text: 'Keyword Optimization Blueprint with ranked suggestions' },
      { icon: BookOpen, text: 'AI-Powered Rewrite recommendations' },
      { icon: Sparkles, text: 'Save reports to your account for future reference' },
    ],
  },
  jd_match: {
    title: 'JD Match Report',
    bullets: [
      { icon: BarChart3, text: 'Comprehensive skill-by-skill match breakdown' },
      { icon: Lightbulb, text: 'Personalized skill gap analysis & roadmap' },
      { icon: BookOpen, text: 'AI rewrite suggestions tailored to the job' },
      { icon: Sparkles, text: 'Save matches to your account for later review' },
    ],
  },
};

function AuthWallInner({ reportType }) {
  const { login } = useAuth();
  const labels = REPORT_LABELS[reportType] || REPORT_LABELS.ats;

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-950/60 dark:to-violet-950/60 flex items-center justify-center shadow-lg shadow-indigo-500/10">
          <Lock className="w-9 h-9 text-indigo-600 dark:text-indigo-400" />
        </div>
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -inset-2.5 rounded-2xl border border-indigo-300/40 dark:border-indigo-500/30"
        />
      </div>

      <h2 className="text-2xl md:text-3xl font-bold mb-2">
        <span className="gradient-text">Your {labels.title} is Ready!</span>
      </h2>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8 max-w-sm">
        Sign in to unlock your full personalized report and insights.
      </p>

      <div className="relative w-full mb-8">
        <div className="glass-card p-6 relative overflow-hidden">
          <div className="absolute inset-0 backdrop-blur-sm bg-white/30 dark:bg-zinc-900/40" />
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="w-12 h-12 rounded-full bg-zinc-900/10 dark:bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <Lock className="w-6 h-6 text-zinc-500 dark:text-zinc-400" />
            </div>
          </div>
          <div className="relative z-0 opacity-30">
            <div className="flex items-center justify-between mb-3">
              <div className="h-3 w-24 rounded bg-zinc-300 dark:bg-zinc-600" />
              <div className="h-8 w-16 rounded-lg bg-gradient-to-r from-indigo-300 to-violet-300 dark:from-indigo-600 dark:to-violet-600" />
            </div>
            <div className="space-y-2">
              {[80, 60, 40].map((w) => (
                <div key={w} className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                  <div className={`h-2 rounded bg-zinc-200 dark:bg-zinc-700 flex-1`} style={{ maxWidth: `${w}%` }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full space-y-3 mb-8 text-left">
        {labels.bullets.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.08, duration: 0.4 }}
            className="flex items-start gap-3"
          >
            <div className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <span className="text-sm text-zinc-600 dark:text-zinc-300">{item.text}</span>
          </motion.div>
        ))}
      </div>

      <div className="w-full max-w-xs mx-auto">
        <GoogleButton onClick={login} />
      </div>

      <p className="mt-4 text-xs text-zinc-400 dark:text-zinc-500">
        Your results will be saved — no re-upload needed
      </p>
    </div>
  );
}

export default function AuthWall({ reportType, onAuthSuccess }) {
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user && onAuthSuccess) {
      onAuthSuccess(user);
    }
  }, [isAuthenticated, user, onAuthSuccess]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xl"
      >
        <motion.div
          initial={{ scale: 0.88, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.88, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="glass-card max-w-lg w-full p-8 md:p-10 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.02] to-violet-500/[0.02] dark:from-indigo-500/[0.04] dark:to-violet-500/[0.04] pointer-events-none" />
          <div className="relative">
            <AuthWallInner reportType={reportType} />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

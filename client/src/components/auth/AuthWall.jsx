import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, CheckCircle2, BarChart3, Lightbulb, BookOpen, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import GoogleButton from './GoogleButton';

const REPORT_LABELS = {
  ats: {
    title: 'ATS Score Analysis',
    bullets: [
      { icon: BarChart3, text: 'Full 100-point breakdown across all scoring categories' },
      { icon: Lightbulb, text: 'Keyword Optimization Blueprint with ranked suggestions' },
      { icon: BookOpen, text: 'AI-Powered Resume Rewrite recommendations' },
      { icon: Sparkles, text: 'Automatic report archive in your KIIT student profile' },
    ],
  },
  jd_match: {
    title: 'JD Match Report',
    bullets: [
      { icon: BarChart3, text: 'Comprehensive skill-by-skill match breakdown' },
      { icon: Lightbulb, text: 'Personalized skill gap analysis & learning roadmap' },
      { icon: BookOpen, text: 'AI rewrite suggestions tailored to the specific job description' },
      { icon: Sparkles, text: 'Save matches to your student account for later review' },
    ],
  },
};

function AuthWallInner({ reportType }) {
  const { login } = useAuth();
  const labels = REPORT_LABELS[reportType] || REPORT_LABELS.ats;

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative mb-5">
        <div className="w-16 h-16 rounded-2xl bg-[#0FA34E] text-[#D7F27A] flex items-center justify-center shadow-lg shadow-[#0FA34E]/20">
          <Lock className="w-8 h-8" />
        </div>
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -inset-2 rounded-2xl border-2 border-[#0FA34E]/30 pointer-events-none"
        />
      </div>

      <div className="inline-block bg-[#0FA34E]/10 text-[#0FA34E] font-mono text-[10px] font-black px-3 py-0.5 rounded-full uppercase border border-[#0FA34E]/20 mb-2">
        ★ KIIT STUDENT ACCESS GATEWAY
      </div>

      <h2 className="text-2xl md:text-3xl font-extrabold text-[#0FA34E] mb-2 font-display">
        Your {labels.title} is Ready!
      </h2>
      <p className="text-sm font-medium text-[#0B7C3C] mb-6 max-w-sm leading-relaxed">
        Sign in with your Google account to unlock your full detailed report and save it to your archive.
      </p>

      {/* Feature bullets */}
      <div className="w-full space-y-2.5 mb-6 text-left bg-[#DFF5E6] border border-[#0FA34E]/20 p-4 rounded-2xl">
        {labels.bullets.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + i * 0.06, duration: 0.3 }}
            className="flex items-start gap-2.5"
          >
            <div className="mt-0.5 shrink-0 w-4 h-4 rounded-full bg-[#0FA34E] text-[#D7F27A] flex items-center justify-center">
              <CheckCircle2 className="w-3 h-3" />
            </div>
            <span className="text-xs font-semibold text-[#0B7C3C]">{item.text}</span>
          </motion.div>
        ))}
      </div>

      <div className="w-full max-w-xs mx-auto">
        <GoogleButton onClick={login} />
      </div>

      <p className="mt-4 text-[11px] font-mono font-bold text-[#0B7C3C]/70">
        🔒 Results automatically saved — no re-upload required
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
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 26, stiffness: 280 }}
          className="bg-[#F6E9D2] border-2 border-[#0FA34E] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden"
        >
          <div className="relative">
            <AuthWallInner reportType={reportType} />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

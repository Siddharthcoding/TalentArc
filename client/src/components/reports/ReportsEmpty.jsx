import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileSearch, FolderOpen } from 'lucide-react';
import AnimatedButton from '@/components/ui/AnimatedButton';

export default function ReportsEmpty() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center text-center py-20"
    >
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-zinc-100 to-zinc-50 dark:from-zinc-800/60 dark:to-zinc-900/60 flex items-center justify-center">
          <FolderOpen className="w-12 h-12 text-zinc-300 dark:text-zinc-600" />
        </div>
        <div className="absolute -top-2 -right-2 w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center shadow-lg">
          <FileSearch className="w-5 h-5 text-indigo-500" />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-200 mb-3">
        No saved reports yet
      </h2>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mb-8 leading-relaxed">
        Run your first ATS analysis or JD match to see your results here.
        Once you're signed in, every report is automatically saved to your account.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link to="/dashboard">
          <AnimatedButton variant="primary" className="w-full sm:w-auto">
            Analyze Resume
          </AnimatedButton>
        </Link>
        <Link to="/jd-matcher">
          <AnimatedButton variant="secondary" className="w-full sm:w-auto">
            Match Job Description
          </AnimatedButton>
        </Link>
      </div>
    </motion.div>
  );
}

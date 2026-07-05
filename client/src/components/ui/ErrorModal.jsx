import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, RefreshCw, FileX, X } from 'lucide-react';
import AnimatedButton from './AnimatedButton';

export default function ErrorModal({ error, onRetry, onReset }) {
  if (!error) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-md"
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative glass-card max-w-md w-full p-0 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/[0.03] to-rose-500/[0.03] dark:from-red-500/[0.05] dark:to-rose-500/[0.05] pointer-events-none" />

          <div className="relative p-8">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/40 dark:to-rose-950/40 flex items-center justify-center shadow-lg shadow-red-500/10">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -inset-2 rounded-2xl border border-red-200/50 dark:border-red-800/30"
                />
              </div>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                {error.title || 'Upload Failed'}
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-sm mx-auto">
                {error.message || 'An unexpected error occurred.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <AnimatedButton
                variant="primary"
                size="lg"
                onClick={onRetry}
                icon={RefreshCw}
                className="w-full sm:w-auto shadow-lg shadow-indigo-500/20"
              >
                Try Again
              </AnimatedButton>
              <AnimatedButton
                variant="secondary"
                size="lg"
                onClick={onReset}
                icon={FileX}
                className="w-full sm:w-auto"
              >
                Choose Different File
              </AnimatedButton>
            </div>
          </div>

          <button
            onClick={onReset}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

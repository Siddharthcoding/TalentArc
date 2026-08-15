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
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative bg-[#F6E9D2] border-2 border-[#E1584A] rounded-3xl max-w-md w-full p-8 shadow-2xl overflow-hidden text-center"
        >
          <div className="flex justify-center mb-5">
            <div className="w-16 h-16 rounded-2xl bg-[#E1584A] text-white flex items-center justify-center shadow-lg">
              <AlertCircle className="w-8 h-8" />
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-extrabold text-[#0FA34E] mb-2 font-display">
              {error.title || 'Upload Failed'}
            </h2>
            <p className="text-sm font-medium text-[#0B7C3C] leading-relaxed max-w-sm mx-auto">
              {error.message || 'An unexpected error occurred during processing.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <AnimatedButton
              variant="primary"
              size="md"
              onClick={onRetry}
              icon={RefreshCw}
              className="w-full sm:w-auto"
            >
              Try Again
            </AnimatedButton>
            <AnimatedButton
              variant="secondary"
              size="md"
              onClick={onReset}
              icon={FileX}
              className="w-full sm:w-auto"
            >
              Choose Different File
            </AnimatedButton>
          </div>

          <button
            onClick={onReset}
            className="absolute top-4 right-4 p-1.5 rounded-full text-[#0FA34E]/70 hover:text-[#0FA34E] hover:bg-[#0FA34E]/10 transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

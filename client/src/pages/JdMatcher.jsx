import { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { JdMatcherProvider, useJdMatcher } from '@/context/JdMatcherContext';
import DualInputPane from '@/components/jdmatcher/DualInputPane';
import ProcessingState from '@/components/jdmatcher/ProcessingState';
import MatchDashboard from '@/components/jdmatcher/MatchDashboard';
import ErrorModal from '@/components/ui/ErrorModal';

function JdMatcherContent() {
  const { status, progressStep, result, error, startMatch, retry, reset } = useJdMatcher();

  const handleCompare = useCallback(({ resumeFile, jdText, jdFile }) => {
    startMatch(resumeFile, jdText, jdFile);
  }, [startMatch]);

  return (
    <section className="relative min-h-screen pt-24 pb-16 overflow-hidden">
      <div className="absolute inset-0 bg-grid pointer-events-none" />
      <div className="absolute top-1/3 -left-32 w-96 h-96 bg-indigo-400/8 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 -right-32 w-96 h-96 bg-violet-400/8 rounded-full blur-3xl" />

      <div className="section-container relative z-10">
        <AnimatePresence mode="wait">
          {status === 'idle' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
            >
              <DualInputPane onCompare={handleCompare} />
            </motion.div>
          )}

          {(status === 'matching') && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <ProcessingState activeStep={progressStep} />
              <div className="flex justify-center">
                <button
                  onClick={reset}
                  className="text-sm text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors underline underline-offset-2"
                >
                  Cancel & start over
                </button>
              </div>
            </motion.div>
          )}

          {status === 'complete' && result && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
            >
              <MatchDashboard data={result} onReset={reset} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {status === 'error' && error && (
        <ErrorModal error={error} onRetry={retry} onReset={reset} />
      )}
    </section>
  );
}

export default function JdMatcher() {
  return (
    <JdMatcherProvider>
      <JdMatcherContent />
    </JdMatcherProvider>
  );
}
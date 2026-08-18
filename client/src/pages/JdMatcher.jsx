import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { JdMatcherProvider, useJdMatcher } from '@/context/JdMatcherContext';
import { useAuth } from '@/context/AuthContext';
import DualInputPane from '@/components/jdmatcher/DualInputPane';
import ProcessingState from '@/components/jdmatcher/ProcessingState';
import MatchDashboard from '@/components/jdmatcher/MatchDashboard';
import AuthWall from '@/components/auth/AuthWall';
import ErrorModal from '@/components/ui/ErrorModal';
import SEO from '@/components/SEO';
import PaymentModal from '@/components/payment/PaymentModal';
import FreeTrialBadge from '@/components/payment/FreeTrialBadge';
import { useAccess } from '@/hooks/useAccess';

function JdMatcherContent() {
  const { status, progressStep, result, error, paywallError, startMatch, retry, reset, clearPaywall } = useJdMatcher();
  const { isAuthenticated, loading, user } = useAuth();
  const { hasPro, trialUsed, loading: accessLoading, refresh: refreshAccess } = useAccess();
  const [showAuthWall, setShowAuthWall] = useState(false);
  const [cachedResult, setCachedResult] = useState(null);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    try {
      const pending = sessionStorage.getItem('pendingReport');
      if (pending) {
        const parsed = JSON.parse(pending);
        if (parsed.type === 'jd_match') {
          setCachedResult(parsed.data);
          sessionStorage.removeItem('pendingReport');
        }
      }
    } catch {
    }
  }, []);

  useEffect(() => {
    if (status === 'complete' && result && !loading) {
      if (!isAuthenticated) {
        try {
          sessionStorage.setItem('pendingReport', JSON.stringify({ type: 'jd_match', data: result }));
        } catch {
        }
        setShowAuthWall(true);
      }
    }
  }, [status, result, isAuthenticated, loading]);

  // Open paywall modal on 402 error from context
  useEffect(() => {
    if (paywallError) setShowPaywall(true);
  }, [paywallError]);

  const handleAuthSuccess = useCallback(() => {
    setShowAuthWall(false);
  }, []);

  const handleReset = useCallback(() => {
    setCachedResult(null);
    reset();
  }, [reset]);

  const handlePaywallClose = useCallback(() => {
    setShowPaywall(false);
    clearPaywall?.();
  }, [clearPaywall]);

  const handlePaywallSuccess = useCallback(() => {
    setShowPaywall(false);
    clearPaywall?.();
    refreshAccess();
  }, [clearPaywall, refreshAccess]);

  const handleCompare = useCallback(({ resumeFile, jdText, jdFile }) => {
    startMatch(resumeFile, jdText, jdFile);
  }, [startMatch]);

  const effectiveStatus = cachedResult ? 'complete' : status;
  const effectiveResult = cachedResult || result;

  return (
    <section className="relative min-h-screen pt-28 pb-16 overflow-hidden">
      <div className="absolute inset-0 bg-grid pointer-events-none" />
      <div className="absolute top-1/3 -left-32 w-96 h-96 bg-cyan-400/15 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 -right-32 w-96 h-96 bg-fuchsia-400/15 rounded-full blur-3xl" />

      <div className="section-container relative z-10">
        <AnimatePresence mode="wait">
          {effectiveStatus === 'idle' && !cachedResult && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-center mb-4">
                <FreeTrialBadge
                  service="jd_match"
                  trialUsed={trialUsed('jd_match')}
                  hasPro={hasPro}
                  loading={accessLoading}
                />
              </div>
              <DualInputPane onCompare={handleCompare} />
              {trialUsed('jd_match') && !hasPro && (
                <div className="text-center mt-3">
                  <button
                    onClick={() => setShowPaywall(true)}
                    className="text-xs font-bold underline underline-offset-2"
                    style={{ color: '#0FA34E' }}
                  >
                    Upgrade to Pro for unlimited matching →
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {effectiveStatus === 'matching' && (
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
                  onClick={handleReset}
                  className="text-sm text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors underline underline-offset-2"
                >
                  Cancel & start over
                </button>
              </div>
            </motion.div>
          )}

          {effectiveStatus === 'complete' && effectiveResult && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
            >
              <MatchDashboard data={effectiveResult} onReset={handleReset} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {status === 'error' && error && (
        <ErrorModal error={error} onRetry={retry} onReset={handleReset} />
      )}

      {showAuthWall && (
        <AuthWall reportType="jd_match" onAuthSuccess={handleAuthSuccess} />
      )}

      <PaymentModal
        isOpen={showPaywall || !!paywallError}
        onClose={handlePaywallClose}
        mode="subscription"
        user={user}
        onSuccess={handlePaywallSuccess}
      />
    </section>
  );
}

export default function JdMatcher() {
  return (
    <>
      <SEO
        title="JD Skill Matcher"
        description="Paste any job description and match it against your resume. See missing skills, keyword gaps, and get tailored improvement tips to land more interviews at KIIT campus placements."
        path="/jd-matcher"
        keywords="JD matcher, job description skill match, KIIT placement JD, resume keyword gap, skill gap analysis"
      />
      <JdMatcherProvider>
        <JdMatcherContent />
      </JdMatcherProvider>
    </>
  );
}

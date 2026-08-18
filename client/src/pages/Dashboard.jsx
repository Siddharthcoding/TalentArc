import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ResumeProvider, useResume } from '@/context/ResumeContext';
import { useAuth } from '@/context/AuthContext';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import ErrorModal from '@/components/ui/ErrorModal';
import Dropzone from '@/components/upload/Dropzone';
import UploadProgress from '@/components/upload/UploadProgress';
import DashboardGrid from '@/components/dashboard/DashboardGrid';
import AuthWall from '@/components/auth/AuthWall';
import SEO from '@/components/SEO';
import SectionWrapper from '@/components/ui/SectionWrapper';
import PaymentModal from '@/components/payment/PaymentModal';
import FreeTrialBadge from '@/components/payment/FreeTrialBadge';
import { useAccess } from '@/hooks/useAccess';

function DashboardContent() {
  const { status, file, result, error, paywallError, progressStep, stepLabels, selectFile, retry, reset, clearPaywall } = useResume();
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
        if (parsed.type === 'ats') {
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
          sessionStorage.setItem('pendingReport', JSON.stringify({ type: 'ats', data: result }));
        } catch {
        }
        setShowAuthWall(true);
      }
    }
  }, [status, result, isAuthenticated, loading]);

  // Surface paywall modal when context emits PAYWALL action
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
    // Re-trigger analysis if file is available
    if (file) selectFile(file);
  }, [clearPaywall, refreshAccess, file, selectFile]);

  const effectiveStatus = cachedResult ? 'complete' : status;
  const effectiveResult = cachedResult || result;

  return (
    <SectionWrapper className="min-h-[calc(100vh-4rem)] flex items-center pt-28">
      <div className="w-full max-w-6xl mx-auto">
        <AnimatePresence mode="wait">
          {effectiveStatus === 'idle' && !cachedResult && (
            <div key="dropzone" className="max-w-lg mx-auto space-y-3">
              <div className="flex justify-center">
                <FreeTrialBadge
                  service="ats"
                  trialUsed={trialUsed('ats')}
                  hasPro={hasPro}
                  loading={accessLoading}
                />
              </div>
              <Dropzone onFileSelect={selectFile} />
              {trialUsed('ats') && !hasPro && (
                <div className="text-center mt-2">
                  <button
                    onClick={() => setShowPaywall(true)}
                    className="text-xs font-bold underline underline-offset-2"
                    style={{ color: '#0FA34E' }}
                  >
                    Upgrade to Pro for unlimited scans →
                  </button>
                </div>
              )}
            </div>
          )}

          {(effectiveStatus === 'uploading' || effectiveStatus === 'analyzing') && (
            <div key="progress" className="max-w-lg mx-auto">
              <UploadProgress step={progressStep} file={file} />
            </div>
          )}

          {effectiveStatus === 'complete' && effectiveResult && (
            <div key="results">
              <DashboardGrid result={effectiveResult} />
            </div>
          )}
        </AnimatePresence>

        {status === 'error' && error && (
          <ErrorModal
            error={error}
            onRetry={retry}
            onReset={handleReset}
          />
        )}
      </div>

      {showAuthWall && (
        <AuthWall reportType="ats" onAuthSuccess={handleAuthSuccess} />
      )}

      <PaymentModal
        isOpen={showPaywall || !!paywallError}
        onClose={handlePaywallClose}
        mode="subscription"
        user={user}
        onSuccess={handlePaywallSuccess}
      />
    </SectionWrapper>
  );
}

export default function Dashboard() {
  return (
    <>
      <SEO
        title="ATS Resume Checker"
        description="Instantly score your resume against ATS systems used by top campus recruiters at KIIT. Upload your resume and get a detailed ATS compatibility report with keyword and skill gap analysis."
        path="/dashboard"
        keywords="ATS resume checker, resume score, KIIT ATS, resume parser, ATS compatibility"
      />
      <ErrorBoundary>
        <ResumeProvider>
          <DashboardContent />
        </ResumeProvider>
      </ErrorBoundary>
    </>
  );
}

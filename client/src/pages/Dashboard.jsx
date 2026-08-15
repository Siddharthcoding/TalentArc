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
import SectionWrapper from '@/components/ui/SectionWrapper';

function DashboardContent() {
  const { status, file, result, error, progressStep, stepLabels, selectFile, retry, reset } = useResume();
  const { isAuthenticated, loading } = useAuth();
  const [showAuthWall, setShowAuthWall] = useState(false);
  const [cachedResult, setCachedResult] = useState(null);

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

  const handleAuthSuccess = useCallback(() => {
    setShowAuthWall(false);
  }, []);

  const handleReset = useCallback(() => {
    setCachedResult(null);
    reset();
  }, [reset]);

  const effectiveStatus = cachedResult ? 'complete' : status;
  const effectiveResult = cachedResult || result;

  return (
    <SectionWrapper className="min-h-[calc(100vh-4rem)] flex items-center pt-28">
      <div className="w-full max-w-6xl mx-auto">
        <AnimatePresence mode="wait">
          {effectiveStatus === 'idle' && !cachedResult && (
            <div key="dropzone" className="max-w-lg mx-auto">
              <Dropzone onFileSelect={selectFile} />
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
    </SectionWrapper>
  );
}

export default function Dashboard() {
  return (
    <ErrorBoundary>
      <ResumeProvider>
        <DashboardContent />
      </ResumeProvider>
    </ErrorBoundary>
  );
}

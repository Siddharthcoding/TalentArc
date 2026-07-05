import { AnimatePresence } from 'framer-motion';
import { ResumeProvider, useResume } from '@/context/ResumeContext';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import ErrorModal from '@/components/ui/ErrorModal';
import Dropzone from '@/components/upload/Dropzone';
import UploadProgress from '@/components/upload/UploadProgress';
import DashboardGrid from '@/components/dashboard/DashboardGrid';
import SectionWrapper from '@/components/ui/SectionWrapper';

function DashboardContent() {
  const { status, file, result, error, progressStep, stepLabels, selectFile, retry, reset } = useResume();

  return (
    <SectionWrapper className="min-h-[calc(100vh-4rem)] flex items-center pt-20">
      <div className="w-full max-w-6xl mx-auto">
        <AnimatePresence mode="wait">
          {status === 'idle' && (
            <div key="dropzone" className="max-w-lg mx-auto">
              <Dropzone onFileSelect={selectFile} />
            </div>
          )}

          {(status === 'uploading' || status === 'analyzing') && (
            <div key="progress" className="max-w-lg mx-auto">
              <UploadProgress step={progressStep} file={file} />
            </div>
          )}

          {status === 'complete' && result && (
            <div key="results">
              <DashboardGrid result={result} />
            </div>
          )}
        </AnimatePresence>

        {status === 'error' && error && (
          <ErrorModal
            error={error}
            onRetry={retry}
            onReset={reset}
          />
        )}
      </div>
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

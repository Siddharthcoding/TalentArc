import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, AlertTriangle, Loader2, Flag, ChevronLeft, ChevronRight, Check, Maximize2 } from 'lucide-react';
import { getAssessment, submitAssessment, updateFullscreenViolations } from '@/services/api';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

function AssessmentSessionContent() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Assessment State
  const [assessment, setAssessment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Test Runner State
  const [preTestModal, setPreTestModal] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // questionId -> selectedOptionIdx
  const [flaggedQuestions, setFlaggedQuestions] = useState({}); // questionId -> boolean
  const [timeLeft, setTimeLeft] = useState(0);

  // Fullscreen & Anti-Cheat State
  const [violationsCount, setViolationsCount] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [isTerminated, setIsTerminated] = useState(false);

  // Refs
  const timerIntervalRef = useRef(null);
  const isSubmittingRef = useRef(false);

  // Fetch assessment metadata
  const fetchDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAssessment(id);
      if (res.success && res.data) {
        setAssessment(res.data);
        setQuestions(res.data.questions || []);
        setTimeLeft(res.data.durationSeconds || 600);
        setViolationsCount(res.data.fullscreenViolations || 0);

        if (res.data.status === 'completed' || res.data.status === 'terminated') {
          // If already completed, skip directly to report
          navigate(`/assessment/${id}/report`, { replace: true });
        }
      } else {
        throw new Error(res.error || 'Failed to fetch details');
      }
    } catch (err) {
      setError(err?.message || 'Failed to load assessment session.');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  // Submit test
  const handleFinalSubmit = useCallback(async (forcedTermination = false) => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setSubmitting(true);
    clearInterval(timerIntervalRef.current);

    // Format answers for submission
    const answersPayload = Object.entries(selectedAnswers).map(([qId, val]) => ({
      questionId: qId,
      selectedOption: val,
    }));

    try {
      await submitAssessment(id, answersPayload);
      if (document.fullscreenElement) {
        try { await document.exitFullscreen(); } catch {}
      }
      navigate(`/assessment/${id}/report`, { replace: true });
    } catch (err) {
      setError(err?.message || 'Error submitting your answers.');
      isSubmittingRef.current = false;
      setSubmitting(false);
    }
  }, [id, selectedAnswers, navigate]);

  // Timer Countdown Effect
  useEffect(() => {
    if (!preTestModal && timeLeft > 0 && !isTerminated) {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            // Trigger auto submission
            handleFinalSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerIntervalRef.current);
  }, [preTestModal, timeLeft, isTerminated, handleFinalSubmit]);

  // Fullscreen Entry
  const requestFullscreenLock = async () => {
    try {
      const docEl = document.documentElement;
      if (docEl.requestFullscreen) {
        await docEl.requestFullscreen();
      }
      setPreTestModal(false);
      setShowWarningModal(false);
    } catch (err) {
      console.warn('Fullscreen request failed:', err);
      // Still proceed but print warning
      setPreTestModal(false);
    }
  };

  // Fullscreen Change Monitor
  const handleFullscreenChange = useCallback(async () => {
    // If test is currently active and not terminated, check for exit
    if (!preTestModal && !isSubmittingRef.current && !isTerminated) {
      if (!document.fullscreenElement) {
        // Exited fullscreen!
        console.warn('[Assessment] Fullscreen exit detected!');
        
        try {
          // Call backend to increment violation
          const res = await updateFullscreenViolations(id);
          if (res.success && res.data) {
            const count = res.data.fullscreenViolations || res.data.violations || 0;
            setViolationsCount(count);

            if (res.data.status === 'terminated') {
              setIsTerminated(true);
              clearInterval(timerIntervalRef.current);
              return;
            }
          }
        } catch (err) {
          console.error('[Assessment] Failed to log violation:', err);
        }

        // Show warning modal
        setShowWarningModal(true);
      }
    }
  }, [preTestModal, isTerminated, id]);

  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [handleFullscreenChange]);

  // Navigation callbacks
  const handleSelectOption = (idx) => {
    const qId = questions[currentIndex].id;
    setSelectedAnswers((prev) => ({ ...prev, [qId]: idx }));
  };

  const toggleFlag = () => {
    const qId = questions[currentIndex].id;
    setFlaggedQuestions((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 z-50" style={{ background: '#0B2A1A' }}>
        <Loader2 className="w-10 h-10 animate-spin" style={{ color: '#D7F27A' }} />
        <p className="text-sm font-semibold" style={{ color: '#DFF5E6' }}>Loading your timed session...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 p-4 z-50" style={{ background: '#0B2A1A' }}>
        <AlertTriangle className="w-12 h-12" style={{ color: '#E1584A' }} />
        <h2 className="text-xl font-bold" style={{ color: '#D7F27A', fontFamily: '"Baloo 2", cursive' }}>Session Error</h2>
        <p className="text-sm max-w-md text-center" style={{ color: '#DFF5E6' }}>{error}</p>
        <button
          onClick={() => navigate('/assessment')}
          className="px-5 py-2.5 text-sm font-bold rounded-full transition-colors"
          style={{ background: '#0FA34E', color: '#D7F27A' }}
        >
          Return to Portal
        </button>
      </div>
    );
  }

  // Pre-test instructions screen
  if (preTestModal) {
    return (
      <div className="fixed inset-0 flex items-center justify-center p-4 z-50 overflow-y-auto" style={{ background: '#0B2A1A' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-[2rem] p-6 sm:p-8 max-w-xl w-full shadow-2xl relative overflow-hidden border-2"
          style={{ background: '#0F3B22', borderColor: '#0FA34E44' }}
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-[2rem]"
            style={{ background: 'linear-gradient(90deg, #0FA34E, #D7F27A, #0FA34E)' }} />
          <h2 className="text-2xl font-extrabold mb-4 tracking-tight"
            style={{ fontFamily: '"Baloo 2", cursive', color: '#D7F27A' }}>
            Security &amp; Fullscreen Policy
          </h2>

          <div className="space-y-4 text-sm leading-relaxed mb-6" style={{ color: '#DFF5E6' }}>
            <p>
              This is a timed, proctored mock assessment for{' '}
              <strong style={{ color: '#D7F27A' }}>&#34;{assessment?.topic}&#34;</strong>.{' '}
              To simulate actual test conditions, agree to the following rules:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong style={{ color: '#D7F27A' }}>Fullscreen Lock</strong>: The assessment runs strictly in fullscreen.</li>
              <li><strong style={{ color: '#E8A33D' }}>1st Warning</strong>: Exiting fullscreen triggers a system warning pop-up.</li>
              <li><strong style={{ color: '#E1584A' }}>Automatic Termination</strong>: If you exit fullscreen a second time, the test terminates immediately, registering a score of 0.</li>
              <li><strong style={{ color: '#D7F27A' }}>Time Limit</strong>: The test auto-submits when the timer reaches 0.</li>
            </ul>
          </div>

          <button
            onClick={requestFullscreenLock}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 font-bold rounded-2xl shadow-lg transition-all text-sm"
            style={{ background: '#0FA34E', color: '#D7F27A' }}
          >
            <Maximize2 className="w-4 h-4 shrink-0" />
            Accept &amp; Enter Full Screen
          </button>
        </motion.div>
      </div>
    );
  }

  // Auto termination splash
  if (isTerminated) {
    return (
      <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{ background: '#0B2A1A' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center rounded-3xl p-8 max-w-md w-full shadow-2xl border-2"
          style={{ background: '#0F3B22', borderColor: '#E1584A44' }}
        >
          <AlertTriangle className="w-16 h-16 mx-auto mb-4 animate-bounce" style={{ color: '#E1584A' }} />
          <h2 className="text-2xl font-extrabold mb-2" style={{ fontFamily: '"Baloo 2", cursive', color: '#D7F27A' }}>Test Terminated</h2>
          <p className="text-sm leading-relaxed mb-6" style={{ color: '#DFF5E6' }}>
            Your assessment was auto-terminated and submitted with a score of 0 because you exited full screen mode multiple times.
          </p>
          <button
            onClick={() => handleFinalSubmit(true)}
            className="w-full py-3 font-bold rounded-xl shadow-lg transition-colors text-sm"
            style={{ background: '#E1584A', color: '#F6E9D2' }}
          >
            View Violation Report
          </button>
        </motion.div>
      </div>
    );
  }

  // Active warning overlay
  if (showWarningModal) {
    return (
      <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{ background: '#0B2A1Acc' }}>
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl border-2"
          style={{ background: '#0F3B22', borderColor: '#E8A33D44' }}
        >
          <AlertTriangle className="w-14 h-14 mx-auto mb-4 animate-pulse" style={{ color: '#E8A33D' }} />
          <h2 className="text-xl font-bold mb-2" style={{ fontFamily: '"Baloo 2", cursive', color: '#D7F27A' }}>Fullscreen Exit Detected!</h2>
          <p className="text-sm leading-relaxed mb-6" style={{ color: '#DFF5E6' }}>
            This is your <span style={{ color: '#E8A33D', fontWeight: 700 }}>1st Warning</span>. If you exit fullscreen again, the assessment will terminate immediately.
          </p>
          <button
            onClick={requestFullscreenLock}
            className="w-full py-3 font-bold rounded-xl shadow-lg transition-colors text-sm"
            style={{ background: '#E8A33D', color: '#0B2A1A' }}
          >
            Re-enter Full Screen
          </button>
        </motion.div>
      </div>
    );
  }

  // Format time remaining
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentIndex];
  const selectedOptionIdx = selectedAnswers[currentQuestion?.id];
  const isFlagged = flaggedQuestions[currentQuestion?.id];

  return (
    <div className="fixed inset-0 flex flex-col z-40 select-none overflow-hidden" style={{ background: '#0B2A1A', color: '#F6E9D2' }}>
      {/* Header */}
      <header className="relative h-16 shrink-0 border-b px-6 flex items-center justify-between" style={{ borderColor: '#0FA34E33', background: '#0F3B22' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black"
            style={{ background: '#0FA34E', color: '#D7F27A', fontFamily: '"Baloo 2", cursive' }}>KA</div>
          <span className="text-sm font-semibold" style={{ color: '#DFF5E6' }}>
            Assessment: <strong style={{ color: '#D7F27A' }}>{assessment?.topic}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl border"
          style={{ background: '#0FA34E22', borderColor: '#0FA34E44' }}>
          <Timer className={`w-4 h-4 ${timeLeft < 60 ? 'animate-pulse' : ''}`}
            style={{ color: timeLeft < 60 ? '#E1584A' : '#D7F27A' }} />
          <span className="text-sm font-bold" style={{ color: timeLeft < 60 ? '#E1584A' : '#D7F27A', fontFamily: '"JetBrains Mono", monospace' }}>
            {formatTime(timeLeft)}
          </span>
        </div>
      </header>

      {/* Main Work Area */}
      <div className="relative flex-1 flex min-h-0">
        {/* MCQ Player */}
        <main className="flex-1 flex flex-col justify-between p-6 sm:p-12 overflow-y-auto max-w-4xl mx-auto">
          <div className="my-auto space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#D7F27A' }}>
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wider"
                  style={{ color: '#DFF5E6', borderColor: '#0FA34E44', background: '#0FA34E22' }}>
                  {currentQuestion?.topic || assessment?.topic}
                </span>
              </div>
              <h1 className="text-lg sm:text-2xl font-bold leading-snug" style={{ color: '#F6E9D2' }}>
                {currentQuestion?.question_text}
              </h1>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 gap-3.5">
              {currentQuestion?.options.map((opt, oIdx) => {
                const isSelected = selectedOptionIdx === oIdx;
                return (
                  <button
                    key={oIdx}
                    onClick={() => handleSelectOption(oIdx)}
                    className="flex items-center justify-between text-left p-4 rounded-2xl border text-sm font-semibold transition-all"
                    style={{
                      background: isSelected ? '#0FA34E22' : '#0F3B22',
                      borderColor: isSelected ? '#D7F27A' : '#0FA34E44',
                      color: isSelected ? '#D7F27A' : '#DFF5E6',
                    }}
                  >
                    <span>{opt}</span>
                    <div className="w-5 h-5 rounded-full border flex items-center justify-center shrink-0"
                      style={{ borderColor: isSelected ? '#D7F27A' : '#0FA34E44', background: isSelected ? '#D7F27A' : 'transparent' }}>
                      {isSelected && <Check className="w-3.5 h-3.5" style={{ color: '#0B2A1A' }} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Controls */}
          <footer className="h-16 shrink-0 flex items-center justify-between border-t mt-8 pt-6" style={{ borderColor: '#0FA34E22' }}>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="p-3 border rounded-2xl transition-colors disabled:opacity-30 disabled:pointer-events-none"
                style={{ borderColor: '#0FA34E44', color: '#D7F27A' }}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={toggleFlag}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl border text-xs font-semibold transition-colors"
                style={{
                  borderColor: isFlagged ? '#E8A33D44' : '#0FA34E44',
                  background: isFlagged ? '#E8A33D22' : 'transparent',
                  color: isFlagged ? '#E8A33D' : '#DFF5E6',
                }}
              >
                <Flag className={`w-4 h-4 shrink-0 ${isFlagged ? 'fill-current' : ''}`} />
                Flag for review
              </button>
            </div>

            {currentIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIndex((prev) => prev + 1)}
                className="flex items-center gap-1.5 px-6 py-3 font-bold rounded-2xl shadow-lg transition-colors text-sm"
                style={{ background: '#0FA34E', color: '#D7F27A' }}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => handleFinalSubmit()}
                disabled={submitting}
                className="flex items-center gap-1.5 px-6 py-3 font-bold rounded-2xl shadow-lg transition-colors text-sm disabled:opacity-60"
                style={{ background: '#D7F27A', color: '#0B2A1A' }}
              >
                {submitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />Submitting...</>
                ) : 'Finish Assessment'}
              </button>
            )}
          </footer>
        </main>

        {/* Right Side: Navigation Panel */}
        <aside className="hidden md:block w-72 border-l p-6 overflow-y-auto" style={{ borderColor: '#0FA34E33', background: '#0F3B22' }}>
          <h2 className="text-xs font-bold uppercase tracking-widest mb-6" style={{ color: '#D7F27A' }}>Question Sheet</h2>
          <div className="grid grid-cols-5 gap-2.5 mb-8">
            {questions.map((q, idx) => {
              const isCurrent = currentIndex === idx;
              const isAnswered = selectedAnswers[q.id] !== undefined;
              const isQFlagged = flaggedQuestions[q.id];
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className="w-10 h-10 rounded-xl font-bold text-xs flex items-center justify-center relative transition-all border"
                  style={{
                    borderColor: isCurrent ? '#D7F27A' : '#0FA34E44',
                    background: isCurrent ? '#D7F27A22' : isAnswered ? '#0FA34E22' : 'transparent',
                    color: isCurrent ? '#D7F27A' : isAnswered ? '#DFF5E6' : '#DFF5E688',
                  }}
                >
                  {idx + 1}
                  {isQFlagged && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border"
                      style={{ background: '#E8A33D', borderColor: '#0B2A1A' }} />
                  )}
                </button>
              );
            })}
          </div>
          <div className="space-y-3.5 border-t pt-6 text-xs" style={{ borderColor: '#0FA34E22', color: '#DFF5E6' }}>
            <div className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded border" style={{ background: '#0FA34E22', borderColor: '#0FA34E44' }} />
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded border" style={{ borderColor: '#0FA34E44' }} />
              <span>Unanswered</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded border" style={{ background: '#D7F27A22', borderColor: '#D7F27A' }} />
              <span>Active Question</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded border relative" style={{ borderColor: '#E8A33D44' }}>
                <span className="absolute inset-0.5 rounded" style={{ background: '#E8A33D' }} />
              </div>
              <span>Flagged for Review</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function AssessmentSession() {
  return (
    <ErrorBoundary>
      <AssessmentSessionContent />
    </ErrorBoundary>
  );
}

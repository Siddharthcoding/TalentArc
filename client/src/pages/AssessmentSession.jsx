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
      <div className="fixed inset-0 bg-zinc-950 flex flex-col items-center justify-center gap-4 text-white z-50">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        <p className="text-sm text-zinc-400">Loading your timed session...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-zinc-950 flex flex-col items-center justify-center gap-4 text-white p-4 z-50">
        <AlertTriangle className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-bold">Session Error</h2>
        <p className="text-sm text-zinc-400 max-w-md text-center">{error}</p>
        <button
          onClick={() => navigate('/assessment')}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold rounded-xl transition-colors"
        >
          Return to Portal
        </button>
      </div>
    );
  }

  // Pre-test instructions screen
  if (preTestModal) {
    return (
      <div className="fixed inset-0 bg-zinc-950/98 flex items-center justify-center p-4 z-50 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 max-w-xl w-full text-white shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-violet-500" />
          <h2 className="text-2xl font-extrabold mb-4 tracking-tight">Security & Fullscreen Policy</h2>
          
          <div className="space-y-4 text-zinc-300 text-sm leading-relaxed mb-6">
            <p>
              This is a timed, proctored mock assessment for <strong className="text-indigo-400">"{assessment?.topic}"</strong>. To simulate actual test conditions, you must agree to the following rules:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-white">Fullscreen Lock</strong>: The assessment runs strictly in fullscreen.
              </li>
              <li>
                <strong className="text-amber-400">1st Warning</strong>: Exiting fullscreen triggers a system warning pop-up.
              </li>
              <li>
                <strong className="text-red-400">Automatic Termination</strong>: If you exit fullscreen a second time, the test terminates immediately, registering a score of 0.
              </li>
              <li>
                <strong className="text-white">Time Limit</strong>: The test auto-submits when the timer reaches 0.
              </li>
            </ul>
          </div>

          <button
            onClick={requestFullscreenLock}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/25 transition-all text-sm"
          >
            <Maximize2 className="w-4 h-4 shrink-0" />
            Accept & Enter Full Screen
          </button>
        </motion.div>
      </div>
    );
  }

  // Auto termination splash
  if (isTerminated) {
    return (
      <div className="fixed inset-0 bg-zinc-950 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-zinc-900 border border-red-500/20 text-center rounded-2xl p-8 max-w-md w-full shadow-2xl"
        >
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4 animate-bounce" />
          <h2 className="text-2xl font-extrabold text-white mb-2">Test Terminated</h2>
          <p className="text-sm text-zinc-400 leading-relaxed mb-6">
            Your assessment session was auto-terminated and submitted with a score of 0 because you exited full screen mode multiple times.
          </p>
          <button
            onClick={() => handleFinalSubmit(true)}
            className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl shadow-lg transition-colors text-sm"
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
      <div className="fixed inset-0 bg-zinc-950/98 flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 border border-amber-500/30 rounded-2xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl"
        >
          <AlertTriangle className="w-14 h-14 text-amber-500 mx-auto mb-4 animate-pulse" />
          <h2 className="text-xl font-bold text-white mb-2">Fullscreen Exit Detected!</h2>
          <p className="text-sm text-zinc-400 leading-relaxed mb-6">
            This is your <span className="text-amber-400 font-bold">1st Warning</span>. If you exit fullscreen again, the assessment will terminate immediately and your current score will be submitted.
          </p>
          <button
            onClick={requestFullscreenLock}
            className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl shadow-lg transition-colors text-sm"
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
    <div className="fixed inset-0 bg-zinc-950 text-white flex flex-col z-40 select-none overflow-hidden">
      {/* Top Header Row */}
      <header className="h-16 shrink-0 border-b border-zinc-800/80 bg-zinc-900/40 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center text-xs font-black">TA</div>
          <span className="text-sm font-bold tracking-tight text-zinc-300">
            Assessment: <strong className="text-white font-medium">{assessment?.topic}</strong>
          </span>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800">
          <Timer className={`w-4 h-4 ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-zinc-400'}`} />
          <span className={`font-mono text-sm font-bold ${timeLeft < 60 ? 'text-red-500' : 'text-zinc-200'}`}>
            {formatTime(timeLeft)}
          </span>
        </div>
      </header>

      {/* Main Work Area */}
      <div className="flex-1 flex min-h-0 relative">
        {/* Left Side: MCQ Player Core */}
        <main className="flex-1 flex flex-col justify-between p-6 sm:p-12 overflow-y-auto max-w-4xl mx-auto">
          {/* Question Text */}
          <div className="my-auto space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">Question {currentIndex + 1} of {questions.length}</span>
                <span className="text-[11px] text-zinc-500 font-semibold px-2 py-0.5 rounded border border-zinc-800 bg-zinc-900/30 uppercase tracking-wider">{currentQuestion?.topic || assessment?.topic}</span>
              </div>
              <h1 className="text-lg sm:text-2xl font-bold leading-snug text-white">
                {currentQuestion?.question_text}
              </h1>
            </div>

            {/* Options List */}
            <div className="grid grid-cols-1 gap-3.5">
              {currentQuestion?.options.map((opt, oIdx) => {
                const isSelected = selectedOptionIdx === oIdx;
                return (
                  <button
                    key={oIdx}
                    onClick={() => handleSelectOption(oIdx)}
                    className={`flex items-center justify-between text-left p-4 rounded-xl border text-sm font-semibold transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-500/10 text-white shadow-md'
                        : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 text-zinc-300 hover:text-white hover:bg-zinc-900/60'
                    }`}
                  >
                    <span>{opt}</span>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-zinc-700'}`}>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer controls */}
          <footer className="h-16 shrink-0 flex items-center justify-between border-t border-zinc-900 mt-8 pt-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="p-3 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white hover:border-zinc-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <button
                onClick={toggleFlag}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-xs font-semibold transition-colors ${
                  isFlagged
                    ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                    : 'border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                }`}
              >
                <Flag className={`w-4 h-4 shrink-0 ${isFlagged ? 'fill-current' : ''}`} />
                Flag for review
              </button>
            </div>

            {currentIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIndex((prev) => prev + 1)}
                className="flex items-center gap-1.5 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 font-bold rounded-xl shadow-lg transition-colors text-sm"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => handleFinalSubmit()}
                disabled={submitting}
                className="flex items-center gap-1.5 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-700/60 font-bold rounded-xl shadow-lg shadow-emerald-600/10 transition-colors text-sm"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    Submitting...
                  </>
                ) : (
                  'Finish Assessment'
                )}
              </button>
            )}
          </footer>
        </main>

        {/* Right Side: Navigation Panel Drawer (Hidden on mobile) */}
        <aside className="hidden md:block w-72 border-l border-zinc-800 bg-zinc-900/30 p-6 overflow-y-auto">
          <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-6">Question Sheet</h2>
          
          <div className="grid grid-cols-5 gap-2.5 mb-8">
            {questions.map((q, idx) => {
              const isCurrent = currentIndex === idx;
              const isAnswered = selectedAnswers[q.id] !== undefined;
              const isQFlagged = flaggedQuestions[q.id];

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-10 h-10 rounded-xl font-bold text-xs flex items-center justify-center relative transition-all border ${
                    isCurrent
                      ? 'border-indigo-500 bg-indigo-500/10 text-white'
                      : isAnswered
                        ? 'border-zinc-800 bg-zinc-800 text-zinc-300'
                        : 'border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
                  }`}
                >
                  {idx + 1}
                  {isQFlagged && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 border border-zinc-950" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="space-y-3.5 border-t border-zinc-800 pt-6 text-xs text-zinc-500">
            <div className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded border border-zinc-800 bg-zinc-800" />
              <span>Answered Question</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded border border-zinc-800" />
              <span>Unanswered Question</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded border border-indigo-500 bg-indigo-500/10" />
              <span>Active Question</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded border border-zinc-800 relative">
                <span className="absolute inset-0.5 rounded bg-amber-500" />
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

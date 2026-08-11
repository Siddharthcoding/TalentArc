import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, Award, CheckCircle2, XCircle, ChevronDown, ChevronUp, RefreshCw, BookOpen } from 'lucide-react';
import { getAssessment } from '@/services/api';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import SectionWrapper from '@/components/ui/SectionWrapper';

function AssessmentReportContent() {
  const { id } = useParams();
  const navigate = useNavigate();

  // State
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedQuestions, setExpandedQuestions] = useState({}); // questionId -> boolean

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAssessment(id);
      if (res.success && res.data) {
        setAssessment(res.data);
      } else {
        throw new Error(res.error || 'Failed to fetch report');
      }
    } catch (err) {
      setError(err?.message || 'Failed to load assessment report.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const toggleQuestionExpand = (qId) => {
    setExpandedQuestions((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  if (loading) {
    return (
      <SectionWrapper className="min-h-[calc(100vh-4rem)] flex items-center justify-center pt-20">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm text-zinc-400">Compiling scorecard report...</p>
        </div>
      </SectionWrapper>
    );
  }

  if (error || !assessment) {
    return (
      <SectionWrapper className="min-h-[calc(100vh-4rem)] flex items-center justify-center pt-20">
        <div className="glass-card p-6 flex flex-col items-center gap-4 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Could Not Fetch Report</h2>
            <p className="text-sm text-zinc-500 mt-1">{error || 'Report is not available yet.'}</p>
          </div>
          <button
            onClick={() => navigate('/assessment')}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold rounded-xl text-white transition-colors"
          >
            Go Back
          </button>
        </div>
      </SectionWrapper>
    );
  }

  const { score = 0, maxScore = 0, report: reportDetails, status } = assessment;
  const percent = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  const isFailedTerminated = status === 'terminated';

  return (
    <SectionWrapper className="min-h-screen pt-24 pb-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid pointer-events-none" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />

      <div className="w-full max-w-4xl mx-auto relative z-10 space-y-8">
        
        {/* Scorecard Hero Panel */}
        <div className="glass-card p-6 sm:p-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-500" />
          
          <div className="space-y-3 text-center md:text-left max-w-md">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/50 dark:border-indigo-800/30 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <Award className="w-3.5 h-3.5" />
              <span>Assessment Completed</span>
            </div>
            
            <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              {assessment.topic}
            </h1>
            
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {isFailedTerminated 
                ? "This test was terminated because the user exited full screen multiple times. A score of 0 is registered."
                : `You scored ${score} out of ${maxScore} questions correctly. Below is a detailed performance assessment and recommended topics for review.`
              }
            </p>

            <div className="flex flex-wrap items-center gap-4 justify-center md:justify-start pt-2">
              <button
                onClick={() => navigate('/assessment')}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/25 transition-all text-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Take Another Assessment
              </button>
            </div>
          </div>

          {/* Circle score indicator */}
          <div className="flex flex-col items-center gap-2 shrink-0">
            <div className="relative w-36 h-36 flex items-center justify-center">
              {/* Outer track */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="62"
                  className="stroke-zinc-100 dark:stroke-zinc-800"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="62"
                  className={isFailedTerminated ? "stroke-red-500" : percent >= 70 ? "stroke-emerald-500" : percent >= 40 ? "stroke-amber-500" : "stroke-red-500"}
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 62}
                  strokeDashoffset={2 * Math.PI * 62 * (1 - (isFailedTerminated ? 0 : percent) / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-zinc-900 dark:text-white">
                  {isFailedTerminated ? '0' : percent}%
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 mt-0.5">
                  {isFailedTerminated ? '0' : score} / {maxScore} correct
                </span>
              </div>
            </div>
            {isFailedTerminated ? (
              <span className="text-xs font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">Terminated</span>
            ) : percent >= 70 ? (
              <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Strong Profile</span>
            ) : percent >= 40 ? (
              <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">Needs Practice</span>
            ) : (
              <span className="text-xs font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">Critical Attention</span>
            )}
          </div>
        </div>

        {/* Personalized feedback & Weak areas card */}
        {reportDetails && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 glass-card p-6 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  <h2 className="text-base font-extrabold text-zinc-900 dark:text-white">Weak Areas Evaluation</h2>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed italic bg-zinc-50 dark:bg-zinc-900/40 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
                  "{reportDetails.feedback || 'Focus on reviewing your incorrect answers to identify concepts that need reinforcement.'}"
                </p>
              </div>
            </div>

            <div className="glass-card p-6">
              <h2 className="text-base font-extrabold text-zinc-900 dark:text-white mb-3">Target Study Topics</h2>
              {reportDetails.weakTopics && reportDetails.weakTopics.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {reportDetails.weakTopics.map((topic, index) => (
                    <span
                      key={index}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200/40 dark:border-red-900/30"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-400 dark:text-zinc-500 leading-relaxed">
                  No critical weak areas detected! You demonstrated strong capability across all questions.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Review Questions Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Question Breakdown & Explanation</h2>
          
          <div className="space-y-3">
            {reportDetails?.answers?.map((q, idx) => {
              const isCorrect = q.isCorrect;
              const isExpanded = expandedQuestions[q.questionId];

              return (
                <div
                  key={q.questionId}
                  className={`glass-card overflow-hidden transition-all border ${
                    isCorrect
                      ? 'hover:border-emerald-500/30'
                      : 'border-red-500/10 hover:border-red-500/25 bg-red-500/[0.005]'
                  }`}
                >
                  {/* Summary Bar */}
                  <button
                    onClick={() => toggleQuestionExpand(q.questionId)}
                    className="w-full flex items-center justify-between p-5 text-left gap-4"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="shrink-0">
                        {isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Question {idx + 1}</span>
                        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate pr-6">
                          {q.question_text}
                        </p>
                      </div>
                    </div>
                    <div className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {/* Expanded block */}
                  {isExpanded && (
                    <div className="px-5 pb-5 border-t border-zinc-100 dark:border-zinc-800/80 pt-5 space-y-4 text-sm">
                      <h3 className="font-bold text-zinc-900 dark:text-white">{q.question_text}</h3>
                      
                      {/* Options Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {q.options.map((opt, oIdx) => {
                          const isOptionCorrect = oIdx === q.correctOption;
                          const isOptionSelected = oIdx === q.selectedOption;

                          return (
                            <div
                              key={oIdx}
                              className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between ${
                                isOptionCorrect
                                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300'
                                  : isOptionSelected
                                    ? 'border-red-500 bg-red-500/10 text-red-800 dark:text-red-300'
                                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                              }`}
                            >
                              <span>{opt}</span>
                              <div className="flex items-center gap-1.5 shrink-0 text-[10px] uppercase font-bold">
                                {isOptionCorrect && <span className="text-emerald-500">Correct Choice</span>}
                                {isOptionSelected && !isOptionCorrect && <span className="text-red-500">Your Selection</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation box */}
                      <div className="p-4 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-100 dark:border-zinc-800 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-indigo-500 dark:text-indigo-400 block tracking-widest">Explanation</span>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                          {q.explanation}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}

export default function AssessmentReport() {
  return (
    <ErrorBoundary>
      <AssessmentReportContent />
    </ErrorBoundary>
  );
}

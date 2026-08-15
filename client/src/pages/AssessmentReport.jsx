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

  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedQuestions, setExpandedQuestions] = useState({});

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

  useEffect(() => { fetchReport(); }, [fetchReport]);

  const toggleQuestionExpand = (qId) => {
    setExpandedQuestions((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  if (loading) {
    return (
      <SectionWrapper className="min-h-[calc(100vh-4rem)] flex items-center justify-center pt-20" style={{ background: '#D7F27A' }}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#0FA34E' }} />
          <p className="text-sm font-semibold" style={{ color: '#0B7C3C' }}>Compiling scorecard report...</p>
        </div>
      </SectionWrapper>
    );
  }

  if (error || !assessment) {
    return (
      <SectionWrapper className="min-h-[calc(100vh-4rem)] flex items-center justify-center pt-20" style={{ background: '#D7F27A' }}>
        <div className="p-6 flex flex-col items-center gap-4 text-center max-w-md rounded-3xl border-2 shadow-xl"
          style={{ background: '#F6E9D2', borderColor: '#E1584A33' }}>
          <AlertCircle className="w-12 h-12" style={{ color: '#E1584A' }} />
          <div>
            <h2 className="text-lg font-bold" style={{ color: '#0B7C3C' }}>Could Not Fetch Report</h2>
            <p className="text-sm mt-1" style={{ color: '#0B7C3C88' }}>{error || 'Report is not available yet.'}</p>
          </div>
          <button
            onClick={() => navigate('/assessment')}
            className="px-5 py-2.5 font-bold rounded-full text-sm transition-all hover:opacity-90 shadow"
            style={{ background: '#0FA34E', color: '#F6E9D2' }}
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
  const scoreBg = isFailedTerminated ? '#E1584A' : percent >= 70 ? '#0FA34E' : percent >= 40 ? '#E8A33D' : '#E1584A';

  return (
    <SectionWrapper className="min-h-screen pt-32 pb-16 relative overflow-hidden" style={{ background: '#D7F27A' }}>
      {/* Rangoli dot motif */}
      <div className="absolute top-0 right-0 w-72 h-72 opacity-10 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, #0FA34E 2px, transparent 2px)', backgroundSize: '22px 22px' }} />
      <div className="absolute bottom-0 left-0 w-48 h-48 opacity-10 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, #0B7C3C 2px, transparent 2px)', backgroundSize: '18px 18px' }} />

      <div className="w-full max-w-4xl mx-auto relative z-10 space-y-6">

        {/* ── Hero Scorecard Panel ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 sm:p-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 rounded-3xl border-2 shadow-xl"
          style={{ background: '#F6E9D2', borderColor: '#0FA34E33' }}
        >
          {/* gradient top bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-3xl"
            style={{ background: 'linear-gradient(90deg, #0FA34E, #D7F27A 50%, #0FA34E)' }} />

          <div className="space-y-3 text-center md:text-left max-w-md">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-xs font-bold border"
              style={{ background: '#DFF5E6', color: '#0FA34E', borderColor: '#0FA34E33' }}>
              <Award className="w-3.5 h-3.5" />
              <span>Assessment Completed</span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight"
              style={{ fontFamily: '"Baloo 2", cursive', color: '#0B7C3C' }}>
              {assessment.topic}
            </h1>

            <p className="text-sm font-medium leading-relaxed" style={{ color: '#0B7C3C88' }}>
              {isFailedTerminated
                ? 'This test was terminated because you exited full screen multiple times. A score of 0 is registered.'
                : `You scored ${score} out of ${maxScore} questions correctly. Here is your full performance breakdown.`}
            </p>

            <button
              onClick={() => navigate('/assessment')}
              className="inline-flex items-center gap-2 px-5 py-2.5 font-bold rounded-full text-sm transition-all hover:opacity-90 shadow-md"
              style={{ background: '#0FA34E', color: '#D7F27A' }}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Take Another Assessment
            </button>
          </div>

          {/* ── Score Ring ── */}
          <div className="flex flex-col items-center gap-2 shrink-0">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="72" cy="72" r="62" strokeWidth="8" fill="transparent" stroke="#0FA34E22" />
                <circle
                  cx="72" cy="72" r="62"
                  stroke={scoreBg}
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 62}
                  strokeDashoffset={2 * Math.PI * 62 * (1 - (isFailedTerminated ? 0 : percent) / 100)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-black" style={{ color: '#0B7C3C', fontFamily: '"Baloo 2", cursive' }}>
                  {isFailedTerminated ? '0' : percent}%
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest" style={{ color: '#0B7C3C99' }}>
                  {isFailedTerminated ? '0' : score} / {maxScore}
                </span>
              </div>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full border"
              style={{ background: `${scoreBg}18`, color: scoreBg, borderColor: `${scoreBg}44` }}>
              {isFailedTerminated ? 'Terminated' : percent >= 70 ? 'Strong Profile 🏆' : percent >= 40 ? 'Needs Practice 📚' : 'Critical Attention ⚠️'}
            </span>
          </div>
        </motion.div>

        {/* ── Feedback & Weak Areas ── */}
        {reportDetails && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="md:col-span-2 p-6 rounded-3xl border-2 shadow"
              style={{ background: '#F6E9D2', borderColor: '#0FA34E22' }}>
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4" style={{ color: '#0FA34E' }} />
                <h2 className="font-bold text-sm uppercase tracking-wider"
                  style={{ color: '#0B7C3C', fontFamily: '"Baloo 2", cursive' }}>
                  Weak Areas Evaluation
                </h2>
              </div>
              <p className="text-sm leading-relaxed italic p-4 rounded-2xl border"
                style={{ color: '#0B7C3C', background: '#DFF5E6', borderColor: '#0FA34E22' }}>
                "{reportDetails.feedback || 'Focus on reviewing your incorrect answers to identify concepts that need reinforcement.'}"
              </p>
            </div>

            <div className="p-6 rounded-3xl border-2 shadow" style={{ background: '#F6E9D2', borderColor: '#0FA34E22' }}>
              <h2 className="font-bold text-sm uppercase tracking-wider mb-3"
                style={{ color: '#0B7C3C', fontFamily: '"Baloo 2", cursive' }}>
                Study Topics
              </h2>
              {reportDetails.weakTopics?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {reportDetails.weakTopics.map((topic, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-full text-xs font-bold border"
                      style={{ background: '#E1584A15', color: '#E1584A', borderColor: '#E1584A33' }}>
                      {topic}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs font-medium" style={{ color: '#0B7C3C88' }}>
                  No critical weak areas detected! You demonstrated strong capability across all questions.
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── Question Breakdown ── */}
        <div className="space-y-4">
          <h2 className="font-bold text-lg" style={{ color: '#0B7C3C', fontFamily: '"Baloo 2", cursive' }}>
            Question Breakdown & Explanation
          </h2>
          <div className="space-y-3">
            {reportDetails?.answers?.map((q, idx) => {
              const isCorrect = q.isCorrect;
              const isExpanded = expandedQuestions[q.questionId];
              return (
                <div
                  key={q.questionId}
                  className="overflow-hidden rounded-3xl border-2 shadow transition-all"
                  style={{ background: '#F6E9D2', borderColor: isCorrect ? '#0FA34E33' : '#E1584A33' }}
                >
                  <button
                    onClick={() => toggleQuestionExpand(q.questionId)}
                    className="w-full flex items-center justify-between p-5 text-left gap-4"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="shrink-0">
                        {isCorrect
                          ? <CheckCircle2 className="w-5 h-5" style={{ color: '#0FA34E' }} />
                          : <XCircle className="w-5 h-5" style={{ color: '#E1584A' }} />}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: '#0B7C3C88' }}>
                          Question {idx + 1}
                        </span>
                        <p className="text-sm font-semibold truncate pr-6" style={{ color: '#0B7C3C' }}>
                          {q.question_text}
                        </p>
                      </div>
                    </div>
                    <div style={{ color: '#0B7C3C88' }}>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-5 border-t pt-5 space-y-4 text-sm" style={{ borderColor: '#0FA34E22' }}>
                      <h3 className="font-bold" style={{ color: '#0B7C3C' }}>{q.question_text}</h3>

                      {/* Options Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {q.options.map((opt, oIdx) => {
                          const isOptionCorrect = oIdx === q.correctOption;
                          const isOptionSelected = oIdx === q.selectedOption;
                          return (
                            <div
                              key={oIdx}
                              className="p-3.5 rounded-2xl border text-xs font-semibold flex items-center justify-between"
                              style={{
                                background: isOptionCorrect ? '#DFF5E6' : isOptionSelected ? '#E1584A12' : '#F6E9D2',
                                borderColor: isOptionCorrect ? '#0FA34E' : isOptionSelected ? '#E1584A' : '#0FA34E22',
                                color: isOptionCorrect ? '#0B7C3C' : isOptionSelected ? '#E1584A' : '#0B7C3C88',
                              }}
                            >
                              <span>{opt}</span>
                              <div className="flex items-center gap-1.5 shrink-0 text-[10px] uppercase font-bold">
                                {isOptionCorrect && <span style={{ color: '#0FA34E' }}>Correct ✓</span>}
                                {isOptionSelected && !isOptionCorrect && <span style={{ color: '#E1584A' }}>Your Answer</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation */}
                      <div className="p-4 rounded-2xl border space-y-1" style={{ background: '#DFF5E6', borderColor: '#0FA34E22' }}>
                        <span className="text-[10px] uppercase font-bold block tracking-widest" style={{ color: '#0FA34E' }}>
                          Explanation
                        </span>
                        <p className="text-xs leading-relaxed font-medium" style={{ color: '#0B7C3C' }}>
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

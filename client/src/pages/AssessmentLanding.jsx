import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, FileText, Briefcase, Code, Terminal, Settings, AlertCircle, Loader2, Play } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { createAssessment, parseResumeForAssessment } from '@/services/api';
import AnimatedButton from '@/components/ui/AnimatedButton';
import SectionWrapper from '@/components/ui/SectionWrapper';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import Dropzone from '@/components/upload/Dropzone';

const MODES = [
  { key: 'skill', label: 'Specific Skill', icon: Code, description: 'Test yourself on a target technology like React, Python, or SQL.' },
  { key: 'job_role', label: 'Job Role', icon: Terminal, description: 'Simulate a general interview for a role like Frontend Engineer.' },
  { key: 'job_description', label: 'Job Description', icon: Briefcase, description: 'Paste a description to generate questions matched to the job.' },
  { key: 'resume', label: 'Resume Profile', icon: FileText, description: 'Assess skills derived automatically from your uploaded resume.' },
];

const DIFFICULTY_PRESETS = {
  Easy: { count: 5, time: 5 },
  Medium: { count: 10, time: 10 },
  Hard: { count: 15, time: 15 },
};

function AssessmentLandingContent() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  // Mode & Inputs
  const [activeMode, setActiveMode] = useState('skill');
  const [skillInput, setSkillInput] = useState('');
  const [roleInput, setRoleInput] = useState('');
  const [jdInput, setJdInput] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeSkills, setResumeSkills] = useState('');  // comma-separated skills used as topic

  // Settings
  const [difficulty, setDifficulty] = useState('Medium');
  const [questionCount, setQuestionCount] = useState(10);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(10);
  const [isCustomSettings, setIsCustomSettings] = useState(false);

  // Status
  const [loading, setLoading] = useState(false);
  const [parsingResume, setParsingResume] = useState(false);
  const [error, setError] = useState(null);

  // Adjust default numbers when difficulty changes
  useEffect(() => {
    if (!isCustomSettings) {
      const preset = DIFFICULTY_PRESETS[difficulty];
      setQuestionCount(preset.count);
      setTimeLimitMinutes(preset.time);
    }
  }, [difficulty, isCustomSettings]);

  // Handle Resume File Upload & Parsing
  const handleResumeSelect = useCallback(async (file) => {
    setResumeFile(file);
    setParsingResume(true);
    setError(null);
    try {
      // Use lightweight parser — no LLM call, just text extraction + structured parsing
      const result = await parseResumeForAssessment(file);

      const text = result.normalizedText || result.rawText || '';
      if (!text || text.trim().length < 20) {
        throw new Error('Could not extract readable text from this resume. Please try a different file.');
      }
      setResumeText(text);

      // Extract skills list for use as the assessment topic
      const structured = result.structured || {};
      // skills parser returns { all: [...], categories: {...} }
      const skillsAll = structured.skills?.all || [];
      const topSkills = skillsAll.slice(0, 8).join(', ');
      setResumeSkills(topSkills || 'Software Development');
    } catch (err) {
      setError(err?.message || 'Failed to parse resume file. Please try a PDF or DOCX file.');
      setResumeFile(null);
      setResumeText('');
      setResumeSkills('');
    } finally {
      setParsingResume(false);
    }
  }, []);

  const handleStart = async () => {
    if (!isAuthenticated) {
      login();
      return;
    }

    setLoading(true);
    setError(null);

    let inputValue = '';
    if (activeMode === 'skill') {
      inputValue = skillInput.trim();
      if (!inputValue) {
        setError('Please enter a specific skill name.');
        setLoading(false);
        return;
      }
    } else if (activeMode === 'job_role') {
      inputValue = roleInput.trim();
      if (!inputValue) {
        setError('Please enter a target job role.');
        setLoading(false);
        return;
      }
    } else if (activeMode === 'job_description') {
      inputValue = jdInput.trim();
      if (!inputValue) {
        setError('Please paste a job description.');
        setLoading(false);
        return;
      }
    } else if (activeMode === 'resume') {
      // Use top skills as topic; fall back to text snippet if no skills found
      inputValue = resumeSkills || resumeText.slice(0, 200);
      if (!resumeText) {
        setError('Please upload and parse your resume first.');
        setLoading(false);
        return;
      }
    }

    try {
      const res = await createAssessment({
        inputType: activeMode,
        inputValue,
        difficulty,
        questionCount,
        durationSeconds: timeLimitMinutes * 60,
      });

      if (res.success && res.data?.id) {
        navigate(`/assessment/${res.data.id}`);
      } else {
        throw new Error(res.error || 'Failed to start assessment');
      }
    } catch (err) {
      setError(err?.message || 'An error occurred while generating your assessment. Please check Hugging Face server configuration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SectionWrapper className="min-h-screen pt-24 pb-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid pointer-events-none" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />

      <div className="w-full max-w-5xl mx-auto relative z-10">
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/50 dark:border-indigo-800/30 mb-4"
          >
            <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Mock Timed Assessment Portal</span>
          </motion.div>
          <h1 className="text-4xl font-extrabold text-zinc-900 dark:text-white sm:text-5xl tracking-tight leading-none mb-3">
            Test Your Knowledge
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Generate custom AI-powered multiple choice evaluations from your profile, JD or a custom topic, and test yourself under interview-simulate conditions.
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200/50 dark:border-red-900/30 rounded-xl flex items-center gap-3 text-red-700 dark:text-red-400 text-sm max-w-3xl mx-auto"
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Controls - Left 2 Columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Mode selection tabs */}
            <div className="glass-card p-6">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">Choose Input Basis</h2>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {MODES.map((mode) => {
                  const Icon = mode.icon;
                  const isActive = activeMode === mode.key;
                  return (
                    <button
                      key={mode.key}
                      onClick={() => { setActiveMode(mode.key); setError(null); }}
                      className={`flex flex-col items-start text-left p-4 rounded-xl border transition-all ${
                        isActive
                          ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20 shadow-sm'
                          : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50'
                      }`}
                    >
                      <div className={`p-2 rounded-lg mb-3 ${isActive ? 'bg-indigo-500 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-1">{mode.label}</span>
                      <span className="text-xs text-zinc-400 dark:text-zinc-500 line-clamp-2 leading-relaxed">{mode.description}</span>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic input area based on mode */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeMode}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                >
                  {activeMode === 'skill' && (
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Skill Name</label>
                      <input
                        type="text"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        placeholder="e.g. React, Python Scripting, SQL Join, AWS DevOps"
                        className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-zinc-900 dark:text-white text-sm focus:border-indigo-500 focus:outline-none transition-colors"
                      />
                    </div>
                  )}

                  {activeMode === 'job_role' && (
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Target Job Role</label>
                      <input
                        type="text"
                        value={roleInput}
                        onChange={(e) => setRoleInput(e.target.value)}
                        placeholder="e.g. Senior Frontend Engineer, Junior Data Scientist"
                        className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-zinc-900 dark:text-white text-sm focus:border-indigo-500 focus:outline-none transition-colors"
                      />
                    </div>
                  )}

                  {activeMode === 'job_description' && (
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Job Description Details</label>
                      <textarea
                        rows={6}
                        value={jdInput}
                        onChange={(e) => setJdInput(e.target.value)}
                        placeholder="Paste full job description requirements here..."
                        className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-zinc-900 dark:text-white text-sm focus:border-indigo-500 focus:outline-none transition-colors resize-none"
                      />
                    </div>
                  )}

                  {activeMode === 'resume' && (
                    <div className="space-y-4">
                      <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Upload Resume (PDF/DOCX)</label>
                      {parsingResume ? (
                        <div className="border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-8 flex flex-col items-center justify-center gap-3">
                          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                          <p className="text-sm text-zinc-500">Extracting text and matching credentials...</p>
                        </div>
                      ) : resumeText ? (
                        <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-200/50 dark:border-emerald-900/35 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500 text-white rounded-lg">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate max-w-xs">{resumeFile?.name || 'resume.pdf'}</p>
                              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Parsed · Skills detected: {resumeSkills || 'none'}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => { setResumeText(''); setResumeFile(null); setResumeSkills(''); }}
                            className="text-xs text-zinc-400 hover:text-red-500 font-medium transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <Dropzone onFileSelect={handleResumeSelect} />
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Settings Panel - Right 1 Column */}
          <div className="space-y-6">
            <div className="glass-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-4 h-4 text-indigo-500" />
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Assessment Config</h2>
              </div>

              {/* Difficulty Preset */}
              <div className="space-y-2 mb-6">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">Difficulty</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Easy', 'Medium', 'Hard'].map((diff) => {
                    const isSel = difficulty === diff;
                    return (
                      <button
                        key={diff}
                        type="button"
                        onClick={() => setDifficulty(diff)}
                        className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                          isSel
                            ? 'bg-indigo-500 text-white border-indigo-500'
                            : 'bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
                        }`}
                      >
                        {diff}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Toggle Custom parameters */}
              <div className="flex items-center gap-2.5 mb-6">
                <input
                  type="checkbox"
                  id="customSettings"
                  checked={isCustomSettings}
                  onChange={(e) => setIsCustomSettings(e.target.checked)}
                  className="rounded border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <label htmlFor="customSettings" className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 cursor-pointer">
                  Customize limit & timer manually
                </label>
              </div>

              {/* Custom Sliders */}
              <AnimatePresence>
                {isCustomSettings && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden space-y-4 mb-6"
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-semibold text-zinc-500">
                        <span>Questions Count</span>
                        <span className="text-indigo-500">{questionCount} Qs</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="20"
                        step="5"
                        value={questionCount}
                        onChange={(e) => setQuestionCount(parseInt(e.target.value, 10))}
                        className="w-full accent-indigo-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-semibold text-zinc-500">
                        <span>Time Limit</span>
                        <span className="text-indigo-500">{timeLimitMinutes} Mins</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="20"
                        step="5"
                        value={timeLimitMinutes}
                        onChange={(e) => setTimeLimitMinutes(parseInt(e.target.value, 10))}
                        className="w-full accent-indigo-500"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Config Details */}
              <div className="p-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800/80 rounded-xl space-y-1.5 mb-6 text-xs text-zinc-500 dark:text-zinc-400">
                <div className="flex justify-between">
                  <span>Questions:</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">{questionCount} MCQs</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">{timeLimitMinutes} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span>Target Difficulty:</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">{difficulty}</span>
                </div>
                <div className="flex justify-between">
                  <span>Anti-Cheat Monitor:</span>
                  <span className="font-semibold text-indigo-500 dark:text-indigo-400">Fullscreen Lock</span>
                </div>
              </div>

              {/* Start CTA */}
              <AnimatedButton
                variant="primary"
                onClick={handleStart}
                disabled={loading || parsingResume}
                className="w-full text-sm !py-3 flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current text-white shrink-0 group-hover:scale-110 transition-transform" />
                    {isAuthenticated ? 'Start Assessment' : 'Sign in to Start'}
                  </>
                )}
              </AnimatedButton>
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}

export default function AssessmentLanding() {
  return (
    <ErrorBoundary>
      <AssessmentLandingContent />
    </ErrorBoundary>
  );
}

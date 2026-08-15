import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  FileText,
  Briefcase,
  Code,
  Terminal,
  AlertCircle,
  Loader2,
  Play,
  UploadCloud,
  CheckCircle2,
  History,
  FileCode,
  Tag,
  X
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { createAssessment, parseResumeForAssessment, getReports } from '@/services/api';

const MODES = [
  { key: 'skill', label: 'Specific Skill(s)', icon: Code, description: 'Test on React, Java, SQL, DSA (comma-separated).' },
  { key: 'job_role', label: 'Company Job Role', icon: Terminal, description: 'Simulate HighRadius, Deloitte, or Microsoft SDE interviews.' },
  { key: 'job_description', label: 'Job Description', icon: Briefcase, description: 'Paste a recruiter JD to extract required skills.' },
  { key: 'resume', label: 'Resume Profile', icon: FileText, description: 'Auto-extract skills & projects from your uploaded resume.' },
];

export default function AssessmentLanding() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [activeMode, setActiveMode] = useState('skill');
  const [skillInput, setSkillInput] = useState('Data Structures, Java, SQL');
  const [roleInput, setRoleInput] = useState('HighRadius SDE Trainee');
  const [jdInput, setJdInput] = useState('');
  
  // Resume Mode State
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeParsedData, setResumeParsedData] = useState(null);
  const [resumeParsing, setResumeParsing] = useState(false);
  const [resumeTextInput, setResumeTextInput] = useState('');
  const [extractedSkills, setExtractedSkills] = useState([]);
  const [savedReports, setSavedReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState('');

  // Assessment Settings
  const [difficulty, setDifficulty] = useState('Medium');
  const [questionCount, setQuestionCount] = useState(10);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load saved resume reports if user is signed in
  useEffect(() => {
    if (isAuthenticated) {
      setLoadingReports(true);
      getReports()
        .then((res) => {
          if (res?.success && Array.isArray(res.data)) {
            setSavedReports(res.data.filter((r) => r.file_name));
          }
        })
        .catch(() => {})
        .finally(() => setLoadingReports(false));
    }
  }, [isAuthenticated]);

  const handleFileUpload = async (file) => {
    if (!file) return;
    setResumeFile(file);
    setResumeParsing(true);
    setError(null);
    try {
      const data = await parseResumeForAssessment(file);
      setResumeParsedData(data);
      
      // Extract strictly technical skills from structured parser
      let skills = [];
      if (Array.isArray(data.structured?.skills?.all) && data.structured.skills.all.length > 0) {
        skills = data.structured.skills.all;
      } else if (data.structured?.skills?.categories) {
        skills = Object.values(data.structured.skills.categories).flat();
      } else if (Array.isArray(data.structured?.skills)) {
        skills = data.structured.skills;
      }

      // Filter and clean skills (removing any non-skill noise)
      const cleanSkills = Array.from(new Set(skills))
        .map((s) => String(s).trim())
        .filter((s) => s.length > 1 && !/^(and|etc|skills|technical|proficient|knowledge|good|experience|summary|contact)$/i.test(s));

      setExtractedSkills(cleanSkills.slice(0, 15));
      setResumeTextInput(cleanSkills.join(', '));
    } catch (err) {
      setError(err?.message || 'Failed to parse uploaded resume. You can enter your skills below.');
    } finally {
      setResumeParsing(false);
    }
  };

  const handleSelectReport = (reportId) => {
    setSelectedReportId(reportId);
    const report = savedReports.find((r) => r.id === reportId);
    if (report) {
      let skills = [];
      if (Array.isArray(report.parsed_data?.skills?.all)) {
        skills = report.parsed_data.skills.all;
      } else if (report.parsed_data?.skills?.categories) {
        skills = Object.values(report.parsed_data.skills.categories).flat();
      } else if (Array.isArray(report.extracted_skills)) {
        skills = report.extracted_skills;
      } else if (Array.isArray(report.skills)) {
        skills = report.skills;
      }

      const cleanSkills = Array.from(new Set(skills))
        .map((s) => (typeof s === 'string' ? s.trim() : (s?.name || '')))
        .filter((s) => s.length > 1 && !/^(and|etc|skills|technical|summary|contact)$/i.test(s));

      setExtractedSkills(cleanSkills.slice(0, 15));
      setResumeTextInput(cleanSkills.join(', '));
    }
  };


  const removeSkill = (skillToRemove) => {
    setExtractedSkills((prev) => prev.filter((s) => s !== skillToRemove));
  };

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
    } else if (activeMode === 'job_role') {
      inputValue = roleInput.trim();
    } else if (activeMode === 'job_description') {
      inputValue = jdInput.trim();
    } else if (activeMode === 'resume') {
      if (extractedSkills.length > 0) {
        inputValue = extractedSkills.join(', ');
      } else if (resumeTextInput.trim()) {
        inputValue = resumeTextInput.trim();
      } else if (resumeFile?.name) {
        inputValue = resumeFile.name.replace(/\.[^/.]+$/, '');
      }
    }

    if (!inputValue || !inputValue.trim()) {
      if (activeMode === 'resume') {
        setError('Please upload a resume file or enter your technical skills.');
      } else {
        setError('Please enter target topics, skills, or job details.');
      }
      setLoading(false);
      return;
    }

    try {
      const res = await createAssessment({
        inputType: activeMode,
        inputValue: inputValue.trim(),
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
      setError(err?.message || 'Failed to generate assessment session.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section-container py-24 space-y-8 text-left max-w-5xl mx-auto">
      <div>
        <div className="inline-block bg-[#0FA34E] text-[#C6FF3D] font-mono text-xs font-black px-3.5 py-1 rounded-full uppercase mb-2 shadow">
          ★ PROCTORED AI MOCK ASSESSMENT
        </div>
        <h1 className="font-display text-4xl sm:text-6xl font-extrabold text-[#0FA34E]">
          KIIT AI Mock Assessment Portal
        </h1>
        <p className="text-sm font-medium text-[#0B7C3C] mt-2">
          Timed, proctored assessments generated dynamically across DSA, System Design, SQL, and CS Core topics.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-100 border-2 border-red-300 rounded-2xl text-red-800 text-xs font-mono font-bold flex items-center gap-2 shadow-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Mode Selection & Input Container */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#F6E9D2] border-2 border-[#0FA34E]/30 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
            <h2 className="font-display font-extrabold text-xl text-[#0FA34E]">
              1. Select Assessment Topic Basis
            </h2>

            {/* 4 Mode Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MODES.map((mode) => {
                const Icon = mode.icon;
                const isActive = activeMode === mode.key;
                return (
                  <button
                    key={mode.key}
                    onClick={() => {
                      setActiveMode(mode.key);
                      setError(null);
                    }}
                    className={`p-4 rounded-2xl border-2 text-left transition-all ${
                      isActive
                        ? 'bg-[#0FA34E] text-[#F6E9D2] border-[#0FA34E] shadow-md'
                        : 'bg-[#D7F27A] text-[#0FA34E] border-[#0FA34E]/20 hover:border-[#0FA34E]'
                    }`}
                  >
                    <Icon className="w-5 h-5 mb-2" />
                    <p className="font-display font-extrabold text-sm mb-1">{mode.label}</p>
                    <p className="text-xs font-medium opacity-80 leading-snug">{mode.description}</p>
                  </button>
                );
              })}
            </div>

            {/* Dynamic Input Pane */}
            <div className="pt-2">
              
              {/* MODE: Skill */}
              {activeMode === 'skill' && (
                <div className="space-y-2">
                  <label className="block text-xs font-mono font-bold text-[#0FA34E] uppercase">
                    Target Skills (Comma Separated)
                  </label>
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    placeholder="e.g. Data Structures, React, Java, SQL, Operating Systems..."
                    className="w-full px-4 py-3 bg-[#D7F27A] border-2 border-[#0FA34E]/30 rounded-2xl text-xs sm:text-sm font-bold text-[#0FA34E] focus:outline-none focus:border-[#0FA34E]"
                  />
                  <p className="text-[11px] text-[#0B7C3C88] font-medium">
                    ⚡ Enter multiple skills separated by comma. All topics are compiled in a single optimized generation.
                  </p>
                </div>
              )}

              {/* MODE: Job Role */}
              {activeMode === 'job_role' && (
                <div className="space-y-2">
                  <label className="block text-xs font-mono font-bold text-[#0FA34E] uppercase">
                    Company / Target Placement Role
                  </label>
                  <input
                    type="text"
                    value={roleInput}
                    onChange={(e) => setRoleInput(e.target.value)}
                    placeholder="e.g. HighRadius SDE Trainee, Deloitte USI Analyst, Microsoft SDE-1..."
                    className="w-full px-4 py-3 bg-[#D7F27A] border-2 border-[#0FA34E]/30 rounded-2xl text-xs sm:text-sm font-bold text-[#0FA34E] focus:outline-none focus:border-[#0FA34E]"
                  />
                </div>
              )}

              {/* MODE: Job Description */}
              {activeMode === 'job_description' && (
                <div className="space-y-2">
                  <label className="block text-xs font-mono font-bold text-[#0FA34E] uppercase">
                    Paste Job Description / Placement Circular
                  </label>
                  <textarea
                    rows={5}
                    value={jdInput}
                    onChange={(e) => setJdInput(e.target.value)}
                    placeholder="Paste the recruiter's JD or email requirements text here..."
                    className="w-full px-4 py-3 bg-[#D7F27A] border-2 border-[#0FA34E]/30 rounded-2xl text-xs font-bold text-[#0FA34E] focus:outline-none focus:border-[#0FA34E]"
                  />
                </div>
              )}

              {/* MODE: Resume Profile */}
              {activeMode === 'resume' && (
                <div className="space-y-4">
                  
                  {/* File Upload Dropzone */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#0FA34E]/40 hover:border-[#0FA34E] bg-[#D7F27A] p-6 rounded-2xl text-center cursor-pointer transition-all hover:bg-[#D7F27A]/80 space-y-2"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.docx,.txt"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                      }}
                    />
                    
                    {resumeParsing ? (
                      <div className="flex flex-col items-center gap-2 py-2">
                        <Loader2 className="w-8 h-8 animate-spin text-[#0FA34E]" />
                        <span className="font-display font-bold text-xs text-[#0FA34E]">
                          Extracting skills and profile from resume...
                        </span>
                      </div>
                    ) : resumeFile ? (
                      <div className="flex items-center justify-center gap-3">
                        <FileCode className="w-8 h-8 text-[#0FA34E]" />
                        <div className="text-left">
                          <p className="font-display font-extrabold text-sm text-[#0FA34E]">{resumeFile.name}</p>
                          <p className="text-[10px] text-[#0B7C3C] font-mono">{(resumeFile.size / 1024).toFixed(1)} KB · Click to change file</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <UploadCloud className="w-8 h-8 text-[#0FA34E] mx-auto mb-1" />
                        <p className="font-display font-extrabold text-sm text-[#0FA34E]">
                          Click to upload your Resume (PDF or DOCX)
                        </p>
                        <p className="text-[11px] text-[#0B7C3C]">
                          We'll automatically extract your technical skills & build a tailored test.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Or select from past reports */}
                  {savedReports.length > 0 && (
                    <div className="p-3.5 rounded-2xl bg-[#DFF5E6] border border-[#0FA34E]/20 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#0FA34E]">
                        <History className="w-3.5 h-3.5" />
                        <span>Or select from your past analyzed resumes:</span>
                      </div>
                      <select
                        value={selectedReportId}
                        onChange={(e) => handleSelectReport(e.target.value)}
                        className="w-full px-3 py-2 bg-[#F6E9D2] border border-[#0FA34E]/30 rounded-xl text-xs font-bold text-[#0FA34E] outline-none"
                      >
                        <option value="">-- Choose a previously uploaded resume --</option>
                        {savedReports.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.file_name} (ATS Score: {r.score || 'N/A'})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Extracted Skills Badges */}
                  {extractedSkills.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#0FA34E] block">
                        Detected Resume Skills ({extractedSkills.length}):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {extractedSkills.map((sk) => (
                          <span
                            key={sk}
                            className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#0FA34E] text-[#F6E9D2] px-3 py-1 rounded-full shadow-sm"
                          >
                            <Tag className="w-3 h-3 text-[#C6FF3D]" />
                            <span>{sk}</span>
                            <button
                              type="button"
                              onClick={() => removeSkill(sk)}
                              className="hover:text-red-300 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Fallback Text Input */}
                  <div className="space-y-1">
                    <label className="block text-[11px] font-mono font-bold text-[#0FA34E] uppercase">
                      Or paste technical summary / skills:
                    </label>
                    <textarea
                      rows={3}
                      value={resumeTextInput}
                      onChange={(e) => setResumeTextInput(e.target.value)}
                      placeholder="e.g. Proficient in Java, Spring Boot, React, SQL, Data Structures..."
                      className="w-full px-4 py-2.5 bg-[#D7F27A] border-2 border-[#0FA34E]/30 rounded-2xl text-xs font-bold text-[#0FA34E] focus:outline-none focus:border-[#0FA34E]"
                    />
                  </div>

                </div>
              )}

            </div>
          </div>
        </div>

        {/* Right Col: Exam Settings & Action Button */}
        <div className="space-y-6">
          <div className="bg-[#F6E9D2] border-2 border-[#0FA34E]/30 rounded-3xl p-6 shadow-xl space-y-4">
            <h2 className="font-display font-extrabold text-xl text-[#0FA34E]">
              2. Exam Settings
            </h2>

            <div>
              <label className="block text-xs font-mono font-bold text-[#0FA34E] mb-1.5">Difficulty Preset</label>
              <div className="grid grid-cols-3 gap-2">
                {['Easy', 'Medium', 'Hard'].map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setDifficulty(diff)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      difficulty === diff
                        ? 'bg-[#0FA34E] text-[#F6E9D2] shadow'
                        : 'bg-[#D7F27A] text-[#0FA34E] border border-[#0FA34E]/20'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#D7F27A] p-4 rounded-2xl border border-[#0FA34E]/20 space-y-2 text-xs font-mono font-bold text-[#0FA34E]">
              <div className="flex justify-between">
                <span>Questions:</span>
                <span>{questionCount} MCQs</span>
              </div>
              <div className="flex justify-between">
                <span>Duration:</span>
                <span>{timeLimitMinutes} Mins</span>
              </div>
              <div className="flex justify-between">
                <span>Proctoring:</span>
                <span className="text-[#0B7C3C]">Enabled</span>
              </div>
            </div>

            <button
              onClick={handleStart}
              disabled={loading || resumeParsing}
              className="w-full bg-[#0FA34E] hover:bg-[#0B7C3C] text-[#F6E9D2] font-display font-extrabold text-sm py-4 rounded-full shadow-lg transition-all border-2 border-[#C6FF3D] flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#C6FF3D]" />
                  <span>Generating Assessment...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 text-[#C6FF3D] fill-current" />
                  <span>Launch Proctored Assessment</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

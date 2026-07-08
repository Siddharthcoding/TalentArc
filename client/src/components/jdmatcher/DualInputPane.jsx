import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle2, Replace, File as FileIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function ResumeDropzone({ file, onFileSelect, onFileRemove }) {
  const [dragOver, setDragOver] = useState(false);
  const [selected, setSelected] = useState(null);
  const inputRef = useRef(null);

  const handleFile = useCallback((f) => {
    if (!f) return;
    setSelected(f);
    setTimeout(() => onFileSelect(f), 600);
  }, [onFileSelect]);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer?.files?.[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const onChange = useCallback((e) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
    e.target.value = '';
  }, [handleFile]);

  return (
    <AnimatePresence mode="wait">
      {file ? (
        <motion.div
          key="selected"
          initial={{ opacity: 0, scale: 0.92, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92 }}
          transition={{ type: 'spring', damping: 20, stiffness: 250 }}
          className="glass-card p-8 text-center h-full flex flex-col items-center justify-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <p className="font-semibold text-zinc-900 dark:text-white mb-1 truncate max-w-[260px]">
            {file.name}
          </p>
          <p className="text-sm text-zinc-400 dark:text-zinc-500 mb-4">
            {formatFileSize(file.size)}
          </p>
          <button
            onClick={onFileRemove}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
          >
            <Replace className="w-3.5 h-3.5" />
            Change File
          </button>
        </motion.div>
      ) : (
        <motion.div
          key="idle"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          onDrop={onDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'relative glass-card p-10 md:p-14 text-center cursor-pointer transition-all duration-300 h-full flex flex-col items-center justify-center',
            'border-2 border-dashed overflow-hidden group',
            dragOver
              ? 'border-indigo-400 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 scale-[1.02] shadow-lg shadow-indigo-500/10'
              : 'border-zinc-200 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-600'
          )}
        >
          <input ref={inputRef} type="file" accept=".pdf,.docx,.PDF,.DOCX" className="hidden" onChange={onChange} />
          <motion.div
            animate={dragOver ? { y: -6, scale: 1.08 } : { y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-950/60 dark:to-violet-950/60 flex items-center justify-center mx-auto mb-5"
          >
            <Upload className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </motion.div>
          <p className="text-base font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            {dragOver ? (
              <span className="text-indigo-600 dark:text-indigo-400">Drop your file here</span>
            ) : (
              <>
                Drag & drop or{' '}
                <span className="text-indigo-600 dark:text-indigo-400 underline underline-offset-4 decoration-2 decoration-indigo-300/50 dark:decoration-indigo-700/50 font-semibold">
                  browse
                </span>
              </>
            )}
          </p>
          <p className="text-sm text-zinc-400 dark:text-zinc-500">PDF & DOCX supported (Max 10 MB)</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function JdTextarea({ value, onChange }) {
  const wordCount = value ? value.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = value.length;

  return (
    <div className="glass-card p-6 md:p-8 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <label className="text-sm font-semibold text-zinc-900 dark:text-white">
          Job Description
        </label>
        <span className="text-xs text-zinc-400 dark:text-zinc-500 tabular-nums">
          {wordCount} words · {charCount} characters
        </span>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste the target job description here..."
        rows={12}
        className={cn(
          'flex-1 w-full resize-none rounded-xl p-4 text-sm leading-relaxed',
          'bg-zinc-50 dark:bg-zinc-900/50',
          'text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600',
          'border border-zinc-200 dark:border-zinc-700',
          'focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400/50',
          'transition-all duration-300',
        )}
      />
    </div>
  );
}

function JdFileDropzone({ file, onFileSelect, onFileRemove }) {
  const [dragOver, setDragOver] = useState(false);
  const [selected, setSelected] = useState(null);
  const inputRef = useRef(null);

  const handleFile = useCallback((f) => {
    if (!f) return;
    setSelected(f);
    setTimeout(() => onFileSelect(f), 600);
  }, [onFileSelect]);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer?.files?.[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const onChange = useCallback((e) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
    e.target.value = '';
  }, [handleFile]);

  return (
    <AnimatePresence mode="wait">
      {file ? (
        <motion.div
          key="selected"
          initial={{ opacity: 0, scale: 0.92, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92 }}
          transition={{ type: 'spring', damping: 20, stiffness: 250 }}
          className="glass-card p-8 text-center h-full flex flex-col items-center justify-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <p className="font-semibold text-zinc-900 dark:text-white mb-1 truncate max-w-[260px]">
            {file.name}
          </p>
          <p className="text-sm text-zinc-400 dark:text-zinc-500 mb-4">
            {formatFileSize(file.size)}
          </p>
          <button
            onClick={onFileRemove}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
          >
            <Replace className="w-3.5 h-3.5" />
            Change File
          </button>
        </motion.div>
      ) : (
        <motion.div
          key="idle"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          onDrop={onDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'relative glass-card p-10 md:p-14 text-center cursor-pointer transition-all duration-300 h-full flex flex-col items-center justify-center',
            'border-2 border-dashed overflow-hidden group',
            dragOver
              ? 'border-violet-400 dark:border-violet-500 bg-violet-50/50 dark:bg-violet-950/30 scale-[1.02] shadow-lg shadow-violet-500/10'
              : 'border-zinc-200 dark:border-zinc-700 hover:border-violet-300 dark:hover:border-violet-600'
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx,.txt,.PDF,.DOCX,.TXT"
            className="hidden"
            onChange={onChange}
          />
          <motion.div
            animate={dragOver ? { y: -6, scale: 1.08 } : { y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-950/60 dark:to-purple-950/60 flex items-center justify-center mx-auto mb-5"
          >
            <FileIcon className="w-8 h-8 text-violet-600 dark:text-violet-400" />
          </motion.div>
          <p className="text-base font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            {dragOver ? (
              <span className="text-violet-600 dark:text-violet-400">Drop your file here</span>
            ) : (
              <>
                Drag & drop or{' '}
                <span className="text-violet-600 dark:text-violet-400 underline underline-offset-4 decoration-2 decoration-violet-300/50 dark:decoration-violet-700/50 font-semibold">
                  browse
                </span>
              </>
            )}
          </p>
          <p className="text-sm text-zinc-400 dark:text-zinc-500">PDF, DOCX & TXT supported (Max 10 MB)</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const inputModes = [
  { key: 'text', label: 'Paste Text' },
  { key: 'file', label: 'Upload File' },
];

export default function DualInputPane({ onCompare }) {
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeFileData, setResumeFileData] = useState(null);
  const [jdText, setJdText] = useState('');
  const [jdFile, setJdFile] = useState(null);
  const [jdMode, setJdMode] = useState('text');

  const handleFileSelect = useCallback((file) => {
    setResumeFile(file);
    setResumeFileData(file);
  }, []);

  const handleFileRemove = useCallback(() => {
    setResumeFile(null);
    setResumeFileData(null);
  }, []);

  const handleJdFileSelect = useCallback((file) => {
    setJdFile(file);
  }, []);

  const handleJdFileRemove = useCallback(() => {
    setJdFile(null);
  }, []);

  const isValid = resumeFile !== null && (
    (jdMode === 'text' && jdText.trim().length > 20) ||
    (jdMode === 'file' && jdFile !== null)
  );

  const handleCompare = useCallback(() => {
    onCompare({
      resumeFile: resumeFileData,
      jdText: jdMode === 'text' ? jdText : undefined,
      jdFile: jdMode === 'file' ? jdFile : undefined,
    });
  }, [onCompare, resumeFileData, jdMode, jdText, jdFile]);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
      }}
      className="space-y-8"
    >
      <motion.div variants={itemVariants} className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Match Your Resume to a{' '}
          <span className="gradient-text">Job Description</span>
        </h2>
        <p className="mt-3 text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
          Upload your resume and provide the target job description to see how well you align.
        </p>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="grid md:grid-cols-2 gap-6"
      >
        <div className="flex flex-col">
          <span className="text-xs font-medium tracking-widest uppercase text-zinc-400 dark:text-zinc-500 mb-3">
            Your Resume
          </span>
          <ResumeDropzone
            file={resumeFile}
            onFileSelect={handleFileSelect}
            onFileRemove={handleFileRemove}
          />
        </div>

        <div className="flex flex-col">
          <span className="text-xs font-medium tracking-widest uppercase text-zinc-400 dark:text-zinc-500 mb-3">
            Job Description
          </span>

          <div className="flex gap-1 mb-3 p-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800/50 w-fit">
            {inputModes.map((mode) => (
              <button
                key={mode.key}
                onClick={() => setJdMode(mode.key)}
                className={cn(
                  'px-3.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200',
                  jdMode === mode.key
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                )}
              >
                {mode.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {jdMode === 'text' ? (
              <motion.div
                key="text"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.2 }}
                className="flex-1"
              >
                <JdTextarea value={jdText} onChange={setJdText} />
              </motion.div>
            ) : (
              <motion.div
                key="file"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                className="flex-1"
              >
                <JdFileDropzone
                  file={jdFile}
                  onFileSelect={handleJdFileSelect}
                  onFileRemove={handleJdFileRemove}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="flex justify-center"
      >
        <AnimatePresence>
          {isValid && (
            <motion.button
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 20, stiffness: 250 }}
              onClick={handleCompare}
              className={cn(
                'inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold',
                'bg-gradient-to-r from-indigo-600 to-violet-600 text-white',
                'shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/35',
                'hover:scale-[1.02] active:scale-[0.98] transition-all duration-200',
              )}
            >
              <GitCompare className="w-5 h-5" />
              Compare & Match
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

function GitCompare(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="18" cy="18" r="3" />
      <circle cx="6" cy="6" r="3" />
      <path d="M13 6h3a2 2 0 0 1 2 2v7" />
      <line x1="6" y1="9" x2="6" y2="21" />
    </svg>
  );
}
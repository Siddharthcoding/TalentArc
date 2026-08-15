import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, CheckCircle2, Replace, File as FileIcon, Sparkles } from 'lucide-react';
import { cn } from '@/utils/cn';

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function ResumeDropzone({ file, onFileSelect, onFileRemove }) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleFile = useCallback((f) => {
    if (!f) return;
    onFileSelect(f);
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
          className="bg-[#F6E9D2] border-2 border-[#0FA34E]/30 rounded-3xl p-8 text-center h-full flex flex-col items-center justify-center shadow-lg"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#0FA34E] text-[#C6FF3D] flex items-center justify-center mx-auto mb-4 shadow">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <p className="font-display font-extrabold text-base text-[#0FA34E] mb-1 truncate max-w-[260px]">
            {file.name}
          </p>
          <p className="text-xs font-mono text-[#0B7C3C] mb-4">
            {formatFileSize(file.size)}
          </p>
          <button
            onClick={onFileRemove}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-red-700 bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded-full transition-colors"
          >
            <Replace className="w-3.5 h-3.5" />
            Change Resume
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
            'relative bg-[#F6E9D2] p-10 text-center cursor-pointer transition-all duration-300 h-full flex flex-col items-center justify-center rounded-3xl shadow-lg border-3 border-dashed',
            dragOver ? 'border-[#0FA34E] bg-[#D7F27A]' : 'border-[#0FA34E]/30 hover:border-[#0FA34E]'
          )}
        >
          <input ref={inputRef} type="file" accept=".pdf,.docx,.PDF,.DOCX" className="hidden" onChange={onChange} />
          <div className="w-16 h-16 rounded-2xl bg-[#0FA34E] text-[#C6FF3D] flex items-center justify-center mx-auto mb-4 shadow">
            <Upload className="w-8 h-8" />
          </div>
          <p className="font-display font-bold text-base text-[#0FA34E] mb-1">
            Drag & drop resume or <span className="underline">browse</span>
          </p>
          <p className="text-xs font-mono text-[#0B7C3C]">PDF & DOCX supported</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function JdTextarea({ value, onChange }) {
  const wordCount = value ? value.trim().split(/\s+/).filter(Boolean).length : 0;

  return (
    <div className="bg-[#F6E9D2] border-2 border-[#0FA34E]/30 rounded-3xl p-6 md:p-8 h-full flex flex-col shadow-lg text-left">
      <div className="flex items-center justify-between mb-3">
        <label className="font-display font-extrabold text-base text-[#0FA34E]">
          Target Job Description
        </label>
        <span className="text-xs font-mono font-bold text-[#0B7C3C]">
          {wordCount} words
        </span>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste target job description text (e.g. SDE-1 requirements from HighRadius, Deloitte, Microsoft)..."
        rows={10}
        className="w-full flex-1 resize-none rounded-2xl p-4 text-xs font-medium leading-relaxed bg-[#D7F27A] text-[#0FA34E] border-2 border-[#0FA34E]/20 focus:outline-none focus:border-[#0FA34E]"
      />
    </div>
  );
}

function JdFileDropzone({ file, onFileSelect, onFileRemove }) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleFile = useCallback((f) => {
    if (!f) return;
    onFileSelect(f);
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
          className="bg-[#F6E9D2] border-2 border-[#0FA34E]/30 rounded-3xl p-8 text-center h-full flex flex-col items-center justify-center shadow-lg"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#0FA34E] text-[#C6FF3D] flex items-center justify-center mx-auto mb-4 shadow">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <p className="font-display font-extrabold text-base text-[#0FA34E] mb-1 truncate max-w-[260px]">
            {file.name}
          </p>
          <p className="text-xs font-mono text-[#0B7C3C] mb-4">
            {formatFileSize(file.size)}
          </p>
          <button
            onClick={onFileRemove}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-red-700 bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded-full transition-colors"
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
            'relative bg-[#F6E9D2] p-10 text-center cursor-pointer transition-all duration-300 h-full flex flex-col items-center justify-center rounded-3xl shadow-lg border-3 border-dashed',
            dragOver ? 'border-[#0FA34E] bg-[#D7F27A]' : 'border-[#0FA34E]/30 hover:border-[#0FA34E]'
          )}
        >
          <input ref={inputRef} type="file" accept=".pdf,.docx,.txt,.PDF,.DOCX,.TXT" className="hidden" onChange={onChange} />
          <div className="w-16 h-16 rounded-2xl bg-[#0FA34E] text-[#C6FF3D] flex items-center justify-center mx-auto mb-4 shadow">
            <FileIcon className="w-8 h-8" />
          </div>
          <p className="font-display font-bold text-base text-[#0FA34E] mb-1">
            Drag & drop JD file or <span className="underline">browse</span>
          </p>
          <p className="text-xs font-mono text-[#0B7C3C]">PDF, DOCX & TXT supported</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const inputModes = [
  { key: 'text', label: 'Paste Text' },
  { key: 'file', label: 'Upload File' },
];

export default function DualInputPane({ onCompare }) {
  const [resumeFile, setResumeFile] = useState(null);
  const [jdText, setJdText] = useState('');
  const [jdFile, setJdFile] = useState(null);
  const [jdMode, setJdMode] = useState('text');

  const isValid = resumeFile !== null && (
    (jdMode === 'text' && jdText.trim().length > 10) ||
    (jdMode === 'file' && jdFile !== null)
  );

  const handleCompare = useCallback(() => {
    onCompare({
      resumeFile,
      jdText: jdMode === 'text' ? jdText : undefined,
      jdFile: jdMode === 'file' ? jdFile : undefined,
    });
  }, [onCompare, resumeFile, jdMode, jdText, jdFile]);

  return (
    <div className="space-y-8 text-left max-w-5xl mx-auto">
      <div>
        <div className="inline-block bg-[#0FA34E] text-[#C6FF3D] font-mono text-xs font-black px-3.5 py-1 rounded-full uppercase mb-2 shadow">
          ★ KIIT AI ROLE MATCH STUDIO
        </div>
        <h2 className="font-display text-4xl md:text-5xl font-extrabold text-[#0FA34E]">
          Match Resume to Target Job Description
        </h2>
        <p className="text-sm font-medium text-[#0B7C3C] mt-2">
          Compare your resume against real KIIT recruiter job descriptions to find skill gaps and match percentages.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="flex flex-col">
          <span className="font-mono text-xs font-bold uppercase text-[#0FA34E] mb-2">
            1. Your Resume File
          </span>
          <ResumeDropzone
            file={resumeFile}
            onFileSelect={setResumeFile}
            onFileRemove={() => setResumeFile(null)}
          />
        </div>

        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs font-bold uppercase text-[#0FA34E]">
              2. Job Description
            </span>
            <div className="flex gap-1 bg-[#F6E9D2] p-1 rounded-full border border-[#0FA34E]/20">
              {inputModes.map((mode) => (
                <button
                  key={mode.key}
                  onClick={() => setJdMode(mode.key)}
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-bold transition-all',
                    jdMode === mode.key
                      ? 'bg-[#0FA34E] text-[#F6E9D2]'
                      : 'text-[#0FA34E] hover:bg-[#D7F27A]'
                  )}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {jdMode === 'text' ? (
              <motion.div key="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1">
                <JdTextarea value={jdText} onChange={setJdText} />
              </motion.div>
            ) : (
              <motion.div key="file" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1">
                <JdFileDropzone file={jdFile} onFileSelect={setJdFile} onFileRemove={() => setJdFile(null)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex justify-center pt-4">
        {isValid && (
          <button
            onClick={handleCompare}
            className="bg-[#0FA34E] hover:bg-[#0B7C3C] text-[#F6E9D2] font-display font-extrabold text-base px-10 py-4 rounded-full shadow-2xl transition-all border-2 border-[#C6FF3D] flex items-center gap-3 transform hover:-translate-y-1"
          >
            <Sparkles className="w-5 h-5 text-[#C6FF3D]" />
            <span>Run Role Alignment Match</span>
          </button>
        )}
      </div>
    </div>
  );
}

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, CheckCircle2, Loader2, FileText } from 'lucide-react';
import { cn } from '@/utils/cn';

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function Dropzone({ onFileSelect }) {
  const [dragOver, setDragOver] = useState(false);
  const [selected, setSelected] = useState(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const handleFile = useCallback((file) => {
    if (!file) return;
    setSelected(file);
    setUploading(true);
    setTimeout(() => {
      onFileSelect(file);
    }, 800);
  }, [onFileSelect]);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const onDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const onClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const onChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  }, [handleFile]);

  return (
    <AnimatePresence mode="wait">
      {selected ? (
        <motion.div
          key="selected"
          initial={{ opacity: 0, scale: 0.92, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92 }}
          transition={{ type: 'spring', damping: 20, stiffness: 250 }}
          className="bg-[#F6E9D2] border-2 border-[#0FA34E]/30 rounded-3xl p-8 text-center overflow-hidden shadow-xl"
        >
          <div className="relative mb-5">
            <motion.div
              animate={uploading ? { scale: [1, 1.1, 1] } : { scale: 1 }}
              transition={{ duration: 1.5, repeat: uploading ? Infinity : 0, ease: 'easeInOut' }}
              className="w-16 h-16 rounded-2xl bg-[#0FA34E] text-[#C6FF3D] flex items-center justify-center mx-auto shadow-md"
            >
              {uploading ? (
                <Loader2 className="w-8 h-8 text-[#C6FF3D] animate-spin" />
              ) : (
                <CheckCircle2 className="w-8 h-8 text-[#C6FF3D]" />
              )}
            </motion.div>
          </div>
          <p className="font-display font-extrabold text-lg text-[#0FA34E] mb-1 truncate max-w-[260px] mx-auto">{selected.name}</p>
          <p className="text-xs font-mono text-[#0B7C3C]">{formatFileSize(selected.size)}</p>
          {uploading && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-[#0FA34E] font-mono font-bold mt-4"
            >
              ⚡ Initiating KIIT ATS Analysis...
            </motion.p>
          )}
        </motion.div>
      ) : (
        <motion.div
          key="idle"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={onClick}
          className={cn(
            'relative bg-[#F6E9D2] p-10 md:p-14 text-center cursor-pointer transition-all duration-300',
            'border-3 border-dashed rounded-3xl overflow-hidden group shadow-xl',
            dragOver
              ? 'border-[#0FA34E] bg-[#D7F27A]/80 scale-[1.02] shadow-2xl'
              : 'border-[#0FA34E]/40 hover:border-[#0FA34E] hover:bg-[#F6E9D2]/90'
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx,.PDF,.DOCX"
            className="hidden"
            onChange={onChange}
          />

          <motion.div
            animate={dragOver ? { y: -6, scale: 1.08 } : { y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            className="relative z-10 w-20 h-20 rounded-2xl bg-[#0FA34E] text-[#C6FF3D] flex items-center justify-center mx-auto mb-5 shadow-lg group-hover:scale-110 transition-transform"
          >
            <Upload className="w-9 h-9 text-[#C6FF3D]" />
          </motion.div>

          <div className="relative z-10 space-y-1">
            <p className="font-display text-xl font-extrabold text-[#0FA34E]">
              {dragOver ? (
                <span>Drop your resume file here</span>
              ) : (
                <>
                  Drag & drop or{' '}
                  <span className="underline underline-offset-4 decoration-2 decoration-[#0FA34E]">
                    browse resume
                  </span>
                </>
              )}
            </p>
            <p className="text-xs font-mono text-[#0B7C3C] font-semibold">PDF & DOCX supported (Max 10 MB)</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

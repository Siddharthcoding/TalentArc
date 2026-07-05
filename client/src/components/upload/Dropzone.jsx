import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle2, Loader2 } from 'lucide-react';
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
          className="glass-card p-8 text-center"
        >
          <div className="relative mb-5">
            <motion.div
              animate={uploading ? { scale: [1, 1.1, 1] } : { scale: 1 }}
              transition={{ duration: 1.5, repeat: uploading ? Infinity : 0, ease: 'easeInOut' }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/50 dark:to-violet-950/50 flex items-center justify-center mx-auto"
            >
              {uploading ? (
                <Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
              ) : (
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              )}
            </motion.div>
            {uploading && (
              <motion.div
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -inset-2 rounded-2xl border-2 border-indigo-400/30"
              />
            )}
          </div>
          <p className="font-semibold text-zinc-900 dark:text-white mb-1 truncate max-w-[260px] mx-auto">{selected.name}</p>
          <p className="text-sm text-zinc-400 dark:text-zinc-500">{formatFileSize(selected.size)}</p>
          {uploading && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-indigo-500 dark:text-indigo-400 mt-4 font-medium"
            >
              Initiating analysis...
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
            'relative glass-card p-10 md:p-14 text-center cursor-pointer transition-all duration-300',
            'border-2 border-dashed overflow-hidden group',
            dragOver
              ? 'border-indigo-400 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 scale-[1.02] shadow-lg shadow-indigo-500/10'
              : 'border-zinc-200 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-600'
          )}
        >
          <div className={cn(
            'absolute inset-0 bg-gradient-to-br from-indigo-500/[0.02] to-violet-500/[0.02] dark:from-indigo-500/[0.04] dark:to-violet-500/[0.04]',
            'opacity-0 group-hover:opacity-100 transition-opacity duration-500'
          )} />

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
            className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-950/60 dark:to-violet-950/60 flex items-center justify-center mx-auto mb-5 group-hover:shadow-lg group-hover:shadow-indigo-500/20 transition-shadow"
          >
            <Upload className="w-8 h-8 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
          </motion.div>

          <div className="relative z-10">
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
          </div>

          {dragOver && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute -top-8 -right-8 w-24 h-24 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-2xl"
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

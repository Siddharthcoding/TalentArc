import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Copy, Check, Pencil } from 'lucide-react';
import { cn } from '@/utils/cn';

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className={cn(
        'inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-all duration-200',
        copied
          ? 'bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400 border border-green-200/50 dark:border-green-800/40'
          : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
      )}
    >
      {copied ? (
        <>
          <Check className="w-3 h-3" />
          Copied
        </>
      ) : (
        <>
          <Copy className="w-3 h-3" />
          Copy snippet
        </>
      )}
    </button>
  );
}

function SuggestionCard({ suggestion, index, llmEnhanced }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 + index * 0.1, duration: 0.5 }}
      className="border border-zinc-200 dark:border-zinc-700/50 rounded-xl overflow-hidden"
    >
      <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-200 dark:divide-zinc-700/50">
        <div className="p-4 md:p-5 bg-zinc-50/50 dark:bg-zinc-900/30">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
            Original
          </p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {suggestion.original}
          </p>
        </div>

        <div className={cn(
          'p-4 md:p-5 relative',
          llmEnhanced
            ? 'bg-gradient-to-br from-indigo-50/30 to-violet-50/30 dark:from-indigo-950/20 dark:to-violet-950/20'
            : 'bg-gradient-to-br from-amber-50/30 to-orange-50/30 dark:from-amber-950/20 dark:to-orange-950/20'
        )}>
          <div className="flex items-center justify-between mb-2">
            <p className={cn(
              'text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5',
              llmEnhanced
                ? 'text-indigo-500 dark:text-indigo-400'
                : 'text-amber-500 dark:text-amber-400'
            )}>
              {llmEnhanced ? (
                <Sparkles className="w-3 h-3" />
              ) : (
                <Pencil className="w-3 h-3" />
              )}
              {llmEnhanced ? 'AI-Optimized' : 'Enhanced'}
            </p>
            <CopyButton text={suggestion.suggested} />
          </div>
          <p className="text-sm text-zinc-800 dark:text-zinc-200 font-medium leading-relaxed">
            {suggestion.suggested}
          </p>
        </div>
      </div>

      {suggestion.reason && (
        <div className="px-4 md:px-5 py-2.5 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800">
          <p className="text-xs text-zinc-400 dark:text-zinc-500 italic">
            {suggestion.reason}
          </p>
        </div>
      )}
    </motion.div>
  );
}

export default function RewriteCoachPanel({ suggestions, llmEnhanced }) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          Rewrite Coach
        </h3>
        {llmEnhanced ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-500 dark:text-indigo-400">
            <Sparkles className="w-3 h-3" />
            LLM Enhanced
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-500 dark:text-amber-400">
            <Pencil className="w-3 h-3" />
            Template-Based
          </span>
        )}
      </div>

      <div className="space-y-4">
        {suggestions.map((suggestion, i) => (
          <SuggestionCard key={i} suggestion={suggestion} index={i} llmEnhanced={llmEnhanced} />
        ))}
      </div>
    </motion.div>
  );
}
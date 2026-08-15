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
        'inline-flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1 rounded-full transition-all duration-200',
        copied
          ? 'bg-[#0FA34E] text-[#D7F27A]'
          : 'bg-[#0FA34E]/10 text-[#0FA34E] hover:bg-[#0FA34E]/20'
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
          Copy
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
      className="bg-[#F6E9D2] border-2 border-[#0FA34E]/30 rounded-2xl overflow-hidden shadow-md text-left"
    >
      <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#0FA34E]/20">
        <div className="p-4 md:p-5 bg-[#F6E9D2]">
          <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0B7C3C]/70 mb-2">
            Original Resume Bullet
          </p>
          <p className="text-xs text-[#0B7C3C] font-medium leading-relaxed">
            {suggestion.original}
          </p>
        </div>

        <div className="p-4 md:p-5 bg-[#DFF5E6] relative">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 text-[#0FA34E]">
              {llmEnhanced ? (
                <Sparkles className="w-3.5 h-3.5 text-[#0FA34E]" />
              ) : (
                <Pencil className="w-3.5 h-3.5 text-[#0FA34E]" />
              )}
              {llmEnhanced ? 'AI-Enhanced Impact' : 'Improved Format'}
            </p>
            <CopyButton text={suggestion.suggested} />
          </div>
          <p className="text-xs text-[#0FA34E] font-bold leading-relaxed">
            {suggestion.suggested}
          </p>
        </div>
      </div>

      {suggestion.reason && (
        <div className="px-4 md:px-5 py-2.5 bg-[#F6E9D2] border-t border-[#0FA34E]/20">
          <p className="text-[11px] text-[#0B7C3C] font-medium italic">
            💡 {suggestion.reason}
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
      className="space-y-4 text-left"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-mono font-bold text-[#0FA34E] uppercase tracking-wider">
          AI Action Verb & Metric Rewrite Coach
        </h3>
        {llmEnhanced ? (
          <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-[#0FA34E] bg-[#DFF5E6] px-2.5 py-0.5 rounded-full border border-[#0FA34E]/20">
            <Sparkles className="w-3 h-3 text-[#0FA34E]" />
            LLM Generated
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-[#E8A33D] bg-[#E8A33D]/10 px-2.5 py-0.5 rounded-full border border-[#E8A33D]/30">
            <Pencil className="w-3 h-3" />
            Template Guided
          </span>
        )}
      </div>

      <div className="space-y-3">
        {suggestions.map((suggestion, i) => (
          <SuggestionCard key={i} suggestion={suggestion} index={i} llmEnhanced={llmEnhanced} />
        ))}
      </div>
    </motion.div>
  );
}
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2, ArrowRight, Lightbulb } from 'lucide-react';
import { cn } from '@/utils/cn';

export default function NarrativeFeedback({ report }) {
  if (!report) return null;

  const {
    summary,
    strengthLabel,
    categoryFeedback,
    priorityActions,
    llmEnhanced,
  } = report;

  const strength = strengthLabel || 'Good';

  const positiveFeedback = categoryFeedback
    ? Object.entries(categoryFeedback).filter(
        ([, text]) => text && (text.toLowerCase().includes('strong') || text.toLowerCase().includes('good') || text.toLowerCase().includes('no major issues'))
      )
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 text-left"
    >
      {llmEnhanced && (
        <div className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider bg-[#0FA34E] text-[#C6FF3D] px-3.5 py-1 rounded-full shadow">
          <Sparkles className="w-3.5 h-3.5" />
          AI KIIT Placement Evaluated
        </div>
      )}

      <div className="bg-[#F6E9D2] border-2 border-[#0FA34E]/30 rounded-3xl p-6 md:p-8 shadow-xl">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <h2 className="font-display font-extrabold text-2xl text-[#0FA34E]">Assessment Summary</h2>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-mono font-bold bg-[#0FA34E] text-[#C6FF3D]">
            <Lightbulb className="w-3.5 h-3.5" />
            {strength}
          </span>
        </div>
        <p className="text-sm text-[#0B7C3C] font-medium leading-relaxed">{summary}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {positiveFeedback.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#F6E9D2] border-2 border-[#0FA34E]/20 rounded-3xl p-6 shadow-lg"
          >
            <h3 className="flex items-center gap-2 font-display font-extrabold text-base text-[#0FA34E] mb-4">
              <CheckCircle2 className="w-5 h-5 text-[#0FA34E]" />
              Strong Resume Attributes
            </h3>
            <ul className="space-y-3">
              {positiveFeedback.map(([category, text]) => (
                <li key={category} className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#0FA34E] mt-1.5 shrink-0" />
                  <div>
                    <span className="text-xs font-mono font-bold text-[#0FA34E] uppercase block mb-0.5">{category}</span>
                    <span className="text-xs text-[#0B7C3C] leading-relaxed">{text}</span>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {priorityActions && priorityActions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#F6E9D2] border-2 border-[#0FA34E]/20 rounded-3xl p-6 shadow-lg"
          >
            <h3 className="flex items-center gap-2 font-display font-extrabold text-base text-[#0FA34E] mb-4">
              <ArrowRight className="w-5 h-5 text-[#0FA34E]" />
              Priority Action Items
            </h3>
            <ol className="space-y-3">
              {priorityActions.map((action, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#0FA34E] text-[#C6FF3D] font-mono text-xs font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-xs text-[#0B7C3C] leading-relaxed pt-0.5">{action}</span>
                </li>
              ))}
            </ol>
          </motion.div>
        )}
      </div>

      {categoryFeedback && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-[#F6E9D2] border-2 border-[#0FA34E]/20 rounded-3xl p-6 shadow-lg"
        >
          <h3 className="font-mono text-xs font-bold text-[#0FA34E] uppercase tracking-wider mb-4">
            Category Breakdown Remarks
          </h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(categoryFeedback).map(([category, text]) => (
              <div key={category} className="p-3.5 rounded-2xl bg-[#D7F27A] border border-[#0FA34E]/20">
                <p className="font-mono text-xs font-bold text-[#0FA34E] uppercase mb-1">{category}</p>
                <p className="text-xs text-[#0B7C3C] font-medium leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

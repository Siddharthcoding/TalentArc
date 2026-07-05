import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2, ArrowRight, Lightbulb } from 'lucide-react';
import { cn } from '@/utils/cn';

const STRENGTH_COLORS = {
  Excellent: { bg: 'bg-green-50 dark:bg-green-950/50', text: 'text-green-700 dark:text-green-400', border: 'border-green-200 dark:border-green-900/50' },
  Strong: { bg: 'bg-emerald-50 dark:bg-emerald-950/50', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-900/50' },
  Good: { bg: 'bg-blue-50 dark:bg-blue-950/50', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-900/50' },
  Fair: { bg: 'bg-amber-50 dark:bg-amber-950/50', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-900/50' },
  'Needs Improvement': { bg: 'bg-red-50 dark:bg-red-950/50', text: 'text-red-700 dark:text-red-400', border: 'border-red-200 dark:border-red-900/50' },
};

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
  const colors = STRENGTH_COLORS[strength] || STRENGTH_COLORS.Good;

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
      className="space-y-6"
    >
      {llmEnhanced && (
        <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          Enhanced by AI
        </div>
      )}

      <div className="glass-card !p-6 md:!p-8">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Assessment</h2>
          <span className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border',
            colors.bg, colors.text, colors.border
          )}>
            <Lightbulb className="w-3.5 h-3.5" />
            {strength}
          </span>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{summary}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {positiveFeedback.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card !p-6"
          >
            <h3 className="flex items-center gap-2 text-sm font-semibold text-green-600 dark:text-green-400 mb-4">
              <CheckCircle2 className="w-4 h-4" />
              What Went Well
            </h3>
            <ul className="space-y-3">
              {positiveFeedback.map(([category, text]) => (
                <li key={category} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0" />
                  <div>
                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase block mb-0.5">{category}</span>
                    <span className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{text}</span>
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
            className="glass-card !p-6"
          >
            <h3 className="flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-4">
              <ArrowRight className="w-4 h-4" />
              Action Items
            </h3>
            <ol className="space-y-3">
              {priorityActions.map((action, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-xs font-bold text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed pt-0.5">{action}</span>
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
          className="glass-card !p-6"
        >
          <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-4">
            Category Feedback
          </h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(categoryFeedback).map(([category, text]) => (
              <div key={category} className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase mb-1">{category}</p>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

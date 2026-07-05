import { motion } from 'framer-motion';
import { Hash, BarChart3, AlertTriangle } from 'lucide-react';

export default function KeywordInsights({ keywordInsights }) {
  if (!keywordInsights) return null;

  const { topKeywords, density, lexicalDiversity, missingCategories } = keywordInsights;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card !p-5"
    >
      <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-4">
        Keyword Insights
      </h3>

      {topKeywords && topKeywords.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 mb-2 flex items-center gap-1.5">
            <Hash className="w-3 h-3" />
            Top Keywords
          </p>
          <div className="flex flex-wrap gap-2">
            {topKeywords.map((kw, i) => (
              <motion.span
                key={kw.word || i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50"
              >
                {kw.word || kw}
                <span className="text-indigo-400 dark:text-indigo-500 font-bold">{kw.count || ''}</span>
              </motion.span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5 mb-1">
            <BarChart3 className="w-3 h-3" />
            Keyword Density
          </p>
          <p className="text-lg font-bold text-zinc-900 dark:text-white">{density || 'N/A'}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 mb-1">Lexical Diversity</p>
          <p className="text-lg font-bold text-zinc-900 dark:text-white">
            {lexicalDiversity ? lexicalDiversity.toFixed(2) : 'N/A'}
          </p>
        </div>
      </div>

      {missingCategories && missingCategories.length > 0 && (
        <div>
          <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5 mb-2">
            <AlertTriangle className="w-3 h-3" />
            Missing Skill Categories
          </p>
          <div className="flex flex-wrap gap-1.5">
            {missingCategories.map((mc, i) => (
              <span
                key={i}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/50"
              >
                {mc.category || mc}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

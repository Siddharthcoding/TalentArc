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
      className="bg-[#F6E9D2] border-2 border-[#0FA34E]/20 rounded-3xl p-5 text-left shadow-lg space-y-4"
    >
      <h3 className="font-mono text-xs font-bold text-[#0FA34E] uppercase tracking-wider">
        Keyword Density Insights
      </h3>

      {topKeywords && topKeywords.length > 0 && (
        <div>
          <p className="text-xs font-bold text-[#0B7C3C] mb-2 flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5 text-[#0FA34E]" />
            Top Extractable Keywords
          </p>
          <div className="flex flex-wrap gap-1.5">
            {topKeywords.map((kw, i) => (
              <span
                key={kw.word || i}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#D7F27A] text-[#0FA34E] border border-[#0FA34E]/30"
              >
                {kw.word || kw}
                <span className="font-mono text-[#0B7C3C]">{kw.count ? `(${kw.count})` : ''}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-mono font-bold text-[#0B7C3C] flex items-center gap-1 mb-1">
            <BarChart3 className="w-3.5 h-3.5 text-[#0FA34E]" />
            Keyword Density
          </p>
          <p className="font-display font-extrabold text-lg text-[#0FA34E]">{density || 'N/A'}</p>
        </div>
        <div>
          <p className="text-xs font-mono font-bold text-[#0B7C3C] mb-1">Lexical Diversity</p>
          <p className="font-display font-extrabold text-lg text-[#0FA34E]">
            {lexicalDiversity ? lexicalDiversity.toFixed(2) : 'N/A'}
          </p>
        </div>
      </div>

      {missingCategories && missingCategories.length > 0 && (
        <div className="pt-2 border-t border-[#0FA34E]/20">
          <p className="text-xs font-bold text-[#E1584A] flex items-center gap-1.5 mb-2">
            <AlertTriangle className="w-3.5 h-3.5" />
            Missing Skill Categories
          </p>
          <div className="flex flex-wrap gap-1.5">
            {missingCategories.map((mc, i) => (
              <span
                key={i}
                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-red-100 text-red-700 border border-red-200"
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

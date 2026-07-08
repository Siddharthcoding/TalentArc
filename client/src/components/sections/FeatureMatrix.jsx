import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, BarChart3, LayoutList, MessageSquare,
  Search, GitCompare, Target, Zap,
} from 'lucide-react';
import SectionWrapper from '@/components/ui/SectionWrapper';
import { cn } from '@/utils/cn';
import { useScrollReveal, staggerContainerVariants, fadeUpVariants } from '@/hooks/useScrollReveal';

const columns = [
  {
    title: 'Standalone ATS Scoring',
    icon: BarChart3,
    gradient: 'from-indigo-500 to-blue-500',
    features: [
      { icon: FileText, label: 'Multi-Format Parsing', desc: 'Extracts text, structure & metadata from PDF/DOCX' },
      { icon: LayoutList, label: '9-Dimension Scoring', desc: 'Formatting, contact, completeness, style, keywords & more' },
      { icon: MessageSquare, label: 'LLM Narrative Feedback', desc: 'AI-generated summary with prioritized action items' },
      { icon: Search, label: 'Keyword Density Analysis', desc: 'Identifies top keywords, density & lexical diversity' },
    ],
  },
  {
    title: 'Target-Driven JD Matching',
    icon: GitCompare,
    gradient: 'from-violet-500 to-purple-500',
    features: [
      { icon: Search, label: 'Semantic Embedding Matching', desc: 'Deep semantic alignment between resume & job reqs' },
      { icon: Target, label: 'Gap Analysis Engine', desc: 'Pinpoints missing skills & keywords with inject suggestions' },
      { icon: GitCompare, label: 'Side-by-Side Comparison', desc: 'Original vs AI-optimized bullet point rewrites' },
      { icon: Zap, label: 'Multi-Factor Matching Score', desc: 'Skills, experience, education, keyword & semantic subscores' },
    ],
  },
];

export default function FeatureMatrix() {
  const { ref, controls } = useScrollReveal(0.1);
  const [hoveredCol, setHoveredCol] = useState(null);

  return (
    <SectionWrapper id="feature-matrix">
      <motion.div
        ref={ref}
        variants={staggerContainerVariants}
        initial="hidden"
        animate={controls}
      >
        <motion.div variants={fadeUpVariants} className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Two Engines. <span className="gradient-text">One Platform.</span>
          </h2>
          <p className="mt-4 text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
            Whether you need a broad ATS audit or precision-targeted matching, TalentArc has you covered.
          </p>
        </motion.div>

        <motion.div
          variants={fadeUpVariants}
          className="grid md:grid-cols-2 gap-8"
        >
          {columns.map((col, colIdx) => (
            <div
              key={col.title}
              onMouseEnter={() => setHoveredCol(colIdx)}
              onMouseLeave={() => setHoveredCol(null)}
              className={cn(
                'relative rounded-2xl border p-6 md:p-8 transition-all duration-500',
                'bg-white/40 dark:bg-zinc-900/40 backdrop-blur-sm',
                hoveredCol === colIdx
                  ? 'border-indigo-300/50 dark:border-indigo-500/30 shadow-xl shadow-indigo-500/[0.04]'
                  : 'border-zinc-200/50 dark:border-zinc-800/50'
              )}
            >
              <div className={cn(
                'absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500',
                hoveredCol === colIdx && 'opacity-100',
                `bg-gradient-to-br ${col.gradient}/[0.03]`
              )} />

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className={cn(
                    'w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center',
                    col.gradient
                  )}>
                    <col.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                    {col.title}
                  </h3>
                </div>

                <div className="space-y-4">
                  {col.features.map((feat) => (
                    <div
                      key={feat.label}
                      className={cn(
                        'flex items-start gap-4 p-3 rounded-xl transition-all duration-300',
                        'hover:bg-white/60 dark:hover:bg-zinc-800/40 hover:shadow-sm',
                        'group cursor-default'
                      )}
                    >
                      <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform duration-300">
                        <feat.icon className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                          {feat.label}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                          {feat.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </SectionWrapper>
  );
}
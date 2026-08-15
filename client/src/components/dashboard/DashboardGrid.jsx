import { motion } from 'framer-motion';
import ScoreGauge from './ScoreGauge';
import ScoreBreakdown from './ScoreBreakdown';
import FlagsPanel from './FlagsPanel';
import NarrativeFeedback from './NarrativeFeedback';
import KeywordInsights from './KeywordInsights';

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function DashboardGrid({ result }) {
  if (!result) return null;

  const { fileName, fileType, scoring, report, ats } = result;
  const { overallScore, maxScore, percentage, categories } = scoring;

  const categoriesWithDetails = { ...categories };
  if (ats) {
    Object.keys(ats).forEach((key) => {
      if (ats[key]?.details && categoriesWithDetails[key]) {
        categoriesWithDetails[key] = {
          ...categoriesWithDetails[key],
          details: ats[key].details,
        };
      }
    });
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 text-left"
    >
      <motion.div variants={itemVariants} className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-block bg-[#0FA34E] text-[#C6FF3D] font-mono text-xs font-black px-3.5 py-1 rounded-full uppercase mb-2">
            ★ KIIT ATS RESUME EVALUATION REPORT
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight text-[#0FA34E]">
            ATS Analysis Results
          </h1>
          <p className="text-sm font-mono font-bold text-[#0B7C3C] mt-2">
            Target Resume File: <span className="underline">{fileName}{fileType}</span>
          </p>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-12 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-4">
          <div className="bg-[#F6E9D2] border-2 border-[#0FA34E]/30 rounded-3xl p-6 md:p-8 flex flex-col items-center shadow-xl">
            <ScoreGauge
              percentage={percentage}
              score={overallScore}
              maxScore={maxScore}
            />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-4">
          <ScoreBreakdown categories={categoriesWithDetails} />
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-4">
          <FlagsPanel flags={report?.flags} />
          <div className="mt-4">
            <KeywordInsights keywordInsights={report?.keywordInsights} />
          </div>
        </motion.div>
      </div>

      <motion.div variants={itemVariants}>
        <NarrativeFeedback report={report} />
      </motion.div>
    </motion.div>
  );
}

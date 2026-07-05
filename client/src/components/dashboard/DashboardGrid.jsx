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
      className="space-y-8"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Analysis Results
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            {fileName}{fileType}
          </p>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-12 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-4">
          <div className="glass-card !p-6 md:!p-8 flex flex-col items-center">
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

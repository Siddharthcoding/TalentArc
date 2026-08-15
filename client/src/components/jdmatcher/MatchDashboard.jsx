import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import MatchGauge from './MatchGauge';
import SubScoresGrid from './SubScoresGrid';
import SkillGapPanel from './SkillGapPanel';
import RewriteCoachPanel from './RewriteCoachPanel';
import NarrativeFeedback from '@/components/dashboard/NarrativeFeedback';
import FlagsPanel from '@/components/dashboard/FlagsPanel';

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function MatchDashboard({ data, onReset }) {
  if (!data) return null;

  const { matching, aggregated, report } = data;
  const breakdown = aggregated?.breakdown || report?.breakdown;
  const skillDetails = matching?.skill?.details;
  const keywordDetails = matching?.keyword?.details;
  const rewriteSuggestions = matching?.rewrite?.details?.suggestions;
  const llmEnhanced = matching?.rewrite?.details?.llmEnhanced || report?.llmEnhanced;

  const narrativeReport = report
    ? {
        summary: report.summary,
        strengthLabel: report.strengthLabel,
        priorityActions: report.priorityActions,
        llmEnhanced: report.llmEnhanced,
      }
    : null;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <motion.div variants={itemVariants} className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 font-mono text-xs font-bold uppercase tracking-[0.24em] text-fuchsia-600 dark:text-fuchsia-300">
            Role alignment report
          </p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-950 dark:text-white">
            Match Results
          </h1>
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mt-2">
            {data.resume?.fileName || 'Resume'} matched against {data.jd?.company || 'target role'}
          </p>
        </div>
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          New Match
        </button>
      </motion.div>

      <div className="grid lg:grid-cols-12 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-5">
          <div className="glass-card !p-6 md:!p-8 flex flex-col items-center">
            <MatchGauge matchPercentage={report?.matchPercentage || aggregated?.overallScore || 0} />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-7">
          <SubScoresGrid breakdown={breakdown} />
        </motion.div>
      </div>

      <motion.div variants={itemVariants} className="grid lg:grid-cols-2 gap-6">
        <SkillGapPanel
          skillDetails={skillDetails}
          keywordDetails={keywordDetails}
        />
        {report?.flagSummary && (
          <FlagsPanel flags={report.flagSummary} />
        )}
      </motion.div>

      {rewriteSuggestions && rewriteSuggestions.length > 0 && (
        <motion.div variants={itemVariants}>
          <RewriteCoachPanel
            suggestions={rewriteSuggestions}
            llmEnhanced={llmEnhanced}
          />
        </motion.div>
      )}

      {narrativeReport && (
        <motion.div variants={itemVariants}>
          <NarrativeFeedback report={narrativeReport} />
        </motion.div>
      )}
    </motion.div>
  );
}

import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Building2, FileText } from 'lucide-react';
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
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
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
      className="space-y-8 text-left"
    >
      <motion.div variants={itemVariants} className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-[#0FA34E] text-[#C6FF3D] font-mono text-xs font-black px-3.5 py-1 rounded-full uppercase mb-2 shadow">
            ★ JD FIT SCORECARD &amp; ROADMAP
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-[#0FA34E]">
            Target Role Match Results
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-semibold text-[#0B7C3C] mt-2">
            <span className="flex items-center gap-1.5 bg-[#DFF5E6] px-3 py-1 rounded-full border border-[#0FA34E]/20">
              <FileText className="w-3.5 h-3.5 text-[#0FA34E]" />
              {data.resume?.fileName || 'Uploaded Resume'}
            </span>
            <span>matched against</span>
            <span className="flex items-center gap-1.5 bg-[#0FA34E]/10 px-3 py-1 rounded-full border border-[#0FA34E]/20 font-bold text-[#0FA34E]">
              <Building2 className="w-3.5 h-3.5 text-[#0FA34E]" />
              {data.jd?.company || 'Target Recruiter JD'}
            </span>
          </div>
        </div>
        {onReset && (
          <button
            onClick={onReset}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-display font-extrabold text-xs bg-[#F6E9D2] text-[#0FA34E] border-2 border-[#0FA34E] hover:bg-[#DFF5E6] transition-all shadow-sm self-start sm:self-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Match Another JD
          </button>
        )}
      </motion.div>

      <div className="grid lg:grid-cols-12 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-5">
          <div className="bg-[#F6E9D2] border-2 border-[#0FA34E]/30 rounded-3xl p-6 md:p-8 flex flex-col items-center shadow-xl h-full justify-center">
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

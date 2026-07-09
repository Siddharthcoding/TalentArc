import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, AlertCircle, FileText, Briefcase } from 'lucide-react';
import { getReport } from '@/services/api';
import DashboardGrid from '@/components/dashboard/DashboardGrid';
import MatchDashboard from '@/components/jdmatcher/MatchDashboard';
import SectionWrapper from '@/components/ui/SectionWrapper';

export default function ReportDetail() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getReport(id)
      .then((res) => {
        setReport(res.data);
      })
      .catch((err) => {
        setError(err?.message || 'Failed to load report');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <SectionWrapper className="min-h-screen flex items-center justify-center pt-20">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
          <p className="text-sm text-zinc-400">Loading report...</p>
        </div>
      </SectionWrapper>
    );
  }

  if (error || !report) {
    return (
      <SectionWrapper className="min-h-screen flex items-center justify-center pt-20">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 max-w-md w-full text-center"
        >
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Report not found</h2>
          <p className="text-sm text-zinc-500 mb-6">{error || 'This report may have been deleted.'}</p>
          <Link
            to="/reports"
            className="inline-flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to My Reports
          </Link>
        </motion.div>
      </SectionWrapper>
    );
  }

  const resultPayload = report.resultPayload;
  const isATS = report.reportType === 'ats';
  const reportTitle = isATS
    ? resultPayload?.fileName || 'ATS Score Report'
    : resultPayload?.jd?.company
      ? `JD Match — ${resultPayload.jd.company}`
      : 'JD Match Report';

  return (
    <SectionWrapper className="min-h-screen pt-20 pb-16">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Link
            to="/reports"
            className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            My Reports
          </Link>
          <span className="text-zinc-300 dark:text-zinc-600">/</span>
          <div className="flex items-center gap-2">
            <div className={cn(
              'w-7 h-7 rounded-lg flex items-center justify-center',
              isATS ? 'bg-indigo-50 dark:bg-indigo-950/40' : 'bg-amber-50 dark:bg-amber-950/40'
            )}>
              {isATS ? (
                <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              ) : (
                <Briefcase className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              )}
            </div>
            <span className="text-sm font-semibold text-zinc-900 dark:text-white truncate max-w-[300px]">
              {reportTitle}
            </span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {isATS ? (
            <DashboardGrid result={resultPayload} />
          ) : (
            <MatchDashboard data={resultPayload} />
          )}
        </motion.div>
      </div>
    </SectionWrapper>
  );
}

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

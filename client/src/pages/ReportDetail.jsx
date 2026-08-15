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
      .then((res) => { setReport(res.data); })
      .catch((err) => { setError(err?.message || 'Failed to load report'); })
      .finally(() => { setLoading(false); });
  }, [id]);

  if (loading) {
    return (
      <SectionWrapper className="min-h-screen flex items-center justify-center pt-20" style={{ background: '#D7F27A' }}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#0FA34E' }} />
          <p className="text-sm font-semibold" style={{ color: '#0B7C3C' }}>Loading report...</p>
        </div>
      </SectionWrapper>
    );
  }

  if (error || !report) {
    return (
      <SectionWrapper className="min-h-screen flex items-center justify-center pt-20" style={{ background: '#D7F27A' }}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 max-w-md w-full text-center rounded-3xl border-2 shadow-xl"
          style={{ background: '#F6E9D2', borderColor: '#E1584A33' }}
        >
          <AlertCircle className="w-10 h-10 mx-auto mb-4" style={{ color: '#E1584A' }} />
          <h2 className="text-lg font-bold mb-2" style={{ color: '#0B7C3C', fontFamily: '"Baloo 2", cursive' }}>
            Report not found
          </h2>
          <p className="text-sm mb-6" style={{ color: '#0B7C3C88' }}>
            {error || 'This report may have been deleted.'}
          </p>
          <Link
            to="/reports"
            className="inline-flex items-center gap-2 text-sm font-bold"
            style={{ color: '#0FA34E' }}
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
    <SectionWrapper className="min-h-screen pt-32 pb-16" style={{ background: '#D7F27A' }}>
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-3 mb-8">
          <Link
            to="/reports"
            className="flex items-center gap-1.5 text-sm font-semibold transition-colors hover:opacity-75"
            style={{ color: '#0B7C3C' }}
          >
            <ArrowLeft className="w-4 h-4" />
            My Reports
          </Link>
          <span style={{ color: '#0B7C3C44' }}>/</span>
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: isATS ? '#DFF5E6' : '#E8A33D22' }}
            >
              {isATS
                ? <FileText className="w-3.5 h-3.5" style={{ color: '#0FA34E' }} />
                : <Briefcase className="w-3.5 h-3.5" style={{ color: '#E8A33D' }} />}
            </div>
            <span className="text-sm font-bold truncate max-w-[300px]" style={{ color: '#0B7C3C' }}>
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

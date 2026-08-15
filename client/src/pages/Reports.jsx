import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Briefcase, Award, Loader2, AlertCircle } from 'lucide-react';
import { getReports, deleteReport, getUserAssessments, deleteAssessment } from '@/services/api';
import ReportCard from '@/components/reports/ReportCard';
import ReportsEmpty from '@/components/reports/ReportsEmpty';
import { cn } from '@/utils/cn';
import SEO from '@/components/SEO';

const FILTERS = [
  { key: null, label: 'All Reports', icon: null },
  { key: 'ats', label: 'ATS Score', icon: FileText },
  { key: 'jd_match', label: 'JD Match', icon: Briefcase },
  { key: 'assessment', label: 'Mock Assessments', icon: Award },
];

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeFilter === 'assessment') {
        const res = await getUserAssessments();
        const mapped = (res.data || []).map((a) => ({
          id: a.id,
          reportType: 'assessment',
          inputData: { topic: a.topic, score: a.score, maxScore: a.maxScore, status: a.status, inputType: a.inputType },
          createdAt: a.createdAt,
        }));
        setReports(mapped);
      } else if (activeFilter === null) {
        const [repRes, assRes] = await Promise.all([
          getReports(null),
          getUserAssessments(),
        ]);
        const standardReports = repRes.data || [];
        const mappedAssessments = (assRes.data || []).map((a) => ({
          id: a.id,
          reportType: 'assessment',
          inputData: { topic: a.topic, score: a.score, maxScore: a.maxScore, status: a.status, inputType: a.inputType },
          createdAt: a.createdAt,
        }));
        const combined = [...standardReports, ...mappedAssessments].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setReports(combined);
      } else {
        const res = await getReports(activeFilter);
        setReports(res.data || []);
      }
    } catch (err) {
      setError(err?.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleDelete = useCallback(async (id) => {
    const reportToDelete = reports.find((r) => r.id === id);
    if (!reportToDelete) return;
    try {
      if (reportToDelete.reportType === 'assessment') {
        await deleteAssessment(id);
      } else {
        await deleteReport(id);
      }
      setReports((prev) => prev.filter((r) => r.id !== id));
    } catch {
    }
  }, [reports]);

  return (
    <div className="section-container py-24 space-y-8 text-left max-w-4xl mx-auto">
      <SEO
        title="Saved Reports"
        description="Access all your saved ATS resume scores, job description match reports, and AI mock assessment scorecards."
        path="/reports"
        keywords="saved ATS reports, resume score history, KIIT mock assessment scorecard, JD match reports"
      />
      <div>
        <div className="inline-block bg-[#0FA34E] text-[#C6FF3D] font-mono text-xs font-black px-3.5 py-1 rounded-full uppercase mb-2 shadow">
          ★ PERSISTENT STUDENT EVALUATION ARCHIVE
        </div>
        <h1 className="font-display text-4xl sm:text-6xl font-extrabold text-[#0FA34E]">
          My Saved Reports
        </h1>
        <p className="text-sm font-medium text-[#0B7C3C] mt-2">
          View all your previous ATS resume scores, role match insights, and mock assessment history.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 bg-[#F6E9D2] p-2 rounded-full border-2 border-[#0FA34E]/20 shadow-md">
        {FILTERS.map((f) => {
          const isActive = activeFilter === f.key;
          const Icon = f.icon;
          return (
            <button
              key={f.key || 'all'}
              onClick={() => setActiveFilter(f.key)}
              className={cn(
                'flex items-center gap-2 px-5 py-2 rounded-full text-xs font-display font-extrabold transition-all',
                isActive
                  ? 'bg-[#0FA34E] text-[#F6E9D2] shadow'
                  : 'text-[#0FA34E] hover:bg-[#D7F27A]'
              )}
            >
              {Icon && <Icon className="w-4 h-4" />}
              {f.label}
            </button>
          );
        })}
      </div>

      {loading && (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#0FA34E] mx-auto mb-2" />
          <p className="font-display font-bold text-sm text-[#0FA34E]">Loading saved reports...</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-100 border-2 border-red-300 rounded-2xl text-red-800 text-xs font-mono font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={fetchReports} className="underline">Retry</button>
        </div>
      )}

      {!loading && !error && reports.length === 0 && <ReportsEmpty filter={activeFilter} />}

      {!loading && reports.length > 0 && (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFilter || 'all'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {reports.map((r, i) => (
              <ReportCard key={r.id} report={r} index={i} onDelete={handleDelete} />
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

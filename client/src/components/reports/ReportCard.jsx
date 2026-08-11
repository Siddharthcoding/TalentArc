import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FileText, Briefcase, Award, Trash2, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

function formatDate(dateStr) {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function getScore(report) {
  try {
    const payload = report?.resultPayload || report?.inputData;
    let score = null;
    if (report.reportType === 'ats') {
      score = payload?.scoring?.overall;
    } else if (report.reportType === 'assessment') {
      if (payload?.status === 'terminated') return 0;
      if (payload?.maxScore > 0) {
        score = (payload.score / payload.maxScore) * 100;
      }
    } else {
      score = payload?.aggregated?.overall;
    }
    const numericScore = Number(score);
    return Number.isFinite(numericScore) ? numericScore : null;
  } catch {
    return null;
  }
}

function getTitle(report) {
  if (report.reportType === 'jd_match') {
    const company = report?.resultPayload?.jd?.company || report?.inputData?.company;
    return company ? `JD Match — ${company}` : 'JD Match Report';
  }
  if (report.reportType === 'assessment') {
    const topic = report?.inputData?.topic || 'Tech Skills';
    const isTerminated = report?.inputData?.status === 'terminated';
    return `Assessment — ${topic}${isTerminated ? ' (Terminated)' : ''}`;
  }
  const fileName = report?.resultPayload?.fileName || report?.inputData?.fileName;
  return fileName ? `ATS Score — ${fileName}` : 'ATS Score Report';
}

export default function ReportCard({ report, onDelete, index = 0 }) {
  const score = getScore(report);
  const hasScore = score !== null;
  const scoreColor = hasScore && score >= 80 ? 'text-emerald-500' : hasScore && score >= 60 ? 'text-amber-500' : 'text-red-400';
  const scoreBg = hasScore && score >= 80 ? 'bg-emerald-50 dark:bg-emerald-950/30' : hasScore && score >= 60 ? 'bg-amber-50 dark:bg-amber-950/30' : 'bg-red-50 dark:bg-red-950/30';

  return (
    <MotionLink
      to={report.reportType === 'assessment' ? `/assessment/${report.id}/report` : `/reports/${report.id}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      whileHover={{ y: -2 }}
      className="group block glass-card p-5 relative overflow-hidden cursor-pointer"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.02] to-violet-500/[0.02] dark:from-indigo-500/[0.03] dark:to-violet-500/[0.03] pointer-events-none" />

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className={cn(
            'mt-0.5 w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
            report.reportType === 'jd_match'
              ? 'bg-amber-50 dark:bg-amber-950/40'
              : report.reportType === 'assessment'
                ? 'bg-emerald-50 dark:bg-emerald-950/40'
                : 'bg-indigo-50 dark:bg-indigo-950/40'
          )}>
            {report.reportType === 'jd_match' ? (
              <Briefcase className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            ) : report.reportType === 'assessment' ? (
              <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate max-w-[200px]">
              {getTitle(report)}
            </p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
              {formatDate(report.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {hasScore && (
            <div className={cn('px-3 py-1.5 rounded-lg text-sm font-bold tabular-nums', scoreColor, scoreBg)}>
              {report.reportType === 'assessment'
                ? report?.inputData?.status === 'terminated'
                  ? 'Terminated'
                  : `${report?.inputData?.score || 0}/${report?.inputData?.maxScore || 0}`
                : score.toFixed(0)
              }
            </div>
          )}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronRight className="w-4 h-4 text-zinc-300 dark:text-zinc-600" />
          </div>
        </div>
      </div>

      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (window.confirm('Delete this report?')) {
              onDelete(report.id);
            }
          }}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
          aria-label="Delete report"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </MotionLink>
  );
}
const MotionLink = motion(Link);

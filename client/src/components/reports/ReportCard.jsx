import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Award, Briefcase, ChevronRight, FileText, Trash2 } from 'lucide-react';
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

function getTitle(report) {
  if (report.reportType === 'jd_match') {
    const company = report?.resultPayload?.jd?.company || report?.inputData?.company;
    return company ? `JD Match - ${company}` : 'JD Match Report';
  }
  if (report.reportType === 'assessment') {
    const topic = report?.inputData?.topic || 'Tech Skills';
    const isTerminated = report?.inputData?.status === 'terminated';
    return `Assessment - ${topic}${isTerminated ? ' (Terminated)' : ''}`;
  }
  const fileName = report?.resultPayload?.fileName || report?.inputData?.fileName;
  return fileName ? `ATS Score - ${fileName}` : 'ATS Score Report';
}

function getTypeConfig(type) {
  if (type === 'jd_match') return { icon: Briefcase, label: 'JD Match' };
  if (type === 'assessment') return { icon: Award, label: 'Assessment' };
  return { icon: FileText, label: 'ATS Score' };
}

export default function ReportCard({ report, onDelete, index = 0 }) {
  const config = getTypeConfig(report.reportType);
  const Icon = config.icon;

  return (
    <div className="relative group">
      <Link
        to={report.reportType === 'assessment' ? `/assessment/${report.id}/report` : `/reports/${report.id}`}
        className="block bg-[#F6E9D2] border-2 border-[#0FA34E]/20 hover:border-[#0FA34E] p-5 rounded-3xl shadow-md hover:shadow-xl transition-all"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-[#0FA34E] text-[#F6E9D2] flex items-center justify-center shrink-0 shadow">
              <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-[10px] font-bold bg-[#D7F27A] text-[#0FA34E] px-2.5 py-0.5 rounded-full border border-[#0FA34E]/20">
                  {config.label}
                </span>
                <span className="text-xs font-mono text-[#0B7C3C]">
                  {formatDate(report.createdAt)}
                </span>
              </div>
              <p className="font-display font-extrabold text-base text-[#0FA34E] truncate max-w-sm">
                {getTitle(report)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (window.confirm('Delete this report?')) onDelete(report.id);
              }}
              className="p-2 rounded-xl text-[#0FA34E]/60 hover:text-red-600 hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <ChevronRight className="w-5 h-5 text-[#0FA34E] group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Link>
    </div>
  );
}

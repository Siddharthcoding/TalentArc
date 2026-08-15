import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileSearch, Sparkles, Award, Briefcase, FileText, ArrowRight } from 'lucide-react';

export default function ReportsEmpty({ filter }) {
  const getFilterDetails = () => {
    if (filter === 'ats') {
      return {
        icon: FileText,
        title: 'No ATS Resume Reports Found',
        desc: 'Upload and score your resume against KIIT campus placement ATS filters to see your breakdown and score archive here.',
        ctaLink: '/dashboard',
        ctaText: 'Run First ATS Scan',
      };
    }
    if (filter === 'jd_match') {
      return {
        icon: Briefcase,
        title: 'No Job Description Matches Found',
        desc: 'Match your resume against recruiter job descriptions (HighRadius, Deloitte, Microsoft) to identify missing skills and keywords.',
        ctaLink: '/jd-matcher',
        ctaText: 'Start JD Match',
      };
    }
    if (filter === 'assessment') {
      return {
        icon: Award,
        title: 'No Mock Assessments Completed Yet',
        desc: 'Take an AI-powered proctored mock assessment on DSA, Java, SQL, or target company questions to track your test scorecards here.',
        ctaLink: '/assessment',
        ctaText: 'Take a Mock Test',
      };
    }
    return {
      icon: FileSearch,
      title: 'No Saved Reports Yet',
      desc: 'Run your first ATS resume analysis, JD skill match, or take an AI mock test. Every evaluation is automatically archived to your KIIT student profile.',
      ctaLink: '/dashboard',
      ctaText: 'Analyze Resume Now',
    };
  };

  const info = getFilterDetails();
  const Icon = info.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-[#F6E9D2] border-2 border-[#0FA34E]/30 rounded-3xl p-8 sm:p-12 text-center shadow-xl max-w-2xl mx-auto space-y-6 relative overflow-hidden"
    >
      <div className="relative inline-flex items-center justify-center">
        <div className="w-20 h-20 rounded-3xl bg-[#0FA34E] text-[#D7F27A] flex items-center justify-center shadow-lg">
          <Icon className="w-10 h-10" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#C6FF3D] text-[#0FA34E] flex items-center justify-center shadow">
          <Sparkles className="w-4 h-4" />
        </div>
      </div>

      <div className="space-y-2">
        <div className="inline-block bg-[#0FA34E]/10 text-[#0FA34E] font-mono text-xs font-black px-3 py-1 rounded-full uppercase border border-[#0FA34E]/20">
          STUDENT ARCHIVE IS EMPTY
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#0FA34E]">
          {info.title}
        </h2>
        <p className="text-sm font-medium text-[#0B7C3C] max-w-md mx-auto leading-relaxed">
          {info.desc}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Link
          to={info.ctaLink}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-display font-extrabold text-sm bg-[#0FA34E] text-[#D7F27A] hover:bg-[#0B7C3C] shadow-md transition-all transform hover:-translate-y-0.5"
        >
          <span>{info.ctaText}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        {filter !== 'assessment' && (
          <Link
            to="/assessment"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full font-display font-bold text-sm bg-[#DFF5E6] text-[#0FA34E] border-2 border-[#0FA34E]/30 hover:border-[#0FA34E] transition-all"
          >
            <Award className="w-4 h-4" />
            <span>Try AI Mock Test</span>
          </Link>
        )}
      </div>
    </motion.div>
  );
}

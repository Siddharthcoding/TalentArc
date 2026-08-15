import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Copy, Check } from 'lucide-react';
import { cn } from '@/utils/cn';

function SkillPill({ skill, matched }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(skill).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [skill]);

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      onClick={matched ? undefined : handleCopy}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold border transition-all duration-200',
        matched
          ? 'bg-[#DFF5E6] text-[#0FA34E] border-[#0FA34E]/30 cursor-default'
          : 'bg-[#E1584A]/10 text-[#E1584A] border-[#E1584A]/30 cursor-pointer hover:bg-[#E1584A]/20'
      )}
      title={matched ? undefined : 'Click to copy keyword'}
    >
      {matched ? (
        <CheckCircle2 className="w-3.5 h-3.5 text-[#0FA34E]" />
      ) : (
        <XCircle className="w-3.5 h-3.5 text-[#E1584A]" />
      )}
      <span>{skill}</span>
      {!matched && (
        <span className="relative ml-0.5">
          {copied ? (
            <Check className="w-3 h-3 text-[#0FA34E]" />
          ) : (
            <Copy className="w-3 h-3 opacity-60 group-hover:opacity-100" />
          )}
        </span>
      )}
    </motion.button>
  );
}

function SkillSection({ title, skills, matched }) {
  if (!skills || skills.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-mono font-bold text-[#0FA34E] uppercase">
          {title}
        </h4>
        <span
          className={cn(
            'text-[10px] font-mono font-black px-2 py-0.5 rounded-full',
            matched
              ? 'bg-[#0FA34E] text-[#D7F27A]'
              : 'bg-[#E1584A] text-white'
          )}
        >
          {skills.length}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <SkillPill key={skill} skill={skill} matched={matched} />
        ))}
      </div>
    </div>
  );
}

export default function SkillGapPanel({ skillDetails, keywordDetails }) {
  const matchedRequired = skillDetails?.matchedRequired || [];
  const matchedPreferred = skillDetails?.matchedPreferred || [];
  const missingRequired = skillDetails?.missingRequired || [];
  const missingPreferred = skillDetails?.missingPreferred || [];
  const overlappingKeywords = keywordDetails?.overlappingKeywords || [];
  const missingKeywords = keywordDetails?.missingKeywords || [];

  const matchedSkills = [...matchedRequired, ...matchedPreferred];
  const missingSkills = [...missingRequired, ...missingPreferred];
  const keywordSection = [...overlappingKeywords, ...missingKeywords].length > 0;
  const hasAny = matchedSkills.length > 0 || missingSkills.length > 0 || keywordSection;

  if (!hasAny) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
      className="bg-[#F6E9D2] border-2 border-[#0FA34E]/30 rounded-3xl p-6 md:p-8 shadow-xl text-left space-y-6"
    >
      <div className="flex items-center justify-between border-b border-[#0FA34E]/20 pb-3">
        <div>
          <h3 className="font-display font-extrabold text-xl text-[#0FA34E]">
            Skill & Keyword Gap Breakdown
          </h3>
          <p className="text-xs font-medium text-[#0B7C3C] mt-0.5">
            Click any missing keyword pill to copy it directly into your clipboard.
          </p>
        </div>
      </div>

      <div className="space-y-5">
        <SkillSection
          title="Matched Required Competencies"
          skills={matchedSkills}
          matched={true}
        />

        <SkillSection
          title="Missing Keywords & Recommended Additions"
          skills={missingSkills}
          matched={false}
        />

        {overlappingKeywords.length > 0 && (
          <SkillSection
            title="Overlapping Job Description Keywords"
            skills={overlappingKeywords}
            matched={true}
          />
        )}

        {missingKeywords.length > 0 && (
          <SkillSection
            title="Missing High-Frequency JD Terms"
            skills={missingKeywords}
            matched={false}
          />
        )}
      </div>
    </motion.div>
  );
}

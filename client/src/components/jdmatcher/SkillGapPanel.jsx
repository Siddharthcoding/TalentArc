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
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200',
        matched
          ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400 border-green-200/50 dark:border-green-800/40 cursor-default'
          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/40 cursor-pointer hover:shadow-sm hover:shadow-amber-500/20'
      )}
      title={matched ? undefined : 'Click to copy'}
    >
      {matched ? (
        <CheckCircle2 className="w-3 h-3" />
      ) : (
        <XCircle className="w-3 h-3" />
      )}
      {skill}
      {!matched && (
        <span className="relative">
          {copied ? (
            <Check className="w-3 h-3 text-green-500" />
          ) : (
            <Copy className="w-3 h-3 opacity-50 group-hover:opacity-100" />
          )}
        </span>
      )}
    </motion.button>
  );
}

function SkillSection({ title, skills, matched }) {
  if (!skills || skills.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          {title}
        </h4>
        <span className={cn(
          'text-xs font-medium px-2 py-0.5 rounded-full',
          matched
            ? 'bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400'
            : 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400'
        )}>
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
      transition={{ delay: 0.3, duration: 0.5 }}
      className="space-y-6"
    >
      <h3 className="font-mono text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.22em]">
        Skill & Keyword Gap Analysis
      </h3>

      <div className="glass-card !p-6 space-y-6">
        {(matchedSkills.length > 0 || missingSkills.length > 0) && (
          <>
            {matchedSkills.length > 0 && (
              <SkillSection
                title="Matched Skills"
                skills={matchedSkills}
                matched={true}
              />
            )}

            {matchedSkills.length > 0 && missingSkills.length > 0 && (
              <div className="border-t soft-divider" />
            )}

            {missingSkills.length > 0 && (
              <SkillSection
                title="Missing Skills - Click to Copy & Inject"
                skills={missingSkills}
                matched={false}
              />
            )}
          </>
        )}

        {keywordSection && (
          <>
            {missingSkills.length > 0 && (
              <div className="border-t soft-divider" />
            )}

            {overlappingKeywords.length > 0 && (
              <SkillSection
                title="Matched ATS Keywords"
                skills={overlappingKeywords}
                matched={true}
              />
            )}

            {overlappingKeywords.length > 0 && missingKeywords.length > 0 && (
              <div className="border-t soft-divider" />
            )}

            {missingKeywords.length > 0 && (
              <SkillSection
                title="Missing ATS Keywords"
                skills={missingKeywords}
                matched={false}
              />
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}

import { Sparkles, Lock, Crown } from 'lucide-react';

/**
 * FreeTrialBadge — shows free trial remaining / used status for a service.
 *
 * Props:
 *   service       'ats' | 'jd_match' | 'mock_test'
 *   trialUsed     boolean
 *   hasPro        boolean
 *   loading       boolean
 *   className     string (optional)
 */
export default function FreeTrialBadge({ service, trialUsed, hasPro, loading, className = '' }) {
  if (loading) return null;

  if (hasPro) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${className}`}
        style={{ background: 'rgba(15,163,78,0.12)', color: '#0FA34E', border: '1px solid rgba(15,163,78,0.3)' }}
      >
        <Crown className="w-3 h-3" />
        Pro — Unlimited
      </span>
    );
  }

  if (trialUsed) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${className}`}
        style={{ background: 'rgba(239,68,68,0.1)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.25)' }}
      >
        <Lock className="w-3 h-3" />
        Free trial used
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${className}`}
      style={{ background: 'rgba(215,242,122,0.6)', color: '#0B7C3C', border: '1px solid rgba(15,163,78,0.25)' }}
    >
      <Sparkles className="w-3 h-3" />
      1 Free Trial Available
    </span>
  );
}

/**
 * ProPaywall — full-page overlay for Pro-gated content (e.g. Company Bank)
 */
export function ProPaywall({ onUpgrade }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center space-y-5">
      <div className="w-16 h-16 rounded-3xl flex items-center justify-center shadow-xl"
        style={{ background: 'linear-gradient(135deg, #0FA34E 0%, #0B7C3C 100%)' }}>
        <Crown className="w-8 h-8 text-[#D7F27A]" />
      </div>
      <div className="space-y-2 max-w-sm">
        <h2 className="font-display font-extrabold text-2xl text-[#0FA34E]">Pro Plan Required</h2>
        <p className="text-sm text-[#0B7C3C] font-medium leading-relaxed">
          The Company Question Bank is available exclusively to Pro members.
          Upgrade for just <strong>₹49/month</strong> to unlock unlimited access to all 40+ company Q&amp;A banks.
        </p>
      </div>
      <button
        onClick={onUpgrade}
        className="px-7 py-3.5 rounded-2xl font-display font-extrabold text-sm flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg"
        style={{ background: 'linear-gradient(135deg, #0FA34E 0%, #0B7C3C 100%)', color: '#fff' }}
      >
        <Crown className="w-4 h-4 text-[#D7F27A]" />
        Upgrade to Pro — ₹49/month
      </button>
      <p className="text-[11px] text-[#0B7C3C] font-medium">Includes: ATS, JD Matcher, Mock Tests, Company Bank, Resume Builder</p>
    </div>
  );
}

/**
 * TrialExhaustedBanner — inline banner shown when free trial is used up
 */
export function TrialExhaustedBanner({ serviceName, onUpgrade }) {
  const labels = {
    ats: 'ATS Resume Checker',
    jd_match: 'JD Matcher',
    mock_test: 'Mock Test',
  };
  return (
    <div
      className="w-full rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      style={{ background: 'linear-gradient(135deg, rgba(15,163,78,0.08) 0%, rgba(215,242,122,0.15) 100%)', border: '1.5px solid rgba(15,163,78,0.25)' }}
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#0FA34E] flex items-center justify-center shrink-0 shadow">
          <Lock className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="font-display font-extrabold text-[#0FA34E] text-sm">Free Trial Used</p>
          <p className="text-xs text-[#0B7C3C] font-medium mt-0.5">
            You've used your 1 free {labels[serviceName] || serviceName} trial.
            Upgrade to Pro for unlimited access — just <strong>₹49/month</strong>.
          </p>
        </div>
      </div>
      <button
        onClick={onUpgrade}
        className="shrink-0 px-5 py-2.5 rounded-xl font-display font-extrabold text-xs flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow"
        style={{ background: '#0FA34E', color: '#fff' }}
      >
        <Crown className="w-3.5 h-3.5 text-[#D7F27A]" />
        Upgrade — ₹49/mo
      </button>
    </div>
  );
}

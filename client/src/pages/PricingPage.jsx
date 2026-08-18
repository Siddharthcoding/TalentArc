import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowRight, Sparkles, ShieldCheck, Crown, Zap, Star, Lock } from 'lucide-react';
import SectionWrapper from '@/components/ui/SectionWrapper';
import { useScrollReveal, staggerContainerVariants, fadeUpVariants } from '@/hooks/useScrollReveal';
import SEO from '@/components/SEO';
import PaymentModal from '@/components/payment/PaymentModal';
import { useAuth } from '@/context/AuthContext';
import { useAccess } from '@/hooks/useAccess';
import { Link } from 'react-router-dom';

const PRO_FEATURES = [
  'Unlimited ATS Resume Scans',
  'Unlimited JD Skill Matching',
  'Full Company Question Bank (40+ Recruiters)',
  'Unlimited Mock Tests & Assessments',
  'Resume Builder — Unlimited PDF Exports',
];

const FREE_FEATURES = [
  '1 Free ATS Resume Scan (trial)',
  '1 Free JD Skill Match (trial)',
  '1 Free Mock Test (trial)',
  'Resume Builder (unlimited)',
];

export default function PricingPage() {
  const { ref, controls } = useScrollReveal(0.1);
  const { user, isAuthenticated, login } = useAuth();
  const { hasPro, subscription, loading: accessLoading, refresh } = useAccess();
  const [showPaywall, setShowPaywall] = useState(false);

  const handleUpgradeClick = () => {
    if (!isAuthenticated) { login(); return; }
    setShowPaywall(true);
  };

  return (
    <div style={{ background: '#D7F27A' }} className="min-h-screen">
      <SEO
        title="Pricing"
        description="Kampus Ace offers a free trial for ATS, JD Matching and Mock Tests. Upgrade to Pro for just ₹49/month for unlimited access. Doubt sessions are ₹20/session."
        path="/pricing"
        keywords="Kampus Ace pricing, Pro plan ₹49, ATS checker pricing, mock test pricing, doubt session booking"
      />

      <SectionWrapper className="pt-32 pb-20">
        {/* Header */}
        <motion.div
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-3xl mx-auto mb-16 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-mono text-xs font-bold border shadow-sm"
            style={{ background: '#F6E9D2', color: '#0FA34E', borderColor: 'rgba(15, 163, 78, 0.3)' }}>
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>SIMPLE, TRANSPARENT PRICING</span>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl font-extrabold text-[#0FA34E] tracking-tight">
            Start Free. Go Unlimited.
          </h1>

          <p className="text-sm sm:text-base font-medium text-[#0B7C3C] max-w-xl mx-auto leading-relaxed">
            Every tool gives you a free trial. When you're ready to go all-in, Pro is just <strong>₹49/month</strong> — less than a cup of chai.
          </p>

          {hasPro && subscription && (
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-mono text-xs font-bold"
              style={{ background: '#0FA34E', color: '#D7F27A' }}>
              <Crown className="w-3.5 h-3.5" />
              Pro Active — expires {new Date(subscription.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          )}
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          ref={ref}
          variants={staggerContainerVariants}
          initial="hidden"
          animate={controls}
          className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          {/* Free Tier */}
          <motion.div variants={fadeUpVariants} className="relative">
            <div className="h-full flex flex-col justify-between p-8 rounded-3xl border-2 shadow-lg"
              style={{ background: '#F6E9D2', borderColor: 'rgba(15,163,78,0.2)' }}>
              <div>
                <div className="mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-[#D7F27A] flex items-center justify-center mb-3">
                    <Star className="w-5 h-5 text-[#0FA34E]" />
                  </div>
                  <h3 className="font-display font-extrabold text-xl text-[#0FA34E] mb-1">Free Tier</h3>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="font-display text-4xl font-black text-[#0FA34E]">₹0</span>
                  </div>
                  <p className="text-xs text-[#0B7C3C] font-medium leading-relaxed">
                    Try every AI tool once — no credit card required.
                  </p>
                </div>
                <ul className="space-y-3 mb-8">
                  {FREE_FEATURES.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5 text-xs font-semibold text-[#0B7C3C]">
                      <div className="w-4 h-4 rounded-full bg-[#D7F27A] border border-[#0FA34E]/30 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 text-[#0FA34E]" />
                      </div>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                to="/dashboard"
                className="w-full py-3.5 rounded-full font-display font-extrabold text-xs text-center flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                style={{ background: '#D7F27A', color: '#0FA34E', border: '2px solid rgba(15,163,78,0.3)' }}
              >
                Start Free <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>

          {/* Pro Plan */}
          <motion.div variants={fadeUpVariants} className="relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
              <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full text-xs font-mono font-black uppercase tracking-wider bg-[#0FA34E] text-[#C6FF3D] shadow-lg border border-[#C6FF3D]">
                <Sparkles className="w-3.5 h-3.5" /> Most Popular
              </span>
            </div>
            <div className="h-full flex flex-col justify-between p-8 rounded-3xl border-2 shadow-2xl ring-4 ring-[#0FA34E]/20"
              style={{ background: '#F6E9D2', borderColor: '#0FA34E' }}>
              <div>
                <div className="mb-6">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-3"
                    style={{ background: 'linear-gradient(135deg, #0FA34E 0%, #0B7C3C 100%)' }}>
                    <Crown className="w-5 h-5 text-[#D7F27A]" />
                  </div>
                  <h3 className="font-display font-extrabold text-xl text-[#0FA34E] mb-1">Pro Plan</h3>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="font-display text-4xl sm:text-5xl font-black text-[#0FA34E]">₹49</span>
                    <span className="text-xs font-mono font-bold text-[#0B7C3C]">/month</span>
                  </div>
                  <p className="text-xs text-[#0B7C3C] font-medium leading-relaxed">
                    Unlimited access to every AI-powered tool for 30 days.
                  </p>
                </div>
                <ul className="space-y-3 mb-8">
                  {PRO_FEATURES.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5 text-xs font-semibold text-[#0B7C3C]">
                      <div className="w-4 h-4 rounded-full bg-[#0FA34E] flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 text-[#D7F27A]" />
                      </div>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {hasPro ? (
                <div className="w-full py-3.5 rounded-full font-display font-extrabold text-xs text-center flex items-center justify-center gap-2"
                  style={{ background: '#0FA34E', color: '#fff' }}>
                  <Crown className="w-4 h-4 text-[#D7F27A]" /> Pro Active ✓
                </div>
              ) : (
                <button
                  onClick={handleUpgradeClick}
                  disabled={accessLoading}
                  className="w-full py-3.5 rounded-full font-display font-extrabold text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #0FA34E 0%, #0B7C3C 100%)', color: '#fff' }}
                >
                  <Zap className="w-4 h-4 text-[#D7F27A]" />
                  Upgrade — Pay ₹49 via UPI
                </button>
              )}
              <p className="text-center text-[10px] text-[#0B7C3C] font-medium mt-2">
                Secure payment via Razorpay · UPI, Cards, Net Banking
              </p>
            </div>
          </motion.div>

          {/* Doubt Session */}
          <motion.div variants={fadeUpVariants} className="relative">
            <div className="h-full flex flex-col justify-between p-8 rounded-3xl border-2 shadow-lg"
              style={{ background: '#F6E9D2', borderColor: 'rgba(15,163,78,0.2)' }}>
              <div>
                <div className="mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-[#D7F27A] flex items-center justify-center mb-3">
                    <Lock className="w-5 h-5 text-[#0FA34E]" />
                  </div>
                  <h3 className="font-display font-extrabold text-xl text-[#0FA34E] mb-1">Doubt Session</h3>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="font-display text-4xl sm:text-5xl font-black text-[#0FA34E]">₹20</span>
                    <span className="text-xs font-mono font-bold text-[#0B7C3C]">/session</span>
                  </div>
                  <p className="text-xs text-[#0B7C3C] font-medium leading-relaxed">
                    Live 1-on-1 doubt resolution with placed KIIT alumni on Google Meet.
                  </p>
                </div>
                <ul className="space-y-3 mb-8">
                  {[
                    'Live Google Meet Doubt Clinics',
                    'Direct Q&A from Placed Alumni',
                    'Resume Review & HR Grill Sessions',
                    'Company-Specific Interview Prep',
                    'Pay only per session — no subscription',
                  ].map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5 text-xs font-semibold text-[#0B7C3C]">
                      <div className="w-4 h-4 rounded-full bg-[#D7F27A] border border-[#0FA34E]/30 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 text-[#0FA34E]" />
                      </div>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                to="/doubt-sessions"
                className="w-full py-3.5 rounded-full font-display font-extrabold text-xs text-center flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                style={{ background: '#D7F27A', color: '#0FA34E', border: '2px solid rgba(15,163,78,0.3)' }}
              >
                Browse Sessions <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </motion.div>

        {/* FAQ / trust strip */}
        <motion.div
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          className="mt-16 max-w-2xl mx-auto text-center space-y-3"
        >
          <p className="text-xs font-semibold text-[#0B7C3C]">
            🔒 All payments are 100% secure via <strong>Razorpay</strong> — supports UPI, Cards, Net Banking & Wallets.
          </p>
          <p className="text-xs text-[#0B7C3C] font-medium">
            Pro plan is valid for 30 days from purchase. No auto-renewal — you renew when ready.
          </p>
        </motion.div>
      </SectionWrapper>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        mode="subscription"
        user={user}
        onSuccess={() => { setShowPaywall(false); refresh(); }}
      />
    </div>
  );
}

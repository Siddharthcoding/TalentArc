import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ArrowRight, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import SectionWrapper from '@/components/ui/SectionWrapper';
import { useScrollReveal, staggerContainerVariants, fadeUpVariants } from '@/hooks/useScrollReveal';
import SEO from '@/components/SEO';

const TIERS = [
  {
    name: 'KIIT Student Free',
    price: '₹0',
    description: '100% free for all registered KIIT University students.',
    features: [
      'Unlimited ATS Resume Scans',
      'Full Company Bank Access (40+ Recruiters)',
      'Job Description Matcher with Fit Scores',
      'Single-Page ATS Resume Builder & PDF Export',
      'Mock Technical & Aptitude Quizzes'
    ],
    cta: 'Start Free Prep',
    popular: true,
    badge: '100% Free for KIITians'
  },
  {
    name: 'Campus Pro Cohort',
    price: '₹0',
    badge: 'Placement Season Pass',
    description: 'Accelerated prep for Day 1 Dream companies (₹15+ LPA CTC).',
    features: [
      'Everything in Free',
      'Proctored Fullscreen Mock Assessments',
      'Verified SQL Schema Transcripts',
      'HighRadius & Microsoft Round Transcripts',
      'Priority Doubt Session Queue'
    ],
    cta: 'Launch Mock Test',
    popular: false,
  },
  {
    name: 'Alumni 1-on-1 Pass',
    price: 'Free',
    badge: 'Live Mentorship',
    description: 'Direct pooled doubt resolution with placed alumni.',
    features: [
      'Everything in Campus Pro',
      'Live Google Meet Doubt Clinics',
      'Direct Question Answering from Placed Seniors',
      'Resume Review & HR Grill Sessions',
      'Automated Google Meet Calendar Invites'
    ],
    cta: 'Book Doubt Slot',
    popular: false,
  }
];

export default function PricingPage() {
  const { ref, controls } = useScrollReveal(0.1);

  return (
    <div style={{ background: '#D7F27A' }} className="min-h-screen">
      <SEO
        title="Pricing"
        description="Kampus Ace is 100% free for all KIIT students. All placement tools — ATS checker, company Q&A banks, AI mock tests, and live mentor doubt sessions — at zero cost."
        path="/pricing"
        keywords="Kampus Ace pricing, free KIIT placement tools, free ATS checker, free mock tests KIIT"
      />
      <SectionWrapper className="pt-32 pb-16">
        <motion.div
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-3xl mx-auto mb-16 space-y-3"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-mono text-xs font-bold border shadow-sm"
            style={{ background: '#F6E9D2', color: '#0FA34E', borderColor: 'rgba(15, 163, 78, 0.3)' }}>
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>COMMUNITY-DRIVEN PLACEMENT PREP</span>
          </div>
          
          <h1 className="font-display text-4xl sm:text-6xl font-extrabold text-[#0FA34E] tracking-tight">
            100% Free for KIITians
          </h1>
          
          <p className="text-sm sm:text-base font-medium text-[#0B7C3C] max-w-2xl mx-auto">
            Kampus Ace is built by KIIT alumni for current students. Every question bank, ATS scan, and mock test is completely open.
          </p>
        </motion.div>

        <motion.div
          ref={ref}
          variants={staggerContainerVariants}
          initial="hidden"
          animate={controls}
          className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          {TIERS.map((tier) => (
            <motion.div key={tier.name} variants={fadeUpVariants} className="relative">
              {tier.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                  <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full text-xs font-mono font-black uppercase tracking-wider bg-[#0FA34E] text-[#C6FF3D] shadow-lg border border-[#C6FF3D]">
                    <Sparkles className="w-3.5 h-3.5" />
                    {tier.badge}
                  </span>
                </div>
              )}
              <div
                className={`h-full flex flex-col justify-between p-8 rounded-3xl border-2 shadow-lg transition-all ${
                  tier.popular ? 'border-[#0FA34E] bg-[#F6E9D2] ring-4 ring-[#0FA34E]/20' : 'border-[#0FA34E]/20 bg-[#F6E9D2]'
                }`}
              >
                <div>
                  <div className="mb-6">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <h3 className="font-display font-extrabold text-xl text-[#0FA34E]">{tier.name}</h3>
                      {tier.badge && !tier.popular && (
                        <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#D7F27A] text-[#0FA34E] border border-[#0FA34E]/20">
                          {tier.badge}
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="font-display text-4xl sm:text-5xl font-black text-[#0FA34E]">{tier.price}</span>
                    </div>
                    <p className="text-xs text-[#0B7C3C] font-medium leading-relaxed">{tier.description}</p>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5 text-xs sm:text-sm font-semibold text-[#0B7C3C]">
                        <div className="w-4 h-4 rounded-full bg-[#0FA34E] text-[#C6FF3D] flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3" />
                        </div>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  to="/dashboard"
                  className="w-full py-3.5 rounded-full font-display font-extrabold text-xs sm:text-sm text-center shadow-md transition-all flex items-center justify-center gap-2"
                  style={{
                    background: tier.popular ? '#0FA34E' : '#D7F27A',
                    color: tier.popular ? '#F6E9D2' : '#0FA34E',
                    border: '2px solid rgba(15, 163, 78, 0.3)'
                  }}
                >
                  <span>{tier.cta}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </SectionWrapper>
    </div>
  );
}

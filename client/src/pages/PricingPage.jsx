import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ArrowRight, Sparkles } from 'lucide-react';
import AnimatedButton from '@/components/ui/AnimatedButton';
import GlassCard from '@/components/ui/GlassCard';
import SectionWrapper from '@/components/ui/SectionWrapper';
import { useScrollReveal, staggerContainerVariants, fadeUpVariants } from '@/hooks/useScrollReveal';

const tiers = [
  {
    name: 'Free',
    price: '$0',
    description: 'Get started with a single analysis.',
    features: ['1 Resume Analysis', 'Basic ATS Score', 'General Feedback', 'PDF & DOCX Support'],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$12',
    period: '/month',
    description: 'For serious job seekers who want to optimize every application.',
    features: [
      'Unlimited Analyses',
      'Detailed ATS Breakdown',
      'LLM-Powered Feedback',
      'Priority Support',
      'Export Reports',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: '$29',
    period: '/month',
    description: 'For career coaches and teams managing multiple resumes.',
    features: [
      'Everything in Pro',
      'Batch Analysis (Up to 10)',
      'Team Dashboard',
      'API Access',
      'Custom Branding',
      'Dedicated Account Manager',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

export default function PricingPage() {
  const { ref, controls } = useScrollReveal(0.1);

  return (
    <SectionWrapper className="pt-28 min-h-screen">
      <motion.div
        variants={fadeUpVariants}
        initial="hidden"
        animate="visible"
        className="text-center max-w-3xl mx-auto mb-16"
      >
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Simple, Transparent{' '}
          <span className="gradient-text">Pricing</span>
        </h1>
        <p className="text-lg text-zinc-500 dark:text-zinc-400">
          Start free, upgrade when you need more power.
        </p>
      </motion.div>

      <motion.div
        ref={ref}
        variants={staggerContainerVariants}
        initial="hidden"
        animate={controls}
        className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
      >
        {tiers.map((tier) => (
          <motion.div key={tier.name} variants={fadeUpVariants} className="relative">
            {tier.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg">
                  <Sparkles className="w-3 h-3" />
                  Most Popular
                </span>
              </div>
            )}
            <GlassCard
              className={`h-full flex flex-col ${tier.popular ? 'ring-2 ring-indigo-500/50 shadow-xl shadow-indigo-500/10' : ''}`}
            >
              <div className="mb-6">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">{tier.name}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-extrabold text-zinc-900 dark:text-white">{tier.price}</span>
                  {tier.period && (
                    <span className="text-sm text-zinc-400 dark:text-zinc-500">{tier.period}</span>
                  )}
                </div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{tier.description}</p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {tier.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-3 text-sm text-zinc-600 dark:text-zinc-300">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    {feat}
                  </li>
                ))}
              </ul>

              <Link to={tier.popular ? '/dashboard' : '#'}>
                <AnimatedButton
                  variant={tier.popular ? 'primary' : 'secondary'}
                  className="w-full"
                >
                  {tier.cta}
                  <ArrowRight className="w-4 h-4" />
                </AnimatedButton>
              </Link>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>
    </SectionWrapper>
  );
}

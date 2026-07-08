import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileSearch, Crosshair, ArrowRight, Shield, Sparkles } from 'lucide-react';
import { cn } from '@/utils/cn';
import GlassCard from '@/components/ui/GlassCard';

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const cards = [
  {
    to: '/dashboard',
    icon: FileSearch,
    title: 'Optimize Your ATS Score',
    description:
      'Upload your resume and get a comprehensive ATS compatibility analysis across 9 scoring dimensions with instant, actionable feedback.',
    cta: 'Check Your Score',
    gradient: 'from-indigo-500 to-blue-500',
  },
  {
    to: '/jd-matcher',
    icon: Crosshair,
    title: 'Match to a Specific Job',
    description:
      'Paste a job description and we\'ll semantically match your resume against every requirement, revealing exactly where you stand.',
    cta: 'Start Matching',
    gradient: 'from-violet-500 to-purple-500',
  },
];

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
      <div className="absolute inset-0 bg-grid pointer-events-none" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-violet-400/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/[0.03] rounded-full blur-3xl" />

      <motion.div
        className="section-container relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50">
            <Sparkles className="w-3.5 h-3.5" />
            Your Complete Career Optimization Ecosystem
          </span>
        </motion.div>

        <motion.div variants={itemVariants} className="text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight max-w-5xl mx-auto">
            <span className="text-zinc-900 dark:text-white">Land More Interviews with </span>
            <span className="gradient-text">AI-Powered Precision</span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-zinc-500 dark:text-zinc-400 max-w-3xl mx-auto leading-relaxed">
            Whether you need a full ATS audit or want to tailor your resume for a specific role,
            TalentArc gives you the intelligence to beat the system.
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="mt-12 grid md:grid-cols-2 gap-6 max-w-4xl mx-auto"
        >
          {cards.map((card) => (
            <Link key={card.to} to={card.to} className="group block">
              <GlassCard className="relative h-full overflow-hidden">
                <div className={cn(
                  'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500',
                  `bg-gradient-to-br ${card.gradient}/[0.03]`
                )} />
                <div className="relative z-10">
                  <div className={cn(
                    'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center mb-5',
                    'group-hover:scale-110 transition-transform duration-300',
                    card.gradient,
                    'text-white shadow-lg'
                  )}>
                    <card.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-400 group-hover:to-violet-400 transition-all duration-300">
                    {card.title}
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-6">
                    {card.description}
                  </p>
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 group-hover:gap-3 transition-all duration-300">
                    {card.cta}
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </GlassCard>
            </Link>
          ))}
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="mt-12 flex items-center justify-center gap-6 text-sm text-zinc-400 dark:text-zinc-500"
        >
          <span className="flex items-center gap-1.5">
            <FileSearch className="w-4 h-4" />
            ATS Scoring
          </span>
          <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-600" />
          <span className="flex items-center gap-1.5">
            <Crosshair className="w-4 h-4" />
            JD Matching
          </span>
          <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-600" />
          <span className="flex items-center gap-1.5">
            <Shield className="w-4 h-4" />
            Trusted by 500+ Companies
          </span>
        </motion.div>
      </motion.div>
    </section>
  );
}
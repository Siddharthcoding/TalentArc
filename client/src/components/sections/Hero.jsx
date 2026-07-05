import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, FileText, Shield } from 'lucide-react';
import AnimatedButton from '@/components/ui/AnimatedButton';

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
      <div className="absolute inset-0 bg-grid pointer-events-none" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-violet-400/10 rounded-full blur-3xl" />

      <motion.div
        className="section-container relative z-10 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50">
            <Shield className="w-3.5 h-3.5" />
            Intelligent ATS Resume Analysis
          </span>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight max-w-5xl mx-auto"
        >
          <span className="text-zinc-900 dark:text-white">Transform Your Resume into a </span>
          <span className="gradient-text">Career Catalyst</span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="mt-6 text-lg md:text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed"
        >
          AI-powered parsing and ATS scoring that gives you a competitive edge. 
          Upload your resume, get instant feedback, and land more interviews.
        </motion.p>

        <motion.div variants={itemVariants} className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/dashboard">
            <AnimatedButton variant="primary" icon={ArrowRight}>
              Analyze Your Resume for Free
            </AnimatedButton>
          </Link>
          <Link to="/features">
            <AnimatedButton variant="secondary">
              See How It Works
            </AnimatedButton>
          </Link>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="mt-12 flex items-center justify-center gap-6 text-sm text-zinc-400 dark:text-zinc-500"
        >
          <span className="flex items-center gap-1.5">
            <FileText className="w-4 h-4" />
            PDF
          </span>
          <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-600" />
          <span className="flex items-center gap-1.5">
            <FileText className="w-4 h-4" />
            DOCX
          </span>
          <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-600" />
          <span className="flex items-center gap-1.5">
            <Shield className="w-4 h-4" />
            500+ Companies
          </span>
        </motion.div>
      </motion.div>
    </section>
  );
}

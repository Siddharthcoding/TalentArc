import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import AnimatedButton from '@/components/ui/AnimatedButton';
import SectionWrapper from '@/components/ui/SectionWrapper';
import Features from '@/components/sections/Features';
import TechBlueprint from '@/components/sections/TechBlueprint';
import { fadeUpVariants } from '@/hooks/useScrollReveal';

export default function FeaturesPage() {
  return (
    <>
      <SectionWrapper className="pt-28 pb-0">
        <motion.div
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-3xl mx-auto"
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Powerful Features for{' '}
            <span className="gradient-text">Resume Optimization</span>
          </h1>
          <p className="text-lg text-zinc-500 dark:text-zinc-400">
            Everything you need to craft a resume that passes any ATS system.
          </p>
        </motion.div>
      </SectionWrapper>
      <Features />
      <TechBlueprint />
      <SectionWrapper>
        <motion.div
          variants={fadeUpVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center"
        >
          <Link to="/dashboard">
            <AnimatedButton variant="primary" icon={ArrowRight}>
              Start Analyzing Your Resume
            </AnimatedButton>
          </Link>
        </motion.div>
      </SectionWrapper>
    </>
  );
}

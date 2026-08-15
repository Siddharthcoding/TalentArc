import { motion } from 'framer-motion';
import {
  FileCheck,
  Building2,
  Target,
  Users,
  Award,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useScrollReveal, fadeUpVariants } from '@/hooks/useScrollReveal';

const PIPELINE_STAGES = [
  {
    stage: 'Stage 01',
    icon: FileCheck,
    title: 'ATS Audit & Resume Polish',
    subtitle: 'Score ≥ 85 on KIIT ATS Format',
    description: 'Run our 9-layer ATS analyzer. Eliminate fatal formatting bugs and inject essential recruiter keywords.',
    highlight: '9-Layer Scan',
    color: '#0FA34E'
  },
  {
    stage: 'Stage 02',
    icon: Building2,
    title: 'Company PYQ & Pattern Drill',
    subtitle: 'HighRadius, Deloitte, Microsoft',
    description: 'Practice exact coding questions, SQL schemas, and aptitude round patterns reported by placed seniors.',
    highlight: '40+ Recruiters',
    color: '#0FA34E'
  },
  {
    stage: 'Stage 03',
    icon: Target,
    title: 'Proctored Mock Simulation',
    subtitle: 'Strict Anti-Cheat Fullscreen',
    description: 'Take timed topic tests with proctoring. Exiting fullscreen twice triggers automatic termination and score report.',
    highlight: 'Anti-Cheat Proctored',
    color: '#E8A33D'
  },
  {
    stage: 'Stage 04',
    icon: Users,
    title: 'Alumni Doubt Resolution',
    subtitle: 'Google Meet Live Clinics',
    description: 'Book 1-on-1 and pooled slots with placed KIIT alumni. Discuss tricky OA problems and technical interview rounds.',
    highlight: 'Live Mentorship',
    color: '#0FA34E'
  },
  {
    stage: 'Stage 05',
    icon: Award,
    title: 'Drive Day & Offer Letter',
    subtitle: 'Placement Season Victory',
    description: 'Enter the campus drive with complete confidence, verified interview transcripts, and proven readiness.',
    highlight: 'Dream Offer ₹18+ LPA',
    color: '#0B7C3C'
  }
];

export default function TechBlueprint() {
  const { ref, controls } = useScrollReveal(0.1);

  return (
    <section className="section-padding relative overflow-hidden select-none" style={{ background: '#0B7C3C' }}>
      {/* Odisha Rangoli background motif */}
      <div className="absolute inset-0 opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #C6FF3D 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px'
        }}
      />

      <div className="section-container relative z-10 space-y-12">
        
        {/* Header */}
        <motion.div
          ref={ref}
          variants={fadeUpVariants}
          initial="hidden"
          animate={controls}
          className="text-center max-w-3xl mx-auto space-y-3"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-mono text-xs font-black uppercase tracking-wider shadow-sm"
            style={{ background: '#C6FF3D', color: '#0FA34E' }}>
            <Sparkles className="w-3.5 h-3.5" />
            <span>THE KIIT PLACEMENT BATTLE PIPELINE</span>
          </div>

          <h2 className="font-display text-4xl sm:text-6xl font-extrabold tracking-tight text-[#F6E9D2]">
            From Prep to <span className="text-[#C6FF3D]">Offer Letter</span>
          </h2>

          <p className="text-sm sm:text-base font-medium max-w-2xl mx-auto leading-relaxed text-[#F6E9D2]/90">
            A proven 5-stage placement battle roadmap engineered with insights from over 1,200+ placed KIIT graduates.
          </p>
        </motion.div>

        {/* 5-Stage Roadmap Pipeline */}
        <div className="relative">
          {/* Connector Line (Desktop) */}
          <div
            className="hidden lg:block absolute top-1/2 left-6 right-6 h-1 -translate-y-12 rounded-full"
            style={{ background: 'linear-gradient(90deg, #0FA34E, #C6FF3D 50%, #D7F27A)' }}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 relative z-10">
            {PIPELINE_STAGES.map((stage, idx) => {
              const Icon = stage.icon;
              return (
                <motion.div
                  key={stage.stage}
                  variants={fadeUpVariants}
                  initial="hidden"
                  animate={controls}
                  transition={{ delay: idx * 0.12 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="p-6 rounded-3xl border-2 flex flex-col justify-between shadow-xl transition-all relative overflow-hidden group"
                  style={{
                    background: '#F6E9D2',
                    borderColor: idx === 4 ? '#C6FF3D' : 'rgba(15, 163, 78, 0.25)'
                  }}
                >
                  {/* Top glowing bar */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#0FA34E]" />

                  <div className="space-y-4">
                    {/* Stage number & badge */}
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-extrabold px-3 py-1 rounded-full bg-[#0FA34E] text-[#F6E9D2]">
                        {stage.stage}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-[#0FA34E] bg-[#D7F27A] px-2.5 py-0.5 rounded-full border border-[#0FA34E]/20">
                        {stage.highlight}
                      </span>
                    </div>

                    {/* Icon */}
                    <div className="w-14 h-14 rounded-2xl bg-[#0FA34E] text-[#C6FF3D] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      <Icon className="w-7 h-7" />
                    </div>

                    {/* Title */}
                    <div>
                      <h3 className="font-display font-extrabold text-lg text-[#0FA34E] leading-snug">
                        {stage.title}
                      </h3>
                      <p className="text-xs font-bold text-[#0B7C3C] mt-0.5">
                        {stage.subtitle}
                      </p>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-[#0B7C3C] font-medium leading-relaxed">
                      {stage.description}
                    </p>
                  </div>

                  {/* Bottom check */}
                  <div className="pt-4 mt-4 border-t border-[#0FA34E]/15 flex items-center justify-between text-[11px] font-mono font-bold text-[#0FA34E]">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#0FA34E]" />
                      <span>Verified Step</span>
                    </div>
                    <span>0{idx + 1}/05</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}

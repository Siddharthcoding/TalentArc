import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, FileCheck } from 'lucide-react';
import { useScrollReveal, fadeUpVariants } from '@/hooks/useScrollReveal';

export default function CtaSection() {
  const { ref, controls } = useScrollReveal(0.2);

  return (
    <section className="section-padding" style={{ background: '#D7F27A' }}>
      <div className="section-container">
        <motion.div
          ref={ref}
          variants={fadeUpVariants}
          initial="hidden"
          animate={controls}
          className="relative overflow-hidden rounded-[2.5rem] px-8 py-16 text-center md:py-20"
          style={{ background: '#0B7C3C', border: '2px solid rgba(198,255,61,0.3)' }}
        >
          {/* Rangoli dot overlay */}
          <div className="absolute inset-0 opacity-[0.07] pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle, #C6FF3D 1.5px, transparent 1.5px)', backgroundSize: '26px 26px' }} />

          {/* Konark wheel watermark */}
          <div className="absolute -right-16 -bottom-16 opacity-10 pointer-events-none">
            <svg width="300" height="300" viewBox="0 0 200 200" fill="none">
              <circle cx="100" cy="100" r="92" stroke="#C6FF3D" strokeWidth="6" strokeDasharray="12 6" />
              <circle cx="100" cy="100" r="82" stroke="#C6FF3D" strokeWidth="4" />
              <circle cx="100" cy="100" r="30" stroke="#C6FF3D" strokeWidth="5" />
              {Array.from({ length: 24 }).map((_, i) => (
                <g key={i} transform={`rotate(${(i * 360) / 24} 100 100)`}>
                  <line x1="100" y1="30" x2="100" y2="70" stroke="#C6FF3D" strokeWidth={i % 3 === 0 ? '4' : '2'} />
                </g>
              ))}
            </svg>
          </div>

          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="flex justify-center mb-6">
              <span
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.22em]"
                style={{ background: 'rgba(198,255,61,0.15)', color: '#D7F27A', border: '1px solid rgba(198,255,61,0.3)' }}
              >
                ★ KIIT Placement Season 2026-27
              </span>
            </div>

            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-5"
              style={{ fontFamily: '"Baloo 2", cursive', color: '#F6E9D2' }}>
              Ready to Ace{' '}
              <span style={{ color: '#D7F27A' }}>Your Placement?</span>
            </h2>
            <p className="text-base font-medium max-w-lg mx-auto mb-8" style={{ color: 'rgba(246,233,210,0.75)' }}>
              Join 1,200+ KIIT students using Kampus Ace to get ATS scores, company-specific prep, and verified recruiter insights.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full font-extrabold text-base transition-all hover:opacity-90 shadow-xl hover:-translate-y-0.5"
                style={{ background: '#D7F27A', color: '#0B7C3C', fontFamily: '"Baloo 2", cursive' }}
              >
                <FileCheck className="w-5 h-5" />
                Check Your ATS Score Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/company-bank"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full font-bold text-sm transition-all hover:opacity-80"
                style={{ background: 'rgba(246,233,210,0.1)', color: '#F6E9D2', border: '1.5px solid rgba(246,233,210,0.3)' }}
              >
                Browse Company Bank →
              </Link>
            </div>
            <p className="mt-4 text-xs" style={{ color: 'rgba(246,233,210,0.45)' }}>
              No credit card required &middot; Free ATS analysis &middot; Powered by KIIT alumni data
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

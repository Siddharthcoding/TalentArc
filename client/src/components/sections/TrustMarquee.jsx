import { motion } from 'framer-motion';

const KIIT_COMPANIES = [
  'HighRadius', 'Microsoft', 'Deloitte', 'Zscaler', 'Amazon',
  'PwC India', 'Accenture', 'Infosys', 'TCS', 'Wipro',
  'Capgemini', 'IBM', 'Goldman Sachs', 'Oracle', 'SAP Labs',
  'Cognizant', 'Tech Mahindra', 'HCL Technologies', 'L&T Infotech', 'Mindtree',
];

export default function TrustMarquee() {
  return (
    <section className="relative overflow-hidden py-10 sm:py-12 my-6 select-none" style={{ borderTop: '1.5px solid rgba(15,163,78,0.2)', borderBottom: '1.5px solid rgba(15,163,78,0.2)', background: 'rgba(11,124,60,0.04)' }}>
      {/* Fade edges */}
      <div className="absolute inset-y-0 left-0 w-24 z-10 pointer-events-none" style={{ background: 'linear-gradient(to right, #D7F27A, transparent)' }} />
      <div className="absolute inset-y-0 right-0 w-24 z-10 pointer-events-none" style={{ background: 'linear-gradient(to left, #D7F27A, transparent)' }} />

      <p className="text-center font-mono text-[10.5px] font-bold tracking-[0.3em] uppercase mb-6" style={{ color: '#0B7C3C88' }}>
        KIIT Alumni placed at these companies — every question bank verified
      </p>


      <div className="relative overflow-hidden">
        <div
          className="flex gap-3 w-max"
          style={{ animation: 'marquee 32s linear infinite' }}
        >
          {[...KIIT_COMPANIES, ...KIIT_COMPANIES].map((name, i) => (
            <motion.span
              key={`${name}-${i}`}
              whileHover={{ y: -3, scale: 1.04 }}
              className="whitespace-nowrap font-bold text-xs px-4 py-2 rounded-full shadow-sm cursor-default transition-all"
              style={{
                background: '#F6E9D2',
                color: '#0FA34E',
                border: '1.5px solid rgba(15,163,78,0.25)',
                fontFamily: '"Baloo 2", cursive',
              }}
            >
              {name}
            </motion.span>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}

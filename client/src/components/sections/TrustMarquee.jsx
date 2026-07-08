import { cn } from '@/utils/cn';

const companies = [
  'Google', 'Stripe', 'Linear', 'Notion', 'Vercel',
  'Figma', 'Netflix', 'Spotify', 'Airbnb', 'Shopify',
  'Discord', 'Loom',
];

export default function TrustMarquee() {
  return (
    <section className="py-12 border-y border-zinc-100 dark:border-zinc-800/50 overflow-hidden bg-zinc-50/30 dark:bg-zinc-900/20">
      <div className="section-container mb-6">
        <p className="text-center text-xs font-medium tracking-widest uppercase text-zinc-400 dark:text-zinc-500">
          Trusted by candidates from leading companies
        </p>
      </div>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-zinc-50/30 dark:from-zinc-900/20 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-zinc-50/30 dark:from-zinc-900/20 to-transparent z-10 pointer-events-none" />

        <div className="marquee-content flex gap-16 items-center w-max hover:[animation-play-state:paused] cursor-default">
          {[...companies, ...companies].map((name, i) => (
            <span
              key={`${name}-${i}`}
              className="text-base font-semibold text-zinc-300 dark:text-zinc-700 whitespace-nowrap tracking-tight select-none"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
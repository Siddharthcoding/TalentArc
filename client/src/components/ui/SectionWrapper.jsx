import { cn } from '@/utils/cn';

export default function SectionWrapper({ children, id, className, ...props }) {
  return (
    <section id={id} className={cn('section-padding', className)} {...props}>
      <div className="section-container">{children}</div>
    </section>
  );
}

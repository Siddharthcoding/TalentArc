import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

export default function GlassCard({ children, className, hover = true, ...props }) {
  return (
    <motion.div
      whileHover={hover ? { y: -6, scale: 1.01 } : undefined}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className={cn(
        'glass-card p-6 md:p-8 transition-shadow duration-300',
        hover && [
          'hover:shadow-2xl hover:shadow-fuchsia-500/[0.08] dark:hover:shadow-cyan-500/[0.12]',
          'hover:border-cyan-200/70 dark:hover:border-cyan-300/20',
        ],
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

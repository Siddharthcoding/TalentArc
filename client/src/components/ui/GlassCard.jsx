import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

export default function GlassCard({ children, className, hover = true, ...props }) {
  return (
    <motion.div
      className={cn(
        'glass-card p-6 md:p-8 transition-all duration-300',
        hover && [
          'hover:shadow-xl hover:shadow-indigo-500/[0.04] dark:hover:shadow-indigo-500/[0.08]',
          'hover:border-indigo-300/40 dark:hover:border-indigo-500/25',
          'hover:-translate-y-0.5',
        ],
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

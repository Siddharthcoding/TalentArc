import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

const AnimatedButton = forwardRef(function AnimatedButton(
  { children, variant = 'primary', size = 'md', className, icon: Icon, ...props },
  ref
) {
  const base =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900';

  const variants = {
    primary:
      'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md hover:shadow-lg hover:shadow-indigo-500/30 active:shadow-sm dark:from-indigo-500 dark:to-violet-500 dark:hover:shadow-indigo-500/20',
    secondary:
      'glass text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/80 border border-zinc-200/50 dark:border-zinc-700/50',
    ghost:
      'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/60',
  };

  const sizes = {
    sm: 'px-3.5 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-sm',
    xl: 'px-8 py-3.5 text-base',
  };

  return (
    <motion.button
      ref={ref}
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.97 }}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {Icon && (
        <Icon className={cn('w-4 h-4', size === 'sm' && 'w-3.5 h-3.5', size === 'xl' && 'w-5 h-5')} />
      )}
      {children}
    </motion.button>
  );
});

export default AnimatedButton;

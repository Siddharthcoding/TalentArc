import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

const AnimatedButton = forwardRef(function AnimatedButton(
  { children, variant = 'primary', size = 'md', className, icon: Icon, ...props },
  ref
) {
  const base =
    'group relative inline-flex items-center justify-center gap-2 overflow-hidden font-semibold rounded-2xl transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950';

  const variants = {
    primary:
      'bg-[length:220%_220%] bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-amber-400 text-white shadow-lg shadow-fuchsia-500/20 hover:shadow-xl hover:shadow-cyan-500/25 animate-shine',
    secondary:
      'glass text-zinc-800 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white hover:bg-white/80 dark:hover:bg-white/10 border border-white/70 dark:border-white/10',
    ghost:
      'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-white/60 dark:hover:bg-white/10',
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
      {variant === 'primary' && (
        <span className="absolute inset-0 translate-x-[-120%] bg-gradient-to-r from-transparent via-white/35 to-transparent transition-transform duration-700 group-hover:translate-x-[120%]" />
      )}
      {Icon && (
        <Icon className={cn('relative w-4 h-4', size === 'sm' && 'w-3.5 h-3.5', size === 'xl' && 'w-5 h-5')} />
      )}
      <span className="relative inline-flex items-center gap-2">{children}</span>
    </motion.button>
  );
});

export default AnimatedButton;

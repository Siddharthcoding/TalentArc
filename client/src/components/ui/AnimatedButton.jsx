import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

const AnimatedButton = forwardRef(function AnimatedButton(
  { children, variant = 'primary', size = 'md', className, icon: Icon, ...props },
  ref
) {
  const base =
    'group relative inline-flex items-center justify-center gap-2 overflow-hidden font-display font-extrabold rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0FA34E]';

  const variants = {
    primary:
      'bg-[#0FA34E] text-[#D7F27A] shadow-md hover:bg-[#0B7C3C] border-2 border-[#C6FF3D]/40',
    secondary:
      'bg-[#F6E9D2] text-[#0FA34E] hover:bg-[#DFF5E6] border-2 border-[#0FA34E]',
    ghost:
      'text-[#0FA34E] hover:bg-[#0FA34E]/10',
  };

  const sizes = {
    sm: 'px-4 py-1.5 text-xs',
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
        <Icon className={cn('relative w-4 h-4', size === 'sm' && 'w-3.5 h-3.5', size === 'xl' && 'w-5 h-5')} />
      )}
      <span className="relative inline-flex items-center gap-2">{children}</span>
    </motion.button>
  );
});

export default AnimatedButton;

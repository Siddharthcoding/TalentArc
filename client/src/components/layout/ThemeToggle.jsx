import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/utils/cn';

export default function ThemeToggle({ className }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'relative p-2 rounded-xl transition-colors',
        'hover:bg-zinc-100 dark:hover:bg-zinc-800',
        'text-zinc-500 dark:text-zinc-400',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
        className
      )}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <div className="relative w-5 h-5">
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={false}
          animate={{ rotate: theme === 'dark' ? 90 : 0, opacity: theme === 'dark' ? 0 : 1 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <Sun className="w-5 h-5" />
        </motion.div>
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={false}
          animate={{ rotate: theme === 'light' ? -90 : 0, opacity: theme === 'light' ? 0 : 1 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <Moon className="w-5 h-5" />
        </motion.div>
      </div>
    </button>
  );
}

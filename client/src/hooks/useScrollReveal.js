import { useRef, useEffect } from 'react';
import { useInView, useAnimation } from 'framer-motion';

export function useScrollReveal(amount = 0.05, once = true) {
  const ref = useRef(null);
  const controls = useAnimation();
  const isInView = useInView(ref, { amount, once });

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [isInView, controls]);

  return { ref, controls, isInView };
}

export const fadeUpVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1]
    }
  },
};

export const staggerContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
};

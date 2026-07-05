import { useRef } from 'react';
import { useInView, useAnimation } from 'framer-motion';
import { useEffect } from 'react';

export function useScrollReveal(threshold = 0.2, once = true) {
  const ref = useRef(null);
  const controls = useAnimation();
  const isInView = useInView(ref, { threshold, once });

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [isInView, controls]);

  return { ref, controls, isInView };
}

export const fadeUpVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

export const staggerContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
  key?: string;
  variant?: 'fade' | 'slide' | 'scale' | 'slideUp';
  duration?: number;
}

const PageTransition: React.FC<PageTransitionProps> = ({ 
  children, 
  key,
  variant = 'fade',
  duration = 0.3
}) => {
  const variants = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 }
    },
    slide: {
      initial: { x: '100%', opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: '-100%', opacity: 0 }
    },
    scale: {
      initial: { scale: 0.8, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      exit: { scale: 0.8, opacity: 0 }
    },
    slideUp: {
      initial: { y: '100%', opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit: { y: '-100%', opacity: 0 }
    }
  };

  const currentVariant = variants[variant];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={key}
        initial={currentVariant.initial}
        animate={currentVariant.animate}
        exit={currentVariant.exit}
        transition={{
          duration,
          ease: 'easeInOut'
        }}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;
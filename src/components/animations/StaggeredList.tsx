import React from 'react';
import { motion } from 'framer-motion';

interface StaggeredListProps {
  children: React.ReactNode[];
  className?: string;
  stagger?: number;
}

const StaggeredList: React.FC<StaggeredListProps> = ({
  children,
  className = '',
  stagger = 0.1
}) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: stagger
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <motion.div
      className={className}
      variants={container}
      initial="hidden"
      animate="show"
    >
      {children.map((child, index) => (
        <motion.div
          key={index}
          variants={item}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default StaggeredList;
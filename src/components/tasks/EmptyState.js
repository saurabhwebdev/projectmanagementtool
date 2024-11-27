import React from 'react';
import { motion } from 'framer-motion';
import { PlusIcon, CheckIcon } from '@heroicons/react/24/outline';

const EmptyState = ({ onCreateClick }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const clipboardVariants = {
    hidden: { scale: 0, rotate: -10 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        duration: 1.5,
        bounce: 0.4
      }
    }
  };

  const paperVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        delay: 0.5,
        type: "spring",
        stiffness: 200,
        damping: 20
      }
    }
  };

  const checkVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: [0, 1, 0],
      transition: {
        delay: 1.5,
        duration: 2,
        repeat: Infinity,
        repeatDelay: 3
      }
    }
  };

  const sparkleVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: [0, 1.2, 0],
      opacity: [0, 1, 0],
      transition: {
        delay: 1.5,
        duration: 2,
        repeat: Infinity,
        repeatDelay: 3
      }
    }
  };

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: 1.8
      }
    }
  };

  return (
    <motion.div
      className="text-center py-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="relative w-48 h-48 mx-auto mb-8">
        {/* Sparkles */}
        <motion.div
          className="absolute -top-4 right-4 text-primary"
          variants={sparkleVariants}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" fill="currentColor"/>
          </svg>
        </motion.div>
        <motion.div
          className="absolute bottom-4 -left-4 text-primary"
          variants={sparkleVariants}
          style={{ transition: { delay: 1.7 } }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" fill="currentColor"/>
          </svg>
        </motion.div>

        {/* Clipboard */}
        <motion.div
          className="relative w-32 h-40 mx-auto"
          variants={clipboardVariants}
        >
          {/* Clipboard Body */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg border-2 border-primary/20">
            {/* Clipboard Top */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-4 bg-primary/20 rounded-t-lg" />
            
            {/* Lines Pattern */}
            <div className="absolute top-8 left-4 right-4 space-y-3">
              <motion.div 
                className="h-2 w-3/4 bg-primary/10 rounded"
                variants={paperVariants}
              />
              <motion.div 
                className="h-2 w-1/2 bg-primary/10 rounded"
                variants={paperVariants}
              />
              <motion.div 
                className="h-2 w-2/3 bg-primary/10 rounded"
                variants={paperVariants}
              />
            </div>

            {/* Animated Check */}
            <motion.div
              className="absolute bottom-4 right-4 text-primary/30"
              variants={checkVariants}
            >
              <CheckIcon className="w-8 h-8" />
            </motion.div>
          </div>
        </motion.div>
      </div>

      <motion.h3
        className="text-xl font-medium text-dark-gray mb-3"
        variants={textVariants}
      >
        No Tasks Yet
      </motion.h3>

      <motion.p
        className="text-dark-gray/70 mb-6"
        variants={textVariants}
      >
        Create your first task to get started
      </motion.p>

      <motion.button
        onClick={onCreateClick}
        className="btn-primary inline-flex items-center space-x-2 px-6 py-3"
        variants={textVariants}
        whileHover={{
          scale: 1.05,
          transition: { duration: 0.2 }
        }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.span
          initial={{ rotate: 0 }}
          animate={{ rotate: 180 }}
          transition={{
            delay: 2.5,
            duration: 0.6,
            repeat: Infinity,
            repeatDelay: 5
          }}
        >
          <PlusIcon className="w-5 h-5" />
        </motion.span>
        <span>Create Task</span>
      </motion.button>
    </motion.div>
  );
};

export default EmptyState;

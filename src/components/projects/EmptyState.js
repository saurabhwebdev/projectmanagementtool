import React from 'react';
import { motion } from 'framer-motion';
import { PlusIcon } from '@heroicons/react/24/outline';

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

  const boxVariants = {
    hidden: { scale: 0, rotate: -20 },
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

  const lidVariants = {
    hidden: { rotateX: 0 },
    visible: {
      rotateX: [-20, 0, -10, 0],
      transition: {
        delay: 1,
        duration: 2,
        times: [0, 0.4, 0.7, 1],
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
          className="absolute top-0 right-0 text-primary"
          variants={sparkleVariants}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" fill="currentColor"/>
          </svg>
        </motion.div>
        <motion.div
          className="absolute bottom-0 left-0 text-primary"
          variants={sparkleVariants}
          style={{ transition: { delay: 1.7 } }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" fill="currentColor"/>
          </svg>
        </motion.div>

        {/* Box */}
        <motion.div
          className="relative w-32 h-32 mx-auto"
          variants={boxVariants}
        >
          {/* Box Lid */}
          <motion.div
            className="absolute -top-4 left-1/2 -translate-x-1/2 w-36 h-4 bg-primary/20 rounded-t-lg origin-bottom"
            variants={lidVariants}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div className="absolute inset-0 bg-primary/10 rounded-t-lg transform -translate-z-2" />
          </motion.div>

          {/* Box Body */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg border-2 border-primary/20">
            {/* Box Front Pattern */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-2 left-2 w-4 h-4 border-2 border-primary rounded-full" />
                <div className="absolute bottom-2 right-2 w-6 h-6 border-2 border-primary rounded-lg" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border-2 border-primary transform rotate-45" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.h3
        className="text-xl font-medium text-dark-gray mb-3"
        variants={textVariants}
      >
        No Projects Yet
      </motion.h3>

      <motion.p
        className="text-dark-gray/70 mb-6"
        variants={textVariants}
      >
        Create your first project to get started
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
        <span>Create Project</span>
      </motion.button>
    </motion.div>
  );
};

export default EmptyState;

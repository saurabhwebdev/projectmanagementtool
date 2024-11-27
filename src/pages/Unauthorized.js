import React from 'react';
import { motion } from 'framer-motion';
import { XCircleIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-light-gray">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full mx-auto p-6"
      >
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <XCircleIcon className="w-16 h-16 text-error mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-dark-gray mb-2">
            Access Denied
          </h1>
          <p className="text-dark-gray/70 mb-6">
            You don't have permission to access this page.
          </p>
          <Link
            to="/"
            className="inline-block px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            Return to Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Unauthorized; 
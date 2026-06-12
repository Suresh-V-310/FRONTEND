import { motion } from 'framer-motion';

/**
 * Loading spinner with optional text
 */
const LoadingSpinner = ({ size = 'md', text = '' }) => {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <motion.div
        className={`${sizes[size]} border-2 border-accent-blue/30 border-t-accent-blue rounded-full`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      {text && (
        <p className="text-sm text-gray-400 loading-dots">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;

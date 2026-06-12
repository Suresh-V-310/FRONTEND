import { motion } from 'framer-motion';

/**
 * Reusable glassmorphism card component
 */
const GlassCard = ({
  children,
  className = '',
  hover = true,
  onClick,
  ...props
}) => {
  return (
    <motion.div
      className={`glass-card ${className}`}
      whileHover={hover ? { y: -4, scale: 1.01 } : {}}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;

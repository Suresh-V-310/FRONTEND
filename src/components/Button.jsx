import { motion } from 'framer-motion';

/**
 * Animated button with glow effect variants
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  icon: Icon,
  ...props
}) => {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    danger: 'px-6 py-3 rounded-xl font-semibold bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 transition-all duration-300',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-3',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <motion.button
      className={`${variants[variant]} ${sizes[size]} ${className} inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : Icon ? (
        <Icon size={18} />
      ) : null}
      {children}
    </motion.button>
  );
};

export default Button;

import { forwardRef } from 'react';

/**
 * Styled input field component
 */
const Input = forwardRef(
  ({ label, error, icon: Icon, className = '', ...props }, ref) => {
    return (
      <div className={`space-y-2 ${className}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-300">
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <Icon
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
          )}
          <input
            ref={ref}
            className={`input-field ${Icon ? 'pl-10' : ''} ${error ? 'ring-2 ring-red-500/50' : ''}`}
            {...props}
          />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;

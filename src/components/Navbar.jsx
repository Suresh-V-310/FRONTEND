import { Link } from 'react-router-dom';
import { Code2, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { APP_NAME } from '../utils/constants';

/**
 * Minimal navbar for the compiler — logo and theme toggle only.
 */
const Navbar = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5 backdrop-blur-xl">
      <div className="max-w-full mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center group-hover:scale-110 transition-transform">
              <Code2 size={20} className="text-white" />
            </div>
            <span className="text-lg font-bold gradient-text">{APP_NAME}</span>
          </Link>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun size={20} className="text-yellow-400" />
            ) : (
              <Moon size={20} className="text-accent-purple" />
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

import { Link } from 'react-router-dom';
import { Code2, Github, Heart } from 'lucide-react';
import { APP_NAME } from '../utils/constants';

/**
 * Site footer component
 */
const Footer = () => {
  return (
    <footer className="border-t border-white/5 bg-dark-bg/50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center">
                <Code2 size={16} className="text-white" />
              </div>
              <span className="text-lg font-bold gradient-text">{APP_NAME}</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              A modern online compiler and code editor. Write, compile, and run
              code in multiple languages from your browser.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white">Quick Links</h4>
            <div className="flex flex-col gap-2">
              <Link to="/dashboard" className="text-gray-400 hover:text-accent-cyan text-sm transition-colors">
                Dashboard
              </Link>
              <Link to="/saved" className="text-gray-400 hover:text-accent-cyan text-sm transition-colors">
                Saved Codes
              </Link>
              <Link to="/profile" className="text-gray-400 hover:text-accent-cyan text-sm transition-colors">
                Profile
              </Link>
            </div>
          </div>

          {/* Languages */}
          <div className="space-y-4">
            <h4 className="font-semibold text-white">Supported Languages</h4>
            <div className="flex flex-wrap gap-2">
              {['C', 'C++', 'Java', 'Python', 'JavaScript'].map((lang) => (
                <span
                  key={lang}
                  className="px-3 py-1 text-xs rounded-full glass text-gray-300"
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm flex items-center gap-1">
            Built with <Heart size={14} className="text-red-400" /> using React &amp; Node.js
          </p>
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

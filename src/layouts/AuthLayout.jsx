import { Link, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Code2 } from 'lucide-react';
import ParticleBackground from '../components/ParticleBackground';
import { APP_NAME } from '../utils/constants';

/**
 * Auth layout for Login and Signup pages
 */
const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center relative overflow-hidden">
      <ParticleBackground />

      {/* Background gradient orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-accent-blue/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent-purple/20 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center group-hover:scale-110 transition-transform">
              <Code2 size={24} className="text-white" />
            </div>
          </Link>
          <h1 className="mt-4 text-2xl font-bold gradient-text">{APP_NAME}</h1>
          <p className="text-gray-400 text-sm mt-1">Code anywhere, anytime</p>
        </div>

        <Outlet />
      </motion.div>
    </div>
  );
};

export default AuthLayout;

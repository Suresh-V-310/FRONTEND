import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Sparkles,
  Play,
  Code2,
} from 'lucide-react';
import TypingAnimation from '../components/TypingAnimation';
import FeatureCard from '../components/FeatureCard';
import Button from '../components/Button';
import GlassCard from '../components/GlassCard';
import { FEATURES, LANGUAGES } from '../utils/constants';
import { useAuth } from '../context/AuthContext';

/**
 * Landing page with hero, features, and CTA sections
 */
const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-hero-gradient animate-gradient-x opacity-80" />
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-accent-blue/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-accent-purple/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
              <Sparkles size={16} className="text-accent-cyan" />
              <span className="text-sm text-gray-300">
                Modern Online Compiler & IDE
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold leading-tight mb-6">
              <span className="text-white">Write Code.</span>
              <br />
              <TypingAnimation className="text-4xl sm:text-5xl md:text-7xl" />
            </h1>

            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              A premium online coding platform with VS Code editor, multi-language
              support, and instant compilation. Built for developers who demand excellence.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to={isAuthenticated ? '/dashboard' : '/signup'}>
                <Button variant="primary" size="lg" icon={Play} className="neon-glow">
                  {isAuthenticated ? 'Open Dashboard' : 'Start Coding Free'}
                  <ArrowRight size={20} />
                </Button>
              </Link>
              <Link to="/signup">
                <Button variant="secondary" size="lg" icon={Code2}>
                  Try Demo
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Language badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-16 flex flex-wrap justify-center gap-3"
          >
            {LANGUAGES.map((lang, i) => (
              <motion.span
                key={lang.key}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="px-4 py-2 rounded-xl glass text-sm font-medium text-gray-300 hover:border-accent-blue/50 transition-colors cursor-default"
              >
                {lang.name}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to <span className="gradient-text">Code Better</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Professional-grade tools wrapped in a beautiful, intuitive interface.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, index) => (
              <FeatureCard key={feature.title} {...feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <GlassCard className="text-center py-16 px-8 neon-glow" hover={false}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Start Coding?
              </h2>
              <p className="text-gray-400 mb-8 max-w-lg mx-auto">
                Join thousands of developers who trust OnlineCompiler for their daily coding needs.
              </p>
              <Link to={isAuthenticated ? '/dashboard' : '/signup'}>
                <Button variant="primary" size="lg" icon={ArrowRight}>
                  Launch Editor
                </Button>
              </Link>
            </motion.div>
          </GlassCard>
        </div>
      </section>
    </div>
  );
};

export default Home;

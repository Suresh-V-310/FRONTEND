import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import GlassCard from './GlassCard';

/**
 * Feature card with icon and hover animation
 */
const FeatureCard = ({ icon, title, description, index = 0 }) => {
  const Icon = LucideIcons[icon] || LucideIcons.Star;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <GlassCard className="h-full group cursor-default">
        <div className="flex flex-col gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Icon size={24} className="text-accent-cyan" />
          </div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default FeatureCard;

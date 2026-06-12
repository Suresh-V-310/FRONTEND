import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Palette,
  Type,
  Save,
  Clock,
  FileCode,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import GlassCard from '../components/GlassCard';
import Input from '../components/Input';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { authService } from '../services/authService';
import { KEYBOARD_SHORTCUTS } from '../utils/constants';

/**
 * User profile page with preferences
 */
const Profile = () => {
  const { user, updateUser } = useAuth();
  const { theme, fontSize, setTheme, setFontSize } = useTheme();
  const [username, setUsername] = useState(user?.username || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) setUsername(user.username);
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data } = await authService.updateProfile({
        username,
        preferences: { theme, fontSize },
      });
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg">
      <Navbar />
      <div className="pt-24 pb-12 px-4 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold mb-2">Profile</h1>
          <p className="text-gray-400 mb-8">Manage your account and preferences</p>

          {/* User Info */}
          <GlassCard className="mb-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center">
                <User size={32} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{user?.username}</h2>
                <p className="text-gray-400 text-sm flex items-center gap-1">
                  <Mail size={14} /> {user?.email}
                </p>
              </div>
            </div>

            <Input
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              icon={User}
            />
          </GlassCard>

          {/* Theme Preferences */}
          <GlassCard className="mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Palette size={20} className="text-accent-cyan" />
              Appearance
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Theme</label>
                <div className="flex gap-3">
                  {['dark', 'light'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={`px-4 py-2 rounded-xl capitalize transition-all ${
                        theme === t
                          ? 'bg-accent-blue/20 border border-accent-blue text-white'
                          : 'glass hover:bg-white/5'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 flex items-center gap-1">
                  <Type size={14} /> Editor Font Size: {fontSize}px
                </label>
                <input
                  type="range"
                  min="10"
                  max="24"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  className="w-full accent-accent-blue"
                />
              </div>
            </div>
          </GlassCard>

          {/* Keyboard Shortcuts */}
          <GlassCard className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Keyboard Shortcuts</h3>
            <div className="space-y-2">
              {Object.values(KEYBOARD_SHORTCUTS).map((shortcut) => (
                <div
                  key={shortcut.action}
                  className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                >
                  <span className="text-gray-400 text-sm">{shortcut.action}</span>
                  <kbd className="px-2 py-1 text-xs rounded bg-white/5 font-mono text-gray-300">
                    {shortcut.key}
                  </kbd>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Recent Files */}
          {user?.recentFiles?.length > 0 && (
            <GlassCard className="mb-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock size={20} className="text-accent-cyan" />
                Recent Files
              </h3>
              <div className="space-y-2">
                {user.recentFiles.map((file, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 py-2 text-sm text-gray-400"
                  >
                    <FileCode size={14} className="text-accent-blue" />
                    {file.title} • {file.language}
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          <Button
            variant="primary"
            onClick={handleSave}
            loading={loading}
            icon={Save}
            className="w-full sm:w-auto"
          >
            Save Changes
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;

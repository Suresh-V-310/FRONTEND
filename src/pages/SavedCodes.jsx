import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileCode,
  Trash2,
  Star,
  Search,
  Plus,
  Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import { snippetService } from '../services/snippetService';
import { useEditor } from '../context/EditorContext';
import { LANGUAGES } from '../utils/constants';

/**
 * Saved code snippets page
 */
const SavedCodes = () => {
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { loadSnippet } = useEditor();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSnippets();
  }, []);

  const fetchSnippets = async () => {
    try {
      const { data } = await snippetService.getAll();
      setSnippets(data.snippets);
    } catch (error) {
      toast.error('Failed to load snippets');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this snippet?')) return;
    try {
      await snippetService.delete(id);
      setSnippets((prev) => prev.filter((s) => s._id !== id));
      toast.success('Snippet deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleToggleFavorite = async (snippet) => {
    try {
      await snippetService.update(snippet._id, {
        isFavorite: !snippet.isFavorite,
      });
      setSnippets((prev) =>
        prev.map((s) =>
          s._id === snippet._id ? { ...s, isFavorite: !s.isFavorite } : s
        )
      );
    } catch {
      toast.error('Failed to update');
    }
  };

  const handleOpen = (snippet) => {
    loadSnippet(snippet);
    navigate('/dashboard');
  };

  const filtered = snippets.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.language.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-dark-bg">
      <Navbar />
      <div className="pt-24 pb-12 px-4 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-1">Saved Codes</h1>
              <p className="text-gray-400">
                {snippets.length} snippet{snippets.length !== 1 ? 's' : ''} saved
              </p>
            </div>
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => navigate('/dashboard')}
            >
              New Code
            </Button>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              type="text"
              placeholder="Search snippets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-11"
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner size="lg" text="Loading snippets" />
            </div>
          ) : filtered.length === 0 ? (
            <GlassCard className="text-center py-16">
              <FileCode size={48} className="mx-auto text-gray-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No snippets found</h3>
              <p className="text-gray-400 text-sm mb-6">
                Save your code from the dashboard to see it here.
              </p>
              <Button variant="primary" onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
            </GlassCard>
          ) : (
            <div className="grid gap-4">
              <AnimatePresence>
                {filtered.map((snippet, index) => {
                  const lang = LANGUAGES.find((l) => l.key === snippet.language);
                  return (
                    <motion.div
                      key={snippet._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <GlassCard
                        className="cursor-pointer group"
                        onClick={() => handleOpen(snippet)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-accent-blue/10 flex items-center justify-center flex-shrink-0">
                              <FileCode size={20} className="text-accent-cyan" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-semibold truncate group-hover:text-accent-cyan transition-colors">
                                {snippet.title}
                              </h3>
                              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                <span className="px-2 py-0.5 rounded bg-white/5">
                                  {lang?.name || snippet.language}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock size={12} />
                                  {new Date(snippet.updatedAt).toLocaleDateString()}
                                </span>
                              </div>
                              {snippet.description && (
                                <p className="text-sm text-gray-400 mt-2 line-clamp-1">
                                  {snippet.description}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleFavorite(snippet);
                              }}
                              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                            >
                              <Star
                                size={16}
                                className={
                                  snippet.isFavorite
                                    ? 'text-yellow-400 fill-yellow-400'
                                    : 'text-gray-500'
                                }
                              />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(snippet._id);
                              }}
                              className="p-2 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </GlassCard>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default SavedCodes;

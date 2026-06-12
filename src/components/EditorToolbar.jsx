import { Maximize2, Minimize2, Moon, Sun, Share2, Play, Loader2 } from 'lucide-react';

/**
 * Editor top toolbar — fullscreen, theme, share, run (Programiz-style)
 */
const EditorToolbar = ({
  isFullscreen,
  onToggleFullscreen,
  onToggleTheme,
  isDark,
  onShare,
  onRun,
  isRunning,
}) => {
  return (
    <div className="flex items-center gap-1 px-2 py-1.5 border-b border-[#e5e7eb] dark:border-dark-border bg-[#fafafa] dark:bg-[#252526]">
      <div className="flex-1" />
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleFullscreen}
          className="flex items-center justify-center w-9 h-9 rounded-lg border transition-all duration-200 hover:scale-105 active:scale-95 border-gray-200 bg-white hover:bg-gray-50 text-gray-700 shadow-sm dark:border-[#3a3a3c] dark:bg-[#2c2c2e] dark:hover:bg-[#3a3a3c] dark:text-[#E1D9D1] dark:hover:shadow-[0_0_8px_rgba(225,217,209,0.25)]"
          title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          aria-label="Toggle fullscreen"
        >
          {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
        <button
          type="button"
          onClick={onToggleTheme}
          className="flex items-center justify-center w-9 h-9 rounded-lg border transition-all duration-200 hover:scale-105 active:scale-95 border-gray-200 bg-white hover:bg-gray-50 text-gray-700 shadow-sm dark:border-[#3a3a3c] dark:bg-[#2c2c2e] dark:hover:bg-[#3a3a3c] dark:text-[#E1D9D1] dark:hover:shadow-[0_0_8px_rgba(225,217,209,0.25)]"
          title="Toggle theme"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <button
          type="button"
          onClick={onShare}
          className="flex items-center justify-center w-9 h-9 rounded-lg border transition-all duration-200 hover:scale-105 active:scale-95 border-gray-200 bg-white hover:bg-gray-50 text-gray-700 shadow-sm dark:border-[#3a3a3c] dark:bg-[#2c2c2e] dark:hover:bg-[#3a3a3c] dark:text-[#E1D9D1] dark:hover:shadow-[0_0_8px_rgba(225,217,209,0.25)]"
          title="Share"
          aria-label="Share"
        >
          <Share2 size={16} />
        </button>
        <button
          type="button"
          onClick={onRun}
          disabled={isRunning}
          className="ml-1 flex items-center gap-1.5 px-4 py-1.5 rounded bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-60 text-white text-sm font-semibold transition-colors"
        >
          {isRunning ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Play size={16} fill="currentColor" />
          )}
          Run
        </button>
      </div>
    </div>
  );
};
export default EditorToolbar;

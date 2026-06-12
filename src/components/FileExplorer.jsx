import { ChevronDown, FileCode, FolderOpen, FolderClosed } from 'lucide-react';
import { LANGUAGES } from '../utils/constants';

/**
 * Language selector dropdown
 */
const LanguageSelector = ({ value, onChange }) => {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-[#2d2d2d] text-white text-sm px-4 py-2 pr-10 rounded-lg border border-dark-border focus:outline-none focus:ring-2 focus:ring-accent-blue/50 cursor-pointer"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.key} value={lang.key}>
            {lang.name}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      />
    </div>
  );
};

/**
 * File explorer sidebar panel
 */
const FileExplorer = ({ tabs, activeTabId, onSelect, isOpen, onToggle }) => {
  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="p-2 hover:bg-white/5 transition-colors"
        title="Open file explorer"
      >
        <FolderClosed size={18} className="text-gray-400" />
      </button>
    );
  }

  return (
    <div className="w-48 bg-[#252526] border-r border-dark-border flex flex-col flex-shrink-0">
      <div className="flex items-center justify-between px-3 py-2 border-b border-dark-border">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Explorer
        </span>
        <button onClick={onToggle} className="p-1 hover:bg-white/5 rounded">
          <FolderOpen size={14} className="text-gray-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {tabs.map((tab) => {
          const lang = LANGUAGES.find((l) => l.key === tab.language);
          return (
            <button
              key={tab.id}
              onClick={() => onSelect(tab.id)}
              className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm transition-colors ${
                tab.id === activeTabId
                  ? 'bg-accent-blue/20 text-white'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <FileCode size={14} className="text-accent-cyan flex-shrink-0" />
              <span className="truncate">{tab.title}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export { LanguageSelector, FileExplorer };
export default LanguageSelector;

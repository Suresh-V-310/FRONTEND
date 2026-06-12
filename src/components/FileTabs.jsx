import { Pencil, Trash2 } from 'lucide-react';

/**
 * Sub-tabs for multi-file workspaces (HTML / CSS / JS / Projects)
 * Supports scrolling when there are many files
 */
const FileTabs = ({ files, activeFile, onSelect, onRename, onDelete }) => {
  return (
    <div className="flex items-center gap-0 bg-[#fafafa] dark:bg-[#252526] px-1 flex-shrink-0 overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
      {files.map((name) => {
        const isActive = name === activeFile;
        return (
          <div key={name} className="group flex items-center">
            <button
              type="button"
              onClick={() => onSelect(name)}
              className={`px-3 py-1.5 text-xs font-medium rounded-t transition-colors whitespace-nowrap flex-shrink-0 ${
                isActive
                  ? 'bg-white dark:bg-[#1e1e1e] text-[#2563eb] border border-b-0 border-[#e5e7eb] dark:border-dark-border -mb-px'
                  : 'text-[#6b7280] dark:text-gray-400 hover:text-[#111827] dark:hover:text-white'
              }`}
            >
              {name}
            </button>
            {isActive && onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-opacity flex-shrink-0"
                title="Delete file"
              >
                <Trash2 size={12} className="text-red-500" />
              </button>
            )}
          </div>
        );
      })}

    </div>
  );
};

export default FileTabs;

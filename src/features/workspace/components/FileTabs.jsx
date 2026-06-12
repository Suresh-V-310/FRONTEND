import { useState, useRef, useEffect } from 'react';
import { Pencil, Trash2, Save, FolderOpen, ChevronDown } from 'lucide-react';

const FileTabs = ({ files, activeFile, onSelect, onRename, onDelete, onSave, onOpen }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex items-center bg-[#fafafa] dark:bg-[#252526] px-1 flex-shrink-0">
      <div className="flex min-w-0 flex-1 overflow-x-auto overflow-y-hidden">
        {files.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => onSelect(name)}
            className={`max-w-64 truncate px-3 py-1.5 text-xs font-medium rounded-t ${
              name === activeFile
                ? 'bg-white dark:bg-[#1e1e1e] text-[#2563eb] border border-b-0 border-[#e5e7eb] dark:border-dark-border -mb-px'
                : 'text-[#6b7280] hover:text-[#111827] dark:hover:text-gray-100'
            }`}
            title={name}
          >
            {name}
          </button>
        ))}
      </div>
      {(onSave || onOpen || onCreate || onRename || onDelete) && (
        <div className="flex items-center gap-0.5 pl-2">
          {onOpen && (
            <button
              type="button"
              onClick={onOpen}
              className="compiler-tool-btn"
              aria-label="Open local file"
              title="Open local file"
            >
              <FolderOpen size={15} />
            </button>
          )}
          {onSave && (
            <div className="relative" ref={dropdownRef}>
              <div className="flex items-center rounded hover:bg-[#f3f4f6] dark:hover:bg-white/10">
                <button
                  type="button"
                  onClick={() => onSave(false)}
                  className="p-2 text-[#6b7280] hover:text-[#111827] dark:text-gray-400 dark:hover:text-white transition-colors"
                  aria-label="Save file"
                  title="Save file (Ctrl+S)"
                >
                  <Save size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="p-2 pl-0 text-[#6b7280] hover:text-[#111827] dark:text-gray-400 dark:hover:text-white transition-colors border-l border-gray-200 dark:border-dark-border"
                  aria-label="Save options"
                  title="Save options"
                >
                  <ChevronDown size={10} />
                </button>
              </div>
              {showDropdown && (
                <div className="absolute right-0 top-full mt-1 bg-white dark:bg-[#252526] border border-gray-200 dark:border-dark-border rounded shadow-lg z-50 text-xs py-1 min-w-[110px] flex flex-col">
                  <button
                    type="button"
                    onClick={() => {
                      onSave(false);
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 transition-colors"
                  >
                    Save (Ctrl+S)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onSave(true);
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 transition-colors"
                  >
                    Save As... (Ctrl+Shift+S)
                  </button>
                </div>
              )}
            </div>
          )}

          {onDelete && (
            <button type="button" onClick={onDelete} className="compiler-tool-btn" aria-label="Delete file" title="Delete file">
              <Trash2 size={15} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default FileTabs;

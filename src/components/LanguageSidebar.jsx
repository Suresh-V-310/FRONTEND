import { SIDEBAR_LANGUAGES } from '../utils/constants';

/**
 * Vertical language picker — Programiz-style icon strip with improved styling
 */
const LanguageSidebar = ({ activeLanguage, onSelect }) => {
  return (
    <aside className="compiler-sidebar flex flex-col items-center py-1 px-0 border-r border-[#e5e7eb] dark:border-dark-border bg-white dark:bg-[#252526] flex-shrink-0 w-[55px] h-full min-h-0 overflow-y-auto overflow-x-hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      {SIDEBAR_LANGUAGES.map((lang) => {
        const isActive = activeLanguage === lang.key;
        return (
          <button
            key={lang.key}
            type="button"
            onClick={() => onSelect(lang.key)}
            className={`group relative flex items-center justify-center w-[45px] h-[45px] my-[5px] rounded-[6px] border transition-all duration-150 flex-shrink-0 transform hover:scale-103 active:scale-95 ${
            isActive
              ? 'bg-gradient-to-br from-[#2563eb] to-[#1d4ed8] border-[#2563eb] shadow-sm ring-1 ring-[#2563eb]/40 scale-100'
              : 'bg-gray-50 dark:bg-[#1e1e1e] border-gray-200/50 dark:border-white/5 hover:bg-gradient-to-br hover:from-[#f3f4f6] hover:to-[#e5e7eb] dark:hover:from-white/10 dark:hover:to-white/5 hover:shadow-sm'
            }`}
          >
            <span
              className={`text-[15px] font-semibold leading-none select-none transition-all duration-150 ${
                isActive ? 'text-white drop-shadow-sm' : lang.textClass
              }`}
              style={!isActive && lang.color ? { color: lang.color } : undefined}
            >
              {lang.abbr}
            </span>
            {isActive && (
              <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-[#2563eb] to-[#1d4ed8] rounded-l-full shadow-md" />
            )}
          </button>
        );
      })}
    </aside>
  );
};

export default LanguageSidebar;

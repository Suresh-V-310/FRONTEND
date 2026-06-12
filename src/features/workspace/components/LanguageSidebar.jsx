import { SIDEBAR_LANGUAGES } from '../../languages/sidebarLanguages.js';

const LanguageSidebar = ({ activeLanguage, onSelect }) => (
  <aside className="compiler-sidebar flex flex-col items-center py-1 px-0 border-r border-[#e5e7eb] dark:border-dark-border bg-white dark:bg-[#252526] flex-shrink-0 w-[55px] h-full min-h-0 overflow-y-auto overflow-x-hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
    {SIDEBAR_LANGUAGES.map((lang) => {
      const isActive = activeLanguage === lang.key;
      return (
        <button
          key={lang.key}
          type="button"
          onClick={() => onSelect(lang.key)}
          className={`flex items-center justify-center w-[45px] h-[45px] my-[5px] rounded-[6px] border transition-all duration-150 transform flex-shrink-0 ${
            isActive
              ? 'bg-gradient-to-br from-[#2563eb] to-[#1d4ed8] border-[#2563eb] shadow-sm ring-1 ring-[#2563eb]/40 scale-100'
              : 'bg-gray-50 dark:bg-[#1e1e1e] border-gray-200/50 dark:border-white/5 hover:scale-103 hover:bg-gray-100 dark:hover:bg-white/5 active:scale-95'
          }`}
        >
          <span
            className={`text-[15px] font-semibold leading-none select-none transition-colors duration-150 ${
              isActive ? 'text-white drop-shadow-sm' : lang.textClass
            }`}
            style={!isActive && lang.color ? { color: lang.color } : undefined}
          >
            {lang.abbr}
          </span>
        </button>
      );
    })}
  </aside>
);

export default LanguageSidebar;

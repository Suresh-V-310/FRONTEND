import { getLanguageMeta } from '../utils/constants';

/**
 * Programiz-style top header: brand + "{Language} Online Compiler"
 */
const CompilerHeader = ({ activeLanguage }) => {
  const meta = getLanguageMeta(activeLanguage);
  const subtitle =
    meta.kind === 'sql'
      ? 'SQL Database Editor'
      : meta.kind === 'web'
        ? 'HTML / CSS / JavaScript Editor'
        : `${meta.name} Online Compiler`;

  return (
    <header className="compiler-header flex items-center gap-3 px-6 py-5 border-b border-[#e5e7eb] dark:border-dark-border bg-white dark:bg-[#1e1e1e] flex-shrink-0">
      <div className="flex items-center gap-2">
        <div className="flex flex-col leading-tight">
          <span className="text-xl font-bold tracking-tight text-[#1d4ed8] dark:text-[#60a5fa]">
            OnlineCompiler
          </span>
          <span className="text-xs text-[#6b7280] dark:text-gray-400 font-medium">
            {subtitle}
          </span>
        </div>
      </div>
    </header>
  );
};

export default CompilerHeader;

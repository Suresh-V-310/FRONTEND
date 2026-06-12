/**
 * Single-file tab bar — Programiz-style filename tab
 */
const EditorTabs = ({ title }) => {
  return (
    <div className="flex items-center bg-[#f3f4f6] dark:bg-[#2d2d2d] border-b border-[#e5e7eb] dark:border-dark-border min-h-[36px]">
      <div className="flex items-center px-4 py-2 text-sm text-[#374151] dark:text-gray-200 bg-white dark:bg-[#1e1e1e] border-r border-[#e5e7eb] dark:border-dark-border font-medium">
        {title}
      </div>
    </div>
  );
};

export default EditorTabs;

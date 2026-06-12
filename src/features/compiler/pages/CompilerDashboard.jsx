import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import CompilerHeader from '../../workspace/components/CompilerHeader.jsx';
import LanguageSidebar from '../../workspace/components/LanguageSidebar.jsx';
import FileTabs from '../../workspace/components/FileTabs.jsx';
import CodeEditor from '../components/CodeEditor.jsx';
import EditorToolbar from '../components/EditorToolbar.jsx';
import OutputPanel from '../components/OutputPanel.jsx';
import { useEditor } from '../../workspace/context/EditorContext.jsx';
import { useTheme } from '../../../shared/theme/ThemeContext.jsx';
import { useRunCode } from '../hooks/useRunCode.js';
import { usePanelResize } from '../hooks/usePanelResize.js';
import { WEB_FILE_MONACO } from '../utils/editorLanguageMap.js';
import { LANGUAGES, getLanguageMeta } from '../../languages/index.js';
import { copyToClipboard, saveEditorState } from '../../../shared/utils/storage.js';
import { getRequiredInputCount } from '../utils/codeNeedsStdin.js';

const CompilerDashboard = () => {
  const {
    activeTab,
    activeTabId,
    output,
    setOutput,
    previewHtml,
    setPreviewHtml,
    isRunning,
    setIsRunning,
    updateTabCode,
    updateTabFile,
    setTabActiveFile,
    addTabFile,
    renameTabFile,
    removeTabFile,
    updateTabStdin,
    clearOutput,
    loadLocalFile,
    markTabClean,
    WEB_FILES,
    image,
    setImage,
  } = useEditor();

  const { toggleTheme, isDark } = useTheme();
  const { editorWidth, isDragging, onResizeStart } = usePanelResize();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [prevTabId, setPrevTabId] = useState(activeTabId);
  const [isPromptVisible, setIsPromptVisible] = useState(false);
  const [fileHandles, setFileHandles] = useState({});
  const workspaceRef = useRef(null);

  if (activeTabId !== prevTabId) {
    setPrevTabId(activeTabId);
    setIsPromptVisible(false);
  }

  const tabStdin = activeTab?.stdin ?? '';

  const runCodeHook = useRunCode({
    activeTab,
    stdin: tabStdin,
    isRunning,
    setOutput,
    setPreviewHtml,
    clearOutput,
    setIsRunning,
    setImage,
  });

  const handleRun = () => runCodeHook.run();

  const handleClearAll = () => {
    runCodeHook.clearAll();
    // also reset stdin and prompt visibility
    updateTabStdin(activeTabId, '');
    setIsPromptVisible(false);
  };

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    const text = `Try this ${activeTab?.language || 'code'} on OnlineCompiler:\n${url}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'OnlineCompiler', text, url });
        return;
      } catch {
        /* fallback */
      }
    }
    const ok = await copyToClipboard(text);
    toast[ok ? 'success' : 'error'](ok ? 'Link copied!' : 'Could not copy');
  }, [activeTab?.language]);

  const handleToggleFullscreen = useCallback(() => {
    const el = workspaceRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }, []);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const meta = activeTab ? getLanguageMeta(activeTab.language) : null;
  const isWeb = activeTab?.kind === 'web';
  const isProject = activeTab?.kind === 'project' && activeTab?.files;
  const isFileBacked = isWeb || isProject;

  const editorLanguage = isWeb
    ? WEB_FILE_MONACO[activeTab.activeFile] || 'html'
    : activeTab?.language === 'c' && activeTab?.activeFile?.endsWith('.h')
      ? 'c'
    : LANGUAGES.find((l) => l.key === activeTab?.language)?.monaco || 'c';

  const editorValue = isFileBacked
    ? activeTab.files?.[activeTab.activeFile] ?? ''
    : activeTab?.code ?? '';

  const editorFilename = isFileBacked
    ? activeTab.activeFile
    : activeTab?.displayFile || `main.${meta?.extension || 'txt'}`;

  const projectFiles = isProject ? Object.keys(activeTab.files).sort() : [];

  const allowedProjectExtensions = {
    c: ['c', 'h', 'a', 'so', 'dll', 'dylib', 'lib'],
    cpp: ['cpp', 'cc', 'cxx', 'hpp', 'h', 'a', 'so', 'dll', 'dylib', 'lib'],
    java: ['java', 'xml', 'properties', 'gradle'],
    python: ['py', 'txt', 'toml'],
    javascript: ['js', 'mjs', 'cjs', 'json'],
    typescript: ['ts', 'tsx', 'json'],
    csharp: ['cs', 'csproj', 'json'],
    php: ['php', 'json'],
    go: ['go', 'mod', 'sum'],
    rust: ['rs', 'toml'],
    kotlin: ['kt', 'kts', 'gradle'],
    ruby: ['rb', 'Gemfile'],
    r: ['R', 'r'],
    dart: ['dart', 'yaml'],
    scala: ['scala', 'sbt'],
    sql: ['sql'],
  };

  const normalizeProjectPath = useCallback((value) => {
    const cleaned = value.trim().replace(/\\/g, '/').replace(/^\/+/, '');
    if (!cleaned || cleaned.includes('..')) return '';
    const extensions = allowedProjectExtensions[activeTab?.language] || [meta?.extension].filter(Boolean);
    const extension = cleaned.includes('.') ? cleaned.split('.').pop() : cleaned;
    if (extensions.length && !extensions.includes(extension) && !extensions.includes(cleaned)) return '';
    if (cleaned.includes('/')) return cleaned;
    if (activeTab?.language === 'c') return `src/${cleaned}`;
    if (activeTab?.language === 'cpp') return `src/${cleaned}`;
    if (activeTab?.language === 'java') return `src/main/java/${cleaned}`;
    return cleaned;
  }, [activeTab?.language, meta?.extension]);

  const handleRenameProjectFile = useCallback(() => {
    const nextPath = normalizeProjectPath(window.prompt('Rename file', activeTab.activeFile) || '');
    if (!nextPath || activeTab.files?.[nextPath]) return;
    renameTabFile(activeTabId, activeTab.activeFile, nextPath);
  }, [activeTab?.activeFile, activeTab?.files, activeTabId, renameTabFile, normalizeProjectPath]);

  const handleDeleteProjectFile = useCallback(() => {
    removeTabFile(activeTabId, activeTab.activeFile);
  }, [activeTab?.activeFile, activeTabId, removeTabFile]);

  const handleSaveProject = useCallback(async (saveAs = false) => {
    if (!activeTab) return;
    const filename = isFileBacked
      ? activeTab.activeFile
      : activeTab?.displayFile || `main.${meta?.extension || 'txt'}`;
    const content = editorValue;
    const fileKey = `${activeTab.id}:${filename}`;

    let handle = !saveAs ? fileHandles[fileKey] : null;

    try {
      if (!handle && window.showSaveFilePicker) {
        const ext = filename.split('.').pop() || 'txt';
        const options = {
          suggestedName: filename.includes('/') ? filename.split('/').pop() : filename,
          types: [
            {
              description: `${activeTab.language.toUpperCase()} Source File`,
              accept: {
                'text/plain': [`.${ext}`],
              },
            },
          ],
        };
        handle = await window.showSaveFilePicker(options);
        setFileHandles((prev) => ({ ...prev, [fileKey]: handle }));
      }

      if (handle) {
        const writable = await handle.createWritable();
        await writable.write(content);
        await writable.close();
        markTabClean(activeTabId);
        toast.success(`Saved successfully to ${handle.name}`);
      } else {
        // Fallback for browsers without showSaveFilePicker (triggers simple download)
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename.includes('/') ? filename.split('/').pop() : filename;
        a.click();
        URL.revokeObjectURL(url);
        markTabClean(activeTabId);
        toast.success('Downloaded successfully');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        toast.error('Failed to save file: ' + err.message);
      }
    }
  }, [activeTab, activeTabId, isFileBacked, meta, editorValue, fileHandles, markTabClean]);

  const handleOpenFile = useCallback(async () => {
    if (!activeTab) return;
    if (!window.showOpenFilePicker) {
      toast.error('File System Access API is not supported in this browser.');
      return;
    }

    try {
      const ext = meta?.extension || 'txt';
      const options = {
        types: [
          {
            description: `${activeTab.language.toUpperCase()} Source File`,
            accept: {
              'text/plain': [`.${ext}`, '.txt', '.js', '.ts', '.c', '.cpp', '.java', '.py', '.rs', '.go', '.html', '.css', '.kt', '.cs', '.php', '.rb', '.R', '.m', '.dart', '.scala', '.sql'],
            },
          },
        ],
      };

      const [handle] = await window.showOpenFilePicker(options);
      const file = await handle.getFile();
      const content = await file.text();

      const filename = file.name;
      const fileKey = `${activeTab.id}:${filename}`;

      // Save handle to map
      setFileHandles((prev) => ({ ...prev, [fileKey]: handle }));

      if (activeTab.kind === 'project' || activeTab.kind === 'web') {
        // For project/web tabs, check if file exists and confirm overwrite
        if (activeTab.files && activeTab.files[filename] !== undefined) {
          const confirmOverwrite = window.confirm(`File "${filename}" already exists in project. Overwrite?`);
          if (!confirmOverwrite) return;
        }
        addTabFile(activeTabId, filename, content);
      } else {
        // For single file tabs, load it
        loadLocalFile(activeTabId, filename, content);
      }

      toast.success(`Opened file "${filename}" successfully`);
    } catch (err) {
      if (err.name !== 'AbortError') {
        toast.error('Failed to open file: ' + err.message);
      }
    }
  }, [activeTab, activeTabId, addTabFile, loadLocalFile, meta]);

  // Get required input count for current code
  const requiredInputCount = activeTab && activeTab.kind !== 'web'
    ? getRequiredInputCount(editorValue, activeTab.language)
    : 0;

  // Derive inputValues from activeTab?.stdin
  const savedLines = (activeTab?.stdin || '').split('\n');
  const inputValues = Array.from({ length: requiredInputCount }, (_, idx) => savedLines[idx] || '');

  const onRunClick = useCallback(async () => {
    // If inputs are required and prompt is not visible, show the input prompt first
    if (requiredInputCount > 0 && !isPromptVisible) {
      // Show input prompt for new inputs
      setIsPromptVisible(true);
      clearOutput();
      setOutput('');
      return;
    }
    // Otherwise, run the code (with any existing stdin)
    await handleRun();
    // After execution, reset stdin and hide prompt to ensure next run starts clean
    updateTabStdin(activeTabId, '');
    setIsPromptVisible(false);
  }, [requiredInputCount, isPromptVisible, handleRun, clearOutput, setOutput, updateTabStdin, activeTabId, setIsPromptVisible]);

  const handleInputChange = useCallback((index, value) => {
    const next = [...inputValues];
    next[index] = value;
    // Propagate to editor tab stdin
    updateTabStdin(activeTabId, next.join('\n'));
  }, [activeTabId, inputValues, updateTabStdin]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        onRunClick();
      } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'S' || e.key === 's')) {
        e.preventDefault();
        handleSaveProject(true);
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        handleSaveProject(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onRunClick, handleSaveProject]);

  const showOutput = !!(
    isRunning ||
    output ||
    previewHtml ||
    image ||
    isPromptVisible
  );

  const outputPanelProps = {
    output,
    onClear: () => {
      clearOutput();
      setOutput('');
      updateTabStdin(activeTabId, '');
      setIsPromptVisible(false);
    },
    isRunning,
    previewHtml,
    isPromptVisible,
    requiredCount: requiredInputCount,
    inputValues,
    onInputChange: handleInputChange,
    onRun: onRunClick,
    language: activeTab.language,
    image,
  };

  return (
    <div
      className={`compiler-app h-screen flex flex-col overflow-hidden ${
        isDark ? 'dark bg-[#1e1e1e]' : 'bg-white'
      }`}
    >
      <CompilerHeader activeLanguage={activeTab?.language || 'c'} />

      <div className="flex flex-1 min-h-0">
        <LanguageSidebar
          activeLanguage={activeTab?.language || 'c'}
          onSelect={(language) => {
            window.open(`/compiler?language=${language}&template=default`, '_blank');
          }}
        />

        <div ref={workspaceRef} className="flex flex-1 flex-col min-w-0 bg-white dark:bg-[#1e1e1e]">
          <div
            id="compiler-split"
            className="flex flex-1 min-h-0"
            style={{ cursor: isDragging ? 'col-resize' : 'default' }}
          >
            <div
              className={`flex flex-col min-w-0 ${showOutput ? 'border-r border-[#e5e7eb] dark:border-dark-border' : ''}`}
              style={{ width: showOutput ? `${editorWidth}%` : '100%' }}
            >
              {isWeb && (
                <FileTabs
                  files={WEB_FILES}
                  activeFile={activeTab.activeFile}
                  onSelect={(file) => setTabActiveFile(activeTabId, file)}
                  onSave={handleSaveProject}
                  onOpen={handleOpenFile}
                />
              )}

              {isProject && (
                <FileTabs
                  files={projectFiles}
                  activeFile={activeTab.activeFile}
                  onSelect={(file) => setTabActiveFile(activeTabId, file)}
                  onRename={handleRenameProjectFile}
                  onDelete={projectFiles.length > 1 ? handleDeleteProjectFile : undefined}
                  onSave={handleSaveProject}
                  onOpen={handleOpenFile}
                />
              )}

              {!isFileBacked && (
                <FileTabs
                  files={[editorFilename]}
                  activeFile={editorFilename}
                  onSelect={() => {}}
                  onSave={handleSaveProject}
                  onOpen={handleOpenFile}
                />
              )}

              <EditorToolbar
                isFullscreen={isFullscreen}
                onToggleFullscreen={handleToggleFullscreen}
                onToggleTheme={toggleTheme}
                isDark={isDark}
                onShare={handleShare}
                onRun={onRunClick}
                isRunning={isRunning}
              />

              <div className="flex-1 min-h-0">
                {activeTab && (
                  <CodeEditor
                    value={editorValue}
                    onChange={(value) => {
                      if (isFileBacked) {
                        updateTabFile(activeTabId, activeTab.activeFile, value || '');
                      } else {
                        updateTabCode(activeTabId, value || '');
                      }
                    }}
                    language={editorLanguage}
                  />
                )}
              </div>
            </div>

            {showOutput && (
              <div
                className="panel-resizer hidden md:block w-1 flex-shrink-0 bg-[#e5e7eb] dark:bg-dark-border hover:bg-[#2563eb]/40"
                onMouseDown={onResizeStart}
                role="separator"
                aria-orientation="vertical"
              />
            )}

            {showOutput && (
              <div className="flex-1 min-w-0 hidden md:flex flex-col">
                <OutputPanel {...outputPanelProps} />
              </div>
            )}
          </div>

          {showOutput && (
            <div className="md:hidden flex flex-col h-56 border-t border-[#e5e7eb] dark:border-dark-border">
              <OutputPanel {...outputPanelProps} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompilerDashboard;

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  DEFAULT_CODE,
  DEFAULT_WEB_FILES,
  getLanguageMeta,
  WEB_FILES,
} from '../../languages/index.js';
import { generateId, clearEditorState, loadEditorState } from '../../../shared/utils/storage.js';

const EditorContext = createContext(null);

const PROJECT_MAIN_FILES = {
  c: 'src/main.c',
  cpp: 'src/main.cpp',
  java: 'src/main/java/Main.java',
  python: 'main.py',
  javascript: 'index.js',
  typescript: 'index.ts',
  csharp: 'Program.cs',
  php: 'index.php',
  go: 'main.go',
  rust: 'src/main.rs',
  kotlin: 'Main.kt',
  ruby: 'main.rb',
  r: 'main.R',
  dart: 'bin/main.dart',
  scala: 'Main.scala',
  sql: 'script.sql',
};

export const createTab = (language = 'c') => {
  const meta = getLanguageMeta(language);

  if (meta.kind === 'web') {
    return {
      id: generateId(),
      language,
      title: meta.tabTitle,
      kind: 'web',
      files: { ...DEFAULT_WEB_FILES },
      activeFile: 'index.html',
      code: '',
      stdin: '',
      isDirty: false,
    };
  }

  if (PROJECT_MAIN_FILES[language]) {
    const mainFile = PROJECT_MAIN_FILES[language];
    return {
      id: generateId(),
      language,
      title: meta.tabTitle,
      kind: 'project',
      files: { [mainFile]: DEFAULT_CODE[language] || '' },
      activeFile: mainFile,
      code: DEFAULT_CODE[language] || '',
      stdin: '',
      isDirty: false,
      displayFile: mainFile,
    };
  }

  const filename =
    language === 'csharp'
        ? 'Program.cs'
        : `main.${meta.extension}`;

  return {
    id: generateId(),
    language,
    title: meta.tabTitle,
    kind: meta.kind,
    code: DEFAULT_CODE[language] || '',
    stdin: '',
    isDirty: false,
    displayFile: filename,
  };
};

function getInitialWorkspace() {
  try {
    const params = new URLSearchParams(window.location.search);
    const lang = params.get('language');
    if (lang) {
      const tab = createTab(lang);
      return { tabs: [tab], activeTabId: tab.id };
    }
  } catch (e) {
    // Ignore error
  }

  try {
    const saved = loadEditorState();
    if (saved && Array.isArray(saved.tabs) && saved.tabs.length > 0 && saved.activeTabId) {
      return saved;
    }
  } catch (e) {
    // Ignore error
  }
  const tab = createTab('c');
  return { tabs: [tab], activeTabId: tab.id };
}

const initialWorkspace = getInitialWorkspace();

export const EditorProvider = ({ children }) => {
  const [tabs, setTabs] = useState(initialWorkspace.tabs);
  const [activeTabId, setActiveTabId] = useState(initialWorkspace.activeTabId);
  const [output, setOutput] = useState('');
  const [previewHtml, setPreviewHtml] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [image, setImage] = useState(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const langParam = searchParams.get('language');

  // Sync URL query param -> state
  useEffect(() => {
    if (langParam) {
      const existing = tabs.find((t) => t.language === langParam);
      if (existing) {
        if (activeTabId !== existing.id) {
          setActiveTabId(existing.id);
        }
      } else {
        const newTab = createTab(langParam);
        setTabs((prev) => {
          if (prev.some((t) => t.language === langParam)) return prev;
          return [...prev, newTab];
        });
        setActiveTabId(newTab.id);
      }
    }
  }, [langParam, activeTabId, tabs]);

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  // Sync state -> URL query param
  useEffect(() => {
    if (activeTab && activeTab.language !== langParam) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set('language', activeTab.language);
          return next;
        },
        { replace: true }
      );
    }
  }, [activeTab, langParam, setSearchParams]);

  const updateTabCode = useCallback((tabId, code) => {
    setTabs((prev) =>
      prev.map((t) => (t.id === tabId ? { ...t, code, isDirty: true } : t))
    );
  }, []);

  const updateTabFile = useCallback((tabId, filename, content) => {
    setTabs((prev) =>
      prev.map((t) =>
        t.id === tabId
          ? { ...t, files: { ...t.files, [filename]: content }, isDirty: true }
          : t
      )
    );
  }, []);

  const setTabActiveFile = useCallback((tabId, filename) => {
    setTabs((prev) =>
      prev.map((t) => (t.id === tabId ? { ...t, activeFile: filename } : t))
    );
  }, []);

  const addTabFile = useCallback((tabId, filename, content = '') => {
    setTabs((prev) =>
      prev.map((t) =>
        t.id === tabId
          ? {
              ...t,
              files: { ...t.files, [filename]: content },
              activeFile: filename,
              displayFile: filename,
              isDirty: true,
            }
          : t
      )
    );
  }, []);

  const renameTabFile = useCallback((tabId, oldFilename, newFilename) => {
    setTabs((prev) =>
      prev.map((t) => {
        if (t.id !== tabId || !t.files?.[oldFilename]) return t;
        const nextFiles = { ...t.files };
        nextFiles[newFilename] = nextFiles[oldFilename];
        delete nextFiles[oldFilename];
        return {
          ...t,
          files: nextFiles,
          activeFile: t.activeFile === oldFilename ? newFilename : t.activeFile,
          displayFile: t.displayFile === oldFilename ? newFilename : t.displayFile,
          isDirty: true,
        };
      })
    );
  }, []);

  const removeTabFile = useCallback((tabId, filename) => {
    setTabs((prev) =>
      prev.map((t) => {
        if (t.id !== tabId || !t.files?.[filename] || Object.keys(t.files).length <= 1) return t;
        const nextFiles = { ...t.files };
        delete nextFiles[filename];
        const nextActiveFile = t.activeFile === filename ? Object.keys(nextFiles)[0] : t.activeFile;
        return {
          ...t,
          files: nextFiles,
          activeFile: nextActiveFile,
          displayFile: nextActiveFile,
          isDirty: true,
        };
      })
    );
  }, []);

  const updateTabStdin = useCallback((tabId, stdin) => {
    setTabs((prev) =>
      prev.map((t) => (t.id === tabId ? { ...t, stdin } : t))
    );
  }, []);

  const openLanguageTab = useCallback((language) => {
    setTabs((prev) => {
      const existing = prev.find((t) => t.language === language);
      if (existing) {
        setActiveTabId(existing.id);
        return prev;
      }
      const newTab = createTab(language);
      setActiveTabId(newTab.id);
      setOutput('');
      setPreviewHtml(null);
      return [...prev, newTab];
    });
  }, []);

  const closeTab = useCallback(
    (tabId) => {
      const targetTab = tabs.find((t) => t.id === tabId);
      if (targetTab && targetTab.isDirty) {
        const ok = window.confirm(`You have unsaved changes in "${targetTab.title || targetTab.language}". Are you sure you want to close this tab?`);
        if (!ok) return;
      }
      setTabs((prev) => {
        if (prev.length <= 1) return prev;
        const filtered = prev.filter((t) => t.id !== tabId);
        if (activeTabId === tabId) {
          setActiveTabId(filtered[filtered.length - 1].id);
        }
        return filtered;
      });
      setOutput('');
      setPreviewHtml(null);
    },
    [activeTabId, tabs]
  );

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (tabs.some((t) => t.isDirty)) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [tabs]);

  const clearOutput = useCallback(() => {
    setOutput('');
    setPreviewHtml(null);
    setImage(null);
  }, []);

  const loadLocalFile = useCallback((tabId, filename, code) => {
    setTabs((prev) =>
      prev.map((t) => {
        if (t.id !== tabId) return t;
        if (t.kind === 'project' || t.kind === 'web') {
          return {
            ...t,
            files: { ...t.files, [filename]: code },
            activeFile: filename,
            displayFile: filename,
            isDirty: false,
          };
        } else {
          return {
            ...t,
            code,
            displayFile: filename,
            isDirty: false,
          };
        }
      })
    );
  }, []);

  const markTabClean = useCallback((tabId) => {
    setTabs((prev) =>
      prev.map((t) => (t.id === tabId ? { ...t, isDirty: false } : t))
    );
  }, []);

  return (
    <EditorContext.Provider
      value={{
        tabs,
        activeTab,
        activeTabId,
        setActiveTabId,
        output,
        setOutput,
        previewHtml,
        setPreviewHtml,
        isRunning,
        setIsRunning,
        image,
        setImage,
        updateTabCode,
        updateTabFile,
        setTabActiveFile,
        addTabFile,
        renameTabFile,
        removeTabFile,
        updateTabStdin,
        openLanguageTab,
        closeTab,
        clearOutput,
        loadLocalFile,
        markTabClean,
        WEB_FILES,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (!context) throw new Error('useEditor must be used within EditorProvider');
  return context;
};

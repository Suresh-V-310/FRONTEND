import Editor from '@monaco-editor/react';
import { useTheme } from '../context/ThemeContext';

/**
 * Monaco code editor wrapper component
 */
const CodeEditor = ({ value, onChange, language, readOnly = false }) => {
  const { theme, fontSize } = useTheme();

  const handleEditorMount = (editor) => {
    // Focus editor on mount
    editor.focus();
  };

  return (
    <div className="monaco-editor-container h-full">
      <Editor
        height="100%"
        language={language}
        value={value}
        onChange={onChange}
        theme={theme === 'dark' ? 'vs-dark' : 'light'}
        onMount={handleEditorMount}
        options={{
          fontSize,
          fontFamily: "'JetBrains Mono', 'Consolas', monospace",
          fontLigatures: false,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: 'off',
          automaticLayout: true,
          tabSize: 4,
          readOnly,
          padding: { top: 8 },
          lineNumbers: 'on',
          glyphMargin: false,
          folding: true,
          renderLineHighlight: 'line',
          cursorBlinking: 'blink',
          smoothScrolling: true,
          bracketPairColorization: { enabled: true },
          overviewRulerLanes: 0,
          hideCursorInOverviewRuler: true,
          scrollbar: {
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10,
          },
        }}
        loading={
          <div className="flex items-center justify-center h-full text-gray-400">
            Loading editor...
          </div>
        }
      />
    </div>
  );
};

export default CodeEditor;

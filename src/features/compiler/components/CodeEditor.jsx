import Editor from '@monaco-editor/react';
import { useTheme } from '../../../shared/theme/ThemeContext.jsx';
import { RUNTIME_CAPABILITIES } from '../../languages/runtimeCapabilities.js';

const C_SNIPPETS = [
  { label: 'main', insertText: 'int main(void) {\\n\\t$0\\n\\treturn 0;\\n}' },
  { label: 'printf', insertText: 'printf("$1\\\\n"$0);' },
  { label: 'malloc', insertText: '($1 *)malloc(sizeof($1) * $2)' },
  { label: 'pthread_create', insertText: 'pthread_create(&$1, NULL, $2, &$3);' },
  { label: 'socket', insertText: 'socket(AF_INET, SOCK_STREAM, 0)' },
  { label: 'fopen', insertText: 'FILE *$1 = fopen("$2", "$3");' },
];

let completionProvidersRegistered = false;

function registerRuntimeCompletions(monaco) {
  if (completionProvidersRegistered || !monaco?.languages) return;
  completionProvidersRegistered = true;

  for (const [language, capability] of Object.entries(RUNTIME_CAPABILITIES)) {
    const monacoLanguage = language === 'cpp' ? 'cpp' : language === 'csharp' ? 'csharp' : language;
    monaco.languages.registerCompletionItemProvider(monacoLanguage, {
    triggerCharacters: ['<', '"', '#', '.'],
    provideCompletionItems: (model, position) => {
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: model.getWordUntilPosition(position).startColumn,
        endColumn: model.getWordUntilPosition(position).endColumn,
      };
        const headerSuggestions = (capability.headers || []).map((header) => ({
        label: header,
        kind: monaco.languages.CompletionItemKind.File,
        insertText: header,
        range,
          detail: `${language} header/module`,
      }));
        const packageSuggestions = (capability.packages || []).map((pkg) => ({
          label: pkg,
          kind: monaco.languages.CompletionItemKind.Module,
          insertText: pkg,
          range,
          detail: `${language} library/package`,
        }));
        const snippetSuggestions = language === 'c' ? C_SNIPPETS.map((snippet) => ({
        label: snippet.label,
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertText: snippet.insertText,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range,
        detail: 'C snippet',
        })) : (capability.snippets || []).map((snippet) => ({
          label: snippet,
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: snippet,
          range,
          detail: `${language} snippet`,
        }));
        return { suggestions: [...headerSuggestions, ...packageSuggestions, ...snippetSuggestions] };
    },
    });
  }
}

const CodeEditor = ({ value, onChange, language, readOnly = false }) => {
  const { theme, fontSize } = useTheme();

  return (
    <div className="monaco-editor-container h-full">
      <Editor
        height="100%"
        language={language}
        value={value}
        onChange={onChange}
        theme={theme === 'dark' ? 'vs-dark' : 'light'}
        onMount={(editor, monaco) => {
          registerRuntimeCompletions(monaco);
          editor.focus();
        }}
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
          bracketPairColorization: { enabled: true },
          overviewRulerLanes: 0,
          scrollbar: { verticalScrollbarSize: 10, horizontalScrollbarSize: 10 },
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

import { Loader2, Eraser } from 'lucide-react';

/**
 * OutputPanel component displays program output, error messages, and optional preview.
 * Props:
 *   output: string – stdout from execution
 *   stdin: string – input provided by user
 *   onStdinChange: (value) => void – updates stdin state
 *   onClear: () => void – clears output and input
 *   isRunning: boolean – indicates execution in progress
 *   previewHtml: string – optional HTML preview (e.g., web output)
 *   showInput: boolean – toggle stdin field (default true)
 *   error: string – error message from execution
 */
const OutputPanel = ({
  output,
  stdin,
  onStdinChange,
  onClear,
  isRunning,
  previewHtml,
  showInput = true,
  error,
  onClearError,
}) => {
  // Helper to render program output, handling a success footer line if present
  const renderOutput = () => {
    if (!output) return null;
    const lines = output.split('\n');
    const lastLine = lines[lines.length - 1] ?? '';
    const isSuccess = lastLine.includes('=== Code Execution Successful ===');
    if (isSuccess) {
      const mainOutput = lines.slice(0, -1).join('\n');
      return (
        <>
          {mainOutput && <pre className="programiz-output flex-1">{mainOutput}</pre>}
          <div className="mt-4 text-[#6b7280] font-normal opacity-80 tracking-wide" style={{ letterSpacing: '0.5px' }}>
            {lastLine}
          </div>
        </>
      );
    }
    return <pre className="programiz-output flex-1">{output}</pre>;
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#1e1e1e] border-l border-[#e5e7eb] dark:border-dark-border">
      {/* Header with clear button */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#e5e7eb] dark:border-dark-border bg-[#f9fafb] dark:bg-[#252526]">
        <span className="text-sm font-semibold text-[#374151] dark:text-gray-200">Output</span>
        <div className="flex gap-2">
          {onClearError && (
            <button
              type="button"
              onClick={onClearError}
              className="clear-error-btn group"
              title="Clear only error messages"
            >
              <Eraser size={14} className="text-red-600 group-hover:text-red-500" />
              <span>Clear Error</span>
            </button>
          )}
          <button
            type="button"
            onClick={onClear}
            className="clear-output-btn group"
            title="Clear output and input"
          >
            <Eraser size={14} className="text-[#2563eb] group-hover:text-[#1d4ed8]" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Optional stdin input */}
      {showInput && (
        <div className="px-4 py-3 border-b border-[#e5e7eb] dark:border-dark-border bg-[#fafafa] dark:bg-[#252526]/50">
          <label htmlFor="program-input" className="block text-xs font-semibold uppercase tracking-wide text-[#6b7280] dark:text-gray-400 mb-2">
            Input
          </label>
          <textarea
            id="program-input"
            value={stdin}
            onChange={(e) => onStdinChange(e.target.value)}
            placeholder="Enter input for your program (stdin)…"
            spellCheck={false}
            className="w-full min-h-[72px] max-h-[120px] resize-y rounded-lg border border-[#d1d5db] dark:border-dark-border bg-white dark:bg-[#1e1e1e] px-3 py-2 text-sm font-mono text-[#1f2937] dark:text-gray-200 placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30 focus:border-[#2563eb]"
          />
          <p className="mt-1.5 text-[11px] text-[#9ca3af] dark:text-gray-500">
            Values typed here are passed as standard input when you run the program.
          </p>
        </div>
      )}

      {/* Console / preview area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 bg-white dark:bg-[#1e1e1e] min-h-0 flex flex-col gap-3 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
        {isRunning ? (
          <div className="flex items-center gap-2 text-[#6b7280] dark:text-gray-400 text-sm">
            <Loader2 size={16} className="animate-spin text-[#2563eb]" />
            Running…
          </div>
        ) : (
          <>
            {/* Optional HTML preview */}
            {previewHtml && (
              <div className="flex flex-col gap-2 flex-shrink-0">
                <span className="text-xs font-semibold text-[#6b7280] dark:text-gray-400 uppercase tracking-wide">Preview</span>
                <iframe
                  title="Web preview"
                  srcDoc={previewHtml}
                  sandbox="allow-scripts allow-modals allow-forms"
                  className="w-full h-[220px] rounded-lg border border-[#e5e7eb] dark:border-dark-border bg-white"
                />
              </div>
            )}
            {/* Error or output */}
            {error ? (
              <pre className="programiz-output flex-1 text-red-500" style={{ whiteSpace: 'pre-wrap' }}>{error}</pre>
            ) : output ? (
              renderOutput()
            ) : !previewHtml ? (
              <p className="text-sm text-[#9ca3af] dark:text-gray-500 italic">Program output will appear here after you click Run.</p>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
};

export default OutputPanel;

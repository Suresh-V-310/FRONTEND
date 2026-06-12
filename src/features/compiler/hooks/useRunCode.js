import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { compilerService } from '../services/compilerService';
import { buildWebPreviewDocument } from '../../languages/web/buildPreview';
import { formatExecutionOutput, buildConsoleDisplay, SUCCESS_MESSAGE, cleanExecutionPaths } from '../utils/formatOutput';
import { interleaveInputsAndOutput } from '../utils/codeNeedsStdin.js';

/**
 * Hook to run code and manage output state.
 * Returns an object with `run` to execute code and `clearAll` to reset UI.
 */
export function useRunCode({
  activeTab,
  stdin,
  isRunning,
  setOutput,
  setPreviewHtml,
  clearOutput,
  setIsRunning,
  setImage,
}) {
  // Execute code
  const run = useCallback(async () => {
    if (!activeTab || isRunning) return;

    setIsRunning(true);
    setOutput('');
    setPreviewHtml(null);
    clearOutput();
    if (setImage) {
      setImage(null);
    }

    try {
      if (activeTab.kind === 'web') {
        const doc = buildWebPreviewDocument(activeTab.files);
        setPreviewHtml(doc);
        setOutput(SUCCESS_MESSAGE);
        return;
      }

      const fileMap = activeTab.files || {};
      const fileCount = Object.keys(fileMap).length;
      const isMultiFileProject = activeTab.kind === 'project' && fileCount > 1;

      const { data } = await compilerService.runCode({
        language: activeTab.language,
        code: fileMap[activeTab.activeFile] ?? activeTab.code,
        files: isMultiFileProject ? fileMap : undefined,
        stdin,
      });

      if (setImage && data.result?.image) {
        setImage(data.result.image);
      }

      let programOutput = formatExecutionOutput(data.result, activeTab.language);
      if (activeTab.kind !== 'web' && stdin) {
        const inputsList = stdin.split('\n');
        programOutput = interleaveInputsAndOutput(
          programOutput,
          inputsList,
          activeTab.files?.[activeTab.activeFile] ?? activeTab.code,
          activeTab.language
        );
      }

      const display = buildConsoleDisplay(programOutput);
      // Determine if execution should be considered successful.
      const isSuccess = data.result.success;
      const baseOutput = display || (isSuccess ? '' : 'Execution failed');
      const finalOutput = isSuccess ? (baseOutput ? `${baseOutput}\n\n${SUCCESS_MESSAGE}` : SUCCESS_MESSAGE) : baseOutput;
      setOutput(finalOutput);
    } catch (error) {
      if (setImage && error.response?.data?.result?.image) {
        setImage(error.response.data.result.image);
      }
      const lineInfo = error.response?.data?.line ?? error.line;
      const rawMsg = error.response?.data?.message || error.message || 'Failed to run code';
      const cleanMsg = cleanExecutionPaths(rawMsg);
      const errorMsg = `${cleanMsg}${lineInfo ? ` (line ${lineInfo})` : ''}`;
      setOutput(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsRunning(false);
    }
  }, [activeTab, stdin, isRunning, setOutput, setPreviewHtml, clearOutput, setIsRunning, setImage]);

  // Clear all UI states including errors
  const clearAll = () => {
    clearOutput();
    setOutput('');
    setPreviewHtml(null);
    setIsRunning(false);
    if (setImage) {
      setImage(null);
    }
  };

  return { run, clearAll };
}

import { useRef, useEffect, useState } from 'react';
import { Loader2, Eraser, Play, Maximize2, Minimize2 } from 'lucide-react';
import toast from 'react-hot-toast';
import SQLResultsTable from '../../../components/SQLResultsTable.jsx';

/**
 * Console output merged with dynamic stdin inputs in a single page
 */
const OutputPanel = ({
  output,
  onClear,
  isRunning,
  previewHtml,
  isPromptVisible = false,
  requiredCount = 0,
  inputValues = [],
  onInputChange,
  onRun,
  language,
  image,
}) => {
  const scrollRef = useRef(null);
  const previewContainerRef = useRef(null);
  const sqlContainerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSqlFullscreen, setIsSqlFullscreen] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [output, previewHtml, isRunning, isPromptVisible]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const activeElement =
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement;

      setIsFullscreen(activeElement === previewContainerRef.current);
      setIsSqlFullscreen(activeElement === sqlContainerRef.current);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  const handleFullscreen = () => {
    const container = previewContainerRef.current;
    if (!container) return;

    if (container.requestFullscreen) {
      container.requestFullscreen().catch((err) => {
        toast.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else if (container.webkitRequestFullscreen) { /* Safari */
      container.webkitRequestFullscreen().catch((err) => {
        toast.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else if (container.mozRequestFullScreen) { /* Firefox */
      container.mozRequestFullScreen().catch((err) => {
        toast.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else if (container.msRequestFullscreen) { /* IE11 */
      container.msRequestFullscreen().catch((err) => {
        toast.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      toast.error('Fullscreen mode is not supported by your browser.');
    }
  };

  const handleExitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen().catch(() => {});
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen().catch(() => {});
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen().catch(() => {});
    }
  };

  const handleSqlFullscreen = () => {
    const container = sqlContainerRef.current;
    if (!container) return;

    if (!isSqlFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen().catch((err) => {
          toast.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
      } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen().catch(() => {});
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen().catch(() => {});
      }
    }
  };


  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#1e1e1e] border-l border-[#e5e7eb] dark:border-dark-border">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#e5e7eb] dark:border-dark-border bg-[#f9fafb] dark:bg-[#252526] flex-shrink-0">
        <span className="text-sm font-semibold text-[#374151] dark:text-gray-200">
          Output
        </span>
        <div className="flex items-center gap-2">
          {previewHtml && (
            <button
              type="button"
              onClick={handleFullscreen}
              className="clear-output-btn group"
              title="Full screen preview"
            >
              <Maximize2 size={14} className="text-[#2563eb] group-hover:scale-110 transition-transform" />
              <span>Full Screen</span>
            </button>
          )}
          {language === 'sql' && output && (
            <button
              type="button"
              onClick={handleSqlFullscreen}
              className="clear-output-btn group"
              title={isSqlFullscreen ? 'Exit Full Screen' : 'Full Screen'}
            >
              {isSqlFullscreen ? (
                <>
                  <Minimize2 size={14} className="text-[#2563eb] group-hover:scale-110 transition-transform" />
                  <span>Exit Full Screen</span>
                </>
              ) : (
                <>
                  <Maximize2 size={14} className="text-[#2563eb] group-hover:scale-110 transition-transform" />
                  <span>Full Screen</span>
                </>
              )}
            </button>
          )}
          <button
            type="button"
            onClick={onClear}
            className="clear-output-btn group"
            title="Clear console"
          >
            <Eraser size={14} className="text-[#2563eb] group-hover:text-[#1d4ed8]" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Main Container - Merged Scrollable View */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-auto p-4 font-mono text-sm bg-[#fafafa] dark:bg-[#1a1a1a] flex flex-col gap-4 min-h-0 scroll-smooth"
      >
        {/* Render Inputs if requiredCount > 0 and isPromptVisible */}
        {requiredCount > 0 && isPromptVisible && (
          <div className="flex flex-col gap-4 p-4 rounded-xl border border-[#e5e7eb] dark:border-dark-border bg-white dark:bg-[#1e1e1e] shadow-sm animate-fadeIn flex-shrink-0 font-sans">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#4b5563] dark:text-gray-400">
                Program Inputs ({requiredCount})
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ef4444]/10 text-[#ef4444] dark:text-red-400 font-medium">
                Required
              </span>
            </div>
            
            <div className="flex flex-col gap-3">
              {Array.from({ length: requiredCount }).map((_, idx) => (
                <div key={idx} className="flex flex-col gap-1.5">
                  <label className="text-xs text-[#6b7280] dark:text-gray-400 select-none">
                    Input Value {idx + 1}
                  </label>
                  <input
                    type="text"
                    value={inputValues[idx] || ''}
                    onChange={(e) => onInputChange(idx, e.target.value)}
                    placeholder={`Enter value for input ${idx + 1}...`}
                    autoFocus={idx === 0}
                    className="w-full px-3 py-2 rounded-lg border border-[#d1d5db] dark:border-dark-border bg-transparent text-[#1f2937] dark:text-gray-100 placeholder:text-[#9ca3af] dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent transition-all font-mono text-sm"
                  />
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={onRun}
              disabled={isRunning}
              className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] active:bg-[#1e40af] disabled:opacity-60 text-white font-semibold text-sm transition-colors shadow-sm"
            >
              {isRunning ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Running…
                </>
              ) : (
                <>
                  <Play size={14} fill="currentColor" />
                  Run Code
                </>
              )}
            </button>
          </div>
        )}

        {/* Output Text / Loading / Initial Message */}
        <div className="flex-1 min-h-0">
          {isRunning ? (
            (!isPromptVisible || output) && (
              <div className="flex items-center gap-2 text-[#6b7280] dark:text-gray-400">
                <Loader2 size={16} className="animate-spin text-[#2563eb]" />
                Running…
              </div>
            )
          ) : (
            <>
              {previewHtml && (
                <div
                  ref={previewContainerRef}
                  className={`web-preview-container mb-4 relative ${
                    isFullscreen ? 'w-full h-full' : ''
                  }`}
                >
                  <iframe
                    title="Web preview"
                    srcDoc={previewHtml}
                    sandbox="allow-scripts allow-modals"
                    className={`w-full bg-white transition-all duration-300 ${
                      isFullscreen
                        ? 'h-full border-none rounded-none'
                        : 'h-[250px] rounded-xl border border-[#e5e7eb] dark:border-dark-border shadow-sm'
                    }`}
                  />
                  {isFullscreen && (
                    <button
                      type="button"
                      onClick={handleExitFullscreen}
                      className="absolute top-4 right-4 z-[10000] flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 active:scale-[0.98] transition-all duration-200 shadow-lg border border-red-700"
                      title="Exit Full Screen"
                    >
                      <Minimize2 size={14} />
                      <span>Exit Full Screen</span>
                    </button>
                  )}
                </div>
              )}
              {image && (
                <div className="matplotlib-plot-container mb-4 p-2 bg-white dark:bg-[#1e1e1e] rounded-xl border border-[#e5e7eb] dark:border-dark-border shadow-sm max-w-full flex justify-center">
                  <img
                    src={image}
                    alt="Matplotlib Plot"
                    className="max-h-[350px] max-w-full object-contain rounded-lg"
                  />
                </div>
              )}
              {output ? (
                language === 'sql' ? (
                  <div
                    ref={sqlContainerRef}
                    className={`w-full relative ${
                      isSqlFullscreen
                        ? 'h-screen bg-white dark:bg-[#1e1e1e] p-6 overflow-auto z-[9999]'
                        : ''
                    }`}
                  >
                    <SQLResultsTable output={output} isFullScreen={isSqlFullscreen} />
                    {isSqlFullscreen && (
                      <button
                        type="button"
                        onClick={handleExitFullscreen}
                        className="absolute top-4 right-4 z-[10000] flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 active:scale-[0.98] transition-all duration-200 shadow-lg border border-red-700"
                        title="Exit Full Screen"
                      >
                        <Minimize2 size={14} />
                        <span>Exit Full Screen</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <pre className="programiz-output whitespace-pre-wrap break-words m-0 text-[#1f2937] dark:text-gray-200 leading-relaxed font-mono">
                    {output}
                  </pre>
                )
              ) : !previewHtml ? (
                <div className="flex flex-col items-center justify-center py-10 text-center text-[#9ca3af] dark:text-gray-500 gap-1.5 font-sans">
                  <span className="text-sm font-medium">
                    {requiredCount > 0 && !isPromptVisible
                      ? 'This program requires inputs. Click Run to configure.'
                      : 'Run your program to see output here.'}
                  </span>
                  <span className="text-xs text-[#9ca3af]/80 dark:text-gray-600">
                    {requiredCount > 0 && !isPromptVisible
                      ? 'Click the Run button to provide values.'
                      : 'Console output will be displayed below code compilation.'}
                  </span>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OutputPanel;

export const SUCCESS_MESSAGE = '=== Code Execution Successful ===';

/**
 * Filter out verbose JVM/build warnings from the compiler/runtime output.
 */
export function filterCompilerWarnings(text) {
  if (!text) return '';
  const lines = text.split('\n');
  const filteredLines = lines.filter((line) => {
    const trimmed = line.trim();
    if (trimmed.includes('OpenJDK 64-Bit Server VM warning') || trimmed.includes('-Xverify:none') || trimmed.includes('-noverify')) {
      return false;
    }
    if (trimmed.includes('Info: Compiling with sound null safety.')) {
      return false;
    }
    if (trimmed.startsWith('Generated: ') || trimmed.startsWith('Compiled: ') || trimmed.includes('box/main.exe') || trimmed.includes('Program.exe')) {
      return false;
    }
    if (trimmed === 'Note: Recompile with -Xlint:unchecked for details.' || trimmed === 'Note: Some input files use unchecked or unsafe operations.') {
      return false;
    }
    if (trimmed.startsWith('[Online Compiler]')) {
      return false;
    }
    if (trimmed.startsWith('npm ') || trimmed.startsWith('added ') || trimmed.startsWith('removed ') || trimmed.startsWith('audited ') || trimmed.startsWith('found ') || trimmed.startsWith('up to date') || trimmed.includes('npm notice')) {
      return false;
    }
    if (trimmed.toLowerCase().includes('docker build') || trimmed.toLowerCase().includes('docker run') || trimmed.toLowerCase().includes('docker image') || trimmed.toLowerCase().includes('docker daemon') || trimmed.toLowerCase().includes('docker volume')) {
      return false;
    }
    if (trimmed.toLowerCase().includes('pip install') || trimmed.toLowerCase().includes('requirement already satisfied') || trimmed.toLowerCase().includes('successfully installed')) {
      return false;
    }
    return true;
  });
  return filteredLines.join('\n');
}

/**
 * Sanitizes directories, temp folder paths, container directories, and internal details from error outputs.
 */
export function cleanExecutionPaths(text) {
  if (!text) return '';
  
  let cleaned = text;

  // Remove Windows temp paths (e.g. C:\Users\Admin\AppData\Local\Temp\code-xxxxx\)
  cleaned = cleaned.replace(/[a-zA-Z]:\\Users\\[^\\]+\\AppData\\Local\\Temp\\(?:code|python|javascript|typescript|java|c|cpp|go|rust|php|ruby|perl|kotlin|swift|csharp|r|matlab|dart|scala|bash|sql)-[^\\]+\\/gi, '');
  cleaned = cleaned.replace(/[a-zA-Z]:\\Users\\[^\\]+\\AppData\\Local\\Temp\\code-[^\\]+\\/gi, '');
  cleaned = cleaned.replace(/[a-zA-Z]:\\Users\\[^\\]+\\AppData\\Local\\Temp\\[^\\]+\\/gi, '');

  // Remove Linux/macOS temp paths (e.g. /tmp/code-xxxxx/)
  cleaned = cleaned.replace(/\/tmp\/(?:code|python|javascript|typescript|java|c|cpp|go|rust|php|ruby|perl|kotlin|swift|csharp|r|matlab|dart|scala|bash|sql)-[^\/]+\//gi, '');
  cleaned = cleaned.replace(/\/tmp\/code-[^\/]+\//gi, '');
  cleaned = cleaned.replace(/\/tmp\/[^\/]+\//gi, '');

  // Remove standard Docker mount paths
  cleaned = cleaned.replace(/\/app\/code\//gi, '');
  cleaned = cleaned.replace(/\/app\//gi, '');
  cleaned = cleaned.replace(/\/box\//gi, '');

  // Remove generic absolute paths leading up to known source filenames
  cleaned = cleaned.replace(/([a-zA-Z]:\\(?:[^\\]+\\)+|\/(?:[^\/]+\/)+)?(main\.(?:py|js|ts|c|cpp|go|rs|php|rb|pl|swift|R|m|dart|scala)|Main\.(?:java|kt|scala)|Program\.cs|script\.(?:sh|sql))/gi, '$2');

  return cleaned;
}

/**
 * Program stdout only for successful runs, or cleanly formatted user-friendly errors for failures.
 */
export function formatExecutionOutput(result, language) {
  if (result.errorType === 'BLOCKED_LIBRARY') {
    const suggestions = Array.isArray(result.suggestion) ? result.suggestion : [];
    return `${result.message}\n\nSuggestions:\n${suggestions.map(s => `✔ ${s}`).join('\n')}`;
  }

  if (result.error || (result.success === false)) {
    const rawStderr = result.stderr || '';
    const rawError = result.error || '';
    const rawCompile = result.compileOutput || '';

    // Sanitize warning outputs
    const stderr = cleanExecutionPaths(filterCompilerWarnings(rawStderr));
    const errorMsg = cleanExecutionPaths(filterCompilerWarnings(rawError));
    const compileOutput = cleanExecutionPaths(filterCompilerWarnings(rawCompile));
    const line = result.line;

    // Python-specific syntax/runtime error parser
    if (language === 'python') {
      if (stderr.includes('Traceback') || stderr.includes('SyntaxError') || stderr.includes('Error:')) {
        const lines = stderr.split('\n').map(l => l.trim()).filter(Boolean);
        let lastLine = lines[lines.length - 1] || '';
        if (lastLine.startsWith('^') && lines.length > 1) {
          lastLine = lines[lines.length - 2];
        }

        const match = lastLine.match(/^([a-zA-Z0-9_]+Error|SyntaxError|NameError|TypeError|ValueError|IndexError|KeyError|AttributeError|ImportError|ModuleNotFoundError|ZeroDivisionError):\s*(.*)$/);
        if (match) {
          const errorType = match[1];
          let errMsg = match[2];
          errMsg = errMsg.replace(/\(detected at line \d+\)/i, '').trim();
          
          if (line !== undefined) {
            return `${errorType} at line ${line}:\n${errMsg}`;
          }
          return `${errorType}:\n${errMsg}`;
        }
      }
    }

    // C/C++ GCC error parser
    if (language === 'c' || language === 'cpp') {
      const match = stderr.match(/(?:main\.[a-z]+|helper\.[a-z]+):(\d+):(?:\d+:)?\s*(error|warning):\s*(.*)/i);
      if (match) {
        const lineNum = match[1];
        const type = match[2];
        const msg = match[3];
        const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);
        return `${capitalizedType} at line ${lineNum}:\n${msg}`;
      }
    }

    // Java compiler error parser
    if (language === 'java') {
      const match = stderr.match(/(?:Main\.java|Main):(\d+):\s*(error|warning):\s*(.*)/i);
      if (match) {
        const lineNum = match[1];
        const type = match[2];
        const msg = match[3];
        const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);
        return `${capitalizedType} at line ${lineNum}:\n${msg}`;
      }
    }

    // JavaScript / TypeScript error parser
    if (language === 'javascript' || language === 'typescript') {
      const errMatch = stderr.match(/([a-zA-Z0-9_]+Error|Error):\s*(.*)/);
      if (errMatch) {
        const errorType = errMatch[1];
        const errMsg = errMatch[2];
        if (line !== undefined) {
          return `${errorType} at line ${line}:\n${errMsg}`;
        }
        return `${errorType}:\n${errMsg}`;
      }
    }

    // Fallback: If line number is known, show a clean generic error format
    if (line !== undefined) {
      let errorType = 'Error';
      let message = errorMsg;
      if (errorMsg.includes(':')) {
        errorType = errorMsg.split(':')[0].trim();
        message = errorMsg.substring(errorMsg.indexOf(':') + 1).trim();
      }
      message = message.replace(/near line \d+:\s*/i, '').trim();
      return `${errorType} at line ${line}:\n${message}`;
    }

    // Default generic error fallback, joined with sanitized output parts
    const parts = [];
    if (errorMsg) parts.push(errorMsg);
    if (stderr && stderr !== errorMsg) parts.push(stderr);
    if (compileOutput) parts.push(compileOutput);
    return parts.join('\n');
  }

  const stdout = filterCompilerWarnings(result.stdout || '');
  if (stdout.trim()) {
    return stdout;
  }

  const stderr = filterCompilerWarnings(result.stderr || '');
  return stderr.trim() || '';
}

/**
 * Console shows program output only.
 */
export function buildConsoleDisplay(programOutput) {
  if (!programOutput) return '';
  // Trim leading newlines/carriage returns, but preserve leading spaces/tabs of the first line
  const cleaned = programOutput.replace(/^[\r\n]+/, '');
  // Trim trailing whitespace
  return cleaned.replace(/\s+$/, '');
}

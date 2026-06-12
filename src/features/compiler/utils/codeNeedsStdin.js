/** Heuristics: show stdin input only when code likely reads from stdin */
const STDIN_PATTERNS = [
  /\binput\s*\(/,
  /\bscanf\s*\(/,
  /\bgets\s*\(/,
  /\bgetchar\s*\(/,
  /\bfgets\s*\(/,
  /\bcin\s*>>/,
  /\breadLine\s*\(/,
  /\breadline\b/i,
  /Console\.ReadLine/,
  /\bfmt\.Scan/,
  /\bScanner\s*\(/,
  /\bstdin\.read/i,
  /io\.read/i,
  /read\.std/i,
];

export function codeNeedsStdin(code) {
  if (!code?.trim()) return false;
  return STDIN_PATTERNS.some((pattern) => pattern.test(code));
}

/**
 * Strips comments from code based on language
 */
function stripComments(code, language) {
  if (!code) return '';
  
  // C-style comments (C, C++, Java, Kotlin, C#, JS, TS, Go, Rust, Scala, Dart)
  const cStyleLanguages = ['c', 'cpp', 'java', 'kotlin', 'csharp', 'javascript', 'typescript', 'go', 'rust', 'scala', 'dart'];
  
  if (cStyleLanguages.includes(language)) {
    return code
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*/g, '');
  }
  
  // Python, Ruby
  if (language === 'python' || language === 'ruby') {
    return code
      .replace(/#.*/g, '')
      .replace(/"""[\s\S]*?"""/g, '')
      .replace(/'''[\s\S]*?'''/g, '');
  }
  
  // SQL
  if (language === 'sql') {
    return code
      .replace(/--.*/g, '')
      .replace(/\/\*[\s\S]*?\*\//g, '');
  }
  
  return code;
}

/**
 * Detects the number of input calls in the code
 */
export function countRequiredInputs(code, language) {
  if (!code) return 0;
  
  const cleanCode = stripComments(code, language);
  
  switch (language) {
    case 'python': {
      // Count python input() or raw_input()
      const matches = cleanCode.match(/\b(input|raw_input)\s*\(/g);
      const inputCount = matches ? matches.length : 0;
      
      // Also check for sys.stdin.readline() or sys.stdin.readlines()
      const sysReadlines = cleanCode.match(/\bsys\.stdin\.readline\s*\(/g);
      const sysReadlineCount = sysReadlines ? sysReadlines.length : 0;
      
      if (cleanCode.includes('sys.stdin.read')) {
        return Math.max(inputCount + sysReadlineCount, 1);
      }
      
      return inputCount + sysReadlineCount;
    }
    
    case 'c':
    case 'cpp': {
      let count = 0;
      
      // 1. scanf(...)
      // Match scanf with format string: scanf("...", &a, &b)
      const scanfRegex = /\bscanf\s*\(\s*"([^"]*)"/g;
      let match;
      while ((match = scanfRegex.exec(cleanCode)) !== null) {
        const formatStr = match[1];
        const specifiers = formatStr.match(/%[^%]/g);
        if (specifiers) {
          count += specifiers.length;
        }
      }
      
      // 2. cin >> a >> b;
      const cinRegex = /\bcin\s*(>>\s*[a-zA-Z0-9_]+(\[[^\]]+\])?)+/g;
      let cinMatch;
      while ((cinMatch = cinRegex.exec(cleanCode)) !== null) {
        const statement = cinMatch[0];
        const extractions = statement.match(/>>/g);
        if (extractions) {
          count += extractions.length;
        }
      }
      
      // 3. getchar(), gets(), fgets()
      const getcharMatches = cleanCode.match(/\b(getchar|gets)\s*\(/g);
      if (getcharMatches) {
        count += getcharMatches.length;
      }
      
      const fgetsMatches = cleanCode.match(/\bfgets\s*\(/g);
      if (fgetsMatches) {
        count += fgetsMatches.length;
      }
      
      return count;
    }
    
    case 'java': {
      let count = 0;
      
      // Scanner methods
      const scannerRegex = /\b\.\s*next(Line|Int|Double|Float|Long|Byte|Short|Boolean|BigInteger|BigDecimal)?\s*\(/g;
      const scannerMatches = cleanCode.match(scannerRegex);
      if (scannerMatches) {
        count += scannerMatches.length;
      }
      
      // BufferedReader
      const brRegex = /\b\.\s*readLine\s*\(/g;
      const brMatches = cleanCode.match(brRegex);
      if (brMatches) {
        count += brMatches.length;
      }
      
      return count;
    }
    
    case 'kotlin': {
      const matches = cleanCode.match(/\b(readln|readLine|readlnOrNull)\s*\(/g);
      return matches ? matches.length : 0;
    }
    
    case 'csharp': {
      const matches = cleanCode.match(/\bConsole\s*\.\s*(ReadLine|Read)\s*\(/g);
      return matches ? matches.length : 0;
    }
    
    case 'go': {
      let count = 0;
      
      // fmt.Scan or fmt.Scanln
      const scanRegex = /\bfmt\s*\.\s*(Scan|Scanln)\s*\(([^)]+)\)/g;
      let match;
      while ((match = scanRegex.exec(cleanCode)) !== null) {
        const args = match[2];
        const argCount = args.split(',').filter(arg => arg.trim()).length;
        count += argCount;
      }
      
      // fmt.Scanf
      const scanfRegex = /\bfmt\s*\.\s*Scanf\s*\(\s*"([^"]*)"/g;
      let scanfMatch;
      while ((scanfMatch = scanfRegex.exec(cleanCode)) !== null) {
        const formatStr = scanfMatch[1];
        const specifiers = formatStr.match(/%[^%]/g);
        if (specifiers) {
          count += specifiers.length;
        }
      }
      
      return count;
    }
    
    case 'javascript':
    case 'typescript': {
      const matches = cleanCode.match(/\breadline\s*\(/ig);
      return matches ? matches.length : 0;
    }
    
    case 'rust': {
      const matches = cleanCode.match(/\.read_line\s*\(/g);
      return matches ? matches.length : 0;
    }
    
    case 'swift': {
      const matches = cleanCode.match(/\breadLine\s*\(/g);
      return matches ? matches.length : 0;
    }
    
    case 'ruby': {
      const matches = cleanCode.match(/\bgets\b/g);
      return matches ? matches.length : 0;
    }
    
    case 'dart': {
      const matches = cleanCode.match(/\breadLineSync\s*\(/g);
      return matches ? matches.length : 0;
    }
    
    case 'scala': {
      const matches = cleanCode.match(/\b(readLine|readInt|readDouble|readFloat|readLong|readShort|readByte|readBoolean|readChar)\s*\(/g);
      return matches ? matches.length : 0;
    }
    
    default:
      return 0;
  }
}

/**
 * Returns the exact input count required for the program, with fallback
 */
export function getRequiredInputCount(code, language) {
  if (!code || language === 'web') return 0;
  const count = countRequiredInputs(code, language);
  if (count === 0 && codeNeedsStdin(code)) {
    return 1;
  }
  return count;
}

/**
 * Extracts prompt string literals in order of appearance in the code
 */
export function extractPrompts(code, language) {
  if (!code) return [];
  
  const cleanCode = stripComments(code, language);
  const prompts = [];
  
  let regex;
  if (language === 'python') {
    regex = /input\(\s*(["'])(.*?)\1\s*\)/g;
  } else if (language === 'c' || language === 'cpp') {
    regex = /(?:cout\s*<<\s*|printf\s*\(\s*)(["'])(.*?)\1/g;
  } else if (language === 'java') {
    regex = /System\.out\.print(?:ln)?\(\s*(["'])(.*?)\1/g;
  } else if (language === 'csharp') {
    regex = /Console\.Write(?:Line)?\(\s*(["'])(.*?)\1/g;
  } else if (language === 'go') {
    regex = /fmt\.Print(?:f|ln)?\(\s*(["'])(.*?)\1/g;
  } else if (language === 'javascript' || language === 'typescript') {
    regex = /(?:console\.log|readline)\(\s*(["'])(.*?)\1/g;
  } else if (language === 'rust') {
    regex = /print(?:ln)?!\(\s*(["'])(.*?)\1/g;
  } else if (language === 'ruby') {
    regex = /(?:print|puts)(?:\s*\(?\s*)(["'])(.*?)\1/g;
  } else if (language === 'swift') {
    regex = /print\(\s*(["'])(.*?)\1/g;
  } else if (language === 'scala') {
    regex = /print(?:ln)?\(\s*(["'])(.*?)\1/g;
  }
  
  if (regex) {
    let match;
    while ((match = regex.exec(cleanCode)) !== null) {
      prompts.push(match[2]);
    }
  }
  
  return prompts;
}

/**
 * Interleaves user inputs into the program stdout to look like an interactive terminal session
 */
export function interleaveInputsAndOutput(stdout, inputs, code, language) {
  if (!stdout) {
    return inputs.filter(val => val !== '').join('\n');
  }
  if (!inputs || inputs.length === 0 || inputs.every(val => val === '')) {
    return stdout;
  }

  const prompts = extractPrompts(code, language);
  
  let result = '';
  let currentOffset = 0;
  let inputIdx = 0;

  for (let i = 0; i < prompts.length && inputIdx < inputs.length; i++) {
    const prompt = prompts[i];
    if (!prompt) continue;

    // Find the prompt in stdout starting from currentOffset
    let index = stdout.indexOf(prompt, currentOffset);
    let matchedPrompt = prompt;

    if (index === -1) {
      const translatedPrompt = prompt
        .replace(/\\n/g, '\n')
        .replace(/\\t/g, '\t');
      index = stdout.indexOf(translatedPrompt, currentOffset);
      matchedPrompt = translatedPrompt;
    }

    if (index !== -1) {
      const promptEnd = index + matchedPrompt.length;
      result += stdout.slice(currentOffset, promptEnd);
      
      const userVal = inputs[inputIdx] ?? '';
      result += userVal + '\n';
      inputIdx++;
      
      currentOffset = promptEnd;
    }
  }

  if (inputIdx < inputs.length) {
    const remainingInputs = inputs.slice(inputIdx).filter(val => val !== '').join('\n');
    if (remainingInputs) {
      // Append remaining inputs before the rest of the output if we are still at offset 0,
      // otherwise at the current offset.
      if (currentOffset === 0) {
        result += remainingInputs + '\n';
      } else {
        result += remainingInputs + '\n';
      }
    }
  }

  result += stdout.slice(currentOffset);
  return result;
}



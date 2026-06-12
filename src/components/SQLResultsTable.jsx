import { useState, useMemo, useRef, useEffect } from 'react';
import { Database, Table, Copy, Check, AlertCircle, Info, Terminal, Maximize2, Minimize2 } from 'lucide-react';

// Heuristic to check if a row looks like a new header
const isLikelyHeader = (cells, currentHeaders) => {
  if (cells.length === 0) return false;

  // Every cell must be a valid SQL identifier (alphanumeric + underscores, starting with letter/underscore)
  const isIdentifier = (val) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(val);
  if (!cells.every(isIdentifier)) return false;

  // Permutation of current headers (header swap)
  const isPermutation = cells.length === currentHeaders.length &&
    cells.every(c => currentHeaders.some(h => h.toLowerCase() === c.toLowerCase()));
  if (isPermutation) return true;

  // Common SQL column names and aliases
  const commonColumns = new Set([
    'id', 'name', 'title', 'count', 'sum', 'avg', 'min', 'max', 'total',
    'message', 'value', 'first_name', 'last_name', 'email', 'created_at',
    'status', 'type', 'description', 'amount', 'price', 'quantity', 'date',
    'user_id', 'role', 'password', 'phone', 'address', 'city', 'country'
  ]);

  const matchesCommonColumn = cells.some(cell =>
    commonColumns.has(cell.toLowerCase())
  );

  return matchesCommonColumn;
};

/**
 * Parses raw SQL output string into structured blocks (tables, info messages, errors).
 * Handles:
 * - SQLite list-mode output (`|` separator)
 * - MySQL/SQLite table-mode/box-mode output (`+----+` borders, `│` vertical lines)
 * - TSV/CSV and double-space column-aligned mode output
 * - Command response messages, query summary status, and syntax errors
 */
const parseSQLOutput = (output) => {
  if (!output || typeof output !== 'string' || !output.trim()) {
    return [{ type: 'info', content: 'Query executed successfully (no results).' }];
  }

  const lines = output.split(/\r?\n/);
  const blocks = [];
  let currentTable = null;
  let currentMessages = [];

  const pushCurrentTable = () => {
    if (currentTable) {
      blocks.push(currentTable);
      currentTable = null;
    }
  };

  const pushMessages = () => {
    if (currentMessages.length > 0) {
      blocks.push({
        type: 'info',
        content: currentMessages.join('\n')
      });
      currentMessages = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === '') {
      pushCurrentTable();
      pushMessages();
      continue;
    }

    // Check for error lines
    const isError = /^(error|near line|sqlite error|exception|fail|warning|err:)/i.test(trimmed);
    if (isError) {
      pushCurrentTable();
      pushMessages();
      blocks.push({ type: 'error', content: trimmed });
      continue;
    }

    // Check for standard status/info lines
    const isInfo = /^(query ok|rows affected|\d+ row\(s\) affected|run time:)/i.test(trimmed);
    if (isInfo) {
      pushCurrentTable();
      pushMessages();
      blocks.push({ type: 'info', content: trimmed });
      continue;
    }

    // Check for boundary lines (e.g. +------+ or ----------)
    const isBoundary = /^[+\-=\s│┌┬┐├┼┤└┴┘─═┼╔╦╗╠╬╣╚╩╝\t:|]+$/.test(trimmed) &&
      (trimmed.includes('-') || trimmed.includes('═') || trimmed.includes('─') || trimmed.includes('+'));

    if (isBoundary) {
      // If we are in a table block and find a separator of dashes, it confirms the previous line was the header.
      if (currentTable && currentTable.rows.length === 0) {
        continue; // Keep the header as is
      }
      pushCurrentTable();
      pushMessages();
      continue;
    }

    // Determine the cells and separator for this line
    let cells = [];
    let sep = null;

    if (trimmed.includes('|')) {
      cells = line.split('|').map(c => c.trim());
      sep = '|';
    } else if (trimmed.includes('│')) {
      cells = line.split('│').map(c => c.trim());
      sep = '│';
    } else if (trimmed.includes('\t')) {
      cells = line.split('\t').map(c => c.trim());
      sep = '\t';
    } else if (/\s{2,}/.test(trimmed)) {
      cells = trimmed.split(/\s{2,}/).map(c => c.trim());
      sep = 'spaces';
    } else {
      cells = [trimmed];
      sep = 'none';
    }

    // Remove outer empty cells for grid tables (e.g. | col1 | col2 | -> split gives ['', 'col1', 'col2', ''])
    if (cells.length > 1) {
      if (cells[0] === '' && cells[cells.length - 1] === '') {
        cells = cells.slice(1, -1);
      }
    }

    // Check if it looks like a standard command log (like "Table created", "Index dropped")
    const isCommandLog = cells.length === 1 &&
      /^(table|view|index|trigger) (created|dropped|altered)|(insert|update|delete) \d+|success/i.test(cells[0]);

    if (isCommandLog) {
      pushCurrentTable();
      pushMessages();
      blocks.push({ type: 'info', content: cells[0] });
      continue;
    }

    // Initialize or append to the current table
    if (!currentTable) {
      currentTable = {
        type: 'table',
        headers: cells,
        rows: [],
        separator: sep
      };
    } else {
      const colCountMismatch = cells.length !== currentTable.headers.length;
      const isHeaderMatch = cells.join('|') === currentTable.headers.join('|');
      const likelyNewHeader = currentTable.rows.length > 0 && isLikelyHeader(cells, currentTable.headers);

      if (colCountMismatch || isHeaderMatch || likelyNewHeader) {
        pushCurrentTable();
        currentTable = {
          type: 'table',
          headers: cells,
          rows: [],
          separator: sep
        };
      } else {
        currentTable.rows.push(cells);
      }
    }
  }

  pushCurrentTable();
  pushMessages();

  // Cleanup: Convert empty tables or tables that only contain a status message into info blocks
  return blocks.map(b => {
    if (b.type === 'table' && b.rows.length === 0 && b.headers.length === 1) {
      return {
        type: 'info',
        content: b.headers[0]
      };
    }
    return b;
  });
};

/**
 * SQLResultsTable component displays SQL execution outputs.
 * Offers a premium database GUI feel, similar to modern database clients.
 */
const SQLResultsTable = ({ output, isFullScreen }) => {
  const [activeTab, setActiveTab] = useState('data'); // 'data' or 'messages'
  const [activeTableIdx, setActiveTableIdx] = useState(0);
  const [copiedIndex, setCopiedIndex] = useState(null); // null, 'json', or 'csv'

  const blocks = useMemo(() => parseSQLOutput(output), [output]);

  const tables = useMemo(() => blocks.filter(b => b.type === 'table'), [blocks]);
  const logs = useMemo(() => blocks.filter(b => b.type !== 'table'), [blocks]);

  const hasTables = tables.length > 0;
  const currentTab = hasTables ? activeTab : 'messages';

  const currentTableIdx = activeTableIdx >= tables.length ? 0 : activeTableIdx;
  const activeTable = tables[currentTableIdx];

  // Width calculations for the columns
  const columnWidths = useMemo(() => {
    if (!activeTable) return [];
    return activeTable.headers.map((header, colIdx) => {
      let maxWidth = header.length;
      activeTable.rows.forEach(row => {
        if (row[colIdx]) {
          maxWidth = Math.max(maxWidth, String(row[colIdx]).length);
        }
      });
      return Math.min(Math.max(maxWidth, 8), 50); // Minimum 8, capped at 50 characters
    });
  }, [activeTable]);

  // Copy helpers
  const handleCopyJSON = () => {
    if (!activeTable) return;
    const data = activeTable.rows.map(row => {
      const obj = {};
      activeTable.headers.forEach((h, i) => {
        const val = row[i];
        const isNull = val === undefined || val === null || val === '' || val === 'NULL' || val.toUpperCase() === 'NULL';
        obj[h] = isNull ? null : val;
      });
      return obj;
    });
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopiedIndex('json');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyCSV = () => {
    if (!activeTable) return;
    const csvContent = [
      activeTable.headers.join(','),
      ...activeTable.rows.map(row =>
        row.map(cell => {
          const isNull = cell === undefined || cell === null || cell === '' || cell === 'NULL' || cell.toUpperCase() === 'NULL';
          const val = isNull ? 'NULL' : cell;
          return `"${String(val).replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\n');
    navigator.clipboard.writeText(csvContent);
    setCopiedIndex('csv');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div
      className={`bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-dark-border rounded-xl shadow-sm overflow-hidden flex flex-col w-full font-sans select-none animate-fadeIn ${isFullScreen ? 'h-full' : ''
        }`}
    >
      {/* Top Header / Tab Switcher */}
      <div className="bg-gray-50 dark:bg-[#18181c] border-b border-gray-200 dark:border-dark-border px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex gap-2">
          {hasTables && (
            <button
              onClick={() => setActiveTab('data')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${currentTab === 'data'
                ? 'bg-[#2563eb] text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
                }`}
            >
              <Database size={14} />
              Data Output
            </button>
          )}
          <button
            onClick={() => setActiveTab('messages')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${currentTab === 'messages'
              ? 'bg-[#2563eb] text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
              }`}
          >
            <Terminal size={14} />
            Console Messages {logs.length > 0 && `(${logs.length})`}
          </button>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-mono">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Connected to SQLite Memory DB
        </div>
      </div>

      {/* Main Tab Views */}
      <div className="flex-1 min-h-0 bg-[#fafafa] dark:bg-[#1a1a1a]">
        {currentTab === 'data' && activeTable && (
          <div className="flex flex-col h-full">
            {/* Sub-tabs for multiple grids */}
            {tables.length > 1 && (
              <div className="flex flex-wrap gap-2 p-2 bg-gray-50/50 dark:bg-[#151518] border-b border-gray-100 dark:border-dark-border/40 overflow-x-auto select-none">
                {tables.map((t, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveTableIdx(idx)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium transition-all border ${currentTableIdx === idx
                      ? 'bg-white dark:bg-[#252526] border-gray-200 dark:border-dark-border text-[#2563eb] dark:text-blue-400 font-semibold shadow-xs'
                      : 'bg-transparent border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                  >
                    <Table size={12} />
                    Result Grid {idx + 1}
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">
                      ({t.rows.length} rows)
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Grid Header Panel */}
            <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-[#1e1e1e] border-b border-gray-100 dark:border-dark-border/30">
              <span className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider font-sans">
                {activeTable.rows.length} row{activeTable.rows.length !== 1 ? 's' : ''} × {activeTable.headers.length} column{activeTable.headers.length !== 1 ? 's' : ''}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyJSON}
                  className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-50 dark:bg-[#252526] border border-gray-200 dark:border-dark-border rounded hover:bg-gray-100 dark:hover:bg-white/5 transition-all active:scale-95"
                  title="Copy grid data as JSON array"
                >
                  {copiedIndex === 'json' ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                  {copiedIndex === 'json' ? 'Copied' : 'JSON'}
                </button>
                <button
                  onClick={handleCopyCSV}
                  className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-50 dark:bg-[#252526] border border-gray-200 dark:border-dark-border rounded hover:bg-gray-100 dark:hover:bg-white/5 transition-all active:scale-95"
                  title="Copy grid data as CSV"
                >
                  {copiedIndex === 'csv' ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                  {copiedIndex === 'csv' ? 'Copied' : 'CSV'}
                </button>
              </div>
            </div>

            {/* Grid Table */}
            <div className={`overflow-x-auto overflow-y-auto w-full border-b border-gray-200 dark:border-dark-border relative ${isFullScreen ? 'flex-1' : 'max-h-[350px]'
              }`}>
              <table className="w-full border-collapse text-left text-xs font-mono select-text">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-gray-100 dark:bg-[#2d2d30] border-b border-gray-300 dark:border-dark-border">
                    {activeTable.headers.map((header, idx) => (
                      <th
                        key={idx}
                        className="px-3 py-2.5 text-left font-bold text-gray-700 dark:text-gray-200 whitespace-nowrap select-none border-r border-gray-200 dark:border-dark-border last:border-r-0"
                        style={{
                          minWidth: `${Math.max(columnWidths[idx] * 8 + 32, 80)}px`,
                        }}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-[#3b82f6] text-[10px] font-semibold">#</span>
                          <span>{header}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-[#2a2a2d]">
                  {activeTable.rows.map((row, rowIdx) => (
                    <tr
                      key={rowIdx}
                      className={`hover:bg-[#3b82f6]/10 dark:hover:bg-[#3b82f6]/15 transition-colors duration-100 ${rowIdx % 2 === 0
                        ? 'bg-white dark:bg-[#1e1e1e]'
                        : 'bg-gray-50/30 dark:bg-[#232326]'
                        }`}
                    >
                      {row.map((cell, colIdx) => {
                        const cellStr = cell === undefined ? '' : String(cell);
                        const isNull = cellStr === '' || cellStr === 'NULL' || cellStr.toUpperCase() === 'NULL';
                        const displayVal = isNull ? 'NULL' : cellStr;

                        return (
                          <td
                            key={colIdx}
                            className={`px-3 py-2 break-all border-r border-gray-200 dark:border-[#2a2a2d] last:border-r-0 ${isNull
                              ? 'text-gray-400 dark:text-gray-500 italic font-sans font-medium'
                              : 'text-gray-800 dark:text-gray-300'
                              }`}
                            style={{
                              minWidth: `${Math.max(columnWidths[colIdx] * 8 + 32, 80)}px`,
                            }}
                            title={displayVal}
                          >
                            {isNull ? (
                              <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/5 text-[9px] uppercase font-bold tracking-wider text-red-500/80 dark:text-red-400/80">
                                null
                              </span>
                            ) : (
                              displayVal
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {currentTab === 'messages' && (
          <div className={`p-4 flex flex-col gap-3 overflow-y-auto bg-gray-50 dark:bg-[#151518] font-mono text-xs leading-relaxed ${isFullScreen ? 'flex-1' : 'max-h-[350px]'
            }`}>
            {logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400 dark:text-gray-500 font-sans gap-2">
                <Info size={20} className="text-[#3b82f6]" />
                <span className="font-semibold text-sm">No console messages or errors.</span>
                <span className="text-xs text-gray-400 dark:text-gray-600 text-center">Run your SQL query statements to see database responses.</span>
              </div>
            ) : (
              logs.map((log, idx) => {
                if (log.type === 'error') {
                  return (
                    <div
                      key={idx}
                      className="flex gap-2.5 p-3 rounded-lg border border-red-200 dark:border-red-950 bg-red-50/50 dark:bg-red-950/10 text-[#ef4444]"
                    >
                      <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                      <div className="whitespace-pre-wrap break-words">{log.content}</div>
                    </div>
                  );
                } else {
                  return (
                    <div
                      key={idx}
                      className="flex gap-2.5 p-3 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-[#1e1e1e] text-gray-600 dark:text-gray-300"
                    >
                      <Info size={16} className="mt-0.5 text-[#3b82f6] flex-shrink-0" />
                      <div className="whitespace-pre-wrap break-words">{log.content}</div>
                    </div>
                  );
                }
              })
            )}
          </div>
        )}
      </div>
      {/* Footer Info */}
      <div className="bg-gray-50 dark:bg-[#18181c] border-t border-gray-200 dark:border-dark-border px-4 py-2 flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400 font-sans select-none">
        <div className="flex items-center gap-1.5">
          <Database size={11} className="text-[#3b82f6]" />
          <span>💾 Database Session logs</span>
        </div>
        {currentTab === 'data' && activeTable && (
          <div>
            <span>Columns: {activeTable.headers.length} • Rows: {activeTable.rows.length}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SQLResultsTable;

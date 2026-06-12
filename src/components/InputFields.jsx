import React, { useRef } from 'react';

/**
 * InputFields component renders a list of input fields (e.g., stdin inputs) and
 * forwards changes to the parent via `onChange`. It also supports pressing
 * ENTER to move focus to the next field, mimicking a professional IDE form
 * flow.
 *
 * Props:
 *   fields: Array<{ name: string, placeholder: string, value: string }>
 *   onChange: (index: number, newValue: string) => void
 */
export default function InputFields({ fields, onChange }) {
  const refs = useRef([]);

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const nextIdx = idx + 1;
      if (refs.current[nextIdx]) {
        refs.current[nextIdx].focus();
      }
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {fields.map((field, idx) => (
        <textarea
          key={field.name}
          ref={el => (refs.current[idx] = el)}
          id={field.name}
          placeholder={field.placeholder}
          value={field.value}
          onChange={e => onChange(idx, e.target.value)}
          onKeyDown={e => handleKeyDown(e, idx)}
          rows={2}
          spellCheck={false}
          className="w-full resize-y rounded-lg border border-[#d1d5db] dark:border-dark-border bg-white dark:bg-[#1e1e1e] px-3 py-2 text-sm font-mono text-[#1f2937] dark:text-gray-200 placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/30 focus:border-[#2563eb]"
        />
      ))}
    </div>
  );
}

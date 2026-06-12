import { TOKEN_KEY } from '../config/app.js';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const removeToken = () => localStorage.removeItem(TOKEN_KEY);

const EDITOR_STATE_KEY = 'oc_editor_state';

export const saveEditorState = (state) => {
  localStorage.setItem(EDITOR_STATE_KEY, JSON.stringify(state));
};

export const loadEditorState = () => {
  try {
    const raw = localStorage.getItem(EDITOR_STATE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const clearEditorState = () => {
  localStorage.removeItem(EDITOR_STATE_KEY);
};

export const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const saveTheme = (theme) => localStorage.setItem('oc_theme', theme);
export const loadTheme = () => localStorage.getItem('oc_theme') || 'light';

export const saveFontSize = (size) => localStorage.setItem('oc_font_size', size);
export const loadFontSize = () =>
  parseInt(localStorage.getItem('oc_font_size') || '14', 10);

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

export const downloadCode = (code, filename) => {
  const blob = new Blob([code], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

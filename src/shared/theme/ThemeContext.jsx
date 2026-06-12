import { createContext, useContext, useState, useEffect } from 'react';
import { loadTheme, saveTheme, loadFontSize, saveFontSize } from '../utils/storage.js';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(loadTheme);
  const [fontSize, setFontSize] = useState(loadFontSize);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
    saveTheme(theme);
  }, [theme]);

  useEffect(() => {
    saveFontSize(fontSize);
  }, [fontSize]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        fontSize,
        setTheme,
        setFontSize,
        toggleTheme,
        isDark: theme === 'dark',
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};

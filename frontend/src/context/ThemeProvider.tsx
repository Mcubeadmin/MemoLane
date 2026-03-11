import React, { createContext, useContext, useEffect, useState } from 'react';

// TypeScript: define the shape of what this context provides
// In plain JS you'd skip this interface entirely
interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

// createContext needs a default value in TS
const ThemeContext = createContext<ThemeContextType>({
  isDark: true,
  toggleTheme: () => {},
});

// React.ReactNode = "anything React can render" (JSX, strings, etc.)
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState<boolean>(true); // start dark

  useEffect(() => {
    // Toggle the 'dark' class on <html> — Tailwind watches this
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook — same pattern as useAuth you already have
export const useTheme = () => useContext(ThemeContext);
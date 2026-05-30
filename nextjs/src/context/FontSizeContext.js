'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const FontSizeContext = createContext({ fontSize: 'medium', setFontSize: () => {} });

export function FontSizeProvider({ children }) {
  const [fontSize, setFontSizeState] = useState('medium');

  useEffect(() => {
    const saved = localStorage.getItem('fontSize') || 'medium';
    setFontSizeState(saved);
    document.documentElement.setAttribute('data-fontsize', saved);
  }, []);

  const setFontSize = (size) => {
    setFontSizeState(size);
    document.documentElement.setAttribute('data-fontsize', size);
    localStorage.setItem('fontSize', size);
  };

  return (
    <FontSizeContext.Provider value={{ fontSize, setFontSize }}>
      {children}
    </FontSizeContext.Provider>
  );
}

export function useFontSize() {
  return useContext(FontSizeContext);
}

export default FontSizeContext;

import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const theme = {
    isDarkMode,
    toggleDarkMode,
    colors: isDarkMode ? {
      // Dark theme colors
      background: '#1a1a1a',
      surface: '#2d2d2d',
      surfaceLight: '#3a3a3a',
      text: '#ffffff',
      textSecondary: '#b0b0b0',
      textMuted: '#888888',
      primary: '#A084E8',
      primaryLight: '#B899F0',
      accent: '#E7DDFF',
      border: '#404040',
      shadow: 'rgba(0,0,0,0.3)',
      gradient: 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)',
      sidebarGradient: 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 50%, #0f0f0f 100%)',
      cardBackground: '#2d2d2d',
      inputBackground: '#3a3a3a',
      success: '#28a745',
      warning: '#ffc107',
      danger: '#dc3545',
      info: '#17a2b8'
    } : {
      // Light theme colors
      background: '#f8f9fa',
      surface: '#ffffff',
      surfaceLight: '#f8f9fa',
      text: '#333333',
      textSecondary: '#666666',
      textMuted: '#888888',
      primary: '#A084E8',
      primaryLight: '#B899F0',
      accent: '#E7DDFF',
      border: '#e0e0e0',
      shadow: 'rgba(0,0,0,0.1)',
      gradient: 'linear-gradient(135deg, #E7DDFF 0%, #F5F2FF 50%, #FFFFFF 100%)',
      sidebarGradient: 'linear-gradient(135deg, #E7DDFF 0%, #F5F2FF 50%, #FFFFFF 100%)',
      cardBackground: '#ffffff',
      inputBackground: 'rgba(255, 255, 255, 0.9)',
      success: '#28a745',
      warning: '#ffc107',
      danger: '#dc3545',
      info: '#17a2b8'
    }
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};
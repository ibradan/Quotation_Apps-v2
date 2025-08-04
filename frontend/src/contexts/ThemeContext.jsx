import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

// Theme provider component
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [systemPreference, setSystemPreference] = useState('light');

  // Detect system theme preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemPreference(mediaQuery.matches ? 'dark' : 'light');

    const handleChange = (e) => {
      setSystemPreference(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Load saved theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme');
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      setTheme(savedTheme);
    } else {
      setTheme('system');
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    const effectiveTheme = theme === 'system' ? systemPreference : theme;
    
    // Remove existing theme classes
    document.documentElement.classList.remove('light-theme', 'dark-theme');
    
    // Add current theme class
    document.documentElement.classList.add(`${effectiveTheme}-theme`);
    
    // Set data attribute for CSS selectors
    document.documentElement.setAttribute('data-theme', effectiveTheme);
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', effectiveTheme === 'dark' ? '#1f1f1f' : '#ffffff');
    }
  }, [theme, systemPreference]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
    setTheme(newTheme);
    localStorage.setItem('app-theme', newTheme);
  };

  const setSpecificTheme = (newTheme) => {
    if (['light', 'dark', 'system'].includes(newTheme)) {
      setTheme(newTheme);
      localStorage.setItem('app-theme', newTheme);
    }
  };

  const getEffectiveTheme = () => {
    return theme === 'system' ? systemPreference : theme;
  };

  const isDarkMode = () => {
    return getEffectiveTheme() === 'dark';
  };

  const value = {
    theme,
    systemPreference,
    effectiveTheme: getEffectiveTheme(),
    isDarkMode: isDarkMode(),
    toggleTheme,
    setTheme: setSpecificTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Theme toggle component
export const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme, effectiveTheme } = useTheme();

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return '☀️';
      case 'dark':
        return '🌙';
      case 'system':
        return effectiveTheme === 'dark' ? '🌙' : '☀️';
      default:
        return '☀️';
    }
  };

  const getLabel = () => {
    switch (theme) {
      case 'light':
        return 'Light mode';
      case 'dark':
        return 'Dark mode';
      case 'system':
        return `System (${effectiveTheme})`;
      default:
        return 'Toggle theme';
    }
  };

  return (
    <button
      className={`theme-toggle ${className}`}
      onClick={toggleTheme}
      title={`Current: ${getLabel()}. Click to cycle through themes.`}
      aria-label="Toggle theme"
    >
      <span className="theme-icon">{getIcon()}</span>
      <span className="theme-label">{getLabel()}</span>
    </button>
  );
};

// Theme selector component (dropdown)
export const ThemeSelector = ({ className = '' }) => {
  const { theme, setTheme, effectiveTheme } = useTheme();

  const options = [
    { value: 'light', label: 'Light', icon: '☀️' },
    { value: 'dark', label: 'Dark', icon: '🌙' },
    { value: 'system', label: `System (${effectiveTheme})`, icon: '💻' },
  ];

  return (
    <div className={`theme-selector ${className}`}>
      <label htmlFor="theme-select" className="sr-only">
        Choose theme
      </label>
      <select
        id="theme-select"
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        className="theme-select"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.icon} {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

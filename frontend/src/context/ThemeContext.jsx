// src/context/ThemeContext.jsx
import { useEffect } from 'react';
import { useAuth } from './AuthContext';

export const useApplyTheme = () => {
  const { user } = useAuth();

  useEffect(() => {
    const theme = user?.theme === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
  }, [user?.theme]);
};
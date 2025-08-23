import React, { createContext, useContext, useState, useCallback } from 'react';

const LoadingContext = createContext();

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

export const LoadingProvider = ({ children }) => {
  const [loadingStates, setLoadingStates] = useState({});

  const setLoading = useCallback((key, isLoading) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: isLoading,
    }));
  }, []);

  const isLoading = useCallback((key) => {
    return loadingStates[key] || false;
  }, [loadingStates]);

  const isAnyLoading = useCallback(() => {
    return Object.values(loadingStates).some(loading => loading);
  }, [loadingStates]);

  // Convenience methods for common loading states
  const setGlobalLoading = useCallback((isLoading) => {
    setLoading('global', isLoading);
  }, [setLoading]);

  const isGlobalLoading = useCallback(() => {
    return isLoading('global');
  }, [isLoading]);

  const value = {
    setLoading,
    isLoading,
    isAnyLoading,
    setGlobalLoading,
    isGlobalLoading,
    loadingStates,
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AppError, ErrorAction } from '../types/error';
import { errorHandler } from '../services/errorHandler';

interface ErrorContextType {
  error: AppError | null;
  showError: (error: any, context?: string, actions?: ErrorAction[]) => void;
  clearError: () => void;
  actions: ErrorAction[];
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};

interface ErrorProviderProps {
  children: ReactNode;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  const [error, setError] = useState<AppError | null>(null);
  const [actions, setActions] = useState<ErrorAction[]>([]);

  const showError = (rawError: any, context?: string, customActions?: ErrorAction[]) => {
    const parsedError = errorHandler.parseError(rawError, context);
    errorHandler.logError(parsedError, context);
    
    setError(parsedError);
    setActions(customActions || []);
  };

  const clearError = () => {
    setError(null);
    setActions([]);
  };

  return (
    <ErrorContext.Provider value={{ error, showError, clearError, actions }}>
      {children}
    </ErrorContext.Provider>
  );
};

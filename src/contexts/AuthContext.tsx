import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthContextType, AuthState, User } from '../types/auth';
import { authService } from '../services/authService';

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>(initialState);

  const setLoading = (loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  };

  const setAuth = (user: User, token: string) => {
    setState({
      user,
      token,
      isLoading: false,
      isAuthenticated: true,
    });
  };

  const clearAuth = () => {
    setState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    });
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await authService.login(email, password);
      setAuth(response.user, response.token);
    } catch (error) {
      clearAuth();
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      const response = await authService.register(email, password, name);
      setAuth(response.user, response.token);
    } catch (error) {
      clearAuth();
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuth();
    }
  };

  const checkAuth = async () => {
    try {
      setLoading(true);
      const token = await authService.getToken();
      
      if (!token) {
        clearAuth();
        return;
      }

      const user = await authService.validateToken();
      if (user) {
        setAuth(user, token);
      } else {
        clearAuth();
      }
    } catch (error) {
      console.error('Auth check error:', error);
      clearAuth();
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
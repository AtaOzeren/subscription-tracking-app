import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthContextType, AuthState, User } from '../types/auth';
import { authService } from '../services/authService';
import { storageService } from '../services/storageService';

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
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(true);

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
      const response = await authService.login(email, password);
      setAuth(response.user, response.token);
    } catch (error) {
      clearAuth();
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
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
      // Silently handle logout errors
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
        await checkFirstTimeUser();
        return;
      }

      const user = await authService.validateToken();
      if (user) {
        // Load avatar from local storage
        const avatar = await storageService.getAvatar();
        const userWithAvatar = { ...user, avatar: avatar || undefined };
        setAuth(userWithAvatar, token);
        await checkFirstTimeUser();
      } else {
        clearAuth();
        await checkFirstTimeUser();
      }
    } catch (error) {
      clearAuth();
      await checkFirstTimeUser();
    } finally {
      setLoading(false);
    }
  };

  const checkFirstTimeUser = async () => {
    try {
      const isFirstTime = await authService.isFirstTimeUser();
      setIsFirstTimeUser(isFirstTime);
    } catch (error) {
      setIsFirstTimeUser(true);
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
    isFirstTimeUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
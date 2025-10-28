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
      console.log('🔄 Starting login process...');
      setLoading(true);
      const response = await authService.login(email, password);
      console.log('✅ Login completed, setting auth state');
      setAuth(response.user, response.token);
    } catch (error) {
      console.error('❌ Login failed in context:', error);
      clearAuth();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      console.log('🔄 Starting register process...');
      setLoading(true);
      const response = await authService.register(email, password, name);
      console.log('✅ Register completed, setting auth state');
      setAuth(response.user, response.token);
    } catch (error) {
      console.error('❌ Register failed in context:', error);
      clearAuth();
      throw error;
    } finally {
      setLoading(false);
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
      console.log('🔄 Starting auth check...');
      setLoading(true);
      const token = await authService.getToken();
      
      if (!token) {
        console.log('🔍 No token found, user not authenticated');
        clearAuth();
        return;
      }

      const user = await authService.validateToken();
      if (user) {
        console.log('✅ Auth check successful, user authenticated');
        setAuth(user, token);
      } else {
        console.log('❌ Auth check failed, token invalid');
        clearAuth();
      }
    } catch (error) {
      console.error('❌ Auth check error:', error);
      clearAuth();
    } finally {
      setLoading(false);
    }
  };

  const checkFirstTimeUser = async () => {
    try {
      const isFirstTime = await authService.isFirstTimeUser();
      console.log('🔍 First time user check:', isFirstTime);
      setIsFirstTimeUser(isFirstTime);
    } catch (error) {
      console.error('❌ First time user check error:', error);
      setIsFirstTimeUser(true);
    }
  };

  useEffect(() => {
    checkAuth();
    checkFirstTimeUser();
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
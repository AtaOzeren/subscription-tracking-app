import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthContextType, AuthState, User } from '../types/auth';
// We need to extend AuthContextType to include refreshUser if it's not already there
// Since we can't modify the types file easily without seeing it, we'll cast the value
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
        // console.log('AuthContext: Loading avatar for user:', user.email, 'Avatar exists:', !!avatar);

        // Validate avatar data before using it
        let validAvatar: string | undefined = undefined;
        if (avatar && typeof avatar === 'string' && avatar.length > 0) {
          // Check if it's a valid URL or base64 data URI
          const isValidUrl = avatar.startsWith('http://') || avatar.startsWith('https://');
          const isValidBase64 = avatar.startsWith('data:image/');

          if (isValidUrl || isValidBase64) {
            validAvatar = avatar;
            // console.log('AuthContext: Avatar validated successfully');
          } else {
            console.warn('[Auth]  Invalid avatar format detected, removing from storage');
            await storageService.removeAvatar();
          }
        }

        const userWithAvatar = { ...user, avatar: validAvatar };
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

  const refreshUser = async () => {
    try {
      // Same as checkAuth but without setting global loading state
      // This prevents navigation reset when updating user profile
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

        // Validate avatar data before using it
        let validAvatar: string | undefined = undefined;
        if (avatar && typeof avatar === 'string' && avatar.length > 0) {
          // Check if it's a valid URL or base64 data URI
          const isValidUrl = avatar.startsWith('http://') || avatar.startsWith('https://');
          const isValidBase64 = avatar.startsWith('data:image/');

          if (isValidUrl || isValidBase64) {
            validAvatar = avatar;
          } else {
            await storageService.removeAvatar();
          }
        }

        const userWithAvatar = { ...user, avatar: validAvatar };
        setAuth(userWithAvatar, token);
        await checkFirstTimeUser();
      } else {
        clearAuth();
        await checkFirstTimeUser();
      }
    } catch (error) {
      // If refresh fails, we might want to clear auth or just ignore
      // For now, let's keep the current state to avoid disrupting the user
      console.error('[Auth] Error refreshing user:', error);
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
    refreshUser,
    isFirstTimeUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
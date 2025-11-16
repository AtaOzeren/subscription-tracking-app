import { Api } from './tracking/tracking-api';
import { storageService } from './storageService';
import { AuthResponse, User, ApiResponse, LoginResponseData } from '../types/auth';
import { ProfileUpdateData } from '../types/reference';

class AuthService {
  private api: Api<string>;

  constructor() {
    this.api = new Api<string>({
      securityWorker: (token) => {
        if (token) {
          return {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          };
        }
        return {};
      },
    });
  }

  private get baseUrl() {
    // baseUrl is already set in tracking-api from .env
    return this.api.baseUrl;
  }

  // Test API connectivity before making requests
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }, 10000);
      
      if (!response.ok) {
        return false;
      }
      
      await response.json();
      return true;
    } catch (error) {
      return false;
    }
  }

  // Helper function to create fetch with timeout
  private async fetchWithTimeout(url: string, options: RequestInit, timeout = 30000): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout. Please check your connection and try again.');
        }
        if (error.message.includes('Network request failed')) {
          throw new Error('Cannot connect to server. Please check your network connection.');
        }
      }
      throw error;
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      // Test connection first (non-blocking)
      const isConnected = await this.testConnection();
      if (!isConnected) {
        console.warn('[Auth] Health check failed, attempting login anyway');
      }
      
      const response = await this.fetchWithTimeout(`${this.baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      }, 30000);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error((errorData as any).message || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const apiResponse: ApiResponse<LoginResponseData> = await response.json();
      
      if (!apiResponse.success) {
        throw new Error(apiResponse.message || 'Login failed');
      }
      
      if (!apiResponse.data) {
        throw new Error('Missing data in server response');
      }
      
      const loginData: LoginResponseData = apiResponse.data;
      
      if (!loginData.token) {
        throw new Error('No authentication token received');
      }
      
      const user: User = {
        id: loginData.id,
        email: loginData.email,
        name: loginData.name,
        role: loginData.role,
        region: loginData.region,
        currency: loginData.currency,
        last_login_at: loginData.last_login_at,
      };
      
      const token = loginData.token;
      
      await Promise.all([
        storageService.setToken(token),
        storageService.setUser(user),
      ]);

      this.api.setSecurityData(token);

      return { user, token };
      
    } catch (error) {
      console.error('[Auth] Login error:', error);
      console.error('[Auth] Error type:', typeof error);
      console.error('[Auth] Error message:', error instanceof Error ? error.message : 'Unknown error');
      
      // Handle different types of errors with user-friendly messages
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        
        // Network and connection errors
        if (errorMessage.includes('cannot connect to server')) {
          throw error; // Already has detailed message
        } else if (errorMessage.includes('fetch') || errorMessage.includes('network') || 
            errorMessage.includes('enotfound') || errorMessage.includes('econnrefused')) {
          throw new Error('Cannot connect to server. Please check your internet connection.');
        } else if (errorMessage.includes('timeout')) {
          throw new Error('Connection timeout. The server took too long to respond. Please try again.');
        }
        
        // Authentication errors
        else if (errorMessage.includes('401') || errorMessage.includes('unauthorized') || 
                 errorMessage.includes('invalid credentials')) {
          throw new Error('Invalid email or password.');
        }
        
        // Validation errors
        else if (errorMessage.includes('400') || errorMessage.includes('bad request')) {
          throw new Error('Invalid login details. Please check your email and password.');
        }
        
        // Server errors
        else if (errorMessage.includes('500') || errorMessage.includes('server error')) {
          throw new Error('Server error. Please try again later.');
        }
        
        // Generic login failures
        else if (errorMessage.includes('login failed')) {
          throw new Error('Login failed. Please check your credentials.');
        }
      }
      
      throw new Error('Login failed. Please check your credentials and try again.');
    }
  }

  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      }, 30000);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error((errorData as any).message || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const apiResponse: ApiResponse<LoginResponseData> = await response.json();
      
      if (!apiResponse || !apiResponse.success || !apiResponse.data) {
        throw new Error('Invalid register response from server');
      }
      
      const registerData: LoginResponseData = apiResponse.data;
      
      const user: User = {
        id: registerData.id,
        email: registerData.email,
        name: registerData.name,
        role: registerData.role,
        region: registerData.region,
        currency: registerData.currency,
        last_login_at: registerData.last_login_at,
      };
      
      const token = registerData.token;
      
      await Promise.all([
        storageService.setToken(token),
        storageService.setUser(user),
      ]);

      this.api.setSecurityData(token);

      return { user, token };
    } catch (error) {
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        
        if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
          throw new Error('Network error. Please check your connection and try again.');
        } else if (errorMessage.includes('409') || errorMessage.includes('conflict') || errorMessage.includes('exists')) {
          throw new Error('Email already exists. Please use a different email or try logging in.');
        } else if (errorMessage.includes('400') || errorMessage.includes('bad request')) {
          throw new Error('Invalid request. Please check your input and try again.');
        } else if (errorMessage.includes('500') || errorMessage.includes('server error')) {
          throw new Error('Server error. Please try again later.');
        }
      }
      
      throw new Error('Registration failed. Please try again.');
    }
  }

  async validateToken(): Promise<User | null> {
    try {
      const token = await storageService.getToken();
      if (!token) {
        return null;
      }

      this.api.setSecurityData(token);

      const response = await this.fetchWithTimeout(`${this.baseUrl}/api/auth/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }, 30000);
      
      if (!response.ok) {
        await this.logout();
        return null;
      }
      
      const apiResponse: ApiResponse<User> = await response.json();
      
      if (!apiResponse || !apiResponse.success || !apiResponse.data) {
        await this.logout();
        return null;
      }
      
      const user: User = apiResponse.data;
      
      await storageService.setUser(user);
      return user;
    } catch (error) {
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        
        if (errorMessage.includes('401') || errorMessage.includes('unauthorized') || errorMessage.includes('token')) {
          await this.logout();
          return null;
        }
        
        if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
          const user = await storageService.getUser();
          if (user) {
            return user;
          }
        }
      }
      
      await this.logout();
      return null;
    }
  }

  async updateProfile(data: ProfileUpdateData): Promise<User> {
    try {
      const token = await storageService.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      this.api.setSecurityData(token);

      const response = await this.fetchWithTimeout(`${this.baseUrl}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }, 30000);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error((errorData as any).message || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const profileData = await response.json();
      
      // API returns partial user data (name, region, currency)
      // We need to merge with existing user data
      const existingUser = await storageService.getUser();
      if (!existingUser) {
        throw new Error('No existing user data found');
      }
      
      // Merge updated fields with existing user
      const updatedUser: User = {
        ...existingUser,
        name: profileData.name || existingUser.name,
        region: profileData.region || existingUser.region,
        currency: profileData.currency || existingUser.currency,
      };
      
      await storageService.setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        
        if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
          throw new Error('Network error. Please check your connection and try again.');
        } else if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
          throw new Error('Session expired. Please login again.');
        } else if (errorMessage.includes('400') || errorMessage.includes('bad request')) {
          throw new Error('Invalid request. Please check your input and try again.');
        } else if (errorMessage.includes('500') || errorMessage.includes('server error')) {
          throw new Error('Server error. Please try again later.');
        }
      }
      
      throw new Error('Failed to update profile. Please try again.');
    }
  }

  async isFirstTimeUser(): Promise<boolean> {
    try {
      const onboardingComplete = await storageService.getOnboardingComplete();
      
      // Only check if onboarding is complete (Welcome -> Language -> Login flow)
      return !onboardingComplete;
    } catch (error) {
      return true; // Assume first time if there's an error
    }
  }

  async getProfile(): Promise<User | null> {
    try {
      const token = await storageService.getToken();
      if (!token) {
        return null;
      }

      this.api.setSecurityData(token);

      const response = await this.fetchWithTimeout(`${this.baseUrl}/api/auth/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }, 30000);
      
      if (!response.ok) {
        return null;
      }
      
      const apiResponse: ApiResponse<User> = await response.json();
      
      if (!apiResponse || !apiResponse.success || !apiResponse.data) {
        return null;
      }
      
      const user: User = apiResponse.data;
      
      await storageService.setUser(user);
      return user;
    } catch (error) {
      return null;
    }
  }

  async logout(): Promise<void> {
    try {
      await storageService.clearAuth();
      this.api.setSecurityData(null);
    } catch (error) {
      // Don't throw error for logout
    }
  }

  async forceLogout(): Promise<void> {
    try {
      // Clear all auth data
      await storageService.clearAuth();
      this.api.setSecurityData(null);
      
      // Clear all app data
      await storageService.clearAll();
      
      // Reset onboarding flags
      await storageService.setOnboardingComplete(false);
      await storageService.setProfileSetup(false);
    } catch (error) {
      throw error;
    }
  }

  async getToken(): Promise<string | null> {
    return await storageService.getToken();
  }

  getApiClient() {
    return this.api;
  }
}

export const authService = new AuthService();
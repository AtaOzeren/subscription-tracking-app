import { Api } from './tracking/tracking-api';
import { storageService } from './storageService';
import { AuthResponse, User, ApiResponse, LoginResponseData } from '../types/auth';
import { ProfileUpdateData } from '../types/reference';

class AuthService {
  private api: Api<string>;
  private baseUrl: string;

  constructor() {
    // Use local IP instead of localhost for React Native
    // Change this to your computer's IP address when testing on physical device
    this.baseUrl = 'http://192.168.1.5:5001';
    
    this.api = new Api<string>({
      baseUrl: this.baseUrl,
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

  // Helper function to create fetch with timeout
  private async fetchWithTimeout(url: string, options: RequestInit, timeout = 10000): Promise<Response> {
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
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout. Please check your connection and try again.');
      }
      throw error;
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      console.log('🔐 Login attempt:', { email });
      console.log('🌐 API Base URL:', this.api.baseUrl);
      
      // Use fetch directly to bypass swagger API issues
      const startTime = Date.now();
      console.log('⏰ Starting direct fetch call at:', new Date().toISOString());
      
      const response = await this.fetchWithTimeout(`${this.baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      }, 10000);
      
      const endTime = Date.now();
      console.log('⏰ Fetch call completed in:', endTime - startTime, 'ms');
      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ HTTP Error:', errorData);
        throw new Error((errorData as any).message || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const apiResponse: ApiResponse<LoginResponseData> = await response.json();
      console.log('🔍 Parsed API response:', apiResponse);
      
      // Validate response structure
      if (!apiResponse.success) {
        console.error('❌ API response success is false:', apiResponse);
        throw new Error(apiResponse.message || 'Login failed');
      }
      
      if (!apiResponse.data) {
        throw new Error('Missing data in server response');
      }
      
      const loginData: LoginResponseData = apiResponse.data;
      console.log('✅ Login data received:', { 
        id: loginData.id, 
        email: loginData.email, 
        name: loginData.name,
        hasToken: !!loginData.token
      });
      
      // Validate login data
      if (!loginData.token) {
        throw new Error('No authentication token received');
      }
      
      // Extract user data
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
      
      // Save to storage
      console.log('💾 Saving to storage...');
      await Promise.all([
        storageService.setToken(token),
        storageService.setUser(user),
      ]);
      console.log('✅ Saved to storage successfully');

      // Set token for future API calls
      this.api.setSecurityData(token);

      console.log('✅ Login successful:', { user: user.email, token: token.substring(0, 10) + '...' });
      return { user, token };
      
    } catch (error) {
      console.error('❌ Login error:', error);
      console.error('❌ Error type:', typeof error);
      console.error('❌ Error message:', error instanceof Error ? error.message : 'Unknown error');
      
      // Handle different types of errors
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        
        if (errorMessage.includes('fetch') || errorMessage.includes('network') || 
            errorMessage.includes('enotfound') || errorMessage.includes('econnrefused')) {
          throw new Error('Network error. Please check your connection and try again.');
        } else if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
          throw new Error('Invalid email or password. Please try again.');
        } else if (errorMessage.includes('400') || errorMessage.includes('bad request')) {
          throw new Error('Invalid request. Please check your input and try again.');
        } else if (errorMessage.includes('500') || errorMessage.includes('server error')) {
          throw new Error('Server error. Please try again later.');
        } else if (errorMessage.includes('timeout') || errorMessage.includes('timeout')) {
          throw new Error('Request timeout. Please check your connection and try again.');
        } else if (errorMessage.includes('invalid credentials') || errorMessage.includes('login failed')) {
          throw new Error('Invalid email or password. Please try again.');
        }
      }
      
      throw new Error('Login failed. Please check your credentials and try again.');
    }
  }

  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    try {
      console.log('🔐 Register attempt:', { email, name });
      
      const response = await this.fetchWithTimeout(`${this.baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      }, 10000);
      
      console.log('📡 Register response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Register HTTP Error:', errorData);
        throw new Error((errorData as any).message || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const apiResponse: ApiResponse<LoginResponseData> = await response.json();
      console.log('🔍 Parsed register response:', apiResponse);
      
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

      console.log('✅ Register successful:', { user: user.email });
      return { user, token };
    } catch (error) {
      console.error('❌ Register error:', error);
      
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
        console.log('🔍 No token found in storage');
        return null;
      }

      console.log('🔍 Validating token:', token.substring(0, 10) + '...');
      this.api.setSecurityData(token);

      const response = await this.fetchWithTimeout(`${this.baseUrl}/api/auth/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }, 10000);
      
      console.log('📡 Profile response status:', response.status);
      
      if (!response.ok) {
        console.error('❌ Profile HTTP Error:', response.status);
        await this.logout();
        return null;
      }
      
      const apiResponse: ApiResponse<User> = await response.json();
      console.log('🔍 Parsed profile response:', apiResponse);
      
      if (!apiResponse || !apiResponse.success || !apiResponse.data) {
        console.error('❌ Invalid profile response:', apiResponse);
        await this.logout();
        return null;
      }
      
      const user: User = apiResponse.data;
      console.log('✅ Token validation successful:', user.email);
      
      await storageService.setUser(user);
      return user;
    } catch (error) {
      console.error('❌ Token validation error:', error);
      
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        
        if (errorMessage.includes('401') || errorMessage.includes('unauthorized') || errorMessage.includes('token')) {
          console.log('🔑 Token is invalid, logging out');
          await this.logout();
          return null;
        }
        
        if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
          console.log('⚠️ Network error, using stored user data as fallback');
          const user = await storageService.getUser();
          if (user) {
            console.log('✅ Using stored user data:', user.email);
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

      console.log('🔧 Updating user profile...', data);
      this.api.setSecurityData(token);

      const response = await this.fetchWithTimeout(`${this.baseUrl}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }, 10000);
      
      console.log('📡 Profile update response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Profile update HTTP Error:', errorData);
        throw new Error((errorData as any).message || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const apiResponse: ApiResponse<User> = await response.json();
      console.log('🔍 Parsed profile update response:', apiResponse);
      
      if (!apiResponse || !apiResponse.success || !apiResponse.data) {
        throw new Error('Invalid profile update response from server');
      }
      
      const user: User = apiResponse.data;
      console.log('✅ Profile updated successfully:', user.email);
      
      await storageService.setUser(user);
      return user;
    } catch (error) {
      console.error('❌ Profile update error:', error);
      
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
      const profileSetup = await storageService.getProfileSetup();
      
      console.log('🔍 First time user check:', { onboardingComplete, profileSetup });
      
      return !onboardingComplete || !profileSetup;
    } catch (error) {
      console.error('❌ First time user check error:', error);
      return true; // Assume first time if there's an error
    }
  }

  async getProfile(): Promise<User | null> {
    try {
      const token = await storageService.getToken();
      if (!token) {
        console.log('🔍 No token found for profile request');
        return null;
      }

      console.log('🔍 Fetching user profile...');
      this.api.setSecurityData(token);

      const response = await this.fetchWithTimeout(`${this.baseUrl}/api/auth/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }, 10000);
      
      console.log('📡 Profile response status:', response.status);
      
      if (!response.ok) {
        console.error('❌ Profile HTTP Error:', response.status);
        return null;
      }
      
      const apiResponse: ApiResponse<User> = await response.json();
      console.log('🔍 Parsed profile response:', apiResponse);
      
      if (!apiResponse || !apiResponse.success || !apiResponse.data) {
        console.error('❌ Invalid profile response:', apiResponse);
        return null;
      }
      
      const user: User = apiResponse.data;
      console.log('✅ Profile fetched successfully:', user.email);
      
      await storageService.setUser(user);
      return user;
    } catch (error) {
      console.error('❌ Profile fetch error:', error);
      return null;
    }
  }

  async logout(): Promise<void> {
    try {
      console.log('🚪 Logging out...');
      
      await storageService.clearAuth();
      this.api.setSecurityData(null);
      
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Don't throw error for logout
    }
  }

  async getToken(): Promise<string | null> {
    return await storageService.getToken();
  }

  getApiClient(): Api<string> {
    return this.api;
  }
}

export const authService = new AuthService();
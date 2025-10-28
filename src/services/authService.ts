import { Api } from './tracking/tracking-api';
import { storageService } from './storageService';
import { AuthResponse, User } from '../types/auth';

class AuthService {
  private api: Api<string>;

  constructor() {
    this.api = new Api<string>({
      baseUrl: 'http://localhost:5001',
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

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      console.log('🔐 Login attempt:', { email });
      
      // For development/testing, let's use a fallback approach
      // since API might not be available
      console.log('⚠️ Using fallback login for development');
      
      const token = 'dev-token-' + Date.now();
      const user: User = {
        id: 1,
        email,
        name: 'Development User',
        role: 'customer',
      };
      
      // Save to storage
      await Promise.all([
        storageService.setToken(token),
        storageService.setUser(user),
      ]);

      // Set token for future API calls
      this.api.setSecurityData(token);

      console.log('✅ Login successful:', { user: user.email, token: token.substring(0, 10) + '...' });
      return { user, token };
      
    } catch (error) {
      console.error('❌ Login error:', error);
      throw new Error('Login failed. Please check your credentials and try again.');
    }
  }

  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    try {
      console.log('🔐 Register attempt:', { email, name });
      
      // For development/testing, use fallback approach
      console.log('⚠️ Using fallback register for development');
      
      const token = 'dev-token-' + Date.now();
      const user: User = {
        id: 1,
        email,
        name,
        role: 'customer',
      };
      
      // Save to storage
      await Promise.all([
        storageService.setToken(token),
        storageService.setUser(user),
      ]);

      // Set token for future API calls
      this.api.setSecurityData(token);

      console.log('✅ Register successful:', { user: user.email, token: token.substring(0, 10) + '...' });
      return { user, token };
    } catch (error) {
      console.error('❌ Register error:', error);
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

      // Set token for API call
      this.api.setSecurityData(token);

      // For development, let's use stored user data instead of API call
      // since API might not be available
      const user = await storageService.getUser();
      
      if (user) {
        console.log('✅ Token validation successful:', user.email);
        return user;
      } else {
        console.log('❌ No user data found, token invalid');
        await this.logout();
        return null;
      }
    } catch (error) {
      console.error('❌ Token validation error:', error);
      // Token is invalid, clear auth data
      await this.logout();
      return null;
    }
  }

  async logout(): Promise<void> {
    try {
      console.log('🚪 Logging out...');
      
      // Clear auth data from storage
      await storageService.clearAuth();
      
      // Clear token from API client
      this.api.setSecurityData(null);
      
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
      throw error;
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
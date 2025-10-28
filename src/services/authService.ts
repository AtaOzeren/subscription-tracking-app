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
      const response = await this.api.api.login({ email, password });
      
      // Assuming the API returns token and user data
      // You may need to adjust this based on your actual API response
      const token = 'mock-token'; // Replace with actual token from response
      const user: User = {
        id: 1,
        email,
        name: 'User Name', // Replace with actual name from response
        role: 'customer',
      };

      // Save to storage
      await Promise.all([
        storageService.setToken(token),
        storageService.setUser(user),
      ]);

      // Set token for future API calls
      this.api.setSecurityData(token);

      return { user, token };
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Login failed. Please check your credentials.');
    }
  }

  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    try {
      const response = await this.api.api.register({ email, password, name });
      
      // Assuming the API returns token and user data
      // You may need to adjust this based on your actual API response
      const token = 'mock-token'; // Replace with actual token from response
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

      return { user, token };
    } catch (error) {
      console.error('Register error:', error);
      throw new Error('Registration failed. Please try again.');
    }
  }

  async validateToken(): Promise<User | null> {
    try {
      const token = await storageService.getToken();
      if (!token) {
        return null;
      }

      // Set token for API call
      this.api.setSecurityData(token);

      // Get user profile to validate token
      const response = await this.api.api.getProfile();
      
      // Assuming the API returns user data
      // You may need to adjust this based on your actual API response
      const user: User = {
        id: 1,
        email: 'user@example.com', // Replace with actual data from response
        name: 'User Name',
        role: 'customer',
      };

      // Update stored user data
      await storageService.setUser(user);

      return user;
    } catch (error) {
      console.error('Token validation error:', error);
      // Token is invalid, clear auth data
      await this.logout();
      return null;
    }
  }

  async logout(): Promise<void> {
    try {
      // Clear auth data from storage
      await storageService.clearAuth();
      
      // Clear token from API client
      this.api.setSecurityData(null);
    } catch (error) {
      console.error('Logout error:', error);
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
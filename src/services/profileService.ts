import { Api } from './tracking/tracking-api';
import { storageService } from './storageService';
import { User, ApiResponse } from '../types/auth';

class ProfileService {
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
    return this.api.baseUrl;
  }

  /**
   * Get user profile from API
   * Endpoint: GET /api/auth/profile
   */
  async getProfile(): Promise<User> {
    try {
      const token = await storageService.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      this.api.setSecurityData(token);

      const response = await fetch(`${this.baseUrl}/api/auth/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error((errorData as any).message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const apiResponse: ApiResponse<User> = await response.json();

      if (!apiResponse || !apiResponse.success || !apiResponse.data) {
        throw new Error('Invalid profile response from server');
      }

      const user: User = apiResponse.data;

      // Update local storage with latest profile data
      await storageService.setUser(user);

      return user;
    } catch (error) {
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();

        if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
          throw new Error('Network error. Please check your connection and try again.');
        } else if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
          throw new Error('Session expired. Please login again.');
        } else if (errorMessage.includes('500') || errorMessage.includes('server error')) {
          throw new Error('Server error. Please try again later.');
        }
      }

      throw new Error('Failed to fetch profile. Please try again.');
    }
  }

  /**
   * Update user profile
   * Endpoint: PUT /api/auth/profile
   */
  async updateProfile(data: {
    name?: string;
    region?: string;
    currency?: string;
    avatar?: string;
  }): Promise<User> {
    try {
      const token = await storageService.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      this.api.setSecurityData(token);

      const response = await fetch(`${this.baseUrl}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error((errorData as any).message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const apiResponse: ApiResponse<User> = await response.json();

      if (!apiResponse || !apiResponse.success || !apiResponse.data) {
        throw new Error('Invalid update response from server');
      }

      const user: User = apiResponse.data;

      // Update local storage
      await storageService.setUser(user);

      return user;
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
}

export const profileService = new ProfileService();

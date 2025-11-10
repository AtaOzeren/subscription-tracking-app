import { Api } from './tracking/tracking-api';
import { storageService } from './storageService';
import { DetailedStatsResponse } from '../types/stats';
import Constants from 'expo-constants';

class StatsService {
  private api: Api<string>;

  constructor() {
    const apiBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl || 'http://localhost:5001';
    console.log('🌐 Stats - Initializing with baseUrl:', apiBaseUrl);
    
    this.api = new Api<string>({
      baseUrl: apiBaseUrl,
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

  private async initializeApi() {
    const token = await storageService.getToken();
    console.log('🔑 Stats - Token retrieved:', token ? `${token.substring(0, 20)}...` : 'none');
    if (token) {
      this.api.setSecurityData(token);
      console.log('✅ Stats - Security data set');
    } else {
      console.log('❌ Stats - No token found');
    }
  }

  async getDetailedStats(): Promise<DetailedStatsResponse> {
    try {
      console.log('🔄 Stats - Starting getDetailedStats');
      await this.initializeApi();
      
      console.log('📡 Stats - Making API call to /api/my-subscriptions/detailed-stats');
      const response = await this.api.request({
        path: '/api/my-subscriptions/detailed-stats',
        method: 'GET',
        secure: true,
        format: 'json'
      }) as any;
      console.log('📡 Stats - Response received:', response);
      
      // Extract the actual data from the response
      let responseData: DetailedStatsResponse;
      
      if (response.data) {
        // If response has a nested data property
        responseData = response.data;
      } else {
        // If response is already the data object
        responseData = response;
      }
      
      console.log('📦 Stats - Extracted data:', responseData);
      
      // Validate required fields
      if (!responseData.summary || !Array.isArray(responseData.subscriptions)) {
        console.error('❌ Stats - Invalid response structure:', responseData);
        throw new Error('Invalid API response structure');
      }
      
      console.log('✅ Stats - Successfully loaded detailed stats');
      return responseData;
    } catch (error) {
      console.error('❌ Stats - Error fetching:', error);
      throw error;
    }
  }
}

export const statsService = new StatsService();

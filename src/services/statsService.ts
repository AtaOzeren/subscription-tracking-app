import { Api } from './tracking/tracking-api';
import { storageService } from './storageService';
import { DetailedStatsResponse } from '../types/stats';
import Constants from 'expo-constants';

class StatsService {
  private api: Api<string>;

  constructor() {
    const apiBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl || 'http://localhost:5001';
    
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
    if (token) {
      this.api.setSecurityData(token);
    }
  }

  async getDetailedStats(): Promise<DetailedStatsResponse> {
    try {
      await this.initializeApi();
      
      const response = await this.api.request({
        path: '/api/my-subscriptions/detailed-stats',
        method: 'GET',
        secure: true,
        format: 'json'
      }) as any;
      
      // Extract the actual data from the response
      let responseData: DetailedStatsResponse;
      
      if (response.data && response.data.data) {
        responseData = response.data.data;
      } else if (response.data) {
        responseData = response.data;
      } else {
        responseData = response;
      }
      
      // Validate required fields
      if (!responseData.summary || !Array.isArray(responseData.subscriptions)) {
        console.error('[Stats] Invalid response structure:', responseData);
        throw new Error('Invalid API response structure');
      }
      
      return responseData;
    } catch (error) {
      console.error('[Stats] Error fetching detailed stats:', error);
      throw error;
    }
  }
}

export const statsService = new StatsService();

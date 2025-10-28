import { Country, Currency, CountriesResponse, CurrenciesResponse } from '../types/reference';

class ReferenceService {
  private baseUrl: string;

  constructor() {
    // Use local IP instead of localhost for React Native
    // Change this to your computer's IP address when testing on physical device
    this.baseUrl = 'http://192.168.1.5:5001';
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

  async getCountries(): Promise<Country[]> {
    try {
      console.log('🌍 Fetching countries...');
      
      const response = await this.fetchWithTimeout(`${this.baseUrl}/api/reference/countries`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }, 10000);
      
      console.log('📡 Countries response status:', response.status);
      
      if (!response.ok) {
        console.error('❌ Countries HTTP Error:', response.status);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const apiResponse: CountriesResponse = await response.json();
      console.log('🔍 Parsed countries response:', apiResponse);
      
      if (!apiResponse.success || !apiResponse.data) {
        throw new Error('Invalid countries response from server');
      }
      
      console.log('✅ Countries fetched successfully:', apiResponse.data.length);
      return apiResponse.data;
    } catch (error) {
      console.error('❌ Countries fetch error:', error);
      
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        
        if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
          throw new Error('Network error. Please check your connection and try again.');
        } else if (errorMessage.includes('timeout')) {
          throw new Error('Request timeout. Please check your connection and try again.');
        }
      }
      
      throw new Error('Failed to fetch countries. Please try again.');
    }
  }

  async getCurrencies(): Promise<Currency[]> {
    try {
      console.log('💰 Fetching currencies...');
      
      const response = await this.fetchWithTimeout(`${this.baseUrl}/api/reference/currencies`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }, 10000);
      
      console.log('📡 Currencies response status:', response.status);
      
      if (!response.ok) {
        console.error('❌ Currencies HTTP Error:', response.status);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const apiResponse: CurrenciesResponse = await response.json();
      console.log('🔍 Parsed currencies response:', apiResponse);
      
      if (!apiResponse.success || !apiResponse.data) {
        throw new Error('Invalid currencies response from server');
      }
      
      console.log('✅ Currencies fetched successfully:', apiResponse.data.length);
      return apiResponse.data;
    } catch (error) {
      console.error('❌ Currencies fetch error:', error);
      
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        
        if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
          throw new Error('Network error. Please check your connection and try again.');
        } else if (errorMessage.includes('timeout')) {
          throw new Error('Request timeout. Please check your connection and try again.');
        }
      }
      
      throw new Error('Failed to fetch currencies. Please try again.');
    }
  }
}

export const referenceService = new ReferenceService();
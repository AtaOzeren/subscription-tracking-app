import { Api } from './tracking/tracking-api';
import { Country, Currency, CountriesResponse, CurrenciesResponse } from '../types/reference';

/**
 * Reference Service
 * Handles fetching reference data (countries, currencies) using tracking-api
 */
class ReferenceService {
  private api: Api<string>;

  constructor() {
    this.api = new Api<string>();
  }

  async getCountries(): Promise<Country[]> {
    try {
      console.log('🌍 Fetching countries from API...');
      
      // Use tracking-api directly
      const response = await this.api.api.getCountries();
      
      // Parse response
      const apiResponse = response.data as unknown as CountriesResponse;
      
      if (!apiResponse || !apiResponse.success || !apiResponse.data) {
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
      console.log('💰 Fetching currencies from API...');
      
      // Use tracking-api directly
      const response = await this.api.api.getCurrencies();
      
      // Parse response
      const apiResponse = response.data as unknown as CurrenciesResponse;
      
      if (!apiResponse || !apiResponse.success || !apiResponse.data) {
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
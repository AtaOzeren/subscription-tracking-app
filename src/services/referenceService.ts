import { Api } from './tracking/tracking-api';
import { Country, Currency } from '../types/reference';

/**
 * Reference Service
 * Handles fetching reference data (countries, currencies) using direct fetch
 */
class ReferenceService {
  private api: Api<string>;

  constructor() {
    this.api = new Api<string>();
  }

  async getCountries(): Promise<Country[]> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const response = await fetch(`${this.api.baseUrl}/api/reference/countries`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const apiResponse = await response.json();
      
      // Handle different response formats
      let countries: Country[];
      
      if (Array.isArray(apiResponse)) {
        countries = apiResponse;
      } else if (apiResponse.data && Array.isArray(apiResponse.data)) {
        countries = apiResponse.data;
      } else {
        throw new Error('Invalid countries response from server');
      }
      
      return countries;
    } catch (error) {
      console.error('❌ Countries fetch error:', error);
      
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        
        if (errorMessage.includes('abort')) {
          throw new Error('Request timeout. Please check your connection and try again.');
        } else if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
          throw new Error('Network error. Please check your connection and try again.');
        }
      }
      
      throw new Error('Failed to fetch countries. Please try again.');
    }
  }

  async getCurrencies(): Promise<Currency[]> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const response = await fetch(`${this.api.baseUrl}/api/reference/currencies`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const apiResponse = await response.json();
      
      // Handle different response formats
      let currencies: Currency[];
      
      if (Array.isArray(apiResponse)) {
        currencies = apiResponse;
      } else if (apiResponse.data && Array.isArray(apiResponse.data)) {
        currencies = apiResponse.data;
      } else {
        throw new Error('Invalid currencies response from server');
      }
      
      return currencies;
    } catch (error) {
      console.error('❌ Currencies fetch error:', error);
      
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        
        if (errorMessage.includes('abort')) {
          throw new Error('Request timeout. Please check your connection and try again.');
        } else if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
          throw new Error('Network error. Please check your connection and try again.');
        }
      }
      
      throw new Error('Failed to fetch currencies. Please try again.');
    }
  }
}

export const referenceService = new ReferenceService();

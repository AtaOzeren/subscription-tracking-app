import { Api } from './tracking/tracking-api';
import { storageService } from './storageService';
import {
  Category,
  CatalogSubscription,
  SubscriptionWithPlans,
  Plan,
  MySubscription,
  AddPresetSubscriptionRequest,
  AddCustomSubscriptionRequest,
  UpdateSubscriptionRequest,
  CategoriesResponse,
  SubscriptionsResponse,
  SubscriptionDetailResponse,
  PlansResponse,
  MySubscriptionsResponse,
} from '../types/catalog';

/**
 * Catalog Service
 * Handles subscription catalog, categories, and my subscriptions operations
 */
class CatalogService {
  private api: Api<string>;

  constructor() {
    this.api = new Api<string>();
  }

  private get baseUrl() {
    return this.api.baseUrl;
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    const token = await storageService.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

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

  // Categories
  async getCategories(): Promise<Category[]> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/api/categories`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const apiResponse: CategoriesResponse = await response.json();

      if (!apiResponse.success || !apiResponse.data) {
        throw new Error('Invalid categories response from server');
      }

      return apiResponse.data;
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      throw new Error('Failed to fetch categories. Please try again.');
    }
  }

  // Catalog Subscriptions
  async getCatalogSubscriptions(categoryId?: number): Promise<CatalogSubscription[]> {
    try {
      const url = categoryId
        ? `${this.baseUrl}/api/catalog/subscriptions?category_id=${categoryId}`
        : `${this.baseUrl}/api/catalog/subscriptions`;

      const response = await this.fetchWithTimeout(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const apiResponse: SubscriptionsResponse = await response.json();

      if (!apiResponse.success || !apiResponse.data) {
        throw new Error('Invalid subscriptions response from server');
      }

      return apiResponse.data;
    } catch (error) {
      console.error('Failed to fetch catalog subscriptions:', error);
      throw new Error('Failed to fetch subscriptions. Please try again.');
    }
  }

  // Subscription Details with Plans
  async getSubscriptionDetails(subscriptionId: number): Promise<SubscriptionWithPlans> {
    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/api/catalog/subscriptions/${subscriptionId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const apiResponse: SubscriptionDetailResponse = await response.json();

      if (!apiResponse.success || !apiResponse.data) {
        throw new Error('Invalid subscription detail response from server');
      }

      return apiResponse.data;
    } catch (error) {
      console.error('Failed to fetch subscription details:', error);
      throw new Error('Failed to fetch subscription details. Please try again.');
    }
  }

  // Subscription Plans
  async getSubscriptionPlans(subscriptionId: number): Promise<Plan[]> {
    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/api/catalog/subscriptions/${subscriptionId}/plans`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const apiResponse: PlansResponse = await response.json();

      if (!apiResponse.success || !apiResponse.data) {
        throw new Error('Invalid plans response from server');
      }

      return apiResponse.data;
    } catch (error) {
      console.error('Failed to fetch subscription plans:', error);
      throw new Error('Failed to fetch subscription plans. Please try again.');
    }
  }

  // My Subscriptions - Get All
  async getMySubscriptions(): Promise<MySubscription[]> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await this.fetchWithTimeout(`${this.baseUrl}/api/my-subscriptions`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const apiResponse: MySubscriptionsResponse = await response.json();

      if (!apiResponse.success || !apiResponse.data) {
        throw new Error('Invalid my subscriptions response from server');
      }

      return apiResponse.data;
    } catch (error) {
      console.error('Failed to fetch my subscriptions:', error);
      throw new Error('Failed to fetch your subscriptions. Please try again.');
    }
  }

  // My Subscriptions - Add Preset
  async addPresetSubscription(data: AddPresetSubscriptionRequest): Promise<MySubscription> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await this.fetchWithTimeout(`${this.baseUrl}/api/my-subscriptions/preset`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const apiResponse = await response.json();

      if (!apiResponse.success || !apiResponse.data) {
        throw new Error('Invalid add subscription response from server');
      }

      return apiResponse.data;
    } catch (error) {
      console.error('Failed to add preset subscription:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to add subscription. Please try again.');
    }
  }

  // My Subscriptions - Add Custom
  async addCustomSubscription(data: AddCustomSubscriptionRequest): Promise<MySubscription> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await this.fetchWithTimeout(`${this.baseUrl}/api/my-subscriptions/custom`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const apiResponse = await response.json();

      if (!apiResponse.success || !apiResponse.data) {
        throw new Error('Invalid add custom subscription response from server');
      }

      return apiResponse.data;
    } catch (error) {
      console.error('Failed to add custom subscription:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to add custom subscription. Please try again.');
    }
  }

  // My Subscriptions - Update
  async updateSubscription(id: number, data: UpdateSubscriptionRequest): Promise<MySubscription> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await this.fetchWithTimeout(`${this.baseUrl}/api/my-subscriptions/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const apiResponse = await response.json();

      if (!apiResponse.success || !apiResponse.data) {
        throw new Error('Invalid update subscription response from server');
      }

      return apiResponse.data;
    } catch (error) {
      console.error('Failed to update subscription:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to update subscription. Please try again.');
    }
  }

  // My Subscriptions - Delete
  async deleteSubscription(id: number): Promise<void> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await this.fetchWithTimeout(`${this.baseUrl}/api/my-subscriptions/${id}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const apiResponse = await response.json();

      if (!apiResponse.success) {
        throw new Error('Failed to delete subscription');
      }
    } catch (error) {
      console.error('Failed to delete subscription:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to delete subscription. Please try again.');
    }
  }
}

export const catalogService = new CatalogService();

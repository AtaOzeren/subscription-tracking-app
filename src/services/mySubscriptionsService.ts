import { Api, ContentType } from './tracking/tracking-api';
import { storageService } from './storageService';
import { UserSubscription, MySubscriptionsResponse, ApiSubscription } from '../types/subscription';
import Constants from 'expo-constants';

class MySubscriptionsService {
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

  async getMySubscriptions(): Promise<UserSubscription[]> {
    try {
      await this.initializeApi();
      
      const response = await this.api.request({
        path: '/api/my-subscriptions',
        method: 'GET',
        secure: true,
        format: 'json'
      }) as any;
      
      // Extract the actual data from the response
      let responseData: MySubscriptionsResponse;
      
      if (response.data && response.data.success !== undefined) {
        responseData = response.data;
      } else if (response.success !== undefined && Array.isArray(response.data)) {
        responseData = response;
      } else {
        console.error('[MySubscriptions] Invalid response structure:', response);
        throw new Error('Invalid API response structure');
      }
      
      // Check if we have valid data
      if (!responseData.data || !Array.isArray(responseData.data)) {
        console.error('[MySubscriptions] Invalid data array:', responseData);
        throw new Error('Invalid data array in response');
      }
      
      // Transform each subscription asynchronously
      const transformedSubscriptions = await Promise.all(
        responseData.data.map(apiSub => this.transformApiSubscription(apiSub))
      );
      
      return transformedSubscriptions;
    } catch (error) {
      console.error('[MySubscriptions] Error fetching subscriptions:', error);
      throw error;
    }
  }

  async transformApiSubscription(apiSub: ApiSubscription): Promise<UserSubscription> {
    if (apiSub.subscription_type === 'custom') {
      return {
        id: apiSub.id,
        name: apiSub.custom_name!,
        category: apiSub.custom_category!,
        price: apiSub.price || apiSub.custom_price || 0,
        currency: apiSub.currency || apiSub.custom_currency || 'USD',
        billingCycle: (apiSub.billing_cycle || apiSub.custom_billing_cycle) as any,
        nextBillingDate: apiSub.next_billing_date,
        status: apiSub.status as any,
        notes: apiSub.notes || undefined,
        isCustom: true,
      };
    } else {
      // For preset subscriptions, prefer user's currency from plan.prices if available
      let price = apiSub.price;
      let currency = apiSub.currency;
      
      // Always check if we can match user's preferred currency from plan.prices
      if (apiSub.plan?.prices && apiSub.plan.prices.length > 0) {
        const userCurrency = await this.getUserPreferredCurrency();
        const matchedPrice = apiSub.plan.prices.find(p => p.currency === userCurrency);
        
        if (matchedPrice) {
          price = matchedPrice.price;
          currency = matchedPrice.currency;
        } else if (!price || price === 0) {
          price = apiSub.plan.prices[0].price;
          currency = apiSub.plan.prices[0].currency;
        }
      } else if (!price || price === 0) {
        console.warn('[MySubscriptions] No price available for subscription:', apiSub.id);
      }
      
      return {
        id: apiSub.id,
        name: apiSub.plan!.subscription.name,
        category: apiSub.plan!.subscription.category,
        price: price || 0,
        currency: currency || 'USD',
        billingCycle: (apiSub.billing_cycle || apiSub.plan!.billing_cycle) as any,
        nextBillingDate: apiSub.next_billing_date,
        status: apiSub.status as any,
        notes: apiSub.notes || undefined,
        logoUrl: apiSub.plan!.subscription.logo_url,
        isCustom: false,
        planName: apiSub.plan!.name,
        features: apiSub.plan!.features,
      };
    }
  }
  
  private async getUserPreferredCurrency(): Promise<string> {
    try {
      const user = await storageService.getUser();
      return user?.currency || 'USD';
    } catch (error) {
      console.error('[MySubscriptions] Error getting user currency:', error);
      return 'USD';
    }
  }

  async deleteSubscription(id: number): Promise<void> {
    try {
      await this.initializeApi();
      await this.api.request({
        path: `/api/my-subscriptions/${id}`,
        method: 'DELETE',
        secure: true
      });
    } catch (error) {
      console.error('[MySubscriptions] Error deleting subscription:', error);
      throw error;
    }
  }

  async updateSubscription(id: number, updates: any): Promise<void> {
    try {
      await this.initializeApi();
      await this.api.request({
        path: `/api/my-subscriptions/${id}`,
        method: 'PUT',
        body: updates,
        type: ContentType.Json,
        secure: true
      });
    } catch (error) {
      console.error('[MySubscriptions] Error updating subscription:', error);
      throw error;
    }
  }
}

export const mySubscriptionsService = new MySubscriptionsService();
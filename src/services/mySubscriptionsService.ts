import { Api, ContentType } from './tracking/tracking-api';
import { storageService } from './storageService';
import { UserSubscription, MySubscriptionsResponse, ApiSubscription } from '../types/subscription';
import Constants from 'expo-constants';

class MySubscriptionsService {
  private api: Api<string>;

  constructor() {
    const apiBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl || 'http://localhost:5001';
    console.log('🌐 MySubscriptions - Initializing with baseUrl:', apiBaseUrl);
    
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
    console.log('🔑 MySubscriptions - Token retrieved:', token ? `${token.substring(0, 20)}...` : 'none');
    if (token) {
      this.api.setSecurityData(token);
      console.log('✅ MySubscriptions - Security data set');
    } else {
      console.log('❌ MySubscriptions - No token found');
    }
  }

  async getMySubscriptions(): Promise<UserSubscription[]> {
    try {
      console.log('🔄 MySubscriptions - Starting getMySubscriptions');
      await this.initializeApi();
      
      console.log('📡 MySubscriptions - Making API call to /api/my-subscriptions');
      const response = await this.api.request({
        path: '/api/my-subscriptions',
        method: 'GET',
        secure: true,
        format: 'json'
      }) as any;
      console.log('📡 MySubscriptions - Response received:', response);
      
      // Extract the actual data from the response
      // The response structure is: { success: true, count: number, data: ApiSubscription[] }
      let responseData: MySubscriptionsResponse;
      
      if (response.data && response.data.success !== undefined) {
        // If response has a nested data property with success field
        responseData = response.data;
      } else if (response.success !== undefined && Array.isArray(response.data)) {
        // If response is already the data object
        responseData = response;
      } else {
        console.error('❌ MySubscriptions - Unexpected response structure:', response);
        throw new Error('Invalid API response structure');
      }
      
      console.log('📦 MySubscriptions - Extracted data:', responseData);
      
      // Check if we have valid data
      if (!responseData.data || !Array.isArray(responseData.data)) {
        console.error('❌ MySubscriptions - Invalid data array:', responseData);
        throw new Error('Invalid data array in response');
      }
      
      // Transform each subscription asynchronously
      const transformedSubscriptions = await Promise.all(
        responseData.data.map(apiSub => this.transformApiSubscription(apiSub))
      );
      
      console.log('✅ MySubscriptions - Successfully loaded', transformedSubscriptions.length);
      return transformedSubscriptions;
    } catch (error) {
      console.error('❌ MySubscriptions - Error fetching:', error);
      throw error;
    }
  }

  async transformApiSubscription(apiSub: ApiSubscription): Promise<UserSubscription> {
    // The API now includes price, currency, and billing_cycle at the root level
    // regardless of whether it's custom or preset subscription
    console.log('💰 Transforming subscription:', {
      id: apiSub.id,
      type: apiSub.subscription_type,
      price: apiSub.price,
      currency: apiSub.currency,
      billing_cycle: apiSub.billing_cycle
    });
    
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
        // Try to get user's preferred currency
        const userCurrency = await this.getUserPreferredCurrency();
        console.log('👤 User preferred currency:', userCurrency);
        console.log('📋 Available prices:', apiSub.plan.prices);
        
        // Try to find price matching user's currency
        const matchedPrice = apiSub.plan.prices.find(p => p.currency === userCurrency);
        
        if (matchedPrice) {
          // Use the price in user's preferred currency
          price = matchedPrice.price;
          currency = matchedPrice.currency;
          console.log('✅ Using user currency price:', price, currency);
        } else if (!price || price === 0) {
          // User's currency not available, use first available price as fallback
          price = apiSub.plan.prices[0].price;
          currency = apiSub.plan.prices[0].currency;
          console.log('⚠️  User currency not available, using fallback:', price, currency);
        } else {
          // Keep the price from root level (backend's selection)
          console.log('ℹ️  Using backend-provided price:', price, currency);
        }
      } else if (!price || price === 0) {
        console.warn('⚠️  No price available for subscription:', apiSub.id);
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
      console.error('Error getting user currency:', error);
      return 'USD';
    }
  }

  async deleteSubscription(id: number): Promise<void> {
    try {
      await this.initializeApi();
      // Use the HttpClient directly to override the path
      await this.api.request({
        path: `/api/my-subscriptions/${id}`,
        method: 'DELETE',
        secure: true
      });
    } catch (error) {
      console.error('Error deleting subscription:', error);
      throw error;
    }
  }

  async updateSubscription(id: number, updates: any): Promise<void> {
    try {
      await this.initializeApi();
      // Use the HttpClient directly to override the path
      await this.api.request({
        path: `/api/my-subscriptions/${id}`,
        method: 'PUT',
        body: updates,
        type: ContentType.Json,
        secure: true
      });
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  }
}

export const mySubscriptionsService = new MySubscriptionsService();
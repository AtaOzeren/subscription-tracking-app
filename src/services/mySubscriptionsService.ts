import { Api, ContentType } from './tracking/tracking-api';
import { storageService } from './storageService';
import { UserSubscription, MySubscriptionsResponse, ApiSubscription } from '../types/subscription';

class MySubscriptionsService {
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
      
      console.log('📡 MySubscriptions - Making API call with secure: true, format: json');
      const response = await this.api.api.getMySubscriptions({ 
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
    if (apiSub.subscription_type === 'custom') {
      return {
        id: apiSub.id,
        name: apiSub.custom_name!,
        category: apiSub.custom_category!,
        price: apiSub.custom_price!,
        currency: apiSub.custom_currency!,
        billingCycle: apiSub.custom_billing_cycle as any,
        nextBillingDate: apiSub.next_billing_date,
        status: apiSub.status as any,
        notes: apiSub.notes || undefined,
        isCustom: true,
      };
    } else {
      // For preset subscriptions, try to get pricing from plan details
      let price = 0;
      let currency = 'USD';
      
      try {
        await this.initializeApi();
        const planResponse = await this.api.request({
          path: `/api/catalog/subscriptions/${apiSub.plan!.subscription.id}/plans`,
          method: 'GET',
          secure: true
        }) as any;
        
        // Find the specific plan and get its price
        if (planResponse && Array.isArray(planResponse)) {
          const currentPlan = planResponse.find((plan: any) => plan.id === apiSub.plan!.id);
          if (currentPlan && currentPlan.prices && currentPlan.prices.length > 0) {
            // Get the first price or price for user's region
            price = currentPlan.prices[0].price || 0;
            currency = currentPlan.prices[0].currency || 'USD';
          }
        }
      } catch (error) {
        console.warn('Could not fetch plan pricing, using default:', error);
        // Use default price if we can't fetch actual pricing
        price = 9.99; // Default fallback price
      }

      return {
        id: apiSub.id,
        name: apiSub.plan!.subscription.name,
        category: apiSub.plan!.subscription.category,
        price,
        currency,
        billingCycle: apiSub.plan!.billing_cycle as any,
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
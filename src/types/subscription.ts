// API Response Types
export interface ApiSubscription {
  id: number;
  user_id: number;
  subscription_type: 'preset' | 'custom';
  plan_id: number | null;
  custom_name: string | null;
  custom_category_id: number | null;
  custom_price: number | null;
  custom_currency: string | null;
  custom_billing_cycle: string | null;
  start_date: string;
  next_billing_date: string;
  status: 'active' | 'cancelled' | 'expired' | 'paused';
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  plan: Plan | null;
  custom_category: CustomCategory | null;
}

export interface Plan {
  id: number;
  name: string;
  features: Record<string, any>;
  subscription: {
    id: number;
    name: string;
    category: {
      id: number;
      name: string;
      icon_url: string;
    };
    logo_url: string;
  };
  billing_cycle: string;
}

export interface CustomCategory {
  id: number;
  name: string;
  icon_url: string;
}

// Unified Subscription Type for UI
export interface UserSubscription {
  id: number;
  name: string;
  category: {
    id: number;
    name: string;
    icon_url: string;
  };
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly' | 'weekly' | 'daily';
  nextBillingDate: string;
  status: 'active' | 'cancelled' | 'expired' | 'paused';
  notes?: string;
  logoUrl?: string;
  isCustom: boolean;
  planName?: string;
  features?: Record<string, any>;
}

export interface MySubscriptionsResponse {
  success: boolean;
  count: number;
  data: ApiSubscription[];
}

// Legacy interfaces for backward compatibility
export interface Subscription {
  id: string;
  name: string;
  category: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly' | 'weekly' | 'daily';
  nextBillingDate: string;
  isActive: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface SubscriptionStats {
  totalMonthly: number;
  totalYearly: number;
  activeSubscriptions: number;
  categoriesCount: Record<string, number>;
}
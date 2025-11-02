// Catalog API Types

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon_url: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CatalogSubscription {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  logo_url: string;
  website_url: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  category: Category;
}

export interface Price {
  id: number;
  price: number;
  region: string;
  currency: string;
}

export interface PlanFeatures {
  [key: string]: any;
}

export interface Plan {
  id: number;
  subscription_id: number;
  name: string;
  slug: string;
  features: PlanFeatures;
  billing_cycle: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  prices: Price[];
}

export interface SubscriptionWithPlans extends CatalogSubscription {
  plans: Plan[];
}

// My Subscriptions Types
export interface MySubscription {
  id: number;
  user_id: number;
  plan_id?: number;
  custom_name?: string;
  custom_category_id?: number;
  custom_price?: number;
  custom_currency?: string;
  custom_billing_cycle?: string;
  start_date: string;
  next_billing_date: string;
  status: 'active' | 'cancelled' | 'paused';
  notes?: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// Request Types
export interface AddPresetSubscriptionRequest {
  plan_id: number;
  start_date: string;
  next_billing_date: string;
  notes?: string;
}

export interface AddCustomSubscriptionRequest {
  custom_name: string;
  custom_category_id: number;
  custom_price: number;
  custom_currency: string;
  custom_billing_cycle: string;
  start_date: string;
  next_billing_date: string;
  notes?: string;
}

export interface UpdateSubscriptionRequest {
  custom_price?: number;
  next_billing_date?: string;
  status?: 'active' | 'cancelled' | 'paused';
  notes?: string;
}

// Response Types
export interface CategoriesResponse {
  success: boolean;
  count: number;
  data: Category[];
}

export interface SubscriptionsResponse {
  success: boolean;
  count: number;
  data: CatalogSubscription[];
}

export interface SubscriptionDetailResponse {
  success: boolean;
  data: SubscriptionWithPlans;
}

export interface PlansResponse {
  success: boolean;
  count: number;
  data: Plan[];
}

export interface MySubscriptionsResponse {
  success: boolean;
  count: number;
  data: MySubscription[];
}

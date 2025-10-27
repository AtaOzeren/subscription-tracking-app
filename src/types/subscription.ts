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
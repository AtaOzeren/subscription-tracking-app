// Stats API Response Types

export interface StatsSummary {
  total_subscriptions: number;
  active_subscriptions: number;
  monthly_spending: number;
  lifetime_spending: number;
  currency: string;
}

export interface CurrentMonthBreakdown {
  subscription_name: string;
  monthly_cost: number;
  percentage: number;
  category: string;
  logo_url?: string;
}

export interface SubscriptionDetail {
  id: number;
  name: string;
  price: number;
  currency: string;
  billing_cycle: 'daily' | 'weekly' | 'monthly' | 'yearly';
  monthly_equivalent: number;
  next_billing_date: string;
  category: string;
  logo_url?: string;
  status: string;
}

export interface SpendingTrend {
  month: string;
  total_spending: number;
}

export interface DetailedStatsResponse {
  summary: StatsSummary;
  current_month_breakdown: CurrentMonthBreakdown[];
  subscriptions: SubscriptionDetail[];
  spending_trends: SpendingTrend[];
  projected_annual_cost: number;
}

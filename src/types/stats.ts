// Stats API Response Types

export interface StatsSummary {
  total_subscriptions: number;
  active_subscriptions: number;
  cancelled_subscriptions: number;
  inactive_subscriptions: number;
  current_month_total: number;
  total_lifetime_spending: number;
  currency_breakdown: {
    [currency: string]: number;
  };
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
  spending_trends: {
    last_6_months: SpendingTrend[];
  };
  projected_annual_cost: number;
  projected_annual_cost_by_currency: {
    [currency: string]: number;
  };
  most_expensive_subscription: any | null;
}

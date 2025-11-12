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
  subscription_id: number;
  subscription_name: string;
  amount: number;
  currency: string;
  percentage: number;
}

export interface SubscriptionDetail {
  id: number;
  name: string;
  type: string;
  status: string;
  price_per_cycle: number;
  currency: string;
  billing_cycle: 'daily' | 'weekly' | 'monthly' | 'yearly';
  monthly_equivalent: number;
  next_billing_date: string;
  start_date: string;
  billing_cycles_completed: number;
  total_spent: number;
  duration_months: number;
  current_month_percentage: number;
}

export interface SpendingTrend {
  month: string;
  amount: number;
  currency_breakdown: {
    [currency: string]: number;
  };
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

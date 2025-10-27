import { SubscriptionCategory } from '../types/subscription';

export const DEFAULT_CATEGORIES: SubscriptionCategory[] = [
  { id: '1', name: 'Entertainment', color: '#FF6B6B', icon: '🎬' },
  { id: '2', name: 'Productivity', color: '#4ECDC4', icon: '💼' },
  { id: '3', name: 'Health & Fitness', color: '#45B7D1', icon: '💪' },
  { id: '4', name: 'Education', color: '#96CEB4', icon: '📚' },
  { id: '5', name: 'Music', color: '#FFEAA7', icon: '🎵' },
  { id: '6', name: 'News', color: '#DDA0DD', icon: '📰' },
  { id: '7', name: 'Gaming', color: '#98D8C8', icon: '🎮' },
  { id: '8', name: 'Cloud Storage', color: '#87CEEB', icon: '☁️' },
  { id: '9', name: 'Software', color: '#F7DC6F', icon: '⚙️' },
  { id: '10', name: 'Other', color: '#BDC3C7', icon: '📦' },
];

export const CURRENCIES = [
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
  { code: 'TRY', symbol: '₺' },
  { code: 'JPY', symbol: '¥' },
];

export const BILLING_CYCLES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
] as const;
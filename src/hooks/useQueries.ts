import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { mySubscriptionsService } from '../services/mySubscriptionsService';
import { statsService } from '../services/statsService';
import { catalogService } from '../services/catalogService';
import { UserSubscription } from '../types/subscription';
import { DetailedStatsResponse } from '../types/stats';
import { Category, CatalogSubscription, SubscriptionWithPlans, Plan } from '../types/catalog';

/**
 * Query Keys
 * Centralized query keys for consistent cache management
 */
export const queryKeys = {
  subscriptions: ['subscriptions'] as const,
  stats: ['stats'] as const,
  categories: ['categories'] as const,
  catalogSubscriptions: (categoryId?: number) => 
    categoryId ? ['catalogSubscriptions', categoryId] : ['catalogSubscriptions'] as const,
  subscriptionDetails: (id: number) => ['subscriptionDetails', id] as const,
  subscriptionPlans: (id: number) => ['subscriptionPlans', id] as const,
};

/**
 * Hook: useMySubscriptions
 * Fetches user's subscriptions with caching
 * This hook is used by both HomeScreen and SubscriptionsScreen
 * Data is shared between screens - no duplicate requests!
 */
export const useMySubscriptions = (): UseQueryResult<UserSubscription[], Error> => {
  return useQuery({
    queryKey: queryKeys.subscriptions,
    queryFn: () => mySubscriptionsService.getMySubscriptions(),
    staleTime: 5 * 60 * 1000, // Data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });
};

/**
 * Hook: useDetailedStats
 * Fetches detailed statistics with caching
 * Used by StatisticsScreen
 */
export const useDetailedStats = (): UseQueryResult<DetailedStatsResponse, Error> => {
  return useQuery({
    queryKey: queryKeys.stats,
    queryFn: () => statsService.getDetailedStats(),
    staleTime: 5 * 60 * 1000, // Data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });
};

/**
 * Hook: useCategories
 * Fetches subscription categories with caching
 */
export const useCategories = (): UseQueryResult<Category[], Error> => {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: () => catalogService.getCategories(),
    staleTime: 30 * 60 * 1000, // Categories change rarely - fresh for 30 minutes
    gcTime: 60 * 60 * 1000, // Keep in cache for 1 hour
  });
};

/**
 * Hook: useCatalogSubscriptions
 * Fetches catalog subscriptions with optional category filter
 */
export const useCatalogSubscriptions = (categoryId?: number): UseQueryResult<CatalogSubscription[], Error> => {
  return useQuery({
    queryKey: queryKeys.catalogSubscriptions(categoryId),
    queryFn: () => catalogService.getCatalogSubscriptions(categoryId),
    staleTime: 10 * 60 * 1000, // Fresh for 10 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
  });
};

/**
 * Hook: useSubscriptionDetails
 * Fetches details for a specific subscription
 */
export const useSubscriptionDetails = (subscriptionId: number): UseQueryResult<SubscriptionWithPlans, Error> => {
  return useQuery({
    queryKey: queryKeys.subscriptionDetails(subscriptionId),
    queryFn: () => catalogService.getSubscriptionDetails(subscriptionId),
    staleTime: 10 * 60 * 1000, // Fresh for 10 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    enabled: !!subscriptionId, // Only fetch if ID is valid
  });
};

/**
 * Hook: useSubscriptionPlans
 * Fetches plans for a specific subscription
 */
export const useSubscriptionPlans = (subscriptionId: number): UseQueryResult<Plan[], Error> => {
  return useQuery({
    queryKey: queryKeys.subscriptionPlans(subscriptionId),
    queryFn: () => catalogService.getSubscriptionPlans(subscriptionId),
    staleTime: 10 * 60 * 1000, // Fresh for 10 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    enabled: !!subscriptionId, // Only fetch if ID is valid
  });
};

/**
 * Hook: useDeleteSubscription
 * Mutation for deleting a subscription with automatic cache invalidation
 */
export const useDeleteSubscription = (): UseMutationResult<void, Error, number, unknown> => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => mySubscriptionsService.deleteSubscription(id),
    onSuccess: () => {
      // Invalidate and refetch subscriptions and stats after deletion
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats });
    },
  });
};

/**
 * Hook: useUpdateSubscription
 * Mutation for updating a subscription with automatic cache invalidation
 */
export const useUpdateSubscription = (): UseMutationResult<void, Error, { id: number; updates: any }, unknown> => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: any }) => 
      mySubscriptionsService.updateSubscription(id, updates),
    onSuccess: () => {
      // Invalidate and refetch subscriptions and stats after update
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats });
    },
  });
};

/**
 * Hook: useAddPresetSubscription
 * Mutation for adding a preset subscription
 */
export const useAddPresetSubscription = (): UseMutationResult<any, Error, any, unknown> => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => catalogService.addPresetSubscription(data),
    onSuccess: () => {
      // Invalidate and refetch after adding new subscription
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats });
    },
  });
};

/**
 * Hook: useAddCustomSubscription
 * Mutation for adding a custom subscription
 */
export const useAddCustomSubscription = (): UseMutationResult<any, Error, any, unknown> => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => catalogService.addCustomSubscription(data),
    onSuccess: () => {
      // Invalidate and refetch after adding new subscription
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats });
    },
  });
};

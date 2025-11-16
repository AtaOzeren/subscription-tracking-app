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
 * Mutation for deleting a subscription with OPTIMISTIC UPDATE
 * UI updates immediately, then confirms with server
 */
export const useDeleteSubscription = (): UseMutationResult<void, Error, number, { previousSubscriptions?: UserSubscription[] }> => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => mySubscriptionsService.deleteSubscription(id),
    
    // OPTIMISTIC UPDATE: Remove from UI immediately
    onMutate: async (deletedId) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: queryKeys.subscriptions });
      
      // Snapshot the previous value for rollback
      const previousSubscriptions = queryClient.getQueryData<UserSubscription[]>(queryKeys.subscriptions);
      
      // Optimistically update the cache by removing the subscription
      queryClient.setQueryData<UserSubscription[]>(
        queryKeys.subscriptions,
        (old) => old?.filter(sub => sub.id !== deletedId) ?? []
      );
      
      // Return context with the previous data (for rollback if needed)
      return { previousSubscriptions };
    },
    
    // If mutation fails, rollback to previous state
    onError: (err, deletedId, context) => {
      if (context?.previousSubscriptions) {
        queryClient.setQueryData(queryKeys.subscriptions, context.previousSubscriptions);
      }
    },
    
    // After success or error, refetch to ensure we're in sync with server
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats });
    },
  });
};

/**
 * Hook: useUpdateSubscription
 * Mutation for updating a subscription with OPTIMISTIC UPDATE
 * UI updates immediately, then confirms with server
 */
export const useUpdateSubscription = (): UseMutationResult<void, Error, { id: number; updates: any }, { previousSubscriptions?: UserSubscription[] }> => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: any }) => 
      mySubscriptionsService.updateSubscription(id, updates),
    
    // OPTIMISTIC UPDATE: Update UI immediately
    onMutate: async ({ id, updates }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: queryKeys.subscriptions });
      
      // Snapshot previous value
      const previousSubscriptions = queryClient.getQueryData<UserSubscription[]>(queryKeys.subscriptions);
      
      // Optimistically update the subscription in cache
      queryClient.setQueryData<UserSubscription[]>(
        queryKeys.subscriptions,
        (old) => old?.map(sub => {
          if (sub.id === id) {
            return {
              ...sub,
              // Apply the updates
              price: updates.custom_price ?? sub.price,
              nextBillingDate: updates.next_billing_date ?? sub.nextBillingDate,
              status: updates.status ?? sub.status,
              notes: updates.notes ?? sub.notes,
            };
          }
          return sub;
        }) ?? []
      );
      
      return { previousSubscriptions };
    },
    
    // Rollback on error
    onError: (err, variables, context) => {
      if (context?.previousSubscriptions) {
        queryClient.setQueryData(queryKeys.subscriptions, context.previousSubscriptions);
      }
    },
    
    // Refetch to sync with server
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats });
    },
  });
};

/**
 * Hook: useAddPresetSubscription
 * Mutation for adding a preset subscription with OPTIMISTIC UPDATE
 * Immediately adds to cache, then syncs with server response
 */
export const useAddPresetSubscription = (): UseMutationResult<any, Error, any, { previousSubscriptions?: UserSubscription[] }> => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => catalogService.addPresetSubscription(data),
    
    // OPTIMISTIC UPDATE: Add temporary subscription immediately
    onMutate: async (newSubscriptionData) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: queryKeys.subscriptions });
      
      // Snapshot previous value
      const previousSubscriptions = queryClient.getQueryData<UserSubscription[]>(queryKeys.subscriptions);
      
      // Note: For adding, we can't show the full subscription immediately 
      // because we don't have the server-generated ID yet.
      // We'll use fast invalidation instead for near-instant update
      
      return { previousSubscriptions };
    },
    
    // On success, immediately refetch to get the actual subscription with ID
    onSuccess: () => {
      // Invalidate and refetch immediately (this happens very fast with our cache)
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats });
    },
    
    // Rollback on error
    onError: (err, variables, context) => {
      if (context?.previousSubscriptions) {
        queryClient.setQueryData(queryKeys.subscriptions, context.previousSubscriptions);
      }
    },
  });
};

/**
 * Hook: useAddCustomSubscription
 * Mutation for adding a custom subscription with OPTIMISTIC UPDATE
 * Immediately adds to cache, then syncs with server response
 */
export const useAddCustomSubscription = (): UseMutationResult<any, Error, any, { previousSubscriptions?: UserSubscription[] }> => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: any) => catalogService.addCustomSubscription(data),
    
    // OPTIMISTIC UPDATE: Add temporary subscription immediately
    onMutate: async (newSubscriptionData) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: queryKeys.subscriptions });
      
      // Snapshot previous value
      const previousSubscriptions = queryClient.getQueryData<UserSubscription[]>(queryKeys.subscriptions);
      
      // Note: For adding, we can't show the full subscription immediately 
      // because we don't have the server-generated ID yet.
      // We'll use fast invalidation instead for near-instant update
      
      return { previousSubscriptions };
    },
    
    // On success, immediately refetch to get the actual subscription with ID
    onSuccess: () => {
      // Invalidate and refetch immediately (this happens very fast with our cache)
      queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats });
    },
    
    // Rollback on error
    onError: (err, variables, context) => {
      if (context?.previousSubscriptions) {
        queryClient.setQueryData(queryKeys.subscriptions, context.previousSubscriptions);
      }
    },
  });
};

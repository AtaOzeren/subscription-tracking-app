import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Plan, Price } from '../../types/catalog';
import { formatPrice } from '../../utils/currency';

interface PlanSelectorProps {
  plans: Plan[];
  onSelectPlan: (plan: Plan) => void;
  userRegion?: string;
  title?: string;
  subtitle?: string;
}

const PlanSelector: React.FC<PlanSelectorProps> = ({
  plans,
  onSelectPlan,
  userRegion,
  title = 'Select a Plan',
  subtitle = 'Choose the plan that works best for you',
}) => {
  const getUserPrice = (prices: Price[]): Price | undefined => {
    return prices.find(p => p.region === userRegion) || prices[0];
  };

  return (
    <View className="flex-1">
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingTop: 16 }}>
        {(title || subtitle) && (
          <View className="mb-6">
            {title && (
              <Text className="text-heading-2 text-text-primary mb-2 text-center font-display">
                {title}
              </Text>
            )}
            {subtitle && (
              <Text className="text-body-lg text-text-muted text-center font-text">
                {subtitle}
              </Text>
            )}
          </View>
        )}

        {plans.map((plan) => {
          const price = getUserPrice(plan.prices);
          return (
            <TouchableOpacity
              key={plan.id}
              onPress={() => onSelectPlan(plan)}
              className="bg-white rounded-2xl p-6 mb-4 shadow-card"
            >
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-heading-3 text-text-primary font-display">
                  {plan.name}
                </Text>
                {price && (
                  <Text className="text-2xl font-bold text-tracking-black font-display">
                    {formatPrice(price.price, price.currency)}
                  </Text>
                )}
              </View>

              <Text className="text-body-md text-text-tertiary mb-3 font-text">
                Billed {plan.billing_cycle}
              </Text>

              {plan.features && Object.keys(plan.features).length > 0 && (
                <View className="border-t border-gray-200 pt-3">
                  {Object.entries(plan.features).map(([key, value]) => (
                    <View key={key} className="flex-row items-center mb-2">
                      <Text className="mr-2">✓</Text>
                      <Text className="text-body-md text-text-secondary font-text">
                        {key}: {String(value)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default PlanSelector;

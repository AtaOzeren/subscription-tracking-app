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
              <Text
                className="text-heading-2 text-text-primary mb-2 text-center"
                style={{ fontFamily: 'SF Pro Display' }}
              >
                {title}
              </Text>
            )}
            {subtitle && (
              <Text
                className="text-body-lg text-text-muted text-center"
                style={{ fontFamily: 'SF Pro Text' }}
              >
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
              className="bg-white rounded-2xl p-6 mb-4"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <View className="flex-row items-center justify-between mb-3">
                <Text
                  className="text-heading-3 text-text-primary"
                  style={{ fontFamily: 'SF Pro Display' }}
                >
                  {plan.name}
                </Text>
                {price && (
                  <Text
                    className="text-2xl font-bold text-black"
                    style={{ fontFamily: 'SF Pro Display' }}
                  >
                    {formatPrice(price.price, price.currency)}
                  </Text>
                )}
              </View>

              <Text
                className="text-body-md text-text-tertiary mb-3"
                style={{ fontFamily: 'SF Pro Text' }}
              >
                Billed {plan.billing_cycle}
              </Text>

              {plan.features && Object.keys(plan.features).length > 0 && (
                <View className="border-t border-gray-200 pt-3">
                  {Object.entries(plan.features).map(([key, value]) => (
                    <View key={key} className="flex-row items-center mb-2">
                      <Text className="mr-2">✓</Text>
                      <Text
                        className="text-body-md text-text-secondary"
                        style={{ fontFamily: 'SF Pro Text' }}
                      >
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

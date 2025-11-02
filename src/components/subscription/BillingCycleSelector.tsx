import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

type BillingCycle = 'weekly' | 'monthly' | 'yearly';

interface BillingCycleSelectorProps {
  selectedCycle: BillingCycle;
  onSelectCycle: (cycle: BillingCycle) => void;
  label?: string;
  required?: boolean;
}

const BillingCycleSelector: React.FC<BillingCycleSelectorProps> = ({
  selectedCycle,
  onSelectCycle,
  label = 'Billing Cycle',
  required = false,
}) => {
  const cycles: BillingCycle[] = ['weekly', 'monthly', 'yearly'];

  return (
    <View className="bg-white rounded-2xl p-4 mb-4">
      <Text
        className="text-sm font-semibold text-gray-700 mb-2"
        style={{ fontFamily: 'SF Pro Display' }}
      >
        {label} {required && '*'}
      </Text>
      <View className="flex-row">
        {cycles.map((cycle) => (
          <TouchableOpacity
            key={cycle}
            onPress={() => onSelectCycle(cycle)}
            className={`flex-1 mr-2 py-3 rounded-xl items-center ${
              selectedCycle === cycle ? 'bg-black' : 'bg-gray-100'
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                selectedCycle === cycle ? 'text-white' : 'text-gray-700'
              }`}
              style={{ fontFamily: 'SF Pro Display' }}
            >
              {cycle.charAt(0).toUpperCase() + cycle.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default BillingCycleSelector;

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const cycles: BillingCycle[] = ['weekly', 'monthly', 'yearly'];

  return (
    <View className="bg-white rounded-2xl p-4 mb-4">
      <Text
        className="text-body-md text-text-secondary font-semibold mb-2"
        style={{ fontFamily: 'SF Pro Display' }}
      >
        {label} {required && '*'}
      </Text>
      <View className="flex-row">
        {cycles.map((cycle) => (
          <TouchableOpacity
            key={cycle}
            onPress={() => onSelectCycle(cycle)}
            className={`flex-1 mr-2 py-3 rounded-xl items-center ${selectedCycle === cycle ? 'bg-tracking-blue' : 'bg-gray-100'
              }`}
          >
            <Text
              className={`text-sm font-semibold ${selectedCycle === cycle ? 'text-white' : 'text-text-secondary'
                }`}
              style={{ fontFamily: 'SF Pro Display' }}
            >
              {t(`billingCycle.${cycle}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default BillingCycleSelector;

import React from 'react';
import { View } from 'react-native';

interface ProgressIndicatorProps {
  totalSteps: number;
  currentStep: number;
}

/**
 * Progress indicator showing dots for onboarding flow
 * @param totalSteps - Total number of steps (default: 4)
 * @param currentStep - Current active step (1-indexed, e.g., 1, 2, 3, 4)
 */
const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ 
  totalSteps = 4, 
  currentStep 
}) => {
  return (
    <View className="flex-row gap-2">
      {Array.from({ length: totalSteps }).map((_, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        
        return (
          <View
            key={stepNumber}
            className={`w-2 h-2 rounded-full border-2 ${
              isActive 
                ? 'border-black bg-black' 
                : 'border-gray-400 bg-transparent'
            }`}
          />
        );
      })}
    </View>
  );
};

export default ProgressIndicator;

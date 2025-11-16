import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useError } from '../../contexts/ErrorContext';
import { Ionicons } from '@expo/vector-icons';

const ErrorModal: React.FC = () => {
  const { t } = useTranslation();
  const { error, clearError, actions } = useError();

  if (!error) return null;

  const hasCustomActions = actions && actions.length > 0;

  return (
    <Modal
      visible={!!error}
      transparent
      animationType="fade"
      onRequestClose={clearError}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-6">
        <View className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
          {/* Header */}
          <View className="bg-red-50 px-6 pt-8 pb-6 items-center">
            <View className="bg-red-100 rounded-full p-4 mb-4">
              <Ionicons name="alert-circle" size={48} color="#DC2626" />
            </View>
            <Text className="text-heading-3 text-text-primary font-display text-center">
              {t('error.title')}
            </Text>
          </View>

          {/* Content */}
          <ScrollView className="px-6 py-6 max-h-96">
            {/* Error Message */}
            <Text className="text-heading-4 text-text-primary font-display mb-3 text-center">
              {t(error.message)}
            </Text>

            {/* Error Details */}
            {error.details && (
              <Text className="text-body-md text-text-secondary font-text text-center mb-4">
                {typeof error.details === 'string' && error.details.startsWith('error.') 
                  ? t(error.details) 
                  : error.details}
              </Text>
            )}

            {/* Technical Details (only in dev mode) */}
            {__DEV__ && error.technicalDetails && (
              <View className="bg-gray-100 rounded-xl p-4 mt-4">
                <Text className="text-caption text-text-tertiary font-mono mb-2">
                  Technical Details:
                </Text>
                <Text className="text-caption text-text-tertiary font-mono">
                  {error.type}
                </Text>
                {error.timestamp && (
                  <Text className="text-caption text-text-tertiary font-mono mt-1">
                    {error.timestamp.toLocaleString()}
                  </Text>
                )}
              </View>
            )}
          </ScrollView>

          {/* Actions */}
          <View className="px-6 pb-6">
            {hasCustomActions ? (
              // Custom actions provided
              <View className="gap-3">
                {actions.map((action, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      action.onPress();
                      clearError();
                    }}
                    className={`py-4 px-6 rounded-xl ${
                      index === 0 ? 'bg-black' : 'bg-gray-100'
                    }`}
                  >
                    <Text
                      className={`text-center font-semibold font-display ${
                        index === 0 ? 'text-white' : 'text-text-primary'
                      }`}
                    >
                      {action.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              // Default actions
              <View className="gap-3">
                {error.retryable && (
                  <TouchableOpacity
                    onPress={clearError}
                    className="bg-black py-4 px-6 rounded-xl"
                  >
                    <Text className="text-white text-center font-semibold font-display">
                      {t('error.retry')}
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={clearError}
                  className="bg-gray-100 py-4 px-6 rounded-xl"
                >
                  <Text className="text-text-primary text-center font-semibold font-display">
                    {t('error.dismiss')}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ErrorModal;

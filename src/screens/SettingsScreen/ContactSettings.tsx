import React from 'react';
import { View, Text, ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import BackButton from '../../components/common/BackButton';
import AppleInput from '../../components/common/AppleInput';
import Button from '../../components/common/Button';
import { storageService } from '../../services/storageService';
import { contactService } from '../../services/contactService';

interface ContactSettingsProps {
  onClose: () => void;
}

const ContactSettings: React.FC<ContactSettingsProps> = ({ onClose }) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    username: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = React.useState<{ [key: string]: string }>({});

  React.useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await storageService.getUser();
      if (user) {
        setFormData(prev => ({
          ...prev,
          username: user.name || '',
          email: user.email || '',
        }));
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.username || formData.username.length < 2 || formData.username.length > 100) {
      newErrors.username = t('contact.validation.usernameLength');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      newErrors.email = t('auth.validEmail');
    }

    if (!formData.subject || formData.subject.length < 5 || formData.subject.length > 200) {
      newErrors.subject = t('contact.validation.subjectLength');
    }

    if (!formData.message || formData.message.length < 10 || formData.message.length > 5000) {
      newErrors.message = t('contact.validation.messageLength');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await contactService.submitContactForm(formData);
      Alert.alert(
        t('common.success'),
        t('contact.successMessage'),
        [{ text: 'OK', onPress: onClose }]
      );
    } catch (error) {
      Alert.alert(
        t('common.error'),
        error instanceof Error ? error.message : t('contact.errorMessage')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white border-b border-gray-200 shadow-sm z-10" style={{ paddingTop: insets.top }}>
        <View className="px-4 pt-2 pb-3 flex-row items-center">
          <BackButton onPress={onClose} />
          <Text className="text-heading-3 flex-1 ml-2 font-display text-center pr-8">
            {t('contact.title')}
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          className="flex-1 p-6"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <View className="items-center mb-8">
            <View className="w-20 h-20 rounded-full bg-blue-50 items-center justify-center mb-4 shadow-sm">
              <Text className="text-4xl">✉️</Text>
            </View>
            <Text className="text-heading-2 text-text-primary text-center mb-2 font-display">
              {t('contact.subtitle')}
            </Text>
            <Text className="text-body-md text-text-muted text-center px-4 font-text">
              {t('settings.contactDescription')}
            </Text>
          </View>

          <View className="bg-white rounded-2xl p-6 shadow-sm space-y-5">
            <AppleInput
              label={t('contact.subject')}
              value={formData.subject}
              onChangeText={(text) => {
                setFormData({ ...formData, subject: text });
                if (errors.subject) setErrors({ ...errors, subject: '' });
              }}
              placeholder={t('contact.subjectPlaceholder')}
              error={errors.subject}
              containerClassName="mb-1"
            />

            <AppleInput
              label={t('contact.message')}
              value={formData.message}
              onChangeText={(text) => {
                setFormData({ ...formData, message: text });
                if (errors.message) setErrors({ ...errors, message: '' });
              }}
              placeholder={t('contact.messagePlaceholder')}
              multiline
              numberOfLines={5}
              error={errors.message}
              style={{ height: 120, textAlignVertical: 'top', paddingTop: 12 }}
            />

            <Button
              title={loading ? t('contact.sending') : t('contact.send')}
              onPress={handleSubmit}
              disabled={loading}
              className="mt-2 shadow-md"
              size="large"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ContactSettings;

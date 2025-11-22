import React from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
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
      newErrors.username = t('validation.usernameLength') || 'Username must be between 2 and 100 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      newErrors.email = t('validation.invalidEmail') || 'Please enter a valid email address';
    }

    if (!formData.subject || formData.subject.length < 5 || formData.subject.length > 200) {
      newErrors.subject = t('validation.subjectLength') || 'Subject must be between 5 and 200 characters';
    }

    if (!formData.message || formData.message.length < 10 || formData.message.length > 5000) {
      newErrors.message = t('validation.messageLength') || 'Message must be between 10 and 5000 characters';
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
        t('common.success') || 'Success',
        t('settings.contactSuccess') || 'Your message has been sent successfully.',
        [{ text: 'OK', onPress: onClose }]
      );
    } catch (error) {
      Alert.alert(
        t('common.error') || 'Error',
        error instanceof Error ? error.message : 'Failed to send message'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white border-b border-gray-200" style={{ paddingTop: insets.top }}>
        <View className="px-4 pt-2 pb-3 flex-row items-center">
          <BackButton onPress={onClose} />
          <Text className="text-heading-3 flex-1 ml-2" style={{ fontFamily: 'SF Pro Display' }}>
            {t('settings.contact')}
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1 p-6" keyboardShouldPersistTaps="handled">
        <View className="items-center mb-6">
          <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-4">
            <Text className="text-heading-1 text-text-secondary">✉</Text>
          </View>
          <Text className="text-heading-2 text-text-primary text-center mb-2" style={{ fontFamily: 'SF Pro Display' }}>
            {t('settings.contactTitle')}
          </Text>
          <Text className="text-body-md text-text-muted text-center px-4" style={{ fontFamily: 'SF Pro Text' }}>
            {t('settings.contactDescription')}
          </Text>
        </View>

        <View className="space-y-4 mb-8">
          <AppleInput
            label={t('settings.username') || 'Name'}
            value={formData.username}
            onChangeText={(text) => setFormData({ ...formData, username: text })}
            placeholder="John Doe"
            error={errors.username}
            autoCapitalize="words"
            style={{ textAlign: 'left' }}
          />

          <AppleInput
            label={t('settings.email') || 'Email'}
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            placeholder="john@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
            style={{ textAlign: 'left' }}
          />

          <AppleInput
            label={t('settings.subject') || 'Subject'}
            value={formData.subject}
            onChangeText={(text) => setFormData({ ...formData, subject: text })}
            placeholder={t('settings.subjectPlaceholder') || 'How can we help?'}
            error={errors.subject}
            style={{ textAlign: 'left' }}
          />

          <AppleInput
            label={t('settings.message') || 'Message'}
            value={formData.message}
            onChangeText={(text) => setFormData({ ...formData, message: text })}
            placeholder={t('settings.messagePlaceholder') || 'Tell us more about your inquiry...'}
            multiline
            numberOfLines={5}
            error={errors.message}
            style={{ textAlign: 'left', height: 120, textAlignVertical: 'top' }}
          />

          <Button
            title={loading ? (t('common.sending') || 'Sending...') : (t('common.send') || 'Send Message')}
            onPress={handleSubmit}
            disabled={loading}
            className="mt-4"
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default ContactSettings;

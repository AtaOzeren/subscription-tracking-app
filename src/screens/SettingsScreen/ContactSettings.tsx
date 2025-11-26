import React from 'react';
import { View, Text, ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableOpacity, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Feather } from '@expo/vector-icons';
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
  const [selectedSubjectType, setSelectedSubjectType] = React.useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  const handleSubjectTypeSelect = (type: string) => {
    setSelectedSubjectType(type);
    if (type !== 'other') {
      setFormData(prev => ({ ...prev, subject: t(`contact.subjects.${type}`) }));
      if (errors.subject) setErrors(prev => ({ ...prev, subject: '' }));
    } else {
      setFormData(prev => ({ ...prev, subject: '' }));
    }
  };

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
      <View className="bg-gray-50 z-10" style={{ paddingTop: insets.top }}>
        <View className="px-4 pt-2 pb-3 flex-row items-center">
          <BackButton onPress={onClose} />
          <Text className="text-heading-3 flex-1 ml-2 text-center pr-8" style={{ fontFamily: 'SF Pro Display' }}>
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
            <View className="w-20 h-20 rounded-full bg-blue-50 items-center justify-center mb-4 shadow-card">
              <Feather name="mail" size={36} color="#216477" />
            </View>
            <Text className="text-heading-2 text-text-primary text-center mb-2" style={{ fontFamily: 'SF Pro Display' }}>
              {t('contact.subtitle')}
            </Text>
            <Text className="text-body-md text-text-muted text-center px-4" style={{ fontFamily: 'SF Pro Text' }}>
              {t('settings.contactDescription')}
            </Text>
          </View>

          <View className="bg-white rounded-2xl p-6 shadow-card space-y-5 mb-6">
            <View className="mb-1 relative z-50">
              <Text className="text-body-lg text-text-primary font-semibold mb-2 text-center" style={{ fontFamily: 'SF Pro Display' }}>
                {t('contact.subject')}
              </Text>

              {selectedSubjectType === 'other' ? (
                <View>
                  <AppleInput
                    value={formData.subject}
                    onChangeText={(text) => {
                      setFormData({ ...formData, subject: text });
                      if (errors.subject) setErrors({ ...errors, subject: '' });
                    }}
                    placeholder={t('contact.subjectPlaceholder')}
                    error={errors.subject}
                    containerClassName="mb-1"
                  />
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedSubjectType('');
                      setFormData(prev => ({ ...prev, subject: '' }));
                    }}
                    className="absolute right-4 top-4"
                  >
                    <Text className="text-gray-400 text-lg">✕</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View>
                  <TouchableOpacity
                    onPress={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`w-full border rounded-2xl px-4 py-3 bg-white flex-row justify-between items-center ${errors.subject ? 'border-red-500' : 'border-gray-300'
                      }`}
                  >
                    <Text className={`text-base ${selectedSubjectType ? 'text-black' : 'text-gray-400'}`} style={{ fontFamily: 'SF Pro Text' }}>
                      {selectedSubjectType
                        ? t(`contact.subjects.${selectedSubjectType}`)
                        : t('contact.subjectPlaceholder')}
                    </Text>
                    <Text className="text-gray-400">{isDropdownOpen ? '▲' : '▼'}</Text>
                  </TouchableOpacity>

                  {errors.subject && (
                    <Text className="text-sm text-accent-error mt-1 text-center" style={{ fontFamily: 'SF Pro Text' }}>
                      {errors.subject}
                    </Text>
                  )}

                  {isDropdownOpen && (
                    <View className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-lg z-50 overflow-hidden">
                      {['bug', 'feature', 'pricing', 'other'].map((type, index) => (
                        <TouchableOpacity
                          key={type}
                          onPress={() => {
                            handleSubjectTypeSelect(type);
                            setIsDropdownOpen(false);
                          }}
                          className={`px-4 py-3 border-gray-100 ${index !== 3 ? 'border-b' : ''
                            } active:bg-gray-50`}
                        >
                          <Text className="text-base text-text-primary" style={{ fontFamily: 'SF Pro Text' }}>
                            {t(`contact.subjects.${type}`)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              )}
            </View>

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

          <View className="bg-white rounded-2xl p-6 shadow-card space-y-6">
            <View className="items-center">
              <Text className="text-body-sm text-text-muted mb-1" style={{ fontFamily: 'SF Pro Text' }}>
                {t('contact.supportEmailLabel')}
              </Text>
              <TouchableOpacity onPress={() => Linking.openURL('mailto:info@substater.com')}>
                <Text className="text-body-lg text-text-primary font-semibold" style={{ fontFamily: 'SF Pro Display' }}>
                  info@substater.com
                </Text>
              </TouchableOpacity>
            </View>

            <View className="items-center border-t border-gray-100 pt-6">
              <Text className="text-body-sm text-text-muted mb-1" style={{ fontFamily: 'SF Pro Text' }}>
                {t('contact.moreEmailLabel')}
              </Text>
              <TouchableOpacity onPress={() => Linking.openURL('mailto:ataozeren@icloud.com')}>
                <Text className="text-body-lg text-text-primary font-semibold" style={{ fontFamily: 'SF Pro Display' }}>
                  ataozeren@icloud.com
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ContactSettings;

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, Alert, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { catalogService } from '../../services/catalogService';
import { Category, CatalogSubscription, Plan } from '../../types/catalog';
import { useAuth } from '../../contexts/AuthContext';
import { storageService } from '../../services/storageService';
import CustomSubscription from './CustomSubscription';
import FormField from '../../components/subscription/FormField';
import AppleButton from '../../components/common/AppleButton';
import PlanSelector from '../../components/subscription/PlanSelector';
import RegionalSettingsPrompt from '../../components/common/RegionalSettingsPrompt';

interface AddSubscriptionScreenProps {
  onClose: () => void;
  initialSubscription?: CatalogSubscription;
}

const AddSubscriptionScreen = ({ onClose, initialSubscription }: AddSubscriptionScreenProps) => {
  const { t } = useTranslation();
  const { user, checkAuth } = useAuth();
  const insets = useSafeAreaInsets();
  
  // Step states - Start at select-plan if initialSubscription is provided
  const [step, setStep] = useState<'search' | 'select-plan' | 'details'>(
    initialSubscription ? 'select-plan' : 'search'
  );
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customSearchQuery, setCustomSearchQuery] = useState('');
  
  // Data states
  const [categories, setCategories] = useState<Category[]>([]);
  const [subscriptions, setSubscriptions] = useState<CatalogSubscription[]>([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<CatalogSubscription[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  
  // Selection states - Use initialSubscription if provided
  const [selectedSubscription, setSelectedSubscription] = useState<CatalogSubscription | null>(
    initialSubscription || null
  );
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  
  // Form states
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [nextBillingDate, setNextBillingDate] = useState('');
  const [notes, setNotes] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [showRegionalPrompt, setShowRegionalPrompt] = useState(false);
  const [hasCheckedRegionalSettings, setHasCheckedRegionalSettings] = useState(false);

  useEffect(() => {
    checkRegionalSettings();
    loadData();
  }, []);

  // Load plans if initialSubscription is provided
  useEffect(() => {
    if (initialSubscription) {
      loadInitialSubscriptionPlans();
    }
  }, [initialSubscription]);

  const loadInitialSubscriptionPlans = async () => {
    if (!initialSubscription) return;
    
    try {
      setLoading(true);
      const subscriptionDetails = await catalogService.getSubscriptionDetails(initialSubscription.id);
      
      if (subscriptionDetails.plans && subscriptionDetails.plans.length > 0) {
        setPlans(subscriptionDetails.plans);
      }
    } catch (error) {
      Alert.alert(
        t('common.error'),
        error instanceof Error ? error.message : t('common.somethingWentWrong')
      );
    } finally {
      setLoading(false);
    }
  };

  const checkRegionalSettings = async () => {
    try {
      const profileSetup = await storageService.getProfileSetup();
      if (!profileSetup) {
        setShowRegionalPrompt(true);
      }
      setHasCheckedRegionalSettings(true);
    } catch (error) {
      console.error('Error checking regional settings:', error);
      setHasCheckedRegionalSettings(true);
    }
  };

  useEffect(() => {
    let filtered = subscriptions;

    // Filter by category
    if (selectedCategory !== null) {
      filtered = filtered.filter(sub => sub.category.id === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(sub =>
        sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredSubscriptions(filtered);
  }, [searchQuery, subscriptions, selectedCategory]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [categoriesData, subscriptionsData] = await Promise.all([
        catalogService.getCategories(),
        catalogService.getCatalogSubscriptions(),
      ]);
      setCategories(categoriesData);
      setSubscriptions(subscriptionsData);
      setFilteredSubscriptions(subscriptionsData);
    } catch (error) {
      Alert.alert(
        t('common.error'),
        error instanceof Error ? error.message : t('common.somethingWentWrong')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSubscription = async (subscription: CatalogSubscription) => {
    try {
      setLoading(true);
      setSelectedSubscription(subscription);
      
      const subscriptionDetails = await catalogService.getSubscriptionDetails(subscription.id);
      
      if (subscriptionDetails.plans && subscriptionDetails.plans.length > 0) {
        setPlans(subscriptionDetails.plans);
        setStep('select-plan');
      } else {
        // No plans, go directly to details
        setStep('details');
      }
    } catch (error) {
      Alert.alert(
        t('common.error'),
        error instanceof Error ? error.message : t('common.somethingWentWrong')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    
    // Calculate next billing date based on billing cycle
    const nextDate = new Date();
    if (plan.billing_cycle === 'monthly') {
      nextDate.setMonth(nextDate.getMonth() + 1);
    } else if (plan.billing_cycle === 'yearly') {
      nextDate.setFullYear(nextDate.getFullYear() + 1);
    } else if (plan.billing_cycle === 'weekly') {
      nextDate.setDate(nextDate.getDate() + 7);
    }
    setNextBillingDate(nextDate.toISOString().split('T')[0]);
    
    setStep('details');
  };

  const handleAddPresetSubscription = async () => {
    if (!selectedPlan) {
      Alert.alert(t('common.error'), t('form.selectPlan'));
      return;
    }

    try {
      setLoading(true);
      await catalogService.addPresetSubscription({
        plan_id: selectedPlan.id,
        start_date: startDate,
        next_billing_date: nextBillingDate,
        notes: notes || undefined,
      });

      Alert.alert(
        t('common.success'),
        t('subscriptionAlerts.subscriptionAdded'),
        [{ text: 'OK', onPress: onClose }]
      );
    } catch (error) {
      Alert.alert(
        t('common.error'),
        error instanceof Error ? error.message : t('common.somethingWentWrong')
      );
    } finally {
      setLoading(false);
    }
  };

  // Render Category Filter (2-row layout like SubscriptionsScreen)
  const renderCategoryFilter = () => {
    const allCategories = [{ id: null, name: t('subscriptions.all'), icon_url: '' }, ...categories];
    const halfLength = Math.ceil(allCategories.length / 2);
    const firstRow = allCategories.slice(0, halfLength);
    const secondRow = allCategories.slice(halfLength);

    const renderCategoryChip = (category: { id: number | null; name: string; icon_url: string }) => (
      <TouchableOpacity
        key={category.id || 'all'}
        onPress={() => setSelectedCategory(category.id)}
        className={`mr-2 mb-2 px-3 py-1.5 rounded-full flex-row items-center ${
          selectedCategory === category.id ? 'bg-black' : 'bg-gray-200'
        }`}
        style={{ height: 32 }}
      >
        {category.icon_url ? <Text className="text-xs mr-1">{category.icon_url}</Text> : null}
        <Text
          className={`text-sm font-semibold font-display ${
            selectedCategory === category.id ? 'text-white' : 'text-text-secondary'
          }`}
        >
          {category.name}
        </Text>
      </TouchableOpacity>
    );

    return (
      <View className="px-4 mb-4">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-1"
        >
          {firstRow.map(renderCategoryChip)}
        </ScrollView>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-2"
        >
          {secondRow.map(renderCategoryChip)}
        </ScrollView>
      </View>
    );
  };

  // Group subscriptions by category
  const groupSubscriptionsByCategory = () => {
    const grouped: { [key: string]: { category: Category; subscriptions: CatalogSubscription[] } } = {};
    
    filteredSubscriptions.forEach((subscription) => {
      const categoryId = subscription.category.id.toString();
      if (!grouped[categoryId]) {
        grouped[categoryId] = {
          category: subscription.category,
          subscriptions: [],
        };
      }
      grouped[categoryId].subscriptions.push(subscription);
    });
    
    return Object.values(grouped);
  };

  // Render Search Step
  const renderSearchStep = () => {
    const groupedData = groupSubscriptionsByCategory();
    
    return (
      <ScrollView className="flex-1">
        {/* Category Filter */}
        <View className="pt-4">
          {renderCategoryFilter()}
        </View>

        {/* Search Bar */}
        <View className="px-4 mb-4">
          <View className="bg-gray-100 rounded-xl px-4 py-3 flex-row items-center">
            <Text className="mr-2">🔍</Text>
            <TextInput
              placeholder={t('addSubscription.searchPlaceholder')}
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 text-base font-text"
            />
          </View>
        </View>

        {/* Results */}
        <View className="px-4">
          {filteredSubscriptions.length === 0 && searchQuery.trim() !== '' ? (
            <View className="bg-white rounded-2xl p-8 items-center mb-4">
              <Text className="text-5xl mb-4">🔍</Text>
              <Text className="text-heading-4 text-text-primary mb-2 font-display">
                 {t('addSubscription.noResults')}
              </Text>
              <Text className="text-body-md text-text-muted text-center mb-4 font-text">
                 {t('addSubscription.noResultsMessage', { query: searchQuery })}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setCustomSearchQuery(searchQuery);
                  setShowCustomModal(true);
                }}
                className="bg-black rounded-full px-6 py-3"
              >
                <Text className="text-white font-semibold font-display">
                   {t('addSubscription.addCustomButton')}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {groupedData.map((group) => (
                <View key={group.category.id} className="mb-6">
                  {/* Category Header */}
                  <View className="flex-row items-center mb-3">
                    <View className="w-8 h-8 rounded-lg bg-gray-100 items-center justify-center mr-2">
                      <Text className="text-lg">{group.category.icon_url}</Text>
                    </View>
                    <Text className="text-heading-3 text-text-primary font-display">
                      {group.category.name}
                    </Text>
                  </View>

                  {/* Category Subscriptions */}
                  {group.subscriptions.map((subscription) => (
                    <TouchableOpacity
                      key={subscription.id}
                      onPress={() => handleSelectSubscription(subscription)}
                      className="bg-white rounded-2xl p-4 mb-3"
                      style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.1,
                        shadowRadius: 3,
                        elevation: 2,
                      }}
                    >
                      <View className="flex-row items-center">
                        <View className="w-16 h-16 rounded-xl bg-gray-100 items-center justify-center mr-4">
                          {subscription.logo_url ? (
                            <Image
                              source={{ uri: subscription.logo_url }}
                              className="w-12 h-12 rounded-lg"
                              resizeMode="contain"
                            />
                          ) : (
                            <Text className="text-2xl">{subscription.category.icon_url}</Text>
                          )}
                        </View>

                        <View className="flex-1">
                          <Text className="text-heading-4 text-text-primary mb-1 font-display">
                            {subscription.name}
                          </Text>
                          <Text
                            className="text-body-md text-text-muted font-text"
                            numberOfLines={2}
                          >
                            {subscription.description}
                          </Text>
                        </View>

                        <Text className="text-2xl ml-2">→</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </>
          )}

          {/* Add Custom Button */}
          <TouchableOpacity
            onPress={() => {
              setCustomSearchQuery('');
              setShowCustomModal(true);
            }}
            className="bg-gray-100 rounded-2xl p-6 items-center mb-6"
          >
            <Text className="text-3xl mb-2">➕</Text>
            <Text className="text-body-lg text-text-primary font-semibold font-display">
               {t('addSubscription.addCustomButton')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  // Render Select Plan Step
  const renderSelectPlanStep = () => (
    <PlanSelector
      plans={plans}
      onSelectPlan={handleSelectPlan}
      userRegion={user?.region}
      subtitle={t('addSubscription.selectPlanSubtitle')}
    />
  );

  // Render Details Step
  const renderDetailsStep = () => (
    <View className="flex-1">
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingTop: 16 }}>
        {selectedSubscription && selectedPlan && (
          <View className="mb-4">
            <Text className="text-body-lg text-text-muted text-center font-text">
              {selectedSubscription.name} - {selectedPlan.name}
            </Text>
          </View>
        )}

        <FormField
          label={t('addSubscription.startDate')}
          value={startDate}
          onChangeText={setStartDate}
          placeholder="YYYY-MM-DD"
        />

        <FormField
          label={t('subscription.nextBillingDate')}
          value={nextBillingDate}
          onChangeText={setNextBillingDate}
          placeholder="YYYY-MM-DD"
        />

        <FormField
          label={t('subscription.notesOptional')}
          value={notes}
          onChangeText={setNotes}
          placeholder={t('subscription.notesPlaceholder')}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        <AppleButton
          title={t('subscriptionActions.add')}
          onPress={handleAddPresetSubscription}
          disabled={loading}
          loading={loading}
          size="large"
          containerClassName="mb-6"
        />
      </ScrollView>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header - Fixed at top with status bar */}
      <View 
        className="bg-white border-b border-gray-200"
        style={{ paddingTop: insets.top }}
      >
        <View className="px-4 pt-4 pb-3 flex-row items-center">
          {/* Back button on left for select-plan and details steps */}
          {(step === 'select-plan' || step === 'details') ? (
            <TouchableOpacity 
              onPress={step === 'select-plan' ? () => setStep('search') : () => setStep('select-plan')}
              className="w-10"
            >
              <Text className="text-2xl text-text-secondary font-display">←</Text>
            </TouchableOpacity>
          ) : (
            <View className="w-10" />
          )}
          
          {/* Title - Centered */}
          <View className="flex-1 items-center">
            <Text className="text-heading-2 text-text-primary font-display">
              {step === 'search' && t('addSubscription.title')}
              {step === 'select-plan' && selectedSubscription?.name}
              {step === 'details' && t('addSubscription.detailsTitle')}
            </Text>
          </View>
          
          {/* Back/Close button on left for search step */}
          {step === 'search' ? (
            <TouchableOpacity onPress={onClose} className="w-10">
              <Text className="text-2xl text-text-secondary font-display">←</Text>
            </TouchableOpacity>
          ) : (
            <View className="w-10" />
          )}
        </View>
      </View>

      {/* Content */}
      {step === 'search' && renderSearchStep()}
      {step === 'select-plan' && renderSelectPlanStep()}
      {step === 'details' && renderDetailsStep()}

      {/* Custom Subscription Modal */}
      <Modal
        visible={showCustomModal}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <CustomSubscription 
          onClose={() => {
            setShowCustomModal(false);
            onClose(); // Close the parent modal too after adding custom subscription
          }}
          initialSearchQuery={customSearchQuery}
          categories={categories}
        />
      </Modal>

      {/* Regional Settings Prompt */}
      <RegionalSettingsPrompt
        visible={showRegionalPrompt}
        onComplete={() => {
          setShowRegionalPrompt(false);
          // Refresh auth context to update user profile
          checkAuth();
        }}
        onCancel={() => {
          setShowRegionalPrompt(false);
          onClose(); // Close the add subscription screen if user cancels
        }}
      />
    </View>
  );
};

export default AddSubscriptionScreen;

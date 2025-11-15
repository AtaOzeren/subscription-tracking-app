import React, { useState, useEffect, useRef } from 'react';
import { View, Animated, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { catalogService } from '../../services/catalogService';
import { CatalogSubscription } from '../../types/catalog';
import { SearchHeader } from '../../components/search/SearchHeader';
import { SearchResults } from '../../components/search/SearchResults';
import AddSubscriptionScreen from '../AddSubscriptionScreen/AddSubscriptionScreen';

interface SearchScreenProps {
  scrollY?: Animated.Value;
  onNavigateToProfile?: () => void;
  searchQuery?: string;
}

const SearchScreen = ({ onNavigateToProfile, searchQuery: externalSearchQuery = '' }: SearchScreenProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CatalogSubscription[]>([]);
  const [allSubscriptions, setAllSubscriptions] = useState<CatalogSubscription[]>([]);
  const [selectedSubscription, setSelectedSubscription] = useState<CatalogSubscription | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Animation values
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Trigger animations on mount
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Load catalog subscriptions
    loadCatalog();
  }, []);

  const loadCatalog = async () => {
    try {
      setLoading(true);
      const subscriptions = await catalogService.getCatalogSubscriptions();
      setAllSubscriptions(subscriptions || []);
    } catch (error) {
      console.error('Error loading catalog:', error);
    } finally {
      setLoading(false);
    }
  };

  // Use external search query if provided (from bottom nav), otherwise use internal state
  const activeSearchQuery = externalSearchQuery || searchQuery;

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(activeSearchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [activeSearchQuery]);

  const performSearch = (query: string) => {
    if (query.trim() === '') {
      setResults([]);
      return;
    }

    const filtered = allSubscriptions.filter((sub) =>
      sub.name.toLowerCase().includes(query.toLowerCase())
    );
    setResults(filtered);
  };

  const handleSelectSubscription = (subscription: CatalogSubscription) => {
    setSelectedSubscription(subscription);
    setShowAddModal(true);
  };

  const handleBack = () => {
    // Clear search when going back
    setSearchQuery('');
    setResults([]);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header with Back Button and Profile */}
      <SearchHeader
        onBack={handleBack}
        onProfilePress={onNavigateToProfile}
        slideAnim={slideAnim}
      />

      {/* Search Results */}
      <SearchResults
        results={results}
        loading={loading}
        searchQuery={activeSearchQuery}
        onSelectSubscription={handleSelectSubscription}
        fadeAnim={fadeAnim}
      />

      {/* Add Subscription Modal */}
      {selectedSubscription && (
        <Modal
          visible={showAddModal}
          animationType="slide"
          presentationStyle="fullScreen"
        >
          <AddSubscriptionScreen
            onClose={() => {
              setShowAddModal(false);
              setSelectedSubscription(null);
            }}
          />
        </Modal>
      )}
    </SafeAreaView>
  );
};

export default SearchScreen;

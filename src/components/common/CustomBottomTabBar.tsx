import React, { useRef, useEffect } from 'react';
import { View, TouchableOpacity, Animated, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

interface TabItem {
  key: string;
  iconName: string;
  label: string;
  onPress: () => void;
  isActive: boolean;
}

interface CustomBottomTabBarProps {
  tabs: TabItem[];
  scrollY?: Animated.Value;
}

const SEARCH_BUTTON_SIZE = 60;

const CustomBottomTabBar: React.FC<CustomBottomTabBarProps> = ({ tabs, scrollY }) => {
  const labelOpacity = useRef(new Animated.Value(1)).current;
  const labelHeight = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (scrollY) {
      const listener = scrollY.addListener(({ value }) => {
        // Label'lar 50px scroll sonra kaybolmaya başlar, 100px'de tamamen kaybolur
        if (value > 50) {
          const progress = Math.min((value - 50) / 50, 1);
          Animated.parallel([
            Animated.timing(labelOpacity, {
              toValue: 1 - progress,
              duration: 0,
              useNativeDriver: true,
            }),
            Animated.timing(labelHeight, {
              toValue: 1 - progress,
              duration: 0,
              useNativeDriver: false,
            }),
          ]).start();
        } else {
          // Yukarı çıkınca label'lar tekrar görünür
          Animated.parallel([
            Animated.timing(labelOpacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(labelHeight, {
              toValue: 1,
              duration: 200,
              useNativeDriver: false,
            }),
          ]).start();
        }
      });

      return () => {
        scrollY.removeListener(listener);
      };
    }
  }, [scrollY, labelOpacity, labelHeight]);

  const searchTab = tabs.find(tab => tab.key === 'search');
  const mainTabs = tabs.filter(tab => tab.key !== 'search');

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['bottom']} style={styles.safeArea}>
        <View className="px-4 pb-2 pt-3">
          <View className="flex-row items-center justify-between">
            {/* Sol taraf - 3 ikon tek blur box'ta */}
            <View 
              className="flex-1 mr-3 overflow-hidden"
              style={styles.blurContainer}
            >
              <BlurView
                intensity={100}
                tint="light"
                style={styles.blurView}
              >
                <View className="flex-row items-center justify-around px-2 py-3">
                  {mainTabs.map((tab) => (
                    <TouchableOpacity
                      key={tab.key}
                      onPress={tab.onPress}
                      className="flex-1 items-center justify-center"
                      activeOpacity={0.7}
                    >
                      <View className="items-center justify-center px-4 py-2">
                        <Ionicons 
                          name={tab.iconName as any}
                          size={26}
                          color="#000000"
                          style={{ marginBottom: 4 }}
                        />
                        <Animated.View
                          style={{
                            opacity: labelOpacity,
                            height: labelHeight.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, 16],
                            }),
                            overflow: 'hidden',
                          }}
                        >
                          <Text 
                            className="text-black text-xs text-center"
                            style={styles.label}
                          >
                            {tab.label}
                          </Text>
                        </Animated.View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </BlurView>
            </View>
            
            {/* Sağ taraf - Arama butonu yuvarlak blur box'ta */}
            {searchTab && (
              <View style={styles.searchContainer}>
                <BlurView
                  intensity={100}
                  tint="light"
                  style={styles.searchBlurView}
                >
                  <TouchableOpacity
                    onPress={searchTab.onPress}
                    className="items-center justify-center w-full h-full"
                    activeOpacity={0.7}
                  >
                    <Ionicons 
                      name={searchTab.iconName as any}
                      size={26}
                      color="#000000"
                    />
                  </TouchableOpacity>
                </BlurView>
              </View>
            )}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    zIndex: 999,
  },
  safeArea: {
    backgroundColor: 'transparent',
  },
  blurContainer: {
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  blurView: {
    borderRadius: 28,
    overflow: 'hidden',
  },
  searchContainer: {
    width: SEARCH_BUTTON_SIZE,
    height: SEARCH_BUTTON_SIZE,
    borderRadius: SEARCH_BUTTON_SIZE / 2,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  searchBlurView: {
    width: '100%',
    height: '100%',
    borderRadius: SEARCH_BUTTON_SIZE / 2,
  },
  label: {
    fontFamily: 'SF Pro Text',
    fontWeight: '500',
  },
});

export default CustomBottomTabBar;

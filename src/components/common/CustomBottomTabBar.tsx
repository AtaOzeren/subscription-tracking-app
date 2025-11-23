import React, { useRef, useEffect, useState } from 'react';
import { View, TouchableOpacity, Animated, Text, LayoutChangeEvent, TextInput } from 'react-native';
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
  onLayout?: (height: number) => void;
  searchMode?: boolean;
  searchQuery?: string;
  onSearchChange?: (text: string) => void;
  onSearchClose?: () => void;
}

const SEARCH_BUTTON_SIZE = 60;

const CustomBottomTabBar: React.FC<CustomBottomTabBarProps> = ({
  tabs,
  scrollY,
  onLayout,
  searchMode = false,
  searchQuery = '',
  onSearchChange,
  onSearchClose,
}) => {
  const labelOpacity = useRef(new Animated.Value(1)).current;
  const labelHeight = useRef(new Animated.Value(1)).current;
  const searchSlideAnim = useRef(new Animated.Value(0)).current;

  const handleLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    if (onLayout) {
      onLayout(height);
    }
  };

  // Animate search mode
  useEffect(() => {
    Animated.spring(searchSlideAnim, {
      toValue: searchMode ? 1 : 0,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [searchMode]);

  useEffect(() => {
    if (scrollY) {
      const listenerId = scrollY.addListener(({ value }) => {
        if (value > 50) {
          const progress = Math.min((value - 50) / 50, 1);
          Animated.timing(labelOpacity, {
            toValue: 1 - progress,
            duration: 0,
            useNativeDriver: false,
          }).start();

          Animated.timing(labelHeight, {
            toValue: 1 - progress,
            duration: 0,
            useNativeDriver: false,
          }).start();
        } else {
          Animated.timing(labelOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: false,
          }).start();

          Animated.timing(labelHeight, {
            toValue: 1,
            duration: 200,
            useNativeDriver: false,
          }).start();
        }
      });

      return () => {
        if (scrollY && listenerId) {
          scrollY.removeListener(listenerId);
        }
      };
    }
  }, [scrollY, labelOpacity, labelHeight]);

  const searchTab = tabs.find(tab => tab.key === 'search');
  const mainTabs = tabs.filter(tab => tab.key !== 'search');

  return (
    <View
      className="absolute -bottom-6 left-1 right-1 bg-transparent z-50"
      onLayout={handleLayout}
    >
      <SafeAreaView edges={['bottom']} className="bg-transparent">
        <View className="px-2 pb-1 pt-1">
          <View className="flex-row items-center justify-between">
            {/* Left side - 3 tabs or search input */}
            <Animated.View
              className="flex-1 mr-3 overflow-hidden rounded-[28px] shadow-modal bg-white/20"
              style={{
                opacity: searchSlideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0],
                }),
                transform: [
                  {
                    translateX: searchSlideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -400],
                    }),
                  },
                ],
              }}
            >
              <BlurView
                intensity={80}
                tint="light"
                className="rounded-[28px] overflow-hidden bg-white/10"
              >
                <View className="flex-row items-center justify-around px-1 py-1">
                  {mainTabs.map((tab) => (
                    <TouchableOpacity
                      key={tab.key}
                      onPress={tab.onPress}
                      className="flex-1 items-center justify-center"
                      activeOpacity={0.7}
                    >
                      <View className="items-center justify-center px-2 py-1">
                        <Ionicons
                          name={tab.iconName as any}
                          size={26}
                          color="#000000"
                          className="mb-1"
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
                          <Text className="text-black text-xs text-center font-text font-medium">
                            {tab.label}
                          </Text>
                        </Animated.View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </BlurView>
            </Animated.View>

            {/* Search Input - Slides in from right */}
            <Animated.View
              className="absolute left-0 right-20 overflow-hidden rounded-[28px] shadow-modal bg-white/20"
              style={{
                opacity: searchSlideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                }),
                transform: [
                  {
                    translateX: searchSlideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [400, 0],
                    }),
                  },
                ],
              }}
              pointerEvents={searchMode ? 'auto' : 'none'}
            >
              <BlurView
                intensity={80}
                tint="light"
                className="rounded-[28px] overflow-hidden bg-white/10"
              >
                <View className="flex-row items-center px-4 py-3">
                  <Ionicons name="search" size={20} color="#000000" />
                  <TextInput
                    value={searchQuery}
                    onChangeText={onSearchChange}
                    placeholder="Search subscriptions..."
                    placeholderTextColor="#9CA3AF"
                    className="flex-1 ml-3 text-base text-black font-text"
                    autoFocus={searchMode}
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => onSearchChange?.('')}>
                      <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                  )}
                </View>
              </BlurView>
            </Animated.View>

            {/* Right side - Search button or close button */}
            {searchTab && (
              <View
                className="overflow-hidden shadow-modal bg-white/20"
                style={{
                  width: SEARCH_BUTTON_SIZE,
                  height: SEARCH_BUTTON_SIZE,
                  borderRadius: SEARCH_BUTTON_SIZE / 2
                }}
              >
                <BlurView
                  intensity={80}
                  tint="light"
                  className="w-full h-full bg-white/10"
                  style={{ borderRadius: SEARCH_BUTTON_SIZE / 2 }}
                >
                  <TouchableOpacity
                    onPress={searchMode ? onSearchClose : searchTab.onPress}
                    className="items-center justify-center w-full h-full"
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={searchMode ? 'close' : searchTab.iconName as any}
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

export default CustomBottomTabBar;

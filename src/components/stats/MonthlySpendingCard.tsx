import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { formatPrice } from '../../utils/currency';

interface MonthlySpendingCardProps {
    amount: number;
    currency: string;
    activeSubscriptions: number;
    totalSubscriptions: number;
}

export const MonthlySpendingCard: React.FC<MonthlySpendingCardProps> = ({
    amount,
    currency,
    activeSubscriptions,
    totalSubscriptions,
}) => {
    const { t } = useTranslation();
    const animatedValue = useRef(new Animated.Value(0)).current;
    const screenWidth = Dimensions.get('window').width;
    const cardWidth = screenWidth - 48; // px-6 * 2 = 48

    useEffect(() => {
        const startAnimation = () => {
            animatedValue.setValue(0);
            Animated.loop(
                Animated.sequence([
                    Animated.timing(animatedValue, {
                        toValue: 1,
                        duration: 2500, // Speed of the shine passing
                        easing: Easing.linear,
                        useNativeDriver: true,
                    }),
                    Animated.delay(12500), // Wait before next pass (Total ~15s)
                    Animated.timing(animatedValue, {
                        toValue: 0,
                        duration: 0, // Reset instantly
                        useNativeDriver: true,
                    })
                ])
            ).start();
        };

        startAnimation();
    }, [animatedValue]);

    const translateX = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [-cardWidth, cardWidth],
    });

    return (
        <View className="rounded-2xl overflow-hidden shadow-card h-32 bg-tracking-blue">
            {/* Main Background Gradient - Richer Depth */}
            <LinearGradient
                colors={['#216477', '#174A59', '#0F3540']} // Richer gradient with 3 stops
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
            />

            {/* Top Highlight for "Dolgunluk" (Volume/Glass effect) */}
            <LinearGradient
                colors={['rgba(255,255,255,0.15)', 'transparent']}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 0.5 }}
                style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '50%' }}
            />

            {/* Animated Shine Effect */}
            <Animated.View
                style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    width: '50%',
                    transform: [{ translateX }],
                    opacity: 0.3,
                }}
            >
                <LinearGradient
                    colors={['transparent', 'rgba(255,255,255,0.8)', 'transparent']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ flex: 1 }}
                />
            </Animated.View>

            {/* Floating Bubbles/Particles Effect (Optional extra "shiny things") */}
            {/* We can add small animated circles if needed, but the shine is a good start for "parlak seyler gezsin" */}

            {/* Content */}
            <View className="p-5 flex-1 justify-between">
                <View className="flex-row items-center justify-between">
                    <Text className="text-white/90 text-sm font-medium">
                        {t('stats.monthlySpending')}
                    </Text>
                    <View className="bg-white/20 rounded-full px-3 py-1 backdrop-blur-sm">
                        <Text className="text-white text-xs font-semibold">
                            {activeSubscriptions}/{totalSubscriptions}
                        </Text>
                    </View>
                </View>

                <View>
                    <Text className="text-white text-3xl font-bold font-display tracking-tight">
                        {formatPrice(amount, currency)}
                    </Text>
                    <Text className="text-white/70 text-xs mt-1 font-medium">
                        {t('stats.perMonth')}
                    </Text>
                </View>
            </View>
        </View>
    );
};

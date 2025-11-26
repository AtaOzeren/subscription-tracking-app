import React, { useEffect, useRef } from 'react';
import { Text, TouchableOpacity, Animated, StyleSheet, View, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

interface PremiumSupportButtonProps {
    onPress: () => void;
    title?: string;
    subtitle?: string;
}

const Particle = ({ delay, duration, startX, startY, size }: { delay: number, duration: number, startX: number, startY: number, size: number }) => {
    const anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        let loop: Animated.CompositeAnimation;

        const startLoop = () => {
            loop = Animated.loop(
                Animated.timing(anim, {
                    toValue: 1,
                    duration: duration,
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            );
            loop.start();
        };

        const timer = setTimeout(() => {
            startLoop();
        }, delay);

        return () => {
            clearTimeout(timer);
            loop?.stop();
        };
    }, []);

    const translateX = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 100], // Move 100 units right
    });

    const translateY = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -50], // Move 50 units up
    });

    const opacity = anim.interpolate({
        inputRange: [0, 0.2, 0.8, 1],
        outputRange: [0, 0.4, 0.4, 0], // Fade in and out
    });

    return (
        <Animated.View
            style={{
                position: 'absolute',
                left: startX,
                top: startY,
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: 'rgba(255, 255, 255, 0.6)',
                opacity,
                transform: [{ translateX }, { translateY }],
            }}
        />
    );
};

const PremiumSupportButton: React.FC<PremiumSupportButtonProps> = ({ onPress, title = "Support Me", subtitle }) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.9}
            style={styles.container}
        >
            <View style={styles.buttonContainer}>
                <LinearGradient
                    colors={['#FFD700', '#FF8C00']} // Gold to Orange
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradient}
                >
                    {/* Particles */}
                    <View style={StyleSheet.absoluteFill} pointerEvents="none">
                        {/* Wave 1 */}
                        <Particle delay={0} duration={3000} startX={20} startY={40} size={6} />
                        <Particle delay={500} duration={3500} startX={100} startY={30} size={8} />
                        <Particle delay={1000} duration={4000} startX={50} startY={50} size={4} />

                        {/* Wave 2 */}
                        <Particle delay={1500} duration={3200} startX={200} startY={35} size={7} />
                        <Particle delay={2000} duration={4500} startX={150} startY={45} size={5} />
                        <Particle delay={2500} duration={3800} startX={80} startY={55} size={6} />

                        {/* Wave 3 - Continuous fill */}
                        <Particle delay={1200} duration={4200} startX={30} startY={25} size={5} />
                        <Particle delay={2800} duration={3600} startX={180} startY={40} size={4} />
                        <Particle delay={3500} duration={4000} startX={120} startY={50} size={7} />
                        <Particle delay={4000} duration={3300} startX={250} startY={30} size={6} />
                    </View>

                    <View style={styles.contentContainer}>
                        <View style={styles.headerContent}>
                            <Feather name="coffee" size={24} color="white" style={styles.icon} />
                            <Text style={styles.text}>{title}</Text>
                        </View>
                        {subtitle && (
                            <Text style={styles.subtitle}>{subtitle}</Text>
                        )}
                    </View>
                </LinearGradient>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        shadowColor: '#FF8C00',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    buttonContainer: {
        width: '100%',
        borderRadius: 16,
        overflow: 'hidden', // Clip particles
    },
    gradient: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        width: '100%',
    },
    contentContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    icon: {
        marginRight: 10,
    },
    text: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'SF Pro Display',
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    subtitle: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: 11,
        textAlign: 'center',
        fontFamily: 'SF Pro Text',
        marginTop: 2,
        fontWeight: '500',
    },
});

export default PremiumSupportButton;

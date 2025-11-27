import React, { useState, useEffect, useCallback } from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { notificationService } from '../../services/notificationService';

const NotificationButton = () => {
    const navigation = useNavigation();
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchUnreadCount = useCallback(async () => {
        try {
            const count = await notificationService.getUnreadCount();
            setUnreadCount(count);
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchUnreadCount();

            // Optional: Set up an interval to poll for updates while screen is focused
            const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30 seconds

            return () => clearInterval(interval);
        }, [fetchUnreadCount])
    );

    return (
        <TouchableOpacity
            onPress={() => navigation.navigate('Notifications' as never)}
            className="w-10 h-10 items-center justify-center rounded-full bg-gray-100"
        >
            <Ionicons name="notifications-outline" size={24} color="#1F2937" />
            {unreadCount > 0 && (
                <View className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full items-center justify-center border-2 border-white">
                    <Text className="text-white text-[10px] font-bold">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

export default NotificationButton;

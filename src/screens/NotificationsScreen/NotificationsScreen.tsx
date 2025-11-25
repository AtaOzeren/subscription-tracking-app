import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { notificationService } from '../../services/notificationService';
import { useTranslation } from 'react-i18next';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    is_read: boolean;
    created_at: string;
    data?: any;
}

const NotificationsScreen = () => {
    const navigation = useNavigation();
    const { t } = useTranslation();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchNotifications = useCallback(async () => {
        try {
            const data = await notificationService.getNotifications();
            setNotifications(data || []);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchNotifications();
    };

    const handleMarkAsRead = async (id: string) => {
        try {
            await notificationService.markAsRead(id);
            // Optimistic update
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, is_read: true } : n)
            );
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const renderItem = ({ item }: { item: Notification }) => (
        <TouchableOpacity
            className={`p-4 border-b border-gray-100 ${item.is_read ? 'bg-white' : 'bg-blue-50'}`}
            onPress={() => !item.is_read && handleMarkAsRead(item.id)}
        >
            <View className="flex-row justify-between items-start">
                <View className="flex-1 mr-3">
                    <View className="flex-row items-center mb-1">
                        {getIconForType(item.type)}
                        <Text className={`ml-2 font-semibold text-base ${item.is_read ? 'text-gray-800' : 'text-black'}`}>
                            {item.title}
                        </Text>
                    </View>
                    <Text className="text-gray-600 text-sm leading-5">{item.message}</Text>
                    <Text className="text-gray-400 text-xs mt-2">
                        {new Date(item.created_at).toLocaleDateString()} • {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
                {!item.is_read && (
                    <View className="w-3 h-3 rounded-full bg-blue-500 mt-2" />
                )}
            </View>
        </TouchableOpacity>
    );

    const getIconForType = (type: string) => {
        switch (type) {
            case 'SCHEDULED':
                return <Ionicons name="calendar-outline" size={20} color="#4B5563" />;
            case 'AUTO_RENEWAL':
                return <Ionicons name="refresh-circle-outline" size={20} color="#F59E0B" />;
            case 'ADMIN_PUSH':
                return <Ionicons name="megaphone-outline" size={20} color="#EF4444" />;
            default:
                return <Ionicons name="notifications-outline" size={20} color="#4B5563" />;
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            <View className="px-4 py-3 border-b border-gray-100 flex-row justify-between items-center bg-white">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
                    <Ionicons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-gray-900">Notifications</Text>
                <TouchableOpacity onPress={handleMarkAllAsRead} className="p-2 -mr-2">
                    <Ionicons name="checkmark-done-outline" size={24} color="#3B82F6" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#3B82F6" />
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
                    }
                    ListEmptyComponent={
                        <View className="flex-1 justify-center items-center py-20 px-4">
                            <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
                                <Ionicons name="notifications-off-outline" size={32} color="#9CA3AF" />
                            </View>
                            <Text className="text-gray-900 text-lg font-semibold mb-2">No Notifications</Text>
                            <Text className="text-gray-500 text-center">
                                You don't have any notifications yet. We'll let you know when something important happens.
                            </Text>
                        </View>
                    }
                    contentContainerStyle={notifications.length === 0 ? { flex: 1 } : { paddingBottom: 20 }}
                />
            )}
        </SafeAreaView>
    );
};

export default NotificationsScreen;

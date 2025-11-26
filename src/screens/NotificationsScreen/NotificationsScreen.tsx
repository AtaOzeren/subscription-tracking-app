import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { notificationService } from '../../services/notificationService';
import { useTranslation } from 'react-i18next';
import { getCurrencySymbol } from '../../utils/currency';
import MinimalLoader from '../../components/common/MinimalLoader';

interface NotificationData {
    plan_id?: number;
    currency?: string;
    new_price?: number;
    old_price?: number;
    [key: string]: any;
}

interface Notification {
    id: number;
    user_id: number;
    type: 'PRICE_CHANGE' | 'SCHEDULED' | 'AUTO_RENEWAL' | 'ADMIN_PUSH';
    message: string;
    data?: NotificationData;
    is_read: boolean;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
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

    const handleMarkAsRead = async (id: number) => {
        try {
            await notificationService.markAsRead(id.toString());
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

    const getTypeConfig = (type: string) => {
        switch (type) {
            case 'PRICE_CHANGE':
                return {
                    icon: 'trending-up',
                    colors: ['#216477', '#1a4f5e'] as const,
                    bgColor: 'transparent',
                    textColor: '#216477',
                    label: t('notifications.priceChange'),
                };
            case 'SCHEDULED':
                return {
                    icon: 'calendar',
                    colors: ['#3B82F6', '#2563EB'] as const,
                    bgColor: '#DBEAFE',
                    textColor: '#1E40AF',
                    label: t('notifications.scheduled'),
                };
            case 'AUTO_RENEWAL':
                return {
                    icon: 'refresh-cw',
                    colors: ['#10B981', '#059669'] as const,
                    bgColor: '#D1FAE5',
                    textColor: '#065F46',
                    label: t('notifications.autoRenewal'),
                };
            case 'ADMIN_PUSH':
                return {
                    icon: 'megaphone',
                    colors: ['#8B5CF6', '#7C3AED'] as const,
                    bgColor: '#EDE9FE',
                    textColor: '#5B21B6',
                    label: t('notifications.announcement'),
                };
            default:
                return {
                    icon: 'bell',
                    colors: ['#6B7280', '#4B5563'] as const,
                    bgColor: '#F3F4F6',
                    textColor: '#374151',
                    label: t('notifications.general'),
                };
        }
    };

    const getRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return t('time.justNow');
        if (diffInSeconds < 3600) return t('time.minutesAgo', { count: Math.floor(diffInSeconds / 60) });
        if (diffInSeconds < 86400) return t('time.hoursAgo', { count: Math.floor(diffInSeconds / 3600) });
        if (diffInSeconds < 604800) return t('time.daysAgo', { count: Math.floor(diffInSeconds / 86400) });

        return date.toLocaleDateString();
    };

    const renderPriceChange = (data?: NotificationData) => {
        if (!data || !data.old_price || !data.new_price) return null;

        const currency = getCurrencySymbol(data.currency || 'USD');
        const isIncrease = data.new_price > data.old_price;
        const percentChange = ((data.new_price - data.old_price) / data.old_price * 100).toFixed(0);

        return (
            <View className="mt-3 flex-row items-center bg-white/50 rounded-xl p-3">
                <View className="flex-row items-center">
                    <Text className="text-body-md text-text-secondary font-text line-through">
                        {currency}{data.old_price}
                    </Text>
                    <Feather
                        name="arrow-right"
                        size={16}
                        color="#6B7280"
                        style={{ marginHorizontal: 8 }}
                    />
                    <Text className="text-heading-4 font-semibold font-display" style={{ color: '#216477' }}>
                        {currency}{data.new_price}
                    </Text>
                    <Text className="text-xs font-semibold ml-2" style={{ color: '#216477' }}>
                        ({isIncrease ? '+' : ''}{percentChange}%)
                    </Text>
                </View>
            </View>
        );
    };

    const renderItem = ({ item }: { item: Notification }) => {
        const config = getTypeConfig(item.type);

        return (
            <TouchableOpacity
                onPress={() => !item.is_read && handleMarkAsRead(item.id)}
                activeOpacity={0.7}
                className="px-4 mb-3"
            >
                <View className="bg-white rounded-2xl overflow-hidden shadow-sm">
                    {!item.is_read && (
                        <LinearGradient
                            colors={[`${config.colors[0]}15`, `${config.colors[1]}05`]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                        />
                    )}

                    <View className="p-4">
                        <View className="flex-row items-start">
                            {/* Icon */}
                            <LinearGradient
                                colors={config.colors}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                className="w-12 h-12 items-center justify-center mr-4 mt-1"
                                style={{ borderRadius: 16 }}
                            >
                                <Feather name={config.icon as any} size={20} color="white" />
                            </LinearGradient>

                            {/* Content */}
                            <View className="flex-1">
                                <View className="flex-row items-center justify-between mb-1">
                                    {config.bgColor !== 'transparent' && (
                                        <View className="px-2 py-0.5 rounded-full ml-2" style={{ backgroundColor: config.bgColor }}>
                                            <Text className="text-xs font-semibold font-display" style={{ color: config.textColor }}>
                                                {config.label}
                                            </Text>
                                        </View>
                                    )}
                                    {config.bgColor === 'transparent' && (
                                        <Text className="text-xs font-semibold font-display ml-2" style={{ color: config.textColor }}>
                                            {config.label}
                                        </Text>
                                    )}
                                    {!item.is_read && (
                                        <View className="w-2 h-2 rounded-full bg-blue-500" />
                                    )}
                                </View>

                                <Text className="text-body-md text-text-primary leading-5 mt-2 font-text">
                                    {item.message}
                                </Text>

                                {item.type === 'PRICE_CHANGE' && renderPriceChange(item.data)}

                                <Text className="text-xs text-text-tertiary mt-3 font-text">
                                    {getRelativeTime(item.created_at)}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
            {/* Header */}
            <View className="bg-white border-b border-gray-200">
                <View className="px-4 py-4 flex-row items-center justify-between">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="w-10">
                        <Feather name="arrow-left" size={24} color="#1F2937" />
                    </TouchableOpacity>

                    <Text className="text-heading-2 text-text-primary font-display">
                        {t('navigation.notifications')}
                    </Text>

                    <TouchableOpacity onPress={handleMarkAllAsRead} className="w-10 items-end">
                        <Feather name="check-circle" size={24} color="#3B82F6" />
                    </TouchableOpacity>
                </View>
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <MinimalLoader size="large" color="#000000" />
                    <Text className="text-body-lg text-text-tertiary mt-4 font-text">
                        {t('common.loading')}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
                    }
                    ListEmptyComponent={
                        <View className="flex-1 justify-center items-center py-20 px-6">
                            <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
                                <Feather name="bell-off" size={36} color="#9CA3AF" />
                            </View>
                            <Text className="text-heading-3 text-text-primary mb-2 font-display">
                                {t('notifications.noNotifications')}
                            </Text>
                            <Text className="text-body-md text-text-secondary text-center font-text">
                                {t('notifications.noNotificationsMessage')}
                            </Text>
                        </View>
                    }
                    contentContainerStyle={notifications.length === 0 ? { flex: 1 } : { paddingTop: 16, paddingBottom: 20 }}
                />
            )}
        </SafeAreaView>
    );
};

export default NotificationsScreen;

import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { Api } from './tracking/tracking-api';
import { storageService } from './storageService';

// Configure notification handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

class NotificationService {
    private api: Api<string>;

    constructor() {
        const baseUrl = Constants.expoConfig?.extra?.apiBaseUrl || 'http://localhost:5001';
        this.api = new Api<string>({
            baseUrl,
            securityWorker: (token) => {
                if (token) {
                    return {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    };
                }
                return {};
            },
        });
    }

    private get baseUrl() {
        return this.api.baseUrl;
    }

    async registerForPushNotificationsAsync() {
        let token;

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                console.log('Failed to get push token for push notification!');
                return;
            }

            // Get the token that uniquely identifies this device
            try {
                const projectId =
                    Constants?.expoConfig?.extra?.eas?.projectId || Constants?.easConfig?.projectId;

                if (!projectId) {
                    console.log('Project ID not found');
                }

                token = (
                    await Notifications.getExpoPushTokenAsync({
                        projectId,
                    })
                ).data;

                console.log('Expo Push Token:', token);

                // Send token to backend
                await this.sendTokenToBackend(token);

            } catch (e) {
                console.log('Error fetching push token:', e);
            }
        } else {
            console.log('Must use physical device for Push Notifications');
        }

        return token;
    }

    async sendTokenToBackend(token: string) {
        try {
            const authToken = await storageService.getToken();
            if (!authToken) return;

            this.api.setSecurityData(authToken);

            await this.api.api.saveFcmToken({
                fcm_token: token
            }, { secure: true });

            console.log('FCM Token saved to backend');
        } catch (error) {
            console.error('Error saving FCM token:', error);
        }
    }

    // Get all notifications
    async getNotifications() {
        try {
            const authToken = await storageService.getToken();
            if (!authToken) return [];

            this.api.setSecurityData(authToken);
            const response = await this.api.api.getAllNotifications({ secure: true, format: 'json' });
            const responseData = response.data as any;
            return responseData?.data || [];
        } catch (error) {
            console.error('Error fetching notifications:', error);
            return [];
        }
    }

    // Mark notification as read
    async markAsRead(id: string) {
        try {
            const authToken = await storageService.getToken();
            if (!authToken) return;

            this.api.setSecurityData(authToken);
            // Note: The generated API might need manual adjustment if the ID param is not correctly typed
            // Using direct fetch as a fallback if generated method has issues with path params
            await fetch(`${this.baseUrl}/api/notifications/${id}/read`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    }

    // Mark all as read
    async markAllAsRead() {
        try {
            const authToken = await storageService.getToken();
            if (!authToken) return;

            this.api.setSecurityData(authToken);
            await this.api.api.markAllAsRead({ secure: true, format: 'json' });
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw error;
        }
    }

    // Get unread count
    async getUnreadCount() {
        try {
            const authToken = await storageService.getToken();
            if (!authToken) return 0;

            this.api.setSecurityData(authToken);
            const response = await this.api.api.getUnreadCount({ secure: true, format: 'json' });
            // Response format: { success: true, data: { count: 1 } }
            const responseData = response.data as any;
            return responseData?.data?.count || 0;
        } catch (error) {
            console.error('Error fetching unread count:', error);
            return 0;
        }
    }
}

export const notificationService = new NotificationService();

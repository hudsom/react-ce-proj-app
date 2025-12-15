import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { router } from 'expo-router';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

Notifications.addNotificationResponseReceivedListener(response => {
  console.log('Notification tapped:', response);
  const data = response.notification.request.content.data;
  if (data?.screen) {
    router.push(data.screen as any);
  } else {
    router.push('/home');
  }
});

export class NotificationService {
  static async registerForPushNotificationsAsync() {
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
        console.log('Push notification permission not granted');
        return null;
      }
      try {
        token = (await Notifications.getExpoPushTokenAsync({
          projectId: Constants.expoConfig?.extra?.eas?.projectId,
        })).data;
      } catch (error) {
        console.log('Error getting push token:', error);
      }
    } else {
      console.log('Must use physical device for Push Notifications');
    }

    return token;
  }

  static async scheduleLocalNotification(title: string, body: string, seconds: number = 1, screen?: string) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { screen: screen || '/home' },
        },
        trigger: { seconds },
      });
    } catch (error) {
      console.log('Error scheduling notification:', error);
    }
  }

  static async sendImmediateNotification(title: string, body: string, screen?: string) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { screen: screen || '/home' },
        },
        trigger: null,
      });
    } catch (error) {
      console.log('Error sending immediate notification:', error);
    }
  }
}
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { savePushToken } from './firestore';

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request notification permissions and register the device push token.
 * Call this after the user logs in.
 */
export async function registerForPushNotifications(uid: string): Promise<string | null> {
  if (!Device.isDevice) {
    console.log('Push notifications only work on physical devices.');
    return null;
  }

  // Check / request permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Push notification permission denied.');
    return null;
  }

  // Android channel setup
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'CTeen נתיבות',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#E8A96A',
      sound: 'default',
    });
  }

  // Get Expo push token
  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: '5f83ec19-6dbf-4ce2-ba27-99c473686fe3',
    });
    const token = tokenData.data;

    // Save to Firestore
    await savePushToken(uid, token);
    return token;
  } catch (e) {
    console.warn('Failed to get push token:', e);
    return null;
  }
}

/**
 * Send a push notification to all registered tokens via Expo Push Service.
 * This is called from the Admin screen — makes a direct HTTP call to Expo.
 * For production, consider using a Cloud Function instead.
 */
export async function sendPushNotificationToAll(
  title: string,
  body: string,
  tokens: string[]
): Promise<boolean> {
  if (tokens.length === 0) return false;

  const messages = tokens.map((token) => ({
    to: token,
    sound: 'default',
    title,
    body,
    data: { type: 'admin-notification' },
    priority: 'high',
    channelId: 'default',
  }));

  try {
    // Expo Push API — batch of max 100
    const batches: typeof messages[] = [];
    for (let i = 0; i < messages.length; i += 100) {
      batches.push(messages.slice(i, i + 100));
    }

    for (const batch of batches) {
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(batch),
      });

      if (!response.ok) {
        console.warn('Expo push send failed:', await response.text());
        return false;
      }
    }
    return true;
  } catch (e) {
    console.warn('sendPushNotificationToAll error:', e);
    return false;
  }
}

/**
 * Add a listener for when user taps a notification.
 * Returns the subscription to clean up on unmount.
 */
export function addNotificationResponseListener(
  onResponse: (response: Notifications.NotificationResponse) => void
) {
  return Notifications.addNotificationResponseReceivedListener(onResponse);
}

/**
 * Add a listener for notifications received while app is foregrounded.
 */
export function addNotificationReceivedListener(
  onNotification: (notification: Notifications.Notification) => void
) {
  return Notifications.addNotificationReceivedListener(onNotification);
}

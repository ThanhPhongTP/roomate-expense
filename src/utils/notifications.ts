import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Thiết lập cách hiển thị thông báo khi người dùng đang mở app
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Đăng ký nhận thông báo đẩy và lấy Expo Push Token
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (Platform.OS === 'web') {
    console.warn('[Notifications] Đăng ký push token thất bại: Nền tảng Web không hỗ trợ Expo Push Notifications.');
    return null;
  }

  try {
    // Hardcode projectId để đảm bảo hoạt động trong cả APK Release lẫn Expo Go
    // Constants.expoConfig không hoạt động trong APK Release build bằng Gradle
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId ??
      'dee3bfcf-6243-4e1d-9319-f10303c2ebf6'; // fallback hardcode từ app.json

    console.log('[Notifications] Sử dụng projectId:', projectId);

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('[Notifications] Đăng ký push token thất bại: Người dùng từ chối cấp quyền thông báo.');
      return null;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    console.log('[Notifications] Đã đăng ký thành công Expo Push Token:', tokenData.data);

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return tokenData.data;
  } catch (error) {
    console.error('[Notifications] Lỗi xảy ra khi đăng ký Push Notification:', error);
    return null;
  }
}

/**
 * Gửi thông báo đến danh sách các token đích
 */
export async function sendPushNotification(
  targetTokens: string[],
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<{ success: boolean; validCount: number; resData?: any; error?: string }> {
  // Lọc bỏ các token rỗng hoặc không đúng định dạng của Expo
  const validTokens = targetTokens.filter(
    (token) =>
      token &&
      typeof token === 'string' &&
      (token.startsWith('ExpoPushToken') ||
        token.startsWith('ExponentPushToken') ||
        token.startsWith('FCMToken'))
  );

  if (validTokens.length === 0) {
    console.log('[Notifications] Không có token đích hợp lệ để gửi thông báo.');
    return { success: false, validCount: 0, error: 'Không tìm thấy token hợp lệ' };
  }

  const messages = validTokens.map((token) => ({
    to: token,
    sound: 'default',
    title: title,
    body: body,
    channelId: 'default',
    priority: 'high',
    data: data || {},
  }));

  try {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };
    if (Platform.OS !== 'web') {
      headers['Accept-encoding'] = 'gzip, deflate';
    }

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers,
      body: JSON.stringify(messages),
    });

    const resData = await response.json();
    console.log('[Notifications] Kết quả gửi thông báo từ Expo API:', JSON.stringify(resData));
    return { success: response.ok, validCount: validTokens.length, resData };
  } catch (error: any) {
    console.error('[Notifications] Lỗi khi gửi yêu cầu thông báo qua Expo API:', error);
    return { success: false, validCount: validTokens.length, error: error?.message || 'Network error' };
  }
}

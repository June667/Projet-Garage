import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export const notificationService = {
  schedule: async (title: string, body: string, id: number = 1) => {
    try {
      // Check if we are running in a native environment or if notifications are supported
      if (Capacitor.isNativePlatform()) {
        const permission = await LocalNotifications.checkPermissions();
        if (permission.display !== 'granted') {
          await LocalNotifications.requestPermissions();
        }
        
        await LocalNotifications.schedule({
          notifications: [
            {
              title,
              body,
              id,
              schedule: { at: new Date(Date.now() + 500) },
              sound: 'default'
            }
          ]
        });
      } else {
        // Fallback for web browser
        console.log(`[Notification Fallback] ${title}: ${body}`);
        // We could use browser Notification API here if needed, 
        // but often it's restricted on mobile browsers without HTTPS.
      }
    } catch (error) {
      console.warn("Notification system error:", error);
      // Silently fail to not break the app flow
    }
  }
};

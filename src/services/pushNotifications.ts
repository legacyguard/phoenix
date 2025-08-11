// src/services/pushNotifications.ts

import { toast } from "sonner";

interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

class PushNotificationService {
  private vapidPublicKey: string =
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

  // Convert base64 string to Uint8Array
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Check if push notifications are supported
  public isSupported(): boolean {
    return "serviceWorker" in navigator && "PushManager" in window;
  }

  // Check current permission status
  public getPermissionStatus(): NotificationPermission {
    return Notification.permission;
  }

  // Request permission for notifications
  public async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      throw new Error("Push notifications are not supported in this browser");
    }

    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      toast.success("Notifications enabled! You'll receive important updates.");
    } else if (permission === "denied") {
      toast.error(
        "Notifications blocked. You can enable them in browser settings.",
      );
    }

    return permission;
  }

  // Subscribe to push notifications
  public async subscribe(userId: string): Promise<PushSubscriptionData | null> {
    if (!this.isSupported()) {
      throw new Error("Push notifications are not supported");
    }

    if (this.getPermissionStatus() !== "granted") {
      throw new Error("Notification permission not granted");
    }

    try {
      const registration = await navigator.serviceWorker.ready;

      // Check if already subscribed
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        // Subscribe to push notifications
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey),
        });
      }

      // Convert subscription to JSON format
      const subscriptionData: PushSubscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(
            String.fromCharCode(
              ...new Uint8Array(subscription.getKey("p256dh")!),
            ),
          ),
          auth: btoa(
            String.fromCharCode(
              ...new Uint8Array(subscription.getKey("auth")!),
            ),
          ),
        },
      };

      // Send subscription to backend
      await this.sendSubscriptionToBackend(userId, subscriptionData);

      return subscriptionData;
    } catch (error) {
      console.error("Error subscribing to push notifications:", error);
      toast.error("Failed to enable push notifications");
      return null;
    }
  }

  // Unsubscribe from push notifications
  public async unsubscribe(userId: string): Promise<boolean> {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        await this.removeSubscriptionFromBackend(userId, subscription.endpoint);
        toast.success("Push notifications disabled");
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error unsubscribing from push notifications:", error);
      toast.error("Failed to disable push notifications");
      return false;
    }
  }

  // Send subscription to backend
  private async sendSubscriptionToBackend(
    userId: string,
    subscription: PushSubscriptionData,
  ): Promise<void> {
    const response = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        subscription,
        userAgent: navigator.userAgent,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to save subscription to backend");
    }
  }

  // Remove subscription from backend
  private async removeSubscriptionFromBackend(
    userId: string,
    endpoint: string,
  ): Promise<void> {
    const response = await fetch("/api/push/unsubscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        endpoint,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to remove subscription from backend");
    }
  }

  // Check if user is subscribed
  public async isSubscribed(): Promise<boolean> {
    if (!this.isSupported()) return false;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      return !!subscription;
    } catch (error) {
      return false;
    }
  }

  // Show a local notification (for testing)
  public async showLocalNotification(
    title: string,
    options?: NotificationOptions,
  ): Promise<void> {
    if (this.getPermissionStatus() !== "granted") {
      throw new Error("Notification permission not granted");
    }

    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(title, {
      icon: "/icons/icon-192x192.png",
      badge: "/icons/badge-72x72.png",
      ...options,
    });
  }
}

export const pushNotifications = new PushNotificationService();

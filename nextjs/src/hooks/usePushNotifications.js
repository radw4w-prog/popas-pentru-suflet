import { useState, useEffect, useCallback } from 'react';

const VAPID_PUBLIC_KEY = process.env.REACT_APP_VAPID_PUBLIC_KEY || '';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const usePushNotifications = () => {
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState('default');
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    const isSupported =
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window;

    setSupported(isSupported);

    if (isSupported) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!supported) return 'unsupported';

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    } catch (error) {
      console.error('Eroare permisiune notificări:', error);
      return 'denied';
    }
  }, [supported]);

  const subscribe = useCallback(async () => {
    if (!supported || permission !== 'granted') return null;

    try {
      const registration = await navigator.serviceWorker.ready;

      const existing = await registration.pushManager.getSubscription();
      if (existing) {
        setSubscription(existing);
        return existing;
      }

      if (!VAPID_PUBLIC_KEY) {
        console.log('ℹ️ VAPID key lipsă - push notifications dezactivate');
        return null;
      }

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });

      setSubscription(sub);
      console.log('✅ Push subscription activă');
      return sub;
    } catch (error) {
      console.error('Eroare push subscription:', error);
      return null;
    }
  }, [supported, permission]);

  // Notificare locală (fără server)
  const sendLocalNotification = useCallback(async (title, body, options = {}) => {
    if (!supported) return;

    const perm = permission === 'default'
      ? await requestPermission()
      : permission;

    if (perm !== 'granted') return;

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        body,
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-72.png',
        vibrate: [200, 100, 200],
        tag: options.tag || 'popas-local',
        data: options.data || { url: '/dashboard' },
        ...options
      });
    } catch (error) {
      // Fallback la Notification API
      try {
        new Notification(title, { body, icon: '/icons/icon-192.png' });
      } catch (e) {
        console.error('Eroare notificare:', e);
      }
    }
  }, [supported, permission, requestPermission]);

  return {
    supported,
    permission,
    subscription,
    requestPermission,
    subscribe,
    sendLocalNotification
  };
};

export default usePushNotifications;
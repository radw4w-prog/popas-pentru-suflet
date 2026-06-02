import { useState, useEffect, useCallback } from 'react';
import api from '@/services/api';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

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

function getAuthHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const usePushNotifications = () => {
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState('default');
  const [subscription, setSubscription] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverConfigured, setServerConfigured] = useState(Boolean(VAPID_PUBLIC_KEY));

  const loadCurrentSubscription = useCallback(async () => {
    const isSupported =
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window;

    setSupported(isSupported);
    if (!isSupported) return null;

    setPermission(Notification.permission);

    try {
      const registration = await navigator.serviceWorker.ready;
      const existing = await registration.pushManager.getSubscription();
      setSubscription(existing);
      setIsSubscribed(Boolean(existing));
      return existing;
    } catch (error) {
      console.error('Eroare loadCurrentSubscription:', error);
      return null;
    }
  }, []);

  const refreshStatus = useCallback(async () => {
    try {
      const res = await api.get('/api/push/status', { headers: getAuthHeaders() });
      if (res.data?.success) {
        setServerConfigured(Boolean(res.data.configured) && Boolean(VAPID_PUBLIC_KEY));
      }
    } catch (error) {
      setServerConfigured(Boolean(VAPID_PUBLIC_KEY));
    }
  }, []);

  useEffect(() => {
    loadCurrentSubscription();
    refreshStatus();
  }, [loadCurrentSubscription, refreshStatus]);

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
    if (!supported) {
      return { success: false, message: 'Browserul nu suportă notificări push.' };
    }

    if (!VAPID_PUBLIC_KEY) {
      return { success: false, message: 'Lipsește NEXT_PUBLIC_VAPID_PUBLIC_KEY în frontend.' };
    }

    setLoading(true);

    try {
      let perm = permission;
      if (perm === 'default') {
        perm = await requestPermission();
      }

      if (perm !== 'granted') {
        return { success: false, message: 'Permisiunea pentru notificări nu a fost acordată.' };
      }

      const registration = await navigator.serviceWorker.ready;
      let existing = await registration.pushManager.getSubscription();

      if (!existing) {
        existing = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        });
      }

      await api.post(
        '/api/push/subscribe',
        { subscription: existing.toJSON() },
        { headers: getAuthHeaders() }
      );

      setSubscription(existing);
      setIsSubscribed(true);
      await refreshStatus();

      return { success: true, message: 'Notificările push au fost activate.' };
    } catch (error) {
      console.error('Eroare push subscription:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Nu am putut activa notificările push.'
      };
    } finally {
      setLoading(false);
    }
  }, [supported, permission, requestPermission, refreshStatus]);

  const unsubscribe = useCallback(async () => {
    if (!supported) {
      return { success: false, message: 'Browserul nu suportă notificări push.' };
    }

    setLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      const existing = await registration.pushManager.getSubscription();
      const endpoint = existing?.endpoint;

      await api.post(
        '/api/push/unsubscribe',
        endpoint ? { endpoint } : {},
        { headers: getAuthHeaders() }
      );

      if (existing) {
        await existing.unsubscribe();
      }

      setSubscription(null);
      setIsSubscribed(false);
      await refreshStatus();

      return { success: true, message: 'Notificările push au fost dezactivate.' };
    } catch (error) {
      console.error('Eroare unsubscribe push:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Nu am putut dezactiva notificările push.'
      };
    } finally {
      setLoading(false);
    }
  }, [supported, refreshStatus]);

  const sendTestNotification = useCallback(async () => {
    try {
      const res = await api.post('/api/push/test', {}, { headers: getAuthHeaders() });
      return {
        success: Boolean(res.data?.success),
        message: res.data?.message || 'Notificarea de test a fost trimisă.'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Nu am putut trimite notificarea de test.'
      };
    }
  }, []);

  const sendTestDevotional = useCallback(async () => {
    try {
      const res = await api.post('/api/push/test-devotional', {}, { headers: getAuthHeaders() });
      return {
        success: Boolean(res.data?.success),
        message: res.data?.message || 'Testul pentru devoțional a fost trimis.'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Nu am putut trimite testul pentru devoțional.'
      };
    }
  }, []);

  const sendTestReading = useCallback(async () => {
    try {
      const res = await api.post('/api/push/test-reading', {}, { headers: getAuthHeaders() });
      return {
        success: Boolean(res.data?.success),
        message: res.data?.message || 'Testul pentru reminder-ul de citire a fost trimis.'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Nu am putut trimite testul pentru citire.'
      };
    }
  }, []);

  return {
    supported,
    permission,
    subscription,
    isSubscribed,
    loading,
    serverConfigured,
    requestPermission,
    subscribe,
    unsubscribe,
    refreshStatus,
    sendTestNotification,
    sendTestDevotional,
    sendTestReading
  };
};

export default usePushNotifications;

// frontend/src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const FACEBOOK_APP_ID = process.env.REACT_APP_FACEBOOK_APP_ID || '';

// ── Token utils ───────────────────────────────────────────────
const TOKEN_KEY = 'token';
const TOKEN_EXPIRY_KEY = 'token_expiry';
const TOKEN_DURATION = 24 * 60 * 60 * 1000; // 24 ore în ms

const saveToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(TOKEN_EXPIRY_KEY, Date.now() + TOKEN_DURATION);
};

const getToken = () => localStorage.getItem(TOKEN_KEY);

const isTokenExpired = () => {
  const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
  if (!expiry) return true;
  return Date.now() > parseInt(expiry);
};

const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
};

// ── Facebook SDK ──────────────────────────────────────────────
let facebookSDKPromise = null;

const loadFacebookSDK = (appId) => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Facebook SDK poate rula doar în browser.'));
  }
  if (window.FB) return Promise.resolve(window.FB);
  if (facebookSDKPromise) return facebookSDKPromise;

  facebookSDKPromise = new Promise((resolve, reject) => {
    window.fbAsyncInit = function () {
      window.FB.init({ appId, cookie: true, xfbml: false, version: 'v22.0' });
      resolve(window.FB);
    };

    if (!document.getElementById('facebook-jssdk')) {
      const js = document.createElement('script');
      js.id = 'facebook-jssdk';
      js.async = true;
      js.defer = true;
      js.crossOrigin = 'anonymous';
      js.src = 'https://connect.facebook.net/ro_RO/sdk.js';
      js.onerror = () => reject(new Error('Nu am putut încărca Facebook SDK.'));
      document.body.appendChild(js);
    }

    setTimeout(() => {
      if (!window.FB) reject(new Error('Timeout la încărcarea Facebook SDK.'));
    }, 15000);
  });

  return facebookSDKPromise;
};

// ═════════════════════════════════════════════════════════════
// AUTH PROVIDER
// ═════════════════════════════════════════════════════════════
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const refreshTimerRef = useRef(null);

  // ── Set/clear axios auth header ───────────────────────────
  const setAuthHeader = useCallback((token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, []);

  // ── Logout sigur ──────────────────────────────────────────
  const logout = useCallback(() => {
    // Oprește timer-ul de refresh
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }

    clearToken();
    setAuthHeader(null);
    setUser(null);

    // Notify backend (best effort)
    axios.post(`${API_URL}/api/auth/logout`).catch(() => {});
  }, [setAuthHeader]);

  // ── Refresh token automat ─────────────────────────────────
  const scheduleTokenRefresh = useCallback((token) => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);

    // Refresh cu 30 minute înainte de expirare
    const refreshIn = TOKEN_DURATION - 30 * 60 * 1000;

    refreshTimerRef.current = setTimeout(async () => {
      try {
        const res = await axios.get(`${API_URL}/api/auth/me`);
        if (res.data.success) {
          // Token-ul e valid — salvăm expiry-ul nou
          saveToken(token);
          scheduleTokenRefresh(token);
          console.log('✅ Token refresh reușit');
        } else {
          logout();
        }
      } catch {
        logout();
      }
    }, refreshIn);
  }, [logout]);

  // ── Interceptor axios — detectează 401 automat ────────────
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          const code = error.response?.data?.code;
          if (code === 'TOKEN_EXPIRED' || code === 'TOKEN_INVALID') {
            logout();
          }
        }
        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, [logout]);

  // ── Init auth la pornire ──────────────────────────────────
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = getToken();

      if (!savedToken) {
        setLoading(false);
        return;
      }

      // Verifică dacă token-ul e expirat local
      if (isTokenExpired()) {
        clearToken();
        setAuthHeader(null);
        setLoading(false);
        return;
      }

      setAuthHeader(savedToken);

      try {
        const res = await axios.get(`${API_URL}/api/auth/me`);
        if (res.data.success) {
          setUser(res.data.user);
          scheduleTokenRefresh(savedToken);
        } else {
          logout();
        }
      } catch {
        logout();
      }

      setLoading(false);
    };

    initAuth();

    // Cleanup la unmount
    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, [setAuthHeader, logout, scheduleTokenRefresh]);

  // ── Login ─────────────────────────────────────────────────
  const login = async (email, parola) => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, { email, parola });

      if (res.data.success) {
        const { token, user: userData } = res.data;
        saveToken(token);
        setAuthHeader(token);
        setUser(userData);
        scheduleTokenRefresh(token);
        return { success: true, user: userData };
      }

      return { success: false, message: 'Autentificare eșuată.' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Eroare la autentificare.'
      };
    }
  };

  // ── Register ──────────────────────────────────────────────
  const register = async (nume, email, parola) => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/register`, { nume, email, parola });

      if (res.data.success) {
        const { token, user: userData } = res.data;
        saveToken(token);
        setAuthHeader(token);
        setUser(userData);
        scheduleTokenRefresh(token);
        return { success: true, user: userData };
      }

      return { success: false, message: 'Înregistrare eșuată.' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Eroare la înregistrare.'
      };
    }
  };

  // ── Facebook SDK ──────────────────────────────────────────
  const ensureFacebookSDK = useCallback(async () => {
    if (!FACEBOOK_APP_ID) throw new Error('Lipsește REACT_APP_FACEBOOK_APP_ID');
    return await loadFacebookSDK(FACEBOOK_APP_ID);
  }, []);

  const loginWithFacebookToken = useCallback(async (accessToken, userID = null) => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/facebook`, { accessToken, userID });

      if (res.data.success) {
        const { token, user: userData } = res.data;
        saveToken(token);
        setAuthHeader(token);
        setUser(userData);
        scheduleTokenRefresh(token);
        return { success: true, user: userData };
      }

      return { success: false, message: 'Autentificarea cu Facebook a eșuat.' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Eroare la autentificarea cu Facebook.'
      };
    }
  }, [setAuthHeader, scheduleTokenRefresh]);

  const loginWithFacebook = useCallback(async () => {
    try {
      const FB = await ensureFacebookSDK();

      return await new Promise((resolve) => {
        FB.login(
          function (response) {
            (async () => {
              if (!response?.authResponse) {
                resolve({ success: false, message: 'Autentificarea cu Facebook a fost anulată.' });
                return;
              }
              const result = await loginWithFacebookToken(
                response.authResponse.accessToken,
                response.authResponse.userID
              );
              resolve(result);
            })().catch((error) => {
              resolve({ success: false, message: error.message });
            });
          },
          { scope: 'public_profile', return_scopes: true }
        );
      });
    } catch (error) {
      return { success: false, message: error.message || 'Nu am putut porni Facebook Login.' };
    }
  }, [ensureFacebookSDK, loginWithFacebookToken]);

  const updateUser = (userData) => setUser(prev => ({ ...prev, ...userData }));

  // ── Verifică dacă sesiunea e activă ──────────────────────
  const isSessionValid = () => {
    const token = getToken();
    return !!token && !isTokenExpired();
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: !!user,
      isAdmin: user?.rol === 'admin',
      login,
      logout,
      register,
      loginWithFacebook,
      loginWithFacebookToken,
      updateUser,
      isSessionValid
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth trebuie folosit în interiorul AuthProvider');
  return context;
};

export default AuthContext;

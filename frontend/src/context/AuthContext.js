// frontend/src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const FACEBOOK_APP_ID = process.env.REACT_APP_FACEBOOK_APP_ID || '';

const TOKEN_KEY = 'token';
const saveToken = (token) => localStorage.setItem(TOKEN_KEY, token);
const getToken = () => localStorage.getItem(TOKEN_KEY);
const clearToken = () => localStorage.removeItem(TOKEN_KEY);

const decodeToken = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
};

const isTokenExpired = (token) => {
  if (!token) return true;
  const decoded = decodeToken(token);
  if (!decoded?.exp) return true;
  return decoded.exp * 1000 < Date.now();
};

// Facebook SDK
let facebookSDKPromise = null;
const loadFacebookSDK = (appId) => {
  if (typeof window === 'undefined') return Promise.reject(new Error('Browser only'));
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
      js.async = true; js.defer = true; js.crossOrigin = 'anonymous';
      js.src = 'https://connect.facebook.net/ro_RO/sdk.js';
      js.onerror = () => reject(new Error('Nu am putut încărca Facebook SDK.'));
      document.body.appendChild(js);
    }
    setTimeout(() => { if (!window.FB) reject(new Error('Timeout Facebook SDK.')); }, 15000);
  });
  return facebookSDKPromise;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const refreshTimerRef = useRef(null);

  const setAuthHeader = useCallback((token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, []);

  const logout = useCallback(() => {
    console.log('🔒 Logout apelat');
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
    clearToken();
    setAuthHeader(null);
    setUser(null);
    axios.post(`${API_URL}/api/auth/logout`).catch(() => {});
  }, [setAuthHeader]);

  const scheduleTokenRefresh = useCallback((token) => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    const decoded = decodeToken(token);
    if (!decoded?.exp) return;
    const expiresIn = decoded.exp * 1000 - Date.now();
    const refreshIn = Math.max(expiresIn - 5 * 60 * 1000, 60 * 1000);
    console.log(`🔄 Token refresh programat în ${Math.round(refreshIn / 60000)} minute`);
    refreshTimerRef.current = setTimeout(async () => {
      try {
        const res = await axios.get(`${API_URL}/api/auth/me`);
        if (res.data.success) {
          scheduleTokenRefresh(token);
        } else {
          logout();
        }
      } catch {
        logout();
      }
    }, refreshIn);
  }, [logout]);

  // Interceptor 401
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        console.log('🔴 Axios error interceptat:', error.response?.status, error.response?.data?.code);
        if (error.response?.status === 401) {
          const code = error.response?.data?.code;
          if (code === 'TOKEN_EXPIRED' || code === 'TOKEN_INVALID') {
            console.log('🔒 401 cu cod - logout automat');
            logout();
          }
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, [logout]);

  // Init auth
  useEffect(() => {
    const initAuth = async () => {
      console.log('🚀 initAuth pornit');
      const savedToken = getToken();
      console.log('📦 Token în localStorage:', !!savedToken);

      if (!savedToken) {
        console.log('❌ Fără token - loading false');
        setLoading(false);
        return;
      }

      const expired = isTokenExpired(savedToken);
      console.log('⏰ Token expirat?', expired);

      if (expired) {
        console.log('🔒 Token expirat local - logout');
        clearToken();
        setAuthHeader(null);
        setLoading(false);
        return;
      }

      setAuthHeader(savedToken);
      console.log('📡 Fac request la /api/auth/me...');

      try {
        const res = await axios.get(`${API_URL}/api/auth/me`);
        console.log('✅ /api/auth/me răspuns:', res.status, res.data.success);
        if (res.data.success) {
          setUser(res.data.user);
          scheduleTokenRefresh(savedToken);
        } else {
          console.log('❌ /api/auth/me success=false - logout');
          logout();
        }
      } catch (error) {
        console.log('❌ /api/auth/me eroare:', error.response?.status, error.message);
        if (error.response?.status === 401) {
          console.log('🔒 401 de la /me - logout');
          logout();
        } else {
          // Eroare de rețea — păstrăm sesiunea
          console.log('⚠️ Eroare rețea - păstrăm sesiunea din token');
          const decoded = decodeToken(savedToken);
          if (decoded) {
            setUser({ _id: decoded.id, id: decoded.id });
            scheduleTokenRefresh(savedToken);
          } else {
            logout();
          }
        }
      }

      setLoading(false);
    };

    initAuth();
    return () => { if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current); };
  }, [setAuthHeader, logout, scheduleTokenRefresh]);

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
      return { success: false, message: error.response?.data?.message || 'Eroare la autentificare.' };
    }
  };

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
      return { success: false, message: error.response?.data?.message || 'Eroare la înregistrare.' };
    }
  };

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
      return { success: false, message: error.response?.data?.message || 'Eroare Facebook.' };
    }
  }, [setAuthHeader, scheduleTokenRefresh]);

  const loginWithFacebook = useCallback(async () => {
    try {
      const FB = await ensureFacebookSDK();
      return await new Promise((resolve) => {
        FB.login(function (response) {
          (async () => {
            if (!response?.authResponse) {
              resolve({ success: false, message: 'Anulat.' });
              return;
            }
            resolve(await loginWithFacebookToken(
              response.authResponse.accessToken,
              response.authResponse.userID
            ));
          })().catch(e => resolve({ success: false, message: e.message }));
        }, { scope: 'public_profile', return_scopes: true });
      });
    } catch (error) {
      return { success: false, message: error.message };
    }
  }, [ensureFacebookSDK, loginWithFacebookToken]);

  const updateUser = (userData) => setUser(prev => ({ ...prev, ...userData }));

  return (
    <AuthContext.Provider value={{
      user, loading,
      isAuthenticated: !!user,
      isAdmin: user?.rol === 'admin',
      login, logout, register,
      loginWithFacebook, loginWithFacebookToken,
      updateUser
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

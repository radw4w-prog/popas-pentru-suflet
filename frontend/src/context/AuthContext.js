// frontend/src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

// URL absolut — evităm probleme cu baseURL setat în api.js
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

// Instanță axios separată DOAR pentru auth — nu e afectată de api.js
const authAxios = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
});

let isLoggingOut = false;

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
      // Setăm pe ambele instanțe
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      authAxios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
      delete authAxios.defaults.headers.common['Authorization'];
    }
  }, []);

  const logout = useCallback(() => {
    if (isLoggingOut) return;
    isLoggingOut = true;

    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }

    clearToken();
    setAuthHeader(null);
    setUser(null);

    // fetch nativ — evităm orice interceptor axios
    fetch(`${API_URL}/api/auth/logout`, { method: 'POST' })
      .catch(() => {})
      .finally(() => { isLoggingOut = false; });
  }, [setAuthHeader]);

  const scheduleTokenRefresh = useCallback((token) => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    const decoded = decodeToken(token);
    if (!decoded?.exp) return;
    const expiresIn = decoded.exp * 1000 - Date.now();
    const refreshIn = Math.max(expiresIn - 5 * 60 * 1000, 60 * 1000);
    refreshTimerRef.current = setTimeout(async () => {
      try {
        // Folosim authAxios — instanță separată
        const res = await authAxios.get('/api/auth/me');
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

  // Init auth
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = getToken();

      if (!savedToken) {
        setLoading(false);
        return;
      }

      if (isTokenExpired(savedToken)) {
        clearToken();
        setLoading(false);
        return;
      }

      setAuthHeader(savedToken);

      try {
        // Folosim authAxios — instanță separată, fără interferențe
        const res = await authAxios.get('/api/auth/me');
        if (res.data.success) {
          setUser(res.data.user);
          scheduleTokenRefresh(savedToken);
        } else {
          logout();
        }
      } catch (error) {
        if (error.response?.status === 401) {
          logout();
        } else {
          // Eroare rețea — păstrăm sesiunea din token
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

  // Interceptor pe axios global — doar pentru erori 401 cu cod specific
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (
          !isLoggingOut &&
          error.response?.status === 401 &&
          error.config?.url !== `${API_URL}/api/auth/logout`
        ) {
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

  const login = async (email, parola) => {
    try {
      const res = await authAxios.post('/api/auth/login', { email, parola });
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
      const res = await authAxios.post('/api/auth/register', { nume, email, parola });
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
      const res = await authAxios.post('/api/auth/facebook', { accessToken, userID });
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

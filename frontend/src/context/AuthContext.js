// frontend/src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const FACEBOOK_APP_ID = process.env.REACT_APP_FACEBOOK_APP_ID || '';

// ── Token utils ───────────────────────────────────────────────
const TOKEN_KEY = 'token';

const saveToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

const getToken = () => localStorage.getItem(TOKEN_KEY);

const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

// Decodează JWT fără librărie externă
const decodeToken = (token) => {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch {
    return null;
  }
};

const isTokenExpired = (token) => {
  if (!token) return true;
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return true;
  // exp e în secunde, Date.now() în ms
  return decoded.exp * 1000 < Date.now();
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
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
    clearToken();
    setAuthHeader(null);
    setUser(null);
    // Notify backend best effort
    axios.post(`${API_URL}/api/auth/logout`).catch(() => {});
  }, [setAuthHeader]);

  // ── Refresh token automat ─────────────────────────────────
  const scheduleTokenRefresh = useCallback((token) => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);

    const decoded = decodeToken(token);
    if (!decoded?.exp) return;

    const expiresIn = decoded.exp * 1000 - Date.now();
    // Refresh cu 5 minute înainte de expirare
    const refreshIn = Math.max(expiresIn - 5 * 60 * 1000, 60 * 1000);

    console.log(`🔄 Token refresh programat în ${Math.round(refreshIn / 60000)} minute`);

    refreshTimerRef.current = setTimeout(async () => {
      try {
        const res = await axios.get(`${API_URL}/api/auth/me`);
        if (res.data.success) {
          // Token-ul e încă valid — re-programează refresh
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

      // Verifică expirat din JWT payload direct
      if (isTokenExpired(savedToken)) {
        console.log('🔒 Token expirat - logout automat');
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
      } catch (error) {
  console.log('❌ /api/auth/me error:', error.response?.status, error.response?.data);
  console.log('❌ Error message:', error.message);
  // Dacă e eroare de rețea (nu 401) — păstrăm userul logat
  if (error.response?.status === 401) {
    logout();
  } else {
    const decoded = decodeToken(savedToken);
    if (decoded) {
      setUser({ id: decoded.id });
      scheduleTokenRefresh(savedToken);
    } else {
      logout();
    }
  }
}

      setLoading(false);
    };

    initAuth();

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

  // ── Facebook ──────────────────────────────────────────────
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

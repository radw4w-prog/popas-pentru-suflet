// frontend/src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const FACEBOOK_APP_ID = process.env.REACT_APP_FACEBOOK_APP_ID || '';

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
    setTimeout(() => { if (!window.FB) reject(new Error('Timeout.')); }, 15000);
  });
  return facebookSDKPromise;
};

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({ user: null, loading: true });
  const initDoneRef = useRef(false);

  const setAuthHeader = useCallback((tok) => {
    if (tok) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${tok}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('token_expiry');
    setAuthHeader(null);
    setAuthState({ user: null, loading: false });
  }, [setAuthHeader]);

  useEffect(() => {
    if (initDoneRef.current) return;
    initDoneRef.current = true;

    const initAuth = async () => {
      const savedToken = localStorage.getItem('token');

      if (!savedToken) {
        setAuthState({ user: null, loading: false });
        return;
      }

      setAuthHeader(savedToken);

      try {
        const res = await axios.get(`${API_URL}/api/auth/me`);
        if (res.data.success && res.data.user) {
          setAuthState({ user: res.data.user, loading: false });
        } else {
          localStorage.removeItem('token');
          setAuthHeader(null);
          setAuthState({ user: null, loading: false });
        }
      } catch (error) {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          setAuthHeader(null);
          setAuthState({ user: null, loading: false });
        } else {
          // Eroare rețea — păstrăm sesiunea
          setAuthState({ user: { _fromToken: true }, loading: false });
        }
      }
    };

    initAuth();
  }, [setAuthHeader]);

  const login = async (email, parola) => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, { email, parola });
      if (res.data.success) {
        const { token, user: userData } = res.data;
        localStorage.setItem('token', token);
        setAuthHeader(token);
        setAuthState({ user: userData, loading: false });
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
        localStorage.setItem('token', token);
        setAuthHeader(token);
        setAuthState({ user: userData, loading: false });
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
        localStorage.setItem('token', token);
        setAuthHeader(token);
        setAuthState({ user: userData, loading: false });
        return { success: true, user: userData };
      }
      return { success: false, message: 'Autentificarea cu Facebook a eșuat.' };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Eroare Facebook.' };
    }
  }, [setAuthHeader]);

  const loginWithFacebook = useCallback(async () => {
    try {
      const FB = await ensureFacebookSDK();
      return await new Promise((resolve) => {
        FB.login(function (response) {
          (async () => {
            if (!response?.authResponse) {
              resolve({ success: false, message: 'Autentificarea cu Facebook a fost anulată.' });
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

  const updateUser = useCallback((userData) => {
    setAuthState(prev => ({ ...prev, user: { ...prev.user, ...userData } }));
  }, []);

  const { user, loading } = authState;

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

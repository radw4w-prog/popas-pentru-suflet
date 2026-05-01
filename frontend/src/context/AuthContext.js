import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const FACEBOOK_APP_ID = process.env.REACT_APP_FACEBOOK_APP_ID || '';

let facebookSDKPromise = null;

const loadFacebookSDK = (appId) => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Facebook SDK poate rula doar în browser.'));
  }

  if (window.FB) {
    return Promise.resolve(window.FB);
  }

  if (facebookSDKPromise) {
    return facebookSDKPromise;
  }

  facebookSDKPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById('facebook-jssdk');

    window.fbAsyncInit = function () {
      window.FB.init({
        appId,
        cookie: true,
        xfbml: false,
        version: 'v22.0'
      });
      resolve(window.FB);
    };

    if (!existingScript) {
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
      if (!window.FB) {
        reject(new Error('Timeout la încărcarea Facebook SDK.'));
      }
    }, 15000);
  });

  return facebookSDKPromise;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const setAuthHeader = useCallback((tok) => {
    if (tok) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${tok}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setAuthHeader(null);
    setUser(null);
  }, [setAuthHeader]);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token');

      if (savedToken) {
        setAuthHeader(savedToken);
        try {
          const res = await axios.get(`${API_URL}/api/auth/me`);
          if (res.data.success) {
            setUser(res.data.user);
          } else {
            logout();
          }
        } catch (error) {
          logout();
        }
      }

      setLoading(false);
    };

    initAuth();
  }, [setAuthHeader, logout]);

  const login = async (email, parola) => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, { email, parola });

      if (res.data.success) {
        const { token, user: userData } = res.data;
        localStorage.setItem('token', token);
        setAuthHeader(token);
        setUser(userData);
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

  const register = async (nume, email, parola) => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/register`, { nume, email, parola });

      if (res.data.success) {
        const { token, user: userData } = res.data;
        localStorage.setItem('token', token);
        setAuthHeader(token);
        setUser(userData);
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

  const ensureFacebookSDK = useCallback(async () => {
    if (!FACEBOOK_APP_ID) {
      throw new Error('Lipsește REACT_APP_FACEBOOK_APP_ID în frontend/.env');
    }
    return await loadFacebookSDK(FACEBOOK_APP_ID);
  }, []);

  const loginWithFacebookToken = useCallback(async (accessToken, userID = null) => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/facebook`, {
        accessToken,
        userID
      });

      if (res.data.success) {
        const { token, user: userData } = res.data;
        localStorage.setItem('token', token);
        setAuthHeader(token);
        setUser(userData);
        return { success: true, user: userData };
      }

      return {
        success: false,
        message: 'Autentificarea cu Facebook a eșuat.'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Eroare la autentificarea cu Facebook.'
      };
    }
  }, [setAuthHeader]);

    const loginWithFacebook = useCallback(async () => {
    try {
      const FB = await ensureFacebookSDK();

      return await new Promise((resolve) => {
        FB.login(
          function (response) {
            (async () => {
              if (!response || !response.authResponse) {
                resolve({
                  success: false,
                  message: 'Autentificarea cu Facebook a fost anulată.'
                });
                return;
              }

              const result = await loginWithFacebookToken(
                response.authResponse.accessToken,
                response.authResponse.userID
              );

              resolve(result);
            })().catch((error) => {
              resolve({
                success: false,
                message: error.message || 'Eroare la autentificarea cu Facebook.'
              });
            });
          },
          {
            scope: 'public_profile',
            return_scopes: true
          }
        );
      });
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Nu am putut porni Facebook Login.'
      };
    }
  }, [ensureFacebookSDK, loginWithFacebookToken]);

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.rol === 'admin',
        isUser: user?.rol === 'user' || user?.rol === 'admin',
        login,
        register,
        logout,
        updateUser,
        ensureFacebookSDK,
        loginWithFacebook,
        loginWithFacebookToken
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth trebuie folosit în interiorul AuthProvider');
  }
  return context;
};

export default AuthContext;
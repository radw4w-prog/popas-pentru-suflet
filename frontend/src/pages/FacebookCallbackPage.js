import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FacebookCallbackPage = () => {
  const navigate = useNavigate();
  const { ensureFacebookSDK, loginWithFacebookToken } = useAuth();
  const [message, setMessage] = useState('Se procesează autentificarea cu Facebook...');

  useEffect(() => {
    let isMounted = true;

    const run = async () => {
      try {
        if (isMounted) setMessage('Se încarcă Facebook SDK...');

        await ensureFacebookSDK();

        if (isMounted) setMessage('Se verifică sesiunea Facebook...');

        window.FB.getLoginStatus(function(response) {
          (async () => {
            if (!isMounted) return;

            if (!response || response.status !== 'connected') {
              setMessage('Autentificarea cu Facebook a eșuat.');
              setTimeout(() => navigate('/login', { replace: true }), 1500);
              return;
            }

            if (isMounted) setMessage('Se autentifică în aplicație...');

            const result = await loginWithFacebookToken(
              response.authResponse.accessToken,
              response.authResponse.userID
            );

            if (!isMounted) return;

            if (result.success) {
              setMessage('Autentificare reușită! Redirecționare...');
              setTimeout(() => navigate('/dashboard', { replace: true }), 700);
            } else {
              setMessage(result.message || 'Autentificarea a eșuat.');
              setTimeout(() => navigate('/login', { replace: true }), 1500);
            }
          })().catch(function(err) {
            if (!isMounted) return;
            setMessage(err.message || 'Eroare la autentificarea cu Facebook.');
            setTimeout(() => navigate('/login', { replace: true }), 1500);
          });
        });

      } catch (err) {
        if (!isMounted) return;
        setMessage(err.message || 'Eroare la încărcarea Facebook SDK.');
        setTimeout(() => navigate('/login', { replace: true }), 1500);
      }
    };

    run();

    return () => {
      isMounted = false;
    };
  }, [ensureFacebookSDK, loginWithFacebookToken, navigate]);

  return (
    <div className="auth-page">
      <div className="auth-container" style={{ textAlign: 'center' }}>
        <div className="auth-logo" style={{ fontSize: '3rem', marginBottom: '1rem' }}>
          📘
        </div>
        <h1 className="auth-title">Facebook Login</h1>
        <p className="auth-subtitle" style={{ marginTop: '1rem' }}>
          {message}
        </p>
        <div style={{
          marginTop: '1.5rem',
          width: 40, height: 40,
          border: '3px solid rgba(99,102,241,0.2)',
          borderTop: '3px solid #6366f1',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '1.5rem auto 0'
        }} />
      </div>
    </div>
  );
};

export default FacebookCallbackPage;
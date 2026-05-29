'use client';
import Link from 'next/link';
import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', parola: '' });
  const [eroare, setEroare] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingFacebook, setLoadingFacebook] = useState(false);

  const { login, loginWithFacebook } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const from = '/dashboard';

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setEroare('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setEroare('');

    const result = await login(formData.email, formData.parola);

    if (result.success) {
      router.push(from);
    } else {
      setEroare(result.message);
    }

    setLoading(false);
  };

  const handleFacebookLogin = async () => {
    setLoadingFacebook(true);
    setEroare('');

    const result = await loginWithFacebook();

    if (result.success) {
      router.push('/dashboard', { replace: true });
    } else {
      setEroare(result.message);
    }

    setLoadingFacebook(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-logo">🕊️</div>
          <h1 className="auth-title">Popas pentru Suflet</h1>
          <p className="auth-subtitle">Autentifică-te în contul tău</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {eroare && (
            <div className="auth-error">
              ⚠️ {eroare}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="exemplu@email.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="parola">Parolă</label>
            <input
              type="password"
              id="parola"
              name="parola"
              value={formData.parola}
              onChange={handleChange}
              placeholder="Parola ta"
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="auth-btn-primary"
            disabled={loading}
          >
            {loading ? '⏳ Se autentifică...' : '🔑 Autentifică-te'}
          </button>
        </form>

        <div className="auth-divider">
          <span>sau</span>
        </div>

        <button
          type="button"
          className="auth-btn-facebook"
          onClick={handleFacebookLogin}
          disabled={loadingFacebook}
        >
          {loadingFacebook ? '⏳ Se deschide Facebook...' : '📘 Continuă cu Facebook'}
        </button>

        <div className="auth-divider">
          <span>sau</span>
        </div>

        <button
          className="auth-btn-guest"
          onClick={() => router.push('/dashboard')}
        >
          👤 Continuă fără cont
          <span className="guest-limit">(max 3 generări/zi)</span>
        </button>

        <div className="auth-footer">
          <p>
            Nu ai cont?{' '}
            <Link href="/register" className="auth-link">
              Înregistrează-te gratuit
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
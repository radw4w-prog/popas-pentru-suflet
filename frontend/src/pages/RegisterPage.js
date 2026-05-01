import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    nume: '',
    email: '',
    parola: '',
    confirmaParola: ''
  });
  const [eroare, setEroare] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingFacebook, setLoadingFacebook] = useState(false);

  const { register, loginWithFacebook } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setEroare('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEroare('');

    if (formData.parola !== formData.confirmaParola) {
      setEroare('Parolele nu coincid.');
      return;
    }

    if (formData.parola.length < 6) {
      setEroare('Parola trebuie să aibă minim 6 caractere.');
      return;
    }

    setLoading(true);

    const result = await register(
      formData.nume,
      formData.email,
      formData.parola
    );

    if (result.success) {
      navigate('/dashboard', { replace: true });
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
      navigate('/dashboard', { replace: true });
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
          <p className="auth-subtitle">Creează un cont gratuit</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {eroare && (
            <div className="auth-error">
              ⚠️ {eroare}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="nume">Nume</label>
            <input
              type="text"
              id="nume"
              name="nume"
              value={formData.nume}
              onChange={handleChange}
              placeholder="Numele tău"
              required
              minLength={2}
            />
          </div>

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
              placeholder="Minim 6 caractere"
              required
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmaParola">Confirmă Parola</label>
            <input
              type="password"
              id="confirmaParola"
              name="confirmaParola"
              value={formData.confirmaParola}
              onChange={handleChange}
              placeholder="Repetă parola"
              required
            />
          </div>

          <button
            type="submit"
            className="auth-btn-primary"
            disabled={loading}
          >
            {loading ? '⏳ Se creează contul...' : '✅ Creează cont'}
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
          {loadingFacebook ? '⏳ Se deschide Facebook...' : '📘 Înregistrează-te cu Facebook'}
        </button>

        <div className="auth-divider">
          <span>sau</span>
        </div>

        <button
          className="auth-btn-guest"
          onClick={() => navigate('/dashboard')}
        >
          👤 Continuă fără cont
          <span className="guest-limit">(max 3 generări/zi)</span>
        </button>

        <div className="auth-footer">
          <p>
            Ai deja cont?{' '}
            <Link to="/login" className="auth-link">
              Autentifică-te
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
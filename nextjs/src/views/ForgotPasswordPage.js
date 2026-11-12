'use client';
import React, { useState } from 'react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://popas-pentru-suflet-backend.onrender.com';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSent(true);
      } else {
        setError(data.message || 'A apărut o eroare. Încearcă din nou.');
      }
    } catch {
      setError('Nu s-a putut conecta la server. Încearcă din nou.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="auth-card">
        <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📧</div>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.75rem', fontFamily: 'var(--font-playfair), serif' }}>Verifică-ți emailul</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            Dacă există un cont cu adresa <strong>{email}</strong>, vei primi un email cu
            instrucțiuni pentru resetarea parolei. Link-ul este valabil 1 oră.
          </p>
          <p style={{ marginTop: '1.5rem' }}>
            <Link href="/login" className="auth-link">← Înapoi la autentificare</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-card">
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔑</div>
        <h2 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-playfair), serif' }}>Am uitat parola</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Introdu adresa de email și îți trimitem un link de resetare
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="auth-field">
          <label>Adresă de email</label>
          <input
            type="email"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="exemplu@email.com"
            required
          />
        </div>

        {error && <div className="auth-error">{error}</div>}

        <button type="submit" className="auth-btn" disabled={loading}>
          {loading ? 'Se trimite...' : 'Trimite link de resetare'}
        </button>
      </form>

      <div className="auth-footer">
        <p>
          Îți amintești parola? <Link href="/login" className="auth-link">Autentifică-te</Link>
        </p>
      </div>
    </div>
  );
}

'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://popas-pentru-suflet-backend.onrender.com';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [parolaNoua, setParolaNoua] = useState('');
  const [confirmare, setConfirmare] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Link invalid. Te rugăm să ceri un nou link de resetare.');
      return;
    }
    if (parolaNoua.length < 6) {
      setError('Parola trebuie să aibă minim 6 caractere.');
      return;
    }
    if (parolaNoua !== confirmare) {
      setError('Parolele nu coincid.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, parolaNoua }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
        setTimeout(() => router.push('/login'), 2500);
      } else {
        setError(data.message || 'A apărut o eroare. Încearcă din nou.');
      }
    } catch {
      setError('Nu s-a putut conecta la server. Încearcă din nou.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-card">
        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Parolă resetată!</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Te redirecționăm la autentificare...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-card">
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔑</div>
        <h2 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-playfair), serif' }}>Parolă nouă</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Alege o parolă nouă pentru contul tău</p>
      </div>

      {!token && (
        <div className="auth-error">Link invalid. <Link href="/login" className="auth-link">Cere un nou link</Link></div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="auth-field">
          <label>Parolă nouă</label>
          <input
            type="password"
            className="form-input"
            value={parolaNoua}
            onChange={(e) => setParolaNoua(e.target.value)}
            placeholder="Minim 6 caractere"
            required
          />
        </div>
        <div className="auth-field">
          <label>Confirmă parola</label>
          <input
            type="password"
            className="form-input"
            value={confirmare}
            onChange={(e) => setConfirmare(e.target.value)}
            placeholder="Repetă parola"
            required
          />
        </div>

        {error && <div className="auth-error">{error}</div>}

        <button type="submit" className="auth-btn" disabled={loading}>
          {loading ? 'Se salvează...' : 'Resetează parola'}
        </button>
      </form>

      <div className="auth-footer">
        <p>
          Înapoi la <Link href="/login" className="auth-link">Autentificare</Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="auth-card"><p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Se încarcă...</p></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}

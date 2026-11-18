'use client';
import {useEffect, useRef, useState} from 'react';
import Script from 'next/script';
import {useRouter} from 'next/navigation';
import {useAuth} from '../context/AuthContext';

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
export default function GoogleLoginButton() {
  const {loginWithGoogle} = useAuth();
  const router = useRouter();
  const target = useRef(null);
  const inFlight = useRef(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!ready || !CLIENT_ID || !target.current || !window.google?.accounts?.id) return;
    let disposed = false;
    window.google.accounts.id.initialize({client_id: CLIENT_ID, auto_select: false,
      callback: async response => {
        if (disposed || inFlight.current) return;
        inFlight.current = true;
        setBusy(true); setError('');
        try {
          const result = await loginWithGoogle(response.credential);
          if (disposed) return;
          if (result.success) router.replace('/dashboard');
          else setError(result.message);
        } catch (_) {
          if (!disposed) setError('Nu am putut finaliza conectarea cu Google. Reîncearcă.');
        } finally {
          inFlight.current = false;
          if (!disposed) setBusy(false);
        }
      },
    });
    window.google.accounts.id.renderButton(target.current, {type: 'standard', theme: 'outline', size: 'large', text: 'continue_with', locale: 'ro', width: Math.min(320, target.current.clientWidth || 280)});
    const element = target.current;
    return () => {disposed = true; element.replaceChildren();};
  }, [ready, loginWithGoogle, router]);
  // Enable via Vercel env only after the backend has been deployed.
  if (!CLIENT_ID) return null;
  return <section aria-label="Conectare cu Google" style={{margin: '1rem 0', textAlign: 'center'}}>
    <Script id="google-identity-services" src="https://accounts.google.com/gsi/client" strategy="afterInteractive"
      onReady={() => setReady(true)} onError={() => setError('Butonul Google nu s-a încărcat. Verifică conexiunea sau blocarea scripturilor; poți folosi email și parolă.')} />
    <div aria-busy={busy} style={{pointerEvents: busy ? 'none' : 'auto', opacity: busy ? .65 : 1}}>
      <div ref={target} style={{display: 'flex', justifyContent: 'center', minHeight: 44}} />
    </div>
    <p role="status" aria-live="polite" style={{color: 'var(--text-primary)', fontSize: '.9rem', marginTop: '.5rem'}}>
      {error || (busy ? 'Se verifică autentificarea…' : !ready ? 'Se încarcă Google…' : '')}
    </p>
    <p style={{color: 'var(--text-secondary)', fontSize: '.8rem'}}>Continuând, accepți <a href="/termeni">termenii</a> și confirmi că ai citit <a href="/confidentialitate">politica de confidențialitate</a>.</p>
  </section>;
}

'use client';
import React from 'react';
import { useSearchParams } from 'next/navigation';
import BibleNavigator from '../components/BibleNavigator';

const VersesPage = () => {
  const searchParams = useSearchParams();
  const initialCarteName = searchParams.get('carte') || '';
  const initialCapitol = searchParams.get('capitol') || '';

  return (
    <div className="animate-in" style={{ maxWidth: 900, margin: '0 auto' }}>
      <BibleNavigator initialCarteName={initialCarteName} initialCapitol={initialCapitol} />
    </div>
  );
};

export default VersesPage;
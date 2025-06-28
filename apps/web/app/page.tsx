'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin-slow text-blue-600 text-4xl mb-4">⚙️</div>
        <p className="text-gray-500">Loading ERP System...</p>
      </div>
    </div>
  );
}
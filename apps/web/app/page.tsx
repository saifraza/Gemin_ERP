'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('auth_token');
    
    if (token) {
      // User is logged in, go to dashboard
      router.push('/dashboard');
    } else {
      // No user logged in, go to login
      router.push('/auth/login');
    }
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
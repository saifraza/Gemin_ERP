'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ForceLogoutPage() {
  const router = useRouter();

  useEffect(() => {
    // Force clear EVERYTHING
    console.log('Force logout: Clearing all auth data...');
    
    // Clear localStorage
    localStorage.clear();
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Clear all cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    // Clear IndexedDB if exists
    if ('indexedDB' in window) {
      indexedDB.databases().then(databases => {
        databases.forEach(db => {
          if (db.name) {
            indexedDB.deleteDatabase(db.name);
          }
        });
      });
    }
    
    // Wait a bit then redirect
    setTimeout(() => {
      window.location.href = '/auth/login';
    }, 1000);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center text-white">
        <h1 className="text-3xl font-bold mb-4">Force Logout</h1>
        <p className="text-xl mb-2">Clearing all authentication data...</p>
        <p className="text-gray-400">You will be redirected to login shortly.</p>
        <div className="mt-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
        </div>
      </div>
    </div>
  );
}
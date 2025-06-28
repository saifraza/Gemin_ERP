import { NextResponse } from 'next/server';

export async function GET() {
  // Get auth data from localStorage (client-side)
  return NextResponse.json({
    message: 'Check browser console and localStorage for auth data',
    localStorage: {
      auth_token: 'Check if exists',
      'auth-storage': 'Check Zustand persisted state'
    },
    debug: {
      checkConsole: 'Open browser console to see Factory Selector debug logs',
      checkLocalStorage: 'In browser console, run: localStorage.getItem("auth-storage")'
    }
  });
}
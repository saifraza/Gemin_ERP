import { useState, useEffect } from 'react';

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

const toastQueue: Toast[] = [];
let listeners: Array<(toasts: Toast[]) => void> = [];

function notifyListeners() {
  listeners.forEach((listener) => listener([...toastQueue]));
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const listener = (newToasts: Toast[]) => setToasts(newToasts);
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  const toast = ({ title, description, variant = 'default' }: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(7);
    const newToast = { id, title, description, variant };
    
    toastQueue.push(newToast);
    notifyListeners();

    // Auto remove after 5 seconds
    setTimeout(() => {
      const index = toastQueue.findIndex((t) => t.id === id);
      if (index !== -1) {
        toastQueue.splice(index, 1);
        notifyListeners();
      }
    }, 5000);
  };

  return { toast, toasts };
}
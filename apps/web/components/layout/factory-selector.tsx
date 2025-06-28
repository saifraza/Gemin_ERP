'use client';

import { useAuthStore } from '@/stores/auth';
import { ChevronDown, Building2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export function FactorySelector() {
  const { user, currentFactory, allowedFactories, switchFactory, canAccessAllFactories } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debug logging (commented out for production)
  // console.log('Factory Selector Debug:', {
  //   user,
  //   currentFactory,
  //   allowedFactories,
  //   canAccessAll: canAccessAllFactories()
  // });

  if (!user) {
    return <div className="text-xs text-gray-400">Loading user...</div>;
  }

  if (!allowedFactories || allowedFactories.length === 0) {
    return <div className="text-xs text-gray-400">No factory access</div>;
  }

  const currentFactoryName = currentFactory === 'all' 
    ? 'All Factories' 
    : allowedFactories.find(f => f.id === currentFactory)?.name || 'Select Factory';

  const showSelector = canAccessAllFactories() || allowedFactories.length > 1;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => showSelector && setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 text-sm bg-slate-800 rounded ${
          showSelector ? 'hover:bg-slate-700 cursor-pointer' : 'cursor-default'
        }`}
      >
        <Building2 className="w-4 h-4" />
        <span>{currentFactoryName}</span>
        {showSelector && <ChevronDown className="w-3 h-3" />}
      </button>

      {isOpen && showSelector && (
        <div className="absolute right-0 mt-1 w-64 bg-slate-800 border border-slate-700 rounded shadow-lg z-50">
          {canAccessAllFactories() && (
            <button
              onClick={() => {
                switchFactory('all');
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-700 ${
                currentFactory === 'all' ? 'bg-slate-700' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <div>
                  <div className="font-medium">All Factories</div>
                  <div className="text-xs text-gray-400">View consolidated data</div>
                </div>
              </div>
            </button>
          )}
          
          {canAccessAllFactories() && allowedFactories.length > 0 && (
            <div className="border-t border-slate-700 my-1" />
          )}
          
          {allowedFactories.map((factory) => (
            <button
              key={factory.id}
              onClick={() => {
                switchFactory(factory.id);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-700 ${
                currentFactory === factory.id ? 'bg-slate-700' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <div>
                  <div className="font-medium">{factory.name}</div>
                  <div className="text-xs text-gray-400">Code: {factory.code}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface ShortcutGroup {
  title: string;
  shortcuts: Array<{
    keys: string;
    description: string;
  }>;
}

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcuts({ isOpen, onClose }: KeyboardShortcutsProps) {
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
  }, []);

  const shortcutGroups: ShortcutGroup[] = [
    {
      title: 'Navigation',
      shortcuts: [
        { keys: isMac ? '⌥ D' : 'Alt+D', description: 'Dashboard' },
        { keys: isMac ? '⌥ T' : 'Alt+T', description: 'Transactions' },
        { keys: isMac ? '⌥ R' : 'Alt+R', description: 'Reports' },
        { keys: isMac ? '⌥ H' : 'Alt+H', description: 'Help/Shortcuts' },
        { keys: 'Tab', description: 'Next field' },
        { keys: isMac ? '⇧ Tab' : 'Shift+Tab', description: 'Previous field' },
      ]
    },
    {
      title: 'Quick Actions',
      shortcuts: [
        { keys: isMac ? '⌘ K' : 'Ctrl+K', description: 'Command Palette' },
        { keys: isMac ? '⌥ N' : 'Alt+N', description: 'New Transaction' },
        { keys: isMac ? '⌥ S' : 'Alt+S', description: 'Save' },
        { keys: isMac ? '⌥ F' : 'Alt+F', description: 'Search/Find' },
        { keys: isMac ? '⌥ A' : 'Alt+A', description: 'AI Assistant' },
        { keys: isMac ? '⌘ ⇧ R' : 'Ctrl+Shift+R', description: 'Refresh' },
      ]
    },
    {
      title: 'Table Navigation',
      shortcuts: [
        { keys: '↑↓', description: 'Navigate rows' },
        { keys: '←→', description: 'Navigate columns' },
        { keys: '↩', description: 'Open item' },
        { keys: 'Space', description: 'Select item' },
        { keys: isMac ? '⌘ ⇧ A' : 'Ctrl+Shift+A', description: 'Select all' },
      ]
    },
    {
      title: 'Power User',
      shortcuts: [
        { keys: isMac ? '⌘ ⇧ P' : 'Ctrl+Shift+P', description: 'Command palette' },
        { keys: isMac ? '⌘ \\' : 'Ctrl+B', description: 'Toggle sidebar' },
        { keys: '⎋', description: 'Close dialog' },
        { keys: isMac ? '⌥ /' : 'Ctrl+/', description: 'Quick search' },
        { keys: 'F1', description: 'Context help' },
      ]
    }
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
      if ((e.key === 'h' || e.key === 'H') && e.altKey) {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-[2000]" 
        onClick={onClose}
      />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded-lg shadow-2xl z-[2000] max-h-[80vh] overflow-y-auto w-[800px]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-semibold flex items-center gap-2">
            <span>⌨️</span>
            <span>Keyboard Shortcuts ({isMac ? 'Mac' : 'Windows'})</span>
          </h3>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          {shortcutGroups.map((group) => (
            <div key={group.title}>
              <h4 className="text-blue-700 font-medium mb-3">{group.title}</h4>
              {group.shortcuts.map((shortcut) => (
                <div key={shortcut.keys} className="flex items-center justify-between mb-2">
                  <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono">
                    {shortcut.keys}
                  </kbd>
                  <span className="text-sm text-gray-600">{shortcut.description}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 rounded text-sm">
          <strong>Tips:</strong> Press <kbd>{isMac ? '⌘K' : 'Ctrl+K'}</kbd> for Command Palette • 
          <kbd>F1</kbd> or <kbd>{isMac ? '⌥H' : 'Alt+H'}</kbd> to show this help
        </div>
        
        <button 
          onClick={onClose}
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Close (Esc)
        </button>
      </div>
    </>
  );
}
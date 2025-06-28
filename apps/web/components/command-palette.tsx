'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, FileText, Users, BarChart3, Package, DollarSign, 
  TrendingUp, Bot, RefreshCw, Settings, Moon, Keyboard 
} from 'lucide-react';

interface Command {
  id: string;
  name: string;
  icon: React.ReactNode;
  action: () => void;
  category: string;
  shortcut?: string;
}

interface CommandPaletteProps {
  onCommand?: (commandId: string) => void;
}

export function CommandPalette({ onCommand }: CommandPaletteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  const commands: Command[] = [
    {
      id: 'new-transaction',
      name: 'New Transaction',
      icon: <Plus className="w-5 h-5" />,
      action: () => {
        onCommand?.('new-transaction');
        setIsOpen(false);
      },
      category: 'Quick Actions',
      shortcut: '⌘1'
    },
    {
      id: 'create-order',
      name: 'Create Order',
      icon: <FileText className="w-5 h-5" />,
      action: () => {
        onCommand?.('create-order');
        setIsOpen(false);
      },
      category: 'Quick Actions',
      shortcut: '⌘2'
    },
    {
      id: 'new-customer',
      name: 'New Customer',
      icon: <Users className="w-5 h-5" />,
      action: () => {
        onCommand?.('new-customer');
        setIsOpen(false);
      },
      category: 'Quick Actions',
      shortcut: '⌘3'
    },
    {
      id: 'generate-report',
      name: 'Generate Report',
      icon: <BarChart3 className="w-5 h-5" />,
      action: () => {
        onCommand?.('generate-report');
        setIsOpen(false);
      },
      category: 'Analytics',
      shortcut: '⌘4'
    },
    {
      id: 'export-data',
      name: 'Export Data',
      icon: <DollarSign className="w-5 h-5" />,
      action: () => {
        onCommand?.('export');
        setIsOpen(false);
      },
      category: 'Data',
      shortcut: '⌘5'
    },
    {
      id: 'import-data',
      name: 'Import Data',
      icon: <Package className="w-5 h-5" />,
      action: () => {
        onCommand?.('import');
        setIsOpen(false);
      },
      category: 'Data'
    },
    {
      id: 'view-analytics',
      name: 'View Analytics',
      icon: <TrendingUp className="w-5 h-5" />,
      action: () => {
        router.push('/analytics');
        setIsOpen(false);
      },
      category: 'Analytics'
    },
    {
      id: 'ai-assistant',
      name: 'Open AI Assistant',
      icon: <Bot className="w-5 h-5" />,
      action: () => {
        onCommand?.('ai-assistant');
        setIsOpen(false);
      },
      category: 'Tools'
    },
    {
      id: 'refresh-data',
      name: 'Refresh Data',
      icon: <RefreshCw className="w-5 h-5" />,
      action: () => {
        onCommand?.('refresh');
        setIsOpen(false);
      },
      category: 'System'
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: <Settings className="w-5 h-5" />,
      action: () => {
        router.push('/settings');
        setIsOpen(false);
      },
      category: 'System'
    },
    {
      id: 'dark-mode',
      name: 'Toggle Dark Mode',
      icon: <Moon className="w-5 h-5" />,
      action: () => {
        onCommand?.('dark-mode');
        setIsOpen(false);
      },
      category: 'Appearance'
    },
    {
      id: 'shortcuts',
      name: 'Show Keyboard Shortcuts',
      icon: <Keyboard className="w-5 h-5" />,
      action: () => {
        onCommand?.('shortcuts');
        setIsOpen(false);
      },
      category: 'Help'
    }
  ];

  const filteredCommands = commands.filter(cmd => 
    cmd.name.toLowerCase().includes(search.toLowerCase()) ||
    cmd.category.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen(!isOpen);
        setSearch('');
        setSelectedIndex(0);
      }
      
      if (isOpen) {
        if (e.key === 'Escape') {
          setIsOpen(false);
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          );
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          );
        } else if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
          e.preventDefault();
          filteredCommands[selectedIndex].action();
        } else if (e.key >= '1' && e.key <= '9' && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          const index = parseInt(e.key) - 1;
          if (filteredCommands[index]) {
            filteredCommands[index].action();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex]);

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-50" 
        onClick={() => setIsOpen(false)}
      />
      <div className="command-palette">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setSelectedIndex(0);
          }}
          placeholder="Type a command..."
          className="command-input"
          autoFocus
        />
        
        <div className="max-h-[400px] overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              No commands found
            </div>
          ) : (
            filteredCommands.map((cmd, index) => (
              <div
                key={cmd.id}
                className={`command-item ${index === selectedIndex ? 'bg-gray-50' : ''}`}
                onClick={cmd.action}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <span className="text-xl">{cmd.icon}</span>
                <span className="flex-1">{cmd.name}</span>
                {cmd.shortcut && index < 9 && (
                  <span className="text-gray-400 text-xs">{cmd.shortcut}</span>
                )}
              </div>
            ))
          )}
        </div>
        
        <div className="px-4 py-2 border-t text-xs text-gray-500 text-center">
          Press ↑↓ to navigate, Enter to select, Esc to close
        </div>
      </div>
    </>
  );
}
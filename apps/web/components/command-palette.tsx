'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';

interface Command {
  id: string;
  name: string;
  description: string;
  action: () => void;
  category: string;
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  const commands: Command[] = [
    {
      id: 'dashboard',
      name: 'Go to Dashboard',
      description: 'Navigate to main dashboard',
      action: () => router.push('/dashboard'),
      category: 'Navigation'
    },
    {
      id: 'sugar-div',
      name: 'Sugar Division',
      description: 'View sugar production metrics',
      action: () => router.push('/divisions/sugar'),
      category: 'Divisions'
    },
    {
      id: 'ethanol-div',
      name: 'Ethanol Division',
      description: 'View ethanol production metrics',
      action: () => router.push('/divisions/ethanol'),
      category: 'Divisions'
    },
    {
      id: 'power-div',
      name: 'Power Division',
      description: 'View power generation metrics',
      action: () => router.push('/divisions/power'),
      category: 'Divisions'
    },
    {
      id: 'inventory',
      name: 'Inventory Management',
      description: 'Manage inventory and stock levels',
      action: () => router.push('/inventory'),
      category: 'Operations'
    },
    {
      id: 'reports',
      name: 'Generate Reports',
      description: 'Create production and financial reports',
      action: () => router.push('/reports'),
      category: 'Analytics'
    }
  ];

  const filteredCommands = commands.filter(cmd => 
    cmd.name.toLowerCase().includes(search.toLowerCase()) ||
    cmd.description.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
      
      if (isOpen) {
        if (e.key === 'Escape') {
          setIsOpen(false);
        } else if (e.key === 'ArrowDown') {
          setSelectedIndex(prev => 
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          );
        } else if (e.key === 'ArrowUp') {
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          );
        } else if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          setIsOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/50">
      <Card className="w-full max-w-2xl p-0 overflow-hidden">
        <div className="p-4 border-b">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type a command or search..."
            className="w-full outline-none bg-transparent text-lg"
            autoFocus
          />
        </div>
        
        <div className="max-h-[400px] overflow-y-auto">
          {filteredCommands.map((cmd, index) => (
            <div
              key={cmd.id}
              className={`px-4 py-3 cursor-pointer transition-colors ${
                index === selectedIndex ? 'bg-muted' : 'hover:bg-muted/50'
              }`}
              onClick={() => {
                cmd.action();
                setIsOpen(false);
              }}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="font-medium">{cmd.name}</div>
              <div className="text-sm text-muted-foreground">{cmd.description}</div>
              <div className="text-xs text-muted-foreground mt-1">{cmd.category}</div>
            </div>
          ))}
        </div>
        
        <div className="p-2 border-t text-xs text-muted-foreground text-center">
          Press ↑↓ to navigate, Enter to select, Esc to close
        </div>
      </Card>
    </div>
  );
}
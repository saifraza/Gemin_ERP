'use client';

import { Home, BarChart3, Plus, Bot, RefreshCw, Download, Settings, Search } from 'lucide-react';

interface ToolbarProps {
  onNewTransaction?: () => void;
  onAIAssistant?: () => void;
  onRefresh?: () => void;
  onExport?: () => void;
  onSearch?: (query: string) => void;
}

export function Toolbar({
  onNewTransaction,
  onAIAssistant,
  onRefresh,
  onExport,
  onSearch
}: ToolbarProps) {
  return (
    <div className="toolbar">
      <div className="flex items-center gap-2">
        <button className="btn">
          <Home className="w-4 h-4" />
          <span>Home</span>
        </button>
        <button className="btn">
          <BarChart3 className="w-4 h-4" />
          <span>My Dashboard</span>
        </button>
        <button className="btn btn-primary" onClick={onNewTransaction}>
          <Plus className="w-4 h-4" />
          <span>New Transaction</span>
        </button>
        <button className="btn btn-success" onClick={onAIAssistant}>
          <Bot className="w-4 h-4" />
          <span>AI Assistant</span>
        </button>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="search-input">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search transactions, reports, customers..."
            onChange={(e) => onSearch?.(e.target.value)}
          />
        </div>
        <button 
          className="btn" 
          onClick={onRefresh}
          title="Refresh (⌘⇧R)"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
        <button 
          className="btn" 
          onClick={onExport}
          title="Export (⌥E)"
        >
          <Download className="w-4 h-4" />
          <span>Export</span>
        </button>
        <button className="btn">
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { X, AlertTriangle, TrendingUp, RotateCw, DollarSign } from 'lucide-react';
import { useMCP } from '@/hooks/use-mcp';

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Suggestion {
  id: string;
  icon: React.ReactNode;
  message: string;
  type: 'warning' | 'insight' | 'action' | 'alert';
}

export function AIAssistant({ isOpen, onClose }: AIAssistantProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const { askAI, loading } = useMCP();

  const suggestions: Suggestion[] = [
    {
      id: '1',
      icon: <AlertTriangle className="w-5 h-5" />,
      message: 'Components inventory approaching minimum level. Create purchase order?',
      type: 'warning'
    },
    {
      id: '2',
      icon: <TrendingUp className="w-5 h-5" />,
      message: 'Sales efficiency up 12.5%. Analyze contributing factors?',
      type: 'insight'
    },
    {
      id: '3',
      icon: <RotateCw className="w-5 h-5" />,
      message: 'Optimize resource allocation for 15% efficiency gain',
      type: 'action'
    },
    {
      id: '4',
      icon: <DollarSign className="w-5 h-5" />,
      message: '$287K in outstanding invoices. Review aging report?',
      type: 'alert'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const response = await askAI(input);
      setMessages(prev => [...prev, { role: 'assistant', content: response.message }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I apologize, but I encountered an error. Please try again.' 
      }]);
    }
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setInput(suggestion.message);
  };

  return (
    <div className={`ai-panel ${isOpen ? 'open' : ''}`}>
      <div className="ai-panel-header">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <span>🤖</span>
          <span>MCP AI Assistant</span>
        </h3>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-white/10 rounded transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="ai-panel-body">
        {messages.length === 0 ? (
          <>
            <div className="mb-6">
              <h4 className="font-medium mb-3">Suggested Actions</h4>
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="ai-suggestion"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <div className="flex items-start gap-3">
                    <span className={`
                      ${suggestion.type === 'warning' ? 'text-yellow-600' : ''}
                      ${suggestion.type === 'insight' ? 'text-blue-600' : ''}
                      ${suggestion.type === 'action' ? 'text-green-600' : ''}
                      ${suggestion.type === 'alert' ? 'text-red-600' : ''}
                    `}>
                      {suggestion.icon}
                    </span>
                    <span className="text-sm">{suggestion.message}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Recent Insights</h4>
              <div className="bg-gray-50 p-4 rounded text-sm leading-relaxed">
                <p className="mb-3">
                  <strong>Performance Analysis:</strong> Sales department showing 94.2% efficiency, 
                  highest among all departments. Key factors: improved lead conversion and faster 
                  order processing.
                </p>
                <p>
                  <strong>Predictive Alert:</strong> Based on current trends, expect 18% increase 
                  in order volume next quarter. Recommend increasing workforce capacity by 10%.
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-lg text-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-lg text-sm">
                  <span className="inline-block animate-pulse">Thinking...</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-50 border-t">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about transactions, performance, inventory..."
            className="w-full px-3 py-2 border rounded text-sm outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </form>
      </div>
    </div>
  );
}
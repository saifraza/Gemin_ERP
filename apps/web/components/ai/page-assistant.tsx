'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, Minimize2, Maximize2 } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface PageContext {
  module: string;
  page: string;
  data?: any;
  metadata?: {
    totalRecords?: number;
    activeFilters?: any;
    currentTab?: string;
  };
}

interface PageAssistantProps {
  pageContext?: PageContext;
  // Allow custom page data to be passed
  customData?: any;
}

export function PageAssistant({ pageContext, customData }: PageAssistantProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Detect current page context
  const detectPageContext = (): PageContext => {
    // Master Data context
    if (pathname.includes('/master-data')) {
      // Check if we're on the client side
      let tab = 'companies';
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        tab = urlParams.get('tab') || 'companies';
      }
      
      return {
        module: 'Master Data',
        page: tab.charAt(0).toUpperCase() + tab.slice(1),
        metadata: {
          currentTab: tab,
          // This would be populated with actual data from the page
          totalRecords: customData?.totalRecords || 0,
        }
      };
    }
    
    // Finance module context
    if (pathname.includes('/finance')) {
      return {
        module: 'Financial Management',
        page: pathname.split('/').pop() || 'Dashboard',
      };
    }
    
    // Add more module contexts as needed
    return {
      module: 'General',
      page: 'Dashboard',
    };
  };

  const currentContext = pageContext || detectPageContext();

  // Initial greeting based on context
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: '1',
        role: 'assistant',
        content: `Hello! I am your ${currentContext.module} assistant. I can help you with questions about ${currentContext.page}. What would you like to know?`,
        timestamp: new Date()
      }]);
    }
  }, [isOpen, currentContext]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Send only page-specific context to optimize tokens
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          message: input,
          context: {
            ...currentContext,
            // Include any custom data passed from the page
            customData,
            // Limit the context to current page only
            pageOnly: true,
          }
        })
      });

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I am having trouble connecting. Please try again later.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-all hover:scale-110 z-50"
          title={`Get help with ${currentContext.module}`}
        >
          <Sparkles className="w-6 h-6" />
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div 
          className={`fixed bottom-6 right-6 bg-white rounded-lg shadow-xl border border-gray-200 z-50 transition-all ${
            isMinimized ? 'w-80 h-14' : 'w-96 h-[500px]'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <div>
                <h3 className="font-semibold">AI Assistant</h3>
                {!isMinimized && (
                  <p className="text-xs opacity-90">{currentContext.module} - {currentContext.page}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="hover:bg-white/20 p-1 rounded transition-colors"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 p-1 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 h-[340px]">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}
                  >
                    <div
                      className={`inline-block p-3 rounded-lg max-w-[80%] ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="text-left">
                    <div className="inline-block p-3 rounded-lg bg-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="p-4 border-t">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={`Ask about ${currentContext.page}...`}
                    className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
                
                {/* Context indicator */}
                <div className="mt-2 text-xs text-gray-500 text-center">
                  Context limited to current page for optimal performance
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
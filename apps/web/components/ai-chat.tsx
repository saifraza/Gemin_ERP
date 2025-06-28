'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  model?: string;
  timestamp: Date;
  tokenUsage?: {
    prompt: number;
    completion: number;
    total: number;
    cost: number;
  };
  toolsUsed?: Array<{
    name: string;
    input: any;
  }>;
}

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('auto');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, companyName, currentFactory } = useAuthStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api-gateway-production-00e9.up.railway.app';
      const response = await fetch(`${apiUrl}/api/mcp/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: input,
          model: selectedModel,
          context: {
            conversationHistory: messages.slice(-5), // Last 5 messages for context
            user: {
              name: user?.name,
              role: user?.role,
              username: user?.username,
            },
            company: companyName,
            currentFactory: currentFactory,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        model: data.model,
        timestamp: new Date(),
        tokenUsage: data.tokenUsage,
        toolsUsed: data.toolsUsed,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-gray-900 rounded-lg border border-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Assistant
          </h3>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="bg-gray-800 text-white text-sm rounded px-3 py-1 border border-gray-700"
          >
            <option value="auto">Auto Select</option>
            <option value="gemini">Gemini Pro</option>
            <option value="claude">Claude Opus</option>
            <option value="gpt4">GPT-4</option>
          </select>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Start a conversation with your AI assistant</p>
            <p className="text-sm mt-2">Ask about factory status, production data, or any ERP-related queries</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-3",
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            <div
              className={cn(
                "flex gap-3 max-w-[80%]",
                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  message.role === 'user' ? 'bg-blue-600' : 'bg-gray-700'
                )}
              >
                {message.role === 'user' ? (
                  <User className="h-4 w-4 text-white" />
                ) : (
                  <Bot className="h-4 w-4 text-white" />
                )}
              </div>
              <div
                className={cn(
                  "flex flex-col gap-1",
                  message.role === 'user' ? 'items-end' : 'items-start'
                )}
              >
                <div
                  className={cn(
                    "rounded-lg px-4 py-2",
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-100'
                  )}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{message.timestamp.toLocaleTimeString()}</span>
                  {message.model && (
                    <>
                      <span>•</span>
                      <span>{message.model}</span>
                    </>
                  )}
                  {message.tokenUsage && (
                    <>
                      <span>•</span>
                      <span>{message.tokenUsage.total} tokens</span>
                      <span>•</span>
                      <span>${message.tokenUsage.cost.toFixed(4)}</span>
                    </>
                  )}
                  {message.toolsUsed && message.toolsUsed.length > 0 && (
                    <>
                      <span>•</span>
                      <span>🔧 {message.toolsUsed.map(t => t.name).join(', ')}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-700">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="bg-gray-800 rounded-lg px-4 py-2">
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about your factory operations..."
            className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={cn(
              "rounded-lg px-4 py-2 transition-colors",
              "bg-blue-600 hover:bg-blue-700 text-white",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
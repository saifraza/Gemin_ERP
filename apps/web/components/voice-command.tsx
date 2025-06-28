'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useMCP } from '@/hooks/use-mcp';

export function VoiceCommand() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const { askAI } = useMCP();

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = async (event: any) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      
      try {
        const response = await askAI(text, { source: 'voice' });
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(response.message);
          window.speechSynthesis.speak(utterance);
        }
      } catch (error) {
        console.error('Voice command error:', error);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    if (isListening) {
      recognition.start();
    }

    return () => {
      recognition.stop();
    };
  }, [isListening, askAI]);

  const toggleListening = () => {
    setIsListening(!isListening);
  };

  return (
    <div className="flex items-center gap-4">
      <Button
        onClick={toggleListening}
        variant={isListening ? "destructive" : "default"}
        className="rounded-full w-12 h-12 p-0"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {isListening ? (
            <rect x="6" y="4" width="4" height="16" />
          ) : (
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          )}
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
      </Button>
      {transcript && (
        <div className="text-sm text-muted-foreground">
          "{transcript}"
        </div>
      )}
    </div>
  );
}
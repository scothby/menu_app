
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { Send, X, ChefHat, Bot, User, Mic } from 'lucide-react';

interface ChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isTyping: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ isOpen, onClose, messages, onSendMessage, isTyping }) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isOpen]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputText(prev => prev + (prev ? ' ' : '') + transcript);
          setIsListening(false);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice input is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const text = inputText;
    setInputText('');
    await onSendMessage(text);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex flex-col items-end justify-end sm:p-4 md:p-6 pointer-events-none">
      {/* Backdrop on mobile only */}
      <div className="absolute inset-0 bg-black/50 sm:bg-black/30 pointer-events-auto" onClick={onClose} />

      <div className="pointer-events-auto w-full sm:w-[420px] md:w-[450px] h-[75vh] sm:h-[85vh] md:h-[600px] bg-slate-900 border-t sm:border border-slate-700 rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-4 duration-300 safe-bottom">

        {/* Header */}
        <div className="bg-slate-950 p-3 sm:p-4 border-b border-slate-800 flex justify-between items-center safe-top">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-orange-500/20 p-1.5 sm:p-2 rounded-full">
              <ChefHat className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm sm:text-base">Chef Concierge</h3>
              <p className="text-[10px] sm:text-xs text-slate-400">Ask me anything about the menu</p>
            </div>
          </div>
          <button onClick={onClose} className="touch-target text-slate-400 hover:text-white p-1.5 sm:p-2 hover:bg-slate-800 rounded-full transition active:scale-95">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 bg-slate-900/95 custom-scrollbar">
          {messages.length === 0 && (
            <div className="text-center text-slate-500 mt-8 sm:mt-10 space-y-2">
              <ChefHat className="w-10 h-10 sm:w-12 sm:h-12 mx-auto opacity-20" />
              <p className="text-xs sm:text-sm">"What's good here?"</p>
              <p className="text-xs sm:text-sm">"Is the spicy pasta actually spicy?"</p>
              <p className="text-xs sm:text-sm">"I need a gluten-free option."</p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-2 sm:gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'model' && (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700">
                  <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-400" />
                </div>
              )}
              <div
                className={`max-w-[85%] sm:max-w-[80%] p-2.5 sm:p-3 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                  ? 'bg-orange-600 text-white rounded-tr-none'
                  : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
                  }`}
              >
                {msg.role === 'model' ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: msg.text }}
                  />
                ) : (
                  msg.text
                )}
              </div>
              {msg.role === 'user' && (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-300" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-2 sm:gap-3 justify-start">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700">
                <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-400" />
              </div>
              <div className="bg-slate-800 p-3 sm:p-4 rounded-2xl rounded-tl-none border border-slate-700 flex gap-1">
                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800">
          <div className="relative flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask about dishes, allergies..."
                className="w-full bg-slate-900 text-white text-sm sm:text-base border border-slate-700 rounded-full py-2.5 sm:py-3 pl-3 sm:pl-4 pr-10 sm:pr-12 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all"
              />
              {/* Mic Button inside Input */}
              <button
                type="button"
                onClick={toggleListening}
                className={`touch-target absolute right-1 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                title="Voice Input"
              >
                <Mic className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>

            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="touch-target p-2.5 sm:p-3 bg-orange-600 text-white rounded-full hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0 active:scale-95"
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default ChatInterface;

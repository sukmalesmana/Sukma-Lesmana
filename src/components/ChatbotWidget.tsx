import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Bot,
  X,
  Send,
  Sparkles,
  RefreshCw,
  User,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { sound } from '../utils/audio';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome',
    role: 'assistant',
    content:
      'Halo! Saya **Asisten Ahli Akuntansi Keperilakuan**. Saya siap membantu Anda menganalisis teori keagenan (principal-agent), asimetri informasi, budgetary slack, desain insentif, bias heuristik, hingga independensi audit internal pada simulasi **Agency Wars** ini.\n\n*Catatan: Saya diprogram khusus untuk menjawab pertanyaan seputar topik Akuntansi Keperilakuan dan simulasi ini saja.*',
    timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  }
];

const SUGGESTED_PROMPTS = [
  'Apa itu Goal Congruence dalam Teori Agensi?',
  'Bagaimana mitigasi Budgetary Slack pada Kelompok Operasional (G5)?',
  'Apa dampak bias heuristik pada keputusan pemasaran (G4)?',
  'Mengapa auditor internal (G6) memerlukan garis pelaporan independen?'
];

export const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [isOpen, messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputPrompt).trim();
    if (!text || isLoading) return;

    sound.playClick();
    setErrorMessage(null);
    setInputPrompt('');

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error (${response.status})`);
      }

      const data = await response.json();
      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'Maaf, saya tidak menerima respons.',
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMessage]);
      sound.playSuccess();
    } catch (err: unknown) {
      console.error('Chat error:', err);
      const msg = err instanceof Error ? err.message : 'Gagal menghubungi server.';
      setErrorMessage(msg);
      sound.playAlert();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    sound.playClick();
    setMessages(INITIAL_MESSAGES);
    setErrorMessage(null);
  };

  return (
    <div className="fixed bottom-5 left-5 z-50 flex flex-col items-start select-none">
      {/* Expanded Chat Window */}
      {isOpen && (
        <div className="glass-panel w-[90vw] sm:w-96 h-[500px] max-h-[80vh] rounded-3xl border border-cyan-500/40 shadow-2xl flex flex-col mb-3 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="p-3.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <span>AI Mentor Akuntansi Keperilakuan</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </h4>
                <p className="text-[10px] text-cyan-400 font-semibold">
                  Agency Wars Learning Assistant
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={handleResetChat}
                title="Mulai Percakapan Baru"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  setIsOpen(false);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Topic Scope Banner */}
          <div className="px-3 py-1.5 bg-cyan-950/40 border-b border-cyan-500/20 flex items-center space-x-1.5 text-[10px] text-cyan-300">
            <ShieldCheck className="w-3 h-3 text-cyan-400 flex-shrink-0" />
            <span className="truncate">
              Khusus topik Akuntansi Keperilakuan & Kasus Agency Wars
            </span>
          </div>

          {/* Messages Scroll Area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3.5 space-y-3">
            {messages.map((m) => {
              const isAssistant = m.role === 'assistant';
              return (
                <div
                  key={m.id}
                  className={`flex items-start space-x-2 ${
                    isAssistant ? 'justify-start' : 'justify-end'
                  }`}
                >
                  {isAssistant && (
                    <div className="w-6 h-6 rounded-lg bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 flex items-center justify-center flex-shrink-0 text-[10px] mt-0.5 font-bold">
                      <Bot className="w-3 h-3" />
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] p-2.5 rounded-2xl text-xs leading-relaxed space-y-1 ${
                      isAssistant
                        ? 'bg-slate-900/90 border border-slate-800 text-slate-200'
                        : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium shadow-sm'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{m.content}</div>
                    <div
                      className={`text-[9px] text-right font-mono ${
                        isAssistant ? 'text-slate-500' : 'text-cyan-200'
                      }`}
                    >
                      {m.timestamp}
                    </div>
                  </div>

                  {!isAssistant && (
                    <div className="w-6 h-6 rounded-lg bg-blue-600/40 text-blue-200 border border-blue-500/30 flex items-center justify-center flex-shrink-0 text-[10px] mt-0.5 font-bold">
                      <User className="w-3 h-3" />
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-start space-x-2">
                <div className="w-6 h-6 rounded-lg bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3 h-3" />
                </div>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-400 flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]"></span>
                  <span className="text-[11px] text-slate-400 ml-1">Menganalisis konsep...</span>
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="p-2.5 bg-rose-950/40 border border-rose-500/30 rounded-xl text-[11px] text-rose-300 flex items-start space-x-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          {/* Quick Suggestions Chips if conversation is short */}
          {messages.length <= 2 && (
            <div className="px-3 py-1.5 border-t border-slate-800/80 bg-slate-950/50 space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                <span>Pertanyaan Contoh:</span>
              </div>
              <div className="flex overflow-x-auto gap-1.5 pb-1 no-scrollbar">
                {SUGGESTED_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    className="text-[10px] px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-cyan-500/30 whitespace-nowrap transition text-left flex-shrink-0"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-2.5 bg-slate-950/90 border-t border-slate-800 flex items-center space-x-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Tanyakan konsep teori keagenan / simulasi..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition placeholder:text-slate-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !inputPrompt.trim()}
              className="p-2 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white transition disabled:opacity-40 disabled:cursor-not-allowed shadow"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Toggle Button on the Bottom-Left */}
      <button
        onClick={() => {
          sound.playClick();
          setIsOpen(!isOpen)}
        }
        className="px-3.5 py-2.5 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-xl glow-cyan flex items-center space-x-2 active:scale-95 transition"
        title="Buka Chatbot Akuntansi Keperilakuan"
      >
        <div className="relative">
          <Bot className="w-4 h-4 text-white" />
          <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5 ring-2 ring-slate-950"></span>
        </div>
        <span className="text-xs font-semibold">Tanya AI Teori</span>
      </button>
    </div>
  );
};

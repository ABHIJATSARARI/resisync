import React, { useState, useRef, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Trip, ChatMessage, UserProfile } from '../types';
import { sendChatMessage } from '../services/geminiService';

interface AiAssistantProps {
  trips: Trip[];
  profile: UserProfile | null;
}

const AiAssistant: React.FC<AiAssistantProps> = ({ trips, profile }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
        id: '1',
        role: 'model',
        text: 'Hello! I am your ResiSync legal companion. I can analyze your trips against visa rules and tax treaties. What would you like to know?',
        timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Dynamic Suggestions based on context
  const suggestions = useMemo(() => {
    const base = [
      "How many Schengen days do I have left?",
      "Suggest a non-Schengen destination.",
    ];
    
    if (trips.length > 0) {
        // Prioritize questions about the most recent/upcoming trip
        const sorted = [...trips].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
        const latest = sorted[sorted.length - 1];
        
        base.unshift(`Visa requirements for ${latest.country}?`);
        base.unshift(`Am I a tax resident in ${latest.country}?`);
    } else if (profile?.nationality) {
        base.unshift(`Best nomad visas for ${profile.nationality} citizens`);
    }

    return base.slice(0, 4);
  }, [trips, profile]);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        text: textToSend,
        timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const apiHistory = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
    }));
    
    const response = await sendChatMessage(userMsg.text, apiHistory, trips, profile);

    const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text,
        timestamp: new Date(),
        sources: response.sources
    };

    setMessages(prev => [...prev, botMsg]);
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-inter">
        {/* Chat Window */}
        {isOpen && (
            <div className="bg-white dark:bg-slate-900 w-[380px] h-[600px] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 mb-4 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-10 duration-300">
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-black dark:to-slate-900 p-4 flex justify-between items-center text-white shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center border border-white/10 shadow-inner">
                            <svg className="w-5 h-5 text-brand-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                        </div>
                        <div>
                             <span className="font-bold text-sm block leading-none">Legal Companion</span>
                             <span className="text-[10px] text-brand-300 font-medium tracking-wide uppercase">AI-Powered</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                         <button 
                            onClick={() => setMessages(messages.slice(0, 1))} 
                            className="p-1.5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
                            title="Clear Chat"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                        <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-slate-50 dark:bg-slate-950 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                            <div className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                                msg.role === 'user' 
                                ? 'bg-brand-600 text-white rounded-br-none' 
                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-bl-none'
                            }`}>
                                <div className="prose prose-xs dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0 text-inherit leading-relaxed">
                                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                                </div>
                            </div>
                            
                            {/* Sources / Grounding Data */}
                            {msg.sources && msg.sources.length > 0 && (
                                <div className="mt-2 ml-1 max-w-[90%] flex flex-col gap-2 animate-in fade-in duration-500">
                                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1.5">
                                        <svg className="w-3 h-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        Verified Sources
                                    </span>
                                    <div className="flex flex-col gap-1.5">
                                        {msg.sources.map((source, idx) => (
                                            <a 
                                                key={idx} 
                                                href={source.uri} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-[11px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 hover:border-brand-300 dark:hover:border-brand-700 transition-all flex items-center justify-between group shadow-sm hover:shadow-md"
                                                title={source.title}
                                            >
                                                <div className="flex items-center gap-2 truncate">
                                                    <span className="w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[8px] font-bold text-slate-500">{idx + 1}</span>
                                                    <span className="truncate font-medium">{source.title}</span>
                                                </div>
                                                <svg className="w-3 h-3 text-slate-300 group-hover:text-brand-500 transform group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    
                    {isLoading && (
                        <div className="flex justify-start animate-in fade-in zoom-in-95">
                             <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-2.5">
                                <span className="text-xs text-slate-500 font-medium">Researching regulations</span>
                                <div className="flex gap-1">
                                    <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-[bounce_1s_infinite_0ms]"></span>
                                    <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-[bounce_1s_infinite_200ms]"></span>
                                    <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-[bounce_1s_infinite_400ms]"></span>
                                </div>
                             </div>
                        </div>
                    )}
                    
                    {/* Suggested Questions */}
                    {!isLoading && messages.length === 1 && (
                        <div className="mt-8 px-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-3 block flex items-center gap-2">
                                <span className="w-8 h-[1px] bg-slate-200 dark:bg-slate-700"></span>
                                Suggestions
                                <span className="w-full h-[1px] bg-slate-200 dark:bg-slate-700"></span>
                            </span>
                            <div className="grid grid-cols-1 gap-2">
                                {suggestions.map((q, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSend(q)}
                                        className="text-left text-xs bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-brand-200 dark:hover:border-brand-800 rounded-xl px-4 py-3 transition-all shadow-sm hover:shadow hover:-translate-y-0.5 flex items-center justify-between group"
                                    >
                                        <span className="truncate mr-2">{q}</span>
                                        <svg className="w-3 h-3 text-slate-300 group-hover:text-brand-500 transition-colors opacity-0 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0 relative z-20">
                    <div className="relative">
                        <input 
                            type="text" 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Ask about visas, taxes, permits..."
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3.5 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white dark:focus:bg-slate-900 transition-all dark:text-white placeholder:text-slate-400"
                        />
                        <button 
                            onClick={() => handleSend()}
                            disabled={isLoading || !input.trim()}
                            className="absolute right-2 top-2 p-1.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors shadow-sm"
                        >
                            <svg className="w-5 h-5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                        </button>
                    </div>
                    <div className="text-center mt-2">
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">AI provides info, not legal advice. Verify independently.</p>
                    </div>
                </div>
            </div>
        )}

        {/* Toggle Button */}
        <button 
            onClick={() => setIsOpen(!isOpen)}
            className={`p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 border-2 border-white/20 ${
                isOpen ? 'bg-slate-800 text-slate-400 rotate-90' : 'bg-brand-600 text-white hover:bg-brand-500 ring-4 ring-brand-100 dark:ring-brand-900/30'
            }`}
        >
            {isOpen ? (
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            ) : (
                <div className="relative">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                    {messages.length > 1 && (
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                    )}
                </div>
            )}
        </button>
    </div>
  );
};

export default AiAssistant;
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import { chatWithUdfAgent } from '../services/gemini';
import { ChatMessage } from '../types';

const AgentChat: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: '1', role: 'assistant', text: 'Namaskaram! I am UDF Sahay. How can I help you with the 2026 election prep?', timestamp: new Date() }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;
        
        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            text: input,
            timestamp: new Date()
        };
        
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        const history = messages.map(m => `${m.role}: ${m.text}`).join('\n');
        const response = await chatWithUdfAgent(history, input);

        const botMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            text: response,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, botMsg]);
        setIsLoading(false);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
            {/* Chat Window */}
            <div className={`pointer-events-auto bg-white rounded-2xl shadow-2xl border border-slate-200 w-80 sm:w-96 mb-4 transition-all duration-300 origin-bottom-right overflow-hidden flex flex-col
                ${isOpen ? 'scale-100 opacity-100 h-[500px]' : 'scale-0 opacity-0 h-0'}
            `}>
                {/* Header */}
                <div className="bg-emerald-600 p-4 flex justify-between items-center text-white shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                            <Bot size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm">UDF Sahay Agent</h3>
                            <p className="text-[10px] text-emerald-100">Live Support • Online</p>
                        </div>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded">
                        <X size={18} />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 bg-slate-50 p-4 overflow-y-auto">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex mb-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm
                                ${msg.role === 'user' 
                                    ? 'bg-emerald-600 text-white rounded-br-none' 
                                    : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none'}
                            `}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start mb-3">
                             <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-4 py-2 flex items-center gap-1">
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                             </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-3 bg-white border-t border-slate-100 flex gap-2 shrink-0">
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask about UDF strategy..."
                        className="flex-1 bg-slate-100 border-none rounded-full px-4 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                    <button 
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                        className="w-10 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>

            {/* Toggle Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="pointer-events-auto w-14 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
            >
                {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
            </button>
        </div>
    );
};

export default AgentChat;

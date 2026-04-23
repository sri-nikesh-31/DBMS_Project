import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hi! I am the Aura AI assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userQuery = input.trim();
    setInput('');
    
    // Optimistic UI update
    const newMessages = [...messages, { role: 'user', text: userQuery }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Build safe history (last 4 messages to save tokens)
      const chatHistory = newMessages.slice(-5).map(m => ({
        role: m.role === 'bot' ? 'assistant' : 'user',
        content: m.text
      }));

      // Directly calls the Vercel serverless function
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userQuery,
          chatHistory
        })
      });

      if (!res.ok) {
        throw new Error('API Error');
      }

      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("text/html")) {
        throw new Error("VercelDevRequired");
      }

      const data = await res.json();
      
      setMessages(prev => [...prev, { 
        role: 'bot', 
        text: data?.reply || "Sorry, I received an empty response." 
      }]);

    } catch (err) {
      console.error('Chat error:', err);
      
      if (err.message === "VercelDevRequired") {
         setMessages(prev => [...prev, { 
            role: 'bot', 
            text: "⚠️ Developer Notice: I am powered by a Vercel Serverless Function! Because you are running the standard Vite dev server (`npm run dev`), my backend logic cannot execute. Please stop the terminal and run `npx vercel dev` to test me locally!" 
         }]);
      } else {
         // Friendly fallback via UI
         setMessages(prev => [...prev, { 
            role: 'bot', 
            text: "Sorry, I couldn't process that. Please try again." 
         }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to parse simple bold markdown safely
  const formatText = (text) => {
    if (!text) return null;
    return text.split(/(\*\*.*?\*\*)/g).map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-indigo-300">{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-[350px] sm:w-[380px] h-[500px] bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-4 pointer-events-auto shadow-indigo-500/10"
          >
            {/* Header */}
            <div className="bg-indigo-600 px-4 py-3 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm shadow-sm ring-1 ring-white/30">
                  <Bot className="text-white w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">Aura Assistant</h3>
                  <p className="text-indigo-100/70 text-[10px] uppercase tracking-wider font-semibold">Online</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-1.5 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/50">
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    {/* Avatar */}
                    <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mt-1">
                      {msg.role === 'user' 
                        ? <User className="w-4 h-4 text-indigo-400" />
                        : <Bot className="w-4 h-4 text-slate-400" />
                      }
                    </div>
                    {/* Bubble */}
                    <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                      msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-tr-sm' 
                        : 'bg-slate-800 border border-slate-700/50 text-slate-200 rounded-tl-sm'
                    }`}>
                      {formatText(msg.text)}
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-2 max-w-[85%]">
                     <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mt-1">
                       <Bot className="w-4 h-4 text-slate-400" />
                     </div>
                     <div className="bg-slate-800 border border-slate-700/50 p-4 rounded-2xl rounded-tl-sm flex gap-1.5 items-center">
                        <motion.div animate={{ y: [0,-4,0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                        <motion.div animate={{ y: [0,-4,0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }} className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                        <motion.div animate={{ y: [0,-4,0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }} className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                     </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="p-3 bg-slate-900 border-t border-slate-800">
              <form 
                onSubmit={sendMessage}
                className="relative flex items-center"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question..."
                  disabled={isLoading}
                  className="w-full bg-slate-950 border border-slate-700 rounded-full py-3 pl-4 pr-12 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors disabled:opacity-50"
                  autoComplete="off"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 p-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white rounded-full transition-all disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </form>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-indigo-600 hover:bg-indigo-500 rounded-full shadow-xl shadow-indigo-500/20 flex items-center justify-center text-white focus:outline-none pointer-events-auto border-4 border-slate-900 transition-colors"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageCircle className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}

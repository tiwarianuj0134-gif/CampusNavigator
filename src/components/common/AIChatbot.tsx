import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Sparkles, Bot, User, GraduationCap } from 'lucide-react';
import { geminiService } from '@/services/geminiService';
import { useAuthStore } from '@/context/authStore';

interface Message { id: string; role: 'user' | 'assistant'; content: string; }

const suggestions = ['Best engineering colleges in India?', 'Compare IIT Delhi vs IIT Bombay', 'What is JEE eligibility?', 'Top MBA colleges for Finance?'];

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: 'Hi! I\'m your AI college advisor powered by Gemini. Ask me anything about colleges, courses, admissions, or career guidance in India! 🎓' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || isLoading) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: msg };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    try {
      const res = await geminiService.chat(msg);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: res.text || 'I couldn\'t process that. Please try again.' }]);
    } catch {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: 'I\'m having trouble connecting right now. Please try again shortly.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Toggle button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.5, type: 'spring', stiffness: 260, damping: 20 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6b5fff] to-[#8b5cf6] text-white shadow-2xl shadow-[#6b5fff]/35 flex items-center justify-center"
        aria-label="Toggle AI Chat"
      >
        <AnimatePresence mode="wait">
          <motion.div key={isOpen ? 'x' : 'chat'} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}>
            {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
          </motion.div>
        </AnimatePresence>
        {/* Pulse ring */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-2xl ring-2 ring-[#6b5fff]/40 animate-ping" style={{ animationDuration: '2s' }} />
        )}
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.93 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.93 }}
            transition={{ duration: 0.22, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="fixed bottom-24 right-6 z-50 w-[370px] max-w-[calc(100vw-24px)] h-[520px] bg-white dark:bg-[#0e0e20] rounded-3xl shadow-2xl shadow-black/20 border border-gray-100 dark:border-[#1c1c35] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-[#6b5fff] to-[#8b5cf6] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">AI College Advisor</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                    <p className="text-[11px] text-white/75">Powered by Gemini</p>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="w-7 h-7 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors" aria-label="Close chat">
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-[#6b5fff] text-white' : 'bg-[#6b5fff]/8 dark:bg-[#6b5fff]/15 text-[#6b5fff]'}`}>
                    {msg.role === 'user' ? <User size={13} /> : <Bot size={13} />}
                  </div>
                  <div className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-[#6b5fff] to-[#8b5cf6] text-white rounded-tr-md shadow-md shadow-[#6b5fff]/20'
                      : 'bg-gray-100 dark:bg-[#1a1a2e] text-gray-800 dark:text-gray-200 rounded-tl-md'
                  }`}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-[#6b5fff]/8 flex items-center justify-center text-[#6b5fff]"><Bot size={13} /></div>
                  <div className="px-3.5 py-3 rounded-2xl rounded-tl-md bg-gray-100 dark:bg-[#1a1a2e]">
                    <div className="flex gap-1 items-center">
                      {[0, 150, 300].map((d, i) => (
                        <div key={i} className="w-1.5 h-1.5 bg-[#6b5fff]/60 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick suggestions (only at start) */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2">
                <div className="flex flex-wrap gap-1.5">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(s)}
                      className="text-[11px] px-2.5 py-1.5 rounded-lg bg-[#6b5fff]/8 dark:bg-[#6b5fff]/12 text-[#6b5fff] dark:text-[#a89fff] border border-[#6b5fff]/15 hover:bg-[#6b5fff]/14 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-gray-100 dark:border-[#1c1c35]">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about any college..."
                  className="flex-1 h-10 px-4 rounded-xl border border-gray-200 dark:border-[#1c1c35] bg-gray-50 dark:bg-[#060612] text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6b5fff]/25 focus:border-[#6b5fff]/50 transition-all"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#6b5fff] to-[#8b5cf6] text-white flex items-center justify-center disabled:opacity-50 hover:shadow-md hover:shadow-[#6b5fff]/25 transition-all flex-shrink-0"
                  aria-label="Send"
                >
                  <Send size={15} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

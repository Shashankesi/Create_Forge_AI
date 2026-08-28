import React, { useState } from 'react';
import { Sparkles, MessageSquare, X, Send, Bot, User as UserIcon, Loader2, ArrowRight } from 'lucide-react';
import { aiService } from '../../services/aiService';
import { useToast } from '../../context/ToastContext';

export const CreateForgeAssistant = ({ currentContext = {} }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm your CreateForge AI Studio Assistant. I'm connected to your active workspace context. How can I help refine, transform, or brainstorm with you today?",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const res = await aiService.askAssistant({
        message: userMessage,
        context: currentContext,
      });

      if (res.success && res.reply) {
        setMessages((prev) => [...prev, { role: 'assistant', content: res.reply }]);
      }
    } catch (err) {
      showToast(err.customMessage || 'Assistant was unable to respond. Please try again.', 'error');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I ran into a connection glitch. Please try asking again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    'Make the introduction stronger',
    'Generate 3 alternative angles',
    'Summarize key takeaways in 3 bullets',
    'Suggest a high-CTR visual prompt',
  ];

  return (
    <>
      {/* Floating Trigger Button (Compact 44px Circular Button) */}
      <button
        onClick={() => setIsOpen(true)}
        title="Ask CreateForge AI"
        className={`fixed bottom-5 right-5 z-40 w-11 h-11 rounded-full bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white shadow-lg shadow-indigo-600/30 flex items-center justify-center transition-all duration-200 ${
          isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'
        }`}
      >
        <Sparkles className="w-4 h-4" />
      </button>

      {/* Slide-over Assistant Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full sm:w-88 bg-white/98 dark:bg-slate-900/98 backdrop-blur-2xl border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit'] flex items-center gap-1.5">
                CreateForge Co-Creator
              </h3>
              <p className="text-[11px] text-slate-500 truncate max-w-[180px]">
                {currentContext.docTitle ? `Context: ${currentContext.docTitle}` : 'Context-Aware Studio'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && (
                <div className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              )}
              <div
                className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-xs'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 rounded-bl-xs border border-slate-200/50 dark:border-slate-700/50'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-2.5 items-center text-slate-400 text-xs">
              <div className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              </div>
              <span>Thinking with workspace context...</span>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => {
                setInput(prompt);
              }}
              className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about your content or visual..."
            className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 dark:text-white"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </>
  );
};

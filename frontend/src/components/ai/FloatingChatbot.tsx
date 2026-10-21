import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Bot, User, ArrowRight } from 'lucide-react';
import { aiApi } from '../../services/api';
import { useNavigate } from 'react-router-dom';

interface ChatMsg {
  role: 'user' | 'assistant';
  content: string;
  suggestedActions?: string[];
  isFallback?: boolean;
}

export const FloatingChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: 'assistant',
      content:
        'Hello! I am Eve, your celebration concierge. How can I help you plan your birthday, anniversary, wedding, or corporate event today?',
      suggestedActions: [
        'Explore Curated Packages',
        'How does booking work?',
        'Plan with AI Assistant',
      ],
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMessage: ChatMsg = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const res = await aiApi.chatWithAssistant(text, history);

      if (res.success && res.data) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: res.data.reply,
            suggestedActions: res.data.suggestedActions,
            isFallback: res.data.isFallback,
          },
        ]);
      } else {
        throw new Error('No response');
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'I am currently operating in offline mode. You can browse our Packages page for curated celebration options or explore individual verified vendors!',
          suggestedActions: ['View Packages', 'Explore Services'],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (action: string) => {
    if (action.includes('Package')) {
      navigate('/packages');
      setIsOpen(false);
    } else if (action.includes('AI') || action.includes('Plan')) {
      navigate('/ai-planner');
      setIsOpen(false);
    } else if (action.includes('Services') || action.includes('Vendors')) {
      navigate('/explore-services');
      setIsOpen(false);
    } else {
      handleSend(action);
    }
  };

  return (
    <aside aria-label="Eve AI Celebration Assistant" className="fixed bottom-6 right-6 z-50">
      {/* Floating trigger button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-primary hover:bg-primary-hover text-white shadow-modal transition-all transform hover:scale-105"
          aria-label="Open AI Celebration Assistant"
        >
          <Sparkles className="w-5 h-5 text-amber-200 animate-pulse" />
          <span className="text-sm font-bold tracking-wide">Ask Eve AI</span>
        </button>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[520px] rounded-2xl bg-surface border border-border shadow-modal flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="bg-primary text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold leading-tight">Eve Celebration Concierge</h3>
                <span className="text-[11px] text-white/80 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Grounded Gemini Assistant
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-md hover:bg-white/20 transition-colors"
              aria-label="Close Chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-surface-elevated/40 text-sm">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-primary-subtle text-primary flex items-center justify-center shrink-0 border border-primary/20">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}
                <div className="max-w-[82%] space-y-2">
                  <div
                    className={`p-3 rounded-xl leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-primary text-white rounded-br-none'
                        : 'bg-surface text-text-primary border border-border rounded-bl-none shadow-subtle'
                    }`}
                  >
                    <p className="whitespace-pre-line">{m.content}</p>
                  </div>

                  {/* Suggested Quick Action Chips */}
                  {m.suggestedActions && m.suggestedActions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {m.suggestedActions.map((action, aIdx) => (
                        <button
                          key={aIdx}
                          onClick={() => handleActionClick(action)}
                          className="text-xs px-2.5 py-1 rounded-full bg-surface border border-primary/30 text-primary hover:bg-primary-subtle transition-colors flex items-center gap-1 font-medium"
                        >
                          <span>{action}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {m.role === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-text-secondary text-white flex items-center justify-center shrink-0 text-xs">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2 items-center text-text-muted text-xs py-2">
                <Sparkles className="w-4 h-4 text-primary animate-spin" />
                <span>Eve is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 border-t border-border bg-surface flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about packages, vendors, pricing..."
              className="flex-1 bg-surface-elevated border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-primary placeholder:text-text-muted"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2 rounded-lg bg-primary hover:bg-primary-hover disabled:opacity-50 text-white transition-colors"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </aside>
  );
};

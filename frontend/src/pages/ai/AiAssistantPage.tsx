import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  aiApi,
  AiMessage,
  AiConversationSummary,
} from '../../api/ai';
import {
  Sparkles,
  Send,
  Plus,
  Trash2,
  AlertTriangle,
  Bot,
  Copy,
  Check,
  RefreshCw,
  MessageSquare,
} from 'lucide-react';

const SUGGESTED_PROMPTS = [
  'How were my sales this month?',
  'What are my best-selling products?',
  'Which products need restocking?',
  'What are my biggest expenses?',
  'How are my reviews performing?',
];

export const AiAssistantPage: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<AiConversationSummary[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [loadingConversations, setLoadingConversations] = useState<boolean>(true);
  const [copiedMessageId, setCopiedMessageId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Load initial conversation list
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoadingConversations(true);
      const convs = await aiApi.getConversations();
      setConversations(convs || []);
    } catch (err) {
      console.error('Failed to load initial AI assistant data', err);
    } finally {
      setLoadingConversations(false);
    }
  };

  // Load specific conversation messages
  const handleSelectConversation = async (convId: number) => {
    try {
      setError(null);
      setActiveConversationId(convId);
      const detail = await aiApi.getConversationDetail(convId);
      setMessages(detail.messages);
    } catch (err) {
      setError('Could not load chat history.');
    }
  };

  // Start a new conversation
  const handleNewChat = () => {
    setActiveConversationId(null);
    setMessages([]);
    setError(null);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Send a message
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || loading) return;

    setError(null);
    setInputMessage('');

    // Optimistically add user message to UI
    const tempUserMsg: AiMessage = {
      id: Date.now(),
      role: 'USER',
      content: query,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const response = await aiApi.sendChatMessage({
        conversationId: activeConversationId || undefined,
        message: query,
      });

      // Update active conversation ID
      if (!activeConversationId && response.conversationId) {
        setActiveConversationId(response.conversationId);
      }

      // Add AI response to UI
      const assistantMsg: AiMessage = {
        id: Date.now() + 1,
        role: 'ASSISTANT',
        content: response.reply || response.response || 'No response generated.',
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Refresh conversations list in sidebar
      aiApi.getConversations().then(setConversations).catch(() => {});
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        'The AI service is currently unavailable. Please check your backend connection or retry in a moment.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyMessage = (msgId: number, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedMessageId(msgId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleDeleteConversation = async (convId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await aiApi.deleteConversation(convId);
      setConversations((prev) => prev.filter((c) => c.id !== convId));
      if (activeConversationId === convId) {
        handleNewChat();
      }
    } catch (err) {
      setError('Failed to delete conversation.');
    }
  };

  return (
    <div className="h-[calc(100vh-135px)] flex flex-col md:flex-row gap-4">
      {/* LEFT: Conversation History Sidebar */}
      <div className="w-full md:w-64 bg-white rounded-2xl border border-zinc-200 shadow-card p-3.5 flex flex-col justify-between shrink-0">
        <div className="space-y-3 overflow-hidden flex flex-col h-full">
          {/* New Chat Button */}
          <button
            onClick={handleNewChat}
            className="w-full py-2.5 px-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Plus size={15} />
            <span>New Conversation</span>
          </button>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto space-y-1 pr-1">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-2 py-1 block">
              Recent Consultations
            </span>

            {loadingConversations ? (
              <div className="text-center py-6 text-zinc-400 text-xs">Loading history...</div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-8 text-zinc-400 text-xs space-y-1 px-2">
                <MessageSquare size={20} className="mx-auto text-zinc-300" />
                <p>No prior conversations</p>
              </div>
            ) : (
              conversations.map((conv) => {
                const isActive = activeConversationId === conv.id;
                return (
                  <div
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv.id)}
                    className={`group p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-brand-50 text-brand-900 border border-brand-200'
                        : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                    }`}
                  >
                    <div className="truncate flex-1 pr-1.5">
                      <span className="truncate block text-xs">{conv.title || 'Business Consultation'}</span>
                      <span className="text-[10px] text-zinc-400 block font-normal">
                        {new Date(conv.updatedAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleDeleteConversation(conv.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-zinc-200 text-zinc-400 hover:text-rose-600 transition-opacity"
                      title="Delete chat"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* AI Engine Status Badge */}
        <div className="pt-3 border-t border-zinc-100 text-[11px] text-zinc-500 flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-brand-600" />
            <span className="font-medium">Context: Live Business DB</span>
          </div>
        </div>
      </div>

      {/* RIGHT: Active Chat & Prompt Workspace */}
      <div className="flex-1 bg-white rounded-2xl border border-zinc-200 shadow-card flex flex-col justify-between overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/60">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold">
              <Bot size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900">AI Business Assistant</h2>
              <p className="text-[11px] text-zinc-500">Ask questions about your business numbers and operations</p>
            </div>
          </div>
        </div>

        {/* Message Stream Area */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4">
          {messages.length === 0 ? (
            <div className="py-12 max-w-xl mx-auto text-center space-y-5">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto border border-brand-200">
                <Sparkles size={24} />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-zinc-900">How can I help your business today?</h3>
                <p className="text-xs text-zinc-500 leading-relaxed max-w-md mx-auto">
                  I can analyze your sales trends, margin reports, low stock items, top performing catalog products, and customer reviews.
                </p>
              </div>

              {/* Suggested Questions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left pt-2">
                {SUGGESTED_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    className="p-3 rounded-xl bg-zinc-50 hover:bg-brand-50 hover:border-brand-200 border border-zinc-200 text-xs font-semibold text-zinc-700 hover:text-brand-900 transition-colors text-left flex items-start space-x-2 cursor-pointer"
                  >
                    <span className="text-brand-600 shrink-0 font-bold">•</span>
                    <span>{prompt}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isUser = msg.role === 'USER';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-7 h-7 rounded-lg bg-brand-600 text-white flex items-center justify-center shrink-0 mt-1">
                      <Bot size={14} />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed space-y-2 relative group ${
                      isUser
                        ? 'bg-brand-600 text-white font-medium rounded-tr-xs'
                        : 'bg-zinc-50 border border-zinc-200 text-zinc-800 rounded-tl-xs shadow-xs'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>

                    {!isUser && (
                      <div className="flex items-center justify-end pt-1 border-t border-zinc-200/60">
                        <button
                          onClick={() => handleCopyMessage(msg.id, msg.content)}
                          className="text-[10px] text-zinc-400 hover:text-zinc-600 flex items-center space-x-1 cursor-pointer"
                          title="Copy response"
                        >
                          {copiedMessageId === msg.id ? (
                            <>
                              <Check size={11} className="text-brand-600" />
                              <span className="text-brand-600">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy size={11} />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {isUser && (
                    <div className="w-7 h-7 rounded-lg bg-zinc-200 text-zinc-700 flex items-center justify-center shrink-0 mt-1 text-xs font-bold">
                      {user?.fullName ? user.fullName.charAt(0) : 'U'}
                    </div>
                  )}
                </div>
              );
            })
          )}

          {loading && (
            <div className="flex items-start space-x-3">
              <div className="w-7 h-7 rounded-lg bg-brand-600 text-white flex items-center justify-center shrink-0 mt-1">
                <Bot size={14} />
              </div>
              <div className="bg-zinc-50 border border-zinc-200 p-3.5 rounded-2xl rounded-tl-xs text-xs text-zinc-500 flex items-center space-x-2">
                <RefreshCw size={13} className="animate-spin text-brand-600" />
                <span>Analyzing business database...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
              <AlertTriangle size={15} className="shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Bar */}
        <div className="p-3.5 border-t border-zinc-100 bg-white">
          <div className="flex items-center space-x-2 bg-zinc-50 border border-zinc-200 rounded-2xl p-1.5 focus-within:border-brand-600 focus-within:ring-1 focus-within:ring-brand-600">
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about sales, inventory, or expenses (Enter to send)..."
              className="flex-1 bg-transparent border-none text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-0 resize-none py-1.5 px-2"
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || loading}
              className="p-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

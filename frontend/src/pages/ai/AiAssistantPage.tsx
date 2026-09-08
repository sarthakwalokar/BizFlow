import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  aiApi,
  AiMessage,
  AiConversationSummary,
  AiSuggestedQuestion,
  AiStatusResponse,
} from '../../api/ai';
import {
  Sparkles,
  Send,
  Plus,
  Trash2,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Package,
  Star,
  Users,
  Bot,
  User as UserIcon,
  Copy,
  Check,
  RefreshCw,
  Zap,
  MessageSquare,
} from 'lucide-react';

export const AiAssistantPage: React.FC = () => {
  const { user, business } = useAuth();

  const [conversations, setConversations] = useState<AiConversationSummary[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [suggestions, setSuggestions] = useState<AiSuggestedQuestion[]>([]);
  const [aiStatus, setAiStatus] = useState<AiStatusResponse | null>(null);

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

  // Load initial conversation list, suggestions, and AI status
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoadingConversations(true);
      const [convs, suggs, status] = await Promise.all([
        aiApi.getConversations(),
        aiApi.getSuggestedQuestions(),
        aiApi.getAiStatus(),
      ]);
      setConversations(convs);
      setSuggestions(suggs);
      setAiStatus(status);
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
      console.error('Failed to load conversation details', err);
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

  // Delete a conversation
  const handleDeleteConversation = async (e: React.MouseEvent, convId: number) => {
    e.stopPropagation();
    try {
      await aiApi.deleteConversation(convId);
      setConversations((prev) => prev.filter((c) => c.id !== convId));
      if (activeConversationId === convId) {
        handleNewChat();
      }
    } catch (err) {
      console.error('Failed to delete conversation', err);
    }
  };

  // Send a chat message
  const handleSendMessage = async (promptToSend?: string) => {
    const messageText = (promptToSend || inputMessage).trim();
    if (!messageText || loading) return;

    setError(null);
    setInputMessage('');

    // Optimistically add user message to UI
    const tempUserMsg: AiMessage = {
      id: Date.now(),
      role: 'USER',
      content: messageText,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const res = await aiApi.sendChatMessage({
        conversationId: activeConversationId || undefined,
        message: messageText,
      });

      // Update active conversation ID if newly created
      if (!activeConversationId) {
        setActiveConversationId(res.conversationId);
      }

      // Add assistant response to UI
      const assistantMsg: AiMessage = {
        id: res.assistantMessageId,
        role: 'ASSISTANT',
        content: res.reply,
        providerUsed: res.providerUsed,
        tokensUsed: res.tokensUsed,
        createdAt: res.createdAt,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Refresh conversations list to update titles/previews
      const updatedConvs = await aiApi.getConversations();
      setConversations(updatedConvs);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errMsg =
        err.response?.data?.message ||
        err.response?.data?.error?.message ||
        'Failed to get response from AI Assistant. Please try again.';
      setError(errMsg);
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

  const handleCopyText = (content: string, id: number) => {
    navigator.clipboard.writeText(content);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  // Get icon for suggestion pills
  const getSuggestionIcon = (iconName: string) => {
    switch (iconName) {
      case 'AlertTriangle':
        return <AlertTriangle size={14} className="text-amber-500" />;
      case 'TrendingUp':
        return <TrendingUp size={14} className="text-emerald-500" />;
      case 'DollarSign':
        return <DollarSign size={14} className="text-indigo-500" />;
      case 'Package':
        return <Package size={14} className="text-blue-500" />;
      case 'Star':
        return <Star size={14} className="text-yellow-500" />;
      case 'Users':
        return <Users size={14} className="text-purple-500" />;
      default:
        return <Sparkles size={14} className="text-indigo-500" />;
    }
  };

  // Simple Markdown text renderer with rich styled blocks
  const renderFormattedMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Heading 3
      if (line.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-base font-black text-slate-900 mt-4 mb-2 first:mt-0 tracking-tight flex items-center space-x-1.5">
            <span>{line.replace('### ', '')}</span>
          </h3>
        );
      }
      // Heading 4
      if (line.startsWith('#### ')) {
        return (
          <h4 key={idx} className="text-xs font-bold text-slate-800 uppercase tracking-wider mt-3 mb-1.5 text-indigo-900">
            {line.replace('#### ', '')}
          </h4>
        );
      }
      // Bullet list item
      if (line.startsWith('- ') || line.startsWith('* ')) {
        const itemContent = line.substring(2);
        return (
          <li key={idx} className="ml-4 list-disc text-xs text-slate-700 leading-relaxed mb-1">
            {formatInlineStyles(itemContent)}
          </li>
        );
      }
      // Numbered list item (e.g. "1. ")
      if (/^\d+\.\s/.test(line)) {
        const itemContent = line.replace(/^\d+\.\s/, '');
        return (
          <li key={idx} className="ml-4 list-decimal text-xs text-slate-700 leading-relaxed mb-1">
            {formatInlineStyles(itemContent)}
          </li>
        );
      }
      // Quote / Note callout
      if (line.startsWith('> ') || line.startsWith('*(')) {
        return (
          <div key={idx} className="my-2 p-2.5 rounded-xl bg-indigo-50/70 border-l-2 border-indigo-500 text-xs italic text-indigo-900">
            {formatInlineStyles(line.replace(/^>\s?/, ''))}
          </div>
        );
      }
      // Empty line
      if (line.trim() === '') {
        return <div key={idx} className="h-2" />;
      }
      // Regular paragraph
      return (
        <p key={idx} className="text-xs text-slate-700 leading-relaxed mb-1">
          {formatInlineStyles(line)}
        </p>
      );
    });
  };

  // Bold (**text**) & Code (`code`) inline styling
  const formatInlineStyles = (content: string) => {
    const parts = content.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-extrabold text-slate-900 font-medium">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="px-1.5 py-0.5 rounded bg-slate-100 text-indigo-700 font-mono text-[11px] font-semibold">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <div className="flex h-[calc(100vh-6.5rem)] max-w-7xl mx-auto gap-6">
      {/* LEFT SIDEBAR: Conversation History */}
      <div className="hidden md:flex flex-col w-72 bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* New Chat Button */}
        <div className="p-4 border-b border-slate-100">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer active:scale-98"
          >
            <Plus size={16} />
            <span>New Chat Session</span>
          </button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1">
            Recent Conversations
          </div>

          {loadingConversations ? (
            <div className="p-4 text-center text-xs text-slate-400">Loading history...</div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400 italic">No past conversations yet.</div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => handleSelectConversation(conv.id)}
                className={`group flex items-center justify-between p-3 rounded-2xl text-xs cursor-pointer transition-all ${
                  activeConversationId === conv.id
                    ? 'bg-indigo-50 border border-indigo-200/70 text-indigo-950 font-bold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                }`}
              >
                <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                  <MessageSquare
                    size={15}
                    className={`shrink-0 ${
                      activeConversationId === conv.id ? 'text-indigo-600' : 'text-slate-400'
                    }`}
                  />
                  <div className="truncate">
                    <p className="truncate text-xs font-bold leading-tight">{conv.title}</p>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {new Date(conv.updatedAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => handleDeleteConversation(e, conv.id)}
                  title="Delete chat"
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-rose-100 hover:text-rose-600 text-slate-400 transition-all cursor-pointer"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Status indicator footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-slate-600">AI Gateway</span>
          </div>
          <span className="text-[10px] font-semibold text-slate-400 truncate max-w-[130px]">
            {aiStatus?.activeProvider?.split(' ')[0] || 'Ready'}
          </span>
        </div>
      </div>

      {/* RIGHT MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Header Bar */}
        <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-black text-slate-900 tracking-tight">BizFlow Business AI</h2>
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-200/60 flex items-center space-x-1">
                  <Zap size={10} className="text-indigo-600" />
                  <span>{aiStatus?.activeProvider || 'Business Advisor'}</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Grounded in verified real-time database records for {business?.name || 'your business'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleNewChat}
              className="md:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold cursor-pointer"
            >
              <Plus size={16} />
            </button>
            <button
              onClick={loadInitialData}
              title="Refresh AI context"
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            /* Empty State / Welcome Screen */
            <div className="h-full flex flex-col justify-center items-center text-center max-w-xl mx-auto py-8">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-indigo-400 flex items-center justify-center text-white shadow-xl shadow-indigo-500/25 mb-4">
                <Bot size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                Welcome, {user?.fullName?.split(' ')[0] || 'Business Owner'}!
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md">
                I am your intelligent business analyst for <strong className="text-slate-800">{business?.name}</strong>.
                Ask me about your sales, inventory restocking, expenses, customer activity, or reviews.
              </p>

              {/* Quick Suggested Prompt Cards */}
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 text-left">
                {suggestions.map((sug) => (
                  <button
                    key={sug.id}
                    onClick={() => handleSendMessage(sug.question)}
                    className={`p-4 rounded-2xl border transition-all text-left flex flex-col justify-between group cursor-pointer hover:shadow-md ${
                      sug.urgent
                        ? 'bg-amber-50/60 border-amber-200 hover:bg-amber-50 hover:border-amber-300'
                        : 'bg-slate-50/70 border-slate-200/80 hover:bg-white hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="p-1.5 rounded-xl bg-white shadow-xs">
                        {getSuggestionIcon(sug.iconName)}
                      </span>
                      {sug.urgent && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold">
                          Action Required
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                        {sug.question}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{sug.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Active Message Stream */
            messages.map((msg) => {
              const isUser = msg.role === 'USER';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-2xl flex items-center justify-center shrink-0 text-white font-bold text-xs shadow-xs ${
                      isUser
                        ? 'bg-slate-900'
                        : 'bg-gradient-to-tr from-indigo-600 to-violet-600 shadow-indigo-500/20'
                    }`}
                  >
                    {isUser ? <UserIcon size={14} /> : <Sparkles size={14} />}
                  </div>

                  {/* Message Bubble */}
                  <div className={`max-w-2xl group relative ${isUser ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`p-4 rounded-3xl text-xs ${
                        isUser
                          ? 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-600/15'
                          : 'bg-slate-50 border border-slate-200/80 text-slate-800 rounded-tl-none shadow-xs'
                      }`}
                    >
                      {isUser ? (
                        <p className="leading-relaxed font-medium whitespace-pre-wrap">{msg.content}</p>
                      ) : (
                        <div className="space-y-1">{renderFormattedMarkdown(msg.content)}</div>
                      )}
                    </div>

                    {/* Metadata & Actions */}
                    <div
                      className={`flex items-center space-x-2 mt-1 px-2 text-[10px] text-slate-400 ${
                        isUser ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <span>
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>

                      {!isUser && msg.providerUsed && (
                        <>
                          <span>•</span>
                          <span className="font-semibold text-indigo-600">{msg.providerUsed}</span>
                        </>
                      )}

                      {!isUser && (
                        <button
                          onClick={() => handleCopyText(msg.content, msg.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:text-slate-600 transition-all cursor-pointer"
                          title="Copy response"
                        >
                          {copiedMessageId === msg.id ? (
                            <Check size={11} className="text-emerald-500" />
                          ) : (
                            <Copy size={11} />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Loading Thinking Indicator */}
          {loading && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-indigo-500/20 animate-pulse">
                <Sparkles size={14} />
              </div>
              <div className="p-4 rounded-3xl rounded-tl-none bg-slate-50 border border-slate-200/80 text-xs text-slate-600 flex items-center space-x-3 shadow-xs">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" />
                </div>
                <span className="font-bold text-slate-600">Analyzing verified business data...</span>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle size={16} className="text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
              <button
                onClick={() => handleSendMessage()}
                className="px-3 py-1 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Input Section */}
        <div className="p-4 border-t border-slate-100 bg-white space-y-3">
          {/* Quick Pill Chips (when messages exist) */}
          {messages.length > 0 && suggestions.length > 0 && (
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
              <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">Suggestions:</span>
              {suggestions.slice(0, 4).map((sug) => (
                <button
                  key={sug.id}
                  onClick={() => handleSendMessage(sug.question)}
                  disabled={loading}
                  className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 text-[11px] font-bold text-slate-600 transition-all cursor-pointer shrink-0 disabled:opacity-50"
                >
                  {getSuggestionIcon(sug.iconName)}
                  <span className="truncate max-w-[200px]">{sug.question}</span>
                </button>
              ))}
            </div>
          )}

          {/* Text Input Container */}
          <div className="flex items-end space-x-2 bg-slate-50 border border-slate-200/90 rounded-3xl p-2 pl-4 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:bg-white transition-all shadow-xs">
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about sales, restock, expenses, customers, or reviews... (Enter to send)"
              className="flex-1 bg-transparent border-none text-xs text-slate-900 focus:outline-none resize-none max-h-32 py-2 font-medium"
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || loading}
              className="w-10 h-10 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/20 transition-all cursor-pointer active:scale-95"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

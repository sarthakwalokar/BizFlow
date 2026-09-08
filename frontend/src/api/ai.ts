import apiClient from './axios';

export interface AiMessage {
  id: number;
  role: 'USER' | 'ASSISTANT' | 'SYSTEM';
  content: string;
  providerUsed?: string;
  tokensUsed?: number;
  createdAt: string;
}

export interface AiChatRequest {
  conversationId?: number;
  message: string;
}

export interface AiChatResponse {
  conversationId: number;
  conversationTitle: string;
  userMessageId: number;
  assistantMessageId: number;
  reply: string;
  response?: string;
  providerUsed?: string;
  tokensUsed?: number;
  createdAt: string;
}

export interface AiConversationSummary {
  id: number;
  title: string;
  messageCount: number;
  lastMessagePreview?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AiConversationDetail {
  id: number;
  title: string;
  messages: AiMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface AiSuggestedQuestion {
  id: string;
  category: 'SALES' | 'INVENTORY' | 'EXPENSES' | 'REVIEWS' | 'CUSTOMERS' | 'STRATEGY';
  question: string;
  description: string;
  iconName: string;
  urgent: boolean;
}

export interface AiStatusResponse {
  enabled: boolean;
  activeProvider: string;
  availableProviders: string[];
  geminiAvailable: boolean;
  groqAvailable: boolean;
  openRouterAvailable: boolean;
  fallbackAvailable: boolean;
}

export const aiApi = {
  sendChatMessage: async (data: AiChatRequest): Promise<AiChatResponse> => {
    const res = await apiClient.post('/ai/chat', data);
    const responseData = res.data.data;
    if (responseData && !responseData.reply && responseData.response) {
      responseData.reply = responseData.response;
    }
    return responseData;
  },

  getConversations: async (): Promise<AiConversationSummary[]> => {
    const res = await apiClient.get('/ai/conversations');
    return res.data.data || [];
  },

  getConversationDetail: async (id: number): Promise<AiConversationDetail> => {
    const res = await apiClient.get(`/ai/conversations/${id}`);
    return res.data.data;
  },

  deleteConversation: async (id: number): Promise<void> => {
    await apiClient.delete(`/ai/conversations/${id}`);
  },

  getSuggestedQuestions: async (): Promise<AiSuggestedQuestion[]> => {
    const res = await apiClient.get('/ai/suggestions');
    return res.data.data || [];
  },

  getAiStatus: async (): Promise<AiStatusResponse> => {
    const res = await apiClient.get('/ai/status');
    return res.data.data;
  },
};

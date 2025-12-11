import apiClient from '../lib/api';

export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  timestamp?: string;
}

export interface ChatRequest {
  message: string;
  history?: ChatMessage[];
}

export interface ChatResponse {
  success: boolean;
  data: {
    response: string;
    timestamp: string;
  };
  error?: string;
}

export const sendChatMessage = async (
  message: string,
  history: ChatMessage[] = []
): Promise<string> => {
  try {
    const response = await apiClient.post<ChatResponse>('/openai/chat', {
      message,
      history
    });

    if (response.data.success) {
      return response.data.data.response;
    }

    throw new Error(response.data.error || 'Failed to get bot response');
  } catch (error: unknown) {
    console.error('OpenAI service error:', error);
    
    if (error && typeof error === 'object' && 'response' in error) {
      const err = error as { response?: { data?: { error?: string; message?: string } } };
      throw new Error(err.response?.data?.error || err.response?.data?.message || 'Failed to send message');
    }
    
    throw error;
  }
};


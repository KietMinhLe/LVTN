import { useState, useRef, useEffect } from 'react';
import { sendChatMessage, type ChatMessage } from '../services/openaiService';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { Button } from './ui/button';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      text: 'Xin chào! Tôi là trợ lý AI của cửa hàng sách. Tôi có thể giúp gì cho bạn?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      text: input.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input.trim();
    setInput('');
    setLoading(true);

    try {
      // Chuyển đổi messages sang format history cho API (bỏ qua greeting message)
      const history = messages
        .slice(1) // Bỏ qua greeting message đầu tiên
        .map(msg => ({
          role: msg.role,
          text: msg.text
        }));
      
      console.log('Sending chat message:', currentInput);
      console.log('History:', history);
      
      const response = await sendChatMessage(currentInput, history);
      
      const botMessage: ChatMessage = {
        role: 'assistant',
        text: response || 'Không nhận được phản hồi từ bot.',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error: unknown) {
      console.error('Chat error:', error);

      // Luôn hiển thị phản hồi, ngay cả khi có lỗi
      let errorText = 'Xin lỗi, tôi gặp sự cố khi xử lý câu hỏi của bạn. Vui lòng thử lại sau hoặc liên hệ trực tiếp với chúng tôi để được hỗ trợ.';

      if (error && typeof error === 'object') {
        const err = error as { message?: string; response?: { data?: { error?: string; data?: { response?: string } } } };
        console.error('Error details:', {
          message: err.message,
          response: err.response?.data
        });

        // Nếu có response từ server (ngay cả khi có error), sử dụng nó
        if (err.response?.data?.data?.response) {
          errorText = err.response.data.data.response;
        } else if (err.response?.data?.error) {
          // Nếu là lỗi rate limit hoặc quota, hiển thị thông báo thân thiện
          const errorMsg = err.response.data.error;
          if (errorMsg.includes('quota') || errorMsg.includes('giới hạn') || errorMsg.includes('rate limit')) {
            errorText = 'Hiện tại hệ thống đang quá tải. Vui lòng thử lại sau vài phút. Cảm ơn bạn đã kiên nhẫn!';
          } else {
            errorText = `Xin lỗi: ${errorMsg}`;
          }
        } else if (err.message) {
          errorText = `Xin lỗi: ${err.message}`;
        }
      }

      const errorMessage: ChatMessage = {
        role: 'assistant',
        text: errorText,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center z-50 transition-all hover:scale-110"
          aria-label="Open chat"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white dark:bg-gray-800 rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-blue-600 dark:bg-blue-700">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-white" />
              <h3 className="font-semibold text-white">Trợ lý AI</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-700 rounded-lg px-4 py-2 border border-gray-200 dark:border-gray-600">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Nhập câu hỏi của bạn..."
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                disabled={loading}
              />
              <Button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="px-4 bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;


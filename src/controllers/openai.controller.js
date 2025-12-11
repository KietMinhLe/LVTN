import { chatWithOpenAI } from '../services/openai.service.js';

/**
 * Controller xử lý chat với OpenAI
 */
export const chat = async (req, res) => {
    try {
        const { message, history = [] } = req.body;

        console.log('Received OpenAI chat request:', {
            message: message?.substring(0, 50),
            historyLength: history?.length || 0
        });

        // Validate input
        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Message is required and must be a non-empty string'
            });
        }

        // Gửi tin nhắn đến OpenAI (service sẽ tự xử lý lỗi và trả về fallback nếu cần)
        const response = await chatWithOpenAI(message.trim(), history || []);

        // Luôn trả về success vì service đã xử lý fallback
        res.json({
            success: true,
            data: {
                response: response || 'Xin lỗi, tôi không thể trả lời câu hỏi này lúc này. Vui lòng thử lại sau.',
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('OpenAI chat error:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });

        // Trả về fallback response ngay cả khi có lỗi không mong đợi
        res.json({
            success: true,
            data: {
                response: 'Xin lỗi, hệ thống đang gặp sự cố kỹ thuật. Vui lòng thử lại sau hoặc liên hệ trực tiếp với chúng tôi để được hỗ trợ.',
                timestamp: new Date().toISOString()
            }
        });
    }
};


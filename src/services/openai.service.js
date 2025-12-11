import OpenAI from 'openai';
import { searchBooks, getBestSellingBooks, getNewestBooks, getBooksByCategory, formatBooksForResponse } from './bookSearch.service.js';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
    console.warn('OPENAI_API_KEY không được cấu hình trong biến môi trường');
}

const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
});

/**
 * Gửi tin nhắn đến OpenAI ChatGPT và nhận phản hồi
 * @param {string} message - Nội dung tin nhắn
 * @param {Array} conversationHistory - Lịch sử hội thoại
 * @returns {Promise<string>} - Phản hồi từ AI
 */
/**
 * Retry logic với exponential backoff
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const retryWithBackoff = async (fn, maxRetries = 2, baseDelay = 500) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            // Kiểm tra nếu là lỗi quota (insufficient_quota) - không retry, throw ngay
            const errorCode = error.code || error.response?.data?.error?.code;
            if (errorCode === 'insufficient_quota' || error.message?.includes('quota')) {
                console.log('Quota exceeded, skipping retry');
                throw error;
            }

            // Nếu là lỗi 429 (rate limit) và chưa hết retry, retry với delay ngắn hơn
            if (error.status === 429 && i < maxRetries - 1) {
                const delay = baseDelay * Math.pow(2, i); // 500ms, 1000ms
                console.log(`Rate limit hit, retrying after ${delay}ms...`);
                await sleep(delay);
                continue;
            }
            throw error;
        }
    }
};

/**
 * Trích xuất từ khóa tìm kiếm từ câu hỏi
 */
const extractSearchKeywords = (message) => {
    const lowerMessage = message.toLowerCase().trim();

    // Loại bỏ các từ không cần thiết (ít hơn để giữ lại nhiều từ khóa hơn)
    const stopWords = ['tìm', 'kiếm', 'có', 'bán', 'mua', 'giá', 'của', 'về', 'cho', 'tôi', 'bạn', 'cần', 'muốn', 'là', 'gì', 'nào', 'đâu', 'thế', 'như', 'và', 'hoặc', 'hay', 'hoặc', 'với', 'trong', 'từ'];

    // Tách từ và lọc
    let words = lowerMessage.split(/\s+/).filter(word => {
        const cleanWord = word.replace(/[.,!?;:]/g, '').trim();
        return cleanWord.length >= 2 && !stopWords.includes(cleanWord);
    });

    // Nếu không có từ nào sau khi lọc, thử lấy toàn bộ câu (trừ các từ đầu tiên thường là câu hỏi)
    if (words.length === 0) {
        // Loại bỏ các từ đầu câu hỏi thường gặp
        const questionStarters = ['bạn', 'anh', 'chị', 'em', 'cô', 'chú', 'ông', 'bà', 'xin', 'chào', 'hello', 'hi', 'hey'];
        words = lowerMessage.split(/\s+/).filter(word => {
            const cleanWord = word.replace(/[.,!?;:]/g, '').trim();
            return cleanWord.length >= 2 && !questionStarters.includes(cleanWord);
        });
    }

    const keyword = words.join(' ').trim();

    // Nếu vẫn rỗng, thử lấy 2-3 từ cuối cùng của câu
    if (!keyword || keyword.length < 2) {
        const allWords = lowerMessage.split(/\s+/).filter(w => w.length >= 2);
        if (allWords.length > 0) {
            // Lấy 2-3 từ cuối cùng
            return allWords.slice(-3).join(' ').trim();
        }
        // Cuối cùng, trả về toàn bộ câu (đã lowercase)
        return lowerMessage.replace(/[.,!?;:]/g, '').trim();
    }

    return keyword;
};

/**
 * Tạo phản hồi fallback dựa trên câu hỏi và database
 */
const generateFallbackResponse = async (message) => {
    const lowerMessage = message.toLowerCase();

    // LUÔN thử tìm kiếm database trước, không chỉ khi có từ khóa cụ thể
    // Trích xuất từ khóa tìm kiếm từ toàn bộ câu hỏi
    const keyword = extractSearchKeywords(message);
    console.log('Extracted keyword:', keyword);

    // Kiểm tra các trường hợp đặc biệt trước
    if (lowerMessage.includes('bán chạy') || lowerMessage.includes('phổ biến') || lowerMessage.includes('nổi tiếng') || lowerMessage.includes('best seller')) {
        const books = await getBestSellingBooks(5);
        if (books && books.length > 0) {
            return `Đây là những cuốn sách bán chạy nhất:\n\n${formatBooksForResponse(books)}`;
        }
    }

    // Nếu hỏi về sách mới
    if (lowerMessage.includes('mới') || lowerMessage.includes('mới nhất') || lowerMessage.includes('mới ra')) {
        const books = await getNewestBooks(5);
        if (books && books.length > 0) {
            return `Đây là những cuốn sách mới nhất:\n\n${formatBooksForResponse(books)}`;
        }
    }

    // Tìm theo danh mục
    const categoryKeywords = ['tiểu thuyết', 'truyện', 'khoa học', 'lịch sử', 'văn học', 'kinh tế', 'kỹ năng', 'thiếu nhi', 'giáo dục', 'văn hóa', 'nghệ thuật', 'công nghệ', 'y học', 'sức khỏe'];
    for (const category of categoryKeywords) {
        if (lowerMessage.includes(category)) {
            const books = await getBooksByCategory(category, 5);
            if (books && books.length > 0) {
                return `Đây là những cuốn sách về ${category}:\n\n${formatBooksForResponse(books)}`;
            }
        }
    }

    // Nếu có từ khóa (dù ngắn), LUÔN thử tìm kiếm database
    if (keyword && keyword.length >= 2) {
        console.log('Searching books with keyword:', keyword);
        const books = await searchBooks(keyword, 5);

        if (books && books.length > 0) {
            return formatBooksForResponse(books);
        }

        // Nếu không tìm thấy với keyword đầy đủ, thử tìm với từng từ riêng lẻ
        const words = keyword.split(/\s+/).filter(w => w.length >= 3);
        if (words.length > 1) {
            for (const word of words) {
                const books = await searchBooks(word, 3);
                if (books && books.length > 0) {
                    return `Tôi tìm thấy một số sách liên quan đến "${word}":\n\n${formatBooksForResponse(books)}`;
                }
            }
        }
    }

    // Nếu câu hỏi có liên quan đến sách nhưng không tìm thấy, trả về sách bán chạy
    if (lowerMessage.includes('sách') || lowerMessage.includes('book') ||
        lowerMessage.includes('tìm') || lowerMessage.includes('kiếm') ||
        lowerMessage.includes('có') || lowerMessage.includes('bán') ||
        lowerMessage.includes('mua') || lowerMessage.includes('giới thiệu')) {

        const books = await getBestSellingBooks(5);
        if (books && books.length > 0) {
            return `Tôi không tìm thấy sách cụ thể phù hợp với câu hỏi của bạn. Đây là một số sách bán chạy mà bạn có thể quan tâm:\n\n${formatBooksForResponse(books)}\n\nBạn có thể tìm kiếm chi tiết hơn trên website của chúng tôi.`;
        }
    }

    if (lowerMessage.includes('đơn hàng') || lowerMessage.includes('order')) {
        return 'Bạn có thể kiểm tra đơn hàng của mình trong phần "Đơn hàng của tôi" sau khi đăng nhập. Nếu cần hỗ trợ về đơn hàng, vui lòng liên hệ với chúng tôi qua email hoặc số điện thoại hỗ trợ.';
    }

    if (lowerMessage.includes('giá') || lowerMessage.includes('price') || lowerMessage.includes('cost')) {
        // Thử tìm sách nếu có tên sách trong câu hỏi
        const keyword = extractSearchKeywords(message);
        if (keyword && keyword.length > 2) {
            const books = await searchBooks(keyword, 3);
            if (books && books.length > 0) {
                let response = 'Giá của các sách bạn tìm:\n\n';
                books.forEach(book => {
                    const price = parseFloat(book.gia_ban) || 0;
                    const formattedPrice = new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                    }).format(price);
                    response += `- **${book.ten_sach}**: ${formattedPrice}\n`;
                });
                return response;
            }
        }
        return 'Giá sách được hiển thị trên từng trang sản phẩm. Bạn có thể xem giá và các chương trình khuyến mãi khi xem chi tiết sách.';
    }

    if (lowerMessage.includes('giao hàng') || lowerMessage.includes('shipping') || lowerMessage.includes('delivery')) {
        return 'Chúng tôi hỗ trợ giao hàng trên toàn quốc. Thời gian giao hàng và phí vận chuyển sẽ được hiển thị khi bạn tiến hành thanh toán.';
    }

    if (lowerMessage.includes('thanh toán') || lowerMessage.includes('payment') || lowerMessage.includes('pay')) {
        return 'Chúng tôi hỗ trợ nhiều phương thức thanh toán như VNPay, SePay, và thanh toán khi nhận hàng (COD). Bạn có thể chọn phương thức thanh toán phù hợp khi đặt hàng.';
    }

    // Nếu là câu chào hỏi đơn giản
    if (lowerMessage.includes('xin chào') || lowerMessage === 'hi' || lowerMessage === 'hello' ||
        lowerMessage === 'hey' || lowerMessage.includes('chào')) {
        return 'Xin chào! Tôi là trợ lý AI của cửa hàng sách. Tôi có thể giúp bạn tìm kiếm sách, kiểm tra giá, hoặc trả lời các câu hỏi về đơn hàng. Bạn cần hỗ trợ gì?';
    }

    // Phản hồi mặc định - LUÔN thử tìm kiếm với toàn bộ câu hỏi trước
    if (keyword && keyword.length >= 2) {
        console.log('Final attempt - searching with keyword:', keyword);
        const books = await searchBooks(keyword, 3);
        if (books && books.length > 0) {
            return `Tôi tìm thấy một số sách có thể liên quan:\n\n${formatBooksForResponse(books)}`;
        }

        // Thử với sách bán chạy như một gợi ý
        const bestBooks = await getBestSellingBooks(3);
        if (bestBooks && bestBooks.length > 0) {
            return `Xin chào! Tôi không tìm thấy sách cụ thể phù hợp với câu hỏi của bạn. Đây là một số sách bán chạy:\n\n${formatBooksForResponse(bestBooks)}\n\nBạn có thể hỏi tôi về sách cụ thể, giá cả, hoặc tìm kiếm trên website.`;
        }
    }

    return 'Xin chào! Tôi là trợ lý AI của cửa hàng sách. Bạn có thể hỏi tôi về sách (ví dụ: "Tìm sách về lịch sử", "Sách bán chạy", "Giá sách..."), đơn hàng, hoặc các dịch vụ khác. Tôi sẽ cố gắng hỗ trợ bạn tốt nhất có thể!';
};

export const chatWithOpenAI = async (message, conversationHistory = []) => {
    try {
        console.log('=== OPENAI SERVICE START ===');
        console.log('Message:', message);
        console.log('History length:', conversationHistory?.length || 0);

        // Tạo system message cho bot về cửa hàng sách
        const systemMessage = {
            role: 'system',
            content: `Bạn là trợ lý AI thân thiện của một cửa hàng sách online. 
Trả lời bằng tiếng Việt một cách ngắn gọn và hữu ích.
Nếu được hỏi về sách, hướng dẫn khách hàng tìm kiếm trên website.
Nếu được hỏi về đơn hàng, hướng dẫn kiểm tra trong phần "Đơn hàng của tôi".
Hãy luôn lịch sự và chuyên nghiệp.`
        };

        // Xây dựng messages array
        const messages = [systemMessage];

        // Thêm lịch sử hội thoại (bỏ qua greeting message)
        if (conversationHistory && conversationHistory.length > 0) {
            conversationHistory.forEach(msg => {
                const text = msg.text || msg.content || '';
                // Bỏ qua greeting message
                if (text && !text.includes('Xin chào! Tôi là trợ lý AI')) {
                    messages.push({
                        role: msg.role === 'user' ? 'user' : 'assistant',
                        content: text
                    });
                }
            });
        }

        // Thêm tin nhắn hiện tại
        messages.push({
            role: 'user',
            content: message
        });

        console.log('Sending request to OpenAI...');

        // Kiểm tra nếu có thể gọi API ngay (không retry nếu biết sẽ lỗi quota)
        try {
            // Gọi OpenAI API với retry logic (chỉ retry cho rate limit, không retry cho quota)
            const completion = await retryWithBackoff(async () => {
                return await openai.chat.completions.create({
                    model: 'gpt-3.5-turbo',
                    messages: messages,
                    temperature: 0.7,
                    max_tokens: 500,
                });
            }, 1, 0); // Chỉ 1 lần thử, không delay (vì nếu quota thì retry cũng vô ích)

            const response = completion.choices[0]?.message?.content || 'Không nhận được phản hồi từ AI.';

            console.log('OpenAI Response:', response.substring(0, 100));
            console.log('=== OPENAI SERVICE END ===');

            return response.trim();
        } catch (apiError) {
            // Nếu lỗi ngay từ đầu, throw để catch block bên ngoài xử lý
            throw apiError;
        }
    } catch (error) {
        console.error('=== OPENAI ERROR ===');
        console.error('Error message:', error.message);
        console.error('Error status:', error.status);
        console.error('Error code:', error.code);
        console.error('Error type:', error.type);

        // Kiểm tra các loại lỗi cụ thể
        const errorStatus = error.status || error.response?.status;
        const errorCode = error.code || error.response?.data?.error?.code;
        const errorType = error.type || error.response?.data?.error?.type;
        const errorMessage = error.message || '';

        // Xử lý lỗi quota (insufficient_quota) - không retry, dùng fallback ngay
        if (errorCode === 'insufficient_quota' ||
            errorType === 'insufficient_quota' ||
            errorMessage.includes('quota') ||
            errorMessage.includes('billing') ||
            errorMessage.includes('exceeded your current quota')) {
            console.warn('Quota exceeded, using fallback response with database');
            return await generateFallbackResponse(message);
        }

        // Xử lý lỗi 429 (rate limit) - trả về fallback response
        if (errorStatus === 429 || errorCode === 'rate_limit_exceeded' || errorMessage.includes('rate_limit')) {
            console.warn('Rate limit exceeded, using fallback response with database');
            return await generateFallbackResponse(message);
        }

        // Xử lý lỗi 401 (unauthorized)
        if (errorStatus === 401 || errorMessage.includes('api_key')) {
            console.error('API key error, using fallback response with database');
            return await generateFallbackResponse(message);
        }

        // Với các lỗi khác, cũng trả về fallback response thay vì throw error
        console.warn('OpenAI API error, using fallback response with database:', errorMessage);
        return await generateFallbackResponse(message);
    }
};


// Cấu hình SePay
// Sử dụng 1 URL ngrok cho tất cả (ngrok trỏ về frontend)
const ngrokUrl = process.env.NGROK_URL || process.env.SEPAY_NGROK_URL || "https://unplowed-brigette-caliginously.ngrok-free.dev";

// Hàm validate và sanitize URL
const validateUrl = (url) => {
    if (!url) return null;
    try {
        const urlObj = new URL(url);
        // Đảm bảo URL hợp lệ và là HTTPS (hoặc HTTP cho localhost)
        if (urlObj.protocol !== 'https:' && urlObj.protocol !== 'http:') {
            console.warn(`Invalid URL protocol: ${url}`);
            return null;
        }
        return urlObj.toString().replace(/\/$/, ''); // Loại bỏ trailing slash
    } catch (error) {
        console.error(`Invalid URL format: ${url}`, error);
        return null;
    }
};

// Validate và sanitize ngrok URL
const validatedNgrokUrl = validateUrl(ngrokUrl) || ngrokUrl;

// Dùng cùng 1 URL ngrok cho tất cả
// Frontend sẽ proxy các request /sepay/return và /ipn đến backend localhost:5000
export const sepayConfig = {
    merchant_id: process.env.SEPAY_MERCHANT_ID || "SP-TEST-KMB54598",
    secret_key: process.env.SEPAY_SECRET_KEY || "spsk_test_e5k5fFomdZpDBQxcmVUbmjA9vJzPsxDp",
    env: process.env.SEPAY_ENV || "sandbox", // sandbox hoặc production
    ngrok_url: validatedNgrokUrl,
    return_url: `${validatedNgrokUrl}/sepay/return`, // Frontend sẽ proxy đến backend
    webhook_url: `${validatedNgrokUrl}/ipn`, // Frontend sẽ proxy đến backend
    frontend_url: validatedNgrokUrl // Website bán sách - dùng cùng ngrok URL
};

// Helper function để tạo redirect URL an toàn
export const createRedirectUrl = (path, params = {}) => {
    try {
        const baseUrl = sepayConfig.frontend_url;
        
        // Đảm bảo path bắt đầu bằng /
        const normalizedPath = path.startsWith('/') ? path : `/${path}`;
        
        // Tạo URL đúng cách
        const url = new URL(normalizedPath, baseUrl);
        
        // Thêm query params
        Object.keys(params).forEach(key => {
            if (params[key] !== null && params[key] !== undefined) {
                url.searchParams.append(key, params[key].toString());
            }
        });
        
        const finalUrl = url.toString();
        console.log('Creating redirect URL:', finalUrl);
        return finalUrl;
    } catch (error) {
        console.error('Error creating redirect URL:', error);
        console.error('Base URL:', sepayConfig.frontend_url);
        console.error('Path:', path);
        // Fallback URL - đảm bảo có / ở đầu
        const normalizedPath = path.startsWith('/') ? path : `/${path}`;
        const fallbackUrl = `${sepayConfig.frontend_url}${normalizedPath}`;
        // Thêm query params vào fallback URL
        const queryString = Object.keys(params)
            .filter(key => params[key] !== null && params[key] !== undefined)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key].toString())}`)
            .join('&');
        return queryString ? `${fallbackUrl}?${queryString}` : fallbackUrl;
    }
};

console.log('SePay Config initialized:');
console.log('- Frontend URL:', sepayConfig.frontend_url);
console.log('- Return URL:', sepayConfig.return_url);
console.log('- Webhook URL:', sepayConfig.webhook_url);

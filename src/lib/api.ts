import axios from 'axios';

// Cấu hình base URL cho API backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Tạo instance axios với cấu hình mặc định
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout (tăng lên để đủ cho OpenAI API)
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
  },
});

console.log('API Client initialized with baseURL:', API_BASE_URL);

// Interceptor để thêm token vào header nếu có
apiClient.interceptors.request.use(
  (config) => { // Interceptor để thêm token vào header nếu có
    // Kiểm tra URL để quyết định dùng token nào
    const url = config.url || '';
    const adminToken = localStorage.getItem('admin_token');
    const userToken = localStorage.getItem('user_token');
    
    // Kiểm tra xem có phải API admin gọi API khachhang không
    const isAdminKhachHangApi = adminToken && (
      url.includes('/toggle-status') || 
      (url.startsWith('/khachhang/') && url.match(/\/khachhang\/\d+$/)) ||
      url === '/khachhang' ||
      url.startsWith('/khachhang?') ||
      url.startsWith('/khachhang/search') ||
      url.startsWith('/khachhang/sort')
    );
    
    // Nếu là API admin, dùng admin_token
    if (url.startsWith('/admin')) {
      if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
      }
    } 
    // Nếu là API khachhang nhưng admin đang gọi (có admin_token và là API quản lý)
    else if (isAdminKhachHangApi) {
      if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
      }
    }
    // Nếu là API khachhang thông thường (user gọi), dùng user_token
    else if (url.startsWith('/khachhang')) {
      if (userToken) {
        config.headers.Authorization = `Bearer ${userToken}`;
      }
    }
    // Với các API khác, ưu tiên admin_token, nếu không có thì dùng user_token
    else {
      if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
      } else if (userToken) {
        config.headers.Authorization = `Bearer ${userToken}`;
      }
    }
    
    console.log('API Request:', config.method?.toUpperCase(), config.url, { // Log request
      baseURL: config.baseURL, // Log baseURL
      data: config.data, // Log data
      headers: config.headers // Log headers
    });
    return config; // Return config
  },
  (error) => { // Interceptor để xử lý lỗi request
    console.error('API Request Error:', error);
    return Promise.reject(error); // Return error
  }
);

// Interceptor để xử lý lỗi response
apiClient.interceptors.response.use(
  (response) => { // Interceptor để xử lý response
    console.log('API Response:', response.config.method?.toUpperCase(), response.config.url, 'Status:', response.status);
    return response; // Return response
  },
  (error) => { // Interceptor để xử lý lỗi response
    // Kiểm tra loại lỗi
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      console.error('❌ API Timeout - Backend không phản hồi kịp thời'); // Log error
      console.error('Hãy kiểm tra xem backend có đang chạy tại:', API_BASE_URL); // Log baseURL
    } else if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
      console.error('❌ Network Error - Không thể kết nối đến backend'); // Log error
      console.error('URL đang cố kết nối:', API_BASE_URL); // Log baseURL
      console.error('Hãy đảm bảo backend đang chạy tại:', API_BASE_URL); // Log baseURL
    } else {
      console.error('API Error:', { // Log error
        url: error.config?.url, // Log url
        method: error.config?.method, // Log method
        status: error.response?.status, // Log status
        statusText: error.response?.statusText, // Log statusText
        data: error.response?.data, // Log data
        message: error.message, // Log message
        code: error.code // Log code
      });
    }

    // Kiểm tra nếu status là 403 (Tài khoản bị khóa)
    if (error.response?.status === 403 && error.response?.data?.code === 'ACCOUNT_LOCKED') {
      const url = error.config?.url || '';
      
      // Nếu là API khachhang, chỉ hiển thị thông báo, không đăng xuất
      if (url.startsWith('/khachhang') && url !== '/khachhang/login' && url !== '/khachhang/register') {
        // Không đăng xuất, chỉ để component xử lý lỗi
        // Component sẽ hiển thị thông báo và ngăn chặn các hành động tiếp theo
        console.warn('Tài khoản đã bị khóa:', error.response.data.message);
        // Không redirect, không xóa token - để user vẫn ở trang hiện tại
      }
    }
    // Kiểm tra nếu status là 401 (Token không hợp lệ hoặc hết hạn)
    else if (error.response?.status === 401) {
      const url = error.config?.url || '';
      const adminToken = localStorage.getItem('admin_token');
      
      // Kiểm tra xem có phải admin đang gọi API khachhang không
      const isAdminKhachHangApi = adminToken && (
        url.includes('/toggle-status') || 
        (url.startsWith('/khachhang/') && url.match(/\/khachhang\/\d+$/)) ||
        url === '/khachhang' ||
        url.startsWith('/khachhang?') ||
        url.startsWith('/khachhang/search') ||
        url.startsWith('/khachhang/sort')
      );
      
      // Nếu là API admin hoặc admin đang gọi API khachhang
      if (url.startsWith('/admin') || isAdminKhachHangApi) {
        if (url !== '/admin/login') {
          localStorage.removeItem('admin_token'); // Xóa token từ localStorage
          localStorage.removeItem('admin_info'); // Xóa admin từ localStorage
          if (window.location.pathname !== '/admin/login' && !window.location.pathname.startsWith('/admin/')) {
            // Chỉ redirect nếu không đang ở trang admin
            window.location.href = '/admin/login'; // Redirect về trang login admin
          }
        }
      }
      // Nếu là API khachhang thông thường (user gọi) và không phải đang login/register
      else if (url.startsWith('/khachhang') && url !== '/khachhang/login' && url !== '/khachhang/register') {
        localStorage.removeItem('user_token'); // Xóa token từ localStorage
        localStorage.removeItem('user_info'); // Xóa user từ localStorage
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          window.location.href = '/login'; // Redirect về trang login user
        }
      }
    }
    return Promise.reject(error); // Return error
  }
);

export default apiClient;


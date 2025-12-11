import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Khởi tạo theme khi app load
const initializeTheme = () => {
  const savedTheme = localStorage.getItem('theme'); // Lấy theme từ localStorage
  const root = document.documentElement; // Lấy root element
  
  if (savedTheme === 'dark') {
    root.classList.add('dark'); // Thêm class dark vào root element
  } else if (savedTheme === 'light') {
    root.classList.remove('dark'); // Xóa class dark vào root element
  } else {
    // Kiểm tra system preference nếu chưa có lưu vào localStorage
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark'); // Lưu theme vào localStorage
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light'); // Lưu theme vào localStorage
    }
  }
}; // Hàm khởi tạo theme

initializeTheme(); // Khởi tạo theme khi app load

createRoot(document.getElementById('root')!).render( // Render app
  <StrictMode>
    <App />
  </StrictMode>,
);
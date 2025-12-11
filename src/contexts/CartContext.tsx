import { useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { getChiTietGioHangByGioHangId, type ChiTietGioHang } from '../services/chiTietGioHangService';
import { getOrCreateGioHang } from '../services/gioHangService';
import { CartContext, type CartContextType } from './cartContext';

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [cartItems, setCartItems] = useState<ChiTietGioHang[]>([]); // Danh sách sản phẩm trong giỏ hàng
  const [gioHangId, setGioHangId] = useState<number | null>(null); // ID giỏ hàng
  const [loading, setLoading] = useState(true); // Trạng thái loading

  const loadCart = useCallback(async () => { // Hàm load giỏ hàng
    try {
      // Lấy giỏ hàng ID từ localStorage
      const savedGioHangId = localStorage.getItem('gio_hang_id');
      
      if (savedGioHangId) {
        const id = parseInt(savedGioHangId); // Chuyển ID sang số nguyên
        setGioHangId(id); // Set ID giỏ hàng
        
        // Load chi tiết giỏ hàng
        const items = await getChiTietGioHangByGioHangId(id); // Load chi tiết giỏ hàng
        setCartItems(items || []); // Set danh sách sản phẩm trong giỏ hàng
      } else {
        // Lấy khách hàng ID nếu có (user đã đăng nhập)
        const khachHangInfo = localStorage.getItem('khach_hang_info');
        let khachHangId: number | undefined; // ID khách hàng
        if (khachHangInfo) {
          try {
            const parsed = JSON.parse(khachHangInfo); // Chuyển JSON sang object
            // UserInfo có field 'id' chứ không phải 'khach_hang_id'
            khachHangId = parsed.id || parsed.khach_hang_id; // Set ID khách hàng
          } catch {
            // Ignore parse error (nếu lỗi thì không set ID khách hàng)
          }
        }

        // Nếu user chưa đăng nhập, tạo session ID
        let sessionId: string | undefined; // Session ID
        if (!khachHangId) {
          sessionId = sessionStorage.getItem('session_id') || undefined; // Lấy session ID từ localStorage
          if (!sessionId) {
            sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`; // Tạo session ID mới
            sessionStorage.setItem('session_id', sessionId); // Lưu session ID vào localStorage
          }
        }

        // Tạo hoặc lấy giỏ hàng (backend sẽ trả về giỏ hàng cũ nếu user đã có)
        const gioHang = await getOrCreateGioHang(khachHangId, sessionId); // Tạo hoặc lấy giỏ hàng
        localStorage.setItem('gio_hang_id', gioHang.gio_hang_id.toString()); // Lưu ID giỏ hàng vào localStorage
        setGioHangId(gioHang.gio_hang_id); // Set ID giỏ hàng
        
        // Load chi tiết giỏ hàng
        const items = await getChiTietGioHangByGioHangId(gioHang.gio_hang_id); // Load chi tiết giỏ hàng
        setCartItems(items || []); // Set danh sách sản phẩm trong giỏ hàng
      }
    } catch (error) {
      console.error('Error loading cart:', error); // Log lỗi
      setCartItems([]); // Set danh sách sản phẩm trong giỏ hàng trống            
    } finally {
      setLoading(false); // Set trạng thái loading thành false
    }
  }, []); // Hàm load giỏ hàng

  const refreshCart = useCallback(async () => { // Hàm refresh giỏ hàng
    if (!gioHangId) { // Nếu không có ID giỏ hàng
      await loadCart(); // Load giỏ hàng
      return; // Trả về
    }

    try {
      const items = await getChiTietGioHangByGioHangId(gioHangId); // Load chi tiết giỏ hàng
      setCartItems(items || []); // Set danh sách sản phẩm trong giỏ hàng
    } catch (error) {
      console.error('Error refreshing cart:', error);
    }
  }, [gioHangId, loadCart]); // Hàm refresh giỏ hàng

  useEffect(() => { // Sự kiện load giỏ hàng
    loadCart(); // Load giỏ hàng
  }, [loadCart]); // Sự kiện load giỏ hàng

  // Lắng nghe sự kiện storage để cập nhật giỏ hàng khi có thay đổi
  useEffect(() => { // Sự kiện load giỏ hàng
    const handleStorageChange = () => { // Hàm xử lý sự kiện storage
      const savedGioHangId = localStorage.getItem('gio_hang_id'); // Lấy ID giỏ hàng từ localStorage
      // Nếu gio_hang_id bị xóa (khi logout), reset giỏ hàng
      if (!savedGioHangId && gioHangId) {
        setGioHangId(null);
        setCartItems([]);
      } else if (savedGioHangId && parseInt(savedGioHangId) !== gioHangId) {
        loadCart();
      } else if (savedGioHangId && parseInt(savedGioHangId) === gioHangId) {
        refreshCart();
      }
    };

    const handleUserLogin = async () => {
      // Khi user đăng nhập, load lại giỏ hàng của user từ backend
      // Backend sẽ trả về giỏ hàng cũ nếu user đã có giỏ hàng
      setGioHangId(null);
      setCartItems([]);
      await loadCart();
    };

    window.addEventListener('storage', handleStorageChange);
    // Custom event để refresh cart trong cùng tab
    window.addEventListener('cartUpdated', handleStorageChange);
    // Custom event khi user logout
    window.addEventListener('userLogout', handleStorageChange);
    // Custom event khi user login
    window.addEventListener('userLogin', handleUserLogin);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleStorageChange);
      window.removeEventListener('userLogout', handleStorageChange);
      window.removeEventListener('userLogin', handleUserLogin);
    };
  }, [gioHangId, loadCart, refreshCart]);

  const cartCount = cartItems.reduce((sum, item) => sum + item.so_luong, 0);

  const getCartTotal = useCallback(() => {
    return cartItems.reduce((total, item) => {
      const price = item.sach?.gia_ban ? parseFloat(item.sach.gia_ban.toString()) : 0;
      return total + (price * item.so_luong);
    }, 0);
  }, [cartItems]);

  const value: CartContextType = {
    cartItems,
    cartCount,
    gioHangId,
    loading,
    refreshCart,
    getCartTotal
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};


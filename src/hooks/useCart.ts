import { useCart as useCartContext } from './useCartContext';
import { getOrCreateGioHang } from '../services/gioHangService';
import { createChiTietGioHang } from '../services/chiTietGioHangService';
import { toast } from 'sonner';
import type { Sach } from '../services/sachService';

export const useAddToCart = () => {
  const { refreshCart, gioHangId } = useCartContext();

  const addToCart = async (book: Sach, quantity: number = 1) => {
    try {
      // Kiểm tra số lượng tồn kho
      if ((book.so_luong || 0) < quantity) {
        toast.error('Số lượng sách không đủ');
        return false;
      }

      if ((book.so_luong || 0) === 0) {
        toast.error('Sản phẩm đã hết hàng');
        return false;
      }

      let currentGioHangId = gioHangId;

      // Nếu chưa có giỏ hàng, tạo mới
      if (!currentGioHangId) {
        // Lấy hoặc tạo session ID
        let sessionId = sessionStorage.getItem('session_id');
        if (!sessionId) {
          sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          sessionStorage.setItem('session_id', sessionId);
        }

        // Lấy khách hàng ID từ localStorage nếu có
        const khachHangInfo = localStorage.getItem('khach_hang_info');
        let khachHangId: number | undefined;
        if (khachHangInfo) {
          try {
            const parsed = JSON.parse(khachHangInfo);
            khachHangId = parsed.khach_hang_id;
          } catch {
            // Ignore parse error
          }
        }

        // Tạo giỏ hàng mới
        const gioHang = await getOrCreateGioHang(khachHangId, sessionId);
        localStorage.setItem('gio_hang_id', gioHang.gio_hang_id.toString());
        currentGioHangId = gioHang.gio_hang_id;
      }

      // Thêm sách vào giỏ hàng
      await createChiTietGioHang({
        gio_hang_id: currentGioHangId,
        sach_id: book.sach_id,
        so_luong: quantity
      });

      // Refresh cart
      await refreshCart();

      // Dispatch custom event để các component khác cập nhật
      window.dispatchEvent(new Event('cartUpdated'));

      toast.success(`Đã thêm "${book.ten_sach}" vào giỏ hàng!`);
      return true;
    } catch (error: unknown) {
      console.error('Error adding to cart:', error);
      const axiosError = error as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage = axiosError.response?.data?.message || axiosError.message || 'Không thể thêm sách vào giỏ hàng';
      toast.error(errorMessage);
      return false;
    }
  };

  return { addToCart };
};


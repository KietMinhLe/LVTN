import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowLeft, 
  Loader2,
  ShoppingBag
} from 'lucide-react';
import { toast } from 'sonner';
import { updateChiTietGioHang, deleteChiTietGioHang, deleteAllChiTietGioHangByGioHangId } from '../../services/chiTietGioHangService';
import { useCart } from '../../hooks/useCartContext';

const UserGioHang = () => {
  const navigate = useNavigate();
  const { cartItems, gioHangId, loading, refreshCart } = useCart();
  const [updating, setUpdating] = useState<number | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(numPrice);
  };

  const getImageUrl = (url?: string | null) => {
    if (!url) return 'https://via.placeholder.com/300x400/6366f1/ffffff?text=No+Image';
    if (url.startsWith('http')) return url;
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    return `${apiBaseUrl}${url}`;
  };

  // Tự động chọn tất cả sản phẩm khi giỏ hàng được load
  useEffect(() => {
    if (cartItems.length > 0 && selectedItems.size === 0) {
      const allItemIds = new Set(cartItems.map(item => item.chi_tiet_gio_hang_id).filter(Boolean) as number[]);
      setSelectedItems(allItemIds);
    }
  }, [cartItems.length, selectedItems.size, cartItems]);

  const selectedCartItems = cartItems.filter(item => 
    item.chi_tiet_gio_hang_id && selectedItems.has(item.chi_tiet_gio_hang_id)
  );

  const calculateSubtotal = () => {
    return selectedCartItems.reduce((total, item) => {
      const price = item.sach?.gia_ban ? parseFloat(item.sach.gia_ban.toString()) : 0;
      return total + (price * item.so_luong);
    }, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal();
  };

  const handleUpdateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId);
      return;
    }

    setUpdating(itemId);
    try {
      await updateChiTietGioHang(itemId, { so_luong: newQuantity });
      await refreshCart();
      window.dispatchEvent(new Event('cartUpdated'));
      toast.success('Cập nhật số lượng thành công');
    } catch (error: unknown) {
      console.error('Error updating quantity:', error);
      const axiosError = error as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage = axiosError.response?.data?.message || axiosError.message || 'Không thể cập nhật số lượng';
      toast.error(errorMessage);
    } finally {
      setUpdating(null);
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    setUpdating(itemId);
    try {
      await deleteChiTietGioHang(itemId);
      await refreshCart();
      window.dispatchEvent(new Event('cartUpdated'));
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
    } catch (error: unknown) {
      console.error('Error removing item:', error);
      const axiosError = error as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage = axiosError.response?.data?.message || axiosError.message || 'Không thể xóa sản phẩm';
      toast.error(errorMessage);
    } finally {
      setUpdating(null);
    }
  };

  const handleClearCart = async () => {
    if (!gioHangId) return;
    
    if (!confirm('Bạn có chắc chắn muốn xóa tất cả sản phẩm trong giỏ hàng?')) {
      return;
    }

    setUpdating(-1);
    try {
      await deleteAllChiTietGioHangByGioHangId(gioHangId);
      await refreshCart();
      window.dispatchEvent(new Event('cartUpdated'));
      toast.success('Đã xóa tất cả sản phẩm');
    } catch (error: unknown) {
      console.error('Error clearing cart:', error);
      const axiosError = error as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage = axiosError.response?.data?.message || axiosError.message || 'Không thể xóa giỏ hàng';
      toast.error(errorMessage);
    } finally {
      setUpdating(null);
    }
  };

  const handleCheckout = () => {
    if (selectedItems.size === 0) {
      toast.error('Vui lòng chọn ít nhất một sản phẩm để thanh toán');
      return;
    }
    
    if (selectedCartItems.length === 0) {
      toast.error('Không có sản phẩm nào được chọn');
      return;
    }
    
    // Lưu danh sách sản phẩm được chọn vào localStorage
    const selectedItemIds = Array.from(selectedItems);
    localStorage.setItem('selectedCartItems', JSON.stringify(selectedItemIds));
    
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-slate-600">Đang tải giỏ hàng...</p>
        </div>
      </div>
    );
  }

  if (!gioHangId || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-blue-50">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <Button
            variant="outline"
            onClick={() => navigate('/books')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Tiếp tục mua sắm
          </Button>

          <Card className="border shadow-lg">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <ShoppingBag className="h-24 w-24 text-slate-300 dark:text-slate-700 mb-4" />
              <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-2">
                Giỏ hàng của bạn đang trống
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                Hãy thêm một số sản phẩm vào giỏ hàng để bắt đầu mua sắm
              </p>
              <Button onClick={() => navigate('/books')}>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Xem sản phẩm
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/books')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Tiếp tục mua sắm
            </Button>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <ShoppingCart className="h-8 w-8 text-primary" />
              Giỏ hàng
            </h1>
          </div>
          {cartItems.length > 0 && (
            <Button
              variant="outline"
              onClick={handleClearCart}
              disabled={updating === -1}
              className="text-destructive hover:text-destructive"
            >
              {updating === -1 ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Xóa tất cả
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {/* Select All */}
            {cartItems.length > 0 && (
              <Card className="border shadow-sm">
                <CardContent className="p-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedItems.size === cartItems.length && cartItems.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          const allItemIds = new Set(cartItems.map(item => item.chi_tiet_gio_hang_id).filter(Boolean) as number[]);
                          setSelectedItems(allItemIds);
                        } else {
                          setSelectedItems(new Set());
                        }
                      }}
                      className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-base font-semibold text-gray-700">
                      Chọn tất cả ({selectedItems.size}/{cartItems.length})
                    </span>
                  </label>
                </CardContent>
              </Card>
            )}
            
            {cartItems.map((item) => {
              const isSelected = item.chi_tiet_gio_hang_id ? selectedItems.has(item.chi_tiet_gio_hang_id) : false;
              return (
                <Card 
                  key={item.chi_tiet_gio_hang_id} 
                  className={`border shadow-sm transition-all ${
                    isSelected 
                      ? 'border-blue-400 bg-blue-50/30 shadow-md' 
                      : 'border-gray-200'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Checkbox */}
                      <div className="flex items-start pt-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (!item.chi_tiet_gio_hang_id) return;
                            const newSelected = new Set(selectedItems);
                            if (e.target.checked) {
                              newSelected.add(item.chi_tiet_gio_hang_id);
                            } else {
                              newSelected.delete(item.chi_tiet_gio_hang_id);
                            }
                            setSelectedItems(newSelected);
                          }}
                          className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                        />
                      </div>
                      
                      {/* Book Image */}
                      <div className="w-24 h-32 flex-shrink-0">
                        <img
                          src={getImageUrl(item.sach?.anh_bia_url)}
                          alt={item.sach?.ten_sach || 'Sách'}
                          className="w-full h-full object-cover rounded-md"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x400/6366f1/ffffff?text=No+Image';
                          }}
                        />
                      </div>

                    {/* Book Info */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">
                        {item.sach?.ten_sach || 'Tên sách không xác định'}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                        {item.sach?.tacgia?.ten_tac_gia || 'Tác giả không xác định'}
                      </p>
                      <p className="text-lg font-bold text-primary mb-4">
                        {formatPrice(item.sach?.gia_ban || 0)}
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 border rounded-md">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleUpdateQuantity(item.chi_tiet_gio_hang_id, item.so_luong - 1)}
                            disabled={updating === item.chi_tiet_gio_hang_id || item.so_luong <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-12 text-center font-medium">
                            {updating === item.chi_tiet_gio_hang_id ? (
                              <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                            ) : (
                              item.so_luong
                            )}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleUpdateQuantity(item.chi_tiet_gio_hang_id, item.so_luong + 1)}
                            disabled={updating === item.chi_tiet_gio_hang_id}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(item.chi_tiet_gio_hang_id)}
                          disabled={updating === item.chi_tiet_gio_hang_id}
                          className="text-destructive hover:text-destructive"
                        >
                          {updating === item.chi_tiet_gio_hang_id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Item Total */}
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">
                        {formatPrice(
                          (item.sach?.gia_ban ? parseFloat(item.sach.gia_ban.toString()) : 0) * item.so_luong
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="border shadow-lg sticky top-4">
              <CardHeader>
                <CardTitle>Tóm tắt đơn hàng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Số lượng sản phẩm đã chọn:</span>
                  <span className="font-medium">{selectedCartItems.reduce((sum, item) => sum + item.so_luong, 0)}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Tạm tính:</span>
                  <span className="font-medium">{formatPrice(calculateSubtotal())}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Tổng cộng:</span>
                    <span className="text-primary">{formatPrice(calculateTotal())}</span>
                  </div>
                </div>
                {selectedItems.size === 0 && (
                  <div className="text-center py-2 text-sm text-orange-600 bg-orange-50 rounded-lg border border-orange-200">
                    ⚠️ Vui lòng chọn ít nhất một sản phẩm
                  </div>
                )}
                <Button
                  className="w-full mt-6"
                  size="lg"
                  onClick={handleCheckout}
                  disabled={selectedItems.size === 0}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Thanh toán ({selectedItems.size})
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/books')}
                >
                  Tiếp tục mua sắm
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserGioHang;


import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  X, 
  Eye,
  Loader2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { useAddToCart } from '../hooks/useCart';
import type { Sach } from '../services/sachService';
import { useNavigate } from 'react-router-dom';

// Separator component inline
const Separator = ({ className = '' }: { className?: string }) => (
  <div className={`h-[1px] w-full bg-border ${className}`} />
);
interface AddToCartModalProps {
  book: Sach | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialQuantity?: number; // Thêm prop để nhận số lượng từ bên ngoài
}

const AddToCartModal = ({ book, open, onOpenChange, initialQuantity = 1 }: AddToCartModalProps) => {
  const navigate = useNavigate();
  const { addToCart } = useAddToCart();
  const [quantity, setQuantity] = useState(initialQuantity);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (open && book) {
      setQuantity(initialQuantity); // Sử dụng initialQuantity thay vì reset về 1
      setSuccess(false);
    }
  }, [open, book, initialQuantity]);

  if (!book) return null;

  const maxQuantity = book.so_luong || 0;
  const isOutOfStock = maxQuantity === 0;
  const isLowStock = maxQuantity > 0 && maxQuantity < 10;
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getImageUrl = (url?: string | null) => {
    if (!url) return 'https://via.placeholder.com/300x400/6366f1/ffffff?text=No+Image';
    if (url.startsWith('http')) return url;
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    return `${apiBaseUrl}${url}`;
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) {
      setQuantity(1);
      return;
    }
    if (newQuantity > maxQuantity) {
      setQuantity(maxQuantity);
      return;
    }
    setQuantity(newQuantity);
  };

  const handleAddToCart = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    if (isOutOfStock) {
      return;
    }

    if (quantity < 1) {
      return;
    }

    // Kiểm tra số lượng không vượt quá tồn kho
    if (quantity > maxQuantity) {
      setQuantity(maxQuantity);
      return;
    }

    setLoading(true);
    try {
      const result = await addToCart(book, quantity);
      if (result) {
        setSuccess(true);
        // Tự động đóng modal sau 1.5 giây
        setTimeout(() => {
          onOpenChange(false);
          setSuccess(false);
          setQuantity(1); // Reset về 1
        }, 1500);
      } else {
        // Nếu thêm không thành công, không đóng modal
        setLoading(false);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      setLoading(false);
    }
  };

  const handleViewDetails = () => {
    onOpenChange(false);
    navigate(`/books/${book.sach_id}`);
  };

  const subtotal = Number(book.gia_ban) * quantity;
  const discount = book.gia_bia > book.gia_ban 
    ? Number(book.gia_bia) - Number(book.gia_ban) 
    : 0;
  const discountPercent = book.gia_bia > book.gia_ban
    ? Math.round(((Number(book.gia_bia) - Number(book.gia_ban)) / Number(book.gia_bia)) * 100)
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Thêm sách vào giỏ hàng</DialogTitle>
          <DialogDescription>
            Xem chi tiết và chọn số lượng sách bạn muốn mua
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center justify-center py-12">
            <CheckCircle2 className="h-16 w-16 text-green-500 mb-4 animate-bounce" />
            <h3 className="text-xl font-semibold text-green-700 mb-2">Đã thêm vào giỏ hàng!</h3>
            <p className="text-gray-600">Sách đã được thêm vào giỏ hàng của bạn</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Book Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Book Image */}
              <div className="relative">
                <img
                  src={getImageUrl(book.anh_bia_url)}
                  alt={book.ten_sach}
                  className="w-full h-80 object-cover rounded-lg border border-gray-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x400/6366f1/ffffff?text=No+Image';
                  }}
                />
                {discountPercent > 0 && (
                  <Badge className="absolute top-2 left-2 bg-red-500">
                    -{discountPercent}%
                  </Badge>
                )}
                {isOutOfStock && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                    <Badge variant="destructive" className="text-lg px-4 py-2">
                      Hết hàng
                    </Badge>
                  </div>
                )}
              </div>

              {/* Book Details */}
              <div className="md:col-span-2 space-y-4">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{book.ten_sach}</h2>
                  <p className="text-gray-600 mb-2">
                    Tác giả: <span className="font-semibold">{book.tacgia?.ten_tac_gia || 'Chưa có thông tin'}</span>
                  </p>
                  {book.sach_danhmuc && book.sach_danhmuc.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {book.sach_danhmuc.slice(0, 3).map((sd, index) => (
                        <Badge key={index} variant="secondary">
                          {sd.danhmuc.ten_danh_muc}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Price */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold text-primary">
                      {formatPrice(Number(book.gia_ban))}
                    </span>
                    {book.gia_bia > book.gia_ban && (
                      <span className="text-lg text-gray-400 line-through">
                        {formatPrice(Number(book.gia_bia))}
                      </span>
                    )}
                  </div>
                  {discount > 0 && (
                    <p className="text-sm text-green-600">
                      Tiết kiệm {formatPrice(discount)} ({discountPercent}%)
                    </p>
                  )}
                </div>

                <Separator />

                {/* Stock Status */}
                <div>
                  {isOutOfStock || maxQuantity === 0 ? (
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="h-5 w-5" />
                      <span className="font-semibold">Sản phẩm đã hết hàng</span>
                    </div>
                  ) : isLowStock && maxQuantity > 0 ? (
                    <div className="flex items-center gap-2 text-orange-600">
                      <AlertCircle className="h-5 w-5" />
                      <span className="font-semibold">Sắp hết hàng - Còn {maxQuantity} cuốn</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="font-semibold">Còn hàng - {maxQuantity} cuốn</span>
                    </div>
                  )}
                </div>

                {/* Book Info */}
                <div className="space-y-2 text-sm text-gray-600">
                  {book.nhaxuatban && (
                    <p>Nhà xuất bản: <span className="font-semibold text-gray-900">{book.nhaxuatban.ten_nha_xuat_ban}</span></p>
                  )}
                  {book.so_trang && (
                    <p>Số trang: <span className="font-semibold text-gray-900">{book.so_trang}</span></p>
                  )}
                  {book.ngonngu && (
                    <p>Ngôn ngữ: <span className="font-semibold text-gray-900">{book.ngonngu.ten_ngon_ngu}</span></p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Quantity Selector */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-lg font-semibold">Số lượng:</label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 border rounded-lg">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1 || isOutOfStock}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      value={quantity}
                      onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                      min={1}
                      max={maxQuantity}
                      disabled={isOutOfStock}
                      className="w-16 text-center border-0 focus-visible:ring-0"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= maxQuantity || isOutOfStock}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {maxQuantity > 0 && (
                    <span className="text-sm text-gray-500">
                      (Tối đa: {maxQuantity})
                    </span>
                  )}
                </div>
              </div>

              {/* Subtotal */}
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Thành tiền:</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                {quantity > 1 && (
                  <p className="text-sm text-gray-600 mt-1">
                    {formatPrice(Number(book.gia_ban))} × {quantity} cuốn
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            {book.mo_ta && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-2">Mô tả:</h3>
                  <p className="text-gray-600 text-sm line-clamp-3">{book.mo_ta}</p>
                </div>
              </>
            )}
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            <X className="h-4 w-4 mr-2" />
            Đóng
          </Button>
          {!success && (
            <>
              <Button
                variant="outline"
                onClick={handleViewDetails}
                className="w-full sm:w-auto"
              >
                <Eye className="h-4 w-4 mr-2" />
                Xem chi tiết
              </Button>
              <Button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock || loading || quantity < 1}
                className="w-full sm:w-auto"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang thêm...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Thêm vào giỏ hàng
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddToCartModal;


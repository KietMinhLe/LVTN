import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { getDonHangById, deleteDonHang, type DonHang } from '../../services/donHangService';
import { createSepayPaymentForm } from '../../services/sepayService';
import { createChiTietGioHang } from '../../services/chiTietGioHangService';
import { getOrCreateGioHang } from '../../services/gioHangService';
import { useCart } from '../../hooks/useCartContext';

const SepayPayment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const { refreshCart, gioHangId } = useCart();

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<DonHang | null>(null);
  const [creatingPayment, setCreatingPayment] = useState(false);
  const [error, setError] = useState<string>('');
  const hasHandledCancel = useRef(false);

  const loadOrder = async () => {
    if (!orderId) {
      toast.error('Không tìm thấy mã đơn hàng');
      navigate('/orders');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const orderData = await getDonHangById(parseInt(orderId));

      if (!orderData) {
        toast.error('Không tìm thấy đơn hàng');
        navigate('/orders');
        return;
      }

      setOrder(orderData);
    } catch (err) {
      console.error('Error loading order:', err);
      setError('Không thể tải thông tin đơn hàng');
      toast.error('Không thể tải thông tin đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  // Hàm khôi phục giỏ hàng từ đơn hàng
  const restoreCartFromOrder = async (orderData: DonHang) => {
    try {
      if (!orderData.chitietdonhang || orderData.chitietdonhang.length === 0) {
        return;
      }

      // Lấy hoặc tạo giỏ hàng
      let currentGioHangId = gioHangId;
      if (!currentGioHangId) {
        let sessionId = sessionStorage.getItem('session_id');
        if (!sessionId) {
          sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          sessionStorage.setItem('session_id', sessionId);
        }
        const gioHang = await getOrCreateGioHang(undefined, sessionId);
        localStorage.setItem('gio_hang_id', gioHang.gio_hang_id.toString());
        currentGioHangId = gioHang.gio_hang_id;
      }

      // Khôi phục từng sản phẩm vào giỏ hàng
      const restorePromises = orderData.chitietdonhang.map(item => {
        if (item.sach_id && item.so_luong > 0) {
          return createChiTietGioHang({
            gio_hang_id: currentGioHangId!,
            sach_id: item.sach_id,
            so_luong: item.so_luong
          });
        }
        return Promise.resolve();
      });

      await Promise.all(restorePromises);
      await refreshCart();
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Error restoring cart:', error);
    }
  };

  // Xử lý khi quay lại từ trang thanh toán
  const handleCancelPayment = async () => {
    if (!order) return;
    
    hasHandledCancel.current = true;

    try {
      // Xóa flag khỏi sessionStorage
      sessionStorage.removeItem('payment_page_order_id');
      sessionStorage.removeItem('pending_cancel_order_id');
      sessionStorage.removeItem('pending_cancel_order_data');
      
      // Kiểm tra nếu đơn hàng chưa thanh toán (trạng thái "Chờ thanh toán")
      if (order.trang_thai === 'Chờ thanh toán') {
        // Khôi phục giỏ hàng trước khi xóa đơn hàng
        await restoreCartFromOrder(order);
        
        // Xóa đơn hàng
        await deleteDonHang(order.don_hang_id);
        
        toast.success('Đã hủy đơn hàng. Sản phẩm đã được khôi phục vào giỏ hàng.');
        navigate('/cart', { replace: true });
      } else {
        // Nếu đơn hàng đã thanh toán hoặc có trạng thái khác, chỉ quay lại
        navigate('/orders', { replace: true });
      }
    } catch (error) {
      console.error('Error canceling payment:', error);
      toast.error('Có lỗi xảy ra khi hủy đơn hàng');
    }
  };

  useEffect(() => {
    loadOrder();
    
    // Đánh dấu đang ở trang thanh toán
    if (orderId) {
      sessionStorage.setItem('payment_page_order_id', orderId);
      // Push một entry vào history để có thể intercept back button
      window.history.pushState({ preventBack: true, orderId }, '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  // Xử lý khi người dùng bấm nút back của trình duyệt
  useEffect(() => {
    if (!order || order.trang_thai !== 'Chờ thanh toán') return;

    const handlePopState = async (event: PopStateEvent) => {
      // Kiểm tra nếu đây là entry mà ta đã push
      if (event.state?.preventBack && !hasHandledCancel.current) {
        hasHandledCancel.current = true;
        
        // Ngăn chặn navigation mặc định
        window.history.pushState({ preventBack: true, orderId }, '');
        
        try {
          await restoreCartFromOrder(order);
          await deleteDonHang(order.don_hang_id);
          sessionStorage.removeItem('payment_page_order_id');
          toast.success('Đã hủy đơn hàng. Sản phẩm đã được khôi phục vào giỏ hàng.');
          navigate('/cart', { replace: true });
        } catch (error) {
          console.error('Error handling back navigation:', error);
          navigate('/cart', { replace: true });
        }
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
      sessionStorage.removeItem('payment_page_order_id');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order, orderId]);

  const createPaymentForm = async () => {
    if (!order) return;

    try {
      setCreatingPayment(true);
      setError('');

      const paymentResponse = await createSepayPaymentForm({
        orderId: order.ma_don_hang,
        amount: order.tong_tien,
        orderDescription: `Thanh toán đơn hàng ${order.ma_don_hang}`,
      });

      if (paymentResponse.success && paymentResponse.data.checkoutUrl && paymentResponse.data.formFields) {
        const checkoutUrl = paymentResponse.data.checkoutUrl;
        const formFields = paymentResponse.data.formFields;
        
        // Tạo form ẩn và submit tự động
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = checkoutUrl;
        form.style.display = 'none';

        // Thêm tất cả các fields từ formFields vào form
        Object.keys(formFields).forEach((key) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = formFields[key];
          form.appendChild(input);
        });

        // Thêm form vào body và submit
        document.body.appendChild(form);
        toast.success('Đang chuyển hướng sang cổng thanh toán SePay');
        form.submit();
      } else {
        throw new Error(paymentResponse.message || 'Không thể tạo form thanh toán');
      }
    } catch (err) {
      console.error('Error creating payment form:', err);
      const message = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tạo thanh toán';
      setError(message);
      toast.error(message);
      setCreatingPayment(false);
    }
  };

  const formatCurrency = (value: number | string) => {
    const val = typeof value === 'string' ? parseFloat(value) || 0 : value;
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(val);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-sm text-gray-600">Đang tải thông tin đơn hàng...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <AlertCircle className="h-12 w-12 text-red-500" />
              <p className="text-sm text-red-600 font-medium">Không tìm thấy đơn hàng</p>
              <Button onClick={() => navigate('/orders')} variant="outline">
                Quay lại danh sách đơn hàng
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <Button
          variant="ghost"
          onClick={handleCancelPayment}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại (Hủy đơn hàng)
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-lg border border-gray-200">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <CreditCard className="h-6 w-6 text-blue-600" />
                Thanh toán SePay
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-2">
                <p className="text-xs font-semibold text-blue-700 uppercase">Thông tin thanh toán</p>
                <p className="text-sm text-gray-800">
                  Bạn sẽ được chuyển hướng đến cổng thanh toán SePay để hoàn tất thanh toán cho đơn hàng của bạn.
                </p>
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              <Button
                onClick={createPaymentForm}
                disabled={creatingPayment}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {creatingPayment ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Thanh toán với SePay
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-xl border border-gray-100">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                Thông tin đơn hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 flex justify-between">
                <span className="text-sm font-medium text-gray-700">Mã đơn hàng</span>
                <span className="text-sm font-semibold text-blue-700">{order.ma_don_hang}</span>
              </div>

              <div className="rounded-lg border border-green-200 bg-green-50 p-4 flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Số tiền cần thanh toán</span>
                <span className="text-lg font-bold text-green-700">{formatCurrency(order.tong_tien)}</span>
              </div>

              <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 space-y-1">
                <p className="text-xs font-semibold text-purple-600 uppercase">Thông tin nhận hàng</p>
                <p className="text-sm text-gray-800">{order.ten_nguoi_nhan}</p>
                <p className="text-xs text-gray-600">{order.sdt_nguoi_nhan}</p>
                {order.email_nguoi_nhan && (
                  <p className="text-xs text-gray-600">{order.email_nguoi_nhan}</p>
                )}
              </div>

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-1">
                <p className="text-xs font-semibold text-gray-600 uppercase">Địa chỉ giao hàng</p>
                <p className="text-sm text-gray-800">{order.dia_chi_giao_hang}</p>
              </div>

              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 space-y-1">
                <p className="text-xs font-semibold text-yellow-700 uppercase">Trạng thái hiện tại</p>
                <p className="text-sm font-medium text-gray-800">{order.trang_thai}</p>
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 space-y-2">
                <p className="text-xs font-semibold text-blue-700 uppercase">Lưu ý</p>
                <ul className="text-xs text-blue-900 list-disc list-inside space-y-1">
                  <li>Bạn sẽ được chuyển đến cổng thanh toán SePay</li>
                  <li>Vui lòng kiểm tra kỹ thông tin đơn hàng trước khi thanh toán</li>
                  <li>Sau khi thanh toán thành công, trạng thái đơn hàng sẽ được cập nhật tự động</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default SepayPayment;

import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Globe,
  Landmark,
  Loader2,
  QrCode
} from 'lucide-react';
import { toast } from 'sonner';
import { getDonHangById, deleteDonHang, type DonHang } from '../../services/donHangService';
import { createVnpayPaymentUrl } from '../../services/vnpayService';
import { createChiTietGioHang } from '../../services/chiTietGioHangService';
import { getOrCreateGioHang } from '../../services/gioHangService';
import { useCart } from '../../hooks/useCartContext';
import type { LucideIcon } from 'lucide-react';

const orderTypeOptions = [
  { value: 'billpayment', label: 'Thanh toán hóa đơn' },
];

type PaymentMethod = {
  value: string;
  label: string;
  description: string;
  icon: LucideIcon;
  badge?: string;
};

const paymentMethods: PaymentMethod[] = [
  {
    value: '',
    label: 'Cổng VNPAYQR (đề xuất)',
    description: 'Để VNPay tự động hiển thị đầy đủ ngân hàng & ví hỗ trợ.',
    icon: CreditCard,
    badge: 'Khuyến nghị'
  },
  {
    value: 'VNPAYQR',
    label: 'Ứng dụng hỗ trợ VNPAYQR',
    description: 'Thanh toán nhanh bằng QR trên app ngân hàng/ ví điện tử.',
    icon: QrCode
  },
  {
    value: 'VNBANK',
    label: 'ATM / Tài khoản nội địa',
    description: 'Dùng thẻ ATM của ngân hàng trong nước (NCB, Vietcombank...).',
    icon: Landmark
  },
  {
    value: 'INTCARD',
    label: 'Thẻ quốc tế',
    description: 'Visa, MasterCard, JCB và các thẻ quốc tế khác.',
    icon: Globe
  }
];

const VnpayPayment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const { refreshCart, gioHangId } = useCart();

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<DonHang | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [orderInfo, setOrderInfo] = useState<string>('');
  const [orderType, setOrderType] = useState<string>('billpayment');
  const [bankCode, setBankCode] = useState<string>('');
  const [language, setLanguage] = useState<'vn' | 'en'>('vn');
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
      setAmount(Number(orderData.tong_tien).toString());
      setOrderInfo(`Thanh toan cho ma GD:${orderData.ma_don_hang}`);
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

  const createPaymentUrl = async () => {
    if (!order) return;
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Vui lòng nhập số tiền hợp lệ');
      return;
    }
    if (!orderInfo.trim()) {
      toast.error('Vui lòng nhập nội dung thanh toán');
      return;
    }

    try {
      setCreatingPayment(true);
      setError('');

      const paymentResponse = await createVnpayPaymentUrl({
        amount: parseFloat(amount),
        orderId: order.ma_don_hang,
        orderInfo: orderInfo.trim(),
        bankCode: bankCode || undefined,
        language
      });

      if (paymentResponse.success && paymentResponse.data.paymentUrl) {
        const url = paymentResponse.data.paymentUrl;
        toast.success('Đang chuyển hướng sang cổng thanh toán VNPay');
        window.location.href = url;
      } else {
        throw new Error(paymentResponse.message || 'Không thể tạo URL thanh toán');
      }
    } catch (err) {
      console.error('Error creating payment URL:', err);
      const message = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tạo thanh toán';
      setError(message);
      toast.error(message);
    } finally {
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
                Tạo mới đơn hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Loại hàng hóa</label>
                <select
                  value={orderType}
                  onChange={(e) => setOrderType(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  {orderTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Số tiền</label>
                <Input
                  type="number"
                  min={0}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Nội dung thanh toán</label>
                <textarea
                  value={orderInfo}
                  onChange={(e) => setOrderInfo(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 min-h-[80px]"
                  placeholder="Thanh toan don hang thoi gian ..."
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700">Ngân hàng / kênh thanh toán</label>
                <div className="grid gap-3">
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    const isActive = bankCode === method.value;
                    return (
                      <button
                        key={method.value || 'default'}
                        type="button"
                        onClick={() => setBankCode(method.value)}
                        className={`w-full rounded-xl border px-4 py-3 text-left transition-all ${
                          isActive
                            ? 'border-blue-500 bg-blue-50 shadow-sm'
                            : 'border-gray-200 bg-white hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className={`text-sm font-semibold ${isActive ? 'text-blue-700' : 'text-gray-800'}`}>
                              {method.label}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">{method.description}</p>
                          </div>
                          <Icon className={`h-6 w-6 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                        </div>
                        {method.badge && (
                          <span className="mt-2 inline-flex items-center rounded-full bg-blue-600/10 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                            {method.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Ngôn ngữ</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as 'vn' | 'en')}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                >
                  <option value="vn">Tiếng Việt</option>
                  <option value="en">English</option>
                </select>
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              <Button
                onClick={createPaymentUrl}
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
                    Thanh toán 
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
                <span className="text-sm font-medium text-gray-700">Số tiền gốc</span>
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
                  <li>Điền đầy đủ thông tin theo yêu cầu của VNPay</li>
                  <li>Kiểm tra kỹ số tiền và nội dung trước khi tạo URL</li>
                  <li>Sau khi thanh toán thành công, trạng thái sẽ cập nhật tự động</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default VnpayPayment;

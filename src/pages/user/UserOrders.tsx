import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserAuth } from '../../hooks/useUserAuth';
import { getAllDonHang, getDonHangById, deleteDonHang, cancelDonHang, type DonHang, type ChiTietDonHang } from '../../services/donHangService';
import { searchSach, type Sach } from '../../services/sachService';
import { createChiTietGioHang } from '../../services/chiTietGioHangService';
import { getOrCreateGioHang } from '../../services/gioHangService';
import { useCart } from '../../hooks/useCartContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { 
  ShoppingBag, 
  ArrowLeft,
  Loader2,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Search,
  Filter,
  MapPin,
  CreditCard,
  Phone,
  Mail,
  Calendar,
  FileText,
  Receipt,
  RefreshCw,
  User as UserIcon,
  Sparkles,
  Star,
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';
import DanhGiaModal from '../../components/DanhGiaModal';
import { getDanhGiaBySachId, type DanhGia } from '../../services/danhGiaService';

const UserOrders = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useUserAuth();
  const { refreshCart, gioHangId } = useCart();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<DonHang[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<DonHang[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<DonHang | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [danhGiaModalOpen, setDanhGiaModalOpen] = useState(false);
  const [selectedSachForReview, setSelectedSachForReview] = useState<{ sachId: number; donHangId: number; sachTen?: string } | null>(null);
  const [existingDanhGia, setExistingDanhGia] = useState<DanhGia | null>(null);
  // Map key: `${sach_id}_${don_hang_id}` -> DanhGia
  const [productReviews, setProductReviews] = useState<Map<string, DanhGia>>(new Map());
  const [cancellingOrderId, setCancellingOrderId] = useState<number | null>(null);
  
  // Live search states
  interface SearchResult {
    order: DonHang;
    item: {
      chi_tiet_don_hang_id?: number;
      sach?: {
        sach_id: number;
        ten_sach: string;
        anh_bia_url?: string | null;
        anhsach?: Array<{ url: string }>;
      } | Sach | null;
      so_luong: number;
      gia_luc_mua: number;
    };
  }
  const [liveResults, setLiveResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.search-container')) {
        setShowResults(false);
      }
    };

    if (showResults) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showResults]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadOrders();
    
    // Xử lý kết quả trả về từ thanh toán
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('status');
    const transactionNo = urlParams.get('transactionNo');
    const responseCode = urlParams.get('responseCode');
    const errorMessage = urlParams.get('message');
    
    if (paymentStatus) {
      if (paymentStatus === 'success') {
        toast.success(`Thanh toán thành công! Mã giao dịch: ${transactionNo || 'N/A'}`);
        // Xóa query params khỏi URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (paymentStatus === 'failed') {
        toast.error(`Thanh toán thất bại. Mã lỗi: ${responseCode || 'N/A'}`);
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (paymentStatus === 'cancel' || paymentStatus === 'cancelled') {
        // Xử lý khi hủy thanh toán: xóa đơn hàng và khôi phục giỏ hàng
        const orderIdParam = urlParams.get('orderId');
        if (orderIdParam) {
          handleCancelOrderAndRestoreCart(parseInt(orderIdParam));
        } else {
          toast.info('Bạn đã hủy thanh toán');
        }
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (paymentStatus === 'error') {
        toast.error(`Lỗi thanh toán: ${errorMessage || 'Có lỗi xảy ra'}`);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      // Reload orders để cập nhật trạng thái
      loadOrders();
    }
    
    // Lắng nghe sự kiện khi có đơn hàng mới được tạo
    const handleOrderCreated = () => {
      loadOrders();
    };
    
    window.addEventListener('orderCreated', handleOrderCreated);
    
    return () => {
      window.removeEventListener('orderCreated', handleOrderCreated);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, navigate, user]);

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

  // Xử lý hủy đơn hàng và khôi phục giỏ hàng
  const handleCancelOrderAndRestoreCart = async (orderId: number) => {
    try {
      // Lấy thông tin đơn hàng
      const orderData = await getDonHangById(orderId);
      
      // Kiểm tra nếu đơn hàng chưa thanh toán (trạng thái "Chờ thanh toán")
      if (orderData.trang_thai === 'Chờ thanh toán') {
        // Khôi phục giỏ hàng trước khi xóa đơn hàng
        await restoreCartFromOrder(orderData);
        
        // Xóa đơn hàng
        await deleteDonHang(orderId);
        
        toast.success('Đã hủy đơn hàng. Sản phẩm đã được khôi phục vào giỏ hàng.');
        
        // Reload orders để cập nhật danh sách
        await loadOrders();
        
        // Chuyển đến trang giỏ hàng
        navigate('/cart');
      } else {
        toast.info('Bạn đã hủy thanh toán');
      }
    } catch (error) {
      console.error('Error canceling order:', error);
      toast.error('Có lỗi xảy ra khi hủy đơn hàng');
    }
  };

  // Hàm xử lý hủy đơn hàng (cập nhật trạng thái thành "Đã hủy")
  const handleCancelOrder = async (orderId: number) => {
    if (!confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) {
      return;
    }

    setCancellingOrderId(orderId);
    try {
      await cancelDonHang(orderId);
      toast.success('Hủy đơn hàng thành công');
      // Reload danh sách đơn hàng
      await loadOrders();
      // Đóng dialog chi tiết nếu đang mở
      if (selectedOrder?.don_hang_id === orderId) {
        setIsDetailDialogOpen(false);
        setSelectedOrder(null);
      }
    } catch (error: unknown) {
      console.error('Error cancelling order:', error);
      const axiosError = error as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage = axiosError.response?.data?.message || axiosError.message || 'Không thể hủy đơn hàng';
      toast.error(errorMessage);
    } finally {
      setCancellingOrderId(null);
    }
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      console.log('Loading orders for user:', user);
      console.log('User ID:', user?.id);
      
      const allOrders = await getAllDonHang();
      console.log('All orders from API:', allOrders);
      console.log('Total orders:', allOrders.length);
      
      // Filter orders by current user
      // So sánh theo khach_hang_id hoặc email/sdt nếu khach_hang_id = null
      const userOrders = allOrders.filter(order => {
        const orderKhachHangId = order.khach_hang_id ? Number(order.khach_hang_id) : null;
        const userId = user?.id ? Number(user.id) : null;
        
        // Nếu có khach_hang_id, so sánh trực tiếp
        if (orderKhachHangId !== null && userId !== null) {
          const match = orderKhachHangId === userId;
          console.log('Comparing by khach_hang_id:', {
            orderId: order.don_hang_id,
            orderKhachHangId,
            userId,
            match
          });
          return match;
        }
        
        // Nếu không có khach_hang_id, so sánh theo email hoặc số điện thoại
        if (orderKhachHangId === null && user) {
          const emailMatch = order.email_nguoi_nhan && user.email && 
            order.email_nguoi_nhan.toLowerCase() === user.email.toLowerCase();
          const phoneMatch = order.sdt_nguoi_nhan && user.so_dien_thoai && 
            order.sdt_nguoi_nhan === user.so_dien_thoai;
          
          const match = emailMatch || phoneMatch;
          console.log('Comparing by email/phone:', {
            orderId: order.don_hang_id,
            orderEmail: order.email_nguoi_nhan,
            userEmail: user.email,
            orderPhone: order.sdt_nguoi_nhan,
            userPhone: user.so_dien_thoai,
            emailMatch,
            phoneMatch,
            match
          });
          return match;
        }
        
        return false;
      });
      
      console.log('Filtered user orders:', userOrders);
      console.log('User orders count:', userOrders.length);

      // Sort by date (newest first)
      userOrders.sort((a, b) => {
        const dateA = a.ngay_dat_hang ? new Date(a.ngay_dat_hang).getTime() : 0;
        const dateB = b.ngay_dat_hang ? new Date(b.ngay_dat_hang).getTime() : 0;
        return dateB - dateA;
      });
      
      setOrders(userOrders);
      setFilteredOrders(userOrders);
      
      // Load đánh giá cho các đơn hàng đã hoàn thành
      if (userOrders.length > 0) {
        loadAllProductReviews(userOrders);
      }
      
      if (userOrders.length === 0 && allOrders.length > 0) {
        console.warn('No orders found for user, but there are orders in system');
        console.warn('User ID:', user?.id);
        console.warn('Sample order khach_hang_id:', allOrders[0]?.khach_hang_id);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  // Live search với fulltext trong sản phẩm của đơn hàng
  useEffect(() => {
    let timer: number | undefined;

    const runSearch = async () => {
      const keyword = searchTerm.trim();
      if (keyword.length < 2) {
        setLiveResults([]);
        setShowResults(false);
        return;
      }

      try {
        setIsSearching(true);
        
        // Sử dụng fulltext search từ API như Header
        const searchResults = await searchSach(keyword);
        
        // Tạo map sách_id -> danh sách đơn hàng chứa sách đó
        const bookToOrdersMap = new Map<number, Array<{ order: DonHang; item: ChiTietDonHang & { sach?: { sach_id: number; ten_sach: string; anh_bia_url?: string | null; anhsach?: Array<{ url: string }> } | null } }>>();
        
        orders.forEach(order => {
          if (order.chitietdonhang && order.chitietdonhang.length > 0) {
            order.chitietdonhang.forEach(item => {
              if (item.sach?.sach_id) {
                const sachId = item.sach.sach_id;
                if (!bookToOrdersMap.has(sachId)) {
                  bookToOrdersMap.set(sachId, []);
                }
                bookToOrdersMap.get(sachId)!.push({ order, item: item as ChiTietDonHang & { sach?: { sach_id: number; ten_sach: string; anh_bia_url?: string | null; anhsach?: Array<{ url: string }> } | null } });
              }
            });
          }
        });
        
        // Lọc kết quả: chỉ lấy những sách có trong đơn hàng của user
        const results: SearchResult[] = [];
        
        for (const book of searchResults) {
          const orderItems = bookToOrdersMap.get(book.sach_id);
          if (orderItems && orderItems.length > 0) {
            // Lấy đơn hàng đầu tiên chứa sách này (hoặc có thể lấy tất cả)
            orderItems.forEach(({ order, item }) => {
              // Tránh trùng lặp
              const exists = results.some(r => 
                r.order.don_hang_id === order.don_hang_id && 
                r.item.chi_tiet_don_hang_id === item.chi_tiet_don_hang_id
              );
              if (!exists) {
                // Cập nhật item với thông tin sách đầy đủ từ search results
                results.push({ 
                  order, 
                  item: {
                    chi_tiet_don_hang_id: item.chi_tiet_don_hang_id,
                    so_luong: item.so_luong,
                    gia_luc_mua: item.gia_luc_mua,
                    sach: book as Sach // Sử dụng thông tin sách từ fulltext search
                  }
                });
              }
            });
          }
        }
        
        // Nếu không tìm thấy qua fulltext, tìm kiếm trong mã đơn hàng
        if (results.length === 0) {
          const keywordLower = keyword.toLowerCase();
          orders.forEach(order => {
            if (order.ma_don_hang?.toLowerCase().includes(keywordLower)) {
              if (order.chitietdonhang && order.chitietdonhang.length > 0) {
                order.chitietdonhang.forEach(item => {
                  const exists = results.some(r => 
                    r.order.don_hang_id === order.don_hang_id && 
                    r.item.chi_tiet_don_hang_id === item.chi_tiet_don_hang_id
                  );
                  if (!exists) {
                    results.push({ order, item } as SearchResult);
                  }
                });
              }
            }
          });
        }
        
        setLiveResults(results.slice(0, 6)); // Giới hạn 6 kết quả
        setShowResults(true);
      } catch (error) {
        console.error('Live search error:', error);
        setLiveResults([]);
        setShowResults(false);
      } finally {
        setIsSearching(false);
      }
    };

    if (searchTerm.trim()) {
      timer = window.setTimeout(runSearch, 300);
    } else {
      setLiveResults([]);
      setShowResults(false);
    }

    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [searchTerm, orders]);

  // Handle search form submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowResults(false);
    // Filter will be handled by useEffect below
  };

  // Filter orders
  useEffect(() => {
    let filtered = [...orders];

    // Filter by search term (mã đơn hàng, tên người nhận, hoặc tên sản phẩm)
    if (searchTerm.trim()) {
      const keyword = searchTerm.toLowerCase();
      filtered = filtered.filter(order => {
        // Tìm trong mã đơn hàng và tên người nhận
        const matchOrderInfo = 
          order.ma_don_hang.toLowerCase().includes(keyword) ||
          order.ten_nguoi_nhan.toLowerCase().includes(keyword);
        
        // Tìm trong tên sản phẩm của đơn hàng
        const matchProducts = order.chitietdonhang?.some(item =>
          item.sach?.ten_sach?.toLowerCase().includes(keyword)
        ) || false;
        
        return matchOrderInfo || matchProducts;
      });
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.trang_thai === statusFilter);
    }

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter]);

  // Load order detail
  const handleViewDetail = async (orderId: number) => {
    try {
      setLoadingDetail(true);
      const orderDetail = await getDonHangById(orderId);
      setSelectedOrder(orderDetail);
      setIsDetailDialogOpen(true);
      // Load đánh giá cho các sản phẩm trong đơn hàng
      await loadProductReviews(orderDetail);
    } catch (error) {
      console.error('Error loading order detail:', error);
      toast.error('Không thể tải chi tiết đơn hàng');
    } finally {
      setLoadingDetail(false);
    }
  };

  // Load đánh giá cho các sản phẩm trong đơn hàng
  const loadProductReviews = async (order: DonHang, updateMap?: Map<string, DanhGia>) => {
    if (!order.chitietdonhang || order.chitietdonhang.length === 0) return updateMap || new Map();
    
    const reviewsMap = updateMap || new Map<string, DanhGia>();
    
    try {
      // Load đánh giá cho từng sản phẩm
      const reviewPromises = order.chitietdonhang.map(async (item) => {
        if (item.sach_id) {
          try {
            const reviewData = await getDanhGiaBySachId(item.sach_id);
            // Tìm đánh giá của user cho sản phẩm này trong đơn hàng này
            const userReview = reviewData.danh_gia.find(
              (dg) => dg.don_hang_id === order.don_hang_id && dg.khach_hang_id === user?.id
            );
            if (userReview) {
              // Key là sach_id_don_hang_id để phân biệt cùng sản phẩm ở các đơn hàng khác nhau
              const key = `${item.sach_id}_${order.don_hang_id}`;
              reviewsMap.set(key, userReview);
            }
          } catch (error) {
            console.error(`Error loading review for sach ${item.sach_id}:`, error);
          }
        }
      });
      
      await Promise.all(reviewPromises);
      if (!updateMap) {
        setProductReviews(reviewsMap);
      }
      return reviewsMap;
    } catch (error) {
      console.error('Error loading product reviews:', error);
      return reviewsMap;
    }
  };

  // Load đánh giá cho tất cả đơn hàng đã hoàn thành
  const loadAllProductReviews = async (ordersList: DonHang[]) => {
    const allReviewsMap = new Map<string, DanhGia>();
    
    // Chỉ load đánh giá cho các đơn hàng đã hoàn thành hoặc đã giao hàng
    const completedOrders = ordersList.filter(
      order => order.trang_thai === 'Đã giao hàng' || order.trang_thai === 'Hoàn thành'
    );

    for (const order of completedOrders) {
      await loadProductReviews(order, allReviewsMap);
    }
    
    setProductReviews(allReviewsMap);
  };

  // Mở modal đánh giá
  const handleOpenDanhGia = (sachId: number, donHangId: number, sachTen?: string) => {
    const key = `${sachId}_${donHangId}`;
    const existingReview = productReviews.get(key);
    setSelectedSachForReview({ sachId, donHangId, sachTen });
    setExistingDanhGia(existingReview || null);
    setDanhGiaModalOpen(true);
  };

  // Xử lý sau khi đánh giá thành công
  const handleDanhGiaSuccess = async () => {
    if (selectedOrder) {
      await loadProductReviews(selectedOrder);
    }
    // Reload đánh giá cho tất cả đơn hàng
    if (orders.length > 0) {
      await loadAllProductReviews(orders);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Chưa có';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  // Get image URL helper
  const getImageUrl = (url?: string | null) => {
    if (!url) return 'https://via.placeholder.com/150x200/6366f1/ffffff?text=No+Image';
    if (url.startsWith('http')) return url;
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    return `${apiBaseUrl}${url}`;
  };

  // Get book image (ưu tiên anhsach)
  const getBookImageUrl = (item: { sach?: { anhsach?: Array<{ url: string }>; anh_bia_url?: string | null } | null }) => {
    if (item.sach?.anhsach && item.sach.anhsach.length > 0 && item.sach.anhsach[0]?.url) {
      const url = item.sach.anhsach[0].url;
      if (url.startsWith('http')) return url;
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      return `${apiBaseUrl}${url}`;
    }
    if (item.sach?.anh_bia_url) {
      return getImageUrl(item.sach.anh_bia_url);
    }
    return 'https://via.placeholder.com/150x200/6366f1/ffffff?text=No+Image';
  };

  // Get all unique statuses
  const getAllStatuses = () => {
    const statuses = new Set(orders.map(order => order.trang_thai));
    return Array.from(statuses);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ComponentType<{ className?: string }>; color: string }> = {
      'Chờ xác nhận': { label: 'Chờ xác nhận', variant: 'default', icon: Clock, color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
      'Chờ thanh toán': { label: 'Chờ thanh toán', variant: 'default', icon: Clock, color: 'bg-orange-100 text-orange-800 border-orange-300' },
      'Đang xử lý': { label: 'Đang xử lý', variant: 'default', icon: Clock, color: 'bg-blue-100 text-blue-800 border-blue-300' },
      'Đã xác nhận': { label: 'Đã xác nhận', variant: 'default', icon: CheckCircle2, color: 'bg-green-100 text-green-800 border-green-300' },
      'Đang giao hàng': { label: 'Đang giao hàng', variant: 'default', icon: Truck, color: 'bg-purple-100 text-purple-800 border-purple-300' },
      'Đã giao hàng': { label: 'Đã giao hàng', variant: 'default', icon: Package, color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
      'Đã hủy': { label: 'Đã hủy', variant: 'destructive', icon: XCircle, color: 'bg-red-100 text-red-800 border-red-300' },
      'Thanh toán thất bại': { label: 'Thanh toán thất bại', variant: 'destructive', icon: XCircle, color: 'bg-red-100 text-red-800 border-red-300' },
      'Hoàn thành': { label: 'Hoàn thành', variant: 'default', icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-800 border-emerald-300' }
    };
    
    const statusInfo = statusMap[status] || { label: status, variant: 'secondary' as const, icon: Clock, color: 'bg-gray-100 text-gray-800 border-gray-300' };
    const Icon = statusInfo.icon;
    
    return (
      <Badge variant="outline" className={`flex items-center gap-1.5 px-3 py-1.5 font-semibold ${statusInfo.color}`}>
        <Icon className="h-4 w-4" />
        {statusInfo.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải đơn hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                <ShoppingBag className="h-8 w-8 text-blue-600" />
                Đơn hàng của tôi
              </h1>
              <p className="text-gray-600">Xem lịch sử và trạng thái đơn hàng của bạn</p>
            </div>
            <Button
              variant="outline"
              onClick={loadOrders}
              className="gap-2"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Làm mới
            </Button>
          </div>

          {/* Search and Filter */}
          {orders.length > 0 && (
            <div className="mb-6 space-y-4">
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="relative search-container">
                <div className="relative flex items-center">
                  <div className="absolute left-4 z-10">
                    <Search className="w-5 h-5 text-gray-400" />
                  </div>
                  <Input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm trong đơn hàng..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => { if (liveResults.length > 0) setShowResults(true); }}
                    className="w-full pl-12 pr-32 h-14 text-base rounded-xl border-2 border-gray-200 bg-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  />
                  <Button 
                    type="submit"
                    className="absolute right-2 h-10 px-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Tìm kiếm
                  </Button>

                  {/* Live search results dropdown */}
                  {showResults && (liveResults.length > 0 || isSearching) && (
                    <div className="absolute left-0 right-0 top-full mt-2 bg-white text-gray-900 rounded-lg shadow-xl border border-gray-200 z-50 max-h-80 overflow-y-auto">
                      {isSearching && (
                        <div className="px-4 py-2 text-sm text-gray-500 flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Đang tìm kiếm...
                        </div>
                      )}
                      {!isSearching && liveResults.map((result, index) => (
                        <button
                          key={`${result.order.don_hang_id}-${result.item.chi_tiet_don_hang_id || index}`}
                          type="button"
                          className="w-full text-left px-4 py-3 hover:bg-gray-100 flex items-center gap-3 border-b border-gray-100 last:border-b-0"
                          onClick={() => {
                            setShowResults(false);
                            setSearchTerm('');
                            handleViewDetail(result.order.don_hang_id);
                          }}
                        >
                          <div className="w-14 h-20 flex-shrink-0 rounded border border-gray-200 shadow-sm overflow-hidden bg-gray-100">
                            <img
                              src={getBookImageUrl(result.item)}
                              alt={result.item.sach?.ten_sach || 'Sách'}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x400/6366f1/ffffff?text=No+Image';
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold line-clamp-1 text-gray-900">
                              {result.item.sach?.ten_sach || 'Sách'}
                            </div>
                            <div className="text-xs text-blue-600 font-medium mt-1">
                              Đơn hàng: {result.order.ma_don_hang}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              Số lượng: {result.item.so_luong} • {formatPrice(result.item.gia_luc_mua)}
                            </div>
                          </div>
                        </button>
                      ))}
                      {!isSearching && liveResults.length === 0 && (
                        <div className="px-4 py-2 text-sm text-gray-500">Không tìm thấy sản phẩm phù hợp</div>
                      )}
                    </div>
                  )}
                </div>
              </form>

              {/* Status Filter */}
              <Card className="border-blue-200 shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      <Filter className="h-4 w-4 text-gray-400" />
                      <label className="text-sm font-medium text-gray-700">Lọc theo trạng thái:</label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="flex-1 max-w-xs px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      >
                        <option value="all">Tất cả trạng thái</option>
                        {getAllStatuses().map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                    <p className="text-sm text-gray-600 font-medium">
                      Hiển thị {filteredOrders.length} / {orders.length} đơn hàng
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {orders.length === 0 ? (
          <Card className="border-blue-200 shadow-md">
            <CardContent className="py-12 text-center">
              <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Chưa có đơn hàng nào</h2>
              <p className="text-gray-600 mb-6">Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm!</p>
              <Button onClick={() => navigate('/books')} className="bg-gradient-to-r from-blue-500 to-blue-600">
                Mua sắm ngay
              </Button>
            </CardContent>
          </Card>
        ) : filteredOrders.length === 0 ? (
          <Card className="border-blue-200 shadow-md">
            <CardContent className="py-12 text-center">
              <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Không tìm thấy đơn hàng</h2>
              <p className="text-gray-600 mb-6">Không có đơn hàng nào phù hợp với bộ lọc của bạn</p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
              >
                Xóa bộ lọc
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-5">
            {filteredOrders.map((order) => (
              <Card key={order.don_hang_id} className="border-2 border-blue-200/70 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl overflow-hidden !pt-0">
                <CardHeader className="bg-gradient-to-r from-blue-50 via-indigo-50/50 to-purple-50 border-b-2 border-blue-200/50 !pt-5 pb-5 px-6">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px]">
                      <CardTitle className="flex items-center gap-3 text-blue-900 mb-3 text-xl font-bold">
                        <div className="p-2.5 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl shadow-sm">
                          <Package className="h-5 w-5 text-blue-700" />
                        </div>
                        Mã đơn: <span className="font-mono text-lg">{order.ma_don_hang}</span>
                      </CardTitle>
                      <div className="flex items-center gap-4 text-sm text-gray-700">
                        <div className="flex items-center gap-2 bg-white/60 px-3 py-1.5 rounded-lg">
                          <Calendar className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">{formatDate(order.ngay_dat_hang)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(order.trang_thai)}
                      {/* Nút hủy đơn hàng - chỉ hiển thị khi đơn hàng có thể hủy */}
                      {order.trang_thai !== 'Đã hủy' && 
                       order.trang_thai !== 'Đã giao hàng' && 
                       order.trang_thai !== 'Hoàn thành' &&
                       order.trang_thai !== 'Đang giao hàng' &&
                       order.trang_thai !== 'Đang vận chuyển' &&
                       ['Chờ xác nhận', 'Chờ thanh toán', 'Đã xác nhận'].includes(order.trang_thai) && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleCancelOrder(order.don_hang_id)}
                          disabled={cancellingOrderId === order.don_hang_id}
                          className="gap-2"
                        >
                          {cancellingOrderId === order.don_hang_id ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Đang hủy...
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4" />
                              Hủy đơn hàng
                            </>
                          )}
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetail(order.don_hang_id)}
                        className="gap-2 border-2 hover:bg-blue-50 hover:border-blue-300 transition-all rounded-lg"
                      >
                        <Eye className="h-4 w-4" />
                        Chi tiết
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 pb-6">
                  <div className="space-y-4">
                    {/* Order Items */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-lg">
                        <FileText className="h-5 w-5 text-blue-600" />
                        Sản phẩm ({order.chitietdonhang?.length || 0})
                      </h3>
                      <div className="space-y-3">
                        {order.chitietdonhang?.slice(0, 3).map((item, index) => {
                          const canReview = (order.trang_thai === 'Đã giao hàng' || order.trang_thai === 'Hoàn thành');
                          const reviewKey = item.sach_id ? `${item.sach_id}_${order.don_hang_id}` : null;
                          const existingReview = reviewKey ? productReviews.get(reviewKey) : null;
                          const hasReviewed = !!existingReview;
                          
                          return (
                            <div key={index} className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-xl hover:from-blue-50 hover:to-indigo-50/30 transition-all border border-gray-100 hover:border-blue-200 hover:shadow-md">
                              {/* Book Image */}
                              <div className="w-20 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200 border-2 border-gray-200 shadow-sm">
                                <img
                                  src={getBookImageUrl(item)}
                                  alt={item.sach?.ten_sach || 'Sách'}
                                  className="w-full h-full object-contain"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150x200/6366f1/ffffff?text=No+Image';
                                  }}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm text-gray-900 line-clamp-2 leading-tight">
                                  {item.sach?.ten_sach || 'Sách'}
                                </p>
                                <p className="text-xs text-gray-600 mt-2">
                                  Số lượng: {item.so_luong} x {formatPrice(item.gia_luc_mua)}
                                </p>
                                {canReview && (
                                  <div className="flex items-center gap-2 mt-2">
                                    {hasReviewed ? (
                                      <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 text-xs">
                                          <CheckCircle2 className="w-3 h-3 mr-1" />
                                          Đã đánh giá
                                        </Badge>
                                        <div className="flex items-center gap-0.5">
                                          {[1, 2, 3, 4, 5].map((sao) => (
                                            <Star
                                              key={sao}
                                              className={`w-3 h-3 ${
                                                sao <= (existingReview?.xep_hang || 0)
                                                  ? 'fill-yellow-400 text-yellow-400'
                                                  : 'fill-gray-200 text-gray-200'
                                              }`}
                                            />
                                          ))}
                                        </div>
                                      </div>
                                    ) : (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleOpenDanhGia(
                                          item.sach_id!,
                                          order.don_hang_id,
                                          item.sach?.ten_sach
                                        )}
                                        className="gap-1.5 border-blue-300 text-blue-600 hover:bg-blue-50 text-xs h-7 px-2"
                                      >
                                        <MessageSquare className="w-3 h-3" />
                                        Đánh giá
                                      </Button>
                                    )}
                                  </div>
                                )}
                              </div>
                              <p className="font-bold text-blue-600 whitespace-nowrap text-base">
                                {formatPrice(item.gia_luc_mua * item.so_luong)}
                              </p>
                            </div>
                          );
                        })}
                        {order.chitietdonhang && order.chitietdonhang.length > 3 && (
                          <p className="text-sm text-gray-600 text-center py-2">
                            + {order.chitietdonhang.length - 3} sản phẩm khác
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="border-t-2 border-gray-200 pt-5 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700 font-medium">Tạm tính:</span>
                        <span className="font-semibold text-gray-900">{formatPrice(order.tam_tinh)}</span>
                      </div>
                      {order.phi_van_chuyen && order.phi_van_chuyen > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-700 font-medium">Phí vận chuyển:</span>
                          <span className="font-semibold text-gray-900">{formatPrice(order.phi_van_chuyen)}</span>
                        </div>
                      )}
                      {order.giam_gia_voucher && order.giam_gia_voucher > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span className="font-medium">Giảm giá voucher:</span>
                          <span className="font-semibold">-{formatPrice(order.giam_gia_voucher)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-xl pt-3 border-t-2 border-blue-200 bg-gradient-to-r from-blue-50/50 to-purple-50/50 -mx-6 px-6 py-3 rounded-b-xl">
                        <span className="text-gray-900">Tổng cộng:</span>
                        <span className="text-blue-600">{formatPrice(order.tong_tien)}</span>
                      </div>
                    </div>

                    {/* Quick Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t-2 border-gray-200 pt-5">
                      <div className="flex items-center gap-3 text-sm bg-blue-50/50 px-4 py-3 rounded-lg border border-blue-100">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Truck className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Vận chuyển</p>
                          <p className="font-semibold text-gray-900">{order.phuongthucvanchuyen?.ten_phuong_thuc || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm bg-purple-50/50 px-4 py-3 rounded-lg border border-purple-100">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <CreditCard className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Thanh toán</p>
                          <p className="font-semibold text-gray-900">{order.phuongthucthanhtoan?.ten_phuong_thuc || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Order Detail Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-2xl">
                <Receipt className="h-6 w-6 text-blue-600" />
                Chi tiết đơn hàng
              </DialogTitle>
              <DialogDescription>
                Mã đơn: {selectedOrder?.ma_don_hang}
              </DialogDescription>
            </DialogHeader>

            {loadingDetail ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : selectedOrder ? (
              <div className="space-y-6">
                {/* Order Status */}
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Trạng thái đơn hàng</p>
                    <div className="mt-2">
                      {getStatusBadge(selectedOrder.trang_thai)}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Ngày đặt</p>
                      <p className="font-semibold text-gray-900">{formatDate(selectedOrder.ngay_dat_hang)}</p>
                    </div>
                    {/* Nút hủy đơn hàng trong dialog chi tiết */}
                    {selectedOrder.trang_thai !== 'Đã hủy' && 
                     selectedOrder.trang_thai !== 'Đã giao hàng' && 
                     selectedOrder.trang_thai !== 'Hoàn thành' &&
                     selectedOrder.trang_thai !== 'Đang giao hàng' &&
                     selectedOrder.trang_thai !== 'Đang vận chuyển' &&
                     ['Chờ xác nhận', 'Chờ thanh toán', 'Đã xác nhận'].includes(selectedOrder.trang_thai) && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleCancelOrder(selectedOrder.don_hang_id)}
                        disabled={cancellingOrderId === selectedOrder.don_hang_id}
                        className="gap-2"
                      >
                        {cancellingOrderId === selectedOrder.don_hang_id ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Đang hủy...
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4" />
                            Hủy đơn hàng
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Customer Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <UserIcon className="h-5 w-5 text-blue-600" />
                      Thông tin người nhận
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Họ tên</p>
                          <p className="font-medium">{selectedOrder.ten_nguoi_nhan}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Số điện thoại</p>
                          <p className="font-medium">{selectedOrder.sdt_nguoi_nhan}</p>
                        </div>
                      </div>
                      {selectedOrder.email_nguoi_nhan && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Email</p>
                            <p className="font-medium">{selectedOrder.email_nguoi_nhan}</p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                        <div>
                          <p className="text-xs text-gray-500">Địa chỉ giao hàng</p>
                          <p className="font-medium">{selectedOrder.dia_chi_giao_hang}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Order Items */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Package className="h-5 w-5 text-blue-600" />
                      Sản phẩm trong đơn hàng ({selectedOrder.chitietdonhang?.length || 0})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedOrder.chitietdonhang?.map((item, index) => {
                        const canReview = (selectedOrder.trang_thai === 'Đã giao hàng' || selectedOrder.trang_thai === 'Hoàn thành');
                        const reviewKey = item.sach_id ? `${item.sach_id}_${selectedOrder.don_hang_id}` : null;
                        const existingReview = reviewKey ? productReviews.get(reviewKey) : null;
                        const hasReviewed = !!existingReview;
                        
                        return (
                          <div key={index} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="w-20 h-28 flex-shrink-0 rounded overflow-hidden bg-gray-200">
                              <img
                                src={getBookImageUrl(item)}
                                alt={item.sach?.ten_sach || 'Sách'}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150x200/6366f1/ffffff?text=No+Image';
                                }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                                {item.sach?.ten_sach || 'Sách'}
                              </h4>
                              <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                                <span>Số lượng: {item.so_luong}</span>
                                <span>•</span>
                                <span>Giá: {formatPrice(item.gia_luc_mua)}</span>
                              </div>
                              {canReview && (
                                <div className="flex items-center gap-2 mt-2">
                                  {hasReviewed ? (
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                        Đã đánh giá
                                      </Badge>
                                      <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map((sao) => (
                                          <Star
                                            key={sao}
                                            className={`w-4 h-4 ${
                                              sao <= (existingReview?.xep_hang || 0)
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'fill-gray-200 text-gray-200'
                                            }`}
                                          />
                                        ))}
                                      </div>
                                    </div>
                                  ) : (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleOpenDanhGia(
                                        item.sach_id!,
                                        selectedOrder.don_hang_id,
                                        item.sach?.ten_sach
                                      )}
                                      className="gap-2 border-blue-300 text-blue-600 hover:bg-blue-50"
                                    >
                                      <MessageSquare className="w-4 h-4" />
                                      Đánh giá sản phẩm
                                    </Button>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-blue-600 text-lg">
                                {formatPrice(item.gia_luc_mua * item.so_luong)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Payment & Shipping Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-blue-600" />
                        Phương thức thanh toán
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-medium">{selectedOrder.phuongthucthanhtoan?.ten_phuong_thuc || 'N/A'}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Truck className="h-5 w-5 text-blue-600" />
                        Phương thức vận chuyển
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-medium">{selectedOrder.phuongthucvanchuyen?.ten_phuong_thuc || 'N/A'}</p>
                      {selectedOrder.phi_van_chuyen && selectedOrder.phi_van_chuyen > 0 && (
                        <p className="text-sm text-gray-600 mt-1">
                          Phí: {formatPrice(selectedOrder.phi_van_chuyen)}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Order Summary */}
                <Card className="bg-blue-50">
                  <CardHeader>
                    <CardTitle className="text-lg">Tóm tắt đơn hàng</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tạm tính:</span>
                      <span className="font-semibold">{formatPrice(selectedOrder.tam_tinh)}</span>
                    </div>
                    {selectedOrder.phi_van_chuyen && selectedOrder.phi_van_chuyen > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Phí vận chuyển:</span>
                        <span className="font-semibold">{formatPrice(selectedOrder.phi_van_chuyen)}</span>
                      </div>
                    )}
                    {selectedOrder.giam_gia_voucher && selectedOrder.giam_gia_voucher > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Giảm giá voucher:</span>
                        <span className="font-semibold">-{formatPrice(selectedOrder.giam_gia_voucher)}</span>
                      </div>
                    )}
                    {selectedOrder.voucher && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Mã voucher:</span>
                        <Badge variant="outline">{selectedOrder.voucher.ma_voucher}</Badge>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-xl pt-3 border-t border-blue-200">
                      <span>Tổng cộng:</span>
                      <span className="text-blue-600">{formatPrice(selectedOrder.tong_tien)}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>

        {/* Đánh giá Modal */}
        {selectedSachForReview && (
          <DanhGiaModal
            open={danhGiaModalOpen}
            onOpenChange={setDanhGiaModalOpen}
            sachId={selectedSachForReview.sachId}
            donHangId={selectedSachForReview.donHangId}
            sachTen={selectedSachForReview.sachTen}
            existingDanhGia={existingDanhGia}
            onSuccess={handleDanhGiaSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default UserOrders;


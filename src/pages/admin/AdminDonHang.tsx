import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import {
  getAllDonHang,
  getDonHangById,
  updateDonHang,
  type DonHang,
  type UpdateDonHangRequest,
} from '../../services/donHangService';
import { 
  Package, 
  Search, 
  Loader2, 
  ArrowLeft, 
  Home, 
  Eye, 
  Pencil, 
  ArrowUpDown,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  CreditCard
} from 'lucide-react';
import { toast } from 'sonner';

const AdminDonHang = () => {
  const navigate = useNavigate();
  const [donHangList, setDonHangList] = useState<DonHang[]>([]);
  const [filteredList, setFilteredList] = useState<DonHang[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedDonHang, setSelectedDonHang] = useState<DonHang | null>(null);
  
  // Sắp xếp
  const [sortBy, setSortBy] = useState<'don_hang_id' | 'ngay_dat_hang' | 'tong_tien'>('ngay_dat_hang');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Form state
  const [formData, setFormData] = useState<UpdateDonHangRequest>({
    trang_thai: '',
  });
  const [formLoading, setFormLoading] = useState(false);

  // Load dữ liệu
  useEffect(() => {
    loadData();
  }, []);

  // Filter và sắp xếp
  useEffect(() => {
    let filtered = donHangList;
    
    // Filter theo search term
    if (searchTerm.trim() !== '') {
      filtered = donHangList.filter(
        (dh) =>
          dh.ma_don_hang.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dh.ten_nguoi_nhan.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dh.email_nguoi_nhan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dh.sdt_nguoi_nhan.includes(searchTerm)
      );
    }
    
    // Sắp xếp
    const sorted = [...filtered].sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';
      
      if (sortBy === 'don_hang_id') {
        aValue = a.don_hang_id;
        bValue = b.don_hang_id;
      } else if (sortBy === 'ngay_dat_hang') {
        aValue = a.ngay_dat_hang ? new Date(a.ngay_dat_hang).getTime() : 0;
        bValue = b.ngay_dat_hang ? new Date(b.ngay_dat_hang).getTime() : 0;
      } else if (sortBy === 'tong_tien') {
        aValue = a.tong_tien;
        bValue = b.tong_tien;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });
    
    setFilteredList(sorted);
  }, [searchTerm, donHangList, sortBy, sortOrder]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getAllDonHang();
      setDonHangList(data);
      setFilteredList(data);
    } catch (error: unknown) {
      console.error('Error loading data:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Lỗi không xác định';
      toast.error('Không thể tải dữ liệu: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenViewDialog = async (donHang: DonHang) => {
    try {
      const fullDonHang = await getDonHangById(donHang.don_hang_id);
      setSelectedDonHang(fullDonHang);
      setIsViewDialogOpen(true);
    } catch (error) {
      console.error('Error loading order details:', error);
      toast.error('Không thể tải chi tiết đơn hàng');
    }
  };

  const handleOpenUpdateDialog = (donHang: DonHang) => {
    setSelectedDonHang(donHang);
    setFormData({
      trang_thai: donHang.trang_thai,
    });
    setIsUpdateDialogOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDonHang || !formData.trang_thai) {
      toast.error('Vui lòng chọn trạng thái');
      return;
    }

    setFormLoading(true);
    try {
      await updateDonHang(selectedDonHang.don_hang_id, formData);
      toast.success('Cập nhật đơn hàng thành công');
      setIsUpdateDialogOpen(false);
      await loadData();
      setSelectedDonHang(null);
    } catch (error: unknown) {
      console.error('Error updating don hang:', error);
      let errorMessage = 'Lỗi không xác định';
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string; error?: string }; status?: number } };
        errorMessage = axiosError.response?.data?.message || 
                      axiosError.response?.data?.error || 
                      `Lỗi ${axiosError.response?.status || 500}`;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error('Lỗi: ' + errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
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

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ComponentType<{ className?: string }> }> = {
      'Chờ xác nhận': { label: 'Chờ xác nhận', variant: 'default', icon: Clock },
      'Đang xử lý': { label: 'Đang xử lý', variant: 'default', icon: Clock },
      'Đã xác nhận': { label: 'Đã xác nhận', variant: 'default', icon: CheckCircle2 },
      'Đang giao hàng': { label: 'Đang giao hàng', variant: 'default', icon: Truck },
      'Đã giao hàng': { label: 'Đã giao hàng', variant: 'default', icon: Package },
      'Đã hủy': { label: 'Đã hủy', variant: 'destructive', icon: XCircle },
      'Hoàn thành': { label: 'Hoàn thành', variant: 'default', icon: CheckCircle2 }
    };
    
    const statusInfo = statusMap[status] || { label: status, variant: 'secondary' as const, icon: Clock };
    const Icon = statusInfo.icon;
    
    return (
      <Badge variant={statusInfo.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {statusInfo.label}
      </Badge>
    );
  };

  const getImageUrl = (url?: string | null) => {
    if (!url) return 'https://via.placeholder.com/64x80/6366f1/ffffff?text=No+Image';
    if (url.startsWith('http')) return url;
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    return `${apiBaseUrl}${url}`;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="container mx-auto p-4 sm:p-6 space-y-6 max-w-7xl">
        {/* Header với nút quay về */}
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="outline"
            onClick={() => navigate('/admin/dashboard')}
            className="gap-2 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay về Dashboard
          </Button>
        </div>

        <Card className="border shadow-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/admin/dashboard')}
                className="hover:bg-accent"
                title="Quay về Dashboard"
              >
                <Home className="h-5 w-5" />
              </Button>
              <CardTitle className="text-2xl font-bold flex items-center gap-2 from-primary to-primary/70 bg-clip-text text-transparent dark:from-primary/90 dark:to-primary/70">
                <Package className="h-6 w-6 text-primary" />
                Quản lý đơn hàng
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search và Sắp xếp */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo mã đơn, tên người nhận, email, SĐT..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'don_hang_id' | 'ngay_dat_hang' | 'tong_tien')}
                  className="px-3 py-2 h-10 border rounded-md text-sm bg-background border-slate-200 dark:border-slate-800 focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="ngay_dat_hang">Sắp xếp theo ngày đặt</option>
                  <option value="don_hang_id">Sắp xếp theo ID</option>
                  <option value="tong_tien">Sắp xếp theo tổng tiền</option>
                </select>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                  className="px-3 py-2 h-10 border rounded-md text-sm bg-background border-slate-200 dark:border-slate-800 focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="desc">Mới nhất</option>
                  <option value="asc">Cũ nhất</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredList.length === 0 ? (
            <div className="text-center py-12 text-slate-600 dark:text-slate-400">
              Không có đơn hàng nào
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold">Mã đơn</th>
                    <th className="text-left p-3 font-semibold">Khách hàng</th>
                    <th className="text-left p-3 font-semibold">Người nhận</th>
                    <th className="text-left p-3 font-semibold">Tổng tiền</th>
                    <th className="text-left p-3 font-semibold">Trạng thái</th>
                    <th className="text-left p-3 font-semibold">Ngày đặt</th>
                    <th className="text-left p-3 font-semibold">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredList.map((donHang) => (
                    <tr key={donHang.don_hang_id} className="border-b hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors">
                      <td className="p-3 font-medium">{donHang.ma_don_hang}</td>
                      <td className="p-3">
                        {donHang.khachhang ? (
                          <div>
                            <p className="font-medium">{donHang.khachhang.ho_ten}</p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{donHang.khachhang.email}</p>
                          </div>
                        ) : (
                          <span className="text-slate-500 dark:text-slate-400">Khách vãng lai</span>
                        )}
                      </td>
                      <td className="p-3">
                        <div>
                          <p className="font-medium">{donHang.ten_nguoi_nhan}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{donHang.sdt_nguoi_nhan}</p>
                        </div>
                      </td>
                      <td className="p-3 font-semibold text-primary">{formatPrice(donHang.tong_tien)}</td>
                      <td className="p-3">{getStatusBadge(donHang.trang_thai)}</td>
                      <td className="p-3 text-sm text-slate-600 dark:text-slate-400">
                        {formatDate(donHang.ngay_dat_hang)}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleOpenViewDialog(donHang)}
                            title="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleOpenUpdateDialog(donHang)}
                            title="Cập nhật trạng thái"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết đơn hàng</DialogTitle>
          </DialogHeader>
          {selectedDonHang && (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Mã đơn hàng</label>
                  <p className="text-base font-semibold text-slate-900 dark:text-slate-100">{selectedDonHang.ma_don_hang}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Trạng thái</label>
                  <p className="text-base text-slate-900 dark:text-slate-100">{getStatusBadge(selectedDonHang.trang_thai)}</p>
                </div>
              </div>

              {/* Customer Info */}
              {selectedDonHang.khachhang && (
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Khách hàng</label>
                  <p className="text-base text-slate-900 dark:text-slate-100">
                    {selectedDonHang.khachhang.ho_ten} ({selectedDonHang.khachhang.email})
                  </p>
                </div>
              )}

              {/* Delivery Info */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Thông tin giao hàng</h3>
                <div className="space-y-2">
                  <p className="text-sm"><strong>Người nhận:</strong> {selectedDonHang.ten_nguoi_nhan}</p>
                  {selectedDonHang.email_nguoi_nhan && (
                    <p className="text-sm"><strong>Email:</strong> {selectedDonHang.email_nguoi_nhan}</p>
                  )}
                  <p className="text-sm"><strong>SĐT:</strong> {selectedDonHang.sdt_nguoi_nhan}</p>
                  <p className="text-sm"><strong>Địa chỉ:</strong> {selectedDonHang.dia_chi_giao_hang}</p>
                  {selectedDonHang.phuongthucvanchuyen && (
                    <p className="text-sm flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      <strong>Vận chuyển:</strong> {selectedDonHang.phuongthucvanchuyen.ten_phuong_thuc}
                    </p>
                  )}
                  {selectedDonHang.phuongthucthanhtoan && (
                    <p className="text-sm flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      <strong>Thanh toán:</strong> {selectedDonHang.phuongthucthanhtoan.ten_phuong_thuc}
                    </p>
                  )}
                </div>
              </div>

              {/* Order Items */}
              {selectedDonHang.chitietdonhang && selectedDonHang.chitietdonhang.length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Sản phẩm</h3>
                  <div className="space-y-3">
                    {selectedDonHang.chitietdonhang.map((item, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        {item.sach?.anh_bia_url && (
                          <img
                            src={getImageUrl(item.sach.anh_bia_url)}
                            alt={item.sach.ten_sach || 'Sách'}
                            className="w-16 h-20 object-cover rounded-md border"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64x80/6366f1/ffffff?text=No+Image';
                            }}
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-semibold">{item.sach?.ten_sach || 'Sách'}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Số lượng: {item.so_luong} x {formatPrice(item.gia_luc_mua)}
                          </p>
                        </div>
                        <p className="font-bold text-primary">
                          {formatPrice(item.gia_luc_mua * item.so_luong)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Order Summary */}
              <div className="border-t pt-4 space-y-2">
                <h3 className="font-semibold mb-3">Tóm tắt đơn hàng</h3>
                <div className="flex justify-between text-sm">
                  <span>Tạm tính:</span>
                  <span className="font-semibold">{formatPrice(selectedDonHang.tam_tinh)}</span>
                </div>
                {selectedDonHang.phi_van_chuyen && (
                  <div className="flex justify-between text-sm">
                    <span>Phí vận chuyển:</span>
                    <span className="font-semibold">{formatPrice(selectedDonHang.phi_van_chuyen)}</span>
                  </div>
                )}
                {selectedDonHang.giam_gia_voucher && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Giảm giá voucher:</span>
                    <span className="font-semibold">-{formatPrice(selectedDonHang.giam_gia_voucher)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Tổng cộng:</span>
                  <span className="text-primary">{formatPrice(selectedDonHang.tong_tien)}</span>
                </div>
              </div>

              {/* Dates */}
              <div className="border-t pt-4 grid grid-cols-2 gap-4 text-sm">
                {selectedDonHang.ngay_dat_hang && (
                  <div>
                    <label className="text-slate-600 dark:text-slate-400">Ngày đặt hàng:</label>
                    <p className="font-medium">{formatDate(selectedDonHang.ngay_dat_hang)}</p>
                  </div>
                )}
                {selectedDonHang.ngay_cap_nhat && (
                  <div>
                    <label className="text-slate-600 dark:text-slate-400">Ngày cập nhật:</label>
                    <p className="font-medium">{formatDate(selectedDonHang.ngay_cap_nhat)}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cập nhật trạng thái đơn hàng</DialogTitle>
            <DialogDescription>
              Cập nhật trạng thái cho đơn hàng {selectedDonHang?.ma_don_hang}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Trạng thái *</label>
              <select
                value={formData.trang_thai || ''}
                onChange={(e) => setFormData({ ...formData, trang_thai: e.target.value })}
                className="w-full px-3 py-2 border rounded-md text-sm bg-background border-slate-200 dark:border-slate-800 focus:border-primary focus:ring-2 focus:ring-primary/20"
                required
              >
                <option value="">Chọn trạng thái</option>
                <option value="Chờ xác nhận">Chờ xác nhận</option>
                <option value="Đang xử lý">Đang xử lý</option>
                <option value="Đã xác nhận">Đã xác nhận</option>
                <option value="Đang giao hàng">Đang giao hàng</option>
                <option value="Đã giao hàng">Đã giao hàng</option>
                <option value="Hoàn thành">Hoàn thành</option>
                <option value="Đã hủy">Đã hủy</option>
              </select>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsUpdateDialogOpen(false)}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={formLoading}>
                {formLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang cập nhật...
                  </>
                ) : (
                  'Cập nhật'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
};

export default AdminDonHang;


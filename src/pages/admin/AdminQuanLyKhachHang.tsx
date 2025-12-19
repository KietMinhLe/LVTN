import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import {
  getAllKhachHang,
  getKhachHangById,
  searchKhachHang,
  // updateKhachHang, // Đã ẩn chức năng sửa ở giao diện nhưng giữ lại để backend vẫn hoạt động
  toggleKhachHangStatus,
  deleteKhachHang,
  type KhachHang,
  // type UpdateKhachHangRequest, // Đã ẩn chức năng sửa ở giao diện nhưng giữ lại để backend vẫn hoạt động
} from '../../services/khachHangService';
import { Trash2, Eye, Search, Loader2, ArrowLeft, Home, Users, Lock, Unlock, RefreshCw, ArrowUpDown, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const AdminQuanLyKhachHang = () => {
  const navigate = useNavigate();
  const [khachHangList, setKhachHangList] = useState<KhachHang[]>([]);
  const [filteredKhachHangList, setFilteredKhachHangList] = useState<KhachHang[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  // const [isDialogOpen, setIsDialogOpen] = useState(false); // Đã ẩn chức năng sửa ở giao diện
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isToggleStatusDialogOpen, setIsToggleStatusDialogOpen] = useState(false);
  const [selectedKhachHang, setSelectedKhachHang] = useState<KhachHang | null>(null);
  
  // Sắp xếp
  const [sortBy, setSortBy] = useState<'khach_hang_id' | 'ho_ten' | 'email' | 'ngay_tham_gia'>('khach_hang_id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  // Form state - Đã ẩn chức năng sửa ở giao diện nhưng giữ lại để backend vẫn hoạt động
  // const [formData, setFormData] = useState<UpdateKhachHangRequest>({
  //   ho_ten: '',
  //   so_dien_thoai: '',
  //   ngay_sinh: '',
  // });
  const [formLoading, setFormLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAllKhachHang(currentPage, itemsPerPage);
      setKhachHangList(response.data);
      setFilteredKhachHangList(response.data);
      if (response.pagination) {
        setTotalPages(response.pagination.totalPages);
        setTotalItems(response.pagination.totalItems);
      }
    } catch (error: unknown) {
      console.error('Error loading data:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Lỗi không xác định';
      toast.error('Không thể tải dữ liệu: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  // Load dữ liệu
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter và sắp xếp khách hàng
  useEffect(() => {
    let filtered = khachHangList;
    
    // Filter theo search term
    if (searchTerm.trim() !== '') {
      filtered = khachHangList.filter(
        (kh) =>
          kh.ho_ten.toLowerCase().includes(searchTerm.toLowerCase()) ||
          kh.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (kh.so_dien_thoai && kh.so_dien_thoai.includes(searchTerm))
      );
    }
    
    // Sắp xếp
    const sorted = [...filtered].sort((a, b) => {
      let aValue: string | number = 0;
      let bValue: string | number = 0;
      
      if (sortBy === 'ho_ten') {
        aValue = a.ho_ten.toLowerCase();
        bValue = b.ho_ten.toLowerCase();
      } else if (sortBy === 'email') {
        aValue = a.email.toLowerCase();
        bValue = b.email.toLowerCase();
      } else if (sortBy === 'khach_hang_id') {
        aValue = a.khach_hang_id;
        bValue = b.khach_hang_id;
      } else if (sortBy === 'ngay_tham_gia') {
        aValue = a.ngay_tham_gia ? new Date(a.ngay_tham_gia).getTime() : 0;
        bValue = b.ngay_tham_gia ? new Date(b.ngay_tham_gia).getTime() : 0;
      } else {
        aValue = a.khach_hang_id;
        bValue = b.khach_hang_id;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });
    
    setFilteredKhachHangList(sorted);
  }, [searchTerm, khachHangList, sortBy, sortOrder]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      await loadData();
      return;
    }

    setLoading(true);
    try {
      const results = await searchKhachHang({
        ho_ten: searchTerm,
        email: searchTerm,
        so_dien_thoai: searchTerm,
      });
      setKhachHangList(results);
      setFilteredKhachHangList(results);
    } catch (error: unknown) {
      console.error('Error searching:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Lỗi không xác định';
      toast.error('Không thể tìm kiếm: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Đã ẩn chức năng sửa ở giao diện nhưng giữ lại để backend vẫn hoạt động
  // const handleOpenEditDialog = (khachHang: KhachHang) => {
  //   setSelectedKhachHang(khachHang);
  //   setFormData({
  //     ho_ten: khachHang.ho_ten,
  //     so_dien_thoai: khachHang.so_dien_thoai || '',
  //     ngay_sinh: khachHang.ngay_sinh ? new Date(khachHang.ngay_sinh).toISOString().split('T')[0] : '',
  //   });
  //   setIsDialogOpen(true);
  // };

  const handleOpenViewDialog = async (khachHang: KhachHang) => {
    try {
      setLoading(true);
      const fullData = await getKhachHangById(khachHang.khach_hang_id);
      setSelectedKhachHang(fullData);
      setIsViewDialogOpen(true);
    } catch (error: unknown) {
      console.error('Error loading customer details:', error);
      toast.error('Không thể tải thông tin chi tiết');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDeleteDialog = (khachHang: KhachHang) => {
    setSelectedKhachHang(khachHang);
    setIsDeleteDialogOpen(true);
  };

  const handleOpenToggleStatusDialog = (khachHang: KhachHang) => {
    setSelectedKhachHang(khachHang);
    setIsToggleStatusDialogOpen(true);
  };

  // Đã ẩn chức năng sửa ở giao diện nhưng giữ lại để backend vẫn hoạt động
  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   
  //   if (!selectedKhachHang) return;

  //   // Validation
  //   if (!formData.ho_ten || formData.ho_ten.trim() === '') {
  //     toast.error('Họ tên không được để trống');
  //     return;
  //   }

  //   setFormLoading(true);
  //   try {
  //     await updateKhachHang(selectedKhachHang.khach_hang_id, formData);
  //     toast.success('Cập nhật thông tin khách hàng thành công');
  //     setIsDialogOpen(false);
  //     await loadData();
  //     setSelectedKhachHang(null);
  //   } catch (error: unknown) {
  //     console.error('Error updating khach hang:', error);
  //     const errorMessage = error instanceof Error 
  //       ? error.message 
  //       : (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Lỗi không xác định';
  //     toast.error('Lỗi: ' + errorMessage);
  //   } finally {
  //     setFormLoading(false);
  //   }
  // };

  const handleDelete = async () => {
    if (!selectedKhachHang) return;

    setFormLoading(true);
    try {
      await deleteKhachHang(selectedKhachHang.khach_hang_id);
      toast.success('Xóa khách hàng thành công');
      setIsDeleteDialogOpen(false);
      await loadData();
      setSelectedKhachHang(null);
    } catch (error: unknown) {
      console.error('Error deleting khach hang:', error);
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

  const handleToggleStatus = async () => {
    if (!selectedKhachHang) return;

    setFormLoading(true);
    try {
      await toggleKhachHangStatus(selectedKhachHang.khach_hang_id);
      toast.success(
        selectedKhachHang.trang_thai 
          ? 'Khóa khách hàng thành công' 
          : 'Mở khóa khách hàng thành công'
      );
      setIsToggleStatusDialogOpen(false);
      await loadData();
      setSelectedKhachHang(null);
    } catch (error: unknown) {
      console.error('Error toggling status:', error);
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('vi-VN');
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
              <div className="flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                <CardTitle className="text-2xl font-bold from-primary to-primary/70 bg-clip-text text-transparent dark:from-primary/90 dark:to-primary/70">
                  Quản lý khách hàng
                </CardTitle>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={loadData}
                className="gap-2 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Làm mới
              </Button>
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
                  placeholder="Tìm kiếm theo tên, email, số điện thoại..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch();
                    }
                  }}
                  className="pl-10 h-10"
                />
              </div>
              <Button onClick={handleSearch} variant="default" className="bg-primary hover:bg-primary/90 h-10">
                <Search className="h-4 w-4 mr-2" />
                Tìm kiếm
              </Button>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-3 py-2 h-10 border rounded-md text-sm bg-background border-slate-200 dark:border-slate-800 focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="khach_hang_id">Sắp xếp theo ID</option>
                <option value="ho_ten">Sắp xếp theo tên</option>
                <option value="email">Sắp xếp theo email</option>
                <option value="ngay_tham_gia">Sắp xếp theo ngày tham gia</option>
              </select>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="px-3 py-2 h-10 border rounded-md text-sm bg-background border-slate-200 dark:border-slate-800 focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="asc">Tăng dần</option>
                <option value="desc">Giảm dần</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredKhachHangList.length === 0 ? (
            <div className="text-center py-12 text-slate-600 dark:text-slate-400">
              Không có khách hàng nào
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-semibold">ID</th>
                      <th className="text-left p-3 font-semibold">Họ tên</th>
                      <th className="text-left p-3 font-semibold">Email</th>
                      <th className="text-left p-3 font-semibold">Số điện thoại</th>
                      <th className="text-left p-3 font-semibold">Ngày sinh</th>
                      <th className="text-left p-3 font-semibold">Điểm F-Point</th>
                      <th className="text-left p-3 font-semibold">Ngày tham gia</th>
                      <th className="text-left p-3 font-semibold">Trạng thái</th>
                      <th className="text-left p-3 font-semibold">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredKhachHangList.map((khachHang) => (
                      <tr key={khachHang.khach_hang_id} className="border-b hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors">
                        <td className="p-3">{khachHang.khach_hang_id}</td>
                        <td className="p-3 font-medium">{khachHang.ho_ten}</td>
                        <td className="p-3">{khachHang.email}</td>
                        <td className="p-3">{khachHang.so_dien_thoai || 'N/A'}</td>
                        <td className="p-3">{formatDate(khachHang.ngay_sinh)}</td>
                        <td className="p-3 font-semibold">{khachHang.diem_fpoint || 0}</td>
                        <td className="p-3">{formatDate(khachHang.ngay_tham_gia)}</td>
                        <td className="p-3">
                          <Badge variant={khachHang.trang_thai ? 'default' : 'destructive'} className="flex items-center gap-1 w-fit">
                            {khachHang.trang_thai ? (
                              <>
                                <CheckCircle2 className="h-3 w-3" />
                                <span>Hoạt động</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3" />
                                <span>Đã khóa</span>
                              </>
                            )}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleOpenViewDialog(khachHang)}
                              title="Xem chi tiết"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleOpenToggleStatusDialog(khachHang)}
                              title={khachHang.trang_thai ? 'Khóa' : 'Mở khóa'}
                              className={khachHang.trang_thai ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}
                            >
                              {khachHang.trang_thai ? (
                                <Lock className="h-4 w-4" />
                              ) : (
                                <Unlock className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleOpenDeleteDialog(khachHang)}
                              title="Xóa"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {!searchTerm && totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Hiển thị {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} trong tổng số {totalItems} khách hàng
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1 || loading}
                    >
                      Trước
                    </Button>
                    <span className="text-sm">
                      Trang {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages || loading}
                    >
                      Sau
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết khách hàng</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết của khách hàng
            </DialogDescription>
          </DialogHeader>
          {selectedKhachHang && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">ID</label>
                  <p className="text-base font-semibold text-slate-900 dark:text-slate-100">{selectedKhachHang.khach_hang_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Trạng thái</label>
                  <p className="text-base">
                    <Badge variant={selectedKhachHang.trang_thai ? 'default' : 'destructive'} className="flex items-center gap-1 w-fit">
                      {selectedKhachHang.trang_thai ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Hoạt động</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3" />
                          <span>Đã khóa</span>
                        </>
                      )}
                    </Badge>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Họ tên</label>
                  <p className="text-base text-slate-900 dark:text-slate-100">{selectedKhachHang.ho_ten}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                  <p className="text-base text-slate-900 dark:text-slate-100">{selectedKhachHang.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Số điện thoại</label>
                  <p className="text-base text-slate-900 dark:text-slate-100">{selectedKhachHang.so_dien_thoai || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Ngày sinh</label>
                  <p className="text-base text-slate-900 dark:text-slate-100">{formatDate(selectedKhachHang.ngay_sinh)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Điểm F-Point</label>
                  <p className="text-base font-semibold text-slate-900 dark:text-slate-100">{selectedKhachHang.diem_fpoint || 0}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Ngày tham gia</label>
                  <p className="text-base text-slate-900 dark:text-slate-100">{formatDateTime(selectedKhachHang.ngay_tham_gia)}</p>
                </div>
              </div>

              {/* Danh sách đơn hàng */}
              {selectedKhachHang.donhang && selectedKhachHang.donhang.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Đơn hàng gần đây</label>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="text-left p-2 text-sm font-medium">Mã đơn</th>
                          <th className="text-left p-2 text-sm font-medium">Tổng tiền</th>
                          <th className="text-left p-2 text-sm font-medium">Trạng thái</th>
                          <th className="text-left p-2 text-sm font-medium">Ngày đặt</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedKhachHang.donhang.map((donHang) => (
                          <tr key={donHang.don_hang_id} className="border-t">
                            <td className="p-2 text-sm font-mono">{donHang.ma_don_hang}</td>
                            <td className="p-2 text-sm">
                              {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND',
                              }).format(donHang.tong_tien)}
                            </td>
                            <td className="p-2">
                              <Badge variant="outline">{donHang.trang_thai}</Badge>
                            </td>
                            <td className="p-2 text-sm">{formatDateTime(donHang.ngay_dat_hang)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa khách hàng</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa khách hàng <strong>{selectedKhachHang?.ho_ten}</strong> không?
              <br />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                (Tài khoản sẽ bị khóa thay vì xóa hoàn toàn)
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={formLoading}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={formLoading}
            >
              {formLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                'Xóa'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toggle Status Dialog */}
      <Dialog open={isToggleStatusDialogOpen} onOpenChange={setIsToggleStatusDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className={`text-xl font-bold flex items-center gap-2 ${
              selectedKhachHang?.trang_thai ? 'text-destructive' : 'text-green-600'
            }`}>
              {selectedKhachHang?.trang_thai ? (
                <>
                  <Lock className="h-5 w-5" />
                  Xác nhận khóa tài khoản
                </>
              ) : (
                <>
                  <Unlock className="h-5 w-5" />
                  Xác nhận mở khóa tài khoản
                </>
              )}
            </DialogTitle>
            <DialogDescription className="pt-4 space-y-3">
              {selectedKhachHang && (
                <>
                  <div className={`rounded-lg p-4 border ${
                    selectedKhachHang.trang_thai 
                      ? 'bg-destructive/10 border-destructive/20' 
                      : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  }`}>
                    <p className={`text-base font-semibold mb-2 ${
                      selectedKhachHang.trang_thai ? 'text-destructive' : 'text-green-800 dark:text-green-200'
                    }`}>
                      Bạn có chắc chắn muốn {selectedKhachHang.trang_thai ? 'khóa' : 'mở khóa'} tài khoản này không?
                    </p>
                    <div className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                      <p>
                        <span className="font-medium">Khách hàng:</span> {selectedKhachHang.ho_ten}
                      </p>
                      <p>
                        <span className="font-medium">Email:</span> {selectedKhachHang.email}
                      </p>
                      {selectedKhachHang.khach_hang_id && (
                        <p>
                          <span className="font-medium">ID:</span> {selectedKhachHang.khach_hang_id}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className={`rounded-lg p-3 border ${
                    selectedKhachHang.trang_thai 
                      ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                      : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                  }`}>
                    <p className={`text-sm font-medium mb-2 ${
                      selectedKhachHang.trang_thai 
                        ? 'text-yellow-800 dark:text-yellow-200' 
                        : 'text-blue-800 dark:text-blue-200'
                    }`}>
                      {selectedKhachHang.trang_thai ? '⚠️ Cảnh báo:' : 'ℹ️ Thông tin:'}
                    </p>
                    <ul className={`text-sm space-y-1 list-disc list-inside ${
                      selectedKhachHang.trang_thai 
                        ? 'text-yellow-700 dark:text-yellow-300' 
                        : 'text-blue-700 dark:text-blue-300'
                    }`}>
                      {selectedKhachHang.trang_thai ? (
                        <>
                          <li>Khách hàng sẽ không thể đăng nhập vào hệ thống</li>
                          <li>Khách hàng sẽ không thể thực hiện các giao dịch</li>
                          <li>Có thể mở khóa lại bất cứ lúc nào</li>
                        </>
                      ) : (
                        <>
                          <li>Khách hàng sẽ có thể đăng nhập vào hệ thống</li>
                          <li>Khách hàng sẽ có thể thực hiện các giao dịch bình thường</li>
                          <li>Tài khoản sẽ được kích hoạt lại</li>
                        </>
                      )}
                    </ul>
                  </div>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsToggleStatusDialogOpen(false)}
              disabled={formLoading}
            >
              Hủy
            </Button>
            <Button
              variant={selectedKhachHang?.trang_thai ? 'destructive' : 'default'}
              onClick={handleToggleStatus}
              disabled={formLoading}
              className="gap-2"
            >
              {formLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  {selectedKhachHang?.trang_thai ? (
                    <>
                      <Lock className="h-4 w-4" />
                      Xác nhận khóa
                    </>
                  ) : (
                    <>
                      <Unlock className="h-4 w-4" />
                      Xác nhận mở khóa
                    </>
                  )}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
};

export default AdminQuanLyKhachHang;

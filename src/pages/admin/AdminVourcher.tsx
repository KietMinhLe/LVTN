import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import {
  getAllVoucher,
  createVoucher,
  updateVoucher,
  deleteVoucher,
  type Voucher,
  type CreateVoucherRequest,
} from '../../services/voucherService';
import { Plus, Pencil, Trash2, Eye, Search, Loader2, ArrowLeft, Home, Ticket, ArrowUpDown, Filter, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const AdminVourcher = () => {
  const navigate = useNavigate();
  const [voucherList, setVoucherList] = useState<Voucher[]>([]);
  const [filteredVoucherList, setFilteredVoucherList] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Sắp xếp
  const [sortBy, setSortBy] = useState<'ma_voucher' | 'ngay_bat_dau' | 'ngay_het_han'>('ma_voucher');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Form state
  const [formData, setFormData] = useState<CreateVoucherRequest>({
    ma_voucher: '',
    loai_giam_gia: 'tiền',
    gia_tri_giam: 0,
    don_hang_toi_thieu: null,
    giam_toi_da: null,
    so_luong_toi_da: null,
    ngay_bat_dau: null,
    ngay_het_han: null,
    trang_thai: true,
  });
  const [formLoading, setFormLoading] = useState(false);

  // Load dữ liệu
  useEffect(() => {
    loadData();
  }, []);

  // Filter và sắp xếp voucher
  useEffect(() => {
    let filtered = voucherList;
    
    // Filter theo search term
    if (searchTerm.trim() !== '') {
      filtered = voucherList.filter(
        (v) =>
          v.ma_voucher.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter theo trạng thái
    if (filterStatus === 'active') {
      filtered = filtered.filter(v => v.trang_thai === true);
    } else if (filterStatus === 'inactive') {
      filtered = filtered.filter(v => v.trang_thai === false);
    }
    
    // Sắp xếp
    const sorted = [...filtered].sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';
      
      if (sortBy === 'ma_voucher') {
        aValue = a.ma_voucher.toLowerCase();
        bValue = b.ma_voucher.toLowerCase();
      } else if (sortBy === 'ngay_bat_dau') {
        aValue = a.ngay_bat_dau ? new Date(a.ngay_bat_dau).getTime() : 0;
        bValue = b.ngay_bat_dau ? new Date(b.ngay_bat_dau).getTime() : 0;
      } else if (sortBy === 'ngay_het_han') {
        aValue = a.ngay_het_han ? new Date(a.ngay_het_han).getTime() : 0;
        bValue = b.ngay_het_han ? new Date(b.ngay_het_han).getTime() : 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });
    
    setFilteredVoucherList(sorted);
  }, [searchTerm, filterStatus, voucherList, sortBy, sortOrder]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getAllVoucher();
      setVoucherList(data);
      setFilteredVoucherList(data);
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

  const handleOpenAddDialog = () => {
    setIsEditMode(false);
    setSelectedVoucher(null);
    setFormData({
      ma_voucher: '',
      loai_giam_gia: 'tiền',
      gia_tri_giam: 0,
      don_hang_toi_thieu: null,
      giam_toi_da: null,
      so_luong_toi_da: null,
      ngay_bat_dau: null,
      ngay_het_han: null,
      trang_thai: true,
    });
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (voucher: Voucher) => {
    setIsEditMode(true);
    setSelectedVoucher(voucher);
    setFormData({
      ma_voucher: voucher.ma_voucher,
      loai_giam_gia: voucher.loai_giam_gia,
      gia_tri_giam: voucher.gia_tri_giam,
      don_hang_toi_thieu: voucher.don_hang_toi_thieu,
      giam_toi_da: voucher.giam_toi_da,
      so_luong_toi_da: voucher.so_luong_toi_da,
      ngay_bat_dau: voucher.ngay_bat_dau ? voucher.ngay_bat_dau.split('T')[0] : null,
      ngay_het_han: voucher.ngay_het_han ? voucher.ngay_het_han.split('T')[0] : null,
      trang_thai: voucher.trang_thai ?? true,
    });
    setIsDialogOpen(true);
  };

  const handleOpenViewDialog = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    setIsViewDialogOpen(true);
  };

  const handleOpenDeleteDialog = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.ma_voucher.trim()) {
      toast.error('Dữ liệu không hợp lệ. Vui lòng nhập lại');
      return;
    }

    if (!formData.loai_giam_gia) {
      toast.error('Dữ liệu không hợp lệ. Vui lòng nhập lại');
      return;
    }

    if (!formData.gia_tri_giam || formData.gia_tri_giam <= 0) {
      toast.error('Giá trị giảm phải lớn hơn 0');
      return;
    }

    if (formData.loai_giam_gia === 'phần trăm' && formData.gia_tri_giam > 100) {
      toast.error('Giảm giá phần trăm không được vượt quá 100%');
      return;
    }

    setFormLoading(true);
    try {
      const submitData = {
        ...formData,
        ma_voucher: formData.ma_voucher.trim().toUpperCase(),
        don_hang_toi_thieu: formData.don_hang_toi_thieu || null,
        giam_toi_da: formData.giam_toi_da || null,
        so_luong_toi_da: formData.so_luong_toi_da || null,
        ngay_bat_dau: formData.ngay_bat_dau || null,
        ngay_het_han: formData.ngay_het_han || null,
      };

      if (isEditMode && selectedVoucher) {
        await updateVoucher(selectedVoucher.voucher_id, submitData);
        toast.success('Cập nhật voucher thành công');
      } else {
        await createVoucher(submitData);
        toast.success('Thêm voucher thành công');
      }
      
      setIsDialogOpen(false);
      await loadData();
      resetForm();
    } catch (error: unknown) {
      console.error('Error saving voucher:', error);
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
      console.error('Full error:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedVoucher) return;

    setFormLoading(true);
    try {
      await deleteVoucher(selectedVoucher.voucher_id);
      toast.success('Xóa voucher thành công');
      setIsDeleteDialogOpen(false);
      await loadData();
      setSelectedVoucher(null);
    } catch (error: unknown) {
      console.error('Error deleting voucher:', error);
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

  const resetForm = () => {
    setFormData({
      ma_voucher: '',
      loai_giam_gia: 'tiền',
      gia_tri_giam: 0,
      don_hang_toi_thieu: null,
      giam_toi_da: null,
      so_luong_toi_da: null,
      ngay_bat_dau: null,
      ngay_het_han: null,
      trang_thai: true,
    });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const isVoucherActive = (voucher: Voucher) => {
    if (!voucher.trang_thai) return false;
    const now = new Date();
    const startDate = voucher.ngay_bat_dau ? new Date(voucher.ngay_bat_dau) : null;
    const endDate = voucher.ngay_het_han ? new Date(voucher.ngay_het_han) : null;
    
    if (startDate && now < startDate) return false;
    if (endDate && now > endDate) return false;
    if (voucher.so_luong_toi_da !== null && (voucher.so_luong_da_dung || 0) >= voucher.so_luong_toi_da) return false;
    
    return true;
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
                <Ticket className="h-6 w-6 text-primary" />
                Quản lý Voucher
              </CardTitle>
            </div>
            <Button onClick={handleOpenAddDialog} className="gap-2 bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              Thêm voucher mới
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search và Filter */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo mã voucher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
                  className="px-3 py-2 h-10 border rounded-md text-sm bg-background border-slate-200 dark:border-slate-800 focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">Tất cả</option>
                  <option value="active">Đang hoạt động</option>
                  <option value="inactive">Không hoạt động</option>
                </select>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'ma_voucher' | 'ngay_bat_dau' | 'ngay_het_han')}
                  className="px-3 py-2 h-10 border rounded-md text-sm bg-background border-slate-200 dark:border-slate-800 focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="ma_voucher">Sắp xếp theo mã</option>
                  <option value="ngay_bat_dau">Sắp xếp theo ngày bắt đầu</option>
                  <option value="ngay_het_han">Sắp xếp theo ngày hết hạn</option>
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
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredVoucherList.length === 0 ? (
            <div className="text-center py-12 text-slate-600 dark:text-slate-400">
              Không có voucher nào
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold">ID</th>
                    <th className="text-left p-3 font-semibold">Mã voucher</th>
                    <th className="text-left p-3 font-semibold">Loại giảm</th>
                    <th className="text-left p-3 font-semibold">Giá trị giảm</th>
                    <th className="text-left p-3 font-semibold">Đơn hàng tối thiểu</th>
                    <th className="text-left p-3 font-semibold">Ngày bắt đầu</th>
                    <th className="text-left p-3 font-semibold">Ngày hết hạn</th>
                    <th className="text-left p-3 font-semibold">Trạng thái</th>
                    <th className="text-left p-3 font-semibold">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVoucherList.map((voucher) => (
                    <tr 
                      key={voucher.voucher_id} 
                      className="border-b hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors cursor-pointer"
                      onClick={() => handleOpenViewDialog(voucher)}
                    >
                      <td className="p-3">{voucher.voucher_id}</td>
                      <td className="p-3 font-medium">
                        <div className="flex items-center gap-2">
                          <Ticket className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                          <span 
                            className="font-mono hover:text-primary dark:hover:text-primary/80 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenViewDialog(voucher);
                            }}
                          >
                            {voucher.ma_voucher}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-1 rounded text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                          {voucher.loai_giam_gia === 'phần trăm' ? 'Phần trăm' : 'Tiền'}
                        </span>
                      </td>
                      <td className="p-3">
                        {voucher.loai_giam_gia === 'phần trăm' 
                          ? `${voucher.gia_tri_giam}%`
                          : formatCurrency(voucher.gia_tri_giam)
                        }
                      </td>
                      <td className="p-3 text-sm text-slate-600 dark:text-slate-400">
                        {voucher.don_hang_toi_thieu ? formatCurrency(voucher.don_hang_toi_thieu) : 'Không giới hạn'}
                      </td>
                      <td className="p-3 text-sm text-slate-600 dark:text-slate-400">
                        {formatDate(voucher.ngay_bat_dau)}
                      </td>
                      <td className="p-3 text-sm text-slate-600 dark:text-slate-400">
                        {formatDate(voucher.ngay_het_han)}
                      </td>
                      <td className="p-3">
                        <Badge variant={isVoucherActive(voucher) ? 'default' : 'secondary'} className="flex items-center gap-1 w-fit">
                          {isVoucherActive(voucher) ? (
                            <>
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Hoạt động</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3" />
                              <span>Không hoạt động</span>
                            </>
                          )}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleOpenViewDialog(voucher)}
                            title="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleOpenEditDialog(voucher)}
                            title="Sửa"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleOpenDeleteDialog(voucher)}
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
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Sửa thông tin voucher' : 'Thêm voucher mới'}</DialogTitle>
            <DialogDescription>
              {isEditMode ? 'Cập nhật thông tin voucher' : 'Điền đầy đủ thông tin để thêm voucher mới'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4" lang="vi">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Mã voucher *</label>
                <Input
                  value={formData.ma_voucher}
                  onChange={(e) => setFormData({ ...formData, ma_voucher: e.target.value.toUpperCase() })}
                  placeholder="Ví dụ: SALE2024"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Loại giảm giá *</label>
                <select
                  value={formData.loai_giam_gia}
                  onChange={(e) => setFormData({ ...formData, loai_giam_gia: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-input bg-transparent text-sm"
                >
                  <option value="tiền">Giảm theo tiền (VND)</option>
                  <option value="phần trăm">Giảm theo phần trăm (%)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Giá trị giảm *</label>
                <Input
                  type="number"
                  value={formData.gia_tri_giam || ''}
                  onChange={(e) => setFormData({ ...formData, gia_tri_giam: parseFloat(e.target.value) || 0 })}
                  placeholder={formData.loai_giam_gia === 'phần trăm' ? 'Ví dụ: 10 (10%)' : 'Ví dụ: 50000'}
                  min="0"
                  max={formData.loai_giam_gia === 'phần trăm' ? '100' : undefined}
                  step={formData.loai_giam_gia === 'phần trăm' ? '1' : '1000'}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Đơn hàng tối thiểu</label>
                <Input
                  type="number"
                  value={formData.don_hang_toi_thieu || ''}
                  onChange={(e) => setFormData({ ...formData, don_hang_toi_thieu: e.target.value ? parseFloat(e.target.value) : null })}
                  placeholder="Ví dụ: 100000 (0 = không giới hạn)"
                  min="0"
                  step="1000"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Giảm tối đa</label>
                <Input
                  type="number"
                  value={formData.giam_toi_da || ''}
                  onChange={(e) => setFormData({ ...formData, giam_toi_da: e.target.value ? parseFloat(e.target.value) : null })}
                  placeholder="Ví dụ: 50000 (để trống = không giới hạn)"
                  min="0"
                  step="1000"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Số lượng tối đa</label>
                <Input
                  type="number"
                  value={formData.so_luong_toi_da || ''}
                  onChange={(e) => setFormData({ ...formData, so_luong_toi_da: e.target.value ? parseInt(e.target.value) : null })}
                  placeholder="Ví dụ: 100 (để trống = không giới hạn)"
                  min="1"
                  step="1"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Ngày bắt đầu</label>
                <Input
                  type="date"
                  value={formData.ngay_bat_dau || ''}
                  onChange={(e) => setFormData({ ...formData, ngay_bat_dau: e.target.value || null })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Ngày hết hạn</label>
                <Input
                  type="date"
                  value={formData.ngay_het_han || ''}
                  onChange={(e) => setFormData({ ...formData, ngay_het_han: e.target.value || null })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Trạng thái</label>
                <select
                  value={formData.trang_thai ? 'true' : 'false'}
                  onChange={(e) => setFormData({ ...formData, trang_thai: e.target.value === 'true' })}
                  className="w-full h-10 px-3 rounded-md border border-input bg-transparent text-sm"
                >
                  <option value="true">Hoạt động</option>
                  <option value="false">Không hoạt động</option>
                </select>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={formLoading}>
                {formLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  isEditMode ? 'Cập nhật' : 'Thêm mới'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết voucher</DialogTitle>
          </DialogHeader>
          {selectedVoucher && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">ID</label>
                  <p className="text-base text-slate-900 dark:text-slate-100">{selectedVoucher.voucher_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Mã voucher</label>
                  <p className="text-base font-mono font-semibold text-slate-900 dark:text-slate-100">{selectedVoucher.ma_voucher}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Loại giảm giá</label>
                  <p className="text-base text-slate-900 dark:text-slate-100">
                    {selectedVoucher.loai_giam_gia === 'phần trăm' ? 'Phần trăm' : 'Tiền'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Giá trị giảm</label>
                  <p className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    {selectedVoucher.loai_giam_gia === 'phần trăm' 
                      ? `${selectedVoucher.gia_tri_giam}%`
                      : formatCurrency(selectedVoucher.gia_tri_giam)
                    }
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Đơn hàng tối thiểu</label>
                  <p className="text-base text-slate-900 dark:text-slate-100">
                    {selectedVoucher.don_hang_toi_thieu ? formatCurrency(selectedVoucher.don_hang_toi_thieu) : 'Không giới hạn'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Giảm tối đa</label>
                  <p className="text-base text-slate-900 dark:text-slate-100">
                    {selectedVoucher.giam_toi_da ? formatCurrency(selectedVoucher.giam_toi_da) : 'Không giới hạn'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Số lượng tối đa</label>
                  <p className="text-base text-slate-900 dark:text-slate-100">
                    {selectedVoucher.so_luong_toi_da ? selectedVoucher.so_luong_toi_da : 'Không giới hạn'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Số lượng đã dùng</label>
                  <p className="text-base text-slate-900 dark:text-slate-100">
                    {selectedVoucher.so_luong_da_dung || 0}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Ngày bắt đầu</label>
                  <p className="text-base text-slate-900 dark:text-slate-100">{formatDate(selectedVoucher.ngay_bat_dau)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Ngày hết hạn</label>
                  <p className="text-base text-slate-900 dark:text-slate-100">{formatDate(selectedVoucher.ngay_het_han)}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Trạng thái</label>
                <p className="text-base text-slate-900 dark:text-slate-100">
                  <Badge variant={isVoucherActive(selectedVoucher) ? 'default' : 'secondary'} className="flex items-center gap-1 w-fit">
                    {isVoucherActive(selectedVoucher) ? (
                      <>
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Hoạt động</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3" />
                        <span>Không hoạt động</span>
                      </>
                    )}
                  </Badge>
                </p>
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

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-destructive flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Xác nhận xóa voucher
            </DialogTitle>
            <DialogDescription className="pt-4 space-y-3">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <p className="text-base font-semibold text-destructive mb-2">
                  Bạn có chắc chắn muốn xóa voucher này không?
                </p>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  <span className="font-medium">Mã voucher:</span> {selectedVoucher?.ma_voucher}
                </p>
                {selectedVoucher?.voucher_id && (
                  <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                    <span className="font-medium">ID:</span> {selectedVoucher.voucher_id}
                  </p>
                )}
                {selectedVoucher?.gia_tri_giam && (
                  <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                    <span className="font-medium">Giá trị giảm:</span> {selectedVoucher.gia_tri_giam}
                  </p>
                )}
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                  ⚠️ Cảnh báo:
                </p>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 mt-2 space-y-1 list-disc list-inside">
                  <li>Hành động này không thể hoàn tác</li>
                  <li>Tất cả dữ liệu liên quan sẽ bị xóa</li>
                  <li>Nếu voucher đang có đơn hàng, việc xóa có thể gặp lỗi</li>
                </ul>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
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
              className="gap-2"
            >
              {formLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Xác nhận xóa
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

export default AdminVourcher;


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import {
  getAllPhuongThucVanChuyen,
  createPhuongThucVanChuyen,
  updatePhuongThucVanChuyen,
  deletePhuongThucVanChuyen,
  type PhuongThucVanChuyen,
  type CreatePhuongThucVanChuyenRequest,
} from '../../services/phuongThucvanChuyenService';
import { Plus, Pencil, Trash2, Eye, Search, Loader2, ArrowLeft, Home, Truck, ArrowUpDown, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const AdminQuanLyPhuongThucGiaoHang = () => {
  const navigate = useNavigate();
  const [phuongThucList, setPhuongThucList] = useState<PhuongThucVanChuyen[]>([]);
  const [filteredList, setFilteredList] = useState<PhuongThucVanChuyen[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPhuongThuc, setSelectedPhuongThuc] = useState<PhuongThucVanChuyen | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Sắp xếp
  const [sortBy, setSortBy] = useState<'ten_phuong_thuc' | 'phuong_thuc_van_chuyen_id'>('ten_phuong_thuc');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Form state
  const [formData, setFormData] = useState<CreatePhuongThucVanChuyenRequest>({
    ten_phuong_thuc: '',
    mo_ta: null,
    phi_co_ban: null,
    trang_thai: true,
  });
  const [formLoading, setFormLoading] = useState(false);

  // Load dữ liệu
  useEffect(() => {
    loadData();
  }, []);

  // Filter và sắp xếp
  useEffect(() => {
    let filtered = phuongThucList;
    
    // Filter theo search term
    if (searchTerm.trim() !== '') {
      filtered = phuongThucList.filter(
        (pt) =>
          pt.ten_phuong_thuc.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pt.mo_ta?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sắp xếp
    const sorted = [...filtered].sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';
      
      if (sortBy === 'ten_phuong_thuc') {
        aValue = a.ten_phuong_thuc.toLowerCase();
        bValue = b.ten_phuong_thuc.toLowerCase();
      } else if (sortBy === 'phuong_thuc_van_chuyen_id') {
        aValue = a.phuong_thuc_van_chuyen_id;
        bValue = b.phuong_thuc_van_chuyen_id;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });
    
    setFilteredList(sorted);
  }, [searchTerm, phuongThucList, sortBy, sortOrder]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getAllPhuongThucVanChuyen();
      setPhuongThucList(data);
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

  const handleOpenAddDialog = () => {
    setIsEditMode(false);
    setSelectedPhuongThuc(null);
    setFormData({
      ten_phuong_thuc: '',
      mo_ta: null,
      phi_co_ban: null,
      trang_thai: true,
    });
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (phuongThuc: PhuongThucVanChuyen) => {
    setIsEditMode(true);
    setSelectedPhuongThuc(phuongThuc);
    setFormData({
      ten_phuong_thuc: phuongThuc.ten_phuong_thuc,
      mo_ta: phuongThuc.mo_ta || null,
      phi_co_ban: phuongThuc.phi_co_ban || null,
      trang_thai: phuongThuc.trang_thai ?? true,
    });
    setIsDialogOpen(true);
  };

  const handleOpenViewDialog = (phuongThuc: PhuongThucVanChuyen) => {
    setSelectedPhuongThuc(phuongThuc);
    setIsViewDialogOpen(true);
  };

  const handleOpenDeleteDialog = (phuongThuc: PhuongThucVanChuyen) => {
    setSelectedPhuongThuc(phuongThuc);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.ten_phuong_thuc.trim()) {
      toast.error('Vui lòng nhập tên phương thức giao hàng');
      return;
    }

    // Validate phi_co_ban nếu có
    if (formData.phi_co_ban !== null && formData.phi_co_ban !== undefined) {
      const phiCoBan = parseFloat(formData.phi_co_ban.toString());
      if (isNaN(phiCoBan) || phiCoBan < 0) {
        toast.error('Phí cơ bản phải là số dương');
        return;
      }
    }

    setFormLoading(true);
    try {
      const submitData = {
        ...formData,
        phi_co_ban: formData.phi_co_ban !== null && formData.phi_co_ban !== undefined 
          ? parseFloat(formData.phi_co_ban.toString()) 
          : null,
      };

      if (isEditMode && selectedPhuongThuc) {
        await updatePhuongThucVanChuyen(selectedPhuongThuc.phuong_thuc_van_chuyen_id, submitData);
        toast.success('Cập nhật phương thức giao hàng thành công');
      } else {
        await createPhuongThucVanChuyen(submitData);
        toast.success('Thêm phương thức giao hàng thành công');
      }
      
      setIsDialogOpen(false);
      await loadData();
      resetForm();
    } catch (error: unknown) {
      console.error('Error saving phuong thuc giao hang:', error);
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
    if (!selectedPhuongThuc) return;

    setFormLoading(true);
    try {
      await deletePhuongThucVanChuyen(selectedPhuongThuc.phuong_thuc_van_chuyen_id);
      toast.success('Xóa phương thức giao hàng thành công');
      setIsDeleteDialogOpen(false);
      await loadData();
      setSelectedPhuongThuc(null);
    } catch (error: unknown) {
      console.error('Error deleting phuong thuc giao hang:', error);
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
      ten_phuong_thuc: '',
      mo_ta: null,
      phi_co_ban: null,
      trang_thai: true,
    });
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return 'N/A';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
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
                <Truck className="h-6 w-6 text-primary" />
                Quản lý phương thức giao hàng
              </CardTitle>
            </div>
            <Button onClick={handleOpenAddDialog} className="gap-2 bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              Thêm phương thức mới
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search và Sắp xếp */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo tên hoặc mô tả..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'ten_phuong_thuc' | 'phuong_thuc_van_chuyen_id')}
                  className="px-3 py-2 h-10 border rounded-md text-sm bg-background border-slate-200 dark:border-slate-800 focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="ten_phuong_thuc">Sắp xếp theo tên</option>
                  <option value="phuong_thuc_van_chuyen_id">Sắp xếp theo ID</option>
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
          ) : filteredList.length === 0 ? (
            <div className="text-center py-12 text-slate-600 dark:text-slate-400">
              Không có phương thức giao hàng nào
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold">ID</th>
                    <th className="text-left p-3 font-semibold">Tên phương thức</th>
                    <th className="text-left p-3 font-semibold">Mô tả</th>
                    <th className="text-left p-3 font-semibold">Phí cơ bản</th>
                    <th className="text-left p-3 font-semibold">Trạng thái</th>
                    <th className="text-left p-3 font-semibold">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredList.map((phuongThuc) => (
                    <tr key={phuongThuc.phuong_thuc_van_chuyen_id} className="border-b hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors">
                      <td className="p-3">{phuongThuc.phuong_thuc_van_chuyen_id}</td>
                      <td className="p-3 font-medium">{phuongThuc.ten_phuong_thuc}</td>
                      <td className="p-3 text-sm text-slate-600 dark:text-slate-400">
                        {phuongThuc.mo_ta || <span className="text-slate-400">N/A</span>}
                      </td>
                      <td className="p-3 font-medium text-primary">
                        {formatCurrency(phuongThuc.phi_co_ban)}
                      </td>
                      <td className="p-3">
                        {phuongThuc.trang_thai ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-sm">
                            <CheckCircle2 className="h-3 w-3" />
                            Hoạt động
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded text-sm">
                            <XCircle className="h-3 w-3" />
                            Tạm ngưng
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleOpenViewDialog(phuongThuc)}
                            title="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleOpenEditDialog(phuongThuc)}
                            title="Sửa"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleOpenDeleteDialog(phuongThuc)}
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Sửa thông tin phương thức giao hàng' : 'Thêm phương thức giao hàng mới'}</DialogTitle>
            <DialogDescription>
              {isEditMode ? 'Cập nhật thông tin phương thức giao hàng' : 'Điền đầy đủ thông tin để thêm phương thức giao hàng mới'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4" lang="vi" acceptCharset="UTF-8">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tên phương thức giao hàng *</label>
              <Input
                value={formData.ten_phuong_thuc}
                onChange={(e) => setFormData({ ...formData, ten_phuong_thuc: e.target.value })}
                placeholder="Ví dụ: Giao hàng nhanh, Giao hàng tiêu chuẩn..."
                required
                lang="vi"
                autoComplete="off"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Mô tả</label>
              <textarea
                value={formData.mo_ta || ''}
                onChange={(e) => setFormData({ ...formData, mo_ta: e.target.value || null })}
                placeholder="Nhập mô tả về phương thức giao hàng..."
                className="w-full min-h-[100px] px-3 py-2 border rounded-md text-sm bg-background border-slate-200 dark:border-slate-800 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none resize-y"
                lang="vi"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Phí cơ bản (VND)</label>
              <Input
                type="number"
                min="0"
                step="1000"
                value={formData.phi_co_ban !== null && formData.phi_co_ban !== undefined ? formData.phi_co_ban : ''}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ 
                    ...formData, 
                    phi_co_ban: value === '' ? null : parseFloat(value) 
                  });
                }}
                placeholder="Nhập phí cơ bản (ví dụ: 30000)"
                lang="vi"
                autoComplete="off"
              />
              <p className="text-xs text-slate-500">Để trống nếu không có phí cơ bản</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                Trạng thái
                <span className="text-xs text-slate-500">(Hoạt động / Tạm ngưng)</span>
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="trang_thai"
                    checked={formData.trang_thai === true}
                    onChange={() => setFormData({ ...formData, trang_thai: true })}
                    className="w-4 h-4 text-primary"
                  />
                  <span className="text-sm">Hoạt động</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="trang_thai"
                    checked={formData.trang_thai === false}
                    onChange={() => setFormData({ ...formData, trang_thai: false })}
                    className="w-4 h-4 text-primary"
                  />
                  <span className="text-sm">Tạm ngưng</span>
                </label>
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết phương thức giao hàng</DialogTitle>
          </DialogHeader>
          {selectedPhuongThuc && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">ID</label>
                  <p className="text-base text-slate-900 dark:text-slate-100">{selectedPhuongThuc.phuong_thuc_van_chuyen_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Trạng thái</label>
                  <p className="text-base text-slate-900 dark:text-slate-100">
                    {selectedPhuongThuc.trang_thai ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-sm">
                        <CheckCircle2 className="h-3 w-3" />
                        Hoạt động
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded text-sm">
                        <XCircle className="h-3 w-3" />
                        Tạm ngưng
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Tên phương thức giao hàng
                </label>
                <p className="text-base font-semibold text-slate-900 dark:text-slate-100">{selectedPhuongThuc.ten_phuong_thuc}</p>
              </div>
              {selectedPhuongThuc.mo_ta && (
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Mô tả</label>
                  <p className="text-base text-slate-900 dark:text-slate-100 whitespace-pre-wrap">{selectedPhuongThuc.mo_ta}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phí cơ bản</label>
                <p className="text-base font-semibold text-primary">
                  {formatCurrency(selectedPhuongThuc.phi_co_ban)}
                </p>
              </div>
              {selectedPhuongThuc.ngay_tao && (
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Ngày tạo</label>
                  <p className="text-base text-slate-900 dark:text-slate-100">
                    {new Date(selectedPhuongThuc.ngay_tao).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              )}
              {selectedPhuongThuc.ngay_cap_nhat && (
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Ngày cập nhật</label>
                  <p className="text-base text-slate-900 dark:text-slate-100">
                    {new Date(selectedPhuongThuc.ngay_cap_nhat).toLocaleDateString('vi-VN')}
                  </p>
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
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa phương thức giao hàng "{selectedPhuongThuc?.ten_phuong_thuc}"? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={formLoading}>
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
      </div>
    </div>
  );
};

export default AdminQuanLyPhuongThucGiaoHang;


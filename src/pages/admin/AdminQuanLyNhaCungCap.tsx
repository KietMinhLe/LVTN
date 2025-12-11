import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import {
  getAllNhaCungCap,
  createNhaCungCap,
  updateNhaCungCap,
  deleteNhaCungCap,
  type NhaCungCap,
  type CreateNhaCungCapRequest,
} from '../../services/nhaCungCapService';
import { Plus, Pencil, Trash2, Eye, Search, Loader2, ArrowLeft, Home, Truck, ArrowUpDown, Phone, MapPin, Mail } from 'lucide-react';
import { toast } from 'sonner';

const AdminQuanLyNhaCungCap = () => {
  const navigate = useNavigate();
  const [nhaCungCapList, setNhaCungCapList] = useState<NhaCungCap[]>([]);
  const [filteredNhaCungCapList, setFilteredNhaCungCapList] = useState<NhaCungCap[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedNhaCungCap, setSelectedNhaCungCap] = useState<NhaCungCap | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Sắp xếp
  const [sortBy, setSortBy] = useState<'ten_nha_cung_cap' | 'ngay_tao'>('ten_nha_cung_cap');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Form state
  const [formData, setFormData] = useState<CreateNhaCungCapRequest>({
    ten_nha_cung_cap: '',
    email: '',
    dia_chi: '',
    sdt: '',
  });
  const [formLoading, setFormLoading] = useState(false);

  // Load dữ liệu
  useEffect(() => {
    loadData();
  }, []);

  // Filter và sắp xếp nhà cung cấp
  useEffect(() => {
    let filtered = nhaCungCapList;
    
    // Filter theo search term
    if (searchTerm.trim() !== '') {
      filtered = nhaCungCapList.filter(
        (ncc) =>
          ncc.ten_nha_cung_cap.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ncc.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ncc.dia_chi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ncc.sdt?.includes(searchTerm)
      );
    }
    
    // Sắp xếp
    const sorted = [...filtered].sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';
      
      if (sortBy === 'ten_nha_cung_cap') {
        aValue = a.ten_nha_cung_cap.toLowerCase();
        bValue = b.ten_nha_cung_cap.toLowerCase();
      } else if (sortBy === 'ngay_tao') {
        aValue = a.ngay_tao ? new Date(a.ngay_tao).getTime() : 0;
        bValue = b.ngay_tao ? new Date(b.ngay_tao).getTime() : 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });
    
    setFilteredNhaCungCapList(sorted);
  }, [searchTerm, nhaCungCapList, sortBy, sortOrder]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getAllNhaCungCap();
      setNhaCungCapList(data);
      setFilteredNhaCungCapList(data);
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
    setSelectedNhaCungCap(null);
    setFormData({
      ten_nha_cung_cap: '',
      email: '',
      dia_chi: '',
      sdt: '',
    });
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (nhaCungCap: NhaCungCap) => {
    setIsEditMode(true);
    setSelectedNhaCungCap(nhaCungCap);
    setFormData({
      ten_nha_cung_cap: nhaCungCap.ten_nha_cung_cap,
      email: nhaCungCap.email || '',
      dia_chi: nhaCungCap.dia_chi || '',
      sdt: nhaCungCap.sdt || '',
    });
    setIsDialogOpen(true);
  };

  const handleOpenViewDialog = (nhaCungCap: NhaCungCap) => {
    setSelectedNhaCungCap(nhaCungCap);
    setIsViewDialogOpen(true);
  };

  const handleOpenDeleteDialog = (nhaCungCap: NhaCungCap) => {
    setSelectedNhaCungCap(nhaCungCap);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.ten_nha_cung_cap.trim()) {
      toast.error('Vui lòng nhập tên nhà cung cấp');
      return;
    }

    if (!formData.email.trim()) {
      toast.error('Vui lòng nhập email');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      toast.error('Email không hợp lệ');
      return;
    }

    setFormLoading(true);
    try {
      if (isEditMode && selectedNhaCungCap) {
        await updateNhaCungCap(selectedNhaCungCap.nha_cung_cap_id, formData);
        toast.success('Cập nhật nhà cung cấp thành công');
      } else {
        await createNhaCungCap(formData);
        toast.success('Thêm nhà cung cấp thành công');
      }
      
      setIsDialogOpen(false);
      await loadData();
      resetForm();
    } catch (error: unknown) {
      console.error('Error saving nha cung cap:', error);
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
    if (!selectedNhaCungCap) return;

    setFormLoading(true);
    try {
      await deleteNhaCungCap(selectedNhaCungCap.nha_cung_cap_id);
      toast.success('Xóa nhà cung cấp thành công');
      setIsDeleteDialogOpen(false);
      await loadData();
      setSelectedNhaCungCap(null);
    } catch (error: unknown) {
      console.error('Error deleting nha cung cap:', error);
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
      ten_nha_cung_cap: '',
      email: '',
      dia_chi: '',
      sdt: '',
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
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
                Quản lý nhà cung cấp
              </CardTitle>
            </div>
            <Button onClick={handleOpenAddDialog} className="gap-2 bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              Thêm nhà cung cấp mới
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
                  placeholder="Tìm kiếm theo tên, địa chỉ, số điện thoại..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'ten_nha_cung_cap' | 'ngay_tao')}
                  className="px-3 py-2 h-10 border rounded-md text-sm bg-background border-slate-200 dark:border-slate-800 focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="ten_nha_cung_cap">Sắp xếp theo tên</option>
                  <option value="ngay_tao">Sắp xếp theo ngày tạo</option>
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
          ) : filteredNhaCungCapList.length === 0 ? (
            <div className="text-center py-12 text-slate-600 dark:text-slate-400">
              Không có nhà cung cấp nào
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold">ID</th>
                    <th className="text-left p-3 font-semibold">Tên nhà cung cấp</th>
                    <th className="text-left p-3 font-semibold">Email</th>
                    <th className="text-left p-3 font-semibold">Địa chỉ</th>
                    <th className="text-left p-3 font-semibold">Số điện thoại</th>
                    <th className="text-left p-3 font-semibold">Ngày tạo</th>
                    <th className="text-left p-3 font-semibold">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNhaCungCapList.map((nhaCungCap) => (
                    <tr key={nhaCungCap.nha_cung_cap_id} className="border-b hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors">
                      <td className="p-3">{nhaCungCap.nha_cung_cap_id}</td>
                      <td className="p-3 font-medium">{nhaCungCap.ten_nha_cung_cap}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          {nhaCungCap.email ? (
                            <>
                              <Mail className="h-4 w-4" />
                              <span className="max-w-xs truncate">{nhaCungCap.email}</span>
                            </>
                          ) : (
                            <span className="text-slate-500 dark:text-slate-400">N/A</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          {nhaCungCap.dia_chi ? (
                            <>
                              <MapPin className="h-4 w-4" />
                              <span className="max-w-xs truncate">{nhaCungCap.dia_chi}</span>
                            </>
                          ) : (
                            <span className="text-slate-500 dark:text-slate-400">N/A</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          {nhaCungCap.sdt ? (
                            <>
                              <Phone className="h-4 w-4" />
                              <span>{nhaCungCap.sdt}</span>
                            </>
                          ) : (
                            <span className="text-slate-500 dark:text-slate-400">N/A</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-sm text-slate-600 dark:text-slate-400">
                        {formatDate(nhaCungCap.ngay_tao)}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleOpenViewDialog(nhaCungCap)}
                            title="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleOpenEditDialog(nhaCungCap)}
                            title="Sửa"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleOpenDeleteDialog(nhaCungCap)}
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
            <DialogTitle>{isEditMode ? 'Sửa thông tin nhà cung cấp' : 'Thêm nhà cung cấp mới'}</DialogTitle>
            <DialogDescription>
              {isEditMode ? 'Cập nhật thông tin nhà cung cấp' : 'Điền đầy đủ thông tin để thêm nhà cung cấp mới'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4" lang="vi">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tên nhà cung cấp *</label>
              <Input
                value={formData.ten_nha_cung_cap}
                onChange={(e) => setFormData({ ...formData, ten_nha_cung_cap: e.target.value })}
                placeholder="Ví dụ: Nhà sách ABC"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email *</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Ví dụ: contact@nhasachabc.com"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900 dark:text-slate-100">Địa chỉ</label>
              <Input
                value={formData.dia_chi}
                onChange={(e) => setFormData({ ...formData, dia_chi: e.target.value })}
                placeholder="Ví dụ: 123 Đường ABC, Quận XYZ, TP.HCM"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900 dark:text-slate-100">Số điện thoại</label>
              <Input
                value={formData.sdt}
                onChange={(e) => setFormData({ ...formData, sdt: e.target.value })}
                placeholder="Ví dụ: 0123456789"
                type="tel"
              />
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
            <DialogTitle>Chi tiết nhà cung cấp</DialogTitle>
          </DialogHeader>
          {selectedNhaCungCap && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">ID</label>
                  <p className="text-base text-slate-900 dark:text-slate-100">{selectedNhaCungCap.nha_cung_cap_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Ngày tạo</label>
                  <p className="text-base text-slate-900 dark:text-slate-100">{formatDate(selectedNhaCungCap.ngay_tao)}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tên nhà cung cấp</label>
                <p className="text-base font-semibold text-slate-900 dark:text-slate-100">{selectedNhaCungCap.ten_nha_cung_cap}</p>
              </div>
              {selectedNhaCungCap.email && (
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </label>
                  <p className="text-base text-slate-900 dark:text-slate-100">{selectedNhaCungCap.email}</p>
                </div>
              )}
              {selectedNhaCungCap.dia_chi && (
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Địa chỉ
                  </label>
                  <p className="text-base text-slate-900 dark:text-slate-100">{selectedNhaCungCap.dia_chi}</p>
                </div>
              )}
              {selectedNhaCungCap.sdt && (
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Số điện thoại
                  </label>
                  <p className="text-base text-slate-900 dark:text-slate-100">{selectedNhaCungCap.sdt}</p>
                </div>
              )}
              {selectedNhaCungCap.ngay_cap_nhat && (
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Ngày cập nhật</label>
                  <p className="text-base text-slate-900 dark:text-slate-100">{formatDate(selectedNhaCungCap.ngay_cap_nhat)}</p>
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
              Bạn có chắc chắn muốn xóa nhà cung cấp "{selectedNhaCungCap?.ten_nha_cung_cap}"? Hành động này không thể hoàn tác.
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

export default AdminQuanLyNhaCungCap;

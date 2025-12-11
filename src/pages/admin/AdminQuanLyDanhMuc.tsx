import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import {
  getAllDanhMuc,
  createDanhMuc,
  updateDanhMuc,
  deleteDanhMuc,
  getAllDanhMucCha,
  type DanhMuc,
  type CreateDanhMucRequest,
  type DanhMucCha,
} from '../../services/danhMucService';
import { Plus, Pencil, Trash2, Eye, Search, Loader2, ArrowLeft, Home, Package, ArrowUpDown } from 'lucide-react';
import { toast } from 'sonner';

const AdminQuanLyDanhMuc = () => {
  const navigate = useNavigate();
  const [danhMucList, setDanhMucList] = useState<DanhMuc[]>([]);
  const [filteredDanhMucList, setFilteredDanhMucList] = useState<DanhMuc[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDanhMuc, setSelectedDanhMuc] = useState<DanhMuc | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Sắp xếp
  const [sortBy, setSortBy] = useState<'ten_danh_muc' | 'ngay_tao'>('ten_danh_muc');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Dữ liệu tham chiếu
  const [danhMucChaList, setDanhMucChaList] = useState<DanhMucCha[]>([]);

  // Form state
  const [formData, setFormData] = useState<CreateDanhMucRequest>({
    ten_danh_muc: '',
    mo_ta: '',
    slug: '',
    danh_muc_cha_id: 0,
  });
  const [formLoading, setFormLoading] = useState(false);

  // Load dữ liệu
  useEffect(() => {
    loadData();
  }, []);

  // Filter và sắp xếp danh mục
  useEffect(() => {
    let filtered = danhMucList;
    
    // Filter theo search term
    if (searchTerm.trim() !== '') {
      filtered = danhMucList.filter(
        (dm) =>
          dm.ten_danh_muc.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dm.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dm.danhmuccha?.ten_danh_muc_cha.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sắp xếp
    const sorted = [...filtered].sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';
      
      if (sortBy === 'ten_danh_muc') {
        aValue = a.ten_danh_muc.toLowerCase();
        bValue = b.ten_danh_muc.toLowerCase();
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
    
    setFilteredDanhMucList(sorted);
  }, [searchTerm, danhMucList, sortBy, sortOrder]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [danhMuc, danhMucCha] = await Promise.all([
        getAllDanhMuc(),
        getAllDanhMucCha(),
      ]);
      setDanhMucList(danhMuc);
      setFilteredDanhMucList(danhMuc);
      setDanhMucChaList(danhMucCha);
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

  // Tạo slug từ tên danh mục
  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleOpenAddDialog = () => {
    setIsEditMode(false);
    setSelectedDanhMuc(null);
    setFormData({
      ten_danh_muc: '',
      mo_ta: '',
      slug: '',
      danh_muc_cha_id: danhMucChaList[0]?.danh_muc_cha_id || 0,
    });
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (danhMuc: DanhMuc) => {
    setIsEditMode(true);
    setSelectedDanhMuc(danhMuc);
    setFormData({
      ten_danh_muc: danhMuc.ten_danh_muc,
      mo_ta: danhMuc.mo_ta || '',
      slug: danhMuc.slug,
      danh_muc_cha_id: danhMuc.danh_muc_cha_id || 0,
    });
    setIsDialogOpen(true);
  };

  const handleOpenViewDialog = (danhMuc: DanhMuc) => {
    setSelectedDanhMuc(danhMuc);
    setIsViewDialogOpen(true);
  };

  const handleOpenDeleteDialog = (danhMuc: DanhMuc) => {
    setSelectedDanhMuc(danhMuc);
    setIsDeleteDialogOpen(true);
  };

  const handleTenDanhMucChange = (value: string) => {
    setFormData({
      ...formData,
      ten_danh_muc: value,
      slug: formData.slug || generateSlug(value),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.ten_danh_muc || !formData.slug || !formData.danh_muc_cha_id) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    if (!formData.danh_muc_cha_id || formData.danh_muc_cha_id === 0) {
      toast.error('Vui lòng chọn danh mục cha');
      return;
    }

    setFormLoading(true);
    try {
      if (isEditMode && selectedDanhMuc) {
        await updateDanhMuc(selectedDanhMuc.danh_muc_id, formData);
        toast.success('Cập nhật danh mục thành công');
      } else {
        await createDanhMuc(formData);
        toast.success('Thêm danh mục thành công');
      }
      
      setIsDialogOpen(false);
      await loadData();
      resetForm();
    } catch (error: unknown) {
      console.error('Error saving danh muc:', error);
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
    if (!selectedDanhMuc) return;

    setFormLoading(true);
    try {
      await deleteDanhMuc(selectedDanhMuc.danh_muc_id);
      toast.success('Xóa danh mục thành công');
      setIsDeleteDialogOpen(false);
      await loadData();
      setSelectedDanhMuc(null);
    } catch (error: unknown) {
      console.error('Error deleting danh muc:', error);
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
      ten_danh_muc: '',
      mo_ta: '',
      slug: '',
      danh_muc_cha_id: 0,
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
                <Package className="h-6 w-6 text-primary" />
                Quản lý danh mục
              </CardTitle>
            </div>
            <Button onClick={handleOpenAddDialog} className="gap-2 bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              Thêm danh mục mới
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
                  placeholder="Tìm kiếm theo tên danh mục, slug, danh mục cha..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'ten_danh_muc' | 'ngay_tao')}
                  className="px-3 py-2 h-10 border rounded-md text-sm bg-background border-slate-200 dark:border-slate-800 focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="ten_danh_muc">Sắp xếp theo tên</option>
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
          ) : filteredDanhMucList.length === 0 ? (
            <div className="text-center py-12 text-slate-600 dark:text-slate-400">
              Không có danh mục nào
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold">ID</th>
                    <th className="text-left p-3 font-semibold">Tên danh mục</th>
                    <th className="text-left p-3 font-semibold">Slug</th>
                    <th className="text-left p-3 font-semibold">Danh mục cha</th>
                    <th className="text-left p-3 font-semibold">Mô tả</th>
                    <th className="text-left p-3 font-semibold">Ngày tạo</th>
                    <th className="text-left p-3 font-semibold">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDanhMucList.map((danhMuc) => (
                    <tr key={danhMuc.danh_muc_id} className="border-b hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors">
                      <td className="p-3">{danhMuc.danh_muc_id}</td>
                      <td className="p-3 font-medium">{danhMuc.ten_danh_muc}</td>
                      <td className="p-3 font-mono text-sm text-slate-600 dark:text-slate-400">{danhMuc.slug}</td>
                      <td className="p-3">
                        {danhMuc.danhmuccha ? (
                          <Badge variant="outline">{danhMuc.danhmuccha.ten_danh_muc_cha}</Badge>
                        ) : (
                          <span className="text-slate-500 dark:text-slate-400">N/A</span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="max-w-xs truncate text-sm text-slate-600 dark:text-slate-400">
                          {danhMuc.mo_ta || 'N/A'}
                        </div>
                      </td>
                      <td className="p-3 text-sm text-slate-600 dark:text-slate-400">
                        {formatDate(danhMuc.ngay_tao)}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleOpenViewDialog(danhMuc)}
                            title="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleOpenEditDialog(danhMuc)}
                            title="Sửa"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleOpenDeleteDialog(danhMuc)}
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
            <DialogTitle>{isEditMode ? 'Sửa thông tin danh mục' : 'Thêm danh mục mới'}</DialogTitle>
            <DialogDescription>
              {isEditMode ? 'Cập nhật thông tin danh mục' : 'Điền đầy đủ thông tin để thêm danh mục mới'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4" lang="vi">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tên danh mục *</label>
              <Input
                value={formData.ten_danh_muc}
                onChange={(e) => handleTenDanhMucChange(e.target.value)}
                placeholder="Ví dụ: Sách văn học"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Slug *</label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="sach-van-hoc"
                required
              />
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Slug sẽ được tự động tạo từ tên danh mục nếu để trống
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900 dark:text-slate-100">Mô tả</label>
              <textarea
                value={formData.mo_ta}
                onChange={(e) => setFormData({ ...formData, mo_ta: e.target.value })}
                className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                rows={4}
                placeholder="Mô tả về danh mục..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900 dark:text-slate-100">Danh mục cha *</label>
              <select
                value={formData.danh_muc_cha_id}
                onChange={(e) => setFormData({ ...formData, danh_muc_cha_id: Number(e.target.value) })}
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                required
              >
                <option value={0}>Chọn danh mục cha</option>
                {danhMucChaList.map((dmc) => (
                  <option key={dmc.danh_muc_cha_id} value={dmc.danh_muc_cha_id}>
                    {dmc.ten_danh_muc_cha}
                  </option>
                ))}
              </select>
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
            <DialogTitle>Chi tiết danh mục</DialogTitle>
          </DialogHeader>
          {selectedDanhMuc && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">ID</label>
                  <p className="text-base text-slate-900 dark:text-slate-100">{selectedDanhMuc.danh_muc_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Slug</label>
                  <p className="text-base font-mono text-slate-900 dark:text-slate-100">{selectedDanhMuc.slug}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tên danh mục</label>
                <p className="text-base font-semibold text-slate-900 dark:text-slate-100">{selectedDanhMuc.ten_danh_muc}</p>
              </div>
              {selectedDanhMuc.mo_ta && (
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Mô tả</label>
                  <p className="text-base text-slate-900 dark:text-slate-100">{selectedDanhMuc.mo_ta}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Danh mục cha</label>
                <p className="text-base text-slate-900 dark:text-slate-100">
                  {selectedDanhMuc.danhmuccha ? (
                    <div className="space-y-1">
                      <Badge variant="outline" className="text-sm">
                        {selectedDanhMuc.danhmuccha.ten_danh_muc_cha}
                      </Badge>
                      {selectedDanhMuc.danhmuccha.mo_ta && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {selectedDanhMuc.danhmuccha.mo_ta}
                        </p>
                      )}
                    </div>
                  ) : (
                    <span className="text-slate-500 dark:text-slate-400">Không có danh mục cha</span>
                  )}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Ngày tạo</label>
                  <p className="text-base text-slate-900 dark:text-slate-100">{formatDate(selectedDanhMuc.ngay_tao)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Ngày cập nhật</label>
                  <p className="text-base text-slate-900 dark:text-slate-100">{formatDate(selectedDanhMuc.ngay_cap_nhat)}</p>
                </div>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa danh mục "{selectedDanhMuc?.ten_danh_muc}"? Hành động này không thể hoàn tác.
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

export default AdminQuanLyDanhMuc;

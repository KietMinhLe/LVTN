import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import {
  getAllDanhMucCha,
  createDanhMucCha,
  updateDanhMucCha,
  deleteDanhMucCha,
  type DanhMucCha,
  type CreateDanhMucChaRequest,
} from '../../services/danhMucChaService';
import { Plus, Pencil, Trash2, Eye, Search, Loader2, ArrowLeft, Home, FolderTree, ArrowUpDown } from 'lucide-react';
import { toast } from 'sonner';

const AdminQuanLyDanhMucCha = () => {
  const navigate = useNavigate();
  const [danhMucChaList, setDanhMucChaList] = useState<DanhMucCha[]>([]);
  const [filteredDanhMucChaList, setFilteredDanhMucChaList] = useState<DanhMucCha[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDanhMucCha, setSelectedDanhMucCha] = useState<DanhMucCha | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Sắp xếp
  const [sortBy, setSortBy] = useState<'ten_danh_muc_cha' | 'ngay_tao'>('ten_danh_muc_cha');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Form state
  const [formData, setFormData] = useState<CreateDanhMucChaRequest>({
    ten_danh_muc_cha: '',
    mo_ta: '',
  });
  const [formLoading, setFormLoading] = useState(false);

  // Load dữ liệu
  useEffect(() => {
    loadData();
  }, []);

  // Filter và sắp xếp danh mục cha
  useEffect(() => {
    let filtered = danhMucChaList;
    
    // Filter theo search term
    if (searchTerm.trim() !== '') {
      filtered = danhMucChaList.filter(
        (dmc) =>
          dmc.ten_danh_muc_cha.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dmc.mo_ta?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sắp xếp
    const sorted = [...filtered].sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';
      
      if (sortBy === 'ten_danh_muc_cha') {
        aValue = a.ten_danh_muc_cha.toLowerCase();
        bValue = b.ten_danh_muc_cha.toLowerCase();
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
    
    setFilteredDanhMucChaList(sorted);
  }, [searchTerm, danhMucChaList, sortBy, sortOrder]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getAllDanhMucCha();
      setDanhMucChaList(data);
      setFilteredDanhMucChaList(data);
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
    setSelectedDanhMucCha(null);
    setFormData({
      ten_danh_muc_cha: '',
      mo_ta: '',
    });
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (danhMucCha: DanhMucCha) => {
    setIsEditMode(true);
    setSelectedDanhMucCha(danhMucCha);
    setFormData({
      ten_danh_muc_cha: danhMucCha.ten_danh_muc_cha,
      mo_ta: danhMucCha.mo_ta || '',
    });
    setIsDialogOpen(true);
  };

  const handleOpenViewDialog = (danhMucCha: DanhMucCha) => {
    setSelectedDanhMucCha(danhMucCha);
    setIsViewDialogOpen(true);
  };

  const handleOpenDeleteDialog = (danhMucCha: DanhMucCha) => {
    setSelectedDanhMucCha(danhMucCha);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.ten_danh_muc_cha.trim()) {
      toast.error('Vui lòng nhập tên danh mục cha');
      return;
    }

    if (!formData.mo_ta || !formData.mo_ta.trim()) {
      toast.error('Vui lòng nhập mô tả');
      return;
    }

    setFormLoading(true);
    try {
      if (isEditMode && selectedDanhMucCha) {
        await updateDanhMucCha(selectedDanhMucCha.danh_muc_cha_id, formData);
        toast.success('Cập nhật danh mục cha thành công');
      } else {
        await createDanhMucCha(formData);
        toast.success('Thêm danh mục cha thành công');
      }
      
      setIsDialogOpen(false);
      await loadData();
      resetForm();
    } catch (error: unknown) {
      console.error('Error saving danh muc cha:', error);
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
    if (!selectedDanhMucCha) return;

    setFormLoading(true);
    try {
      await deleteDanhMucCha(selectedDanhMucCha.danh_muc_cha_id);
      toast.success('Xóa danh mục cha thành công');
      setIsDeleteDialogOpen(false);
      await loadData();
      setSelectedDanhMucCha(null);
    } catch (error: unknown) {
      console.error('Error deleting danh muc cha:', error);
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
      ten_danh_muc_cha: '',
      mo_ta: '',
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
                <FolderTree className="h-6 w-6 text-primary" />
                Quản lý danh mục cha
              </CardTitle>
            </div>
            <Button onClick={handleOpenAddDialog} className="gap-2 bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              Thêm danh mục cha mới
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
                  placeholder="Tìm kiếm theo tên hoặc mô tả danh mục cha..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'ten_danh_muc_cha' | 'ngay_tao')}
                  className="px-3 py-2 h-10 border rounded-md text-sm bg-background border-slate-200 dark:border-slate-800 focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="ten_danh_muc_cha">Sắp xếp theo tên</option>
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
          ) : filteredDanhMucChaList.length === 0 ? (
            <div className="text-center py-12 text-slate-600 dark:text-slate-400">
              Không có danh mục cha nào
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold">ID</th>
                    <th className="text-left p-3 font-semibold">Tên danh mục cha</th>
                    <th className="text-left p-3 font-semibold">Mô tả</th>
                    <th className="text-left p-3 font-semibold">Ngày tạo</th>
                    <th className="text-left p-3 font-semibold">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDanhMucChaList.map((danhMucCha) => (
                    <tr key={danhMucCha.danh_muc_cha_id} className="border-b hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors">
                      <td className="p-3">{danhMucCha.danh_muc_cha_id}</td>
                      <td className="p-3 font-medium">{danhMucCha.ten_danh_muc_cha}</td>
                      <td className="p-3">
                        {danhMucCha.mo_ta ? (
                          <span className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 max-w-md">
                            {danhMucCha.mo_ta}
                          </span>
                        ) : (
                          <span className="text-slate-500 dark:text-slate-400">N/A</span>
                        )}
                      </td>
                      <td className="p-3 text-sm text-slate-600 dark:text-slate-400">
                        {formatDate(danhMucCha.ngay_tao)}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleOpenViewDialog(danhMucCha)}
                            title="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleOpenEditDialog(danhMucCha)}
                            title="Sửa"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleOpenDeleteDialog(danhMucCha)}
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
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Sửa thông tin danh mục cha' : 'Thêm danh mục cha mới'}</DialogTitle>
            <DialogDescription>
              {isEditMode ? 'Cập nhật thông tin danh mục cha' : 'Điền đầy đủ thông tin để thêm danh mục cha mới'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4" lang="vi" acceptCharset="UTF-8">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tên danh mục cha *</label>
              <Input
                value={formData.ten_danh_muc_cha}
                onChange={(e) => setFormData({ ...formData, ten_danh_muc_cha: e.target.value })}
                placeholder="Ví dụ: Sách văn học, Sách khoa học..."
                required
                lang="vi"
                autoComplete="off"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Mô tả *</label>
              <textarea
                value={formData.mo_ta}
                onChange={(e) => setFormData({ ...formData, mo_ta: e.target.value })}
                className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                rows={4}
                placeholder="Nhập mô tả cho danh mục cha..."
                required
                lang="vi"
                autoComplete="off"
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
            <DialogTitle>Chi tiết danh mục cha</DialogTitle>
          </DialogHeader>
          {selectedDanhMucCha && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">ID</label>
                  <p className="text-base text-slate-900 dark:text-slate-100">{selectedDanhMucCha.danh_muc_cha_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Ngày tạo</label>
                  <p className="text-base text-slate-900 dark:text-slate-100">{formatDate(selectedDanhMucCha.ngay_tao)}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <FolderTree className="h-4 w-4" />
                  Tên danh mục cha
                </label>
                <p className="text-base font-semibold text-slate-900 dark:text-slate-100">{selectedDanhMucCha.ten_danh_muc_cha}</p>
              </div>
              {selectedDanhMucCha.mo_ta && (
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Mô tả</label>
                  <p className="text-base text-slate-900 dark:text-slate-100 whitespace-pre-wrap">{selectedDanhMucCha.mo_ta}</p>
                </div>
              )}
              {selectedDanhMucCha.ngay_cap_nhat && (
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Ngày cập nhật</label>
                  <p className="text-base text-slate-900 dark:text-slate-100">{formatDate(selectedDanhMucCha.ngay_cap_nhat)}</p>
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
              Bạn có chắc chắn muốn xóa danh mục cha "{selectedDanhMucCha?.ten_danh_muc_cha}"? Hành động này không thể hoàn tác.
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
  );
};

export default AdminQuanLyDanhMucCha;


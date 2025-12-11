import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import {
  getAllNgonNgu,
  createNgonNgu,
  updateNgonNgu,
  deleteNgonNgu,
  type NgonNgu,
  type CreateNgonNguRequest,
} from '../../services/ngonNguService';
import { Plus, Pencil, Trash2, Eye, Search, Loader2, ArrowLeft, Home, Languages, ArrowUpDown } from 'lucide-react';
import { toast } from 'sonner';

const AdminQuanLyNgonNgu = () => {
  const navigate = useNavigate();
  const [ngonNguList, setNgonNguList] = useState<NgonNgu[]>([]);
  const [filteredNgonNguList, setFilteredNgonNguList] = useState<NgonNgu[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedNgonNgu, setSelectedNgonNgu] = useState<NgonNgu | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Sắp xếp
  const [sortBy, setSortBy] = useState<'ten_ngon_ngu' | 'ngay_tao'>('ten_ngon_ngu');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Form state
  const [formData, setFormData] = useState<CreateNgonNguRequest>({
    ten_ngon_ngu: '',
    ma_ngon_ngu: '',
  });
  const [formLoading, setFormLoading] = useState(false);

  // Load dữ liệu
  useEffect(() => {
    loadData();
  }, []);

  // Filter và sắp xếp ngôn ngữ
  useEffect(() => {
    let filtered = ngonNguList;
    
    // Filter theo search term
    if (searchTerm.trim() !== '') {
      filtered = ngonNguList.filter(
        (nn) =>
          nn.ten_ngon_ngu.toLowerCase().includes(searchTerm.toLowerCase()) ||
          nn.ma_ngon_ngu?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sắp xếp
    const sorted = [...filtered].sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';
      
      if (sortBy === 'ten_ngon_ngu') {
        aValue = a.ten_ngon_ngu.toLowerCase();
        bValue = b.ten_ngon_ngu.toLowerCase();
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
    
    setFilteredNgonNguList(sorted);
  }, [searchTerm, ngonNguList, sortBy, sortOrder]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getAllNgonNgu();
      setNgonNguList(data);
      setFilteredNgonNguList(data);
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
    setSelectedNgonNgu(null);
    setFormData({
      ten_ngon_ngu: '',
      ma_ngon_ngu: '',
    });
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (ngonNgu: NgonNgu) => {
    setIsEditMode(true);
    setSelectedNgonNgu(ngonNgu);
    setFormData({
      ten_ngon_ngu: ngonNgu.ten_ngon_ngu,
      ma_ngon_ngu: ngonNgu.ma_ngon_ngu || '',
    });
    setIsDialogOpen(true);
  };

  const handleOpenViewDialog = (ngonNgu: NgonNgu) => {
    setSelectedNgonNgu(ngonNgu);
    setIsViewDialogOpen(true);
  };

  const handleOpenDeleteDialog = (ngonNgu: NgonNgu) => {
    setSelectedNgonNgu(ngonNgu);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.ten_ngon_ngu.trim()) {
      toast.error('Vui lòng nhập tên ngôn ngữ');
      return;
    }

    if (!formData.ma_ngon_ngu || !formData.ma_ngon_ngu.trim()) {
      toast.error('Vui lòng nhập mã ngôn ngữ');
      return;
    }

    setFormLoading(true);
    try {
      if (isEditMode && selectedNgonNgu) {
        await updateNgonNgu(selectedNgonNgu.ngon_ngu_id, formData);
        toast.success('Cập nhật ngôn ngữ thành công');
      } else {
        await createNgonNgu(formData);
        toast.success('Thêm ngôn ngữ thành công');
      }
      
      setIsDialogOpen(false);
      await loadData();
      resetForm();
    } catch (error: unknown) {
      console.error('Error saving ngon ngu:', error);
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
    if (!selectedNgonNgu) return;

    setFormLoading(true);
    try {
      await deleteNgonNgu(selectedNgonNgu.ngon_ngu_id);
      toast.success('Xóa ngôn ngữ thành công');
      setIsDeleteDialogOpen(false);
      await loadData();
      setSelectedNgonNgu(null);
    } catch (error: unknown) {
      console.error('Error deleting ngon ngu:', error);
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
      ten_ngon_ngu: '',
      ma_ngon_ngu: '',
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
                <Languages className="h-6 w-6 text-primary" />
                Quản lý ngôn ngữ
              </CardTitle>
            </div>
            <Button onClick={handleOpenAddDialog} className="gap-2 bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              Thêm ngôn ngữ mới
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
                  placeholder="Tìm kiếm theo tên hoặc mã ngôn ngữ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'ten_ngon_ngu' | 'ngay_tao')}
                  className="px-3 py-2 h-10 border rounded-md text-sm bg-background border-slate-200 dark:border-slate-800 focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="ten_ngon_ngu">Sắp xếp theo tên</option>
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
          ) : filteredNgonNguList.length === 0 ? (
            <div className="text-center py-12 text-slate-600 dark:text-slate-400">
              Không có ngôn ngữ nào
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold">ID</th>
                    <th className="text-left p-3 font-semibold">Tên ngôn ngữ</th>
                    <th className="text-left p-3 font-semibold">Mã ngôn ngữ</th>
                    <th className="text-left p-3 font-semibold">Ngày tạo</th>
                    <th className="text-left p-3 font-semibold">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNgonNguList.map((ngonNgu) => (
                    <tr key={ngonNgu.ngon_ngu_id} className="border-b hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors">
                      <td className="p-3">{ngonNgu.ngon_ngu_id}</td>
                      <td className="p-3 font-medium">{ngonNgu.ten_ngon_ngu}</td>
                      <td className="p-3">
                        {ngonNgu.ma_ngon_ngu ? (
                          <span className="px-2 py-1 bg-primary/10 text-primary rounded text-sm font-mono">
                            {ngonNgu.ma_ngon_ngu}
                          </span>
                        ) : (
                          <span className="text-slate-500 dark:text-slate-400">N/A</span>
                        )}
                      </td>
                      <td className="p-3 text-sm text-slate-600 dark:text-slate-400">
                        {formatDate(ngonNgu.ngay_tao)}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleOpenViewDialog(ngonNgu)}
                            title="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleOpenEditDialog(ngonNgu)}
                            title="Sửa"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleOpenDeleteDialog(ngonNgu)}
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
            <DialogTitle>{isEditMode ? 'Sửa thông tin ngôn ngữ' : 'Thêm ngôn ngữ mới'}</DialogTitle>
            <DialogDescription>
              {isEditMode ? 'Cập nhật thông tin ngôn ngữ' : 'Điền đầy đủ thông tin để thêm ngôn ngữ mới'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4" lang="vi" acceptCharset="UTF-8">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tên ngôn ngữ *</label>
              <Input
                value={formData.ten_ngon_ngu}
                onChange={(e) => setFormData({ ...formData, ten_ngon_ngu: e.target.value })}
                placeholder="Ví dụ: Tiếng Việt, English, 日本語..."
                required
                lang="vi"
                autoComplete="off"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Mã ngôn ngữ *</label>
              <Input
                value={formData.ma_ngon_ngu}
                onChange={(e) => setFormData({ ...formData, ma_ngon_ngu: e.target.value })}
                placeholder="Ví dụ: vi, en, ja..."
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
            <DialogTitle>Chi tiết ngôn ngữ</DialogTitle>
          </DialogHeader>
          {selectedNgonNgu && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">ID</label>
                  <p className="text-base text-slate-900 dark:text-slate-100">{selectedNgonNgu.ngon_ngu_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Ngày tạo</label>
                  <p className="text-base text-slate-900 dark:text-slate-100">{formatDate(selectedNgonNgu.ngay_tao)}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Languages className="h-4 w-4" />
                  Tên ngôn ngữ
                </label>
                <p className="text-base font-semibold text-slate-900 dark:text-slate-100">{selectedNgonNgu.ten_ngon_ngu}</p>
              </div>
              {selectedNgonNgu.ma_ngon_ngu && (
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Mã ngôn ngữ</label>
                  <p className="text-base text-slate-900 dark:text-slate-100">
                    <span className="px-2 py-1 bg-primary/10 text-primary rounded font-mono">
                      {selectedNgonNgu.ma_ngon_ngu}
                    </span>
                  </p>
                </div>
              )}
              {selectedNgonNgu.ngay_cap_nhat && (
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Ngày cập nhật</label>
                  <p className="text-base text-slate-900 dark:text-slate-100">{formatDate(selectedNgonNgu.ngay_cap_nhat)}</p>
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
              Bạn có chắc chắn muốn xóa ngôn ngữ "{selectedNgonNgu?.ten_ngon_ngu}"? Hành động này không thể hoàn tác.
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

export default AdminQuanLyNgonNgu;


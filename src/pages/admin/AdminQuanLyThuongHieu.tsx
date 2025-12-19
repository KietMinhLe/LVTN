import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import {
  getAllThuongHieu,
  createThuongHieu,
  updateThuongHieu,
  deleteThuongHieu,
  type ThuongHieu,
  type CreateThuongHieuRequest,
} from '../../services/thuongHieuService';
import { Plus, Pencil, Trash2, Eye, Search, Loader2, ArrowLeft, Home, Tag, ArrowUpDown } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '../../components/ui/badge';

const AdminQuanLyThuongHieu = () => {
  const navigate = useNavigate();
  const [thuongHieuList, setThuongHieuList] = useState<ThuongHieu[]>([]);
  const [filteredThuongHieuList, setFilteredThuongHieuList] = useState<ThuongHieu[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedThuongHieu, setSelectedThuongHieu] = useState<ThuongHieu | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Sắp xếp
  const [sortBy, setSortBy] = useState<'ten_thuong_hieu' | 'ngay_tao'>('ten_thuong_hieu');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Form state
  const [formData, setFormData] = useState<CreateThuongHieuRequest>({
    ten_thuong_hieu: '',
  });
  const [formLoading, setFormLoading] = useState(false);

  // Load dữ liệu
  useEffect(() => {
    loadData();
  }, []);

  // Filter và sắp xếp thương hiệu
  useEffect(() => {
    let filtered = thuongHieuList;
    
    // Filter theo search term
    if (searchTerm.trim() !== '') {
      filtered = thuongHieuList.filter(
        (th) =>
          th.ten_thuong_hieu.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sắp xếp
    const sorted = [...filtered].sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';
      
      if (sortBy === 'ten_thuong_hieu') {
        aValue = a.ten_thuong_hieu.toLowerCase();
        bValue = b.ten_thuong_hieu.toLowerCase();
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
    
    setFilteredThuongHieuList(sorted);
  }, [searchTerm, thuongHieuList, sortBy, sortOrder]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getAllThuongHieu();
      setThuongHieuList(data);
      setFilteredThuongHieuList(data);
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
    setSelectedThuongHieu(null);
    setFormData({
      ten_thuong_hieu: '',
    });
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (thuongHieu: ThuongHieu) => {
    setIsEditMode(true);
    setSelectedThuongHieu(thuongHieu);
    setFormData({
      ten_thuong_hieu: thuongHieu.ten_thuong_hieu,
    });
    setIsDialogOpen(true);
  };

  const handleOpenViewDialog = (thuongHieu: ThuongHieu) => {
    setSelectedThuongHieu(thuongHieu);
    setIsViewDialogOpen(true);
  };

  const handleOpenDeleteDialog = (thuongHieu: ThuongHieu) => {
    // Kiểm tra nếu thương hiệu có sách thì không cho xóa
    if (thuongHieu.so_luong_sach !== undefined && thuongHieu.so_luong_sach > 0) {
      toast.error(`Không thể xóa thương hiệu "${thuongHieu.ten_thuong_hieu}" vì đang có ${thuongHieu.so_luong_sach} sách. Vui lòng xóa hoặc chuyển sách sang thương hiệu khác trước.`);
      return;
    }
    setSelectedThuongHieu(thuongHieu);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.ten_thuong_hieu.trim()) {
      toast.error('Dữ liệu không hợp lệ. Vui lòng nhập lại');
      return;
    }

    setFormLoading(true);
    try {
      if (isEditMode && selectedThuongHieu) {
        await updateThuongHieu(selectedThuongHieu.thuong_hieu_id, formData);
        toast.success('Cập nhật thương hiệu thành công');
      } else {
        await createThuongHieu(formData);
        toast.success('Thêm thương hiệu thành công');
      }
      
      setIsDialogOpen(false);
      await loadData();
      resetForm();
    } catch (error: unknown) {
      console.error('Error saving thuong hieu:', error);
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
    if (!selectedThuongHieu) return;

    // Kiểm tra lại số lượng sách trước khi xóa (double check)
    if (selectedThuongHieu.so_luong_sach !== undefined && selectedThuongHieu.so_luong_sach > 0) {
      toast.error(`Không thể xóa thương hiệu "${selectedThuongHieu.ten_thuong_hieu}" vì đang có ${selectedThuongHieu.so_luong_sach} sách. Vui lòng xóa hoặc chuyển sách sang thương hiệu khác trước.`);
      setIsDeleteDialogOpen(false);
      await loadData();
      return;
    }

    setFormLoading(true);
    try {
      await deleteThuongHieu(selectedThuongHieu.thuong_hieu_id);
      toast.success('Xóa thương hiệu thành công');
      setIsDeleteDialogOpen(false);
      await loadData();
      setSelectedThuongHieu(null);
    } catch (error: unknown) {
      console.error('Error deleting thuong hieu:', error);
      let errorMessage = 'Lỗi không xác định';
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string; error?: string }; status?: number } };
        errorMessage = axiosError.response?.data?.message || 
                      axiosError.response?.data?.error || 
                      `Lỗi ${axiosError.response?.status || 500}`;
        
        if (axiosError.response?.status === 400 && errorMessage.includes('sách')) {
          await loadData();
        }
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
      ten_thuong_hieu: '',
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
                <Tag className="h-6 w-6 text-primary" />
                Quản lý thương hiệu
              </CardTitle>
            </div>
            <Button onClick={handleOpenAddDialog} className="gap-2 bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              Thêm thương hiệu mới
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
                  placeholder="Tìm kiếm theo tên thương hiệu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'ten_thuong_hieu' | 'ngay_tao')}
                  className="px-3 py-2 h-10 border rounded-md text-sm bg-background border-slate-200 dark:border-slate-800 focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="ten_thuong_hieu">Sắp xếp theo tên</option>
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
          ) : filteredThuongHieuList.length === 0 ? (
            <div className="text-center py-12 text-slate-600 dark:text-slate-400">
              Không có thương hiệu nào
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold">ID</th>
                    <th className="text-left p-3 font-semibold">Tên thương hiệu</th>
                    <th className="text-left p-3 font-semibold">Số lượng sách</th>
                    <th className="text-left p-3 font-semibold">Ngày tạo</th>
                    <th className="text-left p-3 font-semibold">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredThuongHieuList.map((thuongHieu) => (
                    <tr key={thuongHieu.thuong_hieu_id} className="border-b hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors">
                      <td className="p-3">{thuongHieu.thuong_hieu_id}</td>
                      <td className="p-3 font-medium">{thuongHieu.ten_thuong_hieu}</td>
                      <td className="p-3">
                        <Badge 
                          variant={thuongHieu.so_luong_sach && thuongHieu.so_luong_sach > 0 ? "default" : "secondary"}
                          className={thuongHieu.so_luong_sach && thuongHieu.so_luong_sach > 0 ? "bg-primary" : ""}
                        >
                          {thuongHieu.so_luong_sach ?? 0} sách
                        </Badge>
                      </td>
                      <td className="p-3 text-sm text-slate-600 dark:text-slate-400">
                        {formatDate(thuongHieu.ngay_tao)}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleOpenViewDialog(thuongHieu)}
                            title="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleOpenEditDialog(thuongHieu)}
                            title="Sửa"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleOpenDeleteDialog(thuongHieu)}
                            title={
                              thuongHieu.so_luong_sach && thuongHieu.so_luong_sach > 0
                                ? `Không thể xóa vì có ${thuongHieu.so_luong_sach} sách`
                                : "Xóa"
                            }
                            disabled={thuongHieu.so_luong_sach !== undefined && thuongHieu.so_luong_sach > 0}
                            className={`text-destructive hover:text-destructive ${
                              thuongHieu.so_luong_sach && thuongHieu.so_luong_sach > 0
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
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
            <DialogTitle>{isEditMode ? 'Sửa thông tin thương hiệu' : 'Thêm thương hiệu mới'}</DialogTitle>
            <DialogDescription>
              {isEditMode ? 'Cập nhật thông tin thương hiệu' : 'Điền đầy đủ thông tin để thêm thương hiệu mới'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4" lang="vi">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tên thương hiệu *</label>
              <Input
                value={formData.ten_thuong_hieu}
                onChange={(e) => setFormData({ ...formData, ten_thuong_hieu: e.target.value })}
                placeholder="Ví dụ: Kim Đồng, Nhã Nam, Alpha Books..."
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
            <DialogTitle>Chi tiết thương hiệu</DialogTitle>
          </DialogHeader>
          {selectedThuongHieu && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">ID</label>
                  <p className="text-base text-slate-900 dark:text-slate-100">{selectedThuongHieu.thuong_hieu_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Ngày tạo</label>
                  <p className="text-base text-slate-900 dark:text-slate-100">{formatDate(selectedThuongHieu.ngay_tao)}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Tên thương hiệu
                </label>
                <p className="text-base font-semibold text-slate-900 dark:text-slate-100">{selectedThuongHieu.ten_thuong_hieu}</p>
              </div>
              {selectedThuongHieu.ngay_cap_nhat && (
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Ngày cập nhật</label>
                  <p className="text-base text-slate-900 dark:text-slate-100">{formatDate(selectedThuongHieu.ngay_cap_nhat)}</p>
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-destructive flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Xác nhận xóa thương hiệu
            </DialogTitle>
            <DialogDescription className="pt-4 space-y-3">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <p className="text-base font-semibold text-destructive mb-2">
                  Bạn có chắc chắn muốn xóa thương hiệu này không?
                </p>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  <span className="font-medium">Tên thương hiệu:</span> {selectedThuongHieu?.ten_thuong_hieu}
                </p>
                {selectedThuongHieu?.thuong_hieu_id && (
                  <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                    <span className="font-medium">ID:</span> {selectedThuongHieu.thuong_hieu_id}
                  </p>
                )}
              </div>
              {selectedThuongHieu?.so_luong_sach !== undefined && selectedThuongHieu.so_luong_sach > 0 ? (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                      <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                        ❌ Không thể xóa:
                      </p>
                      <p className="text-sm text-red-700 dark:text-red-300 mt-2">
                        Thương hiệu này đang có {selectedThuongHieu.so_luong_sach} sách. Vui lòng xóa hoặc chuyển tất cả sách sang thương hiệu khác trước khi xóa thương hiệu này.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                        ⚠️ Cảnh báo:
                      </p>
                      <ul className="text-sm text-yellow-700 dark:text-yellow-300 mt-2 space-y-1 list-disc list-inside">
                        <li>Hành động này không thể hoàn tác</li>
                        <li>Thương hiệu sẽ bị xóa vĩnh viễn</li>
                      </ul>
                    </div>
                  )}
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
              disabled={formLoading || (selectedThuongHieu?.so_luong_sach !== undefined && selectedThuongHieu.so_luong_sach > 0)}
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

export default AdminQuanLyThuongHieu;


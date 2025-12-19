import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import {
  getAllNguoiBienDich,
  createNguoiBienDich,
  updateNguoiBienDich,
  deleteNguoiBienDich,
  type NguoiBienDich,
  type CreateNguoiBienDichRequest,
} from '../../services/nguoiBienDichService';
import { Plus, Pencil, Trash2, Eye, Search, Loader2, ArrowLeft, Home, UserPen, ArrowUpDown } from 'lucide-react';
import { toast } from 'sonner';

const AdminQuanLyNguoiBienDich = () => {
  const navigate = useNavigate();
  const [nguoiBienDichList, setNguoiBienDichList] = useState<NguoiBienDich[]>([]);
  const [filteredNguoiBienDichList, setFilteredNguoiBienDichList] = useState<NguoiBienDich[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedNguoiBienDich, setSelectedNguoiBienDich] = useState<NguoiBienDich | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Sắp xếp
  const [sortBy, setSortBy] = useState<'ten_nguoi_bien_dich' | 'ngay_tao'>('ten_nguoi_bien_dich');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Form state
  const [formData, setFormData] = useState<CreateNguoiBienDichRequest>({
    ten_nguoi_bien_dich: '',
    tieu_su: '',
  });
  const [formLoading, setFormLoading] = useState(false);

  // Load dữ liệu
  useEffect(() => {
    loadData();
  }, []);

  // Filter và sắp xếp người biên dịch
  useEffect(() => {
    let filtered = nguoiBienDichList;
    
    // Filter theo search term
    if (searchTerm.trim() !== '') {
      filtered = nguoiBienDichList.filter(
        (nbd) =>
          nbd.ten_nguoi_bien_dich.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sắp xếp
    const sorted = [...filtered].sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';
      
      if (sortBy === 'ten_nguoi_bien_dich') {
        aValue = a.ten_nguoi_bien_dich.toLowerCase();
        bValue = b.ten_nguoi_bien_dich.toLowerCase();
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
    
    setFilteredNguoiBienDichList(sorted);
  }, [searchTerm, nguoiBienDichList, sortBy, sortOrder]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getAllNguoiBienDich();
      setNguoiBienDichList(data);
      setFilteredNguoiBienDichList(data);
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
    setSelectedNguoiBienDich(null);
    setFormData({
      ten_nguoi_bien_dich: '',
      tieu_su: '',
    });
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (nguoiBienDich: NguoiBienDich) => {
    setIsEditMode(true);
    setSelectedNguoiBienDich(nguoiBienDich);
    setFormData({
      ten_nguoi_bien_dich: nguoiBienDich.ten_nguoi_bien_dich,
      tieu_su: nguoiBienDich.tieu_su || '',
    });
    setIsDialogOpen(true);
  };

  const handleOpenViewDialog = (nguoiBienDich: NguoiBienDich) => {
    setSelectedNguoiBienDich(nguoiBienDich);
    setIsViewDialogOpen(true);
  };

  const handleOpenDeleteDialog = (nguoiBienDich: NguoiBienDich) => {
    setSelectedNguoiBienDich(nguoiBienDich);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.ten_nguoi_bien_dich.trim()) {
      toast.error('Dữ liệu không hợp lệ. Vui lòng nhập lại');
      return;
    }

    setFormLoading(true);
    try {
      if (isEditMode && selectedNguoiBienDich) {
        await updateNguoiBienDich(selectedNguoiBienDich.nguoi_bien_dich_id, formData);
        toast.success('Cập nhật người biên dịch thành công');
      } else {
        await createNguoiBienDich(formData);
        toast.success('Thêm người biên dịch thành công');
      }
      
      setIsDialogOpen(false);
      await loadData();
      resetForm();
    } catch (error: unknown) {
      console.error('Error saving nguoi bien dich:', error);
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
    if (!selectedNguoiBienDich) return;

    setFormLoading(true);
    try {
      await deleteNguoiBienDich(selectedNguoiBienDich.nguoi_bien_dich_id);
      toast.success('Xóa người biên dịch thành công');
      setIsDeleteDialogOpen(false);
      await loadData();
      setSelectedNguoiBienDich(null);
    } catch (error: unknown) {
      console.error('Error deleting nguoi bien dich:', error);
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
      ten_nguoi_bien_dich: '',
      tieu_su: '',
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
                <UserPen className="h-6 w-6 text-primary" />
                Quản lý người biên dịch
              </CardTitle>
            </div>
            <Button onClick={handleOpenAddDialog} className="gap-2 bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              Thêm người biên dịch mới
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
                  placeholder="Tìm kiếm theo tên người biên dịch..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'ten_nguoi_bien_dich' | 'ngay_tao')}
                  className="px-3 py-2 h-10 border rounded-md text-sm bg-background border-slate-200 dark:border-slate-800 focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="ten_nguoi_bien_dich">Sắp xếp theo tên</option>
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
          ) : filteredNguoiBienDichList.length === 0 ? (
            <div className="text-center py-12 text-slate-600 dark:text-slate-400">
              Không có người biên dịch nào
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold">ID</th>
                    <th className="text-left p-3 font-semibold">Tên người biên dịch</th>
                    <th className="text-left p-3 font-semibold">Tiểu sử</th>
                    <th className="text-left p-3 font-semibold">Ngày tạo</th>
                    <th className="text-left p-3 font-semibold">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNguoiBienDichList.map((nguoiBienDich) => (
                    <tr key={nguoiBienDich.nguoi_bien_dich_id} className="border-b hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors">
                      <td className="p-3">{nguoiBienDich.nguoi_bien_dich_id}</td>
                      <td className="p-3 font-medium">{nguoiBienDich.ten_nguoi_bien_dich}</td>
                      <td className="p-3">
                        {nguoiBienDich.tieu_su ? (
                          <span className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1 max-w-xs">
                            {nguoiBienDich.tieu_su}
                          </span>
                        ) : (
                          <span className="text-slate-500 dark:text-slate-400">N/A</span>
                        )}
                      </td>
                      <td className="p-3 text-sm text-slate-600 dark:text-slate-400">
                        {formatDate(nguoiBienDich.ngay_tao)}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleOpenViewDialog(nguoiBienDich)}
                            title="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleOpenEditDialog(nguoiBienDich)}
                            title="Sửa"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleOpenDeleteDialog(nguoiBienDich)}
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
            <DialogTitle>{isEditMode ? 'Sửa thông tin người biên dịch' : 'Thêm người biên dịch mới'}</DialogTitle>
            <DialogDescription>
              {isEditMode ? 'Cập nhật thông tin người biên dịch' : 'Điền đầy đủ thông tin để thêm người biên dịch mới'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4" lang="vi" acceptCharset="UTF-8">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tên người biên dịch *</label>
              <Input
                value={formData.ten_nguoi_bien_dich}
                onChange={(e) => setFormData({ ...formData, ten_nguoi_bien_dich: e.target.value })}
                placeholder="Ví dụ: Nguyễn Văn A, Trần Thị B..."
                lang="vi"
                autoComplete="off"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900 dark:text-slate-100">Tiểu sử</label>
              <textarea
                value={formData.tieu_su}
                onChange={(e) => setFormData({ ...formData, tieu_su: e.target.value })}
                className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                rows={4}
                placeholder="Nhập tiểu sử người biên dịch..."
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
            <DialogTitle>Chi tiết người biên dịch</DialogTitle>
          </DialogHeader>
          {selectedNguoiBienDich && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">ID</label>
                  <p className="text-base text-slate-900 dark:text-slate-100">{selectedNguoiBienDich.nguoi_bien_dich_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Ngày tạo</label>
                  <p className="text-base text-slate-900 dark:text-slate-100">{formatDate(selectedNguoiBienDich.ngay_tao)}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <UserPen className="h-4 w-4" />
                  Tên người biên dịch
                </label>
                <p className="text-base font-semibold text-slate-900 dark:text-slate-100">{selectedNguoiBienDich.ten_nguoi_bien_dich}</p>
              </div>
              {selectedNguoiBienDich.tieu_su && (
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tiểu sử</label>
                  <p className="text-base text-slate-900 dark:text-slate-100 whitespace-pre-wrap">{selectedNguoiBienDich.tieu_su}</p>
                </div>
              )}
              {selectedNguoiBienDich.ngay_cap_nhat && (
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Ngày cập nhật</label>
                  <p className="text-base text-slate-900 dark:text-slate-100">{formatDate(selectedNguoiBienDich.ngay_cap_nhat)}</p>
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
              Xác nhận xóa người biên dịch
            </DialogTitle>
            <DialogDescription className="pt-4 space-y-3">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <p className="text-base font-semibold text-destructive mb-2">
                  Bạn có chắc chắn muốn xóa người biên dịch này không?
                </p>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  <span className="font-medium">Tên người biên dịch:</span> {selectedNguoiBienDich?.ten_nguoi_bien_dich}
                </p>
                {selectedNguoiBienDich?.nguoi_bien_dich_id && (
                  <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                    <span className="font-medium">ID:</span> {selectedNguoiBienDich.nguoi_bien_dich_id}
                  </p>
                )}
                {selectedNguoiBienDich?.email && (
                  <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                    <span className="font-medium">Email:</span> {selectedNguoiBienDich.email}
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
                  <li>Nếu người biên dịch đang có sách, việc xóa có thể gặp lỗi</li>
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
  );
};

export default AdminQuanLyNguoiBienDich;


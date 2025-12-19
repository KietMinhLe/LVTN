import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import {
  getAllTacGia,
  createTacGia,
  updateTacGia,
  deleteTacGia,
  type TacGia,
  type CreateTacGiaRequest,
} from '../../services/tacGiaService';
import { Plus, Pencil, Trash2, Eye, Search, Loader2, ArrowLeft, Home, PenTool, ArrowUpDown, User } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '../../components/ui/badge';

const AdminQuanLyTacGia = () => {
  const navigate = useNavigate();
  const [tacGiaList, setTacGiaList] = useState<TacGia[]>([]);
  const [filteredTacGiaList, setFilteredTacGiaList] = useState<TacGia[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTacGia, setSelectedTacGia] = useState<TacGia | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Sắp xếp
  const [sortBy, setSortBy] = useState<'ten_tac_gia' | 'ngay_tao'>('ten_tac_gia');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Form state
  const [formData, setFormData] = useState<CreateTacGiaRequest>({
    ten_tac_gia: '',
    tieu_su: '',
  });
  const [formLoading, setFormLoading] = useState(false);

  // Load dữ liệu
  useEffect(() => {
    loadData();
  }, []);

  // Filter và sắp xếp tác giả
  useEffect(() => {
    let filtered = tacGiaList;
    
    // Filter theo search term
    if (searchTerm.trim() !== '') {
      filtered = tacGiaList.filter(
        (tg) =>
          tg.ten_tac_gia.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tg.tieu_su?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sắp xếp
    const sorted = [...filtered].sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';
      
      if (sortBy === 'ten_tac_gia') {
        aValue = a.ten_tac_gia.toLowerCase();
        bValue = b.ten_tac_gia.toLowerCase();
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
    
    setFilteredTacGiaList(sorted);
  }, [searchTerm, tacGiaList, sortBy, sortOrder]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getAllTacGia();
      setTacGiaList(data);
      setFilteredTacGiaList(data);
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
    setSelectedTacGia(null);
    setFormData({
      ten_tac_gia: '',
      tieu_su: '',
    });
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (tacGia: TacGia) => {
    setIsEditMode(true);
    setSelectedTacGia(tacGia);
    setFormData({
      ten_tac_gia: tacGia.ten_tac_gia,
      tieu_su: tacGia.tieu_su || '',
    });
    setIsDialogOpen(true);
  };

  const handleOpenViewDialog = (tacGia: TacGia) => {
    setSelectedTacGia(tacGia);
    setIsViewDialogOpen(true);
  };

  const handleOpenDeleteDialog = (tacGia: TacGia) => {
    // Kiểm tra nếu tác giả có sách thì không cho xóa
    if (tacGia.so_luong_sach !== undefined && tacGia.so_luong_sach > 0) {
      toast.error(`Không thể xóa tác giả "${tacGia.ten_tac_gia}" vì đang có ${tacGia.so_luong_sach} sách. Vui lòng xóa hoặc chuyển sách sang tác giả khác trước.`);
      return;
    }
    setSelectedTacGia(tacGia);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.ten_tac_gia.trim()) {
      toast.error('Dữ liệu không hợp lệ. Vui lòng nhập lại');
      return;
    }

    setFormLoading(true);
    try {
      if (isEditMode && selectedTacGia) {
        await updateTacGia(selectedTacGia.tac_gia_id, formData);
        toast.success('Cập nhật tác giả thành công');
      } else {
        await createTacGia(formData);
        toast.success('Thêm tác giả thành công');
      }
      
      setIsDialogOpen(false);
      await loadData();
      resetForm();
    } catch (error: unknown) {
      console.error('Error saving tac gia:', error);
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
    if (!selectedTacGia) return;

    // Kiểm tra lại số lượng sách trước khi xóa (double check)
    if (selectedTacGia.so_luong_sach !== undefined && selectedTacGia.so_luong_sach > 0) {
      toast.error(`Không thể xóa tác giả "${selectedTacGia.ten_tac_gia}" vì đang có ${selectedTacGia.so_luong_sach} sách. Vui lòng xóa hoặc chuyển sách sang tác giả khác trước.`);
      setIsDeleteDialogOpen(false);
      // Refresh dữ liệu để cập nhật số lượng sách
      await loadData();
      return;
    }

    setFormLoading(true);
    try {
      await deleteTacGia(selectedTacGia.tac_gia_id);
      toast.success('Xóa tác giả thành công');
      setIsDeleteDialogOpen(false);
      await loadData();
      setSelectedTacGia(null);
    } catch (error: unknown) {
      console.error('Error deleting tac gia:', error);
      let errorMessage = 'Lỗi không xác định';
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string; error?: string }; status?: number } };
        errorMessage = axiosError.response?.data?.message || 
                      axiosError.response?.data?.error || 
                      `Lỗi ${axiosError.response?.status || 500}`;
        
        // Nếu lỗi là do có sách, refresh dữ liệu để cập nhật số lượng sách
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
      ten_tac_gia: '',
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
                <PenTool className="h-6 w-6 text-primary" />
                Quản lý tác giả
              </CardTitle>
            </div>
            <Button onClick={handleOpenAddDialog} className="gap-2 bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              Thêm tác giả mới
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
                  placeholder="Tìm kiếm theo tên tác giả, tiểu sử..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'ten_tac_gia' | 'ngay_tao')}
                  className="px-3 py-2 h-10 border rounded-md text-sm bg-background border-slate-200 dark:border-slate-800 focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="ten_tac_gia">Sắp xếp theo tên</option>
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
          ) : filteredTacGiaList.length === 0 ? (
            <div className="text-center py-12 text-slate-600 dark:text-slate-400">
              Không có tác giả nào
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold">ID</th>
                    <th className="text-left p-3 font-semibold">Tên tác giả</th>
                    <th className="text-left p-3 font-semibold">Số lượng sách</th>
                    <th className="text-left p-3 font-semibold">Tiểu sử</th>
                    <th className="text-left p-3 font-semibold">Ngày tạo</th>
                    <th className="text-left p-3 font-semibold">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTacGiaList.map((tacGia) => (
                    <tr key={tacGia.tac_gia_id} className="border-b hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors">
                      <td className="p-3">{tacGia.tac_gia_id}</td>
                      <td className="p-3 font-medium">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                          <span>{tacGia.ten_tac_gia}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge 
                          variant={tacGia.so_luong_sach && tacGia.so_luong_sach > 0 ? "default" : "secondary"}
                          className={tacGia.so_luong_sach && tacGia.so_luong_sach > 0 ? "bg-primary" : ""}
                        >
                          {tacGia.so_luong_sach ?? 0} sách
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="max-w-md truncate text-sm text-slate-600 dark:text-slate-400">
                          {tacGia.tieu_su || <span className="text-slate-500 dark:text-slate-400">N/A</span>}
                        </div>
                      </td>
                      <td className="p-3 text-sm text-slate-600 dark:text-slate-400">
                        {formatDate(tacGia.ngay_tao)}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleOpenViewDialog(tacGia)}
                            title="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleOpenEditDialog(tacGia)}
                            title="Sửa"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleOpenDeleteDialog(tacGia)}
                            title={
                              tacGia.so_luong_sach && tacGia.so_luong_sach > 0
                                ? `Không thể xóa vì có ${tacGia.so_luong_sach} sách`
                                : "Xóa"
                            }
                            disabled={tacGia.so_luong_sach !== undefined && tacGia.so_luong_sach > 0}
                            className={`text-destructive hover:text-destructive ${
                              tacGia.so_luong_sach && tacGia.so_luong_sach > 0
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
            <DialogTitle>{isEditMode ? 'Sửa thông tin tác giả' : 'Thêm tác giả mới'}</DialogTitle>
            <DialogDescription>
              {isEditMode ? 'Cập nhật thông tin tác giả' : 'Điền đầy đủ thông tin để thêm tác giả mới'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4" lang="vi">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tên tác giả *</label>
              <Input
                value={formData.ten_tac_gia}
                onChange={(e) => setFormData({ ...formData, ten_tac_gia: e.target.value })}
                placeholder="Ví dụ: Nguyễn Văn A"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900 dark:text-slate-100">Tiểu sử</label>
              <textarea
                value={formData.tieu_su}
                onChange={(e) => setFormData({ ...formData, tieu_su: e.target.value })}
                className="w-full min-h-[150px] rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                rows={6}
                placeholder="Viết tiểu sử về tác giả..."
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
            <DialogTitle>Chi tiết tác giả</DialogTitle>
          </DialogHeader>
          {selectedTacGia && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">ID</label>
                  <p className="text-base text-slate-900 dark:text-slate-100">{selectedTacGia.tac_gia_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Ngày tạo</label>
                  <p className="text-base text-slate-900 dark:text-slate-100">{formatDate(selectedTacGia.ngay_tao)}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Tên tác giả
                </label>
                <p className="text-base font-semibold text-slate-900 dark:text-slate-100">{selectedTacGia.ten_tac_gia}</p>
              </div>
              {selectedTacGia.tieu_su && (
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tiểu sử</label>
                  <p className="text-base text-slate-900 dark:text-slate-100 whitespace-pre-wrap">{selectedTacGia.tieu_su}</p>
                </div>
              )}
              {selectedTacGia.ngay_cap_nhat && (
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Ngày cập nhật</label>
                  <p className="text-base text-slate-900 dark:text-slate-100">{formatDate(selectedTacGia.ngay_cap_nhat)}</p>
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
              Xác nhận xóa tác giả
            </DialogTitle>
            <DialogDescription className="pt-4 space-y-3">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <p className="text-base font-semibold text-destructive mb-2">
                  Bạn có chắc chắn muốn xóa tác giả này không?
                </p>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  <span className="font-medium">Tên tác giả:</span> {selectedTacGia?.ten_tac_gia}
                </p>
                {selectedTacGia?.tac_gia_id && (
                  <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                    <span className="font-medium">ID:</span> {selectedTacGia.tac_gia_id}
                  </p>
                )}
              </div>
              {selectedTacGia?.so_luong_sach !== undefined && selectedTacGia.so_luong_sach > 0 ? (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                      <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                        ❌ Không thể xóa:
                      </p>
                      <p className="text-sm text-red-700 dark:text-red-300 mt-2">
                        Tác giả này đang có {selectedTacGia.so_luong_sach} sách. Vui lòng xóa hoặc chuyển tất cả sách sang tác giả khác trước khi xóa tác giả này.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                        ⚠️ Cảnh báo:
                      </p>
                      <ul className="text-sm text-yellow-700 dark:text-yellow-300 mt-2 space-y-1 list-disc list-inside">
                        <li>Hành động này không thể hoàn tác</li>
                        <li>Tác giả sẽ bị xóa vĩnh viễn</li>
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
              disabled={formLoading || (selectedTacGia?.so_luong_sach !== undefined && selectedTacGia.so_luong_sach > 0)}
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

export default AdminQuanLyTacGia;


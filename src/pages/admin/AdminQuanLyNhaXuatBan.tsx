import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import {
  getAllNhaXuatBan,
  createNhaXuatBan,
  updateNhaXuatBan,
  deleteNhaXuatBan,
  type NhaXuatBan,
  type CreateNhaXuatBanRequest,
} from '../../services/nhaXuatBanService';
import { Plus, Pencil, Trash2, Eye, Search, Loader2, ArrowLeft, Home, Building2, ArrowUpDown, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '../../components/ui/badge';

const AdminQuanLyNhaXuatBan = () => {
  const navigate = useNavigate();
  const [nhaXuatBanList, setNhaXuatBanList] = useState<NhaXuatBan[]>([]);
  const [filteredNhaXuatBanList, setFilteredNhaXuatBanList] = useState<NhaXuatBan[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedNhaXuatBan, setSelectedNhaXuatBan] = useState<NhaXuatBan | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Sắp xếp
  const [sortBy, setSortBy] = useState<'ten_nha_xuat_ban' | 'ngay_tao'>('ten_nha_xuat_ban');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Form state
  const [formData, setFormData] = useState<CreateNhaXuatBanRequest>({
    ten_nha_xuat_ban: '',
    email: '',
  });
  const [formLoading, setFormLoading] = useState(false);

  // Load dữ liệu
  useEffect(() => {
    loadData();
  }, []);

  // Filter và sắp xếp nhà xuất bản
  useEffect(() => {
    let filtered = nhaXuatBanList;
    
    // Filter theo search term
    if (searchTerm.trim() !== '') {
      filtered = nhaXuatBanList.filter(
        (nxb) =>
          nxb.ten_nha_xuat_ban.toLowerCase().includes(searchTerm.toLowerCase()) ||
          nxb.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sắp xếp
    const sorted = [...filtered].sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';
      
      if (sortBy === 'ten_nha_xuat_ban') {
        aValue = a.ten_nha_xuat_ban.toLowerCase();
        bValue = b.ten_nha_xuat_ban.toLowerCase();
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
    
    setFilteredNhaXuatBanList(sorted);
  }, [searchTerm, nhaXuatBanList, sortBy, sortOrder]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getAllNhaXuatBan();
      setNhaXuatBanList(data);
      setFilteredNhaXuatBanList(data);
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
    setSelectedNhaXuatBan(null);
    setFormData({
      ten_nha_xuat_ban: '',
      email: '',
    });
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (nhaXuatBan: NhaXuatBan) => {
    setIsEditMode(true);
    setSelectedNhaXuatBan(nhaXuatBan);
    setFormData({
      ten_nha_xuat_ban: nhaXuatBan.ten_nha_xuat_ban,
      email: nhaXuatBan.email || '',
    });
    setIsDialogOpen(true);
  };

  const handleOpenViewDialog = (nhaXuatBan: NhaXuatBan) => {
    setSelectedNhaXuatBan(nhaXuatBan);
    setIsViewDialogOpen(true);
  };

  const handleOpenDeleteDialog = (nhaXuatBan: NhaXuatBan) => {
    // Kiểm tra nếu nhà xuất bản có sách thì không cho xóa
    if (nhaXuatBan.so_luong_sach !== undefined && nhaXuatBan.so_luong_sach > 0) {
      toast.error(`Không thể xóa nhà xuất bản "${nhaXuatBan.ten_nha_xuat_ban}" vì đang có ${nhaXuatBan.so_luong_sach} sách. Vui lòng xóa hoặc chuyển sách sang nhà xuất bản khác trước.`);
      return;
    }
    setSelectedNhaXuatBan(nhaXuatBan);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.ten_nha_xuat_ban.trim()) {
      toast.error('Dữ liệu không hợp lệ. Vui lòng nhập lại');
      return;
    }

    if (!formData.email.trim()) {
      toast.error('Dữ liệu không hợp lệ. Vui lòng nhập lại');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      toast.error('Dữ liệu không hợp lệ. Vui lòng nhập lại');
      return;
    }

    setFormLoading(true);
    try {
      if (isEditMode && selectedNhaXuatBan) {
        await updateNhaXuatBan(selectedNhaXuatBan.nha_xuat_ban_id, formData);
        toast.success('Cập nhật nhà xuất bản thành công');
      } else {
        await createNhaXuatBan(formData);
        toast.success('Thêm nhà xuất bản thành công');
      }
      
      setIsDialogOpen(false);
      await loadData();
      resetForm();
    } catch (error: unknown) {
      console.error('Error saving nha xuat ban:', error);
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
    if (!selectedNhaXuatBan) return;

    // Kiểm tra lại số lượng sách trước khi xóa (double check)
    if (selectedNhaXuatBan.so_luong_sach !== undefined && selectedNhaXuatBan.so_luong_sach > 0) {
      toast.error(`Không thể xóa nhà xuất bản "${selectedNhaXuatBan.ten_nha_xuat_ban}" vì đang có ${selectedNhaXuatBan.so_luong_sach} sách. Vui lòng xóa hoặc chuyển sách sang nhà xuất bản khác trước.`);
      setIsDeleteDialogOpen(false);
      await loadData();
      return;
    }

    setFormLoading(true);
    try {
      await deleteNhaXuatBan(selectedNhaXuatBan.nha_xuat_ban_id);
      toast.success('Xóa nhà xuất bản thành công');
      setIsDeleteDialogOpen(false);
      await loadData();
      setSelectedNhaXuatBan(null);
    } catch (error: unknown) {
      console.error('Error deleting nha xuat ban:', error);
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
      ten_nha_xuat_ban: '',
      email: '',
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
                <Building2 className="h-6 w-6 text-primary" />
                Quản lý nhà xuất bản
              </CardTitle>
            </div>
            <Button onClick={handleOpenAddDialog} className="gap-2 bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              Thêm nhà xuất bản mới
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
                  placeholder="Tìm kiếm theo tên nhà xuất bản..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'ten_nha_xuat_ban' | 'ngay_tao')}
                  className="px-3 py-2 h-10 border rounded-md text-sm bg-background border-slate-200 dark:border-slate-800 focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="ten_nha_xuat_ban">Sắp xếp theo tên</option>
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
          ) : filteredNhaXuatBanList.length === 0 ? (
            <div className="text-center py-12 text-slate-600 dark:text-slate-400">
              Không có nhà xuất bản nào
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold">ID</th>
                    <th className="text-left p-3 font-semibold">Tên nhà xuất bản</th>
                    <th className="text-left p-3 font-semibold">Email</th>
                    <th className="text-left p-3 font-semibold">Số lượng sách</th>
                    <th className="text-left p-3 font-semibold">Ngày tạo</th>
                    <th className="text-left p-3 font-semibold">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNhaXuatBanList.map((nhaXuatBan) => (
                    <tr key={nhaXuatBan.nha_xuat_ban_id} className="border-b hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors">
                      <td className="p-3">{nhaXuatBan.nha_xuat_ban_id}</td>
                      <td className="p-3 font-medium">{nhaXuatBan.ten_nha_xuat_ban}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          {nhaXuatBan.email ? (
                            <>
                              <Mail className="h-4 w-4" />
                              <span className="max-w-xs truncate">{nhaXuatBan.email}</span>
                            </>
                          ) : (
                            <span className="text-slate-500 dark:text-slate-400">N/A</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge 
                          variant={nhaXuatBan.so_luong_sach && nhaXuatBan.so_luong_sach > 0 ? "default" : "secondary"}
                          className={nhaXuatBan.so_luong_sach && nhaXuatBan.so_luong_sach > 0 ? "bg-primary" : ""}
                        >
                          {nhaXuatBan.so_luong_sach ?? 0} sách
                        </Badge>
                      </td>
                      <td className="p-3 text-sm text-slate-600 dark:text-slate-400">
                        {formatDate(nhaXuatBan.ngay_tao)}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleOpenViewDialog(nhaXuatBan)}
                            title="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleOpenEditDialog(nhaXuatBan)}
                            title="Sửa"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleOpenDeleteDialog(nhaXuatBan)}
                            title={
                              nhaXuatBan.so_luong_sach && nhaXuatBan.so_luong_sach > 0
                                ? `Không thể xóa vì có ${nhaXuatBan.so_luong_sach} sách`
                                : "Xóa"
                            }
                            disabled={nhaXuatBan.so_luong_sach !== undefined && nhaXuatBan.so_luong_sach > 0}
                            className={`text-destructive hover:text-destructive ${
                              nhaXuatBan.so_luong_sach && nhaXuatBan.so_luong_sach > 0
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
            <DialogTitle>{isEditMode ? 'Sửa thông tin nhà xuất bản' : 'Thêm nhà xuất bản mới'}</DialogTitle>
            <DialogDescription>
              {isEditMode ? 'Cập nhật thông tin nhà xuất bản' : 'Điền đầy đủ thông tin để thêm nhà xuất bản mới'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4" lang="vi">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tên nhà xuất bản *</label>
              <Input
                value={formData.ten_nha_xuat_ban}
                onChange={(e) => setFormData({ ...formData, ten_nha_xuat_ban: e.target.value })}
                placeholder="Ví dụ: Nhà xuất bản Trẻ, Nhà xuất bản Kim Đồng..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email *</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Ví dụ: contact@nxb.com"
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
            <DialogTitle>Chi tiết nhà xuất bản</DialogTitle>
          </DialogHeader>
          {selectedNhaXuatBan && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">ID</label>
                  <p className="text-base text-slate-900 dark:text-slate-100">{selectedNhaXuatBan.nha_xuat_ban_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Ngày tạo</label>
                  <p className="text-base text-slate-900 dark:text-slate-100">{formatDate(selectedNhaXuatBan.ngay_tao)}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Tên nhà xuất bản
                </label>
                <p className="text-base font-semibold text-slate-900 dark:text-slate-100">{selectedNhaXuatBan.ten_nha_xuat_ban}</p>
              </div>
              {selectedNhaXuatBan.email && (
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </label>
                  <p className="text-base text-slate-900 dark:text-slate-100">{selectedNhaXuatBan.email}</p>
                </div>
              )}
              {selectedNhaXuatBan.ngay_cap_nhat && (
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Ngày cập nhật</label>
                  <p className="text-base text-slate-900 dark:text-slate-100">{formatDate(selectedNhaXuatBan.ngay_cap_nhat)}</p>
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
              Xác nhận xóa nhà xuất bản
            </DialogTitle>
            <DialogDescription className="pt-4 space-y-3">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <p className="text-base font-semibold text-destructive mb-2">
                  Bạn có chắc chắn muốn xóa nhà xuất bản này không?
                </p>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  <span className="font-medium">Tên nhà xuất bản:</span> {selectedNhaXuatBan?.ten_nha_xuat_ban}
                </p>
                {selectedNhaXuatBan?.nha_xuat_ban_id && (
                  <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                    <span className="font-medium">ID:</span> {selectedNhaXuatBan.nha_xuat_ban_id}
                  </p>
                )}
              </div>
              {selectedNhaXuatBan?.so_luong_sach !== undefined && selectedNhaXuatBan.so_luong_sach > 0 ? (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                      <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                        ❌ Không thể xóa:
                      </p>
                      <p className="text-sm text-red-700 dark:text-red-300 mt-2">
                        Nhà xuất bản này đang có {selectedNhaXuatBan.so_luong_sach} sách. Vui lòng xóa hoặc chuyển tất cả sách sang nhà xuất bản khác trước khi xóa nhà xuất bản này.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                        ⚠️ Cảnh báo:
                      </p>
                      <ul className="text-sm text-yellow-700 dark:text-yellow-300 mt-2 space-y-1 list-disc list-inside">
                        <li>Hành động này không thể hoàn tác</li>
                        <li>Nhà xuất bản sẽ bị xóa vĩnh viễn</li>
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
              disabled={formLoading || (selectedNhaXuatBan?.so_luong_sach !== undefined && selectedNhaXuatBan.so_luong_sach > 0)}
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

export default AdminQuanLyNhaXuatBan;


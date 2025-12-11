import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import {
  getAllDoTuoi,
  createDoTuoi,
  updateDoTuoi,
  deleteDoTuoi,
  type DoTuoi,
  type CreateDoTuoiRequest,
} from '../../services/doTuoiService';
import { Plus, Pencil, Trash2, Eye, Search, Loader2, ArrowLeft, Home, Users, ArrowUpDown } from 'lucide-react';
import { toast } from 'sonner';

const AdminQuanLyDoTuoi = () => {
  const navigate = useNavigate();
  const [doTuoiList, setDoTuoiList] = useState<DoTuoi[]>([]);
  const [filteredDoTuoiList, setFilteredDoTuoiList] = useState<DoTuoi[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDoTuoi, setSelectedDoTuoi] = useState<DoTuoi | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Sắp xếp
  const [sortBy, setSortBy] = useState<'ten_do_tuoi' | 'ngay_tao'>('ten_do_tuoi');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Form state
  const [formData, setFormData] = useState<CreateDoTuoiRequest>({
    ten_do_tuoi: '',
    tuoi_toi_thieu: undefined,
    tuoi_toi_da: undefined,
  });
  const [formLoading, setFormLoading] = useState(false);

  // Load dữ liệu
  useEffect(() => {
    loadData();
  }, []);

  // Filter và sắp xếp độ tuổi
  useEffect(() => {
    let filtered = doTuoiList;
    
    // Filter theo search term
    if (searchTerm.trim() !== '') {
      filtered = doTuoiList.filter(
        (dt) =>
          dt.ten_do_tuoi.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sắp xếp
    const sorted = [...filtered].sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';
      
      if (sortBy === 'ten_do_tuoi') {
        aValue = a.ten_do_tuoi.toLowerCase();
        bValue = b.ten_do_tuoi.toLowerCase();
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
    
    setFilteredDoTuoiList(sorted);
  }, [searchTerm, doTuoiList, sortBy, sortOrder]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getAllDoTuoi();
      setDoTuoiList(data);
      setFilteredDoTuoiList(data);
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
    setSelectedDoTuoi(null);
    setFormData({
      ten_do_tuoi: '',
      tuoi_toi_thieu: undefined,
      tuoi_toi_da: undefined,
    });
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (doTuoi: DoTuoi) => {
    setIsEditMode(true);
    setSelectedDoTuoi(doTuoi);
    setFormData({
      ten_do_tuoi: doTuoi.ten_do_tuoi,
      tuoi_toi_thieu: doTuoi.tuoi_toi_thieu,
      tuoi_toi_da: doTuoi.tuoi_toi_da,
    });
    setIsDialogOpen(true);
  };

  const handleOpenViewDialog = (doTuoi: DoTuoi) => {
    setSelectedDoTuoi(doTuoi);
    setIsViewDialogOpen(true);
  };

  const handleOpenDeleteDialog = (doTuoi: DoTuoi) => {
    setSelectedDoTuoi(doTuoi);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.ten_do_tuoi.trim()) {
      toast.error('Vui lòng nhập tên độ tuổi');
      return;
    }

    if (formData.tuoi_toi_thieu !== undefined && formData.tuoi_toi_da !== undefined) {
      if (formData.tuoi_toi_thieu > formData.tuoi_toi_da) {
        toast.error('Tuổi tối thiểu không được lớn hơn tuổi tối đa');
        return;
      }
    }

    setFormLoading(true);
    try {
      if (isEditMode && selectedDoTuoi) {
        await updateDoTuoi(selectedDoTuoi.do_tuoi_id, formData);
        toast.success('Cập nhật độ tuổi thành công');
      } else {
        await createDoTuoi(formData);
        toast.success('Thêm độ tuổi thành công');
      }
      
      setIsDialogOpen(false);
      await loadData();
      resetForm();
    } catch (error: unknown) {
      console.error('Error saving do tuoi:', error);
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
    if (!selectedDoTuoi) return;

    setFormLoading(true);
    try {
      await deleteDoTuoi(selectedDoTuoi.do_tuoi_id);
      toast.success('Xóa độ tuổi thành công');
      setIsDeleteDialogOpen(false);
      await loadData();
      setSelectedDoTuoi(null);
    } catch (error: unknown) {
      console.error('Error deleting do tuoi:', error);
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
      ten_do_tuoi: '',
      tuoi_toi_thieu: undefined,
      tuoi_toi_da: undefined,
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
                <Users className="h-6 w-6 text-primary" />
                Quản lý độ tuổi
              </CardTitle>
            </div>
            <Button onClick={handleOpenAddDialog} className="gap-2 bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              Thêm độ tuổi mới
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
                  placeholder="Tìm kiếm theo tên độ tuổi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'ten_do_tuoi' | 'ngay_tao')}
                  className="px-3 py-2 h-10 border rounded-md text-sm bg-background border-slate-200 dark:border-slate-800 focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="ten_do_tuoi">Sắp xếp theo tên</option>
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
          ) : filteredDoTuoiList.length === 0 ? (
            <div className="text-center py-12 text-slate-600 dark:text-slate-400">
              Không có độ tuổi nào
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold">ID</th>
                    <th className="text-left p-3 font-semibold">Tên độ tuổi</th>
                    <th className="text-left p-3 font-semibold">Tuổi tối thiểu</th>
                    <th className="text-left p-3 font-semibold">Tuổi tối đa</th>
                    <th className="text-left p-3 font-semibold">Ngày tạo</th>
                    <th className="text-left p-3 font-semibold">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDoTuoiList.map((doTuoi) => (
                    <tr key={doTuoi.do_tuoi_id} className="border-b hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors">
                      <td className="p-3">{doTuoi.do_tuoi_id}</td>
                      <td className="p-3 font-medium">{doTuoi.ten_do_tuoi}</td>
                      <td className="p-3">
                        {doTuoi.tuoi_toi_thieu !== undefined && doTuoi.tuoi_toi_thieu !== null ? (
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-sm font-semibold">
                            {doTuoi.tuoi_toi_thieu} tuổi
                          </span>
                        ) : (
                          <span className="text-slate-500 dark:text-slate-400">N/A</span>
                        )}
                      </td>
                      <td className="p-3">
                        {doTuoi.tuoi_toi_da !== undefined && doTuoi.tuoi_toi_da !== null ? (
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-sm font-semibold">
                            {doTuoi.tuoi_toi_da} tuổi
                          </span>
                        ) : (
                          <span className="text-slate-500 dark:text-slate-400">N/A</span>
                        )}
                      </td>
                      <td className="p-3 text-sm text-slate-600 dark:text-slate-400">
                        {formatDate(doTuoi.ngay_tao)}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleOpenViewDialog(doTuoi)}
                            title="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleOpenEditDialog(doTuoi)}
                            title="Sửa"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleOpenDeleteDialog(doTuoi)}
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
            <DialogTitle>{isEditMode ? 'Sửa thông tin độ tuổi' : 'Thêm độ tuổi mới'}</DialogTitle>
            <DialogDescription>
              {isEditMode ? 'Cập nhật thông tin độ tuổi' : 'Điền đầy đủ thông tin để thêm độ tuổi mới'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4" lang="vi" acceptCharset="UTF-8">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tên độ tuổi *</label>
              <Input
                value={formData.ten_do_tuoi}
                onChange={(e) => setFormData({ ...formData, ten_do_tuoi: e.target.value })}
                placeholder="Ví dụ: Trẻ em, Thanh thiếu niên, Người lớn..."
                required
                lang="vi"
                autoComplete="off"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-900 dark:text-slate-100">Tuổi tối thiểu</label>
                <Input
                  type="number"
                  value={formData.tuoi_toi_thieu || ''}
                  onChange={(e) => setFormData({ ...formData, tuoi_toi_thieu: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="Ví dụ: 0, 6, 13..."
                  min={0}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-900 dark:text-slate-100">Tuổi tối đa</label>
                <Input
                  type="number"
                  value={formData.tuoi_toi_da || ''}
                  onChange={(e) => setFormData({ ...formData, tuoi_toi_da: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="Ví dụ: 5, 12, 18..."
                  min={0}
                />
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
            <DialogTitle>Chi tiết độ tuổi</DialogTitle>
          </DialogHeader>
          {selectedDoTuoi && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">ID</label>
                  <p className="text-base text-slate-900 dark:text-slate-100">{selectedDoTuoi.do_tuoi_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Ngày tạo</label>
                  <p className="text-base text-slate-900 dark:text-slate-100">{formatDate(selectedDoTuoi.ngay_tao)}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Tên độ tuổi
                </label>
                <p className="text-base font-semibold text-slate-900 dark:text-slate-100">{selectedDoTuoi.ten_do_tuoi}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tuổi tối thiểu</label>
                  <p className="text-base text-slate-900 dark:text-slate-100">
                    {selectedDoTuoi.tuoi_toi_thieu !== undefined && selectedDoTuoi.tuoi_toi_thieu !== null ? (
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded font-semibold">
                        {selectedDoTuoi.tuoi_toi_thieu} tuổi
                      </span>
                    ) : (
                      'N/A'
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tuổi tối đa</label>
                  <p className="text-base text-slate-900 dark:text-slate-100">
                    {selectedDoTuoi.tuoi_toi_da !== undefined && selectedDoTuoi.tuoi_toi_da !== null ? (
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded font-semibold">
                        {selectedDoTuoi.tuoi_toi_da} tuổi
                      </span>
                    ) : (
                      'N/A'
                    )}
                  </p>
                </div>
              </div>
              {selectedDoTuoi.ngay_cap_nhat && (
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Ngày cập nhật</label>
                  <p className="text-base text-slate-900 dark:text-slate-100">{formatDate(selectedDoTuoi.ngay_cap_nhat)}</p>
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
              Bạn có chắc chắn muốn xóa độ tuổi "{selectedDoTuoi?.ten_do_tuoi}"? Hành động này không thể hoàn tác.
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

export default AdminQuanLyDoTuoi;


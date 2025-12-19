import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import {
  getAllDanhGia,
  deleteDanhGiaByAdmin,
  type DanhGia
} from '../../services/danhGiaService';
import { getAllSach, type Sach } from '../../services/sachService';
import { Star, Trash2, Eye, Search, Loader2, ArrowLeft, Home, MessageSquare, User, BookOpen, X } from 'lucide-react';
import { toast } from 'sonner';

const AdminQuanLyDanhGia = () => {
  const navigate = useNavigate();
  const [danhGiaList, setDanhGiaList] = useState<DanhGia[]>([]);
  const [filteredList, setFilteredList] = useState<DanhGia[]>([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDanhGia, setSelectedDanhGia] = useState<DanhGia | null>(null);
  
  // Filters
  const [selectedSachId, setSelectedSachId] = useState<number | ''>('');
  const [sachList, setSachList] = useState<Sach[]>([]);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 20;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params: {
        page: number;
        limit: number;
        sach_id?: number;
        search?: string;
      } = {
        page: currentPage,
        limit: itemsPerPage
      };
      
      if (selectedSachId) {
        params.sach_id = selectedSachId;
      }
      
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }

      const response = await getAllDanhGia(params);
      setDanhGiaList(response.danh_gia);
      setFilteredList(response.danh_gia);
      
      if (response.pagination) {
        setTotalPages(response.pagination.totalPages);
        setTotalItems(response.pagination.total);
      }
    } catch (error: unknown) {
      console.error('Error loading data:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Lỗi không xác định';
      toast.error('Không thể tải dữ liệu: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedSachId, searchTerm]);

  // Load danh sách sách để filter
  useEffect(() => {
    const loadSach = async () => {
      try {
        const sach = await getAllSach();
        setSachList(sach);
      } catch (error) {
        console.error('Error loading sach:', error);
      }
    };
    loadSach();
  }, []);

  // Load dữ liệu
  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenViewDialog = (danhGia: DanhGia) => {
    setSelectedDanhGia(danhGia);
    setIsViewDialogOpen(true);
  };

  const handleOpenDeleteDialog = (danhGia: DanhGia) => {
    setSelectedDanhGia(danhGia);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedDanhGia) return;

    setFormLoading(true);
    try {
      await deleteDanhGiaByAdmin(selectedDanhGia.danh_gia_id);
      toast.success('Xóa đánh giá thành công');
      setIsDeleteDialogOpen(false);
      setSelectedDanhGia(null);
      await loadData();
    } catch (error: unknown) {
      console.error('Error deleting danh gia:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Lỗi không xác định';
      toast.error('Lỗi: ' + errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Chưa có';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const renderStars = (soSao: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((sao) => (
          <Star
            key={sao}
            className={`w-4 h-4 ${
              sao <= soSao
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        ))}
      </div>
    );
  };

  const getImageUrl = (url?: string | null) => {
    if (!url) return 'https://via.placeholder.com/100x150/6366f1/ffffff?text=No+Image';
    if (url.startsWith('http')) return url;
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    return `${apiBaseUrl}${url}`;
  };

  const activeFiltersCount = [selectedSachId, searchTerm.trim()].filter(Boolean).length;

  if (loading && danhGiaList.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải đánh giá...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                <MessageSquare className="h-8 w-8 text-blue-600" />
                Quản lý đánh giá
              </h1>
              <p className="text-gray-600">Quản lý tất cả đánh giá của khách hàng</p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/admin/dashboard')}
              className="gap-2"
            >
              <Home className="h-4 w-4" />
              Dashboard
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Tìm kiếm theo tên khách hàng, tên sách, hoặc nội dung đánh giá..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={selectedSachId}
                onChange={(e) => setSelectedSachId(e.target.value ? parseInt(e.target.value) : '')}
                className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tất cả sách</option>
                {sachList.map(sach => (
                  <option key={sach.sach_id} value={sach.sach_id}>
                    {sach.ten_sach}
                  </option>
                ))}
              </select>
              {activeFiltersCount > 0 && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedSachId('');
                    setSearchTerm('');
                  }}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Xóa bộ lọc ({activeFiltersCount})
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tổng số đánh giá</p>
                  <p className="text-2xl font-bold">{totalItems}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Đánh giá 5 sao</p>
                  <p className="text-2xl font-bold">
                    {danhGiaList.filter(dg => dg.xep_hang === 5).length}
                  </p>
                </div>
                <Star className="h-8 w-8 fill-yellow-400 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Điểm trung bình</p>
                  <p className="text-2xl font-bold">
                    {danhGiaList.length > 0
                      ? (danhGiaList.reduce((sum, dg) => sum + dg.xep_hang, 0) / danhGiaList.length).toFixed(1)
                      : '0.0'}
                  </p>
                </div>
                <Star className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Danh sách đánh giá */}
        {filteredList.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Không có đánh giá nào</h2>
              <p className="text-gray-600">Chưa có đánh giá nào trong hệ thống</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredList.map((danhGia) => (
              <Card key={danhGia.danh_gia_id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-md">
                      <span className="text-white font-bold text-lg">
                        {danhGia.khachhang?.ho_ten?.charAt(0).toUpperCase() || 'K'}
                      </span>
                    </div>

                    {/* Nội dung */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900">
                              {danhGia.khachhang?.ho_ten || 'Khách hàng'}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              <User className="w-3 h-3 mr-1" />
                              ID: {danhGia.khach_hang_id}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 mb-2">
                            {renderStars(danhGia.xep_hang)}
                            <span className="text-xs text-gray-500">
                              {formatDate(danhGia.ngay_danh_gia)}
                            </span>
                          </div>
                          {danhGia.sach && (
                            <div className="flex items-center gap-2 mb-2">
                              <BookOpen className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-700 font-medium">
                                {danhGia.sach.ten_sach}
                              </span>
                              {(() => {
                                const sachInfo = sachList.find(s => s.sach_id === danhGia.sach?.sach_id);
                                return sachInfo?.anh_bia_url && (
                                  <img
                                    src={getImageUrl(sachInfo.anh_bia_url)}
                                    alt={danhGia.sach.ten_sach}
                                    className="w-8 h-10 object-cover rounded border"
                                  />
                                );
                              })()}
                            </div>
                          )}
                          {danhGia.binh_luan && (
                            <p className="text-gray-700 mt-2 whitespace-pre-wrap">
                              {danhGia.binh_luan}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenViewDialog(danhGia)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDeleteDialog(danhGia)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Trước
            </Button>
            <span className="text-sm text-gray-600">
              Trang {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Sau
            </Button>
          </div>
        )}

        {/* View Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Chi tiết đánh giá</DialogTitle>
              <DialogDescription>
                Thông tin chi tiết về đánh giá này
              </DialogDescription>
            </DialogHeader>
            {selectedDanhGia && (
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-md">
                    <span className="text-white font-bold text-xl">
                      {selectedDanhGia.khachhang?.ho_ten?.charAt(0).toUpperCase() || 'K'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">
                      {selectedDanhGia.khachhang?.ho_ten || 'Khách hàng'}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {selectedDanhGia.khachhang?.email || 'N/A'}
                    </p>
                    <div className="flex items-center gap-2 mb-2">
                      {renderStars(selectedDanhGia.xep_hang)}
                      <span className="text-sm text-gray-500">
                        {selectedDanhGia.xep_hang} / 5 sao
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {formatDate(selectedDanhGia.ngay_danh_gia)}
                    </p>
                  </div>
                </div>

                {selectedDanhGia.sach && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Sản phẩm được đánh giá
                    </h4>
                    <div className="flex items-center gap-3">
                      {(() => {
                        const sachInfo = sachList.find(s => s.sach_id === selectedDanhGia.sach?.sach_id);
                        return sachInfo?.anh_bia_url && (
                          <img
                            src={getImageUrl(sachInfo.anh_bia_url)}
                            alt={selectedDanhGia.sach.ten_sach}
                            className="w-16 h-20 object-cover rounded border"
                          />
                        );
                      })()}
                      <div>
                        <p className="font-medium">{selectedDanhGia.sach.ten_sach}</p>
                        <p className="text-sm text-gray-600">ID: {selectedDanhGia.sach.sach_id}</p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedDanhGia.binh_luan && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Nội dung đánh giá</h4>
                    <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                      {selectedDanhGia.binh_luan}
                    </p>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">ID đánh giá</p>
                      <p className="font-medium">{selectedDanhGia.danh_gia_id}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">ID đơn hàng</p>
                      <p className="font-medium">{selectedDanhGia.don_hang_id}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-destructive flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Xác nhận xóa đánh giá
              </DialogTitle>
              <DialogDescription className="pt-4 space-y-3">
                {selectedDanhGia && (
                  <>
                    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                      <p className="text-base font-semibold text-destructive mb-2">
                        Bạn có chắc chắn muốn xóa đánh giá này không?
                      </p>
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        <span className="font-medium">Khách hàng:</span> {selectedDanhGia.khachhang?.ho_ten || 'N/A'}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Đánh giá:</span>
                        {renderStars(selectedDanhGia.xep_hang)}
                      </div>
                      {selectedDanhGia.binh_luan && (
                        <p className="text-sm text-slate-700 dark:text-slate-300 mt-2">
                          <span className="font-medium">Bình luận:</span> {selectedDanhGia.binh_luan}
                        </p>
                      )}
                      {selectedDanhGia.danh_gia_id && (
                        <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                          <span className="font-medium">ID:</span> {selectedDanhGia.danh_gia_id}
                        </p>
                      )}
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                        ⚠️ Cảnh báo:
                      </p>
                      <ul className="text-sm text-yellow-700 dark:text-yellow-300 mt-2 space-y-1 list-disc list-inside">
                        <li>Hành động này không thể hoàn tác</li>
                        <li>Đánh giá sẽ bị xóa vĩnh viễn</li>
                      </ul>
                    </div>
                  </>
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
    </div>
  );
};

export default AdminQuanLyDanhGia;


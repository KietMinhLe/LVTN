import { useState, useEffect, useCallback } from 'react';
import { Star, MessageSquare, Edit2, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { getDanhGiaBySachId, createDanhGia, updateDanhGia, type DanhGia } from '../services/danhGiaService';
import { getAllDonHang, type DonHang } from '../services/donHangService';
import { toast } from 'sonner';
import { useUserAuth } from '../hooks/useUserAuth';

interface DanhGiaSectionProps {
  sachId: number;
}

const DanhGiaSection = ({ sachId }: DanhGiaSectionProps) => {
  const { user, isAuthenticated } = useUserAuth();
  const [danhGiaData, setDanhGiaData] = useState<{
    danh_gia: DanhGia[];
    diem_trung_binh: number;
    tong_so_danh_gia: number;
    thong_ke_sao: { 5: number; 4: number; 3: number; 2: number; 1: number };
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [availableOrders, setAvailableOrders] = useState<DonHang[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const loadDanhGia = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getDanhGiaBySachId(sachId);
      setDanhGiaData(data);
    } catch (error) {
      console.error('Error loading reviews:', error);
      toast.error('Không thể tải đánh giá');
    } finally {
      setLoading(false);
    }
  }, [sachId]);

  const loadUserOrders = useCallback(async () => {
    try {
      const orders = await getAllDonHang();
      // Lọc các đơn hàng đã giao thành công và có sách này
      const ordersWithBook = orders.filter(order => 
        order.trang_thai === 'Đã giao hàng' &&
        order.chitietdonhang?.some(ct => ct.sach_id === sachId)
      );
      setAvailableOrders(ordersWithBook);
      
      // Tự động chọn đơn hàng đầu tiên nếu có
      if (ordersWithBook.length > 0 && !selectedOrderId) {
        setSelectedOrderId(ordersWithBook[0].don_hang_id);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  }, [sachId, selectedOrderId]);

  useEffect(() => {
    loadDanhGia();
    if (isAuthenticated && user) {
      loadUserOrders();
    }
  }, [loadDanhGia, loadUserOrders, isAuthenticated, user]);


  const handleSubmit = async () => {
    if (!isAuthenticated || !user) {
      toast.error('Vui lòng đăng nhập để đánh giá');
      setShowForm(false);
      return;
    }

    if (!selectedOrderId) {
      toast.error('Vui lòng chọn đơn hàng');
      return;
    }

    try {
      if (editingId) {
        // Cập nhật đánh giá
        await updateDanhGia(editingId, {
          xep_hang: rating,
          binh_luan: comment.trim() || undefined
        });
        toast.success('Cập nhật đánh giá thành công');
      } else {
        // Tạo đánh giá mới
        await createDanhGia({
          sach_id: sachId,
          don_hang_id: selectedOrderId,
          xep_hang: rating,
          binh_luan: comment.trim() || undefined
        });
        toast.success('Đánh giá của bạn đã được gửi. Sẽ hiển thị sau khi admin duyệt.');
      }
      setShowForm(false);
      setEditingId(null);
      setComment('');
      setRating(5);
      setSelectedOrderId(availableOrders[0]?.don_hang_id || null);
      loadDanhGia();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá');
    }
  };

  const handleEdit = (danhGia: DanhGia) => {
    setEditingId(danhGia.danh_gia_id);
    setRating(danhGia.xep_hang);
    setComment(danhGia.binh_luan || '');
    setSelectedOrderId(danhGia.don_hang_id);
    setShowForm(true);
  };


  const handleOpenForm = () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để đánh giá');
      return;
    }
    if (availableOrders.length === 0) {
      toast.error('Bạn cần mua sách này trước khi đánh giá');
      return;
    }
    setEditingId(null);
    setRating(5);
    setComment('');
    setShowForm(true);
  };

  const renderStars = (soSao: number, size: 'sm' | 'md' | 'lg' = 'md', interactive = false, onStarClick?: (sao: number) => void) => {
    const sizeClass = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-5 h-5'
    };
    const displayRating = interactive ? (hoverRating || rating) : soSao;
    
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((sao) => (
          <button
            key={sao}
            type="button"
            onClick={() => onStarClick?.(sao)}
            onMouseEnter={() => interactive && setHoverRating(sao)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            className={interactive ? 'focus:outline-none transition-transform hover:scale-110' : ''}
            disabled={!interactive}
          >
            <Star
              className={`${sizeClass[size]} transition-colors ${
                sao <= displayRating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-gray-200 text-gray-200'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (loading && !danhGiaData) {
    return (
      <div className="mt-12 text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Đang tải đánh giá...</p>
      </div>
    );
  }

  if (!danhGiaData) {
    return null;
  }

  const { danh_gia, diem_trung_binh, tong_so_danh_gia, thong_ke_sao } = danhGiaData;
  const userDanhGia = danh_gia.find(dg => dg.khach_hang_id === user?.id);

  return (
    <div className="mt-12 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-3xl font-bold text-gray-900">Đánh giá sản phẩm</h3>
        {isAuthenticated && availableOrders.length > 0 && !userDanhGia && (
          <Button onClick={handleOpenForm} className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
            <MessageSquare className="w-4 h-4 mr-2" />
            Viết đánh giá
          </Button>
        )}
      </div>

      {/* Tổng quan đánh giá */}
      <Card className="mb-8 border-2 border-gray-100 shadow-lg">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Điểm trung bình */}
            <div className="text-center md:text-left">
              <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-3">
                {diem_trung_binh.toFixed(1)}
              </div>
              <div className="mb-3 flex justify-center md:justify-start">
                {renderStars(Math.round(diem_trung_binh), 'lg')}
              </div>
              <div className="text-sm text-gray-600 font-medium">
                Dựa trên {tong_so_danh_gia} đánh giá
              </div>
            </div>

            {/* Thống kê theo sao */}
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((sao) => {
                const count = thong_ke_sao[sao as keyof typeof thong_ke_sao];
                const percent = tong_so_danh_gia > 0 ? (count / tong_so_danh_gia) * 100 : 0;
                return (
                  <div key={sao} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-16">
                      <span className="text-sm font-semibold text-gray-700">{sao}</span>
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right font-medium">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form đánh giá */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {editingId ? 'Chỉnh sửa đánh giá' : 'Viết đánh giá'}
            </DialogTitle>
            <DialogDescription>
              Chia sẻ trải nghiệm của bạn về sản phẩm này
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            {/* Chọn đơn hàng */}
            {availableOrders.length > 0 && (
              <div>
                <label className="block mb-2 font-semibold text-gray-700">Chọn đơn hàng</label>
                <select
                  value={selectedOrderId || ''}
                  onChange={(e) => setSelectedOrderId(parseInt(e.target.value))}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {availableOrders.map(order => (
                    <option key={order.don_hang_id} value={order.don_hang_id}>
                      Đơn hàng {order.ma_don_hang} - {new Date(order.ngay_dat_hang || '').toLocaleDateString('vi-VN')}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Xếp hạng */}
            <div>
              <label className="block mb-3 font-semibold text-gray-700">Xếp hạng của bạn</label>
              <div className="flex items-center gap-2">
                {renderStars(rating, 'lg', true, setRating)}
                <span className="ml-2 text-sm text-gray-600">
                  {rating === 1 && 'Rất không hài lòng'}
                  {rating === 2 && 'Không hài lòng'}
                  {rating === 3 && 'Bình thường'}
                  {rating === 4 && 'Hài lòng'}
                  {rating === 5 && 'Rất hài lòng'}
                </span>
              </div>
            </div>

            {/* Nhận xét */}
            <div>
              <label className="block mb-2 font-semibold text-gray-700">Nhận xét (tùy chọn)</label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value.slice(0, 500))}
                placeholder="Chia sẻ chi tiết về trải nghiệm của bạn với sản phẩm này..."
                rows={6}
                className="resize-none"
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">{comment.length}/500 ký tự</p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSubmit}
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                disabled={!selectedOrderId}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {editingId ? 'Cập nhật đánh giá' : 'Gửi đánh giá'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setComment('');
                  setRating(5);
                }}
              >
                Hủy
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Danh sách đánh giá */}
      <div className="space-y-4">
        {danh_gia.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Chưa có đánh giá nào cho sản phẩm này</p>
              {isAuthenticated && availableOrders.length > 0 && (
                <Button onClick={handleOpenForm} className="mt-4 bg-gradient-to-r from-blue-500 to-indigo-600">
                  Viết đánh giá đầu tiên
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          danh_gia.map((dg: DanhGia) => {
            const isOwnReview = dg.khach_hang_id === user?.id;
            return (
              <Card key={dg.danh_gia_id} className="border border-gray-200 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-md">
                      <span className="text-white font-bold text-lg">
                        {dg.khachhang?.ho_ten?.charAt(0).toUpperCase() || 'K'}
                      </span>
                    </div>

                    {/* Nội dung */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900">
                              {dg.khachhang?.ho_ten || 'Khách hàng'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {renderStars(dg.xep_hang)}
                            <span className="text-xs text-gray-500">
                              {dg.ngay_danh_gia
                                ? new Date(dg.ngay_danh_gia).toLocaleDateString('vi-VN', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })
                                : ''}
                            </span>
                          </div>
                        </div>

                        {/* Actions cho đánh giá của chính mình - chỉ cho phép chỉnh sửa */}
                        {isOwnReview && (
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(dg)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>

                      {dg.binh_luan && (
                        <p className="text-gray-700 leading-relaxed mt-3 whitespace-pre-wrap">
                          {dg.binh_luan}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default DanhGiaSection;


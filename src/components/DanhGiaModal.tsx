import { useState, useEffect } from 'react';
import { Star, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { createDanhGia, updateDanhGia, type DanhGia } from '../services/danhGiaService';
import { toast } from 'sonner';

interface DanhGiaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sachId: number;
  donHangId: number;
  sachTen?: string;
  existingDanhGia?: DanhGia | null;
  onSuccess?: () => void;
}

const DanhGiaModal = ({
  open,
  onOpenChange,
  sachId,
  donHangId,
  sachTen,
  existingDanhGia,
  onSuccess
}: DanhGiaModalProps) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (existingDanhGia) {
        setRating(existingDanhGia.xep_hang);
        setComment(existingDanhGia.binh_luan || '');
      } else {
        setRating(5);
        setComment('');
      }
    }
  }, [open, existingDanhGia]);

  const handleSubmit = async () => {
    if (rating < 1 || rating > 5) {
      toast.error('Vui lòng chọn xếp hạng từ 1 đến 5 sao');
      return;
    }

    try {
      setLoading(true);
      if (existingDanhGia) {
        // Cập nhật đánh giá
        await updateDanhGia(existingDanhGia.danh_gia_id, {
          xep_hang: rating,
          binh_luan: comment.trim() || undefined
        });
        toast.success('Cập nhật đánh giá thành công');
      } else {
        // Tạo đánh giá mới
        await createDanhGia({
          sach_id: sachId,
          don_hang_id: donHangId,
          xep_hang: rating,
          binh_luan: comment.trim() || undefined
        });
        toast.success('Đánh giá của bạn đã được gửi. Sẽ hiển thị sau khi admin duyệt.');
      }
      onOpenChange(false);
      onSuccess?.();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (soSao: number, interactive = false) => {
    const displayRating = interactive ? (hoverRating || rating) : soSao;
    
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((sao) => (
          <button
            key={sao}
            type="button"
            onClick={() => interactive && setRating(sao)}
            onMouseEnter={() => interactive && setHoverRating(sao)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            className={interactive ? 'focus:outline-none transition-transform hover:scale-110' : ''}
            disabled={!interactive}
          >
            <Star
              className={`w-6 h-6 transition-colors ${
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {existingDanhGia ? 'Chỉnh sửa đánh giá' : 'Đánh giá sản phẩm'}
          </DialogTitle>
          <DialogDescription>
            {sachTen && (
              <span className="font-medium text-gray-900">{sachTen}</span>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 mt-4">
          {/* Xếp hạng */}
          <div>
            <label className="block mb-3 font-semibold text-gray-700">Xếp hạng của bạn</label>
            <div className="flex items-center gap-3">
              {renderStars(rating, true)}
              <span className="text-sm text-gray-600">
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
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
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
              disabled={loading}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {loading ? 'Đang xử lý...' : (existingDanhGia ? 'Cập nhật đánh giá' : 'Gửi đánh giá')}
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Hủy
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DanhGiaModal;


import { useState, useRef } from 'react';
import { Button } from './ui/button';
import { uploadManyAnhSach } from '../services/anhSachService';
import { toast } from 'sonner';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface UploadMultipleImagesProps {
  sach_id: number;
  onUploadSuccess?: () => void;
  maxImages?: number;
}

const UploadMultipleImages = ({ 
  sach_id, 
  onUploadSuccess,
  maxImages = 10 
}: UploadMultipleImagesProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Kiểm tra số lượng ảnh
    if (selectedFiles.length + files.length > maxImages) {
      toast.error(`Chỉ có thể upload tối đa ${maxImages} ảnh`);
      return;
    }

    // Kiểm tra loại file
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length !== files.length) {
      toast.error('Chỉ chấp nhận file ảnh');
    }

    // Tạo preview
    const newPreviews: string[] = [];
    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        newPreviews.push(result);
        if (newPreviews.length === imageFiles.length) {
          setPreviews(prev => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });

    setSelectedFiles(prev => [...prev, ...imageFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Vui lòng chọn ít nhất một ảnh');
      return;
    }

    setUploading(true);
    try {
      await uploadManyAnhSach(sach_id, selectedFiles);
      toast.success(`Upload ${selectedFiles.length} ảnh thành công!`);
      setSelectedFiles([]);
      setPreviews([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onUploadSuccess?.();
    } catch (error: unknown) {
      console.error('Error uploading images:', error);
      toast.error('Lỗi khi upload ảnh. Vui lòng thử lại.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Chọn ảnh ({selectedFiles.length}/{maxImages})
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        {selectedFiles.length > 0 && (
          <Button
            onClick={handleUpload}
            disabled={uploading}
            className="flex items-center gap-2"
          >
            {uploading ? 'Đang upload...' : `Upload ${selectedFiles.length} ảnh`}
          </Button>
        )}
      </div>

      {previews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={() => removeFile(index)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
                Ảnh {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedFiles.length === 0 && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500">Chưa có ảnh nào được chọn</p>
          <p className="text-sm text-gray-400 mt-1">
            Click "Chọn ảnh" để thêm ảnh cho sách này
          </p>
        </div>
      )}
    </div>
  );
};

export default UploadMultipleImages;


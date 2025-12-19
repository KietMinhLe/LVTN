import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import {
  getAllSach,
  createSach,
  updateSach,
  deleteSach,
  getAllTacGia,
  getAllNhaXuatBan,
  getAllThuongHieu,
  getAllNhaCungCap,
  type Sach,
  type CreateSachRequest,
  type TacGia,
  type NhaXuatBan,
  type ThuongHieu,
  type NhaCungCap,
} from '../../services/sachService';
import {
  getAllNgonNgu,
  type NgonNgu,
} from '../../services/ngonNguService';
import {
  getAllDoTuoi,
  type DoTuoi,
} from '../../services/doTuoiService';
import {
  getAllNguoiBienDich,
  type NguoiBienDich,
} from '../../services/nguoiBienDichService';
import { Plus, Pencil, Trash2, Eye, Search, Loader2, Image as ImageIcon, X, ArrowLeft, Home, ArrowUpDown, BookOpen, CheckCircle2, XCircle, DollarSign, Users, Images } from 'lucide-react';
import { toast } from 'sonner';
import UploadMultipleImages from '../../components/UploadMultipleImages';
import { getAnhSachBySachId, deleteAnhSach, type AnhSach } from '../../services/anhSachService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const AdminQuanLySach = () => {
  const navigate = useNavigate();
  const [sachList, setSachList] = useState<Sach[]>([]);
  const [filteredSachList, setFilteredSachList] = useState<Sach[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [selectedSach, setSelectedSach] = useState<Sach | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [bookImages, setBookImages] = useState<AnhSach[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  
  // Sắp xếp
  const [sortBy, setSortBy] = useState<'sach_id' | 'ten_sach' | 'tacgia_id' | 'nhaxuatban_id' | 'thuonghieu_id' | 'nhacungcap_id' | 'danhmuc_id' | 'ngay_tao'>('ten_sach');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Dữ liệu tham chiếu
  const [tacGiaList, setTacGiaList] = useState<TacGia[]>([]);
  const [nhaXuatBanList, setNhaXuatBanList] = useState<NhaXuatBan[]>([]);
  const [thuongHieuList, setThuongHieuList] = useState<ThuongHieu[]>([]);
  const [nhaCungCapList, setNhaCungCapList] = useState<NhaCungCap[]>([]);
  const [ngonNguList, setNgonNguList] = useState<NgonNgu[]>([]);
  const [doTuoiList, setDoTuoiList] = useState<DoTuoi[]>([]);
  const [nguoiBienDichList, setNguoiBienDichList] = useState<NguoiBienDich[]>([]);

  // Form state
  const [formData, setFormData] = useState<CreateSachRequest>({
    ten_sach: '',
    ma_sach: '',
    mo_ta: '',
    gia_bia: 0,
    gia_ban: 0,
    trong_luong: 0,
    ngay_xuat_ban: '',
    so_trang: 0,
    isbn: '',
    so_luong: 0,
    trang_thai: true,
    tac_gia_id: 0,
    nha_xuat_ban_id: 0,
    thuong_hieu_id: 0,
    nha_cung_cap_id: 0,
    ngon_ngu_id: 0,
    do_tuoi_id: 0,
    nguoi_bien_dich_id: 0,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Load dữ liệu
  useEffect(() => {
    loadData();
  }, []);

  // Filter và sắp xếp sách
  useEffect(() => {
    let filtered = sachList;
    
    // Filter theo search term
    if (searchTerm.trim() !== '') {
      filtered = sachList.filter(
        (sach) =>
          sach.ten_sach.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sach.ma_sach.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sach.tacgia?.ten_tac_gia.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sắp xếp
    const sorted = [...filtered].sort((a, b) => {
      let aValue: string | number = 0;
      let bValue: string | number = 0;
      
      if (sortBy === 'ten_sach') {
        aValue = a.ten_sach.toLowerCase();
        bValue = b.ten_sach.toLowerCase();
      } else if (sortBy === 'sach_id') {
        aValue = a.sach_id;
        bValue = b.sach_id;
      } else if (sortBy === 'ngay_tao') {
        aValue = a.ngay_tao ? new Date(a.ngay_tao).getTime() : 0;
        bValue = b.ngay_tao ? new Date(b.ngay_tao).getTime() : 0;
      } else if (sortBy === 'tacgia_id') {
        aValue = a.tac_gia_id;
        bValue = b.tac_gia_id;
      } else {
        // Mặc định so sánh theo ID
        aValue = a.sach_id;
        bValue = b.sach_id;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });
    
    setFilteredSachList(sorted);
  }, [searchTerm, sachList, sortBy, sortOrder]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sach, tacGia, nhaXuatBan, thuongHieu, nhaCungCap, ngonNgu, doTuoi, nguoiBienDich] = await Promise.allSettled([
        getAllSach(),
        getAllTacGia(),
        getAllNhaXuatBan(),
        getAllThuongHieu(),
        getAllNhaCungCap(),
        getAllNgonNgu(),
        getAllDoTuoi(),
        getAllNguoiBienDich(),
      ]);

      // Xử lý kết quả từ Promise.allSettled
      setSachList(sach.status === 'fulfilled' ? sach.value : []);
      setFilteredSachList(sach.status === 'fulfilled' ? sach.value : []);
      setTacGiaList(tacGia.status === 'fulfilled' ? tacGia.value : []);
      setNhaXuatBanList(nhaXuatBan.status === 'fulfilled' ? nhaXuatBan.value : []);
      setThuongHieuList(thuongHieu.status === 'fulfilled' ? thuongHieu.value : []);
      setNhaCungCapList(nhaCungCap.status === 'fulfilled' ? nhaCungCap.value : []);
      setNgonNguList(ngonNgu.status === 'fulfilled' ? ngonNgu.value : []);
      setDoTuoiList(doTuoi.status === 'fulfilled' ? doTuoi.value : []);
      setNguoiBienDichList(nguoiBienDich.status === 'fulfilled' ? nguoiBienDich.value : []);

      // Log errors nếu có
      const errors: string[] = [];
      if (sach.status === 'rejected') {
        console.error('Error loading sach:', sach.reason);
        errors.push('Sách');
      }
      if (tacGia.status === 'rejected') {
        console.error('Error loading tacGia:', tacGia.reason);
        errors.push('Tác giả');
      }
      if (nhaXuatBan.status === 'rejected') {
        console.error('Error loading nhaXuatBan:', nhaXuatBan.reason);
        errors.push('Nhà xuất bản');
      }
      if (thuongHieu.status === 'rejected') {
        console.error('Error loading thuongHieu:', thuongHieu.reason);
        errors.push('Thương hiệu');
      }
      if (nhaCungCap.status === 'rejected') {
        console.error('Error loading nhaCungCap:', nhaCungCap.reason);
        errors.push('Nhà cung cấp');
      }
      if (ngonNgu.status === 'rejected') {
        console.error('Error loading ngonNgu:', ngonNgu.reason);
        errors.push('Ngôn ngữ');
      }
      if (doTuoi.status === 'rejected') {
        console.error('Error loading doTuoi:', doTuoi.reason);
        errors.push('Độ tuổi');
      }
      if (nguoiBienDich.status === 'rejected') {
        console.error('Error loading nguoiBienDich:', nguoiBienDich.reason);
        errors.push('Người biên dịch');
      }

      if (errors.length > 0) {
        toast.warning(`Không thể tải một số dữ liệu: ${errors.join(', ')}`);
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
  };

  const handleOpenAddDialog = () => {
    setIsEditMode(false);
    setSelectedSach(null);
    setFormData({
      ten_sach: '',
      ma_sach: '',
      mo_ta: '',
      gia_bia: 0,
      gia_ban: 0,
      trong_luong: 0,
      ngay_xuat_ban: '',
      so_trang: 0,
      isbn: '',
      so_luong: 0,
      trang_thai: true,
      tac_gia_id: 0,
      nha_xuat_ban_id: 0,
      thuong_hieu_id: 0,
      nha_cung_cap_id: 0,
      ngon_ngu_id: 0,
      do_tuoi_id: 0,
      nguoi_bien_dich_id: 0,
    });
    setImagePreview(null);
    setImageFile(null);
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (sach: Sach) => {
    setIsEditMode(true);
    setSelectedSach(sach);
    setFormData({
      ten_sach: sach.ten_sach,
      ma_sach: sach.ma_sach,
      mo_ta: sach.mo_ta || '',
      gia_bia: Number(sach.gia_bia),
      gia_ban: Number(sach.gia_ban),
      trong_luong: sach.trong_luong,
      ngay_xuat_ban: sach.ngay_xuat_ban ? new Date(sach.ngay_xuat_ban).toISOString().split('T')[0] : '',
      so_trang: sach.so_trang || 0,
      isbn: sach.isbn || '',
      so_luong: (sach as Sach & { so_luong?: number }).so_luong || 0,
      trang_thai: sach.trang_thai ?? true,
      tac_gia_id: sach.tac_gia_id,
      nha_xuat_ban_id: sach.nha_xuat_ban_id,
      thuong_hieu_id: sach.thuong_hieu_id,
      nha_cung_cap_id: sach.nha_cung_cap_id,
      ngon_ngu_id: sach.ngon_ngu_id,
      do_tuoi_id: sach.do_tuoi_id,
      nguoi_bien_dich_id: sach.nguoi_bien_dich_id,
    });
    setImagePreview(sach.anh_bia_url ? `${API_BASE_URL}${sach.anh_bia_url}` : null);
    setImageFile(null);
    setIsDialogOpen(true);
  };

  const handleOpenViewDialog = (sach: Sach) => {
    setSelectedSach(sach);
    setIsViewDialogOpen(true);
  };

  const handleOpenDeleteDialog = (sach: Sach) => {
    setSelectedSach(sach);
    setIsDeleteDialogOpen(true);
  };

  const handleOpenImageDialog = async (sach: Sach) => {
    setSelectedSach(sach);
    setIsImageDialogOpen(true);
    await loadBookImages(sach.sach_id);
  };

  const loadBookImages = async (sach_id: number) => {
    setLoadingImages(true);
    try {
      const images = await getAnhSachBySachId(sach_id);
      setBookImages(images);
    } catch (error) {
      console.error('Error loading images:', error);
      toast.error('Không thể tải danh sách ảnh');
      setBookImages([]);
    } finally {
      setLoadingImages(false);
    }
  };

  const handleDeleteImage = async (anh_sach_id: number) => {
    try {
      await deleteAnhSach(anh_sach_id);
      toast.success('Xóa ảnh thành công');
      if (selectedSach) {
        await loadBookImages(selectedSach.sach_id);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Lỗi khi xóa ảnh');
    }
  };

  const handleUploadSuccess = async () => {
    if (selectedSach) {
      await loadBookImages(selectedSach.sach_id);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Kích thước ảnh không được vượt quá 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Chỉ chấp nhận file ảnh');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation - Thông tin cơ bản
    if (!formData.ten_sach || !formData.ten_sach.trim()) {
      toast.error('Dữ liệu không hợp lệ. Vui lòng nhập lại');
      return;
    }

    if (!formData.ma_sach || !formData.ma_sach.trim()) {
      toast.error('Dữ liệu không hợp lệ. Vui lòng nhập lại');
      return;
    }

    if (!formData.gia_bia || formData.gia_bia <= 0) {
      toast.error('Dữ liệu không hợp lệ. Vui lòng nhập lại');
      return;
    }

    if (!formData.gia_ban || formData.gia_ban <= 0) {
      toast.error('Dữ liệu không hợp lệ. Vui lòng nhập lại');
      return;
    }

    if (!formData.trong_luong || formData.trong_luong <= 0) {
      toast.error('Dữ liệu không hợp lệ. Vui lòng nhập lại');
      return;
    }

    // Validation - Thông tin tham chiếu
    if (!formData.tac_gia_id || formData.tac_gia_id === 0) {
      toast.error('Dữ liệu không hợp lệ. Vui lòng nhập lại');
      return;
    }

    if (!formData.nha_xuat_ban_id || formData.nha_xuat_ban_id === 0) {
      toast.error('Dữ liệu không hợp lệ. Vui lòng nhập lại');
      return;
    }

    if (!formData.thuong_hieu_id || formData.thuong_hieu_id === 0) {
      toast.error('Dữ liệu không hợp lệ. Vui lòng nhập lại');
      return;
    }

    if (!formData.nha_cung_cap_id || formData.nha_cung_cap_id === 0) {
      toast.error('Dữ liệu không hợp lệ. Vui lòng nhập lại');
      return;
    }

    if (!formData.ngon_ngu_id || formData.ngon_ngu_id === 0) {
      toast.error('Dữ liệu không hợp lệ. Vui lòng nhập lại');
      return;
    }

    if (!formData.do_tuoi_id || formData.do_tuoi_id === 0) {
      toast.error('Dữ liệu không hợp lệ. Vui lòng nhập lại');
      return;
    }

    if (!formData.nguoi_bien_dich_id || formData.nguoi_bien_dich_id === 0) {
      toast.error('Dữ liệu không hợp lệ. Vui lòng nhập lại');
      return;
    }

    setFormLoading(true);
    try {
      const submitData: CreateSachRequest = {
        ...formData,
        anh_bia: imageFile || undefined,
      };

      // Debug: Log dữ liệu trước khi gửi
      console.log('Submitting data:', {
        ...submitData,
        anh_bia: imageFile ? 'File present' : 'No file'
      });
      console.log('Form data IDs:', {
        tac_gia_id: formData.tac_gia_id,
        nha_xuat_ban_id: formData.nha_xuat_ban_id,
        thuong_hieu_id: formData.thuong_hieu_id,
        nha_cung_cap_id: formData.nha_cung_cap_id,
        ngon_ngu_id: formData.ngon_ngu_id,
        do_tuoi_id: formData.do_tuoi_id,
        nguoi_bien_dich_id: formData.nguoi_bien_dich_id,
        so_luong: formData.so_luong
      });

      if (isEditMode && selectedSach) {
        await updateSach(selectedSach.sach_id, submitData);
        toast.success('Cập nhật sách thành công');
      } else {
        await createSach(submitData);
        toast.success('Thêm sách thành công');
      }
      
      setIsDialogOpen(false);
      await loadData();
      resetForm();
    } catch (error: unknown) {
      console.error('Error saving sach:', error);
      let errorMessage = 'Lỗi không xác định';
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { 
          response?: { 
            data?: { 
              message?: string; 
              error?: string;
              code?: string;
            }; 
            status?: number;
          } 
        };
        
        errorMessage = axiosError.response?.data?.message || 
                      axiosError.response?.data?.error || 
                      `Lỗi ${axiosError.response?.status || 500}`;
        
        console.error('Axios error details:', {
          status: axiosError.response?.status,
          message: axiosError.response?.data?.message,
          error: axiosError.response?.data?.error,
          code: axiosError.response?.data?.code
        });
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast.error('Lỗi: ' + errorMessage);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedSach) return;

    setFormLoading(true);
    try {
      await deleteSach(selectedSach.sach_id);
      toast.success('Xóa sách thành công');
      setIsDeleteDialogOpen(false);
      await loadData();
      setSelectedSach(null);
    } catch (error: unknown) {
      console.error('Error deleting sach:', error);
      let errorMessage = 'Lỗi không xác định';
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { 
          response?: { 
            data?: { 
              message?: string; 
              error?: string;
            }; 
            status?: number 
          } 
        };
        
        errorMessage = axiosError.response?.data?.message || 
                      axiosError.response?.data?.error || 
                      `Lỗi ${axiosError.response?.status || 500}`;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      // Hiển thị thông báo lỗi
      toast.error(errorMessage, { duration: 5000 });
    } finally {
      setFormLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      ten_sach: '',
      ma_sach: '',
      mo_ta: '',
      gia_bia: 0,
      gia_ban: 0,
      trong_luong: 0,
      ngay_xuat_ban: '',
    so_trang: 0,
    isbn: '',
    so_luong: 0,
    trang_thai: true,
      tac_gia_id: 0,
      nha_xuat_ban_id: 0,
      thuong_hieu_id: 0,
      nha_cung_cap_id: 0,
      ngon_ngu_id: 0,
      do_tuoi_id: 0,
      nguoi_bien_dich_id: 0,
    });
    setImagePreview(null);
    setImageFile(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
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
              <CardTitle className="text-2xl font-bold from-primary to-primary/70 bg-clip-text text-transparent dark:from-primary/90 dark:to-primary/70 flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-primary" />
                Quản lý sách
              </CardTitle>
            </div>
            <Button onClick={handleOpenAddDialog} className="gap-2 bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              Thêm sách mới
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
                  placeholder="Tìm kiếm theo tên sách, mã sách, tác giả..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="px-3 py-2 h-10 border rounded-md text-sm bg-background border-slate-200 dark:border-slate-800 focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="ten_sach">Sắp xếp theo tên</option>
                  <option value="sach_id">Sắp xếp theo ID</option>
                  <option value="ngay_tao">Sắp xếp theo ngày tạo</option>
                  <option value="tacgia_id">Sắp xếp theo tác giả</option>
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
          ) : filteredSachList.length === 0 ? (
            <div className="text-center py-12 text-slate-600 dark:text-slate-400">
              Không có sách nào
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold">ID</th>
                    <th className="text-left p-3 font-semibold">Ảnh</th>
                    <th className="text-left p-3 font-semibold">Mã sách</th>
                    <th className="text-left p-3 font-semibold">Tên sách</th>
                    <th className="text-left p-3 font-semibold">Tác giả</th>
                    <th className="text-left p-3 font-semibold">Giá bán</th>
                    <th className="text-left p-3 font-semibold">Tổng SL</th>
                    <th className="text-left p-3 font-semibold">SL đã bán</th>
                    <th className="text-left p-3 font-semibold">SL còn lại</th>
                    <th className="text-left p-3 font-semibold">Trạng thái</th>
                    <th className="text-left p-3 font-semibold">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSachList.map((sach) => (
                    <tr key={sach.sach_id} className="border-b hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors">
                      <td className="p-3">{sach.sach_id}</td>
                      <td className="p-3">
                        {sach.anh_bia_url ? (
                          <img
                            src={`${API_BASE_URL}${sach.anh_bia_url}`}
                            alt={sach.ten_sach}
                            className="w-16 h-20 object-cover rounded"
                          />
                        ) : (
                          <div className="w-16 h-20 bg-muted flex items-center justify-center rounded">
                            <ImageIcon className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </td>
                      <td className="p-3 font-mono text-sm">{sach.ma_sach}</td>
                      <td className="p-3 font-medium">{sach.ten_sach}</td>
                      <td className="p-3">{sach.tacgia?.ten_tac_gia || 'N/A'}</td>
                      <td className="p-3 font-semibold">{formatCurrency(Number(sach.gia_ban))}</td>
                      <td className="p-3 text-center">
                        <span className="font-semibold text-blue-600">
                          {(() => {
                            const soLuong = (sach as Sach & { so_luong?: number }).so_luong ?? 0;
                            return soLuong > 0 ? soLuong : 'N/A';
                          })()}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="font-semibold text-primary">
                          {sach.sl_da_ban || 0}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="font-semibold text-green-600">
                          {(() => {
                            // Tính số lượng còn lại = số lượng tồn kho - số lượng đã bán
                            // Nếu không có số lượng tồn kho, hiển thị N/A
                            const soLuong = (sach as Sach & { so_luong?: number }).so_luong ?? 0;
                            const daBan = sach.sl_da_ban ?? 0;
                            const conLai = soLuong - daBan;
                            return soLuong > 0 ? Math.max(0, conLai) : 'N/A';
                          })()}
                        </span>
                      </td>
                      <td className="p-3">
                        <Badge variant={sach.trang_thai ? 'default' : 'secondary'} className="flex items-center gap-1 w-fit">
                          {sach.trang_thai ? (
                            <>
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Hoạt động</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3" />
                              <span>Tạm khóa</span>
                            </>
                          )}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleOpenViewDialog(sach)}
                            title="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleOpenImageDialog(sach)}
                            title="Quản lý ảnh"
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Images className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleOpenEditDialog(sach)}
                            title="Sửa"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleOpenDeleteDialog(sach)}
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Sửa thông tin sách' : 'Thêm sách mới'}</DialogTitle>
            <DialogDescription>
              {isEditMode ? 'Cập nhật thông tin sách' : 'Điền đầy đủ thông tin để thêm sách mới'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6" lang="vi">
            {/* Section 1: Thông tin cơ bản */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-700">
                <BookOpen className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Thông tin cơ bản</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-900 dark:text-slate-100">Tên sách *</label>
                  <Input
                    value={formData.ten_sach}
                    onChange={(e) => setFormData({ ...formData, ten_sach: e.target.value })}
                    placeholder="Nhập tên sách..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-900 dark:text-slate-100">Mã sách *</label>
                  <Input
                    value={formData.ma_sach}
                    onChange={(e) => setFormData({ ...formData, ma_sach: e.target.value })}
                    placeholder="Ví dụ: SACH-001"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-900 dark:text-slate-100">Mô tả</label>
                <textarea
                  value={formData.mo_ta}
                  onChange={(e) => setFormData({ ...formData, mo_ta: e.target.value })}
                  className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                  rows={4}
                  placeholder="Nhập mô tả về sách..."
                />
              </div>
            </div>

            {/* Section 2: Giá và thông số kỹ thuật */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-700">
                <DollarSign className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Giá và thông số kỹ thuật</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-900 dark:text-slate-100">Giá bìa (₫) *</label>
                  <Input
                    type="number"
                    value={formData.gia_bia}
                    onChange={(e) => setFormData({ ...formData, gia_bia: Number(e.target.value) })}
                    placeholder="0"
                    min={0}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-900 dark:text-slate-100">Giá bán (₫) *</label>
                  <Input
                    type="number"
                    value={formData.gia_ban}
                    onChange={(e) => setFormData({ ...formData, gia_ban: Number(e.target.value) })}
                    placeholder="0"
                    min={0}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-900 dark:text-slate-100">Số lượng *</label>
                  <Input
                    type="number"
                    value={formData.so_luong || 0}
                    onChange={(e) => setFormData({ ...formData, so_luong: Number(e.target.value) })}
                    placeholder="0"
                    min={0}
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Tổng số lượng sách nhập vào kho
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-900 dark:text-slate-100">Trọng lượng (g) *</label>
                  <Input
                    type="number"
                    value={formData.trong_luong}
                    onChange={(e) => setFormData({ ...formData, trong_luong: Number(e.target.value) })}
                    placeholder="0"
                    min={0}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-900 dark:text-slate-100">Số trang</label>
                  <Input
                    type="number"
                    value={formData.so_trang}
                    onChange={(e) => setFormData({ ...formData, so_trang: Number(e.target.value) })}
                    placeholder="0"
                    min={0}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-900 dark:text-slate-100">ISBN</label>
                  <Input
                    value={formData.isbn}
                    onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                    placeholder="978-0-123456-78-9"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-900 dark:text-slate-100">Ngày xuất bản</label>
                  <Input
                    type="date"
                    value={formData.ngay_xuat_ban}
                    onChange={(e) => setFormData({ ...formData, ngay_xuat_ban: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Thông tin liên quan */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-700">
                <Users className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Thông tin liên quan</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-900 dark:text-slate-100">Tác giả *</label>
                  <select
                    value={formData.tac_gia_id}
                    onChange={(e) => setFormData({ ...formData, tac_gia_id: Number(e.target.value) })}
                    className="w-full h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                  >
                    <option value={0}>Chọn tác giả</option>
                    {tacGiaList.map((tg) => (
                      <option key={tg.tac_gia_id} value={tg.tac_gia_id}>
                        {tg.ten_tac_gia}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-900 dark:text-slate-100">Nhà xuất bản *</label>
                  <select
                    value={formData.nha_xuat_ban_id}
                    onChange={(e) => setFormData({ ...formData, nha_xuat_ban_id: Number(e.target.value) })}
                    className="w-full h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                  >
                    <option value={0}>Chọn nhà xuất bản</option>
                    {nhaXuatBanList.map((nxb) => (
                      <option key={nxb.nha_xuat_ban_id} value={nxb.nha_xuat_ban_id}>
                        {nxb.ten_nha_xuat_ban}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-900 dark:text-slate-100">Thương hiệu *</label>
                  <select
                    value={formData.thuong_hieu_id}
                    onChange={(e) => setFormData({ ...formData, thuong_hieu_id: Number(e.target.value) })}
                    className="w-full h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                  >
                    <option value={0}>Chọn thương hiệu</option>
                    {thuongHieuList.map((th) => (
                      <option key={th.thuong_hieu_id} value={th.thuong_hieu_id}>
                        {th.ten_thuong_hieu}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-900 dark:text-slate-100">Nhà cung cấp *</label>
                  <select
                    value={formData.nha_cung_cap_id}
                    onChange={(e) => setFormData({ ...formData, nha_cung_cap_id: Number(e.target.value) })}
                    className="w-full h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                  >
                    <option value={0}>Chọn nhà cung cấp</option>
                    {nhaCungCapList.map((ncc) => (
                      <option key={ncc.nha_cung_cap_id} value={ncc.nha_cung_cap_id}>
                        {ncc.ten_nha_cung_cap}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-900 dark:text-slate-100">Ngôn ngữ *</label>
                  <select
                    value={formData.ngon_ngu_id}
                    onChange={(e) => setFormData({ ...formData, ngon_ngu_id: Number(e.target.value) })}
                    className="w-full h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                  >
                    <option value={0}>Chọn ngôn ngữ</option>
                    {ngonNguList.map((nn) => (
                      <option key={nn.ngon_ngu_id} value={nn.ngon_ngu_id}>
                        {nn.ten_ngon_ngu}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-900 dark:text-slate-100">Độ tuổi *</label>
                  <select
                    value={formData.do_tuoi_id}
                    onChange={(e) => setFormData({ ...formData, do_tuoi_id: Number(e.target.value) })}
                    className="w-full h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                  >
                    <option value={0}>Chọn độ tuổi</option>
                    {doTuoiList.map((dt) => (
                      <option key={dt.do_tuoi_id} value={dt.do_tuoi_id}>
                        {dt.ten_do_tuoi}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-900 dark:text-slate-100">Người biên dịch *</label>
                  <select
                    value={formData.nguoi_bien_dich_id}
                    onChange={(e) => {
                      setFormData({ ...formData, nguoi_bien_dich_id: Number(e.target.value) });
                    }}
                    className="w-full h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                  >
                    <option value={0}>Chọn người biên dịch</option>
                    {nguoiBienDichList.map((nbd) => (
                      <option key={nbd.nguoi_bien_dich_id} value={nbd.nguoi_bien_dich_id}>
                        {nbd.ten_nguoi_bien_dich}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 4: Hình ảnh và trạng thái */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-700">
                <ImageIcon className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Hình ảnh và trạng thái</h3>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-900 dark:text-slate-100">Ảnh bìa</label>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="flex-1"
                  />
                  {imagePreview && (
                    <div className="relative">
                      <img src={imagePreview} alt="Preview" className="w-24 h-32 object-cover rounded border border-slate-200 dark:border-slate-700" />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setImageFile(null);
                        }}
                        className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 hover:bg-destructive/90 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <input
                  type="checkbox"
                  id="trang_thai"
                  checked={formData.trang_thai}
                  onChange={(e) => setFormData({ ...formData, trang_thai: e.target.checked })}
                  className="rounded w-4 h-4"
                />
                <label htmlFor="trang_thai" className="text-sm font-medium text-slate-900 dark:text-slate-100 cursor-pointer">
                  Trạng thái hoạt động
                </label>
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Chi tiết sách</DialogTitle>
          </DialogHeader>
          {selectedSach && (
            <div className="space-y-6">
              {/* Thông tin cơ bản */}
              <div className="border-b border-slate-200 dark:border-slate-700 pb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Thông tin cơ bản
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">ID</label>
                    <p className="text-base text-slate-900 dark:text-slate-100">{selectedSach.sach_id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Mã sách</label>
                    <p className="text-base font-mono text-slate-900 dark:text-slate-100">{selectedSach.ma_sach}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tên sách</label>
                  <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{selectedSach.ten_sach}</p>
                </div>
                {selectedSach.mo_ta && (
                  <div className="mt-4">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Mô tả</label>
                    <p className="text-base text-slate-900 dark:text-slate-100 whitespace-pre-wrap">{selectedSach.mo_ta}</p>
                  </div>
                )}
              </div>

              {/* Ảnh bìa */}
              {selectedSach.anh_bia_url && (
                <div className="border-b border-slate-200 dark:border-slate-700 pb-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-primary" />
                    Hình ảnh
                  </h3>
                  <div className="flex gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">Ảnh bìa</label>
                      <img
                        src={`${API_BASE_URL}${selectedSach.anh_bia_url}`}
                        alt={selectedSach.ten_sach}
                        className="w-48 h-64 object-cover rounded-lg border border-slate-200 dark:border-slate-700 shadow-md"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Giá cả và số lượng */}
              <div className="border-b border-slate-200 dark:border-slate-700 pb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Giá cả và số lượng
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Giá bìa</label>
                    <p className="text-base font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(Number(selectedSach.gia_bia))}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Giá bán</label>
                    <p className="text-base font-semibold text-primary">{formatCurrency(Number(selectedSach.gia_ban))}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">SL đã bán</label>
                    <p className="text-base text-slate-900 dark:text-slate-100">{selectedSach.sl_da_ban || 0}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">SL còn lại</label>
                    <p className="text-base text-slate-900 dark:text-slate-100">{selectedSach.so_luong || 'N/A'}</p>
                  </div>
                </div>
                {selectedSach.gia_bia > selectedSach.gia_ban && (
                  <div className="mt-3">
                    <Badge variant="destructive" className="text-sm">
                      Giảm {Math.round((1 - Number(selectedSach.gia_ban) / Number(selectedSach.gia_bia)) * 100)}%
                    </Badge>
                  </div>
                )}
              </div>

              {/* Thông tin chi tiết sách */}
              <div className="border-b border-slate-200 dark:border-slate-700 pb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Thông tin chi tiết
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Trọng lượng</label>
                    <p className="text-base text-slate-900 dark:text-slate-100">{selectedSach.trong_luong}g</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Số trang</label>
                    <p className="text-base text-slate-900 dark:text-slate-100">{selectedSach.so_trang || 'N/A'}</p>
                  </div>
                  {selectedSach.isbn && (
                    <div>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">ISBN</label>
                      <p className="text-base font-mono text-slate-900 dark:text-slate-100">{selectedSach.isbn}</p>
                    </div>
                  )}
                  {selectedSach.ngay_xuat_ban && (
                    <div>
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Ngày xuất bản</label>
                      <p className="text-base text-slate-900 dark:text-slate-100">{formatDate(selectedSach.ngay_xuat_ban)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Thông tin liên quan từ các bảng khác */}
              <div className="border-b border-slate-200 dark:border-slate-700 pb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Thông tin liên quan
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Tác giả</label>
                    <p className="text-base text-slate-900 dark:text-slate-100">{selectedSach.tacgia?.ten_tac_gia || 'N/A'}</p>
                    {selectedSach.tacgia?.tieu_su && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{selectedSach.tacgia.tieu_su}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nhà xuất bản</label>
                    <p className="text-base text-slate-900 dark:text-slate-100">{selectedSach.nhaxuatban?.ten_nha_xuat_ban || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Thương hiệu</label>
                    <p className="text-base text-slate-900 dark:text-slate-100">{selectedSach.thuonghieu?.ten_thuong_hieu || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nhà cung cấp</label>
                    <p className="text-base text-slate-900 dark:text-slate-100">{selectedSach.nhacungcap?.ten_nha_cung_cap || 'N/A'}</p>
                    {selectedSach.nhacungcap && (
                      <>
                        {selectedSach.nhacungcap.dia_chi && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{selectedSach.nhacungcap.dia_chi}</p>
                        )}
                        {selectedSach.nhacungcap.sdt && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">ĐT: {selectedSach.nhacungcap.sdt}</p>
                        )}
                      </>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Ngôn ngữ</label>
                    <p className="text-base text-slate-900 dark:text-slate-100">
                      {selectedSach.ngonngu?.ten_ngon_ngu || 'N/A'}
                    </p>
                    {selectedSach.ngonngu?.ma_ngon_ngu && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Mã: {selectedSach.ngonngu.ma_ngon_ngu}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Độ tuổi</label>
                    <p className="text-base text-slate-900 dark:text-slate-100">
                      {selectedSach.dotuoi?.ten_do_tuoi || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Người biên dịch</label>
                    <p className="text-base text-slate-900 dark:text-slate-100">
                      {selectedSach.nguoibiendich?.ten_nguoi_bien_dich || 'N/A'}
                    </p>
                    {selectedSach.nguoibiendich?.email && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Email: {selectedSach.nguoibiendich.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Danh mục */}
              {selectedSach.sach_danhmuc && selectedSach.sach_danhmuc.length > 0 && (
                <div className="border-b border-slate-200 dark:border-slate-700 pb-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Danh mục</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedSach.sach_danhmuc.map((sd: { danhmuc: { danh_muc_id: number; ten_danh_muc: string } }, index: number) => (
                      <Badge key={index} variant="secondary" className="text-sm">
                        {sd.danhmuc.ten_danh_muc}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Trạng thái và ngày tháng */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Trạng thái</label>
                  <div className="mt-1">
                    <Badge variant={selectedSach.trang_thai ? 'default' : 'secondary'} className="flex items-center gap-1 w-fit">
                      {selectedSach.trang_thai ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Hoạt động</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3" />
                          <span>Tạm khóa</span>
                        </>
                      )}
                    </Badge>
                  </div>
                </div>
                {selectedSach.ngay_tao && (
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Ngày tạo</label>
                    <p className="text-base text-slate-900 dark:text-slate-100">{formatDate(selectedSach.ngay_tao)}</p>
                  </div>
                )}
                {selectedSach.ngay_cap_nhat && (
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Ngày cập nhật</label>
                    <p className="text-base text-slate-900 dark:text-slate-100">{formatDate(selectedSach.ngay_cap_nhat)}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Đóng
            </Button>
            {selectedSach && (
              <Button variant="default" onClick={() => {
                setIsViewDialogOpen(false);
                handleOpenEditDialog(selectedSach);
              }}>
                <Pencil className="h-4 w-4 mr-2" />
                Chỉnh sửa
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quản lý ảnh Dialog */}
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Images className="h-6 w-6 text-primary" />
              Quản lý ảnh sách
            </DialogTitle>
            <DialogDescription>
              {selectedSach && (
                <span className="text-base font-semibold text-slate-700 dark:text-slate-300">
                  {selectedSach.ten_sach}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {selectedSach && (
            <div className="space-y-6">
              {/* Upload Section */}
              <div className="border-b border-slate-200 dark:border-slate-700 pb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                  Thêm ảnh mới
                </h3>
                <UploadMultipleImages
                  sach_id={selectedSach.sach_id}
                  maxImages={10}
                  onUploadSuccess={handleUploadSuccess}
                />
              </div>

              {/* Existing Images */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                  Ảnh hiện có ({bookImages.length})
                </h3>
                {loadingImages ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : bookImages.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 dark:text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                    <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Chưa có ảnh nào. Hãy upload ảnh ở trên.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {bookImages.map((image) => (
                      <div key={image.anh_sach_id} className="relative group">
                        <div className="aspect-[3/4] rounded-lg overflow-hidden border-2 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                          <img
                            src={`${API_BASE_URL}${image.url}`}
                            alt={`Ảnh ${(image.thu_tu ?? 0) + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x300/6366f1/ffffff?text=No+Image';
                            }}
                          />
                        </div>
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => handleDeleteImage(image.anh_sach_id)}
                            className="h-8 w-8 rounded-full shadow-lg"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2 text-center">
                          Ảnh {(image.thu_tu ?? 0) + 1}
                          {image.loai && (
                            <span className="block text-[10px] opacity-75">{image.loai}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImageDialogOpen(false)}>
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
              Xác nhận xóa sách
            </DialogTitle>
            <DialogDescription className="pt-4 space-y-3">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <p className="text-base font-semibold text-destructive mb-2">
                  Bạn có chắc chắn muốn xóa sách này không?
                </p>
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  <span className="font-medium">Tên sách:</span> {selectedSach?.ten_sach}
                </p>
                {selectedSach?.ma_sach && (
                  <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                    <span className="font-medium">Mã sách:</span> {selectedSach.ma_sach}
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
                  <li>Nếu sách đang có trong đơn hàng, việc xóa có thể gặp lỗi và không thể thực hiện</li>
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
    </div>
  );
};

export default AdminQuanLySach;

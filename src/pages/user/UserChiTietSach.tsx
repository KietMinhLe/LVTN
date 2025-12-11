import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getSachById, getAllSach, type Sach } from '../../services/sachService';
import AddToCartButton from '../../components/AddToCartButton';
import DanhGiaSection from '../../components/DanhGiaSection';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent } from '../../components/ui/card';
import {
  BookOpen,
  User,
  Building2,
  Globe,
  Calendar,
  FileText,
  ArrowLeft,
  Star,
  CheckCircle,
  Truck,
  Shield,
  Award,
  Tag,
  Hash,
  Weight,
  Eye,
  Heart,
  Share2,
  Minus,
  Plus,
  Package,
  TrendingUp,
  ChevronRight,
  Home,
  ChevronLeft,
  Maximize2,
  Images as ImagesIcon,
  X
} from 'lucide-react';
import { toast } from 'sonner';

const UserChiTietSach = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<Sach | null>(null);
  const [relatedBooks, setRelatedBooks] = useState<Sach[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const loadBookDetail = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const bookData = await getSachById(parseInt(id));
      setBook(bookData);
      
      // Load related books (same author or same category)
      await loadRelatedBooks(bookData);
    } catch (err: unknown) {
      console.error('Error loading book detail:', err);
      setError('Không thể tải thông tin sách. Vui lòng thử lại sau.');
      toast.error('Lỗi khi tải thông tin sách');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadBookDetail();
    }
  }, [id, loadBookDetail]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowLeft') {
        handleLightboxPrevious();
      } else if (e.key === 'ArrowRight') {
        handleLightboxNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLightboxOpen]);

  const loadRelatedBooks = async (currentBook: Sach) => {
    try {
      const allBooks = await getAllSach();
      const related = allBooks
        .filter(b => 
          b.sach_id !== currentBook.sach_id && (
            b.tac_gia_id === currentBook.tac_gia_id ||
            b.sach_danhmuc?.some(sd => 
              currentBook.sach_danhmuc?.some(csd => 
                csd.danhmuc.danh_muc_id === sd.danhmuc.danh_muc_id
              )
            )
          )
        )
        .slice(0, 4);
      setRelatedBooks(related);
    } catch (err) {
      console.error('Error loading related books:', err);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const getImageUrl = (url?: string | null) => {
    if (!url) return 'https://via.placeholder.com/400x600/3b82f6/ffffff?text=No+Image';
    if (url.startsWith('http')) return url;
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    return `${apiBaseUrl}${url}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Chưa có thông tin';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const handleQuantityChange = (delta: number) => {
    const maxQuantity = book?.so_luong || 0;
    setQuantity(prev => {
      const newQuantity = prev + delta;
      if (newQuantity < 1) return 1;
      if (newQuantity > maxQuantity) return maxQuantity;
      return newQuantity;
    });
  };

  const handlePreviousImage = () => {
    if (bookImages.length > 0) {
      setSelectedImageIndex(prev => (prev - 1 + bookImages.length) % bookImages.length);
    }
  };

  const handleNextImage = () => {
    if (bookImages.length > 0) {
      setSelectedImageIndex(prev => (prev + 1) % bookImages.length);
    }
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };

  const handleLightboxPrevious = () => {
    if (bookImages.length > 0) {
      setLightboxIndex(prev => (prev - 1 + bookImages.length) % bookImages.length);
    }
  };

  const handleLightboxNext = () => {
    if (bookImages.length > 0) {
      setLightboxIndex(prev => (prev + 1) % bookImages.length);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-500 mx-auto mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-500 animate-pulse" />
            </div>
          </div>
          <p className="text-gray-600 text-lg font-medium">Đang tải thông tin sách...</p>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center max-w-md px-4">
          <div className="mb-6">
            <div className="w-24 h-24 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-12 h-12 text-red-500" />
            </div>
            <p className="text-red-500 text-lg font-semibold mb-2">{error || 'Không tìm thấy sách'}</p>
            <p className="text-gray-500">Vui lòng kiểm tra lại đường dẫn hoặc thử lại sau.</p>
          </div>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => navigate(-1)} variant="outline" className="px-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
            <Button onClick={() => navigate('/books')} className="bg-blue-500 hover:bg-blue-600 px-6">
              Xem tất cả sách
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const discount = book.gia_bia > book.gia_ban
    ? Math.round(((book.gia_bia - book.gia_ban) / book.gia_bia) * 100)
    : 0;
  const isOutOfStock = (book.so_luong || 0) === 0;
  const isLowStock = (book.so_luong || 0) < 5 && (book.so_luong || 0) > 0;
  const categories = book.sach_danhmuc?.map(sd => sd.danhmuc.ten_danh_muc) || [];
  
  // Lấy danh sách ảnh: ưu tiên anhsach, nếu không có thì dùng anh_bia_url
  const bookImages = book.anhsach && book.anhsach.length > 0 
    ? book.anhsach.map(img => img.url)
    : book.anh_bia_url 
      ? [book.anh_bia_url]
      : [];
  
  // Ảnh hiện tại được chọn
  const currentImage = bookImages[selectedImageIndex] || book.anh_bia_url;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-6 lg:py-10">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center flex-wrap gap-2 text-sm">
            <li>
              <Link
                to="/"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 font-medium"
              >
                <Home className="w-4 h-4" />
                <span>Trang chủ</span>
              </Link>
            </li>
            <li className="flex items-center">
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </li>
            <li>
              <Link
                to="/books"
                className="px-3 py-1.5 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 font-medium"
              >
                Sách
              </Link>
            </li>
            <li className="flex items-center">
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </li>
            <li className="flex items-center">
              <span className="px-3 py-1.5 rounded-lg text-gray-900 font-semibold bg-gray-100 line-clamp-1 max-w-xs lg:max-w-md xl:max-w-lg">
                {book.ten_sach}
              </span>
            </li>
          </ol>
        </nav>

        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
          {/* Left: Image Section */}
          <div className="flex flex-col items-center lg:sticky lg:top-6 lg:self-start">
            <div className="relative w-full max-w-lg group">
              <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-gradient-to-br from-gray-50 to-white border-2 border-gray-100 transform transition-all duration-500 hover:shadow-3xl hover:scale-[1.02]">
                <div className="aspect-[3/4] relative bg-white flex items-center justify-center">
                  <img
                    src={getImageUrl(currentImage)}
                    alt={book.ten_sach}
                    className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105 cursor-pointer"
                    style={{ imageRendering: 'auto' }}
                    loading="eager"
                    fetchPriority="high"
                    onClick={() => openLightbox(selectedImageIndex)}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://via.placeholder.com/400x600/3b82f6/ffffff?text=No+Image';
                    }}
                  />
                  
                  {/* Navigation Buttons */}
                  {bookImages.length > 1 && (
                    <>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePreviousImage();
                        }}
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNextImage();
                        }}
                      >
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                    </>
                  )}
                  
                  {/* Image Counter */}
                  {bookImages.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                      {selectedImageIndex + 1} / {bookImages.length}
                    </div>
                  )}
                </div>
                {discount > 0 && (
                  <div className="absolute top-6 left-6 z-10">
                    <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white text-lg px-4 py-2 shadow-xl animate-pulse">
                      -{discount}%
                    </Badge>
                  </div>
                )}
                {isOutOfStock && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                    <Badge variant="destructive" className="text-xl px-6 py-3 shadow-2xl">
                      Hết hàng
                    </Badge>
                  </div>
                )}
                {/* Action Buttons Overlay */}
                <div className="absolute top-6 right-6 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-10 w-10 rounded-full bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm"
                    onClick={() => toast.info('Đã thêm vào yêu thích')}
                  >
                    <Heart className="w-5 h-5 text-red-500" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-10 w-10 rounded-full bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success('Đã sao chép link!');
                    }}
                  >
                    <Share2 className="w-5 h-5 text-blue-500" />
                  </Button>
                  {bookImages.length > 1 && (
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-10 w-10 rounded-full bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm"
                      onClick={() => openLightbox(selectedImageIndex)}
                      title="Xem tất cả ảnh"
                    >
                      <Maximize2 className="w-5 h-5 text-blue-500" />
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Thumbnail Gallery */}
              {bookImages.length > 1 && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ImagesIcon className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Tất cả ảnh ({bookImages.length})
                    </span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {bookImages.map((imgUrl, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                          selectedImageIndex === index
                            ? 'border-blue-500 shadow-lg scale-105 ring-2 ring-blue-200'
                            : 'border-gray-200 hover:border-gray-300 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={getImageUrl(imgUrl)}
                          alt={`${book.ten_sach} - Ảnh ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://via.placeholder.com/80x80/3b82f6/ffffff?text=No+Image';
                          }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Book Info */}
          <div className="space-y-6 lg:space-y-8">
            {/* Title Section */}
            <div className="space-y-4">
              <div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                  {book.ten_sach}
                </h1>
                {book.tacgia && (
                  <div className="flex items-center gap-3 text-lg text-gray-600">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <User className="w-5 h-5 text-blue-500" />
                    </div>
                    <span className="font-medium">Tác giả:</span>
                    <Link
                      to={`/books?author=${encodeURIComponent(book.tacgia.ten_tac_gia)}`}
                      className="text-blue-600 hover:text-blue-700 hover:underline font-semibold transition-colors"
                    >
                      {book.tacgia.ten_tac_gia}
                    </Link>
                  </div>
                )}
              </div>

              {/* Categories */}
              {categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-blue-200 hover:border-blue-300 transition-colors px-3 py-1"
                    >
                      <Tag className="w-3 h-3 mr-1.5" />
                      {cat}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Price Section */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border-2 border-blue-100">
              <div className="flex items-baseline gap-4 mb-2">
                <span className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {formatPrice(book.gia_ban)}
                </span>
                {book.gia_bia > book.gia_ban && (
                  <span className="text-xl lg:text-2xl text-gray-400 line-through">
                    {formatPrice(book.gia_bia)}
                  </span>
                )}
              </div>
              {discount > 0 && (
                <div className="flex items-center gap-2 mt-3">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <p className="text-base text-green-700 font-semibold">
                    Tiết kiệm {formatPrice(book.gia_bia - book.gia_ban)} ({discount}%)
                  </p>
                </div>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-4 flex-wrap">
              {isOutOfStock ? (
                <Badge variant="destructive" className="text-base px-4 py-2.5 rounded-full shadow-md">
                  <Package className="w-4 h-4 mr-2" />
                  Hết hàng
                </Badge>
              ) : isLowStock ? (
                <Badge className="text-base px-4 py-2.5 rounded-full border-2 border-orange-400 text-orange-700 bg-orange-50 shadow-md">
                  <Package className="w-4 h-4 mr-2" />
                  Sắp hết hàng (Còn {book.so_luong} cuốn)
                </Badge>
              ) : (
                <Badge className="text-base px-4 py-2.5 rounded-full border-2 border-green-500 text-green-700 bg-green-50 shadow-md font-semibold">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Còn hàng ({book.so_luong} cuốn)
                </Badge>
              )}
              {book.sl_da_ban && book.sl_da_ban > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 rounded-full border border-yellow-200">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-semibold text-gray-700">Đã bán {book.sl_da_ban} cuốn</span>
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            {!isOutOfStock && (
              <div className="flex items-center gap-4 p-4 bg-white rounded-xl border-2 border-gray-200 shadow-sm">
                <span className="font-semibold text-gray-700 min-w-[90px] text-base">Số lượng:</span>
                <div className="flex items-center gap-0 border-2 border-gray-300 rounded-xl overflow-hidden bg-white shadow-inner">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="h-12 w-12 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-xl rounded-r-none border-r border-gray-300"
                  >
                    <Minus className="w-5 h-5" />
                  </Button>
                  <span className="w-16 text-center font-bold text-xl text-gray-900 bg-gray-50 py-2">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= (book.so_luong || 0)}
                    className="h-12 w-12 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-r-xl rounded-l-none border-l border-gray-300"
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            )}

            {/* Add to Cart Button */}
            <div className="space-y-3">
              <AddToCartButton
                book={book}
                quantity={quantity}
                size="lg"
                showIcon={true}
                skipModal={true}
                useModal={false}
                className="w-full bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 hover:from-blue-600 hover:via-blue-700 hover:to-purple-700 text-white text-lg font-semibold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Thêm vào giỏ hàng
              </AddToCartButton>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t-2 border-gray-200">
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-md transition-shadow">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Truck className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Giao hàng nhanh</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-md transition-shadow">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Đổi trả dễ dàng</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-md transition-shadow">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Award className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Sách chính hãng</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-md transition-shadow">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-yellow-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Chất lượng tốt</span>
              </div>
            </div>
          </div>
        </div>

        {/* Book Details Section */}
        <div className="mb-16">
          <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
              <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                <BookOpen className="w-8 h-8" />
                Thông tin chi tiết
              </h2>
            </div>
            
            <div className="p-6 lg:p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Basic Info */}
                <div className="space-y-5">
                  <h3 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-3 pb-3 border-b-2 border-blue-100">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    Thông tin cơ bản
                  </h3>
                  <div className="space-y-4">
                    {book.ma_sach && (
                      <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="p-2 bg-blue-100 rounded-lg mt-0.5">
                          <Hash className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <span className="text-sm text-gray-500 block mb-1">Mã sách</span>
                          <p className="font-semibold text-gray-900">{book.ma_sach}</p>
                        </div>
                      </div>
                    )}
                    {book.isbn && (
                      <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="p-2 bg-purple-100 rounded-lg mt-0.5">
                          <FileText className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <span className="text-sm text-gray-500 block mb-1">ISBN</span>
                          <p className="font-semibold text-gray-900">{book.isbn}</p>
                        </div>
                      </div>
                    )}
                    {book.so_trang && (
                      <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="p-2 bg-green-100 rounded-lg mt-0.5">
                          <FileText className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <span className="text-sm text-gray-500 block mb-1">Số trang</span>
                          <p className="font-semibold text-gray-900">{book.so_trang} trang</p>
                        </div>
                      </div>
                    )}
                    {book.trong_luong && (
                      <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="p-2 bg-orange-100 rounded-lg mt-0.5">
                          <Weight className="w-5 h-5 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <span className="text-sm text-gray-500 block mb-1">Trọng lượng</span>
                          <p className="font-semibold text-gray-900">{book.trong_luong} g</p>
                        </div>
                      </div>
                    )}
                    {book.ngay_xuat_ban && (
                      <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="p-2 bg-pink-100 rounded-lg mt-0.5">
                          <Calendar className="w-5 h-5 text-pink-600" />
                        </div>
                        <div className="flex-1">
                          <span className="text-sm text-gray-500 block mb-1">Ngày xuất bản</span>
                          <p className="font-semibold text-gray-900">{formatDate(book.ngay_xuat_ban)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Publisher & Company Info */}
                <div className="space-y-5">
                  <h3 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-3 pb-3 border-b-2 border-purple-100">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Building2 className="w-5 h-5 text-purple-600" />
                    </div>
                    Nhà xuất bản & Thương hiệu
                  </h3>
                  <div className="space-y-4">
                    {book.nhaxuatban && (
                      <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="p-2 bg-blue-100 rounded-lg mt-0.5">
                          <Building2 className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <span className="text-sm text-gray-500 block mb-1">Nhà xuất bản</span>
                          <p className="font-semibold text-gray-900">{book.nhaxuatban.ten_nha_xuat_ban}</p>
                        </div>
                      </div>
                    )}
                    {book.thuonghieu && (
                      <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="p-2 bg-yellow-100 rounded-lg mt-0.5">
                          <Award className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div className="flex-1">
                          <span className="text-sm text-gray-500 block mb-1">Thương hiệu</span>
                          <p className="font-semibold text-gray-900">{book.thuonghieu.ten_thuong_hieu}</p>
                        </div>
                      </div>
                    )}
                    {book.ngonngu && (
                      <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="p-2 bg-cyan-100 rounded-lg mt-0.5">
                          <Globe className="w-5 h-5 text-cyan-600" />
                        </div>
                        <div className="flex-1">
                          <span className="text-sm text-gray-500 block mb-1">Ngôn ngữ</span>
                          <p className="font-semibold text-gray-900">{book.ngonngu.ten_ngon_ngu}</p>
                        </div>
                      </div>
                    )}
                    {book.dotuoi && (
                      <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="p-2 bg-indigo-100 rounded-lg mt-0.5">
                          <User className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div className="flex-1">
                          <span className="text-sm text-gray-500 block mb-1">Độ tuổi</span>
                          <p className="font-semibold text-gray-900">{book.dotuoi.ten_do_tuoi}</p>
                        </div>
                      </div>
                    )}
                    {book.nguoibiendich && (
                      <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="p-2 bg-teal-100 rounded-lg mt-0.5">
                          <User className="w-5 h-5 text-teal-600" />
                        </div>
                        <div className="flex-1">
                          <span className="text-sm text-gray-500 block mb-1">Người biên dịch</span>
                          <p className="font-semibold text-gray-900">{book.nguoibiendich.ten_nguoi_bien_dich}</p>
                        </div>
                      </div>
                    )}
                    {book.nguoi_dich && (
                      <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="p-2 bg-rose-100 rounded-lg mt-0.5">
                          <User className="w-5 h-5 text-rose-600" />
                        </div>
                        <div className="flex-1">
                          <span className="text-sm text-gray-500 block mb-1">Người dịch</span>
                          <p className="font-semibold text-gray-900">{book.nguoi_dich}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              {book.mo_ta && (
                <div className="mt-8 pt-8 border-t-2 border-gray-200">
                  <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    Mô tả sách
                  </h3>
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 border-2 border-gray-100">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line text-base">
                      {book.mo_ta}
                    </p>
                  </div>
                </div>
              )}

              {/* All Images Gallery */}
              {bookImages.length > 0 && (
                <div className="mt-8 pt-8 border-t-2 border-gray-200">
                  <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <ImagesIcon className="w-5 h-5 text-purple-600" />
                    </div>
                    Tất cả ảnh sách ({bookImages.length})
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {bookImages.map((imgUrl, index) => (
                      <div
                        key={index}
                        className="relative group cursor-pointer"
                        onClick={() => openLightbox(index)}
                      >
                        <div className="aspect-[3/4] rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-all duration-300 shadow-md hover:shadow-xl transform hover:scale-105">
                          <img
                            src={getImageUrl(imgUrl)}
                            alt={`${book.ten_sach} - Ảnh ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://via.placeholder.com/200x300/3b82f6/ffffff?text=No+Image';
                            }}
                          />
                        </div>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Maximize2 className="w-8 h-8 text-white drop-shadow-lg" />
                          </div>
                        </div>
                        <div className="absolute bottom-2 left-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded text-center backdrop-blur-sm">
                          Ảnh {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lightbox Modal */}
        {isLightboxOpen && bookImages.length > 0 && (
          <div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <div className="relative max-w-7xl max-h-full w-full h-full flex items-center justify-center">
              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-10 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white"
                onClick={closeLightbox}
              >
                <X className="w-6 h-6" />
              </Button>

              {/* Previous Button */}
              {bookImages.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLightboxPrevious();
                  }}
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
              )}

              {/* Next Button */}
              {bookImages.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 text-white z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLightboxNext();
                  }}
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              )}

              {/* Image */}
              <div
                className="relative max-w-5xl max-h-[90vh] w-full h-full flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={getImageUrl(bookImages[lightboxIndex])}
                  alt={`${book.ten_sach} - Ảnh ${lightboxIndex + 1}`}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://via.placeholder.com/800x1200/3b82f6/ffffff?text=No+Image';
                  }}
                />
              </div>

              {/* Image Counter */}
              {bookImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm">
                  {lightboxIndex + 1} / {bookImages.length}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Đánh giá sản phẩm */}
        {book && <DanhGiaSection sachId={book.sach_id} />}

        {/* Related Books */}
        {relatedBooks.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Sách liên quan
              </h2>
              <div className="flex-1 h-1 bg-gradient-to-r from-purple-600 to-transparent rounded-full"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedBooks.map(relatedBook => {
                const relatedDiscount = relatedBook.gia_bia > relatedBook.gia_ban
                  ? Math.round(((relatedBook.gia_bia - relatedBook.gia_ban) / relatedBook.gia_bia) * 100)
                  : 0;
                const relatedIsOutOfStock = (relatedBook.so_luong || 0) === 0;

                return (
                  <Card
                    key={relatedBook.sach_id}
                    className="h-full flex flex-col hover:shadow-2xl transition-all duration-500 border-2 border-gray-100 bg-white cursor-pointer group overflow-hidden transform hover:-translate-y-2"
                    onClick={() => navigate(`/books/${relatedBook.sach_id}`)}
                  >
                    <div className="relative overflow-hidden bg-gray-100">
                      <div className="aspect-[3/4] relative">
                        <img
                          src={getImageUrl(relatedBook.anh_bia_url)}
                          alt={relatedBook.ten_sach}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-125"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://via.placeholder.com/300x400/3b82f6/ffffff?text=No+Image';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      {relatedDiscount > 0 && (
                        <Badge className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg z-10">
                          -{relatedDiscount}%
                        </Badge>
                      )}
                      {relatedIsOutOfStock && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10">
                          <Badge variant="destructive" className="text-base px-4 py-2">
                            Hết hàng
                          </Badge>
                        </div>
                      )}
                    </div>
                    <CardContent className="flex flex-col gap-3 p-5 grow bg-white">
                      <h3 className="font-bold text-gray-900 line-clamp-2 min-h-12 group-hover:text-blue-600 transition-colors">
                        {relatedBook.ten_sach}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-1 flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {relatedBook.tacgia?.ten_tac_gia || 'Chưa có thông tin'}
                      </p>
                      <div className="mt-auto space-y-1">
                        <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          {formatPrice(relatedBook.gia_ban)}
                        </div>
                        {relatedBook.gia_bia > relatedBook.gia_ban && (
                          <div className="text-sm text-gray-400 line-through">
                            {formatPrice(relatedBook.gia_bia)}
                          </div>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-2 border-blue-200 text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:border-blue-300 transition-all duration-300 font-semibold"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/books/${relatedBook.sach_id}`);
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Xem chi tiết
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserChiTietSach;


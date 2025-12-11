import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllSach, getAllTacGia, type Sach, type TacGia } from '../../services/sachService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { useAddToCart } from '../../hooks/useCart';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { 
  Eye, 
  ShoppingCart, 
  Truck, 
  Shield, 
  Star, 
  Users, 
  BookOpen, 
  Award,
  Percent,
  Mail,
  Quote,
  TrendingUp,
  Heart,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';

const UserTrangChu = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState<Sach[]>([]);
  const [authors, setAuthors] = useState<TacGia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const { addToCart } = useAddToCart();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [booksData, authorsData] = await Promise.all([
        getAllSach(),
        getAllTacGia()
      ]);
      setBooks(booksData);
      setAuthors(authorsData);
    } catch (err: unknown) {
      console.error('Error loading data:', err);
      setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      toast.error('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  // Helper function để lấy URL ảnh sách (ưu tiên anhsach, nếu không có thì dùng anh_bia_url)
  const getBookImageUrl = (book: Sach) => {
    // Ưu tiên ảnh từ anhsach array (ảnh đầu tiên)
    if (book.anhsach && book.anhsach.length > 0 && book.anhsach[0]?.url) {
      const url = book.anhsach[0].url;
      if (url.startsWith('http')) return url;
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      return `${apiBaseUrl}${url}`;
    }
    // Nếu không có anhsach, dùng anh_bia_url
    if (book.anh_bia_url) {
      if (book.anh_bia_url.startsWith('http')) return book.anh_bia_url;
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      return `${apiBaseUrl}${book.anh_bia_url}`;
    }
    // Mặc định trả về placeholder
    return 'https://via.placeholder.com/300x400/3b82f6/ffffff?text=No+Image';
  };

  const handleViewDetails = (bookId: number) => navigate(`/books/${bookId}`);
  const handleAddToCart = (book: Sach) => {
    addToCart(book, 1);
  };

  const handleNewsletterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (email.trim()) {
      toast.success('Cảm ơn bạn đã đăng ký nhận tin!');
      setEmail('');
    }
  };

  const BookCard = ({ book }: { book: Sach }) => {
    const isLowStock = (book.so_luong || 0) < 5;
    const discount = book.gia_bia > book.gia_ban 
      ? Math.round(((book.gia_bia - book.gia_ban) / book.gia_bia) * 100) 
      : 0;

    return (
      <div className="transform transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 active:scale-[0.98] h-full">
        <Card className="h-full flex flex-col border-0 bg-gradient-to-br from-white to-gray-50/50 shadow-md hover:shadow-xl hover:shadow-blue-200/50 transition-all duration-300 rounded-xl overflow-hidden group backdrop-blur-sm">
          {/* Image Container with Gradient Overlay */}
          <div className="relative overflow-hidden aspect-[3/4] bg-gradient-to-br from-gray-100 via-gray-50 to-white flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent z-0"></div>
            <img
              src={getBookImageUrl(book)}
              alt={book.ten_sach}
              className="w-full h-full object-contain transition-all duration-500 group-hover:scale-110 group-hover:brightness-105 p-2 relative z-10"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://via.placeholder.com/300x400/3b82f6/ffffff?text=No+Image';
              }}
            />
            {/* Discount Badge with Modern Design */}
            {discount > 0 && (
              <div className="absolute top-2 left-2 z-20">
                <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg text-[10px] px-2 py-0.5 font-bold rounded-full border-2 border-white/50 backdrop-blur-sm">
                  -{discount}%
                </Badge>
              </div>
            )}
            {/* Stock Badge */}
            {isLowStock && (
              <div className="absolute top-2 right-2 z-20">
                <Badge variant="destructive" className="shadow-lg text-[10px] px-2 py-0.5 rounded-full border-2 border-white/50 backdrop-blur-sm">
                  Sắp hết
                </Badge>
              </div>
            )}
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-blue-500/0 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
          </div>
          
          {/* Content with Modern Styling */}
          <CardContent className="flex flex-col gap-2 px-3 pt-3 pb-3 flex-shrink-0 flex-grow bg-white/80 backdrop-blur-sm">
            <div className="flex flex-col gap-1.5 flex-grow">
              <CardTitle className="text-xs line-clamp-2 font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight min-h-[2.5rem] bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text group-hover:from-blue-600 group-hover:to-blue-500">
                {book.ten_sach}
              </CardTitle>
              <CardDescription className="text-[10px] text-gray-600 flex items-center gap-1.5 line-clamp-1 font-medium">
                <span className="text-blue-500 text-xs">✍️</span>
                <span className="truncate">{book.tacgia?.ten_tac_gia || 'Chưa có'}</span>
              </CardDescription>
            </div>
            
            {/* Price Section with Modern Design */}
            <div className="flex flex-col gap-1 mt-auto pt-2 border-t border-gray-100">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-pink-500">
                  {formatPrice(book.gia_ban)}
                </span>
                {book.gia_bia > book.gia_ban && (
                  <span className="text-[10px] text-gray-400 line-through font-medium">
                    {formatPrice(book.gia_bia)}
                  </span>
                )}
              </div>
              
              {/* Modern Buttons */}
              <div className="flex gap-1.5 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-2 border-blue-200 text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:border-blue-400 hover:text-blue-700 text-[10px] h-7 px-2 rounded-lg transition-all duration-200 font-semibold shadow-sm hover:shadow-md"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewDetails(book.sach_id);
                  }}
                >
                  <Eye className="w-3 h-3 mr-1" />
                  Xem
                </Button>
                <Button
                  size="sm"
                  className="flex-1 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg text-[10px] h-7 px-2 rounded-lg transition-all duration-200 font-semibold border-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToCart(book);
                  }}
                  disabled={(book.so_luong || 0) === 0}
                >
                  <ShoppingCart className="w-3 h-3 mr-1" />
                  Thêm
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const bestSellingBooks = [...books].sort((a, b) => (b.sl_da_ban || 0) - (a.sl_da_ban || 0)).slice(0, 6);
  const newestBooks = [...books]
    .sort((a, b) => new Date(b.ngay_tao || '').getTime() - new Date(a.ngay_tao || '').getTime())
    .slice(0, 6);
  const discountedBooks = [...books]
    .filter(book => book.gia_bia > book.gia_ban)
    .sort((a, b) => {
      const discountA = ((a.gia_bia - a.gia_ban) / a.gia_bia) * 100;
      const discountB = ((b.gia_bia - b.gia_ban) / b.gia_bia) * 100;
      return discountB - discountA;
    })
    .slice(0, 6);
  const featuredAuthors = authors.slice(0, 6);

  // Mock testimonials
  const testimonials = [
    {
      name: 'Nguyễn Văn A',
      role: 'Sinh viên',
      content: 'Sách ở đây chất lượng tốt, giá cả hợp lý. Giao hàng nhanh chóng, đóng gói cẩn thận.',
      rating: 5
    },
    {
      name: 'Trần Thị B',
      role: 'Giáo viên',
      content: 'Tôi thường xuyên mua sách tại đây. Đa dạng thể loại, nhiều sách hay và mới.',
      rating: 5
    },
    {
      name: 'Lê Văn C',
      role: 'Nhà nghiên cứu',
      content: 'Dịch vụ tuyệt vời, nhân viên tư vấn nhiệt tình. Sách đúng như mô tả, chất lượng tốt.',
      rating: 5
    }
  ];

  // Mock news/blog
  const news = [
    {
      title: 'Top 10 cuốn sách hay nhất năm 2024',
      date: '15/01/2024',
      excerpt: 'Khám phá những cuốn sách được yêu thích nhất trong năm qua...'
    },
    {
      title: 'Cách chọn sách phù hợp với độ tuổi',
      date: '10/01/2024',
      excerpt: 'Hướng dẫn chi tiết về cách lựa chọn sách cho từng lứa tuổi...'
    },
    {
      title: 'Xu hướng đọc sách điện tử 2024',
      date: '05/01/2024',
      excerpt: 'Tìm hiểu về xu hướng đọc sách hiện đại và tương lai...'
    }
  ];

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={loadData} className="bg-blue-400 hover:bg-blue-500">Thử lại</Button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-10 md:py-12 bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-cyan-400 to-purple-400 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-cyan-300 to-pink-400 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/20 backdrop-blur-md mb-4 shadow-2xl border-2 border-white/30 animate-bounce">
            <BookOpen className="w-7 h-7" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3 drop-shadow-2xl leading-tight">
            Khám phá Thế Giới Sách 📖
          </h1>
          <p className="text-base md:text-lg opacity-95 mb-6 max-w-3xl mx-auto leading-relaxed font-medium">
            Hàng nghìn tựa sách hay, giá tốt, giao nhanh chỉ tại <span className="font-bold text-yellow-300">BookStore</span>.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              variant="secondary"
              asChild
              className="text-sm px-8 py-5 bg-white text-blue-600 font-bold hover:bg-blue-50 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 rounded-xl"
            >
              <Link to="/books">Khám phá ngay</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="text-sm px-8 py-5 bg-white/10 backdrop-blur-md border-2 border-white/50 text-white hover:bg-white/20 hover:border-white transition-all duration-300 rounded-xl"
            >
              <Link to="/categories">Xem danh mục</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 bg-gradient-to-br from-cyan-100 via-blue-100 to-indigo-100 border-y-2 border-cyan-300/60 shadow-xl">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 text-white mb-3 shadow-2xl group-hover:scale-110 group-hover:shadow-blue-500/50 transition-all duration-300 ring-4 ring-blue-200/50">
                <BookOpen className="w-8 h-8" />
              </div>
              <div className="text-3xl font-black bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent mb-1.5 drop-shadow-sm">{books.length}+</div>
              <div className="text-sm font-bold text-gray-800">Tựa sách</div>
            </div>
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-purple-500 text-white mb-3 shadow-2xl group-hover:scale-110 group-hover:shadow-purple-500/50 transition-all duration-300 ring-4 ring-purple-200/50">
                <Users className="w-8 h-8" />
              </div>
              <div className="text-3xl font-black bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent mb-1.5 drop-shadow-sm">{authors.length}+</div>
              <div className="text-sm font-bold text-gray-800">Tác giả</div>
            </div>
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-500 text-white mb-3 shadow-2xl group-hover:scale-110 group-hover:shadow-green-500/50 transition-all duration-300 ring-4 ring-green-200/50">
                <TrendingUp className="w-8 h-8" />
              </div>
              <div className="text-3xl font-black bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent mb-1.5 drop-shadow-sm">
                {books.reduce((sum, book) => sum + (book.sl_da_ban || 0), 0)}+
              </div>
              <div className="text-sm font-bold text-gray-800">Sách đã bán</div>
            </div>
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-pink-500 text-white mb-3 shadow-2xl group-hover:scale-110 group-hover:shadow-pink-500/50 transition-all duration-300 ring-4 ring-pink-200/50">
                <Heart className="w-8 h-8" />
              </div>
              <div className="text-3xl font-black bg-gradient-to-r from-pink-600 to-pink-500 bg-clip-text text-transparent mb-1.5 drop-shadow-sm">1000+</div>
              <div className="text-sm font-bold text-gray-800">Khách hàng</div>
            </div>
          </div>
        </div>
      </section>

      {/* Bestseller Section */}
      {bestSellingBooks.length > 0 && (
        <section className="py-8 bg-orange-100/70 border-t-2 border-orange-200/50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-5">
              <div className="inline-flex items-center gap-2.5 mb-1.5">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg">
                  <span className="text-sm">🔥</span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
                  Sách bán chạy nhất
                </h2>
              </div>
              <p className="text-xs text-gray-600 mb-2.5">Những cuốn sách được yêu thích nhất</p>
              <Button variant="outline" asChild className="border-2 border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 shadow-md rounded-lg px-3 py-1 text-xs">
                <Link to="/books">Xem tất cả <ArrowRight className="w-3 h-3 ml-1" /></Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
              {bestSellingBooks.map((book, index) => (
                <div key={book.sach_id} className="animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${index * 100}ms` }}>
                  <BookCard book={book} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Discounted Books Section */}
      {discountedBooks.length > 0 && (
        <section className="py-10 bg-pink-100/70 border-t-2 border-pink-200/50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 to-red-500 text-white shadow-xl flex items-center justify-center">
                  <Percent className="w-4 h-4" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                  Ưu đãi đặc biệt
                </h2>
              </div>
              <p className="text-sm text-gray-700 mb-3">Sách giảm giá hấp dẫn</p>
              <Button variant="outline" asChild className="border-2 border-pink-300 text-pink-600 hover:bg-pink-50 hover:border-pink-400 shadow-md rounded-lg px-4 py-1.5 text-sm">
                <Link to="/books">Xem tất cả <ArrowRight className="w-3.5 h-3.5 ml-1.5" /></Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
              {discountedBooks.map((book, index) => (
                <div key={book.sach_id} className="animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${index * 100}ms` }}>
                  <BookCard book={book} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newest Books Section */}
      {newestBooks.length > 0 && (
        <section className="py-10 bg-yellow-100/70 border-t-2 border-yellow-200/50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                  <span className="text-lg">🌟</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                  Sách mới phát hành
                </h2>
              </div>
              <p className="text-sm text-gray-600 mb-3">Những cuốn sách mới nhất từ nhà xuất bản</p>
              <Button variant="outline" asChild className="border-2 border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 shadow-md rounded-lg px-4 py-1.5 text-sm">
                <Link to="/books">Xem tất cả <ArrowRight className="w-3.5 h-3.5 ml-1.5" /></Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
              {newestBooks.map((book, index) => (
                <div key={book.sach_id} className="animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${index * 100}ms` }}>
                  <BookCard book={book} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Authors Section */}
      {featuredAuthors.length > 0 && (
        <section className="py-10 bg-purple-100/70 border-t-2 border-purple-200/50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1.5 leading-tight">
                ✍️ Tác giả nổi bật
              </h2>
              <p className="text-sm text-gray-600">Những tác giả được yêu thích nhất</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {featuredAuthors.map((author) => (
                <Card
                  key={author.tac_gia_id}
                  className="text-center hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-blue-200 hover:border-blue-400 rounded-xl overflow-hidden group"
                  onClick={() => navigate(`/books?author=${encodeURIComponent(author.ten_tac_gia)}`)}
                >
                  <CardContent className="pt-4 pb-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600 mx-auto mb-3 flex items-center justify-center text-white text-2xl font-bold shadow-xl group-hover:scale-110 transition-transform duration-300">
                      {author.ten_tac_gia.charAt(0)}
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1.5 line-clamp-2 text-sm group-hover:text-blue-600 transition-colors">
                      {author.ten_tac_gia}
                    </h3>
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                      {author.tieu_su || 'Tác giả nổi tiếng'}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-10 bg-cyan-100/70 border-t-2 border-cyan-200/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-xl flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                Tại sao chọn BookStore?
              </h2>
            </div>
            <p className="text-sm text-gray-600">Những lý do khiến bạn hài lòng</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-6 bg-white rounded-xl shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border-2 border-blue-100 hover:border-blue-300 group">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600 flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform">
                <Truck className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-lg mb-2 text-gray-900">Giao hàng siêu tốc</h4>
              <p className="text-sm text-gray-600 leading-relaxed">Giao trong 24h tại TP.HCM, 2-3 ngày toàn quốc</p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border-2 border-purple-100 hover:border-purple-300 group">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 text-purple-600 flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform">
                <Star className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-lg mb-2 text-gray-900">Sách chất lượng</h4>
              <p className="text-sm text-gray-600 leading-relaxed">Hàng chính hãng, giấy tốt, in ấn rõ ràng</p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border-2 border-green-100 hover:border-green-300 group">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-100 to-green-200 text-green-600 flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform">
                <Shield className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-lg mb-2 text-gray-900">Đổi trả dễ dàng</h4>
              <p className="text-sm text-gray-600 leading-relaxed">Miễn phí đổi trả trong 7 ngày</p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl border-2 border-yellow-100 hover:border-yellow-300 group">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-100 to-yellow-200 text-yellow-600 flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform">
                <Award className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-lg mb-2 text-gray-900">Giá tốt nhất</h4>
              <p className="text-sm text-gray-600 leading-relaxed">Cam kết giá tốt nhất thị trường</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-10 bg-indigo-100/70 border-t-2 border-indigo-200/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1.5 leading-tight">
              💬 Khách hàng nói gì về chúng tôi
            </h2>
            <p className="text-sm text-gray-600">Những đánh giá từ khách hàng thân thiết</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {testimonials.map((testimonial, idx) => (
              <Card key={idx} className="border-2 border-blue-100 hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden bg-white group">
                <CardContent className="pt-6 pb-6 px-5">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <Quote className="w-8 h-8 text-blue-200 mb-4" />
                  <p className="text-gray-700 mb-4 italic leading-relaxed text-sm">"{testimonial.content}"</p>
                  <div className="flex items-center gap-3 pt-3 border-t border-blue-100">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-600 font-bold text-base shadow-md">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-sm">{testimonial.name}</div>
                      <div className="text-xs text-gray-600 font-medium">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* News/Blog Section */}
      <section className="py-10 bg-teal-100/70 border-t-2 border-teal-200/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-xl flex items-center justify-center">
                <span className="text-lg">📰</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                Tin tức & Blog
              </h2>
            </div>
            <p className="text-sm text-gray-600">Cập nhật những thông tin mới nhất về sách</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {news.map((item, idx) => (
                <Card key={idx} className="hover:shadow-md transition-all duration-300 cursor-pointer border-blue-100 hover:border-blue-300">
                <CardHeader>
                  <div className="w-full h-48 bg-gradient-to-br from-blue-300 to-blue-400 rounded-lg mb-4 flex items-center justify-center text-white text-4xl">
                    📖
                  </div>
                  <CardTitle className="text-lg mb-2 line-clamp-2">{item.title}</CardTitle>
                  <CardDescription className="text-xs text-gray-500">{item.date}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 line-clamp-2">{item.excerpt}</p>
                  <Button variant="link" className="p-0 mt-4 text-blue-500 hover:text-blue-600">
                    Đọc thêm <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us - Extended */}
      <section className="py-10 bg-green-100/70 border-t-2 border-green-200/50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1.5 leading-tight">
                Cam kết của chúng tôi
              </h2>
              <p className="text-sm text-gray-600">Những giá trị chúng tôi mang lại</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { icon: CheckCircle, title: 'Sách chính hãng 100%', desc: 'Cam kết sách chính hãng, không bán sách lậu' },
                { icon: CheckCircle, title: 'Đóng gói cẩn thận', desc: 'Mỗi cuốn sách được đóng gói kỹ lưỡng, tránh hư hỏng' },
                { icon: CheckCircle, title: 'Hỗ trợ 24/7', desc: 'Đội ngũ chăm sóc khách hàng luôn sẵn sàng hỗ trợ' },
                { icon: CheckCircle, title: 'Thanh toán an toàn', desc: 'Nhiều phương thức thanh toán, bảo mật thông tin' }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
                  <div className="w-10 h-10 rounded-lg bg-blue-400 text-white flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1 text-sm">{item.title}</h4>
                    <p className="text-xs text-gray-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-10 bg-blue-50/80 border-t border-blue-100">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-4">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Đăng ký nhận tin
              </h2>
              <p className="text-sm text-gray-600">
                Nhận thông tin về sách mới, ưu đãi đặc biệt và sự kiện độc quyền
              </p>
            </div>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <Input
                type="email"
                placeholder="Nhập email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-white text-gray-900 border border-blue-200 h-12 text-sm rounded-lg shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                required
              />
              <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700 font-semibold h-12 px-6 rounded-lg shadow-sm hover:shadow-md transition-all">
                Đăng ký
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default UserTrangChu;


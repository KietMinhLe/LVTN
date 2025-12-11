import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getAllSach, searchSach, type Sach } from '../../services/sachService';
import { getAllDanhMuc, type DanhMuc } from '../../services/danhMucService';
import { useAddToCart } from '../../hooks/useCart';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../../components/ui/pagination';
import { 
  Eye, 
  ShoppingCart, 
  Search, 
  X, 
  SlidersHorizontal,
  Tag,
  User,
  DollarSign,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { toast } from 'sonner';

const UserSach = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useAddToCart();
  const [books, setBooks] = useState<Sach[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Sach[]>([]);
  const [allCategories, setAllCategories] = useState<DanhMuc[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [sortBy, setSortBy] = useState('ten_sach-asc');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedAuthor, setSelectedAuthor] = useState(searchParams.get('author') || '');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000000 });
  const [currentPage, setCurrentPage] = useState(1);
  const [booksPerPage] = useState(12);
  const [showFilters, setShowFilters] = useState(false);

  const loadBooks = useCallback(async () => {
    try {
      setLoading(true);
      let data: Sach[];
      
      if (searchQuery.trim()) {
        data = await searchSach(searchQuery.trim());
      } else {
        data = await getAllSach();
      }
      
      setBooks(data);
      
      // Load categories for dropdown
      try {
        const categoriesData = await getAllDanhMuc();
        setAllCategories(categoriesData);
      } catch (err) {
        console.error('Error loading categories:', err);
      }
    } catch (err: unknown) {
      console.error('Error loading books:', err);
      toast.error('Không thể tải danh sách sách');
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  // Sync selectedAuthor with URL query param (only when URL changes externally, e.g., from navigation)
  useEffect(() => {
    const authorParam = searchParams.get('author');
    if (authorParam) {
      // Decode URL-encoded author name
      const decodedAuthor = decodeURIComponent(authorParam);
      // Only update if different to avoid unnecessary re-renders
      if (decodedAuthor !== selectedAuthor) {
        setSelectedAuthor(decodedAuthor);
      }
    } else if (!authorParam && selectedAuthor) {
      // If URL doesn't have author param but state does, and it wasn't cleared by handleClearFilters
      // This handles case when user navigates to /books without author param
      // Only clear if we're sure it's an external navigation (not from dropdown)
      // We'll keep the state for now and let handleClearFilters handle it
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Update URL when selectedAuthor changes (from dropdown selection)
  const handleAuthorChange = (author: string) => {
    setSelectedAuthor(author);
    const newParams = new URLSearchParams(searchParams);
    if (author) {
      newParams.set('author', encodeURIComponent(author));
    } else {
      newParams.delete('author');
    }
    setSearchParams(newParams);
  };

  const applyFilters = useCallback(() => {
    let filtered = [...books];

    // Filter by category (by ID or name)
    if (selectedCategory) {
      const categoryId = parseInt(selectedCategory);
      if (!isNaN(categoryId)) {
        // Filter by category ID
        filtered = filtered.filter(book =>
          book.sach_danhmuc?.some((sd: { danhmuc: { danh_muc_id: number } }) => sd.danhmuc.danh_muc_id === categoryId)
        );
      } else {
        // Filter by category name
        filtered = filtered.filter(book =>
          book.sach_danhmuc?.some((sd: { danhmuc: { ten_danh_muc: string } }) => sd.danhmuc.ten_danh_muc === selectedCategory)
        );
      }
    }

    // Filter by author - exact match with trimmed comparison
    if (selectedAuthor) {
      const authorName = selectedAuthor.trim();
      filtered = filtered.filter(book => {
        const bookAuthorName = book.tacgia?.ten_tac_gia?.trim();
        return bookAuthorName === authorName;
      });
    }

    // Filter by price range
    filtered = filtered.filter(book =>
      book.gia_ban >= priceRange.min && book.gia_ban <= priceRange.max
    );

      // Sort books
      filtered.sort((a, b) => {
        if (sortBy === 'price-asc') {
          return a.gia_ban - b.gia_ban;
        } else if (sortBy === 'price-desc') {
          return b.gia_ban - a.gia_ban;
        } else if (sortBy === 'ten_sach-asc') {
          return a.ten_sach.localeCompare(b.ten_sach);
        } else if (sortBy === 'ten_sach-desc') {
          return b.ten_sach.localeCompare(a.ten_sach);
        } else if (sortBy === 'newest') {
          const dateA = a.ngay_tao ? new Date(a.ngay_tao).getTime() : 0;
          const dateB = b.ngay_tao ? new Date(b.ngay_tao).getTime() : 0;
          return dateB - dateA;
        }
        return 0;
      });

    setFilteredBooks(filtered);
    setCurrentPage(1);
  }, [books, sortBy, selectedCategory, selectedAuthor, priceRange]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() });
      loadBooks();
    } else {
      setSearchParams({});
      loadBooks();
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedAuthor('');
    setPriceRange({ min: 0, max: 10000000 });
    setSortBy('ten_sach-asc');
    setSearchParams({});
    loadBooks();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

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
    return 'https://via.placeholder.com/300x400/6366f1/ffffff?text=No+Image';
  };


  const handleViewDetails = (bookId: number) => {
    navigate(`/books/${bookId}`);
  };

  const handleAddToCart = (book: Sach) => {
    addToCart(book, 1);
  };

  // Get unique categories and authors
  const categories = Array.from(
    new Set(
      books.flatMap(book =>
        book.sach_danhmuc?.map((sd: { danhmuc: { ten_danh_muc: string } }) => sd.danhmuc.ten_danh_muc) || []
      )
    )
  );

  const authors = Array.from(
    new Set(books.map(book => book.tacgia?.ten_tac_gia).filter(Boolean) as string[])
  );

  // Pagination
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);

  const BookCard = ({ book }: { book: Sach }) => {
    const bookCategories = book.sach_danhmuc?.map((sd: { danhmuc: { ten_danh_muc: string } }) => sd.danhmuc.ten_danh_muc) || [];
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
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x400/6366f1/ffffff?text=No+Image';
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
            
            {/* Category Badge */}
            <div className="flex flex-wrap gap-1 min-h-[1.25rem]">
              {bookCategories.slice(0, 1).map((cat: string, idx: number) => (
                <Badge key={idx} variant="secondary" className="text-[9px] bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0 px-2 py-0.5 rounded-full shadow-sm">
                  {cat}
                </Badge>
              ))}
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
                  onClick={() => handleViewDetails(book.sach_id)}
                >
                  <Eye className="w-3 h-3 mr-1" />
                  Xem
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg text-[10px] h-7 px-2 rounded-lg transition-all duration-200 font-semibold border-0"
                  onClick={() => handleAddToCart(book)}
                  disabled={(book.so_luong || 0) === 0}
                >
                  <ShoppingCart className="w-3 h-3 mr-1" />
                  Mua
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const activeFiltersCount = [
    selectedCategory,
    selectedAuthor,
    searchQuery,
    priceRange.min > 0,
    priceRange.max < 10000000
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen py-8 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Danh sách sách
          </h1>
          <p className="text-gray-600 text-lg">Khám phá bộ sưu tập sách đa dạng của chúng tôi</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <form onSubmit={handleSearch} className="relative">
            <div className="relative flex items-center">
              <div className="absolute left-4 z-10">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Tìm kiếm theo tên sách, tác giả..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-32 h-14 text-base rounded-xl border-2 border-gray-200 bg-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
              <Button 
                type="submit"
                className="absolute right-2 h-10 px-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Tìm kiếm
              </Button>
            </div>
          </form>
        </div>

        {/* Filter Toggle and Active Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all"
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Bộ lọc
            {activeFiltersCount > 0 && (
              <Badge className="ml-2 bg-blue-500 text-white">
                {activeFiltersCount}
              </Badge>
            )}
            {showFilters ? (
              <ChevronUp className="w-4 h-4 ml-2" />
            ) : (
              <ChevronDown className="w-4 h-4 ml-2" />
            )}
          </Button>

          {/* Active Filter Badges */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2">
              {searchQuery && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200 px-3 py-1">
                  <Search className="w-3 h-3 mr-1" />
                  "{searchQuery}"
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSearchParams({});
                      loadBooks();
                    }}
                    className="ml-2 hover:text-blue-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {selectedCategory && (
                <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200 px-3 py-1">
                  <Tag className="w-3 h-3 mr-1" />
                  {allCategories.find(cat => cat.danh_muc_id.toString() === selectedCategory)?.ten_danh_muc || selectedCategory}
                  <button
                    onClick={() => setSelectedCategory('')}
                    className="ml-2 hover:text-purple-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {selectedAuthor && (
                <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200 px-3 py-1">
                  <User className="w-3 h-3 mr-1" />
                  {selectedAuthor}
                  <button
                    onClick={() => handleAuthorChange('')}
                    className="ml-2 hover:text-green-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {(priceRange.min > 0 || priceRange.max < 10000000) && (
                <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200 px-3 py-1">
                  <DollarSign className="w-3 h-3 mr-1" />
                  {formatPrice(priceRange.min)} - {formatPrice(priceRange.max)}
                  <button
                    onClick={() => setPriceRange({ min: 0, max: 10000000 })}
                    className="ml-2 hover:text-orange-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {activeFiltersCount > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="w-4 h-4 mr-1" />
                  Xóa tất cả
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mb-6 bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-6 animate-in slide-in-from-top-2 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-purple-600" />
                  Danh mục
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCategory(e.target.value)}
                  className="w-full h-11 rounded-lg border-2 border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                >
                  <option value="">Tất cả danh mục</option>
                  {allCategories.length > 0 ? (
                    allCategories.map((cat: DanhMuc) => (
                      <option key={cat.danh_muc_id} value={cat.danh_muc_id.toString()}>
                        {cat.ten_danh_muc}
                      </option>
                    ))
                  ) : (
                    categories.map((cat: string, idx: number) => (
                      <option key={idx} value={cat}>{cat}</option>
                    ))
                  )}
                </select>
              </div>

              {/* Author Filter */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <User className="w-4 h-4 text-green-600" />
                  Tác giả
                </label>
                <select
                  value={selectedAuthor}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleAuthorChange(e.target.value)}
                  className="w-full h-11 rounded-lg border-2 border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                >
                  <option value="">Tất cả tác giả</option>
                  {authors.map(author => (
                    <option key={author} value={author}>{author}</option>
                  ))}
                </select>
              </div>

              {/* Sort Filter */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-blue-600" />
                  Sắp xếp
                </label>
                <select
                  value={sortBy}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value)}
                  className="w-full h-11 rounded-lg border-2 border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                >
                  <option value="ten_sach-asc">Tên A-Z</option>
                  <option value="ten_sach-desc">Tên Z-A</option>
                  <option value="price-asc">Giá thấp đến cao</option>
                  <option value="price-desc">Giá cao đến thấp</option>
                  <option value="newest">Mới nhất</option>
                </select>
              </div>

              {/* Price Range Filter */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-orange-600" />
                  Khoảng giá
                </label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Từ"
                    value={priceRange.min || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPriceRange({ ...priceRange, min: Number(e.target.value) || 0 })}
                    className="h-11 rounded-lg border-2 border-gray-200 bg-white text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                  />
                  <Input
                    type="number"
                    placeholder="Đến"
                    value={priceRange.max || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPriceRange({ ...priceRange, max: Number(e.target.value) || 10000000 })}
                    className="h-11 rounded-lg border-2 border-gray-200 bg-white text-gray-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                  />
                </div>
                <div className="text-xs text-gray-500 flex justify-between">
                  <span>{formatPrice(priceRange.min)}</span>
                  <span>{formatPrice(priceRange.max)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="text-center py-16">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-500 mx-auto mb-4"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-500 animate-pulse" />
              </div>
            </div>
            <p className="text-gray-600 text-lg font-medium">Đang tải sách...</p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-gray-700 text-lg">
                  <span className="font-bold text-blue-600">{filteredBooks.length}</span> cuốn sách
                  {searchQuery && (
                    <span className="text-gray-600"> cho "<span className="font-semibold text-gray-900">{searchQuery}</span>"</span>
                  )}
                </p>
              </div>
              {filteredBooks.length > 0 && (
                <div className="text-sm text-gray-500">
                  Trang {currentPage} / {totalPages}
                </div>
              )}
            </div>

            {currentBooks.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 mb-8">
                  {currentBooks.map(book => (
                    <BookCard key={book.sach_id} book={book} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          size="default"
                          onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                            e.preventDefault();
                            if (currentPage > 1) setCurrentPage(currentPage - 1);
                          }}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                        />
                      </PaginationItem>
                      {[...Array(totalPages)].map((_, index) => {
                        const page = index + 1;
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <PaginationItem key={page}>
                              <PaginationLink
                                href="#"
                                size="icon"
                                onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                                  e.preventDefault();
                                  setCurrentPage(page);
                                }}
                                isActive={currentPage === page}
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        } else if (page === currentPage - 2 || page === currentPage + 2) {
                          return (
                            <PaginationItem key={page}>
                              <span className="px-2">...</span>
                            </PaginationItem>
                          );
                        }
                        return null;
                      })}
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          size="default"
                          onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                            e.preventDefault();
                            if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                          }}
                          className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border-2 border-gray-100 shadow-sm">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                  <BookOpen className="w-12 h-12 text-blue-500" />
                </div>
                <h4 className="text-2xl font-bold mb-3 text-gray-900">Không tìm thấy sách</h4>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Không có sách nào phù hợp với bộ lọc của bạn. Hãy thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác.
                </p>
                <Button 
                  onClick={handleClearFilters}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  <X className="w-4 h-4 mr-2" />
                  Xóa bộ lọc và xem tất cả
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserSach;


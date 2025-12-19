import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../ui/button';
import { useCart } from '../../hooks/useCartContext';
import { useUserAuth } from '../../hooks/useUserAuth';
import { getAllDonHang } from '../../services/donHangService';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { 
  BookOpen, 
  ShoppingCart, 
  Menu, 
  X, 
  Search,
  User,
  LogIn,
  FolderTree,
  LogOut,
  UserCircle,
  Settings
} from 'lucide-react';
import { Input } from '../ui/input';
import { searchSach, type Sach } from '../../services/sachService';

const Header = () => {
  const navigate = useNavigate(); // Dùng để chuyển hướng trang
  const location = useLocation(); // Dùng để lấy vị trí hiện tại của trang
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Dùng để kiểm tra xem menu có đang mở hay không
  const [searchQuery, setSearchQuery] = useState(''); // Dùng để lưu từ khóa tìm kiếm
  const [liveResults, setLiveResults] = useState<Sach[]>([]); // Dùng để lưu kết quả tìm kiếm
  const [isSearching, setIsSearching] = useState(false); // Dùng để kiểm tra xem có đang tìm kiếm hay không
  const [showResults, setShowResults] = useState(false); // Dùng để hiển thị kết quả tìm kiếm
  const [orderCount, setOrderCount] = useState(0); // Dùng để lưu số đơn hàng của user
  const { cartCount } = useCart(); // Dùng để lấy số lượng sản phẩm trong giỏ hàng
  const { isAuthenticated, user, logout } = useUserAuth(); // Dùng để kiểm tra xem user đã đăng nhập hay không

  // Load số đơn hàng của user
  useEffect(() => {
    const loadOrderCount = async () => {
      // Nếu user đã đăng nhập và có id thì lấy số đơn hàng của user
      if (isAuthenticated && user?.id) {
        try {
          // Lấy tất cả đơn hàng
          const allOrders = await getAllDonHang();
          // Lấy số đơn hàng của user dựa vào khach_hang_id
          const userOrders = allOrders.filter(order => order.khach_hang_id === user.id);
          // Lưu số đơn hàng của user
          setOrderCount(userOrders.length);
        } catch (error) {
          console.error('Error loading order count:', error);
        }
      } else {
        setOrderCount(0);
      }
    };

    // Load số đơn hàng của user
    loadOrderCount();

    // Lắng nghe sự kiện khi có đơn hàng mới
    const handleOrderCreated = () => {
      // Khi có đơn hàng mới, load lại số đơn hàng của user
      loadOrderCount();
    };

    // Lắng nghe sự kiện khi có đơn hàng mới
    window.addEventListener('orderCreated', handleOrderCreated);
    return () => {
      // Xóa sự kiện khi component unmount
      window.removeEventListener('orderCreated', handleOrderCreated);
    };
  }, [isAuthenticated, user]);

  // Kiểm tra xem đường dẫn hiện tại có phải là đường dẫn được truyền vào hay không
  const isActive = (path: string) => location.pathname === path;

  // Xử lý đăng xuất
  const handleLogout = () => {
    // Đăng xuất user
    logout();
    // Chuyển hướng về trang chủ
    navigate('/');
    // Đóng menu
    setIsMenuOpen(false);
  };

  // Live search cho thanh menu (header)
  useEffect(() => {
    let timer: number | undefined;

    const runSearch = async () => {
      const keyword = searchQuery.trim();
      if (keyword.length < 2) {
        setLiveResults([]);
        setShowResults(false);
        return;
      }

      try {
        setIsSearching(true);
        const results = await searchSach(keyword);
        setLiveResults(results.slice(0, 6));
        setShowResults(true);
      } catch (error) {
        console.error('Live search error:', error);
        setLiveResults([]);
        setShowResults(false);
      } finally {
        setIsSearching(false);
      }
    };

    if (searchQuery.trim()) {
      timer = window.setTimeout(runSearch, 300);
    } else {
      setLiveResults([]);
      setShowResults(false);
    }

    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Nếu có từ khóa, navigate với query param
    // Nếu không có từ khóa, navigate về /books (không có query param) để hiển thị tất cả sách
    if (searchQuery.trim()) {
      navigate(`/books?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/books');
    }
    setShowResults(false);
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

  const navItems = [
    { path: '/', label: 'Trang chủ', icon: BookOpen },
    { path: '/books', label: 'Sách', icon: BookOpen },
    { path: '/categories', label: 'Danh mục', icon: FolderTree },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-purple-400/70 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 backdrop-blur-md shadow-2xl">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white text-amber-500 shadow-xl transition-transform duration-300 group-hover:scale-110 group-hover:shadow-2xl">
              <BookOpen className="h-7 w-7" />
            </div>
            <span className="text-2xl font-extrabold text-white hidden sm:inline-block drop-shadow-lg" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>
              BookStore
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-base font-semibold transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-white/30 backdrop-blur-sm text-white shadow-md'
                      : 'text-white hover:bg-white/20 hover:text-white hover:shadow-sm hover:scale-105 active:scale-95'
                  }`}
                  style={isActive(item.path) ? { textShadow: '1px 1px 2px rgba(0,0,0,0.3)', color: '#ffffff' } : { color: '#ffffff' }}
                >
                  <Icon className="h-5 w-5" style={{ color: '#ffffff' }} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: '#ffffff', fill: 'none', stroke: '#ffffff', strokeWidth: 2 }} />
                <Input
                  type="text"
                  placeholder="Tìm kiếm sách..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => { if (liveResults.length > 0) setShowResults(true); }}
                  className="pl-10 w-full bg-white/30 backdrop-blur-sm border-2 border-white/50 text-white placeholder:text-white/80 focus:bg-white/40 focus:border-white focus:ring-2 focus:ring-white/50 shadow-lg"
                  style={{ color: '#ffffff' }}
                />

                {/* Live search results - Desktop */}
                {showResults && (liveResults.length > 0 || isSearching) && (
                  <div className="absolute left-0 right-0 mt-2 bg-white text-gray-900 rounded-lg shadow-xl border border-gray-200 z-50 max-h-80 overflow-y-auto">
                    {isSearching && (
                      <div className="px-4 py-2 text-sm text-gray-500">Đang tìm kiếm...</div>
                    )}
                    {!isSearching &&
                      liveResults.map((book) => (
                        <button
                          key={book.sach_id}
                          type="button"
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                          onClick={() => {
                            setShowResults(false);
                            setSearchQuery('');
                            navigate(`/books/${book.sach_id}`);
                          }}
                        >
                          <img
                            src={getBookImageUrl(book)}
                            alt={book.ten_sach}
                            className="w-14 h-20 object-cover rounded border border-gray-200 shadow-sm flex-shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x400/6366f1/ffffff?text=No+Image';
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold line-clamp-1">{book.ten_sach}</div>
                            {book.tacgia && (
                              <div className="text-xs text-gray-500 line-clamp-1">
                                Tác giả: {book.tacgia.ten_tac_gia}
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    {!isSearching && liveResults.length === 0 && (
                      <div className="px-4 py-2 text-sm text-gray-500">Không tìm thấy sách phù hợp</div>
                    )}
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
            {/* Search Icon - Mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-white hover:bg-white/20 hover:text-white"
              onClick={() => navigate('/books')}
            >
              <Search className="h-6 w-6" style={{ color: '#ffffff', fill: 'none', stroke: '#ffffff' }} />
            </Button>

            {/* Cart */}
            <Link
              to="/cart"
              className={`relative flex items-center gap-2 px-5 py-2.5 rounded-lg text-base font-semibold transition-all duration-200 ${
                isActive('/cart')
                  ? 'bg-white/30 backdrop-blur-sm text-white shadow-md'
                  : 'text-white hover:bg-white/20 hover:text-white hover:shadow-sm hover:scale-105 active:scale-95'
              }`}
              style={isActive('/cart') ? { textShadow: '1px 1px 2px rgba(0,0,0,0.3)', color: '#ffffff' } : { color: '#ffffff' }}
            >
              <ShoppingCart className="h-5 w-5" style={{ color: '#ffffff' }} />
              <span className="hidden lg:inline">Giỏ hàng</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-yellow-400 text-gray-900 text-xs font-bold flex items-center justify-center shadow-lg animate-pulse">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="group relative flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-white/20 via-white/15 to-white/20 backdrop-blur-md text-white border-2 border-white/30 hover:border-white/50 hover:from-white/30 hover:via-white/25 hover:to-white/30 hover:shadow-xl hover:shadow-purple-500/30 hover:scale-105 active:scale-100 transition-all duration-300 overflow-hidden"
                    style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
                    title={user.ho_ten || user.email}
                  >
                    {/* Shine effect */}
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                    
                    {/* Avatar circle with gradient */}
                    <div className="relative h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 flex items-center justify-center shadow-lg ring-2 ring-white/50 group-hover:ring-white/80 transition-all duration-300">
                      {user.ho_ten ? (
                        <span className="text-white font-bold text-xs">
                          {user.ho_ten.charAt(0).toUpperCase()}
                        </span>
                      ) : (
                        <UserCircle className="h-5 w-5 text-white" />
                      )}
                    </div>
                    
                    {/* User name - hidden on small screens */}
                    <span className="hidden md:inline-block relative z-10 max-w-[100px] truncate">
                      {user.ho_ten || user.email?.split('@')[0]}
                    </span>
                    
                    {/* Order count badge */}
                    {orderCount > 0 && (
                      <span className="relative z-10 h-5 w-5 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 text-xs font-bold flex items-center justify-center shadow-lg ring-2 ring-white/50 animate-pulse">
                        {orderCount > 99 ? '99+' : orderCount}
                      </span>
                    )}
                    
                    {/* Glow effect */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/30 via-purple-400/30 to-pink-400/30 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 bg-white/95 backdrop-blur-xl border-2 border-gray-200/50 shadow-2xl">
                  <DropdownMenuLabel className="font-normal p-4 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-t-lg border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 flex items-center justify-center shadow-lg ring-2 ring-gray-200 flex-shrink-0">
                        {user.ho_ten ? (
                          <span className="text-white font-bold text-lg">
                            {user.ho_ten.charAt(0).toUpperCase()}
                          </span>
                        ) : (
                          <UserCircle className="h-7 w-7 text-white" />
                        )}
                      </div>
                      <div className="flex flex-col space-y-1 min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900 leading-none truncate">
                          {user.ho_ten || 'Người dùng'}
                        </p>
                        <p className="text-xs leading-none text-gray-600 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      navigate('/profile');
                      setIsMenuOpen(false);
                    }}
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>Hồ sơ</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      navigate('/orders');
                      setIsMenuOpen(false);
                    }}
                    className="relative"
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    <span>Đơn hàng</span>
                    {orderCount > 0 && (
                      <span className="ml-auto h-5 w-5 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 text-xs font-bold flex items-center justify-center shadow-md ring-1 ring-gray-300">
                        {orderCount > 99 ? '99+' : orderCount}
                      </span>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      navigate('/settings');
                      setIsMenuOpen(false);
                    }}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Cài đặt</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600 focus:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                to="/login"
                className="group relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-blue-500/90 via-purple-500/90 to-pink-500/90 backdrop-blur-md text-white border-2 border-white/40 hover:border-white/60 shadow-lg hover:shadow-2xl hover:shadow-purple-500/50 hover:scale-110 active:scale-105 transition-all duration-300 overflow-hidden"
                style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
                title="Đăng nhập"
              >
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Shine effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                
                <LogIn className="h-5 w-5 relative z-10 group-hover:rotate-12 transition-transform duration-300" style={{ color: '#ffffff' }} />
                <span className="hidden sm:inline relative z-10">Đăng nhập</span>
                
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/50 via-purple-400/50 to-pink-400/50 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white hover:bg-white/20 hover:text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" style={{ color: '#ffffff' }} /> : <Menu className="h-6 w-6" style={{ color: '#ffffff' }} />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-white/30 py-4 bg-white/10 backdrop-blur-sm">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mb-4 px-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: '#ffffff', fill: 'none', stroke: '#ffffff', strokeWidth: 2 }} />
                <Input
                  type="text"
                  placeholder="Tìm kiếm sách..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => { if (liveResults.length > 0) setShowResults(true); }}
                  className="pl-12 h-11 w-full bg-white/30 backdrop-blur-sm border-2 border-white/50 text-white placeholder:text-white/80 focus:bg-white/40 focus:border-white focus:ring-2 focus:ring-white/50 shadow-lg text-base"
                  style={{ color: '#ffffff' }}
                />

                {/* Live search results - Mobile */}
                {showResults && (liveResults.length > 0 || isSearching) && (
                  <div className="absolute left-0 right-0 mt-2 bg-white text-gray-900 rounded-lg shadow-xl border border-gray-200 z-50 max-h-80 overflow-y-auto">
                    {isSearching && (
                      <div className="px-4 py-2 text-sm text-gray-500">Đang tìm kiếm...</div>
                    )}
                    {!isSearching &&
                      liveResults.map((book) => (
                        <button
                          key={book.sach_id}
                          type="button"
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                          onClick={() => {
                            setShowResults(false);
                            setIsMenuOpen(false);
                            setSearchQuery('');
                            navigate(`/books/${book.sach_id}`);
                          }}
                        >
                          <img
                            src={getBookImageUrl(book)}
                            alt={book.ten_sach}
                            className="w-14 h-20 object-cover rounded border border-gray-200 shadow-sm flex-shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x400/6366f1/ffffff?text=No+Image';
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold line-clamp-1">{book.ten_sach}</div>
                            {book.tacgia && (
                              <div className="text-xs text-gray-500 line-clamp-1">
                                Tác giả: {book.tacgia.ten_tac_gia}
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    {!isSearching && liveResults.length === 0 && (
                      <div className="px-4 py-2 text-sm text-gray-500">Không tìm thấy sách phù hợp</div>
                    )}
                  </div>
                )}
              </div>
            </form>

            {/* Mobile Navigation */}
            <nav className="flex flex-col space-y-1 px-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-base font-semibold transition-all duration-200 ${
                      isActive(item.path)
                        ? 'bg-white/30 backdrop-blur-sm text-white shadow-md'
                        : 'text-white hover:bg-white/20 hover:text-white'
                    }`}
                    style={isActive(item.path) ? { textShadow: '1px 1px 2px rgba(0,0,0,0.3)', color: '#ffffff' } : { color: '#ffffff' }}
                  >
                    <Icon className="h-5 w-5" style={{ color: '#ffffff' }} />
                    {item.label}
                  </Link>
                );
              })}
              {isAuthenticated && user ? (
                <>
                  <div className="px-4 py-3 border-b border-white/30 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 flex items-center justify-center shadow-lg ring-2 ring-white/50 flex-shrink-0">
                        {user.ho_ten ? (
                          <span className="text-white font-bold text-sm">
                            {user.ho_ten.charAt(0).toUpperCase()}
                          </span>
                        ) : (
                          <UserCircle className="h-6 w-6 text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>
                          {user.ho_ten || 'Người dùng'}
                        </p>
                        <p className="text-xs text-white/80 truncate">{user.email}</p>
                      </div>
                      {orderCount > 0 && (
                        <span className="h-6 w-6 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 text-xs font-bold flex items-center justify-center shadow-lg ring-2 ring-white/50">
                          {orderCount > 99 ? '99+' : orderCount}
                        </span>
                      )}
                    </div>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-white/20 hover:text-white transition-all duration-200"
                    style={{ color: '#ffffff' }}
                  >
                    <User className="h-5 w-5" style={{ color: '#ffffff' }} />
                    Hồ sơ
                  </Link>
                  <Link
                    to="/orders"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-white/20 hover:text-white transition-all duration-200"
                    style={{ color: '#ffffff' }}
                  >
                    <ShoppingCart className="h-5 w-5" style={{ color: '#ffffff' }} />
                    Đơn hàng
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-red-200 hover:bg-red-500/30 hover:text-red-100 w-full text-left transition-all duration-200"
                  >
                    <LogOut className="h-5 w-5" style={{ color: '#ffffff' }} />
                    Đăng xuất
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="group relative flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-blue-500/90 via-purple-500/90 to-pink-500/90 backdrop-blur-md text-white border-2 border-white/40 hover:border-white/60 shadow-lg hover:shadow-2xl hover:shadow-purple-500/50 hover:scale-105 active:scale-100 transition-all duration-300 w-full justify-center overflow-hidden"
                  style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
                  title="Đăng nhập"
                >
                  {/* Animated background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Shine effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                  
                  <LogIn className="h-5 w-5 relative z-10 group-hover:rotate-12 transition-transform duration-300" style={{ color: '#ffffff' }} />
                  <span className="relative z-10">Đăng nhập</span>
                  
                  {/* Glow effect */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/50 via-purple-400/50 to-pink-400/50 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;


import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUserAuth } from '../../hooks/useUserAuth';
import { registerKhachHang } from '../../services/khachHangService';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Lock, Mail, Loader2, User, Eye, EyeOff, UserPlus, Phone, Calendar } from 'lucide-react';

const UserRegister = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [hoTen, setHoTen] = useState('');
  const [soDienThoai, setSoDienThoai] = useState('');
  const [ngaySinh, setNgaySinh] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const { isAuthenticated, updateUser } = useUserAuth();
  const navigate = useNavigate();

  // Nếu đã đăng nhập thì redirect về trang chủ
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Xóa lỗi cũ

    // Validation
    if (!email || !password || !hoTen || !confirmPassword) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    // Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Dữ liệu không hợp lệ. Vui lòng nhập lại');
      return;
    }

    // Kiểm tra độ dài mật khẩu
    if (password.length < 6) {
      setError('Dữ liệu không hợp lệ. Vui lòng nhập lại');
      return;
    }

    // Kiểm tra mật khẩu khớp
    if (password !== confirmPassword) {
      setError('Dữ liệu không hợp lệ. Vui lòng nhập lại');
      return;
    }

    setLoading(true);
    try {
      // Gọi trực tiếp service để có thể bắt được error message cụ thể
      const response = await registerKhachHang({
        email,
        mat_khau: password,
        ho_ten: hoTen,
        so_dien_thoai: soDienThoai || undefined,
        ngay_sinh: ngaySinh || undefined
      });

      if (response && response.success === true && response.token && response.khach_hang) {
        // Lưu thông tin đăng nhập
        localStorage.setItem('user_token', response.token);
        localStorage.setItem('user_info', JSON.stringify(response.khach_hang));
        
        // Cập nhật context
        updateUser(response.khach_hang);

        // Xóa session cũ và gio_hang_id cũ để load lại giỏ hàng của user
        localStorage.removeItem('gio_hang_id');
        sessionStorage.removeItem('session_id');

        // Dispatch event để CartContext load lại giỏ hàng của user
        window.dispatchEvent(new Event('userLogin'));

        // Xóa dữ liệu trong form sau khi đăng ký thành công
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setHoTen('');
        setSoDienThoai('');
        setNgaySinh('');

        // Đợi một chút để đảm bảo state đã được cập nhật
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 100);
      } else {
        const errorMsg = response?.message || 'Dữ liệu không hợp lệ. Vui lòng nhập lại';
        if (errorMsg.includes('Email đã được sử dụng') || errorMsg.includes('email đã được sử dụng')) {
          setError('Email đã được đăng ký');
        } else {
          setError('Dữ liệu không hợp lệ. Vui lòng nhập lại');
        }
        setLoading(false);
      }
    } catch (error: unknown) {
      console.error('Register submit error:', error);
      const axiosError = error as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage = axiosError.response?.data?.message || axiosError.message || 'Dữ liệu không hợp lệ. Vui lòng nhập lại';
      
      // Kiểm tra nếu là lỗi email đã tồn tại
      if (errorMessage.includes('Email đã được sử dụng') || errorMessage.includes('email đã được sử dụng')) {
        setError('Email đã được đăng ký');
      } else {
        setError('Dữ liệu không hợp lệ. Vui lòng nhập lại');
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 dark:from-slate-950 dark:to-slate-900 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo/Header Section */}
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-500/20">
            <UserPlus className="h-10 w-10 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent dark:from-green-400 dark:to-green-500">
              Đăng ký
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Tạo tài khoản mới để bắt đầu mua sắm
            </p>
          </div>
        </div>

        {/* Register Card */}
        <Card className="border shadow-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-semibold text-center text-slate-900 dark:text-slate-100">
              Tạo tài khoản mới
            </CardTitle>
            <CardDescription className="text-center text-slate-600 dark:text-slate-300">
              Điền thông tin của bạn để đăng ký
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              {/* Họ tên Input */}
              <div className="space-y-2">
                <label htmlFor="hoTen" className="text-sm font-medium flex items-center gap-2 text-slate-900 dark:text-slate-100">
                  <User className="h-4 w-4" />
                  Họ tên <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="hoTen"
                    type="text"
                    name="hoTen"
                    placeholder="Nhập họ và tên của bạn"
                    value={hoTen}
                    onChange={(e) => {
                      setHoTen(e.target.value);
                      setError(''); // Xóa lỗi khi người dùng nhập
                    }}
                    className="pl-10 h-11"
                    disabled={loading}
                    autoComplete="name"
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium flex items-center gap-2 text-slate-900 dark:text-slate-100">
                  <Mail className="h-4 w-4" />
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError(''); // Xóa lỗi khi người dùng nhập
                    }}
                    className="pl-10 h-11"
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Số điện thoại Input */}
              <div className="space-y-2">
                <label htmlFor="soDienThoai" className="text-sm font-medium flex items-center gap-2 text-slate-900 dark:text-slate-100">
                  <Phone className="h-4 w-4" />
                  Số điện thoại
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="soDienThoai"
                    type="tel"
                    name="soDienThoai"
                    placeholder="0123456789"
                    value={soDienThoai}
                    onChange={(e) => setSoDienThoai(e.target.value)}
                    className="pl-10 h-11"
                    disabled={loading}
                    autoComplete="tel"
                  />
                </div>
              </div>

              {/* Ngày sinh Input */}
              <div className="space-y-2">
                <label htmlFor="ngaySinh" className="text-sm font-medium flex items-center gap-2 text-slate-900 dark:text-slate-100">
                  <Calendar className="h-4 w-4" />
                  Ngày sinh
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="ngaySinh"
                    type="date"
                    name="ngaySinh"
                    value={ngaySinh}
                    onChange={(e) => setNgaySinh(e.target.value)}
                    className="pl-10 h-11"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium flex items-center gap-2 text-slate-900 dark:text-slate-100">
                  <Lock className="h-4 w-4" />
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Tối thiểu 6 ký tự"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(''); // Xóa lỗi khi người dùng nhập
                    }}
                    className="pl-10 pr-10 h-11"
                    disabled={loading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium flex items-center gap-2 text-slate-900 dark:text-slate-100">
                  <Lock className="h-4 w-4" />
                  Xác nhận mật khẩu <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="Nhập lại mật khẩu"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError(''); // Xóa lỗi khi người dùng nhập
                    }}
                    className="pl-10 pr-10 h-11"
                    disabled={loading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={loading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-11 text-base font-medium bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg shadow-green-500/20 hover:shadow-xl hover:shadow-green-500/30 transition-all mt-6"
                disabled={loading}
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Đang đăng ký...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-5 w-5" />
                    Đăng ký
                  </>
                )}
              </Button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center text-sm">
              <span className="text-slate-600 dark:text-slate-300">
                Đã có tài khoản?{' '}
              </span>
              <Link
                to="/login"
                className="font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors"
              >
                Đăng nhập ngay
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <Badge variant="outline" className="text-xs">
            Bảo mật • An toàn • Tin cậy
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default UserRegister;


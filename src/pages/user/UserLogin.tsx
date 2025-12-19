import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUserAuth } from '../../hooks/useUserAuth';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Lock, Mail, Loader2, User, Eye, EyeOff } from 'lucide-react';

const UserLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const { login, isAuthenticated } = useUserAuth();
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

    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setLoading(true);
    try {
      const success = await login(email, password);

      if (success) {
        // Xóa dữ liệu trong form sau khi đăng nhập thành công
        setEmail('');
        setPassword('');

        // Đợi một chút để đảm bảo state đã được cập nhật
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 100);
      } else {
        setError('Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.');
        setLoading(false);
      }
    } catch (error: unknown) {
      console.error('Login submit error:', error);
      const axiosError = error as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage = axiosError.response?.data?.message || axiosError.message || 'Có lỗi xảy ra khi đăng nhập';
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 dark:from-slate-950 dark:to-slate-900 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo/Header Section */}
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20">
            <User className="h-10 w-10 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent dark:from-blue-400 dark:to-blue-500">
              Đăng nhập
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Chào mừng bạn trở lại
            </p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="border shadow-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-semibold text-center text-slate-900 dark:text-slate-100">
              Đăng nhập tài khoản
            </CardTitle>
            <CardDescription className="text-center text-slate-600 dark:text-slate-300">
              Nhập thông tin đăng nhập của bạn để tiếp tục
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              {/* Email Input */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium flex items-center gap-2 text-slate-900 dark:text-slate-100">
                  <Mail className="h-4 w-4" />
                  Email
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

              {/* Password Input */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium flex items-center gap-2 text-slate-900 dark:text-slate-100">
                  <Lock className="h-4 w-4" />
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(''); // Xóa lỗi khi người dùng nhập
                    }}
                    className="pl-10 pr-10 h-11"
                    disabled={loading}
                    autoComplete="current-password"
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

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-11 text-base font-medium bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all"
                disabled={loading}
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Đang đăng nhập...
                  </>
                ) : (
                  <>
                    <User className="mr-2 h-5 w-5" />
                    Đăng nhập
                  </>
                )}
              </Button>
            </form>

            {/* Forgot Password Link */}
            <div className="mt-4 text-center text-sm">
              <Link
                to="/forgot-password"
                className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                Quên mật khẩu?
              </Link>
            </div>

            {/* Register Link */}
            <div className="mt-6 text-center text-sm">
              <span className="text-slate-600 dark:text-slate-300">
                Chưa có tài khoản?{' '}
              </span>
              <Link
                to="/register"
                className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                Đăng ký ngay
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

export default UserLogin;


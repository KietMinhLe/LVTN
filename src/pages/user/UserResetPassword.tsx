import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useUserAuth } from '../../hooks/useUserAuth';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Lock, Loader2, ArrowLeft, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { resetPassword } from '../../services/khachHangService';

const UserResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useUserAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string>('');
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Nếu đã đăng nhập thì redirect về trang chủ
    if (isAuthenticated) {
      navigate('/');
      return;
    }

    // Lấy token từ URL
    const tokenFromUrl = searchParams.get('token');
    if (!tokenFromUrl) {
      toast.error('Token không hợp lệ. Vui lòng yêu cầu đặt lại mật khẩu lại.');
      navigate('/forgot-password');
      return;
    }
    setToken(tokenFromUrl);
  }, [isAuthenticated, navigate, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Xóa lỗi cũ

    if (!token) {
      setError('Token không hợp lệ');
      return;
    }

    if (!newPassword) {
      setError('Mật khẩu mới không được bỏ trống.');
      return;
    }

    if (!confirmPassword) {
      setError('Vui lòng xác nhận mật khẩu');
      return;
    }

    if (newPassword.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ token, newPassword, confirmPassword });
      setSuccess(true);
      toast.success('Đặt lại mật khẩu thành công');
      
      // Redirect về trang đăng nhập sau 3 giây
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error: unknown) {
      console.error('Reset password error:', error);
      const axiosError = error as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage = axiosError.response?.data?.message || axiosError.message || 'Có lỗi xảy ra khi đặt lại mật khẩu';
      setError(errorMessage);
      
      // Nếu token hết hạn, redirect về forgot password
      if (errorMessage.includes('hết hạn') || errorMessage.includes('expired')) {
        setTimeout(() => {
          navigate('/forgot-password');
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 dark:from-slate-950 dark:to-slate-900 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo/Header Section */}
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-500/20">
            <Lock className="h-10 w-10 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent dark:from-green-400 dark:to-green-500">
              {success ? 'Đặt lại mật khẩu thành công' : 'Đặt lại mật khẩu'}
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {success 
                ? 'Bạn có thể đăng nhập với mật khẩu mới' 
                : 'Nhập mật khẩu mới cho tài khoản của bạn'}
            </p>
          </div>
        </div>

        {/* Reset Password Card */}
        <Card className="border shadow-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-semibold text-center text-slate-900 dark:text-slate-100">
              {success ? 'Thành công' : 'Tạo mật khẩu mới'}
            </CardTitle>
            <CardDescription className="text-center text-slate-600 dark:text-slate-300">
              {success 
                ? 'Mật khẩu của bạn đã được cập nhật thành công' 
                : 'Mật khẩu phải có ít nhất 8 ký tự'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="space-y-6">
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                  <p className="text-center text-slate-700 dark:text-slate-300 mb-4">
                    Mật khẩu của bạn đã được đặt lại thành công!
                  </p>
                  <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                    Bạn sẽ được chuyển đến trang đăng nhập trong giây lát...
                  </p>
                </div>
                <Link to="/login">
                  <Button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
                    Đăng nhập ngay
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md text-sm">
                    {error}
                  </div>
                )}

                {/* New Password Input */}
                <div className="space-y-2">
                  <label htmlFor="newPassword" className="text-sm font-medium flex items-center gap-2 text-slate-900 dark:text-slate-100">
                    <Lock className="h-4 w-4" />
                    Mật khẩu mới <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
                    <Input
                      id="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      name="newPassword"
                      placeholder="Tối thiểu 8 ký tự"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
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
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-5 w-5" />
                      Đặt lại mật khẩu
                    </>
                  )}
                </Button>
              </form>
            )}

            {/* Back Link */}
            {!success && (
              <div className="mt-6 text-center text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Quay lại
                </Link>
              </div>
            )}
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

export default UserResetPassword;


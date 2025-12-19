import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUserAuth } from '../../hooks/useUserAuth';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { forgotPassword } from '../../services/khachHangService';

const UserForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string>('');
  const { isAuthenticated } = useUserAuth();
  const navigate = useNavigate();

  // Nếu đã đăng nhập thì redirect về trang chủ
  if (isAuthenticated) {
    navigate('/');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Xóa lỗi cũ

    if (!email) {
      setError('Vui lòng nhập email để đặt lại mật khẩu');
      return;
    }

    // Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Email không hợp lệ');
      return;
    }

    setLoading(true);
    try {
      await forgotPassword({ email });
      setEmailSent(true);
      toast.success('Đã gửi email đặt lại mật khẩu');
    } catch (error: unknown) {
      console.error('Forgot password error:', error);
      const axiosError = error as { response?: { data?: { message?: string } }; message?: string };
      const errorMessage = axiosError.response?.data?.message || axiosError.message || 'Có lỗi xảy ra khi gửi email';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 dark:from-slate-950 dark:to-slate-900 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo/Header Section */}
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20">
            <Mail className="h-10 w-10 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent dark:from-blue-400 dark:to-blue-500">
              Quên mật khẩu
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Nhập email để nhận link đặt lại mật khẩu
            </p>
          </div>
        </div>

        {/* Forgot Password Card */}
        <Card className="border shadow-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-semibold text-center text-slate-900 dark:text-slate-100">
              {emailSent ? 'Email đã được gửi' : 'Đặt lại mật khẩu'}
            </CardTitle>
            <CardDescription className="text-center text-slate-600 dark:text-slate-300">
              {emailSent 
                ? 'Vui lòng kiểm tra email của bạn để đặt lại mật khẩu' 
                : 'Nhập email đăng ký của bạn'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {emailSent ? (
              <div className="space-y-6">
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                  <p className="text-center text-slate-700 dark:text-slate-300 mb-2">
                    Chúng tôi đã gửi link đặt lại mật khẩu đến email:
                  </p>
                  <p className="text-center font-semibold text-blue-600 dark:text-blue-400 mb-4">
                    {email}
                  </p>
                  <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                    Vui lòng kiểm tra hộp thư đến (và cả thư mục spam) của bạn.
                  </p>
                  <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-2">
                    Link sẽ hết hạn sau 1 giờ.
                  </p>
                </div>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setEmailSent(false);
                      setEmail('');
                    }}
                  >
                    Gửi lại email
                  </Button>
                  <Link to="/login" className="block">
                    <Button variant="ghost" className="w-full">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Quay lại đăng nhập
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
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
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-5 w-5" />
                      Gửi link đặt lại mật khẩu
                    </>
                  )}
                </Button>
              </form>
            )}

            {/* Login Link */}
            {!emailSent && (
              <div className="mt-6 text-center text-sm">
                <span className="text-slate-600 dark:text-slate-300">
                  Nhớ mật khẩu?{' '}
                </span>
                <Link
                  to="/login"
                  className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  Đăng nhập ngay
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

export default UserForgotPassword;


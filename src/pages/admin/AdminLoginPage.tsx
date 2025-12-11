import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Lock, Mail, Loader2, Shield, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Nếu đã đăng nhập thì redirect về dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Vui lòng nhập đầy đủ email và mật khẩu');
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
          navigate('/admin/dashboard', { replace: true });
        }, 100);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Login submit error:', error);
      toast.error('Có lỗi xảy ra khi đăng nhập');
      setLoading(false);
    }
  };


  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
        {/* Decorative Circles */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-400/20 dark:bg-indigo-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-400/10 dark:bg-purple-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative w-full max-w-md space-y-8 mx-auto z-10">
        {/* Logo/Header Section */}
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 shadow-2xl shadow-blue-500/50 dark:shadow-blue-900/50 transform hover:scale-105 transition-transform duration-300">
            <Shield className="h-12 w-12 text-white drop-shadow-lg" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400">
              Admin Panel
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
              Hệ thống quản lý nội bộ
            </p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="border-0 shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
          <CardHeader className="space-y-1 pb-6 pt-8">
            <CardTitle className="text-2xl font-bold text-center text-slate-900 dark:text-slate-100">
              Đăng nhập
            </CardTitle>
            <CardDescription className="text-center text-slate-600 dark:text-slate-400">
              Nhập thông tin đăng nhập của bạn để tiếp tục
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
              {/* Email Input */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-semibold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                  <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Email
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11 h-12 border-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 bg-slate-50 dark:bg-slate-800/50"
                    required
                    disabled={loading}
                    autoComplete="off"
                    autoSave="off"
                    data-form-type="other"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-semibold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                  <Lock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Mật khẩu
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors z-10" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 pr-11 h-12 border-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 bg-slate-50 dark:bg-slate-800/50"
                    required
                    disabled={loading}
                    minLength={6}
                    autoComplete="new-password"
                    autoSave="off"
                    data-form-type="other"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                disabled={loading || !email || !password}
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Đang đăng nhập...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-5 w-5" />
                    Đăng nhập
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <Badge variant="outline" className="text-xs px-4 py-1.5 border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <Shield className="h-3 w-3 mr-1.5 inline" />
            Bảo mật cao cấp • Admin Only
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;

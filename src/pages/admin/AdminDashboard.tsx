import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { 
  LogOut, 
  User, 
  Mail, 
  Shield, 
  BookOpen, 
  ShoppingCart, 
  Users, 
  DollarSign,
  TrendingUp,
  FileText,
  Package,
  Clock,
  CheckCircle2,
  Loader2,
  Moon,
  Sun,
  Truck,
  PenTool,
  Building2,
  Tag,
  Ticket,
  Languages,
  UserPen,
  FolderTree,
  CreditCard,
  MessageSquare
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats, type DashboardStats } from '../../services/adminService';
import { toast } from 'sonner';
import { useTheme } from '../../hooks/useTheme';

const AdminDashboard = () => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  // Load thống kê từ API
  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Error loading stats:', error);
        toast.error('Không thể tải thống kê');
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  // Format số tiền
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M₫`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K₫`;
    }
    return `${amount.toLocaleString('vi-VN')}₫`;
  };

  // Format số với dấu phẩy
  const formatNumber = (num: number) => {
    return num.toLocaleString('vi-VN');
  };

  const statsData = stats ? [
    {
      title: 'Tổng số sách',
      value: formatNumber(stats.totalSach),
      change: stats.changeSach,
      trend: 'up' as const,
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30'
    },
    {
      title: 'Tổng đơn hàng',
      value: formatNumber(stats.totalDonHang),
      change: stats.changeDonHang,
      trend: 'up' as const,
      icon: ShoppingCart,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/30'
    },
    {
      title: 'Khách hàng',
      value: formatNumber(stats.totalKhachHang),
      change: stats.changeKhachHang,
      trend: 'up' as const,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30'
    },
    {
      title: 'Doanh thu',
      value: formatCurrency(stats.totalDoanhThu),
      change: stats.changeDoanhThu,
      trend: 'up' as const,
      icon: DollarSign,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30'
    },
  ] : [];

  // Nhóm Quick Actions
  const quickActionGroups = [
    {
      title: 'Quản lý sách',
      description: 'Quản lý sách và danh mục',
      actions: [
        {
          title: 'Quản lý sách',
          description: 'Thêm, sửa, xóa sách trong hệ thống',
          icon: BookOpen,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50 dark:bg-blue-950/20',
          onClick: () => navigate('/admin/sach')
        },
        {
          title: 'Danh mục cha',
          description: 'Quản lý danh mục cha',
          icon: FolderTree,
          color: 'text-indigo-600',
          bgColor: 'bg-indigo-50 dark:bg-indigo-950/20',
          onClick: () => navigate('/admin/danhmuccha')
        },
        {
          title: 'Danh mục sách',
          description: 'Quản lý danh mục và thể loại',
          icon: Package,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50 dark:bg-purple-950/20',
          onClick: () => navigate('/admin/danhmuc')
        }
      ]
    },
    {
      title: 'Thông tin sách',
      description: 'Quản lý thông tin liên quan đến sách',
      actions: [
        {
          title: 'Tác giả',
          description: 'Quản lý tác giả sách',
          icon: PenTool,
          color: 'text-cyan-600',
          bgColor: 'bg-cyan-50 dark:bg-cyan-950/20',
          onClick: () => navigate('/admin/tacgia')
        },
        {
          title: 'Nhà xuất bản',
          description: 'Quản lý nhà xuất bản sách',
          icon: Building2,
          color: 'text-teal-600',
          bgColor: 'bg-teal-50 dark:bg-teal-950/20',
          onClick: () => navigate('/admin/nhaxuatban')
        },
        {
          title: 'Nhà cung cấp',
          description: 'Quản lý nhà cung cấp sách',
          icon: Truck,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50 dark:bg-orange-950/20',
          onClick: () => navigate('/admin/nhacungcap')
        },
        {
          title: 'Thương hiệu',
          description: 'Quản lý thương hiệu sách',
          icon: Tag,
          color: 'text-red-600',
          bgColor: 'bg-red-50 dark:bg-red-950/20',
          onClick: () => navigate('/admin/thuonghieu')
        },
        {
          title: 'Ngôn ngữ',
          description: 'Quản lý ngôn ngữ sách',
          icon: Languages,
          color: 'text-emerald-600',
          bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
          onClick: () => navigate('/admin/ngonngu')
        },
        {
          title: 'Người biên dịch',
          description: 'Quản lý người biên dịch sách',
          icon: UserPen,
          color: 'text-pink-600',
          bgColor: 'bg-pink-50 dark:bg-pink-950/20',
          onClick: () => navigate('/admin/nguoibiendich')
        },
        {
          title: 'Độ tuổi',
          description: 'Quản lý độ tuổi phù hợp cho sách',
          icon: Users,
          color: 'text-violet-600',
          bgColor: 'bg-violet-50 dark:bg-violet-950/20',
          onClick: () => navigate('/admin/dotuoi')
        }
      ]
    },
    {
      title: 'Khách hàng & Đơn hàng',
      description: 'Quản lý khách hàng và đơn hàng',
      actions: [
        {
          title: 'Quản lý khách hàng',
          description: 'Quản lý tài khoản khách hàng',
          icon: Users,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50 dark:bg-purple-950/20',
          onClick: () => navigate('/admin/khachhang')
        },
        {
          title: 'Quản lý đơn hàng',
          description: 'Xem và xử lý đơn hàng',
          icon: ShoppingCart,
          color: 'text-green-600',
          bgColor: 'bg-green-50 dark:bg-green-950/20',
          onClick: () => navigate('/admin/donhang')
        },
        {
          title: 'Quản lý đánh giá',
          description: 'Xem và quản lý đánh giá của khách hàng',
          icon: MessageSquare,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50 dark:bg-blue-950/20',
          onClick: () => navigate('/admin/danhgia')
        }
      ]
    },
    {
      title: 'Thanh toán & Vận chuyển',
      description: 'Quản lý phương thức thanh toán và giao hàng',
      actions: [
        {
          title: 'Phương thức thanh toán',
          description: 'Quản lý các phương thức thanh toán',
          icon: CreditCard,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50 dark:bg-blue-950/20',
          onClick: () => navigate('/admin/phuongthucthanhtoan')
        },
        {
          title: 'Phương thức giao hàng',
          description: 'Quản lý các phương thức vận chuyển',
          icon: Truck,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50 dark:bg-orange-950/20',
          onClick: () => navigate('/admin/phuongthucgiaohang')
        }
      ]
    },
    {
      title: 'Khuyến mãi',
      description: 'Quản lý voucher và khuyến mãi',
      actions: [
        {
          title: 'Quản lý voucher',
          description: 'Quản lý voucher và mã giảm giá',
          icon: Ticket,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
          onClick: () => navigate('/admin/voucher')
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Header */}
      <header className="border-b bg-white dark:bg-slate-900 sticky top-0 z-50 border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary shadow-md">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary">
                  Admin Dashboard
                </h1>
                <p className="text-xs text-slate-600 dark:text-slate-300 hidden sm:block">
                  Hệ thống quản lý
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {admin && (
                <div className="hidden md:flex items-center gap-3 rounded-lg border bg-card/50 dark:bg-card px-4 py-2.5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20 ring-2 ring-primary/10 dark:ring-primary/20">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div className="text-sm">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{admin.ten_hien_thi}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 truncate max-w-[200px]">{admin.email}</p>
                  </div>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTheme}
                className="text-slate-700 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 transition-all"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleLogout} 
                size="sm"
                className="text-slate-700 dark:text-slate-100 hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-300 dark:hover:border-red-800 hover:text-red-600 dark:hover:text-red-400 transition-all"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Đăng xuất</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <Card className="border shadow-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-2xl flex items-center gap-2 text-slate-900 dark:text-slate-100">
                    <Shield className="h-6 w-6 text-primary" />
                    Chào mừng trở lại!
                  </CardTitle>
                  <CardDescription className="text-base text-slate-600 dark:text-slate-300">
                    {admin ? `Xin chào, ${admin.ten_hien_thi}!` : 'Chào mừng đến với hệ thống quản lý'}
                  </CardDescription>
                </div>
                <Badge variant="default" className="ml-auto">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Online
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {admin && (
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="flex items-center gap-3 rounded-lg border bg-card p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                      <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Tên đăng nhập</p>
                      <p className="font-medium text-slate-900 dark:text-slate-100">{admin.ten_dang_nhap}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border bg-card p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                      <Mail className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Email</p>
                      <p className="font-medium truncate text-slate-900 dark:text-slate-100">{admin.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border bg-card p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                      <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">Vai trò</p>
                      <p className="font-medium text-slate-900 dark:text-slate-100">Administrator</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {loading ? (
            <div className="col-span-4 flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            statsData.map((stat, index) => (
              <Card key={index} className="border shadow-md hover:shadow-lg transition-all hover:scale-[1.02] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 min-h-[180px]">
              <CardHeader className="pb-6 pt-6">
                <div className="flex items-center justify-between">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <Badge variant={stat.trend === 'up' ? 'default' : 'secondary'} className="text-xs">
                    <TrendingUp className="mr-1 h-3 w-3" />
                    {stat.change}
                  </Badge>
                </div>
                <CardDescription className="mt-5 text-slate-600 dark:text-slate-300">{stat.title}</CardDescription>
                <CardTitle className="text-3xl font-bold mt-2 text-slate-900 dark:text-slate-100">{stat.value}</CardTitle>
              </CardHeader>
              <CardContent className="pt-2 pb-6">
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <Clock className="h-3 w-3" />
                  <span>Cập nhật vừa xong</span>
                </div>
              </CardContent>
            </Card>
          )))}
        </div>

        {/* Quick Actions - Nhóm theo từng section */}
        <div className="space-y-8">
          {quickActionGroups.map((group, groupIndex) => (
            <Card key={groupIndex} className="border shadow-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2 text-slate-900 dark:text-slate-100">
                  <FileText className="h-5 w-5" />
                  {group.title}
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-300">
                  {group.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {group.actions.map((action, index) => {
                    const Icon = action.icon!;
                    return (
                      <Button
                        key={index}
                        variant="outline"
                        onClick={action.onClick}
                        disabled={!action.onClick}
                        className="h-auto flex-col items-start p-6 hover:shadow-lg hover:border-primary/50 dark:hover:border-primary/30 hover:scale-[1.02] transition-all group bg-card hover:bg-accent/50 dark:hover:bg-accent/10 text-slate-900 dark:text-white"
                      >
                        <div className="flex items-start justify-between w-full mb-3">
                          <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${action.bgColor} group-hover:scale-110 group-hover:shadow-md transition-all duration-200`}>
                            <Icon className={`h-7 w-7 ${action.color}`} />
                          </div>
                        </div>
                        <div className="text-left w-full">
                          <span className="font-semibold text-base block mb-1.5 text-slate-900 dark:text-white group-hover:text-primary dark:group-hover:text-primary/80 transition-colors">
                            {action.title}
                          </span>
                          <span className="text-xs text-slate-600 block dark:text-slate-200 leading-relaxed">
                            {action.description}
                          </span>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;

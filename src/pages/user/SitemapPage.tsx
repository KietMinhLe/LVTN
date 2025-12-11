import { Link } from 'react-router-dom';
import { BookOpen, ShoppingCart, User, Info, HelpCircle } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';

const SitemapPage = () => {
  const sections = [
    {
      icon: BookOpen,
      title: 'Mua Sắm',
      links: [
        { label: 'Trang Chủ', path: '/' },
        { label: 'Tất Cả Sách', path: '/books' },
        { label: 'Danh Mục', path: '/categories' },
        { label: 'Sách Văn Học', path: '/books?category=van-hoc' },
        { label: 'Sách Kinh Tế', path: '/books?category=kinh-te' },
        { label: 'Sách Công Nghệ', path: '/books?category=cong-nghe' },
        { label: 'Sách Thiếu Nhi', path: '/books?category=thieu-nhi' }
      ],
      color: 'from-blue-500 to-cyan-600'
    },
    {
      icon: ShoppingCart,
      title: 'Tài Khoản & Đơn Hàng',
      links: [
        { label: 'Giỏ Hàng', path: '/cart' },
        { label: 'Thanh Toán', path: '/checkout' },
        { label: 'Đơn Hàng Của Tôi', path: '/orders' },
        { label: 'Hồ Sơ', path: '/profile' },
        { label: 'Cài Đặt', path: '/settings' }
      ],
      color: 'from-green-500 to-emerald-600'
    },
    {
      icon: User,
      title: 'Tài Khoản',
      links: [
        { label: 'Đăng Nhập', path: '/login' },
        { label: 'Đăng Ký', path: '/register' }
      ],
      color: 'from-purple-500 to-pink-600'
    },
    {
      icon: Info,
      title: 'Thông Tin',
      links: [
        { label: 'Về Chúng Tôi', path: '/about' },
        { label: 'Liên Hệ', path: '/contact' },
        { label: 'Tuyển Dụng', path: '/careers' },
        { label: 'Tin Tức', path: '/news' }
      ],
      color: 'from-orange-500 to-red-600'
    },
    {
      icon: HelpCircle,
      title: 'Hỗ Trợ',
      links: [
        { label: 'Câu Hỏi Thường Gặp', path: '/faq' },
        { label: 'Hướng Dẫn Mua Hàng', path: '/guide' },
        { label: 'Chính Sách Đổi Trả', path: '/return-policy' },
        { label: 'Chính Sách Bảo Mật', path: '/privacy' },
        { label: 'Điều Khoản Sử Dụng', path: '/terms' },
        { label: 'Sitemap', path: '/sitemap' }
      ],
      color: 'from-indigo-500 to-blue-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Sitemap
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Tìm đường đến mọi trang trên website của chúng tôi
          </p>
        </div>

        {/* Sitemap Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <Card key={index} className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center mb-4`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-slate-100">
                    {section.title}
                  </h2>
                  <ul className="space-y-2">
                    {section.links.map((link) => (
                      <li key={link.path}>
                        <Link
                          to={link.path}
                          className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors inline-block hover:translate-x-1 duration-200"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Search Box */}
        <Card className="mt-12 border-0 shadow-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Không Tìm Thấy Trang Bạn Cần?</h2>
            <p className="text-blue-100 mb-6 text-lg">
              Sử dụng thanh tìm kiếm hoặc liên hệ với chúng tôi để được hỗ trợ
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                to="/books"
                className="inline-block px-6 py-3 bg-white text-blue-600 rounded-md font-semibold hover:bg-blue-50 transition-colors"
              >
                Tìm Kiếm Sách
              </Link>
              <Link
                to="/contact"
                className="inline-block px-6 py-3 bg-white/20 text-white rounded-md font-semibold hover:bg-white/30 transition-colors border border-white/30"
              >
                Liên Hệ Hỗ Trợ
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SitemapPage;


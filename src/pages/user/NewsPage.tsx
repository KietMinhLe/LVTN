import { Calendar, User, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

const NewsPage = () => {
  const news = [
    {
      id: 1,
      title: 'BookStore Khai Trương Chi Nhánh Mới Tại Hà Nội',
      excerpt: 'Chúng tôi vui mừng thông báo khai trương chi nhánh mới tại trung tâm Hà Nội với hơn 5,000 đầu sách.',
      date: '15/01/2024',
      author: 'Admin',
      image: '/api/placeholder/400/250'
    },
    {
      id: 2,
      title: 'Chương Trình Khuyến Mãi Đặc Biệt Tháng 12',
      excerpt: 'Giảm giá lên đến 50% cho tất cả các đầu sách văn học và kinh tế trong tháng 12.',
      date: '01/12/2023',
      author: 'Admin',
      image: '/api/placeholder/400/250'
    },
    {
      id: 3,
      title: 'Ra Mắt Bộ Sách Mới: "Tủ Sách Tri Thức"',
      excerpt: 'Bộ sách gồm 20 cuốn về các chủ đề khoa học, lịch sử và văn hóa được chọn lọc kỹ lưỡng.',
      date: '20/11/2023',
      author: 'Admin',
      image: '/api/placeholder/400/250'
    },
    {
      id: 4,
      title: 'Hội Sách Online 2024 - Sự Kiện Lớn Nhất Năm',
      excerpt: 'Tham gia hội sách online với hàng ngàn đầu sách giảm giá và nhiều hoạt động thú vị.',
      date: '10/11/2023',
      author: 'Admin',
      image: '/api/placeholder/400/250'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Tin Tức & Sự Kiện
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Cập nhật những tin tức mới nhất từ BookStore
          </p>
        </div>

        {/* News Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {news.map((item) => (
            <Card key={item.id} className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 overflow-hidden group">
              <div className="h-48 bg-gradient-to-br from-blue-400 to-indigo-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
              </div>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {item.date}
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {item.author}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
                  {item.excerpt}
                </p>
                <Button variant="ghost" className="p-0 h-auto text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 group/btn">
                  Đọc thêm
                  <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Newsletter */}
        <Card className="mt-12 border-0 shadow-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Đăng Ký Nhận Tin</h2>
            <p className="text-blue-100 mb-6 text-lg">
              Nhận thông tin về sách mới, khuyến mãi và sự kiện đặc biệt
            </p>
            <div className="flex gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Nhập email của bạn"
                className="flex-1 px-4 py-2 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <Button variant="outline" className="bg-white text-blue-600 hover:bg-blue-50 border-0">
                Đăng Ký
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewsPage;


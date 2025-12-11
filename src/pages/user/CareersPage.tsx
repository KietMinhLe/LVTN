import { Briefcase, Users, TrendingUp, Heart } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

const CareersPage = () => {
  const positions = [
    {
      title: 'Nhân Viên Kinh Doanh',
      department: 'Kinh Doanh',
      location: 'TP. Hồ Chí Minh',
      type: 'Full-time',
      description: 'Tìm kiếm và phát triển khách hàng mới, chăm sóc khách hàng hiện tại.'
    },
    {
      title: 'Chuyên Viên Marketing',
      department: 'Marketing',
      location: 'TP. Hồ Chí Minh',
      type: 'Full-time',
      description: 'Xây dựng chiến lược marketing, quản lý mạng xã hội và các chiến dịch quảng cáo.'
    },
    {
      title: 'Nhân Viên Kho',
      department: 'Vận Hành',
      location: 'TP. Hồ Chí Minh',
      type: 'Full-time',
      description: 'Quản lý kho sách, đóng gói và vận chuyển đơn hàng.'
    },
    {
      title: 'Lập Trình Viên Frontend',
      department: 'Công Nghệ',
      location: 'Remote',
      type: 'Full-time',
      description: 'Phát triển và bảo trì giao diện website, tối ưu trải nghiệm người dùng.'
    }
  ];

  const benefits = [
    { icon: Heart, title: 'Môi Trường Làm Việc', desc: 'Thân thiện, năng động và sáng tạo' },
    { icon: TrendingUp, title: 'Phát Triển Sự Nghiệp', desc: 'Cơ hội thăng tiến và học hỏi không ngừng' },
    { icon: Users, title: 'Đồng Nghiệp', desc: 'Đội ngũ trẻ trung, nhiệt huyết' },
    { icon: Briefcase, title: 'Đãi Ngộ', desc: 'Lương cạnh tranh, bảo hiểm đầy đủ' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Tuyển Dụng
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Tham gia cùng chúng tôi xây dựng tương lai của ngành sách
          </p>
        </div>

        {/* Why Join Us */}
        <Card className="mb-12 border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <h2 className="text-3xl font-bold mb-6 text-center text-slate-900 dark:text-slate-100">
              Tại Sao Nên Làm Việc Tại BookStore?
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-bold mb-2 text-slate-900 dark:text-slate-100">{benefit.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{benefit.desc}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Open Positions */}
        <div>
          <h2 className="text-3xl font-bold mb-6 text-center text-slate-900 dark:text-slate-100">
            Vị Trí Đang Tuyển Dụng
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {positions.map((position, index) => (
              <Card key={index} className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-slate-100">
                        {position.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400">{position.department}</p>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                      {position.type}
                    </span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 mb-4">{position.description}</p>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-4">
                    <Briefcase className="h-4 w-4" />
                    {position.location}
                  </div>
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    Ứng Tuyển Ngay
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Card className="mt-12 border-0 shadow-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Không Tìm Thấy Vị Trí Phù Hợp?</h2>
            <p className="text-blue-100 mb-6 text-lg">
              Gửi CV của bạn cho chúng tôi, chúng tôi sẽ liên hệ khi có cơ hội phù hợp
            </p>
            <Button variant="outline" className="bg-white text-blue-600 hover:bg-blue-50 border-0">
              Gửi CV Tự Do
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CareersPage;


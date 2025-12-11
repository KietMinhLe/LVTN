import { Shield, Lock, Eye, FileText } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';

const PrivacyPage = () => {
  const sections = [
    {
      icon: FileText,
      title: 'Thông Tin Thu Thập',
      content: [
        'Thông tin cá nhân: Họ tên, email, số điện thoại, địa chỉ khi bạn đăng ký tài khoản hoặc đặt hàng.',
        'Thông tin thanh toán: Số thẻ, tài khoản ngân hàng (được mã hóa và bảo mật).',
        'Thông tin duyệt web: Cookie, địa chỉ IP, trình duyệt để cải thiện trải nghiệm người dùng.',
        'Thông tin đơn hàng: Lịch sử mua hàng, sở thích để đề xuất sách phù hợp.'
      ],
      color: 'from-blue-500 to-cyan-600'
    },
    {
      icon: Eye,
      title: 'Mục Đích Sử Dụng',
      content: [
        'Xử lý và giao hàng đơn đặt hàng của bạn.',
        'Gửi thông báo về đơn hàng, khuyến mãi và sách mới.',
        'Cải thiện dịch vụ và trải nghiệm mua sắm.',
        'Phân tích và thống kê để tối ưu hóa website.',
        'Tuân thủ các yêu cầu pháp lý và quy định.'
      ],
      color: 'from-green-500 to-emerald-600'
    },
    {
      icon: Lock,
      title: 'Bảo Mật Thông Tin',
      content: [
        'Mã hóa SSL/TLS cho mọi giao dịch trực tuyến.',
        'Không chia sẻ thông tin cá nhân với bên thứ ba không liên quan.',
        'Chỉ nhân viên được ủy quyền mới có quyền truy cập thông tin khách hàng.',
        'Thường xuyên cập nhật và nâng cấp hệ thống bảo mật.',
        'Lưu trữ dữ liệu tại các máy chủ an toàn với nhiều lớp bảo vệ.'
      ],
      color: 'from-purple-500 to-pink-600'
    },
    {
      icon: Shield,
      title: 'Quyền Của Khách Hàng',
      content: [
        'Quyền truy cập: Xem và chỉnh sửa thông tin cá nhân của bạn.',
        'Quyền xóa: Yêu cầu xóa tài khoản và dữ liệu cá nhân.',
        'Quyền từ chối: Từ chối nhận email marketing bất cứ lúc nào.',
        'Quyền khiếu nại: Khiếu nại nếu phát hiện vi phạm bảo mật.',
        'Quyền rút lại: Rút lại đồng ý xử lý dữ liệu bất cứ lúc nào.'
      ],
      color: 'from-orange-500 to-red-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 mb-4">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Chính Sách Bảo Mật Thông Tin
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Cam kết bảo vệ thông tin cá nhân của khách hàng
          </p>
        </div>

        {/* Introduction */}
        <Card className="mb-12 border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              BookStore cam kết bảo vệ quyền riêng tư và thông tin cá nhân của khách hàng. 
              Chính sách này mô tả cách chúng tôi thu thập, sử dụng và bảo vệ thông tin của bạn.
            </p>
            <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
              Bằng việc sử dụng website của chúng tôi, bạn đồng ý với các điều khoản trong chính sách này. 
              Nếu không đồng ý, vui lòng không sử dụng dịch vụ của chúng tôi.
            </p>
          </CardContent>
        </Card>

        {/* Sections */}
        <div className="space-y-8 mb-12">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <Card key={index} className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="flex items-start gap-6 mb-6">
                    <div className={`h-16 w-16 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                      {section.title}
                    </h2>
                  </div>
                  <ul className="space-y-3 ml-22">
                    {section.content.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-3">
                        <span className="text-slate-600 dark:text-slate-400 mt-1">•</span>
                        <span className="text-slate-700 dark:text-slate-300 text-lg leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Contact */}
        <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Câu Hỏi Về Bảo Mật?</h2>
            <p className="text-blue-100 mb-6 text-lg">
              Nếu bạn có bất kỳ câu hỏi nào về chính sách bảo mật, vui lòng liên hệ với chúng tôi
            </p>
            <a
              href="/contact"
              className="inline-block px-6 py-3 bg-white text-blue-600 rounded-md font-semibold hover:bg-blue-50 transition-colors"
            >
              Liên Hệ Chúng Tôi
            </a>
          </CardContent>
        </Card>

        {/* Last Updated */}
        <div className="mt-8 text-center text-slate-600 dark:text-slate-400">
          <p>Chính sách này được cập nhật lần cuối vào: <strong>01/01/2024</strong></p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;


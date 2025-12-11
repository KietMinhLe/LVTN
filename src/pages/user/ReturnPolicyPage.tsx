import { RefreshCw, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';

const ReturnPolicyPage = () => {
  const conditions = [
    {
      icon: CheckCircle,
      title: 'Điều Kiện Đổi Trả',
      items: [
        'Sách bị lỗi in ấn (sai chính tả, thiếu trang, in mờ)',
        'Sách không đúng với mô tả trên website',
        'Sách bị hư hỏng trong quá trình vận chuyển',
        'Sách không đúng với đơn đặt hàng'
      ],
      color: 'from-green-500 to-emerald-600'
    },
    {
      icon: AlertCircle,
      title: 'Không Được Đổi Trả',
      items: [
        'Sách đã bị rách, bẩn do lỗi của khách hàng',
        'Sách đã được sử dụng, có dấu hiệu đọc qua',
        'Quá thời hạn 7 ngày kể từ ngày nhận hàng',
        'Không có hóa đơn mua hàng'
      ],
      color: 'from-red-500 to-rose-600'
    }
  ];

  const process = [
    {
      step: 1,
      title: 'Liên Hệ',
      description: 'Gọi hotline 0123 456 789 hoặc gửi email đến info@bookstore.com để thông báo về việc đổi trả.'
    },
    {
      step: 2,
      title: 'Kiểm Tra',
      description: 'Chúng tôi sẽ kiểm tra và xác nhận điều kiện đổi trả của bạn trong vòng 24 giờ.'
    },
    {
      step: 3,
      title: 'Gửi Hàng',
      description: 'Đóng gói sách cẩn thận và gửi về địa chỉ của chúng tôi (phí vận chuyển sẽ được hoàn lại nếu lỗi từ phía chúng tôi).'
    },
    {
      step: 4,
      title: 'Xử Lý',
      description: 'Sau khi nhận được sách, chúng tôi sẽ xử lý đổi trả hoặc hoàn tiền trong vòng 3-5 ngày làm việc.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 mb-4">
            <RefreshCw className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Chính Sách Đổi Trả
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Cam kết đảm bảo quyền lợi của khách hàng
          </p>
        </div>

        {/* Overview */}
        <Card className="mb-12 border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <Clock className="h-8 w-8 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-slate-100">
                  Thời Gian Đổi Trả
                </h2>
                <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  Bạn có thể yêu cầu đổi trả sách trong vòng <strong>7 ngày</strong> kể từ ngày nhận hàng. 
                  Yêu cầu hoàn tiền sẽ được xử lý trong vòng <strong>3 ngày</strong> kể từ ngày nhận hàng.
                </p>
                <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                  Sau khi chúng tôi nhận được sách đổi trả, việc xử lý sẽ hoàn tất trong <strong>3-5 ngày làm việc</strong>.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conditions */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {conditions.map((condition, index) => {
            const Icon = condition.icon;
            return (
              <Card key={index} className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${condition.color} flex items-center justify-center mb-4`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-slate-100">
                    {condition.title}
                  </h3>
                  <ul className="space-y-2">
                    {condition.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-2">
                        <span className="text-slate-600 dark:text-slate-400 mt-1">•</span>
                        <span className="text-slate-700 dark:text-slate-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Process */}
        <Card className="mb-12 border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <h2 className="text-3xl font-bold mb-6 text-center text-slate-900 dark:text-slate-100">
              Quy Trình Đổi Trả
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {process.map((item) => (
                <div key={item.step} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white text-lg">
                      {item.step}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2 text-slate-900 dark:text-slate-100">
                      {item.title}
                    </h3>
                    <p className="text-slate-700 dark:text-slate-300">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Cần Hỗ Trợ Đổi Trả?</h2>
            <p className="text-blue-100 mb-6 text-lg">
              Liên hệ với chúng tôi để được hỗ trợ nhanh chóng và hiệu quả
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:+84123456789"
                className="inline-block px-6 py-3 bg-white text-blue-600 rounded-md font-semibold hover:bg-blue-50 transition-colors"
              >
                Gọi Hotline: 0123 456 789
              </a>
              <a
                href="/contact"
                className="inline-block px-6 py-3 bg-white/20 text-white rounded-md font-semibold hover:bg-white/30 transition-colors border border-white/30"
              >
                Gửi Email
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReturnPolicyPage;


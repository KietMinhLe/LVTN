import { ShoppingCart, CreditCard, Truck, CheckCircle, Search, User } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';

const GuidePage = () => {
  const steps = [
    {
      icon: Search,
      title: 'Tìm Kiếm Sách',
      description: 'Sử dụng thanh tìm kiếm hoặc duyệt theo danh mục để tìm cuốn sách bạn muốn mua.',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      icon: ShoppingCart,
      title: 'Thêm Vào Giỏ Hàng',
      description: 'Xem chi tiết sách và nhấn nút "Thêm vào giỏ hàng" để thêm sách vào giỏ của bạn.',
      color: 'from-green-500 to-emerald-600'
    },
    {
      icon: User,
      title: 'Đăng Nhập/Đăng Ký',
      description: 'Nếu chưa có tài khoản, bạn cần đăng ký. Nếu đã có tài khoản, đăng nhập để tiếp tục.',
      color: 'from-purple-500 to-pink-600'
    },
    {
      icon: CreditCard,
      title: 'Thanh Toán',
      description: 'Chọn phương thức thanh toán phù hợp (COD, chuyển khoản, thẻ tín dụng) và xác nhận đơn hàng.',
      color: 'from-orange-500 to-red-600'
    },
    {
      icon: Truck,
      title: 'Nhận Hàng',
      description: 'Theo dõi đơn hàng và nhận sách tại địa chỉ bạn đã cung cấp.',
      color: 'from-indigo-500 to-blue-600'
    },
    {
      icon: CheckCircle,
      title: 'Hoàn Tất',
      description: 'Kiểm tra sách, đánh giá sản phẩm và tận hưởng cuốn sách mới của bạn!',
      color: 'from-teal-500 to-green-600'
    }
  ];

  const tips = [
    'Đăng ký tài khoản để nhận thông báo về khuyến mãi và sách mới',
    'Kiểm tra thông tin sách kỹ trước khi đặt hàng (tác giả, nhà xuất bản, năm xuất bản)',
    'Sử dụng mã giảm giá nếu có để tiết kiệm chi phí',
    'Đơn hàng trên 500,000đ được miễn phí vận chuyển',
    'Theo dõi đơn hàng qua email hoặc tài khoản của bạn'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Hướng Dẫn Mua Hàng
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Hướng dẫn chi tiết từng bước để mua sách tại BookStore
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card
                key={index}
                className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300">
                      {index + 1}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-slate-100">
                    {step.title}
                  </h3>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tips Section */}
        <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <h2 className="text-3xl font-bold mb-6 text-center text-slate-900 dark:text-slate-100">
              Mẹo Mua Hàng
            </h2>
            <ul className="space-y-4 max-w-2xl mx-auto">
              {tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-slate-700 dark:text-slate-300 text-lg">{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="mt-12 border-0 shadow-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Cần Hỗ Trợ Thêm?</h2>
            <p className="text-blue-100 mb-6 text-lg">
              Nếu bạn gặp khó khăn trong quá trình mua hàng, đừng ngần ngại liên hệ với chúng tôi
            </p>
            <a
              href="/contact"
              className="inline-block px-6 py-3 bg-white text-blue-600 rounded-md font-semibold hover:bg-blue-50 transition-colors"
            >
              Liên Hệ Hỗ Trợ
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GuidePage;


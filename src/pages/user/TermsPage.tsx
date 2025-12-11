import { FileText, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';

const TermsPage = () => {
  const terms = [
    {
      icon: CheckCircle,
      title: 'Điều Khoản Sử Dụng',
      content: [
        'Bạn phải đủ 18 tuổi hoặc có sự đồng ý của người giám hộ để sử dụng dịch vụ.',
        'Thông tin bạn cung cấp phải chính xác và đầy đủ.',
        'Bạn không được sử dụng website cho mục đích bất hợp pháp.',
        'Bạn chịu trách nhiệm bảo mật tài khoản và mật khẩu của mình.',
        'Chúng tôi có quyền từ chối phục vụ nếu phát hiện hành vi vi phạm.'
      ],
      color: 'from-blue-500 to-cyan-600'
    },
    {
      icon: AlertTriangle,
      title: 'Quyền Sở Hữu Trí Tuệ',
      content: [
        'Tất cả nội dung trên website (logo, hình ảnh, văn bản) thuộc quyền sở hữu của BookStore.',
        'Khách hàng không được sao chép, phân phối hoặc sử dụng nội dung mà không có sự cho phép.',
        'Mọi vi phạm bản quyền sẽ bị xử lý theo quy định pháp luật.',
        'Sách được bán là bản quyền chính thức từ nhà xuất bản.',
        'Khách hàng chỉ được sử dụng sách cho mục đích cá nhân, không được sao chép để bán lại.'
      ],
      color: 'from-orange-500 to-red-600'
    },
    {
      icon: XCircle,
      title: 'Giới Hạn Trách Nhiệm',
      content: [
        'Chúng tôi không chịu trách nhiệm về thiệt hại gián tiếp phát sinh từ việc sử dụng dịch vụ.',
        'Chúng tôi không đảm bảo website luôn hoạt động không gián đoạn.',
        'Giá cả và thông tin sách có thể thay đổi mà không cần thông báo trước.',
        'Chúng tôi không chịu trách nhiệm về nội dung của các website liên kết bên ngoài.',
        'Trong trường hợp bất khả kháng, chúng tôi không chịu trách nhiệm về việc giao hàng chậm trễ.'
      ],
      color: 'from-red-500 to-rose-600'
    },
    {
      icon: FileText,
      title: 'Giải Quyết Tranh Chấp',
      content: [
        'Mọi tranh chấp sẽ được giải quyết thông qua thương lượng hòa bình.',
        'Nếu không thể thương lượng, tranh chấp sẽ được giải quyết tại Tòa án có thẩm quyền tại TP. Hồ Chí Minh.',
        'Luật pháp Việt Nam sẽ được áp dụng để giải quyết mọi tranh chấp.',
        'Khách hàng có quyền khiếu nại đến cơ quan bảo vệ người tiêu dùng.',
        'Chúng tôi cam kết xử lý mọi khiếu nại một cách công bằng và minh bạch.'
      ],
      color: 'from-purple-500 to-pink-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 mb-4">
            <FileText className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Điều Khoản Sử Dụng
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Vui lòng đọc kỹ các điều khoản trước khi sử dụng dịch vụ
          </p>
        </div>

        {/* Introduction */}
        <Card className="mb-12 border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Chào mừng bạn đến với BookStore. Bằng việc truy cập và sử dụng website này, 
              bạn đồng ý tuân thủ các điều khoản và điều kiện được nêu dưới đây.
            </p>
            <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
              Nếu bạn không đồng ý với bất kỳ điều khoản nào, vui lòng không sử dụng dịch vụ của chúng tôi. 
              Chúng tôi có quyền cập nhật các điều khoản này bất cứ lúc nào.
            </p>
          </CardContent>
        </Card>

        {/* Terms Sections */}
        <div className="space-y-8 mb-12">
          {terms.map((term, index) => {
            const Icon = term.icon;
            return (
              <Card key={index} className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="flex items-start gap-6 mb-6">
                    <div className={`h-16 w-16 rounded-xl bg-gradient-to-br ${term.color} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                      {term.title}
                    </h2>
                  </div>
                  <ul className="space-y-3 ml-22">
                    {term.content.map((item, itemIndex) => (
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

        {/* Acceptance */}
        <Card className="mb-12 border-0 shadow-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Đồng Ý Với Điều Khoản</h2>
            <p className="text-green-100 mb-6 text-lg">
              Bằng việc sử dụng dịch vụ của chúng tôi, bạn xác nhận rằng bạn đã đọc, hiểu và đồng ý với tất cả các điều khoản trên.
            </p>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-slate-100">Câu Hỏi Về Điều Khoản?</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6 text-lg">
              Nếu bạn có bất kỳ câu hỏi nào về điều khoản sử dụng, vui lòng liên hệ với chúng tôi
            </p>
            <a
              href="/contact"
              className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-md font-semibold hover:from-blue-700 hover:to-indigo-700 transition-colors"
            >
              Liên Hệ Chúng Tôi
            </a>
          </CardContent>
        </Card>

        {/* Last Updated */}
        <div className="mt-8 text-center text-slate-600 dark:text-slate-400">
          <p>Điều khoản này được cập nhật lần cuối vào: <strong>01/01/2024</strong></p>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;


import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      category: 'Đặt Hàng & Thanh Toán',
      questions: [
        {
          q: 'Làm thế nào để đặt hàng?',
          a: 'Bạn có thể đặt hàng trực tuyến trên website bằng cách thêm sách vào giỏ hàng và tiến hành thanh toán. Hoặc gọi điện trực tiếp đến hotline 0123 456 789.'
        },
        {
          q: 'Các phương thức thanh toán nào được chấp nhận?',
          a: 'Chúng tôi chấp nhận thanh toán bằng tiền mặt khi nhận hàng (COD), chuyển khoản ngân hàng, thẻ tín dụng/ghi nợ, và ví điện tử.'
        },
        {
          q: 'Tôi có thể đổi phương thức thanh toán sau khi đặt hàng không?',
          a: 'Bạn có thể liên hệ với chúng tôi trong vòng 2 giờ sau khi đặt hàng để thay đổi phương thức thanh toán.'
        }
      ]
    },
    {
      category: 'Vận Chuyển & Giao Hàng',
      questions: [
        {
          q: 'Phí vận chuyển là bao nhiêu?',
          a: 'Phí vận chuyển phụ thuộc vào địa chỉ giao hàng và trọng lượng đơn hàng. Đơn hàng trên 500,000đ được miễn phí vận chuyển trong nội thành.'
        },
        {
          q: 'Thời gian giao hàng là bao lâu?',
          a: 'Đối với đơn hàng trong nội thành: 1-2 ngày. Đơn hàng tỉnh: 3-5 ngày. Đơn hàng vùng sâu vùng xa: 5-7 ngày làm việc.'
        },
        {
          q: 'Tôi có thể theo dõi đơn hàng không?',
          a: 'Có, sau khi đơn hàng được xác nhận, bạn sẽ nhận được mã vận đơn để theo dõi trực tuyến trên website.'
        }
      ]
    },
    {
      category: 'Đổi Trả & Hoàn Tiền',
      questions: [
        {
          q: 'Chính sách đổi trả như thế nào?',
          a: 'Bạn có thể đổi trả sách trong vòng 7 ngày kể từ ngày nhận hàng nếu sách bị lỗi in ấn, thiếu trang, hoặc không đúng với mô tả.'
        },
        {
          q: 'Tôi có thể hoàn tiền không?',
          a: 'Có, bạn có thể yêu cầu hoàn tiền trong vòng 3 ngày kể từ ngày nhận hàng nếu sách không đúng với đơn đặt hàng.'
        },
        {
          q: 'Ai chịu phí vận chuyển khi đổi trả?',
          a: 'Nếu sách bị lỗi từ phía chúng tôi, chúng tôi sẽ chịu toàn bộ phí vận chuyển. Nếu đổi trả do lý do khác, khách hàng chịu phí vận chuyển.'
        }
      ]
    },
    {
      category: 'Sản Phẩm & Dịch Vụ',
      questions: [
        {
          q: 'Sách có đảm bảo chính hãng không?',
          a: 'Tất cả sách tại BookStore đều là sách chính hãng từ các nhà xuất bản uy tín. Chúng tôi cam kết không bán sách lậu, sách in lậu.'
        },
        {
          q: 'Tôi có thể xem trước nội dung sách không?',
          a: 'Một số sách có bản đọc thử (preview) trên trang chi tiết sách. Bạn có thể xem một vài trang đầu để quyết định mua.'
        },
        {
          q: 'Có chương trình khuyến mãi thường xuyên không?',
          a: 'Chúng tôi thường xuyên có các chương trình khuyến mãi, giảm giá đặc biệt. Đăng ký nhận tin để không bỏ lỡ các ưu đãi.'
        }
      ]
    }
  ];

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 mb-4">
            <HelpCircle className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Câu Hỏi Thường Gặp
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Tìm câu trả lời cho những thắc mắc của bạn
          </p>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-8">
          {faqs.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">
                {category.category}
              </h2>
              <div className="space-y-4">
                {category.questions.map((faq, faqIndex) => {
                  const index = categoryIndex * 100 + faqIndex;
                  const isOpen = openIndex === index;
                  return (
                    <Card
                      key={faqIndex}
                      className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm hover:shadow-xl transition-shadow"
                    >
                      <CardContent className="p-0">
                        <button
                          onClick={() => toggleQuestion(index)}
                          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <span className="font-semibold text-slate-900 dark:text-slate-100 pr-4">
                            {faq.q}
                          </span>
                          {isOpen ? (
                            <ChevronUp className="h-5 w-5 text-slate-600 dark:text-slate-400 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-slate-600 dark:text-slate-400 flex-shrink-0" />
                          )}
                        </button>
                        {isOpen && (
                          <div className="px-6 pb-4 pt-0">
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                              {faq.a}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <Card className="mt-12 border-0 shadow-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Vẫn Còn Thắc Mắc?</h2>
            <p className="text-blue-100 mb-6 text-lg">
              Liên hệ với chúng tôi, chúng tôi sẽ giải đáp mọi thắc mắc của bạn
            </p>
            <a
              href="/contact"
              className="inline-block px-6 py-3 bg-white text-blue-600 rounded-md font-semibold hover:bg-blue-50 transition-colors"
            >
              Liên Hệ Ngay
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FAQPage;


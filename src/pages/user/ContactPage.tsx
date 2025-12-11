import { useState } from 'react';
import { Mail, Phone, MapPin, Send, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.');
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Liên Hệ Với Chúng Tôi
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl">Thông Tin Liên Hệ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-slate-900 dark:text-slate-100">Địa Chỉ</h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      123 Đường ABC, Quận XYZ<br />
                      TP. Hồ Chí Minh, Việt Nam
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-slate-900 dark:text-slate-100">Điện Thoại</h3>
                    <a href="tel:+84123456789" className="text-blue-600 dark:text-blue-400 hover:underline">
                      0123 456 789
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-slate-900 dark:text-slate-100">Email</h3>
                    <a href="mailto:info@bookstore.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                      info@bookstore.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 text-slate-900 dark:text-slate-100">Giờ Làm Việc</h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      Thứ 2 - Thứ 6: 8:00 - 18:00<br />
                      Thứ 7 - Chủ nhật: 9:00 - 17:00
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Gửi Tin Nhắn</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">
                    Họ và Tên *
                  </label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Nguyễn Văn A"
                    className="h-11"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">
                    Email *
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="example@email.com"
                    className="h-11"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">
                    Số Điện Thoại
                  </label>
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="0123 456 789"
                    className="h-11"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">
                    Chủ Đề *
                  </label>
                  <Input
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="Tiêu đề tin nhắn"
                    className="h-11"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-900 dark:text-slate-100">
                    Nội Dung *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    placeholder="Nhập nội dung tin nhắn của bạn..."
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Gửi Tin Nhắn
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;


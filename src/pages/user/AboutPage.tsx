import { BookOpen, Users, Award, Heart } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Về Chúng Tôi
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            BookStore - Cửa hàng sách trực tuyến hàng đầu Việt Nam
          </p>
        </div>

        {/* Mission Section */}
        <Card className="mb-8 border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-slate-100">
                  Sứ Mệnh Của Chúng Tôi
                </h2>
                <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  BookStore được thành lập với sứ mệnh mang tri thức đến mọi người. Chúng tôi tin rằng sách là người bạn đồng hành tốt nhất trong hành trình phát triển bản thân và mở rộng tầm nhìn.
                </p>
                <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                  Với hơn 10.000 đầu sách đa dạng từ văn học, kinh tế, khoa học đến sách thiếu nhi, chúng tôi cam kết mang đến những cuốn sách chất lượng với giá cả hợp lý nhất.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Values Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-slate-100">
                Chất Lượng
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Chúng tôi chỉ cung cấp những cuốn sách chính hãng, chất lượng cao từ các nhà xuất bản uy tín.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-slate-100">
                Khách Hàng
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Khách hàng là trung tâm của mọi hoạt động. Chúng tôi luôn lắng nghe và cải thiện dịch vụ.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-slate-100">
                Đam Mê
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Chúng tôi đam mê sách và muốn lan tỏa tình yêu đọc sách đến mọi người.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <CardContent className="p-8">
            <h2 className="text-3xl font-bold mb-8 text-center">Thành Tựu Của Chúng Tôi</h2>
            <div className="grid md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-4xl font-bold mb-2">10,000+</div>
                <div className="text-blue-100">Đầu Sách</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">50,000+</div>
                <div className="text-blue-100">Khách Hàng</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">100,000+</div>
                <div className="text-blue-100">Đơn Hàng</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">98%</div>
                <div className="text-blue-100">Hài Lòng</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AboutPage;


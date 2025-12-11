import { Link } from "react-router-dom";
import {
  BookOpen,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
} from "lucide-react";
import React from "react";

const Footer: React.FC = () => {
  const currentYear: number = new Date().getFullYear();

  const footerLinks: Record<
    string,
    { label: string; path: string }[]
  > = {
    company: [
      { label: "Về chúng tôi", path: "/about" },
      { label: "Liên hệ", path: "/contact" },
      { label: "Tuyển dụng", path: "/careers" },
      { label: "Tin tức", path: "/news" },
    ],
    support: [
      { label: "Câu hỏi thường gặp", path: "/faq" },
      { label: "Hướng dẫn mua hàng", path: "/guide" },
      { label: "Chính sách đổi trả", path: "/return-policy" },
      { label: "Bảo mật thông tin", path: "/privacy" },
    ],
    categories: [
      { label: "Sách văn học", path: "/books?category=van-hoc" },
      { label: "Sách kinh tế", path: "/books?category=kinh-te" },
      { label: "Sách công nghệ", path: "/books?category=cong-nghe" },
      { label: "Sách thiếu nhi", path: "/books?category=thieu-nhi" },
    ],
  };

  return (
    <footer className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 border-t-4 border-yellow-400 text-white shadow-2xl">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <Link to="/" className="flex items-center space-x-3 mb-4 group">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white text-amber-500 shadow-2xl shadow-black/50 transition-transform duration-300 group-hover:scale-110 group-hover:shadow-3xl group-hover:shadow-black/60 ring-4 ring-white/30">
                <BookOpen className="h-8 w-8" />
              </div>
              <span className="text-3xl font-black text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8), 0 0 10px rgba(255,255,255,0.3)' }}>
                BookStore
              </span>
            </Link>
            <p className="text-base mb-4 leading-relaxed text-white font-semibold" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
              Cửa hàng sách trực tuyến hàng đầu Việt Nam.
              <br />
              Chúng tôi cam kết mang đến những cuốn sách chất lượng với giá cả hợp lý.
            </p>
            <div className="flex space-x-3">
              <a
                href="#"
                className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white text-white hover:text-amber-500 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-110"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" style={{ color: '#ffffff' }} />
              </a>
              <a
                href="#"
                className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white text-white hover:text-amber-500 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-110"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" style={{ color: '#ffffff' }} />
              </a>
              <a
                href="#"
                className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white text-white hover:text-amber-500 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-110"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" style={{ color: '#ffffff' }} />
              </a>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-white font-black mb-4 text-2xl border-b-4 border-white/70 pb-2 inline-block" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7), 0 0 8px rgba(255,255,255,0.3)' }}>Về chúng tôi</h3>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-base text-white hover:text-yellow-200 hover:font-black transition-all duration-200 inline-block hover:translate-x-2 hover:underline font-semibold"
                    style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.6)', color: '#ffffff' }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-white font-black mb-4 text-2xl border-b-4 border-white/70 pb-2 inline-block" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7), 0 0 8px rgba(255,255,255,0.3)' }}>Hỗ trợ</h3>
            <ul className="space-y-2.5">
              {footerLinks.support.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-base text-white hover:text-yellow-200 hover:font-black transition-all duration-200 inline-block hover:translate-x-2 hover:underline font-semibold"
                    style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.6)', color: '#ffffff' }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-black mb-4 text-2xl border-b-4 border-white/70 pb-2 inline-block" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7), 0 0 8px rgba(255,255,255,0.3)' }}>Liên hệ</h3>
            <ul className="space-y-3.5">
              <li className="flex items-start gap-3 group">
                <div className="h-12 w-12 rounded-lg bg-white/40 backdrop-blur-sm flex items-center justify-center group-hover:bg-white transition-colors duration-200 shrink-0 shadow-xl ring-2 ring-white/30">
                  <MapPin className="h-6 w-6 text-white group-hover:text-amber-500 transition-colors" />
                </div>
                <span className="text-base text-white leading-relaxed font-semibold" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.6)' }}>
                  123 Đường ABC, Quận XYZ
                  <br />
                  TP. Hồ Chí Minh, Việt Nam
                </span>
              </li>
              <li className="flex items-center gap-3 group">
                <div className="h-12 w-12 rounded-lg bg-white/40 backdrop-blur-sm flex items-center justify-center group-hover:bg-white transition-colors duration-200 shrink-0 shadow-xl ring-2 ring-white/30">
                  <Phone className="h-6 w-6 text-white group-hover:text-amber-500 transition-colors" />
                </div>
                <a
                  href="tel:+84123456789"
                  className="text-base text-white hover:text-yellow-200 hover:font-black transition-all duration-200 font-semibold"
                  style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.6)', color: '#ffffff' }}
                >
                  0123 456 789
                </a>
              </li>
              <li className="flex items-center gap-3 group">
                <div className="h-12 w-12 rounded-lg bg-white/40 backdrop-blur-sm flex items-center justify-center group-hover:bg-white transition-colors duration-200 shrink-0 shadow-xl ring-2 ring-white/30">
                  <Mail className="h-6 w-6 text-white group-hover:text-amber-500 transition-colors" />
                </div>
                <a
                  href="mailto:info@bookstore.com"
                  className="text-base text-white hover:text-yellow-200 hover:font-black transition-all duration-200 font-semibold"
                  style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.6)', color: '#ffffff' }}
                >
                  info@bookstore.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t-2 border-white/60 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-base text-white text-center md:text-left font-semibold" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.6)' }}>
              © {currentYear} <span className="font-black text-yellow-200" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8), 0 0 10px rgba(255,255,0,0.4)' }}>BookStore</span>. Tất cả quyền được bảo lưu.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-base">
              <Link
                to="/privacy"
                className="text-white hover:text-yellow-200 hover:font-black transition-all duration-200 font-semibold"
                style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.6)', color: '#ffffff' }}
              >
                Chính sách bảo mật
              </Link>
              <span className="text-white/70">•</span>
              <Link
                to="/terms"
                className="text-white hover:text-yellow-200 hover:font-black transition-all duration-200 font-semibold"
                style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.6)', color: '#ffffff' }}
              >
                Điều khoản sử dụng
              </Link>
              <span className="text-white/70">•</span>
              <Link
                to="/sitemap"
                className="text-white hover:text-yellow-200 hover:font-black transition-all duration-200 font-semibold"
                style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.6)', color: '#ffffff' }}
              >
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

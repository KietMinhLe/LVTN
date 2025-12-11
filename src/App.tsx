import { useEffect } from 'react';
import { Toaster } from 'sonner';
import UserTrangChu from './pages/user/UserTrangChu';
import UserSach from './pages/user/UserSach';
import UserChiTietSach from './pages/user/UserChiTietSach';
import UserDanhMuc from './pages/user/UserDanhMuc';
import UserKhongTimThay from './pages/user/UserKhongTimThay';
import UserLogin from './pages/user/UserLogin';
import UserRegister from './pages/user/UserRegister';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminQuanLySach from './pages/admin/AdminQuanLySach';
import AdminQuanLyDanhMuc from './pages/admin/AdminQuanLyDanhMuc';
import AdminQuanLyKhachHang from './pages/admin/AdminQuanLyKhachHang';
import AdminQuanLyNhaCungCap from './pages/admin/AdminQuanLyNhaCungCap';
import AdminQuanLyTacGia from './pages/admin/AdminQuanLyTacGia';
import AdminQuanLyThuongHieu from './pages/admin/AdminQuanLyThuongHieu';
import AdminQuanLyNhaXuatBan from './pages/admin/AdminQuanLyNhaXuatBan';
import AdminVourcher from './pages/admin/AdminVourcher';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/layout/Layout';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthProvider';
import { UserAuthProvider } from './contexts/UserAuthProvider';
import { CartProvider } from './contexts/CartContext.tsx';
import AdminQuanLyNgonNgu from './pages/admin/AdminQuanLyNgonNgu';
import AdminQuanLyDoTuoi from './pages/admin/AdminQuanLyDoTuoi';
import AdminQuanLyNguoiBienDich from './pages/admin/AdminQuanLyNguoiBienDich';
import AdminQuanLyDanhMucCha from './pages/admin/AdminQuanLyDanhMucCha';
import AdminQuanLyPhuongThucThanhToan from './pages/admin/AdminQuanLyPhuongThucThanhToan';
import AdminQuanLyPhuongThucGiaoHang from './pages/admin/AdminQuanLyPhuongThucGiaoHang';
import AdminDonHang from './pages/admin/AdminDonHang';
import AdminQuanLyDanhGia from './pages/admin/AdminQuanLyDanhGia';
import UserGioHang from './pages/user/UserGioHang';
import UserThanhToan from './pages/user/UserThanhToan';
import UserProfile from './pages/user/UserProfile';
import UserOrders from './pages/user/UserOrders';
import UserSettings from './pages/user/UserSettings';
import VnpayPayment from './pages/user/VnpayPayment';
import SepayPayment from './pages/user/SepayPayment';
import AboutPage from './pages/user/AboutPage';
import ContactPage from './pages/user/ContactPage';
import CareersPage from './pages/user/CareersPage';
import NewsPage from './pages/user/NewsPage';
import FAQPage from './pages/user/FAQPage';
import GuidePage from './pages/user/GuidePage';
import ReturnPolicyPage from './pages/user/ReturnPolicyPage';
import PrivacyPage from './pages/user/PrivacyPage';
import TermsPage from './pages/user/TermsPage';
import SitemapPage from './pages/user/SitemapPage';
import ChatBot from './components/ChatBot';

// Component để scroll to top khi route thay đổi
const ScrollToTopOnRouteChange = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Scroll lên đầu trang ngay lập tức khi route thay đổi
    window.scrollTo(0, 0);
  }, [pathname, search]);

  return null;
};

function App() {
  return (
    // Provider quản lý authentication state
    <AuthProvider>
      <UserAuthProvider>
        <CartProvider>
          <Toaster 
            position="bottom-right"
            expand={true}
            richColors={true}
            closeButton={true}
            gap={12}
            offset={20}
            toastOptions={{
              duration: 5000,
            }}
          />
          <ChatBot />
          <BrowserRouter>
          <ScrollToTopOnRouteChange />
          <Routes>
            {/* User Authentication Routes */}
            <Route path="/login" element={<UserLogin />} />
            <Route path="/register" element={<UserRegister />} />
            
            {/* User Routes with Layout */} 
            <Route
              path="/"
              element={
                <Layout> 
                  <UserTrangChu />
                </Layout>
              }
            /> 
            <Route
              path="/books" 
              element={
                <Layout> 
                  <UserSach />
                </Layout>
              }
            /> 
            <Route
              path="/books/:id" 
              element={
                <Layout> 
                  <UserChiTietSach />
                </Layout>
              }
            /> 
            <Route
              path="/categories" 
              element={
                <Layout> 
                  <UserDanhMuc />
                </Layout>
              }
            /> 
            <Route
              path="/cart" 
              element={
                <Layout> 
                  <UserGioHang />
                </Layout>
              }
            /> 
            <Route
              path="/checkout" 
              element={
                <Layout> 
                  <UserThanhToan />
                </Layout>
              }
            /> 
            <Route
              path="/profile" 
              element={
                <Layout> 
                  <UserProfile />
                </Layout>
              }
            /> 
            <Route
              path="/orders" 
              element={
                <Layout> 
                  <UserOrders />
                </Layout>
              }
            />
            <Route
              path="/settings" 
              element={
                <Layout> 
                  <UserSettings />
                </Layout>
              }
            />
            <Route
              path="/vnpay-payment" 
              element={
                <Layout> 
                  <VnpayPayment />
                </Layout>
              }
            />
            <Route
              path="/sepay-payment" 
              element={
                <Layout> 
                  <SepayPayment />
                </Layout>
              }
            />
            <Route
              path="/about"
              element={
                <Layout>
                  <AboutPage />
                </Layout>
              }
            />
            <Route
              path="/contact"
              element={
                <Layout>
                  <ContactPage />
                </Layout>
              }
            />
            <Route
              path="/careers"
              element={
                <Layout>
                  <CareersPage />
                </Layout>
              }
            />
            <Route
              path="/news"
              element={
                <Layout>
                  <NewsPage />
                </Layout>
              }
            />
            <Route
              path="/faq"
              element={
                <Layout>
                  <FAQPage />
                </Layout>
              }
            />
            <Route
              path="/guide"
              element={
                <Layout>
                  <GuidePage />
                </Layout>
              }
            />
            <Route
              path="/return-policy"
              element={
                <Layout>
                  <ReturnPolicyPage />
                </Layout>
              }
            />
            <Route
              path="/privacy"
              element={
                <Layout>
                  <PrivacyPage />
                </Layout>
              }
            />
            <Route
              path="/terms"
              element={
                <Layout>
                  <TermsPage />
                </Layout>
              }
            />
            <Route
              path="/sitemap"
              element={
                <Layout>
                  <SitemapPage />
                </Layout>
              }
            />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLoginPage />} /> 
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard /> 
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/sach" 
            element={
              <ProtectedRoute>
                <AdminQuanLySach />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/danhmuc" 
            element={
              <ProtectedRoute>
                <AdminQuanLyDanhMuc />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/khachhang" 
            element={
              <ProtectedRoute>
                <AdminQuanLyKhachHang />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/danhmuccha"
            element={
              <ProtectedRoute>
                <AdminQuanLyDanhMucCha />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/ngonngu"
            element={
              <ProtectedRoute>
                <AdminQuanLyNgonNgu />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dotuoi"
            element={
              <ProtectedRoute>
                <AdminQuanLyDoTuoi />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/nguoibiendich"
            element={
              <ProtectedRoute>
                <AdminQuanLyNguoiBienDich />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/nhacungcap"
            element={
              <ProtectedRoute>
                <AdminQuanLyNhaCungCap />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tacgia"
            element={
              <ProtectedRoute>
                <AdminQuanLyTacGia />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/thuonghieu"
            element={
              <ProtectedRoute>
                <AdminQuanLyThuongHieu />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/nhaxuatban"
            element={
              <ProtectedRoute>
                <AdminQuanLyNhaXuatBan />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/voucher"
            element={
              <ProtectedRoute>
                <AdminVourcher />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/phuongthucthanhtoan"
            element={
              <ProtectedRoute>
                <AdminQuanLyPhuongThucThanhToan />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/phuongthucgiaohang"
            element={
              <ProtectedRoute>
                <AdminQuanLyPhuongThucGiaoHang />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/donhang"
            element={
              <ProtectedRoute>
                <AdminDonHang />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/danhgia"
            element={
              <ProtectedRoute>
                <AdminQuanLyDanhGia />
              </ProtectedRoute>
            }
          />
          
          {/* Redirect /admin to /admin/login */}
          <Route path="/admin" element={<Navigate to="/admin/login" replace />} /> 
          
          {/* 404 - Standalone page without Layout */}
          <Route
            path="*"
            element={<UserKhongTimThay />}
          />
        </Routes>
      </BrowserRouter>
      </CartProvider>
      </UserAuthProvider>
    </AuthProvider>
  );
}

export default App;
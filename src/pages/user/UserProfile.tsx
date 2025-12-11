import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserAuth } from '../../hooks/useUserAuth';
import { getKhachHangById } from '../../services/khachHangService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Award
} from 'lucide-react';
import { toast } from 'sonner';

const UserProfile = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useUserAuth();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    ho_ten: '',
    email: '',
    so_dien_thoai: '',
    ngay_sinh: '',
    diem_fpoint: 0
  });

  const loadProfile = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const data = await getKhachHangById(user.id);
      setProfileData({
        ho_ten: data.ho_ten || '',
        email: data.email || '',
        so_dien_thoai: data.so_dien_thoai || '',
        ngay_sinh: data.ngay_sinh ? data.ngay_sinh.split('T')[0] : '',
        diem_fpoint: data.diem_fpoint || 0
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Không thể tải thông tin tài khoản');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadProfile();
  }, [isAuthenticated, navigate, loadProfile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)} 
            className="mb-4 hover:bg-blue-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl shadow-sm">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              Hồ sơ của tôi
            </h1>
          </div>
          <p className="text-gray-600 text-lg ml-16">Quản lý thông tin cá nhân và tài khoản của bạn</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-2 border-blue-200/70 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white overflow-hidden !pt-0 rounded-xl">
              <CardHeader className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white !pt-5 pb-5 px-6 shadow-lg">
                <CardTitle className="flex items-center gap-3 text-white text-xl font-bold">
                  <div className="p-2.5 bg-white/25 rounded-xl backdrop-blur-sm shadow-md">
                    <User className="h-6 w-6" />
                  </div>
                  Thông tin cá nhân
                </CardTitle>
                <CardDescription className="text-blue-100 mt-2 text-base">
                  Cập nhật thông tin cá nhân của bạn
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 pb-6">
                <div className="space-y-5">
                  <div>
                    <label className="text-sm font-semibold mb-2.5 text-gray-800 flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-600" />
                      Họ và tên
                    </label>
                    <Input
                      value={profileData.ho_ten}
                      disabled
                      className="h-12 border-2 border-gray-200 bg-gray-50 text-gray-600 rounded-lg cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1 bg-blue-50 p-2 rounded-lg border border-blue-200">
                      <User className="h-3 w-3 text-blue-600" />
                      Để thay đổi tên, vui lòng vào trang <strong>Cài đặt</strong>
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-semibold mb-2.5 text-gray-800 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-blue-600" />
                      Email
                    </label>
                    <Input
                      type="email"
                      value={profileData.email}
                      disabled
                      className="h-12 border-2 border-gray-200 bg-gray-50 text-gray-600 rounded-lg cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1 bg-gray-50 p-2 rounded-lg">
                      <Mail className="h-3 w-3" />
                      Email không thể thay đổi
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-semibold mb-2.5 text-gray-800 flex items-center gap-2">
                      <Phone className="h-4 w-4 text-blue-600" />
                      Số điện thoại
                    </label>
                    <Input
                      value={profileData.so_dien_thoai || 'Chưa cập nhật'}
                      disabled
                      className="h-12 border-2 border-gray-200 bg-gray-50 text-gray-600 rounded-lg cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1 bg-blue-50 p-2 rounded-lg border border-blue-200">
                      <Phone className="h-3 w-3 text-blue-600" />
                      Để thay đổi số điện thoại, vui lòng vào trang <strong>Cài đặt</strong>
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-semibold mb-2.5 text-gray-800 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      Ngày sinh
                    </label>
                    <Input
                      type="date"
                      value={profileData.ngay_sinh}
                      disabled
                      className="h-12 border-2 border-gray-200 bg-gray-50 text-gray-600 rounded-lg cursor-not-allowed"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Stats */}
          <div className="space-y-6">
            <Card className="border-2 border-blue-200/70 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white overflow-hidden !pt-0 rounded-xl">
              <CardHeader className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white !pt-5 pb-5 px-6 shadow-lg">
                <CardTitle className="flex items-center gap-3 text-white text-xl font-bold">
                  <div className="p-2.5 bg-white/25 rounded-xl backdrop-blur-sm shadow-md">
                    <Award className="h-6 w-6" />
                  </div>
                  Điểm thưởng
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 pb-6">
                <div className="text-center">
                  <div className="text-5xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                    {profileData.diem_fpoint.toLocaleString('vi-VN')}
                  </div>
                  <p className="text-base font-semibold text-gray-700 mb-1">F-Point</p>
                  <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-gray-600">
                      💎 Tích điểm khi mua hàng và đổi quà
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200/70 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white overflow-hidden !pt-0 rounded-xl">
              <CardHeader className="bg-gradient-to-r from-blue-50 via-indigo-50/50 to-purple-50 border-b-2 border-blue-200/50 !pt-5 pb-5 px-6">
                <CardTitle className="flex items-center gap-3 text-blue-900 text-xl font-bold">
                  <div className="p-2.5 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl shadow-sm">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  Thông tin tài khoản
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 pb-6 space-y-4">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-green-900">Tài khoản đã xác thực</p>
                    <p className="text-xs text-green-600">Tài khoản của bạn đã được xác thực</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Mail className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-blue-900 mb-1">Email</p>
                    <p className="text-xs text-gray-600 break-all">{profileData.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;


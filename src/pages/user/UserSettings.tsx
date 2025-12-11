import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserAuth } from '../../hooks/useUserAuth';
import { changePassword, updateMyProfile } from '../../services/khachHangService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { 
  Settings, 
  Lock, 
  Bell, 
  Shield, 
  ArrowLeft,
  Loader2,
  Eye,
  EyeOff,
  User,
  UserCircle,
  Phone,
  Mail,
  Package,
  Gift,
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';

const UserSettings = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout, user, updateUser } = useUserAuth();
  const [saving, setSaving] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [nameData, setNameData] = useState({
    ho_ten: ''
  });
  const [nameError, setNameError] = useState('');
  const [phoneData, setPhoneData] = useState({
    so_dien_thoai: ''
  });
  const [phoneError, setPhoneError] = useState('');
  const [savingPhone, setSavingPhone] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    orderUpdates: true,
    promotions: true
  });

  // Load tên hiện tại khi component mount
  useEffect(() => {
    if (user?.ho_ten) {
      setNameData({ ho_ten: user.ho_ten });
    }
    if (user?.so_dien_thoai) {
      setPhoneData({ so_dien_thoai: user.so_dien_thoai });
    }
  }, [user]);

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  // Kiểm tra độ mạnh mật khẩu
  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 2) return { strength, label: 'Yếu', color: 'bg-red-500' };
    if (strength === 3) return { strength, label: 'Trung bình', color: 'bg-yellow-500' };
    if (strength === 4) return { strength, label: 'Mạnh', color: 'bg-blue-500' };
    return { strength, label: 'Rất mạnh', color: 'bg-green-500' };
  };

  const validatePassword = () => {
    const errors = {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    };

    if (!passwordData.oldPassword) {
      errors.oldPassword = 'Vui lòng nhập mật khẩu hiện tại';
    }

    if (!passwordData.newPassword) {
      errors.newPassword = 'Vui lòng nhập mật khẩu mới';
    } else {
      if (passwordData.newPassword.length < 6) {
        errors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự';
      } else if (passwordData.newPassword === passwordData.oldPassword) {
        errors.newPassword = 'Mật khẩu mới không được trùng với mật khẩu cũ';
      }
    }

    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    setPasswordErrors(errors);
    return !errors.oldPassword && !errors.newPassword && !errors.confirmPassword;
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePassword()) {
      return;
    }

    try {
      setSaving(true);
      
      // Kiểm tra token trước khi gọi API
      const userToken = localStorage.getItem('user_token');
      if (!userToken) {
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        setTimeout(() => {
          logout();
          navigate('/login');
        }, 2000);
        return;
      }
      
      // Log để debug
      console.log('Change password request:', {
        hasToken: !!userToken,
        tokenLength: userToken?.length,
        tokenPreview: userToken?.substring(0, 20) + '...'
      });
      
      await changePassword({
        mat_khau_cu: passwordData.oldPassword,
        mat_khau_moi: passwordData.newPassword
      });
      toast.success('Đổi mật khẩu thành công!');
      setPasswordData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setPasswordErrors({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: unknown) {
      console.error('Error changing password:', error);
      
      // Log chi tiết response để debug
      const axiosError = error as { 
        response?: { 
          data?: { 
            message?: string;
            success?: boolean;
            error?: string;
          }; 
          status?: number;
          statusText?: string;
        };
      };
      
      console.error('Error details:', {
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        data: axiosError.response?.data,
        message: axiosError.response?.data?.message,
        fullResponse: axiosError.response
      });
      
      // Log response data để debug
      if (axiosError.response?.data) {
        console.error('Backend error response:', JSON.stringify(axiosError.response.data, null, 2));
      }
      
      let errorMessage = 'Không thể đổi mật khẩu';
      
      if (axiosError.response?.status === 401) {
        if (axiosError.response?.data?.message?.includes('Token')) {
          errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
          toast.error(errorMessage);
          setTimeout(() => {
            logout();
            navigate('/login');
          }, 2000);
          return;
        } else if (axiosError.response?.data?.message?.includes('ID khách hàng')) {
          errorMessage = 'Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.';
          toast.error(errorMessage);
          setTimeout(() => {
            logout();
            navigate('/login');
          }, 2000);
          return;
        } else if (axiosError.response?.data?.message?.includes('Mật khẩu cũ')) {
          errorMessage = axiosError.response.data.message;
          setPasswordErrors(prev => ({ ...prev, oldPassword: errorMessage }));
        } else {
          errorMessage = axiosError.response?.data?.message || errorMessage;
        }
      } else if (axiosError.response?.status === 400) {
        // Xử lý lỗi 400 Bad Request
        errorMessage = axiosError.response?.data?.message || 'Dữ liệu không hợp lệ';
        
        // Set error cho từng field tương ứng
        if (errorMessage.includes('Mật khẩu cũ') || errorMessage.includes('mật khẩu cũ')) {
          setPasswordErrors(prev => ({ ...prev, oldPassword: errorMessage }));
          toast.error(errorMessage);
          return;
        } else if (errorMessage.includes('Mật khẩu mới') || errorMessage.includes('mật khẩu mới')) {
          setPasswordErrors(prev => ({ ...prev, newPassword: errorMessage }));
          toast.error(errorMessage);
          return;
        } else if (errorMessage.includes('xác nhận') || errorMessage.includes('khớp')) {
          setPasswordErrors(prev => ({ ...prev, confirmPassword: errorMessage }));
          toast.error(errorMessage);
          return;
        } else if (errorMessage.includes('đầy đủ') || errorMessage.includes('nhập')) {
          // Nếu thiếu thông tin, hiển thị lỗi chung
          toast.error(errorMessage);
          return;
        } else if (errorMessage.includes('ID khách hàng')) {
          // ID không hợp lệ - yêu cầu đăng nhập lại
          errorMessage = 'Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.';
          toast.error(errorMessage);
          setTimeout(() => {
            logout();
            navigate('/login');
          }, 2000);
          return;
        }
      } else if (axiosError.response?.data?.message) {
        errorMessage = axiosError.response.data.message;
        
        // Set error cho mật khẩu cũ nếu sai
        if (errorMessage.includes('Mật khẩu cũ')) {
          setPasswordErrors(prev => ({ ...prev, oldPassword: errorMessage }));
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const passwordStrength = getPasswordStrength(passwordData.newPassword);

  // Xử lý đổi tên
  const handleChangeName = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    if (!nameData.ho_ten.trim()) {
      setNameError('Vui lòng nhập họ tên');
      return;
    }

    if (nameData.ho_ten.trim().length < 2) {
      setNameError('Họ tên phải có ít nhất 2 ký tự');
      return;
    }

    if (nameData.ho_ten.trim() === user?.ho_ten) {
      setNameError('Họ tên mới phải khác với họ tên hiện tại');
      return;
    }

    try {
      setSavingName(true);
      setNameError('');

      const updatedUser = await updateMyProfile({
        ho_ten: nameData.ho_ten.trim()
      });

      // Cập nhật user context
      if (user) {
        updateUser({
          ...user,
          ho_ten: updatedUser.ho_ten
        });
      }

      toast.success('Đổi tên thành công!');
    } catch (error: unknown) {
      console.error('Error changing name:', error);
      const axiosError = error as { 
        response?: { 
          data?: { 
            message?: string;
          }; 
        };
      };
      
      const errorMessage = axiosError.response?.data?.message || 'Không thể đổi tên. Vui lòng thử lại.';
      setNameError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSavingName(false);
    }
  };

  // Xử lý đổi số điện thoại
  const handleChangePhone = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    const phoneValue = phoneData.so_dien_thoai.trim();
    
    if (!phoneValue) {
      setPhoneError('Vui lòng nhập số điện thoại');
      return;
    }

    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(phoneValue)) {
      setPhoneError('Số điện thoại không hợp lệ (10-11 chữ số)');
      return;
    }

    if (phoneValue === user?.so_dien_thoai) {
      setPhoneError('Số điện thoại mới phải khác với số điện thoại hiện tại');
      return;
    }

    try {
      setSavingPhone(true);
      setPhoneError('');

      const updatedUser = await updateMyProfile({
        so_dien_thoai: phoneValue
      });

      // Cập nhật user context
      if (user) {
        updateUser({
          ...user,
          so_dien_thoai: updatedUser.so_dien_thoai
        });
      }

      toast.success('Đổi số điện thoại thành công!');
    } catch (error: unknown) {
      console.error('Error changing phone:', error);
      const axiosError = error as { 
        response?: { 
          data?: { 
            message?: string;
          }; 
        };
      };
      
      const errorMessage = axiosError.response?.data?.message || 'Không thể đổi số điện thoại. Vui lòng thử lại.';
      setPhoneError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSavingPhone(false);
    }
  };

  const handleSaveNotifications = async () => {
    try {
      setSaving(true);
      // TODO: Implement save notification settings API call
      // await updateNotificationSettings(notificationSettings);
      toast.success('Đã lưu cài đặt thông báo!');
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast.error('Không thể lưu cài đặt');
    } finally {
      setSaving(false);
    }
  };

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
                <Settings className="h-8 w-8 text-blue-600" />
              </div>
              Cài đặt
            </h1>
          </div>
          <p className="text-gray-600 text-lg ml-16">Quản lý cài đặt tài khoản và bảo mật</p>
        </div>

        <div className="space-y-6">
          {/* Change Name */}
          <Card className="border-2 border-blue-200/70 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white overflow-hidden !pt-0 rounded-xl">
            <CardHeader className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white !pt-5 pb-5 px-6 shadow-lg">
              <CardTitle className="flex items-center gap-3 text-white text-xl font-bold">
                <div className="p-2.5 bg-white/25 rounded-xl backdrop-blur-sm shadow-md">
                  <UserCircle className="h-6 w-6" />
                </div>
                Đổi tên
              </CardTitle>
              <CardDescription className="text-blue-100 mt-2 text-base">
                Cập nhật tên hiển thị của bạn
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 pb-6">
              <form onSubmit={handleChangeName} className="space-y-5">
                <div>
                  <label className="text-sm font-semibold mb-2.5 text-gray-800 flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-600" />
                    Họ tên hiện tại
                  </label>
                  <Input
                    type="text"
                    value={user?.ho_ten || ''}
                    disabled
                    className="h-12 border-2 border-gray-200 bg-gray-50 text-gray-600 rounded-lg"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2.5 text-gray-800 flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-600" />
                    Họ tên mới *
                  </label>
                  <Input
                    type="text"
                    value={nameData.ho_ten}
                    onChange={(e) => {
                      setNameData({ ho_ten: e.target.value });
                      if (nameError) {
                        setNameError('');
                      }
                    }}
                    placeholder="Nhập họ tên mới"
                    required
                    minLength={2}
                    className={`h-12 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all rounded-lg ${nameError ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}`}
                  />
                  {nameError && (
                    <p className="text-red-500 text-sm mt-1.5 flex items-center gap-1.5 bg-red-50 p-2 rounded-lg border border-red-200">
                      <Shield className="h-3.5 w-3.5" />
                      {nameError}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 h-12 text-base font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98]"
                  disabled={savingName || !nameData.ho_ten.trim() || nameData.ho_ten.trim() === user?.ho_ten}
                >
                  {savingName ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <UserCircle className="h-5 w-5 mr-2" />
                      Đổi tên
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Change Phone */}
          <Card className="border-2 border-blue-200/70 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white overflow-hidden !pt-0 rounded-xl">
            <CardHeader className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white !pt-5 pb-5 px-6 shadow-lg">
              <CardTitle className="flex items-center gap-3 text-white text-xl font-bold">
                <div className="p-2.5 bg-white/25 rounded-xl backdrop-blur-sm shadow-md">
                  <Phone className="h-6 w-6" />
                </div>
                Đổi số điện thoại
              </CardTitle>
              <CardDescription className="text-blue-100 mt-2 text-base">
                Cập nhật số điện thoại của bạn
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 pb-6">
              <form onSubmit={handleChangePhone} className="space-y-5">
                <div>
                  <label className="text-sm font-semibold mb-2.5 text-gray-800 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-blue-600" />
                    Số điện thoại hiện tại
                  </label>
                  <Input
                    type="text"
                    value={user?.so_dien_thoai || 'Chưa cập nhật'}
                    disabled
                    className="h-12 border-2 border-gray-200 bg-gray-50 text-gray-600 rounded-lg"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2.5 text-gray-800 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-blue-600" />
                    Số điện thoại mới *
                  </label>
                  <Input
                    type="tel"
                    value={phoneData.so_dien_thoai}
                    onChange={(e) => {
                      setPhoneData({ so_dien_thoai: e.target.value });
                      if (phoneError) {
                        setPhoneError('');
                      }
                    }}
                    placeholder="Nhập số điện thoại mới (10-11 chữ số)"
                    required
                    maxLength={11}
                    className={`h-12 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all rounded-lg ${phoneError ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}`}
                  />
                  {phoneError && (
                    <p className="text-red-500 text-sm mt-1.5 flex items-center gap-1.5 bg-red-50 p-2 rounded-lg border border-red-200">
                      <Shield className="h-3.5 w-3.5" />
                      {phoneError}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1 bg-blue-50 p-2 rounded-lg border border-blue-200">
                    <Phone className="h-3 w-3 text-blue-600" />
                    Số điện thoại phải có 10-11 chữ số
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 h-12 text-base font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98]"
                  disabled={savingPhone || !phoneData.so_dien_thoai.trim() || phoneData.so_dien_thoai.trim() === user?.so_dien_thoai}
                >
                  {savingPhone ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Phone className="h-5 w-5 mr-2" />
                      Lưu số điện thoại
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Email Info */}
          <Card className="border-2 border-blue-200/70 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white overflow-hidden !pt-0 rounded-xl">
            <CardHeader className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white !pt-5 pb-5 px-6 shadow-lg">
              <CardTitle className="flex items-center gap-3 text-white text-xl font-bold">
                <div className="p-2.5 bg-white/25 rounded-xl backdrop-blur-sm shadow-md">
                  <Mail className="h-6 w-6" />
                </div>
                Thông tin Email
              </CardTitle>
              <CardDescription className="text-blue-100 mt-2 text-base">
                Email đăng nhập của tài khoản
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 pb-6">
              <div className="space-y-5">
                <div>
                  <label className="text-sm font-semibold mb-2.5 text-gray-800 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-600" />
                    Email
                  </label>
                  <Input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="h-12 border-2 border-gray-200 bg-gray-50 text-gray-600 rounded-lg cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1 bg-gray-50 p-2 rounded-lg border border-gray-200">
                    <Mail className="h-3 w-3" />
                    Email không thể thay đổi vì đây là thông tin đăng nhập của bạn
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card className="border-2 border-blue-200/70 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white overflow-hidden !pt-0 rounded-xl">
            <CardHeader className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white !pt-5 pb-5 px-6 shadow-lg">
              <CardTitle className="flex items-center gap-3 text-white text-xl font-bold">
                <div className="p-2.5 bg-white/25 rounded-xl backdrop-blur-sm shadow-md">
                  <Lock className="h-6 w-6" />
                </div>
                Đổi mật khẩu
              </CardTitle>
              <CardDescription className="text-blue-100 mt-2 text-base">
                Thay đổi mật khẩu của bạn để bảo mật tài khoản tốt hơn
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 pb-6">
              <form onSubmit={handleChangePassword} className="space-y-5">
                <div>
                  <label className="text-sm font-semibold mb-2.5 text-gray-800 flex items-center gap-2">
                    <Lock className="h-4 w-4 text-blue-600" />
                    Mật khẩu hiện tại *
                  </label>
                  <div className="relative">
                    <Input
                      type={showOldPassword ? 'text' : 'password'}
                      value={passwordData.oldPassword}
                      onChange={(e) => {
                        setPasswordData({ ...passwordData, oldPassword: e.target.value });
                        if (passwordErrors.oldPassword) {
                          setPasswordErrors({ ...passwordErrors, oldPassword: '' });
                        }
                      }}
                      placeholder="Nhập mật khẩu hiện tại"
                      required
                      className={`h-12 pr-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all rounded-lg ${passwordErrors.oldPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-12 w-12 hover:bg-transparent"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                    >
                      {showOldPassword ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
                    </Button>
                  </div>
                  {passwordErrors.oldPassword && (
                    <p className="text-red-500 text-sm mt-1.5 flex items-center gap-1.5 bg-red-50 p-2 rounded-lg border border-red-200">
                      <Shield className="h-3.5 w-3.5" />
                      {passwordErrors.oldPassword}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2.5 text-gray-800 flex items-center gap-2">
                    <Lock className="h-4 w-4 text-blue-600" />
                    Mật khẩu mới *
                  </label>
                  <div className="relative">
                    <Input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => {
                        setPasswordData({ ...passwordData, newPassword: e.target.value });
                        if (passwordErrors.newPassword) {
                          setPasswordErrors({ ...passwordErrors, newPassword: '' });
                        }
                      }}
                      placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                      required
                      minLength={6}
                      className={`h-12 pr-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all rounded-lg ${passwordErrors.newPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-12 w-12 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
                    </Button>
                  </div>
                  {passwordData.newPassword && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                          <div 
                            className={`h-full transition-all duration-500 rounded-full ${passwordStrength.color}`}
                            style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                          />
                        </div>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${passwordStrength.strength <= 2 ? 'text-red-700 bg-red-100' : passwordStrength.strength === 3 ? 'text-yellow-700 bg-yellow-100' : passwordStrength.strength === 4 ? 'text-blue-700 bg-blue-100' : 'text-green-700 bg-green-100'}`}>
                          {passwordStrength.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">
                        💡 Mật khẩu mạnh nên có: ít nhất 8 ký tự, chữ hoa, chữ thường, số và ký tự đặc biệt
                      </p>
                    </div>
                  )}
                  {passwordErrors.newPassword && (
                    <p className="text-red-500 text-sm mt-1.5 flex items-center gap-1.5 bg-red-50 p-2 rounded-lg border border-red-200">
                      <Shield className="h-3.5 w-3.5" />
                      {passwordErrors.newPassword}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2.5 text-gray-800 flex items-center gap-2">
                    <Lock className="h-4 w-4 text-blue-600" />
                    Xác nhận mật khẩu mới *
                  </label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => {
                        setPasswordData({ ...passwordData, confirmPassword: e.target.value });
                        if (passwordErrors.confirmPassword) {
                          setPasswordErrors({ ...passwordErrors, confirmPassword: '' });
                        }
                      }}
                      placeholder="Nhập lại mật khẩu mới"
                      required
                      className={`h-12 pr-10 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all rounded-lg ${passwordErrors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : passwordData.confirmPassword && passwordData.newPassword === passwordData.confirmPassword ? 'border-green-500 focus:border-green-500 focus:ring-green-200' : ''}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-12 w-12 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
                    </Button>
                  </div>
                  {passwordData.confirmPassword && passwordData.newPassword === passwordData.confirmPassword && !passwordErrors.confirmPassword && (
                    <p className="text-green-600 text-sm mt-1.5 flex items-center gap-1.5 bg-green-50 p-2 rounded-lg border border-green-200">
                      <Shield className="h-3.5 w-3.5" />
                      ✓ Mật khẩu xác nhận khớp
                    </p>
                  )}
                  {passwordErrors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1.5 flex items-center gap-1.5 bg-red-50 p-2 rounded-lg border border-red-200">
                      <Shield className="h-3.5 w-3.5" />
                      {passwordErrors.confirmPassword}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 h-12 text-base font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98]"
                  disabled={saving || !passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Lock className="h-5 w-5 mr-2" />
                      Đổi mật khẩu
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="border-2 border-blue-200/70 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white overflow-hidden !pt-0 rounded-xl">
            <CardHeader className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white !pt-5 pb-5 px-6 shadow-lg">
              <CardTitle className="flex items-center gap-3 text-white text-xl font-bold">
                <div className="p-2.5 bg-white/25 rounded-xl backdrop-blur-sm shadow-md animate-pulse">
                  <Bell className="h-6 w-6" />
                </div>
                Thông báo
              </CardTitle>
              <CardDescription className="text-blue-100 mt-2 text-base">
                Quản lý các thông báo bạn muốn nhận
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 pb-6">
              <div className="space-y-4">
                {/* Email Notifications */}
                <div className={`flex items-center justify-between p-5 rounded-xl border-2 transition-all duration-300 ${
                  notificationSettings.emailNotifications 
                    ? 'border-blue-400 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md' 
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                }`}>
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`p-3 rounded-xl transition-all duration-300 ${
                      notificationSettings.emailNotifications 
                        ? 'bg-blue-500 text-white shadow-lg scale-110' 
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      <Mail className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-base flex items-center gap-2">
                        Thông báo qua email
                        {notificationSettings.emailNotifications && (
                          <span className="text-xs px-2 py-0.5 bg-blue-500 text-white rounded-full font-semibold">Bật</span>
                        )}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">Nhận thông báo quan trọng qua email</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input
                      type="checkbox"
                      checked={notificationSettings.emailNotifications}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, emailNotifications: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-purple-600 shadow-lg"></div>
                  </label>
                </div>

                {/* SMS Notifications */}
                <div className={`flex items-center justify-between p-5 rounded-xl border-2 transition-all duration-300 ${
                  notificationSettings.smsNotifications 
                    ? 'border-green-400 bg-gradient-to-r from-green-50 to-emerald-50 shadow-md' 
                    : 'border-gray-200 hover:border-green-300 hover:bg-green-50/50'
                }`}>
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`p-3 rounded-xl transition-all duration-300 ${
                      notificationSettings.smsNotifications 
                        ? 'bg-green-500 text-white shadow-lg scale-110' 
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      <MessageSquare className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-base flex items-center gap-2">
                        Thông báo qua SMS
                        {notificationSettings.smsNotifications && (
                          <span className="text-xs px-2 py-0.5 bg-green-500 text-white rounded-full font-semibold">Bật</span>
                        )}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">Nhận thông báo qua tin nhắn SMS</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input
                      type="checkbox"
                      checked={notificationSettings.smsNotifications}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, smsNotifications: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-green-500 peer-checked:to-emerald-600 shadow-lg"></div>
                  </label>
                </div>

                {/* Order Updates */}
                <div className={`flex items-center justify-between p-5 rounded-xl border-2 transition-all duration-300 ${
                  notificationSettings.orderUpdates 
                    ? 'border-orange-400 bg-gradient-to-r from-orange-50 to-amber-50 shadow-md' 
                    : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/50'
                }`}>
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`p-3 rounded-xl transition-all duration-300 ${
                      notificationSettings.orderUpdates 
                        ? 'bg-orange-500 text-white shadow-lg scale-110' 
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      <Package className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-base flex items-center gap-2">
                        Cập nhật đơn hàng
                        {notificationSettings.orderUpdates && (
                          <span className="text-xs px-2 py-0.5 bg-orange-500 text-white rounded-full font-semibold">Bật</span>
                        )}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">Thông báo về trạng thái đơn hàng của bạn</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input
                      type="checkbox"
                      checked={notificationSettings.orderUpdates}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, orderUpdates: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-orange-500 peer-checked:to-amber-600 shadow-lg"></div>
                  </label>
                </div>

                {/* Promotions */}
                <div className={`flex items-center justify-between p-5 rounded-xl border-2 transition-all duration-300 ${
                  notificationSettings.promotions 
                    ? 'border-pink-400 bg-gradient-to-r from-pink-50 to-rose-50 shadow-md' 
                    : 'border-gray-200 hover:border-pink-300 hover:bg-pink-50/50'
                }`}>
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`p-3 rounded-xl transition-all duration-300 ${
                      notificationSettings.promotions 
                        ? 'bg-pink-500 text-white shadow-lg scale-110' 
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      <Gift className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-base flex items-center gap-2">
                        Khuyến mãi và ưu đãi
                        {notificationSettings.promotions && (
                          <span className="text-xs px-2 py-0.5 bg-pink-500 text-white rounded-full font-semibold">Bật</span>
                        )}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">Nhận thông tin về khuyến mãi và ưu đãi đặc biệt</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input
                      type="checkbox"
                      checked={notificationSettings.promotions}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, promotions: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-pink-500 peer-checked:to-rose-600 shadow-lg"></div>
                  </label>
                </div>

                <Button
                  onClick={handleSaveNotifications}
                  className="w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 h-14 text-base font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] mt-4"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Bell className="h-5 w-5 mr-2" />
                      Lưu cài đặt thông báo
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card className="border-2 border-blue-200/70 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white overflow-hidden !pt-0 rounded-xl">
            <CardHeader className="bg-gradient-to-r from-blue-50 via-indigo-50/50 to-purple-50 border-b-2 border-blue-200/50 !pt-5 pb-5 px-6">
              <CardTitle className="flex items-center gap-3 text-blue-900 text-xl font-bold">
                <div className="p-2.5 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl shadow-sm">
                  <Shield className="h-5 w-5 text-blue-600" />
                </div>
                Bảo mật
              </CardTitle>
              <CardDescription className="text-gray-600 mt-1">Quản lý bảo mật tài khoản</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 pb-6">
              <div className="space-y-4">
                <div className="p-5 border-2 border-gray-200 rounded-xl hover:border-red-300 hover:bg-red-50/50 transition-all duration-200">
                  <p className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-red-600" />
                    Đăng xuất khỏi tất cả thiết bị
                  </p>
                  <p className="text-sm text-gray-600 mb-4">Đăng xuất khỏi tất cả các thiết bị đã đăng nhập</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      logout();
                      navigate('/');
                      toast.success('Đã đăng xuất khỏi tất cả thiết bị');
                    }}
                    className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 transition-colors"
                  >
                    Đăng xuất
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;


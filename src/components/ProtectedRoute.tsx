import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
}

// Giải thích:
// - ProtectedRoute: ProtectedRoute là một component để bảo vệ các route cần đăng nhập.
// - ({ children }: ProtectedRouteProps) là một destructuring assignment để quản lý props của ProtectedRoute.
// - children: children là một prop để quản lý các component con của ProtectedRoute.
// - ReactNode: ReactNode là một type để quản lý component của React.
// - Navigate: Navigate là một component để chuyển hướng route.
// - useAuth: useAuth là một hook để sử dụng auth context.
// - Loader2: Loader2 là một icon để hiển thị loader.
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, loading, token, admin } = useAuth(); // Sử dụng hook useAuth để lấy auth context

  // Kiểm tra localStorage để đảm bảo (fallback nếu state chưa update)
  const storedToken = localStorage.getItem('admin_token'); // Lấy token từ localStorage
  const storedAdmin = localStorage.getItem('admin_info'); // Lấy admin từ localStorage
  
  // Debug log
  console.log('ProtectedRoute check:', {
    loading,
    isAuthenticated,
    hasToken: !!token,
    hasAdmin: !!admin,
    hasStoredToken: !!storedToken,
    hasStoredAdmin: !!storedAdmin
  });

  if (loading) {
    // Nếu đang loading nhưng có token trong localStorage, có thể là đang verify
    // Đợi một chút để xem có thành công không
    if (storedToken && storedAdmin) {
      // Có token trong storage, đợi verify xong
      return (
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    } else {
      // Không có token, chắc chắn chưa đăng nhập
      return <Navigate to="/admin/login" replace />;
    }
  }

  // Nếu có token và admin info trong localStorage HOẶC state đã có, cho phép truy cập
  const hasAuth = isAuthenticated || (storedToken && storedAdmin);
  
  if (!hasAuth) {
    console.log('ProtectedRoute - No auth found, redirecting to login');
    return <Navigate to="/admin/login" replace />;
  }

  console.log('ProtectedRoute - Access granted');
  return <>{children}</>;
};

export default ProtectedRoute;


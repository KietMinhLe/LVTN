# 📚 Hướng Dẫn Sử Dụng Project View

## 🎯 Tổng Quan

Project này là frontend được xây dựng bằng React + TypeScript + Vite, sử dụng React Router để quản lý routing và Axios để gọi API.

---

## 📁 Cấu Trúc Thư Mục

```
view/
├── src/
│   ├── App.tsx                    # File chính - Định nghĩa tất cả routes
│   ├── main.tsx                   # Entry point của ứng dụng
│   │
│   ├── pages/                     # Các trang của ứng dụng
│   │   ├── admin/                 # Trang dành cho admin
│   │   │   ├── AdminDashboard.tsx         # Dashboard chính
│   │   │   ├── AdminLoginPage.tsx         # Trang đăng nhập
│   │   │   ├── AdminQuanLySach.tsx        # Quản lý sách
│   │   │   └── AdminQuanLyDanhMuc.tsx    # Quản lý danh mục
│   │   └── user/                  # Trang dành cho user
│   │       ├── HomePage.jsx
│   │       └── NotFound.jsx
│   │
│   ├── services/                  # API Services - Tách theo module
│   │   ├── adminService.ts        # Service cho authentication admin
│   │   ├── sachService.ts         # Service cho quản lý sách
│   │   ├── danhMucService.ts      # Service cho quản lý danh mục
│   │   └── index.ts               # Export tất cả services
│   │
│   ├── components/                # Các component tái sử dụng
│   │   ├── ProtectedRoute.tsx     # Component bảo vệ route
│   │   └── ui/                    # UI components (shadcn/ui)
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       └── ...
│   │
│   ├── contexts/                  # React Context
│   │   ├── AuthContext.tsx        # Context định nghĩa
│   │   └── AuthProvider.tsx       # Provider quản lý authentication
│   │
│   ├── hooks/                     # Custom hooks
│   │   └── useAuth.ts             # Hook để sử dụng auth context
│   │
│   └── lib/                       # Thư viện và utilities
│       ├── api.ts                 # Axios client configuration
│       └── utils.ts               # Utility functions
│
└── package.json
```

---

## 🛣️ Hệ Thống Routing

### File Chính: `src/App.tsx`

Đây là file định nghĩa tất cả các routes trong ứng dụng. Cấu trúc routing sử dụng React Router v7.

### Các Routes Hiện Tại

#### 1. **Public Routes** (Không cần đăng nhập)
```
/                    → HomePage (Trang chủ)
/admin/login         → AdminLoginPage (Đăng nhập admin)
```

#### 2. **Protected Routes** (Cần đăng nhập admin)
```
/admin/dashboard     → AdminDashboard (Dashboard chính)
/admin/sach          → AdminQuanLySach (Quản lý sách)
/admin/danhmuc       → AdminQuanLyDanhMuc (Quản lý danh mục)
```

#### 3. **Redirect Routes**
```
/admin               → Redirect về /admin/login
*                    → NotFound (404 - Không tìm thấy trang)
```

### Cách Hoạt Động

1. **AuthProvider** (`contexts/AuthProvider.tsx`):
   - Bọc toàn bộ app để quản lý authentication state
   - Kiểm tra token trong localStorage khi app khởi động
   - Cung cấp các hàm: `login`, `logout`, `isAuthenticated`

2. **ProtectedRoute** (`components/ProtectedRoute.tsx`):
   - Component bảo vệ các route cần đăng nhập
   - Kiểm tra `isAuthenticated` từ AuthContext
   - Nếu chưa đăng nhập → redirect về `/admin/login`
   - Nếu đã đăng nhập → render component con

### Luồng Xác Thực

```
1. User truy cập /admin/dashboard
   ↓
2. ProtectedRoute kiểm tra authentication
   ↓
3. Nếu chưa có token → Redirect về /admin/login
   ↓
4. User đăng nhập thành công
   ↓
5. Token được lưu vào localStorage
   ↓
6. AuthContext cập nhật state
   ↓
7. Redirect về /admin/dashboard
   ↓
8. ProtectedRoute cho phép truy cập
```

---

## 🔧 Cách Thêm Route Mới

### Bước 1: Tạo Component Trang Mới

Tạo file trong `src/pages/admin/` hoặc `src/pages/user/`:

```typescript
// src/pages/admin/AdminQuanLyKhachHang.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';

const AdminQuanLyKhachHang = () => {
  const navigate = useNavigate();
  
  return (
    <div>
      <Button onClick={() => navigate('/admin/dashboard')}>
        Quay về Dashboard
      </Button>
      <h1>Quản lý khách hàng</h1>
    </div>
  );
};

export default AdminQuanLyKhachHang;
```

### Bước 2: Import vào App.tsx

```typescript
import AdminQuanLyKhachHang from './pages/admin/AdminQuanLyKhachHang';
```

### Bước 3: Thêm Route vào App.tsx

**Cho Public Route:**
```typescript
<Route path="/about" element={<AboutPage />} />
```

**Cho Protected Route (cần đăng nhập):**
```typescript
<Route
  path="/admin/khachhang"
  element={
    <ProtectedRoute>
      <AdminQuanLyKhachHang />
    </ProtectedRoute>
  }
/>
```

### Bước 4: Thêm Link trong Dashboard (tùy chọn)

Trong `AdminDashboard.tsx`, thêm vào mảng `quickActions`:

```typescript
{
  title: 'Quản lý khách hàng',
  description: 'Quản lý tài khoản khách hàng',
  icon: Users,
  color: 'text-purple-600',
  bgColor: 'bg-purple-50 dark:bg-purple-950/20',
  onClick: () => navigate('/admin/khachhang')
}
```

---

## 🔌 Cách Thêm Service Mới

### Ví dụ: Tạo `khachHangService.ts`

1. **Tạo file service mới:**
```typescript
// src/services/khachHangService.ts
import apiClient from '../lib/api';

export interface KhachHang {
  khach_hang_id: number;
  email: string;
  ho_ten: string;
  // ... các trường khác
}

export const getAllKhachHang = async (): Promise<KhachHang[]> => {
  const response = await apiClient.get('/khachhang');
  return response.data.data;
};

export const getKhachHangById = async (id: number): Promise<KhachHang> => {
  const response = await apiClient.get(`/khachhang/${id}`);
  return response.data.data;
};

export const createKhachHang = async (data: any): Promise<KhachHang> => {
  const response = await apiClient.post('/khachhang', data);
  return response.data.data;
};

export const updateKhachHang = async (id: number, data: any): Promise<KhachHang> => {
  const response = await apiClient.put(`/khachhang/${id}`, data);
  return response.data.data;
};

export const deleteKhachHang = async (id: number): Promise<void> => {
  await apiClient.delete(`/khachhang/${id}`);
};
```

2. **Export từ index.ts (tùy chọn):**
```typescript
// src/services/index.ts
export * from './khachHangService';
```

3. **Sử dụng trong component:**
```typescript
import { getAllKhachHang, type KhachHang } from '../../services/khachHangService';
```

---

## 📡 Cấu Hình API

### File: `src/lib/api.ts`

File này cấu hình Axios client với:
- Base URL: `http://localhost:5000` (hoặc từ env: `VITE_API_BASE_URL`)
- Auto thêm token vào header nếu có
- Xử lý lỗi 401 (unauthorized) → tự động redirect về login

### Cấu Hình Environment

Tạo file `.env` trong thư mục `view/`:

```env
VITE_API_BASE_URL=http://localhost:5000
```

---

## 🔐 Authentication Flow

### 1. Đăng Nhập

```typescript
// Trong AdminLoginPage hoặc component nào đó
import { useAuth } from '../../hooks/useAuth';

const { login } = useAuth();

const handleLogin = async () => {
  const success = await login(email, password);
  if (success) {
    navigate('/admin/dashboard');
  }
};
```

### 2. Kiểm Tra Authentication

```typescript
import { useAuth } from '../../hooks/useAuth';

const { isAuthenticated, admin, loading } = useAuth();

if (loading) {
  return <div>Đang kiểm tra...</div>;
}

if (!isAuthenticated) {
  return <div>Chưa đăng nhập</div>;
}

return <div>Xin chào {admin?.ten_hien_thi}</div>;
```

### 3. Đăng Xuất

```typescript
const { logout } = useAuth();

const handleLogout = async () => {
  await logout();
  navigate('/admin/login');
};
```

---

## 📋 Services Structure

### 1. `adminService.ts` - Authentication
- `loginAdmin()` - Đăng nhập
- `logoutAdmin()` - Đăng xuất
- `verifyAdminToken()` - Xác thực token
- `getCurrentAdmin()` - Lấy thông tin admin hiện tại

### 2. `sachService.ts` - Quản lý sách
- `getAllSach()` - Lấy danh sách sách
- `getSachById()` - Lấy sách theo ID
- `createSach()` - Tạo sách mới
- `updateSach()` - Cập nhật sách
- `deleteSach()` - Xóa sách
- `getAllTacGia()` - Lấy danh sách tác giả
- `getAllNhaXuatBan()` - Lấy danh sách nhà xuất bản
- `getAllThuongHieu()` - Lấy danh sách thương hiệu
- `getAllNhaCungCap()` - Lấy danh sách nhà cung cấp

### 3. `danhMucService.ts` - Quản lý danh mục
- `getAllDanhMuc()` - Lấy danh sách danh mục
- `getDanhMucById()` - Lấy danh mục theo ID
- `createDanhMuc()` - Tạo danh mục mới
- `updateDanhMuc()` - Cập nhật danh mục
- `deleteDanhMuc()` - Xóa danh mục
- `getAllDanhMucCha()` - Lấy danh sách danh mục cha

---

## 🎨 UI Components

Project sử dụng **shadcn/ui** components. Các component chính:

- `Button` - Nút bấm với nhiều variants
- `Card` - Container với header, content, footer
- `Dialog` - Modal popup
- `Input` - Input field
- `Badge` - Badge hiển thị trạng thái

### Cách Sử Dụng

```typescript
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';

// Button
<Button variant="outline" onClick={handleClick}>Click me</Button>

// Card
<Card>
  <CardHeader>
    <CardTitle>Tiêu đề</CardTitle>
  </CardHeader>
  <CardContent>Nội dung</CardContent>
</Card>

// Dialog
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Tiêu đề dialog</DialogTitle>
    </DialogHeader>
    {/* Nội dung */}
  </DialogContent>
</Dialog>
```

---

## 🔄 Navigation

### Sử dụng `useNavigate` hook

```typescript
import { useNavigate } from 'react-router-dom';

const MyComponent = () => {
  const navigate = useNavigate();
  
  // Điều hướng đến trang khác
  navigate('/admin/dashboard');
  navigate('/admin/sach');
  navigate(-1); // Quay lại trang trước
  navigate('/admin/dashboard', { replace: true }); // Replace history
};
```

### Nút Quay Về Dashboard

Mẫu code để thêm nút quay về:

```typescript
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';

const MyPage = () => {
  const navigate = useNavigate();
  
  return (
    <div>
      {/* Nút lớn ở trên */}
      <Button
        variant="outline"
        onClick={() => navigate('/admin/dashboard')}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay về Dashboard
      </Button>
      
      {/* Nút icon nhỏ bên cạnh tiêu đề */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate('/admin/dashboard')}
      >
        <Home className="h-5 w-5" />
      </Button>
    </div>
  );
};
```

---

## 🚀 Chạy Project

### 1. Cài đặt dependencies
```bash
cd view
npm install
```

### 2. Chạy development server
```bash
npm run dev
```

Ứng dụng sẽ chạy tại: `http://localhost:5173`

### 3. Build production
```bash
npm run build
```

---

## 🔍 Debugging

### 1. Kiểm tra Routes
- Mở DevTools → Network tab
- Xem các request API
- Kiểm tra console logs

### 2. Kiểm tra Authentication
- Mở DevTools → Application → Local Storage
- Kiểm tra `admin_token` và `admin_info`
- Xem console logs từ AuthProvider

### 3. Lỗi Phổ Biến

**Lỗi 401 Unauthorized:**
- Token hết hạn → Tự động redirect về login
- Kiểm tra token trong localStorage

**Lỗi 404:**
- Kiểm tra route có đúng trong App.tsx không
- Kiểm tra backend API có endpoint tương ứng không

**Lỗi CORS:**
- Kiểm tra backend có cấu hình CORS đúng không
- Kiểm tra `VITE_API_BASE_URL` trong `.env`

---

## 📝 Checklist Khi Thêm Tính Năng Mới

- [ ] Tạo component trong `pages/admin/` hoặc `pages/user/`
- [ ] Thêm route vào `App.tsx`
- [ ] Nếu cần protected → bọc bằng `<ProtectedRoute>`
- [ ] Tạo service trong `services/` nếu cần API mới
- [ ] Export service từ `services/index.ts` (nếu muốn)
- [ ] Thêm nút quay về Dashboard (nếu là trang admin)
- [ ] Thêm link trong Dashboard nếu cần
- [ ] Test authentication flow
- [ ] Test CRUD operations (nếu có)

---

## 🗺️ Bản Đồ Routes Hiện Tại

```
/ (Public)
├── HomePage

/admin (Public)
└── /login
    └── AdminLoginPage

/admin (Protected - Cần đăng nhập)
├── /dashboard
│   └── AdminDashboard
│       ├── [Link] → /admin/sach
│       └── [Link] → /admin/danhmuc
│
├── /sach
│   └── AdminQuanLySach
│       ├── [Nút] Quay về Dashboard
│       ├── [Nút] Thêm sách
│       ├── [Nút] Xem/Sửa/Xóa
│       └── [Dialog] Form thêm/sửa
│
└── /danhmuc
    └── AdminQuanLyDanhMuc
        ├── [Nút] Quay về Dashboard
        ├── [Nút] Thêm danh mục
        ├── [Nút] Xem/Sửa/Xóa
        └── [Dialog] Form thêm/sửa

* (Không khớp)
└── NotFound
```

---

## 💡 Tips & Best Practices

1. **Luôn sử dụng ProtectedRoute cho admin pages**
2. **Tách services theo module để dễ quản lý**
3. **Sử dụng TypeScript interfaces cho type safety**
4. **Xử lý lỗi đầy đủ với try-catch và toast notifications**
5. **Loading states khi đang fetch data**
6. **Validation form trước khi submit**
7. **Sử dụng React hooks đúng cách (useState, useEffect, useCallback)**

---

## 📞 Liên Hệ & Hỗ Trợ

Nếu có vấn đề hoặc cần hỗ trợ:
1. Kiểm tra console logs
2. Kiểm tra Network tab trong DevTools
3. Kiểm tra backend có đang chạy không
4. Kiểm tra CORS configuration

---

## 📚 Tài Liệu Tham Khảo

- [React Router Documentation](https://reactrouter.com/)
- [Axios Documentation](https://axios-http.com/)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { 
  createDonHang, 
  getDonHangById,
  type CreateDonHangRequest, 
  type DonHang 
} from '../../services/donHangService';
import { 
  getAllPhuongThucThanhToan, 
  type PhuongThucThanhToan 
} from '../../services/phuongThucThanhToanService';
import { 
  getAllPhuongThucVanChuyen, 
  type PhuongThucVanChuyen 
} from '../../services/phuongThucvanChuyenService';
import { 
  getVoucherByCode,
  type Voucher 
} from '../../services/voucherService';
import { toast } from 'sonner';
import { 
  MapPin, 
  CreditCard, 
  Truck, 
  Tag, 
  ShoppingCart,
  Loader2,
  CheckCircle2,
  X,
  ArrowLeft,
  User,
  Mail,
  Phone,
  Package
} from 'lucide-react';
import { useCart } from '../../hooks/useCartContext';
import { useUserAuth } from '../../hooks/useUserAuth';
import { deleteChiTietGioHang } from '../../services/chiTietGioHangService';
import { getAddressesByCustomer, type SoDiaChi } from '../../services/soDiaChiService';
import {
  getGHNProvinces,
  getGHNDistricts,
  getGHNWards,
  calculateGHNShippingFee,
  getGHNAvailableServices,
  createGHNOrder,
  calculateGHTKShippingFee,
  createGHTKOrder,
  type GHNProvince,
  type GHNDistrict,
  type GHNWard,
  type GHNService
} from '../../services/shippingService';

const UserThanhToan = () => {
  const navigate = useNavigate();
  const { cartItems: cartItemsFromContext, loading: cartLoading, refreshCart, gioHangId } = useCart();
  const { user } = useUserAuth();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<DonHang | null>(null);

  // Form data
  const [customerInfo, setCustomerInfo] = useState({
    ten_nguoi_nhan: user?.ho_ten || '',
    email_nguoi_nhan: user?.email || '',
    sdt_nguoi_nhan: user?.so_dien_thoai || '',
    dia_chi_giao_hang: '',
    ghi_chu: ''
  });
  const [phuongThucThanhToanList, setPhuongThucThanhToanList] = useState<PhuongThucThanhToan[]>([]);
  const [phuongThucVanChuyenList, setPhuongThucVanChuyenList] = useState<PhuongThucVanChuyen[]>([]);
  const [selectedPhuongThucThanhToan, setSelectedPhuongThucThanhToan] = useState<number>(0);
  const [selectedPaymentName, setSelectedPaymentName] = useState<string>('');
  const [selectedPhuongThucVanChuyen, setSelectedPhuongThucVanChuyen] = useState<number>(0);
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
  const [checkingVoucher, setCheckingVoucher] = useState(false);
  
  // Selected items for checkout - lấy từ localStorage (chỉ đọc, không cho chọn ở đây)
  const selectedItemsFromStorage = useMemo(() => {
    try {
      const saved = localStorage.getItem('selectedCartItems');
      if (saved) {
        const ids = JSON.parse(saved) as number[];
        return new Set(ids);
      }
    } catch (error) {
      console.error('Error loading selected items from localStorage:', error);
    }
    return new Set<number>();
  }, []);

  const normalizeText = (value?: string) => (value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

  const isMethodVnpay = (name?: string) => normalizeText(name).includes('vnpay');
  const isVnpaySelected = useMemo(() => isMethodVnpay(selectedPaymentName), [selectedPaymentName, isMethodVnpay]);
  
  const isMethodSepay = (name?: string) => normalizeText(name).includes('sepay');
  const isSepaySelected = useMemo(() => isMethodSepay(selectedPaymentName), [selectedPaymentName, isMethodSepay]);
  
  // Shipping provider selection (GHN or GHTK)
  const [selectedShippingProvider, setSelectedShippingProvider] = useState<'ghn' | 'ghtk'>('ghn');
  
  // GHN states
  const [ghnProvinces, setGhnProvinces] = useState<GHNProvince[]>([]);
  const [ghnDistricts, setGhnDistricts] = useState<GHNDistrict[]>([]);
  const [ghnWards, setGhnWards] = useState<GHNWard[]>([]);
  const [ghnServices, setGhnServices] = useState<GHNService[]>([]);
  const [selectedGhnProvinceId, setSelectedGhnProvinceId] = useState<number | null>(null);
  const [selectedGhnDistrictId, setSelectedGhnDistrictId] = useState<number | null>(null);
  const [selectedGhnWardCode, setSelectedGhnWardCode] = useState<string>('');
  const [selectedGhnServiceTypeId, setSelectedGhnServiceTypeId] = useState<number>(2); // Mặc định Standard
  const [ghnShippingFee, setGhnShippingFee] = useState<number>(0);
  const [calculatingGhnFee, setCalculatingGhnFee] = useState(false);
  const [ghnError, setGhnError] = useState<string>('');
  
  // GHTK states (dùng tên từ GHN dropdown để đảm bảo format đúng)
  const [ghtkProvince, setGhtkProvince] = useState<string>('');
  const [ghtkDistrict, setGhtkDistrict] = useState<string>('');
  const [ghtkWard, setGhtkWard] = useState<string>('');
  const [ghtkShippingFee, setGhtkShippingFee] = useState<number>(0);
  const [calculatingGhtkFee, setCalculatingGhtkFee] = useState(false);
  
  // Check if selected shipping method is dynamic shipping (GHN or GHTK)
  const selectedShippingMethod = phuongThucVanChuyenList.find(
    m => m.phuong_thuc_van_chuyen_id === selectedPhuongThucVanChuyen
  );
  const isDynamicShipping = useMemo(() => {
    if (!selectedShippingMethod) return false;
    const methodName = normalizeText(selectedShippingMethod.ten_phuong_thuc || '');
    // Nhận diện dynamic shipping: tất cả phương thức có "giao hàng" đều dùng dynamic shipping (phí động)
    // Hoặc nếu phương thức có phi_co_ban = null hoặc = 0 thì là dynamic shipping
    return methodName.includes('giao hàng') || 
           methodName.includes('giao hang') ||
           selectedShippingMethod.phi_co_ban === null ||
           selectedShippingMethod.phi_co_ban === 0;
  }, [selectedShippingMethod]);
  
  // Alias for backward compatibility
  const isGhnShipping = isDynamicShipping && selectedShippingProvider === 'ghn';
  const isGhtkShipping = isDynamicShipping && selectedShippingProvider === 'ghtk';

  const [defaultAddress, setDefaultAddress] = useState<SoDiaChi | null>(null);

  // Load data
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  useEffect(() => {
    if (user) {
      setCustomerInfo(prev => ({
        ...prev,
        ten_nguoi_nhan: user.ho_ten || prev.ten_nguoi_nhan,
        email_nguoi_nhan: user.email || prev.email_nguoi_nhan,
        sdt_nguoi_nhan: user.so_dien_thoai || prev.sdt_nguoi_nhan
      }));
    }
  }, [user]);

  useEffect(() => {
    // Chỉ redirect sau khi đã load xong và giỏ hàng thực sự trống
    if (!cartLoading && cartItemsFromContext.length === 0) {
      const timer = setTimeout(() => {
        toast.error('Giỏ hàng trống. Vui lòng thêm sản phẩm vào giỏ hàng.');
        navigate('/cart');
      }, 500);
      return () => clearTimeout(timer);
    }
    
    // Kiểm tra nếu không có sản phẩm nào được chọn từ giỏ hàng
    if (selectedItemsFromStorage.size === 0 && cartItemsFromContext.length > 0) {
      toast.error('Vui lòng chọn sản phẩm ở giỏ hàng trước khi thanh toán');
      const timer = setTimeout(() => {
        navigate('/cart');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [cartItemsFromContext.length, cartLoading, navigate, selectedItemsFromStorage.size]);

  useEffect(() => {
    if (!user?.id) return;
    const fetchAddresses = async () => {
      try {
        const response = await getAddressesByCustomer(user.id);
        const list = response.data || [];
        if (list.length > 0) {
          const preferred = list.find((addr) => addr.la_mac_dinh) || list[0];
          applyAddressToForm(preferred);
          
          // Nếu địa chỉ có GHN info, set vào GHN states
          if (preferred.ghn_province_id && preferred.ghn_district_id && preferred.ghn_ward_code) {
            setSelectedGhnProvinceId(preferred.ghn_province_id);
            setSelectedGhnDistrictId(preferred.ghn_district_id);
            setSelectedGhnWardCode(preferred.ghn_ward_code);
          }
        }
      } catch (error) {
        console.error('Error fetching addresses:', error);
      }
    };
    fetchAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Load GHN provinces khi component mount (cho cả GHN và GHTK vì GHTK cũng dùng dropdown GHN)
  useEffect(() => {
    if (isDynamicShipping) {
      const loadProvinces = async () => {
        try {
          console.log('Loading GHN provinces...');
          let provinces = await getGHNProvinces();
          
          // Filter bỏ các tỉnh test/không hợp lệ (bảo vệ thêm ở frontend)
          provinces = provinces.filter(province => {
            const provinceName = (province.ProvinceName || '').toLowerCase();
            const invalidKeywords = ['test', 'alert', 'ngoc'];
            return !invalidKeywords.some(keyword => provinceName.includes(keyword));
          });

          console.log('Loaded provinces:', provinces.length, '(after filtering)');
          setGhnProvinces(provinces);
          if (provinces.length === 0) {
            toast.warning('Không có dữ liệu tỉnh/thành phố');
          }
        } catch (error: unknown) {
          console.error('Error loading GHN provinces:', error);
          const errorObj = error as { message?: string };
          let errorMsg = errorObj?.message || 'Không thể tải danh sách tỉnh/thành phố';
          
          // Xử lý các loại lỗi khác nhau
          if (errorMsg.includes('Failed to fetch') || errorMsg.includes('kết nối') || errorMsg.includes('network')) {
            errorMsg = 'Không thể kết nối đến server. Vui lòng kiểm tra backend có đang chạy không.';
          } else if (errorMsg.includes('Token') || errorMsg.includes('token') || errorMsg.includes('not valid')) {
            errorMsg = 'Token GHN không hợp lệ. Vui lòng kiểm tra lại token trong cấu hình backend.';
          }
          
          toast.error(errorMsg);
          setGhnError(errorMsg);
        }
      };
      loadProvinces();
    } else {
      // Reset khi không chọn phương thức vận chuyển
      setGhnProvinces([]);
      setGhnDistricts([]);
      setGhnWards([]);
      setSelectedGhnProvinceId(null);
      setSelectedGhnDistrictId(null);
      setSelectedGhnWardCode('');
      // Reset GHTK states
      setGhtkProvince('');
      setGhtkDistrict('');
      setGhtkWard('');
      setGhtkShippingFee(0);
    }
  }, [selectedPhuongThucVanChuyen, selectedShippingProvider, isDynamicShipping]);

  // Load GHN districts when province changes (cho cả GHN và GHTK)
  useEffect(() => {
    if (isDynamicShipping && selectedGhnProvinceId) {
      const loadDistricts = async () => {
        try {
          setGhnDistricts([]);
          setGhnWards([]);
          setSelectedGhnDistrictId(null);
          setSelectedGhnWardCode('');
          setGhnShippingFee(0);
          
          const districts = await getGHNDistricts(selectedGhnProvinceId);
          setGhnDistricts(districts);
        } catch (error) {
          console.error('Error loading GHN districts:', error);
          toast.error('Không thể tải danh sách quận/huyện');
        }
      };
      loadDistricts();
    }
  }, [isDynamicShipping, selectedGhnProvinceId]);

  // Load GHN wards when district changes (cho cả GHN và GHTK)
  useEffect(() => {
    if (isDynamicShipping && selectedGhnDistrictId) {
      const loadWards = async () => {
        try {
          setGhnWards([]);
          setSelectedGhnWardCode('');
          setGhnServices([]);
          setGhnShippingFee(0);
          
          const wards = await getGHNWards(selectedGhnDistrictId);
          setGhnWards(wards);
        } catch (error) {
          console.error('Error loading GHN wards:', error);
          toast.error('Không thể tải danh sách phường/xã');
        }
      };
      loadWards();
    }
  }, [isDynamicShipping, selectedGhnDistrictId]);

  // Load GHN available services when ward is selected (chỉ cho GHN)
  useEffect(() => {
    if (isGhnShipping && selectedGhnDistrictId && selectedGhnWardCode) {
      const loadServices = async () => {
        try {
          setGhnServices([]);
          const services = await getGHNAvailableServices(selectedGhnDistrictId, selectedGhnWardCode);
          setGhnServices(services);
          
          // Kiểm tra service type đã chọn có sẵn không
          const selectedService = services.find(s => s.service_type_id === selectedGhnServiceTypeId);
          if (!selectedService) {
            // Nếu service type đã chọn không có, thử tìm service type tương ứng
            if (selectedGhnServiceTypeId === 5) {
              // Nếu hỏa tốc không có, thử tìm service type 2 (tiêu chuẩn)
              const standardService = services.find(s => s.service_type_id === 2);
              if (standardService) {
                setSelectedGhnServiceTypeId(2);
                setGhnError('Dịch vụ hỏa tốc không có sẵn cho địa chỉ này. Đã chuyển sang giao hàng tiêu chuẩn.');
              } else if (services.length > 0) {
                // Nếu không có cả 2, dùng service đầu tiên có sẵn
                setSelectedGhnServiceTypeId(services[0].service_type_id);
                setGhnError('Dịch vụ hỏa tốc không có sẵn cho địa chỉ này. Đã chuyển sang dịch vụ khác.');
              } else {
                setGhnError('Không có dịch vụ giao hàng nào cho địa chỉ này.');
              }
            } else if (services.length > 0) {
              // Nếu không phải hỏa tốc, dùng service đầu tiên có sẵn
              setSelectedGhnServiceTypeId(services[0].service_type_id);
            }
          } else {
            // Nếu service có sẵn, xóa lỗi
            setGhnError('');
          }
        } catch (error) {
          console.error('Error loading GHN services:', error);
          setGhnError('Không thể tải danh sách dịch vụ giao hàng. Vui lòng thử lại.');
        }
      };
      loadServices();
    } else {
      setGhnServices([]);
    }
  }, [isGhnShipping, selectedGhnDistrictId, selectedGhnWardCode, selectedGhnServiceTypeId]);

  // Tính tổng khối lượng đơn hàng (theo kg) - dùng giá trị mặc định nhỏ để tránh lỗi
  const calculateTotalWeight = useMemo(() => {
    // Không tính khối lượng từ sách, dùng giá trị mặc định nhỏ (0.5kg) để GHTK chấp nhận
    return 0.5;
  }, []);

  // Không kiểm tra giới hạn khối lượng GHTK nữa
  const isOverGHTKWeightLimit = false;

  // Calculate totals - chỉ tính các sản phẩm được chọn từ giỏ hàng
  const selectedCartItems = useMemo(() => {
    return cartItemsFromContext.filter((item) => {
      // Kiểm tra theo chi_tiet_gio_hang_id
      if (item.chi_tiet_gio_hang_id) {
        return selectedItemsFromStorage.has(item.chi_tiet_gio_hang_id);
      }
      return false;
    });
  }, [cartItemsFromContext, selectedItemsFromStorage]);

  // Calculate GHTK shipping fee when address changes (dùng tên từ GHN dropdown)
  useEffect(() => {

    if (isGhtkShipping && selectedGhnProvinceId && selectedGhnDistrictId && selectedGhnWardCode && ghtkProvince && ghtkDistrict && ghtkWard) {
      const calculateFee = async () => {
        try {
          setCalculatingGhtkFee(true);
          
          // Tính tổng giá trị hàng hóa - chỉ tính các sản phẩm được chọn
          const totalValue = selectedCartItems.reduce((sum, item) => {
            const price = item.sach?.gia_ban ? parseFloat(item.sach.gia_ban.toString()) : 0;
            return sum + (price * item.so_luong);
          }, 0);
          
          // Dùng khối lượng mặc định nhỏ (500g) để tính phí, không tính khối lượng thực tế
          const weightInGram = 500; // 0.5kg mặc định
          
          console.log('Calculating GHTK fee:', {
            province: ghtkProvince,
            district: ghtkDistrict,
            ward: ghtkWard,
            address: customerInfo.dia_chi_giao_hang,
            weight: weightInGram,
            value: totalValue
          });
          
          const feeData = await calculateGHTKShippingFee({
            province: ghtkProvince,
            district: ghtkDistrict,
            ward: ghtkWard,
            address: customerInfo.dia_chi_giao_hang.trim() || undefined,
            weight: weightInGram, // Dùng giá trị mặc định 500g
            value: Math.round(totalValue),
            transport: 'fly'
          });
          
          if (feeData.success && feeData.fee > 0) {
            setGhtkShippingFee(feeData.fee);
          } else {
            setGhtkShippingFee(0);
          }
        } catch (error: unknown) {
          console.error('Error calculating GHTK fee:', error);
          setGhtkShippingFee(0);
        } finally {
          setCalculatingGhtkFee(false);
        }
      };
      
      // Debounce để tránh gọi API quá nhiều
      const timer = setTimeout(calculateFee, 500);
      return () => clearTimeout(timer);
    } else if (!isGhtkShipping || !selectedGhnProvinceId || !selectedGhnDistrictId || !selectedGhnWardCode || !ghtkProvince || !ghtkDistrict || !ghtkWard) {
      setGhtkShippingFee(0);
    }
  }, [isGhtkShipping, isOverGHTKWeightLimit, calculateTotalWeight, selectedGhnProvinceId, selectedGhnDistrictId, selectedGhnWardCode, ghtkProvince, ghtkDistrict, ghtkWard, selectedCartItems, customerInfo.dia_chi_giao_hang]);

  // Calculate GHN shipping fee when ward/district/service changes (chỉ cho GHN)
  // Đợi services load xong và có service type hợp lệ trước khi tính phí
  useEffect(() => {
    if (isGhnShipping && selectedGhnDistrictId && selectedGhnWardCode && ghnServices.length > 0) {
      // Kiểm tra service type có sẵn không
      const selectedService = ghnServices.find(s => s.service_type_id === selectedGhnServiceTypeId);
      if (!selectedService) {
        // Nếu service type không có, không tính phí
        setGhnShippingFee(0);
        return;
      }

      const calculateFee = async () => {
        try {
          setCalculatingGhnFee(true);
          
          // Tính tổng trọng lượng (mặc định 200g mỗi sách) - chỉ tính các sản phẩm được chọn
          const totalWeight = selectedCartItems.reduce((sum, item) => {
            const quantity = item.so_luong || 0;
            return sum + (quantity * 200); // 200g mỗi cuốn sách
          }, 0);
          
          // GHN yêu cầu weight tối thiểu 200g, đảm bảo luôn >= 200g
          // Nếu giỏ hàng rỗng hoặc weight = 0, dùng 200g mặc định
          const validWeight = totalWeight > 0 ? Math.max(totalWeight, 200) : 200;
          
          console.log('Calculating shipping fee:', {
            cartItems: cartItemsFromContext.length,
            totalWeight,
            validWeight,
            serviceTypeId: selectedGhnServiceTypeId,
            serviceId: selectedService.service_id
          });
          
          const feeData = await calculateGHNShippingFee({
            toDistrictId: selectedGhnDistrictId,
            toWardCode: selectedGhnWardCode,
            weight: validWeight,
            length: 20,
            width: 15,
            height: 2,
            serviceTypeId: selectedGhnServiceTypeId,
            serviceId: selectedService.service_id || undefined
          });
          
          if (feeData.total && feeData.total > 0) {
            setGhnShippingFee(feeData.total);
            // Xóa lỗi nếu tính phí thành công
            if (ghnError && !ghnError.includes('chuyển sang')) {
              setGhnError('');
            }
          } else {
            setGhnShippingFee(0);
            setGhnError('Không thể tính phí vận chuyển cho dịch vụ này. Vui lòng thử lại.');
          }
        } catch (error: unknown) {
          console.error('Error calculating GHN fee:', error);
          const errorObj = error as { response?: { data?: { message?: string } }; message?: string };
          const errorMsg = errorObj?.response?.data?.message || errorObj?.message || 'Không thể tính phí vận chuyển. Vui lòng thử lại.';
          setGhnError(errorMsg);
          setGhnShippingFee(0);
        } finally {
          setCalculatingGhnFee(false);
        }
      };
      
      // Debounce để tránh gọi API quá nhiều
      const timer = setTimeout(calculateFee, 500);
      return () => clearTimeout(timer);
    } else if (isGhnShipping && selectedGhnDistrictId && selectedGhnWardCode && ghnServices.length === 0) {
      // Đang chờ load services
      setGhnShippingFee(0);
    } else if (!isGhnShipping || !selectedGhnDistrictId || !selectedGhnWardCode) {
      // Reset phí nếu không đủ điều kiện
      setGhnShippingFee(0);
      if (!isGhnShipping) {
        setGhnError('');
      }
    }
  }, [isGhnShipping, selectedGhnDistrictId, selectedGhnWardCode, selectedGhnServiceTypeId, ghnServices, selectedCartItems, ghnError]);


  const loadData = async () => {
    try {
      setLoading(true);
      const [thanhToan, vanChuyen] = await Promise.all([
        getAllPhuongThucThanhToan(),
        getAllPhuongThucVanChuyen()
      ]);
      // Chỉ lấy phương thức có trạng thái active
      const activeThanhToan = thanhToan.filter(p => {
        if (!p.trang_thai) return false;
        return true; // Hiển thị tất cả phương thức thanh toán active, bao gồm cả SePay
      });
      // Lọc bỏ phương thức hỏa tốc
      const activeVanChuyen = vanChuyen.filter(p => {
        if (!p.trang_thai) return false;
        const methodName = normalizeText(p.ten_phuong_thuc || '');
        // Bỏ phương thức có tên chứa "hỏa tốc" hoặc "express"
        return !methodName.includes('hỏa tốc') && 
               !methodName.includes('hoa toc') && 
               !methodName.includes('express');
      });
      setPhuongThucThanhToanList(activeThanhToan);
      setPhuongThucVanChuyenList(activeVanChuyen);
      
      // Set default values
      if (activeThanhToan.length > 0 && selectedPhuongThucThanhToan === 0) {
        setSelectedPhuongThucThanhToan(activeThanhToan[0].phuong_thuc_thanh_toan_id);
        setSelectedPaymentName(activeThanhToan[0].ten_phuong_thuc || '');
      } else if (selectedPhuongThucThanhToan !== 0) {
        const found = activeThanhToan.find(p => p.phuong_thuc_thanh_toan_id === selectedPhuongThucThanhToan);
        if (found) {
          setSelectedPaymentName(found.ten_phuong_thuc || '');
        }
      }
      // Tự động chọn phương thức GHN đầu tiên (nếu có)
      if (activeVanChuyen.length > 0) {
        // Tìm phương thức GHN (có "giao hàng" trong tên)
        const ghnMethod = activeVanChuyen.find(m => {
          const methodName = normalizeText(m.ten_phuong_thuc || '');
          return methodName.includes('giao hàng') || methodName.includes('giao hang');
        });
        if (ghnMethod) {
          setSelectedPhuongThucVanChuyen(ghnMethod.phuong_thuc_van_chuyen_id);
        } else if (selectedPhuongThucVanChuyen === 0) {
          // Nếu không có GHN, chọn phương thức đầu tiên
          setSelectedPhuongThucVanChuyen(activeVanChuyen[0].phuong_thuc_van_chuyen_id);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };


  const calculateSubtotal = () => {
    const total = selectedCartItems.reduce((total, item) => {
      const price = item.sach?.gia_ban ? parseFloat(item.sach.gia_ban.toString()) : 0;
      return total + (price * item.so_luong);
    }, 0);
    // Làm tròn đến hàng đơn vị
    return Math.round(total);
  };

  const calculateShippingFee = () => {
    // Tự động tính phí GHN khi có đủ địa chỉ
    if (isGhnShipping && ghnShippingFee > 0) {
      return Math.round(ghnShippingFee);
    }
    
    // Tự động tính phí GHTK khi có đủ địa chỉ
    if (isGhtkShipping && ghtkShippingFee > 0) {
      return Math.round(ghtkShippingFee);
    }
    
    // Nếu chưa tính được phí, trả về 0
    return 0;
  };

  const calculateVoucherDiscount = () => {
    if (!appliedVoucher) return 0;
    
    const subtotal = calculateSubtotal();
    
    // Check minimum order value
    if (appliedVoucher.don_hang_toi_thieu && subtotal < appliedVoucher.don_hang_toi_thieu) {
      return 0;
    }

    let discount = 0;
    if (appliedVoucher.loai_giam_gia === 'tiền') {
      discount = appliedVoucher.gia_tri_giam;
    } else if (appliedVoucher.loai_giam_gia === 'phần trăm') {
      discount = (subtotal * appliedVoucher.gia_tri_giam) / 100;
    }

    // Check max discount
    if (appliedVoucher.giam_toi_da && discount > appliedVoucher.giam_toi_da) {
      discount = appliedVoucher.giam_toi_da;
    }

    // Đảm bảo giảm giá không âm và làm tròn đến hàng đơn vị
    return Math.max(0, Math.round(discount));
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const shipping = calculateShippingFee();
    const voucherDiscount = calculateVoucherDiscount();
    const total = subtotal + shipping - voucherDiscount;
    // Đảm bảo tổng cộng không âm và làm tròn đến hàng đơn vị
    return Math.max(0, Math.round(total));
  };

  const handleSelectPaymentMethod = (method: PhuongThucThanhToan) => {
    setSelectedPhuongThucThanhToan(method.phuong_thuc_thanh_toan_id);
    setSelectedPaymentName(method.ten_phuong_thuc || '');
  };


  // Apply voucher
  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      toast.error('Vui lòng nhập mã voucher');
      return;
    }

    try {
      setCheckingVoucher(true);
      const voucher = await getVoucherByCode(voucherCode.trim().toUpperCase());
      
      // Check if voucher is active
      if (!voucher.trang_thai) {
        toast.error('Voucher này không còn hiệu lực');
        return;
      }

      // Check expiration
      const now = new Date();
      if (voucher.ngay_het_han) {
        const expiryDate = new Date(voucher.ngay_het_han);
        if (now > expiryDate) {
          toast.error('Voucher đã hết hạn');
          return;
        }
      }

      // Check minimum order
      const subtotal = calculateSubtotal();
      if (voucher.don_hang_toi_thieu && subtotal < voucher.don_hang_toi_thieu) {
        toast.error(`Đơn hàng tối thiểu ${formatPrice(voucher.don_hang_toi_thieu)} để sử dụng voucher này`);
        return;
      }

      setAppliedVoucher(voucher);
      toast.success('Áp dụng voucher thành công!');
    } catch (error: unknown) {
      console.error('Error applying voucher:', error);
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Mã voucher không hợp lệ';
      toast.error(errorMessage);
      setAppliedVoucher(null);
    } finally {
      setCheckingVoucher(false);
    }
  };

  // Remove voucher
  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode('');
    toast.success('Đã xóa voucher');
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatAddress = (address: SoDiaChi) => {
    return [
      address.dia_chi_chi_tiet,
      address.phuong_xa,
      address.quan_huyen,
      address.tinh_thanh
    ]
      .filter(Boolean)
      .join(', ');
  };

  const applyAddressToForm = (address: SoDiaChi) => {
    setDefaultAddress(address);
    setCustomerInfo((prev) => ({
      ...prev,
      ten_nguoi_nhan: prev.ten_nguoi_nhan || address.ho_ten_nguoi_nhan,
      sdt_nguoi_nhan: prev.sdt_nguoi_nhan || address.so_dien_thoai_nguoi_nhan || '',
      dia_chi_giao_hang: formatAddress(address)
    }));
  };

  // Get image URL
  const getImageUrl = (url?: string | null) => {
    if (!url) return 'https://via.placeholder.com/300x400/6366f1/ffffff?text=No+Image';
    if (url.startsWith('http')) return url;
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    return `${apiBaseUrl}${url}`;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!customerInfo.ten_nguoi_nhan.trim()) {
      toast.error('Vui lòng nhập tên người nhận');
      return;
    }
    if (!customerInfo.sdt_nguoi_nhan.trim()) {
      toast.error('Vui lòng nhập số điện thoại');
      return;
    }
    if (!selectedPhuongThucThanhToan) {
      toast.error('Vui lòng chọn phương thức thanh toán');
      return;
    }
    
    // Validate dynamic shipping address (GHN or GHTK)
    if (isGhnShipping) {
      if (!selectedGhnProvinceId) {
        toast.error('Vui lòng chọn tỉnh/thành phố');
        return;
      }
      if (!selectedGhnDistrictId) {
        toast.error('Vui lòng chọn quận/huyện');
        return;
      }
      if (!selectedGhnWardCode) {
        toast.error('Vui lòng chọn phường/xã');
        return;
      }
      if (!customerInfo.dia_chi_giao_hang.trim()) {
        toast.error('Vui lòng nhập địa chỉ chi tiết (số nhà, tên đường)');
        return;
      }
      if (ghnShippingFee <= 0 && calculatingGhnFee) {
        toast.error('Vui lòng đợi hệ thống tính phí vận chuyển');
        return;
      }
      if (ghnShippingFee <= 0) {
        toast.error('Vui lòng chọn địa chỉ để tính phí vận chuyển');
        return;
      }
    } else if (isGhtkShipping) {
      if (!selectedGhnProvinceId) {
        toast.error('Vui lòng chọn tỉnh/thành phố');
        return;
      }
      if (!selectedGhnDistrictId) {
        toast.error('Vui lòng chọn quận/huyện');
        return;
      }
      if (!selectedGhnWardCode) {
        toast.error('Vui lòng chọn phường/xã');
        return;
      }
      if (!customerInfo.dia_chi_giao_hang.trim()) {
        toast.error('Vui lòng nhập địa chỉ chi tiết (số nhà, tên đường)');
        return;
      }
      if (ghtkShippingFee <= 0 && calculatingGhtkFee) {
        toast.error('Vui lòng đợi hệ thống tính phí vận chuyển GHTK');
        return;
      }
      if (ghtkShippingFee <= 0) {
        toast.error('Vui lòng chọn địa chỉ để tính phí vận chuyển GHTK');
        return;
      }
    } else {
      // Nếu không phải GHN, vẫn cần địa chỉ giao hàng
      if (!customerInfo.dia_chi_giao_hang.trim()) {
        toast.error('Vui lòng nhập địa chỉ giao hàng');
        return;
      }
    }
    
    if (selectedCartItems.length === 0) {
      toast.error('Không có sản phẩm nào được chọn. Vui lòng quay lại giỏ hàng để chọn sản phẩm.');
      navigate('/cart');
      return;
    }

    try {
      setSubmitting(true);

      const subtotal = calculateSubtotal();
      const shippingFee = calculateShippingFee();
      const voucherDiscount = calculateVoucherDiscount();
      const total = calculateTotal();

      const orderData: CreateDonHangRequest = {
        khach_hang_id: user?.id || null, // Thêm khach_hang_id nếu user đã đăng nhập
        ten_nguoi_nhan: customerInfo.ten_nguoi_nhan.trim(),
        email_nguoi_nhan: customerInfo.email_nguoi_nhan.trim() || null,
        sdt_nguoi_nhan: customerInfo.sdt_nguoi_nhan.trim(),
        dia_chi_giao_hang: customerInfo.dia_chi_giao_hang.trim(),
        phuong_thuc_thanh_toan_id: selectedPhuongThucThanhToan,
        phuong_thuc_van_chuyen_id: selectedPhuongThucVanChuyen,
        voucher_id: appliedVoucher?.voucher_id || null,
        tam_tinh: Math.round(subtotal),
        phi_van_chuyen: Math.round(shippingFee), // Luôn gửi phí (kể cả 0) để backend không lấy phi_co_ban
        giam_gia_voucher: voucherDiscount > 0 ? Math.round(voucherDiscount) : null,
        tong_tien: Math.round(total),
        chi_tiet_don_hang: selectedCartItems
          .filter(item => item.sach) // Lọc các item có sách hợp lệ
          .map(item => ({
            sach_id: item.sach!.sach_id, // Dùng ! vì đã filter ở trên
            so_luong: item.so_luong,
            gia_luc_mua: item.sach?.gia_ban ? parseFloat(item.sach.gia_ban.toString()) : 0
          }))
      };

      const newOrder = await createDonHang(orderData);
      
      // Nếu phương thức vận chuyển là GHN, tạo đơn hàng trên hệ thống GHN
      if (isGhnShipping && selectedGhnDistrictId && selectedGhnWardCode) {
        try {
          console.log('Creating GHN order...');
          
          // Tính tổng weight từ giỏ hàng (mặc định 200g mỗi cuốn sách) - chỉ tính các sản phẩm được chọn
          const totalWeight = selectedCartItems.reduce((sum, item) => {
            const itemWeight = 0.2 * item.so_luong; // 200g mỗi cuốn sách
            return sum + itemWeight;
          }, 0);
          
          // Tạo đơn hàng GHN
          const ghnOrderData = {
            toName: customerInfo.ten_nguoi_nhan.trim(),
            toPhone: customerInfo.sdt_nguoi_nhan.trim(),
            toAddress: customerInfo.dia_chi_giao_hang.trim(),
            toWardCode: selectedGhnWardCode,
            toDistrictId: selectedGhnDistrictId,
            toProvinceId: selectedGhnProvinceId || 0,
            weight: Math.max(Math.round(totalWeight * 1000), 200), // Chuyển từ kg sang gram, tối thiểu 200g
            serviceTypeId: selectedGhnServiceTypeId,
            paymentTypeId: selectedPhuongThucThanhToan === 1 ? 1 : 2, // 1: Người gửi trả, 2: Người nhận trả
            codAmount: selectedPhuongThucThanhToan === 1 ? 0 : Math.round(calculateTotal()), // COD nếu thanh toán khi nhận
            items: selectedCartItems
              .filter(item => item.sach)
              .map(item => ({
                name: item.sach?.ten_sach || "Sách",
                quantity: item.so_luong,
                weight: Math.max(Math.round(0.2 * 1000 * item.so_luong), 200) // 200g mỗi cuốn sách
              })),
            content: `Đơn hàng #${newOrder.ma_don_hang || newOrder.don_hang_id}`
          };
          
          const ghnResult = await createGHNOrder(ghnOrderData);
          
          if (ghnResult.success && ghnResult.orderCode) {
            console.log('✅ GHN order created successfully:', ghnResult.orderCode);
            toast.success(`Đơn hàng GHN đã được tạo: ${ghnResult.orderCode}`);
            // Có thể lưu orderCode vào database nếu cần
          } else {
            console.warn('⚠️ GHN order creation failed:', ghnResult.message);
            toast.warning(`Đơn hàng đã được tạo nhưng không thể tạo trên GHN: ${ghnResult.message || 'Lỗi không xác định'}`);
          }
        } catch (ghnError) {
          console.error('Error creating GHN order:', ghnError);
          // Không block flow, chỉ log lỗi
          toast.warning('Đơn hàng đã được tạo nhưng không thể tạo trên GHN. Vui lòng liên hệ admin.');
        }
      }
      
      // Nếu phương thức vận chuyển là GHTK, tạo đơn hàng trên hệ thống GHTK
      if (isGhtkShipping && selectedGhnProvinceId && selectedGhnDistrictId && selectedGhnWardCode && ghtkProvince && ghtkDistrict && ghtkWard) {
        try {
          console.log('Creating GHTK order...');
          
          // Tính tổng giá trị hàng hóa
          
          const totalValue = cartItemsFromContext.reduce((sum, item) => {
            const price = item.sach?.gia_ban ? parseFloat(item.sach.gia_ban.toString()) : 0;
            return sum + (price * item.so_luong);
          }, 0);
          
          // GHTK tính tổng weight từ products array: sum(weight * quantity) và từ chối nếu >= 20kg
          // Để an toàn, đảm bảo tổng weight < 19kg (19000g)
          const MAX_TOTAL_WEIGHT_GRAM = 19000; // 19kg để an toàn, dưới 20kg
          
          // Tính tổng số lượng sản phẩm - chỉ tính các sản phẩm được chọn
          const totalQuantity = selectedCartItems.reduce((sum, item) => sum + item.so_luong, 0);
          
          // Chia đều weight cho tổng số lượng, đảm bảo tổng <= 19kg
          // Mỗi đơn vị tối thiểu 1g
          const weightPerUnit = totalQuantity > 0 
            ? Math.floor(MAX_TOTAL_WEIGHT_GRAM / totalQuantity) 
            : 1;
          
          // Đảm bảo weightPerUnit >= 1g và <= 1000g (1kg) để hợp lý
          const finalWeightPerUnit = Math.max(Math.min(weightPerUnit, 1000), 1);
          
          // Tính lại tổng weight thực tế sau khi điều chỉnh
          const actualTotalWeight = finalWeightPerUnit * totalQuantity;
          const weightInGram = Math.min(actualTotalWeight, MAX_TOTAL_WEIGHT_GRAM);
          
          // Tạo đơn hàng GHTK - dùng tên từ GHN dropdown (đã được set vào ghtkProvince, ghtkDistrict, ghtkWard)
          // GHTK yêu cầu thông tin street/hamlet (thôn/ấp/xóm/tổ)
          // Đảm bảo có ít nhất một trong hai field này để tránh lỗi
          const fullAddress = customerInfo.dia_chi_giao_hang.trim();
          
          // Tách địa chỉ: phần đầu thường là số nhà/tên đường, phần sau có thể là thôn/ấp/xóm
          // Nếu địa chỉ có dấu phẩy, tách ra; nếu không thì dùng toàn bộ cho cả hai
          const addressParts = fullAddress.split(',').map(s => s.trim()).filter(s => s);
          const streetAddress = addressParts[0] || fullAddress; // Số nhà, tên đường
          // Nếu có nhiều phần, phần sau là thôn/ấp/xóm; nếu không thì dùng toàn bộ địa chỉ
          const hamletAddress = addressParts.length > 1 ? addressParts.slice(1).join(', ') : fullAddress;
          
          const ghtkOrderData = {
            orderId: newOrder.ma_don_hang || `ORDER_${newOrder.don_hang_id}`,
            toName: customerInfo.ten_nguoi_nhan.trim(),
            toPhone: customerInfo.sdt_nguoi_nhan.trim(),
            toAddress: fullAddress, // Địa chỉ đầy đủ
            toProvince: ghtkProvince.trim(), // Tên từ GHN dropdown
            toDistrict: ghtkDistrict.trim(), // Tên từ GHN dropdown
            toWard: ghtkWard.trim(), // Tên từ GHN dropdown
            toStreet: streetAddress || fullAddress, // GHTK yêu cầu street (số nhà, tên đường) - BẮT BUỘC
            toHamlet: hamletAddress || fullAddress, // GHTK yêu cầu hamlet (thôn/ấp/xóm/tổ) - BẮT BUỘC, nếu không có thì dùng toàn bộ địa chỉ
            weight: weightInGram, // Dùng giá trị mặc định 500g
            value: Math.round(totalValue),
            pickMoney: selectedPhuongThucThanhToan === 1 ? 0 : Math.round(calculateTotal()), // COD nếu thanh toán khi nhận
            isFreeship: selectedPhuongThucThanhToan === 1 ? 1 : 0, // 1: shop trả ship, 0: người nhận trả ship
            note: customerInfo.ghi_chu.trim() || `Đơn hàng #${newOrder.ma_don_hang || newOrder.don_hang_id}`,
            products: selectedCartItems
              .filter(item => item.sach)
              .map(item => ({
                name: item.sach?.ten_sach || "Sách",
                weight: finalWeightPerUnit, // Weight cho mỗi đơn vị, đảm bảo tổng weight của tất cả products <= 500g
                quantity: item.so_luong,
                price: item.sach?.gia_ban ? Math.round(parseFloat(item.sach.gia_ban.toString())) : 0
              })),
            transport: 'fly' as 'fly' | 'road',
            pickOption: 'cod' as 'cod' | 'post'
          };
          
          // Kiểm tra và log tổng weight của products để debug
          const totalProductsWeight = ghtkOrderData.products.reduce((sum, p) => sum + (p.weight * p.quantity), 0);
          console.log('GHTK Order Weight Check:', {
            orderWeight: weightInGram,
            totalProductsWeight: totalProductsWeight,
            totalProductsWeightKg: (totalProductsWeight / 1000).toFixed(2),
            totalQuantity: totalQuantity,
            weightPerUnit: finalWeightPerUnit,
            maxAllowed: MAX_TOTAL_WEIGHT_GRAM
          });
          
          // Đảm bảo tổng weight của products < 19kg (19000g)
          if (totalProductsWeight >= MAX_TOTAL_WEIGHT_GRAM) {
            console.warn(`⚠️ Total products weight (${totalProductsWeight}g = ${(totalProductsWeight/1000).toFixed(2)}kg) >= ${MAX_TOTAL_WEIGHT_GRAM}g, adjusting...`);
            const adjustmentFactor = (MAX_TOTAL_WEIGHT_GRAM - 100) / totalProductsWeight; // Trừ 100g để an toàn
            ghtkOrderData.products = ghtkOrderData.products.map(p => ({
              ...p,
              weight: Math.max(Math.floor(p.weight * adjustmentFactor), 1) // Tối thiểu 1g
            }));
            
            // Tính lại tổng weight sau khi điều chỉnh
            const adjustedTotalWeight = ghtkOrderData.products.reduce((sum, p) => sum + (p.weight * p.quantity), 0);
            ghtkOrderData.weight = Math.min(adjustedTotalWeight, MAX_TOTAL_WEIGHT_GRAM);
            console.log('Adjusted order weight:', ghtkOrderData.weight, 'grams =', (ghtkOrderData.weight/1000).toFixed(2), 'kg');
          }
          
          console.log('GHTK Order Data:', JSON.stringify(ghtkOrderData, null, 2));
          
          const ghtkResult = await createGHTKOrder(ghtkOrderData);
          
          console.log('GHTK Result:', ghtkResult);
          
          if (ghtkResult.success && ghtkResult.orderCode) {
            console.log('✅ GHTK order created successfully:', ghtkResult.orderCode);
            toast.success(`Đơn hàng GHTK đã được tạo: ${ghtkResult.orderCode}`);
            // Có thể lưu orderCode vào database nếu cần
          } else {
            const errorMessage = ghtkResult.error || ghtkResult.message || 'Lỗi không xác định';
            console.warn('⚠️ GHTK order creation failed:', errorMessage);
            console.warn('GHTK Response:', ghtkResult);
            
            // Hiển thị lỗi chi tiết hơn
            toast.warning(`Đơn hàng đã được tạo nhưng không thể tạo trên GHTK: ${errorMessage}`, {
              duration: 5000
            });
          }
        } catch (ghtkError: unknown) {
          console.error('Error creating GHTK order:', ghtkError);
          const errorObj = ghtkError as { 
            message?: string; 
            response?: { 
              data?: { message?: string; error?: string }; 
              status?: number 
            } 
          };
          console.error('Error details:', {
            message: errorObj?.message,
            response: errorObj?.response?.data,
            status: errorObj?.response?.status
          });
          
          // Hiển thị lỗi chi tiết hơn
          const errorMessage = errorObj?.response?.data?.message 
            || errorObj?.response?.data?.error 
            || errorObj?.message 
            || 'Lỗi không xác định. Vui lòng kiểm tra console để biết thêm chi tiết.';
          
          toast.warning(`Đơn hàng đã được tạo nhưng không thể tạo trên GHTK: ${errorMessage}`, {
            duration: 5000
          });
        }
      }
      
      // Fetch lại đơn hàng với đầy đủ thông tin (bao gồm chi tiết)
      const fullOrder = await getDonHangById(newOrder.don_hang_id);
      setCreatedOrder(fullOrder);
      
      // Xóa các sản phẩm đã đặt khỏi giỏ hàng (chỉ xóa các sản phẩm đã được chọn)
      if (gioHangId && selectedCartItems.length > 0) {
        try {
          // Xóa từng sản phẩm đã đặt khỏi giỏ hàng
          const deletePromises = selectedCartItems
            .filter(item => item.sach) // Lọc các item có sách hợp lệ
            .map(item => {
              if (item.chi_tiet_gio_hang_id) {
                return deleteChiTietGioHang(item.chi_tiet_gio_hang_id);
              }
              return Promise.resolve();
            });
          
          await Promise.all(deletePromises);
          
          // Refresh giỏ hàng sau khi xóa
          await refreshCart();
          
          // Dispatch event để cập nhật giỏ hàng ở các component khác
          window.dispatchEvent(new Event('cartUpdated'));
        } catch (error) {
          console.error('Error clearing cart items:', error);
          // Vẫn tiếp tục dù có lỗi khi xóa giỏ hàng
        }
      }
      
      // Dispatch event để cập nhật danh sách đơn hàng
      window.dispatchEvent(new CustomEvent('orderCreated', { detail: { orderId: newOrder.don_hang_id } }));
      
      // Kiểm tra nếu phương thức thanh toán là VNPay hoặc SePay
      const selectedPaymentMethod = phuongThucThanhToanList.find(
        method => method.phuong_thuc_thanh_toan_id === selectedPhuongThucThanhToan
      );
      const isVnpay = isVnpaySelected || isMethodVnpay(selectedPaymentMethod?.ten_phuong_thuc);
      const isSepay = isSepaySelected || isMethodSepay(selectedPaymentMethod?.ten_phuong_thuc);
      
      if (isVnpay) {
        // Redirect đến trang thanh toán VNPay
        navigate(`/vnpay-payment?orderId=${newOrder.don_hang_id}`);
        return; // Dừng lại, không hiển thị thông báo thành công
      }
      
      if (isSepay) {
        // Redirect đến trang thanh toán SePay
        navigate(`/sepay-payment?orderId=${newOrder.don_hang_id}`);
        return; // Dừng lại, không hiển thị thông báo thành công
      }
      
      setOrderSuccess(true);
      toast.success('Đặt hàng thành công! Đơn hàng đã được lưu vào hệ thống.');
    } catch (error: unknown) {
      console.error('Error creating order:', error);
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Không thể tạo đơn hàng. Vui lòng thử lại.';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || cartLoading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (orderSuccess && createdOrder) {
    return (
      <div className="min-h-screen bg-blue-50 py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Success Header */}
          <Card className="border-green-200 bg-gradient-to-r from-green-50 to-green-100/50 shadow-lg">
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle2 className="h-20 w-20 text-green-600 mx-auto mb-4 animate-pulse" />
                <h1 className="text-3xl font-bold text-green-800 mb-2">Đặt hàng thành công!</h1>
                <p className="text-gray-700 mb-4 text-lg">
                  Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đã được lưu vào hệ thống.
                </p>
                <Badge className="text-xl px-6 py-3 mb-6 bg-green-600 text-white">
                  Mã đơn hàng: {createdOrder.ma_don_hang}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Order Details */}
          <Card className="border-blue-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100/50">
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <Package className="h-5 w-5 text-blue-600" />
                Chi tiết đơn hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {/* Order Items */}
                {createdOrder.chitietdonhang && createdOrder.chitietdonhang.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900 text-lg">Sản phẩm đã đặt:</h3>
                    {createdOrder.chitietdonhang.map((item, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        {item.sach?.anh_bia_url && (
                          <img
                            src={getImageUrl(item.sach.anh_bia_url)}
                            alt={item.sach.ten_sach || 'Sách'}
                            className="w-20 h-24 object-cover rounded-md border border-gray-200"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80x96/6366f1/ffffff?text=No+Image';
                            }}
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{item.sach?.ten_sach || 'Sách'}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            Số lượng: {item.so_luong} x {formatPrice(item.gia_luc_mua)}
                          </p>
                        </div>
                        <p className="font-bold text-blue-600 text-lg">
                          {formatPrice(item.gia_luc_mua * item.so_luong)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Order Summary */}
                <div className="border-t-2 border-gray-200 pt-4 space-y-3">
                  <h3 className="font-semibold text-gray-900 text-lg">Tóm tắt đơn hàng:</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tạm tính:</span>
                      <span className="font-semibold text-gray-900">{formatPrice(createdOrder.tam_tinh)}</span>
                    </div>
                    {createdOrder.phi_van_chuyen && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Phí vận chuyển:</span>
                        <span className="font-semibold text-gray-900">{formatPrice(createdOrder.phi_van_chuyen)}</span>
                      </div>
                    )}
                    {createdOrder.giam_gia_voucher && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Giảm giá voucher:</span>
                        <span className="font-semibold">-{formatPrice(createdOrder.giam_gia_voucher)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-xl pt-3 border-t-2 border-blue-200">
                      <span className="text-gray-900">Tổng cộng:</span>
                      <span className="text-blue-600">{formatPrice(createdOrder.tong_tien)}</span>
                    </div>
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="border-t-2 border-gray-200 pt-4 space-y-3">
                  <h3 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    Thông tin giao hàng:
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p className="text-sm text-gray-700">
                      <strong>Người nhận:</strong> {createdOrder.ten_nguoi_nhan}
                    </p>
                    {createdOrder.email_nguoi_nhan && (
                      <p className="text-sm text-gray-700">
                        <strong>Email:</strong> {createdOrder.email_nguoi_nhan}
                      </p>
                    )}
                    <p className="text-sm text-gray-700">
                      <strong>Số điện thoại:</strong> {createdOrder.sdt_nguoi_nhan}
                    </p>
                    <p className="text-sm text-gray-700">
                      <strong>Địa chỉ giao hàng:</strong> {createdOrder.dia_chi_giao_hang}
                    </p>
                    {createdOrder.phuongthucvanchuyen && (
                      <p className="text-sm text-gray-700">
                        <strong>Phương thức vận chuyển:</strong> {createdOrder.phuongthucvanchuyen.ten_phuong_thuc}
                      </p>
                    )}
                    {createdOrder.phuongthucthanhtoan && (
                      <p className="text-sm text-gray-700">
                        <strong>Phương thức thanh toán:</strong> {createdOrder.phuongthucthanhtoan.ten_phuong_thuc}
                      </p>
                    )}
                  </div>
                </div>

                {/* Order Status */}
                <div className="border-t-2 border-gray-200 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">Trạng thái đơn hàng:</span>
                    <Badge className="text-base px-4 py-2 bg-blue-600 text-white">
                      {createdOrder.trang_thai}
                    </Badge>
                  </div>
                  {createdOrder.ngay_dat_hang && (
                    <p className="text-sm text-gray-600 mt-2">
                      Ngày đặt hàng: {new Date(createdOrder.ngay_dat_hang).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <Button 
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              size="lg"
            >
              Về trang chủ
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/orders')}
              size="lg"
              className="border-blue-500 text-blue-600 hover:bg-blue-50"
            >
              Xem tất cả đơn hàng
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/books')}
              size="lg"
              className="border-green-500 text-green-600 hover:bg-green-50"
            >
              Tiếp tục mua sắm
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (cartItemsFromContext.length === 0) {
    return (
      <div className="min-h-screen bg-blue-50 py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Giỏ hàng trống</h1>
          <p className="text-gray-600 mb-6">Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán</p>
          <Button onClick={() => navigate('/books')}>
            Tiếp tục mua sắm
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
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
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Thanh toán
            </h1>
          </div>
          <p className="text-gray-600 text-lg">Vui lòng điền đầy đủ thông tin để hoàn tất đơn hàng</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left Column - Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Info */}
              <Card className="border-2 border-blue-200/70 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white overflow-hidden !pt-0 rounded-xl">
                <CardHeader className="bg-gradient-to-r from-blue-50 via-indigo-50/50 to-purple-50 border-b-2 border-blue-200/50 !pt-5 pb-5 px-6">
                  <CardTitle className="flex items-center gap-3 text-blue-900 text-xl font-bold">
                    <div className="p-2.5 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl shadow-sm">
                      <MapPin className="h-5 w-5 text-blue-700" />
                    </div>
                    Thông tin giao hàng
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 pt-6 pb-6">
                  <div>
                    <label className="text-sm font-semibold mb-2.5 block text-gray-800 flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-600" />
                      Tên người nhận *
                    </label>
                    <Input
                      value={customerInfo.ten_nguoi_nhan}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, ten_nguoi_nhan: e.target.value })}
                      placeholder="Nhập tên người nhận"
                      required
                      className="h-12 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all rounded-lg"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="text-sm font-semibold mb-2.5 block text-gray-800 flex items-center gap-2">
                        <Phone className="h-4 w-4 text-blue-600" />
                        Số điện thoại *
                      </label>
                      <Input
                        value={customerInfo.sdt_nguoi_nhan}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, sdt_nguoi_nhan: e.target.value })}
                        placeholder="Nhập số điện thoại"
                        required
                        className="h-12 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold mb-2.5 block text-gray-800 flex items-center gap-2">
                        <Mail className="h-4 w-4 text-blue-600" />
                        Email
                      </label>
                      <Input
                        type="email"
                        value={customerInfo.email_nguoi_nhan}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, email_nguoi_nhan: e.target.value })}
                        placeholder="Nhập email (tùy chọn)"
                        className="h-12 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all rounded-lg"
                      />
                    </div>
                  </div>
                  {/* Địa chỉ giao hàng - Gộp với chọn địa chỉ để tính phí */}
                  <div>
                    <label className="text-sm font-semibold mb-2.5 block text-gray-800 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      Địa chỉ giao hàng *
                    </label>
                    {defaultAddress && (
                      <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50/70 p-3 text-sm text-blue-900">
                        <p className="font-semibold text-blue-800">Địa chỉ giao hàng mặc định</p>
                        <p className="mt-1">
                          {defaultAddress.ho_ten_nguoi_nhan} •{' '}
                          {defaultAddress.so_dien_thoai_nguoi_nhan || customerInfo.sdt_nguoi_nhan}
                        </p>
                        <p>{formatAddress(defaultAddress)}</p>
                      </div>
                    )}
                    {/* Chọn dịch vụ vận chuyển (GHN hoặc GHTK) */}
                    {isDynamicShipping && (
                      <div className="mb-5">
                        <label className="text-sm font-semibold mb-3 block text-gray-800 flex items-center gap-2">
                          <Truck className="h-4 w-4 text-blue-600" />
                          Chọn dịch vụ vận chuyển
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                          <label
                            className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                              selectedShippingProvider === 'ghn'
                                ? 'border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-200'
                                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                            }`}
                          >
                            <input
                              type="radio"
                              name="shippingProvider"
                              value="ghn"
                              checked={selectedShippingProvider === 'ghn'}
                              onChange={() => {
                                setSelectedShippingProvider('ghn');
                                // Reset GHTK states
                                setGhtkProvince('');
                                setGhtkDistrict('');
                                setGhtkWard('');
                                setGhtkShippingFee(0);
                              }}
                              className="w-4 h-4 text-blue-600"
                            />
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900">Giao Hàng Nhanh (GHN)</div>
                              <div className="text-xs text-gray-600 mt-1">Giao hàng nhanh chóng, uy tín</div>
                            </div>
                          </label>
                          <label
                            className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                              selectedShippingProvider === 'ghtk'
                                ? 'border-blue-500 bg-blue-50 shadow-lg ring-2 ring-blue-200'
                                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                            }`}
                          >
                            <input
                              type="radio"
                              name="shippingProvider"
                              value="ghtk"
                              checked={selectedShippingProvider === 'ghtk'}
                              onChange={() => {
                                setSelectedShippingProvider('ghtk');
                                // Reset GHN states
                                setSelectedGhnProvinceId(null);
                                setSelectedGhnDistrictId(null);
                                setSelectedGhnWardCode('');
                                setGhnShippingFee(0);
                                // Reset GHTK states
                                setGhtkShippingFee(0);
                              }}
                              className="w-4 h-4 text-blue-600"
                            />
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900">Giao Hàng Tiết Kiệm (GHTK)</div>
                              <div className="text-xs text-gray-600 mt-1">Giao hàng tiết kiệm, giá rẻ</div>
                            </div>
                          </label>
                        </div>
                      </div>
                    )}
                    {isGhnShipping ? (
                      <div className="space-y-3">
                        {/* Province */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tỉnh/Thành phố <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={selectedGhnProvinceId || ''}
                            onChange={(e) => {
                              const provinceId = parseInt(e.target.value) || null;
                              setSelectedGhnProvinceId(provinceId);
                              setSelectedGhnDistrictId(null);
                              setSelectedGhnWardCode('');
                              setGhnShippingFee(0);
                            }}
                            className="w-full h-12 px-3 py-2.5 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                          >
                            <option value="">-- Chọn tỉnh/thành phố --</option>
                            {ghnProvinces.map((province) => (
                              <option key={province.ProvinceID} value={province.ProvinceID}>
                                {province.ProvinceName}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        {/* District */}
                        {selectedGhnProvinceId && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Quận/Huyện <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={selectedGhnDistrictId || ''}
                              onChange={(e) => {
                                const districtId = parseInt(e.target.value) || null;
                                setSelectedGhnDistrictId(districtId);
                                setSelectedGhnWardCode('');
                                setGhnShippingFee(0);
                              }}
                              className="w-full h-12 px-3 py-2.5 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                              disabled={ghnDistricts.length === 0}
                            >
                              <option value="">-- Chọn quận/huyện --</option>
                              {ghnDistricts.map((district) => (
                                <option key={district.DistrictID} value={district.DistrictID}>
                                  {district.DistrictName}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                        
                        {/* Ward */}
                        {selectedGhnDistrictId && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Phường/Xã <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={selectedGhnWardCode}
                              onChange={(e) => {
                                setSelectedGhnWardCode(e.target.value);
                                setGhnShippingFee(0);
                              }}
                              className="w-full h-12 px-3 py-2.5 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                              disabled={ghnWards.length === 0}
                            >
                              <option value="">-- Chọn phường/xã --</option>
                              {ghnWards.map((ward) => (
                                <option key={ward.WardCode} value={ward.WardCode}>
                                  {ward.WardName}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                        
                        {/* Địa chỉ chi tiết */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Địa chỉ chi tiết (số nhà, tên đường) <span className="text-red-500">*</span>
                          </label>
                          <Input
                            value={customerInfo.dia_chi_giao_hang}
                            onChange={(e) => setCustomerInfo({ ...customerInfo, dia_chi_giao_hang: e.target.value })}
                            placeholder="Nhập số nhà, tên đường..."
                            required
                            className="h-12 border-2 border-gray-200 focus:border-blue-500 transition-colors"
                          />
                        </div>
                        
                        {/* Shipping Fee Display */}
                        {calculatingGhnFee && (
                          <div className="flex items-center gap-2 text-sm text-blue-600">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Đang tính phí vận chuyển...</span>
                          </div>
                        )}
                        
                        {!calculatingGhnFee && selectedGhnWardCode && ghnShippingFee > 0 && (
                          <div className="text-sm font-semibold text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">
                            Phí vận chuyển: {formatPrice(ghnShippingFee)}
                          </div>
                        )}
                      </div>
                    ) : isGhtkShipping ? (
                      <div className="space-y-3">
                        {/* GHTK dùng dropdown từ GHN API để đảm bảo format đúng */}
                        {/* Province */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tỉnh/Thành phố <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={selectedGhnProvinceId || ''}
                            onChange={(e) => {
                              const provinceId = parseInt(e.target.value) || null;
                              setSelectedGhnProvinceId(provinceId);
                              // Set tên tỉnh cho GHTK từ GHN province
                              if (provinceId) {
                                const selectedProvince = ghnProvinces.find(p => p.ProvinceID === provinceId);
                                setGhtkProvince(selectedProvince?.ProvinceName || '');
                              } else {
                                setGhtkProvince('');
                              }
                              setSelectedGhnDistrictId(null);
                              setSelectedGhnWardCode('');
                              setGhtkDistrict('');
                              setGhtkWard('');
                              setGhtkShippingFee(0);
                            }}
                            className="w-full h-12 px-3 py-2.5 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                          >
                            <option value="">-- Chọn tỉnh/thành phố --</option>
                            {ghnProvinces.map((province) => (
                              <option key={province.ProvinceID} value={province.ProvinceID}>
                                {province.ProvinceName}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        {/* District */}
                        {selectedGhnProvinceId && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Quận/Huyện <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={selectedGhnDistrictId || ''}
                              onChange={(e) => {
                                const districtId = parseInt(e.target.value) || null;
                                setSelectedGhnDistrictId(districtId);
                                // Set tên quận cho GHTK từ GHN district
                                if (districtId) {
                                  const selectedDistrict = ghnDistricts.find(d => d.DistrictID === districtId);
                                  setGhtkDistrict(selectedDistrict?.DistrictName || '');
                                } else {
                                  setGhtkDistrict('');
                                }
                                setSelectedGhnWardCode('');
                                setGhtkWard('');
                                setGhtkShippingFee(0);
                              }}
                              className="w-full h-12 px-3 py-2.5 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                              disabled={ghnDistricts.length === 0}
                            >
                              <option value="">-- Chọn quận/huyện --</option>
                              {ghnDistricts.map((district) => (
                                <option key={district.DistrictID} value={district.DistrictID}>
                                  {district.DistrictName}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                        
                        {/* Ward */}
                        {selectedGhnDistrictId && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Phường/Xã <span className="text-red-500">*</span>
                            </label>
                            <select
                              value={selectedGhnWardCode}
                              onChange={(e) => {
                                const wardCode = e.target.value;
                                setSelectedGhnWardCode(wardCode);
                                // Set tên phường cho GHTK từ GHN ward
                                if (wardCode) {
                                  const selectedWard = ghnWards.find(w => w.WardCode === wardCode);
                                  setGhtkWard(selectedWard?.WardName || '');
                                } else {
                                  setGhtkWard('');
                                }
                                setGhtkShippingFee(0);
                              }}
                              className="w-full h-12 px-3 py-2.5 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                              disabled={ghnWards.length === 0}
                            >
                              <option value="">-- Chọn phường/xã --</option>
                              {ghnWards.map((ward) => (
                                <option key={ward.WardCode} value={ward.WardCode}>
                                  {ward.WardName}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                        
                        {/* Địa chỉ chi tiết */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Địa chỉ chi tiết (số nhà, tên đường) <span className="text-red-500">*</span>
                          </label>
                          <Input
                            value={customerInfo.dia_chi_giao_hang}
                            onChange={(e) => setCustomerInfo({ ...customerInfo, dia_chi_giao_hang: e.target.value })}
                            placeholder="Nhập số nhà, tên đường..."
                            required
                            className="h-12 border-2 border-gray-200 focus:border-blue-500 transition-colors"
                          />
                        </div>
                        
                        {/* GHTK Shipping Fee Display */}
                        {calculatingGhtkFee && (
                          <div className="flex items-center gap-2 text-sm text-blue-600">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Đang tính phí vận chuyển GHTK...</span>
                          </div>
                        )}
                        
                        {!calculatingGhtkFee && ghtkProvince && ghtkDistrict && ghtkWard && ghtkShippingFee > 0 && (
                          <div className="text-sm font-semibold text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">
                            Phí vận chuyển GHTK: {formatPrice(ghtkShippingFee)}
                          </div>
                        )}
                      </div>
                    ) : (
                      <Input
                        value={customerInfo.dia_chi_giao_hang}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, dia_chi_giao_hang: e.target.value })}
                        placeholder="Nhập địa chỉ giao hàng"
                        required
                        className="h-12 border-2 border-gray-200 focus:border-blue-500 transition-colors"
                      />
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-semibold mb-2 block text-gray-700">Ghi chú</label>
                    <textarea
                      value={customerInfo.ghi_chu}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, ghi_chu: e.target.value })}
                      placeholder="Ghi chú thêm cho đơn hàng (tùy chọn)"
                      className="w-full h-24 px-3 py-2 rounded-md border-2 border-gray-200 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card className="border-2 border-blue-200/70 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white overflow-hidden !pt-0 rounded-xl">
                <CardHeader className="bg-gradient-to-r from-blue-50 via-indigo-50/50 to-purple-50 border-b-2 border-blue-200/50 !pt-5 pb-5 px-6">
                  <CardTitle className="flex items-center gap-3 text-blue-900 text-xl font-bold">
                    <div className="p-2.5 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl shadow-sm">
                      <CreditCard className="h-5 w-5 text-blue-700" />
                    </div>
                    Phương thức thanh toán
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 pb-6">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                      <span className="ml-2 text-gray-600">Đang tải phương thức thanh toán...</span>
                    </div>
                  ) : phuongThucThanhToanList.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <CreditCard className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                      <p>Chưa có phương thức thanh toán nào</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {phuongThucThanhToanList.map((method) => {
                        // Xác định icon dựa trên tên phương thức
                        const getPaymentIcon = (name: string) => {
                          const lowerName = normalizeText(name);
                          if (lowerName.includes('tiền mặt') || lowerName.includes('cash') || lowerName.includes('cod') || lowerName.includes('thanh toán khi nhận')) {
                            return '💰';
                          } else if (lowerName.includes('chuyển khoản') || lowerName.includes('bank') || lowerName.includes('ngân hàng')) {
                            return '🏦';
                          } else if (lowerName.includes('vnpay')) {
                            return '🔷';
                          } else if (lowerName.includes('sepay') || lowerName.includes('se pay')) {
                            return '💎';
                          } else {
                            return '💳';
                          }
                        };

                        return (
                          <label
                            key={method.phuong_thuc_thanh_toan_id}
                            className={`flex items-center gap-4 p-5 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                              selectedPhuongThucThanhToan === method.phuong_thuc_thanh_toan_id
                                ? 'border-blue-500 bg-gradient-to-r from-blue-50 via-indigo-50/50 to-purple-50 shadow-xl ring-2 ring-blue-200 scale-[1.01]'
                                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-lg'
                            }`}
                          >
                            <input
                              type="radio"
                              name="paymentMethod"
                              value={method.phuong_thuc_thanh_toan_id}
                              checked={selectedPhuongThucThanhToan === method.phuong_thuc_thanh_toan_id}
                              onChange={() => handleSelectPaymentMethod(method)}
                              className="w-5 h-5 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            />
                            <div className="flex items-center gap-3 flex-1">
                              <div className="text-3xl">{getPaymentIcon(method.ten_phuong_thuc)}</div>
                              <div className="flex-1">
                                <div className="font-semibold text-gray-900 text-base">
                                  {method.ten_phuong_thuc}
                                </div>
                                {method.mo_ta && (
                                  <div className="text-sm text-gray-600 mt-1 leading-relaxed">
                                    {method.mo_ta}
                                  </div>
                                )}
                              </div>
                              {selectedPhuongThucThanhToan === method.phuong_thuc_thanh_toan_id && (
                                <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
                              )}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4 border-2 border-blue-300/70 shadow-2xl bg-white overflow-hidden !pt-0 rounded-xl">
                <CardHeader className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white rounded-t-xl !pt-5 pb-5 px-6 shadow-lg">
                  <CardTitle className="text-white flex items-center gap-3 text-xl font-bold">
                    <div className="p-2.5 bg-white/25 rounded-xl backdrop-blur-sm shadow-md">
                      <ShoppingCart className="h-5 w-5" />
                    </div>
                    Đơn hàng của bạn
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 pt-6 pb-6">
                  {/* Cart Items - chỉ hiển thị các sản phẩm đã được chọn từ giỏ hàng */}
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                    {selectedCartItems.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <ShoppingCart className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">Không có sản phẩm nào được chọn</p>
                        <p className="text-xs text-gray-400 mt-1">Vui lòng quay lại giỏ hàng để chọn sản phẩm</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-4"
                          onClick={() => navigate('/cart')}
                        >
                          Quay lại giỏ hàng
                        </Button>
                      </div>
                    ) : (
                      selectedCartItems.map((item, index) => {
                        return (
                          <div 
                            key={item.chi_tiet_gio_hang_id || index} 
                            className="flex gap-3 p-3 rounded-xl transition-all border-2 border-blue-400 bg-blue-50/50 hover:bg-blue-50 shadow-md"
                          >
                            <img
                              src={getImageUrl(item.sach?.anh_bia_url)}
                              alt={item.sach?.ten_sach || 'Sách'}
                              className="w-16 h-20 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64x80/6366f1/ffffff?text=No+Image';
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-sm line-clamp-2 text-gray-900 leading-tight">{item.sach?.ten_sach || 'Sách'}</div>
                              <div className="text-xs text-gray-500 mt-1.5">Số lượng: {item.so_luong}</div>
                              <div className="font-bold text-blue-600 mt-2 text-base">
                                {formatPrice((item.sach?.gia_ban ? parseFloat(item.sach.gia_ban.toString()) : 0) * item.so_luong)}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="border-t-2 border-gray-200 pt-5 space-y-4">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-700 font-medium">Tạm tính:</span>
                      <span className="font-semibold text-gray-900 text-lg">{formatPrice(calculateSubtotal())}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-700 font-medium">Phí vận chuyển:</span>
                      <span className="font-semibold text-gray-900 text-lg">{formatPrice(calculateShippingFee())}</span>
                    </div>
                    
                    {/* Voucher */}
                    <div className="pt-2 border-t">
                      {!appliedVoucher ? (
                        <div className="space-y-2">
                          <label className="text-sm font-medium block">Mã giảm giá</label>
                          <div className="flex gap-2">
                            <Input
                              value={voucherCode}
                              onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                              placeholder="Nhập mã voucher"
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleApplyVoucher}
                              disabled={checkingVoucher}
                            >
                              {checkingVoucher ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Tag className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between bg-green-50 p-2 rounded">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{appliedVoucher.ma_voucher}</Badge>
                            <span className="text-sm text-green-700">
                              -{formatPrice(calculateVoucherDiscount())}
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleRemoveVoucher}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center pt-5 mt-5 border-t-2 border-blue-300 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 -mx-6 px-6 py-5 rounded-b-xl shadow-inner">
                      <span className="text-gray-900 font-bold text-xl">Tổng cộng:</span>
                      <span className="text-blue-600 font-black text-2xl">{formatPrice(calculateTotal())}</span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 text-lg font-bold py-6 mt-5 hover:scale-[1.02] active:scale-[0.98] rounded-xl"
                    size="lg"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-5 w-5 mr-2" />
                        Đặt hàng ngay
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserThanhToan;


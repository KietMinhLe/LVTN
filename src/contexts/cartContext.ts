import { createContext } from 'react';
import type { ChiTietGioHang } from '../services/chiTietGioHangService';

export interface CartContextType {
  cartItems: ChiTietGioHang[];
  cartCount: number;
  gioHangId: number | null;
  loading: boolean;
  refreshCart: () => Promise<void>;
  getCartTotal: () => number;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);


import { useState } from 'react';
import { Button } from './ui/button';
import { ShoppingCart, Loader2 } from 'lucide-react';
import AddToCartModal from './AddToCartModal';
import { useAddToCart } from '../hooks/useCart';
import type { Sach } from '../services/sachService';

interface AddToCartButtonProps {
  book: Sach;
  quantity?: number;
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showIcon?: boolean;
  children?: React.ReactNode;
  useModal?: boolean; // Option to use modal or add directly
  skipModal?: boolean; // Option to skip modal and add directly (for detail page)
}

const AddToCartButton = ({
  book,
  quantity = 1,
  variant = 'default',
  size = 'default',
  className = '',
  showIcon = true,
  children,
  useModal = true, // Default to using modal
  skipModal = false // Skip modal and add directly
}: AddToCartButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addToCart } = useAddToCart();

  const handleClick = async () => {
    if (loading) return;
    
    // If skipModal is true, add directly without opening modal
    if (skipModal) {
      setLoading(true);
      try {
        await addToCart(book, quantity);
      } finally {
        setLoading(false);
      }
      return;
    }
    
    // If useModal is true, open modal instead of adding directly
    if (useModal) {
      setIsModalOpen(true);
      return;
    }

    // Direct add (for quick add scenarios)
    setLoading(true);
    try {
      await addToCart(book, quantity);
    } finally {
      setLoading(false);
    }
  };

  const isOutOfStock = (book.so_luong || 0) === 0;

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={handleClick}
        disabled={isOutOfStock || loading}
        title={isOutOfStock ? 'Sản phẩm đã hết hàng' : 'Thêm vào giỏ hàng'}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Đang thêm...
          </>
        ) : (
          <>
            {showIcon && <ShoppingCart className="h-4 w-4 mr-2" />}
            {children || (isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ')}
          </>
        )}
      </Button>
      
      {useModal && !skipModal && (
        <AddToCartModal
          book={book}
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          initialQuantity={quantity}
        />
      )}
    </>
  );
};

export default AddToCartButton;


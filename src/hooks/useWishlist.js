import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export const useWishlist = () => {
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('ecommerce_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('ecommerce_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const toggleWishlist = (productId) => {
    if (wishlist.includes(productId)) {
      toast.error('Removed from wishlist');
      setWishlist(prev => prev.filter(id => id !== productId));
    } else {
      toast.success('Added to wishlist');
      setWishlist(prev => [...prev, productId]);
    }
  };

  const isWishlisted = (productId) => wishlist.includes(productId);

  return { wishlist, toggleWishlist, isWishlisted };
};

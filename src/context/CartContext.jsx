// // import { createContext, useContext, useState, useEffect } from 'react';

// // const CartContext = createContext();

// // export const useCart = () => useContext(CartContext);

// // export const CartProvider = ({ children }) => {
// //   const [cart, setCart] = useState([]);

// //   // Load initial cart from local storage if needed, but for now just state
// //   const addToCart = (product, quantity = 1) => {
// //     setCart(prevCart => {
// //       const existingItem = prevCart.find(item => item.id === product.id);
// //       if (existingItem) {
// //         return prevCart.map(item => 
// //           item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
// //         );
// //       }
// //       return [...prevCart, { ...product, quantity }];
// //     });
// //   };

// //   const removeFromCart = (productId) => {
// //     setCart(prevCart => prevCart.filter(item => item.id !== productId));
// //   };

// //   const updateQuantity = (productId, quantity) => {
// //     if (quantity <= 0) {
// //       removeFromCart(productId);
// //       return;
// //     }
// //     setCart(prevCart => prevCart.map(item => 
// //       item.id === productId ? { ...item, quantity } : item
// //     ));
// //   };

// //   const clearCart = () => setCart([]);

// //   const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
// //   const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

// //   return (
// //     <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount }}>
// //       {children}
// //     </CartContext.Provider>
// //   );
// // };



// import { createContext, useContext, useState } from 'react';

// const CartContext = createContext();

// export const useCart = () => useContext(CartContext);

// export const CartProvider = ({ children }) => {
//   const [cart, setCart] = useState([]);

//   const addToCart = (product, quantity = 1) => {
//     setCart(prevCart => {
//       // ✅ Enforce single vendor rule
//       if (prevCart.length > 0) {
//         const existingVendorId = prevCart[0].vendor_id;
//         if (product.vendor_id !== existingVendorId) {
//           alert("You can only add products from one vendor per order. Please checkout or clear your cart first.");
//           return prevCart;
//         }
//       }

//       const existingItem = prevCart.find(item => item.product_id === product.product_id);
//       if (existingItem) {
//         return prevCart.map(item =>
//           item.product_id === product.product_id
//             ? { ...item, quantity: item.quantity + quantity }
//             : item
//         );
//       }
//       return [...prevCart, { ...product, quantity }];
//     });
//   };

//   const removeFromCart = (productId) => {
//     setCart(prevCart => prevCart.filter(item => item.product_id !== productId));
//   };

//   const updateQuantity = (productId, quantity) => {
//     if (quantity <= 0) { removeFromCart(productId); return; }
//     setCart(prevCart => prevCart.map(item =>
//       item.product_id === productId ? { ...item, quantity } : item
//     ));
//   };

//   const clearCart = () => setCart([]);

//   const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
//   const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

//   return (
//     <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount }}>
//       {children}
//     </CartContext.Provider>
//   );
// };


import { createContext, useContext, useState } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [vendorError, setVendorError] = useState('');

  const addToCart = (product, quantity = 1) => {
    setVendorError('');

    // ✅ Single-vendor enforcement
    if (cart.length > 0) {
      const cartVendorId = cart[0]?.vendor_id;
      const newVendorId = product.vendor_id;

      if (cartVendorId && newVendorId && cartVendorId !== newVendorId) {
        const cartVendorName = cart[0]?.vendors?.name || 'current vendor';
        const newVendorName = product.vendors?.name || 'this vendor';
        setVendorError(
          `Your cart has items from "${cartVendorName}". Clear your cart to buy from "${newVendorName}".`
        );
        return false;
      }
    }

    const existing = cart.find(item => item.product_id === product.product_id);
    const currentQty = existing ? existing.quantity : 0;
    const maxStock = product.stock_quantity ?? product.inventory?.[0]?.stock_quantity ?? Infinity;

    if (currentQty + quantity > maxStock) {
      toast.error(`Only ${maxStock} items available in stock.`);
      return false;
    }

    setCart(prevCart => {
      const existing = prevCart.find(item => item.product_id === product.product_id);
      if (existing) {
        return prevCart.map(item =>
          item.product_id === product.product_id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { ...product, quantity }];
    });
    
    toast.success(`${product.name} added to cart!`);
    return true;
  };

  const removeFromCart = (productId) => {
    setCart(prev => {
      const updated = prev.filter(item => item.product_id !== productId);
      if (updated.length === 0) setVendorError('');
      return updated;
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) { removeFromCart(productId); return; }
    
    const itemToUpdate = cart.find(i => i.product_id === productId);
    if (!itemToUpdate) return;
    
    const maxStock = itemToUpdate.stock_quantity ?? itemToUpdate.inventory?.[0]?.stock_quantity ?? Infinity;
    if (quantity > maxStock) {
      toast.error(`Only ${maxStock} items available in stock.`);
      return;
    }

    setCart(prev => prev.map(item =>
      item.product_id === productId ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => { setCart([]); setVendorError(''); };
  const clearVendorError = () => setVendorError('');

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart, addToCart, removeFromCart, updateQuantity,
      clearCart, cartTotal, cartCount, vendorError, clearVendorError
    }}>
      {children}
    </CartContext.Provider>
  );
};
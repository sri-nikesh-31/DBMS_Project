// import { Link, useNavigate } from 'react-router-dom';
// import { useCart } from '../context/CartContext';
// import { Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';

// const Cart = () => {
//   const { cart, updateQuantity, removeFromCart, cartTotal } = useCart();
//   const navigate = useNavigate();

//   if (cart.length === 0) {
//     return (
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         exit={{ opacity: 0, y: -20 }}
//         transition={{ duration: 0.4 }}
//         className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center"
//       >
//         <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-800">
//           <Trash2 className="w-10 h-10 text-slate-500" />
//         </div>
//         <h2 className="text-3xl font-bold text-white mb-4">Your cart is empty</h2>
//         <p className="text-slate-400 mb-8 max-w-md mx-auto">Looks like you haven't added any items to your cart yet. Explore our curated selection.</p>
//         <Link to="/products" className="inline-flex items-center px-8 py-4 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-500 transition-colors shadow-lg">
//           Start Shopping
//         </Link>
//       </motion.div>
//     );
//   }

//   const tax = cartTotal * 0.08;
//   const shipping = cartTotal > 100 ? 0 : 15;
//   const grandTotal = cartTotal + tax + shipping;

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       exit={{ opacity: 0, y: -20 }}
//       transition={{ duration: 0.4 }}
//       className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
//     >
//       <h1 className="text-3xl font-bold text-white mb-10">Shopping Cart</h1>

//       <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
//         {/* Cart Items */}
//         <div className="lg:col-span-8 space-y-6">
//           <AnimatePresence>
//             {cart.map((item) => (
//               <motion.div
//                 key={item.cart_item_id}
//                 initial={{ opacity: 0, x: -50 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 exit={{ opacity: 0, x: -100, scale: 0.9 }}
//                 transition={{ duration: 0.3 }}
//                 className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-sm hover:shadow-md transition-shadow"
//               >
//                 <Link to={`/product/${item.product_id}`} className="w-full sm:w-32 aspect-square flex-shrink-0 bg-slate-800 rounded-2xl overflow-hidden block">
//                   <img
//                     src={item.products?.image_url || "https://via.placeholder.com/100"}
//                     alt={item.products?.name}
//                     className="w-full h-full object-cover"
//                   />
//                 </Link>

//                 <div className="flex-grow flex flex-col w-full">
//                   <div className="flex justify-between items-start mb-2">
//                     <Link to={`/product/${item.product_id}`} className="text-lg font-bold text-white hover:text-indigo-400 transition-colors line-clamp-1">
//                       {item.name}
//                     </Link>
//                     <p className="text-lg font-bold text-white">${(item.price * item.quantity).toFixed(2)}</p>
//                   </div>
//                   <p className="text-sm text-slate-400 mb-4">{item.category}</p>

//                   <div className="flex items-center justify-between mt-auto">
//                     <div className="flex items-center bg-slate-950 rounded-full border border-slate-800">
//                       <button
//                         onClick={() => updateQuantity(item.id, item.quantity - 1)}
//                         className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
//                       >
//                         <Minus className="w-4 h-4" />
//                       </button>
//                       <span className="w-8 text-center font-semibold text-white text-sm">{item.quantity}</span>
//                       <button
//                         onClick={() => updateQuantity(item.id, item.quantity + 1)}
//                         className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
//                       >
//                         <Plus className="w-4 h-4" />
//                       </button>
//                     </div>

//                     <button
//                       onClick={() => removeFromCart(item.id)}
//                       className="text-slate-400 hover:text-red-500 transition-colors p-2"
//                     >
//                       <Trash2 className="w-5 h-5" />
//                     </button>
//                   </div>
//                 </div>
//               </motion.div>
//             ))}
//           </AnimatePresence>
//         </div>

//         {/* Order Summary */}
//         <div className="lg:col-span-4">
//           <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sticky top-24 shadow-sm">
//             <h3 className="text-xl font-bold text-white mb-6">Order Summary</h3>

//             <div className="space-y-4 text-sm mb-6 pb-6 border-b border-slate-800">
//               <div className="flex justify-between text-slate-400">
//                 <span>Subtotal</span>
//                 <span className="font-semibold text-white">${cartTotal.toFixed(2)}</span>
//               </div>
//               <div className="flex justify-between text-slate-400">
//                 <span>Estimated Tax (8%)</span>
//                 <span className="font-semibold text-white">${tax.toFixed(2)}</span>
//               </div>
//               <div className="flex justify-between text-slate-400">
//                 <span>Shipping</span>
//                 <span className="font-semibold text-white">
//                   {shipping === 0 ? <span className="text-emerald-400 bg-emerald-900/40 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">Free</span> : `$${shipping.toFixed(2)}`}
//                 </span>
//               </div>
//             </div>

//             <div className="flex justify-between items-center mb-8">
//               <span className="text-lg font-bold text-white">Total</span>
//               <span className="text-2xl font-bold text-indigo-400">${grandTotal.toFixed(2)}</span>
//             </div>

//             <motion.button
//               whileHover={{ scale: 1.02, boxShadow: "0px 0px 15px rgba(99, 102, 241, 0.4)" }}
//               whileTap={{ scale: 0.95 }}
//               onClick={() => navigate('/checkout')}
//               className="w-full flex items-center justify-center bg-indigo-600 text-white py-4 px-6 rounded-2xl font-bold hover:bg-indigo-500 transition-all shadow-lg group"
//             >
//               Proceed to Checkout
//               <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
//             </motion.button>
//           </div>
//         </div>
//       </div>
//     </motion.div>
//   );
// };

// export default Cart;


import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, cartTotal } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center"
      >
        <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-800">
          <Trash2 className="w-10 h-10 text-slate-500" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">Your cart is empty</h2>
        <p className="text-slate-400 mb-8 max-w-md mx-auto">Looks like you haven't added any items to your cart yet. Explore our curated selection.</p>
        <Link to="/products" className="inline-flex items-center px-8 py-4 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-500 transition-colors shadow-lg">
          Start Shopping
        </Link>
      </motion.div>
    );
  }

  const tax = cartTotal * 0.08;
  const shipping = cartTotal > 100 ? 0 : 15;
  const grandTotal = cartTotal + tax + shipping;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
    >
      <h1 className="text-3xl font-bold text-white mb-10">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Cart Items */}
        <div className="lg:col-span-8 space-y-6">
          <AnimatePresence>
            {cart.map((item) => (
              <motion.div
                key={item.product_id}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-sm hover:shadow-md transition-shadow"
              >
                <Link to={`/product/${item.product_id}`} className="w-full sm:w-32 aspect-square flex-shrink-0 bg-slate-800 rounded-2xl overflow-hidden block">
                  <img
                    src={item.image_url || "https://via.placeholder.com/100"}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </Link>

                <div className="flex-grow flex flex-col w-full">
                  <div className="flex justify-between items-start mb-2">
                    <Link to={`/product/${item.product_id}`} className="text-lg font-bold text-white hover:text-indigo-400 transition-colors line-clamp-1">
                      {item.name}
                    </Link>
                    <p className="text-lg font-bold text-white">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                  <p className="text-sm text-slate-400 mb-4">{item.categories?.category_name || ''}</p>

                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center bg-slate-950 rounded-full border border-slate-800">
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                        className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-semibold text-white text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product_id)}
                      className="text-slate-400 hover:text-red-500 transition-colors p-2"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sticky top-24 shadow-sm">
            <h3 className="text-xl font-bold text-white mb-6">Order Summary</h3>

            <div className="space-y-4 text-sm mb-6 pb-6 border-b border-slate-800">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span className="font-semibold text-white">₹{cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Estimated Tax (8%)</span>
                <span className="font-semibold text-white">₹{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Shipping</span>
                <span className="font-semibold text-white">
                  {shipping === 0
                    ? <span className="text-emerald-400 bg-emerald-900/40 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">Free</span>
                    : `₹${shipping.toFixed(2)}`}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-8">
              <span className="text-lg font-bold text-white">Total</span>
              <span className="text-2xl font-bold text-indigo-400">₹{grandTotal.toFixed(2)}</span>
            </div>

            <motion.button
              whileHover={{ scale: 1.02, boxShadow: "0px 0px 15px rgba(99, 102, 241, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/checkout')}
              className="w-full flex items-center justify-center bg-indigo-600 text-white py-4 px-6 rounded-2xl font-bold hover:bg-indigo-500 transition-all shadow-lg group"
            >
              Proceed to Checkout
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Cart;
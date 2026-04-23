// import { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { useCart } from '../context/CartContext';
// import { Check, ArrowLeft, Lock } from 'lucide-react';
// import { motion } from 'framer-motion';

// const Checkout = () => {
//   const { cart, cartTotal } = useCart();
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     email: '',
//     firstName: '',
//     lastName: '',
//     address: '',
//     city: '',
//     zipCode: '',
//     country: 'United States'
//   });

//   const tax = cartTotal * 0.08;
//   const shipping = cartTotal > 100 ? 0 : 15;
//   const grandTotal = cartTotal + tax + shipping;

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     // Validate and proceed to payment
//     navigate('/payment', { state: { orderData: formData, grandTotal } });
//   };

//   if (cart.length === 0) {
//     return <div className="text-center py-24 text-2xl font-bold">Your cart is empty.</div>;
//   }

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       exit={{ opacity: 0, y: -20 }}
//       transition={{ duration: 0.4 }}
//       className="min-h-screen bg-slate-950"
//     >
//       <div className="max-w-7xl mx-auto">
//         <div className="grid grid-cols-1 lg:grid-cols-2">

//           {/* Left Column - Form */}
//           <div className="p-4 sm:p-8 lg:p-16 xl:p-24 border-r border-slate-900">
//             <Link to="/cart" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-white mb-10 transition-colors">
//               <ArrowLeft className="w-4 h-4 mr-2" /> Return to Cart
//             </Link>

//             <form onSubmit={handleSubmit}>
//               <div className="mb-10">
//                 <h2 className="text-xl font-semibold text-white mb-4">Contact Information</h2>
//                 <div>
//                   <input
//                     type="email"
//                     required
//                     placeholder="Email address"
//                     className="w-full bg-slate-900 border border-slate-800 text-white text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-500 shadow-sm"
//                     value={formData.email}
//                     onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                   />
//                 </div>
//               </div>

//               <div className="mb-10">
//                 <h2 className="text-xl font-semibold text-white mb-4">Shipping Address</h2>
//                 <div className="space-y-4">
//                   <div className="grid grid-cols-2 gap-4">
//                     <input
//                       type="text"
//                       required
//                       placeholder="First name"
//                       className="w-full bg-slate-900 border border-slate-800 text-white text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-500 shadow-sm"
//                       value={formData.firstName}
//                       onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
//                     />
//                     <input
//                       type="text"
//                       required
//                       placeholder="Last name"
//                       className="w-full bg-slate-900 border border-slate-800 text-white text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-500 shadow-sm"
//                       value={formData.lastName}
//                       onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
//                     />
//                   </div>
//                   <input
//                     type="text"
//                     required
//                     placeholder="Address"
//                     className="w-full bg-slate-900 border border-slate-800 text-white text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-500 shadow-sm"
//                     value={formData.address}
//                     onChange={(e) => setFormData({ ...formData, address: e.target.value })}
//                   />
//                   <div className="grid grid-cols-2 gap-4">
//                     <input
//                       type="text"
//                       required
//                       placeholder="City"
//                       className="w-full bg-slate-900 border border-slate-800 text-white text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-500 shadow-sm"
//                       value={formData.city}
//                       onChange={(e) => setFormData({ ...formData, city: e.target.value })}
//                     />
//                     <input
//                       type="text"
//                       required
//                       placeholder="ZIP code"
//                       className="w-full bg-slate-900 border border-slate-800 text-white text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-500 shadow-sm"
//                       value={formData.zipCode}
//                       onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
//                     />
//                   </div>
//                 </div>
//               </div>

//               <button type="submit" className="w-full bg-indigo-600 text-white py-4 px-6 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg flex justify-center items-center">
//                 Continue to Payment
//               </button>
//             </form>
//           </div>

//           {/* Right Column - Summary */}
//           <div className="bg-slate-900/50 p-4 sm:p-8 lg:p-16 xl:p-24 border-t lg:border-t-0 border-slate-900">
//             <h2 className="text-xl font-semibold text-white mb-8">Order Summary</h2>

//             <div className="space-y-4 mb-8">
//               {cart.map(item => (
//                 <div key={item.cart_item_id} className="flex items-center gap-4">
//                   <div className="relative">
//                     <div className="w-16 h-16 bg-slate-800 rounded-xl overflow-hidden border border-slate-700 shadow-md">
//                       <img
//                         src={item.products?.image_url || "https://via.placeholder.com/100"}
//                         alt={item.products?.name}
//                         className="w-full h-full object-cover"
//                       />
//                     </div>
//                     <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
//                       {item.quantity}
//                     </span>
//                   </div>
//                   <div className="flex-grow">
//                     <p className="text-sm font-semibold text-slate-200 line-clamp-1">{item.products?.name}</p>
//                   </div>
//                   <div>
//                     <p className="text-sm font-semibold text-white">${(item.products?.price * item.quantity).toFixed(2)}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             <div className="space-y-3 pt-6 border-t border-slate-800 text-sm">
//               <div className="flex justify-between text-slate-400">
//                 <span>Subtotal</span>
//                 <span className="font-semibold text-white">${cartTotal.toFixed(2)}</span>
//               </div>
//               <div className="flex justify-between text-slate-400">
//                 <span>Shipping</span>
//                 <span className="font-semibold text-white">{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
//               </div>
//               <div className="flex justify-between text-slate-400">
//                 <span>Taxes</span>
//                 <span className="font-semibold text-white">${tax.toFixed(2)}</span>
//               </div>
//             </div>

//             <div className="flex justify-between items-center pt-6 mt-6 border-t border-slate-800">
//               <span className="text-base font-medium text-slate-200">Total</span>
//               <div className="flex items-baseline">
//                 <span className="text-xs text-slate-500 mr-2">USD</span>
//                 <span className="text-2xl font-bold text-indigo-400">${grandTotal.toFixed(2)}</span>
//               </div>
//             </div>

//             <div className="mt-8 flex items-center justify-center text-xs text-slate-400">
//               <Lock className="w-3 h-3 mr-1" /> Secure Checkout
//             </div>
//           </div>

//         </div>
//       </div>
//     </motion.div>
//   );
// };

// export default Checkout;


import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ArrowLeft, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const Checkout = () => {
  const { cart, cartTotal } = useCart();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    zipCode: '',
    country: 'United States'
  });

  const tax = cartTotal * 0.08;
  const shipping = cartTotal > 100 ? 0 : 15;
  const grandTotal = cartTotal + tax + shipping;

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/payment', { state: { orderData: formData, grandTotal } });
  };

  if (cart.length === 0) {
    return <div className="text-center py-24 text-2xl font-bold text-white">Your cart is empty.</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-slate-950"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2">

          {/* Left Column - Form */}
          <div className="p-4 sm:p-8 lg:p-16 xl:p-24 border-r border-slate-900">
            <Link to="/cart" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-white mb-10 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" /> Return to Cart
            </Link>

            <form onSubmit={handleSubmit}>
              <div className="mb-10">
                <h2 className="text-xl font-semibold text-white mb-4">Contact Information</h2>
                <input
                  type="email"
                  required
                  placeholder="Email address"
                  className="w-full bg-slate-900 border border-slate-800 text-white text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-500 shadow-sm"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="mb-10">
                <h2 className="text-xl font-semibold text-white mb-4">Shipping Address</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      required
                      placeholder="First name"
                      className="w-full bg-slate-900 border border-slate-800 text-white text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-500 shadow-sm"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                    <input
                      type="text"
                      required
                      placeholder="Last name"
                      className="w-full bg-slate-900 border border-slate-800 text-white text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-500 shadow-sm"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Address"
                    className="w-full bg-slate-900 border border-slate-800 text-white text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-500 shadow-sm"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      required
                      placeholder="City"
                      className="w-full bg-slate-900 border border-slate-800 text-white text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-500 shadow-sm"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                    <input
                      type="text"
                      required
                      placeholder="ZIP code"
                      className="w-full bg-slate-900 border border-slate-800 text-white text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-500 shadow-sm"
                      value={formData.zipCode}
                      onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <button type="submit" className="w-full bg-indigo-600 text-white py-4 px-6 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg flex justify-center items-center">
                Continue to Payment
              </button>
            </form>
          </div>

          {/* Right Column - Summary */}
          <div className="bg-slate-900/50 p-4 sm:p-8 lg:p-16 xl:p-24 border-t lg:border-t-0 border-slate-900">
            <h2 className="text-xl font-semibold text-white mb-8">Order Summary</h2>

            <div className="space-y-4 mb-8">
              {cart.map(item => (
                <div key={item.product_id} className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-slate-800 rounded-xl overflow-hidden border border-slate-700 shadow-md">
                      <img
                        src={item.image_url || "https://via.placeholder.com/100"}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-grow">
                    <p className="text-sm font-semibold text-slate-200 line-clamp-1">{item.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-6 border-t border-slate-800 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span className="font-semibold text-white">₹{cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Shipping</span>
                <span className="font-semibold text-white">{shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Taxes</span>
                <span className="font-semibold text-white">₹{tax.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-6 mt-6 border-t border-slate-800">
              <span className="text-base font-medium text-slate-200">Total</span>
              <div className="flex items-baseline">
                <span className="text-xs text-slate-500 mr-2">INR</span>
                <span className="text-2xl font-bold text-indigo-400">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-center text-xs text-slate-400">
              <Lock className="w-3 h-3 mr-1" /> Secure Checkout
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
};

export default Checkout;
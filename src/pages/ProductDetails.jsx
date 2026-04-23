// // import { useState, useEffect } from 'react';
// // import { useParams, useNavigate } from 'react-router-dom';
// // import { api } from '../services/api';
// // import { useCart } from '../context/CartContext';
// // import { useUser } from '../context/UserContext';
// // import { Star, Heart, ArrowLeft, Shield, Truck, RotateCcw } from 'lucide-react';
// // import { motion } from 'framer-motion';

// // const ProductDetails = () => {
// //   const { id } = useParams();
// //   const navigate = useNavigate();
// //   const [product, setProduct] = useState(null);
// //   const [loading, setLoading] = useState(true);
// //   const { addToCart } = useCart();
// //   const { user, toggleWishlist } = useUser();

// //   useEffect(() => {
// //     const fetchProduct = async () => {
// //       const data = await api.products.getById(Number(id));
// //       setProduct(data);
// //       setLoading(false);
// //     };
// //     fetchProduct();
// //   }, [id]);

// //   if (loading) return (
// //     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
// //       <div className="h-8 bg-slate-800 w-32 rounded mb-8"></div>
// //       <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
// //         <div className="aspect-square bg-slate-800 rounded-3xl"></div>
// //         <div className="space-y-6 pt-8">
// //           <div className="h-10 bg-slate-800 w-3/4 rounded"></div>
// //           <div className="h-6 bg-slate-800 w-1/4 rounded"></div>
// //           <div className="h-32 bg-slate-800 w-full rounded"></div>
// //         </div>
// //       </div>
// //     </div>
// //   );

// //   if (!product) return <div className="text-center py-24 text-2xl font-bold text-white">Product not found.</div>;

// //   const handleAddToCart = () => {
// //     addToCart(product, 1);
// //   };

// //   const isWishlisted = user?.wishlist.includes(product.product_id) || false;

// //   return (
// //     <motion.div
// //       initial={{ opacity: 0, y: 20 }}
// //       animate={{ opacity: 1, y: 0 }}
// //       exit={{ opacity: 0, y: -20 }}
// //       transition={{ duration: 0.4 }}
// //       className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
// //     >
// //       <button onClick={() => navigate(-1)} className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-white mb-8 transition-colors">
// //         <ArrowLeft className="w-4 h-4 mr-2" /> Back to Collection
// //       </button>

// //       <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
// //         {/* Image Gallery */}
// //         <div className="space-y-4">
// //           <div className="relative w-full aspect-[4/5] lg:aspect-square bg-slate-900 rounded-3xl overflow-hidden group border border-slate-800">
// //             <img
// //               src={product.image_url || "https://via.placeholder.com/300"}
// //               alt={product.name}
// //               className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
// //             />
// //             <button
// //               onClick={() => toggleWishlist(product.product_id)}
// //               className="absolute top-6 right-6 w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform z-10"
// //             >
// //               <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
// //             </button>
// //           </div>
// //         </div>

// //         {/* Product Info */}
// //         <div className="flex flex-col pt-4 lg:pt-8">
// //           <div className="mb-8">
// //             <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4">{product.name}</h1>
// //             <div className="flex items-center space-x-4 mb-6">
// //               <div className="flex items-center">
// //                 {[1, 2, 3, 4, 5].map(star => (
// //                   <Star key={star} className={`w-5 h-5 ${star <= Math.round(product.rating || 4) ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} />
// //                 ))}
// //               </div>
// //               <span className="text-slate-400 text-sm font-medium">{product.rating || 4.5} ({product.reviews || 10} reviews)</span>
// //             </div>
// //             <p className="text-3xl font-semibold text-white">${product.price.toFixed(2)}</p>
// //           </div>

// //           <p className="text-slate-400 leading-relaxed text-lg mb-10">
// //             {product.description}
// //           </p>

// //           <div className="mb-10 space-y-4">
// //             <motion.button
// //               whileHover={product.stock_quantity ? { scale: 1.02, boxShadow: "0px 0px 15px rgba(99, 102, 241, 0.4)" } : {}}
// //               whileTap={product.stock_quantity ? { scale: 0.95 } : {}}
// //               onClick={handleAddToCart}
// //               disabled={!product.stock_quantity}
// //               className={`w-full py-4 px-8 rounded-2xl text-lg font-bold flex items-center justify-center transition-all shadow-sm ${product.stock_quantity
// //                 ? 'bg-indigo-600 text-white shadow-md hover:bg-indigo-500'
// //                 : 'bg-slate-800 text-slate-500 cursor-not-allowed'
// //                 }`}
// //             >
// //               {product.stock_quantity ? 'Add to Cart' : 'Out of Stock'}
// //             </motion.button>
// //             <motion.button
// //               onClick={() => { handleAddToCart(); navigate('/checkout'); }}
// //               whileHover={{ scale: 1.02 }}
// //               whileTap={{ scale: 0.95 }}
// //               className="w-full py-4 px-8 rounded-2xl text-lg font-bold border-2 border-slate-700 text-white hover:border-indigo-500 hover:bg-indigo-900/20 flex items-center justify-center transition-all bg-slate-900/50 backdrop-blur"
// //             >
// //               Buy it Now
// //             </motion.button>
// //           </div>

// //           {/* Perks */}
// //           <div className="mt-auto border-t border-slate-800 pt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
// //             <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
// //               <Truck className="w-6 h-6 text-indigo-400 mb-3" />
// //               <h4 className="text-sm font-bold text-white mb-1">Free Shipping</h4>
// //               <p className="text-xs text-slate-400">On orders over $100</p>
// //             </div>
// //             <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
// //               <RotateCcw className="w-6 h-6 text-indigo-400 mb-3" />
// //               <h4 className="text-sm font-bold text-white mb-1">Easy Returns</h4>
// //               <p className="text-xs text-slate-400">30-day money-back</p>
// //             </div>
// //             <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
// //               <Shield className="w-6 h-6 text-indigo-400 mb-3" />
// //               <h4 className="text-sm font-bold text-white mb-1">2 Year Warranty</h4>
// //               <p className="text-xs text-slate-400">Guaranteed quality</p>
// //             </div>
// //           </div>

// //         </div>
// //       </div>
// //     </motion.div>
// //   );
// // };

// // export default ProductDetails;


// import { useState, useEffect } from 'react';
// import { useParams, useNavigate, Link } from 'react-router-dom';
// import { api } from '../services/api';
// import { useCart } from '../context/CartContext';
// import { useUser } from '../context/UserContext';
// import { Star, Heart, ArrowLeft, Shield, Truck, RotateCcw } from 'lucide-react';
// import { motion } from 'framer-motion';

// const ProductDetails = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [product, setProduct] = useState(null);
//   const [recommendations, setRecommendations] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const { addToCart } = useCart();
//   const { user } = useUser(); // removed toggleWishlist — not in UserContext anymore

//   useEffect(() => {
//     const fetchProduct = async () => {
//       setLoading(true);
//       try {
//         const data = await api.products.getById(Number(id));
//         setProduct(data);

//         if (data.category_id) {
//           const recs = await api.products.getByCategory(data.category_id);
//           setRecommendations(recs.filter(r => r.product_id !== data.product_id).slice(0, 4));
//         }
//       } catch (err) {
//         console.error("Failed to fetch product:", err);
//       }
//       setLoading(false);
//     };
//     fetchProduct();
//   }, [id]);

//   if (loading) return (
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
//       <div className="h-8 bg-slate-800 w-32 rounded mb-8"></div>
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
//         <div className="aspect-square bg-slate-800 rounded-3xl"></div>
//         <div className="space-y-6 pt-8">
//           <div className="h-10 bg-slate-800 w-3/4 rounded"></div>
//           <div className="h-6 bg-slate-800 w-1/4 rounded"></div>
//           <div className="h-32 bg-slate-800 w-full rounded"></div>
//         </div>
//       </div>
//     </div>
//   );

//   if (!product) return <div className="text-center py-24 text-2xl font-bold text-white">Product not found.</div>;

//   const handleAddToCart = () => {
//     addToCart(product, 1);
//   };

//   // Safely default to false — wishlist not yet implemented with Supabase
//   const isWishlisted = false;

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       exit={{ opacity: 0, y: -20 }}
//       transition={{ duration: 0.4 }}
//       className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
//     >
//       <button onClick={() => navigate(-1)} className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-white mb-8 transition-colors">
//         <ArrowLeft className="w-4 h-4 mr-2" /> Back to Collection
//       </button>

//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
//         {/* Image Gallery */}
//         <div className="space-y-4">
//           <div className="relative w-full aspect-[4/5] lg:aspect-square bg-slate-900 rounded-3xl overflow-hidden group border border-slate-800">
//             <img
//               src={product.image_url || "https://via.placeholder.com/300"}
//               alt={product.name}
//               className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
//             />
//             <button
//               onClick={() => { }} // wishlist coming soon
//               className="absolute top-6 right-6 w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform z-10"
//             >
//               <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
//             </button>
//           </div>
//         </div>

//         {/* Product Info */}
//         <div className="flex flex-col pt-4 lg:pt-8">
//           <div className="mb-8">
//             <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-2">{product.name}</h1>

//             {product.vendors?.name && (
//               <div className="inline-block mb-4 text-xs tracking-wide bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-3 py-1.5 rounded-full font-semibold uppercase">
//                 Sold by {product.vendors.name}
//               </div>
//             )}

//             <div className="flex items-center space-x-4 mb-6">
//               <div className="flex items-center">
//                 {[1, 2, 3, 4, 5].map(star => (
//                   <Star key={star} className={`w-5 h-5 ${star <= Math.round(product.rating || 4) ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} />
//                 ))}
//               </div>
//               <span className="text-slate-400 text-sm font-medium">{product.rating || 4.5} ({product.reviews || 10} reviews)</span>
//             </div>
//             <p className="text-3xl font-semibold text-white">₹{product.price?.toFixed(2)}</p>
//           </div>

//           <p className="text-slate-400 leading-relaxed text-lg mb-10">
//             {product.description}
//           </p>

//           <div className="mb-10 space-y-4">
//             <motion.button
//               whileHover={product.stock_quantity ? { scale: 1.02, boxShadow: "0px 0px 15px rgba(99, 102, 241, 0.4)" } : {}}
//               whileTap={product.stock_quantity ? { scale: 0.95 } : {}}
//               onClick={handleAddToCart}
//               disabled={!product.stock_quantity}
//               className={`w-full py-4 px-8 rounded-2xl text-lg font-bold flex items-center justify-center transition-all shadow-sm ${product.stock_quantity
//                 ? 'bg-indigo-600 text-white shadow-md hover:bg-indigo-500'
//                 : 'bg-slate-800 text-slate-500 cursor-not-allowed'
//                 }`}
//             >
//               {product.stock_quantity ? 'Add to Cart' : 'Out of Stock'}
//             </motion.button>
//             <motion.button
//               onClick={() => { handleAddToCart(); navigate('/checkout'); }}
//               whileHover={{ scale: 1.02 }}
//               whileTap={{ scale: 0.95 }}
//               className="w-full py-4 px-8 rounded-2xl text-lg font-bold border-2 border-slate-700 text-white hover:border-indigo-500 hover:bg-indigo-900/20 flex items-center justify-center transition-all bg-slate-900/50 backdrop-blur"
//             >
//               Buy it Now
//             </motion.button>
//           </div>

//           {/* Perks */}
//           <div className="mt-auto border-t border-slate-800 pt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
//             <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
//               <Truck className="w-6 h-6 text-indigo-400 mb-3" />
//               <h4 className="text-sm font-bold text-white mb-1">Free Shipping</h4>
//               <p className="text-xs text-slate-400">On orders over $100</p>
//             </div>
//             <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
//               <RotateCcw className="w-6 h-6 text-indigo-400 mb-3" />
//               <h4 className="text-sm font-bold text-white mb-1">Easy Returns</h4>
//               <p className="text-xs text-slate-400">30-day money-back</p>
//             </div>
//             <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
//               <Shield className="w-6 h-6 text-indigo-400 mb-3" />
//               <h4 className="text-sm font-bold text-white mb-1">2 Year Warranty</h4>
//               <p className="text-xs text-slate-400">Guaranteed quality</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Recommendations */}
//       {recommendations.length > 0 && (
//         <div className="mt-20 border-t border-slate-800 pt-12">
//           <h2 className="text-2xl font-bold text-white mb-8">You might also like</h2>
//           <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
//             {recommendations.map(rec => (
//               <Link to={`/products/${rec.product_id}`} key={rec.product_id} className="group flex flex-col bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300">
//                 <div className="aspect-[4/5] bg-slate-800 overflow-hidden relative">
//                   <img src={rec.image_url || "https://via.placeholder.com/300"} alt={rec.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
//                   {rec.stock_quantity === 0 && (
//                     <div className="absolute top-3 left-3 bg-red-500/90 text-white text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider backdrop-blur-sm">Sold Out</div>
//                   )}
//                 </div>
//                 <div className="p-5 flex flex-col flex-1 relative">
//                   <h3 className="font-bold text-white text-base line-clamp-1 mb-1">{rec.name}</h3>
//                   <div className="flex items-center justify-between mt-auto pt-4">
//                     <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{rec.categories?.category_name}</span>
//                     <span className="font-black text-white">₹{(rec.price || 0).toFixed(2)}</span>
//                   </div>
//                 </div>
//               </Link>
//             ))}
//           </div>
//         </div>
//       )}
//     </motion.div>
//   );
// };

// export default ProductDetails;


import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { useWishlist } from '../hooks/useWishlist';
import { Star, Heart, ArrowLeft, Shield, Truck, RotateCcw, Store, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart, vendorError, clearVendorError } = useCart();
  const { user } = useUser();
  const { toggleWishlist, isWishlisted } = useWishlist();

  const [reviews, setReviews] = useState([]);
  const [newRating, setNewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await api.products.getById(Number(id));
        setProduct(data);
        const revs = await api.reviews.getByProduct(Number(id));
        setReviews(revs || []);
      } catch (err) {
        console.error('Failed to fetch product:', err);
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
      <div className="h-8 bg-slate-800 w-32 rounded mb-8"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="aspect-square bg-slate-800 rounded-3xl"></div>
        <div className="space-y-6 pt-8">
          <div className="h-10 bg-slate-800 w-3/4 rounded"></div>
          <div className="h-6 bg-slate-800 w-1/4 rounded"></div>
          <div className="h-32 bg-slate-800 w-full rounded"></div>
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div className="text-center py-24 text-2xl font-bold text-white">Product not found.</div>
  );

  const handleAddToCart = () => {
    clearVendorError();
    addToCart(product, 1);
  };

  const handleBuyNow = () => {
    clearVendorError();
    const success = addToCart(product, 1);
    if (success !== false) navigate('/checkout');
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) return alert('Please login to review.');
    setSubmittingReview(true);
    try {
        const newRev = await api.reviews.create({
            product_id: product.product_id,
            user_id: user.id,
            rating: newRating,
            text: newReviewText
        });
        // append locally with dummy profile placeholder
        setReviews(prev => [{ ...newRev, profiles: { full_name: 'You' } }, ...prev]);
        setNewReviewText('');
        setNewRating(5);
    } catch (err) {
        console.error('Failed to submit review', err);
    }
    setSubmittingReview(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
    >
      <button onClick={() => navigate(-1)} className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-white mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Collection
      </button>

      {/* Vendor error banner */}
      <AnimatePresence>
        {vendorError && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center justify-between gap-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-2xl px-5 py-3 mb-6"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{vendorError}</span>
            </div>
            <button onClick={clearVendorError}><X className="w-4 h-4" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        {/* Image */}
        <div className="space-y-4">
          <div className="relative w-full aspect-[4/5] lg:aspect-square bg-slate-900 rounded-3xl overflow-hidden group border border-slate-800">
            <img
              src={product.image_url || 'https://via.placeholder.com/300'}
              alt={product.name}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            <button 
              onClick={() => toggleWishlist(product.product_id)}
              className="absolute top-6 right-6 w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform z-10"
            >
              <Heart className={`w-5 h-5 ${isWishlisted(product.product_id) ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col pt-4 lg:pt-8">
          {/* Vendor badge */}
          {product.vendors?.name && (
            <div className="flex items-center gap-2 mb-4">
              <Store className="w-4 h-4 text-indigo-400" />
              <span className="text-sm text-slate-400">Sold by <span className="text-indigo-400 font-semibold">{product.vendors.name}</span></span>
            </div>
          )}

          <div className="mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4">{product.name}</h1>
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star key={star} className={`w-5 h-5 ${star <= Math.round(product.rating || 4) ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} />
                ))}
              </div>
              <span className="text-slate-400 text-sm">{product.rating || 4.5} ({reviews.length} reviews)</span>
            </div>
            <p className="text-3xl font-semibold text-white">₹{product.price?.toFixed(2)}</p>
          </div>

          <p className="text-slate-400 leading-relaxed text-lg mb-10">{product.description}</p>

          <div className="mb-10 space-y-4">
            <motion.button
              whileHover={product.stock_quantity ? { scale: 1.02, boxShadow: '0px 0px 15px rgba(99, 102, 241, 0.4)' } : {}}
              whileTap={product.stock_quantity ? { scale: 0.95 } : {}}
              onClick={handleAddToCart}
              disabled={!product.stock_quantity}
              className={`w-full py-4 px-8 rounded-2xl text-lg font-bold flex items-center justify-center transition-all shadow-sm ${product.stock_quantity
                  ? 'bg-indigo-600 text-white shadow-md hover:bg-indigo-500'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
            >
              {product.stock_quantity ? 'Add to Cart' : 'Out of Stock'}
            </motion.button>
            <motion.button
              onClick={handleBuyNow}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}
              className="w-full py-4 px-8 rounded-2xl text-lg font-bold border-2 border-slate-700 text-white hover:border-indigo-500 hover:bg-indigo-900/20 flex items-center justify-center transition-all bg-slate-900/50 backdrop-blur"
            >
              Buy it Now
            </motion.button>
          </div>

          {/* Perks */}
          <div className="mt-auto border-t border-slate-800 pt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
              <Truck className="w-6 h-6 text-indigo-400 mb-3" />
              <h4 className="text-sm font-bold text-white mb-1">Free Shipping</h4>
              <p className="text-xs text-slate-400">On orders over ₹7,500</p>
            </div>
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
              <RotateCcw className="w-6 h-6 text-indigo-400 mb-3" />
              <h4 className="text-sm font-bold text-white mb-1">Easy Returns</h4>
              <p className="text-xs text-slate-400">30-day money-back</p>
            </div>
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
              <Shield className="w-6 h-6 text-indigo-400 mb-3" />
              <h4 className="text-sm font-bold text-white mb-1">2 Year Warranty</h4>
              <p className="text-xs text-slate-400">Guaranteed quality</p>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="mt-24 border-t border-slate-800 pt-16">
        <h2 className="text-3xl font-bold text-white mb-10 text-center">Customer Reviews</h2>
        <div className="max-w-3xl mx-auto space-y-12">
            
            {/* Add Review Form */}
            {user ? (
                <form onSubmit={submitReview} className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
                    <h3 className="text-lg font-bold text-white mb-4">Write a Review</h3>
                    <div className="flex items-center gap-2 mb-4">
                        {[1,2,3,4,5].map(star => (
                            <button type="button" key={star} onClick={() => setNewRating(star)} className="focus:outline-none">
                                <Star className={`w-6 h-6 transition-colors ${star <= newRating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} />
                            </button>
                        ))}
                    </div>
                    <textarea value={newReviewText} required onChange={e => setNewReviewText(e.target.value)} rows="3"
                        placeholder="What do you think about this product?"
                        className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4 placeholder:text-slate-600 resize-none"
                    />
                    <button type="submit" disabled={submittingReview} className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-bold py-2.5 px-6 rounded-xl transition-colors text-sm">
                        {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                </form>
            ) : (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center">
                    <p className="text-slate-400 mb-3">Please log in to share your thoughts.</p>
                    <button onClick={() => navigate('/login')} className="bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2 px-6 rounded-xl transition-colors text-sm border border-slate-700">Log In</button>
                </div>
            )}

            {/* List Reviews */}
            <div className="space-y-6">
                {reviews.length === 0 ? (
                    <div className="text-center py-10 text-slate-500 border border-slate-800/50 rounded-3xl bg-slate-900/20">
                        No reviews yet. Be the first to review!
                    </div>
                ) : (
                    reviews.map((rev) => (
                        <div key={rev.review_id || Math.random()} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <div className="flex items-center gap-1 mb-1">
                                        {[1,2,3,4,5].map(star => (
                                            <Star key={star} className={`w-4 h-4 ${star <= rev.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} />
                                        ))}
                                    </div>
                                    <p className="font-semibold text-white/90 text-sm">
                                        {rev.profiles?.full_name || 'Anonymous User'}
                                    </p>
                                </div>
                                <span className="text-xs text-slate-500">{new Date(rev.created_at || Date.now()).toLocaleDateString()}</span>
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed">{rev.text}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductDetails;
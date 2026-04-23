// // import { useState, useEffect } from 'react';
// // import { Link, useLocation } from 'react-router-dom';
// // import { api } from '../services/api';
// // import { Filter, Star, ChevronDown } from 'lucide-react';
// // import { motion, AnimatePresence } from 'framer-motion';
// // import { categories } from '../mockData/products';

// // const containerVariants = {
// //   hidden: { opacity: 0 },
// //   show: {
// //     opacity: 1,
// //     transition: { staggerChildren: 0.05 }
// //   }
// // };

// // const itemVariants = {
// //   hidden: { opacity: 0, scale: 0.95, y: 20 },
// //   show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
// // };

// // const ProductListing = () => {
// //   const location = useLocation();
// //   const [products, setProducts] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [activeCategory, setActiveCategory] = useState(location.state?.category || 'All');
// //   const [showAllCategories, setShowAllCategories] = useState(false);

// //   // Update active category if navigation state changes while already on the page
// //   useEffect(() => {
// //     if (location.state?.category) {
// //       setActiveCategory(location.state.category);
// //     }
// //   }, [location.state?.category]);

// //   useEffect(() => {
// //     const fetchProducts = async () => {
// //       setLoading(true);
// //       const data = activeCategory === 'All'
// //         ? await api.products.getAll()
// //         : await api.products.getByCategory(activeCategory);
// //       setProducts(data);
// //       setLoading(false);
// //     };

// //     fetchProducts();
// //   }, [activeCategory]);

// //   return (
// //     <motion.div
// //       initial={{ opacity: 0, y: 20 }}
// //       animate={{ opacity: 1, y: 0 }}
// //       exit={{ opacity: 0, y: -20 }}
// //       transition={{ duration: 0.4 }}
// //       className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
// //     >
// //       {/* Header */}
// //       <div className="flex flex-col md:flex-row md:items-center justify-between mb-10">
// //         <div>
// //           <h1 className="text-4xl font-bold text-white tracking-tight">Our Collection</h1>
// //           <p className="text-slate-400 mt-2">Explore {products.length} meticulously crafted items.</p>
// //         </div>

// //         {/* Filters Desktop */}
// //         <div className="hidden md:flex items-center space-x-2 mt-6 md:mt-0 bg-slate-900 p-1 rounded-full shadow-sm border border-slate-800 flex-wrap">
// //           {(showAllCategories ? categories : categories.slice(0, 4)).map(cat => (
// //             <motion.button
// //               whileHover={{ scale: 1.05 }}
// //               whileTap={{ scale: 0.95 }}
// //               key={cat}
// //               onClick={() => setActiveCategory(cat)}
// //               className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === cat
// //                   ? 'bg-indigo-600 text-white shadow-md'
// //                   : 'text-slate-400 hover:bg-slate-800'
// //                 }`}
// //             >
// //               {cat}
// //             </motion.button>
// //           ))}
// //           {categories.length > 4 && (
// //             <button
// //               onClick={() => setShowAllCategories(!showAllCategories)}
// //               className="px-4 py-2 text-slate-400 hover:text-slate-600 flex items-center transition-colors"
// //             >
// //               <Filter className="w-4 h-4 mr-1" /> {showAllCategories ? 'Less' : 'More'}
// //             </button>
// //           )}
// //         </div>
// //       </div>

// //       {/* category pills mobile */}
// //       <div className="md:hidden flex overflow-x-auto space-x-2 pb-4 mb-6 scrollbar-hide">
// //         {categories.map(cat => (
// //           <button
// //             key={cat}
// //             onClick={() => setActiveCategory(cat)}
// //             className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors border ${activeCategory === cat
// //                 ? 'bg-indigo-600 text-white border-indigo-600'
// //                 : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
// //               }`}
// //           >
// //             {cat}
// //           </button>
// //         ))}
// //       </div>

// //       {/* Grid */}
// //       {loading ? (
// //         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
// //           {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
// //             <div key={n} className="animate-pulse">
// //               <div className="bg-slate-800 w-full aspect-square rounded-2xl mb-4"></div>
// //               <div className="bg-slate-800 h-5 w-3/4 rounded mb-2"></div>
// //               <div className="bg-slate-800 h-4 w-1/4 rounded"></div>
// //             </div>
// //           ))}
// //         </div>
// //       ) : (
// //         <AnimatePresence mode="wait">
// //           <motion.div
// //             key={activeCategory}
// //             variants={containerVariants}
// //             initial="hidden"
// //             animate="show"
// //             exit="hidden"
// //             className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
// //           >
// //             {products.map(product => (
// //               // <motion.div key={product.id} variants={itemVariants}>
// //               //   <Link to={`/product/${product.id}`} className="group relative block p-4 bg-slate-900/50 backdrop-blur-md rounded-3xl border border-slate-800 hover:bg-slate-800 transition-colors shadow-lg">
// //               //     <div className="w-full aspect-square bg-slate-800/80 rounded-2xl overflow-hidden mb-4 relative z-0">
// //               //       <img 
// //               //         src={product.image} 
// //               //         alt={product.name} 
// //               //         className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out" 
// //               //       />
// //               //       {!product.inStock && (
// //               //         <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
// //               //           Sold Out
// //               //         </div>
// //               //       )}
// //               //       {/* Hover overlay button mock */}
// //               //       <div className="absolute inset-x-4 bottom-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
// //               //         <motion.button 
// //               //           whileHover={{ scale: 1.05, boxShadow: "0px 0px 12px rgba(99, 102, 241, 0.3)" }}
// //               //           whileTap={{ scale: 0.95 }}
// //               //           className="w-full bg-indigo-600/90 backdrop-blur text-white text-sm font-semibold py-3 rounded-xl shadow-lg border border-indigo-500/50 hover:bg-indigo-500"
// //               //         >
// //               //           Quick View
// //               //         </motion.button>
// //               //       </div>
// //               //     </div>
// //               //     <div>
// //               //       <div className="flex justify-between items-start mb-1">
// //               //         <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">{product.name}</h3>
// //               //         <p className="font-semibold text-white whitespace-nowrap ml-2">${product.price.toFixed(2)}</p>
// //               //       </div>
// //               //       <div className="flex items-center text-sm text-slate-500">
// //               //         <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 mr-1" />
// //               //         <span>{product.rating} <span className="text-slate-400">({product.reviews})</span></span>
// //               //       </div>
// //               //     </div>
// //               //   </Link>
// //               // </motion.div>
// //               <motion.div key={product.product_id} variants={itemVariants}>
// //                 <Link
// //                   to={`/product/${product.product_id}`}
// //                   className="group relative block p-4 bg-slate-900/50 backdrop-blur-md rounded-3xl border border-slate-800 hover:bg-slate-800 transition-colors shadow-lg"
// //                 >
// //                   <div className="w-full aspect-square bg-slate-800/80 rounded-2xl overflow-hidden mb-4 relative z-0">

// //                     {/* ✅ IMAGE FIX */}
// //                     <img
// //                       src={product.image_url || "https://via.placeholder.com/300"}
// //                       alt={product.name}
// //                       className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
// //                     />

// //                     {/* ✅ STOCK FIX */}
// //                     {(product.stock_quantity ?? 0) === 0 && (
// //                       <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
// //                         Sold Out
// //                       </div>
// //                     )}

// //                     {/* Hover overlay */}
// //                     <div className="absolute inset-x-4 bottom-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
// //                       <motion.button
// //                         whileHover={{ scale: 1.05, boxShadow: "0px 0px 12px rgba(99, 102, 241, 0.3)" }}
// //                         whileTap={{ scale: 0.95 }}
// //                         className="w-full bg-indigo-600/90 backdrop-blur text-white text-sm font-semibold py-3 rounded-xl shadow-lg border border-indigo-500/50 hover:bg-indigo-500"
// //                       >
// //                         Quick View
// //                       </motion.button>
// //                     </div>
// //                   </div>

// //                   <div>
// //                     <div className="flex justify-between items-start mb-1">

// //                       {/* ✅ NAME */}
// //                       <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
// //                         {product.name}
// //                       </h3>

// //                       {/* ✅ PRICE FIX */}
// //                       <p className="font-semibold text-white whitespace-nowrap ml-2">
// //                         ₹{product.price}
// //                       </p>

// //                     </div>

// //                     {/* OPTIONAL (since not in DB) */}
// //                     <div className="flex items-center text-sm text-slate-500">
// //                       <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 mr-1" />
// //                       <span>
// //                         {product.rating || 4.5}
// //                         <span className="text-slate-400">
// //                           ({product.reviews || 10})
// //                         </span>
// //                       </span>
// //                     </div>
// //                   </div>

// //                 </Link>
// //               </motion.div>
// //             ))}
// //           </motion.div>
// //         </AnimatePresence>
// //       )}
// //     </motion.div>
// //   );
// // };

// // export default ProductListing;


// import { useState, useEffect } from 'react';
// import { Link, useLocation } from 'react-router-dom';
// import { supabase } from '../supabaseClient';
// import { Filter, Star } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';

// const containerVariants = {
//   hidden: { opacity: 0 },
//   show: { opacity: 1, transition: { staggerChildren: 0.05 } }
// };

// const itemVariants = {
//   hidden: { opacity: 0, scale: 0.95, y: 20 },
//   show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
// };

// const ProductListing = () => {
//   const location = useLocation();
//   const [products, setProducts] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [activeCategory, setActiveCategory] = useState(location.state?.category || 'All');
//   const [showAllCategories, setShowAllCategories] = useState(false);

//   // ✅ Fetch categories from DB
//   useEffect(() => {
//     const fetchCategories = async () => {
//       const { data, error } = await supabase.from('categories').select('*');
//       if (!error && data) setCategories(data);
//     };
//     fetchCategories();
//   }, []);

//   // ✅ Re-read category from nav state when it changes
//   useEffect(() => {
//     if (location.state?.category) {
//       setActiveCategory(location.state.category);
//     }
//   }, [location.state]);

//   // ✅ Fetch products — filter by category name via joined categories table
//   useEffect(() => {
//     const fetchProducts = async () => {
//       setLoading(true);
//       try {
//         let query = supabase
//           .from('products')
//           .select('*, categories(category_name), inventory(stock_quantity)');

//         if (activeCategory !== 'All') {
//           // Find category_id for the selected name
//           const cat = categories.find(c => c.category_name === activeCategory);
//           if (cat) {
//             query = query.eq('category_id', cat.category_id);
//           }
//         }

//         const { data, error } = await query;
//         if (!error && data) {
//           setProducts(data.map(p => ({
//             ...p,
//             stock_quantity: p.inventory?.[0]?.stock_quantity ?? 0
//           })));
//         }
//       } catch (err) {
//         console.error('Failed to fetch products:', err);
//       }
//       setLoading(false);
//     };

//     // Only fetch once categories are loaded (or if activeCategory is 'All')
//     if (activeCategory === 'All' || categories.length > 0) {
//       fetchProducts();
//     }
//   }, [activeCategory, categories]);

//   const displayCategories = ['All', ...categories.map(c => c.category_name)];
//   const visibleCategories = showAllCategories ? displayCategories : displayCategories.slice(0, 5);

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       exit={{ opacity: 0, y: -20 }}
//       transition={{ duration: 0.4 }}
//       className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
//     >
//       {/* Header */}
//       <div className="flex flex-col md:flex-row md:items-center justify-between mb-10">
//         <div>
//           <h1 className="text-4xl font-bold text-white tracking-tight">Our Collection</h1>
//           <p className="text-slate-400 mt-2">
//             {loading ? 'Loading...' : `Explore ${products.length} meticulously crafted items.`}
//           </p>
//         </div>

//         {/* Category Filter — Desktop */}
//         <div className="hidden md:flex items-center mt-6 md:mt-0 bg-slate-900 p-1 rounded-full shadow-sm border border-slate-800 flex-wrap gap-1">
//           {visibleCategories.map(cat => (
//             <motion.button
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//               key={cat}
//               onClick={() => setActiveCategory(cat)}
//               className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === cat
//                   ? 'bg-indigo-600 text-white shadow-md'
//                   : 'text-slate-400 hover:bg-slate-800'
//                 }`}
//             >
//               {cat}
//             </motion.button>
//           ))}
//           {displayCategories.length > 5 && (
//             <button
//               onClick={() => setShowAllCategories(!showAllCategories)}
//               className="px-4 py-2 text-slate-400 hover:text-white flex items-center transition-colors text-sm"
//             >
//               <Filter className="w-4 h-4 mr-1" />
//               {showAllCategories ? 'Less' : 'More'}
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Category Pills — Mobile */}
//       <div className="md:hidden flex overflow-x-auto space-x-2 pb-4 mb-6">
//         {displayCategories.map(cat => (
//           <button
//             key={cat}
//             onClick={() => setActiveCategory(cat)}
//             className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors border ${activeCategory === cat
//                 ? 'bg-indigo-600 text-white border-indigo-600'
//                 : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
//               }`}
//           >
//             {cat}
//           </button>
//         ))}
//       </div>

//       {/* Product Grid */}
//       {loading ? (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
//           {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
//             <div key={n} className="animate-pulse">
//               <div className="bg-slate-800 w-full aspect-square rounded-2xl mb-4"></div>
//               <div className="bg-slate-800 h-5 w-3/4 rounded mb-2"></div>
//               <div className="bg-slate-800 h-4 w-1/4 rounded"></div>
//             </div>
//           ))}
//         </div>
//       ) : products.length === 0 ? (
//         <div className="text-center py-24 text-slate-500">
//           <p className="text-lg font-semibold text-white mb-2">No products found</p>
//           <p className="text-sm">Try selecting a different category.</p>
//         </div>
//       ) : (
//         <AnimatePresence mode="wait">
//           <motion.div
//             key={activeCategory}
//             variants={containerVariants}
//             initial="hidden"
//             animate="show"
//             exit="hidden"
//             className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
//           >
//             {products.map(product => (
//               <motion.div key={product.product_id} variants={itemVariants}>
//                 <Link
//                   to={`/product/${product.product_id}`}
//                   className="group relative block p-4 bg-slate-900/50 backdrop-blur-md rounded-3xl border border-slate-800 hover:bg-slate-800 transition-colors shadow-lg"
//                 >
//                   <div className="w-full aspect-square bg-slate-800/80 rounded-2xl overflow-hidden mb-4 relative z-0">
//                     <img
//                       src={product.image_url || "https://via.placeholder.com/300"}
//                       alt={product.name}
//                       className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
//                     />
//                     {product.stock_quantity === 0 && (
//                       <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
//                         Sold Out
//                       </div>
//                     )}
//                     <div className="absolute inset-x-4 bottom-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
//                       <motion.button
//                         whileHover={{ scale: 1.05, boxShadow: "0px 0px 12px rgba(99, 102, 241, 0.3)" }}
//                         whileTap={{ scale: 0.95 }}
//                         className="w-full bg-indigo-600/90 backdrop-blur text-white text-sm font-semibold py-3 rounded-xl shadow-lg border border-indigo-500/50 hover:bg-indigo-500"
//                       >
//                         Quick View
//                       </motion.button>
//                     </div>
//                   </div>

//                   <div>
//                     <div className="flex justify-between items-center mb-1">
//                       <span className="text-xs text-slate-500 uppercase tracking-wider">
//                         {product.categories?.category_name || ''}
//                       </span>
//                       {product.vendors?.name && (
//                         <span className="text-[10px] bg-indigo-500/10 text-indigo-300 font-medium px-2 py-0.5 rounded border border-indigo-500/20 truncate max-w-[120px]">
//                           By {product.vendors.name}
//                         </span>
//                       )}
//                     </div>
//                     <div className="flex justify-between items-start mb-1">
//                       <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
//                         {product.name}
//                       </h3>
//                       <p className="font-semibold text-white whitespace-nowrap ml-2">
//                         ₹{product.price}
//                       </p>
//                     </div>
//                     <div className="flex items-center text-sm text-slate-500">
//                       <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 mr-1" />
//                       <span>{product.rating || 4.5} <span className="text-slate-400">({product.reviews || 10})</span></span>
//                     </div>
//                   </div>
//                 </Link>
//               </motion.div>
//             ))}
//           </motion.div>
//         </AnimatePresence>
//       )}
//     </motion.div>
//   );
// };

// export default ProductListing;


import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Filter, Star, Store } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
};

const ProductListing = () => {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(location.state?.category || 'All');
  const [searchQuery, setSearchQuery] = useState(location.state?.search || '');
  const [showAllCategories, setShowAllCategories] = useState(false);

  // Fetch categories from DB
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from('categories').select('*');
      if (!error && data) setCategories(data);
    };
    fetchCategories();
  }, []);

  // Re-read category and search from nav state
  useEffect(() => {
    if (location.state?.category) setActiveCategory(location.state.category);
    setSearchQuery(location.state?.search || '');
  }, [location.state]);

  // Fetch products with vendor info
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('products')
          .select('*, categories(category_name), inventory(stock_quantity), vendors(name)');

        if (activeCategory !== 'All') {
          const cat = categories.find(c => c.category_name === activeCategory);
          if (cat) query = query.eq('category_id', cat.category_id);
          else { setProducts([]); setLoading(false); return; }
        }

        if (searchQuery) {
          query = query.ilike('name', `%${searchQuery}%`);
        }

        const { data, error } = await query;
        if (!error && data) {
          setProducts(data.map(p => ({ ...p, stock_quantity: p.inventory?.[0]?.stock_quantity ?? 0 })));
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
      }
      setLoading(false);
    };

    if (activeCategory === 'All' || categories.length > 0) fetchProducts();
  }, [activeCategory, categories, searchQuery]);

  const displayCategories = ['All', ...categories.map(c => c.category_name)];
  const visibleCategories = showAllCategories ? displayCategories : displayCategories.slice(0, 6);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Our Collection</h1>
          <p className="text-slate-400 mt-2">
            {loading ? 'Loading...' : `Explore ${products.length} meticulously crafted items.`}
          </p>
        </div>

        {/* Desktop category filter */}
        <div className="hidden md:flex items-center mt-6 md:mt-0 bg-slate-900 p-1 rounded-full shadow-sm border border-slate-800 flex-wrap gap-1">
          {visibleCategories.map(cat => (
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === cat ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'
                }`}>
              {cat}
            </motion.button>
          ))}
          {displayCategories.length > 6 && (
            <button onClick={() => setShowAllCategories(!showAllCategories)}
              className="px-4 py-2 text-slate-400 hover:text-white flex items-center transition-colors text-sm">
              <Filter className="w-4 h-4 mr-1" />
              {showAllCategories ? 'Less' : 'More'}
            </button>
          )}
        </div>
      </div>

      {/* Mobile category pills */}
      <div className="md:hidden flex overflow-x-auto space-x-2 pb-4 mb-6">
        {displayCategories.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors border ${activeCategory === cat ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
            <div key={n} className="animate-pulse">
              <div className="bg-slate-800 w-full aspect-square rounded-2xl mb-4"></div>
              <div className="bg-slate-800 h-5 w-3/4 rounded mb-2"></div>
              <div className="bg-slate-800 h-4 w-1/4 rounded"></div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-24 text-slate-500">
          <p className="text-lg font-semibold text-white mb-2">No products found</p>
          <p className="text-sm">Try selecting a different category.</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div key={activeCategory} variants={containerVariants} initial="hidden" animate="show" exit="hidden"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {products.map(product => (
              <motion.div key={product.product_id} variants={itemVariants}>
                <Link to={`/product/${product.product_id}`}
                  className="group relative block p-4 bg-slate-900/50 backdrop-blur-md rounded-3xl border border-slate-800 hover:bg-slate-800 transition-colors shadow-lg h-full flex flex-col"
                >
                  <div className="w-full aspect-square bg-slate-800/80 rounded-2xl overflow-hidden mb-4 relative z-0">
                    <img
                      src={product.image_url || 'https://via.placeholder.com/300'}
                      alt={product.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                    {product.stock_quantity === 0 && (
                      <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        Sold Out
                      </div>
                    )}
                    <div className="absolute inset-x-4 bottom-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-full bg-indigo-600/90 backdrop-blur text-white text-sm font-semibold py-2.5 rounded-xl shadow-lg text-center border border-indigo-500/50">
                        Quick View
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col flex-1">
                    <span className="text-xs text-slate-500 uppercase tracking-wider mb-1 block">
                      {product.categories?.category_name || ''}
                    </span>
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1 flex-1">
                        {product.name}
                      </h3>
                      <p className="font-semibold text-white whitespace-nowrap ml-2">₹{product.price}</p>
                    </div>

                    {/* ✅ Vendor name */}
                    {product.vendors?.name && (
                      <div className="flex items-center gap-1 mb-1">
                        <Store className="w-3 h-3 text-indigo-400" />
                        <span className="text-xs text-indigo-400">{product.vendors.name}</span>
                      </div>
                    )}

                    <div className="flex items-center text-sm text-slate-500 mt-auto">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 mr-1" />
                      <span>{product.rating || 4.5} <span className="text-slate-400">({product.reviews || 10})</span></span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  );
};

export default ProductListing;
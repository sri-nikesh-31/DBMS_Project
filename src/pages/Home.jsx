// // import { Link } from 'react-router-dom';
// // import { ArrowRight, Star, Truck, Shield, CreditCard, Clock } from 'lucide-react';
// // import { motion } from 'framer-motion';
// // // import { products } from '../mockData/products';

// // const containerVariants = {
// //   hidden: { opacity: 0 },
// //   show: {
// //     opacity: 1,
// //     transition: { staggerChildren: 0.1 }
// //   }
// // };

// // const itemVariants = {
// //   hidden: { opacity: 0, y: 20 },
// //   show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
// // };

// // const Home = () => {
// //   const furnitureProducts = products.filter(p => p.category === 'Furniture').slice(0, 4);
// //   const decorProducts = products.filter(p => p.category === 'Decor' || p.category === 'Lighting' || p.category === 'Textiles').slice(0, 4);
// import { Link } from 'react-router-dom';
// import { ArrowRight, Star, Truck, Shield, CreditCard, Clock } from 'lucide-react';
// import { motion } from 'framer-motion';
// import { useState, useEffect } from 'react';
// import { supabase } from '../supabaseClient'; // adjust path if needed

// const containerVariants = {
//   hidden: { opacity: 0 },
//   show: {
//     opacity: 1,
//     transition: { staggerChildren: 0.1 }
//   }
// };

// const itemVariants = {
//   hidden: { opacity: 0, y: 20 },
//   show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
// };

// const Home = () => {
//   const [products, setProducts] = useState([]);

//   useEffect(() => {
//     const fetchProducts = async () => {
//       const { data, error } = await supabase
//         .from('products')
//         .select('*, categories(category_name)');
//       if (!error && data) setProducts(data);
//     };
//     fetchProducts();
//   }, []);

//   const furnitureProducts = products.filter(p => p.category === 'Furniture').slice(0, 4);
//   const decorProducts = products.filter(p => p.category === 'Decor' || p.category === 'Lighting' || p.category === 'Textiles').slice(0, 4);

//   // rest of your return JSX stays exactly the same...
//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       transition={{ duration: 0.5 }}
//       className="flex flex-col font-sans"
//     >

//       {/* Hero Section - Split Layout */}
//       <section className="bg-slate-900 flex flex-col md:flex-row min-h-[600px]">
//         <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-16">
//           <span className="text-indigo-400 font-semibold tracking-widest uppercase text-xs mb-6">New Collection 2026</span>
//           <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6 leading-tight">
//             Curate your <br /><span className="italic text-indigo-400">dream space.</span>
//           </h1>
//           <p className="text-lg text-slate-400 max-w-md mb-10 font-light leading-relaxed">
//             Discover our new collection of minimalist furniture and artisanal decor. Thoughtfully designed to elevate your everyday living.
//           </p>
//           <div>
//             <motion.div whileHover={{ y: -5 }} className="inline-block">
//               <Link to="/products" className="inline-flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 text-sm font-semibold tracking-wider uppercase transition-colors shadow-lg shadow-indigo-500/20 hover:shadow-xl">
//                 Shop the Collection
//                 <ArrowRight className="w-4 h-4" />
//               </Link>
//             </motion.div>
//           </div>
//         </div>
//         <div className="flex-1 relative min-h-[400px] md:min-h-auto">
//           <img
//             src="https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80"
//             alt="Minimalist Living Room"
//             className="absolute inset-0 w-full h-full object-cover"
//           />
//         </div>
//       </section>

//       {/* Visual Categories Navigation */}
//       <section className="py-16 bg-slate-950 border-b border-slate-900">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <h2 className="text-2xl font-serif font-bold text-white mb-10 text-center">Shop by Category</h2>
//           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
//             {[
//               { name: 'Furniture', img: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
//               { name: 'Lighting', img: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
//               { name: 'Decor', img: 'https://images.unsplash.com/photo-1582582621959-48d27397dc69?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
//               { name: 'Textiles', img: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
//               { name: 'Art', img: 'https://images.unsplash.com/photo-1544445385-d602324dc865?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
//               { name: 'Outdoor', img: 'https://images.unsplash.com/photo-1499933374294-4584851497cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
//             ].map((cat) => (
//               <Link to="/products" key={cat.name} className="group flex flex-col items-center">
//                 <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden mb-4 border border-slate-800 group-hover:border-indigo-500 transition-colors p-1">
//                   <div className="w-full h-full rounded-full overflow-hidden">
//                     <img src={cat.img} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
//                   </div>
//                 </div>
//                 <span className="font-medium text-slate-300 group-hover:text-indigo-400 transition-colors text-sm">{cat.name}</span>
//               </Link>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Product Ribbon - Trending Furniture */}
//       <section className="py-20 bg-slate-900">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-end mb-10 border-b border-slate-800 pb-4">
//             <h2 className="text-3xl font-serif font-bold text-white">Trending Furniture</h2>
//             <Link to="/products" className="text-indigo-400 text-sm font-bold tracking-wider uppercase flex items-center hover:text-indigo-300 transition-colors">
//               See All <ArrowRight className="w-4 h-4 ml-2" />
//             </Link>
//           </div>

//           <motion.div
//             variants={containerVariants}
//             initial="hidden"
//             whileInView="show"
//             viewport={{ once: true, margin: "-100px" }}
//             className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
//           >
//             {furnitureProducts.map((product) => (
//               <motion.div key={product.product_id} variants={itemVariants}>
//                 <Link
//                   to={`/product/${product.product_id}`}
//                   className="group flex flex-col p-4 bg-slate-900/50 backdrop-blur-md rounded-3xl border border-slate-800 hover:bg-slate-800 transition-colors shadow-lg"
//                 >

//                   {/* IMAGE (use placeholder if not in DB) */}
//                   <div className="w-full aspect-square bg-slate-800/80 rounded-2xl overflow-hidden mb-6 relative z-0">
//                     <img
//                       src={product.image || "https://via.placeholder.com/300"}
//                       alt={product.name}
//                       className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
//                     />

//                     {/* OPTIONAL STOCK BADGE */}
//                     {product.stock_quantity === 0 && (
//                       <div className="absolute top-2 left-2 bg-slate-950/80 text-white text-xs font-bold px-2 py-1 uppercase tracking-wider backdrop-blur-md">
//                         Out of Stock
//                       </div>
//                     )}
//                   </div>

//                   {/* DETAILS */}
//                   <div className="flex flex-col flex-1">

//                     {/* CATEGORY NAME */}
//                     <span className="text-xs text-slate-500 uppercase tracking-wider mb-1">
//                       {product.categories?.category_name || "Category"}
//                     </span>

//                     <h3 className="text-base font-semibold text-white mb-2 group-hover:text-indigo-400 transition-colors line-clamp-2">
//                       {product.name}
//                     </h3>

//                     <div className="mt-auto flex items-center justify-between">

//                       {/* PRICE */}
//                       <p className="font-serif font-bold text-lg text-white">
//                         ₹{product.price}
//                       </p>

//                       {/* OPTIONAL RATING (fallback) */}
//                       <div className="flex items-center text-xs text-slate-500">
//                         <Star className="w-3 h-3 text-amber-500 fill-amber-500 mr-1" />
//                         <span>{product.rating || "4.5"}</span>
//                       </div>

//                     </div>
//                   </div>
//                 </Link>
//               </motion.div>
//             ))}
//           </motion.div>
//         </div>
//       </section>

//       {/* Promotional Banner Row */}
//       <section className="bg-indigo-900 text-white py-16 border-y border-indigo-800">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
//             <div>
//               <h2 className="font-serif text-3xl md:text-5xl font-bold mb-4">Designer Trade Program</h2>
//               <p className="text-indigo-200 mb-8 max-w-md font-light">Exclusive pricing and dedicated support for interior designers, architects, and home builders.</p>
//               <button className="bg-white text-indigo-900 px-6 py-3 font-semibold uppercase tracking-wider text-sm hover:bg-indigo-100 transition-colors">
//                 Apply Now
//               </button>
//             </div>
//             <div className="h-[300px] bg-primary-800 rounded-lg overflow-hidden relative">
//               <img src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="Interior Design" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60" />
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Product Ribbon - Decor & Accents */}
//       <section className="py-20 bg-slate-950">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-end mb-10 border-b border-slate-900 pb-4">
//             <h2 className="text-3xl font-serif font-bold text-white">Decor & Accents</h2>
//             <Link to="/products" className="text-indigo-400 text-sm font-bold tracking-wider uppercase flex items-center hover:text-indigo-300 transition-colors">
//               See All <ArrowRight className="w-4 h-4 ml-2" />
//             </Link>
//           </div>

//           <motion.div
//             variants={containerVariants}
//             initial="hidden"
//             whileInView="show"
//             viewport={{ once: true, margin: "-100px" }}
//             className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
//           >
//             {decorProducts.map((product) => (
//               <motion.div key={product.product_id} variants={itemVariants}>
//                 <Link
//                   to={`/product/${product.product_id}`}
//                   className="group flex flex-col h-full p-4 bg-slate-900/50 backdrop-blur-md rounded-3xl border border-slate-800 hover:bg-slate-800 transition-colors shadow-lg"
//                 >

//                   {/* IMAGE */}
//                   <div className="w-full aspect-[4/5] bg-slate-800/80 rounded-2xl overflow-hidden mb-4 relative z-0">
//                     <img
//                       src={product.image_url || "https://via.placeholder.com/300"}
//                       alt={product.name}
//                       className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
//                     />
//                   </div>

//                   {/* DETAILS */}
//                   <div>
//                     <h3 className="text-sm font-semibold text-white mb-1 group-hover:text-indigo-400 transition-colors">
//                       {product.name}
//                     </h3>

//                     <p className="text-slate-400 text-sm mb-2">
//                       ₹{product.price}
//                     </p>
//                   </div>

//                 </Link>
//               </motion.div>
//             ))}
//           </motion.div>
//         </div>
//       </section>

//       {/* Value Proposition */}
//       <section className="py-16 bg-slate-900">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center divide-x divide-slate-800 border-y border-slate-800 py-10">
//             <div className="px-4 flex flex-col items-center">
//               <Truck className="w-8 h-8 text-indigo-500 mb-4" />
//               <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-2">Free Delivery</h3>
//               <p className="text-slate-400 text-xs">On orders over $200</p>
//             </div>
//             <div className="px-4 flex flex-col items-center">
//               <Shield className="w-8 h-8 text-indigo-500 mb-4" />
//               <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-2">10-Year Warranty</h3>
//               <p className="text-slate-400 text-xs">On all furniture items</p>
//             </div>
//             <div className="px-4 flex flex-col items-center">
//               <Clock className="w-8 h-8 text-indigo-500 mb-4" />
//               <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-2">30-Day Returns</h3>
//               <p className="text-slate-400 text-xs">Hassle-free return policy</p>
//             </div>
//             <div className="px-4 flex flex-col items-center">
//               <CreditCard className="w-8 h-8 text-indigo-500 mb-4" />
//               <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-2">Secure Payment</h3>
//               <p className="text-slate-400 text-xs">100% secure checkout</p>
//             </div>
//           </div>
//         </div>
//       </section>

//     </motion.div>
//   );
// };

// export default Home;
// console.log(import.meta.env.VITE_SUPABASE_URL)

import { Link } from 'react-router-dom';
import { ArrowRight, Star, Truck, Shield, CreditCard, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: pData, error: pError } = await supabase
        .from('products')
        .select('*, categories(category_name), inventory(stock_quantity)');
      if (!pError && pData) {
        setProducts(pData.map(p => ({
          ...p,
          stock_quantity: p.inventory?.[0]?.stock_quantity ?? 0
        })));
      }

      const { data: cData, error: cError } = await supabase
        .from('categories')
        .select('*')
        .limit(5);
      if (!cError && cData) {
        setCategories(cData);
      }
    };
    fetchData();
  }, []);

  // ✅ Fix: filter by categories.category_name not p.category
  const furnitureProducts = products
    .filter(p => p.categories?.category_name === 'Furniture')
    .slice(0, 4);

  const decorProducts = products
    .filter(p => ['Decor', 'Lighting', 'Textiles'].includes(p.categories?.category_name))
    .slice(0, 4);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col font-sans"
    >

      {/* Hero Section */}
      <section className="bg-slate-900 flex flex-col md:flex-row min-h-[600px]">
        <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-16">
          <span className="text-indigo-400 font-semibold tracking-widest uppercase text-xs mb-6">New Collection 2026</span>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6 leading-tight">
            Curate your <br /><span className="italic text-indigo-400">dream space.</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-md mb-10 font-light leading-relaxed">
            Discover our new collection of minimalist furniture and artisanal decor. Thoughtfully designed to elevate your everyday living.
          </p>
          <div className="flex flex-wrap gap-4">
            <motion.div whileHover={{ y: -5 }} className="inline-block">
              <Link to="/products" className="inline-flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 text-sm font-semibold tracking-wider uppercase transition-colors shadow-lg shadow-indigo-500/20 hover:shadow-xl">
                Shop the Collection
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ y: -5 }} className="inline-block">
              <Link to="/orders" className="inline-flex items-center justify-center gap-3 border border-slate-700 hover:border-indigo-500 text-slate-300 hover:text-white px-8 py-4 text-sm font-semibold tracking-wider uppercase transition-colors">
                My Orders
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>
        <div className="flex-1 relative min-h-[400px] md:min-h-auto">
          <img
            src="https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80"
            alt="Minimalist Living Room"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      </section>

      {/* Visual Categories Navigation */}
      <section className="py-16 bg-slate-950 border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-serif font-bold text-white mb-10 text-center">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 justify-center">
            {categories.map((cat) => (
              <Link
                to="/products"
                state={{ category: cat.category_name }}
                key={cat.category_id}
                className="group flex flex-col items-center mx-auto"
              >
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden mb-4 border border-slate-800 group-hover:border-indigo-500 transition-colors p-1">
                  <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-slate-900">
                    <img 
                      src={cat.image_url || 'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=400&q=80'} 
                      alt={cat.category_name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                  </div>
                </div>
                <span className="font-medium text-slate-300 group-hover:text-indigo-400 transition-colors text-sm text-center">{cat.category_name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Furniture */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10 border-b border-slate-800 pb-4">
            <h2 className="text-3xl font-serif font-bold text-white">Trending Furniture</h2>
            <Link to="/products" state={{ category: 'Furniture' }} className="text-indigo-400 text-sm font-bold tracking-wider uppercase flex items-center hover:text-indigo-300 transition-colors">
              See All <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>

          {furnitureProducts.length === 0 ? (
            <p className="text-slate-500 text-center py-12">No furniture products found.</p>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {furnitureProducts.map((product) => (
                <motion.div key={product.product_id} variants={itemVariants}>
                  <Link
                    to={`/product/${product.product_id}`}
                    className="group flex flex-col p-4 bg-slate-900/50 backdrop-blur-md rounded-3xl border border-slate-800 hover:bg-slate-800 transition-colors shadow-lg"
                  >
                    <div className="w-full aspect-square bg-slate-800/80 rounded-2xl overflow-hidden mb-6 relative z-0">
                      <img
                        src={product.image_url || "https://via.placeholder.com/300"}
                        alt={product.name}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      {product.stock_quantity === 0 && (
                        <div className="absolute top-2 left-2 bg-slate-950/80 text-white text-xs font-bold px-2 py-1 uppercase tracking-wider backdrop-blur-md">
                          Out of Stock
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col flex-1">
                      <span className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                        {product.categories?.category_name || "Category"}
                      </span>
                      <h3 className="text-base font-semibold text-white mb-2 group-hover:text-indigo-400 transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                      <div className="mt-auto flex items-center justify-between">
                        <p className="font-serif font-bold text-lg text-white">₹{product.price}</p>
                        <div className="flex items-center text-xs text-slate-500">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500 mr-1" />
                          <span>{product.rating || "4.5"}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Promotional Banner */}
      <section className="bg-indigo-900 text-white py-16 border-y border-indigo-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="font-serif text-3xl md:text-5xl font-bold mb-4">Designer Trade Program</h2>
              <p className="text-indigo-200 mb-8 max-w-md font-light">Exclusive pricing and dedicated support for interior designers, architects, and home builders.</p>
              <Link to="https://www.iiti.ac.in/" target="_blank" rel="noopener noreferrer" className="inline-block bg-white text-indigo-900 px-6 py-3 font-semibold uppercase tracking-wider text-sm hover:bg-indigo-100 transition-colors">
                Apply Now
              </Link>
            </div>
            <div className="h-[300px] rounded-lg overflow-hidden relative">
              <img src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="Interior Design" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60" />
            </div>
          </div>
        </div>
      </section>

      {/* Decor & Accents */}
      <section className="py-20 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10 border-b border-slate-900 pb-4">
            <h2 className="text-3xl font-serif font-bold text-white">Decor & Accents</h2>
            <Link to="/products" state={{ category: 'Decor' }} className="text-indigo-400 text-sm font-bold tracking-wider uppercase flex items-center hover:text-indigo-300 transition-colors">
              See All <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>

          {decorProducts.length === 0 ? (
            <p className="text-slate-500 text-center py-12">No decor products found.</p>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {decorProducts.map((product) => (
                <motion.div key={product.product_id} variants={itemVariants}>
                  <Link
                    to={`/product/${product.product_id}`}
                    className="group flex flex-col h-full p-4 bg-slate-900/50 backdrop-blur-md rounded-3xl border border-slate-800 hover:bg-slate-800 transition-colors shadow-lg"
                  >
                    <div className="w-full aspect-[4/5] bg-slate-800/80 rounded-2xl overflow-hidden mb-4 relative z-0">
                      <img
                        src={product.image_url || "https://via.placeholder.com/300"}
                        alt={product.name}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 uppercase tracking-wider mb-1 block">
                        {product.categories?.category_name || "Category"}
                      </span>
                      <h3 className="text-sm font-semibold text-white mb-1 group-hover:text-indigo-400 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-slate-400 text-sm">₹{product.price}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-16 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center divide-x divide-slate-800 border-y border-slate-800 py-10">
            <div className="px-4 flex flex-col items-center">
              <Truck className="w-8 h-8 text-indigo-500 mb-4" />
              <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-2">Free Delivery</h3>
              <p className="text-slate-400 text-xs">On orders over ₹15,000</p>
            </div>
            <div className="px-4 flex flex-col items-center">
              <Shield className="w-8 h-8 text-indigo-500 mb-4" />
              <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-2">10-Year Warranty</h3>
              <p className="text-slate-400 text-xs">On all furniture items</p>
            </div>
            <div className="px-4 flex flex-col items-center">
              <Clock className="w-8 h-8 text-indigo-500 mb-4" />
              <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-2">30-Day Returns</h3>
              <p className="text-slate-400 text-xs">Hassle-free return policy</p>
            </div>
            <div className="px-4 flex flex-col items-center">
              <CreditCard className="w-8 h-8 text-indigo-500 mb-4" />
              <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-2">Secure Payment</h3>
              <p className="text-slate-400 text-xs">100% secure checkout</p>
            </div>
          </div>
        </div>
      </section>

    </motion.div>
  );
};

export default Home;
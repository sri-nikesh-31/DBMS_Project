import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useWishlist } from '../hooks/useWishlist';
import { Heart, ArrowLeft, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';

const Wishlist = () => {
  const navigate = useNavigate();
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      if (wishlist.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        // Fetch products one by one, or we can get all and filter
        // Getting all is okay if the DB is small, or we can use Promise.all
        const fetchedProducts = await Promise.all(
          wishlist.map(id => api.products.getById(id).catch(() => null))
        );
        
        // Filter out any nulls incase a product was deleted
        setProducts(fetchedProducts.filter(p => p !== null));
      } catch (err) {
        console.error("Error fetching wishlist products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistProducts();
  }, [wishlist]);

  const handleAddToCart = (product) => {
    addToCart(product, 1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button 
        onClick={() => navigate(-1)} 
        className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-white mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Continue Shopping
      </button>

      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white tracking-tight flex items-center">
          <Heart className="w-8 h-8 mr-4 text-rose-500 fill-rose-500" /> 
          Your Wishlist
        </h1>
        <p className="text-slate-400 mt-2">Saved items that you have your eye on.</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <Loader2 className="w-10 h-10 animate-spin mb-4 text-indigo-500" />
          <p>Loading your favorite items...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center">
          <Heart className="w-16 h-16 mx-auto text-slate-700 mb-6" />
          <h2 className="text-2xl font-bold text-white mb-3">Your wishlist is currently empty!</h2>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
            You haven't saved any items yet. Find something you love and click the heart icon to save it for later.
          </p>
          <Link 
            to="/products"
            className="inline-flex items-center bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-xl transition-colors"
          >
            Explore Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(product => (
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              key={product.product_id}
              className="group flex flex-col bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 relative"
            >
              <button
                onClick={() => toggleWishlist(product.product_id)}
                className="absolute top-4 right-4 w-10 h-10 bg-slate-900/80 backdrop-blur rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform z-10"
              >
                <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
              </button>

              <Link to={`/product/${product.product_id}`} className="aspect-[4/5] bg-slate-800 overflow-hidden relative block">
                <img 
                  src={product.image_url || "https://via.placeholder.com/300"} 
                  alt={product.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                {!product.stock_quantity && (
                  <div className="absolute top-4 left-4 bg-red-500/90 text-white text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider backdrop-blur-sm">Sold Out</div>
                )}
              </Link>

              <div className="p-5 flex flex-col flex-1 relative bg-slate-900">
                {product.vendors?.name && (
                   <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 mb-1">
                     By {product.vendors.name}
                   </div>
                )}
                <Link to={`/product/${product.product_id}`} className="font-bold text-white text-lg line-clamp-1 mb-2 hover:text-indigo-400 transition-colors">
                  {product.name}
                </Link>
                <div className="flex items-center justify-between mt-auto mb-4">
                  <span className="font-black text-white text-xl">₹{(product.price || 0).toFixed(2)}</span>
                </div>
                
                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={!product.stock_quantity}
                  className={`w-full py-3 rounded-xl font-bold flex items-center justify-center transition-colors text-sm ${
                    product.stock_quantity 
                      ? 'bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20' 
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {product.stock_quantity ? 'Add to Cart' : 'Out of Stock'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;

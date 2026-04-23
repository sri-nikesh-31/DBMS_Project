import { Link } from 'react-router-dom';
import { useState } from 'react';

const Footer = () => {
  const [subscribed, setSubscribed] = useState(false);

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-900 pt-16 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="text-2xl font-bold text-white tracking-tighter mb-4 inline-block">
              Aura<span className="text-indigo-500">.</span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Curated essentials for the modern lifestyle. Minimalist design meeting premium quality.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/products" state={{ category: 'All' }} className="hover:text-indigo-400 transition-colors">All Products</Link></li>
              <li><Link to="/products" state={{ category: 'Furniture' }} className="hover:text-indigo-400 transition-colors">New Arrivals</Link></li>
              <li><Link to="/products" state={{ category: 'Decor' }} className="hover:text-indigo-400 transition-colors">Best Sellers</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/support" className="hover:text-indigo-400 transition-colors">FAQ</Link></li>
              <li><Link to="/support" className="hover:text-indigo-400 transition-colors">Shipping & Returns</Link></li>
              <li><Link to="/support" className="hover:text-indigo-400 transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Newsletter</h4>
            <p className="text-sm text-slate-400 mb-4">Subscribe to receive updates, access to exclusive deals, and more.</p>
            <div className="flex gap-2">
              <input type="email" placeholder="Enter your email" className="bg-slate-900 border border-slate-800 text-sm rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-white" />
              <button 
                onClick={() => setSubscribed(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-500 transition-colors whitespace-nowrap"
              >
                {subscribed ? 'Subscribed!' : 'Subscribe'}
              </button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-slate-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">© 2026 Aura. All rights reserved.</p>
          <div className="flex space-x-4 text-sm text-slate-500">
            <Link to="/support" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
            <Link to="/support" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

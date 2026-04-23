import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Search, Menu, X, AlignLeft, LogOut, Heart, Package, LayoutDashboard, Home, Store, Bell, CheckCircle2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useUser } from '../../context/UserContext';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../supabaseClient';
import { api } from '../../services/api';

const Navbar = () => {
  const { cartCount } = useCart();
  const { user, logout } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isVendor, setIsVendor] = useState(false);
  
  // Notification states
  const [notifications, setNotifications] = useState([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notifRef = useRef(null);
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const navigate = useNavigate();
  const location = useLocation();

  // Close notifications panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) setIsNotificationsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (user?.id) {
      const data = await api.notifications.getByUser(user.id);
      setNotifications(data);
    }
  };

  useEffect(() => {
    fetchNotifications();
    if (!user) setNotifications([]);
  }, [user]);

  const handleMarkAllRead = async () => {
    if (!user) return;
    await api.notifications.markAllAsRead(user.id);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  // Fetch DB categories
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from('categories').select('category_id, category_name');
      if (!error && data) setCategories(data);
    };
    fetchCategories();
  }, []);

  // Check admin + vendor roles from DB
  useEffect(() => {
    if (!user) { setIsAdmin(false); setIsVendor(false); return; }
    const checkRoles = async () => {
      const [{ data: profile }, { data: vendor }] = await Promise.all([
        supabase.from('profiles').select('is_admin').eq('id', user.id).single(),
        supabase.from('vendors').select('status').eq('user_id', user.id).single(),
      ]);
      setIsAdmin(profile?.is_admin === true);
      setIsVendor(vendor?.status === 'approved');
    };
    checkRoles();
  }, [user]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate('/products', { state: { search: searchTerm } });
    } else {
      navigate('/products');
    }
  };

  const handleCategory = (category) => {
    navigate('/products', { state: { category } });
    setIsMenuOpen(false);
  };

  // Reusable desktop icon nav item
  const NavIcon = ({ to, icon: Icon, label, activeColor = 'text-indigo-400', defaultColor = 'text-slate-400' }) => {
    const active = isActive(to);
    return (
      <Link
        to={to}
        className={`relative flex flex-col items-center transition-colors group ${active ? activeColor : defaultColor} hover:${activeColor}`}
      >
        <motion.div whileHover={{ y: -2 }} className="flex flex-col items-center">
          <Icon className={`w-5 h-5 mb-1 transition-colors ${active ? activeColor : ''}`} />
          <span className={`text-[11px] font-medium uppercase tracking-wider ${active ? 'font-bold' : ''}`}>{label}</span>
        </motion.div>
        {/* Animated active underline bar */}
        {active && (
          <motion.span
            layoutId="nav-active-bar"
            className="absolute -bottom-[22px] left-0 right-0 h-[2px] rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        )}
      </Link>
    );
  };

  // Reusable sub-nav link
  const SubNavLink = ({ to, children, icon: Icon }) => {
    const active = isActive(to);
    return (
      <Link
        to={to}
        className={`relative hover:text-white transition-colors whitespace-nowrap pb-1 flex items-center gap-1 ${
          active ? 'text-indigo-400 font-semibold' : 'text-slate-400'
        }`}
      >
        {Icon && <Icon className="w-3.5 h-3.5" />} {children}
        {active && (
          <motion.span
            layoutId="subnav-active-bar"
            className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.7)]"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          />
        )}
      </Link>
    );
  };

  // Mobile nav button with active state
  const MobileNavBtn = ({ path, onClick, children, colorClass = 'text-slate-300' }) => {
    const active = isActive(path);
    return (
      <button
        onClick={() => { onClick(); setIsMenuOpen(false); }}
        className={`block w-full text-left px-3 py-2 rounded-md font-medium transition-colors ${
          active
            ? 'bg-indigo-900/40 text-indigo-300 border-l-2 border-indigo-500'
            : `${colorClass} hover:bg-slate-800`
        }`}
      >
        {children}
      </button>
    );
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-800 shadow-sm"
    >
      {/* Top Banner */}
      <div className="bg-indigo-600 text-white text-xs text-center py-2 font-medium tracking-wide font-sans">
        Complimentary shipping on all orders over ₹15,000
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between h-auto md:h-20 items-center py-4 md:py-0 gap-4 md:gap-8">

          {/* Logo & Mobile Toggle */}
          <div className="flex justify-between w-full md:w-auto items-center">
            <Link to="/" className="text-3xl font-serif font-bold text-white tracking-tight flex items-center gap-1">
              Aura<span className="text-indigo-500 text-4xl leading-none">.</span>
            </Link>
            <div className="md:hidden flex items-center space-x-4">
              <Link to="/cart" className="text-slate-300 relative">
                <ShoppingBag className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-indigo-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-slate-300">
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="w-full md:flex-1 max-w-2xl hidden md:block">
            <form onSubmit={handleSearch} className="relative flex w-full">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search furniture, decor, lighting..."
                className="w-full bg-slate-900 border border-slate-800 rounded-l-md py-2.5 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-sans transition-all text-white placeholder:text-slate-500"
              />
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 rounded-r-md transition-colors flex items-center justify-center">
                <Search className="w-5 h-5" />
              </button>
            </form>
          </div>

          {/* Desktop Right Icons */}
          <div className="hidden md:flex items-center space-x-6 font-sans">
            <NavIcon to="/" icon={Home} label="Home" />

            {user ? (
              <>
                {/* Account */}
                <NavIcon to="/profile" icon={User} label={user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'Account'} />

                {/* Orders */}
                <NavIcon to="/orders" icon={Package} label="Orders" />

                {/* Wishlist */}
                <NavIcon to="/wishlist" icon={Heart} label="Wishlist" />

                {/* Admin */}
                {isAdmin && (
                  <NavIcon to="/admin" icon={LayoutDashboard} label="Admin" activeColor="text-amber-300" defaultColor="text-amber-400" />
                )}

                {/* Vendor */}
                {isVendor && (
                  <NavIcon to="/vendor-dashboard" icon={Store} label="Vendor" activeColor="text-emerald-300" defaultColor="text-emerald-400" />
                )}

                {/* Sign Out */}
                <button
                  onClick={() => { if (window.confirm('Are you sure you want to sign out?')) { logout(); navigate('/'); } }}
                  className="flex flex-col items-center text-slate-400 hover:text-red-500 transition-colors group"
                >
                  <motion.div whileHover={{ y: -3 }} className="flex flex-col items-center">
                    <LogOut className="w-5 h-5 mb-1 group-hover:text-red-500 transition-colors" />
                    <span className="text-[11px] font-medium uppercase tracking-wider">Sign Out</span>
                  </motion.div>
                </button>
              </>
            ) : (
              <NavIcon to="/login" icon={User} label="Sign In" />
            )}

            {/* Notifications Dropdown */}
            {user && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className={`relative flex flex-col items-center transition-colors group ${isNotificationsOpen ? 'text-indigo-400' : 'text-slate-400'} hover:text-indigo-400 outline-none`}
                >
                  <motion.div whileHover={{ y: -3 }} className="flex flex-col items-center">
                    <div className="relative">
                      <Bell className="w-5 h-5 mb-1 group-hover:text-indigo-400 transition-colors" />
                      {unreadCount > 0 && (
                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                          className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center p-0 m-0 leading-none shadow-sm border-[2px] border-slate-950">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </motion.span>
                      )}
                    </div>
                    <span className={`text-[11px] font-medium uppercase tracking-wider ${isNotificationsOpen ? 'font-bold' : ''}`}>Alerts</span>
                  </motion.div>
                </button>

                {/* Notifications Panel */}
                <AnimatePresence>
                  {isNotificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-[220%] mt-2 w-[340px] bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden z-50 origin-top-right flex flex-col"
                    >
                      <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-950/50">
                        <h3 className="text-white font-bold text-sm">Notifications</h3>
                        {unreadCount > 0 && (
                          <button onClick={handleMarkAllRead} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-[360px] overflow-y-auto no-scrollbar">
                        {notifications.length === 0 ? (
                          <div className="py-8 text-center text-slate-500 text-sm">No notifications yet.</div>
                        ) : (
                          notifications.map((notif) => (
                            <div 
                              key={notif.id} 
                              onClick={async () => {
                                if (!notif.is_read) {
                                  await api.notifications.markAsRead(notif.id);
                                  setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
                                }
                              }}
                              className={`p-4 border-b border-slate-800/50 last:border-0 hover:bg-slate-800/30 transition-colors cursor-pointer ${!notif.is_read ? 'bg-indigo-900/10' : ''}`}
                            >
                              <div className="flex gap-3">
                                <div className="mt-0.5 mt-1 flex-shrink-0">
                                  {!notif.is_read ? (
                                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                                  ) : (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-600" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className={`text-sm truncate ${!notif.is_read ? 'text-white font-bold' : 'text-slate-300 font-semibold'}`}>{notif.title}</h4>
                                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{notif.message}</p>
                                  <p className="text-[10px] text-slate-500 mt-2 font-medium">{new Date(notif.created_at).toLocaleString()}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Cart — always shown */}
            <Link to="/cart" className={`relative flex flex-col items-center transition-colors group ${isActive('/cart') ? 'text-indigo-400' : 'text-slate-400'} hover:text-indigo-400`}>
              <motion.div whileHover={{ y: -3 }} className="flex flex-col items-center">
                <div className="relative">
                  <ShoppingBag className="w-5 h-5 mb-1 group-hover:text-indigo-400 transition-colors" />
                  {cartCount > 0 && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center p-0 m-0 leading-none shadow-sm">
                      {cartCount}
                    </motion.span>
                  )}
                </div>
                <span className={`text-[11px] font-medium uppercase tracking-wider ${isActive('/cart') ? 'font-bold' : ''}`}>Cart</span>
              </motion.div>
              {isActive('/cart') && (
                <motion.span
                  layoutId="nav-active-bar"
                  className="absolute -bottom-[22px] left-0 right-0 h-[2px] rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                />
              )}
            </Link>
          </div>

        </div>
      </div>

      {/* Sub Category Nav — DB-driven */}
      <div className="hidden md:block border-t border-slate-800 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="flex space-x-6 items-center h-12 text-sm font-medium font-sans overflow-x-auto">
            <li>
              <button onClick={() => handleCategory('All')} className={`relative flex items-center hover:text-white transition-colors whitespace-nowrap pb-1 ${isActive('/products') ? 'text-indigo-400 font-semibold' : 'text-slate-400'}`}>
                <AlignLeft className="w-4 h-4 mr-2" /> All
                {isActive('/products') && (
                  <motion.span
                    layoutId="subnav-active-bar"
                    className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.7)]"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                  />
                )}
              </button>
            </li>
            {categories.map(cat => (
              <li key={cat.category_id}>
                <button onClick={() => handleCategory(cat.category_name)} className="hover:text-white transition-colors whitespace-nowrap text-slate-400">
                  {cat.category_name}
                </button>
              </li>
            ))}
            <li className="ml-auto">
              {/* Show vendor link based on login + status */}
              {user && isVendor ? (
                <SubNavLink to="/vendor-dashboard" icon={Store}>Vendor Dashboard</SubNavLink>
              ) : user && !isVendor ? (
                <SubNavLink to="/become-vendor" icon={Store}>Become a Vendor</SubNavLink>
              ) : null}
            </li>
            <li className="pl-4 border-l border-slate-800">
              <SubNavLink to="/orders">My Orders</SubNavLink>
            </li>
            <li>
              <SubNavLink to="/support">Support</SubNavLink>
            </li>
          </ul>
        </div>
      </div>

      {/* Mobile Nav */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-4 space-y-1 font-sans overflow-hidden"
        >
          <form onSubmit={handleSearch} className="relative flex w-full mb-4">
            <input type="text" placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-l-md py-2 pl-3 pr-10 text-sm focus:outline-none text-white placeholder:text-slate-500" />
            <button type="submit" className="bg-indigo-600 text-white px-4 rounded-r-md">
              <Search className="w-4 h-4" />
            </button>
          </form>

          <MobileNavBtn path="/" onClick={() => navigate('/')}>Home</MobileNavBtn>
          <MobileNavBtn path="/products" onClick={() => handleCategory('All')}>Shop All</MobileNavBtn>

          {categories.map(cat => (
            <button key={cat.category_id} onClick={() => handleCategory(cat.category_name)}
              className="block w-full text-left px-3 py-2 text-slate-300 hover:bg-slate-800 rounded-md font-medium">
              {cat.category_name}
            </button>
          ))}

          <MobileNavBtn path="/orders" onClick={() => navigate('/orders')}>My Orders</MobileNavBtn>
          <MobileNavBtn path="/profile" onClick={() => navigate('/profile')}>My Account</MobileNavBtn>
          <MobileNavBtn path="/wishlist" onClick={() => navigate('/wishlist')}>Wishlist</MobileNavBtn>

          {isAdmin && (
            <MobileNavBtn path="/admin" colorClass="text-amber-400" onClick={() => navigate('/admin')}>Admin Panel</MobileNavBtn>
          )}
          {isVendor && (
            <MobileNavBtn path="/vendor-dashboard" colorClass="text-emerald-400" onClick={() => navigate('/vendor-dashboard')}>Vendor Dashboard</MobileNavBtn>
          )}
          {user && !isVendor && (
            <MobileNavBtn path="/become-vendor" colorClass="text-indigo-400" onClick={() => navigate('/become-vendor')}>Become a Vendor</MobileNavBtn>
          )}

          <MobileNavBtn path="/support" onClick={() => navigate('/support')}>Support</MobileNavBtn>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;
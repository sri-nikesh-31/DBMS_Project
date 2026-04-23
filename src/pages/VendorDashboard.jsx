// import { useState, useEffect, useCallback } from 'react';
// import { useUser } from '../context/UserContext';
// import { useNavigate } from 'react-router-dom';
// import { supabase } from '../supabaseClient';
// import { api } from '../services/api';
// import {
//     Plus, Pencil, PackageX, Package, X, Check, LayoutDashboard,
//     ShoppingBag, Search, Tag, ClipboardList, Eye, Truck, CheckCircle
// } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Link } from 'react-router-dom';

// const Toast = ({ msg }) => (
//     <motion.div
//         initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
//         className="fixed top-6 right-6 z-[100] bg-indigo-600 text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2"
//     >
//         <Check className="w-4 h-4" /> {msg}
//     </motion.div>
// );

// const ProductModal = ({ product, categories, vendor, onClose, onSave }) => {
//     const isEdit = !!product;
//     const [form, setForm] = useState({
//         name: product?.name || '',
//         description: product?.description || '',
//         price: product?.price || '',
//         image_url: product?.image_url || '',
//         category_id: product?.category_id || '',
//         stock_quantity: product?.stock_quantity ?? 10,
//     });
//     const [saving, setSaving] = useState(false);
//     const [error, setError] = useState('');

//     const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setSaving(true); setError('');
//         const payload = {
//             name: form.name, description: form.description,
//             price: parseFloat(form.price), image_url: form.image_url,
//             category_id: parseInt(form.category_id) || null,
//             vendor_id: vendor.vendor_id, // Hardcoded for this vendor
//         };
//         try {
//             if (isEdit) {
//                 const { error: e1 } = await supabase.from('products').update(payload).eq('product_id', product.product_id);
//                 if (e1) throw e1;
//                 const { error: e2 } = await supabase.from('inventory').update({ stock_quantity: parseInt(form.stock_quantity) }).eq('product_id', product.product_id);
//                 if (e2) throw e2;
//             } else {
//                 const { data: np, error: e1 } = await supabase.from('products').insert(payload).select().single();
//                 if (e1) throw e1;
//                 const { error: e2 } = await supabase.from('inventory').insert({ product_id: np.product_id, stock_quantity: parseInt(form.stock_quantity) });
//                 if (e2) throw e2;
//             }
//             onSave();
//         } catch (err) { setError(err.message); }
//         setSaving(false);
//     };

//     return (
//         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
//             className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
//             onClick={(e) => e.target === e.currentTarget && onClose()}
//         >
//             <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
//                 className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-8 relative shadow-2xl max-h-[90vh] overflow-y-auto"
//             >
//                 <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-white bg-slate-800 rounded-full p-1.5">
//                     <X className="w-4 h-4" />
//                 </button>
//                 <h2 className="text-xl font-bold text-white mb-6">{isEdit ? 'Edit Product' : 'Add New Product'}</h2>
//                 <form onSubmit={handleSubmit} className="space-y-4">
//                     {[
//                         { label: 'Product Name', name: 'name', type: 'text', placeholder: 'e.g. Handmade Mug', required: true },
//                         { label: 'Image URL', name: 'image_url', type: 'text', placeholder: 'https://...' },
//                     ].map(f => (
//                         <div key={f.name}>
//                             <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{f.label}</label>
//                             <input name={f.name} type={f.type} required={f.required} value={form[f.name]} onChange={handleChange} placeholder={f.placeholder}
//                                 className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-600" />
//                         </div>
//                     ))}

//                     <div>
//                         <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Description</label>
//                         <textarea name="description" value={form.description} onChange={handleChange} rows={2}
//                             className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none placeholder:text-slate-600"
//                             placeholder="Product description..." />
//                     </div>

//                     <div className="grid grid-cols-2 gap-4">
//                         <div>
//                             <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Price (₹)</label>
//                             <input name="price" type="number" min="0" step="0.01" required value={form.price} onChange={handleChange}
//                                 className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="99.00" />
//                         </div>
//                         <div>
//                             <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Stock</label>
//                             <input name="stock_quantity" type="number" min="0" required value={form.stock_quantity} onChange={handleChange}
//                                 className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="10" />
//                         </div>
//                     </div>

//                     <div>
//                         <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Category</label>
//                         <select name="category_id" value={form.category_id} onChange={handleChange} required
//                             className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500">
//                             <option value="">Select category</option>
//                             {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
//                         </select>
//                     </div>

//                     {form.image_url && (
//                         <img src={form.image_url} alt="preview" className="h-20 w-20 object-cover rounded-xl border border-slate-700 mt-2" />
//                     )}

//                     {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">{error}</p>}

//                     <button type="submit" disabled={saving}
//                         className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white rounded-xl py-3 font-bold transition-all">
//                         {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Product'}
//                     </button>
//                 </form>
//             </motion.div>
//         </motion.div>
//     );
// };

// const VendorProductsTab = ({ categories, vendor, showToast }) => {
//     const [products, setProducts] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [search, setSearch] = useState('');
//     const [modal, setModal] = useState(undefined);

//     const fetchProducts = useCallback(async () => {
//         setLoading(true);
//         const data = await api.products.getByVendor(vendor.vendor_id);
//         setProducts(data || []);
//         setLoading(false);
//     }, [vendor.vendor_id]);

//     useEffect(() => { fetchProducts(); }, [fetchProducts]);

//     const toggleStock = async (product) => {
//         const newQty = product.stock_quantity === 0 ? 10 : 0;
//         await supabase.from('inventory').update({ stock_quantity: newQty }).eq('product_id', product.product_id);
//         setProducts(prev => prev.map(p => p.product_id === product.product_id ? { ...p, stock_quantity: newQty } : p));
//         showToast(newQty === 0 ? `"${product.name}" marked out of stock` : `"${product.name}" restocked`);
//     };

//     const deleteProduct = async (product) => {
//         if (!window.confirm(`Delete "${product.name}"?`)) return;
//         await supabase.from('inventory').delete().eq('product_id', product.product_id);
//         await supabase.from('products').delete().eq('product_id', product.product_id);
//         setProducts(prev => prev.filter(p => p.product_id !== product.product_id));
//         showToast(`"${product.name}" deleted`);
//     };

//     const filtered = products.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()));

//     return (
//         <>
//             <AnimatePresence>
//                 {modal !== undefined && (
//                     <ProductModal product={modal} categories={categories} vendor={vendor}
//                         onClose={() => setModal(undefined)}
//                         onSave={() => { setModal(undefined); fetchProducts(); showToast('Product saved!'); }}
//                     />
//                 )}
//             </AnimatePresence>

//             <div className="flex gap-4 mb-4">
//                 <div className="relative flex-1">
//                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
//                     <input type="text" placeholder="Search your products..." value={search} onChange={e => setSearch(e.target.value)}
//                         className="w-full bg-slate-900 border border-slate-800 text-white text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
//                 </div>
//                 <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
//                     onClick={() => setModal(null)}
//                     className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors">
//                     <Plus className="w-4 h-4" /> Add Product
//                 </motion.button>
//             </div>

//             <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
//                 <div className="overflow-x-auto">
//                     <table className="w-full text-sm">
//                         <thead>
//                             <tr className="border-b border-slate-800 text-xs text-slate-500 uppercase tracking-widest text-left">
//                                 <th className="px-6 py-4">Product</th>
//                                 <th className="px-6 py-4">Category</th>
//                                 <th className="px-6 py-4">Price</th>
//                                 <th className="px-6 py-4">Stock</th>
//                                 <th className="px-6 py-4 text-right">Actions</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {loading ? (
//                                 <tr><td colSpan={5} className="text-center py-12 text-slate-500 animate-pulse">Loading products...</td></tr>
//                             ) : filtered.length === 0 ? (
//                                 <tr><td colSpan={5} className="text-center py-12 text-slate-500">No products found. Add some!</td></tr>
//                             ) : filtered.map(product => (
//                                 <tr key={product.product_id} className="border-b border-slate-800/60 hover:bg-slate-800/30">
//                                     <td className="px-6 py-4">
//                                         <div className="flex items-center gap-3">
//                                             <div className="w-10 h-10 rounded-xl bg-slate-800 overflow-hidden flex-shrink-0">
//                                                 <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
//                                             </div>
//                                             <p className="font-semibold text-white">{product.name}</p>
//                                         </div>
//                                     </td>
//                                     <td className="px-6 py-4">
//                                         <span className="bg-slate-800 text-slate-300 text-xs px-3 py-1 rounded-full">{product.categories?.category_name}</span>
//                                     </td>
//                                     <td className="px-6 py-4 font-semibold text-white">₹{parseFloat(product.price).toFixed(2)}</td>
//                                     <td className="px-6 py-4">
//                                         {product.stock_quantity === 0
//                                             ? <span className="text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded-full">Out of Stock</span>
//                                             : <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full">{product.stock_quantity} left</span>}
//                                     </td>
//                                     <td className="px-6 py-4 text-right">
//                                         <div className="flex items-center justify-end gap-1">
//                                             <button onClick={() => setModal(product)} className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg">
//                                                 <Pencil className="w-4 h-4" />
//                                             </button>
//                                             <button onClick={() => toggleStock(product)} className={`p-2 rounded-lg ${product.stock_quantity === 0 ? 'text-slate-400 hover:text-emerald-400' : 'text-slate-400 hover:text-amber-400'}`}>
//                                                 {product.stock_quantity === 0 ? <Package className="w-4 h-4" /> : <PackageX className="w-4 h-4" />}
//                                             </button>
//                                             <button onClick={() => deleteProduct(product)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg">
//                                                 <X className="w-4 h-4" />
//                                             </button>
//                                         </div>
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>
//         </>
//     );
// };

// const VendorCategoriesTab = ({ categories, onCategoriesChange, showToast }) => {
//     const [newName, setNewName] = useState('');
//     const [newDesc, setNewDesc] = useState('');
//     const [saving, setSaving] = useState(false);

//     const handleAdd = async (e) => {
//         e.preventDefault();
//         setSaving(true);
//         const { error } = await supabase.from('categories').insert({ category_name: newName, description: newDesc });
//         if (!error) { setNewName(''); setNewDesc(''); onCategoriesChange(); showToast(`Category "${newName}" added!`); }
//         setSaving(false);
//     };

//     return (
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//             <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
//                 <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2"><Plus className="w-4 h-4 text-indigo-400" /> Add Category</h3>
//                 <form onSubmit={handleAdd} className="space-y-4">
//                     <div>
//                         <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Category Name</label>
//                         <input required value={newName} onChange={e => setNewName(e.target.value)}
//                             className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
//                     </div>
//                     <div>
//                         <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Description</label>
//                         <input value={newDesc} onChange={e => setNewDesc(e.target.value)}
//                             className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
//                     </div>
//                     <button type="submit" disabled={saving} className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white rounded-xl py-3 font-bold">
//                         {saving ? 'Adding...' : 'Add Category'}
//                     </button>
//                 </form>
//             </div>
//             <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
//                 <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2"><Tag className="w-4 h-4 text-indigo-400" /> Existing Categories</h3>
//                 <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
//                     {categories.map(cat => (
//                         <div key={cat.category_id} className="flex justify-between px-4 py-3 bg-slate-800/50 rounded-xl border border-slate-800">
//                             <div><p className="text-white font-semibold text-sm">{cat.category_name}</p></div>
//                         </div>
//                     ))}
//                 </div>
//             </div>
//         </div>
//     );
// };

// const VendorOrdersTab = ({ vendor, showToast }) => {
//     const [orders, setOrders] = useState([]);
//     const [loading, setLoading] = useState(true);

//     const fetchOrders = useCallback(async () => {
//         try {
//             const data = await api.orders.getByVendor(vendor.vendor_id);
//             setOrders(data || []);
//         } catch (e) { console.error('Failed to load orders', e); }
//         setLoading(false);
//     }, [vendor.vendor_id]);

//     useEffect(() => { fetchOrders(); }, [fetchOrders]);

//     const handleStatusUpdate = async (orderId, newStatus) => {
//         try {
//             await api.orders.updateStatus(orderId, newStatus);
//             showToast(`Order #${orderId} status updated to ${newStatus}`);
//             setOrders(prev => prev.map(o => o.order_id === orderId ? { ...o, status: newStatus } : o));
//         } catch (error) {
//             console.error('Update failed:', error);
//             showToast('Failed to update order status');
//         }
//     };

//     const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered'];

//     if (loading) return <div className="text-center py-24 text-slate-500 animate-pulse">Loading orders...</div>;
//     if (orders.length === 0) return <div className="text-center py-24 text-slate-500">You don't have any orders yet.</div>;

//     return (
//         <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
//             <table className="w-full text-left text-sm">
//                 <thead>
//                     <tr className="border-b border-slate-800 text-xs text-slate-500 uppercase tracking-widest bg-slate-900/50">
//                         <th className="px-6 py-4">Order ID</th>
//                         <th className="px-6 py-4">Date</th>
//                         <th className="px-6 py-4">Items Summary</th>
//                         <th className="px-6 py-4">Total</th>
//                         <th className="px-6 py-4">Status & Tracking</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {orders.map(order => {
//                         const total = (order.order_items || []).reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0);
//                         return (
//                             <tr key={order.order_id} className="border-b border-slate-800/60 hover:bg-slate-800/30">
//                                 <td className="px-6 py-4 font-bold text-white">#{order.order_id}</td>
//                                 <td className="px-6 py-4 text-slate-400">
//                                     {order.order_date ? new Date(order.order_date).toLocaleDateString() : '—'}
//                                 </td>
//                                 <td className="px-6 py-4 text-slate-400 max-w-[200px] truncate">
//                                     {order.order_items?.map(i => `${i.quantity}x ${i.products?.name}`).join(', ')}
//                                 </td>
//                                 <td className="px-6 py-4 font-bold text-white">₹{total.toFixed(2)}</td>
//                                 <td className="px-6 py-4">
//                                     <select
//                                         value={order.status || 'Pending'}
//                                         onChange={(e) => handleStatusUpdate(order.order_id, e.target.value)}
//                                         className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer text-white max-w-[150px]
//                                             ${order.status === 'Delivered' ? 'bg-emerald-900/50 border-emerald-500/50' :
//                                               order.status === 'Shipped' ? 'bg-indigo-900/50 border-indigo-500/50' :
//                                               order.status === 'Processing' ? 'bg-amber-900/50 border-amber-500/50' :
//                                               'bg-slate-800 border-slate-700'
//                                             }`}
//                                     >
//                                         {statuses.map(s => <option key={s} value={s} className="bg-slate-900">{s}</option>)}
//                                     </select>
//                                 </td>
//                             </tr>
//                         )
//                     })}
//                 </tbody>
//             </table>
//         </div>
//     );
// };

// const VendorDashboard = () => {
//     const { user } = useUser();
//     const navigate = useNavigate();

//     const [vendor, setVendor] = useState(null);
//     const [loadingAuth, setLoadingAuth] = useState(true);
//     const [activeTab, setActiveTab] = useState('products');
//     const [categories, setCategories] = useState([]);
//     const [toast, setToast] = useState('');

//     useEffect(() => {
//         if (user === null) { navigate('/login'); return; }
//         if (!user) return;
//         const checkVendor = async () => {
//             const data = await api.vendors.getByUser(user.id);
//             if (!data || data.status !== 'approved') {
//                 navigate('/become-vendor'); // Redirect unauthorized users
//             } else {
//                 setVendor(data);
//                 const cats = await api.categories.getAll();
//                 setCategories(cats || []);
//             }
//             setLoadingAuth(false);
//         };
//         checkVendor();
//     }, [user, navigate]);

//     const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };
//     const refreshCategories = async () => {
//         const cats = await api.categories.getAll();
//         setCategories(cats || []);
//     };

//     if (user === undefined || loadingAuth) {
//         return <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 animate-pulse">Loading dashboard...</div>;
//     }

//     if (!vendor) return null; // handled by redirect

//     const tabs = [
//         { id: 'products', label: 'My Products', icon: ShoppingBag },
//         { id: 'categories', label: 'Store Categories', icon: Tag },
//         { id: 'orders', label: 'Customer Orders', icon: ClipboardList },
//     ];

//     const handleDismissShop = async () => {
//         if (!window.confirm("WARNING: This will permanently discard all your products and close your shop. Are you absolutely sure?")) return;

//         try {
//             // First get all product IDs for this vendor to delete their inventory
//             const { data: products } = await supabase.from('products').select('product_id').eq('vendor_id', vendor.vendor_id);
//             const productIds = (products || []).map(p => p.product_id);

//             if (productIds.length > 0) {
//                 await supabase.from('inventory').delete().in('product_id', productIds);
//                 await supabase.from('products').delete().in('product_id', productIds);
//             }

//             // Set vendor status to dismissed
//             await api.vendors.updateStatus(vendor.vendor_id, 'dismissed');

//             // Redirect home
//             navigate('/');
//         } catch (error) {
//             console.error(error);
//             showToast('Failed to dismiss shop. Please contact support.');
//         }
//     };

//     return (
//         <div className="min-h-screen bg-slate-950 text-slate-300">
//             <AnimatePresence>{toast && <Toast msg={toast} />}</AnimatePresence>

//             {/* Header */}
//             <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
//                 <div className="flex items-center gap-3">
//                     <LayoutDashboard className="w-5 h-5 text-indigo-400" />
//                     <span className="text-white font-bold text-lg tracking-tight">Vendor Dashboard <span className="text-slate-500 font-normal ml-2">| {vendor.name}</span></span>
//                 </div>
//                 <div className="flex items-center gap-4">
//                     <button onClick={handleDismissShop} className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold px-3 py-1.5 rounded-lg border border-red-500/20 transition-colors">
//                         Dismiss Shop
//                     </button>
//                     <button onClick={() => navigate('/')} className="text-xs text-slate-400 hover:text-white transition-colors font-medium">
//                         ← Back to Store
//                     </button>
//                 </div>
//             </div>

//             {/* Tabs */}
//             <div className="border-b border-slate-800 bg-slate-900/50">
//                 <div className="max-w-7xl mx-auto px-6">
//                     <div className="flex gap-1 flex-wrap">
//                         {tabs.map(({ id, label, icon: Icon }) => (
//                             <button key={id} onClick={() => setActiveTab(id)}
//                                 className={`flex items-center gap-2 px-5 py-4 text-sm font-semibold border-b-2 transition-colors ${activeTab === id
//                                     ? 'border-indigo-500 text-white'
//                                     : 'border-transparent text-slate-500 hover:text-slate-300'
//                                     }`}>
//                                 <Icon className="w-4 h-4" /> {label}
//                             </button>
//                         ))}
//                     </div>
//                 </div>
//             </div>

//             {/* Content */}
//             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//                 <AnimatePresence mode="wait">
//                     <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
//                         {activeTab === 'products' && <VendorProductsTab categories={categories} vendor={vendor} showToast={showToast} />}
//                         {activeTab === 'categories' && <VendorCategoriesTab categories={categories} onCategoriesChange={refreshCategories} showToast={showToast} />}
//                         {activeTab === 'orders' && <VendorOrdersTab vendor={vendor} showToast={showToast} />}
//                     </motion.div>
//                 </AnimatePresence>
//             </div>
//         </div>
//     );
// };

// export default VendorDashboard;


import { useState, useEffect, useCallback } from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { api } from '../services/api';
import {
    Plus, Pencil, PackageX, Package, X, Check, LayoutDashboard,
    ShoppingBag, Search, Tag, ClipboardList, Ticket
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Toast = ({ msg }) => (
    <motion.div
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
        className="fixed top-6 right-6 z-[100] bg-indigo-600 text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2"
    >
        <Check className="w-4 h-4" /> {msg}
    </motion.div>
);

// ─── PRODUCT MODAL ───────────────────────────────────────────────
const ProductModal = ({ product, categories, vendor, onClose, onSave }) => {
    const isEdit = !!product;
    const [form, setForm] = useState({
        name: product?.name || '',
        description: product?.description || '',
        price: product?.price || '',
        image_url: product?.image_url || '',
        category_id: product?.category_id || '',
        stock_quantity: product?.stock_quantity ?? 10,
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true); setError('');
        const payload = {
            name: form.name, description: form.description,
            price: parseFloat(form.price), image_url: form.image_url,
            category_id: parseInt(form.category_id) || null,
            vendor_id: vendor.vendor_id, // integer PK
        };
        try {
            if (isEdit) {
                const { error: e1 } = await supabase.from('products').update(payload).eq('product_id', product.product_id);
                if (e1) throw e1;
                const { error: e2 } = await supabase.from('inventory').update({ stock_quantity: parseInt(form.stock_quantity) }).eq('product_id', product.product_id);
                if (e2) throw e2;
            } else {
                const { data: np, error: e1 } = await supabase.from('products').insert(payload).select().single();
                if (e1) throw e1;
                const { error: e2 } = await supabase.from('inventory').insert({ product_id: np.product_id, stock_quantity: parseInt(form.stock_quantity) });
                if (e2) throw e2;
            }
            onSave();
        } catch (err) { setError(err.message); }
        setSaving(false);
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-8 relative shadow-2xl max-h-[90vh] overflow-y-auto"
            >
                <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-white bg-slate-800 rounded-full p-1.5">
                    <X className="w-4 h-4" />
                </button>
                <h2 className="text-xl font-bold text-white mb-6">{isEdit ? 'Edit Product' : 'Add New Product'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {[
                        { label: 'Product Name', name: 'name', type: 'text', placeholder: 'e.g. Handmade Mug', required: true },
                        { label: 'Image URL', name: 'image_url', type: 'text', placeholder: 'https://...' },
                    ].map(f => (
                        <div key={f.name}>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{f.label}</label>
                            <input name={f.name} type={f.type} required={f.required} value={form[f.name]} onChange={handleChange} placeholder={f.placeholder}
                                className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-600" />
                        </div>
                    ))}
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Description</label>
                        <textarea name="description" value={form.description} onChange={handleChange} rows={2}
                            className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none placeholder:text-slate-600"
                            placeholder="Product description..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Price (₹)</label>
                            <input name="price" type="number" min="0" step="0.01" required value={form.price} onChange={handleChange}
                                className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="99.00" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Stock</label>
                            <input name="stock_quantity" type="number" min="0" required value={form.stock_quantity} onChange={handleChange}
                                className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="10" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Category</label>
                        <select name="category_id" value={form.category_id} onChange={handleChange} required
                            className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            <option value="">Select category</option>
                            {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
                        </select>
                    </div>
                    {form.image_url && (
                        <img src={form.image_url} alt="preview" className="h-20 w-20 object-cover rounded-xl border border-slate-700 mt-2" />
                    )}
                    {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">{error}</p>}
                    <button type="submit" disabled={saving}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white rounded-xl py-3 font-bold transition-all">
                        {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Product'}
                    </button>
                </form>
            </motion.div>
        </motion.div>
    );
};

// ─── PRODUCTS TAB ────────────────────────────────────────────────
const VendorProductsTab = ({ categories, vendor, showToast }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState(undefined);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        // ✅ Use vendor.vendor_id (integer PK)
        const data = await api.products.getByVendor(vendor.vendor_id);
        setProducts(data || []);
        setLoading(false);
    }, [vendor.vendor_id]);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    const toggleStock = async (product) => {
        const newQty = product.stock_quantity === 0 ? 10 : 0;
        await supabase.from('inventory').update({ stock_quantity: newQty }).eq('product_id', product.product_id);
        setProducts(prev => prev.map(p => p.product_id === product.product_id ? { ...p, stock_quantity: newQty } : p));
        showToast(newQty === 0 ? `"${product.name}" marked out of stock` : `"${product.name}" restocked`);
    };

    const deleteProduct = async (product) => {
        if (!window.confirm(`Delete "${product.name}"?`)) return;
        await supabase.from('inventory').delete().eq('product_id', product.product_id);
        await supabase.from('products').delete().eq('product_id', product.product_id);
        setProducts(prev => prev.filter(p => p.product_id !== product.product_id));
        showToast(`"${product.name}" deleted`);
    };

    const filtered = products.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()));

    return (
        <>
            <AnimatePresence>
                {modal !== undefined && (
                    <ProductModal product={modal} categories={categories} vendor={vendor}
                        onClose={() => setModal(undefined)}
                        onSave={() => { setModal(undefined); fetchProducts(); showToast('Product saved!'); }}
                    />
                )}
            </AnimatePresence>

            <div className="flex gap-4 mb-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input type="text" placeholder="Search your products..." value={search} onChange={e => setSearch(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-white text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={() => setModal(null)}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm px-6 py-3 rounded-xl">
                    <Plus className="w-4 h-4" /> Add Product
                </motion.button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-800 text-xs text-slate-500 uppercase tracking-widest text-left">
                                <th className="px-6 py-4">Product</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">Stock</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={5} className="text-center py-12 text-slate-500 animate-pulse">Loading products...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={5} className="text-center py-12 text-slate-500">No products yet. Add some!</td></tr>
                            ) : filtered.map(product => (
                                <tr key={product.product_id} className="border-b border-slate-800/60 hover:bg-slate-800/30">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-800 overflow-hidden flex-shrink-0">
                                                <img src={product.image_url || 'https://via.placeholder.com/40'} alt={product.name} className="w-full h-full object-cover" />
                                            </div>
                                            <p className="font-semibold text-white">{product.name}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-slate-800 text-slate-300 text-xs px-3 py-1 rounded-full">{product.categories?.category_name || '—'}</span>
                                    </td>
                                    <td className="px-6 py-4 font-semibold text-white">₹{parseFloat(product.price).toFixed(2)}</td>
                                    <td className="px-6 py-4">
                                        {product.stock_quantity === 0
                                            ? <span className="text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded-full">Out of Stock</span>
                                            : <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full">{product.stock_quantity} left</span>}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => setModal(product)} className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg"><Pencil className="w-4 h-4" /></button>
                                            <button onClick={() => toggleStock(product)} className={`p-2 rounded-lg ${product.stock_quantity === 0 ? 'text-slate-400 hover:text-emerald-400' : 'text-slate-400 hover:text-amber-400'}`}>
                                                {product.stock_quantity === 0 ? <Package className="w-4 h-4" /> : <PackageX className="w-4 h-4" />}
                                            </button>
                                            <button onClick={() => deleteProduct(product)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"><X className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

// ─── ORDERS TAB ──────────────────────────────────────────────────
const VendorOrdersTab = ({ vendor, showToast }) => {
    const [orders, setOrders] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [shippings, setShippings] = useState([]);
    const [trackingInputs, setTrackingInputs] = useState({});
    const [loading, setLoading] = useState(true);

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            // ✅ Use vendor.vendor_id (integer PK)
            const data = await api.orders.getByVendor(vendor.vendor_id);
            setOrders(data || []);
            
            // ✅ Fetch tickets and shipping
            const orderIds = (data || []).map(o => o.order_id);
            if (orderIds.length > 0) {
               const [ticketData, shippingData] = await Promise.all([
                   api.supportTickets.getByOrders(orderIds),
                   api.shipping.getByOrders(orderIds)
               ]);
               setTickets(ticketData || []);
               setShippings(shippingData || []);
            }
        } catch (e) { console.error('Failed to load orders', e); }
        setLoading(false);
    }, [vendor.vendor_id]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            await api.orders.updateStatus(orderId, newStatus);
            setOrders(prev => prev.map(o => o.order_id === orderId ? { ...o, status: newStatus } : o));
            showToast(`Order #${orderId} → ${newStatus}`);
        } catch (error) {
            console.error('Update failed:', error);
            showToast('Failed to update order status. Check RLS policies.');
        }
    };

    const handleTrackingUpdate = async (orderId) => {
        const value = trackingInputs[orderId];
        if (!value || !value.trim()) return;
        try {
            await api.shipping.updateTracking(orderId, value);
            setShippings(prev => prev.find(s => s.order_id === orderId) 
                ? prev.map(s => s.order_id === orderId ? { ...s, tracking_number: value } : s)
                : [...prev, { order_id: orderId, tracking_number: value }]
            );
            showToast(`Tracking saved!`);
        } catch (e) {
            console.error(e);
            showToast('Failed to save tracking.');
        }
    };

    const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered'];

    if (loading) return <div className="text-center py-24 text-slate-500 animate-pulse">Loading orders...</div>;
    if (orders.length === 0) return <div className="text-center py-24 text-slate-500">No orders for your products yet.</div>;

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-slate-800 text-xs text-slate-500 uppercase tracking-widest">
                            <th className="px-6 py-4">Order</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Items</th>
                            <th className="px-6 py-4">Total</th>
                            <th className="px-6 py-4">Ticket</th>
                            <th className="px-6 py-4">Status & Tracking</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => {
                            const total = (order.order_items || []).reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0);
                            const orderTicket = tickets.find(t => t.order_id === order.order_id);
                            const orderShipping = shippings.find(s => s.order_id === order.order_id);
                            
                            const currentTrackingInput = trackingInputs[order.order_id] !== undefined 
                                ? trackingInputs[order.order_id] 
                                : (orderShipping?.tracking_number || '');

                            return (
                                <tr key={order.order_id} className="border-b border-slate-800/60 hover:bg-slate-800/30">
                                    <td className="px-6 py-4 font-bold text-white">#{order.order_id}</td>
                                    <td className="px-6 py-4 text-slate-400 text-xs">
                                        {order.order_date ? new Date(order.order_date).toLocaleDateString('en-IN') : '—'}
                                    </td>
                                    <td className="px-6 py-4 text-slate-400 text-xs max-w-[200px] truncate">
                                        {(order.order_items || []).map(i => `${i.quantity}× ${i.products?.name || '?'}`).join(', ')}
                                    </td>
                                    <td className="px-6 py-4 font-bold text-white">₹{total.toFixed(2)}</td>
                                    <td className="px-6 py-4">
                                        {orderTicket ? (
                                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border ${orderTicket.status === 'Open' ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'}`}>
                                                <Ticket className="w-3 h-3" /> {orderTicket.status}
                                            </span>
                                        ) : (
                                            <span className="text-slate-600">—</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {order.status === 'Cancelled' ? (
                                            <span className="text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg">Cancelled</span>
                                        ) : order.status === 'Delivered' ? (
                                            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">Delivered</span>
                                        ) : (
                                            <div className="flex flex-col gap-2 min-w-[140px]">
                                                <select
                                                    value={order.status || 'Pending'}
                                                    onChange={(e) => handleStatusUpdate(order.order_id, e.target.value)}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer text-white bg-slate-800 border-slate-700`}
                                                >
                                                    {statuses.map(s => {
                                                        const weights = { 'Pending': 0, 'Processing': 1, 'Shipped': 2, 'Delivered': 3 };
                                                        const currentWeight = weights[order.status || 'Pending'];
                                                        const disabled = weights[s] < currentWeight;
                                                        return <option key={s} value={s} disabled={disabled} className={disabled ? 'bg-slate-800 text-slate-500' : 'bg-slate-900 text-white'}>{s}</option>;
                                                    })}
                                                </select>
                                                
                                                <div className="flex gap-1">
                                                    <input 
                                                      type="text"
                                                      value={currentTrackingInput}
                                                      onChange={(e) => setTrackingInputs({ ...trackingInputs, [order.order_id]: e.target.value })}
                                                      placeholder="Tracking #"
                                                      className="w-full bg-slate-900 border border-slate-700 text-white text-xs px-2 py-1.5 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-500 placeholder:font-normal font-mono" 
                                                    />
                                                    <button 
                                                      onClick={() => handleTrackingUpdate(order.order_id)} 
                                                      disabled={!trackingInputs[order.order_id] || trackingInputs[order.order_id] === orderShipping?.tracking_number}
                                                      className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:hover:bg-indigo-600 text-white font-bold text-xs px-2 py-1.5 rounded-md transition-colors"
                                                    >
                                                      ✓
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// ─── CATEGORIES TAB ──────────────────────────────────────────────
const VendorCategoriesTab = ({ categories, onCategoriesChange, showToast }) => {
    const [newName, setNewName] = useState('');
    const [newImage, setNewImage] = useState('');
    const [saving, setSaving] = useState(false);

    const handleAdd = async (e) => {
        e.preventDefault();
        setSaving(true);
        const payload = { category_name: newName };
        if (newImage) payload.image_url = newImage;
        
        const { error } = await supabase.from('categories').insert(payload);
        if (!error) { 
            setNewName(''); setNewImage(''); 
            onCategoriesChange(); showToast(`Category "${newName}" suggested!`); 
        } else {
            showToast(`Error: ${error.message}`);
        }
        setSaving(false);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2"><Plus className="w-4 h-4 text-indigo-400" /> Suggest Category</h3>
                <form onSubmit={handleAdd} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Category Name</label>
                        <input required value={newName} onChange={e => setNewName(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g. Pottery" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Image URL (optional)</label>
                        <input value={newImage} onChange={e => setNewImage(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="https://..." />
                    </div>
                    {newImage && (
                        <img src={newImage} alt="preview" className="h-20 w-20 object-cover rounded-xl border border-slate-700" />
                    )}
                    <button type="submit" disabled={saving} className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white rounded-xl py-3 font-bold">
                        {saving ? 'Adding...' : 'Add Category'}
                    </button>
                </form>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2"><Tag className="w-4 h-4 text-indigo-400" /> Available Categories</h3>
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {categories.map(cat => (
                        <div key={cat.category_id} className="flex items-center gap-3 px-4 py-3 bg-slate-800/50 rounded-xl border border-slate-800">
                            {cat.image_url && (
                                <div className="w-8 h-8 rounded-lg bg-slate-800 overflow-hidden flex-shrink-0 border border-slate-700">
                                    <img src={cat.image_url} alt={cat.category_name} className="w-full h-full object-cover" />
                                </div>
                            )}
                            <p className="text-white font-semibold text-sm">{cat.category_name}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ─── TICKETS TAB ────────────────────────────────────────────────
const VendorTicketsTab = ({ vendor, showToast }) => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTickets = useCallback(async () => {
        setLoading(true);
        try {
            // 1. Get orders for vendor
            const orders = await api.orders.getByVendor(vendor.vendor_id);
            const orderIds = orders.map(o => o.order_id);
            // 2. Get tickets for those orders
            if (orderIds.length > 0) {
                const data = await api.supportTickets.getByOrders(orderIds);
                setTickets(data);
            }
        } catch (e) {
            console.error('Failed to load tickets', e);
        }
        setLoading(false);
    }, [vendor.vendor_id]);

    useEffect(() => { fetchTickets(); }, [fetchTickets]);

    const handleUpdateTicketStatus = async (ticketId, newStatus) => {
        try {
            await api.supportTickets.updateStatus(ticketId, newStatus);
            setTickets(prev => prev.map(t => t.ticket_id === ticketId ? { ...t, status: newStatus } : t));
            showToast && showToast(`Ticket marked as ${newStatus}`);
        } catch (e) {
            console.error('Update failed:', e);
            showToast && showToast(`Failed: ${e.message || 'Unknown error'}`);
        }
    };

    if (loading) return <div className="text-center py-24 text-slate-500 animate-pulse">Loading tickets...</div>;
    if (tickets.length === 0) return <div className="text-center py-24 text-slate-500">No support tickets for your orders.</div>;

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2"><Ticket className="w-5 h-5 text-indigo-400" /> Customer Support Tickets</h3>
            <div className="space-y-4">
                {tickets.map(ticket => (
                    <div key={ticket.ticket_id} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-start">
                        <div className="flex-1 w-full">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <span className="text-white font-bold text-sm">Order #{ticket.order_id}</span>
                                    <p className="text-xs text-slate-500 mt-1">{new Date(ticket.created_at).toLocaleString()}</p>
                                </div>
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${ticket.status === 'Open' ? 'text-amber-400 border-amber-500/20 bg-amber-500/10' : 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10'}`}>
                                    {ticket.status || 'Open'}
                                </span>
                            </div>
                            <p className="text-sm text-slate-300 bg-slate-900 p-4 rounded-xl border border-slate-800">{ticket.issue}</p>
                        </div>
                        {ticket.status === 'Open' && (
                            <button onClick={() => handleUpdateTicketStatus(ticket.ticket_id, 'Resolved')} className="w-full md:w-auto bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 px-4 py-2 rounded-xl text-sm font-bold transition-all mt-1">
                                Mark Resolved
                            </button>
                        )}
                        {ticket.status === 'Resolved' && (
                            <button onClick={() => handleUpdateTicketStatus(ticket.ticket_id, 'Open')} className="w-full md:w-auto bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-4 py-2 rounded-xl text-sm font-bold transition-all mt-1">
                                Reopen
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// ─── MAIN VENDOR DASHBOARD ───────────────────────────────────────
const VendorDashboard = () => {
    const { user } = useUser();
    const navigate = useNavigate();

    const [vendor, setVendor] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [activeTab, setActiveTab] = useState('products');
    const [categories, setCategories] = useState([]);
    const [toast, setToast] = useState('');
    const [dismissing, setDismissing] = useState(false);

    useEffect(() => {
        if (user === null) { navigate('/login'); return; }
        if (!user) return;

        const checkVendor = async () => {
            // ✅ FIXED: query by user_id (uuid), not vendor_id (integer)
            const data = await api.vendors.getByUser(user.id);

            if (!data) {
                navigate('/become-vendor');
                return;
            }

            if (data.status !== 'approved') {
                // Not approved yet — show status page
                navigate('/become-vendor');
                return;
            }

            setVendor(data);
            const cats = await api.categories.getAll();
            setCategories(cats || []);
            setLoadingAuth(false);
        };

        checkVendor();
    }, [user, navigate]);

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

    const refreshCategories = async () => {
        const cats = await api.categories.getAll();
        setCategories(cats || []);
    };

    // ✅ FIXED: uses api.vendors.dismiss() which also deletes products + inventory
    const handleDismissShop = async () => {
        if (!window.confirm('WARNING: This will permanently close your shop and remove all your products. Are you absolutely sure?')) return;
        setDismissing(true);
        try {
            await api.vendors.dismiss(vendor.vendor_id);
            navigate('/');
        } catch (error) {
            console.error(error);
            showToast('Failed to dismiss shop. Please contact support.');
        }
        setDismissing(false);
    };

    if (user === undefined || loadingAuth) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-slate-400 animate-pulse text-lg">Loading dashboard...</div>
            </div>
        );
    }

    if (!vendor) return null;

    const tabs = [
        { id: 'products', label: 'My Products', icon: ShoppingBag },
        { id: 'orders', label: 'Customer Orders', icon: ClipboardList },
        { id: 'categories', label: 'Categories', icon: Tag },
        { id: 'tickets', label: 'Support Tickets', icon: Ticket },
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-300">
            <AnimatePresence>{toast && <Toast msg={toast} />}</AnimatePresence>

            {/* Header */}
            <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <LayoutDashboard className="w-5 h-5 text-indigo-400" />
                    <span className="text-white font-bold text-lg tracking-tight">
                        Vendor Dashboard
                        <span className="text-slate-500 font-normal ml-2 text-base">| {vendor.name}</span>
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleDismissShop}
                        disabled={dismissing}
                        className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold px-3 py-1.5 rounded-lg border border-red-500/20 transition-colors disabled:opacity-50"
                    >
                        {dismissing ? 'Closing...' : 'Close Shop'}
                    </button>
                    <button onClick={() => navigate('/')} className="text-xs text-slate-400 hover:text-white transition-colors font-medium">
                        ← Store
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-800 bg-slate-900/50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex gap-1">
                        {tabs.map(({ id, label, icon: Icon }) => (
                            <button key={id} onClick={() => setActiveTab(id)}
                                className={`flex items-center gap-2 px-5 py-4 text-sm font-semibold border-b-2 transition-colors ${activeTab === id ? 'border-indigo-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'
                                    }`}>
                                <Icon className="w-4 h-4" /> {label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <AnimatePresence mode="wait">
                    <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                        {activeTab === 'products' && <VendorProductsTab categories={categories} vendor={vendor} showToast={showToast} />}
                        {activeTab === 'orders' && <VendorOrdersTab vendor={vendor} showToast={showToast} />}
                        {activeTab === 'categories' && <VendorCategoriesTab categories={categories} onCategoriesChange={refreshCategories} showToast={showToast} />}
                        {activeTab === 'tickets' && <VendorTicketsTab vendor={vendor} showToast={showToast} />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default VendorDashboard;
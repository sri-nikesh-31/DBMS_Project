








































import { useState, useEffect, useCallback } from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import {
    Plus, Pencil, PackageX, Package, X, Check, LayoutDashboard,
    ShoppingBag, AlertTriangle, Search, Tag, Store, CheckCircle,
    XCircle, Clock, Eye, ChevronDown
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

const ProductModal = ({ product, categories, vendors, onClose, onSave }) => {
    const isEdit = !!product;
    const [form, setForm] = useState({
        name: product?.name || '',
        description: product?.description || '',
        price: product?.price || '',
        image_url: product?.image_url || '',
        category_id: product?.category_id || '',
        vendor_id: product?.vendor_id || '',
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
            vendor_id: form.vendor_id || null,
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
                        { label: 'Product Name', name: 'name', type: 'text', placeholder: 'e.g. Minimalist Oak Shelf', required: true },
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
                                className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="999.00" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Stock</label>
                            <input name="stock_quantity" type="number" min="0" required value={form.stock_quantity} onChange={handleChange}
                                className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="10" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Category</label>
                        <select name="category_id" value={form.category_id} onChange={handleChange}
                            className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            <option value="">Select category</option>
                            {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Vendor (Approved only)</label>
                        <select name="vendor_id" value={form.vendor_id} onChange={handleChange}
                            className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            <option value="">No vendor</option>
                            {vendors.map(v => <option key={v.vendor_id} value={v.vendor_id}>{v.name}</option>)}
                        </select>
                    </div>

                    {form.image_url && (
                        <img src={form.image_url} alt="preview" className="h-20 w-20 object-cover rounded-xl border border-slate-700" />
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

const VendorDetailsModal = ({ vendor, onClose }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
    >
        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto"
        >
            <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 rounded-full p-1.5 transition-colors">
                <X className="w-4 h-4" />
            </button>
            <h3 className="text-2xl font-bold text-white mb-1 flex items-center gap-2"><Store className="w-5 h-5 text-indigo-400" /> {vendor.name}</h3>
            <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full border mb-6
                ${vendor.status === 'approved' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' :
                  vendor.status === 'rejected' ? 'text-red-400 border-red-500/30 bg-red-500/10' :
                  'text-amber-400 border-amber-500/30 bg-amber-500/10'}`}>
                {vendor.status.toUpperCase()}
            </span>

            <div className="space-y-4 mb-6">
                <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold">Description</p>
                    <p className="text-slate-300 text-sm">{vendor.description || 'N/A'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs text-slate-500 uppercase font-semibold">Phone</p>
                        <p className="text-slate-300 text-sm">{vendor.phone || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 uppercase font-semibold">Email</p>
                        <p className="text-slate-300 text-sm">{vendor.email || 'N/A'}</p>
                    </div>
                </div>
                <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold">Address</p>
                    <p className="text-slate-300 text-sm">{vendor.address || 'N/A'}</p>
                </div>
            </div>

            <div className="border-t border-slate-800 pt-6 text-center">
                <p className="text-xs text-slate-500 uppercase font-semibold mb-4">Payment QR Code</p>
                {vendor.qr_code_url ? (
                    <img src={vendor.qr_code_url} alt="QR" className="mx-auto max-h-48 object-contain rounded-xl border border-slate-700 bg-white p-3" />
                ) : (
                    <div className="w-48 h-48 mx-auto rounded-xl border border-slate-700 bg-slate-800 flex items-center justify-center text-slate-500 text-sm">
                        No QR Uploaded
                    </div>
                )}
            </div>
        </motion.div>
    </motion.div>
);

const ProductsTab = ({ categories, vendors, showToast }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState(undefined);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        const { data } = await supabase.from('products')
            .select('*, categories(category_name), inventory(stock_quantity), vendors(name)')
            .order('product_id', { ascending: false });
        setProducts((data || []).map(p => ({ ...p, stock_quantity: p.inventory?.[0]?.stock_quantity ?? 0 })));
        setLoading(false);
    }, []);

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

    const filtered = products.filter(p =>
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.categories?.category_name?.toLowerCase().includes(search.toLowerCase()) ||
        p.vendors?.name?.toLowerCase().includes(search.toLowerCase())
    );

    const outOfStock = products.filter(p => p.stock_quantity === 0).length;

    return (
        <>
            <AnimatePresence>
                {modal !== undefined && (
                    <ProductModal product={modal} categories={categories} vendors={vendors}
                        onClose={() => setModal(undefined)}
                        onSave={() => { setModal(undefined); fetchProducts(); showToast('Product saved!'); }}
                    />
                )}
            </AnimatePresence>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                    { icon: ShoppingBag, label: 'Total', value: products.length, color: 'text-indigo-400' },
                    { icon: PackageX, label: 'Out of Stock', value: outOfStock, color: 'text-red-400' },
                    { icon: Package, label: 'In Stock', value: products.length - outOfStock, color: 'text-emerald-400' },
                ].map(({ icon: Icon, label, value, color }) => (
                    <div key={label} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
                        <div className={`${color} bg-slate-800 p-2.5 rounded-xl`}><Icon className="w-4 h-4" /></div>
                        <div>
                            <p className="text-xl font-bold text-white">{value}</p>
                            <p className="text-xs text-slate-500">{label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {outOfStock > 0 && (
                <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm rounded-xl px-4 py-3 mb-4">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span><strong>{outOfStock}</strong> product{outOfStock > 1 ? 's are' : ' is'} out of stock.</span>
                </div>
            )}

            <div className="flex gap-4 mb-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input type="text" placeholder="Search products, vendors..." value={search} onChange={e => setSearch(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-white text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-600" />
                </div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={() => setModal(null)}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors shadow-lg">
                    <Plus className="w-4 h-4" /> Add Product
                </motion.button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-800 text-xs text-slate-500 uppercase tracking-widest">
                                <th className="text-left px-6 py-4">Product</th>
                                <th className="text-left px-6 py-4 hidden lg:table-cell">Category</th>
                                <th className="text-left px-6 py-4 hidden lg:table-cell">Vendor</th>
                                <th className="text-left px-6 py-4">Price</th>
                                <th className="text-left px-6 py-4">Stock</th>
                                <th className="text-right px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} className="text-center py-12 text-slate-500 animate-pulse">Loading products...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-12 text-slate-500">No products found.</td></tr>
                            ) : filtered.map(product => (
                                <tr key={product.product_id} className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-800 overflow-hidden flex-shrink-0 border border-slate-700">
                                                <img src={product.image_url || 'https://via.placeholder.com/40'} alt={product.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-white line-clamp-1">{product.name}</p>
                                                <p className="text-xs text-slate-500 line-clamp-1">{product.description}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 hidden lg:table-cell">
                                        <span className="bg-slate-800 text-slate-300 text-xs font-medium px-3 py-1 rounded-full">{product.categories?.category_name || '—'}</span>
                                    </td>
                                    <td className="px-6 py-4 hidden lg:table-cell">
                                        <span className="text-slate-300 text-xs">{product.vendors?.name || <span className="text-slate-600">—</span>}</span>
                                    </td>
                                    <td className="px-6 py-4 font-semibold text-white">₹{parseFloat(product.price).toFixed(2)}</td>
                                    <td className="px-6 py-4">
                                        {product.stock_quantity === 0
                                            ? <span className="text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded-full">Out of Stock</span>
                                            : <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full">{product.stock_quantity} left</span>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => setModal(product)} className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors" title="Edit">
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => toggleStock(product)}
                                                className={`p-2 rounded-lg transition-colors ${product.stock_quantity === 0 ? 'text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10' : 'text-slate-400 hover:text-amber-400 hover:bg-amber-500/10'}`}
                                                title={product.stock_quantity === 0 ? 'Restock' : 'Mark out of stock'}>
                                                {product.stock_quantity === 0 ? <Package className="w-4 h-4" /> : <PackageX className="w-4 h-4" />}
                                            </button>
                                            <button onClick={() => deleteProduct(product)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete">
                                                <X className="w-4 h-4" />
                                            </button>
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

const CategoriesTab = ({ categories, onCategoriesChange, showToast }) => {
    const [newName, setNewName] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [newImage, setNewImage] = useState('');
    const [saving, setSaving] = useState(false);

    const handleAdd = async (e) => {
        e.preventDefault();
        setSaving(true);
        const payload = { category_name: newName, description: newDesc };
        if (newImage) payload.image_url = newImage;
        
        const { error } = await supabase.from('categories').insert(payload);
        if (!error) { 
            setNewName(''); setNewDesc(''); setNewImage(''); 
            onCategoriesChange(); showToast(`Category "${newName}" added!`); 
        } else {
            showToast(`Error: ${error.message}`);
        }
        setSaving(false);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Add form */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2"><Plus className="w-4 h-4 text-indigo-400" /> Add Category</h3>
                <form onSubmit={handleAdd} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Category Name</label>
                        <input required value={newName} onChange={e => setNewName(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-600"
                            placeholder="e.g. Outdoor" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Image URL (optional)</label>
                        <input value={newImage} onChange={e => setNewImage(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-600"
                            placeholder="https://..." />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Description (optional)</label>
                        <input value={newDesc} onChange={e => setNewDesc(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-600"
                            placeholder="Short description" />
                    </div>
                    
                    {newImage && (
                        <img src={newImage} alt="preview" className="h-20 w-20 object-cover rounded-xl border border-slate-700" />
                    )}

                    <button type="submit" disabled={saving}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white rounded-xl py-3 font-bold transition-all">
                        {saving ? 'Adding...' : 'Add Category'}
                    </button>
                </form>
            </div>

            {/* List */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2"><Tag className="w-4 h-4 text-indigo-400" /> Existing Categories</h3>
                <div className="space-y-2">
                    {categories.length === 0 ? (
                        <p className="text-slate-500 text-sm">No categories yet.</p>
                    ) : categories.map(cat => (
                        <div key={cat.category_id} className="flex items-center justify-between px-4 py-3 bg-slate-800/50 rounded-xl border border-slate-800">
                            <div className="flex items-center gap-3">
                                {cat.image_url && (
                                    <div className="w-10 h-10 rounded-lg bg-slate-800 overflow-hidden flex-shrink-0 border border-slate-700">
                                        <img src={cat.image_url} alt={cat.category_name} className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div>
                                    <p className="text-white font-semibold text-sm">{cat.category_name}</p>
                                    {cat.description && <p className="text-slate-500 text-xs">{cat.description}</p>}
                                </div>
                            </div>
                            <span className="text-xs text-slate-600">#{cat.category_id}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const VendorsTab = ({ showToast }) => {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [qrVendor, setQrVendor] = useState(null);
    const [filter, setFilter] = useState('all');

    const fetchVendors = useCallback(async () => {
        setLoading(true);
        const { data } = await supabase.from('vendors').select('*').neq('status', 'dismissed').order('created_at', { ascending: false });
        setVendors(data || []);
        setLoading(false);
    }, []);

    useEffect(() => { fetchVendors(); }, [fetchVendors]);

    const updateStatus = async (vendorId, status, name) => {
        if (status === 'rejected' && !window.confirm(`Are you sure you want to reject and hide ${name}?`)) return;
        
        const { error } = await supabase.from('vendors').update({ status }).eq('vendor_id', vendorId);
        if (!error) {
            setVendors(prev => prev.map(v => v.vendor_id === vendorId ? { ...v, status } : v));
            showToast(`${name} ${status === 'approved' ? 'approved' : 'rejected'}!`);
        }
    };

    const statusBadge = (status) => {
        const map = {
            pending: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
            approved: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
            rejected: 'text-red-400 bg-red-500/10 border-red-500/20',
        };
        return map[status] || map.pending;
    };

    const filtered = filter === 'all' 
        ? vendors.filter(v => v.status !== 'rejected') 
        : vendors.filter(v => v.status === filter);

    return (
        <>
            <AnimatePresence>
                {qrVendor && <VendorDetailsModal vendor={qrVendor} onClose={() => setQrVendor(null)} />}
            </AnimatePresence>

            {/* Filter pills */}
            <div className="flex gap-2 mb-6">
                {['all', 'pending', 'approved', 'rejected'].map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${filter === f ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                        {f}
                    </button>
                ))}
                <span className="ml-auto text-slate-500 text-sm self-center">{filtered.length} vendors</span>
            </div>

            {loading ? (
                <div className="text-center py-12 text-slate-500 animate-pulse">Loading vendors...</div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-12 text-slate-500">No vendors found.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map(vendor => (
                        <motion.div key={vendor.vendor_id} layout
                            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className="font-bold text-white">{vendor.name}</h3>
                                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{vendor.description || 'No description'}</p>
                                </div>
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border flex-shrink-0 ml-2 ${statusBadge(vendor.status)}`}>
                                    {vendor.status}
                                </span>
                            </div>

                                <div className="mb-3">
                                    <button onClick={() => setQrVendor(vendor)} className="w-full text-xs bg-slate-800 hover:bg-slate-700 text-indigo-400 font-semibold py-2 rounded-xl flex justify-center items-center gap-2 transition-colors">
                                        <Eye className="w-3.5 h-3.5" /> View Details & QR
                                    </button>
                                </div>

                            <div className="flex gap-2 mt-3">
                                {vendor.status !== 'approved' && (
                                    <button onClick={() => updateStatus(vendor.vendor_id, 'approved', vendor.name)}
                                        className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-bold py-2 rounded-xl transition-colors">
                                        <CheckCircle className="w-3.5 h-3.5" /> Approve
                                    </button>
                                )}
                                {vendor.status !== 'rejected' && (
                                    <button onClick={() => updateStatus(vendor.vendor_id, 'rejected', vendor.name)}
                                        className="flex-1 flex items-center justify-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold py-2 rounded-xl transition-colors">
                                        <XCircle className="w-3.5 h-3.5" /> Reject
                                    </button>
                                )}
                                {vendor.status === 'approved' && (
                                    <div className="flex-1 flex items-center justify-center gap-1.5 text-emerald-400 text-xs font-bold">
                                        <CheckCircle className="w-3.5 h-3.5" /> Active Vendor
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </>
    );
};

const AdminPanel = () => {
    const { user } = useUser();
    const navigate = useNavigate();

    const [isAdmin, setIsAdmin] = useState(null);
    const [activeTab, setActiveTab] = useState('products');
    const [categories, setCategories] = useState([]);
    const [approvedVendors, setApprovedVendors] = useState([]);
    const [toast, setToast] = useState('');

    useEffect(() => {
        if (user === null) { navigate('/login'); return; }
        if (!user) return;
        const check = async () => {
            const { data } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
            if (!data?.is_admin) { navigate('/'); } else { setIsAdmin(true); }
        };
        check();
    }, [user, navigate]);

    const fetchSharedData = useCallback(async () => {
        const [{ data: cats }, { data: vends }] = await Promise.all([
            supabase.from('categories').select('*'),
            supabase.from('vendors').select('*').eq('status', 'approved'),
        ]);
        setCategories(cats || []);
        setApprovedVendors(vends || []);
    }, []);

    useEffect(() => { if (isAdmin) fetchSharedData(); }, [isAdmin, fetchSharedData]);

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

    const tabs = [
        { id: 'products', label: 'Products', icon: ShoppingBag },
        { id: 'categories', label: 'Categories', icon: Tag },
        { id: 'vendors', label: 'Vendors', icon: Store },
    ];

    if (user === undefined || isAdmin === null) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-slate-400 animate-pulse text-lg">Loading admin panel...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-300">
            <AnimatePresence>{toast && <Toast msg={toast} />}</AnimatePresence>

            {/* Header */}
            <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <LayoutDashboard className="w-5 h-5 text-indigo-400" />
                    <span className="text-white font-bold text-lg tracking-tight">Aura<span className="text-indigo-500">.</span> Admin</span>
                </div>
                <button onClick={() => navigate('/')} className="text-xs text-slate-400 hover:text-white transition-colors font-medium">
                    ← Back to Store
                </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-800 bg-slate-900/50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex gap-1">
                        {tabs.map(({ id, label, icon: Icon }) => (
                            <button key={id} onClick={() => setActiveTab(id)}
                                className={`flex items-center gap-2 px-5 py-4 text-sm font-semibold border-b-2 transition-colors ${activeTab === id
                                        ? 'border-indigo-500 text-white'
                                        : 'border-transparent text-slate-500 hover:text-slate-300'
                                    }`}>
                                <Icon className="w-4 h-4" />
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <AnimatePresence mode="wait">
                    <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                        {activeTab === 'products' && (
                            <ProductsTab categories={categories} vendors={approvedVendors} showToast={showToast} />
                        )}
                        {activeTab === 'categories' && (
                            <CategoriesTab categories={categories} onCategoriesChange={fetchSharedData} showToast={showToast} />
                        )}
                        {activeTab === 'vendors' && (
                            <VendorsTab showToast={showToast} />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AdminPanel;

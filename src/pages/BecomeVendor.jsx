


























// import { useState, useEffect } from 'react';
// import { useUser } from '../context/UserContext';
// import { useNavigate } from 'react-router-dom';
// import { supabase } from '../supabaseClient';
// import { api } from '../services/api';
// import { Store, Upload, Clock, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
// import { motion } from 'framer-motion';

// const BecomeVendor = () => {
//   const { user } = useUser();
//   const navigate = useNavigate();

//   const [vendor, setVendor] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError] = useState('');
//   const [qrFile, setQrFile] = useState(null);
//   const [qrPreview, setQrPreview] = useState('');
//   const [form, setForm] = useState({ name: '', description: '', phone: '', email: '', address: '' });

//   useEffect(() => {
//     if (user === null) { navigate('/login'); return; }
//     if (!user) return;

//     const checkVendor = async () => {
//       const data = await api.vendors.getByUser(user.id);
//       setVendor(data);
//       setLoading(false);
//     };
//     checkVendor();
//   }, [user, navigate]);

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     setQrFile(file);
//     setQrPreview(URL.createObjectURL(file));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!qrFile) { setError('Please upload your QR code image.'); return; }
//     setSubmitting(true);
//     setError('');

//     try {
//       const fileName = `qr-codes/${user.id}-${Math.random()}.${qrFile.name.split('.').pop()}`;
//       const { error: uploadError } = await supabase.storage
//         .from('vendor-qrs')
//         .upload(fileName, qrFile, { upsert: true });
//       if (uploadError) throw uploadError;

//       const { data: { publicUrl } } = supabase.storage
//         .from('vendor-qrs')
//         .getPublicUrl(fileName);

//       const newVendor = await api.vendors.create({
//         name: form.name,
//         description: form.description,
//         phone: form.phone,
//         email: form.email,
//         address: form.address,
//         qr_code_url: publicUrl,
//         user_id: user.id, // Correct property name passed to DB insert
//       });

//       setVendor(newVendor);
//     } catch (err) {
//       setError(err.message);
//     }
//     setSubmitting(false);
//   };

//   if (loading) return (
//     <div className="min-h-screen bg-slate-950 flex items-center justify-center">
//       <div className="text-slate-400 animate-pulse">Checking vendor status...</div>
//     </div>
//   );

//   if (vendor) {
//     const statusConfig = {
//       pending: { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', label: 'Application Pending', msg: 'Your application is under review. We\'ll notify you once approved.' },
//       approved: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', label: 'Approved Vendor', msg: 'Congratulations! You\'re an approved vendor on Aura.' },
//       rejected: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', label: 'Application Rejected', msg: 'Your application was not approved. Please contact support.' },
//     };
//     const s = statusConfig[vendor.status] || statusConfig.pending;
//     const Icon = s.icon;

//     return (
//       <motion.div
//         initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
//         className="min-h-screen bg-slate-950 flex items-center justify-center px-4"
//       >
//         <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center shadow-2xl">
//           <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full border ${s.bg} mb-6`}>
//             <Icon className={`w-8 h-8 ${s.color}`} />
//           </div>
//           <h2 className="text-2xl font-bold text-white mb-2">{s.label}</h2>
//           <p className="text-slate-400 mb-2">{s.msg}</p>
//           <p className="text-slate-500 text-sm mb-6">Vendor: <span className="text-white font-semibold">{vendor.name}</span></p>
//           {vendor.qr_code_url && (
//             <div className="mb-6">
//               <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Your QR Code</p>
//               <img src={vendor.qr_code_url} alt="QR" className="w-32 h-32 object-contain mx-auto rounded-xl border border-slate-700 bg-white p-2" />
//             </div>
//           )}
//           <button onClick={() => navigate('/')} className="text-indigo-400 hover:text-indigo-300 text-sm font-medium">
//             ← Back to Store
//           </button>
//         </div>
//       </motion.div>
//     );
//   }

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
//       className="min-h-screen bg-slate-950 px-4 py-16"
//     >
//       <div className="max-w-xl mx-auto">
//         <button onClick={() => navigate(-1)} className="flex items-center text-slate-400 hover:text-white text-sm mb-8 transition-colors">
//           <ArrowLeft className="w-4 h-4 mr-2" /> Back
//         </button>

//         <div className="text-center mb-10">
//           <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl mb-4">
//             <Store className="w-8 h-8 text-indigo-400" />
//           </div>
//           <h1 className="text-3xl font-bold text-white mb-2">Become a Vendor</h1>
//           <p className="text-slate-400">Join Aura's marketplace and start selling your products.</p>
//         </div>

//         <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl">
//           <form onSubmit={handleSubmit} className="space-y-5">

//             <div>
//               <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Vendor / Shop Name</label>
//               <input
//                 type="text" required value={form.name}
//                 onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
//                 className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
//                 placeholder="e.g. Craft Home Studio"
//               />
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Contact Phone</label>
//                 <input
//                   type="tel" required value={form.phone}
//                   onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))}
//                   className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
//                   placeholder="+91 9876543210"
//                 />
//               </div>
//               <div>
//                 <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Email (For Updates)</label>
//                 <input
//                   type="email" required value={form.email}
//                   onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
//                   className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
//                   placeholder="shop@example.com"
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Business Address</label>
//               <input
//                 type="text" required value={form.address}
//                 onChange={(e) => setForm(p => ({ ...p, address: e.target.value }))}
//                 className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
//                 placeholder="123 Market Street, City, State, ZIP"
//               />
//             </div>

//             <div>
//               <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Description</label>
//               <textarea
//                 value={form.description} rows={3}
//                 onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
//                 className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-600 resize-none"
//                 placeholder="Tell us about your products and store..."
//               />
//             </div>

//             <div>
//               <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Payment QR Code</label>
//               <p className="text-xs text-slate-500 mb-3">Upload your UPI / bank QR code. Customers will scan this to pay you directly.</p>

//               <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl cursor-pointer transition-colors bg-slate-950 hover:bg-slate-900">
//                 {qrPreview ? (
//                   <img src={qrPreview} alt="QR Preview" className="h-full w-auto object-contain p-2 rounded-xl" />
//                 ) : (
//                   <div className="flex flex-col items-center text-slate-500">
//                     <Upload className="w-8 h-8 mb-2" />
//                     <span className="text-sm font-medium">Click to upload QR image</span>
//                     <span className="text-xs mt-1">PNG, JPG up to 5MB</span>
//                   </div>
//                 )}
//                 <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
//               </label>
//             </div>

//             {error && (
//               <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>
//             )}

//             <motion.button
//               whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
//               type="submit" disabled={submitting}
//               className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-indigo-600/20"
//             >
//               {submitting ? 'Submitting Application...' : 'Apply to Become a Vendor'}
//             </motion.button>
//           </form>
//         </div>

//         <p className="text-center text-xs text-slate-500 mt-6">
//           Applications are reviewed within 24-48 hours. You'll be notified via email.
//         </p>
//       </div>
//     </motion.div>
//   );
// };

// export default BecomeVendor;


import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { api } from '../services/api';
import { Store, Upload, Clock, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const BecomeVendor = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [qrFile, setQrFile] = useState(null);
  const [qrPreview, setQrPreview] = useState('');
  const [form, setForm] = useState({ name: '', description: '', phone: '', email: '', address: '' });
  const [isReapplying, setIsReapplying] = useState(false);

  useEffect(() => {
    if (user === null) { navigate('/login'); return; }
    if (!user) return;

    const checkVendor = async () => {
      // ✅ Uses user_id (uuid) not vendor_id (integer)
      const data = await api.vendors.getByUser(user.id);
      setVendor(data);
      setLoading(false);
    };
    checkVendor();
  }, [user, navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setQrFile(file);
    setQrPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!qrFile && !qrPreview) { setError('Please upload your QR code image.'); return; }
    setSubmitting(true);
    setError('');

    try {
      let publicUrl = qrPreview; // Use existing if no new file

      if (qrFile) {
        const ext = qrFile.name.split('.').pop();
        const fileName = `qr-codes/${user.id}-${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('vendor-qrs')
          .upload(fileName, qrFile, { upsert: true });
        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('vendor-qrs')
          .getPublicUrl(fileName);
        publicUrl = data.publicUrl;
      }

      let updatedVendor;
      if (isReapplying && vendor) {
        // ✅ Updates existing rejected vendor back to pending
        updatedVendor = await api.vendors.updateApplication(vendor.vendor_id, {
          name: form.name,
          description: form.description,
          phone: form.phone,
          email: form.email,
          address: form.address,
          qr_code_url: publicUrl,
        });
        setIsReapplying(false);
      } else {
        // ✅ Creates a fresh application
        updatedVendor = await api.vendors.create({
          name: form.name,
          description: form.description,
          phone: form.phone,
          email: form.email,
          address: form.address,
          qr_code_url: publicUrl,
          userId: user.id,
        });
      }

      setVendor(updatedVendor);
    } catch (err) {
      setError(err.message);
    }
    setSubmitting(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-slate-400 animate-pulse">Checking vendor status...</div>
    </div>
  );

  // Already a vendor — show status
  if (vendor && !isReapplying) {
    const statusConfig = {
      pending: { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', label: 'Application Pending', msg: "Your application is under review. We'll notify you once approved." },
      approved: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', label: 'Approved Vendor', msg: 'Congratulations! You\'re an approved vendor on Aura.' },
      rejected: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', label: 'Application Rejected', msg: 'Your application was not approved. Please contact support.' },
      dismissed: { icon: XCircle, color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/20', label: 'Shop Dismissed', msg: 'Your shop has been closed.' },
    };
    const s = statusConfig[vendor.status] || statusConfig.pending;
    const Icon = s.icon;

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="min-h-screen bg-slate-950 flex items-center justify-center px-4"
      >
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center shadow-2xl">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full border ${s.bg} mb-6`}>
            <Icon className={`w-8 h-8 ${s.color}`} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{s.label}</h2>
          <p className="text-slate-400 mb-2">{s.msg}</p>
          <p className="text-slate-500 text-sm mb-6">Shop: <span className="text-white font-semibold">{vendor.name}</span></p>

          {vendor.status === 'approved' && (
            <button
              onClick={() => navigate('/vendor-dashboard')}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all mb-4"
            >
              Go to Vendor Dashboard
            </button>
          )}

          {vendor.status === 'rejected' && (
            <button
              onClick={() => {
                setIsReapplying(true);
                setForm({ 
                  name: vendor.name || '', 
                  description: vendor.description || '',
                  phone: vendor.phone || '',
                  email: vendor.email || '',
                  address: vendor.address || ''
                });
                if (vendor.qr_code_url) setQrPreview(vendor.qr_code_url);
              }}
              className="w-full bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 font-bold py-3 rounded-xl transition-all mb-4"
            >
              Re-Apply
            </button>
          )}

          {vendor.qr_code_url && (
            <div className="mb-6">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Your QR Code</p>
              <img src={vendor.qr_code_url} alt="QR" className="w-32 h-32 object-contain mx-auto rounded-xl border border-slate-700 bg-white p-2" />
            </div>
          )}

          <button onClick={() => navigate('/')} className="text-indigo-400 hover:text-indigo-300 text-sm font-medium">
            ← Back to Store
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-slate-950 px-4 py-16"
    >
      <div className="max-w-xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center text-slate-400 hover:text-white text-sm mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </button>

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl mb-4">
            <Store className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Become a Vendor</h1>
          <p className="text-slate-400">Join Aura's marketplace and start selling your products.</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Vendor / Shop Name</label>
              <input type="text" required value={form.name}
                onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
                placeholder="e.g. Craft Home Studio" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Contact Phone</label>
                <input type="tel" required value={form.phone}
                  onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
                  placeholder="+91 9876543210" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Email (For Updates)</label>
                <input type="email" required value={form.email}
                  onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
                  placeholder="shop@example.com" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Business Address</label>
              <input type="text" required value={form.address}
                onChange={(e) => setForm(p => ({ ...p, address: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
                placeholder="123 Market Street, City, State, ZIP" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Description</label>
              <textarea value={form.description} rows={3}
                onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-600 resize-none"
                placeholder="Tell us about your products and store..." />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Payment QR Code</label>
              <p className="text-xs text-slate-500 mb-3">Upload your UPI / bank QR code. Customers will scan this to pay you directly.</p>
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl cursor-pointer transition-colors bg-slate-950 hover:bg-slate-900">
                {qrPreview ? (
                  <img src={qrPreview} alt="QR Preview" className="h-full w-auto object-contain p-2 rounded-xl" />
                ) : (
                  <div className="flex flex-col items-center text-slate-500">
                    <Upload className="w-8 h-8 mb-2" />
                    <span className="text-sm font-medium">Click to upload QR image</span>
                    <span className="text-xs mt-1">PNG, JPG up to 5MB</span>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>
            )}

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              type="submit" disabled={submitting}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-indigo-600/20"
            >
              {submitting ? 'Submitting Application...' : 'Apply to Become a Vendor'}
            </motion.button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          Applications are reviewed within 24-48 hours.
        </p>
      </div>
    </motion.div>
  );
};

export default BecomeVendor;
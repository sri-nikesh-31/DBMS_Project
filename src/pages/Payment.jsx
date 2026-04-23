










































import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import { Lock, CheckCircle, QrCode, Store } from 'lucide-react';
import { motion } from 'framer-motion';

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, cartTotal, clearCart } = useCart();
  const { orderData, grandTotal } = location.state || {};

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const vendorName = cart[0]?.vendors?.name || cart[0]?.vendor_name || null;
  const vendorQR = cart[0]?.vendors?.qr_code_url || cart[0]?.vendor_qr || null;

  const total = grandTotal || cartTotal;

  const handleConfirm = async () => {
    setProcessing(true);
    setError('');
    try {
      const result = await api.orders.create(cart, total, orderData);
      await api.payments.create(result.order_id);
      clearCart();
      navigate('/orders', { state: { success: true, orderId: result.order_id } });
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    }
    setProcessing(false);
  };

  if (!cart || cart.length === 0) {
    return (
      <div className="text-center py-24 text-white">
        <p className="text-xl font-bold mb-4">No order found.</p>
        <button onClick={() => navigate('/cart')} className="text-indigo-400 hover:text-indigo-300">← Return to Cart</button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12"
    >
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl mb-4">
            <Lock className="w-6 h-6 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Complete Payment</h1>
          <p className="text-slate-400 text-sm mt-1">Scan the QR code to pay directly to the vendor</p>
        </div>

        <div className="grid grid-cols-1 gap-6">

          {/* QR Code Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center">
            {vendorQR ? (
              <>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Store className="w-4 h-4 text-indigo-400" />
                  <p className="text-sm font-semibold text-white">Sold by <span className="text-indigo-400">{vendorName || 'Vendor'}</span></p>
                </div>
                <div className="inline-block bg-white rounded-2xl p-4 mb-4 shadow-xl">
                  <img src={vendorQR} alt="Payment QR" className="w-48 h-48 object-contain" />
                </div>
                <p className="text-emerald-400 text-sm font-semibold mb-1">📱 Scan to Pay</p>
                <p className="text-slate-500 text-xs">Use any UPI app — GPay, PhonePe, Paytm, etc.</p>
                <div className="mt-4 bg-indigo-600/10 border border-indigo-500/20 rounded-xl px-4 py-3">
                  <p className="text-indigo-300 text-sm font-bold">Amount to Pay: ₹{total?.toFixed(2)}</p>
                </div>
              </>
            ) : vendorName ? (
                  <div className="py-8 border-t border-slate-800">
                    <QrCode className="w-16 h-16 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm">
                      "{vendorName}" hasn't uploaded a QR code yet.
                    </p>
                    <p className="text-slate-600 text-xs mt-1">You can still confirm the order and arrange payment separately.</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-center gap-2 mb-4 mt-6">
                      <Store className="w-4 h-4 text-emerald-400" />
                      <p className="text-sm font-semibold text-white">Sold by <span className="text-emerald-400">Aura Global Store</span></p>
                    </div>
                    <div className="inline-block bg-white rounded-2xl p-4 mb-4 shadow-xl">
                      {/* Placeholder Store QR */}
                      <img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=pay:aurastore@upi" alt="Aura Store QR" className="w-48 h-48 object-contain" />
                    </div>
                    <p className="text-emerald-400 text-sm font-semibold mb-1">📱 Scan to Pay Aura Store</p>
                    <p className="text-slate-500 text-xs">Direct Platform Central Payment</p>
                    <div className="mt-4 bg-indigo-600/10 border border-indigo-500/20 rounded-xl px-4 py-3 mb-6">
                      <p className="text-indigo-300 text-sm font-bold">Amount to Pay: ₹{total?.toFixed(2)}</p>
                    </div>
                  </>
                )}
          </div>

          {/* Order Summary */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-4">Order Summary</p>
            <div className="space-y-3 mb-4">
              {cart.map(item => (
                <div key={item.product_id} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-800 overflow-hidden border border-slate-700 flex-shrink-0">
                      <img src={item.image_url || 'https://via.placeholder.com/40'} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-slate-300 line-clamp-1">{item.name} <span className="text-slate-500">×{item.quantity}</span></span>
                  </div>
                  <span className="text-white font-semibold ml-4 flex-shrink-0">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-800 pt-3 flex justify-between">
              <span className="font-bold text-white">Total</span>
              <span className="font-bold text-indigo-400 text-lg">₹{total?.toFixed(2)}</span>
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>
          )}

          {/* Confirm Button */}
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: '0px 0px 20px rgba(99,102,241,0.4)' }}
            whileTap={{ scale: 0.97 }}
            onClick={handleConfirm}
            disabled={processing}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
          >
            {processing ? (
              <span className="animate-pulse">Processing...</span>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                I've Paid — Confirm Order
              </>
            )}
          </motion.button>

          <p className="text-center text-xs text-slate-500 flex items-center justify-center gap-1">
            <Lock className="w-3 h-3" /> Secured with 256-bit encryption
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default Payment;

// // // import { useState, useEffect } from 'react';
// // // import { api } from '../services/api';
// // // import { Package, Truck, CheckCircle, ChevronRight, Eye } from 'lucide-react';
// // // import { Link } from 'react-router-dom';

// // // const Orders = () => {
// // //   const [orders, setOrders] = useState([]);
// // //   const [loading, setLoading] = useState(true);
// // //   const [selectedOrder, setSelectedOrder] = useState(null);

// // //   useEffect(() => {
// // //     const fetchOrders = async () => {
// // //       const data = await api.orders.getAll();
// // //       setOrders(data);
// // //       setLoading(false);
// // //     };
// // //     fetchOrders();
// // //   }, []);

// // //   const getStatusColor = (status) => {
// // //     switch (status) {
// // //       case 'Delivered': return 'text-emerald-400 bg-emerald-900/30 border-emerald-800';
// // //       case 'Shipped': return 'text-indigo-400 bg-indigo-900/30 border-indigo-800';
// // //       case 'Processing': return 'text-amber-400 bg-amber-900/30 border-amber-800';
// // //       default: return 'text-slate-400 bg-slate-900 border-slate-800';
// // //     }
// // //   };

// // //   if (loading) return <div className="text-center py-24">Loading orders...</div>;

// // //   return (
// // //     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
// // //       <h1 className="text-3xl font-bold text-white mb-8">Order History</h1>

// // //       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

// // //         {/* Orders List */}
// // //         <div className="lg:col-span-1 space-y-4">
// // //           {orders.map(order => (
// // //             <button 
// // //               key={order.id}
// // //               onClick={() => setSelectedOrder(order.id)}
// // //               className={`w-full text-left p-6 rounded-2xl border transition-all ${selectedOrder === order.id ? 'border-indigo-500 bg-indigo-900/20 shadow-md ring-1 ring-indigo-500' : 'border-slate-800 bg-slate-900 hover:border-indigo-500/50'}`}
// // //             >
// // //               <div className="flex justify-between items-start mb-2">
// // //                 <span className="font-bold text-white">{order.id}</span>
// // //                 <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getStatusColor(order.status)}`}>
// // //                   {order.status}
// // //                 </span>
// // //               </div>
// // //               <p className="text-sm text-slate-400 mb-4">{new Date(order.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
// // //               <div className="flex justify-between items-center text-sm">
// // //                 <span className="font-semibold text-white">${order.total.toFixed(2)}</span>
// // //                 <span className="text-slate-500 flex items-center group-hover:text-indigo-400">Details <ChevronRight className="w-4 h-4 ml-1" /></span>
// // //               </div>
// // //             </button>
// // //           ))}
// // //         </div>

// // //         {/* Order Details & Tracking */}
// // //         <div className="lg:col-span-2">
// // //           {selectedOrder ? (
// // //             <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-sm">
// // //               <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-6">
// // //                 <div>
// // //                   <h2 className="text-2xl font-bold text-white">Order {selectedOrder}</h2>
// // //                   <p className="text-sm text-slate-400 mt-1">Tracking Number: <span className="font-mono text-slate-300">{orders.find(o => o.id === selectedOrder)?.trackingNumber}</span></p>
// // //                 </div>
// // //                 <button className="px-4 py-2 text-sm font-semibold text-indigo-400 bg-indigo-900/30 rounded-lg hover:bg-indigo-900/50 transition-colors">
// // //                   Download Invoice
// // //                 </button>
// // //               </div>

// // //               {/* Tracking Pipeline */}
// // //               <div className="mb-12 relative">
// // //                 <div className="absolute top-5 left-8 right-8 h-1 bg-slate-800 -z-10 rounded-full">
// // //                    <div className={`h-full bg-indigo-500 rounded-full transition-all duration-1000 ${
// // //                      orders.find(o => o.id === selectedOrder)?.status === 'Delivered' ? 'w-full' :
// // //                      orders.find(o => o.id === selectedOrder)?.status === 'Shipped' ? 'w-1/2' : 'w-0'
// // //                    }`}></div>
// // //                 </div>
// // //                 <div className="flex justify-between relative z-10">
// // //                   <div className="flex flex-col items-center">
// // //                     <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg border-4 border-slate-900">
// // //                       <Package className="w-4 h-4" />
// // //                     </div>
// // //                     <span className="text-xs font-bold text-white mt-3">Processing</span>
// // //                   </div>
// // //                   <div className="flex flex-col items-center">
// // //                     <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-slate-900 shadow-md transition-colors duration-500 ${['Shipped', 'Delivered'].includes(orders.find(o => o.id === selectedOrder)?.status) ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'}`}>
// // //                       <Truck className="w-4 h-4" />
// // //                     </div>
// // //                     <span className={`text-xs font-bold mt-3 ${['Shipped', 'Delivered'].includes(orders.find(o => o.id === selectedOrder)?.status) ? 'text-white' : 'text-slate-500'}`}>Shipped</span>
// // //                   </div>
// // //                   <div className="flex flex-col items-center">
// // //                     <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-slate-900 shadow-md transition-colors duration-500 ${orders.find(o => o.id === selectedOrder)?.status === 'Delivered' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'}`}>
// // //                       <CheckCircle className="w-5 h-5" />
// // //                     </div>
// // //                     <span className={`text-xs font-bold mt-3 ${orders.find(o => o.id === selectedOrder)?.status === 'Delivered' ? 'text-white' : 'text-slate-500'}`}>Delivered</span>
// // //                   </div>
// // //                 </div>
// // //               </div>

// // //               {/* Items */}
// // //               <h3 className="text-lg font-bold text-white mb-4">Items Summary</h3>
// // //               <div className="space-y-4">
// // //                 {orders.find(o => o.id === selectedOrder)?.items.map((item, idx) => (
// // //                   <div key={idx} className="flex items-center gap-4 py-4 border-b border-slate-800 last:border-0">
// // //                     <div className="w-16 h-16 bg-slate-800 rounded-xl overflow-hidden flex-shrink-0">
// // //                       <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
// // //                     </div>
// // //                     <div className="flex-grow">
// // //                       <Link to={`/product/${item.productId}`} className="font-semibold text-slate-200 hover:text-indigo-400 transition-colors line-clamp-1">{item.name}</Link>
// // //                       <p className="text-sm text-slate-400">Qty: {item.quantity}</p>
// // //                     </div>
// // //                     <div className="font-semibold text-white">
// // //                       ${(item.price * item.quantity).toFixed(2)}
// // //                     </div>
// // //                   </div>
// // //                 ))}
// // //               </div>
// // //             </div>
// // //           ) : (
// // //             <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 text-center h-full flex flex-col items-center justify-center text-slate-500">
// // //               <Eye className="w-12 h-12 mb-4 text-slate-700" />
// // //               <p>Select an order from the list to view details and tracking.</p>
// // //             </div>
// // //           )}
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // };

// // // export default Orders;


// // import { useState, useEffect } from 'react';
// // import { api } from '../services/api';
// // import { Package, Truck, CheckCircle, ChevronRight, Eye } from 'lucide-react';
// // import { Link } from 'react-router-dom';

// // const Orders = () => {
// //   const [orders, setOrders] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [selectedOrderId, setSelectedOrderId] = useState(null);

// //   useEffect(() => {
// //     const fetchOrders = async () => {
// //       try {
// //         const data = await api.orders.getAll();
// //         setOrders(data || []);
// //       } catch (err) {
// //         console.error('Failed to fetch orders:', err);
// //       }
// //       setLoading(false);
// //     };
// //     fetchOrders();
// //   }, []);

// //   const getStatusColor = (status) => {
// //     switch (status) {
// //       case 'Delivered': return 'text-emerald-400 bg-emerald-900/30 border-emerald-800';
// //       case 'Shipped': return 'text-indigo-400 bg-indigo-900/30 border-indigo-800';
// //       case 'Processing': return 'text-amber-400 bg-amber-900/30 border-amber-800';
// //       default: return 'text-slate-400 bg-slate-900 border-slate-800';
// //     }
// //   };

// //   const selectedOrder = orders.find(o => o.order_id === selectedOrderId);

// //   // Compute order total from order_items
// //   const getOrderTotal = (order) => {
// //     if (!order?.order_items) return 0;
// //     return order.order_items.reduce((sum, item) => {
// //       const price = item.products?.price || item.unit_price || 0;
// //       return sum + price * (item.quantity || 1);
// //     }, 0);
// //   };

// //   if (loading) return (
// //     <div className="text-center py-24 text-slate-400 animate-pulse">Loading orders...</div>
// //   );

// //   if (orders.length === 0) return (
// //     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center text-slate-500">
// //       <Package className="w-12 h-12 mx-auto mb-4 text-slate-700" />
// //       <p className="text-lg font-semibold text-white mb-2">No orders yet</p>
// //       <p className="text-sm">Your order history will appear here.</p>
// //     </div>
// //   );

// //   return (
// //     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
// //       <h1 className="text-3xl font-bold text-white mb-8">Order History</h1>

// //       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

// //         {/* Orders List */}
// //         <div className="lg:col-span-1 space-y-4">
// //           {orders.map(order => (
// //             <button
// //               key={order.order_id}
// //               onClick={() => setSelectedOrderId(order.order_id)}
// //               className={`w-full text-left p-6 rounded-2xl border transition-all ${selectedOrderId === order.order_id
// //                   ? 'border-indigo-500 bg-indigo-900/20 shadow-md ring-1 ring-indigo-500'
// //                   : 'border-slate-800 bg-slate-900 hover:border-indigo-500/50'
// //                 }`}
// //             >
// //               <div className="flex justify-between items-start mb-2">
// //                 <span className="font-bold text-white text-sm">#{order.order_id}</span>
// //                 <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getStatusColor(order.status)}`}>
// //                   {order.status || 'Processing'}
// //                 </span>
// //               </div>
// //               <p className="text-sm text-slate-400 mb-4">
// //                 {order.created_at
// //                   ? new Date(order.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
// //                   : '—'}
// //               </p>
// //               <div className="flex justify-between items-center text-sm">
// //                 <span className="font-semibold text-white">₹{getOrderTotal(order).toFixed(2)}</span>
// //                 <span className="text-slate-500 flex items-center">
// //                   Details <ChevronRight className="w-4 h-4 ml-1" />
// //                 </span>
// //               </div>
// //             </button>
// //           ))}
// //         </div>

// //         {/* Order Details & Tracking */}
// //         <div className="lg:col-span-2">
// //           {selectedOrder ? (
// //             <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-sm">

// //               {/* Header */}
// //               <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-6">
// //                 <div>
// //                   <h2 className="text-2xl font-bold text-white">Order #{selectedOrder.order_id}</h2>
// //                   <p className="text-sm text-slate-400 mt-1">
// //                     Placed on{' '}
// //                     {selectedOrder.created_at
// //                       ? new Date(selectedOrder.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
// //                       : '—'}
// //                   </p>
// //                 </div>
// //                 <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${getStatusColor(selectedOrder.status)}`}>
// //                   {selectedOrder.status || 'Processing'}
// //                 </span>
// //               </div>

// //               {/* Tracking Pipeline */}
// //               <div className="mb-12 relative">
// //                 <div className="absolute top-5 left-8 right-8 h-1 bg-slate-800 -z-10 rounded-full">
// //                   <div className={`h-full bg-indigo-500 rounded-full transition-all duration-1000 ${selectedOrder.status === 'Delivered' ? 'w-full' :
// //                       selectedOrder.status === 'Shipped' ? 'w-1/2' : 'w-0'
// //                     }`} />
// //                 </div>
// //                 <div className="flex justify-between relative z-10">
// //                   {/* Processing */}
// //                   <div className="flex flex-col items-center">
// //                     <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg border-4 border-slate-900">
// //                       <Package className="w-4 h-4" />
// //                     </div>
// //                     <span className="text-xs font-bold text-white mt-3">Processing</span>
// //                   </div>
// //                   {/* Shipped */}
// //                   <div className="flex flex-col items-center">
// //                     <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-slate-900 shadow-md transition-colors duration-500 ${['Shipped', 'Delivered'].includes(selectedOrder.status)
// //                         ? 'bg-indigo-600 text-white'
// //                         : 'bg-slate-800 text-slate-500'
// //                       }`}>
// //                       <Truck className="w-4 h-4" />
// //                     </div>
// //                     <span className={`text-xs font-bold mt-3 ${['Shipped', 'Delivered'].includes(selectedOrder.status) ? 'text-white' : 'text-slate-500'
// //                       }`}>Shipped</span>
// //                   </div>
// //                   {/* Delivered */}
// //                   <div className="flex flex-col items-center">
// //                     <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-slate-900 shadow-md transition-colors duration-500 ${selectedOrder.status === 'Delivered'
// //                         ? 'bg-indigo-600 text-white'
// //                         : 'bg-slate-800 text-slate-500'
// //                       }`}>
// //                       <CheckCircle className="w-5 h-5" />
// //                     </div>
// //                     <span className={`text-xs font-bold mt-3 ${selectedOrder.status === 'Delivered' ? 'text-white' : 'text-slate-500'
// //                       }`}>Delivered</span>
// //                   </div>
// //                 </div>
// //               </div>

// //               {/* Items */}
// //               <h3 className="text-lg font-bold text-white mb-4">Items Summary</h3>
// //               <div className="space-y-4">
// //                 {(selectedOrder.order_items || []).length === 0 ? (
// //                   <p className="text-slate-500 text-sm">No items found for this order.</p>
// //                 ) : (
// //                   (selectedOrder.order_items || []).map((item, idx) => (
// //                     <div key={idx} className="flex items-center gap-4 py-4 border-b border-slate-800 last:border-0">
// //                       <div className="w-16 h-16 bg-slate-800 rounded-xl overflow-hidden flex-shrink-0">
// //                         <img
// //                           src={item.products?.image_url || 'https://via.placeholder.com/64'}
// //                           alt={item.products?.name}
// //                           className="w-full h-full object-cover"
// //                         />
// //                       </div>
// //                       <div className="flex-grow">
// //                         <Link
// //                           to={`/product/${item.product_id}`}
// //                           className="font-semibold text-slate-200 hover:text-indigo-400 transition-colors line-clamp-1"
// //                         >
// //                           {item.products?.name || 'Product'}
// //                         </Link>
// //                         <p className="text-sm text-slate-400">Qty: {item.quantity}</p>
// //                       </div>
// //                       <div className="font-semibold text-white">
// //                         ₹{((item.products?.price || item.unit_price || 0) * item.quantity).toFixed(2)}
// //                       </div>
// //                     </div>
// //                   ))
// //                 )}
// //               </div>

// //               {/* Total */}
// //               <div className="mt-6 pt-6 border-t border-slate-800 flex justify-between items-center">
// //                 <span className="text-lg font-bold text-white">Order Total</span>
// //                 <span className="text-2xl font-bold text-indigo-400">₹{getOrderTotal(selectedOrder).toFixed(2)}</span>
// //               </div>

// //             </div>
// //           ) : (
// //             <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 text-center h-full flex flex-col items-center justify-center text-slate-500">
// //               <Eye className="w-12 h-12 mb-4 text-slate-700" />
// //               <p>Select an order from the list to view details and tracking.</p>
// //             </div>
// //           )}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default Orders;


// import { useState, useEffect } from 'react';
// import { api } from '../services/api';
// import { Package, Truck, CheckCircle, ChevronRight, Eye } from 'lucide-react';
// import { Link } from 'react-router-dom';

// const Orders = () => {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedOrderId, setSelectedOrderId] = useState(null);

//   useEffect(() => {
//     const fetchOrders = async () => {
//       try {
//         const data = await api.orders.getAll();
//         setOrders(data || []);
//       } catch (err) {
//         console.error('Failed to fetch orders:', err);
//       }
//       setLoading(false);
//     };
//     fetchOrders();
//   }, []);

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'Delivered': return 'text-emerald-400 bg-emerald-900/30 border-emerald-800';
//       case 'Shipped': return 'text-indigo-400 bg-indigo-900/30 border-indigo-800';
//       case 'Processing': return 'text-amber-400 bg-amber-900/30 border-amber-800';
//       case 'Pending': return 'text-yellow-400 bg-yellow-900/30 border-yellow-800';
//       case 'Cancelled': return 'text-red-400 bg-red-900/30 border-red-800';
//       default: return 'text-slate-400 bg-slate-900 border-slate-800';
//     }
//   };

//   const selectedOrder = orders.find(o => o.order_id === selectedOrderId);

//   const getOrderTotal = (order) => {
//     if (order?.total_amount && order.total_amount > 0) return order.total_amount;
//     return (order?.order_items || []).reduce((sum, item) => {
//       const price = item.price || item.products?.price || 0;
//       return sum + price * (item.quantity || 1);
//     }, 0);
//   };

//   const handleCancelOrder = async (orderId) => {
//     if (!window.confirm("Are you sure you want to cancel this order?")) return;
//     try {
//       await api.orders.updateStatus(orderId, 'Cancelled');
//       setOrders(prev => prev.map(o => o.order_id === orderId ? { ...o, status: 'Cancelled' } : o));
//     } catch (error) {
//       console.error('Failed to cancel order:', error);
//       alert('Failed to cancel order.');
//     }
//   };

//   if (loading) return (
//     <div className="text-center py-24 text-slate-400 animate-pulse">Loading orders...</div>
//   );

//   if (orders.length === 0) return (
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center text-slate-500">
//       <Package className="w-12 h-12 mx-auto mb-4 text-slate-700" />
//       <p className="text-lg font-semibold text-white mb-2">No orders yet</p>
//       <p className="text-sm">Your order history will appear here.</p>
//     </div>
//   );

//   return (
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//       <h1 className="text-3xl font-bold text-white mb-8">Order History</h1>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

//         {/* Orders List */}
//         <div className="lg:col-span-1 space-y-4">
//           {orders.map(order => (
//             <button
//               key={order.order_id}
//               onClick={() => setSelectedOrderId(order.order_id)}
//               className={`w-full text-left p-6 rounded-2xl border transition-all ${selectedOrderId === order.order_id
//                   ? 'border-indigo-500 bg-indigo-900/20 shadow-md ring-1 ring-indigo-500'
//                   : 'border-slate-800 bg-slate-900 hover:border-indigo-500/50'
//                 }`}
//             >
//               <div className="flex justify-between items-start mb-2">
//                 <span className="font-bold text-white text-sm">#{order.order_id}</span>
//                 <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${getStatusColor(order.status)}`}>
//                   {order.status || 'Pending'}
//                 </span>
//               </div>
//               <p className="text-sm text-slate-400 mb-4">
//                 {order.order_date
//                   ? new Date(order.order_date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
//                   : '—'}
//               </p>
//               <div className="flex justify-between items-center text-sm">
//                 <span className="font-semibold text-white">₹{getOrderTotal(order).toFixed(2)}</span>
//                 <span className="text-slate-500 flex items-center">
//                   Details <ChevronRight className="w-4 h-4 ml-1" />
//                 </span>
//               </div>
//             </button>
//           ))}
//         </div>

//         {/* Order Details & Tracking */}
//         <div className="lg:col-span-2">
//           {selectedOrder ? (
//             <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-sm">

//               {/* Header */}
//               <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-6">
//                 <div>
//                   <h2 className="text-2xl font-bold text-white">Order #{selectedOrder.order_id}</h2>
//                   <p className="text-sm text-slate-400 mt-1">
//                     Placed on{' '}
//                     {selectedOrder.order_date
//                       ? new Date(selectedOrder.order_date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
//                       : '—'}
//                   </p>
//                 </div>
//                 <div className="flex items-center gap-4">
//                   {selectedOrder.status === 'Pending' && (
//                     <button onClick={() => handleCancelOrder(selectedOrder.order_id)} className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold px-3 py-1.5 rounded-lg border border-red-500/20 transition-colors">
//                       Cancel Order
//                     </button>
//                   )}
//                   <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${getStatusColor(selectedOrder.status)}`}>
//                     {selectedOrder.status || 'Pending'}
//                   </span>
//                 </div>
//               </div>

//               {/* Tracking Pipeline */}
//               <div className="mb-12 relative">
//                 <div className="absolute top-5 left-8 right-8 h-1 bg-slate-800 -z-10 rounded-full">
//                   <div className={`h-full bg-indigo-500 rounded-full transition-all duration-1000 ${selectedOrder.status === 'Delivered' ? 'w-full' :
//                       selectedOrder.status === 'Shipped' ? 'w-1/2' :
//                         selectedOrder.status === 'Processing' ? 'w-1/4' : 'w-0'
//                     }`} />
//                 </div>
//                 {selectedOrder.status === 'Cancelled' ? (
//                   <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
//                     <p className="text-red-400 font-bold text-lg">Order Cancelled</p>
//                     <p className="text-slate-400 text-sm mt-1">This order has been cancelled and will not be processed.</p>
//                   </div>
//                 ) : (
//                 <div className="flex justify-between relative z-10">
//                   <div className="flex flex-col items-center">
//                     <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg border-4 border-slate-900">
//                       <Package className="w-4 h-4" />
//                     </div>
//                     <span className="text-xs font-bold text-white mt-3">Processing</span>
//                   </div>
//                   <div className="flex flex-col items-center">
//                     <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-slate-900 shadow-md transition-colors duration-500 ${['Shipped', 'Delivered'].includes(selectedOrder.status)
//                         ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'
//                       }`}>
//                       <Truck className="w-4 h-4" />
//                     </div>
//                     <span className={`text-xs font-bold mt-3 ${['Shipped', 'Delivered'].includes(selectedOrder.status) ? 'text-white' : 'text-slate-500'
//                       }`}>Shipped</span>
//                   </div>
//                   <div className="flex flex-col items-center">
//                     <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-slate-900 shadow-md transition-colors duration-500 ${selectedOrder.status === 'Delivered'
//                         ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'
//                       }`}>
//                       <CheckCircle className="w-5 h-5" />
//                     </div>
//                     <span className={`text-xs font-bold mt-3 ${selectedOrder.status === 'Delivered' ? 'text-white' : 'text-slate-500'
//                       }`}>Delivered</span>
//                   </div>
//                 </div>
//                 )}
//               </div>

//               {/* Items */}
//               <h3 className="text-lg font-bold text-white mb-4">Items Summary</h3>
//               <div className="space-y-4">
//                 {(selectedOrder.order_items || []).length === 0 ? (
//                   <p className="text-slate-500 text-sm py-4 text-center">No items found for this order.</p>
//                 ) : (
//                   (selectedOrder.order_items || []).map((item) => (
//                     <div key={item.order_item_id} className="flex items-center gap-4 py-4 border-b border-slate-800 last:border-0">
//                       <div className="w-16 h-16 bg-slate-800 rounded-xl overflow-hidden flex-shrink-0">
//                         <img
//                           src={item.products?.image_url || 'https://via.placeholder.com/64'}
//                           alt={item.products?.name || 'Product'}
//                           className="w-full h-full object-cover"
//                         />
//                       </div>
//                       <div className="flex-grow">
//                         <Link
//                           to={`/product/${item.product_id}`}
//                           className="font-semibold text-slate-200 hover:text-indigo-400 transition-colors line-clamp-1"
//                         >
//                           {item.products?.name || `Product #${item.product_id}`}
//                         </Link>
//                         <p className="text-sm text-slate-400">Qty: {item.quantity}</p>
//                       </div>
//                       <div className="font-semibold text-white">
//                         ₹{((item.price || item.products?.price || 0) * item.quantity).toFixed(2)}
//                       </div>
//                     </div>
//                   ))
//                 )}
//               </div>

//               {/* Total */}
//               <div className="mt-6 pt-6 border-t border-slate-800 flex justify-between items-center">
//                 <span className="text-lg font-bold text-white">Order Total</span>
//                 <span className="text-2xl font-bold text-indigo-400">₹{getOrderTotal(selectedOrder).toFixed(2)}</span>
//               </div>

//             </div>
//           ) : (
//             <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 text-center h-full flex flex-col items-center justify-center text-slate-500">
//               <Eye className="w-12 h-12 mb-4 text-slate-700" />
//               <p>Select an order from the list to view details and tracking.</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Orders;


import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { Package, Truck, CheckCircle, ChevronRight, Eye, XCircle, RefreshCw, Ticket } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';

const statusConfig = {
  Pending: { color: 'text-yellow-400 bg-yellow-900/30 border-yellow-800', label: 'Pending' },
  Processing: { color: 'text-amber-400 bg-amber-900/30 border-amber-800', label: 'Processing' },
  Shipped: { color: 'text-indigo-400 bg-indigo-900/30 border-indigo-800', label: 'Shipped' },
  Delivered: { color: 'text-emerald-400 bg-emerald-900/30 border-emerald-800', label: 'Delivered' },
  Cancelled: { color: 'text-red-400 bg-red-900/30 border-red-800', label: 'Cancelled' },
};

const StatusBadge = ({ status }) => {
  const cfg = statusConfig[status] || statusConfig.Pending;
  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${cfg.color}`}>
      {cfg.label}
    </span>
  );
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [shippings, setShippings] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [supportIssue, setSupportIssue] = useState('');
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [ticketStatus, setTicketStatus] = useState('');

  // ✅ fetchOrders is memoized so it can be called to re-sync after any mutation
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.orders.getAll();
      setOrders(data || []);
      
      const orderIds = (data || []).map(o => o.order_id);
      if (orderIds.length > 0) {
        const [shippingData, ticketData] = await Promise.all([
           api.shipping.getByOrders(orderIds),
           api.supportTickets.getByOrders(orderIds)
        ]);
        setShippings(shippingData || []);
        setTickets(ticketData || []);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const selectedOrder = orders.find(o => o.order_id === selectedOrderId);
  const selectedShipping = shippings.find(s => s.order_id === selectedOrderId);

  const getOrderTotal = (order) => {
    if (order?.total_amount && order.total_amount > 0) return order.total_amount;
    return (order?.order_items || []).reduce((sum, item) => {
      return sum + (item.price || item.products?.price || 0) * (item.quantity || 1);
    }, 0);
  };

  const handleDownloadInvoice = (order) => {
    const shopName = order.order_items?.[0]?.products?.vendors?.name || 'Aura Marketplace';
    const invoiceNo = `INV-${order.order_id}-${Math.floor(Math.random() * 10000)}`;
    const date = order.order_date ? new Date(order.order_date).toLocaleDateString() : new Date().toLocaleDateString();
    const total = getOrderTotal(order);
    const subtotal = total / 1.1; // Extacting 10% tax from total
    const tax = total - subtotal;
    
    const printWindow = window.open('', '_blank', 'width=800,height=800');
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice ${invoiceNo}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; padding: 40px; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #eee; padding-bottom: 20px; }
            .title { font-size: 32px; font-weight: bold; color: #4f46e5; }
            .shop-details { text-align: right; }
            .details { margin-top: 40px; display: flex; justify-content: space-between; }
            table { width: 100%; margin-top: 40px; border-collapse: collapse; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
            th { background-color: #f8fafc; }
            .totals { margin-top: 40px; text-align: right; }
            .totals p { margin: 8px 0; color: #666; }
            .totals h3 { color: #4f46e5; margin-top: 12px; font-size: 24px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">INVOICE</div>
            <div class="shop-details">
              <h2 style="margin:0 0 5px 0">${shopName}</h2>
              <p style="margin:0; color:#666">Aura Marketplace Vendor</p>
            </div>
          </div>
          <div class="details">
            <div>
              <p><strong>Invoice Number:</strong> ${invoiceNo}</p>
              <p><strong>Order ID:</strong> #${order.order_id}</p>
              <p><strong>Date:</strong> ${date}</p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${(order.order_items || []).map(item => `
                <tr>
                  <td>${item.products?.name || 'Product'}</td>
                  <td>${item.quantity}</td>
                  <td>₹${(item.price || item.products?.price || 0).toFixed(2)}</td>
                  <td>₹${((item.price || item.products?.price || 0) * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="totals">
            <p>Subtotal: ₹${subtotal.toFixed(2)}</p>
            <p>Tax (10%): ₹${tax.toFixed(2)}</p>
            <h3>Total: ₹${total.toFixed(2)}</h3>
          </div>
          <div style="margin-top: 60px; text-align: center; color: #64748b; font-size: 14px;">
            <p>Thank you for shopping with ${shopName} on Aura.</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
        printWindow.print();
    }, 500);
  };

  // ✅ Cancel order — updates DB then re-fetches to confirm persistence
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      await api.orders.updateStatus(orderId, 'Cancelled');
      // Re-fetch from DB to confirm the change was persisted
      await fetchOrders();
    } catch (error) {
      console.error('Failed to cancel order:', error);
      alert(`Failed to cancel order: ${error.message}`);
    }
    setCancelling(false);
  };

  const trackingProgress = (status) => {
    switch (status) {
      case 'Delivered': return 'w-full';
      case 'Shipped': return 'w-1/2';
      default: return 'w-0';
    }
  };

  if (loading) return (
    <div className="text-center py-24 text-slate-400 animate-pulse">Loading orders...</div>
  );

  if (orders.length === 0) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center text-slate-500">
      <Package className="w-12 h-12 mx-auto mb-4 text-slate-700" />
      <p className="text-lg font-semibold text-white mb-2">No orders yet</p>
      <p className="text-sm">Your order history will appear here once you place an order.</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-white">Order History</h1>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          title="Refresh orders"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Orders List */}
        <div className="lg:col-span-1 space-y-3">
          {orders.map(order => (
            <button
              key={order.order_id}
              onClick={() => {
                setSelectedOrderId(order.order_id);
                setSupportIssue('');
                setTicketStatus('');
              }}
              className={`w-full text-left p-5 rounded-2xl border transition-all ${selectedOrderId === order.order_id
                  ? 'border-indigo-500 bg-indigo-900/20 shadow-md ring-1 ring-indigo-500'
                  : 'border-slate-800 bg-slate-900 hover:border-indigo-500/50'
                }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-white text-sm">#{order.order_id}</span>
                <StatusBadge status={order.status} />
              </div>
              <p className="text-sm text-slate-400 mb-3">
                {order.order_date
                  ? new Date(order.order_date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
                  : '—'}
              </p>
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-white">₹{getOrderTotal(order).toFixed(2)}</span>
                <span className="text-slate-500 flex items-center text-xs">
                  Details <ChevronRight className="w-3 h-3 ml-1" />
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Order Detail Panel */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {selectedOrder ? (
              <motion.div
                key={selectedOrder.order_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-sm"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-8 border-b border-slate-800 pb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Order #{selectedOrder.order_id}</h2>
                    <p className="text-sm text-slate-400 mt-1">
                      Placed on{' '}
                      {selectedOrder.order_date
                        ? new Date(selectedOrder.order_date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
                        : '—'}
                    </p>
                    {selectedShipping?.tracking_number && (
                      <p className="text-sm text-slate-400 mt-2">
                        Tracking Number: <span className="font-mono text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">{selectedShipping.tracking_number}</span>
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {/* ✅ Cancel available up until Shipped */}
                    {!['Shipped', 'Delivered', 'Cancelled'].includes(selectedOrder.status) && (
                      <button
                        onClick={() => handleCancelOrder(selectedOrder.order_id)}
                        disabled={cancelling}
                        className="flex items-center gap-1.5 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold px-3 py-1.5 rounded-lg border border-red-500/20 transition-colors disabled:opacity-50"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        {cancelling ? 'Cancelling...' : 'Cancel Order'}
                      </button>
                    )}
                    {selectedOrder.status === 'Delivered' && (
                      <button
                        onClick={() => handleDownloadInvoice(selectedOrder)}
                        className="flex items-center gap-1.5 text-xs bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 font-bold px-3 py-1.5 rounded-lg border border-indigo-500/20 transition-colors"
                      >
                        Download Invoice
                      </button>
                    )}
                    <StatusBadge status={selectedOrder.status} />
                  </div>
                </div>

                {/* Tracking */}
                {selectedOrder.status === 'Cancelled' ? (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center mb-8">
                    <XCircle className="w-10 h-10 text-red-400 mx-auto mb-2" />
                    <p className="text-red-400 font-bold text-lg">Order Cancelled</p>
                    <p className="text-slate-400 text-sm mt-1">This order will not be processed.</p>
                  </div>
                ) : (
                  <div className="mb-10 relative">
                    <div className="absolute top-5 left-8 right-8 h-1 bg-slate-800 z-0 rounded-full">
                      <div className={`h-full bg-indigo-500 rounded-full transition-all duration-1000 ${trackingProgress(selectedOrder.status)}`} />
                    </div>
                    <div className="flex justify-between relative z-10">
                      {[
                        { label: 'Processing', icon: Package, active: true },
                        { label: 'Shipped', icon: Truck, active: ['Shipped', 'Delivered'].includes(selectedOrder.status) },
                        { label: 'Delivered', icon: CheckCircle, active: selectedOrder.status === 'Delivered' },
                      ].map(({ label, icon: Icon, active }) => (
                        <div key={label} className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-slate-900 shadow-md transition-colors duration-500 ${active ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className={`text-xs font-bold mt-3 ${active ? 'text-white' : 'text-slate-500'}`}>{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Items */}
                <h3 className="text-lg font-bold text-white mb-4">Items</h3>
                <div className="space-y-3">
                  {(selectedOrder.order_items || []).length === 0 ? (
                    <p className="text-slate-500 text-sm text-center py-4">No items found.</p>
                  ) : (
                    selectedOrder.order_items.map((item) => (
                      <div key={item.order_item_id} className="flex items-center gap-4 py-3 border-b border-slate-800 last:border-0">
                        <div className="w-14 h-14 bg-slate-800 rounded-xl overflow-hidden flex-shrink-0">
                          <img
                            src={item.products?.image_url || 'https://via.placeholder.com/56'}
                            alt={item.products?.name || 'Product'}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-grow">
                          <Link to={`/product/${item.product_id}`} className="font-semibold text-slate-200 hover:text-indigo-400 transition-colors line-clamp-1">
                            {item.products?.name || `Product #${item.product_id}`}
                          </Link>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Qty: {item.quantity}
                            {item.products?.vendors?.name && (
                              <span className="ml-2 text-indigo-400">· {item.products.vendors.name}</span>
                            )}
                          </p>
                        </div>
                        <div className="font-semibold text-white text-sm">
                          ₹{((item.price || item.products?.price || 0) * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Total */}
                <div className="mt-6 pt-5 border-t border-slate-800">
                  <div className="flex justify-between items-center text-slate-400 mb-2">
                    <span className="text-sm">Subtotal</span>
                    <span className="text-sm font-semibold">₹{(getOrderTotal(selectedOrder) / 1.1).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400 mb-4">
                    <span className="text-sm">Estimated Tax (10%)</span>
                    <span className="text-sm font-semibold">₹{(getOrderTotal(selectedOrder) - (getOrderTotal(selectedOrder) / 1.1)).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-white">Order Total</span>
                    <span className="text-2xl font-bold text-indigo-400">₹{getOrderTotal(selectedOrder).toFixed(2)}</span>
                  </div>
                </div>

                {/* Existing Tickets for this order */}
                {(() => {
                  const orderTickets = tickets.filter(t => t.order_id === selectedOrder.order_id);
                  if (orderTickets.length > 0) {
                    return (
                      <div className="mt-8 pt-6 border-t border-slate-800">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                          <Ticket className="w-5 h-5 text-indigo-400" /> Support Tickets
                        </h3>
                        <div className="space-y-4">
                          {orderTickets.map(ticket => (
                            <div key={ticket.ticket_id} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-sm">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="text-xs text-slate-500">{new Date(ticket.created_at).toLocaleString('en-IN')}</p>
                                    </div>
                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${ticket.status === 'Open' ? 'text-amber-400 border-amber-500/20 bg-amber-500/10' : 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10'}`}>
                                        {ticket.status || 'Open'}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-300 bg-slate-900 p-4 rounded-xl border border-slate-800">{ticket.issue}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Support Ticket Section */}
                <div className="mt-8 pt-6 border-t border-slate-800">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    Need Help with this Order?
                  </h3>
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    if (!supportIssue.trim()) return;
                    setSubmittingTicket(true);
                    setTicketStatus('');
                    try {
                      const { data: userData } = await supabase.auth.getUser();
                      if (!userData?.user) throw new Error("Not logged in");
                      const { data: newTicket, error } = await supabase.from('support_tickets').insert({
                        user_id: userData.user.id,
                        order_id: selectedOrder.order_id,
                        issue: supportIssue,
                        status: 'Open'
                      }).select().single();
                      if (error) throw error;
                      setTickets(prev => [newTicket, ...prev]);
                      
                      // Notify User
                      await api.notifications.create(userData.user.id, 'Support Ticket Raised', `Your support ticket regarding Order #${selectedOrder.order_id} has been submitted successfully. Our team will review it soon.`, 'support_ticket');
                      
                      setTicketStatus('success');
                      setSupportIssue('');
                    } catch (error) {
                      console.error(error);
                      setTicketStatus('error');
                    }
                    setSubmittingTicket(false);
                  }} className="space-y-3">
                    <textarea
                      required
                      rows={3}
                      value={supportIssue}
                      onChange={e => setSupportIssue(e.target.value)}
                      placeholder="Describe your issue with this order..."
                      className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-600 resize-none"
                    />
                    <div className="flex items-center justify-between">
                      <div>
                        {ticketStatus === 'success' && <span className="text-emerald-400 text-sm font-semibold">Ticket submitted successfully! We will get back to you soon.</span>}
                        {ticketStatus === 'error' && <span className="text-red-400 text-sm font-semibold">Failed to submit ticket. Please try again.</span>}
                      </div>
                      <button
                        type="submit"
                        disabled={submittingTicket || !supportIssue.trim()}
                        className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md mt-2 flex-shrink-0"
                      >
                        {submittingTicket ? 'Submitting...' : 'Submit Ticket'}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center text-slate-500 min-h-[400px]"
              >
                <Eye className="w-12 h-12 mb-4 text-slate-700" />
                <p>Select an order to view details and tracking.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Orders;
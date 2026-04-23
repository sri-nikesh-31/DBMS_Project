// import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
// import { CartProvider } from './context/CartContext';
// import { UserProvider, useUser } from './context/UserContext';
// import { AnimatePresence } from 'framer-motion';
// import { Toaster } from 'react-hot-toast';
// import Layout from './components/layout/Layout';
// import Home from './pages/Home';
// import ProductListing from './pages/ProductListing';
// import ProductDetails from './pages/ProductDetails';
// import Cart from './pages/Cart';
// import Checkout from './pages/Checkout';
// import Payment from './pages/Payment';
// import Orders from './pages/Orders';
// import Profile from './pages/Profile';
// import Login from './pages/Login';
// import Signup from './pages/Signup';
// import Support from './pages/Support';
// import AdminPanel from './pages/AdminPanel';
// import BecomeVendor from './pages/BecomeVendor';
// import VendorDashboard from './pages/VendorDashboard';
// import Wishlist from './pages/Wishlist';
// import { AuraIntroGate } from './pages/AuraIntro';
// import Chatbot from './components/Chatbot';

// // Protected Route Component
// const ProtectedRoute = ({ children }) => {
//   const { user } = useUser();

//   // 🟡 wait for auth to load
//   if (user === undefined) {
//     return <div style={{ color: "white", padding: "20px" }}>Loading...</div>;
//   }

//   // 🔴 not logged in
//   if (!user) {
//     return <Navigate to="/login" />;
//   }

//   // 🟢 logged in
//   return children;
// };

// const AnimatedRoutes = () => {
//   const location = useLocation();

//   return (
//     <AnimatePresence mode="wait">
//       <Routes location={location} key={location.pathname}>
//         <Route path="/login" element={<Login />} />
//         <Route path="/signup" element={<Signup />} />

//         <Route path="/" element={<Layout />}>
//           <Route index element={<AuraIntroGate><Home /></AuraIntroGate>} />
//           <Route path="products" element={<ProductListing />} />
//           <Route path="product/:id" element={<ProductDetails />} />
//           <Route path="cart" element={<Cart />} />
//           <Route path="checkout" element={<Checkout />} />
//           <Route path="payment" element={<Payment />} />
//           <Route path="support" element={<Support />} />

//           {/* Protected Routes */}
//           <Route path="profile" element={
//             <ProtectedRoute>
//               <Profile />
//             </ProtectedRoute>
//           } />
//           <Route path="wishlist" element={
//             <ProtectedRoute>
//               <Wishlist />
//             </ProtectedRoute>
//           } />

//           <Route path="/admin" element={
//             <ProtectedRoute>
//               <AdminPanel />
//             </ProtectedRoute>
//           } />
//           <Route path="become-vendor" element={
//             <ProtectedRoute>
//               <BecomeVendor />
//             </ProtectedRoute>
//           } />
//           <Route path="vendor-dashboard" element={
//             <ProtectedRoute>
//               <VendorDashboard />
//             </ProtectedRoute>
//           } />
//           <Route path="orders" element={
//             <ProtectedRoute>
//               <Orders />
//             </ProtectedRoute>
//           } />
//         </Route>
//       </Routes>
//     </AnimatePresence>
//   );
// };

// function App() {
//   return (
//     <UserProvider>
//       <CartProvider>
//         <Toaster position="bottom-right" toastOptions={{ style: { background: '#1e293b', color: '#fff', border: '1px solid #334155' } }} />
//         <Router>
//           <AnimatedRoutes />
//           <Chatbot />
//         </Router>
//       </CartProvider>
//     </UserProvider>
//   );
// }

// export default App;



import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { UserProvider, useUser } from './context/UserContext';
import { GestureProvider } from './context/GestureContext';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import ProductListing from './pages/ProductListing';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Payment from './pages/Payment';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Support from './pages/Support';
import AdminPanel from './pages/AdminPanel';
import BecomeVendor from './pages/BecomeVendor';
import VendorDashboard from './pages/VendorDashboard';
import Wishlist from './pages/Wishlist';
import { AuraIntroGate } from './pages/AuraIntro';
import Chatbot from './components/Chatbot';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user } = useUser();

  if (user === undefined) {
    return <div style={{ color: "white", padding: "20px" }}>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/" element={<Layout />}>
          <Route index element={<AuraIntroGate><Home /></AuraIntroGate>} />
          <Route path="products" element={<ProductListing />} />
          <Route path="product/:id" element={<ProductDetails />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="payment" element={<Payment />} />
          <Route path="support" element={<Support />} />

          {/* Protected Routes */}
          <Route path="profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="wishlist" element={
            <ProtectedRoute>
              <Wishlist />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          } />
          <Route path="become-vendor" element={
            <ProtectedRoute>
              <BecomeVendor />
            </ProtectedRoute>
          } />
          <Route path="vendor-dashboard" element={
            <ProtectedRoute>
              <VendorDashboard />
            </ProtectedRoute>
          } />
          <Route path="orders" element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <UserProvider>
      <CartProvider>
        <GestureProvider>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#1e293b',
                color: '#fff',
                border: '1px solid #334155',
              },
            }}
          />
          <Router>
            <AnimatedRoutes />
            <Chatbot />
          </Router>
        </GestureProvider>
      </CartProvider>
    </UserProvider>
  );
}

export default App;
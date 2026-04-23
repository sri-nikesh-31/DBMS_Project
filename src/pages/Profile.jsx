// // import { useState, useEffect } from 'react';
// // import { useUser } from '../context/UserContext';
// // import { api } from '../services/api';
// // import { Link, useNavigate } from 'react-router-dom';
// // import { UserCircle, MapPin, Heart, LogOut, Settings } from 'lucide-react';
// // import SignoutDialog from '../components/ui/SignoutDialog';
// // import { createClient } from '@supabase/supabase-js'

// // const supabase = createClient(
// //   import.meta.env.VITE_SUPABASE_URL,
// //   import.meta.env.VITE_SUPABASE_KEY
// // )

// // useEffect(() => {
// //   const fetchProfile = async () => {
// //     const { data } = await supabase
// //       .from('profiles')
// //       .select('*')
// //       .eq('id', user.id)
// //       .single()

// //     setProfile(data)
// //   }

// //   if (user) fetchProfile()
// // }, [user])

// // const [profile, setProfile] = useState(null)
// // const Profile = () => {
// //   const { user, logout } = useUser();
// //   const navigate = useNavigate();
// //   const [activeTab, setActiveTab] = useState('wishlist');
// //   const [wishlistProducts, setWishlistProducts] = useState([]);
// //   const [showSignout, setShowSignout] = useState(false);

// //   useEffect(() => {
// //     if (!user) {
// //       navigate('/login');
// //       return;
// //     }

// //     const fetchWishlist = async () => {
// //       // In a real app we'd fetch full product details for the IDs in the wishlist
// //       const allProducts = await api.products.getAll();
// //       const filtered = allProducts.filter(p => user.wishlist.includes(p.id));
// //       setWishlistProducts(filtered);
// //     };

// //     if (activeTab === 'wishlist') {
// //       fetchWishlist();
// //     }
// //   }, [user, activeTab, navigate]);

// //   if (!user) return null;

// //   return (
// //     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
// //       <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

// //         {/* Sidebar */}
// //         <div className="md:col-span-1">
// //           <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sticky top-24 shadow-sm">
// //             <div className="flex flex-col items-center mb-8">
// //               <img src={user.avatar} alt={user.name} className="w-24 h-24 rounded-full object-cover border-4 border-slate-800 shadow-sm mb-4" />
// //               <h2 className="text-xl font-bold text-white">{user.name}</h2>
// //               <p className="text-sm text-slate-400">{user.email}</p>
// //             </div>

// //             <nav className="space-y-2">
// //               <button
// //                 onClick={() => setActiveTab('wishlist')}
// //                 className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'wishlist' ? 'bg-indigo-900/30 text-indigo-400' : 'text-slate-300 hover:bg-slate-800'}`}
// //               >
// //                 <Heart className="w-5 h-5 mr-3" /> Wishlist
// //               </button>
// //               <button
// //                 onClick={() => setActiveTab('addresses')}
// //                 className={`w-full flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'addresses' ? 'bg-indigo-900/30 text-indigo-400' : 'text-slate-300 hover:bg-slate-800'}`}
// //               >
// //                 <MapPin className="w-5 h-5 mr-3" /> Addresses
// //               </button>
// //               <Link
// //                 to="/orders"
// //                 className="w-full flex items-center px-4 py-3 rounded-xl text-sm font-semibold text-slate-300 hover:bg-slate-800 transition-all"
// //               >
// //                 <PackageIcon /> Orders
// //               </Link>
// //               <div className="pt-4 mt-4 border-t border-slate-800">
// //                 <button
// //                   onClick={() => setShowSignout(true)}
// //                   className="w-full flex items-center px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-500/10 transition-all"
// //                 >
// //                   <LogOut className="w-5 h-5 mr-3" /> Sign Out
// //                 </button>
// //               </div>
// //             </nav>
// //           </div>
// //         </div>

// //         {/* Content */}
// //         <div className="md:col-span-3">
// //           <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 min-h-[500px] shadow-sm">

// //             {activeTab === 'wishlist' && (
// //               <div>
// //                 <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
// //                   <Heart className="w-6 h-6 mr-2 text-rose-500 fill-rose-500" /> Your Wishlist
// //                 </h3>

// //                 {wishlistProducts.length === 0 ? (
// //                   <div className="text-center py-12 text-slate-500">Your wishlist is empty.</div>
// //                 ) : (
// //                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
// //                     {wishlistProducts.map(product => (
// //                       <Link to={`/product/${product.id}`} key={product.id} className="group relative border border-slate-800 rounded-2xl p-4 hover:border-slate-700 transition-colors">
// //                         <div className="aspect-square bg-slate-800 rounded-xl overflow-hidden mb-4">
// //                           <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
// //                         </div>
// //                         <h4 className="font-semibold text-white line-clamp-1">{product.name}</h4>
// //                         <p className="text-indigo-400 font-bold mt-1">${product.price.toFixed(2)}</p>
// //                       </Link>
// //                     ))}
// //                   </div>
// //                 )}
// //               </div>
// //             )}

// //             {activeTab === 'addresses' && (
// //               <div>
// //                 <div className="flex justify-between items-center mb-6">
// //                   <h3 className="text-2xl font-bold text-white">Saved Addresses</h3>
// //                   <button className="text-sm font-semibold text-indigo-400 bg-indigo-900/30 px-4 py-2 rounded-lg hover:bg-indigo-900/50 transition-colors">
// //                     Add New
// //                   </button>
// //                 </div>

// //                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
// //                   {user.addresses.map(addr => (
// //                     <div key={addr.id} className={`p-6 rounded-2xl border-2 transition-all ${addr.isDefault ? 'border-indigo-500 bg-indigo-900/10' : 'border-slate-800 bg-slate-950 hover:border-slate-700'}`}>
// //                       <div className="flex justify-between items-start mb-2">
// //                         <span className="font-bold text-white flex items-center">
// //                           {addr.type}
// //                           {addr.isDefault && <span className="ml-2 bg-indigo-900/50 text-indigo-400 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">Default</span>}
// //                         </span>
// //                         <div className="flex gap-2">
// //                           <button className="text-slate-500 hover:text-indigo-400"><Settings className="w-4 h-4" /></button>
// //                         </div>
// //                       </div>
// //                       <p className="text-slate-400 text-sm mt-3">{addr.street}</p>
// //                       <p className="text-slate-400 text-sm">{addr.city}, {addr.state} {addr.zip}</p>
// //                     </div>
// //                   ))}
// //                 </div>
// //               </div>
// //             )}

// //           </div>
// //         </div>

// //       </div>

// //       <SignoutDialog
// //         isOpen={showSignout}
// //         onClose={() => setShowSignout(false)}
// //         onConfirm={() => { logout(); navigate('/'); }}
// //       />
// //     </div>
// //   );
// // };

// // // Extracted small icon for consistent use
// // const PackageIcon = () => (
// //   <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
// //     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
// //   </svg>
// // );

// // export default Profile;

// import { useState, useEffect } from 'react'
// import { useUser } from '../context/UserContext'
// import { useNavigate } from 'react-router-dom'
// import { LogOut } from 'lucide-react'
// import SignoutDialog from '../components/ui/SignoutDialog'
// import { createClient } from '@supabase/supabase-js'

// const supabase = createClient(
//   import.meta.env.VITE_SUPABASE_URL,
//   import.meta.env.VITE_SUPABASE_KEY
// )

// const Profile = () => {
//   const { user, logout } = useUser()
//   const navigate = useNavigate()

//   const [profile, setProfile] = useState(null)
//   const [loading, setLoading] = useState(true)
//   const [showSignout, setShowSignout] = useState(false)

//   // ✅ Fetch profile safely
//   useEffect(() => {
//     const fetchProfile = async () => {
//       if (!user) {
//         setLoading(false)
//         return
//       }

//       try {
//         const { data, error } = await supabase
//           .from('profiles')
//           .select('*')
//           .eq('id', user.id)
//           .single()

//         if (error) {
//           console.error("Profile fetch error:", error)
//         } else {
//           setProfile(data)
//         }
//       } catch (err) {
//         console.error("Unexpected error:", err)
//       }

//       setLoading(false)
//     }

//     fetchProfile()
//   }, [user])

//   // ✅ Loading state
//   if (loading) {
//     return (
//       <div className="text-white p-10 text-center">
//         Loading profile...
//       </div>
//     )
//   }

//   // ❌ If no user → redirect
//   if (!user) {
//     navigate('/login')
//     return null
//   }

//   return (
//     <div className="max-w-4xl mx-auto px-6 py-12">

//       <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">

//         {/* Profile Info */}
//         <div className="flex flex-col items-center mb-8">
//           <div className="w-24 h-24 rounded-full bg-indigo-600 flex items-center justify-center text-3xl font-bold text-white mb-4">
//             {(profile?.name?.charAt(0) || user?.email?.charAt(0) || "U").toUpperCase()}
//           </div>

//           <h2 className="text-2xl font-bold text-white">
//             {profile?.name || "User"}
//           </h2>

//           <p className="text-slate-400">{user?.email}</p>
//         </div>

//         {/* Info */}
//         <div className="space-y-4 text-slate-300">
//           <p>
//             <span className="text-slate-500">User ID:</span> {user?.id}
//           </p>
//           <p>
//             <span className="text-slate-500">Phone:</span> {profile?.phone || "Not added"}
//           </p>
//         </div>

//         {/* Logout */}
//         <div className="mt-8">
//           <button
//             onClick={() => setShowSignout(true)}
//             className="w-full flex items-center justify-center px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-500/10 transition-all"
//           >
//             <LogOut className="w-5 h-5 mr-2" /> Sign Out
//           </button>
//         </div>

//       </div>

//       <SignoutDialog
//         isOpen={showSignout}
//         onClose={() => setShowSignout(false)}
//         onConfirm={() => {
//           logout()
//           navigate('/')
//         }}
//       />
//     </div>
//   )
// }

// export default Profile



import { useState, useEffect } from 'react'
import { useUser } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import SignoutDialog from '../components/ui/SignoutDialog'
import { supabase } from '../supabaseClient'

const Profile = () => {
  const { user, logout } = useUser()
  const navigate = useNavigate()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showSignout, setShowSignout] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) { setLoading(false); return }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error) console.error("Profile fetch error:", error)
        else setProfile(data)
      } catch (err) {
        console.error("Unexpected error:", err)
      }

      setLoading(false)
    }

    fetchProfile()
  }, [user])

  if (loading) return <div className="text-white p-10 text-center">Loading profile...</div>

  if (!user) { navigate('/login'); return null }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-full bg-indigo-600 flex items-center justify-center text-3xl font-bold text-white mb-4">
            {(profile?.name?.charAt(0) || user?.email?.charAt(0) || "U").toUpperCase()}
          </div>
          <h2 className="text-2xl font-bold text-white">{profile?.name || "User"}</h2>
          <p className="text-slate-400">{user?.email}</p>
        </div>

        <div className="space-y-4 text-slate-300">
          <p><span className="text-slate-500">User ID:</span> {user?.id}</p>
          <p><span className="text-slate-500">Phone:</span> {profile?.phone || "Not added"}</p>
        </div>

        <div className="mt-8">
          <button
            onClick={() => setShowSignout(true)}
            className="w-full flex items-center justify-center px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-5 h-5 mr-2" /> Sign Out
          </button>
        </div>
      </div>

      <SignoutDialog
        isOpen={showSignout}
        onClose={() => setShowSignout(false)}
        onConfirm={() => { logout(); navigate('/') }}
      />
    </div>
  )
}

export default Profile
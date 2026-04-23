// // import { createContext, useContext, useState } from 'react';
// // import { currentUser as mockUser } from '../mockData/users';

// // const UserContext = createContext();

// // export const useUser = () => useContext(UserContext);

// // export const UserProvider = ({ children }) => {
// //   const [user, setUser] = useState(null); // null means not logged in

// //   const login = (email, password) => {
// //     // Mock login
// //     if (email && password) {
// //       setUser(mockUser);
// //       return true;
// //     }
// //     return false;
// //   };

// //   const logout = () => {
// //     setUser(null);
// //   };

// //   const toggleWishlist = (productId) => {
// //     if (!user) return;

// //     setUser(prevUser => {
// //       const isWishlisted = prevUser.wishlist.includes(productId);
// //       const updatedWishlist = isWishlisted 
// //         ? prevUser.wishlist.filter(id => id !== productId)
// //         : [...prevUser.wishlist, productId];

// //       return { ...prevUser, wishlist: updatedWishlist };
// //     });
// //   };

// //   return (
// //     <UserContext.Provider value={{ user, login, logout, toggleWishlist }}>
// //       {children}
// //     </UserContext.Provider>
// //   );
// // };


// import { createContext, useContext, useEffect, useState } from 'react'
// import { createClient } from '@supabase/supabase-js'

// import { supabase } from '../supabaseClient';
// // DELETE the createClient import and const supabase = createClient(...) lines

// const supabase = createClient(
//   import.meta.env.VITE_SUPABASE_URL,
//   import.meta.env.VITE_SUPABASE_KEY
// )

// const UserContext = createContext()

// export const UserProvider = ({ children }) => {
//   const [user, setUser] = useState(undefined)

//   // ✅ Persist session
//   useEffect(() => {
//     supabase.auth.getSession().then(({ data }) => {
//       setUser(data.session?.user || null)
//     })

//     const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
//       setUser(session?.user || null)
//     })

//     return () => listener.subscription.unsubscribe()
//   }, [])

//   // ✅ LOGIN
//   const login = async (email, password) => {
//     const { error } = await supabase.auth.signInWithPassword({
//       email,
//       password
//     })

//     if (error) {
//       alert(error.message)
//       return false
//     }

//     return true
//   }

//   // ✅ SIGNUP
//   const signup = async (email, password, name) => {
//     const { data, error } = await supabase.auth.signUp({
//       email,
//       password
//     })

//     if (error) {
//       alert(error.message)
//       return false
//     }

//     // 🚨 SAFETY CHECK
//     if (!data.user) {
//       alert("Signup successful. Please verify your email.")
//       return true
//     }

//     // ✅ update profile
//     const { error: updateError } = await supabase
//       .from('profiles')
//       .update({ name })
//       .eq('id', data.user.id)

//     if (updateError) {
//       console.error(updateError)
//     }

//     return true
//   }

//   // ✅ LOGOUT
//   const logout = async () => {
//     await supabase.auth.signOut()
//   }

//   return (
//     <UserContext.Provider value={{ user, login, signup, logout }}>
//       {children}
//     </UserContext.Provider>
//   )
// }

// export const useUser = () => useContext(UserContext)



import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { alert(error.message); return false; }
    return true;
  };

  const signup = async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) { alert(error.message); return false; }
    if (!data.user) { alert("Signup successful. Please verify your email."); return true; }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ name })
      .eq('id', data.user.id);

    if (updateError) console.error(updateError);
    return true;
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <UserContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
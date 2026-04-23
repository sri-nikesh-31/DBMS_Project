// import { useState, useEffect } from 'react';
// import { useUser } from '../context/UserContext';
// import { useNavigate, Link } from 'react-router-dom';
// import { X } from 'lucide-react';
// import { motion } from 'framer-motion';

// const Signup = () => {
//   const [name, setName] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const { user, signup } = useUser();
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (user) navigate('/profile');
//   }, [user, navigate]);

//   const handleSubmit = async (e) => {
//     e.preventDefault()

//     const success = await signup(email, password, name)

//     if (success) {
//       navigate('/login')
//     }
//   }

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12 relative overflow-hidden"
//     >
//       <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/20 blur-[120px] rounded-full mix-blend-screen"></div>
//       <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/20 blur-[120px] rounded-full mix-blend-screen"></div>

//       <div className="max-w-md w-full bg-slate-900/90 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-800 p-8 sm:p-10 relative z-10 block">
//         <button
//           onClick={() => navigate(-1)}
//           className="absolute top-6 right-6 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-full p-2 transition-all shadow-sm"
//         >
//           <X className="w-5 h-5" />
//         </button>
//         <div className="text-center mb-8">
//           <Link to="/" className="text-3xl font-bold text-white tracking-tighter inline-block mb-2">
//             Aura<span className="text-indigo-500">.</span>
//           </Link>
//           <h2 className="text-xl font-semibold text-slate-200">Create an account</h2>
//           <p className="text-slate-400 text-sm mt-1">Join us to get started with Aura.</p>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-5">
//           <div>
//             <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
//             <input
//               type="text"
//               required
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
//             <input
//               type="email"
//               required
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
//             <input
//               type="password"
//               required
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
//             />
//           </div>
//           <motion.button
//             whileHover={{ scale: 1.02, boxShadow: "0px 0px 15px rgba(99, 102, 241, 0.5)" }}
//             whileTap={{ scale: 0.95 }}
//             type="submit"
//             className="w-full bg-indigo-600 text-white rounded-xl py-3.5 font-bold transition-all shadow-lg mt-4 shadow-indigo-600/30"
//           >
//             Sign Up
//           </motion.button>
//         </form>

//         <p className="text-center text-sm text-slate-500 mt-8">
//           Already have an account? <Link to="/login" className="font-semibold text-indigo-600 cursor-pointer">Sign in</Link>
//         </p>
//       </div>
//     </motion.div>
//   );
// };

// export default Signup;



import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate, Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { user, signup } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/profile');
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await signup(email, password, name);
    if (success) navigate('/login');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12 relative overflow-hidden"
    >
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/20 blur-[120px] rounded-full mix-blend-screen"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/20 blur-[120px] rounded-full mix-blend-screen"></div>

      <div className="max-w-md w-full bg-slate-900/90 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-800 p-8 sm:p-10 relative z-10">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 right-6 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-full p-2 transition-all shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-bold text-white tracking-tighter inline-block mb-2">
            Aura<span className="text-indigo-500">.</span>
          </Link>
          <h2 className="text-xl font-semibold text-slate-200">Create an account</h2>
          <p className="text-slate-400 text-sm mt-1">Join us to get started with Aura.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: "0px 0px 15px rgba(99, 102, 241, 0.5)" }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full bg-indigo-600 text-white rounded-xl py-3.5 font-bold transition-all shadow-lg mt-4 shadow-indigo-600/30"
          >
            Sign Up
          </motion.button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-8">
          Already have an account? <Link to="/login" className="font-semibold text-indigo-600 cursor-pointer">Sign in</Link>
        </p>
      </div>
    </motion.div>
  );
};

export default Signup;
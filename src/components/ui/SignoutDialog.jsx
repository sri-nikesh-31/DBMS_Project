import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, X } from 'lucide-react';

const SignoutDialog = ({ isOpen, onClose, onConfirm }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed top-0 left-0 w-full h-[100vh] z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-3xl shadow-2xl border border-stone-100 p-6 sm:p-8 w-full max-w-sm z-10"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 rounded-full p-2 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
                <LogOut className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-2">Sign Out</h3>
              <p className="text-stone-500 mb-8 max-w-[250px]">
                Are you sure you want to sign out of your account?
              </p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-xl font-semibold text-stone-700 bg-white border-2 border-stone-200 hover:border-stone-300 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={onConfirm}
                  className="flex-1 py-3 px-4 rounded-xl font-semibold text-white bg-red-500 hover:bg-red-600 shadow-md transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SignoutDialog;

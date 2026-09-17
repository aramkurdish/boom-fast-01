
import React from 'react';
import { CartItem } from '../types';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BottomNavProps {
  cart: CartItem[];
  onViewCart: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ cart, onViewCart }) => {
  return (
    <AnimatePresence>
      {cart.length > 0 && (
        <motion.div 
          initial={{ y: 100, x: '-50%', opacity: 0 }}
          animate={{ y: 0, x: '-50%', opacity: 1 }}
          exit={{ y: 100, x: '-50%', opacity: 0 }}
          className="fixed bottom-6 left-1/2 w-[92%] sm:max-w-md z-40 bg-slate-900 text-white p-4 rounded-[32px] shadow-2xl flex items-center justify-between border border-white/10 backdrop-blur-xl"
        >
          <div className="flex items-center gap-4">
            <div className="bg-orange-600 w-12 h-12 rounded-2xl flex items-center justify-center font-black relative shadow-lg shadow-orange-900/20">
              <ShoppingCart className="w-5 h-5" />
              <motion.span 
                key={cart.length}
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute -top-2 -right-2 bg-white text-orange-600 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shadow-md border-2 border-orange-600"
              >
                {cart.reduce((acc, item) => acc + item.quantity, 0)}
              </motion.span>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider">کۆی گشتی</p>
              <p className="font-black text-xl">
                {cart.reduce((acc, item) => acc + (item.price * item.quantity), 0).toLocaleString()} <span className="text-xs opacity-60">د.ع</span>
              </p>
            </div>
          </div>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onViewCart}
            className="bg-orange-600 px-6 py-4 rounded-2xl font-black text-sm flex items-center gap-2 shadow-lg shadow-orange-900/20 hover:bg-orange-700 transition-colors"
          >
            بینینی سەبەتە
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

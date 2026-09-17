
import React from 'react';
import { Category } from '../types';
import { motion } from 'motion/react';

interface CategoryBarProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({ categories, selectedCategoryId, onSelectCategory }) => {
  return (
    <div className="w-full overflow-x-auto no-scrollbar py-4 bg-white/80 backdrop-blur-xl sticky top-[64px] z-40 border-b border-gray-100/50">
      <div className="flex flex-row gap-4 px-6 min-w-max">
        {categories.map((category) => (
          <motion.button
            key={category.id}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelectCategory(category.id)}
            className="flex flex-col items-center gap-2 group w-[80px] shrink-0"
          >
            <div className={`
              relative w-full aspect-square rounded-[24px] overflow-hidden border-2 transition-all duration-500 transform shadow-sm
              ${selectedCategoryId === category.id 
                ? 'border-orange-500 ring-4 ring-orange-50/50 scale-105 shadow-xl shadow-orange-100' 
                : 'border-white bg-white group-hover:border-orange-100 group-hover:shadow-md'}
            `}>
              <img 
                src={category.imageUrl} 
                alt={category.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              {selectedCategoryId === category.id && (
                <motion.div 
                  layoutId="activeCategory"
                  className="absolute inset-0 bg-orange-600/5 pointer-events-none"
                />
              )}
            </div>
            <span className={`
              text-[12px] font-black transition-all duration-300 text-center truncate w-full px-1
              ${selectedCategoryId === category.id ? 'text-orange-600' : 'text-gray-500 group-hover:text-orange-500'}
            `}>
              {category.name}
            </span>
          </motion.button>
        ))}
      </div>
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
        }
      `}</style>
    </div>
  );
};

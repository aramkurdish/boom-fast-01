
import React, { useState } from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, size?: 'S' | 'M' | 'L') => void;
  isPizza?: boolean;
  isClosed?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, isPizza, isClosed }) => {
  const [selectedSize, setSelectedSize] = useState<'S' | 'M' | 'L'>('S');

  const currentPrice = isPizza 
    ? (selectedSize === 'S' ? product.price : selectedSize === 'M' ? (product.priceM || product.price) : (product.priceL || product.price))
    : product.price;

  const isDisabled = isClosed || product.isOutOfStock;

  return (
    <div className={`bg-white rounded-[32px] overflow-hidden flex flex-col border border-gray-100 shadow-sm transition-all hover:shadow-md ${isDisabled ? 'opacity-75 grayscale-[0.5]' : ''}`}>
      <div className="aspect-square overflow-hidden bg-gray-50 relative">
        <img src={product.img} className="w-full h-full object-cover transition-transform hover:scale-105" alt={product.name} />
        {/* @ts-ignore */}
        {product.isOffer && !isDisabled && (
          <div className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-black shadow-lg animate-pulse">
            ئۆفەر 🔥
          </div>
        )}
        {product.isNew && !isDisabled && (
          <div className="absolute top-2 left-2 bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black shadow-lg">
            نوێ ✨
          </div>
        )}
        {isDisabled && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-red-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
              {product.isOutOfStock ? 'خلاس بووە' : 'داخراوە'}
            </span>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-black text-sm mb-1 truncate">{product.name}</h3>
        
        {product.description && (
          <p className="text-[10px] text-gray-400 font-bold mb-2 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}
        
        {isPizza && (
          <div className="flex gap-2 my-2">
            {(['S', 'M', 'L'] as const).map(size => {
              // Hide size option if price for that size doesn't exist (except for S which is mandatory)
              if (size === 'M' && !product.priceM) return null;
              if (size === 'L' && !product.priceL) return null;
              
              return (
                <button
                  key={size}
                  disabled={isDisabled}
                  onClick={() => setSelectedSize(size)}
                  className={`w-8 h-8 rounded-full text-[10px] font-black transition-all border ${
                    selectedSize === size 
                      ? 'bg-orange-600 text-white border-orange-600 shadow-md' 
                      : 'bg-white text-gray-400 border-gray-100'
                  } ${isDisabled ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        )}

        <div className="flex flex-col mb-3">
          {product.isOffer && product.originalPrice && (
            <span className="text-gray-400 line-through text-xs font-bold decoration-red-400">
              {product.originalPrice.toLocaleString()} د.ع
            </span>
          )}
          <p className="text-orange-600 font-black text-lg">
            {currentPrice.toLocaleString()} د.ع
          </p>
        </div>
        
        <button 
          disabled={isDisabled}
          onClick={() => onAddToCart(product, isPizza ? selectedSize : undefined)}
          className={`mt-auto w-full py-3 rounded-2xl font-black text-xs active:scale-95 transition-all shadow-md ${
            isDisabled 
              ? 'bg-gray-400 text-white cursor-not-allowed shadow-none' 
              : 'bg-orange-600 text-white shadow-orange-100'
          }`}
        >
          {product.isOutOfStock ? 'خلاس بووە' : isClosed ? 'داخراوە' : 'زیادکردن +'}
        </button>
      </div>
    </div>
  );
};

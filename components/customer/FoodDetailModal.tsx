import React, { useState } from 'react';
import { MenuItem } from '../../types';
import { useApp } from '../../context/AppContext';
import { X, Plus, Minus, ShoppingBag, Check } from 'lucide-react';

interface FoodDetailModalProps {
  item: MenuItem | null;
  restaurantName: string;
  onClose: () => void;
}

export const FoodDetailModal: React.FC<FoodDetailModalProps> = ({ item, restaurantName, onClose }) => {
  const { addToCart, setIsCartOpen } = useApp();

  const [quantity, setQuantity] = useState(1);
  const [selectedExtras, setSelectedExtras] = useState<{ [groupName: string]: string }>({});
  const [extraPrices, setExtraPrices] = useState(0);
  const [note, setNote] = useState('');
  const [isAdded, setIsAdded] = useState(false);

  if (!item) return null;

  const handleExtraSelect = (groupName: string, choiceTitle: string, extraPrice: number) => {
    setSelectedExtras(prev => {
      const updated = { ...prev, [groupName]: choiceTitle };
      return updated;
    });

    // recalculate extra prices
    let totalExtras = 0;
    if (item.options) {
      item.options.forEach(group => {
        const choice = group.name === groupName ? choiceTitle : selectedExtras[group.name];
        const opt = group.choices.find(c => c.title === choice);
        if (opt) totalExtras += opt.extraPrice;
      });
    }
    setExtraPrices(totalExtras);
  };

  const itemUnitPrice = item.price + extraPrices;
  const totalPrice = itemUnitPrice * quantity;

  const handleAddToCart = () => {
    const extrasList = Object.entries(selectedExtras).map(([grp, ch]) => `${grp}: ${ch}`);
    addToCart({
      id: `${item.id}-${Date.now()}`,
      menuItemId: item.id,
      restaurantId: item.restaurantId,
      restaurantName,
      name: item.name,
      price: itemUnitPrice,
      quantity,
      imageUrl: item.imageUrl,
      hasDiscount: item.hasDiscount,
      originalPrice: item.originalPrice,
      discountBadge: item.discountBadge,
      selectedExtras: extrasList.length > 0 ? extrasList : undefined,
      notes: note.trim() || undefined
    });

    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" dir="rtl">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
        {/* Header Image */}
        <div className="relative h-56 sm:h-64 w-full bg-slate-100 shrink-0">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/80 backdrop-blur-md text-slate-800 hover:bg-white shadow-md transition-colors"
          >
            <X size={20} />
          </button>
          {!item.isAvailable && (
            <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center">
              <span className="bg-rose-600 text-white font-black text-sm px-4 py-1.5 rounded-full">
                لە کۆگادا نەماوە
              </span>
            </div>
          )}
        </div>

        {/* Details & Options */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-black text-slate-900 leading-snug">{item.name}</h3>
                {item.hasDiscount && (
                  <span className="inline-block mt-1 text-[10px] font-black bg-orange-600 text-white px-2.5 py-0.5 rounded-full">
                    {item.discountBadge || `${item.discountPercent || 20}٪ داشکان 🔥`}
                  </span>
                )}
              </div>
              <div className="text-left">
                <span className="text-lg font-black text-orange-600 whitespace-nowrap block">
                  {item.price.toLocaleString()} د.ع
                </span>
                {item.hasDiscount && item.originalPrice && (
                  <span className="text-xs text-slate-400 line-through block">
                    {item.originalPrice.toLocaleString()} د.ع
                  </span>
                )}
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* Options & Extras */}
          {item.options && item.options.length > 0 && (
            <div className="space-y-4 pt-2 border-t border-slate-100">
              {item.options.map((group) => (
                <div key={group.name} className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span>{group.name}</span>
                    <span className="text-[10px] text-slate-400 font-medium">(هەڵبژاردەیی)</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {group.choices.map((choice) => {
                      const isSelected = selectedExtras[group.name] === choice.title;
                      return (
                        <button
                          key={choice.title}
                          onClick={() => handleExtraSelect(group.name, choice.title, choice.extraPrice)}
                          className={`p-2.5 text-right rounded-xl border text-xs font-medium flex items-center justify-between transition-all ${
                            isSelected
                              ? 'border-orange-500 bg-orange-50 text-orange-700 font-bold ring-1 ring-orange-500'
                              : 'border-slate-200 text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <span>{choice.title}</span>
                          {choice.extraPrice > 0 && (
                            <span className="text-[11px] text-slate-500">
                              +{choice.extraPrice.toLocaleString()}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Special Instructions Note */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              تێبینی تایبەت بۆ خواردنەکە:
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="وەک: بەبێ پیاز، سۆسی زیادە، توند نەبێت..."
              rows={2}
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-slate-800 placeholder-slate-400 resize-none"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
          {/* Quantity selector */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl p-1 shadow-xs">
            <button
              onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 active:scale-95 transition-all"
            >
              <Minus size={16} />
            </button>
            <span className="w-8 text-center font-black text-sm text-slate-900">{quantity}</span>
            <button
              onClick={() => setQuantity(prev => prev + 1)}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 active:scale-95 transition-all"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={!item.isAvailable || isAdded}
            className={`flex-1 py-3 px-4 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 ${
              isAdded
                ? 'bg-emerald-600 shadow-emerald-600/20'
                : 'bg-orange-600 hover:bg-orange-700 shadow-orange-600/20'
            }`}
          >
            {isAdded ? (
              <>
                <Check size={18} />
                <span>زیادکرا بۆ سەبەت!</span>
              </>
            ) : (
              <>
                <ShoppingBag size={18} />
                <span>زیادکردن بۆ سەبەت • {totalPrice.toLocaleString()} د.ع</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

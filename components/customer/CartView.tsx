import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Bike, ShieldCheck, MapPin } from 'lucide-react';
import { CheckoutModal } from './CheckoutModal';
import { calculateDistanceKm } from '../../utils/geo';

export const CartView: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    cartDeliveryFee,
    cartTotal,
    restaurants,
    userLocation,
    deliveryPricePerKm
  } = useApp();

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  if (!isCartOpen) return null;

  const currentRestaurant = restaurants.find(r => r.id === cart[0]?.restaurantId);
  const currentRestaurantDistance = currentRestaurant
    ? calculateDistanceKm(userLocation, currentRestaurant.location, currentRestaurant.distanceKm || 2.1)
    : 2.1;

  const totalSavings = cart.reduce((acc, item) => {
    if (item.hasDiscount && item.originalPrice && item.originalPrice > item.price) {
      return acc + ((item.originalPrice - item.price) * item.quantity);
    }
    return acc;
  }, 0);

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm animate-in fade-in" dir="rtl">
        <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-left duration-200">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-full text-slate-500 hover:bg-slate-100 transition-colors"
              >
                <ArrowLeft size={20} className="rotate-180" />
              </button>
              <div>
                <h2 className="text-base font-black text-slate-900">سەبەتەی داواکاری</h2>
                {currentRestaurant && (
                  <p className="text-xs text-orange-600 font-bold">{currentRestaurant.name}</p>
                )}
              </div>
            </div>

            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-rose-500 hover:text-rose-700 font-bold flex items-center gap-1 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
              >
                <Trash2 size={14} />
                <span>بەتاڵکردن</span>
              </button>
            )}
          </div>

          {/* Cart Items List */}
          {cart.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center text-orange-400 mb-4">
                <ShoppingBag size={36} />
              </div>
              <h3 className="text-base font-black text-slate-800">سەبەتەکەت بەتاڵە</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                هێشتا هیچ خواردنێکت زیاد نەکردووە. سەردانی چێشتخانەکان بکە و خواردنی دڵخوازت هەڵبژێرە.
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="mt-5 px-6 py-2.5 bg-orange-600 text-white rounded-2xl text-xs font-bold shadow-md shadow-orange-500/20 active:scale-95 transition-transform"
              >
                گەڕان بەدوای چێشتخانەکان
              </button>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-3"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-xs text-slate-900 truncate">{item.name}</h4>
                      {item.hasDiscount && (
                        <span className="text-[9px] font-black bg-orange-600 text-white px-1.5 py-0.2 rounded-full shrink-0">
                          {item.discountBadge || 'داشکان'}
                        </span>
                      )}
                    </div>
                    {item.selectedExtras && item.selectedExtras.length > 0 && (
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">
                        {item.selectedExtras.join('، ')}
                      </p>
                    )}
                    {item.notes && (
                      <p className="text-[10px] text-amber-600 truncate mt-0.5">
                        تێبینی: {item.notes}
                      </p>
                    )}
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-xs font-black text-slate-800">
                        {(item.price * item.quantity).toLocaleString()} د.ع
                      </span>
                      {item.hasDiscount && item.originalPrice && (
                        <span className="text-[10px] text-slate-400 line-through">
                          {(item.originalPrice * item.quantity).toLocaleString()} د.ع
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl p-1 shadow-2xs shrink-0">
                    <button
                      onClick={() => updateCartQuantity(item.id, -1)}
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 active:scale-95 transition-all"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="w-5 text-center font-black text-xs text-slate-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartQuantity(item.id, 1)}
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-100 active:scale-95 transition-all"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Delivery GPS Distance Banner */}
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/70 flex items-center gap-2.5 text-xs text-amber-800">
                <Bike size={18} className="text-amber-600 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs text-amber-950">گەیاندن بەپێی دووری GPS</span>
                    <span className="text-[10px] font-bold bg-amber-100/80 px-2 py-0.5 rounded-full text-amber-900">
                      {currentRestaurantDistance} کم
                    </span>
                  </div>
                  <span className="text-[11px] text-amber-800 font-bold block mt-0.5">
                    کرێی گەیاندن: {cartDeliveryFee.toLocaleString()} د.ع ({deliveryPricePerKm} د.ع / ١ کم)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Footer Summary */}
          {cart.length > 0 && (
            <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-3 shrink-0">
              <div className="space-y-1.5 text-xs">
                {totalSavings > 0 && (
                  <div className="flex justify-between items-center text-xs bg-emerald-50 text-emerald-700 p-2.5 rounded-xl font-bold border border-emerald-200/70 shadow-2xs">
                    <span className="flex items-center gap-1.5">
                      <span>🎉</span>
                      <span>داشکاندنی بەدەستهاتوو:</span>
                    </span>
                    <span className="font-black">-{totalSavings.toLocaleString()} د.ع</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>کۆی خواردنەکان:</span>
                  <span className="font-bold">{cartSubtotal.toLocaleString()} د.ع</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>کرێی گەیاندن ({currentRestaurantDistance} کم بەپێی GPS):</span>
                  <span className="font-bold text-orange-600">{cartDeliveryFee.toLocaleString()} د.ع</span>
                </div>
                <div className="flex justify-between text-slate-900 font-black text-sm pt-2 border-t border-slate-200">
                  <span>کۆی گشتی:</span>
                  <span className="text-orange-600">{cartTotal.toLocaleString()} د.ع</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsCheckoutOpen(true);
                }}
                className="w-full py-3.5 px-4 bg-orange-600 hover:bg-orange-700 active:scale-98 text-white font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-orange-600/20 transition-all"
              >
                <span>بەردەوام بە بۆ داواکاری</span>
                <span className="text-xs opacity-90">({cartTotal.toLocaleString()} د.ع)</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <CheckoutModal
          onClose={() => setIsCheckoutOpen(false)}
          onOrderComplete={() => {
            setIsCheckoutOpen(false);
            setIsCartOpen(false);
          }}
        />
      )}
    </>
  );
};

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Restaurant, MenuItem } from '../../types';
import { ArrowLeft, Star, Clock, Bike, MapPin, Plus, Minus, Search, Sparkles } from 'lucide-react';
import { FoodDetailModal } from './FoodDetailModal';
import { calculateDistanceKm } from '../../utils/geo';

export const RestaurantDetail: React.FC = () => {
  const {
    selectedRestaurantId,
    setSelectedRestaurantId,
    restaurants,
    menuItems,
    cart,
    addToCart,
    updateCartQuantity,
    calculateDeliveryFee,
    userLocation,
    setIsCartOpen
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [modalItem, setModalItem] = useState<MenuItem | null>(null);
  const [searchWord, setSearchWord] = useState('');

  const restaurant = restaurants.find(r => r.id === selectedRestaurantId);
  if (!restaurant) return null;

  const actualDistanceKm = calculateDistanceKm(userLocation, restaurant.location, restaurant.distanceKm || 2.5);
  const deliveryFee = calculateDeliveryFee(actualDistanceKm);

  // Filter items for this restaurant
  const items = menuItems.filter(m => m.restaurantId === restaurant.id);
  const categories = ['all', ...Array.from(new Set(items.map(i => i.category)))];

  const filteredItems = items.filter(item => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = !searchWord || item.name.toLowerCase().includes(searchWord.toLowerCase()) || item.description.toLowerCase().includes(searchWord.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const getCartQuantity = (itemId: string) => {
    const cartItem = cart.find(c => c.menuItemId === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const handleQuickAdd = (item: MenuItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.options && item.options.length > 0) {
      // If item has options/sizes, open full modal
      setModalItem(item);
      return;
    }
    const cartItem = cart.find(c => c.menuItemId === item.id);
    if (cartItem) {
      updateCartQuantity(cartItem.id, 1);
    } else {
      addToCart({
        id: `${item.id}-${Date.now()}`,
        menuItemId: item.id,
        restaurantId: item.restaurantId,
        restaurantName: restaurant.name,
        name: item.name,
        price: item.price,
        originalPrice: item.originalPrice,
        hasDiscount: item.hasDiscount,
        discountBadge: item.discountBadge,
        quantity: 1,
        imageUrl: item.imageUrl
      });
    }
  };

  const handleQuickRemove = (item: MenuItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const cartItem = cart.find(c => c.menuItemId === item.id);
    if (cartItem) {
      updateCartQuantity(cartItem.id, -1);
    }
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="pb-24 animate-in fade-in" dir="rtl">
      {/* Cover Image & Back Button */}
      <div className="relative h-48 sm:h-56 w-full bg-slate-900">
        <img
          src={restaurant.coverImage}
          alt={restaurant.name}
          className="w-full h-full object-cover opacity-85"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <button
          onClick={() => setSelectedRestaurantId(null)}
          className="absolute top-4 right-4 p-2.5 rounded-full bg-white/90 backdrop-blur-md text-slate-900 hover:bg-white shadow-lg transition-transform active:scale-95 z-10"
        >
          <ArrowLeft size={18} className="rotate-180" />
        </button>

        {restaurant.hasOffer && (
          <div className="absolute top-4 left-4 bg-orange-600 text-white text-[11px] font-black px-3 py-1 rounded-full shadow-md flex items-center gap-1">
            <Sparkles size={12} />
            <span>{restaurant.offerText}</span>
          </div>
        )}
      </div>

      {/* Restaurant Info Card */}
      <div className="px-4 -mt-10 relative z-10">
        <div className="bg-white rounded-3xl p-4 shadow-xl border border-slate-100 flex items-start gap-3.5">
          <img
            src={restaurant.logo}
            alt={restaurant.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md shrink-0"
            referrerPolicy="no-referrer"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <h1 className="text-base font-black text-slate-900 truncate">{restaurant.name}</h1>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                restaurant.isOpen ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
              }`}>
                {restaurant.isOpen ? 'کراوەیە' : 'داخراوە'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{restaurant.description}</p>

            {/* Badges */}
            <div className="flex items-center gap-3 text-[11px] font-bold text-slate-600 mt-2 flex-wrap">
              <span className="flex items-center gap-1 text-amber-500">
                <Star size={13} className="fill-amber-400 text-amber-400" />
                <span>{restaurant.rating}</span>
                <span className="text-slate-400 font-normal">({restaurant.ratingCount})</span>
              </span>
              <span className="flex items-center gap-1">
                <Clock size={13} className="text-slate-400" />
                <span>{restaurant.deliveryTime}</span>
              </span>
              <span className="flex items-center gap-1 text-slate-700 font-bold">
                <MapPin size={13} className="text-orange-500" />
                <span>{actualDistanceKm} کم دووری</span>
              </span>
              <span className="flex items-center gap-1 text-orange-600 font-black">
                <Bike size={13} />
                <span>{deliveryFee.toLocaleString()} د.ع گەیاندن</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search within restaurant */}
      <div className="px-4 mt-4">
        <div className="relative">
          <input
            type="text"
            value={searchWord}
            onChange={(e) => setSearchWord(e.target.value)}
            placeholder="گەڕان لە خواردنەکانی ئەم ڕێستورانتە..."
            className="w-full text-xs py-2.5 pr-9 pl-4 bg-slate-100/90 rounded-2xl border-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all text-slate-800"
          />
          <Search size={16} className="absolute right-3 top-3 text-slate-400" />
        </div>
      </div>

      {/* Active Restaurant Offer Banner */}
      {restaurant.hasOffer && restaurant.offerText && (
        <div className="px-4 mt-3">
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-3 rounded-2xl shadow-xs flex items-center gap-2">
            <span className="text-base">🔥</span>
            <div className="text-xs font-bold truncate">
              {restaurant.offerText}
            </div>
          </div>
        </div>
      )}

      {/* Categories Tabs */}
      <div className="px-4 mt-3 overflow-x-auto no-scrollbar flex items-center gap-2 py-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-orange-600 text-white shadow-sm shadow-orange-600/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {cat === 'all' ? 'هەموو مێنیو' : cat}
          </button>
        ))}
      </div>

      {/* Menu Items List */}
      <div className="px-4 mt-4 space-y-3">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-slate-100">
            <p className="text-xs text-slate-500 font-bold">هیچ خواردنێک نەدۆزرایەوە</p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const qty = getCartQuantity(item.id);
            return (
              <div
                key={item.id}
                onClick={() => setModalItem(item)}
                className="bg-white p-3 rounded-2xl border border-slate-100 shadow-2xs hover:border-orange-200 hover:shadow-sm transition-all flex items-center justify-between gap-3 cursor-pointer group"
              >
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-slate-100 group-hover:scale-102 transition-transform"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="font-black text-xs sm:text-sm text-slate-900 group-hover:text-orange-600 transition-colors truncate">
                      {item.name}
                    </h3>
                    {item.hasDiscount && (
                      <span className="text-[9px] font-black bg-orange-600 text-white px-2 py-0.5 rounded-full shrink-0">
                        {item.discountBadge || `${item.discountPercent || 20}٪ داشکان`}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-xs text-orange-600">
                        {item.price.toLocaleString()} د.ع
                      </span>
                      {item.hasDiscount && item.originalPrice && (
                        <span className="text-[10px] text-slate-400 line-through">
                          {item.originalPrice.toLocaleString()} د.ع
                        </span>
                      )}
                    </div>

                    {/* Quick quantity control / Add button */}
                    {qty > 0 ? (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 rounded-xl p-0.5"
                      >
                        <button
                          onClick={(e) => handleQuickRemove(item, e)}
                          className="w-6 h-6 rounded-lg bg-white text-orange-600 flex items-center justify-center shadow-2xs hover:bg-orange-100 transition-colors"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="w-5 text-center font-black text-xs text-orange-700">
                          {qty}
                        </span>
                        <button
                          onClick={(e) => handleQuickAdd(item, e)}
                          className="w-6 h-6 rounded-lg bg-orange-600 text-white flex items-center justify-center shadow-2xs hover:bg-orange-700 transition-colors"
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => handleQuickAdd(item, e)}
                        className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
                      >
                        <Plus size={14} />
                        <span>زیادکردن</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Bottom Cart Bar (if cart has items) */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-16 inset-x-0 max-w-md mx-auto px-4 z-30 animate-in slide-in-from-bottom-2">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-slate-900 text-white p-3 rounded-2xl shadow-xl flex items-center justify-between hover:bg-black transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-orange-600 text-white text-xs font-black flex items-center justify-center">
                {totalCartCount}
              </div>
              <span className="text-xs font-bold">پیشاندانی سەبەتە</span>
            </div>
            <div className="text-xs font-black text-orange-400">
              {cart.reduce((s, i) => s + i.price * i.quantity, 0).toLocaleString()} د.ع
            </div>
          </button>
        </div>
      )}

      {/* Food Detail Modal */}
      {modalItem && (
        <FoodDetailModal
          item={modalItem}
          restaurantName={restaurant.name}
          onClose={() => setModalItem(null)}
        />
      )}
    </div>
  );
};

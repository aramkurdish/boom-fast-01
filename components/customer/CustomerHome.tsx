import React from 'react';
import { useApp } from '../../context/AppContext';
import { DEFAULT_FOOD_CATEGORIES } from '../../constants';
import { Search, Star, Clock, Bike, ChevronRight, Store, ArrowRight, MapPin, Sparkles } from 'lucide-react';
import { calculateDistanceKm } from '../../utils/geo';
import { CustomerAdBanner } from './CustomerAdBanner';

export const CustomerHome: React.FC = () => {
  const {
    restaurants,
    setSelectedRestaurantId,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    calculateDeliveryFee,
    userLocation,
    orders,
    setActiveOrderId,
    setCustomerTab
  } = useApp();

  // Filter restaurants by search and category
  const filteredRestaurants = restaurants.filter((r) => {
    const matchesSearch = !searchQuery ||
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || r.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Latest active order for banner
  const activeOrder = orders.find(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED');

  return (
    <div className="p-4 pb-24 space-y-5 animate-in fade-in" dir="rtl">
      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="گەڕان بەدوای چێشتخانە، پیتزا، شاورما، بەرگەر..."
          className="w-full py-3 pr-10 pl-4 bg-slate-100/90 hover:bg-slate-100 focus:bg-white rounded-2xl border-none focus:ring-2 focus:ring-orange-500 text-xs text-slate-800 placeholder-slate-400 transition-all shadow-xs"
        />
        <Search size={18} className="absolute right-3.5 top-3.5 text-slate-400" />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute left-3 top-3 text-[11px] font-bold text-slate-400 hover:text-slate-600 bg-slate-200/80 px-2 py-0.5 rounded-full"
          >
            سڕینەوە
          </button>
        )}
      </div>

      {/* Active Order Live Floating Banner (if order in progress) */}
      {activeOrder && (
        <div
          onClick={() => {
            setActiveOrderId(activeOrder.id);
            setCustomerTab('ORDERS');
          }}
          className="bg-gradient-to-r from-orange-600 to-amber-600 text-white p-3.5 rounded-2xl shadow-lg shadow-orange-600/25 flex items-center justify-between cursor-pointer active:scale-98 transition-transform"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-lg shrink-0">
              🛵
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-extrabold uppercase tracking-wide opacity-85 block">
                داواکاری لە جێبەجێکردندایە • #{activeOrder.orderNumber}
              </span>
              <h4 className="text-xs font-black truncate">{activeOrder.restaurantName}</h4>
            </div>
          </div>
          <span className="text-[11px] font-black bg-white text-orange-600 px-2.5 py-1 rounded-full shrink-0">
            بەدواداچوون
          </span>
        </div>
      )}

      {/* Customer Advertisement Banner (Managed by Super Admin) */}
      <CustomerAdBanner />

      {/* Categories Bar */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-sm font-black text-slate-900">بەشەکان</h3>
          {selectedCategory !== 'all' && (
            <button
              onClick={() => setSelectedCategory('all')}
              className="text-[11px] font-bold text-orange-600"
            >
              پیشاندانی هەموو
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            <span>🍽️</span>
            <span>هەموو</span>
          </button>

          {DEFAULT_FOOD_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-3 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                selectedCategory === cat.name
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
                  : 'bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* All Restaurants - Modern 2-Column Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-black text-slate-900">
            {searchQuery
              ? `ئەنجامەکانی گەڕان (${filteredRestaurants.length})`
              : selectedCategory !== 'all'
              ? `چێشتخانەکانی بەشی ${selectedCategory} (${filteredRestaurants.length})`
              : 'هەموو چێشتخانەکان'}
          </h3>
          <span className="text-[11px] font-bold text-slate-400">
            {filteredRestaurants.length} بەردەست
          </span>
        </div>

        {filteredRestaurants.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-slate-100">
            <Store size={32} className="mx-auto text-slate-400 mb-2" />
            <p className="text-xs font-bold text-slate-600">هیچ چێشتخانەیەک بەم مەرجە نەدۆزرایەوە</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-3 text-xs font-bold text-orange-600 underline"
            >
              پاککردنەوەی فلتەرەکان
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredRestaurants.map((restaurant) => {
              const actualDistanceKm = calculateDistanceKm(userLocation, restaurant.location, restaurant.distanceKm || 2.5);
              const deliveryFee = calculateDeliveryFee(actualDistanceKm);

              return (
                <div
                  key={restaurant.id}
                  onClick={() => setSelectedRestaurantId(restaurant.id)}
                  className={`bg-white rounded-3xl border shadow-2xs hover:shadow-md transition-all overflow-hidden cursor-pointer flex flex-col group relative ${
                    restaurant.isSponsored ? 'border-amber-300/80 ring-2 ring-amber-400/25 shadow-amber-500/5' : 'border-slate-100'
                  }`}
                >
                  {/* Card Image */}
                  <div className="relative h-28 sm:h-32 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={restaurant.coverImage}
                      alt={restaurant.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                    {/* Open/Closed Badge */}
                    <span className={`absolute top-2 right-2 text-[9px] font-black px-2 py-0.5 rounded-full shadow-xs ${
                      restaurant.isOpen ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                    }`}>
                      {restaurant.isOpen ? 'کراوەیە' : 'داخراوە'}
                    </span>

                    {/* Sponsored / VIP Badge if active */}
                    {restaurant.isSponsored && (
                      <span className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                        <Sparkles size={10} className="fill-amber-200 text-amber-200" />
                        <span>{restaurant.sponsoredBadge || 'سپۆنسەرکراو ⭐'}</span>
                      </span>
                    )}

                    {/* Rating Pill */}
                    <span className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-xs text-[10px] font-black text-slate-900 px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-xs">
                      <Star size={10} className="fill-amber-400 text-amber-400" />
                      <span>{restaurant.rating}</span>
                    </span>

                    {/* Logo thumbnail */}
                    <img
                      src={restaurant.logo}
                      alt={restaurant.name}
                      className="absolute bottom-2 left-2 w-7 h-7 rounded-xl object-cover border-2 border-white shadow-xs"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Card Info */}
                  <div className="p-2.5 flex-1 flex flex-col justify-between space-y-1.5">
                    <div>
                      <h4 className="font-black text-xs text-slate-900 truncate group-hover:text-orange-600 transition-colors">
                        {restaurant.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 truncate">{restaurant.category}</p>
                    </div>

                    {/* Restaurant Offer Tag if active */}
                    {restaurant.hasOffer && restaurant.offerText && (
                      <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded-lg flex items-center gap-1 truncate shadow-2xs">
                        <span className="shrink-0">🔥</span>
                        <span className="truncate">{restaurant.offerText}</span>
                      </div>
                    )}

                    <div className="pt-1.5 border-t border-slate-50 space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-1 text-slate-500 font-medium">
                          <MapPin size={11} className="text-orange-500" />
                          <span>{actualDistanceKm} کم</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-400 font-medium">
                          <Clock size={11} />
                          <span>{restaurant.deliveryTime}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[10px] bg-orange-50/70 text-orange-700 px-2 py-0.5 rounded-lg font-bold">
                        <span className="flex items-center gap-1">
                          <Bike size={11} />
                          <span>گەیاندن:</span>
                        </span>
                        <span>{deliveryFee.toLocaleString()} د.ع</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

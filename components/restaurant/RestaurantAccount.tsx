import React from 'react';
import { useApp } from '../../context/AppContext';
import { Store, MapPin, Clock, Phone, Power, ShieldCheck, LogOut, User } from 'lucide-react';

export const RestaurantAccount: React.FC = () => {
  const { currentUser, restaurants, toggleRestaurantStatus, logout } = useApp();

  const myRestaurantId = currentUser.restaurantId || 'rest-boom-pizza';
  const restaurant = restaurants.find(r => r.id === myRestaurantId) || restaurants[0];

  return (
    <div className="p-4 pb-24 space-y-4 animate-in fade-in" dir="rtl">
      {/* Restaurant Header */}
      <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-2xs space-y-3">
        <div className="flex items-center gap-3">
          <img
            src={restaurant.logo}
            alt={restaurant.name}
            className="w-16 h-16 rounded-2xl object-cover border border-slate-200"
            referrerPolicy="no-referrer"
          />
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-black text-slate-900 truncate">{restaurant.name}</h2>
            <span className="text-xs text-slate-500 block">{restaurant.category}</span>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full inline-block mt-1 ${
              restaurant.isOpen ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
            }`}>
              {restaurant.isOpen ? 'ڕێستورانت کراوەیە' : 'ڕێستورانت داخراوە'}
            </span>
          </div>
        </div>

        {/* Toggle Open/Closed */}
        <button
          onClick={() => toggleRestaurantStatus(restaurant.id)}
          className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
            restaurant.isOpen
              ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200'
              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
          }`}
        >
          <Power size={16} />
          <span>{restaurant.isOpen ? 'داخستنی کاتی ڕێستورانت' : 'کردنەوەی ڕێستورانت بۆ وەرگرتنی داواکاری'}</span>
        </button>
      </div>

      {/* Account Owner & Security Banner */}
      <div className="bg-blue-50 rounded-3xl p-4 border border-blue-200/80 space-y-2 text-xs">
        <div className="flex items-center gap-2 font-black text-blue-900">
          <ShieldCheck size={18} className="text-blue-600" />
          <span>هەژماری تایبەت بە ڕێستورانت (Restaurant Account)</span>
        </div>
        <p className="text-[11px] text-blue-800 leading-relaxed">
          ئەم هەژمارە بە فەرمی لەلایەن <strong>Super Admin</strong> ـەوە دروستکراوە بۆ بەڕێوەبردنی داواکارییەکان و مێنیو.
        </p>
        <div className="pt-2 border-t border-blue-200/60 flex items-center justify-between text-[11px] text-blue-900">
          <span className="flex items-center gap-1 font-bold">
            <User size={13} />
            <span>بەڕێوەبەر: {currentUser.name}</span>
          </span>
          <span className="font-mono text-slate-600">{currentUser.phone}</span>
        </div>
      </div>

      {/* Details List */}
      <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-2xs space-y-3 text-xs">
        <h3 className="font-black text-slate-800">زانیارییەکانی تۆمار</h3>

        <div className="flex items-start gap-2.5 text-slate-600">
          <MapPin size={16} className="text-blue-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-slate-800">ناونیشان:</span>
            <span>{restaurant.address}</span>
          </div>
        </div>

        <div className="flex items-start gap-2.5 text-slate-600">
          <Clock size={16} className="text-blue-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-slate-800">کاتی ئاسایی گەیاندن:</span>
            <span>{restaurant.deliveryTime}</span>
          </div>
        </div>

        <div className="flex items-start gap-2.5 text-slate-600">
          <Phone size={16} className="text-blue-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-slate-800">ژمارەی پەیوەندی تۆمارکراو:</span>
            <span className="font-mono">{currentUser.phone}</span>
          </div>
        </div>
      </div>

      {/* Logout button */}
      <button
        onClick={logout}
        className="w-full p-3.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-rose-200"
      >
        <LogOut size={16} />
        <span>دەرچوون لە هەژماری ڕێستورانت</span>
      </button>
    </div>
  );
};

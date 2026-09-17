import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Store, Bike, TrendingUp, MapPin, Plus, ShieldCheck, UserCheck, KeyRound, Phone, Users } from 'lucide-react';
import { AddRestaurantModal } from './AddRestaurantModal';
import { AddDriverModal } from './AddDriverModal';

export const AdminDashboard: React.FC = () => {
  const { restaurants, drivers, orders, deliveryZones, setAdminTab, accounts } = useApp();

  const [isAddRestaurantOpen, setIsAddRestaurantOpen] = useState(false);
  const [isAddDriverOpen, setIsAddDriverOpen] = useState(false);

  const totalRevenue = orders
    .filter(o => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + o.total, 0);

  const activeDeliveries = orders.filter(
    o => o.status === 'ON_THE_WAY' || o.status === 'DRIVER_PICKED_UP'
  ).length;

  const pendingOrPrep = orders.filter(
    o => o.status === 'PLACED' || o.status === 'PREPARING' || o.status === 'ACCEPTED'
  ).length;

  const onlineDriversCount = drivers.filter(d => d.isOnline).length;
  const openRestaurantsCount = restaurants.filter(r => r.isOpen).length;

  return (
    <div className="space-y-4 animate-in fade-in pb-10" dir="rtl">
      {/* Super Admin Top Banner */}
      <div className="bg-gradient-to-r from-purple-800 to-indigo-900 text-white p-5 rounded-3xl shadow-xl flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
            کۆنترۆڵی باڵای سیستەم (Super Admin)
          </span>
          <h2 className="text-lg font-black mt-1">داشبۆردی بەڕێوەبەری سەرەکی</h2>
          <p className="text-xs text-purple-200 mt-0.5">بەڕێوەبردنی ئەکاونتەکان، چێشتخانەکان و شۆفێران</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-2xl border border-white/20 shrink-0">
          👑
        </div>
      </div>

      {/* Mandatory Admin Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setIsAddRestaurantOpen(true)}
          className="p-3.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-2xl shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 font-black text-xs transition-all"
        >
          <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center">
            <Plus size={16} />
          </div>
          <div className="text-right">
            <span className="block text-[13px]">+ Add Restaurant</span>
            <span className="block text-[10px] text-blue-100 font-normal">دروستکردنی ڕێستورانت</span>
          </div>
        </button>

        <button
          onClick={() => setIsAddDriverOpen(true)}
          className="p-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 font-black text-xs transition-all"
        >
          <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center">
            <Plus size={16} />
          </div>
          <div className="text-right">
            <span className="block text-[13px]">+ Add Driver</span>
            <span className="block text-[10px] text-emerald-100 font-normal">دروستکردنی شۆفێر</span>
          </div>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total Platform Revenue */}
        <div className="col-span-2 bg-white p-4 rounded-3xl border border-slate-100 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500">کۆی گشتی داهاتی سیستەم</span>
            <h3 className="text-2xl font-black text-slate-900">
              {totalRevenue.toLocaleString()} <span className="text-xs font-bold text-slate-500">د.ع</span>
            </h3>
            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full inline-block">
              {orders.length} سەرجەم داواکارییەکان
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-black">
            <TrendingUp size={24} />
          </div>
        </div>

        {/* Restaurants Count */}
        <div
          onClick={() => setAdminTab('RESTAURANTS')}
          className="bg-white p-3.5 rounded-3xl border border-slate-100 shadow-2xs cursor-pointer hover:border-purple-200 transition-all"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold text-slate-600">ڕێستورانتەکان</span>
            <Store size={16} className="text-blue-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-slate-900">{restaurants.length}</span>
            {restaurants.filter(r => r.isSponsored).length > 0 && (
              <span className="text-[10px] font-black bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full">
                👑 {restaurants.filter(r => r.isSponsored).length} VIP
              </span>
            )}
          </div>
          <span className="text-[10px] text-emerald-600 font-bold block mt-1">
            {openRestaurantsCount} کراوەن • کۆنترۆڵی ڕیزبەندی ⬆️
          </span>
        </div>

        {/* Drivers Count */}
        <div
          onClick={() => setAdminTab('DRIVERS')}
          className="bg-white p-3.5 rounded-3xl border border-slate-100 shadow-2xs cursor-pointer hover:border-purple-200 transition-all"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold text-slate-600">شۆفێران</span>
            <Bike size={16} className="text-emerald-600" />
          </div>
          <div className="text-xl font-black text-slate-900">{drivers.length}</div>
          <span className="text-[10px] text-emerald-600 font-bold block mt-1">
            {onlineDriversCount} شۆفێر سەرهێڵن
          </span>
        </div>

        {/* Active Deliveries */}
        <div
          onClick={() => setAdminTab('ORDERS')}
          className="bg-white p-3.5 rounded-3xl border border-slate-100 shadow-2xs cursor-pointer hover:border-purple-200 transition-all"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold text-slate-600">لە گەیاندندان</span>
            <Bike size={16} className="text-orange-600" />
          </div>
          <div className="text-xl font-black text-orange-600">{activeDeliveries}</div>
          <span className="text-[10px] text-slate-400 font-medium block mt-1">
            لە ڕێگای ماڵی کڕیارن
          </span>
        </div>

        {/* Delivery Zones */}
        <div
          onClick={() => setAdminTab('ZONES')}
          className="bg-white p-3.5 rounded-3xl border border-slate-100 shadow-2xs cursor-pointer hover:border-purple-200 transition-all"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold text-slate-600">زۆنەکانی نرخ</span>
            <MapPin size={16} className="text-purple-600" />
          </div>
          <div className="text-xl font-black text-slate-900">{deliveryZones.length}</div>
          <span className="text-[10px] text-purple-700 font-bold block mt-1">
            نرخی دووری کیلۆمەتر
          </span>
        </div>
      </div>

      {/* System Accounts Security Registry */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-purple-600" />
            <h4 className="text-xs font-black text-slate-900">لیستی سەرجەم ئەکاونتەکانی تۆمارکراو</h4>
          </div>
          <span className="text-[10px] bg-purple-50 text-purple-700 font-bold px-2 py-0.5 rounded-full">
            {accounts.length} هەژمار
          </span>
        </div>

        <div className="space-y-2">
          {accounts.map(acc => {
            let roleBadge = 'bg-orange-100 text-orange-700 border-orange-200';
            let roleLabel = 'Customer';
            if (acc.role === 'SUPER_ADMIN') {
              roleBadge = 'bg-purple-100 text-purple-700 border-purple-200';
              roleLabel = 'Super Admin';
            } else if (acc.role === 'RESTAURANT') {
              roleBadge = 'bg-blue-100 text-blue-700 border-blue-200';
              roleLabel = 'Restaurant';
            } else if (acc.role === 'DRIVER') {
              roleBadge = 'bg-emerald-100 text-emerald-700 border-emerald-200';
              roleLabel = 'Driver';
            }

            return (
              <div
                key={acc.id}
                className="p-2.5 rounded-2xl bg-slate-50/80 border border-slate-100 flex items-center justify-between text-xs gap-2"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-slate-900 truncate">
                      {acc.restaurantName ? `${acc.restaurantName} (${acc.managerName || acc.name})` : acc.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Phone size={11} />
                      <span className="font-mono text-slate-600">{acc.phone}</span>
                    </span>
                    {acc.password && (
                      <span className="flex items-center gap-1">
                        <KeyRound size={11} />
                        <span className="font-mono text-slate-500">****</span>
                      </span>
                    )}
                    {acc.vehicleType && (
                      <span className="text-emerald-700 font-medium">({acc.vehicleType})</span>
                    )}
                  </div>
                </div>

                <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border shrink-0 ${roleBadge}`}>
                  {roleLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Status Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-2xs space-y-2">
        <h4 className="text-xs font-black text-slate-800">بارودۆخی ڕاستەوخۆی کارەکان</h4>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center text-slate-600">
            <span>داواکارییە نوێ و ئامادەکراوەکان:</span>
            <span className="font-bold text-amber-600">{pendingOrPrep} داواکاری</span>
          </div>
          <div className="flex justify-between items-center text-slate-600">
            <span>شۆفێرانی بەردەست لەسەر شەقام:</span>
            <span className="font-bold text-emerald-600">{onlineDriversCount} لە {drivers.length}</span>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddRestaurantModal
        isOpen={isAddRestaurantOpen}
        onClose={() => setIsAddRestaurantOpen(false)}
      />
      <AddDriverModal
        isOpen={isAddDriverOpen}
        onClose={() => setIsAddDriverOpen(false)}
      />
    </div>
  );
};

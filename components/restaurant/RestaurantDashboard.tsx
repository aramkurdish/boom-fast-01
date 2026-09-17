import React from 'react';
import { useApp } from '../../context/AppContext';
import { Store, TrendingUp, Clock, CheckCircle2, AlertCircle, ChefHat, PackageCheck } from 'lucide-react';
import { ORDER_STATUS_LABELS } from '../../constants';

export const RestaurantDashboard: React.FC = () => {
  const { currentUser, orders, setRestaurantTab, updateOrderStatus } = useApp();

  const myRestaurantId = currentUser.restaurantId || 'rest-boom-pizza';
  const myOrders = orders.filter(o => o.restaurantId === myRestaurantId);

  const pendingOrders = myOrders.filter(o => o.status === 'PLACED');
  const preparingOrders = myOrders.filter(o => o.status === 'PREPARING' || o.status === 'ACCEPTED');
  const readyOrders = myOrders.filter(o => o.status === 'READY');
  const todayCompletedOrders = myOrders.filter(o => o.status === 'DELIVERED');

  const todaySales = myOrders
    .filter(o => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + o.subtotal, 0);

  return (
    <div className="p-4 pb-24 space-y-4 animate-in fade-in" dir="rtl">
      {/* Restaurant Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-4 sm:p-5 rounded-3xl shadow-xl flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
            داشبۆردی چێشتخانە
          </span>
          <h2 className="text-base sm:text-lg font-black mt-1">Boom Pizza & Burger</h2>
          <p className="text-xs text-blue-200 mt-0.5">بەڕێوەبردنی خێرای داواکاری و ئامادەکردنی خواردنەکان</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-2xl border border-white/20">
          🍕
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Today's Sales */}
        <div className="col-span-2 bg-white p-4 rounded-3xl border border-slate-100 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500">کۆی فرۆشی ئەمڕۆ</span>
            <h3 className="text-2xl font-black text-slate-900">{todaySales.toLocaleString()} <span className="text-xs font-bold text-slate-500">د.ع</span></h3>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
              {myOrders.length} داواکاری ئەمڕۆ
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
            <TrendingUp size={24} />
          </div>
        </div>

        {/* Pending Orders */}
        <div
          onClick={() => setRestaurantTab('ORDERS')}
          className="bg-amber-50/70 p-3.5 rounded-3xl border border-amber-200/80 shadow-2xs cursor-pointer hover:bg-amber-50 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-900">چاوەڕوانکراو</span>
            <Clock size={16} className="text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700">{pendingOrders.length}</div>
          <span className="text-[10px] text-amber-700 font-medium">پێویستی بە پەسەندکردنە</span>
        </div>

        {/* Preparing Orders */}
        <div
          onClick={() => setRestaurantTab('ORDERS')}
          className="bg-orange-50/70 p-3.5 rounded-3xl border border-orange-200/80 shadow-2xs cursor-pointer hover:bg-orange-50 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-orange-900">ئامادە دەکرێت</span>
            <ChefHat size={16} className="text-orange-600" />
          </div>
          <div className="text-2xl font-black text-orange-700">{preparingOrders.length}</div>
          <span className="text-[10px] text-orange-700 font-medium">لەناو چێشتخانەدا</span>
        </div>

        {/* Ready Orders */}
        <div
          onClick={() => setRestaurantTab('ORDERS')}
          className="bg-emerald-50/70 p-3.5 rounded-3xl border border-emerald-200/80 shadow-2xs cursor-pointer hover:bg-emerald-50 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-900">ئامادەیە</span>
            <PackageCheck size={16} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">{readyOrders.length}</div>
          <span className="text-[10px] text-emerald-700 font-medium">چاوەڕوانی شۆفێرن</span>
        </div>

        {/* Delivered Today */}
        <div className="bg-slate-50 p-3.5 rounded-3xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-800">گەیەندراو</span>
            <CheckCircle2 size={16} className="text-slate-600" />
          </div>
          <div className="text-2xl font-black text-slate-800">{todayCompletedOrders.length}</div>
          <span className="text-[10px] text-slate-500 font-medium">داواکاری سەرکەوتوو</span>
        </div>
      </div>

      {/* Offers & Discounts Promo Management Card */}
      <div
        onClick={() => setRestaurantTab('MENU')}
        className="bg-gradient-to-r from-orange-500 to-amber-500 text-white p-4 rounded-3xl shadow-sm cursor-pointer hover:shadow-md transition-all active:scale-[0.99] flex items-center justify-between gap-3"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="text-base">🔥</span>
            <h3 className="text-sm font-black">ئۆفەر و داشکاندنی تایبەتی چێشتخانە</h3>
          </div>
          <p className="text-xs text-orange-100">
            ئازادی تەواو: دەتوانیت ئۆفەری گشتی بۆ چێشتخانەکەت دابنێیت یان خواردنەکان داشکێنیت
          </p>
        </div>
        <div className="px-3 py-1.5 bg-white text-orange-600 font-black text-xs rounded-xl shadow-xs shrink-0">
          ڕێکخستن
        </div>
      </div>

      {/* Quick Action: Pending Orders needing acceptance */}
      {pendingOrders.length > 0 && (
        <div className="bg-white p-4 rounded-3xl border-2 border-amber-300 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <AlertCircle size={15} className="text-amber-600 animate-pulse" />
              <span>داواکاری تازە گەیشتوو ({pendingOrders.length})</span>
            </h4>
            <span className="text-[10px] text-amber-700 font-bold bg-amber-100 px-2 py-0.5 rounded-full">
              پەلە بکە لە قبوڵکردن
            </span>
          </div>

          <div className="space-y-2">
            {pendingOrders.map(order => (
              <div key={order.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-xs text-slate-900">#{order.orderNumber}</span>
                    <span className="text-[11px] font-bold text-slate-700">{order.customerName}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                    {order.items.map(i => `${i.quantity}× ${i.name}`).join('، ')}
                  </p>
                </div>

                <button
                  onClick={() => updateOrderStatus(order.id, 'PREPARING')}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs shrink-0 transition-transform"
                >
                  دەستپێکردن
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

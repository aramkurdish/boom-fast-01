import React from 'react';
import { useApp } from '../../context/AppContext';
import { DollarSign, CheckCircle2, TrendingUp, Calendar, ArrowUpRight } from 'lucide-react';

export const DriverEarnings: React.FC = () => {
  const { currentDriver, orders } = useApp();

  const myDeliveredOrders = orders.filter(
    o => o.driverId === currentDriver.id && o.status === 'DELIVERED'
  );

  return (
    <div className="p-4 pb-24 space-y-4 animate-in fade-in" dir="rtl">
      {/* Header */}
      <div>
        <h2 className="text-lg font-black text-slate-900">داهاتی شۆفێر</h2>
        <p className="text-xs text-slate-500 font-medium">پوختەی دەستکەوت و گەیاندنە سەرکەوتووەکان</p>
      </div>

      {/* Main Earnings Card */}
      <div className="bg-gradient-to-tr from-emerald-700 to-teal-800 text-white rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-emerald-200">کۆی داهاتی ئەمڕۆ</span>
          <span className="text-[10px] font-black bg-white/20 px-2.5 py-0.5 rounded-full">
            نەقد / کاش
          </span>
        </div>

        <div>
          <h3 className="text-3xl font-black">
            {currentDriver.todayEarnings.toLocaleString()} <span className="text-sm font-bold opacity-80">د.ع</span>
          </h3>
          <p className="text-[11px] text-emerald-200 mt-1">
            لەسەر بنەمای {currentDriver.totalDeliveries} گەیاندنی سەرکەوتوو
          </p>
        </div>

        <div className="pt-3 border-t border-emerald-600/60 grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-[10px] text-emerald-300 block">تێکڕای نرخی گەیاندن</span>
            <span className="font-black text-sm">~٣,٥٠٠ د.ع</span>
          </div>
          <div>
            <span className="text-[10px] text-emerald-300 block">پێداچوونەوەی کڕیاران</span>
            <span className="font-black text-sm">⭐ {currentDriver.rating || 4.9}</span>
          </div>
        </div>
      </div>

      {/* Delivery History */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-black text-slate-800">مێژووی گەیاندنەکانی ئەمڕۆ</h3>

        {myDeliveredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-6 text-center border border-slate-100 shadow-2xs">
            <p className="text-xs text-slate-400 font-bold">هیچ داواکارییەکی گەیەندراو تۆمار نەکراوە لەم خولەدا</p>
          </div>
        ) : (
          myDeliveredOrders.map(order => (
            <div
              key={order.id}
              className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <h4 className="font-black text-xs text-slate-900">#{order.orderNumber} • {order.restaurantName}</h4>
                  <span className="text-[10px] text-slate-400">{(order.customerAddress || 'ناونیشانی کڕیار').split('،')[0]}</span>
                </div>
              </div>

              <div className="text-left">
                <span className="font-black text-xs text-emerald-600 block">+{order.deliveryFee.toLocaleString()} د.ع</span>
                <span className="text-[10px] text-slate-400 font-medium">کاش وەرگیرا</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

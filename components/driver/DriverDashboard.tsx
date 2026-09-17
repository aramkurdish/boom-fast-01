import React from 'react';
import { useApp } from '../../context/AppContext';
import { Power, Bike, DollarSign, Package, MapPin, ChevronLeft, ArrowRight, Volume2, ShieldCheck, AlertTriangle } from 'lucide-react';
import { DriverActiveDelivery } from './DriverActiveDelivery';
import { soundService } from '../../services/soundService';

export const DriverDashboard: React.FC = () => {
  const {
    currentDriver,
    toggleDriverOnline,
    orders,
    setDriverTab,
    advanceDriverDeliveryStep,
    playTestSound
  } = useApp();

  // Active delivery for this driver
  const myActiveOrder = orders.find(
    o => o.driverId === currentDriver.id && o.status !== 'DELIVERED' && o.status !== 'CANCELLED'
  );

  // Ready orders available for pickup
  const availableOrders = orders.filter(
    o => o.status === 'READY' && (!o.driverId || o.driverId === '')
  );

  return (
    <div className="p-4 pb-24 space-y-4 animate-in fade-in" dir="rtl">
      {/* Online / Offline Toggle Card */}
      <div className={`p-4 rounded-3xl border-2 transition-all shadow-md ${
        currentDriver.isOnline
          ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-600/20'
          : 'bg-slate-800 text-slate-200 border-slate-700 shadow-slate-900/30'
      }`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl ${
              currentDriver.isOnline ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-400'
            }`}>
              <Bike size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black">{currentDriver.name}</h2>
                <span className={`w-2.5 h-2.5 rounded-full ${
                  currentDriver.isOnline ? 'bg-emerald-300 animate-pulse' : 'bg-slate-500'
                }`} />
              </div>
              <span className="text-xs opacity-90 block mt-0.5">
                دۆخ: {currentDriver.isOnline ? 'بەردەست و سەرهێڵ (Online)' : 'دەرهێڵ (Offline)'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundService.enableAudio();
                playTestSound('driver');
              }}
              className="p-2 rounded-2xl bg-white/15 hover:bg-white/25 text-white transition-all active:scale-90"
              title="تاقیکردنەوەی دەنگی زەنگی داواکاری"
            >
              <Volume2 size={16} />
            </button>
            <button
              onClick={() => toggleDriverOnline(currentDriver.id)}
              className={`px-4 py-2 rounded-2xl font-black text-xs transition-transform active:scale-95 shadow-sm ${
                currentDriver.isOnline
                  ? 'bg-white text-emerald-700 hover:bg-emerald-50'
                  : 'bg-emerald-500 text-white hover:bg-emerald-400'
              }`}
            >
              {currentDriver.isOnline ? 'داخستن' : 'سەرهێڵ بە'}
            </button>
          </div>
        </div>

        {!currentDriver.isOnline && (
          <div className="mt-3 pt-2.5 border-t border-slate-700/80 flex items-center gap-2 text-[11px] text-amber-300">
            <AlertTriangle size={14} className="shrink-0" />
            <span>تۆ دەرهێڵیت؛ سیستەم ناتوانێت داواکاری نوێت بۆ پێشنیاز بکات تاوەکو سەرهێڵ نەبیت.</span>
          </div>
        )}
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 gap-3">
        {/* Today's Earnings */}
        <div
          onClick={() => setDriverTab('EARNINGS')}
          className="bg-white p-4 rounded-3xl border border-slate-100 shadow-2xs cursor-pointer hover:border-emerald-200 transition-all"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold text-slate-600">داهاتی ئەمڕۆ</span>
            <DollarSign size={16} className="text-emerald-600" />
          </div>
          <div className="text-xl font-black text-slate-900">
            {currentDriver.todayEarnings.toLocaleString()} <span className="text-[11px] font-bold text-slate-500">د.ع</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-bold block mt-1">
            {currentDriver.totalDeliveries} گەیاندنی سەرکەوتوو
          </span>
        </div>

        {/* Available Orders count */}
        <div
          onClick={() => setDriverTab('ORDERS')}
          className="bg-white p-4 rounded-3xl border border-slate-100 shadow-2xs cursor-pointer hover:border-orange-200 transition-all"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold text-slate-600">داواکاری نوێ</span>
            <Package size={16} className="text-orange-600" />
          </div>
          <div className="text-xl font-black text-slate-900">
            {currentDriver.isOnline ? availableOrders.length : 0}
          </div>
          <span className="text-[10px] text-orange-600 font-bold block mt-1">
            {currentDriver.isOnline ? 'ئامادەن بۆ وەرگرتن' : 'سەرهێڵ بە بۆ بینین'}
          </span>
        </div>
      </div>

      {/* Active Delivery Flow Card (if driver has an ongoing delivery) */}
      {myActiveOrder ? (
        <div className="bg-white rounded-3xl border-2 border-emerald-500 p-4 shadow-lg shadow-emerald-500/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
              گەیاندنی چالاکی تۆ
            </span>
            <span className="text-xs font-black text-slate-900">#{myActiveOrder.orderNumber}</span>
          </div>

          <DriverActiveDelivery order={myActiveOrder} />
        </div>
      ) : (
        /* Prompt to take orders */
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-2xs text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-2xl">
            🛵
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900">هیچ گەیاندنێکی چالاکت نییە</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              {currentDriver.isOnline
                ? 'دەتوانیت سەردانی بەشی داواکارییەکان بکەیت و داواکارییەکی نوێ هەڵبژێریت.'
                : 'تکایە سەرەتا دۆخەکەت بکە بە سەرهێڵ بۆ ئەوەی داواکاریت پێبگات.'}
            </p>
          </div>

          {currentDriver.isOnline && availableOrders.length > 0 && (
            <button
              onClick={() => setDriverTab('ORDERS')}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-2xl shadow-md transition-transform"
            >
              بینینی داواکارییە ئامادەکان ({availableOrders.length})
            </button>
          )}
        </div>
      )}
    </div>
  );
};

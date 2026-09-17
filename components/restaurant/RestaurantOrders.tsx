import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { OrderStatus } from '../../types';
import { ORDER_STATUS_LABELS } from '../../constants';
import {
  Clock,
  CheckCircle,
  ChefHat,
  PackageCheck,
  Phone,
  MapPin,
  AlertCircle,
  Bell,
  Volume2,
  Bike,
  RotateCw,
  Sparkles
} from 'lucide-react';
import { soundService } from '../../services/soundService';

export const RestaurantOrders: React.FC = () => {
  const {
    currentUser,
    orders,
    drivers,
    updateOrderStatus,
    assignDriverToReadyOrder,
    playTestSound
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'ALL' | 'NEW' | 'PREPARING' | 'READY' | 'COMPLETED'>('ALL');
  const [now, setNow] = useState(Date.now());

  // Tick for countdown displays
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const myRestaurantId = currentUser.restaurantId || 'rest-boom-pizza';
  // Include orders for this restaurant (or all if demo restaurant matches)
  const myOrders = orders.filter(o => !currentUser.restaurantId || o.restaurantId === myRestaurantId);

  const newOrdersCount = myOrders.filter(o => o.status === 'PLACED').length;

  const filteredOrders = myOrders.filter(o => {
    if (activeFilter === 'NEW') return o.status === 'PLACED';
    if (activeFilter === 'PREPARING') return o.status === 'PREPARING' || o.status === 'ACCEPTED';
    if (activeFilter === 'READY') return o.status === 'READY';
    if (activeFilter === 'COMPLETED') {
      return (
        o.status === 'DELIVERED' ||
        o.status === 'ON_THE_WAY' ||
        o.status === 'DRIVER_PICKED_UP' ||
        o.status === 'DRIVER_ACCEPTED'
      );
    }
    return true;
  });

  return (
    <div className="p-4 pb-24 space-y-4 animate-in fade-in" dir="rtl">
      {/* Header & Sound Test */}
      <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-2xs">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-900">بەڕێوەبردنی داواکارییەکان</h2>
              {newOrdersCount > 0 && (
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium">
              سیستەمی ڕاستەوخۆی وەرگرتن، ئامادەکردن، و دۆزینەوەی شۆفێر
            </p>
          </div>

          {/* Test Sound Button */}
          <button
            onClick={() => {
              soundService.enableAudio();
              playTestSound('restaurant');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-black rounded-2xl border border-amber-200/80 transition-all active:scale-95"
            title="تاقیکردنەوەی دەنگی زەنگی داواکاری نوێ"
          >
            <Volume2 size={15} className="text-amber-600 animate-pulse" />
            <span>دەنگی زەنگ</span>
          </button>
        </div>

        {/* Real-time New Orders Banner */}
        {newOrdersCount > 0 && (
          <div className="mt-3 p-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-2xl flex items-center justify-between shadow-md shadow-red-500/20">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <Bell size={18} className="animate-bounce" />
              </div>
              <div>
                <h4 className="text-xs font-black">
                  {newOrdersCount} داواکاری نوێ گەیشتووە!
                </h4>
                <p className="text-[10px] text-red-100">
                  تکایە ئۆردەرەکە بپشکنە و قبوڵی بکە
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveFilter('NEW')}
              className="px-3 py-1 bg-white text-red-600 font-black text-xs rounded-xl hover:bg-red-50 transition-all shadow-xs active:scale-95"
            >
              بینین
            </button>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: 'ALL', label: 'هەموو', count: myOrders.length },
          { id: 'NEW', label: 'داواکاری نوێ (New)', count: newOrdersCount, highlight: newOrdersCount > 0 },
          { id: 'PREPARING', label: 'ئامادەکردن', count: myOrders.filter(o => o.status === 'PREPARING' || o.status === 'ACCEPTED').length },
          { id: 'READY', label: 'ئامادەیە (Ready)', count: myOrders.filter(o => o.status === 'READY').length },
          { id: 'COMPLETED', label: 'بەڕێوەیە / تەواو', count: myOrders.filter(o => ['DELIVERED', 'ON_THE_WAY', 'DRIVER_PICKED_UP', 'DRIVER_ACCEPTED'].includes(o.status)).length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id as any)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeFilter === tab.id
                ? 'bg-blue-600 text-white shadow-sm'
                : tab.highlight
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeFilter === tab.id
                  ? 'bg-white/25 text-white'
                  : tab.highlight
                  ? 'bg-red-200 text-red-800 font-black'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-2xs">
          <Clock size={32} className="mx-auto text-slate-400 mb-2" />
          <p className="text-xs font-bold text-slate-500">هیچ داواکارییەک لەم بەشەدا نییە</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map(order => {
            const statusConfig = ORDER_STATUS_LABELS[order.status] || ORDER_STATUS_LABELS.PLACED;
            const timeStr = new Date(order.createdAt).toLocaleTimeString('ku', {
              hour: '2-digit',
              minute: '2-digit'
            });

            // Calculate remaining seconds for driver assignment countdown
            const elapsed = order.assignmentStartTime
              ? Math.floor((now - order.assignmentStartTime) / 1000)
              : 0;
            const remainingTimer = Math.max(0, 30 - elapsed);

            const candidateDriver = drivers.find(d => d.id === order.currentCandidateDriverId);

            return (
              <div
                key={order.id}
                className={`bg-white rounded-3xl p-4 border shadow-2xs space-y-3 relative transition-all ${
                  order.status === 'PLACED'
                    ? 'border-red-300 ring-2 ring-red-100'
                    : order.status === 'READY'
                    ? 'border-amber-300 ring-2 ring-amber-50'
                    : 'border-slate-100'
                }`}
              >
                {/* Header info */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-slate-900">#{order.orderNumber}</span>
                      <span className="text-xs font-bold text-slate-700">{order.customerName}</span>
                      {order.status === 'PLACED' && (
                        <span className="bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full animate-pulse">
                          نوێ
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">کاتی داواکردن: {timeStr}</span>
                  </div>

                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${statusConfig.color}`}>
                    {statusConfig.label}
                  </span>
                </div>

                {/* Items List */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-start justify-between text-slate-800">
                      <div>
                        <span className="font-black text-blue-700 ml-1">{item.quantity}×</span>
                        <span className="font-bold">{item.name}</span>
                        {item.notes && (
                          <p className="text-[10px] text-amber-600 mr-4 mt-0.5">تێبینی: {item.notes}</p>
                        )}
                      </div>
                      <span className="font-bold text-slate-500">{(item.price * item.quantity).toLocaleString()} د.ع</span>
                    </div>
                  ))}

                  <div className="pt-2 border-t border-slate-200/60 flex justify-between font-black text-xs text-slate-900">
                    <span>کۆی فرۆشی چێشتخانە:</span>
                    <span className="text-blue-600">{order.subtotal.toLocaleString()} د.ع</span>
                  </div>
                </div>

                {/* Address & Note */}
                <div className="text-[11px] text-slate-500 space-y-1">
                  <div className="flex items-center gap-1">
                    <MapPin size={12} className="text-slate-400 shrink-0" />
                    <span className="truncate">{order.customerAddress}</span>
                  </div>
                  {order.customerPhone && (
                    <div className="flex items-center gap-1">
                      <Phone size={12} className="text-slate-400 shrink-0" />
                      <span>{order.customerPhone}</span>
                    </div>
                  )}
                </div>

                {/* Driver Assignment Real-time Status Banner */}
                {order.status === 'READY' && (
                  <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-2">
                    {order.currentCandidateDriverId && candidateDriver ? (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Bike size={16} className="text-amber-600 animate-bounce" />
                            <span className="text-xs font-black text-amber-950">
                              سیستەم پەیوەندی دەکات بە شۆفێر:
                            </span>
                          </div>
                          <span className="text-xs font-black text-amber-700 bg-amber-200/60 px-2 py-0.5 rounded-lg">
                            {remainingTimer}s ماوە
                          </span>
                        </div>
                        <div className="text-[11px] text-amber-900 font-bold flex items-center justify-between">
                          <span>{candidateDriver.name} ({candidateDriver.phone})</span>
                          <span>دووری: {order.distanceKm || 2.1} کم</span>
                        </div>
                        {/* 30s Countdown bar */}
                        <div className="w-full bg-amber-200/60 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-amber-600 h-full rounded-full transition-all duration-1000"
                            style={{ width: `${(remainingTimer / 30) * 100}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-amber-700/80">
                          ئەگەر لە ماوەی {remainingTimer} چرکەدا وەڵام نەداتەوە، خۆکارانە بۆ شۆفێری دواتر دەنێردرێت.
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <AlertCircle size={16} className="text-amber-600 shrink-0" />
                          <span className="text-xs font-bold text-amber-900">
                            شۆفێری سەرهێڵ دەگەڕێت...
                          </span>
                        </div>
                        <button
                          onClick={() => assignDriverToReadyOrder(order.id)}
                          className="px-2.5 py-1 bg-amber-600 text-white text-[11px] font-black rounded-xl flex items-center gap-1 hover:bg-amber-700 active:scale-95"
                        >
                          <RotateCw size={12} />
                          <span>گەڕانەوە</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Driver confirmed banner */}
                {(order.status === 'DRIVER_ACCEPTED' || order.driverName) && order.status !== 'READY' && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Bike size={16} className="text-emerald-600" />
                      <div>
                        <span className="font-black text-emerald-950 block">
                          شۆفێر قبوڵی کرد: {order.driverName}
                        </span>
                        <span className="text-[10px] text-emerald-700">
                          مۆبایل: {order.driverPhone}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-1 rounded-lg">
                      لە ڕێگایە بۆ چێشتخانە
                    </span>
                  </div>
                )}

                {/* Restaurant Status Actions */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                  {order.status === 'PLACED' && (
                    <div className="grid grid-cols-2 gap-2 w-full">
                      <button
                        onClick={() => updateOrderStatus(order.id, 'ACCEPTED')}
                        className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 active:scale-98 text-slate-800 font-black text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle size={15} className="text-emerald-600" />
                        <span>قبوڵکردنی ئۆردەر</span>
                      </button>

                      <button
                        onClick={() => updateOrderStatus(order.id, 'PREPARING')}
                        className="py-2.5 px-3 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                      >
                        <ChefHat size={15} />
                        <span>دەستپێکردنی ئامادەکردن</span>
                      </button>
                    </div>
                  )}

                  {(order.status === 'PREPARING' || order.status === 'ACCEPTED') && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'READY')}
                      className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                    >
                      <PackageCheck size={16} />
                      <span>خواردن ئامادەیە (دۆزینەوەی شۆفێری بەردەست)</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

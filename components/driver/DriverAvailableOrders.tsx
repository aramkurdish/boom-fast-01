import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Store, MapPin, Bike, Navigation, AlertCircle, Clock } from 'lucide-react';

export const DriverAvailableOrders: React.FC = () => {
  const { currentDriver, orders, acceptOrderAsDriver, setDriverTab } = useApp();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Orders that are ready and don't have an active driver assigned
  const availableOrders = orders.filter(
    o => o.status === 'READY' && (!o.driverId || o.driverId === '')
  );

  const handleAccept = (orderId: string) => {
    setErrorMessage(null);
    const res = acceptOrderAsDriver(orderId, currentDriver.id);
    if (res && !res.success && res.error) {
      setErrorMessage(res.error);
      return;
    }
    setDriverTab('DELIVERIES');
  };

  return (
    <div className="p-4 pb-24 space-y-4 animate-in fade-in" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-900">داواکارییە بەردەستەکان</h2>
          <p className="text-xs text-slate-500 font-medium">ئەو داواکارییانەی چاوەڕوانی شۆفێرن</p>
        </div>
        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
          {currentDriver.isOnline ? `${availableOrders.length} بەردەست` : 'دەرهێڵ'}
        </span>
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-50 text-red-700 text-xs font-bold rounded-2xl border border-red-200 flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0 text-red-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {!currentDriver.isOnline ? (
        <div className="bg-white rounded-3xl p-6 text-center border border-slate-100 shadow-2xs space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-2xl">
            💤
          </div>
          <h3 className="font-black text-sm text-slate-800">تۆ ئێستا دەرهێڵیت (Offline)</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            بۆ وەرگرتنی داواکاری و دەستپێکردنی گەیاندن، تکایە دۆخەکەت بکە بە سەرهێڵ.
          </p>
          <button
            onClick={() => setDriverTab('HOME')}
            className="px-5 py-2 bg-emerald-600 text-white rounded-2xl text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition-transform"
          >
            سەرهێڵ بوون لە داشبۆرد
          </button>
        </div>
      ) : availableOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-2xs space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-2xl">
            ✨
          </div>
          <h3 className="font-black text-sm text-slate-800">هیچ داواکارییەکی چاوەڕوان نییە</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            هەر کاتێک ڕێستورانتێک خواردنەکەی ئامادە کرد، لێرەدا دەردەکەوێت بۆ وەرگرتن.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {availableOrders.map(order => (
            <div
              key={order.id}
              className="bg-white rounded-3xl p-4 border border-slate-100 shadow-2xs space-y-3"
            >
              {/* Top info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-black text-xs text-slate-900">#{order.orderNumber}</span>
                  {order.distanceKm && (
                    <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-bold">
                      {order.distanceKm} کم
                    </span>
                  )}
                </div>
                <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                  کرێی تۆ: {order.deliveryFee.toLocaleString()} د.ع
                </span>
              </div>

              {/* Restaurant & Customer Path */}
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Store size={14} className="text-blue-600 shrink-0" />
                  <span className="font-bold text-slate-800">{order.restaurantName}</span>
                  <span className="text-[10px] text-slate-400">({order.restaurantAddress || 'سولەیمانی'})</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-orange-600 shrink-0" />
                  <span className="truncate">{order.customerAddress}</span>
                </div>
              </div>

              {/* Food items count & Price */}
              <div className="p-2.5 bg-slate-50 rounded-2xl text-[11px] text-slate-500 flex justify-between">
                <span>{order.items.reduce((s, i) => s + i.quantity, 0)} خواردن</span>
                <span className="font-bold text-slate-800">کۆی کاش: {order.total.toLocaleString()} د.ع</span>
              </div>

              {/* Accept Order Button */}
              <button
                onClick={() => handleAccept(order.id)}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5"
              >
                <Bike size={16} />
                <span>وەرگرتنی ئەم داواکارییە (قبوڵکردن)</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

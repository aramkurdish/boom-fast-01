import React from 'react';
import { useApp } from '../../context/AppContext';
import { Order } from '../../types';
import { Phone, MapPin, Store, Navigation, CheckCircle2, ArrowLeft, Bike } from 'lucide-react';

export const DriverActiveDelivery: React.FC<{ order: Order }> = ({ order }) => {
  const { advanceDriverDeliveryStep } = useApp();

  const currentStep = order.driverStep || 'ACCEPTED';

  // Determine button text & next state
  let actionButtonText = 'دەچم بۆ ڕێستورانت';
  let actionButtonColor = 'bg-blue-600 hover:bg-blue-700';

  if (currentStep === 'HEADING_TO_RESTAURANT') {
    actionButtonText = 'گەیشتم و داواکارییەکەم وەرگرت لە چێشتخانە';
    actionButtonColor = 'bg-purple-600 hover:bg-purple-700';
  } else if (currentStep === 'PICKED_UP') {
    actionButtonText = 'لە ڕێگام بەرەو ماڵی کڕیار 🛵';
    actionButtonColor = 'bg-indigo-600 hover:bg-indigo-700';
  } else if (currentStep === 'HEADING_TO_CUSTOMER') {
    actionButtonText = 'بە سەرکەوتوویی گەیاندم و پارەکەم وەرگرت (تەواوکردن) ✅';
    actionButtonColor = 'bg-emerald-600 hover:bg-emerald-700';
  }

  const openInMap = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  return (
    <div className="space-y-3.5 text-right" dir="rtl">
      {/* Restaurant Address & Call */}
      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <Store size={16} />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-slate-400 block">وەرگرتن لە چێشتخانە:</span>
            <h4 className="text-xs font-black text-slate-900 truncate">{order.restaurantName}</h4>
            <p className="text-[10px] text-slate-500 truncate">{order.restaurantAddress || 'سولەیمانی'}</p>
          </div>
        </div>

        <button
          onClick={() => openInMap(order.restaurantLocation?.lat || 35.5669, order.restaurantLocation?.lng || 45.4162)}
          className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors shrink-0"
          title="نەخشەی ڕێستورانت"
        >
          <Navigation size={16} />
        </button>
      </div>

      {/* Customer Address & Call */}
      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
            <MapPin size={16} />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-slate-400 block">گەیاندن بۆ کڕیار:</span>
            <h4 className="text-xs font-black text-slate-900 truncate">{order.customerName}</h4>
            <p className="text-[10px] text-slate-500 truncate">{order.customerAddress}</p>
            {order.deliveryNotes && (
              <p className="text-[10px] text-amber-700 font-bold mt-0.5">تێبینی: {order.deliveryNotes}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {order.customerPhone && (
            <a
              href={`tel:${order.customerPhone}`}
              className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors"
              title="پەیوەندی بە کڕیار"
            >
              <Phone size={16} />
            </a>
          )}
          <button
            onClick={() => openInMap(order.customerLocation?.lat || 35.5612, order.customerLocation?.lng || 45.4289)}
            className="p-2 bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-100 transition-colors"
            title="نەخشەی کڕیار"
          >
            <Navigation size={16} />
          </button>
        </div>
      </div>

      {/* Financials for Driver */}
      <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 flex items-center justify-between text-xs">
        <div>
          <span className="text-[10px] text-emerald-800 font-bold block">کرێی گەیاندنی تۆ:</span>
          <span className="text-sm font-black text-emerald-700">+{order.deliveryFee.toLocaleString()} د.ع</span>
        </div>
        <div className="text-left">
          <span className="text-[10px] text-slate-500 font-medium block">کۆی پارەی وەرگیراو لە کڕیار:</span>
          <span className="text-xs font-black text-slate-900">{order.total.toLocaleString()} د.ع (کاش)</span>
        </div>
      </div>

      {/* Progressive Step Action Button */}
      <button
        onClick={() => advanceDriverDeliveryStep(order.id)}
        className={`w-full py-3.5 px-4 text-white font-black text-xs rounded-2xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 ${actionButtonColor}`}
      >
        <span>{actionButtonText}</span>
      </button>
    </div>
  );
};

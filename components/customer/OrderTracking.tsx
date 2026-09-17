import React from 'react';
import { useApp } from '../../context/AppContext';
import { ORDER_STATUS_LABELS } from '../../constants';
import { OrderStatus } from '../../types';
import { CheckCircle2, Clock, Phone, MapPin, Bike, Store, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';

export const OrderTracking: React.FC = () => {
  const { orders, activeOrderId, setActiveOrderId, setCustomerTab } = useApp();

  const order = orders.find(o => o.id === activeOrderId) || orders[0];

  if (!order) {
    return (
      <div className="p-8 text-center text-slate-500" dir="rtl">
        <p className="text-sm font-bold">هیچ داواکارییەکی چالاک نییە.</p>
        <button
          onClick={() => setCustomerTab('HOME')}
          className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-bold"
        >
          گەڕان بۆ خواردن
        </button>
      </div>
    );
  }

  const stepsList: { status: OrderStatus; label: string; stepNumber: number }[] = [
    { status: 'PLACED', label: 'داواکاری نێردرا', stepNumber: 1 },
    { status: 'ACCEPTED', label: 'ڕێستورانت قبوڵی کرد', stepNumber: 2 },
    { status: 'PREPARING', label: 'ئامادە دەکرێت', stepNumber: 3 },
    { status: 'READY', label: 'ئامادەیە', stepNumber: 4 },
    { status: 'DRIVER_PICKED_UP', label: 'Driver داواکارییەکەی وەرگرت', stepNumber: 5 },
    { status: 'ON_THE_WAY', label: 'لە ڕێگایە', stepNumber: 6 },
    { status: 'DELIVERED', label: 'گەیشت', stepNumber: 7 }
  ];

  const currentStepNumber = ORDER_STATUS_LABELS[order.status]?.step || 1;
  const isCancelled = order.status === 'CANCELLED';

  // Coordinates for simulated map route
  const restLat = order.restaurantLocation?.lat || 35.5669;
  const restLng = order.restaurantLocation?.lng || 45.4162;
  const custLat = order.customerLocation?.lat || 35.5612;
  const custLng = order.customerLocation?.lng || 45.4289;

  return (
    <div className="pb-24 animate-in fade-in space-y-4" dir="rtl">
      {/* Top Bar */}
      <div className="bg-white p-4 border-b border-slate-100 flex items-center justify-between">
        <button
          onClick={() => setCustomerTab('ORDERS')}
          className="p-2 rounded-full text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft size={20} className="rotate-180" />
        </button>
        <div className="text-center">
          <h2 className="text-sm font-black text-slate-900">بەدواداچوونی داواکاری</h2>
          <span className="text-[11px] font-bold text-orange-600">#{order.orderNumber}</span>
        </div>
        <div className="w-8" />
      </div>

      <div className="px-4 space-y-4">
        {/* Status Highlight Banner */}
        <div className={`p-4 rounded-3xl border shadow-sm ${
          isCancelled ? 'bg-rose-50 border-rose-200' : 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200/80'
        }`}>
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 block mb-0.5">
                دۆخی ئێستا (هەنگاوی {currentStepNumber} لە ٧)
              </span>
              <h3 className="text-base font-black text-slate-900">
                {ORDER_STATUS_LABELS[order.status]?.label || order.status}
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                {ORDER_STATUS_LABELS[order.status]?.description}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-orange-600 text-white flex items-center justify-center text-xl shadow-md shrink-0">
              {currentStepNumber >= 6 ? '🛵' : currentStepNumber >= 3 ? '👨‍🍳' : '📋'}
            </div>
          </div>
        </div>

        {/* 7-Step Stepper Component */}
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-3">
          <h4 className="text-xs font-black text-slate-800 mb-2">قۆناغەکانی گەیاندن (٧ هەنگاو):</h4>
          <div className="relative pr-6 border-r-2 border-slate-100 space-y-4">
            {stepsList.map((step) => {
              const isCompleted = currentStepNumber >= step.stepNumber && !isCancelled;
              const isCurrent = currentStepNumber === step.stepNumber && !isCancelled;

              return (
                <div key={step.status} className="relative flex items-center justify-between">
                  {/* Step Dot */}
                  <div
                    className={`absolute -right-[31px] w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center ${
                      isCompleted
                        ? 'bg-orange-600 border-orange-600 text-white'
                        : 'bg-white border-slate-300'
                    } ${isCurrent ? 'ring-4 ring-orange-200 scale-110' : ''}`}
                  >
                    {isCompleted && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>

                  {/* Step Label */}
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`text-xs font-bold ${
                      isCurrent
                        ? 'text-orange-600 font-black'
                        : isCompleted
                        ? 'text-slate-800'
                        : 'text-slate-400'
                    }`}>
                      {step.stepNumber}. {step.label}
                    </span>
                  </div>

                  {isCurrent && (
                    <span className="text-[10px] font-black bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full animate-pulse">
                      ئێستا
                    </span>
                  )}
                  {isCompleted && !isCurrent && (
                    <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Simulated Interactive OpenStreetMap Visualization */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <MapPin size={14} className="text-orange-600" />
              <span>نەخشەی ڕاستەوخۆی شۆفێر و چێشتخانە</span>
            </span>
            <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
              OpenStreetMap
            </span>
          </div>

          <div className="relative h-48 bg-slate-100 flex items-center justify-center overflow-hidden">
            {/* Embedded OpenStreetMap view */}
            <iframe
              title="Delivery Map"
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              marginHeight={0}
              marginWidth={0}
              src={`https://www.openstreetmap.org/export/embed.html?bbox=45.38%2C35.54%2C45.45%2C35.58&layer=mapnik&marker=${restLat}%2C${restLng}`}
              className="opacity-90 pointer-events-none"
            />

            {/* Visual Route Overlay */}
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3">
              {/* Restaurant marker */}
              <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-xl shadow-md border border-slate-200 self-start text-[11px] font-bold text-slate-800">
                <Store size={13} className="text-blue-600" />
                <span>{order.restaurantName}</span>
              </div>

              {/* Driver Live Marker (moving simulation) */}
              <div className="flex items-center gap-1.5 bg-orange-600 text-white px-2.5 py-1 rounded-xl shadow-lg border border-orange-400 self-center animate-bounce text-[11px] font-black">
                <Bike size={14} />
                <span>شۆفێر: {order.driverName || 'لە گەڕان بەدوای شۆفێر'}</span>
              </div>

              {/* Customer marker */}
              <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-xl shadow-md border border-slate-200 self-end text-[11px] font-bold text-slate-800">
                <MapPin size={13} className="text-rose-600" />
                <span>ماڵی تۆ: {(order.customerAddress || 'شوێنی دیاریکراو').split('،')[0]}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Driver Details Card (if driver assigned) */}
        {order.driverName ? (
          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-lg">
                <Bike size={24} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block">شۆفێری گەیاندن</span>
                <h4 className="text-xs font-black text-slate-900">{order.driverName}</h4>
                <p className="text-[11px] text-slate-500">{order.driverPhone || '+964 750 444 1122'}</p>
              </div>
            </div>

            <a
              href={`tel:${order.driverPhone || '+9647504441122'}`}
              className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-100 transition-colors shadow-2xs"
              title="پەیوەندی بکە"
            >
              <Phone size={18} />
            </a>
          </div>
        ) : (
          <div className="bg-amber-50 p-3.5 rounded-3xl border border-amber-200/80 flex items-center gap-3 text-amber-800 text-xs">
            <Clock size={18} className="text-amber-600 shrink-0 animate-spin" />
            <div>
              <span className="font-bold block">سیستەم لە گەڕاندایە بۆ شۆفێری نزیک...</span>
              <span className="text-[10px] text-amber-700">هەر کە خواردنەکە ئامادە بوو، شۆفێر داواکارییەکە وەردەگرێت.</span>
            </div>
          </div>
        )}

        {/* Order Items Breakdown */}
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-2.5">
          <h4 className="text-xs font-black text-slate-800 border-b border-slate-100 pb-2">وردەکاری داواکاری:</h4>
          <div className="space-y-1.5 text-xs">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-slate-700">
                <span>{item.quantity}× {item.name}</span>
                <span className="font-bold">{(item.price * item.quantity).toLocaleString()} د.ع</span>
              </div>
            ))}
            <div className="pt-2 border-t border-slate-100 flex justify-between text-slate-500">
              <span>کرێی گەیاندن {order.distanceKm ? `(${order.distanceKm} کم بەپێی GPS)` : ''}:</span>
              <span className="font-bold text-orange-600">{order.deliveryFee.toLocaleString()} د.ع</span>
            </div>
            <div className="pt-1 flex justify-between font-black text-sm text-slate-900">
              <span>کۆی گشتی:</span>
              <span className="text-orange-600">{order.total.toLocaleString()} د.ع</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

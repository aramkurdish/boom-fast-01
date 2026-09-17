import React from 'react';
import { useApp } from '../../context/AppContext';
import { ORDER_STATUS_LABELS } from '../../constants';
import { Clock, Store, ChevronLeft, MapPin, ArrowRight } from 'lucide-react';

export const CustomerOrders: React.FC = () => {
  const { orders, setActiveOrderId, setCustomerTab } = useApp();

  return (
    <div className="p-4 pb-24 space-y-4 animate-in fade-in" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-900">داواکارییەکانم</h2>
          <p className="text-xs text-slate-500 font-medium">مێژوو و بەدواداچوونی داواکارییەکانت</p>
        </div>
        <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full">
          {orders.length} داواکاری
        </span>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-2xs space-y-3">
          <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center mx-auto text-2xl">
            🛍️
          </div>
          <h3 className="font-black text-sm text-slate-800">هیچ داواکارییەکت نەکردووە</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            خواردنی دڵخوازت لە باشترین چێشتخانەکانی شار هەڵبژێرە و داوای بکە.
          </p>
          <button
            onClick={() => setCustomerTab('HOME')}
            className="px-5 py-2 bg-orange-600 text-white rounded-2xl text-xs font-bold shadow-md shadow-orange-600/20 active:scale-95 transition-transform"
          >
            گەڕان لە ڕێستورانتەکان
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const statusConfig = ORDER_STATUS_LABELS[order.status] || ORDER_STATUS_LABELS.PLACED;
            const dateStr = new Date(order.createdAt).toLocaleDateString('ku', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl p-4 border border-slate-100 shadow-2xs hover:shadow-md transition-all space-y-3"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center font-black shrink-0">
                      <Store size={18} />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-black text-slate-900">{order.restaurantName}</h3>
                      <span className="text-[10px] text-slate-400 font-medium">{dateStr}</span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${statusConfig.color}`}>
                    {statusConfig.label}
                  </span>
                </div>

                {/* Items Summary */}
                <div className="bg-slate-50 rounded-2xl p-2.5 text-xs text-slate-600 space-y-1">
                  <p className="font-medium line-clamp-1">
                    {order.items.map(i => `${i.quantity}× ${i.name}`).join('، ')}
                  </p>
                  <div className="flex justify-between items-center text-[11px] font-bold text-slate-800 pt-1 border-t border-slate-200/60">
                    <span>کۆی گشتی:</span>
                    <span className="text-orange-600">{order.total.toLocaleString()} د.ع</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-400 font-bold">
                    #{order.orderNumber}
                  </span>

                  <button
                    onClick={() => {
                      setActiveOrderId(order.id);
                      setCustomerTab('ORDERS'); // Track view opens
                    }}
                    className="text-xs font-black text-white bg-slate-900 hover:bg-black px-3.5 py-1.5 rounded-xl flex items-center gap-1 shadow-xs transition-colors"
                  >
                    <span>بەدواداچوون</span>
                    <ChevronLeft size={14} className="rotate-180" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

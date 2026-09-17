import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OrderStatus } from '../../types';
import { ORDER_STATUS_LABELS } from '../../constants';
import { Store, User, MapPin, Bike, Clock, ChevronDown } from 'lucide-react';

export const AdminOrders: React.FC = () => {
  const { orders, updateOrderStatus } = useApp();

  const [filter, setFilter] = useState<'ALL' | OrderStatus>('ALL');

  const filteredOrders = orders.filter(o => {
    if (filter === 'ALL') return true;
    return o.status === filter;
  });

  return (
    <div className="space-y-4 animate-in fade-in" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-900">بەڕێوەبردنی داواکارییەکان</h2>
          <p className="text-xs text-slate-500 font-medium">چاودێری و فلتەرکردنی گشت داواکارییەکانی سیستەم</p>
        </div>
        <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full">
          {orders.length} ئۆردەر
        </span>
      </div>

      {/* Filters Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: 'ALL', label: 'هەموو' },
          { id: 'PLACED', label: 'نوێ' },
          { id: 'PREPARING', label: 'ئامادەکردن' },
          { id: 'READY', label: 'ئامادەیە' },
          { id: 'ON_THE_WAY', label: 'لە ڕێگایە' },
          { id: 'DELIVERED', label: 'گەیەندراو' },
          { id: 'CANCELLED', label: 'هەڵوەشاوە' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              filter === tab.id
                ? 'bg-purple-700 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filteredOrders.map(order => {
          const statusConfig = ORDER_STATUS_LABELS[order.status] || ORDER_STATUS_LABELS.PLACED;
          const timeStr = new Date(order.createdAt).toLocaleTimeString('ku', {
            hour: '2-digit',
            minute: '2-digit'
          });

          return (
            <div
              key={order.id}
              className="bg-white p-4 rounded-3xl border border-slate-100 shadow-2xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm text-slate-900">#{order.orderNumber}</span>
                  <span className="text-xs text-slate-400 font-medium">• {timeStr}</span>
                </div>
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${statusConfig.color}`}>
                  {statusConfig.label}
                </span>
              </div>

              {/* Parties */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-2xl">
                <div>
                  <span className="text-[10px] text-slate-400 block">چێشتخانە:</span>
                  <span className="font-bold text-slate-800">{order.restaurantName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">کڕیار:</span>
                  <span className="font-bold text-slate-800">{order.customerName}</span>
                </div>
              </div>

              {/* Items & Financials */}
              <div className="text-xs space-y-1">
                <p className="text-slate-600 truncate">
                  {order.items.map(i => `${i.quantity}× ${i.name}`).join('، ')}
                </p>
                <div className="flex justify-between items-center pt-1.5 border-t border-slate-100 font-bold">
                  <span className="text-slate-500">کۆی گشتی (خواردن + گەیاندن):</span>
                  <span className="text-purple-700 font-black">{order.total.toLocaleString()} د.ع</span>
                </div>
              </div>

              {/* Driver and Address */}
              <div className="text-[11px] text-slate-500 space-y-0.5">
                <div>📍 {order.customerAddress}</div>
                {order.driverName && (
                  <div className="text-emerald-700 font-bold">🛵 شۆفێر: {order.driverName}</div>
                )}
              </div>

              {/* Admin status changer */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold text-slate-400">دەستکاری باری ئۆردەر:</span>
                <select
                  value={order.status}
                  onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                  className="text-xs p-1.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-700 focus:outline-none"
                >
                  <option value="PLACED">1. داواکاری نێردرا</option>
                  <option value="ACCEPTED">2. قبوڵکرا لە ڕێستورانت</option>
                  <option value="PREPARING">3. ئامادەکردن</option>
                  <option value="READY">4. ئامادەیە</option>
                  <option value="DRIVER_PICKED_UP">5. Driver وەریگرت</option>
                  <option value="ON_THE_WAY">6. لە ڕێگایە</option>
                  <option value="DELIVERED">7. گەیشت</option>
                  <option value="CANCELLED">هەڵوەشێنراوە</option>
                </select>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

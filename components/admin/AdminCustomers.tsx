import React from 'react';
import { useApp } from '../../context/AppContext';
import { User, Phone, MapPin, Shield, CheckCircle2, Ban } from 'lucide-react';

export const AdminCustomers: React.FC = () => {
  const { orders } = useApp();

  // Aggregate customers from orders
  const customersMap = new Map<string, { name: string; phone: string; address: string; orderCount: number; totalSpent: number }>();

  orders.forEach(o => {
    const existing = customersMap.get(o.customerId) || {
      name: o.customerName,
      phone: o.customerPhone,
      address: o.customerAddress,
      orderCount: 0,
      totalSpent: 0
    };
    existing.orderCount += 1;
    existing.totalSpent += o.total;
    customersMap.set(o.customerId, existing);
  });

  const customersList = Array.from(customersMap.entries());

  return (
    <div className="space-y-4 animate-in fade-in" dir="rtl">
      <div>
        <h2 className="text-lg font-black text-slate-900">بەڕێوەبردنی کڕیاران</h2>
        <p className="text-xs text-slate-500 font-medium">بینینی کڕیاران، مێژووی داواکاری و ژمارەی مۆبایل</p>
      </div>

      <div className="space-y-3">
        {customersList.map(([id, cust]) => (
          <div
            key={id}
            className="bg-white p-4 rounded-3xl border border-slate-100 shadow-2xs space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-black">
                  <User size={20} />
                </div>
                <div>
                  <h3 className="font-black text-xs sm:text-sm text-slate-900">{cust.name}</h3>
                  <span className="text-[11px] text-slate-400 font-medium">{cust.phone}</span>
                </div>
              </div>

              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                چالاک
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
              <div className="bg-slate-50 p-2 rounded-xl">
                <span className="text-[10px] text-slate-400 block">ژمارەی داواکاری</span>
                <span className="font-black text-slate-800">{cust.orderCount} جار</span>
              </div>
              <div className="bg-slate-50 p-2 rounded-xl">
                <span className="text-[10px] text-slate-400 block">کۆی خەرجکراو</span>
                <span className="font-black text-purple-700">{cust.totalSpent.toLocaleString()} د.ع</span>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 truncate">
              📍 دوایین ناونیشان: {cust.address}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

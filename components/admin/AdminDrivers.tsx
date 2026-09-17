import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Bike, Power, Star } from 'lucide-react';
import { AddDriverModal } from './AddDriverModal';

export const AdminDrivers: React.FC = () => {
  const { drivers, toggleDriverActive } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-4 animate-in fade-in" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-900">بەڕێوەبردنی شۆفێران</h2>
          <p className="text-xs text-slate-500 font-medium">دروستکردنی ئەکاونت و چالاککردنی شۆفێر</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-2xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-transform"
        >
          <Plus size={16} />
          <span>+ Add Driver</span>
        </button>
      </div>

      {/* Drivers List */}
      <div className="space-y-3">
        {drivers.map(driver => (
          <div
            key={driver.id}
            className="bg-white p-4 rounded-3xl border border-slate-100 shadow-2xs space-y-2.5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xl shrink-0">
                  <Bike size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-xs sm:text-sm text-slate-900">{driver.name}</h3>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                      driver.isOnline ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {driver.isOnline ? 'سەرهێڵ' : 'دەرهێڵ'}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">{driver.phone} • {driver.vehicleType}</span>
                </div>
              </div>

              <button
                onClick={() => toggleDriverActive(driver.id)}
                className={`p-2 rounded-xl border transition-colors ${
                  driver.isActive
                    ? 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                    : 'border-rose-200 text-rose-500 hover:bg-rose-50'
                }`}
                title={driver.isActive ? 'سڕکردن' : 'چالاککردن'}
              >
                <Power size={15} />
              </button>
            </div>

            {/* Performance KPIs */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center text-xs">
              <div className="bg-slate-50 p-2 rounded-xl">
                <span className="text-[10px] text-slate-400 block">گەیاندنەکان</span>
                <span className="font-black text-slate-800">{driver.totalDeliveries}</span>
              </div>
              <div className="bg-slate-50 p-2 rounded-xl">
                <span className="text-[10px] text-slate-400 block">داهاتی ئەمڕۆ</span>
                <span className="font-black text-emerald-600">{driver.todayEarnings.toLocaleString()}</span>
              </div>
              <div className="bg-slate-50 p-2 rounded-xl">
                <span className="text-[10px] text-slate-400 block">هەڵسەنگاندن</span>
                <span className="font-black text-amber-500 flex items-center justify-center gap-0.5">
                  <Star size={11} className="fill-amber-400" />
                  <span>{driver.rating || 5.0}</span>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Driver Modal */}
      <AddDriverModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

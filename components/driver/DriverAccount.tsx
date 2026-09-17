import React from 'react';
import { useApp } from '../../context/AppContext';
import { Bike, Phone, ShieldCheck, LogOut, Star, TrendingUp, CheckCircle2 } from 'lucide-react';

export const DriverAccount: React.FC = () => {
  const { currentDriver, currentUser, logout, toggleDriverOnline } = useApp();

  return (
    <div className="p-4 pb-24 space-y-4 animate-in fade-in" dir="rtl">
      {/* Profile Header */}
      <div className="bg-gradient-to-tr from-emerald-900 to-teal-800 text-white rounded-3xl p-5 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center text-white font-black text-2xl shadow-lg border border-emerald-400/30">
            <Bike size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black tracking-tight">{currentDriver.name || currentUser.name}</h2>
              <span className="text-[10px] font-bold bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 px-2 py-0.5 rounded-full">
                Driver (شۆفێری گەیاندن)
              </span>
            </div>
            <p className="text-xs text-emerald-200 font-medium mt-0.5 font-mono">
              {currentDriver.phone || currentUser.phone} • {currentDriver.vehicleType || 'ماتۆڕسکیل'}
            </p>
          </div>
        </div>

        {/* Status indicator */}
        <div className="mt-4 pt-3 border-t border-emerald-700/60 flex items-center justify-between text-xs text-emerald-100">
          <span>دۆخی شۆفێر: <strong>{currentDriver.isOnline ? 'سەرهێڵ (Online)' : 'دەرهێڵ (Offline)'}</strong></span>
          <button
            onClick={toggleDriverOnline}
            className={`px-3 py-1 rounded-xl font-bold text-xs transition-colors ${
              currentDriver.isOnline
                ? 'bg-rose-500/30 text-rose-200 border border-rose-400/40'
                : 'bg-emerald-500 text-white shadow-xs'
            }`}
          >
            {currentDriver.isOnline ? 'چوونە دەرهێڵ' : 'چوونە سەرهێڵ'}
          </button>
        </div>
      </div>

      {/* Security and Role Guarantee */}
      <div className="bg-emerald-50 rounded-3xl p-4 border border-emerald-200/80 space-y-2 text-xs">
        <div className="flex items-center gap-2 font-black text-emerald-900">
          <ShieldCheck size={18} className="text-emerald-600" />
          <span>هەژماری تایبەت بە گەیاندن (Driver Account)</span>
        </div>
        <p className="text-[11px] text-emerald-800 leading-relaxed">
          ئەم هەژمارە بە فەرمی لەلایەن <strong>Super Admin</strong> ـەوە تۆمارکراوە و پەسەند کراوە. هەموو پارە و حەقدەستەکان لە بەشی داهات پاشەکەوت دەکرێن.
        </p>
      </div>

      {/* Driver Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-2xs">
          <span className="text-[11px] text-slate-400 font-bold block">سەرجەم گەیاندنەکان</span>
          <div className="text-xl font-black text-slate-900 mt-1 flex items-center gap-1.5">
            <CheckCircle2 size={18} className="text-emerald-600" />
            <span>{currentDriver.totalDeliveries} گەیاندن</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-2xs">
          <span className="text-[11px] text-slate-400 font-bold block">هەڵسەنگاندن</span>
          <div className="text-xl font-black text-amber-500 mt-1 flex items-center gap-1.5">
            <Star size={18} className="fill-amber-400 text-amber-400" />
            <span>{currentDriver.rating || 5.0} / 5.0</span>
          </div>
        </div>
      </div>

      {/* Logout button */}
      <button
        onClick={logout}
        className="w-full p-3.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-rose-200"
      >
        <LogOut size={16} />
        <span>دەرچوون لە هەژماری شۆفێر</span>
      </button>
    </div>
  );
};

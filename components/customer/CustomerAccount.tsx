import React from 'react';
import { useApp } from '../../context/AppContext';
import { User, Phone, MapPin, Globe, Shield, LogOut, ChevronLeft } from 'lucide-react';

export const CustomerAccount: React.FC = () => {
  const { currentUser, userLocation, setIsAuthModalOpen, logout } = useApp();

  return (
    <div className="p-4 pb-24 space-y-4 animate-in fade-in" dir="rtl">
      {/* Profile Card */}
      <div className="bg-gradient-to-tr from-slate-900 to-slate-800 text-white rounded-3xl p-5 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-orange-600 flex items-center justify-center text-white font-black text-2xl shadow-lg border border-orange-400/30">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black tracking-tight">{currentUser.name}</h2>
              <span className="text-[10px] font-bold bg-orange-500/30 text-orange-300 border border-orange-400/40 px-2 py-0.5 rounded-full">
                Customer (کڕیار)
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium mt-0.5 font-mono">{currentUser.phone}</p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-300">
          <span>ئەندامە لە: ٢٠٢٦</span>
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="text-orange-400 hover:text-orange-300 font-bold underline text-xs"
          >
            گۆڕینی هەژمار / چوونەژوورەوە
          </button>
        </div>
      </div>

      {/* Account Type Guarantee Card */}
      <div className="bg-emerald-50 rounded-3xl p-4 border border-emerald-200/80 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
          <Shield size={18} />
        </div>
        <div>
          <span className="text-xs font-black text-emerald-900 block">هەژماری کڕیار (Customer Account)</span>
          <span className="text-[10px] text-emerald-700 font-medium">
            ئەم هەژمارە تایبەتە بە داواکردنی خواردن و گەیاندن. ئەکاونتی ڕێستورانت و شۆفێران تەنها لەلایەن سوپەر ئەدمینەوە پەسەند دەکرێن.
          </span>
        </div>
      </div>

      {/* Settings list */}
      <div className="bg-white rounded-3xl p-2 border border-slate-100 shadow-2xs space-y-1">
        <div className="p-3 flex items-center justify-between hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <MapPin size={18} />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">ناونیشانی پاشەکەوتکراو</span>
              <span className="text-[10px] text-slate-400 line-clamp-1">{userLocation.address}</span>
            </div>
          </div>
          <ChevronLeft size={16} className="text-slate-400" />
        </div>

        <div className="p-3 flex items-center justify-between hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Globe size={18} />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">زمان و ڕێکخستنی ناوچە</span>
              <span className="text-[10px] text-slate-400">کوردی سۆرانی (RTL)</span>
            </div>
          </div>
          <span className="text-[11px] font-bold text-slate-500">کوردی</span>
        </div>

        <div className="p-3 flex items-center justify-between hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Shield size={18} />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">یاساکانی ڕۆڵ و پاراستن</span>
              <span className="text-[10px] text-slate-400">کڕیار ناتوانێت ڕۆڵ بگۆڕێت</span>
            </div>
          </div>
          <ChevronLeft size={16} className="text-slate-400" />
        </div>
      </div>

      {/* Logout / Switch Account button */}
      <button
        onClick={() => setIsAuthModalOpen(true)}
        className="w-full p-3.5 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-orange-200"
      >
        <LogOut size={16} />
        <span>چوونەژوورەوە بە هەژمارێکی تر</span>
      </button>
    </div>
  );
};

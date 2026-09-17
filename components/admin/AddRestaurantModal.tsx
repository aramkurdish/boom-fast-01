import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Store, User, Phone, Lock, CheckCircle2, AlertCircle } from 'lucide-react';

export const AddRestaurantModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { createRestaurantAccount } = useApp();

  const [restaurantName, setRestaurantName] = useState('');
  const [managerName, setManagerName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [category, setCategory] = useState('پیتزا');
  const [address, setAddress] = useState('سولەیمانی');
  const [errorMsg, setErrorMsg] = useState('');
  const [successInfo, setSuccessInfo] = useState<{ phone: string; name: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!restaurantName.trim() || !managerName.trim() || !phone.trim() || !password.trim()) {
      setErrorMsg('تکایە هەموو زانیارییە پێویستەکان پڕبکەرەوە.');
      return;
    }

    const res = createRestaurantAccount({
      restaurantName,
      managerName,
      phone,
      password,
      category,
      address
    });

    if (!res.success) {
      setErrorMsg(res.error || 'هەڵەیەک ڕوویدا لە دروستکردنی ئەکاونت.');
      return;
    }

    setSuccessInfo({
      phone,
      name: restaurantName
    });
  };

  const handleClose = () => {
    setRestaurantName('');
    setManagerName('');
    setPhone('');
    setPassword('');
    setErrorMsg('');
    setSuccessInfo(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" dir="rtl">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-5 overflow-hidden animate-in slide-in-from-bottom-4 space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
              <Store size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">+ Add Restaurant</h3>
              <p className="text-[11px] text-slate-400">دروستکردنی هەژماری چێشتخانە لەلایەن Super Admin</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>

        {successInfo ? (
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h4 className="font-black text-emerald-900 text-sm">ڕێستورانت بە سەرکەوتوویی زیادکرا!</h4>
              <p className="text-xs text-emerald-700 mt-1">
                هەژمار بۆ <strong>{successInfo.name}</strong> دروستکرا بە ڕۆڵی خۆکاری <strong>Restaurant</strong>.
              </p>
              <div className="mt-2 p-2 bg-white rounded-xl border border-emerald-100 text-[11px] text-slate-600">
                <span>ژمارەی مۆبایل بۆ چوونەژوورەوە: </span>
                <strong className="text-slate-900">{successInfo.phone}</strong>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs"
            >
              تەواو
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            {/* Automatic Role Badge */}
            <div className="p-2.5 bg-blue-50/80 rounded-2xl border border-blue-200/60 flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-900 font-bold">
                <CheckCircle2 size={16} className="text-blue-600" />
                <span>ڕۆڵی هەژمار:</span>
              </div>
              <span className="px-2.5 py-1 bg-blue-600 text-white font-black rounded-lg text-[10px] tracking-wide">
                Restaurant (خۆکار)
              </span>
            </div>

            {/* Restaurant Name */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">ناوی ڕێستورانت *</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  placeholder="وەک: بەرگەر ماستەر"
                  className="w-full p-2.5 pr-8 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <Store size={14} className="absolute right-2.5 top-3 text-slate-400" />
              </div>
            </div>

            {/* Manager Name */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">ناوی بەڕێوەبەر *</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={managerName}
                  onChange={(e) => setManagerName(e.target.value)}
                  placeholder="وەک: کامەران جەلال"
                  className="w-full p-2.5 pr-8 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <User size={14} className="absolute right-2.5 top-3 text-slate-400" />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">ژمارەی مۆبایل *</label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0750XXXXXXX"
                  className="w-full p-2.5 pr-8 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none text-left dir-ltr"
                />
                <Phone size={14} className="absolute right-2.5 top-3 text-slate-400" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">وشەی نهێنی (Password) *</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2.5 pr-8 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none text-left dir-ltr"
                />
                <Lock size={14} className="absolute right-2.5 top-3 text-slate-400" />
              </div>
            </div>

            {/* Optional category & address */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <label className="block font-bold text-slate-700 mb-1">پۆلێن</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  <option value="پیتزا">پیتزا 🍕</option>
                  <option value="بەرگەر">بەرگەر 🍔</option>
                  <option value="شاوەرمە">شاوەرمە 🥙</option>
                  <option value="کوردەواری">کوردەواری 🍲</option>
                  <option value="شیرینی">شیرینی 🍰</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ناونیشان</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="وەک: شەقامی سالمی"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl font-bold flex items-center gap-1.5">
                <AlertCircle size={14} />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-black rounded-xl shadow-md shadow-blue-600/20 transition-all text-xs"
            >
              دروستکردنی ئەکاونتی ڕێستورانت
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

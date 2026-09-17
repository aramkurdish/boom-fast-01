import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Bike, Phone, Lock, CheckCircle2, AlertCircle, Car } from 'lucide-react';

export const AddDriverModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { createDriverAccount } = useApp();

  const [driverName, setDriverName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [vehicleType, setVehicleType] = useState('ماتۆڕسکیل');
  const [errorMsg, setErrorMsg] = useState('');
  const [successInfo, setSuccessInfo] = useState<{ phone: string; name: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!driverName.trim() || !phone.trim() || !password.trim()) {
      setErrorMsg('تکایە سەرجەم خانەکان (ناوی شۆفێر، ژمارەی مۆبایل، وشەی نهێنی) پڕبکەرەوە.');
      return;
    }

    const res = createDriverAccount({
      driverName,
      phone,
      password,
      vehicleType
    });

    if (!res.success) {
      setErrorMsg(res.error || 'هەڵەیەک ڕوویدا لە دروستکردنی ئەکاونتی شۆفێر.');
      return;
    }

    setSuccessInfo({
      phone,
      name: driverName
    });
  };

  const handleClose = () => {
    setDriverName('');
    setPhone('');
    setPassword('');
    setVehicleType('ماتۆڕسکیل');
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
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
              <Bike size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">+ Add Driver</h3>
              <p className="text-[11px] text-slate-400">دروستکردنی هەژماری شۆفێر لەلایەن Super Admin</p>
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
              <h4 className="font-black text-emerald-900 text-sm">شۆفێر بە سەرکەوتوویی زیادکرا!</h4>
              <p className="text-xs text-emerald-700 mt-1">
                هەژماری شۆفێر بۆ <strong>{successInfo.name}</strong> دروستکرا بە ڕۆڵی خۆکاری <strong>Driver</strong>.
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
            <div className="p-2.5 bg-emerald-50/80 rounded-2xl border border-emerald-200/60 flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-900 font-bold">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span>ڕۆڵی هەژمار:</span>
              </div>
              <span className="px-2.5 py-1 bg-emerald-600 text-white font-black rounded-lg text-[10px] tracking-wide">
                Driver (خۆکار)
              </span>
            </div>

            {/* Driver Name */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">ناوی Driver *</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  placeholder="وەک: ئاسۆ ئەحمەد"
                  className="w-full p-2.5 pr-8 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <Bike size={14} className="absolute right-2.5 top-3 text-slate-400" />
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
                  className="w-full p-2.5 pr-8 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-left dir-ltr"
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
                  className="w-full p-2.5 pr-8 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-left dir-ltr"
                />
                <Lock size={14} className="absolute right-2.5 top-3 text-slate-400" />
              </div>
            </div>

            {/* Vehicle Type */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">جۆری ئۆتۆمبێل / ماتۆڕ *</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'ماتۆڕسکیل', icon: Bike },
                  { label: 'ئۆتۆمبێل', icon: Car },
                  { label: 'پایسکل', icon: Bike }
                ].map((v) => (
                  <button
                    key={v.label}
                    type="button"
                    onClick={() => setVehicleType(v.label)}
                    className={`p-2.5 rounded-xl border text-center font-bold flex flex-col items-center gap-1 transition-all ${
                      vehicleType === v.label
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <v.icon size={16} />
                    <span className="text-[11px]">{v.label}</span>
                  </button>
                ))}
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
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black rounded-xl shadow-md shadow-emerald-600/20 transition-all text-xs"
            >
              دروستکردنی ئەکاونتی Driver
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

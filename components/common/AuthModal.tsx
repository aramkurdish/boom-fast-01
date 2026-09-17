import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Lock, Phone, User, ShieldCheck, CheckCircle2, KeyRound, ArrowLeft } from 'lucide-react';

export const AuthModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { registerCustomer, loginWithCredentials, accounts } = useApp();

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (isRegisterMode) {
      // Customer registration: role is strictly and automatically 'CUSTOMER'
      if (!name.trim() || !phone.trim() || !password.trim()) {
        setErrorMsg('تکایە ناوی کڕیار، ژمارەی مۆبایل و وشەی نهێنی پڕبکەرەوە.');
        return;
      }
      const res = registerCustomer(name, phone, password);
      if (!res.success) {
        setErrorMsg(res.error || 'هەڵەیەک ڕوویدا لە کاتی دروستکردنی هەژمار.');
        return;
      }
      onClose();
    } else {
      // Credential-based login: logs into the exact assigned role (Customer, Restaurant, Driver, or Super Admin)
      if (!phone.trim() || !password.trim()) {
        setErrorMsg('تکایە ژمارەی مۆبایل و وشەی نهێنی پڕبکەرەوە.');
        return;
      }
      const res = loginWithCredentials(phone, password);
      if (!res.success) {
        setErrorMsg(res.error || 'ژمارەی مۆبایل یان وشەی نهێنی هەڵەیە.');
        return;
      }
      onClose();
    }
  };

  const handleFillCredentials = (demoPhone: string, demoPass: string) => {
    setPhone(demoPhone);
    setPassword(demoPass);
    setIsRegisterMode(false);
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" dir="rtl">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-5 overflow-hidden animate-in slide-in-from-bottom-4 space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <Lock size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">
                {isRegisterMode ? 'دروستکردنی هەژماری کڕیار' : 'چوونەژوورەوەی هەژمار'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isRegisterMode ? 'تایبەت بە کڕیاران بۆ داواکردنی خواردن' : 'بە ژمارەی مۆبایل و وشەی نهێنی'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Customer Self-Registration / Login Form */}
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {isRegisterMode && (
            <div>
              <label className="block font-bold text-slate-700 mb-1">ناوی کڕیار *</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="وەک: دڵشاد حەمە"
                  className="w-full p-2.5 pr-8 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
                <User size={14} className="absolute right-2.5 top-3 text-slate-400" />
              </div>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 mb-1">ژمارەی مۆبایل *</label>
            <div className="relative">
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0750XXXXXXX"
                className="w-full p-2.5 pr-8 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-none text-left dir-ltr"
              />
              <Phone size={14} className="absolute right-2.5 top-3 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">وشەی نهێنی (Password) *</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-2.5 pr-8 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-none text-left dir-ltr"
              />
              <KeyRound size={14} className="absolute right-2.5 top-3 text-slate-400" />
            </div>
          </div>

          {/* Explicit Role Policy Note */}
          {isRegisterMode ? (
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200/60 text-[11px] text-emerald-800 space-y-1">
              <div className="flex items-center gap-1.5 font-black text-emerald-900">
                <CheckCircle2 size={14} className="text-emerald-600" />
                <span>ڕۆڵی هەژمار: کڕیار (Customer)</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                هەژمارەکەت بە شێوەی خۆکار وەک <strong>کڕیار</strong> تۆمار دەکرێت. هەژماری چێشتخانەکان و شۆفێران تەنها لەلایەن Super Admin دروست دەکرێن.
              </p>
            </div>
          ) : (
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/60 text-[11px] text-slate-600">
              سیستەمەکە بەپێی ژمارەی مۆبایل و وشەی نهێنی خۆکار دەچێتە داشبۆردی دیاریکراوی خۆت (کڕیار، چێشتخانە، شۆفێر، یان سوپەر ئەدمین).
            </div>
          )}

          {errorMsg && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl font-bold text-xs">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-orange-600 hover:bg-orange-700 active:scale-98 text-white font-black rounded-xl shadow-md shadow-orange-600/20 transition-all text-xs"
          >
            {isRegisterMode ? 'تەواوکردن و دروستکردنی هەژماری کڕیار' : 'چوونەژوورەوە'}
          </button>
        </form>

        {/* Switch Register/Login */}
        <div className="text-center pt-1">
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(!isRegisterMode);
              setErrorMsg('');
            }}
            className="text-xs text-orange-600 font-bold hover:underline"
          >
            {isRegisterMode ? 'پێشتر هەژمارت هەیە؟ چوونەژوورەوە' : 'کڕیاری نوێیت؟ دروستکردنی هەژمار'}
          </button>
        </div>

        {/* Demo / Testing Credentials Accordion */}
        <div className="pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowDemoAccounts(!showDemoAccounts)}
            className="w-full flex items-center justify-between text-[11px] font-bold text-slate-500 hover:text-slate-800 p-2 bg-slate-50 rounded-xl transition-colors"
          >
            <span>هەژمارەکانی تاقیکردنەوە (Demo Credentials)</span>
            <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
              {showDemoAccounts ? 'داخستن' : 'کردنەوە'}
            </span>
          </button>

          {showDemoAccounts && (
            <div className="mt-2 space-y-1.5 animate-in fade-in text-[11px]">
              <p className="text-[10px] text-slate-400">کرتە لە هەر یەکێکیان بکە بۆ پڕکردنەوەی خۆکاری ژمارە و نهێنی:</p>
              
              {/* Super Admin */}
              <div
                onClick={() => handleFillCredentials('07509998877', 'admin')}
                className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 cursor-pointer flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-purple-900 block">👑 سوپەر ئەدمین (Super Admin)</span>
                  <span className="text-slate-500 text-[10px]">مۆبایل: 07509998877 | نهێنی: admin</span>
                </div>
                <span className="text-[10px] text-purple-700 font-bold">هەڵبژاردن</span>
              </div>

              {/* Restaurant */}
              <div
                onClick={() => handleFillCredentials('07502223344', 'pizza')}
                className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 cursor-pointer flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-blue-900 block">🍕 چێشتخانەی Boom Pizza</span>
                  <span className="text-slate-500 text-[10px]">مۆبایل: 07502223344 | نهێنی: pizza</span>
                </div>
                <span className="text-[10px] text-blue-700 font-bold">هەڵبژاردن</span>
              </div>

              {/* Driver */}
              <div
                onClick={() => handleFillCredentials('07504441122', 'driver')}
                className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 cursor-pointer flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-emerald-900 block">🛵 شۆفێر: ڕەوەند ئازاد</span>
                  <span className="text-slate-500 text-[10px]">مۆبایل: 07504441122 | نهێنی: driver</span>
                </div>
                <span className="text-[10px] text-emerald-700 font-bold">هەڵبژاردن</span>
              </div>

              {/* Customer */}
              <div
                onClick={() => handleFillCredentials('07501112233', '123')}
                className="p-2 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 cursor-pointer flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-orange-900 block">👤 کڕیار: شەهید مەحمود</span>
                  <span className="text-slate-500 text-[10px]">مۆبایل: 07501112233 | نهێنی: 123</span>
                </div>
                <span className="text-[10px] text-orange-700 font-bold">هەڵبژاردن</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

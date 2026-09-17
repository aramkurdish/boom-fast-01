import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DeliveryZone } from '../../types';
import { Plus, MapPin, Edit2, Check, X, Navigation, Bike, Calculator, Sparkles, Save } from 'lucide-react';

export const AdminDeliveryZones: React.FC = () => {
  const {
    deliveryZones,
    updateDeliveryZone,
    addDeliveryZone,
    deliveryPricePerKm,
    deliveryMinFee,
    setDeliveryPricePerKm,
    setDeliveryMinFee
  } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingZoneId, setEditingZoneId] = useState<string | null>(null);
  const [editFee, setEditFee] = useState<string>('');

  // Per-Km config state
  const [perKmInput, setPerKmInput] = useState(deliveryPricePerKm.toString());
  const [minFeeInput, setMinFeeInput] = useState(deliveryMinFee.toString());
  const [isSavedNotice, setIsSavedNotice] = useState(false);
  const [testKm, setTestKm] = useState(10);

  // New zone form
  const [name, setName] = useState('');
  const [minDistance, setMinDistance] = useState('');
  const [maxDistance, setMaxDistance] = useState('');
  const [fee, setFee] = useState('');

  const handleSavePerKmSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const kmRate = Number(perKmInput) || 300;
    const minFee = Number(minFeeInput) || 1500;
    setDeliveryPricePerKm(kmRate);
    setDeliveryMinFee(minFee);
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 3000);
  };

  const simulatedFee = Math.round(Math.max(Number(minFeeInput) || 1500, testKm * (Number(perKmInput) || 300)) / 250) * 250;

  const startEdit = (zone: DeliveryZone) => {
    setEditingZoneId(zone.id);
    setEditFee(zone.fee.toString());
  };

  const saveEdit = (id: string) => {
    if (editFee) {
      updateDeliveryZone(id, { fee: Number(editFee) });
    }
    setEditingZoneId(null);
  };

  const handleAddZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !fee) return;

    addDeliveryZone({
      name,
      minDistance: Number(minDistance) || 0,
      maxDistance: Number(maxDistance) || 5,
      fee: Number(fee)
    });

    setName('');
    setMinDistance('');
    setMaxDistance('');
    setFee('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-5 animate-in fade-in" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-900">حیسابکردنی نرخی گەیاندن بەپێی GPS</h2>
          <p className="text-xs text-slate-500 font-medium">دیاریکردنی نرخی هەر کیلۆمەترێک و حیسابکردنی ئۆتۆماتیکی دووری</p>
        </div>
      </div>

      {/* GPS Per-KM Automation Card */}
      <div className="bg-gradient-to-br from-purple-900 to-indigo-950 text-white p-5 rounded-3xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-amber-400">
              <Bike size={22} />
            </div>
            <div>
              <h3 className="font-black text-sm text-white flex items-center gap-2">
                سیستەمی گەیاندنی خۆکار بەپێی کیلۆمەتر
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
                  چالاکە (Active)
                </span>
              </h3>
              <p className="text-xs text-purple-200">نرخی گەیاندن بە شێوەی ئۆتۆماتیک بەپێی هەڵکەوتەی GPS هەژمار دەکرێت</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSavePerKmSettings} className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="bg-white/10 p-3 rounded-2xl border border-white/10 space-y-1">
            <label className="block text-[11px] font-bold text-purple-200">
              نرخ بۆ هەر ١ کیلۆمەتر (د.ع)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="50"
                step="50"
                value={perKmInput}
                onChange={(e) => setPerKmInput(e.target.value)}
                className="w-full bg-white/10 text-white font-black text-sm p-2 rounded-xl border border-white/20 focus:outline-none focus:border-amber-400"
              />
              <span className="text-xs text-purple-200 font-bold shrink-0">د.ع / کم</span>
            </div>
            <p className="text-[10px] text-purple-300">نموونە: 300 د.ع بۆ هەر ١ کم (واتە 10 کم = 3,000 د.ع)</p>
          </div>

          <div className="bg-white/10 p-3 rounded-2xl border border-white/10 space-y-1">
            <label className="block text-[11px] font-bold text-purple-200">
              کەمترین نرخی گەیاندن (Minimum Fee)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="500"
                step="250"
                value={minFeeInput}
                onChange={(e) => setMinFeeInput(e.target.value)}
                className="w-full bg-white/10 text-white font-black text-sm p-2 rounded-xl border border-white/20 focus:outline-none focus:border-amber-400"
              />
              <span className="text-xs text-purple-200 font-bold shrink-0">د.ع</span>
            </div>
            <p className="text-[10px] text-purple-300">ئەگەر دووری زۆر کەم بوو لەم بڕە کەمتر نابێت</p>
          </div>

          <div className="sm:col-span-2 flex items-center justify-between pt-1">
            <button
              type="submit"
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 active:scale-95 text-purple-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <Save size={15} />
              <span>پاشەکەوتکردنی نرخی کیلۆمەتر</span>
            </button>
            {isSavedNotice && (
              <span className="text-xs font-bold text-emerald-300 bg-emerald-950/60 px-3 py-1 rounded-xl border border-emerald-500/30 animate-in fade-in">
                ✓ نرخی نوێی گەیاندن بە سەرکەوتوویی جێبەجێ کرا!
              </span>
            )}
          </div>
        </form>

        {/* Live Simulator */}
        <div className="bg-black/30 p-3.5 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-1 flex-1">
            <span className="font-black text-amber-300 flex items-center gap-1 text-xs">
              <Calculator size={14} />
              تاقیکردنەوەی خێرای مەودا (Simulator):
            </span>
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] text-purple-200 font-bold">دووری کڕیار:</span>
              <input
                type="range"
                min="1"
                max="25"
                step="0.5"
                value={testKm}
                onChange={(e) => setTestKm(Number(e.target.value))}
                className="w-36 sm:w-48 accent-amber-400 cursor-pointer"
              />
              <span className="font-black text-white bg-white/20 px-2 py-0.5 rounded-lg text-xs">
                {testKm} کم
              </span>
            </div>
          </div>
          <div className="bg-white/10 px-4 py-2 rounded-xl text-left border border-white/10 shrink-0">
            <span className="text-[10px] text-purple-300 block">کرێی گەیاندنی حیسابکراو:</span>
            <span className="text-base font-black text-amber-300">
              {simulatedFee.toLocaleString()} د.ع
            </span>
          </div>
        </div>
      </div>

      {/* Manual Zone Overrides header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h3 className="text-sm font-black text-slate-800">زۆن و سنورەکانی گەیاندن</h3>
          <p className="text-[11px] text-slate-500">لیستی مەوداکان و نرخی دەستکاری کراو بەپێی قۆناغەکان</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 active:scale-95 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1 transition-transform"
        >
          <Plus size={14} />
          <span>زۆنی نوێ</span>
        </button>
      </div>

      {/* Zones list */}
      <div className="space-y-3">
        {deliveryZones.map(zone => (
          <div
            key={zone.id}
            className="bg-white p-4 rounded-3xl border border-slate-100 shadow-2xs flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-black shrink-0">
                <Navigation size={18} />
              </div>
              <div>
                <h3 className="font-black text-xs sm:text-sm text-slate-900">{zone.name}</h3>
                <span className="text-[11px] text-slate-400 font-medium">
                  مەودا: لە {zone.minDistance} بۆ {zone.maxDistance} کم
                </span>
              </div>
            </div>

            {/* Price & Edit */}
            <div className="flex items-center gap-2">
              {editingZoneId === zone.id ? (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={editFee}
                    onChange={(e) => setEditFee(e.target.value)}
                    className="w-20 p-1.5 text-xs font-bold rounded-lg border border-purple-400 text-center"
                  />
                  <button
                    onClick={() => saveEdit(zone.id)}
                    className="p-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    onClick={() => setEditingZoneId(null)}
                    className="p-1.5 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm text-purple-700 bg-purple-50 px-2.5 py-1 rounded-xl">
                    {zone.fee.toLocaleString()} د.ع
                  </span>
                  <button
                    onClick={() => startEdit(zone)}
                    className="p-2 text-slate-400 hover:text-purple-700 rounded-xl hover:bg-purple-50 transition-colors"
                  >
                    <Edit2 size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Zone Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" dir="rtl">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-4 overflow-hidden animate-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900">زیادکردنی زۆنی گەیاندن</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-full text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddZone} className="space-y-3 pt-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">ناوی زۆن *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="وەک: زۆنی ناوەندی شار (٣-٥ کم)"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">کەمترین مەودا (کم) *</label>
                  <input
                    type="number"
                    required
                    value={minDistance}
                    onChange={(e) => setMinDistance(e.target.value)}
                    placeholder="0"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">زۆرترین مەودا (کم) *</label>
                  <input
                    type="number"
                    required
                    value={maxDistance}
                    onChange={(e) => setMaxDistance(e.target.value)}
                    placeholder="3"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">کرێی گەیاندن (دینار) *</label>
                <input
                  type="number"
                  required
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                  placeholder="3000"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-purple-700 hover:bg-purple-800 text-white font-black rounded-xl shadow-md transition-all active:scale-98 mt-2"
              >
                پاشەکەوتکردنی زۆن
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

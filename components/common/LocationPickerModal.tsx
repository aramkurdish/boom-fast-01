import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MapPin, Navigation, Check, X, Building2, Compass, Loader2 } from 'lucide-react';

interface PopularRegion {
  name: string;
  subtext: string;
  lat: number;
  lng: number;
  highlight?: boolean;
}

const POPULAR_REGIONS: PopularRegion[] = [
  { name: 'خەلیفان (Khalifan)', subtext: 'ناوەندی شار و دەوروبەری', lat: 36.6025, lng: 44.4035, highlight: true },
  { name: 'سۆران (Soran)', subtext: 'ناوەندی قەزا و بازاڕ', lat: 36.6542, lng: 44.5428 },
  { name: 'هەولێر (Erbil)', subtext: 'شەقامی ٦٠ مەتری، بەختیاری، ئیسکان', lat: 36.1901, lng: 44.0091 },
  { name: 'سلێمانی (Sulaymaniyah)', subtext: 'سەهۆڵەکە، توی مەلیک، سەرچنار', lat: 35.5612, lng: 45.4289 },
  { name: 'دهۆک (Duhok)', subtext: 'ناوەندی شار و مازی', lat: 36.8663, lng: 42.9885 },
  { name: 'ڕانیە و قەڵادزێ', subtext: 'دەڤەری ڕاپەڕین', lat: 36.2551, lng: 44.8824 },
  { name: 'زاخۆ (Zakho)', subtext: 'ناوەندی شار و پردی دەلال', lat: 37.1432, lng: 42.6841 },
  { name: 'هەڵەبجە (Halabja)', subtext: 'ناوەندی پارێزگا', lat: 35.1778, lng: 45.9861 }
];

export const LocationPickerModal: React.FC = () => {
  const { userLocation, setUserLocation, isLocationModalOpen, setIsLocationModalOpen } = useApp();
  const [customAddress, setCustomAddress] = useState('');
  const [isLocatingGPS, setIsLocatingGPS] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  if (!isLocationModalOpen) return null;

  // Handle GPS detection
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      setGpsError('ئەم براوسەرە پشتگیری دیاریکردنی GPS ناکات.');
      return;
    }

    setIsLocatingGPS(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocatingGPS(false);
        const { latitude, longitude } = pos.coords;

        // Determine nearest city/region by distance
        let nearestName = 'شوێنی ڕاستەقینەی GPS';
        // Distance approximations
        if (Math.hypot(latitude - 36.6025, longitude - 44.4035) < 0.15) {
          nearestName = 'خەلیفان (دیاریکراو بە GPS)';
        } else if (Math.hypot(latitude - 36.6542, longitude - 44.5428) < 0.15) {
          nearestName = 'سۆران (دیاریکراو بە GPS)';
        } else if (Math.hypot(latitude - 36.1901, longitude - 44.0091) < 0.2) {
          nearestName = 'هەولێر (دیاریکراو بە GPS)';
        } else if (Math.hypot(latitude - 35.5612, longitude - 45.4289) < 0.2) {
          nearestName = 'سلێمانی (دیاریکراو بە GPS)';
        } else if (Math.hypot(latitude - 36.8663, longitude - 42.9885) < 0.2) {
          nearestName = 'دهۆک (دیاریکراو بە GPS)';
        } else {
          nearestName = `شوێنی ئێوە (GPS: ${latitude.toFixed(3)}, ${longitude.toFixed(3)})`;
        }

        setUserLocation({
          address: nearestName,
          lat: latitude,
          lng: longitude,
          isSet: true
        });
        setIsLocationModalOpen(false);
      },
      (err) => {
        setIsLocatingGPS(false);
        if (err.code === 1) {
          setGpsError('تکایە دەسەڵاتی لۆکەیشن (GPS Permission) لە مۆبایلەکەت بدە تا شوێنەکەت وەربگرین.');
        } else {
          setGpsError('نەتوانرا شوێنی GPS بدۆزرێتەوە. دەتوانیت لە لیستەکەی خوارەوە شارەکەت هەڵبژێریت.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Select predefined region
  const handleSelectRegion = (region: PopularRegion) => {
    setUserLocation({
      address: (region?.name || '').split(' (')[0],
      lat: region.lat,
      lng: region.lng,
      isSet: true
    });
    setIsLocationModalOpen(false);
  };

  // Submit custom written address
  const handleSaveCustomAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customAddress.trim()) return;

    setUserLocation({
      address: customAddress.trim(),
      lat: userLocation.lat || 36.6025,
      lng: userLocation.lng || 44.4035,
      isSet: true
    });
    setIsLocationModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in" dir="rtl">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in slide-in-from-bottom-6 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-l from-orange-50 to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-orange-600 text-white flex items-center justify-center shadow-md shadow-orange-600/20">
              <MapPin size={20} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">شوێنی خۆت دیاری بکە</h3>
              <p className="text-[11px] text-slate-500 font-medium">بۆ حیسابکردنی نزیکترین چێشتخانە و خێراترین گەیاندن</p>
            </div>
          </div>
          <button
            onClick={() => setIsLocationModalOpen(false)}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          {/* 1. Quick GPS Button */}
          <div>
            <button
              onClick={handleDetectGPS}
              disabled={isLocatingGPS}
              className="w-full bg-gradient-to-r from-orange-600 to-amber-600 text-white p-3.5 rounded-2xl font-black text-xs shadow-md shadow-orange-600/25 flex items-center justify-center gap-2 active:scale-[0.98] transition-all hover:brightness-105 disabled:opacity-75"
            >
              {isLocatingGPS ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>دیاریکردنی شوێن بە GPS...</span>
                </>
              ) : (
                <>
                  <Navigation size={16} className="fill-white" />
                  <span>دیاریکردنی ڕاستەوخۆ بە GPS ی مۆبایل</span>
                </>
              )}
            </button>
            {gpsError && (
              <p className="text-[11px] text-rose-600 bg-rose-50 border border-rose-100 p-2.5 rounded-xl mt-2 font-medium">
                ⚠️ {gpsError}
              </p>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 text-[11px] text-slate-400 font-bold">
            <span className="h-px bg-slate-100 flex-1"></span>
            <span>یان شار و ناوچەکەت هەڵبژێرە</span>
            <span className="h-px bg-slate-100 flex-1"></span>
          </div>

          {/* 2. Popular Regions List (Khalifan prominently highlighted) */}
          <div className="space-y-1.5">
            {POPULAR_REGIONS.map((region) => {
              const regionBaseName = (region?.name || '').split(' (')[0];
              const isSelected = Boolean(userLocation?.address && regionBaseName && userLocation.address.includes(regionBaseName));
              return (
                <div
                  key={region.name}
                  onClick={() => handleSelectRegion(region)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    region.highlight
                      ? 'border-orange-300 bg-orange-50/70 hover:bg-orange-100/70 shadow-xs'
                      : isSelected
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs ${
                        region.highlight
                          ? 'bg-orange-600 text-white font-black'
                          : isSelected
                          ? 'bg-orange-500 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {region.highlight ? '🔥' : <Building2 size={16} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-black text-xs text-slate-900">{region.name}</h4>
                        {region.highlight && (
                          <span className="text-[9px] font-black bg-orange-600 text-white px-2 py-0.2 rounded-full">
                            خەلیفان
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400">{region.subtext}</p>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center">
                      <Check size={14} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 3. Custom Written Address */}
          <div className="pt-2 border-t border-slate-100">
            <form onSubmit={handleSaveCustomAddress} className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                نووسینی ناونیشانی ورد بە دەست:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customAddress}
                  onChange={(e) => setCustomAddress(e.target.value)}
                  placeholder="نموونە: خەلیفان، نزیک بازاڕ یان قوتابخانە..."
                  className="flex-1 py-2.5 px-3.5 bg-slate-100 hover:bg-slate-100 focus:bg-white rounded-xl border border-transparent focus:border-orange-500 text-xs text-slate-800 outline-none transition-all placeholder-slate-400"
                />
                <button
                  type="submit"
                  disabled={!customAddress.trim()}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-black rounded-xl transition-all disabled:opacity-40 shrink-0"
                >
                  جێگیرکردن
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-400 font-medium">
            دەتوانیت لە هەر کاتێکدا لە سەرەوەی ئەپەکە کلیک لەسەر ناونیشان بکەیت و بیگۆڕیت
          </p>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, MapPin, Phone, User, FileText, Banknote, ShieldCheck, CheckCircle, Navigation, Bike } from 'lucide-react';
import { calculateDistanceKm } from '../../utils/geo';

interface CheckoutModalProps {
  onClose?: () => void;
  onOrderComplete?: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  onClose = () => {},
  onOrderComplete = () => {}
}) => {
  const {
    currentUser,
    userLocation,
    cart,
    cartSubtotal,
    cartDeliveryFee,
    cartTotal,
    placeOrder,
    setUserLocation,
    setCustomerTab,
    restaurants,
    deliveryPricePerKm
  } = useApp();

  const currentRestaurant = restaurants.find(r => r.id === cart[0]?.restaurantId);
  const currentDistanceKm = currentRestaurant
    ? calculateDistanceKm(userLocation, currentRestaurant.location, currentRestaurant.distanceKm || 2.5)
    : 2.5;

  // Logged-in customer info from profile
  const customerName = currentUser.name || 'کڕیار';
  const customerPhone = currentUser.phone || '';

  const [address, setAddress] = useState(userLocation.isSet ? userLocation.address : 'خەلیفان، ناوەندی شار');
  const [addressDetails, setAddressDetails] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocating(false);
          const { latitude, longitude } = pos.coords;
          let label = `شوێنی GPS (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`;
          if (Math.hypot(latitude - 36.6025, longitude - 44.4035) < 0.15) {
            label = 'خەلیفان (دیاریکراو بە GPS)';
          } else if (Math.hypot(latitude - 36.6542, longitude - 44.5428) < 0.15) {
            label = 'سۆران (دیاریکراو بە GPS)';
          } else if (Math.hypot(latitude - 36.1901, longitude - 44.0091) < 0.2) {
            label = 'هەولێر (دیاریکراو بە GPS)';
          } else if (Math.hypot(latitude - 35.5612, longitude - 45.4289) < 0.2) {
            label = 'سلێمانی (دیاریکراو بە GPS)';
          } else if (Math.hypot(latitude - 36.8663, longitude - 42.9885) < 0.2) {
            label = 'دهۆک (دیاریکراو بە GPS)';
          }
          setAddress(label);
          setUserLocation({
            address: label,
            lat: latitude,
            lng: longitude,
            isSet: true
          });
        },
        () => {
          setIsLocating(false);
        },
        { enableHighAccuracy: true }
      );
    }
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) {
      alert('تکایە ناونیشانی گەیاندن بنووسە.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      placeOrder({
        customerName,
        customerPhone: customerPhone || '0750 000 0000',
        customerAddress: address,
        addressDetails: addressDetails.trim() || undefined,
        deliveryNotes: deliveryNotes.trim() || undefined,
        customerLocation: { lat: userLocation.lat, lng: userLocation.lng }
      });

      setIsSubmitting(false);
      onOrderComplete?.();
      setCustomerTab('ORDERS');
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" dir="rtl">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900">تەواوکردنی داواکاری</h3>
            <p className="text-xs text-slate-500 font-medium">ناونیشانی گەیاندن و پشتڕاستکردنەوە</p>
          </div>
          <button
            onClick={() => onClose?.()}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handlePlaceOrder} className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* Customer Profile Card - Professional Auto-fill */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-black shrink-0">
                <User size={18} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-900 truncate">{customerName}</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.2 rounded-full">
                    هەژماری چالاک
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium mt-0.5">
                  <Phone size={11} className="text-slate-400" />
                  <span dir="ltr">{customerPhone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <MapPin size={14} className="text-orange-600" />
                <span>ناونیشانی گەیاندن</span>
              </h4>
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={isLocating}
                className="text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 bg-orange-50 px-2.5 py-1 rounded-lg transition-colors active:scale-95"
              >
                <Navigation size={12} className={isLocating ? 'animate-spin' : ''} />
                <span>دیاریکردن بە GPS</span>
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">گەڕەک / شەقام *</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="وەک: سولەیمانی، بەختیاری"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">تێبینی زیاتر (ئارەزوومەندانە)</label>
              <input
                type="text"
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                placeholder="وەک: بەرامبەر مارکێت، پەیوەندی بکە..."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            {/* Live GPS Distance & Fee indicator */}
            <div className="p-2.5 bg-orange-50/80 rounded-2xl border border-orange-200/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0">
                  <Bike size={16} />
                </div>
                <div>
                  <span className="font-black text-slate-900 block text-[11px]">
                    دووری لە چێشتخانە: {currentDistanceKm} کم
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    کرێی گەیاندن: {cartDeliveryFee.toLocaleString()} د.ع ({deliveryPricePerKm} د.ع / ١ کم)
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-black bg-orange-600 text-white px-2 py-0.5 rounded-full shadow-xs">
                خۆکار بە GPS
              </span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <Banknote size={14} className="text-emerald-600" />
              <span>شێوازی پارەدان</span>
            </h4>
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm">
                  💵
                </div>
                <div>
                  <span className="text-xs font-black text-emerald-950 block">پارەی کاش لە کاتی وەرگرتن (COD)</span>
                  <span className="text-[10px] text-emerald-700">پارەکە بە کاش دەدەیتە شۆفێر کاتێک خواردنەکەت پێدەگات</span>
                </div>
              </div>
              <CheckCircle size={18} className="text-emerald-600 shrink-0" />
            </div>
          </div>

          {/* Order Summary */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>ژمارەی بڕگەکان:</span>
              <span className="font-bold">{cart.reduce((s, i) => s + i.quantity, 0)} دانە</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>کۆی خواردن:</span>
              <span className="font-bold">{cartSubtotal.toLocaleString()} د.ع</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>کرێی گەیاندن ({currentDistanceKm} کم بەپێی GPS):</span>
              <span className="font-bold text-orange-600">{cartDeliveryFee.toLocaleString()} د.ع</span>
            </div>
            <div className="flex justify-between text-slate-900 font-black text-sm pt-2 border-t border-slate-200">
              <span>کۆی گشتی بۆ پارەدان:</span>
              <span className="text-orange-600">{cartTotal.toLocaleString()} د.ع</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 bg-orange-600 hover:bg-orange-700 active:scale-98 text-white font-black text-sm rounded-2xl shadow-lg shadow-orange-600/20 flex items-center justify-center gap-2 transition-all"
          >
            {isSubmitting ? (
              <span className="animate-pulse">داواکاری دەنێردرێت...</span>
            ) : (
              <>
                <span>داواکاری بنێرە 🚀</span>
                <span className="text-xs opacity-90">({cartTotal.toLocaleString()} د.ع)</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

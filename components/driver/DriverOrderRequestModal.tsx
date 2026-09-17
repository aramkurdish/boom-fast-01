import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Store, MapPin, Clock, Bike, Check, X, Navigation, AlertCircle, Volume2 } from 'lucide-react';
import { soundService } from '../../services/soundService';

export const DriverOrderRequestModal: React.FC = () => {
  const {
    currentRole,
    currentDriver,
    orders,
    acceptOrderAsDriver,
    rejectOrderAsDriver,
    setDriverTab
  } = useApp();

  // Find if there is an active proposal assigned to this driver
  const pendingAssignmentOrder = orders.find(
    o =>
      o.status === 'READY' &&
      !o.driverId &&
      o.currentCandidateDriverId === currentDriver.id &&
      o.assignmentStartTime
  );

  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!pendingAssignmentOrder || !pendingAssignmentOrder.assignmentStartTime) {
      setTimeLeft(30);
      return;
    }

    // Play dispatch alert sound when order is first assigned
    soundService.playDriverDispatchRingtone();

    const calculateRemaining = () => {
      const start = pendingAssignmentOrder.assignmentStartTime || Date.now();
      const elapsed = Math.floor((Date.now() - start) / 1000);
      const remaining = Math.max(0, 30 - elapsed);
      setTimeLeft(remaining);

      // Audio tick during final 5 seconds
      if (remaining > 0 && remaining <= 5) {
        soundService.playTimerTick();
      }
    };

    calculateRemaining();
    const interval = setInterval(calculateRemaining, 1000);
    return () => clearInterval(interval);
  }, [pendingAssignmentOrder?.id, pendingAssignmentOrder?.assignmentStartTime]);

  if (currentRole !== 'DRIVER' || !pendingAssignmentOrder) {
    return null;
  }

  const order = pendingAssignmentOrder;
  const distance = order.distanceKm || 2.1;
  const deliveryFee = order.deliveryFee || 2500;
  const estimatedTime = order.estimatedMinutes || 18;
  const itemsCount = order.items.reduce((s, i) => s + i.quantity, 0);

  // Percentage for countdown progress (30s = 100%)
  const progressPercent = Math.max(0, Math.min(100, (timeLeft / 30) * 100));

  const handleAccept = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const result = acceptOrderAsDriver(order.id, currentDriver.id);
      if (result && !result.success && result.error) {
        setErrorMsg(result.error);
        setIsSubmitting(false);
        return;
      }
      setDriverTab('DELIVERIES');
    } catch (e: any) {
      setErrorMsg(e?.message || 'هەڵەیەک ڕوویدا لە قبوڵکردنی داواکاری');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = () => {
    rejectOrderAsDriver(order.id, currentDriver.id);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in"
      dir="rtl"
    >
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border-2 border-emerald-500 animate-in zoom-in-95 duration-200">
        {/* Top Timer Banner */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black">
                <Bike size={20} className="animate-bounce" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-200">
                  داواکاری نوێ گەیشت!
                </span>
                <h3 className="text-base font-black">داواکاری #{order.orderNumber}</h3>
              </div>
            </div>

            {/* Countdown Badge */}
            <div className="flex items-center gap-2 bg-black/25 px-3 py-1.5 rounded-2xl border border-white/20">
              <Clock size={16} className="text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
              <div className="text-left">
                <span className="text-[10px] block text-emerald-200 leading-none">کاتژمێر</span>
                <span className={`text-lg font-black leading-none ${timeLeft <= 5 ? 'text-red-300 animate-ping' : 'text-white'}`}>
                  {timeLeft}s
                </span>
              </div>
            </div>
          </div>

          {/* Progress bar countdown */}
          <div className="w-full bg-black/20 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ease-linear rounded-full ${
                timeLeft <= 5 ? 'bg-red-400' : timeLeft <= 10 ? 'bg-amber-400' : 'bg-emerald-300'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-3.5">
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-700 text-xs font-bold rounded-2xl border border-red-200 flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100 text-center">
              <span className="text-[10px] text-slate-500 font-bold block">دووری (Distance)</span>
              <span className="text-sm font-black text-slate-900">{distance} کم</span>
            </div>
            <div className="bg-emerald-50 p-2.5 rounded-2xl border border-emerald-100 text-center">
              <span className="text-[10px] text-emerald-700 font-bold block">کرێی تۆ (Fee)</span>
              <span className="text-sm font-black text-emerald-700">{deliveryFee.toLocaleString()} د.ع</span>
            </div>
            <div className="bg-blue-50 p-2.5 rounded-2xl border border-blue-100 text-center">
              <span className="text-[10px] text-blue-700 font-bold block">کاتی خەمڵاندن</span>
              <span className="text-sm font-black text-blue-700">{estimatedTime} خولەک</span>
            </div>
          </div>

          {/* Restaurant Details */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Store size={18} />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-400 block">وەرگرتن لە چێشتخانە:</span>
                <h4 className="text-xs font-black text-slate-900 truncate">{order.restaurantName}</h4>
                <p className="text-[11px] text-slate-600 truncate mt-0.5">
                  {order.restaurantAddress || 'سولەیمانی'}
                </p>
              </div>
            </div>

            <div className="h-px bg-slate-200/80 my-1" />

            {/* Customer Drop-off */}
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
                <MapPin size={18} />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-slate-400 block">گەیاندن بۆ کڕیار:</span>
                <h4 className="text-xs font-black text-slate-900 truncate">{order.customerName}</h4>
                <p className="text-[11px] text-slate-600 truncate mt-0.5">
                  {order.customerAddress}
                </p>
              </div>
            </div>
          </div>

          {/* Items Preview */}
          <div className="p-2.5 bg-amber-50/70 rounded-2xl border border-amber-200/60 text-xs flex items-center justify-between">
            <span className="text-amber-900 font-bold">
              ژمارەی خواردن: {itemsCount} دانە ({order.items.map(i => i.name).slice(0, 2).join('، ')}{order.items.length > 2 ? '...' : ''})
            </span>
            <span className="font-black text-slate-800">
              کۆی پارە: {order.total.toLocaleString()} د.ع
            </span>
          </div>

          {/* Action Buttons: Accept & Reject */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              onClick={handleReject}
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 font-black text-xs rounded-2xl border border-slate-200 transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              <X size={16} className="text-rose-500" />
              <span>ڕەتکردنەوە (Reject)</span>
            </button>

            <button
              onClick={handleAccept}
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs rounded-2xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-1.5"
            >
              <Check size={18} />
              <span>قبوڵکردن (Accept)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

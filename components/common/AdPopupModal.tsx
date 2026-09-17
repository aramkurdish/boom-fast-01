import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, ExternalLink, Phone, Store, Sparkles, CheckCircle2 } from 'lucide-react';

export const AdPopupModal: React.FC = () => {
  const {
    activePopupAd,
    dismissPopupAd,
    setSelectedRestaurantId,
    restaurants,
    setCustomerTab
  } = useApp();

  const [dontShowAgain, setDontShowAgain] = useState(false);

  if (!activePopupAd) return null;

  const handleClose = () => {
    dismissPopupAd(dontShowAgain);
  };

  const handleAction = () => {
    if (activePopupAd.actionType === 'RESTAURANT' && activePopupAd.targetRestaurantId) {
      const rest = restaurants.find(r => r.id === activePopupAd.targetRestaurantId);
      if (rest) {
        setSelectedRestaurantId(rest.id);
        setCustomerTab('HOME');
      }
      handleClose();
    } else if (activePopupAd.actionType === 'PHONE' && activePopupAd.phoneNumber) {
      window.location.href = `tel:${activePopupAd.phoneNumber}`;
      handleClose();
    } else if (activePopupAd.actionType === 'LINK' && activePopupAd.actionUrl) {
      window.open(activePopupAd.actionUrl, '_blank');
      handleClose();
    } else {
      // Default: dismiss
      handleClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in"
      dir="rtl"
    >
      <div
        className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 relative border border-slate-100 flex flex-col"
        style={{ maxHeight: '90vh' }}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 left-3 z-20 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-colors shadow-md"
          title="داخستن"
        >
          <X size={18} />
        </button>

        {/* Ad Image & Header */}
        <div className="relative h-48 bg-slate-900 w-full overflow-hidden shrink-0">
          {activePopupAd.imageUrl ? (
            <img
              src={activePopupAd.imageUrl}
              alt={activePopupAd.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
              <Sparkles size={48} className="text-white/80" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

          {/* Badge */}
          <div className="absolute top-3 right-3 z-10">
            <span className="bg-orange-600/90 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg backdrop-blur-xs flex items-center gap-1">
              <Sparkles size={11} />
              {activePopupAd.badgeText || 'ڕیکلامی تایبەت'}
            </span>
          </div>

          {/* Title on Image bottom */}
          <div className="absolute bottom-3 right-3 left-3 text-white">
            {activePopupAd.subtitle && (
              <p className="text-[11px] font-semibold text-orange-300 mb-0.5">
                {activePopupAd.subtitle}
              </p>
            )}
            <h3 className="text-lg font-black leading-tight drop-shadow-sm">
              {activePopupAd.title}
            </h3>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-4 overflow-y-auto">
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            {activePopupAd.description}
          </p>

          {/* Action Button */}
          <button
            onClick={handleAction}
            className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white py-3 px-4 rounded-2xl font-black text-xs shadow-lg shadow-orange-600/25 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          >
            {activePopupAd.actionType === 'RESTAURANT' && <Store size={15} />}
            {activePopupAd.actionType === 'PHONE' && <Phone size={15} />}
            {activePopupAd.actionType === 'LINK' && <ExternalLink size={15} />}
            <span>{activePopupAd.actionText || 'بینین و داواکردن'}</span>
          </button>

          {/* Dismiss option */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] text-slate-500">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-orange-600 focus:ring-orange-500 border-slate-300"
              />
              <span>ئەمڕۆ دووبارە پیشانم مەدەوە</span>
            </label>

            <button
              onClick={handleClose}
              className="text-slate-400 hover:text-slate-600 font-bold"
            >
              داخستن
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

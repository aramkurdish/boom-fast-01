import React from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, ArrowLeft, Store, Phone, ExternalLink } from 'lucide-react';

export const CustomerAdBanner: React.FC = () => {
  const { ads, setSelectedRestaurantId, restaurants, setCustomerTab } = useApp();

  const activeBannerAd = ads.find(a => a.isActive && a.showBanner);

  if (!activeBannerAd) return null;

  const handleClick = () => {
    if (activeBannerAd.actionType === 'RESTAURANT' && activeBannerAd.targetRestaurantId) {
      const rest = restaurants.find(r => r.id === activeBannerAd.targetRestaurantId);
      if (rest) {
        setSelectedRestaurantId(rest.id);
        setCustomerTab('HOME');
      }
    } else if (activeBannerAd.actionType === 'PHONE' && activeBannerAd.phoneNumber) {
      window.location.href = `tel:${activeBannerAd.phoneNumber}`;
    } else if (activeBannerAd.actionType === 'LINK' && activeBannerAd.actionUrl) {
      window.open(activeBannerAd.actionUrl, '_blank');
    }
  };

  return (
    <div
      onClick={handleClick}
      className="mx-4 my-3 rounded-2xl overflow-hidden shadow-md bg-gradient-to-l from-slate-900 via-slate-800 to-slate-900 text-white cursor-pointer relative group border border-slate-800 transition-all hover:shadow-lg"
    >
      <div className="flex items-stretch min-h-[90px]">
        {/* Ad Image Thumbnail */}
        {activeBannerAd.imageUrl && (
          <div className="w-28 sm:w-32 relative shrink-0 overflow-hidden">
            <img
              src={activeBannerAd.imageUrl}
              alt={activeBannerAd.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-slate-900/90" />
          </div>
        )}

        {/* Ad Content */}
        <div className="p-3 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="bg-orange-500/90 text-white text-[9px] font-black px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                <Sparkles size={9} />
                {activeBannerAd.badgeText || 'ڕیکلام'}
              </span>
              {activeBannerAd.subtitle && (
                <span className="text-[10px] text-orange-300 font-medium truncate">
                  {activeBannerAd.subtitle}
                </span>
              )}
            </div>
            <h4 className="font-black text-xs text-white leading-tight line-clamp-1">
              {activeBannerAd.title}
            </h4>
            <p className="text-[11px] text-slate-300 line-clamp-1 mt-0.5">
              {activeBannerAd.description}
            </p>
          </div>

          <div className="flex items-center justify-between pt-1.5 mt-1 border-t border-slate-700/50">
            <span className="text-[10px] text-orange-400 font-bold flex items-center gap-1 group-hover:underline">
              {activeBannerAd.actionText || 'زیاتر بزانە'}
              <ArrowLeft size={11} className="transition-transform group-hover:-translate-x-0.5" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

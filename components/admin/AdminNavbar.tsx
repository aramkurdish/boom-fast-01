import React from 'react';
import { useApp } from '../../context/AppContext';
import { AdminTab } from '../../types';
import { LayoutDashboard, Store, Bike, Users, ClipboardList, MapPin, Megaphone } from 'lucide-react';

export const AdminNavbar: React.FC = () => {
  const { adminTab, setAdminTab, orders, ads } = useApp();

  const pendingCount = orders.filter(o => o.status === 'PLACED').length;
  const activeAdsCount = ads.filter(a => a.isActive).length;

  const tabs: { id: AdminTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'OVERVIEW', label: 'داشبۆرد', icon: LayoutDashboard },
    { id: 'RESTAURANTS', label: 'ڕێستورانت', icon: Store },
    { id: 'ORDERS', label: 'ئۆردەر', icon: ClipboardList, badge: pendingCount },
    { id: 'ADS', label: 'ڕیکلامەکان', icon: Megaphone, badge: activeAdsCount },
    { id: 'DRIVERS', label: 'شۆفێر', icon: Bike },
    { id: 'ZONES', label: 'زۆنەکان', icon: MapPin },
    { id: 'CUSTOMERS', label: 'کڕیاران', icon: Users }
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-100 shadow-lg" dir="rtl">
      <div className="max-w-md mx-auto px-1 py-1.5 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = adminTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setAdminTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-2xl transition-all relative ${
                isActive
                  ? 'text-purple-700 font-black'
                  : 'text-slate-400 hover:text-slate-600 font-medium'
              }`}
            >
              <div className="relative">
                <Icon size={18} className={isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'} />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-purple-600 text-white text-[8px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[9px] mt-0.5 tracking-tight">{tab.label}</span>
              {isActive && (
                <div className="w-1 h-1 bg-purple-700 rounded-full mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

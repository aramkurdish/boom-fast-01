import React from 'react';
import { useApp } from '../../context/AppContext';
import { DriverTab } from '../../types';
import { Home, Package, Bike, DollarSign, User } from 'lucide-react';

export const DriverBottomNav: React.FC = () => {
  const { driverTab, setDriverTab, orders, currentDriver } = useApp();

  const availableCount = currentDriver.isOnline
    ? orders.filter(o => o.status === 'READY' && (!o.driverId || o.driverId === '')).length
    : 0;

  const activeCount = orders.filter(
    o => o.driverId === currentDriver.id && o.status !== 'DELIVERED' && o.status !== 'CANCELLED'
  ).length;

  const tabs: { id: DriverTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'HOME', label: 'سەرەتا', icon: Home },
    { id: 'ORDERS', label: 'داواکارییەکان', icon: Package, badge: availableCount },
    { id: 'DELIVERIES', label: 'گەیاندنەکان', icon: Bike, badge: activeCount },
    { id: 'EARNINGS', label: 'داهات', icon: DollarSign },
    { id: 'ACCOUNT', label: 'هەژمار', icon: User }
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-100 shadow-lg" dir="rtl">
      <div className="max-w-md mx-auto px-2 py-1.5 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = driverTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setDriverTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all relative ${
                isActive
                  ? 'text-emerald-600 font-black'
                  : 'text-slate-400 hover:text-slate-600 font-medium'
              }`}
            >
              <div className="relative">
                <Icon size={20} className={isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'} />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-emerald-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
              {isActive && (
                <div className="w-1 h-1 bg-emerald-600 rounded-full mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

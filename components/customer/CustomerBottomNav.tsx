import React from 'react';
import { useApp } from '../../context/AppContext';
import { CustomerTab } from '../../types';
import { Home, Search, ShoppingBag, Clock, User } from 'lucide-react';

export const CustomerBottomNav: React.FC = () => {
  const {
    customerTab,
    setCustomerTab,
    cart,
    setIsCartOpen,
    setSelectedRestaurantId
  } = useApp();

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const tabs: { id: CustomerTab; label: string; icon: React.ElementType }[] = [
    { id: 'HOME', label: 'سەرەتا', icon: Home },
    { id: 'SEARCH', label: 'گەڕان', icon: Search },
    { id: 'ORDERS', label: 'داواکارییەکان', icon: Clock },
    { id: 'CART', label: 'سەبەت', icon: ShoppingBag },
    { id: 'ACCOUNT', label: 'هەژمار', icon: User }
  ];

  const handleTabClick = (tabId: CustomerTab) => {
    if (tabId === 'CART') {
      setIsCartOpen(true);
      return;
    }
    if (tabId === 'HOME') {
      setSelectedRestaurantId(null);
    }
    setCustomerTab(tabId);
  };

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-100 shadow-lg" dir="rtl">
      <div className="max-w-md mx-auto px-2 py-1.5 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = customerTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all relative ${
                isActive
                  ? 'text-orange-600 font-black'
                  : 'text-slate-400 hover:text-slate-600 font-medium'
              }`}
            >
              <div className="relative">
                <Icon size={20} className={isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'} />
                {tab.id === 'CART' && totalCartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-orange-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {totalCartCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
              {isActive && (
                <div className="w-1 h-1 bg-orange-600 rounded-full mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

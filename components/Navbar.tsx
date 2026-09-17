import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MapPin, ShoppingBag, Bell, User, LogOut, Zap } from 'lucide-react';
import { UserRole } from '../types';

const ROLE_LABELS: Record<UserRole, { label: string; badgeColor: string }> = {
  CUSTOMER: { label: 'کڕیار', badgeColor: 'bg-orange-100 text-orange-700 border-orange-200' },
  RESTAURANT: { label: 'ڕێستورانت', badgeColor: 'bg-blue-100 text-blue-700 border-blue-200' },
  DRIVER: { label: 'شۆفێر', badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  SUPER_ADMIN: { label: 'سوپەر ئەدمین', badgeColor: 'bg-purple-100 text-purple-700 border-purple-200' }
};

export const Navbar: React.FC<{ onOpenNotifications: () => void }> = ({ onOpenNotifications }) => {
  const {
    currentRole,
    currentUser,
    userLocation,
    cart,
    setIsCartOpen,
    unreadNotificationsCount,
    setIsAuthModalOpen,
    setIsLocationModalOpen,
    logout
  } = useApp();

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all" dir="rtl">
      <div className="max-w-md mx-auto px-4 py-2.5 flex items-center justify-between gap-2">
        {/* Brand & Location / Role */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white font-black text-xs shadow-md shadow-orange-500/20 shrink-0">
            <Zap size={18} className="fill-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-slate-900 text-base tracking-tight">Boom Fast</span>
              {/* Role is static display: User CANNOT change their role directly */}
              <span
                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border flex items-center gap-1 ${ROLE_LABELS[currentRole].badgeColor}`}
              >
                <span>{ROLE_LABELS[currentRole].label}</span>
              </span>
            </div>
            {currentRole === 'CUSTOMER' && (
              <button
                onClick={() => setIsLocationModalOpen(true)}
                className={`flex items-center gap-1.5 text-[11px] transition-all font-bold truncate max-w-[175px] ${
                  !userLocation.isSet
                    ? 'text-orange-600 bg-orange-50 hover:bg-orange-100 px-2.5 py-0.5 rounded-full border border-orange-200 animate-pulse'
                    : 'text-slate-600 hover:text-orange-600'
                }`}
                title="دیاریکردن یان گۆڕینی شوێن"
              >
                <MapPin size={12} className={!userLocation.isSet ? 'text-orange-600 animate-bounce' : 'text-orange-500 shrink-0'} />
                <span className="truncate">{userLocation.address}</span>
              </button>
            )}
            {currentRole !== 'CUSTOMER' && (
              <span className="text-[11px] text-slate-500 font-medium truncate block">
                {currentUser.name}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Auth / Account Button */}
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="p-2 rounded-full text-slate-600 hover:bg-slate-100 transition-colors relative"
            title="چوونەژوورەوە یان گۆڕینی ئەکاونت"
          >
            <User size={19} />
          </button>

          {/* Logout button when non-customer is logged in */}
          {currentRole !== 'CUSTOMER' && (
            <button
              onClick={logout}
              className="p-2 rounded-full text-rose-500 hover:bg-rose-50 transition-colors"
              title="دەرچوون لە هەژمار"
            >
              <LogOut size={18} />
            </button>
          )}

          {/* Notifications Button */}
          <button
            onClick={onOpenNotifications}
            className="p-2 rounded-full text-slate-600 hover:bg-slate-100 transition-colors relative"
            title="ئاگادارییەکان"
          >
            <Bell size={19} />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-orange-600 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-pulse">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Cart Button (Customer role) */}
          {currentRole === 'CUSTOMER' && (
            <button
              onClick={() => setIsCartOpen(true)}
              className="p-2 rounded-full bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors relative"
              title="سەبەتە"
            >
              <ShoppingBag size={19} />
              {totalCartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-orange-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  {totalCartCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

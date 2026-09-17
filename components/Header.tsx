import React from 'react';
import { ViewState } from '../types';

interface HeaderProps {
  currentView: ViewState;
  onToggleAdmin: () => void;
  businessLogo?: string;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onToggleAdmin, businessLogo }) => {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-md px-4 py-3 flex justify-between items-center h-[64px]">
      <div className="flex items-center gap-3">
        {businessLogo ? (
          <img 
            src={businessLogo} 
            alt="Boom Fast Logo" 
            className="max-h-[48px] w-auto object-contain rounded-lg"
          />
        ) : (
          <div className="bg-orange-600 p-2 rounded-xl shadow-lg shadow-orange-100">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        )}
        <h1 className="text-xl font-black text-gray-900">Boom Fast</h1>
      </div>
      <div className="flex gap-2">
        <button 
          onClick={onToggleAdmin}
          className="text-[10px] font-black text-orange-600 border-2 border-orange-600 px-3 py-1.5 rounded-full hover:bg-orange-50 transition-all active:scale-95"
        >
          {currentView === 'ADMIN' ? 'گەڕانەوە' : 'بەڕێوەبەر'}
        </button>
      </div>
    </header>
  );
};

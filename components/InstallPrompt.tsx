
import React, { useState, useEffect } from 'react';

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show prompt after 3 seconds if not in standalone mode
      if (!window.matchMedia('(display-mode: standalone)').matches) {
        setTimeout(() => setIsVisible(true), 3000);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsVisible(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-[200] animate-slide-down">
      <div className="bg-white rounded-[32px] p-4 shadow-2xl border border-orange-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-100 shrink-0">
            <span className="text-2xl">🍕</span>
          </div>
          <div className="text-right">
            <h3 className="font-black text-slate-800 text-sm">داگرتنی ئەپی Boom Fast</h3>
            <p className="text-[10px] text-gray-400 font-bold">بۆ داواکردنی خێراتر ئەپەکە جێگیر بکە</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsVisible(false)}
            className="px-4 py-2 text-xs font-bold text-gray-400"
          >
            نەخێر
          </button>
          <button 
            onClick={handleInstall}
            className="bg-orange-600 text-white px-6 py-3 rounded-2xl font-black text-xs shadow-md shadow-orange-100 active:scale-95 transition-all"
          >
            دایبەزێنە
          </button>
        </div>
      </div>
      <style>{`
        @keyframes slide-down {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-down {
          animation: slide-down 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
};


import React from 'react';

interface InAppBrowserOverlayProps {
  businessLogo?: string;
}

export const InAppBrowserOverlay: React.FC<InAppBrowserOverlayProps> = ({ businessLogo }) => {
  const isAndroid = /Android/i.test(navigator.userAgent);

  return (
    <div className="fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
      <div className="max-w-md w-full space-y-8">
        {/* Business Logo */}
        <div className="flex justify-center mb-4">
          {businessLogo ? (
            <img src={businessLogo} alt="Logo" className="max-h-24 w-auto object-contain" />
          ) : (
            <div className="bg-orange-500 p-4 rounded-3xl shadow-xl shadow-orange-100">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          )}
        </div>

        {/* Message */}
        <div className="space-y-4">
          <h2 className="text-2xl font-black text-gray-900 leading-snug">
            تکایە وێبسایتەکە لە براوسەری دەرەکی بکەرەوە
          </h2>
          <p className="text-gray-500 font-medium leading-relaxed">
            بۆ ئەوەی ئەپەکە بە باشترین شێوە کار بکات و بتوانیت شوێنەکەت بنێریت، تکایە وێبسایتەکە لە براوسەری سەرەکی (Safari یان Chrome) بکەرەوە.
          </p>
        </div>

        {/* Visual Instruction */}
        <div className="relative bg-slate-50 rounded-3xl p-6 border border-gray-100">
          <div className="flex flex-col items-center gap-4">
            <div className="text-sm font-bold text-orange-600">هەنگاوەکان:</div>
            <div className="flex items-center gap-2 text-gray-700 font-bold">
              <span>١. کرتە بکە لە سێ خاڵەکە</span>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-700 font-bold">
              <span>٢. هەڵبژێرە "Open in Browser"</span>
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
          </div>

          {/* Animated Arrow pointing up (to where browser menus usually are) */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 animate-bounce">
            <svg className="w-8 h-8 text-orange-500 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-4 text-xs text-gray-400">
          {isAndroid ? 'پێشنیار دەکرێت Google Chrome بەکاربهێنیت' : 'پێشنیار دەکرێت Safari بەکاربهێنیت'}
        </div>
      </div>
    </div>
  );
};

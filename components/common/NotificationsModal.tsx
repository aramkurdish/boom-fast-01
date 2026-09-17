import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, Bell, CheckCircle2, Clock, Trash2 } from 'lucide-react';

export const NotificationsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationAsRead, setActiveOrderId, setCustomerTab } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" dir="rtl">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-orange-600" />
            <h3 className="text-sm font-black text-slate-900">ئاگادارییەکان</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto space-y-2.5 flex-1">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              هیچ ئاگادارییەکت نییە لەم کاتەدا.
            </div>
          ) : (
            notifications.map(notif => {
              const timeStr = new Date(notif.timestamp).toLocaleTimeString('ku', {
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div
                  key={notif.id}
                  onClick={() => {
                    markNotificationAsRead(notif.id);
                    if (notif.orderId) {
                      setActiveOrderId(notif.orderId);
                      setCustomerTab('ORDERS');
                      onClose();
                    }
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    notif.isRead
                      ? 'bg-slate-50/70 border-slate-100 text-slate-600'
                      : 'bg-orange-50/60 border-orange-200 text-slate-900 ring-1 ring-orange-500/10'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-black text-xs">{notif.title}</h4>
                    <span className="text-[10px] text-slate-400 font-medium">{timeStr}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
                  {notif.orderId && (
                    <span className="text-[10px] font-bold text-orange-600 inline-block mt-1">
                      کرتە بکە بۆ بەدواداچوونی داواکاری ←
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

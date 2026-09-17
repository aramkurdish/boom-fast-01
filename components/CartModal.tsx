import React, { useState, useEffect, useMemo } from 'react';
import { CartItem, PromoCode } from '../types';
import { TELEGRAM_BOT_TOKEN } from '../constants';
import { db } from '../firebase';
import { collection, addDoc } from "firebase/firestore";

declare var Swal: any;

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  telegramChatId: string;
  discordWebhookUrl: string;
  onUpdateQuantity: (id: string, delta: number, size?: 'S' | 'M' | 'L') => void;
  onRemove: (id: string, size?: 'S' | 'M' | 'L') => void;
  onClearCart: () => void;
  locationUrl: string | null;
  isClosed?: boolean;
  initialTableNumber?: string | null;
  promoCodes?: PromoCode[];
}

export const CartModal: React.FC<CartModalProps> = ({ 
  isOpen, 
  onClose, 
  cart, 
  telegramChatId,
  discordWebhookUrl,
  onUpdateQuantity,
  onRemove,
  onClearCart,
  locationUrl: initialLocationUrl,
  isClosed,
  initialTableNumber,
  promoCodes = []
}) => {
  const [isSending, setIsSending] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderType, setOrderType] = useState<'DELIVERY' | 'DINE_IN'>(initialTableNumber ? 'DINE_IN' : 'DELIVERY');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [manualAddress, setManualAddress] = useState('');
  const [tableNumber, setTableNumber] = useState(initialTableNumber || '');
  const [note, setNote] = useState('');
  const [userCoords, setUserCoords] = useState<{lat: number, lng: number} | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Promo Code States
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setPromoInput('');
      setAppliedPromo(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialTableNumber) {
      setTableNumber(initialTableNumber);
      setOrderType('DINE_IN');
    }
  }, [initialTableNumber]);

  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const discountAmount = useMemo(() => {
    if (!appliedPromo) return 0;
    if (appliedPromo.discountType === 'PERCENTAGE') {
      return Math.round((total * appliedPromo.discountValue) / 100);
    }
    return appliedPromo.discountValue;
  }, [appliedPromo, total]);

  const payableTotal = Math.max(0, total - discountAmount);

  const handleApplyPromo = () => {
    const codeClean = promoInput.trim().toUpperCase();
    if (!codeClean) return;
    
    const found = (promoCodes || []).find(pc => pc.code === codeClean);
    if (!found) {
      Swal.fire({ icon: 'error', title: 'کۆدی داشکاندنی هەڵە', text: 'ئەم کۆدە بوونی نییە یان هەڵەیە!', confirmButtonText: 'باشە' });
      return;
    }
    
    if (!found.isActive) {
      Swal.fire({ icon: 'error', title: 'کۆدی بەسەرچوو', text: 'ئەم کۆدە لە ئێستادا کارا نییە!', confirmButtonText: 'باشە' });
      return;
    }
    
    if (found.minOrderAmount && total < found.minOrderAmount) {
      Swal.fire({ 
        icon: 'warning', 
        title: 'کەمترین بڕی کڕین', 
        text: `بۆ بەکارهێنانی ئەم کۆدە پێویستە لانی کەم بڕی کڕینەکەت ${found.minOrderAmount.toLocaleString()} د.ع بێت!`,
        confirmButtonText: 'باشە' 
      });
      return;
    }
    
    setAppliedPromo(found);
    Swal.fire({
      icon: 'success',
      title: 'بە سەرکەوتوویی کارا کرا',
      text: `داشکاندنی بەهای ${found.discountValue.toLocaleString()} ${found.discountType === 'PERCENTAGE' ? '٪' : 'د.ع'} جێبەجێکرا`,
      timer: 2000,
      showConfirmButton: false
    });
  };

  const handleGetLocation = () => {
    setIsGettingLocation(true);
    if (!navigator.geolocation) {
      Swal.fire({ icon: 'error', title: 'هەڵە', text: 'براوسەرەکەت پشتگیری لۆکەیشن ناکات', confirmButtonText: 'باشە' });
      setIsGettingLocation(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
        setIsGettingLocation(false);
        Swal.fire({ icon: 'success', title: 'لۆکەیشن وەرگیرا', text: 'شوێنەکەت بە سەرکەوتوویی تۆمارکرا', timer: 1500, showConfirmButton: false });
      },
      () => {
        setIsGettingLocation(false);
        Swal.fire({ icon: 'error', title: 'GPS نەکراوەتەوە', text: 'تکایە لۆکەیشن کارا بکە یان ناونیشانەکەت بنووسە.', confirmButtonText: 'باشە' });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleOrder = async () => {
    if (isClosed) {
      Swal.fire({ icon: 'error', title: 'داخراوە', text: 'بەداخەوە ئێستا فاست فوود داخراوە و ناتوانیت داواکاری بنێریت.', confirmButtonText: 'باشە' });
      return;
    }

    if (orderType === 'DELIVERY') {
      if (cart.length === 0 || !customerName.trim() || !phone || phone.length < 10 || (!userCoords && !manualAddress.trim())) {
        Swal.fire({ icon: 'warning', title: 'زانیاری ناتەواو', text: 'تکایە هەموو خانەکان بە دروستی پڕ بکەرەوە.', confirmButtonText: 'باشە' });
        return;
      }
    } else {
      if (cart.length === 0 || !tableNumber) {
        Swal.fire({ icon: 'warning', title: 'زانیاری ناتەواو', text: 'تکایە ژمارەی مێز بنووسە.', confirmButtonText: 'باشە' });
        return;
      }
    }

    const finalChatId = telegramChatId || '-5132542685';
    setIsSending(true);
    
    const generatedOrderNumber = Math.floor(1000 + Math.random() * 9000);
    const now = new Date().toLocaleString('ku-IQ', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    let text = `🍕 *داواکاری نوێ #${generatedOrderNumber} - BOOM PIZZA*\n`;
    text += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    text += `📍 *جۆری داواکاری:* ${orderType === 'DELIVERY' ? 'گەیاندن (Delivery) 🛵' : 'ناو دوکان (Dine-in) 🪑'}\n`;
    if (orderType === 'DINE_IN') text += `🔢 *ژمارەی مێز:* ${tableNumber}\n`;
    text += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    cart.forEach((item, index) => {
      const sizeStr = item.selectedSize ? ` (${item.selectedSize})` : '';
      text += `*${index + 1}. ${item.name}${sizeStr}*\n`;
      text += `   ▫️ بڕ: ${item.quantity} دانە\n`;
      text += `   ▫️ نرخ: ${(item.price * item.quantity).toLocaleString()} IQD\n\n`;
    });
    
    text += `━━━━━━━━━━━━━━━━━━━━\n`;
    text += `💵 *کۆی خواردنەکان:* ${total.toLocaleString()} IQD\n`;
    if (appliedPromo) {
      text += `🎟️ *کۆدی داشکاندن:* ${appliedPromo.code} (-${discountAmount.toLocaleString()} IQD)\n`;
      text += `💰 *کۆی گشتی:* ${payableTotal.toLocaleString()} IQD\n`;
    }
    text += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    text += `👤 *زانیاری کڕیار:*\n`;
    if (orderType === 'DELIVERY') {
      text += `📝 ناوی کڕیار: ${customerName}\n`;
      text += `📞 مۆبایل: \`${phone}\`\n`;
      if (manualAddress.trim()) text += `🏠 ناونیشان: ${manualAddress.trim()}\n`;
      if (userCoords) {
         text += `📍 *لۆکەیشن:* [بۆ بینینی شوێن کلیک بکە](https://www.google.com/maps?q=${userCoords.lat},${userCoords.lng})\n`;
      }
    } else {
      text += `🪑 مێزی ژمارە: ${tableNumber}\n`;
    }
    text += `📝 تێبینی: ${note.trim() || 'نییە'}\n\n`;
    
    text += `⏰ ${now}`;

    try {
      // 1. Send to Telegram
      const encodedText = encodeURIComponent(text);
      const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage?chat_id=${finalChatId}&text=${encodedText}&parse_mode=Markdown`;
      await fetch(telegramUrl, { mode: 'no-cors' });

      // 2. Send to Discord if webhook is set
      if (discordWebhookUrl) {
        try {
          // Format text for Discord (slightly different markdown)
          let discordText = `🚀 **داواکاری نوێ #${generatedOrderNumber} - BOOM PIZZA**\n`;
          discordText += `━━━━━━━━━━━━━━━━━━━━\n\n`;
          discordText += `📍 **جۆری داواکاری:** ${orderType === 'DELIVERY' ? 'گەیاندن (Delivery) 🛵' : 'ناو دوکان (Dine-in) 🪑'}\n`;
          if (orderType === 'DINE_IN') discordText += `🔢 **ژمارەی مێز:** ${tableNumber}\n`;
          discordText += `━━━━━━━━━━━━━━━━━━━━\n\n`;
          
          cart.forEach((item, index) => {
            const sizeStr = item.selectedSize ? ` (${item.selectedSize})` : '';
            discordText += `**${index + 1}. ${item.name}${sizeStr}**\n`;
            discordText += `   ▫️ بڕ: ${item.quantity} دانە\n`;
            discordText += `   ▫️ نرخ: ${(item.price * item.quantity).toLocaleString()} IQD\n\n`;
          });
          
          discordText += `━━━━━━━━━━━━━━━━━━━━\n`;
          discordText += `💵 **کۆی گشتی خواردنەکان:** ${total.toLocaleString()} IQD\n`;
          if (appliedPromo) {
            discordText += `🎟️ **کۆدی داشکاندن:** ${appliedPromo.code} (-${discountAmount.toLocaleString()} IQD)\n`;
            discordText += `💰 **کۆی گشتی:** ${payableTotal.toLocaleString()} IQD\n`;
          }
          discordText += `━━━━━━━━━━━━━━━━━━━━\n\n`;
          
          discordText += `👤 **زانیاری کڕیار:**\n`;
          if (orderType === 'DELIVERY') {
            discordText += `📝 ناوی کڕیار: ${customerName}\n`;
            discordText += `📞 مۆبایل: \`${phone}\`\n`;
            if (manualAddress.trim()) discordText += `🏠 ناونیشان: ${manualAddress.trim()}\n`;
            if (userCoords) {
              discordText += `📍 **لۆکەیشن:** [بۆ بینینی شوێن کلیک بکە](https://www.google.com/maps?q=${userCoords.lat},${userCoords.lng})\n`;
            }
          } else {
            discordText += `🪑 مێزی ژمارە: ${tableNumber}\n`;
          }
          discordText += `📝 تێبینی: ${note.trim() || 'نییە'}\n\n`;
          discordText += `⏰ ${now}`;

          await fetch(discordWebhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: discordText })
          });
        } catch (discordErr) {
          console.error("Discord notification failed", discordErr);
        }
      }

      await addDoc(collection(db, "orders"), {
        orderNumber: generatedOrderNumber,
        items: cart.map(i => `${i.quantity}x ${i.name}${i.selectedSize ? ' ('+i.selectedSize+')' : ''} - ${(i.price * i.quantity).toLocaleString()} IQD`),
        total: payableTotal,
        orderType,
        customerName: orderType === 'DELIVERY' ? customerName.trim() : '',
        tableNumber: orderType === 'DINE_IN' ? tableNumber : null,
        customerPhone: orderType === 'DELIVERY' ? phone : null,
        manualAddress: orderType === 'DELIVERY' ? manualAddress : null,
        customerNote: note,
        gpsLocation: (orderType === 'DELIVERY' && userCoords) ? `https://www.google.com/maps?q=${userCoords.lat},${userCoords.lng}` : null,
        timestamp: Date.now(),
        promoCode: appliedPromo ? appliedPromo.code : null,
        discountAmount: appliedPromo ? discountAmount : null
      });

      Swal.fire({ icon: 'success', title: 'داواکارییەکەت گەیشت!', text: 'سوپاس بۆ کڕینەکەت.', confirmButtonText: 'باشە', confirmButtonColor: '#ea580c' });
      onClearCart();
      setIsCheckingOut(false);
      setCustomerName('');
      setPhone('');
      setManualAddress('');
      setNote('');
      setUserCoords(null);
      onClose();
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'هەڵەیەک ڕوویدا', text: 'تکایە دووبارە هەوڵبدەرەوە.', confirmButtonText: 'باشە' });
    } finally {
      setIsSending(false);
    }
  };

  const closeAndReset = () => { setIsCheckingOut(false); onClose(); };
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end bg-black/60 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={closeAndReset} />
      <div className="bg-white rounded-t-[40px] h-[85vh] w-full flex flex-col relative animate-slide-up overflow-hidden text-black">
        <div className="p-5 border-b flex justify-between items-center bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            {isCheckingOut && (
              <button onClick={() => setIsCheckingOut(false)} className="p-2 bg-gray-100 rounded-xl">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
              </button>
            )}
            <h2 className="text-xl font-black">{isCheckingOut ? 'ناونیشان و گەیاندن' : 'سەبەتەکەم'}</h2>
          </div>
          <button onClick={closeAndReset} className="p-2 bg-gray-100 rounded-full text-sm">✕</button>
        </div>
        
        <div className="flex-grow overflow-y-auto p-4">
          {!isCheckingOut ? (
            <div className="space-y-3">
              {cart.map((item, idx) => (
                <div key={`${item.id}-${item.selectedSize}-${idx}`} className="bg-gray-50 p-4 rounded-[28px] flex items-center gap-3 border border-gray-100 shadow-sm">
                  <img src={item.img} className="w-16 h-16 rounded-2xl object-cover bg-white shadow-sm" />
                  <div className="flex-grow">
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-slate-800 text-sm">{item.name}</h3>
                      {item.selectedSize && <span className="text-[9px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full font-black">{item.selectedSize}</span>}
                    </div>
                    <div className="text-orange-600 font-bold text-xs">{(item.price * item.quantity).toLocaleString()} IQD</div>
                    <div className="flex items-center gap-3 mt-1.5">
                      <button onClick={() => onUpdateQuantity(item.id, -1, item.selectedSize)} className="w-8 h-8 bg-white border border-gray-200 rounded-xl font-black flex items-center justify-center">-</button>
                      <span className="font-black text-lg w-5 text-center">{item.quantity}</span>
                      <button onClick={() => onUpdateQuantity(item.id, 1, item.selectedSize)} className="w-8 h-8 bg-white border border-gray-200 rounded-xl font-black flex items-center justify-center">+</button>
                    </div>
                  </div>
                  <button onClick={() => onRemove(item.id, item.selectedSize)} className="text-red-400 p-1"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                </div>
              ))}
              {cart.length === 0 && <div className="text-center py-20 text-gray-400 font-black">سەبەتەکەت بەتاڵە</div>}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex p-1 bg-gray-100 rounded-xl">
                <button 
                  onClick={() => setOrderType('DELIVERY')}
                  className={`flex-1 py-2.5 rounded-lg font-black text-xs transition-all ${orderType === 'DELIVERY' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500'}`}
                >
                  🛵 گەیاندن
                </button>
                <button 
                  onClick={() => setOrderType('DINE_IN')}
                  className={`flex-1 py-2.5 rounded-lg font-black text-xs transition-all ${orderType === 'DINE_IN' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500'}`}
                >
                  🪑 ناو دوکان
                </button>
              </div>

              {orderType === 'DELIVERY' && (
                <input type="text" placeholder="ناوی بەڕێزت" className="w-full p-4 bg-slate-50 rounded-[20px] border border-slate-200 font-black text-sm" value={customerName} onChange={e => setCustomerName(e.target.value)} />
              )}

              {orderType === 'DELIVERY' ? (
                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                  <input type="tel" placeholder="ژمارەی مۆبایل" className="w-full p-4 bg-slate-50 rounded-[20px] border border-slate-200 font-black text-sm" value={phone} onChange={e => setPhone(e.target.value)} />
                  <div className="p-4 bg-slate-50 rounded-[28px] border border-slate-100 space-y-3">
                    <button onClick={handleGetLocation} className={`w-full py-4 rounded-[18px] font-black text-sm border-2 transition-all ${userCoords ? 'bg-green-50 border-green-500 text-green-600' : 'bg-white border-blue-500 text-blue-600'}`}>
                      {isGettingLocation ? 'چاوەڕوانبە...' : userCoords ? 'لۆکەیشن وەرگیرا ✓' : 'ناردنی لۆکەیشن 📍'}
                    </button>
                    <div className="text-center text-[9px] font-black text-slate-300">یان</div>
                    <textarea placeholder="ناونیشانەکەت بنووسە..." className="w-full p-4 bg-white rounded-[20px] border border-slate-200 font-black text-sm min-h-[80px]" value={manualAddress} onChange={e => setManualAddress(e.target.value)} />
                  </div>
                </div>
              ) : (
                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                  <div className="p-6 bg-orange-50 rounded-[32px] border border-orange-100 text-center space-y-3">
                    <label className="block text-xs font-black text-orange-800">ژمارەی مێزەکەت بنووسە</label>
                    <input 
                      type="number" 
                      placeholder="٥" 
                      className="w-full p-4 bg-white rounded-[20px] border-2 border-orange-200 text-center text-3xl font-black text-orange-600 outline-none focus:border-orange-500" 
                      value={tableNumber} 
                      onChange={e => setTableNumber(e.target.value)} 
                    />
                    <p className="text-[9px] font-bold text-orange-400">ئێمە خواردنەکە دەهێنین بۆ سەر مێزەکەت</p>
                  </div>
                </div>
              )}
              <input type="text" placeholder="تێبینی زیادە" className="w-full p-4 bg-slate-50 rounded-[20px] border border-slate-200 font-black text-sm" value={note} onChange={e => setNote(e.target.value)} />
              
              {/* Promo Code Fields */}
              <div className="p-5 bg-orange-50/50 rounded-[28px] border border-orange-100/50 space-y-3 mt-4 text-right" dir="rtl">
                <label className="block text-xs font-black text-orange-800 mr-1">کۆدی داشکاندن (ئەگەر هەتە)</label>
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={handleApplyPromo}
                    disabled={!promoInput.trim() || !!appliedPromo}
                    className="px-5 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-200 font-black text-xs text-white rounded-[16px] transition-all shadow-sm shrink-0"
                  >
                    جێبەجێکردن
                  </button>
                  <input 
                    type="text" 
                    placeholder="بۆ نموونە: VIP20" 
                    className="flex-grow p-3 bg-white rounded-[16px] border border-slate-200 outline-none text-center font-mono font-black text-sm uppercase focus:border-orange-500" 
                    value={promoInput} 
                    onChange={e => setPromoInput(e.target.value)} 
                    disabled={!!appliedPromo}
                  />
                </div>
                {appliedPromo && (
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-orange-100/60 text-xs font-black text-green-700">
                    <button type="button" onClick={() => { setAppliedPromo(null); setPromoInput(''); }} className="text-red-600 hover:underline">لادان 🗑️</button>
                    <span>كۆدی {appliedPromo.code} بە سەرکەوتوویی کارا کرا! 🎉</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-white space-y-3 text-right">
          {appliedPromo && (
            <div className="space-y-1.5 border-b pb-3 mb-2 text-xs font-bold text-slate-500">
              <div className="flex justify-between">
                <span>کۆی خواردنەکان:</span>
                <span>{total.toLocaleString()} د.ع</span>
              </div>
              <div className="flex justify-between text-orange-600 font-black">
                <span>داشکاندن ({appliedPromo.code}):</span>
                <span>-{discountAmount.toLocaleString()} د.ع</span>
              </div>
            </div>
          )}
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-400 font-bold text-sm">کۆی گشتی بۆ دان</span>
            <span className="text-2xl font-black text-orange-600">{payableTotal.toLocaleString()} د.ع</span>
          </div>
          <button 
            disabled={isSending || cart.length === 0 || isClosed} 
            onClick={!isCheckingOut ? () => setIsCheckingOut(true) : handleOrder}
            className={`w-full py-4 rounded-[24px] font-black text-lg transition-all ${
              isClosed 
                ? 'bg-gray-400 text-white cursor-not-allowed' 
                : 'bg-orange-600 text-white shadow-lg shadow-orange-100'
            }`}
          >
            {isClosed ? 'داخراوە' : isSending ? 'پڕۆسەیە...' : isCheckingOut ? 'جێگیرکردنی داواکاری' : 'بەردەوامبوون'}
          </button>
        </div>
      </div>
      <style>{`@keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } } .animate-slide-up { animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1); }`}</style>
    </div>
  );
};
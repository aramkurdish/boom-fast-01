import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Tag, Sparkles, Flame, Percent, Check, RotateCcw, Plus, Eye, Utensils, AlertCircle } from 'lucide-react';
import { MenuItem } from '../../types';

export const RestaurantOffersHub: React.FC = () => {
  const {
    currentUser,
    restaurants,
    menuItems,
    applyRestaurantOffer,
    applyMenuItemDiscount,
    applyBulkCategoryDiscount,
    clearRestaurantDiscounts
  } = useApp();

  const myRestaurantId = currentUser.restaurantId || 'rest-boom-pizza';
  const restaurant = restaurants.find(r => r.id === myRestaurantId) || restaurants[0];
  const myItems = menuItems.filter(m => m.restaurantId === myRestaurantId);

  // Restaurant-level offer form state
  const [hasOffer, setHasOffer] = useState(restaurant.hasOffer || false);
  const [offerText, setOfferText] = useState(restaurant.offerText || '');
  const [discountPercent, setDiscountPercent] = useState<number>(restaurant.discountPercent || 20);
  const [offerBadge, setOfferBadge] = useState<string>(restaurant.offerBadge || 'ئۆفەری تایبەت 🔥');
  const [isSavedBanner, setIsSavedBanner] = useState(false);

  // Bulk discount state
  const [bulkCategory, setBulkCategory] = useState('all');
  const [bulkPercent, setBulkPercent] = useState<number>(15);
  const [isBulkSuccess, setIsBulkSuccess] = useState(false);

  // Single Item Discount Modal
  const [selectedItemForDiscount, setSelectedItemForDiscount] = useState<MenuItem | null>(null);
  const [itemDiscPercent, setItemDiscPercent] = useState<number>(20);
  const [itemDiscPrice, setItemDiscPrice] = useState<string>('');
  const [itemDiscBadge, setItemDiscBadge] = useState<string>('٢٠٪ داشکان 🔥');

  // Categories present in this restaurant
  const categories = Array.from(new Set(myItems.map(i => i.category)));

  // Discounted items count
  const discountedItems = myItems.filter(i => i.hasDiscount && i.originalPrice);

  // Save restaurant-wide banner offer
  const handleSaveRestaurantOffer = (e: React.FormEvent) => {
    e.preventDefault();
    applyRestaurantOffer(restaurant.id, {
      hasOffer,
      offerText: offerText.trim() || 'داشکاندنی تایبەت بۆ بەشداربووان',
      discountPercent: Number(discountPercent),
      offerBadge
    });
    setIsSavedBanner(true);
    setTimeout(() => setIsSavedBanner(false), 3000);
  };

  // Apply quick presets for offerText
  const applyOfferPreset = (text: string, percent: number, badge: string) => {
    setHasOffer(true);
    setOfferText(text);
    setDiscountPercent(percent);
    setOfferBadge(badge);
  };

  // Apply Bulk Discount
  const handleApplyBulk = () => {
    if (bulkPercent <= 0 || bulkPercent > 90) return;
    applyBulkCategoryDiscount(restaurant.id, bulkCategory, bulkPercent);
    setIsBulkSuccess(true);
    setTimeout(() => setIsBulkSuccess(false), 3000);
  };

  // Open item discount modal
  const handleOpenItemDiscountModal = (item: MenuItem) => {
    setSelectedItemForDiscount(item);
    const orig = item.originalPrice || item.price;
    const currentPercent = item.discountPercent || 20;
    setItemDiscPercent(currentPercent);
    const computedPrice = Math.round((orig * (100 - currentPercent)) / 100 / 250) * 250;
    setItemDiscPrice(item.hasDiscount ? item.price.toString() : computedPrice.toString());
    setItemDiscBadge(item.discountBadge || `${currentPercent}٪ داشکان 🔥`);
  };

  // When percent changes in item discount modal
  const handlePercentChange = (pct: number) => {
    setItemDiscPercent(pct);
    if (!selectedItemForDiscount) return;
    const orig = selectedItemForDiscount.originalPrice || selectedItemForDiscount.price;
    const newPrice = Math.max(500, Math.round((orig * (100 - pct)) / 100 / 250) * 250);
    setItemDiscPrice(newPrice.toString());
    setItemDiscBadge(`${pct}٪ داشکان 🔥`);
  };

  // Save Item Discount
  const handleSaveItemDiscount = () => {
    if (!selectedItemForDiscount) return;
    const priceNum = Number(itemDiscPrice);
    if (!priceNum || priceNum <= 0) return;

    const origPrice = selectedItemForDiscount.originalPrice || selectedItemForDiscount.price;

    applyMenuItemDiscount(selectedItemForDiscount.id, {
      hasDiscount: true,
      price: priceNum,
      originalPrice: origPrice > priceNum ? origPrice : priceNum + 1000,
      discountPercent: itemDiscPercent,
      discountBadge: itemDiscBadge
    });

    setSelectedItemForDiscount(null);
  };

  // Remove discount from single item
  const handleRemoveItemDiscount = (item: MenuItem) => {
    applyMenuItemDiscount(item.id, {
      hasDiscount: false,
      price: item.originalPrice || item.price,
      originalPrice: undefined,
      discountPercent: undefined,
      discountBadge: undefined
    });
  };

  return (
    <div className="space-y-5 animate-in fade-in" dir="rtl">
      {/* Overview Stat Ribbon */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 rounded-3xl p-4 text-white shadow-lg">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full inline-block">
              ئازادی تەواوی چێشتخانە
            </span>
            <h2 className="text-base font-black">بەڕێوەبردنی ئۆفەر و داشکانەکان</h2>
            <p className="text-xs text-orange-100">
              ئۆفەری گشتی بۆ چێشتخانەکەت دابنێ یان ڕاستەوخۆ نرخی خواردنەکان داشکێنە بەپێی ویستی خۆت
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-2xl border border-white/20 shrink-0">
            🔥
          </div>
        </div>

        {/* Quick status bar */}
        <div className="mt-3 pt-3 border-t border-white/20 grid grid-cols-2 gap-2 text-center text-xs">
          <div className="bg-black/15 backdrop-blur-xs rounded-xl p-2">
            <span className="text-[10px] text-orange-200 block">دۆخی ئۆفەری گشتی</span>
            <span className="font-black text-sm">
              {restaurant.hasOffer ? 'چالاککراوە ✅' : 'ناچالاکە ⏸️'}
            </span>
          </div>
          <div className="bg-black/15 backdrop-blur-xs rounded-xl p-2">
            <span className="text-[10px] text-orange-200 block">خواردنە داشکێنراوەکان</span>
            <span className="font-black text-sm">{discountedItems.length} خواردن</span>
          </div>
        </div>
      </div>

      {/* SECTION 1: Restaurant-Wide Offer Banner */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <Flame size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">١. ئۆفەری گشتی چێشتخانە (Restaurant Offer Banner)</h3>
              <p className="text-[11px] text-slate-500">ئەم ئۆفەرە لەسەر کارتی چێشتخانەکەت بە گەورەیی بۆ کڕیاران دەردەکەوێت</p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={hasOffer}
              onChange={(e) => setHasOffer(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
          </label>
        </div>

        {/* Offer Presets */}
        <div>
          <span className="text-[11px] font-bold text-slate-600 block mb-2">نموونە ئامادەکراوەکان بۆ هەڵبژاردنی خێرا:</span>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => applyOfferPreset('داشکاندنی ٢٠٪ بۆ هەموو پیتزاکانی خێزانی', 20, '٢٠٪ داشکان 🔥')}
              className="px-2.5 py-1.5 bg-slate-50 hover:bg-orange-50 hover:text-orange-700 text-slate-700 border border-slate-200 hover:border-orange-300 rounded-xl text-[11px] font-bold transition-colors"
            >
              🍕 ٢٠٪ بۆ پیتزای خێزانی
            </button>
            <button
              type="button"
              onClick={() => applyOfferPreset('سەلەتە و خواردنەوەی بەخۆڕایی لەگەڵ هەر ژەمێک', 15, 'دیاری خۆڕایی 🎁')}
              className="px-2.5 py-1.5 bg-slate-50 hover:bg-orange-50 hover:text-orange-700 text-slate-700 border border-slate-200 hover:border-orange-300 rounded-xl text-[11px] font-bold transition-colors"
            >
              🎁 سەلەتە و خواردنەوە بە دیاری
            </button>
            <button
              type="button"
              onClick={() => applyOfferPreset('داشکاندنی ٣٠٪ تایبەت بە کۆتایی هەفتە', 30, '٣٠٪ داشکان ⚡')}
              className="px-2.5 py-1.5 bg-slate-50 hover:bg-orange-50 hover:text-orange-700 text-slate-700 border border-slate-200 hover:border-orange-300 rounded-xl text-[11px] font-bold transition-colors"
            >
              ⚡ ٣٠٪ داشکانی کۆتایی هەفتە
            </button>
            <button
              type="button"
              onClick={() => applyOfferPreset('گەیاندنی خۆڕایی بۆ داواکاری سەروو ٢٠,٠٠٠ د.ع', 0, 'گەیاندنی خۆڕایی 🛵')}
              className="px-2.5 py-1.5 bg-slate-50 hover:bg-orange-50 hover:text-orange-700 text-slate-700 border border-slate-200 hover:border-orange-300 rounded-xl text-[11px] font-bold transition-colors"
            >
              🛵 گەیاندنی خۆڕایی
            </button>
          </div>
        </div>

        <form onSubmit={handleSaveRestaurantOffer} className="space-y-3 pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">دەقی ئۆفەرەکە (وەک چۆن کڕیار دەیناسێتەوە):</label>
            <input
              type="text"
              value={offerText}
              onChange={(e) => setOfferText(e.target.value)}
              placeholder="وەک: داشکاندنی ٢٥٪ بۆ سەرجەم بەرهەمەکان"
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ڕێژەی داشکان (٪):</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Number(e.target.value))}
                  className="w-full p-2.5 pl-8 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
                <Percent size={14} className="absolute left-2.5 top-3 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">تێکستی باجی ئۆفەر (Badge):</label>
              <input
                type="text"
                value={offerBadge}
                onChange={(e) => setOfferBadge(e.target.value)}
                placeholder="وەک: ئۆفەری تایبەت 🔥"
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Live Preview for restaurant owner */}
          {hasOffer && offerText && (
            <div className="p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-orange-200/80 space-y-1">
              <span className="text-[10px] font-bold text-orange-700 flex items-center gap-1">
                <Eye size={12} />
                <span>پێشبینینی شێوازی دەرکەوتن بۆ کڕیاران لە پەڕەی چێشتخانە:</span>
              </span>
              <div className="flex items-center gap-2 bg-white/90 p-2 rounded-xl border border-orange-200">
                <span className="text-xs bg-orange-600 text-white font-black px-2 py-0.5 rounded-md">
                  {offerBadge || 'ئۆفەر'}
                </span>
                <span className="text-xs font-black text-slate-800">{offerText}</span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <button
              type="submit"
              className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 active:scale-95 text-white rounded-2xl text-xs font-black shadow-md shadow-orange-600/20 flex items-center gap-1.5 transition-all"
            >
              <Check size={16} />
              <span>پاشەکەوتکردنی ئۆفەری گشتی</span>
            </button>

            {isSavedBanner && (
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 animate-in fade-in flex items-center gap-1">
                <Check size={14} />
                <span>ئۆفەرەکە بە سەرکەوتوویی جێبەجێکرا!</span>
              </span>
            )}
          </div>
        </form>
      </div>

      {/* SECTION 2: Bulk Category Discount */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <Tag size={18} />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900">٢. داشکاندنی بە کۆمەڵ بەپێی جۆر (Bulk Category Discount)</h3>
            <p className="text-[11px] text-slate-500">بە یەک کلیک داشکان لەسەر هەموو خواردنەکان یان بەشێکی دیاریکراو دابنێ</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">پۆلێنی مەبەست:</label>
            <select
              value={bulkCategory}
              onChange={(e) => setBulkCategory(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">هەموو خواردنەکانی مێنیو ({myItems.length})</option>
              {categories.map(c => (
                <option key={c} value={c}>خواردنەکانی جۆری {c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">ڕێژەی داشکان:</label>
            <div className="flex items-center gap-1.5">
              {[10, 15, 20, 25].map(pct => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setBulkPercent(pct)}
                  className={`flex-1 py-2 rounded-xl text-xs font-black transition-colors ${
                    bulkPercent === pct
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {pct}٪
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={handleApplyBulk}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-black shadow-md shadow-blue-600/20 flex items-center justify-center gap-1.5 transition-all"
            >
              <Sparkles size={16} />
              <span>جێبەجێکردنی {bulkPercent}٪ داشکان</span>
            </button>
          </div>
        </div>

        {isBulkSuccess && (
          <div className="p-2.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200 flex items-center gap-1.5 animate-in fade-in">
            <Check size={16} className="shrink-0" />
            <span>داشکاندنی {bulkPercent}٪ بۆ خواردنەکان بە سەرکەوتوویی کارا کرا!</span>
          </div>
        )}
      </div>

      {/* SECTION 3: Item-by-Item Menu Discounts */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <Utensils size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">٣. داشکاندنی هەر خواردنێک بە جیاواز (Item Discounts)</h3>
              <p className="text-[11px] text-slate-500">هەر خواردنێک بەپێی ویستی خۆت داشکاندنەکەی دیاری بکە یان لایببە</p>
            </div>
          </div>

          {discountedItems.length > 0 && (
            <button
              onClick={() => {
                if (confirm('دڵنیایت دەتەوێت سەرجەم داشکانەکان لابدەیت و نرخەکان بگەڕێنیتەوە دۆخی ئاسایی؟')) {
                  clearRestaurantDiscounts(restaurant.id);
                }
              }}
              className="text-xs font-bold text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200 transition-colors flex items-center gap-1"
            >
              <RotateCcw size={14} />
              <span>لادانی هەموو داشکانەکان</span>
            </button>
          )}
        </div>

        <div className="space-y-2.5">
          {myItems.map(item => {
            const hasDisc = item.hasDiscount && item.originalPrice;
            const savings = hasDisc ? (item.originalPrice! - item.price) : 0;

            return (
              <div
                key={item.id}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  hasDisc
                    ? 'bg-amber-50/40 border-amber-300/80 shadow-2xs'
                    : 'bg-slate-50/70 border-slate-100'
                }`}
              >
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-14 h-14 rounded-2xl object-cover shrink-0 border border-slate-200"
                  referrerPolicy="no-referrer"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-black text-xs sm:text-sm text-slate-900 truncate">{item.name}</h4>
                    {hasDisc && (
                      <span className="text-[10px] font-black bg-orange-600 text-white px-2 py-0.5 rounded-full shadow-2xs">
                        {item.discountBadge || `${item.discountPercent || 20}٪ داشکان`}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    {hasDisc ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-orange-600">{item.price.toLocaleString()} د.ع</span>
                        <span className="text-[11px] text-slate-400 line-through font-semibold">{item.originalPrice?.toLocaleString()} د.ع</span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-md">
                          (پاشەکەوت: {savings.toLocaleString()} د.ع)
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-slate-700">{item.price.toLocaleString()} د.ع</span>
                    )}
                    <span className="text-[10px] text-slate-400 font-medium">({item.category})</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {hasDisc ? (
                    <>
                      <button
                        onClick={() => handleOpenItemDiscountModal(item)}
                        className="px-2.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl text-xs font-black transition-colors"
                      >
                        گۆڕینی داشکان
                      </button>
                      <button
                        onClick={() => handleRemoveItemDiscount(item)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                        title="لادانی داشکان"
                      >
                        <RotateCcw size={16} />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleOpenItemDiscountModal(item)}
                      className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-black shadow-xs active:scale-95 transition-all flex items-center gap-1"
                    >
                      <Percent size={13} />
                      <span>داشکان دانێ</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SINGLE ITEM DISCOUNT MODAL */}
      {selectedItemForDiscount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" dir="rtl">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-4 sm:p-5 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-orange-600 block">دانانی داشکان بۆ خواردن</span>
                <h3 className="text-sm font-black text-slate-900 truncate">{selectedItemForDiscount.name}</h3>
              </div>
              <button
                onClick={() => setSelectedItemForDiscount(null)}
                className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between text-xs">
              <span className="font-bold text-slate-600">نرخی بنەڕەتی ئێستا:</span>
              <span className="font-black text-slate-900 text-sm">
                {(selectedItemForDiscount.originalPrice || selectedItemForDiscount.price).toLocaleString()} د.ع
              </span>
            </div>

            {/* Quick Discount Percent Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">ڕێژەی داشکان:</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[10, 15, 20, 25, 30, 40, 50].map(pct => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => handlePercentChange(pct)}
                    className={`py-2 rounded-xl text-xs font-black transition-all ${
                      itemDiscPercent === pct
                        ? 'bg-orange-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {pct}٪
                  </button>
                ))}
              </div>
            </div>

            {/* Price after discount */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">نرخی نوێی داشکێنراو (د.ع):</label>
              <input
                type="number"
                value={itemDiscPrice}
                onChange={(e) => {
                  setItemDiscPrice(e.target.value);
                  const newP = Number(e.target.value);
                  const orig = selectedItemForDiscount.originalPrice || selectedItemForDiscount.price;
                  if (newP && orig && orig > newP) {
                    const calcPct = Math.round(((orig - newP) / orig) * 100);
                    setItemDiscPercent(calcPct);
                    setItemDiscBadge(`${calcPct}٪ داشکان 🔥`);
                  }
                }}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-black text-orange-600 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            {/* Badge Text */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">تێکستی باجی داشکان:</label>
              <input
                type="text"
                value={itemDiscBadge}
                onChange={(e) => setItemDiscBadge(e.target.value)}
                placeholder="وەک: ٢٠٪ داشکان 🔥"
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedItemForDiscount(null)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
              >
                پاشگەزبوونەوە
              </button>
              <button
                type="button"
                onClick={handleSaveItemDiscount}
                className="px-5 py-2 bg-orange-600 hover:bg-orange-700 active:scale-95 text-white rounded-xl text-xs font-black shadow-md shadow-orange-600/20"
              >
                پەسەندکردنی داشکان
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

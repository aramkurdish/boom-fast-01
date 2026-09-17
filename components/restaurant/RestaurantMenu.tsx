import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MenuItem } from '../../types';
import { Plus, Edit2, Trash2, Check, X, Tag, Flame, Percent, Utensils } from 'lucide-react';
import { RestaurantOffersHub } from './RestaurantOffersHub';

export const RestaurantMenu: React.FC = () => {
  const { currentUser, menuItems, addMenuItem, updateMenuItem, deleteMenuItem } = useApp();

  const myRestaurantId = currentUser.restaurantId || 'rest-boom-pizza';
  const myItems = menuItems.filter(m => m.restaurantId === myRestaurantId);
  const discountedCount = myItems.filter(m => m.hasDiscount && m.originalPrice).length;

  const [activeSubTab, setActiveSubTab] = useState<'ITEMS' | 'OFFERS'>('ITEMS');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('پیتزا');
  const [imageUrl, setImageUrl] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);

  // Discount form states
  const [hasDiscount, setHasDiscount] = useState(false);
  const [originalPrice, setOriginalPrice] = useState('');
  const [discountPercent, setDiscountPercent] = useState('20');
  const [discountBadge, setDiscountBadge] = useState('٢٠٪ داشکان 🔥');

  const openAddModal = () => {
    setName('');
    setDescription('');
    setPrice('');
    setCategory('پیتزا');
    setImageUrl('https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80');
    setIsAvailable(true);
    setHasDiscount(false);
    setOriginalPrice('');
    setDiscountPercent('20');
    setDiscountBadge('٢٠٪ داشکان 🔥');
    setEditingItem(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setName(item.name);
    setDescription(item.description);
    setPrice(item.price.toString());
    setCategory(item.category);
    setImageUrl(item.imageUrl);
    setIsAvailable(item.isAvailable);
    setHasDiscount(!!item.hasDiscount);
    setOriginalPrice(item.originalPrice ? item.originalPrice.toString() : '');
    setDiscountPercent(item.discountPercent ? item.discountPercent.toString() : '20');
    setDiscountBadge(item.discountBadge || '٢٠٪ داشکان 🔥');
    setIsAddModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;

    const priceNum = Number(price);
    const origNum = originalPrice ? Number(originalPrice) : undefined;

    const discountData = hasDiscount
      ? {
          hasDiscount: true,
          originalPrice: origNum || priceNum + 1500,
          discountPercent: discountPercent ? Number(discountPercent) : 20,
          discountBadge: discountBadge || 'داشکانی تایبەت 🔥'
        }
      : {
          hasDiscount: false,
          originalPrice: undefined,
          discountPercent: undefined,
          discountBadge: undefined
        };

    if (editingItem) {
      updateMenuItem(editingItem.id, {
        name,
        description,
        price: priceNum,
        category,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80',
        isAvailable,
        ...discountData
      });
    } else {
      addMenuItem({
        restaurantId: myRestaurantId,
        name,
        description,
        price: priceNum,
        category,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80',
        isAvailable,
        ...discountData
      });
    }

    setIsAddModalOpen(false);
  };

  return (
    <div className="p-4 pb-24 space-y-4 animate-in fade-in" dir="rtl">
      {/* Top Navigation Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
        <button
          onClick={() => setActiveSubTab('ITEMS')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'ITEMS'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Utensils size={15} />
          <span>لیستی خواردنەکان ({myItems.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('OFFERS')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 relative ${
            activeSubTab === 'OFFERS'
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm'
              : 'text-orange-600 hover:text-orange-700'
          }`}
        >
          <Flame size={15} />
          <span>ئۆفەر و داشکانەکان</span>
          {discountedCount > 0 && (
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
              activeSubTab === 'OFFERS' ? 'bg-white text-orange-600' : 'bg-orange-600 text-white'
            }`}>
              {discountedCount}
            </span>
          )}
        </button>
      </div>

      {activeSubTab === 'OFFERS' ? (
        <RestaurantOffersHub />
      ) : (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900">بەڕێوەبردنی مێنیو</h2>
              <p className="text-xs text-slate-500 font-medium">زیادکردن، دەستکاریکردن و نرخی خواردنەکان</p>
            </div>
            <button
              onClick={openAddModal}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-2xl text-xs font-bold shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition-transform"
            >
              <Plus size={16} />
              <span>خواردنی نوێ</span>
            </button>
          </div>

          {/* Items list */}
          <div className="space-y-3">
            {myItems.map(item => {
              const hasDisc = item.hasDiscount && item.originalPrice;

              return (
                <div
                  key={item.id}
                  className={`bg-white p-3 rounded-3xl border shadow-2xs flex items-center justify-between gap-3 ${
                    hasDisc ? 'border-amber-200/90' : 'border-slate-100'
                  }`}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-slate-100"
                    referrerPolicy="no-referrer"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-black text-xs sm:text-sm text-slate-900 truncate">{item.name}</h3>
                      {hasDisc && (
                        <span className="text-[9px] font-black bg-orange-600 text-white px-2 py-0.5 rounded-full">
                          {item.discountBadge || `${item.discountPercent || 20}٪ داشکان`}
                        </span>
                      )}
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                        item.isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {item.isAvailable ? 'بەردەست' : 'نەماوە'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{item.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {hasDisc ? (
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-black text-orange-600">{item.price.toLocaleString()} د.ع</span>
                          <span className="text-[10px] text-slate-400 line-through">{item.originalPrice?.toLocaleString()} د.ع</span>
                        </div>
                      ) : (
                        <span className="text-xs font-black text-blue-600">{item.price.toLocaleString()} د.ع</span>
                      )}
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {/* Toggle availability */}
                    <button
                      onClick={() => updateMenuItem(item.id, { isAvailable: !item.isAvailable })}
                      className={`p-2 rounded-xl border transition-colors ${
                        item.isAvailable
                          ? 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                          : 'border-slate-200 text-slate-400 hover:bg-slate-50'
                      }`}
                      title={item.isAvailable ? 'گۆڕین بۆ نەماوە' : 'گۆڕین بۆ بەردەست'}
                    >
                      <Check size={14} />
                    </button>

                    <button
                      onClick={() => openEditModal(item)}
                      className="p-2 rounded-xl text-blue-600 hover:bg-blue-50 transition-colors"
                      title="دەستکاریکردن"
                    >
                      <Edit2 size={14} />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm('دڵنیایت دەتەوێت ئەم خواردنە بسڕیتەوە؟')) {
                          deleteMenuItem(item.id);
                        }
                      }}
                      className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors"
                      title="سڕینەوە"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Add / Edit Food Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" dir="rtl">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900">
                {editingItem ? 'دەستکاریکردنی خواردن' : 'زیادکردنی خواردنی نوێ'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-3.5 flex-1 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">ناوی خواردن *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="وەک: پیتزا مارگاریتا"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Price & Discount Settings */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {hasDiscount ? 'نرخی کاتی داشکان (کڕیار ئەمە دەدات) *' : 'نرخی فرۆشتن (بە دیناری عێراقی) *'}
                  </label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="وەک: 8500"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none font-black text-blue-700 bg-white"
                  />
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <Flame size={14} className="text-orange-500" />
                    <span>دانانی داشکان بۆ ئەم خواردنە</span>
                  </span>
                  <input
                    type="checkbox"
                    id="hasDiscCheck"
                    checked={hasDiscount}
                    onChange={(e) => {
                      setHasDiscount(e.target.checked);
                      if (e.target.checked && !originalPrice && price) {
                        setOriginalPrice((Number(price) + 2000).toString());
                      }
                    }}
                    className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500"
                  />
                </div>

                {hasDiscount && (
                  <div className="grid grid-cols-2 gap-2 pt-1 animate-in fade-in">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">نرخی بنەڕەتی (پێش داشکان):</label>
                      <input
                        type="number"
                        value={originalPrice}
                        onChange={(e) => setOriginalPrice(e.target.value)}
                        placeholder="وەک: 10500"
                        className="w-full p-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-none bg-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">تێکستی باج (Badge):</label>
                      <input
                        type="text"
                        value={discountBadge}
                        onChange={(e) => setDiscountBadge(e.target.value)}
                        placeholder="وەک: ٢٠٪ داشکان 🔥"
                        className="w-full p-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:outline-none bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">بەش (Category) *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                >
                  <option value="پیتزا">پیتزا</option>
                  <option value="برگر">برگر</option>
                  <option value="شاورما">شاورما</option>
                  <option value="فاست فوود">فاست فوود</option>
                  <option value="کباب">کباب</option>
                  <option value="خواردن">خواردن</option>
                  <option value="خواردنەوە">خواردنەوە</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">وەسف و پێکهاتەکان</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="سۆسی ئیتاڵی، پەنیری مۆزارێلا، پەپەرۆنی..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">بەستەری وێنە (Image URL)</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="availCheck"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="availCheck" className="font-bold text-slate-700 cursor-pointer">
                  خواردنەکە ئێستا بەردەستە لە چێشتخانە
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-md transition-all active:scale-98 mt-3"
              >
                {editingItem ? 'پاشەکەوتکردنی گۆڕانکارییەکان' : 'زیادکردنی خواردن'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

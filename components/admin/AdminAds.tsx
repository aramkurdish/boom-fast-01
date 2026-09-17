import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Advertisement } from '../../types';
import {
  Megaphone,
  Plus,
  Trash2,
  Edit2,
  Eye,
  CheckCircle,
  XCircle,
  Sparkles,
  Store,
  Phone,
  ExternalLink,
  Image as ImageIcon,
  Check,
  X
} from 'lucide-react';

const PRESET_IMAGES = [
  {
    name: 'بەرگەر و فڕایز',
    url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'پیتزای ئیتالی',
    url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'کەباب و گۆشت',
    url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&auto=format&fit=crop&q=80'
  },
  {
    name: 'شەوارمە و خواردنی خێرا',
    url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop&q=80'
  }
];

export const AdminAds: React.FC = () => {
  const {
    ads,
    addAd,
    updateAd,
    deleteAd,
    toggleAdActive,
    showAdPreview,
    restaurants
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdId, setEditingAdId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [badgeText, setBadgeText] = useState('ڕیکلامی تایبەت');
  const [actionType, setActionType] = useState<'NONE' | 'RESTAURANT' | 'PHONE' | 'LINK'>('NONE');
  const [actionText, setActionText] = useState('بینین و داواکردن');
  const [actionUrl, setActionUrl] = useState('');
  const [targetRestaurantId, setTargetRestaurantId] = useState(restaurants[0]?.id || '');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [showOnEntry, setShowOnEntry] = useState(true);
  const [showBanner, setShowBanner] = useState(true);

  const openCreateModal = () => {
    setEditingAdId(null);
    setTitle('');
    setSubtitle('ئۆفەری وەرزی Boom Fast');
    setDescription('چێژ لە خواردنی بەتام و خێراترین گەیاندن وەربگرە بە کەمترین تێچوو!');
    setImageUrl(PRESET_IMAGES[0].url);
    setBadgeText('ڕیکلامی تایبەت');
    setActionType('NONE');
    setActionText('بینین و داواکردن');
    setActionUrl('');
    setTargetRestaurantId(restaurants[0]?.id || '');
    setPhoneNumber('');
    setIsActive(true);
    setShowOnEntry(true);
    setShowBanner(true);
    setIsModalOpen(true);
  };

  const openEditModal = (ad: Advertisement) => {
    setEditingAdId(ad.id);
    setTitle(ad.title);
    setSubtitle(ad.subtitle || '');
    setDescription(ad.description);
    setImageUrl(ad.imageUrl || '');
    setBadgeText(ad.badgeText || 'ڕیکلام');
    setActionType(ad.actionType || 'NONE');
    setActionText(ad.actionText || 'بینین و داواکردن');
    setActionUrl(ad.actionUrl || '');
    setTargetRestaurantId(ad.targetRestaurantId || restaurants[0]?.id || '');
    setPhoneNumber(ad.phoneNumber || '');
    setIsActive(ad.isActive);
    setShowOnEntry(ad.showOnEntry);
    setShowBanner(ad.showBanner);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert('تکایە سەردێڕ و دەقی ڕیکلامەکە پڕبکەرەوە.');
      return;
    }

    const payload = {
      title: title.trim(),
      subtitle: subtitle.trim(),
      description: description.trim(),
      imageUrl: imageUrl.trim() || undefined,
      badgeText: badgeText.trim() || 'ڕیکلامی تایبەت',
      actionType,
      actionText: actionText.trim() || 'بینین و داواکردن',
      actionUrl: actionType === 'LINK' ? actionUrl.trim() : undefined,
      targetRestaurantId: actionType === 'RESTAURANT' ? targetRestaurantId : undefined,
      phoneNumber: actionType === 'PHONE' ? phoneNumber.trim() : undefined,
      isActive,
      showOnEntry,
      showBanner
    };

    if (editingAdId) {
      updateAd(editingAdId, payload);
    } else {
      addAd(payload);
    }

    setIsModalOpen(false);
  };

  const activeCount = ads.filter(a => a.isActive).length;
  const popupCount = ads.filter(a => a.isActive && a.showOnEntry).length;

  return (
    <div className="space-y-4 text-slate-800" dir="rtl">
      {/* Top Header Card */}
      <div className="bg-gradient-to-l from-purple-900 via-indigo-900 to-purple-950 text-white p-5 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 bg-white/10 rounded-xl backdrop-blur-xs">
              <Megaphone size={20} className="text-amber-400" />
            </span>
            <h2 className="text-lg font-black tracking-tight">بەڕێوەبردنی ڕیکلامەکان</h2>
          </div>
          <p className="text-xs text-purple-200">
            تەنها تۆ وەک سوپەر ئەدمین دەتوانیت ڕیکلام دابنێیت، کە لە کاتی هاتنە ناو ئەپەکە پیشانی کڕیاران دەدرێت.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2.5 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/30 active:scale-95 transition-all self-start sm:self-auto shrink-0"
        >
          <Plus size={16} />
          <span>زیادکردنی ڕیکلامی نوێ</span>
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs">
          <p className="text-[10px] text-slate-400 font-bold">گشتی ڕیکلامەکان</p>
          <p className="text-base font-black text-slate-900 mt-0.5">{ads.length}</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-2xl shadow-xs">
          <p className="text-[10px] text-emerald-600 font-bold">ڕیکلامی چالاک</p>
          <p className="text-base font-black text-emerald-700 mt-0.5">{activeCount}</p>
        </div>
        <div className="bg-orange-50 border border-orange-100 p-3 rounded-2xl shadow-xs">
          <p className="text-[10px] text-orange-600 font-bold">پەنجەرەی سەرەتا (Popup)</p>
          <p className="text-base font-black text-orange-700 mt-0.5">{popupCount}</p>
        </div>
      </div>

      {/* Ads List */}
      <div className="space-y-3">
        {ads.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 mx-auto flex items-center justify-center">
              <Megaphone size={24} />
            </div>
            <p className="text-xs font-bold text-slate-600">هیچ ڕیکلامێک بوونی نییە</p>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-purple-700 text-white rounded-xl text-xs font-bold"
            >
              دروستکردنی یەکەمین ڕیکلام
            </button>
          </div>
        ) : (
          ads.map((ad) => (
            <div
              key={ad.id}
              className="bg-white rounded-2xl border border-slate-100 p-3.5 shadow-xs flex flex-col sm:flex-row gap-3 items-start justify-between"
            >
              <div className="flex gap-3 items-start flex-1 min-w-0">
                {/* Thumbnail */}
                {ad.imageUrl ? (
                  <img
                    src={ad.imageUrl}
                    alt={ad.title}
                    className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-100 shadow-xs"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                    <Sparkles size={20} />
                  </div>
                )}

                {/* Details */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap mb-1">
                    <span
                      className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                        ad.isActive
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {ad.isActive ? 'چالاکە' : 'ناچالاکە'}
                    </span>
                    {ad.showOnEntry && (
                      <span className="text-[9px] font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                        پەنجەرەی سەرەتا (Popup)
                      </span>
                    )}
                    {ad.showBanner && (
                      <span className="text-[9px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        بانەر
                      </span>
                    )}
                    <span className="text-[9px] font-medium text-slate-400">
                      {ad.badgeText}
                    </span>
                  </div>

                  <h4 className="font-black text-xs text-slate-900 truncate">{ad.title}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed font-normal">
                    {ad.description}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-50 w-full sm:w-auto justify-end">
                {/* Toggle Active Button */}
                <button
                  onClick={() => toggleAdActive(ad.id)}
                  className={`p-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 ${
                    ad.isActive
                      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                  title={ad.isActive ? 'ناچالاککردن' : 'چالاککردن'}
                >
                  {ad.isActive ? <CheckCircle size={15} /> : <XCircle size={15} />}
                </button>

                {/* Preview Button */}
                <button
                  onClick={() => showAdPreview(ad)}
                  className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 transition-colors"
                  title="پێشبینین (چۆن کڕیار دەیبینێت)"
                >
                  <Eye size={15} />
                </button>

                {/* Edit Button */}
                <button
                  onClick={() => openEditModal(ad)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  title="دەستکاریکردن"
                >
                  <Edit2 size={15} />
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => {
                    if (confirm('دڵنیایت لە سڕینەوەی ئەم ڕیکلامە؟')) {
                      deleteAd(ad.id);
                    }
                  }}
                  className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                  title="سڕینەوە"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-purple-50/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-700 text-white flex items-center justify-center">
                  <Megaphone size={16} />
                </div>
                <h3 className="font-black text-sm text-slate-900">
                  {editingAdId ? 'دەستکاریکردنی ڕیکلام' : 'زیادکردنی ڕیکلامی نوێ'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-4 space-y-3.5 overflow-y-auto flex-1 text-xs">
              {/* Title */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  سەردێڕی سەرەکی ڕیکلام: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="بۆ نموونە: ٪٣٠ داشکاندن لە پیتزای خەلیفان"
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-purple-600 outline-none"
                />
              </div>

              {/* Subtitle & Badge */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">تێکستی ناسێنەر:</label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="نموونە: ئۆفەری وەرزی"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-purple-600 outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">باج / تاگی ڕیکلام:</label>
                  <input
                    type="text"
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    placeholder="ڕیکلامی تایبەت"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-purple-600 outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  دەقی ڕیکلامەکە: <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="ڕوونکردنەوەی تەواو دەربارەی ئۆفەرەکە بنووسە..."
                  rows={2}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-purple-600 outline-none resize-none"
                />
              </div>

              {/* Image URL & Presets */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  وێنەی ڕیکلام (لینک یان لە پێشنیارەکان هەڵبژێرە):
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-purple-600 outline-none text-left"
                  dir="ltr"
                />

                {/* Preset Chips */}
                <div className="mt-2">
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">
                    وێنەی ئامادەکراو بە یەک کلیک:
                  </span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {PRESET_IMAGES.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => setImageUrl(preset.url)}
                        className={`relative rounded-xl overflow-hidden h-14 border transition-all ${
                          imageUrl === preset.url
                            ? 'border-purple-600 ring-2 ring-purple-600/30'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <img
                          src={preset.url}
                          alt={preset.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[8px] p-0.5 truncate text-center">
                          {preset.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Type */}
              <div className="pt-2 border-t border-slate-100">
                <label className="font-bold text-slate-700 block mb-1">
                  کرداری دوگمەی ڕیکلام (کاتی کلیک کردن):
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActionType('NONE')}
                    className={`p-2 rounded-xl border text-center font-bold transition-all ${
                      actionType === 'NONE'
                        ? 'bg-purple-700 text-white border-purple-700'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    تەنها بینین (داخستن)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActionType('RESTAURANT')}
                    className={`p-2 rounded-xl border text-center font-bold transition-all flex items-center justify-center gap-1 ${
                      actionType === 'RESTAURANT'
                        ? 'bg-purple-700 text-white border-purple-700'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <Store size={14} />
                    <span>چێشتخانە لە ئەپ</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActionType('PHONE')}
                    className={`p-2 rounded-xl border text-center font-bold transition-all flex items-center justify-center gap-1 ${
                      actionType === 'PHONE'
                        ? 'bg-purple-700 text-white border-purple-700'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <Phone size={14} />
                    <span>پەیوەندی تەلەفۆنی</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActionType('LINK')}
                    className={`p-2 rounded-xl border text-center font-bold transition-all flex items-center justify-center gap-1 ${
                      actionType === 'LINK'
                        ? 'bg-purple-700 text-white border-purple-700'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <ExternalLink size={14} />
                    <span>لینکی دەرەکی</span>
                  </button>
                </div>
              </div>

              {/* Conditional Action Details */}
              {actionType === 'RESTAURANT' && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    چێشتخانەی دیاریکراو هەڵبژێرە:
                  </label>
                  <select
                    value={targetRestaurantId}
                    onChange={(e) => setTargetRestaurantId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                  >
                    {restaurants.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.category})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {actionType === 'PHONE' && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">ژمارەی تەلەفۆن:</label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="0750XXXXXXX"
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none"
                    dir="ltr"
                  />
                </div>
              )}

              {actionType === 'LINK' && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">لینک (URL):</label>
                  <input
                    type="url"
                    value={actionUrl}
                    onChange={(e) => setActionUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 outline-none"
                    dir="ltr"
                  />
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">دەقی سەر دوگمەکە:</label>
                <input
                  type="text"
                  value={actionText}
                  onChange={(e) => setActionText(e.target.value)}
                  placeholder="بۆ نموونە: بینینی مێنۆ و داواکردن"
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none"
                />
              </div>

              {/* Switches */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <label className="flex items-center justify-between p-2 rounded-xl bg-slate-50 cursor-pointer">
                  <span className="font-bold text-slate-700">
                    پیشاندان وەک پەنجەرەی گەورە (Popup) لە سەرەتای چوونە ناو ئەپ
                  </span>
                  <input
                    type="checkbox"
                    checked={showOnEntry}
                    onChange={(e) => setShowOnEntry(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded-xl bg-slate-50 cursor-pointer">
                  <span className="font-bold text-slate-700">
                    پیشاندان وەک بانەر لە ناو لیستی چێشتخانەکان
                  </span>
                  <input
                    type="checkbox"
                    checked={showBanner}
                    onChange={(e) => setShowBanner(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded-xl bg-emerald-50 cursor-pointer">
                  <span className="font-bold text-emerald-800">
                    چالاککردنی ڕیکلام (Active بێت لە ئەپ)
                  </span>
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                </label>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50"
                >
                  پاشگەزبوونەوە
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-black shadow-md shadow-purple-700/30"
                >
                  {editingAdId ? 'نوێکردنەوەی ڕیکلام' : 'بڵاوکردنەوەی ڕیکلام'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

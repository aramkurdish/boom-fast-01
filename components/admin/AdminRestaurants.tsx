import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Restaurant } from '../../types';
import {
  Plus,
  Store,
  Trash2,
  Edit2,
  Power,
  Star,
  X,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  Crown,
  Sparkles,
  DollarSign,
  Layers,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { AddRestaurantModal } from './AddRestaurantModal';

export const AdminRestaurants: React.FC = () => {
  const {
    restaurants,
    addRestaurant,
    updateRestaurant,
    deleteRestaurant,
    toggleRestaurantStatus,
    moveRestaurantOrder,
    moveRestaurantToTop,
    toggleRestaurantSponsored,
    setRestaurantRank
  } = useApp();

  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRest, setEditingRest] = useState<Restaurant | null>(null);

  // Quick feedback toast
  const [notice, setNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3000);
  };

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState('پیتزا');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('20-30 خولەک');
  const [logo, setLogo] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [distanceKm, setDistanceKm] = useState('2.5');

  // Sponsored & Ranking states
  const [isSponsored, setIsSponsored] = useState(false);
  const [sponsoredBadge, setSponsoredBadge] = useState('سپۆنسەرکراو ⭐');
  const [subscriptionPlan, setSubscriptionPlan] = useState('');

  const openAdd = () => {
    setName('');
    setCategory('پیتزا');
    setAddress('سولەیمانی');
    setDescription('');
    setDeliveryTime('20-30 خولەک');
    setLogo('https://images.unsplash.com/photo-1579758630668-188c22e827b0?w=200&auto=format&fit=crop&q=80');
    setCoverImage('https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80');
    setDistanceKm('2.5');
    setIsSponsored(false);
    setSponsoredBadge('سپۆنسەرکراو ⭐');
    setSubscriptionPlan('');
    setEditingRest(null);
    setIsModalOpen(true);
  };

  const openEdit = (r: Restaurant) => {
    setEditingRest(r);
    setName(r.name);
    setCategory(r.category);
    setAddress(r.address);
    setDescription(r.description);
    setDeliveryTime(r.deliveryTime);
    setLogo(r.logo);
    setCoverImage(r.coverImage);
    setDistanceKm(r.distanceKm?.toString() || '2.5');
    setIsSponsored(r.isSponsored || false);
    setSponsoredBadge(r.sponsoredBadge || 'سپۆنسەرکراو ⭐');
    setSubscriptionPlan(r.subscriptionPlan || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    if (editingRest) {
      updateRestaurant(editingRest.id, {
        name,
        category,
        address,
        description,
        deliveryTime,
        logo: logo || 'https://images.unsplash.com/photo-1579758630668-188c22e827b0?w=200&auto=format&fit=crop&q=80',
        coverImage: coverImage || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80',
        distanceKm: parseFloat(distanceKm) || 2.5,
        isSponsored,
        sponsoredBadge: isSponsored ? (sponsoredBadge || 'سپۆنسەرکراو ⭐') : undefined,
        subscriptionPlan: subscriptionPlan || undefined
      });
      showNotice(`زانیارییەکانی «${name}» نوێکرانەوە`);
    } else {
      addRestaurant({
        name,
        category,
        address,
        description,
        deliveryTime,
        rating: 4.8,
        ratingCount: 1,
        isOpen: true,
        logo: logo || 'https://images.unsplash.com/photo-1579758630668-188c22e827b0?w=200&auto=format&fit=crop&q=80',
        coverImage: coverImage || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80',
        distanceKm: parseFloat(distanceKm) || 2.5,
        isSponsored,
        sponsoredBadge: isSponsored ? (sponsoredBadge || 'سپۆنسەرکراو ⭐') : undefined,
        subscriptionPlan: subscriptionPlan || undefined
      });
      showNotice(`چێشتخانەی «${name}» زیادکرا`);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, restName: string) => {
    if (window.confirm(`ئایا دڵنیایت دەتەوێت چێشتخانەی «${restName}» بسڕیتەوە؟`)) {
      deleteRestaurant(id);
      showNotice(`چێشتخانەی «${restName}» سڕایەوە`);
    }
  };

  const sponsoredCount = restaurants.filter(r => r.isSponsored).length;
  const openCount = restaurants.filter(r => r.isOpen).length;

  return (
    <div className="space-y-4 animate-in fade-in" dir="rtl">
      {/* Toast Notice */}
      {notice && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold border border-slate-700 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{notice}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-100 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-black text-slate-900">ڕێکخستن و ڕیزبەندی چێشتخانەکان</h2>
            <span className="bg-purple-100 text-purple-700 text-[10px] font-black px-2 py-0.5 rounded-full border border-purple-200">
              Super Admin
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            پلەبەندی چێشتخانەکان دیاری بکە؛ ئەو چێشتخانانەی پارەی بەشداری یان سپۆنسەر دەدەن بهێنە سەرووی هەمووان
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => setIsAddAccountOpen(true)}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-2xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition-transform"
          >
            <Plus size={15} />
            <span>+ Add Restaurant</span>
          </button>
          <button
            onClick={openAdd}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold flex items-center gap-1 transition-colors"
          >
            <Store size={15} />
            <span>زیادکردنی خێرا</span>
          </button>
        </div>
      </div>

      {/* Educational Banner for Super Admin */}
      <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 p-3.5 rounded-3xl border border-amber-200/80 shadow-2xs flex items-start gap-3">
        <div className="w-9 h-9 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
          <Crown size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-black text-amber-950 flex items-center gap-2">
            <span>سیستەمی پلەبەندی چێشتخانەی VIP و سپۆنسەرکراو</span>
            <span className="text-[10px] bg-amber-200/80 text-amber-900 px-2 py-0.2 rounded-full font-bold">
              {sponsoredCount} بەشداربووی VIP
            </span>
          </h4>
          <p className="text-[11px] text-amber-800 leading-relaxed mt-1">
            ئەو چێشتخانەی لە ڕیزبەندی یەکەم و سەروەدایە، لە ئەپەکەدا دەستبەجێ کڕیار یەکەم دانە دەیبینێت.
            دەتوانیت بە دوگمەی <span className="font-bold bg-white/70 px-1 py-0.2 rounded">🔝 سەرووی هەمووان</span> یان <span className="font-bold bg-white/70 px-1 py-0.2 rounded">⬆️ هەنگاو بۆ سەرەوە</span> پلەیان بگۆڕیت، یاخود بە دوگمەی تاجی زێڕین <span className="font-bold bg-white/70 px-1 py-0.2 rounded">👑</span> ڕاستەوخۆ بیکەیتە VIP!
          </p>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="bg-white p-2.5 rounded-2xl border border-slate-100 shadow-2xs">
          <span className="text-[10px] text-slate-400 font-bold block">کۆی چێشتخانەکان</span>
          <span className="text-sm font-black text-slate-900">{restaurants.length} دانە</span>
        </div>
        <div className="bg-amber-50/70 p-2.5 rounded-2xl border border-amber-100 shadow-2xs">
          <span className="text-[10px] text-amber-600 font-bold block">VIP / سپۆنسەرکراو</span>
          <span className="text-sm font-black text-amber-700">{sponsoredCount} چێشتخانە</span>
        </div>
        <div className="bg-emerald-50/70 p-2.5 rounded-2xl border border-emerald-100 shadow-2xs">
          <span className="text-[10px] text-emerald-600 font-bold block">کراوە و چالاک</span>
          <span className="text-sm font-black text-emerald-700">{openCount} کراوە</span>
        </div>
      </div>

      {/* Restaurants List with Ordering & Priority Controls */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1 text-xs font-bold text-slate-500">
          <span>ڕیزبەندی و پلە لە ئەپی کڕیار (سەرەوە ⬅ خوارەوە)</span>
          <span className="text-[11px] text-slate-400">ڕیزبەندی ڕاستەوخۆ دەگۆڕدرێت</span>
        </div>

        {restaurants.map((rest, index) => {
          const isTopRank = index === 0;
          const isSecondRank = index === 1;
          const isThirdRank = index === 2;

          return (
            <div
              key={rest.id}
              className={`p-3.5 rounded-3xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                rest.isSponsored
                  ? 'bg-gradient-to-r from-amber-50/60 via-white to-amber-50/30 border-amber-300/80 ring-1 ring-amber-400/20 shadow-xs'
                  : 'bg-white border-slate-100 shadow-2xs hover:border-slate-200'
              }`}
            >
              {/* Left Side: Rank Badge + Logo + Info */}
              <div className="flex items-center gap-3 min-w-0">
                {/* Visual Rank Pill */}
                <div
                  className={`w-10 h-10 rounded-2xl shrink-0 flex flex-col items-center justify-center font-black transition-transform ${
                    isTopRank
                      ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-md shadow-amber-500/25 ring-2 ring-amber-300'
                      : isSecondRank
                      ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-slate-800 ring-1 ring-slate-300'
                      : isThirdRank
                      ? 'bg-gradient-to-br from-amber-700 to-amber-900 text-amber-100 ring-1 ring-amber-700'
                      : 'bg-slate-100 text-slate-600 border border-slate-200/80'
                  }`}
                  title={`پلەی ${index + 1} لە ئەپەکە`}
                >
                  <span className="text-[9px] font-bold leading-none">
                    {isTopRank ? '🥇' : isSecondRank ? '🥈' : isThirdRank ? '🥉' : 'پلە'}
                  </span>
                  <span className="text-xs leading-tight font-black">#{index + 1}</span>
                </div>

                {/* Logo */}
                <div className="relative shrink-0">
                  <img
                    src={rest.logo}
                    alt={rest.name}
                    className="w-12 h-12 rounded-2xl object-cover border border-slate-100"
                    referrerPolicy="no-referrer"
                  />
                  {rest.isSponsored && (
                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
                      <Crown size={11} />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-black text-xs sm:text-sm text-slate-900 truncate">
                      {rest.name}
                    </h3>

                    {/* Status badge */}
                    <span
                      className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                        rest.isOpen ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {rest.isOpen ? 'کراوە' : 'داخراو'}
                    </span>

                    {/* Sponsored VIP Tag */}
                    {rest.isSponsored ? (
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-2xs flex items-center gap-1">
                        <Sparkles size={10} className="fill-amber-200" />
                        <span>{rest.sponsoredBadge || 'VIP سپۆنسەر'}</span>
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                        ئاسایی
                      </span>
                    )}
                  </div>

                  {/* Address & Meta */}
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{rest.address}</p>

                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium mt-1 flex-wrap">
                    <span>⭐ {rest.rating}</span>
                    <span>• {rest.category}</span>
                    <span>• {rest.distanceKm} کم دوور</span>
                    {rest.subscriptionPlan && (
                      <span className="text-amber-700 bg-amber-100/80 px-1.5 py-0.2 rounded-md font-bold">
                        💰 {rest.subscriptionPlan}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Side: Reordering & Administrative Action Buttons */}
              <div className="flex items-center justify-between sm:justify-end gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                {/* Direct Rank selector */}
                <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold px-1">پلە:</span>
                  <select
                    value={index + 1}
                    onChange={(e) => {
                      const newRank = parseInt(e.target.value, 10);
                      setRestaurantRank(rest.id, newRank);
                      showNotice(`«${rest.name}» گوازرایەوە بۆ پلەی #${newRank}`);
                    }}
                    className="bg-white text-slate-800 text-xs font-black px-1.5 py-0.5 rounded-lg border border-slate-200 focus:outline-none cursor-pointer"
                  >
                    {restaurants.map((_, i) => (
                      <option key={i} value={i + 1}>
                        #{i + 1} {i === 0 ? ' (سەرەوە 👑)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Move Up Button */}
                <button
                  onClick={() => {
                    moveRestaurantOrder(rest.id, 'UP');
                    showNotice(`«${rest.name}» هەنگاوێک بەرزکرایەوە`);
                  }}
                  disabled={index === 0}
                  className={`p-2 rounded-xl border transition-colors ${
                    index === 0
                      ? 'border-slate-100 text-slate-300 cursor-not-allowed bg-slate-50'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 active:scale-95'
                  }`}
                  title="هەنگاوێک بەرەو سەرەوە (Move Up)"
                >
                  <ArrowUp size={14} />
                </button>

                {/* Move Down Button */}
                <button
                  onClick={() => {
                    moveRestaurantOrder(rest.id, 'DOWN');
                    showNotice(`«${rest.name}» هەنگاوێک دابەزێندرا`);
                  }}
                  disabled={index === restaurants.length - 1}
                  className={`p-2 rounded-xl border transition-colors ${
                    index === restaurants.length - 1
                      ? 'border-slate-100 text-slate-300 cursor-not-allowed bg-slate-50'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 active:scale-95'
                  }`}
                  title="هەنگاوێک بەرەو خوارەوە (Move Down)"
                >
                  <ArrowDown size={14} />
                </button>

                {/* Move to TOP (👑 Make First) */}
                <button
                  onClick={() => {
                    moveRestaurantToTop(rest.id);
                    showNotice(`«${rest.name}» خرایە سەرووی هەمووان (#1) 👑`);
                  }}
                  disabled={index === 0}
                  className={`px-2 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 border transition-colors ${
                    index === 0
                      ? 'border-amber-200 bg-amber-100/50 text-amber-700 cursor-default'
                      : 'border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 active:scale-95'
                  }`}
                  title="هێنانە سەرووی هەمووان"
                >
                  <ChevronsUp size={14} />
                  <span className="hidden md:inline">سەرەوە</span>
                </button>

                {/* Quick Toggle VIP / Sponsored */}
                <button
                  onClick={() => {
                    toggleRestaurantSponsored(rest.id);
                    showNotice(
                      rest.isSponsored
                        ? `سپۆنسەری «${rest.name}» ناچالاک کرا`
                        : `«${rest.name}» وەک VIP سپۆنسەرکراو دیاریکرا و خرایە سەرەوە ⭐`
                    );
                  }}
                  className={`p-2 rounded-xl border transition-all ${
                    rest.isSponsored
                      ? 'border-amber-400 bg-amber-500 text-white shadow-xs'
                      : 'border-slate-200 text-slate-400 hover:text-amber-600 hover:border-amber-300 hover:bg-amber-50'
                  }`}
                  title={rest.isSponsored ? 'لابردنی سپۆنسەر' : 'دیاریکردن وەک VIP سپۆنسەر'}
                >
                  <Crown size={14} />
                </button>

                {/* Open/Close status */}
                <button
                  onClick={() => {
                    toggleRestaurantStatus(rest.id);
                    showNotice(
                      rest.isOpen
                        ? `«${rest.name}» بە کاتی داخرا`
                        : `«${rest.name}» کرایەوە`
                    );
                  }}
                  className={`p-2 rounded-xl border transition-colors ${
                    rest.isOpen
                      ? 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                      : 'border-slate-200 text-slate-400 hover:bg-slate-50'
                  }`}
                  title={rest.isOpen ? 'داخستن' : 'کردنەوە'}
                >
                  <Power size={14} />
                </button>

                {/* Edit */}
                <button
                  onClick={() => openEdit(rest)}
                  className="p-2 rounded-xl border border-purple-200 text-purple-700 hover:bg-purple-50 transition-colors"
                  title="دەستکاریکردنی زانیاری و پلانی پارەدان"
                >
                  <Edit2 size={14} />
                </button>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(rest.id, rest.name)}
                  className="p-2 rounded-xl border border-rose-100 text-rose-500 hover:bg-rose-50 hover:border-rose-200 transition-colors"
                  title="سڕینەوەی چێشتخانە"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add / Edit with Subscription & Priority Settings */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in" dir="rtl">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  {editingRest ? 'دەستکاریکردنی ڕێستورانت و سپۆنسەر' : 'دروستکردنی ڕێستورانتی نوێ'}
                </h3>
                <p className="text-[11px] text-slate-400">زانیارییە سەرەکییەکان و بژاردەی پێشینەی سەرەوە</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-3.5 flex-1 text-xs">
              {/* VIP / Subscription Section (The requested feature) */}
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 font-black text-amber-950 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSponsored}
                      onChange={(e) => setIsSponsored(e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded-md focus:ring-amber-500 border-amber-300"
                    />
                    <Crown size={15} className="text-amber-600" />
                    <span>چێشتخانەی VIP / سپۆنسەرکراو (لە سەرووەوە پیشان دەدرێت)</span>
                  </label>
                </div>
                <p className="text-[10px] text-amber-700">
                  ئەگەر ئەم بژاردەیە چالاک بێت، کڕیار بە تاگی تایبەت دەیبینێت و پارەی پێشینەی زیاتری بۆ دەسەپێنرێت.
                </p>

                {isSponsored && (
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-amber-200/60 animate-in fade-in">
                    <div>
                      <label className="block font-bold text-amber-900 mb-1">تێکستی تاگ (Badge)</label>
                      <input
                        type="text"
                        value={sponsoredBadge}
                        onChange={(e) => setSponsoredBadge(e.target.value)}
                        placeholder="وەک: سپۆنسەرکراو ⭐"
                        className="w-full p-2 rounded-xl border border-amber-300 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-amber-900 mb-1">پلانی پارەدان / تێبینی</label>
                      <input
                        type="text"
                        value={subscriptionPlan}
                        onChange={(e) => setSubscriptionPlan(e.target.value)}
                        placeholder="وەک: مانگانە ٥٠,٠٠٠ دینار"
                        className="w-full p-2 rounded-xl border border-amber-300 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Basic info */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">ناوی ڕێستورانت *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="وەک: پیتزا حەیات"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">بەش (Category) *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white"
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
                <label className="block font-bold text-slate-700 mb-1">ناونیشان *</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="وەک: سولەیمانی، شەقامی توی مەلیک"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">کاتی گەیاندن</label>
                  <input
                    type="text"
                    value={deliveryTime}
                    onChange={(e) => setDeliveryTime(e.target.value)}
                    placeholder="25-35 خولەک"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">دووری سەرەتایی (کم)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={distanceKm}
                    onChange={(e) => setDistanceKm(e.target.value)}
                    placeholder="2.5"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">وەسف</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="وەسفی ڕێستورانت و جۆری خواردنەکان..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">بەستەری لۆگۆ (Logo URL)</label>
                <input
                  type="url"
                  value={logo}
                  onChange={(e) => setLogo(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">بەستەری وێنەی سەر بەرگ (Cover Image URL)</label>
                <input
                  type="url"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-purple-700 hover:bg-purple-800 text-white font-black rounded-xl shadow-md transition-all active:scale-98 mt-2"
              >
                {editingRest ? 'پاشەکەوتکردنی گۆڕانکارییەکان' : 'دروستکردنی ڕێستورانت'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Super Admin Add Restaurant Account Modal */}
      <AddRestaurantModal
        isOpen={isAddAccountOpen}
        onClose={() => setIsAddAccountOpen(false)}
      />
    </div>
  );
};

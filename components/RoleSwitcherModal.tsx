import React from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { X, ShieldAlert, Store, Bike, User, CheckCircle2 } from 'lucide-react';

interface RoleOption {
  role: UserRole;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  badgeBg: string;
  badgeText: string;
}

const ROLES: RoleOption[] = [
  {
    role: 'CUSTOMER',
    title: 'کڕیار (Customer)',
    subtitle: 'شەهید مەحمود',
    description: 'گەڕان بەدوای چێشتخانەکان، هەڵبژاردنی خواردن، سەبەتە، داواکردن و بەدواداچوونی ٧ هەنگاوی داواکاری بە نەخشە.',
    icon: User,
    badgeBg: 'bg-orange-500',
    badgeText: 'text-orange-600'
  },
  {
    role: 'RESTAURANT',
    title: 'ڕێستورانت (Restaurant)',
    subtitle: 'Boom Pizza & Burger',
    description: 'داشبۆردی فرۆش، وەرگرتنی داواکارییە نوێیەکان، گۆڕینی بار بۆ (ئامادەکردن / ئامادەیە)، بەڕێوەبردنی مێنیو و نرخەکان.',
    icon: Store,
    badgeBg: 'bg-blue-600',
    badgeText: 'text-blue-600'
  },
  {
    role: 'DRIVER',
    title: 'شۆفێری گەیاندن (Driver)',
    subtitle: 'ڕەوەند ئازاد (+964 750 444 1122)',
    description: 'دۆخی سەرهێڵ/دەرهێڵ، قبوڵکردنی داواکارییە ئامادەکان، هەنگاوەکانی گەیاندن لە ڕێستورانت بۆ ماڵی کڕیار، داهاتی ڕۆژانە.',
    icon: Bike,
    badgeBg: 'bg-emerald-600',
    badgeText: 'text-emerald-600'
  },
  {
    role: 'SUPER_ADMIN',
    title: 'سوپەر ئەدمین (Super Admin)',
    subtitle: 'کۆنترۆڵی گشتی سیستەم',
    description: 'زیادکردنی ڕێستورانتی نوێ، دروستکردنی ئەکاونتی شۆفێر، بەڕێوەبردنی زۆنەکانی گەیاندن و نرخەکان بەپێی کیلۆمەتر.',
    icon: ShieldAlert,
    badgeBg: 'bg-purple-600',
    badgeText: 'text-purple-600'
  }
];

export const RoleSwitcherModal: React.FC = () => {
  const { currentRole, switchRole, isRoleSwitcherOpen, setIsRoleSwitcherOpen } = useApp();

  if (!isRoleSwitcherOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" dir="rtl">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-5 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-black text-slate-900">هەڵبژاردنی ڕۆڵ</h2>
            <p className="text-xs text-slate-500 font-medium">
              تەواوی ٤ ڕۆڵەکە لە یەک ئەپڵیکەیشندا دروستکراون
            </p>
          </div>
          <button
            onClick={() => setIsRoleSwitcherOpen(false)}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Roles List */}
        <div className="space-y-2.5 my-4 overflow-y-auto pr-1">
          {ROLES.map((r) => {
            const isSelected = currentRole === r.role;
            const Icon = r.icon;
            return (
              <button
                key={r.role}
                onClick={() => {
                  switchRole(r.role);
                  setIsRoleSwitcherOpen(false);
                }}
                className={`w-full text-right p-3.5 rounded-2xl border-2 transition-all flex items-start gap-3 relative ${
                  isSelected
                    ? 'border-orange-500 bg-orange-50/40 shadow-sm ring-2 ring-orange-500/20'
                    : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/60'
                }`}
              >
                <div className={`p-2.5 rounded-xl text-white ${r.badgeBg} shrink-0 mt-0.5 shadow-sm`}>
                  <Icon size={20} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-black text-sm text-slate-900">{r.title}</span>
                    {isSelected && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                        <CheckCircle2 size={12} />
                        چالاک
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                    {r.subtitle}
                  </span>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {r.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="bg-slate-50 rounded-2xl p-3 text-[11px] text-slate-500 text-center leading-relaxed">
          💡 کڕیاران ناتوانن ڕۆڵی خۆیان لە کاتی دروستکردنی هەژماردا دیاری بکەن؛ تەنها سوپەر ئەدمین دەتوانێت هەژماری ڕێستورانت و شۆفێران دابمەزرێنێت.
        </div>
      </div>
    </div>
  );
};

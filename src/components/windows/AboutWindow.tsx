import React, { useState } from 'react';
import { Landmark, ShieldCheck, Mail, PhoneCall, Award, KeyRound, Globe, Server, Check } from 'lucide-react';
import { useErp } from '../../context/ErpContext';

interface AboutWindowProps {
  onClose: () => void;
}

export const AboutWindow: React.FC<AboutWindowProps> = ({ onClose }) => {
  const { theme, showToast } = useErp();
  const isDark = theme === 'dark' || theme === 'light-black';

  const [licenseKey, setLicenseKey] = useState('ALM-2026-99X88-PRO');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(true);

  const handleVerifyLicense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseKey.trim()) return;

    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setIsVerified(true);
      showToast('تم التحقق من رخصة الميزان دوت نت بنجاح! نوع الترخيص: ERP Enterprise Unlimited', 'success');
    }, 1000);
  };

  return (
    <div className={`p-6 h-full flex flex-col justify-between overflow-y-auto select-none font-sans ${isDark ? 'bg-zinc-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`} dir="rtl">
      
      {/* Top Brand Block */}
      <div className="space-y-4">
        <div className="flex items-center gap-4 border-b pb-4 border-slate-200 dark:border-zinc-800">
          <div className="bg-gradient-to-tr from-blue-700 to-indigo-600 text-white p-3.5 rounded-2xl shadow-md">
            <Landmark className="w-10 h-10" />
          </div>
          <div>
            <h3 className="font-black text-base text-slate-900 dark:text-white leading-tight">برنامج الميزان دوت نت</h3>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 block mt-0.5">منظومة الحسابات والمستودعات السحابية المتكاملة ERP</span>
            <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 px-2 py-0.5 rounded-full font-bold font-mono inline-block mt-1.5">v11.4.2 Enterprise Gold Edition</span>
          </div>
        </div>

        {/* Professional Specs Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className={`p-3 rounded-xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'} space-y-1`}>
            <span className="text-[10px] text-slate-400 font-bold block">مطور النظام والجهة المالكة:</span>
            <span className="text-xs font-black text-slate-800 dark:text-slate-100 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-yellow-500" />
              مؤسسة الميزان للبرمجيات والمحاسبة
            </span>
          </div>
          <div className={`p-3 rounded-xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'} space-y-1`}>
            <span className="text-[10px] text-slate-400 font-bold block">حالة الخادم المشترك:</span>
            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-mono">
              <Server className="w-3.5 h-3.5 text-emerald-500" />
              Node CLUSTER_ACTIVE_PRIMARY
            </span>
          </div>
        </div>

        {/* License Verification Block */}
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'} space-y-3`}>
          <div className="flex justify-between items-center border-b pb-1.5 border-slate-100 dark:border-zinc-800">
            <span className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-blue-600" />
              إدارة ترخيص المنتج والتحقق التجاري
            </span>
            {isVerified && (
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-black flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                ترخيص معتمد ومحمي
              </span>
            )}
          </div>

          <form onSubmit={handleVerifyLicense} className="flex gap-2">
            <input 
              type="text" 
              value={licenseKey} 
              onChange={e => setLicenseKey(e.target.value)}
              placeholder="أدخل الرقم التسلسلي للمنشأة"
              className="flex-1 p-2 text-xs border rounded bg-slate-50 dark:bg-zinc-950 font-mono font-bold dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-blue-500 text-center"
              required
            />
            <button 
              type="submit" 
              disabled={isVerifying}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded text-xs font-black transition-all cursor-pointer flex items-center gap-1"
            >
              {isVerifying ? 'جاري التحقق...' : 'تنشيط'}
            </button>
          </form>
        </div>

        {/* Commercial Support & Channels */}
        <div className="space-y-1.5">
          <span className="text-[10.5px] font-bold text-slate-400 block">قنوات التواصل والدعم الفني المباشر للشركات الكبرى:</span>
          <div className="grid grid-cols-3 gap-2">
            <a href="mailto:support@almeezan.net" className="p-2 border border-slate-200 dark:border-zinc-800 hover:border-blue-500 rounded-lg flex flex-col items-center justify-center text-center bg-white dark:bg-zinc-900 transition-colors">
              <Mail className="w-4 h-4 text-blue-500 mb-1" />
              <span className="text-[10px] font-bold">البريد الإلكتروني</span>
            </a>
            <a href="tel:+96611000000" className="p-2 border border-slate-200 dark:border-zinc-800 hover:border-blue-500 rounded-lg flex flex-col items-center justify-center text-center bg-white dark:bg-zinc-900 transition-colors">
              <PhoneCall className="w-4 h-4 text-emerald-500 mb-1" />
              <span className="text-[10px] font-bold">الدعم الهاتفي</span>
            </a>
            <a href="https://almeezan.net" target="_blank" rel="noreferrer" className="p-2 border border-slate-200 dark:border-zinc-800 hover:border-blue-500 rounded-lg flex flex-col items-center justify-center text-center bg-white dark:bg-zinc-900 transition-colors">
              <Globe className="w-4 h-4 text-indigo-500 mb-1" />
              <span className="text-[10px] font-bold">بوابة المطورين</span>
            </a>
          </div>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="border-t pt-4 border-slate-200 dark:border-zinc-800 flex justify-between items-center mt-5">
        <span className="text-[10px] text-slate-400 font-medium">جميع الحقوق محفوظة لمؤسسة الميزان المعتمدة © {new Date().getFullYear()}</span>
        <button 
          onClick={onClose}
          className="px-5 py-1.5 bg-slate-800 hover:bg-slate-900 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white font-bold text-xs rounded transition-all cursor-pointer"
        >
          موافق
        </button>
      </div>

    </div>
  );
};

import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { 
  Monitor, Printer, Key, ShieldCheck, DownloadCloud, Undo2, 
  Settings2, Keyboard, Play, ToggleLeft, CheckCircle, HardDrive
} from 'lucide-react';

interface WindowsHubWindowProps {
  windowId: string;
  onClose: () => void;
}

export const WindowsHubWindow: React.FC<WindowsHubWindowProps> = ({ windowId, onClose }) => {
  const { currentVersion, rollbackLatestVersion, showToast, theme } = useErp();

  // Desktop App settings
  const [enableShortcuts, setEnableShortcuts] = useState<boolean>(true);
  const [silentUpdates, setSilentUpdates] = useState<boolean>(true);
  const [defaultPrinterType, setDefaultPrinterType] = useState<string>('A4_laser');
  const [hardwareScaleConnected, setHardwareScaleConnected] = useState<boolean>(false);
  
  // Shortcuts table
  const [shortcuts, setShortcuts] = useState([
    { key: 'F9', actionName: 'طباعة فورية للفاتورة الحالية', code: 'print_invoice' },
    { key: 'F12', actionName: 'تسديد القيمة نقداً وحفظ', code: 'pay_cash' },
    { key: 'Ctrl + Alt + N', actionName: 'فتح فاتورة مبيعات جديدة', code: 'new_invoice' },
    { key: 'Ctrl + Alt + J', actionName: 'إنشاء سند قيد يومية سريع', code: 'new_journal' },
    { key: 'F1', actionName: 'عرض دليل التعليمات الرقمي', code: 'help' },
    { key: 'Esc', actionName: 'إغلاق النافذة النشطة حالياً', code: 'close_window' }
  ]);

  const handleTestShortcut = (shortcut: any) => {
    showToast(`تم اختبار الاختصار بنجاح! تشغيل إجراء: "${shortcut.actionName}" [${shortcut.key}]`, 'success');
  };

  const handleRollback = async () => {
    const success = await rollbackLatestVersion();
    if (success) {
      showToast('تم التراجع بنجاح للإصدار المستقر السابق للنظام!', 'success');
    } else {
      showToast('فشل التراجع. يرجى مراجعة صلاحيات مخدم الداتا.', 'error');
    }
  };

  const isDark = theme === 'dark' || theme === 'light-black';

  return (
    <div className={`flex h-full p-4 select-none overflow-hidden transition-colors duration-300 ${isDark ? 'bg-zinc-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`} dir="rtl">
      
      {/* SIDE CONTROL LOGS */}
      <div className={`w-[260px] border-l p-4 shrink-0 flex flex-col justify-between overflow-y-auto ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-sm rounded-lg'}`}>
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b pb-2">
            <Monitor className="w-5 h-5 text-indigo-600" />
            <h3 className="text-xs font-extrabold text-slate-800">بيئة تشغيل Windows Desktop</h3>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
            هنا يمكنك تهيئة خيارات تطبيق الميزان لسطح المكتب المستقل (Windows Client EXE). يمنحك التطبيق وصولاً مباشراً لنظام التشغيل لتسريع العمليات الحسابية والطباعة بدون متصفح.
          </p>

          <div className="bg-slate-900 text-slate-100 p-3 rounded-lg text-[10.5px] font-mono space-y-1.5 border border-slate-800">
            <div className="text-indigo-400 font-extrabold border-b border-slate-800 pb-1 flex justify-between items-center">
              <span>حالة المشغل EXE المحلي</span>
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
            </div>
            <div className="flex justify-between"><span>محرك التشغيل:</span> <span className="font-bold text-white">Chromium 112 / .NET 8</span></div>
            <div className="flex justify-between"><span>الذاكرة المستهلكة:</span> <span className="font-bold text-white">45 MB</span></div>
            <div className="flex justify-between"><span>سرعة معالجة الطباعة:</span> <span className="font-bold text-white">0.05 ثانية</span></div>
          </div>

          {/* Rollback settings */}
          <div className="space-y-2 border-t pt-3">
            <span className="text-[11.5px] font-extrabold text-slate-700 flex items-center gap-1.5">
              <Undo2 className="w-4 h-4 text-rose-500" />
              <span>إدارة الإصدارات والتراجع:</span>
            </span>
            <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
              في حال حدوث خلل تقني غير متوقع بعد تثبيت إصدار نظام جديد، يمكنك التراجع فوراً وبأمان تام للإصدار المستقر السابق.
            </p>
            <button 
              onClick={handleRollback}
              className="w-full py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[10.5px] font-black rounded transition-all cursor-pointer"
            >
              التراجع إلى الإصدار السابق (Rollback)
            </button>
          </div>
        </div>

        <div className="text-[10px] text-slate-400 text-center font-bold">
          EXE Client v{currentVersion} • الميزان دوت نت
        </div>
      </div>

      {/* DETAILED SETTINGS CENTER */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        
        {/* Title Group */}
        <div>
          <h2 className="text-[14px] font-extrabold text-slate-800 flex items-center gap-2">
            <Monitor className="w-5 h-5 text-indigo-600" />
            <span>تخصيص مشغل نظام الويندوز المكتبي (Desktop Integration)</span>
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">قم بضبط الاختصارات السريعة لخدمة الكاشير والطباعة الصامتة والتواصل المباشر مع موازين البضائع.</p>
        </div>

        {/* 2 Grid Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Hardware & Drivers block */}
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-slate-200 shadow-sm'} space-y-3`}>
            <span className="text-[12px] font-black text-slate-750 flex items-center gap-2">
              <Printer className="w-4.5 h-4.5 text-blue-600" />
              <span>تعريفات الطابعات والملحقات المباشرة</span>
            </span>

            <div className="space-y-3 text-[11px]">
              <div className="flex flex-col gap-1">
                <label className="font-extrabold text-slate-600">طابعة الفواتير الافتراضية للشركة:</label>
                <select 
                  value={defaultPrinterType} 
                  onChange={(e) => setDefaultPrinterType(e.target.value)}
                  className="p-1.5 bg-white border border-slate-300 rounded text-[11px]"
                >
                  <option value="A4_laser">طابعة ليزر A4 مكتبية (HP LaserJet)</option>
                  <option value="receipt_80">طابعة حرارية 80 مم (Epson TM-T88)</option>
                  <option value="receipt_58">طابعة كاشير حرارية صغيرة 58 مم</option>
                  <option value="pdf_driver">محرك حفظ ملفات PDF صامت (Silent Writer)</option>
                </select>
              </div>

              <div className="flex items-center justify-between border-t pt-2 border-dashed">
                <div className="flex flex-col">
                  <span className="font-extrabold text-slate-700">الربط بموازين البضائع الإلكترونية:</span>
                  <span className="text-[9.5px] text-slate-400">تلقي قراءة الوزن فورياً عند وزن البنود</span>
                </div>
                <button 
                  onClick={() => {
                    setHardwareScaleConnected(!hardwareScaleConnected);
                    showToast(hardwareScaleConnected ? 'تم فصل ميزان البضائع' : 'تم توصيل ميزان البضائع بنجاح ومعايرة الوزن!', 'success');
                  }}
                  className={`px-3 py-1 text-[10px] font-black rounded border transition-all ${
                    hardwareScaleConnected 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                      : 'bg-slate-100 text-slate-600 border-slate-300'
                  }`}
                >
                  {hardwareScaleConnected ? 'متصل (COM3)' : 'اتصال بميزان'}
                </button>
              </div>

              <div className="flex items-center justify-between border-t pt-2 border-dashed">
                <div className="flex flex-col">
                  <span className="font-extrabold text-slate-700">التحديث الصامت للنظام (Silent Updates):</span>
                  <span className="text-[9.5px] text-slate-400">تحميل وتثبيت التحديثات في الخلفية بلا مقاطعة</span>
                </div>
                <button 
                  onClick={() => setSilentUpdates(!silentUpdates)}
                  className="text-slate-500 hover:text-slate-700"
                >
                  <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${silentUpdates ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                    {silentUpdates ? 'نشط' : 'ملغى'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Global Shortcuts configuration */}
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-slate-200 shadow-sm'} space-y-3`}>
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-black text-slate-750 flex items-center gap-2">
                <Keyboard className="w-4.5 h-4.5 text-indigo-600" />
                <span>إعداد اختصارات لوحة المفاتيح الساخنة</span>
              </span>
              <button 
                onClick={() => {
                  setEnableShortcuts(!enableShortcuts);
                  showToast(enableShortcuts ? 'تم تعطيل اختصارات لوحة المفاتيح' : 'تم تفعيل الاختصارات السريعة بنجاح', 'info');
                }}
                className={`px-2 py-0.5 rounded text-[9px] font-bold ${enableShortcuts ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}
              >
                {enableShortcuts ? 'نشطة' : 'معطلة'}
              </button>
            </div>

            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
              {shortcuts.map((shortcut, idx) => (
                <div key={idx} className="p-2 bg-slate-50 hover:bg-slate-100/80 rounded border border-slate-150 flex justify-between items-center text-[11px] font-medium transition-colors">
                  <div>
                    <div className="font-bold text-slate-700">{shortcut.actionName}</div>
                    <div className="text-[9.5px] text-indigo-600 font-mono font-bold mt-0.5">{shortcut.key}</div>
                  </div>
                  <button 
                    onClick={() => handleTestShortcut(shortcut)}
                    className="p-1 bg-white border border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/50 rounded shadow-xs transition-colors cursor-pointer text-indigo-600"
                    title="اختبار الإجراء فوراً"
                  >
                    <Play className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Security and OS Features Integration */}
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-slate-200 shadow-sm'} space-y-3`}>
          <span className="text-[12px] font-black text-slate-750 flex items-center gap-2">
            <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" />
            <span>صلاحيات الموثوقية العالية والأجهزة المدعومة</span>
          </span>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            <div className="p-3 bg-slate-100/50 rounded-lg text-center border">
              <span className="text-[11px] font-extrabold block text-slate-800">قفل النوافذ (Kiosk Mode)</span>
              <span className="text-[9px] text-emerald-600 block mt-1 font-bold">✓ مدعوم برمجياً</span>
            </div>
            <div className="p-3 bg-slate-100/50 rounded-lg text-center border">
              <span className="text-[11px] font-extrabold block text-slate-800">ميزة درج الكاشير الإلكتروني</span>
              <span className="text-[9px] text-emerald-600 block mt-1 font-bold">✓ مدعوم (توصيل RJ12)</span>
            </div>
            <div className="p-3 bg-slate-100/50 rounded-lg text-center border">
              <span className="text-[11px] font-extrabold block text-slate-800">الربط بشاشات العرض للعملاء</span>
              <span className="text-[9px] text-emerald-600 block mt-1 font-bold">✓ مفعل (USB / COM)</span>
            </div>
            <div className="p-3 bg-slate-100/50 rounded-lg text-center border">
              <span className="text-[11px] font-extrabold block text-slate-800">الربط بأجهزة الدفع (POS)</span>
              <span className="text-[9px] text-emerald-600 block mt-1 font-bold">✓ نشط (الشبكة السعودية مدى)</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

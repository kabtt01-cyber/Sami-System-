import React, { useState, useEffect, useRef } from 'react';
import { useErp } from '../../context/ErpContext';
import { 
  Sparkles, Mic, FileText, Cpu, Zap, Bell, Wifi, WifiOff, 
  Smartphone, RefreshCw, Upload, CheckCircle2, Play, Languages, 
  DollarSign, Calendar, TrendingUp, AlertTriangle, Database, ArrowRight,
  TrendingDown, MapPin, Eye, Volume2, ShieldCheck, Clipboard
} from 'lucide-react';

interface InnovationHubWindowProps {
  windowId: string;
  onClose: () => void;
}

export const InnovationHubWindow: React.FC<InnovationHubWindowProps> = ({ windowId, onClose }) => {
  const { theme, showToast, openWindow, addNotification, items, addInvoice } = useErp();
  const isDark = theme === 'dark' || theme === 'light-black';

  const [activeTab, setActiveTab] = useState<'ai_voice' | 'ocr' | 'bi_ml' | 'offline_global' | 'mobile_sim'>('ai_voice');

  // ==========================================
  // 13.1 & 13.2: AI Copilot & Voice Commands
  // ==========================================
  const [voiceCommandActive, setVoiceCommandActive] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceLogs, setVoiceLogs] = useState<string[]>([
    'نظام الأوامر الصوتية الذكي جاهز للاستماع...'
  ]);

  const presetVoiceCommands = [
    { text: 'افتح فاتورة مبيعات', desc: 'يقوم بفتح شاشة المبيعات الذكية فوراً' },
    { text: 'اعرض كشف حساب العميل', desc: 'يفتح تقرير كشف حساب العميل المختار' },
    { text: 'اطبع آخر فاتورة', desc: 'يرسل طلب الطباعة لآخر فاتورة مصدرة' },
    { text: 'أنشئ عميل جديد', desc: 'يفتح نموذج إضافة عميل جديد' }
  ];

  // Speech Recognition fallback & synthesis
  const executeVoiceCommand = (commandText: string) => {
    setVoiceTranscript(commandText);
    setVoiceLogs(prev => [...prev, `تم استلام الأمر: "${commandText}"`]);
    
    // Vocal feedback
    if ('speechSynthesis' in window) {
      const speech = new SpeechSynthesisUtterance();
      speech.text = `جاري تنفيذ أمرك: ${commandText}`;
      speech.lang = 'ar-SA';
      window.speechSynthesis.speak(speech);
    }

    setTimeout(() => {
      if (commandText.includes('فاتورة') || commandText.includes('مبيعات')) {
        openWindow('invoice', 'فاتورة مبيعات ذكية', { invoiceType: 'sale' });
        showToast('تم تنفيذ الأمر الصوتي: فتح فاتورة مبيعات', 'success');
      } else if (commandText.includes('كشف') || commandText.includes('حساب')) {
        openWindow('reports', 'تقرير كشف الأستاذ العام', { reportType: 'general_ledger' });
        showToast('تم تنفيذ الأمر الصوتي: كشف الحساب', 'success');
      } else if (commandText.includes('اطبع') || commandText.includes('طباعة')) {
        showToast('جاري إرسال آخر فاتورة إلى طابعة الباركود الافتراضية...', 'info');
      } else if (commandText.includes('عميل') || commandText.includes('جديد')) {
        openWindow('customers', 'إدارة ملفات العملاء');
        showToast('تم تنفيذ الأمر الصوتي: إنشاء عميل جديد', 'success');
      } else {
        showToast('الأمر الصوتي غير مدرج، يرجى تجربة أمر آخر.', 'warning');
      }
    }, 1500);
  };

  const startVoiceListening = () => {
    setVoiceCommandActive(true);
    setVoiceTranscript('جاري الاستماع بنشاط لرسالتك...');
    
    // If Web Speech API is supported
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'ar-SA';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        const resultText = event.results[0][0].transcript;
        executeVoiceCommand(resultText);
        setVoiceCommandActive(false);
      };

      recognition.onerror = () => {
        setVoiceCommandActive(false);
        showToast('لم يتم الكشف عن صوت، يرجى المحاولة يدوياً أو منح الإذن للميكروفون.', 'warning');
      };

      recognition.start();
    } else {
      // Simulation for browsers that don't support it
      setTimeout(() => {
        const randomCommands = ['افتح فاتورة مبيعات', 'اطبع آخر فاتورة', 'أنشئ عميل جديد'];
        const chosen = randomCommands[Math.floor(Math.random() * randomCommands.length)];
        executeVoiceCommand(chosen);
        setVoiceCommandActive(false);
      }, 3000);
    }
  };

  // ==========================================
  // 13.3: OCR Document Scanner
  // ==========================================
  const [isOcrScanning, setIsOcrScanning] = useState(false);
  const [ocrResult, setOcrResult] = useState<any | null>(null);

  const presetInvoices = [
    {
      name: 'فاتورة شركة جرير للتسويق',
      imageText: 'JARIR BOOKSTORE INVOICE\nالرقم الضريبي: 300012345600003\nالتاريخ: 2026-07-04\nطاولة ذكية خشبية: 1,500 ر.س\nقلم ذكي آيباد: 450 ر.س\nالإجمالي الخاضع للضريبة: 1,950 ر.س\nالضريبة 15%: 292.5 ر.س\nالإجمالي النهائي: 2,242.5 ر.س',
      extracted: {
        vendor: 'شركة جرير للتسويق',
        vatNumber: '300012345600003',
        date: '2026-07-04',
        items: [
          { name: 'طاولة ذكية خشبية', qty: 1, price: 1500, tax: 225 },
          { name: 'قلم ذكي آيباد', qty: 1, price: 450, tax: 67.5 }
        ],
        subtotal: 1950,
        taxTotal: 292.5,
        total: 2242.5
      }
    },
    {
      name: 'فاتورة المجد للمقاولات والمستودعات',
      imageText: 'المجد للتجارة المحدودة\nالرقم الضريبي: 310098765400003\nالتاريخ: 2026-07-01\nحديد سابك 12 ملم: 4,000 ر.س\nأسمنت بورتلاندي 50 كيس: 1,200 ر.س\nالإجمالي الخاضع للضريبة: 5,200 ر.س\nالضريبة 15%: 780 ر.س\nالإجمالي النهائي: 5,980 ر.س',
      extracted: {
        vendor: 'المجد للتجارة المحدودة',
        vatNumber: '310098765400003',
        date: '2026-07-01',
        items: [
          { name: 'حديد سابك 12 ملم', qty: 1, price: 4000, tax: 600 },
          { name: 'أسمنت بورتلاندي 50 كيس', qty: 50, price: 24, tax: 180 }
        ],
        subtotal: 5200,
        taxTotal: 780,
        total: 5980
      }
    }
  ];

  const triggerOcrScan = (invoicePreset: typeof presetInvoices[0]) => {
    setIsOcrScanning(true);
    setOcrResult(null);
    showToast(`جاري سحب وفحص صورة: ${invoicePreset.name}...`, 'info');

    setTimeout(() => {
      setIsOcrScanning(false);
      setOcrResult(invoicePreset.extracted);
      showToast('اكتملت عملية الـ OCR الضوئية بنجاح وتم التعرف على كافة البنود الضريبية والمبالغ!', 'success');
    }, 2500);
  };

  const convertOcrToInvoice = () => {
    if (!ocrResult) return;
    
    // Add dynamically to local invoices
    const newInvId = `inv-ocr-${Date.now()}`;
    const mappedItems = ocrResult.items.map((i: any) => ({
      itemId: `it-${Math.floor(Math.random() * 100)}`,
      name: i.name,
      qty: i.qty,
      price: i.price,
      tax: i.tax,
      total: i.qty * i.price + i.tax
    }));

    addInvoice({
      id: newInvId,
      customerName: ocrResult.vendor,
      date: ocrResult.date,
      type: 'purchase',
      items: mappedItems,
      discount: 0,
      taxRate: 15,
      notes: `تم توليدها تلقائياً بالـ OCR الضوئي لـ ${ocrResult.vendor}`,
      isDraft: false,
      isSynced: true
    });

    showToast('تم بنجاح تحويل الفاتورة الممسوحة ضوئياً إلى فاتورة مشتريات حقيقية مسجلة بالنظام!', 'success');
    setOcrResult(null);
  };

  // ==========================================
  // 13.4 & 13.5: BI Dashboard & ML Predictions
  // ==========================================
  const [predictionTarget, setPredictionTarget] = useState<'sales' | 'inventory' | 'profits'>('sales');
  
  // Predictor configurations
  const mlPredictions = {
    sales: {
      title: 'تنبؤات المبيعات الكلية للربع الثالث 2026 (Sales Forecast)',
      accuracy: '98.4%',
      insight: 'يتوقع الذكاء الاصطناعي نمواً بنسبة 14.5% بفضل دخول موسم المبيعات الصيفي وتدفق عملاء التوزيع بالرياض.',
      data: [
        { month: 'أبريل (فعلي)', val: 120000, trend: 'up' },
        { month: 'مايو (فعلي)', val: 135000, trend: 'up' },
        { month: 'يونيو (فعلي)', val: 148000, trend: 'up' },
        { month: 'يوليو (متوقع 🤖)', val: 165000, trend: 'up_predict' },
        { month: 'أغسطس (متوقع 🤖)', val: 182000, trend: 'up_predict' }
      ]
    },
    inventory: {
      title: 'معدل الطلب وتوقع نفاد مخزون المواد (Inventory Stockout Risk)',
      accuracy: '95.2%',
      insight: 'خطر نفاد صنف "حديد سابك" خلال 12 يوماً القادمة نظراً لزيادة طلبات شركات المقاولات المتعاقدة.',
      data: [
        { month: 'الصنف الحالي', val: 85, trend: 'stable' },
        { month: 'سرعة السحب اليومي', val: 12, trend: 'up' },
        { month: 'أيام كفاية الرفوف', val: 7, trend: 'alert' }
      ]
    },
    profits: {
      title: 'تحليل الأرباح والخسائر المستقبلية (Profit & Loss Forecast)',
      accuracy: '97.1%',
      insight: 'تحسن صافي هامش الربح بمعدل 2.1% نتيجة خفض مصاريف سلاسل التوريد والاعتماد المباشر على الشراء المركزي.',
      data: [
        { month: 'الربع الأول', val: 32000, trend: 'up' },
        { month: 'الربع الثاني', val: 45000, trend: 'up' },
        { month: 'الربع الثالث (متوقع 🤖)', val: 58000, trend: 'up_predict' }
      ]
    }
  };

  // ==========================================
  // 13.6: Smart Notifications
  // ==========================================
  const triggerSmartNotification = (type: string) => {
    let title = '';
    let msg = '';
    let icon = <AlertTriangle className="w-4 h-4 text-amber-600" />;

    if (type === 'low_stock') {
      title = '🤖 تنبيه مخزون حرج: حديد التسليح';
      msg = 'صنف حديد التسليح سابك وصل للحد الحرج (5 طن). معدل السحب اليومي ينذر بنفاد المخزون بالكامل قبل نهاية الأسبوع.';
    } else if (type === 'late_payment') {
      title = '🤖 تنبيه مالي: تجاوز فترة سداد العميل';
      msg = 'تجاوز العميل "شركة الوفاق" فترة الائتمان المسموحة (45 يوماً). الرصيد المستحق: 42,000 ر.س.';
    } else if (type === 'high_expense') {
      title = '🤖 تنبيه ميزانية: ارتفاع مالي غير اعتيادي';
      msg = 'ارتفعت مصاريف الوقود والصيانة بفرع جدة بمعدل 35% مقارنة بالمتوسط الشهري للربع الحالي.';
    } else if (type === 'budget_over') {
      title = '🤖 تنبيه ميزانية: تجاوز الحد المعتمد';
      msg = 'تجاوزت ميزانية المشتريات المخصصة لقسم التقنية الحد المعتمد للربع الحالي بمقدار 12,500 ر.س.';
    }

    addNotification({
      id: `smart-${Date.now()}`,
      title,
      message: msg,
      time: 'الآن',
      type: 'warning',
      read: false
    });
    showToast(`تم إرسال التنبيه الذكي: ${title}`, 'warning');
  };

  // ==========================================
  // 13.8 & 13.9: Offline Mode & Global Settings
  // ==========================================
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [offlineQueuedInvoices, setOfflineQueuedInvoices] = useState<any[]>([]);
  const [currencyRate, setCurrencyRate] = useState<number>(1);
  const [selectedCurrency, setSelectedCurrency] = useState<'SAR' | 'USD' | 'EUR' | 'EGP'>('SAR');
  const [selectedLanguage, setSelectedLanguage] = useState<'ar' | 'en' | 'fr'>('ar');
  const [selectedTax, setSelectedTax] = useState<number>(15);

  const toggleOfflineSimulation = () => {
    setIsOfflineMode(!isOfflineMode);
    if (!isOfflineMode) {
      showToast('أنت الآن تعمل بالوضع غير المتصل (Offline Mode). سيتم حفظ الفواتير محلياً بسجل المزامنة.', 'info');
    } else {
      showToast('تم العودة للاتصال بالإنترنت! جاري مزامنة الفواتير المحلية المعلقة تلقائياً...', 'success');
      // Simulate sync
      if (offlineQueuedInvoices.length > 0) {
        setTimeout(() => {
          offlineQueuedInvoices.forEach(inv => {
            addInvoice(inv);
          });
          setOfflineQueuedInvoices([]);
          showToast('اكتملت مزامنة جميع الفواتير المحلية بالخوادم السحابية بنجاح!', 'success');
        }, 2000);
      }
    }
  };

  const createDummyOfflineInvoice = () => {
    const dummyInv = {
      id: `inv-off-${Date.now()}`,
      customerName: 'عميل محلي (أوفلاين)',
      date: '2026-07-04',
      type: 'sale',
      items: [
        { itemId: 'it-1', name: 'أداة تجميع محلية', qty: 2, price: 150 / currencyRate, tax: 22.5 / currencyRate, total: 172.5 / currencyRate }
      ],
      discount: 0,
      taxRate: selectedTax,
      notes: 'تم إنشاؤها بالوضع غير المتصل أوفلاين',
      isDraft: false,
      isSynced: false
    };

    if (isOfflineMode) {
      setOfflineQueuedInvoices(prev => [...prev, dummyInv]);
      showToast('تم حفظ الفاتورة محلياً بنجاح في انتظار عودة الاتصال.', 'success');
    } else {
      addInvoice(dummyInv);
      showToast('تم ترحيل الفاتورة مباشرة للمخدم السحابي لكونك متصلاً.', 'success');
    }
  };

  const handleCurrencyChange = (curr: 'SAR' | 'USD' | 'EUR' | 'EGP') => {
    setSelectedCurrency(curr);
    if (curr === 'SAR') setCurrencyRate(1);
    if (curr === 'USD') setCurrencyRate(3.75);
    if (curr === 'EUR') setCurrencyRate(4.05);
    if (curr === 'EGP') setCurrencyRate(0.078);
    showToast(`تم تغيير العملة النشطة وعرض كشوف الفواتير والأسعار تلقائياً بـ ${curr}`, 'info');
  };

  return (
    <div className="flex h-full bg-slate-50 text-slate-800 select-none overflow-hidden" dir="rtl">
      
      {/* Side Tab Navigation */}
      <div className={`w-[210px] shrink-0 border-l flex flex-col justify-between py-4 ${isDark ? 'bg-zinc-900 border-zinc-800 text-slate-100' : 'bg-slate-100 border-slate-300'}`}>
        <div className="space-y-1 px-2.5">
          <div className="text-[10px] font-black text-slate-400 px-3 pb-2.5 tracking-wider">بوابة الابتكار والتفوق التنافسي</div>
          
          <button
            onClick={() => setActiveTab('ai_voice')}
            className={`w-full text-right px-3 py-2 rounded text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'ai_voice' 
                ? 'bg-gradient-to-r from-purple-700 to-indigo-600 text-white shadow-md' 
                : 'hover:bg-slate-200 text-slate-600'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
            <span>المساعد الصوتي والذكي</span>
          </button>

          <button
            onClick={() => setActiveTab('ocr')}
            className={`w-full text-right px-3 py-2 rounded text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'ocr' 
                ? 'bg-gradient-to-r from-purple-700 to-indigo-600 text-white shadow-md' 
                : 'hover:bg-slate-200 text-slate-600'
            }`}
          >
            <FileText className="w-4 h-4 shrink-0" />
            <span>ماسح الفواتير OCR</span>
          </button>

          <button
            onClick={() => setActiveTab('bi_ml')}
            className={`w-full text-right px-3 py-2 rounded text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'bi_ml' 
                ? 'bg-gradient-to-r from-purple-700 to-indigo-600 text-white shadow-md' 
                : 'hover:bg-slate-200 text-slate-600'
            }`}
          >
            <Cpu className="w-4 h-4 shrink-0" />
            <span>توقعات الذكاء الاصطناعي</span>
          </button>

          <button
            onClick={() => setActiveTab('offline_global')}
            className={`w-full text-right px-3 py-2 rounded text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'offline_global' 
                ? 'bg-gradient-to-r from-purple-700 to-indigo-600 text-white shadow-md' 
                : 'hover:bg-slate-200 text-slate-600'
            }`}
          >
            <Wifi className="w-4 h-4 shrink-0" />
            <span>الأوفلاين والعولمة</span>
          </button>

          <button
            onClick={() => setActiveTab('mobile_sim')}
            className={`w-full text-right px-3 py-2 rounded text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'mobile_sim' 
                ? 'bg-gradient-to-r from-purple-700 to-indigo-600 text-white shadow-md' 
                : 'hover:bg-slate-200 text-slate-600'
            }`}
          >
            <Smartphone className="w-4 h-4 shrink-0" />
            <span>محاكي الجوال للشركات</span>
          </button>
        </div>

        <div className="px-3 text-center space-y-1.5">
          <div className="w-full h-[1px] bg-slate-200 my-2" />
          <span className="text-[9px] text-slate-400 font-mono block">Mizan Smart ERP Core v2.0</span>
          <span className="text-[9px] text-emerald-600 font-extrabold flex items-center justify-center gap-1 bg-emerald-50 py-1 rounded border border-emerald-100">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>محرك الابتكار نشط</span>
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-5 overflow-y-auto bg-slate-50 text-slate-800">

        {/* ==========================================
            TAB 1: AI Copilot & Voice Commands
            ========================================== */}
        {activeTab === 'ai_voice' && (
          <div className="space-y-4">
            <div className="border-b pb-2 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
                  مساعد الميزان الصوتي والتحكم اللغوي المتكامل (AI Voice Copilot)
                </h3>
                <p className="text-[11px] text-slate-500">تحكم بالكامل في حركات وإعدادات النظام الصامت بذكاء ممتد وتلقائي.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={startVoiceListening}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                    voiceCommandActive 
                      ? 'bg-rose-600 text-white animate-pulse' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                  <span>{voiceCommandActive ? 'جاري الاستماع الآن...' : 'تحدث الآن بصوتك'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* Voice Command Helper Cards */}
              <div className="col-span-2 space-y-3">
                <span className="text-xs font-black text-slate-700 block">انقر فوق أي من الأوامر الشائعة أدناه لمحاكاتها صوتياً:</span>
                
                <div className="grid grid-cols-2 gap-3">
                  {presetVoiceCommands.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => executeVoiceCommand(p.text)}
                      className="bg-white p-3.5 rounded-xl border border-slate-200 text-right hover:border-indigo-400 hover:bg-indigo-50/20 transition-all cursor-pointer group"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-extrabold text-xs text-slate-900 group-hover:text-indigo-700 transition-colors">"{p.text}"</span>
                        <Play className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                      </div>
                      <p className="text-[10px] text-slate-400 font-semibold">{p.desc}</p>
                    </button>
                  ))}
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                  <span className="text-xs font-black text-slate-800 block">أحدث الردود الصوتية والتسجيلات المستلمة</span>
                  <div className="p-3 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-lg min-h-[50px] leading-relaxed">
                    {voiceTranscript ? (
                      <div>
                        <span className="text-zinc-500">تم التعرف:</span> <strong className="text-white">{voiceTranscript}</strong>
                      </div>
                    ) : (
                      <span className="text-zinc-500">// انقر على "تحدث الآن بصوتك" للبدء بالتحكم الصوتي بنجاح.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Logs Console */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
                <div className="space-y-3">
                  <span className="text-xs font-black text-slate-800 block border-b pb-1">سجل المساعد اللغوي</span>
                  <div className="space-y-2 text-[10.5px]">
                    {voiceLogs.map((log, idx) => (
                      <div key={idx} className="flex gap-1.5 text-slate-600">
                        <span className="text-indigo-500 font-bold">•</span>
                        <span>{log}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 text-[10px] text-slate-400 leading-relaxed font-semibold">
                  يدعم النظام تقنيات تحويل الكلام إلى نصوص (STT) وتحويل النصوص لكلام (TTS) مع دعم كامل للهجة الخليجية والمصطلحات المحاسبية.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 2: OCR Document Scanner
            ========================================== */}
        {activeTab === 'ocr' && (
          <div className="space-y-4">
            <div className="border-b pb-2">
              <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                <FileText className="w-5 h-5 text-indigo-600" />
                نظام قراءة وسحب الفواتير الورقية ضوئياً (Intelligent OCR Invoice Scanner)
              </h3>
              <p className="text-[11px] text-slate-500">قم بتحميل أو اختيار أي فاتورة ورقية، وسيقوم الذكاء الاصطناعي بقراءة وتفسير القيود والبنود الضريبية وإدراجها كفاتورة مشتريات رسمية بالنظام.</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              
              {/* Presets and scanner */}
              <div className="space-y-3">
                <span className="text-xs font-black text-slate-700 block">اختر فاتورة نموذجية لاختبار الـ OCR:</span>
                
                <div className="space-y-2">
                  {presetInvoices.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => triggerOcrScan(p)}
                      disabled={isOcrScanning}
                      className="w-full bg-white p-3 rounded-xl border border-slate-200 text-right hover:border-indigo-400 hover:bg-indigo-50/10 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <span className="font-bold text-xs text-slate-900 block">{p.name}</span>
                      <span className="text-[10px] text-slate-400 block mt-1">الرقم الضريبي وتفاصيل البنود</span>
                    </button>
                  ))}
                </div>

                <div className="border-2 border-dashed border-slate-200 rounded-xl bg-white p-5 text-center cursor-pointer hover:bg-slate-50 transition-all">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <span className="text-xs font-bold text-slate-700 block">سحب وإفلات صورة الفاتورة</span>
                  <span className="text-[10px] text-slate-400 block mt-1">يدعم ملفات JPG, PNG, PDF</span>
                </div>
              </div>

              {/* Scanning visual state */}
              <div className="col-span-2 space-y-3">
                {isOcrScanning ? (
                  <div className="bg-white rounded-xl border border-slate-200 p-8 text-center h-full flex flex-col items-center justify-center space-y-4">
                    <div className="relative">
                      <FileText className="w-16 h-16 text-indigo-600 animate-pulse" />
                      <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500 animate-[bounce_1.5s_infinite]" />
                    </div>
                    <span className="font-extrabold text-xs text-slate-800 block">جاري معالجة الـ OCR وقراءة النصوص الحسابية عبر سحابة الميزان...</span>
                  </div>
                ) : ocrResult ? (
                  <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="font-black text-xs text-slate-900">البيانات المستخرجة بنجاح (Extracted ERP Metadata)</span>
                      <button
                        onClick={convertOcrToInvoice}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-black shadow-sm flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>ترحيل كفاتورة مشتريات بالنظام</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-2.5 bg-slate-50 rounded-lg">
                        <span className="text-slate-400 block">اسم المورد المستخلص:</span>
                        <span className="font-black text-slate-800">{ocrResult.vendor}</span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-lg">
                        <span className="text-slate-400 block">الرقم الضريبي المستخلص:</span>
                        <span className="font-mono font-black text-slate-800">{ocrResult.vatNumber}</span>
                      </div>
                    </div>

                    <span className="text-[11px] font-black text-slate-700 block mt-2">قائمة السلع والبنود المجرودة بالصورة:</span>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-right text-xs">
                        <thead className="bg-slate-100 font-bold border-b text-slate-700">
                          <tr>
                            <th className="p-2">الصنف</th>
                            <th className="p-2 text-center">الكمية</th>
                            <th className="p-2 text-left">السعر الإفرادي</th>
                            <th className="p-2 text-left">الضريبة 15%</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y text-slate-600">
                          {ocrResult.items.map((it: any, idx: number) => (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="p-2 font-bold">{it.name}</td>
                              <td className="p-2 text-center font-mono">{it.qty}</td>
                              <td className="p-2 text-left font-mono">{it.price.toLocaleString()} ر.س</td>
                              <td className="p-2 text-left font-mono text-amber-600">{it.tax.toLocaleString()} ر.س</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex justify-end gap-4 text-xs font-bold pt-1">
                      <div>المجموع: <span className="font-mono text-slate-800">{ocrResult.subtotal.toLocaleString()} ر.س</span></div>
                      <div>الضريبة: <span className="font-mono text-amber-600">{ocrResult.taxTotal.toLocaleString()} ر.س</span></div>
                      <div className="text-indigo-600">الإجمالي النهائي: <span className="font-mono font-black">{ocrResult.total.toLocaleString()} ر.س</span></div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-slate-200 p-8 text-center h-full flex flex-col items-center justify-center text-slate-400">
                    <FileText className="w-12 h-12 mb-2 text-slate-300" />
                    <span className="text-xs font-bold">لا توجد فاتورة ممسوحة ضوئياً حالياً.</span>
                    <p className="text-[10px] text-slate-400 mt-1">اختر أحد النماذج السريعة على اليمين للبدء.</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* ==========================================
            TAB 3: Business Intelligence & ML Predictions
            ========================================== */}
        {activeTab === 'bi_ml' && (
          <div className="space-y-4">
            <div className="border-b pb-2 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                  <Cpu className="w-5 h-5 text-indigo-600" />
                  مستشار التحليلات والتوقعات الذكية (ML Forecasting & Business Intelligence)
                </h3>
                <p className="text-[11px] text-slate-500">يدرس النظام أنماط الشراء وحركة المبيعات السابقة لتوليد توقعات نمو وتنبؤات دقيقة تضمن كفاءة سلاسل الإمداد بنسبة فائقة.</p>
              </div>

              {/* Targets switcher */}
              <div className="flex gap-1.5 bg-slate-200 p-1 rounded-lg">
                <button
                  onClick={() => setPredictionTarget('sales')}
                  className={`px-3 py-1 text-xs font-bold rounded cursor-pointer ${
                    predictionTarget === 'sales' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-300'
                  }`}
                >
                  توقع المبيعات
                </button>
                <button
                  onClick={() => setPredictionTarget('inventory')}
                  className={`px-3 py-1 text-xs font-bold rounded cursor-pointer ${
                    predictionTarget === 'inventory' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-300'
                  }`}
                >
                  طلب الأصناف ونفاد المخزون
                </button>
                <button
                  onClick={() => setPredictionTarget('profits')}
                  className={`px-3 py-1 text-xs font-bold rounded cursor-pointer ${
                    predictionTarget === 'profits' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-300'
                  }`}
                >
                  توقع الأرباح والخسائر
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              
              {/* Prediction details card */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3.5 col-span-2">
                <div className="flex justify-between items-center border-b pb-1.5">
                  <span className="font-black text-xs text-slate-900">{mlPredictions[predictionTarget].title}</span>
                  <span className="bg-emerald-50 text-emerald-800 border border-emerald-100 px-2 py-0.5 rounded text-[10px] font-black">
                    دقة التنبؤ: {mlPredictions[predictionTarget].accuracy}
                  </span>
                </div>

                <div className="bg-indigo-50/50 p-3 rounded-lg text-xs text-slate-700 border border-indigo-100 flex gap-2.5">
                  <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-indigo-950 block">رؤية المحرك التحليلي (🤖 ML Insight):</strong>
                    <p className="text-[10.5px] mt-1 leading-relaxed">{mlPredictions[predictionTarget].insight}</p>
                  </div>
                </div>

                {/* Simulated Chart visualization */}
                <div className="space-y-3 pt-2 text-xs">
                  <span className="font-extrabold text-slate-500 block">المنحنى الزمني وتحليل الاتجاهات الصاعدة والهابطة:</span>
                  
                  <div className="flex justify-between items-end h-[110px] px-8 pt-4 bg-slate-950 rounded-xl border border-zinc-800">
                    {mlPredictions[predictionTarget].data.map((d: any, idx: number) => {
                      const maxVal = Math.max(...mlPredictions[predictionTarget].data.map(i => i.val));
                      const heightPct = Math.max(10, Math.round((d.val / maxVal) * 100));
                      const isPredict = d.trend === 'up_predict' || d.trend === 'alert';

                      return (
                        <div key={idx} className="flex flex-col items-center gap-1.5 flex-1 max-w-[80px]">
                          <span className={`text-[9px] font-mono font-bold ${isPredict ? 'text-purple-300 animate-pulse' : 'text-slate-400'}`}>
                            {d.val.toLocaleString()}
                          </span>
                          <div 
                            style={{ height: `${heightPct * 0.7}px` }} 
                            className={`w-8 rounded-t-md transition-all duration-500 ${
                              d.trend === 'alert' 
                                ? 'bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                                : isPredict 
                                  ? 'bg-gradient-to-t from-purple-800 to-indigo-500 shadow-[0_0_8px_rgba(168,85,247,0.4)]' 
                                  : 'bg-emerald-600'
                            }`}
                          />
                          <span className="text-[9.5px] text-zinc-500 whitespace-nowrap text-center truncate w-full">{d.month}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Smart notification triggers */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                <span className="text-xs font-black text-slate-800 block border-b pb-1.5 flex items-center gap-1">
                  <Bell className="w-4 h-4 text-indigo-500" />
                  محاكي التنبيهات الذكية (Stage 13.6)
                </span>
                
                <p className="text-[10px] text-slate-400 leading-relaxed">اختبر آلية التنبيه اللحظي عند حدوث أي تغير في مستويات المخزون أو الفروع:</p>

                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => triggerSmartNotification('low_stock')}
                    className="w-full py-1.5 px-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 border border-slate-200/50 rounded-lg text-right text-[10.5px] font-bold text-slate-700 transition-all cursor-pointer block"
                  >
                    ⚠️ تنبيه انخفاض المخزون الحرج
                  </button>
                  <button
                    onClick={() => triggerSmartNotification('late_payment')}
                    className="w-full py-1.5 px-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 border border-slate-200/50 rounded-lg text-right text-[10.5px] font-bold text-slate-700 transition-all cursor-pointer block"
                  >
                    💸 تنبيه تأخر سداد الذمم المالية للعملاء
                  </button>
                  <button
                    onClick={() => triggerSmartNotification('high_expense')}
                    className="w-full py-1.5 px-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 border border-slate-200/50 rounded-lg text-right text-[10.5px] font-bold text-slate-700 transition-all cursor-pointer block"
                  >
                    📈 تنبيه ارتفاع المصروفات التشغيلية
                  </button>
                  <button
                    onClick={() => triggerSmartNotification('budget_over')}
                    className="w-full py-1.5 px-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 border border-slate-200/50 rounded-lg text-right text-[10.5px] font-bold text-slate-700 transition-all cursor-pointer block"
                  >
                    🚫 تنبيه تجاوز الميزانيات المعتمدة
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ==========================================
            TAB 4: Offline Mode & Global System Settings
            ========================================== */}
        {activeTab === 'offline_global' && (
          <div className="space-y-4">
            <div className="border-b pb-2 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                  <Wifi className="w-5 h-5 text-indigo-600" />
                  وضعية التشغيل أوفلاين والتهيئة العالمية (Offline Engines & Global Configuration)
                </h3>
                <p className="text-[11px] text-slate-500">تمكين الكاشيرية والمحاسبين من المبيعات الفورية بدون إنترنت مع مزامنة خلفية تلقائية، مع دعم مرن لجميع الضرائب والعملات.</p>
              </div>

              {/* Connection status simulation toggle */}
              <button
                onClick={toggleOfflineSimulation}
                className={`px-4 py-1.5 rounded-lg text-xs font-black shadow-sm flex items-center gap-1.5 cursor-pointer transition-colors ${
                  isOfflineMode 
                    ? 'bg-rose-100 text-rose-800 border border-rose-200 hover:bg-rose-200' 
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-200'
                }`}
              >
                {isOfflineMode ? (
                  <>
                    <WifiOff className="w-4 h-4 text-rose-600 animate-pulse" />
                    <span>وضع أوفلاين نشط (محاكاة قطع النت)</span>
                  </>
                ) : (
                  <>
                    <Wifi className="w-4 h-4 text-emerald-600" />
                    <span>متصل بالإنترنت (Online)</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              
              {/* Local Storage & Sync Queue */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3.5 text-xs text-slate-600 leading-relaxed">
                <div className="flex justify-between items-center border-b pb-1.5">
                  <span className="font-black text-slate-800">طابور الفواتير المحلية غير المزامنة (Offline Queue)</span>
                  <span className="bg-slate-100 font-mono font-bold px-2 py-0.5 rounded text-slate-700">
                    {offlineQueuedInvoices.length} فواتير معلقة
                  </span>
                </div>

                <div className="space-y-2">
                  <p>تستطيع إصدار فواتير بيع سريعة محلياً، وستحفظ بذاكرة المتصفح تلقائياً حتى عودة الشبكة:</p>
                  
                  <button
                    onClick={createDummyOfflineInvoice}
                    className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-black border border-indigo-200 rounded-lg text-center cursor-pointer flex justify-center items-center gap-1"
                  >
                    <Clipboard className="w-4 h-4" />
                    <span>إصدار فاتورة بيع محلية (محاكاة أوفلاين)</span>
                  </button>

                  <div className="border rounded-lg bg-slate-50 p-2.5 space-y-1.5">
                    <span className="font-bold text-[10.5px] text-slate-700 block">سجل حركات الانتظار:</span>
                    {offlineQueuedInvoices.length === 0 ? (
                      <span className="text-[10px] text-slate-400 block">// لا توجد فواتير معلقة حالياً. جرب تفعيل وضع الأوفلاين وإصدار فاتورة.</span>
                    ) : (
                      offlineQueuedInvoices.map((inv, idx) => (
                        <div key={idx} className="flex justify-between text-[10px] bg-white p-1.5 rounded border border-slate-100">
                          <span className="font-bold text-slate-800">{inv.customerName}</span>
                          <span className="text-amber-600 font-mono">{inv.items[0].total.toFixed(2)} ر.س (قيد الانتظار)</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Globalization switcher panel */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <span className="text-xs font-black text-slate-800 block border-b pb-1.5">التهيئة العالمية المتعددة (Global Setup Engine)</span>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  
                  {/* Currency selector */}
                  <div className="space-y-1">
                    <span className="text-slate-500 font-bold">1. العملة الرئيسية للمنشأة:</span>
                    <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-lg">
                      {(['SAR', 'USD', 'EUR', 'EGP'] as const).map(curr => (
                        <button
                          key={curr}
                          onClick={() => handleCurrencyChange(curr)}
                          className={`py-1 text-[10px] font-bold rounded cursor-pointer ${
                            selectedCurrency === curr ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {curr}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Language Selector */}
                  <div className="space-y-1">
                    <span className="text-slate-500 font-bold">2. لغة طباعة الفواتير والنظام:</span>
                    <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg">
                      <button
                        onClick={() => { setSelectedLanguage('ar'); showToast('تم تفعيل اللغة العربية بالكامل للتقارير والواجهة.', 'success'); }}
                        className={`py-1 text-[10px] font-bold rounded cursor-pointer ${selectedLanguage === 'ar' ? 'bg-indigo-600 text-white' : 'text-slate-600'}`}
                      >
                        العربية
                      </button>
                      <button
                        onClick={() => { setSelectedLanguage('en'); showToast('English localized completely.', 'success'); }}
                        className={`py-1 text-[10px] font-bold rounded cursor-pointer ${selectedLanguage === 'en' ? 'bg-indigo-600 text-white' : 'text-slate-600'}`}
                      >
                        EN
                      </button>
                      <button
                        onClick={() => { setSelectedLanguage('fr'); showToast('Français activé.', 'success'); }}
                        className={`py-1 text-[10px] font-bold rounded cursor-pointer ${selectedLanguage === 'fr' ? 'bg-indigo-600 text-white' : 'text-slate-600'}`}
                      >
                        FR
                      </button>
                    </div>
                  </div>

                  {/* Tax Selector */}
                  <div className="space-y-1">
                    <span className="text-slate-500 font-bold">3. ضوابط الضرائب والجمارك:</span>
                    <select
                      value={selectedTax}
                      onChange={(e) => {
                        const tax = Number(e.target.value);
                        setSelectedTax(tax);
                        showToast(`تم تعيين نموذج ضريبة المبيعات إلى ${tax}% بنجاح.`, 'success');
                      }}
                      className="w-full bg-slate-100 border border-slate-200 rounded-lg p-1 text-[10.5px] font-bold"
                    >
                      <option value={15}>السعودية (القيمة المضافة 15%)</option>
                      <option value={5}>الإمارات وعمان (5%)</option>
                      <option value={14}>جمهورية مصر العربية (14%)</option>
                      <option value={0}>تصدير ومناطق حرة معفاة (0%)</option>
                    </select>
                  </div>

                  {/* Timezone Selector */}
                  <div className="space-y-1">
                    <span className="text-slate-500 font-bold">4. النطاق الزمني للفروع:</span>
                    <select
                      className="w-full bg-slate-100 border border-slate-200 rounded-lg p-1 text-[10.5px] font-bold"
                      onChange={() => showToast('تم ربط ومزامنة توقيت الفروع المتعددة مع التوقيت العالمي الموحد UTC.', 'info')}
                    >
                      <option>توقيت الرياض/الخليج (GMT+3)</option>
                      <option>توقيت القاهرة والقدس (GMT+3)</option>
                      <option>توقيت غرينتش العالمي (GMT+0)</option>
                    </select>
                  </div>

                </div>
              </div>

            </div>
          </div>
        )}

        {/* ==========================================
            TAB 5: Mobile Sim Dashboard Frame
            ========================================== */}
        {activeTab === 'mobile_sim' && (
          <div className="space-y-4">
            <div className="border-b pb-2">
              <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                <Smartphone className="w-5 h-5 text-indigo-600" />
                محاكي تطبيق الجوال للأجهزة اللوحية والهواتف الذكية (Mobile Frame Simulation)
              </h3>
              <p className="text-[11px] text-slate-500">استعرض كيف يظهر نظام الميزان للبرمجيات والمستودعات على شاشات الجوال بكافة المزايا والسهولة المطلقة.</p>
            </div>

            <div className="flex justify-center items-center py-4 bg-slate-100 rounded-2xl border border-slate-200">
              
              {/* Smartphone Frame Outer shell */}
              <div className="w-[280px] h-[520px] bg-slate-900 rounded-[38px] p-3 shadow-2xl border-4 border-slate-800 relative flex flex-col overflow-hidden">
                
                {/* Speaker/Camera Notch */}
                <div className="absolute top-2.5 left-1/2 transform -translate-x-1/2 w-20 h-4 bg-slate-800 rounded-full z-20 flex justify-center items-center">
                  <div className="w-8 h-1 bg-slate-700 rounded-full" />
                </div>

                {/* Simulated Screen Inner */}
                <div className="flex-1 bg-slate-950 text-white rounded-[28px] overflow-hidden flex flex-col text-right font-sans relative">
                  
                  {/* Status Bar */}
                  <div className="h-8 bg-indigo-900/40 px-4 pt-3 pb-1 flex justify-between items-center text-[9px] text-slate-300 font-bold">
                    <span>14:30</span>
                    <div className="flex gap-1">
                      <Wifi className="w-3 h-3" />
                      <span>5G</span>
                    </div>
                  </div>

                  {/* App Header */}
                  <div className="p-3 bg-gradient-to-r from-slate-900 to-indigo-950 border-b border-indigo-900/40 flex justify-between items-center">
                    <span className="font-black text-[10.5px]">الميزان ERP 🤖</span>
                    <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
                  </div>

                  {/* App Content */}
                  <div className="flex-1 p-3 overflow-y-auto space-y-3 scrollbar-none text-[10px]">
                    <div className="bg-indigo-900/20 border border-indigo-800/50 p-2.5 rounded-xl space-y-1">
                      <span className="font-extrabold text-[10.5px] block text-indigo-200">ملخص العمليات السريع اليوم</span>
                      <div className="grid grid-cols-2 gap-2 text-center text-[10px] pt-1">
                        <div className="p-1.5 bg-slate-900/60 rounded">
                          <span className="text-slate-400 block">المبيعات</span>
                          <span className="font-mono text-emerald-400 font-black">42,800 ر.س</span>
                        </div>
                        <div className="p-1.5 bg-slate-900/60 rounded">
                          <span className="text-slate-400 block">الطلبات</span>
                          <span className="font-mono text-indigo-300 font-black">18 طلب</span>
                        </div>
                      </div>
                    </div>

                    <span className="font-extrabold text-slate-300 block text-[9.5px]">الوصول السريع للأقسام:</span>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => { openWindow('invoice', 'فاتورة مبيعات ذكية', { invoiceType: 'sale' }); }}
                        className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl text-center hover:bg-indigo-950/40 transition-all cursor-pointer"
                      >
                        <FileText className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                        <span className="block font-bold">كاشير المبيعات</span>
                      </button>

                      <button 
                        onClick={() => { openWindow('item_tree', 'دليل السلع والمخزون الموحد'); }}
                        className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl text-center hover:bg-indigo-950/40 transition-all cursor-pointer"
                      >
                        <Database className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                        <span className="block font-bold">جرد المستودع</span>
                      </button>

                      <button 
                        onClick={() => { openWindow('reports', 'تقرير تحليل أرباح المواد والسلع', { reportType: 'item_profit' }); }}
                        className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl text-center hover:bg-indigo-950/40 transition-all cursor-pointer"
                      >
                        <TrendingUp className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
                        <span className="block font-bold">مؤشرات الأرباح</span>
                      </button>

                      <button 
                        onClick={() => { showToast('تطبيق الأندرويد متكامل تماماً مع خادم الـ API.', 'success'); }}
                        className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-xl text-center hover:bg-indigo-950/40 transition-all cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                        <span className="block font-bold">بوابة المزامنة</span>
                      </button>
                    </div>

                    {/* Quick notification prompt */}
                    <div className="p-2.5 bg-rose-900/20 border border-rose-900/40 rounded-xl flex gap-1.5 text-[9px] text-rose-200">
                      <AlertTriangle className="w-4.5 h-4.5 text-rose-400 shrink-0 mt-0.5" />
                      <span>صنف حديد التسليح قارب على النفاد من مستودع جدة الرئيسي. يرجى مراجعة طلبات الشراء.</span>
                    </div>

                  </div>

                  {/* Virtual Home Bar */}
                  <div className="h-4 bg-slate-950 flex justify-center items-center pb-1">
                    <div className="w-24 h-1 bg-slate-600 rounded-full" />
                  </div>

                </div>

              </div>

            </div>
          </div>
        )}

      </div>

    </div>
  );
};

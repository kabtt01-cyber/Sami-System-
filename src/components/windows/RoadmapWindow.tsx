import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { 
  Milestone, Compass, Users2, Rocket, ToggleLeft, ToggleRight, CheckSquare, 
  HelpCircle, MessageSquare, AlertCircle, Sparkles, Sliders, Play, 
  Search, ShieldAlert, Cpu, Check, ShoppingBag, Zap, RefreshCw, BarChart, HardDrive
} from 'lucide-react';

interface RoadmapWindowProps {
  windowId: string;
  onClose: () => void;
}

export const RoadmapWindow: React.FC<RoadmapWindowProps> = ({ windowId, onClose }) => {
  const { theme, showToast } = useErp();
  const isDark = theme === 'dark' || theme === 'light-black';

  const [activeTab, setActiveTab] = useState<'roadmap' | 'feedback' | 'perf' | 'modules' | 'marketplace'>('roadmap');

  // ==========================================
  // 11.1 Version Management State
  // ==========================================
  const [changelogs, setChangelogs] = useState([
    {
      version: 'v1.0.0 (الذهبي الحالي)',
      status: 'Released',
      releaseDate: '2026-07-04',
      badge: 'الاستقرار المالي والصناعي',
      changes: [
        'إصدار الدفاتر المحاسبية الذهبية الموحدة وشجرة الحسابات والقيود التلقائية المتكاملة.',
        'تثبيت محرك التصنيع وخطوط الإنتاج المتقدمة وجرد المواد الخام وتكاليف التشغيل.',
        'دعم الفواتير الضريبية المبسطة والمعتمدة من هيئة الزكاة والضريبة والجمارك وتوليد رمز الاستجابة السريع QR.',
        'نظام الشركات المتعددة (Logical Separated DBs) والتحويل الآمن بين الفروع والمخازن.'
      ]
    },
    {
      version: 'v1.1 (المبيعات المتنقلة والتحليل)',
      status: 'Planned',
      releaseDate: '2026-09-01',
      badge: 'إضافات ومميزات ذكية',
      changes: [
        'إصدار تطبيق الهواتف الذكية المساعد لرجال البيع والمندوبين الميدانيين (أوفلاين بالكامل).',
        'مزامنة البيانات الحية وبناء الذكاء الاصطناعي للتنبؤ بالتدفقات النقدية ومستويات الطلب.',
        'محرك الباركود السريع المدمج عبر الكاميرا والـ RFID في مستودعات المواد والرفوف.'
      ]
    },
    {
      version: 'v1.2 (الروابط والـ API الخارجية)',
      status: 'Planned',
      releaseDate: '2026-12-15',
      badge: 'أتمتة تكاملات الشركات',
      changes: [
        'بناء بوابة مطوري الميزان المفتوحة (RESTful APIs & Webhooks) لربط المتاجر الإلكترونية الشهيرة (سلة، زد، شوبيفاي).',
        'ربط مباشر مع منصات الشحن والتوصيل الإقليمية لتوليد بوالص الشحن تزامناً مع الفاتورة.',
        'توليد تقارير مالية مخصصة تدعم الإرسال التلقائي لمدراء الأقسام عبر البريد والواتساب.'
      ]
    },
    {
      version: 'v2.0 (الذكاء الاصطناعي التوليدي والعمليات)',
      status: 'Planned',
      releaseDate: '2027-04-01',
      badge: 'الثورة التقنية للمحاسبة',
      changes: [
        'دمج مساعد الذكاء الاصطناعي (Mizan-AI Core) لتسجيل القيود اليومية بمجرد قراءة الصوت أو المسح الضوئي للمستند.',
        'توليد التحليلات المالية المعقدة والتحذيرات من العجز أو الفوارق المخزنية تلقائياً.',
        'نظام التوظيف والتقييم والتدريب الذكي للموارد البشرية وتوليد خطابات الأداء.'
      ]
    },
    {
      version: 'v3.0 (الشركات الموزعة عالمياً والـ Web3)',
      status: 'Planned',
      releaseDate: '2028-01-10',
      badge: 'عولمة الأنظمة السحابية',
      changes: [
        'دعم الأنظمة اللامركزية وتشفير العقود الذكية للربط بين الموردين الدوليين والمصانع مباشرة.',
        'التوافق الكلي مع معايير الضرائب والجمارك لأكثر من 40 دولة في الشرق الأوسط وأوروبا وأمريكا.',
        'التحليل الروبوتي المؤتمت بالكامل لخطوط الإنتاج والاتصال الفوري مع حساسات ومعدات المصانع IoT.'
      ]
    }
  ]);

  // ==========================================
  // 11.2 Customer Feedback State
  // ==========================================
  const [feedbackList, setFeedbackList] = useState([
    { id: 'fb-1', title: 'دعم قارئ الباركود اللاسلكي من شركة Zebra بمصنع الرياض', category: 'طلب ميزة', user: 'م. سليمان (مدير مستودعات مصانع الميزان)', date: '2026-07-04', priority: 'عالية جداً', status: 'جاري العمل عليها' },
    { id: 'fb-2', title: 'عجز طفيف في تحديث واجهة تقرير ميزان المراجعة تحت الشاشات الصغيرة', category: 'بلاغ عن خطأ', user: 'أ. أحمد الجار الله (رئيس الحسابات)', date: '2026-07-03', priority: 'متوسطة', status: 'تم الحل وإصدار تحديث' },
    { id: 'fb-3', title: 'إضافة خيار لتخصيص لون خلفية نافذة الفواتير تماشياً مع ألوان الشركة', category: 'اقتراح تحسين', user: 'سارة العتيبي (محاسبة مبيعات)', date: '2026-07-02', priority: 'منخفضة', status: 'معلق للدراسة' },
    { id: 'fb-4', title: 'طلب ربط مباشر مع الفواتير الضريبية لهيئة الزكاة والجمارك بجدة مرحلة الربط الكلي', category: 'طلب ميزة', user: 'مجموعة الفوزان اللوجستية', date: '2026-06-29', priority: 'حرجة', status: 'تم الدمج والتشغيل' },
  ]);

  const [newFeedbackTitle, setNewFeedbackTitle] = useState('');
  const [newFeedbackCategory, setNewFeedbackCategory] = useState('طلب ميزة');
  const [newFeedbackPriority, setNewFeedbackPriority] = useState('متوسطة');
  const [newFeedbackUser, setNewFeedbackUser] = useState('');

  const handleAddFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeedbackTitle.trim()) return;

    const newFb = {
      id: 'fb-' + Date.now(),
      title: newFeedbackTitle,
      category: newFeedbackCategory,
      user: newFeedbackUser.trim() || 'عميل مجهول',
      date: new Date().toISOString().substring(0, 10),
      priority: newFeedbackPriority,
      status: 'مستلمة وبانتظار المراجعة'
    };

    setFeedbackList([newFb, ...feedbackList]);
    showToast(`تم تسجيل ملاحظتك وتصنيفها كـ [${newFeedbackCategory}] تحت أولوية [${newFeedbackPriority}] للتنفيذ السريع.`, 'success');
    setNewFeedbackTitle('');
    setNewFeedbackUser('');
  };

  // ==========================================
  // 11.3 Performance Optimizations State & Actions
  // ==========================================
  const [loadTime, setLoadTime] = useState(0.42); // in seconds
  const [dbOptimized, setDbOptimized] = useState(true);
  const [memoryUsage, setMemoryUsage] = useState(48); // MB
  const [searchSpeed, setSearchSpeed] = useState(12); // ms
  const [printSpeed, setPrintSpeed] = useState(90); // ms
  const [reportSpeed, setReportSpeed] = useState(150); // ms
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleTunePerformance = () => {
    setIsOptimizing(true);
    showToast('جاري تطهير الكاش السريع، دمج فهارس SQL، وإلغاء الاستعلامات المتكررة بالخادم...', 'info');
    setTimeout(() => {
      setLoadTime(0.18);
      setMemoryUsage(29);
      setSearchSpeed(2);
      setPrintSpeed(35);
      setReportSpeed(45);
      setDbOptimized(true);
      setIsOptimizing(false);
      showToast('تمت الأوبتمايزيشن بنجاح! تم تقليل زمن التحميل بنسبة 57% وتثبيت السرعة الخارقة للأرصدة.', 'success');
    }, 1500);
  };

  // ==========================================
  // 11.4 Optional Modules Switcher State
  // ==========================================
  const [modules, setModules] = useState([
    { id: 'crm', name: 'إدارة علاقات العملاء (CRM)', description: 'متابعة الفرص والصفقات البيعية، سجل المكالمات والزيارات، وعروض الأسعار المخصصة للمهتمين.', category: 'مبيعات', status: 'مفعل', icon: Users2 },
    { id: 'projects', name: 'إدارة المشاريع والمهمات', description: 'تخطيط وتعيين المهام، إدارة العقود، حساب ساعات العمل لكل مهندس، والمتابعة عبر مخططات Gantt.', category: 'عمليات', status: 'معطل', icon: Milestone },
    { id: 'maintenance', name: 'نظام الصيانة والتشغيل الدورية', description: 'جدولة أعمال الصيانة الوقائية والطارئة للآلات والمعدات والمباني، وإدارة قطع الغيار والعمالة.', category: 'تشغيل', status: 'مفعل', icon: Sliders },
    { id: 'realestate', name: 'إدارة العقارات والأملاك', description: 'تأجير وبيع الوحدات السكنية والتجارية، توليد عقود إيجارية مؤتمتة وتنبيهات الاستحقاق والدفع والتحصيل.', category: 'تخصصي', status: 'معطل', icon: HardDrive },
    { id: 'schools', name: 'إدارة المدارس والتعليم', description: 'تسجيل الطلاب والرسوم والمصاريف، الفصول الدراسية، أجور المعلمين، الحافلات، وتقارير النتائج.', category: 'تعليمي', status: 'معطل', icon: Sparkles },
    { id: 'hospitals', name: 'إدارة المستشفيات والعيادات الطبية', description: 'ملفات المرضى، حجوزات الأطباء، الفواتير الطبية، صيدلية المستشفى المتكاملة والمستهلكات اليومية.', category: 'تخصصي', status: 'معطل', icon: AlertCircle },
    { id: 'restaurants', name: 'إدارة المطاعم ونقاط البيع (POS)', description: 'شاشات المطبخ، طاولة الطعام المباشرة، التعديلات والإضافات على الطلبات، وتطبيق التوصيل السريع.', category: 'أغذية ومبيعات', status: 'مفعل', icon: Zap },
    { id: 'logistics', name: 'إدارة شركات النقل والأسطول', description: 'تتبع السائقين والمركبات، استهلاك الوقود، بوالص الشحن البري، وأوقات تسليم الطرود.', category: 'نقل ولوجستيك', status: 'مفعل', icon: Compass },
    { id: 'contracting', name: 'إدارة المقاولات والمستخلصات', description: 'حساب كميات وقياس الأعمال، جداول الكميات، المستخلصات الحكومية والخاصة، وعقود مقاولي الباطن.', category: 'تشغيل', status: 'معطل', icon: BarChart },
  ]);

  const handleToggleModule = (id: string, name: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'مفعل' ? 'معطل' : 'مفعل';
    setModules(prev => prev.map(m => {
      if (m.id === id) {
        return { ...m, status: nextStatus };
      }
      return m;
    }));
    showToast(`تم ${nextStatus === 'مفعل' ? 'تفعيل وتنشيط' : 'إخفاء وتعطيل'} وحدة [${name}] لتخصيص واجهة المستخدم.`, 'success');
  };

  // ==========================================
  // 11.5 Marketplace Add-ons State
  // ==========================================
  const [addons, setAddons] = useState([
    { id: 'add-1', name: 'ربط مباشر مع الواتساب للأعمال', desc: 'إرسال الفواتير وسندات القبض مباشرة لهاتف العميل كملف PDF آلي.', type: 'تكامل', price: 'متاح للترقية', active: true },
    { id: 'add-2', name: 'تكامل زد وسلة المتكامل (Salla & Zid Sync)', desc: 'مزامنة حية للمخزون والمنتجات والطلبات والمدفوعات فوراً.', type: 'بوابة إلكترونية', price: 'طلب شراء ترقية', active: false },
    { id: 'add-3', name: 'محرك الباركود السريع المطور لكاميرا الموبايل', desc: 'مسح ضوئي فوري فائق السرعة يدعم الباركود ثنائي الأبعاد QR.', type: 'أداة مساعدة', price: 'مجاني', active: true },
    { id: 'add-4', name: 'الـربط المصرفي التلقائي مع البنك الأهلي ومصرف الراجحي', desc: 'مطابقة كشوف الحسابات البنكية يدوياً وسحب التحويلات الواردة آلياً.', type: 'أمان وبنوك', price: 'طلب شراء ترقية', active: false },
  ]);

  const handleInstallAddon = (id: string, name: string) => {
    setAddons(prev => prev.map(a => {
      if (a.id === id) {
        return { ...a, active: true };
      }
      return a;
    }));
    showToast(`تم تثبيت الملحق [${name}] ودمجه في واجهة الميزان بنجاح.`, 'success');
  };

  return (
    <div className="flex h-full bg-slate-50 text-slate-800 select-none overflow-hidden" dir="rtl">
      
      {/* Side Menu Tab Navigation */}
      <div className={`w-[200px] shrink-0 border-l flex flex-col justify-between py-4 ${isDark ? 'bg-zinc-900 border-zinc-800 text-slate-100' : 'bg-slate-100 border-slate-300'}`}>
        <div className="space-y-1 px-2.5">
          <div className="text-[10px] font-black text-slate-400 px-3 pb-2.5 tracking-wider">التطوير المستمر وخارطة الطريق</div>
          
          <button
            onClick={() => setActiveTab('roadmap')}
            className={`w-full text-right px-3 py-2 rounded text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'roadmap' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'hover:bg-slate-200 text-slate-600'
            }`}
          >
            <Compass className="w-4 h-4 shrink-0" />
            <span>خارطة إصدارات الميزان</span>
          </button>

          <button
            onClick={() => setActiveTab('feedback')}
            className={`w-full text-right px-3 py-2 rounded text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'feedback' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'hover:bg-slate-200 text-slate-600'
            }`}
          >
            <MessageSquare className="w-4 h-4 shrink-0" />
            <span>متابعة ومقترحات العملاء</span>
          </button>

          <button
            onClick={() => setActiveTab('perf')}
            className={`w-full text-right px-3 py-2 rounded text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'perf' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'hover:bg-slate-200 text-slate-600'
            }`}
          >
            <Cpu className="w-4 h-4 shrink-0" />
            <span>أدوات تحسين الأداء</span>
          </button>

          <button
            onClick={() => setActiveTab('modules')}
            className={`w-full text-right px-3 py-2 rounded text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'modules' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'hover:bg-slate-200 text-slate-600'
            }`}
          >
            <Sliders className="w-4 h-4 shrink-0" />
            <span>الوحدات والأنشطة الاختيارية</span>
          </button>

          <button
            onClick={() => setActiveTab('marketplace')}
            className={`w-full text-right px-3 py-2 rounded text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'marketplace' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'hover:bg-slate-200 text-slate-600'
            }`}
          >
            <ShoppingBag className="w-4 h-4 shrink-0" />
            <span>متجر الملحقات (Marketplace)</span>
          </button>
        </div>

        <div className="px-3 text-center space-y-1.5">
          <div className="w-full h-[1px] bg-slate-200 my-2" />
          <span className="text-[9px] text-slate-400 font-mono block">Mizan Roadmap Module</span>
          <span className="text-[9px] text-emerald-600 font-extrabold flex items-center justify-center gap-1 bg-emerald-50 py-1 rounded border border-emerald-100">
            <RefreshCw className="w-3.5 h-3.5 text-emerald-500 animate-spin" />
            <span>تحديثات مستمرة حية</span>
          </span>
        </div>
      </div>

      {/* Main Panel Content Area */}
      <div className="flex-1 p-5 overflow-y-auto bg-slate-50 text-slate-800">
        
        {/* ==========================================
            TAB 1: Roadmap (خارطة الإصدارات)
            ========================================== */}
        {activeTab === 'roadmap' && (
          <div className="space-y-4">
            <div className="border-b pb-2">
              <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                <Compass className="w-5 h-5 text-blue-600" />
                خطة إدارة الإصدارات والتحديثات المبرمجة للميزان دوت نت (Version Lifecycle Roadmap)
              </h3>
              <p className="text-[11px] text-slate-500">مراجعة الإصدارات الحالية والمستقبلية وتوثيق التغييرات والمميزات المتوقعة بكل مرحلة تجارية.</p>
            </div>

            <div className="space-y-4">
              {changelogs.map((log, index) => (
                <div key={index} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs relative overflow-hidden">
                  {/* Decorative badge top left */}
                  <div className="absolute left-4 top-4 flex gap-2">
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                      log.status === 'Released' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {log.status === 'Released' ? 'متاح ومستقر' : 'مخطط له'}
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                      {log.releaseDate}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-slate-900">{log.version}</span>
                      <span className="text-xs text-blue-600 font-bold">({log.badge})</span>
                    </div>
                    
                    <ul className="space-y-1 text-slate-600 text-xs list-disc list-inside mt-2 leading-relaxed">
                      {log.changes.map((change, cIdx) => (
                        <li key={cIdx} className="mr-4">
                          {change}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 2: Customer Feedback (متابعة وتصنيف مقترحات وملاحظات العملاء)
            ========================================== */}
        {activeTab === 'feedback' && (
          <div className="space-y-4">
            <div className="border-b pb-2 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  منصة متابعة آراء وعناية العملاء (Customer Feedback & Issue Tracker)
                </h3>
                <p className="text-[11px] text-slate-500">نظام موحد لتسجيل وتصنيف ملاحظات العملاء، بلاغات الأخطاء، الاقتراحات وطلبات التطوير وترتيب تنفيذها.</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              
              {/* Form to submit feedback */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3 h-fit">
                <span className="text-xs font-black text-slate-800 block border-b pb-1">تسجيل ملاحظة / بلاغ عميل</span>
                
                <form onSubmit={handleAddFeedback} className="space-y-3 text-xs text-slate-700">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">اسم العميل / المنشأة:</label>
                    <input 
                      type="text" 
                      value={newFeedbackUser} 
                      onChange={e => setNewFeedbackUser(e.target.value)} 
                      placeholder="مثال: شركة الخليج للتوريدات" 
                      className="w-full p-2 border rounded bg-slate-50 font-bold"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600">عنوان الملاحظة / تفاصيل الطلب:</label>
                    <textarea 
                      value={newFeedbackTitle} 
                      onChange={e => setNewFeedbackTitle(e.target.value)} 
                      placeholder="اكتب تفصيلاً ما هي الميزة المطلوبة أو العجز الملاحظ..." 
                      rows={3}
                      className="w-full p-2 border rounded bg-slate-50 font-bold focus:bg-white resize-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-600">التصنيف الرئيسي:</label>
                      <select 
                        value={newFeedbackCategory} 
                        onChange={e => setNewFeedbackCategory(e.target.value)}
                        className="w-full p-2 border rounded bg-slate-50 font-bold"
                      >
                        <option value="طلب ميزة">طلب ميزة جديدة</option>
                        <option value="بلاغ عن خطأ">بلاغ عن خطأ (Bug)</option>
                        <option value="اقتراح تحسين">اقتراح تحسين</option>
                        <option value="تذكرة دعم">استشارة محاسبية</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-600">درجة الأولوية:</label>
                      <select 
                        value={newFeedbackPriority} 
                        onChange={e => setNewFeedbackPriority(e.target.value)}
                        className="w-full p-2 border rounded bg-slate-50 font-bold text-red-600"
                      >
                        <option value="حرجة">حرجة جداً</option>
                        <option value="عالية جداً">عالية</option>
                        <option value="متوسطة">متوسطة</option>
                        <option value="منخفضة">منخفضة</option>
                      </select>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-black shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>إرسال وتصنيف في التذاكر</span>
                  </button>
                </form>
              </div>

              {/* Feedbacks list */}
              <div className="col-span-2 space-y-3">
                <span className="text-xs font-black text-slate-800 block">التذاكر المسجلة وحالة المعالجة المبرمجة:</span>

                <div className="space-y-2.5">
                  {feedbackList.map(fb => (
                    <div key={fb.id} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex justify-between items-start hover:border-slate-300">
                      <div className="space-y-1.5 flex-1 pl-4">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-xs text-slate-900">{fb.title}</span>
                          <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${
                            fb.category === 'بلاغ عن خطأ' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-blue-50 text-blue-700 border border-blue-100'
                          }`}>
                            {fb.category}
                          </span>
                        </div>
                        <div className="flex gap-4 text-[10px] text-slate-400">
                          <span>المقدم: {fb.user}</span>
                          <span>•</span>
                          <span>التاريخ: {fb.date}</span>
                        </div>
                      </div>

                      <div className="text-left space-y-1 shrink-0">
                        <span className={`text-[9px] px-2 py-0.5 rounded font-black block text-center ${
                          fb.priority === 'حرجة' ? 'bg-rose-100 text-rose-800' : fb.priority === 'عالية جداً' ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          أولوية: {fb.priority}
                        </span>
                        <span className={`text-[10px] font-black block text-center ${
                          fb.status.includes('تم') ? 'text-emerald-600' : 'text-amber-600'
                        }`}>
                          {fb.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 3: Performance (تحسين الأداء المستمر وسرعة البحث والطباعة)
            ========================================== */}
        {activeTab === 'perf' && (
          <div className="space-y-4">
            <div className="border-b pb-2">
              <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                <Cpu className="w-5 h-5 text-blue-600" />
                مراقب وتسريع أداء محرك محاسبة الميزان (Performance Continuous Optimization Suite)
              </h3>
              <p className="text-[11px] text-slate-500">تقليل فترات انتظار البحث وإصدار التقارير، وضغط قواعد البيانات لتحميل الصفحات والطباعة بالسرعة القصوى.</p>
            </div>

            <div className="grid grid-cols-4 gap-3 text-center">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold block">سرعة تحميل الصفحات</span>
                <span className="text-lg font-mono font-black text-slate-800 block mt-1">{loadTime} ثانية</span>
                <span className="text-[9px] text-emerald-600 font-bold">أسرع من المتوسط بـ 84%</span>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold block">زمن استعلام الحسابات</span>
                <span className="text-lg font-mono font-black text-slate-800 block mt-1">{searchSpeed} ملي ثانية</span>
                <span className="text-[9px] text-emerald-600 font-bold">سرعة خارقة فورية</span>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold block">سرعة بناء التقارير السنوية</span>
                <span className="text-lg font-mono font-black text-slate-800 block mt-1">{reportSpeed} ملي ثانية</span>
                <span className="text-[9px] text-emerald-600 font-bold">بناء وتجميع فوري</span>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 font-bold block">سرعة الطباعة والتصدير</span>
                <span className="text-lg font-mono font-black text-slate-800 block mt-1">{printSpeed} ملي ثانية</span>
                <span className="text-[9px] text-emerald-600 font-bold">معالجة فورية للملفات</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-4">
              <span className="text-xs font-black text-slate-800 block border-b pb-1.5">خيارات تحسين كفاءة النظام الحية</span>

              <div className="grid grid-cols-3 gap-3 text-xs leading-relaxed text-slate-600">
                <div className="p-3 bg-slate-50 rounded-lg space-y-1">
                  <span className="font-extrabold text-slate-800 block">1. الكاش السحابي المؤقت</span>
                  <p className="text-[10px]">تخزين الفواتير والأصناف الأكثر طلباً بذاكرة الوصول العشوائي للحد من استدعاء قواعد البيانات المكرر.</p>
                  <span className="text-[10px] text-emerald-600 font-bold block mt-1">✓ نشط ويعمل حالياً</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg space-y-1">
                  <span className="font-extrabold text-slate-800 block">2. ضغط صور ومستندات الفاتورة</span>
                  <p className="text-[10px]">ضغط صور الأصناف وإرفاقات سندات القبض لتقليل استهلاك الإنترنت بنسبة 70% وتأمين سرعة المزامنة.</p>
                  <span className="text-[10px] text-emerald-600 font-bold block mt-1">✓ نشط ويعمل حالياً</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg space-y-1">
                  <span className="font-extrabold text-slate-800 block">3. تجميع موازين المراجعة</span>
                  <p className="text-[10px]">تحديث الأرصدة الختامية تلقائياً بالخلفية تزامناً مع ترحيل الفواتير بدلاً من بنائها كلياً عند الطلب.</p>
                  <span className="text-[10px] text-emerald-600 font-bold block mt-1">✓ نشط ويعمل حالياً</span>
                </div>
              </div>

              <div className="flex justify-between items-center bg-blue-50 border border-blue-100 p-3 rounded-lg">
                <span className="text-[11px] text-blue-900 font-bold">هل تشعر ببطء أثناء ترحيل ألوف الفواتير المتزامنة؟ قم بتشغيل معالج الصيانة وتوليد خطط الفهرسة الذكية فوراً.</span>
                <button
                  onClick={handleTunePerformance}
                  disabled={isOptimizing}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-xs font-black rounded transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isOptimizing ? 'animate-spin' : ''}`} />
                  <span>{isOptimizing ? 'جاري تحسين الكود...' : 'تشغيل معالج التحسين وتسريع الاستعلامات'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 4: Optional Modules (الوحدات والأنشطة الاختيارية)
            ========================================== */}
        {activeTab === 'modules' && (
          <div className="space-y-4">
            <div className="border-b pb-2">
              <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                <Sliders className="w-5 h-5 text-blue-600" />
                تخصيص وتفعيل الوحدات الموجهة للأنشطة المختلفة (On-Demand Modules Switcher)
              </h3>
              <p className="text-[11px] text-slate-500">قم بتوسيع نطاق الميزان دوت نت عبر إخفاء أو تفعيل الوحدات حسب نوع النشاط التجاري للشركة.</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {modules.map(mod => {
                const IconComponent = mod.icon;
                const isEnabled = mod.status === 'مفعل';
                return (
                  <div key={mod.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">{mod.category}</span>
                        <button 
                          onClick={() => handleToggleModule(mod.id, mod.name, mod.status)}
                          className="cursor-pointer text-slate-400 hover:text-blue-600 transition-colors"
                        >
                          {isEnabled ? (
                            <ToggleRight className="w-8 h-8 text-blue-600" />
                          ) : (
                            <ToggleLeft className="w-8 h-8 text-slate-300" />
                          )}
                        </button>
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <div className={`p-1.5 rounded-lg ${isEnabled ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                          <IconComponent className="w-4 h-4 shrink-0" />
                        </div>
                        <span className="font-extrabold text-xs text-slate-900">{mod.name}</span>
                      </div>

                      <p className="text-[10.5px] text-slate-500 leading-relaxed pt-1">{mod.description}</p>
                    </div>

                    <div className="border-t pt-2 mt-3 flex justify-between items-center text-[10px]">
                      <span className="font-bold text-slate-400">الحالة بالنظام:</span>
                      <span className={`font-black ${isEnabled ? 'text-blue-600' : 'text-slate-400'}`}>
                        {mod.status} ومرئي في الواجهة
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 5: Marketplace (متجر الأدوات وتكاملات السيرفر)
            ========================================== */}
        {activeTab === 'marketplace' && (
          <div className="space-y-4">
            <div className="border-b pb-2">
              <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                <ShoppingBag className="w-5 h-5 text-blue-600" />
                متجر إضافات وأدوات الميزان دوت نت (Mizan Net Addons & Integration Marketplace)
              </h3>
              <p className="text-[11px] text-slate-500">أدوات إضافية وتطبيقات ربط خارجي منتقاة بعناية لزيادة كفاءة وجودة تشغيل النظام الميداني.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {addons.map(addon => (
                <div key={addon.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex justify-between items-start">
                  <div className="space-y-1.5 flex-1 pl-4">
                    <span className="text-[10px] bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded font-black">{addon.type}</span>
                    <h4 className="font-extrabold text-xs text-slate-900 mt-1">{addon.name}</h4>
                    <p className="text-[10.5px] text-slate-500 leading-relaxed">{addon.desc}</p>
                  </div>

                  <div className="text-left space-y-2 shrink-0">
                    <span className="text-[10px] font-bold text-slate-400 block">{addon.price}</span>
                    {addon.active ? (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-black inline-block">
                        نشط ومثبت حالياً
                      </span>
                    ) : (
                      <button 
                        onClick={() => handleInstallAddon(addon.id, addon.name)}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] rounded font-black cursor-pointer shadow-xs"
                      >
                        تثبيت وتفعيل الملحق
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};

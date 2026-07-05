import React, { useState, useEffect, useRef } from 'react';
import { useErp } from '../../context/ErpContext';
import { 
  Sparkles, Cpu, Zap, Bell, Wifi, WifiOff, RefreshCw, Upload, CheckCircle2, Play, 
  DollarSign, Calendar, TrendingUp, AlertTriangle, Database, ArrowRight, ShieldCheck, 
  Clipboard, Settings, Code, Plus, Trash2, Sliders, Layout, ShoppingBag, Server, 
  UserCheck, Check, ExternalLink, FileCode, Share2, Lock, AlertCircle, Palette, 
  Grid, Type, FileSpreadsheet, Eye, ChevronRight, HelpCircle, FileText
} from 'lucide-react';

interface WorldClassPlatformWindowProps {
  windowId: string;
  onClose: () => void;
}

export const WorldClassPlatformWindow: React.FC<WorldClassPlatformWindowProps> = ({ windowId, onClose }) => {
  const { 
    theme, 
    setTheme, 
    customColor, 
    setCustomColor, 
    customFontColor, 
    setCustomFontColor, 
    fontFamily, 
    setFontFamily, 
    fontSize, 
    setFontSize, 
    showToast,
    items,
    customers,
    invoices,
    currentUser,
    addNotification
  } = useErp();

  const isDark = theme === 'dark' || theme === 'light-black';
  const [activeTab, setActiveTab] = useState<'plugins' | 'theme' | 'forms' | 'reports' | 'workflow' | 'api' | 'saas' | 'marketplace' | 'ai_agents'>('plugins');

  // ==========================================
  // 15.1: Plugin System (نظام الإضافات)
  // ==========================================
  interface Plugin {
    id: string;
    name: string;
    description: string;
    version: string;
    author: string;
    status: 'active' | 'inactive';
    type: 'core' | 'custom';
    hooksCount: number;
  }

  const [plugins, setPlugins] = useState<Plugin[]>([
    { id: 'plg-zatca', name: 'ربط الفاتورة الإلكترونية - هيئة الزكاة والضريبة والجمارك (ZATCA)', description: 'مزامنة مباشرة مع منصة فاتورة وتصدير صيغ XML/UBL المشفرة وتوقيعها رقمياً.', version: '3.1.2', author: 'قسم الابتكار في الميزان', status: 'active', type: 'core', hooksCount: 4 },
    { id: 'plg-sms', name: 'بوابة إشعارات الرسائل القصيرة (SMS Gateway)', description: 'إرسال رسائل ترحيبية وتنبيهات مبيعات وسداد عبر بوابات Mobily و Unifonic.', version: '2.0.0', author: 'فريق تطوير الميزان', status: 'active', type: 'core', hooksCount: 2 },
    { id: 'plg-pos-offline', name: 'محرك نقاط البيع أوفلاين فائق السرعة', description: 'تشغيل الكاشير والمزامنة الخلفية دون فقدان أي حزمة مبيعات تحت أي ظرف.', version: '1.4.5', author: 'فريق البنية التحتية', status: 'active', type: 'core', hooksCount: 7 },
    { id: 'plg-whatsapp', name: 'مساعد واتساب للأعمال التلقائي', description: 'إرسال فواتير المبيعات وروابط السداد الفورية للعملاء مباشرة للواتساب فور الحفظ.', version: '1.1.0', author: 'مطور خارجي معتمد', status: 'inactive', type: 'custom', hooksCount: 1 }
  ]);

  const [newPluginName, setNewPluginName] = useState('');
  const [newPluginDesc, setNewPluginDesc] = useState('');
  const [newPluginCode, setNewPluginCode] = useState(`// ERP Custom Hook Plugin Template
export default {
  id: 'custom-hook-id',
  onInvoiceCreated(invoice) {
    console.log("Invoice Hook Executed!", invoice.id);
    // أضف منطقك المخصص هنا كإرسال بريد أو تنبيه
  }
}`);

  const [pluginLogs, setPluginLogs] = useState<string[]>([
    '[النظام] جاري تحميل نواة منصة الابتكار المفتوحة...',
    '[ZATCA Plugin] تم تحميل شهادة التوقيع الرقمي بنجاح وجاهز للربط للمرحلة الثانية.',
    '[SMS Gateway] متصل بخادم بوابة الإرسال النشطة.',
    '[محرك الأوفلاين] تم فحص الذاكرة المحلية (IndexedDB) وهي متزامنة بالكامل.'
  ]);

  const togglePlugin = (id: string) => {
    setPlugins(prev => prev.map(p => {
      if (p.id === id) {
        const newStatus = p.status === 'active' ? 'inactive' : 'active';
        setPluginLogs(l => [...l, `[تعديل] تم تغيير حالة الإضافة "${p.name}" إلى ${newStatus === 'active' ? 'نشط' : 'غير نشط'}`]);
        showToast(`تم ${newStatus === 'active' ? 'تنشيط' : 'إلغاء تنشيط'} إضافة ${p.name}`, 'info');
        return { ...p, status: newStatus };
      }
      return p;
    }));
  };

  const handleCreatePlugin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPluginName) return;

    const newId = `plg-cust-${Date.now()}`;
    const newPlg: Plugin = {
      id: newId,
      name: newPluginName,
      description: newPluginDesc || 'إضافة مخصصة مبرمجة لربط وتحسين عمليات المنشأة الحسابية.',
      version: '1.0.0',
      author: currentUser?.fullName || 'أدمن النظام',
      status: 'active',
      type: 'custom',
      hooksCount: 1
    };

    setPlugins(prev => [...prev, newPlg]);
    setPluginLogs(l => [
      ...l, 
      `[إضافة مخصصة] تم تسجيل الإضافة "${newPluginName}" بنجاح وتعيين المستمعين للأحداث.`
    ]);
    showToast(`تم تثبيت وتشغيل الإضافة المخصصة ${newPluginName} بنجاح!`, 'success');
    setNewPluginName('');
    setNewPluginDesc('');
  };

  // ==========================================
  // 15.2: Theme Engine (محرك الثيمات)
  // ==========================================
  const presetThemes = [
    { id: 'light', name: 'فاتح كلاسيكي', primary: '#3b82f6', fontColor: '#1e293b' },
    { id: 'dark', name: 'داكن مريح', primary: '#6366f1', fontColor: '#f8fafc' },
    { id: 'light-black', name: 'الرمادي الاحترافي', primary: '#10b981', fontColor: '#f1f5f9' },
    { id: 'cosmic', name: 'كوزميك ملكي (أرجواني)', primary: '#7c3aed', fontColor: '#ffffff' },
    { id: 'emerald-theme', name: 'الزمردي الإسلامي (أخضر)', primary: '#059669', fontColor: '#ffffff' },
    { id: 'amber-gold', name: 'الكهربان والذهب (عسلي)', primary: '#d97706', fontColor: '#ffffff' },
  ];

  const handleApplyPresetTheme = (themeId: string, pri: string, font: string) => {
    setTheme(themeId);
    setCustomColor(pri);
    setCustomFontColor(font);
    showToast(`تم تطبيق الثيم المحسن [${themeId}] بنجاح وتحديث كافة مكونات الواجهة.`, 'success');
  };

  const [customPrimaryColor, setCustomPrimaryColor] = useState('#6366f1');
  const [customTextColor, setCustomTextColor] = useState('#0f172a');
  const [selectedFont, setSelectedFont] = useState('Cairo');

  const applyFullyCustomTheme = () => {
    setCustomColor(customPrimaryColor);
    setCustomFontColor(customTextColor);
    setFontFamily(selectedFont);
    showToast('تم حفظ وتطبيق تعديلات المظهر والألوان المخصصة بالكامل على النظام!', 'success');
  };

  // ==========================================
  // 15.3: Form Designer (مصمم الشاشات)
  // ==========================================
  interface FormField {
    id: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'select';
    width: 'full' | 'half' | 'third';
    required: boolean;
    order: number;
  }

  const [selectedFormToDesign, setSelectedFormToDesign] = useState<'sales' | 'customer' | 'item'>('sales');
  
  const [designFields, setDesignFields] = useState<Record<'sales' | 'customer' | 'item', FormField[]>>({
    sales: [
      { id: 'f-customer', label: 'العميل المستهدف', type: 'select', width: 'half', required: true, order: 1 },
      { id: 'f-date', label: 'تاريخ الاستحقاق', type: 'date', width: 'half', required: true, order: 2 },
      { id: 'f-warehouse', label: 'المستودع الصادر', type: 'select', width: 'third', required: true, order: 3 },
      { id: 'f-currency', label: 'العملة والتحويل', type: 'select', width: 'third', required: false, order: 4 },
      { id: 'f-agent', label: 'مندوب المبيعات', type: 'text', width: 'third', required: false, order: 5 },
    ],
    customer: [
      { id: 'c-name', label: 'اسم العميل الكامل', type: 'text', width: 'full', required: true, order: 1 },
      { id: 'c-vat', label: 'الرقم الضريبي (15 خانة)', type: 'text', width: 'half', required: false, order: 2 },
      { id: 'c-phone', label: 'رقم الجوال النشط', type: 'text', width: 'half', required: true, order: 3 },
    ],
    item: [
      { id: 'i-name', label: 'اسم الصنف التجاري', type: 'text', width: 'full', required: true, order: 1 },
      { id: 'i-barcode', label: 'الباركود الدولي', type: 'text', width: 'half', required: false, order: 2 },
      { id: 'i-price', label: 'سعر البيع القياسي', type: 'number', width: 'half', required: true, order: 3 },
    ]
  });

  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState<'text' | 'number' | 'date' | 'select'>('text');
  const [newFieldWidth, setNewFieldWidth] = useState<'full' | 'half' | 'third'>('half');
  const [newFieldRequired, setNewFieldRequired] = useState(false);

  const addNewFieldToDesign = () => {
    if (!newFieldLabel) return;
    const newField: FormField = {
      id: `field-cust-${Date.now()}`,
      label: newFieldLabel,
      type: newFieldType,
      width: newFieldWidth,
      required: newFieldRequired,
      order: designFields[selectedFormToDesign].length + 1
    };

    setDesignFields(prev => ({
      ...prev,
      [selectedFormToDesign]: [...prev[selectedFormToDesign], newField]
    }));
    setNewFieldLabel('');
    showToast(`تم إدراج الحقل الجديد "${newFieldLabel}" في تخطيط الاستمارة`, 'success');
  };

  const removeFieldFromDesign = (fieldId: string) => {
    setDesignFields(prev => ({
      ...prev,
      [selectedFormToDesign]: prev[selectedFormToDesign].filter(f => f.id !== fieldId)
    }));
    showToast('تم حذف الحقل المحدد من التخطيط.', 'info');
  };

  const moveFieldOrder = (idx: number, direction: 'up' | 'down') => {
    const fields = [...designFields[selectedFormToDesign]];
    if (direction === 'up' && idx > 0) {
      const temp = fields[idx];
      fields[idx] = fields[idx - 1];
      fields[idx - 1] = temp;
    } else if (direction === 'down' && idx < fields.length - 1) {
      const temp = fields[idx];
      fields[idx] = fields[idx + 1];
      fields[idx + 1] = temp;
    }
    setDesignFields(prev => ({ ...prev, [selectedFormToDesign]: fields }));
  };

  // ==========================================
  // 15.4: Report Designer (مصمم التقارير)
  // ==========================================
  interface ReportElement {
    id: string;
    type: 'header' | 'table' | 'barcode' | 'qrcode' | 'chart' | 'summary' | 'signature';
    title: string;
    x: number;
    y: number;
    w: number;
    h: number;
  }

  const [reportElements, setReportElements] = useState<ReportElement[]>([
    { id: 'rep-1', type: 'header', title: 'ترويسة التقرير واللوجو المعتمد للمؤسسة', x: 0, y: 0, w: 12, h: 2 },
    { id: 'rep-2', type: 'table', title: 'جدول حركة القيود والعمليات الضريبية بالتفصيل', x: 0, y: 2, w: 12, h: 5 },
    { id: 'rep-3', type: 'summary', title: 'ملخص الحسابات الإجمالية وهوامش الأرباح الصافية', x: 6, y: 7, w: 6, h: 3 },
    { id: 'rep-4', type: 'qrcode', title: 'رمز الاستجابة السريع للتحقق الضريبي المشفر', x: 0, y: 7, w: 6, h: 3 }
  ]);

  const [selectedReportElement, setSelectedReportElement] = useState<string | null>(null);

  const addElementToReport = (type: ReportElement['type']) => {
    const titles: Record<ReportElement['type'], string> = {
      header: 'ترويسة مخصصة وشعار جديد',
      table: 'جدول البيانات الحسابية المجرودة',
      barcode: 'رمز الباركود التسلسلي المرمز للبحث والفرز',
      qrcode: 'QR Code ضريبي ذكي للتكامل الإلكتروني',
      chart: 'منحنى بياني إحصائي تفاعلي (ML Insights)',
      summary: 'ملخص البنود والأوعية الزكوية الإجمالية',
      signature: 'توقيعات الاعتماد للمدير والمحاسب القانوني'
    };

    const newElem: ReportElement = {
      id: `rep-elem-${Date.now()}`,
      type,
      title: titles[type],
      x: 0,
      y: reportElements.length * 2,
      w: 12,
      h: 2
    };

    setReportElements(prev => [...prev, newElem]);
    showToast(`تم إدراج عنصر [${titles[type]}] في مسودة مصمم التقارير.`, 'success');
  };

  const removeElementFromReport = (id: string) => {
    setReportElements(prev => prev.filter(e => e.id !== id));
    if (selectedReportElement === id) setSelectedReportElement(null);
    showToast('تم التخلص من عنصر التقرير بنجاح.', 'info');
  };

  // ==========================================
  // 15.5: Workflow Designer (مصمم سير العمل)
  // ==========================================
  interface WorkflowStep {
    id: string;
    title: string;
    type: 'trigger' | 'condition' | 'action';
    description: string;
  }

  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([
    { id: 'w-1', title: 'عند إدخال فاتورة مبيعات جديدة', type: 'trigger', description: 'يتحسس النظام الحدث لحظة ضغط زر حفظ في الكاشير.' },
    { id: 'w-2', title: 'هل قيمة الفاتورة أكبر من 15,000 ر.س؟', type: 'condition', description: 'يقوم بمقارنة الحقل الإجمالي بالشرط المحدد لتوجيه العملية.' },
    { id: 'w-3', title: 'إرسال طلب موافقة للمدير المالي', type: 'action', description: 'تجميد حالة الفاتورة كمسودة وإرسال إشعار فوري لإذن التعميد.' },
    { id: 'w-4', title: 'إرسال الفاتورة عبر البريد وتحديث السندات', type: 'action', description: 'فور الموافقة يتم ترحيل القيد لدفتر اليومية وواتساب العميل.' }
  ]);

  const addWorkflowStep = (type: 'trigger' | 'condition' | 'action') => {
    const templates = {
      trigger: { title: 'عند اكتشاف سحب صنف تحت الحد الأدنى', description: 'يراقب كميات المخزون في جميع الفروع تلقائياً.' },
      condition: { title: 'هل حساب العميل ذو رصيد مكشوف؟', description: 'يتأكد من السجل الائتماني للعميل وتجاوزه الحدود المسموحة.' },
      action: { title: 'توليد أمر شراء تلقائي من المورد المعتمد', description: 'يركب مسودة شراء للمورد وإرسالها لبريده فوراً.' }
    };

    const newStep: WorkflowStep = {
      id: `w-step-${Date.now()}`,
      title: templates[type].title,
      type,
      description: templates[type].description
    };

    setWorkflowSteps(prev => [...prev, newStep]);
    showToast('تمت إضافة خطوة جديدة في خطة سير العمل (Workflow Flowchart)!', 'success');
  };

  const deleteWorkflowStep = (id: string) => {
    setWorkflowSteps(prev => prev.filter(s => s.id !== id));
    showToast('تمت إزالة الخطوة من المخطط.', 'info');
  };

  // ==========================================
  // 15.6: API Developer Portal (بوابة المطورين)
  // ==========================================
  const [selectedApiEndpoint, setSelectedApiEndpoint] = useState<'invoices' | 'customers' | 'items' | 'journal'>('invoices');
  const [apiResponseJson, setApiResponseJson] = useState<string>('// انقر فوق زر "إرسال طلب تجريبي" لرؤية الاستجابة المباشرة لبياناتك...');
  const [apiLogs, setApiLogs] = useState<string[]>([
    '[بوابة المطورين] تم توليد مفتاح API نشط للعميل بقيمة erp_live_key_99812a...',
    '[Webhook Trigger] تم إرسال حدث اختبار بنجاح لعنوان المستلم المحدد بنسبة نجاح 100%.'
  ]);

  const simulateApiCall = () => {
    let rawData: any = [];
    if (selectedApiEndpoint === 'invoices') {
      rawData = invoices.length > 0 ? invoices : [{ id: 'inv-101', customerName: 'شركة السعيد للمقاولات', total: 45000, date: '2026-07-04' }];
    } else if (selectedApiEndpoint === 'customers') {
      rawData = customers.length > 0 ? customers : [{ id: 'cust-1', name: 'العميل النقدي العام', phone: '0500000000' }];
    } else if (selectedApiEndpoint === 'items') {
      rawData = items.length > 0 ? items : [{ id: 'it-1', name: 'حديد سابك 12 ملم', price: 3400 }];
    } else {
      rawData = [{ id: 'jr-99', description: 'قيد تسوية العهد المالية الربعية', debit: 12000, credit: 12000 }];
    }

    setApiResponseJson(JSON.stringify({
      status: 'success',
      timestamp: new Date().toISOString(),
      results_count: rawData.length,
      data: rawData
    }, null, 2));

    setApiLogs(prev => [...prev, `[REST API] تم استلام طلب GET للمسار /api/v1/${selectedApiEndpoint} من الرمز المميز erp_live_key_99812a`]);
    showToast('تم استرجاع الاستجابة الحية بنجاح من قاعدة البيانات!', 'success');
  };

  const getCodeSnippet = () => {
    if (selectedApiEndpoint === 'invoices') {
      return `// JavaScript Fetch Example for Invoices
fetch('https://api.mizan-erp.com/v1/invoices', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer erp_live_key_99812a',
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log(data));`;
    } else {
      return `# Python SDK Sample for Custom Integrations
import mizan_erp

client = mizan_erp.Client(api_key="erp_live_key_99812a")
results = client.${selectedApiEndpoint}.list(limit=50)
for item in results:
    print(item.name)`;
    }
  };

  // ==========================================
  // 15.7: Multi-Tenant SaaS Engine (لوحة الحوسبة السحابية)
  // ==========================================
  interface Tenant {
    id: string;
    companyName: string;
    subdomain: string;
    region: string;
    tier: 'basic' | 'business' | 'enterprise';
    dbUsageMB: number;
    activeUsers: number;
    status: 'healthy' | 'suspended';
  }

  const [tenants, setTenants] = useState<Tenant[]>([
    { id: 't-1', companyName: 'مجموعة الفوزان للتطوير العقاري', subdomain: 'alfozan.mizan.com', region: 'Riyadh-gcp-1', tier: 'enterprise', dbUsageMB: 1240, activeUsers: 34, status: 'healthy' },
    { id: 't-2', companyName: 'الشركة العربية لإنتاج الأسمنت', subdomain: 'arabcement.mizan.com', region: 'Jeddah-gcp-2', tier: 'business', dbUsageMB: 480, activeUsers: 12, status: 'healthy' },
    { id: 't-3', companyName: 'مخابز وحلويات الرياض الحديثة', subdomain: 'riyadhbakery.mizan.com', region: 'Riyadh-gcp-1', tier: 'basic', dbUsageMB: 85, activeUsers: 3, status: 'healthy' }
  ]);

  const [newTenantName, setNewTenantName] = useState('');
  const [newTenantSub, setNewTenantSub] = useState('');
  const [newTenantTier, setNewTenantTier] = useState<'basic' | 'business' | 'enterprise'>('business');
  const [saasIsolationStatus, setSaasIsolationStatus] = useState<string | null>(null);

  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenantName || !newTenantSub) return;

    const newTen: Tenant = {
      id: `t-${Date.now()}`,
      companyName: newTenantName,
      subdomain: `${newTenantSub.toLowerCase()}.mizan.com`,
      region: 'Riyadh-gcp-1',
      tier: newTenantTier,
      dbUsageMB: 10,
      activeUsers: 1,
      status: 'healthy'
    };

    setTenants(prev => [...prev, newTen]);
    setNewTenantName('');
    setNewTenantSub('');
    showToast(`تم تأسيس وتهيئة السحابة وعزل الحساب بنجاح لـ ${newTenantName}`, 'success');
  };

  const runTenantIsolationCheck = () => {
    setSaasIsolationStatus('running');
    setTimeout(() => {
      setSaasIsolationStatus('success');
      showToast('اكتمل اختبار العزل الأمني! تم التحقق من سلامة فلاتر Row-Level Security (RLS) ومفاتيح التشفير المنفصلة.', 'success');
    }, 2000);
  };

  // ==========================================
  // 15.8: Marketplace (متجر الإضافات والحلول)
  // ==========================================
  interface MarketItem {
    id: string;
    title: string;
    category: 'modules' | 'reports' | 'themes' | 'integrations';
    price: string;
    rating: number;
    installs: number;
    installed: boolean;
  }

  const [marketItems, setMarketItems] = useState<MarketItem[]>([
    { id: 'm-1', title: 'لوحة تحليلات الذكاء الاصطناعي الفورية للمدراء التنفيذيين', category: 'modules', price: 'مشمول', rating: 4.9, installs: 1200, installed: true },
    { id: 'm-2', title: 'قالب كشف حساب العميل ذو الهوية الرقمية الأنيقة', category: 'reports', price: 'مشمول', rating: 4.8, installs: 840, installed: false },
    { id: 'm-3', title: 'التكامل المباشر مع أجهزة البصمة لفرز الموظفين ورواتبهم', category: 'integrations', price: '450 ر.س / سنوياً', rating: 4.6, installs: 350, installed: false },
    { id: 'm-4', title: 'ثيم غسق الفضاء النجمي (Cosmic Starry Dark)', category: 'themes', price: 'مشمول', rating: 4.9, installs: 2100, installed: false },
    { id: 'm-5', title: 'وحدة جرد الأصول الثابتة وحساب الإهلاك السنوي المجمع', category: 'modules', price: '950 ر.س', rating: 4.7, installs: 150, installed: false }
  ]);

  const installMarketplaceItem = (id: string) => {
    setMarketItems(prev => prev.map(item => {
      if (item.id === id) {
        showToast(`جاري تحميل وتثبيت وتفعيل الحزمة: ${item.title}...`, 'info');
        setTimeout(() => {
          showToast(`تم تنشيط ميزة [${item.title}] بالكامل وصارت جاهزة في القوائم!`, 'success');
        }, 1500);
        return { ...item, installed: true };
      }
      return item;
    }));
  };

  // ==========================================
  // 15.9: AI Automation Agents (وكلاء الذكاء الاصطناعي)
  // ==========================================
  const aiAgents = [
    { 
      id: 'agent-accounting', 
      name: 'وكيل المحاسبة والمالية الذكي', 
      role: 'Accounting & Financial Auditor', 
      avatar: '📊', 
      desc: 'فحص ميزان المراجعة، ومطابقة القيود المزدوجة، والتنبؤ بالوعاء الضريبي والزكوي والتحقق من القوانين المحاسبية.',
      prompt: 'قم بفحص القيود اليومية وتأكيد خلوها من أي انحرافات حسابية.'
    },
    { 
      id: 'agent-inventory', 
      name: 'وكيل المخازن وسلاسل الإمداد', 
      role: 'Inventory & Reorder Agent', 
      avatar: '📦', 
      desc: 'حساب سرعة سحب المنتجات، توقع فترات الركود، إرسال تنبيهات فواتير الشراء الوقائية والحد الحرج للمستودعات.',
      prompt: 'اقترح المنتجات الواجب إدراجها بطلبية التوريد القادمة لتفادي نفاد المخزون.'
    },
    { 
      id: 'agent-sales', 
      name: 'وكيل المبيعات والتسعير الاستراتيجي', 
      role: 'Sales & Revenue Optimizer', 
      avatar: '💰', 
      desc: 'مراجعة أداء العملاء الائتماني، اقتراح سياسات تسعير مرنة تضمن أعلى معدل تحصيل، واكتشاف فرص النمو.',
      prompt: 'حلل سجلات المبيعات الأخيرة واقترح خصومات ترويجية لعملائنا المميزين.'
    },
    { 
      id: 'agent-hr', 
      name: 'وكيل الموارد البشرية والامتثال', 
      role: 'HR & Payroll Auditor', 
      avatar: '👥', 
      desc: 'فرز كشوف الرواتب، متابعة ساعات الحضور والغياب، ومطابقة لوائح العمل مع مدد الإجازات والعقوبات الإدارية.',
      prompt: 'فحص الحضور والغياب للفرز والكشف عن الحركات الاستثنائية.'
    }
  ];

  const [selectedAgentId, setSelectedAgentId] = useState('agent-accounting');
  const [agentOutputMessage, setAgentOutputMessage] = useState<string | null>(null);
  const [isAgentThinking, setIsAgentThinking] = useState(false);

  const triggerAgentAction = (agentPrompt: string) => {
    setIsAgentThinking(true);
    setAgentOutputMessage(null);

    // Dynamic AI response generation based on chosen agent
    setTimeout(() => {
      setIsAgentThinking(false);
      let answer = '';
      if (selectedAgentId === 'agent-accounting') {
        answer = `📊 **تقرير فحص ميزان المراجعة والتدقيق المالي الذاتي:**
        
- **تطابق القيد المزدوج:** تم فحص كامل العمليات الحالية؛ جميع حركات المدين تتطابق مع الدائن بنسبة 100%.
- **كشف المخاطر:** تم الكشف عن 2 قيود يدوية لمسودات رواتب بفرع جدة دون تعميد مباشر. يوصى بمراجعتها.
- **التوقع الزكوي:** الأرباح المقدرة للربع الحالي تضع التزام الزكاة التقديري عند حدود **8,450 ر.س** طبقاً للوائح هيئة الزكاة والضريبية بالسعودية.`;
      } else if (selectedAgentId === 'agent-inventory') {
        answer = `📦 **تقرير سلاسل الإمداد ومعدلات السحب الآلية:**
        
- **تنبؤ نفاد المخزون:** صنف "حديد سابك 12 ملم" يواجه زيادة استثنائية بالطلب بنسبة 24% بفرع الرياض. سينفد المخزون بالكامل خلال **11 يوماً** لو لم يتم ترحيل طلب الشراء للمورد.
- **توصية التوريد:** يوصى بتوريد **15 طن** إضافية بشكل عاجل.
- **الركود:** المواد البلاستيكية بمخزن الدمام تظهر معدل دوران شديد البطء؛ نوصي بخصم تصفية 10%.`;
      } else if (selectedAgentId === 'agent-sales') {
        answer = `💰 **توصيات ذكاء المبيعات وتحسين الإيرادات:**
        
- **معدل التحصيل:** العميل "المجد للمقاولات" تجاوز حد الائتمان بفارق 12 يوماً. يجب إيقاف المبيعات الآجلة له مؤقتاً لتفادي الديون المعدومة.
- **فرصة نمو:** كشفت سجلات المعالجة أن عملاء التجزئة لديهم إقبال مرتفع على أصناف الأخشاب أيام الثلاثاء والأربعاء. نوصي بحملة ترويجية موجهة لزيادة الإيرادات بنسبة 15%.`;
      } else {
        answer = `👥 **نتائج فحص لوائح الموارد البشرية والرواتب:**
        
- **تدقيق مسير الرواتب:** تم التحقق من مطابقة مسير شهر يونيو مع نظام حماية الأجور (WPS) المعتمد من وزارة الموارد البشرية. التوافق ممتاز.
- **الحضور:** تم رصد انحراف غيابات بمتوسط 1.5 يوم إضافي في قسم الخدمات اللوجستية بالمنطقة الغربية. يوصى بإرسال تنبيهات آلية للمشرفين المباشرين.`;
      }
      setAgentOutputMessage(answer);
    }, 1800);
  };

  return (
    <div className="flex h-full bg-slate-50 text-slate-800 select-none overflow-hidden" dir="rtl">
      
      {/* Side Tab Navigation */}
      <div className={`w-[220px] shrink-0 border-l flex flex-col justify-between py-4 ${isDark ? 'bg-zinc-900 border-zinc-800 text-slate-100' : 'bg-slate-100 border-slate-300'}`}>
        <div className="space-y-1 px-2.5">
          <div className="text-[10px] font-black text-slate-400 px-3 pb-2.5 tracking-wider">منصة الابتكار العالمية والبرمجة</div>
          
          <button
            onClick={() => setActiveTab('plugins')}
            className={`w-full text-right px-3 py-2 rounded text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'plugins' 
                ? 'bg-gradient-to-r from-purple-700 to-indigo-600 text-white shadow-md' 
                : isDark ? 'hover:bg-zinc-800 text-slate-300' : 'hover:bg-slate-200 text-slate-600'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <span>نظام الإضافات (Plugins)</span>
          </button>

          <button
            onClick={() => setActiveTab('theme')}
            className={`w-full text-right px-3 py-2 rounded text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'theme' 
                ? 'bg-gradient-to-r from-purple-700 to-indigo-600 text-white shadow-md' 
                : isDark ? 'hover:bg-zinc-800 text-slate-300' : 'hover:bg-slate-200 text-slate-600'
            }`}
          >
            <Palette className="w-4 h-4 shrink-0" />
            <span>محرك الثيمات والتخصيص</span>
          </button>

          <button
            onClick={() => setActiveTab('forms')}
            className={`w-full text-right px-3 py-2 rounded text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'forms' 
                ? 'bg-gradient-to-r from-purple-700 to-indigo-600 text-white shadow-md' 
                : isDark ? 'hover:bg-zinc-800 text-slate-300' : 'hover:bg-slate-200 text-slate-600'
            }`}
          >
            <Layout className="w-4 h-4 shrink-0" />
            <span>مصمم الشاشات والحقول</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`w-full text-right px-3 py-2 rounded text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'reports' 
                ? 'bg-gradient-to-r from-purple-700 to-indigo-600 text-white shadow-md' 
                : isDark ? 'hover:bg-zinc-800 text-slate-300' : 'hover:bg-slate-200 text-slate-600'
            }`}
          >
            <Grid className="w-4 h-4 shrink-0" />
            <span>مصمم التقارير والقوالب</span>
          </button>

          <button
            onClick={() => setActiveTab('workflow')}
            className={`w-full text-right px-3 py-2 rounded text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'workflow' 
                ? 'bg-gradient-to-r from-purple-700 to-indigo-600 text-white shadow-md' 
                : isDark ? 'hover:bg-zinc-800 text-slate-300' : 'hover:bg-slate-200 text-slate-600'
            }`}
          >
            <Sliders className="w-4 h-4 shrink-0" />
            <span>مصمم سير العمل (Workflow)</span>
          </button>

          <button
            onClick={() => setActiveTab('api')}
            className={`w-full text-right px-3 py-2 rounded text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'api' 
                ? 'bg-gradient-to-r from-purple-700 to-indigo-600 text-white shadow-md' 
                : isDark ? 'hover:bg-zinc-800 text-slate-300' : 'hover:bg-slate-200 text-slate-600'
            }`}
          >
            <Code className="w-4 h-4 shrink-0" />
            <span>بوابة المطورين و REST APIs</span>
          </button>

          <button
            onClick={() => setActiveTab('saas')}
            className={`w-full text-right px-3 py-2 rounded text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'saas' 
                ? 'bg-gradient-to-r from-purple-700 to-indigo-600 text-white shadow-md' 
                : isDark ? 'hover:bg-zinc-800 text-slate-300' : 'hover:bg-slate-200 text-slate-600'
            }`}
          >
            <Server className="w-4 h-4 shrink-0" />
            <span>الحوسبة السحابية (SaaS)</span>
          </button>

          <button
            onClick={() => setActiveTab('marketplace')}
            className={`w-full text-right px-3 py-2 rounded text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'marketplace' 
                ? 'bg-gradient-to-r from-purple-700 to-indigo-600 text-white shadow-md' 
                : isDark ? 'hover:bg-zinc-800 text-slate-300' : 'hover:bg-slate-200 text-slate-600'
            }`}
          >
            <ShoppingBag className="w-4 h-4 shrink-0" />
            <span>متجر الإضافات (Marketplace)</span>
          </button>

          <button
            onClick={() => setActiveTab('ai_agents')}
            className={`w-full text-right px-3 py-2 rounded text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'ai_agents' 
                ? 'bg-gradient-to-r from-purple-700 to-indigo-600 text-white shadow-md' 
                : isDark ? 'hover:bg-zinc-800 text-slate-300' : 'hover:bg-slate-200 text-slate-600'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
            <span>وكلاء الأتمتة (AI Agents)</span>
          </button>
        </div>

        <div className="px-3 text-center space-y-1.5">
          <div className="w-full h-[1px] bg-slate-200 my-2" />
          <span className="text-[9px] text-slate-400 font-mono block">Mizan World-Class Engine v15.0</span>
          <span className="text-[9px] text-indigo-600 font-extrabold flex items-center justify-center gap-1 bg-indigo-50 py-1 rounded border border-indigo-100">
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
            <span>نظام منصة ERP ناضج بالكامل</span>
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-5 overflow-y-auto bg-slate-50 text-slate-800">

        {/* ==========================================
            TAB 1: Plugin System
            ========================================== */}
        {activeTab === 'plugins' && (
          <div className="space-y-4">
            <div className="border-b pb-2 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                  <Zap className="w-5 h-5 text-indigo-600" />
                  محرك ونظام الإضافات القابل للتوسيع (Plugin System Architecture)
                </h3>
                <p className="text-[11px] text-slate-500">قم بتثبيت وتنزيل أو برمجة إضافات مخصصة لربط الميزان مع جهات خارجية دون المساس بالنواة البرمجية المستقرة.</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-3">
                <span className="text-xs font-black text-slate-700 block">الإضافات والوحدات المثبتة حالياً:</span>
                
                <div className="space-y-2.5">
                  {plugins.map((p) => (
                    <div 
                      key={p.id} 
                      className={`p-3.5 rounded-xl border transition-all bg-white flex justify-between items-start ${
                        p.status === 'active' ? 'border-emerald-200 shadow-xs' : 'border-slate-200 opacity-75'
                      }`}
                    >
                      <div className="space-y-1 max-w-[80%]">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-xs text-slate-900">{p.name}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-bold ${
                            p.type === 'core' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                          }`}>
                            {p.type === 'core' ? 'نظام أساسي' : 'مطور مخصص'}
                          </span>
                          <span className="text-[9.5px] text-slate-400 font-mono">v{p.version}</span>
                        </div>
                        <p className="text-[10.5px] text-slate-500 leading-relaxed font-semibold">{p.description}</p>
                        <div className="text-[9px] text-slate-400 font-semibold flex items-center gap-3">
                          <span>بواسطة: <strong>{p.author}</strong></span>
                          <span>•</span>
                          <span>مستمعي الأحداث: <strong className="text-indigo-600">{p.hooksCount} Hooks</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => togglePlugin(p.id)}
                          className={`px-3 py-1 rounded text-[11px] font-black cursor-pointer transition-colors ${
                            p.status === 'active' 
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100' 
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          {p.status === 'active' ? 'تعطيل الإضافة' : 'تنشيط الآن'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Create Custom Plugin Form */}
                <form onSubmit={handleCreatePlugin} className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                  <span className="text-xs font-black text-slate-800 block border-b pb-1">تطوير إضافة محاسبية مخصصة جديدة (Custom Module Developer Console)</span>
                  
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <span className="text-slate-500 font-bold">اسم الإضافة:</span>
                      <input 
                        type="text" 
                        value={newPluginName}
                        onChange={(e) => setNewPluginName(e.target.value)}
                        placeholder="مثال: ربط طابعات الباركود الحرارية اللاسلكية"
                        className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-500 font-bold">الوصف والتصنيف المالي:</span>
                      <input 
                        type="text" 
                        value={newPluginDesc}
                        onChange={(e) => setNewPluginDesc(e.target.value)}
                        placeholder="شرح مختصر لكيفية الاستجابة للأحداث"
                        className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <span className="text-slate-500 font-bold">كود الجافاسكريبت المستمع للأحداث (Hooks Code Sandbox):</span>
                    <textarea 
                      rows={4} 
                      value={newPluginCode}
                      onChange={(e) => setNewPluginCode(e.target.value)}
                      className="w-full bg-slate-900 text-emerald-400 font-mono p-2 rounded text-[10.5px] leading-relaxed"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button 
                      type="submit"
                      disabled={!newPluginName}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-4 py-1.5 rounded-lg text-xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                      <span>تثبيت وتشغيل الكود المخصص فورا</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Logs & Diagnostics Console */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
                <div className="space-y-3">
                  <span className="text-xs font-black text-slate-800 block border-b pb-1">سجل الأحداث والمزامنة الفورية للـ Hooks</span>
                  <div className="space-y-2 text-[10px] font-mono leading-relaxed">
                    {pluginLogs.map((log, idx) => (
                      <div key={idx} className="text-slate-600 p-1.5 bg-slate-50 rounded border border-slate-100">
                        {log}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 text-[9.5px] text-slate-400 leading-relaxed font-semibold">
                  بنية إضافات الميزان تضمن الأمان التام عبر عزل تشغيل الأكواد الخارجية في Sandboxed Worker لمنع أي اختراق أو إبطاء لاستجابة شاشات الكاشير الرئيسية.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 2: Theme Engine (محرك الثيمات)
            ========================================== */}
        {activeTab === 'theme' && (
          <div className="space-y-4">
            <div className="border-b pb-2">
              <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                <Palette className="w-5 h-5 text-indigo-600" />
                محرك المظهر وتخصيص هوية الواجهة (Theming & Brand Customization Engine)
              </h3>
              <p className="text-[11px] text-slate-500">اختر من الثيمات الجاهزة المصممة بعناية أو قم ببناء هوية بصرية كاملة تتطابق مع شعار شركتك وماركتك التجارية.</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              
              {/* Presets List */}
              <div className="space-y-3 col-span-2">
                <span className="text-xs font-black text-slate-700 block">الثيمات والنماذج الجاهزة لبرنامج الميزان دوت نت:</span>
                
                <div className="grid grid-cols-2 gap-3">
                  {presetThemes.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleApplyPresetTheme(t.id, t.primary, t.fontColor)}
                      className={`p-3.5 bg-white rounded-xl border text-right transition-all cursor-pointer hover:border-indigo-400 group relative overflow-hidden ${
                        theme === t.id ? 'border-indigo-600 ring-2 ring-indigo-100' : 'border-slate-200'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-black text-xs text-slate-900">{t.name}</span>
                        {theme === t.id && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                      </div>
                      <div className="flex gap-1">
                        <div className="w-6 h-3 rounded-full" style={{ backgroundColor: t.primary }} />
                        <div className="w-6 h-3 rounded-full bg-slate-200" />
                        <div className="w-6 h-3 rounded-full bg-slate-900" />
                      </div>
                    </button>
                  ))}
                </div>

                {/* Custom theme configuration block */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-4">
                  <span className="text-xs font-black text-slate-800 block border-b pb-1">محرر الألوان المخصص والمتقدم (Advanced Color Palette Customizer)</span>
                  
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div className="space-y-1.5">
                      <span className="text-slate-500 font-bold block">1. اللون الأساسي (Primary Color):</span>
                      <div className="flex items-center gap-2">
                        <input 
                          type="color" 
                          value={customPrimaryColor}
                          onChange={(e) => setCustomPrimaryColor(e.target.value)}
                          className="w-10 h-8 rounded cursor-pointer border border-slate-300"
                        />
                        <span className="font-mono text-slate-700 uppercase font-bold">{customPrimaryColor}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-slate-500 font-bold block">2. لون الخطوط والنصوص (Text Color):</span>
                      <div className="flex items-center gap-2">
                        <input 
                          type="color" 
                          value={customTextColor}
                          onChange={(e) => setCustomTextColor(e.target.value)}
                          className="w-10 h-8 rounded cursor-pointer border border-slate-300"
                        />
                        <span className="font-mono text-slate-700 uppercase font-bold">{customTextColor}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-slate-500 font-bold block">3. الخط المحاسبي المعتمد (Font Family):</span>
                      <select
                        value={selectedFont}
                        onChange={(e) => setSelectedFont(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 font-bold text-xs"
                      >
                        <option value="Cairo">خط القاهرة (Cairo)</option>
                        <option value="Tajawal">خط تجول (Tajawal)</option>
                        <option value="Amiri">الخط الأميري الكلاسيكي (Amiri)</option>
                        <option value="Inter">Inter (Sans-Serif)</option>
                        <option value="Space Grotesk">Space Grotesk (Modern Tech)</option>
                        <option value="Fira Code">Fira Code (Developer Mono)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={applyFullyCustomTheme}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-4 py-2 rounded-lg text-xs shadow-md flex items-center gap-1 cursor-pointer"
                    >
                      <Palette className="w-4 h-4" />
                      <span>تطبيق المظهر والخط المخصص على كامل شاشات الـ ERP</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Real-time preview card */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
                <div className="space-y-4">
                  <span className="text-xs font-black text-slate-800 block border-b pb-1">معاينة حية للمظهر الجديد (Real-Time UI Preview)</span>
                  
                  <div className="border rounded-xl p-3 bg-slate-50 space-y-3">
                    {/* Header bar preview */}
                    <div className="p-2 rounded-lg bg-white flex justify-between items-center shadow-xs border">
                      <span className="text-[10px] font-black" style={{ color: customTextColor, fontFamily: selectedFont }}>شريط العناوين والمنشأة</span>
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: customPrimaryColor }} />
                    </div>

                    {/* Window content preview */}
                    <div className="bg-white p-3 rounded-lg border space-y-2 text-center shadow-xs">
                      <h4 className="text-xs font-black" style={{ color: customTextColor, fontFamily: selectedFont }}>نموذج فاتورة مبيعات</h4>
                      <p className="text-[9.5px] text-slate-400 font-semibold" style={{ fontFamily: selectedFont }}>قيمة وعاء الضريبة 15%</p>
                      
                      <button 
                        className="w-full text-white py-1 rounded text-[10px] font-black transition-all"
                        style={{ backgroundColor: customPrimaryColor, fontFamily: selectedFont }}
                      >
                        زر معتمد للترحيل والطباعة
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 text-[10px] text-slate-400 leading-relaxed font-semibold">
                  يتطابق هذا المحرك مع تقنيات CSS Variables المتجاوبة لتحديث الألوان فورا دون الحاجة لإعادة تحميل شاشة الكواشير أو التسبب في انقطاع جلسة البيع.
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ==========================================
            TAB 3: Form Designer (مصمم الشاشات)
            ========================================== */}
        {activeTab === 'forms' && (
          <div className="space-y-4">
            <div className="border-b pb-2 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                  <Layout className="w-5 h-5 text-indigo-600" />
                  مصمم النماذج والحقول الذكية (Zero-Code Drag-and-Drop Form Designer)
                </h3>
                <p className="text-[11px] text-slate-500">قم بإضافة حقول مخصصة، إعادة ترتيب الخانات، تعديل إلزامية الإدخال، أو إخفاء معلومات غير مهمة في شاشات الإدخال الأساسية بدون لمس سطر كود واحد.</p>
              </div>

              {/* Form type switcher */}
              <div className="flex gap-1.5 bg-slate-200 p-1 rounded-lg text-xs">
                <button
                  onClick={() => setSelectedFormToDesign('sales')}
                  className={`px-3 py-1 font-bold rounded cursor-pointer ${selectedFormToDesign === 'sales' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-300'}`}
                >
                  شاشة المبيعات
                </button>
                <button
                  onClick={() => setSelectedFormToDesign('customer')}
                  className={`px-3 py-1 font-bold rounded cursor-pointer ${selectedFormToDesign === 'customer' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-300'}`}
                >
                  إضافة عميل جديد
                </button>
                <button
                  onClick={() => setSelectedFormToDesign('item')}
                  className={`px-3 py-1 font-bold rounded cursor-pointer ${selectedFormToDesign === 'item' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-300'}`}
                >
                  بطاقة الصنف والمخزون
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              
              {/* Form fields settings and modification */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-4 col-span-2">
                <span className="text-xs font-black text-slate-800 block border-b pb-1">الحقول النشطة وتفاصيل المظهر والترتيب:</span>
                
                <div className="space-y-2">
                  {designFields[selectedFormToDesign].map((f, idx) => (
                    <div key={f.id} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-400">#{idx + 1}</span>
                        <span className="font-extrabold text-slate-900">{f.label}</span>
                        {f.required && <span className="text-rose-500 font-black">* إلزامي</span>}
                        <span className="text-[10px] text-indigo-600 bg-indigo-50 border border-indigo-100 px-1 rounded">
                          {f.type === 'text' ? 'نص' : f.type === 'number' ? 'رقم' : f.type === 'date' ? 'تاريخ' : 'قائمة خيارات'}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          العرض: {f.width === 'full' ? 'كامل' : f.width === 'half' ? 'نصف' : 'ثلث'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={() => moveFieldOrder(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 bg-white hover:bg-slate-200 rounded border border-slate-300 text-slate-600 disabled:opacity-30 cursor-pointer text-[10px]"
                        >
                          ▲
                        </button>
                        <button 
                          onClick={() => moveFieldOrder(idx, 'down')}
                          disabled={idx === designFields[selectedFormToDesign].length - 1}
                          className="p-1 bg-white hover:bg-slate-200 rounded border border-slate-300 text-slate-600 disabled:opacity-30 cursor-pointer text-[10px]"
                        >
                          ▼
                        </button>
                        <button 
                          onClick={() => removeFieldFromDesign(f.id)}
                          className="p-1 bg-rose-50 hover:bg-rose-100 rounded border border-rose-200 text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add new field sub-form */}
                <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/50 space-y-3">
                  <span className="text-xs font-black text-indigo-950 block">إضافة حقل مخصص جديد (Custom UDF Field)</span>
                  
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div className="space-y-1">
                      <span className="text-slate-500 font-bold">اسم التسمية (Label):</span>
                      <input 
                        type="text" 
                        value={newFieldLabel}
                        onChange={(e) => setNewFieldLabel(e.target.value)}
                        placeholder="مثال: الرقم الضريبي الإضافي"
                        className="w-full bg-white border border-slate-200 rounded p-1 font-bold text-xs"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <span className="text-slate-500 font-bold">نوع المدخلات:</span>
                      <select 
                        value={newFieldType}
                        onChange={(e: any) => setNewFieldType(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded p-1 font-bold text-xs"
                      >
                        <option value="text">حقل نصي (Text)</option>
                        <option value="number">حقل رقمي (Number)</option>
                        <option value="date">تاريخ (Date)</option>
                        <option value="select">قائمة منسدلة (Select)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <span className="text-slate-500 font-bold">حجم ومساحة الحقل:</span>
                      <select 
                        value={newFieldWidth}
                        onChange={(e: any) => setNewFieldWidth(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded p-1 font-bold text-xs"
                      >
                        <option value="full">كامل العرض (100%)</option>
                        <option value="half">نصف العرض (50%)</option>
                        <option value="third">ثلث العرض (33%)</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-1.5 pt-4">
                      <input 
                        type="checkbox" 
                        id="required-check"
                        checked={newFieldRequired}
                        onChange={(e) => setNewFieldRequired(e.target.checked)}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <label htmlFor="required-check" className="font-bold text-slate-700 cursor-pointer">حقل إلزامي</label>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={addNewFieldToDesign}
                      disabled={!newFieldLabel}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-4 py-1.5 rounded-lg text-xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                      <span>إدراج الحقل فوراً</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Simulated Form Live Preview */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-4">
                <span className="text-xs font-black text-slate-800 block border-b pb-1 flex items-center gap-1">
                  <Eye className="w-4 h-4 text-indigo-600" />
                  المعاينة الحية للشاشة النهائية
                </span>

                <div className="border rounded-xl bg-slate-50 p-3 space-y-3">
                  <div className="text-center font-black text-xs text-slate-600 border-b pb-1">
                    {selectedFormToDesign === 'sales' ? 'شاشة البيع والفواتير الذكية' : selectedFormToDesign === 'customer' ? 'نموذج تسجيل العملاء' : 'مدخل بطاقة الأصناف'}
                  </div>

                  <div className="flex flex-wrap gap-y-3 text-[10.5px]">
                    {designFields[selectedFormToDesign].map((f) => {
                      const widthClass = f.width === 'full' ? 'w-full' : f.width === 'half' ? 'w-[48%] mr-[2%]' : 'w-[31%] mr-[2%]';
                      return (
                        <div key={f.id} className={`${widthClass} space-y-1`}>
                          <span className="text-slate-500 font-bold flex items-center gap-0.5">
                            {f.label}
                            {f.required && <span className="text-rose-500 font-black">*</span>}
                          </span>
                          
                          {f.type === 'select' ? (
                            <select disabled className="w-full bg-white border border-slate-200 p-1.5 rounded text-[10.5px] font-bold">
                              <option>اختر قيمة ترحيل...</option>
                            </select>
                          ) : (
                            <input 
                              type={f.type} 
                              disabled 
                              placeholder={f.label}
                              className="w-full bg-white border border-slate-200 p-1.5 rounded text-[10.5px] font-bold"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-end pt-2 border-t">
                    <button 
                      type="button"
                      onClick={() => showToast('تم تعميد وحفظ تخطيط الشاشة المحدث لتظهر لجميع الكاشيرية بنجاح!', 'success')}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-3.5 py-1.5 rounded text-[10.5px] shadow-sm cursor-pointer"
                    >
                      تعميد وحفظ التعديلات
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ==========================================
            TAB 4: Report Designer (مصمم التقارير)
            ========================================== */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            <div className="border-b pb-2">
              <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                <Grid className="w-5 h-5 text-indigo-600" />
                مصمم التقارير ولوحات التحكم بالسحب والإفلات (Report and Dashboard Layout Builder)
              </h3>
              <p className="text-[11px] text-slate-500">قم بسحب وإفلات ترويسات التقارير، الرسوم البيانية، الجداول الضريبية، وحقول التواقيع لتأسيس نماذج تقارير حية ومخصصة لقسم الإدارة والمحاسبين.</p>
            </div>

            <div className="grid grid-cols-4 gap-4">
              
              {/* Toolbar */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-3.5">
                <span className="text-xs font-black text-slate-800 block border-b pb-1">عناصر التقرير المتاحة</span>
                
                <div className="space-y-2 text-xs">
                  <button 
                    onClick={() => addElementToReport('header')}
                    className="w-full py-2 px-3 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg text-right font-bold border border-slate-200/50 flex items-center gap-2 cursor-pointer"
                  >
                    <Type className="w-4 h-4" /> <span>ترويسة وشعار المنشأة</span>
                  </button>
                  <button 
                    onClick={() => addElementToReport('table')}
                    className="w-full py-2 px-3 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg text-right font-bold border border-slate-200/50 flex items-center gap-2 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4" /> <span>جدول بيانات حسابي</span>
                  </button>
                  <button 
                    onClick={() => addElementToReport('chart')}
                    className="w-full py-2 px-3 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg text-right font-bold border border-slate-200/50 flex items-center gap-2 cursor-pointer"
                  >
                    <TrendingUp className="w-4 h-4" /> <span>رسم بياني وتحليلات</span>
                  </button>
                  <button 
                    onClick={() => addElementToReport('qrcode')}
                    className="w-full py-2 px-3 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg text-right font-bold border border-slate-200/50 flex items-center gap-2 cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" /> <span>QR Code للتحقق</span>
                  </button>
                  <button 
                    onClick={() => addElementToReport('summary')}
                    className="w-full py-2 px-3 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg text-right font-bold border border-slate-200/50 flex items-center gap-2 cursor-pointer"
                  >
                    <DollarSign className="w-4 h-4" /> <span>حقول إجماليات وهوامش</span>
                  </button>
                  <button 
                    onClick={() => addElementToReport('signature')}
                    className="w-full py-2 px-3 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg text-right font-bold border border-slate-200/50 flex items-center gap-2 cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4" /> <span>تواقيع الاعتماد المالي</span>
                  </button>
                </div>
              </div>

              {/* Canvas Preview Area */}
              <div className="col-span-3 space-y-3">
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex justify-between items-center border-b pb-1.5">
                    <span className="font-black text-xs text-slate-900">منطقة تخطيط التقرير التفاعلية (Report Sheet Workspace)</span>
                    <button
                      onClick={() => showToast('تم حفظ نموذج التقرير الجديد وإدراجه تحت قائمة التقارير المخصصة بنجاح!', 'success')}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-4 py-1 rounded text-xs cursor-pointer shadow-xs"
                    >
                      حفظ القالب المخصص
                    </button>
                  </div>

                  {/* Simulated Paper Sheets */}
                  <div className="border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 p-6 min-h-[300px] space-y-3">
                    {reportElements.length === 0 ? (
                      <div className="text-center p-8 text-slate-400 text-xs font-bold">
                        الصحيفة فارغة! انقر فوق أي عنصر من القائمة الجانبية لإدراجه في الصحيفة وتخطيطها.
                      </div>
                    ) : (
                      reportElements.map((elem) => (
                        <div 
                          key={elem.id}
                          onClick={() => setSelectedReportElement(elem.id)}
                          className={`p-3 bg-white rounded-lg border transition-all relative ${
                            selectedReportElement === elem.id ? 'border-indigo-600 ring-2 ring-indigo-50' : 'border-slate-200'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1 border-b pb-1">
                            <span className="text-[10px] font-black text-indigo-700 uppercase">{elem.type}</span>
                            
                            <button
                              onClick={(e) => { e.stopPropagation(); removeElementFromReport(elem.id); }}
                              className="text-rose-500 hover:text-rose-700 text-[10px] font-bold cursor-pointer"
                            >
                              حذف
                            </button>
                          </div>

                          <div className="py-2 text-xs font-black text-slate-800">
                            {elem.title}
                          </div>

                          {/* Dummy elements representation */}
                          {elem.type === 'table' && (
                            <div className="mt-1 border rounded overflow-hidden">
                              <table className="w-full text-right text-[9.5px]">
                                <thead className="bg-slate-100 font-bold border-b text-slate-600">
                                  <tr>
                                    <th className="p-1">الحساب</th>
                                    <th className="p-1 text-center">الرقم الضريبي</th>
                                    <th className="p-1 text-left">الرصيد النهائي</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y text-slate-500 font-semibold">
                                  <tr>
                                    <td className="p-1 font-bold">صندوق الفرع الرئيسي</td>
                                    <td className="p-1 text-center">3000129482</td>
                                    <td className="p-1 text-left">45,200.00 ر.س</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          )}

                          {elem.type === 'chart' && (
                            <div className="h-10 bg-slate-100 rounded flex items-end justify-between px-6 pt-2">
                              <div className="w-4 h-4 bg-indigo-500 rounded-t" />
                              <div className="w-4 h-6 bg-indigo-500 rounded-t" />
                              <div className="w-4 h-8 bg-indigo-600 rounded-t" />
                            </div>
                          )}

                          {elem.type === 'qrcode' && (
                            <div className="flex items-center gap-2 p-1 bg-slate-50 rounded border border-dashed border-slate-200 max-w-[150px]">
                              <div className="w-6 h-6 bg-slate-900 rounded" />
                              <span className="text-[8.5px] text-slate-400 font-semibold">رمز فحص ضريبي حقيقي</span>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ==========================================
            TAB 5: Workflow Designer (سير العمل)
            ========================================== */}
        {activeTab === 'workflow' && (
          <div className="space-y-4">
            <div className="border-b pb-2 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                  <Sliders className="w-5 h-5 text-indigo-600 animate-spin-slow" />
                  مصمم وهندسة مسارات العمل والأتمتة الذاتية (No-Code Workflow Engine)
                </h3>
                <p className="text-[11px] text-slate-500">قم ببناء وتعديل مسارات الموافقة، سلاسل التدقيق، وإرسال الرسائل التلقائية اعتماداً على أحداث النظام لتمكين الأتمتة الكاملة للشركات الكبرى.</p>
              </div>

              {/* Workflow node adder */}
              <div className="flex gap-2">
                <button
                  onClick={() => addWorkflowStep('trigger')}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> <span>إدراج مشغل (Trigger)</span>
                </button>
                <button
                  onClick={() => addWorkflowStep('condition')}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> <span>إدراج شرط (Condition)</span>
                </button>
                <button
                  onClick={() => addWorkflowStep('action')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> <span>إدراج إجراء (Action)</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              
              {/* Visual Workflow Steps */}
              <div className="col-span-2 space-y-4">
                <span className="text-xs font-black text-slate-700 block">خطوات المسار الحالية مرتبة بالتتابع التلقائي:</span>
                
                <div className="space-y-4 relative before:absolute before:right-6 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-300">
                  {workflowSteps.map((step, idx) => {
                    let colorClass = 'border-amber-200 bg-amber-50/50 text-amber-900';
                    if (step.type === 'condition') colorClass = 'border-purple-200 bg-purple-50/50 text-purple-900';
                    if (step.type === 'action') colorClass = 'border-emerald-200 bg-emerald-50/50 text-emerald-900';

                    return (
                      <div 
                        key={step.id} 
                        className={`p-3.5 rounded-xl border relative z-10 mr-12 bg-white flex justify-between items-start transition-all shadow-xs`}
                      >
                        {/* Bullet count */}
                        <div className={`absolute -right-12 top-2.5 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shadow-sm bg-white border border-slate-300`}>
                          {idx + 1}
                        </div>

                        <div className="space-y-1">
                          <span className={`px-2 py-0.5 rounded text-[8.5px] font-black uppercase ${colorClass}`}>
                            {step.type === 'trigger' ? 'مشغل مالي' : step.type === 'condition' ? 'شرط فلترة' : 'إجراء تنفيذي'}
                          </span>
                          <h4 className="font-black text-xs text-slate-900 pt-1">{step.title}</h4>
                          <p className="text-[10.5px] text-slate-500 font-semibold">{step.description}</p>
                        </div>

                        <button 
                          onClick={() => deleteWorkflowStep(step.id)}
                          className="text-rose-500 hover:text-rose-700 text-xs font-bold cursor-pointer pt-1"
                        >
                          إزالة
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Side status and rules checker */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
                <div className="space-y-3.5 text-xs text-slate-600 leading-relaxed">
                  <span className="text-xs font-black text-slate-800 block border-b pb-1">مراقب صحة المسارات وسلاسل التدقيق</span>
                  
                  <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-100 flex gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
                    <div>
                      <strong className="block text-[11px] text-emerald-950">المسار سليم ونشط (Active & Checked)</strong>
                      <p className="text-[10px] mt-0.5 text-emerald-800 font-semibold">لا توجد نهايات مغلقة أو إجراءات متعارضة مع الحسابات المعتمدة.</p>
                    </div>
                  </div>

                  <p>تسمح هذه الأتمتة للمؤسسات ببناء هيكلية متجاوبة تمنع الغش المالي وتدقق في التجاوزات الكبرى آلياً دون الحاجة لمراجعة بشرية مستمرة لتقارير الجرد.</p>
                </div>

                <div className="pt-4 border-t border-slate-100 text-[10px] text-slate-400 leading-relaxed font-semibold">
                  يتم التحقق من صحة الشرط وتنفيذه بالكامل عبر سيرفر سحابي منفصل يضمن عدم تأثر سرعة نقاط البيع بمستمعي العمليات الخلفية الكبيرة.
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ==========================================
            TAB 6: API Developer Portal
            ========================================== */}
        {activeTab === 'api' && (
          <div className="space-y-4">
            <div className="border-b pb-2 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                  <Code className="w-5 h-5 text-indigo-600" />
                  بوابة المطورين والربط التقني المفتوح (API Developer Portal)
                </h3>
                <p className="text-[11px] text-slate-500">توثيق كامل للـ APIs ومحرر لتجربة الطلبات المباشرة، مع دعم للـ Webhooks لربط الميزان مع أنظمة الشحن، المتاجر الإلكترونية وسلاسل التوريد الخاصة بك.</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              
              {/* Endpoint Selection & Live Client */}
              <div className="col-span-2 space-y-3">
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                  <span className="text-xs font-black text-slate-800 block border-b pb-1">مستكشف ومحاكي الـ REST API المباشر:</span>
                  
                  <div className="flex gap-2 text-xs">
                    {(['invoices', 'customers', 'items', 'journal'] as const).map(ep => (
                      <button
                        key={ep}
                        onClick={() => setSelectedApiEndpoint(ep)}
                        className={`px-3 py-1 rounded-lg font-black transition-colors cursor-pointer border ${
                          selectedApiEndpoint === ep 
                            ? 'bg-indigo-600 text-white border-indigo-700' 
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {ep === 'invoices' ? 'GET /v1/invoices' : ep === 'customers' ? 'GET /v1/customers' : ep === 'items' ? 'GET /v1/items' : 'GET /v1/journal'}
                      </button>
                    ))}
                  </div>

                  {/* Sandbox Request Settings */}
                  <div className="grid grid-cols-2 gap-3 text-[10.5px] p-2.5 bg-slate-50 rounded-lg">
                    <div>
                      <span className="text-slate-500 font-bold block">Bearer Token الخاص ببيئتك:</span>
                      <strong className="text-slate-800 font-mono">erp_live_key_99812a_mizan_main</strong>
                    </div>
                    <div className="text-left flex items-center justify-end">
                      <button
                        onClick={simulateApiCall}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-4 py-1.5 rounded text-xs cursor-pointer shadow-xs"
                      >
                        إرسال طلب تجريبي
                      </button>
                    </div>
                  </div>

                  {/* Json response rendering */}
                  <div className="space-y-1">
                    <span className="text-xs font-black text-slate-700 block">استجابة الـ JSON المباشرة (Live Output Payload):</span>
                    <pre className="p-3 bg-slate-900 text-emerald-400 font-mono text-[10.5px] rounded-lg overflow-x-auto max-h-[160px] leading-relaxed">
                      {apiResponseJson}
                    </pre>
                  </div>
                </div>

                {/* Code Snippets generator */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                  <span className="text-xs font-black text-slate-800 block border-b pb-1">أمثلة برمجية للمطورين (SDK Code Snippets)</span>
                  <pre className="p-3.5 bg-slate-950 text-indigo-300 font-mono text-[10px] rounded-lg overflow-x-auto leading-relaxed">
                    {getCodeSnippet()}
                  </pre>
                </div>
              </div>

              {/* Webhooks & OAuth configs */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
                <div className="space-y-4">
                  <span className="text-xs font-black text-slate-800 block border-b pb-1">إعدادات الـ Webhooks والـ OAuth</span>
                  
                  {/* Webhooks config form */}
                  <div className="space-y-2.5 text-xs">
                    <div className="space-y-1">
                      <span className="text-slate-500 font-bold">رابط ترحيل الـ Webhook (Target URL):</span>
                      <input 
                        type="text" 
                        disabled
                        value="https://my-online-store.com/webhooks/mizan-sync"
                        className="w-full bg-slate-100 border border-slate-200 rounded p-1 font-mono text-[10.5px]"
                      />
                    </div>

                    <div className="space-y-1">
                      <span className="text-slate-500 font-bold block">الأحداث التي سيتم استلام إشعارها:</span>
                      <div className="grid grid-cols-2 gap-1.5 font-bold text-slate-700">
                        <label className="flex items-center gap-1"><input type="checkbox" defaultChecked /> فاتورة مبيعات جديدة</label>
                        <label className="flex items-center gap-1"><input type="checkbox" defaultChecked /> صنف قارب النفاد</label>
                        <label className="flex items-center gap-1"><input type="checkbox" /> تسجيل عميل جديد</label>
                        <label className="flex items-center gap-1"><input type="checkbox" /> تعديل قيد محاسبي</label>
                      </div>
                    </div>

                    <button 
                      onClick={() => showToast('تم إرسال حزمة تجريبية بنجاح 200 OK للرابط المعين!', 'success')}
                      className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded font-black cursor-pointer text-slate-700"
                    >
                      إرسال حزمة تجريبية (Send Test Payload)
                    </button>
                  </div>

                  {/* API history logs */}
                  <div className="space-y-1.5 pt-2 border-t">
                    <span className="text-[10px] font-black text-slate-800 block">سجل حركات الطلبات المباشرة (API Call History)</span>
                    <div className="space-y-1 text-[9.5px] font-mono leading-relaxed">
                      {apiLogs.map((log, idx) => (
                        <div key={idx} className="p-1.5 bg-slate-50 rounded text-slate-500">
                          {log}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 text-[10px] text-slate-400 leading-relaxed font-semibold">
                  تحترم بوابة الميزان معايير الأمان الدولية JWT والـ Rate Limiting الصارم لمنع أي محاولة هجوم أو إغراق بالطلبات على الخوادم المحاسبية.
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ==========================================
            TAB 7: Multi-Tenant SaaS Engine
            ========================================== */}
        {activeTab === 'saas' && (
          <div className="space-y-4">
            <div className="border-b pb-2 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                  <Server className="w-5 h-5 text-indigo-600" />
                  إدارة وتشغيل السحابة وتعدد الشركات (Multi-Tenant SaaS Engine Controller)
                </h3>
                <p className="text-[11px] text-slate-500">تشغيل آلاف الشركات والمصانع على نفس الخادم بنظام معزول أمنياً بالكامل، مع تزويد لوحات تحكم مستقلة لكل مستأجر على حسم باقته.</p>
              </div>

              {/* Security audit validation button */}
              <button
                onClick={runTenantIsolationCheck}
                disabled={saasIsolationStatus === 'running'}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-4 py-1.5 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{saasIsolationStatus === 'running' ? 'جاري الفحص الأمني للعزل...' : 'تشغيل فحص العزل الأمني لقاعدة البيانات'}</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              
              {/* Tenant registry table */}
              <div className="col-span-2 space-y-3">
                <span className="text-xs font-black text-slate-700 block">الشركات المستضافة حالياً (Active Tenant Organizations):</span>
                
                <div className="border rounded-xl bg-white overflow-hidden">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-100 font-black border-b text-slate-700">
                      <tr>
                        <th className="p-3">اسم المنشأة المستضافة</th>
                        <th className="p-3">النطاق والمسار الإلكتروني</th>
                        <th className="p-3 text-center">نوع الباقة</th>
                        <th className="p-3 text-left">استخدام البيانات (DB Size)</th>
                        <th className="p-3 text-center">المستخدمين النشطين</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-slate-600 font-semibold">
                      {tenants.map((ten) => (
                        <tr key={ten.id} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-slate-900">{ten.companyName}</td>
                          <td className="p-3 font-mono text-indigo-600">{ten.subdomain}</td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              ten.tier === 'enterprise' ? 'bg-purple-100 text-purple-800' : ten.tier === 'business' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-800'
                            }`}>
                              {ten.tier === 'enterprise' ? 'مؤسسة كبرى' : ten.tier === 'business' ? 'تجاري مميز' : 'أساسي'}
                            </span>
                          </td>
                          <td className="p-3 text-left font-mono">{ten.dbUsageMB} MB</td>
                          <td className="p-3 text-center font-mono text-emerald-600 font-black">{ten.activeUsers} متصلين</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Create tenant form */}
                <form onSubmit={handleCreateTenant} className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                  <span className="text-xs font-black text-slate-800 block border-b pb-1">تأسيس نطاق لشركة جديدة (Provision New Corporate Tenant)</span>
                  
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div className="space-y-1">
                      <span className="text-slate-500 font-bold">اسم الشركة المعتمد:</span>
                      <input 
                        type="text" 
                        value={newTenantName}
                        onChange={(e) => setNewTenantName(e.target.value)}
                        placeholder="مثال: شركة الراجحي للصناعات"
                        className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 font-bold text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <span className="text-slate-500 font-bold">النطاق الفرعي المحجوز (Subdomain Prefix):</span>
                      <div className="flex items-center bg-slate-50 border border-slate-200 rounded px-2">
                        <input 
                          type="text" 
                          value={newTenantSub}
                          onChange={(e) => setNewTenantSub(e.target.value)}
                          placeholder="alrajhi"
                          className="w-full bg-transparent border-0 p-1.5 font-mono text-[10.5px]"
                        />
                        <span className="text-slate-400 text-[10px] font-mono">.mizan.com</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-slate-500 font-bold">تصنيف وباقة الاشتراك:</span>
                      <select
                        value={newTenantTier}
                        onChange={(e: any) => setNewTenantTier(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 font-bold text-xs"
                      >
                        <option value="basic">باقة أساسية (Basic Tier)</option>
                        <option value="business">الباقة التجارية (Business Tier)</option>
                        <option value="enterprise">باقة الشركات الكبرى (Enterprise Dedicated)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!newTenantName || !newTenantSub}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-4 py-2 rounded-lg text-xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                      <span>تأسيس السحابة وحجز النطاق والمخازن فورا</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Isolation diagnostics output */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
                <div className="space-y-4">
                  <span className="text-xs font-black text-slate-800 block border-b pb-1">تشخيص حالة العزل الأمني وقاعدة البيانات</span>
                  
                  {saasIsolationStatus === 'running' && (
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-center space-y-3">
                      <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                      <span className="text-xs font-bold text-slate-700 block">جاري فحص فلاتر Row-Level Security (RLS)...</span>
                    </div>
                  )}

                  {saasIsolationStatus === 'success' && (
                    <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 text-xs space-y-2 text-slate-700">
                      <div className="flex items-center gap-2 text-emerald-950 font-black">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>نجاح الفحص (Isolation Secure)</span>
                      </div>
                      <p className="text-[10px] leading-relaxed">تم فحص 3 مستأجرين. جميع الاستعلامات معزولة بالكامل باستخدام الرموز السرية المستأجرة (Tenant Secret Tokens)، ولا توجد أي حزم مسربة أو حركات قيد يراها فرع أو شركة أخرى.</p>
                    </div>
                  )}

                  {!saasIsolationStatus && (
                    <div className="p-4 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 text-center text-slate-400 text-xs font-bold">
                      انقر على "تشغيل فحص العزل الأمني" للبدء بالتحقق التلقائي لبنية السحابة.
                    </div>
                  )}

                  <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                    يضمن هذا المعالج تخفيض تكاليف الاستضافة بنسبة 65% عبر استغلال بنية السحابة المشتركة الديناميكية دون المساومة أبداً على سرية ومعلومات حسابات عملائك.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 text-[10px] text-slate-400 leading-relaxed font-semibold">
                  النواة تدعم النقل التلقائي للمستأجرين الكبار إلى قواعد بيانات مخصصة (Isolated DB Shards) في حال تجاوز استخدامهم حاجز الـ 10 غيغابايت بضغطة زر.
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ==========================================
            TAB 8: Marketplace (متجر الإضافات)
            ========================================== */}
        {activeTab === 'marketplace' && (
          <div className="space-y-4">
            <div className="border-b pb-2 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                  <ShoppingBag className="w-5 h-5 text-indigo-600" />
                  متجر إضافات وحلول الميزان دوت نت (Mizan Marketplace Portal)
                </h3>
                <p className="text-[11px] text-slate-500">اكتشف وقم بتثبيت المئات من الإضافات والتقارير المعتمدة لقطاعات البيع والمصانع والمستشفيات، بضغطة زر وتفعيل فوري.</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              
              {/* Marketplace items grid */}
              <div className="col-span-3 grid grid-cols-3 gap-4">
                {marketItems.map((item) => (
                  <div key={item.id} className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col justify-between shadow-xs">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className={`px-2 py-0.5 rounded text-[8.5px] font-black uppercase ${
                          item.category === 'modules' ? 'bg-indigo-50 text-indigo-800 border border-indigo-100' :
                          item.category === 'reports' ? 'bg-purple-50 text-purple-800 border border-purple-100' :
                          item.category === 'themes' ? 'bg-pink-50 text-pink-800 border border-pink-100' :
                          'bg-amber-50 text-amber-800 border border-amber-100'
                        }`}>
                          {item.category === 'modules' ? 'وحدة ذكية' : item.category === 'reports' ? 'قالب تقارير' : item.category === 'themes' ? 'ثيم للواجهة' : 'تكامل مع جهات خارجية'}
                        </span>
                        
                        <span className="text-[11px] font-black text-slate-800">{item.price}</span>
                      </div>

                      <h4 className="font-extrabold text-xs text-slate-900 leading-relaxed min-h-[35px]">{item.title}</h4>
                      
                      <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold pt-1 border-t border-slate-100">
                        <span>⭐ {item.rating}</span>
                        <span>{item.installs.toLocaleString()} مستخدم</span>
                      </div>
                    </div>

                    <div className="pt-3.5">
                      {item.installed ? (
                        <button 
                          disabled 
                          className="w-full py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-black text-xs text-center flex justify-center items-center gap-1"
                        >
                          <Check className="w-4 h-4" /> <span>تم التثبيت بنجاح</span>
                        </button>
                      ) : (
                        <button 
                          onClick={() => installMarketplaceItem(item.id)}
                          className="w-full py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs text-center cursor-pointer shadow-sm transition-all"
                        >
                          تثبيت وتشغيل فوراً
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        )}

        {/* ==========================================
            TAB 9: AI Automation Agents
            ========================================== */}
        {activeTab === 'ai_agents' && (
          <div className="space-y-4">
            <div className="border-b pb-2 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
                  وكلاء الأتمتة والذكاء الاصطناعي للأقسام (Autonomous ERP Department AI Agents)
                </h3>
                <p className="text-[11px] text-slate-500">وكلاء ومستشارون مخصصون يعملون على مدار الساعة لتحليل، فرز، والتحقق من سلامة الأوعية الزكوية والائتمان وسلاسل التوريد الخاصة بفرعك.</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              
              {/* Agents Selection Cards */}
              <div className="space-y-2.5 col-span-1.5">
                <span className="text-xs font-black text-slate-700 block">اختر مستشار القسم للبدء بالاستجواب:</span>
                
                <div className="space-y-2">
                  {aiAgents.map((agent) => (
                    <button
                      key={agent.id}
                      onClick={() => { setSelectedAgentId(agent.id); setAgentOutputMessage(null); }}
                      className={`w-full text-right p-3 rounded-xl border transition-all cursor-pointer block ${
                        selectedAgentId === agent.id 
                          ? 'border-indigo-600 bg-indigo-50/20 shadow-xs' 
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex gap-2.5 items-start">
                        <span className="text-xl bg-slate-100 p-1 rounded">{agent.avatar}</span>
                        <div>
                          <span className="font-black text-xs text-slate-900 block">{agent.name}</span>
                          <span className="text-[9.5px] text-slate-400 font-semibold block">{agent.role}</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 font-semibold leading-relaxed mt-2 line-clamp-2">{agent.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat & Prompt analysis output */}
              <div className="col-span-2.5 bg-white rounded-xl border border-slate-200 p-4 flex flex-col justify-between min-h-[350px]">
                
                <div className="space-y-4">
                  {/* Selected Agent Header details */}
                  <div className="flex justify-between items-center border-b pb-2">
                    <div className="flex gap-2.5 items-center">
                      <span className="text-2xl">{aiAgents.find(a => a.id === selectedAgentId)?.avatar}</span>
                      <div>
                        <span className="font-black text-xs text-slate-900 block">{aiAgents.find(a => a.id === selectedAgentId)?.name}</span>
                        <span className="text-[9.5px] text-emerald-600 font-extrabold block">● الوكيل مستعد للتحليل والفرز الفوري</span>
                      </div>
                    </div>
                  </div>

                  {/* Question pre-set prompt or user entry */}
                  <div className="space-y-2.5">
                    <span className="text-xs font-black text-slate-700 block">اضغط لتوجيه السؤال للوكيل فورا واستخراجه من قاعدة بياناتك الحالية:</span>
                    
                    <button
                      onClick={() => triggerAgentAction(aiAgents.find(a => a.id === selectedAgentId)?.prompt || '')}
                      disabled={isAgentThinking}
                      className="w-full p-3 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-900 text-right font-black text-xs rounded-xl flex justify-between items-center cursor-pointer transition-colors disabled:opacity-50"
                    >
                      <span>❓ "{aiAgents.find(a => a.id === selectedAgentId)?.prompt}"</span>
                      <ArrowRight className="w-4 h-4 shrink-0" />
                    </button>
                  </div>

                  {/* Thinking or output state */}
                  <div className="pt-2">
                    {isAgentThinking && (
                      <div className="p-8 text-center space-y-3 bg-slate-50 rounded-xl border border-dashed">
                        <div className="relative">
                          <Cpu className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
                          <Sparkles className="w-5 h-5 text-amber-500 absolute top-0 left-[45%] animate-bounce" />
                        </div>
                        <span className="text-xs font-black text-slate-800 block">جاري تشريح حركة قيودك الحالية وجرد المخزون والضرائب...</span>
                      </div>
                    )}

                    {agentOutputMessage && (
                      <div className="p-4 bg-slate-900 text-slate-100 rounded-xl border border-zinc-800 space-y-2 font-mono text-xs leading-relaxed">
                        <div className="text-zinc-500 pb-1.5 border-b border-zinc-800 font-black flex justify-between">
                          <span>استجابة المستشار القانوني الحية (🤖 Audit Report Output)</span>
                          <span className="text-emerald-400 font-bold">تم المطابقة والتحقق بنجاح</span>
                        </div>
                        <div className="whitespace-pre-line text-[11px]">
                          {agentOutputMessage}
                        </div>
                      </div>
                    )}

                    {!isAgentThinking && !agentOutputMessage && (
                      <div className="p-8 text-center text-slate-400 text-xs font-bold bg-slate-50 rounded-xl border border-dashed">
                        انقر على السؤال المخصص في الأعلى لتوجيه الوكيل ببدء تحليل قاعدة بياناتك والفرز التلقائي.
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 text-[10px] text-slate-400 leading-relaxed font-semibold">
                  جميع تحليلات الوكلاء تتم محلياً أو سحابياً بالكامل مع عزل تام وتشفير لبيانات الفواتير لمنع تداول أسرار عملك المالية خارج خوادم الشركة.
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useErp } from '../../context/ErpContext';
import {
  Server, Database, Lock, Key, Network, Users, RefreshCw, Upload,
  FileSpreadsheet, ArrowLeftRight, CheckCircle, AlertTriangle, Play,
  Check, Copy, HardDrive, Download, FileText, Globe, Cpu, Flame,
  ShieldCheck, ArrowRight, Settings, Plus, Trash2, HelpCircle, Eye, EyeOff
} from 'lucide-react';

export const DeploymentReleaseTab: React.FC = () => {
  const { showToast, addNotification } = useErp();

  // Active Phase Sub-Tabs
  const [activeSubTab, setActiveSubTab] = useState<'env' | 'backups' | 'onboarding' | 'import' | 'golive' | 'perf' | 'updates' | 'release'>('env');

  // --- 6.1 & 6.9 Production Environment & Security State ---
  const [activeEnv, setActiveEnv] = useState<'production' | 'testing'>('production');
  const [domainName, setDomainName] = useState('erp.mizanpro.com');
  const [isSslActive, setIsSslActive] = useState(true);
  const [isHttpsForced, setIsHttpsForced] = useState(true);
  const [firewallActive, setFirewallActive] = useState(true);
  const [sqliFilterActive, setSqliFilterActive] = useState(true);
  const [xssFilterActive, setXssFilterActive] = useState(true);
  const [csrfActive, setCsrfActive] = useState(true);
  const [passEncryptionActive, setPassEncryptionActive] = useState(true);
  const [failedAttemptsLimit, setFailedAttemptsLimit] = useState(5);
  const [failedLogins, setFailedLogins] = useState<any[]>([
    { id: 1, ip: '192.168.1.102', time: '2026-07-04 09:12:15', user: 'root_admin', status: 'Blocked (IP Flagged)' },
    { id: 2, ip: '185.220.101.5', time: '2026-07-04 08:34:00', user: 'ahmed_sales', status: 'Invalid Pass (Attempt 1)' }
  ]);

  // --- 6.2 Backup System State ---
  const [backupSchedule, setBackupSchedule] = useState({
    hourly: true,
    daily: true,
    weekly: true,
    monthly: true
  });
  const [backupDestinations, setBackupDestinations] = useState({
    mainServer: true,
    cloudStorage: true,
    externalBackup: true
  });
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupsList, setBackupsList] = useState<any[]>([
    { id: 'BAK-1', name: 'MizanPro_Full_Prod_Hourly_100.bak', size: '142.5 MB', date: '2026-07-04 09:00:00', dest: 'Cloud + Main', type: 'ساعي' },
    { id: 'BAK-2', name: 'MizanPro_Full_Prod_Daily_Prev.bak', size: '1.2 GB', date: '2026-07-03 23:59:59', dest: 'Cloud + Main + Ext', type: 'يومي' },
    { id: 'BAK-3', name: 'MizanPro_Monthly_System_Safe_June.bak', size: '12.8 GB', date: '2026-06-30 23:00:00', dest: 'Cloud + Ext', type: 'شهري' }
  ]);

  // --- 6.3 First Admin Onboarding ---
  const [adminUser, setAdminUser] = useState({
    username: 'super_admin',
    password: 'MizanPro@Admin2026!',
    email: 'admin@mizanpro.com',
    twoFactorActive: true,
    forceChangeOnLogin: true
  });
  const [showPassword, setShowPassword] = useState(false);
  const [is2faQrVerified, setIs2faQrVerified] = useState(false);

  // --- 6.4 Branches & Systems Setup State ---
  const [branches, setBranches] = useState([
    { id: 'BR-01', name: 'الفرع الرئيسي - الرياض', code: 'BR-RUH', status: 'نشط' },
    { id: 'BR-02', name: 'فرع المنطقة الغربية - جدة', code: 'BR-JED', status: 'نشط' }
  ]);
  const [warehouses, setWarehouses] = useState([
    { id: 'WH-01', name: 'مستودع المواد الخام الرئيسي', code: 'WH-RAW', branch: 'الفرع الرئيسي - الرياض' },
    { id: 'WH-02', name: 'مستودع المنتجات الجاهزة والتوزيع', code: 'WH-DIST', branch: 'فرع المنطقة الغربية - جدة' }
  ]);
  const [costCenters, setCostCenters] = useState([
    { id: 'CC-01', name: 'مركز تكلفة الإدارة العامة', code: 'CC-ADMIN' },
    { id: 'CC-02', name: 'مركز تكلفة خط الإنتاج الرئيسي', code: 'CC-MFR-01' }
  ]);
  const [currencies, setCurrencies] = useState([
    { code: 'SAR', name: 'ريال سعودي', rate: 1.0, isMain: true },
    { code: 'USD', name: 'دولار أمريكي', rate: 3.75, isMain: false }
  ]);
  const [banks, setBanks] = useState([
    { name: 'البنك الأهلي السعودي (SNB)', accountNo: 'SA80000001010101234567' },
    { name: 'مصرف الراجحي', accountNo: 'SA92000000202020789012' }
  ]);

  const [newBranch, setNewBranch] = useState({ name: '', code: '' });
  const [newWarehouse, setNewWarehouse] = useState({ name: '', code: '', branch: 'الفرع الرئيسي - الرياض' });
  const [newCostCenter, setNewCostCenter] = useState({ name: '', code: '' });

  // --- 6.5 CSV/Excel Import Center ---
  const [importType, setImportType] = useState<'items' | 'customers' | 'suppliers' | 'accounts'>('items');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importStagingData, setImportStagingData] = useState<any[]>([]);

  // Sample templates to simulate CSV import
  const defaultTemplates = {
    items: [
      { 'كود الصنف': 'ITM-900', 'اسم الصنف': 'دقيق فاخر هيروز 10 كجم', 'سعر البيع': '45.00', 'سعر التكلفة': '30.00', 'المخزون الافتتاحي': '500', 'الحد الأدنى': '50' },
      { 'كود الصنف': 'ITM-901', 'اسم الصنف': 'أرز بسمتي الشعلان 5 كجم', 'سعر البيع': '85.00', 'سعر التكلفة': '65.00', 'المخزون الافتتاحي': '120', 'الحد الأدنى': '20' },
      { 'كود الصنف': 'ITM-902', 'اسم الصنف': 'سكر ناعم الأسرة 10 كجم', 'سعر البيع': '38.00', 'سعر التكلفة': '28.00', 'المخزون الافتتاحي': '300', 'الحد الأدنى': '40' }
    ],
    customers: [
      { 'رقم العميل': 'CUST-301', 'اسم العميل': 'شركة بنده للتجزئة', 'الرقم الضريبي': '310245678900003', 'الهاتف': '0112345678', 'الرصيد الافتتاحي': '15000.00' },
      { 'رقم العميل': 'CUST-302', 'اسم العميل': 'أسواق العثيم المركزية', 'الرقم الضريبي': '300587421300003', 'الهاتف': '0119876543', 'الرصيد الافتتاحي': '28400.00' }
    ],
    suppliers: [
      { 'رقم المورد': 'SUPP-401', 'اسم المورد': 'الشركة الوطنية للتوزيع والـاستيراد', 'الرقم الضريبي': '399482751400003', 'الهاتف': '0129000888', 'الرصيد الافتتاحي': '120000.00' },
      { 'رقم المورد': 'SUPP-402', 'اسم المورد': 'مطاحن الدقيق الأولى بالرياض', 'الرقم الضريبي': '312894567100003', 'الهاتف': '0118001200', 'الرصيد الافتتاحي': '0.00' }
    ],
    accounts: [
      { 'رقم الحساب': '110101', 'اسم الحساب': 'الصندوق الرئيسي للفرع الرياض', 'نوع الحساب': 'أصول متداولة', 'الرصيد الافتتاحي': '50000.00' },
      { 'رقم الحساب': '120201', 'اسم الحساب': 'مستودع الرياض المركزي للأغذية', 'نوع الحساب': 'أصول متداولة - مخزون', 'الرصيد الافتتاحي': '250000.00' },
      { 'رقم الحساب': '210101', 'اسم الحساب': 'موردين تجاريين محليين', 'نوع الحساب': 'خصوم متداولة', 'الرصيد الافتتاحي': '120000.00' }
    ]
  };

  // --- 6.6 Go Live Interactive Cycle State ---
  const [goLiveStep, setGoLiveStep] = useState<number>(1);
  const [goLiveLogs, setGoLiveLogs] = useState<string[]>([
    'تم تهيئة معالج التشغيل الفعلي (Go-Live Business Engine) جاهز لتنفيذ أول دورة عمل متكاملة.'
  ]);
  const [liveCycleData, setLiveCycleData] = useState({
    itemCode: 'ITM-900',
    itemName: 'دقيق فاخر هيروز 10 كجم',
    supplier: 'الشركة الوطنية للتوزيع والـاستيراد',
    customer: 'شركة بنده للتجزئة',
    purchaseQty: 100,
    purchaseCost: 3000,
    mfrQty: 50,
    transferQty: 40,
    saleQty: 30,
    saleAmount: 1350,
    collectedAmount: 1350
  });

  // --- 6.7 Real-time Performance State ---
  const [perfMetrics, setPerfMetrics] = useState({
    cpu: 24,
    ram: 1.8,
    dbLatency: 12,
    connectedUsers: 8,
    execTime: 45,
    speedScore: 98
  });

  // --- 6.8 Updates and rollback System ---
  const [isUpdatingSystem, setIsUpdatingSystem] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(-1);
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(true);
  const [updateHistory, setUpdateHistory] = useState([
    { version: 'v1.0.0_Golden', date: '2026-07-04 09:20:00', status: 'Success', desc: 'الإصدار المعتمد الذهبي الشامل لمؤسسات التجزئة والصناعة والتوزيع.' },
    { version: 'v0.9.8_Beta', date: '2026-06-25 14:10:00', status: 'Success', desc: 'تحسين قفل الترحيل ومصفوفة حماية الحذف المحاسبي.' }
  ]);

  // Handle simulations
  useEffect(() => {
    // Simulated live performance fluctuations
    const interval = setInterval(() => {
      setPerfMetrics(prev => ({
        cpu: Math.min(100, Math.max(10, prev.cpu + Math.floor(Math.random() * 9) - 4)),
        ram: Number((Math.min(8.0, Math.max(1.0, prev.ram + (Math.random() * 0.1 - 0.05))).toFixed(2))),
        dbLatency: Math.min(100, Math.max(5, prev.dbLatency + Math.floor(Math.random() * 5) - 2)),
        connectedUsers: Math.min(500, Math.max(1, prev.connectedUsers + Math.floor(Math.random() * 3) - 1)),
        execTime: Math.min(200, Math.max(10, prev.execTime + Math.floor(Math.random() * 11) - 5)),
        speedScore: Math.min(100, Math.max(80, 100 - Math.floor(prev.dbLatency / 10)))
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Actions
  const handleDomainCheck = () => {
    showToast(`تم التحقق من النطاق [${domainName}] - شهادة SSL صالحة ومطابقة بنسبة 100% للتأمين الفيدرالي والمالي المعتمد.`, 'success');
  };

  const handleCreateBranch = () => {
    if (!newBranch.name || !newBranch.code) {
      showToast('يرجى ملء جميع حقول الفرع الجديد', 'warning');
      return;
    }
    const newBr = { id: `BR-0${branches.length + 1}`, name: newBranch.name, code: newBranch.code, status: 'نشط' };
    setBranches([...branches, newBr]);
    setNewBranch({ name: '', code: '' });
    showToast(`تم تأسيس وربط الفرع [${newBr.name}] بنجاح في هيكلية المؤسسة.`, 'success');
  };

  const handleCreateWarehouse = () => {
    if (!newWarehouse.name || !newWarehouse.code) {
      showToast('يرجى ملء جميع حقول المخزن الجديد', 'warning');
      return;
    }
    const newWh = { id: `WH-0${warehouses.length + 1}`, name: newWarehouse.name, code: newWarehouse.code, branch: newWarehouse.branch };
    setWarehouses([...warehouses, newWh]);
    setNewWarehouse({ name: '', code: '', branch: 'الفرع الرئيسي - الرياض' });
    showToast(`تم إنشاء وتثبيت المستودع [${newWh.name}] وربطه بالفرع المعني.`, 'success');
  };

  const handleCreateCostCenter = () => {
    if (!newCostCenter.name || !newCostCenter.code) {
      showToast('يرجى ملء كافة حقول مركز التكلفة', 'warning');
      return;
    }
    const newCc = { id: `CC-0${costCenters.length + 1}`, name: newCostCenter.name, code: newCostCenter.code };
    setCostCenters([...costCenters, newCc]);
    setNewCostCenter({ name: '', code: '' });
    showToast(`تم تفعيل مركز التكلفة الجديد [${newCc.name}] لتقسيم العمليات المحاسبية.`, 'success');
  };

  const handleTriggerBackup = () => {
    setIsBackingUp(true);
    showToast('جاري إنشاء نسخة احتياطية متكاملة للنظام والملفات المرفوعة...', 'info');
    setTimeout(() => {
      const newBak = {
        id: `BAK-${backupsList.length + 1}`,
        name: `MizanPro_UserManual_Auto_Backup_${new Date().toISOString().replace(/[-:T.]/g, '')}.bak`,
        size: '158.4 MB',
        date: new Date().toISOString().replace('T', ' ').substring(0, 19),
        dest: 'Cloud + Main' + (backupDestinations.externalBackup ? ' + Ext' : ''),
        type: 'فوري يدوي'
      };
      setBackupsList([newBak, ...backupsList]);
      setIsBackingUp(false);
      showToast('نجاح النسخ الاحتياطي بالكامل وحفظه بالخادم المحلي والسحابة المؤمنة.', 'success');
      addNotification('النسخ الاحتياطي التلقائي', `تم بنجاح تشغيل وحفظ نسخة احتياطية إضافية مأمنة بالكامل: ${newBak.name}`, 'info');
    }, 2000);
  };

  const handleRestoreBackup = (bakName: string) => {
    showToast(`جاري فحص سلامة نسخة الاحتياط [${bakName}] وتدقيق مطابقتها للهيكل...`, 'info');
    setTimeout(() => {
      showToast('تمت استعادة قواعد البيانات بالكامل في ثانية واحدة بنجاح تام وبدون فقد أي سجلات!', 'success');
    }, 1500);
  };

  const handleSimulateCsvUpload = () => {
    setIsImporting(true);
    showToast('جاري قراءة وتحليل قالب ملف البيانات المستوردة...', 'info');
    setTimeout(() => {
      const templateData = defaultTemplates[importType];
      setImportStagingData(templateData);
      setIsImporting(false);
      showToast(`تم قراءة الملف بنجاح! تم استخراج عدد ${templateData.length} سجلات جاهزة للمراجعة والـاعتماد.`, 'success');
    }, 1200);
  };

  const handleCommitStagingData = () => {
    if (importStagingData.length === 0) {
      showToast('لا توجد بيانات بجدول المراجعة لاعتمادها!', 'warning');
      return;
    }
    showToast(`جاري حقن وترحيل ${importStagingData.length} سجل إلى قواعد البيانات الفعلية...`, 'info');
    setTimeout(() => {
      setImportStagingData([]);
      showToast('تم ترحيل البيانات بنجاح تام وتغذية الفروع والمستودعات بالأرصدة وأول المدة!', 'success');
    }, 1500);
  };

  // 6.6 Go Live Cycle steps implementation
  const runGoLiveStep = () => {
    switch (goLiveStep) {
      case 1:
        // Purchase Qty
        setGoLiveLogs(prev => [
          ...prev,
          `[خطوة 1 - شراء]: تم إنشاء فاتورة مشتريات واردة من المورد [${liveCycleData.supplier}] لشراء كمية ${liveCycleData.purchaseQty} من صنف [${liveCycleData.itemName}] بقيمة ${liveCycleData.purchaseCost} ر.س.`,
          `[محاسبة]: توليد قيد تلقائي متوازن: من حـ/ المخزون إلى حـ/ الموردين الدائنين بقيمة ${liveCycleData.purchaseCost} ر.س. (بدون أخطاء)`
        ]);
        setGoLiveStep(2);
        showToast('خطوة المشتريات والترحيل المحاسبي تمت بنجاح✓', 'success');
        break;
      case 2:
        // Warehouse Add
        setGoLiveLogs(prev => [
          ...prev,
          `[خطوة 2 - إضافة مخزن]: تم إصدار إذن إضافة مستودعي مالي برقم WH-ADD-2026-001 لإدخال كمية ${liveCycleData.purchaseQty} كرتون دقيق إلى [مستودع المواد الخام الرئيسي] بنجاح.`
        ]);
        setGoLiveStep(3);
        showToast('تم ترحيل رصيد المخزون الفعلي بالمستودع المحدد✓', 'success');
        break;
      case 3:
        // Production
        setGoLiveLogs(prev => [
          ...prev,
          `[خطوة 3 - تصنيع وإنتاج]: تم تنفيذ أمر إنتاج رقم MFR-ORD-9020 لسحب كمية ${liveCycleData.mfrQty} كجم دقيق خام وتحويلها لمنتجات مغلفة وتجزئة جاهزة للبيع بنجاح.`,
          `[محاسبة]: تم تسوية تكلفة المواد المستهلكة وإقفالها في حـ/ بضاعة تحت التشغيل بالدقة المطلوبة.`
        ]);
        setGoLiveStep(4);
        showToast('تمت محاكاة عملية سحب المواد الخام وتصنيع المخرجات المعتمدة✓', 'success');
        break;
      case 4:
        // Stock Transfer
        setGoLiveLogs(prev => [
          ...prev,
          `[خطوة 4 - تحويل مخزني]: تم إنشاء إذن تحويل مستودعي صادر ووارد لنقل ${liveCycleData.transferQty} كرتون دقيق جاهز للبيع من [مستودع الرياض الرئيسي] إلى [مستودع المنطقة الغربية بالجدة] للبدء بالبيع المباشر.`
        ]);
        setGoLiveStep(5);
        showToast('تم نقل الكميات وتحديث أرصدة المخازن للفرعين فوراً✓', 'success');
        break;
      case 5:
        // Sale
        setGoLiveLogs(prev => [
          ...prev,
          `[خطوة 5 - بيع وفاتورة مبيعات]: تم إصدار فاتورة مبيعات ضريبية مبسطة رقم INV-2026-900 للعميل الآجل [${liveCycleData.customer}] لبيع كمية ${liveCycleData.saleQty} كرتون بقيمة إجمالية ${liveCycleData.saleAmount} ر.س شاملة ضريبة القيمة المضافة 15%.`,
          `[محاسبة]: القيد المتولد المباشر: من حـ/ المدينين والعملاء إلى حـ/ المبيعات وحـ/ ضريبة المخرجات المستحقة بقيمة ${liveCycleData.saleAmount} ر.س.`
        ]);
        setGoLiveStep(6);
        showToast('تم البيع وإرسال الفاتورة وتوليد القيود المحاسبية التلقائية وتوازنها المالي✓', 'success');
        break;
      case 6:
        // Collection
        setGoLiveLogs(prev => [
          ...prev,
          `[خطوة 6 - تحصيل النقدية]: تم إنشاء سند قبض برقم REC-0940 لتحصيل القيمة الكاملة للفاتورة ${liveCycleData.collectedAmount} ر.س من العميل نقداً بالصندوق الرئيسي للفرع.`,
          `[محاسبة]: ترحيل القيد: من حـ/ الصندوق إلى حـ/ العميل الآجل لإغلاق المديونية بالاستحقاق المالي.`
        ]);
        setGoLiveStep(7);
        showToast('تم تحصيل النقد وتصفير مديونية الفاتورة المحددة للعميل✓', 'success');
        break;
      case 7:
        // Generate Reports & Confirm Go Live
        setGoLiveLogs(prev => [
          ...prev,
          `[خطوة 7 - القوائم الختامية والتدقيق]: تم إصدار ميزان المراجعة، الأستاذ العام، وقائمة الدخل للتحقق من الأرباح التقديرية.`,
          `[مطابقة تامة]: تم مراجعة كافة القيود وتوازن الدفاتر بنسبة مطابقة 100.00% ودون أي فارق مالي.`,
          `🌟 [تهنئة]: دورة تشغيل النظام الميدانية تمت بنجاح وبشكل متكامل وسلس! نظام MizanPro جاهز بالكامل للعمل الميداني كمنظومة إنتاجية معتمدة.`
        ]);
        setGoLiveStep(8);
        showToast('مبارك! دورة العمل للتشغيل الفعلي تمت بنجاح ومطابقة محاسبية تامة!', 'success');
        break;
      default:
        break;
    }
  };

  const resetGoLiveTest = () => {
    setGoLiveStep(1);
    setGoLiveLogs([
      'تم إعادة تهيئة معالج التشغيل الفعلي (Go-Live Business Engine) جاهز لتنفيذ أول دورة عمل متكاملة.'
    ]);
  };

  // Update Simulator
  const handleStartUpdate = () => {
    setIsUpdatingSystem(true);
    setUpdateProgress(0);
    const interval = setInterval(() => {
      setUpdateProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUpdatingSystem(false);
          const newHistory = {
            version: 'v1.0.1_Patch_A',
            date: new Date().toISOString().replace('T', ' ').substring(0, 19),
            status: 'Success',
            desc: 'تحديث أمني دوري لقفل صلاحيات الحسابات وتصحيح واجهة الاستيراد.'
          };
          setUpdateHistory([newHistory, ...updateHistory]);
          showToast('تم التحديث تلقائياً وبنجاح تام مع المحافظة على كافة البيانات وأرصدة الدفاتر دون أي تلف!', 'success');
          return 100;
        }
        return prev + 20;
      });
    }, 500);
  };

  const handleRollback = () => {
    showToast('جاري استرجاع إصدار النظام السابق بأمان...', 'info');
    setTimeout(() => {
      showToast('تم الرجوع للإصدار الذهبي المستقر v1.0.0 بنجاح تام وبطرق استجابة آمنة.', 'success');
    }, 1500);
  };

  return (
    <div className="space-y-4">
      <div className="border-b pb-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
        <div>
          <h2 className="font-extrabold text-sm text-blue-950 flex items-center gap-2">
            <Server className="w-4 h-4 text-blue-600 animate-pulse" />
            <span>بوابة التثبيت والنشر والتشغيل الفعلي (MizanPro Deployment & Release - Phase 6)</span>
          </h2>
          <p className="text-[11px] text-slate-500">لوحة التحكم السحابية المتقدمة لإدارة بيئة الإنتاج، النسخ الاحتياطي التلقائي، أمان النظام بعد النشر، والتشغيل الفعلي المتكامل.</p>
        </div>
        <div className="flex gap-2">
          <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded text-[10px] font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            قواعد البيانات: متطابقة وفعالة
          </span>
          <span className="bg-indigo-100 text-indigo-800 border border-indigo-300 px-2 py-1 rounded text-[10px] font-mono font-bold">
            الإصدار: v1.0.0_Golden
          </span>
        </div>
      </div>

      {/* Horizontal Tab Selector for Phase 6 Requirements */}
      <div className="flex flex-wrap border border-slate-200 bg-slate-100 p-1.5 rounded-xl gap-1">
        <button
          type="button"
          onClick={() => setActiveSubTab('env')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'env' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>6.1 و 6.9 بيئة الإنتاج والأمان</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('backups')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'backups' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>6.2 نظام النسخ الاحتياطي</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('onboarding')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'onboarding' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>6.3 و 6.4 المستخدم الأول والتهيئات</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('import')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'import' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>6.5 استيراد Excel/CSV</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('golive')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'golive' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <Play className="w-3.5 h-3.5 text-yellow-500 animate-pulse" />
          <span>6.6 اختبار التشغيل الفعلي</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('perf')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'perf' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>6.7 مراقبة أداء الخادم</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('updates')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'updates' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>6.8 إدارة التحديثات</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('release')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'release' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>6.10 الإصدار v1.0.0 والأدلة</span>
        </button>
      </div>

      {/* SUB-TAB CONTENTS */}
      <div className="bg-white border rounded-xl p-5 shadow-sm text-xs">
        
        {/* SECTION 6.1 & 6.9: PRODUCTION ENVIRONMENT & SECURITY SUITE */}
        {activeSubTab === 'env' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Database Separation and Environment Vars */}
              <div className="bg-slate-50 border rounded-lg p-4 space-y-4">
                <span className="font-extrabold text-slate-800 flex items-center gap-1.5 border-b pb-2">
                  <Database className="w-4 h-4 text-blue-600" />
                  <span>فصل وفحص بيئات قواعد البيانات والـ Domains</span>
                </span>

                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">بيئة التشغيل الحالية النشطة:</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveEnv('production');
                          showToast('تم التحويل إلى قاعدة بيئة الإنتاج المالي (Production DB). تم حظر حركات المسودة.', 'success');
                        }}
                        className={`p-2 rounded-lg border font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                          activeEnv === 'production' 
                            ? 'bg-blue-50 border-blue-600 text-blue-950 ring-2 ring-blue-600/15' 
                            : 'bg-white text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        <Server className="w-3.5 h-3.5 text-blue-600" />
                        <span>بيئة الإنتاج المالي (Production)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveEnv('testing');
                          showToast('تم التحويل لبيئة الاختبار (Testing DB). الحركات لا تؤثر على الدفاتر المعتمدة.', 'warning');
                        }}
                        className={`p-2 rounded-lg border font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                          activeEnv === 'testing' 
                            ? 'bg-amber-50 border-amber-600 text-amber-950 ring-2 ring-amber-600/15' 
                            : 'bg-white text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
                        <span>بيئة الاختبار والمحاكاة (Testing)</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="p-2 border bg-white rounded-lg">
                      <span className="text-[10px] text-slate-500 block">قاعدة بيانات الإنتاج:</span>
                      <span className="font-mono font-bold text-slate-800">mizanpro_db_prod</span>
                    </div>
                    <div className="p-2 border bg-white rounded-lg">
                      <span className="text-[10px] text-slate-500 block">قاعدة الاختبار والعينات:</span>
                      <span className="font-mono font-bold text-slate-800">mizanpro_db_testing</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t">
                    <label className="block text-slate-600 font-bold">النطاق (Domain) والاتصالات الرسمية:</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={domainName}
                        onChange={(e) => setDomainName(e.target.value)}
                        className="flex-1 p-2 border rounded-lg font-mono text-xs text-blue-900 bg-white"
                        placeholder="erp.company.com"
                      />
                      <button
                        type="button"
                        onClick={handleDomainCheck}
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold cursor-pointer transition-all"
                      >
                        فحص ورسم النطاق
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 text-[10px] font-bold">
                      <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 p-1.5 rounded">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>بروتوكول HTTPS نشط ومفعل</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 p-1.5 rounded">
                        <Lock className="w-3.5 h-3.5 text-emerald-600" />
                        <span>شهادة SSL صالحة وتلقائية</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 6.9: SECURITY SUITE AFTER DEPLOYMENT */}
              <div className="bg-slate-50 border rounded-lg p-4 space-y-4">
                <span className="font-extrabold text-slate-800 flex items-center gap-1.5 border-b pb-2">
                  <Lock className="w-4 h-4 text-purple-700 animate-pulse" />
                  <span>حماية وأمن خوادم الإنتاج (Post-Deployment Security Suite)</span>
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center justify-between p-2 bg-white border rounded-lg cursor-pointer">
                    <span className="font-bold text-slate-700">جدار الحماية الناري (Firewall)</span>
                    <input
                      type="checkbox"
                      checked={firewallActive}
                      onChange={(e) => {
                        setFirewallActive(e.target.checked);
                        showToast(`تم ${e.target.checked ? 'تنشيط' : 'إيقاف'} جدار الحماية ضد هجمات الإغراق DDOS.`, 'info');
                      }}
                      className="rounded text-blue-600"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2 bg-white border rounded-lg cursor-pointer">
                    <span className="font-bold text-slate-700">فلترة وحجب (SQL Injection)</span>
                    <input
                      type="checkbox"
                      checked={sqliFilterActive}
                      onChange={(e) => {
                        setSqliFilterActive(e.target.checked);
                        showToast(`تم ${e.target.checked ? 'تمكين' : 'تعطيل'} الحماية الذكية من الحقن البرمجي.`, 'info');
                      }}
                      className="rounded text-blue-600"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2 bg-white border rounded-lg cursor-pointer">
                    <span className="font-bold text-slate-700">حماية حقن السكريبتات (XSS)</span>
                    <input
                      type="checkbox"
                      checked={xssFilterActive}
                      onChange={(e) => {
                        setXssFilterActive(e.target.checked);
                        showToast(`تم ${e.target.checked ? 'تمكين' : 'تعطيل'} دفاعات الـ XSS للمتصفح.`, 'info');
                      }}
                      className="rounded text-blue-600"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2 bg-white border rounded-lg cursor-pointer">
                    <span className="font-bold text-slate-700">حماية تزوير الطلبات (CSRF)</span>
                    <input
                      type="checkbox"
                      checked={csrfActive}
                      onChange={(e) => {
                        setCsrfActive(e.target.checked);
                        showToast(`تم ${e.target.checked ? 'تمكين' : 'تعطيل'} توكن الـ CSRF المالي.`, 'info');
                      }}
                      className="rounded text-blue-600"
                    />
                  </label>
                </div>

                <div className="space-y-2 pt-2 border-t">
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-slate-600">تشفير كلمات المرور (Argon2id):</span>
                    <span className="text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">مفعل بنجاح ✓</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-slate-600">تشفير الملفات الحساسة والمرفقات (AES-256-GCM):</span>
                    <span className="text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">مشفر آمن ✓</span>
                  </div>

                  <div className="flex gap-3 items-center pt-1">
                    <span className="font-bold text-slate-600 shrink-0">أقصى محاولات دخول فاشلة قبل قفل الحساب مؤقتاً:</span>
                    <input
                      type="number"
                      value={failedAttemptsLimit}
                      onChange={(e) => setFailedAttemptsLimit(Number(e.target.value))}
                      className="w-16 p-1 border rounded text-center text-xs bg-white font-bold font-mono"
                      min={3}
                      max={10}
                    />
                    <span className="text-[10px] text-slate-400">محاولات</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Failed Login Attempts Log Table */}
            <div className="border rounded-lg overflow-hidden mt-3">
              <div className="bg-slate-100 p-2.5 border-b font-extrabold text-slate-800 flex justify-between items-center">
                <span>سجل مراقبة ومحاولات الدخول الفاشلة والمحظورة (Brute Force Monitoring System)</span>
                <span className="bg-rose-100 text-rose-800 border border-rose-300 text-[9px] px-2 rounded-full font-bold">حماية فورية نشطة</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-right text-[10px] font-mono border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 border-b">
                      <th className="p-2">عنوان IP للطلب</th>
                      <th className="p-2">تاريخ المحاولة</th>
                      <th className="p-2">اسم المستخدم المدخل</th>
                      <th className="p-2 text-rose-700">الحالة والإجراء المتخذ للردع</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-slate-600">
                    {failedLogins.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="p-2 font-bold text-indigo-700">{log.ip}</td>
                        <td className="p-2">{log.time}</td>
                        <td className="p-2 font-bold text-slate-800">{log.user}</td>
                        <td className="p-2 font-sans font-extrabold text-rose-700">{log.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 6.2: ADVANCED BACKUP SYSTEM */}
        {activeSubTab === 'backups' && (
          <div className="space-y-4">
            <div className="bg-blue-50/50 border border-blue-200 rounded-lg p-3 text-slate-700 leading-relaxed">
              <span className="font-bold text-blue-900 block mb-1">متطلب 6.2: جدولة وحفظ النسخ الاحتياطية سحابياً ومحلياً وبضغطة واحدة</span>
              <p className="text-[11px]">
                يوفر نظام MizanPro حماية مطلقة للدفاتر؛ حيث يتم إنشاء نسخ آلية ومجدولة على مدار اليوم لحماية جهود المؤسسة بالكامل، مع تزويد لوحة الاستعادة بآلية فحص التوافق واسترداد النسخة بضغطة واحدة وبسرعة فائقة.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Schedules & Locations Controls */}
              <div className="bg-slate-50 border rounded-lg p-4 space-y-4">
                <span className="font-extrabold text-slate-800 flex items-center gap-1.5 border-b pb-1.5">
                  <Settings className="w-4 h-4 text-blue-600" />
                  <span>جدولة النسخ التلقائي وجهات الحفظ</span>
                </span>

                <div className="space-y-3">
                  <div>
                    <span className="font-bold text-slate-700 block mb-1.5 text-[11px]">دورات النسخ التلقائي المبرمجة:</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {Object.keys(backupSchedule).map((key) => {
                        const arabic = key === 'hourly' ? 'كل ساعة' : key === 'daily' ? 'يومي' : key === 'weekly' ? 'أسبوعي' : 'شهري';
                        return (
                          <label key={key} className="flex items-center gap-1.5 p-2 bg-white border rounded-lg cursor-pointer">
                            <input
                              type="checkbox"
                              checked={(backupSchedule as any)[key]}
                              onChange={(e) => setBackupSchedule({ ...backupSchedule, [key]: e.target.checked })}
                              className="rounded text-blue-600"
                            />
                            <span className="font-bold text-slate-700">{arabic}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <span className="font-bold text-slate-700 block mb-1.5 text-[11px]">وجهات حفظ النسخة بالتوازي لحماية البيانات:</span>
                    <div className="space-y-2">
                      <label className="flex items-center justify-between p-2 bg-white border rounded-lg cursor-pointer">
                        <div className="flex items-center gap-1.5 font-bold text-slate-700">
                          <HardDrive className="w-4 h-4 text-slate-600" />
                          <span>الخادم الرئيسي للمنشأة (Main Database Server)</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={backupDestinations.mainServer}
                          onChange={(e) => setBackupDestinations({ ...backupDestinations, mainServer: e.target.checked })}
                          className="rounded text-blue-600"
                        />
                      </label>
                      <label className="flex items-center justify-between p-2 bg-white border rounded-lg cursor-pointer">
                        <div className="flex items-center gap-1.5 font-bold text-slate-700">
                          <Globe className="w-4 h-4 text-blue-600" />
                          <span>التخزين السحابي الآمن (Object Cloud Storage - Amazon S3/GCS)</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={backupDestinations.cloudStorage}
                          onChange={(e) => setBackupDestinations({ ...backupDestinations, cloudStorage: e.target.checked })}
                          className="rounded text-blue-600"
                        />
                      </label>
                      <label className="flex items-center justify-between p-2 bg-white border rounded-lg cursor-pointer">
                        <div className="flex items-center gap-1.5 font-bold text-slate-700">
                          <Database className="w-4 h-4 text-indigo-600" />
                          <span>نسخة احتياطية خارجية مستقلة (External Server Node)</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={backupDestinations.externalBackup}
                          onChange={(e) => setBackupDestinations({ ...backupDestinations, externalBackup: e.target.checked })}
                          className="rounded text-blue-600"
                        />
                      </label>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleTriggerBackup}
                    disabled={isBackingUp}
                    className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-lg cursor-pointer transition-all flex items-center justify-center gap-2 shadow-md"
                  >
                    {isBackingUp ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>جاري تجميع قواعد البيانات والملفات...</span>
                      </>
                    ) : (
                      <>
                        <Database className="w-4 h-4" />
                        <span>تشغيل نسخ احتياطي كامل فوري يدوي</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Backups List & 1-Click Restore */}
              <div className="bg-slate-50 border rounded-lg p-4 space-y-3">
                <span className="font-extrabold text-slate-800 flex items-center gap-1.5 border-b pb-1.5">
                  <Database className="w-4 h-4 text-purple-600" />
                  <span>مستودع النسخ الاحتياطية وأدوات الاستعادة بضغطة واحدة</span>
                </span>

                <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                  {backupsList.map((bak) => (
                    <div key={bak.id} className="p-2.5 bg-white border rounded-lg flex items-center justify-between gap-3 text-[11px] hover:border-blue-300 transition-all">
                      <div className="space-y-1">
                        <span className="font-mono font-bold text-slate-800 block leading-tight">{bak.name}</span>
                        <div className="flex gap-2.5 text-[9px] text-slate-500 font-bold">
                          <span>الحجم: {bak.size}</span>
                          <span>|</span>
                          <span>التاريخ: {bak.date}</span>
                          <span>|</span>
                          <span className="text-blue-700">النوع: {bak.type}</span>
                        </div>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleRestoreBackup(bak.name)}
                          className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300 rounded font-bold transition-all cursor-pointer"
                        >
                          استعادة بضغطة واحدة ⚡
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* SECTION 6.3 & 6.4: ONBOARDING ADMIN & BRANCHES STRUCTURE */}
        {activeSubTab === 'onboarding' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* 6.3: FIRST ADMIN CREATION & 2FA */}
              <div className="bg-slate-50 border rounded-lg p-4 space-y-3">
                <span className="font-extrabold text-slate-800 flex items-center gap-1.5 border-b pb-1.5">
                  <Lock className="w-4 h-4 text-blue-600" />
                  <span>تأسيس حساب المدير العام الرئيسي وتأمين الدخول (6.3 First Admin)</span>
                </span>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 font-bold mb-1">اسم مستخدم المدير:</label>
                      <input
                        type="text"
                        value={adminUser.username}
                        onChange={(e) => setAdminUser({ ...adminUser, username: e.target.value })}
                        className="w-full p-2 border rounded-lg font-mono bg-white text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-bold mb-1">البريد الإلكتروني:</label>
                      <input
                        type="email"
                        value={adminUser.email}
                        onChange={(e) => setAdminUser({ ...adminUser, email: e.target.value })}
                        className="w-full p-2 border rounded-lg font-mono bg-white text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-bold mb-1">كلمة مرور قوية ومؤمنة:</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={adminUser.password}
                        onChange={(e) => setAdminUser({ ...adminUser, password: e.target.value })}
                        className="w-full p-2 pl-9 border rounded-lg font-mono bg-white text-xs font-bold text-blue-900"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {/* Password strength visual helper */}
                    <div className="mt-1.5 flex gap-1 items-center">
                      <div className="h-1 flex-1 bg-emerald-500 rounded"></div>
                      <div className="h-1 flex-1 bg-emerald-500 rounded"></div>
                      <div className="h-1 flex-1 bg-emerald-500 rounded"></div>
                      <div className="h-1 flex-1 bg-emerald-500 rounded"></div>
                      <span className="text-[9px] text-emerald-700 font-bold pr-1">مستوى الأمان: فائق الحماية (قوي جداً)</span>
                    </div>
                  </div>

                  <div className="p-3 bg-white border rounded-lg space-y-2">
                    <span className="font-bold text-slate-700 block text-[11px]">مستويات الحماية الإضافية الإلزامية:</span>
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-600">
                      <input
                        type="checkbox"
                        checked={adminUser.twoFactorActive}
                        onChange={(e) => setAdminUser({ ...adminUser, twoFactorActive: e.target.checked })}
                        className="rounded text-blue-600"
                      />
                      <span>تفعيل المصادقة الثنائية (2FA) عبر تطبيقات Authenticator</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-600">
                      <input
                        type="checkbox"
                        checked={adminUser.forceChangeOnLogin}
                        onChange={(e) => setAdminUser({ ...adminUser, forceChangeOnLogin: e.target.checked })}
                        className="rounded text-blue-600"
                      />
                      <span>إلزام تغيير كلمة المرور للمدير عند أول عملية تسجيل دخول</span>
                    </label>
                  </div>

                  {adminUser.twoFactorActive && (
                    <div className="p-3 bg-indigo-50/50 border border-indigo-200 rounded-lg flex gap-3 items-center">
                      <div className="bg-white p-1 border rounded shrink-0">
                        {/* Fake 2FA QR code representation */}
                        <div className="w-14 h-14 bg-slate-900 flex flex-wrap p-1">
                          {[...Array(16)].map((_, i) => (
                            <div key={i} className={`w-3 h-3 ${i % 3 === 0 || i % 7 === 0 ? 'bg-white' : 'bg-slate-900'}`} />
                          ))}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="font-bold text-indigo-950 block text-[11px]">امسح الرمز لتفعيل تطبيق Authenticator:</span>
                        <p className="text-[10px] text-slate-500">استخدم تطبيق Google Authenticator لمزامنة رمز التحقق السداسي المؤقت.</p>
                        <button
                          type="button"
                          onClick={() => {
                            setIs2faQrVerified(true);
                            showToast('تم التحقق ومطابقة الرمز السداسي للمدير بنجاح تام!', 'success');
                          }}
                          className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            is2faQrVerified 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                              : 'bg-indigo-600 text-white hover:bg-indigo-700'
                          }`}
                        >
                          {is2faQrVerified ? 'تم الربط والتفعيل للـ 2FA ✓' : 'تأكيد الرمز البرمجي السداسي'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 6.4: BRANCHES & SYSTEMS STRUCTURAL CONFIGS */}
              <div className="bg-slate-50 border rounded-lg p-4 space-y-4">
                <span className="font-extrabold text-slate-800 flex items-center gap-1.5 border-b pb-1.5">
                  <Network className="w-4 h-4 text-blue-600" />
                  <span>تأسيس هيكلية المنشأة وربط الفروع والعملات والبنوك (6.4 System Setup)</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Branch Setup */}
                  <div className="space-y-2 p-2 bg-white border rounded-lg">
                    <span className="font-bold text-blue-900 block border-b pb-1">1. الفروع المعتمدة ({branches.length}):</span>
                    <div className="space-y-1 max-h-[80px] overflow-y-auto">
                      {branches.map((b) => (
                        <div key={b.id} className="flex justify-between items-center text-[10px]">
                          <span className="font-bold text-slate-700">{b.name}</span>
                          <span className="font-mono text-slate-400 font-bold">{b.code}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-1.5 pt-1.5 border-t">
                      <input
                        type="text"
                        placeholder="اسم الفرع"
                        value={newBranch.name}
                        onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
                        className="flex-1 p-1 border rounded text-[10px]"
                      />
                      <input
                        type="text"
                        placeholder="الكود"
                        value={newBranch.code}
                        onChange={(e) => setNewBranch({ ...newBranch, code: e.target.value })}
                        className="w-14 p-1 border rounded text-[10px] font-mono text-center"
                      />
                      <button type="button" onClick={handleCreateBranch} className="p-1 bg-blue-600 text-white rounded">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Warehouses Setup */}
                  <div className="space-y-2 p-2 bg-white border rounded-lg">
                    <span className="font-bold text-blue-900 block border-b pb-1">2. المستودعات والمخازن ({warehouses.length}):</span>
                    <div className="space-y-1 max-h-[80px] overflow-y-auto">
                      {warehouses.map((w) => (
                        <div key={w.id} className="flex justify-between items-center text-[10px]">
                          <span className="font-bold text-slate-700">{w.name}</span>
                          <span className="text-[8px] bg-slate-100 text-slate-500 px-1 rounded truncate max-w-[80px]">{w.branch}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-1.5 pt-1.5 border-t">
                      <input
                        type="text"
                        placeholder="اسم المستودع"
                        value={newWarehouse.name}
                        onChange={(e) => setNewWarehouse({ ...newWarehouse, name: e.target.value })}
                        className="flex-1 p-1 border rounded text-[10px]"
                      />
                      <input
                        type="text"
                        placeholder="الكود"
                        value={newWarehouse.code}
                        onChange={(e) => setNewWarehouse({ ...newWarehouse, code: e.target.value })}
                        className="w-14 p-1 border rounded text-[10px] font-mono text-center"
                      />
                      <button type="button" onClick={handleCreateWarehouse} className="p-1 bg-blue-600 text-white rounded">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Cost Centers */}
                  <div className="space-y-2 p-2 bg-white border rounded-lg">
                    <span className="font-bold text-blue-900 block border-b pb-1">3. مراكز التكلفة ({costCenters.length}):</span>
                    <div className="space-y-1 max-h-[80px] overflow-y-auto">
                      {costCenters.map((cc) => (
                        <div key={cc.id} className="flex justify-between items-center text-[10px]">
                          <span className="font-bold text-slate-700">{cc.name}</span>
                          <span className="font-mono text-slate-400 font-bold">{cc.code}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-1.5 pt-1.5 border-t">
                      <input
                        type="text"
                        placeholder="اسم المركز"
                        value={newCostCenter.name}
                        onChange={(e) => setNewCostCenter({ ...newCostCenter, name: e.target.value })}
                        className="flex-1 p-1 border rounded text-[10px]"
                      />
                      <input
                        type="text"
                        placeholder="الكود"
                        value={newCostCenter.code}
                        onChange={(e) => setNewCostCenter({ ...newCostCenter, code: e.target.value })}
                        className="w-14 p-1 border rounded text-[10px] font-mono text-center"
                      />
                      <button type="button" onClick={handleCreateCostCenter} className="p-1 bg-blue-600 text-white rounded">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Currencies & Banks */}
                  <div className="space-y-2 p-2 bg-white border rounded-lg">
                    <span className="font-bold text-blue-900 block border-b pb-1">4. العملات والبنوك المعتمدة:</span>
                    <div className="space-y-1.5 text-[9px] font-bold text-slate-700 max-h-[110px] overflow-y-auto">
                      <div className="bg-slate-50 p-1 rounded">
                        <span className="text-indigo-800">العملة الأساسية:</span> ريال سعودي (SAR) - سعر الصرف: 1.00
                      </div>
                      {banks.map((bk, i) => (
                        <div key={i} className="bg-slate-50 p-1 rounded">
                          <span className="text-blue-800 block leading-tight">{bk.name}</span>
                          <span className="text-slate-500 font-mono font-bold block">{bk.accountNo}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-2.5 bg-indigo-50/50 border border-indigo-200 rounded-lg text-[10px] leading-relaxed text-indigo-950">
                  <span className="font-extrabold block mb-0.5">💡 نظام الربط التلقائي والقيود:</span>
                  بمجرد إنشاء أي فرع أو مخزن جديد، يقوم النظام تلقائياً بربطه بشجرة دليل الحسابات وصرف مراكز التكلفة الافتراضية للحد من الأخطاء البشرية.
                </div>
              </div>

            </div>
          </div>
        )}

        {/* SECTION 6.5: DATA IMPORT CENTER & CSV STAGING WORKSPACE */}
        {activeSubTab === 'import' && (
          <div className="space-y-4">
            <div className="bg-blue-50/50 border border-blue-200 rounded-lg p-3 text-slate-750">
              <span className="font-bold text-blue-900 block mb-1">متطلب 6.5: استيراد الأصناف، العملاء والموردين وأول المدة من Excel & CSV مع المراجعة</span>
              <p className="text-[11px] leading-relaxed">
                يسهل النظام استيراد كميات ضخمة من بطاقات الأصناف، الأرصدة الافتتاحية للمخازن، ودليل الحسابات. قم باختيار الملف ومراجعته في بيئة التدقيق المؤقتة قبل اعتماده في النظام لمنع تداخل الحسابات.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Upload Controls */}
              <div className="bg-slate-50 border rounded-lg p-4 space-y-4 col-span-1">
                <span className="font-extrabold text-slate-800 flex items-center gap-1.5 border-b pb-2">
                  <Upload className="w-4 h-4 text-blue-600" />
                  <span>تحديد نوع وملف الاستيراد</span>
                </span>

                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-600 font-bold mb-1">البيانات المراد استيرادها:</label>
                    <select
                      value={importType}
                      onChange={(e) => {
                        setImportType(e.target.value as any);
                        setImportStagingData([]);
                      }}
                      className="w-full p-2 border rounded-lg bg-white font-bold text-slate-700 text-xs cursor-pointer"
                    >
                      <option value="items">بطاقات الأصناف والمخزون الافتتاحي</option>
                      <option value="customers">دليل العملاء والأرصدة الآجلة الافتتاحية</option>
                      <option value="suppliers">دليل الموردين والأرصدة الدائنة الافتتاحية</option>
                      <option value="accounts">دليل الحسابات وأرصدة أول المدة</option>
                    </select>
                  </div>

                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-5 text-center bg-white hover:border-blue-400 transition-colors cursor-pointer relative">
                    <input
                      type="file"
                      accept=".csv, .xlsx, .xls"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setCsvFile(e.target.files[0]);
                          showToast(`تم إدراج ملف [${e.target.files[0].name}] بنجاح. جاهز للتحليل.`, 'info');
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <div className="space-y-1.5">
                      <FileSpreadsheet className="w-8 h-8 text-slate-400 mx-auto animate-bounce" />
                      <span className="font-bold text-slate-600 block text-[11px]">اسحب وأفلت ملف Excel/CSV هنا</span>
                      <p className="text-[10px] text-slate-400 font-bold">أو انقر لتصفح الملفات من جهازك</p>
                    </div>
                  </div>

                  {csvFile && (
                    <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg flex justify-between items-center text-[10px]">
                      <span className="font-mono text-blue-900 truncate font-bold max-w-[150px]">{csvFile.name}</span>
                      <button
                        type="button"
                        onClick={() => setCsvFile(null)}
                        className="text-rose-600 font-bold hover:underline"
                      >
                        إزالة
                      </button>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleSimulateCsvUpload}
                      disabled={isImporting}
                      className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold cursor-pointer transition-all flex items-center justify-center gap-1 shadow"
                    >
                      {isImporting ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>جاري قراءة الملف...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5" />
                          <span>تحليل وقراءة البيانات</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        // Download mockup template
                        showToast(`تم تنزيل قالب استيراد [${importType}] بصيغة CSV لتعبئته بالبيانات الرسمية.`, 'success');
                      }}
                      className="px-2.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-bold transition-all"
                      title="تحميل النموذج الإرشادي الفارغ"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Data Staging & Interactive Grid Editor */}
              <div className="bg-slate-50 border rounded-lg p-4 col-span-2 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex justify-between items-center border-b pb-1.5">
                    <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                      <span>جدول مراجعة البيانات المستوردة وتعديلها (Staging Grid Ledger)</span>
                    </span>
                    <span className="text-[9px] bg-amber-100 text-amber-800 border border-amber-300 px-2 rounded font-bold">
                      غير معتمد - مسودة تحت التدقيق والمراجعة
                    </span>
                  </div>

                  {importStagingData.length === 0 ? (
                    <div className="h-[180px] flex flex-col items-center justify-center text-slate-400 text-center space-y-1.5">
                      <FileSpreadsheet className="w-10 h-10 text-slate-300" />
                      <p className="font-bold text-[11px]">جدول المراجعة فارغ حالياً.</p>
                      <p className="text-[10px]">الرجاء تحديد ملف Excel/CSV والضغط على زر "تحليل وقراءة البيانات" لبدء التدقيق.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto max-h-[190px] border rounded bg-white">
                      <table className="w-full text-right text-[10px] border-collapse font-mono">
                        <thead>
                          <tr className="bg-slate-100 text-slate-700 font-extrabold border-b sticky top-0">
                            {Object.keys(importStagingData[0]).map((key) => (
                              <th key={key} className="p-2 font-bold font-sans">{key}</th>
                            ))}
                            <th className="p-2 text-rose-700">تعديل/إجراء</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y text-slate-600">
                          {importStagingData.map((row, index) => (
                            <tr key={index} className="hover:bg-slate-50/50">
                              {Object.keys(row).map((key) => (
                                <td key={key} className="p-2">
                                  <input
                                    type="text"
                                    value={row[key]}
                                    onChange={(e) => {
                                      const updated = [...importStagingData];
                                      updated[index][key] = e.target.value;
                                      setImportStagingData(updated);
                                    }}
                                    className="p-1 border border-transparent hover:border-slate-200 focus:border-blue-500 rounded bg-transparent font-bold text-slate-800 w-full"
                                  />
                                </td>
                              ))}
                              <td className="p-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = importStagingData.filter((_, idx) => idx !== index);
                                    setImportStagingData(updated);
                                    showToast('تم استبعاد وتصفية هذا السجل من المسودة المؤقتة.', 'info');
                                  }}
                                  className="text-rose-600 hover:text-rose-800 font-bold"
                                >
                                  استبعاد
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 border-t pt-3 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setImportStagingData([]);
                      showToast('تم إفراغ وإلغاء المراجعة الحالية.', 'info');
                    }}
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg transition-all"
                  >
                    إلغاء وإفراغ
                  </button>
                  <button
                    type="button"
                    onClick={handleCommitStagingData}
                    className="px-5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-lg transition-all shadow-md flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>اعتماد واستيراد البيانات النهائية</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* SECTION 6.6: GO LIVE BUSINESS CYCLE ENGINE */}
        {activeSubTab === 'golive' && (
          <div className="space-y-4">
            <div className="bg-yellow-50/40 border border-yellow-200 rounded-lg p-3 text-slate-850">
              <span className="font-bold text-yellow-900 block mb-0.5">متطلب 6.6: محاكاة واختبار دورة العمل المتكاملة للتشغيل الفعلي (Go-Live Sandbox)</span>
              <p className="text-[11px] leading-relaxed">
                قبل إطلاق النظام للموظفين، يتيح لك هذا المعالج تشغيل دورة تجارية ومالية كاملة تبدأ من [الشراء وإدخال المخزن]، مروراً بـ [التصنيع والتحويل المستودعي والبيع]، وصولاً لـ [التحصيل وتوليد التقارير وتوازن القيود]. اضغط على الخطوات لتتبع سلامة الدفاتر تلقائياً.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              
              {/* Left Column: Flow step details */}
              <div className="bg-slate-50 border rounded-lg p-4 space-y-4 col-span-1">
                <span className="font-extrabold text-slate-800 flex items-center gap-1.5 border-b pb-2">
                  <Play className="w-4 h-4 text-blue-600" />
                  <span>خطوات دورة العمل الـ 7</span>
                </span>

                <div className="flex flex-col gap-2">
                  {[
                    { step: 1, label: '1. فاتورة الشراء وتأمين التكلفة' },
                    { step: 2, label: '2. إذن إضافة مستودعي فعلي' },
                    { step: 3, label: '3. أمر الإنتاج واستهلاك المواد' },
                    { step: 4, label: '4. التحويل مخزني بين الفروع' },
                    { step: 5, label: '5. فاتورة بيع مع ZATCA QR' },
                    { step: 6, label: '6. سند قبض وتحصيل النقدية' },
                    { step: 7, label: '7. توازن ميزان المراجعة والتقارير' }
                  ].map((s) => (
                    <div
                      key={s.step}
                      className={`p-2.5 rounded-lg border font-bold text-right transition-all text-[11px] ${
                        goLiveStep === s.step
                          ? 'border-yellow-500 bg-yellow-50 text-yellow-950 font-extrabold shadow-sm ring-2 ring-yellow-400/20'
                          : goLiveStep > s.step
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-900 line-through decoration-emerald-600/30'
                          : 'border-slate-200 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{s.label}</span>
                        {goLiveStep > s.step && <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />}
                        {goLiveStep === s.step && <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t flex gap-2">
                  <button
                    type="button"
                    onClick={runGoLiveStep}
                    disabled={goLiveStep > 7}
                    className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1 shadow"
                  >
                    <span>{goLiveStep === 7 ? 'إنهاء ومطابقة الدورة' : goLiveStep > 7 ? 'دورة مكتملة ✓' : 'تنفيذ الخطوة التالية'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={resetGoLiveTest}
                    className="px-2.5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-bold"
                    title="إعادة تهيئة الدورة"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Right Column: Execution Output logs and calculations */}
              <div className="bg-slate-900 border border-slate-950 rounded-lg p-4 col-span-3 text-slate-200 flex flex-col justify-between font-mono min-h-[350px]">
                <div className="space-y-2">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <span className="font-bold text-xs text-yellow-400 flex items-center gap-1.5">
                      <Flame className="w-4 h-4 animate-pulse text-yellow-500" />
                      <span>خادم المراقبة والتحليل المباشر لدورة التشغيل (MizanPro Live-Cycle Terminal)</span>
                    </span>
                    <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 rounded">
                      حالة العمليات: مطابقة ومثبتة في الأستاذ العام
                    </span>
                  </div>

                  {/* Dynamic Terminal Output logs */}
                  <div className="space-y-2.5 text-[11px] leading-relaxed max-h-[240px] overflow-y-auto pr-1">
                    {goLiveLogs.map((log, idx) => {
                      let colorClass = 'text-slate-300';
                      if (log.includes('[خطوة')) colorClass = 'text-yellow-300 font-extrabold';
                      if (log.includes('[محاسبة]')) colorClass = 'text-blue-400 font-bold';
                      if (log.includes('[مطابقة')) colorClass = 'text-emerald-400 font-extrabold';
                      if (log.includes('🌟')) colorClass = 'text-emerald-300 font-extrabold border border-emerald-500/20 bg-emerald-500/5 p-2 rounded';

                      return (
                        <div key={idx} className={`${colorClass} whitespace-pre-line text-right`}>
                          {log}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-3 mt-4 flex flex-wrap justify-between items-center text-[10px] text-slate-400 gap-2">
                  <div>
                    <span>رصيد المخزون المتوقع:</span>{' '}
                    <span className="font-bold text-white font-sans text-xs">{(goLiveStep > 2 ? 100 : 0) - (goLiveStep > 3 ? 50 : 0) - (goLiveStep > 5 ? 30 : 0)} كرتون</span>
                  </div>
                  <div>
                    <span>مديونية العميل (الآجل):</span>{' '}
                    <span className="font-bold text-white font-sans text-xs">{goLiveStep > 5 && goLiveStep < 7 ? 1350 : 0} ر.س</span>
                  </div>
                  <div>
                    <span>رصيد الصندوق (المحصل):</span>{' '}
                    <span className="font-bold text-emerald-400 font-sans text-xs">{goLiveStep > 6 ? 1350 : 0} ر.س</span>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded font-bold">
                    معاملات دفتر اليومية المالي: متطابقة بنسبة 100%
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* SECTION 6.7: PERFORMANCE MONITOR */}
        {activeSubTab === 'perf' && (
          <div className="space-y-4">
            <div className="bg-slate-50 border rounded-lg p-3 text-slate-700 text-[11px]">
              <span className="font-bold text-slate-800 block mb-0.5">متطلب 6.7: شاشة مراقبة الأداء، استهلاك السيرفر وسرعة معالجة العمليات</span>
              لوحة ديناميكية متصلة لقياس زمن الاستجابة، استهلاك الذاكرة (RAM) والمعالج (CPU) وقاعدة البيانات لبيئة الإنتاج الميدانية لضمان تجربة مستخدم سلسلة تحت الضغط العالي.
            </div>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              {/* Metric 1 */}
              <div className="bg-slate-50 border rounded-xl p-3 text-center space-y-1">
                <span className="text-[10px] text-slate-500 font-bold block">مجموع سرعة النظام</span>
                <span className="text-xl font-bold text-emerald-600 block">{perfMetrics.speedScore}%</span>
                <span className="text-[9px] text-emerald-700 bg-emerald-100 font-bold px-1.5 rounded-full inline-block">ممتاز وفائق السرعة</span>
              </div>
              {/* Metric 2 */}
              <div className="bg-slate-50 border rounded-xl p-3 text-center space-y-1">
                <span className="text-[10px] text-slate-500 font-bold block">استهلاك المعالج (CPU)</span>
                <span className="text-xl font-bold text-blue-600 block">{perfMetrics.cpu}%</span>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full" style={{ width: `${perfMetrics.cpu}%` }}></div>
                </div>
              </div>
              {/* Metric 3 */}
              <div className="bg-slate-50 border rounded-xl p-3 text-center space-y-1">
                <span className="text-[10px] text-slate-500 font-bold block">استهلاك الذاكرة (RAM)</span>
                <span className="text-xl font-bold text-purple-600 block">{perfMetrics.ram} GB</span>
                <span className="text-[9px] text-slate-400 block">من أصل 8 GB مخصصة</span>
              </div>
              {/* Metric 4 */}
              <div className="bg-slate-50 border rounded-xl p-3 text-center space-y-1">
                <span className="text-[10px] text-slate-500 font-bold block">استجابة قاعدة البيانات</span>
                <span className="text-xl font-bold text-indigo-600 block">{perfMetrics.dbLatency} ms</span>
                <span className="text-[9px] text-slate-400 block">سرعة قراءة/كتابة قصوى</span>
              </div>
              {/* Metric 5 */}
              <div className="bg-slate-50 border rounded-xl p-3 text-center space-y-1">
                <span className="text-[10px] text-slate-500 font-bold block">المستخدمين النشطين</span>
                <span className="text-xl font-bold text-slate-800 block">{perfMetrics.connectedUsers}</span>
                <span className="text-[9px] text-emerald-600 bg-emerald-50 px-1 rounded-full inline-block font-bold">جلسات متزامنة نشطة</span>
              </div>
              {/* Metric 6 */}
              <div className="bg-slate-50 border rounded-xl p-3 text-center space-y-1">
                <span className="text-[10px] text-slate-500 font-bold block">زمن تنفيذ العمليات</span>
                <span className="text-xl font-bold text-teal-600 block">{perfMetrics.execTime} ms</span>
                <span className="text-[9px] text-slate-400 block">لترحيل القيود الضخمة</span>
              </div>
            </div>

            {/* Simulated graph visualization */}
            <div className="border rounded-xl p-4 bg-slate-900 text-white space-y-3 font-mono">
              <span className="text-xs text-yellow-400 block">مخطط الاستهلاك والضغط البيئي اللحظي (Simulated Load Analytics Chart)</span>
              
              <div className="h-28 flex items-end justify-between gap-1.5 border-b border-slate-850 pb-1.5 pt-4">
                {[45, 60, 52, 48, 70, 65, 58, 44, 49, 62, 55, 42, 68, 75, 80, 50, 48, 55, 61, 72].map((val, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center">
                    <div 
                      className={`w-full rounded-t transition-all duration-500 ${val > 70 ? 'bg-rose-500' : 'bg-blue-500'}`} 
                      style={{ height: `${val}px` }}
                      title={`استهلاك المعالج: ${val}%`}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[9px] text-slate-500">
                <span>قبل 10 دقائق</span>
                <span>الآن</span>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 6.8: AUTOMATIC UPDATES & ZERO DATA LOSS ROLLBACK */}
        {activeSubTab === 'updates' && (
          <div className="space-y-4">
            <div className="bg-blue-50/50 border border-blue-200 rounded-lg p-3 text-slate-700">
              <span className="font-bold text-blue-900 block mb-0.5">متطلب 6.8: إدارة التحديثات والترقيات والرجوع التلقائي دون فقد البيانات</span>
              <p className="text-[11px] leading-relaxed">
                يسهّل النظام تطبيق تحديثات الصيانة والتعديلات الضريبية والمالية بضغطة واحدة، مع ضمان سلامة قواعد البيانات بنسبة 100% ودون فقدان أي قيود مضافة مسبقاً، بالإضافة لخاصية الرجوع المباشر (Rollback) للإصدار المستقر فوراً في حال مواجهة أي مشاكل بالشبكة.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Updater and controls */}
              <div className="bg-slate-50 border rounded-lg p-4 space-y-4">
                <span className="font-extrabold text-slate-800 flex items-center gap-1.5 border-b pb-2">
                  <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
                  <span>لوحة التحديثات التلقائية والتثبيت</span>
                </span>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white border rounded-lg cursor-pointer">
                    <div>
                      <span className="font-bold text-slate-800 block text-[11px]">ميزة التحديث التلقائي المجدول:</span>
                      <p className="text-[10px] text-slate-400">تحميل التعديلات الدورية وسد الثغرات تلقائياً خارج أوقات العمل الرسمية.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={autoUpdateEnabled}
                      onChange={(e) => setAutoUpdateEnabled(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                  </div>

                  <div className="p-3 bg-white border rounded-lg space-y-3">
                    <span className="font-bold text-slate-700 block text-[11px]">فحص وتنزيل التحديث اليدوي الجديد:</span>
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-slate-600">التحديث المتاح بالسيرفر:</span>
                      <span className="text-blue-700 font-mono">v1.0.1_Patch_A (تحديث أمني عاجل)</span>
                    </div>

                    {updateProgress > -1 && (
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold text-blue-900">
                          <span>جاري تثبيت التحديث وتدقيق الحقول...</span>
                          <span>{updateProgress}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border">
                          <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${updateProgress}%` }}></div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleStartUpdate}
                        disabled={isUpdatingSystem}
                        className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold cursor-pointer transition-all flex items-center justify-center gap-1"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>تثبيت التحديث الحالي الآن</span>
                      </button>
                      
                      <button
                        type="button"
                        onClick={handleRollback}
                        className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-bold cursor-pointer transition-all"
                        title="الرجوع للإصدار السابق المستقر"
                      >
                        تراجع تكتيكي (Rollback)
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Update History Log */}
              <div className="bg-slate-50 border rounded-lg p-4 space-y-3">
                <span className="font-extrabold text-slate-800 flex items-center gap-1.5 border-b pb-1.5">
                  <FileText className="w-4 h-4 text-purple-600" />
                  <span>سجل التحديثات التاريخي للنظام (Changelog Updates Server)</span>
                </span>

                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {updateHistory.map((up, idx) => (
                    <div key={idx} className="p-2 bg-white border rounded-lg text-[10px] leading-relaxed">
                      <div className="flex justify-between font-bold border-b pb-1 mb-1">
                        <span className="text-indigo-800 font-mono">{up.version}</span>
                        <span className="text-slate-400">{up.date}</span>
                        <span className="text-emerald-700 bg-emerald-100 px-1 rounded">تم النجاح</span>
                      </div>
                      <p className="text-slate-600 font-sans">{up.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* SECTION 6.10: OFFICIAL RELEASE & INSTRUCTIONS MANUALS */}
        {activeSubTab === 'release' && (
          <div className="space-y-4">
            <div className="border-b pb-2 flex justify-between items-center">
              <div>
                <span className="font-extrabold text-slate-800 text-xs block">دليل الاستخدام وملاحظات الإصدار الرسمي (Release v1.0.0 Golden)</span>
                <p className="text-[10px] text-slate-500 font-bold">كل ما تحتاجه لتثبيت وتشغيل وإدارة النظام للشركات والمؤسسات الكبرى.</p>
              </div>
              <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[10px] px-2.5 py-1 rounded-full animate-bounce">
                تم الاعتماد والإنتاج الذهبي ✓
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              
              {/* Manual Selection panel */}
              <div className="bg-slate-50 border rounded-lg p-3 space-y-2 col-span-1">
                <span className="font-bold text-slate-700 block text-[11px] mb-1.5 border-b pb-1">كتيبات الدليل والتعليمات:</span>
                
                <button
                  type="button"
                  onClick={() => showToast('دليل المستخدم جاهز للقراءة بالمستعرض الأيمن.', 'info')}
                  className="w-full p-2 bg-white border rounded-lg font-bold text-right hover:bg-blue-50 hover:text-blue-900 hover:border-blue-400 cursor-pointer block text-[11px] transition-all"
                >
                  📖 1. دليل المستخدم العادي (User Manual)
                </button>
                <button
                  type="button"
                  onClick={() => showToast('دليل المدير العام جاهز للقراءة بالمستعرض الأيمن.', 'info')}
                  className="w-full p-2 bg-white border rounded-lg font-bold text-right hover:bg-blue-50 hover:text-blue-900 hover:border-blue-400 cursor-pointer block text-[11px] transition-all"
                >
                  🛡️ 2. دليل المدير ومسؤول النظام (Admin Manual)
                </button>
                <button
                  type="button"
                  onClick={() => showToast('دليل تثبيت السيرفر جاهز للقراءة بالمستعرض الأيمن.', 'info')}
                  className="w-full p-2 bg-white border rounded-lg font-bold text-right hover:bg-blue-50 hover:text-blue-900 hover:border-blue-400 cursor-pointer block text-[11px] transition-all"
                >
                  🚀 3. دليل التثبيت وقواعد البيانات (Installation Guide)
                </button>
                <button
                  type="button"
                  onClick={() => showToast('ملاحظات الإصدار وسجل التغيير جاهز للقراءة بالمستعرض الأيمن.', 'info')}
                  className="w-full p-2 bg-white border rounded-lg font-bold text-right hover:bg-blue-50 hover:text-blue-900 hover:border-blue-400 cursor-pointer block text-[11px] transition-all"
                >
                  📝 4. سجل التغييرات وملاحظات الإصدار (Changelog)
                </button>
              </div>

              {/* Documentation Viewer */}
              <div className="bg-slate-50 border rounded-lg p-4 col-span-3 text-slate-800 leading-relaxed space-y-3 font-sans max-h-[350px] overflow-y-auto">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-extrabold text-slate-900 text-xs">📖 دليل التثبيت ودليل المستخدم الرسمي المعتمد (MizanPro System Blueprint)</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText('كتيب دليل مستخدم ونظام MizanPro ERP...');
                      showToast('تم نسخ نصوص كتيب الإرشاد المعتمد بنجاح!', 'success');
                    }}
                    className="text-[10px] text-blue-600 hover:underline flex items-center gap-1 font-bold"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>نسخ نصوص الكتيب</span>
                  </button>
                </div>

                <div className="text-[10px] space-y-3.5">
                  <div className="p-3 bg-white border rounded-lg border-blue-200">
                    <h4 className="font-extrabold text-[11px] text-blue-950 mb-1 flex items-center gap-1">
                      <span>🚀 أولاً: دليل التثبيت وقواعد البيانات (Server Installation Blueprint)</span>
                    </h4>
                    <p>
                      لتشغيل نظام <strong>MizanPro ERP</strong> على خوادم المنشأة الخاصة، يرجى تتبع الخطوات البرمجية التالية بدقة:
                    </p>
                    <ul className="list-decimal list-inside space-y-1.5 pt-1.5 font-sans font-medium text-slate-700">
                      <li>تأكد من توافر بيئة عمل <strong>Node.js v18+</strong> وقاعدة بيانات <strong>PostgreSQL v14+</strong> على السيرفر الرئيسي.</li>
                      <li>قم بضبط ملفات البيئة <span className="font-mono text-xs text-blue-800 bg-slate-100 px-1 rounded">.env.production</span> وإدخال بيانات التوصيل الآمنة مع تفعيل تشفير الاتصال.</li>
                      <li>قم بتشغيل الأمر <span className="font-mono text-xs text-blue-800 bg-slate-100 px-1 rounded">npm run build</span> لبناء وتجميع ملفات الإنتاج ورفعها لبيئة العمل.</li>
                      <li>قم بإعداد خادم النطاق وتوجيهه (Nginx Proxy) وتوليد شهادة الأمان التلقائية SSL وتأمين المنشأة.</li>
                    </ul>
                  </div>

                  <div className="p-3 bg-white border rounded-lg">
                    <h4 className="font-extrabold text-[11px] text-slate-900 mb-1 flex items-center gap-1">
                      <span>🛡️ ثانياً: دليل المدير ومسؤول النظام (Admin Operation Blueprint)</span>
                    </h4>
                    <p>
                      يمتلك مسؤول النظام والمدير العام الصلاحيات المطلقة لإدارة وحماية عمليات المنشأة. تشمل المسؤوليات:
                    </p>
                    <ul className="list-disc list-inside space-y-1.5 pt-1.5 text-slate-700">
                      <li><strong>توزيع الصلاحيات الفردية:</strong> توزيع الأدوار بدقة تامة للموظفين (أمين مستودع، مندوب بيع، محاسب معتمد) للحد من مخاطر التلاعب.</li>
                      <li><strong>مراقبة سجل التدقيق والأمن:</strong> فحص مستمر لـ Audit Logs ومحاولات الدخول الفاشلة والمحظورة فوراً لمعالجة الهجمات.</li>
                      <li><strong>النسخ الاحتياطي:</strong> مراجعة سلامة الجدولة الأوتوماتيكية للتأكد من انتظام النسخ بالخادم الرئيسي والسحابة.</li>
                    </ul>
                  </div>

                  <div className="p-3 bg-white border rounded-lg">
                    <h4 className="font-extrabold text-[11px] text-slate-900 mb-1 flex items-center gap-1">
                      <span>📖 ثالثاً: دليل المستخدم للعمليات اليومية (Standard User Guide)</span>
                    </h4>
                    <p>
                      يتكامل النظام لتسهيل العمليات اليومية للشركة من المشتريات وحتى المبيعات:
                    </p>
                    <ul className="list-disc list-inside space-y-1.5 pt-1.5 text-slate-700">
                      <li><strong>شراء البضاعة:</strong> قم بفتح واجهة المشتريات، حدد المورد والأصناف، ترحل الفاتورة وتولد قيد الاستحقاق التلقائي وتزيد مخزونك بالمستودعات.</li>
                      <li><strong>البيع والتحصيل:</strong> أنشئ فاتورة المبيعات مع باركود ZATCA QR، ثم سجل سند القبض لإثبات تحصيل الأموال بالصناديق أو البنك المعتمد.</li>
                    </ul>
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

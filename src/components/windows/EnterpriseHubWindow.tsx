import React, { useState, useEffect } from 'react';
import { useErp } from '../../context/ErpContext';
import { 
  Building, GitFork, ShieldCheck, Gauge, History, Trash2, Plus, 
  Warehouse, Layers, Network, DollarSign, CheckCircle, ChevronLeft, 
  ArrowLeftRight, ClipboardList, Database, ShieldAlert, Cpu, Check, 
  RefreshCw, RefreshCcw, Server, Activity, Users, FileSpreadsheet, Lock
} from 'lucide-react';

interface EnterpriseHubWindowProps {
  windowId: string;
  onClose: () => void;
}

export const EnterpriseHubWindow: React.FC<EnterpriseHubWindowProps> = ({ windowId, onClose }) => {
  const { theme, showToast, isOnline, branches: centralBranches, warehouses: centralWarehouses, accounts: centralAccounts, currentUser } = useErp();
  const isDark = theme === 'dark' || theme === 'light-black';

  const [activeTab, setActiveTab] = useState<'company' | 'branch' | 'warehouse' | 'permissions' | 'workflow' | 'performance' | 'audit'>('company');

  // ==========================================
  // 9.1 Multi-Company State & Logic
  // ==========================================
  const [companies, setCompanies] = useState([
    { id: 'cmp-1', name: 'مجموعة الميزان القابضة (الرئيسية)', dbName: 'AlMeezan_Holdings_DB', status: 'Active', branchesCount: 4, employeesCount: 420, baseCurrency: 'SAR', activeUsers: 18, settings: { taxRate: 15, fiscalYear: '2026', offlineGracePeriod: '72h' } },
    { id: 'cmp-2', name: 'شركة الميزان للتطوير الصناعي والمصانع', dbName: 'AlMeezan_Industrial_DB', status: 'Active', branchesCount: 2, employeesCount: 180, baseCurrency: 'SAR', activeUsers: 8, settings: { taxRate: 15, fiscalYear: '2026', offlineGracePeriod: '24h' } },
    { id: 'cmp-3', name: 'مؤسسة الحلول اللوجستية وتوزيع الأغذية', dbName: 'AlMeezan_Logistics_DB', status: 'Active', branchesCount: 3, employeesCount: 120, baseCurrency: 'AED', activeUsers: 5, settings: { taxRate: 5, fiscalYear: '2026', offlineGracePeriod: '48h' } },
  ]);

  const [selectedCompanyId, setSelectedCompanyId] = useState('cmp-1');
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanyDb, setNewCompanyDb] = useState('');
  const [newCompanyCurrency, setNewCompanyCurrency] = useState('SAR');

  const handleAddCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim()) return;
    const newId = 'cmp-' + Date.now();
    const cleanDbName = newCompanyDb.trim() || 'AlMeezan_' + newCompanyName.replace(/\s+/g, '_') + '_DB';
    
    const newC = {
      id: newId,
      name: newCompanyName,
      dbName: cleanDbName,
      status: 'Active',
      branchesCount: 1,
      employeesCount: 5,
      baseCurrency: newCompanyCurrency,
      activeUsers: 1,
      settings: { taxRate: 15, fiscalYear: '2026', offlineGracePeriod: '48h' }
    };

    setCompanies(prev => [...prev, newC]);
    showToast(`تم بنجاح تأسيس الشركة "${newCompanyName}" وربطها بقاعدة البيانات المنطقية المستقلة "${cleanDbName}"`, 'success');
    
    // Add default audit trail event
    addAuditEvent('company', `تأسيس شركة جديدة: ${newCompanyName} (قاعدة بيانات: ${cleanDbName})`, 'تطبيق الهيكل الأساسي', 'فارغ');

    setNewCompanyName('');
    setNewCompanyDb('');
  };

  const handleToggleCompanyStatus = (id: string, name: string) => {
    setCompanies(prev => prev.map(c => {
      if (c.id === id) {
        const nextStatus = c.status === 'Active' ? 'Suspended' : 'Active';
        showToast(`تم تعديل حالة الشركة [${name}] إلى ${nextStatus === 'Active' ? 'نشطة' : 'معطلة'}`, 'info');
        addAuditEvent('company', `تعديل حالة شركة ${name}`, nextStatus, c.status);
        return { ...c, status: nextStatus };
      }
      return c;
    }));
  };

  const selectedCompany = companies.find(c => c.id === selectedCompanyId) || companies[0];

  // ==========================================
  // 9.2 Multi-Branch State & Logic
  // ==========================================
  const [branches, setBranches] = useState([
    { id: 'br-1', companyId: 'cmp-1', name: 'الإدارة الإقليمية والفرع الرئيسي - الرياض', code: 'RUH-01', warehousesCount: 3, treasuriesCount: 2, banksCount: 3, employeesCount: 150, sales: 840000, purchases: 320000 },
    { id: 'br-2', companyId: 'cmp-1', name: 'فرع المنطقة الغربية والمستودعات - جدة', code: 'JED-02', warehousesCount: 2, treasuriesCount: 1, banksCount: 2, employeesCount: 120, sales: 620000, purchases: 240000 },
    { id: 'br-3', companyId: 'cmp-1', name: 'مكتب المبيعات والتوريد - الدمام', code: 'DMM-03', warehousesCount: 1, treasuriesCount: 1, banksCount: 1, employeesCount: 80, sales: 380000, purchases: 150000 },
    { id: 'br-4', companyId: 'cmp-2', name: 'مصنع الميزان لخطوط التغليف - الرياض الصناعية', code: 'IND-RUH', warehousesCount: 2, treasuriesCount: 1, banksCount: 2, employeesCount: 110, sales: 1200000, purchases: 800000 },
    { id: 'br-5', companyId: 'cmp-3', name: 'فرع دبي والشرق الأوسط - القرهود', code: 'DXB-01', warehousesCount: 2, treasuriesCount: 2, banksCount: 2, employeesCount: 65, sales: 950000, purchases: 410000 },
  ]);

  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchCode, setNewBranchCode] = useState('');

  const handleAddBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchName.trim() || !newBranchCode.trim()) return;

    const newBr = {
      id: 'br-' + Date.now(),
      companyId: selectedCompanyId,
      name: newBranchName,
      code: newBranchCode.toUpperCase(),
      warehousesCount: 1,
      treasuriesCount: 1,
      banksCount: 1,
      employeesCount: 10,
      sales: 0,
      purchases: 0
    };

    setBranches(prev => [...prev, newBr]);
    showToast(`تم إضافة الفرع الجديد [${newBranchName}] وربط الحسابات المساعدة به.`, 'success');
    addAuditEvent('branch', `إضافة فرع جديد: ${newBranchName}`, `رمز: ${newBr.code}`, 'جديد');
    setNewBranchName('');
    setNewBranchCode('');
  };

  const filteredBranches = branches.filter(b => b.companyId === selectedCompanyId);

  // Consolidated Reporting Filter
  const [consolidateAllBranches, setConsolidateAllBranches] = useState(false);

  // ==========================================
  // 9.3 Multi-Warehouse & Inventory State & Logic
  // ==========================================
  const [warehouses, setWarehouses] = useState([
    { id: 'wh-1', branchId: 'br-1', name: 'مستودع الرياض المركزي للقطع التالفة', location: 'الرياض - السلي', supervisor: 'سليمان الحربي', capacity: '92%' },
    { id: 'wh-2', branchId: 'br-1', name: 'مخزن المواد الخام الرئيسي', location: 'الرياض - الصناعية الثانية', supervisor: 'فيصل العتيبي', capacity: '75%' },
    { id: 'wh-3', branchId: 'br-2', name: 'مستودع جدة المركزي للمستوردات', location: 'جدة - الخمرة', supervisor: 'محمد الغامدي', capacity: '88%' },
    { id: 'wh-4', branchId: 'br-4', name: 'مخزن المواد تامة الصنع والإنتاج', location: 'مصنع الرياض', supervisor: 'عماد الشاكر', capacity: '60%' },
  ]);

  const [selectedSrcWarehouseId, setSelectedSrcWarehouseId] = useState('wh-1');
  const [selectedDestWarehouseId, setSelectedDestWarehouseId] = useState('wh-2');
  const [selectedTransferItem, setSelectedTransferItem] = useState('it-1');
  const [transferQty, setTransferQty] = useState(50);
  const [transferNotes, setTransferNotes] = useState('طلب نقل فوري لسد عجز الطلبيات');

  // Stock transfers log
  const [transfers, setTransfers] = useState([
    { id: 'tr-1', date: '2026-07-01 10:15', item: 'رول تغليف بولي إيثيلين', qty: 200, from: 'مخزن المواد الخام الرئيسي', to: 'مخزن المواد تامة الصنع والإنتاج', status: 'تم التسليم', approvedBy: 'محمود الجار الله' },
    { id: 'tr-2', date: '2026-07-03 14:22', item: 'محرك سير ناقل بقوة 3 حصان', qty: 5, from: 'مستودع الرياض المركزي للقطع التالفة', to: 'مخزن المواد الخام الرئيسي', status: 'في الطريق', approvedBy: 'أحمد السعدني' },
  ]);

  const handlePostTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSrcWarehouseId === selectedDestWarehouseId) {
      showToast('خطأ: لا يمكن النقل لنفس المستودع المصدر!', 'error');
      return;
    }

    const srcWh = warehouses.find(w => w.id === selectedSrcWarehouseId);
    const destWh = warehouses.find(w => w.id === selectedDestWarehouseId);
    if (!srcWh || !destWh) return;

    const newTr = {
      id: 'tr-' + Date.now(),
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      item: selectedTransferItem === 'it-1' ? 'كرتون بضائع معبأة 20 كجم' : 'لوحة تحكم إلكترونية مدمجة',
      qty: Number(transferQty),
      from: srcWh.name,
      to: destWh.name,
      status: 'تم التسليم',
      approvedBy: currentUser?.fullName || 'المدير العام'
    };

    setTransfers(prev => [newTr, ...prev]);
    showToast(`تم ترحيل مناقلة المخزون رقم ${newTr.id.substring(3, 8)} وتحديث الأرصدة المستودعية تفصيلياً.`, 'success');
    addAuditEvent('warehouse', `طلب نقل مستودعي`, `${srcWh.name} -> ${destWh.name} (كمية: ${transferQty})`, 'مكتمل');
  };

  // Warehouse Audit / Count Sheet (الجرد الفعلي)
  const [auditItems, setAuditItems] = useState([
    { id: 'ai-1', code: 'PRD-991', name: 'رول تغليف بولي إيثيلين 1000متر', sysQty: 1450, actualQty: 1445, variance: -5, cost: 85, notes: 'عجز ناتج عن تمدد وفحص الجودة' },
    { id: 'ai-2', code: 'PRD-201', name: 'محرك سير ناقل تركي الصنع', sysQty: 24, actualQty: 24, variance: 0, cost: 1200, notes: 'مطابق تماماً' },
    { id: 'ai-3', code: 'PRD-102', name: 'لوحة تحكم إلكترونية مدمجة 12قناة', sysQty: 180, actualQty: 182, variance: 2, cost: 450, notes: 'زيادة ناتجة عن تسوية خط توريد خاطئ' },
  ]);

  const handleSaveAuditCount = () => {
    showToast('تم حفظ نتائج الجرد الفعلي للمستودع وإطلاق سندات تسوية العجز والزيادة تلقائياً.', 'success');
    addAuditEvent('warehouse', 'إجراء جرد مستودعي سنوي', 'معالجة تسويات الفوارق المخزنية المكتشفة', 'معلق');
  };

  // ==========================================
  // 9.4 Professional Permissions Matrix State & Logic
  // ==========================================
  const [securityRoles, setSecurityRoles] = useState([
    { id: 'rol-1', name: 'رئيس الحسابات والمراقب المالي', department: 'المالية', companyAccess: 'جميع الشركات', branchAccess: 'جميع الفروع', screenAccess: 'كامل الوصول', editPermission: 'مفعل', deletePermission: 'مفعل', reportPermission: 'مفعل' },
    { id: 'rol-2', name: 'أمين المستودعات العام', department: 'المخازن', companyAccess: 'شركة الصناعات والمصانع', branchAccess: 'فروع الرياض وجدة', screenAccess: 'شاشات المواد والمناقلات', editPermission: 'مفعل', deletePermission: 'معطل', reportPermission: 'تقارير جرد' },
    { id: 'rol-3', name: 'محاسب مبيعات وكاشير', department: 'مبيعات التجزئة', companyAccess: 'شركة لوجستية الأغذية', branchAccess: 'فرع جدة فقط', screenAccess: 'فاتورة بيع ومردودات', editPermission: 'معطل', deletePermission: 'معطل', reportPermission: 'مبيعات يومية' },
  ]);

  const [selectedRoleId, setSelectedRoleId] = useState('rol-1');
  const activeRole = securityRoles.find(r => r.id === selectedRoleId) || securityRoles[0];

  const handleUpdateRolePerm = (field: string, val: string) => {
    setSecurityRoles(prev => prev.map(r => {
      if (r.id === selectedRoleId) {
        return { ...r, [field]: val };
      }
      return r;
    }));
    showToast('تم تحديث هيكل الصلاحيات على مستوى الحقل والمستند بنجاح لحماية سرية البيانات.', 'success');
  };

  // ==========================================
  // 9.5 Custom Enterprise Workflow State & Logic
  // ==========================================
  const [workflows, setWorkflows] = useState([
    { id: 'wf-inv', name: 'تدفق فواتير المبيعات الكبرى (> 50,000 ر.س)', docType: 'فاتورة مبيعات', stages: ['إنشاء (المحاسب)', 'مراجعة إدارة الائتمان', 'اعتماد مدير القسم', 'اعتماد المدير المالي', 'ترحيل وتنفيذ'] },
    { id: 'wf-pur', name: 'تدفق فواتير الشراء والتوريد الرأسمالية', docType: 'فاتورة مشتريات', stages: ['إنشاء (المشتريات)', 'اعتماد مدير المستودع', 'تدقيق مالي ومراكز تكلفة', 'اعتماد المدير المالي', 'اعتماد المدير العام', 'إصدار الشيك والتنفيذ'] },
    { id: 'wf-je', name: 'تدفق التسويات وسندات القيد الاستثنائية', docType: 'قيود تسوية ميزانية', stages: ['مسودة (المحاسب)', 'مراجعة المراجع الداخلي', 'اعتماد رئيس الحسابات', 'اعتماد المدير المالي', 'ترحيل الحسابات'] },
  ]);

  const [selectedWorkflowId, setSelectedWorkflowId] = useState('wf-pur');
  const activeWorkflow = workflows.find(w => w.id === selectedWorkflowId) || workflows[0];

  // Active documents in simulator
  const [workflowSimDoc, setWorkflowSimDoc] = useState({
    id: 'DOC-9081',
    type: 'مشتريات خامات حديد مصنع الرياض',
    amount: '650,000 ر.س',
    currentStageIdx: 2, // 'تدقيق مالي ومراكز تكلفة'
    status: 'معلق بالتدقيق المالي',
    history: [
      { user: 'خالد العتيبي (محاسب)', action: 'إنشاء الفاتورة وتثبيت كمية المرفقات', time: '2026-07-04 09:00' },
      { user: 'سليمان الحربي (أمين مخزن)', action: 'اعتماد تسليم وتوريد البضاعة للمخزن 2', time: '2026-07-04 10:30' },
    ]
  });

  const handleWorkflowApprove = () => {
    if (workflowSimDoc.currentStageIdx >= activeWorkflow.stages.length - 1) {
      showToast('المستند معتمد ومنفذ بالكامل في الدفاتر الختامية!', 'success');
      return;
    }

    const nextStageIdx = workflowSimDoc.currentStageIdx + 1;
    const stageName = activeWorkflow.stages[nextStageIdx];
    const isExecution = nextStageIdx === activeWorkflow.stages.length - 1;

    setWorkflowSimDoc(prev => ({
      ...prev,
      currentStageIdx: nextStageIdx,
      status: isExecution ? 'تم التوقيع والتنفيذ النهائي ✓' : `بانتظار: ${stageName}`,
      history: [
        ...prev.history,
        { user: currentUser?.fullName || 'أحمد المدير (رئيس القسم)', action: `الموافقة والتوقيع الرقمي للمرحلة: ${activeWorkflow.stages[prev.currentStageIdx]}`, time: 'الآن' }
      ]
    }));

    showToast(`تم توقيع واعتماد مستند ${workflowSimDoc.id} للمرحلة التالية بنجاح.`, 'success');
    addAuditEvent('workflow', `توقيع مرحلة بمستند ${workflowSimDoc.id}`, `مرحلة ${nextStageIdx}: ${stageName}`, 'مكتمل');
  };

  const handleWorkflowReject = () => {
    setWorkflowSimDoc(prev => ({
      ...prev,
      currentStageIdx: 0,
      status: 'مرفوض - أرجعت للمحاسب للتعديل ✗',
      history: [
        ...prev.history,
        { user: currentUser?.fullName || 'أحمد المدير', action: 'رفض وإرجاع المستند لوجود عجز بالمرفقات الضريبية', time: 'الآن' }
      ]
    }));
    showToast('تم رفض وإرجاع المستند للمرحلة الأولى لإجراء التصحيح المطلوب.', 'warning');
    addAuditEvent('workflow', `رفض مستند ${workflowSimDoc.id}`, 'إرجاع للبداية', 'تعديل');
  };

  // ==========================================
  // 9.6 High-Performance Engine Dashboard State & Logic
  // ==========================================
  const [connectedUsers, setConnectedUsers] = useState(1024);
  const [totalInvoicesCount, setTotalInvoicesCount] = useState(1485000);
  const [totalJournalEntries, setTotalJournalEntries] = useState(3820000);
  const [totalItemsCount, setTotalItemsCount] = useState(1200000);
  const [queryLatency, setQueryLatency] = useState(35); // in milliseconds
  const [isStressTesting, setIsStressTesting] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [indexingStatus, setIndexingStatus] = useState('معاد تهيئتها بنسبة 98.4%');
  const [memoryCacheHit, setMemoryCacheHit] = useState('94.2%');

  const handleRunStressTest = () => {
    setIsStressTesting(true);
    showToast('جاري تشغيل محاكي الأداء لمحاكاة 1,200 مستخدم متصل يقومون بترحيل 50,000 فاتورة بالثانية...', 'info');
    
    // Simulate live graph updates
    setTimeout(() => {
      setConnectedUsers(1480);
      setTotalInvoicesCount(prev => prev + 4820);
      setTotalJournalEntries(prev => prev + 9640);
      setQueryLatency(142); // Latency spikes under stress
    }, 1000);

    setTimeout(() => {
      setQueryLatency(22); // Post partition optimizer restores speed
      setIsStressTesting(false);
      showToast('اكتمل اختبار الضغط! تم تطبيق تقنية التقسيم الميكروي (Ledger Partitioning) للحفاظ على سرعة الاستعلام تحت 22 ملي ثانية.', 'success');
      addAuditEvent('performance', 'اختبار الضغط السنوي', 'نجاح الاستقرار تحت 1500 مستخدم متصل', 'مكتمل');
    }, 3000);
  };

  const handleOptimizeEngine = () => {
    setIsOptimizing(true);
    showToast('جاري البدء في تجميع خطط الاستعلام، صيانة فهارس الجداول، وتنظيف الذاكرة المؤقتة لمخازن SQL...', 'info');
    setTimeout(() => {
      setQueryLatency(1.8); // Ultra fast response!
      setIndexingStatus('فهرسة كلية ومثالية 100%');
      setMemoryCacheHit('99.7%');
      setIsOptimizing(false);
      showToast('تمت صيانة وتحسين محرك قواعد البيانات بنجاح! سرعة الاستجابة الآن 1.8 ملي ثانية.', 'success');
      addAuditEvent('performance', 'فهرسة وتطهير قاعدة البيانات', 'سرعة استجابة 1.8ms', 'نشط');
    }, 2000);
  };

  // ==========================================
  // 9.7 Comprehensive Audit Trail State & Logic
  // ==========================================
  const [auditLogs, setAuditLogs] = useState([
    { id: 'aud-1', time: '2026-07-04 14:10:15', user: 'Ahmed (مدير النظام)', company: 'المجموعة القابضة', branch: 'فرع الرياض الرئيسي', screen: 'فواتير المبيعات', action: 'ترحيل نهائي', oldValue: 'فاتورة مسودة رقم INV-202', newValue: 'قيد محاسبي رقم JV-90800 بقيمة 12,500 ر.س', status: 'نجاح ✓', workstation: 'WS-RUH-MAIN-01' },
    { id: 'aud-2', time: '2026-07-04 13:55:22', user: 'Khalid (أمين مستودع)', company: 'المجموعة القابضة', branch: 'فرع جدة والمستودعات', screen: 'مناقلة مستودعية', action: 'تحويل بضاعة خام', oldValue: 'مستودع 1', newValue: 'مستودع 3 (كمية 40)', status: 'نجاح ✓', workstation: 'WS-JED-MOB-09' },
    { id: 'aud-3', time: '2026-07-04 13:42:01', user: 'Sami (كاشير)', company: 'شركة الأغذية', branch: 'مكتب الدمام', screen: 'فواتير المبيعات', action: 'محاولة تعديل سعر بيع مادة مقفلة', oldValue: 'سعر مادة: 85 ر.س', newValue: 'محاولة تعديل لـ 70 ر.س', status: 'مرفوض ✗ (صلاحية)', workstation: 'WS-DMM-POS-04' },
    { id: 'aud-4', time: '2026-07-04 11:20:44', user: 'Ahmed (مدير النظام)', company: 'المجموعة القابضة', branch: 'فرع الرياض الرئيسي', screen: 'بطاقات المستخدمين', action: 'تغيير صلاحيات دور "رئيس الحسابات"', oldValue: 'إيقاف حذف القيود', newValue: 'تفعيل صلاحية حذف القيود السنوية', status: 'تنبيه أمني ⚠', workstation: 'WS-RUH-MAIN-01' },
    { id: 'aud-5', time: '2026-07-03 16:15:00', user: 'Amjad (المدير المالي)', company: 'المصانع والتطوير الصناعي', branch: 'مصنع الرياض الصناعية', screen: 'سندات قيود اليومية', action: 'تسوية ميزان الحسابات', oldValue: 'رصيد مرحل 4,200,000 ر.س', newValue: 'توزيع فوارق صرف العملات بقيمة 12,400 ر.س', status: 'نجاح ✓', workstation: 'WS-IND-CFO' },
  ]);

  const [auditFilterUser, setAuditFilterUser] = useState('');
  const [auditFilterScreen, setAuditFilterScreen] = useState('');

  const addAuditEvent = (screen: string, action: string, newValue: string, oldValue: string) => {
    const newEvt = {
      id: 'aud-' + Date.now(),
      time: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user: currentUser?.fullName || 'مدير النظام (Ahmed)',
      company: selectedCompany.name.split(' (')[0],
      branch: filteredBranches[0]?.name || 'جميع الفروع الموحدة',
      screen: screen,
      action: action,
      oldValue: oldValue,
      newValue: newValue,
      status: 'نجاح ✓',
      workstation: 'WORKSTATION-MAIN-ERP'
    };
    setAuditLogs(prev => [newEvt, ...prev]);
  };

  const filteredAuditLogs = auditLogs.filter(log => {
    return (
      (auditFilterUser === '' || log.user.toLowerCase().includes(auditFilterUser.toLowerCase())) &&
      (auditFilterScreen === '' || log.screen.toLowerCase().includes(auditFilterScreen.toLowerCase()))
    );
  });

  return (
    <div className={`flex h-full bg-slate-50 text-slate-800 select-none overflow-hidden`} dir="rtl">
      
      {/* Side Tab Icons Left Navigation */}
      <div className={`w-[200px] shrink-0 border-l flex flex-col justify-between py-4 ${isDark ? 'bg-zinc-900 border-zinc-800 text-slate-100' : 'bg-slate-100 border-slate-300'}`}>
        <div className="space-y-1 px-2.5">
          <div className="text-[10px] font-black text-slate-400 px-3 pb-2.5 tracking-wider">نظام المؤسسات العملاقة ERP Enterprise</div>
          
          <button
            onClick={() => setActiveTab('company')}
            className={`w-full text-right px-3 py-2 rounded text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'company' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'hover:bg-slate-200 text-slate-600'
            }`}
          >
            <Building className="w-4 h-4 shrink-0" />
            <span>الشركات المتعددة</span>
          </button>

          <button
            onClick={() => setActiveTab('branch')}
            className={`w-full text-right px-3 py-2 rounded text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'branch' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'hover:bg-slate-200 text-slate-600'
            }`}
          >
            <Network className="w-4 h-4 shrink-0" />
            <span>الفروع المشتركة</span>
          </button>

          <button
            onClick={() => setActiveTab('warehouse')}
            className={`w-full text-right px-3 py-2 rounded text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'warehouse' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'hover:bg-slate-200 text-slate-600'
            }`}
          >
            <Warehouse className="w-4 h-4 shrink-0" />
            <span>المستودعات والمناقلات</span>
          </button>

          <button
            onClick={() => setActiveTab('permissions')}
            className={`w-full text-right px-3 py-2 rounded text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'permissions' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'hover:bg-slate-200 text-slate-600'
            }`}
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>الصلاحيات المتقدمة</span>
          </button>

          <button
            onClick={() => setActiveTab('workflow')}
            className={`w-full text-right px-3 py-2 rounded text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'workflow' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'hover:bg-slate-200 text-slate-600'
            }`}
          >
            <GitFork className="w-4 h-4 rotate-180 shrink-0" />
            <span>مسار الاعتمادات</span>
          </button>

          <button
            onClick={() => setActiveTab('performance')}
            className={`w-full text-right px-3 py-2 rounded text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'performance' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'hover:bg-slate-200 text-slate-600'
            }`}
          >
            <Gauge className="w-4 h-4 shrink-0" />
            <span>الأداء العالي (1M)</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`w-full text-right px-3 py-2 rounded text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'audit' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'hover:bg-slate-200 text-slate-600'
            }`}
          >
            <History className="w-4 h-4 shrink-0" />
            <span>سجل المراقبة والتدقيق</span>
          </button>
        </div>

        <div className="px-3 text-center space-y-1.5">
          <div className="w-full h-[1px] bg-slate-200 my-2" />
          <span className="text-[9px] text-slate-400 font-mono block">Enterprise Cluster Engine</span>
          <span className="text-[9px] text-emerald-600 font-extrabold flex items-center justify-center gap-1 bg-emerald-50 py-1 rounded border border-emerald-100">
            <Server className="w-3 h-3 text-emerald-500" />
            <span>نشط (Cluster Node)</span>
          </span>
        </div>
      </div>

      {/* Main Form/Grid Content Area */}
      <div className="flex-1 p-5 overflow-y-auto bg-slate-50 text-slate-800">
        
        {/* ==========================================
            TAB 1: Companies (الشركات المتعددة)
            ========================================== */}
        {activeTab === 'company' && (
          <div className="space-y-4">
            <div className="border-b pb-2 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                  <Building className="w-5 h-5 text-blue-600" />
                  إدارة الشركات والمجموعات التجارية (Multi-Company Ledger)
                </h3>
                <p className="text-[11px] text-slate-500">لكل شركة قاعدة بيانات منطقية معزولة، إعدادات ضريبية مستقلة، ودليل حسابات مخصص بالكامل.</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              
              {/* Left Column: Form to establish a new company */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <span className="text-xs font-black text-slate-800 block border-b pb-1">تأسيس منشأة / شركة تابعة</span>
                
                <form onSubmit={handleAddCompany} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">اسم الشركة الجديدة:</label>
                    <input 
                      type="text" 
                      value={newCompanyName} 
                      onChange={e => setNewCompanyName(e.target.value)} 
                      placeholder="مثال: شركة الميزان للتطوير العقاري" 
                      className="w-full p-2 text-xs border rounded bg-slate-50 font-bold focus:bg-white"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">اسم قاعدة البيانات المستقلة (Logical SQL DB):</label>
                    <input 
                      type="text" 
                      value={newCompanyDb} 
                      onChange={e => setNewCompanyDb(e.target.value)} 
                      placeholder="مثال: AlMeezan_RealEstate_DB" 
                      className="w-full p-2 text-xs border rounded bg-slate-50 font-mono font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600">العملة الافتراضية:</label>
                      <select 
                        value={newCompanyCurrency} 
                        onChange={e => setNewCompanyCurrency(e.target.value)}
                        className="w-full p-2 text-xs border rounded bg-slate-50"
                      >
                        <option value="SAR">ريال سعودي (SAR)</option>
                        <option value="AED">درهم إماراتي (AED)</option>
                        <option value="USD">دولار أمريكي (USD)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-600">السنة المالية الحالية:</label>
                      <input 
                        type="text" 
                        value="2026" 
                        disabled 
                        className="w-full p-2 text-xs border rounded bg-slate-100 text-slate-400 font-bold"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-black shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>تأسيس وربط قاعدة البيانات</span>
                  </button>
                </form>
              </div>

              {/* Right Column: Interactive list and settings of companies */}
              <div className="col-span-2 space-y-3">
                <span className="text-xs font-black text-slate-800 block">الشركات والكيانات المفعلة بالنظام:</span>
                
                <div className="grid grid-cols-1 gap-2.5">
                  {companies.map(c => {
                    const isSelected = c.id === selectedCompanyId;
                    return (
                      <div 
                        key={c.id}
                        className={`p-4 rounded-xl border transition-all ${
                          isSelected 
                            ? 'bg-blue-50/50 border-blue-400 ring-2 ring-blue-100' 
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div onClick={() => setSelectedCompanyId(c.id)} className="cursor-pointer flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-xs text-slate-800">{c.name}</span>
                              <span className={`text-[9px] px-2 py-0.5 rounded-full font-black ${
                                c.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {c.status === 'Active' ? 'نشطة' : 'معطلة'}
                              </span>
                            </div>
                            <div className="flex gap-4 mt-2 text-[10px] text-slate-400 font-mono">
                              <span>قاعدة البيانات: {c.dbName}</span>
                              <span>•</span>
                              <span>الفروع: {c.branchesCount}</span>
                              <span>•</span>
                              <span>الموظفون: {c.employeesCount}</span>
                              <span>•</span>
                              <span>المستخدمون النشطون: {c.activeUsers}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button 
                              onClick={() => handleToggleCompanyStatus(c.id, c.name)}
                              className={`px-2 py-1 border text-[10px] rounded font-black cursor-pointer ${
                                c.status === 'Active' ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              }`}
                            >
                              {c.status === 'Active' ? 'تعطيل مؤقت' : 'تنشيط'}
                            </button>
                            <button 
                              disabled={isSelected}
                              onClick={() => {
                                setSelectedCompanyId(c.id);
                                showToast(`تم بنجاح الانتقال والاتصال بقاعدة بيانات شركة [${c.name}] وعزل الأرصدة والقيود.`, 'success');
                              }}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-[10px] rounded font-black cursor-pointer"
                            >
                              اتصال
                            </button>
                          </div>
                        </div>

                        {/* Expand settings panel if selected */}
                        {isSelected && (
                          <div className="mt-3 pt-3 border-t border-dashed border-slate-200 grid grid-cols-3 gap-3 bg-slate-50 p-2.5 rounded-lg text-[10.5px]">
                            <div className="space-y-0.5">
                              <span className="text-slate-400 font-bold block">معدل ضريبة القيمة المضافة:</span>
                              <span className="font-extrabold text-slate-800 font-mono">{c.settings.taxRate}%</span>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-slate-400 font-bold block">السنة المالية النشطة:</span>
                              <span className="font-extrabold text-slate-800 font-mono">{c.settings.fiscalYear}</span>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-slate-400 font-bold block">فترة العمل أوفلاين كحد أقصى:</span>
                              <span className="font-extrabold text-slate-800 font-mono">{c.settings.offlineGracePeriod}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 2: Branches (الفروع المشتركة والدمج)
            ========================================== */}
        {activeTab === 'branch' && (
          <div className="space-y-4">
            <div className="border-b pb-2 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                  <Network className="w-5 h-5 text-blue-600" />
                  إدارة وهيكلة فروع الشركة (Multi-Branch Dashboard)
                </h3>
                <p className="text-[11px] text-slate-500">إدارة تفصيلية لمبيعات، مشتريات، موظفي، ومخازن كل فرع، مع ميزة الدمج الكلي للتقارير.</p>
              </div>

              {/* Consolidation toggle */}
              <button 
                onClick={() => {
                  setConsolidateAllBranches(!consolidateAllBranches);
                  showToast(consolidateAllBranches ? 'تم العودة لعزل الفروع إدارياً' : 'تم تفعيل الدمج المحاسبي الموحد لكافة الفروع', 'info');
                }}
                className={`px-3.5 py-1.5 border rounded-lg text-xs font-black cursor-pointer shadow-xs transition-all flex items-center gap-1.5 ${
                  consolidateAllBranches 
                    ? 'bg-purple-600 text-white border-purple-400 hover:bg-purple-700' 
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>{consolidateAllBranches ? 'إلغاء الدمج (عزل الفروع)' : 'دمج وتوحيد كافة الفروع محاسبياً'}</span>
              </button>
            </div>

            {/* Show Consolidation Summary Banner if active */}
            {consolidateAllBranches && (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-between text-[11px] text-purple-900">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-600" />
                  <span><strong>المحرك المحاسبي الموحد نشط حالياً:</strong> سيقوم النظام بدمج الموازين المالية والمخزنية لجميع الفروع في تقرير عام متماسك.</span>
                </div>
                <span className="bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full font-mono">Consolidated Active</span>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              
              {/* Add branch form */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3 h-fit">
                <span className="text-xs font-black text-slate-800 block border-b pb-1">إضافة فرع جديد للشركة المختارة</span>
                
                <form onSubmit={handleAddBranch} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 font-sans">اسم الفرع الجديد:</label>
                    <input 
                      type="text" 
                      value={newBranchName} 
                      onChange={e => setNewBranchName(e.target.value)} 
                      placeholder="مثال: فرع المنطقة الشرقية - الخبر" 
                      className="w-full p-2 text-xs border rounded bg-slate-50 font-bold"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">رمز الفرع (Branch Code):</label>
                    <input 
                      type="text" 
                      value={newBranchCode} 
                      onChange={e => setNewBranchCode(e.target.value)} 
                      placeholder="مثال: KHB-03" 
                      className="w-full p-2 text-xs border rounded bg-slate-50 font-mono font-bold"
                      required
                    />
                  </div>

                  <div className="p-2 bg-blue-50 border border-blue-100 rounded text-[10px] text-blue-800 leading-relaxed">
                    سيقوم النظام بتهيئة خزينة رئيسية وحساب مصرفي مخصص لهذا الفرع فور تأسيسه لمنع تداخل العهد المالية.
                  </div>

                  <button 
                    type="submit" 
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-black shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>تسجيل الفرع وبناء الأرصدة</span>
                  </button>
                </form>
              </div>

              {/* Branches list card view */}
              <div className="col-span-2 grid grid-cols-2 gap-3">
                {filteredBranches.map(b => (
                  <div key={b.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 space-y-3">
                    <div className="flex justify-between items-center border-b pb-1.5">
                      <span className="font-extrabold text-xs text-slate-900">{b.name}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-black">{b.code}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                      <div className="bg-slate-50 p-1.5 rounded">
                        <span className="text-slate-400 block font-bold">المستودعات</span>
                        <span className="font-extrabold text-slate-800 font-mono">{b.warehousesCount}</span>
                      </div>
                      <div className="bg-slate-50 p-1.5 rounded">
                        <span className="text-slate-400 block font-bold">الخزائن</span>
                        <span className="font-extrabold text-slate-800 font-mono">{b.treasuriesCount}</span>
                      </div>
                      <div className="bg-slate-50 p-1.5 rounded">
                        <span className="text-slate-400 block font-bold">البنوك</span>
                        <span className="font-extrabold text-slate-800 font-mono">{b.banksCount}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="p-2 bg-emerald-50/50 rounded-lg border border-emerald-100">
                        <span className="text-[9px] text-emerald-600 block font-bold">مبيعات الفرع</span>
                        <span className="text-xs font-mono font-black text-slate-900">{b.sales.toLocaleString()} ر.س</span>
                      </div>
                      <div className="p-2 bg-blue-50/50 rounded-lg border border-blue-100">
                        <span className="text-[9px] text-blue-600 block font-bold">مشتريات الفرع</span>
                        <span className="text-xs font-mono font-black text-slate-900">{b.purchases.toLocaleString()} ر.س</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                      <span>إجمالي الموظفين: {b.employeesCount} موظف</span>
                      <span className="text-emerald-600 font-black flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        <span>نشط ومنفذ</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 3: Warehouses (المخازن، المناقلات وجرد الأصناف)
            ========================================== */}
        {activeTab === 'warehouse' && (
          <div className="space-y-4">
            <div className="border-b pb-2 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                  <Warehouse className="w-5 h-5 text-blue-600" />
                  إدارة المستودعات وحركة الأصناف المتعددة (Multi-Warehouse Ledger)
                </h3>
                <p className="text-[11px] text-slate-500">إجراء جرد فوري، تحويل البضائع والمنتجات بين المستودعات، وتتبع حركة الأصناف تفصيلياً.</p>
              </div>
            </div>

            {/* Visual Warehouses metrics */}
            <div className="grid grid-cols-4 gap-3">
              {warehouses.map(w => (
                <div key={w.id} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex justify-between items-center">
                  <div className="space-y-1">
                    <span className="text-[11px] font-extrabold text-slate-900 block">{w.name}</span>
                    <div className="text-[9px] text-slate-400 font-medium">
                      <span>المشرف: {w.supervisor}</span>
                      <span className="mx-1.5">•</span>
                      <span>الموقع: {w.location}</span>
                    </div>
                  </div>
                  <div className="text-left space-y-1 shrink-0">
                    <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold">نشط</span>
                    <span className="text-[11px] font-mono font-black text-slate-800 block">سعة {w.capacity}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              
              {/* Interactive Transfer Form (المناقلات) */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <span className="text-xs font-black text-slate-800 block border-b pb-1 flex items-center gap-1.5 text-blue-700">
                  <ArrowLeftRight className="w-4 h-4" />
                  تحويل ومناقلة أصناف بين المستودعات (Stock Transfer)
                </span>

                <form onSubmit={handlePostTransfer} className="space-y-3 text-[11px]">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-600">من مستودع (المصدر):</label>
                      <select 
                        value={selectedSrcWarehouseId} 
                        onChange={e => setSelectedSrcWarehouseId(e.target.value)}
                        className="w-full p-2 border rounded bg-slate-50"
                      >
                        {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-600">إلى مستودع (الوجهة):</label>
                      <select 
                        value={selectedDestWarehouseId} 
                        onChange={e => setSelectedDestWarehouseId(e.target.value)}
                        className="w-full p-2 border rounded bg-slate-50"
                      >
                        {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2 space-y-1">
                      <label className="font-bold text-slate-600">الصنف المراد تحويله:</label>
                      <select 
                        value={selectedTransferItem} 
                        onChange={e => setSelectedTransferItem(e.target.value)}
                        className="w-full p-2 border rounded bg-slate-50 font-bold"
                      >
                        <option value="it-1">PRD-991 • رول تغليف بولي إيثيلين 1000متر</option>
                        <option value="it-2">PRD-102 • لوحة تحكم إلكترونية مدمجة 12قناة</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-600 font-sans">الكمية:</label>
                      <input 
                        type="number" 
                        value={transferQty} 
                        onChange={e => setTransferQty(Number(e.target.value))}
                        className="w-full p-1.5 border rounded bg-slate-50 font-mono font-bold"
                        min="1"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 font-sans">البيان وملاحظات التحويل:</label>
                    <input 
                      type="text" 
                      value={transferNotes} 
                      onChange={e => setTransferNotes(e.target.value)}
                      placeholder="كتابة سبب التحويل..." 
                      className="w-full p-2 border rounded bg-slate-50"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-black shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                    <span>ترحيل وإصدار سند مناقلة بضاعة</span>
                  </button>
                </form>

                {/* Historical transfers list */}
                <div className="space-y-1.5 pt-2 border-t">
                  <span className="text-[11px] font-bold text-slate-500 block">سجل المناقلات الأخيرة بالشبكة:</span>
                  <div className="space-y-1 text-[10px]">
                    {transfers.map(tr => (
                      <div key={tr.id} className="p-2 bg-slate-50 border rounded flex justify-between items-center">
                        <div>
                          <span className="font-extrabold text-slate-800">{tr.item} ({tr.qty} وحدة)</span>
                          <p className="text-[9px] text-slate-400">{tr.from} ← {tr.to}</p>
                        </div>
                        <div className="text-left">
                          <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-black border border-emerald-100">{tr.status}</span>
                          <span className="text-[9px] text-slate-400 block mt-1">{tr.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Warehouse Audit / Count Grid (جرد المستودع) */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <span className="text-xs font-black text-slate-800 block border-b pb-1 flex items-center gap-1.5 text-purple-700">
                    <ClipboardList className="w-4 h-4" />
                    تقرير الجرد الفعلي وتسوية الفوارق (Physical Inventory Audit)
                  </span>

                  <div className="space-y-1 text-[11px]">
                    <label className="font-bold text-slate-600">اختر المستودع المستهدف للجرد:</label>
                    <select className="p-1.5 border rounded bg-slate-50 w-full">
                      <option value="wh-1">مستودع الرياض المركزي للقطع التالفة</option>
                      <option value="wh-2">مخزن المواد الخام الرئيسي</option>
                    </select>
                  </div>

                  {/* Audit items table */}
                  <div className="border rounded-lg overflow-hidden text-[10.5px]">
                    <div className="p-2 bg-slate-100 font-bold grid grid-cols-4 border-b">
                      <span>اسم الصنف</span>
                      <span className="text-center">أرصدة الميزان</span>
                      <span className="text-center font-sans">الجرد الفعلي</span>
                      <span className="text-left font-mono">الفوارق</span>
                    </div>

                    <div className="divide-y text-slate-700">
                      {auditItems.map(item => (
                        <div key={item.id} className="p-2.5 grid grid-cols-4 items-center hover:bg-slate-50">
                          <span className="font-bold truncate pr-1" title={item.name}>{item.name}</span>
                          <span className="text-center font-mono">{item.sysQty}</span>
                          <span className="text-center font-mono">
                            <input 
                              type="number" 
                              value={item.actualQty} 
                              onChange={e => {
                                const val = Number(e.target.value);
                                setAuditItems(prev => prev.map(ai => {
                                  if (ai.id === item.id) {
                                    return { ...ai, actualQty: val, variance: val - ai.sysQty };
                                  }
                                  return ai;
                                }));
                              }}
                              className="w-12 text-center p-0.5 border rounded bg-slate-50 font-bold"
                            />
                          </span>
                          <span className={`text-left font-mono font-black ${
                            item.variance === 0 
                              ? 'text-slate-500' 
                              : item.variance < 0 
                                ? 'text-red-600' 
                                : 'text-emerald-600'
                          }`}>
                            {item.variance > 0 ? `+${item.variance}` : item.variance}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    onClick={handleSaveAuditCount}
                    className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-black shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>تأكيد ومطابقة فروقات الجرد وتصحيح الميزان</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ==========================================
            TAB 4: Permissions (الصلاحيات والخصوصية)
            ========================================== */}
        {activeTab === 'permissions' && (
          <div className="space-y-4">
            <div className="border-b pb-2 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                  مصفوفة الصلاحيات الاحترافية (Professional Security Policies)
                </h3>
                <p className="text-[11px] text-slate-500">تخصيص الصلاحيات بدقة عالية على مستوى الزر، الشاشة، التقرير، الفرع والشركة للأقسام المختلفة.</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 text-[11px]">
              
              {/* Left Column: Select role */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs space-y-2 h-fit">
                <span className="font-black text-xs text-slate-800 block border-b pb-1">اختر الدور الوظيفي / القسم:</span>
                <div className="space-y-1">
                  {securityRoles.map(role => (
                    <button 
                      key={role.id}
                      onClick={() => setSelectedRoleId(role.id)}
                      className={`w-full text-right p-2.5 rounded text-xs transition-all ${
                        role.id === selectedRoleId 
                          ? 'bg-blue-600 text-white font-extrabold shadow-xs' 
                          : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="font-black truncate">{role.name}</div>
                      <div className={`text-[9px] mt-0.5 ${role.id === selectedRoleId ? 'text-white/80' : 'text-slate-400'}`}>{role.department}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Column: Permission control grid */}
              <div className="col-span-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-xs font-black text-slate-800">
                    تعديل صلاحيات الوصول والعمليات لـ: <span className="text-blue-600">[{activeRole.name}]</span>
                  </span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold font-mono">Department: {activeRole.department}</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  
                  {/* Left sub-section: Structural Scopes */}
                  <div className="space-y-3">
                    <span className="font-black text-slate-700 block border-b pb-1 text-[10.5px]">نطاق الوصول الجغرافي والشركات (Structural Scopes)</span>
                    
                    <div className="space-y-2.5">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-500">الوصول على مستوى الشركات:</label>
                        <select 
                          value={activeRole.companyAccess}
                          onChange={e => handleUpdateRolePerm('companyAccess', e.target.value)}
                          className="w-full p-2 border rounded bg-slate-50 font-bold"
                        >
                          <option value="جميع الشركات">جميع الشركات القابضة والمجموعات التابعة</option>
                          <option value="شركة الصناعات والمصانع">شركة الميزان للتطوير الصناعي والمصانع فقط</option>
                          <option value="شركة لوجستية الأغذية">مؤسسة الحلول اللوجستية وتوزيع الأغذية فقط</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-500">الوصول على مستوى الفروع:</label>
                        <select 
                          value={activeRole.branchAccess}
                          onChange={e => handleUpdateRolePerm('branchAccess', e.target.value)}
                          className="w-full p-2 border rounded bg-slate-50 font-bold"
                        >
                          <option value="جميع الفروع">وصول كلي لكافة الفروع المشتركة</option>
                          <option value="فروع الرياض وجدة">فروع الرياض وجدة والمستودعات فقط</option>
                          <option value="فرع جدة فقط">فرع المنطقة الغربية - جدة فقط</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-500">الوصول لشاشات النظام:</label>
                        <select 
                          value={activeRole.screenAccess}
                          onChange={e => handleUpdateRolePerm('screenAccess', e.target.value)}
                          className="w-full p-2 border rounded bg-slate-50 font-bold"
                        >
                          <option value="كامل الوصول">كامل الواجهات بما فيها التحكم بالنظام</option>
                          <option value="شاشات المواد والمناقلات">المستودعات، المواد، وسندات التحويل المستودعي</option>
                          <option value="فاتورة بيع ومردودات">فاتورة البيع، كرت العميل، ومردود المبيعات</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Right sub-section: Document Actions Buttons */}
                  <div className="space-y-3">
                    <span className="font-black text-slate-700 block border-b pb-1 text-[10.5px]">صلاحيات العمليات والأزرار (Document & Actions Buttons)</span>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                        <div>
                          <span className="font-extrabold text-slate-800 block">زر تعديل المستندات المصدرة (Edit Actions)</span>
                          <span className="text-[9px] text-slate-400 font-medium">صلاحية تعديل سندات القيد والفواتير المرحلة سابقاً</span>
                        </div>
                        <select 
                          value={activeRole.editPermission}
                          onChange={e => handleUpdateRolePerm('editPermission', e.target.value)}
                          className="p-1 border rounded bg-white text-xs font-bold"
                        >
                          <option value="مفعل">مفعل ✓</option>
                          <option value="معطل">معطل ✗</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                        <div>
                          <span className="font-extrabold text-slate-800 block">زر حذف المستندات نهائياً (Delete Actions)</span>
                          <span className="text-[9px] text-slate-400 font-medium">حذف الفواتير من نظام SQL نهائياً دون تعليق</span>
                        </div>
                        <select 
                          value={activeRole.deletePermission}
                          onChange={e => handleUpdateRolePerm('deletePermission', e.target.value)}
                          className="p-1 border rounded bg-white text-xs font-bold"
                        >
                          <option value="مفعل">مفعل ✓</option>
                          <option value="معطل">معطل ✗</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                        <div>
                          <span className="font-extrabold text-slate-800 block">صلاحية التقارير والمخرجات (Reports Export)</span>
                          <span className="text-[9px] text-slate-400 font-medium">طباعة كشوف الحساب وتصديرها لملفات Excel/PDF</span>
                        </div>
                        <select 
                          value={activeRole.reportPermission}
                          onChange={e => handleUpdateRolePerm('reportPermission', e.target.value)}
                          className="p-1 border rounded bg-white text-xs font-bold"
                        >
                          <option value="مفعل">مفعل ✓</option>
                          <option value="تقارير جرد">تقارير جرد ومواد فقط</option>
                          <option value="مبيعات يومية">مبيعات يومية الكاشير فقط</option>
                        </select>
                      </div>
                    </div>
                  </div>

                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded text-[10px] text-blue-900 leading-normal flex items-start gap-1.5">
                  <ShieldAlert className="w-4.5 h-4.5 text-blue-600 shrink-0" />
                  <span><strong>سرية فائقة وتدقيق:</strong> أي تغيير في الصلاحيات يتم تسجيله بالثانية في سجل التدقيق الأمني (Audit Trail) المشفر لمنع التعديلات المشبوهة أو غير المصرح بها من الموظفين الفروع.</span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ==========================================
            TAB 5: Workflows (تدفق المستندات والاعتماد)
            ========================================== */}
        {activeTab === 'workflow' && (
          <div className="space-y-4">
            <div className="border-b pb-2 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                  <GitFork className="w-5 h-5 text-purple-600 rotate-180" />
                  إعداد وتخصيص تدفق الموافقات (Enterprise Workflows Designer)
                </h3>
                <p className="text-[11px] text-slate-500">تصميم مسار الموافقة للمستندات الكبرى قبل التثبيت النهائي (مسودة ← مراجعة ← اعتماد CFO ← اعتماد عام).</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              
              {/* Workflows Designer Column */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <span className="text-xs font-black text-slate-800 block border-b pb-1">اختر مسار المستند لتخصيص مراحله:</span>
                
                <select 
                  value={selectedWorkflowId} 
                  onChange={e => setSelectedWorkflowId(e.target.value)}
                  className="w-full p-2 text-xs border rounded bg-slate-50 font-bold"
                >
                  {workflows.map(wf => (
                    <option key={wf.id} value={wf.id}>{wf.name}</option>
                  ))}
                </select>

                <div className="space-y-3.5 relative border-r-2 border-dashed border-purple-300 pr-4 mr-2 pt-2">
                  {activeWorkflow.stages.map((stg, idx) => (
                    <div key={idx} className="relative group text-[11px]">
                      <span className="absolute -right-[23px] top-1 bg-purple-600 text-white w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold text-[9px] border-2 border-white shadow-xs">
                        {idx + 1}
                      </span>

                      <div className="bg-slate-50 border p-2.5 rounded-lg space-y-0.5">
                        <div className="font-extrabold text-slate-800 flex justify-between items-center">
                          <span>{stg}</span>
                          <span className="text-[8px] bg-purple-100 text-purple-700 px-1 rounded font-bold">مرحلة معتمدة</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-2.5 bg-purple-50 border border-purple-200 rounded text-[9.5px] text-purple-900 leading-normal">
                  تلقائياً، عندما ينشئ المحاسب الفاتورة، تذهب في صندوق بريد المعنيين في المرحلة اللاحقة، ولا ترحل للميزان المالي إلا بعد إتمام المسار بالكامل.
                </div>
              </div>

              {/* Workflow Live Simulator Column */}
              <div className="col-span-2 bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <div className="border-b pb-2 flex justify-between items-center">
                  <span className="text-xs font-black text-slate-800">
                    محاكي تدفق مستند معلق (Workflow Live Simulator)
                  </span>
                  <span className="text-[10px] bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded font-black border border-amber-200">
                    {workflowSimDoc.status}
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-black">{activeWorkflow.docType}</span>
                      <h4 className="text-xs font-extrabold text-slate-900 mt-1.5">{workflowSimDoc.id} — {workflowSimDoc.type}</h4>
                    </div>
                    <div className="text-left font-mono shrink-0">
                      <span className="text-sm font-black text-slate-900">{workflowSimDoc.amount}</span>
                    </div>
                  </div>

                  {/* Staggered approvals slider visualization */}
                  <div className="flex items-center gap-1.5 justify-between py-2 text-[9px] font-black border-y">
                    {activeWorkflow.stages.map((stg, sIdx) => {
                      const isPassed = sIdx < workflowSimDoc.currentStageIdx;
                      const isCurrent = sIdx === workflowSimDoc.currentStageIdx;
                      return (
                        <div key={sIdx} className="flex-1 text-center space-y-1">
                          <div className={`h-1.5 rounded-full ${
                            isPassed ? 'bg-emerald-500' : isCurrent ? 'bg-amber-500 animate-pulse' : 'bg-slate-200'
                          }`} />
                          <span className={`block truncate ${
                            isPassed ? 'text-emerald-700' : isCurrent ? 'text-amber-700' : 'text-slate-400'
                          }`} title={stg}>{stg.split(' (')[0]}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* History audit log inside simulator card */}
                  <div className="p-2.5 bg-white border rounded border-slate-150 text-[10px] space-y-1.5 text-slate-500">
                    <span className="font-extrabold text-slate-700 block">سجلات التواقيع الرقمية للمستند:</span>
                    {workflowSimDoc.history.map((h, hIdx) => (
                      <div key={hIdx} className="flex justify-between items-center bg-slate-50/50 p-1 rounded px-2">
                        <span>{h.user}: <strong className="text-slate-600">{h.action}</strong></span>
                        <span className="font-mono text-slate-400 text-[9px]">{h.time}</span>
                      </div>
                    ))}
                  </div>

                  {/* Interactive Approve/Reject Buttons */}
                  <div className="flex gap-2 justify-end pt-1">
                    <button 
                      onClick={handleWorkflowReject}
                      className="px-4 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold text-[10.5px] rounded transition-all cursor-pointer"
                    >
                      رفض وإرجاع (Reject)
                    </button>

                    <button 
                      onClick={handleWorkflowApprove}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10.5px] rounded transition-all shadow-sm cursor-pointer"
                    >
                      موافقة وتوقيع إلكتروني (Approve)
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ==========================================
            TAB 6: High Performance (الأداء العالي وملايين القيود)
            ========================================== */}
        {activeTab === 'performance' && (
          <div className="space-y-4">
            <div className="border-b pb-2 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                  <Cpu className="w-5 h-5 text-blue-600" />
                  أداء محرك الاستعلامات والبيانات الضخمة (High-Performance Core)
                </h3>
                <p className="text-[11px] text-slate-500">مراقبة أداء الميزان تحت الضغط العالي مع ملايين السندات والفواتير لأكثر من 1000 مستخدم نشط.</p>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={handleOptimizeEngine}
                  disabled={isOptimizing}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white text-xs font-black rounded shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isOptimizing ? 'animate-spin' : ''}`} />
                  <span>تحسين وصيانة المحرك (Optimize)</span>
                </button>

                <button 
                  onClick={handleRunStressTest}
                  disabled={isStressTesting}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white text-xs font-black rounded shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Activity className={`w-3.5 h-3.5 ${isStressTesting ? 'animate-pulse' : ''}`} />
                  <span>بدء اختبار الضغط العالي (Stress Test)</span>
                </button>
              </div>
            </div>

            {/* Performance KPIs Grid */}
            <div className="grid grid-cols-4 gap-4 text-slate-700">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block">المستخدمون المتصلون متزامنين:</span>
                <p className="text-xl font-mono font-black text-slate-800">{connectedUsers.toLocaleString()}</p>
                <span className="text-[9px] text-slate-400 block">منفذون على مخدمات Cluster</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block">إجمالي عدد الفواتير المرحلة:</span>
                <p className="text-xl font-mono font-black text-slate-800">{totalInvoicesCount.toLocaleString()}</p>
                <span className="text-[9px] text-slate-400 block">تخزين موزّع Partitioned</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block">زمن استجابة الاستعلام (Latency):</span>
                <p className={`text-xl font-mono font-black ${queryLatency > 100 ? 'text-red-600' : queryLatency > 30 ? 'text-amber-600' : 'text-emerald-600'}`}>{queryLatency} ms</p>
                <span className="text-[9px] text-slate-400 block">أداء فوري وفحص ذاتي</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block">معدل إصابة الكاش (Cache Hit):</span>
                <p className="text-xl font-mono font-black text-slate-800">{memoryCacheHit}</p>
                <span className="text-[9px] text-slate-400 block">تخزين في الذاكرة المؤقتة لـ Redis</span>
              </div>
            </div>

            {/* Realtime Performance Optimization Log console */}
            <div className="bg-slate-950 p-4 rounded-xl font-mono text-[10.5px] text-slate-300 space-y-1.5 shadow-inner">
              <span className="text-slate-400 block border-b border-zinc-800 pb-1.5 font-bold">[ Meezan Enterprise Cluster Live Console Optimizer ]</span>
              <p className="text-slate-500">[2026-07-04 14:14] Initializing High-Performance Query Scheduler...</p>
              <p className="text-slate-500">[2026-07-04 14:14] Sharding enabled: 4 Databases shards loaded.</p>
              <p className="text-emerald-400">[2026-07-04 14:14] SQL Indexer: All {totalItemsCount.toLocaleString()} items are indexed successfully on column barcode.</p>
              <p className="text-blue-400">[2026-07-04 14:14] Load Balancer: Ingress traffic healthy across 3 cluster nodes.</p>
              {isStressTesting && (
                <>
                  <p className="text-red-400 animate-pulse">[WARN] High traffic incoming! 1,480 concurrent sessions registered.</p>
                  <p className="text-amber-400">[OPTIMIZER] Micro partitioning activated on ledger table to speed up journal entry post.</p>
                </>
              )}
              {isOptimizing && (
                <>
                  <p className="text-emerald-400">[REINDEX] Rebuilding indexes on sales invoices table...</p>
                  <p className="text-emerald-400">[CACHE] Garbage collection completed. Redis cache flushed and warm-up initiated.</p>
                </>
              )}
              <p className="text-slate-400">[OK] DB Indexing Status: <span className="font-extrabold text-white">{indexingStatus}</span>.</p>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 7: Comprehensive Audit Trail (سجل المراقبة والتدقيق)
            ========================================== */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            <div className="border-b pb-2 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                  <History className="w-5 h-5 text-blue-600" />
                  سجل المراقبة والتدقيق الشامل والامتثال (Comprehensive Audit Trail)
                </h3>
                <p className="text-[11px] text-slate-500">رصد دقيق لكافة حركات الموظفين بالبرنامج بالثانية (العملية، المستخدم، الشاشة، القيمة السابقة والجديدة).</p>
              </div>

              {/* Filters */}
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={auditFilterUser}
                  onChange={e => setAuditFilterUser(e.target.value)}
                  placeholder="فلترة حسب الموظف..." 
                  className="p-1.5 text-xs border rounded bg-white w-40 font-bold"
                />
                <input 
                  type="text" 
                  value={auditFilterScreen}
                  onChange={e => setAuditFilterScreen(e.target.value)}
                  placeholder="فلترة حسب الشاشة..." 
                  className="p-1.5 text-xs border rounded bg-white w-40 font-bold"
                />
                <button 
                  onClick={() => {
                    setAuditFilterUser('');
                    setAuditFilterScreen('');
                    showToast('تم تصفية وإعادة تعيين الفلاتر', 'info');
                  }}
                  className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs rounded font-black cursor-pointer"
                >
                  إعادة تعيين
                </button>
              </div>
            </div>

            {/* Audit log table */}
            <div className="bg-white border rounded-xl overflow-hidden shadow-xs text-[11px]">
              <div className="p-3 bg-slate-100 text-slate-600 font-black border-b grid grid-cols-12 text-center">
                <span className="col-span-2">التاريخ والوقت</span>
                <span>المستخدم</span>
                <span className="col-span-2">الشركة</span>
                <span className="col-span-2">الشاشة</span>
                <span>العملية</span>
                <span className="col-span-2">القيمة القديمة / الجديدة</span>
                <span>الحالة</span>
                <span>المحطة</span>
              </div>

              <div className="divide-y divide-slate-100">
                {filteredAuditLogs.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 font-bold">
                    لا يوجد حركات تطابق الفلاتر المحددة حالياً.
                  </div>
                ) : (
                  filteredAuditLogs.map(log => (
                    <div key={log.id} className="p-3 grid grid-cols-12 text-center items-center hover:bg-slate-50 text-slate-700 font-medium">
                      <span className="col-span-2 font-mono text-[10px] text-slate-400">{log.time}</span>
                      <span className="font-extrabold text-slate-800">{log.user.split(' (')[0]}</span>
                      <span className="col-span-2 truncate text-slate-500 font-bold px-1" title={log.company}>{log.company}</span>
                      <span className="col-span-2 text-slate-600 font-bold">{log.screen}</span>
                      <span className="bg-slate-100 text-slate-700 py-0.5 px-1 rounded truncate font-bold text-[10px]" title={log.action}>{log.action}</span>
                      
                      <div className="col-span-2 text-right px-2 space-y-0.5 truncate border-x">
                        <div className="text-[9.5px] text-slate-400 truncate"><span className="font-bold">ق:</span> {log.oldValue}</div>
                        <div className="text-[9.5px] text-blue-600 truncate"><span className="font-bold">ج:</span> {log.newValue}</div>
                      </div>

                      <span className={`font-black ${
                        log.status.includes('مرفوض') 
                          ? 'text-red-600' 
                          : log.status.includes('تنبيه') 
                            ? 'text-amber-600 font-extrabold' 
                            : 'text-emerald-600'
                      }`}>{log.status}</span>
                      <span className="font-mono text-[10px] text-slate-400 truncate" title={log.workstation}>{log.workstation}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

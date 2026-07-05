import React, { useState, useEffect } from 'react';
import { useErp } from '../../context/ErpContext';
import { 
  Smartphone, Wifi, WifiOff, RefreshCw, Database, ShoppingCart, 
  Package, CheckCircle, SmartphoneIcon, Camera, AlertCircle, Trash2, ArrowRight
} from 'lucide-react';

interface AndroidHubWindowProps {
  windowId: string;
  onClose: () => void;
}

export const AndroidHubWindow: React.FC<AndroidHubWindowProps> = ({ windowId, onClose }) => {
  const { items, invoices, addInvoice, showToast, isOnline, triggerSync, pendingSyncCount, currentUser } = useErp();
  
  // Simulated mobile state
  const [mobileOnline, setMobileOnline] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'home' | 'scanner' | 'invoice' | 'stock' | 'sync'>('home');
  const [scannedCode, setScannedCode] = useState<string>('');
  const [scannedProduct, setScannedProduct] = useState<any>(null);
  
  // Mobile offline invoice form
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [customerName, setCustomerName] = useState<string>('عميل سفري / نقدي');
  
  // Mobile local db records
  const [localInvoices, setLocalInvoices] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Synchronize mobile with parent ERP context
  useEffect(() => {
    setMobileOnline(isOnline);
  }, [isOnline]);

  const handleScanBarcode = (code: string) => {
    setScannedCode(code);
    const found = items.find(i => i.barcode === code || i.code === code);
    if (found) {
      setScannedProduct(found);
      showToast(`تم مسح مادة: ${found.name}`, 'success');
    } else {
      setScannedProduct(null);
      showToast(`الرمز ${code} غير معرف بقاعدة بيانات المواد`, 'warning');
    }
  };

  const handleCreateMobileInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId) {
      showToast('يرجى اختيار مادة أولاً', 'error');
      return;
    }
    const item = items.find(i => i.id === selectedItemId);
    if (!item) return;

    const newMobInvoice = {
      id: 'mob-inv-' + Date.now(),
      invoiceNo: 'MOB-' + (1000 + invoices.length + localInvoices.length),
      date: new Date().toISOString().split('T')[0],
      customerName: customerName,
      item: item.name,
      quantity: quantity,
      unitPrice: item.salePrice,
      total: item.salePrice * quantity,
      synced: mobileOnline
    };

    if (mobileOnline) {
      // Direct post to central DB
      showToast('جاري ترحيل الفاتورة مباشرة للمخدم الرئيسي للشركة...', 'info');
      // Create a compatible main invoice
      const centralInvoice = {
        id: newMobInvoice.id,
        invoiceNo: newMobInvoice.invoiceNo,
        type: 'sale' as const,
        date: newMobInvoice.date,
        description: 'مبيعات من تطبيق الأندرويد المحمول',
        branchId: 'br-1',
        customerId: 'cust-1',
        currencyId: 'curr-sar',
        exchangeRate: 1,
        paymentMethod: 'cash' as const,
        warehouseId: 'wh-1',
        cashAccountId: 'acc-111001',
        itemsAccountId: 'acc-411001',
        debitCostCenterId: 'cc-1',
        creditCostCenterId: 'cc-1',
        posted: true,
        entryCreated: true,
        paidAmount: newMobInvoice.total,
        salesRepId: 'rep-1',
        notes: `العميل: ${customerName}`,
        items: [{
          id: 'row-' + Date.now(),
          itemId: selectedItemId,
          quantity: quantity,
          unitPrice: item.salePrice,
          unit: item.unit,
          notes: 'مبيعات موبايل',
          total: newMobInvoice.total
        }],
        discount: 0,
        addition: 0,
        taxPercent: 15,
        expenses: 0,
        netAmount: newMobInvoice.total
      };
      addInvoice(centralInvoice);
      showToast('تم ترحيل الفاتورة وحفظها بالمخدم بنجاح!', 'success');
    } else {
      // Save locally to smartphone SQLite simulated storage
      setLocalInvoices(prev => [newMobInvoice, ...prev]);
      showToast('تنبيه: تم حفظ الفاتورة محلياً بذاكرة الموبايل (وضع أوفلاين)', 'warning');
    }

    // Reset Form
    setSelectedItemId('');
    setQuantity(1);
    setCustomerName('عميل سفري / نقدي');
    setActiveTab('home');
  };

  const triggerMobileSync = async () => {
    const unsynced = localInvoices.filter(i => !i.synced);
    if (unsynced.length === 0) {
      showToast('لا توجد فواتير معلقة للمزامنة بالموبايل', 'info');
      return;
    }

    setIsSyncing(true);
    showToast('بدء ترحيل ومزامنة الفواتير غير المرفوعة للمخدم...', 'info');
    
    // Simulate API network latency
    await new Promise(resolve => setTimeout(resolve, 1500));

    unsynced.forEach(mobInv => {
      const item = items.find(i => i.name === mobInv.item);
      const centralInvoice = {
        id: mobInv.id,
        invoiceNo: mobInv.invoiceNo,
        type: 'sale' as const,
        date: mobInv.date,
        description: 'مبيعات أندرويد أوفلاين ومزامنة تلقائية',
        branchId: 'br-1',
        customerId: 'cust-1',
        currencyId: 'curr-sar',
        exchangeRate: 1,
        paymentMethod: 'cash' as const,
        warehouseId: 'wh-1',
        cashAccountId: 'acc-111001',
        itemsAccountId: 'acc-411001',
        debitCostCenterId: 'cc-1',
        creditCostCenterId: 'cc-1',
        posted: true,
        entryCreated: true,
        paidAmount: mobInv.total,
        salesRepId: 'rep-1',
        notes: `تمت المزامنة لـ: ${mobInv.customerName}`,
        items: [{
          id: 'row-' + Date.now(),
          itemId: item ? item.id : 'item-1',
          quantity: mobInv.quantity,
          unitPrice: mobInv.unitPrice,
          unit: item ? item.unit : 'عدد',
          notes: 'مزامنة أوفلاين',
          total: mobInv.total
        }],
        discount: 0,
        addition: 0,
        taxPercent: 15,
        expenses: 0,
        netAmount: mobInv.total
      };
      addInvoice(centralInvoice);
    });

    // Mark all as synced
    setLocalInvoices(prev => prev.map(i => ({ ...i, synced: true })));
    setIsSyncing(false);
    showToast(`اكتملت المزامنة! تم رفع ${unsynced.length} فواتير بنجاح وقفل الأرصدة.`, 'success');
  };

  const removeLocalInvoice = (id: string) => {
    setLocalInvoices(prev => prev.filter(i => i.id !== id));
    showToast('تم مسح الفاتورة المحلية من ذاكرة الجهاز الهاتف', 'info');
  };

  return (
    <div className="flex h-full bg-slate-100 p-4 select-none overflow-hidden" dir="rtl">
      
      {/* LEFT INFORMATION/DOCUMENTATION COLUMN */}
      <div className="w-[300px] bg-slate-50 border-l border-slate-200 p-4 shrink-0 flex flex-col justify-between overflow-y-auto">
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <Smartphone className="w-5 h-5 text-emerald-600" />
            <h3 className="text-xs font-extrabold text-slate-800">تطبيق المبيعات والمستودعات المحمول</h3>
          </div>

          <p className="text-[11.5px] text-slate-600 leading-relaxed font-semibold">
            هذا القسم يمثل محاكي نظام الأندرويد المتقدم (الميزان Mobile App)، وهو تطبيق مصمم للعمل كاملاً بدون إنترنت (Offline-First) لتمكين مندوبي المبيعات وأمناء المستودعات من أداء مهامهم الميدانية بسلاسة تامة.
          </p>

          <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg space-y-2">
            <span className="text-[11px] font-black text-emerald-800 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" />
              <span>أبرز القدرات والمميزات:</span>
            </span>
            <ul className="text-[10.5px] text-emerald-700 space-y-1 pr-3 list-disc font-medium">
              <li>قاعدة بيانات SQLite محلية مخزنة بالكامل بالهاتف.</li>
              <li>مسح باركود المواد والمنتجات بكاميرا الهاتف.</li>
              <li>إصدار فواتير وسندات مبيعات مباشرة للعملاء.</li>
              <li>مزامنة ذكية ثنائية الاتجاه عند توفر الشبكة.</li>
            </ul>
          </div>

          {/* Sync status overview info */}
          <div className="bg-slate-900 text-slate-100 p-3.5 rounded-lg space-y-2 text-[11px] font-mono">
            <div className="text-amber-400 font-bold border-b border-slate-800 pb-1 flex items-center justify-between">
              <span>إحصائيات الاتصال بالأجهزة</span>
              <SmartphoneIcon className="w-3.5 h-3.5" />
            </div>
            <div className="flex justify-between">
              <span>الفواتير المحلية بالهاتف:</span>
              <span className="font-extrabold text-white">{localInvoices.length}</span>
            </div>
            <div className="flex justify-between">
              <span>الفواتير غير المرفوعة:</span>
              <span className="font-extrabold text-red-400">{localInvoices.filter(i => !i.synced).length}</span>
            </div>
            <div className="flex justify-between">
              <span>الفواتير المرفوعة:</span>
              <span className="font-extrabold text-emerald-400">{localInvoices.filter(i => i.synced).length}</span>
            </div>
          </div>
        </div>

        <div className="text-[10px] text-slate-400 border-t pt-2 text-center font-bold">
          نظام الميزان المحمول © 2026
        </div>
      </div>

      {/* RIGHT PHONE MOCKUP COLUMN */}
      <div className="flex-1 flex items-center justify-center">
        
        {/* Smartphone Wrapper Frame */}
        <div className="w-[310px] h-[520px] bg-slate-900 rounded-[35px] p-3 shadow-2xl relative border-4 border-slate-800 flex flex-col justify-between">
          
          {/* Top Notch Speaker and Camera */}
          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-32 h-4 bg-slate-900 rounded-b-xl z-30 flex items-center justify-center gap-1.5">
            <div className="w-12 h-1 bg-slate-800 rounded-full"></div>
            <div className="w-2.5 h-2.5 bg-slate-800 rounded-full"></div>
          </div>

          {/* Simulated Mobile Screen Canvas */}
          <div className="w-full h-full bg-white rounded-[24px] overflow-hidden flex flex-col justify-between border border-slate-950 shadow-inner relative pt-5">
            
            {/* Phone OS Status Bar */}
            <div className="bg-slate-900 text-white text-[9.5px] px-3.5 py-1 flex items-center justify-between font-bold absolute top-0 left-0 right-0 z-20 font-sans">
              <span>12:30 م</span>
              <div className="flex items-center gap-1.5">
                {mobileOnline ? (
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Wifi className="w-3 h-3" />
                    <span>متصل</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-red-400 animate-pulse">
                    <WifiOff className="w-3 h-3" />
                    <span>أوفلاين</span>
                  </span>
                )}
                <span>🔋 85%</span>
              </div>
            </div>

            {/* Mobile App Viewport */}
            <div className="flex-1 bg-slate-50 overflow-y-auto p-3 text-slate-800 flex flex-col text-right">
              
              {/* Tab Title/App Bar Header */}
              <div className="bg-emerald-600 text-white px-3 py-2 rounded-lg shadow flex items-center justify-between mb-3 shrink-0">
                <span className="text-[12px] font-black">الميزان Mobile</span>
                <button 
                  onClick={() => setMobileOnline(!mobileOnline)}
                  className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${mobileOnline ? 'bg-emerald-700' : 'bg-red-600'}`}
                  title="محاكاة تبديل الشبكة للهاتف"
                >
                  {mobileOnline ? 'قطع الشبكة' : 'تشغيل الشبكة'}
                </button>
              </div>

              {/* VIEW RENDERER BASED ON TAB */}
              {activeTab === 'home' && (
                <div className="space-y-2.5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="text-center py-2 bg-white rounded-lg border shadow-xs mb-3">
                      <p className="text-[10px] text-slate-400 font-bold">اسم المندوب الميداني</p>
                      <p className="text-[12px] text-slate-800 font-extrabold">{currentUser?.fullName || 'أحمد المدير'}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => setActiveTab('scanner')}
                        className="bg-white p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/20 shadow-xs flex flex-col items-center justify-center text-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Camera className="w-5 h-5 text-emerald-600" />
                        <span className="text-[10.5px] font-black text-slate-800">قراءة باركود</span>
                      </button>

                      <button 
                        onClick={() => setActiveTab('invoice')}
                        className="bg-white p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/20 shadow-xs flex flex-col items-center justify-center text-center gap-1.5 transition-all cursor-pointer"
                      >
                        <ShoppingCart className="w-5 h-5 text-blue-600" />
                        <span className="text-[10.5px] font-black text-slate-800">فاتورة بيع</span>
                      </button>

                      <button 
                        onClick={() => setActiveTab('stock')}
                        className="bg-white p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/20 shadow-xs flex flex-col items-center justify-center text-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Package className="w-5 h-5 text-amber-600" />
                        <span className="text-[10.5px] font-black text-slate-800">التحقق من المخزون</span>
                      </button>

                      <button 
                        onClick={() => setActiveTab('sync')}
                        className="bg-white p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/20 shadow-xs flex flex-col items-center justify-center text-center gap-1.5 transition-all cursor-pointer relative"
                      >
                        <RefreshCw className="w-5 h-5 text-purple-600" />
                        <span className="text-[10.5px] font-black text-slate-800">سجل المزامنة</span>
                        {localInvoices.filter(i => !i.synced).length > 0 && (
                          <span className="absolute top-1 right-1 bg-red-500 text-white w-4 h-4 rounded-full text-[9px] flex items-center justify-center font-bold">
                            {localInvoices.filter(i => !i.synced).length}
                          </span>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Quick offline indicator banner */}
                  {!mobileOnline && (
                    <div className="bg-amber-50 border border-amber-300 p-2.5 rounded-lg flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <p className="text-[9px] text-amber-800 leading-relaxed font-bold">
                        أنت تعمل حالياً بدون إنترنت. سيتم تخزين كل الفواتير محلياً حتى تتصل مجدداً.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* SCANNER VIEW */}
              {activeTab === 'scanner' && (
                <div className="space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <button 
                      onClick={() => setActiveTab('home')}
                      className="text-[10px] text-slate-500 font-bold flex items-center gap-1"
                    >
                      <ArrowRight className="w-3 h-3" /> رجوع للرئيسية
                    </button>
                    <div className="text-[11px] font-extrabold text-slate-800 border-b pb-1">محاكاة مسح باركود بالهاتف</div>
                    
                    {/* Camera view simulation */}
                    <div className="bg-black aspect-video rounded-lg relative overflow-hidden flex flex-col items-center justify-center text-white border-2 border-emerald-500 shadow-md">
                      <div className="absolute inset-x-4 h-[1px] bg-red-500 top-1/2 animate-bounce"></div>
                      <Camera className="w-8 h-8 text-white/40 animate-pulse" />
                      <span className="text-[9px] text-white/60 font-mono mt-1">CAMERA_SIMULATOR_ACTIVE</span>
                    </div>

                    <div className="space-y-1.5 mt-2">
                      <label className="text-[10px] font-black text-slate-500">اختر مادة للمسح (محاكاة الكاميرا):</label>
                      <select 
                        className="w-full p-1.5 bg-white border border-slate-300 rounded text-[11px]"
                        onChange={(e) => handleScanBarcode(e.target.value)}
                        value={scannedCode}
                      >
                        <option value="">-- اختر مادة لتمريرها أمام العدسة --</option>
                        {items.slice(0, 10).map(i => (
                          <option key={i.id} value={i.barcode}>{i.name} ({i.barcode})</option>
                        ))}
                      </select>
                    </div>

                    {scannedProduct && (
                      <div className="bg-emerald-50 border border-emerald-200 p-2 rounded-lg text-[10.5px] mt-2 space-y-1">
                        <div className="font-extrabold text-emerald-800">{scannedProduct.name}</div>
                        <div className="flex justify-between text-slate-600">
                          <span>سعر البيع:</span>
                          <span className="font-bold text-slate-800">{scannedProduct.salePrice} ر.س</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>المخزون الحالي:</span>
                          <span className="font-extrabold text-slate-900">{scannedProduct.currentStock} {scannedProduct.unit}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* INVOICE VIEW */}
              {activeTab === 'invoice' && (
                <form onSubmit={handleCreateMobileInvoice} className="space-y-2.5 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <button 
                      onClick={() => setActiveTab('home')}
                      className="text-[10px] text-slate-500 font-bold flex items-center gap-1"
                      type="button"
                    >
                      <ArrowRight className="w-3 h-3" /> رجوع للرئيسية
                    </button>
                    <div className="text-[11px] font-extrabold text-slate-800 border-b pb-1">إنشاء فاتورة بيع جديدة</div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500">اسم العميل الميداني:</label>
                      <input 
                        type="text" 
                        value={customerName} 
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full p-1.5 bg-white border border-slate-300 rounded text-[11px]"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500">اختر المادة المباعة:</label>
                      <select 
                        value={selectedItemId} 
                        onChange={(e) => setSelectedItemId(e.target.value)}
                        className="w-full p-1.5 bg-white border border-slate-300 rounded text-[11px]"
                        required
                      >
                        <option value="">-- اختر مادة --</option>
                        {items.map(i => (
                          <option key={i.id} value={i.id}>{i.name} ({i.salePrice} ر.س)</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500">الكمية:</label>
                      <input 
                        type="number" 
                        min="1"
                        value={quantity} 
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        className="w-full p-1.5 bg-white border border-slate-300 rounded text-[11px] font-mono text-center"
                        required
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[11px] rounded-lg transition-colors cursor-pointer mt-3"
                  >
                    حفظ الفاتورة ({mobileOnline ? 'مزامنة مباشرة' : 'حفظ أوفلاين بالهاتف'})
                  </button>
                </form>
              )}

              {/* STOCK VIEW */}
              {activeTab === 'stock' && (
                <div className="space-y-2.5 flex-1 flex flex-col">
                  <button 
                    onClick={() => setActiveTab('home')}
                    className="text-[10px] text-slate-500 font-bold flex items-center gap-1"
                  >
                    <ArrowRight className="w-3 h-3" /> رجوع للرئيسية
                  </button>
                  <div className="text-[11px] font-extrabold text-slate-800 border-b pb-1">التحقق الفوري من مخزون المواد</div>
                  
                  <div className="space-y-1.5 overflow-y-auto max-h-[300px] flex-1">
                    {items.slice(0, 15).map(item => (
                      <div key={item.id} className="p-2 bg-white rounded-lg border border-slate-200 shadow-xs flex justify-between items-center text-[11px]">
                        <div>
                          <div className="font-extrabold text-slate-800">{item.name}</div>
                          <div className="text-[9px] text-slate-400 font-mono">الرمز: {item.code}</div>
                        </div>
                        <div className="text-left">
                          <span className={`px-2 py-0.5 rounded text-[9.5px] font-mono font-black ${item.currentStock > item.minLimit ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                            {item.currentStock} {item.unit}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SYNC VIEW */}
              {activeTab === 'sync' && (
                <div className="space-y-2.5 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <button 
                      onClick={() => setActiveTab('home')}
                      className="text-[10px] text-slate-500 font-bold flex items-center gap-1"
                    >
                      <ArrowRight className="w-3 h-3" /> رجوع للرئيسية
                    </button>
                    <div className="text-[11px] font-extrabold text-slate-800 border-b pb-1">سجل المزامنة وفواتير الموبايل</div>

                    <div className="space-y-1.5 overflow-y-auto max-h-[220px]">
                      {localInvoices.length === 0 ? (
                        <div className="text-center text-slate-400 py-6 text-[10.5px] font-bold">
                          لا توجد فواتير محلية مصدرة بالهاتف حالياً.
                        </div>
                      ) : (
                        localInvoices.map((inv) => (
                          <div key={inv.id} className="p-2 bg-white rounded-lg border border-slate-200 shadow-xs flex justify-between items-center text-[10px]">
                            <div>
                              <div className="font-extrabold text-slate-800">{inv.invoiceNo}</div>
                              <div className="text-slate-500">{inv.customerName}</div>
                              <div className="text-[9px] text-slate-400">{inv.item} × {inv.quantity}</div>
                            </div>
                            <div className="text-left space-y-1">
                              <div className="font-bold font-mono text-blue-700">{inv.total} ر.س</div>
                              <div className="flex gap-1 items-center justify-end">
                                <span className={`px-1 rounded-[4px] text-[8px] font-bold ${inv.synced ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700 animate-pulse'}`}>
                                  {inv.synced ? 'مرفوع' : 'معلق'}
                                </span>
                                {!inv.synced && (
                                  <button onClick={() => removeLocalInvoice(inv.id)} className="text-red-500 hover:text-red-700 p-0.5">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <button 
                    onClick={triggerMobileSync}
                    disabled={isSyncing || !mobileOnline}
                    className="w-full py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white font-black text-[11px] rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>مزامنة كافة المعلقات الآن ({localInvoices.filter(i => !i.synced).length})</span>
                  </button>
                </div>
              )}

            </div>

            {/* Android Navigation Bar Buttons */}
            <div className="bg-slate-900 h-9 shrink-0 flex items-center justify-around text-slate-500 border-t border-slate-950 px-6 z-20">
              <button onClick={() => setActiveTab('home')} className={`p-1 hover:text-white transition-colors cursor-pointer ${activeTab === 'home' ? 'text-emerald-400' : ''}`}>
                <Smartphone className="w-4 h-4" />
              </button>
              <button onClick={() => setActiveTab('scanner')} className={`p-1 hover:text-white transition-colors cursor-pointer ${activeTab === 'scanner' ? 'text-emerald-400' : ''}`}>
                <Camera className="w-4 h-4" />
              </button>
              <button onClick={() => setActiveTab('invoice')} className={`p-1 hover:text-white transition-colors cursor-pointer ${activeTab === 'invoice' ? 'text-emerald-400' : ''}`}>
                <ShoppingCart className="w-4 h-4" />
              </button>
              <button onClick={() => setActiveTab('sync')} className={`p-1 hover:text-white transition-colors cursor-pointer ${activeTab === 'sync' ? 'text-emerald-400' : ''}`}>
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

          </div>
          
        </div>

      </div>

    </div>
  );
};

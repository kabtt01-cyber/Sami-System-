import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { 
  QrCode, Printer, RefreshCw, Barcode, HelpCircle, 
  Settings, ShoppingCart, Plus, CheckCircle, Search, Sparkles
} from 'lucide-react';

interface BarcodeHubWindowProps {
  windowId: string;
  onClose: () => void;
}

export const BarcodeHubWindow: React.FC<BarcodeHubWindowProps> = ({ windowId, onClose }) => {
  const { items, addInvoice, invoices, showToast, theme } = useErp();

  // Generator settings
  const [selectedItemId, setSelectedItemId] = useState<string>(items[0]?.id || '');
  const [barcodeType, setBarcodeType] = useState<'EAN_13' | 'CODE_128' | 'QR_CODE'>('CODE_128');
  const [customText, setCustomText] = useState<string>('');
  const [showPrice, setShowPrice] = useState<boolean>(true);
  const [showCompanyName, setShowCompanyName] = useState<boolean>(true);
  
  // Sticker layout settings
  const [stickerWidth, setStickerWidth] = useState<number>(38); // mm
  const [stickerHeight, setStickerHeight] = useState<number>(25); // mm
  const [printQty, setPrintQty] = useState<number>(10);

  // Sales register simulation
  const [scanningBarcode, setScanningBarcode] = useState<string>('');
  const [salesCart, setSalesCart] = useState<any[]>([]);

  const activeItem = items.find(i => i.id === selectedItemId);

  const handleSimulateScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanningBarcode) return;

    const found = items.find(i => i.barcode === scanningBarcode || i.code === scanningBarcode);
    if (found) {
      // Add to sales register cart
      const existing = salesCart.find(c => c.item.id === found.id);
      if (existing) {
        setSalesCart(prev => prev.map(c => c.item.id === found.id ? { ...c, qty: c.qty + 1, total: c.item.salePrice * (c.qty + 1) } : c));
      } else {
        setSalesCart(prev => [...prev, {
          id: 'cart-' + Date.now(),
          item: found,
          qty: 1,
          total: found.salePrice
        }]);
      }
      showToast(`تم العثور على مادة: ${found.name} وإضافتها لقائمة المبيعات!`, 'success');
      setScanningBarcode('');
    } else {
      showToast(`عذراً، الرمز الباركود (${scanningBarcode}) غير معرف بالكامل في بطاقات المواد.`, 'error');
    }
  };

  const handleCreateSalesInvoiceFromCart = () => {
    if (salesCart.length === 0) {
      showToast('سلة المبيعات فارغة حالياً', 'warning');
      return;
    }

    const totalCartSum = salesCart.reduce((sum, c) => sum + c.total, 0);
    const newInvoice = {
      id: 'inv-bc-' + Date.now(),
      invoiceNo: 'BC-' + (2000 + invoices.length),
      type: 'sale' as const,
      date: new Date().toISOString().split('T')[0],
      description: 'مبيعات فورية عن طريق قارئ الباركود والـ QR السريع',
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
      paidAmount: totalCartSum,
      salesRepId: 'rep-1',
      notes: 'تم توليدها تلقائياً بمسح الباركود',
      items: salesCart.map((c, idx) => ({
        id: `row-${idx}-${Date.now()}`,
        itemId: c.item.id,
        quantity: c.qty,
        unitPrice: c.item.salePrice,
        unit: c.item.unit,
        notes: 'مبيعات باركود ذكية',
        total: c.total
      })),
      discount: 0,
      addition: 0,
      taxPercent: 15,
      expenses: 0,
      netAmount: totalCartSum
    };

    addInvoice(newInvoice);
    showToast(`تم إصدار فاتورة مبيعات برقم ${newInvoice.invoiceNo} بقيمة ${totalCartSum} ر.س!`, 'success');
    setSalesCart([]);
  };

  // Render a mock visual barcode representing code/EAN/QR
  const renderVisualCode = () => {
    const codeVal = activeItem ? activeItem.barcode : (customText || '6281100102030');
    
    if (barcodeType === 'QR_CODE') {
      return (
        <div className="flex flex-col items-center justify-center p-3.5 bg-white border border-slate-200 rounded-lg shadow-inner w-32 h-32 mx-auto">
          {/* Simulated QR Code matrix pixels */}
          <div className="grid grid-cols-5 gap-1 w-full h-full p-1 bg-white">
            <div className="bg-slate-900 border border-slate-950"></div>
            <div className="bg-slate-900"></div>
            <div className="bg-white"></div>
            <div className="bg-slate-900"></div>
            <div className="bg-slate-900"></div>

            <div className="bg-slate-900"></div>
            <div className="bg-white"></div>
            <div className="bg-slate-900"></div>
            <div className="bg-white"></div>
            <div className="bg-slate-900"></div>

            <div className="bg-white"></div>
            <div className="bg-slate-900"></div>
            <div className="bg-slate-900"></div>
            <div className="bg-slate-900"></div>
            <div className="bg-white"></div>

            <div className="bg-slate-900"></div>
            <div className="bg-white"></div>
            <div className="bg-slate-900"></div>
            <div className="bg-white"></div>
            <div className="bg-slate-900"></div>

            <div className="bg-slate-900"></div>
            <div className="bg-slate-900"></div>
            <div className="bg-white"></div>
            <div className="bg-slate-900"></div>
            <div className="bg-slate-900"></div>
          </div>
          <span className="text-[8px] font-mono font-bold text-slate-500 mt-1 truncate max-w-[120px]">{codeVal}</span>
        </div>
      );
    }

    // Otherwise render standard vertical bar graphic
    return (
      <div className="flex flex-col items-center justify-center p-3 bg-white border border-slate-200 rounded-lg shadow-inner max-w-[240px] mx-auto">
        <div className="flex items-end justify-center h-14 w-full px-4 overflow-hidden mb-1">
          {/* Loop to render simulated barcode lines */}
          {[1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 1, 2, 1, 3, 1, 4, 2, 1, 3].map((width, idx) => (
            <div 
              key={idx} 
              className={`h-full ${idx % 2 === 0 ? 'bg-slate-900' : 'bg-transparent'}`} 
              style={{ width: `${width * 1.5}px` }}
            />
          ))}
        </div>
        <span className="text-[10px] font-mono font-extrabold text-slate-700 tracking-widest">{codeVal}</span>
      </div>
    );
  };

  const handleSimulatePrintSticker = () => {
    showToast(`تم إرسال أمر الطباعة المباشر لطابعة الاستيكر المكتبي. جاري طباعة عدد ${printQty} بطاقة لاصقة للمادة: "${activeItem?.name || 'مخصصة'}" بأبعاد ${stickerWidth}×${stickerHeight} مم بنجاح!`, 'success');
  };

  const isDark = theme === 'dark' || theme === 'light-black';

  return (
    <div className={`flex h-full p-4 select-none overflow-hidden transition-colors duration-300 ${isDark ? 'bg-zinc-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`} dir="rtl">
      
      {/* 1. STICKER GENERATOR & DESIGNER PANEL (LEFT) */}
      <div className={`w-[320px] border-l p-4 shrink-0 flex flex-col justify-between overflow-y-auto ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-sm rounded-lg'}`}>
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b pb-2">
            <Barcode className="w-5 h-5 text-amber-600" />
            <h3 className="text-xs font-extrabold text-slate-800">مصمم وطباعة ملصقات الباركود</h3>
          </div>

          <div className="space-y-3 text-[11px]">
            <div className="flex flex-col gap-1">
              <label className="font-extrabold text-slate-600">المادة المراد طباعتها:</label>
              <select 
                value={selectedItemId} 
                onChange={(e) => setSelectedItemId(e.target.value)}
                className="p-1.5 bg-white border border-slate-300 rounded text-[11px]"
              >
                {items.map(i => (
                  <option key={i.id} value={i.id}>{i.name} ({i.barcode})</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-extrabold text-slate-600">نوع وقالب الباركود:</label>
              <div className="grid grid-cols-3 gap-1">
                <button 
                  onClick={() => setBarcodeType('CODE_128')}
                  className={`py-1 text-[10px] font-bold border rounded transition-colors ${barcodeType === 'CODE_128' ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-slate-50 border-slate-200'}`}
                >
                  Code 128
                </button>
                <button 
                  onClick={() => setBarcodeType('EAN_13')}
                  className={`py-1 text-[10px] font-bold border rounded transition-colors ${barcodeType === 'EAN_13' ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-slate-50 border-slate-200'}`}
                >
                  EAN-13
                </button>
                <button 
                  onClick={() => setBarcodeType('QR_CODE')}
                  className={`py-1 text-[10px] font-bold border rounded transition-colors ${barcodeType === 'QR_CODE' ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-slate-50 border-slate-200'}`}
                >
                  QR Code
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1 border-t pt-2 space-y-1.5">
              <label className="font-extrabold text-slate-600">العناصر المعروضة بالملصق:</label>
              
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-bold">عرض سعر البيع النهائي:</span>
                <input type="checkbox" checked={showPrice} onChange={(e) => setShowPrice(e.target.checked)} className="rounded" />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-bold">عرض ترويسة اسم الشركة:</span>
                <input type="checkbox" checked={showCompanyName} onChange={(e) => setShowCompanyName(e.target.checked)} className="rounded" />
              </div>
            </div>

            {/* Sticker Dimensions */}
            <div className="grid grid-cols-2 gap-2 border-t pt-2">
              <div className="flex flex-col gap-0.5">
                <span className="text-[9.5px] text-slate-500 font-bold">عرض الاستيكر (مم):</span>
                <input type="number" value={stickerWidth} onChange={(e) => setStickerWidth(Number(e.target.value))} className="p-1 bg-white border rounded font-mono text-center" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[9.5px] text-slate-500 font-bold">ارتفاع الاستيكر (مم):</span>
                <input type="number" value={stickerHeight} onChange={(e) => setStickerHeight(Number(e.target.value))} className="p-1 bg-white border rounded font-mono text-center" />
              </div>
            </div>

            {/* Print Quantity */}
            <div className="flex flex-col gap-1">
              <label className="font-extrabold text-slate-600">كمية الملصقات المراد طباعتها:</label>
              <input 
                type="number" 
                min="1"
                value={printQty} 
                onChange={(e) => setPrintQty(Number(e.target.value))}
                className="p-1.5 bg-white border border-slate-300 rounded font-mono text-center text-xs" 
              />
            </div>
          </div>
        </div>

        <button 
          onClick={handleSimulatePrintSticker}
          className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-black text-[11px] rounded transition-colors cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>إرسال أمر الطباعة للملصقات</span>
        </button>
      </div>

      {/* 2. LIVE STICKER PREVIEW & SALES REGISTER (RIGHT) */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        
        {/* Dynamic visual preview of the label design */}
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-sm'} space-y-3`}>
          <span className="text-[12px] font-black text-slate-750 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <span>معاينة حية لملصق الـ Barcode المصمم:</span>
          </span>

          <div className="py-6 bg-slate-100 rounded-lg flex items-center justify-center">
            {/* The Actual Sticker Frame */}
            <div className="w-[200px] bg-white border border-slate-300 shadow-md p-3 text-center space-y-1 rounded relative" style={{ height: 'auto' }}>
              {showCompanyName && (
                <div className="text-[9.5px] font-black text-slate-700 border-b pb-0.5 border-slate-200 truncate leading-none">
                  شركة تجارة المواد الغذائية المحدودة
                </div>
              )}
              
              <div className="text-[11px] font-extrabold text-slate-900 truncate mt-1">
                {activeItem?.name || 'مادة اختبارية غير معرفة'}
              </div>

              {/* Render dynamic code */}
              <div className="py-1">
                {renderVisualCode()}
              </div>

              {showPrice && activeItem && (
                <div className="text-[10px] font-black text-slate-800 flex justify-between px-2 pt-1 border-t border-slate-100">
                  <span>السعر:</span>
                  <span className="text-emerald-700">{activeItem.salePrice} ريال سعودي</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sales simulation with barcode scanner reader register */}
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-sm'} space-y-3`}>
          <span className="text-[12px] font-black text-slate-750 flex items-center gap-2">
            <ShoppingCart className="w-4.5 h-4.5 text-blue-600" />
            <span>محاكاة البيع بنظام الباركود وقارئ الليزر (POS Scanner Register)</span>
          </span>

          <form onSubmit={handleSimulateScan} className="flex gap-2">
            <input 
              type="text" 
              placeholder="امسح الباركود هنا (مثال: 628110001، 628110002...)" 
              value={scanningBarcode}
              onChange={(e) => setScanningBarcode(e.target.value)}
              className="flex-1 p-2 bg-white border border-slate-300 rounded text-xs font-mono"
            />
            <button 
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>محاكاة مسح</span>
            </button>
          </form>

          {/* Cart view */}
          <div className="space-y-1.5 text-[11px]">
            <div className="font-extrabold text-slate-500 border-b pb-1 mb-1.5">أصناف الفاتورة الحالية المعلقة بالقارئ:</div>
            
            {salesCart.length === 0 ? (
              <div className="text-center text-slate-400 py-6">
                بانتظار قراءة أو مسح باركود أي مادة لإدراجها بالفاتورة فوراً.
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="max-h-[120px] overflow-y-auto space-y-1">
                  {salesCart.map(c => (
                    <div key={c.id} className="p-2 bg-slate-50 border rounded flex justify-between items-center">
                      <div>
                        <span className="font-extrabold text-slate-800">{c.item.name}</span>
                        <span className="text-[9.5px] text-slate-400 block font-mono">الباركود: {c.item.barcode}</span>
                      </div>
                      <div className="flex gap-4 items-center">
                        <span className="font-bold text-slate-500">{c.qty} × {c.item.salePrice} ر.س</span>
                        <span className="font-extrabold text-blue-700 font-mono">{c.total} ر.س</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center border-t pt-2 border-slate-200">
                  <span className="font-extrabold text-[12px] text-slate-800">إجمالي قيمة الفاتورة بمسح الباركود:</span>
                  <span className="font-extrabold text-[14px] text-emerald-700 font-mono">
                    {salesCart.reduce((sum, c) => sum + c.total, 0).toLocaleString()} ر.س
                  </span>
                </div>

                <button 
                  onClick={handleCreateSalesInvoiceFromCart}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded shadow-md transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>توليد وترحيل الفاتورة للدفاتر المركزية</span>
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

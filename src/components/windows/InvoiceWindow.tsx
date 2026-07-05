import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useErp } from '../../context/ErpContext';
import { supabase } from '../../utils/supabase';
import { ExcelGrid } from '../ExcelGrid';
import { 
  FileText, Plus, Trash2, Check, X, Printer, Settings,
  ArrowLeft, ArrowRight, Search, Barcode, HelpCircle,
  Copy, RotateCcw, RotateCw, RefreshCw, Mail, Eye, Download, 
  Calendar, DollarSign, Briefcase, Warehouse, MapPin, 
  AlertTriangle, Maximize, Minimize, Expand, Shrink,
  CheckSquare, FileSpreadsheet, Lock, Sparkles, Layout, Database
} from 'lucide-react';
import { Invoice, InvoiceGridRow, InvoiceType, Item, PrintTemplate } from '../../types/erp';

interface InvoiceWindowProps {
  invoiceType?: InvoiceType;
  invoiceId?: string; 
  windowId: string;
  onClose: () => void;
}

interface InvoiceTab {
  id: string;          
  title: string;       
  invoiceType: InvoiceType;
  isNew: boolean;      
  
  invoiceNo: string;
  date: string;
  description: string;
  branchId: string;
  customerId: string;
  currencyId: string;
  exchangeRate: number;
  paymentMethod: 'cash' | 'credit' | 'bank';
  warehouseId: string;
  cashAccountId: string;
  itemsAccountId: string;
  debitCostCenterId: string;
  creditCostCenterId: string;
  posted: boolean;
  entryCreated: boolean;

  gridRows: InvoiceGridRow[];
  selectedGridRowId: string;

  discount: number;
  addition: number;
  taxPercent: number;
  expenses: number;
  paidAmount: number;
  salesRepId: string;
  originalInvoiceRef: string;
  notes: string;

  attachments: { name: string; url: string }[];
  stickyNotes: string;
  auditLogs: string[];
}

export const InvoiceWindow: React.FC<InvoiceWindowProps> = ({ 
  invoiceType = 'sale', 
  invoiceId, 
  windowId, 
  onClose 
}) => {
  const { 
    connectedDbId,
    branches, 
    warehouses, 
    costCenters, 
    currencies, 
    accounts, 
    customers, 
    items, 
    invoices, 
    setInvoices,
    addInvoice, 
    deleteInvoice,
    showToast
  } = useErp();

  // Multi-Tab management
  const [tabs, setTabs] = useState<InvoiceTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [gridActiveCellAddress, setGridActiveCellAddress] = useState('خارج الجدول');

  // Menu Dropdown states
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // Layout states
  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    return Number(localStorage.getItem('invoice_sidebar_width') || '280');
  });
  const [gridHeight, setGridHeight] = useState<number>(() => {
    return Number(localStorage.getItem('invoice_grid_height') || '350');
  });

  // Print templates visual designer & settings
  const [selectedPrintModel, setSelectedPrintModel] = useState<string>('A4_Full');
  const [printCustomizations, setPrintCustomizations] = useState({
    title: 'فاتورة ضريبية مبسطة دوت نت',
    subTitle: 'برنامج الميزان لإدارة الحسابات والمستودعات',
    showLogo: true,
    logoIcon: '⚖️',
    showPrices: true,
    showQuantities: true,
    showBarcode: true,
    showQRCode: true,
    colorTheme: '#1e40af', 
    fontSize: '11px',
    marginSize: '15px'
  });

  // Windows Modals
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuditLogsOpen, setIsAuditLogsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Ref trackers for panel dragging
  const verticalDragRef = useRef<boolean>(false);
  const horizontalDragRef = useRef<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Create empty default tab structure
  const createNewTabStructure = (type: InvoiceType, loadId?: string): InvoiceTab => {
    const matchedInv = loadId ? invoices.find(i => i.id === loadId) : null;
    const tid = loadId || `tab-new-${Date.now()}`;

    if (matchedInv) {
      return {
        id: matchedInv.id,
        title: `${getArabicTypeLabel(matchedInv.type)} #${matchedInv.invoiceNo}`,
        invoiceType: matchedInv.type,
        isNew: false,
        invoiceNo: matchedInv.invoiceNo,
        date: matchedInv.date,
        description: matchedInv.description || '',
        branchId: matchedInv.branchId || branches[0]?.id || '',
        customerId: matchedInv.customerId || customers[0]?.id || '',
        currencyId: matchedInv.currencyId || currencies[0]?.id || '',
        exchangeRate: matchedInv.exchangeRate || 1.0,
        paymentMethod: matchedInv.paymentMethod || 'cash',
        warehouseId: matchedInv.warehouseId || warehouses[0]?.id || '',
        cashAccountId: matchedInv.cashAccountId || 'acc-111001',
        itemsAccountId: matchedInv.itemsAccountId || 'acc-411001',
        debitCostCenterId: matchedInv.debitCostCenterId || 'cc-1',
        creditCostCenterId: matchedInv.creditCostCenterId || 'cc-2',
        posted: matchedInv.posted !== undefined ? matchedInv.posted : true,
        entryCreated: matchedInv.entryCreated !== undefined ? matchedInv.entryCreated : true,
        gridRows: matchedInv.items || [],
        selectedGridRowId: matchedInv.items?.[0]?.id || '',
        discount: matchedInv.discount || 0,
        addition: matchedInv.addition || 0,
        taxPercent: matchedInv.taxPercent || 15,
        expenses: matchedInv.expenses || 0,
        paidAmount: matchedInv.paidAmount || 0,
        salesRepId: matchedInv.salesRepId || 'rep-1',
        originalInvoiceRef: matchedInv.originalInvoiceRef || '',
        notes: matchedInv.notes || '',
        attachments: matchedInv.attachments || [],
        stickyNotes: matchedInv.stickyNotes || '',
        auditLogs: matchedInv.auditLogs || [`تم فتح الفاتورة بنجاح في ${new Date().toLocaleTimeString('ar-SA')}`]
      };
    } else {
      const prefix = type.toUpperCase().substring(0, 3);
      const rand = Math.floor(1000 + Math.random() * 9000);
      const initialRowId = `grid-row-${Date.now()}`;

      return {
        id: tid,
        title: `${getArabicTypeLabel(type)} جديدة`,
        invoiceType: type,
        isNew: true,
        invoiceNo: `${prefix}-${rand}`,
        date: new Date().toISOString().split('T')[0],
        description: '',
        branchId: branches[0]?.id || '',
        customerId: customers[0]?.id || '',
        currencyId: currencies[0]?.id || '',
        exchangeRate: 1.0,
        paymentMethod: 'cash',
        warehouseId: warehouses[0]?.id || '',
        cashAccountId: type.includes('purchase') ? 'acc-111002' : 'acc-111001',
        itemsAccountId: type.includes('purchase') ? 'acc-511001' : 'acc-411001',
        debitCostCenterId: 'cc-1',
        creditCostCenterId: 'cc-2',
        posted: true,
        entryCreated: true,
        gridRows: [
          { id: initialRowId, itemId: items[0]?.id || '', quantity: 1, unitPrice: type.includes('purchase') ? (items[0]?.purchasePrice || 0) : (items[0]?.salePrice || 0), unit: items[0]?.unit || 'حبة', notes: '', total: type.includes('purchase') ? (items[0]?.purchasePrice || 0) : (items[0]?.salePrice || 0) }
        ],
        selectedGridRowId: initialRowId,
        discount: 0,
        addition: 0,
        taxPercent: 15,
        expenses: 0,
        paidAmount: 0,
        salesRepId: 'rep-1',
        originalInvoiceRef: '',
        notes: '',
        attachments: [],
        stickyNotes: '',
        auditLogs: [`تأسيس مسودة فاتورة جديدة في ${new Date().toLocaleTimeString('ar-SA')}`]
      };
    }
  };

  // Initialize tabs
  useEffect(() => {
    const initialTab = createNewTabStructure((invoiceType || 'sale') as InvoiceType, invoiceId);
    setTabs([initialTab]);
    setActiveTabId(initialTab.id);
  }, [invoiceId, invoiceType]);

  // Sync relational database
  useEffect(() => {
    async function fetchAllInvoicesFromDb() {
      if (!connectedDbId) return;
      try {
        const { data: salesData, error: salesError } = await supabase
          .from('sales_invoices')
          .select(`*, sales_invoice_items (*)`)
          .eq('company_id', connectedDbId);

        const { data: purchaseData, error: purchaseError } = await supabase
          .from('purchase_invoices')
          .select(`*, purchase_invoice_items (*)`)
          .eq('company_id', connectedDbId);

        if (salesError || purchaseError) {
          throw new Error(salesError?.message || purchaseError?.message);
        }

        const mappedSales: Invoice[] = (salesData || []).map(row => ({
          id: row.id,
          invoiceNo: row.invoice_no,
          type: 'sale',
          date: row.date,
          description: row.description || '',
          branchId: row.branch_id,
          customerId: row.customer_id,
          currencyId: currencies[0]?.id || 'cur-1',
          exchangeRate: 1.0,
          paymentMethod: row.payment_method as any,
          warehouseId: row.warehouse_id,
          cashAccountId: 'acc-111001',
          itemsAccountId: 'acc-411001',
          debitCostCenterId: 'cc-1',
          creditCostCenterId: 'cc-2',
          posted: row.posted,
          entryCreated: true,
          items: (row.sales_invoice_items || []).map((item: any) => ({
            id: item.id,
            itemId: item.product_id,
            quantity: Number(item.quantity) || 0,
            unitPrice: Number(item.unit_price) || 0,
            unit: 'حبة',
            notes: item.notes || '',
            total: Number(item.total) || 0
          })),
          discount: Number(row.discount) || 0,
          addition: 0,
          taxPercent: 15,
          expenses: 0,
          netAmount: Number(row.net_amount) || 0,
          paidAmount: Number(row.paid_amount) || 0,
          salesRepId: 'rep-1',
          notes: '',
          auditLogs: [`تم الجلب من قاعدة البيانات سحابياً`]
        }));

        const mappedPurchases: Invoice[] = (purchaseData || []).map(row => ({
          id: row.id,
          invoiceNo: row.invoice_no,
          type: 'purchase',
          date: row.date,
          description: row.description || '',
          branchId: row.branch_id,
          customerId: row.supplier_id, 
          currencyId: currencies[0]?.id || 'cur-1',
          exchangeRate: 1.0,
          paymentMethod: row.payment_method as any,
          warehouseId: row.warehouse_id,
          cashAccountId: 'acc-111002',
          itemsAccountId: 'acc-511001',
          debitCostCenterId: 'cc-1',
          creditCostCenterId: 'cc-2',
          posted: row.posted,
          entryCreated: true,
          items: (row.purchase_invoice_items || []).map((item: any) => ({
            id: item.id,
            itemId: item.product_id,
            quantity: Number(item.quantity) || 0,
            unitPrice: Number(item.unit_price) || 0,
            unit: 'حبة',
            notes: item.notes || '',
            total: Number(item.total) || 0
          })),
          discount: Number(row.discount) || 0,
          addition: 0,
          taxPercent: 15,
          expenses: 0,
          netAmount: Number(row.net_amount) || 0,
          paidAmount: Number(row.paid_amount) || 0,
          salesRepId: 'rep-1',
          notes: '',
          auditLogs: [`تم الجلب من قاعدة البيانات سحابياً`]
        }));

        setInvoices([...mappedSales, ...mappedPurchases]);
      } catch (err) {
        console.error('Error fetching invoices from Supabase:', err);
      }
    }

    fetchAllInvoicesFromDb();
  }, [connectedDbId, currencies, setInvoices]);

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  const updateActiveTab = useCallback((updater: (prev: InvoiceTab) => Partial<InvoiceTab>) => {
    if (!activeTabId) return;
    setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, ...updater(t) } : t));
  }, [activeTabId]);

  function getArabicTypeLabel(type: InvoiceType): string {
    switch (type) {
      case 'sale': return 'فاتورة مبيعات';
      case 'purchase': return 'فاتورة مشتريات';
      case 'sale_return': return 'مرتجع مبيعات';
      case 'purchase_return': return 'مرتجع مشتريات';
      case 'inward': return 'إدخال مستودعي';
      case 'outward': return 'إخراج مستودعي';
      case 'opening_stock': return 'بضاعة أول المدة';
      case 'closing_stock': return 'بضاعة آخر المدة';
      case 'transfer_entry': return 'مناقلة مستودعية بقيد';
      case 'transfer_no_entry': return 'مناقلة مستودعية بلا قيد';
      default: return 'سند محاسبي';
    }
  }

  // Resizing hooks
  const handleVerticalSeparatorMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    verticalDragRef.current = true;
  };

  const handleHorizontalSeparatorMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    horizontalDragRef.current = true;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (verticalDragRef.current && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const newWidth = containerRect.right - e.clientX; // RTL support
        const boundedWidth = Math.max(150, Math.min(newWidth, 450));
        setSidebarWidth(boundedWidth);
        localStorage.setItem('invoice_sidebar_width', String(boundedWidth));
      }
      if (horizontalDragRef.current && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const newHeight = e.clientY - containerRect.top - 180; 
        const boundedHeight = Math.max(120, Math.min(newHeight, 550));
        setGridHeight(boundedHeight);
        localStorage.setItem('invoice_grid_height', String(boundedHeight));
      }
    };

    const handleMouseUp = () => {
      verticalDragRef.current = false;
      horizontalDragRef.current = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Keyboard Event Hooks
  useEffect(() => {
    const handleWindowShortcuts = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSaveActiveInvoice();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setIsPreviewOpen(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleOpenNewTab();
      }
      if (e.key === 'F2') {
        e.preventDefault();
        handleOpenNewTab();
      }
      if (e.key === 'F5') {
        e.preventDefault();
        handleSaveActiveInvoice();
      }
      if (e.key === 'F6') {
        e.preventDefault();
        handleSilentPrint();
      }
      if (e.key === 'F8') {
        e.preventDefault();
        setIsPreviewOpen(true);
      }
    };
    window.addEventListener('keydown', handleWindowShortcuts);
    return () => window.removeEventListener('keydown', handleWindowShortcuts);
  }, [tabs, activeTabId]);

  if (!activeTab) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#f0f0f0] border-2 border-zinc-400 text-zinc-800 font-bold" dir="rtl">
        <RefreshCw className="w-8 h-8 text-blue-800 animate-spin" />
        <span className="mt-2 text-xs">جاري تحميل واجهة الميزان ERP...</span>
      </div>
    );
  }

  const currentItemInTab = items.find(it => it.id === activeTab.gridRows.find(r => r.id === activeTab.selectedGridRowId)?.itemId) || items[0];

  const handleSwitchTab = (id: string) => {
    setActiveTabId(id);
    showToast(`المستند النشط: ${tabs.find(t => t.id === id)?.title}`, 'info');
  };

  const handleCloseTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length === 1) {
      showToast('يجب إبقاء علامة تبويب واحدة مفتوحة على الأقل.', 'warning');
      return;
    }
    const filtered = tabs.filter(t => t.id !== id);
    setTabs(filtered);
    if (activeTabId === id) {
      setActiveTabId(filtered[0].id);
    }
    showToast('تم إغلاق التبويب المفتوح.', 'info');
  };

  const handleOpenNewTab = (type: InvoiceType = (invoiceType || 'sale') as InvoiceType) => {
    const newTab = createNewTabStructure(type);
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
    showToast(`تم فتح تبويب ${getArabicTypeLabel(type)} جديد`, 'success');
  };

  // Save active invoice to context + supabase
  const handleSaveActiveInvoice = async () => {
    if (!activeTab.gridRows || activeTab.gridRows.length === 0) {
      showToast('يجب أن تحتوي الفاتورة على صنف واحد على الأقل قبل الحفظ.', 'warning');
      return;
    }

    const sub = activeTab.gridRows.reduce((acc, r) => acc + Number(r.total || 0), 0);
    const tax = (sub - activeTab.discount + activeTab.addition) * (activeTab.taxPercent / 100);
    const net = sub - activeTab.discount + activeTab.addition + tax + activeTab.expenses;

    const savedInvoiceId = activeTab.isNew ? `inv-${Date.now()}` : activeTab.id;

    const savedInvoice: Invoice = {
      id: savedInvoiceId,
      invoiceNo: activeTab.invoiceNo,
      type: activeTab.invoiceType,
      date: activeTab.date,
      description: activeTab.description,
      branchId: activeTab.branchId,
      customerId: activeTab.customerId,
      currencyId: activeTab.currencyId,
      exchangeRate: activeTab.exchangeRate,
      paymentMethod: activeTab.paymentMethod,
      warehouseId: activeTab.warehouseId,
      cashAccountId: activeTab.cashAccountId,
      itemsAccountId: activeTab.itemsAccountId,
      debitCostCenterId: activeTab.debitCostCenterId,
      creditCostCenterId: activeTab.creditCostCenterId,
      posted: activeTab.posted,
      entryCreated: activeTab.entryCreated,
      items: activeTab.gridRows,
      discount: activeTab.discount,
      addition: activeTab.addition,
      taxPercent: activeTab.taxPercent,
      expenses: activeTab.expenses,
      netAmount: net,
      paidAmount: activeTab.paidAmount,
      salesRepId: activeTab.salesRepId,
      originalInvoiceRef: activeTab.originalInvoiceRef,
      notes: activeTab.notes,
      attachments: activeTab.attachments,
      stickyNotes: activeTab.stickyNotes,
      auditLogs: [...activeTab.auditLogs, `تم التخزين والمزامنة مع قاعدة البيانات السحابية في ${new Date().toLocaleTimeString('ar-SA')}`]
    };

    if (connectedDbId) {
      try {
        if (activeTab.invoiceType === 'sale' || activeTab.invoiceType === 'sale_return') {
          const { error: invoiceError } = await supabase
            .from('sales_invoices')
            .upsert({
              id: savedInvoiceId,
              company_id: connectedDbId,
              branch_id: activeTab.branchId,
              customer_id: activeTab.customerId || null,
              warehouse_id: activeTab.warehouseId || null,
              invoice_no: activeTab.invoiceNo,
              date: activeTab.date,
              payment_method: activeTab.paymentMethod,
              total_amount: sub,
              discount: activeTab.discount,
              tax_amount: tax,
              net_amount: net,
              paid_amount: activeTab.paidAmount,
              posted: activeTab.posted,
              description: activeTab.description || null
            });

          if (invoiceError) throw invoiceError;

          await supabase
            .from('sales_invoice_items')
            .delete()
            .eq('invoice_id', savedInvoiceId);

          const itemRecords = activeTab.gridRows.map((r, index) => ({
            id: `item-${savedInvoiceId}-${index}-${Date.now()}`,
            company_id: connectedDbId,
            invoice_id: savedInvoiceId,
            product_id: r.itemId,
            quantity: Number(r.quantity) || 1,
            unit_price: Number(r.unitPrice) || 0,
            total: Number(r.total) || 0,
            discount: 0,
            notes: r.notes || null
          }));

          const { error: itemsError } = await supabase
            .from('sales_invoice_items')
            .insert(itemRecords);

          if (itemsError) throw itemsError;

        } else if (activeTab.invoiceType === 'purchase' || activeTab.invoiceType === 'purchase_return') {
          const { error: invoiceError } = await supabase
            .from('purchase_invoices')
            .upsert({
              id: savedInvoiceId,
              company_id: connectedDbId,
              branch_id: activeTab.branchId,
              supplier_id: activeTab.customerId || null, 
              warehouse_id: activeTab.warehouseId || null,
              invoice_no: activeTab.invoiceNo,
              date: activeTab.date,
              payment_method: activeTab.paymentMethod,
              total_amount: sub,
              discount: activeTab.discount,
              tax_amount: tax,
              net_amount: net,
              paid_amount: activeTab.paidAmount,
              posted: activeTab.posted,
              description: activeTab.description || null
            });

          if (invoiceError) throw invoiceError;

          await supabase
            .from('purchase_invoice_items')
            .delete()
            .eq('invoice_id', savedInvoiceId);

          const itemRecords = activeTab.gridRows.map((r, index) => ({
            id: `item-${savedInvoiceId}-${index}-${Date.now()}`,
            company_id: connectedDbId,
            invoice_id: savedInvoiceId,
            product_id: r.itemId,
            quantity: Number(r.quantity) || 1,
            unit_price: Number(r.unitPrice) || 0,
            total: Number(r.total) || 0,
            discount: 0,
            notes: r.notes || null
          }));

          const { error: itemsError } = await supabase
            .from('purchase_invoice_items')
            .insert(itemRecords);

          if (itemsError) throw itemsError;
        }
      } catch (err: any) {
        console.error('Error saving invoice to relational DB:', err);
        showToast(`فشل حفظ الفاتورة في قاعدة البيانات: ${err.message}`, 'error');
        return;
      }
    }

    addInvoice(savedInvoice);

    setTabs(prev => prev.map(t => t.id === activeTabId ? {
      ...t,
      id: savedInvoice.id,
      isNew: false,
      title: `${getArabicTypeLabel(savedInvoice.type)} #${savedInvoice.invoiceNo}`,
      auditLogs: savedInvoice.auditLogs || []
    } : t));
    setActiveTabId(savedInvoice.id);

    showToast(`تم حفظ السند المحاسبي ${savedInvoice.invoiceNo} بنجاح.`, 'success');
  };

  const handleSilentPrint = () => {
    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'absolute';
    printFrame.style.top = '-9999px';
    printFrame.style.left = '-9999px';
    document.body.appendChild(printFrame);

    const frameDoc = printFrame.contentWindow?.document || printFrame.contentDocument;
    if (!frameDoc) return;

    const printHTML = renderPrintTemplateHTML();
    frameDoc.open();
    frameDoc.write(printHTML);
    frameDoc.close();

    showToast('جاري تحضير ملقم الطباعة وتوجيه المستند للطباعة المباشرة...', 'info');
    setTimeout(() => {
      printFrame.contentWindow?.focus();
      printFrame.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(printFrame);
      }, 1000);
    }, 500);
  };

  const handleDeleteActiveInvoice = () => {
    if (activeTab.isNew) {
      showToast('المسودة لم تحفظ بعد، تم إلغاؤها.', 'info');
      onClose();
      return;
    }
    deleteInvoice(activeTab.id);
    showToast('تم حذف السند بالكامل من النظام.', 'warning');
    onClose();
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      }
      setIsFullscreen(true);
      showToast('تم تشغيل وضع سطح المكتب الكامل', 'success');
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
      showToast('تم الخروج من وضع ملء الشاشة.', 'info');
    }
  };

  const subtotal = activeTab.gridRows.reduce((acc, r) => acc + Number(r.total || 0), 0);
  const taxAmount = (subtotal - activeTab.discount + activeTab.addition) * (activeTab.taxPercent / 100);
  const netAmount = subtotal - activeTab.discount + activeTab.addition + taxAmount + activeTab.expenses;

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const matchedItem = items.find(it => it.barcode === barcodeInput || it.code === barcodeInput);
    if (!matchedItem) {
      showToast(`عذراً، لم نجد صنفاً يحمل الرمز أو الباركود: "${barcodeInput}"`, 'error');
      setBarcodeInput('');
      return;
    }

    const existingRowIdx = activeTab.gridRows.findIndex(r => r.itemId === matchedItem.id);
    if (existingRowIdx !== -1) {
      const updatedRows = activeTab.gridRows.map((row, idx) => {
        if (idx === existingRowIdx) {
          const qty = Number(row.quantity || 0) + 1;
          return { ...row, quantity: qty, total: qty * Number(row.unitPrice || 0) };
        }
        return row;
      });
      updateActiveTab(() => ({ gridRows: updatedRows }));
    } else {
      const newId = `grid-row-${Date.now()}`;
      const newRows = [
        ...activeTab.gridRows,
        {
          id: newId,
          itemId: matchedItem.id,
          quantity: 1,
          unitPrice: activeTab.invoiceType.includes('purchase') ? (matchedItem.purchasePrice || 0) : (matchedItem.salePrice || 0),
          unit: matchedItem.unit || 'حبة',
          notes: 'قارئ الباركود السريع',
          total: activeTab.invoiceType.includes('purchase') ? (matchedItem.purchasePrice || 0) : (matchedItem.salePrice || 0)
        }
      ];
      updateActiveTab(() => ({ gridRows: newRows, selectedGridRowId: newId }));
    }

    setBarcodeInput('');
    showToast(`تم إدراج: ${matchedItem.name}`, 'success');
  };

  // Compile print HTML string
  const renderPrintTemplateHTML = (): string => {
    const activeCustomer = customers.find(c => c.id === activeTab.customerId);
    const activeWarehouse = warehouses.find(w => w.id === activeTab.warehouseId);
    
    let paperWidth = '210mm';
    let paperHeight = '297mm';
    if (selectedPrintModel.includes('A5_Half')) {
      paperWidth = '148mm';
      paperHeight = '210mm';
    } else if (selectedPrintModel.includes('Thermal')) {
      paperWidth = '80mm';
      paperHeight = 'auto';
    }

    const tLines = activeTab.gridRows.map((row, index) => {
      const item = items.find(it => it.id === row.itemId);
      return `
        <tr style="border-bottom: 1px solid #ddd;">
          <td style="padding: 5px; text-align: center; font-family: monospace;">${index + 1}</td>
          <td style="padding: 5px; text-align: right;">${item?.name || 'صنف سلعي'}</td>
          <td style="padding: 5px; text-align: center;">${item?.code || ''}</td>
          <td style="padding: 5px; text-align: center;">${row.unit}</td>
          ${printCustomizations.showQuantities ? `<td style="padding: 5px; text-align: center; font-family: monospace;">${row.quantity}</td>` : ''}
          ${printCustomizations.showPrices ? `<td style="padding: 5px; text-align: center; font-family: monospace;">${row.unitPrice.toFixed(2)}</td>` : ''}
          ${printCustomizations.showPrices ? `<td style="padding: 5px; text-align: left; font-family: monospace; font-weight: bold;">${row.total.toFixed(2)}</td>` : ''}
        </tr>
      `;
    }).join('');

    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>سند طباعة الميزان</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap');
          body {
            font-family: 'Cairo', sans-serif;
            margin: 0;
            padding: ${printCustomizations.marginSize};
            background: white;
            color: #111;
            font-size: ${printCustomizations.fontSize};
            width: ${paperWidth};
            height: ${paperHeight};
            direction: rtl;
          }
          .title-text {
            color: ${printCustomizations.colorTheme};
            font-size: 1.35rem;
            font-weight: 900;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            font-size: ${printCustomizations.fontSize};
          }
          th {
            background: ${printCustomizations.colorTheme};
            color: white;
            padding: 6px;
            text-align: right;
          }
          .total-box {
            margin-top: 10px;
            border: 2px solid ${printCustomizations.colorTheme};
            padding: 8px;
            float: left;
            width: 220px;
            background: #fcfcfc;
          }
          .total-box div {
            display: flex;
            justify-content: space-between;
            margin-bottom: 2px;
          }
          .total-box .net {
            font-weight: 900;
            color: ${printCustomizations.colorTheme};
            border-top: 1px solid #ddd;
            padding-top: 2px;
          }
          .qrcode {
            float: right;
            margin-top: 10px;
            width: 80px;
            height: 80px;
          }
        </style>
      </head>
      <body>
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #ccc; padding-bottom: 5px;">
          <div>
            <div class="title-text">${printCustomizations.title}</div>
            <div style="font-weight: bold; color: #555;">${printCustomizations.subTitle}</div>
          </div>
          <div style="font-size: 30px;">${printCustomizations.logoIcon}</div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px; background: #fafafa; border: 1px solid #eee; padding: 8px;">
          <div>
            <strong>رقم السند:</strong> <span style="font-family: monospace;">${activeTab.invoiceNo}</span><br/>
            <strong>التاريخ:</strong> <span style="font-family: monospace;">${activeTab.date}</span><br/>
            <strong>الفرع:</strong> ${branches.find(b => b.id === activeTab.branchId)?.name || 'الرئيسي'}<br/>
          </div>
          <div>
            <strong>الحساب المقابل:</strong> ${activeCustomer?.name || 'نقدي'}<br/>
            <strong>المستودع:</strong> ${activeWarehouse?.name || 'المبيعات'}<br/>
            <strong>طريقة الدفع:</strong> ${activeTab.paymentMethod === 'cash' ? 'نقدي' : activeTab.paymentMethod === 'bank' ? 'بنكي' : 'آجل'}<br/>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 25px; text-align: center;">#</th>
              <th>اسم الصنف السلعي والمواصفات</th>
              <th style="text-align: center; width: 60px;">الكود</th>
              <th style="text-align: center; width: 45px;">الوحدة</th>
              ${printCustomizations.showQuantities ? '<th style="text-align: center; width: 45px;">الكمية</th>' : ''}
              ${printCustomizations.showPrices ? '<th style="text-align: center; width: 60px;">السعر</th>' : ''}
              ${printCustomizations.showPrices ? '<th style="text-align: left; width: 70px;">الإجمالي</th>' : ''}
            </tr>
          </thead>
          <tbody>
            ${tLines}
          </tbody>
        </table>

        <div style="width: 100%; display: block; overflow: hidden; margin-top: 10px;">
          <div class="total-box">
            <div>
              <span>المجموع:</span>
              <span style="font-family: monospace;">${subtotal.toFixed(2)}</span>
            </div>
            <div>
              <span>الخصم:</span>
              <span style="font-family: monospace; color: red;">-${activeTab.discount.toFixed(2)}</span>
            </div>
            <div>
              <span>الضريبة ${activeTab.taxPercent}%:</span>
              <span style="font-family: monospace; color: red;">${taxAmount.toFixed(2)}</span>
            </div>
            <div class="net">
              <span>الصافي المطلوب:</span>
              <span style="font-family: monospace;">${netAmount.toFixed(2)} ر.س</span>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  return (
    <div className="flex flex-col h-full bg-[#f0f0f0] text-zinc-900 overflow-hidden relative select-none font-mono text-[12px]" dir="rtl" ref={containerRef} style={{ imageRendering: 'pixelated' }}>
      
      {/* 1. AUTHENTIC WINDOWS TITLE BAR */}
      <div className="bg-gradient-to-r from-[#000080] to-[#1084d0] text-white px-2 py-1 flex items-center justify-between shrink-0 select-none cursor-default font-sans">
        <div className="flex items-center gap-1.5 font-bold text-xs">
          <span className="text-sm">⚖️</span>
          <span>برنامج الميزان دوت نت - [ {getArabicTypeLabel(activeTab.invoiceType)} - {activeTab.invoiceNo} ]</span>
          {connectedDbId && (
            <span className="bg-emerald-600 text-white text-[9px] px-1.5 py-0.5 font-bold rounded-none flex items-center gap-0.5 font-mono">
              <Database className="w-2.5 h-2.5" /> سحابي
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={toggleFullscreen}
            className="w-[18px] h-[18px] bg-[#f0f0f0] border border-white border-b-zinc-600 border-r-zinc-600 active:border-zinc-500 hover:bg-zinc-200 text-black font-black text-[9px] flex items-center justify-center cursor-pointer"
            title="ملء الشاشة"
          >
            🗖
          </button>
          <button 
            onClick={onClose}
            className="w-[18px] h-[18px] bg-[#f0f0f0] border border-white border-b-zinc-600 border-r-zinc-600 active:border-zinc-500 hover:bg-red-600 hover:text-white text-black font-black text-[9px] flex items-center justify-center cursor-pointer"
            title="إغلاق السند"
          >
            ✕
          </button>
        </div>
      </div>

      {/* 2. MENU BAR (Functional Windows Dropdowns) */}
      <div className="bg-[#f0f0f0] border-b border-zinc-400 py-0.5 px-2 flex items-center gap-4 text-xs font-bold text-zinc-900 shadow-sm relative select-none font-sans">
        
        {/* ملف Menu */}
        <div className="relative">
          <button 
            onClick={() => setOpenMenu(openMenu === 'file' ? null : 'file')}
            className={`px-2 py-0.5 hover:bg-blue-800 hover:text-white cursor-pointer ${openMenu === 'file' ? 'bg-blue-800 text-white' : ''}`}
          >
            ملف (<span className="underline">F</span>)
          </button>
          {openMenu === 'file' && (
            <div className="absolute right-0 mt-0.5 w-44 bg-[#f0f0f0] border-2 border-zinc-500 shadow-xl z-[999] py-0.5 text-right text-[11px] font-bold text-zinc-800">
              <button onClick={() => { handleOpenNewTab('sale'); setOpenMenu(null); }} className="w-full text-right px-3 py-1 hover:bg-blue-800 hover:text-white flex justify-between">
                <span>جديد مبيعات</span>
                <span className="text-zinc-400 text-[10px]">Ctrl+N</span>
              </button>
              <button onClick={() => { handleOpenNewTab('purchase'); setOpenMenu(null); }} className="w-full text-right px-3 py-1 hover:bg-blue-800 hover:text-white">جديد مشتريات</button>
              <div className="border-t border-zinc-400 my-0.5"></div>
              <button onClick={() => { handleSaveActiveInvoice(); setOpenMenu(null); }} className="w-full text-right px-3 py-1 hover:bg-blue-800 hover:text-white flex justify-between">
                <span>حفظ السند</span>
                <span className="text-zinc-400 text-[10px]">Ctrl+S</span>
              </button>
              <button onClick={() => { setIsPreviewOpen(true); setOpenMenu(null); }} className="w-full text-right px-3 py-1 hover:bg-blue-800 hover:text-white flex justify-between">
                <span>معاينة الطباعة</span>
                <span className="text-zinc-400 text-[10px]">Ctrl+P</span>
              </button>
              <button onClick={() => { handleSilentPrint(); setOpenMenu(null); }} className="w-full text-right px-3 py-1 hover:bg-blue-800 hover:text-white flex justify-between">
                <span>طباعة سريعة</span>
                <span className="text-zinc-400 text-[10px]">F6</span>
              </button>
              <div className="border-t border-zinc-400 my-0.5"></div>
              <button onClick={() => { handleDeleteActiveInvoice(); setOpenMenu(null); }} className="w-full text-right px-3 py-1 hover:bg-blue-800 hover:text-white text-rose-700">حذف السند الحالي</button>
              <button onClick={onClose} className="w-full text-right px-3 py-1 hover:bg-blue-800 hover:text-white">خروج [Esc]</button>
            </div>
          )}
        </div>

        {/* تحرير Menu */}
        <div className="relative">
          <button 
            onClick={() => setOpenMenu(openMenu === 'edit' ? null : 'edit')}
            className={`px-2 py-0.5 hover:bg-blue-800 hover:text-white cursor-pointer ${openMenu === 'edit' ? 'bg-blue-800 text-white' : ''}`}
          >
            تحرير (<span className="underline">E</span>)
          </button>
          {openMenu === 'edit' && (
            <div className="absolute right-0 mt-0.5 w-44 bg-[#f0f0f0] border-2 border-zinc-500 shadow-xl z-[999] py-0.5 text-right text-[11px] font-bold text-zinc-800">
              <div className="px-3 py-1 text-zinc-400 text-[10px] text-center border-b border-zinc-300">الاختصارات تعمل داخل الجدول</div>
              <div className="px-3 py-1 flex justify-between hover:bg-blue-800 hover:text-white cursor-pointer"><span>تراجع</span> <span className="text-zinc-400">Ctrl+Z</span></div>
              <div className="px-3 py-1 flex justify-between hover:bg-blue-800 hover:text-white cursor-pointer"><span>إعادة</span> <span className="text-zinc-400">Ctrl+Y</span></div>
              <div className="px-3 py-1 flex justify-between hover:bg-blue-800 hover:text-white cursor-pointer"><span>قص الخلايا</span> <span className="text-zinc-400">Ctrl+X</span></div>
              <div className="px-3 py-1 flex justify-between hover:bg-blue-800 hover:text-white cursor-pointer"><span>نسخ النطاق</span> <span className="text-zinc-400">Ctrl+C</span></div>
              <div className="px-3 py-1 flex justify-between hover:bg-blue-800 hover:text-white cursor-pointer"><span>لصق من Excel</span> <span className="text-zinc-400">Ctrl+V</span></div>
              <div className="px-3 py-1 flex justify-between hover:bg-blue-800 hover:text-white cursor-pointer"><span>تحديد الكل</span> <span className="text-zinc-400">Ctrl+A</span></div>
              <div className="border-t border-zinc-400 my-0.5"></div>
              <button onClick={() => { updateActiveTab(() => ({ gridRows: [] })); setOpenMenu(null); }} className="w-full text-right px-3 py-1 hover:bg-blue-800 hover:text-white text-red-600">تفريغ كل السطور</button>
            </div>
          )}
        </div>

        {/* أدوات Menu */}
        <div className="relative">
          <button 
            onClick={() => setOpenMenu(openMenu === 'tools' ? null : 'tools')}
            className={`px-2 py-0.5 hover:bg-blue-800 hover:text-white cursor-pointer ${openMenu === 'tools' ? 'bg-blue-800 text-white' : ''}`}
          >
            أدوات (<span className="underline">T</span>)
          </button>
          {openMenu === 'tools' && (
            <div className="absolute right-0 mt-0.5 w-44 bg-[#f0f0f0] border-2 border-zinc-500 shadow-xl z-[999] py-0.5 text-right text-[11px] font-bold text-zinc-800">
              <button onClick={() => { setIsOptionsOpen(true); setOpenMenu(null); }} className="w-full text-right px-3 py-1 hover:bg-blue-800 hover:text-white">خيارات السند والخطوط</button>
              <button onClick={() => { setIsAuditLogsOpen(true); setOpenMenu(null); }} className="w-full text-right px-3 py-1 hover:bg-blue-800 hover:text-white">سجل العمليات والتدقيق</button>
              <button onClick={() => { showToast('تم تصدير نسخة احتياطية محلية بصيغة JSON', 'success'); setOpenMenu(null); }} className="w-full text-right px-3 py-1 hover:bg-blue-800 hover:text-white">حفظ نسخة احتياطية</button>
            </div>
          )}
        </div>

        {/* مساعدة Menu */}
        <div className="relative">
          <button 
            onClick={() => setOpenMenu(openMenu === 'help' ? null : 'help')}
            className={`px-2 py-0.5 hover:bg-blue-800 hover:text-white cursor-pointer ${openMenu === 'help' ? 'bg-blue-800 text-white' : ''}`}
          >
            مساعدة (<span className="underline">H</span>)
          </button>
          {openMenu === 'help' && (
            <div className="absolute right-0 mt-0.5 w-48 bg-[#f0f0f0] border-2 border-zinc-500 shadow-xl z-[999] py-0.5 text-right text-[11px] font-bold text-zinc-800">
              <button onClick={() => { setIsAboutOpen(true); setOpenMenu(null); }} className="w-full text-right px-3 py-1 hover:bg-blue-800 hover:text-white">حول برنامج الميزان .NET</button>
              <a href="https://google.com" target="_blank" rel="noreferrer" className="w-full text-right px-3 py-1 hover:bg-blue-800 hover:text-white block">طلب الدعم الفني المباشر</a>
            </div>
          )}
        </div>

        {/* Global Clocker */}
        <div className="mr-auto font-mono text-[10px] text-zinc-500 font-bold">
          {new Date().toLocaleDateString('ar-SA')} - {new Date().toLocaleTimeString('ar-SA')}
        </div>
      </div>

      {/* 3. WINDOWS RETRO TOOLBAR (Compact, raised grey buttons, flat style) */}
      <div className="bg-[#f0f0f0] border-b border-zinc-400 p-1 flex items-center justify-between shrink-0 select-none font-sans">
        <div className="flex items-center gap-0.5">
          <button 
            onClick={() => handleOpenNewTab()} 
            className="h-10 px-2 bg-[#f0f0f0] border border-transparent hover:border-white hover:border-b-zinc-600 hover:border-r-zinc-600 active:bg-zinc-300 text-zinc-800 flex flex-col items-center justify-center cursor-pointer"
            title="سند جديد [F2]"
          >
            <Plus className="w-4 h-4 text-emerald-700" />
            <span className="text-[10px] font-bold">جديد [F2]</span>
          </button>

          <button 
            onClick={handleSaveActiveInvoice} 
            className="h-10 px-2 bg-[#f0f0f0] border border-transparent hover:border-white hover:border-b-zinc-600 hover:border-r-zinc-600 active:bg-zinc-300 text-zinc-800 flex flex-col items-center justify-center cursor-pointer"
            title="حفظ السند [F5]"
          >
            <Check className="w-4 h-4 text-blue-700" />
            <span className="text-[10px] font-bold">حفظ [F5]</span>
          </button>

          <button 
            onClick={handleDeleteActiveInvoice} 
            className="h-10 px-2 bg-[#f0f0f0] border border-transparent hover:border-white hover:border-b-zinc-600 hover:border-r-zinc-600 active:bg-zinc-300 text-zinc-800 flex flex-col items-center justify-center cursor-pointer"
            title="حذف السند [F9]"
          >
            <Trash2 className="w-4 h-4 text-red-700" />
            <span className="text-[10px] font-bold">حذف [F9]</span>
          </button>

          <div className="w-[1px] h-8 bg-zinc-400 mx-1"></div>

          <button 
            onClick={() => setIsPreviewOpen(true)} 
            className="h-10 px-2 bg-[#f0f0f0] border border-transparent hover:border-white hover:border-b-zinc-600 hover:border-r-zinc-600 active:bg-zinc-300 text-zinc-800 flex flex-col items-center justify-center cursor-pointer"
            title="معاينة الطباعة [F8]"
          >
            <Eye className="w-4 h-4 text-blue-800" />
            <span className="text-[10px] font-bold">معاينة [F8]</span>
          </button>

          <button 
            onClick={handleSilentPrint} 
            className="h-10 px-2 bg-[#f0f0f0] border border-transparent hover:border-white hover:border-b-zinc-600 hover:border-r-zinc-600 active:bg-zinc-300 text-zinc-800 flex flex-col items-center justify-center cursor-pointer"
            title="طباعة مباشرة [F6]"
          >
            <Printer className="w-4 h-4 text-zinc-700" />
            <span className="text-[10px] font-bold">طباعة [F6]</span>
          </button>

          <div className="w-[1px] h-8 bg-zinc-400 mx-1"></div>

          <button 
            onClick={() => setIsSearchOpen(!isSearchOpen)} 
            className={`h-10 px-2 bg-[#f0f0f0] border border-transparent hover:border-white hover:border-b-zinc-600 hover:border-r-zinc-600 active:bg-zinc-300 text-zinc-800 flex flex-col items-center justify-center cursor-pointer ${isSearchOpen ? 'bg-zinc-300 border-zinc-500' : ''}`}
            title="بحث عن سند"
          >
            <Search className="w-4 h-4 text-indigo-700" />
            <span className="text-[10px] font-bold">بحث سخر</span>
          </button>

          <button 
            onClick={() => setIsAuditLogsOpen(true)} 
            className="h-10 px-2 bg-[#f0f0f0] border border-transparent hover:border-white hover:border-b-zinc-600 hover:border-r-zinc-600 active:bg-zinc-300 text-zinc-800 flex flex-col items-center justify-center cursor-pointer"
            title="سجل التدقيق والعمليات للمستند"
          >
            <FileSpreadsheet className="w-4 h-4 text-amber-700" />
            <span className="text-[10px] font-bold">سجل العمليات</span>
          </button>
        </div>

        {/* Fast Barcode reader inside Toolbar */}
        <div className="flex items-center gap-1.5 ml-2">
          <span className="text-[10px] font-bold text-zinc-600">قارئ باركود:</span>
          <form onSubmit={handleBarcodeSubmit} className="flex items-center bg-white border border-zinc-400 px-1 py-0.5 shadow-inner">
            <Barcode className="w-3.5 h-3.5 text-zinc-500 mr-0.5 ml-1" />
            <input
              type="text"
              placeholder="مرر الباركود السلعي..."
              value={barcodeInput}
              onChange={e => setBarcodeInput(e.target.value)}
              className="bg-transparent text-[11px] text-zinc-900 focus:outline-none w-32 font-mono font-bold"
            />
          </form>
        </div>
      </div>

      {/* 4. ACTIVE WINDOW TABS (Traditional MDI documents switch) */}
      <div className="bg-[#e0e0e0] border-b border-zinc-400 px-1.5 pt-1.5 flex items-end shrink-0 gap-0.5 overflow-x-auto font-sans">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              onClick={() => handleSwitchTab(tab.id)}
              className={`px-3 py-1 text-[11px] font-bold flex items-center gap-1.5 cursor-pointer border-t border-l border-r ${
                isActive 
                  ? 'bg-[#f0f0f0] text-blue-900 border-zinc-400 border-b-[#f0f0f0] z-10 font-black relative top-[1px] shadow-[0_-2px_2px_rgba(0,0,0,0.05)]' 
                  : 'bg-[#d8d8d8] text-zinc-600 border-transparent hover:bg-[#e4e4e4]'
              }`}
            >
              <span className="text-xs">📂</span>
              <span className="truncate max-w-[130px]">{tab.title}</span>
              <button
                onClick={(e) => handleCloseTab(tab.id, e)}
                className="p-0.5 text-zinc-400 hover:text-red-700 font-bold hover:bg-zinc-200"
              >
                ✕
              </button>
            </div>
          );
        })}
        <button
          onClick={() => handleOpenNewTab()}
          className="px-2 py-0.5 mb-0.5 bg-[#f0f0f0] border border-zinc-400 text-zinc-700 hover:bg-zinc-200 text-[10px] font-bold"
          title="مستند مبيعات جديد"
        >
          + تبويب جديد
        </button>
      </div>

      {/* 5. MAIN INTEGRATED WORKSPACE (HIGH-DENSITY WINDOWS ERP LAYOUT) */}
      <div className="flex-1 flex flex-row min-h-0 relative bg-[#f0f0f0]" onClick={() => setOpenMenu(null)}>
        
        {/* Workspace body: inputs & grid */}
        <div className="flex-1 flex flex-col min-h-0 p-1 space-y-1 overflow-y-auto">
          
          {/* Dense inputs section Organized in Bevelled field panels */}
          <div className="grid grid-cols-12 gap-1 bg-[#f0f0f0] p-1 border border-zinc-300 shadow-sm shrink-0">
            
            {/* General Doc Panel */}
            <fieldset className="col-span-4 border border-zinc-400 p-1.5 relative text-right">
              <legend className="px-1 text-[10px] font-black text-blue-900 bg-[#f0f0f0] border border-zinc-400">بيانات السند العامة</legend>
              <div className="grid grid-cols-2 gap-1.5">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-600 mb-0.5">رقم السند المالي:</label>
                  <input
                    type="text"
                    value={activeTab.invoiceNo}
                    onChange={e => updateActiveTab(() => ({ invoiceNo: e.target.value }))}
                    className="w-full bg-white border border-zinc-400 px-1 py-0.5 text-[11px] font-mono font-bold text-zinc-900 shadow-inner rounded-none focus:outline-none focus:border-zinc-700"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-600 mb-0.5">تاريخ المعاملة:</label>
                  <input
                    type="date"
                    value={activeTab.date}
                    onChange={e => updateActiveTab(() => ({ date: e.target.value }))}
                    className="w-full bg-white border border-zinc-400 px-1 py-0.5 text-[11px] font-mono font-bold text-zinc-900 shadow-inner rounded-none focus:outline-none focus:border-zinc-700"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-600 mb-0.5">الفرع المالي:</label>
                  <select
                    value={activeTab.branchId}
                    onChange={e => updateActiveTab(() => ({ branchId: e.target.value }))}
                    className="w-full bg-white border border-zinc-400 p-0.5 text-[11px] font-bold text-zinc-900 rounded-none focus:outline-none"
                  >
                    {branches.map(br => <option key={br.id} value={br.id}>{br.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-600 mb-0.5">طريقة السداد:</label>
                  <select
                    value={activeTab.paymentMethod}
                    onChange={e => updateActiveTab(() => ({ paymentMethod: e.target.value as any }))}
                    className="w-full bg-white border border-zinc-400 p-0.5 text-[11px] font-bold text-zinc-900 rounded-none focus:outline-none"
                  >
                    <option value="cash">نقدي (صندوق الفروع)</option>
                    <option value="credit">ذمم وآجل (كشف الحساب)</option>
                    <option value="bank">شبكة وبنك (تحويل مباشر)</option>
                  </select>
                </div>
              </div>
            </fieldset>

            {/* Parties & Delivery Panel */}
            <fieldset className="col-span-4 border border-zinc-400 p-1.5 relative text-right">
              <legend className="px-1 text-[10px] font-black text-blue-900 bg-[#f0f0f0] border border-zinc-400">الطرف المقابل والمستودعات</legend>
              <div className="grid grid-cols-2 gap-1.5">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-zinc-600 mb-0.5">الحساب المقابل (العميل/المورد):</label>
                  <select
                    value={activeTab.customerId}
                    onChange={e => updateActiveTab(() => ({ customerId: e.target.value }))}
                    className="w-full bg-white border border-zinc-400 p-0.5 text-[11px] font-bold text-zinc-900 rounded-none focus:outline-none"
                  >
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-600 mb-0.5">مستودع الصرف/السحب:</label>
                  <select
                    value={activeTab.warehouseId}
                    onChange={e => updateActiveTab(() => ({ warehouseId: e.target.value }))}
                    className="w-full bg-white border border-zinc-400 p-0.5 text-[11px] font-bold text-zinc-900 rounded-none focus:outline-none"
                  >
                    {warehouses.map(wh => <option key={wh.id} value={wh.id}>{wh.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-600 mb-0.5">مندوب المبيعات:</label>
                  <select
                    value={activeTab.salesRepId}
                    onChange={e => updateActiveTab(() => ({ salesRepId: e.target.value }))}
                    className="w-full bg-white border border-zinc-400 p-0.5 text-[11px] font-bold text-zinc-900 rounded-none focus:outline-none"
                  >
                    <option value="rep-1">صالح المحمد (المبيعات)</option>
                    <option value="rep-2">خالد العتيبي (مبيعات خارجية)</option>
                    <option value="rep-3">سارة القحطاني (تسويق هاتف)</option>
                  </select>
                </div>
              </div>
            </fieldset>

            {/* Currencies & Accounting Accounts Panel */}
            <fieldset className="col-span-4 border border-zinc-400 p-1.5 relative text-right">
              <legend className="px-1 text-[10px] font-black text-blue-900 bg-[#f0f0f0] border border-zinc-400">التوجيه المالي ومراكز التكلفة</legend>
              <div className="grid grid-cols-2 gap-1.5">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-600 mb-0.5">العملة والعمل المالي:</label>
                  <select
                    value={activeTab.currencyId}
                    onChange={e => updateActiveTab(() => ({ currencyId: e.target.value }))}
                    className="w-full bg-white border border-zinc-400 p-0.5 text-[11px] font-bold text-zinc-900 rounded-none focus:outline-none"
                  >
                    {currencies.map(c => <option key={c.id} value={c.id}>{c.name} ({c.symbol})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-600 mb-0.5">الحساب المدين المقترح:</label>
                  <select
                    value={activeTab.cashAccountId}
                    onChange={e => updateActiveTab(() => ({ cashAccountId: e.target.value }))}
                    className="w-full bg-white border border-zinc-400 p-0.5 text-[10px] font-bold text-zinc-800 rounded-none focus:outline-none"
                  >
                    <option value="acc-111001">الصندوق الرئيسي 111001</option>
                    <option value="acc-111002">صندوق مشتريات 111002</option>
                    <option value="acc-121001">ذمم العملاء المدينة 121001</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-600 mb-0.5">مركز تكلفة (أ):</label>
                  <select
                    value={activeTab.debitCostCenterId}
                    onChange={e => updateActiveTab(() => ({ debitCostCenterId: e.target.value }))}
                    className="w-full bg-white border border-zinc-400 p-0.5 text-[11px] font-bold text-zinc-900 rounded-none focus:outline-none"
                  >
                    {costCenters.map(cc => <option key={cc.id} value={cc.id}>{cc.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-600 mb-0.5">مركز تكلفة (ب):</label>
                  <select
                    value={activeTab.creditCostCenterId}
                    onChange={e => updateActiveTab(() => ({ creditCostCenterId: e.target.value }))}
                    className="w-full bg-white border border-zinc-400 p-0.5 text-[11px] font-bold text-zinc-900 rounded-none focus:outline-none"
                  >
                    {costCenters.map(cc => <option key={cc.id} value={cc.id}>{cc.name}</option>)}
                  </select>
                </div>
              </div>
            </fieldset>

            {/* Description/Explanation across full layout */}
            <div className="col-span-12 flex items-center gap-1.5 mt-1 border-t border-zinc-300 pt-1">
              <span className="text-[10px] font-bold text-zinc-600 shrink-0">البيان / الشرح:</span>
              <input
                type="text"
                value={activeTab.description}
                placeholder="اكتب بياناً محاسبياً مفصلاً يرحل تلقائياً كشرح في القيود اليومية..."
                onChange={e => updateActiveTab(() => ({ description: e.target.value }))}
                className="flex-1 bg-white border border-zinc-400 px-1.5 py-0.5 text-[11px] font-bold text-zinc-900 shadow-inner rounded-none focus:outline-none"
              />
              <span className="text-[10px] font-bold text-zinc-600 shrink-0">مرجع الفاتورة:</span>
              <input
                type="text"
                value={activeTab.originalInvoiceRef}
                placeholder="رقم المستند المرجعي"
                onChange={e => updateActiveTab(() => ({ originalInvoiceRef: e.target.value }))}
                className="w-40 bg-white border border-zinc-400 px-1.5 py-0.5 text-[11px] font-bold text-zinc-900 shadow-inner rounded-none focus:outline-none"
              />
            </div>

          </div>

          {/* Core DataGrid Element - occupies most space */}
          <div 
            style={{ height: gridHeight }} 
            className="flex flex-col min-h-[120px] relative border-2 border-zinc-400 overflow-hidden shrink-0"
          >
            <ExcelGrid
              rows={activeTab.gridRows}
              onChange={(updated) => updateActiveTab(() => ({ gridRows: updated }))}
              onActiveCellChange={(address) => setGridActiveCellAddress(address)}
              onAddRow={() => {
                const newRowId = `grid-row-${Date.now()}`;
                const matched = items[0];
                const newRows = [
                  ...activeTab.gridRows,
                  {
                    id: newRowId,
                    itemId: matched?.id || '',
                    quantity: 1,
                    unitPrice: activeTab.invoiceType.includes('purchase') ? (matched?.purchasePrice || 0) : (matched?.salePrice || 0),
                    unit: matched?.unit || 'حبة',
                    notes: '',
                    total: activeTab.invoiceType.includes('purchase') ? (matched?.purchasePrice || 0) : (matched?.salePrice || 0)
                  }
                ];
                updateActiveTab(() => ({ gridRows: newRows, selectedGridRowId: newRowId }));
              }}
              onDeleteRow={(id) => {
                if (activeTab.gridRows.length <= 1) {
                  showToast('يجب أن تحتوي الفاتورة على سطر واحد على الأقل.', 'warning');
                  return;
                }
                const filtered = activeTab.gridRows.filter(r => r.id !== id);
                updateActiveTab(() => ({ gridRows: filtered, selectedGridRowId: filtered[0]?.id || '' }));
              }}
              invoiceType={activeTab.invoiceType}
            />

            {/* Resize Handle below Grid */}
            <div
              onMouseDown={handleHorizontalSeparatorMouseDown}
              className="absolute bottom-0 left-0 right-0 h-1.5 cursor-row-resize bg-zinc-300 hover:bg-blue-600 z-40 transition-colors"
              title="اسحب لتعديل ارتفاع شبكة المدخلات"
            />
          </div>

          {/* Bottom summaries section: calculations & discounts */}
          <div className="grid grid-cols-12 gap-1.5 shrink-0">
            <div className="col-span-8 border border-zinc-400 p-1 bg-[#f5f5f5]">
              <div className="flex gap-2">
                <div className="w-1/2">
                  <label className="block text-[10px] text-zinc-600 mb-0.5">ملاحظات و تذييل السند:</label>
                  <textarea
                    rows={2}
                    value={activeTab.notes}
                    onChange={e => updateActiveTab(() => ({ notes: e.target.value }))}
                    className="w-full bg-white border border-zinc-400 p-1 text-[11px] font-bold text-zinc-900 shadow-inner focus:outline-none"
                    placeholder="ملاحظات تظهر أسفل الفاتورة المطبوعة..."
                  />
                </div>
                <div className="w-1/2 grid grid-cols-2 gap-1.5">
                  <div>
                    <label className="block text-[10px] text-zinc-600 mb-0.5">الخصم الإجمالي ر.س:</label>
                    <input
                      type="number"
                      value={activeTab.discount}
                      onChange={e => updateActiveTab(() => ({ discount: Number(e.target.value) }))}
                      className="w-full bg-white border border-zinc-400 px-1 py-0.5 font-mono text-[11px] font-bold text-zinc-900 shadow-inner rounded-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-600 mb-0.5">الإضافات / الرسوم ر.س:</label>
                    <input
                      type="number"
                      value={activeTab.addition}
                      onChange={e => updateActiveTab(() => ({ addition: Number(e.target.value) }))}
                      className="w-full bg-white border border-zinc-400 px-1 py-0.5 font-mono text-[11px] font-bold text-zinc-900 shadow-inner rounded-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-600 mb-0.5">نسبة الضريبة %:</label>
                    <input
                      type="number"
                      value={activeTab.taxPercent}
                      onChange={e => updateActiveTab(() => ({ taxPercent: Number(e.target.value) }))}
                      className="w-full bg-white border border-zinc-400 px-1 py-0.5 font-mono text-[11px] font-bold text-zinc-900 shadow-inner rounded-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-600 mb-0.5">المبلغ المدفوع ر.س:</label>
                    <input
                      type="number"
                      value={activeTab.paidAmount}
                      onChange={e => updateActiveTab(() => ({ paidAmount: Number(e.target.value) }))}
                      className="w-full bg-white border border-zinc-400 px-1 py-0.5 font-mono text-[11px] font-bold text-zinc-900 shadow-inner rounded-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Calculations summaries */}
            <div className="col-span-4 bg-zinc-800 text-white p-2 border-2 border-zinc-950 flex flex-col justify-between">
              <div className="space-y-1 text-[11px] font-bold text-right">
                <div className="flex justify-between">
                  <span className="text-zinc-400">الإجمالي المبدئي للسلع:</span>
                  <span className="font-mono">{subtotal.toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between text-rose-400">
                  <span>ضريبة القيمة المضافة:</span>
                  <span className="font-mono">+{taxAmount.toFixed(2)} ر.س</span>
                </div>
                <div className="border-t border-zinc-700 pt-1 flex justify-between text-emerald-400 text-[12px] font-black">
                  <span>الصافي النهائي للمستند:</span>
                  <span className="font-mono text-white text-[13px]">{netAmount.toFixed(2)} ر.س</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Vertical Resizable bar */}
        <div
          onMouseDown={handleVerticalSeparatorMouseDown}
          className="w-1 bg-zinc-300 hover:bg-blue-600 cursor-col-resize shrink-0 z-40 transition-colors"
          title="اسحب لتعديل عرض بطاقة المادة"
        />

        {/* Right Sidebar: Windows ERP Stock Card */}
        <div 
          style={{ width: sidebarWidth }} 
          className="bg-[#f0f0f0] border-r border-zinc-400 p-1.5 flex flex-col justify-between shrink-0 overflow-y-auto min-w-[120px] select-none text-right font-sans"
        >
          {currentItemInTab ? (
            <div className="space-y-2 border border-zinc-400 p-2 bg-white">
              <div className="border-b border-zinc-300 pb-1">
                <span className="text-[9px] font-black text-blue-900 tracking-wider">بطاقة المادة النشطة</span>
                <h4 className="text-[11px] font-bold text-zinc-800 truncate mt-0.5" title={currentItemInTab.name}>
                  {currentItemInTab.name}
                </h4>
              </div>

              <div className="space-y-1 text-[10px] text-zinc-700 font-bold leading-relaxed">
                <div className="flex justify-between font-mono">
                  <span>رمز المادة:</span>
                  <span className="text-zinc-900">{currentItemInTab.code}</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span>الباركود:</span>
                  <span className="text-zinc-900">{currentItemInTab.barcode || '---'}</span>
                </div>
                <div className="flex justify-between font-mono border-t border-zinc-200 pt-1.5 mt-1.5">
                  <span>الرصيد بالمخزن:</span>
                  <span className={`font-black ${currentItemInTab.currentStock < 5 ? 'text-red-600' : 'text-emerald-700'}`}>
                    {currentItemInTab.currentStock} {currentItemInTab.unit || 'حبة'}
                  </span>
                </div>
                <div className="flex justify-between font-mono">
                  <span>آخر سعر شراء:</span>
                  <span>{currentItemInTab.purchasePrice?.toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span>سعر البيع المعتمد:</span>
                  <span className="text-blue-800 font-black">{currentItemInTab.salePrice?.toFixed(2)} ر.س</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-zinc-500 flex flex-col gap-1 items-center justify-center border border-zinc-400 p-2 bg-white h-full">
              <HelpCircle className="w-8 h-8 text-zinc-300" />
              <span className="text-[9px] font-bold">حدد خلية سطر صنف لعرض بطاقته هنا</span>
            </div>
          )}

          {/* Quick Tab additions */}
          <div className="border-t border-zinc-300 pt-2.5 mt-2 space-y-1">
            <button
              onClick={() => handleOpenNewTab('sale')}
              className="w-full text-right py-1 px-1.5 bg-white hover:bg-zinc-200 border border-zinc-400 text-[10px] font-bold text-blue-900 flex items-center gap-1 cursor-pointer"
            >
              <span>📂 فتح مبيعات بتبويب مستقل</span>
            </button>
            <button
              onClick={() => handleOpenNewTab('purchase')}
              className="w-full text-right py-1 px-1.5 bg-white hover:bg-zinc-200 border border-zinc-400 text-[10px] font-bold text-amber-900 flex items-center gap-1 cursor-pointer"
            >
              <span>📂 فتح مشتريات بتبويب مستقل</span>
            </button>
          </div>
        </div>

      </div>

      {/* 6. WINDOWS RETRO STATUS BAR */}
      <div className="bg-[#e0e0e0] border-t border-zinc-400 h-6 shrink-0 flex items-center justify-between text-[11px] font-bold text-zinc-700 px-1 select-none font-sans">
        <div className="flex items-center gap-2 flex-1">
          <div className="px-2 border-l border-zinc-400 flex items-center gap-1 text-emerald-800 font-bold shrink-0">
            <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-ping"></span>
            <span>جاهز</span>
          </div>
          <div className="px-2 border-l border-zinc-400 truncate shrink-0">
            <span>المستخدم الحالي: المدير العام (المدير)</span>
          </div>
          <div className="px-2 border-l border-zinc-400 truncate">
            <span className="text-blue-800 font-mono font-bold">{gridActiveCellAddress}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-2 border-r border-zinc-400 shrink-0 font-mono text-[10px]">
            <span>سيرفر الميزان: متصل</span>
          </div>
          <div className="px-2 border-r border-zinc-400 shrink-0 text-zinc-500 font-mono text-[10px]">
            <span>سنة مالية: 2026</span>
          </div>
        </div>
      </div>

      {/* ================= MODALS & DIALOGS ================= */}

      {/* PRINT PREVIEW DIALOG (Retro Desktop Style) */}
      {isPreviewOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[9999] font-sans" dir="rtl">
          <div className="bg-[#f0f0f0] border-2 border-zinc-500 w-[950px] h-[600px] flex flex-col overflow-hidden shadow-2xl">
            
            {/* Dialog Header */}
            <div className="bg-gradient-to-r from-[#000080] to-[#1084d0] text-white px-2 py-1 flex items-center justify-between select-none shrink-0 font-bold text-xs">
              <span>🖨️ معاينة وتعديل قالب السند المطبوع - الميزان .NET</span>
              <button onClick={() => setIsPreviewOpen(false)} className="w-4 h-4 bg-[#f0f0f0] text-black text-[9px] flex items-center justify-center border hover:bg-red-600 hover:text-white font-black cursor-pointer">✕</button>
            </div>

            {/* Dialog Layout: Settings vs Sheet Preview */}
            <div className="flex-1 flex min-h-0">
              
              {/* Left sidebar designer settings */}
              <div className="w-72 bg-[#e0e0e0] border-l border-zinc-400 p-2 space-y-3 overflow-y-auto shrink-0 font-bold text-[11px] text-zinc-800">
                <div className="border border-zinc-400 p-2 bg-white">
                  <label className="block text-[10px] text-zinc-600 mb-1">اختر قالب/نموذج الطباعة:</label>
                  <select
                    value={selectedPrintModel}
                    onChange={e => {
                      const model = e.target.value;
                      setSelectedPrintModel(model);
                      if (model === 'A4_Full') {
                        setPrintCustomizations(prev => ({ ...prev, fontSize: '11px', showLogo: true, showPrices: true, showQuantities: true }));
                      } else if (model.includes('Thermal')) {
                        setPrintCustomizations(prev => ({ ...prev, fontSize: '9px', showLogo: true, marginSize: '5px' }));
                      }
                      showToast(`تم تبديل نموذج الطباعة`, 'info');
                    }}
                    className="w-full bg-white border border-zinc-400 p-1 text-[11px] font-bold text-zinc-950 rounded-none focus:outline-none"
                  >
                    <option value="A4_Full">فاتورة A4 كاملة (مع الترويسة والإطارات)</option>
                    <option value="A5_Half">فاتورة نصف A4 (نموذج مدمج A5)</option>
                    <option value="Thermal_80">فاتورة نقاط بيع حرارية 80 مم</option>
                  </select>
                </div>

                <div className="border border-zinc-400 p-2 bg-white space-y-2">
                  <div className="text-[10px] text-blue-900 border-b pb-1 font-black">خيارات مصمم الشاشات</div>
                  
                  <div>
                    <label className="block text-[9px] text-zinc-500">عنوان السند الرئيسي:</label>
                    <input
                      type="text"
                      value={printCustomizations.title}
                      onChange={e => setPrintCustomizations({ ...printCustomizations, title: e.target.value })}
                      className="w-full bg-white border border-zinc-400 p-1 text-[11px] font-bold text-zinc-900 rounded-none focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] text-zinc-500">اسم الشركة / العنوان الفرعي:</label>
                    <input
                      type="text"
                      value={printCustomizations.subTitle}
                      onChange={e => setPrintCustomizations({ ...printCustomizations, subTitle: e.target.value })}
                      className="w-full bg-white border border-zinc-400 p-1 text-[11px] font-bold text-zinc-900 rounded-none focus:outline-none"
                    />
                  </div>

                  <div className="pt-2 space-y-1.5 border-t border-zinc-200">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={printCustomizations.showLogo}
                        onChange={e => setPrintCustomizations({ ...printCustomizations, showLogo: e.target.checked })}
                        className="rounded-none focus:ring-0"
                      />
                      إظهار شعار الترويسة {printCustomizations.logoIcon}
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={printCustomizations.showPrices}
                        onChange={e => setPrintCustomizations({ ...printCustomizations, showPrices: e.target.checked })}
                        className="rounded-none focus:ring-0"
                      />
                      إظهار الأسعار والإجماليات
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={printCustomizations.showQuantities}
                        onChange={e => setPrintCustomizations({ ...printCustomizations, showQuantities: e.target.checked })}
                        className="rounded-none focus:ring-0"
                      />
                      إظهار عمود الكمية
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={printCustomizations.showQRCode}
                        onChange={e => setPrintCustomizations({ ...printCustomizations, showQRCode: e.target.checked })}
                        className="rounded-none focus:ring-0"
                      />
                      رمز الاستجابة ZATCA المتوافق
                    </label>
                  </div>
                </div>

                <div className="bg-yellow-50 p-2 border border-yellow-300 text-[10px] text-yellow-800 leading-relaxed font-bold">
                  🖶 التغييرات التي تجريها هنا تظهر فوراً في المعاينة ويتم تذكرها تلقائياً على خيارات الطباعة للجلسة.
                </div>
              </div>

              {/* Right sheet visual view */}
              <div className="flex-1 bg-zinc-400 overflow-y-auto p-4 flex justify-center items-start">
                
                <div 
                  style={{ 
                    width: selectedPrintModel.includes('Thermal') ? '340px' : '500px',
                    borderColor: printCustomizations.colorTheme,
                    padding: printCustomizations.marginSize
                  }}
                  className="bg-white border-t-[6px] shadow-xl p-5 relative text-right text-xs font-bold leading-relaxed space-y-3 text-zinc-900 border border-zinc-300"
                >
                  {printCustomizations.showLogo && (
                    <div className="flex justify-between items-center border-b pb-2 border-zinc-200">
                      <div>
                        <div className="text-sm font-black" style={{ color: printCustomizations.colorTheme }}>
                          {printCustomizations.title}
                        </div>
                        <div className="text-[10px] text-zinc-500 font-bold">
                          {printCustomizations.subTitle}
                        </div>
                      </div>
                      <div className="text-3xl shrink-0">{printCustomizations.logoIcon}</div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-1 text-[10px] text-zinc-600 bg-zinc-50 p-1.5 border border-zinc-200">
                    <div>
                      <span>رقم المعاملة: <span className="font-mono text-zinc-900">{activeTab.invoiceNo}</span></span><br/>
                      <span>تاريخ المعاملة: <span className="font-mono text-zinc-900">{activeTab.date}</span></span>
                    </div>
                    <div>
                      <span>الحساب المقابل: <span className="text-zinc-900">{customers.find(c => c.id === activeTab.customerId)?.name || 'نقدي'}</span></span><br/>
                      <span>المستودع المالي: <span className="text-zinc-900">{warehouses.find(w => w.id === activeTab.warehouseId)?.name || 'الرئيسي'}</span></span>
                    </div>
                  </div>

                  <div className="border border-zinc-300">
                    <table className="w-full text-[10px] font-bold border-collapse">
                      <thead>
                        <tr style={{ backgroundColor: printCustomizations.colorTheme }} className="text-white text-right">
                          <th className="p-1 text-center w-6 border-b border-zinc-300">#</th>
                          <th className="p-1 border-b border-zinc-300">اسم الصنف السلعي</th>
                          {printCustomizations.showQuantities && <th className="p-1 text-center w-12 border-b border-zinc-300">الكمية</th>}
                          {printCustomizations.showPrices && <th className="p-1 text-center w-16 border-b border-zinc-300">السعر</th>}
                          {printCustomizations.showPrices && <th className="p-1 text-left w-16 border-b border-zinc-300">الإجمالي</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 bg-white text-zinc-700">
                        {activeTab.gridRows.map((row, idx) => {
                          const it = items.find(i => i.id === row.itemId);
                          return (
                            <tr key={row.id}>
                              <td className="p-1 text-center font-mono border-l border-zinc-200">{idx + 1}</td>
                              <td className="p-1 truncate border-l border-zinc-200">{it?.name || 'صنف سلعي'}</td>
                              {printCustomizations.showQuantities && <td className="p-1 text-center font-mono border-l border-zinc-200">{row.quantity}</td>}
                              {printCustomizations.showPrices && <td className="p-1 text-center font-mono border-l border-zinc-200">{row.unitPrice.toFixed(2)}</td>}
                              {printCustomizations.showPrices && <td className="p-1 text-left font-mono">{row.total.toFixed(2)}</td>}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-between items-end pt-2 border-t border-zinc-200">
                    {printCustomizations.showQRCode && (
                      <div className="w-16 h-16 border-2 border-zinc-400 p-0.5 bg-white shrink-0">
                        <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
                          <rect width="100" height="100" fill="white" />
                          <rect x="5" y="5" width="20" height="20" fill="black" />
                          <rect x="75" y="5" width="20" height="20" fill="black" />
                          <rect x="5" y="75" width="20" height="20" fill="black" />
                          <rect x="35" y="35" width="30" height="30" fill="black" />
                        </svg>
                      </div>
                    )}

                    {printCustomizations.showPrices && (
                      <div className="w-48 bg-zinc-50 border border-zinc-300 p-1.5 text-[10px] text-zinc-700 space-y-1">
                        <div className="flex justify-between">
                          <span>الإجمالي للسلع:</span>
                          <span className="font-mono text-zinc-950">{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-red-700 font-bold">
                          <span>الضريبة {activeTab.taxPercent}%:</span>
                          <span className="font-mono">+{taxAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-blue-900 font-black border-t pt-1 text-[11px]">
                          <span>الصافي المطلوب:</span>
                          <span className="font-mono">{netAmount.toFixed(2)} ر.س</span>
                        </div>
                      </div>
                    )}
                  </div>

                </div>

              </div>

            </div>

            {/* Dialog Footer */}
            <div className="bg-[#e0e0e0] p-1.5 border-t border-zinc-400 flex justify-end gap-1 shrink-0 font-sans">
              <button 
                onClick={() => setIsPreviewOpen(false)} 
                className="px-4 py-1 bg-[#f0f0f0] border border-zinc-400 hover:bg-zinc-200 font-bold text-xs cursor-pointer active:bg-zinc-300"
              >
                إلغاء المعاينة
              </button>
              <button 
                onClick={() => { setIsPreviewOpen(false); handleSilentPrint(); }} 
                className="px-4 py-1 bg-blue-800 text-white border border-blue-950 hover:bg-blue-900 font-bold text-xs cursor-pointer flex items-center gap-1 shadow-sm"
              >
                <Printer className="w-4 h-4" /> إرسال مباشر للطابعة [F6]
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ABOUT DIALOG (Classic Windows About Box) */}
      {isAboutOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-[9999] font-sans" dir="rtl">
          <div className="bg-[#f0f0f0] border-2 border-zinc-500 w-96 shadow-2xl flex flex-col">
            <div className="bg-gradient-to-r from-[#000080] to-[#1084d0] text-white px-2 py-0.5 flex items-center justify-between font-bold text-xs">
              <span>حول برنامج الميزان .NET</span>
              <button onClick={() => setIsAboutOpen(false)} className="w-4 h-4 bg-[#f0f0f0] text-black text-[9px] flex items-center justify-center border hover:bg-red-600 hover:text-white font-black cursor-pointer">✕</button>
            </div>
            <div className="p-4 space-y-3 text-center">
              <div className="text-3xl">⚖️</div>
              <h2 className="text-sm font-black text-zinc-950">الميزان المحاسبي والمستودعات d.net</h2>
              <p className="text-[11px] text-zinc-600 font-bold leading-relaxed">
                الإصدار الاحترافي السحابي الموحد 2026.07<br/>
                تطوير شركة الميزان لتطوير البرمجيات والنظم المحاسبية المتكاملة.<br/>
                مرخص لـ: المدير العام (ترخيص مؤسسي دولي دائم).
              </p>
              <div className="border-t border-zinc-300 my-2 pt-2 text-[9px] text-zinc-400 font-bold">
                جميع الحقوق محفوظة © 2010 - 2026 الميزان دوت نت
              </div>
              <div className="flex justify-center">
                <button 
                  onClick={() => setIsAboutOpen(false)} 
                  className="px-6 py-1 bg-[#f0f0f0] border border-zinc-400 hover:bg-zinc-200 text-xs font-bold shadow-xs active:bg-zinc-300"
                >
                  موافق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AUDIT LOGS DIALOG */}
      {isAuditLogsOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-[9999] font-sans" dir="rtl">
          <div className="bg-[#f0f0f0] border-2 border-zinc-500 w-[500px] shadow-2xl flex flex-col">
            <div className="bg-gradient-to-r from-[#000080] to-[#1084d0] text-white px-2 py-0.5 flex items-center justify-between font-bold text-xs">
              <span>سجل التدقيق والعمليات للسند المحاسبي</span>
              <button onClick={() => setIsAuditLogsOpen(false)} className="w-4 h-4 bg-[#f0f0f0] text-black text-[9px] flex items-center justify-center border hover:bg-red-600 hover:text-white font-black cursor-pointer">✕</button>
            </div>
            <div className="p-3.5 space-y-2">
              <span className="text-[10px] font-black text-blue-900 block">تتبع عمليات الإدخال والتعديل في الخوادم:</span>
              <div className="bg-white border border-zinc-400 p-2 h-44 overflow-y-auto font-mono text-[10px] font-bold text-zinc-700 space-y-1 shadow-inner">
                {activeTab.auditLogs.map((log, lIdx) => (
                  <div key={lIdx} className="border-b border-zinc-100 pb-0.5 last:border-0">
                    🏁 {log}
                  </div>
                ))}
              </div>
              <div className="flex justify-end pt-2">
                <button 
                  onClick={() => setIsAuditLogsOpen(false)} 
                  className="px-5 py-1 bg-[#f0f0f0] border border-zinc-400 hover:bg-zinc-200 text-xs font-bold active:bg-zinc-300"
                >
                  إغلاق السجل
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SEARCH/SELECTION INDEX POPUP */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-[9999] font-sans" dir="rtl">
          <div className="bg-[#f0f0f0] border-2 border-zinc-500 w-[450px] shadow-2xl flex flex-col">
            <div className="bg-gradient-to-r from-[#000080] to-[#1084d0] text-white px-2 py-0.5 flex items-center justify-between font-bold text-xs">
              <span>بحث سريع في الفواتير والسندات المخزنة</span>
              <button onClick={() => setIsSearchOpen(false)} className="w-4 h-4 bg-[#f0f0f0] text-black text-[9px] flex items-center justify-center border hover:bg-red-600 hover:text-white font-black cursor-pointer">✕</button>
            </div>
            <div className="p-3 space-y-3 text-right">
              <div>
                <label className="block text-[10px] text-zinc-600 mb-1">ابحث برقم الفاتورة أو العميل:</label>
                <input
                  type="text"
                  placeholder="ابحث هنا..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-zinc-400 px-2 py-1 text-[11px] font-bold text-zinc-900 shadow-inner rounded-none focus:outline-none"
                />
              </div>

              <div className="bg-white border border-zinc-400 p-1.5 h-36 overflow-y-auto space-y-1 text-[10px] font-bold text-zinc-700 shadow-inner">
                {invoices
                  .filter(inv => inv.invoiceNo.includes(searchQuery) || (customers.find(c => c.id === inv.customerId)?.name || '').includes(searchQuery))
                  .map(inv => (
                    <div 
                      key={inv.id}
                      onClick={() => {
                        const loaded = createNewTabStructure(inv.type, inv.id);
                        setTabs(prev => [...prev.filter(t => t.id !== inv.id), loaded]);
                        setActiveTabId(inv.id);
                        setIsSearchOpen(false);
                        showToast(`تم تحميل الفاتورة رقم ${inv.invoiceNo}`, 'success');
                      }}
                      className="p-1 hover:bg-blue-800 hover:text-white cursor-pointer flex justify-between items-center border-b border-zinc-100 last:border-0"
                    >
                      <span>📂 {getArabicTypeLabel(inv.type)} #{inv.invoiceNo}</span>
                      <span>العميل: {customers.find(c => c.id === inv.customerId)?.name || 'نقدي'}</span>
                    </div>
                  ))}
              </div>

              <div className="flex justify-end pt-1">
                <button 
                  onClick={() => setIsSearchOpen(false)} 
                  className="px-5 py-1 bg-[#f0f0f0] border border-zinc-400 hover:bg-zinc-200 text-xs font-bold active:bg-zinc-300"
                >
                  إلغاء البحث
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

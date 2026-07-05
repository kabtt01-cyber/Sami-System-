import React, { useState } from 'react';
import { useErp } from '../context/ErpContext';
import { 
  User, BookOpen, FileSpreadsheet, Package, Layers, TrendingUp, 
  UserCheck, Shield, FileText, LayoutGrid, Calendar, HelpCircle, 
  DollarSign, BarChart3, PlusCircle, ShoppingCart, Percent, Settings2, Lock, Sparkles,
  Columns, Rows, Minimize, Maximize2, Trash2, Smartphone, Monitor, QrCode, BellRing, GitFork, Cpu, Gauge, Building, Milestone, Globe
} from 'lucide-react';

export const Ribbon: React.FC = () => {
  const { 
    openWindow, connectedDbId, currentUser, showToast, theme, customColor,
    tileWindows, minimizeAll, restoreAll, closeAll
  } = useErp();
  const [activeTab, setActiveTab] = useState<'accounting' | 'inventory' | 'sales' | 'system' | 'advanced'>('accounting');

  const hasPermission = (permissionKey?: string) => {
    if (!permissionKey) return true;
    if (!currentUser) return false;
    return !!(currentUser.permissions as any)[permissionKey];
  };

  if (!connectedDbId) return null;

  const isDark = theme === 'dark' || theme === 'light-black';
  
  const getTabClass = (tabId: string) => {
    const isActive = activeTab === tabId;
    if (isDark) {
      return `px-5 py-1.5 text-[13px] font-bold rounded-t-md transition-all border-x border-t cursor-pointer ${
        isActive
          ? 'bg-zinc-900 border-zinc-800 text-amber-400'
          : 'bg-transparent border-transparent text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
      }`;
    }
    if (theme === 'custom') {
      return `px-5 py-1.5 text-[13px] font-bold rounded-t-md transition-all border-x border-t cursor-pointer ${
        isActive
          ? 'bg-slate-50 border-slate-300 text-slate-800 shadow-sm'
          : 'bg-transparent border-transparent text-white/80 hover:bg-white/10 hover:text-white'
      }`;
    }
    return `px-5 py-1.5 text-[13px] font-bold rounded-t-md transition-all border-x border-t cursor-pointer ${
      isActive
        ? 'bg-slate-50 border-slate-300 text-blue-700 shadow-[0_-2px_5px_rgba(0,0,0,0.05)]'
        : 'bg-transparent border-transparent text-slate-600 hover:bg-slate-300 hover:text-slate-800'
    }`;
  };

  const customHeaderStyle = theme === 'custom'
    ? { backgroundColor: `${customColor}dd` }
    : {};

  return (
    <div className={`border-b shadow-sm flex flex-col select-none z-40 transition-all duration-300 ${isDark ? 'bg-zinc-900 border-zinc-850' : 'bg-slate-50 border-slate-300'}`} id="erp-ribbon">
      {/* Ribbon Tabs Header */}
      <div 
        className={`flex border-b pr-2 pt-1 gap-1 transition-all duration-300 ${isDark ? 'bg-zinc-950 border-zinc-850' : theme === 'custom' ? 'border-slate-300' : 'bg-slate-200 border-slate-300'}`}
        style={customHeaderStyle}
      >
        <button
          onClick={() => setActiveTab('accounting')}
          className={getTabClass('accounting')}
        >
          المحاسبة والقيود
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={getTabClass('inventory')}
        >
          بطاقات ومخازن المواد
        </button>
        <button
          onClick={() => setActiveTab('sales')}
          className={getTabClass('sales')}
        >
          حركة الفواتير والمبيعات
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={getTabClass('system')}
        >
          أدوات النظام والصلاحيات
        </button>
        <button
          onClick={() => setActiveTab('advanced')}
          className={getTabClass('advanced')}
        >
          مميزات ERP المتقدمة (Phase 8)
        </button>
      </div>

      {/* Ribbon Panels */}
      <div className={`p-2.5 flex items-center gap-2 overflow-x-auto min-h-[92px] transition-colors duration-300 ${isDark ? 'bg-zinc-900' : 'bg-slate-50'}`}>
        
        {/* ACCOUNTING PANEL */}
        {activeTab === 'accounting' && (
          <div className="flex gap-1.5">
            <button
              onClick={() => openWindow('account_card', 'بطاقة الحساب')}
              disabled={!hasPermission('accounting')}
              className={`flex flex-col items-center justify-center p-1.5 rounded border border-transparent min-w-[70px] group transition-all ${
                hasPermission('accounting')
                  ? 'hover:border-blue-200 hover:bg-blue-50/50 cursor-pointer'
                  : 'opacity-40 cursor-not-allowed'
              }`}
            >
              <div className="bg-blue-100 text-blue-700 p-2.5 rounded-lg group-hover:scale-105 transition-transform shadow-xs relative">
                <PlusCircle className="w-5 h-5" />
                {!hasPermission('accounting') && <Lock className="w-3 h-3 text-red-600 absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-md" />}
              </div>
              <span className="text-[11.5px] font-bold text-slate-700 mt-1">بطاقة حساب</span>
            </button>

            <button
              onClick={() => openWindow('chart_of_accounts', 'دليل الحسابات المالي')}
              disabled={!hasPermission('accounting')}
              className={`flex flex-col items-center justify-center p-1.5 rounded border border-transparent min-w-[70px] group transition-all ${
                hasPermission('accounting')
                  ? 'hover:border-blue-200 hover:bg-blue-50/50 cursor-pointer'
                  : 'opacity-40 cursor-not-allowed'
              }`}
            >
              <div className="bg-emerald-100 text-emerald-700 p-2.5 rounded-lg group-hover:scale-105 transition-transform shadow-xs relative">
                <BookOpen className="w-5 h-5" />
                {!hasPermission('accounting') && <Lock className="w-3 h-3 text-red-600 absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-md" />}
              </div>
              <span className="text-[11.5px] font-bold text-slate-700 mt-1">الحسابات</span>
            </button>

            <button
              onClick={() => openWindow('journal_entry', 'سند قيد يومية جديد')}
              disabled={!hasPermission('journal_entries')}
              className={`flex flex-col items-center justify-center p-1.5 rounded border border-transparent min-w-[70px] group transition-all ${
                hasPermission('journal_entries')
                  ? 'hover:border-blue-200 hover:bg-blue-50/50 cursor-pointer'
                  : 'opacity-40 cursor-not-allowed'
              }`}
            >
              <div className="bg-amber-100 text-amber-700 p-2.5 rounded-lg group-hover:scale-105 transition-transform shadow-xs relative">
                <FileText className="w-5 h-5" />
                {!hasPermission('journal_entries') && <Lock className="w-3 h-3 text-red-600 absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-md" />}
              </div>
              <span className="text-[11.5px] font-bold text-slate-700 mt-1">سند القيد</span>
            </button>

            <div className="w-[1px] h-12 bg-slate-200 self-center mx-2" />

            <button
              onClick={() => openWindow('reports', 'دفتر الأستاذ التفصيلي', { reportType: 'general_ledger' })}
              disabled={!hasPermission('reports')}
              className={`flex flex-col items-center justify-center p-1.5 rounded border border-transparent min-w-[70px] group transition-all ${
                hasPermission('reports')
                  ? 'hover:border-blue-200 hover:bg-blue-50/50 cursor-pointer'
                  : 'opacity-40 cursor-not-allowed'
              }`}
            >
              <div className="bg-sky-100 text-sky-700 p-2.5 rounded-lg group-hover:scale-105 transition-transform shadow-xs relative">
                <FileSpreadsheet className="w-5 h-5" />
                {!hasPermission('reports') && <Lock className="w-3 h-3 text-red-600 absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-md" />}
              </div>
              <span className="text-[11.5px] font-bold text-slate-700 mt-1">دفتر الأستاذ</span>
            </button>

            <button
              onClick={() => openWindow('reports', 'كشف حساب عميل', { reportType: 'customer_statement' })}
              disabled={!hasPermission('reports')}
              className={`flex flex-col items-center justify-center p-1.5 rounded border border-transparent min-w-[70px] group transition-all ${
                hasPermission('reports')
                  ? 'hover:border-blue-200 hover:bg-blue-50/50 cursor-pointer'
                  : 'opacity-40 cursor-not-allowed'
              }`}
            >
              <div className="bg-indigo-100 text-indigo-700 p-2.5 rounded-lg group-hover:scale-105 transition-transform shadow-xs relative">
                <User className="w-5 h-5" />
                {!hasPermission('reports') && <Lock className="w-3 h-3 text-red-600 absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-md" />}
              </div>
              <span className="text-[11.5px] font-bold text-slate-700 mt-1">كشف العميل</span>
            </button>

            <button
              onClick={() => openWindow('reports', 'ميزان المراجعة العام', { reportType: 'trial_balance' })}
              disabled={!hasPermission('reports')}
              className={`flex flex-col items-center justify-center p-1.5 rounded border border-transparent min-w-[70px] group transition-all ${
                hasPermission('reports')
                  ? 'hover:border-blue-200 hover:bg-blue-50/50 cursor-pointer'
                  : 'opacity-40 cursor-not-allowed'
              }`}
            >
              <div className="bg-violet-100 text-violet-700 p-2.5 rounded-lg group-hover:scale-105 transition-transform shadow-xs relative">
                <BarChart3 className="w-5 h-5" />
                {!hasPermission('reports') && <Lock className="w-3 h-3 text-red-600 absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-md" />}
              </div>
              <span className="text-[11.5px] font-bold text-slate-700 mt-1">ميزان المراجعة</span>
            </button>
          </div>
        )}

        {/* INVENTORY PANEL */}
        {activeTab === 'inventory' && (
          <div className="flex gap-1.5">
            <button
              onClick={() => openWindow('item_card', 'بطاقة تعريف مادة')}
              disabled={!hasPermission('inventory')}
              className={`flex flex-col items-center justify-center p-1.5 rounded border border-transparent min-w-[70px] group transition-all ${
                hasPermission('inventory')
                  ? 'hover:border-blue-200 hover:bg-blue-50/50 cursor-pointer'
                  : 'opacity-40 cursor-not-allowed'
              }`}
            >
              <div className="bg-amber-100 text-amber-700 p-2.5 rounded-lg group-hover:scale-105 transition-transform shadow-xs relative">
                <PlusCircle className="w-5 h-5" />
                {!hasPermission('inventory') && <Lock className="w-3 h-3 text-red-600 absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-md" />}
              </div>
              <span className="text-[11.5px] font-bold text-slate-700 mt-1">كرت مادة</span>
            </button>

            <button
              onClick={() => openWindow('item_tree', 'دليل المجموعات والمواد')}
              disabled={!hasPermission('inventory')}
              className={`flex flex-col items-center justify-center p-1.5 rounded border border-transparent min-w-[70px] group transition-all ${
                hasPermission('inventory')
                  ? 'hover:border-blue-200 hover:bg-blue-50/50 cursor-pointer'
                  : 'opacity-40 cursor-not-allowed'
              }`}
            >
              <div className="bg-blue-100 text-blue-700 p-2.5 rounded-lg group-hover:scale-105 transition-transform shadow-xs relative">
                <Package className="w-5 h-5" />
                {!hasPermission('inventory') && <Lock className="w-3 h-3 text-red-600 absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-md" />}
              </div>
              <span className="text-[11.5px] font-bold text-slate-700 mt-1">المواد</span>
            </button>

            <button
              onClick={() => openWindow('branches', 'شجرة الفروع والمستودعات')}
              disabled={!hasPermission('inventory')}
              className={`flex flex-col items-center justify-center p-1.5 rounded border border-transparent min-w-[70px] group transition-all ${
                hasPermission('inventory')
                  ? 'hover:border-blue-200 hover:bg-blue-50/50 cursor-pointer'
                  : 'opacity-40 cursor-not-allowed'
              }`}
            >
              <div className="bg-orange-100 text-orange-700 p-2.5 rounded-lg group-hover:scale-105 transition-transform shadow-xs relative">
                <Layers className="w-5 h-5" />
                {!hasPermission('inventory') && <Lock className="w-3 h-3 text-red-600 absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-md" />}
              </div>
              <span className="text-[11.5px] font-bold text-slate-700 mt-1">المستودعات</span>
            </button>

            <div className="w-[1px] h-12 bg-slate-200 self-center mx-2" />

            <button
              onClick={() => openWindow('reports', 'حركة المادة التفصيلية', { reportType: 'item_ledger' })}
              disabled={!hasPermission('reports')}
              className={`flex flex-col items-center justify-center p-1.5 rounded border border-transparent min-w-[70px] group transition-all ${
                hasPermission('reports')
                  ? 'hover:border-blue-200 hover:bg-blue-50/50 cursor-pointer'
                  : 'opacity-40 cursor-not-allowed'
              }`}
            >
              <div className="bg-emerald-100 text-emerald-700 p-2.5 rounded-lg group-hover:scale-105 transition-transform shadow-xs relative">
                <TrendingUp className="w-5 h-5" />
                {!hasPermission('reports') && <Lock className="w-3 h-3 text-red-600 absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-md" />}
              </div>
              <span className="text-[11.5px] font-bold text-slate-700 mt-1">حركة مادة</span>
            </button>

            <button
              onClick={() => openWindow('reports', 'جرد المواد والمخزون', { reportType: 'inventory_list' })}
              disabled={!hasPermission('reports')}
              className={`flex flex-col items-center justify-center p-1.5 rounded border border-transparent min-w-[70px] group transition-all ${
                hasPermission('reports')
                  ? 'hover:border-blue-200 hover:bg-blue-50/50 cursor-pointer'
                  : 'opacity-40 cursor-not-allowed'
              }`}
            >
              <div className="bg-indigo-100 text-indigo-700 p-2.5 rounded-lg group-hover:scale-105 transition-transform shadow-xs relative">
                <LayoutGrid className="w-5 h-5" />
                {!hasPermission('reports') && <Lock className="w-3 h-3 text-red-600 absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-md" />}
              </div>
              <span className="text-[11.5px] font-bold text-slate-700 mt-1">جرد المواد</span>
            </button>
          </div>
        )}

        {/* SALES & INVOICES PANEL */}
        {activeTab === 'sales' && (
          <div className="flex gap-1.5">
            <button
              onClick={() => openWindow('invoice', 'فاتورة مبيعات', { invoiceType: 'sale' })}
              disabled={!hasPermission('sales')}
              className={`flex flex-col items-center justify-center p-1.5 rounded border border-transparent min-w-[70px] group transition-all ${
                hasPermission('sales')
                  ? 'hover:border-blue-200 hover:bg-blue-50/50 cursor-pointer'
                  : 'opacity-40 cursor-not-allowed'
              }`}
            >
              <div className="bg-emerald-100 text-emerald-700 p-2.5 rounded-lg group-hover:scale-105 transition-transform shadow-xs relative">
                <TrendingUp className="w-5 h-5" />
                {!hasPermission('sales') && <Lock className="w-3 h-3 text-red-600 absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-md" />}
              </div>
              <span className="text-[11.5px] font-bold text-slate-700 mt-1">فاتورة بيع</span>
            </button>

            <button
              onClick={() => openWindow('invoice', 'فاتورة شراء', { invoiceType: 'purchase' })}
              disabled={!hasPermission('purchases')}
              className={`flex flex-col items-center justify-center p-1.5 rounded border border-transparent min-w-[70px] group transition-all ${
                hasPermission('purchases')
                  ? 'hover:border-blue-200 hover:bg-blue-50/50 cursor-pointer'
                  : 'opacity-40 cursor-not-allowed'
              }`}
            >
              <div className="bg-indigo-100 text-indigo-700 p-2.5 rounded-lg group-hover:scale-105 transition-transform shadow-xs relative">
                <ShoppingCart className="w-5 h-5" />
                {!hasPermission('purchases') && <Lock className="w-3 h-3 text-red-600 absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-md" />}
              </div>
              <span className="text-[11.5px] font-bold text-slate-700 mt-1">فاتورة شراء</span>
            </button>

            <div className="w-[1px] h-12 bg-slate-200 self-center mx-2" />

            <button
              onClick={() => openWindow('invoice', 'مردود مبيعات', { invoiceType: 'sale_return' })}
              disabled={!hasPermission('sales')}
              className={`flex flex-col items-center justify-center p-1.5 rounded border border-transparent min-w-[70px] group transition-all ${
                hasPermission('sales')
                  ? 'hover:border-blue-200 hover:bg-blue-50/50 cursor-pointer'
                  : 'opacity-40 cursor-not-allowed'
              }`}
            >
              <div className="bg-rose-100 text-rose-700 p-2.5 rounded-lg group-hover:scale-105 transition-transform shadow-xs relative">
                <Percent className="w-5 h-5" />
                {!hasPermission('sales') && <Lock className="w-3 h-3 text-red-600 absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-md" />}
              </div>
              <span className="text-[11.5px] font-bold text-slate-700 mt-1">مرتجع مبيعات</span>
            </button>

            <button
              onClick={() => openWindow('invoice', 'مردود مشتريات', { invoiceType: 'purchase_return' })}
              disabled={!hasPermission('purchases')}
              className={`flex flex-col items-center justify-center p-1.5 rounded border border-transparent min-w-[70px] group transition-all ${
                hasPermission('purchases')
                  ? 'hover:border-blue-200 hover:bg-blue-50/50 cursor-pointer'
                  : 'opacity-40 cursor-not-allowed'
              }`}
            >
              <div className="bg-pink-100 text-pink-700 p-2.5 rounded-lg group-hover:scale-105 transition-transform shadow-xs relative">
                <Percent className="w-5 h-5" />
                {!hasPermission('purchases') && <Lock className="w-3 h-3 text-red-600 absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-md" />}
              </div>
              <span className="text-[11.5px] font-bold text-slate-700 mt-1">مرتجع مشتريات</span>
            </button>
          </div>
        )}

        {/* SYSTEM PANEL */}
        {activeTab === 'system' && (
          <div className="flex gap-1.5 items-center">
            <button
              onClick={() => openWindow('permissions', 'إدارة المستخدمين والصلاحيات التفصيلية')}
              disabled={!hasPermission('user_management')}
              className={`flex flex-col items-center justify-center p-1.5 rounded border border-transparent min-w-[70px] group transition-all ${
                hasPermission('user_management')
                  ? 'hover:border-blue-200 hover:bg-blue-50/50 cursor-pointer'
                  : 'opacity-40 cursor-not-allowed'
              }`}
            >
              <div className="bg-red-100 text-red-700 p-2.5 rounded-lg group-hover:scale-105 transition-transform shadow-xs relative">
                <UserCheck className="w-5 h-5" />
                {!hasPermission('user_management') && <Lock className="w-3 h-3 text-red-600 absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-md" />}
              </div>
              <span className={`text-[11.5px] font-bold mt-1 ${isDark ? 'text-zinc-350' : 'text-slate-700'}`}>إدارة الصلاحيات</span>
            </button>

            <button
              onClick={() => openWindow('currencies', 'العملات وأسعار الصرف')}
              disabled={!hasPermission('accounting')}
              className={`flex flex-col items-center justify-center p-1.5 rounded border border-transparent min-w-[70px] group transition-all ${
                hasPermission('accounting')
                  ? 'hover:border-blue-200 hover:bg-blue-50/50 cursor-pointer'
                  : 'opacity-40 cursor-not-allowed'
              }`}
            >
              <div className="bg-violet-100 text-violet-700 p-2.5 rounded-lg group-hover:scale-105 transition-transform shadow-xs relative">
                <DollarSign className="w-5 h-5" />
                {!hasPermission('accounting') && <Lock className="w-3 h-3 text-red-600 absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-md" />}
              </div>
              <span className={`text-[11.5px] font-bold mt-1 ${isDark ? 'text-zinc-350' : 'text-slate-700'}`}>أسعار الصرف</span>
            </button>

            <button
              onClick={() => openWindow('tools_manager', 'فحص وإصلاح قاعدة البيانات', { initialTab: 'maintenance' })}
              disabled={!hasPermission('settings')}
              className={`flex flex-col items-center justify-center p-1.5 rounded border border-transparent min-w-[70px] group transition-all ${
                hasPermission('settings')
                  ? 'hover:border-blue-200 hover:bg-blue-50/50 cursor-pointer'
                  : 'opacity-40 cursor-not-allowed'
              }`}
            >
              <div className="bg-blue-100 text-blue-700 p-2.5 rounded-lg group-hover:scale-105 transition-transform shadow-xs relative">
                <Settings2 className="w-5 h-5" />
                {!hasPermission('settings') && <Lock className="w-3 h-3 text-red-600 absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-md" />}
              </div>
              <span className={`text-[11.5px] font-bold mt-1 ${isDark ? 'text-zinc-350' : 'text-slate-700'}`}>صيانة الداتا</span>
            </button>

            <div className={`w-[1px] h-12 self-center mx-2 ${isDark ? 'bg-zinc-800' : 'bg-slate-200'}`} />

            {/* Window and Layout arrangement group */}
            <div className={`flex gap-1 border border-dashed rounded-lg p-1 items-center ${
              isDark ? 'border-zinc-800 bg-zinc-950/20' : 'border-slate-300 bg-slate-100/50'
            }`}>
              <button
                onClick={() => {
                  tileWindows('horizontal');
                  showToast('تم ترتيب النوافذ أفقياً', 'success');
                }}
                className={`flex flex-col items-center justify-center p-1 rounded border border-transparent min-w-[65px] group transition-all hover:bg-blue-50/10 cursor-pointer`}
                title="ترتيب النوافذ المفتوحة أفقياً"
              >
                <div className="bg-sky-100 text-sky-700 p-1.5 rounded-lg group-hover:scale-105 transition-transform shadow-xs">
                  <Rows className="w-4 h-4" />
                </div>
                <span className={`text-[10px] font-bold mt-1 ${isDark ? 'text-zinc-350' : 'text-slate-600'}`}>ترتيب أفقي</span>
              </button>

              <button
                onClick={() => {
                  tileWindows('vertical');
                  showToast('تم ترتيب النوافذ عمودياً', 'success');
                }}
                className={`flex flex-col items-center justify-center p-1 rounded border border-transparent min-w-[65px] group transition-all hover:bg-emerald-50/10 cursor-pointer`}
                title="ترتيب النوافذ المفتوحة عمودياً"
              >
                <div className="bg-emerald-100 text-emerald-700 p-1.5 rounded-lg group-hover:scale-105 transition-transform shadow-xs">
                  <Columns className="w-4 h-4" />
                </div>
                <span className={`text-[10px] font-bold mt-1 ${isDark ? 'text-zinc-350' : 'text-slate-600'}`}>ترتيب عمودي</span>
              </button>

              <button
                onClick={() => {
                  tileWindows('cascade');
                  showToast('تم ترتيب النوافذ تراكبياً', 'success');
                }}
                className={`flex flex-col items-center justify-center p-1 rounded border border-transparent min-w-[65px] group transition-all hover:bg-purple-50/10 cursor-pointer`}
                title="ترتيب النوافذ المفتوحة بشكل متتالي متداخل"
              >
                <div className="bg-purple-100 text-purple-700 p-1.5 rounded-lg group-hover:scale-105 transition-transform shadow-xs">
                  <Layers className="w-4 h-4" />
                </div>
                <span className={`text-[10px] font-bold mt-1 ${isDark ? 'text-zinc-350' : 'text-slate-600'}`}>ترتيب متتالي</span>
              </button>

              <div className={`w-[1px] h-8 self-center mx-1 ${isDark ? 'bg-zinc-800' : 'bg-slate-200'}`} />

              <button
                onClick={() => {
                  minimizeAll();
                  showToast('تم تصغير كافة النوافذ', 'info');
                }}
                className={`flex flex-col items-center justify-center p-1 rounded border border-transparent min-w-[55px] group transition-all hover:bg-amber-50/10 cursor-pointer`}
                title="تصغير كافة النوافذ المفتوحة لشريط المهام"
              >
                <div className="bg-amber-100 text-amber-700 p-1.5 rounded-lg group-hover:scale-105 transition-transform shadow-xs">
                  <Minimize className="w-4 h-4" />
                </div>
                <span className={`text-[10px] font-bold mt-1 ${isDark ? 'text-zinc-350' : 'text-slate-600'}`}>تصغير الكل</span>
              </button>

              <button
                onClick={() => {
                  restoreAll();
                  showToast('تم استعادة وعرض كافة النوافذ المفتوحة', 'info');
                }}
                className={`flex flex-col items-center justify-center p-1 rounded border border-transparent min-w-[55px] group transition-all hover:bg-indigo-50/10 cursor-pointer`}
                title="استعادة وعرض كافة النوافذ"
              >
                <div className="bg-indigo-100 text-indigo-700 p-1.5 rounded-lg group-hover:scale-105 transition-transform shadow-xs">
                  <Maximize2 className="w-4 h-4" />
                </div>
                <span className={`text-[10px] font-bold mt-1 ${isDark ? 'text-zinc-350' : 'text-slate-600'}`}>استعادة</span>
              </button>

              <button
                onClick={() => {
                  closeAll();
                  showToast('تم إغلاق كافة النوافذ المفتوحة', 'warning');
                }}
                className={`flex flex-col items-center justify-center p-1 rounded border border-transparent min-w-[55px] group transition-all hover:bg-red-50/10 cursor-pointer`}
                title="إغلاق كافة النوافذ المفتوحة"
              >
                <div className="bg-red-100 text-red-700 p-1.5 rounded-lg group-hover:scale-105 transition-transform shadow-xs">
                  <Trash2 className="w-4 h-4" />
                </div>
                <span className={`text-[10px] font-bold mt-1 ${isDark ? 'text-zinc-350' : 'text-slate-600'}`}>إغلاق الكل</span>
              </button>
            </div>
          </div>
        )}

        {/* ADVANCED ERP PANEL */}
        {activeTab === 'advanced' && (
          <div className="flex gap-1.5 items-center">
            {/* Group 1: Apps */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => openWindow('android_hub', 'تطبيق الأندرويد المحمول - الميزان Go')}
                className={`flex flex-col items-center justify-center p-1.5 rounded border border-transparent min-w-[70px] group transition-all hover:border-emerald-200 hover:bg-emerald-50/50 cursor-pointer`}
              >
                <div className="bg-emerald-100 text-emerald-700 p-2.5 rounded-lg group-hover:scale-105 transition-transform shadow-xs">
                  <Smartphone className="w-5 h-5" />
                </div>
                <span className={`text-[11.5px] font-bold mt-1 ${isDark ? 'text-zinc-350' : 'text-slate-700'}`}>أندرويد Go</span>
              </button>

              <button
                onClick={() => openWindow('windows_hub', 'تطبيق الويندوز المكتبي المستقل')}
                className={`flex flex-col items-center justify-center p-1.5 rounded border border-transparent min-w-[70px] group transition-all hover:border-blue-200 hover:bg-blue-50/50 cursor-pointer`}
              >
                <div className="bg-blue-100 text-blue-700 p-2.5 rounded-lg group-hover:scale-105 transition-transform shadow-xs">
                  <Monitor className="w-5 h-5" />
                </div>
                <span className={`text-[11.5px] font-bold mt-1 ${isDark ? 'text-zinc-350' : 'text-slate-700'}`}>مشغل ويندوز</span>
              </button>
            </div>

            <div className={`w-[1px] h-12 self-center mx-1 ${isDark ? 'bg-zinc-800' : 'bg-slate-200'}`} />

            {/* Group 2: Barcodes */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => openWindow('barcode_hub', 'مصمم ملصقات الباركود والـ QR')}
                className={`flex flex-col items-center justify-center p-1.5 rounded border border-transparent min-w-[70px] group transition-all hover:border-amber-200 hover:bg-amber-50/50 cursor-pointer`}
              >
                <div className="bg-amber-100 text-amber-700 p-2.5 rounded-lg group-hover:scale-105 transition-transform shadow-xs">
                  <QrCode className="w-5 h-5" />
                </div>
                <span className={`text-[11.5px] font-bold mt-1 ${isDark ? 'text-zinc-350' : 'text-slate-700'}`}>ملصقات باركود</span>
              </button>
            </div>

            <div className={`w-[1px] h-12 self-center mx-1 ${isDark ? 'bg-zinc-800' : 'bg-slate-200'}`} />

            {/* Group 3: Workflows */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => openWindow('notification_hub', 'بوابة الإشعارات والرسائل المتعددة')}
                className={`flex flex-col items-center justify-center p-1.5 rounded border border-transparent min-w-[70px] group transition-all hover:border-rose-200 hover:bg-rose-50/50 cursor-pointer`}
              >
                <div className="bg-rose-100 text-rose-700 p-2.5 rounded-lg group-hover:scale-105 transition-transform shadow-xs">
                  <BellRing className="w-5 h-5" />
                </div>
                <span className={`text-[11.5px] font-bold mt-1 ${isDark ? 'text-zinc-350' : 'text-slate-700'}`}>بوابة الإشعارات</span>
              </button>

              <button
                onClick={() => openWindow('workflow_hub', 'نظام مسار الموافقات والاعتمادات')}
                className={`flex flex-col items-center justify-center p-1.5 rounded border border-transparent min-w-[70px] group transition-all hover:border-purple-200 hover:bg-purple-50/50 cursor-pointer`}
              >
                <div className="bg-purple-100 text-purple-700 p-2.5 rounded-lg group-hover:scale-105 transition-transform shadow-xs">
                  <GitFork className="w-5 h-5 rotate-180" />
                </div>
                <span className={`text-[11.5px] font-bold mt-1 ${isDark ? 'text-zinc-350' : 'text-slate-700'}`}>مسار الموافقات</span>
              </button>
            </div>

            <div className={`w-[1px] h-12 self-center mx-1 ${isDark ? 'bg-zinc-800' : 'bg-slate-200'}`} />

            {/* Group 4: Integrations */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => openWindow('api_hub', 'بوابة المطورين والربط البرمجي REST API')}
                className={`flex flex-col items-center justify-center p-1.5 rounded border border-transparent min-w-[70px] group transition-all hover:border-indigo-200 hover:bg-indigo-50/50 cursor-pointer`}
              >
                <div className="bg-indigo-100 text-indigo-700 p-2.5 rounded-lg group-hover:scale-105 transition-transform shadow-xs">
                  <Cpu className="w-5 h-5" />
                </div>
                <span className={`text-[11.5px] font-bold mt-1 ${isDark ? 'text-zinc-350' : 'text-slate-700'}`}>بوابة REST API</span>
              </button>

              <button
                onClick={() => openWindow('performance_hub', 'لوحة قياس الأداء وضغط الاستعلامات')}
                className={`flex flex-col items-center justify-center p-1.5 rounded border border-transparent min-w-[70px] group transition-all hover:border-emerald-200 hover:bg-emerald-50/50 cursor-pointer`}
              >
                <div className="bg-emerald-100 text-emerald-700 p-2.5 rounded-lg group-hover:scale-105 transition-transform shadow-xs">
                  <Gauge className="w-5 h-5" />
                </div>
                <span className={`text-[11.5px] font-bold mt-1 ${isDark ? 'text-zinc-350' : 'text-slate-700'}`}>مراقب الأداء</span>
              </button>

              <button
                onClick={() => openWindow('enterprise_hub', 'نظام الشركات الكبرى ومميزات المؤسسات (ERP Enterprise)')}
                className={`flex flex-col items-center justify-center p-1.5 rounded border border-purple-200 bg-purple-50/50 min-w-[75px] group transition-all hover:border-purple-300 hover:bg-purple-100/50 cursor-pointer`}
              >
                <div className="bg-purple-100 text-purple-700 p-2.5 rounded-lg group-hover:scale-105 transition-transform shadow-xs">
                  <Building className="w-5 h-5" />
                </div>
                <span className={`text-[11.5px] font-bold mt-1 ${isDark ? 'text-zinc-350' : 'text-purple-700'}`}>الشركات الكبرى</span>
              </button>

              <button
                onClick={() => openWindow('roadmap_window', 'التطوير المستمر وخارطة الطريق المستقبلية (Stage 11)')}
                className={`flex flex-col items-center justify-center p-1.5 rounded border border-blue-200 bg-blue-50/50 min-w-[75px] group transition-all hover:border-blue-300 hover:bg-blue-100/50 cursor-pointer`}
              >
                <div className="bg-blue-100 text-blue-700 p-2.5 rounded-lg group-hover:scale-105 transition-transform shadow-xs">
                  <Milestone className="w-5 h-5 text-blue-600 animate-pulse" />
                </div>
                <span className={`text-[11.5px] font-bold mt-1 ${isDark ? 'text-zinc-350' : 'text-blue-700'}`}>خارطة الطريق</span>
              </button>

              <button
                onClick={() => openWindow('global_expansion', 'التميز المؤسسي والتوسع العالمي (Stage 12)')}
                className={`flex flex-col items-center justify-center p-1.5 rounded border border-indigo-200 bg-indigo-50/50 min-w-[75px] group transition-all hover:border-indigo-300 hover:bg-indigo-100/50 cursor-pointer`}
              >
                <div className="bg-indigo-100 text-indigo-700 p-2.5 rounded-lg group-hover:scale-105 transition-transform shadow-xs">
                  <Globe className="w-5 h-5 text-indigo-600 animate-spin" style={{ animationDuration: '8s' }} />
                </div>
                <span className={`text-[11.5px] font-bold mt-1 ${isDark ? 'text-zinc-350' : 'text-indigo-700'}`}>التوسع العالمي</span>
              </button>

              <button
                onClick={() => openWindow('innovation_hub', 'الابتكار والتفوق التنافسي (Stage 13)')}
                className={`flex flex-col items-center justify-center p-1.5 rounded border border-purple-200 bg-purple-50/50 min-w-[75px] group transition-all hover:border-purple-300 hover:bg-purple-100/50 cursor-pointer`}
              >
                <div className="bg-purple-100 text-purple-700 p-2.5 rounded-lg group-hover:scale-105 transition-transform shadow-xs">
                  <Sparkles className="w-5 h-5 text-purple-600 animate-pulse" />
                </div>
                <span className={`text-[11.5px] font-bold mt-1 ${isDark ? 'text-zinc-350' : 'text-purple-700'}`}>التفوق التنافسي</span>
              </button>

              <button
                onClick={() => openWindow('world_class_platform', 'منصة ERP عالمية وتخصيص كامل (Stage 15)')}
                className={`flex flex-col items-center justify-center p-1.5 rounded border border-rose-200 bg-rose-50/50 min-w-[75px] group transition-all hover:border-rose-300 hover:bg-rose-100/50 cursor-pointer`}
              >
                <div className="bg-rose-100 text-rose-700 p-2.5 rounded-lg group-hover:scale-105 transition-transform shadow-xs">
                  <Cpu className="w-5 h-5 text-rose-600 animate-bounce" style={{ animationDuration: '4s' }} />
                </div>
                <span className={`text-[11.5px] font-bold mt-1 ${isDark ? 'text-zinc-350' : 'text-rose-700'}`}>المنصة العالمية</span>
              </button>
            </div>
          </div>
        )}

        {/* PERSISTENT AI ASSISTANT QUICK LAUNCHER */}
        <div className="flex items-center gap-1.5 border-r pr-3 border-slate-300 mr-auto">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('toggle-ai-assistant'))}
            className="flex flex-col items-center justify-center p-1.5 rounded border border-purple-200 bg-purple-50 hover:bg-purple-100 hover:border-purple-300 transition-all min-w-[70px] group cursor-pointer shadow-xs animate-pulse"
          >
            <div className="bg-gradient-to-tr from-purple-700 to-indigo-600 text-white p-2 rounded-lg group-hover:scale-105 transition-transform shadow-md relative">
              <Sparkles className="w-4 h-4 text-yellow-300 fill-yellow-300" />
            </div>
            <span className="text-[11px] font-extrabold text-purple-800 mt-1">المساعد الذكي</span>
          </button>
        </div>
      </div>
    </div>
  );
};

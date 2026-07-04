import React from 'react';
import { useErp } from '../context/ErpContext';
import { THEMES } from '../utils/theme';
import { 
  AppWindow, X, Grid, Columns, Layers, MinusSquare, PlusSquare, Trash2,
  FileText, Receipt, BookOpen, Package, Users, Settings2, BarChart3, Calculator
} from 'lucide-react';

export const ActiveTabBar: React.FC = () => {
  const { 
    windows, 
    focusWindow, 
    closeWindow, 
    tileWindows, 
    minimizeAll, 
    restoreAll, 
    closeAll,
    theme,
    customColor,
    language
  } = useErp();

  // Find the active window (highest zIndex and not minimized)
  const activeWindowId = React.useMemo(() => {
    const activeWins = windows.filter(w => !w.isMinimized);
    if (activeWins.length === 0) return null;
    return activeWins.reduce((maxWin, w) => w.zIndex > maxWin.zIndex ? w : maxWin, activeWins[0]).id;
  }, [windows]);

  if (windows.length === 0) {
    return (
      <div className={`h-11 px-4 border-t flex items-center justify-between text-xs select-none transition-all duration-300 ${
        theme === 'dark' ? 'bg-zinc-900 border-zinc-800 text-zinc-500' :
        theme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-400' :
        'bg-slate-100 border-slate-300 text-slate-500'
      }`}>
        <div className="flex items-center gap-2 font-bold">
          <AppWindow className="w-3.5 h-3.5 animate-pulse" />
          <span>لا توجد نوافذ عمل نشطة حالياً. قم بفتح الشاشات من شريط القوائم العلوي.</span>
        </div>
        <div className="text-[10px] opacity-75 font-mono">
          Mizan MDI Workspace v12.0
        </div>
      </div>
    );
  }

  // Helper to resolve window icons dynamically for a professional touch
  const getWindowIcon = (type: string) => {
    switch (type) {
      case 'invoice':
      case 'sale_invoice':
      case 'purchase_invoice':
      case 'sale_return':
      case 'purchase_return':
        return <Receipt className="w-3.5 h-3.5" />;
      case 'chart_of_accounts':
      case 'account_card':
        return <BookOpen className="w-3.5 h-3.5" />;
      case 'item_tree':
      case 'item_card':
        return <Package className="w-3.5 h-3.5" />;
      case 'customers':
      case 'suppliers':
      case 'hr_employees':
      case 'permissions':
        return <Users className="w-3.5 h-3.5" />;
      case 'tools_manager':
        return <Settings2 className="w-3.5 h-3.5" />;
      case 'reports':
      case 'general_ledger':
      case 'trial_balance':
      case 'inventory_list':
        return <BarChart3 className="w-3.5 h-3.5" />;
      case 'calculator':
        return <Calculator className="w-3.5 h-3.5" />;
      default:
        return <FileText className="w-3.5 h-3.5" />;
    }
  };

  // Determine styles depending on the theme
  const barBgClass = 
    theme === 'dark' || theme === 'light-black' ? 'bg-zinc-900 border-zinc-800 text-slate-300' :
    theme === 'light' ? 'bg-slate-100 border-slate-300 text-slate-700' :
    theme === 'blue' ? 'bg-blue-900/95 border-blue-950 text-white' :
    theme === 'green' ? 'bg-emerald-950 border-emerald-900 text-white' :
    theme === 'gray' ? 'bg-slate-800 border-slate-900 text-slate-200' : 'bg-slate-100 border-slate-300 text-slate-700';

  const customBarStyle = theme === 'custom' 
    ? { backgroundColor: `${customColor}f0`, borderTopColor: `${customColor}dd`, color: '#ffffff' } 
    : {};

  return (
    <div 
      className={`h-11 px-3 border-t flex items-center justify-between gap-4 select-none transition-all duration-300 shrink-0 shadow-lg ${barBgClass}`}
      style={customBarStyle}
      dir="rtl"
    >
      {/* Scrollable list of open tabs */}
      <div className="flex-1 flex items-center gap-1.5 overflow-x-auto h-full scrollbar-none py-1 pr-1">
        <span className="text-[11px] font-black opacity-60 shrink-0 ml-1.5">النوافذ المفتوحة:</span>
        {windows.map((win) => {
          const isActive = win.id === activeWindowId;
          const isMinimized = win.isMinimized;

          // Style tabs dynamically based on theme and focus
          let tabClass = 'border transition-all flex items-center gap-2 px-2.5 py-1 rounded-md text-[11.5px] font-extrabold cursor-pointer max-w-[150px] ';
          if (isActive) {
            if (theme === 'dark' || theme === 'light-black') {
              tabClass += 'bg-zinc-800 border-zinc-700 text-amber-400 shadow-[0_2px_8px_rgba(0,0,0,0.5)]';
            } else if (theme === 'light') {
              tabClass += 'bg-white border-blue-500 text-blue-700 shadow-[0_2px_6px_rgba(37,99,235,0.15)]';
            } else if (theme === 'blue') {
              tabClass += 'bg-blue-600 border-blue-400 text-white shadow-md';
            } else if (theme === 'green') {
              tabClass += 'bg-emerald-600 border-emerald-400 text-white shadow-md';
            } else if (theme === 'gray') {
              tabClass += 'bg-slate-600 border-slate-400 text-white shadow-md';
            } else if (theme === 'custom') {
              tabClass += 'bg-white text-slate-900 border-transparent shadow-md';
            } else {
              tabClass += 'bg-white border-blue-600 text-blue-600 shadow-sm';
            }
          } else {
            if (theme === 'dark' || theme === 'light-black') {
              tabClass += isMinimized 
                ? 'bg-zinc-950/40 border-zinc-900 text-zinc-600 hover:text-zinc-400' 
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white';
            } else if (theme === 'light') {
              tabClass += isMinimized
                ? 'bg-slate-200/50 border-slate-300 text-slate-400 hover:text-slate-600'
                : 'bg-slate-200/80 border-slate-300 text-slate-600 hover:bg-white hover:text-slate-800';
            } else if (theme === 'blue' || theme === 'green' || theme === 'gray') {
              tabClass += isMinimized
                ? 'bg-white/10 border-white/5 text-white/40 hover:text-white/70'
                : 'bg-white/20 border-white/10 text-white/80 hover:bg-white/30 hover:text-white';
            } else if (theme === 'custom') {
              tabClass += isMinimized
                ? 'bg-black/10 border-transparent text-white/50 hover:text-white'
                : 'bg-black/20 border-transparent text-white/90 hover:bg-black/30';
            } else {
              tabClass += isMinimized
                ? 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600'
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-white hover:text-slate-800';
            }
          }

          return (
            <div 
              key={win.id}
              onClick={() => focusWindow(win.id)}
              className={tabClass}
              title={win.title}
            >
              <span className={isActive ? 'text-amber-400' : 'opacity-70'}>
                {getWindowIcon(win.type)}
              </span>
              <span className="truncate max-w-[100px] select-none">{win.title}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  closeWindow(win.id);
                }}
                className="p-0.5 rounded-full hover:bg-black/15 transition-colors cursor-pointer"
                title="إغلاق النافذة"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Formatting & Layout Controls on the left */}
      <div className="flex items-center gap-1.5 border-r pr-3 border-slate-300/30 shrink-0">
        <span className="text-[10px] font-black opacity-50 ml-1">تنسيق النوافذ:</span>
        
        {/* Tile Horizontal */}
        <button
          onClick={() => tileWindows('horizontal')}
          className="p-1.5 rounded hover:bg-black/10 transition-colors cursor-pointer text-slate-400 hover:text-current"
          title="ترتيب أفقي (شبكي)"
        >
          <Grid className="w-3.5 h-3.5 text-blue-400" />
        </button>

        {/* Tile Vertical */}
        <button
          onClick={() => tileWindows('vertical')}
          className="p-1.5 rounded hover:bg-black/10 transition-colors cursor-pointer text-slate-400 hover:text-current"
          title="ترتيب عمودي"
        >
          <Columns className="w-3.5 h-3.5 text-emerald-400" />
        </button>

        {/* Cascade */}
        <button
          onClick={() => tileWindows('cascade')}
          className="p-1.5 rounded hover:bg-black/10 transition-colors cursor-pointer text-slate-400 hover:text-current"
          title="ترتيب متتالي (تتالي النوافذ)"
        >
          <Layers className="w-3.5 h-3.5 text-violet-400" />
        </button>

        <div className="w-[1px] h-4 bg-slate-300/20 mx-0.5" />

        {/* Restore All */}
        <button
          onClick={restoreAll}
          className="p-1.5 rounded hover:bg-black/10 transition-colors cursor-pointer text-slate-400 hover:text-current"
          title="استعادة كافة النوافذ المصغرة"
        >
          <PlusSquare className="w-3.5 h-3.5 text-sky-400" />
        </button>

        {/* Minimize All */}
        <button
          onClick={minimizeAll}
          className="p-1.5 rounded hover:bg-black/10 transition-colors cursor-pointer text-slate-400 hover:text-current"
          title="تصغير كافة النوافذ للأسفل"
        >
          <MinusSquare className="w-3.5 h-3.5 text-amber-400" />
        </button>

        {/* Close All */}
        <button
          onClick={closeAll}
          className="p-1.5 rounded hover:bg-red-500/15 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
          title="إغلاق كافة النوافذ المفتوحة دفعة واحدة"
        >
          <Trash2 className="w-3.5 h-3.5 text-red-400 hover:text-red-500" />
        </button>
      </div>
    </div>
  );
};

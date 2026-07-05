import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { 
  GitFork, CheckCircle, Clock, AlertTriangle, Play,
  Settings, UserCheck, ShieldAlert, Sparkles, RefreshCw
} from 'lucide-react';

interface WorkflowHubWindowProps {
  windowId: string;
  onClose: () => void;
}

export const WorkflowHubWindow: React.FC<WorkflowHubWindowProps> = ({ windowId, onClose }) => {
  const { theme, showToast, invoices } = useErp();

  // Active Pending approvals to process
  const [pendings, setPendings] = useState([
    { id: 'app-1', type: 'فاتورة شراء قيمية', refNo: 'PUR-810', customer: 'شركة التوريدات الوطنية', amount: 48500, currentStage: 'التحقيق المالي', status: 'pending', logs: ['تم الإنشاء بواسطة: Ahmed', 'مرت بمراجعة أمين المستودع للكميات'] },
    { id: 'app-2', type: 'سند صرف مصروفات', refNo: 'PAY-110', customer: 'حساب مصروف صيانة الفروع', amount: 15200, currentStage: 'اعتماد مدير الحسابات', status: 'pending', logs: ['تم الإنشاء بواسطة: Khalid', 'المرفقات سليمة ومطابقة للفاتورة الضريبية'] },
    { id: 'app-3', type: 'فاتورة مبيعات ذمة عالية', refNo: 'INV-1099', customer: 'مؤسسة الرياض اللوجستية', amount: 89000, currentStage: 'موافقة إدارة الائتمان والمخاطر', status: 'pending', logs: ['تم الإنشاء بواسطة: Ahmed', 'تجاوز العميل السقف الائتماني المحدد بـ 50ألف'] }
  ]);

  // Current selected pipeline
  const [pipelineType, setPipelineType] = useState<'purchase' | 'journal'>('purchase');

  const [activeWorkflowStages, setActiveWorkflowStages] = useState([
    { id: 'stg-1', name: 'المدخل (المحاسب)', desc: 'إنشاء الفاتورة وتدقيق المرفقات', role: 'محاسب فروع' },
    { id: 'stg-2', name: 'مدير المشتريات / المخازن', desc: 'مطابقة التوريد وتأكيد جودة السلع المورّدة', role: 'مدير مستودع' },
    { id: 'stg-3', name: 'المراجعة المالية (المدقق)', desc: 'فحص توجيه الحسابات ومراكز التكلفة الصحيحة', role: 'مراقب مالي' },
    { id: 'stg-4', name: 'الاعتماد النهائي والتثبيت', desc: 'الموافقة النهائية وترحيل القيد للدفاتر الختامية', role: 'المدير المالي CFO' }
  ]);

  const handleApproveTransaction = (id: string) => {
    const trx = pendings.find(p => p.id === id);
    if (!trx) return;

    showToast(`تمت الموافقة والاعتماد للمرحلة الحالية لـ [${trx.refNo}] بنجاح!`, 'success');
    
    setPendings(prev => prev.map(p => {
      if (p.id === id) {
        if (p.currentStage === 'التحقيق المالي') {
          return { ...p, currentStage: 'الموافقة النهائية للـ CFO', logs: [...p.logs, 'تم اعتماده مالياً بواسطة Ahmed Ahmed'] };
        } else if (p.currentStage === 'اعتماد مدير الحسابات') {
          return { ...p, currentStage: 'تثبيت وترحيل الفاتورة للدفاتر الختامية', status: 'approved' };
        } else {
          return { ...p, status: 'approved', logs: [...p.logs, 'تم اعتماد المخاطر والائتمان النهائي'] };
        }
      }
      return p;
    }).filter(p => p.status === 'pending')); // Remove approved from active lists
  };

  const handleRejectTransaction = (id: string, reason: string) => {
    setPendings(prev => prev.filter(p => p.id !== id));
    showToast(`تم رفض وإرجاع المعاملة للمحاسب للتعديل. السبب: ${reason}`, 'warning');
  };

  const isDark = theme === 'dark' || theme === 'light-black';

  return (
    <div className={`flex h-full p-4 select-none overflow-hidden transition-colors duration-300 ${isDark ? 'bg-zinc-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`} dir="rtl">
      
      {/* LEFT: WORKFLOW STAGES DESIGNER */}
      <div className={`w-[320px] border-l p-4 shrink-0 flex flex-col justify-between overflow-y-auto ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-sm rounded-lg'}`}>
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b pb-2">
            <GitFork className="w-5 h-5 text-purple-600 rotate-180" />
            <h3 className="text-xs font-extrabold text-slate-800">هيكلة ومسار الموافقات المعتمد</h3>
          </div>

          <div className="space-y-2 text-[11px]">
            <label className="font-extrabold text-slate-600 block">اختر نوع وتدفق المستند:</label>
            <select 
              value={pipelineType} 
              onChange={(e) => {
                setPipelineType(e.target.value as any);
                if (e.target.value === 'journal') {
                  setActiveWorkflowStages([
                    { id: 'stg-1', name: 'منشئ السند (المحاسب)', desc: 'إنشاء قيد اليومية الأولي', role: 'محاسب' },
                    { id: 'stg-2', name: 'مدقق القيود اليومية', desc: 'مراجعة توازن القيد وتوجيهه', role: 'رئيس حسابات' },
                    { id: 'stg-3', name: 'الترحيل النهائي للعام المالي', desc: 'اعتماد الترحيل النهائي وإقفال الفترة', role: 'مدير مالي' }
                  ]);
                } else {
                  setActiveWorkflowStages([
                    { id: 'stg-1', name: 'المدخل (المحاسب)', desc: 'إنشاء الفاتورة وتدقيق المرفقات', role: 'محاسب فروع' },
                    { id: 'stg-2', name: 'مدير المشتريات / المخازن', desc: 'مطابقة التوريد وتأكيد جودة السلع المورّدة', role: 'مدير مستودع' },
                    { id: 'stg-3', name: 'المراجعة المالية (المدقق)', desc: 'فحص توجيه الحسابات ومراكز التكلفة الصحيحة', role: 'مراقب مالي' },
                    { id: 'stg-4', name: 'الاعتماد النهائي والتثبيت', desc: 'الموافقة النهائية وترحيل القيد للدفاتر الختامية', role: 'المدير المالي CFO' }
                  ]);
                }
              }}
              className="w-full p-1.5 bg-white border border-slate-300 rounded text-[11px]"
            >
              <option value="purchase">مسار فواتير الشراء والتوريد العالي</option>
              <option value="journal">مسار سندات الصرف والقيود المالية الكبرى</option>
            </select>
          </div>

          {/* Render workflow stages visually (staggered) */}
          <div className="space-y-3 relative border-r-2 border-dashed border-purple-300 pr-4 mr-2">
            {activeWorkflowStages.map((stg, idx) => (
              <div key={stg.id} className="relative group text-[10.5px]">
                {/* Active node bullet indicator */}
                <span className="absolute -right-[23.5px] top-1 bg-purple-600 text-white w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold text-[9px] border-2 border-white shadow-xs">
                  {idx + 1}
                </span>

                <div className="bg-slate-50 border p-2 rounded-lg space-y-1">
                  <div className="font-extrabold text-slate-800 flex justify-between items-center">
                    <span>{stg.name}</span>
                    <span className="text-[8px] bg-purple-100 text-purple-700 px-1 rounded font-bold">{stg.role}</span>
                  </div>
                  <p className="text-[9.5px] text-slate-500 leading-normal">{stg.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-[10px] text-slate-400 text-center font-bold">
          نظام الاعتمادات والرقابة الداخلية • الميزان دوت نت
        </div>
      </div>

      {/* RIGHT: PENDING TRANSACTIONS PROCESSING BOARD */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        
        {/* Top overview metrics */}
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-sm'} space-y-3`}>
          <span className="text-[12px] font-black text-slate-750 flex items-center gap-2">
            <UserCheck className="w-4.5 h-4.5 text-purple-600" />
            <span>لوحة المراقبة والمعاملات المالية المعلقة بالاعتمادات (Awaiting Approval)</span>
          </span>
          <p className="text-[11px] text-slate-500">مراجعة المعاملات المرفوعة من الفروع والمستودعات والتأكد من مطابقتها للمعايير قبل ترحيلها للدفاتر بشكل دائم.</p>
        </div>

        {/* Pending approvals list */}
        <div className="space-y-3">
          <div className="text-[11.5px] font-extrabold text-slate-600 border-b pb-1">المعاملات بانتظار توقيعك واعتمادك اليوم:</div>
          
          {pendings.length === 0 ? (
            <div className="text-center bg-white border border-slate-200 rounded-xl p-12 text-slate-400 font-bold text-[11px] space-y-2">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
              <p>رائع! لقد تم اعتماد وتصفية كافة المعاملات المعلقة في صندوق بريدك الوارد.</p>
            </div>
          ) : (
            pendings.map(trx => (
              <div key={trx.id} className="p-3.5 bg-white border border-slate-200 rounded-xl hover:shadow-md transition-all space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-black">{trx.type}</span>
                    <h4 className="text-[12px] font-extrabold text-slate-900 mt-1">{trx.refNo} — {trx.customer}</h4>
                  </div>
                  <div className="text-left">
                    <span className="text-[14px] font-mono font-black text-slate-900 leading-none block">{trx.amount.toLocaleString()} ر.س</span>
                    <span className="text-[9px] text-amber-600 font-bold flex items-center gap-1 mt-1 justify-end">
                      <Clock className="w-3 h-3 animate-spin" />
                      <span>المرحلة: {trx.currentStage}</span>
                    </span>
                  </div>
                </div>

                {/* Audit history log inside trx card */}
                <div className="bg-slate-50 p-2.5 rounded border border-slate-100 text-[10px] space-y-1 text-slate-500 font-medium">
                  <div className="font-bold text-slate-700">سجل الإجراءات السابقة بالمعاملة:</div>
                  {trx.logs.map((log, lidx) => (
                    <div key={lidx} className="flex items-center gap-1.5">
                      <span>•</span>
                      <span>{log}</span>
                    </div>
                  ))}
                </div>

                {/* Approve/Reject Controls */}
                <div className="flex gap-2 justify-end pt-1 border-t border-slate-100">
                  <button 
                    onClick={() => handleRejectTransaction(trx.id, 'يرجى مراجعة مرفقات الفاتورة الضريبية')}
                    className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold text-[10.5px] rounded transition-all cursor-pointer"
                  >
                    رفض وإرجاع (Reject)
                  </button>

                  <button 
                    onClick={() => handleApproveTransaction(trx.id)}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10.5px] rounded transition-all shadow-sm hover:shadow active:scale-[0.98] cursor-pointer"
                  >
                    اعتماد وتوقيع (Approve ✓)
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

    </div>
  );
};

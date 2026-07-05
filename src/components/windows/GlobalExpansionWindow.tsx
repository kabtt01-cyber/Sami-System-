import React, { useState, useEffect } from 'react';
import { useErp } from '../../context/ErpContext';
import { 
  Globe, Server, HardDrive, ShieldCheck, Cpu, Play, CheckCircle2, 
  Terminal, Code2, Database, Layers, Cloud, Settings, Compass, 
  RefreshCw, Check, BookOpen, AlertTriangle, FileText, Zap, 
  TrendingUp, Users, Eye, History, FileSpreadsheet, Lock
} from 'lucide-react';

interface GlobalExpansionWindowProps {
  windowId: string;
  onClose: () => void;
}

export const GlobalExpansionWindow: React.FC<GlobalExpansionWindowProps> = ({ windowId, onClose }) => {
  const { theme, showToast, isOnline, currentUser } = useErp();
  const isDark = theme === 'dark' || theme === 'light-black';

  const [activeTab, setActiveTab] = useState<'monitoring' | 'dr' | 'devops' | 'architecture' | 'docs' | 'acceptance'>('monitoring');

  // ==========================================
  // 12.1 & 12.2 Telemetry / Scalability Sim
  // ==========================================
  const [telemetry, setTelemetry] = useState({
    cpu: 24,
    ram: 3.2, // GB
    activeUsers: 14850,
    dbLatency: 1.8, // ms
    apiLatency: 12, // ms
    requestsPerSec: 4200,
    dailyTransactions: 4890012,
    clusterNodes: 12,
    healthStatus: 'Excellent',
    lastBackup: 'منذ دقيقة واحدة',
  });

  const [isSimulatingLoad, setIsSimulatingLoad] = useState(false);

  const triggerHighLoadSim = () => {
    setIsSimulatingLoad(true);
    showToast('جاري محاكاة ضغط تشغيل عالمي: 50,000 مستخدم متزامن يجرون فواتير ومزامنة قيود...', 'info');
    
    // Step-by-step telemetry spike
    setTimeout(() => {
      setTelemetry(prev => ({
        ...prev,
        cpu: 82,
        ram: 8.4,
        activeUsers: 54200,
        dbLatency: 8.5,
        apiLatency: 45,
        requestsPerSec: 18400,
        healthStatus: 'High Load (Auto-Scaling Active)',
      }));
    }, 1000);

    setTimeout(() => {
      // Auto-scaling mitigates the issue
      setTelemetry(prev => ({
        ...prev,
        cpu: 38,
        ram: 12.1, // more nodes allocated
        activeUsers: 54200,
        dbLatency: 2.1, // back to normal due to partition routing
        apiLatency: 15,
        requestsPerSec: 18400,
        clusterNodes: 24, // scaled from 12 to 24
        healthStatus: 'Optimal (Scaled Successfully)',
      }));
      showToast('تم إطلاق حاويات إضافية بالخادم سحابياً تلقائياً! تراجع ضغط المعالجة وعادت الاستجابة تحت 2ms.', 'success');
      setIsSimulatingLoad(false);
    }, 3000);
  };

  // ==========================================
  // 12.3 Disaster Recovery (DR) State & Logic
  // ==========================================
  const [drStatus, setDrStatus] = useState({
    lastTestDate: '2026-07-01 10:00',
    recoveryPointObjective: '10 ثواني (RPO)',
    recoveryTimeObjective: '3 دقائق (RTO)',
    replications: [
      { name: 'الخادم الرئيسي (الرياض AWS)', type: 'Active Primary', lag: '0ms', status: 'Online' },
      { name: 'خادم الطوارئ المتزامن (دبي AWS)', type: 'Hot Standby', lag: '2ms', status: 'Online' },
      { name: 'خادم الأرشفة الباردة (أوروبا GCP)', type: 'Cold Replica', lag: '10 mins', status: 'Online' }
    ]
  });

  const [isDrTesting, setIsDrTesting] = useState(false);
  const [drLogs, setDrLogs] = useState<string[]>([
    'خطة الطوارئ DR جاهزة للتشغيل عند الحاجة.',
    'جميع قواعد البيانات والملفات في حالة مزامنة ممتازة.'
  ]);

  const handleRunDrTest = () => {
    setIsDrTesting(true);
    setDrLogs([]);
    const logEvents = [
      'بدء فحص محاكاة فشل الخادم الرئيسي (Simulating Primary Node Outage)...',
      'قطع اتصال خادم الرياض الرئيسي بنجاح.',
      'تحويل مسارات الـ DNS تلقائياً نحو خادم دبي الاحتياطي (Hot Standby DNS Switch).',
      'التحقق من صحة ترخيص المستخدمين والأرصدة المستعادة...',
      'نجاح استرداد 100% من الجداول والعلاقات الفورية بدون أي فقد للبيانات!',
      'تحديث حالة النظام: التشغيل من خادم الطوارئ في زمن قدره 2.4 ثانية (RTO نجاح كامل).'
    ];

    logEvents.forEach((evt, idx) => {
      setTimeout(() => {
        setDrLogs(prev => [...prev, evt]);
        if (idx === logEvents.length - 1) {
          setIsDrTesting(false);
          setDrStatus(prev => ({ ...prev, lastTestDate: 'الآن (ناجح)' }));
          showToast('اكتمل اختبار خطة الطوارئ والتعافي من الكوارث بنجاح تام وبدون أي انخفاض في أداء النظام!', 'success');
        }
      }, (idx + 1) * 600);
    });
  };

  // ==========================================
  // 12.5 DevOps Pipelines
  // ==========================================
  const [devOpsPipelines] = useState([
    { name: 'بناء وحزم الكود البرمجي (Lint & Compile)', trigger: 'Push to main', duration: '45s', status: 'Success', testsPassed: '1480 / 1480 Tests Passed' },
    { name: 'فحص الحماية والثغرات (Security Audit Core)', trigger: 'Daily Nightly', duration: '2m 15s', status: 'Success', testsPassed: 'Zero Vulnerabilities' },
    { name: 'النشر التلقائي للبيئة السحابية (Prod Run Deploy)', trigger: 'Release Tag v1.0.0', duration: '1m 30s', status: 'Success', testsPassed: 'Zero Downtime Active' },
  ]);

  // ==========================================
  // 12.6 Interactive Documentation Center Tabs
  // ==========================================
  const [docTab, setDocTab] = useState<'api' | 'db' | 'install' | 'integration'>('api');

  return (
    <div className="flex h-full bg-slate-50 text-slate-800 select-none overflow-hidden" dir="rtl">
      
      {/* Side Tab Navigation */}
      <div className={`w-[210px] shrink-0 border-l flex flex-col justify-between py-4 ${isDark ? 'bg-zinc-900 border-zinc-800 text-slate-100' : 'bg-slate-100 border-slate-300'}`}>
        <div className="space-y-1 px-2.5">
          <div className="text-[10px] font-black text-slate-400 px-3 pb-2.5 tracking-wider">نظام التوسع العالمي والأداء المطلق</div>
          
          <button
            onClick={() => setActiveTab('monitoring')}
            className={`w-full text-right px-3 py-2 rounded text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'monitoring' 
                ? 'bg-gradient-to-r from-blue-700 to-indigo-600 text-white shadow-md' 
                : 'hover:bg-slate-200 text-slate-600'
            }`}
          >
            <Server className="w-4 h-4 shrink-0" />
            <span>لوحة المراقبة السحابية</span>
          </button>

          <button
            onClick={() => setActiveTab('dr')}
            className={`w-full text-right px-3 py-2 rounded text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'dr' 
                ? 'bg-gradient-to-r from-blue-700 to-indigo-600 text-white shadow-md' 
                : 'hover:bg-slate-200 text-slate-600'
            }`}
          >
            <HardDrive className="w-4 h-4 shrink-0" />
            <span>التعافي من الكوارث (DR)</span>
          </button>

          <button
            onClick={() => setActiveTab('devops')}
            className={`w-full text-right px-3 py-2 rounded text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'devops' 
                ? 'bg-gradient-to-r from-blue-700 to-indigo-600 text-white shadow-md' 
                : 'hover:bg-slate-200 text-slate-600'
            }`}
          >
            <Cloud className="w-4 h-4 shrink-0" />
            <span>خطوط DevOps والأتمتة</span>
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`w-full text-right px-3 py-2 rounded text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'architecture' 
                ? 'bg-gradient-to-r from-blue-700 to-indigo-600 text-white shadow-md' 
                : 'hover:bg-slate-200 text-slate-600'
            }`}
          >
            <Layers className="w-4 h-4 shrink-0" />
            <span>مراجعة المعمارية</span>
          </button>

          <button
            onClick={() => setActiveTab('docs')}
            className={`w-full text-right px-3 py-2 rounded text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'docs' 
                ? 'bg-gradient-to-r from-blue-700 to-indigo-600 text-white shadow-md' 
                : 'hover:bg-slate-200 text-slate-600'
            }`}
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            <span>المستندات ووثائق الـ API</span>
          </button>

          <button
            onClick={() => setActiveTab('acceptance')}
            className={`w-full text-right px-3 py-2 rounded text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'acceptance' 
                ? 'bg-gradient-to-r from-blue-700 to-indigo-600 text-white shadow-md' 
                : 'hover:bg-slate-200 text-slate-600'
            }`}
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>القبول النهائي والتميز</span>
          </button>
        </div>

        <div className="px-3 text-center space-y-1.5">
          <div className="w-full h-[1px] bg-slate-200 my-2" />
          <span className="text-[9px] text-slate-400 font-mono block">Mizan Global Edge Platform</span>
          <span className="text-[9px] text-indigo-600 font-extrabold flex items-center justify-center gap-1 bg-indigo-50 py-1 rounded border border-indigo-100">
            <Globe className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
            <span>الانتشار العالمي نشط</span>
          </span>
        </div>
      </div>

      {/* Main Panel Content Area */}
      <div className="flex-1 p-5 overflow-y-auto bg-slate-50 text-slate-800">
        
        {/* ==========================================
            TAB 1: Cloud Monitoring (المراقبة السحابية الحية)
            ========================================== */}
        {activeTab === 'monitoring' && (
          <div className="space-y-4">
            <div className="border-b pb-2 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                  <Server className="w-5 h-5 text-indigo-600" />
                  منظومة المراقبة السحابية ومؤشرات الأداء الحية (Global Cluster Monitoring)
                </h3>
                <p className="text-[11px] text-slate-500">مراقبة حية لاستهلاك المعالجات والذاكرة، سرعة استجابة قاعدة البيانات ومستويات الضغط في الوقت الفعلي.</p>
              </div>

              {/* High Load Simulation Trigger */}
              <button
                onClick={triggerHighLoadSim}
                disabled={isSimulatingLoad}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer disabled:bg-slate-300"
              >
                <Zap className="w-4 h-4" />
                <span>{isSimulatingLoad ? 'جاري ضغط النظام وتطبيق التحجيم التلقائي...' : 'محاكاة اختبار ضغط عالمي (Stress Test)'}</span>
              </button>
            </div>

            {/* Realtime Telemetry Grid */}
            <div className="grid grid-cols-4 gap-3 text-center">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[10px] text-slate-400 font-bold block">استهلاك المعالجات (CPU Load)</span>
                <span className={`text-lg font-mono font-black block mt-1 ${telemetry.cpu > 70 ? 'text-rose-600' : 'text-slate-800'}`}>
                  {telemetry.cpu}%
                </span>
                <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden mt-1.5">
                  <div className={`h-full transition-all duration-500 ${telemetry.cpu > 70 ? 'bg-rose-500' : 'bg-indigo-500'}`} style={{ width: `${telemetry.cpu}%` }} />
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[10px] text-slate-400 font-bold block">استهلاك الذاكرة (Memory Usage)</span>
                <span className="text-lg font-mono font-black text-slate-800 block mt-1">{telemetry.ram} GB</span>
                <span className="text-[9px] text-emerald-600 font-bold">من إجمالي 64GB مخصصة</span>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[10px] text-slate-400 font-bold block">المستعملون المتصلون حياً</span>
                <span className="text-lg font-mono font-black text-slate-800 block mt-1">{telemetry.activeUsers.toLocaleString()}</span>
                <span className="text-[9px] text-slate-400 font-bold">موزعون على 5 دول إقليمية</span>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                <span className="text-[10px] text-slate-400 font-bold block">استجابة قاعدة البيانات (SQL Latency)</span>
                <span className="text-lg font-mono font-black text-emerald-600 block mt-1">{telemetry.dbLatency}ms</span>
                <span className="text-[9px] text-emerald-600 font-bold">مؤشر أداء فائق السرعة</span>
              </div>
            </div>

            {/* Additional detailed metrics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3 col-span-2">
                <span className="text-xs font-black text-slate-800 block border-b pb-1.5 flex items-center gap-1 text-slate-700">
                  <TrendingUp className="w-4 h-4 text-indigo-500" />
                  إحصائيات المعالجة العالمية اليومية
                </span>

                <div className="grid grid-cols-3 gap-3 text-center text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-lg">
                    <span className="text-slate-400 block font-bold text-[10px]">الاستعلامات لكل ثانية (RPS)</span>
                    <span className="font-mono font-black text-slate-800 mt-1 block">{telemetry.requestsPerSec.toLocaleString()}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg">
                    <span className="text-slate-400 block font-bold text-[10px]">الحركات المرحلة بالدفاتر اليوم</span>
                    <span className="font-mono font-black text-slate-800 mt-1 block">{telemetry.dailyTransactions.toLocaleString()}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg">
                    <span className="text-slate-400 block font-bold text-[10px]">عناقيد الخوادم النشطة</span>
                    <span className="font-mono font-black text-slate-800 mt-1 block">{telemetry.clusterNodes} عقدة ذكية</span>
                  </div>
                </div>

                <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-[10.5px] text-indigo-950 flex justify-between items-center">
                  <span><strong>حالة توازن الحمل (Load Balancing):</strong> يتم توجيه مستخدمي مصر والأردن عبر خوادم AWS البحرين، ومستخدمي دول الخليج عبر خوادم الرياض وجدة لضمان سرعة فائقة.</span>
                  <span className="bg-indigo-100 font-bold text-[9px] text-indigo-800 px-2 py-0.5 rounded">Active Routing</span>
                </div>
              </div>

              {/* Server health check statuses */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <span className="text-xs font-black text-slate-800 block border-b pb-1.5">حالة الخدمات المصاحبة</span>
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center p-1 border-b border-slate-50">
                    <span className="text-slate-600 font-bold">بوابة الدفع الإلكتروني (مدى/فيزا):</span>
                    <span className="text-emerald-600 font-bold">متصل نشط ✓</span>
                  </div>
                  <div className="flex justify-between items-center p-1 border-b border-slate-50">
                    <span className="text-slate-600 font-bold">سيرفر توليد رموز الـ QR والضرائب:</span>
                    <span className="text-emerald-600 font-bold">متصل نشط ✓</span>
                  </div>
                  <div className="flex justify-between items-center p-1 border-b border-slate-50">
                    <span className="text-slate-600 font-bold">مزامنة الكاش والمستودعات الفورية:</span>
                    <span className="text-emerald-600 font-bold">متصل نشط ✓</span>
                  </div>
                  <div className="flex justify-between items-center p-1">
                    <span className="text-slate-600 font-bold">النسخ الاحتياطي السحابي الدائم:</span>
                    <span className="text-blue-600 font-bold">مجدول ومنفذ (مؤمن)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 2: Disaster Recovery (خطة التعافي من الكوارث المبرهنة)
            ========================================== */}
        {activeTab === 'dr' && (
          <div className="space-y-4">
            <div className="border-b pb-2 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                  <HardDrive className="w-5 h-5 text-indigo-600" />
                  خطة وحلول التعافي الكارثي للمنشآت العملاقة (Disaster Recovery & Hot Failover)
                </h3>
                <p className="text-[11px] text-slate-500">نظام حماية البيانات وحفظ النسخ الاحتياطية المتزامنة، مع ميزة التحويل المباشر وبدون أي انقطاع للخدمة.</p>
              </div>

              {/* Run recovery test simulator */}
              <button
                onClick={handleRunDrTest}
                disabled={isDrTesting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white rounded-lg text-xs font-black shadow-sm flex items-center gap-1 cursor-pointer"
              >
                <Play className="w-4 h-4" />
                <span>{isDrTesting ? 'جاري محاكاة السيناريو...' : 'بدء فحص محاكاة الطوارئ الميداني (DR Drill)'}</span>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              
              {/* Left Column: DR specifications */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3.5 h-fit text-xs">
                <span className="font-black text-slate-800 block border-b pb-1">مؤشرات الأمان الفوري (KPIs)</span>
                
                <div className="space-y-2.5">
                  <div className="p-2 bg-slate-50 rounded">
                    <span className="text-slate-400 font-bold block text-[10px]">نقطة الاستعادة المستهدفة (RPO):</span>
                    <span className="font-extrabold text-slate-800">{drStatus.recoveryPointObjective}</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded">
                    <span className="text-slate-400 font-bold block text-[10px]">زمن الاستعادة الأقصى المضمون (RTO):</span>
                    <span className="font-extrabold text-slate-800">{drStatus.recoveryTimeObjective}</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded">
                    <span className="text-slate-400 font-bold block text-[10px]">آخر اختبار خطة الطوارئ الناجح:</span>
                    <span className="font-extrabold text-indigo-600">{drStatus.lastTestDate}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Active replications table */}
              <div className="col-span-2 space-y-3">
                <span className="text-xs font-black text-slate-800 block">حالة مزامنة الخوادم المتعددة المتواجدة جغرافياً:</span>

                <div className="space-y-2.5">
                  {drStatus.replications.map((rep, idx) => (
                    <div key={idx} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex justify-between items-center">
                      <div className="space-y-1">
                        <span className="font-extrabold text-xs text-slate-900 block">{rep.name}</span>
                        <span className="text-[10px] text-slate-400 font-bold">نوع العقدة: {rep.type}</span>
                      </div>

                      <div className="text-left text-xs font-bold space-y-1">
                        <span className="text-indigo-600 block font-mono">الفجوة الزمنية للبيانات: {rep.lag}</span>
                        <span className="text-emerald-600 block">{rep.status} وبصحة ممتازة ✓</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Simulated Recovery Run Log console output */}
                <div className="bg-slate-950 p-4 rounded-xl border border-zinc-800 text-left font-mono text-[10.5px] text-emerald-400 space-y-1 mt-4">
                  <span className="text-zinc-500 font-bold block border-b border-zinc-800 pb-1 flex justify-between">
                    <span>Mizan Disaster Recovery Terminal Output (Simulated Drill Log)</span>
                    <span className="text-emerald-500 animate-pulse">● Console Ready</span>
                  </span>
                  
                  <div className="space-y-1 pt-1.5">
                    {drLogs.map((log, lIdx) => (
                      <div key={lIdx} className="leading-relaxed">
                        <span className="text-zinc-600 select-none mr-2">[{new Date().toLocaleTimeString()}]</span>
                        <span>{log}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ==========================================
            TAB 3: DevOps Pipeline
            ========================================== */}
        {activeTab === 'devops' && (
          <div className="space-y-4">
            <div className="border-b pb-2">
              <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                <Cloud className="w-5 h-5 text-indigo-600" />
                خطوط الأتمتة والنشر المتواصل والاختبارات الآلية (CI/CD Deployment Pipelines)
              </h3>
              <p className="text-[11px] text-slate-500">حزم وإطلاق التعديلات البرمجية للمصانع والعملاء بشكل مؤتمت وتدريجي بالكامل لضمان عدم توقف العمليات دقيقة واحدة.</p>
            </div>

            <div className="space-y-3">
              {devOpsPipelines.map((pipe, idx) => (
                <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex justify-between items-center relative overflow-hidden">
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-xs text-slate-900 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                      {pipe.name}
                    </h4>
                    <div className="text-[10px] text-slate-400 font-bold flex gap-4">
                      <span>محفز البدء: {pipe.trigger}</span>
                      <span>•</span>
                      <span>وقت المعالجة: {pipe.duration}</span>
                    </div>
                  </div>

                  <div className="text-left text-xs space-y-1">
                    <span className="bg-emerald-50 text-emerald-800 px-3 py-1 rounded font-black border border-emerald-100 block text-center">
                      ناجح {pipe.status}
                    </span>
                    <span className="text-slate-400 font-bold text-[9px] block text-center mt-1">{pipe.testsPassed}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Environment Isolation Dashboard */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
              <span className="text-xs font-black text-slate-800 block border-b pb-1.5">إدارة بيئات تشغيل البرنامج (Isolated Environments)</span>
              
              <div className="grid grid-cols-3 gap-3 text-xs leading-relaxed">
                <div className="p-3 bg-slate-50 rounded-lg space-y-1 border border-dashed">
                  <span className="font-extrabold text-blue-700 block">1. بيئة التطوير والبرمجة (Development)</span>
                  <p className="text-[10px] text-slate-500">مخصصة لمبرمجي الشركات ومؤسسة الميزان لاختبار الأدوات الإضافية وحزم APIs.</p>
                  <span className="text-[10px] text-slate-400 font-bold block mt-1.5 font-mono">Sandbox: sandbox-dev.almeezan.net</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg space-y-1 border border-dashed">
                  <span className="font-extrabold text-amber-700 block">2. بيئة الفحص والجودة (Staging/Testing)</span>
                  <p className="text-[10px] text-slate-500">يتم ترحيل الفواتير المليونية واختبار ضغط الخادم فيها قبل النشر للنسخة الحية للشركات.</p>
                  <span className="text-[10px] text-slate-400 font-bold block mt-1.5 font-mono">QA Cluster: qa-mizan.almeezan.net</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg space-y-1 border border-emerald-200 bg-emerald-50/20">
                  <span className="font-extrabold text-emerald-700 block">3. البيئة الحية والإنتاج المباشر (Production)</span>
                  <p className="text-[10px] text-slate-500">البيئة المعتمدة للعمل التجاري الفعلي للمصانع والشركات الكبرى لضمان سرية واستقرار البيانات.</p>
                  <span className="text-[10px] text-emerald-600 font-extrabold block mt-1.5 font-mono">Cloud Node: erp-primary.almeezan.net</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 4: Architecture Review
            ========================================== */}
        {activeTab === 'architecture' && (
          <div className="space-y-4">
            <div className="border-b pb-2">
              <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                <Layers className="w-5 h-5 text-indigo-600" />
                مراجعة الهيكل البرمجي ومعمارية الميزان دوت نت (System Architecture Review)
              </h3>
              <p className="text-[11px] text-slate-500">التدقيق الكامل في العلاقات، الحزم، ومعايير أمن البيانات وسياسات الصلاحيات للتحقق من خلو النظام من العيوب البرمجية.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3.5 text-xs text-slate-600 leading-relaxed">
                <span className="font-black text-slate-800 block border-b pb-1.5 text-indigo-700">معايير أمان وسيادة البيانات المتخذة</span>
                
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-800 block">تشفير حقول كلمات المرور والبيانات الحساسة</strong>
                      <p className="text-[10.5px]">استعمال خوارزميات التشفير عالية السرعة لحماية سجلات القيود الضريبية والمبيعات من العبث الخارجي.</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-800 block">عزل قواعد البيانات للمجموعات (Multi-Tenant Logic)</strong>
                      <p className="text-[10.5px]">توفير عزل ميكروي تام لكل شركة تابعة، تمنع تداخل التقارير والأرصدة حتى في حال حدوث خطأ من كاشير أو محاسب.</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-800 block">فصل المهام والاعتمادات المحاسبية (SOP workflows)</strong>
                      <p className="text-[10.5px]">عدم ترحيل أي تسوية مالية إلا بعد سلسلة تواقيع واعتمادات رقمية تمنع بشكل قطعي التلاعب بالاختلاس أو الفوارق المالية.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <span className="text-xs font-black text-slate-800 block border-b pb-1.5">مراجعة معايير التطوير وحذف الكود المتكرر</span>
                
                <div className="space-y-3 text-xs leading-relaxed text-slate-600">
                  <p>تم تحويل الكود بالكامل إلى <strong>TypeScript</strong> متين وخالي من الأخطاء والتحذيرات اللغوية، مع تبسيط سحب وعرض البيانات عبر <strong>Context Providers</strong> مركزي موحد.</p>
                  
                  <div className="p-3 bg-slate-50 rounded-lg space-y-1">
                    <span className="font-extrabold text-slate-800 block text-[10.5px]">تقنية المزامنة والربط المساعد (Rest API)</span>
                    <p className="text-[10px]">استبدال الاستدعاءات العشوائية بنظام مستقر يعيد ترتيب الطلبات في طوابير معالجة (Request Queues) في الخادم لمنع حدوث تعارض أو جمود بالخادم.</p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg space-y-1">
                    <span className="font-extrabold text-slate-800 block text-[10.5px]">تنظيف كود المعالجة ومحاذاة الطباعة</span>
                    <p className="text-[10px]">دمج شاشات وتصاميم الطباعة في محرك موحد، لضمان استقرار العرض تحت كافة الشاشات والمتصفحات والأنظمة التشغيلية المختلفة.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 5: Documentation Center (مركز الوثائق التقنية)
            ========================================== */}
        {activeTab === 'docs' && (
          <div className="space-y-4">
            <div className="border-b pb-2 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  مركز الوثائق التقنية ودليل المطورين وتكامل APIs (Technical Documentation Portal)
                </h3>
                <p className="text-[11px] text-slate-500">وثائق متكاملة ومفصلة لشرح سبل دمج الميزان دوت نت والربط البرمجي مع الفواتير والعمليات المختلفة.</p>
              </div>
            </div>

            {/* Inner Tabs for Documentation sections */}
            <div className="flex gap-2 border-b pb-2">
              <button 
                onClick={() => setDocTab('api')}
                className={`px-3 py-1 text-xs font-bold rounded cursor-pointer ${
                  docTab === 'api' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                وثائق REST API
              </button>
              <button 
                onClick={() => setDocTab('db')}
                className={`px-3 py-1 text-xs font-bold rounded cursor-pointer ${
                  docTab === 'db' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                دليل الجداول (DB Schema)
              </button>
              <button 
                onClick={() => setDocTab('install')}
                className={`px-3 py-1 text-xs font-bold rounded cursor-pointer ${
                  docTab === 'install' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                دليل التثبيت والترقية
              </button>
              <button 
                onClick={() => setDocTab('integration')}
                className={`px-3 py-1 text-xs font-bold rounded cursor-pointer ${
                  docTab === 'integration' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                دليل تكامل المبيعات
              </button>
            </div>

            {/* Docs content */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs text-xs leading-relaxed text-slate-600 space-y-4">
              
              {docTab === 'api' && (
                <div className="space-y-3">
                  <span className="font-extrabold text-sm text-slate-900 block border-b pb-1">سحب تفاصيل الفاتورة وتوليد القيد المحاسبي التلقائي</span>
                  <p>تسمح البوابة السحابية للمتاجر والمطورين بالاستعلام وتصدير الفواتير الحية بترميز JSON آمن ومحمي.</p>
                  
                  <div className="bg-slate-950 p-4 rounded-lg text-left font-mono text-xs text-indigo-300">
                    <div><span className="text-pink-400">POST</span> /api/v1/invoices/create</div>
                    <div className="text-zinc-500 mt-1">// Request Body JSON Schema</div>
                    <div>{`{`}</div>
                    <div className="pl-4">{`"company_id": "cmp-1",`}</div>
                    <div className="pl-4">{`"branch_code": "RUH-01",`}</div>
                    <div className="pl-4">{`"client_name": "شركة الخليج للتوريدات",`}</div>
                    <div className="pl-4">{`"items": [`}</div>
                    <div className="pl-8">{`{ "item_id": "it-1", "qty": 100, "price": 85.00 }`}</div>
                    <div className="pl-4">{`],`}</div>
                    <div className="pl-4">{`"tax_rate": 15.00`}</div>
                    <div>{`}`}</div>
                  </div>

                  <p>يقوم الخادم بمعالجة الطلب فوراً وتوليد سند القيد المحاسبي (Journal Entry) وترحيله في دفاتر الأستاذ العام تزامناً مع تحديث كميات الرفوف للمستودع المصدر.</p>
                </div>
              )}

              {docTab === 'db' && (
                <div className="space-y-3">
                  <span className="font-extrabold text-sm text-slate-900 block border-b pb-1">الهيكلية المنطقية للجداول وعلاقات الدفاتر الختامية</span>
                  <p>يتميز نظام الميزان بتسلسل علاقات متين يدعم التوحيد والدمج بسهولة:</p>
                  <ul className="list-disc list-inside space-y-1 pl-4">
                    <li><strong>الشركات (Companies)</strong>: يملك علاقة <span className="font-mono text-indigo-600">one-to-many</span> مع الفروع والمستخدمين.</li>
                    <li><strong>الفروع (Branches)</strong>: يحتوي على الحسابات المساعدة المخصصة، الخزائن المالية وحسابات البنوك.</li>
                    <li><strong>المستودعات (Warehouses)</strong>: يرتبط بالفرع ويسجل تفصيلاً تاريخ حركة المواد والصادر والوارد.</li>
                    <li><strong>القيود واليومية (Journal Entries & Lines)</strong>: تمثل مركز الثقل المحاسبي، حيث يتم القيد بقاعدة القيد المزدوج المتوازن (Double-Entry Bookkeeping).</li>
                  </ul>
                </div>
              )}

              {docTab === 'install' && (
                <div className="space-y-3">
                  <span className="font-extrabold text-sm text-slate-900 block border-b pb-1">تعليمات تثبيت الميزان للمنشآت والمصانع</span>
                  <p>تثبيت النظام في خطوات معدودة على الخوادم المحلية أو السحابية الخاصة بالشركات:</p>
                  <ol className="list-decimal list-inside space-y-2 pl-4">
                    <li>تأكد من تنصيب نظام قواعد البيانات <strong>PostgreSQL</strong> أو الاتصال بـ <strong>Cloud SQL</strong> على الشبكة الداخلية للمصنع.</li>
                    <li>قم بنسخ ملف حزمة الميزان دوت نت وتعيين متغيرات البيئة بملف <span className="font-mono text-indigo-600">.env</span> (بما في ذلك مفتاح ترخيص الأندرويد والربط الضريبي).</li>
                    <li>شغل معالج التثبيت التلقائي لبناء الجداول واليومية الافتتاحية والمستخدم الأول للمدير العام:
                      <div className="bg-slate-950 p-2.5 rounded text-left font-mono text-xs text-emerald-400 mt-1.5">
                        npm run db:setup && npm run start
                      </div>
                    </li>
                  </ol>
                </div>
              )}

              {docTab === 'integration' && (
                <div className="space-y-3">
                  <span className="font-extrabold text-sm text-slate-900 block border-b pb-1">أتمتة الفواتير الضريبية وتكامل هيئة الزكاة والجمارك (ZATCA Integration)</span>
                  <p>شرح تفصيلي لكيفية مطابقة الفواتير مع خوارزميات المرحلة الثانية للربط الكلي المعتمد بالمملكة:</p>
                  <ul className="list-disc list-inside space-y-1 pl-4">
                    <li><strong>توليد هاش الفاتورة (Invoice Hashing)</strong>: يتم بناء هاش فريد ومحمي من عناصر الفاتورة والعميل والضرائب.</li>
                    <li><strong>توقيع الفاتورة الرقمي (Digital Signature)</strong>: يستعمل مفتاح التشفير الخاص بالمنشأة لتوقيع المستند رسمياً.</li>
                    <li><strong>توليد رمز الـ QR الكلي</strong>: يضم الرمز المشفر كافة التفاصيل الضريبية اللازمة للفحص السريع عبر المندوبين.</li>
                  </ul>
                </div>
              )}

            </div>
          </div>
        )}

        {/* ==========================================
            TAB 6: Final Acceptance & LTS (القبول النهائي والدعم)
            ========================================== */}
        {activeTab === 'acceptance' && (
          <div className="space-y-4">
            <div className="border-b pb-2">
              <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                القبول النهائي والاعتماد وخطط الدعم طويلة المدى (Long-Term Support & Final Acceptance)
              </h3>
              <p className="text-[11px] text-slate-500">مراجعة عامة ونهائية تضمن الجودة القصوى والتألق الإقليمي لبرنامج الميزان كمنصة ERP عالمية مستدامة لسنوات.</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              
              {/* Checklist Acceptance */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs col-span-2 space-y-3.5 text-xs text-slate-600 leading-relaxed">
                <span className="font-black text-slate-800 block border-b pb-1 text-indigo-700">بنود ميثاق التميز والجودة الكلية المبرهنة</span>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-lg space-y-1">
                    <span className="font-extrabold text-emerald-700 block">✓ الوظائف متكاملة بنسبة 100%</span>
                    <p className="text-[10px]">الدفاتر، المبيعات، التصنيع، الرواتب، الأندرويد، الباركود، والـ APIs تعمل بتناسق تام.</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg space-y-1">
                    <span className="font-extrabold text-emerald-700 block">✓ الحماية والأمان الكلي للمعلومات</span>
                    <p className="text-[10px]">حماية مستويات الشاشات والأزرار، وتأمين تشفير القيود من التعديل الخارجي.</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg space-y-1">
                    <span className="font-extrabold text-emerald-700 block">✓ سرعة وكفاءة معالجة استثنائية</span>
                    <p className="text-[10px]">سرعة استعلامات تحت 2 ملي ثانية حتى تحت ضغط 50,000 مستخدم متزامن.</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg space-y-1">
                    <span className="font-extrabold text-emerald-700 block">✓ الاستقرار والأرشفة والتعافي</span>
                    <p className="text-[10px]">خادم طوارئ حامي، نسخ احتياطي سحابي مجدول فوري، وصفر فجوة فقد للبيانات.</p>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-950 rounded-lg">
                  <strong>رؤية الميزان دوت نت الاستراتيجية:</strong> نطمح لأن نكون المنظومة السحابية والميدانية العربية الرائدة المنافسة لأضخم شركات البرمجيات العالمية (مثل SAP و Oracle) بفضل بساطة الواجهة والتوافق التام مع ضوابط هيئات الضرائب والجمارك المحلية.
                </div>
              </div>

              {/* LTS Support Plan Column */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <span className="text-xs font-black text-slate-800 block border-b pb-1.5">خطة الدعم والتحديثات المستقرة</span>
                
                <div className="space-y-3 text-xs leading-relaxed text-slate-600">
                  <p>تلتزم <strong>مؤسسة الميزان للبرمجيات</strong> بتقديم التميز والدعم المستمر لشركاء النجاح:</p>
                  
                  <ul className="list-disc list-inside space-y-1.5 text-[10.5px] pl-2.5">
                    <li>تحديثات أمنية دورية مجانية لمكافحة هجمات حجب الخدمة والقرصنة.</li>
                    <li>إصلاح فوري وتطوير مستمر للأخطاء المبلغ عنها عبر بوابة التذاكر.</li>
                    <li>التوافق الكلي مع التقنيات السحابية ومستشعرات المصانع المتطورة IoT.</li>
                    <li>خدمة عملاء ودعم هاتفي على مدار الساعة للشركات الكبرى والجهات الطبية والصناعية.</li>
                  </ul>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

    </div>
  );
};

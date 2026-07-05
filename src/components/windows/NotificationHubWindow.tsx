import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { 
  Bell, Mail, MessageSquare, ShieldAlert, Settings, 
  Send, RefreshCw, Trash2, CheckCircle2, AlertTriangle, AlertCircle
} from 'lucide-react';

interface NotificationHubWindowProps {
  windowId: string;
  onClose: () => void;
}

export const NotificationHubWindow: React.FC<NotificationHubWindowProps> = ({ windowId, onClose }) => {
  const { theme, showToast } = useErp();

  // Selected configurations
  const [recipient, setRecipient] = useState<string>('0501234567');
  const [channel, setChannel] = useState<'SMS' | 'WHATSAPP' | 'EMAIL' | 'IN_APP'>('SMS');
  const [msgContent, setMsgContent] = useState<string>('تنبيه: تم إصدار فاتورة مبيعات رقم INV-1025 بقيمة 1,500 ريال سعودي لشركتكم الموقرة.');

  // Templates
  const [templates, setTemplates] = useState([
    { title: 'ترحيل فاتورة جديدة', channel: 'SMS', text: 'عزيزي العميل، تم ترحيل فاتورتكم رقم {invoiceNo} بقيمة {netAmount} ر.س. شكراً لتعاملكم معنا.' },
    { title: 'تنبيه تدني المخزون', channel: 'IN_APP', text: 'تنبيه مستودعي حاسم: المادة "{itemName}" قد وصلت للحد الأدنى المسموح به بالمخزن ({stockQty}).' },
    { title: 'تقرير مالي يومي للإدارة', channel: 'EMAIL', text: 'سعادة المدير العام، مرفق طيه التقرير المالي الختامي ليوم {date}. إجمالي المبيعات: {salesSum} ر.س.' },
    { title: 'إرسال رابط التحصيل', channel: 'WHATSAPP', text: 'مرحباً {customerName}، نرجو التكرم بسداد رصيد الحساب المستحق بقيمة {balance} ر.س عبر بوابة الدفع الآتية: {link}' }
  ]);

  // Dispatched Logs
  const [logs, setLogs] = useState([
    { id: '1', channel: 'SMS', recipient: '0501112223', text: 'تم تسجيل دخول ناجح للنظام للمستخدم: Ahmed Ahmed', date: '2026-07-04 12:10 م', status: 'delivered' },
    { id: '2', channel: 'WHATSAPP', recipient: '0502223334', text: 'تم إصدار الفاتورة رقم INV-2051 وإرسالها بالكامل لصندوق البريد', date: '2026-07-04 11:45 ص', status: 'delivered' },
    { id: '3', channel: 'EMAIL', recipient: 'ceo@al-mizan.net', text: 'تحذير: مساحة تخزين خادم قاعدة البيانات بلغت 92%', date: '2026-07-04 10:15 ص', status: 'read' },
    { id: '4', channel: 'SMS', recipient: '0554445556', text: 'مستوى مخزون الدقيق الفاخر أقل من الحد الآمن', date: '2026-07-04 09:00 ص', status: 'delivered' }
  ]);

  const handleApplyTemplate = (temp: any) => {
    setChannel(temp.channel);
    setMsgContent(temp.text);
    if (temp.channel === 'EMAIL') {
      setRecipient('manager@al-mizan.net');
    } else if (temp.channel === 'IN_APP') {
      setRecipient('جميع المحاسبين النشطين');
    } else {
      setRecipient('0501234567');
    }
    showToast('تم تطبيق قالب الرسالة بنجاح', 'info');
  };

  const handleSendTestMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !msgContent) {
      showToast('يرجى تعبئة كافة الحقول للإرسال', 'error');
      return;
    }

    const newLog = {
      id: 'log-' + Date.now(),
      channel: channel,
      recipient: recipient,
      text: msgContent,
      date: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) + ' اليوم',
      status: 'delivered'
    };

    setLogs(prev => [newLog, ...prev]);
    showToast(`تم إرسال الرسالة عبر قناة [${channel}] بنجاح!`, 'success');
  };

  const clearLogs = () => {
    setLogs([]);
    showToast('تم تفريغ سجل الرسائل الصادرة', 'info');
  };

  const isDark = theme === 'dark' || theme === 'light-black';

  return (
    <div className={`flex h-full p-4 select-none overflow-hidden transition-colors duration-300 ${isDark ? 'bg-zinc-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`} dir="rtl">
      
      {/* LEFT: SENDER SANDBOX & TEMPLATES */}
      <div className={`w-[320px] border-l p-4 shrink-0 flex flex-col justify-between overflow-y-auto ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-sm rounded-lg'}`}>
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b pb-2">
            <Bell className="w-5 h-5 text-rose-500 animate-swing" />
            <h3 className="text-xs font-extrabold text-slate-800">بوابة الإشعارات والرسائل المتعددة</h3>
          </div>

          {/* Quick template selection */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-black text-slate-500">اختر قالباً للتعبئة الفورية:</span>
            <div className="space-y-1 max-h-[140px] overflow-y-auto pr-0.5">
              {templates.map((temp, idx) => (
                <div 
                  key={idx} 
                  onClick={() => handleApplyTemplate(temp)}
                  className="p-1.5 bg-slate-50 hover:bg-rose-50 border rounded text-[10px] font-bold cursor-pointer transition-colors flex justify-between items-center"
                >
                  <span className="text-slate-800">{temp.title}</span>
                  <span className="text-[8px] bg-slate-200 text-slate-600 px-1 rounded">{temp.channel}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Form input */}
          <form onSubmit={handleSendTestMessage} className="space-y-3 border-t pt-3 text-[11px]">
            <div className="flex flex-col gap-1">
              <label className="font-extrabold text-slate-600">قناة الإرسال:</label>
              <div className="grid grid-cols-4 gap-1">
                {(['SMS', 'WHATSAPP', 'EMAIL', 'IN_APP'] as const).map(ch => (
                  <button 
                    key={ch}
                    type="button"
                    onClick={() => setChannel(ch)}
                    className={`py-1 text-[9.5px] font-bold border rounded transition-colors ${channel === ch ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-slate-50 border-slate-200'}`}
                  >
                    {ch}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-extrabold text-slate-600">رقم الهاتف أو البريد المستلم:</label>
              <input 
                type="text" 
                value={recipient} 
                onChange={(e) => setRecipient(e.target.value)}
                className="p-1.5 bg-white border border-slate-300 rounded text-[11px] font-mono text-left"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-extrabold text-slate-600">محتوى الرسالة (Text):</label>
              <textarea 
                rows={3}
                value={msgContent} 
                onChange={(e) => setMsgContent(e.target.value)}
                className="p-1.5 bg-white border border-slate-300 rounded text-[11px]"
                required
              />
            </div>

            <button 
              type="submit"
              className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-[11px] rounded transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>إرسال إشعار تجريبي فوري</span>
            </button>
          </form>
        </div>

        <div className="text-[10px] text-slate-400 text-center font-bold">
          بوابة الرسائل المركزية • الميزان ERP
        </div>
      </div>

      {/* RIGHT: LIVE TRACKING LOGS */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        
        {/* Gateway settings summary */}
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-sm'} space-y-3`}>
          <span className="text-[12px] font-black text-slate-750 flex items-center gap-2">
            <Settings className="w-4.5 h-4.5 text-rose-500" />
            <span>تهيئة خوادم وبوابات الربط للرسائل (Gateway configuration)</span>
          </span>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 text-center text-[10.5px]">
            <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg">
              <div className="font-extrabold">بوابة SMS (Unifonic)</div>
              <div className="text-[9px] mt-1 font-bold">✓ الحالة: متصلة بنجاح</div>
            </div>
            <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg">
              <div className="font-extrabold">بوابة WhatsApp API</div>
              <div className="text-[9px] mt-1 font-bold">✓ الحالة: نشطة (Meta)</div>
            </div>
            <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg">
              <div className="font-extrabold">خادم SMTP (Office 365)</div>
              <div className="text-[9px] mt-1 font-bold">✓ الحالة: آمن SSL/TLS</div>
            </div>
            <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg">
              <div className="font-extrabold">Firebase Push Notify</div>
              <div className="text-[9px] mt-1 font-bold">✓ الحالة: مستعد بالهواتف</div>
            </div>
          </div>
        </div>

        {/* Dispatch Log table */}
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-sm'} space-y-3 flex-1 flex flex-col`}>
          <div className="flex items-center justify-between border-b pb-1.5">
            <span className="text-[12px] font-black text-slate-750 flex items-center gap-1.5">
              <RefreshCw className="w-4 h-4 text-slate-400" />
              <span>سجل الرسائل الصادرة والإشعارات الميدانية:</span>
            </span>
            {logs.length > 0 && (
              <button 
                onClick={clearLogs}
                className="text-[10px] text-red-500 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> مسح السجل
              </button>
            )}
          </div>

          <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
            {logs.length === 0 ? (
              <div className="text-center text-slate-400 py-10 text-[11px] font-bold">
                لا توجد رسائل صادرة مسجلة في الـ Logger اليوم.
              </div>
            ) : (
              logs.map(log => (
                <div key={log.id} className="p-2.5 bg-white border border-slate-200 hover:border-slate-300 rounded-lg flex items-center justify-between text-[11px] transition-colors shadow-xs">
                  <div className="flex items-center gap-2.5">
                    {/* Icon channel */}
                    <div className={`p-1.5 rounded ${
                      log.channel === 'SMS' ? 'bg-blue-100 text-blue-700' :
                      log.channel === 'WHATSAPP' ? 'bg-emerald-100 text-emerald-700' :
                      log.channel === 'EMAIL' ? 'bg-indigo-100 text-indigo-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {log.channel === 'EMAIL' ? <Mail className="w-3.5 h-3.5" /> : <MessageSquare className="w-3.5 h-3.5" />}
                    </div>
                    <div className="text-right">
                      <div className="font-extrabold text-slate-800">{log.recipient}</div>
                      <div className="text-slate-500 text-[10.5px] mt-0.5 leading-relaxed">{log.text}</div>
                    </div>
                  </div>
                  <div className="text-left shrink-0 pl-1">
                    <div className="text-[9.5px] text-slate-400 font-mono font-bold">{log.date}</div>
                    <span className="inline-block px-2 py-0.5 mt-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold rounded">
                      ✓ تم التسليم ({log.status})
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

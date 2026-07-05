import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { 
  Cpu, Code, Globe, HelpCircle, Key, RefreshCw, 
  Send, Terminal, Plus, Trash2, CheckCircle2, Copy
} from 'lucide-react';

interface ApiHubWindowProps {
  windowId: string;
  onClose: () => void;
}

export const ApiHubWindow: React.FC<ApiHubWindowProps> = ({ windowId, onClose }) => {
  const { theme, showToast, items, invoices } = useErp();

  // API keys
  const [apiKey, setApiKey] = useState<string>('mizan_live_sec_8f9a2b7c4d3e5f1g8h9i0j1k2l3m4n5o');
  const [clientId, setClientId] = useState<string>('client_id_98274103');
  const [copiedKey, setCopiedKey] = useState<boolean>(false);

  // Webhooks registered
  const [webhooks, setWebhooks] = useState([
    { id: 'wh-1', url: 'https://api.shopify.com/webhooks/al_mizan_sync', event: 'invoice.posted', status: 'active' },
    { id: 'wh-2', url: 'https://salla.sa/api/v1/webhooks/stock_update', event: 'item.stock_depleted', status: 'active' }
  ]);
  const [newWebhookUrl, setNewWebhookUrl] = useState<string>('');
  const [newWebhookEvent, setNewWebhookEvent] = useState<string>('invoice.posted');

  // Interactive REST tester
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('GET_items');
  const [requestBody, setRequestBody] = useState<string>('{}');
  const [responseJson, setResponseJson] = useState<any>({
    status: "awaiting_test_trigger",
    message: "اختر مساراً برمجياً ثم اضغط على زر إرسال الطلب لمعاينة الاستجابة."
  });
  const [isRequesting, setIsRequesting] = useState<boolean>(false);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    showToast('تم نسخ المفتاح السري المطور للحافظة', 'success');
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleCreateWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWebhookUrl) return;

    const newWh = {
      id: 'wh-' + Date.now(),
      url: newWebhookUrl,
      event: newWebhookEvent,
      status: 'active'
    };

    setWebhooks(prev => [...prev, newWh]);
    setNewWebhookUrl('');
    showToast('تم تسجيل الويب هوك بنجاح ومزامنة أحداث الربط!', 'success');
  };

  const handleDeleteWebhook = (id: string) => {
    setWebhooks(prev => prev.filter(w => w.id !== id));
    showToast('تم حذف وإيقاف اشتراك الويب هوك المحدد', 'info');
  };

  const handleSendApiTest = async () => {
    setIsRequesting(true);
    setResponseJson({ status: "processing", message: "جاري التفاوض مع موازن الأحمال وقراءة البيانات..." });

    // Latency simulation
    await new Promise(resolve => setTimeout(resolve, 800));

    if (selectedEndpoint === 'GET_items') {
      setResponseJson({
        status: 200,
        ok: true,
        endpoint: "/api/v1/items",
        timestamp: new Date().toISOString(),
        total_records: items.length,
        data: items.slice(0, 3).map(i => ({
          id: i.id,
          code: i.code,
          barcode: i.barcode,
          name: i.name,
          sale_price: i.salePrice,
          current_stock: i.currentStock
        }))
      });
    } else if (selectedEndpoint === 'GET_invoices') {
      setResponseJson({
        status: 200,
        ok: true,
        endpoint: "/api/v1/sales_invoices",
        timestamp: new Date().toISOString(),
        total_records: invoices.length,
        data: invoices.slice(0, 2).map(inv => ({
          id: inv.id,
          invoice_no: inv.invoiceNo,
          type: inv.type,
          net_amount: inv.netAmount,
          date: inv.date
        }))
      });
    } else {
      // POST Invoice simulation
      setResponseJson({
        status: 201,
        ok: true,
        endpoint: "/api/v1/sales_invoices",
        message: "تم إنشاء الفاتورة وترحيل القيد المحاسبي المزدوج تلقائياً بموازن الخادم المطور بنجاح!",
        invoice_id: "inv-api-" + Date.now(),
        posted_records: {
          ledger_rows_created: 2,
          stock_levels_deducted: 1
        }
      });
    }

    setIsRequesting(false);
    showToast('تمت استجابة الـ API بنجاح!', 'success');
  };

  const isDark = theme === 'dark' || theme === 'light-black';

  return (
    <div className={`flex h-full p-4 select-none overflow-hidden transition-colors duration-300 ${isDark ? 'bg-zinc-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`} dir="rtl">
      
      {/* LEFT: API KEYS & WEBHOOKS */}
      <div className={`w-[320px] border-l p-4 shrink-0 flex flex-col justify-between overflow-y-auto ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-sm rounded-lg'}`}>
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b pb-2">
            <Cpu className="w-5 h-5 text-indigo-600" />
            <h3 className="text-xs font-extrabold text-slate-800">إدارة مفاتيح المطور والويب هوك</h3>
          </div>

          {/* Credentials */}
          <div className="space-y-2 text-[11px] bg-slate-50 p-2.5 rounded border">
            <span className="font-extrabold text-slate-700 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-500" />
              <span>مفاتيح ترخيص REST API:</span>
            </span>
            <div className="space-y-1.5 font-mono text-[9.5px]">
              <div>
                <span className="text-slate-400">Client ID:</span>
                <div className="bg-white p-1 rounded border text-slate-800 font-bold select-all">{clientId}</div>
              </div>
              <div>
                <span className="text-slate-400 flex justify-between">
                  <span>Secret Key:</span>
                  <button onClick={handleCopyKey} className="text-indigo-600 hover:text-indigo-800">
                    {copiedKey ? 'تم النسخ' : 'نسخ المفتاح'}
                  </button>
                </span>
                <div className="bg-white p-1 rounded border text-slate-600 truncate">{apiKey}</div>
              </div>
            </div>
          </div>

          {/* Webhooks form */}
          <div className="space-y-2 border-t pt-3">
            <span className="text-[11.5px] font-extrabold text-slate-700 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-sky-500" />
              <span>تسجيل الويب هوكس (E-Commerce Webhooks):</span>
            </span>

            <form onSubmit={handleCreateWebhook} className="space-y-2 text-[11px]">
              <div className="flex flex-col gap-0.5">
                <span className="text-slate-500 font-semibold">رابط Endpoint الخارجي:</span>
                <input 
                  type="url" 
                  placeholder="https://your-shopify.com/webhooks"
                  value={newWebhookUrl}
                  onChange={(e) => setNewWebhookUrl(e.target.value)}
                  className="p-1.5 bg-white border rounded font-mono text-left"
                  required
                />
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-slate-500 font-semibold">الحدث المشترك فيه (Trigger Event):</span>
                <select 
                  value={newWebhookEvent}
                  onChange={(e) => setNewWebhookEvent(e.target.value)}
                  className="p-1 bg-white border rounded text-[11px]"
                >
                  <option value="invoice.posted">ترحيل فاتورة مبيعات جديدة (invoice.posted)</option>
                  <option value="item.stock_depleted">نفاد مخزون مادة (item.stock_depleted)</option>
                  <option value="account.balance_changed">تغير رصيد حساب ذمة (account.balance_changed)</option>
                </select>
              </div>

              <button 
                type="submit"
                className="w-full py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-extrabold rounded text-[10.5px] cursor-pointer"
              >
                + تسجيل رابط Webhook جديد
              </button>
            </form>
          </div>

          {/* Active Webhooks List */}
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400">الروابط المسجلة حالياً:</span>
            <div className="space-y-1 max-h-[110px] overflow-y-auto">
              {webhooks.map(wh => (
                <div key={wh.id} className="p-1.5 bg-slate-50 rounded border flex justify-between items-center text-[9.5px]">
                  <div className="truncate flex-1 pl-2 text-right">
                    <div className="font-bold text-slate-700 truncate font-mono">{wh.url}</div>
                    <div className="text-indigo-600 font-semibold mt-0.5">{wh.event}</div>
                  </div>
                  <button onClick={() => handleDeleteWebhook(wh.id)} className="text-red-500 hover:text-red-700">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-[10px] text-slate-400 text-center font-bold">
          بوابة الربط البرمجي المفتوحة • الميزان API
        </div>
      </div>

      {/* RIGHT: INTERACTIVE REST TESTER & TERMINAL */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 flex flex-col justify-between">
        
        {/* Endpoint choice header */}
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-sm'} space-y-3 shrink-0`}>
          <span className="text-[12px] font-black text-slate-750 flex items-center gap-1.5">
            <Code className="w-4.5 h-4.5 text-indigo-600" />
            <span>محاكي استدعاء الـ API ومطابقة الاستجابة الفورية (API Sandbox Playground)</span>
          </span>

          <div className="flex gap-2.5 items-end text-[11px]">
            <div className="flex-1 flex flex-col gap-1">
              <span className="font-bold text-slate-600">اختر مسار الـ REST Endpoint المراد اختباره:</span>
              <select 
                value={selectedEndpoint}
                onChange={(e) => {
                  setSelectedEndpoint(e.target.value);
                  if (e.target.value === 'POST_invoice') {
                    setRequestBody(JSON.stringify({
                      customerId: "cust-1",
                      paymentMethod: "cash",
                      netAmount: 1500,
                      items: [{ itemId: "item-1", qty: 2, price: 750 }]
                    }, null, 2));
                  } else {
                    setRequestBody('{}');
                  }
                }}
                className="w-full p-1.5 bg-white border border-slate-300 rounded text-[11px]"
              >
                <option value="GET_items">GET /api/v1/items • جرد قائمة المنتجات والأسعار المتاحة</option>
                <option value="GET_invoices">GET /api/v1/sales_invoices • جلب فواتير المبيعات الصادرة</option>
                <option value="POST_invoice">POST /api/v1/sales_invoices • إنشاء فاتورة مبيعات جديدة برمجياً</option>
              </select>
            </div>

            <button 
              onClick={handleSendApiTest}
              disabled={isRequesting}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>إرسال الطلب (Send)</span>
            </button>
          </div>
        </div>

        {/* IDE-like JSON preview block */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 min-h-[180px] mt-2">
          
          {/* Request payload */}
          <div className="flex flex-col">
            <span className="text-[10px] font-extrabold text-slate-500 mb-1 flex items-center gap-1">
              <Terminal className="w-3.5 h-3.5 text-slate-400" /> Request Payload (JSON)
            </span>
            <textarea 
              value={requestBody}
              onChange={(e) => setRequestBody(e.target.value)}
              disabled={selectedEndpoint !== 'POST_invoice'}
              className="flex-1 p-3 bg-zinc-950 text-emerald-400 font-mono text-[10.5px] rounded-lg border border-zinc-800 leading-relaxed resize-none shadow-inner"
              style={{ direction: 'ltr' }}
            />
          </div>

          {/* Response Payload */}
          <div className="flex flex-col">
            <span className="text-[10px] font-extrabold text-slate-500 mb-1 flex items-center gap-1">
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" /> Response JSON (200 OK / 201 Created)
            </span>
            <pre 
              className="flex-1 p-3 bg-zinc-950 text-cyan-400 font-mono text-[10.5px] rounded-lg border border-zinc-800 leading-relaxed overflow-y-auto max-h-[220px] shadow-inner"
              style={{ direction: 'ltr' }}
            >
              {JSON.stringify(responseJson, null, 2)}
            </pre>
          </div>

        </div>

      </div>

    </div>
  );
};

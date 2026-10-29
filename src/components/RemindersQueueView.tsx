import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatINR } from '../lib/collectionRules';
import { Customer } from '../types';
import {
  BellRing,
  MessageSquare,
  Copy,
  Check,
  Phone,
  Calendar,
  AlertTriangle,
  Info,
  ExternalLink,
  Send
} from 'lucide-react';

export const RemindersQueueView: React.FC = () => {
  const { customers, selectedDate, t, agency } = useApp();

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [templateLang, setTemplateLang] = useState<'hi' | 'en'>('hi');
  const [filterType, setFilterType] = useState<'DUE_TODAY' | 'OVERDUE' | 'UPCOMING'>('DUE_TODAY');

  const currentDay = new Date(selectedDate).getDate();

  // Filter reminder targets
  const reminders = useMemo(() => {
    const list: Array<{ customer: Customer; type: 'DUE_TODAY' | 'OVERDUE' | 'UPCOMING'; daysDiff: number }> = [];

    customers.forEach((c) => {
      if (c.status !== 'ACTIVE') return;

      if (c.scheduledDay === currentDay || c.scheduledDay === 0) {
        list.push({ customer: c, type: 'DUE_TODAY', daysDiff: 0 });
      } else if (c.scheduledDay < currentDay) {
        list.push({ customer: c, type: 'OVERDUE', daysDiff: currentDay - c.scheduledDay });
      } else if (c.scheduledDay <= currentDay + 3) {
        list.push({ customer: c, type: 'UPCOMING', daysDiff: c.scheduledDay - currentDay });
      }
    });

    if (filterType === 'DUE_TODAY') return list.filter((r) => r.type === 'DUE_TODAY');
    if (filterType === 'OVERDUE') return list.filter((r) => r.type === 'OVERDUE');
    return list.filter((r) => r.type === 'UPCOMING');
  }, [customers, currentDay, filterType]);

  const getMessageText = (c: Customer, type: 'DUE_TODAY' | 'OVERDUE' | 'UPCOMING') => {
    const agencyName = agency?.name || 'अधिकृत बैंक कलेक्शन एजेंसी';
    const cleanAmount = formatINR(c.installmentAmount);

    if (templateLang === 'hi') {
      if (type === 'OVERDUE') {
        return `नमस्कार ${c.name} जी,\nआपकी बैंक (${c.bankName}) RD खाता (${c.rdAccountNumber}) की मासिक किस्त ${cleanAmount} की देय तिथि निकल चुकी है। कृपया असुविधा और पेनाल्टी से बचने हेतु आज ही अधिकृत कलेक्शन एजेंट को भुगतान करें या संपर्क करें।\nधन्यवाद,\n${agencyName}`;
      } else if (type === 'UPCOMING') {
        return `नमस्कार ${c.name} जी,\nसादर सूचित किया जाता है कि आपकी निर्धारित RD किस्त ${cleanAmount} आगामी ${c.scheduledDay} तारीख को देय है। कृपया भुगतान तैयार रखें।\nअधिकृत एजेंट: ${agencyName}`;
      }
      return `नमस्कार ${c.name} जी,\nआपकी निर्धारित RD किस्त की तारीख आज (${selectedDate}) है। किस्त राशि: ${cleanAmount} (${c.bankName})। कृपया भुगतान स्थिति की पुष्टि करें। किसी भी सहायता के लिए अपने अधिकृत कलेक्शन एजेंट से संपर्क करें।\n${agencyName}`;
    } else {
      if (type === 'OVERDUE') {
        return `Dear ${c.name},\nYour RD installment of ${cleanAmount} for ${c.bankName} (${c.rdAccountNumber}) is overdue. Please settle with our authorized collection executive today to avoid bank penalties.\nRegards,\n${agencyName}`;
      } else if (type === 'UPCOMING') {
        return `Dear ${c.name},\nFriendly reminder: Your upcoming RD installment of ${cleanAmount} (${c.bankName}) is scheduled on day ${c.scheduledDay}. Please keep the payment ready.\nRegards,\n${agencyName}`;
      }
      return `Dear ${c.name},\nYour scheduled RD installment of ${cleanAmount} (${c.bankName}) is due today (${selectedDate}). Please confirm payment status with your authorized collection agent.\nRegards,\n${agencyName}`;
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Title */}
      <div>
        <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
          <BellRing className="w-5 h-5 text-amber-600" />
          <span>{t.remindersTitle} (Reminder Queue)</span>
        </h1>
        <p className="text-xs text-slate-500">
          ग्राहकों को देय किस्तों व बकाया राशि के अधिकृत पूर्व-सूचना संदेश
        </p>
      </div>

      {/* Compliance / Integration Disclaimer */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 flex items-start space-x-2">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>अधिकृत मैसेजिंग सूचना:</strong> वर्तमान में सीधे व्हाट्सएप वेब / ऐप यूआरएल का उपयोग किया जा रहा है। WhatsApp Business API या SMS गेटवे कनेक्ट होने पर ही स्वचालित डिलीवरी संभव होगी।
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-1.5 bg-slate-200/80 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setFilterType('DUE_TODAY')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filterType === 'DUE_TODAY' ? 'bg-white text-blue-900 shadow-xs font-bold' : 'text-slate-600'
            }`}
          >
            आज देय (Due Today)
          </button>
          <button
            onClick={() => setFilterType('OVERDUE')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filterType === 'OVERDUE' ? 'bg-white text-rose-900 shadow-xs font-bold' : 'text-slate-600'
            }`}
          >
            बकाया (Overdue)
          </button>
          <button
            onClick={() => setFilterType('UPCOMING')}
            className={`px-3 py-1.5 rounded-lg transition ${
              filterType === 'UPCOMING' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'
            }`}
          >
            आगामी (Upcoming)
          </button>
        </div>

        {/* Template Language Toggle */}
        <div className="flex items-center space-x-1 bg-white border border-slate-200 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setTemplateLang('hi')}
            className={`px-2.5 py-1 rounded-lg ${
              templateLang === 'hi' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600'
            }`}
          >
            हिंदी
          </button>
          <button
            onClick={() => setTemplateLang('en')}
            className={`px-2.5 py-1 rounded-lg ${
              templateLang === 'en' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600'
            }`}
          >
            English
          </button>
        </div>
      </div>

      {/* Reminders Queue Cards */}
      <div className="space-y-3">
        {reminders.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-slate-200 text-xs text-slate-500">
            इस श्रेणी में कोई रिमाइंडर कतार में नहीं है।
          </div>
        ) : (
          reminders.map(({ customer: c, type, daysDiff }) => {
            const message = getMessageText(c, type);
            const cleanPhone = c.phone.replace(/[^0-9]/g, '');

            return (
              <div
                key={c.id}
                className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs space-y-2.5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 text-sm">{c.name}</span>
                      <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded">
                        {c.phone}
                      </span>
                      {type === 'OVERDUE' && (
                        <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-1.5 py-0.2 rounded border border-rose-300">
                          {daysDiff} दिन बकाया
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {c.bankName} • खाता: {c.rdAccountNumber} • इलाका: {c.locality}
                    </div>
                  </div>

                  <span className="font-black text-sm text-blue-900">
                    {formatINR(c.installmentAmount)}
                  </span>
                </div>

                {/* Pre-formatted Message Bubble */}
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs font-sans whitespace-pre-line text-slate-800 leading-relaxed">
                  {message}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-2 pt-1">
                  <button
                    onClick={() => handleCopy(c.id, message)}
                    className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                  >
                    {copiedId === c.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === c.id ? 'कॉपी हो गया' : t.copyTemplate}</span>
                  </button>

                  <a
                    href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{t.openWhatsApp}</span>
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

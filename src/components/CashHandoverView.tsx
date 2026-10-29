import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { reconcileCashHandover, formatINR } from '../lib/collectionRules';
import {
  HandCoins,
  CheckCircle,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Building,
  ArrowRight,
  TrendingUp,
  Receipt
} from 'lucide-react';

export const CashHandoverView: React.FC = () => {
  const { collections, handovers, recordHandover, currentUser, users, t, selectedDate } = useApp();

  const [amountToHandover, setAmountToHandover] = useState<string>('');
  const [recipientName, setRecipientName] = useState('Rajesh Sharma (Agency Owner)');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filter cash collections for currentUser
  const agentCashCollections = collections.filter(
    (c) =>
      c.paymentMethod === 'CASH' &&
      c.outcome === 'COLLECTED' &&
      (currentUser.role === 'AGENT' ? c.employeeId === currentUser.id : true)
  );

  // Filter handovers for currentUser
  const agentHandovers = handovers.filter((h) =>
    currentUser.role === 'AGENT' ? h.employeeId === currentUser.id : true
  );

  const recon = reconcileCashHandover(
    agentCashCollections.map((c) => ({
      amount: c.amount,
      outcome: c.outcome,
      status: c.status,
    })),
    agentHandovers.map((h) => ({
      amountHandedOver: h.amountHandedOver,
      status: h.status,
    }))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amountToHandover || Number(amountToHandover) <= 0) return;

    setIsSubmitting(true);
    const res = await recordHandover({
      amountHandedOver: Number(amountToHandover),
      totalCollected: recon.totalCashCollected,
      recipientName,
      notes: notes.trim(),
    });

    setIsSubmitting(false);
    if (res.success) {
      setSuccessMsg('कैश हैंडओवर पावती सफलतापूर्वक दर्ज की गई!');
      setAmountToHandover('');
      setNotes('');
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Top Title */}
      <div>
        <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
          <HandCoins className="w-5 h-5 text-emerald-600" />
          <span>{t.handoverTitle}</span>
        </h1>
        <p className="text-xs text-slate-500">
          फील्ड एजेंट द्वारा एकत्रित नकद राशि का एजेंसी मालिक / कैशियर को हैंडओवर व मिलान
        </p>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 text-emerald-900 p-3 rounded-xl border border-emerald-200 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Reconciliation Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Total Cash Collected */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 block">
            कुल नकद वसूली (Cash Collected)
          </span>
          <div className="text-lg sm:text-xl font-black text-slate-900 mt-1">
            {formatINR(recon.totalCashCollected)}
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            मान्य प्रविष्टियों के अनुसार
          </span>
        </div>

        {/* Total Cash Handed Over */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 block">
            कुल जमा / हैंडओवर (Handed Over)
          </span>
          <div className="text-lg sm:text-xl font-black text-emerald-700 mt-1">
            {formatINR(recon.totalCashHandedOver)}
          </div>
          <span className="text-[10px] text-emerald-600 mt-0.5 block">
            पावती स्वीकृत राशि
          </span>
        </div>

        {/* Discrepancy Status */}
        <div
          className={`p-3.5 rounded-xl border shadow-2xs ${
            recon.isBalanced
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
              : recon.discrepancy > 0
              ? 'bg-amber-50/70 border-amber-200 text-amber-900'
              : 'bg-rose-50/70 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold">
            <span>{t.discrepancy} (अंतर)</span>
            {recon.isBalanced ? (
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            )}
          </div>
          <div className="text-lg sm:text-xl font-black mt-1">
            {formatINR(Math.abs(recon.discrepancy))}
          </div>
          <span className="text-[11px] font-semibold mt-0.5 block">
            {recon.isBalanced
              ? t.balanced
              : recon.discrepancy > 0
              ? `${t.shortage} (जमा होना शेष)`
              : `${t.excess} (अतिरिक्त जमा)`}
          </span>
        </div>
      </div>

      {/* Record New Cash Handover Form */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3.5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
          <Receipt className="w-4 h-4 text-blue-600" />
          <span>नई कैश हैंडओवर पावती दर्ज करें (Record Handover)</span>
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                हैंडओवर की गई नकद राशि (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-sm font-bold text-slate-500">₹</span>
                <input
                  type="number"
                  required
                  min="1"
                  step="10"
                  value={amountToHandover}
                  onChange={(e) => setAmountToHandover(e.target.value)}
                  placeholder={recon.discrepancy > 0 ? recon.discrepancy.toString() : '1000'}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-3 py-2 text-sm font-extrabold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              {recon.discrepancy > 0 && (
                <button
                  type="button"
                  onClick={() => setAmountToHandover(recon.discrepancy.toString())}
                  className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold mt-1"
                >
                  पूरा शेष भरें ({formatINR(recon.discrepancy)})
                </button>
              )}
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                प्राप्तकर्ता (Recipient / Authorizer) *
              </label>
              <input
                type="text"
                required
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="प्राप्तकर्ता का नाम"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              टिप्पणी व वाउचर संदर्भ (Voucher / Remarks)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="उदा. दोपहर 1:30 बजे काउंटर पर नकद जमा व पर्ची संलग्न"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !amountToHandover}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold shadow-md shadow-emerald-600/20 disabled:opacity-50 transition"
            >
              {isSubmitting ? 'दर्ज कर रहे हैं...' : 'हैंडओवर पावती दर्ज करें'}
            </button>
          </div>
        </form>
      </div>

      {/* Handover History Log */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          हैंडओवर इतिहास व पावतियां (Handover Records)
        </h2>

        {agentHandovers.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">
            अभी कोई कैश हैंडओवर रिकॉर्ड नहीं है।
          </p>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {agentHandovers.map((h) => {
              const emp = users.find((u) => u.id === h.employeeId);
              return (
                <div key={h.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-sm text-slate-900">
                        {formatINR(h.amountHandedOver)}
                      </span>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded border border-emerald-300">
                        {h.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      प्राप्तकर्ता: <strong>{h.recipientName}</strong> • {h.date} • {emp?.name}
                    </div>
                    {h.notes && <div className="text-[11px] text-slate-400 italic">"{h.notes}"</div>}
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                      {h.id}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

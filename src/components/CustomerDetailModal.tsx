import React, { useState } from 'react';
import { Customer, Collection } from '../types';
import { useApp } from '../context/AppContext';
import { formatINR } from '../lib/collectionRules';
import {
  X,
  Phone,
  MessageSquare,
  Building,
  Calendar,
  ShieldCheck,
  RotateCcw,
  PlusCircle,
  FileText,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Receipt
} from 'lucide-react';
import { ReceiptModal } from './ReceiptModal';

export const CustomerDetailModal: React.FC<{
  customer: Customer;
  onClose: () => void;
  onRecordPayment: (cust: Customer) => void;
}> = ({ customer, onClose, onRecordPayment }) => {
  const { collections, t, currentUser, verifyCollection, reverseCollection, users } = useApp();
  const [reversalReason, setReversalReason] = useState('');
  const [selectedColForReversal, setSelectedColForReversal] = useState<string | null>(null);
  const [selectedColForReceipt, setSelectedColForReceipt] = useState<Collection | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Filter collections for this customer
  const customerCollections = collections.filter((c) => c.customerId === customer.id);
  const assignedAgent = users.find((u) => u.id === customer.assignedEmployeeId);

  // Total verified collected
  const totalVerified = customerCollections
    .filter((c) => c.status === 'VERIFIED' && c.outcome === 'COLLECTED')
    .reduce((sum, c) => sum + c.amount, 0);

  const totalPending = customerCollections
    .filter((c) => (c.status === 'RECORDED' || c.status === 'SUBMITTED') && c.outcome === 'COLLECTED')
    .reduce((sum, c) => sum + c.amount, 0);

  const handleVerify = async (id: string) => {
    const res = await verifyCollection(id);
    if (res.success) {
      setActionMessage('कलेक्शन रिकॉर्ड सत्यापित किया गया!');
      setTimeout(() => setActionMessage(null), 2000);
    }
  };

  const handleReverseSubmit = async () => {
    if (!selectedColForReversal || !reversalReason.trim()) return;
    const res = await reverseCollection(selectedColForReversal, reversalReason);
    if (res.success) {
      setSelectedColForReversal(null);
      setReversalReason('');
      setActionMessage('रिकॉर्ड निरस्त/संशोधित किया गया एवं ऑडिट लॉग में दर्ज हुआ।');
      setTimeout(() => setActionMessage(null), 2500);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#202124]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full my-auto overflow-hidden shadow-2xl border border-gray-200">
        {/* Top Header - Google Style */}
        <div className="bg-white border-b border-gray-100 p-4 sm:p-5 flex items-start justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-13 h-13 rounded-full bg-[#e8f0fe] text-[#1a73e8] font-black text-xl flex items-center justify-center shrink-0 border border-blue-200/80 shadow-2xs">
              {customer.name.slice(0, 1)}
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-black tracking-tight text-[#1f1f1f]">
                  {customer.name}
                </h2>
                {/* Prominent Account Number Badge */}
                <span className="font-mono text-xs font-black bg-[#e8f0fe] text-[#1a73e8] border border-[#d2e3fc] px-2.5 py-0.5 rounded-lg">
                  खाता सं.: {customer.rdAccountNumber}
                </span>
              </div>
              <p className="text-xs text-[#5f6368] mt-0.5 font-medium">
                {customer.bankName} • {customer.locality} • {customer.address}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-full hover:bg-gray-100 text-[#5f6368] hover:text-[#1f1f1f] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Message Banner */}
        {actionMessage && (
          <div className="bg-[#e6f4ea] text-[#137333] px-4 py-2.5 text-xs font-bold border-b border-emerald-200 flex items-center space-x-1.5">
            <CheckCircle className="w-4 h-4 text-[#1e8e3e]" />
            <span>{actionMessage}</span>
          </div>
        )}

        <div className="p-4 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Quick Contact & Action Buttons (Google Style Pills) */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 bg-[#f8f9fa] p-3.5 rounded-3xl border border-gray-200/80">
            <div className="text-xs">
              <span className="text-[#5f6368] font-semibold">फोन नंबर: </span>
              <span className="font-bold text-[#1f1f1f]">{customer.phone}</span>
            </div>

            <div className="flex items-center space-x-2">
              <a
                href={`tel:${customer.phone}`}
                className="px-3.5 py-2 rounded-full bg-white hover:bg-gray-100 text-[#1a73e8] border border-gray-200 font-bold text-xs flex items-center space-x-1.5 transition active:scale-95 shadow-2xs"
                title="कॉल करें"
              >
                <Phone className="w-3.5 h-3.5 text-[#1a73e8]" />
                <span>कॉल</span>
              </a>
              <a
                href={`https://wa.me/${customer.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  `नमस्कार ${customer.name} जी, आपकी RD किस्त राशि ${formatINR(customer.installmentAmount)} (खाता: ${customer.rdAccountNumber}) निर्धारित है। - HDBI`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-full bg-[#e6f4ea] hover:bg-[#ceead6] text-[#137333] border border-emerald-200 font-bold text-xs flex items-center space-x-1.5 transition active:scale-95 shadow-2xs"
                title="WhatsApp भेजें"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#1e8e3e]" />
                <span>WhatsApp</span>
              </a>
              <button
                onClick={() => {
                  onClose();
                  onRecordPayment(customer);
                }}
                className="px-4 py-2 rounded-full bg-[#1a73e8] hover:bg-[#1557b0] text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm transition active:scale-95 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>₹ पैसे जमा करें</span>
              </button>
            </div>
          </div>

          {/* RD Account Specification Details */}
          <div className="bg-[#f8f9fa] p-4 rounded-2xl border border-gray-200/80 space-y-3">
            <h3 className="text-xs font-bold text-[#5f6368] uppercase tracking-wider flex items-center space-x-1.5">
              <Building className="w-3.5 h-3.5 text-[#1a73e8]" />
              <span>{t.rdDetails}</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-gray-100 shadow-2xs">
                <span className="text-[#5f6368] block text-[10px]">बैंक व शाखा</span>
                <span className="font-bold text-[#202124]">{customer.bankName}</span>
                <div className="text-[11px] text-[#5f6368]">{customer.branchName || 'Main'}</div>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-gray-100 shadow-2xs">
                <span className="text-[#5f6368] block text-[10px]">पासबुक / RD खाता सं.</span>
                <span className="font-mono font-bold text-[#1a73e8] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 inline-block mt-0.5">
                  {customer.rdAccountNumber}
                </span>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-gray-100 shadow-2xs">
                <span className="text-[#5f6368] block text-[10px]">{t.installmentAmount}</span>
                <span className="font-black text-[#1a73e8] text-sm">
                  {formatINR(customer.installmentAmount)}
                </span>
                <div className="text-[10px] text-[#5f6368]">{customer.frequency}</div>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-gray-100 shadow-2xs">
                <span className="text-[#5f6368] block text-[10px]">निर्धारित भुगतान दिन</span>
                <span className="font-semibold text-[#202124]">
                  {customer.scheduledDay === 0 ? 'प्रतिदिन (Daily)' : `हर माह ${customer.scheduledDay} तारीख`}
                </span>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-gray-100 shadow-2xs">
                <span className="text-[#5f6368] block text-[10px]">आरंभ तिथि</span>
                <span className="font-semibold text-[#202124]">{customer.startDate}</span>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-gray-100 shadow-2xs">
                <span className="text-[#5f6368] block text-[10px]">आवंटित फील्ड एजेंट</span>
                <span className="font-semibold text-[#202124]">
                  {assignedAgent?.name || 'Not assigned'}
                </span>
              </div>
            </div>

            {customer.notes && (
              <div className="pt-2 border-t border-gray-200 text-xs text-[#5f6368]">
                <span className="font-semibold text-[#202124]">नोट: </span>
                {customer.notes}
              </div>
            )}
          </div>

          {/* Customer Collection Balance Summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
              <span className="text-[10px] font-bold text-[#137333] uppercase">कुल सत्यापित जमा</span>
              <div className="text-lg font-black text-[#137333] mt-0.5">
                {formatINR(totalVerified)}
              </div>
              <span className="text-[10px] text-emerald-700">सत्यापित रिकॉर्ड्स</span>
            </div>

            <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl">
              <span className="text-[10px] font-bold text-[#b06000] uppercase">पुष्टि प्रतीक्षित (Pending)</span>
              <div className="text-lg font-black text-[#b06000] mt-0.5">
                {formatINR(totalPending)}
              </div>
              <span className="text-[10px] text-amber-700">जाँच शेष</span>
            </div>
          </div>

          {/* Passbook / Installment Ledger */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-[#5f6368] uppercase tracking-wider flex items-center space-x-1.5">
                <FileText className="w-4 h-4 text-[#5f6368]" />
                <span>{t.paymentLedger} (इतिहास)</span>
              </h3>
              <span className="text-[11px] text-slate-400">
                कुल {customerCollections.length} प्रविष्टियां
              </span>
            </div>

            {customerCollections.length === 0 ? (
              <div className="p-4 bg-slate-50 border rounded-xl text-center text-xs text-slate-500">
                इस ग्राहक के लिए अभी कोई कलेक्शन रिकॉर्ड दर्ज नहीं है।
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
                {customerCollections.map((col) => {
                  const isVerified = col.status === 'VERIFIED';
                  const isReversed = col.status === 'REVERSED';
                  const dateStr = new Date(col.collectedAt).toLocaleDateString('hi-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div key={col.id} className="p-3.5 hover:bg-[#f8fafd] transition flex items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-black text-base text-[#137333]">
                            {col.outcome === 'COLLECTED' ? `+ ${formatINR(col.amount)}` : col.outcome}
                          </span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                            {col.paymentMethod === 'CASH' ? '💵 नकद' : col.paymentMethod === 'UPI_QR' ? '📱 UPI' : col.paymentMethod}
                          </span>
                        </div>

                        {/* Prominent Date & Time Stamp */}
                        <div className="flex items-center space-x-1.5 text-xs text-gray-600 font-medium">
                          <Clock className="w-3.5 h-3.5 text-[#1a73e8]" />
                          <span className="font-bold text-gray-800">{dateStr}</span>
                          <span>•</span>
                          <span>{col.referenceNumber ? `रिफ: ${col.referenceNumber}` : 'हस्तगत नकद'}</span>
                        </div>
                        {col.notes && (
                          <div className="text-[11px] text-gray-500 italic">
                            "{col.notes}"
                          </div>
                        )}
                        {isReversed && (
                          <div className="text-xs text-[#b3261e] font-semibold bg-[#fce8e6] p-1.5 rounded-lg border border-[#fad2cf]">
                            रद्द कारण: {col.reversalReason}
                          </div>
                        )}
                      </div>

                      {/* Status Badge & Actions */}
                      <div className="text-right flex flex-col items-end space-y-1.5 shrink-0">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            isVerified
                              ? 'bg-[#e6f4ea] text-[#137333] border border-emerald-300'
                              : isReversed
                              ? 'bg-[#fce8e6] text-[#b3261e] border border-rose-300'
                              : 'bg-[#fef7e0] text-[#b06000] border border-amber-300'
                          }`}
                        >
                          {isVerified ? '✓ बैंक सत्यापित' : isReversed ? 'रद्द' : 'जाँच शेष'}
                        </span>

                        {/* Receipt button for collected payments */}
                        {col.outcome === 'COLLECTED' && (
                          <button
                            onClick={() => setSelectedColForReceipt(col)}
                            className="px-3 py-1 rounded-full bg-white hover:bg-blue-50 text-[#1a73e8] border border-blue-200 text-xs font-bold flex items-center space-x-1 shadow-2xs transition active:scale-95"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            <span>रसीद पर्ची</span>
                          </button>
                        )}

                          {/* Verify action (Owner/Supervisor) */}
                          {!isVerified && !isReversed && (currentUser.role === 'OWNER' || currentUser.role === 'SUPERVISOR') && (
                            <button
                              onClick={() => handleVerify(col.id)}
                              className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 underline"
                            >
                              सत्यापित करें ✓
                            </button>
                          )}

                          {/* Reversal action (Owner only) */}
                          {!isReversed && currentUser.role === 'OWNER' && (
                            <button
                              onClick={() => setSelectedColForReversal(col.id)}
                              className="text-[10px] text-rose-600 hover:text-rose-800 underline"
                            >
                              रद्द / संशोधित करें
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Reversal Reason Modal Popup */}
          {selectedColForReversal && (
            <div className="bg-rose-50 border border-rose-300 rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-rose-900">
                <RotateCcw className="w-4 h-4 text-rose-600" />
                <span>रिकॉर्ड निरस्त / सुधार प्रक्रिया (Authorized Reversal)</span>
              </div>
              <p className="text-[11px] text-rose-800">
                वित्तीय सुरक्षा नियमों के तहत कोई भी प्रविष्टि हटाई नहीं जाती, केवल कारण सहित रिवर्स की जाती है।
              </p>
              <input
                type="text"
                value={reversalReason}
                onChange={(e) => setReversalReason(e.target.value)}
                placeholder="रिवर्स करने का स्पष्ट कारण लिखें (उदा. चेक बाउंस, गलत प्रविष्टि)..."
                className="w-full bg-white border border-rose-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
              <div className="flex items-center justify-end space-x-2">
                <button
                  onClick={() => setSelectedColForReversal(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200"
                >
                  रद्द करें
                </button>
                <button
                  onClick={handleReverseSubmit}
                  disabled={!reversalReason.trim()}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50"
                >
                  पुष्टि करें व रिवर्स करें
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedColForReceipt && (
        <ReceiptModal
          customer={customer}
          collection={selectedColForReceipt}
          onClose={() => setSelectedColForReceipt(null)}
        />
      )}
    </div>
  );
};

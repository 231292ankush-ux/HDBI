import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { formatINR, validateCollectionEntry } from '../lib/collectionRules';
import { Customer, Collection, PaymentMethod, CollectionOutcome } from '../types';
import { ReceiptModal } from './ReceiptModal';
import {
  HandCoins,
  Search,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Building,
  Check,
  ChevronDown,
  UserCheck
} from 'lucide-react';

export const QuickCollectionView: React.FC = () => {
  const { customers, recordCollection, currentUser, t, seniorMode } = useApp();

  const [search, setSearch] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');
  const [amount, setAmount] = useState<string>('1000');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successReceipt, setSuccessReceipt] = useState<{
    customer: Customer;
    collection: Collection;
  } | null>(null);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  useEffect(() => {
    if (selectedCustomer) {
      setAmount(selectedCustomer.installmentAmount.toString());
    }
  }, [selectedCustomerId, selectedCustomer]);

  const handleQuickAdd = (addVal: number) => {
    const current = Number(amount) || 0;
    setAmount((current + addVal).toString());
  };

  const now = new Date();
  const currentDateTimeFormatted =
    now.toLocaleDateString('hi-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }) +
    ' • ' +
    now.toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' });

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.rdAccountNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.locality.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedCustomer) {
      setError('कृपया पहले ग्राहक चुनें');
      return;
    }

    const validation = validateCollectionEntry({
      customerId: selectedCustomerId,
      outcome: 'COLLECTED',
      amount: Number(amount),
      paymentMethod,
      idempotencyKey: `QUICK-${Date.now()}`,
    });

    if (!validation.isValid) {
      setError(validation.errors.join(', '));
      return;
    }

    setIsSubmitting(true);
    const idempotencyKey = `QUICK-COL-${selectedCustomerId}-${Date.now()}`;
    const res = await recordCollection({
      customerId: selectedCustomerId,
      amount: Number(amount),
      expectedAmount: selectedCustomer.installmentAmount,
      paymentMethod,
      outcome: 'COLLECTED',
      referenceNumber: referenceNumber.trim(),
      notes: notes.trim(),
      idempotencyKey,
    });

    setIsSubmitting(false);
    if (res.success && res.collection) {
      setSuccessReceipt({
        customer: selectedCustomer,
        collection: res.collection,
      });
      setNotes('');
      setReferenceNumber('');
    } else {
      setError(res.error || 'रिकॉर्ड दर्ज करने में त्रुटि');
    }
  };

  return (
    <div className={`space-y-4 pb-24 font-sans ${seniorMode ? 'text-base' : 'text-sm'}`}>
      {/* Google Pay Style Header Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200/90 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-12 h-12 rounded-full bg-[#1a73e8] text-white font-black text-xl flex items-center justify-center shadow-xs">
              ₹
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-black text-[#1f1f1f] tracking-tight">
                सीधा कलेक्शन दर्ज करें (Quick Collect)
              </h1>
              <p className="text-xs text-[#5f6368]">
                कलेक्टर: <span className="font-semibold text-[#1a73e8]">{currentUser.name}</span>
              </p>
            </div>
          </div>

          {/* Prominent Live Date & Time Stamp */}
          <div className="flex items-center space-x-1.5 bg-[#e8f0fe] text-[#174ea6] px-3.5 py-1.5 rounded-full text-xs font-bold self-start sm:self-auto border border-[#d2e3fc]">
            <Calendar className="w-4 h-4 text-[#1a73e8]" />
            <span>{currentDateTimeFormatted}</span>
          </div>
        </div>

        {error && (
          <div className="mt-3 bg-[#fce8e6] text-[#b3261e] p-3 rounded-2xl text-xs sm:text-sm font-semibold flex items-center space-x-2 border border-[#fad2cf]">
            <AlertTriangle className="w-4 h-4 text-[#d93025] shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* 1. CUSTOMER SEARCH & SELECT (With prominent Account Number) */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#1f1f1f] uppercase tracking-wider">
              1. ग्राहक व RD खाता चुनें (Search & Select Customer) *
            </label>

            {/* Search Filter Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ग्राहक का नाम, खाता संख्या (RD-XXXX) या फोन खोजें..."
                className="w-full bg-[#f8f9fa] border border-gray-300 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-[#1f1f1f] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1a73e8] shadow-2xs font-medium"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3.5 top-3 text-xs text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Customer Dropdown */}
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full bg-[#f8f9fa] border border-gray-300 rounded-2xl px-4 py-3 text-sm text-[#1f1f1f] font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1a73e8] cursor-pointer"
            >
              {filteredCustomers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} • खाता: {c.rdAccountNumber} • {c.bankName} • {formatINR(c.installmentAmount)}
                </option>
              ))}
            </select>

            {/* Active Selected Customer Preview Card */}
            {selectedCustomer && (
              <div className="p-4 rounded-3xl bg-[#f8fafd] border-2 border-blue-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div className="space-y-0.5">
                  <div className="text-base sm:text-lg font-black text-[#1f1f1f]">
                    {selectedCustomer.name}
                  </div>
                  <div className="text-xs text-gray-600 font-medium">
                    {selectedCustomer.bankName} • {selectedCustomer.locality} • फोन: {selectedCustomer.phone}
                  </div>
                </div>

                {/* Big Account Number & Due Amount Pills */}
                <div className="flex items-center space-x-2 self-start sm:self-auto">
                  <div className="font-mono text-xs font-black bg-[#e8f0fe] text-[#1a73e8] border border-[#d2e3fc] px-3 py-1.5 rounded-xl">
                    खाता सं.: {selectedCustomer.rdAccountNumber}
                  </div>
                  <div className="text-xs font-bold bg-[#e6f4ea] text-[#137333] border border-emerald-200 px-3 py-1.5 rounded-xl">
                    किस्त: {formatINR(selectedCustomer.installmentAmount)}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. AMOUNT INPUT: GIANT GOOGLE PAY STYLE */}
          <div className="p-4 sm:p-5 bg-[#f8f9fa] rounded-3xl border border-gray-200/90 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-[#1f1f1f] uppercase tracking-wider">
                2. जमा राशि (Amount to Collect) *
              </label>
              <span className="text-xs text-gray-500 font-medium">
                निर्धारित: <span className="font-bold text-[#1a73e8]">{formatINR(selectedCustomer?.installmentAmount || 0)}</span>
              </span>
            </div>

            {/* Giant Numeric Amount Display */}
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-2xl sm:text-3xl font-bold text-gray-400">
                ₹
              </span>
              <input
                type="number"
                required
                min="1"
                step="10"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-white border-2 border-[#1a73e8] rounded-2xl pl-11 pr-4 py-3 sm:py-4 text-2xl sm:text-4xl font-black text-[#1a73e8] focus:outline-none focus:ring-4 focus:ring-blue-500/20 shadow-xs text-center"
                aria-label="Collection Amount"
              />
            </div>

            {/* Quick 1-Tap Preset Buttons (Senior-friendly touch targets) */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleQuickAdd(100)}
                className="py-2.5 px-2 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl text-xs sm:text-sm font-bold text-gray-700 transition cursor-pointer"
              >
                +₹100
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdd(500)}
                className="py-2.5 px-2 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl text-xs sm:text-sm font-bold text-gray-700 transition cursor-pointer"
              >
                +₹500
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdd(1000)}
                className="py-2.5 px-2 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl text-xs sm:text-sm font-bold text-gray-700 transition cursor-pointer"
              >
                +₹1,000
              </button>
              <button
                type="button"
                onClick={() => setAmount((selectedCustomer?.installmentAmount || 1000).toString())}
                className="py-2.5 px-2 bg-[#e8f0fe] hover:bg-[#d2e3fc] border border-[#d2e3fc] rounded-xl text-xs sm:text-sm font-bold text-[#1a73e8] transition cursor-pointer"
              >
                पूरी किस्त
              </button>
            </div>
          </div>

          {/* 3. PAYMENT METHOD SELECTION */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#1f1f1f] uppercase tracking-wider">
              3. भुगतान माध्यम (Payment Mode) *
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setPaymentMethod('CASH')}
                className={`py-3.5 px-3 rounded-2xl border-2 font-bold text-xs sm:text-sm flex flex-col items-center justify-center transition cursor-pointer ${
                  paymentMethod === 'CASH'
                    ? 'border-[#1e8e3e] bg-[#e6f4ea] text-[#137333] shadow-xs ring-2 ring-emerald-500/20'
                    : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                }`}
              >
                <span className="text-xl mb-0.5">💵</span>
                <span>नकद (Cash)</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('UPI_QR')}
                className={`py-3.5 px-3 rounded-2xl border-2 font-bold text-xs sm:text-sm flex flex-col items-center justify-center transition cursor-pointer ${
                  paymentMethod === 'UPI_QR'
                    ? 'border-[#1a73e8] bg-[#e8f0fe] text-[#174ea6] shadow-xs ring-2 ring-blue-500/20'
                    : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                }`}
              >
                <span className="text-xl mb-0.5">📱</span>
                <span>UPI / QR</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('CHEQUE')}
                className={`py-3.5 px-3 rounded-2xl border-2 font-bold text-xs sm:text-sm flex flex-col items-center justify-center transition cursor-pointer ${
                  paymentMethod === 'CHEQUE'
                    ? 'border-[#7b1fa2] bg-[#f3e8fd] text-[#4a148c] shadow-xs ring-2 ring-purple-500/20'
                    : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                }`}
              >
                <span className="text-xl mb-0.5">🏦</span>
                <span>चेक / बैंक</span>
              </button>
            </div>

            {/* Reference Number / UTR Input if UPI or Cheque */}
            {paymentMethod !== 'CASH' && (
              <div className="pt-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  UTR / ट्रांजेक्शन रिफरेंस नंबर (वैकल्पिक)
                </label>
                <input
                  type="text"
                  placeholder="उदा. UPI 938210482910"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  className="w-full bg-[#f8f9fa] border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1a73e8]"
                />
              </div>
            )}
          </div>

          {/* 4. SUBMIT ACTION BUTTON (Large Google Pill) */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-full font-black text-sm sm:text-base bg-[#1a73e8] hover:bg-[#1557b0] active:scale-98 text-white shadow-md shadow-blue-500/20 transition cursor-pointer flex items-center justify-center space-x-2"
            >
              <HandCoins className="w-5 h-5" />
              <span>{isSubmitting ? 'दर्ज कर रहे हैं...' : '✓ पैसे जमा करें व रसीद बनाएं'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Success Receipt Popup */}
      {successReceipt && (
        <ReceiptModal
          customer={successReceipt.customer}
          collection={successReceipt.collection}
          onClose={() => setSuccessReceipt(null)}
        />
      )}
    </div>
  );
};

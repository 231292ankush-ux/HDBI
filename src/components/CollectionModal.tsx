import React, { useState, useEffect } from 'react';
import { Customer, CollectionOutcome, PaymentMethod } from '../types';
import { useApp } from '../context/AppContext';
import { formatINR, validateCollectionEntry } from '../lib/collectionRules';
import {
  X,
  CheckCircle,
  IndianRupee,
  CreditCard,
  QrCode,
  FileCheck,
  Building,
  AlertTriangle,
  User,
  Clock,
  Sparkles,
  ShieldCheck,
  Calendar,
  Check,
  ChevronDown,
  Search
} from 'lucide-react';

export const CollectionModal: React.FC<{
  initialCustomer?: Customer | null;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ initialCustomer, onClose, onSuccess }) => {
  const { customers, recordCollection, currentUser, t, seniorMode } = useApp();

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    initialCustomer ? initialCustomer.id : customers[0]?.id || ''
  );
  const [customerSearch, setCustomerSearch] = useState('');
  const [outcome, setOutcome] = useState<CollectionOutcome>('COLLECTED');
  const [amount, setAmount] = useState<string>(
    initialCustomer ? initialCustomer.installmentAmount.toString() : '1000'
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [showAlternativeOutcomes, setShowAlternativeOutcomes] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  useEffect(() => {
    if (selectedCustomer && outcome === 'COLLECTED') {
      setAmount(selectedCustomer.installmentAmount.toString());
    }
  }, [selectedCustomerId, outcome, selectedCustomer]);

  // Current Date & Time string for live record display
  const now = new Date();
  const currentDateTimeFormatted = now.toLocaleDateString('hi-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }) + ' • ' + now.toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' });

  const outcomeOptions: Array<{ id: CollectionOutcome; label: string; desc: string }> = [
    {
      id: 'COLLECTED',
      label: 'भुगतान प्राप्त हुआ (Collected)',
      desc: 'नकद, यूपीआई या चेक से किस्त वसूली हुई',
    },
    {
      id: 'CUSTOMER_UNAVAILABLE',
      label: 'ग्राहक अनुपलब्ध (Unavailable)',
      desc: 'घर या दुकान पर उपस्थित नहीं मिले',
    },
    {
      id: 'REQUESTED_ANOTHER_TIME',
      label: 'अगली तारीख माँगी (Postponed)',
      desc: 'ग्राहक ने बाद में आने का समय दिया',
    },
    {
      id: 'CUSTOMER_DECLINED',
      label: 'भुगतान से मना किया (Declined)',
      desc: 'किस्त देने में असमर्थता या मना किया',
    },
    {
      id: 'COULD_NOT_BE_CONTACTED',
      label: 'संपर्क नहीं हो सका (Unreachable)',
      desc: 'फोन नहीं लगा या पता नहीं मिला',
    },
    {
      id: 'PAYMENT_ALREADY_MADE_DIRECT',
      label: 'बैंक में सीधे जमा किया (Paid Direct)',
      desc: 'ग्राहक का दावा: बैंक काउंटर पर जमा',
    },
  ];

  const handleQuickAdd = (addVal: number) => {
    const current = Number(amount) || 0;
    setAmount((current + addVal).toString());
  };

  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = validateCollectionEntry({
      customerId: selectedCustomerId,
      outcome,
      amount: outcome === 'COLLECTED' ? Number(amount) : 0,
      paymentMethod,
      idempotencyKey: `SUBMIT-${Date.now()}`,
    });

    if (!validation.isValid) {
      setError(validation.errors.join(', '));
      return;
    }

    setShowConfirm(true);
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    const idempotencyKey = `COL-SUBMIT-${selectedCustomerId}-${Date.now()}`;
    const res = await recordCollection({
      customerId: selectedCustomerId,
      amount: outcome === 'COLLECTED' ? Number(amount) : 0,
      expectedAmount: selectedCustomer?.installmentAmount || 0,
      paymentMethod,
      outcome,
      referenceNumber: referenceNumber.trim(),
      notes: notes.trim(),
      idempotencyKey,
    });

    setIsSubmitting(false);
    if (res.success) {
      onSuccess();
      onClose();
    } else {
      setError(res.error || 'रिकॉर्ड सहेजने में विफल');
      setShowConfirm(false);
    }
  };

  // Filtered customer list for quick dropdown
  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.rdAccountNumber.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.phone.includes(customerSearch)
  );

  return (
    <div className="fixed inset-0 bg-[#202124]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto font-sans">
      <div className="bg-white rounded-3xl max-w-lg w-full my-auto overflow-hidden shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
        {/* ========================================================== */}
        {/* TOP GOOGLE APP HEADER */}
        {/* ========================================================== */}
        <div className="bg-white px-5 pt-4 pb-3 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-full bg-[#1a73e8] text-white font-black flex items-center justify-center text-lg shadow-2xs">
              ₹
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#1f1f1f] tracking-tight">
                {t.recordPayment} (किस्त जमा)
              </h2>
              <p className="text-xs text-[#5f6368]">
                कलेक्टर: <span className="font-semibold text-[#1a73e8]">{currentUser.name}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-[#5f6368] hover:text-[#1f1f1f] transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Date & Time Banner (Google Material 3 Chip) */}
        <div className="bg-[#e8f0fe] px-5 py-2.5 border-b border-[#d2e3fc] flex items-center justify-between text-xs text-[#174ea6] font-semibold">
          <div className="flex items-center space-x-1.5">
            <Calendar className="w-4 h-4 text-[#1a73e8]" />
            <span>{currentDateTimeFormatted}</span>
          </div>
          <span className="text-[11px] bg-white text-[#1a73e8] px-2 py-0.5 rounded-full border border-blue-200 font-bold">
            लाइव प्रविष्टि
          </span>
        </div>

        {error && (
          <div className="bg-[#fce8e6] text-[#b3261e] p-3 text-xs flex items-center space-x-2 border-b border-[#fad2cf]">
            <AlertTriangle className="w-4 h-4 text-[#d93025] shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {/* ========================================================== */}
        {/* CONFIRMATION SCREEN (Google Material 3 Dialog) */}
        {/* ========================================================== */}
        {showConfirm ? (
          <div className="p-5 sm:p-6 space-y-4">
            <div className="p-4 bg-[#fef7e0] border border-[#feefc3] rounded-3xl space-y-3 text-xs sm:text-sm">
              <div className="flex items-center space-x-2 text-[#b06000] font-bold">
                <ShieldCheck className="w-5 h-5 text-[#f9ab00]" />
                <span className="text-sm font-extrabold">प्रविष्टि की अंतिम पुष्टि करें (Confirm)</span>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed">
                कृपया ध्यानपूर्वक जाँच करें। पुष्टि करने पर रसीद संख्या तुरंत जनरेट होगी।
              </p>

              {/* Prominent confirmation details */}
              <div className="pt-2 border-t border-amber-200/80 space-y-2 text-[#1f1f1f]">
                <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-amber-100">
                  <span className="text-gray-500 text-xs">ग्राहक नाम:</span>
                  <span className="font-bold text-sm">{selectedCustomer?.name}</span>
                </div>

                <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-amber-100">
                  <span className="text-gray-500 text-xs">RD खाता संख्या:</span>
                  <span className="font-mono font-extrabold text-[#1a73e8] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {selectedCustomer?.rdAccountNumber}
                  </span>
                </div>

                {outcome === 'COLLECTED' ? (
                  <>
                    <div className="flex justify-between items-center bg-[#e6f4ea] p-3 rounded-2xl border border-emerald-200">
                      <span className="text-[#137333] font-bold text-xs sm:text-sm">जमा की गई राशि:</span>
                      <span className="text-xl sm:text-2xl font-black text-[#137333]">
                        {formatINR(Number(amount))}
                      </span>
                    </div>

                    <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-amber-100 text-xs">
                      <span className="text-gray-500">भुगतान माध्यम:</span>
                      <span className="font-bold text-gray-800">
                        {paymentMethod === 'CASH' ? '💵 नकद (Cash)' : paymentMethod === 'UPI_QR' ? '📱 UPI / QR' : '🏦 बैंक / चेक'}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-amber-100 text-xs">
                    <span className="text-gray-500">स्थिति:</span>
                    <span className="font-bold text-[#d93025]">{outcome}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Google Pill Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="px-5 py-3 rounded-full text-xs sm:text-sm font-bold text-gray-600 hover:bg-gray-100 transition"
              >
                बदलाव करें (Back)
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFinalSubmit}
                className="px-6 py-3.5 rounded-full text-xs sm:text-sm font-bold bg-[#1e8e3e] hover:bg-[#137333] active:scale-98 text-white shadow-md shadow-emerald-600/20 transition cursor-pointer"
              >
                {isSubmitting ? 'दर्ज कर रहे हैं...' : '✓ पुष्टि करें व रसीद बनाएं'}
              </button>
            </div>
          </div>
        ) : (
          /* ========================================================== */
          /* MAIN COLLECTION FORM (Google Pay Style Friction-free UX) */
          /* ========================================================== */
          <form onSubmit={handlePreSubmit} className="p-4 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* 1. CUSTOMER & ACCOUNT NUMBER SELECTION */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#1f1f1f] uppercase tracking-wider">
                ग्राहक व खाता चुनें (Customer & Account) *
              </label>

              {/* Customer Selector Dropdown */}
              <div className="relative">
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full bg-[#f8f9fa] hover:bg-[#f1f3f4] border border-gray-300 rounded-2xl px-4 py-3 text-sm text-[#1f1f1f] font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1a73e8] cursor-pointer transition"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} • खाता: {c.rdAccountNumber} • {formatINR(c.installmentAmount)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Customer Hero Card: Shows Name, Account Number, Bank */}
              {selectedCustomer && (
                <div className="mt-2 p-3.5 rounded-2xl bg-[#f8fafd] border border-blue-200/80 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-bold text-[#1f1f1f] text-sm truncate">
                      {selectedCustomer.name}
                    </div>
                    <div className="text-xs text-[#5f6368] mt-0.5">
                      {selectedCustomer.bankName} • {selectedCustomer.locality}
                    </div>
                  </div>
                  {/* Account Number in Prominent Google Pill */}
                  <div className="text-right shrink-0">
                    <span className="font-mono text-xs font-black bg-[#e8f0fe] text-[#1a73e8] border border-[#d2e3fc] px-2.5 py-1 rounded-xl block">
                      {selectedCustomer.rdAccountNumber}
                    </span>
                    <span className="text-[10px] text-gray-400 mt-0.5 block">खाता संख्या</span>
                  </div>
                </div>
              )}
            </div>

            {/* 2. AMOUNT INPUT: GIANT GOOGLE PAY STYLE */}
            {outcome === 'COLLECTED' && (
              <div className="p-4 bg-[#f8f9fa] rounded-3xl border border-gray-200/90 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-[#1f1f1f] uppercase tracking-wider">
                    जमा राशि (Amount) *
                  </label>
                  <span className="text-xs text-gray-500 font-medium">
                    निर्धारित: <span className="font-bold text-[#1a73e8]">{formatINR(selectedCustomer?.installmentAmount || 0)}</span>
                  </span>
                </div>

                {/* Giant Numeric Amount Display */}
                <div className="relative">
                  <span className="absolute left-4 top-3 text-2xl font-bold text-gray-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    required
                    min="1"
                    step="10"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-white border-2 border-[#1a73e8] rounded-2xl pl-10 pr-4 py-3 text-2xl sm:text-3xl font-black text-[#1a73e8] focus:outline-none focus:ring-4 focus:ring-blue-500/20 shadow-xs"
                    aria-label="Amount in Rupees"
                  />
                </div>

                {/* Quick 1-Tap Preset Buttons (Senior-friendly touch targets) */}
                <div className="grid grid-cols-4 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleQuickAdd(100)}
                    className="py-2 px-2 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 transition cursor-pointer"
                  >
                    +₹100
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAdd(500)}
                    className="py-2 px-2 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 transition cursor-pointer"
                  >
                    +₹500
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAdd(1000)}
                    className="py-2 px-2 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 transition cursor-pointer"
                  >
                    +₹1,000
                  </button>
                  <button
                    type="button"
                    onClick={() => setAmount((selectedCustomer?.installmentAmount || 1000).toString())}
                    className="py-2 px-2 bg-[#e8f0fe] hover:bg-[#d2e3fc] border border-[#d2e3fc] rounded-xl text-xs font-bold text-[#1a73e8] transition cursor-pointer"
                  >
                    पूरी किस्त
                  </button>
                </div>
              </div>
            )}

            {/* 3. PAYMENT METHOD SELECTION (Large Google Pills) */}
            {outcome === 'COLLECTED' && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#1f1f1f] uppercase tracking-wider">
                  भुगतान माध्यम (Payment Mode) *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CASH')}
                    className={`py-3 px-3 rounded-2xl border-2 font-bold text-xs flex flex-col items-center justify-center transition cursor-pointer ${
                      paymentMethod === 'CASH'
                        ? 'border-[#1e8e3e] bg-[#e6f4ea] text-[#137333] shadow-xs'
                        : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <span className="text-lg mb-0.5">💵</span>
                    <span>नकद (Cash)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('UPI_QR')}
                    className={`py-3 px-3 rounded-2xl border-2 font-bold text-xs flex flex-col items-center justify-center transition cursor-pointer ${
                      paymentMethod === 'UPI_QR'
                        ? 'border-[#1a73e8] bg-[#e8f0fe] text-[#174ea6] shadow-xs'
                        : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <span className="text-lg mb-0.5">📱</span>
                    <span>UPI / QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CHEQUE')}
                    className={`py-3 px-3 rounded-2xl border-2 font-bold text-xs flex flex-col items-center justify-center transition cursor-pointer ${
                      paymentMethod === 'CHEQUE'
                        ? 'border-[#7b1fa2] bg-[#f3e8fd] text-[#4a148c] shadow-xs'
                        : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <span className="text-lg mb-0.5">🏦</span>
                    <span>चेक / बैंक</span>
                  </button>
                </div>

                {/* Reference Number / UTR Input if UPI or Cheque */}
                {paymentMethod !== 'CASH' && (
                  <div className="pt-2">
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                      UTR / ट्रांजेक्शन रिफरेंस नंबर (वैकल्पिक)
                    </label>
                    <input
                      type="text"
                      placeholder="उदा. UPI 938210482910"
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                      className="w-full bg-[#f8f9fa] border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1a73e8]"
                    />
                  </div>
                )}
              </div>
            )}

            {/* 4. NON-ESSENTIAL OUTCOMES TOGGLE (Kept inside so standard collections are simple) */}
            <div className="pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowAlternativeOutcomes(!showAlternativeOutcomes)}
                className="w-full flex items-center justify-between text-xs font-semibold text-gray-500 hover:text-gray-800 py-1 cursor-pointer"
              >
                <span>भुगतान प्राप्त नहीं हुआ? (अन्य कारण दर्ज करें)</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${showAlternativeOutcomes ? 'rotate-180' : ''}`}
                />
              </button>

              {showAlternativeOutcomes && (
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                  {outcomeOptions.map((opt) => (
                    <div
                      key={opt.id}
                      onClick={() => setOutcome(opt.id)}
                      className={`p-2.5 rounded-xl border-2 cursor-pointer transition text-xs ${
                        outcome === opt.id
                          ? 'border-[#1a73e8] bg-[#e8f0fe] font-bold text-[#174ea6]'
                          : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{opt.label}</span>
                        {outcome === opt.id && <Check className="w-3.5 h-3.5 text-[#1a73e8]" />}
                      </div>
                      <p className="text-[10px] text-gray-500 mt-0.5">{opt.desc}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notes Field */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                विशेष टिप्पणी (Notes - वैकल्पिक)
              </label>
              <input
                type="text"
                placeholder="उदा. ग्राहक ने अगली बार 2 किस्तें देने को कहा"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-[#f8f9fa] border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1a73e8]"
              />
            </div>

            {/* 5. FOOTER ACTION BUTTONS (Large Google Rounded Pills) */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 rounded-full text-xs sm:text-sm font-bold text-gray-600 hover:bg-gray-100 transition cursor-pointer"
              >
                रद्द करें (Cancel)
              </button>
              <button
                type="submit"
                className="flex-1 sm:flex-initial px-7 py-3.5 rounded-full text-xs sm:text-sm font-bold bg-[#1a73e8] hover:bg-[#1557b0] active:scale-98 text-white shadow-md shadow-blue-500/20 transition cursor-pointer"
              >
                {outcome === 'COLLECTED' ? '✓ पैसे जमा दर्ज करें' : 'स्थिति सहेजें'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

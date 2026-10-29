import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatINR, calculateDailyStats } from '../lib/collectionRules';
import { Customer, Collection } from '../types';
import { ReceiptModal } from './ReceiptModal';
import {
  Play,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  HandCoins,
  BellRing,
  UserPlus,
  ShieldCheck,
  Building,
  ChevronRight,
  ChevronDown,
  Receipt,
  ChevronLeft,
  Glasses
} from 'lucide-react';

export const DashboardView: React.FC<{
  onStartRoute: () => void;
  onOpenRecordModal: () => void;
  onOpenAddCustomer: () => void;
  onOpenHandover: () => void;
  onOpenReports: () => void;
  onOpenReminders: () => void;
}> = ({
  onStartRoute,
  onOpenRecordModal,
  onOpenAddCustomer,
  onOpenHandover,
  onOpenReports,
  onOpenReminders,
}) => {
  const {
    t,
    customers,
    collections,
    users,
    currentUser,
    selectedDate,
    setSelectedDate,
    agency,
    setActiveTab,
    seniorMode,
    toggleSeniorMode,
  } = useApp();

  const [showAdvancedDetails, setShowAdvancedDetails] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<{
    customer: Customer;
    collection: Collection;
  } | null>(null);

  const schedules = customers.map((c) => ({
    id: `SCH-${c.id}`,
    customerId: c.id,
    installmentAmount: c.installmentAmount,
    scheduledDay: c.scheduledDay,
    status: c.status,
  }));

  const stats = calculateDailyStats({
    todayStr: selectedDate,
    customers,
    schedules,
    collections,
  });

  // Calculate day-shift helpers (Previous Day, Today, Next Day) for senior accessibility
  const handleShiftDate = (days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const handleSetToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  // Formatted date string for senior-friendly readability
  const selectedDateObj = new Date(selectedDate);
  const fullHindiDate = selectedDateObj.toLocaleDateString('hi-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Today's collections for the selected date
  const todayCollections = collections.filter(
    (c) =>
      c.collectedAt.startsWith(selectedDate.substring(0, 10)) &&
      c.outcome === 'COLLECTED' &&
      c.status !== 'REVERSED'
  );

  const currentDay = selectedDateObj.getDate();
  const overdueCustomers = customers.filter((c) => {
    if (c.status !== 'ACTIVE' || c.scheduledDay === 0) return false;
    if (c.scheduledDay < currentDay) {
      const hasVerified = collections.some(
        (col) =>
          col.customerId === c.id &&
          col.outcome === 'COLLECTED' &&
          col.status === 'VERIFIED' &&
          col.collectedAt.startsWith(selectedDate.substring(0, 7))
      );
      return !hasVerified;
    }
    return false;
  });

  const totalOverdueAmount = overdueCustomers.reduce((sum, c) => sum + c.installmentAmount, 0);

  return (
    <div className={`space-y-4 pb-24 font-sans ${seniorMode ? 'text-base' : 'text-sm'}`}>
      {/* ============================================================== */}
      {/* 1. PRIMARY HERO CARD: DATE, TIME, AND BIG REVENUE FOCUS */}
      {/* ============================================================== */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200/90 shadow-sm relative overflow-hidden">
        {/* Top Header: Agency & Date Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 bg-[#e8f0fe] text-[#1a73e8] text-xs px-3 py-1 rounded-full font-semibold mb-1">
              <Building className="w-3.5 h-3.5 text-[#1a73e8]" />
              <span>{agency?.name || 'HDBI Agency'}</span>
            </div>
            {/* Prominent Hindi Date for Senior Citizens */}
            <div className="flex items-center space-x-2 mt-0.5">
              <Calendar className="w-5 h-5 text-[#1a73e8] shrink-0" />
              <h1 className="text-lg sm:text-2xl font-black text-[#1f1f1f] tracking-tight">
                {fullHindiDate}
              </h1>
            </div>
          </div>

          {/* Quick Date Switcher - Senior Friendly Touch Buttons */}
          <div className="flex items-center space-x-1.5 bg-[#f1f3f4] p-1 rounded-full border border-gray-200 self-start sm:self-auto">
            <button
              onClick={() => handleShiftDate(-1)}
              className="p-2 rounded-full hover:bg-gray-200 text-gray-700 transition"
              title="पिछला दिन (Previous Day)"
              aria-label="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleSetToday}
              className={`px-3 py-1 text-xs font-bold rounded-full transition ${
                isToday ? 'bg-[#1a73e8] text-white shadow-2xs' : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              आज (Today)
            </button>
            <button
              onClick={() => handleShiftDate(1)}
              className="p-2 rounded-full hover:bg-gray-200 text-gray-700 transition"
              title="अगला दिन (Next Day)"
              aria-label="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            {/* Native Date Input Icon */}
            <div className="relative pl-1 pr-2 border-l border-gray-300">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="opacity-0 absolute inset-0 cursor-pointer w-full h-full"
                aria-label="Custom Date Picker"
              />
              <Calendar className="w-4 h-4 text-[#1a73e8] cursor-pointer" />
            </div>
          </div>
        </div>

        {/* AMOUNT HIGHLIGHT: GIANT BOLD AMOUNT FOR HIGH READABILITY */}
        <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <div>
            <div className="text-xs sm:text-sm font-semibold text-[#5f6368] uppercase tracking-wider flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1e8e3e]" />
              <span>आज की कुल वसूली (Total Collected)</span>
            </div>
            {/* Very large amount for elderly users */}
            <div className="text-3xl sm:text-4xl font-black text-[#137333] tracking-tight mt-1">
              {formatINR(stats.totalCollectedToday)}
            </div>
            <div className="text-xs text-[#5f6368] font-medium mt-1">
              कुल निर्धारित: <span className="font-bold text-[#1f1f1f]">{formatINR(stats.expectedCollectionToday)}</span> • {stats.scheduledTodayCount} ग्राहक देय
            </div>
          </div>

          {/* Senior-Friendly Quick Action Buttons (Big, High Contrast) */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={onOpenRecordModal}
              className="flex-1 flex items-center justify-center space-x-2 bg-[#1a73e8] hover:bg-[#1557b0] active:scale-98 text-white font-bold text-sm sm:text-base py-3.5 px-5 rounded-full shadow-md shadow-blue-500/20 transition cursor-pointer"
              aria-label="सीधा कलेक्शन दर्ज करें"
            >
              <HandCoins className="w-5 h-5 stroke-[2.5]" />
              <span>पैसे जमा करें (कलेक्शन)</span>
            </button>
            <button
              onClick={onStartRoute}
              className="flex items-center justify-center space-x-1.5 bg-[#f1f3f4] hover:bg-[#e8eaed] active:scale-98 text-[#1f1f1f] font-bold text-xs sm:text-sm py-3 px-4 rounded-full border border-gray-200 transition cursor-pointer"
              aria-label="आज का रूट देखें"
            >
              <Play className="w-4 h-4 fill-[#1a73e8] text-[#1a73e8]" />
              <span>रूट देखें</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. STATS SUMMARY: CLEAR CARDS (AMOUNT & CUSTOMER NUMBERS) */}
      {/* ============================================================== */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        {/* Verified Collected */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-emerald-200 shadow-2xs bg-gradient-to-b from-white to-[#f6fbf7]">
          <div className="flex items-center justify-between text-[#137333] text-xs font-bold">
            <span>सत्यापित राशि</span>
            <CheckCircle2 className="w-4 h-4 text-[#1e8e3e]" />
          </div>
          <div className="text-lg sm:text-2xl font-black text-[#137333] mt-1 truncate">
            {formatINR(stats.verifiedCollectedToday)}
          </div>
          <div className="text-[11px] text-[#137333] mt-0.5">बैंक से सत्यापित</div>
        </div>

        {/* Pending Verification */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-amber-200 shadow-2xs bg-gradient-to-b from-white to-[#fefcf6]">
          <div className="flex items-center justify-between text-[#b06000] text-xs font-bold">
            <span>जाँच शेष राशि</span>
            <Clock className="w-4 h-4 text-[#f9ab00]" />
          </div>
          <div className="text-lg sm:text-2xl font-black text-[#b06000] mt-1 truncate">
            {formatINR(stats.pendingVerificationToday)}
          </div>
          <div className="text-[11px] text-[#b06000] mt-0.5">मिलान प्रतीक्षित</div>
        </div>

        {/* Due Balance */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-blue-200 shadow-2xs bg-gradient-to-b from-white to-[#f8fafd]">
          <div className="flex items-center justify-between text-[#1a73e8] text-xs font-bold">
            <span>वसूली शेष</span>
            <Calendar className="w-4 h-4 text-[#1a73e8]" />
          </div>
          <div className="text-lg sm:text-2xl font-black text-[#1a73e8] mt-1 truncate">
            {formatINR(Math.max(0, stats.expectedCollectionToday - stats.totalCollectedToday))}
          </div>
          <div className="text-[11px] text-[#1a73e8] mt-0.5">आज बकाया</div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. FOUR ESSENTIAL QUICK ACTIONS (Google Pay Style Large Touch) */}
      {/* ============================================================== */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-gray-200/90 shadow-2xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#5f6368] mb-3">
          {t.quickActions}
        </h2>
        <div className="grid grid-cols-4 gap-2 text-center">
          <button
            onClick={onOpenRecordModal}
            className="flex flex-col items-center group cursor-pointer p-1"
          >
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#e8f0fe] group-hover:bg-[#d2e3fc] text-[#1a73e8] flex items-center justify-center transition-all duration-200 shadow-2xs group-hover:scale-105 mb-1.5">
              <HandCoins className="w-6 h-6 stroke-[2.2]" />
            </div>
            <span className="text-xs font-bold text-[#1f1f1f] group-hover:text-[#1a73e8] transition">
              {t.recordPayment}
            </span>
          </button>

          <button
            onClick={onOpenAddCustomer}
            className="flex flex-col items-center group cursor-pointer p-1"
          >
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#f1f3f4] group-hover:bg-[#e8eaed] text-[#444746] flex items-center justify-center transition-all duration-200 shadow-2xs group-hover:scale-105 mb-1.5">
              <UserPlus className="w-6 h-6 stroke-[2.2]" />
            </div>
            <span className="text-xs font-bold text-[#1f1f1f] group-hover:text-gray-900 transition">
              {t.addCustomer}
            </span>
          </button>

          <button
            onClick={onOpenHandover}
            className="flex flex-col items-center group cursor-pointer p-1"
          >
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#e6f4ea] group-hover:bg-[#ceead6] text-[#1e8e3e] flex items-center justify-center transition-all duration-200 shadow-2xs group-hover:scale-105 mb-1.5">
              <TrendingUp className="w-6 h-6 stroke-[2.2]" />
            </div>
            <span className="text-xs font-bold text-[#1f1f1f] group-hover:text-[#1e8e3e] transition">
              कैश जमा
            </span>
          </button>

          <button
            onClick={onOpenReminders}
            className="flex flex-col items-center group cursor-pointer p-1"
          >
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#fef7e0] group-hover:bg-[#feefc3] text-[#b06000] flex items-center justify-center transition-all duration-200 shadow-2xs group-hover:scale-105 mb-1.5">
              <BellRing className="w-6 h-6 stroke-[2.2]" />
            </div>
            <span className="text-xs font-bold text-[#1f1f1f] group-hover:text-[#b06000] transition">
              तगादा सूची
            </span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. TODAY'S RECENT COLLECTIONS STREAM: DATE, TIME, A/C NO, AMOUNT */}
      {/* ============================================================== */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-200/90 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
          <div className="flex items-center space-x-2">
            <h2 className="text-sm sm:text-base font-bold text-[#1f1f1f] tracking-tight">
              आज की हालिया वसूली लेन-देन (Today's Collections)
            </h2>
            <span className="text-xs font-bold bg-[#e8f0fe] text-[#1a73e8] px-2 py-0.5 rounded-full">
              {todayCollections.length}
            </span>
          </div>
          <button
            onClick={() => setActiveTab('customers')}
            className="text-xs font-bold text-[#1a73e8] hover:underline"
          >
            सभी ग्राहक देखें →
          </button>
        </div>

        {todayCollections.length === 0 ? (
          <div className="text-center py-7 px-4 bg-[#f8f9fa] rounded-2xl border border-gray-200/70">
            <HandCoins className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-gray-700">आज अभी तक कोई वसूली दर्ज नहीं हुई है</p>
            <p className="text-xs text-gray-400 mt-0.5">
              "पैसे जमा करें" बटन दबाकर तुरंत पहली किस्त वसूली दर्ज करें।
            </p>
            <button
              onClick={onOpenRecordModal}
              className="mt-3 inline-flex items-center space-x-1.5 px-4 py-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white font-bold text-xs rounded-full shadow-2xs transition"
            >
              <HandCoins className="w-4 h-4" />
              <span>कलेक्शन दर्ज करें</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {todayCollections.map((col) => {
              const cust = customers.find((c) => c.id === col.customerId);
              if (!cust) return null;

              // Format collection time
              const timeFormatted = new Date(col.collectedAt).toLocaleTimeString('hi-IN', {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={col.id}
                  className="p-3 sm:p-3.5 rounded-2xl border border-gray-200/90 bg-[#fbfcfd] hover:bg-white hover:border-[#1a73e8] transition flex items-center justify-between gap-3 shadow-2xs"
                >
                  {/* Left: Customer Name, Account Number, Date/Time */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center space-x-2 flex-wrap">
                      <span className="font-black text-[#1f1f1f] text-sm sm:text-base truncate">
                        {cust.name}
                      </span>
                      {/* Customer Account Number - High Contrast Badge */}
                      <span className="font-mono text-xs font-extrabold bg-[#e8f0fe] text-[#1a73e8] border border-[#d2e3fc] px-2 py-0.5 rounded-md">
                        खाता सं.: {cust.rdAccountNumber}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-xs text-[#5f6368] flex-wrap">
                      {/* Date & Time Stamp */}
                      <span className="inline-flex items-center space-x-1 font-semibold text-gray-700">
                        <Clock className="w-3.5 h-3.5 text-[#1a73e8]" />
                        <span>{timeFormatted}</span>
                      </span>
                      <span>•</span>
                      <span>{cust.bankName}</span>
                      <span>•</span>
                      <span className="font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                        {col.paymentMethod === 'CASH' ? '💵 नकद' : col.paymentMethod === 'UPI_QR' ? '📱 UPI' : col.paymentMethod}
                      </span>
                    </div>
                  </div>

                  {/* Right: Amount & Instant Receipt Button */}
                  <div className="text-right shrink-0 flex flex-col items-end space-y-1.5">
                    {/* Amount - Large, Bold, Green */}
                    <div className="text-base sm:text-lg font-black text-[#137333]">
                      +{formatINR(col.amount)}
                    </div>
                    {/* 1-Tap Receipt Button */}
                    <button
                      onClick={() => setSelectedReceipt({ customer: cust, collection: col })}
                      className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-white hover:bg-blue-50 text-[#1a73e8] border border-blue-200 text-xs font-bold shadow-2xs transition active:scale-95 cursor-pointer"
                      title="रसीद पर्ची देखें"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>रसीद पर्ची</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 5. OVERDUE ALERT BANNER (If any overdue exists) */}
      {/* ============================================================== */}
      {overdueCustomers.length > 0 && (
        <div className="bg-[#fce8e6] border border-[#fad2cf] rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-[#d93025] shrink-0" />
            <div>
              <div className="text-xs sm:text-sm font-bold text-[#b3261e]">
                {overdueCustomers.length} {t.overdueInstallments} ({formatINR(totalOverdueAmount)})
              </div>
              <p className="text-[11px] text-[#601410] mt-0.5">
                किस्त की तारीख बीत चुकी है। कृपया प्राथमिकता दें।
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('tasks')}
            className="text-xs font-bold bg-[#d93025] text-white px-3 py-1.5 rounded-full hover:bg-[#b3261e] shrink-0 ml-2 transition"
          >
            देखें →
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. NON-ESSENTIAL FEATURES COLLAPSIBLE (Kept inside for seniors) */}
      {/* ============================================================== */}
      <div className="bg-white rounded-3xl border border-gray-200/90 shadow-2xs overflow-hidden">
        <button
          onClick={() => setShowAdvancedDetails(!showAdvancedDetails)}
          className="w-full px-5 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition text-left cursor-pointer"
          aria-expanded={showAdvancedDetails}
        >
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-[#1a73e8]" />
            <span className="text-xs sm:text-sm font-bold text-[#1f1f1f]">
              अतिरिक्त रिपोर्ट्स व कर्मचारी विवरण (विस्तृत जानकारी)
            </span>
          </div>
          <div className="flex items-center space-x-1.5 text-xs text-[#5f6368] font-medium">
            <span>{showAdvancedDetails ? 'छुपाएं' : 'देखें'}</span>
            {showAdvancedDetails ? (
              <ChevronDown className="w-4 h-4 text-gray-600 rotate-180 transition-transform" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-600 transition-transform" />
            )}
          </div>
        </button>

        {showAdvancedDetails && (
          <div className="p-4 sm:p-5 space-y-4 border-t border-gray-200">
            {/* Field Outcomes Status Counters */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#5f6368] mb-2.5">
                दैनिक फील्ड स्थिति (Field Outcomes)
              </h3>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="bg-[#f8f9fa] p-2.5 rounded-2xl border border-gray-200">
                  <div className="text-sm font-bold text-gray-900">{stats.notContactedCount}</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">{t.uncontactedCust}</div>
                </div>
                <div className="bg-[#fef7e0]/60 p-2.5 rounded-2xl border border-[#feefc3]">
                  <div className="text-sm font-bold text-[#b06000]">{stats.unavailableCount}</div>
                  <div className="text-[10px] text-[#b06000] mt-0.5">{t.unavailableCust}</div>
                </div>
                <div className="bg-[#e8f0fe]/60 p-2.5 rounded-2xl border border-[#d2e3fc]">
                  <div className="text-sm font-bold text-[#1a73e8]">{stats.postponedCount}</div>
                  <div className="text-[10px] text-[#1a73e8] mt-0.5">{t.postponedCust}</div>
                </div>
                <div className="bg-[#fce8e6]/60 p-2.5 rounded-2xl border border-[#fad2cf]">
                  <div className="text-sm font-bold text-[#d93025]">{stats.declinedCount}</div>
                  <div className="text-[10px] text-[#d93025] mt-0.5">{t.declinedCust}</div>
                </div>
              </div>
            </div>

            {/* Staff Targets Progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#5f6368]">
                  कर्मचारी दैनिक लक्ष्य (Staff Targets)
                </h3>
                <button
                  onClick={onOpenReports}
                  className="text-xs font-semibold text-[#1a73e8] hover:underline"
                >
                  विस्तृत रिपोर्ट →
                </button>
              </div>

              <div className="space-y-2">
                {users
                  .filter((u) => u.role === 'AGENT')
                  .map((agent) => {
                    const agentCollections = collections.filter(
                      (c) =>
                        c.employeeId === agent.id &&
                        c.collectedAt.startsWith(selectedDate.substring(0, 10)) &&
                        c.outcome === 'COLLECTED' &&
                        c.status !== 'REVERSED'
                    );
                    const collectedTotal = agentCollections.reduce((sum, c) => sum + c.amount, 0);
                    const target = agent.dailyTarget || 15000;
                    const pct = Math.min(100, Math.round((collectedTotal / target) * 100));

                    return (
                      <div key={agent.id} className="p-3 rounded-2xl bg-[#f8f9fa] border border-gray-200">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[#1f1f1f]">{agent.name}</span>
                          <span className="font-semibold text-gray-700">
                            {formatINR(collectedTotal)} / {formatINR(target)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mt-1.5">
                          <div
                            className="bg-[#1e8e3e] h-full rounded-full transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-gray-500 mt-1">
                          <span>इलाका: {agent.assignedLocalities.join(', ')}</span>
                          <span className="font-bold text-[#1e8e3e]">{pct}% पूर्ण</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Payment Mode Split */}
            {stats.totalCollectedToday > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#5f6368] mb-2">
                  भुगतान माध्यम विभाजन (Payment Mode Split)
                </h3>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-2xl bg-[#e6f4ea] border border-[#ceead6]">
                    <span className="text-[10px] text-[#137333] font-bold block">नकद (Cash)</span>
                    <span className="font-bold text-sm text-[#0d652d] mt-0.5 block">
                      {formatINR(
                        collections
                          .filter((c) => c.collectedAt.startsWith(selectedDate.substring(0, 10)) && c.paymentMethod === 'CASH' && c.outcome === 'COLLECTED' && c.status !== 'REVERSED')
                          .reduce((s, c) => s + c.amount, 0)
                      )}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-[#e8f0fe] border border-[#d2e3fc]">
                    <span className="text-[10px] text-[#1a73e8] font-bold block">UPI / QR</span>
                    <span className="font-bold text-sm text-[#174ea6] mt-0.5 block">
                      {formatINR(
                        collections
                          .filter((c) => c.collectedAt.startsWith(selectedDate.substring(0, 10)) && c.paymentMethod === 'UPI_QR' && c.outcome === 'COLLECTED' && c.status !== 'REVERSED')
                          .reduce((s, c) => s + c.amount, 0)
                      )}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-2xl bg-[#f3e8fd] border border-[#e1bee7]">
                    <span className="text-[10px] text-[#7b1fa2] font-bold block">चेक / ट्रांसफर</span>
                    <span className="font-bold text-sm text-[#4a148c] mt-0.5 block">
                      {formatINR(
                        collections
                          .filter((c) => c.collectedAt.startsWith(selectedDate.substring(0, 10)) && (c.paymentMethod === 'CHEQUE' || c.paymentMethod === 'BANK_TRANSFER') && c.outcome === 'COLLECTED' && c.status !== 'REVERSED')
                          .reduce((s, c) => s + c.amount, 0)
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 7. RECEIPT MODAL POPUP TRIGGER */}
      {/* ============================================================== */}
      {selectedReceipt && (
        <ReceiptModal
          customer={selectedReceipt.customer}
          collection={selectedReceipt.collection}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </div>
  );
};

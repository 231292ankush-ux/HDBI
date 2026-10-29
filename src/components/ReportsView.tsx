import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatINR } from '../lib/collectionRules';
import {
  FileText,
  Printer,
  FileDown,
  Calendar,
  Users,
  Building,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Receipt
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { collections, customers, users, handovers, selectedDate, setSelectedDate, agency, t } = useApp();

  const [reportType, setReportType] = useState<
    'DAILY_COLLECTION' | 'STAFF_PERFORMANCE' | 'CASH_RECONCILIATION' | 'OVERDUE_SUMMARY'
  >('DAILY_COLLECTION');

  const todayCollections = collections.filter(
    (c) => c.collectedAt.startsWith(selectedDate.substring(0, 10)) && c.status !== 'REVERSED'
  );

  const totalCollectedToday = todayCollections
    .filter((c) => c.outcome === 'COLLECTED')
    .reduce((sum, c) => sum + c.amount, 0);

  const verifiedToday = todayCollections
    .filter((c) => c.outcome === 'COLLECTED' && c.status === 'VERIFIED')
    .reduce((sum, c) => sum + c.amount, 0);

  const pendingToday = todayCollections
    .filter((c) => c.outcome === 'COLLECTED' && (c.status === 'RECORDED' || c.status === 'SUBMITTED'))
    .reduce((sum, c) => sum + c.amount, 0);

  // Print Report Handler
  const handlePrint = () => {
    window.print();
  };

  // Export CSV Handler
  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: any[][] = [];

    if (reportType === 'DAILY_COLLECTION') {
      headers = ['Collection ID', 'Customer Name', 'Bank', 'Amount', 'Method', 'Outcome', 'Status', 'Agent', 'Time'];
      rows = todayCollections.map((c) => {
        const cust = customers.find((x) => x.id === c.customerId);
        const agent = users.find((x) => x.id === c.employeeId);
        return [
          c.id,
          `"${cust?.name || c.customerId}"`,
          `"${cust?.bankName || ''}"`,
          c.amount,
          c.paymentMethod,
          c.outcome,
          c.status,
          `"${agent?.name || ''}"`,
          `"${c.collectedAt}"`,
        ];
      });
    } else {
      headers = ['Agent ID', 'Name', 'Role', 'Assigned Customers', 'Target', 'Collected Today'];
      rows = users
        .filter((u) => u.role === 'AGENT')
        .map((u) => {
          const uCols = todayCollections.filter((c) => c.employeeId === u.id && c.outcome === 'COLLECTED');
          const sum = uCols.reduce((s, c) => s + c.amount, 0);
          return [u.id, `"${u.name}"`, u.role, customers.filter((c) => c.assignedEmployeeId === u.id).length, u.dailyTarget, sum];
        });
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hdbi_${reportType.toLowerCase()}_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 pb-24 print:p-0 print:m-0">
      {/* Title & Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-700" />
            <span>{t.reportsTitle} (Financial & Operational Reports)</span>
          </h1>
          <p className="text-xs text-slate-500">
            दैनिक व कर्मचारी-वार प्रमाणित वित्तीय विवरण व लेखा परीक्षण
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
          />
          <button
            onClick={handlePrint}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center space-x-1"
            title="Print / Save PDF"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">प्रिंट / PDF</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold flex items-center space-x-1 border border-blue-200"
            title="Export CSV"
          >
            <FileDown className="w-4 h-4" />
            <span className="hidden sm:inline">CSV</span>
          </button>
        </div>
      </div>

      {/* Report Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-slate-200/80 p-1 rounded-xl text-xs font-semibold print:hidden">
        <button
          onClick={() => setReportType('DAILY_COLLECTION')}
          className={`py-2 px-2.5 rounded-lg text-center transition ${
            reportType === 'DAILY_COLLECTION' ? 'bg-white text-blue-900 shadow-xs font-bold' : 'text-slate-600'
          }`}
        >
          दैनिक कलेक्शन
        </button>
        <button
          onClick={() => setReportType('STAFF_PERFORMANCE')}
          className={`py-2 px-2.5 rounded-lg text-center transition ${
            reportType === 'STAFF_PERFORMANCE' ? 'bg-white text-blue-900 shadow-xs font-bold' : 'text-slate-600'
          }`}
        >
          कर्मचारी प्रदर्शन
        </button>
        <button
          onClick={() => setReportType('CASH_RECONCILIATION')}
          className={`py-2 px-2.5 rounded-lg text-center transition ${
            reportType === 'CASH_RECONCILIATION' ? 'bg-white text-blue-900 shadow-xs font-bold' : 'text-slate-600'
          }`}
        >
          कैश मिलान
        </button>
        <button
          onClick={() => setReportType('OVERDUE_SUMMARY')}
          className={`py-2 px-2.5 rounded-lg text-center transition ${
            reportType === 'OVERDUE_SUMMARY' ? 'bg-white text-blue-900 shadow-xs font-bold' : 'text-slate-600'
          }`}
        >
          बकाया किस्तें
        </button>
      </div>

      {/* Official Report Document Container */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 print:border-none print:shadow-none print:p-0">
        {/* Report Header */}
        <div className="border-b pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="text-xs uppercase tracking-wider font-extrabold text-blue-900">
              {agency?.name || 'HDBI Banking Services Agency'}
            </div>
            <h2 className="text-lg font-black text-slate-900 mt-0.5">
              {reportType === 'DAILY_COLLECTION' && 'दैनिक RD कलेक्शन विवरण रिपोर्ट'}
              {reportType === 'STAFF_PERFORMANCE' && 'कर्मचारी-वार कलेक्शन व फील्ड परफॉर्मेंस रिपोर्ट'}
              {reportType === 'CASH_RECONCILIATION' && 'दैनिक कैश हैंडओवर व मिलान रिपोर्ट'}
              {reportType === 'OVERDUE_SUMMARY' && 'बकाया RD किस्तें व फॉलो-अप रिपोर्ट'}
            </h2>
            <p className="text-xs text-slate-500">
              तारीख: <strong>{selectedDate}</strong> • जनरेट समय: {new Date().toLocaleTimeString('hi-IN')}
            </p>
          </div>

          <div className="text-right text-xs">
            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono text-[11px]">
              स्थिति: प्रमाणित (Certified Record)
            </span>
          </div>
        </div>

        {/* Totals Summary Ribbon */}
        <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border text-xs">
          <div>
            <span className="text-slate-400 block text-[10px]">कुल दर्ज कलेक्शन</span>
            <span className="font-extrabold text-base text-slate-900">
              {formatINR(totalCollectedToday)}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">सत्यापित (Verified)</span>
            <span className="font-extrabold text-base text-emerald-700">
              {formatINR(verifiedToday)}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">पुष्टि प्रतीक्षित (Pending)</span>
            <span className="font-extrabold text-base text-amber-700">
              {formatINR(pendingToday)}
            </span>
          </div>
        </div>

        {/* Report Tables */}
        {reportType === 'DAILY_COLLECTION' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b bg-slate-50 text-slate-600 font-bold">
                  <th className="py-2.5 px-3">आईडी</th>
                  <th className="py-2.5 px-3">ग्राहक का नाम</th>
                  <th className="py-2.5 px-3">बैंक व खाता</th>
                  <th className="py-2.5 px-3 text-right">राशि (₹)</th>
                  <th className="py-2.5 px-3">माध्यम</th>
                  <th className="py-2.5 px-3">कलेक्टर एजेंट</th>
                  <th className="py-2.5 px-3">स्थिति</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {todayCollections.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-slate-400">
                      इस तारीख के लिए कोई प्रविष्टि नहीं है।
                    </td>
                  </tr>
                ) : (
                  todayCollections.map((c) => {
                    const cust = customers.find((x) => x.id === c.customerId);
                    const agent = users.find((x) => x.id === c.employeeId);
                    return (
                      <tr key={c.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">{c.id}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{cust?.name || c.customerId}</td>
                        <td className="py-2.5 px-3 text-slate-500">
                          {cust?.bankName} ({cust?.rdAccountNumber})
                        </td>
                        <td className="py-2.5 px-3 font-black text-right text-blue-900">
                          {formatINR(c.amount)}
                        </td>
                        <td className="py-2.5 px-3">{c.paymentMethod}</td>
                        <td className="py-2.5 px-3 text-slate-700">{agent?.name}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              c.status === 'VERIFIED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'STAFF_PERFORMANCE' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b bg-slate-50 text-slate-600 font-bold">
                  <th className="py-2.5 px-3">कर्मचारी</th>
                  <th className="py-2.5 px-3">इलाका</th>
                  <th className="py-2.5 px-3 text-center">सौंपे गए ग्राहक</th>
                  <th className="py-2.5 px-3 text-right">दैनिक लक्ष्य</th>
                  <th className="py-2.5 px-3 text-right">आज एकत्रित राशि</th>
                  <th className="py-2.5 px-3 text-center">लक्ष्य प्राप्ति %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users
                  .filter((u) => u.role === 'AGENT')
                  .map((agent) => {
                    const agentCols = todayCollections.filter(
                      (c) => c.employeeId === agent.id && c.outcome === 'COLLECTED'
                    );
                    const collected = agentCols.reduce((s, c) => s + c.amount, 0);
                    const assignedCount = customers.filter((c) => c.assignedEmployeeId === agent.id).length;
                    const pct = Math.min(100, Math.round((collected / (agent.dailyTarget || 15000)) * 100));

                    return (
                      <tr key={agent.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-bold text-slate-900">{agent.name}</td>
                        <td className="py-2.5 px-3 text-slate-500">{agent.assignedLocalities.join(', ')}</td>
                        <td className="py-2.5 px-3 text-center font-semibold">{assignedCount}</td>
                        <td className="py-2.5 px-3 text-right font-medium">{formatINR(agent.dailyTarget)}</td>
                        <td className="py-2.5 px-3 text-right font-black text-blue-900">
                          {formatINR(collected)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            {pct}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}

        {/* Regulatory footer for print */}
        <div className="pt-4 border-t text-[11px] text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-1">
          <span>HDBI Financial Record-keeping System • ISO/Secured Agent Portal</span>
          <span>अधिकृत हस्ताक्षर / अधिकृत बैंक प्रतिनिधि</span>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Customer } from '../types';
import { formatINR } from '../lib/collectionRules';
import {
  Search,
  Filter,
  Plus,
  Phone,
  MessageSquare,
  FileDown,
  FileUp,
  UserCheck,
  Building,
  Calendar,
  ChevronRight,
  ShieldCheck,
  UserX,
  AlertCircle
} from 'lucide-react';

export const CustomerListView: React.FC<{
  onSelectCustomer: (cust: Customer) => void;
  onOpenAddModal: () => void;
  onRecordForCustomer: (cust: Customer) => void;
}> = ({ onSelectCustomer, onOpenAddModal, onRecordForCustomer }) => {
  const { customers, t, users, currentUser, collections } = useApp();

  const [search, setSearch] = useState('');
  const [selectedLocality, setSelectedLocality] = useState('ALL');
  const [selectedBank, setSelectedBank] = useState('ALL');
  const [selectedStaff, setSelectedStaff] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [showImportModal, setShowImportModal] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [importResult, setImportResult] = useState<string | null>(null);

  // Extract unique banks
  const banks = useMemo(() => {
    const set = new Set<string>();
    customers.forEach((c) => {
      if (c.bankName) set.add(c.bankName);
    });
    return Array.from(set);
  }, [customers]);

  // Extract unique localities
  const localities = useMemo(() => {
    const set = new Set<string>();
    customers.forEach((c) => {
      if (c.locality) set.add(c.locality);
    });
    return Array.from(set);
  }, [customers]);

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matches =
          c.name.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.id.toLowerCase().includes(q) ||
          c.rdAccountNumber.toLowerCase().includes(q) ||
          c.locality.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Locality
      if (selectedLocality !== 'ALL' && c.locality !== selectedLocality) {
        return false;
      }

      // Bank
      if (selectedBank !== 'ALL' && c.bankName !== selectedBank) {
        return false;
      }

      // Staff (if Owner/Supervisor)
      if (selectedStaff !== 'ALL' && c.assignedEmployeeId !== selectedStaff) {
        return false;
      }

      // Status
      if (selectedStatus !== 'ALL' && c.status !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [customers, search, selectedLocality, selectedStaff, selectedStatus]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Customer ID',
      'Name',
      'Phone',
      'Locality',
      'Address',
      'Bank Name',
      'Branch',
      'RD Account Ref',
      'Installment Amount',
      'Frequency',
      'Scheduled Day',
      'Status',
    ];
    const rows = filteredCustomers.map((c) => [
      c.id,
      `"${c.name}"`,
      c.phone,
      `"${c.locality}"`,
      `"${c.address}"`,
      `"${c.bankName}"`,
      `"${c.branchName}"`,
      `"${c.rdAccountNumber}"`,
      c.installmentAmount,
      c.frequency,
      c.scheduledDay,
      c.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hdbi_customers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const { importCustomersFromCSV } = useApp();

  const handleImportSubmit = async () => {
    if (!csvText.trim()) return;
    const res = await importCustomersFromCSV(csvText);
    if (res.success) {
      setImportResult(`सफलतापूर्वक ${res.count} ग्राहक जोड़े गए!`);
      setTimeout(() => {
        setShowImportModal(false);
        setImportResult(null);
        setCsvText('');
      }, 1500);
    } else {
      setImportResult(`त्रुटि: ${res.errors.join(', ')}`);
    }
  };

  return (
    <div className="space-y-3 pb-24">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">{t.navCustomers}</h1>
          <p className="text-xs text-slate-500">
            कुल {filteredCustomers.length} ग्राहक उपलब्ध हैं
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {currentUser.role === 'OWNER' && (
            <>
              <button
                onClick={() => setShowImportModal(true)}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-1 transition"
                title="CSV Import"
              >
                <FileUp className="w-4 h-4" />
                <span className="hidden sm:inline">Import</span>
              </button>
              <button
                onClick={handleExportCSV}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-1 transition"
                title="Export CSV"
              >
                <FileDown className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </>
          )}

          <button
            onClick={onOpenAddModal}
            className="flex items-center space-x-1.5 bg-blue-700 hover:bg-blue-800 active:scale-95 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-md shadow-blue-700/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addCustomer}</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t.searchPlaceholder}
          className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent shadow-2xs"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* Filter Row */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
        {/* Locality Filter */}
        <select
          value={selectedLocality}
          onChange={(e) => setSelectedLocality(e.target.value)}
          className="bg-white border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 font-medium focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
        >
          <option value="ALL">सभी इलाके (All Localities)</option>
          {localities.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>

        {/* Bank Filter */}
        <select
          value={selectedBank}
          onChange={(e) => setSelectedBank(e.target.value)}
          className="bg-white border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 font-medium focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
        >
          <option value="ALL">सभी बैंक (All Banks)</option>
          {banks.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>

        {/* Staff Filter (Owner & Supervisor only) */}
        {currentUser.role !== 'AGENT' && (
          <select
            value={selectedStaff}
            onChange={(e) => setSelectedStaff(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 font-medium focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
          >
            <option value="ALL">सभी कर्मचारी (All Staff)</option>
            {users
              .filter((u) => u.role === 'AGENT')
              .map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
          </select>
        )}

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-white border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 font-medium focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
        >
          <option value="ALL">सभी स्थिति (All Status)</option>
          <option value="ACTIVE">सक्रिय (Active)</option>
          <option value="INACTIVE">निष्क्रिय (Inactive)</option>
        </select>
      </div>

      {/* Customer Cards List */}
      <div className="space-y-2.5">
        {filteredCustomers.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-gray-200">
            <UserX className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-700">कोई ग्राहक नहीं मिला</p>
            <p className="text-xs text-gray-400 mt-0.5">
              फ़िल्टर या खोज शब्द बदलकर पुनः प्रयास करें।
            </p>
          </div>
        ) : (
          filteredCustomers.map((c, idx) => {
            const assignedUser = users.find((u) => u.id === c.assignedEmployeeId);
            const isDueToday = c.scheduledDay === new Date().getDate() || c.scheduledDay === 0;

            const avatarColors = [
              'bg-[#e8f0fe] text-[#1a73e8]',
              'bg-[#e6f4ea] text-[#137333]',
              'bg-[#fef7e0] text-[#b06000]',
              'bg-[#fce8e6] text-[#d93025]',
              'bg-[#f3e8fd] text-[#7b1fa2]',
            ];
            const colorClass = avatarColors[idx % avatarColors.length];
            const initials = c.name
              .split(' ')
              .map((w) => w[0])
              .slice(0, 2)
              .join('')
              .toUpperCase();

            return (
              <div
                key={c.id}
                className="bg-white rounded-3xl border border-gray-200/90 hover:border-[#1a73e8] p-4 shadow-2xs transition hover:shadow-xs cursor-pointer group"
                onClick={() => onSelectCustomer(c)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start space-x-3.5 min-w-0 flex-1">
                    {/* Google Contacts Avatar Circle */}
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm shrink-0 mt-0.5 shadow-2xs ${colorClass}`}
                    >
                      {initials}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2 flex-wrap">
                        <span className="font-extrabold text-[#1f1f1f] text-base truncate group-hover:text-[#1a73e8] transition">
                          {c.name}
                        </span>
                        {isDueToday && (
                          <span className="bg-[#fef7e0] text-[#b06000] text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border border-[#feefc3] shrink-0">
                            आज देय (Due Today)
                          </span>
                        )}
                        {c.status === 'INACTIVE' && (
                          <span className="bg-gray-100 text-gray-600 text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0">
                            निष्क्रिय
                          </span>
                        )}
                      </div>

                      {/* Prominent Customer Account Number Badge */}
                      <div className="mt-1 flex items-center space-x-2 flex-wrap">
                        <span className="font-mono text-xs font-black bg-[#e8f0fe] text-[#1a73e8] border border-[#d2e3fc] px-2.5 py-0.5 rounded-lg">
                          खाता सं.: {c.rdAccountNumber}
                        </span>
                        <span className="text-xs text-gray-500 font-medium">
                          {c.bankName} • {c.locality}
                        </span>
                      </div>

                      <div className="text-[11px] text-gray-400 mt-1 flex items-center space-x-2">
                        <span>नियत तारीख: हर माह {c.scheduledDay === 0 ? 'प्रतिदिन' : `${c.scheduledDay} तारीख`}</span>
                        <span>•</span>
                        <span>एजेंट: {assignedUser?.name.split(' ')[0] || 'Unassigned'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right side: Installment amount & quick actions */}
                  <div className="text-right shrink-0 flex flex-col items-end space-y-1">
                    {/* Prominent Amount */}
                    <div className="text-base sm:text-lg font-black text-[#1a73e8]">
                      {formatINR(c.installmentAmount)}
                    </div>
                    <div className="text-[10px] text-gray-500 uppercase font-semibold">
                      {c.frequency} किस्त
                    </div>

                    {/* Quick Call, WhatsApp & Large Collection Button */}
                    <div className="flex items-center space-x-1.5 mt-2">
                      <a
                        href={`tel:${c.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 rounded-full bg-[#f1f3f4] hover:bg-[#e8eaed] text-gray-700 transition"
                        title="फोन करें"
                        aria-label="Call Customer"
                      >
                        <Phone className="w-4 h-4 text-[#1a73e8]" />
                      </a>
                      <a
                        href={`https://wa.me/${c.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                          `नमस्कार ${c.name} जी, आपकी RD किस्त राशि ${formatINR(c.installmentAmount)} (खाता: ${c.rdAccountNumber}) निर्धारित है। - HDBI`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 rounded-full bg-[#e6f4ea] hover:bg-[#ceead6] text-[#137333] transition"
                        title="व्हाट्सएप संदेश"
                        aria-label="WhatsApp Customer"
                      >
                        <MessageSquare className="w-4 h-4 text-[#1e8e3e]" />
                      </a>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRecordForCustomer(c);
                        }}
                        className="px-4 py-2 bg-[#1a73e8] hover:bg-[#1557b0] active:scale-95 text-white font-bold text-xs rounded-full shadow-2xs transition cursor-pointer"
                        aria-label="कलेक्शन दर्ज करें"
                      >
                        ₹ जमा
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CSV Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-base text-slate-900">
                ग्राहकों की CSV सूची आयात करें (Import CSV)
              </h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              CSV फ़ॉर्मेट में हेडर आवश्यक हैं: <code>name, phone, bank, amount, locality</code>
            </p>

            <textarea
              rows={6}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="name,phone,bank,amount,locality&#10;Kamal Kishore,+91 9811002233,State Bank of India,1000,Karol Bagh&#10;Neelam Sharma,+91 9822003344,HDFC Bank,2000,Laxmi Nagar"
              className="w-full text-xs font-mono p-3 border rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />

            {importResult && (
              <div className="p-2.5 rounded-lg text-xs bg-blue-50 text-blue-900 font-medium">
                {importResult}
              </div>
            )}

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                रद्द करें
              </button>
              <button
                onClick={handleImportSubmit}
                className="px-4 py-2 text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white rounded-xl shadow-md"
              >
                डेटा इंपोर्ट करें
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { Customer } from '../types';
import { useApp } from '../context/AppContext';
import { formatINR } from '../lib/collectionRules';
import {
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Phone,
  MessageSquare,
  Users,
  Building,
  Filter,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';

export const SmartRouteTasksView: React.FC<{
  onRecordForCustomer: (cust: Customer) => void;
  onSelectCustomer: (cust: Customer) => void;
}> = ({ onRecordForCustomer, onSelectCustomer }) => {
  const { customers, collections, users, updateCustomer, currentUser, t, selectedDate } = useApp();

  const [activeTab, setActiveTab] = useState<'DUE_TODAY' | 'OVERDUE' | 'COMPLETED' | 'ALL'>('DUE_TODAY');
  const [selectedLocality, setSelectedLocality] = useState('ALL');
  const [reassignModalCustomer, setReassignModalCustomer] = useState<Customer | null>(null);
  const [selectedNewAgent, setSelectedNewAgent] = useState('');

  const currentDay = new Date(selectedDate).getDate();

  // Classify customers into categories
  const categorizedTasks = useMemo(() => {
    const dueToday: Customer[] = [];
    const overdue: Customer[] = [];
    const completedToday: Customer[] = [];
    const others: Customer[] = [];

    customers.forEach((c) => {
      if (c.status !== 'ACTIVE') return;

      // Check if already collected today
      const todayCol = collections.find(
        (col) =>
          col.customerId === c.id &&
          col.collectedAt.startsWith(selectedDate.substring(0, 10)) &&
          col.status !== 'REVERSED'
      );

      if (todayCol) {
        completedToday.push(c);
        return;
      }

      if (c.scheduledDay === currentDay || c.scheduledDay === 0) {
        dueToday.push(c);
      } else if (c.scheduledDay < currentDay) {
        overdue.push(c);
      } else {
        others.push(c);
      }
    });

    return { dueToday, overdue, completedToday, others };
  }, [customers, collections, selectedDate, currentDay]);

  const activeList = useMemo(() => {
    let list: Customer[] = [];
    if (activeTab === 'DUE_TODAY') list = categorizedTasks.dueToday;
    else if (activeTab === 'OVERDUE') list = categorizedTasks.overdue;
    else if (activeTab === 'COMPLETED') list = categorizedTasks.completedToday;
    else list = [...categorizedTasks.overdue, ...categorizedTasks.dueToday, ...categorizedTasks.others];

    if (selectedLocality !== 'ALL') {
      list = list.filter((c) => c.locality === selectedLocality);
    }
    return list;
  }, [activeTab, categorizedTasks, selectedLocality]);

  // Group activeList by Locality for route walking order!
  const groupedByLocality = useMemo(() => {
    const map = new Map<string, Customer[]>();
    activeList.forEach((c) => {
      const loc = c.locality || 'General';
      if (!map.has(loc)) map.set(loc, []);
      map.get(loc)!.push(c);
    });
    return Array.from(map.entries());
  }, [activeList]);

  // Unique localities
  const localities = useMemo(() => {
    const set = new Set<string>();
    customers.forEach((c) => {
      if (c.locality) set.add(c.locality);
    });
    return Array.from(set);
  }, [customers]);

  const handleReassign = async () => {
    if (!reassignModalCustomer || !selectedNewAgent) return;
    await updateCustomer(reassignModalCustomer.id, {
      assignedEmployeeId: selectedNewAgent,
    });
    setReassignModalCustomer(null);
  };

  return (
    <div className="space-y-3 pb-24">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-blue-700" />
            <span>{t.routePlanner} (दैनिक कार्य)</span>
          </h1>
          <p className="text-xs text-slate-500">
            इलाका-वार निर्धारित कलेक्शन व रूट क्रम
          </p>
        </div>

        {/* Locality Selector */}
        <div className="flex items-center space-x-1.5 self-start sm:self-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedLocality}
            onChange={(e) => setSelectedLocality(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer"
          >
            <option value="ALL">सभी इलाके (All Localities)</option>
            {localities.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Google Material 3 Segmented Tabs */}
      <div className="grid grid-cols-4 gap-1 bg-[#f0f4f9] p-1 rounded-full text-xs font-semibold">
        <button
          onClick={() => setActiveTab('DUE_TODAY')}
          className={`py-2 px-2.5 rounded-full text-center transition flex flex-col sm:flex-row items-center justify-center space-x-1 ${
            activeTab === 'DUE_TODAY' ? 'bg-white text-[#1a73e8] shadow-2xs font-bold' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <span>आज देय</span>
          <span className="text-[10px] text-[#1a73e8]">({categorizedTasks.dueToday.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('OVERDUE')}
          className={`py-2 px-2.5 rounded-full text-center transition flex flex-col sm:flex-row items-center justify-center space-x-1 ${
            activeTab === 'OVERDUE' ? 'bg-white text-[#d93025] shadow-2xs font-bold' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <span>बकाया</span>
          <span className="text-[10px] text-[#d93025] font-bold">({categorizedTasks.overdue.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('COMPLETED')}
          className={`py-2 px-2.5 rounded-full text-center transition flex flex-col sm:flex-row items-center justify-center space-x-1 ${
            activeTab === 'COMPLETED' ? 'bg-white text-[#137333] shadow-2xs font-bold' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <span>पूर्ण</span>
          <span className="text-[10px] text-[#137333]">({categorizedTasks.completedToday.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ALL')}
          className={`py-2 px-2.5 rounded-full text-center transition flex flex-col sm:flex-row items-center justify-center space-x-1 ${
            activeTab === 'ALL' ? 'bg-white text-gray-900 shadow-2xs font-bold' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <span>सभी</span>
          <span className="text-[10px] text-gray-400">
            ({customers.filter((c) => c.status === 'ACTIVE').length})
          </span>
        </button>
      </div>

      {/* Grouped Route List */}
      <div className="space-y-4">
        {groupedByLocality.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-slate-200">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">इस श्रेणी में कोई कार्य शेष नहीं है</p>
            <p className="text-xs text-slate-400 mt-0.5">
              आज के सभी ग्राहक संपर्क या कलेक्शन पूर्ण हो चुके हैं।
            </p>
          </div>
        ) : (
          groupedByLocality.map(([localityName, customerGroup]) => (
            <div key={localityName} className="space-y-2">
              {/* Locality Header */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center space-x-1.5 text-xs font-extrabold text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  <span>इलाका: {localityName}</span>
                  <span className="text-slate-400 font-normal">({customerGroup.length} ग्राहक)</span>
                </div>
                <span className="text-[11px] font-bold text-blue-900">
                  कुल: {formatINR(customerGroup.reduce((s, c) => s + c.installmentAmount, 0))}
                </span>
              </div>

              {/* Cards in this locality */}
              <div className="space-y-2">
                {customerGroup.map((c, index) => {
                  const assignedStaff = users.find((u) => u.id === c.assignedEmployeeId);
                  const isCompleted = categorizedTasks.completedToday.some((x) => x.id === c.id);

                  return (
                    <div
                      key={c.id}
                      onClick={() => onSelectCustomer(c)}
                      className="bg-white rounded-3xl border border-gray-200/90 hover:border-[#1a73e8] p-4 shadow-2xs transition hover:shadow-xs cursor-pointer"
                    >
                      <div className="space-y-3">
                        {/* Top: Customer details, Account Number and Amount */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start space-x-3 min-w-0 flex-1">
                            {/* Route Index Pin */}
                            <div className="w-8 h-8 rounded-full bg-[#e8f0fe] text-[#1a73e8] font-black text-xs flex items-center justify-center shrink-0 mt-0.5 border border-[#d2e3fc]">
                              {index + 1}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center space-x-2 flex-wrap">
                                <span className="font-extrabold text-[#1f1f1f] text-base truncate">{c.name}</span>
                                {isCompleted && (
                                  <span className="bg-[#e6f4ea] text-[#137333] text-[11px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-300">
                                    आज पूर्ण ✓
                                  </span>
                                )}
                              </div>

                              {/* Prominent Customer Account Number Badge */}
                              <div className="mt-1 flex items-center space-x-2 flex-wrap">
                                <span className="font-mono text-xs font-black bg-[#e8f0fe] text-[#1a73e8] border border-[#d2e3fc] px-2.5 py-0.5 rounded-lg">
                                  खाता सं.: {c.rdAccountNumber}
                                </span>
                                <span className="text-xs text-gray-500 font-medium">
                                  {c.bankName}
                                </span>
                              </div>

                              <p className="text-xs text-gray-500 mt-1 truncate">
                                {c.address}
                              </p>
                            </div>
                          </div>

                          {/* Large Amount */}
                          <div className="text-right shrink-0">
                            <span className="font-black text-base sm:text-lg text-[#1a73e8] block">
                              {formatINR(c.installmentAmount)}
                            </span>
                            <span className="text-[10px] text-gray-400 block font-semibold uppercase">
                              {c.frequency}
                            </span>
                          </div>
                        </div>

                        {/* Bottom Action Bar */}
                        <div className="flex items-center justify-between pt-2.5 border-t border-gray-100 gap-2">
                          <div className="flex items-center space-x-2">
                            <a
                              href={`tel:${c.phone}`}
                              onClick={(e) => e.stopPropagation()}
                              className="p-2 rounded-full bg-[#f1f3f4] hover:bg-[#e8eaed] text-gray-700 flex items-center space-x-1 text-xs font-semibold transition"
                              title="Call"
                              aria-label="Call Customer"
                            >
                              <Phone className="w-4 h-4 text-[#1a73e8]" />
                              <span className="hidden sm:inline">कॉल</span>
                            </a>
                            <a
                              href={`https://wa.me/${c.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                `नमस्कार ${c.name} जी, आपकी RD किस्त ${formatINR(c.installmentAmount)} (खाता: ${c.rdAccountNumber}) देय है। - HDBI`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="p-2 rounded-full bg-[#e6f4ea] hover:bg-[#ceead6] text-[#137333] flex items-center space-x-1 text-xs font-semibold transition"
                              title="WhatsApp"
                              aria-label="WhatsApp Customer"
                            >
                              <MessageSquare className="w-4 h-4 text-[#1e8e3e]" />
                              <span className="hidden sm:inline">WhatsApp</span>
                            </a>
                            {currentUser.role !== 'AGENT' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setReassignModalCustomer(c);
                                  setSelectedNewAgent(c.assignedEmployeeId);
                                }}
                                className="p-2 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100 text-xs font-medium flex items-center space-x-1"
                                title="कर्मचारी बदलें"
                              >
                                <Users className="w-4 h-4" />
                                <span className="hidden sm:inline">Reassign</span>
                              </button>
                            )}
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRecordForCustomer(c);
                            }}
                            className="px-5 py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] active:scale-95 text-white font-bold text-xs rounded-full shadow-2xs transition cursor-pointer"
                            aria-label="कलेक्शन दर्ज करें"
                          >
                            ₹ कलेक्शन दर्ज करें
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reassign Modal */}
      {reassignModalCustomer && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900">
              ग्राहक कार्य पुनः आवंटित करें (Reassign Agent)
            </h3>
            <p className="text-xs text-slate-600">
              ग्राहक: <strong>{reassignModalCustomer.name}</strong> ({reassignModalCustomer.locality})
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                नया फील्ड एजेंट चुनें:
              </label>
              <select
                value={selectedNewAgent}
                onChange={(e) => setSelectedNewAgent(e.target.value)}
                className="w-full bg-slate-50 border rounded-xl p-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {users
                  .filter((u) => u.role === 'AGENT')
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.assignedLocalities.join(', ')})
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setReassignModalCustomer(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                रद्द करें
              </button>
              <button
                onClick={handleReassign}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white shadow-md"
              >
                आवंटित करें
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

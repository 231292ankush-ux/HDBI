import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Search, Filter, History, Clock } from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const { auditLogs } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = auditLogs.filter((log) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q) ||
      log.userName.toLowerCase().includes(q) ||
      log.id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4 pb-24">
      <div>
        <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
          <History className="w-5 h-5 text-indigo-700" />
          <span>सुरक्षा व ऑडिट लॉग (Audit Trail)</span>
        </h1>
        <p className="text-xs text-slate-500">
          प्रणाली में दर्ज हर वित्तीय लेन-देन, सत्यापन, सुधार व उपयोगकर्ता गतिविधि का अपरिवर्तनीय रिकॉर्ड
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="ऑडिट रिकॉर्ड, उपयोगकर्ता या विवरण खोजें..."
          className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs"
        />
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="divide-y divide-slate-100 text-xs">
          {filteredLogs.length === 0 ? (
            <p className="p-6 text-center text-slate-400">कोई ऑडिट लॉग नहीं मिला।</p>
          ) : (
            filteredLogs.map((log) => {
              const timeStr = new Date(log.timestamp).toLocaleString('hi-IN', {
                dateStyle: 'medium',
                timeStyle: 'short',
              });

              return (
                <div key={log.id} className="p-3.5 hover:bg-slate-50 transition space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-slate-400">{log.id}</span>
                      <span className="font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">
                        {log.userName}
                      </span>
                      <span
                        className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          log.action.includes('REVERSED')
                            ? 'bg-rose-100 text-rose-800'
                            : log.action.includes('VERIFIED')
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {log.action}
                      </span>
                    </div>

                    <span className="text-slate-400 flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{timeStr}</span>
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 font-medium">{log.details}</p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

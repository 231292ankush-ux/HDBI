import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, Role } from '../types';
import { formatINR } from '../lib/collectionRules';
import {
  Users,
  UserPlus,
  ShieldAlert,
  ShieldCheck,
  Building,
  Target,
  UserCheck,
  UserX,
  Plus
} from 'lucide-react';

export const StaffManagementView: React.FC = () => {
  const { users, currentUser, refreshData, t, customers, collections } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<Role>('AGENT');
  const [localitiesStr, setLocalitiesStr] = useState('');
  const [dailyTarget, setDailyTarget] = useState('15000');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    const locs = localitiesStr
      .split(',')
      .map((l) => l.trim())
      .filter(Boolean);

    await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role,
        assignedLocalities: locs.length > 0 ? locs : ['General'],
        dailyTarget: Number(dailyTarget),
      }),
    });

    setIsSubmitting(false);
    setShowAddModal(false);
    setName('');
    setEmail('');
    setPhone('');
    setLocalitiesStr('');
    refreshData();
  };

  const handleToggleActive = async (user: User) => {
    await fetch(`/api/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !user.active }),
    });
    refreshData();
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-700" />
            <span>{t.employeeManagement} (Staff & Roles)</span>
          </h1>
          <p className="text-xs text-slate-500">
            फील्ड एजेंट, सुपरवाइज़र खाते, कार्य क्षेत्र व दैनिक कलेक्शन लक्ष्य
          </p>
        </div>

        {currentUser.role === 'OWNER' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-1.5 px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-700/20 active:scale-95 transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>{t.addEmployee}</span>
          </button>
        )}
      </div>

      {/* Staff Cards */}
      <div className="space-y-3">
        {users.map((u) => {
          const assignedCust = customers.filter((c) => c.assignedEmployeeId === u.id);
          const uCols = collections.filter((c) => c.employeeId === u.id && c.outcome === 'COLLECTED');
          const totalCol = uCols.reduce((s, c) => s + c.amount, 0);

          return (
            <div
              key={u.id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-sm text-slate-900">{u.name}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        u.role === 'OWNER'
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : u.role === 'SUPERVISOR'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {u.role}
                    </span>
                    {!u.active && (
                      <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                        निलंबित (Suspended)
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {u.phone} • {u.email}
                  </p>
                </div>

                {currentUser.role === 'OWNER' && u.role !== 'OWNER' && (
                  <button
                    onClick={() => handleToggleActive(u)}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition ${
                      u.active
                        ? 'border-rose-300 text-rose-700 hover:bg-rose-50'
                        : 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                    }`}
                  >
                    {u.active ? 'पहुंच निलंबित करें' : 'सक्रिय करें'}
                  </button>
                )}
              </div>

              {/* Targets & Areas */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-2 border-t border-slate-100">
                <div className="bg-slate-50 p-2 rounded-lg">
                  <span className="text-slate-400 block text-[10px]">सौंपे गए ग्राहक</span>
                  <span className="font-bold text-slate-800">{assignedCust.length} ग्राहक</span>
                </div>

                <div className="bg-slate-50 p-2 rounded-lg">
                  <span className="text-slate-400 block text-[10px]">दैनिक लक्ष्य</span>
                  <span className="font-bold text-slate-800">{formatINR(u.dailyTarget)}</span>
                </div>

                <div className="bg-slate-50 p-2 rounded-lg">
                  <span className="text-slate-400 block text-[10px]">कुल एकत्रित राशि</span>
                  <span className="font-black text-blue-900">{formatINR(totalCol)}</span>
                </div>

                <div className="bg-slate-50 p-2 rounded-lg">
                  <span className="text-slate-400 block text-[10px]">कार्य क्षेत्र (Areas)</span>
                  <span className="font-semibold text-slate-700 truncate block">
                    {u.assignedLocalities.join(', ') || 'General'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-base text-slate-900">
              नया कर्मचारी / एजेंट खाता जोड़ें
            </h3>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">पूरा नाम *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="उदा. मोहित शर्मा"
                  className="w-full bg-slate-50 border rounded-xl p-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">मोबाइल नंबर</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9810123456"
                    className="w-full bg-slate-50 border rounded-xl p-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">भूमिका (Role)</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                    className="w-full bg-slate-50 border rounded-xl p-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
                  >
                    <option value="AGENT">फील्ड एजेंट (Field Agent)</option>
                    <option value="SUPERVISOR">सुपरवाइज़र (Supervisor)</option>
                    <option value="OWNER">मालिक / एडमिन (Owner)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  कार्य क्षेत्र / इलाके (कॉमा से अलग करें)
                </label>
                <input
                  type="text"
                  value={localitiesStr}
                  onChange={(e) => setLocalitiesStr(e.target.value)}
                  placeholder="उदा. Karol Bagh, Pahar Ganj"
                  className="w-full bg-slate-50 border rounded-xl p-2.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  दैनिक कलेक्शन लक्ष्य (₹)
                </label>
                <input
                  type="number"
                  value={dailyTarget}
                  onChange={(e) => setDailyTarget(e.target.value)}
                  className="w-full bg-slate-50 border rounded-xl p-2.5 font-bold text-blue-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl font-bold bg-blue-700 hover:bg-blue-800 text-white shadow-md shadow-blue-700/20"
                >
                  {isSubmitting ? 'जोड़ रहे हैं...' : 'खाता बनाएं'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

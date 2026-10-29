import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Building, User, Phone, MapPin, IndianRupee, ShieldCheck, AlertCircle } from 'lucide-react';

export const AddCustomerModal: React.FC<{
  onClose: () => void;
  onSuccess: () => void;
}> = ({ onClose, onSuccess }) => {
  const { addCustomer, users, t } = useApp();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [altPhone, setAltPhone] = useState('');
  const [locality, setLocality] = useState('');
  const [address, setAddress] = useState('');
  const [bankName, setBankName] = useState('State Bank of India');
  const [branchName, setBranchName] = useState('');
  const [rdAccountNumber, setRdAccountNumber] = useState('');
  const [installmentAmount, setInstallmentAmount] = useState('1000');
  const [frequency, setFrequency] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('MONTHLY');
  const [scheduledDay, setScheduledDay] = useState('1');
  const [assignedEmployeeId, setAssignedEmployeeId] = useState(
    users.find((u) => u.role === 'AGENT')?.id || 'USR-AGENT-01'
  );
  const [notes, setNotes] = useState('');
  const [consentGiven, setConsentGiven] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const bankOptions = [
    'State Bank of India',
    'Punjab National Bank',
    'Bank of Baroda',
    'HDFC Bank',
    'ICICI Bank',
    'Canara Bank',
    'Union Bank of India',
    'Axis Bank',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('ग्राहक का नाम आवश्यक है');
      return;
    }
    if (!phone.trim() || phone.trim().length < 10) {
      setError('मान्य 10 अंकों का मोबाइल नंबर दर्ज करें');
      return;
    }
    if (!installmentAmount || Number(installmentAmount) <= 0) {
      setError('मान्य किस्त राशि दर्ज करें');
      return;
    }
    if (!consentGiven) {
      setError('ग्राहक की सहमति एवं डेटा स्वीकृति आवश्यक है');
      return;
    }

    setIsSubmitting(true);
    const res = await addCustomer({
      name: name.trim(),
      phone: phone.trim().startsWith('+91') ? phone.trim() : `+91 ${phone.trim()}`,
      altPhone: altPhone.trim(),
      locality: locality.trim() || 'Central',
      address: address.trim(),
      bankName,
      branchName: branchName.trim(),
      rdAccountNumber: rdAccountNumber.trim() || `RD-ACC-${Math.floor(100000 + Math.random() * 900000)}`,
      installmentAmount: Number(installmentAmount),
      frequency,
      scheduledDay: frequency === 'DAILY' ? 0 : Number(scheduledDay),
      assignedEmployeeId,
      notes: notes.trim(),
      consentGiven,
      status: 'ACTIVE',
    });

    setIsSubmitting(false);
    if (res.success) {
      onSuccess();
      onClose();
    } else {
      setError(res.error || 'ग्राहक जोड़ने में विफल');
    }
  };

  return (
    <div className="fixed inset-0 bg-[#202124]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full my-auto overflow-hidden shadow-2xl border border-gray-200">
        <div className="bg-white border-b border-gray-100 p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-[#1a73e8] border border-blue-200/80 flex items-center justify-center">
              <User className="w-5 h-5 text-[#1a73e8]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#202124] tracking-tight">{t.addCustomer}</h2>
              <p className="text-[11px] text-[#5f6368]">नया RD खाता एवं संपर्क विवरण जोड़ें</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-full text-[#5f6368] hover:text-[#202124] hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-rose-50 text-[#c5221f] p-3 text-xs flex items-start space-x-2 border-b border-rose-200">
            <AlertCircle className="w-4 h-4 text-[#d93025] shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5 max-h-[75vh] overflow-y-auto text-xs">
          {/* Section: Basic Info */}
          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              ग्राहक का पूरा नाम (Full Name) *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="उदा. रमेश कुमार"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                मोबाइल नंबर *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9810123456"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                वैकल्पिक संपर्क (Alternate)
              </label>
              <input
                type="tel"
                value={altPhone}
                onChange={(e) => setAltPhone(e.target.value)}
                placeholder="वैकल्पिक नंबर"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                इलाका / गाँव (Locality) *
              </label>
              <input
                type="text"
                required
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                placeholder="उदा. Karol Bagh"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                आवंटित कलेक्शन एजेंट
              </label>
              <select
                value={assignedEmployeeId}
                onChange={(e) => setAssignedEmployeeId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
              >
                {users
                  .filter((u) => u.role === 'AGENT')
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">
              पूरा पता (Address)
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="दुकान/मकान संख्या, सड़क, लैंडमार्क"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Section: RD Account Details */}
          <div className="pt-2 border-t border-slate-200">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center space-x-1.5">
              <Building className="w-3.5 h-3.5 text-blue-600" />
              <span>RD खाता व किस्त शेड्यूल (RD Details)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  बैंक का नाम *
                </label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
                >
                  {bankOptions.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  शाखा (Branch)
                </label>
                <input
                  type="text"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  placeholder="उदा. Karol Bagh Main"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  RD किस्त राशि (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="100"
                  step="50"
                  value={installmentAmount}
                  onChange={(e) => setInstallmentAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-blue-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  आवृत्ति (Frequency)
                </label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
                >
                  <option value="MONTHLY">मासिक (Monthly)</option>
                  <option value="DAILY">दैनिक (Daily)</option>
                  <option value="WEEKLY">साप्ताहिक (Weekly)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  निर्धारित दिन (Day)
                </label>
                <input
                  type="number"
                  disabled={frequency === 'DAILY'}
                  min="1"
                  max="31"
                  value={frequency === 'DAILY' ? '0' : scheduledDay}
                  onChange={(e) => setScheduledDay(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-slate-700 font-semibold mb-1">
                पासबुक / अधिकृत RD खाता संदर्भ (Account Ref)
              </label>
              <input
                type="text"
                value={rdAccountNumber}
                onChange={(e) => setRdAccountNumber(e.target.value)}
                placeholder="उदा. RD-SBI-992140"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Consent Checkbox */}
          <div className="pt-2 flex items-start space-x-2">
            <input
              type="checkbox"
              id="consent"
              checked={consentGiven}
              onChange={(e) => setConsentGiven(e.target.checked)}
              className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="consent" className="text-[11px] text-slate-600 leading-tight cursor-pointer">
              ग्राहक ने अधिकृत बैंक कलेक्शन एजेंट के माध्यम से RD किस्त वसूली एवं एसएमएस/व्हाट्सएप सूचनाएं प्राप्त करने की सहमति प्रदान की है।
            </label>
          </div>

          <div className="flex items-center justify-end space-x-2.5 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full text-[#5f6368] hover:bg-gray-100 font-semibold transition text-xs"
            >
              रद्द करें
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-full bg-[#1a73e8] hover:bg-blue-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition disabled:opacity-50"
            >
              {isSubmitting ? 'सहेज रहे हैं...' : 'ग्राहक सहेजें'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Sparkles,
  Building,
  CheckCircle,
  Globe,
  Clock,
  ShieldCheck,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

export const SetupWizardModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { agency, refreshData, setLanguage, language } = useApp();

  const [step, setStep] = useState(1);
  const [agencyName, setAgencyName] = useState(agency?.name || 'Shree Krishna Banking Services');
  const [ownerName, setOwnerName] = useState(agency?.ownerName || 'Rajesh Sharma');
  const [phone, setPhone] = useState(agency?.phone || '+91 9810123456');
  const [selectedLang, setSelectedLang] = useState<'hi' | 'en'>(language);
  const [isSaving, setIsSaving] = useState(false);

  const handleFinish = async () => {
    setIsSaving(true);
    await fetch('/api/agency', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: agencyName,
        ownerName,
        phone,
        defaultLanguage: selectedLang,
        initialized: true,
      }),
    });
    setLanguage(selectedLang);
    await refreshData();
    setIsSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#202124]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-200">
        <div className="bg-white border-b border-gray-100 p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-[#1a73e8] border border-blue-200/80 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#1a73e8]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#202124] tracking-tight">HDBI सेटअप विज़ार्ड</h2>
              <p className="text-[11px] text-[#5f6368]">चरण {step} / 3</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="p-2 rounded-full text-[#5f6368] hover:text-[#202124] hover:bg-gray-100 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step progress bar */}
        <div className="w-full bg-blue-50 h-1">
          <div
            className="bg-[#1a73e8] h-full transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        <div className="p-5 space-y-4 text-xs">
          {step === 1 && (
            <div className="space-y-3">
              <h3 className="font-extrabold text-sm text-slate-900">
                चरण 1: एजेंसी व प्रोपराइटर विवरण
              </h3>
              <p className="text-slate-500">
                अपनी अधिकृत बैंक कलेक्शन एजेंसी या फर्म का नाम और संपर्क दर्ज करें।
              </p>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  एजेंसी या फर्म का नाम *
                </label>
                <input
                  type="text"
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  className="w-full bg-slate-50 border rounded-xl p-2.5 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  मालिक / एजेंट का नाम *
                </label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full bg-slate-50 border rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  मोबाइल नंबर *
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <h3 className="font-extrabold text-sm text-slate-900">
                चरण 2: भाषा व कार्यप्रणाली प्राथमिकता
              </h3>
              <p className="text-slate-500">
                फ़ील्ड एजेंटों व रिपोर्ट के लिए पसंदीदा भाषा चुनें।
              </p>

              <div className="space-y-2">
                <label
                  onClick={() => setSelectedLang('hi')}
                  className={`p-3 rounded-xl border-2 flex items-center justify-between cursor-pointer ${
                    selectedLang === 'hi'
                      ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div>
                    <div className="text-xs">हिंदी (Hindi-First)</div>
                    <div className="text-[10px] text-slate-500">
                      भारतीय बैंक कलेक्शन एजेंटों के लिए अनुशंसित
                    </div>
                  </div>
                  {selectedLang === 'hi' && <CheckCircle className="w-4 h-4 text-blue-600" />}
                </label>

                <label
                  onClick={() => setSelectedLang('en')}
                  className={`p-3 rounded-xl border-2 flex items-center justify-between cursor-pointer ${
                    selectedLang === 'en'
                      ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div>
                    <div className="text-xs">English</div>
                    <div className="text-[10px] text-slate-500">
                      Standard English financial interface
                    </div>
                  </div>
                  {selectedLang === 'en' && <CheckCircle className="w-4 h-4 text-blue-600" />}
                </label>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900">
                <strong>समय क्षेत्र:</strong> Asia/Kolkata (IST +05:30) भारतीय बैंकिंग समय के अनुसार स्वतः सेट है।
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <h3 className="font-extrabold text-sm text-slate-900">
                चरण 3: सुरक्षा व अनुपालन पुष्टि
              </h3>
              <p className="text-slate-500">
                कलेक्शन रिकॉर्डिंग एवं वित्तीय डेटा सुरक्षा के प्रमुख नियम:
              </p>

              <div className="space-y-2 text-[11px] text-slate-700">
                <div className="p-2.5 bg-slate-50 border rounded-xl flex items-start space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    केवल अधिकृत RD खातों की निर्धारित किस्तों का प्रबंधन होता है। संवेदनशील बैंकिंग पिन या पासवर्ड कभी स्टोर न करें।
                  </span>
                </div>

                <div className="p-2.5 bg-slate-50 border rounded-xl flex items-start space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    प्रत्येक नकद कलेक्शन के बाद दैनिक कैश हैंडओवर व मिलान प्रक्रिया अनिवार्य है।
                  </span>
                </div>

                <div className="p-2.5 bg-slate-50 border rounded-xl flex items-start space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    सभी लेन-देन अपरिवर्तनीय ऑडिट ट्रेल में सुरक्षित रहते हैं।
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 rounded-full text-[#5f6368] hover:bg-gray-100 font-semibold flex items-center space-x-1.5 transition text-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>पिछला</span>
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-5 py-2.5 rounded-full bg-[#1a73e8] hover:bg-blue-700 text-white font-bold flex items-center space-x-1.5 shadow-md shadow-blue-500/20 transition text-xs active:scale-95"
              >
                <span>आगे बढ़ें</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isSaving}
                onClick={handleFinish}
                className="px-6 py-2.5 rounded-full bg-[#137333] hover:bg-emerald-700 text-white font-bold flex items-center space-x-1.5 shadow-md shadow-emerald-600/20 transition text-xs active:scale-95"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{isSaving ? 'सहेज रहे हैं...' : 'सेटअप पूर्ण करें'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

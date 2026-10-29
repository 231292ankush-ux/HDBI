import React, { useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  HandCoins,
  FileText,
  BellRing,
  History,
  Download,
  Upload,
  Settings,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
  HelpCircle,
  Building,
  Glasses
} from 'lucide-react';

export const MoreMenuView: React.FC<{
  onOpenView: (viewName: string) => void;
  onOpenWizard: () => void;
}> = ({ onOpenView, onOpenWizard }) => {
  const { t, currentUser, agency, resetDemoData, refreshData, seniorMode, toggleSeniorMode } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [backupStatus, setBackupStatus] = useState<string | null>(null);

  const handleDownloadBackup = () => {
    window.open('/api/backup', '_blank');
  };

  const handleFileRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const json = JSON.parse(text);

      const res = await fetch('/api/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(json),
      });

      if (res.ok) {
        setBackupStatus('डेटाबेस सफलतापूर्वक रीस्टोर हो गया!');
        await refreshData();
        setTimeout(() => setBackupStatus(null), 3000);
      } else {
        setBackupStatus('रीस्टोर विफल: फ़ाइल संरचना अमान्य है');
      }
    } catch (err) {
      setBackupStatus('रीस्टोर त्रुटि: मान्य JSON फ़ाइल चुनें');
    }
  };

  const menuItems = [
    {
      id: 'handover',
      label: t.handoverTitle,
      desc: 'फील्ड नकद कलेक्शन का मिलान व पावती',
      icon: HandCoins,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      id: 'reports',
      label: t.reportsTitle,
      desc: 'दैनिक व मासिक वित्तीय विवरण, प्रिंट व CSV',
      icon: FileText,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      id: 'reminders',
      label: t.remindersTitle,
      desc: 'व्हाट्सएप व एसएमएस संदेश कतार',
      icon: BellRing,
      color: 'text-amber-600 bg-amber-50',
    },
    ...(currentUser.role === 'OWNER' || currentUser.role === 'SUPERVISOR'
      ? [
          {
            id: 'employees',
            label: t.employeeManagement,
            desc: 'कर्मचारी खाते, दैनिक लक्ष्य व कार्य क्षेत्र',
            icon: Users,
            color: 'text-purple-600 bg-purple-50',
          },
          {
            id: 'audit',
            label: 'सुरक्षा व ऑडिट ट्रेल',
            desc: 'अपरिवर्तनीय लेन-देन व गतिविधि लॉग',
            icon: History,
            color: 'text-slate-700 bg-slate-100',
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-4 pb-24">
      {/* Agency Identity Card - Google Account Style */}
      <div className="bg-white rounded-3xl border border-gray-200/90 p-5 shadow-xs">
        <div className="flex items-center space-x-3.5">
          <div className="w-13 h-13 rounded-full bg-blue-50 text-[#1a73e8] border border-blue-200/80 flex items-center justify-center font-bold text-xl shrink-0 shadow-xs">
            ₹
          </div>
          <div>
            <h2 className="font-bold text-base text-[#202124]">
              {agency?.name || 'HDBI Agency'}
            </h2>
            <p className="text-xs text-[#5f6368] mt-0.5">
              मालिक: {agency?.ownerName} • {agency?.phone}
            </p>
            <div className="flex items-center space-x-2 mt-1.5">
              <span className="text-[10px] font-bold bg-emerald-50 text-[#137333] px-2.5 py-0.5 rounded-full border border-emerald-200">
                अधिकृत बैंकिंग एजेंट पोर्टल
              </span>
            </div>
          </div>
        </div>
      </div>

      {backupStatus && (
        <div className="bg-blue-50 text-[#1a73e8] p-3 rounded-2xl border border-blue-200 text-xs font-semibold">
          {backupStatus}
        </div>
      )}

      {/* Senior Easy Mode Card (वृद्ध व सरल मोड) */}
      <div className="bg-white rounded-3xl border border-gray-200/90 p-4 sm:p-5 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-2xl bg-[#e8f0fe] text-[#1a73e8]">
            <Glasses className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[#1f1f1f]">
              वृद्ध व सरल मोड (Senior Easy Mode)
            </h3>
            <p className="text-xs text-[#5f6368] mt-0.5">
              बड़े फॉन्ट साइज, उच्च कंट्रास्ट और आसान टच स्क्रीन बटन्स
            </p>
          </div>
        </div>

        <button
          onClick={toggleSeniorMode}
          className={`px-4 py-2 rounded-full font-bold text-xs transition shadow-2xs border cursor-pointer ${
            seniorMode
              ? 'bg-[#1a73e8] text-white border-[#1a73e8]'
              : 'bg-white hover:bg-gray-100 text-[#1f1f1f] border-gray-300'
          }`}
          aria-label="Toggle Senior Mode"
        >
          {seniorMode ? 'चालू है ✓' : 'चालू करें'}
        </button>
      </div>

      {/* Main Options - Google List style */}
      <div className="bg-white rounded-3xl border border-gray-200/90 shadow-xs divide-y divide-gray-100 overflow-hidden">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onOpenView(item.id)}
              className="w-full text-left p-4 sm:p-4.5 flex items-center justify-between hover:bg-gray-50/80 active:bg-gray-100 transition"
            >
              <div className="flex items-center space-x-3.5">
                <div className={`p-2.5 rounded-2xl ${item.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[#202124] text-sm">{item.label}</h3>
                  <p className="text-xs text-[#5f6368]">{item.desc}</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#5f6368]" />
            </button>
          );
        })}
      </div>

      {/* Database Backup & System Settings */}
      {currentUser.role === 'OWNER' && (
        <div className="bg-white rounded-3xl border border-gray-200/90 p-5 shadow-xs space-y-3.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#5f6368]">
            डेटा सुरक्षा व बैकअप (Data Backup & Recovery)
          </h3>

          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <button
              onClick={handleDownloadBackup}
              className="p-3.5 bg-[#f8f9fa] hover:bg-blue-50 active:bg-blue-100 rounded-2xl border border-gray-200 font-bold text-[#202124] flex flex-col items-center justify-center space-y-1.5 transition"
            >
              <Download className="w-5 h-5 text-[#1a73e8]" />
              <span className="font-semibold text-xs">डाउनलोड बैकअप</span>
              <span className="text-[10px] text-[#5f6368] font-normal">पूर्ण JSON एक्सपोर्ट</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-3.5 bg-[#f8f9fa] hover:bg-emerald-50 active:bg-emerald-100 rounded-2xl border border-gray-200 font-bold text-[#202124] flex flex-col items-center justify-center space-y-1.5 transition"
            >
              <Upload className="w-5 h-5 text-[#137333]" />
              <span className="font-semibold text-xs">बैकअप रीस्टोर</span>
              <span className="text-[10px] text-[#5f6368] font-normal">फ़ाइल अपलोड करें</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileRestore}
              accept=".json"
              className="hidden"
            />
          </div>

          <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between">
            <button
              onClick={onOpenWizard}
              className="text-xs font-bold text-[#1a73e8] hover:text-blue-800 flex items-center space-x-1"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>सेटअप विज़ार्ड (Setup Wizard)</span>
            </button>

            <button
              onClick={resetDemoData}
              className="text-xs font-semibold text-[#d93025] hover:text-[#c5221f] flex items-center space-x-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>डेमो डेटा रीसेट</span>
            </button>
          </div>
        </div>
      )}

      {/* About Box & Bank Regulatory Note */}
      <div className="p-4.5 rounded-3xl bg-[#f8f9fa] text-[#5f6368] text-[11px] leading-relaxed space-y-1.5 border border-gray-200/80">
        <div className="font-bold text-[#202124] flex items-center space-x-1.5">
          <ShieldCheck className="w-4 h-4 text-[#1a73e8]" />
          <span>HDBI v1.0.0 (Smart Collection Manager)</span>
        </div>
        <p>
          अधिकृत बैंक कलेक्शन एजेंट के लिए ग्राहक प्रबंधन, RD किस्त शेड्यूल, दैनिक रूट और नकद मिलान प्रणाली। बैंक से सत्यापन के बाद ही कोई प्रविष्टि अंतिम जमा मानी जाती है।
        </p>
      </div>
    </div>
  );
};

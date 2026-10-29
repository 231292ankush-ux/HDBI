import React from 'react';
import { useApp } from '../context/AppContext';
import { AlertCircle, ShieldAlert } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  const { t } = useApp();

  return (
    <div className="bg-[#fef7e0] border-b border-[#feefc3] px-3.5 py-1.5 text-[#5f6368]">
      <div className="max-w-4xl mx-auto flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-[#ea8600] shrink-0" />
          <p className="text-[11px] leading-tight text-[#784600] font-medium">
            <span className="font-bold mr-1">[{t.disclaimerBadge}]</span>
            {t.disclaimerText}
          </p>
        </div>
      </div>
    </div>
  );
};

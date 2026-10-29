import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Globe,
  Wifi,
  WifiOff,
  RefreshCw,
  Search,
  Check,
  Shield,
  Building2,
  ChevronDown,
  UserCheck,
  Calendar,
  Clock,
  Glasses
} from 'lucide-react';

export const Header: React.FC<{ onSearchClick?: () => void }> = ({ onSearchClick }) => {
  const {
    language,
    setLanguage,
    t,
    currentUser,
    users,
    switchUser,
    isOnline,
    offlineQueueCount,
    resetDemoData,
    loading,
    agency,
    setActiveTab,
    seniorMode,
    toggleSeniorMode
  } = useApp();

  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>(() => {
    return new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' });
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }));
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const todayFormatted = new Date().toLocaleDateString('hi-IN', {
    day: 'numeric',
    month: 'short',
  });

  // Avatar initials and color
  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const getAvatarBg = (role: string) => {
    if (role === 'OWNER') return 'bg-[#1a73e8] text-white';
    if (role === 'SUPERVISOR') return 'bg-[#137333] text-white';
    return 'bg-[#f29900] text-slate-950';
  };

  return (
    <header className="bg-white border-b border-gray-200/80 sticky top-0 z-40 transition-colors">
      <div className="max-w-4xl mx-auto px-3.5 py-2 flex items-center justify-between gap-2.5">
        {/* Left: Google Apps Style Brand Pill */}
        <div
          onClick={() => setActiveTab('home')}
          className="flex items-center space-x-2.5 cursor-pointer group select-none shrink-0"
        >
          {/* Google Pay / Files inspired emblem */}
          <div className="w-9 h-9 rounded-full bg-[#1a73e8] flex items-center justify-center shadow-xs text-white font-extrabold text-lg">
            <span className="font-sans">₹</span>
          </div>

          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-base tracking-tight text-[#1f1f1f]">
                HDBI
              </span>
              <span className="text-[10px] bg-[#e8f0fe] text-[#1a73e8] font-semibold px-2 py-0.5 rounded-full">
                {currentUser.role}
              </span>
            </div>
            <p className="text-[10px] text-gray-500 font-normal leading-none">
              {agency?.name || 'Bank Collection Agency'}
            </p>
          </div>
        </div>

        {/* Center / Search quick trigger for Google look */}
        <div
          onClick={() => setActiveTab('customers')}
          className="hidden sm:flex flex-1 max-w-sm items-center space-x-2 bg-[#f1f3f4] hover:bg-[#e8eaed] text-gray-600 px-3.5 py-2 rounded-full cursor-pointer transition text-xs border border-transparent hover:border-gray-300"
        >
          <Search className="w-4 h-4 text-gray-500" />
          <span className="truncate text-gray-500 font-medium">{t.searchPlaceholder}</span>
        </div>

        {/* Center: Live Date & Time Stamp (Ultra-prominent for Elderly / Field Agents) */}
        <div className="flex items-center space-x-1.5 bg-[#f1f3f4] text-[#1f1f1f] px-3 py-1.5 rounded-full border border-gray-200 text-xs font-bold shadow-2xs">
          <Calendar className="w-3.5 h-3.5 text-[#1a73e8]" />
          <span>{todayFormatted}</span>
          <span className="text-gray-400">•</span>
          <Clock className="w-3.5 h-3.5 text-[#137333]" />
          <span>{currentTime}</span>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          {/* Senior Mode Toggle (वृद्ध व सरल मोड) */}
          <button
            onClick={toggleSeniorMode}
            className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-full text-xs font-bold transition shadow-2xs border ${
              seniorMode
                ? 'bg-[#1a73e8] text-white border-[#1a73e8]'
                : 'bg-white hover:bg-gray-100 text-[#1f1f1f] border-gray-300'
            }`}
            title="वृद्ध जनों हेतु बड़ा व सरल मोड (Senior Easy Mode)"
            aria-label="Toggle Senior Mode"
          >
            <Glasses className="w-4 h-4" />
            <span className="hidden sm:inline">{seniorMode ? 'सरल मोड सक्रिय' : 'सरल मोड'}</span>
          </button>

          {/* Language Toggle Chip */}
          <button
            onClick={() => setLanguage(language === 'hi' ? 'en' : 'hi')}
            className="flex items-center space-x-1 bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold px-2.5 py-1.5 rounded-full border border-gray-300 transition"
            aria-label="Toggle language"
          >
            <Globe className="w-3.5 h-3.5 text-[#1a73e8]" />
            <span>{language === 'hi' ? 'English' : 'हिंदी'}</span>
          </button>

          {/* Online / Offline status indicator */}
          <div
            className={`hidden md:flex items-center space-x-1 px-2.5 py-1.5 rounded-full text-[11px] font-medium border ${
              isOnline
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
            title={isOnline ? t.onlineSync : t.offlineMode}
          >
            {isOnline ? <Wifi className="w-3 h-3 text-emerald-600" /> : <WifiOff className="w-3 h-3 text-rose-600" />}
            <span>{isOnline ? 'Online' : 'Offline'}</span>
          </div>

          {/* Google Account Avatar Button */}
          <div className="relative">
            <button
              onClick={() => setShowAccountMenu(!showAccountMenu)}
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-xs ring-2 ring-offset-2 ring-gray-200 hover:ring-[#1a73e8] transition ${getAvatarBg(
                currentUser.role
              )}`}
              aria-label="Google Account"
            >
              {getInitials(currentUser.name)}
            </button>

            {/* Google Account Switcher Modal Dialog */}
            {showAccountMenu && (
              <div className="absolute right-0 mt-2.5 w-80 bg-white rounded-3xl shadow-xl border border-gray-200 p-4 z-50 text-[#1f1f1f] animate-in fade-in zoom-in-95 duration-100">
                {/* Current Active Account Header */}
                <div className="text-center pb-3 border-b border-gray-100">
                  <div
                    className={`w-14 h-14 rounded-full mx-auto flex items-center justify-center font-bold text-lg mb-2 ${getAvatarBg(
                      currentUser.role
                    )}`}
                  >
                    {getInitials(currentUser.name)}
                  </div>
                  <h3 className="font-bold text-sm text-[#1f1f1f]">{currentUser.name}</h3>
                  <p className="text-xs text-gray-500 font-sans">{currentUser.email}</p>
                  <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider bg-blue-50 text-[#1a73e8] px-2.5 py-0.5 rounded-full border border-blue-200">
                    {currentUser.role}
                  </span>
                </div>

                {/* Account Switcher List */}
                <div className="py-2 space-y-1">
                  <p className="text-[11px] font-semibold text-gray-500 px-2 py-1 uppercase tracking-wider">
                    {t.switchRole}
                  </p>
                  {users.map((u) => {
                    const isSelected = u.id === currentUser.id;
                    return (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUser(u.id);
                          setShowAccountMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-2xl text-xs flex items-center justify-between transition ${
                          isSelected
                            ? 'bg-[#e8f0fe] text-[#1a73e8] font-bold'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${getAvatarBg(
                              u.role
                            )}`}
                          >
                            {getInitials(u.name)}
                          </div>
                          <div className="truncate">
                            <div className="font-semibold truncate">{u.name}</div>
                            <div className="text-[10px] text-gray-500">{u.role}</div>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#1a73e8] shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {/* Reset Demo / Footer */}
                <div className="pt-2 border-t border-gray-100">
                  <button
                    onClick={() => {
                      resetDemoData();
                      setShowAccountMenu(false);
                    }}
                    disabled={loading}
                    className="w-full flex items-center justify-center space-x-1.5 px-3 py-2 rounded-full text-xs bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium transition"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    <span>Reset Demo Data</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

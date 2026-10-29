import React from 'react';
import { useApp } from '../context/AppContext';
import { LayoutDashboard, Users, WalletCards, MapPin, MoreHorizontal } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, t, customers } = useApp();

  const todayDay = new Date().getDate();
  const dueCount = customers.filter(
    (c) => c.status === 'ACTIVE' && (c.scheduledDay === todayDay || c.scheduledDay === 0)
  ).length;

  const navItems = [
    { id: 'home', label: t.navHome, icon: LayoutDashboard },
    { id: 'customers', label: t.navCustomers, icon: Users, badge: customers.length },
    { id: 'collection', label: t.navCollection, icon: WalletCards },
    { id: 'tasks', label: t.navTasks, icon: MapPin, badge: dueCount > 0 ? dueCount : undefined },
    { id: 'more', label: t.navMore, icon: MoreHorizontal },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#f0f4f9] border-t border-gray-200/90 z-40 pb-safe">
      <div className="max-w-md mx-auto grid grid-cols-5 h-18 py-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="flex flex-col items-center justify-center relative select-none transition-colors"
              aria-label={item.label}
            >
              {/* Material 3 Active Pill Container */}
              <div
                className={`relative w-14 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                  isActive ? 'bg-[#c2e7ff] text-[#001d35]' : 'bg-transparent text-[#444746] hover:bg-gray-200/50'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                {item.badge !== undefined && (
                  <span className="absolute -top-1 -right-1 bg-[#b3261e] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full leading-tight shadow-2xs">
                    {item.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[11px] mt-1 tracking-tight ${
                  isActive ? 'font-bold text-[#001d35]' : 'font-medium text-[#444746]'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

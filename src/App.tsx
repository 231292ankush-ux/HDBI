import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { DashboardView } from './components/DashboardView';
import { CustomerListView } from './components/CustomerListView';
import { SmartRouteTasksView } from './components/SmartRouteTasksView';
import { CashHandoverView } from './components/CashHandoverView';
import { ReportsView } from './components/ReportsView';
import { RemindersQueueView } from './components/RemindersQueueView';
import { StaffManagementView } from './components/StaffManagementView';
import { AuditLogsView } from './components/AuditLogsView';
import { MoreMenuView } from './components/MoreMenuView';
import { CustomerDetailModal } from './components/CustomerDetailModal';
import { AddCustomerModal } from './components/AddCustomerModal';
import { CollectionModal } from './components/CollectionModal';
import { SetupWizardModal } from './components/SetupWizardModal';
import { Customer } from './types';
import { ArrowLeft, Sparkles } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab, setActiveTab, activeSubView, setActiveSubView, loading } = useApp();

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [collectionModalCustomer, setCollectionModalCustomer] = useState<Customer | null>(null);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [showSetupWizard, setShowSetupWizard] = useState(false);

  // Register PWA service worker
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => console.log('SW registered:', reg.scope))
        .catch((err) => console.log('SW registration error:', err));
    }
  }, []);

  const handleStartRoute = () => {
    setActiveTab('tasks');
  };

  const handleOpenRecordForCustomer = (cust: Customer) => {
    setCollectionModalCustomer(cust);
    setShowCollectionModal(true);
  };

  const handleOpenRecordModalGeneral = () => {
    setCollectionModalCustomer(null);
    setShowCollectionModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-white">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black text-2xl shadow-xl shadow-amber-500/20 animate-pulse mb-4">
          ₹
        </div>
        <h2 className="text-lg font-black tracking-tight text-white">HDBI</h2>
        <p className="text-xs text-slate-400 mt-1">डेटाबेस व बैंक रिकॉर्ड्स लोड हो रहे हैं...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      <Header />
      <DisclaimerBanner />

      <main className="flex-1 max-w-4xl w-full mx-auto p-3 sm:p-5">
        {/* If SubView is active from More Menu */}
        {activeSubView ? (
          <div>
            <button
              onClick={() => setActiveSubView(null)}
              className="mb-3 inline-flex items-center space-x-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>वापस (Back)</span>
            </button>

            {activeSubView === 'handover' && <CashHandoverView />}
            {activeSubView === 'reports' && <ReportsView />}
            {activeSubView === 'reminders' && <RemindersQueueView />}
            {activeSubView === 'employees' && <StaffManagementView />}
            {activeSubView === 'audit' && <AuditLogsView />}
          </div>
        ) : (
          <>
            {activeTab === 'home' && (
              <DashboardView
                onStartRoute={handleStartRoute}
                onOpenRecordModal={handleOpenRecordModalGeneral}
                onOpenAddCustomer={() => setShowAddCustomerModal(true)}
                onOpenHandover={() => setActiveSubView('handover')}
                onOpenReports={() => setActiveSubView('reports')}
                onOpenReminders={() => setActiveSubView('reminders')}
              />
            )}

            {activeTab === 'customers' && (
              <CustomerListView
                onSelectCustomer={(cust) => setSelectedCustomer(cust)}
                onOpenAddModal={() => setShowAddCustomerModal(true)}
                onRecordForCustomer={handleOpenRecordForCustomer}
              />
            )}

            {activeTab === 'collection' && (
              <CustomerListView
                onSelectCustomer={(cust) => setSelectedCustomer(cust)}
                onOpenAddModal={() => setShowAddCustomerModal(true)}
                onRecordForCustomer={handleOpenRecordForCustomer}
              />
            )}

            {activeTab === 'tasks' && (
              <SmartRouteTasksView
                onRecordForCustomer={handleOpenRecordForCustomer}
                onSelectCustomer={(cust) => setSelectedCustomer(cust)}
              />
            )}

            {activeTab === 'more' && (
              <MoreMenuView
                onOpenView={(viewName) => setActiveSubView(viewName)}
                onOpenWizard={() => setShowSetupWizard(true)}
              />
            )}
          </>
        )}
      </main>

      <BottomNav />

      {/* Modals */}
      {selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          onRecordPayment={(cust) => handleOpenRecordForCustomer(cust)}
        />
      )}

      {showAddCustomerModal && (
        <AddCustomerModal
          onClose={() => setShowAddCustomerModal(false)}
          onSuccess={() => {}}
        />
      )}

      {showCollectionModal && (
        <CollectionModal
          initialCustomer={collectionModalCustomer}
          onClose={() => {
            setShowCollectionModal(false);
            setCollectionModalCustomer(null);
          }}
          onSuccess={() => {}}
        />
      )}

      {showSetupWizard && (
        <SetupWizardModal onClose={() => setShowSetupWizard(false)} />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}

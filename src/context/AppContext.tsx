import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Customer, Collection, CashHandover, User, AgencyConfig, AuditLog, Role } from '../types';
import { translations, Language } from '../lib/translations';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.hi;
  currentUser: User;
  users: User[];
  switchUser: (userId: string) => void;
  agency: AgencyConfig | null;
  customers: Customer[];
  collections: Collection[];
  handovers: CashHandover[];
  auditLogs: AuditLog[];
  loading: boolean;
  activeTab: 'home' | 'customers' | 'collection' | 'tasks' | 'more';
  setActiveTab: (tab: 'home' | 'customers' | 'collection' | 'tasks' | 'more') => void;
  selectedCustomerId: string | null;
  setSelectedCustomerId: (id: string | null) => void;
  activeSubView: string | null;
  setActiveSubView: (view: string | null) => void;
  isOnline: boolean;
  offlineQueueCount: number;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  seniorMode: boolean;
  toggleSeniorMode: () => void;
  // Operations
  refreshData: () => Promise<void>;
  addCustomer: (custData: Partial<Customer>) => Promise<{ success: boolean; error?: string; customer?: Customer }>;
  updateCustomer: (id: string, custData: Partial<Customer>) => Promise<{ success: boolean; error?: string }>;
  recordCollection: (colData: Partial<Collection>) => Promise<{ success: boolean; error?: string; collection?: Collection }>;
  verifyCollection: (id: string) => Promise<{ success: boolean; error?: string }>;
  reverseCollection: (id: string, reason: string) => Promise<{ success: boolean; error?: string }>;
  recordHandover: (handoverData: Partial<CashHandover>) => Promise<{ success: boolean; error?: string }>;
  resetDemoData: () => Promise<void>;
  importCustomersFromCSV: (csvText: string) => Promise<{ success: boolean; count: number; errors: string[] }>;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('hi');
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User>({
    id: 'USR-OWNER-01',
    name: 'Rajesh Sharma (Agency Owner)',
    email: 'owner@hdbi.in',
    phone: '+91 9810123456',
    role: 'OWNER',
    assignedLocalities: ['All Localities'],
    active: true,
    dailyTarget: 50000,
  });
  const [agency, setAgency] = useState<AgencyConfig | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [handovers, setHandovers] = useState<CashHandover[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'home' | 'customers' | 'collection' | 'tasks' | 'more'>('home');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [activeSubView, setActiveSubView] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState<any[]>(() => {
    try {
      const q = localStorage.getItem('hdbi_offline_queue');
      return q ? JSON.parse(q) : [];
    } catch {
      return [];
    }
  });
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [seniorMode, setSeniorMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('hdbi_senior_mode') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSeniorMode = () => {
    setSeniorMode((prev) => {
      const next = !prev;
      localStorage.setItem('hdbi_senior_mode', String(next));
      return next;
    });
  };

  const t = translations[language];

  // Set language with persistence
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('hdbi_lang', lang);
  };

  useEffect(() => {
    const saved = localStorage.getItem('hdbi_lang') as Language;
    if (saved && (saved === 'hi' || saved === 'en')) {
      setLanguageState(saved);
    }
  }, []);

  // Online / Offline tracking
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync offline queue when back online
  useEffect(() => {
    if (isOnline && offlineQueue.length > 0) {
      const syncQueue = async () => {
        const item = offlineQueue[0];
        try {
          if (item.type === 'COLLECTION') {
            await fetch('/api/collections', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(item.data),
            });
          }
          const nextQueue = offlineQueue.slice(1);
          setOfflineQueue(nextQueue);
          localStorage.setItem('hdbi_offline_queue', JSON.stringify(nextQueue));
        } catch (err) {
          console.error('Failed to sync offline item', err);
        }
      };
      syncQueue();
    }
  }, [isOnline, offlineQueue]);

  // Fetch initial data from server using high-speed bootstrap endpoint
  const refreshData = useCallback(async () => {
    try {
      const res = await fetch(`/api/bootstrap?currentRole=${currentUser.role}&currentUserId=${currentUser.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.agency) setAgency(data.agency);
        if (data.users) {
          setUsers(data.users);
          const me = data.users.find((u: User) => u.id === currentUser.id);
          if (me) setCurrentUser(me);
        }
        if (data.customers) setCustomers(data.customers);
        if (data.collections) setCollections(data.collections);
        if (data.handovers) setHandovers(data.handovers);
        if (data.auditLogs) setAuditLogs(data.auditLogs);
      }
    } catch (err) {
      console.error('Error fetching data from API:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser.id, currentUser.role]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Switch role / user
  const switchUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target) {
      setCurrentUser(target);
      // Automatically refresh customer view according to RBAC
      setTimeout(() => {
        refreshData();
      }, 50);
    }
  };

  // Add Customer
  const addCustomer = async (custData: Partial<Customer>) => {
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(custData),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to add customer' };
      }
      await refreshData();
      return { success: true, customer: data };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  // Update Customer
  const updateCustomer = async (id: string, custData: Partial<Customer>) => {
    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(custData),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to update customer' };
      }
      await refreshData();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  // Record Collection
  const recordCollection = async (colData: Partial<Collection>) => {
    const payload = {
      ...colData,
      employeeId: currentUser.id,
      idempotencyKey: colData.idempotencyKey || `IDEMP-${Date.now()}-${Math.random()}`,
    };

    if (!isOnline) {
      // Save locally to offline queue
      const offlineItem = {
        type: 'COLLECTION',
        data: payload,
        queuedAt: new Date().toISOString(),
      };
      const updatedQueue = [...offlineQueue, offlineItem];
      setOfflineQueue(updatedQueue);
      localStorage.setItem('hdbi_offline_queue', JSON.stringify(updatedQueue));

      // Local optimistic record
      const optimisticCol: Collection = {
        id: `OFFLINE-${Date.now()}`,
        customerId: payload.customerId || '',
        amount: Number(payload.amount) || 0,
        expectedAmount: Number(payload.expectedAmount) || 0,
        paymentMethod: payload.paymentMethod || 'CASH',
        outcome: payload.outcome || 'COLLECTED',
        status: 'RECORDED',
        collectedAt: new Date().toISOString(),
        employeeId: currentUser.id,
        referenceNumber: payload.referenceNumber,
        notes: payload.notes,
        idempotencyKey: payload.idempotencyKey,
      };
      setCollections((prev) => [optimisticCol, ...prev]);
      return { success: true, collection: optimisticCol };
    }

    try {
      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to record collection' };
      }
      await refreshData();
      return { success: true, collection: data };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  // Verify Collection
  const verifyCollection = async (id: string) => {
    try {
      const res = await fetch(`/api/collections/${id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verifiedBy: currentUser.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Verification failed' };
      }
      await refreshData();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  // Reverse Collection
  const reverseCollection = async (id: string, reason: string) => {
    try {
      const res = await fetch(`/api/collections/${id}/reverse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, reversedBy: currentUser.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Reversal failed' };
      }
      await refreshData();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  // Record Cash Handover
  const recordHandover = async (handoverData: Partial<CashHandover>) => {
    try {
      const res = await fetch('/api/handovers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...handoverData,
          employeeId: currentUser.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Handover submission failed' };
      }
      await refreshData();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  // Reset to Demo Data
  const resetDemoData = async () => {
    try {
      setLoading(true);
      await fetch('/api/reset-demo', { method: 'POST' });
      await refreshData();
    } catch (err) {
      console.error('Failed to reset demo data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Import Customers CSV
  const importCustomersFromCSV = async (csvText: string) => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      return { success: false, count: 0, errors: ['CSV file must contain a header and at least one customer row'] };
    }

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const nameIdx = headers.findIndex((h) => h.includes('name'));
    const phoneIdx = headers.findIndex((h) => h.includes('phone') || h.includes('mobile'));
    const bankIdx = headers.findIndex((h) => h.includes('bank'));
    const amountIdx = headers.findIndex((h) => h.includes('amount') || h.includes('installment'));
    const localityIdx = headers.findIndex((h) => h.includes('locality') || h.includes('village') || h.includes('area'));

    if (nameIdx === -1 || phoneIdx === -1) {
      return {
        success: false,
        count: 0,
        errors: ['CSV must have at least "name" and "phone" columns'],
      };
    }

    let successCount = 0;
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
      if (row.length < 2 || !row[nameIdx]) continue;

      const name = row[nameIdx];
      const phone = row[phoneIdx];
      const bankName = bankIdx !== -1 && row[bankIdx] ? row[bankIdx] : 'State Bank of India';
      const installmentAmount = amountIdx !== -1 ? Number(row[amountIdx]) || 1000 : 1000;
      const locality = localityIdx !== -1 && row[localityIdx] ? row[localityIdx] : 'Central';

      const res = await addCustomer({
        name,
        phone,
        bankName,
        installmentAmount,
        locality,
        frequency: 'MONTHLY',
        scheduledDay: 1,
        consentGiven: true,
      });

      if (res.success) {
        successCount++;
      } else {
        errors.push(`Row ${i} (${name}): ${res.error}`);
      }
    }

    await refreshData();
    return {
      success: successCount > 0,
      count: successCount,
      errors,
    };
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        t,
        currentUser,
        users,
        switchUser,
        agency,
        customers,
        collections,
        handovers,
        auditLogs,
        loading,
        activeTab,
        setActiveTab,
        selectedCustomerId,
        setSelectedCustomerId,
        activeSubView,
        setActiveSubView,
        isOnline,
        offlineQueueCount: offlineQueue.length,
        selectedDate,
        setSelectedDate,
        seniorMode,
        toggleSeniorMode,
        refreshData,
        addCustomer,
        updateCustomer,
        recordCollection,
        verifyCollection,
        reverseCollection,
        recordHandover,
        resetDemoData,
        importCustomersFromCSV,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

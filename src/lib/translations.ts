export type Language = 'hi' | 'en';

export const translations = {
  hi: {
    appTitle: 'HDBI',
    tagline: 'ग्राहक प्रबंधित करें। कलेक्शन ट्रैक करें। सब कुछ नियंत्रित रखें।',
    disclaimerBadge: 'अधिकृत कलेक्शन एजेंट टूल',
    disclaimerText: 'यह ऐप रिकॉर्ड-कीपिंग टूल है। यहाँ दर्ज भुगतान बैंक में जमा होने का प्रमाण नहीं है। केवल बैंक सत्यापन या आधिकारिक रसीद से ही जमा माना जाएगा।',
    
    // Bottom Nav
    navHome: 'होम',
    navCustomers: 'ग्राहक',
    navCollection: 'कलेक्शन',
    navTasks: 'कार्य',
    navMore: 'अधिक',

    // Top Bar
    startCollection: 'आज का कलेक्शन शुरू करें',
    switchRole: 'भूमिका बदलें',
    demoModeBadge: 'डेमो डेटा एक्टिव',
    roleOwner: 'मालिक / एडमिन',
    roleSupervisor: 'सुपरवाइज़र',
    roleAgent: 'फील्ड कलेक्शन एजेंट',

    // Dashboard
    todaySummary: 'आज का दैनिक सारांश',
    expectedToday: 'आज अपेक्षित कलेक्शन',
    verifiedCollected: 'सत्यापित कलेक्शन',
    pendingVerification: 'पुष्टि प्रतीक्षित (Pending)',
    totalActiveCust: 'सक्रिय ग्राहक',
    overdueInstallments: 'बकाया किस्तें',
    uncontactedCust: 'संपर्क शेष',
    unavailableCust: 'अनुपलब्ध / घर पर नहीं',
    postponedCust: 'तारीख माँगी',
    declinedCust: 'भुगतान से मना',

    // Quick Actions
    quickActions: 'त्वरित कार्य',
    recordPayment: 'भुगतान दर्ज करें',
    addCustomer: 'नया ग्राहक जोड़ें',
    cashHandover: 'कैश हैंडओवर',
    generateReport: 'दैनिक रिपोर्ट',
    remindersQueue: 'रिमाइंडर कतार',

    // Route Planner / Tasks
    routePlanner: 'स्मार्ट रूट प्लानर',
    byLocality: 'इलाका अनुसार',
    allLocalities: 'सभी इलाके',
    filterPriority: 'प्राथमिकता',
    dueTodayOnly: 'केवल आज देय',
    highPriority: 'अति आवश्यक (बकाया)',
    reassignTask: 'कर्मचारी बदलें',
    callCustomer: 'कॉल करें',
    whatsappMessage: 'व्हाट्सएप',
    recordOutcome: 'स्थिति दर्ज करें',

    // Outcomes
    outcomeCollected: 'भुगतान प्राप्त हुआ',
    outcomeUnavailable: 'ग्राहक अनुपलब्ध (घर पर नहीं)',
    outcomePostponed: 'अगली तारीख माँगी (Postponed)',
    outcomeDeclined: 'भुगतान से मना किया',
    outcomeUnreachable: 'संपर्क नहीं हो सका',
    outcomeDirectBank: 'बैंक में सीधे जमा किया',
    outcomeVerifyNeeded: 'सत्यापन आवश्यक',

    // Payment Methods
    methodCash: 'नकद (Cash)',
    methodUpi: 'UPI / क्यूआर कोड',
    methodCheque: 'चेक (Cheque)',
    methodBankTransfer: 'बैंक ट्रांसफर / NEFT',

    // Customer Detail & Ledger
    customerProfile: 'ग्राहक प्रोफ़ाइल',
    rdDetails: 'RD खाता विवरण',
    installmentAmount: 'किस्त राशि',
    frequency: 'आवृत्ति (Frequency)',
    scheduledDay: 'निर्धारित दिन',
    accountNumber: 'खाता / पासबुक संदर्भ',
    bankName: 'बैंक का नाम',
    branch: 'शाखा',
    assignedStaff: 'आवंटित कर्मचारी',
    locality: 'इलाका / गाँव',
    paymentLedger: 'भुगतान लेजर (Passbook)',
    verificationStatus: 'सत्यापन स्थिति',
    statusVerified: 'सत्यापित (Verified)',
    statusSubmitted: 'प्रतीक्षारत (Submitted)',
    statusRecorded: 'दर्ज (Recorded)',
    statusReversed: 'रद्द / संशोधित (Reversed)',

    // Cash Handover
    handoverTitle: 'दैनिक कैश हैंडओवर व मिलान',
    totalCashCollectedToday: 'एजेंट द्वारा आज एकत्रित नकद',
    amountHandedOver: 'हैंडओवर की गई नकद राशि',
    recipient: 'प्राप्तकर्ता का नाम',
    discrepancy: 'अंतर (Discrepancy)',
    balanced: 'संतुलित (कोई अंतर नहीं)',
    shortage: 'कमी (कम जमा हुआ)',
    excess: 'अधिक (ज्यादा जमा हुआ)',
    confirmHandover: 'हैंडओवर पावती दर्ज करें',

    // Employees
    employeeManagement: 'कर्मचारी प्रबंधन',
    addEmployee: 'नया कर्मचारी जोड़ें',
    assignedCount: 'सौंपे गए ग्राहक',
    todayContacted: 'आज संपर्क किए',
    verifiedTotal: 'सत्यापित राशि',
    pendingTotal: 'प्रतीक्षित राशि',
    dailyTarget: 'दैनिक लक्ष्य',
    suspendAccess: 'खाता निलंबित करें',

    // Reports & Exports
    reportsTitle: 'रिपोर्ट्स व ऑडिट',
    dailyReport: 'दैनिक कलेक्शन रिपोर्ट',
    employeeReport: 'कर्मचारी-वार प्रदर्शन',
    ledgerStatement: 'ग्राहक लेजर स्टेटमेंट',
    discrepancyReport: 'कैश मिलान व विसंगति रिपोर्ट',
    exportCsv: 'CSV डाउनलोड करें',
    printReport: 'प्रिंट / PDF देखें',

    // Reminders
    remindersTitle: 'व्हाट्सएप व एसएमएस रिमाइंडर',
    sendNotice: 'रिमाइंडर भेजें',
    templateHindi: 'हिंदी संदेश',
    templateEnglish: 'अंग्रेज़ी संदेश',
    copyTemplate: 'कॉपी करें',
    openWhatsApp: 'सीधे WhatsApp पर भेजें',

    // Common
    save: 'सहेजें',
    cancel: 'रद्द करें',
    confirm: 'पुष्टि करें',
    searchPlaceholder: 'नाम, मोबाइल या ग्राहक आईडी खोजें...',
    loading: 'लोड हो रहा है...',
    success: 'सफलतापूर्वक सहेजा गया',
    offlineMode: 'ऑफ़लाइन मोड (लोकल सेव्ड)',
    onlineSync: 'डेटा सिंक हो चुका है'
  },
  en: {
    appTitle: 'HDBI',
    tagline: 'Manage Customers. Track Collections. Control Everything.',
    disclaimerBadge: 'Authorized Collection Agent Tool',
    disclaimerText: 'This app is a collection management & record-keeping tool. Recorded payments do NOT constitute bank deposits until confirmed via authorized integration or official deposit evidence.',
    
    // Bottom Nav
    navHome: 'Home',
    navCustomers: 'Customers',
    navCollection: 'Collection',
    navTasks: 'Tasks',
    navMore: 'More',

    // Top Bar
    startCollection: "Start Today's Collection",
    switchRole: 'Switch Role',
    demoModeBadge: 'Demo Data Active',
    roleOwner: 'Owner / Admin',
    roleSupervisor: 'Supervisor',
    roleAgent: 'Field Collection Agent',

    // Dashboard
    todaySummary: "Today's Operational Summary",
    expectedToday: 'Expected Collection Today',
    verifiedCollected: 'Verified Collections',
    pendingVerification: 'Pending Confirmation',
    totalActiveCust: 'Active Customers',
    overdueInstallments: 'Overdue Installments',
    uncontactedCust: 'Uncontacted',
    unavailableCust: 'Unavailable / Not Home',
    postponedCust: 'Postponed / Requested Time',
    declinedCust: 'Declined Payment',

    // Quick Actions
    quickActions: 'Quick Actions',
    recordPayment: 'Record Collection',
    addCustomer: 'Add Customer',
    cashHandover: 'Cash Handover',
    generateReport: 'Daily Report',
    remindersQueue: 'Reminders Queue',

    // Route Planner / Tasks
    routePlanner: 'Smart Route Planner',
    byLocality: 'By Locality',
    allLocalities: 'All Localities',
    filterPriority: 'Priority',
    dueTodayOnly: 'Due Today Only',
    highPriority: 'High Priority (Overdue)',
    reassignTask: 'Reassign Agent',
    callCustomer: 'Call',
    whatsappMessage: 'WhatsApp',
    recordOutcome: 'Record Outcome',

    // Outcomes
    outcomeCollected: 'Payment Collected',
    outcomeUnavailable: 'Customer Unavailable',
    outcomePostponed: 'Requested Another Time',
    outcomeDeclined: 'Customer Declined Payment',
    outcomeUnreachable: 'Could Not Be Contacted',
    outcomeDirectBank: 'Paid Direct to Bank',
    outcomeVerifyNeeded: 'Needs Verification',

    // Payment Methods
    methodCash: 'Cash',
    methodUpi: 'UPI / QR Code',
    methodCheque: 'Cheque',
    methodBankTransfer: 'Bank Transfer / NEFT',

    // Customer Detail & Ledger
    customerProfile: 'Customer Profile',
    rdDetails: 'RD Account Details',
    installmentAmount: 'Installment Amount',
    frequency: 'Frequency',
    scheduledDay: 'Scheduled Day',
    accountNumber: 'RD Account / Passbook Ref',
    bankName: 'Bank Name',
    branch: 'Branch',
    assignedStaff: 'Assigned Staff',
    locality: 'Locality / Village',
    paymentLedger: 'Customer Installment Ledger',
    verificationStatus: 'Verification Status',
    statusVerified: 'Verified',
    statusSubmitted: 'Submitted',
    statusRecorded: 'Recorded',
    statusReversed: 'Reversed / Adjusted',

    // Cash Handover
    handoverTitle: 'Daily Cash Handover & Reconciliation',
    totalCashCollectedToday: 'Cash Collected Today by Agent',
    amountHandedOver: 'Amount Handed Over',
    recipient: 'Recipient Name',
    discrepancy: 'Discrepancy',
    balanced: 'Balanced (No Shortage)',
    shortage: 'Shortage',
    excess: 'Excess',
    confirmHandover: 'Record Handover Acknowledgment',

    // Employees
    employeeManagement: 'Staff Management',
    addEmployee: 'Add Employee',
    assignedCount: 'Assigned Customers',
    todayContacted: 'Contacted Today',
    verifiedTotal: 'Verified Total',
    pendingTotal: 'Pending Total',
    dailyTarget: 'Daily Target',
    suspendAccess: 'Suspend Access',

    // Reports & Exports
    reportsTitle: 'Reports & Audit',
    dailyReport: 'Daily Collection Report',
    employeeReport: 'Employee-wise Performance',
    ledgerStatement: 'Customer Ledger Statement',
    discrepancyReport: 'Cash Handover & Discrepancies',
    exportCsv: 'Export CSV',
    printReport: 'Print / PDF View',

    // Reminders
    remindersTitle: 'WhatsApp & SMS Reminders',
    sendNotice: 'Send Reminder',
    templateHindi: 'Hindi Template',
    templateEnglish: 'English Template',
    copyTemplate: 'Copy Template',
    openWhatsApp: 'Send via WhatsApp',

    // Common
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    searchPlaceholder: 'Search name, phone, or customer ID...',
    loading: 'Loading...',
    success: 'Saved successfully',
    offlineMode: 'Offline Mode (Saved locally)',
    onlineSync: 'Data synchronized'
  }
};

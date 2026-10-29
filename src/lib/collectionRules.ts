/**
 * Pure financial & collection rules for HDBI Smart Collection Manager
 * Decoupled from React UI for fast deterministic testing and server-side reuse.
 */

export type PaymentMethod = 'CASH' | 'UPI_QR' | 'CHEQUE' | 'BANK_TRANSFER' | 'NET_BANKING';

export type CollectionOutcome =
  | 'COLLECTED'
  | 'CUSTOMER_UNAVAILABLE'
  | 'REQUESTED_ANOTHER_TIME'
  | 'CUSTOMER_DECLINED'
  | 'COULD_NOT_BE_CONTACTED'
  | 'PAYMENT_ALREADY_MADE_DIRECT'
  | 'NEEDS_VERIFICATION'
  | 'OTHER';

export type VerificationStatus =
  | 'RECORDED'
  | 'SUBMITTED'
  | 'VERIFIED'
  | 'REJECTED'
  | 'REVERSED';

export interface CollectionRecord {
  id: string;
  customerId: string;
  scheduleId: string;
  amount: number;
  expectedAmount: number;
  paymentMethod: PaymentMethod;
  outcome: CollectionOutcome;
  status: VerificationStatus;
  collectedAt: string;
  employeeId: string;
  referenceNumber?: string;
  notes?: string;
  idempotencyKey?: string;
  reversalReason?: string;
}

export interface CashHandoverRecord {
  id: string;
  employeeId: string;
  date: string;
  amountHandedOver: number;
  recipientName: string;
  status: 'PENDING' | 'ACKNOWLEDGED' | 'DISPUTED';
  notes?: string;
}

/**
 * Format currency in Indian Rupees format (e.g. ₹ 1,25,000)
 */
export function formatINR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '₹0';
  const isNegative = amount < 0;
  const absAmount = Math.round(Math.abs(amount));
  const str = absAmount.toString();
  
  let lastThree = str.substring(str.length - 3);
  const otherNumbers = str.substring(0, str.length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
  return `${isNegative ? '-' : ''}₹${res}`;
}

/**
 * Validates a collection entry submission
 */
export function validateCollectionEntry(data: {
  customerId: string;
  scheduleId?: string;
  outcome: CollectionOutcome;
  amount?: number;
  paymentMethod?: PaymentMethod;
  idempotencyKey?: string;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.customerId || data.customerId.trim() === '') {
    errors.push('Customer ID is required');
  }

  if (data.outcome === 'COLLECTED') {
    if (data.amount === undefined || data.amount === null || isNaN(data.amount) || data.amount <= 0) {
      errors.push('A valid positive collection amount is required for collected payments');
    }
    if (!data.paymentMethod) {
      errors.push('Payment method (Cash, UPI, Cheque, Transfer) is required');
    }
  }

  if (!data.idempotencyKey || data.idempotencyKey.trim() === '') {
    errors.push('Idempotency token missing; duplicate submission check failed');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Reconciles cash collections for an employee against recorded cash handovers
 */
export function reconcileCashHandover(
  cashCollections: Array<{ amount: number; outcome: CollectionOutcome; status: VerificationStatus }>,
  handovers: Array<{ amountHandedOver: number; status: string }>
): {
  totalCashCollected: number;
  totalCashHandedOver: number;
  discrepancy: number;
  isBalanced: boolean;
} {
  const totalCashCollected = cashCollections
    .filter((c) => c.outcome === 'COLLECTED' && c.status !== 'REVERSED')
    .reduce((sum, c) => sum + (Number(c.amount) || 0), 0);

  const totalCashHandedOver = handovers
    .filter((h) => h.status === 'ACKNOWLEDGED')
    .reduce((sum, h) => sum + (Number(h.amountHandedOver) || 0), 0);

  const discrepancy = totalCashCollected - totalCashHandedOver;

  return {
    totalCashCollected,
    totalCashHandedOver,
    discrepancy,
    isBalanced: Math.abs(discrepancy) < 0.01
  };
}

/**
 * Calculate RD Installment due status
 */
export function getInstallmentDueStatus(
  dueDateStr: string,
  todayStr: string,
  recordedAmount: number,
  expectedAmount: number,
  verificationStatus?: VerificationStatus
): 'VERIFIED' | 'SUBMITTED' | 'RECORDED' | 'OVERDUE' | 'DUE_TODAY' | 'UPCOMING' | 'PARTIAL' {
  if (verificationStatus === 'VERIFIED') return 'VERIFIED';
  if (verificationStatus === 'SUBMITTED') return 'SUBMITTED';
  if (verificationStatus === 'RECORDED') {
    if (recordedAmount < expectedAmount && recordedAmount > 0) return 'PARTIAL';
    return 'RECORDED';
  }

  const dueDate = new Date(dueDateStr.split('T')[0]);
  const today = new Date(todayStr.split('T')[0]);

  if (dueDate.getTime() < today.getTime()) {
    return 'OVERDUE';
  } else if (dueDate.getTime() === today.getTime()) {
    return 'DUE_TODAY';
  }
  return 'UPCOMING';
}

/**
 * Calculates daily dashboard statistics
 */
export function calculateDailyStats(params: {
  todayStr: string;
  customers: Array<{ id: string; status: string }>;
  schedules: Array<{ id: string; customerId: string; installmentAmount: number; scheduledDay: number; status: string }>;
  collections: Array<CollectionRecord>;
}): {
  totalActiveCustomers: number;
  scheduledTodayCount: number;
  expectedCollectionToday: number;
  verifiedCollectedToday: number;
  pendingVerificationToday: number;
  totalCollectedToday: number;
  unavailableCount: number;
  postponedCount: number;
  declinedCount: number;
  notContactedCount: number;
} {
  const { todayStr, customers, schedules, collections } = params;
  const todayDate = new Date(todayStr.split('T')[0]);
  const dayOfMonth = todayDate.getDate();

  const activeCustomers = customers.filter((c) => c.status === 'ACTIVE');
  const activeCustomerIds = new Set(activeCustomers.map((c) => c.id));

  // Schedules due today (matching day of month or daily frequency)
  const dueSchedules = schedules.filter(
    (s) => s.status === 'ACTIVE' && activeCustomerIds.has(s.customerId) && (s.scheduledDay === dayOfMonth || s.scheduledDay === 0)
  );

  const scheduledTodayCount = dueSchedules.length;
  const expectedCollectionToday = dueSchedules.reduce((sum, s) => sum + (s.installmentAmount || 0), 0);

  // Collections recorded today
  const todayCollections = collections.filter(
    (c) => c.collectedAt.startsWith(todayStr.substring(0, 10)) && c.status !== 'REVERSED'
  );

  const verifiedCollectedToday = todayCollections
    .filter((c) => c.outcome === 'COLLECTED' && c.status === 'VERIFIED')
    .reduce((sum, c) => sum + (c.amount || 0), 0);

  const pendingVerificationToday = todayCollections
    .filter((c) => c.outcome === 'COLLECTED' && (c.status === 'RECORDED' || c.status === 'SUBMITTED'))
    .reduce((sum, c) => sum + (c.amount || 0), 0);

  const totalCollectedToday = verifiedCollectedToday + pendingVerificationToday;

  const unavailableCount = todayCollections.filter((c) => c.outcome === 'CUSTOMER_UNAVAILABLE').length;
  const postponedCount = todayCollections.filter((c) => c.outcome === 'REQUESTED_ANOTHER_TIME').length;
  const declinedCount = todayCollections.filter((c) => c.outcome === 'CUSTOMER_DECLINED').length;

  const contactedCustomerIds = new Set(todayCollections.map((c) => c.customerId));
  const dueCustomerIds = new Set(dueSchedules.map((s) => s.customerId));
  let notContactedCount = 0;
  for (const cid of dueCustomerIds) {
    if (!contactedCustomerIds.has(cid)) {
      notContactedCount++;
    }
  }

  return {
    totalActiveCustomers: activeCustomers.length,
    scheduledTodayCount,
    expectedCollectionToday,
    verifiedCollectedToday,
    pendingVerificationToday,
    totalCollectedToday,
    unavailableCount,
    postponedCount,
    declinedCount,
    notContactedCount
  };
}

/**
 * Generate official customer collection receipt acknowledgment text
 */
export function generateReceiptText(params: {
  receiptId: string;
  customerName: string;
  customerId: string;
  bankName: string;
  rdAccountNumber: string;
  amount: number;
  paymentMethod: string;
  referenceNumber?: string;
  dateStr: string;
  agentName: string;
  agencyName: string;
}): string {
  const {
    receiptId,
    customerName,
    customerId,
    bankName,
    rdAccountNumber,
    amount,
    paymentMethod,
    referenceNumber,
    dateStr,
    agentName,
    agencyName,
  } = params;

  return [
    `══════════════════════════════`,
    `      HDBI कलेक्शन रसीद (RECEIPT)      `,
    `      ${agencyName}      `,
    `══════════════════════════════`,
    `रसीद सं. (Receipt No): ${receiptId}`,
    `दिनांक व समय: ${dateStr}`,
    `------------------------------`,
    `ग्राहक का नाम: ${customerName}`,
    `ग्राहक आईडी: ${customerId}`,
    `बैंक का नाम: ${bankName}`,
    `RD खाता / पासबुक सं.: ${rdAccountNumber}`,
    `------------------------------`,
    `प्राप्त राशि: ${formatINR(amount)}`,
    `भुगतान माध्यम: ${paymentMethod}${referenceNumber ? ` (रिफ: ${referenceNumber})` : ''}`,
    `अधिकृत एजेंट: ${agentName}`,
    `══════════════════════════════`,
    `[महत्वपूर्ण सूचना]: यह अधिकृत एजेंट द्वारा प्राप्त RD किस्त की पावती है। बैंक में अंतिम जमा अधिकृत बैंक सत्यापन या आधिकारिक काउंटर रसीद से ही प्रमाणित होगा।`,
    `══════════════════════════════`,
  ].join('\n');
}


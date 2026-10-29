export type Role = 'OWNER' | 'SUPERVISOR' | 'AGENT';

export type PaymentMethod = 'CASH' | 'UPI_QR' | 'CHEQUE' | 'BANK_TRANSFER';

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
  | 'REVERSED';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  assignedLocalities: string[];
  active: boolean;
  dailyTarget: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  altPhone?: string;
  address: string;
  locality: string;
  assignedEmployeeId: string;
  status: 'ACTIVE' | 'INACTIVE';
  bankName: string;
  branchName: string;
  rdAccountNumber: string;
  installmentAmount: number;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  scheduledDay: number; // day of month (1-31), or 0 for daily
  startDate: string;
  maturityDate?: string;
  notes?: string;
  consentGiven: boolean;
  createdAt: string;
  lat?: number;
  lng?: number;
  locationAddress?: string;
}

export interface Collection {
  id: string;
  customerId: string;
  scheduleId?: string;
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
  verifiedAt?: string;
  verifiedBy?: string;
  duplicateDetected?: boolean;
  locationLat?: number;
  locationLng?: number;
  locationAddress?: string;
  locationAccuracy?: number;
  googleMapsUrl?: string;
  locationVerified?: boolean;
}

export interface GPSAuditStamp {
  lat: number;
  lng: number;
  locality: string;
  accuracy: number;
  timestamp: string;
  googleMapsUrl: string;
  verified: boolean;
}

export interface CashHandover {
  id: string;
  employeeId: string;
  date: string;
  amountHandedOver: number;
  totalCollected: number;
  recipientName: string;
  status: 'PENDING' | 'ACKNOWLEDGED' | 'DISPUTED';
  notes?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  entityType: string;
  entityId: string;
}

export interface AgencyConfig {
  name: string;
  ownerName: string;
  phone: string;
  defaultLanguage: 'hi' | 'en';
  timezone: string;
  initialized: boolean;
}

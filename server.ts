import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const DB_FILE = path.join(__dirname, 'data', 'hdbi_database.json');

app.use(express.json({ limit: '10mb' }));

// Ensure data folder exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}

// Interfaces
interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'OWNER' | 'SUPERVISOR' | 'AGENT';
  assignedLocalities: string[];
  active: boolean;
  dailyTarget: number;
}

interface Customer {
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
}

interface Collection {
  id: string;
  customerId: string;
  scheduleId?: string;
  amount: number;
  expectedAmount: number;
  paymentMethod: 'CASH' | 'UPI_QR' | 'CHEQUE' | 'BANK_TRANSFER';
  outcome: 'COLLECTED' | 'CUSTOMER_UNAVAILABLE' | 'REQUESTED_ANOTHER_TIME' | 'CUSTOMER_DECLINED' | 'COULD_NOT_BE_CONTACTED' | 'PAYMENT_ALREADY_MADE_DIRECT' | 'NEEDS_VERIFICATION' | 'OTHER';
  status: 'RECORDED' | 'SUBMITTED' | 'VERIFIED' | 'REVERSED';
  collectedAt: string;
  employeeId: string;
  referenceNumber?: string;
  notes?: string;
  idempotencyKey?: string;
  reversalReason?: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

interface CashHandover {
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

interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  entityType: string;
  entityId: string;
}

interface DatabaseSchema {
  agency: {
    name: string;
    ownerName: string;
    phone: string;
    defaultLanguage: 'hi' | 'en';
    timezone: string;
    initialized: boolean;
  };
  users: User[];
  customers: Customer[];
  collections: Collection[];
  handovers: CashHandover[];
  auditLogs: AuditLog[];
}

// Initial Seed Data Generator
function getInitialSeedData(): DatabaseSchema {
  return {
    agency: {
      name: 'Shree Krishna Banking Services & RD Agency',
      ownerName: 'Rajesh Sharma',
      phone: '+91 9810123456',
      defaultLanguage: 'hi',
      timezone: 'Asia/Kolkata',
      initialized: true,
    },
    users: [
      {
        id: 'USR-OWNER-01',
        name: 'Rajesh Sharma (Agency Owner)',
        email: 'owner@hdbi.in',
        phone: '+91 9810123456',
        role: 'OWNER',
        assignedLocalities: ['All Localities'],
        active: true,
        dailyTarget: 50000,
      },
      {
        id: 'USR-SUP-01',
        name: 'Manoj Verma (Field Supervisor)',
        email: 'supervisor@hdbi.in',
        phone: '+91 9811234567',
        role: 'SUPERVISOR',
        assignedLocalities: ['Karol Bagh', 'Pahar Ganj', 'Laxmi Nagar'],
        active: true,
        dailyTarget: 40000,
      },
      {
        id: 'USR-AGENT-01',
        name: 'Suresh Kumar',
        email: 'suresh@hdbi.in',
        phone: '+91 9820345678',
        role: 'AGENT',
        assignedLocalities: ['Karol Bagh', 'Pahar Ganj'],
        active: true,
        dailyTarget: 15000,
      },
      {
        id: 'USR-AGENT-02',
        name: 'Anita Devi',
        email: 'anita@hdbi.in',
        phone: '+91 9830456789',
        role: 'AGENT',
        assignedLocalities: ['Laxmi Nagar', 'Preet Vihar'],
        active: true,
        dailyTarget: 18000,
      },
      {
        id: 'USR-AGENT-03',
        name: 'Vikas Patel',
        email: 'vikas@hdbi.in',
        phone: '+91 9840567890',
        role: 'AGENT',
        assignedLocalities: ['Rohini Sector 7', 'Rohini Sector 8'],
        active: true,
        dailyTarget: 20000,
      },
    ],
    customers: [
      {
        id: 'HDBI-C-101',
        name: 'Ramesh Chander Gupta',
        phone: '+91 9871100221',
        altPhone: '+91 9871100222',
        address: 'Shop 14, Main Market, Ajmal Khan Road',
        locality: 'Karol Bagh',
        assignedEmployeeId: 'USR-AGENT-01',
        status: 'ACTIVE',
        bankName: 'State Bank of India',
        branchName: 'Karol Bagh Central',
        rdAccountNumber: 'RD-SBI-992140',
        installmentAmount: 1000,
        frequency: 'DAILY',
        scheduledDay: 0,
        startDate: '2026-01-01',
        maturityDate: '2027-01-01',
        notes: 'Shop owner; collects daily around 2 PM.',
        consentGiven: true,
        createdAt: '2026-01-01T10:00:00.000Z',
      },
      {
        id: 'HDBI-C-102',
        name: 'Sunita Mehra',
        phone: '+91 9812233445',
        address: 'Flat 402, Gagan Apartments',
        locality: 'Laxmi Nagar',
        assignedEmployeeId: 'USR-AGENT-02',
        status: 'ACTIVE',
        bankName: 'Punjab National Bank',
        branchName: 'Vikas Marg',
        rdAccountNumber: 'RD-PNB-541290',
        installmentAmount: 2000,
        frequency: 'MONTHLY',
        scheduledDay: 29, // Due today!
        startDate: '2026-02-15',
        maturityDate: '2027-02-15',
        notes: 'Monthly salary credit on 28th. Best time morning 10 AM.',
        consentGiven: true,
        createdAt: '2026-02-15T09:30:00.000Z',
      },
      {
        id: 'HDBI-C-103',
        name: 'Mohd. Imran Khan',
        phone: '+91 9818899776',
        address: '32/B, Gali No. 4, Chuna Mandi',
        locality: 'Pahar Ganj',
        assignedEmployeeId: 'USR-AGENT-01',
        status: 'ACTIVE',
        bankName: 'HDFC Bank',
        branchName: 'Connaught Place',
        rdAccountNumber: 'RD-HDFC-887123',
        installmentAmount: 1500,
        frequency: 'MONTHLY',
        scheduledDay: 29, // Due today!
        startDate: '2026-03-01',
        maturityDate: '2027-03-01',
        notes: 'Prefers UPI payment QR code scan.',
        consentGiven: true,
        createdAt: '2026-03-01T11:00:00.000Z',
      },
      {
        id: 'HDBI-C-104',
        name: 'Pooja Agarwal',
        phone: '+91 9822334411',
        address: 'Pocket D-12, Near Sai Mandir',
        locality: 'Rohini Sector 7',
        assignedEmployeeId: 'USR-AGENT-03',
        status: 'ACTIVE',
        bankName: 'Bank of Baroda',
        branchName: 'Rohini West',
        rdAccountNumber: 'RD-BOB-334109',
        installmentAmount: 3000,
        frequency: 'MONTHLY',
        scheduledDay: 29, // Due today!
        startDate: '2026-01-10',
        maturityDate: '2027-01-10',
        notes: 'Teacher at DAV School. Call before visiting.',
        consentGiven: true,
        createdAt: '2026-01-10T12:00:00.000Z',
      },
      {
        id: 'HDBI-C-105',
        name: 'Gurpreet Singh',
        phone: '+91 9899112233',
        address: 'House 88, Guru Nanak Block',
        locality: 'Preet Vihar',
        assignedEmployeeId: 'USR-AGENT-02',
        status: 'ACTIVE',
        bankName: 'ICICI Bank',
        branchName: 'Swasthya Vihar',
        rdAccountNumber: 'RD-ICICI-665511',
        installmentAmount: 5000,
        frequency: 'MONTHLY',
        scheduledDay: 25, // Overdue by 4 days!
        startDate: '2025-11-25',
        maturityDate: '2026-11-25',
        notes: 'Overdue installment pending; requested follow up on Thursday.',
        consentGiven: true,
        createdAt: '2025-11-25T14:00:00.000Z',
      },
      {
        id: 'HDBI-C-106',
        name: 'Dinesh Yadav',
        phone: '+91 9877665544',
        address: 'B-10, Transport Nagar',
        locality: 'Rohini Sector 8',
        assignedEmployeeId: 'USR-AGENT-03',
        status: 'ACTIVE',
        bankName: 'State Bank of India',
        branchName: 'Rohini Sector 8',
        rdAccountNumber: 'RD-SBI-443322',
        installmentAmount: 500,
        frequency: 'DAILY',
        scheduledDay: 0,
        startDate: '2026-04-01',
        maturityDate: '2027-04-01',
        notes: 'Daily collection at dairy booth.',
        consentGiven: true,
        createdAt: '2026-04-01T08:00:00.000Z',
      },
    ],
    collections: [
      {
        id: 'COL-1001',
        customerId: 'HDBI-C-101',
        amount: 1000,
        expectedAmount: 1000,
        paymentMethod: 'CASH',
        outcome: 'COLLECTED',
        status: 'VERIFIED',
        collectedAt: '2026-10-29T10:15:00.000Z',
        employeeId: 'USR-AGENT-01',
        referenceNumber: 'CASH-REC-081',
        notes: 'Received in full. Verified by Owner.',
        idempotencyKey: 'IDEMP-1001',
        verifiedAt: '2026-10-29T11:00:00.000Z',
        verifiedBy: 'USR-OWNER-01',
      },
      {
        id: 'COL-1002',
        customerId: 'HDBI-C-104',
        amount: 3000,
        expectedAmount: 3000,
        paymentMethod: 'UPI_QR',
        outcome: 'COLLECTED',
        status: 'SUBMITTED',
        collectedAt: '2026-10-29T11:30:00.000Z',
        employeeId: 'USR-AGENT-03',
        referenceNumber: 'UPI-UTR-9087112233',
        notes: 'Paid via GPay QR code scan. Pending bank statement matching.',
        idempotencyKey: 'IDEMP-1002',
      },
    ],
    handovers: [
      {
        id: 'HO-501',
        employeeId: 'USR-AGENT-01',
        date: '2026-10-29',
        amountHandedOver: 1000,
        totalCollected: 1000,
        recipientName: 'Rajesh Sharma (Owner)',
        status: 'ACKNOWLEDGED',
        notes: 'Daily noon cash handover matched with passbook counterfoil.',
        createdAt: '2026-10-29T11:05:00.000Z',
      },
    ],
    auditLogs: [
      {
        id: 'LOG-001',
        timestamp: '2026-10-29T09:00:00.000Z',
        userId: 'USR-OWNER-01',
        userName: 'Rajesh Sharma',
        action: 'SYSTEM_STARTUP',
        details: 'HDBI Smart Collection Manager initialized with multi-role access control.',
        entityType: 'SYSTEM',
        entityId: 'SYS',
      },
      {
        id: 'LOG-002',
        timestamp: '2026-10-29T10:15:00.000Z',
        userId: 'USR-AGENT-01',
        userName: 'Suresh Kumar',
        action: 'COLLECTION_RECORDED',
        details: 'Recorded cash collection of ₹1,000 for customer Ramesh Chander Gupta.',
        entityType: 'COLLECTION',
        entityId: 'COL-1001',
      },
      {
        id: 'LOG-003',
        timestamp: '2026-10-29T11:00:00.000Z',
        userId: 'USR-OWNER-01',
        userName: 'Rajesh Sharma',
        action: 'COLLECTION_VERIFIED',
        details: 'Verified cash collection COL-1001 after physical cash receipt.',
        entityType: 'COLLECTION',
        entityId: 'COL-1001',
      },
    ],
  };
}

// Database helper functions with atomic writes
function readDatabase(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial = getInitialSeedData();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading database, restoring seed data:', err);
    const initial = getInitialSeedData();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
}

function writeDatabase(data: DatabaseSchema): void {
  const tempPath = `${DB_FILE}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tempPath, DB_FILE);
}

function addAuditLog(
  db: DatabaseSchema,
  userId: string,
  userName: string,
  action: string,
  details: string,
  entityType: string,
  entityId: string
) {
  const log: AuditLog = {
    id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    userId,
    userName,
    action,
    details,
    entityType,
    entityId,
  };
  db.auditLogs.unshift(log);
  if (db.auditLogs.length > 500) {
    db.auditLogs = db.auditLogs.slice(0, 500);
  }
}

// REST API Endpoints

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'HDBI Backend', timestamp: new Date().toISOString() });
});

// Unified High-Speed Bootstrap endpoint (replaces 6 roundtrips with 1)
app.get('/api/bootstrap', (req, res) => {
  const db = readDatabase();
  const { currentRole, currentUserId } = req.query;

  let customers = db.customers;
  if (currentRole === 'AGENT' && currentUserId) {
    customers = customers.filter((c) => c.assignedEmployeeId === currentUserId);
  }

  res.json({
    agency: db.agency,
    users: db.users,
    customers,
    collections: db.collections,
    handovers: db.handovers,
    auditLogs: db.auditLogs,
  });
});

// Agency & Configuration
app.get('/api/agency', (req, res) => {
  const db = readDatabase();
  res.json(db.agency);
});

app.put('/api/agency', (req, res) => {
  const db = readDatabase();
  db.agency = { ...db.agency, ...req.body };
  writeDatabase(db);
  res.json(db.agency);
});

// Users / Staff
app.get('/api/users', (req, res) => {
  const db = readDatabase();
  res.json(db.users);
});

app.post('/api/users', (req, res) => {
  const db = readDatabase();
  const { name, email, phone, role, assignedLocalities, dailyTarget } = req.body;
  if (!name || !role) {
    return res.status(400).json({ error: 'Name and role are required' });
  }
  const newUser: User = {
    id: `USR-${Date.now()}`,
    name,
    email: email || '',
    phone: phone || '',
    role,
    assignedLocalities: assignedLocalities || [],
    active: true,
    dailyTarget: Number(dailyTarget) || 10000,
  };
  db.users.push(newUser);
  addAuditLog(db, 'USR-OWNER-01', 'Admin', 'USER_CREATED', `Added staff user ${name} with role ${role}`, 'USER', newUser.id);
  writeDatabase(db);
  res.status(201).json(newUser);
});

app.patch('/api/users/:id', (req, res) => {
  const db = readDatabase();
  const user = db.users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  Object.assign(user, req.body);
  addAuditLog(db, 'USR-OWNER-01', 'Admin', 'USER_UPDATED', `Updated staff user ${user.name}`, 'USER', user.id);
  writeDatabase(db);
  res.json(user);
});

// Customers
app.get('/api/customers', (req, res) => {
  const db = readDatabase();
  const { search, locality, employeeId, status, currentRole, currentUserId } = req.query;

  let list = db.customers;

  // RBAC: If request is from a field agent, only return their assigned customers
  if (currentRole === 'AGENT' && currentUserId) {
    list = list.filter((c) => c.assignedEmployeeId === currentUserId);
  } else if (employeeId && employeeId !== 'ALL') {
    list = list.filter((c) => c.assignedEmployeeId === employeeId);
  }

  if (locality && locality !== 'ALL') {
    list = list.filter((c) => c.locality === locality);
  }

  if (status && status !== 'ALL') {
    list = list.filter((c) => c.status === status);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    list = list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.rdAccountNumber.toLowerCase().includes(q) ||
        c.locality.toLowerCase().includes(q)
    );
  }

  res.json(list);
});

app.post('/api/customers', (req, res) => {
  const db = readDatabase();
  const {
    name,
    phone,
    altPhone,
    address,
    locality,
    assignedEmployeeId,
    bankName,
    branchName,
    rdAccountNumber,
    installmentAmount,
    frequency,
    scheduledDay,
    startDate,
    maturityDate,
    notes,
    consentGiven,
  } = req.body;

  if (!name || !phone || !bankName || !installmentAmount) {
    return res.status(400).json({ error: 'Name, phone, bank name, and installment amount are required' });
  }

  // Duplicate Check
  const existing = db.customers.find(
    (c) => c.phone === phone || (rdAccountNumber && c.rdAccountNumber === rdAccountNumber)
  );
  if (existing) {
    return res.status(409).json({
      error: `Duplicate customer detected. Customer with this phone or RD account already exists (${existing.name} - ${existing.id})`,
    });
  }

  const newId = `HDBI-C-${100 + db.customers.length + 1}`;
  const newCustomer: Customer = {
    id: newId,
    name,
    phone,
    altPhone: altPhone || '',
    address: address || '',
    locality: locality || 'General',
    assignedEmployeeId: assignedEmployeeId || db.users.find((u) => u.role === 'AGENT')?.id || 'USR-AGENT-01',
    status: 'ACTIVE',
    bankName,
    branchName: branchName || '',
    rdAccountNumber: rdAccountNumber || `RD-REF-${Date.now().toString().slice(-6)}`,
    installmentAmount: Number(installmentAmount),
    frequency: frequency || 'MONTHLY',
    scheduledDay: Number(scheduledDay) || 1,
    startDate: startDate || new Date().toISOString().split('T')[0],
    maturityDate: maturityDate || '',
    notes: notes || '',
    consentGiven: Boolean(consentGiven),
    createdAt: new Date().toISOString(),
  };

  db.customers.unshift(newCustomer);
  addAuditLog(db, 'SYSTEM', 'User', 'CUSTOMER_CREATED', `Created customer ${name} (${newId}) with RD amount ₹${newCustomer.installmentAmount}`, 'CUSTOMER', newId);
  writeDatabase(db);
  res.status(201).json(newCustomer);
});

app.put('/api/customers/:id', (req, res) => {
  const db = readDatabase();
  const index = db.customers.findIndex((c) => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Customer not found' });

  db.customers[index] = { ...db.customers[index], ...req.body };
  addAuditLog(db, 'SYSTEM', 'User', 'CUSTOMER_UPDATED', `Updated details for customer ${db.customers[index].name} (${req.params.id})`, 'CUSTOMER', req.params.id);
  writeDatabase(db);
  res.json(db.customers[index]);
});

// Collections & Records
app.get('/api/collections', (req, res) => {
  const db = readDatabase();
  const { customerId, employeeId, date, status } = req.query;

  let list = db.collections;
  if (customerId) {
    list = list.filter((c) => c.customerId === customerId);
  }
  if (employeeId && employeeId !== 'ALL') {
    list = list.filter((c) => c.employeeId === employeeId);
  }
  if (date) {
    list = list.filter((c) => c.collectedAt.startsWith(date as string));
  }
  if (status && status !== 'ALL') {
    list = list.filter((c) => c.status === status);
  }

  res.json(list);
});

app.post('/api/collections', (req, res) => {
  const db = readDatabase();
  const {
    customerId,
    scheduleId,
    amount,
    expectedAmount,
    paymentMethod,
    outcome,
    employeeId,
    referenceNumber,
    notes,
    idempotencyKey,
  } = req.body;

  if (!customerId || !outcome) {
    return res.status(400).json({ error: 'Customer ID and outcome are required' });
  }

  // Idempotency check: prevent duplicate submissions within 5 minutes
  if (idempotencyKey) {
    const existing = db.collections.find((c) => c.idempotencyKey === idempotencyKey);
    if (existing) {
      return res.status(200).json({ ...existing, duplicateDetected: true });
    }
  }

  const customer = db.customers.find((c) => c.id === customerId);
  const newCol: Collection = {
    id: `COL-${Date.now()}`,
    customerId,
    scheduleId: scheduleId || '',
    amount: outcome === 'COLLECTED' ? Number(amount) : 0,
    expectedAmount: expectedAmount || customer?.installmentAmount || 0,
    paymentMethod: paymentMethod || 'CASH',
    outcome,
    status: outcome === 'COLLECTED' ? 'RECORDED' : 'RECORDED',
    collectedAt: new Date().toISOString(),
    employeeId: employeeId || 'USR-AGENT-01',
    referenceNumber: referenceNumber || '',
    notes: notes || '',
    idempotencyKey: idempotencyKey || `IDEMP-${Date.now()}`,
  };

  db.collections.unshift(newCol);
  addAuditLog(
    db,
    newCol.employeeId,
    'Agent',
    'COLLECTION_ENTRY',
    `Recorded outcome '${outcome}' for ${customer?.name || customerId} (Amount: ₹${newCol.amount})`,
    'COLLECTION',
    newCol.id
  );
  writeDatabase(db);
  res.status(201).json(newCol);
});

// Verify Collection (Owner & Supervisor privilege)
app.post('/api/collections/:id/verify', (req, res) => {
  const db = readDatabase();
  const { verifiedBy } = req.body;
  const col = db.collections.find((c) => c.id === req.params.id);
  if (!col) return res.status(404).json({ error: 'Collection record not found' });

  if (col.status === 'VERIFIED') {
    return res.status(400).json({ error: 'Record is already verified' });
  }

  col.status = 'VERIFIED';
  col.verifiedAt = new Date().toISOString();
  col.verifiedBy = verifiedBy || 'USR-OWNER-01';

  addAuditLog(
    db,
    col.verifiedBy,
    'Authorizer',
    'COLLECTION_VERIFIED',
    `Verified collection ${col.id} of ₹${col.amount}`,
    'COLLECTION',
    col.id
  );
  writeDatabase(db);
  res.json(col);
});

// Reverse / Correct Collection (Owner privilege)
app.post('/api/collections/:id/reverse', (req, res) => {
  const db = readDatabase();
  const { reason, reversedBy } = req.body;
  if (!reason) return res.status(400).json({ error: 'Reversal reason is mandatory' });

  const col = db.collections.find((c) => c.id === req.params.id);
  if (!col) return res.status(404).json({ error: 'Collection record not found' });

  col.status = 'REVERSED';
  col.reversalReason = reason;

  addAuditLog(
    db,
    reversedBy || 'USR-OWNER-01',
    'Admin',
    'COLLECTION_REVERSED',
    `Reversed collection ${col.id} (₹${col.amount}). Reason: ${reason}`,
    'COLLECTION',
    col.id
  );
  writeDatabase(db);
  res.json(col);
});

// Cash Handover
app.get('/api/handovers', (req, res) => {
  const db = readDatabase();
  res.json(db.handovers);
});

app.post('/api/handovers', (req, res) => {
  const db = readDatabase();
  const { employeeId, amountHandedOver, totalCollected, recipientName, notes } = req.body;

  if (!employeeId || amountHandedOver === undefined) {
    return res.status(400).json({ error: 'Employee and amount handed over are required' });
  }

  const handover: CashHandover = {
    id: `HO-${Date.now()}`,
    employeeId,
    date: new Date().toISOString().split('T')[0],
    amountHandedOver: Number(amountHandedOver),
    totalCollected: Number(totalCollected) || Number(amountHandedOver),
    recipientName: recipientName || 'Agency Owner',
    status: 'ACKNOWLEDGED',
    notes: notes || '',
    createdAt: new Date().toISOString(),
  };

  db.handovers.unshift(handover);
  addAuditLog(
    db,
    employeeId,
    'Agent',
    'CASH_HANDOVER',
    `Handed over ₹${handover.amountHandedOver} to ${handover.recipientName}`,
    'HANDOVER',
    handover.id
  );
  writeDatabase(db);
  res.status(201).json(handover);
});

// Audit Logs
app.get('/api/audit-logs', (req, res) => {
  const db = readDatabase();
  res.json(db.auditLogs);
});

// Backup Download
app.get('/api/backup', (req, res) => {
  const db = readDatabase();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename=hdbi-backup-${new Date().toISOString().split('T')[0]}.json`);
  res.json(db);
});

// Restore from Backup
app.post('/api/restore', (req, res) => {
  const backup = req.body;
  if (!backup || !backup.customers || !backup.collections || !backup.users) {
    return res.status(400).json({ error: 'Invalid backup file structure' });
  }
  writeDatabase(backup);
  res.json({ success: true, message: 'Database restored successfully' });
});

// Reset Demo Data
app.post('/api/reset-demo', (req, res) => {
  const initial = getInitialSeedData();
  writeDatabase(initial);
  res.json({ success: true, message: 'Database reset to demo state' });
});

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HDBI Server running on port ${PORT}`);
  });
}

startServer();

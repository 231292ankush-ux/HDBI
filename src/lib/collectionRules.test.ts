import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatINR,
  validateCollectionEntry,
  reconcileCashHandover,
  getInstallmentDueStatus,
  calculateDailyStats,
  generateReceiptText,
  type CollectionRecord
} from './collectionRules';

test('formatINR formats currency in Indian Rupees notation', () => {
  assert.equal(formatINR(0), '₹0');
  assert.equal(formatINR(500), '₹500');
  assert.equal(formatINR(1000), '₹1,000');
  assert.equal(formatINR(125000), '₹1,25,000');
  assert.equal(formatINR(10000000), '₹1,00,00,000');
});

test('validateCollectionEntry enforces required fields and idempotency key', () => {
  // Missing customer ID
  const r1 = validateCollectionEntry({
    customerId: '',
    outcome: 'COLLECTED',
    amount: 1000,
    paymentMethod: 'CASH',
    idempotencyKey: 'key-1'
  });
  assert.equal(r1.isValid, false);
  assert.ok(r1.errors.some(e => e.includes('Customer ID')));

  // Non-positive amount on COLLECTED
  const r2 = validateCollectionEntry({
    customerId: 'CUST-1',
    outcome: 'COLLECTED',
    amount: 0,
    paymentMethod: 'CASH',
    idempotencyKey: 'key-2'
  });
  assert.equal(r2.isValid, false);

  // Missing idempotency token
  const r3 = validateCollectionEntry({
    customerId: 'CUST-1',
    outcome: 'COLLECTED',
    amount: 1000,
    paymentMethod: 'CASH',
    idempotencyKey: ''
  });
  assert.equal(r3.isValid, false);
  assert.ok(r3.errors.some(e => e.includes('Idempotency')));

  // Valid attempt for unavailable customer without payment
  const r4 = validateCollectionEntry({
    customerId: 'CUST-1',
    outcome: 'CUSTOMER_UNAVAILABLE',
    idempotencyKey: 'key-3'
  });
  assert.equal(r4.isValid, true);
  assert.equal(r4.errors.length, 0);
});

test('reconcileCashHandover detects matches and shortages/discrepancies', () => {
  const collections = [
    { amount: 1000, outcome: 'COLLECTED' as const, status: 'RECORDED' as const },
    { amount: 2000, outcome: 'COLLECTED' as const, status: 'VERIFIED' as const },
    { amount: 500, outcome: 'COLLECTED' as const, status: 'REVERSED' as const } // reversed should not count
  ];

  // Exact handover
  const h1 = [{ amountHandedOver: 3000, status: 'ACKNOWLEDGED' }];
  const res1 = reconcileCashHandover(collections, h1);
  assert.equal(res1.totalCashCollected, 3000);
  assert.equal(res1.totalCashHandedOver, 3000);
  assert.equal(res1.discrepancy, 0);
  assert.equal(res1.isBalanced, true);

  // Shortage (handover less than collected)
  const h2 = [{ amountHandedOver: 2500, status: 'ACKNOWLEDGED' }];
  const res2 = reconcileCashHandover(collections, h2);
  assert.equal(res2.discrepancy, 500);
  assert.equal(res2.isBalanced, false);
});

test('getInstallmentDueStatus checks status transitions accurately', () => {
  assert.equal(
    getInstallmentDueStatus('2026-10-25', '2026-10-29', 0, 1000),
    'OVERDUE'
  );
  assert.equal(
    getInstallmentDueStatus('2026-10-29', '2026-10-29', 0, 1000),
    'DUE_TODAY'
  );
  assert.equal(
    getInstallmentDueStatus('2026-11-05', '2026-10-29', 0, 1000),
    'UPCOMING'
  );
  assert.equal(
    getInstallmentDueStatus('2026-10-25', '2026-10-29', 1000, 1000, 'VERIFIED'),
    'VERIFIED'
  );
});

test('calculateDailyStats produces accurate operational breakdown', () => {
  const customers = [
    { id: 'C1', status: 'ACTIVE' },
    { id: 'C2', status: 'ACTIVE' },
    { id: 'C3', status: 'ACTIVE' },
    { id: 'C4', status: 'INACTIVE' }
  ];

  const schedules = [
    { id: 'S1', customerId: 'C1', installmentAmount: 1000, scheduledDay: 29, status: 'ACTIVE' },
    { id: 'S2', customerId: 'C2', installmentAmount: 2000, scheduledDay: 29, status: 'ACTIVE' },
    { id: 'S3', customerId: 'C3', installmentAmount: 1500, scheduledDay: 15, status: 'ACTIVE' }
  ];

  const collections: CollectionRecord[] = [
    {
      id: 'COL1',
      customerId: 'C1',
      scheduleId: 'S1',
      amount: 1000,
      expectedAmount: 1000,
      paymentMethod: 'CASH',
      outcome: 'COLLECTED',
      status: 'VERIFIED',
      collectedAt: '2026-10-29T10:00:00.000Z',
      employeeId: 'EMP1'
    }
  ];

  const stats = calculateDailyStats({
    todayStr: '2026-10-29T00:00:00.000Z',
    customers,
    schedules,
    collections
  });

  assert.equal(stats.totalActiveCustomers, 3);
  assert.equal(stats.scheduledTodayCount, 2); // C1 and C2 scheduled on 29th
  assert.equal(stats.expectedCollectionToday, 3000);
  assert.equal(stats.verifiedCollectedToday, 1000);
  assert.equal(stats.pendingVerificationToday, 0);
  assert.equal(stats.totalCollectedToday, 1000);
  assert.equal(stats.notContactedCount, 1); // C2 has not been contacted yet
});

test('generateReceiptText creates formatted official customer receipt with disclaimer', () => {
  const receipt = generateReceiptText({
    receiptId: 'REC-9001',
    customerName: 'Sunita Mehra',
    customerId: 'HDBI-C-102',
    bankName: 'Punjab National Bank',
    rdAccountNumber: 'RD-PNB-541290',
    amount: 2000,
    paymentMethod: 'CASH',
    dateStr: '29 Oct 2026, 11:30 AM',
    agentName: 'Suresh Kumar',
    agencyName: 'Shree Krishna Agency',
  });

  assert.ok(receipt.includes('REC-9001'));
  assert.ok(receipt.includes('Sunita Mehra'));
  assert.ok(receipt.includes('₹2,000'));
  assert.ok(receipt.includes('Punjab National Bank'));
  assert.ok(receipt.includes('अंतिम जमा'));
});


import React, { useState } from 'react';
import { Customer, Collection } from '../types';
import { useApp } from '../context/AppContext';
import { formatINR, generateReceiptText } from '../lib/collectionRules';
import {
  X,
  Printer,
  Copy,
  Check,
  MessageSquare,
  ShieldCheck,
  Building,
  CheckCircle2,
  Share2
} from 'lucide-react';

export const ReceiptModal: React.FC<{
  customer: Customer;
  collection: Collection;
  onClose: () => void;
}> = ({ customer, collection, onClose }) => {
  const { agency, users } = useApp();
  const [copied, setCopied] = useState(false);

  const agent = users.find((u) => u.id === collection.employeeId);
  const dateStr = new Date(collection.collectedAt).toLocaleString('hi-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const receiptRawText = generateReceiptText({
    receiptId: collection.id,
    customerName: customer.name,
    customerId: customer.id,
    bankName: customer.bankName,
    rdAccountNumber: customer.rdAccountNumber,
    amount: collection.amount,
    paymentMethod: collection.paymentMethod,
    referenceNumber: collection.referenceNumber,
    dateStr,
    agentName: agent?.name || 'अधिकृत कलेक्शन एजेंट',
    agencyName: agency?.name || 'HDBI Banking Agency',
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(receiptRawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const cleanPhone = customer.phone.replace(/[^0-9]/g, '');

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-sm w-full my-auto overflow-hidden shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Top Close Bar */}
        <div className="px-5 pt-4 pb-2 flex items-center justify-between print:hidden">
          <span className="text-xs font-semibold text-gray-500 font-sans">
            डिजिटल भुगतान पावती
          </span>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Google Pay Style Receipt Body */}
        <div className="px-6 py-4 text-center print:p-0">
          {/* Big Green Success Check Circle */}
          <div className="w-16 h-16 rounded-full bg-[#1e8e3e] text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
            <Check className="w-9 h-9 stroke-[3]" />
          </div>

          {/* Amount Display */}
          <div className="mt-3">
            <h2 className="text-3xl sm:text-4xl font-black text-[#1f1f1f] tracking-tight font-sans">
              {formatINR(collection.amount)}
            </h2>
            <div className="text-xs sm:text-sm font-bold text-[#137333] mt-1 flex items-center justify-center space-x-1">
              <span>✓ भुगतान सफलतापूर्वक दर्ज (Success)</span>
            </div>
            {/* Prominent Date & Time Stamp */}
            <div className="mt-1 text-xs font-semibold text-gray-700 bg-gray-100 py-1 px-3 rounded-full inline-block">
              {dateStr}
            </div>
          </div>

          {/* Customer & RD Spec Box */}
          <div className="mt-5 p-4 rounded-3xl bg-[#f8f9fa] border border-gray-200/90 text-left text-xs sm:text-sm space-y-2.5">
            <div className="flex justify-between items-center pb-2 border-b border-gray-200/80">
              <span className="text-gray-500 font-medium">ग्राहक (Customer):</span>
              <span className="font-extrabold text-[#1f1f1f] text-sm">{customer.name}</span>
            </div>

            {/* Prominent Customer Account Number */}
            <div className="flex justify-between items-center pb-2 border-b border-gray-200/80">
              <span className="text-gray-500 font-medium">RD खाता संख्या:</span>
              <span className="font-mono font-black text-[#1a73e8] bg-[#e8f0fe] px-2.5 py-1 rounded-lg border border-[#d2e3fc] text-sm">
                {customer.rdAccountNumber}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">बैंक व शाखा:</span>
              <span className="font-bold text-gray-800">{customer.bankName}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">माध्यम (Mode):</span>
              <span className="font-bold text-gray-800">
                {collection.paymentMethod === 'CASH' ? '💵 नकद (Cash)' : collection.paymentMethod === 'UPI_QR' ? '📱 UPI / QR' : collection.paymentMethod}
              </span>
            </div>

            {collection.referenceNumber && (
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">रिफ / UTR:</span>
                <span className="font-mono font-bold text-gray-800">{collection.referenceNumber}</span>
              </div>
            )}

            <div className="flex justify-between items-center pt-2 border-t border-gray-200/80">
              <span className="text-gray-500 font-medium">अधिकृत एजेंट:</span>
              <span className="font-bold text-gray-800">{agent?.name}</span>
            </div>

            <div className="flex justify-between items-center text-[11px]">
              <span className="text-gray-400">रसीद सं. (ID):</span>
              <span className="font-mono text-gray-500">{collection.id}</span>
            </div>
          </div>

          {/* Statutory Disclaimer */}
          <p className="mt-3 text-[10px] text-gray-400 leading-tight text-center">
            {agency?.name || 'HDBI Agency'} • अधिकृत बैंक एजेंट द्वारा प्राप्त पावती। बैंक जमा सत्यापन से ही प्रमाणित होता है।
          </p>
        </div>

        {/* Google Pay Style Action Buttons */}
        <div className="p-4 bg-[#f8f9fa] border-t border-gray-100 flex items-center justify-between gap-2.5 print:hidden">
          <button
            onClick={handleCopy}
            className="flex-1 py-2.5 px-3 rounded-full text-xs font-semibold bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 flex items-center justify-center space-x-1.5 transition shadow-2xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'कॉपी हो गया' : 'कॉपी पर्ची'}</span>
          </button>

          <a
            href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(receiptRawText)}`}
            target="_blank"
            rel="noreferrer"
            className="flex-1 py-2.5 px-3 rounded-full text-xs font-semibold bg-[#1a73e8] hover:bg-[#1557b0] active:scale-95 text-white flex items-center justify-center space-x-1.5 shadow-sm transition"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </a>

          <button
            onClick={handlePrint}
            className="w-10 h-10 rounded-full bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 flex items-center justify-center transition shadow-2xs"
            title="प्रिंट"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

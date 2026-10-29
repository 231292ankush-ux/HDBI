import React, { useState } from 'react';
import { Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import { Customer } from '../types';
import { useLocation } from '../context/LocationContext';
import { formatINR } from '../lib/collectionRules';
import { MapPin, Navigation, Phone, CheckCircle, Clock, ExternalLink } from 'lucide-react';

interface GoogleMapViewProps {
  customers: Customer[];
  onRecordForCustomer?: (cust: Customer) => void;
  onSelectCustomer?: (cust: Customer) => void;
  height?: string;
  focusCustomerId?: string | null;
}

export const GoogleMapView: React.FC<GoogleMapViewProps> = ({
  customers,
  onRecordForCustomer,
  onSelectCustomer,
  height = '420px',
  focusCustomerId,
}) => {
  const { coords, localityName, calculateDistanceKm, formatDistance, openGoogleMapsDirections } = useLocation();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Center around user's current GPS position or first customer
  const mapCenter = {
    lat: coords.lat || 28.6517,
    lng: coords.lng || 77.1906,
  };

  return (
    <div
      className="relative w-full rounded-3xl overflow-hidden border border-gray-200 shadow-sm"
      style={{ height }}
    >
      <Map
        defaultCenter={mapCenter}
        defaultZoom={13}
        mapId="DEMO_MAP_ID"
        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        gestureHandling="greedy"
        disableDefaultUI={false}
        className="w-full h-full"
      >
        {/* 1. Agent's Current Live Location Marker */}
        <AdvancedMarker
          position={{ lat: coords.lat, lng: coords.lng }}
          title={`मेरी लाइव लोकेशन: ${localityName}`}
        >
          <div className="relative flex items-center justify-center">
            <div className="absolute w-8 h-8 rounded-full bg-[#1a73e8]/30 animate-ping" />
            <div className="relative w-7 h-7 rounded-full bg-[#1a73e8] border-2 border-white shadow-lg flex items-center justify-center text-white text-[11px] font-black">
              मैं
            </div>
          </div>
        </AdvancedMarker>

        {/* 2. Customer Collection Markers */}
        {customers.map((cust) => {
          if (!cust.lat || !cust.lng) return null;
          const isOverdue = cust.scheduledDay !== 0 && cust.scheduledDay < new Date().getDate();
          const distKm = calculateDistanceKm(cust.lat, cust.lng);

          // Marker color
          const pinBackground = isOverdue ? '#d93025' : '#1a73e8';
          const pinGlyphColor = '#ffffff';

          return (
            <AdvancedMarker
              key={cust.id}
              position={{ lat: cust.lat, lng: cust.lng }}
              onClick={() => setSelectedCustomer(cust)}
              title={`${cust.name} - ${cust.rdAccountNumber}`}
            >
              <Pin
                background={pinBackground}
                borderColor="#ffffff"
                glyphColor={pinGlyphColor}
                scale={1.1}
              />
            </AdvancedMarker>
          );
        })}

        {/* 3. InfoWindow for selected customer */}
        {selectedCustomer && selectedCustomer.lat && selectedCustomer.lng && (
          <InfoWindow
            position={{ lat: selectedCustomer.lat, lng: selectedCustomer.lng }}
            onCloseClick={() => setSelectedCustomer(null)}
          >
            <div className="p-1 min-w-[220px] max-w-[260px] text-[#1f1f1f] font-sans">
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-[#1a73e8] px-2 py-0.5 rounded-full border border-blue-200">
                  खाता: {selectedCustomer.rdAccountNumber}
                </span>
                <span className="text-[10px] text-gray-500 font-semibold">
                  {formatDistance(calculateDistanceKm(selectedCustomer.lat, selectedCustomer.lng))}
                </span>
              </div>

              <h4 className="font-bold text-sm text-[#1f1f1f] leading-snug">
                {selectedCustomer.name}
              </h4>
              <p className="text-[11px] text-gray-500 truncate mt-0.5">
                {selectedCustomer.address} ({selectedCustomer.locality})
              </p>

              <div className="my-2 p-2 bg-[#f8fafd] border border-blue-100 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-[9px] uppercase font-bold text-gray-500">किस्त राशि</div>
                  <div className="text-base font-black text-[#1e8e3e]">
                    {formatINR(selectedCustomer.installmentAmount)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] uppercase font-bold text-gray-500">आवृत्ति</div>
                  <div className="text-xs font-semibold text-gray-700">
                    {selectedCustomer.frequency === 'DAILY' ? 'दैनिक (Daily)' : 'मासिक (Monthly)'}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                {onRecordForCustomer && (
                  <button
                    onClick={() => {
                      onRecordForCustomer(selectedCustomer);
                      setSelectedCustomer(null);
                    }}
                    className="w-full bg-[#1a73e8] hover:bg-[#1557b0] text-white py-1.5 px-3 rounded-full text-xs font-bold shadow-xs transition flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <span>₹ वसूली दर्ज करें</span>
                  </button>
                )}

                <button
                  onClick={() =>
                    openGoogleMapsDirections(
                      selectedCustomer.lat!,
                      selectedCustomer.lng!,
                      selectedCustomer.name
                    )
                  }
                  className="w-full bg-white hover:bg-gray-100 text-[#1a73e8] border border-blue-200 py-1.5 px-3 rounded-full text-xs font-semibold transition flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Google Maps नेविगेशन खोलें</span>
                </button>
              </div>
            </div>
          </InfoWindow>
        )}
      </Map>

      {/* Floating GPS Status Pill overlay */}
      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs border border-gray-200/80 shadow-md rounded-full px-3 py-1.5 flex items-center space-x-2 text-xs font-semibold text-gray-800 z-10 pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-[#1e8e3e] animate-pulse" />
        <span className="text-[11px]">📍 GPS सक्रिय: {localityName}</span>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useLocation } from '../context/LocationContext';
import { MapPin, ShieldCheck, Navigation, Check, AlertCircle, Compass } from 'lucide-react';

const QUICK_FIELD_ZONES = [
  { name: 'करोल बाग मुख्य बाजार (Karol Bagh)', lat: 28.6517, lng: 77.1906 },
  { name: 'पहाड़गंज - चूना मंडी (Pahar Ganj)', lat: 28.6434, lng: 77.2144 },
  { name: 'लक्ष्मी नगर - विकास मार्ग (Laxmi Nagar)', lat: 28.6304, lng: 77.2773 },
  { name: 'रोहिणी सेक्टर 7 व 8 (Rohini Sec 7-8)', lat: 28.7095, lng: 77.1182 },
  { name: 'प्रीत विहार (Preet Vihar)', lat: 28.6369, lng: 77.2930 },
];

export const MandatoryLocationModal: React.FC = () => {
  const { isLocationShared, requestLocationPermission, setSimulatedLocation, coords, localityName } = useLocation();
  const [requesting, setRequesting] = useState(false);
  const [showZonePicker, setShowZonePicker] = useState(false);

  // If already shared, do not render modal
  if (isLocationShared) return null;

  const handleEnableGPS = async () => {
    setRequesting(true);
    try {
      await requestLocationPermission();
    } finally {
      setRequesting(false);
    }
  };

  const handleSelectZone = (zone: typeof QUICK_FIELD_ZONES[0]) => {
    setSimulatedLocation({ lat: zone.lat, lng: zone.lng }, zone.name);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 flex flex-col text-[#1f1f1f]">
        {/* Google Maps Emblem Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center shadow-xs shrink-0">
            <MapPin className="w-6 h-6 text-[#1a73e8]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold uppercase tracking-wider bg-red-50 text-[#d93025] px-2 py-0.5 rounded-full border border-red-200">
                अनिवार्य (Mandatory)
              </span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs font-semibold text-gray-600">Google Maps Platform</span>
            </div>
            <h2 className="text-lg font-bold text-[#1f1f1f] tracking-tight leading-snug">
              गूगल मैप लोकेशन शेयरिंग अनिवार्य है
            </h2>
          </div>
        </div>

        {/* Informative Google-style Card */}
        <div className="bg-[#f8fafd] border border-[#d2e3fc] rounded-2xl p-4 mb-4 text-xs text-gray-700 space-y-2">
          <p className="font-semibold text-[#1a73e8] flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-[#1a73e8]" />
            <span>बैंक व फील्ड सुरक्षा दिशा-निर्देश</span>
          </p>
          <p className="text-gray-600 leading-relaxed">
            इस RD कलेक्शन ऐप का उपयोग करते समय सभी एजेंटों व कर्मचारियों को अपनी <strong>गूगल मैप लाइव लोकेशन</strong> शेयर करना अनिवार्य है।
          </p>
          <ul className="space-y-1.5 text-[11px] text-gray-600 pt-1">
            <li className="flex items-center space-x-2">
              <Check className="w-3.5 h-3.5 text-[#1e8e3e] shrink-0" />
              <span>प्रत्येक RD नकद वसूली पर प्रामाणिक GPS मुहर दर्ज होती है</span>
            </li>
            <li className="flex items-center space-x-2">
              <Check className="w-3.5 h-3.5 text-[#1e8e3e] shrink-0" />
              <span>ग्राहकों तक पहुँचने के लिए सबसे छोटा व सुगम रूट मिलता है</span>
            </li>
            <li className="flex items-center space-x-2">
              <Check className="w-3.5 h-3.5 text-[#1e8e3e] shrink-0" />
              <span>नकद हेराफेरी व फर्जी रसीदों से 100% पूर्ण सुरक्षा</span>
            </li>
          </ul>
        </div>

        {/* Primary Action Button (Google Pill) */}
        <button
          onClick={handleEnableGPS}
          disabled={requesting}
          className="w-full bg-[#1a73e8] hover:bg-[#1557b0] active:scale-[0.98] text-white py-3.5 px-4 rounded-full font-bold text-sm shadow-md transition flex items-center justify-center space-x-2 cursor-pointer mb-3"
        >
          <Navigation className={`w-4 h-4 ${requesting ? 'animate-spin' : ''}`} />
          <span>{requesting ? 'जीपीएस अनुमति जाँची जा रही है...' : '✓ लाइव जीपीएस लोकेशन चालू करें'}</span>
        </button>

        {/* Fallback Zone Selection for browser iframes/devices */}
        <div className="text-center pt-2 border-t border-gray-100">
          <button
            onClick={() => setShowZonePicker(!showZonePicker)}
            className="text-xs text-[#1a73e8] font-semibold hover:underline inline-flex items-center space-x-1"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>कार्यक्षेत्र (Field Zone) सीधे चुनें या बदलें</span>
          </button>

          {showZonePicker && (
            <div className="mt-3 space-y-1.5 text-left animate-in fade-in duration-150">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-1">
                सत्यापित बैंकिंग फील्ड क्लस्टर:
              </p>
              {QUICK_FIELD_ZONES.map((zone) => (
                <button
                  key={zone.name}
                  onClick={() => handleSelectZone(zone)}
                  className="w-full text-left p-2.5 rounded-xl border border-gray-200 hover:border-[#1a73e8] hover:bg-[#e8f0fe] text-xs font-semibold text-gray-700 transition flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-[#1a73e8]" />
                    <span>{zone.name}</span>
                  </div>
                  <span className="text-[10px] text-gray-400">
                    {zone.lat.toFixed(2)}, {zone.lng.toFixed(2)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer info */}
        <p className="text-[10px] text-gray-400 text-center mt-3">
          स्थान डेटा केवल फील्ड बैंकिंग कार्य के दौरान उपयोग किया जाता है।
        </p>
      </div>
    </div>
  );
};

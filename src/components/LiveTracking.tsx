import React, { useState, useEffect, useRef } from 'react';

declare global {
  interface Window {
    L: any;
  }
}

// Major Indian Cities for Global Tracking Simulation
const CITY_HUBS = [
    { name: 'New Delhi', lat: 28.6139, lng: 77.2090 },
    { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
    { name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
    { name: 'Hyderabad', lat: 17.3850, lng: 78.4867 },
    { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
    { name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
    { name: 'Pune', lat: 18.5204, lng: 73.8567 },
    { name: 'Panvel', lat: 18.9894, lng: 73.1175 },
    { name: 'Vashi', lat: 19.0745, lng: 72.9978 },
    { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
    { name: 'Jaipur', lat: 26.9124, lng: 75.7873 },
    { name: 'Lucknow', lat: 26.8467, lng: 80.9462 },
    { name: 'Chandigarh', lat: 30.7333, lng: 76.7794 },
    { name: 'Srinagar', lat: 34.0837, lng: 74.7973 }
];

// Mock Targets Data
const INITIAL_TARGETS = [
  { 
    id: 'TGT-ALPHA', 
    callsign: 'VIPER-1', 
    type: 'HOSTILE', 
    lat: 28.6139, 
    lng: 77.2090, 
    speed: 65, 
    heading: 315, 
    status: 'MOVING', 
    icon: 'vehicle',
    history: [] as [number, number][]
  },
  { 
    id: 'TGT-BRAVO', 
    callsign: 'SHADOW-X', 
    type: 'SUSPECT', 
    lat: 28.6328, 
    lng: 77.2197, 
    speed: 4, 
    heading: 90, 
    status: 'FOOT', 
    icon: 'person',
    history: [] as [number, number][]
  },
  { 
    id: 'TEAM-GOLD', 
    callsign: 'INTERCEPTOR', 
    type: 'FRIENDLY', 
    lat: 28.6000, 
    lng: 77.2000, 
    speed: 80, 
    heading: 45, 
    status: 'PURSUIT', 
    icon: 'unit',
    history: [] as [number, number][]
  }
];

interface LiveTrackingProps {
  onClose: () => void;
}

export const LiveTracking: React.FC<LiveTrackingProps> = ({ onClose }) => {
  const [targets, setTargets] = useState(INITIAL_TARGETS);
  const [selectedTarget, setSelectedTarget] = useState<any>(null);
  
  // Phone Tracking State
  const [phoneQuery, setPhoneQuery] = useState('');
  const [imeiQuery, setImeiQuery] = useState('');
  const [customTargetAddress, setCustomTargetAddress] = useState('');
  const [selectedCircle, setSelectedCircle] = useState<string>('MAHARASHTRA');
  const [isTriangulating, setIsTriangulating] = useState(false);
  const [triangulationStep, setTriangulationStep] = useState('');
  const [trackedSignal, setTrackedSignal] = useState<any>(null);
  const [trackingMode, setTrackingMode] = useState<'GLOBAL' | 'NEARBY'>('GLOBAL');
  
  // Operator (User) Location State
  const [operatorLocation, setOperatorLocation] = useState<{lat: number, lng: number} | null>(null);
  const [operatorAddress, setOperatorAddress] = useState<string>('Triangulating...');
  const [locatingOperator, setLocatingOperator] = useState(false);
  const [hasInitialFix, setHasInitialFix] = useState(false);
  const [manualLocationQuery, setManualLocationQuery] = useState('');
  const [showCalibration, setShowCalibration] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const pathsRef = useRef<{ [key: string]: any }>({});
  const signalLayersRef = useRef<any[]>([]); 
  const operatorLayerRef = useRef<any>(null);
  const watchIdRef = useRef<number | null>(null);

  // Initialize Map
  useEffect(() => {
    if (mapContainerRef.current && !mapInstanceRef.current && window.L) {
      const map = window.L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
        center: [22.5937, 78.9629], // Center of India
        zoom: 5,
      });

      // Dark Matter / Satellite Hybrid feel
      window.L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
      }).addTo(map);

      // Custom Panes
      map.createPane('targets');
      map.getPane('targets').style.zIndex = '650';
      
      map.createPane('signal');
      map.getPane('signal').style.zIndex = '700';
      
      // Operator gets highest priority pane
      map.createPane('operator');
      map.getPane('operator').style.zIndex = '800';

      mapInstanceRef.current = map;
      
      // Check for saved location or start watching
      const savedLoc = localStorage.getItem('tasc_operator_loc');
      if (savedLoc) {
          const loc = JSON.parse(savedLoc);
          setOperatorLocation(loc);
          setOperatorAddress("CALIBRATED (SAVED)");
          map.flyTo([loc.lat, loc.lng], 16, { animate: false });
          setHasInitialFix(true);
      } else {
          startWatchingPosition();
      }
    }

    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const startWatchingPosition = () => {
      if (!navigator.geolocation) return;
      
      setLocatingOperator(true);
      setOperatorAddress("Acquiring GPS Signal...");
      
      watchIdRef.current = navigator.geolocation.watchPosition(
          async (position) => {
              // Only update if we haven't manually calibrated
              if (!localStorage.getItem('tasc_operator_loc')) {
                  const { latitude, longitude } = position.coords;
                  setOperatorLocation({ lat: latitude, lng: longitude });
                  setLocatingOperator(false);
                  
                  // Reverse Geocode
                  try {
                      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                      const data = await response.json();
                      if (data && data.display_name) {
                          const parts = data.display_name.split(',');
                          setOperatorAddress(parts.slice(0, 3).join(', '));
                      }
                  } catch (e) {
                      setOperatorAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
                  }
              }
          },
          (error) => {
              console.error("Operator tracking error", error);
              setLocatingOperator(false);
              setOperatorAddress("Signal Lost. Manual Calibration Required.");
          },
          { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
      );
  };

  const handleManualCalibration = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!manualLocationQuery) return;

      setLocatingOperator(true);
      setOperatorAddress("Calibrating...");

      try {
          const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(manualLocationQuery)}`);
          const data = await response.json();

          if (data && data.length > 0) {
              const { lat, lon, display_name } = data[0];
              const newLat = parseFloat(lat);
              const newLng = parseFloat(lon);

              // Stop watching real GPS
              if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);

              const newLoc = { lat: newLat, lng: newLng };
              setOperatorLocation(newLoc);
              localStorage.setItem('tasc_operator_loc', JSON.stringify(newLoc)); // Save to storage
              
              setOperatorAddress("CALIBRATED: " + display_name.split(',').slice(0, 3).join(', '));
              setLocatingOperator(false);
              setShowCalibration(false);
              
              if (mapInstanceRef.current) {
                  mapInstanceRef.current.flyTo([newLat, newLng], 16, { animate: true, duration: 1.5 });
              }
          } else {
              setOperatorAddress("Location not found.");
              setLocatingOperator(false);
          }
      } catch (err) {
          setOperatorAddress("Calibration Failed.");
          setLocatingOperator(false);
      }
  };

  const resetCalibration = () => {
      localStorage.removeItem('tasc_operator_loc');
      setOperatorLocation(null);
      startWatchingPosition();
      setShowCalibration(false);
  };

  // Effect to handle Operator Marker & Initial FlyTo
  useEffect(() => {
      if (!mapInstanceRef.current || !operatorLocation || !window.L) return;

      // Fly to location only on the first fix if not already there
      if (!hasInitialFix) {
          mapInstanceRef.current.flyTo([operatorLocation.lat, operatorLocation.lng], 16, { animate: true, duration: 2 });
          setHasInitialFix(true);
      }

      // Update or Create Marker
      if (operatorLayerRef.current) {
          if (!operatorLayerRef.current.dragging?.enabled()) {
             operatorLayerRef.current.setLatLng([operatorLocation.lat, operatorLocation.lng]);
          }
      } else {
          const icon = window.L.divIcon({
              className: 'operator-marker',
              html: `
                <div class="relative flex items-center justify-center w-0 h-0 group cursor-grab">
                    <div class="absolute w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-[0_0_15px_#3b82f6] z-20"></div>
                    <div class="absolute w-16 h-16 bg-blue-500/10 rounded-full animate-ping z-10"></div>
                    <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-blue-900/90 text-blue-200 text-[10px] font-mono px-2 py-1 rounded border border-blue-500/30 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-30 pointer-events-none">
                        OPERATOR ACTIVE
                    </div>
                </div>
              `,
              iconSize: [0, 0],
              pane: 'operator'
          });

          const marker = window.L.marker(
              [operatorLocation.lat, operatorLocation.lng], 
              { icon, pane: 'operator', draggable: true }
          ).addTo(mapInstanceRef.current);

          marker.on('dragend', (event: any) => {
              const marker = event.target;
              const position = marker.getLatLng();
              const newLoc = { lat: position.lat, lng: position.lng };
              setOperatorLocation(newLoc);
              localStorage.setItem('tasc_operator_loc', JSON.stringify(newLoc)); // Save on drag
              if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
              setOperatorAddress("Manual Pin Drop");
          });

          operatorLayerRef.current = marker;
      }

  }, [operatorLocation, hasInitialFix]);

  const recenterOperator = () => {
      if(operatorLocation && mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([operatorLocation.lat, operatorLocation.lng], 16, { animate: true, duration: 1.5 });
      } else {
          startWatchingPosition();
      }
  };

  // Helper to calculate distance in KM between two lat/lng points
  const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return (R * c).toFixed(2);
  };

  // Generate deterministic location & telemetry based on phone number hash or prefix
  const generateLocationFromNumber = (number: string, mode: 'GLOBAL' | 'NEARBY') => {
      let hash = 0;
      const cleanNum = number.replace(/\D/g, '') || number;
      for (let i = 0; i < cleanNum.length; i++) {
          hash = ((hash << 5) - hash) + cleanNum.charCodeAt(i);
          hash |= 0; 
      }
      const absHash = Math.abs(hash);

      // Dedicated High-Precision Location Pools by Circle
      const MAHARASHTRA_LOCATIONS = [
        { address: 'Sector 17, Plot 14, Near Panvel Station, Navi Mumbai, Maharashtra 410206', lat: 18.9894, lng: 73.1175, city: 'Navi Mumbai', provider: 'Reliance Jio 5G', model: 'Apple iPhone 15 Pro' },
        { address: 'Sector 12, Palm Beach Road, Vashi, Navi Mumbai, Maharashtra 400703', lat: 19.0745, lng: 72.9978, city: 'Navi Mumbai', provider: 'Airtel 5G Plus', model: 'Google Pixel 8 Pro' },
        { address: 'Hill Road, Near Elco Market, Bandra West, Mumbai, Maharashtra 400050', lat: 19.0596, lng: 72.8295, city: 'Mumbai', provider: 'Vi 4G VoLTE', model: 'Samsung Galaxy S24 Ultra' },
        { address: 'Nagar Road, Near Phoenix Marketcity, Viman Nagar, Pune, Maharashtra 411014', lat: 18.5679, lng: 73.9143, city: 'Pune', provider: 'Airtel 5G Plus', model: 'Xiaomi 14 Ultra' },
        { address: 'Civil Lines, Wardha Road, Nagpur, Maharashtra 440001', lat: 21.1458, lng: 79.0882, city: 'Nagpur', provider: 'Reliance Jio 5G', model: 'OnePlus 12 5G' },
        { address: 'Gangapur Road, Near KTHM College, Nashik, Maharashtra 422005', lat: 20.0059, lng: 73.7661, city: 'Nashik', provider: 'Airtel 5G Plus', model: 'Apple iPhone 14 Pro' },
        { address: 'Ghodbunder Road, Majiwada, Thane West, Maharashtra 400601', lat: 19.2183, lng: 72.9781, city: 'Thane', provider: 'Reliance Jio 5G', model: 'Vivo X100 Pro' },
        { address: 'Tarabai Park, Station Road, Kolhapur, Maharashtra 416003', lat: 16.7050, lng: 74.2433, city: 'Kolhapur', provider: 'Vi 4G VoLTE', model: 'Samsung Galaxy Z Fold 5' },
        { address: 'Jalna Road, Near CIDCO, Chhatrapati Sambhajinagar, Maharashtra 431003', lat: 19.8762, lng: 75.3433, city: 'Chhatrapati Sambhajinagar', provider: 'Reliance Jio 5G', model: 'Realme GT 5 Pro' },
        { address: 'Karve Road, Kothrud, Pune, Maharashtra 411038', lat: 18.5074, lng: 73.8077, city: 'Pune', provider: 'Airtel 5G Plus', model: 'Apple iPhone 15' }
      ];

      const DELHI_LOCATIONS = [
        { address: 'Inner Circle, Block A, Connaught Place, New Delhi 110001', lat: 28.6315, lng: 77.2167, city: 'New Delhi', provider: 'Airtel 5G Plus', model: 'OnePlus 12 5G' },
        { address: 'DLF Cyber City, Building 10, Sector 24, Gurugram, Haryana 122002', lat: 28.4595, lng: 77.0266, city: 'Gurugram', provider: 'Reliance Jio 5G', model: 'Apple iPhone 14 Pro' }
      ];

      const KARNATAKA_LOCATIONS = [
        { address: '100 Feet Road, 12th Main, Indiranagar, Bengaluru, Karnataka 560038', lat: 12.9784, lng: 77.6408, city: 'Bengaluru', provider: 'Airtel 5G Plus', model: 'Apple iPhone 15' },
        { address: '5th Block, 80 Feet Road, Koramangala, Bengaluru, Karnataka 560095', lat: 12.9352, lng: 77.6245, city: 'Bengaluru', provider: 'Vi 4G VoLTE', model: 'Samsung Galaxy Z Fold 5' }
      ];

      const TELANGANA_LOCATIONS = [
        { address: 'Software Units Layout, HITEC City, Madhapur, Hyderabad, Telangana 500081', lat: 17.4435, lng: 78.3772, city: 'Hyderabad', provider: 'Reliance Jio 5G', model: 'Vivo X100 Pro' }
      ];

      const UTTAR_PRADESH_LOCATIONS = [
        { address: 'Gomti Nagar Main Road, Lucknow, Uttar Pradesh 226010', lat: 26.8500, lng: 80.9999, city: 'Lucknow', provider: 'Reliance Jio 5G', model: 'Samsung Galaxy A55' },
        { address: 'Sector 18, Atta Market, Noida, Uttar Pradesh 201301', lat: 28.5708, lng: 77.3261, city: 'Noida', provider: 'Airtel 5G Plus', model: 'Apple iPhone 14' }
      ];

      // Known Indian Telecom Circle Prefixes for direct 4-digit mapping
      const PREFIX_MAP: Record<string, { address: string; lat: number; lng: number; city: string; provider: string; model: string }> = {
        '9820': MAHARASHTRA_LOCATIONS[0],
        '9821': MAHARASHTRA_LOCATIONS[2],
        '9920': MAHARASHTRA_LOCATIONS[1],
        '9822': MAHARASHTRA_LOCATIONS[3],
        '9823': MAHARASHTRA_LOCATIONS[9],
        '9850': MAHARASHTRA_LOCATIONS[4],
        '9860': MAHARASHTRA_LOCATIONS[5],
        '9881': MAHARASHTRA_LOCATIONS[6],
        '9890': MAHARASHTRA_LOCATIONS[7],
        '9922': MAHARASHTRA_LOCATIONS[8],
        '9810': DELHI_LOCATIONS[0],
        '9811': DELHI_LOCATIONS[1],
        '9845': KARNATAKA_LOCATIONS[0],
        '9900': KARNATAKA_LOCATIONS[1],
        '9848': TELANGANA_LOCATIONS[0]
      };

      const prefix4 = cleanNum.slice(0, 4);
      let baseLoc = PREFIX_MAP[prefix4];

      // If user selected MAHARASHTRA (or no prefix hit), strictly force Maharashtra location!
      if (!baseLoc) {
        if (selectedCircle === 'DELHI') {
          baseLoc = DELHI_LOCATIONS[absHash % DELHI_LOCATIONS.length];
        } else if (selectedCircle === 'KARNATAKA') {
          baseLoc = KARNATAKA_LOCATIONS[absHash % KARNATAKA_LOCATIONS.length];
        } else if (selectedCircle === 'TELANGANA') {
          baseLoc = TELANGANA_LOCATIONS[absHash % TELANGANA_LOCATIONS.length];
        } else if (selectedCircle === 'UP') {
          baseLoc = UTTAR_PRADESH_LOCATIONS[absHash % UTTAR_PRADESH_LOCATIONS.length];
        } else {
          // Default to MAHARASHTRA (Prevents any unexpected UP fallback!)
          baseLoc = MAHARASHTRA_LOCATIONS[absHash % MAHARASHTRA_LOCATIONS.length];
        }
      }

      let targetLat = baseLoc.lat;
      let targetLng = baseLoc.lng;

      if (mode === 'NEARBY' && operatorLocation) {
          const offLat = (((absHash % 100) / 100) - 0.5) * 0.012;
          const offLng = ((((absHash >> 4) % 100) / 100) - 0.5) * 0.012;
          targetLat = operatorLocation.lat + offLat;
          targetLng = operatorLocation.lng + offLng;
      }

      const autoImei = imeiQuery && imeiQuery.trim().length >= 5 
        ? imeiQuery.trim() 
        : `8649${(absHash % 100000000000).toString().padStart(11, '7')}`;

      return {
          lat: targetLat,
          lng: targetLng,
          address: baseLoc.address,
          city: baseLoc.city,
          provider: baseLoc.provider,
          deviceModel: baseLoc.model,
          autoImei
      };
  };

  // Handle Phone Search
  const handlePhoneSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneQuery || phoneQuery.trim().length < 3) return;

    setTrackedSignal(null);
    setSelectedTarget(null);
    if (signalLayersRef.current.length > 0) {
        signalLayersRef.current.forEach(layer => mapInstanceRef.current?.removeLayer(layer));
        signalLayersRef.current = [];
    }

    setIsTriangulating(true);

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const locInfo = generateLocationFromNumber(phoneQuery, trackingMode);
    const effectiveImei = imeiQuery && imeiQuery.trim().length >= 5 ? imeiQuery.trim() : locInfo.autoImei;

    setTriangulationStep('CONNECTING TO TELECOM CARRIER BACKBONE...');
    await delay(600);
    setTriangulationStep(`PINGING CELL TOWERS FOR: ${phoneQuery}...`);
    await delay(700);
    setTriangulationStep(`RESOLVING SIM IMEI TELEMETRY: ${effectiveImei}`);
    await delay(700);
    setTriangulationStep('TRIANGULATING GPS & CELLULAR TOWER SECTORS...');
    await delay(800);

    let targetLat = locInfo.lat;
    let targetLng = locInfo.lng;
    let resolvedAddress = locInfo.address;

    // Check if user entered a custom precise location or city search query
    if (customTargetAddress && customTargetAddress.trim().length > 2) {
      setTriangulationStep(`GEOCODING PRECISE CUSTOM SECTOR: ${customTargetAddress}...`);
      await delay(500);
      try {
        const geoResp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(customTargetAddress)}`);
        const geoData = await geoResp.json();
        if (geoData && geoData.length > 0) {
          targetLat = parseFloat(geoData[0].lat);
          targetLng = parseFloat(geoData[0].lon);
          resolvedAddress = geoData[0].display_name.split(',').slice(0, 4).join(', ').trim();
        }
      } catch (err) {
        console.log("Custom location lookup fallback to primary landmark");
      }
    } else {
      // High Precision Reverse Geocoding
      try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${locInfo.lat}&lon=${locInfo.lng}`);
          const data = await response.json();
          if (data && data.display_name) {
              const parts = data.display_name.split(',');
              const clean = parts.slice(0, 5).join(', ').trim();
              if (clean.length > 10) {
                  resolvedAddress = clean;
              }
          }
      } catch (e) {
          console.log("Using primary landmark address");
      }
    }

    let distanceFromOperator: string | null = null;
    if (operatorLocation) {
        const dist = calculateDistanceKm(operatorLocation.lat, operatorLocation.lng, targetLat, targetLng);
        distanceFromOperator = `${dist} KM`;
    }

    const btsCellId = `BTS-${(Math.abs(phoneQuery.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)) % 899 + 100)}-SEC${Math.floor(Math.random() * 4) + 1}`;
    const lacCode = `0x${(Math.abs(targetLat * 1000) % 65000).toString(16).toUpperCase().padStart(4, '0')}`;

    const signalData = {
        number: phoneQuery,
        imei: effectiveImei,
        provider: locInfo.provider,
        signalStrength: Math.floor(Math.random() * 10) + 90,
        battery: Math.floor(Math.random() * 40) + 45,
        status: 'ONLINE / ACTIVE',
        deviceModel: locInfo.deviceModel,
        active: { lat: targetLat, lng: targetLng },
        address: resolvedAddress,
        distanceFromOperator,
        btsCellId,
        lacCode
    };

    setTrackedSignal(signalData);
    setIsTriangulating(false);
    setTriangulationStep('');

    if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([targetLat, targetLng], 18, { animate: true, duration: 2 });
    }
  };

  // Render Phone Signal Markers
  useEffect(() => {
      if (!mapInstanceRef.current || !trackedSignal || !window.L) return;

      signalLayersRef.current.forEach(layer => mapInstanceRef.current.removeLayer(layer));
      signalLayersRef.current = [];

      // Accuracy circle overlay
      const accuracyCircle = window.L.circle(
        [trackedSignal.active.lat, trackedSignal.active.lng], 
        {
          color: '#22d3ee',
          fillColor: '#06b6d4',
          fillOpacity: 0.2,
          weight: 1.5,
          radius: 120,
          pane: 'signal'
        }
      ).addTo(mapInstanceRef.current);
      signalLayersRef.current.push(accuracyCircle);

      // Line connecting Operator to Target if Operator loc exists
      if (operatorLocation) {
        const line = window.L.polyline(
          [[operatorLocation.lat, operatorLocation.lng], [trackedSignal.active.lat, trackedSignal.active.lng]],
          {
            color: '#38bdf8',
            weight: 2,
            opacity: 0.85,
            dashArray: '6, 10',
            pane: 'signal'
          }
        ).addTo(mapInstanceRef.current);
        signalLayersRef.current.push(line);
      }

      const activeIcon = window.L.divIcon({
          className: 'signal-marker-live',
          html: `
            <div class="relative flex items-center justify-center w-0 h-0">
                <div class="absolute w-[220px] h-[220px] rounded-full border border-cyan-400/30 animate-[ping_3s_infinite]"></div>
                <div class="absolute w-[110px] h-[110px] rounded-full border border-cyan-300/50 animate-[ping_2s_infinite]"></div>
                
                <div class="absolute -top-28 left-1/2 -translate-x-1/2 bg-black/95 border-2 border-cyan-400 px-4 py-3 rounded-md text-center shadow-[0_0_35px_rgba(34,211,238,0.6)] z-50 pointer-events-none min-w-[210px]">
                    <div class="text-cyan-300 font-bold text-xs tracking-wider mb-1 flex items-center justify-center space-x-1">
                      <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>TARGET LOCATED: ${trackedSignal.number}</span>
                    </div>
                    <div class="text-[10px] text-white font-mono border-t border-cyan-500/40 pt-1 mt-1 font-semibold leading-snug break-words">
                      ${trackedSignal.address}
                    </div>
                    ${trackedSignal.distanceFromOperator ? `<div class="text-[9px] text-cyan-400 font-mono mt-1 font-bold">DIST FROM OPERATOR: ${trackedSignal.distanceFromOperator}</div>` : ''}
                </div>

                <div class="absolute w-5 h-5 bg-cyan-400 rounded-full shadow-[0_0_20px_#22d3ee] z-10 border-2 border-white"></div>
                <div class="absolute w-0.5 h-10 bg-cyan-400 -top-10"></div>
            </div>
          `,
          iconSize: [0, 0],
          pane: 'signal'
      });
      const mkActive = window.L.marker([trackedSignal.active.lat, trackedSignal.active.lng], { icon: activeIcon, pane: 'signal' }).addTo(mapInstanceRef.current);
      signalLayersRef.current.push(mkActive);

  }, [trackedSignal, operatorLocation]);

  // Render Existing Targets
  useEffect(() => {
    if (!mapInstanceRef.current || !window.L) return;

    targets.forEach(t => {
        const color = t.type === 'HOSTILE' ? '#ef4444' : t.type === 'FRIENDLY' ? '#22c55e' : '#fbbf24';
        
        if (!markersRef.current[t.id]) {
            const iconHtml = `
                <div class="relative flex items-center justify-center w-0 h-0">
                    <div class="absolute w-8 h-8 rounded-full border-2 border-[${color}] bg-[${color}]/20 animate-pulse"></div>
                    <div class="absolute w-2 h-2 bg-[${color}] rounded-full shadow-[0_0_10px_${color}]"></div>
                    <div class="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-mono font-bold text-white bg-black/50 px-1 rounded whitespace-nowrap border border-[${color}]/50">${t.callsign}</div>
                </div>
            `;
            const icon = window.L.divIcon({
                className: 'target-marker',
                html: iconHtml,
                iconSize: [0, 0]
            });

            const marker = window.L.marker([t.lat, t.lng], { icon, pane: 'targets' })
                .addTo(mapInstanceRef.current)
                .on('click', () => setSelectedTarget(t));
            
            markersRef.current[t.id] = marker;
        } else {
            const marker = markersRef.current[t.id];
            marker.setLatLng([t.lat, t.lng]);
        }

        if (t.history.length > 1) {
            if (!pathsRef.current[t.id]) {
                const polyline = window.L.polyline(t.history, {
                    color: color,
                    weight: 2,
                    opacity: 0.6,
                    dashArray: '5, 10',
                    lineCap: 'round'
                }).addTo(mapInstanceRef.current);
                pathsRef.current[t.id] = polyline;
            } else {
                pathsRef.current[t.id].setLatLngs(t.history);
            }
        }
    });

    if (selectedTarget) {
        const updated = targets.find(t => t.id === selectedTarget.id);
        if (updated) setSelectedTarget(updated);
    }

  }, [targets, selectedTarget]);

  return (
    <div className="fixed inset-0 z-50 bg-[#050a14] flex flex-col animate-in fade-in duration-300 font-sans">
        
        {/* Header */}
        <div className="h-14 bg-[#0a1525] border-b border-cyan-500/20 flex justify-between items-center px-6 z-20 shadow-lg relative shrink-0">
            <div className="flex items-center space-x-4">
                <div className="w-3 h-3 bg-cyan-400 rounded-full animate-[ping_2s_infinite]"></div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-widest uppercase font-mono">Live Tracking</h1>
                    <div className="text-[9px] text-cyan-500/60 font-mono tracking-[0.3em]">GLOBAL POSITIONING SYSTEM // ACTIVE</div>
                </div>
            </div>
            <div className="flex space-x-8 text-xs font-mono text-cyan-500/60">
                <div className="flex flex-col items-center">
                    <span className="text-white font-bold">{targets.length}</span>
                    <span>ACTIVE TARGETS</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-red-400 font-bold animate-pulse">1</span>
                    <span>HOSTILE</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-green-400 font-bold">1</span>
                    <span>FRIENDLY</span>
                </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-red-900/20 rounded text-gray-400 hover:text-red-400 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>

        {/* Content */}
        <div className="flex-grow flex flex-col lg:flex-row relative overflow-y-auto lg:overflow-hidden">
            
            {/* Map */}
            <div className="flex-grow h-[45vh] lg:h-full relative bg-black shrink-0">
                <div ref={mapContainerRef} className="absolute inset-0 z-0"></div>
                {/* Grid Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.05)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none z-10"></div>
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)] z-10"></div>

                {/* Operator Control Button */}
                <div className="absolute top-4 right-4 z-30 flex flex-col space-y-2">
                    <button 
                        onClick={recenterOperator}
                        className={`bg-black/80 text-blue-400 border border-blue-500/50 p-3 rounded-full hover:bg-blue-900/30 transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] group ${locatingOperator ? 'animate-pulse' : ''}`}
                        title="Locate Me"
                    >
                        {locatingOperator ? (
                            <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        )}
                    </button>
                </div>

                {/* Tracking Status Indicator */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
                    <div className="bg-black/80 backdrop-blur px-4 py-2 rounded-full border border-blue-500/30 flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${locatingOperator ? 'bg-yellow-500 animate-pulse' : operatorLocation ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-[10px] font-mono text-blue-100 tracking-wider">
                            {locatingOperator ? 'ACQUIRING SIGNAL...' : operatorLocation ? 'OPERATOR: ONLINE' : 'SIGNAL LOST'}
                        </span>
                    </div>
                </div>

                {/* Triangulation Overlay */}
                {isTriangulating && (
                    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <div className="text-center">
                            <div className="w-24 h-24 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <div className="text-cyan-400 font-mono font-bold tracking-[0.2em] animate-pulse">{triangulationStep}</div>
                            <div className="text-xs text-cyan-600 font-mono mt-2 flex flex-col items-center">
                                <span>TRACING: {phoneQuery}</span>
                                <span>IMEI: {imeiQuery}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Sidebar */}
            <div className="w-full lg:w-80 bg-[#0a1525]/95 backdrop-blur-md border-t lg:border-t-0 lg:border-l border-cyan-500/20 z-20 flex flex-col">
                
                {/* Operator Status Section */}
                <div className="p-4 border-b border-cyan-500/20 bg-blue-900/10">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-blue-400 font-bold tracking-wider text-xs uppercase flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            OPERATOR LOCATION
                        </h2>
                        <button 
                            onClick={() => setShowCalibration(!showCalibration)} 
                            className="text-[10px] text-blue-300 hover:text-white underline"
                        >
                            {showCalibration ? 'CANCEL' : 'CALIBRATE'}
                        </button>
                    </div>
                    
                    {showCalibration ? (
                        <div className="mt-2">
                            <form onSubmit={handleManualCalibration}>
                                <input 
                                    type="text" 
                                    value={manualLocationQuery}
                                    onChange={(e) => setManualLocationQuery(e.target.value)}
                                    placeholder="Enter current city (e.g., Panvel)"
                                    className="w-full bg-black/50 border border-blue-500/30 rounded px-2 py-1 text-white text-xs mb-2 focus:outline-none focus:border-blue-400"
                                    autoFocus
                                />
                                <div className="flex space-x-2">
                                    <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold py-1 rounded">
                                        UPDATE
                                    </button>
                                    <button type="button" onClick={resetCalibration} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-[10px] font-bold py-1 rounded">
                                        RESET
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="text-[10px] font-mono text-gray-400 break-words">
                            {operatorAddress}
                        </div>
                    )}
                </div>

                {/* Device Tracker Section */}
                <div className="p-4 border-b border-cyan-500/20 bg-[#050a14]/50">
                     <h2 className="text-cyan-400 font-bold tracking-wider text-xs uppercase mb-3 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                        Find My Device
                    </h2>
                    
                    {/* Tracking Mode Switch */}
                    <div className="flex bg-black/40 rounded p-1 mb-3 border border-cyan-500/20">
                        <button 
                            onClick={() => setTrackingMode('GLOBAL')}
                            className={`flex-1 text-[9px] font-bold py-1 rounded transition-colors ${trackingMode === 'GLOBAL' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-500 hover:text-gray-400'}`}
                        >
                            GLOBAL SEARCH
                        </button>
                        <button 
                            onClick={() => setTrackingMode('NEARBY')}
                            className={`flex-1 text-[9px] font-bold py-1 rounded transition-colors ${trackingMode === 'NEARBY' ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-500 hover:text-gray-400'}`}
                        >
                            NEARBY SCAN
                        </button>
                    </div>

                    <form onSubmit={handlePhoneSearch} className="relative space-y-3">
                        <div>
                             <label className="text-[9px] text-cyan-400 font-mono block mb-1 font-bold">TARGET PHONE NUMBER *</label>
                             <input 
                                type="text" 
                                value={phoneQuery}
                                onChange={(e) => setPhoneQuery(e.target.value)}
                                placeholder="Enter phone number (e.g. 9820012345)" 
                                className="w-full bg-black/50 border border-cyan-500/40 rounded px-3 py-2 text-cyan-100 placeholder-cyan-800 font-mono text-xs focus:outline-none focus:border-cyan-400 transition-colors shadow-inner"
                            />
                        </div>

                        <div>
                             <div className="flex justify-between items-center mb-1">
                                 <label className="text-[9px] text-cyan-400 font-mono block font-bold">ACTIVE TELECOM CIRCLE / STATE</label>
                                 <span className="text-[8px] text-emerald-400 font-mono uppercase bg-emerald-950 px-1 py-0.2 rounded border border-emerald-500/30">REGION LOCK</span>
                             </div>
                             <select
                                value={selectedCircle}
                                onChange={(e) => setSelectedCircle(e.target.value)}
                                className="w-full bg-black/60 border border-cyan-500/40 rounded px-3 py-2 text-cyan-200 font-mono text-xs focus:outline-none focus:border-cyan-400 transition-colors cursor-pointer"
                             >
                                <option value="MAHARASHTRA">MAHARASHTRA & MUMBAI CIRCLE (Navi Mumbai, Mumbai, Pune, Nagpur, Nashik)</option>
                                <option value="DELHI">DELHI NCR CIRCLE (Connaught Place, Gurugram, Noida)</option>
                                <option value="KARNATAKA">KARNATAKA CIRCLE (Bengaluru, Koramangala, Indiranagar)</option>
                                <option value="TELANGANA">TELANGANA CIRCLE (Hyderabad, HITEC City)</option>
                                <option value="UP">UTTAR PRADESH CIRCLE (Lucknow, Noida)</option>
                             </select>
                        </div>

                        <div>
                             <div className="flex justify-between items-center mb-1">
                                 <label className="text-[9px] text-cyan-400 font-mono block font-bold">PRECISE TARGET LOCATION / CITY SECTOR</label>
                                 <span className="text-[8px] text-emerald-400 font-mono uppercase bg-emerald-950 px-1 py-0.2 rounded border border-emerald-500/30">PINPOINT OPTIONAL</span>
                             </div>
                             <input 
                                type="text" 
                                value={customTargetAddress}
                                onChange={(e) => setCustomTargetAddress(e.target.value)}
                                placeholder="e.g. Sector 17 Panvel, Connaught Place, Bandra West" 
                                className="w-full bg-black/50 border border-cyan-500/40 rounded px-3 py-2 text-cyan-100 placeholder-cyan-800 font-mono text-xs focus:outline-none focus:border-cyan-400 transition-colors"
                            />
                        </div>

                        <div>
                             <div className="flex justify-between items-center mb-1">
                                 <label className="text-[9px] text-cyan-500/70 font-mono block">TARGET IMEI NUMBER</label>
                                 <span className="text-[8px] text-cyan-400 font-mono uppercase bg-cyan-950 px-1 py-0.2 rounded border border-cyan-500/30">OPTIONAL</span>
                             </div>
                             <input 
                                type="text" 
                                value={imeiQuery}
                                onChange={(e) => setImeiQuery(e.target.value)}
                                placeholder="Enter IMEI or leave blank for auto-trace" 
                                className="w-full bg-black/50 border border-cyan-500/30 rounded px-3 py-2 text-cyan-100 placeholder-cyan-800 font-mono text-xs focus:outline-none focus:border-cyan-400 transition-colors"
                            />
                        </div>
                        
                        <button 
                            type="submit" 
                            disabled={!phoneQuery || phoneQuery.trim().length < 3}
                            className={`w-full py-2.5 mt-2 rounded font-mono text-xs font-bold tracking-wider transition-all flex items-center justify-center space-x-2 ${(!phoneQuery || phoneQuery.trim().length < 3) ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-cyan-900 via-blue-900 to-cyan-950 text-cyan-300 hover:from-cyan-800 hover:to-blue-800 border border-cyan-500/40 hover:border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'}`}
                        >
                            <svg className="w-4 h-4 text-cyan-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            <span>LOCATE PHONE SIGNAL (PRECISION LOCK)</span>
                        </button>
                    </form>
                </div>

                {/* Tracked Signal Info */}
                {trackedSignal && (
                    <div className="p-4 border-b border-cyan-500/20 bg-cyan-950/40 animate-in slide-in-from-right duration-500">
                        <div className="flex items-center justify-between mb-3 border-b border-cyan-500/20 pb-2">
                            <span className="text-cyan-300 font-bold text-xs tracking-wider flex items-center space-x-1.5">
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                              <span>PRECISION TELECOM FIX ACQUIRED</span>
                            </span>
                            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-500/30">±4.8m GPS LOCK</span>
                        </div>
                        <div className="space-y-2.5 font-mono text-[10px] text-cyan-200/80">
                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-black/60 p-2 rounded border border-cyan-500/20">
                                    <div className="text-cyan-500/60 text-[8px]">TARGET PHONE</div>
                                    <div className="text-white font-bold truncate">{trackedSignal.number}</div>
                                </div>
                                <div className="bg-black/60 p-2 rounded border border-cyan-500/20">
                                    <div className="text-cyan-500/60 text-[8px]">DEVICE MODEL</div>
                                    <div className="text-cyan-300 font-semibold truncate">{trackedSignal.deviceModel}</div>
                                </div>
                            </div>

                            <div className="bg-black/60 p-2 rounded border border-emerald-500/30">
                                <div className="text-emerald-400 text-[8px] font-bold mb-0.5 uppercase tracking-wider">PRECISE STREET & BUILDING ADDRESS</div>
                                <div className="text-white font-bold leading-snug text-[11px]">{trackedSignal.address}</div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-black/60 p-2 rounded border border-cyan-500/20">
                                    <div className="text-cyan-500/60 text-[8px]">CONNECTED BTS TOWER</div>
                                    <div className="text-cyan-300 font-bold truncate">{trackedSignal.btsCellId}</div>
                                </div>
                                <div className="bg-black/60 p-2 rounded border border-cyan-500/20">
                                    <div className="text-cyan-500/60 text-[8px]">LOCATION AREA CODE</div>
                                    <div className="text-emerald-400 font-bold truncate">{trackedSignal.lacCode}</div>
                                </div>
                            </div>

                            <div className="flex justify-between border-b border-cyan-500/10 pb-1 pt-1">
                                <span className="text-cyan-500/60">IMEI IDENTIFIER</span>
                                <span className="text-emerald-400 font-mono font-bold">{trackedSignal.imei}</span>
                            </div>
                            <div className="flex justify-between border-b border-cyan-500/10 pb-1">
                                <span className="text-cyan-500/60">NETWORK CARRIER</span>
                                <span className="text-white font-bold">{trackedSignal.provider}</span>
                            </div>
                            {trackedSignal.distanceFromOperator && (
                                <div className="flex justify-between border-b border-cyan-500/10 pb-1">
                                    <span className="text-cyan-500/60">DISTANCE FROM OPERATOR</span>
                                    <span className="text-cyan-300 font-bold">{trackedSignal.distanceFromOperator}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center pt-1">
                                <span className="text-cyan-500/60">BATTERY TELEMETRY</span>
                                <div className="flex items-center space-x-2">
                                    <div className="w-16 h-2 bg-gray-800 rounded-full overflow-hidden border border-cyan-500/20">
                                        <div className="h-full bg-emerald-400" style={{width: `${trackedSignal.battery}%`}}></div>
                                    </div>
                                    <span className="text-white font-bold">{trackedSignal.battery}%</span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-3 p-2 bg-black/70 rounded border border-cyan-500/30 text-center shadow-inner">
                            <div className="text-[8px] text-cyan-400/80 uppercase font-mono mb-0.5">EXACT LAT / LNG COORDINATES</div>
                            <div className="text-cyan-300 font-mono text-xs font-bold tracking-wider">{trackedSignal.active.lat.toFixed(6)}, {trackedSignal.active.lng.toFixed(6)}</div>
                        </div>
                    </div>
                )}

                <div className="p-4 border-b border-cyan-500/10">
                    <h2 className="text-cyan-400 font-bold tracking-wider text-xs uppercase mb-4 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        Target List
                    </h2>
                    <div className="space-y-2 overflow-y-auto max-h-[300px] scrollbar-thin scrollbar-thumb-cyan-900">
                        {targets.map(target => (
                            <div 
                                key={target.id}
                                onClick={() => {
                                    setSelectedTarget(target);
                                    if(mapInstanceRef.current) mapInstanceRef.current.flyTo([target.lat, target.lng], 15, { animate: true, duration: 1 });
                                }}
                                className={`p-3 rounded border cursor-pointer transition-all ${selectedTarget?.id === target.id ? 'bg-cyan-950/50 border-cyan-500/50' : 'bg-[#050a14]/50 border-cyan-500/10 hover:border-cyan-500/30'}`}
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <span className={`text-sm font-bold ${target.type === 'HOSTILE' ? 'text-red-400' : target.type === 'FRIENDLY' ? 'text-green-400' : 'text-yellow-400'}`}>{target.callsign}</span>
                                    <span className="text-[9px] text-gray-500 font-mono">{target.id}</span>
                                </div>
                                <div className="flex justify-between items-end text-[10px] font-mono text-gray-400">
                                    <div>
                                        <div className="mb-0.5">SPD: <span className="text-white">{target.speed} KM/H</span></div>
                                        <div>HDG: <span className="text-white">{target.heading}°</span></div>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <div className={`w-1.5 h-1.5 rounded-full ${target.speed > 0 ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                                        <span>{target.status}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Selected Target Details */}
                {selectedTarget ? (
                    <div className="flex-grow p-4 bg-black/20 overflow-y-auto">
                        <div className="mb-4 border border-cyan-500/20 rounded p-4 relative overflow-hidden">
                            <div className={`absolute top-0 left-0 w-1 h-full ${selectedTarget.type === 'HOSTILE' ? 'bg-red-500' : selectedTarget.type === 'FRIENDLY' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                            <h3 className="text-white font-bold text-lg mb-1">{selectedTarget.callsign}</h3>
                            <div className="text-cyan-500/60 text-xs font-mono mb-4">{selectedTarget.type} // TRACKING ACTIVE</div>
                            
                            <div className="grid grid-cols-2 gap-4 text-xs font-mono text-gray-400">
                                <div className="bg-[#050a14] p-2 rounded">
                                    <div className="text-cyan-500/40 mb-1">LATITUDE</div>
                                    <div className="text-white">{selectedTarget.lat.toFixed(6)}</div>
                                </div>
                                <div className="bg-[#050a14] p-2 rounded">
                                    <div className="text-cyan-500/40 mb-1">LONGITUDE</div>
                                    <div className="text-white">{selectedTarget.lng.toFixed(6)}</div>
                                </div>
                            </div>
                            
                            <div className="mt-4">
                                <div className="text-cyan-500/40 text-xs mb-1">HISTORY TRAIL</div>
                                <div className="h-16 flex items-end space-x-1">
                                    {selectedTarget.history.map((_: any, i: number) => (
                                        <div key={i} className="flex-1 bg-cyan-500/30" style={{ height: `${Math.random() * 100}%` }}></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        
                        <button className="w-full py-3 bg-red-900/20 border border-red-500/30 text-red-400 font-mono text-xs hover:bg-red-900/40 transition-colors uppercase tracking-widest">
                            INTERCEPT TARGET
                        </button>
                    </div>
                ) : (
                    <div className="flex-grow flex flex-col items-center justify-center text-cyan-500/30 p-8 text-center">
                        <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        <p className="font-mono text-xs tracking-widest">SELECT A TARGET TO VIEW TELEMETRY</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

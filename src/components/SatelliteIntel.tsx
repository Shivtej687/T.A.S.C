import React, { useState, useEffect, useRef } from 'react';

declare global {
  interface Window {
    L: any;
  }
}

// --- Types ---
interface IntelReport {
  id: string;
  title: string;
  date: string;
  size: string;
  level: 'CONFIDENTIAL' | 'SECRET' | 'TOP SECRET';
  content: string;
}

interface Agency {
  id: string;
  name: string;
  fullName: string;
  type: 'MILITARY' | 'INTEL' | 'SPECIAL' | 'PARAMILITARY' | 'INVESTIGATION';
  color: string;
  logo: string;
  isCustomLogo?: boolean;
  bases: { lat: number; lng: number; name: string; status: string }[];
  personnel: string;
  alertLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  description: string;
  reports: IntelReport[];
}

// --- Data ---
const MOCK_REPORTS: IntelReport[] = [
    { id: 'DOC-9921', title: 'Border Infiltration Log', date: '2023-11-12', size: '2.4 MB', level: 'SECRET', content: 'Surveillance drones detected 3 unidentifiable entities crossing Sector 4 at 0300 hours. Interception protocols initiated. Thermal imaging suggests heavy load carrying capacity.' },
    { id: 'DOC-8842', title: 'Asset Deployment Schedule', date: '2023-10-30', size: '1.1 MB', level: 'CONFIDENTIAL', content: 'Rotation of battalion 44 to forward operating bases approved. Logistics train scheduled for departure on 0500 hours via Route Bravo.' },
    { id: 'DOC-7731', title: 'Operation "Silent Thunder"', date: '2023-09-15', size: '8.5 MB', level: 'TOP SECRET', content: 'Strategic strike coordinates locked. Pre-emptive neutralization of hostile radar installations required before Phase 2. Executive authorization pending.' },
    { id: 'DOC-6629', title: 'Personnel Dossier: Unit 9', date: '2023-08-01', size: '4.2 MB', level: 'SECRET', content: 'Performance review of Special Action Group 9 indicates exceptional combat readiness. Recommendation for specialized mountain warfare training.' },
    { id: 'DOC-5510', title: 'Supply Chain Vulnerability', date: '2023-07-22', size: '3.8 MB', level: 'CONFIDENTIAL', content: 'Audit of ammunition depots reveals minor discrepancies in inventory at Site C. Investigation launched into potential internal theft or clerical error.' }
];

const AGENCIES: Agency[] = [
  {
    id: 'ARMY',
    name: 'INDIAN ARMY',
    fullName: 'Bharatiya Thal Sena',
    type: 'MILITARY',
    color: '#166534',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Emblem_of_the_Indian_Army.svg/1024px-Emblem_of_the_Indian_Army.svg.png',
    personnel: '1,237,000 Active',
    alertLevel: 'HIGH',
    description: 'Land-based branch of the Indian Armed Forces. Primary mission is national security and unity, defending against external aggression and internal threats.',
    bases: [
      { lat: 34.0837, lng: 74.7973, name: 'Northern Command HQ', status: 'ACTIVE' },
      { lat: 26.9124, lng: 75.7873, name: 'South Western Command', status: 'PATROL' },
      { lat: 22.5726, lng: 88.3639, name: 'Eastern Command HQ', status: 'ACTIVE' }
    ],
    reports: MOCK_REPORTS
  },
  {
    id: 'NAVY',
    name: 'INDIAN NAVY',
    fullName: 'Bharatiya Nau Sena',
    type: 'MILITARY',
    color: '#1e40af',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Emblem_of_the_Indian_Navy.svg/1024px-Emblem_of_the_Indian_Navy.svg.png',
    personnel: '67,000 Active',
    alertLevel: 'MODERATE',
    description: 'Marine branch of the Indian Armed Forces. Responsible for maritime security, power projection, and sea lane protection.',
    bases: [
      { lat: 18.9220, lng: 72.8347, name: 'Western Naval Command', status: 'DOCK' },
      { lat: 17.6868, lng: 83.2185, name: 'Eastern Naval Command', status: 'ACTIVE' },
      { lat: 9.9312, lng: 76.2673, name: 'Southern Naval Command', status: 'TRAINING' }
    ],
    reports: MOCK_REPORTS
  },
  {
    id: 'IAF',
    name: 'INDIAN AIR FORCE',
    fullName: 'Bharatiya Vayu Sena',
    type: 'MILITARY',
    color: '#0ea5e9',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Indian_Air_Force_Logo_%282%29.svg/1024px-Indian_Air_Force_Logo_%282%29.svg.png',
    personnel: '139,000 Active',
    alertLevel: 'HIGH',
    description: 'Air arm of the Indian Armed Forces. Primary mission is to secure Indian airspace and conduct aerial warfare during armed conflict.',
    bases: [
      { lat: 30.3753, lng: 76.7821, name: 'Ambala Air Force Station', status: 'SCRAMBLE READY' },
      { lat: 28.5961, lng: 77.1587, name: 'Western Air Command', status: 'ACTIVE' },
      { lat: 26.1445, lng: 91.7362, name: 'Eastern Air Command', status: 'PATROL' }
    ],
    reports: MOCK_REPORTS
  },
  {
    id: 'RAW',
    name: 'R&AW',
    fullName: 'Research and Analysis Wing',
    type: 'INTEL',
    color: '#0891b2',
    logo: 'https://upload.wikimedia.org/wikipedia/en/8/87/Research_and_Analysis_Wing_Logo.png',
    personnel: 'CLASSIFIED',
    alertLevel: 'CRITICAL',
    description: 'Foreign intelligence agency of India. Primary function is gathering foreign intelligence, counter-terrorism, and advising Indian policymakers.',
    bases: [
      { lat: 28.5, lng: 77.2, name: 'HQ - CGO Complex', status: 'OPERATIONAL' },
      { lat: 35.0, lng: 76.0, name: 'Listening Post 4', status: 'ACTIVE' },
      { lat: 27.0, lng: 89.0, name: 'Field Unit East', status: 'MONITORING' }
    ],
    reports: MOCK_REPORTS
  },
  {
    id: 'NIA',
    name: 'NIA',
    fullName: 'National Investigation Agency',
    type: 'INVESTIGATION',
    color: '#eab308',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/6/60/National_Investigation_Agency_India_logo.png/220px-National_Investigation_Agency_India_logo.png',
    personnel: 'Unknown',
    alertLevel: 'MODERATE',
    description: 'Central Counter Terrorism Law Enforcement Agency. Empowered to deal with terror related crimes across states without special permission.',
    bases: [
      { lat: 28.58, lng: 77.23, name: 'NIA HQ Delhi', status: 'ACTIVE' },
      { lat: 17.38, lng: 78.48, name: 'Hyderabad Branch', status: 'INVESTIGATING' }
    ],
    reports: MOCK_REPORTS
  },
  {
    id: 'NSG',
    name: 'NSG',
    fullName: 'National Security Guard',
    type: 'SPECIAL',
    color: '#111827',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/3/36/National_Security_Guard.png/250px-National_Security_Guard.png',
    personnel: '7,350 Active',
    alertLevel: 'LOW',
    description: 'Elite counter-terrorism unit under the Ministry of Home Affairs. Nicknamed "Black Cats". Deployed in exceptional situations.',
    bases: [
      { lat: 28.45, lng: 77.02, name: 'Manesar Garrison', status: 'TRAINING' },
      { lat: 19.07, lng: 72.87, name: 'Mumbai Hub', status: 'STANDBY' }
    ],
    reports: MOCK_REPORTS
  },
  {
    id: 'BHAIRAV',
    name: 'BHAIRAV',
    fullName: 'Project Bhairav - Covert Ops',
    type: 'SPECIAL',
    color: '#7f1d1d',
    logo: '',
    isCustomLogo: true,
    personnel: 'REDACTED',
    alertLevel: 'CRITICAL',
    description: 'Black operations division focused on asymmetrical warfare and pre-emptive threat neutralization. Non-existent on public records.',
    bases: [
      { lat: 34.5, lng: 76.5, name: 'Site Black-1', status: 'DARK' },
      { lat: 11.5, lng: 92.5, name: 'Island Outpost 9', status: 'ACTIVE' },
      { lat: 22.0, lng: 80.0, name: 'Deep Jungle Facility', status: 'OFFLINE' }
    ],
    reports: MOCK_REPORTS
  },
  {
    id: 'MARCOS',
    name: 'MARCOS',
    fullName: 'Marine Commandos',
    type: 'SPECIAL',
    color: '#0f172a',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/MARCOS_Insignia.svg/1024px-MARCOS_Insignia.svg.png',
    personnel: '2,000 (Est)',
    alertLevel: 'HIGH',
    description: 'Special operations unit of the Indian Navy. Capable of operating in all three environments: Sea, Air, and Land.',
    bases: [
       { lat: 15.4, lng: 73.8, name: 'INS Abhimanyu', status: 'DEPLOYED' }
    ],
    reports: MOCK_REPORTS
  },
  {
    id: 'IB',
    name: 'IB',
    fullName: 'Intelligence Bureau',
    type: 'INTEL',
    color: '#374151',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/200px-Emblem_of_India.svg.png',
    personnel: '25,000+',
    alertLevel: 'HIGH',
    description: 'Internal intelligence agency. Garnering intelligence from within India and also executes counter-intelligence and counter-terrorism tasks.',
    bases: [
      { lat: 28.6, lng: 77.2, name: 'North Block', status: 'MONITORING' }
    ],
    reports: MOCK_REPORTS
  },
  {
    id: 'PARA',
    name: 'PARA SF',
    fullName: 'Parachute Regiment (Special Forces)',
    type: 'SPECIAL',
    color: '#3f6212',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Para_Commando_Insignia.png/300px-Para_Commando_Insignia.png',
    personnel: 'Classified',
    alertLevel: 'HIGH',
    description: 'Special operations unit of the Indian Army. Specialized in special reconnaissance, direct action, hostage rescue, and counter-terrorism.',
    bases: [
      { lat: 32.2, lng: 76.3, name: 'Special Forces Training School', status: 'DRILL' },
      { lat: 33.0, lng: 75.0, name: 'Forward Base Alpha', status: 'ACTIVE' }
    ],
    reports: MOCK_REPORTS
  },
  {
    id: 'BSF',
    name: 'BSF',
    fullName: 'Border Security Force',
    type: 'PARAMILITARY',
    color: '#854d0e',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e6/Border_Security_Force_Logo.svg/1024px-Border_Security_Force_Logo.svg.png',
    personnel: '265,000 Active',
    alertLevel: 'MODERATE',
    description: 'Primary border guarding organization of India. Ensuring security of the borders of India.',
    bases: [
      { lat: 31.6, lng: 74.5, name: 'Attari Border Post', status: 'PATROL' }
    ],
    reports: MOCK_REPORTS
  },
  {
    id: 'GARUD',
    name: 'GARUD',
    fullName: 'Garud Commando Force',
    type: 'SPECIAL',
    color: '#0369a1',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Garud_Commando_Force_Insignia.png/400px-Garud_Commando_Force_Insignia.png',
    personnel: '1,500 (Est)',
    alertLevel: 'MODERATE',
    description: 'Special forces unit of the Indian Air Force. Tasked with the protection of critical Air Force bases and installations.',
    bases: [
        { lat: 28.5, lng: 77.1, name: 'Air HQ Security', status: 'STANDBY' }
    ],
    reports: MOCK_REPORTS
  },
  {
    id: 'CBI',
    name: 'CBI',
    fullName: 'Central Bureau of Investigation',
    type: 'INVESTIGATION',
    color: '#4b5563',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/05/Central_Bureau_of_Investigation_Logo.svg/1024px-Central_Bureau_of_Investigation_Logo.svg.png',
    personnel: '4,000+',
    alertLevel: 'LOW',
    description: 'Premier investigating agency of India. Operates under the jurisdiction of the Ministry of Personnel, Public Grievances and Pensions.',
    bases: [
        { lat: 28.59, lng: 77.24, name: 'CBI HQ', status: 'ACTIVE' }
    ],
    reports: MOCK_REPORTS
  },
  {
    id: 'CRPF',
    name: 'CRPF',
    fullName: 'Central Reserve Police Force',
    type: 'PARAMILITARY',
    color: '#9f1239',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Central_Reserve_Police_Force_Logo.png/300px-Central_Reserve_Police_Force_Logo.png',
    personnel: '313,000+',
    alertLevel: 'HIGH',
    description: 'Largest Central Armed Police Force. Assists State/Union Territories in police operations to maintain law and order.',
    bases: [
        { lat: 21.2, lng: 81.6, name: 'Jungle Warfare School', status: 'TRAINING' }
    ],
    reports: MOCK_REPORTS
  },
  {
    id: 'SPG',
    name: 'SPG',
    fullName: 'Special Protection Group',
    type: 'SPECIAL',
    color: '#000000',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c7/Special_Protection_Group_%28India%29_logo.svg/1024px-Special_Protection_Group_%28India%29_logo.svg.png',
    personnel: '3,000 (Est)',
    alertLevel: 'CRITICAL',
    description: 'Agency of the Government of India whose sole responsibility is protecting the Prime Minister of India.',
    bases: [
        { lat: 28.61, lng: 77.20, name: 'PM Residence Detail', status: 'ACTIVE' }
    ],
    reports: MOCK_REPORTS
  }
];

interface SatelliteIntelProps {
  onClose: () => void;
}

export const SatelliteIntel: React.FC<SatelliteIntelProps> = ({ onClose }) => {
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  
  // State for Password Protection
  const [selectedReport, setSelectedReport] = useState<IntelReport | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [unlockedReport, setUnlockedReport] = useState<IntelReport | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});

  // Initialize Map when agency is selected
  useEffect(() => {
    if (selectedAgency && mapContainerRef.current && !mapInstanceRef.current && window.L) {
      const map = window.L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
        center: [22.5937, 78.9629], // Center of India
        zoom: 5,
      });

      // Different tiles based on agency vibe
      const tileUrl = selectedAgency.id === 'BHAIRAV' 
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' // Dark mode for black ops
        : 'https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'; // Satellite for others

      window.L.tileLayer(tileUrl, {
        maxZoom: 20,
        subdomains: selectedAgency.id === 'BHAIRAV' ? 'abcd' : ['mt0', 'mt1', 'mt2', 'mt3']
      }).addTo(map);

      mapInstanceRef.current = map;
      setMapLoaded(true);
      markersRef.current = {};

      // Invalidate map size to prevent visual glitches on mobile devices or layout shifts
      setTimeout(() => {
          map.invalidateSize();
      }, 100);

      // Add Markers for Agency Bases
      selectedAgency.bases.forEach(base => {
        const color = selectedAgency.color;
        const iconHtml = `
            <div class="relative flex items-center justify-center w-8 h-8">
                <div class="absolute w-full h-full rounded-full border-2 border-[${color}] ${selectedAgency.id === 'BHAIRAV' ? 'animate-ping' : ''}" style="border-color: ${color}"></div>
                <div class="absolute w-3 h-3 rounded-full" style="background-color: ${color}; box-shadow: 0 0 15px ${color}"></div>
            </div>
        `;

        const icon = window.L.divIcon({
            className: 'agency-marker',
            html: iconHtml,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        });

        const marker = window.L.marker([base.lat, base.lng], { icon })
            .addTo(map)
            .bindPopup(`
                <div style="font-family: 'JetBrains Mono', monospace; color: #000; padding: 5px; min-width: 150px;">
                    <div style="font-size: 10px; color: #666; margin-bottom: 2px;">SECURE FACILITY</div>
                    <strong style="font-size: 14px; text-transform: uppercase;">${base.name}</strong><br/>
                    <div style="margin-top: 4px; font-size: 11px;">
                        STATUS: <span style="color: ${base.status === 'ACTIVE' || base.status === 'OPERATIONAL' ? 'green' : 'orange'}; font-weight: bold;">${base.status}</span>
                    </div>
                    <div style="font-size: 10px; color: #444; margin-top: 4px;">
                        COORD: ${base.lat.toFixed(4)}, ${base.lng.toFixed(4)}
                    </div>
                </div>
            `);
        
        markersRef.current[base.name] = marker;
      });
      
      // Auto-center on first base if available
      if(selectedAgency.bases.length > 0) {
          map.flyTo([selectedAgency.bases[0].lat, selectedAgency.bases[0].lng], 6, { duration: 2 });
      }

    }

    return () => {
      if (!selectedAgency && mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        setMapLoaded(false);
      }
    };
  }, [selectedAgency]);

  const handleBack = () => {
      setSelectedAgency(null);
      setUnlockedReport(null);
  };

  const handleBaseClick = (base: { lat: number; lng: number; name: string }) => {
      if (mapInstanceRef.current) {
          // Fly to location with high zoom for "exact location" feel
          mapInstanceRef.current.flyTo([base.lat, base.lng], 15, { 
              duration: 2,
              easeLinearity: 0.25
          });
          
          const marker = markersRef.current[base.name];
          if (marker) {
              // Open popup after a slight delay to allow fly animation to start
              setTimeout(() => {
                  marker.openPopup();
              }, 1000);
          }
      }
  };

  const handleReportClick = (report: IntelReport) => {
      setSelectedReport(report);
      setPasswordInput('');
      setPasswordError(false);
      setShowPasswordModal(true);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (passwordInput === '9321556103') {
          // Success
          setShowPasswordModal(false);
          setUnlockedReport(selectedReport);
          setSelectedReport(null);
      } else {
          // Error
          setPasswordError(true);
          setTimeout(() => setPasswordError(false), 1000);
      }
  };

// --- Vector Agency Emblem Insignia Component ---
const AgencyInsignia: React.FC<{ agencyId: string; name: string; sizeClass?: string }> = ({ agencyId, name, sizeClass = "w-20 h-20" }) => {
  switch (agencyId) {
    case 'ARMY':
      return (
        <div className={`${sizeClass} flex items-center justify-center rounded-full bg-gradient-to-br from-green-950 via-green-900 to-black border-2 border-amber-400 p-2 shadow-[0_0_15px_rgba(34,197,94,0.3)] relative group`}>
          <svg className="w-full h-full text-amber-400" viewBox="0 0 100 100" fill="currentColor">
            <circle cx="50" cy="50" r="46" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="4 2"/>
            <path d="M25 75 L75 25 M75 75 L25 25" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round"/>
            <path d="M50 15 L58 35 L42 35 Z" fill="#f59e0b"/>
            <circle cx="50" cy="50" r="18" fill="#166534" stroke="#f59e0b" strokeWidth="2"/>
            <text x="50" y="54" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#fef08a" fontFamily="monospace">ARMY</text>
          </svg>
        </div>
      );
    case 'NAVY':
      return (
        <div className={`${sizeClass} flex items-center justify-center rounded-full bg-gradient-to-br from-blue-950 via-blue-900 to-black border-2 border-cyan-400 p-2 shadow-[0_0_15px_rgba(59,130,246,0.4)]`}>
          <svg className="w-full h-full text-cyan-300" viewBox="0 0 100 100" fill="currentColor">
            <circle cx="50" cy="50" r="46" fill="none" stroke="#22d3ee" strokeWidth="2"/>
            <path d="M50 15 A8 8 0 1 0 50 31 A8 8 0 1 0 50 15 Z" fill="none" stroke="#38bdf8" strokeWidth="3"/>
            <path d="M50 31 L50 82 M25 65 C25 82 75 82 75 65 M20 65 L30 65 M70 65 L80 65" stroke="#38bdf8" strokeWidth="4.5" fill="none" strokeLinecap="round"/>
            <text x="50" y="55" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#e0f2fe" fontFamily="monospace">NAVY</text>
          </svg>
        </div>
      );
    case 'IAF':
      return (
        <div className={`${sizeClass} flex items-center justify-center rounded-full bg-gradient-to-br from-sky-950 via-sky-900 to-black border-2 border-sky-400 p-2 shadow-[0_0_15px_rgba(14,165,233,0.4)]`}>
          <svg className="w-full h-full text-sky-300" viewBox="0 0 100 100" fill="currentColor">
            <circle cx="50" cy="50" r="46" fill="none" stroke="#38bdf8" strokeWidth="2"/>
            <path d="M15 45 C30 25 45 40 50 60 C55 40 70 25 85 45 C70 55 55 65 50 75 C45 65 30 55 15 45 Z" fill="#0284c7" stroke="#38bdf8" strokeWidth="2"/>
            <circle cx="50" cy="35" r="10" fill="#f59e0b"/>
            <text x="50" y="88" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#bae6fd" fontFamily="monospace">IAF</text>
          </svg>
        </div>
      );
    case 'RAW':
      return (
        <div className={`${sizeClass} flex items-center justify-center rounded-full bg-gradient-to-br from-cyan-950 via-slate-900 to-black border-2 border-cyan-400 p-2 shadow-[0_0_15px_rgba(6,182,212,0.4)]`}>
          <svg className="w-full h-full text-cyan-400" viewBox="0 0 100 100" fill="none" stroke="currentColor">
            <circle cx="50" cy="50" r="46" stroke="#06b6d4" strokeWidth="2"/>
            <ellipse cx="50" cy="50" rx="40" ry="18" stroke="#22d3ee" strokeWidth="2"/>
            <ellipse cx="50" cy="50" rx="18" ry="40" stroke="#22d3ee" strokeWidth="2"/>
            <circle cx="50" cy="50" r="12" fill="#0891b2"/>
            <polygon points="50,15 54,25 46,25" fill="#f59e0b"/>
            <text x="50" y="54" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#ffffff" stroke="none" fontFamily="monospace">R&AW</text>
          </svg>
        </div>
      );
    case 'ISRO':
    case 'CARTOSAT':
    case 'SATELLITE':
      return (
        <div className={`${sizeClass} flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-950 via-slate-900 to-black border-2 border-amber-400 p-2 shadow-[0_0_15px_rgba(245,158,11,0.5)]`}>
          <svg className="w-full h-full text-amber-400" viewBox="0 0 100 100" fill="none" stroke="currentColor">
            <circle cx="50" cy="50" r="46" stroke="#f59e0b" strokeWidth="2"/>
            <path d="M20 50 A30 30 0 0 1 80 50" stroke="#38bdf8" strokeWidth="3" strokeDasharray="4 2"/>
            <rect x="35" y="42" width="30" height="16" fill="#1e293b" stroke="#f59e0b" strokeWidth="2"/>
            <rect x="10" y="46" width="20" height="8" fill="#0284c7" stroke="#38bdf8"/>
            <rect x="70" y="46" width="20" height="8" fill="#0284c7" stroke="#38bdf8"/>
            <text x="50" y="78" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#fef08a" stroke="none" fontFamily="monospace">ISRO SAT</text>
          </svg>
        </div>
      );
    default:
      return (
        <div className={`${sizeClass} flex items-center justify-center rounded-full bg-gradient-to-br from-slate-900 via-[#0d1f33] to-black border-2 border-cyan-400 p-2 shadow-[0_0_15px_rgba(34,211,238,0.3)]`}>
          <svg className="w-full h-full text-cyan-300" viewBox="0 0 100 100" fill="none" stroke="currentColor">
            <circle cx="50" cy="50" r="44" stroke="#22d3ee" strokeWidth="2.5"/>
            <polygon points="50,18 78,35 78,65 50,82 22,65 22,35" stroke="#38bdf8" strokeWidth="2" fill="rgba(6,182,212,0.15)"/>
            <text x="50" y="55" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#67e8f9" stroke="none" fontFamily="monospace">{agencyId.substring(0, 4)}</text>
          </svg>
        </div>
      );
  }
};

  const renderLogo = (agency: Agency, sizeClass: string = "w-24 h-24") => {
      if (agency.isCustomLogo) {
          return (
              <div className={`${sizeClass} flex items-center justify-center border-4 border-double border-red-900 rounded-full bg-black relative overflow-hidden group-hover:border-red-500 transition-colors`}>
                  <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-[80%] h-[1px] bg-red-900 absolute rotate-45"></div>
                      <div className="w-[80%] h-[1px] bg-red-900 absolute -rotate-45"></div>
                  </div>
                  <div className="z-10 text-red-700 font-black font-mono tracking-tighter leading-none text-center">
                      TOP<br/>SECRET
                  </div>
              </div>
          );
      }

      return <AgencyInsignia agencyId={agency.id} name={agency.name} sizeClass={sizeClass} />;
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#050a14] flex flex-col font-sans animate-in fade-in duration-300">
        
        {/* Background Grid (visible on selection screen) */}
        {!selectedAgency && (
            <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
        )}

        {/* Header */}
        <div className="h-16 bg-[#0a1525] border-b border-cyan-500/20 flex items-center justify-between px-6 z-20 shrink-0 shadow-lg relative">
            <div className="flex items-center space-x-4">
                 <div className="w-10 h-10 border border-cyan-500/30 rounded flex items-center justify-center bg-cyan-900/10">
                    <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                 </div>
                 <div>
                    <h1 className="text-xl font-bold text-white tracking-widest uppercase">Satellite Intel</h1>
                    <div className="text-[10px] text-cyan-500/60 font-mono tracking-[0.2em] uppercase">Ministry of Defence // Integrated Command</div>
                 </div>
            </div>
            
            <button onClick={onClose} className="p-2 hover:bg-red-900/20 rounded text-gray-400 hover:text-red-400 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>

        {/* Main Content */}
        <div className="flex-grow overflow-hidden relative z-10">
            
            {/* --- SELECTION GRID --- */}
            {!selectedAgency ? (
                <div className="h-full overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-cyan-900/50">
                    <div className="max-w-7xl mx-auto">
                        <h2 className="text-cyan-400 font-mono text-sm tracking-[0.3em] uppercase mb-6 border-b border-cyan-500/20 pb-2">Select Agency for Uplink</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 pb-20">
                            {AGENCIES.map(agency => (
                                <div 
                                    key={agency.id}
                                    onClick={() => setSelectedAgency(agency)}
                                    className={`relative group bg-[#0a1525]/80 border ${agency.id === 'BHAIRAV' ? 'border-red-900/40 hover:border-red-500' : 'border-cyan-500/10 hover:border-cyan-400/50'} p-6 rounded-lg cursor-pointer transition-all duration-300 hover:shadow-[0_0_25px_rgba(0,0,0,0.5)] hover:-translate-y-1 overflow-hidden backdrop-blur-sm flex flex-col items-center text-center`}
                                >
                                    {/* Hover Glow */}
                                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500`} style={{ backgroundColor: agency.color }}></div>
                                    
                                    <div className="mb-4 transition-transform duration-300 group-hover:scale-110 flex items-center justify-center h-24 w-24">
                                        {renderLogo(agency, "w-20 h-20")}
                                    </div>
                                    
                                    <h3 className={`font-bold text-sm tracking-wider uppercase mb-1 ${agency.id === 'BHAIRAV' ? 'text-red-500' : 'text-cyan-100'}`}>{agency.name}</h3>
                                    <p className="text-[9px] text-gray-500 font-mono uppercase tracking-widest">{agency.type}</p>
                                    
                                    {/* Tech Lines */}
                                    <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-white/10 group-hover:border-white/50 transition-colors"></div>
                                    <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-white/10 group-hover:border-white/50 transition-colors"></div>
                                    <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-white/10 group-hover:border-white/50 transition-colors"></div>
                                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-white/10 group-hover:border-white/50 transition-colors"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                /* --- AGENCY DETAIL VIEW --- */
                <div className="flex flex-col lg:flex-row h-full relative">
                    {/* Left Sidebar Info */}
                    <div className="w-full lg:w-96 bg-[#0a1525] border-b lg:border-b-0 lg:border-r border-cyan-500/20 flex flex-col z-20 shadow-2xl overflow-y-auto shrink-0 order-2 lg:order-1 h-[45vh] lg:h-full">
                        <div className="p-6 border-b border-cyan-500/10 relative overflow-hidden">
                            {/* Header BG Accent */}
                            <div className="absolute top-0 right-0 w-32 h-32 opacity-10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" style={{ backgroundColor: selectedAgency.color }}></div>
                            
                            <button onClick={handleBack} className="mb-6 flex items-center space-x-2 text-gray-500 hover:text-white text-xs font-mono uppercase tracking-widest transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                <span>Return to Grid</span>
                            </button>

                            <div className="mb-4 flex justify-center">
                                {renderLogo(selectedAgency, "w-32 h-32")}
                            </div>
                            <h2 className="text-3xl font-bold text-white uppercase leading-none mb-1 text-center">{selectedAgency.name}</h2>
                            <h3 className="text-sm text-gray-400 font-mono uppercase tracking-wider mb-4 text-center">{selectedAgency.fullName}</h3>
                            
                            <div className="space-y-4">
                                <div className="bg-black/30 p-3 rounded border border-white/5">
                                    <div className="text-[10px] text-gray-500 font-mono uppercase mb-1">Alert Level</div>
                                    <div className={`font-bold text-sm tracking-widest ${selectedAgency.alertLevel === 'CRITICAL' ? 'text-red-500 animate-pulse' : selectedAgency.alertLevel === 'HIGH' ? 'text-orange-500' : 'text-green-500'}`}>{selectedAgency.alertLevel}</div>
                                </div>
                                <div className="bg-black/30 p-3 rounded border border-white/5">
                                    <div className="text-[10px] text-gray-500 font-mono uppercase mb-1">Personnel</div>
                                    <div className="text-white font-mono">{selectedAgency.personnel}</div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 flex-grow">
                             <h4 className="text-cyan-500/60 font-mono text-xs uppercase tracking-widest mb-4">Mission Profile</h4>
                             <p className="text-gray-300 text-sm leading-relaxed mb-6 font-sans">
                                 {selectedAgency.description}
                             </p>

                             <h4 className="text-red-500/80 font-mono text-xs uppercase tracking-widest mb-4 border-b border-red-900/30 pb-2">Encrypted Archives</h4>
                             <div className="space-y-2 mb-6">
                                 {selectedAgency.reports.map((report) => (
                                     <div 
                                        key={report.id} 
                                        onClick={() => handleReportClick(report)}
                                        className="flex justify-between items-center p-3 bg-[#0f1c2e] border border-cyan-500/10 rounded hover:border-cyan-500/40 hover:bg-[#1a2c42] transition-all cursor-pointer group"
                                     >
                                         <div className="flex items-center space-x-3">
                                             <div className="p-2 bg-black/40 rounded text-cyan-500/70 group-hover:text-cyan-400">
                                                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                             </div>
                                             <div>
                                                 <div className="text-white text-xs font-bold group-hover:text-cyan-300 transition-colors">{report.title}</div>
                                                 <div className="text-[9px] text-gray-500 font-mono">{report.id} • {report.size}</div>
                                             </div>
                                         </div>
                                         <div className="text-[10px] text-red-500 font-mono">
                                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                         </div>
                                     </div>
                                 ))}
                             </div>

                             <h4 className="text-cyan-500/60 font-mono text-xs uppercase tracking-widest mb-4">Active Nodes</h4>
                             <div className="space-y-2">
                                 {selectedAgency.bases.map((base, idx) => (
                                     <div 
                                        key={idx} 
                                        onClick={() => handleBaseClick(base)}
                                        className="flex justify-between items-center p-3 bg-[#050a14] border border-cyan-500/10 rounded hover:border-cyan-500/50 hover:bg-cyan-900/10 transition-all cursor-pointer group"
                                     >
                                         <div>
                                             <div className="text-white text-xs font-bold group-hover:text-cyan-400 transition-colors">{base.name}</div>
                                             <div className="text-[9px] text-gray-500 font-mono group-hover:text-cyan-500/60">LAT: {base.lat} | LNG: {base.lng}</div>
                                         </div>
                                         <div className="flex flex-col items-end space-y-1">
                                            <div className={`text-[9px] px-2 py-0.5 rounded font-bold ${base.status === 'ACTIVE' || base.status === 'OPERATIONAL' ? 'text-green-400 bg-green-900/20' : 'text-orange-400 bg-orange-900/20'}`}>{base.status}</div>
                                            <div className="text-[8px] text-cyan-500/40 opacity-0 group-hover:opacity-100 transition-opacity font-mono tracking-wider">LOCATE &gt;&gt;</div>
                                         </div>
                                     </div>
                                 ))}
                             </div>
                        </div>
                    </div>

                    {/* Right Map Area */}
                    <div className="flex-grow relative bg-black order-1 lg:order-2 h-[55vh] lg:h-full">
                        <div ref={mapContainerRef} className="absolute inset-0 z-0"></div>
                        
                        {/* Map Overlay UI */}
                        <div className="absolute top-6 right-6 z-10 pointer-events-none">
                            <div className="bg-black/70 backdrop-blur border border-white/10 p-4 rounded text-right">
                                <div className="text-xs text-gray-400 font-mono uppercase">Live Satellite Feed</div>
                                <div className="text-lg font-bold text-white uppercase tracking-widest">{selectedAgency.id} // SECURE</div>
                            </div>
                        </div>

                        {/* Scanlines */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none z-0 opacity-50"></div>
                    </div>

                    {/* PASSWORD MODAL */}
                    {showPasswordModal && selectedReport && (
                        <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
                            <div className={`w-full max-w-md bg-[#0a1525] border ${passwordError ? 'border-red-500 animate-shake' : 'border-red-500/50'} p-8 rounded shadow-[0_0_50px_rgba(255,0,0,0.1)] relative`}>
                                <button onClick={() => setShowPasswordModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                                
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 border-2 border-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500 bg-red-900/10">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-red-500 uppercase tracking-widest">Restricted Access</h3>
                                    <p className="text-xs text-gray-400 font-mono mt-2">ENCRYPTION LEVEL: {selectedReport.level}</p>
                                </div>

                                <form onSubmit={handlePasswordSubmit}>
                                    <div className="mb-6 relative">
                                        <label className="block text-[9px] text-red-500/70 font-mono mb-2 uppercase tracking-widest">Enter Security Clearance Code</label>
                                        <input 
                                            type="password" 
                                            autoFocus
                                            value={passwordInput}
                                            onChange={(e) => setPasswordInput(e.target.value)}
                                            className="w-full bg-black border border-red-900/50 text-white font-mono text-center text-lg py-3 tracking-[0.5em] focus:outline-none focus:border-red-500 focus:shadow-[0_0_15px_rgba(220,38,38,0.2)] placeholder-gray-800"
                                            placeholder="••••••••••"
                                        />
                                        {passwordError && (
                                            <div className="absolute -bottom-6 left-0 w-full text-center text-red-500 text-[10px] font-bold font-mono animate-pulse">ACCESS DENIED - INVALID CREDENTIALS</div>
                                        )}
                                    </div>
                                    <button type="submit" className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-widest transition-all">
                                        DECRYPT FILE
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* DOCUMENT VIEWER MODAL */}
                    {unlockedReport && (
                        <div className="absolute inset-0 z-50 bg-[#0c0c0c] flex flex-col animate-in zoom-in-95 duration-200">
                            {/* Toolbar */}
                            <div className="h-14 bg-[#1a1a1a] border-b border-gray-800 flex justify-between items-center px-6 shrink-0">
                                <div className="flex items-center space-x-4">
                                    <div className="text-gray-400">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    </div>
                                    <div>
                                        <h3 className="text-white text-sm font-bold">{unlockedReport.title}</h3>
                                        <div className="text-[10px] text-gray-500 font-mono">{unlockedReport.id} • {unlockedReport.level}</div>
                                    </div>
                                </div>
                                <button onClick={() => setUnlockedReport(null)} className="p-2 bg-red-600 hover:bg-red-500 text-white rounded text-xs font-bold px-4 transition-colors">
                                    CLOSE VIEWER
                                </button>
                            </div>

                            {/* Document Body */}
                            <div className="flex-grow overflow-y-auto p-8 md:p-16 bg-[#111] relative">
                                <div className="max-w-4xl mx-auto bg-white min-h-[1000px] shadow-2xl p-12 md:p-20 relative text-black font-serif">
                                    
                                    {/* Watermark */}
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] overflow-hidden">
                                        <div className="transform -rotate-45 text-9xl font-black text-black whitespace-nowrap">TOP SECRET</div>
                                    </div>

                                    {/* Header */}
                                    <div className="text-center border-b-2 border-black pb-8 mb-8">
                                        <h1 className="text-3xl font-bold uppercase tracking-widest mb-2">Intelligence Report</h1>
                                        <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-gray-600">Ministry of Defence • Gov. of India</h2>
                                        <div className="mt-6 flex justify-between text-xs font-mono border-t border-black pt-2">
                                            <span>DATE: {unlockedReport.date}</span>
                                            <span>CLASS: {unlockedReport.level}</span>
                                            <span>REF: {unlockedReport.id}</span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="space-y-6 text-justify leading-relaxed">
                                        <p className="font-bold text-sm uppercase">SUBJECT: {unlockedReport.title}</p>
                                        
                                        <p>
                                            <strong>1. EXECUTIVE SUMMARY</strong><br/>
                                            This document contains sensitive information regarding ongoing operations. Unauthorized distribution is a punishable offense under the Official Secrets Act.
                                        </p>

                                        <p>
                                            <strong>2. INTELLIGENCE BRIEF</strong><br/>
                                            {unlockedReport.content}
                                        </p>

                                        <p>
                                            The aforementioned data has been corroborated by field assets and satellite telemetry. Immediate action is recommended based on the threat assessment matrix attached in Appendix A.
                                        </p>

                                        <div className="py-4">
                                            <div className="w-full h-32 bg-gray-100 border border-gray-300 flex items-center justify-center text-gray-400 font-mono text-xs">
                                                [REDACTED IMAGE DATA - SECURE TERMINAL REQUIRED FOR FULL RENDER]
                                            </div>
                                        </div>

                                        <p>
                                            <strong>3. DIRECTIVES</strong><br/>
                                            All units are to maintain communication silence until given the green light. Further instructions will be transmitted via secure channels.
                                        </p>
                                    </div>

                                    {/* Footer */}
                                    <div className="mt-20 pt-8 border-t border-black flex justify-between items-end">
                                        <div className="text-center">
                                            <div className="w-24 h-24 border-4 border-red-700 rounded-full flex items-center justify-center text-red-700 font-bold text-[10px] uppercase rotate-[-15deg] opacity-70 mb-2">
                                                Certified<br/>Classified
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="h-10 w-48 border-b border-black mb-2"></div>
                                            <div className="text-xs font-bold uppercase">Authorized Signature</div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    </div>
  );
};
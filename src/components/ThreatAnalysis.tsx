import React, { useState, useEffect, useRef, useCallback } from 'react';

declare global {
  interface Window {
    L: any; // Leaflet global
  }
}

export interface ThreatItem {
  id: number;
  name: string;
  region: string;
  lat: number;
  lng: number;
  streetViewLat: number;
  streetViewLng: number;
  level: number;
  type: string;
  activeForce: string;
  forceEmail: string;
  commander: string;
  station: string;
}

export interface ForceDeployment {
  id: string;
  threatId: number;
  threatName: string;
  region: string;
  lat: number;
  lng: number;
  activeForce: string;
  forceEmail: string;
  commander: string;
  station: string;
  dispatchPriority: string;
  tacticalDirectives: string;
  specialInstructions: string;
  dispatchCode: string;
  dispatchedAt: string;
  timestamp: number;
  dispatchMailHeader: {
    from: string;
    to: string;
    subject: string;
    securityClassification: string;
    hashSignature: string;
  };
  situationStatus: string;
  threatLevelBefore: number;
  threatLevelAfter: number;
  tasksExecuted: string[];
}

// Precise coordinates & Regional Active Forces for Threat Locations
const INITIAL_THREAT_LOCATIONS: ThreatItem[] = [
  { 
    id: 1, 
    name: 'Northern Sector', 
    region: 'Kashmir Valley (LOC)', 
    lat: 34.1491, 
    lng: 75.0592, 
    streetViewLat: 28.6129,
    streetViewLng: 77.2295, 
    level: 85, 
    type: 'Cross-Border Infiltration & Swarm Drones',
    activeForce: '15 Corps - Rashtriya Rifles Counter-Terror Command',
    forceEmail: '15corps.rashtriya.rifles@defence.gov.in',
    commander: 'Lt. Gen. S. K. Dahiya',
    station: 'Badami Bagh Cantonment, Srinagar'
  },
  { 
    id: 2, 
    name: 'Eastern Corridor', 
    region: 'Siliguri Corridor', 
    lat: 26.7020, 
    lng: 88.4280, 
    streetViewLat: 22.5448,
    streetViewLng: 88.3425, 
    level: 72, 
    type: 'Hostile Insurgency & Electronic Jamming',
    activeForce: '33 Corps Mountain Strike Division',
    forceEmail: '33corps.mountain.strike@defence.gov.in',
    commander: 'Maj. Gen. Anirban Roy',
    station: 'Sukna Military Cantonment, West Bengal'
  },
  { 
    id: 3, 
    name: 'Western Border', 
    region: 'Jaisalmer Outpost', 
    lat: 27.2435, 
    lng: 70.9223, 
    streetViewLat: 26.9124,
    streetViewLng: 70.9130, 
    level: 68, 
    type: 'Armored Smuggling & Tunnel Intrusion',
    activeForce: 'BSF 12th Desert Warfare & Tactical Battalion',
    forceEmail: 'bsf.desert.warfare.hq@defence.gov.in',
    commander: 'Commandant R. V. Rathore',
    station: 'Jaisalmer Sector Operational HQ'
  },
  { 
    id: 4, 
    name: 'Central Zone', 
    region: 'Red Corridor Sector 4', 
    lat: 21.2787, 
    lng: 81.8661, 
    streetViewLat: 21.1477,
    streetViewLng: 79.0883, 
    level: 45, 
    type: 'Guerrilla Reconnaissance & Explosives Cache',
    activeForce: 'CRPF 201st COBRA Special Commando Unit',
    forceEmail: 'cobra201.central.commando@crpf.gov.in',
    commander: 'Inspector General V. P. Singh',
    station: 'Jagdalpur Tactical Command Center'
  }, 
];

const LOCAL_STORAGE_KEY = 'TACTICAL_FORCE_DEPLOYMENTS_LOG_V2';
const SENT_EMAILS_STORAGE_KEY = 'SECURE_SENT_EMAILS_V1';

interface ThreatAnalysisProps {
  onClose: () => void;
}

export const ThreatAnalysis: React.FC<ThreatAnalysisProps> = ({ onClose }) => {
  const [threatLocations, setThreatLocations] = useState<ThreatItem[]>(INITIAL_THREAT_LOCATIONS);
  const [selectedThreat, setSelectedThreat] = useState<ThreatItem>(INITIAL_THREAT_LOCATIONS[0]);
  const [showStreetView, setShowStreetView] = useState(false);
  const [activeView, setActiveView] = useState<'MAP' | 'OFFICE_LOG'>('MAP');

  // Persistent Deployments state
  const [deploymentsMap, setDeploymentsMap] = useState<Record<number, ForceDeployment>>({});
  
  // Deployment Modal state
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [threatToDeploy, setThreatToDeploy] = useState<ThreatItem | null>(null);
  const [priorityInput, setPriorityInput] = useState('FLASH CRITICAL (PRIORITY 1)');
  const [directivesInput, setDirectivesInput] = useState('');
  const [specialNotes, setSpecialNotes] = useState('');
  
  // View Dispatched Mail Modal state
  const [viewMailModal, setViewMailModal] = useState<ForceDeployment | null>(null);

  // Notification Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // Trigger dynamic threat re-detection
  const triggerThreatScan = useCallback((targetThreat?: ThreatItem) => {
    const threatId = Date.now();
    const isPostDeploy = !!targetThreat;

    const newThreat: ThreatItem = isPostDeploy ? {
      id: threatId,
      name: `${targetThreat.name} - Post-Deployment Infiltration Breach`,
      region: `${targetThreat.region} (Sub-Sector Alpha)`,
      lat: targetThreat.lat + (Math.random() * 0.08 - 0.04),
      lng: targetThreat.lng + (Math.random() * 0.08 - 0.04),
      streetViewLat: targetThreat.streetViewLat,
      streetViewLng: targetThreat.streetViewLng,
      level: Math.floor(78 + Math.random() * 18),
      type: 'Secondary Hostile Swarm Intrusion // High Explosive Payload Detected',
      activeForce: 'Para SF 9th Tactical Counter-Incursion Command',
      forceEmail: 'parasf.counterops@defence.gov.in',
      commander: 'Col. Devendra Rathore',
      station: 'Forward Air Base Command'
    } : {
      id: threatId,
      name: `Real-Time Radar Anomaly - Sector ${Math.floor(100 + Math.random() * 900)}`,
      region: 'Galwan High Altitude Forward Ridge',
      lat: 34.6500 + (Math.random() * 0.1 - 0.05),
      lng: 78.2000 + (Math.random() * 0.1 - 0.05),
      streetViewLat: 34.6500,
      streetViewLng: 78.2000,
      level: 92,
      type: 'Hostile Quadcopter Infiltration // Encrypted Telemetry Grid Breached',
      activeForce: '14 Corps High Altitude Electronic Warfare Battalion',
      forceEmail: '14corps.ew@defence.gov.in',
      commander: 'Brig. Vikram Rawat',
      station: 'Leh Military Cantonment'
    };

    setThreatLocations(prev => [newThreat, ...prev]);
    setSelectedThreat(newThreat);
    setShowStreetView(false);

    setToastMessage(`🚨 RE-DETECTION THREAT SCAN COMPLETE: DETECTED NEW ACTIVE THREAT [${newThreat.name.toUpperCase()}]!`);
    setTimeout(() => {
      setToastMessage(null);
    }, 7000);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([newThreat.lat, newThreat.lng], 9, { duration: 1.5 });
    }
  }, []);

  // Load persistent deployments from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const list: ForceDeployment[] = JSON.parse(stored);
        const mapObj: Record<number, ForceDeployment> = {};
        list.forEach(item => {
          mapObj[item.threatId] = item;
        });
        setDeploymentsMap(mapObj);
      }
    } catch (e) {
      console.error('Failed to load force deployments from storage', e);
    }
  }, []);

  // Update map markers when threat list or deployments change
  const refreshMapMarkers = () => {
    if (!mapInstanceRef.current || !window.L) return;

    // Remove existing markers
    markersRef.current.forEach(m => mapInstanceRef.current.removeLayer(m));
    markersRef.current = [];

    threatLocations.forEach(threat => {
      const isDeployed = !!deploymentsMap[threat.id];

      const icon = window.L.divIcon({
        className: 'threat-icon',
        html: isDeployed
          ? `<div class="pulse-ring-deployed"></div><div class="pulse-core-deployed"></div>`
          : `<div class="pulse-ring"></div><div class="pulse-core"></div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      const marker = window.L.marker([threat.lat, threat.lng], { icon })
        .addTo(mapInstanceRef.current)
        .on('click', () => {
           setSelectedThreat(threat);
           setShowStreetView(false);
           mapInstanceRef.current.flyTo([threat.lat, threat.lng], 10, { duration: 1.5 });
        });
      
      markersRef.current.push(marker);
    });
  };

  useEffect(() => {
    // Only initialize Leaflet map if container exists and map isn't initialized
    if (mapContainerRef.current && !mapInstanceRef.current && window.L) {
      const map = window.L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
        center: [22.5937, 78.9629], // Center of India
        zoom: 5
      });

      // Google Satellite Tiles (Hybrid to see labels)
      window.L.tileLayer('https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
      }).addTo(map);

      window.L.control.attribution({ position: 'bottomright', prefix: false })
        .addAttribution('Google Maps Satellite | T.A.S.C. Defense Network')
        .addTo(map);

      mapInstanceRef.current = map;
      refreshMapMarkers();
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersRef.current = [];
      }
    };
  }, []);

  // Refresh map markers when threatLocations or deploymentsMap updates
  useEffect(() => {
    refreshMapMarkers();
  }, [threatLocations, deploymentsMap]);

  const handleThreatClick = (threat: ThreatItem) => {
    setSelectedThreat(threat);
    setShowStreetView(false);
    if (mapInstanceRef.current) {
       mapInstanceRef.current.flyTo([threat.lat, threat.lng], 12, { duration: 2 });
    }
  };

  const handleResetView = () => {
    if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([22.5937, 78.9629], 5, { duration: 1.5 });
    }
  };

  // Open Deploy Modal for a threat
  const openDeployModal = (threat: ThreatItem) => {
    setThreatToDeploy(threat);
    setPriorityInput('FLASH CRITICAL (PRIORITY 1)');
    setDirectivesInput(
      `1. Immediate deployment of 2 Rapid Response Infantry Battalions to sector coordinates (${threat.lat}, ${threat.lng}).\n` +
      `2. Establish 360-degree perimeter lockdown and activate anti-drone electronic jamming dome.\n` +
      `3. Execute hostile suppression protocols and secure civilian infrastructure in ${threat.region}.\n` +
      `4. Provide continuous real-time tactical feed to Supreme Head Command.`
    );
    setSpecialNotes(`Authorized under Supreme Head Emergency Defense Protocol. Direct contact established with ${threat.commander}.`);
    setIsDeployModalOpen(true);
  };

  // Confirm Dispatch Mail and Execute Deployment
  const confirmDispatchAndDeploy = () => {
    if (!threatToDeploy) return;

    const dispatchCode = `DISP-${Math.floor(100000 + Math.random() * 900000)}-MIL`;
    const hashSig = `SIG-SHA256-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    const timestampStr = new Date().toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'medium' });

    const newDeployment: ForceDeployment = {
      id: `DEP-${Date.now()}-${threatToDeploy.id}`,
      threatId: threatToDeploy.id,
      threatName: threatToDeploy.name,
      region: threatToDeploy.region,
      lat: threatToDeploy.lat,
      lng: threatToDeploy.lng,
      activeForce: threatToDeploy.activeForce,
      forceEmail: threatToDeploy.forceEmail,
      commander: threatToDeploy.commander,
      station: threatToDeploy.station,
      dispatchPriority: priorityInput,
      tacticalDirectives: directivesInput,
      specialInstructions: specialNotes,
      dispatchCode,
      dispatchedAt: timestampStr,
      timestamp: Date.now(),
      dispatchMailHeader: {
        from: 'supreme.head.command@tasc.defence.gov.in',
        to: threatToDeploy.forceEmail,
        subject: `[EMERGENCY DISPATCH] Force Deployment Directive for ${threatToDeploy.name} (${threatToDeploy.region})`,
        securityClassification: 'TOP SECRET // CRYPTOGRAPHICALLY SIGNED DISPATCH ORDER',
        hashSignature: hashSig
      },
      situationStatus: 'FORCES DEPLOYED // SECTOR ISOLATED // SITUATION CONTAINED',
      threatLevelBefore: threatToDeploy.level,
      threatLevelAfter: 12,
      tasksExecuted: [
        `Active Force ${threatToDeploy.activeForce} mobilized to Grid (${threatToDeploy.lat}, ${threatToDeploy.lng})`,
        `Anti-drone ECM radar & airspace lockdown active over ${threatToDeploy.region}`,
        `Tactical ground perimeter locked by ${threatToDeploy.commander} (${threatToDeploy.station})`,
        `Direct military encrypted email dispatched & acknowledged by ${threatToDeploy.forceEmail}`
      ]
    };

    // Update state map
    const updatedMap = {
      ...deploymentsMap,
      [threatToDeploy.id]: newDeployment
    };
    setDeploymentsMap(updatedMap);

    // Save to LocalStorage permanently
    try {
      const list = Object.values(updatedMap);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));

      // Also append to SENT_EMAILS_STORAGE_KEY for cross-module integration with SecureEmail
      const existingMails = JSON.parse(localStorage.getItem(SENT_EMAILS_STORAGE_KEY) || '[]');
      const mailRecord = {
        id: `EMAIL-${Date.now()}`,
        sender: 'Me (Supreme Head)',
        recipient: threatToDeploy.forceEmail,
        subject: newDeployment.dispatchMailHeader.subject,
        snippet: `[DISPATCH CODE: ${dispatchCode}] Direct military order to ${threatToDeploy.activeForce}. Directives: ${directivesInput.substring(0, 100)}...`,
        time: timestampStr,
        read: true,
        label: 'command',
        folder: 'sent',
        body: directivesInput
      };
      localStorage.setItem(SENT_EMAILS_STORAGE_KEY, JSON.stringify([mailRecord, ...existingMails]));
    } catch (err) {
      console.error('Error writing deployment log to localStorage', err);
    }

    setIsDeployModalOpen(false);
    setToastMessage(`ENCRYPTED MILITARY MAIL DISPATCHED TO ${threatToDeploy.forceEmail}. FORCES DEPLOYED IN ${threatToDeploy.name.toUpperCase()}!`);
    
    // Automatically trigger secondary threat re-detection after deployment
    setTimeout(() => {
      triggerThreatScan(threatToDeploy);
    }, 3500);

    setTimeout(() => {
      setToastMessage(null);
    }, 6000);
  };

  const allDeploymentsList: ForceDeployment[] = Object.values(deploymentsMap);

  return (
    <div className="fixed inset-0 z-50 bg-[#050a14] animate-in fade-in duration-500 overflow-hidden font-sans">
        {/* Map Container for Leaflet */}
        <div ref={mapContainerRef} className={`absolute inset-0 z-0 bg-black transition-opacity duration-300 ${activeView === 'OFFICE_LOG' ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}></div>
        
        {/* Grid Overlay for Tactical Tech Feel */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none z-10"></div>
        
        {/* Toast Notification Banner */}
        {toastMessage && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-950/95 border-2 border-emerald-400 text-emerald-200 px-6 py-3 rounded-md shadow-[0_0_35px_rgba(16,185,129,0.5)] flex items-center space-x-3 font-mono text-xs animate-bounce">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="font-bold tracking-wider">{toastMessage}</span>
          </div>
        )}

        {/* Top Header Controls Bar */}
        <div className="absolute top-4 left-4 right-4 md:right-auto z-40 flex flex-wrap items-center gap-2">
          <div className="bg-[#0a1525]/90 backdrop-blur border border-cyan-500/40 rounded px-3 py-2 flex items-center space-x-2 shadow-lg">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></div>
            <span className="text-cyan-300 font-mono text-xs font-bold tracking-widest uppercase">
              T.A.S.C. SUPREME COMMAND CENTER
            </span>
          </div>

          <div className="flex items-center space-x-1 bg-[#0a1525]/90 backdrop-blur border border-cyan-500/30 rounded p-1 shadow-lg">
            <button
              onClick={() => setActiveView('MAP')}
              className={`px-3 py-1.5 rounded font-mono text-[10px] font-bold uppercase tracking-wider transition-all flex items-center space-x-1.5 ${
                activeView === 'MAP'
                  ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.6)]'
                  : 'text-cyan-400 hover:bg-cyan-900/40'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
              <span>SURVEILLANCE MAP</span>
            </button>

            <button
              onClick={() => setActiveView('OFFICE_LOG')}
              className={`px-3 py-1.5 rounded font-mono text-[10px] font-bold uppercase tracking-wider transition-all flex items-center space-x-1.5 relative ${
                activeView === 'OFFICE_LOG'
                  ? 'bg-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.6)]'
                  : 'text-emerald-400 hover:bg-emerald-900/40'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              <span>DEPLOYED MAILS AUDIT LOG</span>
              {allDeploymentsList.length > 0 && (
                <span className="ml-1 bg-emerald-400 text-black px-1.5 py-0.2 rounded-full text-[9px] font-bold">
                  {allDeploymentsList.length}
                </span>
              )}
            </button>

            <button
              onClick={() => triggerThreatScan()}
              className="px-3 py-1.5 rounded font-mono text-[10px] font-bold uppercase tracking-wider bg-red-950/80 border border-red-500/60 text-red-300 hover:bg-red-900 transition-all flex items-center space-x-1.5 shadow-[0_0_12px_rgba(239,68,68,0.4)]"
            >
              <svg className="w-3.5 h-3.5 text-red-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6.364 1.636l-.707.707M21 12h-1m-1.636 6.364l-.707-.707M12 21v-1m-6.364-1.636l.707-.707M3 12h1m1.636-6.364l.707.707" /></svg>
              <span>📡 SCAN / TRIGGER RE-DETECTION</span>
            </button>
          </div>
        </div>

        {/* Street View Overlay */}
        {showStreetView && (
            <div className="absolute inset-0 z-50 bg-black flex flex-col animate-in fade-in duration-300">
                <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
                    {/* Scanlines */}
                    <div className="w-full h-full bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] opacity-20"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.8)_100%)]"></div>
                </div>
                
                {/* Header */}
                <div className="relative z-30 bg-[#0a1525] border-b border-cyan-500/30 p-4 flex justify-between items-center shadow-2xl">
                    <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_red]"></div>
                        <div className="text-cyan-400 font-mono text-xs tracking-[0.2em] uppercase">
                            LIVE FEED // <span className="text-white font-bold">{selectedThreat.name}</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="hidden lg:flex space-x-2 text-[10px] font-mono text-cyan-500/50">
                            <span>LAT: {selectedThreat.lat}</span>
                            <span>LNG: {selectedThreat.lng}</span>
                        </div>
                        <button 
                            onClick={() => setShowStreetView(false)}
                            className="px-3 py-1.5 bg-red-900/20 border border-red-500/50 text-red-400 text-[9px] md:text-[10px] font-mono tracking-wider hover:bg-red-900/40 transition-colors rounded"
                        >
                            TERMINATE FEED
                        </button>
                    </div>
                </div>

                {/* Iframe Container */}
                <div className="relative flex-grow w-full bg-black">
                    <iframe
                        title="Street View"
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        src={`https://maps.google.com/maps?layer=c&cbll=${selectedThreat.streetViewLat || selectedThreat.lat},${selectedThreat.streetViewLng || selectedThreat.lng}&cbp=12,0,0,0,0&output=svembed`}
                        className="w-full h-full transition-all duration-500 filter-none"
                        allowFullScreen
                    ></iframe>
                    
                    {/* Reticle Overlay */}
                    <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center opacity-30">
                        <div className="w-[500px] h-[500px] border border-cyan-500/30 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-cyan-500/50 rounded-full"></div>
                        </div>
                        <div className="absolute w-full h-[1px] bg-cyan-500/20"></div>
                        <div className="absolute h-full w-[1px] bg-cyan-500/20"></div>
                    </div>
                </div>
            </div>
        )}

        {/* Reset View Button on Map */}
        {activeView === 'MAP' && (
          <div className="absolute bottom-[52vh] md:bottom-8 left-4 md:left-8 z-40 pointer-events-auto">
              <button 
                  onClick={handleResetView}
                  className="px-3 md:px-6 py-2 md:py-3 bg-black/80 backdrop-blur border border-cyan-500/50 text-cyan-400 font-mono text-[10px] md:text-xs uppercase tracking-widest hover:bg-cyan-950/80 transition-all flex items-center space-x-2 rounded-sm shadow-lg"
              >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                  <span>RESET SATELLITE FOCUS</span>
              </button>
          </div>
        )}

        {/* SUPREME COMMANDER OFFICE AUDIT LOG VIEW (When toggled to OFFICE_LOG) */}
        {activeView === 'OFFICE_LOG' && (
          <div className="absolute inset-0 z-30 pt-20 p-4 md:p-8 overflow-y-auto bg-[#030914]/95 backdrop-blur-xl flex flex-col items-center">
             <div className="w-full max-w-6xl space-y-6">
                
                {/* Office Header */}
                <div className="bg-[#07111e] border-2 border-emerald-500/40 rounded-lg p-6 shadow-[0_0_30px_rgba(16,185,129,0.2)] relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 text-emerald-500/10 font-mono text-6xl font-bold select-none pointer-events-none">
                    HQ DISPATCH
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
                        <h1 className="text-xl md:text-2xl font-bold text-white font-mono tracking-wider">
                          SUPREME HEAD MILITARY DISPATCH OFFICE
                        </h1>
                      </div>
                      <p className="text-xs text-cyan-300 font-mono">
                        Real-time audit log of all regional military email dispatches, active unit deployments, and completed ground tasks.
                      </p>
                    </div>

                    <div className="bg-emerald-950/80 border border-emerald-500/50 p-3 rounded font-mono text-[11px] text-emerald-300 flex items-center space-x-2">
                      <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                      <div>
                        <div className="font-bold uppercase text-white">PERMANENT RECORD STORAGE</div>
                        <div className="text-[10px] text-emerald-400/80">All dispatched emails & task execution logs are stored permanently in local storage.</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dispatched Logs Cards */}
                {allDeploymentsList.length === 0 ? (
                  <div className="bg-[#07111e] border border-cyan-500/20 rounded-lg p-12 text-center text-cyan-400/60 font-mono">
                    <svg className="w-16 h-16 mx-auto mb-4 text-cyan-500/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    <div className="text-base font-bold text-white uppercase tracking-wider mb-2">NO FORCES DEPLOYED YET</div>
                    <p className="text-xs max-w-md mx-auto text-gray-400">
                      Switch to the Surveillance Map, select a high threat sector (e.g., Northern Sector, Eastern Corridor), and click "Deploy Forces & Dispatch Mail" to initiate direct military deployments.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {allDeploymentsList.map((dep: ForceDeployment) => (
                      <div 
                        key={dep.id} 
                        className="bg-[#07111e] border-2 border-emerald-500/40 rounded-lg p-5 shadow-xl flex flex-col justify-between space-y-4 hover:border-emerald-400 transition-all"
                      >
                        <div>
                          {/* Top Badges */}
                          <div className="flex justify-between items-start mb-3 border-b border-cyan-500/20 pb-3">
                            <div>
                              <div className="text-xs font-mono font-bold text-emerald-400 tracking-wider uppercase flex items-center space-x-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                <span>{dep.threatName}</span>
                              </div>
                              <div className="text-[10px] text-gray-400 font-mono uppercase mt-0.5">{dep.region}</div>
                            </div>
                            <span className="bg-emerald-950 text-emerald-300 font-mono text-[9px] font-bold px-2 py-1 rounded border border-emerald-500/40">
                              {dep.dispatchCode}
                            </span>
                          </div>

                          {/* Recipient & Active Force info */}
                          <div className="space-y-2 text-xs font-mono">
                            <div className="bg-black/60 p-2.5 rounded border border-cyan-500/20">
                              <div className="text-[9px] text-cyan-400/70 font-bold uppercase mb-0.5">DISPATCHED MILITARY EMAIL RECIPIENT</div>
                              <div className="text-emerald-300 font-bold break-all">{dep.forceEmail}</div>
                              <div className="text-[10px] text-gray-300 mt-1">UNIT: {dep.activeForce}</div>
                            </div>

                            <div className="flex justify-between text-[10px] text-cyan-200/80 pt-1 border-b border-cyan-500/10 pb-1">
                              <span>COMMANDER:</span>
                              <span className="text-white font-bold">{dep.commander}</span>
                            </div>

                            <div className="flex justify-between text-[10px] text-cyan-200/80 border-b border-cyan-500/10 pb-1">
                              <span>STATION HQ:</span>
                              <span className="text-white">{dep.station}</span>
                            </div>

                            <div className="flex justify-between text-[10px] text-cyan-200/80 border-b border-cyan-500/10 pb-1">
                              <span>PRIORITY:</span>
                              <span className="text-red-400 font-bold">{dep.dispatchPriority}</span>
                            </div>

                            <div className="flex justify-between text-[10px] text-cyan-200/80 border-b border-cyan-500/10 pb-1">
                              <span>DISPATCHED AT:</span>
                              <span className="text-gray-300">{dep.dispatchedAt}</span>
                            </div>

                            {/* Executed Tasks List */}
                            <div className="pt-2">
                              <div className="text-[9px] text-cyan-400 font-bold uppercase mb-1">TASKS EXECUTED ON GROUND:</div>
                              <ul className="space-y-1 text-[10px] text-gray-300 bg-black/40 p-2 rounded border border-cyan-500/10">
                                {dep.tasksExecuted.map((task, idx) => (
                                  <li key={idx} className="flex items-start space-x-1.5 text-emerald-300">
                                    <span className="text-emerald-400 font-bold">✓</span>
                                    <span>{task}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>

                        {/* Bottom Action Button */}
                        <div className="pt-3 border-t border-cyan-500/20 flex items-center justify-between">
                          <div className="text-[9px] font-mono text-emerald-400 font-bold uppercase flex items-center space-x-1">
                            <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            <span>SITUATION CONTAINED</span>
                          </div>

                          <button
                            onClick={() => setViewMailModal(dep)}
                            className="px-3 py-1.5 bg-emerald-950 border border-emerald-500/60 hover:border-emerald-400 text-emerald-300 hover:text-white font-mono text-[10px] font-bold uppercase rounded tracking-wider transition-all flex items-center space-x-1 shadow-md"
                          >
                            <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            <span>VIEW SENT DISPATCH MAIL</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
             </div>
          </div>
        )}

        {/* Right Side Panel (Threat Analysis Sidebar) */}
        <div className="absolute bottom-0 md:top-0 right-0 left-0 md:left-auto w-full md:w-96 h-[52vh] md:h-full bg-[#0a1525]/95 border-t md:border-t-0 md:border-l border-cyan-500/20 p-4 md:p-6 flex flex-col z-40 backdrop-blur-xl shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between mb-3 border-b border-red-500/30 pb-3 shrink-0">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-red-500/10 rounded border border-red-500/50 animate-pulse">
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  </div>
                  <h2 className="text-sm md:text-lg font-bold text-white tracking-wider font-mono">THREAT ANALYSIS</h2>
                </div>

                <button 
                    onClick={onClose}
                    className="p-1.5 text-gray-400 hover:text-white hover:bg-red-900/30 border border-transparent hover:border-red-500/50 rounded transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            {/* List of Threat Locations */}
            <div className="space-y-3 shrink-0 mb-4">
                {threatLocations.map(threat => {
                  const isDeployed = !!deploymentsMap[threat.id];
                  const isSelected = selectedThreat.id === threat.id;

                  return (
                    <div 
                        key={threat.id}
                        onClick={() => handleThreatClick(threat)}
                        className={`p-3 rounded border cursor-pointer transition-all duration-300 ${
                          isSelected 
                            ? isDeployed
                              ? 'bg-emerald-950/30 border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                              : 'bg-red-900/20 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]' 
                            : 'bg-transparent border-cyan-500/10 hover:bg-cyan-900/10 hover:border-cyan-500/30'
                        }`}
                    >
                        <div className="flex justify-between items-start mb-1">
                            <h3 className={`font-mono text-xs font-bold tracking-wider uppercase ${isDeployed ? 'text-emerald-400' : threat.level > 60 ? 'text-red-400' : 'text-cyan-400'}`}>
                              {threat.name}
                            </h3>

                            {isDeployed ? (
                              <span className="text-[8px] font-mono text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-500/50 font-bold uppercase flex items-center space-x-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                <span>FORCES DEPLOYED</span>
                              </span>
                            ) : threat.level > 60 ? (
                              <div className="animate-pulse w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_red]"></div>
                            ) : null}
                        </div>

                        <div className="text-gray-400 text-[9px] uppercase tracking-widest mb-2 font-mono">{threat.region}</div>
                        
                        <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${isDeployed ? 'bg-emerald-500' : threat.level > 60 ? 'bg-red-500' : 'bg-cyan-500'} transition-all duration-1000 ease-out`} 
                              style={{ width: `${isDeployed ? 12 : threat.level}%` }}
                            ></div>
                        </div>

                        <div className="flex justify-between mt-1 text-[9px] font-mono text-gray-500">
                            <span>{isDeployed ? 'STATUS' : 'PROBABILITY'}</span>
                            <span className={`font-bold ${isDeployed ? 'text-emerald-400' : threat.level > 60 ? 'text-red-400' : 'text-cyan-400'}`}>
                              {isDeployed ? '12% (CONTAINED)' : `${threat.level}%`}
                            </span>
                        </div>
                    </div>
                  );
                })}
            </div>

            {/* Selected Threat Detailed Information & Deploy Force Section */}
            {selectedThreat && (
              <div className="border-t border-cyan-500/30 pt-3 flex-grow flex flex-col justify-between space-y-3">
                <div className="space-y-2.5 font-mono text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-cyan-400 font-bold uppercase text-[10px]">SELECTED REGION DETAILED SPEC</span>
                    <span className="text-[9px] text-cyan-500/60">{selectedThreat.lat.toFixed(4)}, {selectedThreat.lng.toFixed(4)}</span>
                  </div>

                  <div className="bg-black/60 p-2.5 rounded border border-cyan-500/20 space-y-1.5 text-[10px]">
                    <div className="flex justify-between border-b border-cyan-500/10 pb-1">
                      <span className="text-cyan-500/60">THREAT TYPE:</span>
                      <span className="text-red-400 font-bold">{selectedThreat.type}</span>
                    </div>

                    <div className="flex justify-between border-b border-cyan-500/10 pb-1">
                      <span className="text-cyan-500/60">ACTIVE REGIONAL FORCE:</span>
                      <span className="text-white font-bold">{selectedThreat.activeForce}</span>
                    </div>

                    <div className="flex justify-between border-b border-cyan-500/10 pb-1">
                      <span className="text-cyan-500/60">FORCE RECIPIENT MAIL:</span>
                      <span className="text-emerald-400 font-bold break-all">{selectedThreat.forceEmail}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-cyan-500/60">COMMANDER:</span>
                      <span className="text-cyan-300 font-bold">{selectedThreat.commander}</span>
                    </div>
                  </div>

                  {/* Ground Situation Report if Deployed */}
                  {deploymentsMap[selectedThreat.id] ? (
                    <div className="bg-emerald-950/40 border border-emerald-500/40 rounded p-3 space-y-2">
                      <div className="flex justify-between items-center border-b border-emerald-500/30 pb-1.5">
                        <span className="text-emerald-300 font-bold text-[10px] uppercase flex items-center space-x-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                          <span>ACTIVE DEPLOYMENT SITUATION</span>
                        </span>
                        <span className="text-[9px] text-emerald-400 font-mono">
                          {deploymentsMap[selectedThreat.id].dispatchCode}
                        </span>
                      </div>

                      <div className="text-[10px] text-gray-300 leading-relaxed font-mono">
                        {deploymentsMap[selectedThreat.id].situationStatus}
                      </div>

                      <div className="text-[9px] text-cyan-300/80 font-mono">
                        Directives sent to <span className="text-emerald-300 font-bold">{selectedThreat.forceEmail}</span> on {deploymentsMap[selectedThreat.id].dispatchedAt}.
                      </div>

                      <div className="flex space-x-2 pt-1">
                        <button
                          onClick={() => setViewMailModal(deploymentsMap[selectedThreat.id])}
                          className="flex-grow py-1.5 bg-emerald-900/60 border border-emerald-500/60 hover:bg-emerald-800 text-emerald-200 text-[10px] font-mono font-bold uppercase rounded transition-colors flex items-center justify-center space-x-1"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                          <span>VIEW DISPATCHED EMAIL</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* DEPLOY FORCES BUTTON (When threat is high & forces not yet deployed) */
                    <div className="pt-2">
                      <button
                        onClick={() => openDeployModal(selectedThreat)}
                        className="w-full py-3 bg-gradient-to-r from-red-900 via-red-700 to-red-950 hover:from-red-800 hover:to-red-900 text-white font-mono text-xs font-bold uppercase tracking-widest rounded border-2 border-red-500/80 hover:border-red-400 shadow-[0_0_25px_rgba(239,68,68,0.5)] transition-all flex items-center justify-center space-x-2 animate-pulse"
                      >
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                        <span>DEPLOY FORCES & DISPATCH MAIL</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Bottom Action Bar */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-cyan-500/20">
                    <button 
                        onClick={() => setShowStreetView(true)}
                        className="py-2.5 border border-cyan-500/40 bg-cyan-900/20 hover:bg-cyan-900/40 text-cyan-300 text-[10px] font-mono tracking-widest uppercase transition-all rounded flex items-center justify-center space-x-1"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        <span>360° STREET VIEW</span>
                    </button>

                    <button 
                        onClick={onClose}
                        className="py-2.5 border border-red-500/40 bg-red-900/20 hover:bg-red-900/40 text-red-300 text-[10px] font-mono tracking-widest uppercase transition-all rounded flex items-center justify-center space-x-1"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        <span>CLOSE PANEL</span>
                    </button>
                </div>
              </div>
            )}
        </div>

        {/* MILITARY DISPATCH EMAIL & FORCE DEPLOYMENT MODAL */}
        {isDeployModalOpen && threatToDeploy && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-[#07111e] border-2 border-cyan-500/60 rounded-lg max-w-2xl w-full p-6 shadow-[0_0_50px_rgba(6,182,212,0.4)] relative space-y-4 font-mono">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-cyan-500/40 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-ping"></div>
                  <h2 className="text-base font-bold text-cyan-300 uppercase tracking-wider">
                    DIRECT MILITARY DISPATCH & FORCE DEPLOYMENT
                  </h2>
                </div>
                <button 
                  onClick={() => setIsDeployModalOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* Target & Recipient Details Box */}
              <div className="bg-black/70 p-3.5 rounded border border-cyan-500/30 space-y-2 text-xs">
                <div className="flex justify-between border-b border-cyan-500/20 pb-1.5">
                  <span className="text-cyan-500/70">TARGET SECTOR / REGION:</span>
                  <span className="text-white font-bold">{threatToDeploy.name} ({threatToDeploy.region})</span>
                </div>

                <div className="flex justify-between border-b border-cyan-500/20 pb-1.5">
                  <span className="text-cyan-500/70">ACTIVE REGIONAL FORCE:</span>
                  <span className="text-cyan-300 font-bold">{threatToDeploy.activeForce}</span>
                </div>

                <div className="flex justify-between border-b border-cyan-500/20 pb-1.5">
                  <span className="text-cyan-500/70">DIRECT MAIL GATEWAY (RECIPIENT):</span>
                  <span className="text-emerald-400 font-bold underline">{threatToDeploy.forceEmail}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-cyan-500/70">STATION & COMMANDER:</span>
                  <span className="text-gray-300">{threatToDeploy.commander} // {threatToDeploy.station}</span>
                </div>
              </div>

              {/* Form Inputs */}
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-[10px] text-cyan-400 font-bold block mb-1 uppercase">DISPATCH PRIORITY LEVEL</label>
                  <select
                    value={priorityInput}
                    onChange={e => setPriorityInput(e.target.value)}
                    className="w-full bg-black/80 border border-cyan-500/40 rounded px-3 py-2 text-red-400 font-bold focus:outline-none focus:border-cyan-400"
                  >
                    <option value="FLASH CRITICAL (PRIORITY 1)">FLASH CRITICAL (PRIORITY 1) - IMMEDIATE COMBAT ENGAGEMENT</option>
                    <option value="ALPHA URGENT (PRIORITY 2)">ALPHA URGENT (PRIORITY 2) - RAPID RECON & COUNTER MEASURES</option>
                    <option value="HIGH TACTICAL (PRIORITY 3)">HIGH TACTICAL (PRIORITY 3) - STANDARD DEFENSE DEPLOYMENT</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-cyan-400 font-bold block mb-1 uppercase">TACTICAL DIRECTIVES (MAIL BODY)</label>
                  <textarea
                    rows={4}
                    value={directivesInput}
                    onChange={e => setDirectivesInput(e.target.value)}
                    className="w-full bg-black/80 border border-cyan-500/40 rounded p-3 text-cyan-100 placeholder-cyan-800 font-mono text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-cyan-400 font-bold block mb-1 uppercase">SUPREME COMMANDER SPECIAL NOTES</label>
                  <input
                    type="text"
                    value={specialNotes}
                    onChange={e => setSpecialNotes(e.target.value)}
                    placeholder="e.g. Clearance granted by Supreme Head. Maintain continuous video telemetry."
                    className="w-full bg-black/80 border border-cyan-500/40 rounded px-3 py-2 text-cyan-100 font-mono text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Authorization Disclaimer */}
              <div className="bg-cyan-950/40 p-2.5 rounded border border-cyan-500/30 text-[10px] text-cyan-300/80 flex items-center justify-between">
                <span>AUTHORIZATION: SUPREME HEAD CLEARANCE LEVEL 9</span>
                <span className="text-emerald-400 font-bold">ENCRYPTED MAIL PERSISTENT LOG</span>
              </div>

              {/* Modal Buttons */}
              <div className="flex justify-end space-x-3 pt-2 border-t border-cyan-500/30">
                <button
                  onClick={() => setIsDeployModalOpen(false)}
                  className="px-4 py-2 bg-gray-900 border border-gray-700 text-gray-300 hover:text-white rounded text-xs font-bold uppercase"
                >
                  CANCEL
                </button>

                <button
                  onClick={confirmDispatchAndDeploy}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-700 to-emerald-900 hover:from-emerald-600 hover:to-emerald-800 text-emerald-100 border-2 border-emerald-400 rounded text-xs font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.5)] flex items-center space-x-2"
                >
                  <svg className="w-4 h-4 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  <span>CONFIRM & DISPATCH MAIL TO FORCE</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW SENT DISPATCH EMAIL MODAL */}
        {viewMailModal && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300 font-mono">
            <div className="bg-[#07111e] border-2 border-emerald-500/70 rounded-lg max-w-2xl w-full p-6 shadow-[0_0_50px_rgba(16,185,129,0.4)] relative space-y-4">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-emerald-500/40 pb-3">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
                  <h3 className="text-sm font-bold text-emerald-300 uppercase tracking-wider">
                    ENCRYPTED MILITARY DISPATCH EMAIL RECORD
                  </h3>
                </div>
                <button 
                  onClick={() => setViewMailModal(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* Mail Meta Box */}
              <div className="bg-black/80 p-4 rounded border border-emerald-500/30 space-y-2 text-xs">
                <div className="flex justify-between border-b border-cyan-500/10 pb-1.5">
                  <span className="text-gray-400">FROM:</span>
                  <span className="text-cyan-300 font-bold">{viewMailModal.dispatchMailHeader.from}</span>
                </div>

                <div className="flex justify-between border-b border-cyan-500/10 pb-1.5">
                  <span className="text-gray-400">TO (REGIONAL FORCE):</span>
                  <span className="text-emerald-400 font-bold underline">{viewMailModal.dispatchMailHeader.to}</span>
                </div>

                <div className="flex justify-between border-b border-cyan-500/10 pb-1.5">
                  <span className="text-gray-400">SUBJECT:</span>
                  <span className="text-white font-bold">{viewMailModal.dispatchMailHeader.subject}</span>
                </div>

                <div className="flex justify-between border-b border-cyan-500/10 pb-1.5">
                  <span className="text-gray-400">DISPATCH REF CODE:</span>
                  <span className="text-emerald-300 font-bold">{viewMailModal.dispatchCode}</span>
                </div>

                <div className="flex justify-between border-b border-cyan-500/10 pb-1.5">
                  <span className="text-gray-400">SENT TIMESTAMP:</span>
                  <span className="text-gray-300">{viewMailModal.dispatchedAt}</span>
                </div>

                <div className="flex justify-between border-b border-cyan-500/10 pb-1.5">
                  <span className="text-gray-400">SECURITY CLASSIFICATION:</span>
                  <span className="text-red-400 font-bold">{viewMailModal.dispatchMailHeader.securityClassification}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">CRYPTOGRAPHIC SIGNATURE:</span>
                  <span className="text-emerald-400 font-mono text-[10px]">{viewMailModal.dispatchMailHeader.hashSignature}</span>
                </div>
              </div>

              {/* Mail Body */}
              <div className="bg-black/60 p-4 rounded border border-cyan-500/20 text-xs text-gray-200 whitespace-pre-wrap font-mono leading-relaxed">
                {viewMailModal.tacticalDirectives}

                {viewMailModal.specialInstructions && (
                  <div className="mt-4 pt-3 border-t border-cyan-500/20 text-cyan-300">
                    <span className="text-cyan-400 font-bold block mb-1">COMMANDER SPECIAL INSTRUCTIONS:</span>
                    {viewMailModal.specialInstructions}
                  </div>
                )}
              </div>

              {/* Bottom Notice */}
              <div className="flex items-center justify-between pt-2 border-t border-emerald-500/30">
                <span className="text-[10px] text-emerald-400 font-bold">
                  ✓ DELIVERED TO {viewMailModal.forceEmail} (SAVED IN SYSTEM LOCAL STORAGE)
                </span>
                <button
                  onClick={() => setViewMailModal(null)}
                  className="px-4 py-1.5 bg-emerald-900 border border-emerald-500/60 text-emerald-200 hover:text-white rounded text-xs font-bold uppercase"
                >
                  CLOSE RECORD
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

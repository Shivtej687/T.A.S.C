import React, { useState, useEffect, useRef } from 'react';

declare global {
  interface Window {
    L: any;
  }
}

interface CyberWarfareProps {
  onClose: () => void;
}

const FIREWALL_PASSWORDS = {
    1: '9321556103',
    2: '9702894166',
    3: '9321228553'
};

const HACKER_LOCATION = { lat: 55.7558, lng: 37.6173, location: "Moscow, Russia" }; 

// --- Strategic Cyber Nodes (Real Locations) ---
const CYBER_NODES = [
    { id: 'US-NSA', lat: 39.1085, lng: -76.7725, city: "Fort Meade, USA", label: "NSA HQ", type: "INTEL" },
    { id: 'CN-PLA', lat: 39.9042, lng: 116.4074, city: "Beijing, China", label: "Unit 61398", type: "THREAT" },
    { id: 'RU-FSB', lat: 55.7558, lng: 37.6173, city: "Moscow, Russia", label: "FSB Cyber Wing", type: "THREAT" },
    { id: 'IL-8200', lat: 32.1093, lng: 34.8555, city: "Tel Aviv, Israel", label: "Unit 8200", type: "INTEL" },
    { id: 'UK-GCHQ', lat: 51.8994, lng: -2.1246, city: "Cheltenham, UK", label: "GCHQ", type: "INTEL" },
    { id: 'KP-121', lat: 39.0392, lng: 125.7625, city: "Pyongyang, NK", label: "Bureau 121", type: "THREAT" },
    { id: 'IN-NCIIPC', lat: 28.6139, lng: 77.2090, city: "New Delhi, India", label: "NCIIPC Node", type: "DEFENSE" },
    { id: 'IR-ICA', lat: 35.6892, lng: 51.3890, city: "Tehran, Iran", label: "Cyber Army", type: "THREAT" },
    { id: 'BR-CDC', lat: -15.7975, lng: -47.8919, city: "Brasilia, Brazil", label: "Cyber Defense Cmd", type: "DEFENSE" },
    { id: 'DE-BSI', lat: 50.7374, lng: 7.0982, city: "Bonn, Germany", label: "BSI HQ", type: "DEFENSE" },
    { id: 'JP-MOD', lat: 35.6938, lng: 139.7034, city: "Tokyo, Japan", label: "Cyber Defense Grp", type: "DEFENSE" },
    { id: 'AU-ASD', lat: -35.2809, lng: 149.1300, city: "Canberra, Aus", label: "ASD Signals", type: "INTEL" },
    { id: 'US-SV', lat: 37.3875, lng: -122.0575, city: "Silicon Valley, USA", label: "Tech Infrastructure", type: "TARGET" },
    { id: 'IN-BLR', lat: 12.9716, lng: 77.5946, city: "Bangalore, India", label: "Tech Hub", type: "TARGET" }
];

// --- IDS Types & Mock Data ---
type DetectionMethod = 'SIGNATURE' | 'ANOMALY' | 'HYBRID';
type TrafficType = 'INCOMING' | 'OUTGOING' | 'INTERNAL';
type PacketStatus = 'NORMAL' | 'SUSPICIOUS' | 'MALICIOUS';

interface Packet {
    id: string;
    timestamp: string;
    sourceIp: string;
    destIp: string;
    protocol: string;
    port: number;
    type: TrafficType;
    size: string;
    payload: string;
    status: PacketStatus;
    alertType?: string;
}

const IDS_ALERTS_DB = [
    { type: 'Brute Force', pattern: 'LOGIN_FAIL_SEQ', severity: 'HIGH' },
    { type: 'Malware Comm', pattern: 'C2_SERVER_HEARTBEAT', severity: 'CRITICAL' },
    { type: 'Port Scan', pattern: 'SYN_SCAN_SEQ', severity: 'MEDIUM' },
    { type: 'DDoS', pattern: 'VOLUMETRIC_SPIKE', severity: 'CRITICAL' },
    { type: 'Data Exfil', pattern: 'LARGE_OUTBOUND_PAYLOAD', severity: 'HIGH' }
];

// --- Malware Mock Data ---
const MALWARE_DB = [
    { name: 'Trojan.Win32.Generic', type: 'Trojan', risk: 'High', path: '/sys/kernel/win32_driver.sys' },
    { name: 'Ransom.WannaCry', type: 'Ransomware', risk: 'Critical', path: '/usr/bin/local/crypt_service' },
    { name: 'Spyware.Keylogger', type: 'Spyware', risk: 'Medium', path: '/temp/cache/log_dump.dat' },
    { name: 'Rootkit.ZeroAccess', type: 'Rootkit', risk: 'Critical', path: '/boot/efi/secure_boot_sig' },
    { name: 'Adware.PopUp', type: 'Adware', risk: 'Low', path: '/browser/extensions/toolbar_v2' }
];

const SYSTEM_DIRECTORIES = [
    '/sys/kernel/', '/usr/bin/', '/var/log/', '/etc/config/', '/home/user/docs/', 
    '/boot/efi/', '/opt/libs/', '/tmp/cache/', '/dev/mapper/', '/proc/net/'
];

// --- Dark Web Mock Data ---
const DARK_WEB_KEYWORDS = [
    { category: 'TERROR', text: 'blueprint_govt_building.pdf', risk: 'CRITICAL' },
    { category: 'WEAPONS', text: 'WTS: AK-47 Shipment / Route 9', risk: 'HIGH' },
    { category: 'DRUGS', text: 'SilkRoad Reborn: New Stock', risk: 'MEDIUM' },
    { category: 'FAKE_ID', text: 'Passport Forgery Service [EU/US/IN]', risk: 'HIGH' },
    { category: 'LEAK', text: 'Ministry_Database_Dump_v2.sql', risk: 'CRITICAL' },
    { category: 'FINANCE', text: 'CC Dumps Visa/Mastercard (10k)', risk: 'HIGH' },
    { category: 'CHAT', text: 'Encrypted: Meet at node 44', risk: 'LOW' },
];

export const CyberWarfare: React.FC<CyberWarfareProps> = ({ onClose }) => {
  // Navigation State
  const [activeModule, setActiveModule] = useState<string | null>(null);
  
  // Firewall State
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [unlockedLevels, setUnlockedLevels] = useState<number[]>([]);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [terminalCode, setTerminalCode] = useState('');
  const [aiActive, setAiActive] = useState(false);
  const [hackerFound, setHackerFound] = useState(false);
  const [aiChatLog, setAiChatLog] = useState<string[]>([
      "> SYSTEM: AI SENTINEL ONLINE.",
      "> SYSTEM: MONITORING NETWORK TRAFFIC...",
      "> ALERT: FIREWALL INTEGRITY AT 92%.",
      "> AI: AWAITING MANUAL OVERRIDE ON SECURITY LAYERS."
  ]);

  // IDS State
  const [detectionMethod, setDetectionMethod] = useState<DetectionMethod>('HYBRID');
  const [packetStream, setPacketStream] = useState<Packet[]>([]);
  const [idsAlerts, setIdsAlerts] = useState<Packet[]>([]);
  const [idsStats, setIdsStats] = useState({ normal: 0, suspicious: 0, malicious: 0 });

  // Malware Scanner State
  const [malwareScanActive, setMalwareScanActive] = useState(false);
  const [malwareProgress, setMalwareProgress] = useState(0);
  const [scannedFilesCount, setScannedFilesCount] = useState(0);
  const [currentFileScanned, setCurrentFileScanned] = useState('System Idle');
  const [detectedThreats, setDetectedThreats] = useState<any[]>([]);
  const [timeToNextScan, setTimeToNextScan] = useState(600); // 10 minutes in seconds
  const [lastScanTime, setLastScanTime] = useState<string>('Pending...');

  // Dark Web State
  const [darkWebLogs, setDarkWebLogs] = useState<any[]>([]);
  const [darkWebAlerts, setDarkWebAlerts] = useState<any[]>([]);
  const [torConnection, setTorConnection] = useState(false);
  const [monitorStats, setMonitorStats] = useState({ leakedCreds: 0, terrorMentions: 0, fakeIds: 0 });
  const [leakGraphData, setLeakGraphData] = useState<number[]>(Array(20).fill(5));

  // Map State
  const [mapAttackLog, setMapAttackLog] = useState<string[]>([]);
  
  // Map References
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const hackerMarkerRef = useRef<any>(null);
  const nodeMarkersRef = useRef<any[]>([]);
  const idsStreamRef = useRef<HTMLDivElement>(null);
  const darkWebLogRef = useRef<HTMLDivElement>(null);

  // --- Map Initialization ---
  useEffect(() => {
    if (mapContainerRef.current && !mapInstanceRef.current && window.L) {
      const map = window.L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
        center: [20.5937, 78.9629],
        zoom: 3,
        dragging: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        boxZoom: false
      });

      // Using Google Satellite Hybrid tiles but treating them with CSS filters later for 'dark mode' effect
      // If user requested "Google Maps", this is the source.
      window.L.tileLayer('http://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
      }).addTo(map);

      mapInstanceRef.current = map;
    }
  }, []);

  // --- Attack Vector Animation (Background & Map Module) ---
  useEffect(() => {
      if (!mapInstanceRef.current || !window.L || hackerFound) return;

      const interval = setInterval(() => {
          // If in Map Module, show attacks between specific nodes
          if (activeModule === 'map') {
              const source = CYBER_NODES[Math.floor(Math.random() * CYBER_NODES.length)];
              let target = CYBER_NODES[Math.floor(Math.random() * CYBER_NODES.length)];
              while (target.id === source.id) {
                  target = CYBER_NODES[Math.floor(Math.random() * CYBER_NODES.length)];
              }

              // Draw Arc
              const latlngs = [
                  [source.lat, source.lng],
                  [source.lat + (target.lat - source.lat) / 2 - 10, source.lng + (target.lng - source.lng) / 2], // Simple curve
                  [target.lat, target.lng]
              ];

              const color = source.type === 'THREAT' ? '#ef4444' : '#3b82f6';
              const polyline = window.L.polyline(latlngs, {
                  color: color,
                  weight: 2,
                  opacity: 0.8,
                  dashArray: '5, 10',
              }).addTo(mapInstanceRef.current);

              // Add Log
              setMapAttackLog(prev => [`${source.id} >> ${target.id} [${Math.floor(Math.random() * 900) + 100} Gbps]`, ...prev].slice(0, 8));

              setTimeout(() => mapInstanceRef.current?.removeLayer(polyline), 1500);

          } else {
              // Background Random Attacks (Abstract)
              const startLat = (Math.random() * 160) - 80;
              const startLng = (Math.random() * 360) - 180;
              const endLat = 20.5937;
              const endLng = 78.9629;

              const latlngs = [
                  [startLat, startLng],
                  [startLat + (endLat - startLat) / 2 + (Math.random() * 20 - 10), startLng + (endLng - startLng) / 2 + (Math.random() * 20 - 10)],
                  [endLat, endLng]
              ];

              const color = activeModule === 'ids' ? '#3b82f6' : activeModule === 'malware' ? '#a855f7' : activeModule === 'darkweb' ? '#f59e0b' : '#ef4444';

              const polyline = window.L.polyline(latlngs, {
                  color: color,
                  weight: 1,
                  opacity: 0.5,
                  dashArray: '5, 15',
              }).addTo(mapInstanceRef.current);

              setTimeout(() => mapInstanceRef.current?.removeLayer(polyline), 2000);
          }
      }, activeModule === 'map' ? 300 : 800); // Faster in map mode

      return () => clearInterval(interval);
  }, [hackerFound, activeModule]);

  // --- Show/Hide Node Markers for Map Module ---
  useEffect(() => {
      if (!mapInstanceRef.current || !window.L) return;

      // Clear existing markers
      nodeMarkersRef.current.forEach(m => mapInstanceRef.current.removeLayer(m));
      nodeMarkersRef.current = [];

      if (activeModule === 'map') {
          // Add markers for all nodes
          CYBER_NODES.forEach(node => {
              const color = node.type === 'THREAT' ? '#ef4444' : node.type === 'TARGET' ? '#fbbf24' : '#10b981';
              
              const iconHtml = `
                  <div class="relative flex items-center justify-center w-0 h-0">
                      <div class="absolute w-3 h-3 rounded-full bg-[${color}] shadow-[0_0_10px_${color}]"></div>
                      <div class="absolute w-8 h-8 rounded-full border border-[${color}] opacity-50 animate-ping"></div>
                      <div class="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-mono font-bold text-white bg-black/70 px-2 rounded whitespace-nowrap border border-[${color}]/30">
                          ${node.id}
                      </div>
                  </div>
              `;

              const icon = window.L.divIcon({
                  className: 'cyber-node-marker',
                  html: iconHtml,
                  iconSize: [0, 0]
              });

              const marker = window.L.marker([node.lat, node.lng], { icon })
                  .addTo(mapInstanceRef.current);
              
              nodeMarkersRef.current.push(marker);
          });
      }

  }, [activeModule]);

  // --- IDS Simulation Logic ---
  useEffect(() => {
      if (activeModule !== 'ids') return;

      const generateIP = () => `${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`;
      
      const interval = setInterval(() => {
          const rand = Math.random();
          let type: TrafficType = 'INTERNAL';
          if (rand > 0.6) type = 'INCOMING';
          else if (rand > 0.3) type = 'OUTGOING';

          const isAttack = Math.random() > 0.85;
          let status: PacketStatus = 'NORMAL';
          let alertType = '';
          let payload = 'ACK_SYN_FIN sequence initialized';

          // Attack Simulation
          if (isAttack) {
              const attackType = IDS_ALERTS_DB[Math.floor(Math.random() * IDS_ALERTS_DB.length)];
              const caughtBySignature = detectionMethod === 'SIGNATURE' || detectionMethod === 'HYBRID';
              const caughtByAnomaly = detectionMethod === 'ANOMALY' || detectionMethod === 'HYBRID';

              if (attackType.type === 'Brute Force' || attackType.type === 'Malware Comm') {
                  if (caughtBySignature) {
                      status = 'MALICIOUS';
                      alertType = attackType.type;
                      payload = `AUTH_FAIL_COUNT > 50 | SRC: ${generateIP()}`;
                  }
              } else if (attackType.type === 'DDoS' || attackType.type === 'Data Exfil') {
                  if (caughtByAnomaly) {
                      status = 'MALICIOUS';
                      alertType = attackType.type;
                      payload = attackType.type === 'Data Exfil' ? 'PAYLOAD_SIZE > 500MB [OUTBOUND]' : 'PACKET_RATE > 10000/s';
                  }
              } else {
                  status = 'SUSPICIOUS';
                  alertType = 'Unknown Protocol';
                  payload = 'NON_STANDARD_PORT_USAGE';
              }
          }

          const packet: Packet = {
              id: Math.floor(Math.random() * 100000).toString(16).toUpperCase(),
              timestamp: new Date().toLocaleTimeString(),
              sourceIp: generateIP(),
              destIp: generateIP(),
              protocol: Math.random() > 0.5 ? 'TCP' : 'UDP',
              port: Math.floor(Math.random() * 65535),
              type,
              size: Math.floor(Math.random() * 1500) + ' bytes',
              payload,
              status,
              alertType
          };

          setPacketStream(prev => [packet, ...prev].slice(0, 30));
          if (status !== 'NORMAL') {
              setIdsAlerts(prev => [packet, ...prev].slice(0, 10));
          }
          
          setIdsStats(prev => ({
              normal: prev.normal + (status === 'NORMAL' ? 1 : 0),
              suspicious: prev.suspicious + (status === 'SUSPICIOUS' ? 1 : 0),
              malicious: prev.malicious + (status === 'MALICIOUS' ? 1 : 0)
          }));

      }, 800);

      return () => clearInterval(interval);
  }, [activeModule, detectionMethod]);

  // --- Malware Scanner Logic (10 Min Timer & Scan Simulation) ---
  
  // Timer Effect
  useEffect(() => {
      const timer = setInterval(() => {
          setTimeToNextScan(prev => {
              if (prev <= 1) {
                  return 0; // Trigger useEffect dependency
              }
              return prev - 1;
          });
      }, 1000);
      return () => clearInterval(timer);
  }, []);

  // Trigger Scan Effect
  useEffect(() => {
      if (timeToNextScan === 0 && !malwareScanActive) {
          startMalwareScan();
      }
  }, [timeToNextScan, malwareScanActive]);

  const startMalwareScan = () => {
      if (malwareScanActive) return;
      setMalwareScanActive(true);
      setMalwareProgress(0);
      setScannedFilesCount(0);
      // Reset timer manually if this was a manual trigger
      setTimeToNextScan(600); 
      
      const scanDuration = 5000; // 5 seconds scan simulation
      const intervalTime = 50;
      const totalSteps = scanDuration / intervalTime;
      let currentStep = 0;

      const scanInterval = setInterval(() => {
          currentStep++;
          const progress = (currentStep / totalSteps) * 100;
          setMalwareProgress(progress);
          
          // Simulate scanning files
          setScannedFilesCount(prev => prev + Math.floor(Math.random() * 50) + 10);
          const randomDir = SYSTEM_DIRECTORIES[Math.floor(Math.random() * SYSTEM_DIRECTORIES.length)];
          const randomFile = `file_${Math.floor(Math.random() * 9999)}.dat`;
          setCurrentFileScanned(`${randomDir}${randomFile}`);

          // Random Threat Detection (Low chance)
          if (Math.random() > 0.96 && detectedThreats.length < 5) {
              const threat = MALWARE_DB[Math.floor(Math.random() * MALWARE_DB.length)];
              setDetectedThreats(prev => {
                  if (prev.find(t => t.name === threat.name)) return prev;
                  return [...prev, { ...threat, id: Date.now(), timestamp: new Date().toLocaleTimeString() }];
              });
          }

          if (currentStep >= totalSteps) {
              clearInterval(scanInterval);
              setMalwareScanActive(false);
              setLastScanTime(new Date().toLocaleTimeString());
              setCurrentFileScanned('Scan Complete. System Analysis Finished.');
          }
      }, intervalTime);
  };

  // --- Dark Web Logic ---
  useEffect(() => {
      if (activeModule !== 'darkweb') {
          setTorConnection(false);
          return;
      }

      setTorConnection(true);

      const interval = setInterval(() => {
          const rand = Math.random();
          const item = DARK_WEB_KEYWORDS[Math.floor(Math.random() * DARK_WEB_KEYWORDS.length)];
          const user = `user_${Math.floor(Math.random() * 9999)}`;
          const onion = `${Math.random().toString(36).substring(7)}.onion`;
          
          const logEntry = {
              id: Date.now(),
              timestamp: new Date().toLocaleTimeString(),
              source: onion,
              user,
              content: item.text,
              category: item.category,
              risk: item.risk
          };

          setDarkWebLogs(prev => [logEntry, ...prev].slice(0, 50));

          // Update Leak Graph Data
          setLeakGraphData(prev => {
              const newData = [...prev.slice(1), Math.floor(Math.random() * 30) + 5];
              return newData;
          });

          if (rand > 0.7) {
              // Critical find
              setDarkWebAlerts(prev => [logEntry, ...prev].slice(0, 10));
              
              setMonitorStats(prev => ({
                  leakedCreds: prev.leakedCreds + (item.category === 'FINANCE' || item.category === 'LEAK' ? Math.floor(Math.random() * 50) : 0),
                  terrorMentions: prev.terrorMentions + (item.category === 'TERROR' || item.category === 'WEAPONS' ? 1 : 0),
                  fakeIds: prev.fakeIds + (item.category === 'FAKE_ID' ? 1 : 0)
              }));
          }

      }, 1200);

      return () => clearInterval(interval);
  }, [activeModule]);


  const handlePurgeThreat = (id: number) => {
      setDetectedThreats(prev => prev.filter(t => t.id !== id));
  };

  // --- Handlers ---

  const handleModuleSelect = (id: string) => {
      setActiveModule(id);
      // Reset specific states
      setSelectedLevel(null);
      setShowTerminal(false);
      setHackerFound(false);
      setAiActive(false);
      setPasswordInput('');
      setPacketStream([]);
      setIdsAlerts([]);
      
      // Reset Map View
      if(mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([20.5937, 78.9629], 3);
          if(hackerMarkerRef.current) {
              mapInstanceRef.current.removeLayer(hackerMarkerRef.current);
              hackerMarkerRef.current = null;
          }
      }
  };

  const handleBack = () => {
      if (showTerminal) {
          setShowTerminal(false);
          setAiActive(false);
          setHackerFound(false);
      } else if (selectedLevel !== null) {
          setSelectedLevel(null);
          setPasswordInput('');
      } else if (activeModule) {
          setActiveModule(null);
      } else {
          onClose(); // Close app if at root
      }
  };

  const handleLevelClick = (level: number) => {
      setSelectedLevel(level);
      setPasswordInput('');
      setPasswordError(false);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const correctPass = FIREWALL_PASSWORDS[selectedLevel as 1 | 2 | 3];
      
      if (passwordInput === correctPass) {
          if (!unlockedLevels.includes(selectedLevel!)) {
              setUnlockedLevels([...unlockedLevels, selectedLevel!]);
          }
          setShowTerminal(true);
      } else {
          setPasswordError(true);
          setTimeout(() => setPasswordError(false), 1000);
      }
  };

  const activateAI = () => {
      setAiActive(true);
      setTerminalCode("INITIALIZING AI SENTINEL...\nSCANNING NETWORK TOPOLOGY...\nTRACE ROUTE INITIATED...\n\n> BYPASSING PROXY CHAIN 1\n> BYPASSING PROXY CHAIN 2\n> DECRYPTING PACKET HEADER...\n\nTARGET LOCK ACQUIRED.");
      
      setTimeout(() => {
          setHackerFound(true);
          setShowTerminal(false); // Hide terminal to show map
          if (mapInstanceRef.current && window.L) {
              mapInstanceRef.current.flyTo([HACKER_LOCATION.lat, HACKER_LOCATION.lng], 10, { duration: 2 });
              
              const icon = window.L.divIcon({
                  className: 'hacker-marker',
                  html: `<div class="w-4 h-4 bg-red-600 rounded-full animate-ping"></div><div class="absolute inset-0 w-4 h-4 bg-red-600 rounded-full border-2 border-white"></div>`,
                  iconSize: [16, 16]
              });
              
              hackerMarkerRef.current = window.L.marker([HACKER_LOCATION.lat, HACKER_LOCATION.lng], { icon })
                  .addTo(mapInstanceRef.current)
                  .bindPopup(`<div class="text-black font-bold">SOURCE DETECTED<br/>${HACKER_LOCATION.location}</div>`)
                  .openPopup();
          }
      }, 3000);
  };

  const menuItems = [
      { id: 'firewall', label: 'Firewall Breach Alerts', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /> },
      { id: 'ids', label: 'Network Intrusion Detection', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /> },
      { id: 'malware', label: 'Malware Scanner', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /> },
      { id: 'darkweb', label: 'Dark Web Monitoring', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /> },
      { id: 'map', label: 'Real-time Cyber Attack Map', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#020408] flex flex-col font-mono text-green-500 animate-in fade-in duration-300">
        
        {/* Header */}
        <div className="h-14 border-b border-green-900/50 flex justify-between items-center px-6 bg-[#050a14] z-20 shrink-0">
            <div className="flex items-center space-x-3">
                <div className="relative">
                    <svg className="w-6 h-6 text-green-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                </div>
                <div>
                    <h1 className="text-lg font-bold tracking-widest uppercase text-green-400">
                        {activeModule ? menuItems.find(m => m.id === activeModule)?.label : 'Cyber Warfare Command'}
                    </h1>
                </div>
            </div>
            
            <div className="flex items-center space-x-6">
                {malwareScanActive && activeModule !== 'malware' && (
                    <div className="flex items-center space-x-2 animate-pulse">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">Background Scan Active</span>
                    </div>
                )}
                <button onClick={handleBack} className="hover:text-white transition-colors border border-green-900/50 px-4 py-1 rounded hover:bg-green-900/20 text-xs tracking-wider">
                    {activeModule ? 'BACK' : 'TERMINATE SESSION'}
                </button>
            </div>
        </div>

        <div className="flex flex-grow overflow-hidden relative">
            
            {/* --- LEFT MENU SIDEBAR (Initial View) --- */}
            {!activeModule && (
                <div className="w-80 bg-[#050a14]/95 border-r border-green-900/30 flex flex-col py-6 px-4 gap-4 overflow-y-auto z-20 shadow-[10px_0_30px_rgba(0,0,0,0.5)] animate-in slide-in-from-left duration-300">
                    <div className="text-[10px] text-green-500/50 font-mono uppercase tracking-[0.2em] mb-2 px-2">System Modules</div>
                    {menuItems.map((item) => (
                        <button 
                            key={item.id}
                            onClick={() => handleModuleSelect(item.id)}
                            className="flex items-center justify-between p-4 rounded border border-green-500/10 hover:border-green-500/50 hover:bg-green-900/20 transition-all group text-left relative overflow-hidden"
                        >
                            <div className="flex items-center space-x-4 relative z-10">
                                <div className="text-green-600 group-hover:text-green-400 group-hover:scale-110 transition-transform">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        {item.icon}
                                    </svg>
                                </div>
                                <span className="text-sm font-bold text-green-500/80 group-hover:text-white font-mono uppercase tracking-wider">{item.label}</span>
                            </div>
                            
                            {/* Visual Indicators for Malware Background Activity */}
                            {item.id === 'malware' && (
                                <div className="flex items-center space-x-2 relative z-10">
                                    {malwareScanActive && (
                                        <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                                    )}
                                    {detectedThreats.length > 0 && (
                                        <div className="bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full animate-pulse shadow-[0_0_10px_red]">
                                            {detectedThreats.length}
                                        </div>
                                    )}
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            )}

            {/* --- MAIN MAP AREA (Background) --- */}
            <div className="absolute inset-0 z-0 bg-black">
                {/* Map Container with Dark Mode Filter for Google Tiles */}
                <div ref={mapContainerRef} className="absolute inset-0 z-0 filter grayscale-[0.8] brightness-[0.5] contrast-[1.2]"></div>
                
                {/* Overlay Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-10"></div>
                
                {/* Map Module: Live Attack Log */}
                {activeModule === 'map' && (
                    <div className="absolute bottom-8 left-8 z-30 pointer-events-none">
                        <div className="bg-black/80 backdrop-blur border border-red-500/30 p-4 rounded max-w-sm pointer-events-auto">
                            <h3 className="text-red-500 text-xs font-mono font-bold tracking-widest uppercase mb-2 border-b border-red-900/50 pb-1">Live Attack Feed</h3>
                            <div className="space-y-1">
                                {mapAttackLog.map((log, i) => (
                                    <div key={i} className="text-[10px] font-mono text-cyan-400 animate-in fade-in slide-in-from-left-2 duration-300">
                                        &gt; {log}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Hacker Location Info Box (Only shows if terminal closed and hacker found) */}
                {hackerFound && !showTerminal && activeModule === 'firewall' && (
                    <div className="absolute top-20 right-20 bg-black/90 border-2 border-red-600 p-4 rounded z-30 animate-in bounce-in duration-500 shadow-[0_0_50px_red]">
                        <h2 className="text-red-500 font-bold text-lg animate-pulse">BREACH SOURCE IDENTIFIED</h2>
                        <div className="text-white text-sm mt-2 font-mono">
                            <div>IP: 192.168.X.XXX (MASKED)</div>
                            <div>ORIGIN: {HACKER_LOCATION.location}</div>
                            <div>COORDS: {HACKER_LOCATION.lat}, {HACKER_LOCATION.lng}</div>
                        </div>
                        <div className="mt-4 text-xs text-green-400">COUNTER-MEASURES DEPLOYED. SYSTEM SECURED.</div>
                    </div>
                )}
            </div>

            {/* --- MALWARE SCANNER MODULE --- */}
            {activeModule === 'malware' && (
                <div className="absolute inset-0 z-20 flex bg-black/90 backdrop-blur-sm p-8 animate-in fade-in duration-300">
                    <div className="w-full h-full flex gap-8">
                        
                        {/* LEFT: System Status & Timer */}
                        <div className="w-1/3 flex flex-col gap-6">
                            <div className="bg-[#0f0f10] border border-green-500/30 p-6 rounded-lg shadow-lg relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-20">
                                    <svg className="w-24 h-24 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                </div>
                                <h2 className="text-xl font-bold text-white tracking-widest uppercase mb-4">System Status</h2>
                                <div className={`text-4xl font-bold font-mono mb-2 ${detectedThreats.length > 0 ? 'text-red-500 animate-pulse' : 'text-green-400'}`}>
                                    {detectedThreats.length > 0 ? 'CRITICAL RISK' : 'SECURE'}
                                </div>
                                <p className="text-xs text-green-500/60 font-mono uppercase tracking-widest">
                                    {detectedThreats.length} THREATS DETECTED
                                </p>
                            </div>

                            <div className="bg-[#0f0f10] border border-green-500/30 p-6 rounded-lg shadow-lg flex flex-col items-center justify-center text-center">
                                <div className="w-40 h-40 rounded-full border-4 border-dashed border-green-500/30 flex items-center justify-center mb-4 relative">
                                    {malwareScanActive && <div className="absolute inset-0 border-4 border-t-green-500 border-l-transparent border-b-transparent border-r-transparent rounded-full animate-spin"></div>}
                                    <div className="text-3xl font-bold text-white font-mono">
                                        {Math.floor(timeToNextScan / 60)}:{(timeToNextScan % 60).toString().padStart(2, '0')}
                                    </div>
                                </div>
                                <h3 className="text-green-400 text-xs font-mono uppercase tracking-widest mb-1">Time Until Next Auto-Scan</h3>
                                <p className="text-[10px] text-gray-500 font-mono">SCHEDULED EVERY 10 MINUTES</p>
                                
                                <button 
                                    onClick={startMalwareScan}
                                    disabled={malwareScanActive}
                                    className="mt-6 w-full py-3 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold uppercase tracking-widest text-xs rounded transition-all shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                                >
                                    {malwareScanActive ? 'SCANNING SYSTEM...' : 'INITIATE MANUAL SCAN'}
                                </button>
                            </div>

                            <div className="bg-[#0f0f10] border border-green-500/30 p-4 rounded-lg flex-grow">
                                <h3 className="text-xs font-bold text-green-500 uppercase tracking-widest mb-4 border-b border-green-500/20 pb-2">Scan Log</h3>
                                <div className="space-y-2 text-[10px] font-mono text-gray-400">
                                    <div className="flex justify-between">
                                        <span>LAST SCAN:</span>
                                        <span className="text-white">{lastScanTime}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>FILES SCANNED:</span>
                                        <span className="text-white">{scannedFilesCount}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>SCAN ENGINE:</span>
                                        <span className="text-green-400">HEURISTIC v4.2</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* MIDDLE: Visualizer */}
                        <div className="w-1/3 flex flex-col bg-[#0f0f10] border border-green-500/30 rounded-lg overflow-hidden relative">
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.05)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
                            
                            <div className="p-4 border-b border-green-500/20 bg-black/40">
                                <h3 className="text-xs font-bold text-green-400 uppercase tracking-widest">Real-time Analysis</h3>
                            </div>

                            <div className="flex-grow flex flex-col items-center justify-center p-8 relative">
                                {malwareScanActive ? (
                                    <>
                                        <div className="w-full max-w-xs mb-8 relative">
                                            <div className="text-center text-4xl font-bold text-white font-mono mb-2">{Math.round(malwareProgress)}%</div>
                                            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-green-500 transition-all duration-100" style={{ width: `${malwareProgress}%` }}></div>
                                            </div>
                                        </div>
                                        <div className="font-mono text-xs text-green-500/70 text-center animate-pulse break-all max-w-full px-4">
                                            SCANNING: {currentFileScanned}
                                        </div>
                                        {/* Visual Dots Matrix */}
                                        <div className="mt-8 grid grid-cols-8 gap-2">
                                            {Array.from({length: 32}).map((_, i) => (
                                                <div key={i} className="w-2 h-2 rounded-full bg-green-500/20 animate-pulse" style={{ animationDelay: `${i * 0.05}s` }}></div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center opacity-50">
                                        <svg className="w-20 h-20 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        <div className="text-lg font-bold text-white uppercase tracking-widest">System Idle</div>
                                        <div className="text-xs text-green-500 font-mono mt-2">MONITORING BACKGROUND PROCESSES</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT: Quarantine & Threats */}
                        <div className="w-1/3 flex flex-col bg-[#0f0f10] border border-red-500/30 rounded-lg overflow-hidden">
                            <div className="p-4 border-b border-red-500/20 bg-red-900/10 flex justify-between items-center">
                                <h3 className="text-xs font-bold text-red-400 uppercase tracking-widest">Quarantine Zone</h3>
                                <div className="text-[10px] bg-red-500 text-black px-2 py-0.5 rounded font-bold">{detectedThreats.length} ACTIVE</div>
                            </div>
                            
                            <div className="flex-grow overflow-y-auto p-4 space-y-3">
                                {detectedThreats.length === 0 ? (
                                    <div className="h-full flex items-center justify-center text-gray-600 font-mono text-xs text-center">
                                        NO THREATS DETECTED<br/>SYSTEM SECURE
                                    </div>
                                ) : (
                                    detectedThreats.map(threat => (
                                        <div key={threat.id} className="bg-red-950/20 border border-red-500/30 p-3 rounded flex flex-col animate-in slide-in-from-right duration-300">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="text-red-400 font-bold text-xs truncate w-32" title={threat.name}>{threat.name}</div>
                                                <div className="text-[9px] bg-red-900/50 text-red-300 px-1.5 rounded border border-red-500/30">{threat.type}</div>
                                            </div>
                                            <div className="text-[9px] text-gray-500 font-mono break-all mb-3">{threat.path}</div>
                                            <div className="flex justify-between items-center mt-auto">
                                                <span className="text-[9px] text-red-500 font-bold uppercase">{threat.risk} RISK</span>
                                                <button 
                                                    onClick={() => handlePurgeThreat(threat.id)}
                                                    className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-[9px] font-bold uppercase rounded transition-colors"
                                                >
                                                    PURGE
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {/* --- DARK WEB MONITORING MODULE --- */}
            {activeModule === 'darkweb' && (
                <div className="absolute inset-0 z-20 flex bg-[#030303]/95 backdrop-blur-md p-6 gap-6 animate-in fade-in duration-300">
                    
                    {/* LEFT: Controls & Stats */}
                    <div className="w-72 flex flex-col gap-6">
                        <div className="bg-[#0a0a0a] border border-amber-900/30 p-4 rounded-lg">
                            <div className="flex items-center space-x-2 mb-4 border-b border-amber-900/20 pb-2">
                                <div className={`w-3 h-3 rounded-full ${torConnection ? 'bg-green-500 shadow-[0_0_10px_green]' : 'bg-red-500'} animate-pulse`}></div>
                                <h3 className="text-amber-500 font-mono text-xs font-bold uppercase tracking-wider">Tor Network Status</h3>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <div className="text-[9px] text-gray-500 font-mono uppercase mb-1">Active Nodes</div>
                                    <div className="text-white font-mono text-xl">{torConnection ? '4,892' : '0'}</div>
                                </div>
                                <div>
                                    <div className="text-[9px] text-gray-500 font-mono uppercase mb-1">Encrypted Traffic</div>
                                    <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-amber-600 animate-pulse" style={{width: '78%'}}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#0a0a0a] border border-amber-900/30 p-4 rounded-lg flex-grow">
                            <h3 className="text-amber-500 font-mono text-xs font-bold uppercase tracking-wider mb-4 border-b border-amber-900/20 pb-2">Threat Gauge</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] text-amber-500/70 font-mono uppercase">Leaked Credentials</span>
                                    <span className="text-white font-bold text-xs">{monitorStats.leakedCreds}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] text-red-500/70 font-mono uppercase">Terror Chatter</span>
                                    <span className="text-white font-bold text-xs">{monitorStats.terrorMentions}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] text-orange-500/70 font-mono uppercase">Fake ID Sales</span>
                                    <span className="text-white font-bold text-xs">{monitorStats.fakeIds}</span>
                                </div>
                            </div>
                            <div className="mt-8">
                                <div className="text-[9px] text-center text-gray-600 font-mono mb-2">IDENTITY EXPOSURE RISK</div>
                                <div className="w-full bg-gray-900 h-4 rounded-full border border-gray-700 relative overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-green-900 via-amber-900 to-red-600" style={{width: '65%'}}></div>
                                </div>
                                <div className="text-center text-amber-500 font-bold text-sm mt-1">ELEVATED</div>
                            </div>
                        </div>
                    </div>

                    {/* CENTER: Underground Forum Scraper */}
                    <div className="flex-grow flex flex-col bg-[#050505] border border-amber-900/20 rounded-lg overflow-hidden relative">
                        <div className="bg-[#0a0a0a] border-b border-amber-900/20 p-3 flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                                <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <span className="text-amber-500 font-mono text-xs font-bold tracking-widest uppercase">Live Forum Scraper</span>
                            </div>
                            <span className="text-[10px] text-amber-900 font-mono animate-pulse">DECRYPTING ONION ROUTING LAYERS...</span>
                        </div>
                        
                        <div className="flex-grow overflow-y-auto p-4 space-y-2 font-mono" ref={darkWebLogRef}>
                            {darkWebLogs.map((log, i) => (
                                <div key={log.id} className="text-[11px] border-b border-white/5 pb-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="flex space-x-2 text-[9px] opacity-50 mb-0.5">
                                        <span className="text-amber-700">{log.timestamp}</span>
                                        <span className="text-gray-600">[{log.source}]</span>
                                        <span className="text-blue-900">@{log.user}</span>
                                    </div>
                                    <div className="flex justify-between items-start">
                                        <span className={`${log.risk === 'CRITICAL' ? 'text-red-500 font-bold' : log.risk === 'HIGH' ? 'text-orange-400' : 'text-amber-200/70'}`}>
                                            {log.content}
                                        </span>
                                        <span className={`text-[8px] px-1 rounded ${log.risk === 'CRITICAL' ? 'bg-red-900 text-white' : 'bg-gray-800 text-gray-500'}`}>{log.category}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {/* Scanlines */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none opacity-20"></div>
                    </div>

                    {/* RIGHT: Alerts & Leaks */}
                    <div className="w-80 flex flex-col gap-4">
                        
                        {/* Data Leak Monitor */}
                        <div className="h-1/2 bg-[#0a0a0a] border border-red-900/30 rounded-lg overflow-hidden flex flex-col">
                            <div className="p-3 border-b border-red-900/20 bg-red-950/10">
                                <h3 className="text-red-500 font-mono text-xs font-bold uppercase tracking-widest">Data Leak Monitor</h3>
                            </div>
                            
                            {/* Real-time Graph Area */}
                            <div className="h-24 bg-black/50 relative border-b border-red-900/10">
                                <svg className="w-full h-full" preserveAspectRatio="none">
                                    <defs>
                                        <linearGradient id="leakGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="rgba(239, 68, 68, 0.5)" />
                                            <stop offset="100%" stopColor="rgba(239, 68, 68, 0)" />
                                        </linearGradient>
                                    </defs>
                                    <path 
                                        d={`M0,${100 - (leakGraphData[0] * 2)} ${leakGraphData.map((val, i) => `L${(i / (leakGraphData.length - 1)) * 100}%,${100 - (val * 2)}`).join(' ')} L100%,100 L0,100 Z`} 
                                        fill="url(#leakGradient)" 
                                    />
                                    <path 
                                        d={`M0,${100 - (leakGraphData[0] * 2)} ${leakGraphData.map((val, i) => `L${(i / (leakGraphData.length - 1)) * 100}%,${100 - (val * 2)}`).join(' ')}`} 
                                        fill="none" 
                                        stroke="#ef4444" 
                                        strokeWidth="2" 
                                        vectorEffect="non-scaling-stroke"
                                    />
                                </svg>
                                <div className="absolute top-1 right-2 text-[9px] text-red-500 font-mono">LIVE VOLUME</div>
                            </div>

                            <div className="flex-grow p-3 space-y-3 overflow-y-auto">
                                {darkWebAlerts.filter(a => a.category === 'LEAK' || a.category === 'FINANCE').map((alert, i) => (
                                    <div key={i} className="bg-red-900/10 border-l-2 border-red-500 p-2">
                                        <div className="text-red-400 font-bold text-[10px] uppercase mb-1">BREACH DETECTED</div>
                                        <div className="text-gray-400 text-[10px] font-mono break-all">{alert.content}</div>
                                    </div>
                                ))}
                                {darkWebAlerts.length === 0 && <div className="text-gray-600 text-[10px] text-center mt-2">NO ACTIVE LEAKS DETECTED</div>}
                            </div>
                        </div>

                        {/* Identity Exposure */}
                        <div className="h-1/2 bg-[#0a0a0a] border border-orange-900/30 rounded-lg overflow-hidden flex flex-col">
                            <div className="p-3 border-b border-orange-900/20 bg-orange-950/10">
                                <h3 className="text-orange-500 font-mono text-xs font-bold uppercase tracking-widest">Identity Exposure Alerts</h3>
                            </div>
                            <div className="flex-grow p-3 space-y-3 overflow-y-auto">
                                <div className="flex items-center space-x-3 bg-white/5 p-2 rounded">
                                    <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-xs text-white font-bold">PM</div>
                                    <div>
                                        <div className="text-white text-[10px] font-bold">VIP TARGET WATCH</div>
                                        <div className="text-green-500 text-[9px]">NO RECENT MENTIONS</div>
                                    </div>
                                </div>
                                {darkWebAlerts.filter(a => a.category === 'FAKE_ID' || a.category === 'TERROR').map((alert, i) => (
                                    <div key={i} className="flex items-start space-x-2 bg-orange-900/10 p-2 rounded border border-orange-900/20">
                                        <svg className="w-4 h-4 text-orange-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                        <div>
                                            <div className="text-orange-300 text-[10px] font-bold">THREAT MENTION</div>
                                            <div className="text-gray-400 text-[9px] font-mono leading-tight">{alert.content}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                </div>
            )}

            {/* --- NETWORK INTRUSION DETECTION SYSTEM (IDS) --- */}
            {activeModule === 'ids' && (
                <div className="absolute inset-0 z-20 flex bg-black/80 backdrop-blur-sm p-4 gap-4 animate-in fade-in duration-300">
                    
                    {/* LEFT: Stats & Controls */}
                    <div className="w-80 bg-[#0a0a0a] border border-green-500/20 flex flex-col rounded p-4 gap-6">
                        <div>
                            <h3 className="text-green-400 font-mono text-xs tracking-widest uppercase mb-4 border-b border-green-500/30 pb-2">Detection Method</h3>
                            <div className="space-y-2">
                                <button 
                                    onClick={() => setDetectionMethod('SIGNATURE')}
                                    className={`w-full py-2 border text-xs font-bold uppercase transition-all ${detectionMethod === 'SIGNATURE' ? 'bg-green-500 text-black border-green-500' : 'border-green-500/30 text-green-500/50 hover:text-green-400'}`}
                                >
                                    Signature Based
                                </button>
                                <button 
                                    onClick={() => setDetectionMethod('ANOMALY')}
                                    className={`w-full py-2 border text-xs font-bold uppercase transition-all ${detectionMethod === 'ANOMALY' ? 'bg-green-500 text-black border-green-500' : 'border-green-500/30 text-green-500/50 hover:text-green-400'}`}
                                >
                                    Anomaly Based
                                </button>
                                <button 
                                    onClick={() => setDetectionMethod('HYBRID')}
                                    className={`w-full py-2 border text-xs font-bold uppercase transition-all ${detectionMethod === 'HYBRID' ? 'bg-green-500 text-black border-green-500' : 'border-green-500/30 text-green-500/50 hover:text-green-400'}`}
                                >
                                    Hybrid (Recommended)
                                </button>
                            </div>
                            <p className="text-[10px] text-green-500/40 mt-2 font-mono">
                                {detectionMethod === 'SIGNATURE' && "MATCHES TRAFFIC AGAINST KNOWN THREAT DB."}
                                {detectionMethod === 'ANOMALY' && "DETECTS BEHAVIORAL DEVIATIONS & UNKNOWN THREATS."}
                                {detectionMethod === 'HYBRID' && "COMBINES PATTERN MATCHING WITH HEURISTIC ANALYSIS."}
                            </p>
                        </div>

                        <div>
                            <h3 className="text-green-400 font-mono text-xs tracking-widest uppercase mb-4 border-b border-green-500/30 pb-2">Traffic Analysis</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-green-500/70">NORMAL</span>
                                    <span className="text-white font-bold">{idsStats.normal}</span>
                                </div>
                                <div className="w-full h-1 bg-green-900/30"><div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${(idsStats.normal / (idsStats.normal + idsStats.suspicious + idsStats.malicious + 1)) * 100}%` }}></div></div>
                                
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-yellow-500/70">SUSPICIOUS</span>
                                    <span className="text-white font-bold">{idsStats.suspicious}</span>
                                </div>
                                <div className="w-full h-1 bg-yellow-900/30"><div className="h-full bg-yellow-500 transition-all duration-500" style={{ width: `${(idsStats.suspicious / (idsStats.normal + idsStats.suspicious + idsStats.malicious + 1)) * 100}%` }}></div></div>

                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-red-500/70">MALICIOUS</span>
                                    <span className="text-white font-bold">{idsStats.malicious}</span>
                                </div>
                                <div className="w-full h-1 bg-red-900/30"><div className="h-full bg-red-500 transition-all duration-500" style={{ width: `${(idsStats.malicious / (idsStats.normal + idsStats.suspicious + idsStats.malicious + 1)) * 100}%` }}></div></div>
                            </div>
                        </div>
                    </div>

                    {/* CENTER: Live Packet Stream */}
                    <div className="flex-grow bg-[#050505] border border-green-500/20 flex flex-col rounded overflow-hidden">
                        <div className="bg-[#0a0a0a] border-b border-green-500/20 p-2 flex justify-between items-center">
                            <span className="text-green-400 text-xs font-mono tracking-widest uppercase">Live Packet Capture Stream</span>
                            <div className="flex space-x-2 text-[10px]">
                                <span className="text-green-500/50">TCP/UDP</span>
                                <span className="text-green-500/50">ICMP</span>
                                <span className="animate-pulse text-green-500">LISTENING...</span>
                            </div>
                        </div>
                        <div className="flex-grow overflow-y-auto font-mono text-xs p-2 space-y-1" ref={idsStreamRef}>
                            <div className="grid grid-cols-6 gap-2 text-[10px] text-green-500/40 border-b border-green-500/10 pb-1 mb-2 px-2 sticky top-0 bg-[#050505] z-10">
                                <span>TIMESTAMP</span>
                                <span>SOURCE</span>
                                <span>DESTINATION</span>
                                <span>TYPE</span>
                                <span>PROTOCOL</span>
                                <span>STATUS</span>
                            </div>
                            {packetStream.map((packet, idx) => (
                                <div key={`${packet.id}-${idx}`} className={`grid grid-cols-6 gap-2 px-2 py-1 rounded hover:bg-white/5 transition-colors ${packet.status === 'MALICIOUS' ? 'text-red-400 bg-red-900/10' : packet.status === 'SUSPICIOUS' ? 'text-yellow-400' : 'text-green-400/80'}`}>
                                    <span>{packet.timestamp}</span>
                                    <span>{packet.sourceIp}</span>
                                    <span>{packet.destIp}</span>
                                    <span>{packet.type}</span>
                                    <span>{packet.protocol}:{packet.port}</span>
                                    <span className="font-bold">{packet.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT: Alerts & Visuals */}
                    <div className="w-96 flex flex-col gap-4">
                        {/* Threat Console */}
                        <div className="flex-grow bg-[#0a0a0a] border border-red-500/20 rounded p-4 flex flex-col overflow-hidden">
                            <h3 className="text-red-500 font-mono text-xs tracking-widest uppercase mb-4 border-b border-red-500/30 pb-2 flex justify-between">
                                <span>Active Threats</span>
                                <span className="animate-pulse">{idsAlerts.length}</span>
                            </h3>
                            <div className="flex-grow overflow-y-auto space-y-3">
                                {idsAlerts.length === 0 ? (
                                    <div className="text-green-500/30 text-center mt-10 font-mono text-xs">NO ACTIVE THREATS DETECTED</div>
                                ) : (
                                    idsAlerts.map((alert, idx) => (
                                        <div key={idx} className="bg-red-950/20 border-l-2 border-red-500 p-2 animate-in slide-in-from-right duration-300">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-red-400 font-bold text-xs">{alert.alertType}</span>
                                                <span className="text-[9px] text-red-500/50">{alert.timestamp}</span>
                                            </div>
                                            <div className="text-[10px] text-red-300/70 font-mono break-all">
                                                {alert.payload}
                                            </div>
                                            <div className="mt-1 text-[9px] text-red-500/50">SRC: {alert.sourceIp}</div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Traffic Graph Sim */}
                        <div className="h-48 bg-[#0a0a0a] border border-green-500/20 rounded p-4 relative overflow-hidden">
                            <div className="absolute top-2 left-2 text-[10px] text-green-500/50 font-mono">NETWORK THROUGHPUT</div>
                            <div className="absolute bottom-0 left-0 right-0 h-32 flex items-end justify-between px-2 gap-1">
                                {Array.from({length: 40}).map((_, i) => (
                                    <div 
                                        key={i} 
                                        className="w-full bg-green-500/20 transition-all duration-300"
                                        style={{ height: `${Math.random() * 100}%` }}
                                    ></div>
                                ))}
                            </div>
                            <div className="absolute inset-0 bg-[linear-gradient(transparent_95%,rgba(0,255,0,0.1)_95%)] bg-[size:100%_20px] pointer-events-none"></div>
                        </div>
                    </div>

                </div>
            )}

            {/* --- FIREWALL MODULE VIEW --- */}
            {activeModule === 'firewall' && !showTerminal && !hackerFound && (
                <div className="absolute inset-0 z-20 flex bg-black/40 backdrop-blur-[2px]">
                    
                    {/* LEFT PANEL: AI Chat / Coding Interface (Placeholder for pre-unlock) */}
                    <div className="flex-grow p-6 flex flex-col justify-end pb-12 animate-in slide-in-from-left duration-500 max-w-2xl">
                         <div className="bg-[#0a0a0a]/90 border border-green-500/30 p-6 rounded-lg h-3/4 flex flex-col relative overflow-hidden shadow-2xl">
                            {/* Scanning line */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-green-500/50 animate-[scan_3s_linear_infinite]"></div>
                            
                            <div className="flex justify-between items-center border-b border-green-500/20 pb-2 mb-4">
                                <h3 className="text-green-400 font-mono tracking-widest flex items-center">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                                    AI SENTINEL INTERFACE
                                </h3>
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_lime]"></div>
                                    <span className="text-xs text-green-600 font-bold">ONLINE</span>
                                </div>
                            </div>
                            
                            <div className="flex-grow font-mono text-xs text-green-500/80 overflow-y-auto space-y-2 p-2 scrollbar-hide">
                                {aiChatLog.map((log, i) => (
                                    <p key={i} className="animate-in fade-in slide-in-from-left-2 duration-300">{log}</p>
                                ))}
                            </div>
                            
                            {/* Fake Input */}
                            <div className="mt-4 pt-4 border-t border-green-500/20 flex items-center">
                                <span className="text-green-500 mr-2 animate-pulse">&gt;</span>
                                <input type="text" disabled placeholder="SELECT A SECURITY LAYER TO INITIATE PATCH..." className="bg-transparent w-full outline-none text-green-400 font-mono text-sm placeholder-green-800/50 uppercase cursor-not-allowed" />
                            </div>
                         </div>
                    </div>

                    {/* RIGHT PANEL: Levels Selection */}
                    <div className="w-96 p-6 flex flex-col justify-center space-y-6 animate-in slide-in-from-right duration-500 bg-gradient-to-l from-black/90 via-black/80 to-transparent">
                        <h2 className="text-right text-green-400 font-mono text-xl tracking-widest border-b border-green-500/50 pb-2 mb-4">SECURITY LAYERS</h2>
                        {[1, 2, 3].map((level) => (
                            <button 
                                key={level}
                                onClick={() => handleLevelClick(level)}
                                className="group relative h-32 bg-[#050a14]/80 border border-green-500/30 hover:border-green-400 hover:bg-green-900/20 transition-all flex flex-col items-end justify-center p-6 shadow-lg backdrop-blur-sm overflow-hidden"
                            >
                                {/* Level Indicator Bar */}
                                <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-300 ${unlockedLevels.includes(level) ? 'bg-green-500 shadow-[0_0_10px_lime]' : 'bg-red-500 group-hover:bg-green-400'}`}></div>
                                
                                <div className="text-4xl font-black text-white/10 absolute left-4 top-1/2 -translate-y-1/2 select-none group-hover:text-white/20 transition-colors">0{level}</div>
                                
                                <h3 className="text-2xl font-bold text-white mb-1 relative z-10 group-hover:scale-105 transition-transform">LEVEL 0{level}</h3>
                                <p className="text-xs text-green-500/60 font-mono uppercase tracking-widest text-right relative z-10">
                                    {level === 1 ? 'PERIMETER DEFENSE' : level === 2 ? 'PACKET FILTERING' : 'KERNEL ACCESS'}
                                </p>
                                {unlockedLevels.includes(level) ? (
                                    <div className="mt-2 text-[10px] font-bold text-green-400 bg-green-900/30 px-2 py-1 rounded border border-green-500/20">ACCESS GRANTED</div>
                                ) : (
                                    <div className="mt-2 text-[10px] font-bold text-red-500 flex items-center bg-red-900/10 px-2 py-1 rounded border border-red-500/20">
                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                        LOCKED
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>

                </div>
            )}

            {/* --- FULL SCREEN TERMINAL (When Level Unlocked) --- */}
            {showTerminal && (
                <div className="absolute inset-0 z-50 bg-[#0a0a0a] flex flex-col animate-in zoom-in-95 duration-300">
                    
                    {/* Header */}
                    <div className="flex justify-between items-center p-4 border-b border-green-500/30 bg-[#020408]">
                        <h2 className="text-xl font-bold text-green-400 tracking-widest flex items-center">
                            <span className="bg-green-500 text-black px-2 mr-3 rounded text-sm">LVL {selectedLevel}</span>
                            FIREWALL ROOT TERMINAL
                        </h2>
                        <div className="flex space-x-4 items-center">
                            <div className="flex space-x-2">
                                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_red]"></div>
                                <span className="text-red-500 font-bold text-xs uppercase tracking-wider">ACTIVE INTRUSION DETECTED</span>
                            </div>
                            <button onClick={handleBack} className="border border-green-500/50 text-green-500 hover:bg-green-900/30 px-4 py-1 rounded text-xs font-bold uppercase tracking-wider transition-colors">
                                Close Terminal
                            </button>
                        </div>
                    </div>

                    <div className="flex-grow flex relative overflow-hidden">
                        {/* Left: System Code Visuals */}
                        <div className="w-80 border-r border-green-500/20 p-4 font-mono text-[10px] text-green-800/60 overflow-hidden relative bg-[#050505]">
                            <div className="absolute inset-0 bg-[linear-gradient(transparent_0%,rgba(0,255,0,0.05)_50%,transparent_100%)] h-full animate-[scan_3s_linear_infinite] pointer-events-none"></div>
                            <div className="opacity-50">
                                {Array.from({length: 60}).map((_, i) => (
                                    <div key={i} className="whitespace-nowrap">
                                        {`0x${Math.random().toString(16).substr(2, 8).toUpperCase()}  MOV  EAX, [EBP-${Math.floor(Math.random()*100)}]  ; SYS_CALL_${i}`}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Center: Interactive Terminal */}
                        <div className="flex-grow flex flex-col p-8 relative bg-black">
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
                            
                            <div className="flex-grow bg-[#0c0c0c] border border-green-500/30 p-6 font-mono text-sm text-green-400 mb-6 overflow-y-auto rounded shadow-[0_0_30px_rgba(0,255,0,0.05)] relative">
                                {!aiActive ? (
                                    <textarea 
                                        className="w-full h-full bg-transparent outline-none resize-none placeholder-green-900/50 focus:placeholder-green-900/20"
                                        placeholder={`// ROOT ACCESS GRANTED: LEVEL ${selectedLevel}\n// ENTER COUNTER-SCRIPT TO PATCH VULNERABILITY...\n\n_`}
                                        value={terminalCode}
                                        onChange={(e) => setTerminalCode(e.target.value)}
                                        spellCheck={false}
                                        autoFocus
                                    />
                                ) : (
                                    <div className="whitespace-pre-wrap animate-pulse text-green-300">{terminalCode}</div>
                                )}
                            </div>

                            <div className="flex justify-between items-center bg-[#0a1525] p-4 rounded border border-green-500/20">
                                <div className="text-xs text-gray-400 font-mono">
                                    SYSTEM INTEGRITY: <span className="text-red-500 font-bold">CRITICAL</span>
                                </div>
                                <div className="flex space-x-4">
                                    <button 
                                        className="px-8 py-3 border border-green-500 text-green-500 hover:bg-green-500 hover:text-black font-bold text-xs tracking-[0.2em] rounded transition-all shadow-[0_0_10px_rgba(0,255,0,0.1)]"
                                        disabled={aiActive}
                                    >
                                        EXECUTE PATCH
                                    </button>
                                    
                                    <button 
                                        onClick={activateAI}
                                        disabled={aiActive}
                                        className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs tracking-[0.2em] rounded shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                        <span>ACTIVATE AI SENTINEL</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- PASSWORD MODAL (Overlay) --- */}
            {activeModule === 'firewall' && selectedLevel !== null && !showTerminal && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#0a1525] border-2 border-green-500/50 p-8 rounded-lg shadow-[0_0_50px_rgba(0,255,0,0.2)] w-full max-w-md text-center relative animate-in zoom-in-95 duration-200">
                        <button onClick={() => setSelectedLevel(null)} className="absolute top-4 right-4 text-green-700 hover:text-green-400"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                        
                        <div className="w-16 h-16 border-2 border-green-500 rounded-full flex items-center justify-center mx-auto mb-6 bg-green-900/20">
                            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        </div>
                        
                        <div className="text-green-500 font-mono text-lg mb-6 tracking-widest uppercase">
                            Enter Level {selectedLevel} Passcode
                        </div>
                        
                        <form onSubmit={handlePasswordSubmit}>
                            <input 
                                type="password" 
                                autoFocus
                                value={passwordInput}
                                onChange={(e) => setPasswordInput(e.target.value)}
                                className="w-full bg-black border border-green-800 text-green-400 font-mono text-center text-2xl py-4 tracking-[0.5em] focus:outline-none focus:border-green-500 focus:shadow-[0_0_20px_rgba(0,255,0,0.2)] placeholder-green-900/30 mb-2 rounded"
                                placeholder="******"
                            />
                            {passwordError && <div className="text-red-500 text-xs font-bold animate-pulse mb-4 mt-2">ACCESS DENIED: INVALID KEYCODE</div>}
                            <button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-black font-bold border border-green-400 py-3 mt-4 rounded uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(0,255,0,0.3)]">
                                Authenticate
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Placeholder for other modules to maintain layout */}
            {activeModule && activeModule !== 'firewall' && activeModule !== 'ids' && activeModule !== 'malware' && activeModule !== 'darkweb' && activeModule !== 'map' && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/80 border border-green-500/30 p-8 rounded text-center backdrop-blur">
                    <h2 className="text-2xl font-bold text-green-400 mb-2">{menuItems.find(m => m.id === activeModule)?.label}</h2>
                    <p className="text-green-600/60 font-mono text-sm">MODULE ACTIVE - MONITORING</p>
                </div>
            )}

        </div>
    </div>
  );
};
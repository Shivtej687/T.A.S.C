// --- Cases Data Layer ---

export interface CaseOfficer {
  name: string;
  id: string;
  rank: string;
  clearance: string;
  image: string;
  unit: string;
}

export interface Case {
  id: string;
  title: string;
  type: string;
  status: 'ACTIVE' | 'SOLVED' | 'PENDING';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  date: string;
  location: string;
  lat: number;
  lng: number;
  description: string;
  officer: CaseOfficer;
  evidence: string[];
  originState?: string;
  policeStation?: string;
}

// Pre-defined verified real-world imagery links for TASC officers to pick
export const VERIFIED_EVIDENCE_PRESETS = [
  {
    name: 'Tactical Drone Telemetry',
    url: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Cyber Server Log Breach',
    url: 'https://images.unsplash.com/photo-1558494949-ef526b0042a0?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Phased-Array Signal Interference',
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Maritime Coast Guard Interdict',
    url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Seized Contraband Log',
    url: 'https://images.unsplash.com/photo-1516937941348-c09e554b98e4?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'DNA Sequencing Analysis',
    url: 'https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Forensic Lab Footprints',
    url: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Encrypted Cryptographic Lock',
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80'
  }
];

export const CASES_DATABASE: Case[] = [
  {
    id: 'CASE-2024-0422',
    title: 'Pahalgam Sector Infiltration & Drone Swarm Probe',
    type: 'Counter-Terrorism',
    status: 'ACTIVE',
    severity: 'CRITICAL',
    date: '2024-04-22',
    location: 'Anantnag-Pahalgam Sector, J&K',
    lat: 34.0146,
    lng: 75.3198,
    description: 'Active counter-insurgency & anti-drone surveillance tracking quadcopter payload drops along mountain passes. Rashtriya Rifles and Special Operations Group are actively executing cordon and search operations.',
    officer: {
      name: 'Maj. Gen. R. S. Bhatti',
      id: 'ARM-1994-882',
      rank: 'GOC 15 Corps Counter-Terror Division',
      clearance: 'LEVEL 5',
      image: '/leaders/suchindra_kumar.jpg',
      unit: 'Victor Force Counter-Terror Command'
    },
    evidence: [
      'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    id: 'CASE-2024-0115',
    title: 'Red Sea & Arabian Sea Maritime Anti-Piracy Mission',
    type: 'Naval Security',
    status: 'ACTIVE',
    severity: 'HIGH',
    date: '2024-01-15',
    location: 'Western Arabian Sea & Gulf of Aden Corridor',
    lat: 15.0000,
    lng: 65.0000,
    description: 'Ongoing Indian Navy guided-missile destroyer deployment (INS Chennai & INS Visakhapatnam) rescuing hijacked merchant vessels and neutralizing drone threats to commercial sea lanes.',
    officer: {
      name: 'Vice Admiral Dinesh K Tripathi',
      id: 'NAV-1985-110',
      rank: 'Flag Officer Commanding-in-Chief',
      clearance: 'LEVEL 5',
      image: '/leaders/dinesh_tripathi.jpg',
      unit: 'Western Naval Command Operational Taskforce'
    },
    evidence: [
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    id: 'CASE-2024-0510',
    title: 'Punjab Border Narco-Drone Interception Grid Audit',
    type: 'Counter-Smuggling',
    status: 'PENDING',
    severity: 'HIGH',
    date: '2024-05-10',
    location: 'Amritsar & Ferozepur BSF Border Outposts',
    lat: 31.6340,
    lng: 74.8723,
    description: 'Pending forensic audit of anti-drone hexacopter jamming grid. Over 45 hostile payload drops carrying contraband and illegal weapons recovered along the International Border.',
    officer: {
      name: 'Commandant Gurpreet Singh',
      id: 'BSF-2002-441',
      rank: 'Commandant BSF Tactical Counter-Drone Wing',
      clearance: 'LEVEL 4',
      image: '/officers/dineshwar_sharma.jpg',
      unit: 'BSF Punjab Frontier Command'
    },
    evidence: [
      'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    id: 'CASE-2024-0618',
    title: 'Galwan Line of Actual Control Radar Anomaly Audit',
    type: 'Electronic Warfare',
    status: 'PENDING',
    severity: 'CRITICAL',
    date: '2024-06-18',
    location: 'Galwan Valley High Altitude Patrol Point 14',
    lat: 34.7833,
    lng: 78.1833,
    description: 'Pending high-altitude signal intelligence analysis investigating frequency spoofing and electronic jamming directed at forward Indian army communications relays.',
    officer: {
      name: 'Brig. Vikram Rawat',
      id: 'ARM-1998-319',
      rank: 'Brigadier Signal Intelligence & Electronic Warfare',
      clearance: 'LEVEL 5',
      image: '/leaders/anil_chauhan.jpg',
      unit: '14 Corps High Altitude Electronic Warfare Battalion'
    },
    evidence: [
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    id: 'CASE-2008-1126',
    title: '26/11 Mumbai Attacks Investigation',
    type: 'Counter-Terrorism',
    status: 'SOLVED',
    severity: 'CRITICAL',
    date: '2008-11-26',
    location: 'Taj Mahal Palace Hotel & CST, Mumbai',
    lat: 18.9218,
    lng: 72.8333,
    description: 'The comprehensive investigation, forensic analysis, and trial prosecution of the Lashkar-e-Taiba terrorists responsible for the 26/11 attacks in Mumbai. Key surviving gunman Ajmal Kasab was interrogated and successfully prosecuted.',
    officer: {
      name: 'Rakesh Maria, IPS',
      id: 'IPS-1981-042',
      rank: 'Joint Commissioner of Police (Crime)',
      clearance: 'LEVEL 5',
      image: '/officers/rakesh_maria.jpg',
      unit: 'Mumbai Police Crime Branch'
    },
    evidence: [
      'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    id: 'CASE-2004-1018',
    title: 'Operation Cocoon (Hunt for Veerappan)',
    type: 'Counter-Insurgency',
    status: 'SOLVED',
    severity: 'CRITICAL',
    date: '2004-10-18',
    location: 'Dharmapuri Forest Range, Tamil Nadu',
    lat: 12.1278,
    lng: 78.1578,
    description: 'A legendary joint Special Task Force (STF) operation that successfully tracked down and neutralized Koose Munisamy Veerappan in Dharmapuri, ending a two-decade-long reign of poaching, smuggling, and terror.',
    officer: {
      name: 'K. Vijay Kumar, IPS',
      id: 'IPS-1975-018',
      rank: 'Chief of Special Task Force (STF)',
      clearance: 'LEVEL 5',
      image: '/officers/k_vijay_kumar.jpg',
      unit: 'Special Task Force (Tamil Nadu & Karnataka)'
    },
    evidence: [
      'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80'
    ]
  }
];

export const REAL_OFFICER_PORTRAITS = [
  { name: 'Rakesh Maria (DGP)', url: '/officers/rakesh_maria.jpg' },
  { name: 'K. Vijay Kumar (STF Chief)', url: '/officers/k_vijay_kumar.jpg' },
  { name: 'Vice Admiral Dinesh K. Tripathi', url: '/leaders/dinesh_tripathi.jpg' },
  { name: 'Lt. Gen. Suchindra Kumar', url: '/leaders/suchindra_kumar.jpg' },
  { name: 'Gen. Upendra Dwivedi (COAS)', url: '/leaders/upendra_dwivedi.jpg' },
  { name: 'Gen. Anil Chauhan (CDS)', url: '/leaders/anil_chauhan.jpg' },
  { name: 'Kiran Bedi (IPS)', url: '/officers/kiran_bedi.jpg' },
  { name: 'D. Roopa (IPS)', url: '/officers/d_roopa.png' },
  { name: 'Sameer Wankhede (IRS)', url: '/officers/sameer_wankhede.jpg' },
  { name: 'Sylendra Babu (IPS)', url: '/officers/sylendra_babu.jpg' },
  { name: 'Shivdeep Lande (IPS)', url: '/officers/shivdeep_lande.jpg' },
  { name: 'Alok Verma (IPS)', url: '/officers/alok_verma.jpg' },
  { name: 'Subodh Jaiswal (IPS)', url: '/officers/subodh_jaiswal.jpg' },
  { name: 'Sanjay Barve (IPS)', url: '/officers/sanjay_barve.jpg' },
  { name: 'Neeraj Kumar (IPS)', url: '/officers/neeraj_kumar.jpg' },
  { name: 'Dineshwar Sharma (IPS)', url: '/officers/dineshwar_sharma.jpg' },
  { name: 'Ajit Doval (NSA)', url: '/officers/ajit_doval.jpg' }
];

export const UPCOMING_INDIAN_CASES: Case[] = [
  {
    id: 'CASE-2026-9041',
    title: 'Kerala Coastal Gold smuggling via Dark Water Submersible',
    type: 'Counter-Smuggling',
    status: 'ACTIVE',
    severity: 'HIGH',
    date: '2026-08-25',
    location: 'Kochi Port Sector, Kerala',
    lat: 9.9667,
    lng: 76.2167,
    description: 'High-speed interception of unflagged diesel-electric semi-submersible craft off the Kochi Exclusive Economic Zone. Recovered 45kg refined bullion, encrypted satellite link receivers, and tactical maps of military docking slips.',
    officer: {
      name: 'ACP Madhavan Nair, IPS',
      id: 'IPS-2015-842',
      rank: 'Assistant Commissioner of Police (Coastal Wing)',
      clearance: 'LEVEL 4',
      image: '/officers/sylendra_babu.jpg',
      unit: 'Kerala Coastal Defence & Interdiction Task Force'
    },
    evidence: [
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80'
    ],
    originState: 'Kerala',
    policeStation: 'Kochi Harbour Police Station'
  },
  {
    id: 'CASE-2026-1182',
    title: 'Bengaluru Smart-Grid Malware Spike Detection',
    type: 'Cyber Warfare',
    status: 'ACTIVE',
    severity: 'CRITICAL',
    date: '2026-08-25',
    location: 'Indiranagar Hub, Bengaluru, Karnataka',
    lat: 12.9716,
    lng: 77.5946,
    description: 'Zero-day industrial control malware signature detected at State Load Dispatch Centre (SLDC). Intrusion vector identified as a compromised firmware patch from an external hardware supply vendor. Quarantined sub-stations.',
    officer: {
      name: 'SP K. Shivram, IPS',
      id: 'IPS-2010-093',
      rank: 'Superintendent of Police (Cyber Crime)',
      clearance: 'LEVEL 5',
      image: '/officers/subodh_jaiswal.jpg',
      unit: 'Karnataka State Cyber Command Cell'
    },
    evidence: [
      'https://images.unsplash.com/photo-1558494949-ef526b0042a0?auto=format&fit=crop&w=800&q=80'
    ],
    originState: 'Karnataka',
    policeStation: 'Bengaluru Cyber Crime Police Station'
  },
  {
    id: 'CASE-2026-4431',
    title: 'Amritsar Trans-Border Drug Hexacopter Capture',
    type: 'Counter-Smuggling',
    status: 'PENDING',
    severity: 'HIGH',
    date: '2026-08-24',
    location: 'BSF Outpost, Amritsar Sector, Punjab',
    lat: 31.6340,
    lng: 74.8723,
    description: 'A heavy-payload carbon-fiber hexacopter drone downed using tactical RF jamming rifles near the International Border. Seized 12kg contraband payload, 2 automated handguns, and GPS flight telemetry logs listing takeoff coordinates.',
    officer: {
      name: 'DSP Gurudev Singh, PPS',
      id: 'PPS-2012-108',
      rank: 'Deputy Superintendent of Police (Anti-Drug Taskforce)',
      clearance: 'LEVEL 4',
      image: '/officers/alok_verma.jpg',
      unit: 'Punjab Police Special Border Range Division'
    },
    evidence: [
      'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80'
    ],
    originState: 'Punjab',
    policeStation: 'Amritsar Cantt Police Station'
  },
  {
    id: 'CASE-2026-3394',
    title: 'Lalbazar Crypto Heist Server Farm Bust',
    type: 'Financial Fraud',
    status: 'ACTIVE',
    severity: 'MEDIUM',
    date: '2026-08-25',
    location: 'Lalbazar Cyber HQ, Kolkata, WB',
    lat: 22.5726,
    lng: 88.3639,
    description: 'Raided a clandestine, illegally powered cryptocurrency mining and laundering cluster in North Kolkata. Traced international funds washing cyber-attack proceeds from hostile foreign syndicate servers.',
    officer: {
      name: 'DCP Ananya Dasgupta, IPS',
      id: 'IPS-2016-291',
      rank: 'Deputy Commissioner of Police (Economic Offences)',
      clearance: 'LEVEL 4',
      image: '/officers/d_roopa.png',
      unit: 'Kolkata Police Economic Offences Wing'
    },
    evidence: [
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80'
    ],
    originState: 'West Bengal',
    policeStation: 'Lalbazar Police Headquarters'
  },
  {
    id: 'CASE-2026-5541',
    title: 'Guwahati Illegal Cross-Border Timber Syndicate Intercept',
    type: 'Organized Crime',
    status: 'PENDING',
    severity: 'MEDIUM',
    date: '2026-08-25',
    location: 'East Kamrup Forest Range, Guwahati, Assam',
    lat: 26.1445,
    lng: 91.7362,
    description: 'Infiltration and tactical sting operation against an organized logging cartel operating illegal distribution lanes across international boundaries. Over 20 contraband flatbed trucks confiscated.',
    officer: {
      name: 'SP Himanta Baruah, IPS',
      id: 'IPS-2018-032',
      rank: 'Superintendent of Police (Rural Command)',
      clearance: 'LEVEL 3',
      image: '/officers/sanjay_barve.jpg',
      unit: 'Assam Police Border Range Vigilance Division'
    },
    evidence: [
      'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80'
    ],
    originState: 'Assam',
    policeStation: 'Guwahati East Police Station'
  },
  {
    id: 'CASE-2026-7788',
    title: 'Delhi Diplomatic Zone Signal Intercept',
    type: 'Electronic Warfare',
    status: 'ACTIVE',
    severity: 'CRITICAL',
    date: '2026-08-25',
    location: 'Chanakyapuri Embassies Zone, New Delhi',
    lat: 28.5920,
    lng: 77.1843,
    description: 'Deployment of counter-intelligence RF sweepers around sensitive diplomatic corridors. Found hidden, high-frequency, phased-array micro-transceivers disguised as municipal street lighting rigs.',
    officer: {
      name: 'ACP Shalini Sharma, IPS',
      id: 'IPS-2012-701',
      rank: 'Assistant Commissioner (Special Operations Group)',
      clearance: 'LEVEL 5',
      image: '/officers/kiran_bedi.jpg',
      unit: 'Delhi Police Special Cell (Intelligence Division)'
    },
    evidence: [
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80'
    ],
    originState: 'Delhi',
    policeStation: 'Chanakyapuri Division HQ'
  },
  {
    id: 'CASE-2026-6612',
    title: 'Srinagar High-Altitude Drone Swarm Intrusion',
    type: 'Counter-Terrorism',
    status: 'ACTIVE',
    severity: 'CRITICAL',
    date: '2026-08-25',
    location: 'Rajbagh Outpost Sector, Srinagar, J&K',
    lat: 34.0837,
    lng: 74.7973,
    description: 'Active radar tracking and subsequent intercept of multiple coordinated quadcopter systems violating restricted civilian airspace. Recovered weaponized payload assemblies and telemetry hardware with encrypted firmwares.',
    officer: {
      name: 'DSP Bilal Lone, JKPS',
      id: 'JKP-2014-990',
      rank: 'Deputy Superintendent of Police (SOG)',
      clearance: 'LEVEL 5',
      image: '/officers/sameer_wankhede.jpg',
      unit: 'Jammu & Kashmir Police Special Operations Group'
    },
    evidence: [
      'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=800&q=80'
    ],
    originState: 'Jammu & Kashmir',
    policeStation: 'Srinagar Rajbagh Police Outpost'
  },
  {
    id: 'CASE-2026-0104',
    title: 'Colaba Port Cyber Database Breach Intercept',
    type: 'Cyber Warfare',
    status: 'ACTIVE',
    severity: 'HIGH',
    date: '2026-08-25',
    location: 'Colaba Division, Mumbai, Maharashtra',
    lat: 18.9100,
    lng: 72.8200,
    description: 'Real-time trace and suppression of an active database SQL-injection and privilege escalation attack targeting maritime logistics manifests. Successfully blocked and routed to an encrypted honey-pot server.',
    officer: {
      name: 'DCP Sachin Kadam, IPS',
      id: 'IPS-2011-450',
      rank: 'Deputy Commissioner (Cyber Security & Anti-Espionage)',
      clearance: 'LEVEL 5',
      image: '/officers/shivdeep_lande.jpg',
      unit: 'Mumbai Police Cyber Defence Unit'
    },
    evidence: [
      'https://images.unsplash.com/photo-1558494949-ef526b0042a0?auto=format&fit=crop&w=800&q=80'
    ],
    originState: 'Maharashtra',
    policeStation: 'Colaba Police Headquarters'
  }
];

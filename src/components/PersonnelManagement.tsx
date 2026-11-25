import React, { useState, useEffect } from 'react';

// --- Types ---
type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
type RequestType = 'LEAVE' | 'CLEARANCE' | 'TRANSFER' | 'EQUIPMENT' | 'MEDICAL';

interface ServiceRequest {
  id: string;
  type: RequestType;
  title: string;
  description: string;
  dateSubmitted: string;
  status: RequestStatus;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

interface Officer {
  id: string;
  name: string;
  rank: string;
  unit: string;
  status: 'ACTIVE' | 'ON LEAVE' | 'SUSPENDED' | 'MIA' | 'RESERVE';
  image: string;
  email: string;
  personal: {
    dob: string;
    age: number;
    bloodGroup: string;
    contact: string;
    address: string;
    emergencyContact: string;
  };
  professional: {
    joinDate: string;
    clearanceLevel: string; // e.g., LEVEL 5 (TOP SECRET)
    specialization: string[];
    missionsCompleted: number;
    deploymentHistory: string[];
  };
  requests: ServiceRequest[];
}

// --- Officer Image Component with Fallback ---
const OfficerImage: React.FC<{ src: string; name: string; className?: string }> = ({ src, name, className = "w-12 h-12 rounded-md object-cover border border-cyan-500/40" }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  const initials = name
    .replace(/(Dr\.|Shri|Smt\.|General|Admiral|Air Chief Marshal|Lieutenant General|Major General|Brigadier|Colonel|Head Constable|Constable|Havildar|Sub-Inspector|Captain|IPS|IAS|IRS)/g, '')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'OFF';

  if (hasError || !src) {
    return (
      <div className={`${className} flex flex-col items-center justify-center bg-gradient-to-b from-[#0a1e36] to-[#051120] text-cyan-300 border border-cyan-500/50 shadow-[0_0_12px_rgba(34,211,238,0.3)] shrink-0 select-none p-1 text-center`}>
        <span className="text-[9px] font-mono font-bold text-amber-300 tracking-wider">OFFICER</span>
        <span className="text-xs font-extrabold font-sans text-cyan-200">{initials}</span>
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={name} 
      referrerPolicy="no-referrer"
      className={className} 
      onError={() => setHasError(true)}
    />
  );
};

// --- Mock Data ---
const MOCK_OFFICERS: Officer[] = [
  {
    id: 'IPS-1981-042',
    name: 'Rakesh Maria, IPS',
    rank: 'Director General of Police',
    unit: 'Crime Investigation & Anti-Terrorism',
    status: 'ACTIVE',
    image: '/officers/rakesh_maria.jpg',
    email: 'rakesh.maria@mumbaipolice.gov.in',
    personal: {
      dob: '1957-01-19',
      age: 67,
      bloodGroup: 'O+',
      contact: '+91-22-2262-XXXX',
      address: 'Police Headquarters, CST, Mumbai',
      emergencyContact: 'Preeti Maria (Spouse)'
    },
    professional: {
      joinDate: '1981-07-12',
      clearanceLevel: 'LEVEL 5 (TOP SECRET)',
      specialization: ['Interrogation', 'Anti-Terrorism', 'Homicide Investigation'],
      missionsCompleted: 112,
      deploymentHistory: ['26/11 Mumbai Attacks Trial', '1993 Bombay Serial Blasts Inquiry']
    },
    requests: [
      { id: 'REQ-101', type: 'EQUIPMENT', title: 'Tactical Surveillance Node Allocation', description: 'Requesting high-speed encrypted relay node access for real-time tracking.', dateSubmitted: '2024-10-25', status: 'PENDING', priority: 'CRITICAL' }
    ]
  },
  {
    id: 'IPS-1972-001',
    name: 'Dr. Kiran Bedi, IPS',
    rank: 'Director General (Retd)',
    unit: 'Police Reforms & Prison Administration',
    status: 'ACTIVE',
    image: '/officers/kiran_bedi.jpg',
    email: 'kiran.bedi@ips.gov.in',
    personal: {
      dob: '1949-06-09',
      age: 75,
      bloodGroup: 'A+',
      contact: '+91-11-2309-XXXX',
      address: 'North Block, New Delhi',
      emergencyContact: 'Navraj Bedi (Family)'
    },
    professional: {
      joinDate: '1972-07-16',
      clearanceLevel: 'LEVEL 5 (TOP SECRET)',
      specialization: ['Traffic Control', 'Prison Reform', 'Community Policing'],
      missionsCompleted: 95,
      deploymentHistory: ['Tihar Prison Administration Reform', 'Delhi Traffic Police Overhaul']
    },
    requests: [
      { id: 'REQ-205', type: 'CLEARANCE', title: 'National Rehabilitation Matrix', description: 'Requesting clearance for inmate intelligence database integration.', dateSubmitted: '2024-10-28', status: 'APPROVED', priority: 'HIGH' }
    ]
  },
  {
    id: 'IPS-1968-105',
    name: 'Ajit Doval, IPS',
    rank: 'National Security Advisor',
    unit: 'Intelligence Bureau & Counter-Operations',
    status: 'ACTIVE',
    image: '/officers/ajit_doval.jpg',
    email: 'nsa.office@gov.in',
    personal: {
      dob: '1945-01-20',
      age: 79,
      bloodGroup: 'B+',
      contact: '+91-11-2301-XXXX',
      address: 'South Block, Cabinet Secretariat, New Delhi',
      emergencyContact: 'Arunu Doval (Spouse)'
    },
    professional: {
      joinDate: '1968-07-01',
      clearanceLevel: 'LEVEL 5 (TOP SECRET)',
      specialization: ['Counter-Espionage', 'Covert Operations', 'Border Security'],
      missionsCompleted: 150,
      deploymentHistory: ['Operation Black Thunder', 'Mizo Peace Accord Intermediary', 'Kandahar Hijack Negotiation']
    },
    requests: []
  },
  {
    id: 'IPS-1987-002',
    name: 'Dr. C. Sylendra Babu, IPS',
    rank: 'Director General of Police',
    unit: 'Law & Order / Coastal Security',
    status: 'ACTIVE',
    image: '/officers/sylendra_babu.jpg',
    email: 'dgp@tnpolice.gov.in',
    personal: {
      dob: '1962-06-05',
      age: 62,
      bloodGroup: 'O+',
      contact: '+91-44-2844-XXXX',
      address: 'DGP Headquarters, Radhakrishnan Salai, Chennai',
      emergencyContact: 'Kanchana Sylendra Babu (Spouse)'
    },
    professional: {
      joinDate: '1987-08-10',
      clearanceLevel: 'LEVEL 5 (TOP SECRET)',
      specialization: ['Coastal Defense', 'Marine Police', 'Special Operations'],
      missionsCompleted: 88,
      deploymentHistory: ['Coastal Security Group Expansion', 'Cyber Crime Wing Establishment']
    },
    requests: []
  },
  {
    id: 'IPS-2000-011',
    name: 'D. Roopa, IPS',
    rank: 'Inspector General of Police',
    unit: 'Internal Vigilance & Anti-Corruption',
    status: 'ACTIVE',
    image: '/officers/d_roopa.png',
    email: 'd.roopa@ksp.gov.in',
    personal: {
      dob: '1975-07-14',
      age: 49,
      bloodGroup: 'AB+',
      contact: '+91-80-2221-XXXX',
      address: 'Karnataka State Police HQ, Bengaluru',
      emergencyContact: 'Munish Moudgil (Spouse)'
    },
    professional: {
      joinDate: '2000-09-01',
      clearanceLevel: 'LEVEL 5 (TOP SECRET)',
      specialization: ['Anti-Corruption', 'Prison Audit', 'Cyber Crime'],
      missionsCompleted: 64,
      deploymentHistory: ['Bengaluru Safe City Project', 'Parappana Agrahara Prison Probe']
    },
    requests: []
  }
];

interface PersonnelManagementProps {
  onClose: () => void;
}

export const PersonnelManagement: React.FC<PersonnelManagementProps> = ({ onClose }) => {
  const [officers, setOfficers] = useState<Officer[]>(MOCK_OFFICERS);
  const [selectedOfficerId, setSelectedOfficerId] = useState<string>(MOCK_OFFICERS[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'CLEARANCE'>('PROFILE');
  const [mobileShowList, setMobileShowList] = useState(true);

  const selectedOfficer = officers.find(o => o.id === selectedOfficerId) || officers[0];

  const filteredOfficers = officers.filter(o => 
    o.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.unit.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRequestAction = (officerId: string, requestId: string, action: 'APPROVED' | 'REJECTED') => {
    setOfficers(prev => prev.map(off => {
      if (off.id !== officerId) return off;
      return {
        ...off,
        requests: off.requests.map(req => req.id === requestId ? { ...req, status: action } : req)
      };
    }));
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'ACTIVE': return 'text-green-400 bg-green-900/20 border-green-500/50';
      case 'ON LEAVE': return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/50';
      case 'SUSPENDED': return 'text-red-400 bg-red-900/20 border-red-500/50';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-500/50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'CRITICAL': return 'text-red-500 animate-pulse font-bold';
      case 'HIGH': return 'text-orange-500 font-bold';
      case 'MEDIUM': return 'text-yellow-500';
      default: return 'text-cyan-500';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#050a14] flex flex-col font-sans animate-in fade-in duration-300 text-gray-300">
        
        {/* Header */}
        <div className="h-16 border-b border-cyan-500/20 flex justify-between items-center px-6 bg-[#0a1525] z-20 shrink-0 shadow-lg">
            <div className="flex items-center space-x-3">
                <div className="p-2 bg-cyan-900/20 rounded border border-cyan-500/30">
                    <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0c0 .883-.393 1.627-1 2.143M16 20h4M4 20h4m-5-9h16" /></svg>
                </div>
                <div>
                    <h1 className="text-lg font-bold tracking-widest uppercase text-white">Personnel & Clearance</h1>
                    <div className="text-[10px] text-cyan-500/60 font-mono tracking-widest">HR & SECURITY OVERSIGHT</div>
                </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-red-900/20 rounded text-gray-400 hover:text-red-400 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>

        <div className="flex flex-grow overflow-hidden">
            
            {/* Sidebar List */}
            <div className={`w-full md:w-96 bg-[#0a1525]/90 border-r border-cyan-500/20 flex flex-col z-10 shrink-0 ${mobileShowList ? 'flex' : 'hidden md:flex'}`}>
                <div className="p-4 border-b border-cyan-500/10">
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="SEARCH OFFICER..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#050a14] border border-cyan-500/30 rounded px-3 py-2 pl-9 text-sm font-mono text-cyan-100 focus:outline-none focus:border-cyan-400 placeholder-cyan-800"
                        />
                        <svg className="w-4 h-4 text-cyan-700 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                </div>
                
                <div className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-900/50">
                    {filteredOfficers.map(officer => (
                        <div 
                            key={officer.id}
                            onClick={() => {
                                setSelectedOfficerId(officer.id);
                                setMobileShowList(false);
                            }}
                            className={`p-4 border-b border-cyan-500/10 cursor-pointer transition-all hover:bg-cyan-900/10 group relative ${selectedOfficerId === officer.id ? 'bg-cyan-900/20 border-l-4 border-l-cyan-400' : 'border-l-4 border-l-transparent'}`}
                        >
                            <div className="flex items-center space-x-4">
                                <OfficerImage src={officer.image} name={officer.name} className={`w-12 h-12 rounded-md object-cover border ${selectedOfficerId === officer.id ? 'border-cyan-400' : 'border-gray-600 group-hover:border-cyan-500/50'}`} />
                                <div className="flex-grow min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h3 className={`text-sm font-bold truncate ${selectedOfficerId === officer.id ? 'text-white' : 'text-gray-300'}`}>{officer.name}</h3>
                                        {officer.requests.some(r => r.status === 'PENDING') && (
                                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" title="Pending Request"></span>
                                        )}
                                    </div>
                                    <div className="text-xs text-cyan-500/70 font-mono mb-1">{officer.rank} • {officer.id}</div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] text-gray-500 truncate max-w-[120px]">{officer.unit}</span>
                                        <span className={`text-[9px] px-1.5 py-0.5 rounded border ${getStatusColor(officer.status)}`}>{officer.status}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="p-3 bg-[#050a14] border-t border-cyan-500/20 text-center text-[10px] text-cyan-500/40 font-mono">
                    {filteredOfficers.length} RECORDS FOUND
                </div>
            </div>

            {/* Main Content */}
            <div className={`flex-grow bg-[#050a14] flex flex-col relative overflow-hidden ${mobileShowList ? 'hidden md:flex' : 'flex'}`}>
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

                {/* Profile Header */}
                <div className="p-4 md:p-8 pb-0 relative z-10">
                    {!mobileShowList && (
                        <button 
                            onClick={() => setMobileShowList(true)}
                            className="md:hidden mb-4 flex items-center space-x-1 text-cyan-400 font-mono text-xs uppercase"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            <span>Back to Officers</span>
                        </button>
                    )}
                    <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:space-x-6 mb-6">
                        <div className="relative group shrink-0">
                            <div className="absolute -inset-0.5 bg-cyan-500/30 rounded-lg blur opacity-50 group-hover:opacity-100 transition duration-500"></div>
                            <OfficerImage src={selectedOfficer.image} name={selectedOfficer.name} className="relative w-32 h-32 rounded-lg object-cover border-2 border-cyan-500/50 shadow-2xl" />
                        </div>
                        <div className="flex-grow w-full text-center sm:text-left">
                            <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-4">
                                <div>
                                    <div className="flex flex-col sm:flex-row items-center gap-2 sm:space-x-3 mb-1">
                                        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-wide">{selectedOfficer.name}</h2>
                                        <span className={`px-2 py-0.5 text-xs font-bold rounded border ${getStatusColor(selectedOfficer.status)}`}>{selectedOfficer.status}</span>
                                    </div>
                                    <div className="text-cyan-400 font-mono text-base sm:text-lg mb-2">{selectedOfficer.rank} // {selectedOfficer.id}</div>
                                    <div className="text-gray-400 text-xs sm:text-sm flex flex-col sm:flex-row items-center gap-2 sm:space-x-4 justify-center sm:justify-start">
                                        <span className="flex items-center"><svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> {selectedOfficer.unit}</span>
                                        <span className="flex items-center"><svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> {selectedOfficer.email}</span>
                                    </div>
                                </div>
                                <div className="text-center sm:text-right">
                                    <div className="text-[10px] text-cyan-500/60 font-mono uppercase tracking-widest mb-1">Clearance Level</div>
                                    <div className="text-base sm:text-xl font-bold text-red-500 font-mono border border-red-500/30 px-3 py-1 rounded bg-red-900/10 inline-block">{selectedOfficer.professional.clearanceLevel}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex space-x-1 border-b border-cyan-500/20">
                        <button 
                            onClick={() => setActiveTab('PROFILE')}
                            className={`px-6 py-3 text-xs font-bold tracking-widest uppercase transition-all ${activeTab === 'PROFILE' ? 'bg-cyan-500/10 text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                        >
                            Personnel Dossier
                        </button>
                        <button 
                            onClick={() => setActiveTab('CLEARANCE')}
                            className={`px-6 py-3 text-xs font-bold tracking-widest uppercase transition-all flex items-center space-x-2 ${activeTab === 'CLEARANCE' ? 'bg-cyan-500/10 text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                        >
                            <span>Clearance & Requests</span>
                            {selectedOfficer.requests.filter(r => r.status === 'PENDING').length > 0 && (
                                <span className="bg-red-500 text-white text-[9px] px-1.5 rounded-full ml-1">{selectedOfficer.requests.filter(r => r.status === 'PENDING').length}</span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="flex-grow overflow-y-auto p-8 relative z-10">
                    {activeTab === 'PROFILE' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4 duration-300">
                            {/* Personal Details */}
                            <div className="bg-[#0a1525]/50 border border-cyan-500/20 rounded p-6">
                                <h3 className="text-cyan-500/70 font-mono text-xs uppercase tracking-[0.2em] mb-6 border-b border-cyan-500/10 pb-2">Personal Information</h3>
                                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                                    <div>
                                        <div className="text-[10px] text-gray-500 uppercase mb-1">Date of Birth</div>
                                        <div className="text-white font-medium">{selectedOfficer.personal.dob} (Age: {selectedOfficer.personal.age})</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-gray-500 uppercase mb-1">Blood Group</div>
                                        <div className="text-red-400 font-bold">{selectedOfficer.personal.bloodGroup}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-gray-500 uppercase mb-1">Contact Number</div>
                                        <div className="text-white font-mono">{selectedOfficer.personal.contact}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-gray-500 uppercase mb-1">Emergency Contact</div>
                                        <div className="text-white">{selectedOfficer.personal.emergencyContact}</div>
                                    </div>
                                    <div className="col-span-2">
                                        <div className="text-[10px] text-gray-500 uppercase mb-1">Residential Address</div>
                                        <div className="text-white">{selectedOfficer.personal.address}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Professional Details */}
                            <div className="bg-[#0a1525]/50 border border-cyan-500/20 rounded p-6">
                                <h3 className="text-cyan-500/70 font-mono text-xs uppercase tracking-[0.2em] mb-6 border-b border-cyan-500/10 pb-2">Service Record</h3>
                                <div className="space-y-6">
                                    <div className="flex justify-between">
                                        <div>
                                            <div className="text-[10px] text-gray-500 uppercase mb-1">Date of Joining</div>
                                            <div className="text-white">{selectedOfficer.professional.joinDate}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] text-gray-500 uppercase mb-1">Missions Completed</div>
                                            <div className="text-green-400 font-bold text-xl">{selectedOfficer.professional.missionsCompleted}</div>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <div className="text-[10px] text-gray-500 uppercase mb-2">Specializations</div>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedOfficer.professional.specialization.map(spec => (
                                                <span key={spec} className="px-2 py-1 bg-cyan-900/30 text-cyan-300 border border-cyan-500/30 rounded text-xs">
                                                    {spec}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-[10px] text-gray-500 uppercase mb-2">Deployment History</div>
                                        <ul className="space-y-1">
                                            {selectedOfficer.professional.deploymentHistory.map((dep, i) => (
                                                <li key={i} className="text-sm text-gray-300 flex items-center">
                                                    <span className="w-1.5 h-1.5 bg-gray-500 rounded-full mr-2"></span>
                                                    {dep}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'CLEARANCE' && (
                        <div className="animate-in slide-in-from-bottom-4 duration-300 space-y-6">
                            
                            {/* Pending Requests Section */}
                            <div>
                                <h3 className="text-yellow-500 font-mono text-xs uppercase tracking-[0.2em] mb-4 flex items-center">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    Pending Actions
                                </h3>
                                
                                {selectedOfficer.requests.filter(r => r.status === 'PENDING').length === 0 ? (
                                    <div className="p-8 border border-dashed border-gray-700 rounded text-center text-gray-500 text-sm font-mono">
                                        NO PENDING REQUESTS
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {selectedOfficer.requests.filter(r => r.status === 'PENDING').map(req => (
                                            <div key={req.id} className="bg-yellow-900/10 border border-yellow-500/30 p-6 rounded flex justify-between items-start group hover:bg-yellow-900/20 transition-colors">
                                                <div className="space-y-2">
                                                    <div className="flex items-center space-x-3">
                                                        <span className="text-lg font-bold text-white">{req.title}</span>
                                                        <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded border border-gray-600">{req.type}</span>
                                                        <span className={`text-[10px] uppercase tracking-wider ${getPriorityColor(req.priority)}`}>{req.priority} PRIORITY</span>
                                                    </div>
                                                    <p className="text-sm text-gray-300 max-w-2xl">{req.description}</p>
                                                    <div className="text-[10px] text-gray-500 font-mono pt-2">SUBMITTED: {req.dateSubmitted} | REF: {req.id}</div>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <button 
                                                        onClick={() => handleRequestAction(selectedOfficer.id, req.id, 'APPROVED')}
                                                        className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded flex items-center space-x-1 transition-colors shadow-lg"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                        <span>APPROVE</span>
                                                    </button>
                                                    <button 
                                                        onClick={() => handleRequestAction(selectedOfficer.id, req.id, 'REJECTED')}
                                                        className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded flex items-center space-x-1 transition-colors shadow-lg"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                        <span>REJECT</span>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Request History */}
                            <div className="pt-6 border-t border-cyan-500/10">
                                <h3 className="text-cyan-500/60 font-mono text-xs uppercase tracking-[0.2em] mb-4">Request History</h3>
                                <div className="bg-[#0a1525]/30 rounded border border-cyan-500/10 overflow-hidden">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-[#0f1c2e] text-xs text-gray-400 font-mono uppercase">
                                            <tr>
                                                <th className="px-4 py-3 font-medium">Date</th>
                                                <th className="px-4 py-3 font-medium">Type</th>
                                                <th className="px-4 py-3 font-medium">Title</th>
                                                <th className="px-4 py-3 font-medium text-right">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-cyan-500/10">
                                            {selectedOfficer.requests.filter(r => r.status !== 'PENDING').length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} className="px-4 py-8 text-center text-gray-600 font-mono text-xs">NO HISTORY AVAILABLE</td>
                                                </tr>
                                            ) : (
                                                selectedOfficer.requests.filter(r => r.status !== 'PENDING').map(req => (
                                                    <tr key={req.id} className="hover:bg-white/5 transition-colors">
                                                        <td className="px-4 py-3 text-gray-400 font-mono text-xs">{req.dateSubmitted}</td>
                                                        <td className="px-4 py-3 text-gray-300 text-xs">{req.type}</td>
                                                        <td className="px-4 py-3 text-white font-medium">{req.title}</td>
                                                        <td className="px-4 py-3 text-right">
                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${req.status === 'APPROVED' ? 'bg-green-900/30 text-green-400 border border-green-500/30' : 'bg-red-900/30 text-red-400 border border-red-500/30'}`}>
                                                                {req.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                        </div>
                    )}
                </div>

            </div>
        </div>
    </div>
  );
};
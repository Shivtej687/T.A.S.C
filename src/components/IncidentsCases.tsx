import React, { useState, useEffect, useRef } from 'react';
import { Case, CASES_DATABASE } from '../data/casesData';
import { syncEvidenceFromCases } from '../utils/crypto';
import { AddCaseModal } from './AddCaseModal';
import { CctnsFeedWidget } from './CctnsFeedWidget';

// Lightweight visual helper component for handling officer images with fallbacks
const OfficerImage: React.FC<{ src?: string; name: string; className?: string }> = ({ src, name, className }) => {
  const [error, setError] = useState(false);
  const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  if (!src || error) {
    return (
      <div className={`bg-gradient-to-br from-cyan-950 to-slate-900 flex items-center justify-center text-cyan-400 font-mono text-sm font-bold border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.15)] ${className}`}>
        {initials}
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={name} 
      onError={() => setError(true)} 
      className={`object-cover border border-cyan-500/20 shadow-md ${className}`} 
      referrerPolicy="no-referrer"
    />
  );
};

interface IncidentsCasesProps {
  onClose: () => void;
}

export const IncidentsCases: React.FC<IncidentsCasesProps> = ({ onClose }) => {
  const [casesList, setCasesList] = useState<Case[]>([]);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'SOLVED' | 'PENDING'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'DETAILS' | 'MAP'>('DETAILS');
  const [mobileView, setMobileView] = useState<'LIST' | 'DETAILS'>('LIST');
  
  // Modals & Popups
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false);
  const [currentEvidenceUrl, setCurrentEvidenceUrl] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const dossierRef = useRef<HTMLDivElement>(null);

  // Load cases from LocalStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('tasc_cases');
    let loaded: Case[] = [];
    if (stored) {
      try {
        loaded = JSON.parse(stored);
        // Safeguard to update old Unsplash links to real local officer images
        loaded = loaded.map(item => {
          const matchedDbCase = CASES_DATABASE.find(dbCase => dbCase.id === item.id);
          if (matchedDbCase && item.officer.image.includes('unsplash.com')) {
            return {
              ...item,
              officer: {
                ...item.officer,
                image: matchedDbCase.officer.image
              }
            };
          }
          return item;
        });
        localStorage.setItem('tasc_cases', JSON.stringify(loaded));
      } catch (e) {
        loaded = CASES_DATABASE;
      }
    } else {
      loaded = CASES_DATABASE;
      localStorage.setItem('tasc_cases', JSON.stringify(CASES_DATABASE));
    }
    setCasesList(loaded);
    if (loaded.length > 0) {
      setSelectedCase(loaded[0]);
    }
    // Perform initial cryptographic sync to blockchain vault
    syncEvidenceFromCases(loaded);
  }, []);

  // Map Instance Effect
  useEffect(() => {
    // Cleanup map when switching cases, views or closing
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (viewMode === 'MAP' && mapContainerRef.current && !mapInstanceRef.current && window.L && selectedCase) {
      const map = window.L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
        center: [selectedCase.lat, selectedCase.lng],
        zoom: 13,
      });

      // Google Satellite Hybrid Tiles
      window.L.tileLayer('http://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
      }).addTo(map);

      window.L.control.attribution({ position: 'bottomright', prefix: false })
        .addAttribution('Incident Reconnaissance Data').addTo(map);

      // Custom Pulse Icon
      const icon = window.L.divIcon({
          className: 'case-marker',
          html: `
            <div class="relative flex items-center justify-center w-8 h-8">
                <div class="absolute w-full h-full bg-red-500/30 rounded-full animate-ping"></div>
                <div class="absolute w-4 h-4 bg-red-600 border-2 border-white rounded-full shadow-[0_0_10px_red]"></div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
      });

      window.L.marker([selectedCase.lat, selectedCase.lng], { icon })
        .addTo(map)
        .bindPopup(`
            <div class="font-sans">
                <div class="font-bold text-red-600">${selectedCase.id}</div>
                <div class="text-xs font-bold">${selectedCase.title}</div>
            </div>
        `)
        .openPopup();

      mapInstanceRef.current = map;
    } else if (viewMode === 'MAP' && mapInstanceRef.current && selectedCase) {
        // Fly to new location if map exists
        mapInstanceRef.current.flyTo([selectedCase.lat, selectedCase.lng], 14, { duration: 1.5 });
    }
  }, [viewMode, selectedCase]);

  // Filter & Search Cases
  const filteredCases = casesList.filter(c => {
    const matchesFilter = filter === 'ALL' || c.status === filter;
    const matchesSearch = c.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-red-500 border-red-500/50 bg-red-900/10 shadow-[0_0_10px_rgba(239,68,68,0.2)]';
      case 'SOLVED': return 'text-green-500 border-green-500/50 bg-green-900/10 shadow-[0_0_10px_rgba(34,197,94,0.2)]';
      case 'PENDING': return 'text-orange-500 border-orange-500/50 bg-orange-900/10 shadow-[0_0_10px_rgba(249,115,22,0.2)]';
      default: return 'text-gray-500';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-600 animate-pulse';
      case 'HIGH': return 'bg-orange-500';
      case 'MEDIUM': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  const handleEvidenceClick = (url: string) => {
    setCurrentEvidenceUrl(url);
    setEvidenceModalOpen(true);
  };

  // Add Case Submission Handler
  const handleSaveCase = (newCase: Case) => {
    const updatedList = [newCase, ...casesList];
    setCasesList(updatedList);
    localStorage.setItem('tasc_cases', JSON.stringify(updatedList));
    setSelectedCase(newCase);
    setViewMode('DETAILS');

    // Sync all new evidence instantly to the secure blockchain evidence vault
    syncEvidenceFromCases(updatedList);
  };

  // Automated Case Arrival Feed Integration
  const handleCctnsCaseArrived = (newCase: Case) => {
    // Check if duplicate
    if (casesList.some(c => c.id === newCase.id)) return;

    const updatedList = [newCase, ...casesList];
    setCasesList(updatedList);
    localStorage.setItem('tasc_cases', JSON.stringify(updatedList));
    setSelectedCase(newCase);
    setViewMode('DETAILS');
    setMobileView('DETAILS');

    // Automatically mine new blockchain block for evidence in the vault
    syncEvidenceFromCases(updatedList);
  };

  const handleExportPDF = () => {
    if (!dossierRef.current || !window.html2pdf || !selectedCase) return;
    setIsExporting(true);
    
    const element = dossierRef.current;
    const clone = element.cloneNode(true) as HTMLElement;
    
    // Create Header for PDF
    const headerDiv = document.createElement('div');
    headerDiv.innerHTML = `
        <div style="border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end;">
            <div>
                <h1 style="font-size: 24px; font-weight: bold; margin: 0; font-family: sans-serif;">T.A.S.C. INCIDENT DOSSIER</h1>
                <p style="font-size: 14px; margin: 5px 0 0 0; font-family: monospace;">CASE ID: ${selectedCase.id}</p>
            </div>
            <div style="text-align: right;">
                <p style="font-size: 10px; font-family: monospace; margin: 0;">CLASSIFIED: LEVEL ${selectedCase.officer.clearance}</p>
                <p style="font-size: 10px; font-family: monospace; margin: 0;">DATE: ${new Date().toLocaleDateString()}</p>
            </div>
        </div>
    `;
    clone.insertBefore(headerDiv, clone.firstChild);
    
    // Style adjustments for PDF
    clone.classList.add('pdf-export-container');
    clone.style.padding = '40px';
    clone.style.background = 'white';
    clone.style.color = 'black';
    clone.style.fontFamily = 'sans-serif';

    // Remove interactive elements like buttons
    const buttons = clone.querySelectorAll('button');
    buttons.forEach(b => b.style.display = 'none');
    
    const opt = {
        margin: 10,
        filename: `CASE_${selectedCase.id}_DOSSIER.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    window.html2pdf().from(clone).set(opt).save()
        .then(() => setIsExporting(false))
        .catch((e: any) => {
            console.error(e);
            setIsExporting(false);
        });
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#050a14] flex flex-col animate-in fade-in duration-300 font-sans">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.03)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none"></div>

      {/* Header */}
      <div className="h-16 bg-[#0a1525] border-b border-cyan-500/20 flex items-center justify-between px-3 md:px-6 z-10 shrink-0 shadow-lg">
        <div className="flex items-center space-x-2 md:space-x-4">
          {mobileView === 'DETAILS' && (
            <button 
              onClick={() => setMobileView('LIST')} 
              className="md:hidden p-1.5 bg-cyan-900/20 border border-cyan-500/30 rounded text-cyan-400"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
          )}
          <div className="p-1.5 md:p-2 bg-cyan-900/20 border border-cyan-500/30 rounded">
            <svg className="w-5 h-5 md:w-6 md:h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v8a2 2 0 01-2 2H5z" /></svg>
          </div>
          <div>
            <h1 className="text-sm md:text-xl font-bold text-white tracking-widest uppercase">Incidents & Cases</h1>
            <div className="text-[8px] md:text-[10px] text-cyan-500/60 font-mono tracking-[0.2em] uppercase">Digital Dossier System v2.5</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 md:space-x-6">
            <div className="flex space-x-1 bg-[#050a14]/50 p-1 rounded-lg border border-cyan-500/10 overflow-x-auto">
                {['ALL', 'ACTIVE', 'PENDING', 'SOLVED'].map((f) => (
                    <button 
                        key={f}
                        onClick={() => { setFilter(f as any); setViewMode('DETAILS'); setMobileView('LIST'); }}
                        className={`px-2 md:px-4 py-1 md:py-1.5 text-[8px] md:text-[10px] font-mono font-bold tracking-wider rounded transition-all ${filter === f ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-[0_0_10px_rgba(34,211,238,0.1)]' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        {f}
                    </button>
                ))}
            </div>
            <button onClick={onClose} className="p-1.5 md:p-2 hover:bg-red-900/20 rounded text-gray-400 hover:text-red-400 transition-colors">
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>
      </div>

      {/* Main Content Split */}
      <div className="flex-grow flex overflow-hidden relative z-10">
        
        {/* Left Sidebar - Case List */}
        <div className={`w-full md:w-[400px] bg-[#0a1525]/70 border-r border-cyan-500/20 flex flex-col overflow-hidden backdrop-blur-md z-20 ${mobileView === 'LIST' ? 'flex' : 'hidden md:flex'}`}>
            
            {/* National CCTNS Police Dispatch System (Live countdown/radar) */}
            <div className="p-3 bg-[#060c15]/60 border-b border-cyan-500/10">
              <CctnsFeedWidget onCaseArrived={handleCctnsCaseArrived} existingCases={casesList} />
            </div>

            {/* Registration Action Controls */}
            <div className="p-3 bg-[#0a1525]/80 border-b border-cyan-500/10 flex flex-col gap-2">
              <button
                onClick={() => setAddModalOpen(true)}
                className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-mono text-[10px] font-bold uppercase tracking-[0.15em] rounded shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                <span>REGISTER NEW CASE DOSSIER</span>
              </button>
            </div>

            {/* Search filter input */}
            <div className="p-3 border-b border-cyan-500/10 bg-[#0a1525]/40">
                <div className="relative">
                    <input 
                      type="text" 
                      placeholder="SEARCH ID, TITLE, STATE..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-[#050a14] border border-cyan-500/20 rounded px-4 py-2 text-xs text-cyan-100 placeholder-cyan-800/50 focus:outline-none focus:border-cyan-500/50 font-mono uppercase tracking-wider" 
                    />
                    <svg className="w-3.5 h-3.5 text-cyan-700 absolute right-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
            </div>

            {/* Records list */}
            <div className="flex-grow overflow-y-auto p-3 space-y-2.5 scrollbar-hide bg-[#050a14]/20">
                {filteredCases.map((c) => (
                    <div 
                        key={c.id}
                        onClick={() => { setSelectedCase(c); setMobileView('DETAILS'); if(viewMode === 'MAP') setViewMode('DETAILS'); }}
                        className={`p-3.5 rounded border cursor-pointer transition-all duration-300 group relative overflow-hidden ${selectedCase?.id === c.id ? 'bg-cyan-950/40 border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.1)]' : 'bg-[#050a14]/40 border-cyan-500/10 hover:border-cyan-500/30 hover:bg-[#050a14]/60'}`}
                    >
                        {selectedCase?.id === c.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400 shadow-[0_0_10px_cyan]"></div>}
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-cyan-500/70 font-mono text-[9px] tracking-wider">{c.id}</span>
                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border ${getStatusColor(c.status)}`}>{c.status}</span>
                        </div>
                        <h3 className={`font-bold text-xs mb-1 group-hover:text-cyan-300 transition-colors line-clamp-2 ${selectedCase?.id === c.id ? 'text-white' : 'text-gray-300'}`}>{c.title}</h3>
                        
                        {c.originState && (
                          <div className="text-[8px] font-mono text-cyan-400/80 uppercase tracking-widest mb-1.5 flex items-center">
                            <span className="w-1 h-1 bg-cyan-400 rounded-full mr-1"></span>
                            {c.originState} Police Feed
                          </div>
                        )}

                        <div className="flex justify-between items-center text-[9px] text-gray-500 font-mono">
                            <span className="truncate max-w-[120px]">{c.type}</span>
                            <span>{c.date}</span>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="p-3 border-t border-cyan-500/10 text-center text-[10px] text-cyan-500/30 font-mono bg-[#0a1525]">
                {filteredCases.length} RECORDS COMPILATED
            </div>
        </div>

        {/* Right Content - Detail View OR Map View */}
        <div className={`flex-grow bg-[#050a14]/90 relative overflow-hidden ${mobileView === 'DETAILS' ? 'block' : 'hidden md:block'}`}>
             
             {/* MAP VIEW OVERLAY */}
             {viewMode === 'MAP' && selectedCase && (
                  <div className="absolute inset-0 z-30 flex flex-col animate-in fade-in duration-500">
                    <div ref={mapContainerRef} className="absolute inset-0 z-0 bg-black"></div>
                    
                    {/* Map UI Overlays */}
                    <div className="absolute top-0 left-0 right-0 p-4 z-10 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
                         <div className="flex flex-col">
                              <div className="text-red-500 font-mono text-xs tracking-widest uppercase animate-pulse mb-1">LIVE SATELLITE RECON RECEPTOR</div>
                              <div className="text-white text-lg font-bold">{selectedCase.location}</div>
                              <div className="text-cyan-500/60 text-xs font-mono mt-1">LAT: {selectedCase.lat} / LNG: {selectedCase.lng}</div>
                         </div>
                         <button 
                            onClick={() => setViewMode('DETAILS')}
                            className="pointer-events-auto px-4 py-2 bg-black/80 border border-cyan-500/50 text-cyan-400 font-mono text-xs hover:bg-cyan-900/30 transition-colors flex items-center space-x-2 rounded"
                         >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" /></svg>
                            <span>BACK TO DOSSIER</span>
                         </button>
                    </div>

                    {/* Scanlines on Map */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none z-0"></div>
                  </div>
             )}

             {/* DETAILS VIEW */}
             {viewMode === 'DETAILS' && selectedCase ? (
                  <div className="h-full overflow-y-auto p-4 md:p-8 animate-in slide-in-from-right-4 duration-500">
                     <div ref={dossierRef} className="max-w-5xl mx-auto space-y-6 md:space-y-8">
                         {/* Title Section */}
                         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-cyan-500/20 pb-6 gap-4">
                             <div>
                                 <div className="flex flex-wrap items-center gap-2 mb-2">
                                     <span className="text-cyan-500/50 font-mono text-base md:text-lg">{selectedCase.id}</span>
                                     <span className={`px-2 py-0.5 rounded text-[9px] md:text-[10px] font-bold tracking-widest text-white ${getSeverityColor(selectedCase.severity)}`}>SEVERITY: {selectedCase.severity}</span>
                                 </div>
                                 <h2 className="text-2xl md:text-4xl font-bold text-white tracking-wide drop-shadow-lg">{selectedCase.title}</h2>
                             </div>
                             <div className="text-left sm:text-right">
                                 <div className="text-cyan-400 text-[10px] md:text-xs font-mono tracking-widest uppercase mb-1">Current Status</div>
                                 <div className={`text-xl md:text-2xl font-bold font-mono ${selectedCase.status === 'ACTIVE' ? 'text-red-500 drop-shadow-[0_0_8px_red]' : selectedCase.status === 'SOLVED' ? 'text-green-500 drop-shadow-[0_0_8px_green]' : 'text-orange-500'}`}>{selectedCase.status}</div>
                             </div>
                         </div>
  
                         {/* Stats Grid */}
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                             {/* Handling Officer Card */}
                             <div className="col-span-1 bg-[#0a1525]/60 border border-cyan-500/20 p-5 rounded-lg backdrop-blur-sm relative overflow-hidden group">
                                 <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-40 transition-opacity">
                                     <svg className="w-16 h-16 text-cyan-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                                 </div>
                                 <div className="text-[10px] text-cyan-500/60 font-mono tracking-widest uppercase mb-4 border-b border-cyan-500/10 pb-2">HANDLING DETECTIVE</div>
                                 <div className="flex items-center space-x-4">
                                     <OfficerImage src={selectedCase.officer.image} name={selectedCase.officer.name} className="w-16 h-16 rounded-md object-cover border border-cyan-500/40" />
                                     <div>
                                         <div className="text-white font-bold text-sm leading-tight">{selectedCase.officer.name}</div>
                                         <div className="text-cyan-400 text-xs font-mono mt-0.5">{selectedCase.officer.rank}</div>
                                         <div className="text-gray-500 text-[10px] mt-1">{selectedCase.officer.unit}</div>
                                     </div>
                                 </div>
                                 <div className="mt-4 flex justify-between items-center text-[10px] font-mono bg-[#050a14] p-2 rounded border border-cyan-500/10">
                                     <span className="text-gray-500">ID: {selectedCase.officer.id}</span>
                                     <span className="text-yellow-500">{selectedCase.officer.clearance} CLEARANCE</span>
                                 </div>
                             </div>
  
                             {/* Location & Details */}
                             <div className="col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                 <div className="bg-[#0a1525]/40 border border-cyan-500/10 p-4 rounded hover:border-cyan-500/30 transition-colors">
                                     <div className="text-[10px] text-cyan-500/50 font-mono uppercase mb-1">INCIDENT TYPE</div>
                                     <div className="text-white text-base md:text-lg">{selectedCase.type}</div>
                                 </div>
                                 <div className="bg-[#0a1525]/40 border border-cyan-500/10 p-4 rounded hover:border-cyan-500/30 transition-colors">
                                     <div className="text-[10px] text-cyan-500/50 font-mono uppercase mb-1">DATE OF INCIDENT</div>
                                     <div className="text-white text-base md:text-lg">{selectedCase.date}</div>
                                 </div>
                                 <div className="col-span-1 sm:col-span-2 bg-[#0a1525]/40 border border-cyan-500/10 p-4 rounded hover:border-cyan-500/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                     <div>
                                         <div className="text-[10px] text-cyan-500/50 font-mono uppercase mb-1">LOCATION COORDINATES</div>
                                         <div className="text-white text-sm md:text-lg flex items-center">
                                             <svg className="w-4 h-4 text-red-400 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                             <span className="truncate">{selectedCase.location}</span>
                                         </div>
                                     </div>
                                     <button 
                                         onClick={() => setViewMode('MAP')}
                                         className="px-3 py-1.5 bg-cyan-900/20 text-cyan-400 text-[10px] border border-cyan-500/20 rounded hover:bg-cyan-500/20 transition-colors flex items-center justify-center space-x-2 shrink-0"
                                     >
                                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                                         <span>VIEW SATELLITE RECON</span>
                                     </button>
                                 </div>
                             </div>
                         </div>
 
                         {/* Briefing */}
                         <div className="bg-[#0a1525]/30 border border-cyan-500/20 p-6 rounded relative">
                             <div className="absolute top-0 left-0 w-2 h-full bg-cyan-500/10"></div>
                             <h3 className="text-cyan-400 font-mono text-sm tracking-widest uppercase mb-4 flex items-center">
                                 <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                 MISSION BRIEF / INCIDENT REPORT
                             </h3>
                             <p className="text-gray-300 leading-relaxed text-sm font-sans whitespace-pre-line">
                                 {selectedCase.description}
                             </p>
                         </div>
 
                         {/* Evidence / Assets */}
                         <div>
                             <h3 className="text-cyan-500/60 font-mono text-xs tracking-widest uppercase mb-4 pl-2 border-l-2 border-cyan-500/30">DIGITAL ASSETS & IMMUTABLE EVIDENCE (SYNCED TO VAULT)</h3>
                             {selectedCase.evidence && selectedCase.evidence.length > 0 ? (
                                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                     {selectedCase.evidence.map((img: string, idx: number) => (
                                         <div 
                                             key={idx} 
                                             onClick={() => handleEvidenceClick(img)}
                                             className="relative aspect-video rounded overflow-hidden border border-cyan-500/20 group cursor-pointer hover:border-cyan-500/60 hover:shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-all bg-[#03070f]"
                                         >
                                             <div className="absolute inset-0 bg-cyan-900/20 group-hover:bg-transparent transition-colors z-10"></div>
                                             <img src={img} alt="Evidence" className="w-full h-full object-cover filter brightness-90 saturate-75 group-hover:filter-none transition-all duration-500" referrerPolicy="no-referrer" />
                                             <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-1 text-[9px] text-cyan-400 font-mono z-20 flex justify-between items-center px-2">
                                                 <span>EVIDENCE_IMG_{idx + 101}</span>
                                                 <svg className="w-3 h-3 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                                             </div>
                                         </div>
                                     ))}
                                 </div>
                             ) : (
                                 <div className="w-full py-8 border border-dashed border-cyan-500/10 rounded flex items-center justify-center text-gray-500 text-xs font-mono">
                                     NO DIGITAL ASSETS ATTACHED
                                 </div>
                             )}
                         </div>
                         
                         {/* Action Footer */}
                         <div className="flex justify-between items-center pt-8 border-t border-cyan-500/10">
                              <button 
                                 onClick={handleExportPDF}
                                 disabled={isExporting}
                                 className="flex items-center space-x-2 px-6 py-2 bg-black border border-cyan-500/30 text-cyan-400 text-xs font-mono rounded hover:bg-cyan-900/20 hover:border-cyan-400 transition-colors uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                 {isExporting ? <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div> : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                                 <span>{isExporting ? 'EXPORTING...' : 'EXPORT DOSSIER PDF'}</span>
                              </button>

                              <div className="flex space-x-4">
                                 <button className="px-6 py-2 bg-transparent border border-gray-600 text-gray-400 text-xs font-mono rounded hover:bg-gray-800 transition-colors uppercase tracking-wider">
                                     Archive Case
                                 </button>
                                 <button 
                                    onClick={() => setAddModalOpen(true)}
                                    className="px-6 py-2 bg-cyan-600/20 border border-cyan-500/50 text-cyan-400 text-xs font-mono rounded hover:bg-cyan-600/40 hover:text-white transition-colors uppercase tracking-wider flex items-center space-x-2"
                                 >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                    <span>Register Another</span>
                                 </button>
                             </div>
                         </div>

                     </div>
                  </div>
             ) : !selectedCase ? (
                  <div className="flex flex-col items-center justify-center h-full text-cyan-500/30">
                      <svg className="w-24 h-24 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      <p className="font-mono tracking-widest text-sm">SELECT A CASE TO VIEW DOSSIER</p>
                  </div>
             ) : null}
        </div>
      </div>

      {/* Add New Case Modal */}
      <AddCaseModal 
        isOpen={addModalOpen} 
        onClose={() => setAddModalOpen(false)} 
        onSave={handleSaveCase} 
      />

      {/* Evidence Modal / Lightbox */}
      {evidenceModalOpen && (
          <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-8 animate-in fade-in duration-300">
             <button 
                onClick={() => setEvidenceModalOpen(false)}
                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-white bg-white/10 rounded-full transition-colors z-50"
             >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
             </button>
             
             <div className="relative max-w-5xl max-h-full flex flex-col items-center">
                 <div className="text-cyan-500 text-xs font-mono tracking-[0.3em] uppercase mb-4 animate-pulse">CLASSIFIED RECON ASSET // SECURITY LEVEL HIGH</div>
                 <img src={currentEvidenceUrl} className="max-h-[80vh] object-contain border border-cyan-500/30 shadow-[0_0_50px_rgba(34,211,238,0.1)] rounded-lg" alt="Evidence Fullscreen" referrerPolicy="no-referrer" />
                 
                 <div className="mt-6 flex space-x-8 text-xs font-mono text-gray-400 bg-black/50 px-6 py-3 rounded-full border border-gray-800">
                     <div>
                          <span className="block text-gray-600 text-[10px] uppercase">Asset Status</span>
                          <span className="text-green-400 font-bold">VERIFIED REAL IMAGE</span>
                     </div>
                     <div>
                          <span className="block text-gray-600 text-[10px] uppercase">Storage Mode</span>
                          <span className="text-white">BLOCKCHAIN IMMUTABLE</span>
                     </div>
                     <div>
                          <span className="block text-gray-600 text-[10px] uppercase">Security Level</span>
                          <span className="text-red-500 font-bold">CLASSIFIED TASC</span>
                     </div>
                 </div>
             </div>
          </div>
      )}

    </div>
  );
};

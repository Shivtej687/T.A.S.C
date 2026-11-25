import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Criminal, 
  FateType, 
  Status, 
  DangerLevel, 
  INDIAN_CRIMINALS_DATABASE,
  RAW_CRIMINALS_DATABASE,
  CRIMINAL_PHOTO_BUNDLE,
  getEmbeddedCriminalPhoto
} from '../data/criminalData';

declare global {
  interface Window {
    html2pdf: any;
  }
}

interface CriminalRecordsProps {
  onClose: () => void;
  onOpenBiometricLab?: (criminalId: string) => void;
  initialCriminalId?: string | null;
}

const STORAGE_KEY = 'tasc_criminal_records_master_db_v3';

// Serve criminal photograph directly from embedded bundle / local static storage with fallback chain
const getSafeImageUrl = (criminal: Criminal) => {
  if (criminal.image && (criminal.image.startsWith('data:') || criminal.image.startsWith('/photos/'))) {
    return criminal.image;
  }
  const embedded = getEmbeddedCriminalPhoto(criminal.id);
  if (embedded) return embedded;
  return `/photos/${criminal.id}.jpg`;
};

const handleImgError = (e: React.SyntheticEvent<HTMLImageElement, Event>, criminal: Criminal) => {
  const target = e.currentTarget;
  
  // 1. Try embedded bundle photo
  const embedded = getEmbeddedCriminalPhoto(criminal.id);
  if (embedded && target.src !== embedded) {
    target.src = embedded;
    return;
  }

  // 2. Try static local file
  if (!target.src.includes(`/photos/${criminal.id}.jpg`)) {
    target.src = `/photos/${criminal.id}.jpg`;
    return;
  }

  // 3. Try dedicated API endpoint
  if (!target.src.includes('/api/photo/')) {
    target.src = `/api/photo/${criminal.id}`;
    return;
  }

  // 4. Fallback: High-resolution police forensic placard
  target.onerror = null;
  target.src = `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 360" width="100%" height="100%">
      <rect width="300" height="360" fill="#0f172a"/>
      <rect x="10" y="10" width="280" height="340" fill="none" stroke="#ef4444" stroke-width="2"/>
      <circle cx="150" cy="120" r="45" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
      <path d="M 80 240 C 80 180, 220 180, 220 240 Z" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
      <rect x="30" y="270" width="240" height="50" rx="4" fill="#020617" stroke="#ef4444" stroke-width="1.5"/>
      <text x="150" y="292" fill="#ef4444" font-family="monospace" font-size="12" font-weight="900" text-anchor="middle">POLICE RECORD</text>
      <text x="150" y="308" fill="#38bdf8" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle">${criminal.name.length > 24 ? criminal.name.slice(0, 22) + '..' : criminal.name}</text>
    </svg>
  `)}`;
};

export const CriminalRecords: React.FC<CriminalRecordsProps> = ({ 
  onClose,
  onOpenBiometricLab,
  initialCriminalId
}) => {
  // Load saved state from LocalStorage on mount
  const [criminals, setCriminals] = useState<Criminal[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(c => ({
            ...c,
            image: c.image || getEmbeddedCriminalPhoto(c.id)
          }));
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved criminal database:', e);
    }
    return INDIAN_CRIMINALS_DATABASE;
  });

  const [selectedCriminal, setSelectedCriminal] = useState<Criminal | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFate, setFilterFate] = useState<FateType | 'ALL'>('ALL');
  
  // 3-Second "Accessing Database..." loader state
  const [isAccessingDatabase, setIsAccessingDatabase] = useState(true);
  const [accessProgress, setAccessProgress] = useState(0);
  const [accessStageText, setAccessStageText] = useState('ESTABLISHING SECURE PROTOCOL // T.A.S.C. INTEL-GRID...');

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Criminal | null>(null);

  // Backup & Storage Modal / Notification
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [saveNotification, setSaveNotification] = useState<string | null>(null);
  const [lastSavedTime, setLastSavedTime] = useState<string>(() => new Date().toLocaleTimeString());

  // Warrant State
  const [showWarrant, setShowWarrant] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const warrantRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Synchronize state with LocalStorage whenever criminals data updates
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(criminals));
      setLastSavedTime(new Date().toLocaleTimeString());
    } catch (e) {
      console.error('Error saving criminal database to localStorage:', e);
    }
  }, [criminals]);

  // Flash notification helper
  const notify = (msg: string) => {
    setSaveNotification(msg);
    setTimeout(() => setSaveNotification(null), 3500);
  };

  // 3-Second Database Access Simulation on component mount
  useEffect(() => {
    setIsAccessingDatabase(true);
    setAccessProgress(0);

    const startTime = Date.now();
    const duration = 3000; // Exact 3 seconds

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, Math.floor((elapsed / duration) * 100));
      setAccessProgress(progress);

      if (progress < 25) {
        setAccessStageText('HANDSHAKING WITH CENTRAL CRIME RECORDS BUREAU (NCRB)...');
      } else if (progress < 50) {
        setAccessStageText('DECRYPTING CLASSIFIED NIA & CBI TERROR-ORGANIZED CRIME DOSSIERS...');
      } else if (progress < 75) {
        setAccessStageText('CROSS-REFERENCING INTERPOL RED CORNER NOTICES & STATE POLICE ARCHIVES...');
      } else if (progress < 95) {
        setAccessStageText('COMPILING DISPOSITIONS: HANGED // SHOT IN ENCOUNTER // ARRESTED // ABSCONDING...');
      } else {
        setAccessStageText('ACCESS GRANTED: 65 MASTER NATIONAL RECORDS COMPILED');
      }

      if (elapsed >= duration) {
        clearInterval(interval);
        setIsAccessingDatabase(false);
      }
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Auto-select suspect when opened with initialCriminalId
  useEffect(() => {
    if (initialCriminalId && criminals.length > 0) {
      const target = criminals.find(c => c.id === initialCriminalId);
      if (target) {
        setSelectedCriminal(target);
        setIsAccessingDatabase(false);
      }
    }
  }, [initialCriminalId, criminals]);

  // Reset editing when switching criminals
  useEffect(() => {
    setIsEditing(false);
    setEditForm(null);
  }, [selectedCriminal?.id]);

  const filteredCriminals = useMemo(() => {
    return criminals.filter(c => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        c.name.toLowerCase().includes(q) || 
        c.alias.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.state.toLowerCase().includes(q) ||
        c.crimes.some(crime => crime.toLowerCase().includes(q));
      
      const matchesFate = filterFate === 'ALL' || c.fate === filterFate;
      return matchesSearch && matchesFate;
    });
  }, [criminals, searchQuery, filterFate]);

  const handleIssueWarrant = () => {
    if (selectedCriminal) setShowWarrant(true);
  };

  const handleUpdateClick = () => {
    if (selectedCriminal) {
      setEditForm({ ...selectedCriminal });
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    if (!editForm || !selectedCriminal) return;
    const updatedList = criminals.map(c => c.id === editForm.id ? editForm : c);
    setCriminals(updatedList);
    setSelectedCriminal(editForm);
    setIsEditing(false);
    notify(`DOSSIER [${editForm.id}] UPDATED AND SAVED TO PERMANENT STORAGE`);
  };

  // Export full JSON database with all 65 profiles and images
  const handleExportDatabaseJSON = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(criminals, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `TASC_CRIMINALS_DATABASE_BACKUP_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      notify('INTELLIGENCE DATABASE EXPORTED SUCCESSFULLY (JSON ARCHIVE)');
    } catch (e) {
      console.error(e);
      notify('FAILED TO EXPORT DATABASE');
    }
  };

  // Import JSON backup
  const handleImportDatabaseJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCriminals(parsed);
            if (selectedCriminal) {
              const updatedSel = parsed.find((c: Criminal) => c.id === selectedCriminal.id);
              if (updatedSel) setSelectedCriminal(updatedSel);
            }
            notify(`SUCCESSFULLY RESTORED ${parsed.length} DOSSIERS FROM BACKUP FILE`);
            setShowBackupModal(false);
          } else {
            notify('INVALID DATABASE FILE FORMAT');
          }
        } catch (err) {
          notify('ERROR PARSING BACKUP FILE');
        }
      };
    }
  };

  // Reset database to NCRB Factual baseline
  const handleResetDatabase = () => {
    if (window.confirm('Reset all dossier modifications and reload the official 65 Master Records from NCRB/T.A.S.C.?')) {
      setCriminals(INDIAN_CRIMINALS_DATABASE);
      localStorage.removeItem(STORAGE_KEY);
      if (selectedCriminal) {
        const resetItem = INDIAN_CRIMINALS_DATABASE.find(c => c.id === selectedCriminal.id);
        if (resetItem) setSelectedCriminal(resetItem);
      }
      notify('DATABASE RE-INITIALIZED TO OFFICIAL MASTER ARCHIVE');
      setShowBackupModal(false);
    }
  };

  const handleForceSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(criminals));
    setLastSavedTime(new Date().toLocaleTimeString());
    notify('ALL 65 DOSSIERS SECURELY SAVED IN PERMANENT STORAGE');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm(null);
  };

  const handleInputChange = (field: keyof Criminal, value: any) => {
    if (editForm) {
      setEditForm({ ...editForm, [field]: value });
    }
  };

  const handleExportWarrant = () => {
    if (!warrantRef.current || !window.html2pdf) return;
    setIsExporting(true);
    
    const element = warrantRef.current;
    const opt = {
      margin: 10,
      filename: `WARRANT_${selectedCriminal?.id}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    window.html2pdf().from(element).set(opt).save()
      .then(() => setIsExporting(false))
      .catch((err: any) => {
        console.error(err);
        setIsExporting(false);
      });
  };

  const getFateBadge = (fate: FateType) => {
    switch (fate) {
      case 'HANGED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-purple-950/80 text-purple-300 border border-purple-500/60 shadow-[0_0_8px_rgba(168,85,247,0.3)]">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mr-1.5 animate-pulse"></span>
            HANGED (EXECUTED)
          </span>
        );
      case 'SHOT':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-red-950/80 text-red-300 border border-red-500/60 shadow-[0_0_8px_rgba(239,68,68,0.3)]">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5 animate-pulse"></span>
            SHOT (ENCOUNTER / KILLED)
          </span>
        );
      case 'ARRESTED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-500/60 shadow-[0_0_8px_rgba(245,158,11,0.3)]">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1.5"></span>
            ARRESTED / IN CUSTODY
          </span>
        );
      case 'NOT_ARRESTED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-rose-950/90 text-rose-300 border border-rose-500/70 shadow-[0_0_10px_rgba(244,63,94,0.4)]">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5 animate-ping"></span>
            NOT ARRESTED (ABSCONDING / RCN)
          </span>
        );
    }
  };

  const getDangerColor = (level: DangerLevel) => {
    switch (level) {
      case 'CRITICAL': return 'bg-red-600 animate-pulse shadow-[0_0_10px_red] text-white';
      case 'HIGH': return 'bg-orange-500 text-white';
      case 'MODERATE': return 'bg-yellow-500 text-black';
      case 'LOW': return 'bg-green-500 text-white';
    }
  };

  const counts = useMemo(() => {
    return {
      total: criminals.length,
      hanged: criminals.filter(c => c.fate === 'HANGED').length,
      shot: criminals.filter(c => c.fate === 'SHOT').length,
      arrested: criminals.filter(c => c.fate === 'ARRESTED').length,
      notArrested: criminals.filter(c => c.fate === 'NOT_ARRESTED').length,
    };
  }, [criminals]);

  return (
    <div className="fixed inset-0 z-50 bg-[#050a14] flex flex-col font-sans animate-in fade-in duration-300 select-none">
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

      {/* Header */}
      <div className="h-16 bg-[#0a1525] border-b border-cyan-500/20 flex items-center justify-between px-3 md:px-6 z-10 shrink-0 shadow-lg relative">
        <div className="flex items-center space-x-2 md:space-x-4">
           {selectedCriminal && (
             <button 
               onClick={() => setSelectedCriminal(null)} 
               className="p-1.5 bg-cyan-900/30 hover:bg-cyan-900/50 border border-cyan-500/40 rounded text-cyan-400 flex items-center space-x-1.5 text-xs font-mono transition-colors"
               title="Return to Master Database Table"
             >
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
               <span className="hidden sm:inline">INDEX TABLE</span>
             </button>
           )}
           <div className="p-1.5 md:p-2 bg-red-900/20 border border-red-500/30 rounded relative overflow-hidden">
             <div className="absolute inset-0 bg-red-500/10 animate-pulse"></div>
             <svg className="w-5 h-5 md:w-6 md:h-6 text-red-500 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
           </div>
           <div>
             <h1 className="text-sm md:text-xl font-bold text-white tracking-widest uppercase flex items-center space-x-2">
               <span>National Criminal Intelligence Grid</span>
               <span className="text-[10px] bg-red-950/80 text-red-400 border border-red-500/40 px-2 py-0.5 rounded font-mono">INDIA JURISDICTION</span>
             </h1>
             <div className="text-[8px] md:text-[10px] text-cyan-400/80 font-mono tracking-[0.2em] uppercase">
               T.A.S.C. // CENTRAL RECORD CLASSIFICATION (50+ DOSSIERS)
             </div>
           </div>
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
            <div className="hidden lg:flex space-x-3 text-[10px] font-mono">
                <div className="px-2.5 py-1 bg-cyan-950/40 border border-cyan-500/20 rounded text-center">
                    <span className="block text-cyan-300 font-bold text-base">{counts.total}</span>
                    <span className="text-cyan-500/70">TOTAL RECORDS</span>
                </div>
                <div className="px-2.5 py-1 bg-purple-950/40 border border-purple-500/30 rounded text-center">
                    <span className="block text-purple-300 font-bold text-base">{counts.hanged}</span>
                    <span className="text-purple-400/70">HANGED</span>
                </div>
                <div className="px-2.5 py-1 bg-red-950/40 border border-red-500/30 rounded text-center">
                    <span className="block text-red-400 font-bold text-base">{counts.shot}</span>
                    <span className="text-red-400/70">SHOT (ENCOUNTER)</span>
                </div>
                <div className="px-2.5 py-1 bg-amber-950/40 border border-amber-500/30 rounded text-center">
                    <span className="block text-amber-400 font-bold text-base">{counts.arrested}</span>
                    <span className="text-amber-400/70">IN CUSTODY</span>
                </div>
                <div className="px-2.5 py-1 bg-rose-950/40 border border-rose-500/30 rounded text-center">
                    <span className="block text-rose-400 font-bold text-base">{counts.notArrested}</span>
                    <span className="text-rose-400/70">NOT ARRESTED</span>
                </div>
            </div>

            {/* Storage & Backup Center */}
            <button
              onClick={() => setShowBackupModal(true)}
              className="px-2.5 py-1.5 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/40 hover:border-emerald-400/70 rounded text-emerald-400 flex items-center space-x-2 text-xs font-mono transition-all shadow-[0_0_12px_rgba(16,185,129,0.2)]"
              title="Database Persistence & Backup Center"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="hidden sm:inline font-bold">STORAGE & BACKUP</span>
            </button>
            
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-red-900/30 border border-red-500/20 hover:border-red-500/50 rounded text-gray-400 hover:text-red-400 transition-colors"
              title="Close Panel"
            >
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>
      </div>

      {/* Floating Save Notification Banner */}
      {saveNotification && (
        <div className="absolute top-18 right-6 z-50 bg-cyan-950/95 border-2 border-cyan-400 text-cyan-200 px-4 py-2.5 rounded shadow-[0_0_25px_rgba(34,211,238,0.4)] flex items-center space-x-3 font-mono text-xs animate-in slide-in-from-top-4 duration-300">
          <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          <span className="font-bold tracking-wide">{saveNotification}</span>
        </div>
      )}

      {/* Main Content Layout */}
      <div className="flex-grow flex overflow-hidden relative z-10">
          
          {/* Left Sidebar List of Criminals */}
          <div className={`w-full md:w-[360px] lg:w-[400px] bg-[#0a1525]/90 backdrop-blur-md border-r border-cyan-500/20 flex flex-col shrink-0 transition-all duration-300 absolute md:relative z-20 h-full transform ${selectedCriminal ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}`}>
              {/* Search & Filter Bar */}
              <div className="p-3.5 border-b border-cyan-500/10 space-y-2.5 bg-[#0a1525]">
                  <div className="relative">
                      <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="SEARCH ID / NAME / ALIAS / STATE..." 
                        className="w-full bg-[#050a14] border border-cyan-500/30 rounded px-3.5 py-2 text-xs text-white placeholder-cyan-700 focus:outline-none focus:border-cyan-400 font-mono" 
                      />
                      <svg className="w-4 h-4 text-cyan-600 absolute right-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>
                  
                  {/* Category Pills */}
                  <div className="flex space-x-1 overflow-x-auto pb-1 scrollbar-hide">
                      {[
                        { key: 'ALL', label: `ALL (${counts.total})` },
                        { key: 'HANGED', label: `HANGED (${counts.hanged})` },
                        { key: 'SHOT', label: `SHOT (${counts.shot})` },
                        { key: 'ARRESTED', label: `ARRESTED (${counts.arrested})` },
                        { key: 'NOT_ARRESTED', label: `WANTED (${counts.notArrested})` },
                      ].map(tab => (
                          <button
                            key={tab.key}
                            onClick={() => setFilterFate(tab.key as any)}
                            className={`px-2.5 py-1 text-[9px] font-mono font-bold tracking-wider rounded border transition-all whitespace-nowrap ${
                              filterFate === tab.key 
                                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow-[0_0_8px_rgba(6,182,212,0.3)]' 
                                : 'bg-transparent text-gray-400 border-gray-800 hover:text-gray-200 hover:border-gray-700'
                            }`}
                          >
                              {tab.label}
                          </button>
                      ))}
                  </div>
              </div>

              {/* Master Criminal List Scrollable */}
              <div className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-900/50 scrollbar-track-transparent">
                  {filteredCriminals.map(criminal => (
                      <div 
                        key={criminal.id}
                        onClick={() => setSelectedCriminal(criminal)}
                        className={`p-3 border-b border-cyan-500/5 cursor-pointer hover:bg-cyan-900/15 transition-all group relative ${selectedCriminal?.id === criminal.id ? 'bg-cyan-900/25' : ''}`}
                      >
                          {selectedCriminal?.id === criminal.id && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400 shadow-[0_0_10px_cyan]"></div>
                          )}
                          <div className="flex justify-between items-start mb-1">
                              <span className="text-cyan-400/80 font-mono text-[10px] tracking-wider">{criminal.id}</span>
                              <div className="flex items-center space-x-1.5">
                                  <span className={`text-[8px] font-mono px-1 rounded uppercase font-bold ${getDangerColor(criminal.dangerLevel)}`}>
                                    {criminal.dangerLevel}
                                  </span>
                              </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                               <div className="w-10 h-10 bg-[#0a1525] rounded overflow-hidden border border-cyan-500/40 relative shrink-0 shadow-md">
                                   <img 
                                      src={getSafeImageUrl(criminal)} 
                                      alt={criminal.name} 
                                      loading="lazy"
                                      onError={(e) => handleImgError(e, criminal)}
                                      className="w-full h-full object-cover rounded transition-transform group-hover:scale-105" 
                                   />
                               </div>
                               <div className="overflow-hidden">
                                   <div className={`font-bold text-xs truncate ${selectedCriminal?.id === criminal.id ? 'text-white' : 'text-gray-200'} group-hover:text-cyan-300 transition-colors`}>
                                     {criminal.name}
                                   </div>
                                   <div className="text-[11px] text-cyan-400/70 font-mono truncate">
                                     "{criminal.alias}"
                                   </div>
                                   <div className="text-[9px] text-gray-400 font-sans truncate">
                                     {criminal.state}
                                   </div>
                               </div>
                          </div>
                          
                          <div className="mt-2 flex flex-wrap items-center justify-between gap-1">
                              <div className="scale-90 origin-left">
                                {getFateBadge(criminal.fate)}
                              </div>
                              <span className="text-[9px] text-gray-400 font-mono">
                                {criminal.fate === 'NOT_ARRESTED' ? 'ABSCONDING' : criminal.arrestDate.split(' ')[0] + ' ' + (criminal.arrestDate.split(' ')[1] || '')}
                              </span>
                          </div>
                      </div>
                  ))}
                  
                  {filteredCriminals.length === 0 && (
                      <div className="p-8 text-center text-gray-500 font-mono text-xs">
                        NO CLASSIFIED RECORDS MATCHED QUERY
                      </div>
                  )}
              </div>
          </div>

          {/* Right Panel: Database Decryption Loader OR Master Indian Criminals Table OR Individual Dossier */}
          <div className="flex-grow bg-[#050a14] relative overflow-y-auto w-full flex flex-col">
              
              {/* STATE 1: 3-Second "Accessing Database..." Screen */}
              {isAccessingDatabase ? (
                  <div className="flex-grow flex flex-col items-center justify-center p-6 text-center z-10 animate-in fade-in duration-300">
                      <div className="relative mb-8">
                          {/* Animated Radar Scanning Ring */}
                          <div className="w-36 h-36 rounded-full border-2 border-cyan-500/30 animate-ping absolute inset-0"></div>
                          <div className="w-36 h-36 rounded-full border border-dashed border-cyan-400/60 animate-spin-reverse-slow absolute inset-0"></div>
                          <div className="w-36 h-36 rounded-full border-2 border-cyan-500/80 flex items-center justify-center bg-[#0a1525]/90 shadow-[0_0_40px_rgba(6,182,212,0.3)]">
                              <svg className="w-16 h-16 text-cyan-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                          </div>
                      </div>

                      <div className="max-w-xl w-full space-y-4 px-4">
                          <div className="inline-block px-3 py-1 bg-cyan-950/80 border border-cyan-500/40 rounded-full">
                              <span className="text-cyan-400 font-mono text-xs tracking-[0.3em] uppercase animate-pulse">
                                RESTRICTED PROTOCOL // 3 SECONDS DECRYPTION
                              </span>
                          </div>

                          <h2 className="text-2xl md:text-3xl font-black text-white tracking-widest uppercase font-mono drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
                            ACCESSING DATABASE...
                          </h2>

                          <p className="text-cyan-300/80 font-mono text-xs tracking-wider h-6">
                            {accessStageText}
                          </p>

                          {/* Progress Bar Container */}
                          <div className="w-full bg-[#0a1525] border border-cyan-500/40 rounded-full h-3.5 p-0.5 overflow-hidden shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                              <div 
                                className="bg-gradient-to-r from-cyan-600 via-cyan-400 to-blue-500 h-full rounded-full transition-all duration-75 shadow-[0_0_12px_rgba(34,211,238,0.8)]"
                                style={{ width: `${accessProgress}%` }}
                              ></div>
                          </div>

                          <div className="flex justify-between items-center text-[10px] font-mono text-cyan-400/60 pt-1">
                              <span>T.A.S.C. QUANTUM DECRYPTOR</span>
                              <span className="text-cyan-300 font-bold">{accessProgress}% COMPLETE</span>
                              <span>ARCHIVES: 65 SUBJECTS</span>
                          </div>
                      </div>
                  </div>
              ) : selectedCriminal ? (
                  /* STATE 2: Detailed Dossier View for a Specific Selected Criminal */
                  <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 relative z-10 animate-in slide-in-from-right-10 duration-300 w-full">
                      
                      {/* Back to Table Banner */}
                      <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
                          <button 
                            onClick={() => setSelectedCriminal(null)}
                            className="flex items-center space-x-2 px-3 py-1.5 bg-cyan-950/60 hover:bg-cyan-900/50 border border-cyan-500/40 rounded text-cyan-300 text-xs font-mono transition-all group"
                          >
                            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            <span>RETURN TO MASTER CRIMINAL TABLE</span>
                          </button>

                          <div className="flex items-center space-x-2">
                             {getFateBadge(selectedCriminal.fate)}
                          </div>
                      </div>

                      {/* Top Dossier Header */}
                      <div className="flex flex-col md:flex-row gap-8 border-b border-red-500/20 pb-8">
                          {/* Mugshot Area */}
                          <div className="w-full md:w-64 flex-shrink-0">
                                <div className="relative aspect-[3/4] bg-[#0a1525] rounded-lg overflow-hidden border-2 border-red-500/40 shadow-[0_0_25px_rgba(239,68,68,0.25)] group">
                                    <img 
                                      src={getSafeImageUrl(selectedCriminal)} 
                                      alt={selectedCriminal.name} 
                                      onError={(e) => handleImgError(e, selectedCriminal)}
                                      className="w-full h-full object-cover transition-all duration-300" 
                                    />
                                    
                                    {/* Subtle Vignette UI */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none"></div>
                                    
                                    <div className="absolute bottom-4 left-0 right-0 text-center">
                                        <div className="bg-black/80 backdrop-blur inline-block px-4 py-1 text-white font-mono text-lg tracking-[0.2em] border-y border-red-500/50">
                                          {selectedCriminal.id}
                                        </div>
                                    </div>
                                    
                                    {/* Fate Stamp Badge */}
                                    <div className="absolute top-4 right-4">
                                      {selectedCriminal.fate === 'HANGED' && (
                                          <div className="border-4 border-purple-600 bg-purple-950/80 text-purple-300 font-black text-sm px-2 py-1 transform rotate-12 rounded shadow-lg">
                                            EXECUTED / HANGED
                                          </div>
                                      )}
                                      {selectedCriminal.fate === 'SHOT' && (
                                          <div className="border-4 border-red-600 bg-red-950/80 text-red-300 font-black text-sm px-2 py-1 transform rotate-12 rounded shadow-lg">
                                            NEUTRALIZED / SHOT
                                          </div>
                                      )}
                                      {selectedCriminal.fate === 'ARRESTED' && (
                                          <div className="border-4 border-amber-600 bg-amber-950/80 text-amber-300 font-black text-sm px-2 py-1 transform rotate-12 rounded shadow-lg">
                                            IN CUSTODY
                                          </div>
                                      )}
                                      {selectedCriminal.fate === 'NOT_ARRESTED' && (
                                          <div className="border-4 border-rose-600 bg-rose-950/80 text-rose-300 font-black text-sm px-2 py-1 transform rotate-12 rounded shadow-lg animate-pulse">
                                            MOST WANTED (RCN)
                                          </div>
                                      )}
                                    </div>
                                </div>
                          </div>

                          {/* Basic Info */}
                          <div className="flex-grow space-y-4">
                              <div>
                                  <div className="flex items-center space-x-2 mb-1">
                                    <span className="text-cyan-400 font-mono text-xs font-bold uppercase">{selectedCriminal.state}</span>
                                    <span className="text-gray-500">•</span>
                                    <span className="text-red-400 font-mono text-xs uppercase">{selectedCriminal.nationality}</span>
                                  </div>
                                  <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-wider">{selectedCriminal.name}</h2>
                                  <div className="text-base text-cyan-400 font-mono font-bold mt-0.5">"{selectedCriminal.alias}"</div>
                              </div>

                              {/* Key Intelligence Metrics */}
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-[#0a1525]/60 p-4 rounded-lg border border-cyan-500/20">
                                  <div>
                                      <span className="text-[10px] text-gray-400 font-mono block">ARREST / INCIDENT DATE</span>
                                      <span className="text-xs font-mono font-bold text-white">{selectedCriminal.arrestDate}</span>
                                  </div>
                                  <div>
                                      <span className="text-[10px] text-gray-400 font-mono block">LEGAL STATUS / FATE</span>
                                      <span className="text-xs font-mono font-bold text-cyan-300">{selectedCriminal.fateDetail}</span>
                                  </div>
                                  <div>
                                      <span className="text-[10px] text-gray-400 font-mono block">THREAT CLASSIFICATION</span>
                                      <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded inline-block ${getDangerColor(selectedCriminal.dangerLevel)}`}>
                                        {selectedCriminal.dangerLevel}
                                      </span>
                                  </div>
                                  <div>
                                      <span className="text-[10px] text-gray-400 font-mono block">LAST KNOWN LOCATION</span>
                                      <span className="text-xs font-mono text-gray-300">{selectedCriminal.lastSeen}</span>
                                  </div>
                                  <div>
                                      <span className="text-[10px] text-gray-400 font-mono block">BOUNTY / SENTENCE</span>
                                      <span className="text-xs font-mono font-bold text-amber-400">{selectedCriminal.bounty}</span>
                                  </div>
                                  <div>
                                      <span className="text-[10px] text-gray-400 font-mono block">AGE / PHYSICAL METRICS</span>
                                      <span className="text-xs font-mono text-gray-300">{selectedCriminal.age} yrs • {selectedCriminal.height} • {selectedCriminal.weight}</span>
                                  </div>
                              </div>

                              {/* Charges Badges */}
                              <div>
                                  <span className="text-[10px] text-gray-400 font-mono block mb-1.5 uppercase">Primary Recorded Offenses</span>
                                  <div className="flex flex-wrap gap-1.5">
                                      {selectedCriminal.crimes.map((crime, idx) => (
                                          <span key={idx} className="px-2.5 py-1 bg-red-950/40 text-red-300 border border-red-500/30 rounded text-xs font-mono">
                                              {crime}
                                          </span>
                                      ))}
                                  </div>
                              </div>
                          </div>
                      </div>

                      {/* Criminal History & Directives */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="md:col-span-2 space-y-6">
                                 <div>
                                     <h3 className="text-cyan-400 font-mono text-sm tracking-widest uppercase mb-3 flex items-center">
                                         <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                         INTELLIGENCE BRIEF & PROFILE SUMMARY
                                     </h3>
                                     {isEditing ? (
                                         <textarea 
                                             value={editForm?.description}
                                             onChange={e => handleInputChange('description', e.target.value)}
                                             rows={6}
                                             className="w-full bg-[#0a1525]/50 p-4 rounded border border-cyan-500/40 text-gray-200 font-sans text-sm focus:border-cyan-400 outline-none"
                                         />
                                     ) : (
                                         <p className="text-gray-200 font-sans leading-relaxed text-sm bg-[#0a1525]/40 p-6 rounded border border-cyan-500/20 backdrop-blur-sm">
                                             {selectedCriminal.description}
                                         </p>
                                     )}
                                 </div>
                            </div>

                            <div className="space-y-3">
                                 {!isEditing ? (
                                     <>
                                         <button 
                                           onClick={handleIssueWarrant} 
                                           className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-widest text-xs rounded transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)] flex items-center justify-center space-x-2 font-mono"
                                         >
                                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                             <span>GENERATE ARREST WARRANT (PDF)</span>
                                         </button>
                                         <button 
                                           onClick={handleUpdateClick} 
                                           className="w-full py-3.5 bg-cyan-900/40 hover:bg-cyan-800/60 text-cyan-300 border border-cyan-500/30 font-bold uppercase tracking-widest text-xs rounded transition-all flex items-center justify-center space-x-2 font-mono"
                                         >
                                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                             <span>UPDATE CLASSIFIED RECORD</span>
                                         </button>
                                         <button 
                                           onClick={() => setSelectedCriminal(null)} 
                                           className="w-full py-3 bg-[#0a1525] hover:bg-gray-800 text-gray-300 border border-gray-700 font-mono text-xs rounded transition-colors flex items-center justify-center space-x-2"
                                         >
                                             <span>← RETURN TO 65 RECORD TABLE</span>
                                         </button>
                                     </>
                                 ) : (
                                     <>
                                         <button 
                                           onClick={handleSave} 
                                           className="w-full py-3.5 bg-green-600 hover:bg-green-500 text-white font-bold uppercase tracking-widest text-xs rounded transition-all shadow-[0_0_20px_rgba(34,197,94,0.4)] flex items-center justify-center space-x-2 font-mono"
                                         >
                                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                             <span>SAVE CLASSIFIED CHANGES</span>
                                         </button>
                                         <button 
                                           onClick={handleCancel} 
                                           className="w-full py-3.5 bg-gray-700 hover:bg-gray-600 text-white font-bold uppercase tracking-widest text-xs rounded transition-all border border-gray-500/50 flex items-center justify-center space-x-2 font-mono"
                                         >
                                             <span>CANCEL</span>
                                         </button>
                                     </>
                                 )}
                            </div>
                      </div>
                  </div>
              ) : (
                  /* STATE 3: Master National Criminal Index Table (65 Indian Criminals) */
                  <div className="p-4 md:p-6 space-y-4 w-full animate-in fade-in duration-500">
                      
                      {/* Master Table Header & Quick Statistics */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0a1525]/80 p-4 rounded-xl border border-cyan-500/20 backdrop-blur-sm">
                          <div>
                              <h2 className="text-lg md:text-xl font-bold text-white uppercase tracking-wider flex items-center space-x-2 font-mono">
                                <span>Master Indian Criminal Index</span>
                                <span className="text-xs bg-cyan-950 text-cyan-400 border border-cyan-500/40 px-2.5 py-0.5 rounded">
                                  {filteredCriminals.length} OF {criminals.length} LOADED
                                </span>
                              </h2>
                              <p className="text-xs text-gray-400 font-mono mt-1">
                                Complete dossier index with confirmed arrest dates, judicial executions, encounter casualties, and absconding status.
                              </p>
                          </div>

                          <div className="flex items-center space-x-2">
                             <span className="text-xs text-cyan-400 font-mono">CLICK ANY ROW FOR FULL DOSSIER</span>
                          </div>
                      </div>

                      {/* High-Tech Data Table */}
                      <div className="border border-cyan-500/20 rounded-xl overflow-hidden bg-[#0a1525]/60 backdrop-blur-md shadow-2xl">
                          <div className="overflow-x-auto">
                              <table className="w-full text-left border-collapse font-sans text-xs">
                                  <thead>
                                      <tr className="bg-[#0c1a2f] border-b border-cyan-500/30 text-cyan-400 font-mono uppercase text-[11px] tracking-wider">
                                          <th className="py-3.5 px-4">Subject & ID</th>
                                          <th className="py-3.5 px-4">Underground Alias</th>
                                          <th className="py-3.5 px-4">State / Jurisdiction</th>
                                          <th className="py-3.5 px-4">Major Offenses</th>
                                          <th className="py-3.5 px-4">Arrest / Encounter Date</th>
                                          <th className="py-3.5 px-4">Disposition / Fate</th>
                                          <th className="py-3.5 px-4 text-center">Threat</th>
                                          <th className="py-3.5 px-4 text-right">Action</th>
                                      </tr>
                                  </thead>
                                  <tbody className="divide-y divide-cyan-500/10">
                                      {filteredCriminals.map((c, index) => (
                                          <tr 
                                            key={c.id} 
                                            onClick={() => setSelectedCriminal(c)}
                                            className="hover:bg-cyan-950/40 transition-colors cursor-pointer group"
                                          >
                                              {/* Photo & Name */}
                                              <td className="py-3 px-4">
                                                  <div className="flex items-center space-x-3">
                                                      <span className="text-[10px] text-gray-500 font-mono w-4">{index + 1}</span>
                                                      <div className="w-9 h-9 rounded bg-[#0a1525] border border-cyan-500/40 overflow-hidden shrink-0 shadow-sm">
                                                          <img 
                                                            src={getSafeImageUrl(c)} 
                                                            alt={c.name} 
                                                            loading="lazy"
                                                            onError={(e) => handleImgError(e, c)}
                                                            className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                                                          />
                                                      </div>
                                                      <div>
                                                          <div className="font-bold text-white group-hover:text-cyan-300 transition-colors">
                                                            {c.name}
                                                          </div>
                                                          <div className="text-[10px] text-cyan-500/80 font-mono">
                                                            {c.id}
                                                          </div>
                                                      </div>
                                                  </div>
                                              </td>

                                              {/* Alias */}
                                              <td className="py-3 px-4 font-mono font-semibold text-cyan-300">
                                                  "{c.alias}"
                                              </td>

                                              {/* State */}
                                              <td className="py-3 px-4 text-gray-300 font-mono text-[11px]">
                                                  {c.state}
                                              </td>

                                              {/* Crimes */}
                                              <td className="py-3 px-4 text-gray-300 max-w-[200px]">
                                                  <div className="truncate font-sans font-medium text-[11px]" title={c.crimes.join(', ')}>
                                                    {c.crimes[0]} {c.crimes[1] ? `• ${c.crimes[1]}` : ''}
                                                  </div>
                                              </td>

                                              {/* Arrest Date */}
                                              <td className="py-3 px-4 font-mono text-[11px] text-amber-300/90 whitespace-nowrap">
                                                  {c.arrestDate}
                                              </td>

                                              {/* Disposition / Fate */}
                                              <td className="py-3 px-4 whitespace-nowrap">
                                                  <div className="flex flex-col space-y-0.5">
                                                      <div>{getFateBadge(c.fate)}</div>
                                                      <span className="text-[9px] text-gray-400 font-mono truncate max-w-[220px]" title={c.fateDetail}>
                                                        {c.fateDetail}
                                                      </span>
                                                  </div>
                                              </td>

                                              {/* Threat Level */}
                                              <td className="py-3 px-4 text-center whitespace-nowrap">
                                                  <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase ${getDangerColor(c.dangerLevel)}`}>
                                                    {c.dangerLevel}
                                                  </span>
                                              </td>

                                              {/* Action Button */}
                                              <td className="py-3 px-4 text-right whitespace-nowrap">
                                                  <button 
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      setSelectedCriminal(c);
                                                    }}
                                                    className="px-2.5 py-1 bg-cyan-900/30 hover:bg-cyan-800/60 border border-cyan-500/40 text-cyan-300 rounded text-[10px] font-mono tracking-wider uppercase transition-colors"
                                                  >
                                                    Dossier →
                                                  </button>
                                              </td>
                                          </tr>
                                      ))}
                                  </tbody>
                              </table>
                          </div>
                      </div>

                      {/* Footer Summary */}
                      <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 font-mono bg-[#0a1525]/40 p-3 rounded-lg border border-cyan-500/10">
                          <div>
                              CONFIDENTIAL DATA // TOTAL CLASSIFIED SUBJECTS: <span className="text-cyan-300 font-bold">{criminals.length}</span>
                          </div>
                          <div className="flex space-x-4 mt-2 sm:mt-0">
                              <span>🔴 Hanged: {counts.hanged}</span>
                              <span>🟠 Shot: {counts.shot}</span>
                              <span>🟡 In Custody: {counts.arrested}</span>
                              <span>⚪ Absconding: {counts.notArrested}</span>
                          </div>
                      </div>
                  </div>
              )}
          </div>
      </div>

      {/* Warrant Modal Overlay */}
      {showWarrant && selectedCriminal && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
           {/* Back Button */}
           <button 
                onClick={() => setShowWarrant(false)}
                className="fixed top-4 left-4 z-[110] flex items-center space-x-2 bg-black/50 hover:bg-black/80 text-white px-4 py-2 rounded-full backdrop-blur-md transition-all border border-white/10"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                <span className="text-xs font-mono tracking-widest uppercase">Back to Terminal</span>
           </button>

           {/* Document Container */}
           <div className="relative mt-12 md:mt-0">
              <div 
                ref={warrantRef}
                className="bg-white text-black p-12 max-w-[210mm] w-full min-h-[297mm] shadow-[0_0_50px_rgba(0,0,0,0.5)] mx-auto font-serif relative"
              >
                  {/* Watermark Emblem */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04]">
                      <svg viewBox="0 0 200 200" className="w-[50%] fill-black">
                        <circle cx="100" cy="100" r="80" fill="none" stroke="black" strokeWidth="4" />
                        <path d="M70 140 L130 140 L125 155 L75 155 Z M80 60 Q100 40 120 60 Q130 90 120 120 L80 120 Q70 90 80 60 Z M60 80 Q75 65 90 80 L85 120 L60 120 Z M140 80 Q125 65 110 80 L115 120 L140 120 Z" />
                        <circle cx="100" cy="130" r="10" fill="none" stroke="black" strokeWidth="2" />
                      </svg>
                  </div>

                  {/* Header */}
                  <div className="text-center border-b-4 border-double border-black pb-6 mb-8">
                      <div className="w-16 h-16 mx-auto mb-4 opacity-90 flex items-center justify-center">
                         <svg viewBox="0 0 200 200" className="w-16 h-16 fill-black">
                           <circle cx="100" cy="100" r="85" fill="none" stroke="black" strokeWidth="4" />
                           <path d="M70 140 L130 140 L125 155 L75 155 Z M80 60 Q100 40 120 60 Q130 90 120 120 L80 120 Q70 90 80 60 Z M60 80 Q75 65 90 80 L85 120 L60 120 Z M140 80 Q125 65 110 80 L115 120 L140 120 Z" />
                           <circle cx="100" cy="130" r="10" fill="none" stroke="black" strokeWidth="2" />
                         </svg>
                      </div>
                      <h1 className="text-3xl font-bold tracking-widest uppercase mb-1">Government of India</h1>
                      <h2 className="text-xl font-bold uppercase mb-2">Ministry of Defence</h2>
                      <h3 className="text-sm font-bold tracking-[0.2em] uppercase">Threat Analysis & Surveillance Cell (T.A.S.C.)</h3>
                      <div className="mt-4 text-4xl font-black uppercase underline decoration-4 underline-offset-4">Arrest Warrant</div>
                  </div>

                  {/* Body */}
                  <div className="flex gap-8 mb-8">
                      <div className="w-1/3 flex-shrink-0">
                          <div className="border-4 border-black p-1 bg-gray-50">
                              <img 
                                src={getSafeImageUrl(selectedCriminal)} 
                                alt="Suspect" 
                                onError={(e) => handleImgError(e, selectedCriminal)}
                                className="w-full h-auto object-cover" 
                              />
                          </div>
                          <div className="text-center mt-2 font-bold font-mono text-sm">{selectedCriminal.id}</div>
                      </div>
                      <div className="w-2/3 space-y-4 font-mono text-sm">
                          <div className="grid grid-cols-2 gap-4 border-b border-black/20 pb-4">
                              <div>
                                  <div className="font-bold text-gray-500 text-xs uppercase">Full Name</div>
                                  <div className="font-bold text-lg uppercase">{selectedCriminal.name}</div>
                              </div>
                              <div>
                                  <div className="font-bold text-gray-500 text-xs uppercase">Alias</div>
                                  <div className="font-bold text-lg uppercase">"{selectedCriminal.alias}"</div>
                              </div>
                              <div>
                                  <div className="font-bold text-gray-500 text-xs uppercase">State / Jurisdiction</div>
                                  <div className="uppercase">{selectedCriminal.state}</div>
                              </div>
                              <div>
                                  <div className="font-bold text-gray-500 text-xs uppercase">Disposition / Fate</div>
                                  <div className="uppercase font-bold">{selectedCriminal.fateDetail}</div>
                              </div>
                          </div>
                          
                          <div className="pt-2">
                             <div className="font-bold text-gray-500 text-xs uppercase mb-1">Known Offences & Charges</div>
                             <ul className="list-disc list-inside space-y-1 font-bold">
                                 {selectedCriminal.crimes.map(c => <li key={c} className="uppercase">{c}</li>)}
                                 <li className="uppercase">CONSPIRACY AGAINST THE STATE OF INDIA</li>
                             </ul>
                          </div>

                          <div className="pt-4 border-t border-black/20">
                              <div className="font-bold text-gray-500 text-xs uppercase mb-1">Directives</div>
                              <p className="text-justify leading-relaxed font-sans font-medium">
                                  TO ANY AUTHORIZED OFFICER OF T.A.S.C., NATIONAL INVESTIGATION AGENCY (NIA), OR STATE POLICE FORCES:
                                  <br/><br/>
                                  YOU ARE HEREBY COMMANDED to arrest and bring into custody the above-named individual, who is charged with the offences listed herein. This warrant is issued under the authority of the Threat Analysis & Surveillance Cell.
                                  <br/><br/>
                                  <span className="font-bold">CAUTION: Subject is considered {selectedCriminal.dangerLevel} THREAT. Approach with extreme caution. Authorized use of tactical force permitted.</span>
                              </p>
                          </div>
                      </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-12 flex justify-between items-end">
                      <div className="text-center">
                          <div className="mb-2 font-mono text-sm">{new Date().toLocaleDateString()}</div>
                          <div className="border-t border-black w-48 pt-1 text-xs uppercase font-bold">Date of Issue</div>
                      </div>
                      <div className="text-center">
                          <div className="w-32 h-32 border-4 border-red-700 rounded-full flex items-center justify-center text-red-700 font-black text-xs uppercase rotate-[-15deg] opacity-80" style={{borderStyle: 'double'}}>
                              Official<br/>Seal<br/>T.A.S.C.<br/>HQ
                          </div>
                      </div>
                      <div className="text-center">
                          <div className="mb-2 font-dancing-script text-2xl font-bold italic">Gen. A. Sharma</div>
                          <div className="border-t border-black w-48 pt-1 text-xs uppercase font-bold">Issuing Authority Signature</div>
                      </div>
                  </div>
              </div>

              {/* Controls */}
              <div className="absolute top-0 -right-20 flex flex-col space-y-4">
                  <button 
                    onClick={handleExportWarrant}
                    disabled={isExporting}
                    className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors shadow-lg text-black group relative"
                    title="Download PDF"
                  >
                      {isExporting ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>}
                  </button>
                  <button 
                    onClick={() => window.print()}
                    className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors shadow-lg text-black"
                    title="Print"
                  >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2-4h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6a2 2 0 012-2zm9-2a1 1 0 11-14 0 1 1 0 0114 0z" /></svg>
                  </button>
                  <button 
                    onClick={() => setShowWarrant(false)}
                    className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors shadow-lg text-white"
                    title="Close"
                  >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
              </div>
           </div>
        </div>
      )}

      {/* Hidden File Input for JSON Backup Import */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImportDatabaseJSON} 
        accept=".json,application/json" 
        className="hidden" 
      />

      {/* Persistence & Database Backup Management Modal */}
      {showBackupModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0a1526] border-2 border-cyan-500/60 rounded-lg max-w-xl w-full p-6 shadow-[0_0_50px_rgba(6,182,212,0.3)] relative font-mono text-cyan-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3 mb-5">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-950/80 border border-emerald-500/50 rounded text-emerald-400">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-wider">DATABASE PERSISTENCE & BACKUP</h3>
                  <p className="text-[10px] text-emerald-400 font-sans uppercase">Continuous Local Storage & Photographic Archive Protection</p>
                </div>
              </div>
              <button 
                onClick={() => setShowBackupModal(false)}
                className="text-gray-400 hover:text-white p-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Status overview cards */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-[#050b14] border border-cyan-500/30 rounded p-3">
                <div className="text-[10px] text-gray-400 mb-1">STORAGE ENGINE</div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-sm font-bold text-white">Browser LocalStorage</span>
                </div>
                <div className="text-[9px] text-cyan-500/80 mt-1">Key: {STORAGE_KEY}</div>
              </div>

              <div className="bg-[#050b14] border border-cyan-500/30 rounded p-3">
                <div className="text-[10px] text-gray-400 mb-1">SAVED DOSSIERS / IMAGES</div>
                <div className="text-sm font-bold text-emerald-400">{criminals.length} Profiles Saved</div>
                <div className="text-[9px] text-gray-400 mt-1">Last synced: {lastSavedTime}</div>
              </div>
            </div>

            {/* Security note */}
            <div className="bg-cyan-950/40 border border-cyan-500/20 rounded p-3.5 mb-6 text-xs leading-relaxed text-gray-300 font-sans">
              <span className="font-bold text-cyan-300 font-mono">INTELLIGENCE SAFEGUARD: </span>
              All 65 criminal profiles and photographs are permanently embedded and stored. Every update, edit, status adjustment, or case detail you change is instantly committed to permanent storage.
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleForceSave}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <span>COMMIT & FORCE-SAVE DATABASE NOW</span>
              </button>

              <button
                onClick={handleExportDatabaseJSON}
                className="w-full py-2.5 px-4 bg-cyan-900/60 hover:bg-cyan-800/80 border border-cyan-500/50 hover:border-cyan-400 text-cyan-200 rounded font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                <span>EXPORT INTEL DATABASE TO JSON FILE</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 px-4 bg-blue-900/40 hover:bg-blue-800/60 border border-blue-500/40 hover:border-blue-400 text-blue-200 rounded font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                <span>IMPORT / RESTORE DATABASE FROM JSON FILE</span>
              </button>

              <button
                onClick={handleResetDatabase}
                className="w-full py-2 px-4 bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-400 rounded text-[11px] flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                <span>REVERT TO ORIGINAL NCRB 65 MASTER DOSSIERS</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

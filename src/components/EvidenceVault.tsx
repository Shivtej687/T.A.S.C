import React, { useState, useEffect, useRef } from 'react';
import { syncEvidenceFromCases } from '../utils/crypto';

declare global {
  interface Window {
    html2pdf: any;
  }
}

// --- Types ---
interface EvidenceBlock {
  index: number;
  timestamp: string;
  caseId: string;
  type: 'IMAGE' | 'DOCUMENT' | 'PHYSICAL' | 'DIGITAL';
  description: string;
  officerId: string;
  dataHash: string;
  prevHash: string;
  signature: string;
  status: 'VERIFIED' | 'TAMPERED' | 'VERIFYING';
  imageUrl?: string;
}

interface AccessLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  status: 'SUCCESS' | 'DENIED' | 'FLAGGED';
  ip: string;
}

// --- Mock Data ---
const GENESIS_HASH = "000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f";

const INITIAL_CHAIN: EvidenceBlock[] = [
  {
    index: 0,
    timestamp: "2024-01-01 00:00:00",
    caseId: "GENESIS",
    type: "DIGITAL",
    description: "Vault Initialization Block - Root CA",
    officerId: "SYS-ADMIN",
    dataHash: "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4",
    prevHash: "0000000000000000000000000000000000000000000000000000000000000000",
    signature: "SIG-ROOT-ALPHA",
    status: 'VERIFIED'
  },
  // CASE-2024-089 Evidence 1
  {
    index: 1,
    timestamp: "2024-10-24 14:15:22",
    caseId: "CASE-2024-089",
    type: "DIGITAL",
    description: "Server Access Logs - Mumbai Data Center (Red Mist)",
    officerId: "OP-774-A",
    dataHash: "a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0",
    prevHash: "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4",
    signature: "SIG-774-VIKRAM",
    status: 'VERIFIED',
    imageUrl: "https://images.unsplash.com/photo-1558494949-ef526b0042a0?auto=format&fit=crop&w=800&q=80"
  },
  // CASE-2024-089 Evidence 2
  {
    index: 2,
    timestamp: "2024-10-24 16:45:10",
    caseId: "CASE-2024-089",
    type: "DIGITAL",
    description: "Malicious Worm Source Code Snippet (Red Mist)",
    officerId: "OP-774-A",
    dataHash: "b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef01",
    prevHash: "a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0",
    signature: "SIG-774-VIKRAM",
    status: 'VERIFIED',
    imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80"
  },
  // CASE-2024-072 Evidence 1
  {
    index: 3,
    timestamp: "2024-09-15 09:30:00",
    caseId: "CASE-2024-072",
    type: "PHYSICAL",
    description: "Confiscated Encrypted Hard Drive (Shadow Broker)",
    officerId: "OP-202-C",
    dataHash: "c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef012",
    prevHash: "b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef01",
    signature: "SIG-202-SARAH",
    status: 'VERIFIED',
    imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80"
  },
  // CASE-2024-091 Evidence 1
  {
    index: 4,
    timestamp: "2024-10-28 11:20:45",
    caseId: "CASE-2024-091",
    type: "IMAGE",
    description: "Grid Infrastructure Damage Assessment (Protocol Blackout)",
    officerId: "OP-449-B",
    dataHash: "d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0123",
    prevHash: "c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef012",
    signature: "SIG-449-ARJUN",
    status: 'VERIFIED',
    imageUrl: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=800&q=80"
  },
  // CASE-2024-065 Evidence 1
  {
    index: 5,
    timestamp: "2024-08-02 23:15:00",
    caseId: "CASE-2024-065",
    type: "PHYSICAL",
    description: "Seized Contraband Vessel Cargo (Midnight Cargo)",
    officerId: "OP-551-D",
    dataHash: "e5f67890123456789abcdef0123456789abcdef0123456789abcdef01234",
    prevHash: "d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0123",
    signature: "SIG-551-RAJESH",
    status: 'VERIFIED',
    imageUrl: "https://images.unsplash.com/photo-1516937941348-c09e554b98e4?auto=format&fit=crop&w=800&q=80"
  },
  // Additional Dummy Record for Ghost Signal (Audio File representation)
  {
    index: 6,
    timestamp: "2024-11-01 04:20:00",
    caseId: "CASE-2024-094",
    type: "DIGITAL",
    description: "Decrypted Radio Burst Audio File (Ghost Signal)",
    officerId: "OP-101-T",
    dataHash: "1f76b966c5d96a77553833212726477e",
    prevHash: "e5f67890123456789abcdef0123456789abcdef0123456789abcdef01234",
    signature: "SIG-101-ANITA",
    status: 'VERIFIED'
  }
];

const MOCK_LOGS: AccessLog[] = [
  { id: 'LOG-001', timestamp: "2024-11-02 10:00:01", user: "CMDR. SHIVTEJ", action: "VAULT_ACCESS_GRANTED", status: "SUCCESS", ip: "192.168.1.10" },
  { id: 'LOG-002', timestamp: "2024-11-02 09:45:22", user: "UNKNOWN", action: "AUTH_FAILURE", status: "DENIED", ip: "45.22.19.112" },
  { id: 'LOG-003', timestamp: "2024-11-01 16:30:00", user: "OP-774-A", action: "ADD_BLOCK_INDEX_2", status: "SUCCESS", ip: "10.0.0.55" },
  { id: 'LOG-004', timestamp: "2024-11-01 16:29:15", user: "SYSTEM", action: "INTEGRITY_CHECK_PASS", status: "SUCCESS", ip: "LOCALHOST" },
  { id: 'LOG-005', timestamp: "2024-10-30 11:20:10", user: "OP-202-C", action: "VIEW_BLOCK_INDEX_3", status: "SUCCESS", ip: "10.0.0.22" },
  { id: 'LOG-006', timestamp: "2024-10-28 03:15:00", user: "EXTERNAL_IP", action: "PORT_SCAN_DETECTED", status: "FLAGGED", ip: "185.220.101.4" }
];

interface EvidenceVaultProps {
  onClose: () => void;
}

export const EvidenceVault: React.FC<EvidenceVaultProps> = ({ onClose }) => {
  const [isLocked, setIsLocked] = useState(true);
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState<'CHAIN' | 'LOGS' | 'INTEGRITY'>('CHAIN');
  const [chain, setChain] = useState<EvidenceBlock[]>(INITIAL_CHAIN);

  useEffect(() => {
    const syncedChain = syncEvidenceFromCases();
    if (syncedChain && syncedChain.length > 0) {
      setChain(syncedChain);
    }
  }, []);
  const [logs, setLogs] = useState<AccessLog[]>(MOCK_LOGS);
  const [selectedBlock, setSelectedBlock] = useState<EvidenceBlock | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [tamperAlert, setTamperAlert] = useState(false);
  
  // Export State
  const [isExporting, setIsExporting] = useState(false);
  const detailsRef = useRef<HTMLDivElement>(null);

  // Authentication
  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === 'Shiv@2880') {
      setIsLocked(false);
      setError(false);
      // Log the successful access
      const newLog: AccessLog = {
          id: `LOG-${Date.now()}`,
          timestamp: new Date().toLocaleString(),
          user: 'CMDR. SHIVTEJ',
          action: 'VAULT_UNLOCKED',
          status: 'SUCCESS',
          ip: 'SECURE_TERMINAL'
      };
      setLogs([newLog, ...logs]);
    } else {
      setError(true);
      setPasscode('');
      setTimeout(() => setError(false), 1000);
      // Log failure
      const failLog: AccessLog = {
        id: `LOG-${Date.now()}`,
        timestamp: new Date().toLocaleString(),
        user: 'UNAUTHORIZED',
        action: 'AUTH_FAIL_ATTEMPT',
        status: 'DENIED',
        ip: 'UNKNOWN'
      };
      setLogs([failLog, ...logs]);
    }
  };

  // Integrity Check Simulation
  const runIntegrityCheck = () => {
      setIsVerifying(true);
      setTamperAlert(false);
      
      // Reset statuses
      const resetChain = chain.map(b => ({ ...b, status: 'VERIFYING' as const }));
      setChain(resetChain);

      let currentIndex = 0;
      const interval = setInterval(() => {
          if (currentIndex >= resetChain.length) {
              clearInterval(interval);
              setIsVerifying(false);
              // Random chance of tamper for demo effect if we want, but let's keep it clean unless manually triggered
              const finalChain = resetChain.map(b => ({ ...b, status: 'VERIFIED' as const }));
              setChain(finalChain);
              return;
          }

          setChain(prev => prev.map((b, idx) => {
              if (idx === currentIndex) {
                  // Validate hash chain logic (Mock)
                  const isValid = idx === 0 || b.prevHash === prev[idx - 1].dataHash;
                  return { ...b, status: isValid ? 'VERIFIED' : 'TAMPERED' };
              }
              return b;
          }));
          
          currentIndex++;
      }, 600);
  };

  const simulateTamper = () => {
      // Corrupt a block
      const corruptedChain = [...chain];
      if (corruptedChain.length > 2) {
          corruptedChain[2].dataHash = "CORRUPTED_DATA_HASH_X99"; // Break the link
          // The next block's prevHash will no longer match this one in a real calc, 
          // but for visual we just mark it.
          setChain(corruptedChain);
          setTamperAlert(true);
          
          const alertLog: AccessLog = {
            id: `LOG-${Date.now()}`,
            timestamp: new Date().toLocaleString(),
            user: 'SYSTEM_WATCHDOG',
            action: 'INTEGRITY_VIOLATION_DETECTED',
            status: 'FLAGGED',
            ip: 'INTERNAL'
          };
          setLogs([alertLog, ...logs]);
      }
  };

  const handleDownload = () => {
    if (!detailsRef.current || !window.html2pdf || !selectedBlock) return;
    setIsExporting(true);

    const element = detailsRef.current;
    const clone = element.cloneNode(true) as HTMLElement;

    // Add Header for PDF
    const headerDiv = document.createElement('div');
    headerDiv.innerHTML = `
        <div style="border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end;">
            <div>
                <h1 style="font-size: 24px; font-weight: bold; margin: 0; font-family: sans-serif; text-transform: uppercase;">Secure Evidence Record</h1>
                <p style="font-size: 14px; margin: 5px 0 0 0; font-family: monospace;">BLOCK INDEX: ${selectedBlock.index}</p>
            </div>
            <div style="text-align: right;">
                <p style="font-size: 10px; font-family: monospace; margin: 0;">CLASSIFIED: LEVEL 5</p>
                <p style="font-size: 10px; font-family: monospace; margin: 0;">TIMESTAMP: ${selectedBlock.timestamp}</p>
            </div>
        </div>
    `;
    clone.insertBefore(headerDiv, clone.firstChild);

    // Styling for PDF
    clone.classList.add('pdf-export-container');
    clone.style.padding = '40px';
    clone.style.background = '#ffffff';
    clone.style.color = '#000000';
    clone.style.width = '100%';
    clone.style.fontFamily = 'monospace';

    const opt = {
        margin: 10,
        filename: `EVIDENCE_BLOCK_${selectedBlock.index}_${selectedBlock.caseId}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff' },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    window.html2pdf().from(clone).set(opt).save()
        .then(() => setIsExporting(false))
        .catch((e: any) => {
            console.error(e);
            setIsExporting(false);
        });
  };

  if (isLocked) {
    return (
      <div className="fixed inset-0 z-50 bg-[#050a14] flex flex-col items-center justify-center font-sans animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.8),rgba(0,0,0,0.8)),url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-50 pointer-events-none"></div>
          
          <div className="relative z-10 w-full max-w-md p-8 bg-[#0a1525] border-2 border-slate-700 rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.5)]">
              <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center border-2 border-slate-600">
                      <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </div>
              </div>
              
              <h2 className="text-2xl font-bold text-slate-200 text-center mb-1 tracking-widest uppercase">Evidence Vault</h2>
              <p className="text-xs text-slate-500 text-center font-mono mb-8">SECURE BLOCKCHAIN STORAGE // LEVEL 5</p>
              
              <form onSubmit={handleUnlock}>
                  <div className="mb-6 relative">
                      <input 
                        type="password" 
                        value={passcode}
                        onChange={(e) => setPasscode(e.target.value)}
                        placeholder="ENTER PASSCODE"
                        className="w-full bg-[#050a14] border border-slate-600 text-center text-white font-mono text-lg py-3 rounded focus:outline-none focus:border-cyan-500 focus:shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-all tracking-[0.5em]"
                        autoFocus
                      />
                      {error && (
                          <div className="absolute -bottom-6 left-0 right-0 text-center text-red-500 text-xs font-bold animate-pulse">
                              ACCESS DENIED: INVALID CREDENTIALS
                          </div>
                      )}
                  </div>
                  
                  <div className="flex space-x-4">
                      <button 
                        type="button" 
                        onClick={onClose}
                        className="flex-1 py-3 border border-slate-600 text-slate-400 font-bold text-xs uppercase tracking-widest rounded hover:bg-slate-800 transition-colors"
                      >
                          Abort
                      </button>
                      <button 
                        type="submit"
                        className="flex-1 py-3 bg-cyan-700 hover:bg-cyan-600 text-white font-bold text-xs uppercase tracking-widest rounded shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-colors"
                      >
                          Unlock
                      </button>
                  </div>
              </form>
          </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#0b0c10] flex flex-col font-sans animate-in fade-in duration-300 text-slate-300">
        
        {/* Header */}
        <div className="h-16 border-b border-slate-700/50 flex justify-between items-center px-6 bg-[#151b26] z-20 shadow-lg">
            <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${tamperAlert ? 'bg-red-500 animate-ping' : 'bg-green-500 shadow-[0_0_8px_lime]'}`}></div>
                <div>
                    <h1 className="text-lg font-bold tracking-widest uppercase text-slate-100">Secure Evidence Vault</h1>
                    <div className="text-[10px] text-slate-500 font-mono tracking-widest">
                        INTEGRITY STATUS: {tamperAlert ? <span className="text-red-500 font-bold">COMPROMISED</span> : <span className="text-green-500">VERIFIED (100%)</span>}
                    </div>
                </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-6">
                <div className="flex bg-[#0b0c10] p-1 rounded border border-slate-700 overflow-x-auto">
                    <button onClick={() => setActiveTab('CHAIN')} className={`px-2 sm:px-4 py-1.5 text-[10px] sm:text-xs font-bold rounded transition-all shrink-0 ${activeTab === 'CHAIN' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}>CHAIN</button>
                    <button onClick={() => setActiveTab('LOGS')} className={`px-2 sm:px-4 py-1.5 text-[10px] sm:text-xs font-bold rounded transition-all shrink-0 ${activeTab === 'LOGS' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}>ACCESS LOGS</button>
                    <button onClick={() => setActiveTab('INTEGRITY')} className={`px-2 sm:px-4 py-1.5 text-[10px] sm:text-xs font-bold rounded transition-all shrink-0 ${activeTab === 'INTEGRITY' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}>INTEGRITY</button>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
        </div>

        {/* Content */}
        <div className="flex-grow flex overflow-hidden relative">
            
            {/* Main Area */}
            <div className="flex-grow p-4 sm:p-8 overflow-y-auto relative bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
                <div className="absolute inset-0 bg-[#0b0c10]/95 pointer-events-none z-0"></div>
                
                <div className="relative z-10 max-w-6xl mx-auto">
                    
                    {activeTab === 'CHAIN' && (
                        <div className="space-y-8">
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                                <h2 className="text-lg sm:text-xl font-mono text-cyan-500 font-bold uppercase tracking-widest">Evidence Blockchain Ledger</h2>
                                <button onClick={runIntegrityCheck} className="flex items-center justify-center space-x-2 bg-cyan-900/30 text-cyan-400 border border-cyan-500/30 px-4 py-2 rounded hover:bg-cyan-900/50 transition-colors text-xs font-bold uppercase self-start sm:self-auto">
                                    <svg className={`w-4 h-4 ${isVerifying ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                    <span>Verify Signatures</span>
                                </button>
                            </div>

                            <div className="relative space-y-4">
                                {/* Vertical Chain Line */}
                                <div className="absolute left-6 sm:left-8 top-8 bottom-8 w-0.5 bg-slate-700 z-0"></div>

                                {chain.map((block, index) => (
                                    <div 
                                        key={block.index} 
                                        className={`relative z-10 flex items-start space-x-3 sm:space-x-6 group cursor-pointer ${selectedBlock?.index === block.index ? 'scale-[1.01] sm:scale-[1.02]' : ''} transition-all duration-300`}
                                        onClick={() => setSelectedBlock(block)}
                                    >
                                        {/* Block Icon */}
                                        <div className={`w-12 h-12 sm:w-16 sm:h-16 shrink-0 rounded-lg flex items-center justify-center border-2 shadow-lg transition-colors bg-[#151b26] ${block.status === 'VERIFIED' ? 'border-green-600 text-green-500' : block.status === 'TAMPERED' ? 'border-red-600 text-red-500 animate-pulse' : 'border-yellow-500 text-yellow-500'}`}>
                                            <div className="text-center">
                                                <div className="text-[8px] sm:text-[10px] font-mono font-bold">BLK</div>
                                                <div className="text-sm sm:text-xl font-bold">{block.index.toString().padStart(2, '0')}</div>
                                            </div>
                                        </div>

                                        {/* Block Content */}
                                        <div className={`flex-grow bg-[#151b26] border p-3 sm:p-4 rounded-lg shadow-md transition-colors ${block.status === 'VERIFIED' ? 'border-slate-700 hover:border-cyan-500/50' : 'border-red-500/50 bg-red-900/10'}`}>
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-1">
                                                <div className="flex items-center space-x-2">
                                                    <span className={`text-[8px] sm:text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${block.status === 'VERIFIED' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>{block.status}</span>
                                                    <span className="text-[10px] sm:text-xs text-slate-400 font-mono">{block.timestamp}</span>
                                                </div>
                                                <div className="text-[10px] font-mono text-cyan-600 truncate max-w-[150px]" title={block.signature}>{block.signature}</div>
                                            </div>
                                            
                                            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                                                <div>
                                                    <h3 className="text-white font-bold text-xs sm:text-sm uppercase">{block.caseId}</h3>
                                                    <p className="text-slate-400 text-[11px] sm:text-xs mt-1 leading-normal">{block.description}</p>
                                                </div>
                                                <div className="text-left sm:text-right text-[9px] sm:text-[10px] font-mono text-slate-500 border-t border-slate-800 sm:border-0 pt-2 sm:pt-0">
                                                    <div className="mb-0.5">PREV: {block.prevHash.substring(0, 12)}...</div>
                                                    <div className="text-cyan-500/70">HASH: {block.dataHash.substring(0, 12)}...</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'LOGS' && (
                        <div className="bg-[#151b26] rounded-lg border border-slate-700 overflow-hidden">
                            <div className="overflow-x-auto w-full">
                                <table className="w-full text-left text-xs font-mono min-w-[650px]">
                                    <thead className="bg-[#0b0c10] text-slate-400 uppercase tracking-wider border-b border-slate-700">
                                        <tr>
                                            <th className="px-6 py-4">Timestamp</th>
                                            <th className="px-6 py-4">User ID</th>
                                            <th className="px-6 py-4">Action</th>
                                            <th className="px-6 py-4">Source IP</th>
                                            <th className="px-6 py-4 text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700">
                                        {logs.map((log) => (
                                            <tr key={log.id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-3 text-slate-400">{log.timestamp}</td>
                                                <td className="px-6 py-3 font-bold text-white">{log.user}</td>
                                                <td className="px-6 py-3 text-slate-300">{log.action}</td>
                                                <td className="px-6 py-3 text-slate-500">{log.ip}</td>
                                                <td className="px-6 py-3 text-right">
                                                    <span className={`px-2 py-1 rounded text-[10px] font-bold ${log.status === 'SUCCESS' ? 'text-green-400 bg-green-900/20' : log.status === 'DENIED' ? 'text-red-400 bg-red-900/20' : 'text-yellow-400 bg-yellow-900/20'}`}>
                                                        {log.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'INTEGRITY' && (
                        <div className="flex flex-col items-center justify-center py-10 sm:py-20 space-y-8">
                            <div className={`w-48 h-48 sm:w-64 sm:h-64 rounded-full border-4 flex items-center justify-center relative ${tamperAlert ? 'border-red-500 bg-red-900/10' : 'border-green-500 bg-green-900/10'}`}>
                                <div className="text-center">
                                    <div className="text-4xl sm:text-6xl font-bold text-white mb-2">{tamperAlert ? '98%' : '100%'}</div>
                                    <div className={`text-xs sm:text-sm font-mono tracking-widest ${tamperAlert ? 'text-red-500' : 'text-green-500'}`}>CHAIN HEALTH</div>
                                </div>
                                {/* Orbiting Particles */}
                                <div className={`absolute top-0 left-0 w-full h-full animate-spin-slow rounded-full border-t-2 ${tamperAlert ? 'border-red-500' : 'border-green-500'} opacity-30`}></div>
                                <div className={`absolute top-4 left-4 right-4 bottom-4 animate-spin-reverse-slow rounded-full border-b-2 ${tamperAlert ? 'border-red-500' : 'border-green-500'} opacity-30`}></div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl">
                                <div className="bg-[#151b26] p-4 sm:p-6 rounded border border-slate-700 text-center">
                                    <div className="text-slate-500 text-xs font-mono uppercase mb-2">Total Blocks</div>
                                    <div className="text-2xl sm:text-3xl font-bold text-white">{chain.length}</div>
                                </div>
                                <div className="bg-[#151b26] p-4 sm:p-6 rounded border border-slate-700 text-center">
                                    <div className="text-slate-500 text-xs font-mono uppercase mb-2">Last Audit</div>
                                    <div className="text-base sm:text-lg font-bold text-cyan-400">JUST NOW</div>
                                </div>
                                <div className="bg-[#151b26] p-4 sm:p-6 rounded border border-slate-700 text-center">
                                    <div className="text-slate-500 text-xs font-mono uppercase mb-2">Encryption</div>
                                    <div className="text-base sm:text-lg font-bold text-green-400">SHA-256</div>
                                </div>
                            </div>

                            <button onClick={simulateTamper} className="px-6 py-3 border border-red-500/50 text-red-500 hover:bg-red-900/20 rounded font-mono text-xs uppercase tracking-widest transition-colors w-full sm:w-auto text-center">
                                Simulate Cyber Attack
                            </button>
                        </div>
                    )}

                </div>
            </div>

            {/* Sidebar Details Panel (If Block Selected) - fixed overlay on mobile, static on desktop */}
            {selectedBlock && (
                <div className="fixed inset-y-0 right-0 w-full sm:w-96 md:static bg-[#151b26] border-l border-slate-700 z-30 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
                    <div className="p-6 border-b border-slate-700 flex justify-between items-start">
                        <div>
                            <h3 className="text-white font-bold text-lg uppercase mb-1">Block Detail</h3>
                            <div className="text-cyan-500 font-mono text-xs">#{selectedBlock.index} // {selectedBlock.caseId}</div>
                        </div>
                        <button onClick={() => setSelectedBlock(null)} className="text-slate-500 hover:text-white"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                    </div>
                    
                    <div ref={detailsRef} className="flex-grow overflow-y-auto p-6 space-y-6">
                        {selectedBlock.imageUrl && (
                            <div className="rounded-lg overflow-hidden border border-slate-600 shadow-lg mb-4">
                                <img src={selectedBlock.imageUrl} alt="Evidence" className="w-full h-auto" />
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <div className="text-[10px] text-slate-500 uppercase font-mono mb-1">Description</div>
                                <p className="text-sm text-slate-300 leading-relaxed">{selectedBlock.description}</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-[10px] text-slate-500 uppercase font-mono mb-1">Type</div>
                                    <div className="text-white font-bold text-sm">{selectedBlock.type}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] text-slate-500 uppercase font-mono mb-1">Officer ID</div>
                                    <div className="text-white font-bold text-sm">{selectedBlock.officerId}</div>
                                </div>
                            </div>

                            <div className="bg-black/30 p-4 rounded border border-slate-700 font-mono text-[10px] break-all">
                                <div className="mb-3">
                                    <div className="text-slate-500 mb-1">DIGITAL SIGNATURE</div>
                                    <div className="text-cyan-600">{selectedBlock.signature}</div>
                                </div>
                                <div className="mb-3">
                                    <div className="text-slate-500 mb-1">PREVIOUS HASH</div>
                                    <div className="text-slate-400">{selectedBlock.prevHash}</div>
                                </div>
                                <div>
                                    <div className="text-slate-500 mb-1">DATA HASH (SHA-256)</div>
                                    <div className="text-white font-bold">{selectedBlock.dataHash}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t border-slate-700 bg-[#0b0c10]">
                        <button 
                            onClick={handleDownload}
                            disabled={isExporting}
                            className="w-full py-3 bg-cyan-700 hover:bg-cyan-600 text-white font-bold text-xs uppercase tracking-widest rounded shadow-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isExporting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>}
                            <span>{isExporting ? 'ENCRYPTING...' : 'Download Secure Copy'}</span>
                        </button>
                    </div>
                </div>
            )}

        </div>
    </div>
  );
};
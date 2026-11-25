import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { ThreatAnalysis } from './ThreatAnalysis';
import { SecureEmail } from './SecureEmail';
import { SurveillanceCell } from './SurveillanceCell';
import { IncidentsCases } from './IncidentsCases';
import { CriminalRecords } from './CriminalRecords';
import { LiveTracking } from './LiveTracking';
import { SatelliteIntel } from './SatelliteIntel';
import { EncryptedComms } from './EncryptedComms';
import { CyberWarfare } from './CyberWarfare';
import { TacticalPlanner } from './TacticalPlanner';
import { DroneControl } from './DroneControl';
import { BiometricLab } from './BiometricLab';
import { PersonnelManagement } from './PersonnelManagement';
import { LogisticsManagement } from './LogisticsManagement';
import { EvidenceVault } from './EvidenceVault';
import { GeminiAIChat } from './GeminiAIChat';

declare global {
  interface Window {
    html2pdf: any;
  }
}

const App: React.FC = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [operativeId, setOperativeId] = useState('');
  const [passcode, setPasscode] = useState('');
  const [loginStatus, setLoginStatus] = useState<'idle' | 'error' | 'success'>('idle');
  const [showDashboard, setShowDashboard] = useState(false);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [showProfileOnMobile, setShowProfileOnMobile] = useState(false);
  
  // App State
  const [activeApp, setActiveApp] = useState<string | null>(null);
  const [biometricTargetCriminalId, setBiometricTargetCriminalId] = useState<string | null>(null);
  const [recordsTargetCriminalId, setRecordsTargetCriminalId] = useState<string | null>(null);
  
  // Search State
  const [showGeminiChat, setShowGeminiChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState('');
  const [searchSources, setSearchSources] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const resultContainerRef = useRef<HTMLDivElement>(null);

  const apps = [
    { id: 'threat_analysis', title: "Threat Analysis", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /> },
    { id: 'secure_email', title: "Secure Email", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /> },
    { id: 'surveillance', title: "Surveillance Cell", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /> },
    { id: 'incidents', title: "Incidents & Cases", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v8a2 2 0 01-2 2H5z" /> },
    { id: 'records', title: "Criminal Records", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0c0 .883-.393 1.627-1 2.143M16 20h4M4 20h4m-5-9h16" /> },
    { id: 'tracking', title: "Live Tracking", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" /> },
    { id: 'satellite', title: "Satellite Intel", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /> },
    { id: 'comms', title: "Encrypted Comms", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" /> },
    // New Apps
    { id: 'cyber', title: "Cyber Warfare", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /> },
    { id: 'tactical', title: "Tactical Planner", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /> },
    { id: 'drone', title: "Drone Command", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /> }, // Reusing generic paper plane for drone, or can customize
    { id: 'biometric', title: "Biometric Lab", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /> },
    { id: 'personnel', title: "Personnel & Clearance", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /> },
    { id: 'logistics', title: "Logistics & Resources", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /> },
    { id: 'vault', title: "Evidence Vault", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /> },
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (operativeId === 'G241697' && passcode === 'Shiv@2880') {
      setLoginStatus('success');
      setTimeout(() => setShowDashboard(true), 1500);
    } else {
      setLoginStatus('error');
      setTimeout(() => setLoginStatus('idle'), 2000);
    }
  };

  const handleLock = () => {
    setShowDashboard(false);
    setActiveApp(null);
    setSearchQuery('');
    setSearchResult('');
    setPasscode('');
    setLoginStatus('idle');
    setIsLogin(true);
  };

  const handleFullLogout = () => {
    setShowLogoutPopup(true);
    setTimeout(() => {
      setShowLogoutPopup(false);
      setShowDashboard(false);
      setIsLogin(false); // Go back to initial welcome screen state
      setOperativeId('');
      setPasscode('');
      setLoginStatus('idle');
      setActiveApp(null);
      setSearchQuery('');
      setSearchResult('');
    }, 2000);
  };

  const handleAppClick = (appId: string) => {
    setActiveApp(appId);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchResult('');
    setSearchSources([]);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Search for "${searchQuery}". Provide a detailed and comprehensive answer. If relevant images are found, please include them using standard Markdown image syntax (![alt text](image_url)). Format key points in bold.`;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] },
      });
      setSearchResult(response.text || 'No intelligence data retrieved.');
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      setSearchSources(chunks);
    } catch (error) {
      console.error("Search failed:", error);
      setSearchResult('ERROR: Secure connection to archive failed. Retrying uplink...');
    } finally {
      setIsSearching(false);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setSearchResult('');
    setSearchSources([]);
    setIsSearching(false);
  };

  const handlePrint = () => window.print();

  const handleExportPDF = () => {
    if (resultContainerRef.current && window.html2pdf) {
      setIsExporting(true);
      const element = resultContainerRef.current;
      const clone = element.cloneNode(true) as HTMLElement;
      // ... PDF generation logic (kept same as before) ...
      const headerDiv = document.createElement('div');
      headerDiv.innerHTML = `
        <div style="border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end;">
          <div><h1 style="font-size: 24px; font-weight: bold; margin: 0; text-transform: uppercase;">T.A.S.C. Intelligence Report</h1><p style="font-size: 12px; font-family: monospace; margin: 5px 0 0 0;">Ministry of Defence - Gov. of India</p></div>
          <div style="text-align: right;"><p style="font-size: 10px; font-family: monospace; margin: 0;">CLASSIFIED: OFFICIAL USE ONLY</p><p style="font-size: 10px; font-family: monospace; margin: 0;">DATE: ${new Date().toLocaleDateString()}</p></div>
        </div>`;
      clone.insertBefore(headerDiv, clone.firstChild);
      clone.classList.add('pdf-export-container');
      clone.style.padding = '20px';
      clone.style.width = '100%';
      clone.style.maxWidth = '100%';
      const buttons = clone.querySelectorAll('button');
      buttons.forEach(btn => btn.remove());
      const opt = { margin: 10, filename: `TASC_INTEL_${new Date().toISOString().slice(0,10)}.pdf`, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2, useCORS: true, logging: true }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } };
      window.html2pdf().from(clone).set(opt).save().then(() => setIsExporting(false)).catch((err: any) => { console.error('PDF Export Error:', err); setIsExporting(false); window.print(); });
    } else {
      window.print();
    }
  };

  const getLogoClasses = () => {
    if (showDashboard) { return 'top-4 md:top-6 left-4 md:left-6 scale-[0.10] sm:scale-[0.12] md:scale-[0.15] origin-top-left translate-x-0 translate-y-0'; }
    if (isLogin) { return 'top-1/4 md:top-1/2 left-1/2 -translate-x-1/2 md:-translate-x-[calc(50%+18rem)] -translate-y-1/2 scale-[0.5] sm:scale-75 md:scale-90'; }
    return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-[0.6] sm:scale-[0.8] md:scale-100';
  };

  const renderFormattedText = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(!\[.*?\]\(.*?\))/g);
    return parts.map((part, index) => {
      const imageMatch = part.match(/!\[(.*?)\]\((.*?)\)/);
      if (imageMatch) {
        return (
          <div key={index} className="my-6 rounded-lg border border-cyan-500/20 overflow-hidden bg-[#050a14]/50 backdrop-blur-sm shadow-lg max-w-2xl print:bg-transparent print:shadow-none print:border-gray-300">
            <div className="bg-cyan-950/40 px-3 py-2 border-b border-cyan-500/20 flex justify-between items-center print:hidden">
               <span className="text-[10px] text-cyan-400 font-mono uppercase tracking-wider">Visual Intelligence Asset</span>
               <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
            </div>
            <img src={imageMatch[2]} alt={imageMatch[1]} crossOrigin="anonymous" className="w-full h-auto object-cover max-h-[400px]" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </div>
        );
      }
      const subParts = part.split(/(\*\*.*?\*\*)/g);
      return <span key={index} className="text-white block mb-4 whitespace-pre-wrap font-sans text-sm md:text-base leading-relaxed">{subParts.map((subPart, subIndex) => { if (subPart.startsWith('**') && subPart.endsWith('**')) { return <strong key={subIndex} className="text-cyan-300 font-bold drop-shadow-[0_0_5px_rgba(34,211,238,0.3)] print:text-black print:drop-shadow-none">{subPart.slice(2, -2)}</strong>; } return subPart; })}</span>;
    });
  };

  return (
    <div 
      className={`relative min-h-screen w-full bg-[#050a14] overflow-hidden flex flex-col transition-colors duration-500 ${!isLogin ? 'cursor-pointer' : 'cursor-default'}`}
      onClick={() => !isLogin && !showDashboard && setIsLogin(true)}
    >
      <div className="absolute inset-0 bg-grid animate-grid-scroll pointer-events-none print:hidden" />
      <div className="absolute inset-0 pointer-events-none print:hidden" style={{ background: 'radial-gradient(circle at center, transparent 0%, #050a14 90%)' }} />
      
      {/* HEADER */}
      <div className={`absolute top-6 left-6 md:top-10 md:left-10 z-20 flex items-center space-x-3 md:space-x-5 pointer-events-none transition-opacity duration-700 ${showDashboard && !activeApp ? 'opacity-0' : !activeApp ? 'opacity-100' : 'opacity-0'} print:hidden`}>
        <div className="h-10 md:h-14 w-1 bg-cyan-400 rounded-sm shadow-[0_0_15px_rgba(34,211,238,0.8)]"></div>
        <div className="flex flex-col justify-center">
          <h1 className="text-white font-extrabold text-lg md:text-2xl tracking-widest font-sans leading-none mb-1">MINISTRY OF DEFENCE</h1>
          <p className="text-cyan-100/60 text-[10px] md:text-xs tracking-[0.25em] font-medium uppercase">Gov. of India</p>
        </div>
      </div>

      <div className={`fixed top-6 left-16 sm:left-20 md:left-32 z-30 h-[60px] flex flex-col justify-center transition-opacity duration-1000 delay-500 ${showDashboard && !activeApp ? 'opacity-100' : 'opacity-0 pointer-events-none'} print:hidden`}>
        <h1 className="text-white font-bold text-xs sm:text-sm md:text-lg tracking-widest font-sans leading-none mb-1 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">MINISTRY OF DEFENCE</h1>
        <p className="text-cyan-100/60 text-[8px] sm:text-[10px] tracking-[0.25em] font-medium uppercase">Gov. of India</p>
      </div>

      {/* Actions and Logout bar */}
      <div className={`fixed top-6 right-4 sm:right-10 z-50 flex items-center space-x-2 transition-opacity duration-1000 delay-500 ${showDashboard && !activeApp ? 'opacity-100' : 'opacity-0 pointer-events-none'} print:hidden`}>
        {/* Gemini AI Chat Trigger Button */}
        <button
          onClick={() => setShowGeminiChat(true)}
          className="flex items-center space-x-1.5 px-3 py-2 border border-cyan-400/50 text-cyan-300 font-mono text-[10px] bg-[#0a1525]/90 hover:bg-cyan-950/80 hover:border-cyan-300 transition-all rounded uppercase tracking-wider group shadow-[0_0_15px_rgba(34,211,238,0.25)]"
          title="Open T.A.S.C. Gemini 3.7 AI Tactical Assistant"
        >
          <svg className="w-3.5 h-3.5 text-cyan-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="font-bold">GEMINI AI</span>
          <span className="flex h-1.5 w-1.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </span>
        </button>

        {/* Profile Button - Only on Mobile */}
        <button 
          onClick={() => setShowProfileOnMobile(!showProfileOnMobile)}
          className="md:hidden flex items-center space-x-1.5 px-3 py-2 border border-cyan-500/30 text-cyan-400 font-mono text-[10px] bg-[#0a1525]/90 hover:bg-cyan-900/20 hover:border-cyan-500/60 transition-all rounded uppercase tracking-wider"
        >
          <span>{showProfileOnMobile ? 'CLOSE PROFILE' : 'PROFILE'}</span>
        </button>

        <button 
          onClick={handleFullLogout}
          className="flex items-center space-x-1.5 px-3 py-2 border border-red-500/30 text-red-400 font-mono text-[10px] bg-[#0a1525]/90 hover:bg-red-900/20 hover:border-red-500/60 transition-all rounded uppercase tracking-wider group"
        >
          <span className="hidden sm:inline">LOGOUT SYSTEM</span>
          <span className="sm:hidden">LOGOUT</span>
          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
        </button>
      </div>

      {/* Logout Popup */}
      {showLogoutPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#0a1525] border border-red-500/50 p-8 rounded-lg shadow-[0_0_50px_rgba(239,68,68,0.2)] text-center relative overflow-hidden">
             <div className="absolute inset-0 bg-red-500/5 animate-pulse"></div>
             <div className="w-16 h-16 border-2 border-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
             </div>
             <h2 className="text-2xl font-bold text-white uppercase tracking-widest mb-2 relative z-10">System Terminated</h2>
             <p className="text-red-400 font-mono text-sm tracking-wider relative z-10">LOGGED OUT FROM T.A.S.C. NETWORK</p>
             <div className="mt-4 w-full h-1 bg-gray-800 rounded-full overflow-hidden relative z-10">
                <div className="h-full bg-red-500 animate-[loading_2s_ease-in-out]"></div>
             </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div 
        className={`fixed top-20 md:top-28 bottom-4 md:bottom-10 left-4 md:left-6 right-4 md:right-auto md:w-96 border border-cyan-500/20 bg-[#0a1525]/95 md:bg-[#0a1525]/80 backdrop-blur-md z-40 transition-all duration-500 flex flex-col 
          ${showDashboard && !activeApp 
            ? (showProfileOnMobile ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-4 pointer-events-none md:opacity-100 md:translate-y-0 md:pointer-events-auto') 
            : 'opacity-0 pointer-events-none md:opacity-0 md:-translate-x-10'
          } print:hidden`}
      >
        {/* Sidebar content logic */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-500/50"></div>
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-500/50"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-500/50"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-500/50"></div>
        <div className="absolute inset-4 border border-cyan-500/10 pointer-events-none"></div>
        <div className="relative z-10 flex-grow overflow-y-auto scrollbar-hide flex flex-col items-center pt-8 md:pt-12 px-6 md:px-8 pb-4">
            <div className="relative flex-shrink-0">
                <div className="absolute -inset-2 border border-dashed border-cyan-500/30 rounded-full animate-spin-slow"></div>
                <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" alt="Operative" className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-cyan-400/50 object-cover shadow-[0_0_20px_rgba(34,211,238,0.3)] filter sepia-[0.2] brightness-90" />
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-[#0a1525] rounded-full shadow-[0_0_10px_rgba(34,197,94,1)] animate-pulse"></div>
            </div>
            <div className="mt-4 md:mt-5 text-center px-4 flex-shrink-0">
                <div className="text-white font-bold tracking-[0.1em] text-xs md:text-sm font-sans uppercase">Pol Shivtej Tulshidas</div>
                <div className="text-cyan-500/50 text-[9px] md:text-[10px] font-mono tracking-widest mt-1 uppercase">Field Commander T.A.S.C.</div>
            </div>
            <div className="mt-6 md:mt-8 w-full flex-shrink-0">
                <div className="relative py-3 md:py-4 border-t border-b border-cyan-500/10">
                    <p className="text-cyan-100/70 text-[10px] md:text-[11px] font-mono leading-relaxed text-justify">Distinguished tactical officer specializing in asymmetric warfare and counter-intelligence operations. Renowned for strategic foresight in high-stakes environments.</p>
                </div>
                <div className="mt-4 md:mt-6 flex flex-col items-center bg-cyan-950/20 p-3 md:p-4 rounded border border-cyan-500/10 mb-4 md:mb-6">
                    <div className="text-cyan-500/40 text-[8px] md:text-[9px] font-mono tracking-[0.2em] uppercase mb-1 md:mb-2">Operations Performed</div>
                    <div className="flex items-end space-x-2">
                        <span className="text-3xl md:text-4xl text-white font-bold font-sans tracking-widest drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">047</span>
                        <span className="text-[10px] md:text-xs text-green-400 font-mono mb-1 md:mb-2">COMPLETED</span>
                    </div>
                    <div className="w-full mt-2 md:mt-3 space-y-1">
                        <div className="flex justify-between text-[7px] md:text-[8px] text-cyan-500/60 font-mono"><span>SUCCESS RATE</span><span>98.4%</span></div>
                        <div className="w-full h-1 bg-cyan-900/30 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-cyan-500 to-green-400 w-[98%] shadow-[0_0_10px_rgba(34,211,238,0.5)]"></div></div>
                    </div>
                </div>
            </div>
        </div>
        <div className="relative z-10 px-6 md:px-8 pb-6 md:pb-8 pt-2 flex-shrink-0">
            <button onClick={handleLock} className="w-full group flex items-center justify-center space-x-2 py-2.5 md:py-3 bg-red-900/20 border border-red-500/30 hover:bg-red-900/40 hover:border-red-500/60 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)] transition-all duration-300 rounded">
                <div className="relative"><svg className="w-4 h-4 text-red-400 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg></div>
                <span className="text-red-400 text-[9px] md:text-[10px] font-bold font-mono tracking-[0.2em] uppercase">SECURE TERMINAL</span>
            </button>
        </div>
      </div>

      <div className={`fixed z-40 transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${getLogoClasses()} ${activeApp ? '!opacity-0 !pointer-events-none' : ''} print:hidden`}>
        {/* LOGO content */}
        <div className="relative flex items-center justify-center w-[400px] h-[400px]">
          <div className="absolute w-[550px] h-[550px] bg-[#050a14] rounded-full blur-2xl z-0"></div>
          <div className="absolute w-[400px] h-[400px] rounded-full border border-cyan-500/30 animate-ripple z-0"></div>
          <div className="absolute w-[400px] h-[400px] rounded-full border border-cyan-500/30 animate-ripple z-0" style={{ animationDelay: '1s' }}></div>
          <div className="absolute w-[400px] h-[400px] rounded-full border border-cyan-500/30 animate-ripple z-0" style={{ animationDelay: '2s' }}></div>
          <div className={`absolute w-[400px] h-[400px] rounded-full border transition-colors duration-500 ${loginStatus === 'error' ? 'border-red-500/50 shadow-[0_0_40px_rgba(239,68,68,0.4)]' : loginStatus === 'success' || showDashboard ? 'border-green-500/50 shadow-[0_0_40px_rgba(34,197,94,0.4)]' : 'border-cyan-500/50 shadow-[0_0_40px_rgba(6,182,212,0.4)]'} animate-spin-slower z-10`}>
             <div className={`absolute top-1/2 -right-1.5 w-3 h-3 rounded-full ${loginStatus === 'error' ? 'bg-red-400 shadow-[0_0_15px_rgba(239,68,68,1)]' : loginStatus === 'success' || showDashboard ? 'bg-green-400 shadow-[0_0_15px_rgba(34,197,94,1)]' : 'bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,1)]'}`}></div>
          </div>
          <div className="absolute w-[336px] h-[336px] rounded-full border border-dashed border-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.2)] animate-spin-reverse-slow z-10"></div>
          <div className="absolute w-[416px] h-[416px] rounded-full border-t-2 border-b-2 border-l-0 border-r-0 border-cyan-500/30 rotate-45 animate-pulse z-10"></div>
          <div className="relative flex flex-col items-center justify-center z-20">
            <div className="absolute inset-0 flex items-center justify-center -translate-y-4">
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="National Emblem of India" className="w-52 h-auto filter invert opacity-50 drop-shadow-[0_0_20px_rgba(34,211,238,0.4)]" draggable={false} />
            </div>
            <h2 className="relative z-10 text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-50 to-cyan-300 tracking-[0.15em] drop-shadow-[0_0_25px_rgba(34,211,238,0.8)] select-none">T.A.S.C.</h2>
            <div className="relative z-10 mt-6 px-8 py-2 bg-[#0a1525]/90 backdrop-blur-md border border-cyan-500/40 rounded-full shadow-[0_0_35px_rgba(34,211,238,0.3)] whitespace-nowrap"><span className="text-cyan-400 text-xs font-mono font-bold tracking-[0.3em] uppercase glow-text shadow-cyan-400/50 drop-shadow-md">Threat Analysis and Surveillance Cell</span></div>
          </div>
        </div>
      </div>

      <div className="relative z-10 w-full h-full flex-grow">
        {/* Login Container */}
        <div className={`absolute top-0 right-0 w-full h-full flex items-center justify-center md:justify-end md:pr-[10%] pointer-events-none print:hidden`}>
          <div className={`w-full max-w-sm pointer-events-auto transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] ${isLogin && !showDashboard ? 'opacity-100 translate-y-24 md:translate-y-0 translate-x-0' : 'opacity-0 translate-x-[100px] pointer-events-none'}`} onClick={(e) => e.stopPropagation()}>
            <div className={`relative bg-[#050a14]/80 backdrop-blur-xl border transition-colors duration-300 ${loginStatus === 'error' ? 'border-red-500/50' : loginStatus === 'success' ? 'border-green-500/50' : 'border-cyan-500/30'} p-8 rounded-sm shadow-[0_0_30px_rgba(34,211,238,0.15)] overflow-hidden`}>
              {/* Login Form content ... */}
              <div className={`absolute top-0 left-0 w-16 h-[2px] ${loginStatus === 'error' ? 'bg-red-400 shadow-[0_0_10px_red]' : loginStatus === 'success' ? 'bg-green-400 shadow-[0_0_10px_green]' : 'bg-cyan-400 shadow-[0_0_10px_cyan]'}`}></div>
              <div className={`absolute top-0 right-0 w-[2px] h-16 ${loginStatus === 'error' ? 'bg-red-400 shadow-[0_0_10px_red]' : loginStatus === 'success' ? 'bg-green-400 shadow-[0_0_10px_green]' : 'bg-cyan-400 shadow-[0_0_10px_cyan]'}`}></div>
              <div className={`absolute bottom-0 right-0 w-16 h-[2px] ${loginStatus === 'error' ? 'bg-red-400 shadow-[0_0_10px_red]' : loginStatus === 'success' ? 'bg-green-400 shadow-[0_0_10px_green]' : 'bg-cyan-400 shadow-[0_0_10px_cyan]'}`}></div>
              <div className={`absolute bottom-0 left-0 w-[2px] h-16 ${loginStatus === 'error' ? 'bg-red-400 shadow-[0_0_10px_red]' : loginStatus === 'success' ? 'bg-green-400 shadow-[0_0_10px_green]' : 'bg-cyan-400 shadow-[0_0_10px_cyan]'}`}></div>
              <div className={`mb-8 border-b ${loginStatus === 'error' ? 'border-red-500/20' : loginStatus === 'success' ? 'border-green-500/20' : 'border-cyan-500/20'} pb-4`}>
                <h3 className="text-2xl text-white font-bold tracking-wider font-sans">{loginStatus === 'success' ? 'ACCESS GRANTED' : loginStatus === 'error' ? 'ACCESS DENIED' : 'IDENTIFICATION'}</h3>
                <p className={`${loginStatus === 'error' ? 'text-red-400/60' : loginStatus === 'success' ? 'text-green-400/60' : 'text-cyan-400/60'} text-xs font-mono mt-1 tracking-widest uppercase`}>{loginStatus === 'success' ? 'Welcome, Operative' : loginStatus === 'error' ? 'Invalid Credentials' : 'Secure Access Terminal'}</p>
              </div>
              {loginStatus === 'success' ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-4 animate-pulse">
                  <div className="w-16 h-16 rounded-full border-2 border-green-500 flex items-center justify-center"><svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></div>
                  <div className="text-green-400 font-mono text-sm tracking-widest">INITIALIZING...</div>
                </div>
              ) : (
                <form className="space-y-6" onSubmit={handleLogin}>
                  <div className="group">
                    <label className={`block ${loginStatus === 'error' ? 'text-red-400/80' : 'text-cyan-400/80'} text-[10px] uppercase tracking-[0.2em] font-mono mb-2 transition-colors`}>Operative ID</label>
                    <input type="text" value={operativeId} onChange={(e) => setOperativeId(e.target.value)} className={`w-full bg-cyan-950/20 border-b ${loginStatus === 'error' ? 'border-red-500/50 focus:border-red-400' : 'border-cyan-500/30 focus:border-cyan-400'} text-white font-mono text-sm py-2 px-3 focus:outline-none focus:bg-cyan-950/40 transition-all placeholder-cyan-800/50`} placeholder="OP-XXXX-XX" autoFocus={isLogin} />
                  </div>
                  <div className="group">
                    <label className={`block ${loginStatus === 'error' ? 'text-red-400/80' : 'text-cyan-400/80'} text-[10px] uppercase tracking-[0.2em] font-mono mb-2 transition-colors`}>Passcode</label>
                    <input type="password" value={passcode} onChange={(e) => setPasscode(e.target.value)} className={`w-full bg-cyan-950/20 border-b ${loginStatus === 'error' ? 'border-red-500/50 focus:border-red-400' : 'border-cyan-500/30 focus:border-cyan-400'} text-white font-mono text-sm py-2 px-3 focus:outline-none focus:bg-cyan-950/40 transition-all placeholder-cyan-800/50`} placeholder="••••••••••••" />
                  </div>
                  <button type="submit" className={`w-full mt-8 ${loginStatus === 'error' ? 'bg-red-500/10 hover:bg-red-400/20 border-red-500/50 text-red-400 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]' : 'bg-cyan-500/10 hover:bg-cyan-400/20 border-cyan-500/50 text-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.3)]'} border font-mono text-xs font-bold py-3 px-4 uppercase tracking-[0.2em] transition-all hover:text-white flex items-center justify-center group`}>
                    <span className="mr-2 group-hover:animate-pulse">Authenticate</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Existing Apps */}
        {activeApp === 'threat_analysis' && ( <ThreatAnalysis onClose={() => setActiveApp(null)} /> )}
        {activeApp === 'secure_email' && ( <SecureEmail onClose={() => setActiveApp(null)} onLogout={handleLock} /> )}
        {activeApp === 'surveillance' && ( <SurveillanceCell onClose={() => setActiveApp(null)} /> )}
        {activeApp === 'incidents' && ( <IncidentsCases onClose={() => setActiveApp(null)} /> )}
        {activeApp === 'records' && ( 
          <CriminalRecords 
            onClose={() => {
              setActiveApp(null);
              setRecordsTargetCriminalId(null);
            }} 
            initialCriminalId={recordsTargetCriminalId}
            onOpenBiometricLab={(crimId) => {
              setBiometricTargetCriminalId(crimId);
              setActiveApp('biometric');
            }}
          /> 
        )}
        {activeApp === 'tracking' && ( <LiveTracking onClose={() => setActiveApp(null)} /> )}
        {activeApp === 'satellite' && ( <SatelliteIntel onClose={() => setActiveApp(null)} /> )}
        {activeApp === 'comms' && ( <EncryptedComms onClose={() => setActiveApp(null)} /> )}
        
        {/* NEW APPS */}
        {activeApp === 'cyber' && ( <CyberWarfare onClose={() => setActiveApp(null)} /> )}
        {activeApp === 'tactical' && ( <TacticalPlanner onClose={() => setActiveApp(null)} /> )}
        {activeApp === 'drone' && ( <DroneControl onClose={() => setActiveApp(null)} /> )}
        {activeApp === 'biometric' && ( 
          <BiometricLab 
            onClose={() => {
              setActiveApp(null);
              setBiometricTargetCriminalId(null);
            }} 
            initialCriminalId={biometricTargetCriminalId}
            onOpenCriminalRecords={(crimId) => {
              setRecordsTargetCriminalId(crimId || null);
              setActiveApp('records');
            }}
          /> 
        )}
        {activeApp === 'personnel' && ( <PersonnelManagement onClose={() => setActiveApp(null)} /> )}
        {activeApp === 'logistics' && ( <LogisticsManagement onClose={() => setActiveApp(null)} /> )}
        {activeApp === 'vault' && ( <EvidenceVault onClose={() => setActiveApp(null)} /> )}

        {/* Dashboard Main Content Area */}
        <div className={`absolute top-24 md:top-28 bottom-4 md:bottom-10 left-4 md:left-[440px] right-4 md:right-10 transition-all duration-1000 ${showDashboard && !activeApp ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'} print:hidden`}>
            {/* Standard Dashboard Content */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden print:hidden">
                <div className="relative flex items-center justify-center opacity-10 scale-[0.6] sm:scale-90">
                    <div className="absolute w-[600px] h-[600px] border border-cyan-500/20 rounded-full animate-spin-slower"></div>
                    <div className="absolute w-[500px] h-[500px] border border-dashed border-cyan-500/20 rounded-full animate-spin-reverse-slower"></div>
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Watermark" className="w-64 h-auto filter invert opacity-50" />
                    <h1 className="absolute mt-80 text-7xl md:text-9xl font-bold text-cyan-500/20 tracking-widest select-none font-sans">T.A.S.C.</h1>
                </div>
            </div>
            {/* Search Bar & Grid */}
            <div className="relative z-10 w-full h-full flex flex-col justify-start items-center transition-all duration-700 ease-in-out">
                <div className="w-full max-w-3xl mb-4 transition-all duration-700 ease-in-out print:hidden flex items-center gap-2.5">
                    <form onSubmit={handleSearch} className="relative group flex-1">
                        <div className="absolute inset-y-0 left-0 pl-4 md:pl-6 flex items-center pointer-events-none z-10">
                            {!!searchResult ? ( <svg className="w-4 h-4 md:w-5 md:h-5 text-green-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg> ) : ( <svg className="w-4 h-4 md:w-5 md:h-5 text-cyan-500/70 group-focus-within:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg> )}
                        </div>
                        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} disabled={isSearching || !!searchResult} placeholder={!!searchResult ? "SESSION LOCKED - REPORT" : "Search T.A.S.C. Archives..."} className={`block w-full pl-11 md:pl-16 pr-20 md:pr-28 py-3 md:py-4 bg-[#0a1525]/90 backdrop-blur-xl border rounded-full text-white placeholder-cyan-500/40 focus:outline-none transition-all font-mono text-xs md:text-lg shadow-2xl ${!!searchResult ? 'border-green-500/40 cursor-not-allowed text-green-300 opacity-90' : 'border-cyan-500/30 focus:border-cyan-400 focus:shadow-[0_0_25px_rgba(34,211,238,0.25)] hover:shadow-[0_0_15px_rgba(34,211,238,0.1)] hover:border-cyan-500/50'}`} />
                        <div className="absolute inset-y-0 right-3 flex items-center space-x-1.5">
                            {searchQuery && ( <button type="button" onClick={handleClear} className="p-1.5 rounded-full text-cyan-500/50 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button> )}
                            <button type="submit" disabled={isSearching || !!searchResult} className="p-1.5 rounded-full hover:bg-cyan-500/10 text-cyan-500/70 hover:text-cyan-400 transition-colors disabled:opacity-50">{isSearching ? ( <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div> ) : ( <svg className="w-4 h-4 md:w-6 md:h-6 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg> )}</button>
                        </div>
                    </form>

                    {/* AI Symbol & Gemini AI Button at right side end */}
                    <button
                        type="button"
                        onClick={() => setShowGeminiChat(true)}
                        className="relative group flex items-center space-x-2 px-3.5 md:px-5 py-3 md:py-4 bg-[#0a1525]/90 hover:bg-cyan-950/90 backdrop-blur-xl border border-cyan-500/40 hover:border-cyan-300 rounded-full text-cyan-300 font-mono text-xs md:text-sm shadow-2xl hover:shadow-[0_0_25px_rgba(34,211,238,0.4)] transition-all shrink-0 cursor-pointer"
                        title="Open T.A.S.C. Gemini AI Tactical Chat Assistant"
                    >
                        <div className="relative flex items-center justify-center">
                            <span className="absolute -inset-1 rounded-full bg-cyan-400/30 animate-pulse blur-sm"></span>
                            <svg className="w-5 h-5 md:w-6 md:h-6 text-cyan-300 group-hover:scale-110 transition-transform relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <span className="hidden sm:inline font-bold tracking-wider text-white group-hover:text-cyan-300">
                            GEMINI AI
                        </span>
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                    </button>
                </div>
                {!searchResult && !isSearching && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 w-full max-w-5xl mt-4 md:mt-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200 print:hidden overflow-y-auto max-h-[55vh] md:max-h-[60vh] pb-10 scrollbar-hide">
                        {apps.map((app, index) => ( <div key={index} onClick={() => handleAppClick(app.id)} className="flex flex-col items-center justify-center p-6 bg-[#0a1525]/30 border border-cyan-500/20 hover:bg-cyan-500/10 hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(34,211,238,0.15)] transition-all duration-300 rounded-2xl cursor-pointer group backdrop-blur-sm h-32"><div className="mb-3 text-cyan-500/70 group-hover:text-cyan-400 group-hover:scale-110 transition-all duration-300 transform"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">{app.icon}</svg></div><span className="text-[10px] uppercase tracking-[0.2em] text-cyan-500/60 font-mono group-hover:text-cyan-300 text-center">{app.title}</span></div> ))}
                    </div>
                )}
                {/* Results Area */}
                {(isSearching || searchResult) && (
                    <div id="printable-area" className="flex-grow w-full overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-cyan-500/20 scrollbar-track-transparent animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-forwards" ref={resultContainerRef}>
                        {!isSearching && searchResult && (
                          <div className="w-full flex justify-end space-x-4 mb-4 print:hidden">
                              <button onClick={handlePrint} className="flex items-center space-x-2 px-3 py-1.5 bg-cyan-900/30 border border-cyan-500/30 rounded hover:bg-cyan-500/20 hover:border-cyan-400 transition-all text-cyan-400 text-xs font-mono tracking-wider"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2-4h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6a2 2 0 012-2zm9-2a1 1 0 11-14 0 1 1 0 0114 0z" /></svg><span>PRINT PROTOCOL</span></button>
                              <button onClick={handleExportPDF} disabled={isExporting} className="flex items-center space-x-2 px-3 py-1.5 bg-cyan-900/30 border border-cyan-500/30 rounded hover:bg-cyan-500/20 hover:border-cyan-400 transition-all text-cyan-400 text-xs font-mono tracking-wider disabled:opacity-50 disabled:cursor-not-allowed">{isExporting ? ( <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div> ) : ( <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg> )}<span>{isExporting ? 'PROCESSING...' : 'EXPORT PDF'}</span></button>
                          </div>
                        )}
                        {isSearching ? (
                            <div className="flex flex-col items-center justify-center h-64 space-y-6 opacity-80 mt-10 print:hidden">
                                <div className="text-cyan-400 font-mono text-sm tracking-[0.3em] animate-pulse">ESTABLISHING SECURE UPLINK</div>
                                <div className="w-96 h-1 bg-cyan-900/30 rounded-full overflow-hidden relative"><div className="absolute inset-y-0 left-0 bg-cyan-400 w-1/3 animate-[shimmer_1.5s_infinite_linear] rounded-full shadow-[0_0_10px_cyan]"></div></div>
                                <div className="font-mono text-[10px] text-cyan-600">DECRYPTING PACKETS...</div>
                            </div>
                        ) : (
                            <div className="prose prose-invert text-white prose-lg prose-p:text-cyan-100/80 prose-headings:text-cyan-400 prose-headings:font-sans prose-headings:tracking-wider prose-strong:text-cyan-300 prose-a:text-cyan-400 hover:prose-a:text-cyan-300 max-w-none pb-20 px-4 print:prose-neutral print:max-w-full">
                                {renderFormattedText(searchResult)}
                                {searchSources.length > 0 && (
                                    <div className="mt-12 pt-8 border-t border-cyan-500/10 print:border-black/20">
                                        <div className="flex items-center space-x-2 mb-6"><div className="w-1.5 h-1.5 bg-cyan-500 rounded-full shadow-[0_0_5px_cyan] print:hidden"></div><div className="text-cyan-500/60 text-xs font-mono uppercase tracking-[0.2em] print:text-black">Verified Source Intelligence</div></div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 print:grid-cols-2">
                                            {searchSources.map((source, idx) => {
                                                const uri = source.web?.uri || source.uri;
                                                const title = source.web?.title || source.title || 'Encrypted Source';
                                                if(!uri) return null;
                                                return ( <a key={idx} href={uri} target="_blank" rel="noreferrer" className="group flex flex-col p-4 bg-[#0a1525]/40 hover:bg-[#0a1525]/80 border border-cyan-500/10 hover:border-cyan-500/40 rounded-lg transition-all duration-300 hover:shadow-[0_0_15px_rgba(34,211,238,0.1)] print:bg-white print:border-gray-300 print:shadow-none print:no-underline"><span className="text-cyan-300 font-bold text-sm truncate w-full group-hover:text-white transition-colors print:text-black">{title}</span><span className="text-cyan-600 text-[10px] font-mono mt-1 truncate w-full print:text-gray-600">{new URL(uri).hostname}</span></a> )
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>

      </div>

      <div className={`absolute bottom-10 w-full flex justify-between px-10 pointer-events-none transition-opacity duration-700 ${showDashboard && !activeApp ? 'opacity-0' : !activeApp ? 'opacity-50' : 'opacity-0'} print:hidden`}>
        <div className="flex space-x-2">
           <div className={`w-2 h-2 ${loginStatus === 'error' ? 'bg-red-400 shadow-[0_0_8px_rgba(239,68,68,0.8)]' : loginStatus === 'success' || showDashboard ? 'bg-green-400 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]'} rounded-full animate-pulse`}></div>
           <div className={`w-2 h-2 ${loginStatus === 'error' ? 'bg-red-400 shadow-[0_0_8px_rgba(239,68,68,0.8)]' : loginStatus === 'success' || showDashboard ? 'bg-green-400 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]'} rounded-full animate-pulse delay-75`}></div>
           <div className={`w-2 h-2 ${loginStatus === 'error' ? 'bg-red-400 shadow-[0_0_8px_rgba(239,68,68,0.8)]' : loginStatus === 'success' || showDashboard ? 'bg-green-400 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]'} rounded-full animate-pulse delay-150`}></div>
        </div>
        <div className={`text-xs ${loginStatus === 'error' ? 'text-red-400 shadow-red-500/50' : loginStatus === 'success' || showDashboard ? 'text-green-400 shadow-green-500/50' : 'text-cyan-400 shadow-cyan-500/50'} font-mono tracking-widest`}>
          {showDashboard ? '' : loginStatus === 'success' ? 'SYSTEM UNLOCKED' : loginStatus === 'error' ? 'SECURITY BREACH' : 'SYSTEM ACTIVE'}
        </div>
      </div>

      {/* Gemini AI Chat Drawer / Modal */}
      {showGeminiChat && (
        <GeminiAIChat onClose={() => setShowGeminiChat(false)} />
      )}
    </div>
  );
};

export default App;
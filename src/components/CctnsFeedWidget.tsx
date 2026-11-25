import React, { useState, useEffect } from 'react';
import { Case, UPCOMING_INDIAN_CASES } from '../data/casesData';

interface CctnsFeedWidgetProps {
  onCaseArrived: (newCase: Case) => void;
  existingCases: Case[];
}

export const CctnsFeedWidget: React.FC<CctnsFeedWidgetProps> = ({ onCaseArrived, existingCases }) => {
  const [timeLeft, setTimeLeft] = useState(120); // 2-minute countdown (120 seconds)
  const [isScanning, setIsScanning] = useState(true);
  const [recentArrivals, setRecentArrivals] = useState<{ id: string; state: string; time: string; title: string }[]>([]);
  const [activeAlarm, setActiveAlarm] = useState<Case | null>(null);

  // Connection nodes list for visual polish
  const statesNodeList = [
    { code: 'KL-POL', name: 'Kerala', ping: '12ms', status: 'ONLINE' },
    { code: 'MH-POL', name: 'Maharashtra', ping: '18ms', status: 'ONLINE' },
    { code: 'DL-POL', name: 'Delhi', ping: '8ms', status: 'ONLINE' },
    { code: 'AS-POL', name: 'Assam', ping: '24ms', status: 'ONLINE' },
    { code: 'KA-POL', name: 'Karnataka', ping: '14ms', status: 'ONLINE' },
    { code: 'JK-POL', name: 'J&K', ping: '31ms', status: 'ONLINE' },
    { code: 'PB-POL', name: 'Punjab', ping: '19ms', status: 'ONLINE' },
    { code: 'WB-POL', name: 'West Bengal', ping: '22ms', status: 'ONLINE' }
  ];

  // Tick countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Trigger auto case arrival
          triggerRandomArrival();
          return 120; // reset
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [existingCases]);

  // Format countdown into mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Helper to trigger random case arrival from the pool
  const triggerRandomArrival = () => {
    // Find cases that haven't been added yet
    const existingIds = existingCases.map(c => c.id);
    const availablePool = UPCOMING_INDIAN_CASES.filter(c => !existingIds.includes(c.id));
    
    let selected: Case;
    if (availablePool.length > 0) {
      // Pick one from pool
      selected = availablePool[Math.floor(Math.random() * availablePool.length)];
    } else {
      // If all added, generate a cloned new case with randomized suffix
      const base = UPCOMING_INDIAN_CASES[Math.floor(Math.random() * UPCOMING_INDIAN_CASES.length)];
      const newId = `CASE-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      selected = {
        ...base,
        id: newId,
        title: `${base.title} [UPLINKED-${Math.floor(10 + Math.random() * 89)}]`
      };
    }

    // Set alarm popup to notify user
    setActiveAlarm(selected);
    
    // Add to recent log
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setRecentArrivals(prev => [
      { 
        id: selected.id, 
        state: selected.originState || 'CCTNS Grid', 
        time: nowStr, 
        title: selected.title 
      },
      ...prev.slice(0, 4)
    ]);
  };

  // Acknowledge alarm and merge case into main state database
  const handleAcknowledge = () => {
    if (activeAlarm) {
      onCaseArrived(activeAlarm);
      setActiveAlarm(null);
    }
  };

  return (
    <div className="bg-[#0b101d] border border-cyan-500/20 rounded-lg p-4 space-y-4 shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
      
      {/* Radar Scan & Timer Panel */}
      <div className="flex items-center justify-between border-b border-cyan-500/10 pb-3">
        <div className="flex items-center space-x-3">
          <div className="relative w-8 h-8 rounded-full border border-cyan-500/30 flex items-center justify-center overflow-hidden bg-black/40 shrink-0">
            {/* Pulsing scanning sweeps */}
            <div className="absolute inset-0 border-r-2 border-cyan-500/50 animate-spin" style={{ animationDuration: '3s' }}></div>
            <div className="absolute w-6 h-6 rounded-full border border-cyan-500/10"></div>
            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse z-10"></span>
          </div>
          <div>
            <h4 className="text-[10px] uppercase font-mono tracking-widest text-cyan-400 font-bold">CCTNS NATIONAL LINK</h4>
            <p className="text-[8px] text-slate-500 font-mono">STATE DISPATCH REAL-TIME POLLING</p>
          </div>
        </div>

        {/* Live Timer Countdown */}
        <div className="text-right">
          <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">NEXT AUTOMATED SYNC</div>
          <div className="text-xs sm:text-sm font-mono font-bold text-amber-500 animate-pulse tracking-widest">
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      {/* Connected State Node Grid (Flashing Node Grid) */}
      <div className="grid grid-cols-4 gap-1.5 py-1">
        {statesNodeList.map((node) => (
          <div key={node.code} className="bg-[#0e1628] border border-cyan-500/5 p-1 rounded flex flex-col justify-center items-center text-center">
            <div className="flex items-center space-x-1">
              <span className="w-1 h-1 bg-green-500 rounded-full animate-ping"></span>
              <span className="text-[8px] font-bold text-slate-300 font-mono">{node.code}</span>
            </div>
            <span className="text-[6px] text-slate-500 font-mono truncate max-w-full">{node.name}</span>
          </div>
        ))}
      </div>

      {/* Manual Gateway Dispatch Trigger Button */}
      <button
        onClick={triggerRandomArrival}
        className="w-full py-1.5 bg-cyan-950/40 border border-cyan-500/30 hover:bg-cyan-500/20 text-[9px] font-mono font-bold text-cyan-400 hover:text-white uppercase tracking-widest rounded transition-all flex items-center justify-center space-x-2"
      >
        <svg className="w-3.5 h-3.5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ animationDuration: '6s' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H17" />
        </svg>
        <span>MANUALLY INGEST STATE DISPATCH</span>
      </button>

      {/* Recent Case Arrivals Log */}
      <div className="space-y-2">
        <h5 className="text-[8px] uppercase tracking-wider font-mono text-slate-500 font-bold border-b border-cyan-500/5 pb-1">RECENT UPLINK HISTORY</h5>
        {recentArrivals.length === 0 ? (
          <div className="text-[8px] font-mono text-slate-600 italic py-2 text-center">No recent automatic case arrivals logged.</div>
        ) : (
          <div className="space-y-1 max-h-[110px] overflow-y-auto pr-1">
            {recentArrivals.map((log) => (
              <div key={log.id} className="bg-black/30 border border-slate-800 p-1.5 rounded flex justify-between items-center text-[8px] font-mono">
                <div className="truncate max-w-[130px]">
                  <span className="text-cyan-400 font-bold">[{log.state}]</span>{' '}
                  <span className="text-slate-300">{log.title}</span>
                </div>
                <div className="text-slate-500 shrink-0 text-right">
                  <div>{log.id}</div>
                  <div>{log.time}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Flashing Full-Screen/HUD Intercept Overlay (When case arrives in 2 min cycle) */}
      {activeAlarm && (
        <div className="fixed inset-0 z-[70] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#110505] border-2 border-red-500 rounded-lg shadow-[0_0_80px_rgba(239,68,68,0.25)] max-w-xl w-full p-6 relative flex flex-col space-y-4">
            
            {/* Flashing Alarms visual */}
            <div className="absolute top-0 inset-x-0 h-1 bg-red-600 animate-pulse"></div>
            
            <div className="flex items-center space-x-3 text-red-500 border-b border-red-900/30 pb-3">
              <svg className="w-6 h-6 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h3 className="text-sm font-bold font-mono tracking-widest uppercase">CCTNS SECURE LINK DETECTED</h3>
                <p className="text-[9px] text-red-400/70 font-mono uppercase">CRITICAL CASE DISPATCH TRANSMITTED FROM: {activeAlarm.originState?.toUpperCase() || 'STATE POLICE'}</p>
              </div>
            </div>

            {/* Case Intel details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Image Evidence */}
              <div className="sm:col-span-1 rounded border border-red-900/40 overflow-hidden relative aspect-square bg-slate-900">
                <img src={activeAlarm.evidence?.[0]} alt="Evidence preview" className="w-full h-full object-cover filter saturate-50 brightness-75 hover:saturate-100 transition-all" referrerPolicy="no-referrer" />
                <div className="absolute bottom-1 left-1 bg-black/80 px-1 py-0.5 rounded text-[6px] text-red-500 font-mono tracking-wide">SECURE PHOTO EVIDENCE</div>
              </div>

              {/* Text Intel */}
              <div className="sm:col-span-2 space-y-2">
                <div>
                  <span className="px-1.5 py-0.5 rounded bg-red-950/60 text-red-400 border border-red-800 text-[8px] font-bold font-mono uppercase">{activeAlarm.type}</span>
                  <span className="ml-2 font-mono text-[9px] text-red-400/80 font-bold">#{activeAlarm.id}</span>
                </div>
                
                <h4 className="text-white text-xs font-bold leading-snug">{activeAlarm.title}</h4>
                <p className="text-[10px] text-slate-400 leading-normal line-clamp-3 font-sans italic">"{activeAlarm.description}"</p>
                
                <div className="text-[8px] font-mono text-slate-500">
                  <span className="text-red-400 font-bold">STATION:</span> {activeAlarm.policeStation}
                </div>
              </div>

            </div>

            {/* Handling Officer Profile */}
            <div className="bg-red-950/15 border border-red-900/30 p-3 rounded flex items-center space-x-3">
              <img src={activeAlarm.officer?.image} alt={activeAlarm.officer?.name} className="w-10 h-10 rounded-full border border-red-500 object-cover shrink-0 filter brightness-90 saturate-50" referrerPolicy="no-referrer" />
              <div className="min-w-0">
                <div className="text-[7px] text-red-400 uppercase font-mono tracking-widest font-bold">STATE DETECTIVE ASSIGNED // CLEARANCE LEVEL: {activeAlarm.officer?.clearance}</div>
                <div className="text-white font-bold text-xs truncate">{activeAlarm.officer?.name}</div>
                <div className="text-[9px] text-slate-400 truncate">{activeAlarm.officer?.rank} ({activeAlarm.officer?.unit})</div>
                <div className="text-[8px] text-slate-500 font-mono uppercase">BADGE ID: {activeAlarm.officer?.id}</div>
              </div>
            </div>

            {/* Action controls */}
            <div className="pt-3 border-t border-red-900/20 flex gap-2">
              <button
                onClick={handleAcknowledge}
                className="flex-1 py-2.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-mono text-xs font-bold uppercase tracking-widest rounded transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)] text-center flex items-center justify-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>ACKNOWLEDGE & INGEST DOSSIER RECORD</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

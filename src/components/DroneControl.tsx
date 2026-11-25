import React, { useState, useRef, useEffect } from 'react';

const DRONES = [
    { 
        id: 'UAV-01', 
        model: 'MQ-9 Reaper', 
        status: 'AIRBORNE', 
        battery: 78, 
        alt: 15000, 
        speed: 240, 
        lat: 34.15, 
        lng: 75.10,
        // High-altitude Mountains
        footage: 'https://videos.pexels.com/video-files/856973/856973-hd_1920_1080_25fps.mp4'
    },
    { 
        id: 'UAV-02', 
        model: 'Heron TP', 
        status: 'LOITERING', 
        battery: 45, 
        alt: 12000, 
        speed: 180, 
        lat: 28.60, 
        lng: 77.20,
        // Night City Traffic - High Contrast for Thermal Layer
        footage: 'https://videos.pexels.com/video-files/855564/855564-hd_1920_1080_24fps.mp4'
    },
    { 
        id: 'UAV-03', 
        model: 'Switchblade', 
        status: 'PATROL', 
        battery: 88, 
        alt: 500, 
        speed: 60, 
        lat: 26.90, 
        lng: 75.80,
        // Dark Rural Road - Perfect for Night Vision Demo
        footage: 'https://videos.pexels.com/video-files/5028566/5028566-hd_1920_1080_24fps.mp4'
    },
];

interface DroneControlProps {
  onClose: () => void;
}

export const DroneControl: React.FC<DroneControlProps> = ({ onClose }) => {
  const [activeDrone, setActiveDrone] = useState(DRONES[0]);
  const [viewMode, setViewMode] = useState<'THERMAL' | 'NIGHT' | 'OPTICAL'>('OPTICAL');
  
  // Target Position State (Percent)
  const [targetPos, setTargetPos] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [isEngaged, setIsEngaged] = useState(false);
  const [showEngagedPopup, setShowEngagedPopup] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Helper to get filter classes based on mode
  const getViewFilter = () => {
      switch (viewMode) {
          case 'THERMAL':
              // Vibrant Heatmap: High contrast, Sepia base shifted to Red/Orange/Yellow
              // Creates a "White Hot/Red Hot" intensity scale
              return 'filter contrast(1.5) brightness(1.2) saturate(400%) sepia(1) hue-rotate(-30deg)';
          case 'NIGHT':
              // Greenish tint, high contrast, extreme brightness boost to see in dark
              return 'filter sepia(1) hue-rotate(90deg) contrast(1.2) brightness(3.0) saturate(0.5)';
          case 'OPTICAL':
          default:
              // Slight desaturation and contrast for realism
              return 'filter contrast-110 saturate-75';
      }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
      setIsDragging(true);
      e.stopPropagation();
      e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      // Calculate percentage position
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      // Clamp to screen bounds (with some padding for the crosshair size)
      setTargetPos({ 
          x: Math.max(0, Math.min(100, x)), 
          y: Math.max(0, Math.min(100, y)) 
      });
  };

  const handleMouseUp = () => {
      setIsDragging(false);
  };

  const handleEngageToggle = () => {
      if (isEngaged) {
          setIsEngaged(false);
      } else {
          setIsEngaged(true);
          setShowEngagedPopup(true);
          setTimeout(() => setShowEngagedPopup(false), 3000);
      }
  };

  // Simulated Auto-Tracking Effect when Engaged
  useEffect(() => {
      let interval: any;
      if (isEngaged && !isDragging) {
          interval = setInterval(() => {
              setTargetPos(prev => {
                  // Simulate realistic tracking jitter/movement (e.g., following a vehicle)
                  // Slow drift + random micro-jitter
                  const driftX = (Math.sin(Date.now() / 1000) * 0.1) + (Math.random() - 0.5) * 0.2;
                  const driftY = (Math.cos(Date.now() / 800) * 0.1) + (Math.random() - 0.5) * 0.2;
                  
                  return {
                      x: Math.max(5, Math.min(95, prev.x + driftX)),
                      y: Math.max(5, Math.min(95, prev.y + driftY))
                  };
              });
          }, 50);
      }
      return () => clearInterval(interval);
  }, [isEngaged, isDragging]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col font-mono text-cyan-400 animate-in fade-in duration-300">
        
        {/* HUD Overlay Container */}
        <div 
            ref={containerRef}
            className={`relative flex-grow bg-gray-900 overflow-hidden group ${isDragging ? 'cursor-grabbing' : 'cursor-default'}`}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            
            {/* Real Video Feed */}
            <div className="absolute inset-0 z-0">
                <video
                    key={activeDrone.id} // Forces re-render when drone changes
                    src={activeDrone.footage}
                    className={`w-full h-full object-cover transition-all duration-700 ${getViewFilter()}`}
                    autoPlay
                    loop
                    muted
                    playsInline
                    crossOrigin="anonymous"
                />
                
                {/* Mode Specific Overlays */}
                {viewMode === 'NIGHT' && (
                    <div className="absolute inset-0 bg-green-500/10 mix-blend-overlay pointer-events-none"></div>
                )}
                {/* For Thermal, we add a gradient overlay to enhance the multi-color effect if needed, 
                    but the filter does most of the work. Adding a subtle vignette. */}
                {viewMode === 'THERMAL' && (
                    <div className="absolute inset-0 bg-gradient-to-t from-red-900/30 via-transparent to-yellow-500/10 mix-blend-overlay pointer-events-none"></div>
                )}

                {/* Digital Noise / Grain Overlay */}
                <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif')] bg-cover mix-blend-overlay"></div>
                
                {/* Vignette */}
                <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_50%,black_150%)] pointer-events-none"></div>
                
                {/* Scanlines */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,6px_100%] opacity-20 pointer-events-none"></div>
            </div>

            {/* Target Engaged Popup */}
            {showEngagedPopup && (
                <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none animate-in zoom-in-50 duration-300">
                    <div className="bg-red-500/10 border-4 border-red-500 text-red-500 px-16 py-8 text-5xl font-black tracking-widest uppercase animate-pulse backdrop-blur-sm shadow-[0_0_100px_rgba(239,68,68,0.6)] transform -rotate-3 skew-x-6 relative">
                        <div className="absolute -inset-2 border border-red-500/50 opacity-50"></div>
                        TARGET ENGAGED
                        <div className="text-sm font-mono tracking-[1em] text-center mt-2 text-white">WEAPON SYSTEMS ARMED</div>
                    </div>
                </div>
            )}

            {/* Draggable Target Crosshair */}
            <div 
                className="absolute z-40 cursor-grab active:cursor-grabbing hover:scale-105 transition-transform"
                style={{ 
                    left: `${targetPos.x}%`, 
                    top: `${targetPos.y}%`,
                    transform: 'translate(-50%, -50%)',
                    width: '300px',
                    height: '300px'
                }}
                onMouseDown={handleMouseDown}
            >
                <svg width="100%" height="100%" viewBox="0 0 100 100" className="opacity-90 drop-shadow-[0_0_5px_black]">
                    {/* Center Box */}
                    <rect 
                        x="40" y="40" width="20" height="20" 
                        stroke="#ef4444" 
                        strokeWidth={isEngaged ? "1.5" : "0.8"} 
                        fill={isEngaged ? "rgba(239, 68, 68, 0.2)" : "rgba(239, 68, 68, 0.1)"} 
                        className={isEngaged ? "animate-[pulse_0.2s_infinite]" : "animate-pulse"} 
                    />
                    
                    {/* Locked/Engaged Text - Placed INSIDE the box */}
                    <text 
                        x="50" y="52" 
                        fontSize="4" 
                        fill="#ef4444" 
                        textAnchor="middle" 
                        fontWeight="bold" 
                        letterSpacing="0.5" 
                        className={isEngaged ? "animate-[pulse_0.1s_infinite]" : "animate-pulse"}
                    >
                        {isEngaged ? "ENGAGED" : "LOCKED"}
                    </text>
                    
                    {/* Cross Lines */}
                    <line x1="0" y1="50" x2="35" y2="50" stroke="currentColor" strokeWidth="0.5" />
                    <line x1="65" y1="50" x2="100" y2="50" stroke="currentColor" strokeWidth="0.5" />
                    <line x1="50" y1="0" x2="50" y2="35" stroke="currentColor" strokeWidth="0.5" />
                    <line x1="50" y1="65" x2="50" y2="100" stroke="currentColor" strokeWidth="0.5" />
                    
                    {/* Range Circles */}
                    <circle cx="50" cy="50" r="15" stroke="currentColor" strokeWidth="0.2" fill="none" strokeDasharray="2,2" className={isEngaged ? "animate-spin-slow" : ""} />
                    <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="0.2" fill="none" strokeDasharray="4,4" />
                </svg>
            </div>

            {/* HUD Elements (Pointer Events None to allow click-through to map if needed, but here we want to click buttons) */}
            <div className="absolute inset-0 p-4 sm:p-8 flex flex-col justify-between z-10 pointer-events-none">
                {/* Top Bar */}
                <div className="flex justify-between items-start pointer-events-auto gap-2">
                    <div className="bg-black/60 backdrop-blur-sm p-2 rounded border border-cyan-500/30 shadow-[0_0_15px_rgba(0,0,0,0.5)] shrink-0">
                        <div className="text-base sm:text-xl font-bold">{activeDrone.id}</div>
                        <div className="text-[10px] sm:text-xs opacity-70">{activeDrone.model}</div>
                        <div className={`mt-0.5 text-[10px] sm:text-xs font-bold ${activeDrone.status === 'AIRBORNE' || activeDrone.status === 'PATROL' ? 'text-green-400' : 'text-yellow-400'}`}>{activeDrone.status}</div>
                    </div>
                    
                    {/* Compass Tape */}
                    <div className="hidden lg:block w-96 h-12 border-b-2 border-cyan-500/50 relative overflow-hidden bg-black/20 backdrop-blur-sm">
                        <div className="absolute bottom-0 left-1/2 w-0 h-2 border-l-2 border-red-500 -translate-x-1/2 shadow-[0_0_5px_red]"></div>
                        <div className="flex justify-between w-full text-xs mt-2 px-4 opacity-70 font-bold">
                            <span>NW</span><span>N</span><span>NE</span>
                        </div>
                        <div className="absolute top-4 left-0 w-[200%] flex justify-between px-2 text-[8px] opacity-50 animate-[shimmer_10s_linear_infinite]">
                            {[...Array(40)].map((_, i) => <div key={i} className="h-1 w-[1px] bg-cyan-400"></div>)}
                        </div>
                    </div>

                    <div className="bg-black/60 backdrop-blur-sm p-2 rounded border border-cyan-500/30 text-right shadow-[0_0_15px_rgba(0,0,0,0.5)] shrink-0">
                        <div className="text-sm sm:text-2xl font-bold">{new Date().toLocaleTimeString([], {hour12: false})}</div>
                        <div className="text-[10px] sm:text-xs text-red-500 font-bold animate-pulse flex items-center justify-end space-x-1">
                            <span>●</span><span>REC</span>
                        </div>
                    </div>
                </div>

                {/* Side Bars */}
                <div className="hidden sm:flex absolute left-8 top-1/3 bottom-1/3 w-16 flex-col justify-center border-r border-cyan-500/30 pr-2 bg-gradient-to-l from-black/20 to-transparent">
                    <div className="text-center text-xs mb-1 font-bold">SPD</div>
                    <div className="h-48 border-r border-cyan-500/50 relative">
                        <div className="absolute right-0 w-2 h-1 bg-cyan-400 transition-all duration-1000 shadow-[0_0_5px_cyan]" style={{ top: `${100 - (activeDrone.speed / 300) * 100}%` }}></div>
                        {/* Scale Marks */}
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="absolute right-0 w-1 h-[1px] bg-cyan-500/50" style={{ top: `${i * 25}%` }}></div>
                        ))}
                    </div>
                    <div className="text-center font-bold mt-1 text-xl">{activeDrone.speed} <span className="text-[9px] font-normal">KTS</span></div>
                </div>

                <div className="hidden sm:flex absolute right-8 top-1/3 bottom-1/3 w-16 flex-col justify-center border-l border-cyan-500/30 pl-2 bg-gradient-to-r from-black/20 to-transparent">
                    <div className="text-center text-xs mb-1 font-bold">ALT</div>
                    <div className="h-48 border-l border-cyan-500/50 relative">
                        <div className="absolute left-0 w-2 h-1 bg-cyan-400 transition-all duration-1000 shadow-[0_0_5px_cyan]" style={{ top: `${100 - (activeDrone.alt / 20000) * 100}%` }}></div>
                        {/* Scale Marks */}
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="absolute left-0 w-1 h-[1px] bg-cyan-500/50" style={{ top: `${i * 25}%` }}></div>
                        ))}
                    </div>
                    <div className="text-center font-bold mt-1 text-xl">{(activeDrone.alt / 1000).toFixed(1)} <span className="text-[9px] font-normal">kFT</span></div>
                </div>

                {/* Bottom Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-end pointer-events-auto gap-3">
                    <div className="flex space-x-2 pointer-events-auto justify-center sm:justify-start">
                        {['OPTICAL', 'THERMAL', 'NIGHT'].map((mode) => (
                            <button 
                                key={mode}
                                onClick={() => setViewMode(mode as any)}
                                className={`flex-grow sm:flex-grow-0 px-3 py-1 text-[10px] sm:text-xs border font-bold tracking-wider ${viewMode === mode ? 'bg-cyan-500 text-black border-cyan-500' : 'bg-black/60 text-cyan-500 border-cyan-500/30'} hover:bg-cyan-500/20 transition-all backdrop-blur-sm`}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>
                    <div className="grid grid-cols-2 sm:flex sm:space-x-6 text-[10px] sm:text-xs bg-black/60 backdrop-blur-sm p-2 sm:p-3 rounded border border-cyan-500/30 shadow-lg gap-2">
                        <div className="flex flex-col items-center">
                            <span className="opacity-60 text-[8px] sm:text-[9px] mb-0.5 sm:mb-1">BATTERY</span>
                            <div className="flex items-center space-x-1">
                                <span className={`font-bold text-sm sm:text-lg ${activeDrone.battery < 20 ? 'text-red-500 animate-pulse' : 'text-green-400'}`}>{activeDrone.battery}%</span>
                                <div className="w-4 h-2 border border-gray-500 rounded-sm p-[1px]">
                                    <div className={`h-full ${activeDrone.battery < 20 ? 'bg-red-500' : 'bg-green-400'}`} style={{width: `${activeDrone.battery}%`}}></div>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="opacity-60 text-[8px] sm:text-[9px] mb-0.5 sm:mb-1">LATITUDE</span>
                            <span className="font-mono text-white text-[10px] sm:text-xs">{activeDrone.lat.toFixed(4)} N</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="opacity-60 text-[8px] sm:text-[9px] mb-0.5 sm:mb-1">LONGITUDE</span>
                            <span className="font-mono text-white text-[10px] sm:text-xs">{activeDrone.lng.toFixed(4)} E</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="opacity-60 text-[8px] sm:text-[9px] mb-0.5 sm:mb-1">LINK QUALITY</span>
                            <span className="font-bold text-green-400">98%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Footer Controls */}
        <div className="h-auto py-4 bg-[#0a1525] border-t border-cyan-500/20 flex flex-col lg:flex-row items-center px-4 lg:px-6 gap-4 z-20 shrink-0">
            <div className="flex w-full lg:w-auto justify-between items-center">
                <button onClick={onClose} className="px-3 py-2 border border-red-500/50 text-red-500 hover:bg-red-900/30 rounded transition-colors text-xs font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                    Close Uplink
                </button>
                <div className="lg:hidden h-6 w-[1px] bg-cyan-500/20"></div>
                <div className="lg:hidden text-cyan-500/40 text-[10px] font-mono">TASC UAV NET</div>
            </div>
            
            <div className="hidden lg:block h-8 w-[1px] bg-cyan-500/20"></div>
            
            <div className="flex space-x-2 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0 scrollbar-none">
                {DRONES.map(drone => (
                    <button 
                        key={drone.id} 
                        onClick={() => { setActiveDrone(drone); setIsEngaged(false); }}
                        className={`flex-grow sm:flex-grow-0 px-3 py-1.5 rounded text-xs font-bold border transition-all uppercase tracking-wider flex flex-col items-center shrink-0 min-w-[100px] ${activeDrone.id === drone.id ? 'bg-cyan-900/50 border-cyan-400 text-white shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'border-gray-700 text-gray-500 hover:border-gray-500 hover:text-gray-300'}`}
                    >
                        <span>{drone.id}</span>
                        <span className="text-[8px] font-normal opacity-70">{drone.model}</span>
                    </button>
                ))}
            </div>
            
            <div className="hidden lg:block flex-grow"></div>
            
            <div className="flex space-x-3 w-full lg:w-auto justify-end">
                <button 
                    onClick={handleEngageToggle}
                    className={`flex-1 lg:flex-none px-4 py-2 border text-[11px] sm:text-xs font-bold uppercase tracking-wider rounded transition-all flex items-center justify-center space-x-2 ${isEngaged ? 'bg-red-600 border-red-500 text-white shadow-[0_0_20px_red] hover:bg-red-700' : 'bg-red-900/20 border-red-500/50 text-red-400 hover:bg-red-900/40 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]'}`}
                >
                    <svg className={`w-4 h-4 ${isEngaged ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                    <span>{isEngaged ? 'DISENGAGE' : 'Engage Target'}</span>
                </button>
                <button className="flex-1 lg:flex-none px-4 py-2 bg-cyan-900/20 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-900/40 text-[11px] sm:text-xs font-bold uppercase tracking-wider rounded transition-all hover:shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                    Return To Base
                </button>
            </div>
        </div>
    </div>
  );
};
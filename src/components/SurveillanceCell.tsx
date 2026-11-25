import React, { useState, useEffect, useRef } from 'react';

declare global {
  interface Window {
    L: any;
  }
}

// Unified Camera Database containing both Targeted and Non-Targeted Areas with High-Quality Active Video Streams
const CAMERAS_DATABASE = [
  // High Priority / Targeted
  { 
      id: 'CAM-101', 
      label: 'Sector Alpha', 
      location: 'Raisina Hill, New Delhi', 
      lat: 28.6143, 
      lng: 77.1995, 
      status: 'LIVE', 
      signal: 98, 
      type: 'Targeted', 
      url: 'https://assets.mixkit.co/videos/preview/mixkit-top-down-view-of-traffic-on-a-highway-4354-large.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=800&q=80'
  },
  { 
      id: 'CAM-204', 
      label: 'Coastal Watch', 
      location: 'Mumbai Harbour', 
      lat: 18.9220, 
      lng: 72.8347, 
      status: 'LIVE', 
      signal: 85, 
      type: 'Targeted', 
      url: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-waves-crashing-on-the-beach-4350-large.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1569263979104-865ab7dd8d36?auto=format&fit=crop&w=800&q=80'
  },
  { 
      id: 'CAM-309', 
      label: 'Border Post 9', 
      location: 'Wagah Border', 
      lat: 31.6046, 
      lng: 74.5707, 
      status: 'LIVE', 
      signal: 92, 
      type: 'Targeted', 
      url: 'https://assets.mixkit.co/videos/preview/mixkit-military-tank-driving-on-a-dirt-road-4342-large.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1505778276668-26b3ff7af103?auto=format&fit=crop&w=800&q=80'
  },
  { 
      id: 'CAM-412', 
      label: 'Tech Hub Sector 4', 
      location: 'Bangalore Cyber City', 
      lat: 12.8399, 
      lng: 77.6770, 
      status: 'LIVE', 
      signal: 94, 
      type: 'Targeted', 
      url: 'https://assets.mixkit.co/videos/preview/mixkit-modern-office-buildings-at-night-4339-large.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1558494949-ef526b0042a0?auto=format&fit=crop&w=800&q=80'
  },
  { 
      id: 'CAM-505', 
      label: 'Eastern Command', 
      location: 'Fort William', 
      lat: 22.5536, 
      lng: 88.3352, 
      status: 'LIVE', 
      signal: 88, 
      type: 'Targeted', 
      url: 'https://assets.mixkit.co/videos/preview/mixkit-military-tank-driving-on-a-dirt-road-4342-large.mp4',
      thumbnail: 'https://images.unsplash.com/photo-1579781354162-fd68523c9632?auto=format&fit=crop&w=800&q=80'
  },
  
  // Public / Non-Targeted
  { 
      id: 'CAM-HWY-01', 
      label: 'NH-44 Intersection', 
      location: 'Highway North', 
      lat: 28.7041, 
      lng: 77.1025, 
      type: 'Highway', 
      url: 'https://assets.mixkit.co/videos/preview/mixkit-top-down-view-of-traffic-on-a-highway-4354-large.mp4', 
      status: 'REC', 
      signal: 95,
      thumbnail: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80'
  },
  { 
      id: 'CAM-PRK-03', 
      label: 'Central Park Zone A', 
      location: 'City Gardens', 
      lat: 28.6000, 
      lng: 77.2000, 
      type: 'Park', 
      url: 'https://assets.mixkit.co/videos/preview/mixkit-mother-and-daughter-walking-in-a-park-4648-large.mp4', 
      status: 'REC', 
      signal: 89,
      thumbnail: 'https://images.unsplash.com/photo-1496347646636-ea47f7d6b37b?auto=format&fit=crop&w=800&q=80'
  },
  { 
      id: 'CAM-HTL-07', 
      label: 'Grand Hotel Lobby', 
      location: 'Downtown', 
      lat: 19.0760, 
      lng: 72.8777, 
      type: 'Hotel', 
      url: 'https://assets.mixkit.co/videos/preview/mixkit-business-people-walking-in-a-modern-office-hallway-4809-large.mp4', 
      status: 'REC', 
      signal: 91,
      thumbnail: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'
  },
  { 
      id: 'CAM-MKT-12', 
      label: 'Sarojini Market', 
      location: 'South Delhi', 
      lat: 28.5700, 
      lng: 77.1900, 
      type: 'Crowd', 
      url: 'https://assets.mixkit.co/videos/preview/mixkit-crowd-of-people-walking-on-a-street-4361-large.mp4', 
      status: 'REC', 
      signal: 78,
      thumbnail: 'https://images.unsplash.com/photo-1573057388789-9a842b588301?auto=format&fit=crop&w=800&q=80'
  },
  { 
      id: 'CAM-TRF-05', 
      label: 'Cyber City Junction', 
      location: 'Gurugram', 
      lat: 28.4595, 
      lng: 77.0266, 
      type: 'Traffic', 
      url: 'https://assets.mixkit.co/videos/preview/mixkit-busy-street-traffic-at-night-3996-large.mp4', 
      status: 'LIVE', 
      signal: 99,
      thumbnail: 'https://images.unsplash.com/photo-1542395562-520c74c3e34b?auto=format&fit=crop&w=800&q=80'
  },
  { 
      id: 'CAM-MAL-09', 
      label: 'City Mall Entrance', 
      location: 'Noida Sector 18', 
      lat: 28.5700, 
      lng: 77.3200, 
      type: 'Crowd', 
      url: 'https://assets.mixkit.co/videos/preview/mixkit-people-walking-in-a-shopping-mall-4813-large.mp4', 
      status: 'REC', 
      signal: 82,
      thumbnail: 'https://images.unsplash.com/photo-1567449303078-5c935d731e2d?auto=format&fit=crop&w=800&q=80'
  },
  { 
      id: 'CAM-MET-02', 
      label: 'Metro Station Pf-1', 
      location: 'Rajiv Chowk', 
      lat: 28.6328, 
      lng: 77.2197, 
      type: 'Public', 
      url: 'https://assets.mixkit.co/videos/preview/mixkit-people-waiting-for-the-subway-train-4816-large.mp4', 
      status: 'REC', 
      signal: 94,
      thumbnail: 'https://images.unsplash.com/photo-1520699049698-acd2fcc51056?auto=format&fit=crop&w=800&q=80'
  },
  { 
      id: 'CAM-SQA-04', 
      label: 'Connaught Place', 
      location: 'Central Delhi', 
      lat: 28.6315, 
      lng: 77.2167, 
      type: 'Public', 
      url: 'https://assets.mixkit.co/videos/preview/mixkit-time-lapse-of-a-busy-city-street-at-night-4001-large.mp4', 
      status: 'LIVE', 
      signal: 96,
      thumbnail: 'https://images.unsplash.com/photo-1582510003544-a60c32716dd2?auto=format&fit=crop&w=800&q=80'
  },
  // New Feeds
  {
      id: 'CAM-BLR-08',
      label: 'Electronic City Flyover',
      location: 'Bangalore South',
      lat: 12.8452,
      lng: 77.6602,
      type: 'Traffic',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-traffic-on-an-urban-highway-at-night-4355-large.mp4',
      status: 'LIVE',
      signal: 97,
      thumbnail: 'https://images.unsplash.com/photo-1519817914152-22d216bb9170?auto=format&fit=crop&w=800&q=80'
  },
  {
      id: 'CAM-MUM-11',
      label: 'Gateway of India Plaza',
      location: 'Mumbai Colaba',
      lat: 18.9220,
      lng: 72.8347,
      type: 'Public',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-people-walking-in-front-of-a-historical-building-4819-large.mp4',
      status: 'REC',
      signal: 88,
      thumbnail: 'https://images.unsplash.com/photo-1551163148-7806c9dd9a02?auto=format&fit=crop&w=800&q=80'
  },
  {
      id: 'CAM-HIM-01',
      label: 'Siachen Base Camp',
      location: 'Himalayas Sector 4',
      lat: 35.5,
      lng: 77.0,
      type: 'Outpost',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-snow-covered-mountains-and-clouds-4752-large.mp4',
      status: 'LIVE',
      signal: 65,
      thumbnail: 'https://images.unsplash.com/photo-1518098268026-4e187743369b?auto=format&fit=crop&w=800&q=80'
  },
  {
      id: 'CAM-DEL-15',
      label: 'Chandni Chowk Main',
      location: 'Old Delhi',
      lat: 28.6506,
      lng: 77.2303,
      type: 'Crowd',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-crowd-of-people-walking-on-a-street-4361-large.mp4',
      status: 'REC', 
      signal: 82,
      thumbnail: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80'
  },
  {
      id: 'CAM-CHE-05',
      label: 'Chennai Central Station',
      location: 'Chennai Central',
      lat: 13.0827,
      lng: 80.2707,
      type: 'Transport',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-passengers-walking-in-a-train-station-4363-large.mp4',
      status: 'LIVE',
      signal: 93,
      thumbnail: 'https://images.unsplash.com/photo-1565448373324-4f8083818318?auto=format&fit=crop&w=800&q=80'
  },
  {
      id: 'CAM-CHE-09',
      label: 'Marina Beach Watch',
      location: 'Chennai Coast',
      lat: 13.0500,
      lng: 80.2824,
      type: 'Coastal',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-waves-crashing-on-the-beach-4350-large.mp4',
      status: 'LIVE',
      signal: 89,
      thumbnail: 'https://images.unsplash.com/photo-1596245389659-38b816035848?auto=format&fit=crop&w=800&q=80'
  },
  {
      id: 'CAM-HYD-04',
      label: 'HITEC City Surveillance',
      location: 'Hyderabad IT Corridor',
      lat: 17.4435,
      lng: 78.3772,
      type: 'Tech',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-modern-office-buildings-at-night-4339-large.mp4',
      status: 'LIVE',
      signal: 99,
      thumbnail: 'https://images.unsplash.com/photo-1628151016154-2c7c5b809a76?auto=format&fit=crop&w=800&q=80'
  },
  {
      id: 'CAM-KOL-02',
      label: 'Howrah Bridge Cam',
      location: 'Kolkata Riverfront',
      lat: 22.5851,
      lng: 88.3468,
      type: 'Traffic',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-city-traffic-at-sunset-4343-large.mp4',
      status: 'REC',
      signal: 90,
      thumbnail: 'https://images.unsplash.com/photo-1593181827464-90209426f4f1?auto=format&fit=crop&w=800&q=80'
  }
];

interface MatrixFeedProps {
    feed: any;
    onMaximize: (feed: any) => void;
    currentTime: string;
}

// Individual Feed Component with Controls for Matrix View
const MatrixFeed: React.FC<MatrixFeedProps> = ({ feed, onMaximize, currentTime }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const [progress, setProgress] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        
        const updateProgress = () => {
            if (video.duration) {
                setProgress((video.currentTime / video.duration) * 100);
            }
        };
        
        video.addEventListener('timeupdate', updateProgress);
        
        // Ensure autoplay reliably triggers
        const playPromise = video.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {
                // Autoplay was prevented; muted autoplay should succeed
                video.muted = true;
                video.play().catch(() => {});
            });
        }

        return () => video.removeEventListener('timeupdate', updateProgress);
    }, [feed.id, feed.url]);

    const togglePlay = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleSeek = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (videoRef.current) {
            const progressBar = e.currentTarget;
            const rect = progressBar.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const percentage = clickX / rect.width;
            videoRef.current.currentTime = percentage * videoRef.current.duration;
        }
    };

    // Determine if controls should be shown: status === 'REC'
    const showControls = feed.status === 'REC' && !!feed.url && feed.status !== 'OFFLINE';

    return (
        <div 
            className={`relative bg-black border rounded overflow-hidden group transition-colors flex flex-col aspect-video ${feed.type === 'Targeted' ? 'border-red-900/50 hover:border-red-500/50' : 'border-cyan-900/50 hover:border-cyan-500/50'}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="relative flex-grow overflow-hidden cursor-pointer" onClick={() => onMaximize(feed)}>
                {/* Media Rendering */}
                 <div className="absolute inset-0 w-full h-full bg-black">
                    {feed.status !== 'OFFLINE' && feed.url ? (
                        <video 
                            key={feed.id}
                            ref={videoRef}
                            src={feed.url}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover filter contrast-125 brightness-95 saturate-75 group-hover:brightness-105 transition-all"
                            onError={(e) => {
                                const target = e.target as HTMLVideoElement;
                                target.style.display = 'none';
                                target.parentElement!.style.backgroundImage = `url(${feed.thumbnail})`;
                                target.parentElement!.style.backgroundSize = 'cover';
                                target.parentElement!.style.backgroundPosition = 'center';
                            }}
                        />
                    ) : (
                        <img 
                            src={feed.thumbnail} 
                            alt="Feed Offline"
                            className="w-full h-full object-cover filter opacity-70 group-hover:opacity-100 transition-opacity contrast-125 grayscale-[0.8]"
                        />
                    )}
                 </div>

                 {/* Overlays */}
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none"></div>

                 {/* Header */}
                <div className="absolute top-0 left-0 w-full p-2 flex justify-between items-start pointer-events-none">
                    <div className={`bg-black/60 backdrop-blur px-2 py-0.5 rounded text-[10px] font-mono border ${feed.type === 'Targeted' ? 'text-red-400 border-red-500/20' : 'text-cyan-400 border-cyan-500/20'}`}>
                        {feed.id}
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                            <div className={`px-1.5 py-0.5 rounded text-[9px] font-bold text-white shadow-[0_0_5px_currentColor] ${feed.status === 'OFFLINE' ? 'bg-gray-600 shadow-none' : 'bg-red-600 animate-pulse'}`}>
                            {feed.status}
                            </div>
                            <div className="text-[9px] font-mono text-gray-300 bg-black/50 px-1 rounded">{currentTime}</div>
                    </div>
                </div>

                {/* Footer */}
                <div className={`absolute bottom-0 left-0 w-full p-2 pointer-events-none transition-all duration-300 ${showControls && isHovered ? 'opacity-0' : 'opacity-100'}`}>
                    <div className="text-white font-bold text-xs tracking-wide truncate drop-shadow-md">{feed.label}</div>
                    <div className={`${feed.type === 'Targeted' ? 'text-red-500/80' : 'text-cyan-500/60'} text-[10px] uppercase font-mono`}>{feed.type}</div>
                </div>

                {/* Controls (Only visible on hover for REC) */}
                {showControls && (
                    <div 
                        className={`absolute bottom-0 left-0 w-full p-2 bg-black/60 backdrop-blur-sm transition-transform duration-300 flex items-center space-x-2 ${isHovered ? 'translate-y-0' : 'translate-y-full'}`}
                        onClick={(e) => e.stopPropagation()} 
                    >
                        <button 
                            onClick={togglePlay}
                            className="p-1.5 rounded text-cyan-400 hover:text-white hover:bg-cyan-500/20 transition-colors"
                        >
                            {isPlaying ? (
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                            ) : (
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                            )}
                        </button>
                        
                        <div className="flex-grow h-8 flex items-center cursor-pointer group/seek" onClick={handleSeek}>
                            <div className="w-full h-1 bg-gray-600 rounded-full overflow-hidden relative">
                                <div className="h-full bg-cyan-500 relative" style={{ width: `${progress}%` }}>
                                     <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow opacity-0 group-hover/seek:opacity-100"></div>
                                </div>
                            </div>
                        </div>

                         <div className="text-[9px] font-mono text-cyan-400 w-8 text-right">
                            {Math.round(progress)}%
                         </div>
                    </div>
                )}
                
                {/* Maximize Icon Overlay (Only if not using controls) */}
                {!showControls && (
                     <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <div className={`bg-black/80 p-2 rounded-full border ${feed.type === 'Targeted' ? 'border-red-500/50 text-red-400' : 'border-cyan-500/50 text-cyan-400'}`}>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                        </div>
                    </div>
                )}
                 {/* Scanlines */}
                 <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] opacity-20 pointer-events-none"></div>

            </div>
        </div>
    );
};

interface SurveillanceCellProps {
  onClose: () => void;
}

export const SurveillanceCell: React.FC<SurveillanceCellProps> = ({ onClose }) => {
  const [activeCam, setActiveCam] = useState<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [viewMode, setViewMode] = useState<'MAP' | 'MATRIX'>('MAP');
  const [maximizedFeed, setMaximizedFeed] = useState<any | null>(null);
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [zoomLevel, setZoomLevel] = useState(5);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Only initialize map if we are in MAP mode and container exists
    if (viewMode === 'MAP' && mapContainerRef.current && !mapInstanceRef.current && window.L) {
      const map = window.L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
        center: [22.5937, 78.9629],
        zoom: 5,
        minZoom: 4,
        maxZoom: 20
      });

      window.L.tileLayer('http://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
      }).addTo(map);

      window.L.control.attribution({ position: 'bottomright', prefix: false })
        .addAttribution('T.A.S.C. Satellite Feed').addTo(map);

      mapInstanceRef.current = map;
      setMapLoaded(true);

      CAMERAS_DATABASE.forEach(cam => {
        const isTargeted = cam.type === 'Targeted';
        const color = cam.status === 'OFFLINE' ? '#64748b' : isTargeted ? '#ef4444' : '#22d3ee'; // Red for Targeted, Cyan for Public
        
        const iconHtml = `
          <div class="relative flex items-center justify-center w-8 h-8">
            <div class="absolute inset-0 bg-black/50 rounded-full border border-[${color}]"></div>
            <div class="w-2 h-2 rounded-full" style="background-color: ${color}; box-shadow: 0 0 10px ${color}"></div>
            ${cam.status === 'LIVE' ? `<div class="absolute -inset-2 border border-[${color}] rounded-full opacity-30 animate-ping"></div>` : ''}
          </div>
        `;

        const icon = window.L.divIcon({
          className: 'cam-marker',
          html: iconHtml,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        window.L.marker([cam.lat, cam.lng], { icon })
          .addTo(map)
          .on('click', () => {
             setActiveCam(cam);
             map.flyTo([cam.lat, cam.lng], 16, { animate: true, duration: 1.5 });
          });
      });

      map.on('zoomend', () => {
        setZoomLevel(map.getZoom());
      });
    }

    // Cleanup map when switching views
    if (viewMode !== 'MAP' && mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        setMapLoaded(false);
    }

  }, [viewMode]);

  const handleZoomIn = () => {
    if(mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if(mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  // Helper to render media content for Sidebar and Maximized View (but not Matrix items directly)
  const renderMedia = (feed: any, isMaximized: boolean = false) => {
    const isVideo = !!feed.url && feed.status !== 'OFFLINE';
    
    return (
      <div className="absolute inset-0 w-full h-full bg-black">
        {isVideo ? (
            <video 
                key={`${feed.id}-${isMaximized ? 'max' : 'side'}`}
                src={feed.url}
                autoPlay
                loop
                muted
                playsInline
                className={`w-full h-full object-cover filter ${isMaximized ? 'contrast-125 brightness-100 saturate-75' : 'contrast-125 brightness-95 saturate-60 group-hover:brightness-105 transition-all'}`}
                onError={(e) => {
                    const videoElement = e.target as HTMLVideoElement;
                    videoElement.style.display = 'none';
                    const parent = videoElement.parentElement as HTMLElement;
                    if(parent) {
                        parent.style.backgroundImage = `url(${feed.thumbnail})`;
                        parent.style.backgroundSize = 'cover';
                        parent.style.backgroundPosition = 'center';
                    }
                }}
            />
        ) : (
            <img 
                src={feed.thumbnail} 
                alt="Feed Offline"
                className={`w-full h-full object-cover filter ${isMaximized ? 'contrast-100 grayscale-[0.5]' : 'opacity-70 group-hover:opacity-100 transition-opacity contrast-125 grayscale-[0.8]'}`}
            />
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#050a14] flex flex-col font-sans overflow-hidden animate-in fade-in duration-300">
      
      {/* Top Bar */}
      <div className="h-14 bg-[#0a1525] border-b border-cyan-500/20 flex justify-between items-center px-6 z-20 shadow-lg relative shrink-0">
         <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-4">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_red]"></div>
                <h1 className="text-xl font-bold text-white tracking-widest uppercase font-mono hidden md:block">Surveillance Grid <span className="text-cyan-500 text-sm">v4.0.2</span></h1>
                <h1 className="text-xl font-bold text-white tracking-widest uppercase font-mono md:hidden">T.A.S.C.</h1>
            </div>
            
            {/* View Mode Switcher */}
            <div className="flex items-center space-x-1 bg-black/40 p-1 rounded border border-cyan-500/30">
                <button 
                    onClick={() => setViewMode('MAP')} 
                    className={`px-4 py-1.5 text-[10px] font-mono font-bold tracking-wider rounded transition-all flex items-center space-x-2 ${viewMode === 'MAP' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-[0_0_10px_rgba(34,211,238,0.2)]' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>SATELLITE MAP</span>
                </button>
                <button 
                    onClick={() => setViewMode('MATRIX')} 
                    className={`px-4 py-1.5 text-[10px] font-mono font-bold tracking-wider rounded transition-all flex items-center space-x-2 ${viewMode === 'MATRIX' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-[0_0_10px_rgba(34,211,238,0.2)]' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                    <span>CCTV MATRIX</span>
                </button>
            </div>
         </div>

         <div className="flex items-center space-x-6">
            <div className="hidden md:flex flex-col items-end">
                <span className="text-[10px] text-cyan-500/60 font-mono tracking-widest">NETWORK STATUS</span>
                <span className="text-green-400 text-xs font-bold tracking-wider">SECURE // ENCRYPTED</span>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-red-900/20 rounded text-gray-400 hover:text-red-400 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
         </div>
         {/* Decorative scanning line under header */}
         <div className="absolute bottom-0 left-0 h-[1px] bg-cyan-500/50 w-full overflow-hidden">
             <div className="w-1/3 h-full bg-cyan-400 blur-[2px] animate-[shimmer_2s_infinite]"></div>
         </div>
      </div>

      <div className="flex-grow relative flex overflow-hidden">
        
        {/* ================= MAP MODE ================= */}
        {viewMode === 'MAP' && (
            <>
                {/* Main Map Area */}
                <div className="flex-grow relative bg-black">
                    <div ref={mapContainerRef} className="absolute inset-0 z-0"></div>
                    
                    {/* Map Overlay UI */}
                    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-6">
                        {/* Top Left Info */}
                        <div className="bg-black/60 backdrop-blur-md p-4 border-l-2 border-cyan-500 rounded-r-lg max-w-xs pointer-events-auto">
                            <h3 className="text-cyan-400 text-xs font-mono tracking-widest mb-1">ACTIVE REGION</h3>
                            <div className="text-white font-bold text-lg">INDIA // SECTOR 7</div>
                            <div className="mt-2 flex space-x-4 text-[10px] text-gray-400 font-mono">
                                <div>ZOOM: {zoomLevel}x</div>
                                <div>LAT: {mapInstanceRef.current?.getCenter().lat.toFixed(4) || '---'}</div>
                            </div>
                        </div>

                        {/* Bottom Center Controls */}
                        <div className="self-center flex space-x-2 pointer-events-auto mb-4">
                            <button onClick={handleZoomOut} className="w-12 h-12 bg-black/80 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-900/30 hover:border-cyan-400 rounded-full flex items-center justify-center transition-all">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                            </button>
                            <button onClick={handleZoomIn} className="w-12 h-12 bg-black/80 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-900/30 hover:border-cyan-400 rounded-full flex items-center justify-center transition-all">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            </button>
                        </div>
                    </div>

                    {/* Grid Lines Overlay */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.05)_1px,transparent_1px)] bg-[size:100px_100px] pointer-events-none z-0"></div>
                    
                    {/* Vignette */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] pointer-events-none z-0"></div>
                </div>

                {/* Sidebar Feed */}
                <div className="w-80 bg-[#0a1525] border-l border-cyan-500/20 flex flex-col z-20 shadow-2xl shrink-0">
                    <div className="p-4 border-b border-cyan-500/10">
                        <h2 className="text-cyan-400 font-bold tracking-wider text-sm flex items-center">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                            ACTIVE FEEDS
                        </h2>
                    </div>
                    
                    <div className="flex-grow overflow-y-auto p-4 space-y-4">
                        {activeCam ? (
                            <div className="flex flex-col space-y-4 animate-in slide-in-from-right duration-300">
                                <div className="relative aspect-video bg-black rounded border border-cyan-500/30 overflow-hidden group">
                                    {renderMedia(activeCam)}
                                    <div className="absolute inset-0 bg-[url('https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif')] opacity-10 mix-blend-overlay pointer-events-none"></div>
                                    
                                    <div className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold text-white animate-pulse ${activeCam.status === 'LIVE' || activeCam.status === 'REC' ? 'bg-red-600' : 'bg-gray-600'}`}>{activeCam.status}</div>
                                    <div className="absolute bottom-2 right-2 text-cyan-400 text-[10px] font-mono">{activeCam.id}</div>
                                    
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
                                        <div className="w-16 h-16 border border-white rounded-full"></div>
                                        <div className="w-1 h-1 bg-white rounded-full absolute"></div>
                                    </div>
                                </div>

                                <div className="bg-cyan-950/30 p-4 rounded border border-cyan-500/20">
                                    <h3 className="text-white font-bold text-lg mb-1">{activeCam.label}</h3>
                                    <p className="text-cyan-400/60 text-xs font-mono mb-4">{activeCam.location}</p>
                                    
                                    <div className="grid grid-cols-2 gap-4 text-xs font-mono text-gray-400">
                                        <div>
                                            <span className="block text-cyan-500/40">STATUS</span>
                                            <span className={activeCam.status !== 'OFFLINE' ? 'text-green-400' : 'text-red-400'}>{activeCam.status}</span>
                                        </div>
                                        <div>
                                            <span className="block text-cyan-500/40">SIGNAL</span>
                                            <span className="text-white">{activeCam.signal}%</span>
                                        </div>
                                        <div>
                                            <span className="block text-cyan-500/40">TYPE</span>
                                            <span className="text-white uppercase">{activeCam.type}</span>
                                        </div>
                                        <div>
                                            <span className="block text-cyan-500/40">LAT/LNG</span>
                                            <span className="text-white">{activeCam.lat.toFixed(2)} / {activeCam.lng.toFixed(2)}</span>
                                        </div>
                                    </div>
                                    
                                    <button onClick={() => setActiveCam(null)} className="mt-4 w-full py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs rounded transition-colors">
                                        RETURN TO LIST
                                    </button>
                                </div>
                            </div>
                        ) : (
                            CAMERAS_DATABASE.map(cam => (
                                <div 
                                    key={cam.id}
                                    onClick={() => { setActiveCam(cam); if(mapInstanceRef.current) mapInstanceRef.current.flyTo([cam.lat, cam.lng], 16, { animate: true, duration: 1.5 }); }}
                                    className={`p-3 rounded border cursor-pointer transition-all group ${cam.type === 'Targeted' ? 'bg-[#1a0f0f] border-red-500/20 hover:border-red-500/50' : 'bg-[#0f1c2e] border-cyan-500/10 hover:border-cyan-500/50'}`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className={`${cam.type === 'Targeted' ? 'text-red-200 group-hover:text-red-400' : 'text-cyan-100 group-hover:text-cyan-400'} font-bold text-sm transition-colors`}>{cam.label}</div>
                                            <div className="text-xs text-gray-500 font-mono mt-0.5">{cam.id}</div>
                                        </div>
                                        <div className={`w-2 h-2 rounded-full ${cam.status !== 'OFFLINE' ? 'bg-green-500 shadow-[0_0_5px_green]' : 'bg-red-500'}`}></div>
                                    </div>
                                    <div className="mt-2 text-[10px] text-gray-600 uppercase tracking-wider flex justify-between">
                                        <span>{cam.type}</span>
                                        <span>{cam.status}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </>
        )}

        {/* ================= MATRIX MODE ================= */}
        {viewMode === 'MATRIX' && (
            <div className="flex-grow bg-[#050a14] p-4 relative overflow-y-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pb-20">
                    {CAMERAS_DATABASE.map((feed) => (
                        <MatrixFeed key={feed.id} feed={feed} onMaximize={setMaximizedFeed} currentTime={currentTime} />
                    ))}
                </div>

                {/* Maximized View Overlay */}
                {maximizedFeed && (
                    <div className="absolute inset-0 z-50 bg-black animate-in fade-in duration-200 flex flex-col p-4">
                        <div className={`flex-grow relative border rounded-lg overflow-hidden bg-black shadow-[0_0_50px_rgba(0,0,0,0.8)] ${maximizedFeed.type === 'Targeted' ? 'border-red-500/50' : 'border-cyan-500/50'}`}>
                            {renderMedia(maximizedFeed, true)}
                            
                             {/* Scanlines Stronger */}
                             <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] opacity-30 pointer-events-none"></div>
                             
                             {/* Maximized UI */}
                             <div className={`absolute top-4 left-4 bg-black/80 backdrop-blur border p-4 rounded max-w-sm ${maximizedFeed.type === 'Targeted' ? 'border-red-500/30' : 'border-cyan-500/30'}`}>
                                <h2 className="text-2xl text-white font-bold mb-1">{maximizedFeed.label}</h2>
                                <div className={`${maximizedFeed.type === 'Targeted' ? 'text-red-400' : 'text-cyan-400'} font-mono text-sm mb-4`}>{maximizedFeed.id} // {maximizedFeed.type.toUpperCase()}</div>
                                <div className="flex items-center space-x-2 text-xs font-mono text-gray-400">
                                    <div className={`w-2 h-2 rounded-full ${maximizedFeed.status === 'OFFLINE' ? 'bg-gray-500' : 'bg-red-600 animate-pulse'}`}></div>
                                    <span>{maximizedFeed.status === 'OFFLINE' ? 'SIGNAL LOST - DISPLAYING LAST KNOWN FRAME' : 'LIVE FEED UPLINK ESTABLISHED'}</span>
                                </div>
                             </div>

                             <button 
                                onClick={() => setMaximizedFeed(null)}
                                className="absolute top-4 right-4 bg-red-900/80 border border-red-500/50 text-white px-4 py-2 rounded flex items-center space-x-2 hover:bg-red-800 transition-colors font-mono text-sm tracking-wider"
                             >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                <span>MINIMIZE FEED</span>
                             </button>

                             <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/60 px-6 py-2 rounded-full border border-white/10 text-white/50 font-mono text-xs flex space-x-8">
                                <span>ISO: 800</span>
                                <span>SHUTTER: 1/60</span>
                                <span>IRIS: f/2.8</span>
                                <span>ZOOM: 1.0x</span>
                             </div>
                        </div>
                    </div>
                )}
            </div>
        )}

      </div>
    </div>
  );
};
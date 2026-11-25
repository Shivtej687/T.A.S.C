import React, { useState } from 'react';
import { Case, VERIFIED_EVIDENCE_PRESETS, REAL_OFFICER_PORTRAITS } from '../data/casesData';

interface AddCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newCase: Case) => void;
}

export const AddCaseModal: React.FC<AddCaseModalProps> = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Counter-Terrorism');
  const [severity, setSeverity] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');
  const [status, setStatus] = useState<'ACTIVE' | 'PENDING' | 'SOLVED'>('ACTIVE');
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [location, setLocation] = useState('');
  const [lat, setLat] = useState('28.6139'); // Default New Delhi lat
  const [lng, setLng] = useState('77.2090'); // Default New Delhi lng
  const [description, setDescription] = useState('');

  // Handling Officer info
  const [officerName, setOfficerName] = useState('');
  const [officerRank, setOfficerRank] = useState('Sub-Inspector');
  const [officerId, setOfficerId] = useState(`IPS-2026-${Math.floor(100 + Math.random() * 900)}`);
  const [officerClearance, setOfficerClearance] = useState('LEVEL 4');
  const [officerUnit, setOfficerUnit] = useState('T.A.S.C. Tactical Unit');
  const [officerImage, setOfficerImage] = useState('/officers/rakesh_maria.jpg');

  // Evidence links
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [evidenceList, setEvidenceList] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleAddEvidencePreset = (url: string) => {
    if (!evidenceList.includes(url)) {
      setEvidenceList([...evidenceList, url]);
    }
  };

  const handleAddCustomEvidence = () => {
    if (evidenceUrl.trim() && evidenceUrl.startsWith('http')) {
      setEvidenceList([...evidenceList, evidenceUrl.trim()]);
      setEvidenceUrl('');
    }
  };

  const handleRemoveEvidence = (index: number) => {
    setEvidenceList(evidenceList.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !location.trim() || !description.trim() || !officerName.trim()) {
      alert('Please fill out all mandatory T.A.S.C. dossier fields.');
      return;
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    if (isNaN(latitude) || isNaN(longitude)) {
      alert('Invalid GPS coordinates. Please specify valid decimal latitudes and longitudes.');
      return;
    }

    const newCase: Case = {
      id: `CASE-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      title: title.trim(),
      type,
      status,
      severity,
      date,
      location: location.trim(),
      lat: latitude,
      lng: longitude,
      description: description.trim(),
      officer: {
        name: officerName.trim(),
        id: officerId.trim(),
        rank: officerRank,
        clearance: officerClearance,
        image: officerImage,
        unit: officerUnit.trim()
      },
      evidence: evidenceList.length > 0 ? evidenceList : ['https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=800&q=80']
    };

    onSave(newCase);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-300">
      <div className="bg-[#0a1525] border-2 border-cyan-500/30 rounded-xl shadow-[0_0_50px_rgba(6,182,212,0.15)] w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden relative">
        
        {/* Tactical HUD accents */}
        <div className="absolute top-0 left-0 w-16 h-1 bg-cyan-400"></div>
        <div className="absolute top-0 right-0 w-16 h-1 bg-cyan-400"></div>
        <div className="absolute bottom-0 left-0 w-16 h-1 bg-cyan-400"></div>
        <div className="absolute bottom-0 right-0 w-16 h-1 bg-cyan-400"></div>
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#111c2e] border-b border-cyan-500/20 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <span className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-ping"></span>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-widest uppercase">REGISTER NEW SECURE CASE DOSSIER</h2>
              <div className="text-[9px] text-cyan-400/60 font-mono tracking-widest uppercase">T.A.S.C. GOVERNMENT GRID SUBMISSION</div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Section 1: Core Incident Info */}
            <div className="space-y-4">
              <div className="border-b border-cyan-500/10 pb-2">
                <span className="text-xs font-mono font-bold text-cyan-400 tracking-wider">01 // INCIDENT CLASSIFICATION</span>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] font-mono text-cyan-500/80 mb-1.5">Case Title *</label>
                <input 
                  type="text" 
                  required
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. border jammer telemetry intercept" 
                  className="w-full bg-[#050a14] border border-cyan-500/20 rounded px-3 py-2 text-sm text-cyan-100 placeholder-cyan-800/50 focus:outline-none focus:border-cyan-400 font-sans" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] font-mono text-cyan-500/80 mb-1.5">Incident Type</label>
                  <select 
                    value={type} 
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-[#050a14] border border-cyan-500/20 rounded px-3 py-2 text-sm text-cyan-100 focus:outline-none focus:border-cyan-400 font-sans"
                  >
                    <option value="Counter-Terrorism">Counter-Terrorism</option>
                    <option value="Naval Security">Naval Security</option>
                    <option value="Cyber Warfare">Cyber Warfare</option>
                    <option value="Counter-Smuggling">Counter-Smuggling</option>
                    <option value="Electronic Warfare">Electronic Warfare</option>
                    <option value="Organized Crime">Organized Crime</option>
                    <option value="Financial Fraud">Financial Fraud</option>
                    <option value="Homicide">Homicide</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] font-mono text-cyan-500/80 mb-1.5">Severity Rating</label>
                  <select 
                    value={severity} 
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="w-full bg-[#050a14] border border-cyan-500/20 rounded px-3 py-2 text-sm text-cyan-100 focus:outline-none focus:border-cyan-400 font-sans"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] font-mono text-cyan-500/80 mb-1.5">Status</label>
                  <select 
                    value={status} 
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-[#050a14] border border-cyan-500/20 rounded px-3 py-2 text-sm text-cyan-100 focus:outline-none focus:border-cyan-400 font-sans"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="PENDING">PENDING</option>
                    <option value="SOLVED">SOLVED</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] font-mono text-cyan-500/80 mb-1.5">Date of Incident</label>
                  <input 
                    type="date" 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-[#050a14] border border-cyan-500/20 rounded px-3 py-2 text-sm text-cyan-100 focus:outline-none focus:border-cyan-400 font-mono" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] font-mono text-cyan-500/80 mb-1.5">Location Name *</label>
                <input 
                  type="text" 
                  required
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. border outpost, amritsar range, punjab" 
                  className="w-full bg-[#050a14] border border-cyan-500/20 rounded px-3 py-2 text-sm text-cyan-100 placeholder-cyan-800/50 focus:outline-none focus:border-cyan-400 font-sans" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] font-mono text-cyan-500/80 mb-1.5">Latitude (GPS) *</label>
                  <input 
                    type="number" 
                    step="0.0001" 
                    required
                    value={lat} 
                    onChange={(e) => setLat(e.target.value)}
                    className="w-full bg-[#050a14] border border-cyan-500/20 rounded px-3 py-2 text-sm text-cyan-100 focus:outline-none focus:border-cyan-400 font-mono" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] font-mono text-cyan-500/80 mb-1.5">Longitude (GPS) *</label>
                  <input 
                    type="number" 
                    step="0.0001" 
                    required
                    value={lng} 
                    onChange={(e) => setLng(e.target.value)}
                    className="w-full bg-[#050a14] border border-cyan-500/20 rounded px-3 py-2 text-sm text-cyan-100 focus:outline-none focus:border-cyan-400 font-mono" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] font-mono text-cyan-500/80 mb-1.5">Mission Brief / Description *</label>
                <textarea 
                  required
                  rows={4}
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide a highly detailed description of the threat vector, recovered material, and actions executed..." 
                  className="w-full bg-[#050a14] border border-cyan-500/20 rounded px-3 py-2 text-sm text-cyan-100 placeholder-cyan-800/50 focus:outline-none focus:border-cyan-400 font-sans resize-none leading-relaxed" 
                />
              </div>
            </div>

            {/* Section 2: Officer & Evidence Info */}
            <div className="space-y-4">
              <div className="border-b border-cyan-500/10 pb-2">
                <span className="text-xs font-mono font-bold text-cyan-400 tracking-wider">02 // SECURE HANDLING OFFICER</span>
              </div>

              {/* Quick Select Real Officer */}
              <div>
                <label className="block text-[9px] uppercase tracking-[0.2em] font-mono text-amber-500 mb-2">QUICK-SELECT REAL OFFICER PORTRAIT</label>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin border-b border-cyan-500/10 mb-2">
                  {REAL_OFFICER_PORTRAITS.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => {
                        const cleanName = p.name.replace(/\s*\(.*?\)/, '');
                        setOfficerName(cleanName);
                        setOfficerImage(p.url);
                        if (p.name.includes('Maria')) {
                          setOfficerRank('Inspector General of Police (IGP)');
                          setOfficerUnit('Mumbai Police Crime Branch');
                        } else if (p.name.includes('Vijay Kumar')) {
                          setOfficerRank('Commandant BSF');
                          setOfficerUnit('STF Special Task Force');
                        } else if (p.name.includes('Tripathi')) {
                          setOfficerRank('Major General');
                          setOfficerUnit('Western Naval Command');
                        } else if (p.name.includes('Kiran Bedi') || p.name.includes('Roopa')) {
                          setOfficerRank('Deputy Commissioner of Police');
                          setOfficerUnit('Cyber Security Division');
                        } else if (p.name.includes('Doval')) {
                          setOfficerRank('Inspector General of Police (IGP)');
                          setOfficerUnit('National Security Council');
                        }
                      }}
                      className={`flex items-center space-x-2 p-1.5 rounded bg-[#111c2e] hover:bg-[#1a2d48] border text-[9px] font-mono shrink-0 transition-all ${officerImage === p.url ? 'border-cyan-400 text-cyan-300 bg-cyan-900/10' : 'border-cyan-500/10 text-slate-400'}`}
                    >
                      <img src={p.url} alt={p.name} className="w-6 h-6 rounded object-cover border border-cyan-500/20" referrerPolicy="no-referrer" />
                      <span className="max-w-[120px] truncate">{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] font-mono text-cyan-500/80 mb-1.5">Officer Full Name *</label>
                <input 
                  type="text" 
                  required
                  value={officerName} 
                  onChange={(e) => setOfficerName(e.target.value)}
                  placeholder="e.g. Sameer Wankhede, IPS" 
                  className="w-full bg-[#050a14] border border-cyan-500/20 rounded px-3 py-2 text-sm text-cyan-100 placeholder-cyan-800/50 focus:outline-none focus:border-cyan-400" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] font-mono text-cyan-500/80 mb-1.5">Officer Rank</label>
                  <select 
                    value={officerRank} 
                    onChange={(e) => setOfficerRank(e.target.value)}
                    className="w-full bg-[#050a14] border border-cyan-500/20 rounded px-3 py-2 text-sm text-cyan-100 focus:outline-none focus:border-cyan-400 font-sans"
                  >
                    <option value="Inspector General of Police (IGP)">IGP</option>
                    <option value="Deputy Commissioner of Police">DCP</option>
                    <option value="Assistant Commissioner of Police">ACP</option>
                    <option value="Superintendent of Police (SP)">SP</option>
                    <option value="Major General">Major General</option>
                    <option value="Brigadier">Brigadier</option>
                    <option value="Commandant BSF">Commandant BSF</option>
                    <option value="Sub-Inspector">Sub-Inspector</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] font-mono text-cyan-500/80 mb-1.5">Clearance level</label>
                  <select 
                    value={officerClearance} 
                    onChange={(e) => setOfficerClearance(e.target.value)}
                    className="w-full bg-[#050a14] border border-cyan-500/20 rounded px-3 py-2 text-sm text-cyan-100 focus:outline-none focus:border-cyan-400 font-mono"
                  >
                    <option value="LEVEL 5">LEVEL 5 (TOP SECRET)</option>
                    <option value="LEVEL 4">LEVEL 4 (SECRET)</option>
                    <option value="LEVEL 3">LEVEL 3 (RESTRICTED)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] font-mono text-cyan-500/80 mb-1.5">Officer ID / Badge</label>
                  <input 
                    type="text" 
                    value={officerId} 
                    onChange={(e) => setOfficerId(e.target.value)}
                    className="w-full bg-[#050a14] border border-cyan-500/20 rounded px-3 py-2 text-sm text-cyan-100 focus:outline-none focus:border-cyan-400 font-mono" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] font-mono text-cyan-500/80 mb-1.5">Assigned Unit</label>
                  <input 
                    type="text" 
                    value={officerUnit} 
                    onChange={(e) => setOfficerUnit(e.target.value)}
                    className="w-full bg-[#050a14] border border-cyan-500/20 rounded px-3 py-2 text-sm text-cyan-100 focus:outline-none focus:border-cyan-400 font-sans" 
                  />
                </div>
              </div>

              <div className="border-b border-cyan-500/10 pb-2 pt-2">
                <span className="text-xs font-mono font-bold text-cyan-400 tracking-wider">03 // SECURE EVIDENCE IMAGES (NO FAKES)</span>
              </div>

              {/* Verified Presets Grid */}
              <div>
                <label className="block text-[9px] uppercase tracking-[0.2em] font-mono text-amber-500 mb-2">QUICK-SELECT VERIFIED REAL IMAGES</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {VERIFIED_EVIDENCE_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleAddEvidencePreset(preset.url)}
                      className={`p-1.5 rounded bg-[#111c2e] hover:bg-[#1a2d48] border text-[8px] font-mono text-left truncate transition-colors ${evidenceList.includes(preset.url) ? 'border-cyan-400 text-cyan-300 bg-cyan-900/10' : 'border-cyan-500/10 text-slate-400'}`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Image URL Input */}
              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] font-mono text-cyan-500/80 mb-1.5">Custom Real Evidence Image URL</label>
                <div className="flex gap-2">
                  <input 
                    type="url" 
                    value={evidenceUrl} 
                    onChange={(e) => setEvidenceUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..." 
                    className="flex-1 bg-[#050a14] border border-cyan-500/20 rounded px-3 py-2 text-xs text-cyan-100 placeholder-cyan-800/50 focus:outline-none focus:border-cyan-400 font-mono" 
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomEvidence}
                    className="px-4 py-2 bg-cyan-900/20 border border-cyan-500/30 hover:bg-cyan-500/20 text-cyan-400 hover:text-white rounded text-xs font-mono transition-all font-bold shrink-0 uppercase tracking-widest"
                  >
                    ADD
                  </button>
                </div>
              </div>

              {/* Evidence List display */}
              {evidenceList.length > 0 && (
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] font-mono text-cyan-500/60 mb-2">ATTACHED DIGITAL EVIDENCE ({evidenceList.length})</label>
                  <div className="grid grid-cols-4 gap-3">
                    {evidenceList.map((url, idx) => (
                      <div key={idx} className="relative aspect-video rounded border border-cyan-500/30 overflow-hidden group">
                        <img src={url} alt={`Evidence preview ${idx}`} className="w-full h-full object-cover filter brightness-90" />
                        <button
                          type="button"
                          onClick={() => handleRemoveEvidence(idx)}
                          className="absolute inset-0 bg-red-900/80 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-100 transition-opacity rounded text-xs font-mono font-bold"
                        >
                          REMOVE
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Action Row */}
          <div className="pt-6 border-t border-cyan-500/20 flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-slate-600 hover:bg-slate-800 text-slate-400 hover:text-white font-mono text-xs uppercase tracking-widest rounded transition-all"
            >
              Cancel Abort
            </button>
            <button
              type="submit"
              className="px-8 py-2.5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-mono text-xs font-bold uppercase tracking-[0.15em] rounded transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]"
            >
              SUBMIT SECURE RECORD
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

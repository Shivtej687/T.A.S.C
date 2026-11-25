import React, { useState, useEffect, useRef } from 'react';

// --- Types ---
interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  type: 'text' | 'image' | 'file' | 'system';
  isSystem?: boolean;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
}

interface Contact {
  id: string;
  name: string;
  role: string;
  avatar: string;
  phone: string;
  status: 'online' | 'offline' | 'busy' | 'away';
  category: 'NCA' | 'AGENCY' | 'DEFENCE' | 'FIELD';
  unread: number;
}

type CallType = 'VOICE' | 'VIDEO';
type CallStatus = 'DIALING' | 'CONNECTED';

interface ActiveCall {
  type: CallType;
  status: CallStatus;
  startTime: number;
}

// --- Direct Avatar Component with Fallback ---
const ContactAvatarImg: React.FC<{ src: string; alt: string; className?: string; category?: string }> = ({ src, alt, className = "w-10 h-10 rounded-full object-cover border border-cyan-500/30" }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  const getInitials = (name: string) => {
    const clean = name
      .replace(/(Dr\.|Shri|Smt\.|General|Admiral|Air Chief Marshal|Lieutenant General|Major General|Brigadier|Colonel|Head Constable|Constable|Havildar|Sub-Inspector|Captain|IPS|IAS|IRS)/g, '')
      .trim();
    const parts = clean.split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return 'OF';
  };

  if (hasError || !src) {
    return (
      <div className={`${className} flex items-center justify-center bg-[#0d1f33] text-cyan-300 font-bold font-mono text-xs border border-cyan-500/50 shadow-[0_0_8px_rgba(34,211,238,0.3)] shrink-0 select-none`}>
        {getInitials(alt)}
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={alt} 
      className={className} 
      onError={() => setHasError(true)}
    />
  );
};

// --- Directory of Active IAS, IPS, Defence Authorities & Constables ---
const CONTACTS: Contact[] = [
  // National Command Authority & Civil Leadership
  { id: 'PMO', name: 'Shri Narendra Modi', role: 'Prime Minister of India / Head of Govt', category: 'NCA', status: 'busy', phone: '+91-11-2301-PMO1', avatar: '/leaders/narendra_modi.jpg', unread: 0 },
  { id: 'PRES', name: 'Smt. Droupadi Murmu', role: 'President of India / Supreme Commander', category: 'NCA', status: 'online', phone: '+91-11-2301-PRES', avatar: '/leaders/droupadi_murmu.jpg', unread: 0 },
  { id: 'NSA', name: 'Ajit Doval, IPS', role: 'National Security Advisor', category: 'NCA', status: 'online', phone: '+91-11-2301-NSA1', avatar: '/officers/ajit_doval.jpg', unread: 2 },
  { id: 'IAS-SEC', name: 'R. S. Sharma, IAS', role: 'Cabinet Secretary / Defense Grid Admin', category: 'NCA', status: 'online', phone: '+91-11-2309-2244', avatar: '/leaders/rs_sharma.jpg', unread: 0 },

  // Agency Directors & IPS Officers
  { id: 'IPS-MARIA', name: 'Rakesh Maria, IPS', role: 'Director General of Police / Anti-Terror Ops', category: 'AGENCY', status: 'online', phone: '+91-22-2262-0001', avatar: '/officers/rakesh_maria.jpg', unread: 1 },
  { id: 'IPS-BEDI', name: 'Dr. Kiran Bedi, IPS', role: 'Director General (Retd) / Police Reforms', category: 'AGENCY', status: 'online', phone: '+91-11-2309-0010', avatar: '/officers/kiran_bedi.jpg', unread: 0 },
  { id: 'IPS-JAISWAL', name: 'Subodh Kumar Jaiswal, IPS', role: 'Director, Central Bureau of Investigation (CBI)', category: 'AGENCY', status: 'online', phone: '+91-11-2436-0101', avatar: '/officers/subodh_jaiswal.jpg', unread: 0 },
  { id: 'IPS-SYLENDRA', name: 'Dr. C. Sylendra Babu, IPS', role: 'Director General of Police, Marine & Coastal Command', category: 'AGENCY', status: 'online', phone: '+91-44-2844-0005', avatar: '/officers/sylendra_babu.jpg', unread: 0 },
  { id: 'IPS-ROOPA', name: 'D. Roopa, IPS', role: 'Inspector General of Police, CID Internal Vigilance', category: 'AGENCY', status: 'online', phone: '+91-80-2221-0022', avatar: '/officers/d_roopa.png', unread: 0 },
  { id: 'IPS-LANDE', name: 'Shivdeep Waman Lande, IPS', role: 'Inspector General, Special Task Force (STF)', category: 'AGENCY', status: 'online', phone: '+91-612-2215-0088', avatar: '/officers/shivdeep_lande.jpg', unread: 0 },
  { id: 'IPS-NEERAJ', name: 'Neeraj Kumar, IPS', role: 'Commissioner of Police (Retd) / Counter-Intel', category: 'AGENCY', status: 'away', phone: '+91-11-2331-0099', avatar: '/officers/neeraj_kumar.jpg', unread: 0 },
  { id: 'IRS-SAMEER', name: 'Sameer Wankhede, IRS', role: 'Zonal Director, Special Counter-Narcotics Unit', category: 'AGENCY', status: 'online', phone: '+91-22-2282-0120', avatar: '/officers/sameer_wankhede.jpg', unread: 0 },
  { id: 'IPS-VERMA', name: 'Alok Verma, IPS', role: 'Former Director CBI / Security Advisor', category: 'AGENCY', status: 'away', phone: '+91-11-2338-0055', avatar: '/officers/alok_verma.jpg', unread: 0 },

  // Defence Authorities (Generals, Brigadiers, Colonels, Admirals)
  { id: 'CDS', name: 'General Anil Chauhan', role: 'Chief of Defence Staff (CDS) / Tri-Services Command', category: 'DEFENCE', status: 'busy', phone: '+91-11-2301-CDS1', avatar: '/leaders/anil_chauhan.jpg', unread: 0 },
  { id: 'COAS', name: 'General Upendra Dwivedi', role: 'Chief of Army Staff (COAS) / Indian Army', category: 'DEFENCE', status: 'online', phone: '+91-11-2301-ARMY', avatar: '/leaders/upendra_dwivedi.jpg', unread: 0 },
  { id: 'CNS', name: 'Admiral Dinesh K Tripathi', role: 'Chief of Naval Staff (CNS) / Indian Navy', category: 'DEFENCE', status: 'online', phone: '+91-11-2301-NAVY', avatar: '/leaders/dinesh_tripathi.jpg', unread: 0 },
  { id: 'CAS', name: 'Air Chief Marshal Amar Preet Singh', role: 'Chief of Air Staff (CAS) / Indian Air Force', category: 'DEFENCE', status: 'online', phone: '+91-11-2301-IAF1', avatar: '/leaders/amar_preet_singh.jpg', unread: 0 },
  { id: 'LTGEN-KUMAR', name: 'Lieutenant General M. V. Suchindra Kumar', role: 'Northern Army Commander', category: 'DEFENCE', status: 'online', phone: '+91-191-2520-001', avatar: '/leaders/suchindra_kumar.jpg', unread: 0 },
  { id: 'MAJGEN-SHARMA', name: 'Major General S. P. Sharma', role: 'Divisional Commander, 19 Infantry Division', category: 'DEFENCE', status: 'busy', phone: '+91-193-2220-111', avatar: '/defence/maj_gen_sharma.jpg', unread: 0 },
  { id: 'BRIG-RATHORE', name: 'Brigadier R. S. Rathore', role: 'Brigade Commander, 121 Infantry Border Brigade', category: 'DEFENCE', status: 'online', phone: '+91-198-2500-222', avatar: '/defence/brig_rathore.jpg', unread: 0 },
  { id: 'BRIG-KULDEEP', name: 'Brigadier Kuldeep Singh', role: 'Commander, Western Sector Armored Brigade', category: 'DEFENCE', status: 'online', phone: '+91-172-2700-333', avatar: '/defence/brig_kuldeep.jpg', unread: 0 },
  { id: 'COL-JASWANT', name: 'Colonel Jaswant Singh', role: 'Commanding Officer, 9 Para Special Forces', category: 'DEFENCE', status: 'busy', phone: '+91-191-2400-999', avatar: '/defence/col_jaswant.jpg', unread: 0 },
  { id: 'COL-ANANYA', name: 'Colonel Ananya Roy', role: 'Director, Military Intelligence Command', category: 'DEFENCE', status: 'online', phone: '+91-11-2301-MINT', avatar: '/defence/col_ananya.jpg', unread: 0 },

  // Field Officers, Constables & Field Operatives
  { id: 'HC-SHINDE', name: 'Head Constable Ramesh Shinde', role: 'Senior Field Operative, Mumbai Crime Branch', category: 'FIELD', status: 'online', phone: '+91-98200-11420', avatar: '/field/hc_shinde.jpg', unread: 0 },
  { id: 'CONST-GURDEEP', name: 'Constable Gurdeep Singh', role: 'Special Task Force (STF) Field Recon', category: 'FIELD', status: 'online', phone: '+91-98140-55310', avatar: '/field/constable_gurdeep.jpg', unread: 0 },
  { id: 'CONST-PRIYA', name: 'Constable Priya Nair', role: 'Cyber Crime Field Desk Operator', category: 'FIELD', status: 'online', phone: '+91-98470-88120', avatar: '/field/constable_priya.jpg', unread: 0 },
  { id: 'CONST-PATIL', name: 'Constable Vikas Patil', role: 'Control Room Emergency Tactical Dispatcher', category: 'FIELD', status: 'online', phone: '+91-98690-33210', avatar: '/field/constable_patil.jpg', unread: 0 },
  { id: 'HAV-BALWAN', name: 'Havildar Balwan Singh', role: 'Border Outpost Senior Patrol Operative', category: 'FIELD', status: 'online', phone: '+91-98100-77440', avatar: '/field/havildar_balwan.jpg', unread: 0 },
  { id: 'SI-RAJAN', name: 'Sub-Inspector Rajan Verma', role: 'Delhi Special Cell Field Team Lead', category: 'FIELD', status: 'online', phone: '+91-98110-22990', avatar: '/field/si_rajan.jpg', unread: 0 },
  { id: 'MARCOS-1', name: 'Captain R. Shergill', role: 'MARCOS Naval Special Warfare Lead', category: 'FIELD', status: 'online', phone: '+91-22-2215-MARCOS', avatar: '/field/marcos_shergill.jpg', unread: 0 }
];

const INITIAL_MESSAGES: Record<string, Message[]> = {
  'NSA': [
    { id: 'm1', senderId: 'NSA', text: 'Commander Shivtej, status report on Sector 4 grid required.', timestamp: '10:00', status: 'read', type: 'text' },
    { id: 'm2', senderId: 'me', text: 'System grid is green, NSA Doval. All biometric and radar nodes operational.', timestamp: '10:02', status: 'read', type: 'text' },
    { id: 'm3', senderId: 'NSA', text: 'Good. What is the situation at the northern border checkpoint?', timestamp: '10:05', status: 'read', type: 'text' }
  ],
  'IPS-MARIA': [
    { id: 'r1', senderId: 'IPS-MARIA', text: 'Jai Hind Commander Shivtej. Crime Branch is monitoring intelligence logs.', timestamp: '09:15', status: 'read', type: 'text' },
    { id: 'r2', senderId: 'IPS-MARIA', text: 'Hello Commander, what is the matter?', timestamp: '09:16', status: 'delivered', type: 'text' }
  ],
  'COAS': [
    { id: 'c1', senderId: 'COAS', text: 'Commander Shivtej, Army Command is standing by for tactical updates.', timestamp: '11:20', status: 'read', type: 'text' },
    { id: 'c2', senderId: 'COAS', text: 'Jai Hind! What is the situation on the ground?', timestamp: '11:22', status: 'delivered', type: 'text' }
  ]
};

// --- Natural Language Fallback Generator ---
const getNaturalReply = (contact: Contact, text: string): string => {
  const lower = text.toLowerCase().trim();

  // Check for greeting intent
  const isGreeting = /^(hi|hello|hey|namaste|jai hind|good morning|good evening|gm|hlo|sir|salute|greetings)\b/i.test(lower);

  if (isGreeting) {
    if (contact.category === 'DEFENCE') {
      return `Jai Hind, Commander Shivtej! What is the situation?`;
    }
    if (contact.category === 'FIELD') {
      return `Jai Hind Sir! Constable ${contact.name.split(' ').pop()} reporting on duty. What is the situation?`;
    }
    if (contact.category === 'NCA') {
      return `Good day, Commander Shivtej. What matter requires my attention?`;
    }
    return `Hello Commander. What is the matter?`;
  }

  // Check if situation/incident is described
  if (/suspect|border|drone|ship|weapon|movement|bomb|terror|attack|firing|dock|crime|gang|underworld|leak|cyber|hack|vehicle|escape|hostage|emergency|urgent|backup|threat|target|location|coordinates|help|incident|report|matter|issue|problem|case/i.test(lower)) {
    if (contact.category === 'DEFENCE') {
      return `Understood Commander Shivtej! Tactical strike forces are alerted. Send exact grid coordinates and current force strength on the ground immediately!`;
    }
    if (contact.category === 'AGENCY') {
      return `Noted. I am dispatching local Crime Branch & Special Task Force teams to seal all exit routes. What is the suspect's current heading?`;
    }
    if (contact.category === 'FIELD') {
      return `Copy that Sir! I am at my field position right now. Standing by for your order to breach or maintain surveillance!`;
    }
    return `Understood, Commander Shivtej. National Security Command is monitoring this. Please keep me updated on every development.`;
  }

  // General conversational follow-up
  if (contact.category === 'FIELD') {
    return `Copy Sir! Standing by for your order. Please tell me what action is required on the field.`;
  }
  return `Understood Commander Shivtej. Please specify the situation or matter in detail so we can proceed with the response.`;
};

// --- Sub-Component: Decrypting Text Effect ---
const DecryptingText: React.FC<{ text: string; className?: string }> = ({ text, className }) => {
  const [displayText, setDisplayText] = useState('');
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&';

  useEffect(() => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(
        text
          .split('')
          .map((letter, index) => {
            if (index < iteration) return letter;
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('')
      );

      if (iteration >= text.length) clearInterval(interval);
      iteration += 1 / 2;
    }, 25);

    return () => clearInterval(interval);
  }, [text]);

  return <span className={className}>{displayText}</span>;
};

// --- Sub-Component: Burn Message Wrapper ---
const BurnMessage: React.FC<{ children: React.ReactNode; onBurnComplete: () => void }> = ({ children, onBurnComplete }) => {
    const [status, setStatus] = useState<'visible' | 'burning'>('visible');

    useEffect(() => {
        const burnTimer = setTimeout(() => {
            setStatus('burning');
        }, 12000); // 12 seconds read time before self-destruct

        const removeTimer = setTimeout(() => {
            onBurnComplete();
        }, 13500);

        return () => {
            clearTimeout(burnTimer);
            clearTimeout(removeTimer);
        };
    }, [onBurnComplete]);

    return (
        <div className={`transition-all duration-1000 ${status === 'burning' ? 'animate-burn-out' : ''}`}>
            {children}
        </div>
    );
};

interface EncryptedCommsProps {
  onClose: () => void;
}

export const EncryptedComms: React.FC<EncryptedCommsProps> = ({ onClose }) => {
  const [selectedContactId, setSelectedContactId] = useState<string | null>('NSA');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileShowSidebar, setMobileShowSidebar] = useState(true);
  
  // Call State
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedContact = CONTACTS.find(c => c.id === selectedContactId);

  useEffect(() => {
    if (selectedContactId) {
      setMessages([...(INITIAL_MESSAGES[selectedContactId] || [])]);
    } else {
      setMessages([]);
    }
  }, [selectedContactId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Call Timer
  useEffect(() => {
      let interval: any;
      if (activeCall?.status === 'CONNECTED') {
          interval = setInterval(() => {
              setCallDuration(prev => prev + 1);
          }, 1000);
      }
      return () => clearInterval(interval);
  }, [activeCall?.status]);

  // Handle Call Setup
  const startCall = async (type: CallType) => {
      if (!selectedContactId) return;
      setActiveCall({ type, status: 'DIALING', startTime: Date.now() });
      setCallDuration(0);

      if (type === 'VIDEO') {
          try {
              const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
              setLocalStream(stream);
          } catch (err) {
              console.error("Failed to access media devices", err);
          }
      }

      setTimeout(() => {
          setActiveCall(prev => prev ? { ...prev, status: 'CONNECTED' } : null);
      }, 2500);
  };

  const endCall = () => {
      if (localStream) {
          localStream.getTracks().forEach(track => track.stop());
          setLocalStream(null);
      }

      if (activeCall) {
          const durationStr = `${Math.floor(callDuration / 60)}:${(callDuration % 60).toString().padStart(2, '0')}`;
          const systemMsg: Message = {
              id: Date.now().toString(),
              senderId: 'system',
              text: `SECURE ${activeCall.type} CALL TERMINATED - DURATION ${durationStr} - LOG ENCRYPTED`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              status: 'read',
              type: 'system',
              isSystem: true
          };
          setMessages(prev => [...prev, systemMsg]);
      }

      setActiveCall(null);
  };

  useEffect(() => {
      if (localVideoRef.current && localStream) {
          localVideoRef.current.srcObject = localStream;
      }
  }, [localStream, activeCall]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedContactId || !selectedContact) return;

    const userText = input.trim();
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 'me',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
      type: 'text'
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');

    // Try backend AI roleplay endpoint first
    try {
      const response = await fetch('/api/comms/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactName: selectedContact.name,
          contactRole: selectedContact.role,
          contactCategory: selectedContact.category,
          userMessage: userText,
          history: messages.slice(-6)
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.reply) {
          const reply: Message = {
            id: (Date.now() + 1).toString(),
            senderId: selectedContactId,
            text: data.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'read',
            type: 'text'
          };
          setMessages(prev => [...prev, reply]);
          return;
        }
      }
    } catch (err) {
      console.warn('Comms server chat endpoint offline, using natural fallback', err);
    }

    // Natural fallback logic
    setTimeout(() => {
      const naturalReply = getNaturalReply(selectedContact, userText);
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        senderId: selectedContactId,
        text: naturalReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'read',
        type: 'text'
      };
      setMessages(prev => [...prev, reply]);
    }, 1200);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedContactId || !selectedContact) return;

    const isImage = file.type.startsWith('image/');
    const fileUrl = URL.createObjectURL(file);
    const fileSize = file.size > 1048576 ? (file.size / 1048576).toFixed(1) + ' MB' : (file.size / 1024).toFixed(1) + ' KB';

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 'me',
      text: isImage ? 'Image Intelligence Attachment' : file.name,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
      type: isImage ? 'image' : 'file',
      fileUrl: fileUrl,
      fileName: file.name,
      fileSize: fileSize
    };

    setMessages(prev => [...prev, newMessage]);
    if (fileInputRef.current) fileInputRef.current.value = '';

    setTimeout(() => {
        const replyText = selectedContact.category === 'DEFENCE' 
          ? `File [${file.name}] received and forwarded to Tactical Command for verification. What is the situation?` 
          : `File [${file.name}] received by ${selectedContact.name}. Please explain the matter related to this file.`;

        const reply: Message = {
            id: (Date.now() + 1).toString(),
            senderId: selectedContactId,
            text: replyText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'read',
            type: 'text'
        };
        setMessages(prev => [...prev, reply]);
    }, 1500);
  };

  const removeMessage = (msgId: string) => {
      setMessages(prev => prev.filter(m => m.id !== msgId));
  };

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'online': return 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]';
          case 'busy': return 'bg-red-500';
          case 'away': return 'bg-yellow-500';
          default: return 'bg-gray-500';
      }
  };

  const filteredContacts = CONTACTS.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderContactGroup = (title: string, category: string) => {
      const group = filteredContacts.filter(c => c.category === category);
      if (group.length === 0) return null;
      return (
          <div className="mb-4">
              <div className="px-4 py-2 text-[11px] font-mono text-cyan-400/80 uppercase tracking-widest border-b border-cyan-500/20 mb-2 font-semibold">
                  {title} ({group.length})
              </div>
              {group.map(contact => (
                  <div 
                    key={contact.id}
                    onClick={() => {
                        setSelectedContactId(contact.id);
                        setMobileShowSidebar(false);
                    }}
                    className={`px-4 py-3 flex items-center space-x-3 cursor-pointer hover:bg-cyan-900/20 transition-colors border-l-2 ${selectedContactId === contact.id ? 'bg-cyan-900/30 border-cyan-400' : 'border-transparent hover:border-cyan-500/30'}`}
                  >
                      <div className="relative shrink-0">
                          <ContactAvatarImg src={contact.avatar} alt={contact.name} category={contact.category} className="w-10 h-10 rounded-full bg-gray-800 object-cover border border-cyan-500/30" />
                          <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0a1525] ${getStatusColor(contact.status)}`}></div>
                      </div>
                      <div className="flex-grow min-w-0">
                          <div className="flex justify-between items-baseline">
                              <div className={`text-sm font-bold truncate ${selectedContactId === contact.id ? 'text-white' : 'text-gray-200'}`}>{contact.name}</div>
                              {contact.unread > 0 && <div className="text-[10px] font-bold bg-cyan-500 text-black px-1.5 rounded-full">{contact.unread}</div>}
                          </div>
                          <div className="text-xs text-gray-400 truncate">{contact.role}</div>
                          <div className="text-[11px] text-cyan-400/80 font-mono tracking-wider truncate flex items-center mt-0.5">
                              <svg className="w-3 h-3 mr-1 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                              {contact.phone}
                          </div>
                      </div>
                  </div>
              ))}
          </div>
      )
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#050a14] flex flex-col font-sans animate-in fade-in duration-300">
        <style>{`
            @keyframes burnOut {
                0% { filter: contrast(100%) brightness(100%); opacity: 1; transform: scale(1); color: inherit; }
                30% { filter: contrast(150%) brightness(120%) sepia(100%) hue-rotate(-30deg); color: #ff4500; transform: skewX(2deg); }
                60% { filter: contrast(200%) brightness(150%) sepia(100%) hue-rotate(-50deg) blur(1px); color: #ff0000; opacity: 0.8; }
                100% { filter: contrast(200%) brightness(0%) grayscale(100%) blur(4px); opacity: 0; transform: scale(0.9); }
            }
            .animate-burn-out {
                animation: burnOut 1.5s ease-in-out forwards;
            }
            .waveform-bar {
                animation: wave 1s ease-in-out infinite;
            }
            @keyframes wave {
                0%, 100% { height: 20%; }
                50% { height: 100%; }
            }
        `}</style>

        {/* Header */}
        <div className="h-16 bg-[#0a1525] border-b border-cyan-500/20 flex items-center justify-between px-6 z-20 shrink-0 shadow-lg">
            <div className="flex items-center space-x-4">
                 <div className="w-10 h-10 border border-cyan-500/30 rounded flex items-center justify-center bg-cyan-900/10 relative overflow-hidden">
                    <div className="absolute inset-0 bg-cyan-500/10 animate-pulse"></div>
                    <svg className="w-5 h-5 text-cyan-400 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                 </div>
                 <div>
                    <h1 className="text-xl font-bold text-white tracking-widest uppercase flex items-center">
                      Secure Comms
                      <span className="ml-3 text-xs font-mono bg-cyan-950 border border-cyan-500/40 text-cyan-300 px-2 py-0.5 rounded">DIRECT PHONE DIRECTORY</span>
                    </h1>
                    <div className="text-[10px] text-cyan-400/80 font-mono tracking-[0.2em] uppercase">Level 7 Encrypted Uplink // Real-Time AI Dispatch</div>
                 </div>
            </div>
            
            <button onClick={onClose} className="p-2 hover:bg-red-900/20 rounded text-gray-400 hover:text-red-400 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>

        {/* Content */}
        <div className="flex-grow flex overflow-hidden relative">
            
            {/* Sidebar */}
            <div className={`w-full md:w-96 bg-[#080f1e] border-r border-cyan-500/20 flex flex-col z-10 shrink-0 ${mobileShowSidebar ? 'flex' : 'hidden md:flex'}`}>
                {/* Search */}
                <div className="p-4 border-b border-cyan-500/10">
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="SEARCH NAME, RANK, PHONE..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#050a14] border border-cyan-500/30 rounded px-3 py-2 pl-9 text-xs font-mono text-cyan-100 focus:outline-none focus:border-cyan-400 placeholder-cyan-700"
                        />
                        <svg className="w-4 h-4 text-cyan-600 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                </div>

                {/* Contact Directory List */}
                <div className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-900/50">
                    {renderContactGroup('NATIONAL COMMAND & CIVIL LEADERSHIP', 'NCA')}
                    {renderContactGroup('AGENCY HEADS & IPS DIRECTORS', 'AGENCY')}
                    {renderContactGroup('DEFENCE AUTHORITIES (GENERAL, BRIGADIER, COLONEL)', 'DEFENCE')}
                    {renderContactGroup('FIELD OFFICERS, CONSTABLES & OPERATIVES', 'FIELD')}
                </div>
                
                {/* User Status */}
                <div className="p-4 border-t border-cyan-500/20 bg-[#050a14]">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded border border-cyan-500/50 bg-cyan-950 flex items-center justify-center font-bold text-cyan-300">
                          CS
                        </div>
                        <div>
                            <div className="text-white text-sm font-bold">CMDR. SHIVTEJ</div>
                            <div className="text-xs text-green-400 font-mono flex items-center">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                                ONLINE // T.A.S.C. DISPATCH COMMAND
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className={`flex-grow flex flex-col bg-[#050a14] relative ${!mobileShowSidebar ? 'flex' : 'hidden md:flex'}`}>
                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(34,211,238,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)] pointer-events-none"></div>

                {selectedContact ? (
                    <>
                        {/* Chat Header */}
                        <div className="h-20 border-b border-cyan-500/20 flex justify-between items-center px-4 sm:px-6 relative z-10 bg-[#0a1525]/90 backdrop-blur-sm">
                            <div className="flex items-center space-x-3 sm:space-x-4">
                                {!mobileShowSidebar && (
                                    <button 
                                        onClick={() => setMobileShowSidebar(true)}
                                        className="md:hidden p-1.5 mr-1 hover:bg-cyan-500/10 rounded text-cyan-400 transition-colors"
                                        title="Back to Directory"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                        </svg>
                                    </button>
                                )}
                                <div className="relative shrink-0">
                                    <ContactAvatarImg src={selectedContact.avatar} alt={selectedContact.name} category={selectedContact.category} className="w-12 h-12 rounded-full border-2 border-cyan-500/40 object-cover" />
                                    <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#0a1525] ${getStatusColor(selectedContact.status)}`}></div>
                                </div>
                                <div>
                                    <div className="text-white font-bold text-base tracking-wide flex items-center">
                                      {selectedContact.name}
                                      <span className="ml-2 text-[11px] font-mono bg-cyan-900/40 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/30">
                                        {selectedContact.phone}
                                      </span>
                                    </div>
                                    <div className="text-xs text-cyan-400/90 font-mono">
                                      {selectedContact.role}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 text-cyan-400">
                                <button onClick={() => startCall('VOICE')} className="flex items-center space-x-1.5 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/30 px-3 py-2 rounded text-xs font-mono text-cyan-200 transition-colors group" title="Secure Voice Call">
                                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                    <span className="hidden sm:inline">CALL {selectedContact.phone}</span>
                                </button>
                                <button onClick={() => startCall('VIDEO')} className="flex items-center space-x-1.5 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/30 px-3 py-2 rounded text-xs font-mono text-cyan-200 transition-colors" title="Secure Video Uplink">
                                    <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                    <span className="hidden sm:inline">VIDEO UPLINK</span>
                                </button>
                            </div>
                        </div>

                        {/* Messages Container */}
                        <div className="flex-grow overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-cyan-900/30 relative z-10">
                            <div className="flex justify-center mb-6">
                                <div className="bg-cyan-950/40 text-cyan-400 text-xs font-mono px-4 py-1 rounded-full border border-cyan-500/20">
                                    Encrypted Channel Session with {selectedContact.name} ({selectedContact.phone})
                                </div>
                            </div>
                            
                            {messages.map((msg) => {
                                const isMe = msg.senderId === 'me';
                                const isSystem = msg.isSystem;
                                
                                return (
                                    <BurnMessage key={msg.id} onBurnComplete={() => removeMessage(msg.id)}>
                                        <div className={`flex ${isSystem ? 'justify-center' : isMe ? 'justify-end' : 'justify-start'}`}>
                                            {isSystem ? (
                                                <div className="max-w-[80%] bg-cyan-950/40 border border-cyan-500/30 px-4 py-2 rounded-full text-cyan-300 text-xs font-mono tracking-wider uppercase">
                                                    {msg.text}
                                                </div>
                                            ) : (
                                                <div className={`max-w-[75%] rounded-lg p-3.5 relative group ${isMe ? 'bg-cyan-950/50 border border-cyan-500/40 text-cyan-100 rounded-tr-none shadow-[0_0_15px_rgba(34,211,238,0.1)]' : 'bg-[#0f1c2e] border border-cyan-500/20 text-gray-100 rounded-tl-none shadow-md'}`}>
                                                    <div className="text-xs font-mono font-bold text-cyan-400 mb-1 flex justify-between items-center">
                                                      <span>{isMe ? 'CMDR. SHIVTEJ' : selectedContact.name}</span>
                                                      <span className="text-[10px] text-gray-400 font-normal ml-3">{msg.timestamp}</span>
                                                    </div>
                                                    <div className="text-sm font-sans leading-relaxed text-gray-100">
                                                        {msg.type === 'image' && msg.fileUrl ? (
                                                            <div className="mb-2 rounded border border-cyan-500/30 overflow-hidden">
                                                                <img src={msg.fileUrl} alt="Attachment" className="max-w-full h-auto" />
                                                            </div>
                                                        ) : msg.type === 'file' ? (
                                                            <div className="flex items-center space-x-3 bg-black/40 p-3 rounded border border-cyan-500/20 mb-2">
                                                                <div className="p-2 bg-cyan-900/40 rounded text-cyan-400">
                                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                                </div>
                                                                <div>
                                                                    <div className="text-white text-sm font-bold truncate max-w-[200px]">{msg.fileName}</div>
                                                                    <div className="text-cyan-500/60 text-xs font-mono">{msg.fileSize} • ENCRYPTED FILE</div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <DecryptingText text={msg.text} />
                                                        )}
                                                    </div>
                                                    <div className={`text-[10px] font-mono mt-1.5 flex items-center justify-end opacity-60 ${isMe ? 'text-cyan-300' : 'text-gray-400'}`}>
                                                        {isMe && (
                                                            <span className="ml-1">
                                                                {msg.status === 'read' ? (
                                                                    <svg className="w-3.5 h-3.5 text-cyan-400" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                                                                ) : (
                                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                                )}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className={`absolute w-2 h-2 border-t border-l ${isMe ? 'border-cyan-500/50 -top-[1px] -left-[1px]' : 'border-gray-600 -top-[1px] -right-[1px] rotate-90'}`}></div>
                                                </div>
                                            )}
                                        </div>
                                    </BurnMessage>
                                )
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-[#0a1525] border-t border-cyan-500/20 relative z-20">
                            <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} />
                                <button 
                                    type="button" 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-2.5 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-full transition-colors shrink-0"
                                    title="Attach Intelligence File"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                                </button>
                                <div className="flex-grow relative">
                                    <input 
                                        type="text" 
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder={`Message ${selectedContact.name} (${selectedContact.phone})...`}
                                        className="w-full bg-[#050a14] border border-cyan-500/30 rounded-full px-5 py-3 text-sm font-sans text-white placeholder-cyan-700 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(34,211,238,0.15)] transition-all"
                                    />
                                </div>
                                <button type="submit" disabled={!input.trim()} className="p-3 bg-cyan-600 hover:bg-cyan-500 rounded-full text-white shadow-[0_0_15px_rgba(34,211,238,0.3)] disabled:opacity-40 disabled:shadow-none transition-all shrink-0">
                                    <svg className="w-5 h-5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-grow flex flex-col items-center justify-center text-cyan-500/30">
                        <div className="w-32 h-32 border-2 border-dashed border-cyan-500/20 rounded-full flex items-center justify-center mb-6 animate-[spin_10s_linear_infinite]">
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        </div>
                        <h2 className="text-xl font-mono font-bold tracking-widest uppercase mb-2">Secure Link Standby</h2>
                        <p className="text-xs font-mono tracking-wider max-w-xs text-center">SELECT AN IAS, IPS, GENERAL, BRIGADIER, OR CONSTABLE FROM DIRECTORY</p>
                    </div>
                )}

                {/* --- CALL OVERLAY --- */}
                {activeCall && selectedContact && (
                    <div className="absolute inset-0 z-50 bg-[#050a14] flex flex-col items-center justify-center animate-in fade-in duration-500">
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
                        
                        {activeCall.status === 'DIALING' ? (
                            <div className="text-center z-10">
                                <div className="relative w-32 h-32 mx-auto mb-8">
                                    <div className="absolute inset-0 border-2 border-cyan-500/30 rounded-full animate-[ping_2s_infinite]"></div>
                                    <div className="absolute inset-2 border-2 border-cyan-500/50 rounded-full animate-[spin_3s_linear_infinite]"></div>
                                    <ContactAvatarImg src={selectedContact.avatar} alt="Contact" category={selectedContact.category} className="absolute inset-4 w-24 h-24 rounded-full object-cover border-2 border-cyan-400" />
                                </div>
                                <h3 className="text-white font-bold text-xl tracking-wider mb-1">{selectedContact.name}</h3>
                                <div className="text-cyan-400 font-mono text-sm tracking-widest mb-2">{selectedContact.phone}</div>
                                <div className="text-cyan-400/80 font-mono text-xs tracking-[0.3em] animate-pulse uppercase">Dialing Direct Line...</div>
                                <div className="mt-8">
                                    <button onClick={endCall} className="w-12 h-12 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center transition-all shadow-[0_0_20px_red]">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full h-full flex flex-col">
                                {activeCall.type === 'VIDEO' ? (
                                    <div className="relative flex-grow bg-black overflow-hidden">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="text-cyan-500/30 text-4xl sm:text-6xl font-mono animate-pulse text-center">
                                              SECURE VIDEO UPLINK<br/>
                                              <span className="text-xl text-cyan-400">{selectedContact.name} ({selectedContact.phone})</span>
                                            </div>
                                            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] opacity-20 pointer-events-none"></div>
                                        </div>
                                        
                                        <div className="absolute bottom-24 right-6 w-32 h-48 bg-black border border-cyan-500/50 rounded-lg overflow-hidden shadow-2xl">
                                            <video ref={localVideoRef} autoPlay muted className="w-full h-full object-cover transform scale-x-[-1]" />
                                        </div>

                                        <div className="absolute top-6 left-6 bg-black/60 px-4 py-2 rounded border border-cyan-500/30 backdrop-blur-sm">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                <span className="text-white font-mono text-xs tracking-wider">LIVE SECURE FEED</span>
                                            </div>
                                            <div className="text-cyan-400 font-mono text-xl mt-1">
                                                {Math.floor(callDuration / 60)}:{(callDuration % 60).toString().padStart(2, '0')}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-grow flex flex-col items-center justify-center relative">
                                        <div className="w-40 h-40 rounded-full border-4 border-cyan-500/20 p-2 relative mb-6">
                                            <ContactAvatarImg src={selectedContact.avatar} alt="Contact" category={selectedContact.category} className="w-full h-full rounded-full object-cover opacity-80" />
                                            <div className="absolute -inset-8 flex items-center justify-center space-x-1">
                                                {[...Array(12)].map((_, i) => (
                                                    <div key={i} className="w-1 bg-cyan-500/50 waveform-bar" style={{ animationDelay: `${i * 0.1}s`, height: '40px' }}></div>
                                                ))}
                                            </div>
                                        </div>
                                        <h2 className="text-2xl text-white font-bold tracking-widest">{selectedContact.name}</h2>
                                        <div className="text-cyan-400 font-mono text-sm tracking-wider mt-1">{selectedContact.phone}</div>
                                        <div className="text-cyan-300 font-mono text-lg mt-2 tracking-widest">
                                            {Math.floor(callDuration / 60)}:{(callDuration % 60).toString().padStart(2, '0')}
                                        </div>
                                        <div className="mt-2 text-[10px] text-green-400 font-mono border border-green-500/30 px-3 py-1 rounded bg-green-900/20">
                                            AES-256 SECURE CHANNEL ACTIVE
                                        </div>
                                    </div>
                                )}

                                <div className="h-20 bg-[#0a1525]/90 backdrop-blur-md border-t border-cyan-500/20 flex items-center justify-center space-x-8 absolute bottom-0 w-full z-50">
                                    <button className="p-3 bg-gray-800 rounded-full text-white hover:bg-gray-700 transition-colors">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                                    </button>
                                    <button onClick={endCall} className="w-14 h-14 bg-red-600 rounded-full text-white hover:bg-red-500 flex items-center justify-center shadow-[0_0_20px_red] transform hover:scale-105 transition-all">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                    <button className="p-3 bg-gray-800 rounded-full text-white hover:bg-gray-700 transition-colors">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

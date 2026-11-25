import React, { useState } from 'react';

// Dummy Email Data with Folders and Attributes
const INITIAL_EMAILS = [
  { id: 1, sender: 'HQ Command', subject: 'Urgent: Protocol 7 Initiated', snippet: 'All operatives are to report to their designated safe houses immediately. The northern sector has shown heightened electronic countermeasures and unverified radar contacts. Maintain radio silence until further directive.', time: '10:42 AM', read: false, label: 'command', folder: 'inbox', starred: true, important: true, category: 'primary' },
  { id: 2, sender: 'Field Agent K', subject: 'Surveillance Logs [ENCRYPTED]', snippet: 'Attached are the latest satellite intercepts from the border region. Decryption key is standard rotation. Visual corroboration confirms troop repositioning along eastern ridgelines.', time: '9:15 AM', read: true, label: 'intel', folder: 'inbox', starred: false, important: true, category: 'primary' },
  { id: 3, sender: 'Ministry of Defence', subject: 'Budget Approval for Operation Midnight', snippet: 'The requested funds for the upgrade of the T.A.S.C. surveillance grid have been approved pending final security clearance from cabinet joint oversight committee.', time: 'Yesterday', read: true, label: 'admin', folder: 'inbox', starred: false, important: false, category: 'primary' },
  { id: 4, sender: 'Intercept Bot', subject: 'Alert: Keyword Detected "Shadow"', snippet: 'Automated system alert. High frequency keyword "Shadow" detected in sector 4 comms traffic. Signal signature matches known hostile clandestine relay transmitters.', time: 'Yesterday', read: false, label: 'alert', folder: 'spam', starred: false, important: false, category: 'primary' },
  { id: 5, sender: 'R&D Division', subject: 'New Gadget Requisition', snippet: 'The prototype stealth drones are ready for field testing. Please confirm delivery coordinates and verify secondary optical sensor calibration protocols.', time: 'Oct 24', read: true, label: 'logistics', folder: 'inbox', starred: true, important: false, category: 'primary' },
  { id: 6, sender: 'System Admin', subject: 'Security Patch 4.2.1', snippet: 'Mandatory system update scheduled for 0300 hours. Downtime expected to be minimal. All encrypted local keystores will undergo automatic cryptographic verification.', time: 'Oct 22', read: true, label: 'tech', folder: 'trash', starred: false, important: false, category: 'primary' },
  { id: 7, sender: 'Me', subject: 'Mission Report: Alpha-9', snippet: 'Objective completed successfully. Target acquired and secured. Returning to base via safe extraction vector Echo-4.', time: 'Oct 20', read: true, label: 'sent', folder: 'sent', starred: false, important: false, category: 'primary' },
  { id: 8, sender: 'Me', subject: 'Re: Logistics Request', snippet: 'Confirmed. Drop zone B is clear for delivery at 0400 hours. Ground reconnaissance team in place.', time: 'Oct 18', read: true, label: 'sent', folder: 'sent', starred: false, important: false, category: 'primary' },
  { id: 9, sender: 'Aegis Armaments', subject: 'Tactical Combat Exo-Suits Catalog', snippet: 'Upgrade your tactical field units with the latest Gen-3 ballistic defense plates, active thermal camouflage, and lightweight micro-reactors. Procurement discounts inside!', time: '11:15 AM', read: false, label: 'promo', folder: 'inbox', starred: false, important: false, category: 'promotions' },
  { id: 10, sender: 'Apex Intel Seminars', subject: 'Classified Cryptography Masterclass - 50% Off', snippet: 'Become an elite codebreaker. Register today for our deep dive decryption and cyber-warfare workshops using quantum computing simulations.', time: 'Oct 25', read: true, label: 'promo', folder: 'inbox', starred: false, important: false, category: 'promotions' },
  { id: 11, sender: 'Veterans Brotherhood', subject: 'Annual Memorial Gala & Reunion Invite', snippet: 'Reconnect with fellow commanders and logistics personnel from the Eastern Campaigns. Dinner and open bar are fully sponsored by military charity networks.', time: '08:30 AM', read: false, label: 'social', folder: 'inbox', starred: true, important: false, category: 'social' },
  { id: 12, sender: 'Operative Lounge', subject: 'Comrade Agent L updated their active station', snippet: "Active duty successfully completed in Sector 7. Commencing resettlement at headquarters command. Drop a message to congratulate them on their safe return!", time: 'Oct 23', read: true, label: 'social', folder: 'inbox', starred: false, important: false, category: 'social' }
];

// TASC Logo Watermark Component matching the welcome screen exactly
const TASCLogoWatermark: React.FC = () => (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden">
    <div className="relative flex items-center justify-center w-[400px] h-[400px] scale-75 sm:scale-90 md:scale-100 opacity-20">
      <div className="absolute w-[550px] h-[550px] bg-[#050a14]/60 rounded-full blur-2xl z-0"></div>
      <div className="absolute w-[400px] h-[400px] rounded-full border border-cyan-500/30 animate-ripple z-0"></div>
      <div className="absolute w-[400px] h-[400px] rounded-full border border-cyan-500/30 animate-ripple z-0" style={{ animationDelay: '1s' }}></div>
      <div className="absolute w-[400px] h-[400px] rounded-full border border-cyan-500/30 animate-ripple z-0" style={{ animationDelay: '2s' }}></div>
      <div className="absolute w-[400px] h-[400px] rounded-full border border-cyan-500/50 shadow-[0_0_40px_rgba(6,182,212,0.4)] animate-spin-slower z-10">
        <div className="absolute top-1/2 -right-1.5 w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,1)]"></div>
      </div>
      <div className="absolute w-[336px] h-[336px] rounded-full border border-dashed border-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.2)] animate-spin-reverse-slow z-10"></div>
      <div className="absolute w-[416px] h-[416px] rounded-full border-t-2 border-b-2 border-l-0 border-r-0 border-cyan-500/30 rotate-45 animate-pulse z-10"></div>
      <div className="relative flex flex-col items-center justify-center z-20">
        <div className="absolute inset-0 flex items-center justify-center -translate-y-4">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" 
            alt="National Emblem of India" 
            className="w-52 h-auto filter invert opacity-50 drop-shadow-[0_0_20px_rgba(34,211,238,0.4)]" 
            draggable={false} 
          />
        </div>
        <h2 className="relative z-10 text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-50 to-cyan-300 tracking-[0.15em] drop-shadow-[0_0_25px_rgba(34,211,238,0.8)] select-none font-sans">
          T.A.S.C.
        </h2>
        <div className="relative z-10 mt-6 px-8 py-2 bg-[#0a1525]/90 backdrop-blur-md border border-cyan-500/40 rounded-full shadow-[0_0_35px_rgba(34,211,238,0.3)] whitespace-nowrap">
          <span className="text-cyan-400 text-xs font-mono font-bold tracking-[0.3em] uppercase glow-text shadow-cyan-400/50 drop-shadow-md">
            Threat Analysis and Surveillance Cell
          </span>
        </div>
      </div>
    </div>
  </div>
);

interface SecureEmailProps {
  onClose: () => void;
  onLogout: () => void;
}

export const SecureEmail: React.FC<SecureEmailProps> = ({ onClose, onLogout }) => {
  const [emails, setEmails] = useState<any[]>(INITIAL_EMAILS);
  const [selectedEmail, setSelectedEmail] = useState<any | null>(null);
  const [emailTab, setEmailTab] = useState('inbox');
  const [activeCategoryTab, setActiveCategoryTab] = useState('primary');
  const [isComposing, setIsComposing] = useState(false);
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [showGmailSettings, setShowGmailSettings] = useState(false);
  const [showGmailAccount, setShowGmailAccount] = useState(false);

  // Helper to open and mark email as read
  const handleOpenEmail = (email: any) => {
    if (!email.read) {
      setEmails(prev => prev.map(e => e.id === email.id ? { ...e, read: true } : e));
    }
    setSelectedEmail({ ...email, read: true });
  };

  // Toggle starred status
  const handleToggleStar = (e: React.MouseEvent, emailId: number) => {
    e.stopPropagation();
    setEmails(prev => prev.map(email => email.id === emailId ? { ...email, starred: !email.starred } : email));
    if (selectedEmail && selectedEmail.id === emailId) {
      setSelectedEmail((prev: any) => prev ? { ...prev, starred: !prev.starred } : null);
    }
  };

  // Delete an email (move to trash)
  const handleDeleteEmail = (e: React.MouseEvent | null, emailId: number) => {
    if (e) e.stopPropagation();
    setEmails(prev => prev.map(email => email.id === emailId ? { ...email, folder: 'trash' } : email));
    if (selectedEmail && selectedEmail.id === emailId) {
      setSelectedEmail(null);
    }
  };

  // Toggle read/unread status
  const handleToggleRead = (e: React.MouseEvent | null, emailId: number) => {
    if (e) e.stopPropagation();
    setEmails(prev => prev.map(email => {
      if (email.id === emailId) {
        const nextRead = !email.read;
        if (selectedEmail && selectedEmail.id === emailId) {
          setSelectedEmail({ ...selectedEmail, read: nextRead });
        }
        return { ...email, read: nextRead };
      }
      return email;
    }));
  };

  // Send new email
  const handleSendEmail = () => {
    if (!composeSubject.trim() && !composeBody.trim()) {
      setIsComposing(false);
      return;
    }
    const newMail = {
      id: Date.now(),
      sender: 'Me',
      subject: composeSubject.trim() || '(No Subject)',
      snippet: composeBody.trim() || 'Empty transmission content.',
      time: 'Just now',
      read: true,
      label: 'sent',
      folder: 'sent',
      starred: false,
      important: false,
      category: 'primary'
    };
    setEmails(prev => [newMail, ...prev]);
    setComposeTo('');
    setComposeSubject('');
    setComposeBody('');
    setIsComposing(false);
  };

  // Helper to filter emails
  const getFilteredEmails = () => {
    let baseEmails = emails;
    if (emailTab === 'starred') baseEmails = emails.filter(e => e.starred);
    else if (emailTab === 'important') baseEmails = emails.filter(e => e.important);
    else if (emailTab === 'all mail') baseEmails = emails;
    else baseEmails = emails.filter(e => e.folder === emailTab);

    // Apply primary/promotions/social sub-tab filter only when in the Inbox folder
    if (emailTab === 'inbox') {
      return baseEmails.filter(e => (e.category || 'primary') === activeCategoryTab);
    }
    return baseEmails;
  };

  const filteredEmails = getFilteredEmails();

  // Unread counts calculation: only shown when there are unseen/unread emails
  const primaryUnreadCount = emails.filter(e => e.folder === 'inbox' && !e.read && (e.category || 'primary') === 'primary').length;
  const promotionsUnreadCount = emails.filter(e => e.folder === 'inbox' && !e.read && e.category === 'promotions').length;
  const socialUnreadCount = emails.filter(e => e.folder === 'inbox' && !e.read && e.category === 'social').length;

  return (
    <div className="fixed inset-0 z-50 bg-[#1e1e1e] animate-in fade-in duration-300 font-sans flex flex-col">
      {/* Header */}
      <div className="h-16 bg-[#2d2e30] flex items-center justify-between px-2 md:px-4 border-b border-[#444] z-20">
            <div className="flex items-center space-x-1.5 md:space-x-3 w-auto md:w-64">
            <button onClick={onClose} className="p-1.5 md:p-2 hover:bg-[#3c3d3f] rounded-full text-gray-300">
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
            <div className="flex items-center space-x-1">
                <img src="https://ssl.gstatic.com/ui/v1/icons/mail/rfr/logo_gmail_lockup_dark_1x_r5.png" alt="Gmail" className="h-5 md:h-6" />
            </div>
            </div>
            
            <div className="flex-grow max-w-lg md:max-w-2xl mx-2 md:mx-4">
            <div className="bg-[#3c3d3f] rounded-lg flex items-center px-3 py-1.5 md:px-4 md:py-2.5 space-x-2 md:space-x-3">
                <svg className="w-4 h-4 md:w-5 md:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input type="text" placeholder="Search mail" className="bg-transparent border-none outline-none text-white w-full placeholder-gray-400 text-xs md:text-sm" />
            </div>
            </div>

            <div className="flex items-center space-x-1 md:space-x-3 w-auto md:w-64 justify-end relative">
            <button className="hidden sm:block p-2 hover:bg-[#3c3d3f] rounded-full text-gray-300"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></button>
            <div className="relative">
                <button onClick={() => setShowGmailSettings(!showGmailSettings)} className="p-2 hover:bg-[#3c3d3f] rounded-full text-gray-300"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg></button>
                {showGmailSettings && (
                    <div className="absolute top-12 right-0 bg-[#2d2e30] border border-gray-600 rounded-lg shadow-xl w-72 z-50 p-4 font-sans text-gray-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg">Quick settings</h3>
                            <button onClick={() => setShowGmailSettings(false)} className="text-gray-400 hover:text-white"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Apps in Gmail</h4>
                                <div className="flex items-center justify-between p-2 hover:bg-[#3c3d3f] rounded cursor-pointer">
                                    <span>Chat and Meet</span>
                                    <div className="w-10 h-5 bg-blue-600 rounded-full relative"><div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full"></div></div>
                                </div>
                            </div>
                            <div className="border-t border-gray-600 pt-4">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Density</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-3 cursor-pointer"><div className="w-4 h-4 rounded-full border-2 border-blue-400 flex items-center justify-center"><div className="w-2 h-2 bg-blue-400 rounded-full"></div></div><span>Default</span></div>
                                    <div className="flex items-center space-x-3 cursor-pointer opacity-50"><div className="w-4 h-4 rounded-full border-2 border-gray-400"></div><span>Comfortable</span></div>
                                    <div className="flex items-center space-x-3 cursor-pointer opacity-50"><div className="w-4 h-4 rounded-full border-2 border-gray-400"></div><span>Compact</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div className="relative">
                <button onClick={() => setShowGmailAccount(!showGmailAccount)} className="relative block">
                    <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" className="w-8 h-8 rounded-full border border-gray-500 hover:ring-2 hover:ring-gray-400 transition-all" alt="User" />
                </button>
                {showGmailAccount && (
                    <div className="absolute top-12 right-0 bg-[#2d2e30] border border-gray-600 rounded-2xl shadow-2xl w-80 z-50 p-1 font-sans text-gray-200 flex flex-col items-center animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="w-full bg-[#1e1e1e] rounded-xl p-4 flex flex-col items-center mb-1">
                            <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" className="w-16 h-16 rounded-full border-2 border-gray-500 mb-3" alt="User" />
                            <div className="text-white font-medium text-lg">TASC Force</div>
                            <div className="text-gray-400 text-sm mb-4">tascforce1@gmail.com</div>
                            <button className="border border-gray-500 rounded-full px-6 py-2 text-sm hover:bg-[#3c3d3f] transition-colors text-blue-300 border-opacity-50 hover:border-opacity-100">Manage your Google Account</button>
                            </div>
                            <div className="w-full flex flex-col space-y-1 p-2">
                                <button className="flex items-center space-x-4 p-3 hover:bg-[#3c3d3f] w-full rounded-lg transition-colors text-left">
                                <div className="w-8 flex justify-center"><svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg></div>
                                <span className="text-sm">Add another account</span>
                                </button>
                                <button onClick={onLogout} className="flex items-center space-x-4 p-3 hover:bg-[#3c3d3f] w-full rounded-lg transition-colors text-left border-t border-gray-600/50 mt-1">
                                <div className="w-8 flex justify-center"><svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg></div>
                                <span className="text-sm">Sign out</span>
                                </button>
                             </div>
                             <div className="w-full text-center py-3 border-t border-gray-700 text-xs text-gray-500">
                                 Privacy Policy • Terms of Service
                             </div>
                     </div>
                )}
            </div>
            </div>
      </div>

      {/* Horizontal folder chips on Mobile */}
      <div className="flex md:hidden items-center space-x-2 overflow-x-auto py-2 px-3 bg-[#1e1e1e] border-b border-[#2d2e30] scrollbar-hide shrink-0 z-20">
          {['inbox', 'starred', 'sent', 'drafts', 'spam', 'trash'].map(folder => (
              <button
                  key={folder}
                  onClick={() => { setEmailTab(folder); setSelectedEmail(null); }}
                  className={`px-3 py-1 rounded-full text-[10px] font-mono uppercase whitespace-nowrap tracking-wider border ${emailTab === folder ? 'bg-[#c2e7ff] text-[#001d35] border-transparent font-bold' : 'text-gray-300 border-gray-600 bg-transparent'}`}
              >
                  {folder}
              </button>
          ))}
          <button 
              onClick={() => setIsComposing(true)}
              className="px-3 py-1 rounded-full text-[10px] font-mono uppercase whitespace-nowrap tracking-wider bg-cyan-600 text-white border-transparent"
          >
              + COMPOSE
          </button>
      </div>

      <div className="flex flex-grow overflow-hidden relative">
        {/* Sidebar */}
        <div className="hidden md:flex w-64 bg-[#1e1e1e] flex-col py-4 pr-2 z-20">
            <div className="px-4 mb-4">
                <button 
                    onClick={() => setIsComposing(true)}
                    className="flex items-center space-x-3 bg-[#c2e7ff] text-[#001d35] px-4 py-3 rounded-2xl hover:shadow-md transition-all font-medium"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    <span>Compose</span>
                </button>
            </div>
            
            <div className="flex-grow overflow-y-auto space-y-1">
                {[
                    { name: 'Inbox', id: 'inbox', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /> },
                    { name: 'Starred', id: 'starred', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /> },
                    { name: 'Snoozed', id: 'snoozed', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /> },
                    { name: 'Sent', id: 'sent', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /> },
                    { name: 'Drafts', id: 'drafts', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /> },
                    { name: 'Important', id: 'important', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /> },
                    { name: 'Chats', id: 'chats', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /> },
                    { name: 'All Mail', id: 'all mail', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /> },
                    { name: 'Spam', id: 'spam', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /> },
                    { name: 'Trash', id: 'trash', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /> }
                ].map((item, i) => (
                <div 
                    key={item.id} 
                    onClick={() => { setEmailTab(item.id); setSelectedEmail(null); }}
                    className={`flex items-center space-x-4 px-6 py-1.5 rounded-r-full cursor-pointer transition-colors ${emailTab === item.id ? 'bg-[#444648] text-[#e3e3e3] font-bold' : 'text-[#e3e3e3] hover:bg-[#2d2e30]'}`}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {item.icon}
                    </svg>
                    <span className="text-sm">{item.name}</span>
                    {(item.id === 'inbox' || item.id === 'spam') && (
                        <span className="text-xs ml-auto font-medium">
                            {emails.filter(e => e.folder === item.id && !e.read).length || ''}
                        </span>
                    )}
                </div>
                ))}
            </div>
        </div>

        {/* Main Content */}
        <div className="flex-grow bg-[#18191c] flex flex-col rounded-tl-2xl overflow-hidden border-t border-l border-[#2d2e30] mr-2 mb-2 relative z-10">
            {/* Watermark - Persistent across views */}
            <TASCLogoWatermark />

            {selectedEmail ? (
                <div className="flex flex-col h-full bg-[#18191c]/75 backdrop-blur-sm animate-in fade-in slide-in-from-right-10 duration-200 relative z-10">
                    {/* TASC Watermark inside opened mail */}
                    <TASCLogoWatermark />

                    {/* Email Toolbar */}
                    <div className="flex items-center px-4 py-2 border-b border-[#2d2e30] space-x-4 bg-[#1e1e1e]/90 relative z-10">
                    <button onClick={() => setSelectedEmail(null)} className="p-2 hover:bg-[#3c3d3f] rounded-full text-gray-300" title="Back to inbox">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    </button>
                    <div className="h-5 w-[1px] bg-gray-600"></div>
                    <button onClick={(e) => handleToggleRead(e, selectedEmail.id)} className="p-2 hover:bg-[#3c3d3f] rounded-full text-gray-300" title={selectedEmail.read ? "Mark as unread" : "Mark as read"}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </button>
                    <button onClick={(e) => handleToggleStar(e, selectedEmail.id)} className={`p-2 hover:bg-[#3c3d3f] rounded-full ${selectedEmail.starred ? 'text-yellow-400' : 'text-gray-300'}`} title="Star email">
                        <svg className="w-5 h-5" fill={selectedEmail.starred ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                    </button>
                    <button onClick={() => handleDeleteEmail(null, selectedEmail.id)} className="p-2 hover:bg-[#3c3d3f] rounded-full text-gray-300 hover:text-red-400" title="Delete email">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                    </div>
                    
                    <div className="flex-grow overflow-y-auto p-4 md:p-8 relative z-10">
                    <h2 className="text-lg md:text-2xl text-white mb-4 md:mb-6 font-semibold drop-shadow-sm">{selectedEmail.subject}</h2>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 md:mb-8 space-y-2 sm:space-y-0 bg-[#0a1525]/40 p-3 rounded-lg border border-cyan-500/10">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-cyan-600 to-blue-800 flex items-center justify-center text-white font-bold text-sm md:text-lg shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                                {selectedEmail.sender.charAt(0)}
                            </div>
                            <div>
                                <div className="flex flex-col sm:flex-row sm:items-baseline sm:space-x-2">
                                <span className="text-white font-bold text-sm md:text-base">{selectedEmail.sender}</span>
                                <span className="text-cyan-400/80 font-mono text-[10px] md:text-xs">&lt;secure-relay@tasc.gov.in&gt;</span>
                                </div>
                                <div className="text-gray-400 text-xs">to me (Field Commander T.A.S.C.)</div>
                            </div>
                        </div>
                        <div className="text-cyan-300/70 font-mono text-xs md:text-sm">{selectedEmail.time}</div>
                    </div>
                    <div className="text-gray-100 leading-relaxed whitespace-pre-wrap font-sans text-sm md:text-base bg-[#0a1525]/30 p-5 rounded-lg border border-cyan-500/10 backdrop-blur-xs">
                        {selectedEmail.snippet}
                        {'\n\n'}
                        <span className="text-cyan-400/70 font-mono text-xs">--- END ENCRYPTED TRANSMISSION ---</span>
                        {'\n'}
                        <span className="text-cyan-500/50 font-mono text-[11px]">T.A.S.C. Secure Relay Server 04 // MINISTRY OF DEFENCE</span>
                    </div>
                    
                    <div className="mt-8 pt-4 border-t border-[#3c3d3f]">
                        <div className="flex space-x-2">
                            <button className="px-4 py-2 border border-cyan-500/30 rounded-full text-cyan-300 hover:bg-cyan-900/30 hover:border-cyan-400 transition-colors text-sm font-mono flex items-center space-x-1.5">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                                <span>Reply</span>
                            </button>
                            <button className="px-4 py-2 border border-gray-600 rounded-full text-gray-300 hover:bg-[#3c3d3f] transition-colors text-sm font-mono flex items-center space-x-1.5">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" /></svg>
                                <span>Forward</span>
                            </button>
                        </div>
                    </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col h-full bg-[#18191c]/70 backdrop-blur-sm relative z-10">
                {/* Tabs */}
                <div className="flex items-center border-b border-[#2d2e30] bg-[#1e1e1e]">
                    <div 
                        onClick={() => { setActiveCategoryTab('primary'); setSelectedEmail(null); }}
                        className={`flex-1 flex items-center justify-center py-3 cursor-pointer transition-all ${activeCategoryTab === 'primary' ? 'border-b-2 border-[#a8c7fa] text-[#a8c7fa]' : 'text-gray-400 hover:bg-[#2d2e30] hover:text-gray-200'}`}
                    >
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                        <span className="text-xs md:text-sm font-medium">Primary</span>
                        {primaryUnreadCount > 0 && (
                            <span className="ml-2 bg-[#0b57d0] text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                                {primaryUnreadCount}
                            </span>
                        )}
                    </div>
                    <div 
                        onClick={() => { setActiveCategoryTab('promotions'); setSelectedEmail(null); }}
                        className={`flex-1 flex items-center justify-center py-3 cursor-pointer transition-all ${activeCategoryTab === 'promotions' ? 'border-b-2 border-[#a8c7fa] text-[#a8c7fa]' : 'text-gray-400 hover:bg-[#2d2e30] hover:text-gray-200'}`}
                    >
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                        <span className="text-xs md:text-sm font-medium">Promotions</span>
                        {promotionsUnreadCount > 0 && (
                            <span className="ml-2 bg-green-700 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                                {promotionsUnreadCount}
                            </span>
                        )}
                    </div>
                    <div 
                        onClick={() => { setActiveCategoryTab('social'); setSelectedEmail(null); }}
                        className={`flex-1 flex items-center justify-center py-3 cursor-pointer transition-all ${activeCategoryTab === 'social' ? 'border-b-2 border-[#a8c7fa] text-[#a8c7fa]' : 'text-gray-400 hover:bg-[#2d2e30] hover:text-gray-200'}`}
                    >
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        <span className="text-xs md:text-sm font-medium">Social</span>
                        {socialUnreadCount > 0 && (
                            <span className="ml-2 bg-blue-700 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                                {socialUnreadCount}
                            </span>
                        )}
                    </div>
                </div>

                {/* Email List */}
                <div className="flex-grow overflow-y-auto">
                    {filteredEmails.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                            <p className="text-sm">Folder is empty</p>
                        </div>
                    ) : (
                        filteredEmails.map(email => (
                            <div 
                                key={email.id} 
                                onClick={() => handleOpenEmail(email)}
                                className={`flex items-center px-3 md:px-4 py-3 border-b border-[#2d2e30] cursor-pointer hover:bg-[#2d2e30] hover:shadow-sm group transition-all ${email.read ? 'bg-[#1e1e1e] text-gray-300' : 'bg-[#1e232a] text-white font-semibold'}`}
                            >
                                <div className="flex items-center space-x-2 md:space-x-4 min-w-[120px] md:min-w-[200px]">
                                    <div className="hidden sm:block border border-gray-600 rounded-sm w-4 h-4 hover:bg-gray-600"></div>
                                    <button 
                                        onClick={(e) => handleToggleStar(e, email.id)} 
                                        className="p-0.5 rounded hover:bg-gray-700/50"
                                        title={email.starred ? "Starred" : "Not starred"}
                                    >
                                        <svg className={`w-4 h-4 md:w-5 md:h-5 ${email.starred ? 'text-yellow-400 fill-current' : 'text-gray-600 hover:text-gray-400'}`} fill={email.starred ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                                    </button>
                                    <span className={`truncate text-xs md:text-sm ${!email.read ? 'font-bold text-white' : 'text-gray-300'}`}>{email.sender}</span>
                                </div>
                                <div className="flex-grow flex items-center min-w-0 pr-2 md:pr-4">
                                    <span className={`text-xs md:text-sm truncate ${!email.read ? 'font-bold text-white' : 'text-gray-300'}`}>{email.subject}</span>
                                    <span className="hidden sm:inline text-gray-400 text-sm truncate ml-1">- {email.snippet}</span>
                                </div>
                                <div className="text-gray-400 text-[10px] md:text-xs whitespace-nowrap w-16 md:w-20 text-right font-medium group-hover:hidden">
                                    {email.time}
                                </div>
                                <div className="hidden group-hover:flex items-center space-x-2 w-16 md:w-20 justify-end text-gray-400">
                                    <button 
                                        onClick={(e) => handleToggleRead(e, email.id)} 
                                        className="p-1 hover:text-white hover:bg-gray-700 rounded" 
                                        title={email.read ? "Mark as unread" : "Mark as read"}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    </button>
                                    <button 
                                        onClick={(e) => handleDeleteEmail(e, email.id)} 
                                        className="p-1 hover:text-red-400 hover:bg-gray-700 rounded" 
                                        title="Delete"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                </div>
            )}
        </div>

        {/* Compose Modal */}
        {isComposing && (
            <div className="absolute bottom-0 right-0 sm:right-16 w-full sm:w-[500px] bg-[#1e1e1e] rounded-t-lg shadow-2xl z-50 flex flex-col border border-gray-600 font-sans animate-in slide-in-from-bottom-10 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-[#2d2e30] rounded-t-lg cursor-pointer border-b border-gray-600">
                    <span className="text-sm font-medium text-gray-200">New Message</span>
                    <div className="flex items-center space-x-3">
                        <button className="text-gray-400 hover:text-white"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" /></svg></button>
                        <button className="text-gray-400 hover:text-white"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg></button>
                        <button onClick={() => setIsComposing(false)} className="text-gray-400 hover:text-white"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                    </div>
                </div>
                {/* Body */}
                <div className="flex-grow bg-[#1e1e1e] p-2 flex flex-col h-[300px] md:h-[400px]">
                    <div className="border-b border-gray-700">
                        <input 
                            type="text" 
                            value={composeTo}
                            onChange={(e) => setComposeTo(e.target.value)}
                            placeholder="Recipients (e.g. agent.k@tasc.gov.in)" 
                            className="w-full bg-transparent text-white p-2 text-sm outline-none placeholder-gray-500" 
                        />
                    </div>
                    <div className="border-b border-gray-700">
                        <input 
                            type="text" 
                            value={composeSubject}
                            onChange={(e) => setComposeSubject(e.target.value)}
                            placeholder="Subject" 
                            className="w-full bg-transparent text-white p-2 text-sm outline-none placeholder-gray-500" 
                        />
                    </div>
                    <textarea 
                        value={composeBody}
                        onChange={(e) => setComposeBody(e.target.value)}
                        className="flex-grow w-full bg-transparent text-white p-2 text-sm outline-none resize-none font-sans" 
                        placeholder="Encrypted transmission body..."
                    ></textarea>
                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2 px-2 pb-2">
                        <div className="flex items-center space-x-2">
                            <button onClick={handleSendEmail} className="px-6 py-2 bg-[#0b57d0] hover:bg-[#0b57d0]/90 text-white text-sm font-medium rounded-full transition-colors">Send</button>
                            <button className="text-gray-400 hover:bg-[#3c3d3f] p-2 rounded"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg></button>
                        </div>
                        <div className="flex items-center space-x-4 text-gray-400">
                            <button className="hover:text-white"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg></button>
                            <button className="hover:text-white"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></button>
                            <button className="hover:text-white"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></button>
                            <button onClick={() => setIsComposing(false)} className="hover:text-white ml-2"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
    </div>
  );
};
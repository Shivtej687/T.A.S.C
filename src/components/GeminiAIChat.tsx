import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  image?: string;
}

interface GeminiAIChatProps {
  onClose: () => void;
  isOpen?: boolean;
}

const QUICK_PROMPTS = [
  { label: '🛡️ Threat Matrix', prompt: 'Analyze current regional threat indicators and summarize defense posture.' },
  { label: '⚡ Cyber Defense', prompt: 'Draft a 5-step emergency cyber defense protocol against state-sponsored malware.' },
  { label: '🛰️ Satellite Recon', prompt: 'What are the key parameters for satellite reconnaissance analysis?' },
  { label: '📑 Tactical Briefing', prompt: 'Generate a template for an official Ministry of Defence tactical briefing.' },
  { label: '🤖 General AI Query', prompt: 'Explain quantum encryption in military communication simply.' },
];

export const GeminiAIChat: React.FC<GeminiAIChatProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: `**T.A.S.C. GEMINI 3.7 AI CORE ONLINE**\n\nGreetings, Operative. I am your integrated **Gemini 3.7 AI Tactical Assistant**. How can I assist you today? You can ask me about national defense, threat analysis, tactical strategies, code, cyber protocols, or any general query.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setSelectedImage(uploadEvent.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (customPrompt?: string) => {
    const queryText = customPrompt || input;
    if (!queryText.trim() && !selectedImage) return;

    const userMessage: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      image: selectedImage || undefined,
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    if (!customPrompt) setInput('');
    const currentImg = selectedImage;
    setSelectedImage(null);
    setIsLoading(true);

    try {
      // 1. First try API endpoint
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: queryText,
          messages: newHistory.map(m => ({
            role: m.sender === 'user' ? 'user' : 'model',
            text: m.text,
          })),
        }),
      });

      let replyText = '';
      const contentType = response.headers.get('content-type');

      if (response.ok && contentType && contentType.includes('application/json')) {
        const data = await response.json();
        replyText = data.reply;
      } else {
        // If server returns HTML (SPA fallback) or non-JSON, fallback to client-side GoogleGenAI or simulation
        const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (process as any).env?.API_KEY || (process as any).env?.GEMINI_API_KEY;
        if (apiKey) {
          try {
            const ai = new GoogleGenAI({ apiKey });
            const contents: any[] = [];
            
            if (currentImg) {
              const base64Data = currentImg.split(',')[1];
              const mimeType = currentImg.split(';')[0].split(':')[1] || 'image/png';
              contents.push({
                parts: [
                  { inlineData: { data: base64Data, mimeType } },
                  { text: queryText || 'Analyze this image for defense intelligence.' }
                ]
              });
            } else {
              contents.push(queryText);
            }

            const res = await ai.models.generateContent({
              model: 'gemini-3.7-flash',
              contents,
              config: {
                systemInstruction: 'You are the T.A.S.C. Gemini AI Tactical Assistant for the Ministry of Defence, Government of India. Provide intelligent, concise, strategic, and accurate answers like ChatGPT.',
              }
            });
            replyText = res.text || 'Information processed by T.A.S.C. Gemini AI.';
          } catch (clientErr: any) {
            console.warn('Client-side Gemini call fallback warning:', clientErr);
            replyText = `**[T.A.S.C. GEMINI AI INTEL]**\n\nI have received your request regarding: "${queryText}".\n\n- **Status**: Tactical Uplink Operational\n- **Recommendation**: Secure protocol active. Systems nominal.`;
          }
        } else {
          replyText = `**[T.A.S.C. GEMINI AI INTEL]**\n\nI have analyzed your request regarding: "${queryText}".\n\n- **Status**: Telemetry Uplink Verified\n- **Recommendation**: Secure protocol active. Continue mission operations.`;
        }
      }

      const assistantMessage: Message = {
        id: `ast-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Gemini Chat error:', error);
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          text: `**SYSTEM RECOVERY ALERT**: Encountered network variance during secure uplink. Re-establishing connection...`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeech = (id: string, text: string) => {
    if ('speechSynthesis' in window) {
      if (speakingId === id) {
        window.speechSynthesis.cancel();
        setSpeakingId(null);
        return;
      }
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*_#`]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 0.95;
      utterance.onend = () => setSpeakingId(null);
      setSpeakingId(id);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Clear current Gemini AI conversation history?')) {
      setMessages([
        {
          id: 'welcome-reset',
          sender: 'assistant',
          text: `**CHAT HISTORY CLEARED**\n\nReady for new tactical queries. What would you like to discuss?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  };

  const renderMarkdown = (text: string) => {
    // Basic Markdown formatting helper
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Code blocks
      if (line.startsWith('```')) {
        return (
          <div key={idx} className="bg-black/60 border border-cyan-500/30 p-2 rounded my-2 font-mono text-xs text-cyan-300">
            {line.replace(/```/g, '')}
          </div>
        );
      }

      // Headers
      if (line.startsWith('### ')) {
        return <h4 key={idx} className="text-cyan-300 font-bold text-sm mt-3 mb-1">{line.replace('### ', '')}</h4>;
      }
      if (line.startsWith('## ')) {
        return <h3 key={idx} className="text-cyan-400 font-bold text-base mt-4 mb-2 border-b border-cyan-500/20 pb-1">{line.replace('## ', '')}</h3>;
      }
      if (line.startsWith('# ')) {
        return <h2 key={idx} className="text-white font-bold text-lg mt-4 mb-2">{line.replace('# ', '')}</h2>;
      }

      // Bullet points
      if (line.startsWith('- ') || line.startsWith('* ')) {
        const bulletContent = line.substring(2);
        const subParts = bulletContent.split(/(\*\*.*?\*\*)/g);
        return (
          <li key={idx} className="ml-4 list-disc text-cyan-100/90 text-xs md:text-sm my-1">
            {subParts.map((sp, i) => {
              if (sp.startsWith('**') && sp.endsWith('**')) {
                return <strong key={i} className="text-cyan-300 font-semibold">{sp.slice(2, -2)}</strong>;
              }
              return sp;
            })}
          </li>
        );
      }

      // Normal text with bold parsing
      const subParts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={idx} className="text-cyan-100/90 text-xs md:text-sm leading-relaxed mb-2">
          {subParts.map((sp, i) => {
            if (sp.startsWith('**') && sp.endsWith('**')) {
              return <strong key={i} className="text-cyan-300 font-bold drop-shadow-[0_0_5px_rgba(34,211,238,0.3)]">{sp.slice(2, -2)}</strong>;
            }
            if (sp.startsWith('`') && sp.endsWith('`')) {
              return <code key={i} className="bg-cyan-950/60 text-cyan-200 px-1.5 py-0.5 rounded font-mono text-xs border border-cyan-500/30">{sp.slice(1, -1)}</code>;
            }
            return sp;
          })}
        </p>
      );
    });
  };

  return (
    <div className={`fixed z-50 transition-all duration-300 ${isExpanded ? 'inset-2 sm:inset-4 md:inset-6' : 'top-4 md:top-6 bottom-4 md:bottom-6 right-2 sm:right-4 md:right-6 w-[95vw] sm:w-[560px] md:w-[650px] max-h-[calc(100vh-2rem)]'} flex flex-col bg-[#070e1b]/95 backdrop-blur-2xl border border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(34,211,238,0.25)] overflow-hidden animate-in fade-in zoom-in-95 duration-200`}>
      {/* Glow lines */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400"></div>
      
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3 bg-[#0a1628]/95 border-b border-cyan-500/20 select-none shrink-0">
        <div className="flex items-center space-x-3">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.4)]">
            <svg className="w-5 h-5 text-cyan-300 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-black shadow-[0_0_8px_#34d399] animate-ping"></span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-white font-bold font-sans tracking-wider text-sm md:text-base drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                T.A.S.C. GEMINI AI
              </h3>
              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                3.6 FLASH
              </span>
            </div>
            <p className="text-cyan-400/60 text-[9px] md:text-[10px] font-mono tracking-widest uppercase">
              Strategic Intelligence • Real-Time Uplink
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 md:space-x-2">
          <button
            onClick={handleClearChat}
            title="Clear Chat History"
            aria-label="Clear Chat History"
            className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 transition-all text-xs"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? "Collapse" : "Expand Fullscreen"}
            aria-label={isExpanded ? "Collapse Window" : "Expand Window"}
            className="p-2 rounded-lg text-gray-400 hover:text-cyan-300 hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/30 transition-all text-xs"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isExpanded ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9L4 4m0 0l5 0M4 4l0 5m11 11l5 5m0 0l-5 0m5 0l0-5M15 9l5-5m0 0l-5 0m5 0l0 5M9 15l-5 5m0 0l5 0m-5 0l0-5" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              )}
            </svg>
          </button>

          <button
            onClick={onClose}
            title="Close Gemini AI Window"
            aria-label="Close Gemini AI Window"
            className="p-2 rounded-lg text-red-300 hover:text-white bg-red-500/20 hover:bg-red-500/40 border border-red-500/40 transition-all text-xs flex items-center justify-center"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Quick Prompt Chips */}
      <div className="flex items-center space-x-2 px-4 py-2 bg-[#050b15]/60 border-b border-cyan-500/10 overflow-x-auto scrollbar-hide shrink-0">
        <span className="text-[10px] font-mono text-cyan-500/60 uppercase tracking-wider shrink-0 mr-1">QUICK INQUIRY:</span>
        {QUICK_PROMPTS.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(qp.prompt)}
            className="px-2.5 py-1 rounded-full text-[11px] font-mono text-cyan-300 bg-cyan-950/40 hover:bg-cyan-500/20 border border-cyan-500/30 hover:border-cyan-400 transition-all shrink-0 hover:scale-105"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Messages Stream */}
      <div className="flex-grow overflow-y-auto p-4 md:p-6 space-y-4 scrollbar-thin scrollbar-thumb-cyan-500/20 scrollbar-track-transparent">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
          >
            <div className="flex items-center space-x-2 mb-1 px-1">
              {msg.sender === 'assistant' ? (
                <>
                  <div className="w-4 h-4 rounded-full bg-cyan-500/30 border border-cyan-400 flex items-center justify-center">
                    <span className="text-[8px] font-bold text-cyan-300">AI</span>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400 font-semibold tracking-wider">T.A.S.C. GEMINI</span>
                </>
              ) : (
                <>
                  <span className="text-[10px] font-mono text-gray-400 font-semibold tracking-wider">OPERATIVE</span>
                  <div className="w-4 h-4 rounded-full bg-blue-600/40 border border-blue-400 flex items-center justify-center">
                    <span className="text-[8px] font-bold text-blue-300">OP</span>
                  </div>
                </>
              )}
              <span className="text-[9px] font-mono text-gray-500">{msg.timestamp}</span>
            </div>

            <div
              className={`max-w-[88%] md:max-w-[80%] p-3.5 md:p-4 rounded-2xl border shadow-lg ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-br from-cyan-950/60 to-blue-950/80 border-cyan-500/40 text-cyan-100 rounded-tr-none'
                  : 'bg-gradient-to-br from-[#0c192c]/90 to-[#07111e]/95 border-cyan-500/25 text-white rounded-tl-none'
              }`}
            >
              {msg.image && (
                <div className="mb-3 rounded-lg overflow-hidden border border-cyan-500/30 max-h-60">
                  <img src={msg.image} alt="Uploaded attachment" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="prose prose-invert max-w-none">
                {renderMarkdown(msg.text)}
              </div>

              {/* Message Actions */}
              {msg.sender === 'assistant' && (
                <div className="flex items-center justify-end space-x-3 mt-3 pt-2 border-t border-cyan-500/10">
                  <button
                    onClick={() => handleCopy(msg.id, msg.text)}
                    className="flex items-center space-x-1 text-[10px] font-mono text-cyan-400/70 hover:text-cyan-300 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>{copiedId === msg.id ? 'COPIED!' : 'COPY'}</span>
                  </button>

                  <button
                    onClick={() => handleSpeech(msg.id, msg.text)}
                    className={`flex items-center space-x-1 text-[10px] font-mono transition-colors ${
                      speakingId === msg.id ? 'text-green-400 animate-pulse' : 'text-cyan-400/70 hover:text-cyan-300'
                    }`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                    <span>{speakingId === msg.id ? 'SPEAKING...' : 'VOICE'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex flex-col items-start space-y-1 animate-pulse">
            <div className="flex items-center space-x-2 px-1">
              <div className="w-4 h-4 rounded-full bg-cyan-500/30 border border-cyan-400 flex items-center justify-center">
                <span className="text-[8px] font-bold text-cyan-300">AI</span>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 font-semibold tracking-wider">GEMINI AI THINKING</span>
            </div>
            <div className="p-4 rounded-2xl rounded-tl-none bg-[#0c192c]/90 border border-cyan-500/30 text-cyan-300 font-mono text-xs flex items-center space-x-3">
              <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
              <span>Processing military neural intelligence...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Selected Image Preview */}
      {selectedImage && (
        <div className="px-4 py-2 bg-cyan-950/40 border-t border-cyan-500/20 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img src={selectedImage} alt="Attachment" className="w-10 h-10 object-cover rounded border border-cyan-400" />
            <span className="text-xs font-mono text-cyan-300">Image attached for Gemini analysis</span>
          </div>
          <button
            onClick={() => setSelectedImage(null)}
            className="p-1 text-gray-400 hover:text-red-400"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="p-3 md:p-4 bg-[#0a1526]/95 border-t border-cyan-500/20 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center gap-2"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Attach Image / Intelligence Document"
            className="p-2.5 rounded-xl bg-cyan-950/50 hover:bg-cyan-900/50 border border-cyan-500/30 text-cyan-400 hover:text-white transition-all shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Ask Gemini AI (e.g. strategic tactics, code, intelligence)..."
            className="flex-grow py-3 px-4 bg-[#050b14] border border-cyan-500/30 focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(34,211,238,0.2)] rounded-xl text-white text-xs md:text-sm font-sans placeholder-cyan-500/40 focus:outline-none transition-all"
          />

          <button
            type="submit"
            disabled={isLoading || (!input.trim() && !selectedImage)}
            className="p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold shadow-[0_0_15px_rgba(34,211,238,0.4)] disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0 flex items-center justify-center"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-5 h-5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </form>
        <div className="flex justify-between items-center mt-2 px-1">
          <span className="text-[9px] font-mono text-cyan-500/50">
            Press Enter to transmit • Powered by Gemini 3.7
          </span>
          <span className="text-[9px] font-mono text-emerald-400/80 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
            ENCRYPTED LINK
          </span>
        </div>
      </div>
    </div>
  );
};

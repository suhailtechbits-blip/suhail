
import React, { useState, useEffect, useRef } from 'react';
import { ConstituencyData } from '../types';
import { 
    generateSpeech, stopSpeech, fetchAIGroundedNews, 
    ensureAudioContext, fetchConstituencyLiveReport 
} from '../services/gemini';
import { 
    Radio, Mic2, Activity, Play, Square, Loader2, Volume2, 
    RefreshCw, Check, Copy, ExternalLink, Cpu, MapPin, 
    FastForward, Sliders, Newspaper, Megaphone, Send,
    SlidersHorizontal, Key, ShieldAlert, List, ChevronRight,
    PlayCircle, Waves, Timer, Layers, Music, Zap, Youtube, Monitor
} from 'lucide-react';

interface ChannelItem {
    id: string;
    type: 'News' | 'Ad' | 'StationID' | 'ConstituencyReport';
    title: string;
    content: string;
    timestamp: Date;
    isAI?: boolean;
}

const AudioBriefing: React.FC<{ data: ConstituencyData[] }> = ({ data }) => {
    // Console State
    const [isRadioLive, setIsRadioLive] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentSlotIndex, setCurrentSlotIndex] = useState(0);
    const [countdown, setCountdown] = useState(15);
    const [isSearchingAI, setIsSearchingAI] = useState(false);
    const [isAutoPilot, setIsAutoPilot] = useState(true);
    const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // YouTube Bridge State
    const [ytLink, setYtLink] = useState(localStorage.getItem('udf_radio_yt') || 'https://www.youtube.com/live/your_id_here');
    const [isYtSyncing, setIsYtSyncing] = useState(false);

    // Studio Tabs
    const [activeStudioTab, setActiveStudioTab] = useState<'MIXER' | 'CONSTITUENCIES' | 'VOICE_TRACKER' | 'YOUTUBE'>('VOICE_TRACKER');

    const [queue, setQueue] = useState<ChannelItem[]>([
        { id: 'sid-1', type: 'StationID', title: 'UDF RADIO OFFICIAL', content: "നിങ്ങൾ കേൾക്കുന്നത് യു.ഡി.എഫ് റേഡിയോ. ഐക്യജനാധിപത്യ മുന്നണിയുടെ ഔദ്യോഗിക വാർത്താ കേന്ദ്രം.", timestamp: new Date() },
        { id: 'news-init', type: 'News', title: 'തിരഞ്ഞെടുപ്പ് വാർത്തകൾ', content: "കേരളം യു.ഡി.എഫിനൊപ്പം. വികസനത്തുടർച്ചയ്ക്കായി കൈപ്പത്തി ചിഹ്നത്തിൽ വോട്ട് ചെയ്യുക.", timestamp: new Date() },
        { id: 'ad-1', type: 'Ad', title: 'CAMPAIGN PROMO', content: "നാടിന്റെ നന്മയ്ക്കായി, നാളെയുടെ പുരോഗതിക്കായി യു.ഡി.എഫ് സ്ഥാനാർത്ഥികൾക്ക് വോട്ട് ചെയ്യുക.", timestamp: new Date() },
    ]);

    // Refs for playback loop
    const isLiveRef = useRef(false);
    const queueRef = useRef(queue);
    const speedRef = useRef(1.0);

    useEffect(() => { isLiveRef.current = isRadioLive; }, [isRadioLive]);
    useEffect(() => { queueRef.current = queue; }, [queue]);
    useEffect(() => { speedRef.current = playbackSpeed; }, [playbackSpeed]);

    // Save YT Link
    useEffect(() => {
        localStorage.setItem('udf_radio_yt', ytLink);
    }, [ytLink]);

    // --- CONTINUOUS AUTO-PLAY ENGINE ---
    const runRadioChannel = async (startIndex: number) => {
        let index = startIndex;
        
        while (isLiveRef.current) {
            const currentItem = queueRef.current[index];
            if (!currentItem) {
                await new Promise(r => setTimeout(r, 2000));
                index = 0;
                continue;
            }

            setCurrentSlotIndex(index);
            setIsPlaying(true);
            
            try {
                await ensureAudioContext();
                const scriptText = `${currentItem.title}. ${currentItem.content}`;
                await generateSpeech(scriptText, speedRef.current);
            } catch (e: any) {
                if (e.message === "QUOTA_EXHAUSTED") {
                    setError("QUOTA");
                    setIsRadioLive(false);
                    break;
                }
                await new Promise(r => setTimeout(r, 1000));
            }

            index = (index + 1) % queueRef.current.length;
            if (!isLiveRef.current) break;
        }
        
        setIsPlaying(false);
    };

    const handleStudioToggle = async () => {
        if (isRadioLive) {
            stopSpeech();
            setIsRadioLive(false);
            setIsPlaying(false);
        } else {
            setError(null);
            try {
                await ensureAudioContext();
                setIsRadioLive(true);
                runRadioChannel(currentSlotIndex);
            } catch (e) {
                alert("Audio Engine Failed.");
            }
        }
    };

    const handleAutoUpdate = async () => {
        if (isSearchingAI) return;
        setIsSearchingAI(true);
        try {
            const news = await fetchAIGroundedNews("Latest Kerala politics 2026 UDF news");
            const newItem: ChannelItem = {
                id: `ai-news-${Date.now()}`,
                type: 'News',
                title: 'AI VOICE TRACK',
                content: news,
                timestamp: new Date(),
                isAI: true
            };
            setQueue(prev => [newItem, ...prev.slice(0, 19)]);
        } catch (e: any) {
            if (e.message === "QUOTA_EXHAUSTED") setError("QUOTA");
        } finally {
            setIsSearchingAI(false);
        }
    };

    const getPublicLink = () => {
        try {
            const baseUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
            const url = new URL(baseUrl);
            url.searchParams.set('mode', 'radio_public');
            return url.toString();
        } catch (e) {
            return window.location.href.split('?')[0] + "?mode=radio_public";
        }
    };

    return (
        <div className="h-full flex flex-col gap-6 animate-in fade-in duration-700 bg-slate-50 overflow-hidden">
            
            {/* 🎙️ MASTER BROADCAST HEADER */}
            <div className="bg-slate-900 rounded-[48px] p-8 lg:p-12 text-white relative overflow-hidden shadow-2xl border border-white/5">
                <div className="absolute top-0 right-0 p-24 opacity-5 pointer-events-none">
                    <Radio size={400} />
                </div>
                
                <div className="flex flex-col lg:flex-row justify-between items-center gap-10 relative z-10">
                    <div className="space-y-6 flex-1">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className={`flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-black tracking-[0.2em] uppercase transition-all shadow-lg ${isRadioLive ? 'bg-red-600 animate-pulse' : 'bg-slate-800 text-slate-500'}`}>
                                <div className={`w-2.5 h-2.5 rounded-full ${isRadioLive ? 'bg-white' : 'bg-slate-600'}`} />
                                {isRadioLive ? 'ON AIR' : 'STUDIO STANDBY'}
                            </div>
                            
                            <div className="flex items-center gap-2 bg-red-600/10 px-4 py-2 rounded-2xl border border-red-500/20">
                                <Youtube size={14} className="text-red-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-red-400">YouTube Bridge: Connected</span>
                            </div>

                            <button onClick={() => setPlaybackSpeed(prev => prev >= 1.75 ? 1.0 : prev + 0.25)} className="bg-white/5 px-4 py-2 rounded-2xl flex items-center gap-3 border border-white/5 text-[10px] font-black text-emerald-400 hover:text-white transition-colors uppercase tracking-widest">
                                <FastForward size={14} /> Speed: {playbackSpeed}x
                            </button>
                        </div>
                        <h2 className="text-5xl lg:text-7xl font-black italic tracking-tighter uppercase leading-none">
                            UDF <span className="text-emerald-500">RADIO</span>
                        </h2>
                        <div className="flex items-end gap-1.5 h-16 bg-white/5 p-4 rounded-3xl border border-white/5 w-full lg:w-[450px] relative group">
                            {[...Array(45)].map((_, i) => (
                                <div 
                                    key={i} 
                                    className={`w-1.5 bg-emerald-400 rounded-full transition-all duration-300 ${isPlaying ? 'animate-vu' : 'h-2 opacity-10'}`}
                                    style={{ height: isPlaying ? `${20 + Math.random() * 80}%` : '8px', animationDelay: `${i * 0.02}s` }}
                                />
                            ))}
                            {isPlaying && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="bg-red-600 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-[0.3em] shadow-lg flex items-center gap-2">
                                        <Mic2 size={12} /> Live Mic
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-6">
                        <div className="relative group">
                            <button 
                                onClick={handleStudioToggle}
                                className={`w-48 h-48 lg:w-56 lg:h-56 rounded-full flex flex-col items-center justify-center gap-2 border-[12px] transition-all shadow-2xl active:scale-95 ${isRadioLive ? 'bg-white text-red-600 border-red-600 scale-105' : 'bg-slate-900 text-white border-slate-800 hover:scale-105'}`}
                            >
                                {isRadioLive ? <Square size={56} fill="currentColor" /> : <Play size={56} fill="currentColor" className="ml-4" />}
                                <div className="text-[10px] font-black uppercase tracking-widest mt-2">{isRadioLive ? 'KILL STREAM' : 'START AUTO-PLAY'}</div>
                            </button>
                        </div>
                    </div>

                    <div className="w-full lg:w-96 flex flex-col gap-4">
                        <div className="bg-white/10 p-6 rounded-[32px] border border-white/10 backdrop-blur-xl group">
                            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.2em] block mb-3">Public Listener Hub</span>
                            <div className="flex gap-3 items-center bg-black/30 p-3 rounded-2xl border border-white/5">
                                <input readOnly value={getPublicLink()} className="bg-transparent text-[10px] font-mono text-slate-300 outline-none flex-1 truncate" />
                                <button onClick={() => { navigator.clipboard.writeText(getPublicLink()); setCopied(true); setTimeout(()=>setCopied(false), 2000); }} className="text-emerald-400 hover:text-white transition-colors p-1">
                                    {copied ? <Check size={16} /> : <Copy size={16} />}
                                </button>
                                <button onClick={() => window.open(getPublicLink(), '_blank')} className="text-indigo-400 hover:text-white">
                                    <ExternalLink size={16} />
                                </button>
                            </div>
                        </div>
                        <button onClick={handleAutoUpdate} className="w-full bg-white/5 hover:bg-white/10 p-4 rounded-2xl border border-white/10 flex items-center justify-center gap-3 transition-all group">
                            <RefreshCw size={18} className={`text-emerald-400 ${isSearchingAI ? 'animate-spin' : ''}`} />
                            <span className="text-[11px] font-black uppercase tracking-widest text-white">Inject Fresh Voice Track</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* 🎚️ MIXER & VOICE TRACKER CONTENT */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0">
                
                {/* LEFT PANEL: BROADCAST COMMAND */}
                <div className="lg:col-span-7 bg-white rounded-[48px] border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                    <div className="px-10 py-8 border-b border-slate-50 bg-slate-50 flex justify-between items-center">
                        <div className="flex gap-8">
                            <button onClick={() => setActiveStudioTab('VOICE_TRACKER')} className={`text-[12px] font-black uppercase tracking-widest transition-all pb-2 border-b-2 ${activeStudioTab === 'VOICE_TRACKER' ? 'text-indigo-600 border-indigo-600' : 'text-slate-400 border-transparent'}`}>Voice Tracker</button>
                            <button onClick={() => setActiveStudioTab('YOUTUBE')} className={`text-[12px] font-black uppercase tracking-widest transition-all pb-2 border-b-2 flex items-center gap-2 ${activeStudioTab === 'YOUTUBE' ? 'text-red-600 border-red-600' : 'text-slate-400 border-transparent'}`}><Youtube size={14}/> YT Stream</button>
                            <button onClick={() => setActiveStudioTab('MIXER')} className={`text-[12px] font-black uppercase tracking-widest transition-all pb-2 border-b-2 ${activeStudioTab === 'MIXER' ? 'text-indigo-600 border-indigo-600' : 'text-slate-400 border-transparent'}`}>Playlist</button>
                            <button onClick={() => setActiveStudioTab('CONSTITUENCIES')} className={`text-[12px] font-black uppercase tracking-widest transition-all pb-2 border-b-2 ${activeStudioTab === 'CONSTITUENCIES' ? 'text-indigo-600 border-indigo-600' : 'text-slate-400 border-transparent'}`}>Districts</button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                        {activeStudioTab === 'YOUTUBE' && (
                            <div className="space-y-8 animate-in slide-in-from-left duration-500">
                                <div className="bg-red-50 p-8 rounded-[40px] border border-red-100">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-12 h-12 bg-red-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-red-200">
                                            <Youtube size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-red-900 tracking-tight">YouTube Live Bridge</h3>
                                            <p className="text-xs text-red-600 font-bold uppercase tracking-widest">Connect AI Radio to Video</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="block text-[10px] font-black text-red-800 uppercase tracking-widest ml-2">Live Stream URL / Video ID</label>
                                        <div className="flex gap-3">
                                            <input 
                                                value={ytLink}
                                                onChange={(e) => setYtLink(e.target.value)}
                                                className="flex-1 px-6 py-4 bg-white border border-red-200 rounded-2xl focus:ring-2 focus:ring-red-500 focus:outline-none font-medium text-slate-800"
                                                placeholder="https://youtube.com/live/..."
                                            />
                                            <button 
                                                onClick={() => { setIsYtSyncing(true); setTimeout(()=>setIsYtSyncing(false), 2000); }}
                                                className="bg-red-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-200 flex items-center gap-2"
                                            >
                                                {isYtSyncing ? <Loader2 size={16} className="animate-spin" /> : <Monitor size={16} />}
                                                SYNC
                                            </button>
                                        </div>
                                        <p className="text-[10px] text-red-400 font-medium px-2">
                                            Citizens can toggle between AI-only Audio and this YouTube Stream in the public player.
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-slate-900 rounded-[40px] aspect-video flex items-center justify-center overflow-hidden border border-slate-800 shadow-2xl relative">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10 flex flex-col justify-end p-8">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Live Preview</span>
                                        </div>
                                    </div>
                                    <Youtube size={64} className="text-red-600 opacity-20" />
                                    <p className="text-slate-500 text-xs font-black uppercase tracking-widest mt-4">Stream Ready</p>
                                </div>
                            </div>
                        )}

                        {activeStudioTab === 'VOICE_TRACKER' && (
                            <div className="space-y-6">
                                <div className="bg-slate-900 rounded-[32px] p-8 border border-white/5 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-8 opacity-5 text-emerald-400 pointer-events-none group-hover:scale-110 transition-transform"><Mic2 size={120} /></div>
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h4 className="text-emerald-400 font-black text-xs uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" /> Currently Tracking
                                            </h4>
                                            <h3 className="text-2xl font-black text-white leading-tight">
                                                {queue[currentSlotIndex]?.title || 'No active track'}
                                            </h3>
                                        </div>
                                        <div className="px-4 py-2 bg-white/5 rounded-2xl border border-white/5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            Auto-Transition Active
                                        </div>
                                    </div>
                                    <p className="text-slate-400 text-sm font-medium italic border-l-4 border-emerald-500 pl-6 py-2 leading-relaxed">
                                        "{queue[currentSlotIndex]?.content || 'Broadcast queue is empty. Load AI tracks to begin.'}"
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Layers size={16} /> Upcoming Voice Segments
                                    </label>
                                    <div className="space-y-3">
                                        {queue.slice(currentSlotIndex + 1, currentSlotIndex + 4).map((track, i) => (
                                            <div key={track.id} className="p-5 bg-white border border-slate-100 rounded-3xl flex justify-between items-center group hover:border-indigo-200 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black text-xs">
                                                        #{i+1}
                                                    </div>
                                                    <div>
                                                        <h5 className="font-bold text-slate-800 text-sm">{track.title}</h5>
                                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{track.type}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest group-hover:text-indigo-400 transition-colors">Pending Loop</span>
                                                    <div className="w-2 h-2 bg-slate-200 rounded-full group-hover:bg-indigo-400" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeStudioTab === 'MIXER' && (
                             <div className="space-y-4">
                                {queue.map((item, idx) => (
                                    <div key={item.id} className={`p-6 rounded-[32px] border transition-all flex justify-between items-center group ${currentSlotIndex === idx ? 'bg-indigo-50 border-indigo-200 shadow-sm scale-[1.01]' : 'bg-white border-slate-100 hover:border-indigo-100'}`}>
                                        <div className="flex items-center gap-5 flex-1 min-w-0">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${item.isAI ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                                {item.isAI ? <Cpu size={24} /> : <Newspaper size={24} />}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h4 className="font-bold text-slate-800 text-lg leading-tight truncate">{item.title}</h4>
                                                    {currentSlotIndex === idx && isPlaying && <span className="text-[8px] bg-red-600 text-white px-2 py-0.5 rounded-full font-black uppercase animate-pulse">Live</span>}
                                                </div>
                                                <p className="text-sm text-slate-400 font-medium truncate">{item.content}</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => { setCurrentSlotIndex(idx); if(!isRadioLive) handleStudioToggle(); else { stopSpeech(); runRadioChannel(idx); } }} 
                                            className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm ml-4"
                                        >
                                            <PlayCircle size={24} fill="currentColor" />
                                        </button>
                                    </div>
                                ))}
                             </div>
                        )}

                        {activeStudioTab === 'CONSTITUENCIES' && (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-20">
                                {data.map(seat => (
                                    <button 
                                        key={seat.id} 
                                        onClick={async () => {
                                            setIsSearchingAI(true);
                                            try {
                                                const report = await fetchConstituencyLiveReport(seat);
                                                const newItem: ChannelItem = { id: `seat-rep-${seat.id}-${Date.now()}`, type: 'ConstituencyReport', title: `${seat.name.toUpperCase()} FIELD TRACK`, content: report, timestamp: new Date(), isAI: true };
                                                setQueue(prev => [newItem, ...prev]);
                                                setActiveStudioTab('VOICE_TRACKER');
                                            } catch (e) { alert("Failed to fetch report."); } finally { setIsSearchingAI(false); }
                                        }}
                                        className="p-5 bg-white border border-slate-200 rounded-3xl text-left hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <MapPin size={14} className="text-slate-400 group-hover:text-emerald-500" />
                                            <span className="text-xs font-black uppercase tracking-widest text-slate-600 truncate">{seat.name}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${seat.lastElectionWinner === 'UDF' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{seat.lastElectionWinner}</div>
                                            <Mic2 size={16} className="text-slate-300 group-hover:text-emerald-500" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT PANEL: TELEMETRY & SOUNDBOARD */}
                <div className="lg:col-span-5 bg-white rounded-[48px] border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                    <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-indigo-600 text-white rounded-[24px] flex items-center justify-center shadow-2xl">
                                <Sliders size={28} />
                            </div>
                            <div>
                                <h3 className="font-black text-slate-800 text-lg uppercase tracking-widest">Master Console</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Global Rotation Unit</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-10 space-y-10 flex-1 overflow-y-auto custom-scrollbar">
                        <div className="bg-slate-900 p-8 rounded-[40px] border border-slate-800 shadow-inner">
                            <div className="flex items-center gap-3 mb-6">
                                <Activity className="text-emerald-500" size={18} />
                                <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Station Telemetry</h4>
                            </div>
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-400">Sequential Auto-Play</span>
                                    <span className={`text-sm font-bold ${isPlaying ? 'text-emerald-500' : 'text-slate-600'}`}>{isPlaying ? 'ACTIVE' : 'IDLE'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-400">Voice Tracking Level</span>
                                    <span className="text-sm font-bold text-indigo-400">100%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-400">Rotation Stats</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold text-emerald-500">{currentSlotIndex + 1} / {queue.length}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Megaphone size={16} /> Soundboard / Station IDs
                            </label>
                            <div className="grid grid-cols-1 gap-3">
                                {[
                                    { title: "OFFICIAL STATION ID", phrase: "നിങ്ങൾ കേൾക്കുന്നത് യു.ഡി.എഫ് റേഡിയോ. ഔദ്യോഗിക വാർത്താ കേന്ദ്രം." },
                                    { title: "CAMPAIGN SLOGAN 1", phrase: "യു.ഡി.എഫ് വോട്ട് ചെയ്യൂ, കേരളത്തെ രക്ഷിക്കൂ." },
                                    { title: "VICTORY PROMO", phrase: "കൈ പിടിക്കാം, കരുത്താകാം. വോട്ട് യു.ഡി.എഫിന്." }
                                ].map((item, i) => (
                                    <button 
                                        key={i} 
                                        onClick={() => {
                                            const newItem: ChannelItem = { id: `instant-${Date.now()}`, type: 'StationID', title: item.title, content: item.phrase, timestamp: new Date() };
                                            setQueue(prev => [newItem, ...prev]);
                                        }}
                                        className="p-5 rounded-[28px] text-left border border-slate-100 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 transition-all flex items-center justify-between group"
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">{item.title}</span>
                                            <span className="text-sm font-bold text-slate-700">{item.phrase}</span>
                                        </div>
                                        <Zap size={16} className="text-slate-300 group-hover:text-indigo-600" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes vu {
                    0%, 100% { transform: scaleY(0.1); opacity: 0.3; }
                    50% { transform: scaleY(1.4); opacity: 1; }
                    75% { transform: scaleY(0.7); opacity: 0.8; }
                }
                .animate-vu { animation: vu 0.8s infinite ease-in-out; transform-origin: bottom; }
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default AudioBriefing;

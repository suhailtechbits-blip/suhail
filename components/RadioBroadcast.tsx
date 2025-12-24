
import React, { useState, useEffect } from 'react';
import { 
    Radio, Play, Square, Download, RefreshCw, Loader2, 
    Volume2, Waves, Calendar, Clock, Share2, MessageSquare, 
    Zap, Mic2, FileText, ChevronRight, Activity, Globe,
    ExternalLink, Check, Copy, X
} from 'lucide-react';
import { 
    generateSpeech, stopSpeech, fetchRadioBulletin, 
    fetchSpeechBlob, downloadAudio, formatShareContent 
} from '../services/gemini';
import { EdvinBulletin } from '../types';

const RadioBroadcast: React.FC = () => {
    const [bulletins, setBulletins] = useState<EdvinBulletin[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPlaying, setIsPlaying] = useState<string | null>(null);
    const [isDownloading, setIsDownloading] = useState<string | null>(null);
    const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
    
    // Sharing UI State
    const [sharingBulletin, setSharingBulletin] = useState<EdvinBulletin | null>(null);
    const [copied, setCopied] = useState(false);

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const newBulletin = await fetchRadioBulletin("Latest Kerala UDF 2026 election prep news");
            setBulletins(prev => [newBulletin as EdvinBulletin, ...prev]);
        } catch (e) {
            alert("Generation failed. Check API connectivity.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handlePlay = async (bulletin: EdvinBulletin) => {
        if (isPlaying === bulletin.id) {
            stopSpeech();
            setIsPlaying(null);
            return;
        }
        
        setIsPlaying(bulletin.id);
        try {
            await generateSpeech(bulletin.script, playbackSpeed);
        } finally {
            setIsPlaying(null);
        }
    };

    const handleDownload = async (bulletin: EdvinBulletin) => {
        setIsDownloading(bulletin.id);
        try {
            const blob = await fetchSpeechBlob(bulletin.script);
            downloadAudio(blob, `UDF_Broadcast_${bulletin.id}.wav`);
        } catch (e) {
            alert("Download failed.");
        } finally {
            setIsDownloading(null);
        }
    };

    const getShareUrl = (bid: string) => {
        const baseUrl = window.location.origin + window.location.pathname;
        return `${baseUrl}?mode=radio_public&bid=${bid}`;
    };

    const handleShareClick = (bulletin: EdvinBulletin) => {
        setSharingBulletin(bulletin);
    };

    const handleCopyLink = () => {
        if (!sharingBulletin) return;
        navigator.clipboard.writeText(getShareUrl(sharingBulletin.id));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="h-full flex flex-col gap-8 animate-in fade-in duration-700 bg-slate-50 overflow-hidden">
            
            {/* 🎙️ BROADCAST MASTER HEADER */}
            <div className="bg-slate-900 rounded-[48px] p-8 lg:p-12 text-white relative overflow-hidden shadow-2xl border border-white/5">
                <div className="absolute top-0 right-0 p-24 opacity-5 pointer-events-none">
                    <Radio size={400} />
                </div>
                
                <div className="flex flex-col lg:flex-row justify-between items-center gap-10 relative z-10">
                    <div className="space-y-6 flex-1">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-2 bg-red-600/10 px-5 py-2 rounded-full border border-red-500/20">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400">Satellite Uplink Active</span>
                            </div>
                            <div className="bg-white/5 px-4 py-2 rounded-2xl border border-white/5 flex items-center gap-2">
                                <Globe size={14} className="text-emerald-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Broadcast Grid: Global</span>
                            </div>
                        </div>

                        <h2 className="text-5xl lg:text-7xl font-black italic tracking-tighter uppercase leading-none">
                            UDF <span className="text-emerald-500">VOICE</span>
                        </h2>
                        <p className="text-slate-400 max-w-xl text-lg font-medium leading-relaxed">
                            AI-automated news briefings and tactical audio instructions for ground teams. Verified data grounded by Gemini AI.
                        </p>
                    </div>

                    <div className="flex flex-col items-center gap-6 w-full lg:w-96">
                        <button 
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="w-full h-24 bg-emerald-500 hover:bg-emerald-600 rounded-[32px] flex items-center justify-center gap-4 shadow-[0_20px_40px_rgba(16,185,129,0.3)] transition-all active:scale-95 disabled:opacity-50"
                        >
                            {isGenerating ? <Loader2 size={32} className="animate-spin" /> : <RefreshCw size={32} />}
                            <div className="text-left">
                                <div className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-900 opacity-60">AI Autopilot</div>
                                <div className="text-lg font-black text-white uppercase">Fetch Fresh Bulletin</div>
                            </div>
                        </button>
                        
                        <div className="w-full flex gap-4">
                            <button 
                                onClick={() => setPlaybackSpeed(s => s >= 1.75 ? 1.0 : s + 0.25)}
                                className="flex-1 bg-white/5 hover:bg-white/10 p-4 rounded-2xl border border-white/10 flex flex-col items-center justify-center gap-1 transition-all"
                            >
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Speed</span>
                                <span className="text-sm font-bold text-white">{playbackSpeed}x</span>
                            </button>
                            <button className="flex-1 bg-white/5 hover:bg-white/10 p-4 rounded-2xl border border-white/10 flex flex-col items-center justify-center gap-1 transition-all">
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Quality</span>
                                <span className="text-sm font-bold text-emerald-400">HD-PCM</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0">
                
                {/* LEFT: BULLETIN ARCHIVE */}
                <div className="lg:col-span-8 bg-white rounded-[48px] border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                    <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
                                <Volume2 size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Today's Audio Briefings</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Automated News Feed</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm">
                            <Activity size={14} className="text-emerald-500" />
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{bulletins.length} Active Tracks</span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                        {bulletins.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4 opacity-50">
                                <Mic2 size={64} />
                                <p className="font-bold uppercase tracking-widest text-sm">No Bulletins Generated for Today</p>
                            </div>
                        ) : (
                            bulletins.map(bulletin => (
                                <div key={bulletin.id} className={`p-8 rounded-[40px] border transition-all flex flex-col md:flex-row gap-8 group ${isPlaying === bulletin.id ? 'bg-indigo-50 border-indigo-200 shadow-lg scale-[1.01]' : 'bg-white border-slate-100 hover:border-indigo-100'}`}>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="text-[10px] font-black text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full uppercase tracking-widest">{bulletin.category}</div>
                                            <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 uppercase">
                                                <Clock size={12} /> {bulletin.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                        <h4 className="text-2xl font-black text-slate-900 mb-4 leading-tight">{bulletin.title}</h4>
                                        <p className="text-sm text-slate-600 font-medium leading-relaxed italic border-l-4 border-slate-100 pl-6 mb-6 line-clamp-3">
                                            "{bulletin.script}"
                                        </p>
                                        <div className="flex items-center gap-6">
                                            <div className="flex items-center gap-2">
                                                <Waves size={16} className="text-indigo-400" />
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration: {bulletin.duration_est}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Zap size={16} className="text-amber-400" />
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verified by AI</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-row md:flex-col gap-3 justify-center">
                                        <button 
                                            onClick={() => handlePlay(bulletin)}
                                            className={`w-16 h-16 rounded-[24px] flex items-center justify-center transition-all shadow-xl active:scale-90 ${isPlaying === bulletin.id ? 'bg-red-600 text-white animate-pulse' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                                        >
                                            {isPlaying === bulletin.id ? <Square fill="currentColor" size={24} /> : <Play fill="currentColor" size={24} className="ml-1" />}
                                        </button>
                                        <button 
                                            onClick={() => handleShareClick(bulletin)}
                                            className="w-16 h-16 bg-white border border-slate-200 text-indigo-600 rounded-[24px] flex items-center justify-center hover:bg-indigo-50 transition-all active:scale-90 shadow-sm"
                                            title="Publish to Web"
                                        >
                                            <Share2 size={24} />
                                        </button>
                                        <button 
                                            onClick={() => handleDownload(bulletin)}
                                            disabled={isDownloading === bulletin.id}
                                            className="w-16 h-16 bg-slate-100 text-slate-600 rounded-[24px] flex items-center justify-center hover:bg-slate-200 transition-all active:scale-90 border border-slate-200"
                                            title="Download Clip"
                                        >
                                            {isDownloading === bulletin.id ? <Loader2 className="animate-spin" size={24} /> : <Download size={24} />}
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* RIGHT: LIVE TELEMETRY & TOOLS */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-slate-900 p-10 rounded-[48px] text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none"><Zap size={200} /></div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-8 flex items-center gap-2">
                             <Activity size={14} /> Station Performance
                        </h3>
                        <div className="space-y-8 relative z-10">
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ground Reach</span>
                                    <span className="text-xs font-black text-emerald-400">88.4%</span>
                                </div>
                                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                                    <div className="bg-emerald-500 h-full w-[88%] rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-indigo-600 p-8 rounded-[40px] text-white shadow-xl shadow-indigo-100 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <h4 className="text-xl font-black mb-2 flex items-center gap-2 italic uppercase">
                            <Globe size={20} /> Deep Link Hub
                        </h4>
                        <p className="text-indigo-100 text-[10px] font-bold leading-relaxed uppercase tracking-wider mb-6">
                            Smart links will open the UDF Grid app on mobile or fallback to the professional landing page on desktop.
                        </p>
                        <button className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-50 transition-colors shadow-lg">
                            Configure Fallbacks
                        </button>
                    </div>
                </div>
            </div>

            {/* PUBLISH MODAL */}
            {sharingBulletin && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in">
                    <div className="bg-white rounded-[48px] shadow-2xl w-full max-w-xl overflow-hidden border border-white/20 relative">
                        <button onClick={() => setSharingBulletin(null)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 p-2"><X size={24}/></button>
                        
                        <div className="p-12">
                            <div className="flex items-center gap-6 mb-10">
                                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                                    <Globe size={32} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Publish to Web</h3>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Generating Smart Deep-Link</p>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100">
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Social Preview Preview</div>
                                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                                        <div className="aspect-video bg-slate-900 flex items-center justify-center relative">
                                            <Radio size={48} className="text-emerald-500 opacity-20" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                 <div className="bg-red-600 text-white px-3 py-1 rounded text-[8px] font-black uppercase tracking-widest animate-pulse">Live AI Audio</div>
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <div className="text-xs font-black text-slate-900 mb-1">{sharingBulletin.title}</div>
                                            <div className="text-[10px] text-slate-500 line-clamp-2">Listen to the latest official UDF broadcast verified by Gemini AI.</div>
                                            <div className="text-[8px] font-bold text-indigo-600 mt-2">UDF-RADIO.ORG</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <div className="flex-1 bg-slate-100 px-6 py-4 rounded-2xl border border-slate-200 text-xs font-mono text-slate-600 truncate">
                                        {getShareUrl(sharingBulletin.id)}
                                    </div>
                                    <button 
                                        onClick={handleCopyLink}
                                        className={`px-8 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${copied ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white'}`}
                                    >
                                        {copied ? <Check size={16}/> : <Copy size={16}/>}
                                    </button>
                                </div>

                                <button 
                                    onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent("Listen to this UDF Update: " + getShareUrl(sharingBulletin.id))}`, '_blank')}
                                    className="w-full bg-[#25D366] text-white py-5 rounded-[24px] font-black text-lg hover:opacity-90 transition-all flex items-center justify-center gap-4 shadow-xl shadow-emerald-100"
                                >
                                    <MessageSquare size={24} /> Broadcast to WhatsApp
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default RadioBroadcast;

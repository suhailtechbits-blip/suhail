
import React, { useState, useEffect, useRef } from 'react';
import { 
    Radio, Play, Square, Globe, MessageSquare, RefreshCw, 
    Loader2, ShieldAlert, Key, Volume2, Share2, Copy, 
    Check, FastForward, Waves, Youtube, Video, Tv,
    Heart, Users, Info, ChevronRight, ExternalLink, Zap, Activity
} from 'lucide-react';
import { generateSpeech, stopSpeech, fetchAIGroundedNews, ensureAudioContext } from '../services/gemini';

const PublicRadioPlayer: React.FC = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [newsQueue, setNewsQueue] = useState<string[]>([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [speed, setSpeed] = useState(1.0);
    const [copied, setCopied] = useState(false);
    const [likes, setLikes] = useState(1240);
    
    // Video Mode State
    const [showVideo, setShowVideo] = useState(false);
    const [ytUrl, setYtUrl] = useState(localStorage.getItem('udf_radio_yt') || '');

    const isPlayingRef = useRef(false);
    const speedRef = useRef(1.0);
    const newsRef = useRef<string[]>([]);

    useEffect(() => { speedRef.current = speed; }, [speed]);
    useEffect(() => { newsRef.current = newsQueue; }, [newsQueue]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const bulletinId = params.get('bid');
        loadNews(bulletinId);
    }, []);

    const loadNews = async (bid: string | null) => {
        setIsLoading(true);
        setError(null);
        try {
            // If there's a bid, we simulate fetching that specific one first
            const primaryNews = bid 
                ? await fetchAIGroundedNews(`UDF Election Update for Bulletin ${bid}`)
                : await fetchAIGroundedNews("Kerala Election 2026 UDF news headlines");
            
            const news2 = await fetchAIGroundedNews("Latest Kerala UDF development projects for common man");
            const news3 = await fetchAIGroundedNews("UDF Digital Campaign 2026 update Kerala");
            setNewsQueue([primaryNews, news2, news3]);
        } catch (e: any) {
            if (e.message === "QUOTA_EXHAUSTED") setError("QUOTA");
        } finally {
            setIsLoading(false);
        }
    };

    const getCleanLink = () => {
        try {
            const baseUrl = window.location.origin + window.location.pathname;
            const url = new URL(baseUrl);
            url.searchParams.set('mode', 'radio_public');
            return url.toString();
        } catch (e) {
            return window.location.href.split('?')[0] + "?mode=radio_public";
        }
    };

    const runPlaybackLoop = async (startIndex: number) => {
        let index = startIndex;
        isPlayingRef.current = true;
        setIsPlaying(true);
        setIsConnecting(false);
        
        while (isPlayingRef.current) {
            const text = newsRef.current[index];
            if (!text) {
                await new Promise(r => setTimeout(r, 2000));
                index = 0;
                continue;
            }
            
            setCurrentIdx(index);
            
            try {
                await ensureAudioContext();
                await generateSpeech(text, speedRef.current);
            } catch (e) {
                console.error("Public Player Error:", e);
                await new Promise(r => setTimeout(r, 1000));
            }

            index = (index + 1) % newsRef.current.length;
            if (!isPlayingRef.current) break;
        }
        
        setIsPlaying(false);
    };

    const handlePlay = async () => {
        if (isPlaying) {
            isPlayingRef.current = false;
            stopSpeech();
            setIsPlaying(false);
        } else {
            setIsConnecting(true);
            runPlaybackLoop(currentIdx);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(getCleanLink());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getEmbedUrl = (url: string) => {
        if (url.includes('v=')) return url.split('v=')[1].split('&')[0];
        if (url.includes('live/')) return url.split('live/')[1].split('?')[0];
        if (url.includes('youtu.be/')) return url.split('youtu.be/')[1].split('?')[0];
        return url;
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-emerald-500/30 overflow-x-hidden">
            {/* Dynamic Background Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] bg-emerald-600/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-5%] right-[-5%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse delay-1000" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03] rotate-12 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
            </div>

            {/* Navigation / Brand Header */}
            <nav className="relative z-50 p-6 lg:p-8 flex justify-between items-center max-w-7xl mx-auto">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-900/40 border border-white/10">
                        <Radio size={24} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tighter uppercase italic leading-none">UDF <span className="text-emerald-500">RADIO</span></h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">State Network</p>
                    </div>
                </div>
                <div className="hidden md:flex items-center gap-8">
                    {['News', 'Manifesto', 'Leaders', 'Contact'].map(item => (
                        <a key={item} href="#" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-emerald-400 transition-colors">{item}</a>
                    ))}
                    <button onClick={handleCopy} className="bg-white/5 border border-white/10 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2">
                        {copied ? <Check size={14} className="text-emerald-400"/> : <Share2 size={14} />}
                        {copied ? 'Link Copied' : 'Share Station'}
                    </button>
                </div>
            </nav>

            {/* Main Hero Stage */}
            <main className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pt-10 pb-32 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                
                {/* Stage Left: Player & Visuals */}
                <div className="lg:col-span-6 flex flex-col items-center">
                    <div className="w-full max-w-md relative group">
                        {/* The Glass Disc */}
                        <div className={`absolute inset-0 bg-gradient-to-tr from-emerald-500 to-indigo-600 blur-[60px] opacity-20 transition-all duration-1000 ${isPlaying ? 'scale-110 opacity-30' : 'scale-90 opacity-10'}`} />
                        
                        <div className="relative bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[80px] p-8 lg:p-12 shadow-2xl flex flex-col items-center overflow-hidden">
                            {/* Live Badge */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-2">
                                <div className={`px-8 py-2.5 rounded-full border-4 border-slate-950 flex items-center gap-3 shadow-2xl transition-colors ${isPlaying ? 'bg-red-600' : 'bg-slate-800'}`}>
                                    <div className={`w-2 h-2 rounded-full bg-white ${isPlaying ? 'animate-ping' : ''}`} />
                                    <span className="text-[11px] font-black uppercase tracking-widest text-white">{isPlaying ? 'LIVE ON AIR' : 'SYNC READY'}</span>
                                </div>
                            </div>

                            {/* Content Display */}
                            <div className="min-h-[260px] w-full flex flex-col items-center justify-center text-center py-10">
                                {isLoading ? (
                                    <div className="flex flex-col items-center gap-4 animate-pulse">
                                        <Loader2 size={48} className="text-emerald-500 animate-spin" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Connecting Satellite Uplink...</p>
                                    </div>
                                ) : showVideo && ytUrl ? (
                                    <div className="w-full aspect-video rounded-[40px] overflow-hidden border border-white/10 shadow-2xl animate-in zoom-in duration-500">
                                        <iframe 
                                            className="w-full h-full"
                                            src={`https://www.youtube.com/embed/${getEmbedUrl(ytUrl)}?autoplay=1&mute=0`}
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-6 w-full px-4">
                                        <p className="text-2xl lg:text-3xl font-bold leading-tight text-white animate-in fade-in slide-in-from-bottom-4">
                                            {newsQueue[currentIdx] || "Establishing connection to the master desk..."}
                                        </p>
                                        <div className="flex items-center justify-center gap-4">
                                            <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                                                <Users size={12} className="text-indigo-400" />
                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">1.2K LISTENING</span>
                                            </div>
                                            <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                                                <Zap size={12} className="text-emerald-400" />
                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">HD PCM 24BIT</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Reactive Waveform */}
                            {isPlaying && !showVideo && (
                                <div className="flex items-end justify-center gap-1.5 h-16 w-full mb-10 overflow-hidden px-8">
                                    {[...Array(50)].map((_, i) => (
                                        <div 
                                            key={i} 
                                            className="w-1.5 bg-emerald-500 rounded-full animate-waveform" 
                                            style={{ 
                                                height: `${10 + Math.random() * 90}%`, 
                                                animationDelay: `${i * 0.04}s`,
                                                opacity: 0.2 + (Math.random() * 0.8)
                                            }} 
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Action Control */}
                            <div className="flex flex-col items-center gap-8 w-full">
                                {!showVideo && (
                                    <button 
                                        onClick={handlePlay}
                                        disabled={isLoading || error === "QUOTA"}
                                        className={`group/play w-40 h-40 rounded-full border-[14px] transition-all duration-700 flex items-center justify-center shadow-[0_40px_100px_rgba(0,0,0,0.7)] active:scale-95 relative z-10 
                                            ${isPlaying ? 'bg-white text-red-600 border-red-600/20' : 'bg-emerald-600 text-white border-emerald-500/20 hover:scale-105 hover:bg-emerald-500'} 
                                            ${isConnecting ? 'opacity-50' : ''}`}
                                    >
                                        <div className="absolute inset-0 rounded-full bg-current opacity-0 group-hover/play:opacity-5 transition-opacity" />
                                        {isConnecting ? <RefreshCw className="animate-spin" size={48} /> : (isPlaying ? <Square size={48} fill="currentColor" /> : <Play size={48} fill="currentColor" className="ml-4" />)}
                                    </button>
                                )}

                                <div className="flex items-center gap-10">
                                    <button 
                                        onClick={() => { if(isPlaying) handlePlay(); setShowVideo(!showVideo); }}
                                        className={`flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:text-emerald-400 ${showVideo ? 'text-red-500' : 'text-slate-500'}`}
                                    >
                                        {showVideo ? <Radio size={18} /> : <Youtube size={18} />}
                                        {showVideo ? 'LISTEN AUDIO' : 'WATCH LIVE'}
                                    </button>
                                    
                                    <div className="h-4 w-px bg-white/10" />

                                    <button onClick={() => setSpeed(s => s >= 2.0 ? 1.0 : s + 0.25)} className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-emerald-400 transition-colors">
                                        SPEED: {speed}x
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stage Right: Copy & Context */}
                <div className="lg:col-span-6 space-y-12 text-left">
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 bg-emerald-500/10 w-fit px-5 py-2 rounded-2xl border border-emerald-500/20">
                            <Activity size={18} className="text-emerald-400" />
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">BROADCASTING TO 140 CONSTITUENCIES</span>
                        </div>
                        <h2 className="text-5xl lg:text-7xl font-black italic tracking-tighter uppercase leading-[0.9]">
                            KERALA'S <br />
                            <span className="text-emerald-500">TRUTH</span> NETWORK
                        </h2>
                        <p className="text-lg text-slate-400 font-medium leading-relaxed max-w-xl">
                            UDF Radio leverages advanced Google Gemini AI to bring you grounded, verified news in real-time. Direct from the state war room to your device.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white/5 p-6 rounded-[32px] border border-white/5 hover:bg-white/10 transition-all group">
                            <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
                                <Users size={20} />
                            </div>
                            <h4 className="font-bold text-white mb-1">Citizen Verified</h4>
                            <p className="text-xs text-slate-500 leading-relaxed font-medium">Crowdsourced fact-checks and local insights integrated into our daily news cycle.</p>
                        </div>
                        <div className="bg-white/5 p-6 rounded-[32px] border border-white/5 hover:bg-white/10 transition-all group">
                            <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                                <ShieldAlert size={20} />
                            </div>
                            <h4 className="font-bold text-white mb-1">Zero Rumors</h4>
                            <p className="text-xs text-slate-500 leading-relaxed font-medium">Automatic detection of political misinformation powered by deep search grounding.</p>
                        </div>
                    </div>

                    <div className="pt-8 flex flex-col sm:flex-row items-center gap-6">
                        <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent("Listen to UDF Radio Live: " + getCleanLink())}`, '_blank')} className="w-full sm:w-auto px-10 py-5 bg-[#25D366] text-white rounded-[24px] font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-950/40 flex items-center justify-center gap-4 hover:scale-105 transition-all">
                            <MessageSquare size={20} /> SEND TO WHATSAPP
                        </button>
                        <button onClick={() => setLikes(l => l + 1)} className="w-full sm:w-auto px-10 py-5 bg-white/5 border border-white/10 text-white rounded-[24px] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-white/10 transition-all">
                            <Heart size={20} className="text-red-500" /> {likes.toLocaleString()} HEARTS
                        </button>
                    </div>
                </div>
            </main>

            {/* Footer / Schedule Ticker */}
            <footer className="fixed bottom-0 left-0 w-full bg-slate-950/80 backdrop-blur-xl border-t border-white/5 py-5 z-50 overflow-hidden">
                <div className="flex animate-marquee whitespace-nowrap items-center gap-20 px-10">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center gap-6">
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                                NEXT BROADCAST: 4:00 PM - DISTRICT ANALYSIS
                            </span>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">•</span>
                            <span className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                                <Activity size={14} className="text-indigo-500" />
                                TRENDING: TRIVANDRUM NORTH (+5% SWING)
                            </span>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">•</span>
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                                #UDFRADIO2026 #KERALAELECTION
                            </span>
                        </div>
                    ))}
                </div>
            </footer>

            <style>{`
                @keyframes waveform {
                    0%, 100% { transform: scaleY(0.5); }
                    50% { transform: scaleY(1.5); }
                }
                .animate-waveform { animation: waveform 0.8s infinite ease-in-out; transform-origin: bottom; }
                
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee { animation: marquee 30s linear infinite; }
            `}</style>
        </div>
    );
};

export default PublicRadioPlayer;

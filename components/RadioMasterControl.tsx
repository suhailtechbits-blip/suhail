
import React, { useState, useEffect } from 'react';
import { 
    Play, Square, Volume2, VolumeX, Music, Mic, 
    Settings2, Zap, Radio, FastForward, SkipBack, 
    Bell, Megaphone, Users, Hand, Hammer, Flower,
    Sliders, Waves, Share2, Info
} from 'lucide-react';
import { generateSpeech, stopSpeech } from '../services/gemini';

const RadioMasterControl: React.FC = () => {
    const [isLive, setIsLive] = useState(false);
    const [voiceVol, setVoiceVol] = useState(80);
    const [bgVol, setBgVol] = useState(30);
    const [isTalkover, setIsTalkover] = useState(true);
    const [activeLoop, setActiveLoop] = useState('News Desk');
    const [isVoiceActive, setIsVoiceActive] = useState(false);

    // Simulated "Ducking" Effect
    useEffect(() => {
        if (isTalkover && isVoiceActive) {
            // Drop bg volume when voice is on
            const originalVol = bgVol;
            const timer = setTimeout(() => {}, 100); 
            return () => clearTimeout(timer);
        }
    }, [isVoiceActive, isTalkover]);

    const handleQuickSpeech = async (text: string) => {
        setIsVoiceActive(true);
        try {
            await generateSpeech(text);
        } finally {
            setIsVoiceActive(false);
        }
    };

    const loops = [
        { name: 'News Desk', mood: 'Professional' },
        { name: 'Rally Bass', mood: 'Energetic' },
        { name: 'Village Folk', mood: 'Local' },
        { name: 'Victory Theme', mood: 'Epic' }
    ];

    const soundboard = [
        { id: 'jingle', icon: <Megaphone size={20}/>, label: 'UDF Jingle', color: 'bg-emerald-600' },
        { id: 'applause', icon: <Users size={20}/>, label: 'Applause', color: 'bg-indigo-600' },
        { id: 'slogan', icon: <Hand size={20}/>, label: 'Vote Hand', color: 'bg-blue-600' },
        { id: 'horn', icon: <Bell size={20}/>, label: 'Rally Horn', color: 'bg-amber-600' }
    ];

    return (
        <div className="h-full flex flex-col gap-6 animate-in fade-in duration-500 bg-slate-50">
            
            {/* Studio Header */}
            <div className="bg-slate-900 rounded-[40px] p-8 lg:p-10 text-white relative overflow-hidden shadow-2xl border border-white/5">
                <div className="absolute -top-10 -right-10 opacity-5 pointer-events-none">
                    <Radio size={300} />
                </div>
                <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
                    <div className="flex items-center gap-6">
                        <div className={`w-20 h-20 rounded-[28px] flex items-center justify-center shadow-2xl transition-all duration-700 ${isLive ? 'bg-red-600 animate-pulse scale-110' : 'bg-slate-800'}`}>
                            <Radio size={40} />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h2 className="text-3xl font-black italic uppercase tracking-tighter">Radio <span className="text-emerald-500">Master</span></h2>
                                {isLive && <span className="bg-red-600 text-[10px] font-black px-2 py-0.5 rounded-md animate-pulse">LIVE</span>}
                            </div>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em]">റേഡിയോ മാസ്റ്റർ കൺട്രോൾ</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => { if(isLive) stopSpeech(); setIsLive(!isLive); }}
                            className={`w-48 h-16 rounded-3xl flex items-center justify-center gap-3 font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-2xl ${isLive ? 'bg-white text-red-600' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                        >
                            {isLive ? <><Square fill="currentColor" size={20}/> STOP STUDIO</> : <><Play fill="currentColor" size={20}/> START STUDIO</>}
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0">
                
                {/* MIXING CONSOLE */}
                <div className="lg:col-span-4 bg-white rounded-[40px] border border-slate-200 shadow-sm p-8 flex flex-col overflow-hidden">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                        <Sliders size={16} /> Console Faders
                    </h3>

                    <div className="flex-1 flex justify-around items-end gap-4 px-4 pb-8">
                        {/* Voice Fader */}
                        <div className="flex flex-col items-center gap-4 h-full">
                            <div className="flex-1 w-12 bg-slate-100 rounded-full relative overflow-hidden flex flex-col justify-end border border-slate-200 shadow-inner">
                                <div 
                                    className="bg-emerald-500 w-full transition-all duration-300 rounded-t-xl shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                                    style={{ height: `${voiceVol}%` }}
                                />
                                <input 
                                    type="range" min="0" max="100" value={voiceVol} 
                                    onChange={(e) => setVoiceVol(parseInt(e.target.value))}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer -rotate-180"
                                    style={{ writingMode: 'bt-lr' } as any}
                                />
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <Mic size={18} className={isVoiceActive ? 'text-emerald-500' : 'text-slate-300'} />
                                <span className="text-[10px] font-black text-slate-500 uppercase">Voice</span>
                            </div>
                        </div>

                        {/* BG Fader */}
                        <div className="flex flex-col items-center gap-4 h-full">
                            <div className="flex-1 w-12 bg-slate-100 rounded-full relative overflow-hidden flex flex-col justify-end border border-slate-200 shadow-inner">
                                <div 
                                    className="bg-indigo-500 w-full transition-all duration-300 rounded-t-xl"
                                    style={{ height: `${bgVol}%` }}
                                />
                                <input 
                                    type="range" min="0" max="100" value={bgVol} 
                                    onChange={(e) => setBgVol(parseInt(e.target.value))}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <Music size={18} className="text-slate-300" />
                                <span className="text-[10px] font-black text-slate-500 uppercase">Music</span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-50 space-y-4">
                        <button 
                            onClick={() => setIsTalkover(!isTalkover)}
                            className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-between px-6 transition-all ${isTalkover ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}
                        >
                            <span>Auto-Ducking (Talkover)</span>
                            <div className={`w-8 h-4 rounded-full relative border ${isTalkover ? 'bg-indigo-400 border-white' : 'bg-slate-300 border-slate-400'}`}>
                                <div className={`absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white transition-all ${isTalkover ? 'right-0.5' : 'left-0.5'}`} />
                            </div>
                        </button>
                    </div>
                </div>

                {/* SOUNDBOARD & PRESETS */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    
                    {/* Presets Row */}
                    <div className="bg-white rounded-[32px] p-6 border border-slate-200 shadow-sm flex items-center gap-4 overflow-x-auto no-scrollbar">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0 border-r border-slate-100 pr-4 mr-2">Preset Modes</span>
                        {loops.map(loop => (
                            <button 
                                key={loop.name}
                                onClick={() => setActiveLoop(loop.name)}
                                className={`px-6 py-3 rounded-2xl whitespace-nowrap text-xs font-bold transition-all border ${activeLoop === loop.name ? 'bg-slate-900 text-white border-slate-900 shadow-lg scale-105' : 'bg-white text-slate-600 border-slate-100 hover:border-indigo-300'}`}
                            >
                                {loop.name}
                                <span className="block text-[8px] opacity-50 uppercase tracking-tighter mt-0.5">{loop.mood}</span>
                            </button>
                        ))}
                    </div>

                    {/* Main Soundboard Grid */}
                    <div className="flex-1 bg-white rounded-[40px] border border-slate-200 shadow-sm p-8">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                            <Zap size={16} className="text-amber-500" /> Instant Soundboard
                        </h3>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {soundboard.map(pad => (
                                <button 
                                    key={pad.id}
                                    className={`aspect-square rounded-[32px] flex flex-col items-center justify-center gap-3 transition-all active:scale-90 active:opacity-50 shadow-xl border-4 border-white ${pad.color} text-white group`}
                                >
                                    <div className="group-hover:scale-125 transition-transform">{pad.icon}</div>
                                    <span className="text-[10px] font-black uppercase tracking-widest">{pad.label}</span>
                                </button>
                            ))}
                        </div>

                        <div className="mt-12 space-y-6">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Mic size={16} className="text-indigo-600" /> Instant Campaign Voice
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    "നിങ്ങൾ കേൾക്കുന്നത് എഡ്വിൻ റേഡിയോ.",
                                    "കൈ പിടിക്കാം, കരുത്താകാം. വോട്ട് യു.ഡി.എഫിന്.",
                                    "മണ്ഡലങ്ങളിൽ യു.ഡി.എഫ് തരംഗം തുടരുന്നു.",
                                    "നാടിന്റെ നന്മയ്ക്കായി യു.ഡി.എഫ് വോട്ട് ചെയ്യൂ."
                                ].map((phrase, i) => (
                                    <button 
                                        key={i}
                                        onClick={() => handleQuickSpeech(phrase)}
                                        className="p-5 bg-slate-50 hover:bg-indigo-50 border border-slate-100 rounded-3xl text-left text-xs font-bold text-slate-700 flex items-center justify-between group transition-all"
                                    >
                                        <span className="line-clamp-1">{phrase}</span>
                                        <Volume2 size={16} className="text-slate-300 group-hover:text-indigo-600 shrink-0" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Visualizer Footer */}
                    <div className="bg-slate-900 rounded-[32px] p-6 flex items-center gap-6 overflow-hidden relative border border-white/5">
                        <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
                             <Waves size={200} className="text-white animate-pulse" />
                        </div>
                        <div className="flex items-end gap-1 h-12 flex-1">
                            {[...Array(40)].map((_, i) => (
                                <div 
                                    key={i} 
                                    className={`w-1 bg-emerald-400 rounded-full transition-all duration-300 ${isLive ? 'animate-bounce' : 'h-1 opacity-20'}`}
                                    style={{ 
                                        height: isLive ? `${Math.random() * 100}%` : '4px',
                                        animationDelay: `${i * 0.05}s`
                                    }}
                                />
                            ))}
                        </div>
                        <div className="text-right shrink-0">
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Active Output</div>
                            <div className="text-xs font-bold text-white flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" /> Studio Mix Main
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};

export default RadioMasterControl;

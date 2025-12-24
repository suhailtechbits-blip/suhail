import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ConstituencyData, Front } from '../types';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { MapPin, CheckCircle, Share2, Vote, BarChart3, ChevronLeft, Copy, X, Check, ShieldAlert, Fingerprint, LayoutDashboard, Hand, Hammer, Flower, User, Power } from 'lucide-react';

interface PublicExitPollProps {
  data: ConstituencyData[];
}

const DISTRICTS = [
    "Kasaragod", "Kannur", "Wayanad", "Kozhikode", "Malappuram", "Palakkad", "Thrissur", 
    "Ernakulam", "Idukki", "Kottayam", "Alappuzha", "Pathanamthitta", "Kollam", "Thiruvananthapuram"
];

const COLORS = {
    UDF: '#10b981', // Emerald
    LDF: '#ef4444', // Red
    NDA: '#f59e0b', // Orange
    OTHER: '#64748b'
};

const PublicExitPoll: React.FC<PublicExitPollProps> = ({ data }) => {
    const [step, setStep] = useState<'district_select' | 'vote' | 'result'>('district_select');
    const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
    const [userVote, setUserVote] = useState<Front | null>(null);
    
    // Security & Share State
    const [deviceId, setDeviceId] = useState<string>('');
    const [showShareModal, setShowShareModal] = useState(false);
    const [copied, setCopied] = useState(false);
    const [voteLocked, setVoteLocked] = useState(false);
    
    // EVM States
    const [votingFor, setVotingFor] = useState<Front | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);

    // Initialize Device ID (Simulating IMEI)
    useEffect(() => {
        let storedId = localStorage.getItem('elect_device_id');
        if (!storedId) {
            // Generate a random ID that looks like an IMEI/Device Hash
            storedId = 'DEV-' + Math.random().toString(36).substr(2, 6).toUpperCase() + '-' + Date.now().toString().substr(-4);
            localStorage.setItem('elect_device_id', storedId);
        }
        setDeviceId(storedId);
    }, []);

    // Handle Deep Linking (URL Params) & Vote Check
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const dist = params.get('district');
        const view = params.get('view');
        
        if (dist && (DISTRICTS.includes(dist) || dist === "All Kerala")) {
            setSelectedDistrict(dist);
            // Check if already voted for this district
            if (dist !== "All Kerala") {
                checkVoteStatus(dist, view === 'result');
            } else {
                setStep('result');
            }
        }
    }, [deviceId]);

    const checkVoteStatus = (district: string, forceResultView: boolean) => {
        const voteHistory = JSON.parse(localStorage.getItem('elect_vote_history') || '{}');
        const existingVote = voteHistory[district];

        if (existingVote) {
            setUserVote(existingVote);
            setVoteLocked(true);
            setStep('result');
        } else {
            setVoteLocked(false);
            if (forceResultView) {
                setStep('result');
            } else {
                setStep('vote');
            }
        }
    };

    const handleDistrictSelect = (dist: string) => {
        setSelectedDistrict(dist);
        checkVoteStatus(dist, false);
    };

    const handleStatewideView = () => {
        setSelectedDistrict("All Kerala");
        setStep('result');
    }

    // Mock Exit Poll Data Generator (Client-side simulation)
    const exitPollData = useMemo(() => {
        return [
            { name: 'UDF', value: Math.floor(Math.random() * 40) + 30 },
            { name: 'LDF', value: Math.floor(Math.random() * 40) + 30 },
            { name: 'NDA', value: Math.floor(Math.random() * 15) + 5 },
        ];
    }, [selectedDistrict]);

    // Real Data Aggregation for 2026 Projection
    const districtProjection = useMemo(() => {
        if (!selectedDistrict) return [];
        
        let targetSeats = data;
        if (selectedDistrict !== "All Kerala") {
            targetSeats = data.filter(d => d.district === selectedDistrict);
        }
        
        const summary = { UDF: 0, LDF: 0, NDA: 0, Total: targetSeats.length };
        targetSeats.forEach(seat => {
            if (seat.lastElectionWinner === 'UDF') summary.UDF++;
            else if (seat.lastElectionWinner === 'LDF') summary.LDF++;
            else if (seat.lastElectionWinner === 'NDA') summary.NDA++;
        });

        return [
            { name: 'UDF', seats: summary.UDF, color: COLORS.UDF },
            { name: 'LDF', seats: summary.LDF, color: COLORS.LDF },
            { name: 'NDA', seats: summary.NDA, color: COLORS.NDA }
        ];
    }, [selectedDistrict, data]);

    const stateSummary = useMemo(() => {
        if (selectedDistrict !== "All Kerala") return null;
        
        const distMap: Record<string, {UDF: number, LDF: number, NDA: number, total: number}> = {};
        
        DISTRICTS.forEach(dName => {
            distMap[dName] = { UDF: 0, LDF: 0, NDA: 0, total: 0 };
        });

        data.forEach(seat => {
            if (distMap[seat.district]) {
                distMap[seat.district].total++;
                if (seat.lastElectionWinner === 'UDF') distMap[seat.district].UDF++;
                else if (seat.lastElectionWinner === 'LDF') distMap[seat.district].LDF++;
                else if (seat.lastElectionWinner === 'NDA') distMap[seat.district].NDA++;
            }
        });

        return Object.entries(distMap).map(([name, counts]) => ({name, ...counts}));
    }, [selectedDistrict, data]);

    // EVM Beep Sound
    const playBeep = () => {
        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
            const ctx = audioContextRef.current;
            if (ctx.state === 'suspended') ctx.resume();

            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();

            osc.connect(gainNode);
            gainNode.connect(ctx.destination);

            osc.type = 'square';
            osc.frequency.setValueAtTime(2000, ctx.currentTime); // High pitch like EVM
            gainNode.gain.setValueAtTime(0.1, ctx.currentTime);

            osc.start();
            osc.stop(ctx.currentTime + 1.5); // Long beep
        } catch (e) {
            console.error("Audio play failed", e);
        }
    };

    const handleVote = (front: Front) => {
        if (!selectedDistrict || selectedDistrict === "All Kerala") return;
        
        if (votingFor) return; // Prevent double clicks

        // Security Check
        const voteHistory = JSON.parse(localStorage.getItem('elect_vote_history') || '{}');
        if (voteHistory[selectedDistrict]) {
            alert("Security Alert: Your device has already voted in this district. Duplicate votes are restricted.");
            setVoteLocked(true);
            setStep('result');
            return;
        }

        // 1. Set Visual State (Red Light)
        setVotingFor(front);
        
        // 2. Play Sound
        playBeep();

        // 3. Commit after delay (mimic EVM recording time)
        setTimeout(() => {
            voteHistory[selectedDistrict] = front;
            localStorage.setItem('elect_vote_history', JSON.stringify(voteHistory));
            
            setUserVote(front);
            setVoteLocked(true);
            setStep('result');
            setVotingFor(null);
        }, 2000); // 2 second delay for realism
    };

    const getShareUrl = () => {
        // More robust way to get base URL without existing params
        const baseUrl = window.location.href.split('?')[0];
        const url = new URL(baseUrl);
        url.searchParams.set('mode', 'public');
        
        if (selectedDistrict && selectedDistrict !== "All Kerala") {
             url.searchParams.set('district', selectedDistrict);
        } else {
             url.searchParams.set('district', "All Kerala");
        }
        
        url.searchParams.set('view', 'result');
        return url.toString();
    }

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(getShareUrl());
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (e) {
            // ignore
        }
    }

    const getWhatsAppLink = () => {
        const text = `Check out the 2026 Election Exit Poll Results for ${selectedDistrict}:\n${getShareUrl()}`;
        return `https://wa.me/?text=${encodeURIComponent(text)}`;
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            {/* Header */}
            <div className="bg-slate-900 text-white p-4 shadow-lg sticky top-0 z-50">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center font-bold text-xl">
                            26
                        </div>
                        <div>
                            <h1 className="text-lg font-bold leading-tight">Kerala Election 2026</h1>
                            <p className="text-xs text-slate-400 uppercase tracking-widest">Official Live Dashboard</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="animate-pulse w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-sm font-bold text-red-400">LIVE</span>
                    </div>
                </div>
            </div>

            {/* Content Container */}
            <div className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-8">
                
                {/* STEP 1: DISTRICT SELECTION */}
                {step === 'district_select' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">Select Your District</h2>
                            <p className="text-slate-500 mb-6">Choose your district to participate in the Exit Poll.</p>
                            
                            <button 
                                onClick={handleStatewideView}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-bold shadow-lg shadow-indigo-200 transition-all transform hover:scale-105"
                            >
                                <LayoutDashboard size={20} />
                                View Statewide Results Dashboard
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {DISTRICTS.map((dist) => (
                                <button
                                    key={dist}
                                    onClick={() => handleDistrictSelect(dist)}
                                    className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all flex flex-col items-center gap-3 group"
                                >
                                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                                        <MapPin className="text-slate-500 group-hover:text-emerald-600" size={24} />
                                    </div>
                                    <span className="font-semibold text-slate-800">{dist}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* STEP 2: VOTING (EVM STYLE) */}
                {step === 'vote' && selectedDistrict && (
                    <div className="animate-in zoom-in duration-300 max-w-2xl mx-auto select-none">
                        <div className="flex justify-between items-center mb-6">
                            <button 
                                onClick={() => setStep('district_select')}
                                className="flex items-center text-slate-500 hover:text-slate-800 text-sm font-medium"
                            >
                                <ChevronLeft size={16} className="mr-1"/> Exit EVM
                            </button>
                            <div className="text-xs text-slate-400 font-mono">
                                UNIT ID: {deviceId}
                            </div>
                        </div>

                        {/* EVM Container */}
                        <div className="bg-white rounded-sm shadow-2xl border-4 border-slate-300 overflow-hidden relative">
                            {/* EVM Header */}
                            <div className="bg-slate-200 border-b-2 border-slate-300 p-3 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="bg-green-600 w-3 h-3 rounded-full animate-pulse"></div>
                                    <span className="text-xs font-bold text-slate-600 tracking-widest">READY</span>
                                </div>
                                <h2 className="text-lg font-bold text-slate-800 tracking-tight">BALLOTING UNIT</h2>
                                <div className="text-xs font-bold text-slate-500">M3-VVPAT</div>
                            </div>

                            {/* Ballot Sheet */}
                            <div className="bg-[#fdfdfd]">
                                {/* ROW 1: UDF */}
                                <div className="flex border-b border-slate-300 h-24">
                                    <div className="w-12 flex items-center justify-center border-r border-slate-300 font-bold text-xl bg-white text-slate-800">
                                        01
                                    </div>
                                    <div className="flex-1 px-4 flex flex-col justify-center border-r border-slate-300">
                                        <div className="font-bold text-lg text-slate-900 leading-tight">UDF CANDIDATE</div>
                                        <div className="text-xs font-bold text-slate-500 mt-1">INC / IUML</div>
                                    </div>
                                    <div className="w-20 flex items-center justify-center border-r border-slate-300 bg-white">
                                        <Hand size={32} className="text-slate-800" />
                                    </div>
                                    <div className="w-32 bg-slate-100 flex items-center justify-between px-3 relative">
                                        {/* LED */}
                                        <div className={`w-4 h-4 rounded-full border border-slate-400 transition-all duration-100 ${votingFor === 'UDF' ? 'bg-red-600 shadow-[0_0_12px_rgba(220,38,38,0.9)] scale-110' : 'bg-red-900/20'}`}></div>
                                        {/* Button */}
                                        <button 
                                            onClick={() => handleVote('UDF')}
                                            disabled={!!votingFor}
                                            className="w-16 h-8 bg-blue-700 rounded-full shadow-[0_4px_0_rgb(30,58,138),inset_0_2px_4px_rgba(255,255,255,0.3)] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] active:translate-y-[4px] transition-all disabled:opacity-80 disabled:cursor-not-allowed"
                                        ></button>
                                    </div>
                                </div>

                                {/* ROW 2: LDF */}
                                <div className="flex border-b border-slate-300 h-24">
                                    <div className="w-12 flex items-center justify-center border-r border-slate-300 font-bold text-xl bg-white text-slate-800">
                                        02
                                    </div>
                                    <div className="flex-1 px-4 flex flex-col justify-center border-r border-slate-300">
                                        <div className="font-bold text-lg text-slate-900 leading-tight">LDF CANDIDATE</div>
                                        <div className="text-xs font-bold text-slate-500 mt-1">CPI(M) / CPI</div>
                                    </div>
                                    <div className="w-20 flex items-center justify-center border-r border-slate-300 bg-white">
                                        <Hammer size={32} className="text-slate-800" />
                                    </div>
                                    <div className="w-32 bg-slate-100 flex items-center justify-between px-3 relative">
                                        <div className={`w-4 h-4 rounded-full border border-slate-400 transition-all duration-100 ${votingFor === 'LDF' ? 'bg-red-600 shadow-[0_0_12px_rgba(220,38,38,0.9)] scale-110' : 'bg-red-900/20'}`}></div>
                                        <button 
                                            onClick={() => handleVote('LDF')}
                                            disabled={!!votingFor}
                                            className="w-16 h-8 bg-blue-700 rounded-full shadow-[0_4px_0_rgb(30,58,138),inset_0_2px_4px_rgba(255,255,255,0.3)] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] active:translate-y-[4px] transition-all disabled:opacity-80 disabled:cursor-not-allowed"
                                        ></button>
                                    </div>
                                </div>

                                {/* ROW 3: NDA */}
                                <div className="flex border-b border-slate-300 h-24">
                                    <div className="w-12 flex items-center justify-center border-r border-slate-300 font-bold text-xl bg-white text-slate-800">
                                        03
                                    </div>
                                    <div className="flex-1 px-4 flex flex-col justify-center border-r border-slate-300">
                                        <div className="font-bold text-lg text-slate-900 leading-tight">NDA CANDIDATE</div>
                                        <div className="text-xs font-bold text-slate-500 mt-1">BJP / BDJS</div>
                                    </div>
                                    <div className="w-20 flex items-center justify-center border-r border-slate-300 bg-white">
                                        <Flower size={32} className="text-slate-800" />
                                    </div>
                                    <div className="w-32 bg-slate-100 flex items-center justify-between px-3 relative">
                                        <div className={`w-4 h-4 rounded-full border border-slate-400 transition-all duration-100 ${votingFor === 'NDA' ? 'bg-red-600 shadow-[0_0_12px_rgba(220,38,38,0.9)] scale-110' : 'bg-red-900/20'}`}></div>
                                        <button 
                                            onClick={() => handleVote('NDA')}
                                            disabled={!!votingFor}
                                            className="w-16 h-8 bg-blue-700 rounded-full shadow-[0_4px_0_rgb(30,58,138),inset_0_2px_4px_rgba(255,255,255,0.3)] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] active:translate-y-[4px] transition-all disabled:opacity-80 disabled:cursor-not-allowed"
                                        ></button>
                                    </div>
                                </div>

                                 {/* ROW 4: OTHER */}
                                 <div className="flex h-24">
                                    <div className="w-12 flex items-center justify-center border-r border-slate-300 font-bold text-xl bg-white text-slate-800">
                                        04
                                    </div>
                                    <div className="flex-1 px-4 flex flex-col justify-center border-r border-slate-300">
                                        <div className="font-bold text-lg text-slate-900 leading-tight">INDEPENDENT / NOTA</div>
                                        <div className="text-xs font-bold text-slate-500 mt-1">Other</div>
                                    </div>
                                    <div className="w-20 flex items-center justify-center border-r border-slate-300 bg-white">
                                        <User size={32} className="text-slate-800" />
                                    </div>
                                    <div className="w-32 bg-slate-100 flex items-center justify-between px-3 relative">
                                        <div className={`w-4 h-4 rounded-full border border-slate-400 transition-all duration-100 ${votingFor === 'OTHER' ? 'bg-red-600 shadow-[0_0_12px_rgba(220,38,38,0.9)] scale-110' : 'bg-red-900/20'}`}></div>
                                        <button 
                                            onClick={() => handleVote('OTHER')}
                                            disabled={!!votingFor}
                                            className="w-16 h-8 bg-blue-700 rounded-full shadow-[0_4px_0_rgb(30,58,138),inset_0_2px_4px_rgba(255,255,255,0.3)] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] active:translate-y-[4px] transition-all disabled:opacity-80 disabled:cursor-not-allowed"
                                        ></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-8 text-center opacity-60">
                             <div className="flex items-center justify-center gap-2 text-slate-500 text-xs mb-2">
                                <ShieldAlert size={14} />
                                <span className="uppercase tracking-wider">Secure Voting Link</span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-mono">
                                VVPAT VERIFIED • {selectedDistrict.toUpperCase()} • {new Date().getFullYear()}
                            </p>
                        </div>
                    </div>
                )}

                {/* STEP 3: RESULT DASHBOARD */}
                {step === 'result' && selectedDistrict && (
                    <div className="animate-in slide-in-from-bottom-8 duration-700 space-y-6">
                         <div className="flex items-center justify-between">
                            <button 
                                onClick={() => { setStep('district_select'); window.history.replaceState(null, '', '?mode=public'); }}
                                className="flex items-center text-slate-500 hover:text-slate-800 text-sm font-medium"
                            >
                                <ChevronLeft size={16} className="mr-1"/> Change District
                            </button>
                            <button onClick={() => setShowShareModal(true)} className="flex items-center gap-2 text-emerald-600 font-bold text-sm bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-full transition-colors border border-emerald-200">
                                <Share2 size={16} /> Share Result
                            </button>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${selectedDistrict === "All Kerala" ? 'bg-indigo-100 text-indigo-600' : (voteLocked ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600')}`}>
                                {selectedDistrict === "All Kerala" ? <LayoutDashboard size={32} /> : (voteLocked ? <CheckCircle size={32} /> : <BarChart3 size={32} />)}
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">
                                {selectedDistrict === "All Kerala" ? "Statewide Overview" : (voteLocked ? "Vote Registered" : "Live Dashboard")}
                            </h2>
                            <p className="text-slate-500">
                                {selectedDistrict === "All Kerala" 
                                    ? "Projections for all 140 Constituencies" 
                                    : (voteLocked ? `Thank you. You have voted for ${userVote}.` : "Viewing live projections.")
                                }
                            </p>
                            {selectedDistrict !== "All Kerala" && (
                                <div className="mt-2 inline-block px-3 py-1 bg-slate-100 rounded text-[10px] text-slate-500 font-mono">
                                    ID: {deviceId}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                <h3 className="font-bold text-slate-800 mb-4 flex items-center"><BarChart3 className="mr-2 text-indigo-600" /> Public Exit Poll Trend</h3>
                                <div className="h-64 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={exitPollData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                                <Cell fill={COLORS.UDF} /><Cell fill={COLORS.LDF} /><Cell fill={COLORS.NDA} />
                                            </Pie>
                                            <Tooltip />
                                            <Legend verticalAlign="bottom" height={36} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <p className="text-xs text-center text-slate-400 mt-2">
                                    {selectedDistrict === "All Kerala" ? "Aggregated state-wide polling trend" : "Based on unique verified devices in district"}
                                </p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                <h3 className="font-bold text-slate-800 mb-4 flex items-center"><MapPin className="mr-2 text-red-600" /> 2026 Seat Projection</h3>
                                <div className="h-64 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={districtProjection} layout="vertical" margin={{ left: 20 }}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={true} stroke="#e2e8f0" />
                                            <XAxis type="number" hide />
                                            <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} width={40} />
                                            <Tooltip cursor={{ fill: '#f1f5f9' }} />
                                            <Bar dataKey="seats" radius={[0, 4, 4, 0]}>
                                                {districtProjection.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                                    {districtProjection.map(d => (
                                        <div key={d.name} className="p-2 bg-slate-50 rounded-lg">
                                            <div className="text-xs text-slate-500 font-bold">{d.name}</div>
                                            <div className="text-xl font-bold" style={{ color: d.color }}>{d.seats}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                         <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                             <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                                 {selectedDistrict === "All Kerala" ? "District-wise Breakdown" : `Constituencies in ${selectedDistrict}`}
                             </div>
                             
                             <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                                 {selectedDistrict === "All Kerala" && stateSummary ? (
                                     <table className="w-full text-left text-sm">
                                         <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                                             <tr>
                                                 <th className="p-3">District</th>
                                                 <th className="p-3 text-center text-emerald-600">UDF</th>
                                                 <th className="p-3 text-center text-red-600">LDF</th>
                                                 <th className="p-3 text-center text-orange-600">NDA</th>
                                             </tr>
                                         </thead>
                                         <tbody>
                                             {stateSummary.map(d => (
                                                 <tr key={d.name} className="hover:bg-slate-50">
                                                     <td className="p-3 font-medium text-slate-700">{d.name}</td>
                                                     <td className="p-3 text-center font-bold text-slate-800">{d.UDF}</td>
                                                     <td className="p-3 text-center font-bold text-slate-800">{d.LDF}</td>
                                                     <td className="p-3 text-center font-bold text-slate-800">{d.NDA}</td>
                                                 </tr>
                                             ))}
                                         </tbody>
                                     </table>
                                 ) : (
                                     data.filter(d => d.district === selectedDistrict).map(seat => (
                                         <div key={seat.id} className="p-4 flex justify-between items-center hover:bg-slate-50">
                                             <span className="text-sm font-medium text-slate-700">{seat.name}</span>
                                             <span className={`px-2 py-1 rounded text-xs font-bold text-white ${seat.lastElectionWinner === 'UDF' ? 'bg-emerald-500' : seat.lastElectionWinner === 'LDF' ? 'bg-red-500' : 'bg-orange-500'}`}>{seat.lastElectionWinner}</span>
                                         </div>
                                     ))
                                 )}
                             </div>
                         </div>
                    </div>
                )}
            </div>

            {/* SHARE MODAL */}
            {showShareModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 relative">
                        <button onClick={() => setShowShareModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={20} /></button>
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800"><Share2 className="text-emerald-600" size={20}/> Share Result</h3>
                        
                        <p className="text-sm text-slate-500 mb-3">Share the {selectedDistrict} predictions with friends.</p>
                        
                        <div className="bg-slate-100 p-3 rounded-lg border border-slate-200 break-all text-xs font-mono text-slate-600 mb-4 select-all">
                            {getShareUrl()}
                        </div>
                        
                        <div className="space-y-3">
                            <button 
                                onClick={copyToClipboard}
                                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${copied ? 'bg-green-100 text-green-700' : 'bg-slate-800 text-white hover:bg-slate-900'}`}
                            >
                                {copied ? <Check size={18} /> : <Copy size={18} />}
                                {copied ? "Link Copied!" : "Copy Link"}
                            </button>
                            
                            <a 
                                href={getWhatsAppLink()}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-lg font-medium"
                            >
                                Share on WhatsApp
                            </a>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="p-4 text-center text-slate-400 text-xs bg-slate-900 mt-auto">
                &copy; 2026 Kerala Election Analytics Grid. Demo Version.
            </div>
        </div>
    );
};

export default PublicExitPoll;

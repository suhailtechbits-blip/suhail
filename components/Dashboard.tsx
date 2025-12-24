
import React, { useMemo, useState } from 'react';
import { ConstituencyData, AnalysisResult, ViewState } from '../types';
import { LiveElectionSummary } from '../services/liveResults';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Users, AlertTriangle, Vote, MapPin, Radio, Volume2, Square, Zap, Megaphone, Download, Loader2, ShieldCheck, Key, PlayCircle, ExternalLink, Activity, ArrowRight, Share2, LayoutPanelLeft, Link, UserCheck, Check } from 'lucide-react';
import { generateSpeech, stopSpeech, analyzeElectionData } from '../services/gemini';

interface DashboardProps {
  data: ConstituencyData[];
  liveSummary?: LiveElectionSummary | null;
  setView?: (view: ViewState) => void;
  setAppMode?: (mode: 'admin' | 'user' | 'public' | 'citizen' | 'radio_public' | 'read_only') => void;
  appMode: 'admin' | 'user' | 'public' | 'citizen' | 'radio_public' | 'read_only';
}

const COLORS = {
    UDF: '#10b981',
    LDF: '#ef4444',
    NDA: '#f59e0b',
    OTHER: '#64748b'
};

const Dashboard: React.FC<DashboardProps> = ({ data, liveSummary, setView, setAppMode, appMode }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<'radio' | 'user' | null>(null);
  
  const stats = useMemo(() => {
    const totalVoters = data.reduce((acc, curr) => acc + curr.totalVoters, 0);
    const flagged = data.filter(d => d.status === 'Flagged').length;
    const udfCount = liveSummary ? liveSummary.udf : data.filter(d => d.lastElectionWinner === 'UDF').length;
    const ldfCount = liveSummary ? liveSummary.ldf : data.filter(d => d.lastElectionWinner === 'LDF').length;
    return { totalVoters, flagged, udfCount, ldfCount };
  }, [data, liveSummary]);

  const handleVerifyData = async () => {
    if (appMode !== 'admin') return;
    setIsVerifying(true);
    setError(null);
    try {
        const result = await analyzeElectionData(data);
        setAiAnalysis(result);
    } catch (e: any) {
        if (e.message === "QUOTA_EXHAUSTED") {
            setError("QUOTA");
        } else {
            setError("Analysis failed. Please check your connection.");
        }
    } finally {
        setIsVerifying(false);
    }
  };

  const handleSelectKey = async () => {
    // @ts-ignore
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      await window.aistudio.openSelectKey();
    }
    handleVerifyData();
  };

  const handleBriefingAudio = async () => {
      if (isPlaying) {
          stopSpeech();
          setIsPlaying(false);
          return;
      }
      const text = aiAnalysis?.summary || `യുഡിഎഫ് നിലവിൽ ${stats.udfCount} സീറ്റുകളിൽ മുന്നിലാണ്. തിരഞ്ഞെടുപ്പ് ഒരുക്കങ്ങൾ പൂർത്തിയായി വരുന്നു.`;
      setIsPlaying(true);
      try {
          await generateSpeech(text);
      } catch (e: any) {
          if (e.message === "QUOTA_EXHAUSTED") setError("QUOTA");
      } finally {
          setIsPlaying(false);
      }
  };

  const getPublicLink = (mode: string) => {
      const origin = window.location.origin;
      const path = window.location.pathname;
      return `${origin}${path}?mode=${mode}`;
  };

  const handleCopyLink = (type: 'radio' | 'user') => {
      const link = type === 'radio' ? getPublicLink('radio_public') : getPublicLink('read_only');
      navigator.clipboard.writeText(link);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
  };

  const districtData = useMemo(() => {
    const distMap: Record<string, {name: string, UDF: number, LDF: number, NDA: number}> = {};
    data.forEach(d => {
        if (!distMap[d.district]) distMap[d.district] = { name: d.district, UDF: 0, LDF: 0, NDA: 0 };
        if (d.lastElectionWinner === 'UDF') distMap[d.district].UDF++;
        else if (d.lastElectionWinner === 'LDF') distMap[d.district].LDF++;
        else if (d.lastElectionWinner === 'NDA') distMap[d.district].NDA++;
    });
    return Object.values(distMap);
  }, [data]);

  const pieData = [
      { name: 'UDF', value: stats.udfCount },
      { name: 'LDF', value: stats.ldfCount },
      { name: 'NDA/Others', value: 140 - (stats.udfCount + stats.ldfCount) }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      
      {/* 📻 UDF RADIO LAUNCH HUB */}
      <div className="bg-slate-900 rounded-[48px] p-10 lg:p-14 text-white relative overflow-hidden border border-white/10 shadow-2xl">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              <Radio size={400} />
          </div>
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
              <div className="space-y-8 flex-1">
                  <div className="flex items-center gap-4">
                      <div className="bg-red-600 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] animate-pulse flex items-center gap-2 shadow-lg">
                          <Activity size={14} /> LIVE AI HUB
                      </div>
                      <div className="text-emerald-400 font-black text-[10px] uppercase tracking-[0.2em] border border-emerald-400/30 px-5 py-2 rounded-full backdrop-blur-sm">
                          DISTRICT BROADCAST ACTIVE
                      </div>
                  </div>
                  <h2 className="text-6xl lg:text-8xl font-black italic tracking-tighter uppercase leading-none">
                    UDF <span className="text-emerald-500 underline decoration-8 decoration-emerald-500/20 underline-offset-8">RADIO</span>
                  </h2>
                  <p className="text-slate-400 max-w-2xl text-xl font-medium leading-relaxed">
                    Automated strategic briefings powered by Gemini AI. Connect district operations, verify news instantly, and broadcast the truth to millions.
                  </p>
                  <div className="flex flex-wrap gap-4 pt-4">
                      {appMode === 'admin' && (
                        <button 
                            onClick={() => setView?.(ViewState.RADIO_MASTER)}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white px-12 py-6 rounded-[32px] font-black text-sm uppercase tracking-widest transition-all flex items-center gap-4 shadow-2xl shadow-emerald-900/40 active:scale-95"
                        >
                            <PlayCircle size={24} /> Launch Studio
                        </button>
                      )}
                      <button 
                        onClick={() => setAppMode?.('radio_public')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-6 rounded-[32px] font-black text-sm uppercase tracking-widest transition-all flex items-center gap-4 shadow-2xl shadow-indigo-900/40 active:scale-95"
                      >
                        <LayoutPanelLeft size={24} /> Listen Live Radio
                      </button>
                      {appMode === 'admin' && (
                        <button 
                            onClick={() => handleCopyLink('radio')}
                            className="bg-white/5 text-white border border-white/10 px-10 py-6 rounded-[32px] font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-4 backdrop-blur-md"
                        >
                            {copied === 'radio' ? <UserCheck size={24} className="text-emerald-400" /> : <Share2 size={24} />}
                            {copied === 'radio' ? 'Link Saved!' : 'Copy Radio Link'}
                        </button>
                      )}
                  </div>
              </div>
              
              <div className="bg-white/5 p-12 rounded-[60px] border border-white/10 backdrop-blur-2xl flex flex-col items-center gap-8 shadow-inner w-full lg:w-[400px]">
                  <div className="flex items-end gap-2 h-24">
                      {[...Array(18)].map((_, i) => (
                          <div 
                            key={i} 
                            className="w-2.5 bg-emerald-500 rounded-full animate-bounce" 
                            style={{ 
                                height: `${20 + Math.random() * 80}%`, 
                                animationDelay: `${i * 0.08}s`,
                                animationDuration: `${0.4 + Math.random()}s` 
                            }} 
                          />
                      ))}
                  </div>
                  <div className="text-center">
                    <div className="text-[11px] font-black uppercase tracking-[0.4em] text-emerald-400 mb-2">Global Uplink</div>
                    <div className="text-3xl font-black text-white tracking-tight italic">TRANSMITTING</div>
                    <div className="flex items-center gap-2 justify-center mt-4 text-[10px] text-slate-500 font-black uppercase tracking-widest">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                        Channel: KL-NORTH
                    </div>
                  </div>
              </div>
          </div>
      </div>

      {/* 🔐 ADMIN ONLY: PUBLISHING CONTROLS */}
      {appMode === 'admin' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-[48px] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-6 group hover:shadow-xl transition-all">
                <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-[24px] flex items-center justify-center shrink-0">
                    <Users size={32} />
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Public Console</h3>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1 italic">Guest access link for citizens</p>
                </div>
                <button 
                    onClick={() => handleCopyLink('user')}
                    className={`flex items-center gap-2 px-8 py-4 rounded-[22px] font-black text-[10px] uppercase tracking-widest transition-all ${copied === 'user' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-900 text-white hover:bg-black'}`}
                >
                    {copied === 'user' ? <Check size={16}/> : <Link size={16}/>}
                    {copied === 'user' ? 'Link Copied' : 'Publish Console'}
                </button>
            </div>

            <div className="bg-white p-8 rounded-[48px] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-6 group hover:shadow-xl transition-all">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-[24px] flex items-center justify-center shrink-0">
                    <ShieldCheck size={32} />
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Data Integrity</h3>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1 italic">140 Constituencies Verified</p>
                </div>
                <button 
                    onClick={handleVerifyData}
                    disabled={isVerifying}
                    className="flex items-center gap-2 px-10 py-4 bg-emerald-600 text-white rounded-[22px] font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all disabled:opacity-50"
                >
                    {isVerifying ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                    RUN AI AUDIT
                </button>
            </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 flex flex-col md:flex-row justify-between items-center bg-white p-8 lg:p-10 rounded-[48px] border border-slate-200 shadow-sm gap-8 hover:shadow-md transition-all">
            <div className="flex items-center gap-8">
                <div className="w-20 h-20 bg-indigo-600 rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-indigo-100">
                    <Activity size={40} />
                </div>
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Strategy Snapshot</h2>
                    <p className="text-slate-500 font-medium">Real-time Election Intelligence Hub</p>
                </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
                <button 
                  onClick={handleBriefingAudio}
                  className={`p-5 rounded-[24px] transition-all shadow-sm ${isPlaying ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {isPlaying ? <Square size={24} fill="currentColor" /> : <Volume2 size={24} />}
                </button>
            </div>
        </div>

        {appMode === 'admin' ? (
            <div className={`lg:col-span-4 p-8 lg:p-10 rounded-[48px] flex items-center gap-6 border transition-all ${error === "QUOTA" ? 'bg-red-50 border-red-200' : 'bg-slate-900 text-white border-slate-800 shadow-xl hover:scale-[1.02]'}`}>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${error === "QUOTA" ? 'bg-red-200 text-red-700' : 'bg-white/10'}`}>
                    {error === "QUOTA" ? <AlertTriangle size={28} /> : <Key size={28} />}
                </div>
                <div className="flex-1">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">
                        {error === "QUOTA" ? "Quota Reached" : "AI ENGINE"}
                    </p>
                    <button 
                        onClick={handleSelectKey}
                        className={`font-black text-sm uppercase tracking-wider flex items-center gap-2 hover:opacity-80 transition-opacity`}
                    >
                        {error === "QUOTA" ? "Switch Key" : "Switch Master Key"}
                        <ArrowRight size={14} />
                    </button>
                </div>
            </div>
        ) : (
            <div className="lg:col-span-4 p-8 lg:p-10 rounded-[48px] bg-slate-100 border border-slate-200 flex items-center gap-6 shadow-inner">
                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-emerald-500">
                    <ShieldCheck size={28} />
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">SECURITY</p>
                    <p className="text-sm font-bold text-slate-600">Secure Guest Access</p>
                </div>
            </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
            { label: 'Total Voters', value: `${(stats.totalVoters / 1000000).toFixed(2)}M`, icon: Users, color: 'indigo' },
            { label: 'UDF Confidence', value: `${stats.udfCount} Seats`, icon: Vote, color: 'emerald' },
            { label: 'LDF Rivalry', value: `${stats.ldfCount} Seats`, icon: Vote, color: 'red' },
            { label: 'Anomalies', value: stats.flagged, icon: AlertTriangle, color: stats.flagged > 0 ? 'red' : 'slate' }
        ].map((item, i) => (
            <div key={i} className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-200 group hover:border-indigo-500 hover:shadow-xl transition-all">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                        <h3 className={`text-3xl font-black text-slate-900`}>{item.value}</h3>
                    </div>
                    <div className={`p-5 bg-slate-50 rounded-[24px] group-hover:scale-110 group-hover:bg-indigo-50 transition-all`}>
                        <item.icon className="text-slate-600 group-hover:text-indigo-600" size={28} />
                    </div>
                </div>
            </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-10 rounded-[48px] shadow-sm border border-slate-200 hover:shadow-lg transition-all">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-10 flex items-center gap-3">
            <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
            District Distribution
          </h3>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={districtData} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} width={100} fontWeight="bold" />
                <Tooltip 
                    cursor={{ fill: '#f8fafc' }} 
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)' }} 
                />
                <Bar dataKey="UDF" stackId="a" fill={COLORS.UDF} radius={[0, 6, 6, 0]} />
                <Bar dataKey="LDF" stackId="a" fill={COLORS.LDF} />
                <Bar dataKey="NDA" stackId="a" fill={COLORS.NDA} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[48px] shadow-sm border border-slate-200 hover:shadow-lg transition-all flex flex-col items-center">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-10 w-full flex items-center gap-3">
             <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
             2026 Assembly Snapshot
          </h3>
          <div className="h-[400px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={100} outerRadius={140} paddingAngle={8} dataKey="value" stroke="none">
                  <Cell fill={COLORS.UDF} /><Cell fill={COLORS.LDF} /><Cell fill={COLORS.NDA} />
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={40} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

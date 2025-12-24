
import React, { useState, useEffect } from 'react';
import { ConstituencyData, AnalysisResult } from '../types';
import { analyzeElectionData } from '../services/gemini';
import { 
    ShieldCheck, FileText, AlertTriangle, CheckCircle, 
    Share2, Download, Printer, Loader2, Globe, TrendingUp,
    Activity, ArrowRight, Zap, Copy, Check
} from 'lucide-react';

interface VerificationReportProps {
  data: ConstituencyData[];
  isPublic?: boolean;
}

const VerificationReport: React.FC<VerificationReportProps> = ({ data, isPublic = false }) => {
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const generateReport = async () => {
            setLoading(true);
            try {
                const res = await analyzeElectionData(data);
                setResult(res);
            } catch (e) {
                console.error("Report Generation Failed", e);
            } finally {
                setLoading(false);
            }
        };
        generateReport();
    }, [data]);

    const stats = {
        total: data.length,
        verified: data.filter(d => d.status === 'Verified').length,
        flagged: data.filter(d => d.status === 'Flagged').length,
        avgTurnout: (data.reduce((acc, d) => acc + d.projectedTurnout, 0) / data.length).toFixed(1)
    };

    const copyLink = () => {
        const url = new URL(window.location.origin + window.location.pathname);
        url.searchParams.set('mode', 'report');
        navigator.clipboard.writeText(url.toString());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-400 gap-6">
                <div className="relative">
                    <Loader2 size={64} className="animate-spin text-indigo-600" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Zap size={24} className="text-emerald-500" />
                    </div>
                </div>
                <div className="text-center">
                    <h3 className="text-xl font-black text-slate-800 uppercase tracking-widest">AI Integrity Audit in Progress</h3>
                    <p className="text-sm font-medium text-slate-500">Cross-verifying 140 constituencies against historical turnout data...</p>
                </div>
            </div>
        );
    }

    if (!result) return null;

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
            
            {/* Report Header */}
            <div className="bg-white p-8 lg:p-12 rounded-[48px] border border-slate-200 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none rotate-12">
                    <FileText size={300} />
                </div>
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                <ShieldCheck size={14} /> Official Summary
                            </div>
                            <span className="text-slate-300">|</span>
                            <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                                Updated: {new Date().toLocaleDateString()}
                            </div>
                        </div>
                        <h1 className="text-4xl lg:text-6xl font-black italic tracking-tighter uppercase text-slate-900 leading-none">
                            2026 Election <br /><span className="text-indigo-600">Integrity Report</span>
                        </h1>
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                        <button onClick={copyLink} className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${copied ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white hover:bg-black shadow-lg'}`}>
                            {copied ? <Check size={16}/> : <Share2 size={16}/>}
                            {copied ? 'Link Copied' : 'Share Report'}
                        </button>
                        {!isPublic && (
                            <button onClick={() => window.print()} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 transition-colors">
                                <Printer size={20} />
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 pt-12 border-t border-slate-100">
                    <div className="space-y-1">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Seats</div>
                        <div className="text-2xl font-black text-slate-900">{stats.total}</div>
                    </div>
                    <div className="space-y-1">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verified Seats</div>
                        <div className="text-2xl font-black text-emerald-600">{stats.verified}</div>
                    </div>
                    <div className="space-y-1">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Anomalies Detected</div>
                        <div className="text-2xl font-black text-red-500">{stats.flagged}</div>
                    </div>
                    <div className="space-y-1">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Projected Turnout</div>
                        <div className="text-2xl font-black text-indigo-600">{stats.avgTurnout}%</div>
                    </div>
                </div>
            </div>

            {/* AI Executive Summary */}
            <div className="bg-indigo-600 text-white p-10 lg:p-14 rounded-[56px] shadow-2xl shadow-indigo-200 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="flex items-center gap-4 mb-8">
                    <Zap className="text-amber-400 fill-amber-400" size={32} />
                    <h2 className="text-2xl font-black uppercase tracking-tighter italic">Strategic Executive Briefing</h2>
                </div>
                <p className="text-lg lg:text-xl font-medium leading-relaxed italic opacity-90">
                    "{result.summary}"
                </p>
                <div className="mt-10 flex flex-wrap gap-6">
                    <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/10">
                        <div className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-1">UDF Advantage Score</div>
                        <div className="text-3xl font-black">{result.udfAdvantageScore}/100</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/10">
                        <div className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-1">Data Fraud Risk</div>
                        <div className="text-3xl font-black text-amber-300">{result.riskScore}%</div>
                    </div>
                </div>
            </div>

            {/* Detailed Verification Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-6">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-3 ml-4">
                        <AlertTriangle size={18} className="text-red-500" /> Critical Data Flagged
                    </h3>
                    <div className="space-y-4">
                        {result.anomalies.map((anomaly, idx) => (
                            <div key={idx} className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm hover:shadow-xl transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${anomaly.severity === 'high' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                                            <AlertTriangle size={24} />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Constituency ID: {anomaly.constituencyId}</div>
                                            <h4 className="text-xl font-black text-slate-900">Anomaly Detected</h4>
                                        </div>
                                    </div>
                                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${anomaly.severity === 'high' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                        {anomaly.severity} SEVERITY
                                    </span>
                                </div>
                                <p className="text-slate-600 font-medium leading-relaxed mb-6">
                                    {anomaly.description}
                                </p>
                                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-center justify-between group-hover:bg-emerald-50 group-hover:border-emerald-100 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-emerald-600">
                                            <Activity size={20} />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recommended Strategic Action</div>
                                            <div className="text-sm font-bold text-slate-800">{anomaly.suggestedAction}</div>
                                        </div>
                                    </div>
                                    <ArrowRight size={20} className="text-slate-300 group-hover:text-emerald-600 -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-white p-8 rounded-[48px] border border-slate-200 shadow-sm">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Quick Verification Status</h3>
                        <div className="space-y-6">
                            {data.slice(0, 8).map(seat => (
                                <div key={seat.id} className="flex items-center justify-between border-b border-slate-50 pb-4">
                                    <div>
                                        <div className="text-sm font-bold text-slate-800">{seat.name}</div>
                                        <div className="text-[10px] text-slate-400 uppercase font-black">{seat.district}</div>
                                    </div>
                                    <div className={`p-2 rounded-xl ${seat.status === 'Verified' ? 'text-emerald-500 bg-emerald-50' : seat.status === 'Flagged' ? 'text-red-500 bg-red-50' : 'text-slate-400 bg-slate-100'}`}>
                                        {seat.status === 'Verified' ? <CheckCircle size={20} /> : seat.status === 'Flagged' ? <AlertTriangle size={20} /> : <div className="w-5 h-5 rounded-full border-2 border-current border-t-transparent animate-spin" />}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-8 py-4 bg-slate-50 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-colors">
                            View all 140 seats
                        </button>
                    </div>

                    <div className="bg-slate-900 p-10 rounded-[48px] text-white relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 p-6 opacity-10"><Globe size={120} /></div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-6 flex items-center gap-2">
                             <TrendingUp size={14} /> Report Metadata
                        </h3>
                        <div className="space-y-6 relative z-10">
                            <div>
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Generated By</div>
                                <div className="text-sm font-bold">UDF Gemini AI Engine</div>
                            </div>
                            <div>
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Security Hash</div>
                                <div className="text-[10px] font-mono text-slate-400 truncate">SHA256-88x92-EL-2026-REPORT</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerificationReport;

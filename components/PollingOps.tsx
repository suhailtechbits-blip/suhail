
import React, { useState } from 'react';
import { ConstituencyData } from '../types';
import { LiveElectionSummary } from '../services/liveResults';
import { Activity, Users, Bell, ArrowUpRight, CheckCircle, AlertOctagon, Edit2, Save, X, Search } from 'lucide-react';

interface PollingOpsProps {
    data: ConstituencyData[];
    liveSummary?: LiveElectionSummary | null;
    onUpdateData: (id: string, updates: Partial<ConstituencyData>) => void;
}

const PollingOps: React.FC<PollingOpsProps> = ({ data, liveSummary, onUpdateData }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState<string>('');
    const [checkedIn, setCheckedIn] = useState(850);
    const totalVolunteers = 1200;

    const filteredData = data.filter(d => 
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        d.district.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getDisplayTurnout = (seat: ConstituencyData) => {
        // Priority: Manual Override (seat.liveTurnout) > Live Sync (if ID matches) > Mock Simulation
        if (seat.liveTurnout !== undefined) {
            return { value: seat.liveTurnout, source: 'Manual' };
        }
        
        if (liveSummary && liveSummary.results) {
            const liveResult = liveSummary.results.find(r => r.constituencyId === seat.id);
            if (liveResult) return { value: liveResult.turnout, source: 'Live' };
        }

        // Mock Simulation if liveSummary is present but no specific seat data, or no liveSummary at all
        const mockVal = liveSummary 
            ? liveSummary.statewideTurnout + (Math.random() * 2 - 1) 
            : 62.5 + (Math.random() * 5);
        
        return { value: parseFloat(mockVal.toFixed(1)), source: 'Estimated' };
    };

    const handleStartEdit = (seat: ConstituencyData) => {
        setEditingId(seat.id);
        setEditValue(seat.liveTurnout?.toString() || getDisplayTurnout(seat).value.toString());
    };

    const handleSaveEdit = (id: string) => {
        const val = parseFloat(editValue);
        if (!isNaN(val)) {
            onUpdateData(id, { liveTurnout: val });
        }
        setEditingId(null);
    };

    const avgTurnout = (data.reduce((acc, s) => acc + getDisplayTurnout(s).value, 0) / data.length).toFixed(1);

    return (
        <div className="flex flex-col gap-6 animate-in fade-in">
            {/* Control Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search for Booths/Constituencies..."
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {liveSummary && (
                    <div className="bg-slate-800 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-mono w-full md:w-auto">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        STREAM SYNC: {liveSummary.lastUpdated}
                    </div>
                )}
            </div>

            {/* Top Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg col-span-2">
                     <div className="flex justify-between items-start">
                         <div>
                             <h2 className="text-lg font-bold flex items-center gap-2">
                                <Activity className={liveSummary ? "text-emerald-500" : "text-red-500"}/> 
                                State-wide Turnout
                             </h2>
                             <p className="text-slate-400 text-sm">
                                {liveSummary ? `Live Feed Active • Last sync ${liveSummary.lastUpdated}` : 'Preparation / Simulation Mode'}
                             </p>
                         </div>
                         <div className="text-3xl font-bold">{liveSummary ? liveSummary.statewideTurnout : avgTurnout}%</div>
                     </div>
                     <div className="mt-4 w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                         <div className={`h-full transition-all duration-1000 ${liveSummary ? 'bg-emerald-500' : 'bg-red-500'}`} style={{width: `${liveSummary ? liveSummary.statewideTurnout : avgTurnout}%`}}></div>
                     </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm text-slate-500 font-bold uppercase mb-2">Ground Mobilization</h3>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold text-emerald-600">{checkedIn}</span>
                        <span className="text-sm text-slate-400 mb-1">/ {totalVolunteers}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-tighter">Active Volunteers at Booths</p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm text-slate-500 font-bold uppercase mb-2">Issues Reported</h3>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold text-orange-500">42</span>
                        <span className="text-sm text-slate-400 mb-1">Total</span>
                    </div>
                    <div className="text-xs text-orange-600 mt-2 flex items-center gap-1 font-bold">
                        <AlertOctagon size={12}/> 5 Critical Unresolved
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Main Table */}
                <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-slate-200 bg-slate-50 font-bold text-slate-700 flex justify-between items-center">
                        <span className="flex items-center gap-2"><Activity size={18} className="text-emerald-600" /> Constituency Polling Tracker</span>
                        <span className="text-[10px] text-slate-400 font-normal italic">Showing {filteredData.length} entries</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-100/50">
                                <tr>
                                    <th className="p-4">Constituency</th>
                                    <th className="p-4">District</th>
                                    <th className="p-4">Trend (2021)</th>
                                    <th className="p-4 text-center">Turnout Status</th>
                                    <th className="p-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredData.slice(0, 50).map(seat => {
                                    const { value, source } = getDisplayTurnout(seat);
                                    const isEditing = editingId === seat.id;
                                    
                                    return (
                                        <tr key={seat.id} className="hover:bg-slate-50 group">
                                            <td className="p-4 font-bold text-slate-800">{seat.name}</td>
                                            <td className="p-4 text-slate-500">{seat.district}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                    seat.lastElectionWinner === 'UDF' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                    {seat.lastElectionWinner} {seat.winningMargin.toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="flex flex-col items-center">
                                                    {isEditing ? (
                                                        <input 
                                                            type="number"
                                                            className="w-20 p-1 border border-emerald-500 rounded text-center text-sm"
                                                            value={editValue}
                                                            onChange={(e) => setEditValue(e.target.value)}
                                                            autoFocus
                                                        />
                                                    ) : (
                                                        <>
                                                            <div className="text-lg font-black text-slate-900">{value}%</div>
                                                            <div className={`text-[10px] font-bold uppercase tracking-widest ${
                                                                source === 'Manual' ? 'text-blue-500' : 
                                                                source === 'Live' ? 'text-emerald-500' : 'text-slate-400'
                                                            }`}>
                                                                {source}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4 text-right">
                                                {isEditing ? (
                                                    <div className="flex justify-end gap-1">
                                                        <button 
                                                            onClick={() => handleSaveEdit(seat.id)}
                                                            className="p-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                                                        >
                                                            <Save size={14} />
                                                        </button>
                                                        <button 
                                                            onClick={() => setEditingId(null)}
                                                            className="p-1.5 bg-slate-200 text-slate-600 rounded hover:bg-slate-300"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button 
                                                        onClick={() => handleStartEdit(seat)}
                                                        className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {filteredData.length > 50 && (
                            <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 border-t border-slate-100">
                                Use search to find other constituencies
                            </div>
                        )}
                    </div>
                </div>

                {/* Side Alerts */}
                <div className="w-full lg:w-80 space-y-4">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-slate-200 bg-red-50 font-bold text-red-800 flex items-center gap-2">
                            <Bell size={18} /> High Priority Alerts
                        </div>
                        <div className="p-4 space-y-3">
                             <div className="p-3 border border-red-200 bg-red-50 rounded-lg animate-pulse">
                                 <div className="flex justify-between mb-1">
                                     <span className="text-[10px] font-bold text-red-700">LIVE ALERT</span>
                                     <span className="text-[10px] text-red-400">Now</span>
                                 </div>
                                 <p className="text-xs text-red-900 font-bold">EVM Malfunction reported in Booth 45 (Manjeshwar). Technical team dispatched.</p>
                             </div>
                             <div className="p-3 border border-orange-200 bg-orange-50 rounded-lg">
                                 <div className="flex justify-between mb-1">
                                     <span className="text-[10px] font-bold text-orange-700">TRENDING</span>
                                     <span className="text-[10px] text-orange-400">10m ago</span>
                                 </div>
                                 <p className="text-xs text-orange-900">Low voter turnout in Urban Wards. Requesting immediate ground team mobilization.</p>
                             </div>
                        </div>
                    </div>
                    
                    <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg">
                        <h4 className="font-bold mb-4 flex items-center gap-2"><Users size={18} className="text-emerald-400" /> Operational Action</h4>
                        <div className="space-y-3">
                            <button className="w-full bg-emerald-600 hover:bg-emerald-700 py-2 rounded-lg text-xs font-bold transition-all">Broadcast to All Agents</button>
                            <button className="w-full bg-slate-800 hover:bg-slate-700 py-2 rounded-lg text-xs font-bold border border-slate-700 transition-all">Request Turnout Update</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default PollingOps;

import React, { useState } from 'react';
import { ConstituencyData } from '../types';
import { TrendingUp, ArrowUpRight, Target, Loader2, Filter } from 'lucide-react';
import { analyzeVoteTrends } from '../services/gemini';

interface TrendAnalysisProps {
  data: ConstituencyData[];
}

const TrendAnalysis: React.FC<TrendAnalysisProps> = ({ data }) => {
    const [sortField, setSortField] = useState<'requiredGrowth' | 'winningMargin'>('requiredGrowth');
    const [loadingAnalysis, setLoadingAnalysis] = useState<string | null>(null);
    const [aiInsights, setAiInsights] = useState<Record<string, string>>({});
    const [filterFront, setFilterFront] = useState<string>('All');

    const filteredData = data.filter(d => filterFront === 'All' || d.lastElectionWinner === filterFront);
    
    const sortedData = [...filteredData].sort((a, b) => b[sortField] - a[sortField]);

    const handleAnalyze = async (seat: ConstituencyData) => {
        setLoadingAnalysis(seat.id);
        const insight = await analyzeVoteTrends(seat.name, seat.votes2021, seat.targetVotes2026);
        setAiInsights(prev => ({...prev, [seat.id]: insight}));
        setLoadingAnalysis(null);
    };

    return (
        <div className="h-full flex flex-col gap-6 animate-in fade-in duration-500">
             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
                 <div>
                     <h2 className="text-xl font-bold text-slate-800 flex items-center">
                         <TrendingUp className="mr-2 text-emerald-600" />
                         Agent 3: Trend & Vote Increase List
                     </h2>
                     <p className="text-slate-500 text-sm">2026 Target vs 2021 Actuals - Growth Analysis</p>
                 </div>
                 
                 <div className="flex items-center gap-4">
                     <div className="flex items-center bg-slate-100 rounded-lg p-1">
                         <button 
                             onClick={() => setSortField('requiredGrowth')}
                             className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${sortField === 'requiredGrowth' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}
                         >
                             Growth %
                         </button>
                         <button 
                             onClick={() => setSortField('winningMargin')}
                             className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${sortField === 'winningMargin' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}
                         >
                             Margin
                         </button>
                     </div>
                     <select 
                        className="px-3 py-2 bg-slate-100 border-none rounded-lg text-sm font-medium focus:ring-2 focus:ring-emerald-500"
                        value={filterFront}
                        onChange={(e) => setFilterFront(e.target.value)}
                     >
                         <option value="All">All Fronts</option>
                         <option value="UDF">Held by UDF</option>
                         <option value="LDF">Held by LDF</option>
                         <option value="NDA">Held by NDA</option>
                     </select>
                 </div>
             </div>

             <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                 <div className="overflow-x-auto">
                     <table className="w-full text-left border-collapse">
                         <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold sticky top-0 z-10">
                             <tr>
                                 <th className="p-4 border-b">Constituency</th>
                                 <th className="p-4 border-b">2021 Winner</th>
                                 <th className="p-4 border-b text-right">2021 Votes</th>
                                 <th className="p-4 border-b text-right">2026 Target</th>
                                 <th className="p-4 border-b text-right">Vote Increase</th>
                                 <th className="p-4 border-b text-right">Growth %</th>
                                 <th className="p-4 border-b">AI Analysis</th>
                             </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-100">
                             {sortedData.map(seat => (
                                 <tr key={seat.id} className="hover:bg-slate-50 transition-colors">
                                     <td className="p-4">
                                         <div className="font-bold text-slate-800">{seat.name}</div>
                                         <div className="text-xs text-slate-400">{seat.district}</div>
                                     </td>
                                     <td className="p-4">
                                         <span className={`px-2 py-1 rounded text-xs font-bold ${
                                             seat.lastElectionWinner === 'UDF' ? 'bg-emerald-100 text-emerald-700' :
                                             seat.lastElectionWinner === 'LDF' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                                         }`}>
                                             {seat.lastElectionWinner}
                                         </span>
                                     </td>
                                     <td className="p-4 text-right font-mono text-slate-600">{seat.votes2021.toLocaleString()}</td>
                                     <td className="p-4 text-right font-mono font-medium text-slate-800">{seat.targetVotes2026.toLocaleString()}</td>
                                     <td className="p-4 text-right font-mono text-slate-600">+{ (seat.targetVotes2026 - seat.votes2021).toLocaleString() }</td>
                                     <td className="p-4 text-right">
                                         <div className={`inline-flex items-center gap-1 font-bold ${seat.requiredGrowth > 10 ? 'text-red-600' : 'text-emerald-600'}`}>
                                            {seat.requiredGrowth.toFixed(1)}%
                                            <ArrowUpRight size={14} />
                                         </div>
                                     </td>
                                     <td className="p-4">
                                         {aiInsights[seat.id] ? (
                                             <div className="text-xs text-slate-600 bg-slate-100 p-2 rounded max-w-xs leading-relaxed">
                                                 <span className="font-bold text-indigo-600">Agent:</span> {aiInsights[seat.id]}
                                             </div>
                                         ) : (
                                             <button 
                                                 onClick={() => handleAnalyze(seat)}
                                                 disabled={loadingAnalysis === seat.id}
                                                 className="text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1"
                                             >
                                                 {loadingAnalysis === seat.id ? <Loader2 size={12} className="animate-spin" /> : <Target size={12} />}
                                                 Check Feasibility
                                             </button>
                                         )}
                                     </td>
                                 </tr>
                             ))}
                         </tbody>
                     </table>
                 </div>
             </div>
        </div>
    );
};

export default TrendAnalysis;

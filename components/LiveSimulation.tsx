import React, { useState, useMemo } from 'react';
import { ConstituencyData } from '../types';
import { Radio, Activity, RefreshCw } from 'lucide-react';

interface LiveSimulationProps {
  data: ConstituencyData[];
}

const LiveSimulation: React.FC<LiveSimulationProps> = ({ data }) => {
    // 0 = Neutral, >0 = UDF Wave, <0 = LDF Wave
    const [swingFactor, setSwingFactor] = useState(0); 

    const simulation = useMemo(() => {
        let udfCount = 0;
        let ldfCount = 0;
        let ndaCount = 0;
        
        const results = data.map(seat => {
            // Logic: Apply swing factor percentage to UDF margin.
            // If swing is +5%, UDF votes increase 5% relative to LDF.
            
            let simulatedWinner = seat.lastElectionWinner;
            let simulatedMargin = seat.winningMargin;
            let status = 'HOLD'; // HOLD, FLIP

            // Simplified simulation logic
            // If UDF won, positive swing increases margin.
            // If UDF lost (LDF won), positive swing reduces LDF margin, eventually flipping.
            
            if (seat.lastElectionWinner === 'UDF') {
                simulatedMargin += (seat.totalVoters * (swingFactor / 100));
            } else if (seat.lastElectionWinner === 'LDF') {
                simulatedMargin -= (seat.totalVoters * (swingFactor / 100));
                if (simulatedMargin < 0) {
                    simulatedWinner = 'UDF';
                    simulatedMargin = Math.abs(simulatedMargin);
                    status = 'FLIP to UDF';
                }
            }
            
            // Handle negative swing (LDF Wave)
            if (swingFactor < 0) {
                 if (seat.lastElectionWinner === 'UDF') {
                    // Margin reduces
                    // recalculate above logic inverse
                 }
            }

            // Correction for negative swing affecting UDF seats
             if (seat.lastElectionWinner === 'UDF' && swingFactor < 0) {
                 const effectiveMargin = seat.winningMargin + (seat.totalVoters * (swingFactor / 100));
                 if (effectiveMargin < 0) {
                     simulatedWinner = 'LDF';
                     status = 'FLIP to LDF';
                 }
             }

            if (simulatedWinner === 'UDF') udfCount++;
            else if (simulatedWinner === 'LDF') ldfCount++;
            else ndaCount++;

            return { ...seat, simulatedWinner, status };
        });

        return { results, udfCount, ldfCount, ndaCount };

    }, [data, swingFactor]);

    return (
        <div className="h-full flex flex-col gap-6 animate-in fade-in duration-500">
            <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg flex flex-col md:flex-row justify-between items-center">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <h2 className="text-xl font-bold">Agent 2: Live Scenario Simulator</h2>
                    </div>
                    <p className="text-slate-400 text-sm">Adjust the swing factor to simulate 2026 outcomes.</p>
                </div>
                
                <div className="flex items-center gap-8 mt-4 md:mt-0">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-emerald-400">{simulation.udfCount}</div>
                        <div className="text-xs text-slate-400 font-bold tracking-wider">UDF</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-red-500">{simulation.ldfCount}</div>
                        <div className="text-xs text-slate-400 font-bold tracking-wider">LDF</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-orange-400">{simulation.ndaCount}</div>
                        <div className="text-xs text-slate-400 font-bold tracking-wider">NDA</div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <label className="block text-sm font-medium text-slate-700 mb-4 flex justify-between">
                    <span>LDF Wave (-10%)</span>
                    <span className="font-bold text-slate-900">Current Swing: {swingFactor > 0 ? '+' : ''}{swingFactor}%</span>
                    <span>UDF Wave (+10%)</span>
                </label>
                <input 
                    type="range" 
                    min="-10" 
                    max="10" 
                    step="0.5"
                    value={swingFactor}
                    onChange={(e) => setSwingFactor(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="mt-4 flex justify-center">
                    <button 
                        onClick={() => setSwingFactor(0)}
                        className="text-xs flex items-center gap-1 text-slate-500 hover:text-slate-800"
                    >
                        <RefreshCw size={12} /> Reset to 2021 Actuals
                    </button>
                </div>
            </div>

            {/* Results Grid */}
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                 <div className="p-4 border-b border-slate-200 bg-slate-50 font-bold text-slate-700">
                     Projected Flips ({simulation.results.filter(r => r.status.includes('FLIP')).length})
                 </div>
                 <div className="overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     {simulation.results.filter(r => r.status.includes('FLIP')).length === 0 ? (
                         <div className="col-span-full text-center py-12 text-slate-400">
                             <Activity size={32} className="mx-auto mb-2 opacity-50" />
                             <p>No seats flip with current swing factor.</p>
                         </div>
                     ) : (
                         simulation.results.filter(r => r.status.includes('FLIP')).map(seat => (
                             <div key={seat.id} className="p-4 border border-slate-200 rounded-lg bg-yellow-50 flex justify-between items-center">
                                 <div>
                                     <div className="font-bold text-slate-800">{seat.name}</div>
                                     <div className="text-xs text-slate-500">Was {seat.lastElectionWinner}</div>
                                 </div>
                                 <div className="text-right">
                                     <div className="text-xs font-bold uppercase tracking-wide text-indigo-600 mb-1">Flipped To</div>
                                     <span className={`px-2 py-1 rounded text-sm font-bold text-white shadow-sm
                                         ${seat.simulatedWinner === 'UDF' ? 'bg-emerald-500' : 'bg-red-500'}
                                     `}>
                                         {seat.simulatedWinner}
                                     </span>
                                 </div>
                             </div>
                         ))
                     )}
                 </div>
            </div>
        </div>
    );
};

export default LiveSimulation;

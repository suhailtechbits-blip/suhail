
import React, { useState, useMemo } from 'react';
import { ConstituencyData } from '../types';
import { generateSeatStrategy, generateSpeech, stopSpeech, formatShareContent, fetchSpeechBlob, downloadAudio } from '../services/gemini';
import { Target, TrendingUp, AlertCircle, MessageSquare, Loader2, Volume2, Square, Share2, Download } from 'lucide-react';

interface StrategyBoardProps {
  data: ConstituencyData[];
}

const StrategyBoard: React.FC<StrategyBoardProps> = ({ data }) => {
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [aiStrategy, setAiStrategy] = useState<string>("");
  const [loadingStrategy, setLoadingStrategy] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPlayingSpeech, setIsPlayingSpeech] = useState(false);

  const stats = useMemo(() => {
    const swingSeats = data.filter(d => d.targetCategory === 'Swing');
    const safeSeats = data.filter(d => d.targetCategory === 'Safe');
    const udfCurrent = data.filter(d => d.lastElectionWinner === 'UDF').length;
    const projected2026 = safeSeats.length + Math.round(swingSeats.length * 0.6);
    return { swingSeats, safeSeats, udfCurrent, projected2026 };
  }, [data]);

  const handleGenerateStrategy = async (seat: ConstituencyData) => {
      setLoadingStrategy(true);
      setAiStrategy("");
      const result = await generateSeatStrategy(seat.name, seat.winningMargin, seat.lastElectionWinner);
      setAiStrategy(result);
      setLoadingStrategy(false);
  };

  const handleTextToAudio = async () => {
      if (isPlayingSpeech) {
          stopSpeech();
          setIsPlayingSpeech(false);
          return;
      }
      if (!aiStrategy) return;
      setIsPlayingSpeech(true);
      try {
          await generateSpeech(aiStrategy);
      } finally {
          setIsPlayingSpeech(false);
      }
  };

  const handleDownloadStrategy = async () => {
      if (!aiStrategy) return;
      setIsDownloading(true);
      try {
        const blob = await fetchSpeechBlob(aiStrategy);
        downloadAudio(blob, `strategy_${selectedSeat}.wav`);
      } catch (e) {
        alert("Download failed.");
      } finally {
        setIsDownloading(false);
      }
  };

  const handleSmartShare = (seatName: string) => {
      const title = `Blueprint for ${seatName}`;
      const formattedText = formatShareContent(title, aiStrategy, 'Strategy');
      const waUrl = `https://wa.me/?text=${encodeURIComponent(formattedText)}`;
      window.open(waUrl, '_blank');
  };

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in duration-500">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <p className="text-xs text-slate-500 uppercase font-bold text-[10px] mb-1">Target 2026 Majority</p>
                <div className="flex items-end gap-2">
                    <h3 className="text-2xl font-bold text-slate-800">71 Seats</h3>
                    <span className="text-xs text-slate-400 mb-1">Needed</span>
                </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <p className="text-xs text-slate-500 uppercase font-bold text-[10px] mb-1">Swing Seats</p>
                <div className="flex items-end gap-2">
                    <h3 className="text-2xl font-bold text-orange-600">{stats.swingSeats.length}</h3>
                </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <p className="text-xs text-slate-500 uppercase font-bold text-[10px] mb-1">UDF Current Strength</p>
                <div className="flex items-end gap-2">
                    <h3 className="text-2xl font-bold text-emerald-600">{stats.udfCurrent}</h3>
                </div>
            </div>
             <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 bg-gradient-to-r from-blue-50 to-white">
                <p className="text-xs text-blue-600 uppercase font-bold text-[10px] mb-1">Projected 2026</p>
                <div className="flex items-end gap-2">
                    <h3 className="text-2xl font-bold text-blue-700">{stats.projected2026}</h3>
                </div>
            </div>
        </div>

        <div className="flex-1 flex gap-6 min-h-0">
            <div className="w-1/3 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wider">
                        <Target className="text-red-500" size={16} /> Priority Swing Seats
                    </h3>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {stats.swingSeats.sort((a,b) => a.winningMargin - b.winningMargin).map(seat => (
                        <div 
                            key={seat.id} 
                            onClick={() => setSelectedSeat(seat.id)}
                            className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors ${selectedSeat === seat.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold text-slate-800 text-sm">{seat.name}</h4>
                                    <span className="text-[10px] text-slate-400 uppercase font-bold">{seat.district}</span>
                                </div>
                                <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${seat.lastElectionWinner === 'UDF' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                    {seat.lastElectionWinner} +{seat.winningMargin}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col p-6 overflow-y-auto custom-scrollbar">
                {selectedSeat ? (
                    <>
                        {(() => {
                            const seat = data.find(d => d.id === selectedSeat);
                            if (!seat) return null;
                            return (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                                        <div>
                                            <h2 className="text-2xl font-bold text-slate-900">{seat.name}</h2>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-bold uppercase tracking-widest">Election 2026 Strategy</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {aiStrategy && (
                                              <>
                                                <button 
                                                    onClick={handleTextToAudio}
                                                    className={`p-3 rounded-xl transition-all flex items-center gap-2 ${isPlayingSpeech ? 'bg-red-600 text-white shadow-lg animate-pulse' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
                                                >
                                                    {isPlayingSpeech ? <Square size={16} fill="currentColor" /> : <Volume2 size={16} />}
                                                </button>
                                                <button 
                                                    onClick={handleDownloadStrategy}
                                                    disabled={isDownloading}
                                                    className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 border border-slate-200 disabled:opacity-50"
                                                >
                                                    {isDownloading ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
                                                </button>
                                                <button 
                                                    onClick={() => handleSmartShare(seat.name)}
                                                    className="flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-md text-[10px] font-black uppercase tracking-widest"
                                                >
                                                    <Share2 size={16} /> SHARE
                                                </button>
                                              </>
                                            )}
                                            <button 
                                                onClick={() => handleGenerateStrategy(seat)}
                                                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-md font-bold text-sm"
                                            >
                                                {loadingStrategy ? <Loader2 size={18} className="animate-spin"/> : <MessageSquare size={18} />}
                                                Initialize Plan
                                            </button>
                                        </div>
                                    </div>

                                    <div className="min-h-[250px] bg-slate-900 rounded-2xl p-8 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-8 opacity-5 text-white pointer-events-none"><TrendingUp size={160} /></div>
                                        <h4 className="text-emerald-400 font-black text-xs uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                            <TrendingUp size={16} /> Strategic Blueprint
                                        </h4>
                                        {loadingStrategy ? (
                                            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                                                <Loader2 className="animate-spin mb-4" size={32}/> 
                                                <p className="text-sm font-bold uppercase tracking-widest">Processing District Trends...</p>
                                            </div>
                                        ) : aiStrategy ? (
                                            <div className="text-slate-200 leading-relaxed font-medium whitespace-pre-wrap text-sm">
                                                {aiStrategy}
                                            </div>
                                        ) : (
                                            <div className="text-slate-600 italic flex flex-col items-center justify-center py-20">
                                                <AlertCircle size={48} className="mb-4 opacity-20"/>
                                                <p className="text-sm font-bold uppercase tracking-wider">Generate strategy for {seat.name}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })()}
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                        <Target size={40} className="opacity-20 mb-4" />
                        <h3 className="text-lg font-bold text-slate-700">Select a Swing Seat</h3>
                    </div>
                )}
            </div>
        </div>
        <style>{`
            .custom-scrollbar::-webkit-scrollbar { width: 4px; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        `}</style>
    </div>
  );
};

export default StrategyBoard;

import React, { useState, useEffect } from 'react';
import { ConstituencyData, AnalysisResult } from '../types';
import { analyzeElectionData } from '../services/gemini';
import { ShieldCheck, AlertOctagon, Check, Loader2, RefreshCw, Trophy } from 'lucide-react';

interface VerificationProps {
  data: ConstituencyData[];
}

const Verification: React.FC<VerificationProps> = ({ data }) => {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const res = await analyzeElectionData(data);
      setResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!result && !loading) {
      runAnalysis();
    }
  }, []);

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400">
        <Loader2 size={48} className="animate-spin text-emerald-500 mb-4" />
        <h3 className="text-xl font-medium text-slate-700">Running UDF Strategy Engine...</h3>
        <p className="text-sm">Analyzing 140 Constituencies for Double Votes & Trends</p>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* UDF Advantage Score */}
          <div className="bg-gradient-to-br from-emerald-50 to-white p-6 rounded-xl border border-emerald-100 shadow-sm flex flex-col items-center justify-center text-center">
              <div className="p-4 bg-emerald-100 rounded-full mb-4">
                  <Trophy size={32} className="text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700">UDF Advantage Score</h3>
              <p className="text-4xl font-bold text-emerald-600 mt-2">{result.udfAdvantageScore}/100</p>
              <p className="text-xs text-slate-500 mt-2">Based on historical data & turnout</p>
          </div>

          {/* Risk Score */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
              <div className={`p-4 rounded-full mb-4 ${result.riskScore > 50 ? 'bg-red-100' : 'bg-green-100'}`}>
                  <ShieldCheck size={32} className={result.riskScore > 50 ? 'text-red-600' : 'text-green-600'} />
              </div>
              <h3 className="text-lg font-semibold text-slate-700">Voter Fraud Risk</h3>
              <p className={`text-4xl font-bold mt-2 ${result.riskScore > 50 ? 'text-red-600' : 'text-green-600'}`}>
                  {result.riskScore}%
              </p>
              <p className="text-xs text-slate-500 mt-2">Duplicate entries probability</p>
          </div>

          {/* Summary Box */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm md:col-span-1 flex flex-col justify-center">
              <h3 className="font-bold text-slate-800 mb-2">Strategic Executive Summary</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{result.summary}</p>
          </div>
      </div>

      {/* Anomalies List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <h3 className="font-bold text-slate-800 flex items-center">
                <AlertOctagon className="mr-2 text-slate-500" size={20} />
                Strategic Anomalies & Opportunities
            </h3>
            <button onClick={runAnalysis} className="text-sm text-emerald-600 font-medium hover:underline flex items-center">
                <RefreshCw size={14} className="mr-1" /> Refresh
            </button>
        </div>
        
        <div className="divide-y divide-slate-100">
            {result.anomalies.map((anomaly, idx) => (
                <div key={idx} className="p-6 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start">
                        <div className={`mt-1 w-2 h-2 rounded-full mr-4 flex-shrink-0 
                            ${anomaly.severity === 'high' ? 'bg-red-500' : anomaly.severity === 'medium' ? 'bg-orange-400' : 'bg-blue-400'}`} 
                        />
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                                <h4 className="font-bold text-slate-800 text-sm">Constituency ID: {anomaly.constituencyId}</h4>
                                <span className="text-xs font-mono uppercase text-slate-400">{anomaly.severity}</span>
                            </div>
                            <p className="text-slate-700 mb-2">{anomaly.description}</p>
                            <div className="bg-emerald-50 text-emerald-800 text-sm px-3 py-2 rounded-md border border-emerald-100 inline-block">
                                <span className="font-semibold">Action:</span> {anomaly.suggestedAction}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
            {result.anomalies.length === 0 && (
                <div className="p-12 text-center text-slate-400">
                    <Check className="mx-auto mb-2 opacity-50" size={32} />
                    <p>No major anomalies detected in the current dataset.</p>
                </div>
            )}
        </div>
      </div>

    </div>
  );
};

export default Verification;

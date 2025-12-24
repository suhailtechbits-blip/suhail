import React, { useState } from 'react';
import { ConstituencyData } from '../types';
import { Save, RefreshCw, AlertCircle } from 'lucide-react';

interface DataInputProps {
  data: ConstituencyData[];
  onSave: (newData: ConstituencyData[]) => void;
}

const DataInput: React.FC<DataInputProps> = ({ data, onSave }) => {
  const [jsonString, setJsonString] = useState(JSON.stringify(data, null, 2));
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleSave = () => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!Array.isArray(parsed)) throw new Error("Data must be an array");
      
      onSave(parsed);
      setError(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const insertAnomaly = () => {
      // Helper to break the data for demonstration
      try {
          const parsed: ConstituencyData[] = JSON.parse(jsonString);
          if (parsed.length > 1) {
              // Make District 1 have more verified voters than total voters (anomaly)
              parsed[0].verifiedVoters = parsed[0].totalVoters + 5000;
              parsed[0].projectedTurnout = 105;
              parsed[0].status = 'Flagged'; 
              parsed[0].issues = [...(parsed[0].issues || []), "Verified voters exceed total voters"];
              
              // Make District 2 have suspicious low turnout
              parsed[1].projectedTurnout = 5;
              parsed[1].status = 'Flagged';
              parsed[1].issues = [...(parsed[1].issues || []), "Abnormally low projected turnout"];
              
              setJsonString(JSON.stringify(parsed, null, 2));
              setSuccess(true);
              setTimeout(() => setSuccess(false), 2000);
          }
      } catch (e) {
          // ignore
      }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
      <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Raw District Data</h2>
          <p className="text-sm text-slate-500">Edit JSON directly to test verification logic.</p>
        </div>
        <div className="flex space-x-2">
            <button
                onClick={insertAnomaly}
                className="flex items-center space-x-2 px-4 py-2 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg text-sm font-medium transition-colors"
            >
                <AlertCircle size={16} />
                <span>Inject Anomalies</span>
            </button>
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Save size={16} />
            <span>Update Data</span>
          </button>
        </div>
      </div>
      
      <div className="flex-1 relative">
        <textarea
          value={jsonString}
          onChange={(e) => setJsonString(e.target.value)}
          className="w-full h-full p-6 font-mono text-sm text-slate-700 resize-none focus:outline-none focus:bg-slate-50 transition-colors"
          spellCheck={false}
        />
        
        {error && (
          <div className="absolute bottom-4 left-4 right-4 bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center shadow-lg">
            <AlertCircle size={20} className="mr-2" />
            {error}
          </div>
        )}
        
        {success && (
          <div className="absolute bottom-4 left-4 right-4 bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center shadow-lg">
            <RefreshCw size={20} className="mr-2 animate-spin" />
            Data updated successfully. Go to 'Integrity Check' to verify.
          </div>
        )}
      </div>
    </div>
  );
};

export default DataInput;
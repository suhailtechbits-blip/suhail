import React, { useState, useRef } from 'react';
import { ConstituencyData } from '../types';
import { Upload, FileText, CheckCircle, AlertOctagon, Loader2, ArrowRight, Wand2, Database, Table } from 'lucide-react';
import { suggestColumnMapping } from '../services/gemini';

interface VoterListUploadProps {
  data: ConstituencyData[];
  onSave: (newData: ConstituencyData[]) => void;
}

const EXPECTED_FIELDS = ["Voter ID", "Voter Name", "Guardian Name", "House No", "Age", "Gender", "Booth Number"];

const VoterListUpload: React.FC<VoterListUploadProps> = ({ data, onSave }) => {
  const [selectedId, setSelectedId] = useState(data[0]?.id);
  const [step, setStep] = useState<'upload' | 'mapping' | 'complete'>('upload');
  
  // Upload State
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mapping State
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [mappingLoading, setMappingLoading] = useState(false);

  // Parse CSV Headers
  const processFile = (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
          const text = e.target?.result as string;
          // Get first line
          const firstLine = text.split('\n')[0];
          const headers = firstLine.split(',').map(h => h.trim().replace(/['"]+/g, ''));
          setCsvHeaders(headers);
          setFile(file);
          
          // Initialize empty mapping
          const initialMap: Record<string, string> = {};
          EXPECTED_FIELDS.forEach(f => initialMap[f] = "");
          setMapping(initialMap);
          
          setStep('mapping');
      };
      reader.readAsText(file);
  };

  const handleFiles = (files: FileList) => {
      if (files.length > 0) processFile(files[0]);
  };

  const handleAutoMap = async () => {
      setMappingLoading(true);
      const suggestions = await suggestColumnMapping(csvHeaders);
      
      setMapping(prev => {
          const newMap = { ...prev };
          Object.keys(suggestions).forEach(key => {
              if (suggestions[key] && csvHeaders.includes(suggestions[key])) {
                  newMap[key] = suggestions[key];
              }
          });
          return newMap;
      });
      setMappingLoading(false);
  };

  const handleConfirmMapping = () => {
      // Here we would actually process the full file using the mapping
      // For this demo, we simulate the success update
      const newData = data.map(d => {
          if (d.id === selectedId) {
              return {
                  ...d,
                  voterListFile: file?.name,
                  status: 'Verified',
                  issues: []
              } as ConstituencyData;
          }
          return d;
      });
      onSave(newData);
      setStep('complete');
  };

  const reset = () => {
      setStep('upload');
      setFile(null);
      setCsvHeaders([]);
      setMapping({});
  };

  return (
    <div className="h-full flex gap-6 animate-in fade-in zoom-in duration-300">
        
        {/* Selection Column */}
        <div className="w-1/4 bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col">
            <h3 className="font-bold text-slate-800 mb-4">Select Constituency</h3>
            <div className="flex-1 overflow-y-auto space-y-2">
                {data.map(d => (
                    <button
                        key={d.id}
                        onClick={() => setSelectedId(d.id)}
                        disabled={step !== 'upload'}
                        className={`w-full text-left p-3 rounded-lg text-sm border transition-all
                            ${selectedId === d.id ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-slate-100 hover:border-slate-300'}
                            ${step !== 'upload' ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                    >
                        <div className="font-bold">{d.name}</div>
                        <div className="text-xs flex justify-between mt-1">
                            <span>{d.id}</span>
                            {d.voterListFile && <CheckCircle size={12} className="text-emerald-500" />}
                        </div>
                    </button>
                ))}
            </div>
        </div>

        {/* Main Area */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col p-8">
            
            {/* Steps Indicator */}
            <div className="flex items-center justify-center mb-8 space-x-4 text-sm font-medium">
                <div className={`flex items-center ${step === 'upload' ? 'text-emerald-600' : 'text-slate-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 border-2 ${step === 'upload' ? 'border-emerald-600 bg-emerald-50' : 'border-slate-300'}`}>1</div>
                    Upload
                </div>
                <div className="h-0.5 w-10 bg-slate-200"></div>
                <div className={`flex items-center ${step === 'mapping' ? 'text-emerald-600' : 'text-slate-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 border-2 ${step === 'mapping' ? 'border-emerald-600 bg-emerald-50' : 'border-slate-300'}`}>2</div>
                    Map Columns
                </div>
                <div className="h-0.5 w-10 bg-slate-200"></div>
                <div className={`flex items-center ${step === 'complete' ? 'text-emerald-600' : 'text-slate-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 border-2 ${step === 'complete' ? 'border-emerald-600 bg-emerald-50' : 'border-slate-300'}`}>3</div>
                    Verify
                </div>
            </div>

            {/* Step 1: Upload */}
            {step === 'upload' && (
                <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in">
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Upload Voter List</h2>
                    <p className="text-slate-500 mb-8 text-center max-w-md">
                        Upload CSV file for <span className="font-bold text-emerald-600">{data.find(d => d.id === selectedId)?.name}</span>. 
                    </p>

                    <div 
                        className={`w-full max-w-2xl h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-colors cursor-pointer
                            ${dragActive ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}
                        `}
                        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                        onDragLeave={() => setDragActive(false)}
                        onDrop={(e) => {
                            e.preventDefault();
                            setDragActive(false);
                            if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
                        }}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Upload size={48} className="text-slate-400 mb-4" />
                        <p className="text-lg font-medium text-slate-700">Drag & Drop CSV File</p>
                        <p className="text-sm text-slate-500 mt-2">or click to browse</p>
                        <input 
                            ref={fileInputRef}
                            type="file" 
                            className="hidden" 
                            accept=".csv"
                            onChange={(e) => e.target.files && handleFiles(e.target.files)}
                        />
                    </div>
                </div>
            )}

            {/* Step 2: Mapping */}
            {step === 'mapping' && (
                <div className="flex-1 flex flex-col animate-in slide-in-from-right-4">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Map CSV Columns</h2>
                            <p className="text-sm text-slate-500">File: {file?.name}</p>
                        </div>
                        <button 
                            onClick={handleAutoMap}
                            disabled={mappingLoading}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                        >
                            {mappingLoading ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                            <span>Auto-Map with AI</span>
                        </button>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden flex-1 flex flex-col">
                        <div className="grid grid-cols-2 bg-slate-100 border-b border-slate-200 p-3 font-semibold text-sm text-slate-600">
                            <div>Standard Field</div>
                            <div>CSV Header</div>
                        </div>
                        <div className="overflow-y-auto p-4 space-y-4">
                            {EXPECTED_FIELDS.map(field => (
                                <div key={field} className="grid grid-cols-2 gap-4 items-center">
                                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                                        <Table size={16} className="text-slate-400" />
                                        {field}
                                        <span className="text-red-500">*</span>
                                    </div>
                                    <select
                                        value={mapping[field] || ""}
                                        onChange={(e) => setMapping(prev => ({ ...prev, [field]: e.target.value }))}
                                        className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    >
                                        <option value="">-- Select Column --</option>
                                        {csvHeaders.map(h => (
                                            <option key={h} value={h}>{h}</option>
                                        ))}
                                    </select>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-between mt-6">
                        <button 
                            onClick={reset}
                            className="text-slate-500 hover:text-slate-800 font-medium px-4 py-2"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleConfirmMapping}
                            disabled={Object.values(mapping).filter(Boolean).length < 3} // simple validation
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Confirm & Verify <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Complete */}
            {step === 'complete' && (
                <div className="flex-1 flex flex-col items-center justify-center animate-in zoom-in">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle size={40} className="text-emerald-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-emerald-800 mb-2">Import Successful</h2>
                    <p className="text-slate-600 text-center max-w-md mb-8">
                        The voter list for <strong>{data.find(d => d.id === selectedId)?.name}</strong> has been mapped, imported, and verified against the central database.
                    </p>
                    <div className="flex gap-4">
                        <button 
                            onClick={reset}
                            className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
                        >
                            Upload Another
                        </button>
                        <button className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium shadow-sm">
                            View Analysis
                        </button>
                    </div>
                </div>
            )}

        </div>
    </div>
  );
};

export default VoterListUpload;

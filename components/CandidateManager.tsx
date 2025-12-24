import React, { useState } from 'react';
import { ConstituencyData, Candidate, Front } from '../types';
import { Search, Plus, Trash2, Edit2, User } from 'lucide-react';

interface CandidateManagerProps {
  data: ConstituencyData[];
  onSave: (newData: ConstituencyData[]) => void;
}

const CandidateManager: React.FC<CandidateManagerProps> = ({ data, onSave }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConstituencyId, setSelectedConstituencyId] = useState<string>(data[0]?.id || '');

  const selectedConstituency = data.find(d => d.id === selectedConstituencyId);

  const handleAddCandidate = () => {
      if (!selectedConstituency) return;
      
      const newCandidate: Candidate = {
          id: Date.now().toString(),
          name: "New Candidate",
          front: 'UDF',
          partyName: 'INC'
      };

      const updatedConstituency = {
          ...selectedConstituency,
          candidates: [...selectedConstituency.candidates, newCandidate]
      };

      const newData = data.map(d => d.id === selectedConstituencyId ? updatedConstituency : d);
      onSave(newData);
  };

  const updateCandidate = (candidateId: string, field: keyof Candidate, value: string) => {
      if (!selectedConstituency) return;
      const updatedCandidates = selectedConstituency.candidates.map(c => 
          c.id === candidateId ? { ...c, [field]: value } : c
      );
      
      const newData = data.map(d => d.id === selectedConstituencyId ? { ...selectedConstituency, candidates: updatedCandidates } : d);
      onSave(newData);
  };

  const filteredConstituencies = data.filter(d => 
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      d.district.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-full gap-6 animate-in fade-in zoom-in duration-300">
      
      {/* Sidebar List of Constituencies */}
      <div className="w-1/3 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search 140 Seats..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-y-auto flex-1 p-2 space-y-1">
          {filteredConstituencies.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedConstituencyId(c.id)}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-colors flex justify-between items-center
                ${selectedConstituencyId === c.id ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'hover:bg-slate-50 text-slate-700'}
              `}
            >
              <span className="font-medium">{c.id} - {c.name}</span>
              <span className="text-xs text-slate-400">{c.district}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: Candidates Table */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
           <div>
             <h2 className="text-xl font-bold text-slate-800">{selectedConstituency?.name}</h2>
             <p className="text-sm text-slate-500">Managing Candidate List</p>
           </div>
           <button 
             onClick={handleAddCandidate}
             className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
           >
             <Plus size={18} />
             <span>Add Candidate</span>
           </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {selectedConstituency?.candidates.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <User size={48} className="mx-auto mb-4 opacity-50" />
              <p>No candidates listed yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedConstituency?.candidates.map(candidate => (
                <div key={candidate.id} className="flex items-center gap-4 p-4 border border-slate-200 rounded-lg bg-white shadow-sm">
                   <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white
                     ${candidate.front === 'UDF' ? 'bg-emerald-500' : candidate.front === 'LDF' ? 'bg-red-500' : 'bg-orange-400'}
                   `}>
                     {candidate.front[0]}
                   </div>
                   
                   <div className="flex-1 grid grid-cols-3 gap-4">
                     <div>
                       <label className="text-xs text-slate-400 font-medium">Name</label>
                       <input 
                         className="w-full font-medium text-slate-900 border-b border-transparent focus:border-emerald-500 focus:outline-none"
                         value={candidate.name}
                         onChange={(e) => updateCandidate(candidate.id, 'name', e.target.value)}
                       />
                     </div>
                     <div>
                       <label className="text-xs text-slate-400 font-medium">Front</label>
                       <select 
                         className="w-full text-sm text-slate-700 border-b border-transparent focus:border-emerald-500 focus:outline-none bg-transparent"
                         value={candidate.front}
                         onChange={(e) => updateCandidate(candidate.id, 'front', e.target.value as Front)}
                       >
                         <option value="UDF">UDF</option>
                         <option value="LDF">LDF</option>
                         <option value="NDA">NDA</option>
                         <option value="OTHER">Other</option>
                       </select>
                     </div>
                     <div>
                       <label className="text-xs text-slate-400 font-medium">Party</label>
                       <input 
                         className="w-full text-sm text-slate-600 border-b border-transparent focus:border-emerald-500 focus:outline-none"
                         value={candidate.partyName}
                         onChange={(e) => updateCandidate(candidate.id, 'partyName', e.target.value)}
                       />
                     </div>
                   </div>

                   <button className="p-2 text-slate-400 hover:text-red-600 transition-colors">
                     <Trash2 size={18} />
                   </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default CandidateManager;

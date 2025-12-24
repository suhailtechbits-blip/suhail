
import React from 'react';
import { Users, Search, Filter, Plus } from 'lucide-react';

const VolunteerManager: React.FC = () => {
    return (
        <div className="h-full flex flex-col animate-in fade-in">
             <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Users className="text-emerald-600"/> Volunteer Force</h2>
                    <p className="text-sm text-slate-500">Assign roles and manage booth agents.</p>
                </div>
                <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium flex items-center gap-2"><Plus size={16}/> Add Volunteer</button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 p-6 flex items-center justify-center text-slate-400 flex-col">
                <Users size={48} className="mb-4 opacity-20"/>
                <p>Volunteer Grid View coming soon.</p>
                <p className="text-sm">Will support Ward tagging and Role assignment.</p>
            </div>
        </div>
    );
};
export default VolunteerManager;


import React, { useState } from 'react';
import { PublicIssue } from '../types';
import { AlertTriangle, CheckCircle, Clock, Filter, MapPin } from 'lucide-react';

const IssueTracker: React.FC = () => {
    const [issues, setIssues] = useState<PublicIssue[]>([
        { id: '1', type: 'Water', description: 'No drinking water at Booth 12.', location: 'Booth 12, Govt High School', status: 'Pending', timestamp: new Date(), isFeedback: false },
        { id: '2', type: 'Electricity', description: 'Power failure near polling station.', location: 'Ward 4, Kannur', status: 'In Progress', timestamp: new Date(), isFeedback: false },
        { id: '3', type: 'Other', description: 'Opposition party campaigning inside 100m radius.', location: 'Booth 8, Thrissur', status: 'Pending', timestamp: new Date(), isFeedback: false },
        { id: '4', type: 'Road', description: 'Road blocked by fallen tree.', location: 'Access Road, Palakkad', status: 'Resolved', timestamp: new Date(), isFeedback: false },
    ]);

    const updateStatus = (id: string, status: PublicIssue['status']) => {
        setIssues(prev => prev.map(i => i.id === id ? { ...i, status } : i));
    };

    return (
        <div className="h-full flex flex-col animate-in fade-in">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><AlertTriangle className="text-orange-500"/> Issue Tracker</h2>
                    <p className="text-sm text-slate-500">Manage public reports and operational blockers.</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium flex items-center gap-2"><Filter size={16}/> Filter</button>
                    <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium">Export Report</button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 overflow-hidden flex flex-col">
                <div className="overflow-y-auto flex-1">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                            <tr>
                                <th className="p-4">Type</th>
                                <th className="p-4">Description</th>
                                <th className="p-4">Location</th>
                                <th className="p-4">Time</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {issues.map(issue => (
                                <tr key={issue.id} className="hover:bg-slate-50">
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                                            issue.type === 'Other' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                                        }`}>
                                            {issue.type}
                                        </span>
                                    </td>
                                    <td className="p-4 font-medium text-slate-800">{issue.description}</td>
                                    <td className="p-4 text-slate-500 flex items-center gap-1"><MapPin size={14}/> {issue.location}</td>
                                    <td className="p-4 text-slate-500">10:00 AM</td>
                                    <td className="p-4">
                                        <span className={`flex items-center gap-1 text-xs font-bold ${
                                            issue.status === 'Resolved' ? 'text-green-600' :
                                            issue.status === 'In Progress' ? 'text-blue-600' : 'text-orange-600'
                                        }`}>
                                            {issue.status === 'Resolved' ? <CheckCircle size={14}/> : <Clock size={14}/>}
                                            {issue.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <select 
                                            value={issue.status}
                                            onChange={(e) => updateStatus(issue.id, e.target.value as any)}
                                            className="text-xs border border-slate-300 rounded p-1"
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Resolved">Resolved</option>
                                        </select>
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
export default IssueTracker;

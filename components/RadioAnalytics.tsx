
import React, { useState, useEffect } from 'react';
import { RadioAnalyticsEvent, RadioAnalyticsSummary } from '../types';
import { analyzeRadioEvents } from '../services/gemini';
import { 
    Activity, Users, Clock, Globe, Smartphone, 
    BarChart3, Loader2, Calendar, TrendingUp,
    Play, MessageSquare, AlertCircle, PieChart
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, PieChart as RePieChart, Pie } from 'recharts';

const MOCK_EVENTS: RadioAnalyticsEvent[] = [
    { event: 'stream_start', timestamp: new Date().toISOString(), user_id: 'user-1', session_id: 'sess-1', bulletin_id: '2026-05-10-MORNING', device: 'android', country: 'IN' },
    { event: 'heartbeat', timestamp: new Date().toISOString(), user_id: 'user-1', session_id: 'sess-1', bulletin_id: '2026-05-10-MORNING', device: 'android', country: 'IN', seconds_played: 60 },
    { event: 'stream_start', timestamp: new Date().toISOString(), user_id: 'user-2', session_id: 'sess-2', bulletin_id: '2026-05-10-MORNING', device: 'ios', country: 'AE' },
    { event: 'heartbeat', timestamp: new Date().toISOString(), user_id: 'user-2', session_id: 'sess-2', bulletin_id: '2026-05-10-MORNING', device: 'ios', country: 'AE', seconds_played: 120 },
    { event: 'stream_stop', timestamp: new Date().toISOString(), user_id: 'user-2', session_id: 'sess-2', bulletin_id: '2026-05-10-MORNING', device: 'ios', country: 'AE', seconds_played: 180 }
];

const RadioAnalytics: React.FC = () => {
    const [summary, setSummary] = useState<RadioAnalyticsSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSummary = async () => {
            setIsLoading(true);
            const res = await analyzeRadioEvents(MOCK_EVENTS);
            setSummary(res);
            setIsLoading(false);
        };
        fetchSummary();
    }, []);

    if (isLoading) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4">
                <Loader2 size={48} className="animate-spin text-indigo-600" />
                <h3 className="text-xl font-bold text-slate-800 uppercase tracking-widest">Edvin Analyst Processing...</h3>
                <p className="text-sm">Calculating listener engagement & global heatmaps.</p>
            </div>
        );
    }

    if (!summary) return null;

    return (
        <div className="h-full flex flex-col gap-6 animate-in fade-in duration-500 overflow-hidden custom-scrollbar overflow-y-auto">
            
            {/* Header Dashboard */}
            <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-8">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3 uppercase">
                        <TrendingUp size={32} className="text-indigo-600" />
                        Radio Analytics
                    </h2>
                    <p className="text-slate-500 text-sm font-medium">Listening data from {summary.range.from} to {summary.range.to}</p>
                </div>
                <div className="flex gap-4">
                     <div className="bg-emerald-50 px-6 py-4 rounded-[24px] border border-emerald-100 text-center">
                        <div className="text-2xl font-black text-emerald-600">{summary.live_now}</div>
                        <div className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Live Now</div>
                     </div>
                     <div className="bg-indigo-50 px-6 py-4 rounded-[24px] border border-indigo-100 text-center">
                        <div className="text-2xl font-black text-indigo-600">{summary.total_listens}</div>
                        <div className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Total Listens</div>
                     </div>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600"><Users size={20}/></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unique Fans</span>
                    </div>
                    <div className="text-2xl font-black text-slate-900">{summary.unique_listeners}</div>
                    <div className="text-[10px] text-slate-400 mt-1">Verified devices</div>
                </div>
                <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-50 rounded-xl text-blue-600"><Clock size={20}/></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Air Time</span>
                    </div>
                    <div className="text-2xl font-black text-slate-900">{(summary.total_play_time_seconds / 60).toFixed(1)}m</div>
                    <div className="text-[10px] text-slate-400 mt-1">Total minutes served</div>
                </div>
                <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-amber-50 rounded-xl text-amber-600"><BarChart3 size={20}/></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Session</span>
                    </div>
                    <div className="text-2xl font-black text-slate-900">{summary.avg_listen_time_seconds.toFixed(0)}s</div>
                    <div className="text-[10px] text-slate-400 mt-1">Engagement per user</div>
                </div>
                <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600"><Globe size={20}/></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Reach</span>
                    </div>
                    <div className="text-2xl font-black text-slate-900">{summary.top_countries.length}</div>
                    <div className="text-[10px] text-slate-400 mt-1">Countries active</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0">
                
                {/* Device & Geography Charts */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-2">
                             <BarChart3 size={16} className="text-indigo-600" /> Geography Heatmap
                        </h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={summary.top_countries}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="country" axisLine={false} tickLine={false} fontSize={10} fontVariant="bold" />
                                    <YAxis axisLine={false} tickLine={false} fontSize={10} />
                                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                                    <Bar dataKey="listens" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-2">
                             <Play size={16} className="text-emerald-600" /> Bulletin Performance
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                    <tr>
                                        <th className="p-4 rounded-l-2xl">Bulletin ID</th>
                                        <th className="p-4">Listens</th>
                                        <th className="p-4">Unique Users</th>
                                        <th className="p-4 rounded-r-2xl">Play Time</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm font-bold text-slate-700 divide-y divide-slate-50">
                                    {summary.bulletins.map(b => (
                                        <tr key={b.bulletin_id} className="hover:bg-slate-50 transition-colors">
                                            <td className="p-4 text-indigo-600">{b.bulletin_id}</td>
                                            <td className="p-4">{b.listens}</td>
                                            <td className="p-4">{b.unique_listeners}</td>
                                            <td className="p-4">{(b.play_time_seconds / 60).toFixed(1)}m</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* AI Notes & Devices */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-slate-900 text-white p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-5"><MessageSquare size={120} /></div>
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-6 flex items-center gap-2">
                            <Activity size={14} /> Analyst Insights
                        </h3>
                        <div className="space-y-4 relative z-10">
                            {summary.notes.map((note, i) => (
                                <div key={i} className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 italic text-slate-300 text-xs leading-relaxed">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                    {note}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6">Device Distribution</h3>
                        <div className="h-48 w-full flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <RePieChart>
                                    <Pie data={summary.top_devices} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="listens">
                                        <Cell fill="#4f46e5" /><Cell fill="#10b981" /><Cell fill="#f59e0b" />
                                    </Pie>
                                    <Tooltip />
                                </RePieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="space-y-2 mt-4">
                            {summary.top_devices.map((d, i) => (
                                <div key={i} className="flex justify-between items-center text-xs font-bold text-slate-600">
                                    <span className="capitalize">{d.device}</span>
                                    <span className="text-slate-400">{d.listens} hits</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default RadioAnalytics;


import React, { useState } from 'react';
import { Language, PublicIssue, MediaItem } from '../types';
import { CheckCircle, AlertTriangle, MessageSquare, Image, ShieldCheck, Camera, MapPin, Send, ThumbsUp, X, Languages } from 'lucide-react';

interface PublicConnectProps {
    lang: Language;
    setLang: (l: Language) => void;
}

const PublicConnect: React.FC<PublicConnectProps> = ({ lang, setLang }) => {
    const [view, setView] = useState<'home' | 'report' | 'facts' | 'gallery'>('home');
    const [hasVoted, setHasVoted] = useState(false);
    
    // Reporting State
    const [issueType, setIssueType] = useState<PublicIssue['type']>('Road');
    const [desc, setDesc] = useState('');
    const [submitted, setSubmitted] = useState(false);

    // Mock Data
    const updates: MediaItem[] = [
        { id: '1', type: 'FactCheck', title: 'Fake news about Booth 12', content: 'There is NO change in booth location for Ward 4. Do not believe WhatsApp forwards.', timestamp: new Date() },
        { id: '2', type: 'Update', title: 'Candidate Rally Today', content: 'Join us at 4 PM at Town Hall.', timestamp: new Date() }
    ];

    const handleSubmitIssue = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
        setTimeout(() => {
            setSubmitted(false);
            setView('home');
            setDesc('');
        }, 2000);
    };

    const t = {
        title: lang === 'en' ? 'UDF Citizen Connect' : 'യു.ഡി.എഫ് സിറ്റിസൺ കണക്ട്',
        subtitle: lang === 'en' ? 'Official Voter Engagement App' : 'ഔദ്യോഗിക വോട്ടർ സേവന ആപ്പ്',
        iVoted: lang === 'en' ? 'I Voted' : 'ഞാൻ വോട്ട് ചെയ്തു',
        reportIssue: lang === 'en' ? 'Report Issue' : 'പരാതി നൽകാം',
        factCheck: lang === 'en' ? 'Fact Check' : 'വസ്തുതാ പരിശോധന',
        gallery: lang === 'en' ? 'Gallery' : 'ഗാലറി',
        submit: lang === 'en' ? 'Submit Report' : 'സമർപ്പിക്കുക',
        placeholder: lang === 'en' ? 'Describe the issue...' : 'പ്രശ്നം വിശദീകരിക്കുക...',
        thankYou: lang === 'en' ? 'Thank you! We are on it.' : 'നന്ദി! ഞങ്ങൾ ഉടൻ ഇടപെടു.',
        votedMsg: lang === 'en' ? 'Thank you for exercising your right!' : 'ജനാധിപത്യ കടമ നിർവഹിച്ചതിന് നന്ദി!'
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
            {/* Mobile Header */}
            <header className="bg-emerald-700 text-white p-4 shadow-md sticky top-0 z-50 flex justify-between items-center">
                <div>
                    <h1 className="font-bold text-lg">{t.title}</h1>
                    <p className="text-xs text-emerald-200">{t.subtitle}</p>
                </div>
                <button onClick={() => setLang(lang === 'en' ? 'ml' : 'en')} className="p-2 bg-white/20 rounded-full">
                    <Languages size={20} />
                </button>
            </header>

            <main className="flex-1 p-4 max-w-md mx-auto w-full">
                
                {/* HOME VIEW */}
                {view === 'home' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                        
                        {/* I Voted Card */}
                        <div className={`p-6 rounded-2xl shadow-lg text-center transition-all ${hasVoted ? 'bg-emerald-100 border-2 border-emerald-500' : 'bg-white border border-slate-200'}`}>
                            {hasVoted ? (
                                <div className="flex flex-col items-center">
                                    <CheckCircle size={48} className="text-emerald-600 mb-2" />
                                    <h2 className="text-xl font-bold text-emerald-800">{t.iVoted}</h2>
                                    <p className="text-sm text-emerald-600">{t.votedMsg}</p>
                                </div>
                            ) : (
                                <button onClick={() => setHasVoted(true)} className="w-full flex flex-col items-center group">
                                    <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform">
                                        <ThumbsUp size={32} />
                                    </div>
                                    <h2 className="text-lg font-bold text-slate-800">Tap if you Voted today</h2>
                                    <p className="text-xs text-slate-500">വോട്ട് രേഖപ്പെടുത്തിയവർ ഇവിടെ അമർത്തുക</p>
                                </button>
                            )}
                        </div>

                        {/* Menu Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={() => setView('report')} className="p-4 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col items-center hover:bg-slate-50">
                                <AlertTriangle className="text-orange-500 mb-2" size={28} />
                                <span className="font-medium text-slate-800">{t.reportIssue}</span>
                            </button>
                            <button onClick={() => setView('facts')} className="p-4 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col items-center hover:bg-slate-50">
                                <ShieldCheck className="text-blue-500 mb-2" size={28} />
                                <span className="font-medium text-slate-800">{t.factCheck}</span>
                            </button>
                            <button onClick={() => setView('gallery')} className="p-4 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col items-center hover:bg-slate-50">
                                <Image className="text-purple-500 mb-2" size={28} />
                                <span className="font-medium text-slate-800">{t.gallery}</span>
                            </button>
                             <button className="p-4 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col items-center hover:bg-slate-50">
                                <MessageSquare className="text-green-500 mb-2" size={28} />
                                <span className="font-medium text-slate-800">Feedback</span>
                            </button>
                        </div>

                        {/* Live Feed */}
                        <div className="mt-6">
                            <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2"><div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div> Live Updates</h3>
                            <div className="space-y-3">
                                {updates.map(u => (
                                    <div key={u.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${u.type === 'FactCheck' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                                {u.type}
                                            </span>
                                            <span className="text-[10px] text-slate-400">2m ago</span>
                                        </div>
                                        <h4 className="font-bold text-slate-800">{u.title}</h4>
                                        <p className="text-sm text-slate-600 mt-1">{u.content}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* REPORT VIEW */}
                {view === 'report' && (
                    <div className="animate-in slide-in-from-right">
                        <button onClick={() => setView('home')} className="mb-4 text-slate-500 flex items-center gap-1"><X size={16}/> Back</button>
                        <h2 className="text-xl font-bold text-slate-800 mb-4">{t.reportIssue}</h2>
                        
                        {submitted ? (
                            <div className="bg-green-100 text-green-800 p-6 rounded-xl text-center">
                                <CheckCircle size={40} className="mx-auto mb-2"/>
                                <p className="font-bold">{t.thankYou}</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmitIssue} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                                    <div className="flex gap-2 overflow-x-auto pb-2">
                                        {['Road', 'Water', 'Electricity', 'Sanitation', 'Other'].map((type) => (
                                            <button 
                                                type="button"
                                                key={type}
                                                onClick={() => setIssueType(type as any)}
                                                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${issueType === type ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'}`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Details</label>
                                    <textarea 
                                        rows={4} 
                                        value={desc}
                                        onChange={(e) => setDesc(e.target.value)}
                                        className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                                        placeholder={t.placeholder}
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <button type="button" className="flex-1 py-3 border border-slate-300 rounded-xl flex items-center justify-center text-slate-600 gap-2">
                                        <Camera size={20} /> Add Photo
                                    </button>
                                    <button type="button" className="flex-1 py-3 border border-slate-300 rounded-xl flex items-center justify-center text-slate-600 gap-2">
                                        <MapPin size={20} /> Location
                                    </button>
                                </div>

                                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2">
                                    <Send size={20} /> {t.submit}
                                </button>
                            </form>
                        )}
                    </div>
                )}

                {/* FACTS VIEW */}
                {view === 'facts' && (
                    <div className="animate-in slide-in-from-right">
                         <button onClick={() => setView('home')} className="mb-4 text-slate-500 flex items-center gap-1"><X size={16}/> Back</button>
                         <h2 className="text-xl font-bold text-slate-800 mb-4">{t.factCheck}</h2>
                         <div className="space-y-4">
                             <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                                 <h3 className="font-bold text-red-800 flex items-center gap-2"><ShieldCheck size={18}/> Official Clarification</h3>
                                 <p className="text-sm text-slate-700 mt-2">Rumors regarding booth capturing in Ward 10 are FALSE. Police have confirmed peaceful polling.</p>
                                 <button className="mt-3 text-xs bg-red-200 text-red-800 px-3 py-1 rounded-full font-bold">Share Verification</button>
                             </div>
                             <div className="bg-white p-4 rounded-xl border border-slate-200">
                                 <h3 className="font-bold text-slate-800">UDF Official Statement</h3>
                                 <p className="text-sm text-slate-600 mt-1">Regarding the water shortage issue in Colony No. 4...</p>
                             </div>
                         </div>
                    </div>
                )}

                {/* GALLERY VIEW */}
                {view === 'gallery' && (
                    <div className="animate-in slide-in-from-right">
                         <button onClick={() => setView('home')} className="mb-4 text-slate-500 flex items-center gap-1"><X size={16}/> Back</button>
                         <h2 className="text-xl font-bold text-slate-800 mb-4">{t.gallery}</h2>
                         <div className="grid grid-cols-2 gap-2">
                             {[1,2,3,4].map(i => (
                                 <div key={i} className="aspect-square bg-slate-200 rounded-lg flex items-center justify-center text-slate-400">
                                     <Image size={32} />
                                 </div>
                             ))}
                         </div>
                    </div>
                )}
            </main>
             <div className="p-4 text-center text-slate-400 text-xs bg-slate-50 mt-auto">
                &copy; 2026 UDF Digital Wing.
            </div>
        </div>
    );
};

export default PublicConnect;


import React, { useState } from 'react';
import { Megaphone, Plus, ShieldCheck, Share2, Copy, Check, Image as ImageIcon, RefreshCw, Radio, Volume2, Download, Loader2, AlertTriangle } from 'lucide-react';
import { generateSpeech, fetchSpeechBlob, downloadAudio } from '../services/gemini';
// Import global MediaItem type
import { MediaItem } from '../types';

const MediaCenter: React.FC = () => {
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [isPlayingSpeech, setIsPlayingSpeech] = useState<string | null>(null);
    const [isDownloading, setIsDownloading] = useState<string | null>(null);

    const mediaItems: MediaItem[] = [
        { 
            id: 'fc-sreeni-health', 
            type: 'FactCheck', 
            title: 'ശ്രീനിവാസന്റെ ആരോഗ്യത്തെക്കുറിച്ചുള്ള വ്യാജ വാർത്തകൾ പ്രചരിപ്പിക്കരുത്', 
            content: 'നടൻ ശ്രീനിവാസന്റെ മരണ വാർത്തയുമായി ബന്ധപ്പെട്ട് സോഷ്യൽ മീഡിയയിൽ പ്രചരിക്കുന്ന ഓഡിയോ ക്ലിപ്പുകളും ബാനറുകളും പൂർണ്ണമായും വ്യാജമാണ് (FAKE). അദ്ദേഹം ഇപ്പോൾ ആരോഗ്യവാനായി കൊച്ചിയിലുണ്ട്. ദയവായി ഇത്തരം വാർത്തകൾ പങ്കുവെക്കാതിരിക്കുക.' 
        },
        { 
            id: 'fc1', 
            type: 'FactCheck', 
            title: 'CLARIFICATION: Ward 10 Booths', 
            content: 'No polling booth changes in Ward 10. The circulated PDF claiming changes is fake. All booths remain at Govt HS.' 
        },
        { 
            id: 'up1', 
            type: 'Update', 
            title: 'RALLY UPDATE', 
            content: 'UDF State Leader arrival at Town Hall delayed by 15 mins. New time: 4:30 PM. Join us!' 
        },
        {
            id: 'ps1',
            type: 'Poster',
            title: 'Vote for Progress',
            content: 'Official UDF 2026 Campaign Poster #1',
            imageUrl: 'https://images.unsplash.com/photo-1540910419892-f3171788bc45?auto=format&fit=crop&q=80&w=400'
        }
    ];

    const handleShare = async (item: MediaItem, platform: 'whatsapp' | 'social') => {
        const headingMap = {
            'FactCheck': '🛡️ *OFFICIAL UDF FACT-CHECK*',
            'Update': '📡 *UDF LIVE UPDATE*',
            'Poster': '🎨 *UDF CAMPAIGN RESOURCE*'
        };
        const shareText = `${headingMap[item.type] || '📢 *OFFICIAL BROADCAST*'}\n\n*${item.title}*\n\n${item.content}`;
        if (platform === 'whatsapp') {
            window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
        } else {
            await navigator.clipboard.writeText(shareText);
            setCopiedId(item.id);
            setTimeout(() => setCopiedId(null), 2000);
        }
    };

    const handleSpeak = async (item: MediaItem) => {
        setIsPlayingSpeech(item.id);
        try {
            await generateSpeech(`${item.title}. ${item.content}`);
        } finally {
            setIsPlayingSpeech(null);
        }
    };

    const handleDownloadAudio = async (item: MediaItem) => {
      setIsDownloading(item.id);
      try {
        const blob = await fetchSpeechBlob(`${item.title}. ${item.content}`);
        downloadAudio(blob, `media_${item.id}.wav`);
      } finally {
        setIsDownloading(null);
      }
    };

    return (
         <div className="h-full flex flex-col animate-in fade-in gap-6">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Megaphone className="text-blue-600"/> Media Center</h2>
                    <p className="text-sm text-slate-500">Official updates and fact-checks.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                    <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-50 pb-4 flex items-center gap-2">
                        <ShieldCheck size={18} className="text-red-600" /> Fact Checks
                    </h3>
                    <div className="space-y-4 flex-1">
                         {mediaItems.filter(i => i.type === 'FactCheck').map(item => (
                             <div key={item.id} className={`p-4 rounded-xl border ${item.id === 'fc-sreeni-health' ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-100'}`}>
                                 <div className="flex items-center gap-2 mb-2">
                                    {item.id === 'fc-sreeni-health' && <AlertTriangle size={16} className="text-amber-600" />}
                                    <h4 className="font-bold text-slate-900">{item.title}</h4>
                                 </div>
                                 <p className="text-sm text-slate-700 mb-3 leading-relaxed">{item.content}</p>
                                 <div className="flex gap-2">
                                     <button onClick={() => handleSpeak(item)} className={`p-2 rounded-lg transition-all ${isPlayingSpeech === item.id ? 'bg-red-600 text-white animate-pulse' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}><Volume2 size={16}/></button>
                                     <button onClick={() => handleDownloadAudio(item)} disabled={isDownloading === item.id} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all border border-red-200">
                                         {isDownloading === item.id ? <Loader2 size={16} className="animate-spin"/> : <Download size={16}/>}
                                     </button>
                                     <button onClick={() => handleShare(item, 'whatsapp')} className="flex-1 bg-[#25D366] text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2">SHARE</button>
                                 </div>
                             </div>
                         ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                    <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-50 pb-4">Live Broadcasts</h3>
                     <div className="space-y-4 flex-1">
                         {mediaItems.filter(i => i.type === 'Update').map(item => (
                             <div key={item.id} className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                                 <h4 className="font-bold text-slate-900 mb-1">{item.title}</h4>
                                 <p className="text-sm text-slate-700 mb-3 leading-relaxed">{item.content}</p>
                                 <div className="flex gap-2">
                                     <button onClick={() => handleSpeak(item)} className={`p-2 rounded-lg transition-all ${isPlayingSpeech === item.id ? 'bg-blue-600 text-white animate-pulse' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}><Volume2 size={16}/></button>
                                     <button onClick={() => handleDownloadAudio(item)} disabled={isDownloading === item.id} className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 border border-blue-200">
                                         {isDownloading === item.id ? <Loader2 size={16} className="animate-spin"/> : <Download size={16}/>}
                                     </button>
                                     <button onClick={() => handleShare(item, 'whatsapp')} className="flex-1 bg-[#25D366] text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2">SHARE</button>
                                 </div>
                             </div>
                         ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default MediaCenter;

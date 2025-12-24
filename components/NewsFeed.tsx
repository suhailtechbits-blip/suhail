
import React, { useState, useEffect, useRef } from 'react';
import { NewsItem, Language } from '../types';
import { 
    Newspaper, Share2, Clock, RefreshCw, 
    Volume2, Square, FastForward, CheckCircle, Download, Loader2, Plus, Zap, X as CloseIcon, Send, Megaphone,
    Facebook, Twitter, MessageSquare, Sparkles, Radio
} from 'lucide-react';
import { generateSpeech, stopSpeech, formatShareContent, fetchSpeechBlob, downloadAudio, fetchAIGroundedNews } from '../services/gemini';

const INITIAL_NEWS: NewsItem[] = [
    {
        id: 'n-sreenivasan-fact',
        title: 'നടൻ ശ്രീനിവാസനെതിരെയുള്ള വ്യാജ പ്രചരണങ്ങൾ: യു.ഡി.എഫ് മീഡിയ സെൽ വിശദീകരണം',
        summary: 'മലയാളത്തിന്റെ പ്രിയ നടൻ ശ്രീനിവാസൻ അന്തരിച്ചു എന്ന തരത്തിൽ പ്രചരിക്കുന്ന വാർത്തകളും ഓഡിയോ ക്ലിപ്പുകളും പൂർണ്ണമായും വ്യാജമാണ്. അദ്ദേഹം ആരോഗ്യവാനായി കൊച്ചിയിലെ വസതിയിലുണ്ട്. ഇത്തരം കിംവദന്തികൾ വിശ്വസിക്കരുതെന്ന് ആരാധകരോട് അഭ്യർത്ഥിക്കുന്നു.',
        source: 'UDF Fact Check Wing',
        category: 'UDF Update',
        timestamp: new Date(),
        url: '#',
        isVerified: true,
        imageUrl: 'https://images.unsplash.com/photo-1540910419892-f3171788bc45?auto=format&fit=crop&q=80&w=800'
    },
    {
        id: 'udf-lead-gen-1',
        title: 'സംസ്ഥാനത്ത് യു.ഡി.എഫ് മുന്നേറ്റം: താഴെത്തട്ടിൽ വൻ തയ്യാറെടുപ്പുകൾ',
        summary: 'കേരളത്തിലെ എല്ലാ മണ്ഡലങ്ങളിലും യു.ഡി.എഫ് സ്ഥാനാർത്ഥികൾ പ്രചാരണ രംഗത്ത് സജീവമാണ്. താഴെത്തട്ടിലുള്ള പ്രവർത്തകരുടെ ആവേശം വിജയപ്രതീക്ഷ വർദ്ധിപ്പിക്കുന്നു.',
        source: 'UDF Election Desk',
        category: 'UDF Update',
        timestamp: new Date(Date.now() - 3600000),
        url: '#',
        isVerified: true,
        imageUrl: 'https://images.unsplash.com/photo-1540910419892-f3171788bc45?auto=format&fit=crop&q=80&w=800'
    }
];

interface NewsFeedProps {
    lang: Language;
    appMode: 'admin' | 'user' | 'public' | 'citizen' | 'radio_public';
}

const NewsFeed: React.FC<NewsFeedProps> = ({ lang, appMode }) => {
    const [news, setNews] = useState<NewsItem[]>(INITIAL_NEWS);
    const [filter, setFilter] = useState<string>('All');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isDownloading, setIsDownloading] = useState<string | null>(null);
    const [isPlayingSpeech, setIsPlayingSpeech] = useState<string | null>(null);
    const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
    const [openShareMenu, setOpenShareMenu] = useState<string | null>(null);
    const [isAutoIngesting, setIsAutoIngesting] = useState(appMode === 'admin'); // Only auto-ingest for admin or by default
    const [nextFetchCountdown, setNextFetchCountdown] = useState(10);
    
    // Ticker State
    const [tickerIndex, setTickerIndex] = useState(0);
    const [showAddForm, setShowAddForm] = useState(false);
    
    // Manual Form State
    const [newTitle, setNewTitle] = useState('');
    const [newSummary, setNewSummary] = useState('');
    const [newCategory, setNewCategory] = useState<NewsItem['category']>('UDF Update');

    const categories = ['All', 'Welfare', 'Governance', 'Price Rise', 'Jobs', 'UDF Update'];

    // 10-Second Live Ticker Logic
    useEffect(() => {
        const interval = setInterval(() => {
            setTickerIndex((prev) => (prev + 1) % (news.length || 1));
        }, 3000); 
        return () => clearInterval(interval);
    }, [news]);

    // 10-Second Auto-Ingestion Logic (Admin only or system level)
    useEffect(() => {
        let timer: any;
        if (isAutoIngesting) {
            timer = setInterval(() => {
                setNextFetchCountdown((prev) => {
                    if (prev <= 1) {
                        fetchNewLiveUpdate();
                        return 10;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isAutoIngesting, news]);

    const fetchNewLiveUpdate = async () => {
        setIsRefreshing(true);
        try {
            const randomCat = categories[Math.floor(Math.random() * (categories.length - 1)) + 1];
            const query = `Latest 2026 Kerala Election news ${randomCat} UDF vs LDF Malayalam`;
            const aiText = await fetchAIGroundedNews(query);
            
            const lines = aiText.split('\n').filter(l => l.trim().length > 0);
            const title = lines[0]?.replace(/[#*]/g, '').slice(0, 80) || "തത്സമയ വാർത്താ അപ്‌ഡേറ്റ്";
            const summary = aiText.slice(title.length).trim() || aiText;

            const newItem: NewsItem = {
                id: `live-ai-${Date.now()}`,
                title: title,
                summary: summary,
                source: 'AI Live Grid',
                category: randomCat as any,
                timestamp: new Date(),
                url: '#',
                isVerified: true,
                imageUrl: `https://images.unsplash.com/photo-1540910419892-f3171788bc45?auto=format&fit=crop&q=80&w=800&sig=${Date.now()}`
            };

            setNews(prev => [newItem, ...prev.slice(0, 49)]); 
        } catch (e) {
            console.error("Auto-fetch failed", e);
        } finally {
            setIsRefreshing(false);
        }
    };

    const filteredNews = filter === 'All' 
        ? news 
        : news.filter(n => n.category === filter);

    const handleAddNews = (e: React.FormEvent) => {
        e.preventDefault();
        if (appMode !== 'admin') return;
        if (!newTitle || !newSummary) return;

        const item: NewsItem = {
            id: `manual-${Date.now()}`,
            title: newTitle,
            summary: newSummary,
            source: 'Admin Manual Entry',
            category: newCategory,
            timestamp: new Date(),
            url: '#',
            isVerified: true,
            imageUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800'
        };

        setNews([item, ...news]);
        setNewTitle('');
        setNewSummary('');
        setShowAddForm(false);
    };

    const handleSpeak = async (item: NewsItem) => {
        if (isPlayingSpeech === item.id) {
            stopSpeech();
            setIsPlayingSpeech(null);
            return;
        }
        try {
            setIsPlayingSpeech(item.id);
            const speechText = `${item.title}. ${item.summary}`;
            await generateSpeech(speechText, playbackSpeed);
        } catch (error) {
            setIsPlayingSpeech(null);
        }
    };

    const handleDownloadAudio = async (item: NewsItem) => {
      setIsDownloading(item.id);
      try {
        const blob = await fetchSpeechBlob(`${item.title}. ${item.summary}`);
        downloadAudio(blob, `news_${item.id}.wav`);
      } finally {
        setIsDownloading(null);
      }
    };

    const handleShare = (item: NewsItem, platform: 'whatsapp' | 'facebook' | 'x') => {
        const formattedText = formatShareContent(item.title, item.summary, item.category);
        const encodedText = encodeURIComponent(formattedText);
        const encodedUrl = encodeURIComponent(window.location.origin);
        
        let shareUrl = '';
        switch (platform) {
            case 'whatsapp':
                shareUrl = `https://wa.me/?text=${encodedText}`;
                break;
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
                break;
            case 'x':
                shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
                break;
        }
        
        window.open(shareUrl, '_blank');
        setOpenShareMenu(null);
    };

    return (
        <div className="h-full flex flex-col gap-6 animate-in fade-in">
            
            {/* Live Master Ticker */}
            <div className="bg-slate-950 border-l-4 border-emerald-500 p-5 rounded-[32px] flex flex-col sm:flex-row items-center gap-4 overflow-hidden relative shadow-2xl">
                <div className="flex items-center gap-3 bg-red-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] animate-pulse shrink-0">
                    <Radio size={12} fill="white" className="animate-ping" /> Live Feed
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-white text-base font-bold truncate animate-in slide-in-from-right duration-700" key={tickerIndex}>
                        {news[tickerIndex]?.title}
                    </p>
                </div>
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-1.5 rounded-2xl shrink-0">
                   <Sparkles size={12} className="text-emerald-400" />
                   <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                       {appMode === 'admin' ? `Next AI Pulse: ${nextFetchCountdown}s` : 'AI Grounded News'}
                   </span>
                </div>
            </div>

            {/* Header Area */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-white p-8 rounded-[48px] border border-slate-200 shadow-sm">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-emerald-600 rounded-[28px] flex items-center justify-center text-white shadow-xl shadow-emerald-100">
                        <Megaphone size={32} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter">
                            {lang === 'en' ? 'JANASANDESHAM' : 'ജനസന്ദേശം'}
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                            <p className="text-xs text-slate-400 font-black uppercase tracking-widest">Live News Intake active</p>
                        </div>
                    </div>
                </div>
                
                <div className="flex flex-wrap gap-3 w-full xl:w-auto">
                    {appMode === 'admin' && (
                        <>
                            <button 
                                onClick={() => setIsAutoIngesting(!isAutoIngesting)}
                                className={`flex items-center gap-2 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${isAutoIngesting ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}
                            >
                                <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
                                Auto-Update: {isAutoIngesting ? 'ON' : 'OFF'}
                            </button>
                            <button 
                                onClick={() => setShowAddForm(true)}
                                className="flex items-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl"
                            >
                                <Plus size={16} /> Manual Post
                            </button>
                        </>
                    )}
                    <button 
                        onClick={() => setPlaybackSpeed(prev => (prev === 1.0 ? 1.5 : prev === 1.5 ? 2.0 : 1.0))}
                        className="flex items-center gap-2 px-5 py-4 bg-slate-100 rounded-2xl text-[10px] font-black text-slate-600 hover:bg-slate-200 transition-all border border-slate-200"
                    >
                        <FastForward size={14} /> {playbackSpeed}x
                    </button>
                </div>
            </div>

            {/* News Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 overflow-y-auto pr-4 pb-20 custom-scrollbar">
                {filteredNews.map((item, idx) => (
                    <div 
                        key={item.id} 
                        className={`bg-white rounded-[48px] border border-slate-100 shadow-sm flex flex-col overflow-hidden hover:shadow-2xl transition-all group/card h-fit ${idx === 0 && 'ring-4 ring-emerald-500/20 scale-[1.02]'}`}
                    >
                        <div className="relative aspect-video overflow-hidden bg-slate-100">
                            <img src={item.imageUrl} alt="" className="w-full h-full object-cover group-hover/card:scale-110 duration-[2000ms]" />
                            <div className="absolute top-8 left-8 flex gap-2">
                                <span className="bg-slate-900/90 backdrop-blur-md text-white text-[9px] font-black px-4 py-2 rounded-2xl shadow-lg uppercase tracking-[0.2em]">{item.category}</span>
                            </div>
                        </div>

                        <div className="p-10 flex flex-col flex-1">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-2">
                                    <Sparkles size={12} className="text-indigo-400" /> {item.source}
                                </div>
                            </div>
                            
                            <h3 className="font-black text-slate-900 leading-tight mb-6 text-2xl tracking-tighter group-hover/card:text-indigo-600 transition-colors">
                                {item.title}
                            </h3>
                            
                            <p className="text-sm text-slate-500 line-clamp-4 mb-10 leading-relaxed flex-1 font-medium italic">
                                "{item.summary}"
                            </p>
                            
                            <div className="flex items-center justify-between border-t border-slate-50 pt-8">
                                <div className="flex gap-2 relative">
                                    <button 
                                        onClick={() => handleSpeak(item)}
                                        className={`w-14 h-14 rounded-2xl transition-all flex items-center justify-center ${isPlayingSpeech === item.id ? 'bg-red-600 text-white shadow-xl animate-pulse' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 shadow-inner'}`}
                                        title="Listen"
                                    >
                                        {isPlayingSpeech === item.id ? <Square size={20} fill="currentColor" /> : <Volume2 size={24} />}
                                    </button>
                                </div>
                                
                                <div className="relative">
                                    <button 
                                        onClick={() => setOpenShareMenu(openShareMenu === item.id ? null : item.id)} 
                                        className={`h-14 px-6 rounded-[24px] font-black text-[10px] uppercase tracking-widest transition-all shadow-xl flex items-center gap-2 ${openShareMenu === item.id ? 'bg-slate-900 text-white' : 'bg-emerald-500 text-white hover:bg-emerald-600'}`}
                                    >
                                        <Share2 size={16} /> Share
                                    </button>

                                    {openShareMenu === item.id && (
                                        <div className="absolute bottom-full right-0 mb-6 flex flex-col gap-2 p-3 bg-white rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-100 animate-in slide-in-from-bottom-4 duration-300 z-50 w-48">
                                            <button 
                                                onClick={() => handleShare(item, 'whatsapp')}
                                                className="w-full p-4 rounded-2xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-3 group/btn"
                                            >
                                                <MessageSquare size={18} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">WhatsApp</span>
                                            </button>
                                            <button 
                                                onClick={() => handleShare(item, 'facebook')}
                                                className="w-full p-4 rounded-2xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all flex items-center gap-3 group/btn"
                                            >
                                                <Facebook size={18} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Facebook</span>
                                            </button>
                                            <button 
                                                onClick={() => handleShare(item, 'x')}
                                                className="w-full p-4 rounded-2xl bg-slate-50 text-slate-900 hover:bg-slate-900 hover:text-white transition-all flex items-center gap-3 group/btn"
                                            >
                                                <Twitter size={18} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">X / Twitter</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add News Modal (Admin Only) */}
            {showAddForm && appMode === 'admin' && (
                <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-2xl z-[100] flex items-center justify-center p-4 animate-in fade-in duration-500">
                    <div className="bg-white rounded-[60px] shadow-2xl w-full max-w-xl overflow-hidden border border-white/20 relative">
                        <button onClick={() => setShowAddForm(false)} className="absolute top-10 right-10 text-slate-400 hover:text-slate-900 p-3 hover:bg-slate-100 rounded-full transition-all"><CloseIcon size={24} /></button>
                        
                        <div className="p-16">
                            <div className="flex items-center gap-6 mb-12">
                                <div className="w-20 h-20 bg-indigo-100 rounded-[32px] flex items-center justify-center text-indigo-600">
                                    <Newspaper size={32} />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Broadcast Desk</h3>
                                </div>
                            </div>

                            <form onSubmit={handleAddNews} className="space-y-8">
                                <div className="space-y-3">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-4">Headline News</label>
                                    <input 
                                        autoFocus
                                        value={newTitle}
                                        onChange={(e) => setNewTitle(e.target.value)}
                                        placeholder="Enter headline..."
                                        className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[32px] focus:outline-none focus:border-indigo-500 font-bold text-lg"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-4">Detailed Content</label>
                                    <textarea 
                                        rows={4}
                                        value={newSummary}
                                        onChange={(e) => setNewSummary(e.target.value)}
                                        placeholder="Full story for audio synthesis..."
                                        className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[32px] focus:outline-none focus:border-indigo-500 font-medium leading-relaxed"
                                    />
                                </div>
                                <button 
                                    type="submit"
                                    className="w-full bg-indigo-600 text-white py-6 rounded-[32px] font-black text-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-4 shadow-2xl shadow-indigo-100 group"
                                >
                                    <Send size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> Publish Stream
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default NewsFeed;

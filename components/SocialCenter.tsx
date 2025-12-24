
import React, { useState, useEffect } from 'react';
import { Language, SocialPost, NewsItem } from '../types';
import { 
    Globe, Facebook, Instagram, Twitter, MessageSquare, 
    ShieldCheck, Settings, Play, Pause, RefreshCw, 
    Send, CheckCircle, Clock, AlertTriangle, Zap, 
    MoreHorizontal, Copy, Trash2, Smartphone, 
    Video, Image as ImageIcon, Plus, Sliders,
    ChevronRight, ExternalLink, Activity, LogIn, LogOut, UserCheck, Lock, ShieldAlert, Loader2,
    X, Info, ChevronDown, Check, Volume2, Share2
} from 'lucide-react';
import { generateSpeech } from '../services/gemini';

interface AutomationRule {
    id: string;
    category: string;
    platforms: string[];
    enabled: boolean;
}

interface SocialAccount {
    platform: string;
    username: string;
    isConnected: boolean;
    profilePic?: string;
    lastSynced?: string;
    permissions?: string[];
    tokenStatus?: 'Valid' | 'Expired' | 'Critical';
    profileUrl?: string; 
}

const INITIAL_RULES: AutomationRule[] = [
    { id: 'r1', category: 'Price Rise', platforms: ['Facebook', 'WhatsApp'], enabled: true },
    { id: 'r2', category: 'UDF Update', platforms: ['Facebook', 'Instagram', 'WhatsApp'], enabled: true },
];

const SocialCenter: React.FC<{ lang: Language }> = ({ lang }) => {
    const [isAutoEnabled, setIsAutoEnabled] = useState(true);
    const [rules, setRules] = useState<AutomationRule[]>(INITIAL_RULES);
    const [isPlayingSpeech, setIsPlayingSpeech] = useState<string | null>(null);
    
    // Account Integration State
    const [accounts, setAccounts] = useState<Record<string, SocialAccount>>({
        Facebook: { 
            platform: 'Facebook', 
            username: 'UDF Kerala Official', 
            isConnected: true, 
            profilePic: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop', 
            lastSynced: '10m ago',
            tokenStatus: 'Valid',
            permissions: ['pages_manage_posts', 'pages_read_engagement'],
            profileUrl: 'https://facebook.com/udfkerala'
        },
        Instagram: { 
            platform: 'Instagram', 
            username: 'Not Connected', 
            isConnected: false,
            tokenStatus: 'Expired'
        },
        WhatsApp: { 
            platform: 'WhatsApp', 
            username: 'UDF Broadcaster', 
            isConnected: true, 
            lastSynced: 'Just now',
            tokenStatus: 'Valid',
            profileUrl: 'https://wa.me/910000000000'
        }
    });

    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [loginPlatform, setLoginPlatform] = useState<string | null>(null);
    const [loginStep, setLoginStep] = useState<1 | 2 | 3>(1);
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [selectedMetaPage, setSelectedMetaPage] = useState('UDF Official Hub');

    const [postQueue, setPostQueue] = useState<SocialPost[]>([
        {
            id: 'p1',
            newsId: 'auto-1',
            platform: 'Facebook',
            content: 'സംസ്ഥാനത്ത് പാചകവാതക വില വർദ്ധനവിനെതിരെ പ്രതിഷേധം! #UDF #PriceRise',
            status: 'Scheduled',
            timestamp: new Date(Date.now() + 1800000),
            mediaType: 'image',
            mediaUrl: 'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?auto=format&fit=crop&q=80&w=400'
        },
        {
            id: 'p2',
            newsId: 'auto-2',
            platform: 'Instagram',
            content: 'ജനകീയ പ്രതിരോധ ജാഥ! 🛑 കേരളത്തിന്റെ മുക്കിലും മൂലയിലും യു.ഡി.എഫ് തരംഗം.',
            status: 'Publishing',
            timestamp: new Date(),
            mediaType: 'video',
            mediaUrl: 'https://www.w3schools.com/html/mov_bbb.mp4'
        }
    ]);

    const handleConnectClick = (platform: string) => {
        setLoginPlatform(platform);
        setLoginStep(1);
        setIsLoginModalOpen(true);
    };

    const nextLoginStep = () => {
        setIsAuthenticating(true);
        setTimeout(() => {
            setIsAuthenticating(false);
            setLoginStep((prev) => (prev + 1) as any);
        }, 1500);
    };

    const finalizeLogin = () => {
        if (!loginPlatform) return;
        setIsAuthenticating(true);
        
        setTimeout(() => {
            setAccounts(prev => ({
                ...prev,
                [loginPlatform]: {
                    platform: loginPlatform,
                    username: loginPlatform === 'Instagram' ? `@udf_kerala_2026` : selectedMetaPage,
                    isConnected: true,
                    profilePic: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
                    lastSynced: 'Just now',
                    tokenStatus: 'Valid',
                    permissions: ['instagram_basic', 'instagram_content_publish', 'ads_management'],
                    profileUrl: loginPlatform === 'Instagram' ? 'https://instagram.com/udf_kerala_2026' : 'https://facebook.com/udfofficialhub'
                }
            }));
            setIsAuthenticating(false);
            setIsLoginModalOpen(false);
            setLoginPlatform(null);
            setLoginStep(1);
        }, 2000);
    };

    const handleDisconnect = (platform: string) => {
        setAccounts(prev => ({
            ...prev,
            [platform]: { platform, username: 'Not Connected', isConnected: false }
        }));
    };

    const handleSpeak = async (post: SocialPost) => {
        setIsPlayingSpeech(post.id);
        try {
            await generateSpeech(post.content);
        } catch (error) {
            console.error(error);
        } finally {
            setIsPlayingSpeech(null);
        }
    };

    const handleSharePost = (post: SocialPost) => {
        const heading = `📢 *OFFICIAL UDF BROADCAST* (${post.platform.toUpperCase()})\n\n`;
        const shareText = `${heading}${post.content}\n\n🔗 _Shared via ElectVerify KL Strategic Center_`;
        const waUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
        window.open(waUrl, '_blank');
    };

    return (
        <div className="h-full flex flex-col gap-6 animate-in fade-in">
            {/* Main Command Header */}
            <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm flex flex-col xl:flex-row justify-between items-center gap-8">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-indigo-100">
                        <Globe size={32} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 leading-none mb-2">Social Sync Hub</h2>
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                                <ShieldCheck size={14} /> Meta Graph v18.0 Active
                            </span>
                            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                                <Activity size={14} /> 99.9% Uptime
                            </span>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-3xl border border-slate-100">
                    <button 
                        onClick={() => setIsAutoEnabled(!isAutoEnabled)}
                        className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-xs tracking-widest transition-all ${isAutoEnabled ? 'bg-white text-emerald-600 shadow-sm' : 'bg-transparent text-slate-400'}`}
                    >
                        {isAutoEnabled ? <Play size={16} fill="currentColor" /> : <Pause size={16} fill="currentColor" />}
                        AUTOPILOT: {isAutoEnabled ? 'ON' : 'OFF'}
                    </button>
                    <button className="p-3 text-slate-400 hover:text-indigo-600 transition-colors">
                        <Settings size={20} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
                {/* Account Integration & Rules */}
                <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
                    
                    {/* Meta Health Card */}
                    <div className="bg-indigo-900 text-white p-6 rounded-[32px] shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10"><Zap size={120} /></div>
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-indigo-300 mb-4">Meta Connection Health</h3>
                        <div className="space-y-4 relative z-10">
                            <div className="flex justify-between items-end">
                                <div>
                                    <div className="text-2xl font-bold leading-none">Healthy</div>
                                    <div className="text-[10px] font-bold text-indigo-300 mt-1">TOKEN EXPIRES IN 58 DAYS</div>
                                </div>
                                <div className="p-2 bg-white/10 rounded-xl border border-white/10"><Check size={20} /></div>
                            </div>
                            <div className="w-full bg-white/10 h-1.5 rounded-full">
                                <div className="bg-emerald-400 h-full w-[85%] rounded-full shadow-[0_0_10px_#34d399]"></div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-widest">Linked Identities</h3>
                            <Info size={16} className="text-slate-300 cursor-help" />
                        </div>
                        
                        <div className="space-y-4">
                            {Object.values(accounts).map((acc: SocialAccount) => (
                                <div key={acc.platform} className={`group p-4 rounded-2xl border transition-all ${acc.isConnected ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-100 border-dashed hover:border-indigo-200'}`}>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                {acc.isConnected ? (
                                                    <img src={acc.profilePic} className="w-12 h-12 rounded-2xl border-2 border-white shadow-md object-cover" alt="Profile" />
                                                ) : (
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm ${
                                                        acc.platform === 'Instagram' ? 'bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888]' : 
                                                        acc.platform === 'Facebook' ? 'bg-[#1877F2]' : 'bg-slate-200'
                                                    }`}>
                                                        {acc.platform === 'Instagram' ? <Instagram size={24} /> : <Facebook size={24} />}
                                                    </div>
                                                )}
                                                {acc.isConnected && <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-lg border-2 border-white flex items-center justify-center shadow-sm"><Check size={12} className="text-white" /></div>}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                                                    {acc.platform}
                                                    {acc.tokenStatus === 'Expired' && <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>}
                                                </div>
                                                {acc.isConnected ? (
                                                    <a 
                                                        href={acc.profileUrl} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer" 
                                                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 truncate max-w-[140px]"
                                                    >
                                                        {acc.username} <ExternalLink size={10} />
                                                    </a>
                                                ) : (
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                                        DISCONNECTED
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {acc.isConnected ? (
                                            <button onClick={() => handleDisconnect(acc.platform)} className="opacity-0 group-hover:opacity-100 text-[10px] font-bold text-red-500 bg-red-50 px-2.5 py-1 rounded-lg transition-all">
                                                LOGOUT
                                            </button>
                                        ) : (
                                            <button onClick={() => handleConnectClick(acc.platform)} className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-2 rounded-xl border border-indigo-100 hover:bg-indigo-600 hover:text-white transition-all">
                                                CONNECT
                                            </button>
                                        )}
                                    </div>

                                    {acc.isConnected && (
                                        <div className="mt-3 flex gap-2">
                                            <a 
                                                href={acc.profileUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="flex-1 text-center py-1.5 bg-white border border-slate-200 rounded-lg text-[9px] font-black text-slate-500 hover:bg-slate-50 transition-colors uppercase tracking-widest flex items-center justify-center gap-1.5"
                                            >
                                                Visit Channel <ExternalLink size={10} />
                                            </a>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                             <h4 className="text-[10px] font-black text-amber-700 uppercase flex items-center gap-2 mb-1">
                                <AlertTriangle size={12} /> Instagram Pro Tip
                             </h4>
                             <p className="text-[10px] text-amber-600 leading-tight">
                                To enable automated story posting, ensure your account is linked via a <strong>Facebook Business Page</strong> in your Meta settings.
                             </p>
                        </div>
                    </div>
                </div>

                {/* Posting Queue */}
                <div className="lg:col-span-8 bg-white rounded-[32px] border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                    <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                        <div className="flex items-center gap-4">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                <Activity size={20} className="text-indigo-600" /> Content Queue
                            </h3>
                            <div className="flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-full">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Live Engine</span>
                            </div>
                        </div>
                        <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm">
                            <RefreshCw size={18} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 space-y-6">
                        {postQueue.map(post => {
                            const account = accounts[post.platform];
                            return (
                                <div key={post.id} className="group relative flex flex-col md:flex-row gap-6 p-6 rounded-[32px] border border-slate-100 hover:border-indigo-100 hover:bg-slate-50/50 transition-all">
                                    <div className="w-full md:w-36 aspect-video md:aspect-square bg-slate-100 rounded-2xl overflow-hidden shrink-0 border border-slate-200">
                                        {post.mediaUrl && <img src={post.mediaUrl} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" alt="Media" />}
                                    </div>
                                    <div className="flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex flex-col gap-0.5">
                                                <div className="flex items-center gap-2">
                                                    <div className={`p-1.5 rounded-lg text-white ${post.platform === 'Instagram' ? 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600' : 'bg-blue-600'}`}>
                                                        {post.platform === 'Instagram' ? <Instagram size={14} /> : <Facebook size={14} />}
                                                    </div>
                                                    <span className="text-xs font-bold text-slate-800 uppercase tracking-widest">{post.platform} Broadcast</span>
                                                </div>
                                                {account && (
                                                    <a 
                                                        href={account.profileUrl} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="text-[10px] font-bold text-indigo-500 hover:underline flex items-center gap-1 mt-1 ml-9"
                                                    >
                                                        {account.username} <ExternalLink size={10} />
                                                    </a>
                                                )}
                                            </div>
                                            <span className={`text-[10px] font-black px-3 py-1 rounded-lg border ${
                                                post.status === 'Publishing' ? 'bg-amber-100 text-amber-600 border-amber-200 animate-pulse' : 
                                                post.status === 'Scheduled' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                            }`}>
                                                {post.status.toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="bg-white p-4 rounded-2xl border border-slate-100 mb-4 shadow-sm italic text-slate-600 text-sm">
                                            "{post.content}"
                                        </div>
                                        <div className="flex items-center justify-between mt-auto">
                                            <div className="flex items-center gap-4">
                                                <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5">
                                                    <Clock size={12} /> ETA: {post.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                                <button 
                                                    onClick={() => handleSpeak(post)}
                                                    className={`text-[10px] font-bold flex items-center gap-1.5 transition-colors ${isPlayingSpeech === post.id ? 'text-emerald-600 animate-pulse' : 'text-slate-500 hover:text-emerald-600'}`}
                                                >
                                                    <Volume2 size={12} /> Text to Audio
                                                </button>
                                            </div>
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => handleSharePost(post)}
                                                    className="p-2 text-slate-400 hover:text-emerald-600 transition-colors"
                                                    title="Share with Heading"
                                                >
                                                    <Share2 size={16} />
                                                </button>
                                                <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Edit2 size={16} /></button>
                                                <button className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* INTEGRATION WIZARD MODAL */}
            {isLoginModalOpen && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[200] flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden border border-white/20">
                        {/* Progress Bar */}
                        <div className="flex h-1.5 w-full bg-slate-100">
                            <div className={`h-full bg-indigo-600 transition-all duration-500 ${loginStep === 1 ? 'w-1/3' : loginStep === 2 ? 'w-2/3' : 'w-full'}`}></div>
                        </div>

                        {/* Step 1: Handshake */}
                        {loginStep === 1 && (
                            <div className="p-10 text-center animate-in slide-in-from-right-4">
                                <div className="w-20 h-20 bg-indigo-50 rounded-3xl mx-auto flex items-center justify-center text-indigo-600 mb-6 relative">
                                    <Lock size={32} />
                                    <div className="absolute -top-2 -right-2 bg-emerald-500 text-white p-1 rounded-full border-2 border-white shadow-sm"><ShieldCheck size={14} /></div>
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">Meta Secure Login</h3>
                                <p className="text-slate-500 text-sm mb-8 px-4 leading-relaxed">We will establish a secure connection to the Meta Graph API to manage your {loginPlatform} content.</p>
                                
                                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-left mb-8 space-y-3">
                                    <div className="flex items-center gap-3 text-xs font-bold text-slate-700">
                                        <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center"><Check size={12} /></div>
                                        Encrypted OAuth 2.0 Handshake
                                    </div>
                                    <div className="flex items-center gap-3 text-xs font-bold text-slate-700">
                                        <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center"><Check size={12} /></div>
                                        Read/Write Permissions (Strict Scope)
                                    </div>
                                </div>

                                <button 
                                    onClick={nextLoginStep}
                                    disabled={isAuthenticating}
                                    className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-black text-lg hover:bg-black transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {isAuthenticating ? <Loader2 size={24} className="animate-spin" /> : <><Smartphone size={24} /> Continue with Meta</>}
                                </button>
                            </div>
                        )}

                        {/* Step 2: Account Selection */}
                        {loginStep === 2 && (
                            <div className="p-10 animate-in slide-in-from-right-4">
                                <div className="flex items-center gap-4 mb-8">
                                    <button onClick={() => setLoginStep(1)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><ChevronLeft size={20} /></button>
                                    <h3 className="text-2xl font-bold text-slate-900">Select Identity</h3>
                                </div>
                                
                                <p className="text-sm text-slate-500 mb-6 font-medium">Which Page or Business Profile would you like to use for automated broadcasts?</p>
                                
                                <div className="space-y-3 mb-10">
                                    {['UDF Official Hub', 'Kerala Politics Live', 'Janashakti Media'].map(page => (
                                        <button 
                                            key={page}
                                            onClick={() => setSelectedMetaPage(page)}
                                            className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${selectedMetaPage === page ? 'bg-indigo-50 border-indigo-600 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-300'}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-slate-200 rounded-xl"></div>
                                                <span className="font-bold text-slate-800">{page}</span>
                                            </div>
                                            {selectedMetaPage === page && <div className="w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center"><Check size={12} /></div>}
                                        </button>
                                    ))}
                                </div>

                                <button 
                                    onClick={nextLoginStep}
                                    disabled={isAuthenticating}
                                    className="w-full bg-indigo-600 text-white py-5 rounded-[24px] font-black text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {isAuthenticating ? <Loader2 size={24} className="animate-spin" /> : 'Authorize Selected Profile'}
                                </button>
                            </div>
                        )}

                        {/* Step 3: Confirmation */}
                        {loginStep === 3 && (
                            <div className="p-10 text-center animate-in zoom-in-95">
                                <div className="w-24 h-24 bg-emerald-100 rounded-full mx-auto flex items-center justify-center text-emerald-600 mb-6">
                                    <Check size={48} strokeWidth={3} />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">Integration Complete!</h3>
                                <p className="text-slate-500 text-sm mb-8 leading-relaxed">Your {loginPlatform} profile <strong>{selectedMetaPage}</strong> is now successfully linked to the UDF 2026 Strategy Grid.</p>
                                
                                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-left mb-8 grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <div className="text-[10px] font-black text-slate-400 uppercase">Profile URL</div>
                                        <div className="text-[10px] font-bold text-indigo-600 truncate">
                                            {loginPlatform === 'Instagram' ? 'instagram.com/udf_kerala' : 'facebook.com/udf_official'}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-[10px] font-black text-slate-400 uppercase">Status</div>
                                        <div className="text-[10px] font-bold text-emerald-600">Active & Syncing</div>
                                    </div>
                                </div>

                                <button 
                                    onClick={finalizeLogin}
                                    disabled={isAuthenticating}
                                    className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-black text-lg hover:bg-black transition-all flex items-center justify-center gap-3"
                                >
                                    {isAuthenticating ? <Loader2 size={24} className="animate-spin" /> : 'Enter Social Command'}
                                </button>
                            </div>
                        )}
                        
                        {/* Modal Close */}
                        {!isAuthenticating && (
                            <button onClick={() => setIsLoginModalOpen(false)} className="absolute top-6 right-8 text-slate-400 hover:text-slate-600 p-2"><X size={24} /></button>
                        )}
                    </div>
                </div>
            )}

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
            `}</style>
        </div>
    );
};

// Add missing icon import
const Edit2 = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
);
const ChevronLeft = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m15 18-6-6 6-6"/></svg>
);

export default SocialCenter;

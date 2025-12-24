
import React, { useState } from 'react';
import { ViewState, Language } from '../types';
// Added ExternalLink to imports
import { LayoutDashboard, Users, ShieldCheck, FileText, Menu, X, Upload, Crosshair, TrendingUp, Radio, Share2, Copy, Check, Activity, Megaphone, AlertTriangle, Languages, Newspaper, Globe, Volume2, Mic2, BarChart3, SlidersHorizontal, Link, UserPlus, FileSearch, Zap, Monitor, Smartphone, MessageSquare, ExternalLink } from 'lucide-react';

interface SidebarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  appMode: 'admin' | 'user' | 'public' | 'citizen' | 'radio_public' | 'read_only';
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, isOpen, setIsOpen, lang, setLang, appMode }) => {
  const [showShareHub, setShowShareHub] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const allNavItems = [
    { id: ViewState.DASHBOARD, label: lang === 'en' ? 'Kerala Overview' : 'കേരള അവലോകനം', icon: LayoutDashboard, adminOnly: false },
    { id: ViewState.VIEW_REPORT, label: lang === 'en' ? 'Summary Report' : 'സംഗ്രഹ റിപ്പോർട്ട്', icon: FileSearch, adminOnly: false },
    { id: ViewState.RADIO_MASTER, label: lang === 'en' ? 'UDF Radio Master' : 'UDF റേഡിയോ മാസ്റ്റർ', icon: SlidersHorizontal, adminOnly: true },
    { id: ViewState.RADIO_BROADCAST, label: lang === 'en' ? 'Radio Broadcast' : 'റേഡിയോ ബ്രോഡ്കാസ്റ്റ്', icon: Volume2, adminOnly: false },
    { id: ViewState.AUDIO_BRIEFING, label: lang === 'en' ? 'Voice Tracker' : 'വോയ്‌സ് ട്രാക്കർ', icon: Mic2, adminOnly: false },
    { id: ViewState.RADIO_ANALYTICS, label: lang === 'en' ? 'Radio Analytics' : 'റേഡിയോ അനലിറ്റിക്സ്', icon: BarChart3, adminOnly: false },
    { id: ViewState.NEWS_FEED, label: lang === 'en' ? 'Live News Desk' : 'തത്സമയ വാർത്തകൾ', icon: Newspaper, adminOnly: false },
    { id: ViewState.SOCIAL_CENTER, label: lang === 'en' ? 'Social Command' : 'സോഷ്യൽ കമാൻഡ്', icon: Globe, adminOnly: true },
    { id: ViewState.POLLING_OPS, label: lang === 'en' ? 'Polling Ops (Live)' : 'പോളിംഗ് ഡേ', icon: Activity, adminOnly: false },
    { id: ViewState.ISSUE_TRACKER, label: lang === 'en' ? 'Issue Tracker' : 'പരാതികൾ', icon: AlertTriangle, adminOnly: false },
    { id: ViewState.MEDIA_CENTER, label: lang === 'en' ? 'Media & Fact Check' : 'വാർത്തകൾ', icon: Megaphone, adminOnly: false },
    { id: ViewState.STRATEGY, label: 'War Room 2026', icon: Crosshair, adminOnly: false },
    { id: ViewState.VOLUNTEER_MANAGER, label: lang === 'en' ? 'Volunteer Force' : 'വളണ്ടിയർമാർ', icon: Users, adminOnly: true },
    { id: ViewState.CANDIDATES, label: lang === 'en' ? 'Candidate Manager' : 'സ്ഥാനാർത്ഥികൾ', icon: Users, adminOnly: true },
    { id: ViewState.VOTER_LISTS, label: lang === 'en' ? 'Voter List Upload' : 'വോട്ടർ പട്ടിക', icon: Upload, adminOnly: true },
  ];

  const navItems = allNavItems.filter(item => !item.adminOnly || appMode === 'admin');

  const getFullLink = (mode: string) => {
      const origin = window.location.origin;
      const path = window.location.pathname;
      return `${origin}${path}?mode=${mode}`;
  };

  const handleCopy = (mode: string) => {
      const url = getFullLink(mode);
      navigator.clipboard.writeText(url);
      setCopiedLink(mode);
      setTimeout(() => setCopiedLink(null), 2000);
  };

  return (
    <>
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 bg-emerald-800 text-white rounded-md shadow-lg"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-100 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:block flex flex-col
      `}>
        <div className="p-6 border-b border-slate-700/50 flex items-center space-x-3">
            <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-900/50">
                <Radio size={20} />
            </div>
          <div>
            <h1 className="text-lg font-black tracking-tighter">UDF GRID</h1>
            <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">
                {appMode === 'admin' ? 'Admin Node' : appMode === 'read_only' ? 'Guest Access' : 'Voter Console'}
            </p>
          </div>
        </div>

        <div className="px-4 py-4">
             <button 
                onClick={() => setLang(lang === 'en' ? 'ml' : 'en')}
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-2xl text-xs text-slate-300 hover:text-white transition-all"
             >
                 <span className="flex items-center gap-2 font-bold uppercase tracking-widest"><Languages size={14} className="text-indigo-400"/> {lang === 'en' ? 'ENG' : 'MAL'}</span>
                 <div className={`w-8 h-4 rounded-full relative transition-colors ${lang === 'en' ? 'bg-slate-600' : 'bg-emerald-600'}`}>
                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${lang === 'en' ? 'left-0.5' : 'left-4.5'}`}></div>
                 </div>
             </button>
        </div>

        <nav className="mt-2 px-3 space-y-1 overflow-y-auto flex-1 custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setView(item.id);
                  if (window.innerWidth < 1024) setIsOpen(false);
                }}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all
                  ${isActive 
                    ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-900/50 scale-[1.02]' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}
                `}
              >
                <Icon size={18} />
                <span className="font-bold text-xs uppercase tracking-wider">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {appMode === 'admin' && (
          <div className="px-4 py-4 shrink-0 space-y-2">
              <button 
                  onClick={() => setShowShareHub(true)}
                  className="w-full bg-indigo-600 text-white border border-indigo-500 rounded-2xl px-4 py-4 flex items-center justify-center gap-3 transition-all font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-950/20 active:scale-95"
              >
                  <Share2 size={16} /> Get Shareable Links
              </button>
          </div>
        )}

        <div className="p-4 border-t border-slate-700/50 shrink-0">
          <div className="flex items-center space-x-3 text-[10px] text-slate-500 font-black uppercase tracking-widest">
            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${appMode === 'admin' ? 'bg-emerald-500' : 'bg-indigo-500'}`}></div>
            <span>{appMode === 'admin' ? 'Master Node' : appMode === 'read_only' ? 'Guest Uplink' : 'Secure Session'}</span>
          </div>
        </div>
      </div>

      {/* SHARE HUB MODAL */}
      {showShareHub && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[100] flex items-center justify-center p-6 animate-in fade-in">
              <div className="bg-white rounded-[48px] shadow-2xl w-full max-w-2xl overflow-hidden border border-white/20 relative">
                  <button onClick={() => setShowShareHub(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 p-2"><X size={24}/></button>
                  
                  <div className="p-10 lg:p-14">
                      <div className="flex items-center gap-6 mb-10">
                          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                              <Globe size={32} />
                          </div>
                          <div>
                              <h3 className="text-2xl font-black text-slate-900 tracking-tight">App Sharing Hub</h3>
                              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Generate Verified deep-links</p>
                          </div>
                      </div>

                      <div className="space-y-4">
                          {[
                              { mode: 'public_dashboard', label: 'Public Voter Dashboard', desc: 'Read-only overview for common citizens', icon: LayoutDashboard, color: 'text-emerald-600 bg-emerald-50' },
                              { mode: 'report', label: 'Summary Report', desc: 'Formal AI-generated strategic overview', icon: FileSearch, color: 'text-indigo-600 bg-indigo-50' },
                              { mode: 'radio_public', label: 'Radio Player', desc: 'Listen only interface for public broadcast', icon: Radio, color: 'text-red-600 bg-red-50' },
                              { mode: 'citizen', label: 'Citizen Connect', desc: 'Reporting & Issue tracking portal', icon: MessageSquare, color: 'text-blue-600 bg-blue-50' },
                          ].map((hub) => (
                              <div key={hub.mode} className="flex items-center justify-between p-5 bg-slate-50 rounded-3xl border border-slate-100 group hover:border-indigo-200 transition-all">
                                  <div className="flex items-center gap-4">
                                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${hub.color}`}>
                                          <hub.icon size={20} />
                                      </div>
                                      <div>
                                          <div className="text-sm font-black text-slate-800">{hub.label}</div>
                                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{hub.desc}</div>
                                      </div>
                                  </div>
                                  <div className="flex gap-2">
                                      <button 
                                          onClick={() => handleCopy(hub.mode)}
                                          className={`p-3 rounded-xl transition-all ${copiedLink === hub.mode ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-slate-400 hover:text-indigo-600'}`}
                                      >
                                          {copiedLink === hub.mode ? <Check size={16}/> : <Copy size={16}/>}
                                      </button>
                                      <button 
                                          onClick={() => window.open(getFullLink(hub.mode), '_blank')}
                                          className="p-3 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-indigo-600"
                                      >
                                          <ExternalLink size={16}/>
                                      </button>
                                  </div>
                              </div>
                          ))}
                      </div>

                      <div className="mt-10 p-6 bg-amber-50 rounded-3xl border border-amber-100 flex items-start gap-4">
                          <AlertTriangle className="text-amber-600 shrink-0" size={20} />
                          <p className="text-xs text-amber-700 font-medium leading-relaxed">
                              Deep links bypass the login screen but strictly restrict access to public features only. Admin tools will remain hidden to guest users.
                          </p>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </>
  );
};

export default Sidebar;

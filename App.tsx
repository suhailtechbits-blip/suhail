
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CandidateManager from './components/CandidateManager';
import VoterListUpload from './components/VoterListUpload';
import Verification from './components/Verification';
import VerificationReport from './components/VerificationReport';
import StrategyBoard from './components/StrategyBoard';
import LiveSimulation from './components/LiveSimulation';
import TrendAnalysis from './components/TrendAnalysis';
import AgentChat from './components/AgentChat';
import PublicExitPoll from './components/PublicExitPoll';
import PublicConnect from './components/PublicConnect';
import PublicRadioPlayer from './components/PublicRadioPlayer';
import PollingOps from './components/PollingOps';
import IssueTracker from './components/IssueTracker';
import VolunteerManager from './components/VolunteerManager';
import MediaCenter from './components/MediaCenter';
import NewsFeed from './components/NewsFeed';
import SocialCenter from './components/SocialCenter';
import AudioBriefing from './components/AudioBriefing';
import RadioAnalytics from './components/RadioAnalytics';
import RadioBroadcast from './components/RadioBroadcast';
import { ConstituencyData, ViewState, Language } from './types';
import { INITIAL_DATA } from './constants';
import { fetchLiveResults, LiveElectionSummary, getSimulatedLiveResults } from './services/liveResults';
import { Lock, LogIn, Wifi, WifiOff, Radio, Users, Globe, Eye, User, ShieldAlert } from 'lucide-react';

type AppRole = 'admin' | 'user' | 'public' | 'citizen' | 'radio_public' | 'read_only' | 'report';

const parseMode = (): AppRole => {
    // Robust detection using URL API
    try {
        const params = new URLSearchParams(window.location.search);
        
        // Handle hash-based routing as well (for some specific hosting environments)
        const hash = window.location.hash.includes('?') ? window.location.hash.split('?')[1] : '';
        const hashParams = new URLSearchParams(hash || window.location.hash.substring(1));
        
        const mode = params.get('mode') || hashParams.get('mode');
        const bid = params.get('bid') || hashParams.get('bid');
        
        if (mode === 'report') return 'report';
        if (mode === 'public_dashboard' || mode === 'read_only') return 'read_only';
        if (mode === 'public') return 'public';
        if (mode === 'citizen') return 'citizen';
        if (mode === 'radio_public' || bid || window.location.pathname.includes('/radio')) return 'radio_public';
        
        return 'user'; 
    } catch (e) {
        return 'user';
    }
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [electionData, setElectionData] = useState<ConstituencyData[]>(INITIAL_DATA);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [lang, setLang] = useState<Language>('en');
  
  const [appMode, setAppMode] = useState<AppRole>(parseMode());
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState<{name: string, email: string} | null>(null);
  const [otp, setOtp] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  const [liveUrl, setLiveUrl] = useState<string>('pending'); 
  const [liveSummary, setLiveSummary] = useState<LiveElectionSummary | null>(null);
  const [isLiveSyncing, setIsLiveSyncing] = useState(false);

  // Sync mode with URL changes to make deep links reactive
  useEffect(() => {
    const handleUrlChange = () => {
        const newMode = parseMode();
        setAppMode(newMode);
        
        // Auto-switch view if in report mode
        if (newMode === 'report') {
            setCurrentView(ViewState.VIEW_REPORT);
        }
    };
    
    // Check on mount
    handleUrlChange();
    
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
        window.removeEventListener('popstate', handleUrlChange);
        window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const syncUrl = params.get('syncUrl');
    if (syncUrl) setLiveUrl(decodeURIComponent(syncUrl));
  }, []);

  useEffect(() => {
    let interval: any;
    const sync = async () => {
        setIsLiveSyncing(true);
        const data = await fetchLiveResults(liveUrl);
        if (data) {
            setLiveSummary(data);
        } else if (liveUrl !== 'pending') {
            setLiveSummary(getSimulatedLiveResults(140));
        }
        setIsLiveSyncing(false);
    };

    if (liveUrl !== 'pending') {
        sync();
        interval = setInterval(sync, 60000); 
    }
    return () => clearInterval(interval);
  }, [liveUrl]);

  const handleUpdateConstituency = (id: string, updates: Partial<ConstituencyData>) => {
    if (appMode !== 'admin') return; 
    setElectionData(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const handleGoogleLogin = () => {
      setLoginError(null);
      setIsLiveSyncing(true);
      setTimeout(() => {
          setAppMode('user');
          setUserProfile({ name: 'Verified Voter', email: 'voter@gmail.com' });
          setIsLoggedIn(true);
          setIsLiveSyncing(false);
      }, 800);
  };

  const handleAdminLogin = () => {
      setLoginError(null);
      if (otp === 'Atro@123') {
          setAppMode('admin');
          setUserProfile({ name: 'Super Admin', email: 'admin@udf.org' });
          setIsLoggedIn(true);
      } else {
          setLoginError('Invalid Administrator Password');
          setOtp('');
      }
  };

  // Public/Shared Views that don't require Login
  if (appMode === 'radio_public') return <PublicRadioPlayer />;
  if (appMode === 'public') return <PublicExitPoll data={electionData} />;
  if (appMode === 'citizen') return <PublicConnect lang={lang} setLang={setLang} />;
  if (appMode === 'report') return (
    <div className="bg-slate-50 min-h-screen p-6 lg:p-12">
        <VerificationReport data={electionData} isPublic={true} />
    </div>
  );

  // Auth Guard for Private Roles
  if (!isLoggedIn && appMode !== 'read_only') {
      return (
          <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
              <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-600/10 blur-[120px] rounded-full animate-pulse" />
              <div className="absolute bottom-[-5%] right-[-5%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
              
              <div className="bg-white rounded-[48px] p-10 lg:p-14 w-full max-w-lg shadow-2xl relative z-10 border border-slate-100 animate-in fade-in zoom-in duration-500">
                  <div className="text-center mb-10">
                      <div className="w-20 h-20 bg-slate-900 rounded-[30px] mx-auto flex items-center justify-center text-white mb-6 shadow-xl shadow-slate-200">
                          <Lock size={40} />
                      </div>
                      <h1 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase">UDF <span className="text-emerald-600">GRID</span></h1>
                      <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">2026 Assembly Command System</p>
                  </div>

                  <div className="space-y-6">
                      <button 
                          onClick={handleGoogleLogin}
                          className="w-full flex items-center justify-center gap-4 p-5 bg-white border border-slate-200 rounded-[28px] hover:bg-slate-50 transition-all shadow-sm group active:scale-95"
                      >
                          <svg className="w-6 h-6 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                          <span className="font-black text-xs uppercase tracking-widest text-slate-700">Continue with Google</span>
                      </button>

                      <div className="relative py-4 flex items-center gap-4">
                          <div className="flex-1 h-px bg-slate-100"></div>
                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Administrator Entry</span>
                          <div className="flex-1 h-px bg-slate-100"></div>
                      </div>

                      <div className="space-y-4">
                          <div className="relative">
                              <input 
                                  type="password" 
                                  className={`w-full p-4 bg-slate-50 border ${loginError ? 'border-red-500 animate-shake' : 'border-slate-100'} rounded-[22px] focus:ring-4 focus:ring-emerald-500/10 focus:outline-none text-center tracking-[0.5em] text-lg font-black text-slate-800 transition-all`}
                                  placeholder="••••••••"
                                  value={otp}
                                  onChange={(e) => { setOtp(e.target.value); setLoginError(null); }}
                                  onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
                              />
                              {loginError && (
                                  <p className="text-[9px] text-red-600 font-bold uppercase tracking-widest text-center mt-2 flex items-center justify-center gap-1">
                                      <ShieldAlert size={12} /> {loginError}
                                  </p>
                              )}
                          </div>
                          <button 
                              onClick={handleAdminLogin} 
                              className="w-full bg-slate-900 hover:bg-black text-white py-5 rounded-[24px] font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"
                          >
                              <LogIn size={18} /> Authenticate Admin
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )
  }

  const renderContent = () => {
    // Treat 'read_only' role as 'user' inside components but restrict mutations
    const effectiveRole = appMode === 'read_only' ? 'user' : appMode;
    const sharedProps = { appMode: effectiveRole as any };

    switch (currentView) {
      case ViewState.DASHBOARD:
        return <Dashboard data={electionData} liveSummary={liveSummary} setView={setCurrentView} setAppMode={setAppMode} {...sharedProps} />;
      case ViewState.VIEW_REPORT:
        return <VerificationReport data={electionData} />;
      case ViewState.RADIO_MASTER:
        return <AudioBriefing data={electionData} {...sharedProps} />;
      case ViewState.RADIO_BROADCAST:
        return <RadioBroadcast {...sharedProps} />;
      case ViewState.AUDIO_BRIEFING:
        return <AudioBriefing data={electionData} {...sharedProps} />;
      case ViewState.RADIO_ANALYTICS:
        return <RadioAnalytics {...sharedProps} />;
      case ViewState.NEWS_FEED:
        return <NewsFeed lang={lang} {...sharedProps} />;
      case ViewState.SOCIAL_CENTER:
        return <SocialCenter lang={lang} {...sharedProps} />;
      case ViewState.POLLING_OPS:
        return <PollingOps data={electionData} liveSummary={liveSummary} onUpdateData={handleUpdateConstituency} {...sharedProps} />;
      case ViewState.ISSUE_TRACKER:
        return <IssueTracker {...sharedProps} />;
      case ViewState.VOLUNTEER_MANAGER:
        return <VolunteerManager {...sharedProps} />;
      case ViewState.STRATEGY:
        return <StrategyBoard data={electionData} {...sharedProps} />;
      case ViewState.LIVE_SIMULATION:
        return <LiveSimulation data={electionData} {...sharedProps} />;
      case ViewState.TREND_ANALYSIS:
        return <TrendAnalysis data={electionData} {...sharedProps} />;
      case ViewState.CANDIDATES:
        return <CandidateManager data={electionData} onSave={setElectionData} {...sharedProps} />;
      case ViewState.VOTER_LISTS:
        return <VoterListUpload data={electionData} onSave={setElectionData} {...sharedProps} />;
      case ViewState.VERIFICATION:
        return <Verification data={electionData} {...sharedProps} />;
      default:
        return <Dashboard data={electionData} {...sharedProps} />;
    }
  };

  const getViewTitle = () => {
      switch (currentView) {
          case ViewState.DASHBOARD: return "Executive Dashboard";
          case ViewState.VIEW_REPORT: return "Master Prep Report";
          case ViewState.RADIO_MASTER: return "UDF Radio Studio";
          case ViewState.RADIO_BROADCAST: return "Automated Broadcasts";
          case ViewState.AUDIO_BRIEFING: return "Radio Voice Tracker";
          case ViewState.RADIO_ANALYTICS: return "Radio Analytics";
          case ViewState.NEWS_FEED: return "Janasandesham Feed";
          case ViewState.SOCIAL_CENTER: return "Social Media Center";
          case ViewState.POLLING_OPS: return "Polling Operations";
          case ViewState.ISSUE_TRACKER: return "Public Issue Tracker";
          case ViewState.VOLUNTEER_MANAGER: return "Volunteer Force";
          case ViewState.STRATEGY: return "War Room 2026";
          case ViewState.CANDIDATES: return "Candidate Manager";
          default: return "UDF Election Grid";
      }
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      <Sidebar 
        currentView={currentView} 
        setView={setCurrentView} 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        lang={lang}
        setLang={setLang}
        appMode={appMode}
      />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center px-8 justify-between shrink-0 z-30 ml-8 lg:ml-0 shadow-sm">
          <div className="flex items-center gap-4">
             <h1 className="text-xl font-black text-slate-800 tracking-tight uppercase">{getViewTitle()}</h1>
             {(appMode === 'user' || appMode === 'read_only' || appMode === 'report') && (
                 <div className="flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-600 border border-indigo-100">
                    <Eye size={12} /> {appMode === 'read_only' ? 'Guest Access' : appMode === 'report' ? 'Report Mode' : 'Voter Mode'}
                 </div>
             )}
          </div>
          <div className="flex items-center space-x-6">
            {appMode !== 'read_only' && appMode !== 'report' && (
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-black text-slate-900 uppercase">{userProfile?.name || 'Authorized User'}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    {userProfile?.email || 'verified@udf.org'}
                  </p>
                </div>
            )}
            <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-white font-black text-xs shadow-lg">
                {appMode === 'admin' ? 'AD' : (appMode === 'read_only' || appMode === 'report') ? 'GS' : 'US'}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 lg:p-8 relative custom-scrollbar">
          {renderContent()}
        </div>

        <AgentChat />
      </main>

      <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
          }
          .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
          .custom-scrollbar::-webkit-scrollbar { width: 6px; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default App;

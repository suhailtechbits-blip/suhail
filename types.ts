
export type Front = 'UDF' | 'LDF' | 'NDA' | 'OTHER';

export interface Candidate {
  id: string;
  name: string;
  front: Front;
  partyName: string; 
  symbol?: string;
}

export type TargetCategory = 'Safe' | 'Swing' | 'Weak' | 'Unknown';

export interface ConstituencyData {
  id: string; 
  name: string; 
  district: string; 
  totalVoters: number;
  verifiedVoters: number;
  projectedTurnout: number;
  liveTurnout?: number; 
  lastElectionWinner: Front;
  winningMargin: number; 
  targetCategory: TargetCategory; 
  status: 'Pending' | 'Verified' | 'Flagged';
  candidates: Candidate[];
  voterListFile?: string; 
  issues: string[]; 
  votes2021: number; 
  targetVotes2026: number; 
  requiredGrowth: number; 
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  CANDIDATES = 'CANDIDATES',
  VOTER_LISTS = 'VOTER_LISTS',
  VERIFICATION = 'VERIFICATION',
  STRATEGY = 'STRATEGY',
  LIVE_SIMULATION = 'LIVE_SIMULATION',
  TREND_ANALYSIS = 'TREND_ANALYSIS',
  POLLING_OPS = 'POLLING_OPS',
  VOLUNTEER_MANAGER = 'VOLUNTEER_MANAGER',
  ISSUE_TRACKER = 'ISSUE_TRACKER',
  MEDIA_CENTER = 'MEDIA_CENTER',
  NEWS_FEED = 'NEWS_FEED',
  SOCIAL_CENTER = 'SOCIAL_CENTER',
  AUDIO_BRIEFING = 'AUDIO_BRIEFING',
  RADIO_ANALYTICS = 'RADIO_ANALYTICS',
  RADIO_MASTER = 'RADIO_MASTER',
  RADIO_BROADCAST = 'RADIO_BROADCAST',
  VIEW_REPORT = 'VIEW_REPORT'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

export interface NewsItem {
    id: string;
    title: string;
    summary: string;
    source: string;
    category: 'Welfare' | 'Governance' | 'Price Rise' | 'Jobs' | 'UDF Update';
    timestamp: Date;
    url: string;
    isVerified: boolean;
    imageUrl?: string;
    videoUrl?: string;
}

// Edvin Radio Types
export interface EdvinStory {
  id: string;
  headline: string;
  summary_points: string[];
  source_urls: string[];
  publisher_names: string[];
  location_tags: string[];
  category: string;
  confidence: string;
  udf_view_optional?: string;
}

export interface EdvinBulletin {
  id: string;
  title: string;
  script: string;
  timestamp: Date;
  duration_est: string;
  category: string;
}

export interface RadioAnalyticsEvent {
  event: 'stream_start' | 'stream_stop' | 'heartbeat';
  timestamp: string;
  user_id: string;
  session_id: string;
  bulletin_id: string;
  device: 'android' | 'ios' | 'web';
  country: string;
  seconds_played?: number;
}

export interface RadioAnalyticsSummary {
  range: { from: string; to: string };
  total_listens: number;
  unique_listeners: number;
  total_play_time_seconds: number;
  avg_listen_time_seconds: number;
  live_now: number;
  top_countries: { country: string; listens: number }[];
  top_devices: { device: string; listens: number }[];
  bulletins: {
    bulletin_id: string;
    listens: number;
    unique_listeners: number;
    play_time_seconds: number;
  }[];
  notes: string[];
}

export interface Volunteer {
  id: string;
  name: string;
  phone: string;
  ward: string;
  booth: string;
  role: 'Ground Team' | 'Digital Team' | 'Polling Agent';
  status: 'Active' | 'Pending' | 'Checked-In';
}

export type Language = 'en' | 'ml';

export interface AnalysisResult {
  summary: string;
  riskScore: number;
  udfAdvantageScore: number;
  anomalies: {
    constituencyId: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
    suggestedAction: string;
  }[];
}

export interface PublicIssue {
  id: string;
  type: 'Road' | 'Water' | 'Electricity' | 'Sanitation' | 'Other';
  description: string;
  location: string;
  status: 'Pending' | 'In Progress' | 'Resolved';
  timestamp: Date;
  isFeedback: boolean;
}

export interface MediaItem {
  id: string;
  type: 'FactCheck' | 'Update' | 'Poster';
  title: string;
  content: string;
  timestamp?: Date;
  imageUrl?: string;
}

export interface SocialPost {
  id: string;
  newsId: string;
  platform: 'Facebook' | 'Instagram' | 'WhatsApp';
  content: string;
  status: 'Scheduled' | 'Publishing' | 'Published';
  timestamp: Date;
  mediaType: 'image' | 'video' | 'text';
  mediaUrl?: string;
}

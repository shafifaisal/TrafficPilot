export interface Campaign {
  id: string;
  name: string;
  targetUrl: string;
  totalVolume: number; // monthly target
  dailyVolume: number;
  durationSeconds: number; // e.g., 30s to 300s
  bounceRateTarget: number; // percentage
  intervals: 'organic' | 'burst' | 'steady';
  geoTarget: string; // e.g. "US", "DE", "JP"
  deviceSplit: { desktop: number; mobile: number; tablet: number };
  behaviorSim: { scroll: boolean; clicks: boolean; formInput: boolean };
  status: 'active' | 'paused' | 'completed' | 'scheduled';
  createdAt: string;
  hitsGenerated?: number;
  gaMeasurementId?: string;
  gaMeasurementSecret?: string;
  worldwideGeoEnabled?: boolean;
  geoContinent?: string;
  randomizeFrequency?: 'session' | '1min' | '5min' | '10min';
  excludedCountries?: string[];
}

export interface ActiveSimulation {
  id: string;
  campaignId: string;
  url: string;
  activeUsers: number;
  requestsPerSecond: number;
  latencyMs: number;
  errorRate: number;
  stepsCompleted: string[];
  status: 'running' | 'completed' | 'failed' | 'idle';
}

export interface MetricSnapshot {
  timestamp: string;
  activeUsers: number;
  requestsPerSecond: number;
  avgLatencyMs: number;
  errorRate: number;
  clicksCount: number;
  bounceRate: number;
}

export interface AnalyticsSummary {
  totalVisits: number;
  avgDuration: number;
  bounceRate: number;
  conversionRate: number;
  byCountry: { country: string; value: number; code: string }[];
  byDevice: { name: string; value: number; color: string }[];
  byReferrer: { name: string; value: number }[];
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Admin' | 'Developer' | 'Viewer';
  avatar?: string;
}

export interface Project {
  id: string;
  name: string;
  domain: string;
  apiToken: string;
  createdAt: string;
}

export interface Plan {
  id: string;
  name: string;
  price: string;
  visits: string;
  credits: number;
  features: string[];
  stripePriceId: string;
}

export interface Invoice {
  id: string;
  amount: number;
  date: string;
  status: 'Paid' | 'Pending';
  visitsUsed: number;
  creditsPurchased: number;
}

export interface AffiliateStats {
  clicks: number;
  signups: number;
  earnings: number;
  referralLink: string;
}

export interface FraudAlert {
  id: string;
  campaignId: string;
  campaignName: string;
  url: string;
  flagReason: string;
  riskScore: number; // 0-100
  timeDetected: string;
  status: 'flagged' | 'cleared' | 'blocked';
}

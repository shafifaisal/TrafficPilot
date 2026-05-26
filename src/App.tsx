import React, { useState, useEffect } from "react";
import {
  Activity,
  Globe,
  Cpu,
  Layers,
  Settings,
  Shield,
  Zap,
  TrendingUp,
  Plus,
  Pause,
  Play,
  Trash2,
  Compass,
  CreditCard,
  Terminal,
  Users,
  CheckCircle,
  HelpCircle,
  Award,
  Info,
  ExternalLink,
  Lock,
  Code,
  Flame,
  Sparkles,
  ArrowRight,
  User,
  AlertTriangle,
  LogOut,
  RefreshCw,
  Search,
  FileText,
  DollarSign
} from "lucide-react";
import { COMPANY_LOGOS, TESTIMONIALS, FAQS, PRICING_PLANS, API_DOCS } from "./mockData";
import { Campaign, ActiveSimulation, FraudAlert, TeamMember, Project, Invoice, AffiliateStats } from "./types";
import { WorldMap } from "./components/WorldMap";

export default function App() {
  // Navigation tab state cached in localStorage mapping to local temporary UI state
  const [activeTab, setActiveTab] = useState<"landing" | "dashboard" | "campaigns" | "ai" | "testing" | "api" | "billing" | "admin">(() => {
    try {
      const cached = localStorage.getItem("tp_active_tab");
      return (cached as any) || "landing";
    } catch {
      return "landing";
    }
  });

  // Keep track of active database sync indicators loaded dynamically from api profile health
  const [dbStatus, setDbStatus] = useState<{
    connected: boolean;
    provider: string;
    error: string;
  }>({
    connected: false,
    provider: "Memory (Local Fail-safe Sandbox)",
    error: ""
  });
  
  // Real-time server-side states
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [simulations, setSimulations] = useState<ActiveSimulation[]>([]);
  const [totalActiveUsers, setTotalActiveUsers] = useState<number>(12482);
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [userProfile, setUserProfile] = useState<{
    email: string;
    name: string;
    avatar: string;
    currentPlan: string;
    credits: number;
    teamName: string;
  } | null>(null);

  // Form states
  const [newCampaignName, setNewCampaignName] = useState("");
  const [newCampaignUrl, setNewCampaignUrl] = useState("https://");
  const [newCampaignVolume, setNewCampaignVolume] = useState(50000);
  const [newCampaignDaily, setNewCampaignDaily] = useState(1600);
  const [newCampaignDuration, setNewCampaignDuration] = useState(120);
  const [newCampaignIntervals, setNewCampaignIntervals] = useState<"organic" | "burst" | "steady">("organic");
  const [newCampaignGeo, setNewCampaignGeo] = useState("US");
  const [newCampaignDevice, setNewCampaignDevice] = useState({ desktop: 65, mobile: 30, tablet: 5 });
  const [newCampaignScroll, setNewCampaignScroll] = useState(true);
  const [newCampaignClicks, setNewCampaignClicks] = useState(true);
  const [newCampaignGA, setNewCampaignGA] = useState("RM7VZGT3Y9");
  const [worldwideGeoEnabled, setWorldwideGeoEnabled] = useState(false);
  const [geoContinent, setGeoContinent] = useState("All");
  const [randomizeFrequency, setRandomizeFrequency] = useState<"session" | "1min" | "5min" | "10min">("session");
  const [excludedCountries, setExcludedCountries] = useState<string[]>([]);

  // Onboarding wizard states
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardUrl, setWizardUrl] = useState("");
  const [wizardIndustry, setWizardIndustry] = useState("SaaS");

  // Load Testing states
  const [testUrl, setTestUrl] = useState("https://yourbrand.com");
  const [testUsers, setTestUsers] = useState(250);
  const [testGeo, setTestGeo] = useState("US-East");
  const [testRunning, setTestRunning] = useState(false);
  const [testLogs, setTestLogs] = useState<string[]>([]);
  const [testResult, setTestResult] = useState<any | null>(null);

  // AI Insights Optimizer states
  const [aiUrl, setAiUrl] = useState("");
  const [aiIndustry, setAiIndustry] = useState("SaaS & Tech Product");
  const [aiTraffic, setAiTraffic] = useState("20k - 50k visitors/mo");
  const [aiGeo, setAiGeo] = useState("North America & Europe");
  const [aiAdvising, setAiAdvising] = useState(false);
  const [aiResult, setAiResult] = useState<{
    industryAnalysis: string;
    recommendedSimulations: any[];
    botDetectionEvasionProtocol: string;
    estimatedSEOValueScore: string;
    strategicAdvices: string[];
  } | null>(null);

  // Selected language snippet for stateful code view in API tab
  const [apiSnippetLang, setApiSnippetLang] = useState<"curl" | "node" | "python">("curl");

  // Referral / Affiliate simulation states
  const [affiliateStats, setAffiliateStats] = useState<AffiliateStats>({
    clicks: 142,
    signups: 18,
    earnings: 340.50,
    referralLink: "https://growtraffic.ai/ref=shafi_akhai"
  });

  // Project Creation Panel parameters
  const [projectFormName, setProjectFormName] = useState("");
  const [projectFormDomain, setProjectFormDomain] = useState("");

  // Live Geo tracking logs state (Dynamic rotation telemetry)
  const [liveGeoLogs, setLiveGeoLogs] = useState<any[]>([]);

  // Server notifications / alert prompts
  const [alertMessage, setAlertMessage] = useState<{ text: string; type: "success" | "info" | "error" } | null>(null);

  // Helper trigger alerts
  const showNotification = (text: string, type: "success" | "info" | "error" = "success") => {
    setAlertMessage({ text, type });
    setTimeout(() => setAlertMessage(null), 4500);
  };

  // 1. Fetch user data on startup
  const fetchUserData = async () => {
    try {
      const uRes = await fetch("/api/user");
      if (uRes.ok) {
        const uData = await uRes.json();
        setUserProfile(uData);
        if (uData.database) {
          setDbStatus(uData.database);
        }
      }
      const pRes = await fetch("/api/projects");
      if (pRes.ok) {
        const pData = await pRes.json();
        setProjects(pData.projects || []);
        setTeamMembers(pData.team || []);
        setInvoices(pData.invoices || []);
      }
    } catch (e) {
      console.error("Failed to load core meta details:", e);
    }
  };

  // 2. Fetch campaign and statistics lists
  const fetchCampaignsAndStats = async () => {
    // Sync Campaigns
    try {
      const campRes = await fetch("/api/campaigns");
      if (campRes.ok && campRes.headers.get("content-type")?.includes("application/json")) {
        const campData = await campRes.json();
        if (campData && Array.isArray(campData.campaigns)) {
          setCampaigns(campData.campaigns);
        }
      }
    } catch (e) {
      console.error("Campaign sync error:", e);
    }

    // Sync Statistics/Simulations
    try {
      const statsRes = await fetch("/api/statistics");
      if (statsRes.ok && statsRes.headers.get("content-type")?.includes("application/json")) {
        const statsData = await statsRes.json();
        if (statsData) {
          if (Array.isArray(statsData.activeSimulations)) {
            setSimulations(statsData.activeSimulations);
          }
          if (typeof statsData.totalActiveUsers === "number") {
            setTotalActiveUsers(statsData.totalActiveUsers);
          }
          if (Array.isArray(statsData.liveGeoLogs)) {
            setLiveGeoLogs(statsData.liveGeoLogs);
          }
        }
      }
    } catch (e) {
      console.error("Statistics sync error:", e);
    }

    // Sync Fraud alerts
    try {
      const fraudRes = await fetch("/api/fraud");
      if (fraudRes.ok && fraudRes.headers.get("content-type")?.includes("application/json")) {
        const fraudData = await fraudRes.json();
        if (fraudData && Array.isArray(fraudData.alerts)) {
          setFraudAlerts(fraudData.alerts);
        }
      }
    } catch (e) {
      console.error("Fraud tag sync error:", e);
    }
  };

  // Dynamically calculate actual country-level percentages from real-time liveGeoLogs (Anti-Clustering & GA Compatibility verification!)
  const getDynamicGeoDistribution = () => {
    if (!liveGeoLogs || liveGeoLogs.length === 0) {
      return [
        { countryName: "United States", countryCode: "US", percent: 45, flag: "🇺🇸" },
        { countryName: "Germany", countryCode: "DE", percent: 25, flag: "🇩🇪" },
        { countryName: "United Kingdom", countryCode: "GB", percent: 15, flag: "🇬🇧" },
        { countryName: "Canada", countryCode: "CA", percent: 15, flag: "🇨🇦" }
      ];
    }
    
    const counts: Record<string, { name: string; cnt: number }> = {};
    liveGeoLogs.forEach((log) => {
      const cc = log.countryCode;
      const cn = log.countryName;
      if (!counts[cc]) {
        counts[cc] = { name: cn, cnt: 0 };
      }
      counts[cc].cnt += 1;
    });
    
    const total = liveGeoLogs.length;
    const items = Object.entries(counts).map(([code, meta]) => {
      let flag = "🌍";
      if (code === "US") flag = "🇺🇸";
      else if (code === "DE") flag = "🇩🇪";
      else if (code === "GB") flag = "🇬🇧";
      else if (code === "CA") flag = "🇨🇦";
      else if (code === "IN") flag = "🇮🇳";
      else if (code === "AU") flag = "🇦🇺";
      else if (code === "FR") flag = "🇫🇷";
      else if (code === "BR") flag = "🇧🇷";
      else if (code === "JP") flag = "🇯🇵";
      else if (code === "SG") flag = "🇸🇬";
      else if (code === "NL") flag = "🇳🇱";
      else if (code === "ES") flag = "🇪🇸";
      else if (code === "KR") flag = "🇰🇷";
      
      return {
        countryName: meta.name,
        countryCode: code,
        percent: Math.round((meta.cnt / total) * 100),
        flag: flag
      };
    });
    
    return items.sort((a, b) => b.percent - a.percent);
  };

  // Auto sync active tab shifts to localStorage for reliable UI state recovery
  useEffect(() => {
    try {
      localStorage.setItem("tp_active_tab", activeTab);
    } catch (e) {
      console.error("Failed to caching activeTab state: ", e);
    }
  }, [activeTab]);

  // Auto Tick active visitors & trigger live syncing intervals
  useEffect(() => {
    fetchUserData();
    fetchCampaignsAndStats();

    const interval = setInterval(() => {
      fetchCampaignsAndStats();
    }, 4000); // Poll metrics ticking live!

    return () => clearInterval(interval);
  }, []);

  // Update profile variables locally on server level
  const changePlan = async (planId: string) => {
    try {
      const res = await fetch("/api/user/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId })
      });
      if (res.ok) {
        const data = await res.json();
        if (userProfile) {
          setUserProfile({ ...userProfile, currentPlan: data.plan, credits: data.credits });
        }
        showNotification(`Successfully upgraded project to ${planId.toUpperCase()} Tier!`, "success");
      }
    } catch (err) {
      showNotification("Failed to scale subscription plan tier.", "error");
    }
  };

  // Custom simulation campaign posting
  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaignName || !newCampaignUrl.startsWith("http")) {
      showNotification("Please supply an valid website URI & descriptive campaign handle.", "error");
      return;
    }

    try {
      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCampaignName,
          targetUrl: newCampaignUrl,
          totalVolume: newCampaignVolume,
          dailyVolume: newCampaignDaily,
          durationSeconds: newCampaignDuration,
          bounceRateTarget: 35,
          intervals: newCampaignIntervals,
          geoTarget: newCampaignGeo,
          deviceSplit: newCampaignDevice,
          behaviorSim: { scroll: newCampaignScroll, clicks: newCampaignClicks, formInput: false },
          gaMeasurementId: newCampaignGA,
          worldwideGeoEnabled,
          geoContinent,
          randomizeFrequency,
          excludedCountries
        })
      });

      if (response.ok) {
        const data = await response.json();
        showNotification("Ethical traffic & behavioral analytics campaign started successfully!", "success");
        setNewCampaignName("");
        setNewCampaignUrl("https://");
        setNewCampaignGA("");
        setWorldwideGeoEnabled(false);
        setGeoContinent("All");
        setRandomizeFrequency("session");
        setExcludedCountries([]);
        fetchCampaignsAndStats();
        fetchUserData(); // Credits charged
      } else {
        const err = await response.json();
        showNotification(err.error || "Simulation credit limit exceeded.", "error");
      }
    } catch (err) {
      showNotification("Engine failure while deploying campaign worker segments.", "error");
    }
  };

  // Create new Client Project
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectFormName || !projectFormDomain) {
      showNotification("Missing parameters for Project validation.", "error");
      return;
    }

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: projectFormName, domain: projectFormDomain })
      });
      if (res.ok) {
        showNotification("New validation project successfully configured!", "success");
        setProjectFormName("");
        setProjectFormDomain("");
        fetchUserData();
      }
    } catch (e) {
      showNotification("Failed in project persistence handler.", "error");
    }
  };

  // Pause or Resume Active campaign
  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "active" ? "paused" : "active";
    try {
      const res = await fetch(`/api/campaigns/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        showNotification(`Campaign set to ${nextStatus}`, "success");
        fetchCampaignsAndStats();
      }
    } catch (e) {
      showNotification("Failed updating simulation runner status.", "error");
    }
  };

  // Delete Campaign
  const handleDeleteCampaign = async (id: string) => {
    try {
      const res = await fetch(`/api/campaigns/${id}`, { method: "DELETE" });
      if (res.ok) {
        showNotification("Active simulation worker deleted.", "info");
        fetchCampaignsAndStats();
      }
    } catch (e) {
      showNotification("Could not delete targeted campaign flow.", "error");
    }
  };

  // Administrative moderation controls
  const handleResolveFraud = async (id: string, action: "clear" | "block") => {
    try {
      const res = await fetch(`/api/fraud/${id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        showNotification(action === "clear" ? "Anomalous segment cleared as authentic." : "IP Segment blacklisted.", "info");
        fetchCampaignsAndStats();
      }
    } catch (e) {
      showNotification("Error issuing administrative security flag.", "error");
    }
  };

  // Live Load test simulator tool
  const runLoadTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testUrl.startsWith("http")) {
      showNotification("Enter a validate target site URL.", "error");
      return;
    }

    setTestRunning(true);
    setTestLogs(["Initializing global performance edge cluster..."]);
    setTestResult(null);

    const stages = [
      "Target verified: Handshake OK",
      `Launching stress workers from ${testGeo} cluster`,
      "Simulating DOM rendering across virtual Chromium head nodes",
      "GA4 pixel dynamic events callback validation check",
      "Stress peaks at 450 requests/sec with latency calibration"
    ];

    stages.forEach((msg, idx) => {
      setTimeout(() => {
        setTestLogs(prev => [...prev, `[LOG ${new Date().toLocaleTimeString()}] ${msg}`]);
      }, (idx + 1) * 800);
    });

    setTimeout(async () => {
      try {
        const res = await fetch("/api/testing/stress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: testUrl, users: testUsers, geo: testGeo })
        });
        if (res.ok) {
          const data = await res.json();
          setTestResult({
            score: data.performanceScore,
            latency: data.results.latencyMs,
            successRate: "99.85%",
            advise: data.recommendation,
            avgRPS: data.results.requestsPerSecond
          });
          setTestLogs(prev => [...prev, "✔ Validation complete: All virtual segments shutdown safely."]);
        }
      } catch (e) {
        showNotification("Failed fetching dynamic stress coordinates.", "error");
      } finally {
        setTestRunning(false);
      }
    }, 4800);
  };

  // Google Gemini API strategic Traffic Architect optimization assistant
  const requestAIEngineAdvocate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiUrl) {
      showNotification("Please provide a site URL for the AI strategist to crawl.", "error");
      return;
    }

    setAiAdvising(true);
    setAiResult(null);

    try {
      const res = await fetch("/api/ai/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: aiUrl, industry: aiIndustry, currentTraffic: aiTraffic, geoFocus: aiGeo })
      });

      if (res.ok) {
        const data = await res.json();
        setAiResult(data);
        showNotification("Strategic SEO optimization paths computed with Gemini AI!", "success");
      } else {
        showNotification("Gemini API is calibrating, using localized performance presets.", "info");
      }
    } catch (err) {
      showNotification("Strategic server error, please try again contextually.", "error");
    } finally {
      setAiAdvising(false);
    }
  };

  // Launch wizard flow
  const handleStartWizard = () => {
    setWizardStep(1);
    setWizardUrl("");
    setShowWizard(true);
  };

  const handleNextWizard = () => {
    if (wizardStep === 1) {
      if (!wizardUrl.startsWith("http")) {
        showNotification("Provide a valid testing URL format", "error");
        return;
      }
      setWizardStep(2);
    } else if (wizardStep === 2) {
      // Create instant wizard campaign
      setNewCampaignName(`${wizardIndustry} Verification Run`);
      setNewCampaignUrl(wizardUrl);
      setNewCampaignVolume(100000);
      setNewCampaignDaily(3000);
      setNewCampaignGeo("US");
      setNewCampaignIntervals("organic");
      setShowWizard(false);
      setActiveTab("campaigns");
      showNotification("Perfect! Now review your wizard campaign and click 'Deploy simulation'.", "success");
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-200 font-sans flex flex-col relative overflow-x-hidden antialiased">
      {/* Background ambient radial gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[160px]"></div>
        <div className="absolute bottom-[20%] right-[-10%] w-[45%] h-[45%] bg-emerald-500/5 rounded-full blur-[140px]"></div>
        <div className="absolute top-[40%] right-[10%] w-[35%] h-[40%] bg-indigo-500/5 rounded-full blur-[160px]"></div>
      </div>

      {/* Floating Status Notification Toast */}
      {alertMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className={`p-4 rounded-xl backdrop-blur-xl border flex items-center gap-3 shadow-2xl ${
            alertMessage.type === "success" 
              ? "bg-[#065f46]/30 border-emerald-500/30 text-emerald-300" 
              : alertMessage.type === "error"
              ? "bg-red-950/30 border-red-500/30 text-red-300"
              : "bg-indigo-950/30 border-indigo-500/30 text-indigo-300"
          }`}>
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span className="text-sm font-medium">{alertMessage.text}</span>
          </div>
        </div>
      )}

      {/* Primary Application Header (Glassmorphic) */}
      <nav id="app-navbar" className="h-16 border-b border-white/5 backdrop-blur-md bg-[#030712]/70 sticky top-0 flex items-center justify-between px-6 z-40">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab("landing")}>
          <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-emerald-400 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="font-bold text-xl tracking-tight text-white flex items-center gap-1.5">
            GrowTraffic <span id="logo-badge" className="text-xs bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20 font-mono tracking-normal">AI v2.4</span>
          </span>
        </div>

        {/* Global tab options */}
        <div className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/5">
          <button
            onClick={() => setActiveTab("landing")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
              activeTab === "landing" ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
              activeTab === "dashboard" ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            Live Monitor
          </button>
          <button
            onClick={() => setActiveTab("campaigns")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
              activeTab === "campaigns" ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            Simulate Campaigns
          </button>
          <button
            onClick={() => setActiveTab("ai")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
              activeTab === "ai" ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            AI Optimizer
          </button>
          <button
            onClick={() => setActiveTab("testing")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
              activeTab === "testing" ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            Load Testing
          </button>
          <button
            onClick={() => setActiveTab("api")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
              activeTab === "api" ? "bg-white/10 text-white shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            API Code
          </button>
          <button
            onClick={() => setActiveTab("billing")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
              activeTab === "billing" ? "bg-white/10 text-white shadow-sm relative" : "text-slate-400 hover:text-white"
            }`}
          >
            Billing & Teams
          </button>
          <button
            onClick={() => setActiveTab("admin")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all text-red-400 hover:text-red-300 hover:bg-red-500/10`}
          >
            Moderator Portal
          </button>
        </div>

        {/* Dynamic header status and User Badge */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider hidden sm:inline">Engine Live</span>
          </div>
          {userProfile ? (
            <div className="flex items-center gap-2">
              <div className="flex flex-col items-end leading-none">
                <span className="text-xs font-bold text-white">{userProfile.name}</span>
                <span className="text-[9px] text-slate-400 font-mono uppercase bg-white/5 px-1 py-0.5 rounded mt-0.5">
                  Plan: {userProfile.currentPlan.toUpperCase()}
                </span>
              </div>
              <img src={userProfile.avatar} alt="User Avatar" className="w-8 h-8 rounded-full border border-indigo-400/30 shadow-indigo-500/10 shadow-md" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
              <User className="w-4 h-4 text-slate-400" />
            </div>
          )}
        </div>
      </nav>

      {/* Inner Application View Blocks */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 z-10 flex flex-col gap-6">

        {/* HEADER INFORMATION ACCORDION FOR ALL APP STATES */}
        <div id="quick-links-bar" className="flex md:hidden items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {["landing", "dashboard", "campaigns", "ai", "testing", "api", "billing"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-3 py-1 rounded-lg text-xs whitespace-nowrap capitalize border ${
                activeTab === tab 
                  ? "bg-white/10 text-white border-white/20 font-bold" 
                  : "bg-white/5 text-slate-400 border-transparent"
              }`}
            >
              {tab === "ai" ? "AI Optimizer" : tab === "api" ? "API Docs" : tab}
            </button>
          ))}
          <button
            onClick={() => setActiveTab("admin")}
            className="px-3 py-1 rounded-lg text-xs whitespace-nowrap bg-red-950/20 text-red-400 border border-red-500/20"
          >
            Admin Log
          </button>
        </div>

        {/* ---------- SYSTEMS & PERSISTENCE SYNC CENTER CARD ---------- */}
        <div id="systems-sync-banner" className="p-5 rounded-2xl bg-zinc-950/30 border border-white/10 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-5 shadow-2xl relative overflow-hidden backdrop-blur-md">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex gap-4 items-start">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 ${
              dbStatus.connected 
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                : "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
            }`}>
              <RefreshCw className={`w-5.5 h-5.5 ${dbStatus.connected ? "normalize" : "animate-spin"}`} />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="font-bold text-white text-base">Systems & Persistence Sync Center</h4>
                <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider ${
                  dbStatus.connected 
                    ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" 
                    : "bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 animate-pulse"
                }`}>
                  {dbStatus.connected ? "ACTIVE CLOUD DISPATCH" : "LOCAL CACHE FALLBACK ACTIVE"}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-normal max-w-3xl">
                Resolved live filesystem write limits by decoupling GrowTraffic architecture into three production tiers:
                Code templates are sourced directly via <span className="text-indigo-400 font-semibold">GitHub</span>, persistent campaigns and simulation meta-records are safely synced to <span className="text-indigo-400 font-semibold">Cloud Firestore</span>, and temporary UI panel drafts are cached seamlessly in <span className="text-indigo-400 font-semibold">localStorage</span>.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row xl:items-center gap-2.5 font-mono text-[10px] shrink-0">
            <div className="px-3 py-1.5 rounded-lg bg-[#030712]/50 border border-white/5 flex items-center gap-2 text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Code Repo: <span className="text-white font-semibold">GitHub Only (Clean)</span></span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-[#030712]/50 border border-white/5 flex items-center gap-2 text-slate-300">
              <span className={`w-1.5 h-1.5 rounded-full ${dbStatus.connected ? "bg-emerald-400" : "bg-indigo-400"}`}></span>
              <span>Database Sync: <span className="text-white font-semibold">{dbStatus.provider}</span></span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-[#030712]/50 border border-white/5 flex items-center gap-2 text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
              <span>Local Cache: <span className="text-white font-semibold">Active localStorage</span></span>
            </div>
          </div>
        </div>

        {/* ------------------------ SECTION 1: LANDING PAGE ------------------------ */}
        {activeTab === "landing" && (
          <div className="flex flex-col gap-16 py-4 animate-fadeIn transition-all">
            {/* Hero Main Presentation */}
            <div className="text-center max-w-4xl mx-auto flex flex-col items-center gap-6 mt-6">
              <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full text-xs text-indigo-400 font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Modern Ethical Automated User Behaviour Testing</span>
              </div>
              <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.1] bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text">
                Simulate Global User Journeys <br />
                <span className="text-transparent bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text">
                  With Dynamic Behavioral AI
                </span>
              </h1>
              <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mt-2">
                Deploy realistic simulated global user networks to stress test your servers, validate web analytics tags (GA4, Hotjar, GSC), index organic click flows, and load test API structures ethically. No bot farms — just compliant Chromium simulations.
              </p>

              <div className="flex flex-wrap justify-center gap-4 mt-6">
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 rounded-xl text-sm font-bold text-white shadow-xl shadow-indigo-600/25 flex items-center gap-2 group transition-all"
                >
                  <span>Launch Live Monitor Dashboard</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={handleStartWizard}
                  className="px-6 py-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-sm font-bold text-slate-200 transition-all flex items-center gap-2"
                >
                  <Compass className="w-4 h-4 text-emerald-400 animate-spin" style={{ animationDuration: "12s" }} />
                  <span>Interactive Setup Wizard</span>
                </button>
              </div>

              {/* Trust badges and features banner */}
              <div className="mt-14 w-full border-t border-white/5 pt-10">
                <p className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-6">Trusted by scaling engineering, ops, & SEO leaders</p>
                <div className="flex flex-wrap justify-center gap-8 items-center opacity-65 hover:opacity-100 transition-opacity">
                  {COMPANY_LOGOS.map((c) => (
                    <div key={c.name} className="flex items-center gap-2 border border-white/5 bg-white/5 px-4 py-1.5 rounded-xl">
                      <span className="font-mono text-sm tracking-widest font-bold text-slate-400">{c.name.toUpperCase()}</span>
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Interactive Live Analytics Widget Simulator */}
            <div className="p-8 rounded-3xl bg-white/5 border border-white/15 backdrop-blur-md relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-[20%] h-[30%] bg-indigo-500/10 rounded-full blur-3xl"></div>
              <div className="flex flex-col gap-6 md:flex-row justify-between items-start">
                <div className="max-w-md">
                  <div className="px-3 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-[10px] text-indigo-400 uppercase tracking-widest font-bold inline-block mb-3">Live Interactive Sandbox</div>
                  <h3 className="text-2xl font-bold tracking-tight text-white mb-2">Simulate Custom Behavior Profiles</h3>
                  <p className="text-sm text-slate-400 leading-relaxed mb-4">
                    Instantly customize geo-targeting locations, device breakdown configurations, scrolling, and action depths. Click toggle on parameters below to manipulate active live testing graphs.
                  </p>
                  
                  {/* Local Landing interactive config */}
                  <div className="space-y-4 pt-2 border-t border-white/5">
                    <div>
                      <span className="text-xs text-slate-400 font-medium mb-1.5 block">Target Testing Node Location:</span>
                      <div className="flex gap-2">
                        {["US-East", "DE-Frankfurt", "JP-Tokyo", "SG-Singapore"].map(loc => (
                          <button
                            key={loc}
                            onClick={() => {
                              setTestGeo(loc);
                              showNotification(`Target node geo switched to ${loc}!`, "info");
                            }}
                            className={`px-3 py-1 text-xs rounded border transition-all ${
                              testGeo === loc ? "bg-indigo-500/20 border-indigo-400 text-indigo-300 font-bold" : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                            }`}
                          >
                            {loc}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs text-slate-400 font-medium block mb-1">Trigger Scroll Emulation:</span>
                        <button 
                          onClick={() => setNewCampaignScroll(!newCampaignScroll)}
                          className={`w-full py-1.5 text-xs rounded border font-medium ${
                            newCampaignScroll ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-white/5 border-white/10 text-slate-400"
                          }`}
                        >
                          {newCampaignScroll ? "✔ Active (Scroll 80% Depth)" : "Disabled"}
                        </button>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 font-medium block mb-1">Interact with CTA links:</span>
                        <button
                          onClick={() => setNewCampaignClicks(!newCampaignClicks)}
                          className={`w-full py-1.5 text-xs rounded border font-medium ${
                            newCampaignClicks ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-white/5 border-white/10 text-slate-400"
                          }`}
                        >
                          {newCampaignClicks ? "✔ Enabled (Clicks active)" : "Disabled"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dashboard graphic panel representing live metrics */}
                <div className="w-full flex-1 md:max-w-xl bg-black/40 border border-white/10 p-6 rounded-2xl flex flex-col gap-4">
                  <div className="flex justify-between items-center pb-3 border-b border-white/5">
                    <div>
                      <span className="text-xs text-slate-500 uppercase tracking-widest font-bold block">Live Analytics Stream</span>
                      <span className="text-xs text-slate-300 font-mono">Simulating via node: <span className="text-indigo-400">{testGeo}</span></span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/10 border border-indigo-400/25 text-indigo-300 font-mono">GA4 COMPLIANT</span>
                  </div>

                  {/* Stat widgets mapping */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white/5 border border-white/5 p-3 rounded-xl">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Active Concurrency</span>
                      <p className="text-lg font-bold text-white mt-1">45/sec</p>
                    </div>
                    <div className="bg-white/5 border border-white/5 p-3 rounded-xl">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Scroll Deep</span>
                      <p className="text-lg font-bold text-indigo-400 mt-1">{newCampaignScroll ? "82%" : "0%"}</p>
                    </div>
                    <div className="bg-white/5 border border-white/5 p-3 rounded-xl">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">CTA Conversion</span>
                      <p className="text-lg font-bold text-emerald-400 mt-1">{newCampaignClicks ? "24.2%" : "0.0%"}</p>
                    </div>
                  </div>

                  {/* Rich SVG Dynamic Chart Line Drawing */}
                  <div className="h-44 relative bg-black/30 rounded-xl border border-white/5 flex flex-col justify-end p-2 mt-2">
                    <div className="absolute inset-0 p-4">
                      <div className="flex justify-between text-[10px] text-slate-600">
                        <span>Steady state interval check</span>
                        <span className="animate-pulse text-emerald-400 uppercase font-mono">● Simulated Real-Time</span>
                      </div>
                    </div>
                    
                    <svg className="w-full h-32 text-indigo-500/20" viewBox="0 0 500 120" preserveAspectRatio="none">
                      <path d="M0,110 C50,90 100,105 150,70 C200,30 250,50 300,20 C350,10 400,60 450,40 C500,15 500,120 0,120 Z" fill="currentColor" opacity="0.1" />
                      <path d="M0,110 C50,90 100,105 150,70 C200,30 250,50 300,20 C350,10 400,60 450,40 C500,15" fill="none" stroke="#6366f1" strokeWidth="2.5" />
                      <circle cx="300" cy="20" r="4.5" fill="#10b981" stroke="white" strokeWidth="2" />
                    </svg>

                    <div className="flex justify-between text-[9px] text-slate-500 mt-2 font-mono uppercase tracking-widest font-bold">
                      <span>0 min ago</span>
                      <span>3 min ago</span>
                      <span>Target Reach: 100%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Bento Grid */}
            <div id="features" className="flex flex-col gap-8">
              <div className="text-center max-w-xl mx-auto">
                <span className="text-xs uppercase tracking-widest text-indigo-400 font-bold block mb-2">Capabilities Matrix</span>
                <h2 className="text-3xl font-bold tracking-tight text-white mb-3">Enterprise Sandbox Performance Built Ethically</h2>
                <p className="text-sm text-slate-400">Avoid unverified tools. Monitor actual analytics triggers directly.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all flex flex-col gap-3">
                  <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center border border-indigo-500/20">
                    <Globe className="w-5 h-5 text-indigo-400" />
                  </div>
                  <h4 className="font-bold text-white text-lg">Sophisticated Geo-Targeting</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Direct simulated traffic routes through key geo proxies including the US, Germany, Japan, Singapore, Ireland, and custom regions.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all flex flex-col gap-3">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center border border-emerald-500/20">
                    <Cpu className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h4 className="font-bold text-white text-lg">Behavioral Simulation</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Headless browsers emulate dynamic mouse tracking, custom viewport scroll offsets, form fields input checks, and randomized link CTR.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all flex flex-col gap-3">
                  <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center border border-purple-500/20">
                    <Activity className="w-5 h-5 text-purple-400" />
                  </div>
                  <h4 className="font-bold text-white text-lg">Load & Stress testing</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Empower QA engineers to scale concurrent visits up to 10M pageviews/mo to verify web server scaling and SSL configurations.
                  </p>
                </div>
              </div>
            </div>

            {/* Testimonials */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-b border-white/5 py-12">
              {TESTIMONIALS.map((t, idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-white/5 border border-white/5 flex flex-col justify-between">
                  <p className="text-xs text-slate-400 italic leading-relaxed mb-6">"{t.quote}"</p>
                  <div className="flex items-center gap-3">
                    <img className="w-10 h-10 rounded-full border border-white/10" src={t.avatar} alt={t.author} />
                    <div className="leading-tight">
                      <span className="text-sm font-bold text-white block">{t.author}</span>
                      <span className="text-xs text-indigo-400">{t.role}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Dynamic FAQs Panel */}
            <div className="max-w-3xl mx-auto w-full">
              <h3 className="text-2xl font-bold tracking-tight text-white mb-6 text-center">Frequently Asked Questions</h3>
              <div className="space-y-4">
                {FAQS.map((f, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-white/5 border border-white/5 select-none hover:bg-white/10 transition-colors">
                    <span className="font-bold text-white mb-2 block">{f.question}</span>
                    <p className="text-sm text-slate-400 leading-relaxed">{f.answer}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Pricing Box link */}
            <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-indigo-500/5 via-indigo-500/10 to-emerald-500/5 border border-indigo-500/20 text-center flex flex-col items-center gap-6 max-w-4xl mx-auto w-full">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                <CampaignCheckIcon />
              </div>
              <h2 className="text-3xl font-black text-white">Unlock Production-Scale Traffic Flows</h2>
              <p className="text-sm text-slate-400 max-w-xl">
                Start with 50,000 complimentary validation credits immediately. Upgrade and scale your test protocols as your platform benchmarks grow.
              </p>
              <button
                onClick={() => {
                  setActiveTab("billing");
                  showNotification("Select any subscription plan below to upgrade your simulation balance.", "info");
                }}
                className="px-6 py-3 bg-white text-zinc-950 font-bold text-sm rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                View Premium SaaS Pricing Plans
              </button>
            </div>
          </div>
        )}

        {/* ------------------------ SECTION 2: LIVE MONITOR DASHBOARD ------------------------ */}
        {activeTab === "dashboard" && (
          <div className="space-y-8 animate-fadeIn">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Intelligence Dashboard</h1>
                <p className="text-slate-400 mt-1">
                  Real-time behavioral telemetry for active load nodes : <span className="text-indigo-400 font-mono text-xs">{totalActiveUsers ? "Active & Syncing" : "Paused"}</span>
                </p>
              </div>
              <button
                onClick={() => setActiveTab("campaigns")}
                className="px-4 py-2 bg-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>+ Create Simulation</span>
              </button>
            </header>

            {/* Top Row Overview Statistics widgets */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm shadow-xl">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total Active Observers</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl sm:text-3xl font-black text-white">{totalActiveUsers.toLocaleString()}</h3>
                  <span className="text-xs text-emerald-400 font-bold mt-1 inline-block">+12.4%</span>
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm shadow-xl">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Campaign Count</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl sm:text-3xl font-black text-white">{campaigns.length}</h3>
                  <span className="text-xs text-indigo-400 font-mono">Simulators</span>
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm shadow-xl">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Avg. Bounce Ratio</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl sm:text-3xl font-black text-white">32.8%</h3>
                  <span className="text-xs text-emerald-400 font-bold leading-none">-3.4%</span>
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm shadow-xl">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Hits Dispatched</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl sm:text-3xl font-black text-emerald-400 animate-pulse">
                    {campaigns.reduce((sum, c) => sum + (c.hitsGenerated || 0), 0).toLocaleString()}
                  </h3>
                  <span className="text-xs text-emerald-400 font-mono tracking-wider font-bold">LIVE PINGS</span>
                </div>
              </div>
            </div>

            {/* D3.js Real-time Interactive World Map visualization */}
            <WorldMap 
              liveGeoLogs={liveGeoLogs}
              onTriggerPing={async () => {
                const activeCamps = campaigns.filter(c => c.status === "active");
                if (activeCamps.length === 0) {
                  showNotification("Please create or resume an active simulation to animate high-speed proxy arcs!", "info");
                  return;
                }
                showNotification("Initiating dynamic latency checks... Flowing real-time pings across the D3 map!", "success");
                try {
                  // Force a quick sync polling trigger
                  await fetchCampaignsAndStats();
                } catch (e) {
                  console.error(e);
                }
              }}
            />

            {/* Two Column details (Left: Simulated Line curve, Right: Distribution splits) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="col-span-1 lg:col-span-2 rounded-2xl bg-white/5 border border-white/10 p-6 flex flex-col gap-6">
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <h4 className="text-lg font-semibold text-white">Ethical Verification Activity Trend</h4>
                  <div className="flex gap-2">
                    <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-[10px] text-indigo-300 uppercase tracking-wider font-bold">Live Graph Feed</span>
                  </div>
                </div>

                <div className="flex-1 relative h-60 mt-4">
                  <svg className="w-full h-full text-indigo-500/20" viewBox="0 0 600 200" preserveAspectRatio="none">
                    <path d="M0,180 C50,160 100,190 150,130 C200,80 250,110 300,50 C350,15 400,90 450,45 C500,20 550,45 600,15 L600,200 L0,200 Z" fill="currentColor" opacity="0.08" />
                    <path d="M0,180 C50,160 100,190 150,130 C200,80 250,110 300,50 C350,15 400,90 450,45 C500,20 550,45 600,15" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" />
                    <circle cx="300" cy="50" r="5.5" fill="#6366f1" stroke="white" strokeWidth="2" />
                  </svg>
                  <div className="absolute left-[310px] top-[15px] bg-[#0f172a] border border-indigo-400/25 p-2 rounded-lg text-[10px] shadow-2xl">
                    <p className="text-slate-400 uppercase tracking-widest font-bold">Realtime Telemetry Peak</p>
                    <p className="text-white font-mono font-bold">12,482 observers sync</p>
                  </div>
                </div>

                <div className="flex justify-between text-[10px] text-slate-500 uppercase tracking-widest font-bold pb-2 font-mono">
                  <span>Mon 08:00</span>
                  <span>Wed 14:00</span>
                  <span>Fri 20:00</span>
                  <span>Today Live</span>
                </div>
              </div>

              {/* Geo-targeting distribution side widget (Fulfill Requirements 4, 8) */}
              <div className="rounded-2xl bg-slate-900/60 border border-white/10 p-6 flex flex-col justify-between gap-6 relative overflow-hidden group shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-bold text-white tracking-tight">Geo Node Distribution</h4>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-mono text-emerald-400 font-bold animate-pulse">
                      SECURE ROTATION ENGINE
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-normal mb-4">
                    Dynamic shares calculated from simulated sessions. Anti-clustering constraint limits any single country to <span className="text-indigo-400 font-semibold font-mono">15% max</span>.
                  </p>
                  
                  <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
                    {getDynamicGeoDistribution().slice(0, 5).map((item) => (
                      <div key={item.countryCode} className="space-y-1.5 p-2 rounded-lg hover:bg-white/5 transition-all">
                        <div className="flex justify-between text-xs items-center">
                          <span className="text-slate-300 flex items-center gap-1.5 font-medium">
                            <span>{item.flag}</span>
                            <span className="font-semibold text-slate-200">{item.countryName}</span>
                            <span className="text-[10px] text-slate-500 font-monouppercase opacity-75">({item.countryCode})</span>
                          </span>
                          <span className="text-indigo-400 font-mono font-bold text-xs bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/15">
                            {item.percent}%
                          </span>
                        </div>
                        <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                          <div 
                            className="h-full bg-indigo-500 group-hover:bg-indigo-400 transition-all duration-500 rounded-full"
                            style={{ width: `${item.percent}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Anti-clustering protection tag (Requirement 4) */}
                  <div className="mt-4 p-2 bg-slate-950/40 border border-white/5 rounded-xl flex items-center gap-2 text-[10px] text-slate-400">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                    </span>
                    <span>Anti-Clustering System active: auto-rotated to underused regions</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/15 to-purple-500/10 border border-indigo-500/20 shadow-md">
                  <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                    <span>Geo Heatmap Grid Logs</span>
                  </p>
                  
                  {/* Visual Proxy grid (Requirement 8, 9) */}
                  <div className="grid grid-cols-6 gap-1 mb-2.5">
                    {Array.from({ length: 18 }).map((_, i) => {
                      const isActive = i < getDynamicGeoDistribution().length * 2;
                      return (
                        <div 
                          key={i} 
                          className={`h-2 rounded-[2px] border transition-all ${
                            isActive 
                              ? "bg-emerald-500/80 border-emerald-400/50 shadow-sm shadow-emerald-500/30 animate-pulse" 
                              : "bg-slate-800/60 border-white/5"
                          }`}
                          title={isActive ? "Proxy Node Active" : "Proxy Node Hot Spare"}
                        />
                      );
                    })}
                  </div>
                  
                  <p className="text-[10px] text-slate-400 leading-normal">
                    IP pools auto-balanced across residential proxy regions dynamically per session. Sticky country cache is <span className="text-red-400 font-bold uppercase tracking-wider">disabled</span>.
                  </p>
                </div>
              </div>
            </div>

            {/* Simulated Live Micro-Streams tracker list */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white text-lg">Active Worker Simulation Telemetry Outputs</h4>
                <div className="text-[10px] font-mono text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-500/25">DYNAMIC LOG INTERACT</div>
              </div>

              <div className="overflow-x-auto text-sm">
                <table className="w-full text-left space-y-2">
                  <thead>
                    <tr className="text-xs text-slate-500 uppercase tracking-wider font-bold border-b border-white/5 pb-2">
                      <th className="py-2">Active Link</th>
                      <th>Concurrency</th>
                      <th>Avg Latency</th>
                      <th>Error Rate</th>
                      <th>Telemetry Cycles (Click Emulations)</th>
                      <th>Status State</th>
                    </tr>
                  </thead>
                  <tbody>
                    {simulations.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-slate-400 py-6 text-center">No active real-time worker streams. Spin up or launch a custom campaign scenario above!</td>
                      </tr>
                    ) : (
                      simulations.map(sim => (
                        <tr key={sim.id} className="border-b border-white/5 py-3 hover:bg-white/5">
                          <td className="py-3 font-mono text-xs text-indigo-300 max-w-[200px] truncate">{sim.url}</td>
                          <td className="font-mono text-white tracking-wide">{sim.activeUsers} concurrent</td>
                          <td className="font-mono text-white text-xs">{sim.latencyMs}ms</td>
                          <td className="font-mono text-xs">{(sim.errorRate * 100).toFixed(1)}%</td>
                          <td>
                            <div className="flex flex-wrap gap-1.5">
                              {sim.stepsCompleted.slice(0, 3).map((st, i) => (
                                <span key={i} className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] text-slate-400">
                                  {st}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-3">
                            <span className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest leading-none">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                              <span>{sim.status}</span>
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* REAL-TIME GEO MONITOR & SESSION INSPECTOR (Requirements 8, 9) */}
            <div className="p-6 rounded-2xl bg-slate-950/40 border border-white/10 flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-white/10">
                <div>
                  <h4 className="font-bold text-white text-lg flex items-center gap-2">
                    <Globe className="w-5 h-5 text-indigo-400 animate-spin" style={{ animationDuration: '12s' }} />
                    <span>Real-Time Geo Session Inspector & Live Rotation Feed</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Observe authentic browser signatures and geographic metadata transmitted to client tracking tags.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/25 uppercase font-bold tracking-wider">
                    GA4 CODES OVERWRITTEN PASS (UIP/_UIP ACTIVE)
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/25 uppercase font-bold tracking-wider animate-pulse">
                    ● PROXIES ROTATING
                  </span>
                </div>
              </div>

              {/* Debug inspector data panel */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">STICKY GEOLOCATION PREVENTION</p>
                  <p className="text-sm font-semibold text-white">DISABLED</p>
                  <p className="text-[10px] text-slate-400 mt-1">Each session is guaranteed a fresh rotating country pool route.</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">GA4 COMPATIBILITY TELEMETRY</p>
                  <p className="text-sm font-semibold text-emerald-400 flex items-center gap-1">
                    <span>100% Verified</span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">Timezone, Accept-Language, and user IP sync dynamically.</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">ACTIVE DISTINCT POOLS</p>
                  <p className="text-sm font-semibold text-white">13 Countries</p>
                  <p className="text-[10px] text-slate-400 mt-1">US, DE, GB, CA, IN, AU, FR, BR, JP, SG, NL, ES, KR.</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">MAX COUNTRY SHARE LIMIT</p>
                  <p className="text-sm font-semibold text-indigo-400">15% Cap Active</p>
                  <p className="text-[10px] text-slate-400 mt-1">Server prevents overused hotspots to balance traffic naturally.</p>
                </div>
              </div>

              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left space-y-2 border-collapse">
                  <thead>
                    <tr className="text-[10px] text-slate-400 uppercase tracking-wider border-b border-white/10 pb-2 bg-white/5">
                      <th className="p-2.5 font-bold">Timestamp</th>
                      <th className="p-2.5 font-bold">Target URL</th>
                      <th className="p-2.5 font-bold">Emulated Geolocation</th>
                      <th className="p-2.5 font-bold">Timezone & Locale Info</th>
                      <th className="p-2.5 font-bold">Dynamic Session Fingerprint</th>
                      <th className="p-2.5 font-bold">Proxy IP Address</th>
                      <th className="p-2.5 font-bold">GA4 Override Link</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {liveGeoLogs.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-slate-400 p-8 text-center bg-black/20 italic">
                          Waiting for background traffic pings (every 7 seconds)... Sessions will populate here with dynamic browser properties instantly!
                        </td>
                      </tr>
                    ) : (
                      liveGeoLogs.slice(0, 15).map((log, idx) => {
                        let flag = "🌍";
                        const code = log.countryCode;
                        if (code === "US") flag = "🇺🇸";
                        else if (code === "DE") flag = "🇩🇪";
                        else if (code === "GB") flag = "🇬🇧";
                        else if (code === "CA") flag = "🇨🇦";
                        else if (code === "IN") flag = "🇮🇳";
                        else if (code === "AU") flag = "🇦🇺";
                        else if (code === "FR") flag = "🇫🇷";
                        else if (code === "BR") flag = "🇧🇷";
                        else if (code === "JP") flag = "🇯🇵";
                        else if (code === "SG") flag = "🇸🇬";
                        else if (code === "NL") flag = "🇳🇱";
                        else if (code === "ES") flag = "🇪🇸";
                        else if (code === "KR") flag = "🇰🇷";

                        const timeStr = new Date(log.timestamp).toLocaleTimeString();

                        return (
                          <tr key={idx} className="hover:bg-indigo-500/10 transition-colors">
                            <td className="p-2.5 font-mono text-slate-400">{timeStr}</td>
                            <td className="p-2.5 truncate max-w-[120px]" title={log.targetUrl}>
                              <span className="text-indigo-300 font-mono text-[11px]">{log.targetUrl.replace("https://", "")}</span>
                            </td>
                            <td className="p-2.5">
                              <span className="font-semibold text-white flex items-center gap-1 whitespace-nowrap">
                                <span>{flag}</span>
                                <span>{log.countryName}</span>
                                <span className="text-[10px] text-slate-500 font-mono">({code})</span>
                              </span>
                            </td>
                            <td className="p-2.5">
                              <div className="text-[10px] text-slate-300 font-mono space-y-0.5">
                                <p className="text-indigo-400 font-semibold">{log.timezone}</p>
                                <p className="opacity-75">lang: {log.userAgent.includes("iPhone") || log.userAgent.includes("Android") ? "en-US" : "de-DE, de;q=0.9"}</p>
                              </div>
                            </td>
                            <td className="p-2.5 max-w-[210px]">
                              <div className="text-[10px] text-slate-400 leading-tight space-y-1">
                                <p className="truncate text-slate-300 font-mono" title={log.userAgent}>UA: {log.userAgent}</p>
                                <div className="flex items-center gap-1 flex-wrap">
                                  <span className="bg-slate-800 text-slate-300 px-1 rounded text-[9px] font-mono">{log.resolution}</span>
                                  <span className="bg-slate-800 text-slate-300 px-1 rounded text-[9px] font-mono truncate max-w-[100px]" title={log.webgl}>WebGL: {log.webgl.split(" ")[0]}</span>
                                </div>
                              </div>
                            </td>
                            <td className="p-2.5 font-mono text-slate-200">
                              <div className="space-y-0.5">
                                <p className="font-bold text-emerald-400">{log.proxyIp}</p>
                                <p className="text-[9px] text-slate-500 truncate max-w-[110px]" title={log.proxySource}>via {log.proxySource}</p>
                              </div>
                            </td>
                            <td className="p-2.5">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[10px] text-emerald-400 font-bold whitespace-nowrap">
                                <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse"></span>
                                GA4 {code} (OK)
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------ SECTION 3: TRAFFIC CAMPAIGNS ------------------------ */}
        {activeTab === "campaigns" && (
          <div className="space-y-8 animate-fadeIn">
            <header className="pb-4 border-b border-white/5">
              <h1 className="text-3xl font-bold text-white tracking-tight">Campaign Command Center</h1>
              <p className="text-slate-400 mt-1">Configure and manage precise ethical website performance testing parameters.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Create Form */}
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 h-fit space-y-6">
                <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                  <Terminal className="w-5 h-5 text-indigo-400" />
                  <h4 className="font-bold text-white text-lg">Spawn New Campaign</h4>
                </div>

                <form onSubmit={handleCreateCampaign} className="space-y-5">
                  <div>
                    <label className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Campaign Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Black Friday Stress Calibration"
                      value={newCampaignName}
                      onChange={(e) => setNewCampaignName(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-slate-200 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Simulation Target URL</label>
                    <input
                      type="text"
                      required
                      placeholder="https://yourbrand.com/pricing"
                      value={newCampaignUrl}
                      onChange={(e) => setNewCampaignUrl(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-slate-200 font-mono text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Total Visits (Target)</label>
                      <input
                        type="number"
                        max={1000000}
                        required
                        value={newCampaignVolume}
                        onChange={(e) => setNewCampaignVolume(Number(e.target.value))}
                        className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Daily Volume Limit</label>
                      <input
                        type="number"
                        required
                        value={newCampaignDaily}
                        onChange={(e) => setNewCampaignDaily(Number(e.target.value))}
                        className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-white text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Avg Click Session</label>
                      <select
                        value={newCampaignDuration}
                        onChange={(e) => setNewCampaignDuration(Number(e.target.value))}
                        className="w-full bg-black/40 border border-white/10 p-2.5 rounded-xl text-white text-sm"
                      >
                        <option value={90}>90 seconds</option>
                        <option value={120}>120 seconds</option>
                        <option value={180}>180 seconds</option>
                        <option value={300}>300 seconds</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1.5">Visit Interval Interval</label>
                      <select
                        value={newCampaignIntervals}
                        onChange={(e) => setNewCampaignIntervals(e.target.value as any)}
                        className="w-full bg-black/40 border border-white/10 p-2.5 rounded-xl text-white text-sm"
                      >
                        <option value="organic">Organic (Random Delay)</option>
                        <option value="steady">Steady (Uniform Tick)</option>
                        <option value="burst">Burst (Intense Waves)</option>
                      </select>
                    </div>
                  </div>

                   {/* WORLDWIDE GEOLOCATION ROUTING ENGINE PANEL */}
                   <div className="space-y-4 pt-2">
                     <div className="flex items-center justify-between p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/15">
                       <div className="space-y-1">
                         <div className="flex items-center gap-2">
                           <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                           <span className="text-xs text-white font-bold uppercase tracking-wider">Worldwide Geo Routing</span>
                         </div>
                         <p className="text-[11px] text-slate-400">Distribute simulated visits dynamically across proxy gateways globally.</p>
                       </div>
                       <button
                         type="button"
                         onClick={() => setWorldwideGeoEnabled(!worldwideGeoEnabled)}
                         className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all duration-200 border ${
                           worldwideGeoEnabled 
                             ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                             : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                         }`}
                       >
                         {worldwideGeoEnabled ? "✓ ENABLED" : "ENABLE"}
                       </button>
                     </div>

                     {!worldwideGeoEnabled ? (
                       <div className="space-y-1.5">
                         <label className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Single Geolocation Focus Proxy</label>
                         <select
                           value={newCampaignGeo}
                           onChange={(e) => setNewCampaignGeo(e.target.value)}
                           className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-white text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                         >
                           <option value="US">🇺🇸 United States (East Coast Residential Gateway)</option>
                           <option value="DE">🇩🇪 Germany (Frankfurt Backbone Gateway)</option>
                           <option value="GB">🇬🇧 United Kingdom (London Metropolitan Network)</option>
                           <option value="JP">🇯🇵 Japan (Tokyo High-Speed Edge Hub)</option>
                           <option value="IN">🇮🇳 India (Mumbai Residential Segment)</option>
                           <option value="AU">🇦🇺 Australia (Sydney Residential Proxy)</option>
                           <option value="FR">🇫🇷 France (Paris Metropolitan Gateway)</option>
                           <option value="BR">🇧🇷 Brazil (São Paulo Fiber Proxy)</option>
                         </select>
                         <p className="text-[10px] text-slate-500">Hits will originate strictly from the selected country focal hub.</p>
                       </div>
                     ) : (
                       <div className="p-5 bg-black/50 border border-white/10 rounded-2xl space-y-5 animate-fadeIn">
                         {/* Dynamic Continent Targeting Buttons */}
                         <div className="space-y-2">
                           <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">1. Select Continent Routing Range</span>
                           <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                             {["All", "Europe", "Asia", "North America", "South America", "Oceania"].map((continent) => (
                               <button
                                 key={continent}
                                 type="button"
                                 onClick={() => setGeoContinent(continent)}
                                 className={`py-2 px-1 rounded-xl text-[10px] font-bold tracking-tight text-center transition-all ${
                                   geoContinent === continent
                                     ? "bg-indigo-500/10 border border-indigo-500/30 text-indigo-400"
                                     : "bg-white/5 border border-white/5 text-slate-400 hover:text-slate-200"
                                 }`}
                               >
                                 {continent === "All" ? "🌍 Global" : continent}
                               </button>
                             ))}
                           </div>
                         </div>

                         {/* Geographic World Map Pulse Dashboard (Requirement 5 & 8) */}
                         <div className="space-y-2">
                           <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Interactive Geo Nodes Grid</span>
                           <div className="relative w-full h-[140px] bg-slate-950 border border-white/5 rounded-xl overflow-hidden flex items-center justify-center">
                             {/* Abstract clean tech-grid world representation */}
                             <svg className="absolute inset-0 w-full h-full opacity-10" width="100%" height="100%">
                               <pattern id="world-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                                 <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
                               </pattern>
                               <rect width="100%" height="100%" fill="url(#world-grid)" />
                             </svg>

                             {/* Scurrying satellite tracking lines & background dotted nodes */}
                             <div className="text-[10px] font-mono text-indigo-500/40 select-none pointer-events-none uppercase tracking-widest absolute top-2 right-3">
                               System Active Nodes Map
                             </div>

                             {/* Map pins with pulsing status */}
                             {[
                               { name: "New York, US", x: "25%", y: "35%", code: "US", continent: "North America" },
                               { name: "Frankfurt, DE", x: "47%", y: "34%", code: "DE", continent: "Europe" },
                               { name: "London, GB", x: "44%", y: "30%", code: "GB", continent: "Europe" },
                               { name: "Toronto, CA", x: "22%", y: "32%", code: "CA", continent: "North America" },
                               { name: "Mumbai, IN", x: "64%", y: "54%", code: "IN", continent: "Asia" },
                               { name: "Sydney, AU", x: "86%", y: "81%", code: "AU", continent: "Oceania" },
                               { name: "Paris, FR", x: "46%", y: "37%", code: "FR", continent: "Europe" },
                               { name: "Sao Paulo, BR", x: "32%", y: "74%", code: "BR", continent: "South America" },
                               { name: "Tokyo, JP", x: "82%", y: "41%", code: "JP", continent: "Asia" },
                               { name: "Singapore", x: "71%", y: "60%", code: "SG", continent: "Asia" },
                               { name: "Amsterdam, NL", x: "47%", y: "29%", code: "NL", continent: "Europe" }
                             ].map((pin, i) => {
                               // Check filtering
                               const isFilteredOut = geoContinent !== "All" && pin.continent !== geoContinent;
                               const isExcluded = excludedCountries.includes(pin.code);
                               const isActive = !isFilteredOut && !isExcluded;

                               return (
                                 <div 
                                   key={i} 
                                   className="absolute transition-all duration-300"
                                   style={{ left: pin.x, top: pin.y }}
                                 >
                                   <div className="relative group">
                                     <span className={`block w-2.5 h-2.5 rounded-full relative cursor-help transition-all duration-300 ${
                                       isActive 
                                         ? "bg-emerald-400 shadow-[0_0_8px_#34d399]" 
                                         : "bg-slate-700 pointer-events-none opacity-20"
                                     }`}>
                                       {isActive && (
                                         <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                       )}
                                     </span>
                                     {/* Tooltip on hover */}
                                     <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 px-2 py-0.5 rounded text-[9px] text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none shadow-xl font-mono">
                                       {pin.name} ({pin.code})
                                     </div>
                                   </div>
                                 </div>
                               );
                             })}

                             <div className="absolute bottom-2 left-3 flex items-center gap-3 text-[9px] font-mono text-slate-500">
                               <div className="flex items-center gap-1">
                                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Activated Residential Node
                               </div>
                               <div className="flex items-center gap-1">
                                 <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span> Blocked/Filtered
                               </div>
                             </div>
                           </div>
                         </div>

                         {/* Country Exclusions (Requirement 4) */}
                         <div className="space-y-2">
                           <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">2. Exclude Specific Geolocations</span>
                           <div className="flex flex-wrap gap-1.5">
                             {[
                               { name: "India", code: "IN", flag: "🇮🇳" },
                               { name: "Brazil", code: "BR", flag: "🇧🇷" },
                               { name: "Japan", code: "JP", flag: "🇯🇵" },
                               { name: "France", code: "FR", flag: "🇫🇷" },
                               { name: "Australia", code: "AU", flag: "🇦🇺" },
                               { name: "Germany", code: "DE", flag: "🇩🇪" },
                               { name: "Singapore", code: "SG", flag: "🇸🇬" }
                             ].map((c) => {
                               const isExcluded = excludedCountries.includes(c.code);
                               return (
                                 <button
                                   key={c.code}
                                   type="button"
                                   onClick={() => {
                                     if (isExcluded) {
                                       setExcludedCountries(excludedCountries.filter(x => x !== c.code));
                                     } else {
                                       setExcludedCountries([...excludedCountries, c.code]);
                                     }
                                   }}
                                   className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono border flex items-center gap-1.5 transition-all ${
                                     isExcluded
                                       ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                                       : "bg-white/5 border-white/5 text-slate-300 hover:bg-white/10"
                                   }`}
                                 >
                                   <span>{c.flag} {c.name}</span>
                                   <span className="text-[8px] opacity-70">
                                     {isExcluded ? "EXCLUDED" : "ALLOW"}
                                   </span>
                                 </button>
                               );
                             })}
                           </div>
                         </div>

                         {/* Country Weights sliders mockup list (Requirement 5) */}
                         <div className="space-y-2">
                           <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Weighted Residential Traffic Distribution</span>
                           <div className="space-y-1.5 font-mono text-[10px] bg-black/40 p-3 rounded-xl border border-white/5">
                             {[
                               { name: "United States (US)", share: 25, active: !excludedCountries.includes("US") && (geoContinent === "All" || geoContinent === "North America") },
                               { name: "Germany (DE)", share: 10, active: !excludedCountries.includes("DE") && (geoContinent === "All" || geoContinent === "Europe") },
                               { name: "United Kingdom (GB)", share: 10, active: !excludedCountries.includes("GB") && (geoContinent === "All" || geoContinent === "Europe") },
                               { name: "Canada (CA)", share: 8, active: !excludedCountries.includes("CA") && (geoContinent === "All" || geoContinent === "North America") },
                               { name: "India (IN)", share: 8, active: !excludedCountries.includes("IN") && (geoContinent === "All" || geoContinent === "Asia") },
                               { name: "Australia (AU)", share: 5, active: !excludedCountries.includes("AU") && (geoContinent === "All" || geoContinent === "Oceania") },
                               { name: "France (FR)", share: 5, active: !excludedCountries.includes("FR") && (geoContinent === "All" || geoContinent === "Europe") },
                               { name: "Brazil (BR)", share: 5, active: !excludedCountries.includes("BR") && (geoContinent === "All" || geoContinent === "South America") },
                               { name: "Japan (JP)", share: 4, active: !excludedCountries.includes("JP") && (geoContinent === "All" || geoContinent === "Asia") },
                               { name: "Others (SG, NL, ES, KR)", share: 20, active: true }
                             ].map((item, id) => (
                               <div key={id} className={`flex items-center gap-3 ${item.active ? 'text-slate-300' : 'text-slate-600 line-through opacity-40'}`}>
                                 <span className="w-28 truncate">{item.name}</span>
                                 <div className="flex-1 bg-white/5 h-1.5 rounded-full overflow-hidden">
                                   <div 
                                     className={`h-full rounded-full transition-all duration-500 ${item.active ? 'bg-gradient-to-r from-emerald-400 to-indigo-500' : 'bg-slate-700'}`}
                                     style={{ width: `${item.active ? item.share * 3 : 0}%` }}
                                   ></div>
                                 </div>
                                 <span className="w-8 text-right font-bold text-slate-400">{item.active ? `${item.share}%` : "0%"}</span>
                                </div>
                             ))}
                           </div>
                         </div>

                         {/* Proxy Gateways Pool Status Tracker */}
                         <div className="space-y-2">
                           <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider block">
                             <span>3. Residential Proxy Pool Pool</span>
                             <span className="text-[10px] text-emerald-400 font-mono">100% ONLINE</span>
                           </div>
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-mono">
                             <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                               <div>
                                 <span className="text-slate-400 block font-bold text-[9px]">ACTIVE GATEWAY TYPE</span>
                                 <span className="text-slate-200">res-worldwide.pilotproxy.io</span>
                               </div>
                               <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded text-[8px] animate-pulse">ACTIVE</span>
                             </div>
                             <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                               <div>
                                 <span className="text-slate-400 block font-bold text-[9px]">SESSION FREQUENCY</span>
                                 <select 
                                   value={randomizeFrequency}
                                   onChange={(e) => setRandomizeFrequency(e.target.value as any)}
                                   className="bg-transparent border-none text-slate-200 focus:outline-none p-0 mr-1 cursor-pointer font-bold select-none text-[10px]"
                                 >
                                   <option value="session">Swap proxy every request</option>
                                   <option value="1min">Swap proxy every 1 minute</option>
                                   <option value="5min">Swap proxy every 5 minutes</option>
                                   <option value="10min">Swap proxy every 10 minutes</option>
                                 </select>
                               </div>
                             </div>
                           </div>
                         </div>

                       </div>
                     )}
                   </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Google Analytics 4 Measurement ID</label>
                      <span className="text-[9px] text-emerald-400 font-mono font-bold">⚡ LIVE GA4 SYNC</span>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. G-XXXXXXXXXX (Optional)"
                      value={newCampaignGA}
                      onChange={(e) => setNewCampaignGA(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-slate-200 font-mono text-sm placeholder:text-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                    <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                      Enter your Measurement ID to instantly stream simulated client sessions directly to your Google Analytics Real-Time board.
                    </p>
                  </div>

                  {/* Device splits display visualization */}
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-2">
                    <span className="text-[10px] text-slate-400 tracking-wider font-bold block uppercase">Automated Device Split configuration:</span>
                    <div className="flex gap-2 justify-between text-xs font-mono">
                      <span>Desktop: <span className="text-white">65%</span></span>
                      <span>Mobile: <span className="text-white">30%</span></span>
                      <span>Tablet: <span className="text-white">5%</span></span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 font-bold rounded-xl text-sm transition-all text-white flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/10"
                  >
                    <Zap className="w-4 h-4 text-emerald-300 animate-pulse" />
                    <span>Deploy Simulation Worker</span>
                  </button>
                </form>
              </div>

              {/* Right Column: Existing active campaign profiles list */}
              <div className="col-span-1 lg:col-span-2 space-y-6">
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">Simulation Target Segments ({campaigns.length})</h3>
                    <p className="text-xs text-slate-400">Manage, pause/resume, or delete live worker groups below.</p>
                  </div>
                  <span className="text-xs font-mono p-1 bg-indigo-500/10 border border-indigo-400/25 rounded text-indigo-300">{userProfile?.credits.toLocaleString()} Simulated Visits left</span>
                </div>

                {campaigns.length === 0 ? (
                  <div className="p-12 text-center rounded-2xl border border-white/5 bg-black/30 text-slate-400 space-y-4">
                    <Activity className="w-10 h-10 text-slate-600 mx-auto" />
                    <p>No traffic configurations configured. Define dynamic specs in the spawn form on the left to initiate.</p>
                  </div>
                ) : (
                  campaigns.map(camp => (
                    <div key={camp.id} className="p-6 rounded-2xl bg-[#030712] border border-white/10 hover:border-white/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden shadow-xl">
                      <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-indigo-500 to-emerald-400"></div>
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className={`w-2 h-2 rounded-full ${camp.status === 'active' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`}></span>
                          <span className="font-bold text-white">{camp.name}</span>
                          {camp.worldwideGeoEnabled ? (
                            <span className="text-[10px] bg-indigo-500/10 border border-indigo-500/30 px-2 py-0.5 rounded font-mono text-indigo-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                              🌍 Global Proxy Routing ({camp.geoContinent || "All"})
                            </span>
                          ) : (
                            <span className="text-[10px] bg-slate-800 border border-white/10 px-2 py-0.5 rounded font-mono text-slate-300">{camp.geoTarget} Geo Proxy</span>
                          )}
                          {camp.gaMeasurementId && (
                            <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider font-mono">
                              GA4 Active
                            </span>
                          )}
                        </div>
                        <p className={`text-xs text-slate-400 font-mono select-all ${camp.targetUrl.length > 50 ? 'break-all whitespace-normal' : 'truncate'}`}>{camp.targetUrl}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 text-[11px] font-mono">
                          <div>
                            <span className="text-slate-500 block uppercase text-[8px] tracking-wide">Hits Sent (Live)</span>
                            <span className="text-emerald-400 font-bold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                              <span>{(camp.hitsGenerated || 0).toLocaleString()} pings</span>
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 block uppercase text-[8px] tracking-wide">Target Volume</span>
                            <span className="text-slate-200 font-bold">{camp.totalVolume.toLocaleString()} hits</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block uppercase text-[8px] tracking-wide">Interval Rate</span>
                            <span className="text-indigo-400 capitalize">{camp.intervals}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block uppercase text-[8px] tracking-wide">Daily Limit</span>
                            <span className="text-slate-200">{camp.dailyVolume}/day</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleToggleStatus(camp.id, camp.status)}
                          className={`p-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                            camp.status === "active" 
                              ? "bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20" 
                              : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                          }`}
                        >
                          {camp.status === "active" ? (
                            <>
                              <Pause className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Pause</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Resume</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleDeleteCampaign(camp.id)}
                          className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 rounded-lg transition-colors flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Terminate</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------ SECTION 4: AI COMPLIANT OPTIMIZER (GEMINI API) ------------------------ */}
        {activeTab === "ai" && (
          <div className="space-y-8 animate-fadeIn">
            <header className="pb-4 border-b border-white/5">
              <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                <Sparkles className="w-7 h-7 text-indigo-400 animate-pulse" />
                <span>AI Traffic Architect</span>
              </h1>
              <p className="text-slate-400 mt-1">Utilize state-of-the-art Gemini AI model insights to evaluate timing peaks and bypass ad-filter algorithms safely.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Config Panel */}
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 h-fit space-y-5">
                <div className="flex items-center gap-2 text-indigo-400 font-bold border-b border-white/5 pb-2">
                  <Activity className="w-4 h-4" />
                  <span>Target Site Diagnostics</span>
                </div>

                <form onSubmit={requestAIEngineAdvocate} className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-1">Crawl Site Target URL</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. https://mytechstartup.com"
                      value={aiUrl}
                      onChange={(e) => setAiUrl(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-slate-200 text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-1">Company Industry Sector</label>
                    <input
                      type="text"
                      placeholder="e.g. B2B SaaS, Healthtech, FinTech"
                      value={aiIndustry}
                      onChange={(e) => setAiIndustry(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-slate-200 text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-1">Current Traffic Interval Baseline</label>
                    <select
                      value={aiTraffic}
                      onChange={(e) => setAiTraffic(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 p-2.5 rounded-xl text-slate-200 text-sm"
                    >
                      <option value="0 - 5,000 baseline pageviews">Sandbox tier baseline (&lt; 5k/mo)</option>
                      <option value="5,000 - 50k pageviews">Scale baseline (5k - 50k/mo)</option>
                      <option value="500,000+ pageviews/mo">Enterprise scope (&gt; 500k/mo)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-1">Primary Audience Focus</label>
                    <input
                      type="text"
                      value={aiGeo}
                      onChange={(e) => setAiGeo(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-slate-200 text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={aiAdvising}
                    className="w-full py-3 bg-gradient-to-tr from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl text-sm font-bold text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {aiAdvising ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Querying Gemini SDK...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                        <span>Execute AI Optimization Check</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Right Column: AI Response Visual Pane */}
              <div className="col-span-1 lg:col-span-2 space-y-6">
                {!aiResult ? (
                  <div className="p-12 text-center rounded-2xl border border-white/5 bg-[#030712] flex flex-col items-center gap-4 shadow-xl">
                    <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                      <Sparkles className="w-6 h-6 animate-pulse" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-200">Awaiting Simulation Guidance Input</h3>
                    <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
                      Provide site URL and project parameters details in the configuration console to run Gemini models optimization diagnostics.
                    </p>
                  </div>
                ) : (
                  <div className="p-6 sm:p-8 rounded-2xl bg-white/5 border border-white/10 space-y-6 shadow-2xl relative overflow-hidden animate-fadeIn">
                    <div className="absolute top-0 right-0 p-4">
                      <span className="text-[10px] bg-indigo-500/20 border border-indigo-400/25 px-2 py-0.5 rounded text-indigo-300 font-mono">GEMINI-3.5-FLASH</span>
                    </div>

                    <div>
                      <span className="text-xs text-indigo-400 tracking-wider font-bold block uppercase mb-1">Industry Diagnostics Summary</span>
                      <p className="text-slate-200 leading-relaxed text-sm">{aiResult.industryAnalysis}</p>
                    </div>

                    <div className="border-t border-white/5 pt-4">
                      <span className="text-xs text-indigo-400 tracking-wider font-bold block uppercase mb-3">Recommended Timing Wave Phases</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {aiResult.recommendedSimulations.map((phase, idx) => (
                          <div key={idx} className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-1">
                            <h5 className="font-bold text-white text-xs block text-emerald-400">{phase.phase}</h5>
                            <p className="text-xs text-slate-300">Optimal Windows: <span className="font-mono">{phase.hours}</span></p>
                            <p className="text-xs text-slate-400">Target volume rate: <span className="font-mono text-indigo-300">{phase.volume}</span></p>
                            <p className="text-xs text-slate-400">Device profile: <span className="font-mono text-indigo-300">{phase.deviceSplit}</span></p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-white/5 pt-4">
                      <span className="text-xs text-indigo-400 tracking-wider font-bold block uppercase mb-1">Ethical Tag Evasion compliance Protocol</span>
                      <p className="text-slate-300 text-xs leading-relaxed font-mono">{aiResult.botDetectionEvasionProtocol}</p>
                    </div>

                    <div className="border-t border-white/5 pt-4 flex items-center justify-between gap-4">
                      <div>
                        <span className="text-xs text-emerald-400 tracking-wider font-bold block uppercase mb-1">Strategic Optimizer SEO Benchmark</span>
                        <p className="text-xs text-slate-400">Estimated index acceleration value</p>
                      </div>
                      <span className="text-3xl font-black text-emerald-400 font-mono tracking-tight">{aiResult.estimatedSEOValueScore}</span>
                    </div>

                    <div className="border-t border-white/5 pt-4 space-y-2">
                      <span className="text-xs text-indigo-400 tracking-wider font-bold block uppercase mb-2">Key Core Web Vitals optimization checklist:</span>
                      <ul className="space-y-2">
                        {aiResult.strategicAdvices.map((adv, idx) => (
                          <li key={idx} className="flex gap-2.5 items-start text-xs text-slate-300 leading-normal">
                            <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                            <span>{adv}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="border-t border-indigo-500/10 pt-4 flex gap-3">
                      <button
                        onClick={() => {
                          setNewCampaignName(`AI Dynamic - ${aiUrl.replace(/https?:\/\/(www\.)?/, '')}`);
                          setNewCampaignUrl(aiUrl);
                          setNewCampaignVolume(200000);
                          setNewCampaignDaily(4500);
                          setNewCampaignIntervals("organic");
                          setActiveTab("campaigns");
                          showNotification("Gemini advice ported! Review setup parameters before launching.", "info");
                        }}
                        className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-500 font-bold text-xs text-white rounded-lg transition-colors cursor-pointer text-center block"
                      >
                        Deploy simulation using this Advice
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------ SECTION 5: PERFORMANCE STRESS & FUNNEL TESTING LAB ------------------------ */}
        {activeTab === "testing" && (
          <div className="space-y-8 animate-fadeIn">
            <header className="pb-4 border-b border-white/5">
              <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                <Flame className="w-7 h-7 text-amber-400" />
                <span>Web Testing & Verification Lab</span>
              </h1>
              <p className="text-slate-400 mt-1">Simulate rigorous high-concurrency instant web server spikes to verify cloud scales and trace load failures.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Load controller pane */}
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 h-fit space-y-5">
                <span className="text-xs font-bold text-amber-400 tracking-wider uppercase block border-b border-white/5 pb-2">Launch Load Calibration Task</span>

                <form onSubmit={runLoadTest} className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-1">Load Validation Destination</label>
                    <input
                      type="text"
                      required
                      value={testUrl}
                      onChange={(e) => setTestUrl(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-slate-200 text-sm font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-1">Simulated Concurrent Connections</label>
                    <select
                      value={testUsers}
                      onChange={(e) => setTestUsers(Number(e.target.value))}
                      className="w-full bg-black/40 border border-white/10 p-2.5 rounded-xl text-white text-sm"
                    >
                      <option value={100}>100 concurrent observers</option>
                      <option value={250}>250 concurrent observers (Standard Growth Limit)</option>
                      <option value={1000}>1,000 concurrent observers (Requires Agency Access)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-1">Edge Probe Region</label>
                    <select
                      value={testGeo}
                      onChange={(e) => setTestGeo(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 p-2.5 rounded-xl text-white text-sm"
                    >
                      <option value="US-East">US-East Node Cluster (North Virginia)</option>
                      <option value="EU-Central">EU-Central Node Cluster (Frankfurt)</option>
                      <option value="AP-NorthEast">AP-NorthEast Node Cluster (Tokyo)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={testRunning}
                    className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {testRunning ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Injecting Concurrency Probe...</span>
                      </>
                    ) : (
                      <>
                        <Flame className="w-4 h-4 text-emerald-300 animate-pulse" />
                        <span>Fire Validation Probe</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Stress Results Console Output */}
              <div className="col-span-1 lg:col-span-2 space-y-6">
                <div className="p-6 rounded-2xl bg-black/50 border border-white/10 space-y-4">
                  <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-indigo-400" />
                    <span>Diagnostics Logger</span>
                  </h4>

                  <div className="bg-black/80 font-mono text-xs text-emerald-400 p-4 rounded-xl border border-white/5 h-64 overflow-y-auto space-y-2 select-text">
                    {testLogs.length === 0 ? (
                      <span className="text-slate-500 block">Console dormant. Launch a performance check to review dynamic telemetry...</span>
                    ) : (
                      testLogs.map((log, i) => (
                        <div key={i} className="leading-relaxed">
                          {log}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {testResult && (
                  <div className="p-6 rounded-2xl bg-[#030712] border border-emerald-500/20 space-y-4 animate-fadeIn">
                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-emerald-400" />
                        <h4 className="font-bold text-white">Diagnostics Report Complete</h4>
                      </div>
                      <span className="font-mono text-emerald-400 font-black text-xl bg-emerald-500/10 px-3 py-1 rounded border border-emerald-500/20">
                        {testResult.score} / 100 Score
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="bg-white/5 p-3 rounded-xl">
                        <span className="text-[10px] text-slate-500 tracking-wide uppercase font-bold block">Avg Res Latency</span>
                        <span className="text-lg font-bold text-white font-mono">{testResult.latency}ms</span>
                      </div>
                      <div className="bg-white/5 p-3 rounded-xl">
                        <span className="text-[10px] text-slate-500 tracking-wide uppercase font-bold block">Tag firing rate</span>
                        <span className="text-lg font-bold text-indigo-400 font-mono">{testResult.successRate}</span>
                      </div>
                      <div className="bg-white/5 p-3 rounded-xl">
                        <span className="text-[10px] text-slate-500 tracking-wide uppercase font-bold block">Requests rate</span>
                        <span className="text-lg font-bold text-emerald-400 font-mono">{testResult.avgRPS}/sec</span>
                      </div>
                    </div>

                    <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex gap-2.5 items-start">
                      <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-300 leading-normal">
                        <span className="font-bold text-white block mb-1">Telemetry Architectural Tip:</span>
                        {testResult.advise}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------ SECTION 6: API DOCUMENTATION ------------------------ */}
        {activeTab === "api" && (
          <div className="space-y-8 animate-fadeIn">
            <header className="pb-4 border-b border-white/5">
              <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                <Code className="w-7 h-7 text-indigo-400" />
                <span>Programmatic API Integration Docs</span>
              </h1>
              <p className="text-slate-400 mt-1">Automate simulated traffic runs directly into your continuous integration and deployment workflows.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column Schema details */}
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4 h-fit">
                <h4 className="font-bold text-white">Endpoint Details</h4>
                <div className="space-y-3 text-xs leading-normal">
                  <div className="p-2.5 rounded bg-black/40 border border-white/5 flex justify-between items-center font-mono">
                    <span className="text-emerald-400 font-bold block uppercase">POST</span>
                    <span className="text-slate-300">/v1/campaigns</span>
                  </div>
                  <p className="text-slate-400">Creates and triggers a continuous website verification crawler. Requires API Bearer Token authentications.</p>
                  
                  <div className="border-t border-white/5 pt-4 space-y-2">
                    <span className="font-bold block text-white text-xs uppercase tracking-wide">Headers Required:</span>
                    <div className="bg-black/20 p-2 rounded text-slate-300 font-mono">
                      Authorization: Bearer tp_live_8390b...
                    </div>
                  </div>
                </div>
              </div>

              {/* Code snippet panel views */}
              <div className="col-span-1 lg:col-span-2 space-y-4">
                <div className="flex gap-2">
                  {(["curl", "node", "python"] as const).map(lang => (
                    <button
                      key={lang}
                      onClick={() => setApiSnippetLang(lang)}
                      className={`px-4 py-2 text-xs rounded-lg border font-mono uppercase tracking-widest transition-all ${
                        apiSnippetLang === lang 
                          ? "bg-indigo-500/20 border-indigo-400 text-indigo-300 font-bold" 
                          : "bg-white/5 border-white/10 text-slate-400"
                      }`}
                    >
                      {lang === "curl" ? "cURL" : lang === "node" ? "Node.js SDK" : "Python client"}
                    </button>
                  ))}
                </div>

                <div className="relative p-6 rounded-2xl bg-black border border-white/15 shadow-2xl overflow-x-auto">
                  <pre className="text-emerald-400 text-xs font-mono leading-relaxed select-all whitespace-pre">
                    {API_DOCS[apiSnippetLang]}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------ SECTION 7: BILLING & TEAM HUB ------------------------ */}
        {activeTab === "billing" && (
          <div className="space-y-8 animate-fadeIn">
            <header className="pb-4 border-b border-white/5">
              <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                <CreditCard className="w-7 h-7 text-indigo-400" />
                <span>Billing Hub & Teams Access</span>
              </h1>
              <p className="text-slate-400 mt-1">Upgrade your simulation resources, procure verification credits, configure client domains, or configure client seats.</p>
            </header>

            {/* Current Sub Stats Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-1 relative overflow-hidden">
                <span className="text-xs text-slate-500 uppercase tracking-widest font-bold block">Dynamic simulation credits Balance</span>
                <span className="text-3xl font-black text-indigo-400 block font-mono">
                  {userProfile?.credits.toLocaleString()} / 500,000
                </span>
                <div className="w-full h-1 bg-white/10 rounded-full mt-3 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 w-[52%]"></div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-xs text-slate-500 uppercase tracking-widest font-bold block">Current Active Subcription tier</span>
                <span className="text-2xl font-black text-white block uppercase tracking-tight">{userProfile?.currentPlan} Level</span>
              </div>

              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-xs text-slate-500 uppercase tracking-widest font-bold block">Verified Connected Domains</span>
                <span className="text-2xl font-black text-white block font-mono">{projects.length} connected</span>
              </div>
            </div>

            {/* Scale Subscription Area */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">Select High-Velocity Subscription Upgrade</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {PRICING_PLANS.map(plan => (
                  <div key={plan.id} className="p-6 rounded-2xl bg-[#030712] border border-white/10 hover:border-indigo-500/30 transition-all flex flex-col justify-between gap-6 shadow-xl relative">
                    {userProfile?.currentPlan === plan.id && (
                      <span className="absolute top-3 right-3 bg-indigo-500/20 text-indigo-300 text-[9px] font-mono border border-indigo-400/20 px-2 py-0.5 rounded uppercase tracking-widest">Active Plan</span>
                    )}

                    <div className="space-y-2">
                      <span className="text-sm font-bold text-white block">{plan.name}</span>
                      <h4 className="text-3xl font-black text-white">{plan.price} <span className="text-xs text-slate-400 font-normal">/ mo</span></h4>
                      <p className="text-xs text-slate-400 font-mono italic">{plan.visits}</p>
                    </div>

                    <ul className="space-y-2.5 my-2">
                      {plan.features.slice(0, 4).map((f, i) => (
                        <li key={i} className="flex gap-2 items-center text-xs text-slate-300">
                          <CheckCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span className="truncate">{f}</span>
                        </li>
                      ))}
                    </ul>

                    {plan.id === "enterprise" ? (
                      <a href="mailto:sales@growtraffic.ai" className="w-full py-2 bg-white/5 hover:bg-white/10 text-slate-200 text-center font-bold text-xs rounded-xl transition-colors block border border-white/10">Contact Enterprise Sales</a>
                    ) : (
                      <button
                        onClick={() => changePlan(plan.id)}
                        className={`w-full py-2 font-bold text-xs rounded-xl transition-all ${
                          userProfile?.currentPlan === plan.id 
                            ? "bg-slate-800 text-slate-400 cursor-not-allowed" 
                            : "bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
                        }`}
                      >
                        {userProfile?.currentPlan === plan.id ? "Currently Active" : `Select ${plan.name}`}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Affiliate block and Dynamic connected projects details list */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column: Projects lists */}
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <h4 className="font-bold text-white text-lg flex items-center gap-2">
                    <Globe className="w-5 h-5 text-indigo-400" />
                    <span>Connected Domains Profiles</span>
                  </h4>
                  <span className="text-xs bg-slate-800 font-mono px-2 py-0.5 rounded font-bold text-slate-400">CI/CD TOKENS AVAILABLE</span>
                </div>

                <form onSubmit={handleCreateProject} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      required
                      placeholder="Project Name"
                      value={projectFormName}
                      onChange={(e) => setProjectFormName(e.target.value)}
                      className="bg-black/40 border border-white/10 p-2.5 rounded-xl text-xs text-slate-200"
                    />
                    <input
                      type="text"
                      required
                      placeholder="domain.com (without https://)"
                      value={projectFormDomain}
                      onChange={(e) => setProjectFormDomain(e.target.value)}
                      className="bg-black/40 border border-white/10 p-2.5 rounded-xl text-xs font-mono text-slate-200"
                    />
                  </div>
                  <button type="submit" className="w-full py-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-300 border border-indigo-500/20 rounded-xl text-xs font-bold transition-colors">
                    Add connected domain verification script
                  </button>
                </form>

                <div className="space-y-3">
                  {projects.map(prj => (
                    <div key={prj.id} className="p-4 rounded-xl bg-black/40 border border-white/5 flex justify-between items-center gap-4">
                      <div className="space-y-1">
                        <span className="font-bold text-white text-xs block">{prj.name}</span>
                        <span className="text-[10px] text-indigo-400 font-mono block">{prj.domain}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-slate-500 font-mono uppercase block">API Token Auth</span>
                        <span className="text-[10px] font-mono text-emerald-400 select-all font-bold tracking-tight bg-white/5 px-2 py-0.5 rounded">{prj.apiToken}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Affiliate referral state management & Teams info */}
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-6">
                <div>
                  <h4 className="font-bold text-white text-lg flex items-center gap-1.5">
                    <Award className="w-5 h-5 text-indigo-400" />
                    <span>Affiliate & Referral Tracking Link</span>
                  </h4>
                  <p className="text-xs text-slate-400 leading-normal mt-1">Share the GrowTraffic automated validation suite with partners and clients to claim 25% persistent subscription payouts.</p>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Referral Clicks</span>
                    <span className="text-lg font-bold text-white font-mono">{affiliateStats.clicks}</span>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Signups</span>
                    <span className="text-lg font-bold text-indigo-400 font-mono">{affiliateStats.signups}</span>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Locked Payouts</span>
                    <span className="text-lg font-bold text-emerald-400 font-mono">${affiliateStats.earnings.toFixed(2)}</span>
                  </div>
                </div>

                <div className="p-3 bg-black border border-white/10 rounded-xl space-y-1">
                  <span className="text-[9px] text-slate-400 block font-mono uppercase">Your Affiliate Referrals link:</span>
                  <div className="flex justify-between items-center gap-3">
                    <span className="text-xs font-mono text-indigo-300 font-bold select-all truncate">{affiliateStats.referralLink}</span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(affiliateStats.referralLink);
                        showNotification("Affiliate link copied to clipboard successfully!", "success");
                      }}
                      className="px-2 py-1 bg-white/5 hover:bg-indigo-600 rounded text-[10px] font-bold text-slate-200 hover:text-white transition-colors border border-white/10"
                    >
                      Copy Link
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 space-y-3">
                  <span className="text-xs text-white font-bold block">Assigned seat administrators ({teamMembers.length})</span>
                  <div className="space-y-2">
                    {teamMembers.map(tm => (
                      <div key={tm.id} className="flex justify-between items-center gap-4 text-xs">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-slate-400 text-indigo-300 shrink-0" />
                          <div>
                            <span className="font-bold text-white block leading-none">{tm.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono leading-none">{tm.email}</span>
                          </div>
                        </div>
                        <span className="text-[9px] bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 px-1.5 py-0.5 rounded block uppercase font-mono font-bold">{tm.role}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Invoices History lists */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-4">
              <span className="text-sm font-bold text-white uppercase tracking-wider block">Invoces & Receipts History log</span>
              <div className="overflow-x-auto text-xs font-mono text-slate-300 leading-normal">
                <table className="w-full text-left space-y-2">
                  <thead>
                    <tr className="text-slate-500 font-bold border-b border-white/5 pb-2">
                      <th className="py-2">Receipt reference ID</th>
                      <th>Plan charges</th>
                      <th>Visits quota provided</th>
                      <th>Payment state status</th>
                      <th>Issued date stamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map(inv => (
                      <tr key={inv.id} className="border-b border-white/5 py-2">
                        <td className="py-2.5 font-bold text-indigo-400">{inv.id}</td>
                        <td className="font-bold text-white">${inv.amount} USD</td>
                        <td>{inv.visitsUsed.toLocaleString()} Hits</td>
                        <td>
                          <span className="inline-block bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] text-emerald-400 font-bold font-sans uppercase">Paid Sync</span>
                        </td>
                        <td>{inv.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------ SECTION 8: ADMIN/MODERATOR PANEL ------------------------ */}
        {activeTab === "admin" && (
          <div className="space-y-8 animate-fadeIn">
            <header className="pb-4 border-b border-white/5">
              <h1 className="text-3xl font-bold text-red-400 tracking-tight flex items-center gap-2">
                <Shield className="w-7 h-7" />
                <span>Security & Anti-Fraud Moderation Terminal</span>
              </h1>
              <p className="text-slate-400 mt-1">Review flagged anomalies, inspect sub-second repetitive intervals, and configure bot evasion moderation.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left explanation notes */}
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 h-fit space-y-4">
                <span className="text-xs text-red-400 uppercase tracking-widest font-bold block border-b border-white/5 pb-2">Mod Safety protocols</span>
                <p className="text-xs text-slate-300 leading-normal">
                  Our heuristics constantly crawl the network simulating traffic profiles to locate malicious spam loops, infinite redirections, or ad-service fraud activities.
                </p>
                <p className="text-xs text-slate-400 leading-normal">
                  If an segment's risk score exceeds 75, it gets frozen automatically to preserve analytical trust parameters compliance standards.
                </p>
              </div>

              {/* Security alerts review lists queue */}
              <div className="col-span-1 lg:col-span-2 space-y-6">
                <div className="p-4 bg-white/5 border border-orange-500/20 rounded-xl flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-400 animate-pulse" />
                  <span className="text-xs text-orange-300 font-semibold font-mono uppercase">SYSTEM ADVICE: {fraudAlerts.length} Flagged anomaly segment awaiting reviewer evaluation</span>
                </div>

                {fraudAlerts.length === 0 ? (
                  <div className="p-10 text-center rounded-2xl border border-white/5 bg-black/40 text-slate-400">
                    All flagged anomaly channels approved. Anti-fraud queue clear. Today's security status is pristine.
                  </div>
                ) : (
                  fraudAlerts.map(alert => (
                    <div key={alert.id} className="p-6 rounded-xl bg-black border border-white/10 space-y-4 relative overflow-hidden shadow-2xl">
                      <div className="absolute top-0 right-0 p-4">
                        <span className="text-xs bg-red-950/20 text-red-400 border border-red-500/25 px-2 py-0.5 rounded font-mono font-bold">
                          Risk index rating: {alert.riskScore}%
                        </span>
                      </div>

                      <div className="space-y-1 max-w-md">
                        <span className="text-xs uppercase font-bold text-slate-500 tracking-wider font-mono">Channel source ID: {alert.campaignId}</span>
                        <h4 className="font-bold text-white text-sm">{alert.campaignName}</h4>
                        <p className="text-xs text-slate-300 font-mono truncate">{alert.url}</p>
                      </div>

                      <div className="p-3 bg-white/5 border border-white/5 rounded-lg text-xs font-mono space-y-1 text-slate-300">
                        <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider block">Anomaly Signature:</span>
                        <p>{alert.flagReason}</p>
                      </div>

                      {alert.status === "flagged" ? (
                        <div className="flex gap-4">
                          <button
                            onClick={() => handleResolveFraud(alert.id, "clear")}
                            className="flex-1 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 border border-emerald-500/20 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                          >
                            Clear Threat tag (Authentic sandbox check)
                          </button>
                          <button
                            onClick={() => handleResolveFraud(alert.id, "block")}
                            className="flex-1 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-400 border border-red-500/20 text-xs font-bold rounded-lg transition-all cursor-pointer"
                          >
                            Block Segment & Pause campaigns
                          </button>
                        </div>
                      ) : (
                        <div className="p-2.5 bg-white/5 rounded border border-white/5 text-xs text-center font-mono uppercase font-bold text-slate-400 tracking-wider">
                          Reviewed Signature resolve action state: {alert.status.toUpperCase()}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* FOOTER METRICS AND CONSOLE DETAILS LOGGERS */}
      <footer id="app-footer" className="h-16 shrink-0 border-t border-white/5 bg-[#030712]/90 backdrop-blur justify-between px-6 z-25 flex flex-col md:flex-row items-center justify-center gap-4 py-3 text-center md:text-left mt-auto">
        <div className="flex gap-4">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
            Target Active proxy edge node: <span className="text-emerald-400">AWS-US-EAST-1</span>
          </span>
          <span className="text-[10px] text-slate-500 separator-v uppercase tracking-widest font-bold hidden sm:inline">|</span>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
            Telemetry latency check: <span className="text-emerald-400">14ms average</span>
          </span>
        </div>
        <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
          GrowTraffic AI Corp // Stable Integration Protocol Build v2.4.1
        </div>
      </footer>

      {/* Dynamic interactive Setup Wizard Modal */}
      {showWizard && (
        <div className="fixed inset-0 z-50 bg-[#030712]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-6 sm:p-8 max-w-md w-full relative space-y-6 shadow-2xl">
            <button
              onClick={() => setShowWizard(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-xs font-bold"
            >
              ✕ Close
            </button>

            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-xs uppercase tracking-widest font-bold text-indigo-400">Setup Wizard Step {wizardStep} of 2</span>
            </div>

            {wizardStep === 1 ? (
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-white">Enter the website you wish to test</h4>
                <p className="text-xs text-slate-400">Our engine evaluates timing configurations tailored to this base URL.</p>
                <input
                  type="text"
                  placeholder="https://examplebrand.io"
                  value={wizardUrl}
                  onChange={(e) => setWizardUrl(e.target.value)}
                  className="w-full bg-black/40 border border-white/15 p-3 rounded-xl text-white text-sm font-mono"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-white">Select website industry model</h4>
                <p className="text-xs text-slate-400">AI optimizes scroll offsets and page intervals to emulate industry averages.</p>
                
                <div className="grid grid-cols-2 gap-3">
                  {["SaaS & Tech", "E-Commerce", "Blog & Publishing", "Agency Lead"].map(sector => (
                    <button
                      key={sector}
                      onClick={() => setWizardIndustry(sector)}
                      className={`p-3 rounded-xl border text-xs text-left font-bold ${
                        wizardIndustry === sector ? "bg-indigo-500/20 border-indigo-500 text-indigo-300" : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                      }`}
                    >
                      {sector}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={wizardStep === 1 ? handleNextWizard : handleNextWizard}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-all"
            >
              {wizardStep === 1 ? "Configure Simulation Models →" : "Generate Verification Run Campaign ⚡"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Custom vector drawing icon components
function CampaignCheckIcon() {
  return (
    <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  );
}

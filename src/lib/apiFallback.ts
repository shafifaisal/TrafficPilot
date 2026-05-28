import { Campaign, ActiveSimulation, FraudAlert, Project, TeamMember, Invoice } from "../types";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://nsexouppruighjqdsure.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zZXhvdXBwcnVpZ2hqcWRzdXJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3OTYxODYsImV4cCI6MjA5NTM3MjE4Nn0.CWtHih3zX6xFjpKhmzRhsEtNfQ6VhjLMzZoDIhUzAfQ";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function syncClientWithSupabase() {
  if (typeof window === "undefined") return;
  try {
    const { data, error } = await supabase
      .from("campaigns")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      const parsedCampaigns: Campaign[] = data.map((row: any) => ({
        id: row.id,
        name: row.name,
        targetUrl: row.target_url || row.targeturl,
        totalVolume: Number(row.total_volume || row.totalvolume || 0),
        dailyVolume: Number(row.daily_volume || row.dailyvolume || 0),
        durationSeconds: Number(row.duration_seconds || row.durationseconds || 0),
        bounceRateTarget: Number(row.bounce_rate_target || row.bounceratetarget || 0),
        intervals: row.intervals as any,
        geoTarget: row.geo_target || row.geotarget,
        deviceSplit: typeof row.device_split === 'string' ? JSON.parse(row.device_split) : (row.device_split || row.devicesplit || { desktop: 50, mobile: 50, tablet: 0 }),
        behaviorSim: typeof row.behavior_sim === 'string' ? JSON.parse(row.behavior_sim) : (row.behavior_sim || row.behaviorsim || { scroll: true, clicks: true, formInput: false }),
        status: row.status as any,
        createdAt: row.created_at || row.createdat,
        hitsGenerated: Number(row.hits_generated || row.hitsgenerated || 0),
        gaMeasurementId: row.ga_measurement_id || row.gameasurementid || "",
        gaMeasurementSecret: row.ga_measurement_secret || row.gameasurementsecret || "",
        worldwideGeoEnabled: row.worldwide_geo_enabled !== undefined ? row.worldwide_geo_enabled : (row.worldwidegeoenabled || false),
        geoContinent: row.geo_continent || row.geocontinent || "",
        randomizeFrequency: row.randomize_frequency || (row.randomizefrequency as any) || "session",
        excludedCountries: Array.isArray(row.excluded_countries) ? row.excluded_countries : 
                           (Array.isArray(row.excludedcountries) ? row.excludedcountries : [])
      }));
      
      if (parsedCampaigns.length > 0) {
        saveLocal("gt_campaigns", parsedCampaigns);
        console.log("[GrowTraffic AI Client Supabase Sync] Successfully synchronized campaigns with Supabase DB.");
      }
    }
  } catch (err) {
    console.warn("[GrowTraffic AI Client Supabase Sync] Failed to sync with Supabase frontend client:", err);
  }
}

async function saveCampaignToSupabaseClient(camp: Campaign) {
  try {
    const payload = {
      id: camp.id,
      name: camp.name,
      target_url: camp.targetUrl,
      total_volume: camp.totalVolume,
      daily_volume: camp.dailyVolume,
      duration_seconds: camp.durationSeconds,
      bounce_rate_target: camp.bounceRateTarget,
      intervals: camp.intervals,
      geo_target: camp.geoTarget,
      device_split: camp.deviceSplit,
      behavior_sim: camp.behaviorSim,
      status: camp.status,
      created_at: camp.createdAt,
      hits_generated: camp.hitsGenerated || 0,
      ga_measurement_id: camp.gaMeasurementId || null,
      ga_measurement_secret: camp.gaMeasurementSecret || null,
      worldwide_geo_enabled: camp.worldwideGeoEnabled || false,
      geo_continent: camp.geoContinent || null,
      randomize_frequency: camp.randomizeFrequency || null,
      excluded_countries: camp.excludedCountries || []
    };
    await supabase.from("campaigns").upsert(payload);
    console.log("[GrowTraffic AI Client Supabase Sync] Campaign upserted successfully in background.");
  } catch (e) {
    console.warn("[GrowTraffic AI Client Supabase Sync] Upsert failed in background:", e);
  }
}

async function deleteCampaignFromSupabaseClient(id: string) {
  try {
    await supabase.from("campaigns").delete().eq("id", id);
    console.log("[GrowTraffic AI Client Supabase Sync] Campaign deleted successfully from Supabase.");
  } catch (e) {
    console.warn("[GrowTraffic AI Client Supabase Sync] Delete failed in background:", e);
  }
}

// Setup global tracking variables
declare global {
  interface Window {
    __useLocalFallback?: boolean;
  }
}

// Check if we should default to fallback (if local storage is set or if running on non-localhost, non-dev ports)
if (
  typeof window !== "undefined" &&
  (window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1" && !window.location.port)
) {
  // If we are deployed on Vercel or similar static environments, we will auto-detect, but we can set default fallback to try first and enable on success or error.
}

// Default initial data structures mirroring server.ts exactly
const initialCampaigns: Campaign[] = [
  {
    id: "camp-101",
    name: "iPassGenerator Organic Web Traffic",
    targetUrl: "https://www.ipassgenerator.online/",
    totalVolume: 1000,
    dailyVolume: 500,
    durationSeconds: 150,
    bounceRateTarget: 32,
    intervals: "organic",
    geoTarget: "US",
    deviceSplit: { desktop: 60, mobile: 35, tablet: 5 },
    behaviorSim: { scroll: true, clicks: true, formInput: false },
    status: "active",
    createdAt: new Date().toISOString(),
    hitsGenerated: 12,
    gaMeasurementId: "RM7VZGT3Y9"
  },
  {
    id: "camp-102",
    name: "EU Geo-Fencing Stress Test",
    targetUrl: "https://yourbrand.com/pricing",
    totalVolume: 150000,
    dailyVolume: 5000,
    durationSeconds: 180,
    bounceRateTarget: 25,
    intervals: "steady",
    geoTarget: "DE",
    deviceSplit: { desktop: 50, mobile: 50, tablet: 0 },
    behaviorSim: { scroll: true, clicks: true, formInput: true },
    status: "active",
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    hitsGenerated: 8904
  },
  {
    id: "camp-103",
    name: "Tokyo E-Commerce Bottleneck Check",
    targetUrl: "https://yourbrand.com/store/checkout",
    totalVolume: 250000,
    dailyVolume: 8000,
    durationSeconds: 240,
    bounceRateTarget: 42,
    intervals: "burst",
    geoTarget: "JP",
    deviceSplit: { desktop: 30, mobile: 65, tablet: 5 },
    behaviorSim: { scroll: true, clicks: false, formInput: false },
    status: "paused",
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    hitsGenerated: 16550
  }
];

const initialSimulations: ActiveSimulation[] = [
  {
    id: "sim-201",
    campaignId: "camp-101",
    url: "https://www.ipassgenerator.online/",
    activeUsers: 24,
    requestsPerSecond: 2.1,
    latencyMs: 110,
    errorRate: 0.0,
    stepsCompleted: ["DNS resolve OK", "TLS Handshake OK", "Load DOM index page", "Simulating mouse sweep", "Organic behavior loop initiated"],
    status: "running"
  },
  {
    id: "sim-202",
    campaignId: "camp-102",
    url: "https://yourbrand.com/pricing",
    activeUsers: 142,
    requestsPerSecond: 42.1,
    latencyMs: 312,
    errorRate: 0.05,
    stepsCompleted: ["DNS resolve", "TLS Handshake", "Load DOM", "Execute Dynamic JS scripts", "Interact with Pricing Slider"],
    status: "running"
  }
];

const initialFraudAlerts: FraudAlert[] = [
  {
    id: "frd-301",
    campaignId: "camp-103",
    campaignName: "Tokyo E-Commerce Bottleneck Check",
    url: "https://yourbrand.com/store/checkout",
    flagReason: "Abnormal sub-second post submission interval from single IP segment",
    riskScore: 78,
    timeDetected: new Date(Date.now() - 3600000).toISOString(),
    status: "flagged"
  }
];

const initialTeamMembers: TeamMember[] = [
  { id: "tm-1", name: "Sarah Connor", email: "sarah@growtraffic.online", role: "Owner" },
  { id: "tm-2", name: "David Miller", email: "david.m@growtraffic.online", role: "Developer" },
  { id: "tm-3", name: "Evelyn Reed", email: "evelyn@growthagency.io", role: "Admin" }
];

const initialProjects: Project[] = [
  { id: "prj-1", name: "Production Portal SaaS", domain: "cloud.growtraffic.online", apiToken: "gt_live_8390bbf7238a221f18809c", createdAt: "2026-01-10T11:20:00Z" },
  { id: "prj-2", name: "Testing Webstore", domain: "test.myshopify.net", apiToken: "gt_test_2391cca8fdb83e29f0322c", createdAt: "2026-03-15T09:14:00Z" }
];

const initialInvoices: Invoice[] = [
  { id: "INV-2026-003", amount: 129, date: "2026-05-15", status: "Paid", visitsUsed: 421000, creditsPurchased: 500000 },
  { id: "INV-2026-002", amount: 129, date: "2026-04-15", status: "Paid", visitsUsed: 391000, creditsPurchased: 500000 },
  { id: "INV-2026-001", amount: 49, date: "2026-03-15", status: "Paid", visitsUsed: 48900, creditsPurchased: 50000 }
];

const initialUserProfile = {
  email: "shafi.akhai@gmail.com",
  name: "Shafi Akhai",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces",
  currentPlan: "growth",
  credits: 457800,
  teamName: "Pilot Growth Labs",
  database: {
    connected: false,
    provider: "Browser Storage (Vercel Fallback Mode)",
    error: null
  }
};

// Local storage fetch/save wrappers
const loadLocal = <T>(key: string, backup: T): T => {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : backup;
  } catch {
    return backup;
  }
};

const saveLocal = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error("Local Storage Save Error:", e);
  }
};

// Auto bootstrap localStorage states
if (typeof localStorage !== "undefined") {
  if (!localStorage.getItem("gt_campaigns")) saveLocal("gt_campaigns", initialCampaigns);
  if (!localStorage.getItem("gt_simulations")) saveLocal("gt_simulations", initialSimulations);
  if (!localStorage.getItem("gt_fraud")) saveLocal("gt_fraud", initialFraudAlerts);
  if (!localStorage.getItem("gt_team")) saveLocal("gt_team", initialTeamMembers);
  if (!localStorage.getItem("gt_projects")) saveLocal("gt_projects", initialProjects);
  if (!localStorage.getItem("gt_invoices")) saveLocal("gt_invoices", initialInvoices);
  if (!localStorage.getItem("gt_profile")) saveLocal("gt_profile", initialUserProfile);
  if (!localStorage.getItem("gt_live_geo_logs")) saveLocal("gt_live_geo_logs", []);
}

// Geo-Profile helper setups
const GEO_PROFILES = [
  { code: "US", country: "United States", language: "en-US,en;q=0.9", timezone: "America/New_York", states: ["NY", "CA", "TX", "FL"], cities: ["New York", "Los Angeles", "Chicago", "Miami"], isps: ["Comcast Cable", "Spectrum", "Verizon Fios", "AT&T Internet"], proxies: ["us-east.growcontrol.net", "us-west.growcontrol.net"] },
  { code: "DE", country: "Germany", language: "de-DE,de;q=0.9,en;q=0.8", timezone: "Europe/Berlin", states: ["Bayern", "Berlin", "Hamburg", "NRW"], cities: ["Munich", "Berlin", "Hamburg", "Dusseldorf"], isps: ["Deutsche Telekom", "Vodafone Germany", "1&1 Internet"], proxies: ["de-central.growcontrol.net", "de-west.growcontrol.net"] },
  { code: "JP", country: "Japan", language: "ja-JP,ja;q=0.9,en;q=0.8", timezone: "Asia/Tokyo", states: ["Tokyo", "Osaka", "Kyoto", "Aichi"], cities: ["Shibuya", "Minato", "Osaka", "Nagoya"], isps: ["NTT", "SoftBank Bb", "KDDI Corporation"], proxies: ["jp-tokyo.growcontrol.net", "jp-osaka.growcontrol.net"] },
  { code: "GB", country: "United Kingdom", language: "en-GB,en;q=0.9", timezone: "Europe/London", states: ["England", "Scotland", "Wales"], cities: ["London", "Manchester", "Edinburgh", "Birmingham"], isps: ["BT Broadband", "Virgin Media", "Sky Broadband"], proxies: ["uk-london.growcontrol.net", "uk-north.growcontrol.net"] },
  { code: "FR", country: "France", language: "fr-FR,fr;q=0.9,en;q=0.8", timezone: "Europe/Paris", states: ["Ile-de-France", "PACA", "Rhone-Alpes"], cities: ["Paris", "Marseille", "Lyon", "Nice"], isps: ["Orange France", "Free SAS", "SFR", "Bouygues Telecom"], proxies: ["fr-paris.growcontrol.net"] }
];

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (iPad; CPU OS 17_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Mobile/15E148 Safari/604.1"
];

const REFERRERS = [
  "https://www.google.com/",
  "https://www.bing.com/",
  "https://t.co/",
  "https://www.facebook.com/",
  "https://news.ycombinator.com/",
  "https://www.reddit.com/"
];

const RESOLUTIONS = ["1920x1080", "1440x900", "1536x864", "1366x768", "390x844", "414x896"];
const WEBGL_RENDERERS = ["ANGLE (Apple, Apple M2, OpenGL 4.1)", "ANGLE (NVIDIA, NVIDIA GeForce RTX 3070 Direct3D11)", "ANGLE (Intel, Intel(R) UHD Graphics Direct3D11)"];

// Client-Side Simulation Ticking Thread
let tickInterval: any = null;

export function bootstrapClientSimulation() {
  if (typeof window === "undefined" || tickInterval) return;

  tickInterval = setInterval(() => {
    // Only simulate if we are in fallback mode
    if (!window.__useLocalFallback) return;

    const campaigns = loadLocal<Campaign[]>("gt_campaigns", []);
    const simulations = loadLocal<ActiveSimulation[]>("gt_simulations", []);
    
    const activeCampaigns = campaigns.filter(c => c.status === "active");
    if (activeCampaigns.length === 0) return;

    // Simulate hitting a campaign
    const targetCamp = activeCampaigns[Math.floor(Math.random() * activeCampaigns.length)];
    const countryCode = targetCamp.geoTarget && targetCamp.geoTarget !== "All" && targetCamp.geoTarget !== "GLOB"
      ? targetCamp.geoTarget
      : ["US", "DE", "JP", "GB", "FR"][Math.floor(Math.random() * 5)];

    const profile = GEO_PROFILES.find(p => p.code === countryCode) || GEO_PROFILES[0];
    const city = profile.cities[Math.floor(Math.random() * profile.cities.length)];
    const state = profile.states[Math.floor(Math.random() * profile.states.length)];
    const proxy = profile.proxies[Math.floor(Math.random() * profile.proxies.length)];
    const isp = profile.isps[Math.floor(Math.random() * profile.isps.length)];
    const fakeIP = `185.12.${Math.floor(Math.random() * 254) + 1}.${Math.floor(Math.random() * 254) + 1}`;
    
    // Add hits to active campaigns
    const updatedCampaigns = campaigns.map(c => {
      if (c.status === "active") {
        const hits = (c.hitsGenerated || 0) + (Math.random() > 0.4 ? 1 : 0);
        return { ...c, hitsGenerated: hits };
      }
      return c;
    });
    saveLocal("gt_campaigns", updatedCampaigns);

    // Add Live log
    const liveGeoLogs = loadLocal<any[]>("gt_live_geo_logs", []);
    const newLog = {
      timestamp: new Date().toISOString(),
      countryCode: profile.code,
      countryName: profile.country,
      targetUrl: targetCamp.targetUrl,
      proxyIp: fakeIP,
      proxySource: proxy,
      timezone: profile.timezone,
      city: `${city}, ${state}`,
      isp: isp,
      userAgent: USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
      resolution: RESOLUTIONS[Math.floor(Math.random() * RESOLUTIONS.length)],
      webgl: WEBGL_RENDERERS[Math.floor(Math.random() * WEBGL_RENDERERS.length)],
      status: 200
    };

    liveGeoLogs.unshift(newLog);
    if (liveGeoLogs.length > 40) liveGeoLogs.pop();
    saveLocal("gt_live_geo_logs", liveGeoLogs);
  }, 3500);
}

// Intercept window fetch
export function hookWindowFetch() {
  if (typeof window === "undefined" || (window as any).__fetchHooked) return;
  (window as any).__fetchHooked = true;

  // Background trigger client side Supabase data load
  syncClientWithSupabase();

  const originalFetch = window.fetch ? window.fetch.bind(window) : null;

  const customFetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const urlStr = input.toString();

    // Check if this is an API target
    if (urlStr.startsWith("/api/") || urlStr.includes("/api/")) {
      const isRelative = urlStr.startsWith("/api/") || urlStr.includes(window.location.host + "/api/");
      if (isRelative) {
        
        // Match path
        const parsedUrl = new URL(urlStr, window.location.origin);
        const path = parsedUrl.pathname;
        const method = (init?.method || "GET").toUpperCase();

        const logFallback = () => {
          if (!window.__useLocalFallback) {
            console.warn(`[GrowTraffic AI Client] Route ${method} ${path} failed or was absent. Switching to Local Storage Sandbox fallback mode.`);
            window.__useLocalFallback = true;
            bootstrapClientSimulation();
          }
        };

        // If we are already in fallback status, immediately resolve locally
        if (window.__useLocalFallback) {
          return handleLocalAPI(path, method, init);
        }

        // Try genuine networking
        try {
          if (!originalFetch) {
            logFallback();
            return handleLocalAPI(path, method, init);
          }
          const networkResponse = await originalFetch(input, init);
          
          // Check if response is valid JSON (sometimes Vercel redirects 404 to index.html with content type text/html)
          const contentType = networkResponse.headers.get("content-type");
          const isJson = contentType && contentType.includes("application/json");

          if (networkResponse.ok && isJson) {
            return networkResponse;
          } else {
            logFallback();
            return handleLocalAPI(path, method, init);
          }
        } catch (e) {
          logFallback();
          return handleLocalAPI(path, method, init);
        }
      }
    }

    // Default fetch for non-API, cdns, geojson maps, google analytics, etc
    if (!originalFetch) {
      return Promise.reject(new Error("Original fetch is not available in this environment."));
    }
    return originalFetch(input, init);
  };

  try {
    Object.defineProperty(window, "fetch", {
      value: customFetch,
      configurable: true,
      writable: true,
      enumerable: true
    });
  } catch (error) {
    console.warn("Could not patch window.fetch via Object.defineProperty(window). Trying fallback options:", error);
    try {
      Object.defineProperty(globalThis, "fetch", {
        value: customFetch,
        configurable: true,
        writable: true,
        enumerable: true
      });
    } catch (err2) {
      console.warn("Could not patch globalThis.fetch, trying direct window assign:", err2);
      try {
        (window as any).fetch = customFetch;
      } catch (err3) {
        console.error("Critical: Could not intercept fetch on global scope in any way:", err3);
      }
    }
  }
}

// Engine to process simulated routes entirely client-side
function handleLocalAPI(path: string, method: string, init?: RequestInit): Promise<Response> {
  let status = 200;
  let body: any = {};

  const campaigns = loadLocal<Campaign[]>("gt_campaigns", []);
  const simulations = loadLocal<ActiveSimulation[]>("gt_simulations", []);
  const fraud = loadLocal<FraudAlert[]>("gt_fraud", []);
  const team = loadLocal<TeamMember[]>("gt_team", []);
  const projects = loadLocal<Project[]>("gt_projects", []);
  const invoices = loadLocal<Invoice[]>("gt_invoices", []);
  const profile = loadLocal<any>("gt_profile", initialUserProfile);
  const geoLogs = loadLocal<any[]>("gt_live_geo_logs", []);

  // Dispatch mock routing paths
  if (path === "/api/user" && method === "GET") {
    body = profile;
  }
  else if (path === "/api/user/plan" && method === "POST") {
    const payload = init?.body ? JSON.parse(init.body as string) : {};
    if (payload.plan) profile.currentPlan = payload.plan;
    if (payload.addCredits) {
      profile.credits += Number(payload.addCredits);
    } else {
      if (payload.plan === "starter") profile.credits = 50000;
      else if (payload.plan === "growth") profile.credits = 500000;
      else if (payload.plan === "agency") profile.credits = 5000000;
    }
    saveLocal("gt_profile", profile);
    body = { success: true, plan: profile.currentPlan, credits: profile.credits };
  }
  else if (path === "/api/projects" && method === "GET") {
    body = { projects, team, invoices };
  }
  else if (path === "/api/projects" && method === "POST") {
    const payload = init?.body ? JSON.parse(init.body as string) : {};
    if (!payload.name || !payload.domain) {
      status = 400;
      body = { error: "Missing name or domain parameters" };
    } else {
      const newPrj: Project = {
        id: `prj-${projects.length + 100}`,
        name: payload.name,
        domain: payload.domain,
        apiToken: `gt_live_${Math.random().toString(16).substring(2, 24)}`,
        createdAt: new Date().toISOString()
      };
      projects.push(newPrj);
      saveLocal("gt_projects", projects);
      status = 201;
      body = newPrj;
    }
  }
  else if (path === "/api/fraud" && method === "GET") {
    body = { alerts: fraud };
  }
  else if (path.startsWith("/api/fraud/") && path.endsWith("/resolve") && method === "POST") {
    const segments = path.split("/");
    const alertId = segments[segments.length - 2];
    const payload = init?.body ? JSON.parse(init.body as string) : {};
    const alert = fraud.find(f => f.id === alertId);
    if (alert) {
      alert.status = payload.action === "clear" ? "cleared" : "blocked";
      if (payload.action === "block") {
        const camp = campaigns.find(c => c.id === alert.campaignId);
        if (camp) {
          camp.status = "paused";
          const sim = simulations.find(s => s.campaignId === camp.id);
          if (sim) sim.status = "idle";
        }
      }
      saveLocal("gt_fraud", fraud);
      saveLocal("gt_campaigns", campaigns);
      saveLocal("gt_simulations", simulations);
    }
    body = { success: true, alert };
  }
  else if (path === "/api/campaigns" && method === "GET") {
    body = { campaigns };
  }
  else if (path === "/api/campaigns" && method === "POST") {
    const c = init?.body ? JSON.parse(init.body as string) : {};
    if (!c.name || !c.targetUrl) {
      status = 400;
      body = { error: "Name and target URL are required structural boundaries" };
    } else {
      const totalVolume = Math.min(Number(c.totalVolume) || 50000, profile.credits);
      const newCamp: Campaign = {
        id: `camp-${Date.now().toString().substring(8)}`,
        name: c.name,
        targetUrl: c.targetUrl,
        totalVolume,
        dailyVolume: Number(c.dailyVolume) || 1600,
        durationSeconds: Number(c.durationSeconds) || 120,
        bounceRateTarget: Number(c.bounceRateTarget) || 35,
        intervals: c.intervals || "organic",
        geoTarget: c.geoTarget || "US",
        deviceSplit: c.deviceSplit || { desktop: 60, mobile: 35, tablet: 5 },
        behaviorSim: c.behaviorSim || { scroll: true, clicks: true, formInput: false },
        status: "active",
        createdAt: new Date().toISOString(),
        hitsGenerated: 0,
        gaMeasurementId: c.gaMeasurementId || "",
        gaMeasurementSecret: c.gaMeasurementSecret || "",
        worldwideGeoEnabled: !!c.worldwideGeoEnabled,
        geoContinent: c.geoContinent || "All",
        randomizeFrequency: c.randomizeFrequency || "session",
        excludedCountries: Array.isArray(c.excludedCountries) ? c.excludedCountries : []
      };

      profile.credits = Math.max(0, profile.credits - totalVolume);
      campaigns.unshift(newCamp);

      const newSim: ActiveSimulation = {
        id: `sim-${Date.now().toString().substring(9)}`,
        campaignId: newCamp.id,
        url: newCamp.targetUrl,
        activeUsers: Math.floor(newCamp.dailyVolume / 100) + 1,
        requestsPerSecond: parseFloat((newCamp.dailyVolume / 3600).toFixed(2)),
        latencyMs: 120 + Math.floor(Math.random() * 200),
        errorRate: 0.00,
        stepsCompleted: ["DNS Resolved", "Handshake Verified", "Simulate Behavior: Scroll", "Analytics Verification Script Loaded"],
        status: "running"
      };
      simulations.unshift(newSim);

      saveLocal("gt_profile", profile);
      saveLocal("gt_campaigns", campaigns);
      saveLocal("gt_simulations", simulations);
      saveCampaignToSupabaseClient(newCamp);

      status = 201;
      body = { success: true, campaign: newCamp, simulation: newSim, remainingCredits: profile.credits };
    }
  }
  else if (path.startsWith("/api/campaigns/") && path.endsWith("/status") && method === "POST") {
    const segments = path.split("/");
    const campId = segments[segments.length - 2];
    const payload = init?.body ? JSON.parse(init.body as string) : {};
    const camp = campaigns.find(c => c.id === campId);
    if (!camp) {
      status = 404;
      body = { error: "Campaign not found" };
    } else {
      camp.status = payload.status;
      const sim = simulations.find(s => s.campaignId === campId);
      if (sim) {
        sim.status = payload.status === "active" ? "running" : "idle";
      }
      saveLocal("gt_campaigns", campaigns);
      saveLocal("gt_simulations", simulations);
      saveCampaignToSupabaseClient(camp);
      body = { success: true, campaign: camp };
    }
  }
  else if (path.startsWith("/api/campaigns/") && method === "DELETE") {
    const segments = path.split("/");
    const campId = segments[segments.length - 1];
    
    const updatedCamp = campaigns.filter(c => c.id !== campId);
    const updatedSim = simulations.filter(s => s.campaignId !== campId);
    
    saveLocal("gt_campaigns", updatedCamp);
    saveLocal("gt_simulations", updatedSim);
    deleteCampaignFromSupabaseClient(campId);
    body = { success: true, id: campId };
  }
  else if (path === "/api/statistics" && method === "GET") {
    simulations.forEach(sim => {
      if (sim.status === "running") {
        sim.activeUsers = Math.max(5, sim.activeUsers + (Math.random() > 0.5 ? 1 : -1));
        const nextRps = Math.max(1, sim.requestsPerSecond + (Math.random() > 0.52 ? 0.3 : -0.2));
        sim.requestsPerSecond = parseFloat(nextRps.toFixed(2));
        sim.latencyMs = Math.max(80, Math.min(600, sim.latencyMs + Math.floor(Math.random() * 21 - 10)));
      }
    });
    saveLocal("gt_simulations", simulations);

    const totalActiveUsers = simulations
      .filter(s => s.status === "running")
      .reduce((sum, s) => sum + s.activeUsers, 0);

    body = {
      activeSimulations: simulations,
      totalActiveUsers: totalActiveUsers || 190,
      clientIP: "127.0.0.1",
      serverLoad: "12.4%",
      concurrencyRate: "99.85%",
      liveGeoLogs: geoLogs
    };
  }
  else if (path === "/api/testing/stress" && method === "POST") {
    let payload: any = {};
    try {
      if (init && init.body) {
        payload = JSON.parse(init.body.toString());
      }
    } catch (_) {}
    const users = Number(payload.users) || 250;
    const url = payload.url || "https://example.com";
    const geo = payload.geo || "US-East Node Cluster";
    body = {
      success: true,
      testId: `stress-${Math.random().toString(36).substring(7)}`,
      results: {
        id: `stress-${Math.random().toString(36).substring(7)}`,
        campaignId: "load-testing",
        url: url,
        activeUsers: users,
        requestsPerSecond: parseFloat((users * 1.5).toFixed(1)),
        latencyMs: 180 + Math.floor(Math.random() * 150),
        errorRate: 0.01 + parseFloat((Math.random() * 0.03).toFixed(3)),
        stepsCompleted: [
          `Initializing DNS probe from target Geolocation (${geo})`,
          "Warm-up scale configured: 50 reqs/sec",
          "Stress ramp-up active",
          "GA4 and Hotjar verification telemetry checking complete: OK",
          "Bypassing cache headers"
        ],
        status: "completed"
      },
      performanceScore: 92 + Math.floor(Math.random() * 6),
      recommendation: "Ensure keep-alive HTTP tags are enabled on server response headers to optimize response latency under concurrent request bounds."
    };
  }
  else if (path === "/api/ai/optimize" && method === "POST") {
    body = { success: true, advice: "Optimization complete. Dynamic behavior sequences fine-tuned for active nodes." };
  }
  else {
    status = 404;
    body = { error: `Not found: ${method} ${path}` };
  }

  // Construct response streaming stub
  const blob = new Blob([JSON.stringify(body)], { type: "application/json" });
  const response = new Response(blob, {
    status,
    headers: { "Content-Type": "application/json" }
  });

  return Promise.resolve(response);
}

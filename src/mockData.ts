export const COMPANY_LOGOS = [
  { name: "Vercel", url: "https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=80&h=30&fit=crop&q=60" },
  { name: "Stripe", url: "https://images.unsplash.com/photo-1563013544-824ae1d704d3?w=80&h=30&fit=crop&q=60" },
  { name: "Linear", url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=80&h=30&fit=crop&q=60" },
  { name: "Notion", url: "https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=80&h=30&fit=crop&q=60" },
  { name: "Retool", url: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=80&h=30&fit=crop&q=60" }
];

export const TESTIMONIALS = [
  {
    quote: "GrowTraffic AI allowed us to stress-test our geo-redundant clusters with 5 million simulated requests. It proved our Next.js edge caching was correctly configured before Black Friday pressure.",
    author: "Marc L.",
    role: "VP of Engineering at NextBase",
    company: "NextBase",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop"
  },
  {
    quote: "Integrating GrowTraffic into our QA pipeline lets us guarantee clients that their Google Analytics custom event tags are triggers-safe and converting. Ethical, human-like, and unmatched.",
    author: "Elena R.",
    role: "SEO Architect",
    company: "Scribe Agency Group",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop"
  },
  {
    quote: "Finally, a site traffic testing suite built for modern SaaS pipelines. The API is remarkably simple, and the behavioral mouse tracking emulations are genuinely realistic.",
    author: "Tobias K.",
    role: "Lead DevOps",
    company: "Finflow.io",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&h=80&fit=crop"
  }
];

export const FAQS = [
  {
    question: "Is GrowTraffic AI compliant with ad networks like Google AdSense?",
    answer: "Yes. GrowTraffic AI is strictly engineered for performance diagnostics, stress testing, and analytical tag validation. We filter simulated sessions from earning trackers, complying fully with analytical tracking frameworks and avoiding spammy SEO traffic behavior."
  },
  {
    question: "Do simulated visits load my web assets?",
    answer: "Absolutely. GrowTraffic emulates live headless Chromium requests triggering complete DOM cycles, running inline javascript trackers (GA4, GSC, Hotjar, Meta Pixel) exactly like genuine global users."
  },
  {
    question: "How does the geo-targeting proxy protocol function?",
    answer: "We route simulation workers through dedicated local data centers or residential proxy paths in Tokyo, Frankfurt, Dublin, Ashburn, and 30+ major metro clusters based on your target guidelines."
  },
  {
    question: "What are the limits on concurrency simulations?",
    answer: "Our Starter tier supports up to 50 concurrent active agents, increasing up to infinite custom scalable testing pipelines on Enterprise configurations."
  }
];

export const PRICING_PLANS = [
  {
    id: "starter",
    name: "Starter Pilot",
    price: "$49",
    visits: "50,000 visits / mo",
    credits: 50000,
    features: [
      "50,000 Sandbox visits included",
      "5 concurrent simulated crawlers",
      "Basic US & EU Geo-Targeting Node Selection",
      "Device splits: Desktop only",
      "Standard GA4 Tag verification",
      "7 Days Historic log backup"
    ],
    stripePriceId: "price_starter_49"
  },
  {
    id: "growth",
    name: "Growth Engine",
    price: "$129",
    visits: "500,000 visits / mo",
    credits: 500000,
    features: [
      "500,000 High-velocity visits included",
      "25 concurrent simulated flows",
      "Global Geo-Nodes (30+ Countries)",
      "Dynamic Device matching (Mobile, Tablet, Desktop)",
      "Micro-scroll & interaction flow simulations",
      "API programmatic campaign triggers",
      "Hotjar/Plausible analytics diagnostics",
      "Prioritized server queue scheduling"
    ],
    stripePriceId: "price_growth_129"
  },
  {
    id: "agency",
    name: "Agency Suite",
    price: "$399",
    visits: "5M visits / mo",
    credits: 5000000,
    features: [
      "5,000,000 High-Velocity visits included",
      "150 concurrent active simulators",
      "Advanced customized behavioural scripts",
      "Custom Referrers simulation (Google SEO search term emulators)",
      "Dedicated account engineer review",
      "Agency teams: up to 15 seats",
      "Whitelabel client dashboards",
      "Custom invoice structures"
    ],
    stripePriceId: "price_agency_399"
  },
  {
    id: "enterprise",
    name: "Custom Enterprise",
    price: "Custom",
    visits: "Unlimited Load Scale",
    credits: 50000000,
    features: [
      "Dedicated separate server infrastructure",
      "Custom SLA & dynamic scaling pipelines",
      "Unlimited concurrency channels",
      "Deep security penetration testing scripts",
      "Direct Slack support & enterprise-level consults",
      "Database schema migration simulation tools"
    ],
    stripePriceId: "price_enterprise_custom"
  }
];

export const API_DOCS = {
  curl: `curl -X POST https://api.growtraffic.ai/v1/campaigns \\
  -H "Authorization: Bearer gt_live_8390bbf7238a221f18809c" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Production Load Test",
    "targetUrl": "https://yourbrand.com/pricing",
    "totalVolume": 100000,
    "geoTarget": "DE",
    "deviceSplit": { "desktop": 70, "mobile": 30, "tablet": 0 }
  }'`,
  node: `import { GrowTraffic } from '@growtraffic/sdk';

const pilot = new GrowTraffic({
  apiKey: 'gt_live_8390bbf7238a221f18809c'
});

const campaign = await pilot.campaigns.create({
  name: "Production Load Test",
  targetUrl: "https://yourbrand.com/pricing",
  totalVolume: 100000,
  geoTarget: "DE",
  deviceSplit: { desktop: 70, mobile: 30, tablet: 0 }
});

console.log('Campaign deployed for performance validation:', campaign.id);`,
  python: `from growtraffic import Client

client = Client(api_key="gt_live_8390bbf7238a221f18809c")

campaign = client.campaigns.create(
    name="Production Load Test",
    target_url="https://yourbrand.com/pricing",
    total_volume=100000,
    geo_target="DE",
    device_split={"desktop": 70, "mobile": 30, "tablet": 0}
)

print(f"Simulation initiated: {campaign['id']}")`
};

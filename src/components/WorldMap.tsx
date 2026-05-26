import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Globe, MapPin, Shield, Zap, RefreshCw, BarChart2 } from "lucide-react";

interface GeoLog {
  timestamp: string;
  countryCode: string;
  countryName: string;
  targetUrl: string;
  proxyIp: string;
  proxySource: string;
  timezone: string;
  city: string;
  isp: string;
  userAgent: string;
  resolution: string;
  webgl: string;
  status: any;
}

interface WorldMapProps {
  liveGeoLogs: GeoLog[];
  onTriggerPing?: () => void;
}

// Fixed coordinates dictionary for all proxy edge servers and destination cloud hubs
const GEOGRAPHIC_COORDINATES: Record<string, [number, number]> = {
  US: [-100.0, 40.0],
  DE: [10.45, 51.16],
  GB: [-1.46, 52.8],
  CA: [-106.34, 56.13],
  IN: [78.96, 20.59],
  AU: [133.77, -25.27],
  FR: [2.21, 46.22],
  BR: [-51.92, -14.23],
  JP: [138.25, 36.2],
  SG: [103.81, 1.35],
  NL: [5.29, 52.13],
  ES: [-3.7, 40.46],
  KR: [127.76, 35.9],
  TW: [120.96, 23.69],
  PK: [73.04, 33.68]
};

// Target Cloud DC Nodes map coordinates
const CLOUD_DATACENTERS: Record<string, { name: string; coord: [number, number]; region: string }> = {
  US_EAST: { name: "AWS us-east-1 (Ashburn)", coord: [-77.04, 38.9], region: "us" },
  EU_CENTRAL: { name: "GCP europe-west3 (Frankfurt)", coord: [8.68, 50.11], region: "eu" },
  ASIA_EAST: { name: "Google Cloud asia-east1 (Taiwan)", coord: [121.56, 25.03], region: "tw" }
};

export const WorldMap: React.FC<WorldMapProps> = ({ liveGeoLogs, onTriggerPing }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [geoData, setGeoData] = useState<any>(null);
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [geoStats, setGeoStats] = useState<Record<string, { count: number; ips: Set<string>; avgLatency: number }>>({});
  const [loadingMap, setLoadingMap] = useState(true);
  const [errorMap, setErrorMap] = useState(false);

  // Compute stats on fly from incoming logs
  useEffect(() => {
    const stats: Record<string, { count: number; ips: Set<string>; avgLatency: number }> = {};
    liveGeoLogs.forEach((log) => {
      const cc = log.countryCode;
      if (!stats[cc]) {
        stats[cc] = { count: 0, ips: new Set<string>(), avgLatency: 45 };
      }
      stats[cc].count += 1;
      stats[cc].ips.add(log.proxyIp);
      // Fake a stable regional latency
      if (cc === "US") stats[cc].avgLatency = 95;
      else if (cc === "DE" || cc === "GB" || cc === "FR") stats[cc].avgLatency = 145;
      else if (cc === "SG" || cc === "JP" || cc === "KR" || cc === "TW") stats[cc].avgLatency = 40;
      else stats[cc].avgLatency = 180;
    });
    setGeoStats(stats);
  }, [liveGeoLogs]);

  // Load GeoJSON safely from CDN with fallback options
  useEffect(() => {
    const fetchGeoMap = async () => {
      try {
        setLoadingMap(true);
        // Using a highly reliable, simplified world geojson (110m scale)
        const res = await fetch("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson");
        if (!res.ok) throw new Error("Could not download World Map model");
        const data = await res.json();
        setGeoData(data);
        setErrorMap(false);
      } catch (err) {
        console.error("Failed to load map path curves. Triggering local layout generator...", err);
        setErrorMap(true);
      } finally {
        setLoadingMap(false);
      }
    };
    fetchGeoMap();
  }, []);

  // Primary D3 Render and Interaction Engine
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // reset on render change

    // Fluid dimensions matching parent layout container
    const width = containerRef.current.clientWidth || 800;
    const height = 350;

    svg.attr("width", width).attr("height", height);

    // Natural Earth 1 projection offers classic, eye-pleasing aspect ratio with elegant borders
    const projection = d3.geoNaturalEarth1()
      .scale(width / 5.2)
      .translate([width / 2, height / 1.7]);

    const pathGenerator = d3.geoPath().projection(projection);

    const g = svg.append("g");

    // Add zoom/pan capabilities to make map delightfully interactive
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoomBehavior);

    // Helper: Determine heat color density based on active log counts
    const getHeatColor = (countryId: string) => {
      const stat = geoStats[countryId];
      if (!stat) return "#1e293b"; // base water/land border dark slate
      const count = stat.count;
      if (count === 1) return "#312e81"; // deep warm indigo
      if (count <= 3) return "#4338ca"; // solid indigo
      if (count <= 6) return "#4f46e5"; // neon indigo
      return "#6366f1"; // shining glowing indigo
    };

    // Render countries if loaded successfully
    if (geoData && geoData.features) {
      g.append("g")
        .selectAll("path")
        .data(geoData.features)
        .enter()
        .append("path")
        .attr("d", (d: any) => pathGenerator(d))
        .attr("fill", (d: any) => getHeatColor(d.id || d.properties?.ISO_A2 || d.properties?.code))
        .attr("stroke", (d: any) => {
          // Glow borders of active proxy countries!
          const active = geoStats[d.id || d.properties?.ISO_A2 || d.properties?.code];
          return active ? "rgba(129, 140, 248, 0.6)" : "rgba(255, 255, 255, 0.08)";
        })
        .attr("stroke-width", (d: any) => {
          const active = geoStats[d.id || d.properties?.ISO_A2 || d.properties?.code];
          return active ? "1.5" : "0.5";
        })
        .style("cursor", "pointer")
        .on("mouseenter", (event, d: any) => {
          const code = d.id || d.properties?.ISO_A2 || d.properties?.code;
          const name = d.properties?.name;
          setHoveredCountry(name);
          d3.select(event.currentTarget)
            .attr("fill", "#818cf8") // bright high light
            .attr("stroke", "#ffffff");
        })
        .on("mouseleave", (event, d: any) => {
          setHoveredCountry(null);
          const code = d.id || d.properties?.ISO_A2 || d.properties?.code;
          d3.select(event.currentTarget)
            .attr("fill", getHeatColor(code))
            .attr("stroke", geoStats[code] ? "rgba(129, 140, 248, 0.6)" : "rgba(255, 255, 255, 0.08)")
            .attr("stroke-width", geoStats[code] ? "1.5" : "0.5");
        })
        .on("click", (event, d: any) => {
          const code = d.id || d.properties?.ISO_A2 || d.properties?.code;
          const name = d.properties?.name;
          const stat = geoStats[code];
          setSelectedCountry({
            code,
            name,
            count: stat?.count || 0,
            ips: Array.from(stat?.ips || []),
            latency: stat?.avgLatency || 0
          });
        });
    } else {
      // Fallback Visual Network: Grid dots for aesthetic high-tech map fallback if GeoJSON failed to download
      g.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "rgba(15, 23, 42, 0.4)")
        .attr("rx", 12);

      // Render latitude/longitude grid dots
      const gridDots: Array<{ x: number; y: number }> = [];
      for (let lat = -50; lat <= 70; lat += 15) {
        for (let lon = -150; lon <= 150; lon += 20) {
          const projected = projection([lon, lat]);
          if (projected) {
            gridDots.push({ x: projected[0], y: projected[1] });
          }
        }
      }

      g.selectAll(".grid-dot")
        .data(gridDots)
        .enter()
        .append("circle")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", 1.5)
        .attr("fill", "rgba(255, 255, 255, 0.1)");
    }

    // Dynamic country nodes markers - glows active proxy pools (Requirement 8)
    Object.entries(GEOGRAPHIC_COORDINATES).forEach(([code, coord]) => {
      const activeStats = geoStats[code];
      const isPingSource = activeStats && activeStats.count > 0;
      
      const projected = projection(coord);
      if (!projected) return;
      const [cx, cy] = projected;

      if (isPingSource) {
        // Pulsing background radar rings
        g.append("circle")
          .attr("cx", cx)
          .attr("cy", cy)
          .attr("r", 12)
          .attr("fill", "rgba(99, 102, 241, 0.15)")
          .attr("stroke", "rgba(99, 102, 241, 0.4)")
          .attr("stroke-width", 0.7)
          .append("animate")
          .attr("attributeName", "r")
          .attr("values", "4;16;4")
          .attr("dur", "2.5s")
          .attr("repeatCount", "indefinite");

        // Inner glowing core
        g.append("circle")
          .attr("cx", cx)
          .attr("cy", cy)
          .attr("r", 4.5)
          .attr("fill", "#6366f1")
          .attr("stroke", "#ffffff")
          .attr("stroke-width", 1);
      } else {
        // Unactive edge nodes - smaller gray spots
        g.append("circle")
          .attr("cx", cx)
          .attr("cy", cy)
          .attr("r", 2.2)
          .attr("fill", "rgba(255,255,255,0.15)");
      }
    });

    // Render Cloud datacenters
    Object.entries(CLOUD_DATACENTERS).forEach(([key, dc]) => {
      const projected = projection(dc.coord);
      if (!projected) return;
      const [cx, cy] = projected;

      // Pulse ring for DC
      g.append("circle")
        .attr("cx", cx)
        .attr("cy", cy)
        .attr("r", 10)
        .attr("fill", "rgba(16, 185, 129, 0.1)")
        .attr("stroke", "rgba(16, 185, 129, 0.6)")
        .attr("stroke-width", 1)
        .append("animate")
        .attr("attributeName", "r")
        .attr("values", "5;12;5")
        .attr("dur", "1.8s")
        .attr("repeatCount", "indefinite");

      // Tiny triangle or diamond for host server
      g.append("polygon")
        .attr("points", `${cx},${cy - 5} ${cx + 4},${cy + 3} ${cx - 4},${cy + 3}`)
        .attr("fill", "#10b981")
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 0.8);
    });

    // Real-time Country-to-Country Arcs and animated flowing particles (Requirement 1, 2)
    // Draw connections representing routing paths from live simulated logs
    liveGeoLogs.slice(0, 10).forEach((log, index) => {
      const srcCode = log.countryCode;
      const startCoord = GEOGRAPHIC_COORDINATES[srcCode];
      if (!startCoord) return;

      // Determine appropriate datacenter node based on campaign domain metadata
      let dcKey = "ASIA_EAST"; // Default Taiwan cloud stack
      const url = log.targetUrl.toLowerCase();
      if (url.includes(".de") || url.includes(".eu") || url.includes(".co.uk") || url.includes("europe") || url.includes("germany")) {
        dcKey = "EU_CENTRAL";
      } else if (url.includes(".com") || url.includes(".org") || url.includes(".net") || url.includes("us-east")) {
        dcKey = "US_EAST";
      }

      const endCoord = CLOUD_DATACENTERS[dcKey].coord;
      
      const startProj = projection(startCoord);
      const endProj = projection(endCoord);
      
      if (!startProj || !endProj) return;
      const [x1, y1] = startProj;
      const [x2, y2] = endProj;

      // Draw curved bezier line representing connection tunnel
      const dx = x2 - x1;
      const dy = y2 - y1;
      const dr = Math.sqrt(dx * dx + dy * dy) * 1.35; // height offset parameter of arch

      const pathId = `ping-arc-${index}-${srcCode}`;
      const pathData = `M${x1},${y1} A${dr},${dr} 0 0,1 ${x2},${y2}`;

      // Beautiful subtle arc line
      g.append("path")
        .attr("id", pathId)
        .attr("d", pathData)
        .attr("fill", "none")
        .attr("stroke", "url(#arc-gradient)")
        .attr("stroke-width", 1.2)
        .attr("opacity", 0.6)
        .attr("stroke-dasharray", "4, 4")
        .append("animate")
        .attr("attributeName", "stroke-dashoffset")
        .attr("values", "100;0")
        .attr("dur", "12s")
        .attr("repeatCount", "indefinite");

      // Glowing flow particles gliding along the arc tunnel in real time
      const particle = g.append("circle")
        .attr("r", 3)
        .attr("fill", "#10b981") // glowing emerald
        .attr("filter", "url(#neon-glow)");

      const animateAlongPath = () => {
        const pathNode = svg.select(`#${pathId}`).node() as SVGPathElement;
        if (!pathNode) return;
        const len = pathNode.getTotalLength();

        particle.transition()
          .delay(index * 250)
          .duration(1600 + Math.random() * 800)
          .ease(d3.easeQuadOut)
          .tween("pathTween", function() {
            return function(t) {
              const p = pathNode.getPointAtLength(t * len);
              particle.attr("cx", p.x).attr("cy", p.y);
            };
          })
          .on("end", () => {
            // Once impact achieves target datacenter, draw transient ripple wave on host server
            g.append("circle")
              .attr("cx", x2)
              .attr("cy", y2)
              .attr("r", 3)
              .attr("fill", "none")
              .attr("stroke", "#10b981")
              .attr("stroke-width", 1)
              .transition()
              .duration(600)
              .attr("r", 20)
              .attr("opacity", 0)
              .remove();

            animateAlongPath(); // loop dynamic particle travel
          });
      };

      animateAlongPath();
    });

    // Create SVG gradients and filters for futuristic HUD neon glow effect
    const defs = svg.append("defs");
    
    const linearGradient = defs.append("linearGradient")
      .attr("id", "arc-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "100%");
    linearGradient.append("stop").attr("offset", "0%").attr("stop-color", "#6366f1").attr("stop-opacity", 0.8);
    linearGradient.append("stop").attr("offset", "100%").attr("stop-color", "#10b981").attr("stop-opacity", 0.4);

    const glowFilter = defs.append("filter").attr("id", "neon-glow");
    glowFilter.append("feGaussianBlur").attr("stdDeviation", 1.8).attr("result", "coloredBlur");
    const feMerge = glowFilter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

  }, [geoData, geoStats, liveGeoLogs]);

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-white/10 flex flex-col gap-6 shadow-2xl relative overflow-hidden group">
      {/* Absolute futuristic decoration background lines */}
      <div className="absolute top-0 left-0 w-44 h-44 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/15 transition-all"></div>
      <div className="absolute bottom-0 right-0 w-44 h-44 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header telemetry controller */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-white/10 z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 px-1.5 rounded bg-indigo-500/20 border border-indigo-500/30 text-[9px] font-bold text-indigo-400 font-mono tracking-widest uppercase animate-pulse">
              D3.js ENGINE V5
            </span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs text-emerald-400 font-mono font-bold">ARC RIPPLES ACTIVE</span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight mt-1 flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-400 animate-spin" style={{ animationDuration: "16s" }} />
            <span>Live Interactive Proxy Movement Map</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic global view of traffic tunnels. Color highlights represent country session concentration (anti-clustering protected).
          </p>
        </div>

        {/* HUD control board */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button 
            onClick={onTriggerPing}
            className="px-3.5 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 active:scale-95 transition-all"
            title="Inject simulated visits directly to trigger arc projection animations"
          >
            <Zap className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400" />
            <span>Force Speed test</span>
          </button>
          
          <span className="px-2.5 py-1.5 bg-slate-900 border border-white/10 rounded-lg text-[10px] font-mono text-slate-400 flex items-center gap-1.5 font-bold">
            <MapPin className="w-3 h-3 text-red-400" />
            <span>Cloud Ports: Frankfurt, Ashburn, Taipei</span>
          </span>
        </div>
      </div>

      {/* World Map SVG Display Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 relative">
        <div 
          ref={containerRef} 
          className="lg:col-span-3 min-h-[350px] bg-slate-950/40 border border-white/5 rounded-xl overflow-hidden relative flex items-center justify-center cursor-move"
          id="d3-canvas-stage"
        >
          {loadingMap && (
            <div className="absolute inset-0 z-20 bg-slate-950/40 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
              <p className="text-xs font-semibold text-slate-300">Formulating SVG coordinate projections...</p>
            </div>
          )}

          <svg ref={svgRef} className="block select-none pointer-events-auto"></svg>

          {/* Floated dynamic HUD legend */}
          <div className="absolute bottom-3 left-3 bg-slate-950/95 border border-white/10 px-3 py-2.5 rounded-lg flex flex-col gap-1.5 pointer-events-none md:flex-row md:gap-4 md:items-center">
            <div className="flex items-center gap-2 text-[10px]">
              <span className="w-2.5 h-2.5 rounded bg-slate-800 border border-white/10"></span>
              <span className="text-slate-400">Idle Spare Nodes</span>
            </div>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 border border-indigo-400 animate-pulse"></span>
              <span className="text-slate-400">Active Proxy Edge</span>
            </div>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm"></span>
              <span className="text-slate-400">Target Host servers</span>
            </div>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="text-[9px] bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-mono font-bold px-1 rounded">Scroll to zoom IN/OUT</span>
            </div>
          </div>

          {/* Interactive instruction toast */}
          <div className="absolute top-3 left-3 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded text-[9px] font-medium text-indigo-300 pointer-events-none">
            ⚡ Double-click or drag to rotate camera projection
          </div>

          {hoveredCountry && (
            <div className="absolute top-3 right-3 bg-slate-900/90 border border-white/15 px-3 py-1.5 rounded-md text-[11px] text-white flex items-center gap-1.5 pointer-events-none">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping"></span>
              <span>Inspecting: <strong className="text-indigo-300 font-bold">{hoveredCountry}</strong></span>
            </div>
          )}
        </div>

        {/* Sidebar details panel */}
        <div className="lg:col-span-1 flex flex-col justify-between gap-4">
          <div className="p-4 rounded-xl bg-white/5 border border-white/15 flex flex-col gap-3.5 flex-1 justify-center min-h-[180px]">
            {selectedCountry ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span>🌍</span>
                    <span>{selectedCountry.name}</span>
                  </h4>
                  <button 
                    onClick={() => setSelectedCountry(null)}
                    className="text-[10px] text-slate-400 hover:text-white bg-white/5 px-1.5 py-0.5 rounded"
                  >
                    Clear
                  </button>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">ISO Alpha-2:</span>
                    <span className="text-white font-bold">{selectedCountry.code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Active Sessions:</span>
                    <span className="text-indigo-400 font-bold">{selectedCountry.count || "0"} clicks</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Est. Latency:</span>
                    <span className="text-emerald-400 font-bold">{selectedCountry.latency} ms</span>
                  </div>
                  <div className="pt-2 border-t border-white/5">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Assigned IPs</p>
                    {selectedCountry.ips.length === 0 ? (
                      <p className="text-[10px] text-slate-500 italic">No IPs assigned yet</p>
                    ) : (
                      <div className="max-h-24 overflow-y-auto space-y-1 pr-1">
                        {selectedCountry.ips.map((ip: string) => (
                          <div key={ip} className="bg-slate-950/80 px-1.5 py-0.5 rounded text-[10px] text-slate-300 truncate font-mono border border-white/5">
                            {ip}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400 flex flex-col items-center justify-center gap-2">
                <BarChart2 className="w-8 h-8 text-slate-600 animate-pulse" />
                <p className="text-xs font-medium leading-normal">
                  Click any country land segment on the map to inspect live edge proxies, metrics, and active session IP logs.
                </p>
              </div>
            )}
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 to-emerald-500/5 border border-indigo-500/20 flex flex-col gap-2">
            <h5 className="font-bold text-xs text-indigo-400 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              <span>Real-time Anti-Clustering</span>
            </h5>
            <p className="text-[11px] text-slate-400 leading-normal">
              Server monitors Taiwan/global skew rates. High density areas are auto-balanced every session block to preserve natural dispersion.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

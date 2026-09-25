import { useState } from "react";
import { MAP_MARKERS, MAP_ROUTES } from "./seed";
import { cn } from "@/lib/utils";
import { StatusBadge } from "./ui-bits";

type MarkerTone = "station" | "normal" | "warning" | "danger";

const FILL: Record<MarkerTone, string> = {
  station: "#3c5a74",
  normal: "#567d46",
  warning: "#a9752c",
  danger: "#9e3b2c",
};

/**
 * Schematic Antarctica plate — archival chart style. All geometry is
 * illustrative and labelled as simulated; no real navigation use.
 */
export function MapPanel({
  height = 340,
  teamPositions,
  className,
}: {
  height?: number;
  /** live percent coords for team markers (overrides seed positions) */
  teamPositions?: Record<string, { x: number; y: number }>;
  className?: string;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  const markers = MAP_MARKERS.map((m) => {
    if (m.kind === "team" && teamPositions?.[m.id]) {
      return { ...m, x: teamPositions[m.id].x, y: teamPositions[m.id].y };
    }
    return m;
  });

  const toneOf = (kind: string): MarkerTone => {
    if (kind === "station") return "station";
    if (kind === "beacon") return "danger";
    if (kind === "team") return "normal";
    return "warning";
  };

  const selectedMarker = markers.find((m) => m.id === selected) ?? null;

  return (
    <div className={cn("plate relative overflow-hidden p-0", className)}>
      <div className="flex items-center justify-between border-b border-border/70 px-4 py-2.5">
        <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          <span>Chart № 26062-A</span>
          <span className="hidden h-3 w-px bg-border sm:block" />
          <span className="hidden sm:inline">Schematic projection</span>
        </div>
        <StatusBadge tone="gold">Simulated map data</StatusBadge>
      </div>

      <div className="relative" style={{ height }}>
        <svg viewBox="0 0 100 58.8" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
          {/* sea + graticule */}
          <rect width="100" height="58.8" fill="#e9e0cc" />
          <g stroke="#d5c7ab" strokeWidth="0.12">
            {Array.from({ length: 19 }, (_, i) => (
              <line key={`v${i}`} x1={(i + 1) * 5} y1="0" x2={(i + 1) * 5} y2="58.8" />
            ))}
            {Array.from({ length: 11 }, (_, i) => (
              <line key={`h${i}`} x1="0" y1={(i + 1) * 4.88} x2="100" y2={(i + 1) * 4.88} />
            ))}
          </g>

          {/* continent silhouette (stylised) */}
          <path
            d="M8,34 L14,30 L20,31.5 L26,29 L33,31 L40,28.5 L47,30.5 L54,28 L61,30 L68,27.5 L75,29 L82,27 L89,29.5 L94,28 L97,32 L96,38 L90,44 L83,50 L74,55 L64,57.5 L54,58.5 L44,58 L34,56 L25,52.5 L18,47 L12,41 Z"
            fill="#f8f3e7"
            stroke="#b8a37e"
            strokeWidth="0.3"
          />
          {/* interior contours */}
          <g stroke="#d8cab0" strokeWidth="0.12" fill="none">
            <path d="M22,36 L34,35 L46,36.5 L58,35.5 L70,36 L82,35" />
            <path d="M26,42 L38,41 L50,42 L62,41 L74,42" />
            <path d="M32,48 L44,47.5 L56,48 L68,47.5" />
          </g>

          {/* cargo corridor (animated dashes) */}
          {MAP_ROUTES.filter((r) => r.kind === "cargo").map((r) => (
            <polyline
              key={r.id}
              className="route-dash"
              points={r.points.map((p) => `${p.x},${p.y * 0.588}`).join(" ")}
              fill="none"
              stroke="#3c5a74"
              strokeWidth="0.28"
              opacity="0.8"
            />
          ))}
          {/* traverse lines */}
          {MAP_ROUTES.filter((r) => r.kind === "traverse").map((r) => (
            <polyline
              key={r.id}
              points={r.points.map((p) => `${p.x},${p.y * 0.588}`).join(" ")}
              fill="none"
              stroke="#567d46"
              strokeWidth="0.22"
              strokeDasharray="1.4 1.4"
              opacity="0.85"
            />
          ))}

          {/* compass rose */}
          <g transform="translate(92,7)" opacity="0.75">
            <circle r="3.4" fill="none" stroke="#a6885a" strokeWidth="0.22" />
            <path d="M0,-2.8 L0.7,0 L0,2.8 L-0.7,0 Z" fill="#a6885a" />
            <text y="6" textAnchor="middle" fontSize="2" fill="#6f5729" fontFamily="serif">N</text>
          </g>

          {/* markers */}
          {markers.map((m) => {
            const cx = m.x;
            const cy = m.y * 0.588;
            const tone = toneOf(m.kind);
            const fill = FILL[tone];
            const isStation = m.kind === "station";
            const isTeam = m.kind === "team";
            return (
              <g
                key={m.id}
                transform={`translate(${cx},${cy})`}
                onClick={() => setSelected(m.id)}
                className="cursor-pointer"
                role="button"
                aria-label={m.label}
              >
                {(isTeam || m.kind === "beacon") && (
                  <circle r="2.6" fill={fill} opacity="0.35" className="ping-soft" />
                )}
                {isStation ? (
                  <>
                    <rect x="-2.1" y="-2.1" width="4.2" height="4.2" rx="0.5" fill={fill} stroke="#faf5ea" strokeWidth="0.35" transform="rotate(45)" />
                  </>
                ) : (
                  <circle r="1.7" fill={fill} stroke="#faf5ea" strokeWidth="0.35" />
                )}
                <text
                  y={isStation ? -3.4 : -2.9}
                  textAnchor="middle"
                  fontSize="2.1"
                  fontWeight={isStation ? 700 : 500}
                  fill="#3e3222"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {m.label.replace(" (Stby)", "")}
                </text>
              </g>
            );
          })}
        </svg>

        {/* click-info card */}
        {selectedMarker && (
          <div className="absolute bottom-3 left-3 right-3 mx-auto max-w-sm plate p-3.5 shadow-lg sm:right-auto">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-display text-sm font-bold text-foreground">{selectedMarker.label}</p>
                <p className="font-mono text-[11px] text-muted-foreground">{selectedMarker.coords}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-sm border border-border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:bg-accent"
              >
                Close
              </button>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-foreground/85">{selectedMarker.note}</p>
          </div>
        )}

        {/* legend */}
        <div className="absolute bottom-3 right-3 hidden items-center gap-3 rounded-sm border border-border bg-card/90 px-3 py-1.5 md:flex">
          {[
            ["#3c5a74", "Station"],
            ["#567d46", "Normal"],
            ["#a9752c", "Warning"],
            ["#9e3b2c", "Emergency"],
          ].map(([c, l]) => (
            <span key={l} className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <span className="size-2 rounded-full" style={{ background: c }} />
              {l}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

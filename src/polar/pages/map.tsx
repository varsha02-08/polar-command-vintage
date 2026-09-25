import { usePolar } from "../store";
import { MapPanel } from "../map-panel";
import { SectionHeader, SimBadge, StatusBadge, statusTone } from "../ui-bits";
import { cn } from "@/lib/utils";

const WAYPOINTS = [
  { id: "w1", name: "Maitri Base", x: 24, y: 44, eta: "—" },
  { id: "w2", name: "Fuel Cache M-4", x: 38, y: 46, eta: "12:40 UTC" },
  { id: "w3", name: "Shelf Road Junction", x: 50, y: 52, eta: "13:25 UTC" },
  { id: "w4", name: "Ice Shelf Camp A", x: 63, y: 51, eta: "14:05 UTC" },
  { id: "w5", name: "Bharati Base", x: 76, y: 56, eta: "15:10 UTC" },
];

export default function MapPage() {
  const { teams, connection, emergency } = usePolar();

  return (
    <div>
      <SectionHeader
        title="Operations Map"
        subtitle="Schematic polar chart with stations, traverse lines, the cargo corridor and beacon watch. Every position is simulated."
        right={<SimBadge />}
      />

      <MapPanel height={480} />

      {/* route ledger */}
      <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="plate p-5">
          <h2 className="font-display text-lg font-bold">Cargo Corridor — waybills & timing</h2>
          <ol className="mt-3 space-y-0">
            {WAYPOINTS.map((w, i) => (
              <li key={w.id} className="relative flex items-start gap-4 pb-4 last:pb-0">
                {i < WAYPOINTS.length - 1 && (
                  <span className="absolute left-[7px] top-4 h-full w-px bg-[#a6885a]/50" />
                )}
                <span className="relative mt-1 size-3.5 shrink-0 rounded-full border-2 border-[#a6885a] bg-card" />
                <div className="flex flex-1 flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold">{w.name}</p>
                    <p className="font-mono text-[11px] text-muted-foreground">{w.x.toFixed(0)}°E · {w.y.toFixed(0)}°S grid</p>
                  </div>
                  <span className="font-mono text-xs tabular-nums text-muted-foreground">ETA {w.eta}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="space-y-4">
          <div className="plate p-5">
            <h2 className="font-display text-lg font-bold">Field units on chart</h2>
            <ul className="mt-3 space-y-2.5">
              {teams.map((t) => (
                <li key={t.id} className={cn(
                  "flex items-center justify-between gap-3 rounded-md border border-border/60 bg-background/60 p-3",
                  t.status === "DISTRESS" && "border-[#9e3b2c]/50 bg-[#9e3b2c]/10",
                )}>
                  <div>
                    <p className="text-sm font-bold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.vehicle} · {t.personnelCount} personnel</p>
                  </div>
                  <StatusBadge tone={t.status === "DISTRESS" ? "danger" : statusTone(t.status)} pulse={t.status === "DISTRESS"}>
                    {t.status === "DISTRESS" ? "Distress" : t.status}
                  </StatusBadge>
                </li>
              ))}
            </ul>
          </div>

          <div className="plate-dark p-4">
            <p className="overline-label text-[#c9a96a]">Chart conditions</p>
            <ul className="mt-2 space-y-1.5 text-xs text-[#efe6d2]/85">
              <li className="flex justify-between"><span>Link state</span><span className="font-mono">{connection}</span></li>
              <li className="flex justify-between"><span>Visibility (sim)</span><span className="font-mono">8 km · blowing snow</span></li>
              <li className="flex justify-between"><span>Wind (sim)</span><span className="font-mono">SE 28 kt gusting 41</span></li>
              <li className="flex justify-between"><span>Beacon watch</span><span className="font-mono">{emergency ? "1 ACTIVE" : "standby"}</span></li>
            </ul>
            <p className="mt-2.5 text-[10px] italic text-[#efe6d2]/55">
              Environmental values are illustrative only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

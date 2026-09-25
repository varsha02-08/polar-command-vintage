import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { usePolar } from "../store";
import { MapPanel } from "../map-panel";
import { SectionHeader, SimBadge, StatusBadge, statusTone } from "../ui-bits";
import type { Team } from "../types";
import { cn } from "@/lib/utils";

/* Interpolate team positions along their routes, looping */
function useTeamPositions(teams: Team[], paused: boolean) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setTick((x) => x + 1), 1500);
    return () => clearInterval(t);
  }, [paused]);

  const positions: Record<string, { x: number; y: number }> = {};
  teams.forEach((team) => {
    const r = team.route;
    const prog = (tick % 12) / 11; // 0→1 loop
    const segFloat = prog * (r.length - 1);
    const i = Math.min(r.length - 2, Math.floor(segFloat));
    const f = segFloat - i;
    positions[team.id] = {
      x: r[i].x + (r[i + 1].x - r[i].x) * f,
      y: r[i].y + (r[i + 1].y - r[i].y) * f,
    };
  });
  return positions;
}

export default function PersonnelPage() {
  const { teams, personnel, emergency } = usePolar();
  const positions = useTeamPositions(teams, emergency !== null);

  const byStatus = {
    STATION: personnel.filter((p) => p.status === "STATION").length,
    FIELD: personnel.filter((p) => p.status === "FIELD").length,
    REST: personnel.filter((p) => p.status === "REST").length,
    TRANSIT: personnel.filter((p) => p.status === "TRANSIT").length,
  };

  return (
    <div>
      <SectionHeader
        title="Personnel & Traverse Safety"
        subtitle="Live simulated telemetry for traverse teams and station rosters. Beacon health is monitored continuously."
        right={<SimBadge />}
      />

      {/* team cards */}
      <div className="grid gap-4 lg:grid-cols-2">
        {teams.map((t) => {
          const pos = positions[t.id];
          const distress = t.status === "DISTRESS";
          return (
            <div key={t.id} className={cn("plate p-4", distress && "ring-2 ring-[#9e3b2c]/60")}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground">{t.base} Station · Field unit</p>
                  <h2 className="mt-0.5 font-display text-xl font-bold">{t.name}</h2>
                </div>
                <StatusBadge tone={distress ? "danger" : statusTone(t.status)} pulse={distress || t.status === "ACTIVE"}>
                  {distress ? "DISTRESS" : t.status}
                </StatusBadge>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <Field label="Vehicle" value={t.vehicle} />
                <Field label="Personnel" value={String(t.personnelCount)} />
                <Field label="Beacon" value={t.beacon} tone={t.beacon === "ONLINE" ? "success" : "danger"} />
                <Field label="Last telemetry" value={t.lastTelemetry} />
              </div>

              <p className="mt-3 rounded-sm border border-border/70 bg-background/60 px-3 py-2 text-xs text-muted-foreground">
                <strong className="text-foreground">Current mission:</strong> {t.mission}
              </p>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                <MapPin className="mr-1 inline size-3" />
                {pos ? `${pos.x.toFixed(1)}°E · ${pos.y.toFixed(1)}°S grid` : "position pending"} · simulated GPS / beacon data
              </p>
            </div>
          );
        })}
      </div>

      {/* map with moving teams */}
      <div className="mt-4">
        <MapPanel height={380} teamPositions={positions} />
      </div>

      {/* roster */}
      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_2fr]">
        <div className="plate p-4">
          <h2 className="mb-3 font-display text-lg font-bold">Personnel Status</h2>
          <ul className="space-y-2">
            {(
              [
                ["At station", byStatus.STATION, "success"],
                ["In field", byStatus.FIELD, "info"],
                ["Rest cycle", byStatus.REST, "neutral"],
                ["In transit", byStatus.TRANSIT, "warning"],
              ] as const
            ).map(([label, count, tone]) => (
              <li key={label} className="flex items-center justify-between rounded-sm border border-border/60 bg-background/60 px-3 py-2">
                <span className="text-sm text-muted-foreground">{label}</span>
                <span className="flex items-center gap-2">
                  <span className="font-display text-lg font-bold tabular-nums">{count}</span>
                  <StatusBadge tone={tone}>{count}</StatusBadge>
                </span>
              </li>
            ))}
            <li className="flex items-center justify-between border-t border-border/60 pt-2">
              <span className="text-sm font-bold">Total deployed</span>
              <span className="font-display text-lg font-bold tabular-nums">{personnel.length}</span>
            </li>
          </ul>
        </div>

        <div className="plate overflow-hidden">
          <div className="border-b border-border/70 px-4 py-3">
            <h2 className="font-display text-lg font-bold">Roster — 46 simulated records</h2>
          </div>
          <div className="max-h-72 overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-card">
                <tr className="border-b border-border text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  <th className="px-4 py-2 font-bold">Name</th>
                  <th className="px-4 py-2 font-bold">Role</th>
                  <th className="px-4 py-2 font-bold">Station</th>
                  <th className="px-4 py-2 font-bold">Team</th>
                  <th className="px-4 py-2 font-bold">Status</th>
                </tr>
              </thead>
              <tbody>
                {personnel.map((p) => (
                  <tr key={p.id} className="ledger-row border-b border-border/40 last:border-0">
                    <td className="px-4 py-2 font-medium">{p.name}</td>
                    <td className="px-4 py-2 text-xs text-muted-foreground">{p.role}</td>
                    <td className="px-4 py-2 text-xs">{p.station}</td>
                    <td className="px-4 py-2 text-xs">{p.team ?? "—"}</td>
                    <td className="px-4 py-2"><StatusBadge tone={statusTone(p.status)}>{p.status}</StatusBadge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, tone }: { label: string; value: string; tone?: "success" | "danger" }) {
  return (
    <div className="rounded-sm border border-border/70 bg-background/60 p-2.5">
      <p className="overline-label text-muted-foreground">{label}</p>
      <p className={cn(
        "mt-0.5 text-sm font-bold tabular-nums",
        tone === "success" && "text-[#3f5e33]",
        tone === "danger" && "text-[#9e3b2c]",
      )}>
        {value}
      </p>
    </div>
  );
}

import { useState } from "react";
import {
  ArrowLeft, Boxes, FileCheck2, MapPin, Route, ShieldCheck, Siren, Users,
} from "lucide-react";
import { usePolar } from "../store";
import { OperationalProgress, SectionHeader, SimBadge, StatusBadge, statusTone } from "../ui-bits";

export default function ExpeditionsPage() {
  const { expeditions } = usePolar();
  const [openId, setOpenId] = useState<string | null>(null);

  const current = expeditions.find((e) => e.id === openId) ?? null;

  if (current) {
    return <ExpeditionDetail id={current.id} onBack={() => setOpenId(null)} />;
  }

  return (
    <div>
      <SectionHeader
        title="Expedition Management"
        subtitle="Filed expeditions with operational detail views linking personnel, cargo and compliance."
        right={<SimBadge />}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {expeditions.map((e) => (
          <button
            key={e.id}
            type="button"
            onClick={() => setOpenId(e.id)}
            className="plate p-5 text-left transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground">{e.id}</p>
                <h2 className="mt-0.5 font-display text-xl font-bold">{e.name}</h2>
              </div>
              <StatusBadge tone={statusTone(e.status)} pulse={e.status === "ACTIVE"}>{e.status}</StatusBadge>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-muted-foreground sm:grid-cols-4">
              <span><strong className="text-foreground">Station:</strong> {e.station}</span>
              <span><strong className="text-foreground">Type:</strong> {e.missionType}</span>
              <span><strong className="text-foreground">Window:</strong> {e.start} → {e.end}</span>
              <span><strong className="text-foreground">Risk:</strong> {e.risk}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-sm">
              <span className="flex items-center gap-1.5"><Users className="size-4 text-[#3c5a74]" /> {e.personnel} personnel</span>
              <span className="flex items-center gap-1.5"><Boxes className="size-4 text-[#a6885a]" /> {e.cargoItems} cargo items</span>
            </div>
            <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{e.summary}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#3c5a74]">
              Open operational view <ArrowRightIcon />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ArrowRightIcon() {
  return <ArrowRightSmall />;
}

function ArrowRightSmall() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function ExpeditionDetail({ id, onBack }: { id: string; onBack: () => void }) {
  const { expeditions, personnel, cargo, inventory, waste, emergency, compliancePct, go } = usePolar();
  const e = expeditions.find((x) => x.id === id)!;
  const teamMembers = personnel.filter((p) => p.station === e.station);
  const expCargo = cargo.filter((c) => c.origin === e.station || c.destination === e.station);
  const expInv = inventory.filter((i) => i.station === e.station);
  const expWaste = waste.filter((w) => w.station === e.station);
  const invAlerts = expInv.filter((i) => ["LOW STOCK", "CRITICAL", "COLD-CHAIN RISK"].includes(i.status)).length;
  const overdueWaste = expWaste.filter((w) => w.status === "OVERDUE").length;

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider text-[#3c5a74] hover:underline"
      >
        <ArrowLeft className="size-4" /> All expeditions
      </button>

      <SectionHeader
        title={e.name}
        subtitle={`${e.id} · ${e.station} Station · ${e.missionType} mission · ${e.start} → ${e.end}`}
        right={<StatusBadge tone={statusTone(e.status)} pulse={e.status === "ACTIVE"}>{e.status}</StatusBadge>}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {/* overview */}
        <div className="plate p-5 lg:col-span-2">
          <h2 className="overline-label mb-2 text-[#a6885a]">Mission Overview</h2>
          <p className="text-sm leading-relaxed text-foreground/85">{e.summary}</p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MiniStat label="Personnel" value={e.personnel} icon={Users} />
            <MiniStat label="Cargo items" value={e.cargoItems} icon={Boxes} />
            <MiniStat label="Risk level" value={e.risk} icon={ShieldCheck} />
            <MiniStat label="Stations" value={e.station} icon={MapPin} />
          </div>

          <h3 className="overline-label mb-2 mt-5 flex items-center gap-1.5 text-[#a6885a]">
            <Route className="size-3.5" /> Route plan
          </h3>
          <ol className="flex flex-wrap items-center gap-1.5">
            {e.waypoints.map((w, i) => (
              <li key={w} className="flex items-center gap-1.5">
                <span className="rounded-sm border border-border bg-background px-2.5 py-1 text-xs font-semibold">{w}</span>
                {i < e.waypoints.length - 1 && <span className="text-muted-foreground">→</span>}
              </li>
            ))}
          </ol>
        </div>

        {/* status column */}
        <div className="space-y-4">
          <div className="plate p-4">
            <h3 className="overline-label mb-3 flex items-center gap-1.5 text-[#a6885a]">
              <Siren className="size-3.5" /> Emergency status
            </h3>
            {emergency ? (
              <button type="button" onClick={() => go("emergency")} className="w-full rounded-md border border-[#9e3b2c]/40 bg-[#9e3b2c]/10 p-3 text-left hover:bg-[#9e3b2c]/20">
                <p className="text-xs font-bold uppercase tracking-wider text-[#9e3b2c]">Distress beacon active</p>
                <p className="mt-1 text-xs text-[#7c5117]">{emergency.teamName} — open Emergency Center</p>
              </button>
            ) : (
              <p className="rounded-md border border-[#567d46]/35 bg-[#567d46]/10 p-3 text-xs font-semibold text-[#3f5e33]">
                No active emergencies. All teams nominal.
              </p>
            )}
          </div>

          <div className="plate p-4">
            <h3 className="overline-label mb-3 flex items-center gap-1.5 text-[#a6885a]">
              <FileCheck2 className="size-3.5" /> Compliance status
            </h3>
            <div className="flex items-baseline justify-between">
              <p className="font-display text-2xl font-bold tabular-nums">{compliancePct}%</p>
              <button type="button" onClick={() => go("compliance")} className="text-xs font-bold uppercase tracking-wider text-[#3c5a74] hover:underline">
                Open checklist
              </button>
            </div>
            <OperationalProgress pct={compliancePct} tone={compliancePct >= 80 ? "success" : "warning"} className="mt-2" />
            <p className="mt-2 text-xs text-muted-foreground">
              {overdueWaste > 0 ? `${overdueWaste} waste record${overdueWaste === 1 ? "" : "s"} overdue for this station.` : "Waste manifest current for this station."}
            </p>
          </div>
        </div>

        {/* tables row */}
        <div className="plate p-4 lg:col-span-2">
          <h3 className="overline-label mb-3 text-[#a6885a]">Personnel roster ({teamMembers.length})</h3>
          <div className="max-h-48 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-card">
                <tr className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  <th className="py-1.5 font-bold">Name</th><th className="py-1.5 font-bold">Role</th><th className="py-1.5 font-bold">Status</th>
                </tr>
              </thead>
              <tbody>
                {teamMembers.slice(0, 12).map((p) => (
                  <tr key={p.id} className="border-t border-border/50">
                    <td className="py-1.5 font-medium">{p.name}</td>
                    <td className="py-1.5 text-muted-foreground">{p.role}</td>
                    <td className="py-1.5"><StatusBadge tone={statusTone(p.status)}>{p.status}</StatusBadge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="plate p-4">
          <h3 className="overline-label mb-3 text-[#a6885a]">Linked cargo ({expCargo.length})</h3>
          <ul className="max-h-48 space-y-1.5 overflow-y-auto text-xs">
            {expCargo.slice(0, 10).map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-2 rounded-sm border border-border/60 bg-background/60 px-2.5 py-1.5">
                <span className="truncate"><span className="font-mono font-semibold">{c.id}</span> — {c.description}</span>
                <StatusBadge tone={statusTone(c.status)}>{c.status}</StatusBadge>
              </li>
            ))}
          </ul>
          <h3 className="overline-label mb-2 mt-4 text-[#a6885a]">Inventory snapshot</h3>
          <p className="text-xs text-muted-foreground">
            {expInv.length} records at {e.station}; <strong className="text-[#7c5117]">{invAlerts} alert{invAlerts === 1 ? "" : "s"}</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, icon: Icon }: { label: string; value: string | number; icon: typeof Users }) {
  return (
    <div className="rounded-sm border border-border/70 bg-background/60 p-2.5">
      <p className="overline-label flex items-center gap-1.5 text-muted-foreground"><Icon className="size-3" /> {label}</p>
      <p className="mt-0.5 font-display text-lg font-bold tabular-nums">{value}</p>
    </div>
  );
}

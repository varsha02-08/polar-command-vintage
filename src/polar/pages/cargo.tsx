import { useMemo, useState } from "react";
import { ArrowDownToLine, PackageCheck, Search, Ship, Truck } from "lucide-react";
import { usePolar } from "../store";
import { SectionHeader, SimBadge, StatusBadge, statusTone } from "../ui-bits";
import type { CargoItem } from "../types";

const FLOW: CargoItem["status"][] = ["RECEIVED", "LOADED", "IN TRANSIT", "DELIVERED"];

const NEXT_ACTION: Partial<Record<CargoItem["status"], { label: string; next: CargoItem["status"]; icon: typeof Ship }>> = {
  RECEIVED: { label: "Load", next: "LOADED", icon: ArrowDownToLine },
  LOADED: { label: "Dispatch", next: "IN TRANSIT", icon: Truck },
  "IN TRANSIT": { label: "Deliver", next: "DELIVERED", icon: PackageCheck },
};

export default function CargoPage() {
  const { cargo, markCargo } = usePolar();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("ALL");
  const [status, setStatus] = useState("ALL");

  const cats = useMemo(() => Array.from(new Set(cargo.map((c) => c.category))), [cargo]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return cargo.filter((c) => {
      if (cat !== "ALL" && c.category !== cat) return false;
      if (status !== "ALL" && c.status !== status) return false;
      if (needle && !`${c.id} ${c.description} ${c.origin} ${c.destination}`.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [cargo, q, cat, status]);

  const counts = FLOW.map((s) => cargo.filter((c) => c.status === s).length);

  return (
    <div>
      <SectionHeader
        title="Cargo Management"
        subtitle="120 simulated manifest items moving between Maitri, Bharati and field depots."
        right={<SimBadge />}
      />

      {/* flow counters */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {FLOW.map((s, idx) => (
          <div key={s} className="plate p-3">
            <div className="flex items-center justify-between">
              <p className="overline-label text-muted-foreground">{s}</p>
              <StatusBadge tone={statusTone(s)}>{counts[idx]}</StatusBadge>
            </div>
            <p className="mt-1 font-display text-2xl font-bold tabular-nums">{counts[idx]}</p>
          </div>
        ))}
      </div>

      {/* filters */}
      <div className="plate mb-4 flex flex-wrap items-center gap-2 p-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search cargo ID, description, route…"
            className="h-11 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
          />
        </div>
        <select value={cat} onChange={(e) => setCat(e.target.value)} className="h-11 rounded-md border border-input bg-background px-3 text-sm">
          <option value="ALL">All categories</option>
          {cats.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-11 rounded-md border border-input bg-background px-3 text-sm">
          <option value="ALL">All statuses</option>
          {FLOW.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="plate overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[940px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                <th className="px-4 py-3 font-bold">Cargo ID</th>
                <th className="px-4 py-3 font-bold">Description</th>
                <th className="px-4 py-3 font-bold">Origin</th>
                <th className="px-4 py-3 font-bold">Destination</th>
                <th className="px-4 py-3 text-right font-bold">Weight</th>
                <th className="px-4 py-3 font-bold">Priority</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3 text-right font-bold">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 60).map((c) => {
                const act = NEXT_ACTION[c.status];
                return (
                  <tr key={c.id} className="ledger-row border-b border-border/50 last:border-0">
                    <td className="px-4 py-2.5 font-mono text-xs font-semibold">{c.id}</td>
                    <td className="px-4 py-2.5 font-medium">{c.description}</td>
                    <td className="px-4 py-2.5 text-xs">{c.origin}</td>
                    <td className="px-4 py-2.5 text-xs">{c.destination}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{c.weightKg.toLocaleString()} kg</td>
                    <td className="px-4 py-2.5"><StatusBadge tone={statusTone(c.priority)}>{c.priority}</StatusBadge></td>
                    <td className="px-4 py-2.5"><StatusBadge tone={statusTone(c.status)} pulse={c.status === "IN TRANSIT"}>{c.status}</StatusBadge></td>
                    <td className="px-4 py-2.5 text-right">
                      {act ? (
                        <button
                          type="button"
                          onClick={() => markCargo(c.id, act.next)}
                          className="inline-flex items-center gap-1.5 rounded-md border border-[#3c5a74]/40 bg-[#3c5a74]/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#2f4a63] hover:bg-[#3c5a74]/20"
                        >
                          <act.icon className="size-3.5" /> {act.label}
                        </button>
                      ) : (
                        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Complete</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-muted-foreground">No cargo matches the current filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 60 && (
          <p className="border-t border-border/70 px-4 py-2 text-center text-[11px] text-muted-foreground">
            Showing first 60 of {filtered.length} items — refine filters to narrow the manifest.
          </p>
        )}
      </div>
    </div>
  );
}

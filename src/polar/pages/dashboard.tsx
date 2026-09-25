import { useMemo } from "react";
import { ArrowRight, Thermometer } from "lucide-react";
import { usePolar } from "../store";
import { MapPanel } from "../map-panel";
import { MetricCard, SectionHeader, SimBadge, StatusBadge, statusTone } from "../ui-bits";
import { cn } from "@/lib/utils";

const KIND_DOT: Record<string, string> = {
  cargo: "#3c5a74", inventory: "#a6885a", personnel: "#567d46",
  waste: "#a9752c", sync: "#3c5a74", emergency: "#9e3b2c", scan: "#6f5729",
};

export default function DashboardPage() {
  const {
    inventoryAlerts, personnelDeployed, expeditionsActive, assetsCount,
    activeEmergencies, inventory, cargo, expeditions, alerts, activity, go,
    triggerDistress, teamsInDistress,
  } = usePolar();

  const coldChainRisk = useMemo(
    () => inventory.filter((i) => i.status === "COLD-CHAIN RISK"),
    [inventory],
  );

  const opAlerts = useMemo(() => alerts.filter((a) => a.status !== "DISMISSED").slice(0, 5), [alerts]);

  return (
    <div>
      <SectionHeader
        title="Polar Operations Command Center"
        subtitle="Unified visibility across expeditions, assets, personnel and field operations."
        right={<SimBadge />}
      />

      {/* metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <MetricCard label="Active Expeditions" value={String(expeditionsActive).padStart(2, "0")} tone="success" hint={`${expeditions.length} total filed`} onClick={() => go("expeditions")} />
        <MetricCard label="Personnel Deployed" value={personnelDeployed} tone="info" hint="Across both stations" onClick={() => go("personnel")} />
        <MetricCard label="Cargo Items" value={cargo.length} tone="gold" hint="Live manifest" onClick={() => go("cargo")} />
        <MetricCard label="Assets" value={assetsCount} tone="neutral" hint="Vehicles · plant · comms" onClick={() => go("personnel")} />
        <MetricCard label="Inventory Alerts" value={String(inventoryAlerts).padStart(2, "0")} tone={inventoryAlerts > 0 ? "warning" : "success"} hint="Below safety / cold-chain" onClick={() => go("inventory")} />
        <MetricCard label="Active Emergencies" value={String(activeEmergencies).padStart(2, "0")} tone={activeEmergencies > 0 ? "danger" : "success"} hint={activeEmergencies > 0 ? "Response in progress" : "All teams nominal"} onClick={() => go("emergency")} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        {/* map */}
        <div className="space-y-4">
          <MapPanel height={360} />
          {/* cold chain strip */}
          {coldChainRisk.length > 0 && (
            <button
              type="button"
              onClick={() => go("inventory")}
              className="plate flex w-full items-center gap-3 p-4 text-left transition-shadow hover:shadow-md"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-sm bg-[#9e3b2c]/10 text-[#9e3b2c]">
                <Thermometer className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-foreground">
                  Cold-chain risk — {coldChainRisk.length} record{coldChainRisk.length === 1 ? "" : "s"} breaching threshold
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {coldChainRisk.map((c) => c.assetId).join(" · ")} — review and plan protective action
                </span>
              </span>
              <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
            </button>
          )}
          {/* distress quick action */}
          <div className="plate-dark flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="overline-label text-[#c9a96a]">Drill · Emergency readiness</p>
              <p className="mt-0.5 text-sm text-[#efe6d2]/90">
                {teamsInDistress
                  ? "A distress beacon is active — manage it in the Emergency Center."
                  : "Run a simulated distress drill to demonstrate the response workflow."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => triggerDistress("alpha")}
              disabled={teamsInDistress}
              className={cn(
                "rounded-md px-4 py-2.5 text-sm font-bold uppercase tracking-wider transition-colors",
                teamsInDistress
                  ? "cursor-not-allowed bg-[#efe6d2]/15 text-[#efe6d2]/50"
                  : "bg-[#9e3b2c] text-[#f6efe1] hover:bg-[#b04a3a]",
              )}
            >
              {teamsInDistress ? "Beacon Active" : "Simulate Distress Alert"}
            </button>
          </div>
        </div>

        {/* right column */}
        <div className="space-y-4">
          {/* expeditions */}
          <div className="plate p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">Active Expeditions</h2>
              <button type="button" onClick={() => go("expeditions")} className="text-xs font-semibold text-[#3c5a74] hover:underline">
                View all
              </button>
            </div>
            <ul className="space-y-2.5">
              {expeditions.map((e) => (
                <li key={e.id}>
                  <button
                    type="button"
                    onClick={() => go("expeditions")}
                    className="w-full rounded-md border border-border/70 bg-background/60 p-3 text-left transition-colors hover:bg-accent/40"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-foreground">{e.name}</p>
                        <p className="text-xs text-muted-foreground">Location: {e.station} Station</p>
                      </div>
                      <StatusBadge tone={statusTone(e.status)} pulse={e.status === "ACTIVE"}>{e.status}</StatusBadge>
                    </div>
                    <p className="mt-1.5 font-mono text-[11px] text-muted-foreground">
                      Personnel {e.personnel} · Cargo {e.cargoItems} items
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* operational alerts */}
          <div className="plate p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">Operational Alerts</h2>
              <button type="button" onClick={() => go("alerts")} className="text-xs font-semibold text-[#3c5a74] hover:underline">
                Alert center
              </button>
            </div>
            <ul className="space-y-2">
              {opAlerts.map((a) => (
                <li key={a.id}>
                  <button
                    type="button"
                    onClick={() => go(a.target)}
                    className="w-full rounded-md border border-border/70 bg-background/60 p-2.5 text-left transition-colors hover:bg-accent/40"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className="size-2 shrink-0 rounded-full"
                        style={{ background: a.severity === "CRITICAL" ? "#9e3b2c" : a.severity === "WARNING" ? "#a9752c" : "#3c5a74" }}
                      />
                      <span className="flex-1 truncate text-xs font-bold text-foreground">{a.title}</span>
                      <span className="font-mono text-[10px] text-muted-foreground">{a.createdAt}</span>
                    </span>
                    <span className="mt-1 block truncate text-[11px] text-muted-foreground">{a.detail}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* activity */}
          <div className="plate p-4">
            <h2 className="mb-3 font-display text-lg font-bold">Recent Activity</h2>
            <ul className="space-y-2.5">
              {activity.slice(0, 6).map((a) => (
                <li key={a.id} className="flex items-start gap-2.5">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full" style={{ background: KIND_DOT[a.kind] ?? "#6e5f4b" }} />
                  <div className="min-w-0">
                    <p className="text-xs leading-snug text-foreground/90">{a.text}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">{a.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

import {
  Activity, Antenna, BellRing, Boxes, Compass, FileCheck2, Gauge,
  PackageSearch, RadioTower, Siren, Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePolar } from "./store";
import { SimBadge } from "./ui-bits";
import type { Section } from "./types";

const NAV: Array<{ id: Section; label: string; icon: LucideIcon; badge?: "alerts" | "emergency" }> = [
  { id: "dashboard", label: "Dashboard", icon: Gauge },
  { id: "expeditions", label: "Expeditions", icon: Compass },
  { id: "map", label: "Operations Map", icon: Activity },
  { id: "inventory", label: "Inventory & Cold Chain", icon: Boxes },
  { id: "cargo", label: "Cargo", icon: PackageSearch },
  { id: "personnel", label: "Personnel & Traverses", icon: Users },
  { id: "emergency", label: "Emergency Center", icon: Siren, badge: "emergency" },
  { id: "compliance", label: "Treaty & Compliance", icon: FileCheck2 },
  { id: "sync", label: "Sync Center", icon: RadioTower },
  { id: "alerts", label: "Alert Center", icon: BellRing, badge: "alerts" },
];

export function Sidebar() {
  const { section, go, unreadAlerts, teamsInDistress } = usePolar();

  return (
    <aside className="flex w-60 shrink-0 flex-col bg-sidebar text-sidebar-foreground">
      {/* brand */}
      <div className="border-b border-sidebar-border px-5 py-5">
        <div className="flex items-center gap-2.5">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-sidebar-primary" aria-hidden>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 3a9 9 0 0 1 0 18" fill="currentColor" stroke="none" opacity="0.3" />
            <path d="M5.5 8h13M4.5 12h15M5.5 16h13" strokeWidth="1.2" />
          </svg>
        </div>
        <div>
          <p className="font-display text-xl font-bold leading-none tracking-wide">POLARLOG</p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-sidebar-foreground/60">
            Integrated Polar Operations
          </p>
        </div>
      </div>

      {/* demo badge */}
      <div className="border-b border-sidebar-border px-4 py-3">
        <span className="stamp border-sidebar-primary/70 text-[9px] text-sidebar-primary">
          Demo Mode · Simulated
        </span>
      </div>

      {/* nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="overline-label px-2 pb-2 text-sidebar-foreground/45">Operations</p>
        <ul className="space-y-0.5">
          {NAV.map((item) => {
            const active = section === item.id;
            const emergencyFlag = item.badge === "emergency" && teamsInDistress;
            const alertFlag = item.badge === "alerts" && unreadAlerts > 0;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => go(item.id)}
                  className={cn(
                    "group flex w-full items-center gap-2.5 rounded-md px-2.5 py-2.5 text-left text-sm font-medium transition-colors",
                    active
                      ? "bg-sidebar-primary/15 text-sidebar-primary-foreground ring-1 ring-sidebar-primary/40"
                      : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                  )}
                >
                  <item.icon className={cn("size-4 shrink-0", active ? "text-sidebar-primary" : "opacity-70")} />
                  <span className="flex-1 leading-snug">{item.label}</span>
                  {alertFlag && (
                    <span className="flex min-w-5 items-center justify-center rounded-full bg-[#a9752c] px-1.5 py-0.5 text-[9px] font-bold text-white">
                      {unreadAlerts}
                    </span>
                  )}
                  {emergencyFlag && <span className="size-2 rounded-full bg-[#9e3b2c] animate-softpulse" />}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* footer */}
      <div className="border-t border-sidebar-border px-5 py-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-sidebar-foreground/50">NCPOR / MoES</p>
        <p className="mt-0.5 text-xs font-semibold text-sidebar-foreground/85">Maitri · Bharati</p>
        <p className="text-[11px] text-sidebar-foreground/55">Antarctic Operations</p>
      </div>
    </aside>
  );
}

export function TopStatusBar() {
  const { connection, utc, pendingCount, unreadAlerts, go, activeEmergencies } = usePolar();
  const online = connection === "ONLINE";

  return (
    <header className="sticky top-0 z-30 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border bg-card/95 px-4 py-2.5 backdrop-blur">
      {/* connection */}
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "size-2.5 rounded-full",
            online ? "bg-[#567d46]" : "bg-[#9e3b2c] animate-softpulse",
          )}
        />
        <div className="leading-tight">
          <p className={cn("text-xs font-bold tracking-wide", online ? "text-[#3f5e33]" : "text-[#9e3b2c]")}>
            {online ? "IRIDIUM LINK SIMULATED • ONLINE" : "SATELLITE LINK OFFLINE"}
          </p>
          <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            {online
              ? `${pendingCount} Pending Transaction${pendingCount === 1 ? "" : "s"}`
              : `Local Edge Mode Active · ${pendingCount} Pending Transactions`}
          </p>
        </div>
      </div>

      <span className="hidden h-6 w-px bg-border md:block" />

      <div className="flex items-center gap-2">
        <SimBadge label="Demo Mode" />
        <span className="font-mono text-xs tabular-nums text-muted-foreground">{utc}</span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {activeEmergencies > 0 && (
          <button
            type="button"
            onClick={() => go("emergency")}
            className="flex items-center gap-1.5 rounded-sm border border-[#9e3b2c]/50 bg-[#9e3b2c]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#9e3b2c] hover:bg-[#9e3b2c]/20"
          >
            <Siren className="size-3" />
            Emergency active
          </button>
        )}
        <button
          type="button"
          onClick={() => go("sync")}
          className={cn(
            "flex items-center gap-1.5 rounded-sm border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em]",
            online
              ? "border-[#567d46]/40 bg-[#567d46]/10 text-[#3f5e33] hover:bg-[#567d46]/20"
              : "border-[#9e3b2c]/50 bg-[#9e3b2c]/10 text-[#9e3b2c] hover:bg-[#9e3b2c]/20",
          )}
        >
          <Antenna className="size-3" />
          Sync Center
        </button>
        <button
          type="button"
          onClick={() => go("alerts")}
          className="flex items-center gap-1.5 rounded-sm border border-border bg-background px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground hover:bg-accent"
        >
          <BellRing className="size-3" />
          Alerts
          {unreadAlerts > 0 && (
            <span className="rounded-full bg-[#a9752c] px-1.5 py-0.5 text-[9px] text-white">{unreadAlerts}</span>
          )}
        </button>
      </div>
    </header>
  );
}

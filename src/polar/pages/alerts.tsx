import { useState } from "react";
import { BellRing, Check, Eye, X } from "lucide-react";
import { usePolar } from "../store";
import { SectionHeader, SimBadge, StatusBadge } from "../ui-bits";
import type { AlertCategory } from "../types";
import { cn } from "@/lib/utils";

const CATEGORIES: AlertCategory[] = [
  "Inventory", "Cold Chain", "Personnel", "Emergency", "Cargo", "Compliance", "Connectivity",
];

const SEV: Record<string, { dot: string; chip: string; label: string }> = {
  CRITICAL: { dot: "#9e3b2c", chip: "border-[#9e3b2c]/45 bg-[#9e3b2c]/10 text-[#9e3b2c]", label: "CRITICAL" },
  WARNING: { dot: "#a9752c", chip: "border-[#a9752c]/40 bg-[#a9752c]/10 text-[#7c5117]", label: "WARNING" },
  INFO: { dot: "#3c5a74", chip: "border-[#3c5a74]/40 bg-[#3c5a74]/10 text-[#2f4a63]", label: "ADVISORY" },
};

export default function AlertsPage() {
  const { alerts, acknowledgeAlert, dismissAlert, go, unreadAlerts, acknowledgeAllAlerts } = usePolar();
  const [cat, setCat] = useState<string>("ALL");

  const visible = alerts.filter((a) => a.status !== "DISMISSED");
  const filtered = cat === "ALL" ? visible : visible.filter((a) => a.category === cat);
  const unreadInCat = (c: string) => visible.filter((a) => a.category === c && a.status === "UNREAD").length;

  return (
    <div>
      <SectionHeader
        title="Alert Center"
        subtitle="Unified operational alerts across inventory, cold chain, personnel, emergency, cargo, compliance and connectivity."
        right={
          <>
            <SimBadge />
            <button
              type="button"
              onClick={acknowledgeAllAlerts}
              disabled={unreadAlerts === 0}
              className="rounded-md border border-border px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:bg-accent disabled:opacity-50"
            >
              Acknowledge all ({unreadAlerts})
            </button>
          </>
        }
      />

      {/* category chips */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setCat("ALL")}
          className={cn(
            "rounded-full border px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider",
            cat === "ALL" ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground hover:bg-accent",
          )}
        >
          All ({visible.length})
        </button>
        {CATEGORIES.map((c) => {
          const n = visible.filter((a) => a.category === c).length;
          const unread = unreadInCat(c);
          return (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider",
                cat === c ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground hover:bg-accent",
              )}
            >
              {c} ({n}){unread > 0 && <span className="ml-1.5 inline-block size-1.5 rounded-full bg-[#a9752c]" />}
            </button>
          );
        })}
      </div>

      <div className="space-y-2.5">
        {filtered.map((a) => {
          const sev = SEV[a.severity];
          return (
            <div
              key={a.id}
              className={cn(
                "plate flex flex-wrap items-start gap-3 p-4",
                a.status === "UNREAD" && "border-l-4",
                a.status === "UNREAD" && a.severity === "CRITICAL" && "border-l-[#9e3b2c]",
                a.status === "UNREAD" && a.severity === "WARNING" && "border-l-[#a9752c]",
                a.status === "UNREAD" && a.severity === "INFO" && "border-l-[#3c5a74]",
                a.status === "ACK" && "opacity-80",
              )}
            >
              <span className="mt-1 size-2.5 shrink-0 rounded-full" style={{ background: sev.dot }} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-bold text-foreground">{a.title}</p>
                  <span className={cn("rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em]", sev.chip)}>
                    {sev.label} · {a.category}
                  </span>
                  {a.status === "ACK" && <StatusBadge tone="neutral">Acknowledged</StatusBadge>}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{a.detail}</p>
                <p className="mt-1 font-mono text-[10px] text-muted-foreground">{a.createdAt}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => acknowledgeAlert(a.id)}
                  disabled={a.status === "ACK"}
                  className="inline-flex items-center gap-1.5 rounded-md border border-[#567d46]/40 bg-[#567d46]/10 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-[#3f5e33] hover:bg-[#567d46]/20 disabled:opacity-50"
                >
                  <Check className="size-3.5" /> Acknowledge
                </button>
                <button
                  type="button"
                  onClick={() => go(a.target)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-[#3c5a74]/40 bg-[#3c5a74]/10 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-[#2f4a63] hover:bg-[#3c5a74]/20"
                >
                  <Eye className="size-3.5" /> Open
                </button>
                <button
                  type="button"
                  onClick={() => dismissAlert(a.id)}
                  className="rounded-md border border-border px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:bg-accent"
                >
                  <X className="size-3.5" /> Dismiss
                </button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="plate p-10 text-center">
            <BellRing className="mx-auto size-8 text-muted-foreground/50" />
            <p className="mt-2 text-sm font-semibold">No alerts in this view.</p>
            <p className="text-xs text-muted-foreground">New simulated events will appear here automatically.</p>
          </div>
        )}
      </div>
    </div>
  );
}

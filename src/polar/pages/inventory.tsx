import { useMemo, useState } from "react";
import { QrCode, ScanLine, Search, Thermometer, X } from "lucide-react";
import { toast } from "sonner";
import { usePolar } from "../store";
import { SectionHeader, SimBadge, StatusBadge, statusTone } from "../ui-bits";
import type { InventoryCategory, InventoryItem, Station } from "../types";
import { cn } from "@/lib/utils";

const CATEGORIES: InventoryCategory[] = [
  "Fuel", "Rations", "Medical Supplies", "Spare Parts",
  "Scientific Equipment", "Emergency Supplies", "Waste / Return Payload",
];
const STATIONS: Station[] = ["Maitri", "Bharati"];
const STATUSES = ["NORMAL", "LOW STOCK", "CRITICAL", "COLD-CHAIN RISK"] as const;

export default function InventoryPage() {
  const { inventory, scanAsset, connection } = usePolar();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("ALL");
  const [station, setStation] = useState<string>("ALL");
  const [status, setStatus] = useState<string>("ALL");
  const [detail, setDetail] = useState<InventoryItem | null>(null);
  const [scanOpen, setScanOpen] = useState(false);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return inventory.filter((i) => {
      if (cat !== "ALL" && i.category !== cat) return false;
      if (station !== "ALL" && i.station !== station) return false;
      if (status !== "ALL" && i.status !== status) return false;
      if (
        needle &&
        !(`${i.assetId} ${i.item} ${i.category}`.toLowerCase().includes(needle))
      ) return false;
      return true;
    });
  }, [inventory, q, cat, station, status]);

  const lowCount = inventory.filter((i) => i.status === "LOW STOCK").length;
  const criticalCount = inventory.filter((i) => i.status === "CRITICAL").length;
  const coldCount = inventory.filter((i) => i.status === "COLD-CHAIN RISK").length;

  return (
    <div>
      <SectionHeader
        title="Inventory & Cold-Chain"
        subtitle="120 simulated stock records across Maitri and Bharati. Cold-chain records expose live temperature gauges and reorder logic."
        right={
          <>
            <SimBadge />
            <button
              type="button"
              onClick={() => setScanOpen(true)}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary/90"
            >
              <QrCode className="size-4" /> Scan Asset
            </button>
          </>
        }
      />

      {/* summary chips */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="plate p-3"><p className="overline-label text-muted-foreground">Records in view</p><p className="font-display text-2xl font-bold tabular-nums">{filtered.length}</p></div>
        <div className="plate p-3"><p className="overline-label text-muted-foreground">Low stock</p><p className="font-display text-2xl font-bold tabular-nums text-[#7c5117]">{lowCount}</p></div>
        <div className="plate p-3"><p className="overline-label text-muted-foreground">Critical</p><p className="font-display text-2xl font-bold tabular-nums text-[#9e3b2c]">{criticalCount}</p></div>
        <div className="plate p-3"><p className="overline-label text-muted-foreground">Cold-chain risk</p><p className="font-display text-2xl font-bold tabular-nums text-[#9e3b2c]">{coldCount}</p></div>
      </div>

      {/* filters */}
      <div className="plate mb-4 flex flex-wrap items-center gap-2 p-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search asset ID, item, category…"
            className="h-11 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
          />
        </div>
        <select value={cat} onChange={(e) => setCat(e.target.value)} className="h-11 rounded-md border border-input bg-background px-3 text-sm">
          <option value="ALL">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={station} onChange={(e) => setStation(e.target.value)} className="h-11 rounded-md border border-input bg-background px-3 text-sm">
          <option value="ALL">All stations</option>
          {STATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="h-11 rounded-md border border-input bg-background px-3 text-sm">
          <option value="ALL">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        {(q || cat !== "ALL" || station !== "ALL" || status !== "ALL") && (
          <button
            type="button"
            onClick={() => { setQ(""); setCat("ALL"); setStation("ALL"); setStatus("ALL"); }}
            className="h-11 rounded-md border border-border px-3 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:bg-accent"
          >
            Clear
          </button>
        )}
      </div>

      {/* table */}
      <div className="plate overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                <th className="px-4 py-3 font-bold">Asset ID</th>
                <th className="px-4 py-3 font-bold">Item</th>
                <th className="px-4 py-3 font-bold">Category</th>
                <th className="px-4 py-3 font-bold">Station</th>
                <th className="px-4 py-3 text-right font-bold">Qty</th>
                <th className="px-4 py-3 text-right font-bold">Safety</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3 text-right font-bold">Updated</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 60).map((i) => (
                <tr
                  key={i.id}
                  onClick={() => setDetail(i)}
                  className="ledger-row cursor-pointer border-b border-border/50 last:border-0"
                >
                  <td className="px-4 py-2.5 font-mono text-xs font-semibold">{i.assetId}</td>
                  <td className="px-4 py-2.5 font-medium">{i.item}</td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">{i.category}</td>
                  <td className="px-4 py-2.5 text-xs">{i.station}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{i.quantity} {i.unit}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">{i.safetyStock}</td>
                  <td className="px-4 py-2.5"><StatusBadge tone={statusTone(i.status)} pulse={i.status === "CRITICAL"}>{i.status}</StatusBadge></td>
                  <td className="px-4 py-2.5 text-right font-mono text-xs text-muted-foreground">{i.updatedMin}m ago</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-muted-foreground">No records match the current filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 60 && (
          <p className="border-t border-border/70 px-4 py-2 text-center text-[11px] text-muted-foreground">
            Showing first 60 of {filtered.length} matching records — refine filters to narrow the ledger.
          </p>
        )}
      </div>

      {detail && <ItemDetail item={detail} onClose={() => setDetail(null)} />}
      {scanOpen && <ScannerModal onClose={() => setScanOpen(false)} offline={connection === "OFFLINE"} onScan={scanAsset} />}
    </div>
  );
}

/* ── item detail with temperature gauge + reorder logic ─────────────── */
function ItemDetail({ item, onClose }: { item: InventoryItem; onClose: () => void }) {
  const cold = item.temp !== null;
  /* Status is the source of truth: a logged excursion (or an active breach) marks risk. */
  const overThreshold = cold && (item.status === "COLD-CHAIN RISK" || (item.safeMax !== null && item.temp !== null && item.temp > item.safeMax));
  const reorder = Math.max(0, item.safetyStock * 2 - item.quantity);
  const gaugePct = cold && item.temp !== null
    ? Math.min(100, Math.max(0, ((item.temp - (item.safeMin ?? -40)) / ((item.safeMax ?? -10) - (item.safeMin ?? -40))) * 100))
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2b2118]/55 p-4" onClick={onClose}>
      <div className="plate w-full max-w-lg p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-xs tracking-[0.16em] text-muted-foreground">{item.assetId}</p>
            <h3 className="font-display text-xl font-bold">{item.item}</h3>
            <p className="text-xs text-muted-foreground">{item.category} · {item.station} Station</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-sm border border-border p-1.5 hover:bg-accent" aria-label="Close">
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <Cell label="Current stock" value={`${item.quantity} ${item.unit}`} />
          <Cell label="Safety stock" value={`${item.safetyStock} ${item.unit}`} />
          <Cell label="Suggested reorder" value={reorder > 0 ? `${reorder} ${item.unit}` : "—"} />
          <Cell label="Last updated" value={`${item.updatedMin}m ago`} />
        </div>

        {cold && (
          <div className="mt-4 rounded-md border border-border bg-background/60 p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="overline-label flex items-center gap-1.5 text-muted-foreground">
                <Thermometer className="size-3.5" /> Temperature gauge
              </p>
              <StatusBadge tone={overThreshold ? "danger" : "success"} pulse={overThreshold}>
                {overThreshold ? "Cold-chain risk" : "In range"}
              </StatusBadge>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={cn("font-display text-3xl font-bold tabular-nums", overThreshold && "text-[#9e3b2c]")}>
                {item.temp}°C
              </span>
              <span className="text-xs text-muted-foreground">safe range {(item.safeMin)}°C to {(item.safeMax)}°C</span>
            </div>
            <div className="relative mt-3 h-3 overflow-hidden rounded-full bg-gradient-to-r from-[#3c5a74]/30 via-[#567d46]/35 to-[#9e3b2c]/40">
              <div
                className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card bg-[#3e3222] shadow"
                style={{ left: `${gaugePct}%` }}
              />
            </div>
            <div className="mt-1 flex justify-between font-mono text-[10px] text-muted-foreground">
              <span>{item.safeMin}°C</span>
              <span>{item.safeMax}°C</span>
            </div>
            {overThreshold && (
              <div className="mt-3 rounded-sm border border-[#9e3b2c]/40 bg-[#9e3b2c]/10 p-2.5">
                <p className="text-xs font-bold text-[#9e3b2c]">
                  Cold-chain excursion logged — exposure {item.exposureHours} h against a {(item.safeMax)}°C safe maximum.
                </p>
                <p className="mt-0.5 text-xs text-[#7c5117]">
                  Recommended reorder: {reorder > 0 ? `${reorder} ${item.unit}` : "protective action"} — simulated frontend logic.
                </p>
              </div>
            )}
          </div>
        )}

        {item.status === "QUEUED LOCALLY" && (
          <div className="mt-3 rounded-sm border border-[#a9752c]/40 bg-[#a9752c]/10 p-2.5 text-xs text-[#7c5117]">
            This scan is <strong>QUEUED LOCALLY</strong> and will sync when the satellite link is restored.
          </div>
        )}
      </div>
    </div>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-border/70 bg-background/60 p-2.5">
      <p className="overline-label text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-bold tabular-nums">{value}</p>
    </div>
  );
}

/* ── simulated QR scanner ────────────────────────────────────────────── */
function ScannerModal({
  onClose, onScan, offline,
}: {
  onClose: () => void;
  onScan: () => { assetId: string; item: string; station: string; queued: boolean };
  offline: boolean;
}) {
  const [phase, setPhase] = useState<"frame" | "scanning" | "done">("frame");
  const [result, setResult] = useState<{ assetId: string; item: string; station: string; queued: boolean } | null>(null);

  const simulate = () => {
    setPhase("scanning");
    setTimeout(() => {
      const r = onScan();
      setResult(r);
      setPhase("done");
      if (r.queued) {
        toast.warning("Asset queued locally.", { description: `${r.assetId} — will sync when the link is restored.` });
      } else {
        toast.success("Asset successfully added to local inventory.", { description: `${r.assetId} — ${r.item} at ${r.station}.` });
      }
    }, 1100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2b2118]/55 p-4" onClick={onClose}>
      <div className="plate w-full max-w-md p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold tracking-wide">Scan Asset</h3>
          <button type="button" onClick={onClose} className="rounded-sm border border-border p-1.5 hover:bg-accent" aria-label="Close scanner">
            <X className="size-4" />
          </button>
        </div>

        <div className="relative aspect-[4/3] overflow-hidden rounded-md border border-border bg-[#2e251a]">
          {/* simulated viewfinder */}
          <div className="absolute inset-4 rounded-sm border-2 border-dashed border-[#c9a96a]/50" />
          <div className="absolute inset-x-4 top-1/2 -translate-y-1/2">
            <div className="mx-auto grid size-20 place-items-center rounded-sm bg-[#1d1710] text-[#c9a96a]">
              <ScanLine className="size-9" />
            </div>
          </div>
          {phase === "scanning" && (
            <div className="animate-scanline absolute inset-x-6 h-0.5 bg-[#c9a96a] shadow-[0_0_12px_2px_rgba(201,169,106,0.7)]" />
          )}
          <p className="absolute bottom-2 left-0 right-0 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-[#c9a96a]/80">
            Simulated optical scanner
          </p>
          {phase === "done" && result && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1d1710]/92 p-4 text-center">
              <p className="font-mono text-lg font-bold text-[#c9a96a]">{result.assetId}</p>
              <p className="mt-1 text-sm font-semibold text-[#efe6d2]">{result.item}</p>
              <p className="text-xs text-[#efe6d2]/70">{result.station} Station</p>
              <span className="stamp mt-3 border-[#567d46] text-[10px] text-[#8fae7e]">
                {result.queued ? "Queued locally" : "Scanned"}
              </span>
            </div>
          )}
        </div>

        {offline && phase !== "done" && (
          <p className="mt-3 rounded-sm border border-[#a9752c]/40 bg-[#a9752c]/10 p-2.5 text-xs text-[#7c5117]">
            Satellite link offline — this scan will be marked <strong>QUEUED LOCALLY</strong> in the edge store.
          </p>
        )}

        <div className="mt-4 flex gap-2">
          {phase !== "done" ? (
            <button
              type="button"
              onClick={simulate}
              disabled={phase === "scanning"}
              className="flex-1 rounded-md bg-primary px-4 py-3 text-sm font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              {phase === "scanning" ? "Scanning…" : "Simulate Scan"}
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-md bg-primary px-4 py-3 text-sm font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary/90"
            >
              Close
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border px-4 py-3 text-sm font-bold uppercase tracking-wider text-muted-foreground hover:bg-accent"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

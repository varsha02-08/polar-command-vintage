import { useState } from "react";
import { Leaf, ShieldCheck } from "lucide-react";
import { usePolar } from "../store";
import { OperationalProgress, SectionHeader, SimBadge, StatusBadge, statusTone } from "../ui-bits";

export default function CompliancePage() {
  const { waste, checklist, toggleChecklist, compliancePct } = usePolar();
  const [wasteFilter, setWasteFilter] = useState<string>("ALL");

  const filtered = wasteFilter === "ALL" ? waste : waste.filter((w) => w.category === wasteFilter);
  const categories = Array.from(new Set(waste.map((w) => w.category)));
  const returned = waste.filter((w) => w.status === "RETURNED").length;
  const overdue = waste.filter((w) => w.status === "OVERDUE").length;
  const compliant = waste.length - overdue;
  const complianceRate = Math.round((compliant / waste.length) * 100);

  const doneCount = checklist.filter((c) => c.checked).length;
  const remaining = checklist.length - doneCount;
  const criticalLeft = checklist.filter((c) => c.critical && !c.checked).length;

  return (
    <div>
      <SectionHeader
        title="Treaty & Compliance Center"
        subtitle="ATS Annex III waste retrograde and operational safety readiness — the environmental ledger for Maitri and Bharati."
        right={<SimBadge />}
      />

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        {/* waste tracker */}
        <div className="space-y-4">
          <div className="plate p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-lg font-bold">ATS Annex III Waste Tracker</h2>
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#3f5e33]">
                <Leaf className="size-3.5" /> Environmental protocol
              </span>
            </div>

            {/* compliance indicator */}
            <div className="mt-3 rounded-md border border-border bg-background/60 p-3.5">
              <div className="flex items-baseline justify-between">
                <p className="overline-label text-muted-foreground">Compliance rate (non-overdue records)</p>
                <p className="font-display text-2xl font-bold tabular-nums">{complianceRate}%</p>
              </div>
              <OperationalProgress pct={complianceRate} tone={complianceRate >= 80 ? "success" : "warning"} className="mt-2" />
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                <span>{returned} returned</span>
                <span>{waste.length - returned - overdue} staged / scheduled</span>
                <span className="text-[#9e3b2c]">{overdue} overdue</span>
              </div>
            </div>

            {/* category filter */}
            <select
              value={wasteFilter}
              onChange={(e) => setWasteFilter(e.target.value)}
              className="mt-3 h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="ALL">All categories</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>

            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    <th className="py-2 pr-3 font-bold">Waste ID</th>
                    <th className="py-2 pr-3 font-bold">Category</th>
                    <th className="py-2 pr-3 text-right font-bold">Quantity</th>
                    <th className="py-2 pr-3 font-bold">Station</th>
                    <th className="py-2 pr-3 font-bold">Target return</th>
                    <th className="py-2 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((w) => (
                    <tr key={w.id} className="ledger-row border-b border-border/40 last:border-0">
                      <td className="py-2 pr-3 font-mono text-xs font-semibold">{w.id}</td>
                      <td className="py-2 pr-3">{w.category}</td>
                      <td className="py-2 pr-3 text-right tabular-nums">{w.quantity} {w.unit}</td>
                      <td className="py-2 pr-3 text-xs">{w.station}</td>
                      <td className="py-2 pr-3 font-mono text-xs">{w.targetReturnDate}</td>
                      <td className="py-2"><StatusBadge tone={statusTone(w.status)} pulse={w.status === "OVERDUE"}>{w.status}</StatusBadge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* checklist */}
        <div className="plate h-fit p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">Operational Safety Checklist</h2>
            <ShieldCheck className="size-5 text-[#a6885a]" />
          </div>

          {/* readiness */}
          <div className="mt-3 rounded-md border border-border bg-background/60 p-3.5">
            <div className="flex items-baseline justify-between">
              <p className="overline-label text-muted-foreground">Compliance readiness</p>
              <p className="font-display text-3xl font-bold tabular-nums">{compliancePct}%</p>
            </div>
            <OperationalProgress pct={compliancePct} tone={compliancePct >= 80 ? "success" : compliancePct >= 50 ? "warning" : "danger"} className="mt-2" />
            <div className="mt-2 grid grid-cols-3 gap-2 text-center text-[11px]">
              <span className="rounded-sm bg-[#567d46]/10 py-1 font-bold text-[#3f5e33]">{doneCount} completed</span>
              <span className="rounded-sm bg-[#a9752c]/10 py-1 font-bold text-[#7c5117]">{remaining} remaining</span>
              <span className="rounded-sm bg-[#9e3b2c]/10 py-1 font-bold text-[#9e3b2c]">{criticalLeft} critical left</span>
            </div>
          </div>

          <ul className="mt-4 space-y-1.5">
            {checklist.map((c) => (
              <li key={c.id}>
                <label className="flex cursor-pointer items-start gap-3 rounded-md border border-border/60 bg-background/60 p-3 transition-colors hover:bg-accent/40">
                  <input
                    type="checkbox"
                    checked={c.checked}
                    onChange={() => toggleChecklist(c.id)}
                    className="mt-0.5 size-4.5 accent-[#4a3520]"
                  />
                  <span className="flex-1 text-sm leading-snug">
                    {c.label}
                    {c.critical && (
                      <span className="ml-2 rounded-sm bg-[#9e3b2c]/12 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#9e3b2c]">
                        Critical
                      </span>
                    )}
                  </span>
                  {c.checked && <span className="text-[10px] font-bold uppercase tracking-wider text-[#3f5e33]">Verified</span>}
                </label>
              </li>
            ))}
          </ul>

          <p className="mt-3 text-[11px] italic text-muted-foreground">
            Readiness recalculates from live checkbox state — no fixed score.
          </p>
        </div>
      </div>
    </div>
  );
}

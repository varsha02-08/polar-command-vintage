import { useState } from "react";
import { CheckCircle2, CloudOff, Loader2, RefreshCw, Satellite } from "lucide-react";
import { usePolar } from "../store";
import { SectionHeader, SimBadge, StatusBadge, statusTone } from "../ui-bits";
import { cn } from "@/lib/utils";

const RESTORE_STEPS = [
  "Restoring simulated satellite link…",
  "Compressing pending transactions…",
  "Preparing low-bandwidth payload…",
  "Transmitting…",
];

export default function SyncPage() {
  const {
    connection, pending, pendingCount, syncHistory, simulateBlackout,
    restoreLink, addLocalTransaction,
  } = usePolar();
  const [phase, setPhase] = useState<number>(-1); // -1 idle, 0..3 running, 4 done
  const [detail, setDetail] = useState<string | null>(null);

  const online = connection === "ONLINE";
  const txCount = pendingCount;

  const handleRestore = async () => {
    setPhase(0);
    for (let i = 0; i < RESTORE_STEPS.length; i++) {
      setPhase(i);
      await new Promise((r) => setTimeout(r, 750));
    }
    await restoreLink();
    setPhase(4);
    setTimeout(() => setPhase(-1), 2600);
  };

  return (
    <div>
      <SectionHeader
        title="Offline-First Satellite Sync Engine"
        subtitle="Prototype simulation of low-bandwidth communication and local edge operation. No real satellite, modem or database is involved."
        right={<SimBadge />}
      />

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        {/* left: connection + workflow */}
        <div className="space-y-4">
          {/* connection state */}
          <div className={cn("plate p-5", !online && "ring-2 ring-[#9e3b2c]/50")}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <span className={cn(
                  "flex size-12 items-center justify-center rounded-full",
                  online ? "bg-[#567d46]/15 text-[#3f5e33]" : "bg-[#9e3b2c]/15 text-[#9e3b2c]",
                )}>
                  {online ? <Satellite className="size-6" /> : <CloudOff className="size-6" />}
                </span>
                <div>
                  <p className={cn("font-display text-xl font-bold", online ? "text-[#3f5e33]" : "text-[#9e3b2c]")}>
                    {online ? "IRIDIUM LINK SIMULATED" : "SATELLITE LINK OFFLINE"}
                  </p>
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    {online ? "SBD / Low-bandwidth mode · Connected" : "Local edge mode active"}
                  </p>
                </div>
              </div>
              <StatusBadge tone={online ? "success" : "danger"} pulse={!online}>{online ? "Connected" : "Offline"}</StatusBadge>
            </div>

            {online ? (
              <div className="mt-4 flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={simulateBlackout}
                  className="rounded-md bg-[#9e3b2c] px-4 py-3 text-sm font-bold uppercase tracking-wider text-[#f6efe1] hover:bg-[#b04a3a]"
                >
                  Simulate 72-Hour Satellite Blackout
                </button>
                <p className="text-xs text-muted-foreground">
                  Queue any local action while offline — the edge store (browser localStorage) keeps everything.
                </p>
              </div>
            ) : (
              <div className="mt-4">
                <div className="rounded-md border border-[#9e3b2c]/45 bg-[#9e3b2c]/10 p-3.5">
                  <p className="text-sm font-bold text-[#9e3b2c]">
                    Satellite link lost. Switching to local edge storage. All actions are queued locally.
                  </p>
                  <p className="mt-1 text-xs text-[#7c5117]">
                    Simulated local queue (browser localStorage) — no SQLite database is claimed. Pending writes survive a page reload.
                  </p>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={addLocalTransaction}
                    className="rounded-md bg-primary px-4 py-3 text-sm font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary/90"
                  >
                    + Simulate Local Transaction
                  </button>
                  <button
                    type="button"
                    onClick={handleRestore}
                    disabled={txCount === 0 || phase >= 0 && phase < 4}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-md px-4 py-3 text-sm font-bold uppercase tracking-wider transition-colors",
                      txCount > 0 && !(phase >= 0 && phase < 4)
                        ? "bg-[#3f5e33] text-[#f6efe1] hover:bg-[#4c7340]"
                        : "cursor-not-allowed bg-secondary text-muted-foreground/70",
                    )}
                  >
                    <RefreshCw className={cn("size-4", phase >= 0 && phase < 4 && "animate-spin")} />
                    Restore Satellite Link & Sync
                  </button>
                </div>
              </div>
            )}

            {/* restore progress */}
            {phase >= 0 && (
              <ol className="mt-4 space-y-2 rounded-md border border-border bg-background/60 p-4">
                {RESTORE_STEPS.map((s, i) => (
                  <li key={s} className="flex items-center gap-2.5 text-sm">
                    {i < phase || phase === 4 ? (
                      <CheckCircle2 className="size-4 shrink-0 text-[#567d46]" />
                    ) : i === phase ? (
                      <Loader2 className="size-4 shrink-0 animate-spin text-[#a6885a]" />
                    ) : (
                      <span className="size-4 shrink-0 rounded-full border border-border" />
                    )}
                    <span className={cn(i <= phase ? "text-foreground" : "text-muted-foreground")}>{s}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>

          {/* pending queue */}
          <div className="plate p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-lg font-bold">Pending Transactions</h2>
              <StatusBadge tone={txCount === 0 ? "success" : "warning"}>{txCount} Pending</StatusBadge>
            </div>
            {txCount === 0 ? (
              <p className="mt-3 rounded-md border border-dashed border-border bg-background/50 p-4 text-center text-sm text-muted-foreground">
                Edge queue empty — every local change has been synchronized.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-border/60">
                {pending.map((t) => (
                  <li key={t.num} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="flex items-center gap-3">
                      <span className="flex size-8 items-center justify-center rounded-sm bg-secondary font-mono text-[11px] font-bold">
                        {String(t.num).padStart(3, "0")}
                      </span>
                      <div>
                        <p className="text-sm font-semibold">{t.type}</p>
                        <p className="text-[11px] text-muted-foreground">{t.station} Station · {t.createdAt}</p>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#7c5117]">Queued locally</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* payload simulation */}
          <div className="plate-dark p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="overline-label text-[#c9a96a]">Simulated compact payload</p>
              <span className="font-mono text-[10px] text-[#efe6d2]/60">
                {txCount > 0 ? `${txCount} records · ${Math.max(16, txCount * 11 + 5)} bytes (illustrative)` : "no payload staged"}
              </span>
            </div>
            <p className="mt-2 break-all font-mono text-xs leading-relaxed text-[#c9a96a]">
              {txCount > 0
                ? `0x41 0x22 0x7F 0x01 0xA3 0xB0 0x0C 0x88 0x12 0xFE 0x03 … (${txCount} record${txCount === 1 ? "" : "s"})`
                : "0x…  — queue a transaction to stage a payload"}
            </p>
            <p className="mt-2 text-[11px] italic text-[#efe6d2]/60">
              Illustrative byte sizes only — real SBD payloads vary with transaction type.
            </p>
          </div>
        </div>

        {/* right: history */}
        <div className="plate flex flex-col p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">Sync History</h2>
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{syncHistory.length} transmissions</span>
          </div>

          <div className="mt-3 flex-1 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-card">
                <tr className="border-b border-border text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  <th className="py-2 pr-2 font-bold">Timestamp</th>
                  <th className="py-2 pr-2 font-bold">Dir</th>
                  <th className="py-2 pr-2 font-bold">Records</th>
                  <th className="py-2 pr-2 font-bold">Bytes</th>
                  <th className="py-2 pr-2 font-bold">Status</th>
                  <th className="py-2 font-bold">Preview</th>
                </tr>
              </thead>
              <tbody>
                {syncHistory.map((h) => (
                  <tr
                    key={h.id}
                    onClick={() => setDetail(h.id)}
                    className="ledger-row cursor-pointer border-b border-border/40 last:border-0"
                  >
                    <td className="py-2 pr-2 font-mono text-[10px] whitespace-nowrap">{h.ts}</td>
                    <td className="py-2 pr-2 font-bold">{h.direction}</td>
                    <td className="py-2 pr-2 tabular-nums">{h.records}</td>
                    <td className="py-2 pr-2 tabular-nums">{h.bytes} B</td>
                    <td className="py-2 pr-2"><StatusBadge tone={statusTone(h.status)}>{h.status}</StatusBadge></td>
                    <td className="py-2 truncate font-mono text-[10px] text-muted-foreground">{h.preview}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[10px] italic text-muted-foreground">Click a row for payload details.</p>

          {detail && (() => {
            const h = syncHistory.find((x) => x.id === detail)!;
            return (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2b2118]/55 p-4" onClick={() => setDetail(null)}>
                <div className="plate w-full max-w-md p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-lg font-bold">Transmission detail</h3>
                    <button type="button" onClick={() => setDetail(null)} className="rounded-sm border border-border p-1.5 hover:bg-accent" aria-label="Close">✕</button>
                  </div>
                  <dl className="mt-3 space-y-1.5 text-sm">
                    <Row k="Timestamp" v={h.ts} />
                    <Row k="Direction" v={h.direction} />
                    <Row k="Records" v={String(h.records)} />
                    <Row k="Payload size" v={`${h.bytes} bytes (illustrative)`} />
                    <Row k="Status" v={h.status} />
                  </dl>
                  <p className="mt-3 rounded-sm border border-border bg-background/60 p-2.5 font-mono text-xs break-all">{h.preview}</p>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-border/40 pb-1">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="font-semibold tabular-nums">{v}</dd>
    </div>
  );
}

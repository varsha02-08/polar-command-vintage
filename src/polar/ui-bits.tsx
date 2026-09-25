import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/* Status → archival pigment classes. Never color-only: badges always carry text. */
export type BadgeTone = "success" | "warning" | "danger" | "info" | "neutral" | "gold";

const TONES: Record<BadgeTone, string> = {
  success: "bg-[#567d46]/12 text-[#3f5e33] border-[#567d46]/35",
  warning: "bg-[#a9752c]/12 text-[#7c5117] border-[#a9752c]/40",
  danger: "bg-[#9e3b2c]/12 text-[#9e3b2c] border-[#9e3b2c]/45",
  info: "bg-[#3c5a74]/12 text-[#2f4a63] border-[#3c5a74]/35",
  neutral: "bg-[#6e5f4b]/10 text-[#6e5f4b] border-[#6e5f4b]/30",
  gold: "bg-[#a6885a]/14 text-[#6f5729] border-[#a6885a]/45",
};

export function StatusBadge({
  tone,
  children,
  className,
  pulse,
}: {
  tone: BadgeTone;
  children: ReactNode;
  className?: string;
  pulse?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em]",
        TONES[tone],
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full bg-current", pulse && "animate-softpulse")} />
      {children}
    </span>
  );
}

/* Map a domain status string to a badge tone */
export function statusTone(s: string): BadgeTone {
  const t = s.toUpperCase();
  if (["NORMAL", "ACTIVE", "DELIVERED", "RETURNED", "OPERATIONAL", "SYNCED", "ONLINE", "STATION"].includes(t)) return "success";
  if (["LOW STOCK", "IN TRANSIT", "RETURNING", "READY FOR RETURN", "QUEUED", "QUEUED LOCALLY", "STORED", "COLD-CHAIN RISK", "MODERATE", "FIELD"].includes(t)) return "warning";
  if (["CRITICAL", "OVERDUE", "DISTRESS", "FAILED", "OFFLINE"].includes(t)) return "danger";
  if (["PLANNED", "RECEIVED", "LOADED", "SCHEDULED", "ACK", "UNREAD", "TRANSIT", "STANDBY", "MAINTENANCE", "TRANSMITTING", "HIGH"].includes(t)) return "info";
  if (["SCANNED", "COMPLETED"].includes(t)) return "gold";
  return "neutral";
}

export function SimBadge({
  className,
  label = "DEMO MODE • SIMULATED DATA",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border border-dashed border-[#a6885a]/60 bg-[#a6885a]/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-[#6f5729]",
        className,
      )}
    >
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3a9 9 0 0 1 0 18" fill="currentColor" stroke="none" opacity="0.25" />
      </svg>
      {label}
    </span>
  );
}

export function SectionHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <div className="mb-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="overline-label mb-1 text-[#a6885a]">Polarlog · Field Ledger</div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">{title}</h1>
          {subtitle && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {right && <div className="flex flex-wrap items-center gap-2">{right}</div>}
      </div>
      <div className="hairline mt-4 w-full" />
    </div>
  );
}

export function MetricCard({
  label,
  value,
  tone = "neutral",
  hint,
  onClick,
}: {
  label: string;
  value: ReactNode;
  tone?: BadgeTone;
  hint?: string;
  onClick?: () => void;
}) {
  const dot: Record<BadgeTone, string> = {
    success: "#567d46",
    warning: "#a9752c",
    danger: "#9e3b2c",
    info: "#3c5a74",
    gold: "#a6885a",
    neutral: "#6e5f4b",
  };
  const interactive = Boolean(onClick);
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!interactive}
      className={cn(
        "plate flex flex-col items-start gap-1 p-4 text-left transition-shadow",
        interactive && "hover:-translate-y-0.5 hover:shadow-md",
      )}
    >
      <span className="overline-label flex items-center gap-2 text-muted-foreground">
        <span className="size-1.5 rounded-full" style={{ background: dot[tone] }} />
        {label}
      </span>
      <span className="font-display text-3xl font-bold tabular-nums leading-none text-foreground">
        {value}
      </span>
      {hint && <span className="mt-0.5 text-[11px] text-muted-foreground">{hint}</span>}
    </button>
  );
}

export function OperationalProgress({
  pct,
  tone = "gold",
  className,
}: {
  pct: number;
  tone?: "success" | "warning" | "danger" | "gold";
  className?: string;
}) {
  const colors: Record<string, string> = {
    success: "#567d46",
    warning: "#a9752c",
    danger: "#9e3b2c",
    gold: "#a6885a",
  };
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-[#e2d7bf]", className)}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.min(100, Math.max(0, pct))}%`, background: colors[tone] }}
      />
    </div>
  );
}

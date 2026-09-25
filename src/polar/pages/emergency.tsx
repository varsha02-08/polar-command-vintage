import { useState } from "react";
import { Battery, Radio, Siren, Users } from "lucide-react";
import { hexPayload, usePolar } from "../store";
import { SectionHeader, SimBadge } from "../ui-bits";
import { cn } from "@/lib/utils";

export default function EmergencyPage() {
  const {
    emergency, teams, triggerDistress, acknowledgeDistress, openIncident,
    resolveEmergency, go,
  } = usePolar();
  const [payload, setPayload] = useState<string>(
    "0x41 0x22 0x7F 0x01 0xA3 0xB0 0x0C 0x88 0x12 0xFE 0x03 …",
  );
  const [payloadKey, setPayloadKey] = useState(0);

  const activate = (teamId: string) => {
    triggerDistress(teamId);
    setPayload(hexPayload(11) + " …");
    setPayloadKey((k) => k + 1);
  };

  if (!emergency) {
    return (
      <div>
        <SectionHeader
          title="Emergency / Distress Center"
          subtitle="Beacon monitoring, response protocol and compact low-bandwidth telemetry. All events are simulated."
          right={<SimBadge />}
        />

        <div className="plate-dark p-6">
          <p className="overline-label text-[#c9a96a]">Protocol standby</p>
          <h2 className="mt-1 font-display text-2xl font-bold text-[#f1e8d6]">No active emergencies</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#efe6d2]/80">
            When a distress beacon activates, a priority banner takes over this page, compact telemetry streams into the
            edge buffer, and every action is recorded in the incident log. Run the simulated drill below — no real
            personnel, vehicles or satellites are involved.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            {teams.map((t) => (
              <span key={t.id} className="inline-flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => activate(t.id)}
                  className="rounded-md bg-[#9e3b2c] px-5 py-3 text-sm font-bold uppercase tracking-wider text-[#f6efe1] transition-colors hover:bg-[#b04a3a]"
                >
                  Simulate Distress — {t.name.replace("TRAVERSE TEAM ", "")}
                </button>
                <span className="font-mono text-[11px] text-[#efe6d2]/60 self-center">
                  {t.vehicle} · {t.personnelCount} personnel
                </span>
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <InfoPlate icon={Radio} title="Beacon watch" text="Distress beacons on all field units polled every simulated 30 s via SBD." />
          <InfoPlate icon={Battery} title="Battery guard" text="Beacon units alert below 30% reserve; 62% shown in drill." />
          <InfoPlate icon={Users} title="Personnel link" text="Every beacon is bound to a roster so responders know exactly who is in the field." />
        </div>
      </div>
    );
  }

  /* ── ACTIVE EMERGENCY VIEW ─────────────────────────────────────────── */
  return (
    <div>
      <SectionHeader
        title="Emergency / Distress Center"
        subtitle="A distress beacon is active. All simulated data."
        right={<SimBadge />}
      />

      {/* priority banner */}
      <div className="overflow-hidden rounded-lg border-2 border-[#9e3b2c] bg-[#9e3b2c] text-white shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div className="flex items-center gap-3">
            <Siren className="size-7 animate-softpulse" />
            <div>
              <p className="text-lg font-black tracking-[0.12em]">🚨 PRIORITY EMERGENCY</p>
              <p className="text-sm font-semibold opacity-90">{emergency.teamName} · {emergency.vehicle}</p>
            </div>
          </div>
          <span className="stamp border-white/80 text-xs text-white">Distress beacon active · Critical</span>
        </div>
        <div className="border-t border-white/25 bg-[#8a3326] px-5 py-3">
          <p className="text-xs font-bold uppercase tracking-[0.18em] opacity-90">
            Status: CRITICAL {emergency.acknowledged && "· ACKNOWLEDGED"}{emergency.incidentId && ` · ${emergency.incidentId} OPEN`}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          {/* telemetry */}
          <div className="plate p-5">
            <h2 className="overline-label mb-3 text-[#a6885a]">Beacon telemetry</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Field label="Simulated coordinates" value={emergency.coords} />
              <Field label="Decimal" value={`${emergency.lat}, ${emergency.lon}`} />
              <Field label="Last telemetry" value={emergency.lastTelemetry} />
              <Field label="Personnel" value={String(emergency.personnel)} />
              <Field label="Vehicle" value={emergency.vehicle} />
              <Field label="Battery" value={`${emergency.battery}%`} warn={emergency.battery < 30} />
              <Field label="Beacon" value={emergency.beacon} tone="danger" />
              <Field label="Activated" value={emergency.activatedAt} />
              <Field label="Incident" value={emergency.incidentId ?? "Not opened"} />
            </div>

            <div className="mt-4 rounded-md border border-border bg-background/60 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="overline-label text-muted-foreground">Simulated compressed telemetry</p>
                <span className="font-mono text-[10px] text-muted-foreground">SBD burst #{payloadKey}</span>
              </div>
              <p
                key={payloadKey}
                className="mt-2 break-all font-mono text-xs leading-relaxed text-[#3e3222]"
              >
                {payload}
              </p>
              <p className="mt-2 text-[11px] italic text-muted-foreground">
                Prototype representation of a compact emergency telemetry payload.
              </p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={acknowledgeDistress}
                disabled={emergency.acknowledged}
                className={cn(
                  "rounded-md px-4 py-3 text-sm font-bold uppercase tracking-wider transition-colors",
                  emergency.acknowledged
                    ? "cursor-not-allowed border border-[#567d46]/40 bg-[#567d46]/12 text-[#3f5e33]"
                    : "bg-[#3f5e33] text-[#f6efe1] hover:bg-[#4c7340]",
                )}
              >
                {emergency.acknowledged ? "✓ Acknowledged" : "Acknowledge Alert"}
              </button>
              <button
                type="button"
                onClick={openIncident}
                disabled={!emergency.acknowledged || emergency.incidentId !== null}
                className={cn(
                  "rounded-md border px-4 py-3 text-sm font-bold uppercase tracking-wider transition-colors",
                  !emergency.acknowledged || emergency.incidentId
                    ? "cursor-not-allowed border-border text-muted-foreground/60"
                    : "border-[#3c5a74]/50 bg-[#3c5a74]/10 text-[#2f4a63] hover:bg-[#3c5a74]/20",
                )}
              >
                {emergency.incidentId ? `${emergency.incidentId} opened` : "Open Incident"}
              </button>
              <button
                type="button"
                onClick={() => go("personnel")}
                className="rounded-md border border-border px-4 py-3 text-sm font-bold uppercase tracking-wider text-foreground hover:bg-accent"
              >
                View Team
              </button>
              {emergency.acknowledged && emergency.incidentId && (
                <button
                  type="button"
                  onClick={resolveEmergency}
                  className="rounded-md bg-[#9e3b2c] px-4 py-3 text-sm font-bold uppercase tracking-wider text-[#f6efe1] hover:bg-[#b04a3a]"
                >
                  Resolve Emergency
                  </button>
              )}
            </div>
          </div>
        </div>

        {/* response checklist */}
        <div className="space-y-4">
          <div className="plate p-5">
            <h2 className="overline-label mb-3 text-[#a6885a]">Response protocol</h2>
            <ol className="space-y-2.5">
              {[
                { label: "Beacon signal received", done: true },
                { label: "Alert acknowledged by duty officer", done: emergency.acknowledged },
                { label: "Incident opened & response team tasked", done: emergency.incidentId !== null },
                { label: "Nearest asset rerouted to team position", done: emergency.incidentId !== null },
                { label: "Team recovered / emergency resolved", done: false },
              ].map((s) => (
                <li key={s.label} className="flex items-start gap-2.5">
                  <span className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-black",
                    s.done ? "border-[#567d46] bg-[#567d46] text-white" : "border-border text-transparent",
                  )}>
                    ✓
                  </span>
                  <span className={cn("text-sm leading-snug", s.done ? "text-foreground" : "text-muted-foreground")}>
                    {s.label}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className="plate-dark p-4">
            <p className="overline-label text-[#c9a96a]">Comms constraint</p>
            <p className="mt-1 text-xs leading-relaxed text-[#efe6d2]/80">
              During a blackout, this page and the emergency banner remain fully interactive offline. The beacon alert and
              acknowledgement are stored in the local edge queue and flush automatically on restore.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, warn, tone }: { label: string; value: string; warn?: boolean; tone?: "danger" }) {
  return (
    <div className="rounded-sm border border-border/70 bg-background/60 p-2.5">
      <p className="overline-label text-muted-foreground">{label}</p>
      <p className={cn(
        "mt-0.5 text-sm font-bold tabular-nums",
        warn && "text-[#7c5117]",
        tone === "danger" && "text-[#9e3b2c]",
      )}>
        {value}
      </p>
    </div>
  );
}

function InfoPlate({ icon: Icon, title, text }: { icon: typeof Radio; title: string; text: string }) {
  return (
    <div className="plate p-4">
      <span className="flex size-9 items-center justify-center rounded-sm bg-secondary text-foreground">
        <Icon className="size-4.5" />
      </span>
      <h3 className="mt-2 font-display text-base font-bold">{title}</h3>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{text}</p>
    </div>
  );
}

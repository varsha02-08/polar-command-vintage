import { motion } from "framer-motion";
import {
  ArrowRight, Boxes, Compass, FileCheck2, PackageSearch, RadioTower,
  ShieldCheck, Siren, Users,
} from "lucide-react";
import { useNavigate } from "react-router";
import logo from "@/assets/logo.svg";

const FLOW = [
  { icon: RadioTower, title: "Operate", text: "One command center for expeditions, cargo, cold chain and traverses across Maitri and Bharati." },
  { icon: CloudOffIcon, title: "Connectivity lost", text: "A simulated 72-hour satellite blackout flips the platform into local edge mode instantly." },
  { icon: HardDriveIcon, title: "Continue locally", text: "Transactions queue in the edge store — nothing is lost while the link is down." },
  { icon: Siren, title: "Emergency handling", text: "Distress beacons raise a priority banner with compact telemetry and a response protocol." },
  { icon: RefreshIcon, title: "Restored & synchronized", text: "On reconnection, queued records compress into a low-bandwidth payload and flush." },
  { icon: FileCheck2, title: "Verify compliance", text: "ATS Annex III waste ledger and a live safety checklist close the loop." },
];

function CloudOffIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className} aria-hidden>
      <path d="M2 2l20 20" /><path d="M5.782 5.782A7 7 0 0 0 9 19h8.5a4.5 4.5 0 0 0 1.307-.193" />
      <path d="M21.532 16.5A4.5 4.5 0 0 0 17.5 10h-1.79A7.008 7.008 0 0 0 10 5.07" />
    </svg>
  );
}
function HardDriveIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className} aria-hidden>
      <line x1="22" y1="12" x2="2" y2="12" /><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
      <line x1="6" y1="16" x2="6.01" y2="16" /><line x1="10" y1="16" x2="10.01" y2="16" />
    </svg>
  );
}
function RefreshIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className} aria-hidden>
      <path d="M3 12a9 9 0 0 1 15.36-6.36L21 8" /><path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15.36 6.36L3 16" /><path d="M3 21v-5h5" />
    </svg>
  );
}

export default function Landing() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen"
    >
      {/* top ribbon */}
      <header className="border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="POLARLOG logo" className="size-8 rounded-sm" />
            <div>
              <p className="font-display text-lg font-bold leading-none tracking-wide">POLARLOG</p>
              <p className="text-[9px] uppercase tracking-[0.24em] text-muted-foreground">Integrated Polar Operations</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="stamp hidden border-[#a6885a] text-[9px] text-[#6f5729] sm:inline-block">
              Demo Mode · Simulated Data
            </span>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="rounded-md bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90"
            >
              Enter Command Center
            </button>
          </div>
        </div>
      </header>

      {/* hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8'/%3E%3C/filter%3E%3Crect width='240' height='240' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 lg:grid-cols-[1.2fr_1fr] lg:py-20">
          <div>
            <p className="overline-label text-[#a6885a]">
              Problem 26062 · Ministry of Earth Sciences · NCPOR
            </p>
            <h1 className="mt-3 font-display text-4xl font-black leading-tight tracking-tight sm:text-5xl">
              One platform for polar operations —{" "}
              <span className="italic text-[#7c5117]">even when connectivity fails.</span>
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
              POLARLOG is an interactive prototype of an integrated logistics and expedition
              management system for Antarctic research stations — expedition planning, cargo and
              cold chain, traverses, emergencies, treaty compliance and an offline-first satellite
              sync engine, in one mission-control console.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3.5 text-sm font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary/90"
              >
                Launch the Command Center <ArrowRight className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => navigate("/auth")}
                className="rounded-md border border-border bg-card px-6 py-3.5 text-sm font-bold uppercase tracking-wider hover:bg-accent"
              >
                Create an account
              </button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Frontend prototype · simulated operational data · not connected to Iridium, GPS, NCPOR or MoES systems.
            </p>
          </div>

          {/* archival chart card */}
          <div className="plate-dark relative p-6">
            <p className="overline-label text-[#c9a96a]">Chart № 26062-A</p>
            <p className="mt-1 font-display text-xl font-bold text-[#f1e8d6]">Lützow-Holm Bay · Prydz Bay</p>
            <svg viewBox="0 0 100 56" className="mt-3 w-full">
              <rect width="100" height="56" fill="#241c13" />
              <g stroke="#4a3b28" strokeWidth="0.15">
                {Array.from({ length: 19 }, (_, i) => (
                  <line key={i} x1={(i + 1) * 5} y1="0" x2={(i + 1) * 5} y2="56" />
                ))}
              </g>
              <path
                d="M8,32 L16,28 L24,30 L33,27 L42,29 L51,26 L60,28 L69,25 L78,27 L88,25 L95,29 L94,36 L86,42 L76,48 L64,52 L52,53 L40,51 L30,47 L21,41 L13,37 Z"
                fill="#2e251a" stroke="#c9a96a" strokeWidth="0.4"
              />
              <g>
                <circle cx="24" cy="36" r="1.6" fill="#c9a96a" />
                <circle cx="76" cy="38" r="1.6" fill="#8fae7e" />
                <circle cx="58" cy="30" r="1.3" fill="#d98f6a" />
                <polyline points="24,36 50,39 76,38" fill="none" stroke="#c9a96a" strokeWidth="0.35" strokeDasharray="1.4 1.4" />
              </g>
            </svg>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              {[["Stations", "02"], ["Field teams", "02"], ["Records", "240+"]].map(([k, v]) => (
                <div key={k} className="rounded-sm border border-[#4a3b28] bg-[#241c13] px-2 py-2">
                  <p className="font-display text-lg font-bold text-[#c9a96a]">{v}</p>
                  <p className="text-[9px] uppercase tracking-[0.16em] text-[#efe6d2]/60">{k}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* flow storyline */}
      <section className="border-b border-border py-14">
        <div className="mx-auto max-w-6xl px-4">
          <p className="overline-label text-[#a6885a]">The demonstration arc</p>
          <h2 className="mt-1 font-display text-3xl font-bold">Operate → Lose the link → Keep going → Sync → Verify</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FLOW.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                className="plate p-5"
              >
                <div className="flex items-center justify-between">
                  <span className="flex size-10 items-center justify-center rounded-sm bg-secondary">
                    <f.icon className="size-5" />
                  </span>
                  <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">
                    STEP {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-3 font-display text-lg font-bold">{f.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{f.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* capabilities */}
      <section className="border-b border-border py-14">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.3fr]">
            <div>
              <p className="overline-label text-[#a6885a]">Capabilities</p>
              <h2 className="mt-1 font-display text-3xl font-bold">A field ledger built for gloves, static and silence</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Large controls, high contrast and honest status labels — designed for low-light
                modules and interrupted links. Every number on screen is derived from one shared
                operational state, so counters, badges and alerts never disagree.
              </p>
              <div className="plate-dark mt-6 p-4">
                <p className="overline-label text-[#c9a96a]">Built for SIH 2026</p>
                <p className="mt-1 text-xs leading-relaxed text-[#efe6d2]/80">
                  Problem statement 26062 — Integrated Polar Expedition Logistics and Asset
                  Management System, Ministry of Earth Sciences. This build is a demo prototype
                  using simulated data only.
                </p>
              </div>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {[
                [Compass, "Expedition management", "Filed missions with linked personnel, cargo, routes and risk."],
                [Boxes, "Inventory & cold chain", "120 records with temperature gauges and reorder logic."],
                [PackageSearch, "Cargo manifest", "120 items across a four-stage receiving-to-delivered flow."],
                [Users, "Personnel & traverses", "46 simulated records with beacon-bound field teams."],
                [Siren, "Emergency center", "Distress drills, response protocol and compact telemetry."],
                [RadioTower, "Offline-first sync", "Edge queue survives reloads; history logs every burst."],
                [FileCheck2, "Treaty compliance", "ATS Annex III waste tracker with live readiness scoring."],
                [ShieldCheck, "Alert center", "Unified, categorised, actionable — acknowledge or dispatch."],
              ].map(([Icon, title, text]) => (
                <li key={title as string} className="plate p-4">
                  <Icon className="size-5 text-[#a6885a]" />
                  <h3 className="mt-2 text-sm font-bold">{title as string}</h3>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{text as string}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <span className="stamp border-[#a6885a] text-[10px] text-[#6f5729]">Expedition file · open for review</span>
          <h2 className="mt-4 font-display text-3xl font-black leading-tight">
            Step into the Polar Operations Command Center
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            The full two-minute demonstration arc — dashboard, cold-chain warning, distress drill,
            satellite blackout, local queue, restore and resync, compliance — is one click away.
          </p>
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-7 py-4 text-sm font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary/90"
          >
            Enter Command Center <ArrowRight className="size-4" />
          </button>
        </div>
      </section>

      <footer className="border-t border-border py-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 text-xs text-muted-foreground">
          <p>POLARLOG — Integrated Polar Operations · SIH Problem 26062 (MoES / NCPOR)</p>
          <p>Demo mode · simulated operational data · no live systems</p>
        </div>
      </footer>
    </motion.div>
  );
}

import {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import {
  buildActivity, buildCargo, buildChecklist, buildInitialAlerts, buildInventory,
  buildPersonnel, buildTeams, buildWaste,
} from "./seed";
import type {
  ActivityEntry, AlertItem, CargoItem, ChecklistItem, Connection, EmergencyState,
  InventoryItem, PendingTx, PersonnelRecord, Section, Station, SyncEntry, Team,
  WasteRecord,
} from "./types";

const LS_KEY = "polarlog.pending-v1";
const nowTime = () => new Date().toISOString().slice(11, 16) + " UTC";

function loadQueue(): PendingTx[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as PendingTx[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function saveQueue(q: PendingTx[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(q));
  } catch {
    /* storage unavailable — queue stays in memory */
  }
}

const TX_KINDS: Array<{ type: string; station: Station }> = [
  { type: "Inventory Update", station: "Maitri" },
  { type: "Personnel Telemetry", station: "Bharati" },
  { type: "Cargo Update", station: "Maitri" },
  { type: "Cold-Chain Reading", station: "Bharati" },
  { type: "Waste Manifest", station: "Maitri" },
  { type: "Telemetry Batch", station: "Bharati" },
];

const HEX_POOL = "0123456789ABCDEF";
export function hexPayload(bytes: number): string {
  const out: string[] = [];
  for (let i = 0; i < bytes; i++) {
    out.push("0x" + HEX_POOL[Math.floor(Math.random() * 16)] + HEX_POOL[Math.floor(Math.random() * 16)]);
  }
  return out.join(" ");
}

export interface PolarStore {
  section: Section;
  go: (s: Section) => void;
  connection: Connection;
  utc: string;
  inventory: InventoryItem[];
  cargo: CargoItem[];
  personnel: PersonnelRecord[];
  teams: Team[];
  waste: WasteRecord[];
  checklist: ChecklistItem[];
  alerts: AlertItem[];
  activity: ActivityEntry[];
  expeditions: ReturnType<typeof buildExpeditions>;
  expeditionsActive: number;
  expeditionsPlanned: number;
  personnelDeployed: number;
  assetsCount: number;
  inventoryAlerts: number;
  activeEmergencies: number;
  pending: PendingTx[];
  pendingCount: number;
  syncHistory: SyncEntry[];
  emergency: EmergencyState | null;
  teamsInDistress: boolean;
  unreadAlerts: number;
  scannedCount: number;
  setConnection: (c: Connection) => void;
  simulateBlackout: () => void;
  restoreLink: () => Promise<void>;
  addLocalTransaction: () => void;
  triggerDistress: (teamId: string) => void;
  acknowledgeDistress: () => void;
  openIncident: () => void;
  resolveEmergency: () => void;
  scanAsset: () => { assetId: string; item: string; station: Station; queued: boolean };
  markCargo: (id: string, status: CargoItem["status"]) => void;
  toggleChecklist: (id: string) => void;
  acknowledgeAlert: (id: string) => void;
  dismissAlert: (id: string) => void;
  acknowledgeAllAlerts: () => void;
  pushActivity: (text: string, kind: ActivityEntry["kind"]) => void;
  compliancePct: number;
}

/* expeditions seed re-exported via a small builder here to keep store self-contained */
function buildExpeditions() {
  return [
    {
      id: "EXP-2026-A", name: "Antarctica Research Expedition 2026", station: "Bharati" as Station,
      missionType: "Research", start: "2026-01-12", end: "2026-11-30",
      personnel: 24, cargoItems: 67, status: "ACTIVE" as const, risk: "MODERATE" as const,
      summary:
        "Multi-disciplinary summer campaign: glaciology traverses, atmospheric science and coastal biology, supported by resupply flights from Cape Town.",
      waypoints: ["Bharati Base", "Ice Shelf Camp A", "Field Depot II-12", "Transect 7", "Bharati Base"],
    },
    {
      id: "EXP-2026-B", name: "Antarctic Logistics Support Mission 2026", station: "Maitri" as Station,
      missionType: "Logistics", start: "2026-12-05", end: "2027-02-28",
      personnel: 22, cargoItems: 53, status: "PLANNED" as const, risk: "LOW" as const,
      summary:
        "Annual resupply and station maintenance window: fuel movement, waste retrograde, runway preparation and winterization of remote caches.",
      waypoints: ["Maitri Base", "Fuel Cache M-4", "Shelf Road", "Maitri Base"],
    },
  ];
}

const PolarContext = createContext<PolarStore | null>(null);

export function PolarProvider({ children }: { children: ReactNode }) {
  const [section, setSection] = useState<Section>("dashboard");
  const [connection, setConnectionRaw] = useState<Connection>("ONLINE");
  const [utc, setUtc] = useState(nowTime());
  const [inventory, setInventory] = useState<InventoryItem[]>(() => buildInventory());
  const [cargo, setCargo] = useState<CargoItem[]>(() => buildCargo());
  const [personnel] = useState<PersonnelRecord[]>(() => buildPersonnel());
  const [teams, setTeams] = useState<Team[]>(() => buildTeams());
  const [waste] = useState<WasteRecord[]>(() => buildWaste());
  const [checklist, setChecklist] = useState<ChecklistItem[]>(() => buildChecklist());
  const [alerts, setAlerts] = useState<AlertItem[]>(() => buildInitialAlerts());
  const [activity, setActivity] = useState<ActivityEntry[]>(() => buildActivity());
  const [expeditions] = useState(buildExpeditions);
  const [pending, setPending] = useState<PendingTx[]>(() => loadQueue());
  const [syncHistory, setSyncHistory] = useState<SyncEntry[]>([
    {
      id: "s0", ts: "2026-09-25 08:21 UTC", direction: "OUT", records: 2, bytes: 24,
      status: "SYNCED", preview: "0x41 0x22 0x7F 0x01 0xA3 0xB0 …",
    },
    {
      id: "s1", ts: "2026-09-25 06:04 UTC", direction: "IN", records: 1, bytes: 18,
      status: "SYNCED", preview: "0x11 0xC2 0x44 0x0D 0x9E 0x71 …",
    },
    {
      id: "s2", ts: "2026-09-24 23:47 UTC", direction: "OUT", records: 3, bytes: 31,
      status: "SYNCED", preview: "0x5A 0x0B 0xD1 0x33 0x48 0x9C …",
    },
  ]);
  const [emergency, setEmergency] = useState<EmergencyState | null>(null);
  const [scannedCount, setScannedCount] = useState(0);

  /* simulated UTC clock */
  useEffect(() => {
    const t = setInterval(() => setUtc(nowTime()), 1000);
    return () => clearInterval(t);
  }, []);

  /* persist offline queue */
  useEffect(() => {
    saveQueue(pending);
  }, [pending]);

  const go = useCallback((s: Section) => setSection(s), []);

  const pushActivity = useCallback((text: string, kind: ActivityEntry["kind"]) => {
    setActivity((a) => [{ id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, time: nowTime(), text, kind }, ...a].slice(0, 8));
  }, []);

  const setConnection = useCallback(
    (c: Connection) => {
      setConnectionRaw(c);
      if (c === "OFFLINE") {
        pushActivity("Satellite link lost — local edge mode engaged", "sync");
      } else {
        pushActivity("Satellite link restored", "sync");
      }
    },
    [pushActivity],
  );

  const simulateBlackout = useCallback(() => {
    setConnectionRaw("OFFLINE");
    pushActivity("Simulated 72-hour satellite blackout engaged", "sync");
    toast.error("Satellite link simulated as offline.", { description: "Local edge mode active — new actions will be queued locally." });
  }, [pushActivity]);

  const addLocalTransaction = useCallback(() => {
    setPending((q) => {
      const next = q.length + 1;
      const kind = TX_KINDS[(next - 1) % TX_KINDS.length];
      const tx: PendingTx = { num: next, type: kind.type, station: kind.station, createdAt: nowTime() };
      return [...q, tx];
    });
    toast.info("Transaction queued locally.", { description: "Stored in the simulated edge queue until the link is restored." });
  }, []);

  const restoreLink = useCallback(async () => {
    const count = pending.length;
    setConnectionRaw("ONLINE");
    if (count === 0) {
      toast.success("Satellite link restored.", { description: "Queue empty — nothing to transmit." });
      return;
    }
    toast.loading("Restoring simulated satellite link…", { id: "sync" });
    await sleep(700);
    toast.loading("Compressing pending transactions…", { id: "sync" });
    await sleep(700);
    toast.loading("Preparing low-bandwidth payload…", { id: "sync" });
    await sleep(600);
    toast.loading("Transmitting via simulated SBD burst…", { id: "sync" });
    await sleep(800);
    toast.success(`${count} update${count === 1 ? "" : "s"} synchronized successfully.`, {
      id: "sync",
      description: "Simulated compact payload transmitted. Edge queue cleared.",
    });
    setSyncHistory((h) => [
      {
        id: `s-${Date.now()}`,
        ts: `${new Date().toISOString().slice(0, 10)} ${nowTime()}`,
        direction: "OUT",
        records: count,
        bytes: Math.max(16, count * 11 + 5),
        status: "SYNCED",
        preview: hexPayload(6) + " …",
      },
      ...h,
    ]);
    setPending([]);
    pushActivity(`Sync completed — ${count} record${count === 1 ? "" : "s"} transmitted`, "sync");
  }, [pending, pushActivity]);

  const triggerDistress = useCallback(
    (teamId: string) => {
      const team = teams.find((t) => t.id === teamId);
      if (!team) return;
      const ts = nowTime();
      setEmergency({
        teamId: team.id,
        teamName: team.name,
        vehicle: team.vehicle,
        personnel: team.personnelCount,
        coords: "70°02′S 74°38′E",
        lat: "-70.0431",
        lon: "74.6352",
        battery: 62,
        beacon: "ACTIVE",
        lastTelemetry: ts,
        activatedAt: ts,
        acknowledged: false,
        incidentId: null,
        incidentOpenedAt: null,
      });
      setTeams((ts2) => ts2.map((t) => (t.id === team.id ? { ...t, status: "DISTRESS", beacon: "ACTIVE" } : t)));
      setAlerts((a) => [
        {
          id: `em-${Date.now()}`,
          severity: "CRITICAL",
          category: "Emergency",
          title: "DISTRESS BEACON ACTIVE",
          detail: `${team.name} — ${team.vehicle} activated its distress beacon. 6 personnel, battery 62%. Last telemetry ${ts}.`,
          createdAt: ts,
          status: "UNREAD",
          target: "emergency",
        },
        ...a,
      ]);
      pushActivity(`DISTRESS BEACON ACTIVE — ${team.name}`, "emergency");
      toast.error("Emergency alert triggered.", { description: `${team.name} — distress beacon active. Open the Emergency Center.` });
    },
    [teams, pushActivity],
  );

  const acknowledgeDistress = useCallback(() => {
    setEmergency((e) => (e ? { ...e, acknowledged: true } : e));
    pushActivity("Distress alert acknowledged by duty officer", "emergency");
    toast.success("Emergency acknowledged.", { description: "Response protocol engaged — incident can now be opened." });
  }, [pushActivity]);

  const openIncident = useCallback(() => {
    const id = `INC-${String(Math.floor(Math.random() * 900) + 100)}`;
    setEmergency((e) => (e ? { ...e, incidentId: id, incidentOpenedAt: nowTime() } : e));
    pushActivity(`Incident ${id} opened for emergency response`, "emergency");
    toast.info(`Incident ${id} opened.`, { description: "Rescue coordination record created in the simulated incident log." });
  }, [pushActivity]);

  const resolveEmergency = useCallback(() => {
    setEmergency((e) => {
      if (e) {
        pushActivity(`Emergency resolved — ${e.teamName} safe at ${e.incidentId ?? "response point"}`, "emergency");
      }
      return null;
    });
    setTeams((ts) => ts.map((t) => (t.status === "DISTRESS" ? { ...t, status: "RETURNING", beacon: "ONLINE" } : t)));
    toast.success("Emergency resolved.", { description: "Beacon cleared and team returned to monitored status." });
  }, [pushActivity]);

  const scanAsset = useCallback((): { assetId: string; item: string; station: Station; queued: boolean } => {
    const offline = connection === "OFFLINE";
    const pool: Array<{ assetId: string; item: string; station: Station }> = [
      { assetId: "MTR-MED-024", item: "Emergency Medical Kit", station: "Maitri" },
      { assetId: "BHR-SCI-031", item: "Cryovial Transport Box", station: "Bharati" },
      { assetId: "MTR-SPP-047", item: "Generator Spare Parts", station: "Maitri" },
    ];
    const pick = pool[Math.floor(Math.random() * pool.length)];
    const status = offline ? "QUEUED LOCALLY" : "SCANNED";
    setInventory((inv) => {
      if (inv.some((i) => i.assetId === pick.assetId)) {
        return inv.map((i) => (i.assetId === pick.assetId ? { ...i, status, updatedMin: 0, scanned: true } : i));
      }
      const scan: InventoryItem = {
        id: `scan-${Date.now()}`,
        assetId: pick.assetId,
        item: pick.item,
        category:
          pick.item.includes("Medical") ? "Medical Supplies" :
          pick.item.includes("Cryovial") ? "Scientific Equipment" : "Spare Parts",
        station: pick.station,
        quantity: 1,
        unit: "units",
        safetyStock: 2,
        temp: null,
        safeMin: null,
        safeMax: null,
        exposureHours: 0,
        status,
        updatedMin: 0,
        scanned: true,
      };
      return [scan, ...inv];
    });
    setScannedCount((c) => c + 1);
    pushActivity(`Asset scanned — ${pick.assetId} (${status.toLowerCase()})`, "scan");
    return { ...pick, queued: offline };
  }, [connection, pushActivity]);

  const markCargo = useCallback(
    (id: string, status: CargoItem["status"]) => {
      setCargo((c) => c.map((x) => (x.id === id ? { ...x, status } : x)));
      pushActivity(`Cargo ${id} marked ${status.toLowerCase()}`, "cargo");
      toast.success(`Cargo updated.`, { description: `${id} is now ${status}.` });
    },
    [pushActivity],
  );

  const toggleChecklist = useCallback(
    (id: string) => {
      setChecklist((c) => c.map((x) => (x.id === id ? { ...x, checked: !x.checked } : x)));
      toast.info("Compliance checklist updated.");
    },
    [],
  );

  const acknowledgeAlert = useCallback((id: string) => {
    setAlerts((a) => a.map((x) => (x.id === id ? { ...x, status: "ACK" as const } : x)));
  }, []);

  const dismissAlert = useCallback((id: string) => {
    setAlerts((a) => a.map((x) => (x.id === id ? { ...x, status: "DISMISSED" as const } : x)));
  }, []);

  const acknowledgeAllAlerts = useCallback(() => {
    setAlerts((a) => a.map((x) => (x.status === "UNREAD" ? { ...x, status: "ACK" as const } : x)));
    toast.info("All alerts acknowledged.");
  }, []);

  /* ── derived metrics (single source of truth) ───────────────────────── */
  const inventoryAlerts = useMemo(
    () => inventory.filter((i) => i.status === "LOW STOCK" || i.status === "CRITICAL" || i.status === "COLD-CHAIN RISK").length,
    [inventory],
  );
  const activeEmergencies = emergency ? 1 : 0;
  const personnelDeployed = personnel.length;
  const expeditionsActive = useMemo(() => expeditions.filter((e) => e.status === "ACTIVE").length, [expeditions]);
  const expeditionsPlanned = useMemo(() => expeditions.filter((e) => e.status === "PLANNED").length, [expeditions]);
  const teamsInDistress = teams.some((t) => t.status === "DISTRESS");
  const unreadAlerts = useMemo(() => alerts.filter((a) => a.status === "UNREAD").length, [alerts]);
  const compliancePct = useMemo(() => {
    if (checklist.length === 0) return 0;
    return Math.round((checklist.filter((c) => c.checked).length / checklist.length) * 100);
  }, [checklist]);

  const value: PolarStore = {
    section, go, connection, utc,
    inventory, cargo, personnel, teams, waste, checklist, alerts, activity,
    expeditions, expeditionsActive, expeditionsPlanned, personnelDeployed,
    assetsCount: 20, inventoryAlerts, activeEmergencies,
    pending, pendingCount: pending.length, syncHistory, emergency, teamsInDistress,
    unreadAlerts, scannedCount, compliancePct,
    setConnection, simulateBlackout, restoreLink, addLocalTransaction,
    triggerDistress, acknowledgeDistress, openIncident, resolveEmergency,
    scanAsset, markCargo, toggleChecklist, acknowledgeAlert, dismissAlert,
    acknowledgeAllAlerts, pushActivity,
  };

  return <PolarContext.Provider value={value}>{children}</PolarContext.Provider>;
}

export function usePolar(): PolarStore {
  const ctx = useContext(PolarContext);
  if (!ctx) throw new Error("usePolar must be used inside <PolarProvider>");
  return ctx;
}

function sleep(ms: number) {
  return new Promise<void>((res) => setTimeout(res, ms));
}

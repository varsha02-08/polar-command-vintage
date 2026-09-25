import type {
  AlertItem,
  AssetRecord,
  ChecklistItem,
  CargoItem,
  Expedition,
  InventoryCategory,
  InventoryItem,
  InventoryStatus,
  MapMarkerDef,
  MapRouteDef,
  PersonnelRecord,
  Priority,
  Station,
  Team,
  WasteRecord,
} from "./types";

/* Deterministic PRNG so demo data is stable across reloads */
function mulberry(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry(26062);
const pick = <T,>(arr: T[]): T => arr[Math.floor(rnd() * arr.length)];
const rint = (min: number, max: number) => Math.floor(rnd() * (max - min + 1)) + min;

/* ── Inventory: 120 records ───────────────────────────────────────────── */
const INV_NAMES: Record<InventoryCategory, string[]> = {
  Fuel: [
    "Aviation Fuel Drum (JP-1)", "Diesel Generator Fuel", "Sled Fuel Canister", "Kerosene Heating Fuel", "Helicopter Fuel Reserve",
  ],
  Rations: [
    "Freeze-Dried Rations", "High-Energy Ration Packs", "Dehydrated Vegetables", "Powdered Milk Stores", "Trail Nutrition Bars",
  ],
  "Medical Supplies": [
    "Medical Oxygen Cylinder", "Emergency Medical Kit", "Antibiotic Stock", "IV Fluids Crate", "Trauma Dressing Kit",
  ],
  "Spare Parts": [
    "Generator Spare Parts", "Snowcat Track Links", "Snowmobile Drive Belt", "Water Pump Impeller", "Electrical Fuse Set",
  ],
  "Scientific Equipment": [
    "Ice Core Drill Bits", "Meteorological Sensors", "Water Sampling Kits", "Seismograph Modules", "Cryovial Transport Box",
  ],
  "Emergency Supplies": [
    "Emergency Shelter Tent", "Distress Beacon Unit", "Signal Flare Case", "Emergency Sleeping Bags", "Survival Sledge Kit",
  ],
  "Waste / Return Payload": [
    "Hazardous Waste Drum", "Battery Return Crate", "Used Lubricant Canister", "Lab Chemical Waste", "Compacted Solid Waste Bale",
  ],
};
const UNITS: Record<InventoryCategory, string> = {
  Fuel: "drums", Rations: "cases", "Medical Supplies": "units", "Spare Parts": "kits",
  "Scientific Equipment": "sets", "Emergency Supplies": "units", "Waste / Return Payload": "drums",
};

function invStatus(q: number, safety: number, temp: number | null, coldRisk: boolean): InventoryStatus {
  if (coldRisk) return "COLD-CHAIN RISK";
  if (q <= safety * 0.5) return "CRITICAL";
  if (q <= safety) return "LOW STOCK";
  return "NORMAL";
}

export function buildInventory(): InventoryItem[] {
  const items: InventoryItem[] = [];
  const categories = Object.keys(INV_NAMES) as InventoryCategory[];
  let n = 0;
  for (const cat of categories) {
    const names = INV_NAMES[cat];
    const perCat = cat === "Rations" || cat === "Medical Supplies" ? 18 : 17;
    for (let i = 0; i < perCat && items.length < 120; i++) {
      n++;
      const station: Station = rnd() > 0.5 ? "Maitri" : "Bharati";
      const item = names[i % names.length];
      const safety = rint(6, 24);
      /* Baseline stock stays healthy; the demo's seeded alerts come from the
         featured records below so the dashboard reads exactly 03 alerts. */
      const q = rint(safety + 1, safety * 4);
      const cold =
        cat === "Rations" || (cat === "Medical Supplies" && rnd() > 0.35) || item.includes("Cryovial");
      const temp = cold ? -1 * rint(26, 30) : null;
      const safeMin = cold ? -30 : null;
      const safeMax = cold ? -25 : null;
      const coldRisk = false;
      const exposure = coldRisk ? rint(2, 9) : 0;
      items.push({
        id: `inv-${n}`,
        assetId: `${station === "Maitri" ? "MTR" : "BHR"}-${cat
          .split(" ")[0]
          .slice(0, 3)
          .toUpperCase()}-${String(100 + n).padStart(3, "0")}`,
        item,
        category: cat,
        station,
        quantity: q,
        unit: UNITS[cat],
        safetyStock: safety,
        temp,
        safeMin,
        safeMax,
        exposureHours: exposure,
        status: invStatus(q, safety, temp, coldRisk),
        updatedMin: rint(3, 180),
        scanned: false,
      });
    }
  }
  /* Featured records required by the brief */
  items[0] = {
    id: "inv-101", assetId: "MTR-MED-014", item: "Medical Oxygen Cylinder", category: "Medical Supplies",
    station: "Maitri", quantity: 4, unit: "cylinders", safetyStock: 10, temp: null, safeMin: null, safeMax: null,
    exposureHours: 0, status: "LOW STOCK", updatedMin: 12, scanned: false,
  };
  items[1] = {
    id: "inv-102", assetId: "MTR-FUE-021", item: "Emergency Aviation Fuel", category: "Fuel",
    station: "Maitri", quantity: 9, unit: "drums", safetyStock: 18, temp: null, safeMin: null, safeMax: null,
    exposureHours: 0, status: "LOW STOCK", updatedMin: 26, scanned: false,
  };
  items[2] = {
    id: "inv-103", assetId: "BHR-RAT-007", item: "Freeze-Dried Rations", category: "Rations",
    station: "Bharati", quantity: 26, unit: "cases", safetyStock: 30, temp: -28, safeMin: -30, safeMax: -25,
    exposureHours: 6, status: "COLD-CHAIN RISK", updatedMin: 8, scanned: false,
  };
  items[3] = {
    id: "inv-104", assetId: "MTR-WST-003", item: "Return Payload Hazardous Waste", category: "Waste / Return Payload",
    station: "Maitri", quantity: 12, unit: "drums", safetyStock: 0, temp: null, safeMin: null, safeMax: null,
    exposureHours: 0, status: "NORMAL", updatedMin: 44, scanned: false,
  };
  items[4] = {
    id: "inv-105", assetId: "BHR-SCI-052", item: "Scientific Instruments", category: "Scientific Equipment",
    station: "Bharati", quantity: 14, unit: "sets", safetyStock: 6, temp: null, safeMin: null, safeMax: null,
    exposureHours: 0, status: "NORMAL", updatedMin: 61, scanned: false,
  };
  items[5] = {
    id: "inv-106", assetId: "MTR-SPP-033", item: "Generator Spare Parts", category: "Spare Parts",
    station: "Maitri", quantity: 14, unit: "kits", safetyStock: 8, temp: null, safeMin: null, safeMax: null,
    exposureHours: 0, status: "NORMAL", updatedMin: 19, scanned: false,
  };
  return items.slice(0, 120);
}

/* ── Cargo: 120 items ─────────────────────────────────────────────────── */
const CARGO_SEEDS: Record<string, string[]> = {
  Fuel: ["Aviation Fuel Drum", "Diesel Fuel Consignment", "Kerosene Heater Fuel"],
  Food: ["Freeze-Dried Ration Cases", "Fresh Frozen Provisions", "High-Energy Trail Packs"],
  Medical: ["Medical Oxygen Cylinders", "Pharmaceutical Cold Box", "Field Trauma Kits"],
  "Scientific Equipment": ["Ice Core Drill Assembly", "Weather Balloon Crate", "Sensor Calibration Kit"],
  "Spare Parts": ["Snowcat Engine Module", "Generator Alternator", "Communication Spares Crate"],
  "Waste Return": ["Hazardous Waste Drums", "Compacted Solid Waste", "Chemical Waste Return"],
};
const CARGO_STATUSES = ["RECEIVED", "LOADED", "IN TRANSIT", "DELIVERED"] as const;
const PRIORITIES: Priority[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

export function buildCargo(): CargoItem[] {
  const out: CargoItem[] = [];
  const cats = Object.keys(CARGO_SEEDS);
  for (let i = 1; i <= 120; i++) {
    const cat = cats[i % cats.length];
    const origin: Station = i % 2 === 0 ? "Maitri" : "Bharati";
    const destination = origin === "Maitri" ? (i % 5 === 0 ? "Field Depot I-71" : "Bharati") : i % 5 === 0 ? "Field Depot II-12" : "Maitri";
    out.push({
      id: `CARGO-${String(i).padStart(3, "0")}`,
      description: `${CARGO_SEEDS[cat][i % CARGO_SEEDS[cat].length]} #${i}`,
      category: cat as CargoItem["category"],
      origin,
      destination,
      weightKg: rint(40, 2400),
      priority: PRIORITIES[i % 7 === 0 ? 0 : rint(1, 3)],
      status: CARGO_STATUSES[i % 4 === 3 ? 3 : i % 3],
    });
  }
  out[0] = {
    id: "CARGO-001", description: "Emergency Aviation Fuel", category: "Fuel", origin: "Maitri",
    destination: "Bharati", weightKg: 1850, priority: "HIGH", status: "IN TRANSIT",
  };
  out[1] = {
    id: "CARGO-002", description: "Medical Oxygen Resupply", category: "Medical", origin: "Maitri",
    destination: "Bharati", weightKg: 640, priority: "CRITICAL", status: "LOADED",
  };
  out[2] = {
    id: "CARGO-003", description: "Freeze-Dried Rations (Q4 Stock)", category: "Food", origin: "Bharati",
    destination: "Maitri", weightKg: 1120, priority: "MEDIUM", status: "RECEIVED",
  };
  out[3] = {
    id: "CARGO-004", description: "Return Payload — Hazardous Waste", category: "Waste Return", origin: "Maitri",
    destination: "Coastal Evac Point", weightKg: 2240, priority: "HIGH", status: "IN TRANSIT",
  };
  return out;
}

/* ── Personnel: 46 across both stations ───────────────────────────────── */
const FIRST = ["Aarav", "Ishaan", "Priya", "Vikram", "Ananya", "Rohit", "Kavya", "Arjun", "Meera", "Dev", "Nisha", "Kabir", "Sana", "Rahul", "Tara", "Aditya", "Leela", "Manav", "Zoya", "Farhan", "Rhea", "Nikhil", "Diya", "Yash", "Sneha"];
const LAST = ["Sharma", "Iyer", "Patel", "Nair", "Reddy", "Khan", "Ghosh", "Verma", "Menon", "Bose", "Kulkarni", "Joshi", "Pillai", "Chandra", "Rao"];
const ROLES = ["Station Commander", "Glaciologist", "Meteorologist", "Logistics Officer", "Medical Officer", "Comms Engineer", "Vehicle Mechanic", "Field Guide", "Biologist", "Chef", "Power Systems Tech", "Data Scientist"];

export function buildPersonnel(): PersonnelRecord[] {
  const out: PersonnelRecord[] = [];
  const used = new Set<string>();
  for (let i = 0; i < 46; i++) {
    let name = `${pick(FIRST)} ${pick(LAST)}`;
    while (used.has(name)) name = `${pick(FIRST)} ${pick(LAST)}`;
    used.add(name);
    const station: Station = i < 24 ? "Bharati" : "Maitri";
    let status: PersonnelRecord["status"] = "STATION";
    let team: string | null = null;
    if (i < 6) { status = "FIELD"; team = "Traverse Team Alpha"; }
    else if (i < 10) { status = "FIELD"; team = "Traverse Team Beta"; }
    else if (i % 7 === 3) status = "REST";
    else if (i % 11 === 5) status = "TRANSIT";
    out.push({ id: `p-${i + 1}`, name, role: ROLES[i % ROLES.length], station, team, status });
  }
  return out;
}

/* ── Teams ────────────────────────────────────────────────────────────── */
export function buildTeams(): Team[] {
  return [
    {
      id: "alpha", name: "TRAVERSE TEAM ALPHA", vehicle: "Snowcat #02", personnelCount: 6,
      status: "ACTIVE", beacon: "ONLINE", lastTelemetry: "14:32 UTC",
      mission: "Route survey — Bharati to Field Depot II-12", base: "Bharati",
      route: [{ x: 68, y: 58 }, { x: 72, y: 50 }, { x: 77, y: 45 }, { x: 82, y: 43 }],
    },
    {
      id: "beta", name: "TRAVERSE TEAM BETA", vehicle: "Snowmobile #04", personnelCount: 4,
      status: "RETURNING", beacon: "ONLINE", lastTelemetry: "14:29 UTC",
      mission: "Sample retrieval — ice core transect 7", base: "Maitri",
      route: [{ x: 30, y: 47 }, { x: 34, y: 43 }, { x: 38, y: 40 }, { x: 42, y: 38 }],
    },
  ];
}

/* ── Assets: 20 ───────────────────────────────────────────────────────── */
export function buildAssets(): AssetRecord[] {
  const defs: [string, string][] = [
    ["Snowcat #01", "Heavy Traverse Vehicle"], ["Snowcat #02", "Heavy Traverse Vehicle"],
    ["Snowmobile #03", "Light Recon Vehicle"], ["Snowmobile #04", "Light Recon Vehicle"],
    ["KamAZ #05", "Logistics Truck"], ["Praga #06", "Field Hauler"],
    ["DG Set A", "Power Plant"], ["DG Set B", "Power Plant"], ["DG Set C", "Power Plant"],
    ["Water Plant #01", "Water Recovery"], ["RO Unit #02", "Water Recovery"],
    ["HF Radio #01", "Communication"], ["Iridium Terminal #02", "Communication"],
    ["VHF Repeater #03", "Communication"], ["D6 Dozer", "Heavy Equipment"],
    ["JCB Loader", "Heavy Equipment"], ["Fuel Bowser #01", "Fuel Handling"],
    ["Fuel Bowser #02", "Fuel Handling"], ["Helicopter Sling Kit", "Aviation Support"],
    ["Emergency Generator", "Emergency Systems"],
  ];
  const statuses: AssetRecord["status"][] = ["OPERATIONAL", "FIELD", "OPERATIONAL", "MAINTENANCE"];
  return defs.map(([name, type], i) => ({
    id: `AST-${String(i + 1).padStart(3, "0")}`,
    name, type,
    station: i % 2 === 0 ? "Maitri" : "Bharati",
    status: statuses[i % statuses.length],
  }));
}

/* ── Expeditions ──────────────────────────────────────────────────────── */
export function buildExpeditions(): Expedition[] {
  return [
    {
      id: "EXP-2026-A", name: "Antarctica Research Expedition 2026", station: "Bharati",
      missionType: "Research", start: "2026-01-12", end: "2026-11-30",
      personnel: 24, cargoItems: 67, status: "ACTIVE", risk: "MODERATE",
      summary:
        "Multi-disciplinary summer campaign: glaciology traverses, atmospheric science and coastal biology, supported by resupply flights from Cape Town.",
      waypoints: ["Bharati Base", "Ice Shelf Camp A", "Field Depot II-12", "Transect 7", "Bharati Base"],
    },
    {
      id: "EXP-2026-B", name: "Antarctic Logistics Support Mission 2026", station: "Maitri",
      missionType: "Logistics", start: "2026-12-05", end: "2027-02-28",
      personnel: 22, cargoItems: 53, status: "PLANNED", risk: "LOW",
      summary:
        "Annual resupply and station maintenance window: fuel movement, waste retrograde, runway preparation and winterization of remote caches.",
      waypoints: ["Maitri Base", "Fuel Cache M-4", "Shelf Road", "Maitri Base"],
    },
  ];
}

/* ── Waste records ────────────────────────────────────────────────────── */
export function buildWaste(): WasteRecord[] {
  return [
    { id: "WST-001", category: "Hazardous Materials", quantity: 18, unit: "drums", station: "Maitri", targetReturnDate: "2026-04-10", status: "OVERDUE" },
    { id: "WST-002", category: "Fuel Drums (Empty)", quantity: 42, unit: "drums", station: "Maitri", targetReturnDate: "2026-05-02", status: "READY FOR RETURN" },
    { id: "WST-003", category: "Solid Waste", quantity: 3.2, unit: "tonnes", station: "Bharati", targetReturnDate: "2026-05-15", status: "SCHEDULED" },
    { id: "WST-004", category: "Chemical Waste", quantity: 9, unit: "drums", station: "Bharati", targetReturnDate: "2026-04-28", status: "STORED" },
    { id: "WST-005", category: "Other Return Payload", quantity: 1.4, unit: "tonnes", station: "Maitri", targetReturnDate: "2026-02-20", status: "RETURNED" },
    { id: "WST-006", category: "Solid Waste", quantity: 2.1, unit: "tonnes", station: "Maitri", targetReturnDate: "2026-03-30", status: "RETURNED" },
    { id: "WST-007", category: "Battery Return Crate", quantity: 6, unit: "crates", station: "Bharati", targetReturnDate: "2026-04-05", status: "READY FOR RETURN" },
    { id: "WST-008", category: "Chemical Waste", quantity: 4, unit: "drums", station: "Maitri", targetReturnDate: "2026-03-18", status: "OVERDUE" },
  ] as WasteRecord[];
}

/* ── Safety checklist ─────────────────────────────────────────────────── */
export function buildChecklist(): ChecklistItem[] {
  return [
    { id: "c1", label: "Pre-Traverse Fuel Margin Verification", critical: true, checked: true },
    { id: "c2", label: "Emergency Shelter Stock Verified", critical: true, checked: true },
    { id: "c3", label: "Distress Beacon Test Completed", critical: true, checked: false },
    { id: "c4", label: "Medical Kit Inspection", critical: false, checked: true },
    { id: "c5", label: "Communication Equipment Check", critical: true, checked: true },
    { id: "c6", label: "Cold-Chain Verification", critical: false, checked: false },
    { id: "c7", label: "Waste Return Manifest Verified", critical: false, checked: false },
    { id: "c8", label: "Vehicle Emergency Kit Verified", critical: true, checked: false },
  ];
}

/* ── Map definitions (percent coordinates on a schematic Antarctica) ──── */
export const MAP_MARKERS: MapMarkerDef[] = [
  { id: "maitri", label: "Maitri Station", kind: "station", x: 24, y: 44, coords: "70°45′S 11°44′E", note: "Summer capacity 47 · Fuel hub · DG sets ×3" },
  { id: "bharati", label: "Bharati Station", kind: "station", x: 76, y: 56, coords: "69°24′S 76°11′E", note: "Research focus · Quonset habitat · Helipad" },
  { id: "alpha", label: "Field Traverse Alpha", kind: "team", x: 70, y: 46, coords: "70°02′S 74°38′E", note: "Snowcat #02 · 6 personnel · Moving NE" },
  { id: "beta", label: "Field Traverse Beta", kind: "team", x: 36, y: 40, coords: "71°18′S 09°02′E", note: "Snowmobile #04 · 4 personnel · Returning" },
  { id: "route", label: "Cargo Route", kind: "cargo", x: 50, y: 52, coords: "—", note: "Maitri ⇄ Bharati resupply corridor" },
  { id: "beacon", label: "Emergency Beacon (Stby)", kind: "beacon", x: 58, y: 63, coords: "71°40′S 76°02′E", note: "Remote cache · Beacon on standby" },
];

export const MAP_ROUTES: MapRouteDef[] = [
  { id: "r-alpha", label: "Alpha traverse line", kind: "traverse", points: [{ x: 76, y: 56 }, { x: 70, y: 46 }, { x: 82, y: 43 }] },
  { id: "r-beta", label: "Beta return line", kind: "traverse", points: [{ x: 24, y: 44 }, { x: 36, y: 40 }] },
  { id: "r-cargo", label: "Cargo corridor", kind: "cargo", points: [{ x: 24, y: 44 }, { x: 50, y: 52 }, { x: 76, y: 56 }] },
];

/* ── Initial alerts (derived, seeded) ─────────────────────────────────── */
export function buildInitialAlerts(): AlertItem[] {
  return [
    {
      id: "a1", severity: "WARNING", category: "Inventory", title: "LOW MEDICAL OXYGEN",
      detail: "Medical Oxygen Cylinder stock at Maitri is 4 units against a safety level of 10. Recommended reorder: 6 cylinders.",
      createdAt: "08:12 UTC", status: "UNREAD", target: "inventory",
    },
    {
      id: "a2", severity: "WARNING", category: "Cold Chain", title: "COLD-CHAIN THRESHOLD EXCEEDED",
      detail: "Freeze-Dried Rations at Bharati measured −28 °C against a −25 °C safe maximum. Exposure duration: 6 h.",
      createdAt: "08:05 UTC", status: "UNREAD", target: "inventory",
    },
    {
      id: "a3", severity: "WARNING", category: "Inventory", title: "EMERGENCY FUEL — REORDER RECOMMENDED",
      detail: "Emergency Aviation Fuel at Maitri has fallen to 9 drums (safety level 18). Suggested reorder: 9 drums.",
      createdAt: "07:51 UTC", status: "UNREAD", target: "inventory",
    },
    {
      id: "a4", severity: "INFO", category: "Compliance", title: "WASTE RETURN DEADLINE APPROACHING",
      detail: "Chemical Waste (WST-004) is scheduled for return by 2026-04-28. Manifest verification pending.",
      createdAt: "07:30 UTC", status: "UNREAD", target: "compliance",
    },
    {
      id: "a5", severity: "INFO", category: "Connectivity", title: "SATELLITE WINDOW IN 02:14 H",
      detail: "Next scheduled Iridium SBD pass over Lutzow-Holm Bay (simulated schedule). Queue will auto-flush if above 0 records.",
      createdAt: "07:02 UTC", status: "UNREAD", target: "sync",
    },
  ];
}

export function buildActivity() {
  return [
    { id: "act1", time: "08:42 UTC", text: "Cargo manifest updated — CARGO-001 marked IN TRANSIT", kind: "cargo" as const },
    { id: "act2", time: "08:38 UTC", text: "Traverse Alpha location updated — 70°02′S 74°38′E", kind: "personnel" as const },
    { id: "act3", time: "08:35 UTC", text: "Inventory scan completed — 120 records verified", kind: "inventory" as const },
    { id: "act4", time: "08:29 UTC", text: "Waste return record created — WST-008", kind: "waste" as const },
    { id: "act5", time: "08:21 UTC", text: "Sync window completed — 2 records transmitted", kind: "sync" as const },
  ];
}

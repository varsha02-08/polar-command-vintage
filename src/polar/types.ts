/* ── POLARLOG shared types ─────────────────────────────────────────────── */

export type Station = "Maitri" | "Bharati";
export type Connection = "ONLINE" | "OFFLINE";

export type Section =
  | "dashboard"
  | "expeditions"
  | "map"
  | "inventory"
  | "cargo"
  | "personnel"
  | "emergency"
  | "compliance"
  | "sync"
  | "alerts";

/* Inventory ────────────────────────────────────────────────────────────── */
export type InventoryCategory =
  | "Fuel"
  | "Rations"
  | "Medical Supplies"
  | "Spare Parts"
  | "Scientific Equipment"
  | "Emergency Supplies"
  | "Waste / Return Payload";

export type InventoryStatus =
  | "NORMAL"
  | "LOW STOCK"
  | "CRITICAL"
  | "COLD-CHAIN RISK"
  | "SCANNED"
  | "QUEUED LOCALLY";

export interface InventoryItem {
  id: string;
  assetId: string;
  item: string;
  category: InventoryCategory;
  station: Station;
  quantity: number;
  unit: string;
  safetyStock: number;
  /** current temperature in °C, null when not temperature controlled */
  temp: number | null;
  safeMin: number | null;
  safeMax: number | null;
  /** hours the item has been outside its safe range (0 when in range) */
  exposureHours: number;
  status: InventoryStatus;
  /** minutes since last verified */
  updatedMin: number;
  scanned?: boolean;
}

/* Cargo ────────────────────────────────────────────────────────────────── */
export type CargoCategory =
  | "Fuel"
  | "Food"
  | "Medical"
  | "Scientific Equipment"
  | "Spare Parts"
  | "Waste Return";

export type CargoStatus = "RECEIVED" | "LOADED" | "IN TRANSIT" | "DELIVERED";
export type Priority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export interface CargoItem {
  id: string;
  description: string;
  category: CargoCategory;
  origin: string;
  destination: string;
  weightKg: number;
  priority: Priority;
  status: CargoStatus;
}

/* Personnel & teams ───────────────────────────────────────────────────── */
export type PersonnelStatus = "STATION" | "FIELD" | "REST" | "TRANSIT";

export interface PersonnelRecord {
  id: string;
  name: string;
  role: string;
  station: Station;
  team: string | null;
  status: PersonnelStatus;
}

export type TeamStatus = "ACTIVE" | "RETURNING" | "STANDBY" | "DISTRESS";
export type BeaconStatus = "ONLINE" | "ACTIVE" | "OFFLINE";

export interface Team {
  id: string;
  name: string;
  vehicle: string;
  personnelCount: number;
  status: TeamStatus;
  beacon: BeaconStatus;
  lastTelemetry: string;
  mission: string;
  base: Station;
  route: { x: number; y: number }[];
}

/* Assets (vehicles / equipment) ───────────────────────────────────────── */
export interface AssetRecord {
  id: string;
  name: string;
  type: string;
  station: Station;
  status: "OPERATIONAL" | "MAINTENANCE" | "FIELD";
}

/* Expeditions ─────────────────────────────────────────────────────────── */
export interface Expedition {
  id: string;
  name: string;
  station: Station;
  missionType: string;
  start: string;
  end: string;
  personnel: number;
  cargoItems: number;
  status: "ACTIVE" | "PLANNED" | "COMPLETED";
  risk: "LOW" | "MODERATE" | "HIGH";
  summary: string;
  waypoints: string[];
}

/* Waste / compliance ──────────────────────────────────────────────────── */
export type WasteCategory =
  | "Hazardous Materials"
  | "Fuel Drums"
  | "Solid Waste"
  | "Chemical Waste"
  | "Other Return Payload";
export type WasteStatus =
  | "STORED"
  | "READY FOR RETURN"
  | "SCHEDULED"
  | "RETURNED"
  | "OVERDUE";

export interface WasteRecord {
  id: string;
  category: WasteCategory;
  quantity: number;
  unit: string;
  station: Station;
  targetReturnDate: string;
  status: WasteStatus;
}

export interface ChecklistItem {
  id: string;
  label: string;
  critical: boolean;
  checked: boolean;
}

/* Alerts ──────────────────────────────────────────────────────────────── */
export type AlertSeverity = "CRITICAL" | "WARNING" | "INFO";
export type AlertCategory =
  | "Inventory"
  | "Cold Chain"
  | "Personnel"
  | "Emergency"
  | "Cargo"
  | "Compliance"
  | "Connectivity";
export type AlertStatus = "UNREAD" | "ACK" | "DISMISSED";

export interface AlertItem {
  id: string;
  severity: AlertSeverity;
  category: AlertCategory;
  title: string;
  detail: string;
  createdAt: string;
  status: AlertStatus;
  target: Section;
}

/* Activity ────────────────────────────────────────────────────────────── */
export interface ActivityEntry {
  id: string;
  time: string;
  text: string;
  kind: "cargo" | "inventory" | "personnel" | "waste" | "sync" | "emergency" | "scan";
}

/* Sync ────────────────────────────────────────────────────────────────── */
export type SyncStatus = "QUEUED" | "TRANSMITTING" | "SYNCED" | "FAILED";

export interface PendingTx {
  num: number;
  type: string;
  station: Station;
  createdAt: string;
}

export interface SyncEntry {
  id: string;
  ts: string;
  direction: "OUT" | "IN";
  records: number;
  bytes: number;
  status: SyncStatus;
  preview: string;
}

/* Emergency ───────────────────────────────────────────────────────────── */
export interface EmergencyState {
  teamId: string;
  teamName: string;
  vehicle: string;
  personnel: number;
  coords: string;
  lat: string;
  lon: string;
  battery: number;
  beacon: string;
  lastTelemetry: string;
  activatedAt: string;
  acknowledged: boolean;
  incidentId: string | null;
  incidentOpenedAt: string | null;
}

/* Map ─────────────────────────────────────────────────────────────────── */
export interface MapMarkerDef {
  id: string;
  label: string;
  kind: "station" | "team" | "cargo" | "beacon" | "field";
  x: number;
  y: number;
  coords: string;
  note: string;
}

export interface MapRouteDef {
  id: string;
  label: string;
  kind: "traverse" | "cargo";
  points: { x: number; y: number }[];
}

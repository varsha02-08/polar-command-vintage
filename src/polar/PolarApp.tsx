import { TopStatusBar, Sidebar } from "@/polar/shell";
import { usePolar } from "@/polar/store";
import DashboardPage from "@/polar/pages/dashboard";
import ExpeditionsPage from "@/polar/pages/expeditions";
import InventoryPage from "@/polar/pages/inventory";
import CargoPage from "@/polar/pages/cargo";
import PersonnelPage from "@/polar/pages/personnel";
import EmergencyPage from "@/polar/pages/emergency";
import SyncPage from "@/polar/pages/sync";
import CompliancePage from "@/polar/pages/compliance";
import AlertsPage from "@/polar/pages/alerts";
import MapPage from "@/polar/pages/map";

function CurrentSection() {
  const { section } = usePolar();
  switch (section) {
    case "dashboard": return <DashboardPage />;
    case "expeditions": return <ExpeditionsPage />;
    case "map": return <MapPage />;
    case "inventory": return <InventoryPage />;
    case "cargo": return <CargoPage />;
    case "personnel": return <PersonnelPage />;
    case "emergency": return <EmergencyPage />;
    case "compliance": return <CompliancePage />;
    case "sync": return <SyncPage />;
    case "alerts": return <AlertsPage />;
    default: return <DashboardPage />;
  }
}

export default function PolarApp() {
  const { section } = usePolar();
  return (
    <div className="flex min-h-screen">
      <div className="sticky top-0 hidden h-screen lg:block">
        <Sidebar />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <TopStatusBar />
        <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 md:px-6">
          <div key={section} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <CurrentSection />
          </div>
        </main>
        <footer className="border-t border-border px-4 py-3 text-center text-[11px] text-muted-foreground md:px-6">
          POLARLOG · One platform for polar operations — even when connectivity fails. · Demo Mode • Simulated Operational Data
        </footer>
      </div>
      {/* mobile nav fallback */}
      <MobileNav />
    </div>
  );
}

function MobileNav() {
  const { section, go } = usePolar();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex overflow-x-auto border-t border-sidebar-border bg-sidebar text-sidebar-foreground lg:hidden">
      {[
        ["dashboard", "Home"], ["inventory", "Stock"], ["personnel", "Teams"],
        ["emergency", "SOS"], ["sync", "Sync"],
      ].map(([id, label]) => (
        <button
          key={id}
          type="button"
          onClick={() => go(id as ReturnType<typeof usePolar>["section"])}
          className={
            "flex-1 whitespace-nowrap px-3 py-3 text-[11px] font-bold uppercase tracking-wider " +
            (section === id ? "text-sidebar-primary" : "text-sidebar-foreground/60")
          }
        >
          {label}
        </button>
      ))}
    </nav>
  );
}

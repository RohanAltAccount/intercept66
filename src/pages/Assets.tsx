import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Package, 
  Plus, 
  Search, 
  Satellite,
  Battery,
  Thermometer,
  Radio,
  Calendar,
  MoreVertical,
  Rocket,
  CheckCircle2,
  Clock
} from "lucide-react";

interface SatelliteAsset {
  id: string;
  name: string;
  status: "operational" | "planned" | "maintenance" | "retired";
  launchDate: string;
  mission: string;
  components: number;
  health: number;
  lastMaintenance: string;
}

const assets: SatelliteAsset[] = [
  {
    id: "INT-001",
    name: "INTERCEPT-ALPHA",
    status: "operational",
    launchDate: "2023-03-15",
    mission: "LEO Observation",
    components: 24,
    health: 94,
    lastMaintenance: "2024-01-10",
  },
  {
    id: "INT-002",
    name: "INTERCEPT-BETA",
    status: "operational",
    launchDate: "2023-06-22",
    mission: "Communications",
    components: 31,
    health: 87,
    lastMaintenance: "2024-02-05",
  },
  {
    id: "INT-003",
    name: "INTERCEPT-GAMMA",
    status: "maintenance",
    launchDate: "2023-09-08",
    mission: "Earth Imaging",
    components: 28,
    health: 45,
    lastMaintenance: "2024-03-01",
  },
  {
    id: "INT-004",
    name: "INTERCEPT-DELTA",
    status: "operational",
    launchDate: "2024-01-12",
    mission: "Navigation",
    components: 22,
    health: 12,
    lastMaintenance: "2024-02-28",
  },
  {
    id: "INT-005",
    name: "INTERCEPT-EPSILON",
    status: "planned",
    launchDate: "2024-06-15",
    mission: "Deep Space Relay",
    components: 35,
    health: 100,
    lastMaintenance: "N/A",
  },
];

const statusConfig = {
  operational: { badge: "success" as const, label: "Operational", icon: CheckCircle2 },
  planned: { badge: "glow" as const, label: "Planned", icon: Calendar },
  maintenance: { badge: "warning" as const, label: "Maintenance", icon: Clock },
  retired: { badge: "secondary" as const, label: "Retired", icon: Package },
};

interface ComponentItem {
  id: string;
  name: string;
  category: string;
  status: "available" | "installed" | "reserved";
  satellite?: string;
}

const components: ComponentItem[] = [
  { id: "CMP-001", name: "Solar Panel Array A", category: "Power", status: "installed", satellite: "INT-001" },
  { id: "CMP-002", name: "X-Band Transponder", category: "Communication", status: "installed", satellite: "INT-002" },
  { id: "CMP-003", name: "Star Tracker Unit", category: "Navigation", status: "available" },
  { id: "CMP-004", name: "Reaction Wheel Assembly", category: "Attitude Control", status: "reserved", satellite: "INT-005" },
  { id: "CMP-005", name: "Li-Ion Battery Pack", category: "Power", status: "available" },
  { id: "CMP-006", name: "Thermal Radiator", category: "Thermal", status: "installed", satellite: "INT-003" },
];

const componentStatusConfig = {
  available: { badge: "success" as const, label: "Available" },
  installed: { badge: "glow" as const, label: "Installed" },
  reserved: { badge: "warning" as const, label: "Reserved" },
};

export default function Assets() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"satellites" | "components">("satellites");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20 pb-8 px-4">
        <div className="container mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-display font-bold mb-2 flex items-center gap-3">
                <Package className="w-8 h-8 text-primary" />
                Satellite Assets
              </h1>
              <p className="text-muted-foreground">
                Manage your satellite fleet and component inventory
              </p>
            </div>
            <Button variant="hero">
              <Plus className="w-4 h-4 mr-2" />
              Add New Asset
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card variant="glass">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-success/20">
                    <Satellite className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-display font-bold">4</p>
                    <p className="text-xs text-muted-foreground">Active Satellites</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card variant="glass">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Rocket className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-display font-bold">1</p>
                    <p className="text-xs text-muted-foreground">Planned Launch</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card variant="glass">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-warning/20">
                    <Package className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-display font-bold">140</p>
                    <p className="text-xs text-muted-foreground">Total Components</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card variant="glass">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-success/20">
                    <CheckCircle2 className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-display font-bold">82%</p>
                    <p className="text-xs text-muted-foreground">Fleet Health</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={activeTab === "satellites" ? "glow" : "ghost"}
              onClick={() => setActiveTab("satellites")}
            >
              <Satellite className="w-4 h-4 mr-2" />
              Satellites
            </Button>
            <Button
              variant={activeTab === "components" ? "glow" : "ghost"}
              onClick={() => setActiveTab("components")}
            >
              <Package className="w-4 h-4 mr-2" />
              Components
            </Button>
          </div>
          
          {/* Search */}
          <div className="relative max-w-md mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${activeTab}...`}
              className="pl-9 bg-secondary/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Content */}
          {activeTab === "satellites" ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assets.map((asset) => {
                const StatusIcon = statusConfig[asset.status].icon;
                return (
                  <Card key={asset.id} variant="glass" className="hover:border-primary/30 transition-all duration-300 group">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{asset.name}</CardTitle>
                          <p className="text-xs text-muted-foreground font-mono mt-1">{asset.id}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge variant={statusConfig[asset.status].badge}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig[asset.status].label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{asset.mission}</span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Health</span>
                          <span className={`font-mono ${asset.health > 70 ? 'text-success' : asset.health > 30 ? 'text-warning' : 'text-danger'}`}>
                            {asset.health}%
                          </span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              asset.health > 70 ? 'bg-success' : asset.health > 30 ? 'bg-warning' : 'bg-danger'
                            }`}
                            style={{ width: `${asset.health}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-border/30">
                        <div>
                          <p className="text-muted-foreground">Launch Date</p>
                          <p className="font-mono">{asset.launchDate}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Components</p>
                          <p className="font-mono">{asset.components}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card variant="glass">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Component</th>
                        <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</th>
                        <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                        <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">Satellite</th>
                        <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase tracking-wider"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {components.map((component) => (
                        <tr key={component.id} className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                          <td className="p-4">
                            <div>
                              <p className="font-medium text-sm">{component.name}</p>
                              <p className="text-xs text-muted-foreground font-mono">{component.id}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="text-sm text-muted-foreground">{component.category}</span>
                          </td>
                          <td className="p-4">
                            <Badge variant={componentStatusConfig[component.status].badge}>
                              {componentStatusConfig[component.status].label}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <span className="text-sm font-mono">{component.satellite || "-"}</span>
                          </td>
                          <td className="p-4">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

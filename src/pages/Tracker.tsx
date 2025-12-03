import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Earth3D from "@/components/Earth3D";
import { 
  Target, 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  Radar
} from "lucide-react";
import { Suspense } from "react";

interface DebrisObject {
  id: string;
  name: string;
  type: "debris" | "rocket_body" | "defunct_sat";
  altitude: string;
  velocity: string;
  inclination: string;
  riskLevel: "low" | "medium" | "high";
  proximityAlerts: number;
  lastTracked: string;
}

const debrisData: DebrisObject[] = [
  {
    id: "DEB-29481",
    name: "Cosmos 2251 Debris",
    type: "debris",
    altitude: "780 km",
    velocity: "7.45 km/s",
    inclination: "74.0°",
    riskLevel: "high",
    proximityAlerts: 3,
    lastTracked: "Live",
  },
  {
    id: "DEB-18294",
    name: "Fengyun-1C Fragment",
    type: "debris",
    altitude: "845 km",
    velocity: "7.42 km/s",
    inclination: "98.6°",
    riskLevel: "medium",
    proximityAlerts: 1,
    lastTracked: "Live",
  },
  {
    id: "RKB-40145",
    name: "CZ-3B Rocket Body",
    type: "rocket_body",
    altitude: "605 km",
    velocity: "7.54 km/s",
    inclination: "28.5°",
    riskLevel: "low",
    proximityAlerts: 0,
    lastTracked: "Live",
  },
  {
    id: "DEF-25544",
    name: "NOAA-17 (Defunct)",
    type: "defunct_sat",
    altitude: "810 km",
    velocity: "7.44 km/s",
    inclination: "98.7°",
    riskLevel: "medium",
    proximityAlerts: 2,
    lastTracked: "Live",
  },
  {
    id: "DEB-33401",
    name: "Iridium 33 Fragment",
    type: "debris",
    altitude: "765 km",
    velocity: "7.46 km/s",
    inclination: "86.4°",
    riskLevel: "high",
    proximityAlerts: 4,
    lastTracked: "Live",
  },
];

const typeConfig = {
  debris: { label: "Debris", color: "text-muted-foreground" },
  rocket_body: { label: "Rocket Body", color: "text-warning" },
  defunct_sat: { label: "Defunct Satellite", color: "text-primary" },
};

const riskConfig = {
  low: { badge: "success" as const, label: "Low Risk" },
  medium: { badge: "warning" as const, label: "Medium" },
  high: { badge: "danger" as const, label: "High Risk" },
};

export default function Tracker() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredDebris = debrisData.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20 pb-8 px-4">
        <div className="container mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-display font-bold mb-2 flex items-center gap-3">
                <Target className="w-8 h-8 text-primary" />
                Debris Tracker
              </h1>
              <p className="text-muted-foreground">
                Real-time space debris monitoring and collision prediction
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="glass" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
              <Button variant="glow" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh TLE
              </Button>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card variant="glass">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/20">
                    <Radar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-display font-bold">23,847</p>
                    <p className="text-xs text-muted-foreground">Objects Tracked</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card variant="glass">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-danger/20">
                    <AlertTriangle className="w-5 h-5 text-danger" />
                  </div>
                  <div>
                    <p className="text-2xl font-display font-bold">127</p>
                    <p className="text-xs text-muted-foreground">High Risk Objects</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card variant="glass">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-warning/20">
                    <Target className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-display font-bold">12</p>
                    <p className="text-xs text-muted-foreground">Proximity Alerts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card variant="glass">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-success/20">
                    <TrendingUp className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-display font-bold">99.2%</p>
                    <p className="text-xs text-muted-foreground">Track Accuracy</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Content */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* 3D View */}
            <Card variant="glow" className="h-[600px]">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Radar className="w-5 h-5 text-primary" />
                  Live Tracking View
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-[calc(100%-60px)]">
                <Suspense fallback={
                  <div className="flex items-center justify-center h-full">
                    <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                  </div>
                }>
                  <Earth3D />
                </Suspense>
              </CardContent>
            </Card>
            
            {/* Debris List */}
            <Card variant="glass" className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle>Tracked Objects</CardTitle>
                <div className="flex gap-2 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by ID or name..."
                      className="pl-9 bg-secondary/50"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" size="icon">
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto space-y-3">
                {filteredDebris.map((debris) => (
                  <div
                    key={debris.id}
                    className="p-4 rounded-lg bg-secondary/30 border border-border/50 hover:border-primary/30 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-mono text-sm font-semibold">{debris.name}</h4>
                          <Badge variant={riskConfig[debris.riskLevel].badge}>
                            {riskConfig[debris.riskLevel].label}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {debris.id} • {typeConfig[debris.type].label}
                        </p>
                      </div>
                      <Badge variant="orbital" className="text-[10px]">
                        {debris.lastTracked}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div>
                        <p className="text-muted-foreground">Altitude</p>
                        <p className="font-mono">{debris.altitude}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Velocity</p>
                        <p className="font-mono">{debris.velocity}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Inclination</p>
                        <p className="font-mono">{debris.inclination}</p>
                      </div>
                    </div>
                    
                    {debris.proximityAlerts > 0 && (
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/30">
                        <AlertTriangle className="w-3.5 h-3.5 text-warning" />
                        <span className="text-xs text-warning">
                          {debris.proximityAlerts} proximity alert{debris.proximityAlerts > 1 ? "s" : ""} in next 24h
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

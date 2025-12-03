import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Satellite, MoreVertical, Radio, Battery, Thermometer } from "lucide-react";

interface SatelliteData {
  id: string;
  name: string;
  status: "operational" | "warning" | "critical" | "offline";
  altitude: string;
  velocity: string;
  battery: number;
  temperature: number;
  signalStrength: number;
  lastContact: string;
}

const satellites: SatelliteData[] = [
  {
    id: "INT-001",
    name: "INTERCEPT-ALPHA",
    status: "operational",
    altitude: "408 km",
    velocity: "7.66 km/s",
    battery: 94,
    temperature: 22,
    signalStrength: 98,
    lastContact: "2 sec ago",
  },
  {
    id: "INT-002",
    name: "INTERCEPT-BETA",
    status: "operational",
    altitude: "412 km",
    velocity: "7.65 km/s",
    battery: 87,
    temperature: 24,
    signalStrength: 95,
    lastContact: "5 sec ago",
  },
  {
    id: "INT-003",
    name: "INTERCEPT-GAMMA",
    status: "warning",
    altitude: "398 km",
    velocity: "7.68 km/s",
    battery: 45,
    temperature: 31,
    signalStrength: 72,
    lastContact: "1 min ago",
  },
  {
    id: "INT-004",
    name: "INTERCEPT-DELTA",
    status: "critical",
    altitude: "385 km",
    velocity: "7.71 km/s",
    battery: 12,
    temperature: 38,
    signalStrength: 34,
    lastContact: "5 min ago",
  },
];

const statusConfig = {
  operational: { badge: "success", label: "Operational" },
  warning: { badge: "warning", label: "Warning" },
  critical: { badge: "danger", label: "Critical" },
  offline: { badge: "secondary", label: "Offline" },
} as const;

export default function SatelliteList() {
  return (
    <Card variant="glass" className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Satellite className="w-5 h-5 text-primary" />
          Active Satellites
        </CardTitle>
        <Button variant="ghost" size="sm">
          View All
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {satellites.map((sat) => (
          <div
            key={sat.id}
            className="p-4 rounded-lg bg-secondary/30 border border-border/50 hover:border-primary/30 transition-all duration-300 group"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-mono text-sm font-semibold">{sat.name}</h4>
                  <Badge variant={statusConfig[sat.status].badge as any}>
                    {statusConfig[sat.status].label}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">ID: {sat.id}</p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4 text-xs">
              <div>
                <p className="text-muted-foreground">Altitude</p>
                <p className="font-mono text-foreground">{sat.altitude}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Velocity</p>
                <p className="font-mono text-foreground">{sat.velocity}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Last Contact</p>
                <p className="font-mono text-foreground">{sat.lastContact}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/30">
              <div className="flex items-center gap-1.5">
                <Battery className={`w-3.5 h-3.5 ${sat.battery > 50 ? 'text-success' : sat.battery > 20 ? 'text-warning' : 'text-danger'}`} />
                <span className="text-xs font-mono">{sat.battery}%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Thermometer className={`w-3.5 h-3.5 ${sat.temperature < 30 ? 'text-success' : sat.temperature < 35 ? 'text-warning' : 'text-danger'}`} />
                <span className="text-xs font-mono">{sat.temperature}°C</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Radio className={`w-3.5 h-3.5 ${sat.signalStrength > 80 ? 'text-success' : sat.signalStrength > 50 ? 'text-warning' : 'text-danger'}`} />
                <span className="text-xs font-mono">{sat.signalStrength}%</span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

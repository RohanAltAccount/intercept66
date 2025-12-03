import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, Target, X } from "lucide-react";

interface Alert {
  id: string;
  type: "collision" | "proximity" | "system";
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
  timestamp: string;
  satellite?: string;
  debrisId?: string;
  distance?: string;
  timeToImpact?: string;
}

const alerts: Alert[] = [
  {
    id: "alert-1",
    type: "collision",
    severity: "critical",
    title: "Potential Collision Detected",
    description: "High probability collision trajectory with debris object",
    timestamp: "2 min ago",
    satellite: "INT-004",
    debrisId: "DEB-29481",
    distance: "1.2 km",
    timeToImpact: "4h 23m",
  },
  {
    id: "alert-2",
    type: "proximity",
    severity: "warning",
    title: "Close Approach Warning",
    description: "Debris entering satellite proximity zone",
    timestamp: "15 min ago",
    satellite: "INT-003",
    debrisId: "DEB-18294",
    distance: "5.8 km",
  },
  {
    id: "alert-3",
    type: "proximity",
    severity: "warning",
    title: "Orbit Decay Detected",
    description: "Satellite altitude decreasing faster than expected",
    timestamp: "1 hour ago",
    satellite: "INT-004",
  },
  {
    id: "alert-4",
    type: "system",
    severity: "info",
    title: "Telemetry Update",
    description: "New TLE data available for constellation",
    timestamp: "2 hours ago",
  },
];

const severityConfig = {
  critical: { badge: "danger", icon: "animate-pulse", bg: "bg-danger/10 border-danger/30" },
  warning: { badge: "warning", icon: "", bg: "bg-warning/10 border-warning/30" },
  info: { badge: "glow", icon: "", bg: "bg-primary/10 border-primary/30" },
};

export default function AlertsPanel() {
  return (
    <Card variant="glass" className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-warning" />
          Active Alerts
          <Badge variant="danger" className="ml-2">4</Badge>
        </CardTitle>
        <Button variant="ghost" size="sm">
          Clear All
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-4 rounded-lg border ${severityConfig[alert.severity].bg} transition-all duration-300 hover:scale-[1.01]`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className={`w-4 h-4 ${
                  alert.severity === "critical" ? "text-danger animate-pulse" :
                  alert.severity === "warning" ? "text-warning" : "text-primary"
                }`} />
                <h4 className="font-semibold text-sm">{alert.title}</h4>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <X className="w-3 h-3" />
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground mb-3">{alert.description}</p>
            
            <div className="flex flex-wrap gap-3 text-xs">
              {alert.satellite && (
                <div className="flex items-center gap-1">
                  <Target className="w-3 h-3 text-primary" />
                  <span className="font-mono">{alert.satellite}</span>
                </div>
              )}
              {alert.distance && (
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">Distance:</span>
                  <span className="font-mono text-warning">{alert.distance}</span>
                </div>
              )}
              {alert.timeToImpact && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-danger" />
                  <span className="font-mono text-danger">{alert.timeToImpact}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
              <span className="text-xs text-muted-foreground">{alert.timestamp}</span>
              {alert.type === "collision" && (
                <Button variant="danger" size="sm" className="h-7 text-xs">
                  Plan Avoidance
                </Button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

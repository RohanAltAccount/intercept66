import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Globe, Maximize2, RefreshCw } from "lucide-react";
import Earth3D from "./Earth3D";
import { Suspense } from "react";

export default function OrbitVisualizer() {
  return (
    <Card variant="glow" className="h-full overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Orbital View
          </CardTitle>
          <Badge variant="orbital">LIVE</Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 relative" style={{ height: "calc(100% - 60px)" }}>
        <Suspense fallback={
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        }>
          <Earth3D />
        </Suspense>
        
        {/* Overlay legend */}
        <div className="absolute bottom-4 left-4 p-3 rounded-lg glass-panel text-xs space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success" />
            <span>Safe Orbit</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-warning" />
            <span>Proximity Alert</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-danger animate-pulse" />
            <span>Collision Risk</span>
          </div>
        </div>
        
        {/* Stats overlay */}
        <div className="absolute top-4 right-4 p-3 rounded-lg glass-panel text-xs font-mono">
          <div className="space-y-1">
            <p><span className="text-muted-foreground">Objects Tracked:</span> <span className="text-primary">23,847</span></p>
            <p><span className="text-muted-foreground">Active Satellites:</span> <span className="text-success">4</span></p>
            <p><span className="text-muted-foreground">Debris Proximity:</span> <span className="text-warning">12</span></p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

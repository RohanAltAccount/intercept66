import Navbar from "@/components/Navbar";
import StatsCard from "@/components/StatsCard";
import OrbitVisualizer from "@/components/OrbitVisualizer";
import { Satellite, Target, AlertTriangle, Activity, Orbit, Radio } from "lucide-react";
import { useSatelliteData } from "@/hooks/useSatelliteData";
import { useUserSatellites } from "@/hooks/useUserSatellites";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { satellites, isLoading } = useSatelliteData();
  const { userSatellites, collisionPredictions } = useUserSatellites(satellites);
  
  const totalSatellites = satellites.length + userSatellites.length;
  const dangerAlerts = collisionPredictions.filter(p => p.riskLevel === 'danger').length;
  const warningAlerts = collisionPredictions.filter(p => p.riskLevel === 'proximity').length;
  const totalAlerts = dangerAlerts + warningAlerts;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20 pb-8 px-4">
        <div className="container mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold mb-2">
              Mission Control
            </h1>
            <p className="text-muted-foreground">
              Real-time orbital monitoring and debris tracking
            </p>
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatsCard
              title="Tracked Satellites"
              value={isLoading ? "..." : totalSatellites.toString()}
              subtitle={`${satellites.length} real + ${userSatellites.length} user-defined`}
              icon={Satellite}
              variant="success"
            />
            <StatsCard
              title="User Satellites"
              value={userSatellites.length.toString()}
              subtitle="In simulated orbit"
              icon={Target}
              variant="glow"
            />
            <StatsCard
              title="Collision Alerts"
              value={totalAlerts.toString()}
              subtitle={dangerAlerts > 0 ? `${dangerAlerts} critical` : "None critical"}
              icon={AlertTriangle}
              variant={dangerAlerts > 0 ? "warning" : "default"}
            />
            <StatsCard
              title="System Status"
              value={isLoading ? "Loading" : "Online"}
              subtitle="All systems operational"
              icon={Activity}
              variant="default"
            />
          </div>
          
          {/* Main Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left - Orbital Visualizer */}
            <div className="lg:col-span-2 h-[500px]">
              <OrbitVisualizer />
            </div>
            
            {/* Right - Collision Alerts */}
            <Card variant="glass" className="h-[500px] overflow-auto">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                  Collision Alerts
                  {totalAlerts > 0 && (
                    <Badge variant={dangerAlerts > 0 ? "danger" : "warning"} className="ml-2">
                      {totalAlerts}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {collisionPredictions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No collision alerts</p>
                    <p className="text-xs mt-1">Add satellites in the Tracker to see predictions</p>
                  </div>
                ) : (
                  collisionPredictions.map((prediction, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border transition-all duration-300 ${
                        prediction.riskLevel === 'danger' 
                          ? 'bg-danger/10 border-danger/30' 
                          : prediction.riskLevel === 'proximity'
                          ? 'bg-warning/10 border-warning/30'
                          : 'bg-success/10 border-success/30'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className={`w-4 h-4 ${
                          prediction.riskLevel === 'danger' ? 'text-danger animate-pulse' :
                          prediction.riskLevel === 'proximity' ? 'text-warning' : 'text-success'
                        }`} />
                        <span className="font-semibold text-sm capitalize">{prediction.riskLevel} Risk</span>
                      </div>
                      <div className="text-xs space-y-1 text-muted-foreground">
                        <p><span className="font-mono">{prediction.sat1Name}</span> ↔ <span className="font-mono">{prediction.sat2Name}</span></p>
                        <p>Min Distance: <span className="font-mono text-foreground">{prediction.minDistance.toFixed(1)} km</span></p>
                        <p>Closest Approach: <span className="font-mono text-foreground">{prediction.timeToClosestApproach.toFixed(1)} min</span></p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Bottom Section */}
          <div className="mt-6 grid lg:grid-cols-3 gap-6">
            {/* Satellite Summary */}
            <Card variant="glass" className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Satellite className="w-5 h-5 text-primary" />
                  Tracked Objects
                </CardTitle>
                <Link to="/tracker">
                  <Button variant="ghost" size="sm">
                    Open Tracker
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading satellite data...</div>
                ) : satellites.length === 0 && userSatellites.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Satellite className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No satellites tracked</p>
                    <p className="text-xs mt-1">Go to Tracker to add satellites</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {satellites.slice(0, 4).map((sat) => (
                      <div key={sat.id} className="p-3 rounded-lg bg-secondary/30 border border-border/50">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          <span className="font-mono text-sm">{sat.name}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                          <div>Alt: <span className="font-mono text-foreground">{sat.position.altitude.toFixed(0)} km</span></div>
                          <div>Vel: <span className="font-mono text-foreground">{sat.position.velocity.toFixed(2)} km/s</span></div>
                        </div>
                      </div>
                    ))}
                    {userSatellites.slice(0, 4).map((sat) => (
                      <div key={sat.id} className="p-3 rounded-lg bg-secondary/30 border border-border/50">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: sat.color }} />
                          <span className="font-mono text-sm">{sat.name}</span>
                          <Badge variant="secondary" className="text-[10px]">User</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                          <div>Alt: <span className="font-mono text-foreground">{sat.currentState?.altitude.toFixed(0) ?? '?'} km</span></div>
                          <div>Mass: <span className="font-mono text-foreground">{sat.mass.toFixed(0)} kg</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Quick Actions */}
            <div className="space-y-4">
              <div className="glass-panel rounded-lg p-6">
                <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
                  <Orbit className="w-5 h-5 text-primary" />
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <Link to="/tracker" className="block">
                    <button className="w-full p-3 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors text-left flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center">
                        <Satellite className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Add Satellite</p>
                        <p className="text-xs text-muted-foreground">Define a new orbital object</p>
                      </div>
                    </button>
                  </Link>
                  <Link to="/tracker" className="block">
                    <button className="w-full p-3 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors text-left flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-warning/20 flex items-center justify-center">
                        <Target className="w-4 h-4 text-warning" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">View Collisions</p>
                        <p className="text-xs text-muted-foreground">Analyze collision predictions</p>
                      </div>
                    </button>
                  </Link>
                </div>
              </div>
              
              {/* System Status */}
              <div className="glass-panel rounded-lg p-6">
                <h3 className="font-display font-semibold mb-4">System Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">TLE Data</span>
                    <span className="flex items-center gap-2 text-sm">
                      <span className={`w-2 h-2 rounded-full ${isLoading ? 'bg-warning' : 'bg-success'} animate-pulse`} />
                      {isLoading ? 'Loading' : 'Connected'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Real Satellites</span>
                    <span className="text-sm font-mono">{satellites.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">User Satellites</span>
                    <span className="text-sm font-mono">{userSatellites.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

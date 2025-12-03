import Navbar from "@/components/Navbar";
import StatsCard from "@/components/StatsCard";
import SatelliteList from "@/components/SatelliteList";
import AlertsPanel from "@/components/AlertsPanel";
import OrbitVisualizer from "@/components/OrbitVisualizer";
import { Satellite, Target, AlertTriangle, Activity, Orbit, Radio } from "lucide-react";

export default function Dashboard() {
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
              title="Active Satellites"
              value="4"
              subtitle="All systems nominal"
              icon={Satellite}
              variant="success"
              trend={{ value: 0, label: "this week" }}
            />
            <StatsCard
              title="Debris Tracked"
              value="23,847"
              subtitle="In monitored zone"
              icon={Target}
              variant="glow"
              trend={{ value: 2.4, label: "vs yesterday" }}
            />
            <StatsCard
              title="Active Alerts"
              value="4"
              subtitle="1 critical"
              icon={AlertTriangle}
              variant="warning"
            />
            <StatsCard
              title="Network Status"
              value="98.7%"
              subtitle="Uptime this month"
              icon={Activity}
              variant="default"
              trend={{ value: 0.3, label: "improvement" }}
            />
          </div>
          
          {/* Main Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left - Orbital Visualizer */}
            <div className="lg:col-span-2 h-[500px]">
              <OrbitVisualizer />
            </div>
            
            {/* Right - Alerts */}
            <div className="h-[500px] overflow-hidden">
              <AlertsPanel />
            </div>
          </div>
          
          {/* Bottom Section */}
          <div className="mt-6 grid lg:grid-cols-3 gap-6">
            {/* Satellite List */}
            <div className="lg:col-span-2">
              <SatelliteList />
            </div>
            
            {/* Quick Actions */}
            <div className="space-y-4">
              <div className="glass-panel rounded-lg p-6">
                <h3 className="font-display font-semibold mb-4 flex items-center gap-2">
                  <Orbit className="w-5 h-5 text-primary" />
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <button className="w-full p-3 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors text-left flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center">
                      <Satellite className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Plan New Orbit</p>
                      <p className="text-xs text-muted-foreground">Simulate orbital paths</p>
                    </div>
                  </button>
                  <button className="w-full p-3 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors text-left flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-warning/20 flex items-center justify-center">
                      <Target className="w-4 h-4 text-warning" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Run Collision Check</p>
                      <p className="text-xs text-muted-foreground">Analyze debris proximity</p>
                    </div>
                  </button>
                  <button className="w-full p-3 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors text-left flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-success/20 flex items-center justify-center">
                      <Radio className="w-4 h-4 text-success" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Update TLE Data</p>
                      <p className="text-xs text-muted-foreground">Fetch latest elements</p>
                    </div>
                  </button>
                </div>
              </div>
              
              {/* System Status */}
              <div className="glass-panel rounded-lg p-6">
                <h3 className="font-display font-semibold mb-4">System Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">API Status</span>
                    <span className="flex items-center gap-2 text-sm">
                      <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                      Operational
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Data Feed</span>
                    <span className="flex items-center gap-2 text-sm">
                      <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                      Connected
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Last Sync</span>
                    <span className="text-sm font-mono">2 sec ago</span>
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

import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Earth3D from "@/components/Earth3D";
import { useSatelliteData } from "@/hooks/useSatelliteData";
import { 
  Target, 
  Search, 
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  Radar,
  Satellite,
  Loader2
} from "lucide-react";
import { Suspense } from "react";

export default function Tracker() {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("stations");
  const [selectedSatelliteId, setSelectedSatelliteId] = useState<string | null>(null);
  
  const { satellites, isLoading, error, lastUpdated, refetch } = useSatelliteData(category);
  
  const filteredSatellites = satellites.filter(
    (sat) =>
      sat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sat.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const highAltCount = satellites.filter(s => s.position.altitude > 1000).length;
  const avgVelocity = satellites.length > 0 
    ? (satellites.reduce((acc, s) => acc + s.position.velocity, 0) / satellites.length).toFixed(2)
    : "0.00";

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
                satellite tracker
              </h1>
              <p className="text-muted-foreground">
                real-time satellite tracking with orbital mechanics calculations
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-[140px] bg-secondary/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stations">space stations</SelectItem>
                  <SelectItem value="starlink">starlink</SelectItem>
                  <SelectItem value="weather">weather</SelectItem>
                  <SelectItem value="gps">gps</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="glow" size="sm" onClick={refetch} disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                <span className="ml-2">refresh tle</span>
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
                    <p className="text-2xl font-display font-bold">{satellites.length}</p>
                    <p className="text-xs text-muted-foreground">satellites tracked</p>
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
                    <p className="text-2xl font-display font-bold">{highAltCount}</p>
                    <p className="text-xs text-muted-foreground">high altitude (&gt;1000km)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card variant="glass">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-warning/20">
                    <Satellite className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-display font-bold">{avgVelocity}</p>
                    <p className="text-xs text-muted-foreground">avg velocity (km/s)</p>
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
                    <p className="text-2xl font-display font-bold">
                      {lastUpdated ? "live" : "-"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {lastUpdated ? `updated ${lastUpdated.toLocaleTimeString()}` : "not updated"}
                    </p>
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
                  live tracking view
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-[calc(100%-60px)]">
                <Suspense fallback={
                  <div className="flex items-center justify-center h-full">
                    <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                  </div>
                }>
                  <Earth3D 
                    satellites={satellites}
                    selectedSatelliteId={selectedSatelliteId}
                    onSelectSatellite={setSelectedSatelliteId}
                  />
                </Suspense>
              </CardContent>
            </Card>
            
            {/* Satellite List */}
            <Card variant="glass" className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle>tracked satellites</CardTitle>
                <div className="flex gap-2 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="search by id or name..."
                      className="pl-9 bg-secondary/50"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto space-y-3">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <AlertTriangle className="w-12 h-12 text-danger mb-4" />
                    <p className="text-danger">{error}</p>
                    <Button variant="outline" className="mt-4" onClick={refetch}>
                      try again
                    </Button>
                  </div>
                ) : filteredSatellites.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    no satellites found
                  </div>
                ) : (
                  filteredSatellites.map((sat) => (
                    <div
                      key={sat.id}
                      className={`p-4 rounded-lg bg-secondary/30 border transition-all duration-300 cursor-pointer ${
                        selectedSatelliteId === sat.id 
                          ? 'border-primary/50 bg-primary/10' 
                          : 'border-border/50 hover:border-primary/30'
                      }`}
                      onClick={() => setSelectedSatelliteId(sat.id === selectedSatelliteId ? null : sat.id)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-mono text-sm font-semibold">{sat.name.toLowerCase()}</h4>
                            <Badge variant="orbital" className="text-[10px]">
                              live
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            norad {sat.id} • period {sat.elements.period.toFixed(1)} min
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3 text-xs">
                        <div>
                          <p className="text-muted-foreground">altitude</p>
                          <p className="font-mono">{sat.position.altitude.toFixed(1)} km</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">velocity</p>
                          <p className="font-mono">{sat.position.velocity.toFixed(2)} km/s</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">inclination</p>
                          <p className="font-mono">{sat.elements.inclination.toFixed(1)}°</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-xs mt-2 pt-2 border-t border-border/30">
                        <div>
                          <p className="text-muted-foreground">latitude</p>
                          <p className="font-mono">{sat.position.latitude.toFixed(4)}°</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">longitude</p>
                          <p className="font-mono">{sat.position.longitude.toFixed(4)}°</p>
                        </div>
                      </div>

                      {selectedSatelliteId === sat.id && (
                        <div className="grid grid-cols-2 gap-3 text-xs mt-2 pt-2 border-t border-border/30">
                          <div>
                            <p className="text-muted-foreground">apogee</p>
                            <p className="font-mono">{sat.elements.apogee.toFixed(1)} km</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">perigee</p>
                            <p className="font-mono">{sat.elements.perigee.toFixed(1)} km</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">eccentricity</p>
                            <p className="font-mono">{sat.elements.eccentricity.toFixed(6)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">semi-major axis</p>
                            <p className="font-mono">{sat.elements.semiMajorAxis.toFixed(1)} km</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

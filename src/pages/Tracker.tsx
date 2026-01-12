import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Earth3D from "@/components/Earth3D";
import WorldMap2D from "@/components/WorldMap2D";
import { useSatelliteData } from "@/hooks/useSatelliteData";
import { useUserSatellites } from "@/hooks/useUserSatellites";
import AddSatelliteForm from "@/components/AddSatelliteForm";
import UserSatelliteList from "@/components/UserSatelliteList";
import CollisionPanel from "@/components/CollisionPanel";
import { 
  Target, 
  Search, 
  RefreshCw,
  AlertTriangle,
  Radar,
  Satellite,
  Loader2,
  Zap,
  Rocket,
  Globe,
  Map
} from "lucide-react";
import { Suspense } from "react";

export default function Tracker() {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("stations");
  const [selectedSatelliteId, setSelectedSatelliteId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("add");
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  
  const { satellites, isLoading, error, lastUpdated, refetch } = useSatelliteData(category);
  const { 
    userSatellites, 
    collisionPredictions, 
    addSatellite, 
    removeSatellite, 
    clearAllSatellites 
  } = useUserSatellites(satellites);
  
  const filteredSatellites = satellites.filter(
    (sat) =>
      sat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sat.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalTracked = satellites.length + userSatellites.length;
  const dangerCount = collisionPredictions.filter(p => p.riskLevel === 'danger').length;
  const proximityCount = collisionPredictions.filter(p => p.riskLevel === 'proximity').length;
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
                collision tracker
              </h1>
              <p className="text-muted-foreground">
                add satellites and monitor collision predictions in real-time
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
                    <p className="text-2xl font-display font-bold">{totalTracked}</p>
                    <p className="text-xs text-muted-foreground">total tracked</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card variant="glass">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${dangerCount > 0 ? 'bg-danger/20 animate-pulse' : 'bg-success/20'}`}>
                    <Zap className={`w-5 h-5 ${dangerCount > 0 ? 'text-danger' : 'text-success'}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-display font-bold">{dangerCount}</p>
                    <p className="text-xs text-muted-foreground">collision risks</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card variant="glass">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-warning/20">
                    <AlertTriangle className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-display font-bold">{proximityCount}</p>
                    <p className="text-xs text-muted-foreground">proximity alerts</p>
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
                    <p className="text-2xl font-display font-bold">{userSatellites.length}</p>
                    <p className="text-xs text-muted-foreground">your satellites</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Content */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* 3D/2D View */}
            <Card variant="glow" className="lg:col-span-2 h-[600px]">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Radar className="w-5 h-5 text-primary" />
                    {viewMode === '3d' ? 'live orbital view' : 'ground track map'}
                  </span>
                  <div className="flex items-center gap-2">
                    {/* View Mode Toggle */}
                    <div className="flex rounded-full bg-secondary/50 p-1">
                      <Button
                        variant={viewMode === '3d' ? 'glow' : 'ghost'}
                        size="sm"
                        className="rounded-full px-3 h-7"
                        onClick={() => setViewMode('3d')}
                      >
                        <Globe className="w-4 h-4 mr-1" />
                        3d
                      </Button>
                      <Button
                        variant={viewMode === '2d' ? 'glow' : 'ghost'}
                        size="sm"
                        className="rounded-full px-3 h-7"
                        onClick={() => setViewMode('2d')}
                      >
                        <Map className="w-4 h-4 mr-1" />
                        2d
                      </Button>
                    </div>
                    {dangerCount > 0 && (
                      <Badge variant="destructive" className="animate-pulse">
                        {dangerCount} collision risk{dangerCount > 1 ? 's' : ''}
                      </Badge>
                    )}
                    <Badge variant="orbital">live</Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-[calc(100%-60px)]">
                {viewMode === '3d' ? (
                  <Suspense fallback={
                    <div className="flex items-center justify-center h-full">
                      <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                    </div>
                  }>
                    <Earth3D 
                      satellites={satellites}
                      userSatellites={userSatellites}
                      selectedSatelliteId={selectedSatelliteId}
                      onSelectSatellite={setSelectedSatelliteId}
                      collisionPredictions={collisionPredictions}
                    />
                  </Suspense>
                ) : (
                  <WorldMap2D
                    satellites={satellites}
                    userSatellites={userSatellites}
                    selectedSatelliteId={selectedSatelliteId}
                    onSelectSatellite={setSelectedSatelliteId}
                  />
                )}
              </CardContent>
            </Card>
            
            {/* Right Panel */}
            <div className="space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full">
                  <TabsTrigger value="add" className="flex-1">add satellite</TabsTrigger>
                  <TabsTrigger value="collisions" className="flex-1">
                    collisions
                    {(dangerCount + proximityCount) > 0 && (
                      <Badge variant="outline" className="ml-2 text-[10px]">
                        {dangerCount + proximityCount}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="add" className="space-y-4 mt-4">
                  <AddSatelliteForm onAddSatellite={addSatellite} />
                  <UserSatelliteList 
                    satellites={userSatellites}
                    onRemove={removeSatellite}
                    onClearAll={clearAllSatellites}
                    selectedId={selectedSatelliteId}
                    onSelect={setSelectedSatelliteId}
                  />
                </TabsContent>
                
                <TabsContent value="collisions" className="mt-4">
                  <CollisionPanel predictions={collisionPredictions} />
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          {/* Real Satellite List */}
          <Card variant="glass" className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Satellite className="w-5 h-5 text-primary" />
                real-world satellites ({satellites.length})
              </CardTitle>
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
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-32 text-center">
                  <AlertTriangle className="w-12 h-12 text-danger mb-4" />
                  <p className="text-danger">{error}</p>
                  <Button variant="outline" className="mt-4" onClick={refetch}>
                    try again
                  </Button>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[400px] overflow-auto">
                  {filteredSatellites.slice(0, 12).map((sat) => (
                    <div
                      key={sat.id}
                      className={`p-4 rounded-lg bg-secondary/30 border transition-all duration-300 cursor-pointer ${
                        selectedSatelliteId === sat.id 
                          ? 'border-primary/50 bg-primary/10' 
                          : 'border-border/50 hover:border-primary/30'
                      }`}
                      onClick={() => setSelectedSatelliteId(sat.id === selectedSatelliteId ? null : sat.id)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-mono text-sm font-semibold truncate">{sat.name.toLowerCase()}</h4>
                          <p className="text-xs text-muted-foreground">norad {sat.id}</p>
                        </div>
                        <Badge variant="orbital" className="text-[10px]">live</Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-muted-foreground">altitude</p>
                          <p className="font-mono">{sat.position.altitude.toFixed(0)} km</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">velocity</p>
                          <p className="font-mono">{sat.position.velocity.toFixed(2)} km/s</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

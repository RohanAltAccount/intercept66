import { UserSatelliteWithState } from '@/hooks/useUserSatellites';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Satellite, Orbit } from 'lucide-react';
import { calculateOrbitalPeriod } from '@/lib/collision-detection';

interface UserSatelliteListProps {
  satellites: UserSatelliteWithState[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

const EARTH_RADIUS = 6378;

export default function UserSatelliteList({ 
  satellites, 
  onRemove, 
  onClearAll,
  selectedId,
  onSelect
}: UserSatelliteListProps) {
  if (satellites.length === 0) {
    return (
      <Card variant="glass">
        <CardContent className="py-8">
          <div className="flex flex-col items-center justify-center text-center">
            <Orbit className="w-12 h-12 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">no satellites in orbit</p>
            <p className="text-xs text-muted-foreground mt-1">add coordinates to launch your first satellite</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="glass">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <Satellite className="w-4 h-4 text-primary" />
            your satellites ({satellites.length})
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClearAll}
            className="text-xs text-muted-foreground hover:text-danger"
          >
            clear all
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 max-h-[300px] overflow-auto">
        {satellites.map(sat => {
          const distance = Math.sqrt(sat.x * sat.x + sat.y * sat.y + sat.z * sat.z);
          const period = calculateOrbitalPeriod(distance) / 60; // convert to minutes
          
          return (
            <div 
              key={sat.id}
              className={`p-3 rounded-lg border transition-all cursor-pointer ${
                selectedId === sat.id 
                  ? 'bg-primary/10 border-primary/50' 
                  : 'bg-secondary/30 border-border/30 hover:border-primary/30'
              }`}
              onClick={() => onSelect(selectedId === sat.id ? null : sat.id)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: sat.color }}
                  />
                  <span className="font-mono text-sm">{sat.name}</span>
                  <Badge variant="orbital" className="text-[10px]">
                    live
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(sat.id);
                  }}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-danger"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">altitude</p>
                  <p className="font-mono">{sat.currentState.altitude.toFixed(0)} km</p>
                </div>
                <div>
                  <p className="text-muted-foreground">velocity</p>
                  <p className="font-mono">{sat.currentState.velocity.toFixed(2)} km/s</p>
                </div>
                <div>
                  <p className="text-muted-foreground">period</p>
                  <p className="font-mono">{period.toFixed(1)} min</p>
                </div>
              </div>
              
              {selectedId === sat.id && (
                <div className="grid grid-cols-3 gap-2 text-xs mt-2 pt-2 border-t border-border/30">
                  <div>
                    <p className="text-muted-foreground">x</p>
                    <p className="font-mono">{sat.currentState.x.toFixed(0)} km</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">y</p>
                    <p className="font-mono">{sat.currentState.y.toFixed(0)} km</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">z</p>
                    <p className="font-mono">{sat.currentState.z.toFixed(0)} km</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">mass</p>
                    <p className="font-mono">{sat.mass} kg</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">lat</p>
                    <p className="font-mono">{sat.currentState.latitude.toFixed(2)}°</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">lon</p>
                    <p className="font-mono">{sat.currentState.longitude.toFixed(2)}°</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

import { useMemo } from 'react';
import { Satellite } from '@/hooks/useSatelliteData';
import { UserSatelliteWithState } from '@/hooks/useUserSatellites';
import worldMapImage from '@/assets/world-map-mercator.png';

interface WorldMap2DProps {
  satellites: Satellite[];
  userSatellites: UserSatelliteWithState[];
  selectedSatelliteId: string | null;
  onSelectSatellite: (id: string | null) => void;
}

// Web Mercator projection helpers
function latLonToMercator(lat: number, lon: number, width: number, height: number) {
  // Clamp latitude to avoid infinity at poles
  const clampedLat = Math.max(-85, Math.min(85, lat));
  
  // Convert to radians
  const latRad = (clampedLat * Math.PI) / 180;
  
  // Web Mercator projection
  const x = ((lon + 180) / 360) * width;
  const y = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * height;
  
  return { x, y };
}

export default function WorldMap2D({ 
  satellites, 
  userSatellites, 
  selectedSatelliteId, 
  onSelectSatellite 
}: WorldMap2DProps) {
  const mapWidth = 800;
  const mapHeight = 600;

  // Generate ground tracks for satellites
  const satellitePaths = useMemo(() => {
    return satellites.map(sat => {
      const points = sat.groundTrack.map(pos => 
        latLonToMercator(pos.latitude, pos.longitude, mapWidth, mapHeight)
      );
      return { id: sat.id, name: sat.name, points, current: sat.position };
    });
  }, [satellites]);

  // Generate paths for user satellites
  const userSatellitePaths = useMemo(() => {
    return userSatellites.map(sat => {
      if (!sat.currentState) return null;
      const { latitude, longitude } = sat.currentState;
      const pos = latLonToMercator(latitude, longitude, mapWidth, mapHeight);
      return { id: sat.id, name: sat.name, pos, color: sat.color };
    }).filter(Boolean);
  }, [userSatellites]);

  // Create SVG path from points (handling wrap-around at date line)
  const createPath = (points: { x: number; y: number }[]) => {
    if (points.length < 2) return '';
    
    const segments: string[] = [];
    let currentSegment: { x: number; y: number }[] = [points[0]];
    
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      
      // Check for wrap-around (large jump in x)
      if (Math.abs(curr.x - prev.x) > mapWidth * 0.5) {
        // End current segment and start new one
        if (currentSegment.length > 1) {
          segments.push(
            `M ${currentSegment[0].x},${currentSegment[0].y} ` +
            currentSegment.slice(1).map(p => `L ${p.x},${p.y}`).join(' ')
          );
        }
        currentSegment = [curr];
      } else {
        currentSegment.push(curr);
      }
    }
    
    // Add final segment
    if (currentSegment.length > 1) {
      segments.push(
        `M ${currentSegment[0].x},${currentSegment[0].y} ` +
        currentSegment.slice(1).map(p => `L ${p.x},${p.y}`).join(' ')
      );
    }
    
    return segments.join(' ');
  };

  return (
    <div className="w-full h-full bg-background/50 rounded-lg overflow-hidden relative">
      <svg 
        viewBox={`0 0 ${mapWidth} ${mapHeight}`} 
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Glow filter for satellites */}
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* World map background image */}
        <image 
          href={worldMapImage} 
          x={0} 
          y={0} 
          width={mapWidth} 
          height={mapHeight}
          preserveAspectRatio="xMidYMid slice"
        />
        
        {/* Real satellite ground tracks */}
        {satellitePaths.map(({ id, points }) => {
          const path = createPath(points);
          const isSelected = selectedSatelliteId === id;
          return (
            <path
              key={`track-${id}`}
              d={path}
              fill="none"
              stroke={isSelected ? 'hsl(260 100% 60%)' : 'hsl(260 100% 43% / 0.5)'}
              strokeWidth={isSelected ? 2 : 1}
              strokeDasharray={isSelected ? 'none' : '4 4'}
              opacity={isSelected ? 1 : 0.7}
            />
          );
        })}
        
        {/* Real satellite current positions */}
        {satellitePaths.map(({ id, name, current }) => {
          const pos = latLonToMercator(current.latitude, current.longitude, mapWidth, mapHeight);
          const isSelected = selectedSatelliteId === id;
          return (
            <g 
              key={`sat-${id}`} 
              onClick={() => onSelectSatellite(isSelected ? null : id)}
              className="cursor-pointer"
              filter={isSelected ? 'url(#glow)' : undefined}
            >
              <circle
                cx={pos.x}
                cy={pos.y}
                r={isSelected ? 6 : 4}
                fill={isSelected ? 'hsl(260 100% 60%)' : 'hsl(260 100% 50%)'}
                stroke="hsl(0 0% 100% / 0.8)"
                strokeWidth={1}
              />
              {isSelected && (
                <text
                  x={pos.x + 10}
                  y={pos.y + 4}
                  fill="hsl(210 40% 96%)"
                  fontSize="10"
                  fontFamily="monospace"
                  className="lowercase"
                >
                  {name.toLowerCase()}
                </text>
              )}
            </g>
          );
        })}
        
        {/* User satellite positions */}
        {userSatellitePaths.map((sat) => {
          if (!sat) return null;
          const { id, name, pos, color } = sat;
          const isSelected = selectedSatelliteId === id;
          return (
            <g 
              key={`user-sat-${id}`}
              onClick={() => onSelectSatellite(isSelected ? null : id)}
              className="cursor-pointer"
              filter="url(#glow)"
            >
              <circle
                cx={pos.x}
                cy={pos.y}
                r={isSelected ? 8 : 6}
                fill={color}
                stroke="hsl(0 0% 100%)"
                strokeWidth={2}
              />
              <text
                x={pos.x + 12}
                y={pos.y + 4}
                fill="hsl(210 40% 96%)"
                fontSize="11"
                fontFamily="monospace"
                fontWeight="bold"
                className="lowercase"
              >
                {name.toLowerCase()}
              </text>
            </g>
          );
        })}
      </svg>
      
      {/* Legend */}
      <div className="absolute bottom-3 left-3 bg-card/90 backdrop-blur-sm rounded-lg p-3 border border-border/50">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-muted-foreground">real satellites</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success" />
            <span className="text-muted-foreground">your satellites</span>
          </div>
        </div>
      </div>
      
      {/* Coordinates overlay */}
      <div className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-border/50">
        <span className="text-xs font-mono text-muted-foreground">web mercator projection</span>
      </div>
    </div>
  );
}

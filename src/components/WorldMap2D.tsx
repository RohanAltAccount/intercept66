import { useMemo } from 'react';
import { Satellite } from '@/hooks/useSatelliteData';
import { UserSatelliteWithState } from '@/hooks/useUserSatellites';

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
  const mapHeight = 450;

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
        {/* Background gradient */}
        <defs>
          <linearGradient id="oceanGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(220 50% 12%)" />
            <stop offset="100%" stopColor="hsl(222 47% 8%)" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Ocean background */}
        <rect width={mapWidth} height={mapHeight} fill="url(#oceanGradient)" />
        
        {/* Grid lines */}
        {/* Longitude lines */}
        {[-180, -150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150, 180].map(lon => {
          const x = ((lon + 180) / 360) * mapWidth;
          return (
            <line 
              key={`lon-${lon}`}
              x1={x} y1={0} x2={x} y2={mapHeight}
              stroke="hsl(260 100% 43% / 0.1)"
              strokeWidth={lon === 0 ? 1 : 0.5}
            />
          );
        })}
        
        {/* Latitude lines */}
        {[-60, -30, 0, 30, 60].map(lat => {
          const { y } = latLonToMercator(lat, 0, mapWidth, mapHeight);
          return (
            <line 
              key={`lat-${lat}`}
              x1={0} y1={y} x2={mapWidth} y2={y}
              stroke="hsl(260 100% 43% / 0.1)"
              strokeWidth={lat === 0 ? 1 : 0.5}
            />
          );
        })}
        
        {/* Continent outlines - simplified */}
        <g fill="hsl(220 30% 18%)" stroke="hsl(220 30% 25%)" strokeWidth="0.5">
          {/* North America */}
          <path d="M50,120 L80,100 L120,90 L160,85 L180,100 L200,95 L220,110 L210,130 L200,150 L180,160 L150,170 L120,180 L100,175 L80,160 L60,140 Z" />
          {/* South America */}
          <path d="M170,200 L190,190 L210,195 L220,220 L230,260 L220,300 L200,340 L180,360 L160,340 L155,300 L160,260 L165,220 Z" />
          {/* Europe */}
          <path d="M380,100 L400,95 L420,100 L440,95 L450,110 L445,130 L430,140 L410,135 L390,130 L380,120 Z" />
          {/* Africa */}
          <path d="M380,160 L420,155 L460,165 L480,190 L485,230 L480,280 L460,320 L430,340 L400,330 L380,300 L370,260 L375,220 L378,190 Z" />
          {/* Asia */}
          <path d="M450,80 L500,70 L560,60 L620,70 L680,90 L720,110 L740,130 L720,150 L680,160 L620,155 L560,140 L500,130 L460,120 L455,100 Z" />
          {/* Australia */}
          <path d="M640,280 L680,275 L720,285 L740,310 L735,340 L710,360 L670,355 L640,340 L635,310 Z" />
        </g>
        
        {/* Real satellite ground tracks */}
        {satellitePaths.map(({ id, points }) => {
          const path = createPath(points);
          const isSelected = selectedSatelliteId === id;
          return (
            <path
              key={`track-${id}`}
              d={path}
              fill="none"
              stroke={isSelected ? 'hsl(260 100% 60%)' : 'hsl(260 100% 43% / 0.3)'}
              strokeWidth={isSelected ? 2 : 1}
              strokeDasharray={isSelected ? 'none' : '4 4'}
              opacity={isSelected ? 1 : 0.6}
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

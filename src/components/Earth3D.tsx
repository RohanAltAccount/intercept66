import { useRef, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, Stars, Line, Html } from "@react-three/drei";
import * as THREE from "three";
import { Satellite as SatelliteData } from "@/hooks/useSatelliteData";

interface Earth3DProps {
  satellites?: SatelliteData[];
  selectedSatelliteId?: string | null;
  onSelectSatellite?: (id: string | null) => void;
}

const EARTH_RADIUS_KM = 6378.137;
const SCALE_FACTOR = 1.5 / EARTH_RADIUS_KM;

function Earth() {
  const earthRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.0002;
    }
  });

  return (
    <group>
      <Sphere ref={earthRef} args={[1.5, 64, 64]}>
        <meshStandardMaterial
          color="#1a4a8a"
          roughness={0.8}
          metalness={0.2}
        />
      </Sphere>
      
      <Sphere args={[1.55, 64, 64]}>
        <meshBasicMaterial
          color="#00ccff"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </Sphere>
      
      {[...Array(6)].map((_, i) => (
        <Line
          key={`lat-${i}`}
          points={generateCircle(1.51, 64, (i - 2.5) * 0.4)}
          color="#00ffff"
          lineWidth={0.5}
          transparent
          opacity={0.2}
        />
      ))}
    </group>
  );
}

function generateCircle(radius: number, segments: number, yOffset: number = 0): [number, number, number][] {
  const points: [number, number, number][] = [];
  const adjustedRadius = Math.sqrt(Math.max(0, radius * radius - yOffset * yOffset));
  
  if (adjustedRadius > 0) {
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      points.push([
        Math.cos(theta) * adjustedRadius,
        yOffset,
        Math.sin(theta) * adjustedRadius,
      ]);
    }
  }
  return points;
}

function latLonToVector3(lat: number, lon: number, altitude: number): [number, number, number] {
  const r = (EARTH_RADIUS_KM + altitude) * SCALE_FACTOR;
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  
  return [
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  ];
}

interface RealSatelliteProps {
  satellite: SatelliteData;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

function RealSatellite({ satellite, isSelected, onSelect }: RealSatelliteProps) {
  const [hovered, setHovered] = useState(false);
  
  const position = useMemo(() => {
    return latLonToVector3(
      satellite.position.latitude,
      satellite.position.longitude,
      satellite.position.altitude
    );
  }, [satellite.position]);

  const groundTrackPoints = useMemo(() => {
    return satellite.groundTrack.map(pos => 
      latLonToVector3(pos.latitude, pos.longitude, pos.altitude)
    );
  }, [satellite.groundTrack]);

  const color = useMemo(() => {
    if (satellite.elements.inclination > 80) return "#ff6b6b";
    if (satellite.elements.inclination > 50) return "#ffd93d";
    return "#6bcb77";
  }, [satellite.elements.inclination]);

  return (
    <group>
      {(isSelected || hovered) && groundTrackPoints.length > 1 && (
        <Line
          points={groundTrackPoints}
          color={color}
          lineWidth={1}
          transparent
          opacity={0.5}
          dashed
          dashSize={0.05}
          gapSize={0.02}
        />
      )}
      
      <group 
        position={position}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => onSelect(satellite.id)}
      >
        <Sphere args={[isSelected ? 0.08 : 0.05, 16, 16]}>
          <meshBasicMaterial color={color} />
        </Sphere>
        
        <Sphere args={[isSelected ? 0.12 : 0.08, 16, 16]}>
          <meshBasicMaterial
            color={color}
            transparent
            opacity={isSelected ? 0.5 : 0.3}
          />
        </Sphere>
        
        {(hovered || isSelected) && (
          <Html distanceFactor={10}>
            <div className="bg-card/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-primary/30 whitespace-nowrap min-w-[180px]">
              <p className="text-primary font-mono text-xs font-bold">{satellite.name.toLowerCase()}</p>
              <p className="text-[10px] text-muted-foreground mt-1">norad id: {satellite.id}</p>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-2 text-[10px]">
                <div>
                  <span className="text-muted-foreground">alt:</span>
                  <span className="text-foreground ml-1">{satellite.position.altitude.toFixed(1)} km</span>
                </div>
                <div>
                  <span className="text-muted-foreground">vel:</span>
                  <span className="text-foreground ml-1">{satellite.position.velocity.toFixed(2)} km/s</span>
                </div>
                <div>
                  <span className="text-muted-foreground">lat:</span>
                  <span className="text-foreground ml-1">{satellite.position.latitude.toFixed(2)}°</span>
                </div>
                <div>
                  <span className="text-muted-foreground">lon:</span>
                  <span className="text-foreground ml-1">{satellite.position.longitude.toFixed(2)}°</span>
                </div>
              </div>
            </div>
          </Html>
        )}
      </group>
    </group>
  );
}

interface SceneProps {
  satellites: SatelliteData[];
  selectedSatelliteId: string | null;
  onSelectSatellite: (id: string | null) => void;
}

function Scene({ satellites, selectedSatelliteId, onSelectSatellite }: SceneProps) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 3, 5]} intensity={1} />
      <pointLight position={[-5, -3, -5]} intensity={0.5} color="#00ccff" />
      
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      <Earth />
      
      {satellites.map((sat) => (
        <RealSatellite 
          key={sat.id} 
          satellite={sat}
          isSelected={selectedSatelliteId === sat.id}
          onSelect={onSelectSatellite}
        />
      ))}
      
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        minDistance={2}
        maxDistance={15}
        autoRotate
        autoRotateSpeed={0.2}
      />
    </>
  );
}

export default function Earth3D({ satellites = [], selectedSatelliteId = null, onSelectSatellite = () => {} }: Earth3DProps) {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 2, 5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Scene 
          satellites={satellites}
          selectedSatelliteId={selectedSatelliteId}
          onSelectSatellite={onSelectSatellite}
        />
      </Canvas>
    </div>
  );
}

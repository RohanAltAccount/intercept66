import { useRef, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, Stars, Line, Html } from "@react-three/drei";
import * as THREE from "three";
import { Satellite as SatelliteData } from "@/hooks/useSatelliteData";
import { UserSatelliteWithState } from "@/hooks/useUserSatellites";
import { CollisionPrediction } from "@/lib/collision-detection";

interface Earth3DProps {
  satellites?: SatelliteData[];
  userSatellites?: UserSatelliteWithState[];
  selectedSatelliteId?: string | null;
  onSelectSatellite?: (id: string | null) => void;
  collisionPredictions?: CollisionPrediction[];
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

function eciToScenePosition(x: number, y: number, z: number): [number, number, number] {
  return [
    x * SCALE_FACTOR,
    z * SCALE_FACTOR, // swap y and z for scene coordinates
    y * SCALE_FACTOR,
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

interface UserSatelliteComponentProps {
  satellite: UserSatelliteWithState;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

function UserSatelliteComponent({ satellite, isSelected, onSelect }: UserSatelliteComponentProps) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);
  
  const position = useMemo((): [number, number, number] => {
    return eciToScenePosition(
      satellite.currentState.x,
      satellite.currentState.y,
      satellite.currentState.z
    );
  }, [satellite.currentState]);

  // generate orbital path
  const orbitPath = useMemo(() => {
    const points: [number, number, number][] = [];
    const r = Math.sqrt(satellite.x * satellite.x + satellite.y * satellite.y + satellite.z * satellite.z);
    const orbitalRadius = Math.sqrt(satellite.x * satellite.x + satellite.y * satellite.y);
    
    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * Math.PI * 2;
      const x = orbitalRadius * Math.cos(angle);
      const y = orbitalRadius * Math.sin(angle);
      const z = satellite.z;
      points.push(eciToScenePosition(x, y, z));
    }
    return points;
  }, [satellite.x, satellite.y, satellite.z]);

  // pulse animation for user satellites
  useFrame((state) => {
    if (meshRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
      meshRef.current.scale.setScalar(isSelected ? scale * 1.2 : scale);
    }
  });

  return (
    <group>
      {/* orbital path */}
      {(isSelected || hovered) && (
        <Line
          points={orbitPath}
          color={satellite.color}
          lineWidth={1}
          transparent
          opacity={0.6}
        />
      )}
      
      <group 
        position={position}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => onSelect(satellite.id)}
      >
        {/* main satellite body */}
        <mesh ref={meshRef}>
          <boxGeometry args={[0.08, 0.04, 0.04]} />
          <meshStandardMaterial color={satellite.color} emissive={satellite.color} emissiveIntensity={0.5} />
        </mesh>
        
        {/* glow sphere */}
        <Sphere args={[isSelected ? 0.15 : 0.1, 16, 16]}>
          <meshBasicMaterial
            color={satellite.color}
            transparent
            opacity={isSelected ? 0.4 : 0.2}
          />
        </Sphere>
        
        {(hovered || isSelected) && (
          <Html distanceFactor={10}>
            <div className="bg-card/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-primary/30 whitespace-nowrap min-w-[180px]">
              <p className="font-mono text-xs font-bold" style={{ color: satellite.color }}>{satellite.name}</p>
              <p className="text-[10px] text-muted-foreground mt-1">user satellite</p>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-2 text-[10px]">
                <div>
                  <span className="text-muted-foreground">alt:</span>
                  <span className="text-foreground ml-1">{satellite.currentState.altitude.toFixed(0)} km</span>
                </div>
                <div>
                  <span className="text-muted-foreground">vel:</span>
                  <span className="text-foreground ml-1">{satellite.currentState.velocity.toFixed(2)} km/s</span>
                </div>
                <div>
                  <span className="text-muted-foreground">mass:</span>
                  <span className="text-foreground ml-1">{satellite.mass} kg</span>
                </div>
                <div>
                  <span className="text-muted-foreground">pos:</span>
                  <span className="text-foreground ml-1">({satellite.currentState.x.toFixed(0)}, {satellite.currentState.y.toFixed(0)}, {satellite.currentState.z.toFixed(0)})</span>
                </div>
              </div>
            </div>
          </Html>
        )}
      </group>
    </group>
  );
}

interface CollisionLineProps {
  prediction: CollisionPrediction;
}

function CollisionLine({ prediction }: CollisionLineProps) {
  const points = useMemo((): [number, number, number][] => {
    return [
      eciToScenePosition(prediction.sat1Position.x, prediction.sat1Position.y, prediction.sat1Position.z),
      eciToScenePosition(prediction.sat2Position.x, prediction.sat2Position.y, prediction.sat2Position.z),
    ];
  }, [prediction]);

  const color = prediction.riskLevel === 'danger' ? '#ff4444' : '#ffaa00';

  return (
    <Line
      points={points}
      color={color}
      lineWidth={2}
      transparent
      opacity={0.8}
      dashed
      dashSize={0.1}
      gapSize={0.05}
    />
  );
}

interface SceneProps {
  satellites: SatelliteData[];
  userSatellites: UserSatelliteWithState[];
  selectedSatelliteId: string | null;
  onSelectSatellite: (id: string | null) => void;
  collisionPredictions: CollisionPrediction[];
}

function Scene({ satellites, userSatellites, selectedSatelliteId, onSelectSatellite, collisionPredictions }: SceneProps) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 3, 5]} intensity={1} />
      <pointLight position={[-5, -3, -5]} intensity={0.5} color="#00ccff" />
      
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      <Earth />
      
      {/* real satellites from TLE data */}
      {satellites.map((sat) => (
        <RealSatellite 
          key={sat.id} 
          satellite={sat}
          isSelected={selectedSatelliteId === sat.id}
          onSelect={onSelectSatellite}
        />
      ))}
      
      {/* user-defined satellites */}
      {userSatellites.map((sat) => (
        <UserSatelliteComponent 
          key={sat.id} 
          satellite={sat}
          isSelected={selectedSatelliteId === sat.id}
          onSelect={onSelectSatellite}
        />
      ))}
      
      {/* collision warning lines */}
      {collisionPredictions
        .filter(p => p.riskLevel !== 'safe')
        .slice(0, 5)
        .map((prediction, index) => (
          <CollisionLine key={`collision-${index}`} prediction={prediction} />
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

export default function Earth3D({ 
  satellites = [], 
  userSatellites = [],
  selectedSatelliteId = null, 
  onSelectSatellite = () => {},
  collisionPredictions = []
}: Earth3DProps) {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 2, 5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Scene 
          satellites={satellites}
          userSatellites={userSatellites}
          selectedSatelliteId={selectedSatelliteId}
          onSelectSatellite={onSelectSatellite}
          collisionPredictions={collisionPredictions}
        />
      </Canvas>
    </div>
  );
}

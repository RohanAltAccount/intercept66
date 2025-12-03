import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, Stars, Line, Html } from "@react-three/drei";
import * as THREE from "three";

interface Satellite {
  id: string;
  name: string;
  orbitRadius: number;
  orbitSpeed: number;
  orbitTilt: number;
  color: string;
  status: "safe" | "warning" | "danger";
}

interface Debris {
  id: string;
  position: [number, number, number];
  size: number;
}

const satellites: Satellite[] = [
  { id: "sat-1", name: "INTERCEPT-A1", orbitRadius: 2.2, orbitSpeed: 0.3, orbitTilt: 0.3, color: "#00ffff", status: "safe" },
  { id: "sat-2", name: "INTERCEPT-B2", orbitRadius: 2.5, orbitSpeed: 0.25, orbitTilt: -0.2, color: "#00ff88", status: "safe" },
  { id: "sat-3", name: "INTERCEPT-C3", orbitRadius: 2.8, orbitSpeed: 0.2, orbitTilt: 0.5, color: "#ffaa00", status: "warning" },
  { id: "sat-4", name: "INTERCEPT-D4", orbitRadius: 3.1, orbitSpeed: 0.15, orbitTilt: -0.4, color: "#ff4444", status: "danger" },
];

const debrisData: Debris[] = Array.from({ length: 50 }, (_, i) => ({
  id: `debris-${i}`,
  position: [
    (Math.random() - 0.5) * 6,
    (Math.random() - 0.5) * 6,
    (Math.random() - 0.5) * 6,
  ] as [number, number, number],
  size: Math.random() * 0.03 + 0.01,
}));

function Earth() {
  const earthRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group>
      {/* Earth */}
      <Sphere ref={earthRef} args={[1.5, 64, 64]}>
        <meshStandardMaterial
          color="#1a4a8a"
          roughness={0.8}
          metalness={0.2}
        />
      </Sphere>
      
      {/* Atmosphere glow */}
      <Sphere args={[1.55, 64, 64]}>
        <meshBasicMaterial
          color="#00ccff"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </Sphere>
      
      {/* Grid lines on Earth */}
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
  const adjustedRadius = Math.sqrt(radius * radius - yOffset * yOffset);
  
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

function generateOrbitPoints(radius: number, tilt: number): [number, number, number][] {
  const points: [number, number, number][] = [];
  for (let i = 0; i <= 64; i++) {
    const theta = (i / 64) * Math.PI * 2;
    points.push([
      Math.cos(theta) * radius,
      Math.sin(theta) * radius * Math.sin(tilt),
      Math.sin(theta) * radius * Math.cos(tilt),
    ]);
  }
  return points;
}

function SatelliteObject({ satellite }: { satellite: Satellite }) {
  const ref = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame(({ clock }) => {
    if (ref.current) {
      const t = clock.getElapsedTime() * satellite.orbitSpeed;
      ref.current.position.x = Math.cos(t) * satellite.orbitRadius;
      ref.current.position.y = Math.sin(t) * satellite.orbitRadius * Math.sin(satellite.orbitTilt);
      ref.current.position.z = Math.sin(t) * satellite.orbitRadius * Math.cos(satellite.orbitTilt);
    }
  });

  const orbitPoints = useMemo(() => generateOrbitPoints(satellite.orbitRadius, satellite.orbitTilt), [satellite]);

  return (
    <group>
      {/* Orbit path */}
      <Line
        points={orbitPoints}
        color={satellite.color}
        lineWidth={1}
        transparent
        opacity={0.3}
        dashed
        dashSize={0.1}
        gapSize={0.05}
      />
      
      {/* Satellite */}
      <group 
        ref={ref}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <Sphere args={[0.06, 16, 16]}>
          <meshBasicMaterial color={satellite.color} />
        </Sphere>
        
        {/* Glow effect */}
        <Sphere args={[0.1, 16, 16]}>
          <meshBasicMaterial
            color={satellite.color}
            transparent
            opacity={0.3}
          />
        </Sphere>
        
        {hovered && (
          <Html distanceFactor={10}>
            <div className="bg-card/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-primary/30 whitespace-nowrap">
              <p className="text-primary font-mono text-xs">{satellite.name}</p>
              <p className="text-muted-foreground text-[10px]">
                Status: <span className={
                  satellite.status === "safe" ? "text-success" :
                  satellite.status === "warning" ? "text-warning" : "text-danger"
                }>{satellite.status.toUpperCase()}</span>
              </p>
            </div>
          </Html>
        )}
      </group>
    </group>
  );
}

function DebrisField() {
  const ref = useRef<THREE.Group>(null);
  
  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.y += 0.0005;
      ref.current.rotation.x += 0.0002;
    }
  });

  return (
    <group ref={ref}>
      {debrisData.map((debris) => (
        <Sphere key={debris.id} args={[debris.size, 8, 8]} position={debris.position}>
          <meshBasicMaterial color="#666666" transparent opacity={0.6} />
        </Sphere>
      ))}
    </group>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 3, 5]} intensity={1} />
      <pointLight position={[-5, -3, -5]} intensity={0.5} color="#00ccff" />
      
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      <Earth />
      
      {satellites.map((sat) => (
        <SatelliteObject key={sat.id} satellite={sat} />
      ))}
      
      <DebrisField />
      
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        minDistance={3}
        maxDistance={15}
        autoRotate
        autoRotateSpeed={0.3}
      />
    </>
  );
}

import { useState } from "react";

export default function Earth3D() {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 2, 6], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}

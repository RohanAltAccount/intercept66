// collision detection and user satellite simulation
// constants
const EARTH_RADIUS_KM = 6378.137;
const MU = 398600.4418; // earth gravitational parameter km³/s²
const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

export interface UserSatellite {
  id: string;
  name: string;
  x: number; // km from earth center
  y: number; // km from earth center
  z: number; // km from earth center
  mass: number; // kg (affects orbital velocity)
  color: string;
  createdAt: Date;
}

export interface OrbitState {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  latitude: number;
  longitude: number;
  altitude: number;
  velocity: number;
}

export interface CollisionPrediction {
  sat1Id: string;
  sat1Name: string;
  sat2Id: string;
  sat2Name: string;
  minDistance: number; // km
  timeToClosestApproach: number; // seconds
  closestApproachTime: Date;
  riskLevel: 'safe' | 'proximity' | 'danger';
  sat1Position: { x: number; y: number; z: number };
  sat2Position: { x: number; y: number; z: number };
}

// calculate orbital velocity for circular orbit at given distance from earth center
// heavier satellites move slower due to momentum considerations
export function calculateCircularVelocity(distanceFromCenter: number, mass: number): number {
  const baseVelocity = Math.sqrt(MU / distanceFromCenter);
  // heavier objects have slightly reduced velocity due to inertia effects
  // this is a simplification for simulation purposes
  const massFactor = 1 / (1 + Math.log10(mass / 1000) * 0.02);
  return baseVelocity * Math.max(0.8, Math.min(1.0, massFactor));
}

// calculate orbital period for circular orbit
export function calculateOrbitalPeriod(distanceFromCenter: number): number {
  return 2 * Math.PI * Math.sqrt(Math.pow(distanceFromCenter, 3) / MU); // seconds
}

// propagate user satellite position using circular orbit
export function propagateUserSatellite(
  satellite: UserSatellite,
  elapsedSeconds: number
): OrbitState {
  const { x: x0, y: y0, z: z0, mass } = satellite;
  
  // calculate orbital radius (distance from earth center)
  const r = Math.sqrt(x0 * x0 + y0 * y0 + z0 * z0);
  
  // orbital velocity for circular orbit
  const velocity = calculateCircularVelocity(r, mass);
  
  // angular velocity (rad/s)
  const omega = velocity / r;
  
  // current angle in orbital plane (simplified - assumes orbit in xy plane initially)
  const initialAngle = Math.atan2(y0, x0);
  const inclination = Math.acos(z0 / r);
  const orbitalRadius = Math.sqrt(x0 * x0 + y0 * y0);
  
  // new angle after elapsed time
  const newAngle = initialAngle + omega * elapsedSeconds;
  
  // new position (maintaining same orbital plane)
  const x = orbitalRadius * Math.cos(newAngle);
  const y = orbitalRadius * Math.sin(newAngle);
  const z = z0; // z stays constant for circular orbit
  
  // velocity components (tangent to orbit)
  const vx = -velocity * Math.sin(newAngle);
  const vy = velocity * Math.cos(newAngle);
  const vz = 0;
  
  // convert to geodetic
  const { latitude, longitude, altitude } = eciToGeodetic(x, y, z, new Date());
  
  return {
    x, y, z,
    vx, vy, vz,
    latitude,
    longitude,
    altitude,
    velocity
  };
}

// convert eci to geodetic
function eciToGeodetic(x: number, y: number, z: number, date: Date): { latitude: number; longitude: number; altitude: number } {
  const jd = getJulianDate(date);
  const T = (jd - 2451545.0) / 36525;
  let gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) +
             0.000387933 * T * T - T * T * T / 38710000;
  gmst = ((gmst % 360) + 360) % 360;
  
  let longitude = Math.atan2(y, x) * RAD_TO_DEG - gmst;
  longitude = ((longitude % 360) + 540) % 360 - 180;
  
  const r = Math.sqrt(x * x + y * y);
  let latitude = Math.atan2(z, r);
  const e2 = 0.00669437999014;
  
  for (let i = 0; i < 5; i++) {
    const sinLat = Math.sin(latitude);
    const N = EARTH_RADIUS_KM / Math.sqrt(1 - e2 * sinLat * sinLat);
    latitude = Math.atan2(z + e2 * N * sinLat, r);
  }
  
  const sinLat = Math.sin(latitude);
  const N = EARTH_RADIUS_KM / Math.sqrt(1 - e2 * sinLat * sinLat);
  const altitude = r / Math.cos(latitude) - N;
  
  return {
    latitude: latitude * RAD_TO_DEG,
    longitude,
    altitude: Math.sqrt(x * x + y * y + z * z) - EARTH_RADIUS_KM,
  };
}

function getJulianDate(date: Date): number {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate() + 
    (date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600) / 24;
  
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  
  return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + 
         Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
}

// calculate distance between two positions
export function calculateDistance(
  pos1: { x: number; y: number; z: number },
  pos2: { x: number; y: number; z: number }
): number {
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  const dz = pos1.z - pos2.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

// predict collision between two satellites over a time period
export function predictCollision(
  sat1: { id: string; name: string; position: { x: number; y: number; z: number; vx: number; vy: number; vz: number } },
  sat2: { id: string; name: string; position: { x: number; y: number; z: number; vx: number; vy: number; vz: number } },
  predictionSeconds: number = 3600 // 1 hour default
): CollisionPrediction {
  const stepSeconds = 10; // check every 10 seconds
  const steps = Math.floor(predictionSeconds / stepSeconds);
  
  let minDistance = Infinity;
  let minDistanceTime = 0;
  let closestPos1 = { x: sat1.position.x, y: sat1.position.y, z: sat1.position.z };
  let closestPos2 = { x: sat2.position.x, y: sat2.position.y, z: sat2.position.z };
  
  for (let i = 0; i <= steps; i++) {
    const t = i * stepSeconds;
    
    // simple linear propagation with velocity
    const pos1 = {
      x: sat1.position.x + sat1.position.vx * t,
      y: sat1.position.y + sat1.position.vy * t,
      z: sat1.position.z + sat1.position.vz * t,
    };
    
    const pos2 = {
      x: sat2.position.x + sat2.position.vx * t,
      y: sat2.position.y + sat2.position.vy * t,
      z: sat2.position.z + sat2.position.vz * t,
    };
    
    const distance = calculateDistance(pos1, pos2);
    
    if (distance < minDistance) {
      minDistance = distance;
      minDistanceTime = t;
      closestPos1 = pos1;
      closestPos2 = pos2;
    }
  }
  
  // determine risk level based on minimum distance
  let riskLevel: 'safe' | 'proximity' | 'danger' = 'safe';
  if (minDistance < 1) {
    riskLevel = 'danger';
  } else if (minDistance < 10) {
    riskLevel = 'proximity';
  }
  
  return {
    sat1Id: sat1.id,
    sat1Name: sat1.name,
    sat2Id: sat2.id,
    sat2Name: sat2.name,
    minDistance,
    timeToClosestApproach: minDistanceTime,
    closestApproachTime: new Date(Date.now() + minDistanceTime * 1000),
    riskLevel,
    sat1Position: closestPos1,
    sat2Position: closestPos2,
  };
}

// check all satellite pairs for collision predictions
export function checkAllCollisions(
  satellites: Array<{ id: string; name: string; position: { x: number; y: number; z: number; vx: number; vy: number; vz: number } }>,
  predictionSeconds: number = 3600
): CollisionPrediction[] {
  const predictions: CollisionPrediction[] = [];
  
  for (let i = 0; i < satellites.length; i++) {
    for (let j = i + 1; j < satellites.length; j++) {
      const prediction = predictCollision(satellites[i], satellites[j], predictionSeconds);
      predictions.push(prediction);
    }
  }
  
  // sort by risk level and distance
  return predictions.sort((a, b) => {
    const riskOrder = { danger: 0, proximity: 1, safe: 2 };
    if (riskOrder[a.riskLevel] !== riskOrder[b.riskLevel]) {
      return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
    }
    return a.minDistance - b.minDistance;
  });
}

// validate user satellite position (must be above earth surface)
export function validateSatellitePosition(x: number, y: number, z: number): { valid: boolean; error?: string } {
  const distance = Math.sqrt(x * x + y * y + z * z);
  const altitude = distance - EARTH_RADIUS_KM;
  
  if (altitude < 160) {
    return { 
      valid: false, 
      error: `altitude too low (${altitude.toFixed(0)} km). minimum orbital altitude is 160 km.` 
    };
  }
  
  if (altitude > 50000) {
    return { 
      valid: false, 
      error: `altitude too high (${altitude.toFixed(0)} km). maximum is 50,000 km.` 
    };
  }
  
  return { valid: true };
}

// generate random color for satellite
export function generateSatelliteColor(): string {
  const colors = [
    '#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#9d4edd', 
    '#ff9f43', '#00d2d3', '#ff6b81', '#7bed9f', '#70a1ff'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

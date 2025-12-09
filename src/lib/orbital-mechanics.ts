// orbital mechanics calculations using sgp4 simplified model
// constants
const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;
const EARTH_RADIUS_KM = 6378.137;
const MU = 398600.4418; // earth gravitational parameter km³/s²
const J2 = 0.00108263; // earth oblateness coefficient
const MINUTES_PER_DAY = 1440;
const TWO_PI = 2 * Math.PI;

export interface TLEData {
  name: string;
  line1: string;
  line2: string;
  noradId: string;
}

export interface OrbitalElements {
  epoch: Date;
  meanMotion: number; // revolutions per day
  eccentricity: number;
  inclination: number; // degrees
  raan: number; // right ascension of ascending node (degrees)
  argPerigee: number; // argument of perigee (degrees)
  meanAnomaly: number; // degrees
  bstar: number; // drag term
  semiMajorAxis: number; // km
  period: number; // minutes
  apogee: number; // km altitude
  perigee: number; // km altitude
}

export interface SatellitePosition {
  latitude: number;
  longitude: number;
  altitude: number; // km
  velocity: number; // km/s
  x: number; // eci x km
  y: number; // eci y km
  z: number; // eci z km
  vx: number; // velocity x km/s
  vy: number; // velocity y km/s
  vz: number; // velocity z km/s
}

// parse tle data to extract orbital elements
export function parseTLE(tle: TLEData): OrbitalElements {
  const line1 = tle.line1;
  const line2 = tle.line2;

  // parse epoch from line 1
  const epochYear = parseInt(line1.substring(18, 20));
  const epochDay = parseFloat(line1.substring(20, 32));
  const fullYear = epochYear < 57 ? 2000 + epochYear : 1900 + epochYear;
  
  const epoch = new Date(Date.UTC(fullYear, 0, 1));
  epoch.setTime(epoch.getTime() + (epochDay - 1) * 86400000);

  // parse bstar drag term
  const bstarMantissa = parseFloat(line1.substring(53, 59)) / 100000;
  const bstarExponent = parseInt(line1.substring(59, 61));
  const bstar = bstarMantissa * Math.pow(10, bstarExponent);

  // parse line 2 elements
  const inclination = parseFloat(line2.substring(8, 16));
  const raan = parseFloat(line2.substring(17, 25));
  const eccentricity = parseFloat('0.' + line2.substring(26, 33));
  const argPerigee = parseFloat(line2.substring(34, 42));
  const meanAnomaly = parseFloat(line2.substring(43, 51));
  const meanMotion = parseFloat(line2.substring(52, 63));

  // calculate derived elements
  const period = MINUTES_PER_DAY / meanMotion;
  const semiMajorAxis = Math.pow(MU / Math.pow(meanMotion * TWO_PI / 86400, 2), 1/3);
  const apogee = semiMajorAxis * (1 + eccentricity) - EARTH_RADIUS_KM;
  const perigee = semiMajorAxis * (1 - eccentricity) - EARTH_RADIUS_KM;

  return {
    epoch,
    meanMotion,
    eccentricity,
    inclination,
    raan,
    argPerigee,
    meanAnomaly,
    bstar,
    semiMajorAxis,
    period,
    apogee,
    perigee,
  };
}

// solve kepler's equation using newton-raphson iteration
function solveKepler(meanAnomaly: number, eccentricity: number): number {
  let E = meanAnomaly;
  const maxIterations = 10;
  const tolerance = 1e-10;

  for (let i = 0; i < maxIterations; i++) {
    const dE = (E - eccentricity * Math.sin(E) - meanAnomaly) / (1 - eccentricity * Math.cos(E));
    E -= dE;
    if (Math.abs(dE) < tolerance) break;
  }

  return E;
}

// calculate satellite position at given time using simplified sgp4
export function propagate(elements: OrbitalElements, date: Date): SatellitePosition {
  const timeSinceEpoch = (date.getTime() - elements.epoch.getTime()) / 60000; // minutes
  
  // mean motion in radians per minute
  const n0 = elements.meanMotion * TWO_PI / MINUTES_PER_DAY;
  
  // semi-major axis
  const a = elements.semiMajorAxis;
  const e = elements.eccentricity;
  const i = elements.inclination * DEG_TO_RAD;
  
  // secular perturbations due to j2
  const p = a * (1 - e * e);
  const n0dot = 1.5 * J2 * Math.pow(EARTH_RADIUS_KM / p, 2) * n0 * 
    (1 - 1.5 * Math.sin(i) * Math.sin(i));
  
  // precession rates
  const raanDot = -1.5 * J2 * Math.pow(EARTH_RADIUS_KM / p, 2) * n0 * Math.cos(i);
  const argPerigeeDot = 0.75 * J2 * Math.pow(EARTH_RADIUS_KM / p, 2) * n0 * 
    (5 * Math.cos(i) * Math.cos(i) - 1);
  
  // update orbital elements
  const M = (elements.meanAnomaly * DEG_TO_RAD + (n0 + n0dot) * timeSinceEpoch) % TWO_PI;
  const omega = (elements.argPerigee * DEG_TO_RAD + argPerigeeDot * timeSinceEpoch) % TWO_PI;
  const Omega = (elements.raan * DEG_TO_RAD + raanDot * timeSinceEpoch) % TWO_PI;
  
  // solve kepler's equation
  const E = solveKepler(M, e);
  
  // true anomaly
  const sinNu = Math.sqrt(1 - e * e) * Math.sin(E) / (1 - e * Math.cos(E));
  const cosNu = (Math.cos(E) - e) / (1 - e * Math.cos(E));
  const nu = Math.atan2(sinNu, cosNu);
  
  // distance from earth center
  const r = a * (1 - e * Math.cos(E));
  
  // position in orbital plane
  const xOrbit = r * Math.cos(nu);
  const yOrbit = r * Math.sin(nu);
  
  // rotation matrices to eci frame
  const cosOmega = Math.cos(Omega);
  const sinOmega = Math.sin(Omega);
  const cosI = Math.cos(i);
  const sinI = Math.sin(i);
  const cosArgPeri = Math.cos(omega);
  const sinArgPeri = Math.sin(omega);
  
  // position in eci frame
  const x = (cosOmega * cosArgPeri - sinOmega * sinArgPeri * cosI) * xOrbit +
            (-cosOmega * sinArgPeri - sinOmega * cosArgPeri * cosI) * yOrbit;
  const y = (sinOmega * cosArgPeri + cosOmega * sinArgPeri * cosI) * xOrbit +
            (-sinOmega * sinArgPeri + cosOmega * cosArgPeri * cosI) * yOrbit;
  const z = (sinArgPeri * sinI) * xOrbit + (cosArgPeri * sinI) * yOrbit;
  
  // velocity calculation
  const h = Math.sqrt(MU * p); // specific angular momentum
  const vOrbitR = (MU / h) * e * Math.sin(nu);
  const vOrbitT = (MU / h) * (1 + e * Math.cos(nu));
  
  const vxOrbit = vOrbitR * Math.cos(nu) - vOrbitT * Math.sin(nu);
  const vyOrbit = vOrbitR * Math.sin(nu) + vOrbitT * Math.cos(nu);
  
  const vx = (cosOmega * cosArgPeri - sinOmega * sinArgPeri * cosI) * vxOrbit +
             (-cosOmega * sinArgPeri - sinOmega * cosArgPeri * cosI) * vyOrbit;
  const vy = (sinOmega * cosArgPeri + cosOmega * sinArgPeri * cosI) * vxOrbit +
             (-sinOmega * sinArgPeri + cosOmega * cosArgPeri * cosI) * vyOrbit;
  const vz = (sinArgPeri * sinI) * vxOrbit + (cosArgPeri * sinI) * vyOrbit;
  
  const velocity = Math.sqrt(vx * vx + vy * vy + vz * vz);
  
  // convert eci to geodetic coordinates
  const { latitude, longitude, altitude } = eciToGeodetic(x, y, z, date);
  
  return {
    latitude,
    longitude,
    altitude,
    velocity,
    x, y, z,
    vx, vy, vz,
  };
}

// convert eci coordinates to geodetic (lat/lon/alt)
function eciToGeodetic(x: number, y: number, z: number, date: Date): { latitude: number; longitude: number; altitude: number } {
  // greenwich mean sidereal time
  const jd = getJulianDate(date);
  const T = (jd - 2451545.0) / 36525;
  let gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) +
             0.000387933 * T * T - T * T * T / 38710000;
  gmst = ((gmst % 360) + 360) % 360;
  
  // longitude
  let longitude = Math.atan2(y, x) * RAD_TO_DEG - gmst;
  longitude = ((longitude % 360) + 540) % 360 - 180;
  
  // latitude using iterative approach
  const r = Math.sqrt(x * x + y * y);
  let latitude = Math.atan2(z, r);
  const e2 = 0.00669437999014; // earth eccentricity squared
  
  for (let i = 0; i < 5; i++) {
    const sinLat = Math.sin(latitude);
    const N = EARTH_RADIUS_KM / Math.sqrt(1 - e2 * sinLat * sinLat);
    latitude = Math.atan2(z + e2 * N * sinLat, r);
  }
  
  // altitude
  const sinLat = Math.sin(latitude);
  const N = EARTH_RADIUS_KM / Math.sqrt(1 - e2 * sinLat * sinLat);
  const altitude = r / Math.cos(latitude) - N;
  
  return {
    latitude: latitude * RAD_TO_DEG,
    longitude,
    altitude,
  };
}

// julian date calculation
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

// calculate ground track (future positions)
export function calculateGroundTrack(elements: OrbitalElements, startDate: Date, durationMinutes: number, stepMinutes: number = 1): SatellitePosition[] {
  const positions: SatellitePosition[] = [];
  const steps = Math.floor(durationMinutes / stepMinutes);
  
  for (let i = 0; i <= steps; i++) {
    const time = new Date(startDate.getTime() + i * stepMinutes * 60000);
    positions.push(propagate(elements, time));
  }
  
  return positions;
}

// calculate orbital velocity at given altitude
export function calculateOrbitalVelocity(altitude: number): number {
  const r = EARTH_RADIUS_KM + altitude;
  return Math.sqrt(MU / r);
}

// calculate orbital period
export function calculateOrbitalPeriod(semiMajorAxis: number): number {
  return 2 * Math.PI * Math.sqrt(Math.pow(semiMajorAxis, 3) / MU) / 60; // minutes
}
